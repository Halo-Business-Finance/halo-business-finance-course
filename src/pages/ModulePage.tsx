import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Play, CheckCircle, BookOpen, Award, FileText, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseData } from "@/data/courseData";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EnhancedVideoPlayer } from "@/components/EnhancedVideoPlayer";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { EnhancedQuiz, QuizQuestion } from "@/components/EnhancedQuiz";
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
            <EnhancedVideoPlayer
              key={video.title || `video-${index}`}
              title={`${index + 1}. ${video.title || 'Untitled Video'}`}
              description={video.description || 'No description available'}
              duration={video.duration || 'Unknown duration'}
              videoType={video.videoType || 'youtube'}
              videoUrl={video.videoUrl || ''}
              youtubeId={video.youtubeId}
              moduleId={moduleId}
              className="w-full mb-6"
              onProgress={(progress) => console.log(`Video progress: ${progress}%`)}
              onComplete={() => console.log('Video completed')}
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
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Module Overview</CardTitle>
                <CardDescription>
                  Learn the fundamentals that will prepare you for success in this module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">What You'll Learn</h4>
                  <div className="grid gap-3">
                    {courseModule.topics?.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors">
                        <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{topic}</span>
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
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h5 className="font-semibold text-primary mb-2">Difficulty Level</h5>
                    <p className="text-sm text-muted-foreground">
                      {moduleId === 'foundations' ? 'Beginner to Intermediate' : 'Intermediate to Advanced'}
                    </p>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <h5 className="font-semibold text-accent mb-2">Estimated Time</h5>
                    <p className="text-sm text-muted-foreground">{courseModule.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Case Studies Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Studies & Real Examples
                </CardTitle>
                <CardDescription>
                  Learn from real-world scenarios and practical applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {courseModule.caseStudies?.slice(0, 2).map((caseStudy, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                         onClick={() => setSelectedCaseStudy({
                           id: index,
                           title: caseStudy.title,
                           description: caseStudy.situation,
                           difficulty: 'Intermediate',
                           duration: '15-20 min'
                         })}>
                      <h5 className="font-medium mb-2">{caseStudy.title}</h5>
                      <p className="text-sm text-muted-foreground mb-3">{caseStudy.company}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{caseStudy.situation}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">Case Study</Badge>
                        <span className="text-xs text-muted-foreground">Click to explore</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">Case studies will be available soon.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Learning Path</CardTitle>
                <CardDescription>
                  Follow this sequence for optimal learning outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h5 className="font-medium">Watch Introduction Videos</h5>
                      <p className="text-sm text-muted-foreground">Start with overview and foundational concepts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-accent/5 rounded-lg">
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h5 className="font-medium">Review Case Studies</h5>
                      <p className="text-sm text-muted-foreground">Apply concepts to real-world scenarios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h5 className="font-medium">Complete Practice Quiz</h5>
                      <p className="text-sm text-muted-foreground">Test your understanding and knowledge retention</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-accent/5 rounded-lg">
                    <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <h5 className="font-medium">Explore Additional Resources</h5>
                      <p className="text-sm text-muted-foreground">Deepen knowledge with supplementary materials</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <div className="space-y-6">
            {/* Downloadable Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Downloadable Resources
                </CardTitle>
                <CardDescription>
                  Essential materials to support your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{courseModule.title} - Complete Study Guide</h5>
                        <p className="text-sm text-muted-foreground mb-2">Comprehensive 45-page guide covering all module concepts with examples</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>📄 45 pages</span>
                          <span>⏱️ 2-3 hours read</span>
                          <span>🎯 All skill levels</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">PDF</Badge>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">Interactive Practice Worksheets</h5>
                        <p className="text-sm text-muted-foreground mb-2">Hands-on exercises with real business scenarios and financial calculations</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>📊 12 exercises</span>
                          <span>⏱️ 3-4 hours practice</span>
                          <span>💡 With solutions</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">Excel</Badge>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">Quick Reference Cheat Sheet</h5>
                        <p className="text-sm text-muted-foreground mb-2">Key formulas, ratios, and decision frameworks for quick lookup</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>📋 2 pages</span>
                          <span>🎯 Essential formulas</span>
                          <span>🖨️ Print-friendly</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">PDF</Badge>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">Case Study Templates</h5>
                        <p className="text-sm text-muted-foreground mb-2">Structured templates for analyzing business finance scenarios</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>📝 5 templates</span>
                          <span>🏗️ Analysis framework</span>
                          <span>📈 Decision tools</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">Word</Badge>
                        <Button size="sm" variant="outline">Download</Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Video Transcripts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Video Transcripts & Notes
                </CardTitle>
                <CardDescription>
                  Written content from all module videos for easy review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {courseModule.videos?.map((video, index) => (
                    <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">{video.title} - Transcript</h5>
                          <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>⏱️ {video.duration}</span>
                            <span>📝 Full transcript</span>
                            <span>🔍 Searchable</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline">PDF</Badge>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-4">Video transcripts will be available soon.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* External Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recommended Reading & External Resources
                </CardTitle>
                <CardDescription>
                  Curated external materials to deepen your understanding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">Financial Statement Analysis - CFA Institute</h5>
                          <p className="text-sm text-muted-foreground mb-2">Comprehensive guide to financial statement analysis techniques</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Article</Badge>
                            <Badge variant="outline" className="text-xs">15 min read</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 ml-1" />
                          Open
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">Working Capital Management Best Practices</h5>
                          <p className="text-sm text-muted-foreground mb-2">Harvard Business Review article on optimizing working capital</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">HBR Article</Badge>
                            <Badge variant="outline" className="text-xs">20 min read</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 ml-1" />
                          Open
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium mb-1">Interactive Financial Calculator</h5>
                          <p className="text-sm text-muted-foreground mb-2">Online tool for NPV, IRR, and other financial calculations</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Tool</Badge>
                            <Badge variant="outline" className="text-xs">Interactive</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <ArrowRight className="h-4 w-4 ml-1" />
                          Launch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Study Tips & Strategies
                </CardTitle>
                <CardDescription>
                  Maximize your learning effectiveness with these proven techniques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h5 className="font-semibold text-primary mb-2">📚 Active Learning</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Take notes while watching videos</li>
                      <li>• Practice calculations by hand</li>
                      <li>• Discuss concepts with colleagues</li>
                      <li>• Apply concepts to your work scenarios</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <h5 className="font-semibold text-accent mb-2">🔄 Spaced Repetition</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Review material after 1 day</li>
                      <li>• Review again after 3 days</li>
                      <li>• Final review after 1 week</li>
                      <li>• Use flashcards for key formulas</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h5 className="font-semibold text-primary mb-2">🎯 Focus Techniques</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Study in 25-minute blocks</li>
                      <li>• Eliminate distractions</li>
                      <li>• Take regular breaks</li>
                      <li>• Set specific learning goals</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <h5 className="font-semibold text-accent mb-2">💡 Knowledge Application</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Work through all case studies</li>
                      <li>• Create your own examples</li>
                      <li>• Teach concepts to others</li>
                      <li>• Connect to real business situations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <div className="space-y-6">
            {/* Quiz Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Module Assessment Quiz
                </CardTitle>
                <CardDescription>
                  Test your understanding of {courseModule.title} concepts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">15</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20 text-center">
                    <div className="text-2xl font-bold text-accent mb-1">25</div>
                    <div className="text-sm text-muted-foreground">Minutes</div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">70%</div>
                    <div className="text-sm text-muted-foreground">Pass Score</div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <h5 className="font-semibold">Quiz Features:</h5>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Multiple choice and scenario-based questions
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Immediate feedback with explanations
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Hints available for challenging questions
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      Review mode after completion
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quiz Component */}
            <EnhancedQuiz
              moduleId={moduleId || 'foundations'}
              moduleTitle={courseModule.title}
              questions={[
                {
                  id: '1',
                  type: 'multiple-choice',
                  question: 'What is the primary purpose of financial analysis in business lending?',
                  options: [
                    'To increase company profits automatically',
                    'To evaluate financial performance and make informed lending decisions',
                    'To satisfy regulatory requirements only',
                    'To impress potential investors'
                  ],
                  correctAnswers: ['To evaluate financial performance and make informed lending decisions'],
                  explanation: 'Financial analysis helps lenders and stakeholders understand a company\'s financial health, creditworthiness, and ability to service debt, enabling informed business and lending decisions.',
                  points: 10,
                  difficulty: 'medium'
                },
                {
                  id: '2',
                  type: 'multiple-choice',
                  question: 'Which ratio is most important for assessing a company\'s ability to service debt?',
                  options: [
                    'Current Ratio',
                    'Debt Service Coverage Ratio (DSCR)',
                    'Inventory Turnover Ratio',
                    'Gross Profit Margin'
                  ],
                  correctAnswers: ['Debt Service Coverage Ratio (DSCR)'],
                  explanation: 'The Debt Service Coverage Ratio measures a company\'s ability to pay its debt obligations from operating income. A DSCR above 1.25 typically indicates strong debt service capacity.',
                  points: 15,
                  difficulty: 'medium'
                },
                {
                  id: '3',
                  type: 'multiple-choice',
                  question: 'In working capital analysis, which component is typically the most liquid?',
                  options: [
                    'Inventory',
                    'Accounts Receivable',
                    'Cash and Cash Equivalents',
                    'Prepaid Expenses'
                  ],
                  correctAnswers: ['Cash and Cash Equivalents'],
                  explanation: 'Cash and cash equivalents are the most liquid assets as they can be immediately used to meet obligations without conversion or collection delays.',
                  points: 10,
                  difficulty: 'easy'
                },
                {
                  id: '4',
                  type: 'multiple-select',
                  question: 'Which factors should be considered when analyzing seasonal businesses for lending? (Select all that apply)',
                  options: [
                    'Historical seasonal patterns',
                    'Cash flow timing and peaks',
                    'Inventory buildup requirements',
                    'Only the current month\'s performance',
                    'Off-season expense management'
                  ],
                  correctAnswers: ['Historical seasonal patterns', 'Cash flow timing and peaks', 'Inventory buildup requirements', 'Off-season expense management'],
                  explanation: 'Seasonal businesses require comprehensive analysis including historical patterns, cash flow timing, inventory needs, and off-season management. Current month analysis alone is insufficient.',
                  points: 20,
                  difficulty: 'hard'
                },
                {
                  id: '5',
                  type: 'multiple-choice',
                  question: 'What is the primary benefit of calculating Net Present Value (NPV) for business investments?',
                  options: [
                    'To determine the payback period',
                    'To account for the time value of money in investment decisions',
                    'To calculate the internal rate of return',
                    'To estimate future cash flows'
                  ],
                  correctAnswers: ['To account for the time value of money in investment decisions'],
                  explanation: 'NPV accounts for the time value of money by discounting future cash flows to present value, helping determine if an investment will add value to the business.',
                  points: 15,
                  difficulty: 'medium'
                },
                {
                  id: '6',
                  type: 'scenario',
                  question: 'TechStart Inc. has the following financial information:\n- Annual Revenue: $500,000\n- Operating Expenses: $350,000\n- Current Debt Payments: $120,000\n\nWhat is their Debt Service Coverage Ratio, and what does this indicate?',
                  options: [
                    'DSCR = 1.25; Strong debt service capacity',
                    'DSCR = 1.43; Excellent debt service capacity', 
                    'DSCR = 0.83; Poor debt service capacity',
                    'DSCR = 2.86; Excessive cash flow'
                  ],
                  correctAnswers: ['DSCR = 1.25; Strong debt service capacity'],
                  explanation: 'DSCR = Net Operating Income / Debt Service = ($500,000 - $350,000) / $120,000 = $150,000 / $120,000 = 1.25. This indicates adequate debt service capacity, meeting typical lending requirements.',
                  points: 20,
                  difficulty: 'hard'
                }
              ] as QuizQuestion[]}
              timeLimit={25}
              passingScore={70}
              maxAttempts={3}
              onComplete={handleQuizComplete}
              showHints={true}
              allowReview={true}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Case Study Modal */}
      {selectedCaseStudy && (
        <CaseStudyModal
          isOpen={!!selectedCaseStudy}
          caseStudy={selectedCaseStudy}
          onClose={() => setSelectedCaseStudy(null)}
        />
      )}
    </div>
  );
};

export default ModulePage;
