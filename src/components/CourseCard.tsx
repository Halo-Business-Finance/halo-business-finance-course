import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, Users, Award, ArrowRight, Check, Lock, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  image,
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
        return { 
          label: 'Expert', 
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: TrendingUp
        };
      case 'advanced':
        return { 
          label: 'Advanced', 
          className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
          icon: TrendingUp
        };
      default:
        return { 
          label: 'Beginner', 
          className: 'bg-success/10 text-success border-success/20',
          icon: Sparkles
        };
    }
  };
  
  const levelConfig = getLevelConfig(level);
  const LevelIcon = levelConfig.icon;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50",
        "transition-all duration-500 ease-out",
        "hover:shadow-[0_20px_50px_-12px_hsl(var(--primary)/0.25)]",
        "hover:border-primary/40 hover:-translate-y-2",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Animated gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      )} />
      
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-1 to-chart-2",
        "transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
      )} />

      {/* Card Content */}
      <div className="relative flex flex-col flex-1 p-6 space-y-5">
        {/* Header with badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">
                Course Program
              </span>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", levelConfig.className)}
          >
            <LevelIcon className="h-3 w-3 mr-1" />
            {levelConfig.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
          {courseName}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Key Topics */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
            Key Topics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {keyTopics.slice(0, 3).map((topic, idx) => (
              <span 
                key={idx}
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
                  "bg-secondary/60 text-secondary-foreground",
                  "transition-colors duration-200"
                )}
              >
                {topic.length > 20 ? topic.substring(0, 20) + '...' : topic}
              </span>
            ))}
            {keyTopics.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-muted-foreground">
                +{keyTopics.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">4-6 Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Self-Paced</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-chart-1" />
            <span className="font-medium">Certificate</span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        {isAuthenticated ? (
          isEnrolled ? (
            <Link to={`/module/${firstModuleId}`} className="block mt-2">
              <Button 
                className={cn(
                  "w-full h-12 font-semibold text-sm tracking-wide",
                  "bg-success hover:bg-success/90 text-white",
                  "transition-all duration-300 group/btn"
                )}
              >
                <Check className="h-4 w-4 mr-2" />
                Continue Learning
                <ArrowRight className={cn(
                  "h-4 w-4 ml-2 transition-transform duration-300",
                  isHovered ? "translate-x-1" : ""
                )} />
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => onEnroll?.(id)} 
              disabled={loading}
              className={cn(
                "w-full h-12 font-semibold text-sm tracking-wide",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "transition-all duration-300 group/btn"
              )}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Start Course
              <ArrowRight className={cn(
                "h-4 w-4 ml-2 transition-transform duration-300",
                isHovered ? "translate-x-1" : ""
              )} />
            </Button>
          )
        ) : (
          <Link to="/auth" className="block mt-2">
            <Button 
              className={cn(
                "w-full h-12 font-semibold text-sm tracking-wide",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "transition-all duration-300 group/btn"
              )}
            >
              <Lock className="h-4 w-4 mr-2" />
              Sign In to Enroll
              <ArrowRight className={cn(
                "h-4 w-4 ml-2 transition-transform duration-300",
                isHovered ? "translate-x-1" : ""
              )} />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
