import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PublicModuleCardProps {
  title: string;
  description: string;
  duration: string;
  lessons: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  moduleId: string;
  image?: string;
  isAuthenticated: boolean;
  onEnrollClick?: () => void;
}

const PublicModuleCard = ({ 
  title, 
  description, 
  duration, 
  lessons, 
  skillLevel, 
  moduleId,
  image,
  isAuthenticated,
  onEnrollClick
}: PublicModuleCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced':
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnrollClick = async () => {
    // Log access attempt for security monitoring
    await supabase.rpc('log_course_access_attempt', {
      p_module_id: moduleId,
      p_access_type: user ? 'module_access_enrolled' : 'module_access_signup_redirect',
      p_success: true
    });

    if (user) {
      navigate(`/module/${moduleId}`);
    } else {
      navigate('/auth?tab=signup', { 
        state: { returnTo: `/module/${moduleId}` } 
      });
    }
  };

  const handleAction = () => {
    if (isAuthenticated) {
      // Navigate to course or trigger enrollment
      if (onEnrollClick) {
        onEnrollClick();
      }
    } else {
      // Redirect to signup/signin
      window.location.href = '/auth?mode=signup';
    }
  };

  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <Badge 
            variant="outline" 
            className={`text-xs font-medium ${getSkillLevelColor(skillLevel)}`}
          >
            {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>
        
        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        
        <CardDescription className="text-sm line-clamp-3 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{lessons} lessons</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>1.2k+ enrolled</span>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-foreground mb-1">
              🎓 Start Your Finance Career Today
            </p>
            <p className="text-xs text-muted-foreground">
              Join 10,000+ professionals advancing their careers
            </p>
          </div>
        )}

        <Button 
          onClick={handleEnrollClick}
          className="w-full"
          variant={isAuthenticated ? "default" : "default"}
        >
          {isAuthenticated ? "Enroll Now" : "Sign Up to Start Learning"}
        </Button>

        {!isAuthenticated && (
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth?mode=signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PublicModuleCard;