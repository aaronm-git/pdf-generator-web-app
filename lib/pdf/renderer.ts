import React from 'react';
import type { PDFElement, PDFTheme } from '@/lib/pdf/schema';
import { PDFHeading } from '@/components/pdf/renderer/typography/heading';
import { PDFParagraph } from '@/components/pdf/renderer/typography/paragraph';
import { PDFList } from '@/components/pdf/renderer/typography/list';
import { PDFCaption } from '@/components/pdf/renderer/typography/caption';
import { PDFCallout } from '@/components/pdf/renderer/typography/callout';
import { PDFCodeBlock } from '@/components/pdf/renderer/typography/code-block';
import { PDFSection } from '@/components/pdf/renderer/layout/section';
import { PDFColumns } from '@/components/pdf/renderer/layout/columns';
import { PDFSpacer } from '@/components/pdf/renderer/layout/spacer';
import { PDFDivider } from '@/components/pdf/renderer/layout/divider';
import { PDFTable } from '@/components/pdf/renderer/data/table';
import { PDFKeyValue } from '@/components/pdf/renderer/data/key-value';
import { PDFBarChart } from '@/components/pdf/renderer/charts/bar-chart';
import { PDFPieChart } from '@/components/pdf/renderer/charts/pie-chart';
import { PDFLineChart } from '@/components/pdf/renderer/charts/line-chart';
import { PDFImage } from '@/components/pdf/renderer/media/image';

export function renderElement(
  element: PDFElement,
  theme: PDFTheme,
  key?: string | number
): React.ReactNode {
  const elementKey = key ?? Math.random().toString(36).substr(2, 9);

  switch (element.type) {
    case 'heading':
      return React.createElement(PDFHeading, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'paragraph':
      return React.createElement(PDFParagraph, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'list':
      return React.createElement(PDFList, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'caption':
      return React.createElement(PDFCaption, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'callout':
      return React.createElement(PDFCallout, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'codeBlock':
      return React.createElement(PDFCodeBlock, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'section':
      return React.createElement(
        PDFSection,
        {
          key: elementKey,
          type: element.type,
          title: element.title,
          backgroundColor: element.backgroundColor,
          padding: element.padding,
          marginBottom: element.marginBottom,
          border: element.border,
          theme,
          children: element.children.map((child, idx) => renderElement(child, theme, idx)),
        }
      );

    case 'columns':
      return React.createElement(PDFColumns, {
        key: elementKey,
        type: element.type,
        gap: element.gap,
        marginBottom: element.marginBottom,
        theme,
        columns: element.columns.map((col) => ({
          width: col.width,
          children: col.children.map((child, idx) =>
            renderElement(child, theme, idx)
          ),
        })),
      });

    case 'spacer':
      return React.createElement(PDFSpacer, {
        key: elementKey,
        ...element,
      });

    case 'divider':
      return React.createElement(PDFDivider, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'pageBreak':
      // Page break is handled specially in the document
      return null;

    case 'table':
      return React.createElement(PDFTable, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'keyValue':
      return React.createElement(PDFKeyValue, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'barChart':
      return React.createElement(PDFBarChart, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'pieChart':
      return React.createElement(PDFPieChart, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'lineChart':
      return React.createElement(PDFLineChart, {
        key: elementKey,
        ...element,
        theme,
      });

    case 'image':
      return React.createElement(PDFImage, {
        key: elementKey,
        ...element,
        theme,
      });

    default:
      return null;
  }
}

export function renderElements(
  elements: PDFElement[],
  theme: PDFTheme
): React.ReactNode[] {
  return elements.map((element, index) => renderElement(element, theme, index));
}
