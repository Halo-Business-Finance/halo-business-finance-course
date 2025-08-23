import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/secureLogging';
import { validateEmail, validatePassword } from '@/utils/validation';

interface RateLimitResponse {
  allowed: boolean;
  current_attempts: number;
  max_attempts: number;
  remaining_attempts?: number;
  time_remaining_seconds?: number;
  blocked_until?: string;
}

interface EnhancedAuthResult {
  success: boolean;
  data?: any;
  error?: string;
  rateLimitInfo?: RateLimitResponse;
}

export const useEnhancedAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = useCallback(async (endpoint = '/auth'): Promise<RateLimitResponse | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-auth-security', {
        body: {
          action: 'check_rate_limit',
          endpoint
        }
      });

      if (error) {
        logger.error('Rate limit check failed', error, { component: 'useEnhancedAuth', action: 'checkRateLimit' });
        return null;
      }

      return data?.data || null;
    } catch (error) {
      logger.error('Rate limit check error', error, { component: 'useEnhancedAuth', action: 'checkRateLimit' });
      return null;
    }
  }, []);

  const logAuthAttempt = useCallback(async (
    type: 'failed' | 'successful', 
    email: string, 
    endpoint = '/auth'
  ) => {
    try {
      const action = type === 'failed' ? 'log_failed_auth' : 'log_successful_auth';
      
      await supabase.functions.invoke('enhanced-auth-security', {
        body: {
          action,
          email,
          endpoint
        }
      });
    } catch (error) {
      logger.error('Failed to log auth attempt', error, { component: 'useEnhancedAuth', action: 'logAuthAttempt' });
    }
  }, []);

  const enhancedSignIn = useCallback(async (
    email: string, 
    password: string
  ): Promise<EnhancedAuthResult> => {
    setLoading(true);
    
    try {
      // Validate input first
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      
      if (!emailValidation.isValid) {
        toast({
          title: "Invalid Email",
          description: emailValidation.message || "Please enter a valid email address",
          variant: "destructive"
        });
        return { success: false, error: "Invalid email format" };
      }
      
      if (!passwordValidation.isValid) {
        toast({
          title: "Invalid Password",
          description: passwordValidation.message || "Password does not meet requirements",
          variant: "destructive"
        });
        return { success: false, error: "Invalid password format" };
      }
      // Check rate limit first
      const rateLimitInfo = await checkRateLimit('/auth/signin');
      
      if (rateLimitInfo && !rateLimitInfo.allowed) {
        const timeRemaining = rateLimitInfo.time_remaining_seconds || 0;
        const minutes = Math.ceil(timeRemaining / 60);
        
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many failed attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: 'Rate limit exceeded',
          rateLimitInfo 
        };
      }

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Log failed attempt
        await logAuthAttempt('failed', email, '/auth/signin');
        
        toast({
          title: "Sign In Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: error.message,
          rateLimitInfo 
        };
      }

      // Log successful attempt
      await logAuthAttempt('successful', email, '/auth/signin');
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });

      return { 
        success: true, 
        data,
        rateLimitInfo 
      };

    } catch (error: any) {
      logger.error('Enhanced sign in error', error, { component: 'useEnhancedAuth', action: 'signIn', userId: email });
      
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: error.message || 'Unexpected error' 
      };
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, logAuthAttempt, toast]);

  const enhancedSignUp = useCallback(async (
    email: string, 
    password: string
  ): Promise<EnhancedAuthResult> => {
    setLoading(true);
    
    try {
      // Validate input first
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePassword(password);
      
      if (!emailValidation.isValid) {
        toast({
          title: "Invalid Email",
          description: emailValidation.message || "Please enter a valid email address",
          variant: "destructive"
        });
        return { success: false, error: "Invalid email format" };
      }
      
      if (!passwordValidation.isValid) {
        toast({
          title: "Invalid Password", 
          description: passwordValidation.message || "Password does not meet requirements",
          variant: "destructive"
        });
        return { success: false, error: "Invalid password format" };
      }
      // Check rate limit first
      const rateLimitInfo = await checkRateLimit('/auth/signup');
      
      if (rateLimitInfo && !rateLimitInfo.allowed) {
        const timeRemaining = rateLimitInfo.time_remaining_seconds || 0;
        const minutes = Math.ceil(timeRemaining / 60);
        
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: 'Rate limit exceeded',
          rateLimitInfo 
        };
      }

      // Set up redirect URL
      const redirectUrl = `${window.location.origin}/`;
      
      // Attempt sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        // Log failed attempt
        await logAuthAttempt('failed', email, '/auth/signup');
        
        toast({
          title: "Sign Up Failed",
          description: error.message || "Failed to create account",
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: error.message,
          rateLimitInfo 
        };
      }

      // Log successful attempt
      await logAuthAttempt('successful', email, '/auth/signup');
      
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account."
      });

      return { 
        success: true, 
        data,
        rateLimitInfo 
      };

    } catch (error: any) {
      logger.error('Enhanced sign up error', error, { component: 'useEnhancedAuth', action: 'signUp', userId: email });
      
      toast({
        title: "Sign Up Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: error.message || 'Unexpected error' 
      };
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, logAuthAttempt, toast]);

  const resetPassword = useCallback(async (email: string): Promise<EnhancedAuthResult> => {
    setLoading(true);
    
    try {
      // Check rate limit first
      const rateLimitInfo = await checkRateLimit('/auth/reset');
      
      if (rateLimitInfo && !rateLimitInfo.allowed) {
        const timeRemaining = rateLimitInfo.time_remaining_seconds || 0;
        const minutes = Math.ceil(timeRemaining / 60);
        
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many reset attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: 'Rate limit exceeded',
          rateLimitInfo 
        };
      }

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`
      });

      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message || "Failed to send reset email",
          variant: "destructive"
        });
        
        return { 
          success: false, 
          error: error.message,
          rateLimitInfo 
        };
      }

      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions."
      });

      return { 
        success: true, 
        data,
        rateLimitInfo 
      };

    } catch (error: any) {
      logger.error('Password reset error', error, { component: 'useEnhancedAuth', action: 'resetPassword', userId: email });
      
      toast({
        title: "Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      
      return { 
        success: false, 
        error: error.message || 'Unexpected error' 
      };
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, toast]);

  return {
    loading,
    enhancedSignIn,
    enhancedSignUp,
    resetPassword,
    checkRateLimit,
    logAuthAttempt
  };
};