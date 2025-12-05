import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function SwipeableContainer({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className 
}: SwipeableContainerProps) {
  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return (
    <div
      className={cn("touch-pan-y", className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

interface LargeTouchTargetProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

export function LargeTouchTarget({ 
  children, 
  onClick, 
  className,
  ariaLabel 
}: LargeTouchTargetProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        // Minimum 44x44px touch target (WCAG 2.5.5)
        "min-h-[44px] min-w-[44px] flex items-center justify-center",
        "active:scale-95 transition-transform",
        "touch-manipulation", // Prevents double-tap zoom
        className
      )}
    >
      {children}
    </button>
  );
}

interface MobileNavigationControlsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onMenu?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

export function MobileNavigationControls({
  onPrevious,
  onNext,
  onMenu,
  showPrevious = true,
  showNext = true,
  previousLabel = "Previous",
  nextLabel = "Next"
}: MobileNavigationControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t safe-area-pb">
      <div className="flex items-center justify-between p-2 gap-2">
        {showPrevious ? (
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={!onPrevious}
            className="flex-1 h-12 gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only md:not-sr-only">{previousLabel}</span>
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        
        {onMenu && (
          <Button
            variant="outline"
            onClick={onMenu}
            className="h-12 w-12"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        
        {showNext ? (
          <Button
            onClick={onNext}
            disabled={!onNext}
            className="flex-1 h-12 gap-2"
          >
            <span className="sr-only md:not-sr-only">{nextLabel}</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
