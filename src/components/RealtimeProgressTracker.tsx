import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string | null;
  lesson_id: string | null;
  progress_percentage: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    user_id: string;
    name: string;
    email: string;
  };
}

interface ProgressStats {
  totalStudents: number;
  activeStudents: number;
  avgCompletion: number;
  recentCompletions: number;
}

export const RealtimeProgressTracker = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalStudents: 0,
    activeStudents: 0,
    avgCompletion: 0,
    recentCompletions: 0
  });
  const [loading, setLoading] = useState(true);

  const loadProgressData = async () => {
    try {
      // Get progress data
      const { data: progressData, error: progressError } = await supabase
        .from('course_progress')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (progressError) throw progressError;

      if (progressData && progressData.length > 0) {
        // Get user profiles separately
        const userIds = [...new Set(progressData.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', userIds);

        // Combine progress with profile data
        const combinedData: CourseProgress[] = progressData.map(progress => ({
          ...progress,
          profiles: profilesData?.find(p => p.user_id === progress.user_id)
        }));

        setProgressData(combinedData);
        
        // Calculate stats
        const totalStudents = new Set(combinedData.map(p => p.user_id)).size;
        const activeStudents = new Set(
          combinedData
            .filter(p => p.progress_percentage > 0)
            .map(p => p.user_id)
        ).size;
        
        const avgCompletion = combinedData.length > 0 
          ? Math.round(combinedData.reduce((sum, p) => sum + p.progress_percentage, 0) / combinedData.length)
          : 0;
          
        const recentCompletions = combinedData.filter(p => 
          p.completed_at && 
          new Date(p.completed_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        setStats({
          totalStudents,
          activeStudents,
          avgCompletion,
          recentCompletions
        });
      } else {
        // No progress data yet
        setProgressData([]);
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          avgCompletion: 0,
          recentCompletions: 0
        });
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
      setProgressData([]);
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        avgCompletion: 0,
        recentCompletions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();

    // Set up real-time subscription for progress updates
    const channel = supabase
      .channel('progress-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'course_progress'
        },
        (payload) => {
          console.log('📈 Progress update:', payload);
          loadProgressData(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active Learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletion}%</p>
                <p className="text-xs text-muted-foreground">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.recentCompletions}</p>
                <p className="text-xs text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Progress Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Live Progress Updates
            <Badge variant="outline" className="ml-auto animate-pulse">LIVE</Badge>
          </CardTitle>
          <CardDescription>
            Real-time student progress across Business Finance Mastery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.length === 0 ? (
          <div className="text-center">
            <p className="text-muted-foreground">No progress data yet.</p>
            <p className="text-sm text-muted-foreground">Students' progress will appear here in real-time once they start learning.</p>
          </div>
            ) : (
              progressData.map((progress) => (
                <div key={progress.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{progress.profiles?.name || 'Student'}</p>
                    <p className="text-sm text-muted-foreground">
                      Course: {progress.course_id}
                      {progress.module_id && ` • Module: ${progress.module_id}`}
                    </p>
                  </div>
                  <div className="flex-1">
                    <Progress value={progress.progress_percentage} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {progress.progress_percentage}% complete
                    </p>
                  </div>
                  <div className="text-right">
                    {progress.completed_at ? (
                      <Badge variant="default" className="bg-green-500">
                        ✓ Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        In Progress
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(progress.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};