'use client';

import type { ListElement, PDFTheme } from '@/types/pdf';
import { parseAndRenderMarkdown } from '@/lib/markdown/parser';

interface ListPreviewProps {
  element: ListElement;
  theme?: PDFTheme;
}

export function ListPreview({ element, theme }: ListPreviewProps) {
  const ListTag = element.variant === 'ordered' ? 'ol' : 'ul';

  return (
    <ListTag
      className={element.variant === 'ordered' ? 'list-decimal' : 'list-disc'}
      style={{
        paddingLeft: '1.5rem',
        color: element.color || theme?.textColor || '#1a202c',
        fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
        marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined,
      }}
    >
      {element.items.map((item, index) => (
        <li
          key={index}
          style={{
            marginBottom: element.spacing ? `${element.spacing}px` : '0.25rem',
          }}
        >
          {parseAndRenderMarkdown(item)}
        </li>
      ))}
    </ListTag>
  );
}
