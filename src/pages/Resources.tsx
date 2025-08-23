import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, ExternalLink, BookOpen, Video, FileSpreadsheet, Users, Play } from "lucide-react";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ToolModal } from "@/components/tools/ToolModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResourcesPage = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<{type: string, title: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const [docsRes, videosRes, toolsRes, webinarsRes] = await Promise.all([
        supabase.from('course_documents').select('*').eq('is_downloadable', true).order('created_at', { ascending: false }),
        supabase.from('course_videos').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('learning_tools').select('*').eq('is_active', true).order('order_index', { ascending: true }),
        supabase.from('learning_webinars').select('*').eq('is_active', true).order('scheduled_date', { ascending: false })
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "XLSX":
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async (document: any) => {
    try {
      // Update download count
      await supabase
        .from('course_documents')
        .update({ download_count: (document.download_count || 0) + 1 })
        .eq('id', document.id);

      // Open file in new tab
      window.open(document.file_url, "_blank");

      toast({
        title: "Download Started",
        description: `Downloading ${document.title}`,
      });
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Learning Resources</h1>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Downloadable Documents
              </CardTitle>
              <CardDescription>
                Essential documents, guides, and templates for your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No documents available yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <h3 className="font-medium text-foreground">{doc.title}</h3>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{doc.file_type}</Badge>
                            <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Library
              </CardTitle>
              <CardDescription>
                Interactive training videos and lectures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {videos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No videos available yet.
                  </div>
                ) : (
                  videos.map((video) => (
                    <VideoPlayer
                      key={video.id}
                      title={video.title}
                      description={video.description}
                      duration={video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}` : undefined}
                      videoType={video.video_type as 'youtube' | 'file'}
                      videoUrl={video.video_url}
                      youtubeId={video.youtube_id}
                      onProgress={(progress) => {}}
                      onComplete={() => {}}
                      className="w-full"
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Interactive Tools
              </CardTitle>
              <CardDescription>
                Calculators and interactive tools to support your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {tools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tools available yet.
                  </div>
                ) : (
                  tools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="h-4 w-4 text-purple-500" />
                        <div>
                          <h3 className="font-medium text-foreground">{tool.title}</h3>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                          <Badge variant="outline" className="mt-1">{tool.tool_type}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedTool({
                          type: tool.tool_type,
                          title: tool.title
                        });
                      }}>
                        Launch Tool
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Live Webinars & Events
              </CardTitle>
              <CardDescription>
                Join live sessions with industry experts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {webinars.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No webinars available yet.
                  </div>
                ) : (
                  webinars.map((webinar) => (
                    <div key={webinar.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-foreground">{webinar.title}</h3>
                        <p className="text-sm text-muted-foreground">{webinar.presenter}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {webinar.scheduled_date && webinar.scheduled_time 
                              ? `${webinar.scheduled_date} at ${webinar.scheduled_time} ${webinar.timezone || 'EST'}`
                              : 'TBD'}
                          </span>
                          <Badge variant={webinar.status === "upcoming" || webinar.status === "scheduled" ? "progress" : "outline"}>
                            {webinar.status}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={webinar.status === "upcoming" || webinar.status === "scheduled" ? "default" : "outline"}
                        onClick={() => {
                          if (webinar.status === "upcoming" || webinar.status === "scheduled") {
                            if (webinar.registration_url) {
                              window.open(webinar.registration_url, '_blank');
                            } else {
                              alert(`Registration for "${webinar.title}" coming soon!`);
                            }
                          } else {
                            if (webinar.recording_url) {
                              window.open(webinar.recording_url, '_blank');
                            } else {
                              alert(`Recording for "${webinar.title}" will be available soon!`);
                            }
                          }
                        }}
                      >
                        {webinar.status === "upcoming" || webinar.status === "scheduled" ? "Register" : "Watch Recording"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <ToolModal
        open={!!selectedTool}
        onOpenChange={(open) => !open && setSelectedTool(null)}
        toolType={selectedTool?.type || ""}
        toolTitle={selectedTool?.title || ""}
      />
    </div>
  );
};

export default ResourcesPage;