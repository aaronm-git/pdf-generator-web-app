import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PDFElement,
  PDFInstructions,
  PDFMetadata,
  PDFTheme,
  PDFPageSettings,
} from '@/lib/pdf/schema';
import type { WorkingEntity, EntityOrigin } from '@/types/working-entity';
import {
  createDefaultInstructions,
  createDefaultElement,
  generateId,
  type ElementType,
  type ElementWithId,
} from '@/lib/editor/element-defaults';

interface EditorState {
  /** The active working entity */
  entity: WorkingEntity | null;
  /** Currently selected element ID */
  selectedElementId: string | null;
  /** Whether PDF is being generated */
  isGenerating: boolean;
  /** Error message if any */
  error: string | null;
  /** Element ID tracking (maps index to stable ID) */
  elementIdMap: Record<number, string>;
}

interface EditorActions {
  // === Entity Lifecycle ===
  /** Create a new blank entity */
  createNewEntity: (name?: string) => string;
  /** Load an entity from the database */
  loadFromDB: (documentId: string, name: string, instructions: PDFInstructions) => void;
  /** Load an entity from DB history */
  loadFromHistory: (historyId: string, instructions: PDFInstructions, name?: string) => void;
  /** Clear the active entity */
  clearEntity: () => void;
  /** Mark entity as saved (after DB save) */
  markAsSaved: (documentId: string) => void;
  /** Update entity name */
  updateName: (name: string) => void;

  // === Element Operations ===
  /** Add a new element */
  addElement: (type: ElementType, atIndex?: number) => string;
  /** Update an existing element */
  updateElement: (id: string, element: PDFElement) => void;
  /** Remove an element */
  removeElement: (id: string) => void;
  /** Duplicate an element */
  duplicateElement: (id: string) => string | undefined;
  /** Move an element from one index to another */
  moveElement: (fromIndex: number, toIndex: number) => void;
  /** Move an element up */
  moveElementUp: (id: string) => void;
  /** Move an element down */
  moveElementDown: (id: string) => void;
  /** Select an element */
  selectElement: (id: string | null) => void;
  /** Get element by ID */
  getElementById: (id: string) => PDFElement | undefined;
  /** Get all elements with IDs */
  getElementsWithIds: () => ElementWithId[];

  // === Document Settings ===
  /** Update metadata */
  updateMetadata: (metadata: Partial<PDFMetadata>) => void;
  /** Update theme */
  updateTheme: (theme: Partial<PDFTheme>) => void;
  /** Update page settings */
  updatePageSettings: (pageSettings: Partial<PDFPageSettings>) => void;
  /** Load full instructions (replaces content) */
  loadInstructions: (instructions: PDFInstructions) => void;

  // === PDF Operations ===
  /** Set generating state */
  setGenerating: (isGenerating: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
  /** Generate PDF and return base64 */
  generatePDF: () => Promise<string>;
  /** Download PDF */
  downloadPDF: () => Promise<void>;
  /** Preview PDF in new tab */
  previewPDF: () => Promise<void>;

  // === Derived State ===
  /** Check if entity has unsaved changes */
  isDirty: () => boolean;
  /** Check if entity has been saved to DB */
  hasBeenSaved: () => boolean;
  /** Check if entity has unsaved work */
  hasUnsavedWork: () => boolean;

  // === Reset ===
  /** Full reset */
  reset: () => void;
}

type EditorStore = EditorState & EditorActions;

const createInitialState = (): EditorState => ({
  entity: null,
  selectedElementId: null,
  isGenerating: false,
  error: null,
  elementIdMap: {},
});

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      // === Entity Lifecycle ===

      createNewEntity: (name = 'Untitled Document') => {
        const id = generateId();
        const now = new Date().toISOString();
        const entity: WorkingEntity = {
          id,
          name,
          instructions: createDefaultInstructions(),
          origin: { type: 'new' },
          version: 1,
          savedVersion: 0,
          createdAt: now,
          updatedAt: now,
        };

        set({
          entity,
          selectedElementId: null,
          error: null,
          elementIdMap: {},
        });

        return id;
      },

      loadFromDB: (documentId, name, instructions) => {
        const id = generateId();
        const now = new Date().toISOString();
        const entity: WorkingEntity = {
          id,
          name,
          instructions,
          origin: { type: 'db', documentId },
          version: 1,
          savedVersion: 1, // Already saved
          createdAt: now,
          updatedAt: now,
        };

        set({
          entity,
          selectedElementId: null,
          error: null,
          elementIdMap: {},
        });
      },

      loadFromHistory: (historyId, instructions, name) => {
        const id = generateId();
        const now = new Date().toISOString();
        const entity: WorkingEntity = {
          id,
          name: name || instructions.metadata.title || 'Untitled',
          instructions,
          origin: { type: 'history', historyId },
          version: 1,
          savedVersion: 0, // Not saved to DB
          createdAt: now,
          updatedAt: now,
        };

        set({
          entity,
          selectedElementId: null,
          error: null,
          elementIdMap: {},
        });
      },

      clearEntity: () => {
        set({
          entity: null,
          selectedElementId: null,
          elementIdMap: {},
        });
      },

      markAsSaved: (documentId) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            origin: { type: 'db', documentId },
            savedVersion: entity.version,
          },
        });
      },

      updateName: (name) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            name,
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      // === Element Operations ===

      addElement: (type, atIndex) => {
        const { entity, elementIdMap } = get();
        if (!entity) return '';

        const newElement = createDefaultElement(type);
        const newId = generateId();
        const insertIndex = atIndex ?? entity.instructions.content.length;

        const newContent = [...entity.instructions.content];
        newContent.splice(insertIndex, 0, newElement);

        // Update element ID map
        const newMap: Record<number, string> = {};
        Object.entries(elementIdMap).forEach(([idx, id]) => {
          const numIdx = parseInt(idx, 10);
          if (numIdx >= insertIndex) {
            newMap[numIdx + 1] = id;
          } else {
            newMap[numIdx] = id;
          }
        });
        newMap[insertIndex] = newId;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              content: newContent,
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
          elementIdMap: newMap,
        });

        return newId;
      },

      updateElement: (id, updatedElement) => {
        const { entity, elementIdMap } = get();
        if (!entity) return;

        const index = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        )?.[0];
        if (index === undefined) return;

        const numIndex = parseInt(index, 10);
        const newContent = [...entity.instructions.content];
        newContent[numIndex] = updatedElement;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              content: newContent,
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      removeElement: (id) => {
        const { entity, elementIdMap, selectedElementId } = get();
        if (!entity) return;

        const indexEntry = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        );
        if (!indexEntry) return;

        const indexToRemove = parseInt(indexEntry[0], 10);
        const newContent = entity.instructions.content.filter(
          (_, idx) => idx !== indexToRemove
        );

        // Update element ID map
        const newMap: Record<number, string> = {};
        Object.entries(elementIdMap).forEach(([idx, eid]) => {
          const numIdx = parseInt(idx, 10);
          if (numIdx < indexToRemove) {
            newMap[numIdx] = eid;
          } else if (numIdx > indexToRemove) {
            newMap[numIdx - 1] = eid;
          }
        });

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              content: newContent,
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
          selectedElementId: selectedElementId === id ? null : selectedElementId,
          elementIdMap: newMap,
        });
      },

      duplicateElement: (id) => {
        const { entity, elementIdMap } = get();
        if (!entity) return undefined;

        const indexEntry = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        );
        if (!indexEntry) return undefined;

        const index = parseInt(indexEntry[0], 10);
        const element = entity.instructions.content[index];
        const duplicatedElement = JSON.parse(JSON.stringify(element));
        const newId = generateId();

        const newContent = [...entity.instructions.content];
        newContent.splice(index + 1, 0, duplicatedElement);

        // Update element ID map
        const newMap: Record<number, string> = {};
        Object.entries(elementIdMap).forEach(([idx, eid]) => {
          const numIdx = parseInt(idx, 10);
          if (numIdx <= index) {
            newMap[numIdx] = eid;
          } else {
            newMap[numIdx + 1] = eid;
          }
        });
        newMap[index + 1] = newId;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              content: newContent,
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
          elementIdMap: newMap,
        });

        return newId;
      },

      moveElement: (fromIndex, toIndex) => {
        const { entity, elementIdMap } = get();
        if (!entity || fromIndex === toIndex) return;

        const newContent = [...entity.instructions.content];
        const [removed] = newContent.splice(fromIndex, 1);
        newContent.splice(toIndex, 0, removed);

        // Update element ID map
        const fromId = elementIdMap[fromIndex];
        if (!fromId) return;

        const newMap: Record<number, string> = {};
        const entries = Object.entries(elementIdMap)
          .map(([idx, id]) => [parseInt(idx, 10), id] as [number, string])
          .sort((a, b) => a[0] - b[0]);

        // Remove the moving item
        const filtered = entries.filter(([idx]) => idx !== fromIndex);

        // Reindex
        filtered.forEach(([idx, id]) => {
          const newIdx = idx < fromIndex ? idx : idx - 1;
          newMap[newIdx >= toIndex ? newIdx + 1 : newIdx] = id;
        });

        newMap[toIndex] = fromId;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              content: newContent,
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
          elementIdMap: newMap,
        });
      },

      moveElementUp: (id) => {
        const { elementIdMap, moveElement } = get();
        const indexEntry = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        );
        if (!indexEntry) return;

        const index = parseInt(indexEntry[0], 10);
        if (index === 0) return;
        moveElement(index, index - 1);
      },

      moveElementDown: (id) => {
        const { entity, elementIdMap, moveElement } = get();
        if (!entity) return;

        const indexEntry = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        );
        if (!indexEntry) return;

        const index = parseInt(indexEntry[0], 10);
        if (index >= entity.instructions.content.length - 1) return;
        moveElement(index, index + 1);
      },

      selectElement: (id) => {
        set({ selectedElementId: id });
      },

      getElementById: (id) => {
        const { entity, elementIdMap } = get();
        if (!entity) return undefined;

        const indexEntry = Object.entries(elementIdMap).find(
          ([_, eid]) => eid === id
        );
        if (!indexEntry) return undefined;

        const index = parseInt(indexEntry[0], 10);
        return entity.instructions.content[index];
      },

      getElementsWithIds: () => {
        const { entity, elementIdMap } = get();
        if (!entity) return [];

        return entity.instructions.content.map((element, index) => {
          // Get existing ID or generate one
          let id = elementIdMap[index];
          if (!id) {
            id = generateId();
            // We don't update state here to avoid infinite loops
            // The ID will be assigned on next interaction
          }
          return { ...element, id };
        });
      },

      // === Document Settings ===

      updateMetadata: (metadata) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              metadata: { ...entity.instructions.metadata, ...metadata },
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updateTheme: (theme) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              theme: { ...entity.instructions.theme, ...theme },
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      updatePageSettings: (pageSettings) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            instructions: {
              ...entity.instructions,
              pageSettings: { ...entity.instructions.pageSettings, ...pageSettings },
            },
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
        });
      },

      loadInstructions: (instructions) => {
        const { entity } = get();
        if (!entity) return;

        set({
          entity: {
            ...entity,
            instructions,
            name: instructions.metadata.title || entity.name,
            version: entity.version + 1,
            updatedAt: new Date().toISOString(),
          },
          selectedElementId: null,
          elementIdMap: {},
        });
      },

      // === PDF Operations ===

      setGenerating: (isGenerating) => {
        set({ isGenerating });
      },

      setError: (error) => {
        set({ error });
      },

      generatePDF: async () => {
        const { entity, setGenerating, setError } = get();
        if (!entity) throw new Error('No entity to generate PDF from');

        setGenerating(true);
        setError(null);

        try {
          const response = await fetch('/api/pdf/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instructions: entity.instructions }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate PDF');
          }

          const { pdf } = await response.json();
          setGenerating(false);
          return pdf;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          setError(errorMessage);
          setGenerating(false);
          throw error;
        }
      },

      downloadPDF: async () => {
        const { entity, generatePDF } = get();
        if (!entity) return;

        const pdf = await generatePDF();
        const blob = new Blob(
          [Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0))],
          { type: 'application/pdf' }
        );
        const suggestedName = `${entity.instructions.metadata.title || 'document'}.pdf`;

        if (
          typeof window !== 'undefined' &&
          'showSaveFilePicker' in window
        ) {
          try {
            const handle = await (
              window as Window & {
                showSaveFilePicker: (opts: {
                  suggestedName: string;
                  types: { description: string; accept: Record<string, string[]> }[];
                }) => Promise<FileSystemFileHandle>;
              }
            ).showSaveFilePicker({
              suggestedName,
              types: [
                { description: 'PDF document', accept: { 'application/pdf': ['.pdf'] } },
              ],
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
          } catch (err) {
            // User cancelled the save dialog; do nothing
            if (err instanceof Error && err.name === 'AbortError') return;
            // Fall through to link download on other errors
          }
        }

        // Fallback: trigger download via link (no Save As dialog)
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      },

      previewPDF: async () => {
        const { generatePDF } = get();
        const pdf = await generatePDF();
        const blob = new Blob(
          [Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0))],
          { type: 'application/pdf' }
        );
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },

      // === Derived State ===

      isDirty: () => {
        const { entity } = get();
        if (!entity) return false;
        return entity.version !== entity.savedVersion;
      },

      hasBeenSaved: () => {
        const { entity } = get();
        if (!entity) return false;
        return entity.origin.type === 'db';
      },

      hasUnsavedWork: () => {
        const { entity } = get();
        if (!entity) return false;
        const dirty = entity.version !== entity.savedVersion;
        const isNewWithWork = entity.origin.type === 'new' && entity.version > 1;
        return dirty || isNewWithWork;
      },

      // === Reset ===

      reset: () => {
        set(createInitialState());
      },
    }),
    {
      name: 'pdf-editor-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the entity and element map, not UI state
        entity: state.entity,
        elementIdMap: state.elementIdMap,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectEntity = (state: EditorStore) => state.entity;
export const selectInstructions = (state: EditorStore) =>
  state.entity?.instructions;
export const selectIsDirty = (state: EditorStore) => state.isDirty();
export const selectSelectedElementId = (state: EditorStore) =>
  state.selectedElementId;
export const selectIsGenerating = (state: EditorStore) => state.isGenerating;
export const selectError = (state: EditorStore) => state.error;
