import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateLastActivity: () => void;
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
    await supabase.auth.signOut();
    localStorage.removeItem('lastActivity');
    setSessionWarningShown(false);
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      setSessionWarningShown(false);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
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
      console.log('Initial session check:', { hasSession: !!session, hasUser: !!session?.user });
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};