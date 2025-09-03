// Core application types and interfaces

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  city?: string;
  state?: string;
  title?: string;
  company?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  theme?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  font_size?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  marketing_emails?: boolean;
  reduced_motion?: boolean;
  course_progress?: boolean;
  new_courses?: boolean;
  webinar_reminders?: boolean;
  weekly_progress?: boolean;
  marketing_communications?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string;
  duration?: string;
  order_index: number;
  is_active: boolean;
  skill_level?: string;
  lessons_count?: number;
  topics?: string[];
  course_title?: string;
  course_level?: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'document' | 'interactive';
  duration: string;
  completed: boolean;
  content?: any;
  url?: string;
  order_index: number;
}

export interface LearningPath {
  id: string;
  title: string;
  duration: string;
  modules: number;
  description: string;
  features: string[];
}

export interface ModuleProgress {
  [moduleId: string]: {
    completed: boolean;
    current: boolean;
    percentage: number;
  };
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id?: string;
  lesson_id?: string;
  progress_percentage: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningStats {
  total_modules_completed: number;
  total_time_spent_minutes: number;
  current_streak_days: number;
  longest_streak_days: number;
  total_assessments_passed: number;
  average_score: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  modulesCompleted: number;
  timeSpentHours: number;
  currentStreak: number;
  progressScore: number;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  courseProgress: boolean;
  newCourses: boolean;
  webinarReminders: boolean;
  weeklyProgress: boolean;
  marketingCommunications: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
  courseProgress?: boolean;
  newCourses?: boolean;
  webinarReminders?: boolean;
  weeklyProgress?: boolean;
  marketingCommunications?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form interfaces
export interface UserEditForm extends Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'> {}

export interface AuthFormData {
  email: string;
  password: string;
}

// Component prop interfaces
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ModuleCardProps {
  module: CourseModule;
  progress?: number;
  onStart?: (moduleId: string) => void;
  onComplete?: (moduleId: string) => void;
  isLocked?: boolean;
}

// Utility types
export type CourseLevel = Course['level'];
export type LessonType = Lesson['type'];
export type UserTheme = UserPreferences['theme'];

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

// Hook return types
export interface UseCourseProgressReturn {
  progress: CourseProgress[];
  moduleProgress: ModuleProgress;
  loading: boolean;
  error: string | null;
  updateProgress: (moduleId: string, progressPercentage: number, courseIdOverride?: string) => Promise<boolean>;
  startModule: (moduleId: string, courseIdOverride?: string) => Promise<boolean>;
  completeModule: (moduleId: string, courseIdOverride?: string) => Promise<boolean>;
  getOverallProgress: () => number;
  getCompletedModulesCount: () => number;
  isModuleUnlocked: (moduleIndex: number, modules: any[]) => boolean;
}

export interface UseLearningStatsReturn {
  stats: LearningStats | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchLearningStats: (userId: string) => Promise<void>;
  updateLearningStats: (updates: Partial<LearningStats>) => Promise<boolean>;
}

// Event types
export interface CourseSelectionEvent {
  courseId: string;
  courseName: string;
  level?: string;
}

export interface ModuleStartEvent {
  moduleId: string;
  moduleTitle: string;
  courseId: string;
}

export interface LessonCompleteEvent {
  lessonId: string;
  lessonTitle: string;
  moduleId: string;
  timeSpent: number;
}