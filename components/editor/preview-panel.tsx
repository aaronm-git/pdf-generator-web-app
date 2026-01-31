'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { PDFInstructions } from '@/types/pdf';
import { ElementPreview } from './preview/element-preview';
import { getElementLabel, type ElementWithId } from '@/lib/editor/element-defaults';

interface PreviewPanelProps {
  instructions: PDFInstructions;
  elements: ElementWithId[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
}

export function PreviewPanel({
  instructions,
  elements,
  selectedElementId,
  onSelectElement,
}: PreviewPanelProps) {
  const { theme, pageSettings } = instructions;
  const containerRef = useRef<HTMLDivElement>(null);

  // A4 aspect ratio is approximately 1:1.414
  const isLandscape = pageSettings?.orientation === 'landscape';

  // Scroll selected element into view
  useEffect(() => {
    if (selectedElementId && containerRef.current) {
      const element = containerRef.current.querySelector(
        `[data-preview-id="${selectedElementId}"]`
      );
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedElementId]);

  return (
    <div className="flex justify-center">
      <div
        className={cn(
          'bg-white shadow-lg',
          isLandscape ? 'w-full max-w-4xl' : 'w-full max-w-2xl'
        )}
        style={{
          aspectRatio: isLandscape ? '1.414 / 1' : '1 / 1.414',
          minHeight: isLandscape ? 'auto' : '800px',
        }}
      >
        {/* Paper with margins */}
        <div
          ref={containerRef}
          className="h-full overflow-auto"
          style={{
            padding: `${pageSettings?.margins?.top ?? 40}px ${pageSettings?.margins?.right ?? 40}px ${pageSettings?.margins?.bottom ?? 60}px ${pageSettings?.margins?.left ?? 40}px`,
            color: theme?.textColor || '#1a202c',
            backgroundColor: theme?.backgroundColor || '#ffffff',
          }}
        >
          {elements.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Add elements to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elements.map((element) => {
                const isSelected = selectedElementId === element.id;
                return (
                  <div
                    key={element.id}
                    data-preview-id={element.id}
                    className={cn(
                      'relative cursor-pointer rounded transition-all',
                      isSelected
                        ? 'ring-2 ring-blue-500 ring-offset-2'
                        : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'
                    )}
                    onClick={() => onSelectElement(element.id)}
                  >
                    {/* Type label tab */}
                    {isSelected && (
                      <div className="absolute -top-3 left-2 z-10 rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                        {getElementLabel(element.type)}
                      </div>
                    )}
                    <ElementPreview element={element} theme={theme} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
