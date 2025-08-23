import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        // Use the secure function to check admin status
        const { data: statusData, error } = await supabase.rpc('check_current_user_admin_status');

        if (error) {
          console.error('Error checking role status:', error);
          
          // Log security event for failed admin status check
          try {
            await supabase.rpc('log_client_security_event', {
              event_type: 'admin_status_check_failed',
              event_severity: 'medium',
              event_details: {
                error_message: error.message,
                error_code: error.code,
                user_id: user.id
              }
            });
          } catch (logError) {
            console.error('Failed to log security event:', logError);
          }

          // Fallback to basic role check
          try {
            const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_user_role');
            if (!fallbackError && fallbackData) {
              const isAdminRole = ['admin', 'super_admin', 'tech_support_admin', 'instructor'].includes(fallbackData);
              setIsAdmin(isAdminRole);
              setUserRole(isAdminRole ? fallbackData : null);
            } else {
              setIsAdmin(false);
              setUserRole(null);
            }
          } catch (fallbackError) {
            console.error('Fallback role check failed:', fallbackError);
            setIsAdmin(false);
            setUserRole(null);
          }
        } else {
          // Type the response properly
          const status = statusData as {
            is_admin: boolean;
            roles: Array<{ role: string; is_active: boolean }>;
          };
          
          const isAdminUser = status?.is_admin || false;
          const roles = status?.roles || [];
          
          // Get the highest priority role
          let primaryRole = null;
          if (roles.length > 0) {
            // Find active roles and prioritize them
            const activeRoles = roles.filter((r: any) => r.is_active);
            if (activeRoles.length > 0) {
              const priority = { 'super_admin': 1, 'admin': 2, 'tech_support_admin': 3, 'instructor': 4, 'trainee': 5 };
              const sortedRoles = activeRoles.sort((a: any, b: any) => 
                (priority[a.role as keyof typeof priority] || 999) - (priority[b.role as keyof typeof priority] || 999)
              );
              primaryRole = sortedRoles[0].role;
            }
          }
          
          setIsAdmin(isAdminUser);
          setUserRole(primaryRole);
        }
      } catch (error) {
        console.error('Error in checkAdminRole:', error);
        
        // Log critical security event for unexpected errors
        try {
          await supabase.rpc('log_client_security_event', {
            event_type: 'admin_role_check_critical_error',
            event_severity: 'high',
            event_details: {
              error_message: error instanceof Error ? error.message : 'Unknown error',
              user_id: user.id,
              stack_trace: error instanceof Error ? error.stack : undefined
            }
          });
        } catch (logError) {
          console.error('Failed to log critical security event:', logError);
        }

        setIsAdmin(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return { 
    isAdmin, 
    isLoading, 
    userRole, 
    isSuperAdmin: userRole === 'super_admin' 
  };
};