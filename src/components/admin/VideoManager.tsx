import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Plus, Edit, Trash2, ExternalLink, Youtube, Video, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoData {
  id: string;
  module_id: string;
  title: string;
  description: string;
  video_type: 'youtube' | 'url' | 'upload';
  video_url: string;
  youtube_id?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  order_index: number;
  is_active: boolean;
  view_count: number;
  tags: string[];
  created_at: string;
}

interface Module {
  module_id: string;
  title: string;
}

export function VideoManager() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    description: "",
    video_type: "youtube" as 'youtube' | 'url' | 'upload',
    video_url: "",
    tags: "",
    order_index: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load videos
      const { data: videosData, error: videosError } = await supabase
        .from("course_videos")
        .select("*")
        .order("order_index");

      if (videosError) throw videosError;
      setVideos((videosData || []).map(video => ({
        ...video,
        video_type: video.video_type as 'youtube' | 'url' | 'upload'
      })));

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("module_id, title")
        .eq("is_active", true)
        .order("order_index");

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load video data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const videoData: any = {
        module_id: formData.module_id,
        title: formData.title,
        description: formData.description,
        video_type: formData.video_type,
        video_url: formData.video_url,
        order_index: formData.order_index,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      };

      // Extract YouTube ID if it's a YouTube video
      if (formData.video_type === "youtube") {
        const youtubeId = extractYouTubeId(formData.video_url);
        if (youtubeId) {
          videoData.youtube_id = youtubeId;
          videoData.thumbnail_url = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        }
      }

      if (editingVideo) {
        const { error } = await supabase
          .from("course_videos")
          .update(videoData)
          .eq("id", editingVideo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("course_videos")
          .insert(videoData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Video added successfully",
        });
      }

      resetForm();
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save video",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      module_id: "",
      title: "",
      description: "",
      video_type: "youtube",
      video_url: "",
      tags: "",
      order_index: 0,
    });
    setEditingVideo(null);
    setShowAddDialog(false);
  };

  const handleEdit = (video: VideoData) => {
    setFormData({
      module_id: video.module_id,
      title: video.title,
      description: video.description || "",
      video_type: video.video_type,
      video_url: video.video_url,
      tags: video.tags.join(", "),
      order_index: video.order_index,
    });
    setEditingVideo(video);
    setShowAddDialog(true);
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("course_videos")
        .delete()
        .eq("id", videoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const toggleVideoStatus = async (videoId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("course_videos")
        .update({ is_active: !isActive })
        .eq("id", videoId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Video ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update video status",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVideoIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Youtube className="h-4 w-4 text-red-500" />;
      case 'upload': return <Upload className="h-4 w-4 text-blue-500" />;
      default: return <Video className="h-4 w-4 text-gray-500" />;
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Management</h2>
          <p className="text-muted-foreground">
            Upload and manage course videos from YouTube, direct URLs, or file uploads
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add New Video"}
              </DialogTitle>
              <DialogDescription>
                Add videos from YouTube, direct links, or upload your own files
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="module">Module</Label>
                  <Select 
                    value={formData.module_id} 
                    onValueChange={(value) => setFormData({...formData, module_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(module => (
                        <SelectItem key={module.module_id} value={module.module_id}>
                          {module.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video_type">Video Type</Label>
                  <Select 
                    value={formData.video_type} 
                    onValueChange={(value: any) => setFormData({...formData, video_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="url">Direct URL</SelectItem>
                      <SelectItem value="upload">File Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter video title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">
                  {formData.video_type === 'youtube' ? 'YouTube URL' : 
                   formData.video_type === 'url' ? 'Video URL' : 'File Upload'}
                </Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder={
                    formData.video_type === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
                    formData.video_type === 'url' ? 'https://example.com/video.mp4' :
                    'Upload functionality coming soon'
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="tutorial, finance, lending"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order">Order Index</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVideo ? "Update Video" : "Add Video"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Videos ({videos.length})</CardTitle>
          <CardDescription>
            Manage all course videos across modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                            {getVideoIcon(video.video_type)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{video.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {video.description}
                        </p>
                        {video.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {video.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {video.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{video.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {modules.find(m => m.module_id === video.module_id)?.title || video.module_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getVideoIcon(video.video_type)}
                      <span className="text-sm capitalize">{video.video_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={video.is_active ? "default" : "secondary"}>
                      {video.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{video.view_count}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(video.video_url, "_blank")}
                        title="Watch Video"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(video)}
                        title="Edit Video"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleVideoStatus(video.id, video.is_active)}
                        title={video.is_active ? "Deactivate" : "Activate"}
                      >
                        {video.is_active ? "🔒" : "🔓"}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" title="Delete Video">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{video.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(video.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {videos.length === 0 && (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No videos yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your first course video
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}