-- Discussion forum posts
CREATE TABLE public.discussion_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT REFERENCES public.courses(id),
  module_id TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discussion replies
CREATE TABLE public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.discussion_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_best_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course reviews
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL REFERENCES public.courses(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- User notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User learning preferences for AI recommendations
CREATE TABLE public.user_learning_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_topics TEXT[] DEFAULT '{}',
  skill_level TEXT DEFAULT 'beginner',
  learning_goals TEXT[] DEFAULT '{}',
  weekly_time_commitment INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_preferences ENABLE ROW LEVEL SECURITY;

-- Discussion posts policies
CREATE POLICY "Users can view all discussion posts" ON public.discussion_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.discussion_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.discussion_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.discussion_posts FOR DELETE USING (auth.uid() = user_id);

-- Discussion replies policies
CREATE POLICY "Users can view all replies" ON public.discussion_replies FOR SELECT USING (true);
CREATE POLICY "Users can create replies" ON public.discussion_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON public.discussion_replies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own replies" ON public.discussion_replies FOR DELETE USING (auth.uid() = user_id);

-- Course reviews policies
CREATE POLICY "Users can view all reviews" ON public.course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.course_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.course_reviews FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.user_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Learning preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_learning_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON public.user_learning_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_learning_preferences FOR UPDATE USING (auth.uid() = user_id);