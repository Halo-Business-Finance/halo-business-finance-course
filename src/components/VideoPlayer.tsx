import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  title: string;
  videoType: "youtube" | "file";
  videoUrl: string;
  youtubeId?: string;
  description?: string;
  duration?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export const VideoPlayer = ({ 
  title, 
  videoType, 
  videoUrl, 
  youtubeId, 
  description, 
  duration,
  onProgress,
  onComplete,
  className 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ytProvider, setYtProvider] = useState<"youtube" | "proxy">("proxy");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setTotalDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  useEffect(() => {
    if (onProgress && totalDuration > 0) {
      const progress = (currentTime / totalDuration) * 100;
      onProgress(progress);
    }
  }, [currentTime, totalDuration, onProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  if (videoType === "youtube") {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const extractId = (url: string) => {
      try {
        const u = new URL(url);
        const v = u.searchParams.get('v');
        if (v) return v;
        const parts = u.pathname.split('/');
        return parts[parts.length - 1] || undefined;
      } catch {
        return undefined;
      }
    };

    const id = youtubeId || extractId(videoUrl);
    const embedUrl = id
      ? (
          ytProvider === 'youtube'
            ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`
            : `https://piped.video/embed/${id}`
        )
      : videoUrl.replace("watch?v=", "embed/").replace("&", "?").replace("www.youtube.com", "www.youtube-nocookie.com");
    
    const watchUrl = id
      ? `https://www.youtube.com/watch?v=${id}`
      : videoUrl;

    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {duration && <Badge variant="outline">{duration}</Badge>}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-muted/30">
            <div className="absolute right-3 top-3 z-10 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setYtProvider(ytProvider === 'youtube' ? 'proxy' : 'youtube')}
                className="gap-2"
                aria-label="Toggle video provider"
              >
                <RotateCcw className="h-4 w-4" />
                {ytProvider === 'youtube' ? 'Try alternate player' : 'Use YouTube player'}
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => window.open(watchUrl, '_blank', 'noopener')}
                className="gap-2"
                aria-label="Open video on YouTube"
              >
                <Play className="h-4 w-4" />
                Watch on YouTube
              </Button>
            </div>
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              allowFullScreen
            />
          </div>
          <div className="p-4 border-t bg-muted/40">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-full">
                <Play className="h-4 w-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Video not playing?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Some YouTube videos block embedding. Use the button to watch directly on YouTube.
                </p>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => window.open(watchUrl, '_blank')}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Open in YouTube
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)} ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {duration && <Badge variant="outline">{duration}</Badge>}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            onClick={togglePlay}
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};