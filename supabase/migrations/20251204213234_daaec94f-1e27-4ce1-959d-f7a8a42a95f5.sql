-- Gamification: Badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL DEFAULT 'achievement',
  points INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Learning streaks
CREATE TABLE public.learning_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Certificates
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_percentage INTEGER NOT NULL DEFAULT 100,
  final_score INTEGER,
  pdf_url TEXT,
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Badges are viewable by everyone
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges policies
CREATE POLICY "Users can view their own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view their own streak" ON public.learning_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own streak" ON public.learning_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streak" ON public.learning_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('First Steps', 'Complete your first lesson', 'footprints', 'milestone', 'lessons_completed', 1, 10),
('Quick Learner', 'Complete 5 lessons', 'zap', 'milestone', 'lessons_completed', 5, 25),
('Knowledge Seeker', 'Complete 25 lessons', 'book-open', 'milestone', 'lessons_completed', 25, 100),
('Course Champion', 'Complete your first course', 'trophy', 'achievement', 'courses_completed', 1, 50),
('Multi-Course Master', 'Complete 3 courses', 'crown', 'achievement', 'courses_completed', 3, 150),
('Quiz Whiz', 'Score 100% on any quiz', 'target', 'performance', 'perfect_quiz', 1, 30),
('Streak Starter', 'Maintain a 3-day learning streak', 'flame', 'engagement', 'streak_days', 3, 20),
('Week Warrior', 'Maintain a 7-day learning streak', 'calendar', 'engagement', 'streak_days', 7, 50),
('Month Master', 'Maintain a 30-day learning streak', 'star', 'engagement', 'streak_days', 30, 200),
('Early Bird', 'Study before 8 AM', 'sunrise', 'special', 'early_study', 1, 15),
('Night Owl', 'Study after 10 PM', 'moon', 'special', 'late_study', 1, 15),
('Finance Fundamentals', 'Complete all beginner modules', 'graduation-cap', 'certification', 'level_completed', 1, 100);