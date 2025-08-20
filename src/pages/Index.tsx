import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CourseHeader from "@/components/CourseHeader";
import ModuleCard from "@/components/ModuleCard";
import ModuleDetail from "@/components/ModuleDetail";
import StatsCard from "@/components/StatsCard";
import LearningObjectives from "@/components/LearningObjectives";
import InstructorInfo from "@/components/InstructorInfo";
import { courseData, statsData } from "@/data/courseData";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState(courseData.modules);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const learningObjectives: string[] = [];

  const handleModuleStart = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    if (module.status === "locked") {
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
                description={stat.description}
                icon={Icon}
                trend={stat.trend}
              />
            );
          })}
        </div>

        {/* Course Modules */}
        <div className="space-y-8 pb-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Course Curriculum</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Course modules will appear here once they are configured and ready for learning.
            </p>
          </div>

          {modules.length > 0 ? (
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
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
              <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Modules Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Course modules are being prepared and will be available soon. Check back later for new content.
              </p>
            </div>
          )}
        </div>
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

export default Index;
