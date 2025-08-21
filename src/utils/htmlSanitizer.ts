// HTML sanitization utility for user-generated content
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Define allowed tags and attributes
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div'];
  const allowedAttributes = ['class'];
  
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
      
      // Remove disallowed attributes
      Array.from(element.attributes).forEach(attr => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          element.removeAttribute(attr.name);
        }
      });
      
      // Clean child nodes
      Array.from(element.childNodes).forEach(cleanNode);
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Ensure text content is safe
      const textContent = node.textContent || '';
      node.textContent = textContent
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
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