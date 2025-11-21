// Secure HTML rendering utilities to replace dangerouslySetInnerHTML
import React from 'react';
import { sanitizeHtml } from './htmlSanitizer';
import { logger } from './secureLogging';

/**
 * SECURITY: This component uses DOMPurify for HTML sanitization.
 * 
 * Additional security recommendations:
 * 1. Implement Content Security Policy (CSP) headers in your application
 * 2. Add CSP meta tag to index.html for defense-in-depth:
 *    <meta http-equiv="Content-Security-Policy" 
 *          content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
 */

interface SecureHtmlProps {
  content: string;
  className?: string;
  maxLength?: number;
  allowedTags?: string[];
  onSecurityViolation?: (violation: string) => void;
}

// Secure component for rendering sanitized HTML content
export const SecureHtmlRenderer: React.FC<SecureHtmlProps> = ({
  content,
  className = '',
  maxLength = 50000,
  onSecurityViolation
}) => {
  // Input validation
  if (!content || typeof content !== 'string') {
    return <div className={className}>No content available</div>;
  }

  // Length validation
  if (content.length > maxLength) {
    logger.warn('HTML content exceeds maximum length', { 
      contentLength: content.length, 
      maxLength 
    });
    if (onSecurityViolation) {
      onSecurityViolation(`Content exceeds maximum length: ${content.length}/${maxLength}`);
    }
    return <div className={className}>Content too large to display safely</div>;
  }

  // Sanitize the content using DOMPurify
  const sanitizedContent = sanitizeHtml(content);
  
  // Additional security check - if sanitized content is significantly different, log it
  const originalLength = content.length;
  const sanitizedLength = sanitizedContent.length;
  const reductionPercentage = ((originalLength - sanitizedLength) / originalLength) * 100;
  
  if (reductionPercentage > 50) {
    logger.security('HTML_SANITIZATION_SIGNIFICANT_REDUCTION', {
      originalLength,
      sanitizedLength,
      reductionPercentage: Math.round(reductionPercentage)
    });
    if (onSecurityViolation) {
      onSecurityViolation(`Content was heavily sanitized (${Math.round(reductionPercentage)}% removed)`);
    }
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Hook for safe HTML rendering with additional security checks
export const useSafeHtml = (content: string, options: {
  maxLength?: number;
  trackAccess?: boolean;
  userId?: string;
} = {}) => {
  const { maxLength = 50000, trackAccess = false, userId } = options;

  React.useEffect(() => {
    if (trackAccess && content && userId) {
      logger.info('HTML content accessed', {
        userId,
        contentLength: content.length,
        timestamp: new Date().toISOString()
      });
    }
  }, [content, trackAccess, userId]);

  const sanitizedContent = React.useMemo(() => {
    if (!content) return '';
    
    if (content.length > maxLength) {
      logger.warn('HTML content truncated due to length', { 
        originalLength: content.length, 
        maxLength,
        userId 
      });
      return sanitizeHtml(content.substring(0, maxLength) + '...');
    }
    
    return sanitizeHtml(content);
  }, [content, maxLength, userId]);

  return sanitizedContent;
};

// Safe text extractor that removes all HTML
export const extractSafeText = (html: string, maxLength: number = 500): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Create a temporary element to extract text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizeHtml(html);
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  return textContent.length > maxLength 
    ? textContent.substring(0, maxLength) + '...'
    : textContent;
};

// Component for safe preview of HTML content
export const SafeHtmlPreview: React.FC<{
  content: string;
  maxLength?: number;
  className?: string;
}> = ({ content, maxLength = 200, className = '' }) => {
  const safeText = extractSafeText(content, maxLength);
  
  return (
    <div className={`text-muted-foreground ${className}`}>
      {safeText || 'No content preview available'}
    </div>
  );
};
