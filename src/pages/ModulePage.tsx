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
  const {
    moduleId
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    setSelectedCourse,
    setSelectedCourseForNavigation
  } = useCourseSelection();
  const {
    moduleProgress
  } = useCourseProgress(user?.id);
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
        const {
          data: dbModule,
          error: moduleError
        } = await supabase.from('course_content_modules').select('*').eq('id', dbModuleId).maybeSingle();
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
          const {
            data: courseData,
            error: courseError
          } = await supabase.from('courses').select('id, title, description').eq('id', dbModule.course_id).maybeSingle();
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
        const [videosResponse, articlesResponse, assessmentsResponse, documentsResponse] = await Promise.all([supabase.from('course_videos').select('*').eq('module_id', moduleForContent).eq('is_active', true).order('order_index'), supabase.from('course_articles').select('*').eq('module_id', moduleForContent).eq('is_published', true).order('order_index'), supabase.from('course_assessments').select('*').eq('module_id', moduleForContent).order('order_index'), supabase.from('course_documents').select('*').eq('module_id', moduleForContent).order('title')]);

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
              completed: false,
              // TODO: Get from user progress
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
              completed: false,
              // TODO: Get from user progress
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
              completed: false,
              // TODO: Get from user progress
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
              content: {
                title: topic,
                description: `Learn about ${topic}`
              },
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
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Loading Module...</h2>
          </CardContent>
        </Card>
      </div>;
  }
  if (!module) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
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
      </div>;
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
      case "video":
        return <Video className="h-4 w-4 bg-white" />;
      case "reading":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <Users2 className="h-4 w-4" />;
      case "document":
        return <Download className="h-4 w-4" />;
      case "interactive":
        return <Zap className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  // Helper functions for module-specific content
  const getModuleType = (module: any) => {
    const title = module.title.toLowerCase();
    if (title.includes('sba 7(a)')) return 'sba-7a';
    if (title.includes('sba express')) return 'sba-express';
    if (title.includes('sba 504')) return 'sba-504';
    if (title.includes('invoice factoring')) return 'invoice-factoring';
    if (title.includes('equipment financing')) return 'equipment-financing';
    if (title.includes('commercial real estate')) return 'commercial-real-estate';
    if (title.includes('asset-based lending')) return 'asset-based-lending';
    if (title.includes('construction loan')) return 'construction-loans';
    if (title.includes('franchise financing')) return 'franchise-financing';
    if (title.includes('working capital')) return 'working-capital';
    if (title.includes('healthcare financing')) return 'healthcare-financing';
    if (title.includes('restaurant financing')) return 'restaurant-financing';
    if (title.includes('merchant cash')) return 'merchant-cash-advances';
    if (title.includes('lines of credit')) return 'lines-of-credit';
    return 'general';
  };
  const getModuleSpecificContent = (module: any) => {
    const moduleType = getModuleType(module);
    const isExpert = module.title.toLowerCase().includes('expert');
    const content = {
      'sba-7a': {
        title: 'SBA 7(a) Loan Program',
        description: 'Master the most popular SBA loan program with up to $5 million in financing for small businesses.',
        focus: isExpert ? 'Advanced underwriting, portfolio management, and complex deal structuring' : 'Program basics, eligibility requirements, and application processes'
      },
      'sba-express': {
        title: 'SBA Express Loans',
        description: 'Fast-track SBA financing with streamlined approval processes and reduced documentation.',
        focus: isExpert ? 'Portfolio optimization and risk management strategies' : 'Quick approval processes and basic eligibility criteria'
      },
      'sba-504': {
        title: 'SBA 504 Commercial Real Estate',
        description: 'Long-term, fixed-rate financing for commercial real estate and equipment purchases.',
        focus: isExpert ? 'Complex project management and portfolio strategies' : 'Program structure and basic property evaluation'
      },
      'invoice-factoring': {
        title: 'Invoice Factoring & Accounts Receivable Financing',
        description: 'Convert outstanding invoices into immediate working capital through factoring arrangements.',
        focus: isExpert ? 'Advanced portfolio management and innovative factoring structures' : 'Basic factoring concepts and client evaluation'
      },
      'equipment-financing': {
        title: 'Equipment Financing Solutions',
        description: 'Specialized financing for business equipment, machinery, and technology purchases.',
        focus: isExpert ? 'Complex equipment portfolios and innovative financing structures' : 'Basic equipment valuation and financing options'
      },
      'commercial-real-estate': {
        title: 'Commercial Real Estate Financing',
        description: 'Comprehensive financing solutions for commercial property acquisitions and development.',
        focus: isExpert ? 'Complex deal structuring and portfolio optimization' : 'Property analysis fundamentals and loan basics'
      },
      'general': {
        title: 'Commercial Finance Fundamentals',
        description: 'Essential knowledge and skills for commercial lending professionals.',
        focus: isExpert ? 'Advanced strategies and portfolio management' : 'Core concepts and foundational principles'
      }
    };
    const moduleContent = content[moduleType] || content.general;
    return <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h5 className="font-medium mb-2 text-black">{moduleContent.title}</h5>
        <p className="text-sm mb-2 text-black">{moduleContent.description}</p>
        <p className="text-xs font-medium text-black">Focus: {moduleContent.focus}</p>
      </div>;
  };
  const getModuleLearningObjectives = (module: any) => {
    const moduleType = getModuleType(module);
    const isExpert = module.title.toLowerCase().includes('expert');
    const objectives = {
      'sba-7a': isExpert ? ['Master advanced SBA 7(a) underwriting techniques and risk assessment', 'Develop expertise in complex deal structuring and portfolio optimization', 'Implement advanced compliance and regulatory strategies', 'Execute sophisticated client relationship management approaches'] : ['Understand SBA 7(a) program structure and eligibility requirements', 'Learn application processes and required documentation', 'Master basic underwriting principles and risk assessment', 'Develop client consultation and presentation skills'],
      'invoice-factoring': isExpert ? ['Master advanced factoring portfolio management strategies', 'Develop innovative factoring structures and risk mitigation techniques', 'Execute complex client evaluation and due diligence processes', 'Implement advanced collection and account management systems'] : ['Understand invoice factoring fundamentals and cash flow benefits', 'Learn client eligibility assessment and account evaluation', 'Master basic factoring calculations and fee structures', 'Develop client onboarding and account setup processes'],
      'equipment-financing': isExpert ? ['Master complex equipment portfolio management and optimization', 'Develop advanced equipment valuation and risk assessment techniques', 'Execute innovative financing structures and vendor relationships', 'Implement sophisticated collection and remarketing strategies'] : ['Understand equipment financing basics and collateral evaluation', 'Learn equipment types, depreciation, and valuation methods', 'Master basic financing structures and payment calculations', 'Develop vendor relationships and client acquisition strategies']
    };
    return objectives[moduleType] || ['Master core concepts and industry best practices', 'Develop practical application skills through case studies', 'Build analytical and decision-making capabilities', 'Enhance client service and relationship management skills'];
  };
  const getModuleKeyTopics = (module: any) => {
    const moduleType = getModuleType(module);
    const topics = {
      'sba-7a': ['Program Overview & Structure', 'Eligibility Requirements', 'Loan Terms & Conditions', 'Application Process', 'Underwriting Guidelines', 'Documentation Requirements', 'Guaranty Procedures', 'Servicing & Compliance'],
      'invoice-factoring': ['Factoring Fundamentals', 'Account Evaluation', 'Due Diligence Process', 'Rate Structures', 'Advance Rates', 'Collection Procedures', 'Client Onboarding', 'Risk Management'],
      'equipment-financing': ['Equipment Types & Categories', 'Valuation Methods', 'Depreciation Analysis', 'Financing Structures', 'Vendor Programs', 'Documentation Requirements', 'Collection Strategies', 'Remarketing Processes']
    };
    return topics[moduleType] || ['Industry Overview', 'Market Analysis', 'Risk Assessment', 'Documentation', 'Compliance', 'Best Practices'];
  };
  const getModulePrerequisites = (module: any) => {
    const moduleType = getModuleType(module);
    const isExpert = module.title.toLowerCase().includes('expert');
    if (isExpert) {
      const expertPrereqs = {
        'sba-7a': 'Completion of SBA 7(a) Beginner course and 1+ years of SBA lending experience.',
        'invoice-factoring': 'Completion of Invoice Factoring Beginner course and basic accounts receivable financing experience.',
        'equipment-financing': 'Completion of Equipment Financing Beginner course and understanding of secured lending principles.'
      };
      return expertPrereqs[moduleType] || 'Completion of beginner-level course and relevant industry experience.';
    }
    return 'Basic understanding of commercial lending principles and business finance fundamentals. No prior specialized experience required.';
  };
  const getModuleProfessionalSkills = (module: any) => {
    const isExpert = module.title.toLowerCase().includes('expert');
    if (isExpert) {
      return 'Advanced analytical thinking, strategic portfolio management, complex problem-solving, and senior-level client relationship management.';
    }
    return 'Financial analysis fundamentals, client communication, documentation skills, and risk assessment basics.';
  };
  const getModuleBusinessImpact = (module: any) => {
    const moduleType = getModuleType(module);
    const isExpert = module.title.toLowerCase().includes('expert');
    if (isExpert) {
      return 'Portfolio optimization, increased deal closure rates, enhanced risk management, and senior-level business development capabilities.';
    }
    const impacts = {
      'sba-7a': 'Access to $5M+ financing opportunities and improved small business lending capabilities.',
      'invoice-factoring': 'Enhanced working capital solutions and improved client cash flow management.',
      'equipment-financing': 'Expanded equipment financing opportunities and stronger vendor partnerships.'
    };
    return impacts[moduleType] || 'Enhanced lending capabilities and improved client service delivery.';
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-xl font-semibold">{module.title}</h1>
              <p className="text-sm text-black">{module.duration || '45 minutes'} • {lessons.length} lessons</p>
            </div>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="bg-blue-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white">{module.title}</CardTitle>
                    <CardDescription className="mt-2 text-white">{module.description}</CardDescription>
                  </div>
                  {module.skill_level && module.skill_level.toLowerCase() !== "beginner" && <Badge variant={module.skill_level.toLowerCase() === "expert" ? "success" : "outline"}>
                      {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                    </Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white">Overall Progress</span>
                      <span className="text-white">{moduleProgress[moduleId!]?.progress_percentage || 0}%</span>
                    </div>
                    <Progress value={moduleProgress[moduleId!]?.progress_percentage || 0} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs bg-white">
                      {module.duration || '45 minutes'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-max min-w-full grid-cols-3 sm:grid-cols-3 gap-1 bg-white">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap bg-blue-800 hover:bg-blue-700 text-white">Module Overview</TabsTrigger>
              <TabsTrigger value="lessons" className="text-xs sm:text-sm whitespace-nowrap bg-blue-800 hover:bg-blue-700 text-white">Module Lessons</TabsTrigger>
              <TabsTrigger value="assessment" className="text-xs sm:text-sm whitespace-nowrap bg-blue-800 hover:bg-blue-700 text-white">Module Assessment</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white rounded-none">
              <CardHeader>
                <CardTitle className="text-inherit">Module Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Module-Specific Content */}
                {getModuleSpecificContent(module)}
                
                <div>
                  <h4 className="font-semibold mb-3 text-inherit">Learning Objectives</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {getModuleLearningObjectives(module).map((objective, index) => <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-black">{objective}</span>
                      </li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-inherit">Key Topics Covered</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getModuleKeyTopics(module).map((topic, index) => <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span className="text-black">{topic}</span>
                      </div>)}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-inherit">Prerequisites</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-inherit mb-2">
                      {getModulePrerequisites(module)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-blue-700">
                      <Clock className="h-3 w-3" />
                      <span className="text-black">Recommended preparation time: 15 minutes</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-inherit">Module Outcomes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1 text-black">Professional Skills</h5>
                      <p className="text-xs text-black">{getModuleProfessionalSkills(module)}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-1 text-black">Business Impact</h5>
                      <p className="text-xs text-black">{getModuleBusinessImpact(module)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4">
                {lessons.length > 0 ? <div className="grid gap-4">
                    {lessons.map((lesson, index) => <Card key={index} className="group hover:shadow-md transition-all duration-200 bg-white">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                              <div className={`p-2 rounded-lg ${lesson.completed ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
                                {lesson.completed ? <CheckCircle className="h-5 w-5" /> : getTypeIcon(lesson.type)}
                              </div>
                              <div>
                                <h3 className="font-semibold text-inherit">{lesson.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1 bg-white">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration}
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-white">
                                    {lesson.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {lesson.completed && <Badge variant="success" className="text-xs whitespace-nowrap">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Completed</span>
                                  <span className="sm:hidden">Done</span>
                                </Badge>}
                              <Button size="sm" className="h-8 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap" onClick={() => handleLessonStart(lesson)}>
                                <Play className="h-3 w-3 mr-1" />
                                {lesson.completed ? "Review" : "Start"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>)}
                  </div> : <Card>
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
                  </Card>}
              </TabsContent>

              <TabsContent value="assessment" className="space-y-6">
                <ModuleQuiz moduleId={module.id} moduleTitle={module.title} courseId={module.course_id} onQuizComplete={passed => {
                if (passed) {
                  toast({
                    title: "🎉 Module Quiz Passed!",
                    description: "You can now proceed to the next module in your learning path."
                  });
                }
              }} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-blue-800">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg text-white">Module Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-white">Duration</span>
                  <span className="text-sm font-medium text-white">{module.duration || '45 minutes'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-white">Lessons</span>
                  <span className="text-sm font-medium text-white">{module.lessons_count || 6}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm text-white">Status</span>
                  <Badge variant="outline" className="text-xs bg-white">
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

            <Card className="bg-blue-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleTakeNotes}>
                  <Book className="h-4 w-4 mr-2" />
                  My Notes
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleAskQuestion}>
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
      <NotesModal isOpen={isNotesModalOpen} onClose={() => setIsNotesModalOpen(false)} moduleTitle={module.title} />

      {/* Question Modal */}
      <QuestionModal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} moduleTitle={module.title} moduleId={moduleId} />

      {selectedLesson && <LessonModal isOpen={isLessonModalOpen} onClose={() => {
      setIsLessonModalOpen(false);
      setSelectedLesson(null);
    }} lesson={selectedLesson} moduleTitle={module.title} moduleId={moduleId} />}
    </div>;
};
export default ModulePage;