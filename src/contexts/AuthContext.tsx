import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/secureLogging';
import { sanitizeError, getToastErrorMessage } from '@/utils/errorSanitizer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: (redirectPath?: string) => Promise<void>;
  updateLastActivity: () => void;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  // Session timeout settings (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const SESSION_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  const updateLastActivity = () => {
    if (session) {
      localStorage.setItem('lastActivity', Date.now().toString());
    }
  };

  const checkSessionTimeout = () => {
    if (!session) return;

    const lastActivity = localStorage.getItem('lastActivity');
    if (!lastActivity) {
      updateLastActivity();
      return;
    }

    const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
    
    // Show warning 5 minutes before timeout
    if (timeSinceLastActivity > (SESSION_TIMEOUT - SESSION_WARNING_TIME) && !sessionWarningShown) {
      setSessionWarningShown(true);
      toast({
        title: "Session Timeout Warning",
        description: "Your session will expire in 5 minutes due to inactivity.",
        variant: "destructive",
      });
    }

    // Auto logout after timeout
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      handleAutoLogout();
    }
  };

  const handleAutoLogout = async () => {
    // Check if user is admin for appropriate redirect
    let isAdmin = false;
    if (user) {
      try {
        const { data: statusData } = await supabase.rpc('check_current_user_admin_status');
        if (statusData) {
          const status = statusData as {
            is_admin: boolean;
            roles: Array<{ role: string; is_active: boolean }>;
          };
          isAdmin = status?.is_admin || false;
        }
      } catch (error) {
        // Fallback check
        try {
          const { data: fallbackData } = await supabase.rpc('get_user_role');
          if (fallbackData) {
            isAdmin = ['admin', 'super_admin', 'tech_support_admin', 'instructor'].includes(fallbackData);
          }
        } catch (fallbackError) {
          // Silent fail - role check will default to non-admin
        }
      }
    }

    await supabase.auth.signOut();
    localStorage.removeItem('lastActivity');
    setSessionWarningShown(false);
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });

    // Redirect based on user role
    if (isAdmin) {
      window.location.href = '/admin/login';
    } else {
      window.location.href = '/auth';
    }
  };

  // Helper function to get client IP (best effort)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0'; // Fallback
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Track geographic location and run anomaly detection
        try {
          const response = await supabase.functions.invoke('geographic-location-tracker', {
            body: {
              user_id: data.user.id,
              ip_address: await getClientIP(),
              user_agent: navigator.userAgent
            }
          });
          
          const result = response.data;
          if (result?.success && result.anomaly_detection?.is_anomaly) {
            toast({
              title: "Security Notice",
              description: `Login from ${result.anomaly_detection.severity} risk location detected. Please verify your identity if this wasn't you.`,
              variant: result.anomaly_detection.severity === 'critical' ? 'destructive' : 'default',
            });
          }
        } catch (locationError) {
          console.error('Location tracking error:', locationError);
          // Don't block login for location tracking failures
        }
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      // Sanitize error to prevent information leakage
      const errorMessage = getToastErrorMessage(error, 'Unable to sign in. Please check your credentials.');
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async (redirectPath?: string) => {
    try {
      // Check if user is admin before signing out
      let isAdmin = false;
      if (user) {
        try {
          const { data: statusData } = await supabase.rpc('check_current_user_admin_status');
          if (statusData) {
            const status = statusData as {
              is_admin: boolean;
              roles: Array<{ role: string; is_active: boolean }>;
            };
            isAdmin = status?.is_admin || false;
          }
        } catch (error) {
          // Fallback check
          try {
            const { data: fallbackData } = await supabase.rpc('get_user_role');
            if (fallbackData) {
              isAdmin = ['admin', 'super_admin', 'tech_support_admin', 'instructor'].includes(fallbackData);
            }
          } catch (fallbackError) {
            // Silent fail - role check will default to non-admin
          }
        }
      }

      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      setSessionWarningShown(false);
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });

      // Redirect based on user role or provided path
      if (redirectPath) {
        window.location.href = redirectPath;
      } else if (isAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/auth';
      }
    } catch (error) {
      logger.error('Sign out failed', error, { component: 'AuthContext' });
      // Sanitize error to prevent information leakage
      const errorMessage = getToastErrorMessage(error, 'Unable to sign out. Please try again.');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state change', { event, hasSession: !!session, hasUser: !!session?.user }, { component: 'AuthContext' });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          updateLastActivity();
          setSessionWarningShown(false);
        } else {
          localStorage.removeItem('lastActivity');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('Initial session check', { hasSession: !!session, hasUser: !!session?.user }, { component: 'AuthContext' });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        updateLastActivity();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up session timeout checker
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [session, sessionWarningShown]);

  // Track user activity
  useEffect(() => {
    if (!session) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      updateLastActivity();
      if (sessionWarningShown) {
        setSessionWarningShown(false);
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [session, sessionWarningShown]);

  const value = {
    user,
    session,
    loading,
    signOut,
    updateLastActivity,
    signIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};