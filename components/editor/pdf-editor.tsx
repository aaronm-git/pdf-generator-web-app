'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { Download, Eye, Loader2, RotateCcw } from 'lucide-react';

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
import { PreviewPanel } from './preview-panel';
import { DocumentSettings } from './document-settings';
import type { PDFElement, PDFInstructions } from '@/types/pdf';

export interface PDFEditorRef {
  loadInstructions: (instructions: PDFInstructions) => void;
  reset: () => void;
}

export const PDFEditor = forwardRef<PDFEditorRef>(function PDFEditor(_props, ref) {
  const editor = usePDFEditor();
  const [editingElement, setEditingElement] = useState<{
    id: string;
    element: PDFElement;
  } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    loadInstructions: editor.loadInstructions,
    reset: editor.reset,
  }), [editor.loadInstructions, editor.reset]);

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
    setShowClearConfirm(false);
  };

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

          <DocumentSettings
            metadata={editor.instructions.metadata}
            theme={editor.instructions.theme}
            pageSettings={editor.instructions.pageSettings}
            onUpdateMetadata={editor.updateMetadata}
            onUpdateTheme={editor.updateTheme}
            onUpdatePageSettings={editor.updatePageSettings}
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
            onClick={editor.downloadPDF}
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
            instructions={editor.instructions}
            elements={editor.elements}
            selectedElementId={editor.selectedElementId}
            onSelectElement={editor.selectElement}
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
    </div>
  );
});
