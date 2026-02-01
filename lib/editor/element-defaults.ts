import type {
  PDFElement,
  PDFInstructions,
  HeadingElement,
  ParagraphElement,
  ListElement,
  TableElement,
  KeyValueElement,
  BarChartElement,
  PieChartElement,
  LineChartElement,
  SectionElement,
  DividerElement,
  SpacerElement,
  CalloutElement,
  CodeBlockElement,
  ImageElement,
} from '@/lib/pdf/schema';

export type ElementType = PDFElement['type'];

export type ElementWithId = PDFElement & { id: string };

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createDefaultElement(type: ElementType): PDFElement {
  switch (type) {
    case 'heading':
      return {
        type: 'heading',
        level: 1,
        content: 'New Heading',
        align: 'left',
      } as HeadingElement;

    case 'paragraph':
      return {
        type: 'paragraph',
        content: 'Enter your text here. Use **bold**, *italic*, `code`, or [links](https://example.com).',
        align: 'left',
      } as ParagraphElement;

    case 'list':
      return {
        type: 'list',
        variant: 'unordered',
        items: ['Item 1', 'Item 2', 'Item 3'],
      } as ListElement;

    case 'table':
      return {
        type: 'table',
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [
          ['Row 1 Cell 1', 'Row 1 Cell 2', 'Row 1 Cell 3'],
          ['Row 2 Cell 1', 'Row 2 Cell 2', 'Row 2 Cell 3'],
        ],
      } as TableElement;

    case 'keyValue':
      return {
        type: 'keyValue',
        items: [
          { key: 'Label 1', value: 'Value 1' },
          { key: 'Label 2', value: 'Value 2' },
        ],
        layout: 'horizontal',
      } as KeyValueElement;

    case 'barChart':
      return {
        type: 'barChart',
        title: 'Bar Chart',
        data: [
          { label: 'Category A', value: 100 },
          { label: 'Category B', value: 75 },
          { label: 'Category C', value: 50 },
        ],
        showValues: true,
      } as BarChartElement;

    case 'pieChart':
      return {
        type: 'pieChart',
        title: 'Pie Chart',
        data: [
          { label: 'Segment A', value: 40 },
          { label: 'Segment B', value: 35 },
          { label: 'Segment C', value: 25 },
        ],
        showPercentages: true,
      } as PieChartElement;

    case 'lineChart':
      return {
        type: 'lineChart',
        title: 'Line Chart',
        data: [
          {
            label: 'Series 1',
            values: [
              { x: 'Jan', y: 10 },
              { x: 'Feb', y: 25 },
              { x: 'Mar', y: 15 },
              { x: 'Apr', y: 30 },
            ],
          },
        ],
        showDots: true,
        showGrid: true,
      } as LineChartElement;

    case 'section':
      return {
        type: 'section',
        title: 'Section Title',
        children: [],
        backgroundColor: '#f7fafc',
        padding: { top: 15, right: 15, bottom: 15, left: 15 },
      } as SectionElement;

    case 'divider':
      return {
        type: 'divider',
        thickness: 1,
        marginY: 15,
      } as DividerElement;

    case 'spacer':
      return {
        type: 'spacer',
        height: 20,
      } as SpacerElement;

    case 'pageBreak':
      return {
        type: 'pageBreak',
      };

    case 'caption':
      return {
        type: 'caption',
        content: 'Caption text',
        align: 'center',
      };

    case 'callout':
      return {
        type: 'callout',
        content: 'This is an important note or quote.',
        variant: 'info',
        title: 'Note',
      } as CalloutElement;

    case 'codeBlock':
      return {
        type: 'codeBlock',
        code: 'function hello() {\n  console.log("Hello, world!");\n}',
        language: 'javascript',
        showLineNumbers: true,
      } as CodeBlockElement;

    case 'image':
      return {
        type: 'image',
        src: '',
        alt: 'Image',
        align: 'center',
      } as ImageElement;

    case 'columns':
      return {
        type: 'columns',
        columns: [
          { width: 1, children: [] },
          { width: 1, children: [] },
        ],
        gap: 16,
      };

    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function createDefaultInstructions(): PDFInstructions {
  return {
    metadata: {
      title: 'Untitled Document',
    },
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 40, right: 40, bottom: 60, left: 40 },
    },
    theme: {
      primaryColor: '#1a365d',
      secondaryColor: '#2d3748',
      accentColor: '#3182ce',
      textColor: '#1a202c',
      mutedColor: '#718096',
      backgroundColor: '#ffffff',
    },
    footer: {
      enabled: true,
      showPageNumbers: true,
      pageNumberFormat: 'Page {current} of {total}',
    },
    content: [],
  };
}

export function getElementLabel(type: ElementType): string {
  const labels: Record<ElementType, string> = {
    heading: 'Heading',
    paragraph: 'Paragraph',
    list: 'List',
    caption: 'Caption',
    callout: 'Callout',
    codeBlock: 'Code Block',
    section: 'Section',
    columns: 'Columns',
    spacer: 'Spacer',
    divider: 'Divider',
    pageBreak: 'Page Break',
    table: 'Table',
    keyValue: 'Key-Value',
    barChart: 'Bar Chart',
    pieChart: 'Pie Chart',
    lineChart: 'Line Chart',
    image: 'Image',
  };
  return labels[type] || type;
}

export function getElementSummary(element: PDFElement): string {
  switch (element.type) {
    case 'heading':
      return `H${element.level}: ${element.content.slice(0, 30)}${element.content.length > 30 ? '...' : ''}`;
    case 'paragraph':
      return element.content.slice(0, 40) + (element.content.length > 40 ? '...' : '');
    case 'list':
      return `${element.variant} list (${element.items.length} items)`;
    case 'table':
      return `${element.headers.length} columns, ${element.rows.length} rows`;
    case 'keyValue':
      return `${element.items.length} items`;
    case 'barChart':
    case 'pieChart':
    case 'lineChart':
      return element.title || `${element.data.length} data points`;
    case 'section':
      return element.title || `${element.children.length} elements`;
    case 'divider':
      return 'Horizontal line';
    case 'spacer':
      return `${element.height}px spacing`;
    case 'pageBreak':
      return 'Page break';
    case 'caption':
      return element.content.slice(0, 30) + (element.content.length > 30 ? '...' : '');
    case 'callout':
      return `${element.variant || 'info'}: ${element.content.slice(0, 30)}${element.content.length > 30 ? '...' : ''}`;
    case 'codeBlock':
      return `${element.language || 'code'} (${element.code.split('\n').length} lines)`;
    case 'image':
      return element.alt || 'Image';
    case 'columns':
      return `${element.columns.length} columns`;
    default:
      return '';
  }
}
