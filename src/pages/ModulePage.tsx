import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Play, CheckCircle, BookOpen, Award, FileText, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseData } from "@/data/courseData";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lessons");
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<{
    id: number;
    title: string;
    description: string;
    difficulty: string;
    duration: string;
  } | null>(null);

  console.log('=== MODULE PAGE DEBUG ===');
  console.log('Requested moduleId:', moduleId);
  console.log('Available modules:', courseData.modules?.map(m => ({ id: m.id, title: m.title })));
  console.log('courseData structure:', {
    totalModules: courseData.modules?.length,
    hasModules: !!courseData.modules,
    isArray: Array.isArray(courseData.modules)
  });

  // Find module with proper error handling
  let courseModule;
  try {
    courseModule = courseData.modules?.find(m => m?.id === moduleId);
    console.log('Found module:', courseModule ? courseModule.title : 'NOT FOUND');
    
    if (courseModule) {
      console.log('Module details:', {
        title: courseModule.title,
        hasVideos: !!courseModule.videos,
        videosLength: courseModule.videos?.length,
        videosIsArray: Array.isArray(courseModule.videos),
        hasCaseStudies: !!courseModule.caseStudies,
        caseStudiesLength: courseModule.caseStudies?.length,
        hasScripts: !!courseModule.scripts,
        scriptsLength: courseModule.scripts?.length
      });
    }
  } catch (error) {
    console.error('Error finding module:', error);
    courseModule = null;
  }

  // Get next module for progression
  const getNextModule = () => {
    try {
      const currentIndex = courseData.modules?.findIndex(m => m?.id === moduleId) ?? -1;
      return currentIndex !== -1 && currentIndex < (courseData.modules?.length ?? 0) - 1 
        ? courseData.modules?.[currentIndex + 1]
        : null;
    } catch (error) {
      console.error('Error getting next module:', error);
      return null;
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed) {
      const nextModule = getNextModule();
      if (nextModule) {
        setTimeout(() => {
          toast({
            title: "🚀 Ready for the Next Challenge!",
            description: `Your next module "${nextModule.title}" is now available. Click to continue your learning journey!`,
            variant: "default",
            duration: 8000,
          });
        }, 2000);
      } else {
        setTimeout(() => {
          toast({
            title: "🏆 Course Complete!",
            description: "Congratulations! You've completed all modules in this course. You're now a certified expert!",
            variant: "default",
            duration: 8000,
          });
        }, 2000);
      }
    }
  };

  // Module not found error handling
  if (!courseModule) {
    console.log('Module not found - showing error page');
    return (
      <div className="container mx-auto p-6 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Module Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The requested module "{moduleId}" could not be found.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Available Modules:</h2>
          <div className="grid gap-3">
            {(courseData.modules || []).map((mod) => (
              <Card key={mod?.id || 'unknown'} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{mod?.title || 'Unknown Title'}</h3>
                    <p className="text-sm text-muted-foreground">ID: {mod?.id || 'unknown'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/module/${mod?.id}`)}
                    disabled={!mod?.id}
                  >
                    Go to Module
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
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

  // Show locked content only to non-admin users
  if (courseModule.status === "locked" && !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{courseModule.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              This module is currently locked. Please complete the prerequisite modules to access this content.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderVideosTab = () => {
    console.log('Rendering videos tab for module:', courseModule.title);
    console.log('Videos data:', courseModule.videos);
    
    if (!courseModule.videos || !Array.isArray(courseModule.videos) || courseModule.videos.length === 0) {
      console.log('No videos available');
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Videos Available</h3>
            <p className="text-muted-foreground">Videos for this module will be available soon.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {courseModule.videos.map((video, index) => {
          console.log(`Rendering video ${index}:`, video);
          
          if (!video) {
            console.error(`Video ${index} is null/undefined`);
            return (
              <Card key={`error-${index}`}>
                <CardContent className="p-4">
                  <p className="text-red-500">Error: Video data is missing</p>
                </CardContent>
              </Card>
            );
          }
          
          return (
            <VideoPlayer
              key={video.title || `video-${index}`}
              title={`${index + 1}. ${video.title || 'Untitled Video'}`}
              description={video.description || 'No description available'}
              duration={video.duration || 'Unknown duration'}
              videoType={video.videoType || 'youtube'}
              videoUrl={video.videoUrl || ''}
              youtubeId={video.youtubeId}
              className="w-full"
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{courseModule.title}</h1>
          <p className="text-muted-foreground mt-2">{courseModule.description}</p>
        </div>
        {getStatusBadge(courseModule.status)}
      </div>

      {/* Progress and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{courseModule.duration}</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{courseModule.lessons}</div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{courseModule.videos?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{courseModule.lessons}</div>
            <div className="text-sm text-muted-foreground">Quiz Questions</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {(courseModule.status === "in-progress" || courseModule.status === "completed") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Module Completion</span>
                <span className="font-medium">{courseModule.progress}%</span>
              </div>
              <Progress value={courseModule.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          {renderVideosTab()}
        </TabsContent>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Module Lessons</CardTitle>
              <CardDescription>Complete the lessons in order to progress through the module</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseModule.topics && courseModule.topics.length > 0 ? (
                courseModule.topics.map((topic, index) => (
                  <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{topic}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {Math.ceil((courseModule.lessons || 12) / courseModule.topics.length * 15)} minutes
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Lessons Available</h3>
                  <p className="text-muted-foreground">Lesson content for this module will be available soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Module Overview</CardTitle>
              <CardDescription>
                Learn the fundamentals that will prepare you for success in this module
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">What You'll Learn</h4>
                <div className="grid gap-3">
                  {courseModule.topics?.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/10">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{topic}</span>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Learning objectives will be available soon.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Module Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {courseModule.description}
                </p>
              </div>
              
              {courseModule.prerequisites && courseModule.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Prerequisites</h4>
                  <div className="space-y-2">
                    {courseModule.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        {prereq}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Additional materials to support your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Downloadable Resources
                </h4>
                <div className="grid gap-3">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">{courseModule.title} - Study Guide</h5>
                        <p className="text-sm text-muted-foreground">Comprehensive study materials and key concepts</p>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Practice Worksheets</h5>
                        <p className="text-sm text-muted-foreground">Hands-on exercises to reinforce learning</p>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Quick Reference Guide</h5>
                        <p className="text-sm text-muted-foreground">Key formulas and concepts for quick lookup</p>
                      </div>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </Card>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Additional Reading</h4>
                <div className="space-y-3">
                  <div className="p-3 border border-dashed border-muted rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      External resources and recommended reading materials will be added soon.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <ModuleQuiz
            moduleId={moduleId || 'foundations'}
            moduleTitle={courseModule.title}
            totalQuestions={courseModule.lessons || 10}
            onComplete={handleQuizComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModulePage;
