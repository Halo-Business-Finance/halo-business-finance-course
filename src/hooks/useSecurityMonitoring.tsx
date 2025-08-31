import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: Record<string, any>;
}

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  const logSecurityEvent = async (event: SecurityEvent) => {
    if (!user) return;

    // Only log real security threats, not development noise
    const realSecurityEvents = [
      'unauthorized_access_attempt',
      'suspicious_activity', 
      'potential_breach',
      'authentication_failure',
      'rate_limit_exceeded',
      'malicious_injection_attempt',
      'suspicious_rapid_navigation',
      'potential_credential_paste',
      'multiple_auth_failures',
      'data_breach_attempt',
      'high_risk_session_detected',
      'rapid_click_bot_behavior',
      'code_injection_attempt'
    ];

    if (!realSecurityEvents.includes(event.type)) {
      // Skip fake development events - no logging
      return;
    }

    try {
      await supabase.rpc('log_client_security_event', {
        event_type: event.type,
        event_severity: event.severity,
        event_details: {
          ...event.details,
          user_id: user.id,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const detectSuspiciousActivity = () => {
    // Monitor for rapid navigation patterns (potential bot behavior)
    let navigationCount = 0;
    const navigationWindow = 10000; // 10 seconds
    
    const resetNavigationCount = () => {
      navigationCount = 0;
    };

    const handleNavigation = () => {
      navigationCount++;
      if (navigationCount > 50) { // High threshold to reduce false positives
        logSecurityEvent({
          type: 'suspicious_rapid_navigation',
          severity: 'medium',
          details: {
            navigation_count: navigationCount,
            time_window: navigationWindow
          }
        });
        navigationCount = 0; // Reset to avoid spam
      }
    };

    // Monitor for copy/paste of sensitive data only
    const handlePaste = (event: ClipboardEvent) => {
      const pastedText = event.clipboardData?.getData('text') || '';
      
      // Check for potential credential patterns
      const credentialPatterns = [
        /password/gi,
        /token/gi,
        /api[_-]?key/gi,
        /secret/gi,
        /bearer\s+[a-zA-Z0-9]+/gi
      ];

      const hasCredentials = credentialPatterns.some(pattern => pattern.test(pastedText));
      
      if (hasCredentials && pastedText.length > 20) { // Increased threshold
        logSecurityEvent({
          type: 'potential_credential_paste',
          severity: 'medium',
          details: {
            text_length: pastedText.length,
            has_suspicious_patterns: true
          }
        });
      }
    };

    // Set up event listeners (NO console monitoring)
    window.addEventListener('beforeunload', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    document.addEventListener('paste', handlePaste);

    // Set up navigation reset timer
    const navigationTimer = setInterval(resetNavigationCount, navigationWindow);

    return () => {
      window.removeEventListener('beforeunload', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
      document.removeEventListener('paste', handlePaste);
      clearInterval(navigationTimer);
    };
  };

  const detectFailedAuthAttempts = () => {
    let failedAttempts = 0;
    const maxAttempts = 5;

    return (isFailure: boolean) => {
      if (isFailure) {
        failedAttempts++;
        if (failedAttempts >= maxAttempts) {
          logSecurityEvent({
            type: 'multiple_auth_failures',
            severity: 'high',
            details: {
              failed_attempts: failedAttempts,
              max_attempts: maxAttempts
            }
          });
        }
      } else {
        failedAttempts = 0; // Reset on success
      }
    };
  };

  useEffect(() => {
    if (!user) return;

    // Initialize security monitoring only for actual threats
    const cleanup = detectSuspiciousActivity();

    return cleanup;
  }, [user]);

  return {
    logSecurityEvent,
    detectFailedAuthAttempts: detectFailedAuthAttempts()
  };
};