import { supabase } from "@/integrations/supabase/client";

/**
 * Demo function to create sample notifications for testing
 * You can call this from the browser console or use it for development
 */
export const createDemoNotifications = async (userId: string) => {
  const demoNotifications = [
    {
      user_id: userId,
      title: "Welcome to FinPilot Academy! 🎉",
      message: "Start your financial learning journey by exploring the dashboard and completing your first module.",
      type: "success",
      read: false,
      data: { action_url: "/dashboard" }
    },
    {
      user_id: userId,
      title: "Assignment Due Soon ⏰",
      message: "Your Credit Analysis assignment is due in 2 days. Don't forget to submit it on time!",
      type: "reminder",
      read: false,
      data: { action_url: "/module/credit-analysis" }
    },
    {
      user_id: userId,
      title: "New Content Available 📚",
      message: "A new video lesson 'Advanced Risk Management' has been added to your course.",
      type: "info",
      read: false,
      data: { action_url: "/dashboard" }
    },
    {
      user_id: userId,
      title: "System Maintenance Alert ⚠️",
      message: "Scheduled maintenance will occur tonight from 11 PM to 1 AM EST. Some features may be temporarily unavailable.",
      type: "warning",
      read: false,
      data: null
    },
    {
      user_id: userId,
      title: "Congratulations! 🏆",
      message: "You've completed the Financial Fundamentals module with a score of 95%! Keep up the excellent work.",
      type: "success",
      read: true,
      data: { action_url: "/progress" }
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(demoNotifications)
      .select();

    if (error) {
      console.error('Error creating demo notifications:', error);
      return null;
    }

    console.log('Demo notifications created:', data);
    return data;
  } catch (error) {
    console.error('Error creating demo notifications:', error);
    return null;
  }
};

// Helper to create a single test notification
export const createTestNotification = async (userId: string, type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'alert' = 'info') => {
  const notifications = {
    info: {
      title: "Information Update 📢",
      message: "New course materials have been uploaded to your learning portal.",
      type: "info"
    },
    success: {
      title: "Achievement Unlocked! 🎯",
      message: "You've maintained a 7-day learning streak! Keep it up!",
      type: "success"
    },
    warning: {
      title: "Account Security Notice ⚠️",
      message: "We noticed a login from a new device. If this wasn't you, please secure your account.",
      type: "warning"
    },
    error: {
      title: "Payment Failed ❌",
      message: "Your subscription payment could not be processed. Please update your payment method.",
      type: "error"
    },
    reminder: {
      title: "Study Reminder 📖",
      message: "Don't forget to review today's lesson materials before tomorrow's quiz.",
      type: "reminder"
    },
    alert: {
      title: "Urgent: Course Deadline 🚨",
      message: "Critical: Your certification exam must be completed within 24 hours to maintain your enrollment.",
      type: "alert"
    }
  };

  const notification = notifications[type];
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        data: { created_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test notification:', error);
      return null;
    }

    console.log('Test notification created:', data);
    return data;
  } catch (error) {
    console.error('Error creating test notification:', error);
    return null;
  }
};