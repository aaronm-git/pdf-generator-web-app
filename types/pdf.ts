// ============ BASE TYPES ============
export type FontWeight = 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

export interface Spacing {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface Border {
  width?: number;
  color?: string;
  style?: BorderStyle;
  radius?: number;
}

// ============ TYPOGRAPHY ELEMENTS ============
export interface HeadingElement {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
  color?: string;
  align?: TextAlign;
  marginBottom?: number;
}

export interface ParagraphElement {
  type: 'paragraph';
  content: string;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
  align?: TextAlign;
  fontWeight?: FontWeight;
  marginBottom?: number;
}

export interface ListElement {
  type: 'list';
  variant: 'ordered' | 'unordered';
  items: string[];
  fontSize?: number;
  color?: string;
  spacing?: number;
  marginBottom?: number;
}

export interface CaptionElement {
  type: 'caption';
  content: string;
  color?: string;
  align?: TextAlign;
}

export interface CalloutElement {
  type: 'callout';
  content: string;
  variant?: 'info' | 'warning' | 'success' | 'error' | 'quote';
  title?: string;
  marginBottom?: number;
}

export interface CodeBlockElement {
  type: 'codeBlock';
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  marginBottom?: number;
}

// ============ LAYOUT ELEMENTS ============
export interface SectionElement {
  type: 'section';
  title?: string;
  children: PDFElement[];
  backgroundColor?: string;
  padding?: Spacing;
  marginBottom?: number;
  border?: Border;
}

export interface ColumnsElement {
  type: 'columns';
  columns: {
    width: number;
    children: PDFElement[];
  }[];
  gap?: number;
  marginBottom?: number;
}

export interface SpacerElement {
  type: 'spacer';
  height: number;
}

export interface DividerElement {
  type: 'divider';
  color?: string;
  thickness?: number;
  marginY?: number;
}

export interface PageBreakElement {
  type: 'pageBreak';
}

// ============ DATA ELEMENTS ============
export interface TableElement {
  type: 'table';
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
  headerStyle?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: FontWeight;
  };
  cellStyle?: {
    padding?: number;
    borderColor?: string;
    fontSize?: number;
  };
  alternateRowColor?: string;
  marginBottom?: number;
}

export interface KeyValueElement {
  type: 'keyValue';
  items: { key: string; value: string }[];
  layout?: 'horizontal' | 'vertical' | 'grid';
  keyStyle?: {
    fontWeight?: FontWeight;
    color?: string;
    width?: number;
  };
  valueStyle?: {
    color?: string;
  };
  marginBottom?: number;
}

// ============ CHART ELEMENTS ============
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartElement {
  type: 'barChart';
  title?: string;
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  showValues?: boolean;
  showLegend?: boolean;
  orientation?: 'horizontal' | 'vertical';
  colors?: string[];
  marginBottom?: number;
}

export interface LineChartElement {
  type: 'lineChart';
  title?: string;
  data: {
    label: string;
    values: { x: string | number; y: number }[];
    color?: string;
  }[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  marginBottom?: number;
}

export interface PieChartElement {
  type: 'pieChart';
  title?: string;
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  donut?: boolean;
  colors?: string[];
  marginBottom?: number;
}

// ============ MEDIA ELEMENTS ============
export interface ImageElement {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
  marginBottom?: number;
}

// ============ UNION TYPE ============
export type PDFElement =
  | HeadingElement
  | ParagraphElement
  | ListElement
  | CaptionElement
  | CalloutElement
  | CodeBlockElement
  | SectionElement
  | ColumnsElement
  | SpacerElement
  | DividerElement
  | PageBreakElement
  | TableElement
  | KeyValueElement
  | BarChartElement
  | LineChartElement
  | PieChartElement
  | ImageElement;

// ============ DOCUMENT STRUCTURE ============
export interface PDFMetadata {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  createdAt?: string;
}

export interface PDFPageSettings {
  size?: 'A4' | 'LETTER' | 'LEGAL' | 'TABLOID';
  orientation?: 'portrait' | 'landscape';
  margins?: Spacing;
}

export interface PDFHeader {
  enabled: boolean;
  content?: PDFElement[];
  height?: number;
}

export interface PDFFooter {
  enabled: boolean;
  content?: PDFElement[];
  showPageNumbers?: boolean;
  pageNumberFormat?: string;
  height?: number;
}

export interface PDFTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  mutedColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

export interface PDFInstructions {
  metadata: PDFMetadata;
  pageSettings?: PDFPageSettings;
  theme?: PDFTheme;
  header?: PDFHeader;
  footer?: PDFFooter;
  content: PDFElement[];
}
