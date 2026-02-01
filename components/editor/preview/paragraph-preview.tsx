'use client';

import type { ParagraphElement, PDFTheme } from '@/lib/pdf/schema';
import { parseAndRenderMarkdown } from '@/lib/markdown/parser';

interface ParagraphPreviewProps {
  element: ParagraphElement;
  theme?: PDFTheme;
}

export function ParagraphPreview({ element, theme }: ParagraphPreviewProps) {
  return (
    <p
      style={{
        fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
        lineHeight: element.lineHeight || 1.6,
        color: element.color || theme?.textColor || '#1a202c',
        textAlign: element.align || 'left',
        fontWeight: element.fontWeight || 'normal',
        marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined,
      }}
    >
      {parseAndRenderMarkdown(element.content)}
    </p>
  );
}
