import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/pdf/renderer/pdf-document';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';
import { sanitizeColors } from '@/lib/utils/color-converter';
import React from 'react';
import type { PDFInstructions, PDFElement, Border } from '@/lib/pdf/schema';

// Register fonts before any PDF rendering
import '@/lib/pdf/fonts';

// Use built-in Helvetica as default for reliability
const DEFAULT_FONT = 'Helvetica';

// Valid font families for react-pdf (registered fonts + built-in)
const VALID_FONTS = new Set([
  'Roboto',
  'Roboto Mono',
  'Helvetica',
  'Times-Roman',
  'Courier',
]);

// Sanitize font family to ensure it's a registered font
function sanitizeFontFamily(fontFamily: string | undefined): string {
  if (!fontFamily) return DEFAULT_FONT;

  // Check if the font is valid
  if (VALID_FONTS.has(fontFamily)) {
    return fontFamily;
  }

  // Replace unregistered fonts with the default
  return DEFAULT_FONT;
}

// Recursively sanitize all fontFamily values in an object
function sanitizeFontsRecursively<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeFontsRecursively(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key === 'fontFamily' && typeof value === 'string') {
      result[key] = sanitizeFontFamily(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeFontsRecursively(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

// Sanitize border properties to ensure they're valid for react-pdf
function sanitizeBorder(border: Border | undefined): Border | undefined {
  if (!border) return undefined;
  return {
    width: typeof border.width === 'number' ? border.width : undefined,
    color: border.color ? sanitizeColors(border.color) : undefined,
    style: border.style,
    radius: typeof border.radius === 'number' ? border.radius : undefined,
  };
}

// Recursively sanitize elements to fix common issues
function sanitizeElement(element: PDFElement): PDFElement {
  // First sanitize colors in the element
  const sanitized = sanitizeColors(element) as PDFElement;

  if (sanitized.type === 'section') {
    return {
      ...sanitized,
      border: sanitizeBorder(sanitized.border),
      children: sanitized.children.map(sanitizeElement),
    };
  }
  if (sanitized.type === 'columns') {
    return {
      ...sanitized,
      columns: sanitized.columns.map((col) => ({
        ...col,
        children: col.children.map(sanitizeElement),
      })),
    };
  }
  return sanitized;
}

// Sanitize the entire instructions object
function sanitizeInstructions(instructions: PDFInstructions): PDFInstructions {
  // Sanitize colors throughout the entire instructions object
  const colorSanitized = sanitizeColors(instructions) as PDFInstructions;

  // Sanitize fonts throughout the entire instructions object
  const fontSanitized = sanitizeFontsRecursively(colorSanitized);

  return {
    ...fontSanitized,
    content: fontSanitized.content.map(sanitizeElement),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { instructions } = await request.json();

    if (!instructions) {
      return NextResponse.json(
        { error: 'Instructions are required' },
        { status: 400 }
      );
    }

    // Validate instructions
    const validated = pdfInstructionsSchema.parse(instructions);

    // Sanitize to fix any edge cases
    const sanitized = sanitizeInstructions(validated);

    // Render PDF to buffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(PDFDocument, { instructions: sanitized }) as any
    );

    // Return as base64
    const base64 = Buffer.from(pdfBuffer).toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
      mimeType: 'application/pdf',
    });
  } catch (error) {
    console.error('PDF render error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Render failed',
      },
      { status: 500 }
    );
  }
}
