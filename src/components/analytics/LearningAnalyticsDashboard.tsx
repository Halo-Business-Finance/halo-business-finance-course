import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, Target, TrendingUp, BookOpen, Award, Calendar, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalTimeSpent: number;
  modulesCompleted: number;
  assessmentsTaken: number;
  averageScore: number;
  weeklyActivity: { day: string; minutes: number }[];
  courseProgress: { course: string; progress: number }[];
  recentActivity: { date: string; type: string; title: string }[];
}

export function LearningAnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch daily learning activity
      const { data: activityData } = await supabase
        .from('daily_learning_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(30);

      // Fetch course progress
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('*, courses(title)')
        .eq('user_id', user.id);

      // Fetch assessment attempts
      const { data: assessmentData } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', user.id);

      // Calculate metrics
      const totalTime = activityData?.reduce((sum, d) => sum + (d.time_spent_minutes || 0), 0) || 0;
      const modulesCompleted = activityData?.reduce((sum, d) => sum + (d.modules_completed || 0), 0) || 0;
      const assessmentsTaken = assessmentData?.length || 0;
      const avgScore = assessmentData?.length 
        ? Math.round(assessmentData.reduce((sum, a) => sum + a.score, 0) / assessmentData.length)
        : 0;

      // Generate weekly activity data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyActivity = days.map((day, index) => {
        const dayData = activityData?.filter(d => {
          const date = new Date(d.activity_date);
          return date.getDay() === index;
        });
        const minutes = dayData?.reduce((sum, d) => sum + (d.time_spent_minutes || 0), 0) || 0;
        return { day, minutes };
      });

      // Group progress by course
      const courseProgressMap = new Map<string, number[]>();
      progressData?.forEach(p => {
        const courseName = (p.courses as any)?.title || p.course_id;
        if (!courseProgressMap.has(courseName)) {
          courseProgressMap.set(courseName, []);
        }
        courseProgressMap.get(courseName)?.push(p.progress_percentage || 0);
      });

      const courseProgress = Array.from(courseProgressMap.entries()).map(([course, progresses]) => ({
        course: course.slice(0, 20) + (course.length > 20 ? '...' : ''),
        progress: Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length)
      }));

      setAnalytics({
        totalTimeSpent: totalTime,
        modulesCompleted,
        assessmentsTaken,
        averageScore: avgScore,
        weeklyActivity,
        courseProgress,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Learning Analytics</h2>
          <p className="text-muted-foreground">Track your learning progress and performance</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-3 h-3 mr-1" />
          Last 30 days
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-muted-foreground">Time Invested</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {formatTime(analytics?.totalTimeSpent || 0)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Modules Completed</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {analytics?.modulesCompleted || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <span className="text-sm text-muted-foreground">Assessments Taken</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {analytics?.assessmentsTaken || 0}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-sm text-muted-foreground">Average Score</span>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {analytics?.averageScore || 0}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} min`, 'Study Time']}
                />
                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.courseProgress.slice(0, 5).map((course, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{course.course}</span>
                    <span className="text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
              {(!analytics?.courseProgress || analytics.courseProgress.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start courses to see your progress here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">🎯 Focus Area</h4>
              <p className="text-sm text-muted-foreground">
                Based on your progress, consider focusing on SBA lending modules to round out your expertise.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">⏰ Optimal Study Time</h4>
              <p className="text-sm text-muted-foreground">
                Your best performance is during morning hours. Try scheduling study sessions before noon.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">📈 Growth Opportunity</h4>
              <p className="text-sm text-muted-foreground">
                Increasing study time by 15 minutes daily could help you complete 2 more modules this month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
