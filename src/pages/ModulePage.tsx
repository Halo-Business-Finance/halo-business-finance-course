import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/VideoPlayer";
import { BookOpen, Clock, CheckCircle, Play, FileText, Award, ArrowRight, ArrowLeft } from "lucide-react";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const moduleData: Record<string, any> = {
    "foundations": {
      title: "Business Finance Foundations",
      description: "Master the fundamental concepts of business finance, including financial statements, cash flow analysis, and basic financial ratios.",
      status: "completed",
      progress: 100,
      duration: "4 hours",
      lessons: 8,
      videos: [
        {
          title: "Introduction to Business Finance",
          description: "Overview of business finance principles and importance",
          duration: "15:30",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        {
          title: "Financial Statements Deep Dive",
          description: "Understanding balance sheets, income statements, and cash flow",
          duration: "28:45",
          videoType: "file" as const,
          videoUrl: "/financial-statements.mp4"
        }
      ],
      resources: [
        { title: "Financial Ratios Cheat Sheet", type: "PDF", size: "1.2 MB" },
        { title: "Cash Flow Analysis Template", type: "XLSX", size: "850 KB" }
      ],
      quiz: {
        questions: 15,
        passingScore: 80,
        timeLimit: "30 minutes"
      }
    },
    "capital-markets": {
      title: "Capital Markets",
      description: "Explore capital market structures, investment instruments, and market dynamics that drive business financing decisions.",
      status: "completed", 
      progress: 100,
      duration: "5 hours",
      lessons: 10,
      videos: [
        {
          title: "Capital Markets Overview",
          description: "Introduction to primary and secondary markets",
          duration: "22:15",
          videoType: "youtube" as const,
          youtubeId: "dQw4w9WgXcQ",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
      ],
      resources: [
        { title: "Market Analysis Guide", type: "PDF", size: "2.1 MB" }
      ],
      quiz: {
        questions: 20,
        passingScore: 80,
        timeLimit: "40 minutes"
      }
    },
    "sba-loans": {
      title: "SBA Loan Programs",
      description: "Comprehensive guide to Small Business Administration loan programs, application processes, and qualification requirements.",
      status: "in-progress",
      progress: 65,
      duration: "6 hours",
      lessons: 12,
      videos: [
        {
          title: "SBA 7(a) Loan Program",
          description: "Complete guide to the most popular SBA loan program",
          duration: "35:20",
          videoType: "file" as const,
          videoUrl: "/sba-7a-program.mp4"
        }
      ],
      resources: [
        { title: "SBA Application Checklist", type: "PDF", size: "900 KB" },
        { title: "Loan Calculator", type: "Web Tool", size: "-" }
      ],
      quiz: {
        questions: 25,
        passingScore: 85,
        timeLimit: "45 minutes"
      }
    },
    "conventional-loans": {
      title: "Conventional Lending",
      description: "Traditional lending practices, underwriting criteria, and risk assessment methodologies for conventional business loans.",
      status: "available",
      progress: 0,
      duration: "5.5 hours",
      lessons: 11,
      videos: [],
      resources: [],
      quiz: {
        questions: 22,
        passingScore: 80,
        timeLimit: "35 minutes"
      }
    },
    "bridge-loans": {
      title: "Bridge Financing",
      description: "Short-term financing solutions, bridge loan structuring, and interim financing strategies for businesses.",
      status: "locked",
      progress: 0,
      duration: "4.5 hours",
      lessons: 9,
      videos: [],
      resources: [],
      quiz: {
        questions: 18,
        passingScore: 80,
        timeLimit: "30 minutes"
      }
    },
    "alternative-finance": {
      title: "Alternative Finance",
      description: "Non-traditional financing options including factoring, merchant cash advances, and innovative funding solutions.",
      status: "locked",
      progress: 0,
      duration: "4 hours",
      lessons: 8,
      videos: [],
      resources: [],
      quiz: {
        questions: 20,
        passingScore: 80,
        timeLimit: "35 minutes"
      }
    },
    "credit-risk": {
      title: "Credit Analysis",
      description: "Advanced credit analysis techniques, risk assessment models, and portfolio management strategies.",
      status: "locked",
      progress: 0,
      duration: "6.5 hours",
      lessons: 14,
      videos: [],
      resources: [],
      quiz: {
        questions: 30,
        passingScore: 85,
        timeLimit: "50 minutes"
      }
    },
    "regulatory-compliance": {
      title: "Compliance",
      description: "Financial regulations, compliance requirements, and regulatory frameworks affecting business lending.",
      status: "locked",
      progress: 0,
      duration: "5 hours",
      lessons: 10,
      videos: [],
      resources: [],
      quiz: {
        questions: 25,
        passingScore: 85,
        timeLimit: "40 minutes"
      }
    }
  };

  const module = moduleData[moduleId || ""];
  
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
            <div className="text-2xl font-bold">{module.videos.length}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{module.quiz.questions}</div>
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
            {module.videos.length > 0 ? (
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
              {module.resources.length > 0 ? (
                <div className="space-y-4">
                  {module.resources.map((resource: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.type} • {resource.size}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => {
                        // Simulate download
                        const link = document.createElement('a');
                        link.href = '#';
                        link.download = resource.title;
                        link.click();
                      }}>Download</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Resources Available</h3>
                  <p className="text-muted-foreground">Resources for this module will be available soon.</p>
                </div>
              )}
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
                    <div className="text-2xl font-bold text-primary">{module.quiz.questions}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{module.quiz.passingScore}%</div>
                    <div className="text-sm text-muted-foreground">Passing Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{module.quiz.timeLimit}</div>
                    <div className="text-sm text-muted-foreground">Time Limit</div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  disabled={module.status === "available"}
                  onClick={() => {
                    if (module.status !== "available") {
                      alert(`Quiz functionality coming soon! This would start the ${module.quiz.questions}-question quiz.`);
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