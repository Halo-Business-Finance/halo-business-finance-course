import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      // Save the attempted URL to redirect back after login
      sessionStorage.setItem('redirectUrl', location.pathname + location.search);
      navigate('/auth', { replace: true });
    }
  }, [user, loading, requireAuth, navigate, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Verifying Authentication</h3>
              <p className="text-muted-foreground">Please wait while we check your login status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground">
                You need to be signed in to access this page.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Sign In to Continue
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};