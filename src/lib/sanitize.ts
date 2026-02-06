/**
 * Input sanitization utilities for user-generated content
 */

// Maximum lengths for various content types
export const MAX_LENGTHS = {
  name: 50,
  bio: 500,
  message: 2000,
  email: 254,
  location: 100,
  occupation: 100,
} as const;

/**
 * Sanitize a string by removing potentially dangerous characters
 * and trimming to max length
 */
export const sanitizeString = (
  input: string | undefined | null,
  maxLength: number = 500
): string => {
  if (!input) return '';

  return input
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Trim whitespace
    .trim()
    // Limit length
    .slice(0, maxLength);
};

/**
 * Sanitize HTML-like content to prevent XSS (for web builds)
 */
export const sanitizeForDisplay = (input: string | undefined | null): string => {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Sanitize user name
 */
export const sanitizeName = (name: string | undefined | null): string => {
  if (!name) return '';

  return sanitizeString(name, MAX_LENGTHS.name)
    // Remove numbers and special characters except spaces, hyphens, apostrophes
    .replace(/[^a-zA-Z\s\-']/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitize email address
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
  if (!email) return '';

  return sanitizeString(email.toLowerCase(), MAX_LENGTHS.email)
    // Basic email character allowlist
    .replace(/[^a-z0-9@._\-+]/g, '');
};

/**
 * Sanitize bio/description text
 */
export const sanitizeBio = (bio: string | undefined | null): string => {
  if (!bio) return '';

  return sanitizeString(bio, MAX_LENGTHS.bio)
    // Allow letters, numbers, common punctuation, spaces, newlines
    .replace(/[^\p{L}\p{N}\s.,!?'"()\-:;@#&*]/gu, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple spaces
    .replace(/ {2,}/g, ' ');
};

/**
 * Sanitize chat message
 */
export const sanitizeMessage = (message: string | undefined | null): string => {
  if (!message) return '';

  return sanitizeString(message, MAX_LENGTHS.message)
    // Allow letters, numbers, common punctuation, spaces, newlines, emojis
    .replace(/[^\p{L}\p{N}\p{Emoji}\s.,!?'"()\-:;@#&*\n]/gu, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n');
};

/**
 * Validate and sanitize URL (for photo URLs)
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    // Only allow https URLs
    if (parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize an array of strings
 */
export const sanitizeStringArray = (
  arr: string[] | undefined | null,
  maxItems: number = 20,
  maxItemLength: number = 100
): string[] => {
  if (!arr || !Array.isArray(arr)) return [];

  return arr
    .slice(0, maxItems)
    .map((item) => sanitizeString(item, maxItemLength))
    .filter((item) => item.length > 0);
};
