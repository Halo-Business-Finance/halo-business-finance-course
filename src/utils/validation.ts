// Input sanitization and validation utilities

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML/XML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\bon\w+\s*=/gi, '')
    // Remove data URLs
    .replace(/data:\s*[^;]*;/gi, '')
    // Encode HTML entities for remaining angle brackets
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Remove null bytes
    .replace(/\0/g, '');
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