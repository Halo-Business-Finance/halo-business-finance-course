import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonicalUrl,
  structuredData,
  noIndex = false
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update keywords if provided
    if (keywords) {
      let keywordsTag = document.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsTag);
      }
      keywordsTag.setAttribute('content', keywords);
    }
    
    // Update Open Graph tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:url', window.location.href);
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage);
    }
    
    // Update Twitter Card tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    updateTwitterTag('twitter:card', 'summary_large_image');
    updateTwitterTag('twitter:title', title);
    updateTwitterTag('twitter:description', description);
    
    if (ogImage) {
      updateTwitterTag('twitter:image', ogImage);
    }
    
    // Add viewport meta tag for mobile optimization
    let viewportTag = document.querySelector('meta[name="viewport"]');
    if (!viewportTag) {
      viewportTag = document.createElement('meta');
      viewportTag.setAttribute('name', 'viewport');
      document.head.appendChild(viewportTag);
    }
    viewportTag.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5');
    
    // Add theme color
    let themeColorTag = document.querySelector('meta[name="theme-color"]');
    if (!themeColorTag) {
      themeColorTag = document.createElement('meta');
      themeColorTag.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorTag);
    }
    themeColorTag.setAttribute('content', '#1e40af'); // halo-navy color
    
    // Add canonical URL if provided
    if (canonicalUrl) {
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', canonicalUrl);
    }
    
    // Add structured data if provided
    if (structuredData) {
      let structuredDataTag = document.querySelector('script[type="application/ld+json"]');
      if (!structuredDataTag) {
        structuredDataTag = document.createElement('script');
        structuredDataTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredDataTag);
      }
      structuredDataTag.textContent = JSON.stringify(structuredData);
    }
    
    // Add noindex if specified
    if (noIndex) {
      let robotsTag = document.querySelector('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex, nofollow');
    }
    
  }, [title, description, keywords, ogImage, canonicalUrl, structuredData, noIndex]);
  
  return null;
};