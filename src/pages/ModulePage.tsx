import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { BookOpen, Clock, CheckCircle, Play, FileText, Award, ArrowRight, ArrowLeft } from "lucide-react";
import { courseData } from "@/data/courseData";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const module = courseData.modules.find(m => m.id === moduleId);
  
  if (!module) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Module Not Found</h1>
        <p className="text-muted-foreground">The requested module could not be found.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="completed" className="gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case "in-progress":
        return <Badge variant="progress">In Progress</Badge>;
      case "locked":
        return <Badge variant="outline" className="opacity-60">🔒 Locked</Badge>;
      default:
        return <Badge variant="success">Available</Badge>;
    }
  };

  if (module.status === "locked") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              🔒
            </div>
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              This module is currently locked. Please complete the prerequisite modules to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate("/")}>View Prerequisites</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{module.title}</h1>
          <p className="text-muted-foreground mt-2">{module.description}</p>
        </div>
        {getStatusBadge(module.status)}
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.duration}</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.lessons}</div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.videos?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.lessons}</div>
            <div className="text-sm text-muted-foreground">Quiz Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {module.status !== "available" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Module Completion</span>
                <span className="font-medium">{module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Module Overview</CardTitle>
              <CardDescription>What you'll learn in this module</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{module.description}</p>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Learning Objectives</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Understand core concepts and principles</li>
                    <li>Apply knowledge to real-world scenarios</li>
                    <li>Develop practical skills and competencies</li>
                    <li>Complete assessments and evaluations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <div className="space-y-6">
            {module.videos && module.videos.length > 0 ? (
              module.videos.map((video: any, index: number) => (
                <VideoPlayer
                  key={video.title}
                  title={`${index + 1}. ${video.title}`}
                  description={video.description}
                  duration={video.duration}
                  videoType={video.videoType}
                  videoUrl={video.videoUrl}
                  youtubeId={video.youtubeId}
                  className="w-full"
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Videos Available</h3>
                  <p className="text-muted-foreground">Videos for this module will be available soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Module Resources</CardTitle>
              <CardDescription>Download materials and tools for this module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Resources Coming Soon</h3>
                <p className="text-muted-foreground">Module resources and materials will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Module Quiz</CardTitle>
              <CardDescription>Test your knowledge of this module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{module.lessons}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">80%</div>
                    <div className="text-sm text-muted-foreground">Passing Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">30 min</div>
                    <div className="text-sm text-muted-foreground">Time Limit</div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={module.status === "available"}
                  onClick={() => {
                    if (module.status !== "available") {
                      alert(`Quiz functionality coming soon! This would start the module quiz.`);
                    }
                  }}
                >
                  {module.status === "completed" ? "Retake Quiz" : 
                   module.status === "in-progress" ? "Take Quiz" : "Complete Module First"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Previous Module
        </Button>
        <Button className="gap-2" onClick={() => navigate("/")}>
          Back to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ModulePage;