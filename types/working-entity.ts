import type { PDFInstructions } from '@/lib/pdf/schema';

/**
 * Origin types - where did this entity come from?
 */
export type EntityOrigin =
  | { type: 'new' }
  | { type: 'db'; documentId: string }
  | { type: 'history'; historyId: string };

/**
 * The main working entity type - represents a PDF document being edited.
 * This is the single source of truth for the editor state.
 */
export interface WorkingEntity {
  /** Local working ID (generated on creation) */
  id: string;
  /** Document name */
  name: string;
  /** The PDF content/structure */
  instructions: PDFInstructions;
  /** Where this entity originated from */
  origin: EntityOrigin;
  /** Increments on every change (for dirty tracking) */
  version: number;
  /** Version at last DB save (0 = never saved) */
  savedVersion: number;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
}

/**
 * Check if an entity has unsaved changes (is dirty).
 */
export function isDirty(entity: WorkingEntity | null): boolean {
  if (!entity) return false;
  return entity.version !== entity.savedVersion;
}

/**
 * Check if an entity has ever been saved to the database.
 */
export function hasBeenSaved(entity: WorkingEntity | null): boolean {
  if (!entity) return false;
  return entity.origin.type === 'db';
}

/**
 * Check if an entity has unsaved work (dirty or new with changes).
 */
export function hasUnsavedWork(entity: WorkingEntity | null): boolean {
  if (!entity) return false;
  const dirty = entity.version !== entity.savedVersion;
  const isNewWithWork = entity.origin.type === 'new' && entity.version > 1;
  return dirty || isNewWithWork;
}
