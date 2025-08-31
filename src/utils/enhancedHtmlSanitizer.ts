// Enhanced HTML sanitizer for better XSS protection
// Replaces dangerouslySetInnerHTML with safer alternatives

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const ALLOWED_ATTRIBUTES = ['class', 'id'];
const SAFE_CLASS_PREFIXES = ['text-', 'bg-', 'border-', 'p-', 'm-', 'w-', 'h-', 'flex', 'grid', 'space-'];

export function sanitizeHtml(html: string): string {
  // First, check for dangerous patterns and strip all HTML if found
  const dangerousPatterns = [
    /javascript:/gi,
    /on\w+=/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /<style/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(html)) {
      // If dangerous content is detected, strip all HTML and return plain text
      return html.replace(/<[^>]*>/g, '').trim();
    }
  }

  // Parse HTML and sanitize
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Remove all script and style elements
  const scripts = doc.querySelectorAll('script, style, link[rel="stylesheet"]');
  scripts.forEach(el => el.remove());

  // Process all elements
  const walker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const elementsToRemove: Element[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const element = currentNode as Element;
    const tagName = element.tagName.toLowerCase();

    // Remove disallowed tags
    if (!ALLOWED_TAGS.includes(tagName)) {
      elementsToRemove.push(element);
    } else {
      // Sanitize attributes
      const attributes = Array.from(element.attributes);
      attributes.forEach(attr => {
        if (!ALLOWED_ATTRIBUTES.includes(attr.name)) {
          element.removeAttribute(attr.name);
        } else if (attr.name === 'class') {
          // Validate class names
          const classes = attr.value.split(' ').filter(cls => 
            SAFE_CLASS_PREFIXES.some(prefix => cls.startsWith(prefix))
          );
          if (classes.length > 0) {
            element.setAttribute('class', classes.join(' '));
          } else {
            element.removeAttribute('class');
          }
        }
      });
    }

    currentNode = walker.nextNode();
  }

  // Remove dangerous elements
  elementsToRemove.forEach(el => {
    // Keep text content but remove the element
    const textContent = el.textContent || '';
    if (textContent.trim()) {
      el.outerHTML = textContent;
    } else {
      el.remove();
    }
  });

  // Enhanced text content sanitization
  let sanitized = doc.body.innerHTML;
  
  // Escape any remaining script-like content
  sanitized = sanitized
    .replace(/&lt;script/gi, '&amp;lt;script')
    .replace(/&lt;\/script&gt;/gi, '&amp;lt;/script&amp;gt;')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/vbscript:/gi, 'blocked:');

  return sanitized;
}

export function createSafeHtml(html: string) {
  return { __html: sanitizeHtml(html) };
}
