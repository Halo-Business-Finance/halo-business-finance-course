import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ModuleCard from "@/components/ModuleCard"; // Default export
import PublicModuleCard from "@/components/PublicModuleCard";
import { EnhancedModuleCard } from "@/components/EnhancedModuleCard";
import { SkillLevelFilter } from "@/components/SkillLevelFilter";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import StatsCard from "@/components/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { courseData, statsData } from "@/data/courseData";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";

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
  const [modules, setModules] = useState(courseData.modules);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState("all");
  const [enhancedModules, setEnhancedModules] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnhancedModules();
      fetchUserProgress();
    }
  }, [user]);

  const fetchEnhancedModules = async () => {
    try {
      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      setEnhancedModules(data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

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

  const filteredModules = enhancedModules.filter(module => 
    selectedSkillLevel === "all" || module.skill_level === selectedSkillLevel
  );

  const skillLevelCounts = {
    all: enhancedModules.length,
    beginner: enhancedModules.filter(m => m.skill_level === "beginner").length,
    intermediate: enhancedModules.filter(m => m.skill_level === "intermediate").length,
    expert: enhancedModules.filter(m => m.skill_level === "expert").length,
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
    const module = modules.find(m => m.id === moduleId) || 
                   enhancedModules.find(m => m.module_id === moduleId);
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
      {/* Course Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CourseHeader 
          progress={courseData.totalProgress}
          totalModules={courseData.totalModules}
          completedModules={courseData.completedModules}
          onContinueLearning={handleContinueLearning}
        />
      </div>

      {/* Course Catalog Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="text-left space-y-4">
            <h2 className="text-3xl font-bold">Course Catalog</h2>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              Browse all available modules organized by skill level. Track your progress and continue your learning journey.
            </p>
          </div>

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
                    {enhancedModules.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredModules.map((module, index) => (
                          <PublicModuleCard
                            key={module.id}
                            title={module.title}
                            description={module.description || ""}
                            duration={module.duration || ""}
                            lessons={module.lessons_count || 0}
                            skillLevel={module.skill_level}
                            moduleId={module.module_id}
                            image={getCourseImage(index)}
                            isAuthenticated={true}
                            onEnrollClick={() => handleModuleStart(module.module_id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {modules.map((module) => (
                          <ModuleCard
                            key={module.id}
                            title={module.title}
                            description={module.description}
                            duration={module.duration}
                            lessons={module.lessons}
                            progress={module.progress}
                            status={module.status}
                            onStart={() => handleModuleStart(module.id)}
                          />
                        ))}
                      </div>
              )}

              {filteredModules.length === 0 && enhancedModules.length > 0 && (
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
              <h3 className="text-3xl font-bold">Learning Platform</h3>
              <p className="text-muted-foreground max-w-3xl leading-relaxed">
                Access enhanced learning modules organized by skill level, downloadable resources, 
                and interactive assessments to master business finance and commercial lending.
              </p>
            </div>

            <Tabs defaultValue="modules" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 sm:w-fit">
                <TabsTrigger value="modules" className="text-sm">Modules</TabsTrigger>
                <TabsTrigger value="progress" className="text-sm">Progress</TabsTrigger>
                <TabsTrigger value="assessment" className="text-sm">Assessment</TabsTrigger>
                <TabsTrigger value="analytics" className="text-sm">Analytics</TabsTrigger>
                <TabsTrigger value="social" className="text-sm">Social</TabsTrigger>
                <TabsTrigger value="tools" className="text-sm">Tools</TabsTrigger>
                <TabsTrigger value="gamification" className="text-sm">Achievements</TabsTrigger>
                <TabsTrigger value="adaptive" className="text-sm">AI Learning</TabsTrigger>
                <TabsTrigger value="market" className="text-sm">Market Data</TabsTrigger>
                <TabsTrigger value="resources" className="text-sm">Resources</TabsTrigger>
              </TabsList>

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
                    {enhancedModules.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredModules.map((module) => (
                          <EnhancedModuleCard 
                            key={module.id} 
                            module={module} 
                            userProgress={userProgress[module.module_id]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {modules.map((module) => (
                          <ModuleCard
                            key={module.id}
                            title={module.title}
                            description={module.description}
                            duration={module.duration}
                            lessons={module.lessons}
                            progress={module.progress}
                            status={module.status}
                            onStart={() => handleModuleStart(module.id)}
                          />
                        ))}
                      </div>
                )}

                    {filteredModules.length === 0 && enhancedModules.length > 0 && (
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
          module={modules.find(m => m.id === selectedModule)!}
          onClose={closeModuleDetail}
        />
      )}
    </div>
  );
};

export default Dashboard;