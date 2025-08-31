import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { supabase } from '@/integrations/supabase/client';

export const SecurityMonitor = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();
  const [threatLevel, setThreatLevel] = useState(0);

  // Real-time security monitoring focused on actual threats
  useEffect(() => {
    if (!user) return;

    const initializeRealSecurityMonitoring = async () => {
      try {
        // Enhanced session analysis for actual security threats only
        const sessionData = {
          device_changed: localStorage.getItem('lastDevice') !== navigator.userAgent,
          location_anomaly: false, // Would need geolocation API
          unusual_hours: new Date().getHours() < 6 || new Date().getHours() > 22,
          multiple_ips: false, // Would need server-side tracking
          concurrent_sessions: 1
        };

        // Analyze session security for real threats
        const { data: sessionAnalysis } = await supabase.functions.invoke('military-security-monitor', {
          body: {
            action: 'analyze_session',
            data: {
              user_id: user.id,
              session_data: sessionData
            }
          }
        });

        if (sessionAnalysis?.session_risk_score) {
          setThreatLevel(sessionAnalysis.session_risk_score);
          
          // Only log high-risk sessions (actual security concerns)
          if (sessionAnalysis.session_risk_score >= 6) {
            logSecurityEvent({
              type: 'high_risk_session_detected',
              severity: 'high',
              details: { 
                risk_score: sessionAnalysis.session_risk_score,
                recommendation: sessionAnalysis.security_recommendation,
                timestamp: new Date().toISOString()
              }
            });
          }
        }

        // Store device fingerprint for legitimate security tracking
        localStorage.setItem('lastDevice', navigator.userAgent);

      } catch (error) {
        console.error('Security initialization failed:', error);
      }
    };

    // Real threat detection patterns
    const detectActualThreats = () => {
      let rapidClickCount = 0;
      let lastClickTime = 0;

      const handleSuspiciousClick = () => {
        const now = Date.now();
        if (now - lastClickTime < 50) { // Clicks faster than 50ms (likely bot)
          rapidClickCount++;
          if (rapidClickCount > 20) { // Much higher threshold for actual bots
            // Potential bot behavior - actual security threat
            supabase.functions.invoke('military-security-monitor', {
              body: {
                action: 'detect_threat',
                data: {
                  event_type: 'rapid_click_bot_behavior',
                  severity: 'medium',
                  threat_indicators: {
                    rapid_requests: rapidClickCount,
                    suspicious_input: true
                  },
                  auto_block: false
                }
              }
            });
            rapidClickCount = 0;
          }
        } else {
          rapidClickCount = 0;
        }
        lastClickTime = now;
      };

      // Enhanced keyboard monitoring for actual injection attempts
      const handleSuspiciousKeyboard = (e: KeyboardEvent) => {
        const input = e.target as HTMLInputElement;
        if (input && input.value) {
          const suspiciousPatterns = [
            /union\s+select/i,
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /drop\s+table/i
          ];

          for (const pattern of suspiciousPatterns) {
            if (pattern.test(input.value)) {
              supabase.functions.invoke('military-security-monitor', {
                body: {
                  action: 'detect_threat',
                  data: {
                    event_type: 'code_injection_attempt',
                    severity: 'critical',
                    threat_indicators: {
                      sql_injection_attempt: pattern.source.includes('union'),
                      xss_attempt: pattern.source.includes('script'),
                      suspicious_input: true
                    },
                    auto_block: true
                  }
                }
              });
              break;
            }
          }
        }
      };

      document.addEventListener('click', handleSuspiciousClick);
      document.addEventListener('keydown', handleSuspiciousKeyboard);

      return () => {
        document.removeEventListener('click', handleSuspiciousClick);
        document.removeEventListener('keydown', handleSuspiciousKeyboard);
      };
    };

    // Initialize real security monitoring
    initializeRealSecurityMonitoring();
    
    // Only track session start for legitimate security purposes
    if (!localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
      // No logging for normal session starts - only log actual threats
    }

    const cleanup = detectActualThreats();
    return cleanup;
  }, [user, logSecurityEvent]);

  return null; // This component doesn't render anything
};