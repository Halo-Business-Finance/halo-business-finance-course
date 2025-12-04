import { motion } from 'framer-motion';
import { Trophy, Zap, BookOpen, Crown, Target, Flame, Calendar, Star, Sunrise, Moon, GraduationCap, Award, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Badge as BadgeType, UserBadge } from '@/hooks/useGamification';

interface BadgeDisplayProps {
  badges: BadgeType[];
  userBadges: UserBadge[];
  showLocked?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  zap: Zap,
  'book-open': BookOpen,
  crown: Crown,
  target: Target,
  flame: Flame,
  calendar: Calendar,
  star: Star,
  sunrise: Sunrise,
  moon: Moon,
  'graduation-cap': GraduationCap,
  footprints: Award,
};

export function BadgeDisplay({ badges, userBadges, showLocked = true }: BadgeDisplayProps) {
  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

  const categorizedBadges = badges.reduce((acc, badge) => {
    const category = badge.category || 'achievement';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, BadgeType[]>);

  const categoryLabels: Record<string, string> = {
    milestone: 'Milestones',
    achievement: 'Achievements',
    performance: 'Performance',
    engagement: 'Engagement',
    special: 'Special',
    certification: 'Certifications'
  };

  return (
    <div className="space-y-6">
      {Object.entries(categorizedBadges).map(([category, categoryBadges]) => (
        <Card key={category} className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">
              {categoryLabels[category] || category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryBadges.map((badge) => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                const IconComponent = iconMap[badge.icon] || Trophy;

                if (!showLocked && !isEarned) return null;

                return (
                  <TooltipProvider key={badge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className={`
                            relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all
                            ${isEarned 
                              ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg shadow-primary/10' 
                              : 'bg-muted/30 border border-border/30 opacity-50 grayscale'
                            }
                          `}
                        >
                          {isEarned && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          )}
                          
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center mb-2
                            ${isEarned 
                              ? 'bg-primary/20 text-primary' 
                              : 'bg-muted text-muted-foreground'
                            }
                          `}>
                            {isEarned ? (
                              <IconComponent className="w-6 h-6" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </div>
                          
                          <span className={`text-xs font-medium text-center line-clamp-2 ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {badge.name}
                          </span>
                          
                          <Badge variant={isEarned ? "default" : "secondary"} className="mt-2 text-xs">
                            {badge.points} pts
                          </Badge>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
