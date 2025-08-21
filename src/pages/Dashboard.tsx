import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAdminRole } from "@/hooks/useAdminRole";
import CourseHeader from "@/components/CourseHeader";
import ModuleCard from "@/components/ModuleCard";
import ModuleDetail from "@/components/ModuleDetail";
import StatsCard from "@/components/StatsCard";
import LearningObjectives from "@/components/LearningObjectives";
import InstructorInfo from "@/components/InstructorInfo";
import { HaloBrandFooter } from "@/components/HaloBrandFooter";
import { ChatBot } from "@/components/ChatBot";
import { courseData, statsData } from "@/data/courseData";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const { isAdmin } = useAdminRole();
  const [modules, setModules] = useState(courseData.modules);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const learningObjectives = [
    "Analyze financial statements and assess business creditworthiness using industry-standard methodologies",
    "Differentiate between various loan products including SBA 7(a), 504, conventional, and bridge financing options",
    "Navigate capital markets and understand the role of financial intermediaries in business lending",
    "Apply risk assessment techniques and regulatory compliance standards in commercial lending decisions",
    "Structure financing solutions that align with client needs and risk tolerance parameters",
    "Demonstrate proficiency in credit analysis, underwriting, and portfolio management principles"
  ];

  const handleModuleStart = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Allow admins to access all modules
    if (module.status === "locked" && !isAdmin) {
      toast({
        title: "Module Locked",
        description: "Complete previous modules to unlock this one.",
        variant: "destructive"
      });
      return;
    }

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

          {/* Course Modules */}
          <div className="space-y-8 pb-16">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold">Learning Modules</h3>
              <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Progress through Halo's specialized curriculum designed to develop expertise in business finance, 
                commercial lending practices, and risk management strategies used in today's financial markets.
              </p>
            </div>

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