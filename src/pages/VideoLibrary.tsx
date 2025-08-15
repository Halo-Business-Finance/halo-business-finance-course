import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { PlayCircle, Clock, Users, BookOpen } from "lucide-react";

const VideoLibraryPage = () => {
  const videoCategories = [
    {
      title: "Foundation Courses",
      videos: [
        {
          title: "Business Finance Fundamentals",
          description: "Core concepts every finance professional should know",
          duration: "42:30",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          instructor: "Dr. Sarah Martinez"
        },
        {
          title: "Financial Statement Analysis",
          description: "How to read and analyze financial statements",
          duration: "38:15",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          instructor: "Prof. Michael Chen"
        }
      ]
    },
    {
      title: "SBA Loan Programs",
      videos: [
        {
          title: "SBA 7(a) Loan Program Overview",
          description: "Complete guide to SBA's most popular loan program",
          duration: "28:45",
          videoType: "file" as const,
          videoUrl: "/sba-7a-overview.mp4",
          instructor: "Jennifer Rodriguez"
        },
        {
          title: "SBA Express Loans Explained",
          description: "Fast-track financing options for small businesses",
          duration: "22:30",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          instructor: "David Thompson"
        }
      ]
    },
    {
      title: "Advanced Topics",
      videos: [
        {
          title: "Credit Risk Assessment Models",
          description: "Advanced techniques for evaluating borrower risk",
          duration: "45:20",
          videoType: "file" as const,
          videoUrl: "/credit-risk-models.mp4",
          instructor: "Dr. Lisa Wang"
        },
        {
          title: "Alternative Financing Solutions",
          description: "Exploring non-traditional funding sources",
          duration: "35:10",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          instructor: "Robert Kim"
        }
      ]
    }
  ];

  const handleVideoProgress = (videoTitle: string, progress: number) => {
    // Store progress in localStorage or send to backend
    localStorage.setItem(`video_progress_${videoTitle}`, progress.toString());
  };

  const handleVideoComplete = (videoTitle: string) => {
    // Mark video as completed
    localStorage.setItem(`video_completed_${videoTitle}`, "true");
    console.log(`Video completed: ${videoTitle}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <PlayCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Video Training Library</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <PlayCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-muted-foreground">Total Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">12h</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-muted-foreground">Expert Instructors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">6</div>
            <div className="text-sm text-muted-foreground">Course Modules</div>
          </CardContent>
        </Card>
      </div>

      {/* Video Categories */}
      {videoCategories.map((category, categoryIndex) => (
        <div key={category.title} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
            <Badge variant="outline">{category.videos.length} videos</Badge>
          </div>
          
          <div className="grid gap-6">
            {category.videos.map((video, videoIndex) => (
              <div key={video.title} className="space-y-2">
                <VideoPlayer
                  title={video.title}
                  description={video.description}
                  duration={video.duration}
                  videoType={video.videoType}
                  videoUrl={video.videoUrl}
                  youtubeId={video.youtubeId}
                  onProgress={(progress) => handleVideoProgress(video.title, progress)}
                  onComplete={() => handleVideoComplete(video.title)}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
                  <span>Instructor: {video.instructor}</span>
                  <span>Module {categoryIndex + 1}.{videoIndex + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoLibraryPage;