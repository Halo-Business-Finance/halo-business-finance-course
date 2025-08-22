import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useProductionSecurityLogger } from '@/components/ProductionSecurityLogger';

interface AdminProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'super_admin';
}

export const AdminProtectedRoute = ({ 
  children, 
  requiredRole = 'admin' 
}: AdminProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { secureError } = useProductionSecurityLogger('AdminProtectedRoute');

  useEffect(() => {
    const checkAdminPermissions = async () => {
      console.log('AdminProtectedRoute: Checking permissions for user:', user?.id, user?.email);
      if (!user) {
        console.log('AdminProtectedRoute: No user found');
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        // Use secure function to check roles without exposing user_roles table
        let hasAdminRole = false;
        
        if (requiredRole === 'super_admin') {
          const { data: isSuperAdmin, error } = await supabase
            .rpc('check_user_has_role', { check_role: 'super_admin' });
            
          if (error) {
            console.error('Super admin role check error:', error);
            setHasPermission(false);
            setLoading(false);
            return;
          }
          hasAdminRole = isSuperAdmin || false;
        } else {
          // Check for both admin and super_admin roles
          const [adminCheck, superAdminCheck] = await Promise.all([
            supabase.rpc('check_user_has_role', { check_role: 'admin' }),
            supabase.rpc('check_user_has_role', { check_role: 'super_admin' })
          ]);
          
          if (adminCheck.error && superAdminCheck.error) {
            console.error('Admin role check errors:', { adminCheck: adminCheck.error, superAdminCheck: superAdminCheck.error });
            setHasPermission(false);
            setLoading(false);
            return;
          }
          
          // Allow access if user has either admin or super_admin role
          hasAdminRole = (adminCheck.data === true) || (superAdminCheck.data === true);
        }

        console.log('Admin role check result:', { hasAdminRole, requiredRole, userId: user.id });
        setHasPermission(hasAdminRole);

        if (!hasAdminRole) {
          toast({
            title: "Access Denied",
            description: `${requiredRole === 'super_admin' ? 'Super admin' : 'Admin'} privileges required to access this page.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking admin permissions:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminPermissions();
    }
  }, [user, authLoading, requiredRole]);

  // Show loading while checking auth or permissions
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if no admin permissions
  if (hasPermission === false) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
};