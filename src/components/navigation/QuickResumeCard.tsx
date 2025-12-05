import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LastActivity {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  progress: number;
  lastAccessed: string;
}

export function QuickResumeCard() {
  const [lastActivity, setLastActivity] = useState<LastActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchLastActivity = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get the most recent course progress
        const { data: progressData } = await supabase
          .from('course_progress')
          .select('course_id, module_id, progress_percentage, updated_at')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (progressData) {
          // Get course details
          const { data: courseData } = await supabase
            .from('courses')
            .select('title')
            .eq('id', progressData.course_id)
            .single();

          // Get module details if available
          let moduleTitle = 'Continue Learning';
          if (progressData.module_id) {
            const { data: moduleData } = await supabase
              .from('course_modules')
              .select('title')
              .eq('module_id', progressData.module_id)
              .single();
            
            if (moduleData) {
              moduleTitle = moduleData.title;
            }
          }

          setLastActivity({
            courseId: progressData.course_id,
            courseTitle: courseData?.title || 'Course',
            moduleId: progressData.module_id || '',
            moduleTitle,
            progress: progressData.progress_percentage || 0,
            lastAccessed: progressData.updated_at
          });
        }
      } catch (error) {
        console.error('Error fetching last activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastActivity();
  }, [user]);

  const handleResume = () => {
    if (lastActivity?.moduleId) {
      navigate(`/module/${lastActivity.moduleId}`);
    } else if (lastActivity?.courseId) {
      navigate(`/courses`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!lastActivity) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-3">No courses started yet</p>
          <Button onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Continue where you left off
              </p>
              <h3 className="font-semibold text-lg line-clamp-1">
                {lastActivity.courseTitle}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {lastActivity.moduleTitle}
              </p>
            </div>
            <Button 
              onClick={handleResume}
              size="lg"
              className="gap-2 shrink-0"
            >
              <PlayCircle className="w-5 h-5" />
              Resume
            </Button>
          </div>
        </div>
        
        <div className="p-4 pt-3">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(lastActivity.progress)}%</span>
          </div>
          <Progress value={lastActivity.progress} className="h-2" />
          
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Last studied {formatTimeAgo(lastActivity.lastAccessed)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
