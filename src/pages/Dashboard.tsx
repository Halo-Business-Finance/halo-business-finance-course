import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ModuleCard from "@/components/ModuleCard"; // Default export
import PublicModuleCard from "@/components/PublicModuleCard";
import { EnhancedModuleCard } from "@/components/EnhancedModuleCard";
import { SkillLevelFilter } from "@/components/SkillLevelFilter";
import { DashboardFilterSidebar } from "@/components/DashboardFilterSidebar";
import { MultiLevelCourseFilter } from "@/components/MultiLevelCourseFilter";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import StatsCard from "@/components/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CourseHeader from "@/components/CourseHeader";
import ModuleDetail from "@/components/ModuleDetail";
import LearningObjectives from "@/components/LearningObjectives";
import InstructorInfo from "@/components/InstructorInfo";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { LearningAnalytics } from "@/components/LearningAnalytics";
import { InteractiveLearningPath } from "@/components/InteractiveLearningPath";
import { SocialLearningHub } from "@/components/SocialLearningHub";
import { InteractiveFinancialTools } from "@/components/InteractiveFinancialTools";
import { GamificationSystem } from "@/components/GamificationSystem";
import { AdaptiveLearningEngine } from "@/components/AdaptiveLearningEngine";
import { RealTimeMarketData } from "@/components/RealTimeMarketData";
import { EnhancedProgressTracking } from "@/components/EnhancedProgressTracking";
import { AccessibilityEnhancer } from "@/components/AccessibilityEnhancer";
import { AdvancedAssessmentSystem } from "@/components/AdvancedAssessmentSystem";
import { CourseSelector } from "@/components/CourseSelector";
import { InteractiveLessonComponents } from "@/components/InteractiveLessonComponents";
import { courseData, statsData } from "@/data/courseData";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, Target, Trophy, Brain, Zap } from "lucide-react";

// Import course images to match the Courses page
import financeExpert1 from "@/assets/finance-expert-1.jpg";
import creditAnalyst2 from "@/assets/credit-analyst-2.jpg";
import commercialBanker3 from "@/assets/commercial-banker-3.jpg";
import riskSpecialist4 from "@/assets/risk-specialist-4.jpg";
import sbaSpecialist5 from "@/assets/sba-specialist-5.jpg";
import complianceOfficer6 from "@/assets/compliance-officer-6.jpg";
import financialAdvisor7 from "@/assets/financial-advisor-7.jpg";
import investmentBanker8 from "@/assets/investment-banker-8.jpg";
import loanOfficer9 from "@/assets/loan-officer-9.jpg";
import portfolioManager10 from "@/assets/portfolio-manager-10.jpg";

const Dashboard = () => {
  const { user, hasEnrollment, enrollmentVerified, isLoading: authLoading } = useSecureAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState(courseData.allCourses.flatMap(course => course.modules));
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("all");
  const [titleFilter, setTitleFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [allCourses, setAllCourses] = useState(courseData.allCourses);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [useMultiLevelFilter, setUseMultiLevelFilter] = useState(true);
  const [multiLevelFilters, setMultiLevelFilters] = useState<string[]>([]);
  const [multiLevelSearch, setMultiLevelSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  // Convert courses to module format for display
  const flattenedModules = allCourses.flatMap(course => 
    course.modules.map(module => ({
      ...module,
      course_title: course.title,
      course_level: course.level,
      skill_level: course.level
    }))
  );

  const fetchUserProgress = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const progressMap = {};
      data?.forEach(progress => {
        progressMap[progress.module_id] = progress;
      });
      setUserProgress(progressMap);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = flattenedModules.filter(module => {
    // Multi-level filter logic
    const matchesMultiLevelSearch = multiLevelSearch === "" || 
      module.title.toLowerCase().includes(multiLevelSearch.toLowerCase()) ||
      module.course_title.toLowerCase().includes(multiLevelSearch.toLowerCase());
    
    const matchesMultiLevelCategories = multiLevelFilters.length === 0 || 
      multiLevelFilters.some(filterId => {
        const courseTitle = module.course_title.toLowerCase();
        const moduleLevel = module.skill_level;
        
        // Course program matching (Level 1)
        if (filterId === 'sba-7a-loans' && courseTitle.includes('sba 7(a)')) return true;
        if (filterId === 'sba-express' && courseTitle.includes('sba express')) return true;
        if (filterId === 'commercial-real-estate' && courseTitle.includes('commercial real estate')) return true;
        if (filterId === 'equipment-financing' && courseTitle.includes('equipment financing')) return true;
        if (filterId === 'business-lines-credit' && courseTitle.includes('business lines of credit')) return true;
        if (filterId === 'invoice-factoring' && courseTitle.includes('invoice factoring')) return true;
        if (filterId === 'merchant-cash-advances' && courseTitle.includes('merchant cash advances')) return true;
        if (filterId === 'asset-based-lending' && courseTitle.includes('asset-based lending')) return true;
        if (filterId === 'construction-loans' && courseTitle.includes('construction loans')) return true;
        if (filterId === 'franchise-financing' && courseTitle.includes('franchise financing')) return true;
        if (filterId === 'working-capital' && courseTitle.includes('working capital')) return true;
        if (filterId === 'healthcare-financing' && courseTitle.includes('healthcare financing')) return true;
        if (filterId === 'restaurant-financing' && courseTitle.includes('restaurant financing')) return true;
        
        // Course + User level matching (Level 2) - All courses
        if (filterId === 'sba-7a-loans-beginner' && courseTitle.includes('sba 7(a)') && moduleLevel === 'beginner') return true;
        if (filterId === 'sba-7a-loans-intermediate' && courseTitle.includes('sba 7(a)') && moduleLevel === 'intermediate') return true;
        if (filterId === 'sba-7a-loans-expert' && courseTitle.includes('sba 7(a)') && moduleLevel === 'expert') return true;
        
        if (filterId === 'sba-express-beginner' && courseTitle.includes('sba express') && moduleLevel === 'beginner') return true;
        if (filterId === 'sba-express-intermediate' && courseTitle.includes('sba express') && moduleLevel === 'intermediate') return true;
        if (filterId === 'sba-express-expert' && courseTitle.includes('sba express') && moduleLevel === 'expert') return true;
        
        if (filterId === 'commercial-real-estate-beginner' && courseTitle.includes('commercial real estate') && moduleLevel === 'beginner') return true;
        if (filterId === 'commercial-real-estate-intermediate' && courseTitle.includes('commercial real estate') && moduleLevel === 'intermediate') return true;
        if (filterId === 'commercial-real-estate-expert' && courseTitle.includes('commercial real estate') && moduleLevel === 'expert') return true;
        
        if (filterId === 'equipment-financing-beginner' && courseTitle.includes('equipment financing') && moduleLevel === 'beginner') return true;
        if (filterId === 'equipment-financing-intermediate' && courseTitle.includes('equipment financing') && moduleLevel === 'intermediate') return true;
        if (filterId === 'equipment-financing-expert' && courseTitle.includes('equipment financing') && moduleLevel === 'expert') return true;
        
        if (filterId === 'business-lines-credit-beginner' && courseTitle.includes('business lines of credit') && moduleLevel === 'beginner') return true;
        if (filterId === 'business-lines-credit-intermediate' && courseTitle.includes('business lines of credit') && moduleLevel === 'intermediate') return true;
        if (filterId === 'business-lines-credit-expert' && courseTitle.includes('business lines of credit') && moduleLevel === 'expert') return true;
        
        if (filterId === 'invoice-factoring-beginner' && courseTitle.includes('invoice factoring') && moduleLevel === 'beginner') return true;
        if (filterId === 'invoice-factoring-intermediate' && courseTitle.includes('invoice factoring') && moduleLevel === 'intermediate') return true;
        if (filterId === 'invoice-factoring-expert' && courseTitle.includes('invoice factoring') && moduleLevel === 'expert') return true;
        
        if (filterId === 'merchant-cash-advances-beginner' && courseTitle.includes('merchant cash advances') && moduleLevel === 'beginner') return true;
        if (filterId === 'merchant-cash-advances-intermediate' && courseTitle.includes('merchant cash advances') && moduleLevel === 'intermediate') return true;
        if (filterId === 'merchant-cash-advances-expert' && courseTitle.includes('merchant cash advances') && moduleLevel === 'expert') return true;
        
        if (filterId === 'asset-based-lending-beginner' && courseTitle.includes('asset-based lending') && moduleLevel === 'beginner') return true;
        if (filterId === 'asset-based-lending-intermediate' && courseTitle.includes('asset-based lending') && moduleLevel === 'intermediate') return true;
        if (filterId === 'asset-based-lending-expert' && courseTitle.includes('asset-based lending') && moduleLevel === 'expert') return true;
        
        if (filterId === 'construction-loans-beginner' && courseTitle.includes('construction loans') && moduleLevel === 'beginner') return true;
        if (filterId === 'construction-loans-intermediate' && courseTitle.includes('construction loans') && moduleLevel === 'intermediate') return true;
        if (filterId === 'construction-loans-expert' && courseTitle.includes('construction loans') && moduleLevel === 'expert') return true;
        
        if (filterId === 'franchise-financing-beginner' && courseTitle.includes('franchise financing') && moduleLevel === 'beginner') return true;
        if (filterId === 'franchise-financing-intermediate' && courseTitle.includes('franchise financing') && moduleLevel === 'intermediate') return true;
        if (filterId === 'franchise-financing-expert' && courseTitle.includes('franchise financing') && moduleLevel === 'expert') return true;
        
        if (filterId === 'working-capital-beginner' && courseTitle.includes('working capital') && moduleLevel === 'beginner') return true;
        if (filterId === 'working-capital-intermediate' && courseTitle.includes('working capital') && moduleLevel === 'intermediate') return true;
        if (filterId === 'working-capital-expert' && courseTitle.includes('working capital') && moduleLevel === 'expert') return true;
        
        if (filterId === 'healthcare-financing-beginner' && courseTitle.includes('healthcare financing') && moduleLevel === 'beginner') return true;
        if (filterId === 'healthcare-financing-intermediate' && courseTitle.includes('healthcare financing') && moduleLevel === 'intermediate') return true;
        if (filterId === 'healthcare-financing-expert' && courseTitle.includes('healthcare financing') && moduleLevel === 'expert') return true;
        
        if (filterId === 'restaurant-financing-beginner' && courseTitle.includes('restaurant financing') && moduleLevel === 'beginner') return true;
        if (filterId === 'restaurant-financing-intermediate' && courseTitle.includes('restaurant financing') && moduleLevel === 'intermediate') return true;
        if (filterId === 'restaurant-financing-expert' && courseTitle.includes('restaurant financing') && moduleLevel === 'expert') return true;
        
        return false;
      });
    
    return matchesMultiLevelSearch && matchesMultiLevelCategories;
  });

  const skillLevelCounts = {
    all: flattenedModules.length,
    beginner: flattenedModules.filter(m => m.skill_level === "beginner").length,
    intermediate: flattenedModules.filter(m => m.skill_level === "intermediate").length,
    expert: flattenedModules.filter(m => m.skill_level === "expert").length,
  };

  const learningObjectives = [
    "Analyze financial statements and assess business creditworthiness using industry-standard methodologies",
    "Differentiate between various loan products including SBA 7(a), 504, conventional, and bridge financing options",
    "Navigate capital markets and understand the role of financial intermediaries in business lending",
    "Apply risk assessment techniques and regulatory compliance standards in commercial lending decisions",
    "Structure financing solutions that align with client needs and risk tolerance parameters",
    "Demonstrate proficiency in credit analysis, underwriting, and portfolio management principles"
  ];

  // Course image mapping function - matches the Courses page
  const getCourseImage = (index: number) => {
    const images = [
      financeExpert1, 
      creditAnalyst2, 
      commercialBanker3, 
      riskSpecialist4, 
      sbaSpecialist5, 
      complianceOfficer6,
      financialAdvisor7,
      investmentBanker8,
      loanOfficer9,
      portfolioManager10
    ];
    return images[index % images.length];
  };

  const handleModuleStart = (moduleId: string) => {
    const module = flattenedModules.find(m => m.id === moduleId);
    if (!module) return;

    // Show module details
    setSelectedModule(moduleId);
  };

  const closeModuleDetail = () => {
    setSelectedModule(null);
  };

  const handleContinueLearning = () => {
    // Find the first available or in-progress module
    const nextModule = modules.find(m => m.status === "in-progress" || m.status === "available");
    if (nextModule) {
      handleModuleStart(nextModule.id);
    }
  };

  // Show loading state or redirect to auth if no user
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !hasEnrollment) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            You need to be enrolled in the course to access this content. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  const iconMap = {
    0: BookOpen,
    1: Clock,
    2: Target,
    3: Trophy
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Adaptive Learning Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Adaptive Interactive Learning Dashboard</h1>
              <p className="text-gray-600">AI-powered personalized learning experience</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Interactive Content</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Adaptive Assessments</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Gamified Learning</span>
            </div>
          </div>
        </div>
        
        <CourseHeader 
          progress={courseData.totalProgress}
          totalModules={courseData.totalModules}
          completedModules={courseData.completedModules}
          onContinueLearning={handleContinueLearning}
        />
      </div>

      {/* All Courses Section with Sidebar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-left space-y-4">
            <h2 className="text-3xl font-bold">Adaptive Learning Modules</h2>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              Explore AI-powered adaptive modules that adjust to your learning pace, provide interactive content, 
              and offer personalized pathways through advanced commercial finance concepts.
            </p>
          </div>

          {/* Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Filter Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <MultiLevelCourseFilter
                onFilterChange={(categories, search) => {
                  setMultiLevelFilters(categories);
                  setMultiLevelSearch(search);
                }}
                totalCount={flattenedModules.length}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold">
                  {filteredModules.length} {filteredModules.length === 1 ? 'Module' : 'Modules'} Found
                </h3>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg h-64" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                    {filteredModules.map((module, index) => (
                      <Card key={module.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <img 
                            src={getCourseImage(index)} 
                            alt={module.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <Badge variant={module.skill_level === "beginner" ? "default" : module.skill_level === "intermediate" ? "secondary" : "destructive"}>
                              {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                              <CardDescription className="line-clamp-2 mt-1">
                                {module.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{module.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>{module.lessons} lessons</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Course: {module.course_title}
                            </div>
                            <Button 
                              onClick={() => handleModuleStart(module.id)} 
                              className="w-full"
                              variant={module.status === "completed" ? "secondary" : "default"}
                            >
                              {module.status === "completed" ? "Review" : module.status === "in-progress" ? "Continue" : "Start Learning"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredModules.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No modules found matching your filters
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your filters to see more results.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Learning Objectives */}
          <LearningObjectives objectives={learningObjectives} />

          {/* Instructor Information */}
          <InstructorInfo />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsData.map((stat, index) => {
            const Icon = iconMap[index as keyof typeof iconMap] || BookOpen;
            return (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.subtitle}
                icon={Icon}
                trend={{ value: 0, isPositive: true }}
              />
            );
          })}
          </div>

          {/* Course Modules and Resources */}
          <div className="space-y-8 pb-16">
            <div className="text-left space-y-4">
              <h3 className="text-3xl font-bold">Adaptive Interactive Learning Platform</h3>
              <p className="text-muted-foreground max-w-3xl leading-relaxed">
                Experience cutting-edge adaptive learning with AI-powered content delivery, real-time assessments, 
                interactive simulations, gamification elements, and personalized learning paths for finance mastery.
              </p>
            </div>

            <Tabs defaultValue="adaptive" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-10 sm:w-fit">
                <TabsTrigger value="adaptive" className="text-sm">AI Learning</TabsTrigger>
                <TabsTrigger value="interactive" className="text-sm">Interactive</TabsTrigger>
                <TabsTrigger value="modules" className="text-sm">Modules</TabsTrigger>
                <TabsTrigger value="progress" className="text-sm">Progress</TabsTrigger>
                <TabsTrigger value="assessment" className="text-sm">Assessment</TabsTrigger>
                <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
                <TabsTrigger value="social" className="text-sm">Social</TabsTrigger>
                <TabsTrigger value="tools" className="text-sm">Tools</TabsTrigger>
                <TabsTrigger value="gamification" className="text-sm">Achievements</TabsTrigger>
                <TabsTrigger value="market" className="text-sm">Market Data</TabsTrigger>
                <TabsTrigger value="resources" className="text-sm">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="adaptive" className="space-y-6">
                {/* Adaptive Learning Engine */}
                <Card className="mb-6 border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Brain className="h-5 w-5" />
                      AI-Powered Adaptive Learning Engine
                    </CardTitle>
                    <CardDescription>
                      Personalized learning recommendations based on your progress and learning style
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdaptiveLearningEngine />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interactive" className="space-y-6">
                {/* Interactive Learning Components */}
                <Card className="mb-6 border-purple-200 bg-purple-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <Zap className="h-5 w-5" />
                      Interactive Learning Components
                    </CardTitle>
                    <CardDescription>
                      Hands-on practice with financial calculators, scenarios, and simulations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InteractiveLessonComponents />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="modules" className="space-y-6">
                {/* Learning Analytics Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Learning Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LearningAnalytics />
                  </CardContent>
                </Card>

                {/* Interactive Learning Path */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Your Learning Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InteractiveLearningPath />
                  </CardContent>
                </Card>

                <SkillLevelFilter
                  selectedLevel={selectedSkillLevel}
                  onLevelChange={setSelectedSkillLevel}
                  counts={skillLevelCounts}
                />

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-48" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredModules.map((module, index) => (
                          <Card key={module.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                            <div className="relative overflow-hidden rounded-t-lg">
                              <img 
                                src={getCourseImage(index)} 
                                alt={module.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge variant={module.skill_level === "beginner" ? "default" : module.skill_level === "intermediate" ? "secondary" : "destructive"}>
                                  {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg line-clamp-2">{module.title}</CardTitle>
                                  <CardDescription className="line-clamp-2 mt-1">
                                    {module.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{module.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="h-4 w-4" />
                                  <span>{module.lessons} lessons</span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  Course: {module.course_title}
                                </div>
                                <Button 
                                  onClick={() => handleModuleStart(module.id)} 
                                  className="w-full"
                                  variant={module.status === "completed" ? "secondary" : "default"}
                                >
                                  {module.status === "completed" ? "Review" : module.status === "in-progress" ? "Continue" : "Start Learning"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                    {filteredModules.length === 0 && (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                          No modules found for {selectedSkillLevel} level
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try selecting a different skill level to see available modules.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="progress">
                <EnhancedProgressTracking />
              </TabsContent>

              <TabsContent value="assessment">
                <AdvancedAssessmentSystem />
              </TabsContent>

              <TabsContent value="analytics">
                <LearningAnalytics />
              </TabsContent>

              <TabsContent value="social">
                <SocialLearningHub />
              </TabsContent>

              <TabsContent value="tools">
                <InteractiveFinancialTools />
              </TabsContent>

              <TabsContent value="gamification">
                <GamificationSystem />
              </TabsContent>

              <TabsContent value="adaptive">
                <AdaptiveLearningEngine />
              </TabsContent>

              <TabsContent value="market">
                <RealTimeMarketData />
              </TabsContent>

              <TabsContent value="resources">
                <DocumentLibrary />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* FinPilot Brand Footer */}
          <FinPilotBrandFooter />
        </div>

      {/* Accessibility Enhancer */}
      <AccessibilityEnhancer />

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetail 
          module={flattenedModules.find(m => m.id === selectedModule)!}
          onClose={closeModuleDetail}
        />
      )}
    </div>
  );
};

export default Dashboard;