// Enhanced HTML sanitization utility for user-generated content
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Enhanced security check for dangerous patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /<input/gi,
    /<link/gi,
    /<meta/gi,
    /<style/gi
  ];
  
  // Check for dangerous patterns and reject if found
  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      console.warn('Dangerous pattern detected in HTML content, sanitizing aggressively');
      return html.replace(/<[^>]*>/g, ''); // Strip all HTML if dangerous patterns found
    }
  }
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Define allowed tags and attributes with stricter controls
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
  const allowedAttributes = ['class', 'id'];
  const allowedClasses = ['text-', 'bg-', 'font-', 'p-', 'm-', 'flex', 'grid', 'space-']; // Only allow safe Tailwind classes
  
  // Recursively clean the DOM tree
  const cleanNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      
      // Remove disallowed tags
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        // Replace with text content
        const textNode = document.createTextNode(element.textContent || '');
        element.parentNode?.replaceChild(textNode, element);
        return;
      }
      
      // Remove disallowed attributes and validate class names
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        } else if (attr.name.toLowerCase() === 'class') {
          // Validate class names
          const classes = attr.value.split(' ').filter(cls => 
            allowedClasses.some(allowed => cls.startsWith(allowed))
          );
          if (classes.length > 0) {
            element.setAttribute('class', classes.join(' '));
          } else {
            element.removeAttribute('class');
          }
        }
      });
      
      // Clean child nodes
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
        .replace(/&(?!amp;|lt;|gt;|quot;|#x27;|#x2F;)/g, '&amp;'); // Escape unescaped ampersands
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