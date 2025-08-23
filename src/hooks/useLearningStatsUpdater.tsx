import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface StatsUpdateData {
  moduleId?: string;
  timeSpent?: number;
  score?: number;
  assessmentPassed?: boolean;
}

export const useLearningStatsUpdater = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateModuleCompletion = async (data: StatsUpdateData) => {
    if (!user?.id || !data.moduleId) return;

    try {
      // Insert module completion record
      const { error } = await supabase
        .from('module_completions')
        .insert({
          user_id: user.id,
          module_id: data.moduleId,
          time_spent_minutes: data.timeSpent || 0,
          score: data.score || null
        });

      if (error) {
        console.error('Error updating module completion:', error);
        return;
      }

      // Check for achievements
      await checkForAchievements();

      console.log('Module completion updated successfully');
    } catch (error) {
      console.error('Error updating module completion:', error);
    }
  };

  const updateAssessmentCompletion = async (data: StatsUpdateData) => {
    if (!user?.id) return;

    try {
      // The assessment attempt should be inserted directly to assessment_attempts
      // This will trigger the assessment stats update automatically via database triggers
      
      // Check for achievements if assessment was passed
      if (data.assessmentPassed) {
        await checkForAchievements();
      }

      console.log('Assessment completion noted');
    } catch (error) {
      console.error('Error handling assessment completion:', error);
    }
  };

  const trackLearningActivity = async () => {
    if (!user?.id) return;

    try {
      // Insert or update daily learning activity
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_learning_activity')
        .upsert({
          user_id: user.id,
          activity_date: today,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,activity_date'
        });

      if (error) {
        console.error('Error tracking learning activity:', error);
      }
    } catch (error) {
      console.error('Error tracking learning activity:', error);
    }
  };

  const checkForAchievements = async () => {
    if (!user?.id) return;

    try {
      // Get current stats
      const { data: stats } = await supabase
        .from('learning_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!stats) return;

      const achievements = [];

      // First module achievement
      if (stats.total_modules_completed === 1) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'first_module',
          achievement_title: 'First Steps',
          achievement_description: 'Completed your first learning module!'
        });
      }

      // Module milestones
      if (stats.total_modules_completed === 5) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'five_modules',
          achievement_title: 'Getting Started',
          achievement_description: 'Completed 5 learning modules!'
        });
      }

      if (stats.total_modules_completed === 10) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'ten_modules',
          achievement_title: 'Learning Champion',
          achievement_description: 'Completed 10 learning modules!'
        });
      }

      // First assessment achievement
      if (stats.total_assessments_passed === 1) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'first_assessment',
          achievement_title: 'Test Taker',
          achievement_description: 'Passed your first assessment!'
        });
      }

      // Assessment milestones
      if (stats.total_assessments_passed === 5) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'five_assessments',
          achievement_title: 'Assessment Ace',
          achievement_description: 'Passed 5 assessments!'
        });
      }

      // Streak achievements
      if (stats.current_streak_days === 3) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'three_day_streak',
          achievement_title: 'Consistent Learner',
          achievement_description: 'Maintained a 3-day learning streak!'
        });
      }

      if (stats.current_streak_days === 7) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'weekly_streak',
          achievement_title: 'Weekly Warrior',
          achievement_description: 'Achieved a 7-day learning streak!'
        });
      }

      if (stats.current_streak_days === 30) {
        achievements.push({
          user_id: user.id,
          achievement_type: 'monthly_streak',
          achievement_title: 'Monthly Master',
          achievement_description: 'Incredible! 30-day learning streak!'
        });
      }

      // Time-based achievements
      if (stats.total_time_spent_minutes >= 60) { // 1 hour
        achievements.push({
          user_id: user.id,
          achievement_type: 'one_hour',
          achievement_title: 'Dedicated Learner',
          achievement_description: 'Spent over 1 hour learning!'
        });
      }

      if (stats.total_time_spent_minutes >= 600) { // 10 hours
        achievements.push({
          user_id: user.id,
          achievement_type: 'ten_hours',
          achievement_title: 'Time Investment',
          achievement_description: 'Invested 10+ hours in learning!'
        });
      }

      // Insert new achievements (only if they don't already exist)
      for (const achievement of achievements) {
        const { data: existing } = await supabase
          .from('learning_achievements')
          .select('id')
          .eq('user_id', user.id)
          .eq('achievement_type', achievement.achievement_type)
          .single();

        if (!existing) {
          await supabase
            .from('learning_achievements')
            .insert(achievement);
        }
      }

    } catch (error) {
      console.error('Error checking for achievements:', error);
    }
  };

  return {
    updateModuleCompletion,
    updateAssessmentCompletion,
    trackLearningActivity,
    checkForAchievements
  };
};