import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Star, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface CourseModule {
  id: string;
  module_id: string;
  title: string;
  description: string;
  duration: string;
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lessons_count: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  prerequisites?: string[];
}

const Courses = () => {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCourseModules();
  }, []);

  const fetchCourseModules = async () => {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching course modules:', error);
        toast({
          title: "Error",
          description: "Failed to load course modules",
          variant: "destructive",
        });
        return;
      }

      setModules(data || []);
      
      // Check enrollment status for each module if user is logged in
      if (user && data) {
        const enrollmentChecks = await Promise.all(
          data.map(async (module) => {
            const { data: enrollment } = await supabase
              .from('course_enrollments')
              .select('id')
              .eq('user_id', user.id)
              .eq('course_id', module.module_id)
              .eq('status', 'active')
              .single();
            
            return { moduleId: module.module_id, isEnrolled: !!enrollment };
          })
        );

        const statusMap = enrollmentChecks.reduce((acc, { moduleId, isEnrolled }) => {
          acc[moduleId] = isEnrolled;
          return acc;
        }, {} as Record<string, boolean>);

        setEnrollmentStatus(statusMap);
      }
    } catch (error) {
      console.error('Error in fetchCourseModules:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (moduleId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: moduleId,
          status: 'active'
        });

      if (error) {
        console.error('Error enrolling in course:', error);
        toast({
          title: "Enrollment Failed",
          description: "Failed to enroll in the course. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setEnrollmentStatus(prev => ({ ...prev, [moduleId]: true }));
      toast({
        title: "Enrollment Successful",
        description: "You have been enrolled in the course!",
      });
    } catch (error) {
      console.error('Error in handleEnroll:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">Course Catalog</h1>
        <p className="text-lg text-black">
          Explore our comprehensive collection of professional training courses designed to advance your career.
        </p>
      </div>

      {modules.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
            <p className="text-muted-foreground">
              Course modules will appear here once they are added by administrators.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">Finance</Badge>
                  <Badge className={getLevelColor(module.skill_level)}>
                    {module.skill_level.charAt(0).toUpperCase() + module.skill_level.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-xl text-blue-900">{module.title}</CardTitle>
                <CardDescription className="text-black">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {module.duration || 'Self-paced'}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {module.lessons_count || 0} lessons
                  </div>
                </div>
                
                {user ? (
                  enrollmentStatus[module.module_id] ? (
                    <Link to={`/module/${module.module_id}`}>
                      <Button className="w-full" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(module.module_id)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                  )
                ) : (
                  <Link to="/signup">
                    <Button className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Sign Up to Enroll
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;