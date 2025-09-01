import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdaptiveModule {
  id: string;
  module_key: string;
  title: string;
  description: string;
  order_index: number;
  module_type: string;
  difficulty_level: string;
  base_duration: string;
  learning_objectives: string[];
  adaptive_content: any;
  assessment_criteria: any;
  prerequisites: string[];
  skills_taught: string[];
  is_active: boolean;
}

interface AdaptiveModuleInstance {
  id: string;
  user_id: string;
  course_id: string;
  adaptive_module_id: string;
  personalized_content: any;
  current_difficulty_level: string;
  adaptive_path: any;
  performance_metrics: any;
  completion_status: string;
  progress_percentage: number;
  time_spent_minutes: number;
  last_accessed_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  adaptive_module: AdaptiveModule;
}

interface AdaptiveAssessment {
  moduleKey: string;
  questions: any[];
  userAnswers: Record<string, any>;
  score: number;
  difficultyLevel: string;
  completionTime: number;
  adaptiveRecommendations: string[];
}

export const useAdaptiveLearning = (courseId: string = 'halo-launch-pad-learn') => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [adaptiveModules, setAdaptiveModules] = useState<AdaptiveModuleInstance[]>([]);
  const [currentModule, setCurrentModule] = useState<AdaptiveModuleInstance | null>(null);
  const [userPerformanceProfile, setUserPerformanceProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);

  // Load user's adaptive module instances
  const loadAdaptiveModules = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data: instances, error } = await supabase
        .from('adaptive_module_instances')
        .select(`
          *,
          adaptive_module:adaptive_modules(*)
        `)
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .order('adaptive_module(order_index)');

      if (error) throw error;

      setAdaptiveModules((instances as any) || []);
      
      // Set first incomplete module as current if none is set
      if (!currentModule && instances?.length > 0) {
        const firstIncomplete = instances.find(instance => 
          instance.completion_status !== 'completed'
        );
        if (firstIncomplete) {
          setCurrentModule(firstIncomplete as any);
        }
      }
    } catch (error) {
      console.error('Error loading adaptive modules:', error);
      toast({
        title: "Error loading adaptive modules",
        description: "Please refresh the page to try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, courseId, currentModule, toast]);

  // Adaptive assessment system
  const conductAdaptiveAssessment = useCallback(async (moduleInstance: AdaptiveModuleInstance): Promise<AdaptiveAssessment> => {
    setAssessmentInProgress(true);
    
    const moduleContent = moduleInstance.adaptive_module;
    const currentLevel = moduleInstance.current_difficulty_level;
    
    // Generate adaptive questions based on module content and user's current level
    const adaptiveQuestions = generateAdaptiveQuestions(moduleContent, currentLevel);
    
    return new Promise((resolve) => {
      // This would integrate with your quiz/assessment components
      // For now, we'll simulate the assessment process
      const simulatedAssessment: AdaptiveAssessment = {
        moduleKey: moduleContent.module_key,
        questions: adaptiveQuestions,
        userAnswers: {},
        score: 0,
        difficultyLevel: currentLevel,
        completionTime: 0,
        adaptiveRecommendations: []
      };
      
      setAssessmentInProgress(false);
      resolve(simulatedAssessment);
    });
  }, []);

  // Generate adaptive questions based on module and difficulty
  const generateAdaptiveQuestions = (module: AdaptiveModule, difficultyLevel: string) => {
    const baseQuestions = {
      foundations_assessment: [
        {
          id: 'fa_1',
          question: 'What is the primary purpose of financial statement analysis?',
          type: 'multiple_choice',
          difficulty: 'beginner',
          options: [
            'To calculate taxes',
            'To assess business performance and creditworthiness',
            'To prepare marketing materials',
            'To track inventory'
          ],
          correctAnswer: 1,
          explanation: 'Financial statement analysis helps assess business performance, financial health, and creditworthiness.'
        },
        {
          id: 'fa_2',
          question: 'Which ratio best measures a company\'s ability to pay short-term obligations?',
          type: 'multiple_choice',
          difficulty: 'intermediate',
          options: [
            'Debt-to-equity ratio',
            'Current ratio',
            'Gross profit margin',
            'Return on equity'
          ],
          correctAnswer: 1,
          explanation: 'The current ratio (current assets / current liabilities) measures short-term liquidity.'
        }
      ],
      core_concepts: [
        {
          id: 'cc_1',
          question: 'Explain the key differences between secured and unsecured lending.',
          type: 'essay',
          difficulty: 'intermediate',
          rubric: ['Understanding of collateral', 'Risk assessment explanation', 'Examples provided'],
          maxScore: 100
        }
      ],
      practical_application: [
        {
          id: 'pa_1',
          question: 'Case Study: Analyze this loan scenario and provide your recommendation.',
          type: 'case_study',
          difficulty: 'advanced',
          scenario: 'Manufacturing company seeking $500K working capital loan...',
          evaluationCriteria: ['Risk analysis', 'Financial assessment', 'Recommendation quality']
        }
      ]
    };

    const moduleQuestions = baseQuestions[module.module_key as keyof typeof baseQuestions] || [];
    
    // Filter questions by difficulty level and adaptive logic
    return moduleQuestions.filter(q => 
      q.difficulty === difficultyLevel || 
      (difficultyLevel === 'adaptive' && ['beginner', 'intermediate'].includes(q.difficulty))
    );
  };

  // Update module progress and adaptive path
  const updateModuleProgress = useCallback(async (
    moduleInstanceId: string, 
    progressData: {
      progress_percentage?: number;
      performance_metrics?: any;
      completion_status?: string;
      time_spent_minutes?: number;
      adaptive_path_updates?: any[];
    }
  ) => {
    if (!user?.id) return;

    try {
      const currentInstance = adaptiveModules.find(m => m.id === moduleInstanceId);
      if (!currentInstance) return;

      // Calculate new difficulty level based on performance
      let newDifficultyLevel = currentInstance.current_difficulty_level;
      if (progressData.performance_metrics) {
        newDifficultyLevel = calculateAdaptiveDifficulty(
          progressData.performance_metrics,
          currentInstance.current_difficulty_level
        );
      }

      const updateData: any = {
        ...progressData,
        current_difficulty_level: newDifficultyLevel,
        last_accessed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (progressData.completion_status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('adaptive_module_instances')
        .update(updateData)
        .eq('id', moduleInstanceId);

      if (error) throw error;

      // Reload modules to reflect changes
      await loadAdaptiveModules();

      toast({
        title: "Progress Updated",
        description: `Your adaptive learning progress has been saved.`,
      });

    } catch (error) {
      console.error('Error updating module progress:', error);
      toast({
        title: "Error saving progress",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [user?.id, adaptiveModules, loadAdaptiveModules, toast]);

  // Calculate adaptive difficulty based on performance
  const calculateAdaptiveDifficulty = (performanceMetrics: any, currentLevel: string): string => {
    const { accuracy, speed, confidence, attempts } = performanceMetrics;
    
    // Advanced adaptive logic
    if (accuracy >= 90 && speed <= 1.2 && confidence >= 80) {
      // High performance - increase difficulty
      switch (currentLevel) {
        case 'beginner': return 'intermediate';
        case 'intermediate': return 'advanced';
        default: return currentLevel;
      }
    } else if (accuracy < 70 || attempts > 2) {
      // Lower performance - decrease difficulty or provide more support
      switch (currentLevel) {
        case 'advanced': return 'intermediate';
        case 'intermediate': return 'beginner';
        default: return currentLevel;
      }
    }
    
    return currentLevel; // Maintain current level
  };

  // Get personalized learning recommendations
  const getPersonalizedRecommendations = useCallback((moduleInstance: AdaptiveModuleInstance) => {
    const { performance_metrics, current_difficulty_level, adaptive_module } = moduleInstance;
    const recommendations = [];

    // Analyze performance and provide recommendations
    if (performance_metrics?.accuracy < 75) {
      recommendations.push({
        type: 'review',
        title: 'Review Core Concepts',
        description: `Focus on ${adaptive_module.learning_objectives.slice(0, 2).join(' and ')}`,
        priority: 'high'
      });
    }

    if (performance_metrics?.speed > 1.5) {
      recommendations.push({
        type: 'practice',
        title: 'Practice Time Management',
        description: 'Try timed exercises to improve response speed',
        priority: 'medium'
      });
    }

    if (current_difficulty_level === 'beginner' && performance_metrics?.accuracy >= 85) {
      recommendations.push({
        type: 'advance',
        title: 'Ready for Next Level',
        description: 'Your performance indicates readiness for intermediate content',
        priority: 'high'
      });
    }

    return recommendations;
  }, []);

  // Start a specific adaptive module
  const startAdaptiveModule = useCallback(async (moduleKey: string) => {
    const moduleInstance = adaptiveModules.find(m => 
      m.adaptive_module.module_key === moduleKey
    );
    
    if (moduleInstance) {
      setCurrentModule(moduleInstance);
      
      // Update last accessed time
      await updateModuleProgress(moduleInstance.id, {
        time_spent_minutes: (moduleInstance.time_spent_minutes || 0) + 1
      });
    }
  }, [adaptiveModules, updateModuleProgress]);

  // Initialize adaptive modules on mount
  useEffect(() => {
    if (user?.id) {
      loadAdaptiveModules();
    }
  }, [user?.id, loadAdaptiveModules]);

  return {
    adaptiveModules,
    currentModule,
    userPerformanceProfile,
    loading,
    assessmentInProgress,
    conductAdaptiveAssessment,
    updateModuleProgress,
    getPersonalizedRecommendations,
    startAdaptiveModule,
    setCurrentModule,
    loadAdaptiveModules
  };
};