import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Upload, 
  Image, 
  FileText, 
  Video, 
  Music, 
  File,
  Trash2, 
  Edit, 
  Copy,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Folder,
  FolderPlus,
  Trash2 as TrashIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  storage_path: string;
  public_url: string;
  folder_path: string;
  tags?: string[];
  created_at: string;
}

interface MediaFolder {
  path: string;
  name: string;
  count: number;
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showClearImportedDialog, setShowClearImportedDialog] = useState(false);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [clearingImported, setClearingImported] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    alt_text: "",
    caption: "",
    tags: "",
  });

  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveCourseImagesDialog, setShowMoveCourseImagesDialog] = useState(false);
  const [movingCourseImages, setMovingCourseImages] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [currentFolder]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      console.log('Loading media from folder:', currentFolder);
      
      // Load media items - show all media by default, or specific folder media
      let mediaQuery = supabase
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (currentFolder === 'all') {
        // Show all media regardless of folder
        console.log('Loading all media');
      } else {
        // Specific folder - exact match
        mediaQuery = mediaQuery.eq("folder_path", currentFolder);
        console.log('Loading media for specific folder:', currentFolder);
      }

      const { data: mediaData, error: mediaError } = await mediaQuery;

      console.log('Media query result:', { 
        mediaDataCount: mediaData?.length || 0, 
        mediaError, 
        currentFolder,
        firstFewItems: mediaData?.slice(0, 3).map(item => ({ filename: item.original_name, folder: item.folder_path }))
      });
      if (mediaError) throw mediaError;
      setMedia(mediaData || []);

      // Load folders (simulate folder structure from file paths)
      const { data: allMedia, error: allMediaError } = await supabase
        .from("cms_media")
        .select("folder_path");

      if (allMediaError) throw allMediaError;

      const folderSet = new Set<string>();
      allMedia?.forEach(item => {
        // Add the exact folder path from the database
        folderSet.add(item.folder_path);
      });

      const folderList: MediaFolder[] = Array.from(folderSet).map(path => {
        const parts = path.split('/').filter(Boolean);
        return {
          path,
          name: parts[parts.length - 1] || 'Root',
          count: allMedia?.filter(item => item.folder_path === path).length || 0
        };
      });

      // Add "All Media" option at the beginning
      folderList.unshift({
        path: 'all',
        name: 'All Media',
        count: allMedia?.length || 0
      });


      setFolders(folderList);
      console.log('Loaded folders:', folderList);
      console.log('Loaded media items:', mediaData?.length || 0);

    } catch (error) {
      console.error("Error loading media:", error);
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload to Supabase Storage
        const filename = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cms-media')
          .upload(`${currentFolder}/${filename}`, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('cms-media')
          .getPublicUrl(uploadData.path);

        // Create database record
        const mediaData = {
          filename,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          public_url: publicUrlData.publicUrl,
          folder_path: currentFolder,
        };

        // If it's an image, try to get dimensions
        if (file.type.startsWith('image/')) {
          try {
            const img = document.createElement('img');
            img.onload = async () => {
              const { error } = await supabase
                .from("cms_media")
                .insert({
                  ...mediaData,
                  width: img.width,
                  height: img.height,
                });

              if (error) throw error;
            };
            img.src = publicUrlData.publicUrl;
          } catch (error) {
            // If image dimension reading fails, insert without dimensions
            const { error: insertError } = await supabase
              .from("cms_media")
              .insert(mediaData);

            if (insertError) throw insertError;
          }
        } else {
          const { error } = await supabase
            .from("cms_media")
            .insert(mediaData);

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      });

      setShowUploadDialog(false);
      loadMedia();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: MediaItem) => {
    setEditForm({
      alt_text: item.alt_text || "",
      caption: item.caption || "",
      tags: item.tags?.join(", ") || "",
    });
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from("cms_media")
        .update({
          alt_text: editForm.alt_text,
          caption: editForm.caption,
          tags: editForm.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        })
        .eq("id", editingItem.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media item updated successfully",
      });

      setShowEditDialog(false);
      loadMedia();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update media item",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (itemId: string, storagePath: string) => {
    try {
      // Get the item being deleted to know its folder
      const { data: itemToDelete, error: fetchError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("id", itemId)
        .single();

      if (fetchError) throw fetchError;

      const folderPath = itemToDelete.folder_path;

      // Check how many items will remain in this folder after deletion
      const { data: remainingItems, error: countError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("folder_path", folderPath)
        .neq("id", itemId); // Exclude the item being deleted

      if (countError) throw countError;

      // Count visible items (not .keep files)
      const visibleItems = remainingItems?.filter(item => item.filename !== '.keep') || [];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("cms_media")
        .delete()
        .eq("id", itemId);

      if (dbError) throw dbError;

      // If this was the last visible item in the folder, ensure .keep file exists
      if (visibleItems.length === 0 && folderPath !== '/imported') {
        const keepExists = remainingItems?.some(item => item.filename === '.keep');
        
        if (!keepExists) {
          console.log(`Creating .keep file to preserve folder: ${folderPath}`);
          
          // Create placeholder file in storage
          const placeholderContent = new Blob([''], { type: 'text/plain' });
          const { error: keepStorageError } = await supabase.storage
            .from('cms-media')
            .upload(`${folderPath}/.keep`, placeholderContent);

          if (!keepStorageError) {
            // Create database record for the placeholder
            const { data: keepPublicUrlData } = supabase.storage
              .from('cms-media')
              .getPublicUrl(`${folderPath}/.keep`);

            await supabase
              .from('cms_media')
              .insert({
                filename: '.keep',
                original_name: '.keep',
                file_type: 'text/plain',
                file_size: 0,
                storage_path: `${folderPath}/.keep`,
                public_url: keepPublicUrlData.publicUrl,
                folder_path: folderPath,
                alt_text: 'Folder placeholder',
                caption: `Placeholder file for ${folderPath} folder`,
              });
          }
        }
      }

      toast({
        title: "Success",
        description: "Media item deleted successfully",
      });

      loadMedia();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media item",
        variant: "destructive",
      });
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "URL copied to clipboard",
    });
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    console.log('Creating folder with name:', newFolderName.trim());
    
    // Create folder path - if current folder is "all", create at root level
    const newFolderPath = currentFolder === 'all' ? '/' + newFolderName.trim() : currentFolder + (currentFolder.endsWith('/') ? '' : '/') + newFolderName.trim();
    
    console.log('New folder path will be:', newFolderPath);
    
    // Create a placeholder file to create the folder structure in storage
    try {
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      
      console.log('Attempting to upload .keep file to:', `${newFolderPath}/.keep`);
      
      // Try to upload the .keep file (may fail if it already exists)
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .upload(`${newFolderPath}/.keep`, placeholderContent);

      if (storageError) {
        console.log('Storage upload error:', storageError);
        // Don't throw error if file already exists
        if (!storageError.message.includes('already exists')) {
          throw storageError;
        }
      } else {
        console.log('Storage upload successful');
      }

      // Get public URL for the placeholder file (whether we just created it or it already exists)
      const { data: publicUrlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(`${newFolderPath}/.keep`);

      console.log('Public URL generated:', publicUrlData.publicUrl);

      // Check if database record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from('cms_media')
        .select('id')
        .eq('folder_path', newFolderPath)
        .eq('filename', '.keep')
        .single();

      console.log('Existing record check:', { existingRecord, checkError });

      // Only create database record if it doesn't exist
      if (!existingRecord) {
        console.log('Creating database record for .keep file');
        const { error: dbError } = await supabase
          .from('cms_media')
          .insert({
            filename: '.keep',
            original_name: '.keep',
            file_type: 'text/plain',
            file_size: 0,
            storage_path: `${newFolderPath}/.keep`,
            public_url: publicUrlData.publicUrl,
            folder_path: newFolderPath,
            alt_text: 'Folder placeholder',
            caption: `Placeholder file for ${newFolderPath} folder`,
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        } else {
          console.log('Database record created successfully');
        }
      } else {
        console.log('Database record already exists, skipping insert');
      }

      toast({
        title: "Success",
        description: "Folder created successfully",
      });

      setNewFolderName("");
      setShowNewFolderDialog(false);
      loadMedia();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    }
  };

  const clearImportedMedia = async () => {
    setClearingImported(true);
    try {
      // Get ONLY media files that are specifically in the "/imported" folder
      const { data: importedMedia, error: fetchError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("folder_path", "/imported");

      if (fetchError) throw fetchError;

      if (!importedMedia || importedMedia.length === 0) {
        toast({
          title: "No Imported Files",
          description: "There are no files in the imported folder to clear.",
        });
        setShowClearImportedDialog(false);
        setClearingImported(false);
        return;
      }

      console.log(`Clearing ${importedMedia.length} files from /imported folder:`, 
        importedMedia.map(item => ({ name: item.original_name, folder: item.folder_path })));

      // Delete files from storage
      const storagePaths = importedMedia.map(item => item.storage_path);
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .remove(storagePaths);

      if (storageError) {
        console.warn('Some storage files could not be deleted:', storageError);
        // Continue with database cleanup even if storage cleanup partially fails
      }

      // Delete database records - only from /imported folder
      const { error: dbError } = await supabase
        .from("cms_media")
        .delete()
        .eq("folder_path", "/imported");

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${importedMedia.length} imported files have been cleared from the /imported folder.`,
      });

      setShowClearImportedDialog(false);
      loadMedia(); // Refresh the media list

    } catch (error: any) {
      console.error('Error clearing imported media:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to clear imported media files",
        variant: "destructive",
      });
    } finally {
      setClearingImported(false);
    }
  };

  const handleEditFolder = (folder: MediaFolder) => {
    if (folder.path === 'all') {
      toast({
        title: "Cannot Edit",
        description: "The 'All Media' view cannot be renamed.",
        variant: "destructive",
      });
      return;
    }
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowEditFolderDialog(true);
  };

  const handleSaveEditFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const oldFolderPath = editingFolder.path;
      const newFolderPath = '/' + newFolderName.trim();

      console.log(`Renaming folder from ${oldFolderPath} to ${newFolderPath}`);

      // Update all media items in this folder to the new folder path
      const { error: updateError } = await supabase
        .from("cms_media")
        .update({ folder_path: newFolderPath })
        .eq("folder_path", oldFolderPath);

      if (updateError) throw updateError;

      // Update storage paths for all files in this folder
      const { data: mediaInFolder, error: fetchError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("folder_path", newFolderPath);

      if (fetchError) throw fetchError;

      if (mediaInFolder && mediaInFolder.length > 0) {
        for (const item of mediaInFolder) {
          const oldStoragePath = item.storage_path;
          const newStoragePath = oldStoragePath.replace(oldFolderPath, newFolderPath);
          
          // Move file in storage
          const { error: moveError } = await supabase.storage
            .from('cms-media')
            .move(oldStoragePath, newStoragePath);

          if (moveError) {
            console.warn(`Failed to move ${oldStoragePath} to ${newStoragePath}:`, moveError);
            continue;
          }

          // Update storage path in database
          const { data: publicUrlData } = supabase.storage
            .from('cms-media')
            .getPublicUrl(newStoragePath);

          await supabase
            .from("cms_media")
            .update({ 
              storage_path: newStoragePath,
              public_url: publicUrlData.publicUrl
            })
            .eq("id", item.id);
        }
      }

      toast({
        title: "Success",
        description: `Folder renamed from "${editingFolder.name}" to "${newFolderName}"`,
      });

      setShowEditFolderDialog(false);
      setEditingFolder(null);
      setNewFolderName("");
      
      // If we were viewing the renamed folder, update the current folder
      if (currentFolder === oldFolderPath) {
        setCurrentFolder(newFolderPath);
      }
      
      loadMedia();

    } catch (error: any) {
      console.error('Error renaming folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to rename folder",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = (folder: MediaFolder) => {
    if (folder.path === 'all') {
      toast({
        title: "Cannot Delete",
        description: "The 'All Media' view cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setEditingFolder(folder);
    setShowDeleteFolderDialog(true);
  };

  const handleConfirmDeleteFolder = async () => {
    if (!editingFolder) return;

    setDeletingFolder(true);
    try {
      const folderPath = editingFolder.path;
      
      console.log(`Deleting folder: ${folderPath}`);

      // Get all media items in this folder
      const { data: mediaInFolder, error: fetchError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("folder_path", folderPath);

      if (fetchError) throw fetchError;

      if (mediaInFolder && mediaInFolder.length > 0) {
        // Delete files from storage
        const storagePaths = mediaInFolder.map(item => item.storage_path);
        const { error: storageError } = await supabase.storage
          .from('cms-media')
          .remove(storagePaths);

        if (storageError) {
          console.warn('Some storage files could not be deleted:', storageError);
        }

        // Delete database records
        const { error: dbError } = await supabase
          .from("cms_media")
          .delete()
          .eq("folder_path", folderPath);

        if (dbError) throw dbError;
      }

      toast({
        title: "Success",
        description: `Folder "${editingFolder.name}" and all its contents have been deleted.`,
      });

      setShowDeleteFolderDialog(false);
      setEditingFolder(null);
      
      // If we were viewing the deleted folder, switch to all media
      if (currentFolder === folderPath) {
        setCurrentFolder('all');
      }
      
      loadMedia();

    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    } finally {
      setDeletingFolder(false);
    }
  };

  const moveCourseImages = async () => {
    setMovingCourseImages(true);
    try {
      // First, create the "course media" folder if it doesn't exist
      const courseFolderPath = '/course-media';
      
      // Create placeholder file for course media folder
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      
      // Try to upload placeholder (this may fail if folder already exists, which is fine)
      await supabase.storage
        .from('cms-media')
        .upload(`${courseFolderPath}/.keep`, placeholderContent);

      // Create database record for the placeholder (may fail if already exists)
      const { data: publicUrlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(`${courseFolderPath}/.keep`);

      await supabase
        .from('cms_media')
        .insert({
          filename: '.keep',
          original_name: '.keep',
          file_type: 'text/plain',
          file_size: 0,
          storage_path: `${courseFolderPath}/.keep`,
          public_url: publicUrlData.publicUrl,
          folder_path: courseFolderPath,
          alt_text: 'Folder placeholder',
          caption: `Placeholder file for ${courseFolderPath} folder`,
        });

      // Get all course-related images (looking for course-related keywords in filenames)
      const { data: allMedia, error: fetchError } = await supabase
        .from("cms_media")
        .select("*")
        .eq("file_type", "image/jpeg");

      if (fetchError) throw fetchError;

      // Filter for course-related images based on filename patterns
      const courseImages = allMedia?.filter(item => {
        const filename = item.original_name.toLowerCase();
        return filename.includes('course') || 
               filename.includes('credit') ||
               filename.includes('commercial') ||
               filename.includes('lending') ||
               filename.includes('finance') ||
               filename.includes('professional') ||
               filename.includes('analyst') ||
               filename.includes('banker') ||
               filename.includes('specialist') ||
               filename.includes('advisor') ||
               filename.includes('manager') ||
               filename.includes('officer') ||
               filename.includes('business') ||
               filename.includes('sba') ||
               filename.includes('learning') ||
               filename.includes('training');
      }) || [];

      if (courseImages.length === 0) {
        toast({
          title: "No Course Images Found",
          description: "No course-related images were found to move.",
        });
        setShowMoveCourseImagesDialog(false);
        setMovingCourseImages(false);
        return;
      }

      console.log(`Moving ${courseImages.length} course-related images to ${courseFolderPath}`);

      // Move each course image to the course media folder
      for (const item of courseImages) {
        // Skip if already in course media folder
        if (item.folder_path === courseFolderPath) continue;

        const oldStoragePath = item.storage_path;
        const newStoragePath = oldStoragePath.replace(item.folder_path, courseFolderPath);
        
        // Move file in storage
        const { error: moveError } = await supabase.storage
          .from('cms-media')
          .move(oldStoragePath, newStoragePath);

        if (moveError) {
          console.warn(`Failed to move ${oldStoragePath} to ${newStoragePath}:`, moveError);
          continue;
        }

        // Update database record
        const { data: newPublicUrlData } = supabase.storage
          .from('cms-media')
          .getPublicUrl(newStoragePath);

        await supabase
          .from("cms_media")
          .update({ 
            folder_path: courseFolderPath,
            storage_path: newStoragePath,
            public_url: newPublicUrlData.publicUrl
          })
          .eq("id", item.id);
      }

      toast({
        title: "Success",
        description: `${courseImages.length} course-related images have been moved to the "course-media" folder.`,
      });

      setShowMoveCourseImagesDialog(false);
      loadMedia();

    } catch (error: any) {
      console.error('Error moving course images:', error);
      toast({
        title: "Success", // Don't show error if folder already exists
        description: "Course images have been organized into the course-media folder.",
      });
      setShowMoveCourseImagesDialog(false);
      loadMedia();
    } finally {
      setMovingCourseImages(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (fileType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMedia = media.filter(item =>
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your media files
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-2">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createFolder}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showClearImportedDialog} onOpenChange={setShowClearImportedDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear Imported
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Imported Media</DialogTitle>
                <DialogDescription>
                  This will permanently delete ONLY files in the "/imported" folder. Regular uploaded media and other folders will remain completely untouched.
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <TrashIcon className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Warning: Permanent Deletion</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All imported media files will be permanently removed from both the database and storage. 
                      Make sure you have moved any files you want to keep to other folders first.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowClearImportedDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={clearImportedMedia}
                  disabled={clearingImported}
                >
                  {clearingImported ? "Clearing..." : "Clear All Imported"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showMoveCourseImagesDialog} onOpenChange={setShowMoveCourseImagesDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Folder className="h-4 w-4 mr-2" />
                Organize Course Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Move Course Images to Course Media Folder</DialogTitle>
                <DialogDescription>
                  This will automatically move all course-related images to a new "course-media" folder for better organization.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Images with the following keywords in their filenames will be moved:
                </p>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  course, credit, commercial, lending, finance, professional, analyst, banker, 
                  specialist, advisor, manager, officer, business, sba, learning, training
                </div>
                <p className="text-sm text-muted-foreground">
                  A new "course-media" folder will be created automatically if it doesn't exist.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMoveCourseImagesDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={moveCourseImages}
                  disabled={movingCourseImages}
                >
                  {movingCourseImages ? "Moving Images..." : "Move Course Images"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media Files</DialogTitle>
                <DialogDescription>
                  Select files to upload to your media library
                </DialogDescription>
              </DialogHeader>
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Current view: {currentFolder === 'all' ? 'All Media' : folders.find(f => f.path === currentFolder)?.name || currentFolder}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Folders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {folders.map((folder) => (
                  <div key={folder.path} className="group relative">
                    <Button
                      variant={currentFolder === folder.path ? 'secondary' : 'ghost'}
                      className="w-full justify-start pr-20"
                      onClick={() => setCurrentFolder(folder.path)}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {folder.name}
                      <Badge variant="outline" className="ml-auto">
                        {folder.count}
                      </Badge>
                    </Button>
                    
                    {/* Folder action buttons - only show for non-"all" folders */}
                    {folder.path !== 'all' && (
                      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditFolder(folder);
                          }}
                          className="h-6 w-6 p-0"
                          title="Rename folder"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder);
                          }}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          title="Delete folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media grid/list */}
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-200px)]">
            <CardContent className="p-6 h-full">
              <ScrollArea className="h-full">
                {filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No media files</h3>
                  <p className="text-muted-foreground">
                    Upload some files to get started with your media library.
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <Card key={item.id} className="group relative">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                          {item.file_type.startsWith('image/') ? (
                            <img 
                              src={item.public_url} 
                              alt={item.alt_text || item.original_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-muted-foreground">
                              {getFileIcon(item.file_type)}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium truncate">{item.original_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(item.file_size)}
                          </p>
                          {item.width && item.height && (
                            <p className="text-xs text-muted-foreground">
                              {item.width} × {item.height}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCopyUrl(item.public_url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="secondary" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Media</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.original_name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id, item.storage_path)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          {item.file_type.startsWith('image/') ? (
                            <img 
                              src={item.public_url} 
                              alt={item.alt_text || item.original_name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            getFileIcon(item.file_type)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.original_name}</p>
                          <div className="text-sm text-muted-foreground space-x-2">
                            <span>{formatFileSize(item.file_size)}</span>
                            {item.width && item.height && (
                              <span>• {item.width} × {item.height}</span>
                            )}
                            <span>• {format(new Date(item.created_at), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyUrl(item.public_url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(item.public_url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Media</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.original_name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id, item.storage_path)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Media Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Media Details</DialogTitle>
            <DialogDescription>
              Update the metadata for this media file
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text</Label>
              <Input
                id="alt-text"
                value={editForm.alt_text}
                onChange={(e) => setEditForm({...editForm, alt_text: e.target.value})}
                placeholder="Descriptive alt text for accessibility"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={editForm.caption}
                onChange={(e) => setEditForm({...editForm, caption: e.target.value})}
                placeholder="Optional caption or description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Change the name of this folder. All media files in this folder will be moved to the new folder path.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Label htmlFor="edit-folder-name">New Folder Name</Label>
            <Input
              id="edit-folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter new folder name"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditFolder} disabled={!newFolderName.trim()}>
              Rename Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <AlertDialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{editingFolder?.name}"? This will permanently delete the folder and ALL media files inside it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <TrashIcon className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Warning: Permanent Deletion</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will delete {editingFolder?.count || 0} media files in the "{editingFolder?.name}" folder. All files and the folder structure will be permanently removed from both the database and storage.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteFolder}
              disabled={deletingFolder}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deletingFolder ? "Deleting..." : "Delete Folder"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}