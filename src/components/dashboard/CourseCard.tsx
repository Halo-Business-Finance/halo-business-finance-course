// Reusable course card component

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Play, CheckCircle } from "lucide-react";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  image?: string;
  isEnrolled?: boolean;
  onEnroll?: (courseId: string) => void;
  onStart?: (courseName: string) => void;
  onContinue?: (courseId: string) => void;
  loading?: boolean;
}

export const CourseCard = ({
  course,
  image,
  isEnrolled = false,
  onEnroll,
  onStart,
  onContinue,
  loading = false
}: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'advanced':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'expert':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted';
    }
  };

  const handlePrimaryAction = () => {
    if (isEnrolled && onContinue) {
      onContinue(course.id);
    } else if (onStart) {
      // Extract base course name without level suffix
      const baseName = course.title.replace(/ - (Beginner|Expert)$/, '');
      onStart(baseName);
    } else if (onEnroll) {
      onEnroll(course.id);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20 animate-fade-in">
      {image && (
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={image}
            alt={`${course.title} course illustration`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {isEnrolled && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enrolled
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {course.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={getLevelColor(course.level)}
              >
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
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

      <CardContent className="pt-0 space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {course.description}
        </CardDescription>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.modules?.length || 0} modules
          </div>
        </div>

        <Button
          onClick={handlePrimaryAction}
          disabled={loading}
          className="w-full group-hover:shadow-md transition-all"
          variant={isEnrolled ? "default" : "outline"}
        >
          <Play className="h-4 w-4 mr-2" />
          {loading ? "Loading..." : isEnrolled ? "Continue Learning" : "Start Course"}
        </Button>
      </CardContent>
    </Card>
  );
};