// Core interface definitions for type safety

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  instructor_id?: string;
  modules: Module[];
  duration?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
  content?: string;
  video_url?: string;
  duration?: string;
  is_completed?: boolean;
}

export interface LearningProfile {
  id: string;
  user_id: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  pace: 'slow' | 'medium' | 'fast';
  difficulty_preference: 'easy' | 'medium' | 'hard';
  interests: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching';
  options?: string[];
  correctAnswer: string | string[];
  correctAnswers?: string[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  questionId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: Record<string, unknown>;
  user_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface SecurityMetrics {
  total_events: number;
  critical_events: number;
  high_events: number;
  medium_events: number;
  low_events: number;
  resolved_events: number;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface Instructor {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  expertise: string[];
  years_experience?: number;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  uploaded_at: string;
  uploaded_by: string;
}

export interface Progress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  progress_percentage: number;
  time_spent?: number;
  last_accessed: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  badge_url?: string;
  earned_at: string;
  points?: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SecureFormData {
  [key: string]: string | number | boolean | File | null;
}

export interface SecurityValidation {
  isValid: boolean;
  hasEnrollment: boolean;
  userRole: string | null;
  enrollmentVerified: boolean;
}

export interface GamificationData {
  user_id: string;
  total_points: number;
  level: number;
  badges: string[];
  streak_days: number;
  achievements: Achievement[];
}