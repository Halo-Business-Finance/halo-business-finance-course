import { Trophy, Star, Target, Zap, Award, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: "trophy" | "star" | "target" | "zap" | "award" | "medal";
  unlocked: boolean;
  progress?: number;
  color: string;
}

interface AchievementBadgesProps {
  badges: Badge[];
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  award: Award,
  medal: Medal,
};

const colorMap: Record<string, string> = {
  gold: "from-yellow-400 to-amber-600",
  silver: "from-gray-300 to-gray-500",
  bronze: "from-orange-400 to-orange-700",
  platinum: "from-cyan-300 to-blue-500",
  emerald: "from-emerald-400 to-green-600",
  purple: "from-purple-400 to-violet-600",
};

export function AchievementBadges({ badges, className }: AchievementBadgesProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Achievements</h3>
        <span className="text-sm text-muted-foreground">
          {badges.filter(b => b.unlocked).length}/{badges.length} unlocked
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <TooltipProvider>
          {badges.map((badge) => {
            const Icon = iconMap[badge.icon];
            const gradientClass = colorMap[badge.color] || colorMap.gold;
            
            return (
              <Tooltip key={badge.id}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 cursor-pointer",
                      badge.unlocked
                        ? `bg-gradient-to-br ${gradientClass} shadow-lg hover:scale-110 hover:shadow-xl`
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 transition-colors",
                      badge.unlocked ? "text-white" : "text-muted-foreground/50"
                    )} />
                    
                    {!badge.unlocked && badge.progress !== undefined && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/70 rounded-full transition-all duration-500"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {badge.unlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-semibold">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                  {!badge.unlocked && badge.progress !== undefined && (
                    <p className="text-xs text-primary mt-1">{badge.progress}% complete</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
