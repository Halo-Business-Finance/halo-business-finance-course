import { Clock, Users, Trophy, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EnhancedCourseCardProps {
  title: string;
  description: string;
  image: string;
  duration: string;
  difficulty: string;
  topics: string[];
  progress?: number;
  modulesCount?: number;
  completedModules?: number;
  isEnrolled?: boolean;
  onStart: () => void;
  className?: string;
}

export function EnhancedCourseCard({
  title,
  description,
  image,
  duration,
  difficulty,
  topics,
  progress = 0,
  modulesCount = 0,
  completedModules = 0,
  isEnrolled = false,
  onStart,
  className,
}: EnhancedCourseCardProps) {
  const isCompleted = progress >= 100;
  
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-500",
      "hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1",
      className
    )}>
      {/* Glassmorphism overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Image section with overlay */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border",
            difficulty === "Expert" 
              ? "bg-red-500/20 text-red-300 border-red-500/30" 
              : difficulty === "Multiple Levels"
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
          )}>
            {difficulty}
          </span>
        </div>
        
        {/* Completion badge */}
        {isCompleted && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/90 text-white text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed
            </div>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="relative p-5 space-y-4">
        {/* Institution badge */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs">
            FP
          </div>
          <span className="text-xs text-muted-foreground">FinPilot Academy</span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        {/* Progress bar (if enrolled) */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{completedModules}/{modulesCount} modules completed</span>
            </div>
          </div>
        )}
        
        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Self-Paced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span>Certificate</span>
          </div>
        </div>
        
        {/* Topics */}
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 3).map((topic, idx) => (
            <span 
              key={idx}
              className="px-2.5 py-1 bg-secondary/50 text-secondary-foreground text-xs rounded-lg font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
        
        {/* CTA Button */}
        <Button 
          onClick={onStart}
          className={cn(
            "w-full h-11 font-semibold transition-all duration-300 group/btn",
            isEnrolled 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-navy-900 hover:bg-navy-800"
          )}
        >
          <span>{isEnrolled ? "Continue Learning" : "Start Course"}</span>
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
