import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Lock, CheckCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface EnhancedModule {
  id: string;
  module_id: string;
  title: string;
  description: string;
  skill_level: 'beginner' | 'intermediate' | 'expert';
  duration: string;
  lessons_count: number;
  order_index: number;
  prerequisites: string[];
  progress?: number;
  is_completed?: boolean;
  is_locked?: boolean;
}

interface EnhancedModuleCardProps {
  module: EnhancedModule;
  userProgress?: {
    completion_percentage: number;
    is_completed: boolean;
    time_spent_minutes: number;
  };
}

export function EnhancedModuleCard({ module, userProgress }: EnhancedModuleCardProps) {
  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progress = userProgress?.completion_percentage || 0;
  const isCompleted = userProgress?.is_completed || false;
  const isLocked = module.is_locked || false;

  return (
    <Card className={`group transition-all duration-300 hover:shadow-lg ${
      isLocked ? 'opacity-60 bg-muted/30' : 'hover:-translate-y-1'
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${getSkillLevelColor(module.skill_level)}`}
            >
              {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : isLocked ? (
              <Lock className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Play className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
        
        <CardTitle className="text-xl leading-tight mb-2">{module.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">
          {module.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{module.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{module.lessons_count} lessons</span>
            </div>
          </div>
        </div>

        {userProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {userProgress.time_spent_minutes > 0 && (
              <p className="text-xs text-muted-foreground">
                Time spent: {Math.round(userProgress.time_spent_minutes)} minutes
              </p>
            )}
          </div>
        )}

        {module.prerequisites && module.prerequisites.length > 0 && !isCompleted && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Prerequisites:</p>
            <div className="flex flex-wrap gap-1">
              {module.prerequisites.map(prereq => (
                <Badge key={prereq} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          {isLocked ? (
            <Button variant="outline" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Complete Prerequisites First
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to={`/module/${module.module_id}`}>
                {isCompleted ? "Review Module" : progress > 0 ? "Continue Learning" : "Start Learning Today"}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}