/**
 * PublicModuleCard - Public-facing module card for unauthenticated users
 * 
 * Features:
 * - Marketing-focused design with enrollment prompts
 * - Social proof indicators (ratings, enrollment count)
 * - Authentication flow handling
 * - Security logging for access attempts
 * - Responsive CTA buttons based on auth state
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type SkillLevel = 'beginner' | 'expert';

interface PublicModuleCardProps {
  title: string;
  description: string;
  duration: string;
  lessons: number;
  skillLevel: SkillLevel;
  moduleId: string;
  image?: string;
  isAuthenticated: boolean;
  onEnrollClick?: () => void;
}

/**
 * Skill level styling for professional display
 */
const SKILL_LEVEL_STYLES: Record<SkillLevel, string> = {
  beginner: 'text-xs font-semibold tracking-wider text-emerald-700 border-l-4 border-emerald-700 pl-2',
  expert: 'text-xs font-semibold tracking-wider text-blue-700 border-l-4 border-blue-700 pl-2'
};

/**
 * Default rating for modules (could be made dynamic)
 */
const DEFAULT_RATING = 4.8;

/**
 * Default enrollment count (could be made dynamic)
 */
const DEFAULT_ENROLLMENT_COUNT = '1.2k+';

/**
 * Gets skill level styling classes
 */
const getSkillLevelStyling = (level: SkillLevel): string => {
  return SKILL_LEVEL_STYLES[level] || 'text-xs font-semibold tracking-wider text-muted-foreground border-l-4 border-muted-foreground pl-2';
};

/**
 * Formats skill level for display
 */
const formatSkillLevel = (level: SkillLevel): string => {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

/**
 * Logs course access attempts for security monitoring
 */
const logAccessAttempt = async (moduleId: string, user: any): Promise<void> => {
  try {
    await supabase.rpc('log_course_access_attempt', {
      p_module_id: moduleId,
      p_access_type: user ? 'module_access_enrolled' : 'module_access_signup_redirect',
      p_success: true
    });
  } catch (error) {
    // Silent fail for logging - don't block user experience
    console.warn('Failed to log access attempt:', error);
  }
};

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

  /**
   * Handles enrollment click with proper authentication flow
   */
  const handleEnrollClick = async (): Promise<void> => {
    // Log access attempt for security monitoring
    await logAccessAttempt(moduleId, user);

    if (user) {
      navigate(`/module/${moduleId}`);
    } else {
      navigate('/auth?tab=signup', { 
        state: { returnTo: `/module/${moduleId}` } 
      });
    }
  };

  /**
   * Gets appropriate button text based on authentication state
   */
  const getButtonText = (): string => {
    return isAuthenticated ? "Enroll Now" : "Sign Up to Start Learning";
  };

  return (
    <Card className="group hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Module Header */}
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <span className={getSkillLevelStyling(skillLevel)}>
            {formatSkillLevel(skillLevel).toUpperCase()}
          </span>
          {/* Social Proof - Rating */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>{DEFAULT_RATING}</span>
          </div>
        </div>
        
        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        
        <CardDescription className="text-sm line-clamp-3 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      {/* Module Content */}
      <CardContent className="space-y-4">
        {/* Module Metadata */}
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
          {/* Social Proof - Enrollment Count */}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{DEFAULT_ENROLLMENT_COUNT} enrolled</span>
          </div>
        </div>

        {/* Marketing Banner for Unauthenticated Users */}
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

        {/* Primary Action Button */}
        <Button 
          onClick={handleEnrollClick}
          className="w-full"
          variant="default"
        >
          {getButtonText()}
        </Button>

        {/* Sign In Prompt for Unauthenticated Users */}
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