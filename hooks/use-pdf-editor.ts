'use client';

import { useState, useCallback, useMemo } from 'react';
import type { PDFElement, PDFInstructions, PDFMetadata, PDFTheme, PDFPageSettings } from '@/types/pdf';
import {
  createDefaultInstructions,
  createDefaultElement,
  generateId,
  type ElementType,
  type ElementWithId,
} from '@/lib/editor/element-defaults';

interface EditorState {
  instructions: PDFInstructions;
  selectedElementId: string | null;
  isDirty: boolean;
  isGenerating: boolean;
  error: string | null;
}

// Internal type with IDs for tracking
type InternalElement = PDFElement & { _id: string };

export function usePDFEditor(initialInstructions?: PDFInstructions) {
  const [state, setState] = useState<EditorState>(() => ({
    instructions: initialInstructions || createDefaultInstructions(),
    selectedElementId: null,
    isDirty: false,
    isGenerating: false,
    error: null,
  }));

  // Track element IDs internally
  const [elementIds, setElementIds] = useState<Map<number, string>>(() => new Map());

  // Get element ID by index, creating one if needed
  const getElementId = useCallback((index: number): string => {
    if (elementIds.has(index)) {
      return elementIds.get(index)!;
    }
    const id = generateId();
    setElementIds((prev) => new Map(prev).set(index, id));
    return id;
  }, [elementIds]);

  // Elements with IDs for UI
  const elementsWithIds = useMemo((): ElementWithId[] => {
    return state.instructions.content.map((element, index) => ({
      ...element,
      id: getElementId(index),
    }));
  }, [state.instructions.content, getElementId]);

  // Add element
  const addElement = useCallback((type: ElementType, atIndex?: number) => {
    const newElement = createDefaultElement(type);
    const newId = generateId();

    setState((prev) => {
      const newContent = [...prev.instructions.content];
      const insertIndex = atIndex ?? newContent.length;
      newContent.splice(insertIndex, 0, newElement);

      return {
        ...prev,
        instructions: {
          ...prev.instructions,
          content: newContent,
        },
        isDirty: true,
      };
    });

    // Update element IDs
    setElementIds((prev) => {
      const newMap = new Map<number, string>();
      const insertIndex = atIndex ?? state.instructions.content.length;

      prev.forEach((id, idx) => {
        if (idx >= insertIndex) {
          newMap.set(idx + 1, id);
        } else {
          newMap.set(idx, id);
        }
      });
      newMap.set(insertIndex, newId);

      return newMap;
    });

    return newId;
  }, [state.instructions.content.length]);

  // Update element
  const updateElement = useCallback((id: string, updatedElement: PDFElement) => {
    setState((prev) => {
      const index = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
      if (index === undefined) return prev;

      const newContent = [...prev.instructions.content];
      newContent[index] = updatedElement;

      return {
        ...prev,
        instructions: {
          ...prev.instructions,
          content: newContent,
        },
        isDirty: true,
      };
    });
  }, [elementIds]);

  // Remove element
  const removeElement = useCallback((id: string) => {
    const indexToRemove = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
    if (indexToRemove === undefined) return;

    setState((prev) => {
      const newContent = prev.instructions.content.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        instructions: {
          ...prev.instructions,
          content: newContent,
        },
        selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
        isDirty: true,
      };
    });

    // Update element IDs
    setElementIds((prev) => {
      const newMap = new Map<number, string>();
      prev.forEach((eid, idx) => {
        if (idx < indexToRemove) {
          newMap.set(idx, eid);
        } else if (idx > indexToRemove) {
          newMap.set(idx - 1, eid);
        }
      });
      return newMap;
    });
  }, [elementIds]);

  // Duplicate element
  const duplicateElement = useCallback((id: string) => {
    const index = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
    if (index === undefined) return;

    const element = state.instructions.content[index];
    const duplicatedElement = JSON.parse(JSON.stringify(element));
    const newId = generateId();

    setState((prev) => {
      const newContent = [...prev.instructions.content];
      newContent.splice(index + 1, 0, duplicatedElement);
      return {
        ...prev,
        instructions: {
          ...prev.instructions,
          content: newContent,
        },
        isDirty: true,
      };
    });

    // Update element IDs
    setElementIds((prev) => {
      const newMap = new Map<number, string>();
      prev.forEach((eid, idx) => {
        if (idx <= index) {
          newMap.set(idx, eid);
        } else {
          newMap.set(idx + 1, eid);
        }
      });
      newMap.set(index + 1, newId);
      return newMap;
    });

    return newId;
  }, [elementIds, state.instructions.content]);

  // Move element
  const moveElement = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    setState((prev) => {
      const newContent = [...prev.instructions.content];
      const [removed] = newContent.splice(fromIndex, 1);
      newContent.splice(toIndex, 0, removed);

      return {
        ...prev,
        instructions: {
          ...prev.instructions,
          content: newContent,
        },
        isDirty: true,
      };
    });

    // Update element IDs
    setElementIds((prev) => {
      const fromId = prev.get(fromIndex);
      if (!fromId) return prev;

      const newMap = new Map<number, string>();
      const entries = Array.from(prev.entries()).sort((a, b) => a[0] - b[0]);

      // Remove the moving item
      const filtered = entries.filter(([idx]) => idx !== fromIndex);

      // Reindex
      filtered.forEach(([idx, id], i) => {
        const newIdx = idx < fromIndex ? idx : idx - 1;
        newMap.set(newIdx >= toIndex ? newIdx + 1 : newIdx, id);
      });

      newMap.set(toIndex, fromId);
      return newMap;
    });
  }, []);

  // Move up/down helpers
  const moveElementUp = useCallback((id: string) => {
    const index = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
    if (index === undefined || index === 0) return;
    moveElement(index, index - 1);
  }, [elementIds, moveElement]);

  const moveElementDown = useCallback((id: string) => {
    const index = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
    if (index === undefined || index >= state.instructions.content.length - 1) return;
    moveElement(index, index + 1);
  }, [elementIds, moveElement, state.instructions.content.length]);

  // Select element
  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedElementId: id }));
  }, []);

  // Update metadata
  const updateMetadata = useCallback((metadata: Partial<PDFMetadata>) => {
    setState((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        metadata: { ...prev.instructions.metadata, ...metadata },
      },
      isDirty: true,
    }));
  }, []);

  // Update theme
  const updateTheme = useCallback((theme: Partial<PDFTheme>) => {
    setState((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        theme: { ...prev.instructions.theme, ...theme },
      },
      isDirty: true,
    }));
  }, []);

  // Update page settings
  const updatePageSettings = useCallback((pageSettings: Partial<PDFPageSettings>) => {
    setState((prev) => ({
      ...prev,
      instructions: {
        ...prev.instructions,
        pageSettings: { ...prev.instructions.pageSettings, ...pageSettings },
      },
      isDirty: true,
    }));
  }, []);

  // Generate PDF
  const generatePDF = useCallback(async (): Promise<string> => {
    setState((prev) => ({ ...prev, isGenerating: true, error: null }));

    try {
      const response = await fetch('/api/pdf/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructions: state.instructions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const { pdf } = await response.json();
      setState((prev) => ({ ...prev, isGenerating: false }));
      return pdf;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, isGenerating: false, error: errorMessage }));
      throw error;
    }
  }, [state.instructions]);

  // Download PDF
  const downloadPDF = useCallback(async () => {
    const pdf = await generatePDF();
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdf}`;
    link.download = `${state.instructions.metadata.title || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatePDF, state.instructions.metadata.title]);

  // Preview PDF (open in new tab)
  const previewPDF = useCallback(async () => {
    const pdf = await generatePDF();
    const blob = new Blob(
      [Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0))],
      { type: 'application/pdf' }
    );
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [generatePDF]);

  // Reset
  const reset = useCallback(() => {
    setState({
      instructions: createDefaultInstructions(),
      selectedElementId: null,
      isDirty: false,
      isGenerating: false,
      error: null,
    });
    setElementIds(new Map());
  }, []);

  // Load instructions
  const loadInstructions = useCallback((instructions: PDFInstructions) => {
    setState({
      instructions,
      selectedElementId: null,
      isDirty: false,
      isGenerating: false,
      error: null,
    });
    // Reset element IDs
    setElementIds(new Map());
  }, []);

  // Get element by ID
  const getElementById = useCallback((id: string): PDFElement | undefined => {
    const index = Array.from(elementIds.entries()).find(([_, eid]) => eid === id)?.[0];
    if (index === undefined) return undefined;
    return state.instructions.content[index];
  }, [elementIds, state.instructions.content]);

  return {
    // State
    instructions: state.instructions,
    elements: elementsWithIds,
    selectedElementId: state.selectedElementId,
    isDirty: state.isDirty,
    isGenerating: state.isGenerating,
    error: state.error,

    // Element operations
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    moveElement,
    moveElementUp,
    moveElementDown,
    selectElement,
    getElementById,

    // Document settings
    updateMetadata,
    updateTheme,
    updatePageSettings,

    // PDF operations
    generatePDF,
    downloadPDF,
    previewPDF,

    // State management
    reset,
    loadInstructions,
  };
}
