import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ContentAccessResult {
  canAccess: boolean;
  classification: string;
  requiresEnrollment: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useSecureContentAccess = (moduleId: string, requestedFields: string[] = ['basic']) => {
  const { user } = useAuth();
  const [result, setResult] = useState<ContentAccessResult>({
    canAccess: false,
    classification: 'unknown',
    requiresEnrollment: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setResult(prev => ({ ...prev, isLoading: true, error: null }));

        // Check if user can access this content
        const { data: canAccess, error: accessError } = await supabase.rpc(
          'validate_course_content_access',
          {
            module_id: moduleId,
            requested_fields: requestedFields
          }
        );

        if (accessError) throw accessError;

        // Get module security metadata
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .select('content_classification, security_metadata')
          .eq('module_id', moduleId)
          .single();

        if (moduleError) throw moduleError;

        // Log access attempt
        await supabase.rpc('log_course_access_attempt', {
          module_id: moduleId,
          access_type: 'content_validation',
          success: canAccess || false
        });

        const securityMetadata = moduleData?.security_metadata as any;
        setResult({
          canAccess: canAccess || false,
          classification: moduleData?.content_classification || 'unknown',
          requiresEnrollment: securityMetadata?.requires_enrollment || false,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('Content access validation failed:', error);
        setResult(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Access validation failed'
        }));

        // Log failed validation attempt
        await supabase.rpc('log_course_access_attempt', {
          module_id: moduleId,
          access_type: 'content_validation_error',
          success: false
        });
      }
    };

    if (moduleId) {
      validateAccess();
    }
  }, [moduleId, user?.id, requestedFields]);

  return result;
};