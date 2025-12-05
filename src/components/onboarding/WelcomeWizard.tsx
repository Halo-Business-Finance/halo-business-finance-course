import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Target, Trophy, Rocket, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeWizardProps {
  onComplete?: () => void;
}

const steps = [
  {
    title: "Welcome to Your Learning Journey!",
    description: "Master business finance and commercial lending with our comprehensive courses designed by industry experts.",
    icon: GraduationCap,
    content: "You'll learn practical skills that directly apply to real-world scenarios in commercial lending, credit analysis, and business finance."
  },
  {
    title: "Set Your Learning Goals",
    description: "Tell us what you want to achieve so we can personalize your experience.",
    icon: Target,
    content: "Whether you're starting a new career, advancing in your current role, or expanding your business knowledge - we've got you covered."
  },
  {
    title: "Track Your Progress",
    description: "Earn badges, maintain streaks, and climb the leaderboard as you learn.",
    icon: Trophy,
    content: "Our gamification system keeps you motivated with achievements, daily streaks, and friendly competition with fellow learners."
  },
  {
    title: "Ready to Begin!",
    description: "Your personalized dashboard is ready. Start your first course today!",
    icon: Rocket,
    content: "We recommend starting with the fundamentals before moving to advanced topics. Your progress syncs across all devices."
  }
];

export function WelcomeWizard({ onComplete }: WelcomeWizardProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single();
      
      if (data && !data.onboarding_completed) {
        setOpen(true);
      }
    };
    
    checkOnboarding();
  }, [user]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    setOpen(false);
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
              Skip tour
            </Button>
          </div>
          <Progress value={progress} className="h-1 mb-4" />
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <DialogTitle className="text-center text-xl">
            {steps[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 text-center text-muted-foreground">
          {steps[currentStep].content}
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-2 py-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-primary' : index < currentStep ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button onClick={handleNext} className="gap-1">
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
