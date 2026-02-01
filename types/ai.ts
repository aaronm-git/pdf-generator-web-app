import type { PDFInstructions } from '@/lib/pdf/schema';

export interface GenerateRequest {
  prompt: string;
  options?: PromptOptions;
}

export interface PromptOptions {
  includeCharts?: boolean;
  includeTables?: boolean;
  templateType?: 'report' | 'invoice' | 'proposal' | 'general';
}

export interface GenerateResponse {
  success: boolean;
  instructions?: PDFInstructions;
  error?: string;
}

export interface RenderRequest {
  instructions: PDFInstructions;
}

export interface RenderResponse {
  success: boolean;
  pdf?: string; // base64 encoded
  mimeType?: string;
  error?: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'rendering' | 'complete' | 'error';

export interface GenerationState {
  status: GenerationStatus;
  instructions: PDFInstructions | null;
  pdfData: string | null;
  error: string | null;
}
