import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users, Award } from "lucide-react";
import heroImage from "@/assets/hero-finance.jpg";

interface CourseHeaderProps {
  progress: number;
  totalModules: number;
  completedModules: number;
  onContinueLearning: () => void;
}

const CourseHeader = ({ progress, totalModules, completedModules, onContinueLearning }: CourseHeaderProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-2xl shadow-hero border border-border">
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
              <p className="text-lg text-white/90 leading-relaxed">
                Master the fundamentals of business finance with our comprehensive 
                training program designed specifically for Halo Business Finance interns.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-white/80" />
                <span className="text-sm">{totalModules} Modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/80" />
                <span className="text-sm">4-6 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-white/80" />
                <span className="text-sm">Beginner</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-white/80" />
                <span className="text-sm">Certificate</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-white">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm">{completedModules}/{totalModules} modules</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/30" />
              <p className="text-sm text-white/80">
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