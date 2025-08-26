import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target,
  Award,
  Zap,
  Crown,
  Gift,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  deadline?: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  completed: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  level: number;
  achievements: number;
  streak: number;
}

interface UserStats {
  totalPoints: number;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  rank: number;
  completedChallenges: number;
  unlockedAchievements: number;
}

export const GamificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    rank: 0,
    completedChallenges: 0,
    unlockedAchievements: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadGamificationData();
    }
  }, [user?.id]);

  const loadGamificationData = async () => {
    try {
      await Promise.all([
        loadUserStats(),
        loadAchievements(),
        loadChallenges(),
        loadLeaderboard()
      ]);
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    // Simulate user stats - in real implementation, this would come from database
    const mockStats: UserStats = {
      totalPoints: 1250,
      level: 5,
      currentXP: 50,
      nextLevelXP: 150,
      streak: 7,
      rank: 15,
      completedChallenges: 8,
      unlockedAchievements: 12
    };
    setUserStats(mockStats);
  };

  const loadAchievements = async () => {
    const mockAchievements: Achievement[] = [
      {
        id: 'first_module',
        title: 'First Steps',
        description: 'Complete your first learning module',
        icon: BookOpen,
        points: 50,
        rarity: 'common',
        category: 'Learning',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'quiz_master',
        title: 'Quiz Master',
        description: 'Score 100% on 5 different quizzes',
        icon: Trophy,
        points: 200,
        rarity: 'rare',
        category: 'Assessment',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'streak_warrior',
        title: 'Streak Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: Flame,
        points: 150,
        rarity: 'rare',
        category: 'Consistency',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      },
      {
        id: 'social_learner',
        title: 'Social Learner',
        description: 'Help 10 fellow learners in the forum',
        icon: Users,
        points: 100,
        rarity: 'common',
        category: 'Community',
        unlocked: false
      },
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Complete a module in under 30 minutes',
        icon: Zap,
        points: 75,
        rarity: 'common',
        category: 'Efficiency',
        unlocked: false
      },
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Complete all modules with 95%+ scores',
        icon: Crown,
        points: 500,
        rarity: 'legendary',
        category: 'Excellence',
        unlocked: false
      }
    ];
    setAchievements(mockAchievements);
  };

  const loadChallenges = async () => {
    const mockChallenges: Challenge[] = [
      {
        id: 'daily_study',
        title: 'Daily Study Session',
        description: 'Study for at least 30 minutes today',
        target: 30,
        current: 25,
        reward: 25,
        type: 'daily',
        completed: false,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'weekly_modules',
        title: 'Weekly Progress',
        description: 'Complete 3 modules this week',
        target: 3,
        current: 2,
        reward: 100,
        type: 'weekly',
        completed: false,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'forum_participation',
        title: 'Community Helper',
        description: 'Answer 5 questions in the forum',
        target: 5,
        current: 1,
        reward: 75,
        type: 'weekly',
        completed: false,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'perfect_quiz',
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        target: 1,
        current: 0,
        reward: 50,
        type: 'special',
        completed: false
      }
    ];
    setChallenges(mockChallenges);
  };

  const loadLeaderboard = async () => {
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, userId: 'user1', userName: 'Sarah Chen', points: 2500, level: 8, achievements: 25, streak: 15 },
      { rank: 2, userId: 'user2', userName: 'Mike Rodriguez', points: 2200, level: 7, achievements: 22, streak: 12 },
      { rank: 3, userId: 'user3', userName: 'Jennifer Liu', points: 1950, level: 6, achievements: 20, streak: 8 },
      { rank: 4, userId: 'user4', userName: 'David Kim', points: 1800, level: 6, achievements: 18, streak: 5 },
      { rank: 5, userId: 'user5', userName: 'Amanda Foster', points: 1650, level: 5, achievements: 16, streak: 10 },
      { rank: 15, userId: user?.id || '', userName: user?.email?.split('@')[0] || 'You', points: 1250, level: 5, achievements: 12, streak: 7 }
    ];
    setLeaderboard(mockLeaderboard);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'rare': return 'bg-blue-100 border-blue-300 text-blue-700';
      case 'epic': return 'bg-purple-100 border-purple-300 text-purple-700';
      case 'legendary': return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default: return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-green-100 text-green-700';
      case 'weekly': return 'bg-blue-100 text-blue-700';
      case 'monthly': return 'bg-purple-100 text-purple-700';
      case 'special': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const claimChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    // Mark as completed
    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, completed: true } : c
    ));

    // Award points
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + challenge.reward,
      currentXP: prev.currentXP + challenge.reward
    }));

    toast({
      title: "Challenge Completed! 🎉",
      description: `You earned ${challenge.reward} points!`
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-primary">{userStats.level}</p>
              </div>
              <Star className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>XP Progress</span>
                <span>{userStats.currentXP}/{userStats.nextLevelXP}</span>
              </div>
              <Progress value={(userStats.currentXP / userStats.nextLevelXP) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold text-yellow-600">{userStats.totalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.streak} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
                <p className="text-2xl font-bold text-green-600">#{userStats.rank}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={selectedTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </Button>
        <Button 
          variant={selectedTab === 'achievements' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('achievements')}
        >
          Achievements
        </Button>
        <Button 
          variant={selectedTab === 'challenges' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('challenges')}
        >
          Challenges
        </Button>
        <Button 
          variant={selectedTab === 'leaderboard' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('leaderboard')}
        >
          Leaderboard
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={achievement.id} className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm opacity-80">{achievement.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{achievement.points} pts</Badge>
                              <Badge variant="outline">{achievement.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {challenges.filter(c => !c.completed).slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{challenge.title}</h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getChallengeTypeColor(challenge.type)}>
                            {challenge.type}
                          </Badge>
                          {challenge.deadline && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeRemaining(challenge.deadline)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.current}/{challenge.target}</span>
                        </div>
                        <Progress value={(challenge.current / challenge.target) * 100} />
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant="outline">{challenge.reward} points</Badge>
                        {challenge.current >= challenge.target && (
                          <Button size="sm" onClick={() => claimChallenge(challenge.id)}>
                            Claim Reward
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const IconComponent = achievement.icon;
                return (
                  <div 
                    key={achievement.id} 
                    className={`p-6 rounded-lg border-2 transition-all ${
                      achievement.unlocked 
                        ? getRarityColor(achievement.rarity)
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${achievement.unlocked ? 'bg-white' : 'bg-gray-200'}`}>
                        {achievement.unlocked ? (
                          <IconComponent className="h-8 w-8" />
                        ) : (
                          <Lock className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm opacity-80 mt-1">{achievement.description}</p>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline">{achievement.points} pts</Badge>
                          <Badge variant="outline">{achievement.category}</Badge>
                          <Badge className={getRarityColor(achievement.rarity).replace('bg-', 'bg-').replace('border-', '').replace('text-', '')}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        
                        {achievement.unlockedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {selectedTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className={challenge.completed ? 'bg-green-50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {challenge.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getChallengeTypeColor(challenge.type)}>
                          {challenge.type}
                        </Badge>
                        {challenge.deadline && !challenge.completed && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ends in {formatTimeRemaining(challenge.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.current}/{challenge.target}</span>
                      </div>
                      <Progress value={(challenge.current / challenge.target) * 100} />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        <span className="text-sm font-medium">{challenge.reward} points</span>
                      </div>
                      {challenge.current >= challenge.target && !challenge.completed && (
                        <Button size="sm" onClick={() => claimChallenge(challenge.id)}>
                          Claim Reward
                        </Button>
                      )}
                      {challenge.completed && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Global Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div 
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.userId === user?.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {entry.rank <= 3 ? <Crown className="h-4 w-4" /> : entry.rank}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            Level {entry.level} • {entry.achievements} achievements
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold">{entry.points.toLocaleString()} pts</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Flame className="h-3 w-3" />
                          {entry.streak} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};