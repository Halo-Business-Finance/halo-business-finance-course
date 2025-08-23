import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award,
  Calendar,
  Flame,
  BarChart3,
  Activity
} from "lucide-react";

interface LearningStats {
  total_modules_completed: number;
  total_assessments_passed: number;
  total_time_spent_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_at: string;
}

interface DailyActivity {
  activity_date: string;
  modules_completed: number;
  assessments_taken: number;
  time_spent_minutes: number;
}

interface Achievement {
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  earned_at: string;
}

export const LiveLearningStats = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<DailyActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    if (!user?.id) return;
    
    loadLearningData();
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to learning stats changes
    const statsChannel = supabase
      .channel('learning-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          
          if (payload.new) {
            setStats(payload.new as LearningStats);
            
            // Show toast for significant updates
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              toast({
                title: "📊 Stats Updated!",
                description: "Your learning statistics have been updated.",
                duration: 3000,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to daily activity changes
    const activityChannel = supabase
      .channel('daily-activity-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_learning_activity',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          
          loadRecentActivity();
        }
      )
      .subscribe();

    // Subscribe to new achievements
    const achievementsChannel = supabase
      .channel('achievements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'learning_achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          
          if (payload.new) {
            const newAchievement = payload.new as Achievement;
            setAchievements(prev => [newAchievement, ...prev]);
            
            // Show celebration toast
            toast({
              title: "🎉 Achievement Unlocked!",
              description: `${newAchievement.achievement_title}: ${newAchievement.achievement_description}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(achievementsChannel);
    };
  }, [user?.id, toast]);

  const loadLearningData = async () => {
    if (!user?.id) return;

    try {
      // Load learning stats
      const { data: statsData, error: statsError } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        console.error('Error loading stats:', statsError);
      } else if (statsData) {
        setStats(statsData);
      }

      await Promise.all([
        loadRecentActivity(),
        loadAchievements()
      ]);

    } catch (error) {
      console.error('Error loading learning data:', error);
      toast({
        title: "Error",
        description: "Failed to load learning statistics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('daily_learning_activity')
      .select('*')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(7);

    if (error) {
      console.error('Error loading recent activity:', error);
    } else {
      setRecentActivity(data || []);
    }
  };

  const loadAchievements = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from('learning_achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error loading achievements:', error);
    } else {
      setAchievements(data || []);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.total_modules_completed || 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-primary/70" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-primary"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessments Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.total_assessments_passed || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600/70" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-success"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(stats?.total_time_spent_minutes || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600/70" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.current_streak_days || 0}
                  <span className="text-sm ml-1">days</span>
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-600/70" />
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500"></div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatDate(activity.activity_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {activity.modules_completed > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {activity.modules_completed}
                        </span>
                      )}
                      {activity.assessments_taken > 0 && (
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {activity.assessments_taken}
                        </span>
                      )}
                      {activity.time_spent_minutes > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(activity.time_spent_minutes)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity found</p>
                <p className="text-sm">Start learning to see your activity here!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Award className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{achievement.achievement_title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.achievement_description}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(achievement.earned_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet</p>
                <p className="text-sm">Complete modules and assessments to earn achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Streak Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats?.current_streak_days || 0} days
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-3xl font-bold text-primary">
                {stats?.longest_streak_days || 0} days
              </p>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next milestone</span>
              <span className="text-muted-foreground">
                {Math.min(stats?.current_streak_days || 0, 7)}/7 days
              </span>
            </div>
            <Progress 
              value={Math.min(((stats?.current_streak_days || 0) / 7) * 100, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {(stats?.current_streak_days || 0) >= 7 
                ? "🎉 You've reached the weekly streak milestone!" 
                : `${7 - (stats?.current_streak_days || 0)} more days to reach your weekly milestone!`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};