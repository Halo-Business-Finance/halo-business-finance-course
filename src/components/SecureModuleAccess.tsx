import { ReactNode } from 'react';
import { useSecureContentAccess } from '@/hooks/useSecureContentAccess';
import { SecurityStatusBanner } from './SecurityStatusBanner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface SecureModuleAccessProps {
  moduleId: string;
  requestedFields?: string[];
  children: ReactNode;
  fallbackContent?: ReactNode;
}

export const SecureModuleAccess = ({ 
  moduleId, 
  requestedFields, 
  children, 
  fallbackContent 
}: SecureModuleAccessProps) => {
  const { user } = useAuth();
  const { canAccess, classification, requiresEnrollment, isLoading, error } = 
    useSecureContentAccess(moduleId, requestedFields);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Validating access...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">Access validation failed</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Show security banner based on access level
  const isEnrolled = user && canAccess && classification === 'restricted';

  return (
    <div className="space-y-4">
      <SecurityStatusBanner 
        classification={classification} 
        isEnrolled={isEnrolled} 
      />
      
      {canAccess ? (
        children
      ) : (
        <div className="text-center py-8 space-y-4">
          {fallbackContent || (
            <>
              <h3 className="text-lg font-semibold">Content Access Restricted</h3>
              <p className="text-muted-foreground">
                {requiresEnrollment 
                  ? "This content requires course enrollment." 
                  : "You don't have permission to view this content."
                }
              </p>
              {!user && (
                <div className="space-x-2">
                  <Button asChild>
                    <Link to="/auth?tab=signup">Sign Up</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/auth?tab=signin">Sign In</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};