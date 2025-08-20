import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Clock, Users, BookOpen } from "lucide-react";

const VideoLibraryPage = () => {
  // Empty video categories - ready for real content
  const videoCategories: Array<{title: string, videos: any[]}> = [];

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
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Total Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">0h</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Expert Instructors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-muted-foreground">Course Modules</div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {videoCategories.length === 0 && (
        <div className="text-center py-16">
          <PlayCircle className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
          <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Videos Available</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Training videos are being prepared and will be available soon. Check back later for new content.
          </p>
        </div>
      )}

      {/* Video Categories (when available) */}
      {videoCategories.map((category) => (
        <div key={category.title} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{category.title}</h2>
          </div>
          <div className="grid gap-6">
            {/* Videos will be rendered here when available */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoLibraryPage;