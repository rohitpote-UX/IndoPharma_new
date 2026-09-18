/**
 * ==============================================================================
 * INDOPHARM — XSS SANITIZATION & INPUT PURIFICATION
 * ==============================================================================
 * Neutralizes HTML and script injection in user-supplied strings before
 * persistence or presentation (Golden Rule 19).
 * ==============================================================================
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Encodes dangerous characters to their HTML entity equivalents.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"'/`]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitizes arbitrary text input by removing control characters/null bytes and escaping HTML.
 */
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  // Strip null bytes and control characters (except newline and carriage return)
  const cleaned = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return escapeHtml(cleaned);
}

export const sanitizeString = sanitizeInput;

/**
 * Recursively sanitizes all string properties within an object or array.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }
  return obj;
}

