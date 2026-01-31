import { z } from 'zod';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';

// Generate JSON Schema using Zod v4's built-in toJSONSchema
export const pdfInstructionsJsonSchema = z.toJSONSchema(pdfInstructionsSchema, {
  reused: 'inline', // Inline all definitions for AI compatibility
});

// OpenAI-compatible schema that avoids oneOf/anyOf (not supported in strict mode)
// Uses a more permissive element schema with additionalProperties
const openAICompatibleSchema = {
  type: 'object',
  properties: {
    metadata: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        subject: { type: 'string' },
        keywords: { type: 'array', items: { type: 'string' } },
        createdAt: { type: 'string' },
      },
      required: ['title'],
      additionalProperties: false,
    },
    pageSettings: {
      type: 'object',
      properties: {
        size: { type: 'string', enum: ['A4', 'LETTER', 'LEGAL', 'TABLOID'] },
        orientation: { type: 'string', enum: ['portrait', 'landscape'] },
        margins: {
          type: 'object',
          properties: {
            top: { type: 'number' },
            right: { type: 'number' },
            bottom: { type: 'number' },
            left: { type: 'number' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    theme: {
      type: 'object',
      properties: {
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        accentColor: { type: 'string' },
        textColor: { type: 'string' },
        mutedColor: { type: 'string' },
        backgroundColor: { type: 'string' },
        fontFamily: { type: 'string' },
      },
      additionalProperties: false,
    },
    content: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: [
              'heading', 'paragraph', 'list', 'caption', 'callout', 'codeBlock',
              'section', 'columns', 'spacer', 'divider', 'pageBreak',
              'table', 'keyValue', 'barChart', 'lineChart', 'pieChart', 'image'
            ],
          },
          // Heading
          level: { type: 'integer' },
          // Text content (heading, paragraph, caption, callout, codeBlock)
          content: { type: 'string' },
          // Common styling
          color: { type: 'string' },
          align: { type: 'string', enum: ['left', 'center', 'right', 'justify'] },
          fontSize: { type: 'number' },
          lineHeight: { type: 'number' },
          fontWeight: { type: 'string', enum: ['normal', 'bold', 'light', 'medium', 'semibold'] },
          marginBottom: { type: 'number' },
          // List
          variant: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                key: { type: 'string' },
                value: { type: 'string' },
                label: { type: 'string' },
                color: { type: 'string' },
              },
              additionalProperties: true,
            },
          },
          spacing: { type: 'number' },
          // Callout
          title: { type: 'string' },
          // CodeBlock
          code: { type: 'string' },
          language: { type: 'string' },
          showLineNumbers: { type: 'boolean' },
          // Spacer
          height: { type: 'number' },
          // Divider
          thickness: { type: 'number' },
          marginY: { type: 'number' },
          // Table
          headers: { type: 'array', items: { type: 'string' } },
          rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
          columnWidths: { type: 'array', items: { type: 'number' } },
          headerStyle: {
            type: 'object',
            properties: {
              backgroundColor: { type: 'string' },
              color: { type: 'string' },
              fontWeight: { type: 'string' },
            },
            additionalProperties: false,
          },
          cellStyle: {
            type: 'object',
            properties: {
              padding: { type: 'number' },
              borderColor: { type: 'string' },
              fontSize: { type: 'number' },
            },
            additionalProperties: false,
          },
          alternateRowColor: { type: 'string' },
          // Charts
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'number' },
                color: { type: 'string' },
                values: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      x: { type: 'string' },
                      y: { type: 'number' },
                    },
                    required: ['x', 'y'],
                    additionalProperties: false,
                  },
                },
              },
              additionalProperties: false,
            },
          },
          width: { type: 'number' },
          showValues: { type: 'boolean' },
          showLegend: { type: 'boolean' },
          orientation: { type: 'string', enum: ['horizontal', 'vertical'] },
          colors: { type: 'array', items: { type: 'string' } },
          showGrid: { type: 'boolean' },
          showDots: { type: 'boolean' },
          showLabels: { type: 'boolean' },
          showPercentages: { type: 'boolean' },
          donut: { type: 'boolean' },
          // Image
          src: { type: 'string' },
          alt: { type: 'string' },
          // Section
          children: {
            type: 'array',
            items: { type: 'object', additionalProperties: true },
          },
          backgroundColor: { type: 'string' },
          padding: {
            type: 'object',
            properties: {
              top: { type: 'number' },
              right: { type: 'number' },
              bottom: { type: 'number' },
              left: { type: 'number' },
            },
            additionalProperties: false,
          },
          border: {
            type: 'object',
            properties: {
              width: { type: 'number' },
              color: { type: 'string' },
              style: { type: 'string', enum: ['solid', 'dashed', 'dotted', 'none'] },
              radius: { type: 'number' },
            },
            additionalProperties: false,
          },
          // Columns
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                children: {
                  type: 'array',
                  items: { type: 'object', additionalProperties: true },
                },
              },
              required: ['width', 'children'],
              additionalProperties: false,
            },
          },
          gap: { type: 'number' },
          // KeyValue
          layout: { type: 'string', enum: ['horizontal', 'vertical', 'grid'] },
          keyStyle: {
            type: 'object',
            properties: {
              fontWeight: { type: 'string' },
              color: { type: 'string' },
              width: { type: 'number' },
            },
            additionalProperties: false,
          },
          valueStyle: {
            type: 'object',
            properties: { color: { type: 'string' } },
            additionalProperties: false,
          },
        },
        required: ['type'],
        additionalProperties: false,
      },
    },
  },
  required: ['metadata', 'content'],
  additionalProperties: false,
};

// Extract just the schema part for API usage
export function getSchemaForProvider(provider: 'openai' | 'anthropic') {
  if (provider === 'openai') {
    // Use strict: false because our schema has recursive types and polymorphic fields
    // that aren't fully compatible with OpenAI's strict mode limitations.
    // The Zod schema validation after response handles full validation.
    return {
      name: 'pdf_instructions',
      strict: false,
      schema: openAICompatibleSchema,
    };
  }
  // Anthropic tool format
  return {
    name: 'generate_pdf',
    description: 'Generate PDF document instructions based on the user request',
    input_schema: pdfInstructionsJsonSchema,
  };
}
