import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Clock, Play, CheckCircle, BookOpen, Award, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courseData } from "@/data/courseData";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useState } from "react";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdminRole();
  const [activeTab, setActiveTab] = useState("lessons");

  const module = courseData.modules.find(m => m.id === moduleId);
  
  // Add debugging and better error handling
  if (!module) {
    const availableModules = courseData.modules.map(m => ({ id: m.id, title: m.title }));
    console.log('Available modules:', availableModules);
    console.log('Requested moduleId:', moduleId);
    
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
            {courseData.modules.map((mod) => (
              <Card key={mod.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <h3 className="font-medium">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">ID: {mod.id}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/module/${mod.id}`)}
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
  if (module.status === "locked" && !isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{module.title}</CardTitle>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <Card>
            <CardHeader>
              <CardTitle>Module Lessons</CardTitle>
              <CardDescription>Complete the lessons in order to progress through the module</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const lessons = [
                    {
                      title: "Introduction & Overview",
                      type: "overview",
                      duration: "15 min",
                      completed: module.status === "completed" || module.progress > 0,
                      locked: false,
                      description: "Get an overview of the module content and learning objectives"
                    },
                    {
                      title: "Core Concepts",
                      type: "reading",
                      duration: "20 min", 
                      completed: module.status === "completed" || module.progress > 25,
                      locked: false, // Always accessible after introduction
                      description: "Learn the fundamental concepts and terminology"
                    },
                    {
                      title: "Case Study Analysis",
                      type: "assignment",
                      duration: "30 min",
                      completed: module.status === "completed" || module.progress > 50,
                      locked: false, // Make accessible to encourage engagement
                      description: "Apply your knowledge to real-world scenarios"
                    },
                    {
                      title: "Interactive Quiz",
                      type: "quiz",
                      duration: "10 min",
                      completed: module.status === "completed" || module.progress > 75,
                      locked: module.progress < 25 && module.status !== "completed", // Only lock if no progress made
                      description: "Test your understanding of the module material"
                    }
                  ];

                  const getTypeIcon = (type: string) => {
                    switch (type) {
                      case "overview": return <BookOpen className="h-4 w-4" />;
                      case "video": return <Play className="h-4 w-4" />;
                      case "reading": return <FileText className="h-4 w-4" />;
                      case "assignment": return <BookOpen className="h-4 w-4" />;
                      case "quiz": return <Award className="h-4 w-4" />;
                      default: return <BookOpen className="h-4 w-4" />;
                    }
                  };

                  const handleLessonClick = (lesson: any, index: number) => {
                    if (lesson.locked) {
                      alert("Complete the previous lesson to unlock this one!");
                      return;
                    }
                    
                    // Navigate to the appropriate content based on lesson type
                    switch (lesson.type) {
                      case "overview":
                        // Switch to overview tab for introduction content
                        setActiveTab("overview");
                        break;
                      case "video":
                        // Switch to videos tab to show relevant video content
                        setActiveTab("videos");
                        break;
                      case "reading":
                        // Switch to overview tab for reading content
                        setActiveTab("overview");
                        break;
                      case "assignment":
                        // Could navigate to a separate assignment page in the future
                        alert(`Opening assignment: ${lesson.title}`);
                        break;
                      case "quiz":
                        // Switch to quiz tab
                        setActiveTab("quiz");
                        break;
                      default:
                        setActiveTab("overview");
                    }
                  };

                  return lessons.map((lesson, index) => (
                    <div
                      key={index}
                      onClick={() => handleLessonClick(lesson, index)}
                      className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                        lesson.locked 
                          ? "bg-muted/10 opacity-50 cursor-not-allowed" 
                          : lesson.completed 
                          ? "bg-accent/10 hover:bg-accent/15" 
                          : "bg-muted/20 hover:bg-muted/30"
                      }`}
                    >
                      <div className={`${
                        lesson.locked 
                          ? "text-muted-foreground" 
                          : lesson.completed 
                          ? "text-accent" 
                          : "text-primary"
                      }`}>
                        {lesson.locked ? (
                          <Lock className="h-5 w-5" />
                        ) : lesson.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          getTypeIcon(lesson.type)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm text-muted-foreground">{lesson.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{lesson.duration}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {lesson.completed && (
                          <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                            Complete
                          </Badge>
                        )}
                        {lesson.locked && (
                          <Badge variant="outline" className="text-xs opacity-60">
                            Locked
                          </Badge>
                        )}
                        {!lesson.locked && !lesson.completed && (
                          <Badge variant="outline" className="text-xs">
                            Start
                          </Badge>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Module Overview
              </CardTitle>
              <CardDescription>What you'll learn in this module and how it applies to your role at Halo Business Finance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-6 leading-relaxed">{module.description}</p>
              </div>
              
              {/* Learning Objectives */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  Learning Objectives
                </h3>
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-medium text-primary mb-2">Financial Analysis Mastery</h4>
                    <p className="text-sm text-muted-foreground">Master Halo's proprietary financial statement analysis framework to accurately assess business creditworthiness, identify red flags, and make informed lending decisions using industry-standard ratios and metrics.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-accent">
                    <h4 className="font-medium text-accent mb-2">Risk Assessment & Management</h4>
                    <p className="text-sm text-muted-foreground">Apply Halo's risk evaluation methodologies to analyze borrower profiles, assess collateral values, and structure loan terms that balance growth opportunities with prudent risk management.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-medium text-primary mb-2">Commercial Lending Fundamentals</h4>
                    <p className="text-sm text-muted-foreground">Understand the commercial lending landscape, loan products, underwriting criteria, and regulatory requirements that govern business finance decisions at Halo.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-accent">
                    <h4 className="font-medium text-accent mb-2">Client Relationship Excellence</h4>
                    <p className="text-sm text-muted-foreground">Develop skills in client communication, needs assessment, and solution presentation using Halo's customer-first approach to build lasting business relationships.</p>
                  </div>
                </div>
              </div>

              {/* Key Topics Covered */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Key Topics Covered
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {module.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-background border">
                      <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-sm font-medium">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Expected Outcomes
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Proficiency in Financial Analysis</p>
                      <p className="text-xs text-muted-foreground">Analyze financial statements with confidence and accuracy using Halo's proven methodologies</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-accent">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Enhanced Decision Making</p>
                      <p className="text-xs text-muted-foreground">Make informed lending decisions by effectively weighing risk factors and growth opportunities</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Professional Communication Skills</p>
                      <p className="text-xs text-muted-foreground">Communicate complex financial concepts clearly to clients and internal stakeholders</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-accent">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Regulatory Compliance Understanding</p>
                      <p className="text-xs text-muted-foreground">Navigate regulatory requirements and ensure all lending activities meet compliance standards</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Prerequisites & Recommendations */}
              <div>
                <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Getting Started
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <h4 className="font-medium text-accent mb-2">Prerequisites</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Basic understanding of financial statements</li>
                      <li>• High school mathematics proficiency</li>
                      <li>• Commitment to complete all module components</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Recommended Approach</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Complete lessons in sequential order</li>
                      <li>• Take notes during video content</li>
                      <li>• Practice with provided case studies</li>
                      <li>• Review materials before taking quiz</li>
                    </ul>
                  </div>
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
              <div className="space-y-6">
                {/* Study Materials */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Study Materials
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{module.title} - Study Guide</p>
                          <p className="text-sm text-muted-foreground">Comprehensive overview and key concepts (PDF, 2.3 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Key Terms & Definitions</p>
                          <p className="text-sm text-muted-foreground">Glossary of important terminology (PDF, 0.8 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Templates & Tools */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-accent" />
                    Templates & Tools
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Financial Analysis Spreadsheet</p>
                          <p className="text-sm text-muted-foreground">Excel template for ratio calculations (XLSX, 1.2 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Loan Application Checklist</p>
                          <p className="text-sm text-muted-foreground">Step-by-step checklist for loan processing (PDF, 0.5 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium">Case Study Worksheet</p>
                          <p className="text-sm text-muted-foreground">Practice exercises and solutions (PDF, 1.5 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Resources */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Additional Resources
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Industry Best Practices Guide</p>
                          <p className="text-sm text-muted-foreground">Current standards and procedures (PDF, 3.1 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">Regulatory Updates Summary</p>
                          <p className="text-sm text-muted-foreground">Latest regulatory changes and compliance notes (PDF, 1.8 MB)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 ml-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="bg-muted/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Access</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      All Resources
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      Study Guides Only
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      Templates Only
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <ModuleQuiz 
            moduleId={module.id}
            moduleTitle={module.title}
            totalQuestions={module.lessons}
          />
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