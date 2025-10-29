import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlayCircle, Clock, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Video {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  video_type: string;
  video_url: string;
  youtube_id: string | null;
  module_title: string | null;
}

interface VideoCategory {
  title: string;
  videos: Video[];
}

const VideoLibraryPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<VideoCategory[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('course_videos')
        .select(`
          *,
          course_content_modules!course_videos_module_id_fkey (
            title
          )
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const videosWithModule = (data || []).map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration_seconds: video.duration_seconds,
        video_type: video.video_type,
        video_url: video.video_url,
        youtube_id: video.youtube_id,
        module_title: video.course_content_modules?.title || 'Uncategorized'
      }));

      setVideos(videosWithModule);
      
      // Group videos by module
      const grouped = videosWithModule.reduce((acc: Record<string, Video[]>, video) => {
        const category = video.module_title || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(video);
        return acc;
      }, {});

      const categoryList = Object.entries(grouped).map(([title, videos]) => ({
        title,
        videos
      }));

      setCategories(categoryList);
    } catch (error: any) {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = (videoTitle: string, progress: number) => {
    localStorage.setItem(`video_progress_${videoTitle}`, progress.toString());
  };

  const handleVideoComplete = (videoTitle: string) => {
    localStorage.setItem(`video_completed_${videoTitle}`, "true");
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const totalDuration = videos.reduce((sum, video) => sum + (video.duration_seconds || 0), 0);
  const totalVideos = videos.length;

  const extractYouTubeId = (url: string): string | undefined => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : undefined;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6 bg-white min-h-screen">
        <div className="flex items-center gap-2 mb-6">
          <PlayCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Video Training Library</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-white min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <PlayCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Video Training Library</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <PlayCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalVideos}</div>
            <div className="text-sm text-muted-foreground">Total Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Modules</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Categories */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <PlayCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Videos Available</h3>
            <p className="text-muted-foreground">Videos will appear here once they are added by administrators.</p>
          </CardContent>
        </Card>
      ) : (
        categories.map((category, categoryIndex) => (
          <div key={category.title} className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
              <Badge variant="outline">{category.videos.length} videos</Badge>
            </div>
            
            <div className="grid gap-6">
              {category.videos.map((video, videoIndex) => {
                const youtubeId = video.video_type === 'youtube' ? (video.youtube_id || extractYouTubeId(video.video_url)) : undefined;
                const durationDisplay = formatDuration(video.duration_seconds);
                
                return (
                  <div key={video.id} className="space-y-2">
                    <VideoPlayer
                      title={video.title}
                      description={video.description || ''}
                      duration={durationDisplay}
                      videoType={video.video_type as 'youtube' | 'file'}
                      videoUrl={video.video_url}
                      youtubeId={youtubeId}
                      onProgress={(progress) => handleVideoProgress(video.title, progress)}
                      onComplete={() => handleVideoComplete(video.title)}
                      className="w-full"
                    />
                    <div className="flex items-center justify-end text-sm text-muted-foreground px-2">
                      <span>Video {categoryIndex + 1}.{videoIndex + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default VideoLibraryPage;