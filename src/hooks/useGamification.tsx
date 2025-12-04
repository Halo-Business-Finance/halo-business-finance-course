import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  total_points: number;
}

export interface Certificate {
  id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  completion_percentage: number;
  final_score: number | null;
}

export function useGamification() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [streak, setStreak] = useState<LearningStreak | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGamificationData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: true });

      // Fetch user's earned badges
      const { data: userBadgesData } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);

      // Fetch user's streak
      const { data: streakData } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch user's certificates
      const { data: certificatesData } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id);

      setBadges(badgesData || []);
      setUserBadges(userBadgesData || []);
      setStreak(streakData);
      setCertificates(certificatesData || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (streak) {
        const lastDate = new Date(streak.last_activity_date);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = streak.current_streak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }

        const newLongest = Math.max(newStreak, streak.longest_streak);

        await supabase
          .from('learning_streaks')
          .update({
            current_streak: newStreak,
            longest_streak: newLongest,
            last_activity_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        setStreak({
          ...streak,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_activity_date: today
        });

        // Check for streak badges
        checkStreakBadges(newStreak);
      } else {
        // Create new streak record
        const { data } = await supabase
          .from('learning_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            total_points: 0
          })
          .select()
          .single();

        if (data) {
          setStreak(data);
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, streak]);

  const checkStreakBadges = async (streakDays: number) => {
    if (!user) return;

    const streakBadges = badges.filter(b => b.requirement_type === 'streak_days' && b.requirement_value <= streakDays);
    
    for (const badge of streakBadges) {
      const alreadyEarned = userBadges.some(ub => ub.badge_id === badge.id);
      if (!alreadyEarned) {
        await awardBadge(badge.id, badge.name);
      }
    }
  };

  const awardBadge = async (badgeId: string, badgeName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId
        });

      if (!error) {
        toast({
          title: "🏆 Badge Earned!",
          description: `Congratulations! You've earned the "${badgeName}" badge!`,
        });
        fetchGamificationData();
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  const addPoints = async (points: number) => {
    if (!user || !streak) return;

    try {
      await supabase
        .from('learning_streaks')
        .update({
          total_points: streak.total_points + points,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setStreak({
        ...streak,
        total_points: streak.total_points + points
      });
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const generateCertificate = async (courseId: string, finalScore?: number) => {
    if (!user) return null;

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          course_id: courseId,
          certificate_number: certificateNumber,
          completion_percentage: 100,
          final_score: finalScore
        })
        .select()
        .single();

      if (!error && data) {
        setCertificates([...certificates, data]);
        toast({
          title: "🎓 Certificate Earned!",
          description: "Congratulations on completing the course!",
        });
        return data;
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
    return null;
  };

  const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
  const unearnedBadges = badges.filter(b => !earnedBadgeIds.includes(b.id));

  return {
    badges,
    userBadges,
    unearnedBadges,
    streak,
    certificates,
    isLoading,
    updateStreak,
    awardBadge,
    addPoints,
    generateCertificate,
    refreshData: fetchGamificationData
  };
}
