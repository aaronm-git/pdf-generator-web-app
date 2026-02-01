/**
 * Generate a unique ID for documents and history entries.
 * Uses a combination of timestamp and random characters for uniqueness.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
}

/**
 * Generate a shorter ID for UI elements.
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 11);
}
