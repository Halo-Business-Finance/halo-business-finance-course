import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  Zap, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Medal,
  Crown,
  Gem,
  Flame,
  Calendar,
  Users,
  Brain,
  CheckCircle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'learning' | 'quiz' | 'progress' | 'time' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: {
    type: 'modules_completed' | 'quiz_perfect' | 'streak_days' | 'total_time' | 'first_module' | 'all_modules' | 'speed_quiz' | 'note_taker' | 'bookmarks';
    value: number;
    description: string;
  };
  unlockedAt?: Date;
  isUnlocked: boolean;
  progress: number; // 0-100
}

interface UserStats {
  modulesCompleted: number;
  quizzesPassed: number;
  perfectQuizzes: number;
  streakDays: number;
  totalTimeSpent: number; // in minutes
  notesCount: number;
  bookmarksCount: number;
  achievementPoints: number;
}

interface AchievementSystemProps {
  userStats: UserStats;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  showNotifications?: boolean;
}

const achievementTemplates: Omit<Achievement, 'isUnlocked' | 'progress' | 'unlockedAt'>[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first module',
    icon: BookOpen,
    category: 'learning',
    rarity: 'common',
    points: 50,
    requirement: {
      type: 'modules_completed',
      value: 1,
      description: 'Complete 1 module'
    }
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Complete 5 modules',
    icon: Award,
    category: 'learning',
    rarity: 'rare',
    points: 200,
    requirement: {
      type: 'modules_completed',
      value: 5,
      description: 'Complete 5 modules'
    }
  },
  {
    id: 'master_learner',
    title: 'Master Learner',
    description: 'Complete all available modules',
    icon: Crown,
    category: 'learning',
    rarity: 'legendary',
    points: 1000,
    requirement: {
      type: 'all_modules',
      value: 1,
      description: 'Complete all modules'
    }
  },
  {
    id: 'perfect_score',
    title: 'Perfect Score',
    description: 'Score 100% on a quiz',
    icon: Star,
    category: 'quiz',
    rarity: 'rare',
    points: 150,
    requirement: {
      type: 'quiz_perfect',
      value: 1,
      description: 'Score 100% on any quiz'
    }
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: Trophy,
    category: 'quiz',
    rarity: 'epic',
    points: 500,
    requirement: {
      type: 'quiz_perfect',
      value: 5,
      description: 'Score 100% on 5 quizzes'
    }
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a quiz in under 5 minutes',
    icon: Zap,
    category: 'quiz',
    rarity: 'rare',
    points: 200,
    requirement: {
      type: 'speed_quiz',
      value: 1,
      description: 'Complete a quiz in under 5 minutes'
    }
  },
  {
    id: 'streak_starter',
    title: 'Streak Starter',
    description: 'Learn for 3 consecutive days',
    icon: Flame,
    category: 'time',
    rarity: 'common',
    points: 100,
    requirement: {
      type: 'streak_days',
      value: 3,
      description: 'Learn for 3 consecutive days'
    }
  },
  {
    id: 'on_fire',
    title: 'On Fire!',
    description: 'Learn for 7 consecutive days',
    icon: Flame,
    category: 'time',
    rarity: 'rare',
    points: 300,
    requirement: {
      type: 'streak_days',
      value: 7,
      description: 'Learn for 7 consecutive days'
    }
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Learn for 30 consecutive days',
    icon: Crown,
    category: 'time',
    rarity: 'legendary',
    points: 1500,
    requirement: {
      type: 'streak_days',
      value: 30,
      description: 'Learn for 30 consecutive days'
    }
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Spend 10 hours learning',
    icon: Clock,
    category: 'time',
    rarity: 'rare',
    points: 250,
    requirement: {
      type: 'total_time',
      value: 600, // 10 hours in minutes
      description: 'Spend 10 hours learning'
    }
  },
  {
    id: 'note_taker',
    title: 'Note Taker',
    description: 'Create 20 study notes',
    icon: BookOpen,
    category: 'learning',
    rarity: 'common',
    points: 100,
    requirement: {
      type: 'note_taker',
      value: 20,
      description: 'Create 20 study notes'
    }
  },
  {
    id: 'bookmark_collector',
    title: 'Bookmark Collector',
    description: 'Save 50 bookmarks',
    icon: Target,
    category: 'learning',
    rarity: 'common',
    points: 75,
    requirement: {
      type: 'bookmarks',
      value: 50,
      description: 'Save 50 bookmarks'
    }
  }
];

export const AchievementSystem = ({ 
  userStats, 
  onAchievementUnlocked,
  showNotifications = true 
}: AchievementSystemProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();

  // Calculate achievement progress and unlock status
  const calculateAchievementProgress = (template: typeof achievementTemplates[0]): Achievement => {
    let progress = 0;
    let isUnlocked = false;

    switch (template.requirement.type) {
      case 'modules_completed':
        progress = Math.min((userStats.modulesCompleted / template.requirement.value) * 100, 100);
        isUnlocked = userStats.modulesCompleted >= template.requirement.value;
        break;
      
      case 'quiz_perfect':
        progress = Math.min((userStats.perfectQuizzes / template.requirement.value) * 100, 100);
        isUnlocked = userStats.perfectQuizzes >= template.requirement.value;
        break;
      
      case 'streak_days':
        progress = Math.min((userStats.streakDays / template.requirement.value) * 100, 100);
        isUnlocked = userStats.streakDays >= template.requirement.value;
        break;
      
      case 'total_time':
        progress = Math.min((userStats.totalTimeSpent / template.requirement.value) * 100, 100);
        isUnlocked = userStats.totalTimeSpent >= template.requirement.value;
        break;
      
      case 'note_taker':
        progress = Math.min((userStats.notesCount / template.requirement.value) * 100, 100);
        isUnlocked = userStats.notesCount >= template.requirement.value;
        break;
      
      case 'bookmarks':
        progress = Math.min((userStats.bookmarksCount / template.requirement.value) * 100, 100);
        isUnlocked = userStats.bookmarksCount >= template.requirement.value;
        break;
      
      case 'all_modules':
        // Assuming 10 total modules for now - this could be dynamic
        progress = Math.min((userStats.modulesCompleted / 10) * 100, 100);
        isUnlocked = userStats.modulesCompleted >= 10;
        break;
      
      default:
        progress = 0;
        isUnlocked = false;
    }

    return {
      ...template,
      progress,
      isUnlocked,
      unlockedAt: isUnlocked ? new Date() : undefined
    };
  };

  // Update achievements when stats change
  useEffect(() => {
    const updatedAchievements = achievementTemplates.map(calculateAchievementProgress);
    
    // Check for newly unlocked achievements
    const previouslyUnlocked = achievements.filter(a => a.isUnlocked).map(a => a.id);
    const newlyUnlockedAchievements = updatedAchievements.filter(
      a => a.isUnlocked && !previouslyUnlocked.includes(a.id)
    );

    setAchievements(updatedAchievements);

    // Handle newly unlocked achievements
    if (newlyUnlockedAchievements.length > 0 && showNotifications) {
      setNewlyUnlocked(newlyUnlockedAchievements);
      setShowCelebration(true);
      
      newlyUnlockedAchievements.forEach(achievement => {
        onAchievementUnlocked?.(achievement);
        
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.title} - ${achievement.points} points`,
        });
      });

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setNewlyUnlocked([]);
      }, 3000);
    }
  }, [userStats, achievements, onAchievementUnlocked, showNotifications, toast]);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300 bg-gray-50';
      case 'rare': return 'text-blue-600 border-blue-300 bg-blue-50';
      case 'epic': return 'text-purple-600 border-purple-300 bg-purple-50';
      case 'legendary': return 'text-yellow-600 border-yellow-300 bg-yellow-50';
      default: return 'text-gray-600 border-gray-300 bg-gray-50';
    }
  };

  const getRarityBadgeColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'default';
      case 'rare': return 'secondary';
      case 'epic': return 'destructive';
      case 'legendary': return 'default'; // Will be styled with gold
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'learning': return BookOpen;
      case 'quiz': return Brain;
      case 'progress': return TrendingUp;
      case 'time': return Calendar;
      case 'social': return Users;
      case 'special': return Gem;
      default: return Award;
    }
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = (unlockedAchievements.length / achievements.length) * 100;

  return (
    <div className="space-y-6">
      {/* Achievement Celebration */}
      <AnimatePresence>
        {showCelebration && newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Card className="border-yellow-300 bg-yellow-50 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-yellow-800">Achievement Unlocked!</h3>
                    <p className="text-sm text-yellow-700">
                      {newlyUnlocked[0].title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{unlockedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{completionPercentage.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{unlockedAchievements.length}/{achievements.length}</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const IconComponent = achievement.icon;
          const CategoryIcon = getCategoryIcon(achievement.category);
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className={`h-full transition-all duration-200 ${
                achievement.isUnlocked 
                  ? `border-2 ${getRarityColor(achievement.rarity)}` 
                  : 'opacity-60 border-dashed'
              }`}>
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.isUnlocked 
                        ? getRarityColor(achievement.rarity)
                        : 'bg-muted'
                    }`}>
                      {achievement.isUnlocked ? (
                        <IconComponent className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={getRarityBadgeColor(achievement.rarity)}
                        className={achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                      >
                        {achievement.rarity}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CategoryIcon className="h-3 w-3" />
                        {achievement.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${
                      achievement.isUnlocked ? '' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm mb-3 ${
                      achievement.isUnlocked ? 'text-muted-foreground' : 'text-muted-foreground'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      {achievement.requirement.description}
                    </div>

                    {!achievement.isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round(achievement.progress)}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{achievement.points}</span>
                    </div>
                    
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="text-xs text-muted-foreground">
                        {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Categories Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {['learning', 'quiz', 'progress', 'time', 'social', 'special'].map(category => {
              const categoryAchievements = achievements.filter(a => a.category === category);
              const unlockedInCategory = categoryAchievements.filter(a => a.isUnlocked).length;
              const CategoryIcon = getCategoryIcon(category as Achievement['category']);
              
              return (
                <div key={category} className="text-center p-3 bg-muted rounded-lg">
                  <CategoryIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium capitalize">{category}</div>
                  <div className="text-xs text-muted-foreground">
                    {unlockedInCategory}/{categoryAchievements.length}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};