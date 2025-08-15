import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import CourseHeader from "@/components/CourseHeader";
import ModuleCard from "@/components/ModuleCard";
import StatsCard from "@/components/StatsCard";
import { courseData, statsData } from "@/data/courseData";
import { BookOpen, Clock, Target, Trophy } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState(courseData.modules);

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

    toast({
      title: "Starting Module",
      description: `Beginning "${module.title}" - good luck with your learning!`,
    });

    // Update module status to in-progress if available
    if (module.status === "available") {
      setModules(prev => prev.map(m => 
        m.id === moduleId 
          ? { ...m, status: "in-progress" as const, progress: 5 }
          : m
      ));
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
        />
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-8">
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
      </div>

      {/* Course Modules */}
      <div className="container mx-auto px-4 pb-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Course Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Progress through our comprehensive curriculum designed to build your expertise 
              in business finance from the ground up.
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
      </div>
    </div>
  );
};

export default Index;
