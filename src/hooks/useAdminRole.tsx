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
          setIsAdmin(false);
          setUserRole(null);
        } else {
          // Type the response properly
          const status = statusData as {
            is_admin: boolean;
            roles: Array<{ role: string; is_active: boolean }>;
          };
          
          console.log('Admin role check response:', status);
          
          const isAdminUser = status?.is_admin || false;
          const roles = status?.roles || [];
          
          // Get the highest priority role
          let primaryRole = null;
          if (roles.length > 0) {
            // Find active roles and prioritize them
            const activeRoles = roles.filter((r: any) => r.is_active);
            if (activeRoles.length > 0) {
              const priority = { 'super_admin': 1, 'admin': 2, 'manager': 3 };
              const sortedRoles = activeRoles.sort((a: any, b: any) => 
                (priority[a.role as keyof typeof priority] || 999) - (priority[b.role as keyof typeof priority] || 999)
              );
              primaryRole = sortedRoles[0].role;
            }
          }
          
          console.log('Admin role check results:', {
            isAdminUser,
            primaryRole,
            activeRoles: roles.filter((r: any) => r.is_active)
          });
          
          setIsAdmin(isAdminUser);
          setUserRole(primaryRole);
        }
      } catch (error) {
        console.error('Error in checkAdminRole:', error);
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