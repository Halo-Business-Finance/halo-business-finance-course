import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { supabase } from '@/integrations/supabase/client';

export const SecurityMonitor = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitoring();
  const [threatLevel, setThreatLevel] = useState(0);

  // Military-grade security monitoring
  useEffect(() => {
    if (!user) return;

    const initializeMilitaryGradeSecurity = async () => {
      try {
        // Enhanced session analysis
        const sessionData = {
          device_changed: localStorage.getItem('lastDevice') !== navigator.userAgent,
          location_anomaly: false, // Would need geolocation API
          unusual_hours: new Date().getHours() < 6 || new Date().getHours() > 22,
          multiple_ips: false, // Would need server-side tracking
          concurrent_sessions: 1
        };

        // Analyze session security
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
          
          // Log high-risk sessions
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

        // Store device fingerprint
        localStorage.setItem('lastDevice', navigator.userAgent);

      } catch (error) {
        console.error('Military security initialization failed:', error);
      }
    };

    // Advanced threat detection patterns
    const detectSuspiciousActivity = () => {
      let rapidClickCount = 0;
      let lastClickTime = 0;

      const handleSuspiciousClick = () => {
        const now = Date.now();
        if (now - lastClickTime < 100) { // Clicks faster than 100ms
          rapidClickCount++;
          if (rapidClickCount > 10) {
            // Potential bot behavior
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

      // Enhanced keyboard monitoring for injection attempts
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

      // Console access detection (developer tools)
      const detectConsoleAccess = () => {
        const threshold = 160;
        setInterval(() => {
          if (window.outerHeight - window.innerHeight > threshold ||
              window.outerWidth - window.innerWidth > threshold) {
            logSecurityEvent({
              type: 'developer_tools_detected',
              severity: 'medium',
              details: { 
                potential_debugging: true,
                window_dimensions: {
                  outer: { width: window.outerWidth, height: window.outerHeight },
                  inner: { width: window.innerWidth, height: window.innerHeight }
                },
                timestamp: new Date().toISOString()
              }
            });
          }
        }, 5000);
      };

      document.addEventListener('click', handleSuspiciousClick);
      document.addEventListener('keydown', handleSuspiciousKeyboard);
      detectConsoleAccess();

      return () => {
        document.removeEventListener('click', handleSuspiciousClick);
        document.removeEventListener('keydown', handleSuspiciousKeyboard);
      };
    };

    // Initialize military-grade security
    initializeMilitaryGradeSecurity();
    
    // Track session start with enhanced logging
    if (!localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
      logSecurityEvent({
        type: 'military_grade_session_started',
        severity: 'low',
        details: { 
          security_level: 'military_grade',
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    }

    const cleanup = detectSuspiciousActivity();
    return cleanup;
  }, [user, logSecurityEvent]);

  return null; // This component doesn't render anything
};