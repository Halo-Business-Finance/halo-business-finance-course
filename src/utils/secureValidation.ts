// Enhanced input validation and sanitization
import { sanitizeInput, validateSecureInput, validateEmail, validatePassword } from './validation';

// Extended validation for different input types
export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

export interface SecureFormData {
  [key: string]: any;
}

// Comprehensive form validation
export const validateForm = (
  formData: SecureFormData,
  validationRules: Record<string, {
    required?: boolean;
    type: 'email' | 'password' | 'name' | 'text' | 'url';
    minLength?: number;
    maxLength?: number;
  }>
): { isValid: boolean; errors: Record<string, string[]>; sanitizedData: SecureFormData } => {
  const errors: Record<string, string[]> = {};
  const sanitizedData: SecureFormData = {};
  let isFormValid = true;

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldValue = formData[fieldName];
    const fieldErrors: string[] = [];

    // Check required fields
    if (rules.required && (!fieldValue || fieldValue.toString().trim() === '')) {
      fieldErrors.push(`${fieldName} is required`);
      isFormValid = false;
      continue;
    }

    if (fieldValue) {
      const stringValue = fieldValue.toString();

      // Length validation
      if (rules.minLength && stringValue.length < rules.minLength) {
        fieldErrors.push(`${fieldName} must be at least ${rules.minLength} characters`);
        isFormValid = false;
      }

      if (rules.maxLength && stringValue.length > rules.maxLength) {
        fieldErrors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
        isFormValid = false;
      }

      // Type-specific validation
      switch (rules.type) {
        case 'email':
          const emailResult = validateEmail(stringValue);
          if (!emailResult.isValid) {
            fieldErrors.push(emailResult.message || 'Invalid email format');
            isFormValid = false;
          }
          break;

        case 'password':
          const passwordResult = validatePassword(stringValue);
          if (!passwordResult.isValid) {
            fieldErrors.push(passwordResult.message || 'Password does not meet requirements');
            isFormValid = false;
          }
          break;

        case 'name':
        case 'text':
        case 'url':
          const textResult = validateSecureInput(stringValue, rules.type);
          if (!textResult.isValid) {
            fieldErrors.push(textResult.message || `Invalid ${rules.type} format`);
            isFormValid = false;
          }
          sanitizedData[fieldName] = textResult.sanitized;
          break;

        default:
          // Default sanitization
          sanitizedData[fieldName] = sanitizeInput(stringValue);
      }
    }

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  }

  return {
    isValid: isFormValid,
    errors,
    sanitizedData
  };
};

// Secure API parameter validation
export const validateApiParams = (
  params: Record<string, any>,
  allowedParams: string[]
): { isValid: boolean; sanitizedParams: Record<string, any>; errors: string[] } => {
  const errors: string[] = [];
  const sanitizedParams: Record<string, any> = {};

  // Check for unexpected parameters
  for (const key of Object.keys(params)) {
    if (!allowedParams.includes(key)) {
      errors.push(`Unexpected parameter: ${key}`);
      continue;
    }

    // Sanitize allowed parameters
    const value = params[key];
    if (typeof value === 'string') {
      sanitizedParams[key] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitizedParams[key] = value;
    } else if (Array.isArray(value)) {
      sanitizedParams[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else {
      // For complex objects, convert to string and sanitize
      sanitizedParams[key] = sanitizeInput(JSON.stringify(value));
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedParams,
    errors
  };
};

// File upload validation
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    errors.push('File size must not exceed 10MB');
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }

  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Invalid file name');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// URL validation for external links
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow https URLs
    if (parsedUrl.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS URLs are allowed' };
    }

    // Block suspicious domains
    const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return { isValid: false, error: 'URL domain not allowed' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};