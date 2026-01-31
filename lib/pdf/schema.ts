import { z } from 'zod';

// Base schemas
const spacingSchema = z.object({
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
});

const borderSchema = z.object({
  width: z.number().optional(),
  color: z.string().optional(),
  style: z.enum(['solid', 'dashed', 'dotted', 'none']).optional(),
  radius: z.number().optional(),
});

const fontWeightSchema = z.enum(['normal', 'bold', 'light', 'medium', 'semibold']);
const textAlignSchema = z.enum(['left', 'center', 'right', 'justify']);

// Typography element schemas
const headingElementSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  content: z.string(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
  marginBottom: z.number().optional(),
});

const paragraphElementSchema = z.object({
  type: z.literal('paragraph'),
  content: z.string(),
  fontSize: z.number().optional(),
  lineHeight: z.number().optional(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
  fontWeight: fontWeightSchema.optional(),
  marginBottom: z.number().optional(),
});

const listElementSchema = z.object({
  type: z.literal('list'),
  variant: z.enum(['ordered', 'unordered']),
  items: z.array(z.string()),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  spacing: z.number().optional(),
  marginBottom: z.number().optional(),
});

const captionElementSchema = z.object({
  type: z.literal('caption'),
  content: z.string(),
  color: z.string().optional(),
  align: textAlignSchema.optional(),
});

const calloutElementSchema = z.object({
  type: z.literal('callout'),
  content: z.string(),
  variant: z.enum(['info', 'warning', 'success', 'error', 'quote']).optional(),
  title: z.string().optional(),
  marginBottom: z.number().optional(),
});

const codeBlockElementSchema = z.object({
  type: z.literal('codeBlock'),
  code: z.string(),
  language: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
  marginBottom: z.number().optional(),
});

// Layout element schemas
const spacerElementSchema = z.object({
  type: z.literal('spacer'),
  height: z.number(),
});

const dividerElementSchema = z.object({
  type: z.literal('divider'),
  color: z.string().optional(),
  thickness: z.number().optional(),
  marginY: z.number().optional(),
});

const pageBreakElementSchema = z.object({
  type: z.literal('pageBreak'),
});

// Data element schemas
const tableElementSchema = z.object({
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

const keyValueElementSchema = z.object({
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

// Chart element schemas
const chartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const barChartElementSchema = z.object({
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

const lineChartElementSchema = z.object({
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

const pieChartElementSchema = z.object({
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

// Media element schemas
const imageElementSchema = z.object({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  marginBottom: z.number().optional(),
});

// Base element schema (without recursive types)
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

// Section and columns need to be defined with lazy for recursion
const sectionElementSchema: z.ZodType<{
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

const columnsElementSchema: z.ZodType<{
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

// Combined element schema
export const pdfElementSchema: z.ZodType<
  | z.infer<typeof baseElementSchema>
  | z.infer<typeof sectionElementSchema>
  | z.infer<typeof columnsElementSchema>
> = z.union([
  baseElementSchema,
  sectionElementSchema,
  columnsElementSchema,
]);

// Document structure schemas
const pdfMetadataSchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
});

const pdfPageSettingsSchema = z.object({
  size: z.enum(['A4', 'LETTER', 'LEGAL', 'TABLOID']).optional(),
  orientation: z.enum(['portrait', 'landscape']).optional(),
  margins: spacingSchema.optional(),
});

const pdfThemeSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  textColor: z.string().optional(),
  mutedColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
});

const pdfHeaderSchema = z.object({
  enabled: z.boolean(),
  content: z.array(pdfElementSchema).optional(),
  height: z.number().optional(),
});

const pdfFooterSchema = z.object({
  enabled: z.boolean(),
  content: z.array(pdfElementSchema).optional(),
  showPageNumbers: z.boolean().optional(),
  pageNumberFormat: z.string().optional(),
  height: z.number().optional(),
});

// Main PDF instructions schema
export const pdfInstructionsSchema = z.object({
  metadata: pdfMetadataSchema,
  pageSettings: pdfPageSettingsSchema.optional(),
  theme: pdfThemeSchema.optional(),
  header: pdfHeaderSchema.optional(),
  footer: pdfFooterSchema.optional(),
  content: z.array(pdfElementSchema),
});

export type PDFInstructionsInput = z.infer<typeof pdfInstructionsSchema>;
