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
        // Check user role from database
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Error checking admin permissions:', error);
          toast({
            title: "Permission Error",
            description: "Failed to verify admin permissions. Please try again.",
            variant: "destructive"
          });
          setHasPermission(false);
          setLoading(false);
          return;
        }

        const hasAdminRole = userRoles?.some(role => {
          if (requiredRole === 'super_admin') {
            return role.role === 'super_admin';
          }
          return role.role === 'admin' || role.role === 'super_admin';
        });

        setHasPermission(hasAdminRole || false);

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
    return <Navigate to="/auth" replace />;
  }

  // Redirect if no admin permissions
  if (hasPermission === false) {
    return <Navigate to="/" replace />;
  }

  // Render protected content
  return <>{children}</>;
};