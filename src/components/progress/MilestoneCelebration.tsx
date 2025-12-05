import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, PartyPopper, Share2 } from 'lucide-react';

export type MilestoneType = 
  | 'course_complete' 
  | 'module_complete' 
  | 'badge_earned' 
  | 'streak_milestone' 
  | 'first_course';

interface MilestoneCelebrationProps {
  type: MilestoneType;
  title: string;
  description: string;
  points?: number;
  onClose: () => void;
  open: boolean;
}

const milestoneConfig: Record<MilestoneType, { icon: typeof Trophy; color: string; confettiCount: number }> = {
  course_complete: { icon: Trophy, color: 'text-yellow-500', confettiCount: 30 },
  module_complete: { icon: Star, color: 'text-blue-500', confettiCount: 15 },
  badge_earned: { icon: Sparkles, color: 'text-purple-500', confettiCount: 20 },
  streak_milestone: { icon: PartyPopper, color: 'text-orange-500', confettiCount: 25 },
  first_course: { icon: Trophy, color: 'text-green-500', confettiCount: 35 },
};

export function MilestoneCelebration({ 
  type, 
  title, 
  description, 
  points, 
  onClose, 
  open 
}: MilestoneCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const config = milestoneConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (open) {
      // Generate confetti particles
      const particles = Array.from({ length: config.confettiCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
      }));
      setConfetti(particles);
    }
  }, [open, config.confettiCount]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        {/* Confetti animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${particle.left}%`,
                top: '-10px',
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][particle.id % 6],
                animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s forwards`,
              }}
            />
          ))}
        </div>

        <div className="py-6 relative z-10">
          {/* Icon with pulse animation */}
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-scale-in">
            <Icon className={`w-10 h-10 ${config.color}`} />
          </div>

          <h2 className="text-2xl font-bold mb-2 animate-fade-in">
            {title}
          </h2>
          
          <p className="text-muted-foreground mb-4 animate-fade-in">
            {description}
          </p>

          {points && (
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-scale-in">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">+{points} points earned!</span>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onClose}>
              Continue Learning
            </Button>
            <Button className="gap-2">
              <Share2 className="w-4 h-4" />
              Share Achievement
            </Button>
          </div>
        </div>

        <style>{`
          @keyframes confetti-fall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

// Hook for triggering celebrations
export function useMilestoneCelebration() {
  const [celebration, setCelebration] = useState<{
    type: MilestoneType;
    title: string;
    description: string;
    points?: number;
  } | null>(null);

  const celebrate = (
    type: MilestoneType,
    title: string,
    description: string,
    points?: number
  ) => {
    setCelebration({ type, title, description, points });
  };

  const closeCelebration = () => {
    setCelebration(null);
  };

  return {
    celebration,
    celebrate,
    closeCelebration,
    CelebrationDialog: celebration ? (
      <MilestoneCelebration
        type={celebration.type}
        title={celebration.title}
        description={celebration.description}
        points={celebration.points}
        open={!!celebration}
        onClose={closeCelebration}
      />
    ) : null,
  };
}
