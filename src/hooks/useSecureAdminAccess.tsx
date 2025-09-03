import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecurityStatus {
  isAuthorized: boolean;
  userRole: string;
  isDataMasked: boolean;
  accessLevel: 'none' | 'masked' | 'full';
  requiresJustification: boolean;
}

export const useSecureAdminAccess = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isAuthorized: false,
    userRole: 'user',
    isDataMasked: true,
    accessLevel: 'none',
    requiresJustification: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSecurityAccess = async () => {
      if (!user) {
        setSecurityStatus({
          isAuthorized: false,
          userRole: 'user',
          isDataMasked: true,
          accessLevel: 'none',
          requiresJustification: false
        });
        setIsLoading(false);
        return;
      }

      try {
        // Get user role securely
        const { data: roleData, error: roleError } = await supabase
          .rpc('get_user_role_secure');

        if (roleError) {
          throw roleError;
        }

        const userRole = roleData || 'user';
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        const isSuperAdmin = userRole === 'super_admin';

        // Log security access validation using existing function
        await supabase.rpc('log_successful_auth', {
          auth_type: 'admin_role_validation',
          user_email: user.email || undefined
        });

        setSecurityStatus({
          isAuthorized: isAdmin,
          userRole,
          isDataMasked: !isSuperAdmin,
          accessLevel: !isAdmin ? 'none' : isSuperAdmin ? 'full' : 'masked',
          requiresJustification: isAdmin && !isSuperAdmin
        });

      } catch (error) {
        console.error('Security validation failed:', error);
        setSecurityStatus({
          isAuthorized: false,
          userRole: 'user',
          isDataMasked: true,
          accessLevel: 'none',
          requiresJustification: false
        });
        
        toast({
          title: "Security Validation Failed",
          description: "Unable to validate admin permissions",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateSecurityAccess();
  }, [user]);

  return { securityStatus, isLoading };
};