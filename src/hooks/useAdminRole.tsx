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
        // Get the user's role from the database in one call
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking role status:', roleError);
          setIsAdmin(false);
          setUserRole(null);
        } else {
          const role = roleData?.role;
          const hasAdminRole = role === 'admin' || role === 'super_admin';
          
          setIsAdmin(hasAdminRole);
          setUserRole(role || null);
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