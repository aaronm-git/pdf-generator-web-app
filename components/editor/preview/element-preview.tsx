'use client';

import type { PDFElement, PDFTheme } from '@/types/pdf';
import { HeadingPreview } from './heading-preview';
import { ParagraphPreview } from './paragraph-preview';
import { ListPreview } from './list-preview';
import { TablePreview } from './table-preview';
import { KeyValuePreview } from './key-value-preview';
import { ChartPreview } from './chart-preview';
import { SectionPreview } from './section-preview';
import { DividerPreview } from './divider-preview';
import { SpacerPreview } from './spacer-preview';
import { CalloutPreview } from './callout-preview';
import { CodeBlockPreview } from './code-block-preview';
import { ImagePreview } from './image-preview';
import { parseAndRenderMarkdown } from '@/lib/markdown/parser';

interface ElementPreviewProps {
  element: PDFElement;
  theme?: PDFTheme;
}

export function ElementPreview({ element, theme }: ElementPreviewProps) {
  switch (element.type) {
    case 'heading':
      return <HeadingPreview element={element} theme={theme} />;

    case 'paragraph':
      return <ParagraphPreview element={element} theme={theme} />;

    case 'list':
      return <ListPreview element={element} theme={theme} />;

    case 'table':
      return <TablePreview element={element} theme={theme} />;

    case 'keyValue':
      return <KeyValuePreview element={element} theme={theme} />;

    case 'barChart':
    case 'pieChart':
    case 'lineChart':
      return <ChartPreview element={element} theme={theme} />;

    case 'section':
      return <SectionPreview element={element} theme={theme} />;

    case 'divider':
      return <DividerPreview element={element} theme={theme} />;

    case 'spacer':
      return <SpacerPreview element={element} />;

    case 'callout':
      return <CalloutPreview element={element} theme={theme} />;

    case 'codeBlock':
      return <CodeBlockPreview element={element} theme={theme} />;

    case 'image':
      return <ImagePreview element={element} theme={theme} />;

    case 'caption':
      return (
        <p
          className="text-sm"
          style={{
            color: element.color || theme?.mutedColor || '#718096',
            textAlign: element.align || 'left',
          }}
        >
          {parseAndRenderMarkdown(element.content)}
        </p>
      );

    case 'pageBreak':
      return (
        <div className="my-4 border-t-2 border-dashed border-muted-foreground/30 py-2 text-center text-xs text-muted-foreground">
          Page Break
        </div>
      );

    case 'columns':
      return (
        <div
          style={{
            display: 'flex',
            gap: element.gap ? `${element.gap}px` : '16px',
            marginBottom: element.marginBottom ? `${element.marginBottom}px` : undefined,
          }}
        >
          {element.columns.map((col, idx) => (
            <div key={idx} style={{ flex: col.width }}>
              {col.children.map((child, childIdx) => (
                <ElementPreview key={childIdx} element={child} theme={theme} />
              ))}
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="rounded bg-muted p-4 text-sm text-muted-foreground">
          Unknown element type: {(element as PDFElement).type}
        </div>
      );
  }
}
