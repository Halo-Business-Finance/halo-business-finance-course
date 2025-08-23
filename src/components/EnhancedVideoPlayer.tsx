import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  BookmarkPlus,
  MessageSquare,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoPlayerProps {
  title: string;
  description: string;
  duration: string;
  videoType: 'youtube' | 'vimeo' | 'direct';
  videoUrl: string;
  youtubeId?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
  moduleId?: string;
}

interface Bookmark {
  id: string;
  timestamp: number;
  note: string;
  title: string;
}

interface Note {
  id: string;
  timestamp: number;
  text: string;
  createdAt: Date;
}

export const EnhancedVideoPlayer = ({ 
  title, 
  description, 
  duration, 
  videoType, 
  videoUrl, 
  youtubeId,
  onProgress,
  onComplete,
  className,
  moduleId 
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showNotes, setShowNotes] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [watchTime, setWatchTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress calculation
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const watchProgress = totalDuration > 0 ? (watchTime / totalDuration) * 100 : 0;

  // Update progress and track watch time
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
        onProgress?.(watchProgress);
        
        // Mark as completed when 90% watched
        if (watchProgress > 90 && !isCompleted) {
          setIsCompleted(true);
          onComplete?.();
          toast({
            title: "🎉 Video Completed!",
            description: "Great job! You've completed this video.",
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, watchProgress, isCompleted, onProgress, onComplete, toast]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * totalDuration;
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Handle volume
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, totalDuration));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Add bookmark
  const addBookmark = () => {
    const bookmark: Bookmark = {
      id: Date.now().toString(),
      timestamp: currentTime,
      note: `Bookmark at ${formatTime(currentTime)}`,
      title: `Bookmark ${bookmarks.length + 1}`
    };
    setBookmarks([...bookmarks, bookmark]);
    toast({
      title: "📌 Bookmark Added",
      description: `Bookmark added at ${formatTime(currentTime)}`,
    });
  };

  // Add note
  const addNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        timestamp: currentTime,
        text: newNote,
        createdAt: new Date()
      };
      setNotes([...notes, note]);
      setNewNote("");
      toast({
        title: "📝 Note Added",
        description: "Your note has been saved",
      });
    }
  };

  // Jump to bookmark/note
  const jumpTo = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  // YouTube embed for YouTube videos
  if (videoType === 'youtube' && youtubeId) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground mb-4">{description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {duration}
                </Badge>
                {isCompleted && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={addBookmark}>
                      <BookmarkPlus className="h-4 w-4 mr-2" />
                      Bookmark
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add bookmark at current time</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowNotes(!showNotes)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes ({notes.length})
              </Button>
            </div>

            {/* Progress indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(watchProgress)}% watched</span>
              </div>
              <Progress value={watchProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom video player for direct videos
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative aspect-video bg-black group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onLoadedMetadata={(e) => setTotalDuration(e.currentTarget.duration)}
            onEnded={() => {
              setIsPlaying(false);
              setIsCompleted(true);
              onComplete?.();
            }}
          />
          
          {/* Video Controls Overlay */}
          {showControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              {/* Play/Pause Center Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 text-white"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                {/* Progress Bar */}
                <div className="space-y-1">
                  <Slider
                    value={[progress]}
                    onValueChange={handleSeek}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/80">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(totalDuration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => skip(-10)}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={togglePlay}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => skip(10)}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="sm" variant="ghost" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      <Slider
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        className="w-20"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={addBookmark}>
                      <BookmarkPlus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground mb-4">{description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </Badge>
              {isCompleted && (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes ({notes.length})
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Watch Progress:</span>
              <span className="font-medium">{Math.round(watchProgress)}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={watchProgress} className="h-2" />
          </div>

          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Bookmarks</h4>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((bookmark) => (
                  <Button
                    key={bookmark.id}
                    variant="outline"
                    size="sm"
                    onClick={() => jumpTo(bookmark.timestamp)}
                    className="text-xs"
                  >
                    📌 {formatTime(bookmark.timestamp)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes Panel */}
        {showNotes && (
          <div className="border-t p-6 space-y-4 bg-muted/20">
            <h4 className="font-medium">Video Notes</h4>
            
            {/* Add Note */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a note at current time..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
              />
              <Button size="sm" onClick={addNote}>
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-3 border rounded-md bg-background">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => jumpTo(note.timestamp)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {formatTime(note.timestamp)}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {note.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};