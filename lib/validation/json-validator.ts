import { z } from 'zod';

export interface JsonValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  error?: string;
  details?: z.ZodError;
}

/**
 * Validates a JSON string against a Zod schema
 * Provides real-time validation with detailed error messages
 */
export function validateJsonString<T>(
  jsonString: string,
  schema: z.ZodType<T>
): JsonValidationResult<T> {
  // First, check if it's valid JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Invalid JSON syntax';
    return {
      isValid: false,
      error: `JSON Parse Error: ${error}`,
    };
  }

  // Then validate against the schema
  const result = schema.safeParse(parsed);

  if (result.success) {
    return {
      isValid: true,
      data: result.data,
    };
  }

  // Format the Zod error into a readable message
  const errorMessages = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `at "${issue.path.join('.')}"` : '';
    return `${path}: ${issue.message}`.trim();
  });

  return {
    isValid: false,
    error: errorMessages[0], // Show first error for simplicity
    details: result.error,
  };
}

/**
 * Safely stringify an object to JSON with formatting
 */
export function safeStringify(obj: unknown, pretty = true): string {
  try {
    return JSON.stringify(obj, null, pretty ? 2 : 0);
  } catch {
    return '';
  }
}

/**
 * Debounce helper for validation on keystrokes
 */
export function createDebouncedValidator<T>(
  schema: z.ZodType<T>,
  delay = 300
): {
  validate: (jsonString: string, callback: (result: JsonValidationResult<T>) => void) => void;
  cancel: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return {
    validate: (jsonString: string, callback: (result: JsonValidationResult<T>) => void) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        const result = validateJsonString(jsonString, schema);
        callback(result);
      }, delay);
    },
    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
