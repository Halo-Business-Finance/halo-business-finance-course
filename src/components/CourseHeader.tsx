import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Award, Search, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-finance.jpg";
import { NotificationCenter } from "@/components/engagement/NotificationCenter";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";

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

const CourseHeader = ({
  progress,
  totalModules,
  completedModules,
  onContinueLearning
}: CourseHeaderProps) => {
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
        .limit(3);

      if (error) throw error;
      setInstructors(data || []);
    } catch (error) {
      console.error('Error loading instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-halo-navy w-full">
      {/* Top Action Bar */}
      <div className="relative px-6 lg:px-12 py-3 border-b border-white/10">
        <div className="flex items-center justify-end gap-4 max-w-7xl mx-auto">
          <AdvancedSearch 
            trigger={
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/10 gap-2 h-9 px-4"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Search</span>
                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px]">
                  ⌘K
                </kbd>
              </Button>
            }
          />
          <NotificationCenter />
        </div>
      </div>
      
      {/* Main Header Content */}
      <div className="relative px-6 lg:px-12 py-12 lg:py-16 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-10 items-center">
          {/* Left Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            {/* Program Badge */}
            <div className="inline-flex items-center gap-3 border-l-4 border-emerald-400 pl-4">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-semibold text-white tracking-widest uppercase">
                Training Program
              </span>
              <div className="w-px h-4 bg-white/30" />
              <span className="text-xs text-white/80 font-mono tracking-wider">v2.0</span>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
                Business Finance Mastery
              </h1>
              <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
                Master the fundamentals of business finance with our comprehensive 
                training program designed specifically for Halo Business Finance interns.
              </p>
            </div>
            
            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-8 text-white/90">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-5 w-5 text-white/70" />
                <span className="text-sm font-medium">{totalModules} Modules</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-white/70" />
                <span className="text-sm font-medium">4-6 Hours</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-white/70" />
                <span className="text-sm font-medium">Beginner</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-white/70" />
                <span className="text-sm font-medium">Completion</span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3 max-w-xl">
              <div className="flex justify-between text-white">
                <span className="text-sm font-semibold">Course Progress</span>
                <span className="text-sm font-medium text-white/80">
                  {completedModules}/{totalModules} modules
                </span>
              </div>
              <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-white/80">
                {progress}% complete - Keep up the great work!
              </p>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={onContinueLearning} 
              size="lg"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Continue Learning
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Image - 2 columns */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Business Finance Learning" 
                className="rounded-xl shadow-2xl w-full h-auto object-cover"
              />
              {/* Subtle overlay for better integration */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-halo-navy/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;