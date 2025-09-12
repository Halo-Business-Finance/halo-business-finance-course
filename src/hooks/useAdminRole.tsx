import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Circuit breaker to prevent infinite loops
  const failureCount = useRef(0);
  const lastFailureTime = useRef(0);
  const isChecking = useRef(false);
  const MAX_FAILURES = 3;
  const FAILURE_TIMEOUT = 60000; // 1 minute

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Prevent concurrent checks
      if (isChecking.current) {
        return;
      }

      // Circuit breaker: if too many failures, wait before retrying
      const now = Date.now();
      if (failureCount.current >= MAX_FAILURES && now - lastFailureTime.current < FAILURE_TIMEOUT) {
        console.warn('Circuit breaker active - too many admin role check failures, waiting...');
        setIsAdmin(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // Reset failure count if timeout has passed
      if (now - lastFailureTime.current >= FAILURE_TIMEOUT) {
        failureCount.current = 0;
      }

      isChecking.current = true;

      try {
        // Use a simple timeout to prevent hanging calls
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Admin role check timeout')), 5000)
        );

        const adminCheckPromise = supabase.rpc('check_current_user_admin_status');
        
        const { data: statusData, error } = await Promise.race([
          adminCheckPromise,
          timeoutPromise
        ]) as any;

        if (error) {
          console.error('Error checking role status:', error);
          failureCount.current++;
          lastFailureTime.current = now;
          
          // Set default non-admin state to prevent redirect loops
          setIsAdmin(false);
          setUserRole('trainee');
        } else {
          // Reset failure count on success
          failureCount.current = 0;
          
          // Type the response properly
          const status = statusData as {
            is_admin: boolean;
            role: string;
            user_id: string;
            roles: Array<{ role: string; is_active: boolean }>;
          };
          
          const isAdminUser = status?.is_admin || false;
          const primaryRole = status?.role || 'trainee';
          
          setIsAdmin(isAdminUser);
          setUserRole(primaryRole);
          
          console.log('useAdminRole - Status check results:', {
            isAdminUser,
            primaryRole
          });
        }
      } catch (error) {
        console.error('Error in checkAdminRole:', error);
        failureCount.current++;
        lastFailureTime.current = now;
        
        // Set safe defaults to prevent infinite loops
        setIsAdmin(false);
        setUserRole('trainee');
      } finally {
        setIsLoading(false);
        isChecking.current = false;
      }
    };

    // Debounce the check to prevent rapid successive calls
    const timeoutId = setTimeout(checkAdminRole, 100);
    return () => clearTimeout(timeoutId);
  }, [user]);

  return { 
    isAdmin, 
    isLoading, 
    userRole, 
    isSuperAdmin: userRole === 'super_admin' 
  };
};