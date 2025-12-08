import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Award, ChevronRight, Check, GraduationCap, TrendingUp, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  keyTopics: string[];
  modulesCount: number;
  image?: string;
  isEnrolled?: boolean;
  isAuthenticated?: boolean;
  onEnroll?: (id: string) => void;
  loading?: boolean;
  firstModuleId?: string;
  className?: string;
  index?: number;
}

export function CourseCard({
  id,
  title,
  description,
  level,
  keyTopics,
  modulesCount,
  isEnrolled = false,
  isAuthenticated = false,
  onEnroll,
  loading = false,
  firstModuleId,
  className,
  index = 0,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const courseName = title.split(' - ')[0];
  
  const getLevelConfig = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
      case 'advanced':
        return { 
          label: 'Advanced', 
          icon: Zap,
          description: 'Master complex concepts'
        };
      case 'intermediate':
        return { 
          label: 'Intermediate', 
          icon: TrendingUp,
          description: 'Build on your foundations'
        };
      default:
        return { 
          label: 'Beginner', 
          icon: BookOpen,
          description: 'Perfect for getting started'
        };
    }
  };
  
  const levelConfig = getLevelConfig(level);
  const LevelIcon = levelConfig.icon;
  const displayTopics = keyTopics.slice(0, 4);

  return (
    <Card 
      className={cn(
        "relative border-2 border-halo-navy shadow-md hover:shadow-lg transition-all duration-300 bg-white",
        isHovered && "scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-3">
          <Badge className="bg-halo-navy text-white border-halo-navy">
            <LevelIcon className="h-3 w-3 mr-1" />
            {levelConfig.label}
          </Badge>
        </div>
        <CardTitle className="text-xl text-black line-clamp-2">{courseName}</CardTitle>
        <CardDescription className="text-sm text-black/70 line-clamp-2">
          {description}
        </CardDescription>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-black">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-halo-navy" />
            <span>{modulesCount} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-halo-navy" />
            <span>{modulesCount * 2}+ hrs</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <p className="text-xs font-medium text-black/60 uppercase tracking-wide mb-3">What you'll learn:</p>
          <ul className="space-y-2">
            {displayTopics.map((topic, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-black line-clamp-1">{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-black/60">
          <Award className="h-4 w-4 text-halo-navy" />
          <span>Certificate of Completion</span>
        </div>

        {isAuthenticated ? (
          isEnrolled ? (
            <Button 
              className="w-full flex items-center gap-2 bg-halo-navy text-white hover:bg-halo-navy/90 border-halo-navy" 
              asChild
            >
              <Link to={`/module/${firstModuleId || id}`}>
                <GraduationCap className="h-4 w-4" />
                Continue Learning
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button 
              className="w-full flex items-center gap-2 bg-halo-navy text-white hover:bg-halo-navy/90 border-halo-navy"
              onClick={() => onEnroll?.(id)}
              disabled={loading}
            >
              Start Course
              <ChevronRight className="h-4 w-4" />
            </Button>
          )
        ) : (
          <Button 
            className="w-full flex items-center gap-2 bg-halo-navy text-white hover:bg-halo-navy/90 border-halo-navy" 
            variant="outline"
            asChild
          >
            <Link to="/auth">
              <Lock className="h-4 w-4" />
              Sign In to Enroll
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
        
        <p className="text-xs text-center text-black/60 mt-2">
          {levelConfig.description}
        </p>
      </CardContent>
    </Card>
  );
}
