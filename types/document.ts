import type { PDFInstructions } from '@/lib/pdf/schema';

/**
 * Represents a saved document/project in the database.
 */
export interface SavedDocument {
  id: string;
  userId: string;
  name: string;
  instructions: PDFInstructions;
  thumbnail?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Type of history entry - how the PDF was created/used.
 */
export type HistoryEntryType = 'ai-generated' | 'manual' | 'downloaded';

/**
 * Represents a history entry in the activity log.
 */
export interface HistoryEntry {
  id: string;
  userId: string;
  type: HistoryEntryType;
  prompt?: string;
  documentName?: string;
  instructions: PDFInstructions;
  thumbnail?: string;
  createdAt: string;
}

/**
 * Input for creating a new document (without auto-generated fields).
 */
export interface CreateDocumentInput {
  name: string;
  instructions: PDFInstructions;
  thumbnail?: string;
  favorite?: boolean;
}

/**
 * Input for updating an existing document.
 */
export interface UpdateDocumentInput {
  name?: string;
  instructions?: PDFInstructions;
  thumbnail?: string;
  favorite?: boolean;
}

/**
 * Input for creating a new history entry (without auto-generated fields).
 */
export interface CreateHistoryInput {
  type: HistoryEntryType;
  prompt?: string;
  documentName?: string;
  instructions: PDFInstructions;
  thumbnail?: string;
}

/**
 * Database row shape for documents (snake_case from Postgres).
 */
export interface DocumentRow {
  id: string;
  user_id: string;
  name: string;
  instructions: PDFInstructions;
  thumbnail: string | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Database row shape for history entries (snake_case from Postgres).
 */
export interface HistoryRow {
  id: string;
  user_id: string;
  type: string;
  prompt: string | null;
  document_name: string | null;
  instructions: PDFInstructions;
  thumbnail: string | null;
  created_at: string;
}

/**
 * Convert a database document row to the frontend SavedDocument type.
 */
export function documentRowToSavedDocument(row: DocumentRow): SavedDocument {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    instructions: row.instructions,
    thumbnail: row.thumbnail ?? undefined,
    favorite: row.favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert a database history row to the frontend HistoryEntry type.
 */
export function historyRowToHistoryEntry(row: HistoryRow): HistoryEntry {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as HistoryEntryType,
    prompt: row.prompt ?? undefined,
    documentName: row.document_name ?? undefined,
    instructions: row.instructions,
    thumbnail: row.thumbnail ?? undefined,
    createdAt: row.created_at,
  };
}
