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
  Image as ImageIcon, 
  FileText, 
  Video, 
  Music, 
  File,
  Trash2, 
  Edit, 
  Copy,
  Download,
  Search,
  Grid,
  List,
  Folder,
  FolderPlus
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
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
  storage_path: string;
  public_url: string;
  folder_path: string;
  tags?: string[] | null;
  created_at: string;
  uploaded_by?: string | null;
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showMoveSelectedDialog, setShowMoveSelectedDialog] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState("");
  const [movingSelected, setMovingSelected] = useState(false);
  const [showMoveCourseImagesDialog, setShowMoveCourseImagesDialog] = useState(false);
  const [movingCourseImages, setMovingCourseImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    alt_text: "",
    caption: "",
    tags: "",
  });

  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    loadMedia();
  }, [currentFolder]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      
      // Load media items
      let mediaQuery = supabase
        .from("cms_media")
        .select("*")
        .order("created_at", { ascending: false });

      if (currentFolder !== 'all') {
        mediaQuery = mediaQuery.eq("folder_path", currentFolder);
      }

      const { data: mediaData, error: mediaError } = await mediaQuery;
      if (mediaError) {
        console.error("Error loading media:", mediaError);
        throw mediaError;
      }
      setMedia(mediaData || []);

      // Load folders
      const { data: allMedia, error: allMediaError } = await supabase
        .from("cms_media")
        .select("folder_path");

      if (allMediaError) {
        console.error("Error loading folders:", allMediaError);
        throw allMediaError;
      }

      const folderSet = new Set<string>();
      allMedia?.forEach(item => {
        folderSet.add(item.folder_path);
      });

      const folderList: MediaFolder[] = Array.from(folderSet)
        .filter(path => path && path.trim() !== '')
        .map(path => {
          const parts = path.split('/').filter(Boolean);
          return {
            path,
            name: parts[parts.length - 1] || 'Root',
            count: allMedia?.filter(item => item.folder_path === path).length || 0
          };
        });

      folderList.unshift({
        path: 'all',
        name: 'All Media',
        count: allMedia?.length || 0
      });

      setFolders(folderList);

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
        
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = currentFolder === 'all' || currentFolder === '/' 
          ? filename 
          : `${currentFolder.replace(/^\//, '')}/${filename}`;
          
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('cms-media')
          .upload(uploadPath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('cms-media')
          .getPublicUrl(uploadData.path);

        const mediaData = {
          filename,
          original_name: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          storage_path: uploadData.path,
          public_url: publicUrlData.publicUrl,
          folder_path: currentFolder === 'all' ? '/' : currentFolder,
          uploaded_by: null, // Will be set by RLS if user is authenticated
        };

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
          tags: editForm.tags ? editForm.tags.split(",").map(tag => tag.trim()).filter(Boolean) : null,
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
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("cms_media")
        .delete()
        .eq("id", itemId);

      if (dbError) throw dbError;

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

    const newFolderPath = currentFolder === 'all' ? '/' + newFolderName.trim() : currentFolder + (currentFolder.endsWith('/') ? '' : '/') + newFolderName.trim();
    
    try {
      const placeholderContent = new Blob([''], { type: 'text/plain' });
      
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .upload(`${newFolderPath}/.keep`, placeholderContent);

      if (storageError && !storageError.message.includes('already exists')) {
        throw storageError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(`${newFolderPath}/.keep`);

      const { data: existingRecord } = await supabase
        .from('cms_media')
        .select('id')
        .eq('folder_path', newFolderPath)
        .eq('filename', '.keep')
        .single();

      if (!existingRecord) {
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

        if (dbError) throw dbError;
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

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredMedia.map(item => item.id)));
    }
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const itemsToDelete = media.filter(item => selectedItems.has(item.id));
      
      const storagePaths = itemsToDelete.map(item => item.storage_path);
      const { error: storageError } = await supabase.storage
        .from('cms-media')
        .remove(storagePaths);

      if (storageError) {
        console.warn('Some storage files could not be deleted:', storageError);
      }

      const { error: dbError } = await supabase
        .from("cms_media")
        .delete()
        .in("id", Array.from(selectedItems));

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${selectedItems.size} items deleted successfully`,
      });

      setSelectedItems(new Set());
      setShowBulkDeleteDialog(false);
      loadMedia();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete selected items",
        variant: "destructive",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
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
    item.filename !== '.keep' &&
    (item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.alt_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
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
          <h2 className="text-2xl font-bold">Media Library</h2>
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
                <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                  Create Folder
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
          {filteredMedia.length > 0 && (
            <div className="flex items-center space-x-2 border-r pr-4 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedItems.size === filteredMedia.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedItems.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedItems.size} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowBulkDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </>
              )}
            </div>
          )}
          
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
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No media files</h3>
                    <p className="text-muted-foreground">
                      Upload some files to get started with your media library.
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredMedia.map((item) => (
                      <Card key={item.id} className="group relative">
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 rounded border-gray-300 bg-white/80 backdrop-blur-sm"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                            {item.file_type.startsWith('image/') ? (
                              <img 
                                src={item.public_url} 
                                alt={item.alt_text || item.original_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Images</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} selected image(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Warning: Permanent Deletion</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedItems.size} image(s) will be permanently removed from both the database and storage.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {bulkDeleting ? "Deleting..." : `Delete ${selectedItems.size} Image(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}