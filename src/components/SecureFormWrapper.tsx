// Secure form wrapper component for enhanced security
import React, { useState, FormEvent } from 'react';
import { handleSecureFormSubmission, checkFormSubmissionRate, SecureFormOptions } from '@/utils/secureFormHandling';
import { logger } from '@/utils/secureLogging';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecureFormWrapperProps {
  children: React.ReactNode;
  validationRules: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
  options?: SecureFormOptions;
  className?: string;
  rateLimit?: {
    maxSubmissions: number;
    windowMs: number;
  };
}

export const SecureFormWrapper: React.FC<SecureFormWrapperProps> = ({
  children,
  validationRules,
  onSubmit,
  options = {},
  className = '',
  rateLimit = { maxSubmissions: 5, windowMs: 60000 }
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Check rate limiting
      const identifier = user?.id || 'anonymous';
      const rateLimitCheck = checkFormSubmissionRate(
        identifier, 
        rateLimit.maxSubmissions, 
        rateLimit.windowMs
      );
      
      if (!rateLimitCheck.allowed) {
        const minutes = Math.ceil((rateLimitCheck.timeUntilReset || 0) / 60000);
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many submissions. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
          variant: "destructive"
        });
        return;
      }
      
      const formData = new FormData(event.currentTarget);
      
      // Secure form processing
      const result = await handleSecureFormSubmission(formData, validationRules, {
        logSubmissions: true,
        ...options
      });
      
      if (!result.success) {
        // Handle validation errors
        const errorMessages = Object.values(result.errors).flat();
        toast({
          title: "Validation Error",
          description: errorMessages.join(', '),
          variant: "destructive"
        });
        return;
      }
      
      // Call the actual submit handler
      await onSubmit(result.data);
      
    } catch (error) {
      logger.error('Secure form submission error', error, {
        component: 'SecureFormWrapper',
        userId: user?.id
      });
      
      toast({
        title: "Submission Error", 
        description: "An error occurred while submitting the form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <fieldset disabled={isSubmitting}>
        {children}
      </fieldset>
    </form>
  );
};