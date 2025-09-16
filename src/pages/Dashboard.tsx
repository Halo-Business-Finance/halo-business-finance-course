import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ModuleCard from "@/components/ModuleCard";
import PublicModuleCard from "@/components/PublicModuleCard";
import { EnhancedModuleCard } from "@/components/EnhancedModuleCard";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import StatsCard from "@/components/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CourseHeader from "@/components/CourseHeader";
import ModuleDetail from "@/components/ModuleDetail";
import LearningObjectives from "@/components/LearningObjectives";
import InstructorInfo from "@/components/InstructorInfo";
import { FinPilotBrandFooter } from "@/components/FinPilotBrandFooter";
import { InteractiveLearningPath } from "@/components/InteractiveLearningPath";
import { AccessibilityEnhancer } from "@/components/AccessibilityEnhancer";
import { AdvancedAssessmentSystem } from "@/components/AdvancedAssessmentSystem";
import { CourseSelector } from "@/components/CourseSelector";
import { LiveLearningStats } from "@/components/LiveLearningStats";
import { DashboardCourseFilter } from "@/components/DashboardCourseFilter";
import { useCourses } from "@/hooks/useCourses";
import { useModules } from "@/hooks/useModules";
import { useLearningStats } from "@/hooks/useLearningStats";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useCourseSelection } from "@/contexts/CourseSelectionContext";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, Target, Trophy, Brain, Zap, ArrowLeft, Lock } from "lucide-react";

// Import new course-specific images (no people)
import courseSba7a from "@/assets/course-sba-7a.jpg";
import courseSbaExpress from "@/assets/course-sba-express.jpg";
import courseCommercialRealEstate from "@/assets/course-commercial-real-estate.jpg";
import courseEquipmentFinancing from "@/assets/course-equipment-financing.jpg";
import courseLinesOfCredit from "@/assets/course-lines-of-credit.jpg";
import courseInvoiceFactoring from "@/assets/course-invoice-factoring.jpg";
import courseMerchantCashAdvances from "@/assets/course-merchant-cash-advances.jpg";
import courseAssetBasedLending from "@/assets/course-asset-based-lending.jpg";
import courseConstructionLoans from "@/assets/course-construction-loans.jpg";
import courseFranchiseFinancing from "@/assets/course-franchise-financing.jpg";
import courseWorkingCapital from "@/assets/course-working-capital.jpg";
import courseHealthcareFinancing from "@/assets/course-healthcare-financing.jpg";
import courseRestaurantFinancing from "@/assets/course-restaurant-financing.jpg";
import courseBridgeLoans from "@/assets/course-bridge-loans.jpg";
import courseTermLoans from "@/assets/course-term-loans.jpg";
import courseBusinessAcquisition from "@/assets/course-business-acquisition.jpg";
const Dashboard = () => {
  const {
    user,
    hasEnrollment,
    enrollmentVerified,
    isLoading: authLoading
  } = useSecureAuth();
  const {
    availableCourses,
    canSelectCourse,
    getActiveStudyCourse,
    refreshCourses
  } = useCourseSelection();
  const {
    courses: databaseCourses,
    loading: coursesLoading,
    getCoursesByCategory
  } = useCourses();
  const {
    modules: databaseModules,
    loading: modulesLoading
  } = useModules();
  const {
    dashboardStats,
    loading: statsLoading
  } = useLearningStats(user?.id);
  const {
    moduleProgress,
    loading: progressLoading,
    startModule,
    completeModule,
    isModuleUnlocked,
    getOverallProgress,
    getCompletedModulesCount
  } = useCourseProgress(user?.id);
  const {
    toast
  } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentFilterLevel, setCurrentFilterLevel] = useState(0);
  const [filterNavigationPath, setFilterNavigationPath] = useState<any[]>([]);
  const [selectedCourseProgram, setSelectedCourseProgram] = useState<string | null>(null);
  const [selectedSkillLevelForCourse, setSelectedSkillLevelForCourse] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Scroll position management refs
  const containerRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  // Get the active study course to show locked status
  const activeStudyCourse = getActiveStudyCourse();

  // Combine courses with their modules from database
  const coursesWithModules = databaseCourses.map(course => {
    const courseModules = databaseModules.filter(module => module.course_id === course.id && module.is_active);
    return {
      ...course,
      modules: courseModules
    };
  });

  // Filter courses based on selected category
  const filteredCoursesWithModules = selectedCategory ? (() => {
    const categorizedCourses = getCoursesByCategory();
    const categoryCourseTitles = categorizedCourses[selectedCategory]?.map(course => course.title) || [];
    return coursesWithModules.filter(course => categoryCourseTitles.some(title => course.title.includes(title.split(' - ')[0])));
  })() : coursesWithModules;

  // Create flattened modules for filtering and display
  const flattenedModules = filteredCoursesWithModules.flatMap(course => course.modules.map(module => ({
    ...module,
    course_title: course.title,
    course_level: course.level,
    skill_level: course.level,
    // Map database fields to expected format
    id: module.id,
    title: module.title,
    description: module.description,
    duration: module.duration,
    lessons: module.lessons_count,
    order: module.order_index
  })));

  // Get loading state
  const loading = coursesLoading || modulesLoading || progressLoading;

  // Force scroll to top on view changes to prevent bottom jumps
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        }
      });
    });
  }, [currentFilterLevel, filterNavigationPath.length]);

  // Function to handle course program selection
  const handleStartCourse = (courseName: string) => {
    // Save current scroll position before state changes and reset to top immediately
    if (containerRef.current) {
      savedScrollPosition.current = containerRef.current.scrollTop || window.scrollY;
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    } else {
      savedScrollPosition.current = window.scrollY;
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }

    // Find the course in available courses to check if it can be selected
    const targetCourse = availableCourses.find(course => {
      const baseName = course.title.split(' - ')[0];
      return baseName.toLowerCase() === courseName.toLowerCase();
    });

    // Check if user can select this course (not locked)
    if (targetCourse && !canSelectCourse(targetCourse.id)) {
      toast({
        title: "Course Locked",
        description: `Complete your current course (${activeStudyCourse?.title}) before starting a new one.`,
        variant: "destructive"
      });
      return;
    }
    try {
      const courseModules = flattenedModules.filter(m => {
        if (!m.course_title) return false;
        // Extract base course name from the module's course title (remove skill level suffix)
        const moduleBaseName = m.course_title.replace(/\s*-\s*(Beginner|Expert)$/i, '').trim();
        return moduleBaseName.toLowerCase() === courseName.toLowerCase();
      });
      if (courseModules.length === 0) {
        toast({
          title: "No modules found",
          description: `No modules found for ${courseName}. Please contact support.`,
          variant: "destructive"
        });
        return;
      }
      const navigationPath = [{
        id: courseName.toLowerCase().replace(/\s+/g, '-'),
        name: courseName,
        count: courseModules.length
      }];
      setFilterNavigationPath(navigationPath);

      // Update state and maintain scroll position
      setCurrentFilterLevel(1);
      setRenderKey(prev => prev + 1);

      // Scroll to top of new content after state update
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        }
        // Enforce again after paint to prevent scroll anchoring to bottom
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior: 'auto'
            });
          } else {
            window.scrollTo({
              top: 0,
              behavior: 'auto'
            });
          }
        }, 50);
      });
    } catch (error) {
      console.error('Error in handleStartCourse:', error);
    }
  };

  // Function to handle skill level selection and proceed to modules
  const handleProceedToModules = (level: string) => {
    // Save current scroll position before state changes and reset to top immediately
    if (containerRef.current) {
      savedScrollPosition.current = containerRef.current.scrollTop || window.scrollY;
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    } else {
      savedScrollPosition.current = window.scrollY;
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
    try {
      const selectedCourse = filterNavigationPath[0];
      const courseSkillId = `${selectedCourse.id}-${level}`;
      setSelectedSkillLevelForCourse(level);
      setCurrentFilterLevel(2);
      const levelModules = flattenedModules.filter(m => m.course_title.toLowerCase().includes(selectedCourse.name.toLowerCase()) && m.skill_level === level);
      setFilterNavigationPath([selectedCourse, {
        id: courseSkillId,
        name: `${level.charAt(0).toUpperCase() + level.slice(1)} Level`,
        count: levelModules.length
      }]);

      // Scroll to top of new content after state update
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        } else {
          window.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        }
        // Enforce again after paint to prevent scroll anchoring to bottom
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              top: 0,
              behavior: 'auto'
            });
          } else {
            window.scrollTo({
              top: 0,
              behavior: 'auto'
            });
          }
        }, 50);
      });
    } catch (error) {
      console.error('Error in handleProceedToModules:', error);
    }
  };

  // Module unlocked check is now handled by the hook

  // Function to start a course module
  const handleStartCourseModule = async (moduleId: string) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }
    const success = await startModule(moduleId);
    if (success) {
      toast({
        title: "Module Started",
        description: "You've started this learning module!"
      });
      handleModuleStart(moduleId);
    }
  };

  // Function to complete a module and unlock the next one
  const handleCompleteModule = async (moduleId: string, moduleIndex: number, totalModules: number) => {
    const success = await completeModule(moduleId);
    if (success) {
      toast({
        title: "Module Completed!",
        description: moduleIndex < totalModules - 1 ? "Next module unlocked!" : "Course completed! Congratulations!"
      });
    }
  };

  // Function to return to dashboard
  const handleReturnToDashboard = () => {
    setCurrentFilterLevel(0);
    setFilterNavigationPath([]);
    setSelectedCourseProgram(null);
    setSelectedSkillLevelForCourse(null);
    setRenderKey(prev => prev + 1);
  };

  // Simple filtering function for Level 2 modules
  const filteredModules = flattenedModules.filter(module => {
    if (currentFilterLevel !== 2) return true;
    const selectedCourse = filterNavigationPath[0];
    const selectedLevel = selectedSkillLevelForCourse;
    return module.course_title.toLowerCase().includes(selectedCourse?.name.toLowerCase() || '') && (selectedLevel ? module.skill_level === selectedLevel : true);
  });

  // Function to handle module start
  const handleModuleStart = (moduleId: string) => {
    // Navigate to the actual module page instead of just opening a modal
    window.location.href = `/module/${moduleId}`;
  };

  // Get course details from database or fallback
  const getCourseDetails = (courseName: string) => {
    // Find all courses that match this base name to determine available levels
    const matchingCourses = coursesWithModules.filter(course => {
      const baseName = course.title.split(' - ')[0];
      return baseName.toLowerCase() === courseName.toLowerCase();
    });

    // Determine difficulty based on available courses
    const hasExpert = matchingCourses.some(c => c.level === 'expert');
    const hasBeginner = matchingCourses.some(c => c.level === 'beginner');
    let difficulty = 'Multiple Levels';
    if (hasExpert && hasBeginner) {
      difficulty = 'Multiple Levels';
    } else if (hasExpert) {
      difficulty = 'Expert';
    } else if (hasBeginner) {
      difficulty = 'Beginner';
    }
    const sampleCourse = matchingCourses[0];
    return {
      description: sampleCourse?.description || "Comprehensive training program with practical applications",
      duration: "6-8 weeks",
      difficulty,
      topics: sampleCourse?.modules?.flatMap(m => m.topics || []).slice(0, 6) || ["Core Concepts", "Practical Applications"],
      outcome: `Master ${courseName} with professional expertise`
    };
  };

  // Course image mapping function - maps course titles to specific images
  const getCourseImage = (courseTitle: string) => {
    // Extract the base course type from title (remove skill level)
    const baseTitle = courseTitle.replace(/ - (Beginner|Expert)$/, '');

    // Map course titles to specific images (no people)
    const imageMap: {
      [key: string]: string;
    } = {
      "SBA 7(a)": courseSba7a,
      "SBA Express": courseSbaExpress,
      "Commercial Real Estate": courseCommercialRealEstate,
      "Equipment Financing": courseEquipmentFinancing,
      "Business Lines of Credit": courseLinesOfCredit,
      "Invoice Factoring": courseInvoiceFactoring,
      "Merchant Cash Advances": courseMerchantCashAdvances,
      "Asset-Based Lending": courseAssetBasedLending,
      "Construction Loans": courseConstructionLoans,
      "Franchise Financing": courseFranchiseFinancing,
      "Working Capital": courseWorkingCapital,
      "Healthcare Financing": courseHealthcareFinancing,
      "Restaurant Financing": courseRestaurantFinancing,
      "Bridge Loans": courseBridgeLoans,
      "Term Loans": courseTermLoans,
      "Business Acquisition": courseBusinessAcquisition
    };
    return imageMap[baseTitle] || courseSba7a; // Default to SBA 7(a) image
  };
  if (authLoading) {
    return <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your learning dashboard...</p>
        </div>
      </div>;
  }
  if (!user) {
    return <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please sign in to access your learning dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/auth'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div ref={containerRef} className="min-h-screen overflow-y-auto bg-gradient-to-br from-background via-background to-secondary/5" style={{
    overflowAnchor: 'none'
  }}>
      {/* Business Finance Mastery Header - Full Width Connected */}
      <CourseHeader progress={getOverallProgress()} totalModules={flattenedModules.length} completedModules={getCompletedModulesCount()} onContinueLearning={() => setCurrentFilterLevel(0)} />

      {/* Main Dashboard Content */}
      <div className="mobile-container mobile-section">
        {/* Learning Dashboard */}
        <div className={`${currentFilterLevel === 0 ? 'w-full' : 'flex flex-col lg:flex-row gap-6 lg:gap-8'}`}>
          {/* Course Categories and Instructors side by side - Only show on level 0 */}
          {currentFilterLevel === 0 && <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Course Categories Filter */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <DashboardCourseFilter selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
              </div>
              
              {/* Course Instructors Widget - Responsive width */}
              <div className="w-full lg:w-[40rem] flex-shrink-0">
                <InstructorInfo />
              </div>
            </div>}
          
          {/* Main Content */}
          <div className={`${currentFilterLevel === 0 ? 'w-full' : 'flex-1 min-w-0'}`}>
            {/* Section Divider - Only show on level 0 */}
            {currentFilterLevel === 0 && <Separator className="mb-4" />}
            
            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold underline">
                {currentFilterLevel === 0 && <span className="block sm:inline text-xl">Available Course Programs</span>}
                {currentFilterLevel === 1 && <span className="block sm:inline">2 Skill Levels Available</span>}
                {currentFilterLevel === 2 && <span className="block sm:inline">
                    {filteredModules.length} {filteredModules.length === 1 ? 'Module' : 'Modules'} Found
                  </span>}
              </h3>
            </div>

            {loading ? <div className="mobile-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-64" />
                  </div>)}
              </div> : <>
                {/* Level 0: Course Program Cards */}
                {currentFilterLevel === 0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {coursesLoading && (!databaseCourses || databaseCourses.length === 0) ?
              // Show loading skeletons
              Array.from({
                length: 6
              }).map((_, index) => <div key={index} className="animate-pulse">
                          <div className="bg-muted rounded-lg h-64" />
                        </div>) : coursesWithModules.length > 0 ? coursesWithModules.filter((course, index, self) => index === self.findIndex(c => c.title.split(' - ')[0] === course.title.split(' - ')[0])).map((course, index) => {
                const courseName = course.title.split(' - ')[0];
                const courseModules = flattenedModules.filter(m => {
                  if (!m.course_title) return false;
                  // Extract base course name from the module's course title (remove skill level suffix)
                  const moduleBaseName = m.course_title.replace(/\s*-\s*(Beginner|Expert)$/i, '').trim();
                  return moduleBaseName.toLowerCase() === courseName.toLowerCase();
                });
                return <Card key={courseName} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 border hover:border-primary/30 bg-gradient-to-br from-card via-card to-secondary/5 hover:to-primary/5">
                              {/* Modern gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              <CardHeader className="pb-4 relative z-10 space-y-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <BookOpen className="h-5 w-5 text-navy-900" />
                                      <Badge variant="outline" className="px-3 py-1 bg-white text-black border-gray-300">
                                        Course Program
                                      </Badge>
                                    </div>
                                    
                                    <CardTitle className="text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
                                      {courseName}
                                    </CardTitle>
                                    
                                    <CardDescription className="line-clamp-3 text-muted-foreground text-sm leading-relaxed">
                                      {getCourseDetails(courseName).description}
                                    </CardDescription>
                                  </div>
                                </div>
                                
                                {/* Enhanced Course Details */}
                                <div className="space-y-4 pt-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Clock className="h-4 w-4 text-navy-900" />
                                      <span className="text-primary font-medium">{getCourseDetails(courseName).duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Target className="h-4 w-4 text-navy-900" />
                                      <span>{courseModules.length} modules</span>
                                    </div>
                                  </div>
                                  
                                  {/* Key Topics with enhanced styling */}
                                  <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Key Topics</span>
                                    <div className="flex flex-wrap gap-2">
                                       {getCourseDetails(courseName).topics.slice(0, 3).map((topic, topicIndex) => <Badge key={topicIndex} variant="outline" className="text-xs px-3 py-1 text-secondary-foreground border-secondary/30">
                                           {topic}
                                         </Badge>)}
                                    </div>
                                  </div>
                                  
                                  {/* Skill Levels with semantic styling */}
                                  <div className="space-y-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available Levels</span>
                                    <div className="flex gap-2">
                                      {(() => {
                            const skillLevels = courseModules.map(m => m.skill_level).filter(Boolean);
                            const uniqueLevels = Array.from(new Set(skillLevels)).sort();
                            return uniqueLevels.length > 0 ? uniqueLevels.map(level => <Badge key={level} variant={level === 'expert' ? 'default' : 'secondary'} className="text-xs px-3 py-1">
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                              </Badge>) : <Badge variant="outline" className="text-xs px-3 py-1">Multiple levels</Badge>;
                          })()}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="pt-0 pb-6 relative z-10">
                                <Button type="button" onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Start Course button clicked for:', courseName);
                      handleStartCourse(courseName);
                    }} className="w-full touch-manipulation h-11 font-medium group-hover:shadow-lg transition-all duration-300" variant="default">
                                  <span className="flex items-center gap-2">
                                    Start Course
                                    <Target className="h-4 w-4 text-navy-900 group-hover:translate-x-1 transition-transform duration-300" />
                                  </span>
                                </Button>
                              </CardContent>
                            </Card>;
              }) : <div className="col-span-full text-center py-8">
                        <p className="text-muted-foreground">No courses available. Contact your administrator to add courses.</p>
                      </div>}
                  </div>}

                {/* Level 1: Skill Level Cards */}
                {(() => {
              console.log('=== LEVEL 1 RENDER CHECK ===');
              console.log('currentFilterLevel:', currentFilterLevel);
              console.log('filterNavigationPath.length:', filterNavigationPath.length);
              console.log('filterNavigationPath:', filterNavigationPath);
              const shouldRender = currentFilterLevel === 1 && filterNavigationPath.length > 0;
              console.log('Should render Level 1:', shouldRender);
              return shouldRender;
            })() && <div className="space-y-4 sm:space-y-6">
                    {/* Back button */}
                    <Button variant="ghost" size="sm" onClick={handleReturnToDashboard} className="mb-3 sm:mb-4">
                      <ArrowLeft className="h-4 w-4 mr-2 text-navy-900" />
                      Back to Courses
                    </Button>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                       {['beginner', 'expert'].map((level, index) => {
                  const selectedCourse = filterNavigationPath[0];
                  const levelModules = flattenedModules.filter(m => m.course_title.toLowerCase().includes(selectedCourse.name.toLowerCase()) && m.skill_level === level);
                  return <Card key={level} className="group relative overflow-hidden hover:shadow-xl transition-all duration-500 border hover:border-primary/30 bg-gradient-to-br from-card via-card to-secondary/5 hover:to-primary/5">
                            {/* Modern gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="relative overflow-hidden rounded-t-lg">
                              <img src={getCourseImage(selectedCourse.name)} alt={`${selectedCourse.name} - ${level}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                              <div className="absolute top-4 left-4">
                                <Badge variant={level === "beginner" ? "secondary" : "default"} className="px-3 py-1 backdrop-blur-sm bg-background/80 border-primary/20">
                                  {level.charAt(0).toUpperCase() + level.slice(1)} Level
                                </Badge>
                              </div>
                              <div className="absolute bottom-4 right-4">
                                <Zap className="h-5 w-5 text-navy-900" />
                              </div>
                            </div>
                            
                            <CardHeader className="pb-4 relative z-10 space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                  <CardTitle className="text-xl font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
                                    {selectedCourse.name}
                                  </CardTitle>
                                  <CardDescription className="line-clamp-2 text-muted-foreground leading-relaxed">
                                    {level === 'beginner' && 'Introduction and fundamental concepts for new learners'}
                                    {level === 'expert' && 'Advanced mastery and expert-level techniques'}
                                  </CardDescription>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <BookOpen className="h-4 w-4 text-navy-900" />
                                  <span className="text-primary font-medium">{levelModules.length} modules</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 text-navy-900" />
                                  <span className="font-medium">{levelModules.length * 30} min</span>
                                </div>
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0 pb-6 relative z-10">
                              <Button type="button" onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Proceed to Modules button clicked for level:', level);
                        handleProceedToModules(level);
                      }} className="w-full touch-manipulation h-11 font-medium group-hover:shadow-lg transition-all duration-300" variant="default">
                                <span className="flex items-center gap-2">
                                  Proceed to Modules
                                  <Brain className="h-4 w-4 text-navy-900 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                              </Button>
                            </CardContent>
                          </Card>;
                })}
                    </div>
                  </div>}

                {/* Level 2: Individual Module Cards */}
                {currentFilterLevel === 2 && <div className="space-y-4">
                    {/* Navigation breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Button variant="ghost" size="sm" onClick={handleReturnToDashboard}>
                        Dashboard
                      </Button>
                      <span>/</span>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentFilterLevel(1)}>
                        {filterNavigationPath[0]?.name}
                      </Button>
                      <span>/</span>
                      <span className="text-foreground">{filterNavigationPath[1]?.name}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {filteredModules.map((module, index) => {
                  const isUnlocked = isModuleUnlocked(index, filteredModules);
                  const currentProgress = moduleProgress[module.id];
                  const progressPercentage = currentProgress?.progress_percentage || 0;
                  return <EnhancedModuleCard key={module.id} module={{
                    ...module,
                    module_id: module.id,
                    lessons_count: module.lessons_count,
                    order_index: index,
                    progress: progressPercentage,
                    is_completed: currentProgress?.completed || false,
                    is_locked: !isUnlocked,
                    prerequisites: index > 0 ? [filteredModules[index - 1].title] : [],
                    skill_level: (module.skill_level === 'none' ? 'beginner' : module.skill_level) as 'beginner' | 'expert'
                  }} userProgress={{
                    completion_percentage: progressPercentage,
                    is_completed: currentProgress?.completed || false,
                    time_spent_minutes: Math.floor(progressPercentage * 30 / 100)
                  }} />;
                })}
                    </div>
                  </div>}

                {/* No results message */}
                {(currentFilterLevel === 2 && filteredModules.length === 0 || currentFilterLevel === 1 && filterNavigationPath.length === 0) && <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No content found
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try navigating back or adjusting your selection.
                    </p>
                  </div>}
              </>}
          </div>
        </div>

        {/* Module Detail Modal */}
        {selectedModule && flattenedModules.find(m => m.id === selectedModule) && <ModuleDetail module={{
        ...flattenedModules.find(m => m.id === selectedModule)!,
        // Add required properties for Module type
        progress: moduleProgress[selectedModule]?.progress_percentage || 0,
        loanExamples: [],
        videos: [],
        caseStudies: [],
        scripts: [],
        quiz: {
          id: `quiz-${selectedModule}`,
          moduleId: selectedModule,
          title: `${flattenedModules.find(m => m.id === selectedModule)?.title} Assessment`,
          description: "Complete this assessment to test your understanding",
          questions: [],
          passingScore: 80,
          maxAttempts: 3,
          timeLimit: 30
        }
      }} onClose={() => setSelectedModule(null)} />}
      </div>

      <FinPilotBrandFooter />
    </div>;
};
export default Dashboard;