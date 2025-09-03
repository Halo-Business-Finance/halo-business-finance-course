/**
 * ModuleCard - Displays learning module information with progress tracking
 * 
 * Features:
 * - Shows module status with appropriate icons and styling
 * - Progress tracking for in-progress modules
 * - Topic listing for lesson plans
 * - Responsive design with status-based interactions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, PlayCircle, Lock } from "lucide-react";
import type { ReactElement } from "react";

type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

interface ModuleCardProps {
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: ModuleStatus;
  topics?: string[];
  onStart: () => void;
}

/**
 * Status icon configuration
 */
const STATUS_ICONS: Record<ModuleStatus, ReactElement> = {
  completed: <CheckCircle className="h-5 w-5 text-accent" />,
  "in-progress": <PlayCircle className="h-5 w-5 text-primary" />,
  locked: <Lock className="h-5 w-5 text-muted-foreground" />,
  available: <PlayCircle className="h-5 w-5 text-primary" />
};

/**
 * Status badge configuration
 */
const STATUS_BADGES: Record<ModuleStatus, ReactElement> = {
  completed: <Badge variant="completed">Completed</Badge>,
  "in-progress": <Badge variant="progress">In Progress</Badge>,
  locked: <Badge variant="outline">Locked</Badge>,
  available: <Badge variant="success">Available</Badge>
};

/**
 * Status button configuration
 */
const STATUS_BUTTON_TEXT: Record<ModuleStatus, string> = {
  completed: "Review Module",
  "in-progress": "Continue Learning", 
  locked: "Start Module",
  available: "Start Module"
};

const ModuleCard = ({ 
  title, 
  description, 
  duration, 
  lessons, 
  progress, 
  status, 
  topics,
  onStart 
}: ModuleCardProps) => {
  /**
   * Gets the appropriate icon for current module status
   */
  const getStatusIcon = (): ReactElement => STATUS_ICONS[status];

  /**
   * Gets the appropriate badge for current module status
   */
  const getStatusBadge = (): ReactElement => STATUS_BADGES[status];

  /**
   * Gets the appropriate button text for current module status
   */
  const getButtonText = (): string => STATUS_BUTTON_TEXT[status];

  /**
   * Gets the button variant based on status
   */
  const getButtonVariant = (): "success" | "course" => {
    return status === "completed" ? "success" : "course";
  };

  const isDisabled = status === "locked";

  return (
    <Card className={`group hover:shadow-elevated transition-all duration-300 ${
      isDisabled ? "opacity-60" : "hover:-translate-y-1"
    }`}>
      {/* Module Header */}
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              {/* Module Metadata */}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {duration}
                </div>
                <span>{lessons} lessons</span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        
        {/* Topics/Lesson Plan */}
        {topics && topics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Lesson Plan:</h4>
            <ul className="space-y-1">
              {topics.map((topic, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardHeader>

      {/* Module Content */}
      <CardContent className="space-y-4">
        {/* Progress Bar for In-Progress Modules */}
        {status === "in-progress" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant={getButtonVariant()}
          className="w-full"
          disabled={isDisabled}
          onClick={onStart}
        >
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;