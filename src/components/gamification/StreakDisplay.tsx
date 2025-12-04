import { motion } from 'framer-motion';
import { Flame, TrendingUp, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { LearningStreak } from '@/hooks/useGamification';

interface StreakDisplayProps {
  streak: LearningStreak | null;
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalPoints = streak?.total_points || 0;

  const streakEmoji = currentStreak >= 30 ? '🔥' : currentStreak >= 7 ? '⚡' : currentStreak >= 3 ? '✨' : '💪';
  
  const streakMessage = currentStreak >= 30 
    ? "You're on fire! Incredible dedication!" 
    : currentStreak >= 7 
    ? "Week warrior! Keep it going!" 
    : currentStreak >= 3 
    ? "Great start! Build that momentum!" 
    : "Start your learning streak today!";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Current Streak */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-500/30 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-lg text-muted-foreground">days</span>
              <span className="text-2xl">{streakEmoji}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{streakMessage}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Longest Streak */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm text-muted-foreground">Best Streak</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{longestStreak}</span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Personal record</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Points */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border-yellow-500/30 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="text-sm text-muted-foreground">Total Points</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{totalPoints.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground">pts</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Lifetime earnings</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Last Activity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30 overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-sm text-muted-foreground">Last Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">
                {streak?.last_activity_date 
                  ? new Date(streak.last_activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Not started'
                }
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Keep learning daily!</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
