// Input sanitization and validation utilities

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
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

// Rate limiting utility
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 attempts per 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): { allowed: boolean; timeUntilReset?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
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
    this.attempts.set(identifier, record);

    return { allowed: true };
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes