// Secure form handling utilities
import { validateForm, validateApiParams, validateFileUpload, validateUrl } from './secureValidation';
import { sanitizeHtml, createSafeHtml } from './htmlSanitizer';
import { logger } from './secureLogging';

export interface SecureFormOptions {
  sanitizeHtml?: boolean;
  validateUrls?: boolean;
  logSubmissions?: boolean;
  maxFileSize?: number;
}

// Secure form submission handler
export const handleSecureFormSubmission = async (
  formData: FormData,
  validationRules: Record<string, any>,
  options: SecureFormOptions = {}
) => {
  const startTime = Date.now();
  
  try {
    // Convert FormData to regular object
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values (arrays)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    // Validate form data
    const validation = validateForm(data, validationRules);
    
    if (!validation.isValid) {
      logger.security('form_validation_failed', {
        errors: validation.errors,
        formFields: Object.keys(data),
        submissionTime: new Date().toISOString()
      });
      
      return {
        success: false,
        errors: validation.errors,
        data: null
      };
    }

    // Additional security processing
    let processedData = { ...validation.sanitizedData };

    // HTML sanitization if requested
    if (options.sanitizeHtml) {
      for (const [key, value] of Object.entries(processedData)) {
        if (typeof value === 'string' && value.includes('<')) {
          processedData[key] = sanitizeHtml(value);
        }
      }
    }

    // URL validation if requested
    if (options.validateUrls) {
      for (const [key, value] of Object.entries(processedData)) {
        if (typeof value === 'string' && (key.includes('url') || key.includes('link'))) {
          const urlValidation = validateUrl(value);
          if (!urlValidation.isValid) {
            return {
              success: false,
              errors: { [key]: [urlValidation.error || 'Invalid URL'] },
              data: null
            };
          }
        }
      }
    }

    // Log successful submission if requested
    if (options.logSubmissions) {
      logger.info('Secure form submitted successfully', {
        component: 'secureFormHandling',
        action: 'form_submission',
        processingTime: Date.now() - startTime,
        fieldCount: Object.keys(processedData).length
      });
    }

    return {
      success: true,
      errors: {},
      data: processedData
    };

  } catch (error) {
    logger.error('Secure form submission failed', error, {
      component: 'secureFormHandling',
      action: 'form_submission',
      processingTime: Date.now() - startTime
    });

    return {
      success: false,
      errors: { _global: ['Form submission failed. Please try again.'] },
      data: null
    };
  }
};

// Secure file upload handler
export const handleSecureFileUpload = async (
  file: File,
  options: SecureFormOptions = {}
): Promise<{ success: boolean; errors: string[]; file?: File }> => {
  try {
    // Validate file
    const validation = validateFileUpload(file);
    
    if (!validation.isValid) {
      logger.security('file_upload_validation_failed', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        errors: validation.errors
      });
      
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Check file size against custom limit
    const maxSize = options.maxFileSize || (10 * 1024 * 1024); // Default 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        errors: [`File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`]
      };
    }

    logger.info('File upload validation passed', {
      component: 'secureFormHandling',
      action: 'file_upload',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    return {
      success: true,
      errors: [],
      file
    };

  } catch (error) {
    logger.error('File upload validation failed', error, {
      component: 'secureFormHandling',
      action: 'file_upload'
    });

    return {
      success: false,
      errors: ['File upload validation failed. Please try again.']
    };
  }
};

// Rate limiting for form submissions
const submissionTimestamps = new Map<string, number[]>();

export const checkFormSubmissionRate = (
  identifier: string, 
  maxSubmissions: number = 5, 
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; timeUntilReset?: number } => {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get existing timestamps for this identifier
  const timestamps = submissionTimestamps.get(identifier) || [];
  
  // Remove old timestamps
  const recentTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= maxSubmissions) {
    const oldestTimestamp = Math.min(...recentTimestamps);
    const timeUntilReset = oldestTimestamp + windowMs - now;
    
    logger.security('form_submission_rate_limited', {
      identifier,
      attemptCount: recentTimestamps.length,
      maxSubmissions,
      timeUntilReset
    });
    
    return { allowed: false, timeUntilReset };
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  submissionTimestamps.set(identifier, recentTimestamps);
  
  return { allowed: true };
};