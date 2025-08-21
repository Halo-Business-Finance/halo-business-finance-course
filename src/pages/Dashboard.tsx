import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ModuleCard from "@/components/ModuleCard"; // Default export
import { EnhancedModuleCard } from "@/components/EnhancedModuleCard";
import { SkillLevelFilter } from "@/components/SkillLevelFilter";
import { DocumentLibrary } from "@/components/DocumentLibrary";
import StatsCard from "@/components/StatsCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseHeader from "@/components/CourseHeader";
import ModuleDetail from "@/components/ModuleDetail";
import LearningObjectives from "@/components/LearningObjectives";
import InstructorInfo from "@/components/InstructorInfo";
import { HaloBrandFooter } from "@/components/HaloBrandFooter";
import { ChatBot } from "@/components/ChatBot";
import { courseData, statsData } from "@/data/courseData";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";

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
      <div className="container mx-auto px-4 py-8">
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
      <div className="container mx-auto px-4 py-8">
        <CourseHeader 
          progress={courseData.totalProgress}
          totalModules={courseData.totalModules}
          completedModules={courseData.completedModules}
          onContinueLearning={handleContinueLearning}
        />
      </div>

        <div className="container mx-auto px-4 space-y-12">
          {/* Learning Objectives */}
          <LearningObjectives objectives={learningObjectives} />

          {/* Instructor Information */}
          <InstructorInfo />

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">Learning Platform</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Access enhanced learning modules organized by skill level, downloadable resources, 
                and interactive assessments to master business finance and commercial lending.
              </p>
            </div>

            <Tabs defaultValue="modules" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-fit">
                <TabsTrigger value="modules">Learning Modules</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="modules" className="space-y-6">
                <SkillLevelFilter
                  selectedLevel={selectedSkillLevel}
                  onLevelChange={setSelectedSkillLevel}
                  counts={skillLevelCounts}
                />

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-muted rounded-lg h-48" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {enhancedModules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModules.map((module) => (
                          <EnhancedModuleCard 
                            key={module.id} 
                            module={module} 
                            userProgress={userProgress[module.module_id]}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              <TabsContent value="resources">
                <DocumentLibrary />
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Assistant */}
          <div className="space-y-8 pb-16">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">AI Learning Assistant</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Get personalized help with financial concepts, ask questions about the modules, 
                and receive expert guidance powered by ChatGPT.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <ChatBot />
            </div>
          </div>
          
          {/* Halo Brand Footer */}
          <HaloBrandFooter />
        </div>

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