import { logger } from './secureLogging';
import type { SecureFormData, ValidationResult } from '@/types/interfaces';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '') // Only allow valid email characters
    .substring(0, 254); // RFC limit
};

export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  return phone
    .replace(/[^0-9\s\-\(\)\+\.]/g, '') // Only allow phone number characters
    .trim()
    .substring(0, 20); // Reasonable phone number length
};

// Validation functions
export const validateEmail = (email: string): ValidationResult => {
  const sanitized = sanitizeEmail(email);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!sanitized) {
    return { isValid: false, errors: ['Email is required'] };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, errors: ['Please enter a valid email address'] };
  }
  
  return { isValid: true, errors: [] };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  return { isValid: errors.length === 0, errors };
};

export const validatePhone = (phone: string): ValidationResult => {
  const sanitized = sanitizePhone(phone);
  
  if (!sanitized) {
    return { isValid: false, errors: ['Phone number is required'] };
  }
  
  // Basic phone validation - adjust regex as needed for your requirements
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)\.]{7,20}$/;
  
  if (!phoneRegex.test(sanitized)) {
    return { isValid: false, errors: ['Please enter a valid phone number'] };
  }
  
  return { isValid: true, errors: [] };
};

export const validateName = (name: string): ValidationResult => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, errors: ['Name is required'] };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, errors: ['Name must be at least 2 characters long'] };
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, errors: ['Name must be less than 100 characters'] };
  }
  
  // Only allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(sanitized)) {
    return { isValid: false, errors: ['Name contains invalid characters'] };
  }
  
  return { isValid: true, errors: [] };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: false, errors: ['URL is required'] };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTP/HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, errors: ['Only HTTP and HTTPS URLs are allowed'] };
    }
    
    return { isValid: true, errors: [] };
  } catch {
    return { isValid: false, errors: ['Please enter a valid URL'] };
  }
};

export const validateFileUpload = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): ValidationResult => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options;
  const errors: string[] = [];
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
};

// Comprehensive form validation
export const validateForm = (data: SecureFormData, rules: Record<string, {
  required?: boolean;
  type?: 'email' | 'password' | 'phone' | 'name' | 'url' | 'text';
  custom?: (value: any) => ValidationResult;
}>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // Check required fields
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation if field is empty and not required
    if (!value) continue;
    
    // Type-specific validation
    if (typeof value === 'string') {
      let result: ValidationResult;
      
      switch (rule.type) {
        case 'email':
          result = validateEmail(value);
          break;
        case 'password':
          result = validatePassword(value);
          break;
        case 'phone':
          result = validatePhone(value);
          break;
        case 'name':
          result = validateName(value);
          break;
        case 'url':
          result = validateUrl(value);
          break;
        default:
          result = { isValid: true, errors: [] };
      }
      
      if (!result.isValid) {
        errors.push(...result.errors);
      }
    }
    
    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (!customResult.isValid) {
        errors.push(...customResult.errors);
      }
    }
  }
  
  // Log validation attempts for security monitoring
  if (errors.length > 0) {
    logger.warn('Form validation failed', { 
      fieldCount: Object.keys(data).length,
      errorCount: errors.length,
      fields: Object.keys(rules)
    });
  }
  
  return { isValid: errors.length === 0, errors };
};

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { count: 0, lastReset: now };
  
  // Reset window if expired
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }
  
  record.count++;
  rateLimitMap.set(key, record);
  
  if (record.count > maxAttempts) {
    logger.security('RATE_LIMIT_EXCEEDED', { 
      key, 
      attempts: record.count, 
      window: windowMs 
    });
    return false;
  }
  
  return true;
};