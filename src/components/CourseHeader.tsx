import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Award, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-finance.jpg";

interface Instructor {
  id: string;
  name: string;
  title: string;
  company: string;
  years_experience: string;
  bio: string;
  avatar_initials: string;
  avatar_color: string;
  display_order: number;
  is_active: boolean;
}

interface CourseHeaderProps {
  progress: number;
  totalModules: number;
  completedModules: number;
  onContinueLearning: () => void;
}

const CourseHeader = ({ progress, totalModules, completedModules, onContinueLearning }: CourseHeaderProps) => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(3); // Limit to 3 instructors for header display

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-halo-navy rounded-2xl shadow-hero border border-border">
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      <div className="relative px-8 py-12 lg:px-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge variant="success" className="text-sm font-medium">
                Halo Business Finance Certification Program
              </Badge>
              <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                Business Finance Mastery
              </h1>
              <p className="text-base text-white leading-relaxed">
                Master the fundamentals of business finance with our comprehensive 
                training program designed specifically for Halo Business Finance interns.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-white" />
                <span className="text-sm">{totalModules} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white" />
                <span className="text-sm">4-6 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white" />
                <span className="text-sm">Beginner</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-white" />
                <span className="text-sm">Certificate</span>
              </div>
            </div>

            {/* Course Instructors Section */}
            {!loading && instructors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Course Instructors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className={`w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white/20`}>
                        {instructor.avatar_initials}
                      </div>
                      <div className="text-white">
                        <div className="text-sm font-medium">{instructor.name}</div>
                        <div className="text-xs text-white/80 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {instructor.years_experience}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between text-white">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm">{completedModules}/{totalModules} modules</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/30" />
              <p className="text-sm text-white">
                {progress}% complete - Keep up the great work!
              </p>
            </div>

            <Button variant="hero" size="lg" className="shadow-lg" onClick={onContinueLearning}>
              Continue Learning
            </Button>
          </div>

          <div className="hidden lg:block">
            <img
              src={heroImage}
              alt="Business Finance Learning"
              className="rounded-xl shadow-elevated max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;