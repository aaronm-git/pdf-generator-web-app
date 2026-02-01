import { create } from 'zustand';

interface UnsavedChangesModalState {
  isOpen: boolean;
  pendingAction: (() => void) | null;
  entityName: string | null;
}

interface UIState {
  /** Unsaved changes warning modal */
  unsavedChangesModal: UnsavedChangesModalState;
  /** Save document dialog */
  isSaveDialogOpen: boolean;
  /** JSON editor dialog */
  isJsonEditorOpen: boolean;
  /** AI prompt modal */
  isAIPromptOpen: boolean;
}

interface UIActions {
  // === Unsaved Changes Modal ===
  /** Show the unsaved changes modal with a pending action */
  showUnsavedChangesModal: (entityName: string, onContinue: () => void) => void;
  /** Close the unsaved changes modal without performing the action */
  closeUnsavedChangesModal: () => void;
  /** Confirm discarding changes and perform the pending action */
  confirmDiscardChanges: () => void;

  // === Save Dialog ===
  openSaveDialog: () => void;
  closeSaveDialog: () => void;

  // === JSON Editor ===
  openJsonEditor: () => void;
  closeJsonEditor: () => void;

  // === AI Prompt ===
  openAIPrompt: () => void;
  closeAIPrompt: () => void;

  // === Reset ===
  reset: () => void;
}

type UIStore = UIState & UIActions;

const createInitialState = (): UIState => ({
  unsavedChangesModal: {
    isOpen: false,
    pendingAction: null,
    entityName: null,
  },
  isSaveDialogOpen: false,
  isJsonEditorOpen: false,
  isAIPromptOpen: false,
});

export const useUIStore = create<UIStore>((set, get) => ({
  ...createInitialState(),

  // === Unsaved Changes Modal ===

  showUnsavedChangesModal: (entityName, onContinue) => {
    set({
      unsavedChangesModal: {
        isOpen: true,
        pendingAction: onContinue,
        entityName,
      },
    });
  },

  closeUnsavedChangesModal: () => {
    set({
      unsavedChangesModal: {
        isOpen: false,
        pendingAction: null,
        entityName: null,
      },
    });
  },

  confirmDiscardChanges: () => {
    const { unsavedChangesModal } = get();
    if (unsavedChangesModal.pendingAction) {
      unsavedChangesModal.pendingAction();
    }
    set({
      unsavedChangesModal: {
        isOpen: false,
        pendingAction: null,
        entityName: null,
      },
    });
  },

  // === Save Dialog ===

  openSaveDialog: () => set({ isSaveDialogOpen: true }),
  closeSaveDialog: () => set({ isSaveDialogOpen: false }),

  // === JSON Editor ===

  openJsonEditor: () => set({ isJsonEditorOpen: true }),
  closeJsonEditor: () => set({ isJsonEditorOpen: false }),

  // === AI Prompt ===

  openAIPrompt: () => set({ isAIPromptOpen: true }),
  closeAIPrompt: () => set({ isAIPromptOpen: false }),

  // === Reset ===

  reset: () => set(createInitialState()),
}));

// Selectors
export const selectUnsavedChangesModal = (state: UIStore) =>
  state.unsavedChangesModal;
export const selectIsSaveDialogOpen = (state: UIStore) => state.isSaveDialogOpen;
export const selectIsJsonEditorOpen = (state: UIStore) => state.isJsonEditorOpen;
export const selectIsAIPromptOpen = (state: UIStore) => state.isAIPromptOpen;
