// Enhanced HTML sanitization utility for user-generated content
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Pre-sanitize input to remove dangerous patterns
  let cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/data:text\/html/gi, '') // Remove data URLs with HTML
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = cleanHtml;
  
  // Define strict whitelist of allowed tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote'];
  const allowedAttributes = new Map([
    ['*', ['class', 'id']], // Global attributes
    ['a', ['href', 'title', 'target']], // Link attributes (if needed)
    ['img', ['src', 'alt', 'title']], // Image attributes (if needed)
  ]);
  
  // Recursively clean the DOM tree with enhanced security
  const cleanNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        // Replace with text content only
        const textNode = document.createTextNode(element.textContent || '');
        element.parentNode?.replaceChild(textNode, element);
        return;
      }
      
      // Clean attributes with strict whitelist
      const allowedAttrs = [
        ...(allowedAttributes.get('*') || []),
        ...(allowedAttributes.get(tagName) || [])
      ];
      
      Array.from(element.attributes).forEach(attr => {
        const attrName = attr.name.toLowerCase();
        const attrValue = attr.value.toLowerCase();
        
        // Remove disallowed attributes
        if (!allowedAttrs.includes(attrName)) {
          element.removeAttribute(attr.name);
          return;
        }
        
        // Additional validation for specific attributes
        if (attrName === 'href' && (attrValue.includes('javascript:') || attrValue.includes('data:'))) {
          element.removeAttribute(attr.name);
        }
        if (attrName === 'src' && (attrValue.includes('javascript:') || attrValue.includes('data:text/html'))) {
          element.removeAttribute(attr.name);
        }
      });
      
      // Clean child nodes recursively
      Array.from(element.childNodes).forEach(cleanNode);
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Enhanced text content sanitization
      const textContent = node.textContent || '';
      node.textContent = textContent
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/&/g, '&amp;'); // Also escape ampersands
    }
  };
  
  // Clean all child nodes
  Array.from(tempDiv.childNodes).forEach(cleanNode);
  
  return tempDiv.innerHTML;
};

// Safe component for rendering user HTML content
export const createSafeHtml = (html: string) => {
  return { __html: sanitizeHtml(html) };
};