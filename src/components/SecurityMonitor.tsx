import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';

export const SecurityMonitor = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();

  useEffect(() => {
    if (!user) return;

    // Enhanced session monitoring
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent({
          type: 'tab_hidden',
          severity: 'low',
          details: { timestamp: new Date().toISOString() }
        });
      } else {
        logSecurityEvent({
          type: 'tab_visible',
          severity: 'low',
          details: { timestamp: new Date().toISOString() }
        });
      }
    };

    const handleBeforeUnload = () => {
      logSecurityEvent({
        type: 'session_ending',
        severity: 'low',
        details: { 
          session_duration: Date.now() - (parseInt(localStorage.getItem('sessionStart') || '0')),
          timestamp: new Date().toISOString()
        }
      });
    };

    // Track session start
    if (!localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
      logSecurityEvent({
        type: 'session_started',
        severity: 'low',
        details: { timestamp: new Date().toISOString() }
      });
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, logSecurityEvent]);

  return null; // This component doesn't render anything
};