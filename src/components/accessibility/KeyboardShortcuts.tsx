import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: Shortcut[] = [
    { keys: ['g', 'd'], description: 'Go to Dashboard', action: () => navigate('/dashboard') },
    { keys: ['g', 'c'], description: 'Go to Courses', action: () => navigate('/courses') },
    { keys: ['g', 'p'], description: 'Go to Progress', action: () => navigate('/progress') },
    { keys: ['g', 'a'], description: 'Go to Achievements', action: () => navigate('/achievements') },
    { keys: ['?'], description: 'Show keyboard shortcuts', action: () => setShowHelp(true) },
    { keys: ['Escape'], description: 'Close dialogs', action: () => setShowHelp(false) },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Check for ? key
    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // Check for Escape
    if (event.key === 'Escape') {
      setShowHelp(false);
      return;
    }

    // Handle 'g' prefix shortcuts
    if (event.key === 'g' && !event.ctrlKey && !event.metaKey) {
      // Set up listener for next key
      const handleNextKey = (nextEvent: KeyboardEvent) => {
        const nextTarget = nextEvent.target as HTMLElement;
        if (nextTarget.tagName === 'INPUT' || nextTarget.tagName === 'TEXTAREA') {
          document.removeEventListener('keydown', handleNextKey);
          return;
        }

        nextEvent.preventDefault();
        
        const shortcut = shortcuts.find(s => 
          s.keys.length === 2 && 
          s.keys[0] === 'g' && 
          s.keys[1] === nextEvent.key.toLowerCase()
        );
        
        if (shortcut) {
          shortcut.action();
        }
        
        document.removeEventListener('keydown', handleNextKey);
      };

      // Listen for next key within 1 second
      document.addEventListener('keydown', handleNextKey);
      setTimeout(() => {
        document.removeEventListener('keydown', handleNextKey);
      }, 1000);
    }
  }, [navigate, shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
    shortcuts,
    ShortcutsDialog: (
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Navigation</h4>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.keys[0] === 'g')
                  .map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, j) => (
                          <Kbd key={j}>{key}</Kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">General</h4>
              <div className="space-y-2">
                {shortcuts
                  .filter(s => s.keys[0] !== 'g')
                  .map((shortcut, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, j) => (
                          <Kbd key={j}>{key}</Kbd>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Press <Kbd>?</Kbd> anytime to show this help
          </p>
        </DialogContent>
      </Dialog>
    ),
  };
}
