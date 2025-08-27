import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Play, CheckCircle, Book, Video, FileText, Users2, BookOpen } from "lucide-react";
import { courseData } from "@/data/courseData";
import { LessonModal } from "@/components/LessonModal";
import { useToast } from "@/hooks/use-toast";

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  const module = courseData.modules.find(m => m.id === moduleId);

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Module Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested module could not be found.</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLessonStart = (lesson: any) => {
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleLessonComplete = () => {
    setIsLessonModalOpen(false);
    setSelectedLesson(null);
    toast({
      title: "🎉 Lesson Completed!",
      description: "Great job! You can now move on to the next lesson.",
      variant: "default",
    });
  };

  const lessons = [
    {
      title: "Introduction & Overview",
      type: "video",
      duration: "15 min",
      completed: module.status === "completed" || module.progress > 0
    },
    {
      title: "Core Concepts",
      type: "reading",
      duration: "20 min", 
      completed: module.status === "completed" || module.progress > 25
    },
    {
      title: "Case Study Analysis",
      type: "assignment",
      duration: "30 min",
      completed: module.status === "completed" || module.progress > 50
    },
    {
      title: "Interactive Quiz",
      type: "quiz",
      duration: "10 min",
      completed: module.status === "completed" || module.progress > 75
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "reading": return <FileText className="h-4 w-4" />;
      case "assignment": return <BookOpen className="h-4 w-4" />;
      case "quiz": return <Users2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold">{module.title}</h1>
              <p className="text-sm text-muted-foreground">{module.duration} • {module.lessons} lessons</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{module.title}</CardTitle>
                    <CardDescription className="mt-2">{module.description}</CardDescription>
                  </div>
                  <Badge variant={
                    module.status === "completed" ? "success" : 
                    module.status === "in-progress" ? "default" : "outline"
                  }>
                    {module.status === "completed" ? "Completed" : 
                     module.status === "in-progress" ? "In Progress" : "Available"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {module.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="lessons" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="space-y-4">
                <div className="grid gap-4">
                  {lessons.map((lesson, index) => (
                    <Card key={index} className="group hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              lesson.completed ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
                            }`}>
                              {lesson.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                getTypeIcon(lesson.type)
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{lesson.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.completed && (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              className="h-8 px-4"
                              onClick={() => handleLessonStart(lesson)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              {lesson.completed ? "Review" : "Start"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Module Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Learning Objectives</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Understand the core concepts and principles</li>
                        <li>• Apply knowledge through practical exercises</li>
                        <li>• Analyze real-world case studies</li>
                        <li>• Demonstrate mastery through assessments</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Prerequisites</h4>
                      <p className="text-sm text-muted-foreground">
                        Basic understanding of business concepts and financial principles.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Module Handbook</h4>
                          <p className="text-sm text-muted-foreground">Comprehensive guide and reference material</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Video className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Supplementary Videos</h4>
                          <p className="text-sm text-muted-foreground">Additional video content and tutorials</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Book className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">Reading List</h4>
                          <p className="text-sm text-muted-foreground">Recommended books and articles</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assessment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Assessment Criteria</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Quiz completion with 80% or higher score</li>
                        <li>• Case study analysis submission</li>
                        <li>• Participation in discussions</li>
                        <li>• Completion of all lesson materials</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Grading Scale</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>90-100%: Excellent</div>
                        <div>80-89%: Good</div>
                        <div>70-79%: Satisfactory</div>
                        <div>Below 70%: Needs Improvement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Discussion Forum</CardTitle>
                    <CardDescription>Connect with other learners and instructors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Discussion forum coming soon!</p>
                      <p className="text-sm">Connect with fellow learners and share insights.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{module.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="text-sm font-medium">{module.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{module.progress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={
                    module.status === "completed" ? "success" : 
                    module.status === "in-progress" ? "default" : "outline"
                  } className="text-xs">
                    {module.status === "completed" ? "Completed" : 
                     module.status === "in-progress" ? "In Progress" : "Available"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Materials
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Book className="h-4 w-4 mr-2" />
                  Take Notes
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users2 className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {selectedLesson && (
        <LessonModal
          isOpen={isLessonModalOpen}
          onClose={() => setIsLessonModalOpen(false)}
          lesson={selectedLesson}
          moduleTitle={module.title}
        />
      )}
    </div>
  );
};

export default ModulePage;
