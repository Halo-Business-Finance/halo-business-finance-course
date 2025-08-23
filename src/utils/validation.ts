// Input sanitization and validation utilities

// Enhanced input sanitization with comprehensive security checks
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // First, check for dangerous patterns and reject completely if found
  const dangerousPatterns = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:application/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /<form/gi,
    /<input/gi,
    /<button/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /import\s+/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /constructor/gi,
    /prototype/gi,
    /\.\s*constructor/gi,
    /\[\s*["']constructor["']\s*\]/gi
  ];

  // If any dangerous pattern is found, return empty string
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      console.warn('Dangerous pattern detected in input, rejecting');
      return '';
    }
  }
  
  return input
    .trim()
    // Remove HTML/XML tags completely
    .replace(/<[^>]*>/g, '')
    // Remove script tags content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove javascript: and other dangerous protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/file:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove data URLs and base64 content
    .replace(/data:\s*[^;]*;[^,]*,/gi, '')
    // Remove expression() CSS
    .replace(/expression\s*\([^)]*\)/gi, '')
    // Remove import statements
    .replace(/import\s+.*?from/gi, '')
    // Encode HTML entities for security
    .replace(/&(?!amp;|lt;|gt;|quot;|#x27;|#x2F;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // Remove null bytes and control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Remove Unicode zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Limit length to prevent DoS
    .substring(0, 1000);
};

// Additional security validation for specific contexts
export const validateSecureInput = (input: string, context: 'email' | 'name' | 'text' | 'url' = 'text'): { isValid: boolean; sanitized: string; message?: string } => {
  const sanitized = sanitizeInput(input);
  
  if (!sanitized) {
    return { isValid: false, sanitized: '', message: 'Input cannot be empty after sanitization' };
  }
  
  // Context-specific validation
  switch (context) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(sanitized)) {
        return { isValid: false, sanitized, message: 'Invalid email format' };
      }
      break;
      
    case 'name':
      const nameRegex = /^[a-zA-Z\s\-'\.]{2,50}$/;
      if (!nameRegex.test(sanitized)) {
        return { isValid: false, sanitized, message: 'Name contains invalid characters or invalid length' };
      }
      break;
      
    case 'url':
      try {
        const url = new URL(sanitized);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return { isValid: false, sanitized, message: 'Only HTTP and HTTPS URLs are allowed' };
        }
      } catch {
        return { isValid: false, sanitized, message: 'Invalid URL format' };
      }
      break;
  }
  
  return { isValid: true, sanitized };
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  const sanitized = sanitizeInput(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!sanitized) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter', strength: 'weak' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter', strength: 'weak' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number', strength: 'weak' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character', strength: 'medium' };
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'medium';
  if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength = 'strong';
  }
  
  return { isValid: true, strength };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  const sanitized = sanitizeInput(name);
  
  if (!sanitized) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (sanitized.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (sanitized.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true };
};

// Rate limiting utility with localStorage persistence
class RateLimiter {
  private storageKey: string;
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000, storageKey: string = 'rate_limit_data') {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.storageKey = storageKey;
  }

  private getStoredData(): Map<string, { count: number; lastAttempt: number }> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return new Map();
      
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    } catch {
      return new Map();
    }
  }

  private setStoredData(data: Map<string, { count: number; lastAttempt: number }>): void {
    try {
      const obj = Object.fromEntries(data);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch {
      // Fail silently if localStorage is not available
    }
  }

  isAllowed(identifier: string): { allowed: boolean; timeUntilReset?: number } {
    const now = Date.now();
    const attempts = this.getStoredData();
    const record = attempts.get(identifier);

    if (!record) {
      attempts.set(identifier, { count: 1, lastAttempt: now });
      this.setStoredData(attempts);
      return { allowed: true };
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      attempts.set(identifier, { count: 1, lastAttempt: now });
      this.setStoredData(attempts);
      return { allowed: true };
    }

    // Check if exceeded max attempts
    if (record.count >= this.maxAttempts) {
      const timeUntilReset = this.windowMs - (now - record.lastAttempt);
      return { allowed: false, timeUntilReset };
    }

    // Increment attempts
    record.count++;
    record.lastAttempt = now;
    attempts.set(identifier, record);
    this.setStoredData(attempts);

    return { allowed: true };
  }

  reset(identifier: string): void {
    const attempts = this.getStoredData();
    attempts.delete(identifier);
    this.setStoredData(attempts);
  }

  // Clean up old entries
  cleanup(): void {
    const now = Date.now();
    const attempts = this.getStoredData();
    
    for (const [key, record] of attempts.entries()) {
      if (now - record.lastAttempt > this.windowMs) {
        attempts.delete(key);
      }
    }
    
    this.setStoredData(attempts);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000, 'auth_rate_limit'); // 5 attempts per 15 minutes

// Clean up old rate limit entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    authRateLimiter.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}