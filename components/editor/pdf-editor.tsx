'use client';

import { useState, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
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
import { usePDFEditor } from '@/hooks/use-pdf-editor';
import { EditorToolbar } from './editor-toolbar';
import { ElementList } from './element-list';
import { PreviewPanel, type PreviewPanelRef } from './preview-panel';
import { DocumentSettings } from './document-settings';
import { JsonEditorDialog } from './json-editor-dialog';
import { SaveDocumentDialog } from './save-document-dialog';
import { captureThumbnail, uploadThumbnail } from '@/lib/utils/thumbnail';
import type { PDFElement, PDFInstructions } from '@/types/pdf';
import type { SavedDocument } from '@/types/document';

export interface PDFEditorRef {
  loadInstructions: (instructions: PDFInstructions) => void;
  setDocument: (document: SavedDocument) => void;
  reset: () => void;
}

interface PDFEditorProps {
  initialDocumentId?: string;
}

export const PDFEditor = forwardRef<PDFEditorRef, PDFEditorProps>(
  function PDFEditor({ initialDocumentId }, ref) {
    const editor = usePDFEditor();
    const previewRef = useRef<PreviewPanelRef>(null);
    const [editingElement, setEditingElement] = useState<{
      id: string;
      element: PDFElement;
    } | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
      initialDocumentId || null
    );
    const [currentDocument, setCurrentDocument] = useState<SavedDocument | null>(null);
    const [isCapturingThumbnail, setIsCapturingThumbnail] = useState(false);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        loadInstructions: editor.loadInstructions,
        setDocument: (document: SavedDocument) => {
          setCurrentDocument(document);
          setCurrentDocumentId(document.id);
        },
        reset: editor.reset,
      }),
      [editor.loadInstructions, editor.reset]
    );

  const handleEditElement = (id: string) => {
    const element = editor.getElementById(id);
    if (element) {
      setEditingElement({ id, element });
    }
  };

  const handleSaveElement = (element: PDFElement) => {
    if (editingElement) {
      editor.updateElement(editingElement.id, element);
      setEditingElement(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingElement(null);
  };

  const handleStartOver = () => {
    if (editor.elements.length > 0) {
      setShowClearConfirm(true);
    }
  };

  const confirmStartOver = () => {
    editor.reset();
    setCurrentDocument(null);
    setCurrentDocumentId(null);
    setShowClearConfirm(false);
  };

  // Handle saving document with thumbnail
  const handleSaveDocument = useCallback(
    async (name: string, instructions: PDFInstructions) => {
      setIsCapturingThumbnail(true);
      let thumbnailUrl: string | undefined;

      try {
        // Capture thumbnail from preview panel
        const previewElement = previewRef.current?.getPreviewElement();
        if (previewElement) {
          const base64Image = await captureThumbnail(previewElement, {
            width: 300,
            height: 400,
          });

          // Upload thumbnail to Vercel Blob
          thumbnailUrl = await uploadThumbnail(base64Image, `${name}-${Date.now()}.png`);
        } else {
          console.warn('Preview element not available for thumbnail capture');
        }
      } catch (error) {
        console.error('Failed to capture/upload thumbnail:', error);
        // Continue without thumbnail rather than failing the save
      } finally {
        setIsCapturingThumbnail(false);
      }

      // Determine if updating or creating
      const isUpdate = currentDocumentId || currentDocument;
      const documentId = currentDocumentId || currentDocument?.id;

      // Save document with thumbnail URL
      const response = await fetch(
        isUpdate ? `/api/documents/${documentId}` : '/api/documents',
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            instructions,
            thumbnail: thumbnailUrl,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save document');
      }

      const data = await response.json();
      setCurrentDocument(data.document);
      setCurrentDocumentId(data.document.id);

      toast.success(isUpdate ? 'Document updated' : 'Document saved', {
        description: `"${name}" has been saved to your documents.`,
      });
    },
    [currentDocumentId, currentDocument]
  );

  // Handle download with history logging
  const handleDownloadPDF = useCallback(async () => {
    try {
      await editor.downloadPDF();

      // Capture and upload thumbnail for history
      let thumbnailUrl: string | undefined;
      try {
        const previewElement = previewRef.current?.getPreviewElement();
        if (previewElement) {
          const base64Image = await captureThumbnail(previewElement, {
            width: 300,
            height: 400,
          });
          thumbnailUrl = await uploadThumbnail(base64Image, `history-${Date.now()}.png`);
        }
      } catch (thumbError) {
        console.error('Failed to capture thumbnail for history:', thumbError);
        // Continue without thumbnail
      }

      // Log to history
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'downloaded',
          documentName: currentDocument?.name || editor.instructions.metadata.title || undefined,
          instructions: editor.instructions,
          thumbnail: thumbnailUrl,
        }),
      });
    } catch (error) {
      // Error handling is done in the editor hook
      console.error('Failed to download PDF:', error);
    }
  }, [editor, currentDocument]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b p-4">
        <EditorToolbar onAddElement={editor.addElement} />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartOver}
            disabled={editor.isGenerating || editor.elements.length === 0}
          >
            <RotateCcw className="mr-2 size-4" />
            Start Over
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            disabled={editor.isGenerating || editor.elements.length === 0 || isCapturingThumbnail}
          >
            {isCapturingThumbnail ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {currentDocumentId || currentDocument ? 'Save' : 'Save As'}
          </Button>

          <DocumentSettings
            metadata={editor.instructions.metadata}
            theme={editor.instructions.theme}
            pageSettings={editor.instructions.pageSettings}
            onUpdateMetadata={editor.updateMetadata}
            onUpdateTheme={editor.updateTheme}
            onUpdatePageSettings={editor.updatePageSettings}
          />

          <JsonEditorDialog
            instructions={editor.instructions}
            onApply={editor.loadInstructions}
            disabled={editor.isGenerating}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={editor.previewPDF}
            disabled={editor.isGenerating || editor.elements.length === 0}
          >
            {editor.isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Eye className="mr-2 size-4" />
            )}
            Preview
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPDF}
            disabled={editor.isGenerating || editor.elements.length === 0}
          >
            {editor.isGenerating ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Element List */}
        <div className="w-[400px] shrink-0 overflow-auto border-r">
          <ElementList
            elements={editor.elements}
            selectedId={editor.selectedElementId}
            onSelect={editor.selectElement}
            onEdit={handleEditElement}
            onDelete={editor.removeElement}
            onDuplicate={editor.duplicateElement}
            onMoveUp={editor.moveElementUp}
            onMoveDown={editor.moveElementDown}
            editingElement={editingElement}
            onSaveElement={handleSaveElement}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-auto bg-muted/30 p-6">
          <PreviewPanel
            ref={previewRef}
            instructions={editor.instructions}
            elements={editor.elements}
            selectedElementId={editor.selectedElementId}
            onSelectElement={editor.selectElement}
            onEditElement={handleEditElement}
          />
        </div>
      </div>

      {/* Error Toast */}
      {editor.error && (
        <div className="absolute bottom-4 right-4 rounded-md bg-destructive p-4 text-destructive-foreground">
          {editor.error}
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
            <AlertDialogAction variant="destructive" onClick={confirmStartOver}>
              Start Over
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Document Dialog */}
      <SaveDocumentDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        instructions={editor.instructions}
        onSave={handleSaveDocument}
        initialName={currentDocument?.name}
        isUpdate={!!(currentDocumentId || currentDocument)}
      />
    </div>
  );
}
);
