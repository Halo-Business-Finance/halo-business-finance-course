import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LearningStats {
  id: string;
  user_id: string;
  total_modules_completed: number;
  total_time_spent_minutes: number;
  total_assessments_passed: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_at: string;
  created_at: string;
}

export interface DashboardStats {
  modulesCompleted: number;
  timeSpentHours: number;
  assessmentsPassed: number;
  currentStreak: number;
  longestStreak: number;
  progressScore: number;
}

export const useLearningStats = (userId?: string) => {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    modulesCompleted: 0,
    timeSpentHours: 0,
    assessmentsPassed: 0,
    currentStreak: 0,
    longestStreak: 0,
    progressScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLearningStats = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setStats(data);
        
        // Calculate dashboard stats
        const timeHours = Math.round((data.total_time_spent_minutes || 0) / 60);
        const progressScore = Math.min(100, Math.round(
          ((data.total_modules_completed || 0) * 20) + 
          ((data.total_assessments_passed || 0) * 15) + 
          ((data.current_streak_days || 0) * 5)
        ));

        setDashboardStats({
          modulesCompleted: data.total_modules_completed || 0,
          timeSpentHours: timeHours,
          assessmentsPassed: data.total_assessments_passed || 0,
          currentStreak: data.current_streak_days || 0,
          longestStreak: data.longest_streak_days || 0,
          progressScore
        });
      } else {
        // No stats yet, initialize with defaults
        setDashboardStats({
          modulesCompleted: 0,
          timeSpentHours: 0,
          assessmentsPassed: 0,
          currentStreak: 0,
          longestStreak: 0,
          progressScore: 0
        });
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch learning stats';
      setError(errorMessage);
      console.error('Error fetching learning stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLearningStats = async (updates: Partial<LearningStats>) => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from('learning_stats')
        .upsert({
          user_id: userId,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setStats(data);
        // Recalculate dashboard stats
        await fetchLearningStats();
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update learning stats';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating learning stats:', err);
      return false;
    }
  };

  const incrementModuleCompleted = async () => {
    if (!stats) return false;
    
    return await updateLearningStats({
      total_modules_completed: (stats.total_modules_completed || 0) + 1,
      last_activity_at: new Date().toISOString()
    });
  };

  const incrementAssessmentPassed = async () => {
    if (!stats) return false;
    
    return await updateLearningStats({
      total_assessments_passed: (stats.total_assessments_passed || 0) + 1,
      last_activity_at: new Date().toISOString()
    });
  };

  const addTimeSpent = async (minutes: number) => {
    if (!stats) return false;
    
    return await updateLearningStats({
      total_time_spent_minutes: (stats.total_time_spent_minutes || 0) + minutes,
      last_activity_at: new Date().toISOString()
    });
  };

  const updateStreak = async (days: number) => {
    if (!stats) return false;
    
    const newLongestStreak = Math.max(stats.longest_streak_days || 0, days);
    
    return await updateLearningStats({
      current_streak_days: days,
      longest_streak_days: newLongestStreak,
      last_activity_at: new Date().toISOString()
    });
  };

  useEffect(() => {
    fetchLearningStats();
  }, [userId]);

  return {
    stats,
    dashboardStats,
    loading,
    error,
    fetchLearningStats,
    updateLearningStats,
    incrementModuleCompleted,
    incrementAssessmentPassed,
    addTimeSpent,
    updateStreak,
  };
};