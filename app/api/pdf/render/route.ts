import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFDocument } from '@/components/pdf/renderer/pdf-document';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';
import React from 'react';
import type { PDFInstructions, PDFElement, Border } from '@/types/pdf';

// Sanitize border properties to ensure they're valid for react-pdf
function sanitizeBorder(border: Border | undefined): Border | undefined {
  if (!border) return undefined;
  return {
    width: typeof border.width === 'number' ? border.width : undefined,
    color: border.color,
    style: border.style,
    radius: typeof border.radius === 'number' ? border.radius : undefined,
  };
}

// Recursively sanitize elements to fix common issues
function sanitizeElement(element: PDFElement): PDFElement {
  if (element.type === 'section') {
    return {
      ...element,
      border: sanitizeBorder(element.border),
      children: element.children.map(sanitizeElement),
    };
  }
  if (element.type === 'columns') {
    return {
      ...element,
      columns: element.columns.map((col) => ({
        ...col,
        children: col.children.map(sanitizeElement),
      })),
    };
  }
  return element;
}

// Sanitize the entire instructions object
function sanitizeInstructions(instructions: PDFInstructions): PDFInstructions {
  return {
    ...instructions,
    content: instructions.content.map(sanitizeElement),
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
