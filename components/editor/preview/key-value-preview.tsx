'use client';

import { cn } from '@/lib/utils';
import type { KeyValueElement, PDFTheme } from '@/lib/pdf/schema';

interface KeyValuePreviewProps {
  element: KeyValueElement;
  theme?: PDFTheme;
}

export function KeyValuePreview({ element, theme }: KeyValuePreviewProps) {
  const layout = element.layout || 'horizontal';

  return (
    <div
      className={cn(
        layout === 'grid' && 'grid grid-cols-2 gap-4',
        layout === 'vertical' && 'space-y-2',
        layout === 'horizontal' && 'space-y-1'
      )}
      style={{ marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined }}
    >
      {element.items.map((item, index) => (
        <div
          key={index}
          className={cn(
            layout === 'horizontal' && 'flex items-center gap-4',
            layout === 'grid' && 'flex flex-col',
            layout === 'vertical' && 'flex flex-col'
          )}
        >
          <span
            className="text-sm"
            style={{
              color: element.keyStyle?.color || theme?.mutedColor || '#718096',
              fontWeight: element.keyStyle?.fontWeight || 500,
              width:
                layout === 'horizontal'
                  ? element.keyStyle?.width
                    ? `${element.keyStyle.width}px`
                    : '120px'
                  : undefined,
              flexShrink: 0,
            }}
          >
            {item.key}
          </span>
          <span
            className="font-semibold"
            style={{
              color: element.valueStyle?.color || theme?.textColor || '#1a202c',
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
