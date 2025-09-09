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
import { Clock, CheckCircle, PlayCircle, Lock, Trophy, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import type { ReactElement } from "react";

type ModuleStatus = "locked" | "available" | "in-progress" | "completed" | "quiz-required";

interface QuizStatus {
  completed: boolean;
  passed: boolean;
  score: number;
  attempts: number;
}

interface ModuleCardProps {
  title: string;
  description: string;
  duration: string;
  lessons: number;
  progress: number;
  status: ModuleStatus;
  topics?: string[];
  moduleId?: string;
  courseId?: string;
  onStart: () => void;
}

/**
 * Status icon configuration
 */
const STATUS_ICONS: Record<ModuleStatus, ReactElement> = {
  completed: <CheckCircle className="h-5 w-5 text-accent" />,
  "in-progress": <PlayCircle className="h-5 w-5 text-primary" />,
  locked: <Lock className="h-5 w-5 text-muted-foreground" />,
  available: <PlayCircle className="h-5 w-5 text-primary" />,
  "quiz-required": <AlertCircle className="h-5 w-5 text-orange-600" />
};

/**
 * Status badge configuration
 */
const STATUS_BADGES: Record<ModuleStatus, ReactElement> = {
  completed: <Badge variant="completed">Completed</Badge>,
  "in-progress": <Badge variant="progress">In Progress</Badge>,
  locked: <Badge variant="outline">Locked</Badge>,
  available: <Badge variant="success">Available</Badge>,
  "quiz-required": <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">Quiz Required</Badge>
};

/**
 * Status button configuration
 */
const STATUS_BUTTON_TEXT: Record<ModuleStatus, string> = {
  completed: "Review Module",
  "in-progress": "Continue Learning", 
  locked: "Start Module",
  available: "Start Module",
  "quiz-required": "Complete Quiz"
};

const ModuleCard = ({ 
  title, 
  description, 
  duration, 
  lessons, 
  progress, 
  status, 
  topics,
  moduleId,
  courseId,
  onStart 
}: ModuleCardProps) => {
  const { user } = useAuth();
  const [quizStatus, setQuizStatus] = useState<QuizStatus>({
    completed: false,
    passed: false,
    score: 0,
    attempts: 0
  });

  useEffect(() => {
    if (user?.id && moduleId) {
      loadQuizStatus();
    }
  }, [user?.id, moduleId]);

  const loadQuizStatus = async () => {
    if (!user?.id || !moduleId) return;

    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('quiz_completed, quiz_score, quiz_attempts')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setQuizStatus({
          completed: data.quiz_completed || false,
          passed: (data.quiz_score || 0) >= 70,
          score: data.quiz_score || 0,
          attempts: data.quiz_attempts || 0
        });
      }
    } catch (error) {
      console.error('Error loading quiz status:', error);
    }
  };
  /**
   * Gets the appropriate icon for current module status
   */
  const getStatusIcon = (): ReactElement => STATUS_ICONS[status];

  /**
   * Gets the appropriate badge for current module status
   */
  const getStatusBadge = (): ReactElement => {
    // Show quiz-specific badge if quiz is required but not passed
    if (quizStatus.attempts > 0 && !quizStatus.passed) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Quiz: {quizStatus.score}% (Need 70%)
        </Badge>
      );
    }
    
    // Show trophy if quiz is passed
    if (quizStatus.passed) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          Quiz Passed ({quizStatus.score}%)
        </Badge>
      );
    }
    
    return STATUS_BADGES[status];
  };

  /**
   * Gets the appropriate button text for current module status
   */
  const getButtonText = (): string => {
    if (quizStatus.attempts > 0 && !quizStatus.passed) {
      return "Continue Quiz";
    }
    if (quizStatus.passed) {
      return "Review Module";
    }
    return STATUS_BUTTON_TEXT[status];
  };

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

        {/* Quiz status indicator */}
        {quizStatus.attempts > 0 && !quizStatus.passed && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 font-medium">
                Quiz Score: {quizStatus.score}% (Attempts: {quizStatus.attempts}/3)
              </span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Complete the module quiz with 70% or higher to proceed
            </p>
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