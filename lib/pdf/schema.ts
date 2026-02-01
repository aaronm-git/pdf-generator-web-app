import { z } from 'zod';

// ============ BASE SCHEMAS ============
export const spacingSchema = z.object({
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
});

export const borderSchema = z.object({
  width: z.number().optional(),
  color: z.string().optional(),
  style: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
  radius: z.number().optional(),
});

export const fontWeightSchema = z.enum(['normal', 'bold', 'light', 'medium', 'semibold']);
export const textAlignSchema = z.enum(['left', 'center', 'right', 'justify']);

// ============ TYPOGRAPHY ELEMENT SCHEMAS ============
export const headingElementSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  content: z.string(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
  marginBottom: z.number().optional(),
});

export const paragraphElementSchema = z.object({
  type: z.literal('paragraph'),
  content: z.string(),
  fontSize: z.number().optional(),
  lineHeight: z.number().optional(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
  fontWeight: fontWeightSchema.optional(),
  marginBottom: z.number().optional(),
});

export const listElementSchema = z.object({
  type: z.literal('list'),
  variant: z.enum(['ordered', 'unordered']),
  items: z.array(z.string()),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  spacing: z.number().optional(),
  marginBottom: z.number().optional(),
});

export const captionElementSchema = z.object({
  type: z.literal('caption'),
  content: z.string(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
});

export const calloutElementSchema = z.object({
  type: z.literal('callout'),
  content: z.string(),
  variant: z.enum(['info', 'warning', 'success', 'error', 'quote']).optional(),
  title: z.string().optional(),
  marginBottom: z.number().optional(),
});

export const codeBlockElementSchema = z.object({
  type: z.literal('codeBlock'),
  code: z.string(),
  language: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
  marginBottom: z.number().optional(),
});

// ============ LAYOUT ELEMENT SCHEMAS ============
export const spacerElementSchema = z.object({
  type: z.literal('spacer'),
  height: z.number(),
});

export const dividerElementSchema = z.object({
  type: z.literal('divider'),
  color: z.string().optional(),
  thickness: z.number().optional(),
  marginY: z.number().optional(),
});

export const pageBreakElementSchema = z.object({
  type: z.literal('pageBreak'),
});

// ============ DATA ELEMENT SCHEMAS ============
export const tableElementSchema = z.object({
  type: z.literal('table'),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
  columnWidths: z.array(z.number()).optional(),
  headerStyle: z.object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontWeight: fontWeightSchema.optional(),
  }).optional(),
  cellStyle: z.object({
    padding: z.number().optional(),
    borderColor: z.string().optional(),
    fontSize: z.number().optional(),
  }).optional(),
  alternateRowColor: z.string().optional(),
  marginBottom: z.number().optional(),
});

export const keyValueElementSchema = z.object({
  type: z.literal('keyValue'),
  items: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  layout: z.enum(['horizontal', 'vertical', 'grid']).optional(),
  keyStyle: z.object({
    fontWeight: fontWeightSchema.optional(),
    color: z.string().optional(),
    width: z.number().optional(),
  }).optional(),
  valueStyle: z.object({
    color: z.string().optional(),
  }).optional(),
  marginBottom: z.number().optional(),
});

// ============ CHART ELEMENT SCHEMAS ============
export const chartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

export const barChartElementSchema = z.object({
  type: z.literal('barChart'),
  title: z.string().optional(),
  data: z.array(chartDataPointSchema),
  width: z.number().optional(),
  height: z.number().optional(),
  showValues: z.boolean().optional(),
  showLegend: z.boolean().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  colors: z.array(z.string()).optional(),
  marginBottom: z.number().optional(),
});

export const lineChartElementSchema = z.object({
  type: z.literal('lineChart'),
  title: z.string().optional(),
  data: z.array(z.object({
    label: z.string(),
    values: z.array(z.object({
      x: z.union([z.string(), z.number()]),
      y: z.number(),
    })),
    color: z.string().optional(),
  })),
  width: z.number().optional(),
  height: z.number().optional(),
  showGrid: z.boolean().optional(),
  showDots: z.boolean().optional(),
  marginBottom: z.number().optional(),
});

export const pieChartElementSchema = z.object({
  type: z.literal('pieChart'),
  title: z.string().optional(),
  data: z.array(chartDataPointSchema),
  width: z.number().optional(),
  height: z.number().optional(),
  showLabels: z.boolean().optional(),
  showPercentages: z.boolean().optional(),
  donut: z.boolean().optional(),
  colors: z.array(z.string()).optional(),
  marginBottom: z.number().optional(),
});

// ============ MEDIA ELEMENT SCHEMAS ============
export const imageElementSchema = z.object({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  marginBottom: z.number().optional(),
});

// ============ BASE ELEMENT SCHEMA (non-recursive) ============
const baseElementSchema = z.discriminatedUnion('type', [
  headingElementSchema,
  paragraphElementSchema,
  listElementSchema,
  captionElementSchema,
  calloutElementSchema,
  codeBlockElementSchema,
  spacerElementSchema,
  dividerElementSchema,
  pageBreakElementSchema,
  tableElementSchema,
  keyValueElementSchema,
  barChartElementSchema,
  lineChartElementSchema,
  pieChartElementSchema,
  imageElementSchema,
]);

// ============ RECURSIVE ELEMENT SCHEMAS ============
export const sectionElementSchema: z.ZodType<{
  type: 'section';
  title?: string;
  children: z.infer<typeof pdfElementSchema>[];
  backgroundColor?: string;
  padding?: z.infer<typeof spacingSchema>;
  marginBottom?: number;
  border?: z.infer<typeof borderSchema>;
}> = z.object({
  type: z.literal('section'),
  title: z.string().optional(),
  children: z.lazy(() => z.array(pdfElementSchema)),
  backgroundColor: z.string().optional(),
  padding: spacingSchema.optional(),
  marginBottom: z.number().optional(),
  border: borderSchema.optional(),
});

export const columnsElementSchema: z.ZodType<{
  type: 'columns';
  columns: {
    width: number;
    children: z.infer<typeof pdfElementSchema>[];
  }[];
  gap?: number;
  marginBottom?: number;
}> = z.object({
  type: z.literal('columns'),
  columns: z.array(z.object({
    width: z.number(),
    children: z.lazy(() => z.array(pdfElementSchema)),
  })),
  gap: z.number().optional(),
  marginBottom: z.number().optional(),
});

// ============ COMBINED ELEMENT SCHEMA ============
export const pdfElementSchema: z.ZodType<
  | z.infer<typeof baseElementSchema>
  | z.infer<typeof sectionElementSchema>
  | z.infer<typeof columnsElementSchema>
> = z.union([
  baseElementSchema,
  sectionElementSchema,
  columnsElementSchema,
]);

// ============ DOCUMENT STRUCTURE SCHEMAS ============
export const pdfMetadataSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

export const pdfPageSettingsSchema = z.object({
  size: z.enum(['A4', 'LETTER', 'LEGAL', 'TABLOID']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  margins: spacingSchema.optional(),
});

export const pdfThemeSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  textColor: z.string().optional(),
  mutedColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

export const pdfHeaderSchema = z.object({
  enabled: z.boolean(),
  content: z.array(pdfElementSchema).optional(),
  height: z.number().optional(),
});

export const pdfFooterSchema = z.object({
  enabled: z.boolean(),
  content: z.array(pdfElementSchema).optional(),
  showPageNumbers: z.boolean().optional(),
  pageNumberFormat: z.string().optional(),
  height: z.number().optional(),
});

export const pdfInstructionsSchema = z.object({
  metadata: pdfMetadataSchema,
  pageSettings: pdfPageSettingsSchema.optional(),
  theme: pdfThemeSchema.optional(),
  header: pdfHeaderSchema.optional(),
  footer: pdfFooterSchema.optional(),
  content: z.array(pdfElementSchema),
});

// ============ INFERRED TYPES (Single Source of Truth) ============
export type FontWeight = z.infer<typeof fontWeightSchema>;
export type TextAlign = z.infer<typeof textAlignSchema>;
export type BorderStyle = z.infer<typeof borderSchema>['style'];
export type Spacing = z.infer<typeof spacingSchema>;
export type Border = z.infer<typeof borderSchema>;

export type HeadingElement = z.infer<typeof headingElementSchema>;
export type ParagraphElement = z.infer<typeof paragraphElementSchema>;
export type ListElement = z.infer<typeof listElementSchema>;
export type CaptionElement = z.infer<typeof captionElementSchema>;
export type CalloutElement = z.infer<typeof calloutElementSchema>;
export type CodeBlockElement = z.infer<typeof codeBlockElementSchema>;
export type SpacerElement = z.infer<typeof spacerElementSchema>;
export type DividerElement = z.infer<typeof dividerElementSchema>;
export type PageBreakElement = z.infer<typeof pageBreakElementSchema>;
export type TableElement = z.infer<typeof tableElementSchema>;
export type KeyValueElement = z.infer<typeof keyValueElementSchema>;
export type ChartDataPoint = z.infer<typeof chartDataPointSchema>;
export type BarChartElement = z.infer<typeof barChartElementSchema>;
export type LineChartElement = z.infer<typeof lineChartElementSchema>;
export type PieChartElement = z.infer<typeof pieChartElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type SectionElement = z.infer<typeof sectionElementSchema>;
export type ColumnsElement = z.infer<typeof columnsElementSchema>;

export type PDFElement = z.infer<typeof pdfElementSchema>;
export type PDFMetadata = z.infer<typeof pdfMetadataSchema>;
export type PDFPageSettings = z.infer<typeof pdfPageSettingsSchema>;
export type PDFTheme = z.infer<typeof pdfThemeSchema>;
export type PDFHeader = z.infer<typeof pdfHeaderSchema>;
export type PDFFooter = z.infer<typeof pdfFooterSchema>;
export type PDFInstructions = z.infer<typeof pdfInstructionsSchema>;
