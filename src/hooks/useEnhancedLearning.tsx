import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LearningMetrics {
  overallProgress: number;
  currentStreak: number;
  totalTime: number;
  completionRate: number;
  averageScore: number;
  modulesMastered: number;
  learningVelocity: number;
  predictedCompletion: string;
}

interface AdaptiveRecommendation {
  type: 'next_module' | 'review' | 'assessment' | 'break';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  moduleId?: string;
  reason: string;
}

interface LearningSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  moduleId?: string;
  activityType: 'study' | 'assessment' | 'review' | 'practice';
  focusScore: number;
  interactionCount: number;
}

export const useEnhancedLearning = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [learningGoals, setLearningGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time session tracking
  const startLearningSession = useCallback((moduleId?: string, activityType: LearningSession['activityType'] = 'study') => {
    const session: LearningSession = {
      id: crypto.randomUUID(),
      startTime: new Date(),
      moduleId,
      activityType,
      focusScore: 100,
      interactionCount: 0
    };
    setCurrentSession(session);
    
    // Track session start
    trackLearningEvent('session_start', { moduleId, activityType });
  }, []);

  const endLearningSession = useCallback(async () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000 / 60);
    
    try {
      // Save session to database
      await supabase.from('learning_sessions').insert({
        user_id: user?.id,
        module_id: currentSession.moduleId,
        activity_type: currentSession.activityType,
        duration_minutes: duration,
        focus_score: currentSession.focusScore,
        interaction_count: currentSession.interactionCount,
        started_at: currentSession.startTime.toISOString(),
        ended_at: endTime.toISOString()
      });

      trackLearningEvent('session_end', { 
        duration, 
        focusScore: currentSession.focusScore,
        interactions: currentSession.interactionCount 
      });

      // Update metrics after session
      await loadLearningMetrics();
      
    } catch (error) {
      console.error('Error saving learning session:', error);
    }
    
    setCurrentSession(null);
  }, [currentSession, user?.id]);

  // Advanced analytics and metrics calculation
  const loadLearningMetrics = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Parallel data fetching for performance
      const [
        { data: completions },
        { data: assessments },
        { data: sessions },
        { data: dailyActivity },
        { data: achievements }
      ] = await Promise.all([
        supabase.from('module_completions').select('*').eq('user_id', user.id),
        supabase.from('assessment_attempts').select('*').eq('user_id', user.id),
        supabase.from('learning_sessions').select('*').eq('user_id', user.id),
        supabase.from('daily_learning_activity').select('*').eq('user_id', user.id).order('activity_date', { ascending: false }).limit(30),
        supabase.from('learning_achievements').select('*').eq('user_id', user.id)
      ]);

      // Calculate comprehensive metrics
      const totalModules = 13; // From database count
      const completedModules = completions?.length || 0;
      const totalTime = sessions?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
      const totalScores = assessments?.reduce((sum, assessment) => sum + assessment.score, 0) || 0;
      const assessmentCount = assessments?.length || 0;

      // Calculate learning velocity (modules per week)
      const recentActivity = dailyActivity?.slice(0, 7) || [];
      const recentModules = recentActivity.reduce((sum, day) => sum + (day.modules_completed || 0), 0);
      const learningVelocity = recentModules / Math.max(recentActivity.length / 7, 1);

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      for (let i = 0; i < (dailyActivity?.length || 0); i++) {
        const activityDate = new Date(dailyActivity![i].activity_date).toISOString().split('T')[0];
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];
        
        if (activityDate === expectedDateStr && (dailyActivity![i].modules_completed > 0 || dailyActivity![i].time_spent_minutes > 0)) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Predict completion date based on velocity
      const remainingModules = totalModules - completedModules;
      const weeksToComplete = learningVelocity > 0 ? remainingModules / learningVelocity : 0;
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + (weeksToComplete * 7));

      const calculatedMetrics: LearningMetrics = {
        overallProgress: (completedModules / totalModules) * 100,
        currentStreak,
        totalTime,
        completionRate: (completedModules / totalModules) * 100,
        averageScore: assessmentCount > 0 ? totalScores / assessmentCount : 0,
        modulesMastered: completions?.filter(c => c.score && c.score >= 90)?.length || 0,
        learningVelocity,
        predictedCompletion: predictedDate.toLocaleDateString()
      };

      setMetrics(calculatedMetrics);
      
      // Generate adaptive recommendations
      await generateAdaptiveRecommendations(calculatedMetrics, completions || [], assessments || []);

    } catch (error) {
      console.error('Error loading learning metrics:', error);
      toast({
        title: "Error loading learning data",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // AI-powered adaptive recommendations
  const generateAdaptiveRecommendations = async (
    metrics: LearningMetrics, 
    completions: any[], 
    assessments: any[]
  ) => {
    const recommendations: AdaptiveRecommendation[] = [];

    // Get available modules
    const { data: availableModules } = await supabase
      .from('course_modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    const completedModuleIds = completions.map(c => c.module_id);
    const nextModules = availableModules?.filter(m => !completedModuleIds.includes(m.module_id)) || [];

    // Recommendation: Next logical module
    if (nextModules.length > 0) {
      const nextModule = nextModules[0];
      recommendations.push({
        type: 'next_module',
        title: `Continue with ${nextModule.title}`,
        description: `Based on your progress, this ${nextModule.skill_level} level module is your next step.`,
        priority: 'high',
        estimatedTime: parseInt(nextModule.duration?.split(' ')[0] || '60'),
        moduleId: nextModule.module_id,
        reason: 'Sequential learning path optimization'
      });
    }

    // Recommendation: Review low-scoring assessments
    const lowScoreAssessments = assessments.filter(a => a.score < 75);
    if (lowScoreAssessments.length > 0) {
      recommendations.push({
        type: 'review',
        title: 'Review Challenging Concepts',
        description: `Revisit ${lowScoreAssessments.length} topics where you scored below 75%.`,
        priority: 'medium',
        estimatedTime: 30,
        reason: 'Knowledge reinforcement needed'
      });
    }

    // Recommendation: Take a break if studying too long
    if (metrics.currentStreak > 10) {
      recommendations.push({
        type: 'break',
        title: 'Consider a Rest Day',
        description: 'You\'ve been consistently learning! A short break can improve retention.',
        priority: 'low',
        estimatedTime: 0,
        reason: 'Cognitive rest and consolidation'
      });
    }

    // Recommendation: Assessment if completed modules without recent testing
    const recentAssessments = assessments.filter(a => {
      const assessmentDate = new Date(a.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assessmentDate > weekAgo;
    });

    if (completions.length > recentAssessments.length && completions.length > 0) {
      recommendations.push({
        type: 'assessment',
        title: 'Test Your Knowledge',
        description: 'Validate your understanding with practice assessments.',
        priority: 'medium',
        estimatedTime: 20,
        reason: 'Knowledge validation and retention check'
      });
    }

    setRecommendations(recommendations);
  };

  // Learning event tracking for analytics
  const trackLearningEvent = useCallback(async (eventType: string, metadata: any = {}) => {
    if (!user?.id) return;

    try {
      await supabase.from('learning_events').insert({
        user_id: user.id,
        event_type: eventType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Error tracking learning event:', error);
    }
  }, [user?.id]);

  // Progress update with real-time sync
  const updateProgress = useCallback(async (moduleId: string, progressData: any) => {
    if (!user?.id) return;

    try {
      // Update course progress
      await supabase.from('course_progress').upsert({
        user_id: user.id,
        module_id: moduleId,
        course_id: 'halo-launch-pad-learn',
        progress_percentage: progressData.percentage || 0,
        completed_at: progressData.completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      });

      // Track progress event
      trackLearningEvent('progress_update', {
        moduleId,
        progressPercentage: progressData.percentage,
        completed: progressData.completed
      });

      // Reload metrics to reflect changes
      await loadLearningMetrics();

      toast({
        title: "Progress Updated",
        description: `Your progress has been saved.`,
      });

    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error saving progress",
        description: "Your progress couldn't be saved. Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, toast, trackLearningEvent, loadLearningMetrics]);

  // Initialize on mount
  useEffect(() => {
    if (user?.id) {
      loadLearningMetrics();
    }
  }, [user?.id, loadLearningMetrics]);

  // Session cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSession) {
        endLearningSession();
      }
    };
  }, [currentSession, endLearningSession]);

  return {
    metrics,
    recommendations,
    currentSession,
    learningGoals,
    loading,
    startLearningSession,
    endLearningSession,
    trackLearningEvent,
    updateProgress,
    loadLearningMetrics
  };
};