'use client';

import { useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';

import { ElementCard } from './element-card';
import { ElementEditorDialog } from './editors/element-editor-dialog';
import type { ElementWithId } from '@/lib/editor/element-defaults';
import type { PDFElement } from '@/types/pdf';

interface ElementListProps {
  elements: ElementWithId[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  editingElement: { id: string; element: PDFElement } | null;
  onSaveElement: (element: PDFElement) => void;
  onCancelEdit: () => void;
}

export function ElementList({
  elements,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  editingElement,
  onSaveElement,
  onCancelEdit,
}: ElementListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll selected element into view
  useEffect(() => {
    if (selectedId && containerRef.current) {
      const element = containerRef.current.querySelector(
        `[data-element-id="${selectedId}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedId]);

  if (elements.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <FileText className="size-12 text-muted-foreground/50" />
        <h3 className="mt-4 font-medium">No elements yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Click "Add Element" to start building your PDF
        </p>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="space-y-2 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Elements ({elements.length})
          </h3>
        </div>

        {elements.map((element, index) => (
          <div key={element.id} data-element-id={element.id}>
            <ElementCard
              element={element}
              isSelected={selectedId === element.id}
              isFirst={index === 0}
              isLast={index === elements.length - 1}
              onSelect={() => onSelect(element.id)}
              onEdit={() => onEdit(element.id)}
              onDelete={() => onDelete(element.id)}
              onDuplicate={() => onDuplicate(element.id)}
              onMoveUp={() => onMoveUp(element.id)}
              onMoveDown={() => onMoveDown(element.id)}
            />
          </div>
        ))}
      </div>

      {editingElement && (
        <ElementEditorDialog
          element={editingElement.element}
          open={!!editingElement}
          onSave={onSaveElement}
          onCancel={onCancelEdit}
        />
      )}
    </>
  );
}
