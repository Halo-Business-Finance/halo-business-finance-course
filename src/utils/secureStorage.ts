import { logger } from './secureLogging';

// Secure localStorage wrapper with encryption simulation
class SecureStorage {
  private prefix = 'secure_';
  private keyPrefix = 'lms_';
  
  // Simple encryption/decryption (in production, use a proper crypto library)
  private encrypt(data: string): string {
    try {
      // In production, use a proper encryption library like crypto-js
      // This is a basic obfuscation for demo purposes
      const encrypted = btoa(unescape(encodeURIComponent(data)));
      return `enc_${encrypted}`;
    } catch (error) {
      logger.error('Encryption failed', error);
      return data; // Fallback to unencrypted
    }
  }
  
  private decrypt(encryptedData: string): string {
    try {
      if (!encryptedData.startsWith('enc_')) {
        return encryptedData; // Not encrypted
      }
      
      const data = encryptedData.slice(4); // Remove 'enc_' prefix
      return decodeURIComponent(escape(atob(data)));
    } catch (error) {
      logger.error('Decryption failed', error);
      return encryptedData; // Fallback to original
    }
  }
  
  private getFullKey(key: string): string {
    return `${this.prefix}${this.keyPrefix}${key}`;
  }
  
  setItem(key: string, value: any, encrypt: boolean = true): boolean {
    try {
      if (!this.isStorageAvailable()) {
        logger.warn('localStorage not available');
        return false;
      }
      
      const serialized = JSON.stringify(value);
      const finalValue = encrypt ? this.encrypt(serialized) : serialized;
      const fullKey = this.getFullKey(key);
      
      localStorage.setItem(fullKey, finalValue);
      
      logger.debug('Secure storage set', { 
        key: fullKey, 
        encrypted: encrypt,
        size: finalValue.length 
      });
      
      return true;
    } catch (error) {
      logger.error('SecureStorage setItem failed', error, { key });
      return false;
    }
  }
  
  getItem<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      if (!this.isStorageAvailable()) {
        return defaultValue;
      }
      
      const fullKey = this.getFullKey(key);
      const stored = localStorage.getItem(fullKey);
      
      if (!stored) {
        return defaultValue;
      }
      
      const decrypted = this.decrypt(stored);
      const parsed = JSON.parse(decrypted);
      
      logger.debug('Secure storage get', { key: fullKey });
      
      return parsed;
    } catch (error) {
      logger.error('SecureStorage getItem failed', error, { key });
      return defaultValue;
    }
  }
  
  removeItem(key: string): boolean {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }
      
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
      
      logger.debug('Secure storage removed', { key: fullKey });
      
      return true;
    } catch (error) {
      logger.error('SecureStorage removeItem failed', error, { key });
      return false;
    }
  }
  
  clear(): boolean {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }
      
      // Only clear items with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      logger.info('Secure storage cleared', { itemsRemoved: keysToRemove.length });
      
      return true;
    } catch (error) {
      logger.error('SecureStorage clear failed', error);
      return false;
    }
  }
  
  getAllKeys(): string[] {
    try {
      if (!this.isStorageAvailable()) {
        return [];
      }
      
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          // Remove our prefix to return clean key names
          keys.push(key.slice(this.prefix.length + this.keyPrefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      logger.error('SecureStorage getAllKeys failed', error);
      return [];
    }
  }
  
  getStorageInfo(): { totalItems: number; estimatedSize: number; isAvailable: boolean } {
    try {
      if (!this.isStorageAvailable()) {
        return { totalItems: 0, estimatedSize: 0, isAvailable: false };
      }
      
      let totalItems = 0;
      let estimatedSize = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          totalItems++;
          const value = localStorage.getItem(key);
          if (value) {
            estimatedSize += key.length + value.length;
          }
        }
      }
      
      return { totalItems, estimatedSize, isAvailable: true };
    } catch (error) {
      logger.error('SecureStorage getStorageInfo failed', error);
      return { totalItems: 0, estimatedSize: 0, isAvailable: false };
    }
  }
  
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
  
  // Secure session management
  setSession(sessionData: any, expirationMinutes: number = 480): boolean {
    const expirationTime = Date.now() + (expirationMinutes * 60 * 1000);
    const sessionWithExpiry = {
      data: sessionData,
      expiresAt: expirationTime
    };
    
    return this.setItem('session', sessionWithExpiry, true);
  }
  
  getSession<T = any>(): T | null {
    const session = this.getItem('session');
    
    if (!session || !session.expiresAt) {
      return null;
    }
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      this.removeItem('session');
      logger.info('Session expired and removed');
      return null;
    }
    
    return session.data;
  }
  
  clearSession(): boolean {
    return this.removeItem('session');
  }
  
  // Secure preferences management
  setUserPreference(userId: string, key: string, value: any): boolean {
    const prefKey = `user_${userId}_pref_${key}`;
    return this.setItem(prefKey, value, false); // Preferences don't need encryption
  }
  
  getUserPreference<T = any>(userId: string, key: string, defaultValue: T | null = null): T | null {
    const prefKey = `user_${userId}_pref_${key}`;
    return this.getItem(prefKey, defaultValue);
  }
  
  clearUserPreferences(userId: string): boolean {
    try {
      const keys = this.getAllKeys();
      const userPrefKeys = keys.filter(key => key.startsWith(`user_${userId}_pref_`));
      
      let success = true;
      userPrefKeys.forEach(key => {
        if (!this.removeItem(key)) {
          success = false;
        }
      });
      
      logger.info('User preferences cleared', { 
        userId, 
        preferencesCleared: userPrefKeys.length 
      });
      
      return success;
    } catch (error) {
      logger.error('Failed to clear user preferences', error, { userId });
      return false;
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Helper functions for common use cases
export const storeUserData = (userId: string, data: any): boolean => {
  return secureStorage.setItem(`user_${userId}`, data, true);
};

export const getUserData = <T = any>(userId: string): T | null => {
  return secureStorage.getItem(`user_${userId}`);
};

export const clearUserData = (userId: string): boolean => {
  const success = secureStorage.removeItem(`user_${userId}`);
  secureStorage.clearUserPreferences(userId);
  return success;
};

// Cache management with TTL
export const setCachedData = (key: string, data: any, ttlMinutes: number = 60): boolean => {
  const cacheData = {
    data,
    expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
    createdAt: Date.now()
  };
  return secureStorage.setItem(`cache_${key}`, cacheData, false);
};

export const getCachedData = <T = any>(key: string): T | null => {
  const cached = secureStorage.getItem(`cache_${key}`);
  
  if (!cached || !cached.expiresAt) {
    return null;
  }
  
  if (Date.now() > cached.expiresAt) {
    secureStorage.removeItem(`cache_${key}`);
    return null;
  }
  
  return cached.data;
};

export const clearCache = (): boolean => {
  try {
    const keys = secureStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    let success = true;
    cacheKeys.forEach(key => {
      if (!secureStorage.removeItem(key)) {
        success = false;
      }
    });
    
    logger.info('Cache cleared', { itemsCleared: cacheKeys.length });
    return success;
  } catch (error) {
    logger.error('Failed to clear cache', error);
    return false;
  }
};