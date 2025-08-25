import { supabase } from "@/integrations/supabase/client";

/**
 * Create test notifications for the current user
 * This uses the correct table structure with 'read' field and 'data' jsonb field
 */
export const createTestNotifications = async (userId: string) => {
  const testNotifications = [
    {
      user_id: userId,
      title: "Welcome to FinPilot Academy! 🎉",
      message: "Start your financial learning journey by exploring the dashboard and completing your first module.",
      type: "success",
      read: false,
      data: { 
        action_url: "/dashboard",
        priority: "normal"
      }
    },
    {
      user_id: userId,
      title: "Assignment Due Soon ⏰",
      message: "Your Credit Analysis assignment is due in 2 days. Don't forget to submit it on time!",
      type: "warning",
      read: false,
      data: { 
        action_url: "/dashboard",
        priority: "high"
      }
    },
    {
      user_id: userId,
      title: "New Content Available 📚",
      message: "A new video lesson 'Advanced Risk Management' has been added to your course.",
      type: "info",
      read: false,
      data: { 
        action_url: "/dashboard",
        priority: "normal"
      }
    },
    {
      user_id: userId,
      title: "System Alert ⚠️",
      message: "Scheduled maintenance tonight from 11 PM to 1 AM EST. Some features may be temporarily unavailable.",
      type: "warning",
      read: false,
      data: { 
        priority: "high"
      }
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select();

    if (error) {
      console.error('Error creating test notifications:', error);
      return null;
    }

    console.log('✅ Test notifications created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return null;
  }
};

/**
 * Helper function to create a single notification
 */
export const createSingleNotification = async (
  userId: string, 
  title: string, 
  message: string, 
  type: string = 'info',
  actionUrl?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        read: false,
        data: actionUrl ? { action_url: actionUrl, priority: 'normal' } : { priority: 'normal' }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    console.log('✅ Notification created:', data);
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};