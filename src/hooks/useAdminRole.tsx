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
        // Use the new secure functions to check roles
        const { data: isAdminData, error: isAdminError } = await supabase
          .rpc('check_user_has_role', { check_role: 'admin' });
          
        const { data: isSuperAdminData, error: isSuperAdminError } = await supabase
          .rpc('check_user_has_role', { check_role: 'super_admin' });

        if (isAdminError || isSuperAdminError) {
          console.error('Error checking role status:', { isAdminError, isSuperAdminError });
          setIsAdmin(false);
          setUserRole(null);
        } else {
          const hasAdminRole = isAdminData || isSuperAdminData;
          setIsAdmin(hasAdminRole || false);
          
          // Determine specific role
          if (isSuperAdminData) {
            setUserRole('super_admin');
          } else if (isAdminData) {
            setUserRole('admin');
          } else {
            setUserRole(null);
          }
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