/**
 * CourseCard - Displays course information in an interactive card format
 * 
 * Features:
 * - Shows course details (title, description, level, duration)
 * - Displays enrollment status with visual indicators
 * - Handles enrollment and continuation actions
 * - Shows locked state for courses that can't be accessed
 * - Responsive design with hover effects
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Play, CheckCircle, Lock } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  image?: string;
  isEnrolled?: boolean;
  enrollmentStatus?: 'active' | 'locked_studying_other' | 'completed';
  isActiveStudy?: boolean;
  onEnroll?: (courseId: string) => void;
  onStart?: (courseName: string) => void;
  onContinue?: (courseId: string) => void;
  loading?: boolean;
}

/**
 * Maps course level to appropriate styling classes
 */
const getLevelStyling = (level: string): string => {
  const levelStyles: Record<string, string> = {
    beginner: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    intermediate: 'bg-blue-100 text-blue-700 hover:bg-blue-100', 
    advanced: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    expert: 'bg-purple-100 text-purple-700 hover:bg-purple-100'
  };
  
  return levelStyles[level] || 'bg-muted text-muted-foreground hover:bg-muted';
};

/**
 * Extracts base course name by removing level suffix
 */
const extractBaseName = (title: string): string => {
  return title.replace(/ - (Beginner|Expert)$/, '');
};

/**
 * Capitalizes first letter of a string
 */
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const CourseCard = ({
  course,
  image,
  isEnrolled = false,
  enrollmentStatus = 'active',
  isActiveStudy = false,
  onEnroll,
  onStart,
  onContinue,
  loading = false
}: CourseCardProps) => {
  const isLocked = enrollmentStatus === 'locked_studying_other';
  const isCompleted = enrollmentStatus === 'completed';

  /**
   * Handles the primary action button click based on course state
   */
  const handlePrimaryAction = (): void => {
    if (isLocked) return; // Prevent action if course is locked
    
    if (isEnrolled && onContinue) {
      onContinue(course.id);
    } else if (onStart) {
      const baseName = extractBaseName(course.title);
      onStart(baseName);
    } else if (onEnroll) {
      onEnroll(course.id);
    }
  };

  /**
   * Determines button text based on current state
   */
  const getButtonText = (): string => {
    if (loading) return "Loading...";
    if (isLocked) return "Complete Active Course First";
    if (isCompleted) return "Review Course";
    if (isEnrolled) return isActiveStudy ? "Continue Learning" : "Start Learning";
    return "Start Course";
  };

  /**
   * Gets enrollment badge component
   */
  const getEnrollmentBadge = () => {
    if (isActiveStudy) {
      return (
        <Badge className="bg-blue-500 text-white hover:bg-blue-500">
          <Play className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge className="bg-green-500 text-white hover:bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (isLocked) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      );
    }
    if (isEnrolled) {
      return (
        <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Enrolled
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className={`group transition-all duration-300 animate-fade-in ${
      isLocked 
        ? 'opacity-60 border-dashed cursor-not-allowed' 
        : 'hover:shadow-lg hover:border-primary/20 cursor-pointer'
    }`}>
      {/* Course Image with Status Badge */}
      {image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={`${course.title} course illustration`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isLocked ? 'grayscale' : 'group-hover:scale-105'
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {getEnrollmentBadge() && (
            <div className="absolute top-3 right-3">
              {getEnrollmentBadge()}
            </div>
          )}
          {isLocked && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center">
                <Lock className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Complete your active course first</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Course Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className={`text-lg leading-tight transition-colors ${
              isLocked ? 'text-muted-foreground' : 'group-hover:text-primary'
            }`}>
              {course.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={getLevelStyling(course.level)}
              >
                {capitalizeFirst(course.level)}
              </Badge>
              {course.duration && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {course.duration}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Course Content */}
      <CardContent className="pt-0 space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {course.description}
        </CardDescription>

        {/* Course Metadata */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.modules?.length || 0} modules
          </div>
        </div>

        {/* Primary Action Button */}
        <Button
          onClick={handlePrimaryAction}
          disabled={loading || isLocked}
          className={`w-full transition-all ${
            isLocked ? 'cursor-not-allowed' : 'group-hover:shadow-md'
          }`}
          variant={isEnrolled && !isLocked ? "default" : "outline"}
        >
          {isLocked ? (
            <Lock className="h-4 w-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {getButtonText()}
        </Button>
      </CardContent>
    </Card>
  );
};