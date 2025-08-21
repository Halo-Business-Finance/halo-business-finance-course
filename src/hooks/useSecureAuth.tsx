import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SecurityValidation {
  isValid: boolean;
  hasEnrollment: boolean;
  userRole: string | null;
  enrollmentVerified: boolean;
}

export const useSecureAuth = () => {
  const { user } = useAuth();
  const [securityValidation, setSecurityValidation] = useState<SecurityValidation>({
    isValid: false,
    hasEnrollment: false,
    userRole: null,
    enrollmentVerified: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateUserSecurity = async () => {
      if (!user) {
        setSecurityValidation({
          isValid: false,
          hasEnrollment: false,
          userRole: null,
          enrollmentVerified: false
        });
        setIsLoading(false);
        return;
      }

      try {
        // Use secure RPC function instead of direct table access
        const { data: userRole } = await supabase.rpc('get_user_role');
        
        // Check enrollment status
        const { data: enrollment, error: enrollmentError } = await supabase
          .from('course_enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', 'halo-launch-pad-learn')
          .eq('status', 'active')
          .maybeSingle();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          console.error('Error checking enrollment:', enrollmentError);
        }

        // Auto-enroll user if not already enrolled and not an admin
        let enrollmentVerified = !!enrollment;
        const isAdmin = ['admin', 'super_admin'].includes(userRole);
        
        if (!enrollment && !isAdmin) {
          try {
            const { error: enrollError } = await supabase
              .from('course_enrollments')
              .insert({
                user_id: user.id,
                course_id: 'halo-launch-pad-learn',
                status: 'active'
              });

            if (!enrollError) {
              enrollmentVerified = true;
            }
          } catch (error) {
            console.error('Auto-enrollment failed:', error);
          }
        }

        setSecurityValidation({
          isValid: true,
          hasEnrollment: enrollmentVerified || isAdmin,
          userRole,
          enrollmentVerified: enrollmentVerified || isAdmin
        });
      } catch (error) {
        console.error('Security validation error:', error);
        setSecurityValidation({
          isValid: false,
          hasEnrollment: false,
          userRole: null,
          enrollmentVerified: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    validateUserSecurity();
  }, [user]);

  return {
    ...securityValidation,
    isLoading,
    user
  };
};