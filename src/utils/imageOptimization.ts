/**
 * Image Optimization Utilities
 * Helper functions for optimizing image loading and performance
 */

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl: string, widths: number[] = [320, 640, 960, 1280, 1920]): string => {
  return widths
    .map(width => `${baseUrl}?w=${width} ${width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizes = (breakpoints: { maxWidth: string; width: string }[] = [
  { maxWidth: '640px', width: '100vw' },
  { maxWidth: '1024px', width: '50vw' },
  { maxWidth: '1280px', width: '33vw' }
]): string => {
  return breakpoints
    .map(bp => `(max-width: ${bp.maxWidth}) ${bp.width}`)
    .join(', ') + ', 25vw';
};

/**
 * Lazy load image with Intersection Observer
 */
export const lazyLoadImage = (img: HTMLImageElement): void => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          const src = image.dataset.src;
          const srcset = image.dataset.srcset;
          
          if (src) image.src = src;
          if (srcset) image.srcset = srcset;
          
          image.classList.add('loaded');
          obs.unobserve(image);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    observer.observe(img);
  } else {
    // Fallback for browsers without Intersection Observer
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    if (src) img.src = src;
    if (srcset) img.srcset = srcset;
  }
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Compress image before upload
 */
export const compressImage = async (
  file: File, 
  maxWidth: number = 1920, 
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};
