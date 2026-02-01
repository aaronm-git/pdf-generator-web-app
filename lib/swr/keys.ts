/**
 * SWR cache key constants for API endpoints.
 * Using constants ensures cache consistency across the app.
 */
export const SWR_KEYS = {
  /** All documents list */
  DOCUMENTS: '/api/documents',
  /** Single document by ID */
  DOCUMENT: (id: string) => `/api/documents/${id}`,
  /** DB history entries */
  DB_HISTORY: '/api/history',
} as const;
