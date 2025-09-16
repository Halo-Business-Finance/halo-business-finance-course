import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Play, CheckCircle, Book, Video, FileText, Users2, BookOpen, Zap, Download } from "lucide-react";
import { LessonModal } from "@/components/LessonModal";
import { ModuleQuiz } from "@/components/ModuleQuiz";
import { FloatingNotesButton } from "@/components/notes/FloatingNotesButton";
import { NotesModal } from "@/components/notes/NotesModal";
import { QuestionModal } from "@/components/QuestionModal";
import { useNotes } from "@/contexts/NotesContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseSelection } from "@/contexts/CourseSelectionContext";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { supabase } from "@/integrations/supabase/client";

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'document' | 'interactive';
  duration: string;
  completed: boolean;
  content?: any;
  url?: string;
  order_index: number;
}

const ModulePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setSelectedCourse, setSelectedCourseForNavigation } = useCourseSelection();
  const { moduleProgress } = useCourseProgress(user?.id);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  
  // Notes context
  const { 
    isNotesModalOpen, 
    setIsNotesModalOpen, 
    setCurrentContext,
    getNotesByModule 
  } = useNotes();
  
  // Question modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  
  // Get notes count for this module
  const moduleNotesCount = moduleId ? getNotesByModule(moduleId).length : 0;
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleAndContent = async () => {
      if (!moduleId) return;
      
      console.log('Raw moduleId from URL:', moduleId);
      
      // Use the moduleId directly as it should match the database ID
      const dbModuleId = decodeURIComponent(moduleId);
      console.log('Using direct moduleId for database query:', dbModuleId);
      
      try {
        // Fetch module data using the direct module ID
        const { data: dbModule, error: moduleError } = await supabase
          .from('course_content_modules')
          .select('*')
          .eq('id', dbModuleId)
          .maybeSingle();

        if (moduleError || !dbModule) {
          console.error('Error fetching module:', moduleError);
          setLoading(false);
          return;
        }
        
        setModule(dbModule);

        // **FIX**: Update the CourseSelectionContext with the correct course
        // Fetch the course data and set it as selected so the sidebar shows the right modules
        if (dbModule.course_id) {
          console.log('Setting selected course to:', dbModule.course_id);
          
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('id, title, description')
            .eq('id', dbModule.course_id)
            .maybeSingle();

          if (courseData && !courseError) {
            setSelectedCourseForNavigation({
              id: courseData.id,
              title: courseData.title,
              description: courseData.description
            });
            console.log('Selected course set to:', courseData);
          }
        }

        // Use the course_id from the module to fetch content
        const moduleForContent = dbModule.id;
        const [videosResponse, articlesResponse, assessmentsResponse, documentsResponse] = await Promise.all([
          supabase
            .from('course_videos')
            .select('*')
            .eq('module_id', moduleForContent)
            .eq('is_active', true)
            .order('order_index'),
          
          supabase
            .from('course_articles')
            .select('*')
            .eq('module_id', moduleForContent)
            .eq('is_published', true)
            .order('order_index'),
          
          supabase
            .from('course_assessments')
            .select('*')
            .eq('module_id', moduleForContent)
            .order('order_index'),
          
          supabase
            .from('course_documents')
            .select('*')
            .eq('module_id', moduleForContent)
            .order('title')
        ]);

        // Combine all content into lessons array
        const allLessons: Lesson[] = [];

        console.log('Content fetched:', {
          videos: videosResponse.data?.length || 0,
          articles: articlesResponse.data?.length || 0,
          assessments: assessmentsResponse.data?.length || 0,
          documents: documentsResponse.data?.length || 0
        });

        // Add videos
        if (videosResponse.data && videosResponse.data.length > 0) {
          videosResponse.data.forEach(video => {
            allLessons.push({
              id: video.id,
              title: video.title,
              type: 'video',
              duration: video.duration_seconds ? `${Math.round(video.duration_seconds / 60)} min` : '15 min',
              completed: false, // TODO: Get from user progress
              content: video,
              url: video.video_url,
              order_index: video.order_index
            });
          });
        }

        // Add articles
        if (articlesResponse.data && articlesResponse.data.length > 0) {
          articlesResponse.data.forEach(article => {
            allLessons.push({
              id: article.id,
              title: article.title,
              type: 'reading',
              duration: article.reading_time_minutes ? `${article.reading_time_minutes} min` : '10 min',
              completed: false, // TODO: Get from user progress
              content: article,
              order_index: article.order_index
            });
          });
        }

        // Add assessments
        if (assessmentsResponse.data && assessmentsResponse.data.length > 0) {
          assessmentsResponse.data.forEach(assessment => {
            allLessons.push({
              id: assessment.id,
              title: assessment.title,
              type: 'quiz',
              duration: assessment.time_limit_minutes ? `${assessment.time_limit_minutes} min` : '20 min',
              completed: false, // TODO: Get from user progress
              content: assessment,
              order_index: assessment.order_index
            });
          });
        }

        // Add documents
        if (documentsResponse.data && documentsResponse.data.length > 0) {
          documentsResponse.data.forEach(document => {
            allLessons.push({
              id: document.id,
              title: document.title,
              type: 'document',
              duration: '5 min',
              completed: false,
              content: document,
              url: document.file_url,
              order_index: 0 // Documents don't have order_index, put them at the end
            });
          });
        }

        // If no content found, create demo lessons based on module topics
        if (allLessons.length === 0 && dbModule.topics && Array.isArray(dbModule.topics)) {
          console.log('No content found, creating demo lessons from topics');
          (dbModule.topics as string[]).forEach((topic: string, index: number) => {
            allLessons.push({
              id: `demo-${index}`,
              title: topic,
              type: index % 3 === 0 ? 'video' : index % 3 === 1 ? 'reading' : 'quiz',
              duration: '15 min',
              completed: false,
              content: { title: topic, description: `Learn about ${topic}` },
              order_index: index
            });
          });
        }

        // Sort by order_index
        allLessons.sort((a, b) => a.order_index - b.order_index);
        console.log('Final lessons array:', allLessons);
        setLessons(allLessons);

      } catch (error) {
        console.error('Error fetching module content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleAndContent();
  }, [moduleId, setSelectedCourse]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Loading Module...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

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


  const handleTakeNotes = () => {
    setCurrentContext(moduleId!, selectedLesson?.id);
    setIsNotesModalOpen(true);
  };

  const handleAskQuestion = () => {
    setIsQuestionModalOpen(true);
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "reading": return <FileText className="h-4 w-4" />;
      case "quiz": return <Users2 className="h-4 w-4" />;
      case "document": return <Download className="h-4 w-4" />;
      case "interactive": return <Zap className="h-4 w-4" />;
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
              <p className="text-sm text-muted-foreground">{module.duration || '45 minutes'} • {lessons.length} lessons</p>
            </div>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{module.title}</CardTitle>
                    <CardDescription className="mt-2">{module.description}</CardDescription>
                  </div>
                  {module.skill_level && module.skill_level.toLowerCase() !== "beginner" && (
                    <Badge variant={
                      module.skill_level.toLowerCase() === "expert" ? "success" : "outline"
                    }>
                      {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{moduleProgress[moduleId!]?.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={moduleProgress[moduleId!]?.progress_percentage || 0} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {module.duration || '45 minutes'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-max min-w-full grid-cols-3 sm:grid-cols-3 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Module Overview</TabsTrigger>
              <TabsTrigger value="lessons" className="text-xs sm:text-sm whitespace-nowrap">Module Lessons</TabsTrigger>
              <TabsTrigger value="assessment" className="text-xs sm:text-sm whitespace-nowrap">Module Assessment</TabsTrigger>
            </TabsList>
          </div>

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

          <TabsContent value="lessons" className="space-y-4">
                {lessons.length > 0 ? (
                  <div className="grid gap-4">
                    {lessons.map((lesson, index) => (
                      <Card key={index} className="group hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
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
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {lesson.completed && (
                                <Badge variant="success" className="text-xs whitespace-nowrap">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Completed</span>
                                  <span className="sm:hidden">Done</span>
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                className="h-8 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
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
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="space-y-4">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No Lessons Available</h3>
                          <p className="text-muted-foreground">
                            This module doesn't have any lessons yet. Content will be added soon.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="assessment" className="space-y-6">
                <ModuleQuiz
                  moduleId={module.id}
                  moduleTitle={module.title}
                  courseId={module.course_id}
                  onQuizComplete={(passed) => {
                    if (passed) {
                      toast({
                        title: "🎉 Module Quiz Passed!",
                        description: "You can now proceed to the next module in your learning path.",
                      });
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">Module Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{module.duration || '45 minutes'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Lessons</span>
                  <span className="text-sm font-medium">{module.lessons_count || 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {(() => {
                      const progress = moduleProgress[moduleId!]?.progress_percentage || 0;
                      if (progress === 100) return "Completed";
                      if (progress > 0) return "In Progress";
                      return "Available";
                    })()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleTakeNotes}
                >
                  <Book className="h-4 w-4 mr-2" />
                  My Notes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleAskQuestion}
                >
                  <Users2 className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Notes Button - always visible during module viewing */}
      <FloatingNotesButton moduleId={moduleId} />
      
      {/* Notes Modal */}
      <NotesModal 
        isOpen={isNotesModalOpen} 
        onClose={() => setIsNotesModalOpen(false)}
        moduleTitle={module.title}
      />

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        moduleTitle={module.title}
        moduleId={moduleId}
      />

      {selectedLesson && (
        <LessonModal
          isOpen={isLessonModalOpen}
          onClose={() => {
            setIsLessonModalOpen(false);
            setSelectedLesson(null);
          }}
          lesson={selectedLesson}
          moduleTitle={module.title}
          moduleId={moduleId}
        />
      )}
    </div>
  );
};

export default ModulePage;
