import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Video, 
  ExternalLink, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Upload,
  Calendar,
  Clock
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_type: string;
  file_url: string;
  file_size?: number;
  category?: string;
  tags?: string[];
  is_downloadable: boolean;
  module_id?: string;
}

interface VideoResource {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  youtube_id?: string;
  video_type: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  tags?: string[];
  is_active: boolean;
  module_id?: string;
}

interface Tool {
  id: string;
  title: string;
  description?: string;
  tool_url?: string;
  tool_type: string;
  category?: string;
  tags?: string[];
  is_active: boolean;
  order_index: number;
}

interface Webinar {
  id: string;
  title: string;
  description?: string;
  presenter: string;
  scheduled_date?: string;
  scheduled_time?: string;
  timezone?: string;
  status: string;
  recording_url?: string;
  registration_url?: string;
  max_attendees?: number;
  current_attendees?: number;
  tags?: string[];
  is_active: boolean;
}

type ResourceType = 'documents' | 'videos' | 'tools' | 'webinars';

export function ResourceManager() {
  const [activeTab, setActiveTab] = useState<ResourceType>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, videosRes, toolsRes, webinarsRes] = await Promise.all([
        supabase.from('course_documents').select('*').order('created_at', { ascending: false }),
        supabase.from('course_videos').select('*').order('created_at', { ascending: false }),
        supabase.from('learning_tools').select('*').order('order_index', { ascending: true }),
        supabase.from('learning_webinars').select('*').order('scheduled_date', { ascending: false })
      ]);

      if (docsRes.error) throw docsRes.error;
      if (videosRes.error) throw videosRes.error;
      if (toolsRes.error) throw toolsRes.error;
      if (webinarsRes.error) throw webinarsRes.error;

      setDocuments(docsRes.data || []);
      setVideos(videosRes.data || []);
      setTools(toolsRes.data || []);
      setWebinars(webinarsRes.data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      let result;
      
      if (activeTab === 'documents') {
        const data = {
          title: formData.title,
          description: formData.description,
          file_type: formData.file_type,
          file_url: formData.file_url,
          file_size: parseInt(formData.file_size) || 0,
          category: formData.category || 'general',
          tags: formData.tags?.split(',').map((tag: string) => tag.trim()) || [],
          is_downloadable: formData.is_downloadable !== false,
          module_id: formData.module_id || null
        };

        if (editingItem) {
          result = await supabase.from('course_documents').update(data).eq('id', editingItem.id);
        } else {
          result = await supabase.from('course_documents').insert([data]);
        }
      } else if (activeTab === 'videos') {
        const data = {
          title: formData.title,
          description: formData.description,
          video_url: formData.video_url,
          youtube_id: formData.youtube_id,
          video_type: formData.video_type || 'youtube',
          duration_seconds: parseInt(formData.duration_seconds) || null,
          thumbnail_url: formData.thumbnail_url,
          tags: formData.tags?.split(',').map((tag: string) => tag.trim()) || [],
          is_active: formData.is_active !== false,
          module_id: formData.module_id || null
        };

        if (editingItem) {
          result = await supabase.from('course_videos').update(data).eq('id', editingItem.id);
        } else {
          result = await supabase.from('course_videos').insert([data]);
        }
      } else if (activeTab === 'tools') {
        const data = {
          title: formData.title,
          description: formData.description,
          tool_url: formData.tool_url,
          tool_type: formData.tool_type || 'web_tool',
          category: formData.category || 'general',
          tags: formData.tags?.split(',').map((tag: string) => tag.trim()) || [],
          is_active: formData.is_active !== false,
          order_index: parseInt(formData.order_index) || 0
        };

        if (editingItem) {
          result = await supabase.from('learning_tools').update(data).eq('id', editingItem.id);
        } else {
          result = await supabase.from('learning_tools').insert([data]);
        }
      } else if (activeTab === 'webinars') {
        const data = {
          title: formData.title,
          description: formData.description,
          presenter: formData.presenter,
          scheduled_date: formData.scheduled_date || null,
          scheduled_time: formData.scheduled_time || null,
          timezone: formData.timezone || 'EST',
          status: formData.status || 'scheduled',
          recording_url: formData.recording_url,
          registration_url: formData.registration_url,
          max_attendees: parseInt(formData.max_attendees) || null,
          tags: formData.tags?.split(',').map((tag: string) => tag.trim()) || [],
          is_active: formData.is_active !== false
        };

        if (editingItem) {
          result = await supabase.from('learning_webinars').update(data).eq('id', editingItem.id);
        } else {
          result = await supabase.from('learning_webinars').insert([data]);
        }
      }

      if (result?.error) throw result.error;

      toast({
        title: 'Success',
        description: `${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'created'} successfully.`,
      });

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to save resource.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item, tags: item.tags?.join(', ') || '' });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      let result;
      if (activeTab === 'documents') {
        result = await supabase.from('course_documents').delete().eq('id', id);
      } else if (activeTab === 'videos') {
        result = await supabase.from('course_videos').delete().eq('id', id);
      } else if (activeTab === 'tools') {
        result = await supabase.from('learning_tools').delete().eq('id', id);
      } else if (activeTab === 'webinars') {
        result = await supabase.from('learning_webinars').delete().eq('id', id);
      }

      if (result?.error) throw result.error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully.',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource.',
        variant: 'destructive',
      });
    }
  };

  const renderResourceTable = (type: ResourceType) => {
    let data: any[] = [];
    if (type === 'documents') data = documents;
    else if (type === 'videos') data = videos;
    else if (type === 'tools') data = tools;
    else if (type === 'webinars') data = webinars;

    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {type} yet. Create your first one!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {data.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {type === 'documents' && (
                      <>
                        <span className="text-xs px-2 py-1 border rounded text-muted-foreground">{item.file_type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${item.is_downloadable ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          {item.is_downloadable ? 'Downloadable' : 'View Only'}
                        </span>
                      </>
                    )}
                    {type === 'videos' && (
                      <>
                        <span className="text-xs px-2 py-1 border rounded text-muted-foreground">{item.video_type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </>
                    )}
                    {type === 'tools' && (
                      <>
                        <span className="text-xs px-2 py-1 border rounded text-muted-foreground">{item.tool_type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </>
                    )}
                    {type === 'webinars' && (
                      <>
                        <span className="text-xs px-2 py-1 border rounded text-muted-foreground">{item.status}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.presenter}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderForm = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description"
          />
        </div>

        {activeTab === 'documents' && (
          <>
            <div>
              <Label htmlFor="file_url">File URL *</Label>
              <Input
                id="file_url"
                value={formData.file_url || ''}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="file_type">File Type *</Label>
              <Select value={formData.file_type || ''} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="DOCX">DOCX</SelectItem>
                  <SelectItem value="XLSX">XLSX</SelectItem>
                  <SelectItem value="PPTX">PPTX</SelectItem>
                  <SelectItem value="TXT">TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="file_size">File Size (bytes)</Label>
              <Input
                id="file_size"
                type="number"
                value={formData.file_size || ''}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                placeholder="1024000"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_downloadable"
                checked={formData.is_downloadable !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_downloadable: checked })}
              />
              <Label htmlFor="is_downloadable">Allow Download</Label>
            </div>
          </>
        )}

        {activeTab === 'videos' && (
          <>
            <div>
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="video_type">Video Type</Label>
              <Select value={formData.video_type || 'youtube'} onValueChange={(value) => setFormData({ ...formData, video_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="external">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="youtube_id">YouTube ID</Label>
              <Input
                id="youtube_id"
                value={formData.youtube_id || ''}
                onChange={(e) => setFormData({ ...formData, youtube_id: e.target.value })}
                placeholder="dQw4w9WgXcQ"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </>
        )}

        {activeTab === 'tools' && (
          <>
            <div>
              <Label htmlFor="tool_url">Tool URL</Label>
              <Input
                id="tool_url"
                value={formData.tool_url || ''}
                onChange={(e) => setFormData({ ...formData, tool_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="tool_type">Tool Type</Label>
              <Select value={formData.tool_type || 'web_tool'} onValueChange={(value) => setFormData({ ...formData, tool_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tool type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web_tool">Web Tool</SelectItem>
                  <SelectItem value="calculator">Calculator</SelectItem>
                  <SelectItem value="simulator">Simulator</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order_index">Display Order</Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index || 0}
                onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </>
        )}

        {activeTab === 'webinars' && (
          <>
            <div>
              <Label htmlFor="presenter">Presenter *</Label>
              <Input
                id="presenter"
                value={formData.presenter || ''}
                onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
                placeholder="Presenter name and title"
              />
            </div>
            <div>
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={formData.scheduled_date || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="scheduled_time">Scheduled Time</Label>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || 'scheduled'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="registration_url">Registration URL</Label>
              <Input
                id="registration_url"
                value={formData.registration_url || ''}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="recording_url">Recording URL</Label>
              <Input
                id="recording_url"
                value={formData.recording_url || ''}
                onChange={(e) => setFormData({ ...formData, recording_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="max_attendees">Max Attendees</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees || ''}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="100"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="general"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags || ''}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    );
  };

  const getTabIcon = (type: ResourceType) => {
    switch (type) {
      case 'documents': return <FileText className="h-4 w-4" />;
      case 'videos': return <Video className="h-4 w-4" />;
      case 'tools': return <ExternalLink className="h-4 w-4" />;
      case 'webinars': return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Resources</h2>
          <p className="text-muted-foreground">
            Manage documents, videos, tools, and webinars
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResourceType)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="documents" className="flex items-center gap-1">
              {getTabIcon('documents')}
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1">
              {getTabIcon('videos')}
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-1">
              {getTabIcon('tools')}
              <span className="hidden sm:inline">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="webinars" className="flex items-center gap-1">
              {getTabIcon('webinars')}
              <span className="hidden sm:inline">Webinars</span>
            </TabsTrigger>
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New {activeTab.slice(0, -1)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
                </DialogTitle>
              </DialogHeader>
              {renderForm()}
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="documents">
          {renderResourceTable('documents')}
        </TabsContent>
        <TabsContent value="videos">
          {renderResourceTable('videos')}
        </TabsContent>
        <TabsContent value="tools">
          {renderResourceTable('tools')}
        </TabsContent>
        <TabsContent value="webinars">
          {renderResourceTable('webinars')}
        </TabsContent>
      </Tabs>
    </div>
  );
}