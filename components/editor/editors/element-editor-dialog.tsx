'use client';

import type { PDFElement } from '@/types/pdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getElementLabel } from '@/lib/editor/element-defaults';
import { HeadingEditor } from './heading-editor';
import { ParagraphEditor } from './paragraph-editor';
import { ListEditor } from './list-editor';
import { TableEditor } from './table-editor';
import { KeyValueEditor } from './key-value-editor';
import { ChartEditor } from './chart-editor';
import { SectionEditor } from './section-editor';
import { DividerEditor } from './divider-editor';
import { SpacerEditor } from './spacer-editor';
import { CalloutEditor } from './callout-editor';
import { CodeBlockEditor } from './code-block-editor';
import { ImageEditor } from './image-editor';

interface ElementEditorDialogProps {
  element: PDFElement;
  open: boolean;
  onSave: (element: PDFElement) => void;
  onCancel: () => void;
}

export function ElementEditorDialog({
  element,
  open,
  onSave,
  onCancel,
}: ElementEditorDialogProps) {
  const renderEditor = () => {
    switch (element.type) {
      case 'heading':
        return <HeadingEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'paragraph':
        return <ParagraphEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'list':
        return <ListEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'table':
        return <TableEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'keyValue':
        return <KeyValueEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'barChart':
      case 'pieChart':
      case 'lineChart':
        return <ChartEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'section':
        return <SectionEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'divider':
        return <DividerEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'spacer':
        return <SpacerEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'callout':
        return <CalloutEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'codeBlock':
        return <CodeBlockEditor element={element} onSave={onSave} onCancel={onCancel} />;
      case 'image':
        return <ImageEditor element={element} onSave={onSave} onCancel={onCancel} />;
      default:
        return <div className="p-4 text-muted-foreground">Editor not available for this element type.</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {getElementLabel(element.type)}</DialogTitle>
        </DialogHeader>
        {renderEditor()}
      </DialogContent>
    </Dialog>
  );
}
