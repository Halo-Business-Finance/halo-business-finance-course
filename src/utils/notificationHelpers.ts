import { supabase } from "@/integrations/supabase/client";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'alert';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  expiresAt?: string;
}

/**
 * Create a notification for a specific user
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        priority: params.priority || 'normal',
        action_url: params.actionUrl,
        expires_at: params.expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Create course completion notification
 */
export const createCourseCompletionNotification = async (userId: string, moduleName: string) => {
  return createNotification({
    userId,
    title: "Module Completed! 🎉",
    message: `Congratulations! You've successfully completed ${moduleName}. Keep up the great work!`,
    type: 'success',
    priority: 'normal',
    actionUrl: '/progress',
  });
};

/**
 * Create assignment due reminder
 */
export const createAssignmentReminderNotification = async (userId: string, assignmentName: string, dueDate: Date) => {
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  return createNotification({
    userId,
    title: "Assignment Due Soon ⏰",
    message: `Don't forget: "${assignmentName}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`,
    type: 'reminder',
    priority: daysUntilDue <= 1 ? 'high' : 'normal',
    actionUrl: '/dashboard',
  });
};

/**
 * Create new content notification
 */
export const createNewContentNotification = async (userId: string, contentTitle: string, contentType: string) => {
  return createNotification({
    userId,
    title: "New Content Available! 📚",
    message: `New ${contentType}: "${contentTitle}" has been added to your course.`,
    type: 'info',
    priority: 'normal',
    actionUrl: '/dashboard',
  });
};

/**
 * Create system alert notification
 */
export const createSystemAlertNotification = async (userId: string, alertMessage: string) => {
  return createNotification({
    userId,
    title: "System Alert",
    message: alertMessage,
    type: 'alert',
    priority: 'high',
  });
};

/**
 * Create welcome notification for new users
 */
export const createWelcomeNotification = async (userId: string, userName?: string) => {
  return createNotification({
    userId,
    title: `Welcome to FinPilot Academy${userName ? `, ${userName}` : ''}! 👋`,
    message: "We're excited to have you here! Start your financial learning journey by exploring your dashboard.",
    type: 'success',
    priority: 'normal',
    actionUrl: '/dashboard',
  });
};