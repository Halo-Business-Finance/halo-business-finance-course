// Custom hook for managing user profile data

import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { handleAsyncError } from "@/utils/errorHandling";
import { toast } from "@/hooks/use-toast";
import type { UserProfile, UserEditForm, UserPreferences, NotificationPreferences, ApiError } from "@/types";

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: ApiError | null;
  updateProfile: (updates: Partial<UserEditForm>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<boolean>;
  updateNotificationSettings: (settings: Partial<NotificationPreferences>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      setLoading(false);
      return;
    }

    setError(null);
    
    const result = await handleAsyncError(
      async () => {
        const { data: profiles, error } = await supabase.rpc('get_user_profile');
        
        if (error) throw error;
        
        if (profiles && profiles.length > 0) {
          return profiles[0] as UserProfile;
        }
        
        // Create default profile if none exists
        const defaultProfileData = {
          user_id: user.id,
          name: user.user_metadata?.full_name || "",
          email: user.email || "",
          phone: "",
          location: "",
          city: "",
          state: "",
          title: "",
          company: "",
          avatar_url: "/placeholder.svg",
          theme: 'light',
          language: 'en',
          timezone: 'est',
          date_format: 'mdy',
          font_size: 'medium',
          email_notifications: true,
          push_notifications: false,
          marketing_emails: false,
          reduced_motion: false,
          course_progress: true,
          new_courses: true,
          webinar_reminders: true,
          weekly_progress: false,
          marketing_communications: false
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(defaultProfileData)
          .select()
          .single();

        if (createError) throw createError;
        
        return newProfile as UserProfile;
      },
      'load-profile',
      {
        showToast: false, // We'll handle toast manually
        userId: user.id
      }
    );

    if (result.error) {
      setError(result.error);
      toast({
        title: "Error Loading Profile",
        description: result.error.message,
        variant: "destructive"
      });
    } else if (result.data) {
      setProfile(result.data);
    }

    setLoading(false);
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserEditForm>): Promise<boolean> => {
    if (!user) return false;

    const result = await handleAsyncError(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        return true;
      },
      'update-profile',
      {
        userId: user.id,
        fallbackMessage: 'Failed to update profile',
        showToast: true
      }
    );

    if (result.data) {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
      return true;
    }

    return false;
  }, [user]);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>): Promise<boolean> => {
    if (!user) return false;

    const result = await handleAsyncError(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            theme: preferences.theme,
            language: preferences.language,
            timezone: preferences.timezone,
            date_format: preferences.dateFormat,
            font_size: preferences.fontSize,
            reduced_motion: preferences.reducedMotion
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...preferences } : null);
        return true;
      },
      'update-preferences',
      {
        userId: user.id,
        fallbackMessage: 'Failed to update preferences',
        showToast: true
      }
    );

    if (result.data) {
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been successfully updated."
      });
      return true;
    }

    return false;
  }, [user]);

  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationPreferences>): Promise<boolean> => {
    if (!user) return false;

    const result = await handleAsyncError(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            email_notifications: settings.emailNotifications,
            push_notifications: settings.pushNotifications,
            marketing_emails: settings.marketingEmails,
            course_progress: settings.courseProgress,
            new_courses: settings.newCourses,
            webinar_reminders: settings.webinarReminders,
            weekly_progress: settings.weeklyProgress,
            marketing_communications: settings.marketingCommunications
          })
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Update local state
        setProfile(prev => prev ? { ...prev, ...settings } : null);
        return true;
      },
      'update-notification-settings',
      {
        userId: user.id,
        fallbackMessage: 'Failed to update notification settings',
        showToast: true
      }
    );

    if (result.data) {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification preferences have been successfully updated."
      });
      return true;
    }

    return false;
  }, [user]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updatePreferences,
    updateNotificationSettings,
    refreshProfile
  };
};