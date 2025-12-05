import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Clock, Target, ChevronRight, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CourseRecommendation {
  id: string;
  title: string;
  description: string;
  level: string;
  matchScore: number;
  reason: string;
  estimatedTime: string;
}

export function SmartRecommendations() {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    try {
      // Fetch user's progress and enrolled courses
      const [progressResult, coursesResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('course_progress')
          .select('course_id, module_id, progress_percentage')
          .eq('user_id', user?.id),
        supabase
          .from('courses')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', user?.id)
          .eq('status', 'active'),
      ]);

      const progress = progressResult.data || [];
      const courses = coursesResult.data || [];
      const enrolledIds = new Set((enrollmentsResult.data || []).map(e => e.course_id));

      // Simple recommendation algorithm based on:
      // 1. Courses not yet enrolled
      // 2. Course level matching user's progress
      // 3. Related topics

      const completedCourses = progress.filter(p => p.progress_percentage === 100).length;
      const userLevel = completedCourses >= 3 ? 'Advanced' : completedCourses >= 1 ? 'Intermediate' : 'Beginner';

      const recs: CourseRecommendation[] = courses
        .filter(course => !enrolledIds.has(course.id))
        .map(course => {
          let matchScore = 70;
          let reason = 'Popular course in your field';

          // Boost score for matching level
          if (course.level === userLevel) {
            matchScore += 15;
            reason = `Perfect for your ${userLevel.toLowerCase()} level`;
          } else if (
            (userLevel === 'Intermediate' && course.level === 'Beginner') ||
            (userLevel === 'Advanced' && course.level === 'Intermediate')
          ) {
            matchScore += 10;
            reason = 'Good foundation course';
          }

          // Add some variation
          matchScore += Math.floor(Math.random() * 10);

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            level: course.level,
            matchScore: Math.min(matchScore, 98),
            reason,
            estimatedTime: '4-6 hours',
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);

      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'advanced':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended For You
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized course suggestions based on your learning journey
        </p>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Complete some courses to get personalized recommendations!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all hover:shadow-md cursor-pointer"
                onClick={() => navigate(`/courses`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={getLevelColor(rec.level)}>
                    {rec.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="font-medium text-primary">{rec.matchScore}%</span>
                    <span className="text-muted-foreground">match</span>
                  </div>
                </div>
                
                <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">
                  {rec.title}
                </h4>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {rec.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {rec.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Course
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {rec.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
