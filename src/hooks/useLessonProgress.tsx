import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LessonStep {
  id: string;
  name: string;
  type: 'overview' | 'video' | 'content' | 'assessment' | 'summary';
  completed: boolean;
  timeSpent: number;
}

export const useLessonProgress = (lessonId: string, moduleId: string) => {
  const [progress, setProgress] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Initialize lesson steps
  useEffect(() => {
    const defaultSteps: LessonStep[] = [
      { id: 'overview', name: 'Lesson Overview', type: 'overview', completed: false, timeSpent: 0 },
      { id: 'video', name: 'Learning Video', type: 'video', completed: false, timeSpent: 0 },
      { id: 'content', name: 'Study Materials', type: 'content', completed: false, timeSpent: 0 },
      { id: 'assessment', name: 'Knowledge Check', type: 'assessment', completed: false, timeSpent: 0 },
      { id: 'summary', name: 'Lesson Summary', type: 'summary', completed: false, timeSpent: 0 }
    ];
    setSteps(defaultSteps);
  }, []);

  // Load existing progress from database
  useEffect(() => {
    loadProgress();
  }, [lessonId, moduleId]);

  // Start tracking session time
  useEffect(() => {
    setSessionStartTime(new Date());
    
    return () => {
      // Save progress when component unmounts
      if (sessionStartTime) {
        saveCurrentProgress();
      }
    };
  }, [currentStep]);

  const loadProgress = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgress(data);
        // Use progress_percentage from the existing schema
        const savedSteps = data.quiz_completed ? 
          steps.map(step => ({ ...step, completed: true })) : 
          steps;
        setSteps(savedSteps);
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error);
      toast({
        title: "Error",
        description: "Failed to load lesson progress",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !sessionStartTime) return;

      const timeSpent = Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      const completedSteps = steps.filter(step => step.completed).length;
      const completionPercentage = Math.round((completedSteps / steps.length) * 100);
      const isCompleted = completionPercentage === 100;

      const progressData = {
        user_id: user.id,
        course_id: moduleId,
        module_id: moduleId,
        lesson_id: lessonId,
        progress_percentage: completionPercentage,
        quiz_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('course_progress')
        .upsert(progressData)
        .select()
        .single();

      if (error) throw error;

      setProgress(data);
      
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const completeStep = async (stepIndex: number) => {
    const updatedSteps = steps.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    );
    
    setSteps(updatedSteps);
    
    // Auto-advance to next step if not the last one
    if (stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
    
    await saveCurrentProgress();
    
    toast({
      title: "Step Completed!",
      description: `${steps[stepIndex].name} has been marked as complete.`,
    });
  };

  const goToStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setSessionStartTime(new Date());
    }
  };

  const completeLesson = async () => {
    try {
      // Mark all steps as completed
      const completedSteps = steps.map(step => ({ ...step, completed: true }));
      setSteps(completedSteps);
      
      await saveCurrentProgress();
      
      toast({
        title: "🎉 Lesson Completed!",
        description: "Congratulations on completing this lesson. You're making great progress!",
      });
      
      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to save lesson completion",
        variant: "destructive",
      });
      return false;
    }
  };

  const getProgressStats = () => {
    const completedSteps = steps.filter(step => step.completed).length;
    const totalTimeSpent = steps.reduce((total, step) => total + step.timeSpent, 0);
    const averageTimePerStep = totalTimeSpent / Math.max(completedSteps, 1);
    
    return {
      completedSteps,
      totalSteps: steps.length,
      completionPercentage: Math.round((completedSteps / steps.length) * 100),
      totalTimeSpent,
      averageTimePerStep: Math.round(averageTimePerStep),
      isCompleted: completedSteps === steps.length
    };
  };

  return {
    progress,
    currentStep,
    steps,
    loading,
    completeStep,
    goToStep,
    completeLesson,
    saveCurrentProgress,
    getProgressStats
  };
};