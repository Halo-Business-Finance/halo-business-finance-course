/**
 * EnhancedModuleCard - Advanced module card with comprehensive progress tracking
 * 
 * Features:
 * - Detailed progress tracking with time spent
 * - Prerequisites display and validation
 * - Skill level indicators with color coding
 * - Topic preview with truncation
 * - Smart button text based on completion state
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Lock, CheckCircle, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactElement } from "react";

type SkillLevel = 'beginner' | 'expert';

interface EnhancedModule {
  id: string;
  module_id: string;
  title: string;
  description: string;
  skill_level: SkillLevel;
  duration: string;
  lessons_count: number;
  order_index: number;
  prerequisites: string[];
  topics?: string[];
  progress?: number;
  is_completed?: boolean;
  is_locked?: boolean;
}

interface UserProgress {
  completion_percentage: number;
  is_completed: boolean;
  time_spent_minutes: number;
}

interface EnhancedModuleCardProps {
  module: EnhancedModule;
  userProgress?: UserProgress;
  image?: string;
}

/**
 * Skill level color mapping for consistent styling
 */
const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  expert: 'bg-red-100 text-red-800 border-red-200'
};

/**
 * Maximum number of topics to display before truncation
 */
const MAX_VISIBLE_TOPICS = 4;

/**
 * Gets skill level styling classes
 */
const getSkillLevelStyling = (level: SkillLevel): string => {
  return SKILL_LEVEL_COLORS[level] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Capitalizes first letter of skill level
 */
const formatSkillLevel = (level: SkillLevel): string => {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

/**
 * Formats time spent in a readable format
 */
const formatTimeSpent = (minutes: number): string => {
  return `${Math.round(minutes)} minutes`;
};

/**
 * Determines button text based on module state
 */
const getButtonText = (isCompleted: boolean, progress: number): string => {
  if (isCompleted) return "Review Module";
  if (progress > 0) return "Continue Learning";
  return "Start Learning Today";
};

/**
 * Renders the appropriate status icon based on module state
 */
const renderStatusIcon = (isCompleted: boolean, isLocked: boolean): ReactElement => {
  if (isCompleted) {
    return <CheckCircle className="h-5 w-5 text-emerald-500" />;
  }
  if (isLocked) {
    return <Lock className="h-5 w-5 text-muted-foreground" />;
  }
  return <Play className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />;
};

export function EnhancedModuleCard({ module, userProgress, image }: EnhancedModuleCardProps) {
  // Derived state for cleaner component logic
  const progress = userProgress?.completion_percentage || 0;
  const isCompleted = userProgress?.is_completed || false;
  const isLocked = module.is_locked || false;
  const hasTimeSpent = userProgress && userProgress.time_spent_minutes > 0;
  const hasPrerequisites = module.prerequisites && module.prerequisites.length > 0;
  const visibleTopics = module.topics?.slice(0, MAX_VISIBLE_TOPICS) || [];
  const remainingTopicsCount = (module.topics?.length || 0) - MAX_VISIBLE_TOPICS;

  return (
    <Card className={`group transition-all duration-300 hover:shadow-lg overflow-hidden ${
      isLocked ? 'opacity-60 bg-muted/30' : 'hover:-translate-y-1'
    }`}>
      {/* Module Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs font-medium ${getSkillLevelStyling(module.skill_level)}`}
            >
              {formatSkillLevel(module.skill_level)}
            </Badge>
          </div>
          <div className="text-right">
            {renderStatusIcon(isCompleted, isLocked)}
          </div>
        </div>
        
        <CardTitle className="text-xl leading-tight mb-2">{module.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-3">
          {module.description}
        </CardDescription>
        
        {/* Topics/Lesson Plan */}
        {module.topics && module.topics.length > 0 && (
          <div className="space-y-2 mt-3">
            <h4 className="text-sm font-medium text-foreground">Lesson Plan:</h4>
            <ul className="space-y-1">
              {visibleTopics.map((topic, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
              {remainingTopicsCount > 0 && (
                <li className="text-sm text-muted-foreground ml-3">
                  +{remainingTopicsCount} more topics
                </li>
              )}
            </ul>
          </div>
        )}
      </CardHeader>
      
      {/* Module Content */}
      <CardContent className="pt-0 space-y-4">
        {/* Module Metadata */}
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

        {/* Progress Section */}
        {userProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {hasTimeSpent && (
              <p className="text-xs text-muted-foreground">
                Time spent: {formatTimeSpent(userProgress.time_spent_minutes)}
              </p>
            )}
          </div>
        )}

        {/* Prerequisites Section */}
        {hasPrerequisites && !isCompleted && (
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

        {/* Action Button */}
        <div className="pt-2">
          {isLocked ? (
            <Button variant="outline" className="w-full" disabled>
              <Lock className="h-4 w-4 mr-2" />
              Complete Prerequisites First
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to={`/module/${module.module_id}`}>
                {getButtonText(isCompleted, progress)}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}