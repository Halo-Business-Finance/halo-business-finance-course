import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const checkAdminPermissions = async () => {
      if (!user) {
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
            console.error('Error checking super admin permissions:', error);
            throw error;
          }
          hasAdminRole = isSuperAdmin || false;
        } else {
          // Check for both admin and super_admin roles
          const [adminCheck, superAdminCheck] = await Promise.all([
            supabase.rpc('check_user_has_role', { check_role: 'admin' }),
            supabase.rpc('check_user_has_role', { check_role: 'super_admin' })
          ]);
          
          if (adminCheck.error || superAdminCheck.error) {
            console.error('Error checking admin permissions:', { 
              adminError: adminCheck.error, 
              superAdminError: superAdminCheck.error 
            });
            throw adminCheck.error || superAdminCheck.error;
          }
          
          hasAdminRole = adminCheck.data || superAdminCheck.data;
        }

        setHasPermission(hasAdminRole);

        if (!hasAdminRole) {
          toast({
            title: "Access Denied",
            description: `${requiredRole === 'super_admin' ? 'Super admin' : 'Admin'} privileges required to access this page.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Unexpected error checking permissions:', error);
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
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect if no admin permissions
  if (hasPermission === false) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};