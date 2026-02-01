'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Download, Eye, Loader2, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEditorStore, useUIStore } from '@/lib/store';
import {
  useCreateDocument,
  useUpdateDocument,
  useAddDBHistoryEntry,
} from '@/lib/swr';
import { EditorToolbar } from './editor-toolbar';
import { ElementList } from './element-list';
import { PreviewPanel, type PreviewPanelRef } from './preview-panel';
import { DocumentSettings } from './document-settings';
import { JsonEditorDialog } from './json-editor-dialog';
import { SaveDocumentDialog } from './save-document-dialog';
import { captureThumbnail, uploadThumbnail } from '@/lib/utils/thumbnail';
import type { PDFElement } from '@/lib/pdf/schema';

export function PDFEditor() {
  const previewRef = useRef<PreviewPanelRef>(null);

  // Editor Store
  const entity = useEditorStore((s) => s.entity);
  const selectedElementId = useEditorStore((s) => s.selectedElementId);
  const isGenerating = useEditorStore((s) => s.isGenerating);
  const error = useEditorStore((s) => s.error);

  // Editor Store actions
  const selectElement = useEditorStore((s) => s.selectElement);
  const addElement = useEditorStore((s) => s.addElement);
  const updateElement = useEditorStore((s) => s.updateElement);
  const removeElement = useEditorStore((s) => s.removeElement);
  const duplicateElement = useEditorStore((s) => s.duplicateElement);
  const moveElementUp = useEditorStore((s) => s.moveElementUp);
  const moveElementDown = useEditorStore((s) => s.moveElementDown);
  const getElementById = useEditorStore((s) => s.getElementById);
  const getElementsWithIds = useEditorStore((s) => s.getElementsWithIds);
  const updateMetadata = useEditorStore((s) => s.updateMetadata);
  const updateTheme = useEditorStore((s) => s.updateTheme);
  const updatePageSettings = useEditorStore((s) => s.updatePageSettings);
  const loadInstructions = useEditorStore((s) => s.loadInstructions);
  const downloadPDF = useEditorStore((s) => s.downloadPDF);
  const previewPDF = useEditorStore((s) => s.previewPDF);
  const markAsSaved = useEditorStore((s) => s.markAsSaved);
  const createNewEntity = useEditorStore((s) => s.createNewEntity);

  // UI Store
  const isSaveDialogOpen = useUIStore((s) => s.isSaveDialogOpen);
  const openSaveDialog = useUIStore((s) => s.openSaveDialog);
  const closeSaveDialog = useUIStore((s) => s.closeSaveDialog);

  // SWR Mutations
  const { createDocument } = useCreateDocument();
  const { updateDocument } = useUpdateDocument();
  const { addEntry: addDBHistoryEntry } = useAddDBHistoryEntry();

  // Local state
  const [editingElement, setEditingElement] = useState<{
    id: string;
    element: PDFElement;
  } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isCapturingThumbnail, setIsCapturingThumbnail] = useState(false);

  // Get elements with IDs for the list
  const elements = getElementsWithIds();

  // Get instructions from entity
  const instructions = entity?.instructions;

  // Deselect when clicking outside the preview panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const previewElement = previewRef.current?.getPreviewElement();
      if (
        previewElement &&
        selectedElementId &&
        !previewElement.contains(event.target as Node)
      ) {
        selectElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedElementId, selectElement]);

  const handleEditElement = (id: string) => {
    const element = getElementById(id);
    if (element) {
      setEditingElement({ id, element });
    }
  };

  const handleSaveElement = (element: PDFElement) => {
    if (editingElement) {
      updateElement(editingElement.id, element);
      setEditingElement(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingElement(null);
  };

  const handleStartOver = () => {
    if (elements.length > 0) {
      setShowClearConfirm(true);
    }
  };

  const confirmStartOver = () => {
    // Create a brand new entity
    createNewEntity();
    setShowClearConfirm(false);
  };

  // Handle saving document with thumbnail
  const handleSaveDocument = useCallback(
    async (name: string) => {
      if (!entity || !instructions) return;

      setIsCapturingThumbnail(true);
      let thumbnailUrl: string | undefined;

      try {
        // Deselect any selected element before capturing thumbnail
        selectElement(null);

        // Small delay to ensure deselection is rendered
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Capture thumbnail from preview panel
        const previewElement = previewRef.current?.getPreviewElement();
        if (previewElement) {
          const base64Image = await captureThumbnail(previewElement, {
            width: 300,
            height: 400,
          });

          // Upload thumbnail to Vercel Blob
          thumbnailUrl = await uploadThumbnail(
            base64Image,
            `${name}-${Date.now()}.png`
          );
        }
      } catch (err) {
        console.error('Failed to capture/upload thumbnail:', err);
        // Continue without thumbnail rather than failing the save
      } finally {
        setIsCapturingThumbnail(false);
      }

      // Determine if updating or creating
      const isUpdate = entity.origin.type === 'db';
      const documentId = entity.origin.type === 'db' ? entity.origin.documentId : null;

      try {
        if (isUpdate && documentId) {
          await updateDocument({
            id: documentId,
            updates: {
              name,
              instructions,
              thumbnail: thumbnailUrl,
            },
          });
          markAsSaved(documentId);
        } else {
          const result = await createDocument({
            name,
            instructions,
            thumbnail: thumbnailUrl,
          });
          if (result?.document) {
            markAsSaved(result.document.id);
          }
        }

        closeSaveDialog();
        toast.success(isUpdate ? 'Document updated' : 'Document saved', {
          description: `"${name}" has been saved to your documents.`,
        });
      } catch (err) {
        console.error('Failed to save document:', err);
        toast.error('Failed to save document');
      }
    },
    [
      entity,
      instructions,
      selectElement,
      updateDocument,
      createDocument,
      markAsSaved,
      closeSaveDialog,
    ]
  );

  // Handle download with history logging
  const handleDownloadPDF = useCallback(async () => {
    if (!entity || !instructions) return;

    try {
      // Deselect any selected element before capturing thumbnail
      selectElement(null);

      // Small delay to ensure deselection is rendered
      await new Promise((resolve) => setTimeout(resolve, 50));

      await downloadPDF();

      // Capture thumbnail as base64 for history
      let thumbnailBase64: string | undefined;
      try {
        const previewElement = previewRef.current?.getPreviewElement();
        if (previewElement) {
          thumbnailBase64 = await captureThumbnail(previewElement, {
            width: 300,
            height: 400,
          });
        }
      } catch (thumbError) {
        console.error('Failed to capture thumbnail for history:', thumbError);
      }

      // Log to DB history
      await addDBHistoryEntry({
        type: 'downloaded',
        documentName: entity.name || instructions.metadata.title || undefined,
        instructions,
        thumbnail: thumbnailBase64,
      });
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  }, [entity, instructions, selectElement, downloadPDF, addDBHistoryEntry]);

  // Don't render if no entity
  if (!entity || !instructions) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    );
  }

  const isUpdate = entity.origin.type === 'db';

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between border-b p-4"
        onClick={() => selectElement(null)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <EditorToolbar onAddElement={addElement} />
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartOver}
            disabled={isGenerating || elements.length === 0}
          >
            <RotateCcw className="mr-2 size-4" />
            Start Over
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openSaveDialog}
            disabled={isGenerating || elements.length === 0 || isCapturingThumbnail}
          >
            {isCapturingThumbnail ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isUpdate ? 'Save' : 'Save As'}
          </Button>

          <div onClick={(e) => e.stopPropagation()}>
            <DocumentSettings
              metadata={instructions.metadata}
              theme={instructions.theme}
              pageSettings={instructions.pageSettings}
              onUpdateMetadata={updateMetadata}
              onUpdateTheme={updateTheme}
              onUpdatePageSettings={updatePageSettings}
            />
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <JsonEditorDialog
              instructions={instructions}
              onApply={loadInstructions}
              disabled={isGenerating}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={previewPDF}
            disabled={isGenerating || elements.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Eye className="mr-2 size-4" />
            )}
            Preview
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={isGenerating || elements.length === 0}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex flex-1 overflow-hidden"
        onClick={() => selectElement(null)}
      >
        {/* Element List */}
        <div
          className="w-[400px] shrink-0 overflow-auto border-r"
          onClick={(e) => e.stopPropagation()}
        >
          <ElementList
            elements={elements}
            selectedId={selectedElementId}
            onSelect={selectElement}
            onEdit={handleEditElement}
            onDelete={removeElement}
            onDuplicate={duplicateElement}
            onMoveUp={moveElementUp}
            onMoveDown={moveElementDown}
            editingElement={editingElement}
            onSaveElement={handleSaveElement}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <PreviewPanel
            ref={previewRef}
            instructions={instructions}
            elements={elements}
            selectedElementId={selectedElementId}
            onSelectElement={selectElement}
            onEditElement={handleEditElement}
          />
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 right-4 rounded-md bg-destructive p-4 text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Start Over Confirmation Dialog */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start over?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all elements and reset the document settings. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStartOver}>
              Start Over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Document Dialog */}
      <SaveDocumentDialog
        open={isSaveDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeSaveDialog();
        }}
        instructions={instructions}
        onSave={handleSaveDocument}
        initialName={entity.name}
        isUpdate={isUpdate}
      />
    </div>
  );
}
