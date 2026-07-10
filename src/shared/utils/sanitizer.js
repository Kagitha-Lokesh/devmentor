import DOMPurify from 'dompurify';

/**
 * Simple HTML sanitizer and encoder for input values to prevent basic XSS injections.
 */

export function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function decodeSanitizedString(value) {
  if (typeof value !== 'string') return value;

  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

export function sanitizeHtml(htmlString) {
  if (typeof htmlString !== 'string') return htmlString;
  
  // Use enterprise-grade secure DOMPurify library
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'span', 'blockquote',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'class', 'id', 'style']
  });
}

export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  return obj;
}
