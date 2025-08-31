import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ModuleCard from "@/components/ModuleCard"; // Default export
import PublicModuleCard from "@/components/PublicModuleCard";
import { EnhancedModuleCard } from "@/components/EnhancedModuleCard";
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

import { InteractiveLearningPath } from "@/components/InteractiveLearningPath";






import { AccessibilityEnhancer } from "@/components/AccessibilityEnhancer";
import { AdvancedAssessmentSystem } from "@/components/AdvancedAssessmentSystem";
import { CourseSelector } from "@/components/CourseSelector";

import { LiveLearningStats } from "@/components/LiveLearningStats";
import { courseData, statsData } from "@/data/courseData";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, Target, Trophy, Brain, Zap, ArrowLeft } from "lucide-react";

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
  const [allCourses, setAllCourses] = useState(courseData.allCourses);
  const [userProgress, setUserProgress] = useState({});
  const [moduleProgress, setModuleProgress] = useState<Record<string, {completed: boolean, current: boolean}>>({});
  const [loading, setLoading] = useState(false);
  const [currentFilterLevel, setCurrentFilterLevel] = useState(0);
  const [filterNavigationPath, setFilterNavigationPath] = useState<any[]>([]);
  const [selectedCourseProgram, setSelectedCourseProgram] = useState<string | null>(null);
  const [selectedSkillLevelForCourse, setSelectedSkillLevelForCourse] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

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
        .from("course_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const progressMap = {};
      const moduleProgressMap = {};
      
      data?.forEach(progress => {
        progressMap[progress.module_id] = progress.progress_percentage;
        moduleProgressMap[progress.module_id] = {
          completed: progress.progress_percentage === 100,
          current: progress.progress_percentage > 0 && progress.progress_percentage < 100
        };
      });
      
      setUserProgress(progressMap);
      setModuleProgress(moduleProgressMap);
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle course program selection
  const handleStartCourse = (courseName: string) => {
    console.log('=== handleStartCourse START ===');
    console.log('handleStartCourse called with:', courseName);
    console.log('Current currentFilterLevel:', currentFilterLevel);
    console.log('Current filterNavigationPath:', filterNavigationPath);
    
    try {
      const courseModules = flattenedModules.filter(m => 
        m.course_title.toLowerCase().includes(courseName.toLowerCase())
      );
      console.log('Course modules found:', courseModules.length);
      console.log('Sample module course_title:', courseModules[0]?.course_title);
      
      // Reset state for clean transition
      setSelectedCourseProgram(courseName);
      
      const navigationPath = [{ id: courseName.toLowerCase().replace(/\s+/g, '-'), name: courseName, count: courseModules.length }];
      console.log('Setting navigationPath:', navigationPath);
      setFilterNavigationPath(navigationPath);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log('About to set currentFilterLevel to 1');
        setCurrentFilterLevel(1);
        setRenderKey(prev => prev + 1);
        console.log('=== handleStartCourse END - Level set to 1 ===');
      }, 0);
      
    } catch (error) {
      console.error('Error in handleStartCourse:', error);
    }
  };

  // Function to handle skill level selection and proceed to modules
  const handleProceedToModules = (level: string) => {
    console.log('handleProceedToModules called with level:', level);
    try {
      const selectedCourse = filterNavigationPath[0];
      console.log('Selected course:', selectedCourse);
      const courseSkillId = `${selectedCourse.id}-${level}`;
      setSelectedSkillLevelForCourse(level);
      setCurrentFilterLevel(2);
      const levelModules = flattenedModules.filter(m => 
        m.course_title.toLowerCase().includes(selectedCourse.name.toLowerCase()) &&
        m.skill_level === level
      );
      console.log('Level modules found:', levelModules.length);
      setFilterNavigationPath([selectedCourse, { id: courseSkillId, name: `${level.charAt(0).toUpperCase() + level.slice(1)} Level`, count: levelModules.length }]);
      // Force re-render on mobile/tablet
      setRenderKey(prev => prev + 1);
      console.log('Proceed to modules completed successfully');
    } catch (error) {
      console.error('Error in handleProceedToModules:', error);
    }
  };

  // Function to determine if a module is unlocked
  const isModuleUnlocked = (moduleIndex: number, modules: any[]) => {
    if (moduleIndex === 0) return true; // First module is always unlocked
    
    const previousModule = modules[moduleIndex - 1];
    return moduleProgress[previousModule.id]?.completed || false;
  };

  // Function to start a course module
  const handleStartCourseModule = async (moduleId: string) => {
    console.log('handleStartCourseModule called with:', moduleId);
    
    if (!user?.id) {
      console.error('User not authenticated or user.id missing');
      toast({
        title: "Authentication Error",
        description: "Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Updating database for user:', user.id, 'module:', moduleId);
      
      // Update progress in database
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          progress_percentage: 10, // Mark as started
          course_id: 'halo-launch-pad-learn'
        });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Database updated successfully');

      // Update local state
      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: { completed: false, current: true }
      }));

      console.log('Local state updated');

      toast({
        title: "Module Started",
        description: "You've started this learning module!",
      });

      // Navigate to module details
      handleModuleStart(moduleId);
    } catch (error) {
      console.error("Error starting module:", error);
      toast({
        title: "Error",
        description: "Failed to start module. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to complete a module and unlock the next one
  const handleCompleteModule = async (moduleId: string, moduleIndex: number, totalModules: number) => {
    try {
      // Update progress in database
      const { error } = await supabase
        .from("course_progress")
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
          course_id: 'halo-launch-pad-learn'
        });

      if (error) throw error;

      // Update local state
      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: { completed: true, current: false }
      }));

      toast({
        title: "Module Completed!",
        description: moduleIndex < totalModules - 1 
          ? "Next module unlocked!"
          : "Course completed! Congratulations!",
      });

    } catch (error) {
      console.error("Error completing module:", error);
      toast({
        title: "Error",
        description: "Failed to complete module. Please try again.",
        variant: "destructive"
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
    
    return module.course_title.toLowerCase().includes(selectedCourse?.name.toLowerCase() || '') &&
           (selectedLevel ? module.skill_level === selectedLevel : true);
  });

  // Function to handle module start
  const handleModuleStart = (moduleId: string) => {
    setSelectedModule(moduleId);
  };

  // Function to get comprehensive course details
  const getCourseDetails = (courseName: string) => {
    const courseDetailsMap = {
      "SBA 7(a) Loans": {
        description: "Government-backed lending with favorable terms and flexible qualification requirements",
        duration: "8-12 weeks",
        difficulty: "Intermediate",
        topics: ["Loan Eligibility", "Underwriting Process", "SBA Guidelines", "Risk Assessment", "Documentation", "Portfolio Management"],
        outcome: "Master SBA 7(a) loan processing from application to closing"
      },
      "SBA Express Loans": {
        description: "Fast-track SBA financing with streamlined processing and quick approvals",
        duration: "6-8 weeks", 
        difficulty: "Beginner to Intermediate",
        topics: ["Express Processing", "Quick Approvals", "Risk Assessment", "Compliance", "Portfolio Optimization"],
        outcome: "Efficiently process SBA Express loans with speed and accuracy"
      },
      "Commercial Real Estate Financing": {
        description: "Property acquisition and development funding for commercial real estate",
        duration: "10-14 weeks",
        difficulty: "Advanced",
        topics: ["Property Analysis", "Market Valuation", "Construction Loans", "Investment Analysis", "Risk Mitigation"],
        outcome: "Structure complex commercial real estate financing deals"
      },
      "Equipment Financing": {
        description: "Asset-based lending solutions for machinery, vehicles, and business equipment",
        duration: "6-8 weeks",
        difficulty: "Intermediate", 
        topics: ["Asset Valuation", "Depreciation Analysis", "Lease vs Buy", "Security Interests", "Collection Strategies"],
        outcome: "Evaluate and finance equipment purchases effectively"
      },
      "Business Lines of Credit": {
        description: "Flexible revolving credit facilities for working capital and cash flow management",
        duration: "8-10 weeks",
        difficulty: "Intermediate",
        topics: ["Credit Analysis", "Borrowing Base", "Covenant Structure", "Monitoring", "Risk Management"],
        outcome: "Structure and manage revolving credit facilities"
      },
      "Invoice Factoring": {
        description: "Immediate cash flow solutions through accounts receivable financing",
        duration: "4-6 weeks",
        difficulty: "Beginner",
        topics: ["A/R Analysis", "Credit Risk", "Factor Agreements", "Collection Process", "Client Relations"],
        outcome: "Implement factoring solutions for immediate cash flow"
      }
    };
    
    return courseDetailsMap[courseName] || {
      description: "Comprehensive training program with practical applications",
      duration: "6-8 weeks",
      difficulty: "Intermediate", 
      topics: ["Core Concepts", "Practical Applications", "Risk Management", "Best Practices"],
      outcome: "Master essential skills for professional success"
    };
  };

  // Course image mapping function
  const getCourseImage = (index: number) => {
    const images = [
      financeExpert1, creditAnalyst2, commercialBanker3, riskSpecialist4, 
      sbaSpecialist5, complianceOfficer6, financialAdvisor7, investmentBanker8, 
      loanOfficer9, portfolioManager10
    ];
    return images[index % images.length];
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Course Header - Business Finance Mastery */}
        <CourseHeader 
          progress={75}
          totalModules={flattenedModules.length}
          completedModules={Math.floor(flattenedModules.length * 0.75)}
          onContinueLearning={() => setCurrentFilterLevel(0)}
        />

        {/* Instructor Information */}
        <InstructorInfo />

        {/* Learning Dashboard - Moved below Instructor Information */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex flex-col gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-semibold">
                  {currentFilterLevel === 0 && "13 Course Programs Available"}
                  {currentFilterLevel === 1 && "3 Skill Levels Available"}
                  {currentFilterLevel === 2 && `${filteredModules.length} ${filteredModules.length === 1 ? 'Module' : 'Modules'} Found`}
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
                  {/* Level 0: Course Program Cards */}
                  {currentFilterLevel === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {courseData.allCourses
                        .filter((course, index, self) => 
                          index === self.findIndex(c => c.title.split(' - ')[0] === course.title.split(' - ')[0])
                        )
                        .map((course, index) => {
                          const courseName = course.title.split(' - ')[0];
                          const courseModules = flattenedModules.filter(m => 
                            m.course_title.toLowerCase().includes(courseName.toLowerCase())
                          );
                          return (
                            <Card 
                              key={courseName} 
                              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                            >
                              <div className="relative overflow-hidden rounded-t-lg">
                                <img 
                                  src={getCourseImage(index)} 
                                  alt={courseName}
                                  className="w-full h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-sm line-clamp-2">{courseName}</CardTitle>
                                    <Badge variant="default" className="mt-2 mb-2">Course Program</Badge>
                                    <CardDescription className="line-clamp-3 mt-1 text-foreground">
                                      {getCourseDetails(courseName).description}
                                    </CardDescription>
                                  </div>
                                </div>
                                
                                {/* Course Details Section - Exactly 3 Rows */}
                                <div className="space-y-2 mt-4">
                                  {/* Row 1: Duration and Difficulty */}
                                  <div className="flex items-center justify-between text-xs h-6">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground">{getCourseDetails(courseName).duration}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {getCourseDetails(courseName).difficulty}
                                    </Badge>
                                  </div>
                                  
                                  {/* Row 2: Key Topics */}
                                  <div className="h-8">
                                    <div className="flex flex-wrap gap-1">
                                      {getCourseDetails(courseName).topics.slice(0, 3).map((topic, topicIndex) => (
                                        <Badge key={topicIndex} variant="outline" className="text-xs px-2 py-0.5">
                                          {topic}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Row 3: Learning Outcome */}
                                  <div className="bg-muted/50 p-2 rounded text-xs h-12 flex items-center">
                                    <div className="line-clamp-2">
                                      <span className="font-medium text-foreground">Outcome: </span>
                                      <span className="text-muted-foreground">{getCourseDetails(courseName).outcome}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 text-sm mt-3">
                                  <div className="flex items-center gap-1 text-[hsl(var(--duke-blue))]">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{courseModules.length} modules</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[hsl(var(--duke-blue))]">
                                    <Target className="h-4 w-4" />
                                    <span>3 levels</span>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <Button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Start Course button clicked for:', courseName);
                                    handleStartCourse(courseName);
                                  }}
                                  className="w-full touch-manipulation"
                                  variant="default"
                                >
                                  Start Course
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  )}

                  {/* Level 1: Skill Level Cards */}
                  {(() => {
                    console.log('=== LEVEL 1 RENDER CHECK ===');
                    console.log('currentFilterLevel:', currentFilterLevel);
                    console.log('filterNavigationPath.length:', filterNavigationPath.length);
                    console.log('filterNavigationPath:', filterNavigationPath);
                    const shouldRender = currentFilterLevel === 1 && filterNavigationPath.length > 0;
                    console.log('Should render Level 1:', shouldRender);
                    return shouldRender;
                  })() && (
                    <div className="space-y-4">
                      {/* Back button */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleReturnToDashboard}
                        className="mb-4"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Courses
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {['beginner', 'intermediate', 'expert'].map((level, index) => {
                          const selectedCourse = filterNavigationPath[0];
                          const levelModules = flattenedModules.filter(m => 
                            m.course_title.toLowerCase().includes(selectedCourse.name.toLowerCase()) &&
                            m.skill_level === level
                          );
                          return (
                            <Card 
                              key={level} 
                              className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                            >
                              <div className="relative overflow-hidden rounded-t-lg">
                                <img 
                                  src={getCourseImage(index)} 
                                  alt={`${selectedCourse.name} - ${level}`}
                                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 left-4">
                                  <Badge variant={level === "beginner" ? "default" : level === "intermediate" ? "secondary" : "destructive"}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg line-clamp-2">
                                      {selectedCourse.name} - {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1">
                                      {level === 'beginner' && 'Introduction and fundamental concepts'}
                                      {level === 'intermediate' && 'Advanced techniques and strategies'}
                                      {level === 'expert' && 'Expert-level mastery and leadership'}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                  <div className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{levelModules.length} modules</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{levelModules.length * 30} min</span>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <Button 
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Proceed to Modules button clicked for level:', level);
                                    handleProceedToModules(level);
                                  }}
                                  className="w-full touch-manipulation"
                                  variant="default"
                                >
                                  Proceed to Modules
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Level 2: Individual Module Cards */}
                  {currentFilterLevel === 2 && (
                    <div className="space-y-4">
                      {/* Navigation breadcrumb */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleReturnToDashboard}
                        >
                          Dashboard
                        </Button>
                        <span>/</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCurrentFilterLevel(1)}
                        >
                          {filterNavigationPath[0]?.name}
                        </Button>
                        <span>/</span>
                        <span className="text-foreground">{filterNavigationPath[1]?.name}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredModules.map((module, index) => {
                          const isUnlocked = isModuleUnlocked(index, filteredModules);
                          const moduleProgress = userProgress[module.id] || 0;
                          
                          return (
                            <EnhancedModuleCard
                              key={module.id}
                              module={{
                                ...module,
                                module_id: module.id,
                                lessons_count: parseInt(module.lessons.toString()) || 6,
                                order_index: index,
                                progress: moduleProgress,
                                is_completed: moduleProgress >= 100,
                                is_locked: !isUnlocked,
                                prerequisites: index > 0 ? [filteredModules[index - 1].title] : []
                              }}
                              userProgress={{
                                completion_percentage: moduleProgress,
                                is_completed: moduleProgress >= 100,
                                time_spent_minutes: Math.floor(moduleProgress * 30 / 100) // Estimate based on progress
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No results message */}
                  {((currentFilterLevel === 2 && filteredModules.length === 0) || 
                    (currentFilterLevel === 1 && filterNavigationPath.length === 0)) && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        No content found
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Try navigating back or adjusting your selection.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>


        {/* Module Detail Modal */}
        {selectedModule && (
          <ModuleDetail
            module={flattenedModules.find(m => m.id === selectedModule) || flattenedModules[0]}
            onClose={() => setSelectedModule(null)}
          />
        )}
      </div>

      <FinPilotBrandFooter />
    </div>
  );
};

export default Dashboard;