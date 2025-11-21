import DOMPurify from 'dompurify';
import { logger } from './secureLogging';

/**
 * SECURITY: This implementation uses DOMPurify, a battle-tested HTML sanitization library
 * that is regularly audited and updated to protect against new XSS vectors.
 * 
 * DOMPurify provides comprehensive protection against:
 * - Script injection attacks
 * - Event handler injection
 * - CSS-based attacks
 * - DOM clobbering
 * - And many other XSS vectors
 */

// Enhanced HTML sanitization utility for user-generated content with DOMPurify
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  try {
    // Configure DOMPurify with safe defaults
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['class', 'id'],
      ALLOW_DATA_ATTR: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
    });

    // Security logging for significant content changes
    if (html.length > 0 && cleanHtml.length < html.length * 0.5) {
      logger.security('HTML_SANITIZATION_SIGNIFICANT_REDUCTION', { 
        originalLength: html.length,
        sanitizedLength: cleanHtml.length,
        reductionPercentage: Math.round(((html.length - cleanHtml.length) / html.length) * 100),
        timestamp: new Date().toISOString()
      });
    }

    return cleanHtml;
  } catch (error) {
    logger.error('HTML sanitization failed', error);
    // Return empty string on sanitization failure for security
    return '';
  }
};

// Safe component for rendering user HTML content
export const createSafeHtml = (html: string) => {
  return { __html: sanitizeHtml(html) };
};
