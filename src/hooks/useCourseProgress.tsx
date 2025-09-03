import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  progress_percentage: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  [moduleId: string]: {
    completed: boolean;
    current: boolean;
    progress_percentage: number;
  };
}

export const useCourseProgress = (userId?: string, courseId?: string) => {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProgress = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const progressData = data || [];
      setProgress(progressData);

      // Build module progress map
      const moduleProgressMap: ModuleProgress = {};
      progressData.forEach(prog => {
        if (prog.module_id) {
          moduleProgressMap[prog.module_id] = {
            completed: prog.progress_percentage === 100,
            current: prog.progress_percentage > 0 && prog.progress_percentage < 100,
            progress_percentage: prog.progress_percentage
          };
        }
      });
      
      setModuleProgress(moduleProgressMap);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch course progress';
      setError(errorMessage);
      console.error('Error fetching course progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    moduleId: string, 
    progressPercentage: number, 
    courseIdOverride?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const targetCourseId = courseIdOverride || courseId || 'halo-launch-pad-learn';
      
      const { data, error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: userId,
          course_id: targetCourseId,
          module_id: moduleId,
          progress_percentage: progressPercentage,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const existingIndex = prev.findIndex(p => p.module_id === moduleId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });

      // Update module progress map
      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: {
          completed: progressPercentage === 100,
          current: progressPercentage > 0 && progressPercentage < 100,
          progress_percentage: progressPercentage
        }
      }));

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update progress';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Error updating progress:', err);
      return false;
    }
  };

  const startModule = async (moduleId: string, courseIdOverride?: string): Promise<boolean> => {
    return await updateProgress(moduleId, 10, courseIdOverride);
  };

  const completeModule = async (moduleId: string, courseIdOverride?: string): Promise<boolean> => {
    const result = await updateProgress(moduleId, 100, courseIdOverride);
    
    if (result && userId) {
      // Check if this completes the entire course and unlock other courses
      try {
        const targetCourseId = courseIdOverride || courseId || 'halo-launch-pad-learn';
        await supabase.rpc('unlock_courses_on_completion', {
          p_user_id: userId,
          p_course_id: targetCourseId
        });
      } catch (error) {
        console.warn('Error checking course completion for unlock:', error);
        // Don't fail the module completion if unlock check fails
      }
    }
    
    return result;
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    
    const totalProgress = progress.reduce((sum, prog) => sum + prog.progress_percentage, 0);
    return Math.round(totalProgress / progress.length);
  };

  const getCompletedModulesCount = () => {
    return progress.filter(prog => prog.progress_percentage === 100).length;
  };

  const isModuleUnlocked = (moduleIndex: number, modules: any[]) => {
    if (moduleIndex === 0) return true; // First module is always unlocked
    
    const previousModule = modules[moduleIndex - 1];
    return moduleProgress[previousModule?.id]?.completed || false;
  };

  useEffect(() => {
    fetchProgress();
  }, [userId, courseId]);

  return {
    progress,
    moduleProgress,
    loading,
    error,
    fetchProgress,
    updateProgress,
    startModule,
    completeModule,
    getOverallProgress,
    getCompletedModulesCount,
    isModuleUnlocked,
  };
};