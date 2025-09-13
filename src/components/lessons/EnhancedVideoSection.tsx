import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, StickyNote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";

interface EnhancedVideoSectionProps {
  lesson: {
    id: string;
    title: string;
    duration: string;
  };
  moduleTitle: string;
  onNotesTake: () => void;
  notesCount: number;
}

export const EnhancedVideoSection = ({ 
  lesson, 
  moduleTitle, 
  onNotesTake, 
  notesCount 
}: EnhancedVideoSectionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const chapters = [
    { title: "Introduction & Overview", time: "0:00", duration: "2:30" },
    { title: "Core Concepts", time: "2:30", duration: "5:45" },
    { title: "Practical Applications", time: "8:15", duration: "4:20" },
    { title: "Case Study Analysis", time: "12:35", duration: "3:15" },
    { title: "Summary & Next Steps", time: "15:50", duration: "1:40" }
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Player Section */}
      <Card className="jp-card-elegant">
        <CardHeader>
          <CardTitle className="jp-heading text-navy-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Instructional Video: {lesson.title}
            </div>
            <Badge className="bg-gradient-primary text-primary-foreground">
              HD Quality
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Professional Video Player Container */}
            <div className="relative bg-navy-900 rounded-lg overflow-hidden aspect-video">
              <VideoPlayer 
                title={lesson.title}
                videoType="youtube"
                videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
              />
            
            {/* Custom Video Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-3">
                {/* Progress Bar */}
                <Progress 
                  value={progress} 
                  className="h-1 bg-white/20"
                />
                
                {/* Control Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-white text-sm font-mono">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-white hover:bg-white/20"
                      onClick={onNotesTake}
                    >
                      <StickyNote className="h-4 w-4" />
                      {notesCount > 0 && <span className="ml-1">{notesCount}</span>}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Information */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="jp-card p-4">
              <h5 className="jp-subheading mb-2">Video Length</h5>
              <p className="jp-body font-semibold text-primary">{lesson.duration}</p>
            </div>
            <div className="jp-card p-4">
              <h5 className="jp-subheading mb-2">Quality</h5>
              <p className="jp-body font-semibold text-primary">1080p HD</p>
            </div>
            <div className="jp-card p-4">
              <h5 className="jp-subheading mb-2">Captions</h5>
              <p className="jp-body font-semibold text-primary">Available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapter Navigation */}
      <Card className="jp-card">
        <CardHeader>
          <CardTitle className="jp-heading text-navy-900">Chapter Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <h6 className="jp-subheading text-sm">{chapter.title}</h6>
                    <p className="jp-caption">Duration: {chapter.duration}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {chapter.time}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="jp-card">
          <CardHeader>
            <CardTitle className="jp-heading text-navy-900">Learning Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="jp-body text-sm">Closed captions and transcripts</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="jp-body text-sm">Bookmark important moments</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="jp-body text-sm">Variable playback speed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="jp-body text-sm">Mobile-optimized viewing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="jp-card bg-gradient-to-br from-primary/5 to-navy-900/5">
          <CardHeader>
            <CardTitle className="jp-heading text-navy-900">Study Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="jp-body text-sm">
              <strong>Active Learning:</strong> Take notes during key concepts and pause to reflect on applications.
            </p>
            <p className="jp-body text-sm">
              <strong>Review Strategy:</strong> Use chapter navigation to revisit complex sections.
            </p>
            <p className="jp-body text-sm">
              <strong>Practice Ready:</strong> Have a calculator ready for financial examples.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};