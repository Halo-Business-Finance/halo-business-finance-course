import { useEffect } from 'react';

interface CSPConfig {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
}

const defaultCSPConfig: CSPConfig = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    "'unsafe-inline'", // Needed for Vite in development
    "'unsafe-eval'", // Needed for Vite in development
    "https://kagwfntxlgzrcngysmlt.supabase.co"
  ],
  'style-src': [
    "'self'", 
    "'unsafe-inline'", // Needed for Tailwind CSS
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'", 
    "data:", 
    "blob:",
    "https:",
    "https://kagwfntxlgzrcngysmlt.supabase.co"
  ],
  'connect-src': [
    "'self'",
    "https://kagwfntxlgzrcngysmlt.supabase.co",
    "wss://kagwfntxlgzrcngysmlt.supabase.co",
    "https://api.openai.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:"
  ],
  'object-src': ["'none'"],
  'media-src': [
    "'self'",
    "https:",
    "blob:"
  ],
  'frame-src': [
    "'self'",
    "https://www.youtube.com",
    "https://youtube.com"
  ]
};

export const ContentSecurityPolicy: React.FC<{ config?: Partial<CSPConfig> }> = ({ 
  config = {} 
}) => {
  useEffect(() => {
    const mergedConfig = { ...defaultCSPConfig, ...config };
    
    // Build CSP string
    const cspString = Object.entries(mergedConfig)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');

    // Set CSP via meta tag for client-side enforcement
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = cspString;
    document.head.appendChild(cspMeta);

    // Also add additional security headers via meta tags
    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
    ];

    securityHeaders.forEach(({ name, content }) => {
      const existing = document.querySelector(`meta[http-equiv="${name}"]`);
      if (existing) {
        existing.remove();
      }

      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = content;
      document.head.appendChild(meta);
    });

    // Log CSP implementation for security monitoring in development only
    if (process.env.NODE_ENV === 'development') {
      // Only log in development for debugging
    }

    return () => {
      // Cleanup on unmount
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspMeta) {
        cspMeta.remove();
      }

      securityHeaders.forEach(({ name }) => {
        const meta = document.querySelector(`meta[http-equiv="${name}"]`);
        if (meta) {
          meta.remove();
        }
      });
    };
  }, [config]);

  return null; // This component doesn't render anything
};

export default ContentSecurityPolicy;