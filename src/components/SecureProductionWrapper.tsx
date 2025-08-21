import React, { useEffect } from 'react';

export const SecureProductionWrapper = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Remove all console methods in production to prevent information leakage
    if (process.env.NODE_ENV === 'production') {
      const secureConsole = {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        trace: () => {},
        dir: () => {},
        dirxml: () => {},
        group: () => {},
        groupEnd: () => {},
        time: () => {},
        timeEnd: () => {},
        count: () => {},
        assert: () => {},
        clear: () => {},
        profile: () => {},
        profileEnd: () => {},
      };

      // Override console methods to prevent production information leakage
      Object.assign(console, secureConsole);

      // Override alert to prevent information disclosure
      window.alert = () => {};
      
      // Override confirm for security
      const originalConfirm = window.confirm;
      window.confirm = (message: string) => {
        // Only allow generic confirmations in production
        if (message.toLowerCase().includes('delete') || 
            message.toLowerCase().includes('remove') ||
            message.toLowerCase().includes('confirm')) {
          return originalConfirm('Are you sure you want to continue?');
        }
        return false;
      };
    }
  }, []);

  return <>{children}</>;
};