'use client';

import { cn } from '@/lib/utils';
import type { HeadingElement, PDFTheme } from '@/types/pdf';

interface HeadingPreviewProps {
  element: HeadingElement;
  theme?: PDFTheme;
}

const headingSizes: Record<number, string> = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-xl',
  4: 'text-lg',
  5: 'text-base',
  6: 'text-sm',
};

export function HeadingPreview({ element, theme }: HeadingPreviewProps) {
  return (
    <div
      className={cn(
        'font-bold',
        headingSizes[element.level] || 'text-3xl',
        element.marginBottom && `mb-[${element.marginBottom}px]`
      )}
      style={{
        color: element.color || theme?.primaryColor || '#1a202c',
        textAlign: element.align || 'left',
      }}
    >
      {element.content}
    </div>
  );
}
