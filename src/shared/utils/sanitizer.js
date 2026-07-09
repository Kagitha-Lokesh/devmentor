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
  
  // Strip script blocks and dangerous tags completely
  let clean = htmlString.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  
  // Strip inline event attributes (e.g. onload, onerror, onclick)
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  
  return clean;
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
