'use client';

import type { SectionElement, PDFTheme } from '@/lib/pdf/schema';
import { ElementPreview } from './element-preview';

interface SectionPreviewProps {
  element: SectionElement;
  theme?: PDFTheme;
}

export function SectionPreview({ element, theme }: SectionPreviewProps) {
  return (
    <div
      className="rounded"
      style={{
        backgroundColor: element.backgroundColor || 'transparent',
        paddingTop: element.padding?.top ?? 0,
        paddingRight: element.padding?.right ?? 0,
        paddingBottom: element.padding?.bottom ?? 0,
        paddingLeft: element.padding?.left ?? 0,
        marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined,
        borderWidth: element.border?.width ?? 0,
        borderColor: element.border?.color || '#e2e8f0',
        borderStyle: element.border?.style === 'none' ? 'none' : (element.border?.style || 'solid'),
        borderRadius: element.border?.radius ?? 0,
      }}
    >
      {element.title && (
        <h4
          className="mb-3 font-semibold"
          style={{ color: theme?.primaryColor || '#1a202c' }}
        >
          {element.title}
        </h4>
      )}
      <div className="space-y-3">
        {element.children.map((child, index) => (
          <ElementPreview key={index} element={child} theme={theme} />
        ))}
      </div>
    </div>
  );
}
