'use client';

import type { DividerElement, PDFTheme } from '@/lib/pdf/schema';

interface DividerPreviewProps {
  element: DividerElement;
  theme?: PDFTheme;
}

export function DividerPreview({ element, theme }: DividerPreviewProps) {
  return (
    <hr
      style={{
        borderTopWidth: element.thickness ?? 1,
        borderTopColor: element.color || theme?.mutedColor || '#e2e8f0',
        borderTopStyle: 'solid',
        marginTop: element.marginY ?? 15,
        marginBottom: element.marginY ?? 15,
      }}
    />
  );
}
