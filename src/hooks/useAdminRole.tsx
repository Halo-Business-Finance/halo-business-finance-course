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
        // Check if user has admin role using the is_admin function
        const { data: isAdminData, error: isAdminError } = await supabase
          .rpc('is_admin', { check_user_id: user.id });

        if (isAdminError) {
          console.error('Error checking admin status:', isAdminError);
          setIsAdmin(false);
          setUserRole(null);
        } else {
          setIsAdmin(isAdminData || false);
          
          // Get the specific role for more detailed permissions
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_user_role', { check_user_id: user.id });

          if (!roleError && roleData) {
            setUserRole(roleData);
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