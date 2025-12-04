import { motion } from 'framer-motion';
import { Award, BookOpen, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGamification } from '@/hooks/useGamification';
import { StreakDisplay } from './StreakDisplay';
import { BadgeDisplay } from './BadgeDisplay';
import { Leaderboard } from './Leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

export function GamificationDashboard() {
  const { badges, userBadges, streak, isLoading } = useGamification();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const earnedCount = userBadges.length;
  const totalCount = badges.length;
  const progressPercent = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Achievements</h2>
          <p className="text-muted-foreground">
            Track your progress and earn rewards
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{earnedCount}/{totalCount}</div>
          <div className="text-sm text-muted-foreground">Badges Earned ({progressPercent}%)</div>
        </div>
      </div>

      {/* Streak Stats */}
      <StreakDisplay streak={streak} />

      {/* Tabs for Badges and Leaderboard */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Progress
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="badges">
          <BadgeDisplay badges={badges} userBadges={userBadges} showLocked={true} />
        </TabsContent>
        
        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Recently Earned</h3>
              {userBadges.slice(0, 5).map((ub) => {
                const badge = badges.find(b => b.id === ub.badge_id);
                if (!badge) return null;
                return (
                  <motion.div
                    key={ub.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ub.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary">+{badge.points} pts</span>
                  </motion.div>
                );
              })}
              {userBadges.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Complete lessons and quizzes to earn badges!
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Next Badges to Earn</h3>
              {badges.filter(b => !userBadges.some(ub => ub.badge_id === b.id)).slice(0, 5).map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg opacity-70"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Award className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">+{badge.points} pts</span>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
