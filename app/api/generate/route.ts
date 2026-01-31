import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { z } from 'zod';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';
import { buildSystemPrompt } from '@/lib/ai/prompt-builder';
import { getSchemaForProvider } from '@/lib/ai/schema-generator';
import type { AIProvider } from '@/types/ai-settings';

// Valid element types for sanitization
const VALID_ELEMENT_TYPES = [
  'heading', 'paragraph', 'list', 'caption', 'callout', 'codeBlock',
  'section', 'columns', 'spacer', 'divider', 'pageBreak',
  'table', 'keyValue',
  'barChart', 'lineChart', 'pieChart',
  'image'
];

// Helper to format Zod errors into user-friendly messages
function formatZodError(error: z.ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.join('.');
    if (issue.code === 'invalid_union' || issue.code === 'invalid_element') {
      return `Invalid element at "${path}": element type is not recognized or missing required fields`;
    }
    if (issue.code === 'invalid_type') {
      return `Invalid type at "${path}": expected ${issue.expected}`;
    }
    if (issue.code === 'invalid_value') {
      return `Invalid value at "${path}"`;
    }
    return `Error at "${path}": ${issue.code}`;
  });

  const uniqueIssues = [...new Set(issues)].slice(0, 3);
  return uniqueIssues.join('; ');
}

// Recursively sanitize a single element
function sanitizeElement(element: Record<string, unknown>): Record<string, unknown> | null {
  if (!element || typeof element !== 'object') return null;

  const type = element.type as string | undefined;
  if (!type || !VALID_ELEMENT_TYPES.includes(type)) {
    console.warn(`Filtering out invalid element type: ${type}`, JSON.stringify(element).slice(0, 200));
    return null;
  }

  const el = { ...element };

  switch (el.type) {
    case 'heading':
      if (!el.content) el.content = '';
      if (!el.level || typeof el.level !== 'number' || el.level < 1 || el.level > 6) {
        el.level = 2;
      }
      break;

    case 'paragraph':
      if (!el.content) el.content = '';
      break;

    case 'list':
      if (!el.variant) el.variant = 'unordered';
      if (!Array.isArray(el.items)) {
        el.items = [];
      } else {
        el.items = (el.items as unknown[]).map((item) => String(item ?? ''));
      }
      break;

    case 'caption':
      if (!el.content) el.content = '';
      break;

    case 'section':
      if (!Array.isArray(el.children)) {
        el.children = [];
      } else {
        el.children = (el.children as Record<string, unknown>[])
          .map(sanitizeElement)
          .filter((child): child is Record<string, unknown> => child !== null);
      }
      break;

    case 'columns':
      if (!Array.isArray(el.columns)) {
        el.columns = [];
      } else {
        el.columns = (el.columns as Record<string, unknown>[]).map((col) => ({
          width: typeof col?.width === 'number' ? col.width : 50,
          children: Array.isArray(col?.children)
            ? (col.children as Record<string, unknown>[])
                .map(sanitizeElement)
                .filter((child): child is Record<string, unknown> => child !== null)
            : [],
        }));
      }
      break;

    case 'spacer':
      if (typeof el.height !== 'number') el.height = 20;
      break;

    case 'table':
      if (!Array.isArray(el.headers)) el.headers = [];
      if (!Array.isArray(el.rows)) el.rows = [];
      el.headers = (el.headers as unknown[]).map((h) => String(h ?? ''));
      el.rows = (el.rows as unknown[][]).map((row) =>
        Array.isArray(row) ? row.map((cell) => String(cell ?? '')) : []
      );
      break;

    case 'keyValue':
      if (!Array.isArray(el.items)) {
        el.items = [];
      } else {
        el.items = (el.items as Record<string, unknown>[]).map((item) => ({
          key: String(item?.key ?? ''),
          value: String(item?.value ?? ''),
        }));
      }
      break;

    case 'barChart':
    case 'pieChart':
      if (!Array.isArray(el.data)) {
        el.data = [];
      } else {
        el.data = (el.data as Record<string, unknown>[]).map((d) => ({
          label: String(d?.label ?? ''),
          value: typeof d?.value === 'number' ? d.value : 0,
          ...(d?.color ? { color: String(d.color) } : {}),
        }));
      }
      break;

    case 'lineChart':
      if (!Array.isArray(el.data)) {
        el.data = [];
      } else {
        el.data = (el.data as Record<string, unknown>[]).map((series) => ({
          label: String(series?.label ?? ''),
          values: Array.isArray(series?.values)
            ? (series.values as Record<string, unknown>[]).map((v) => ({
                x: v?.x ?? '',
                y: typeof v?.y === 'number' ? v.y : 0,
              }))
            : [],
          ...(series?.color ? { color: String(series.color) } : {}),
        }));
      }
      break;

    case 'image':
      if (!el.src) el.src = '';
      break;

    case 'callout':
      if (!el.content) el.content = '';
      if (!el.variant || !['info', 'warning', 'success', 'error', 'quote'].includes(el.variant as string)) {
        el.variant = 'info';
      }
      break;

    case 'codeBlock':
      if (!el.code) el.code = '';
      if (el.language && typeof el.language !== 'string') {
        el.language = undefined;
      }
      break;
  }

  return el;
}

// Sanitize and fix common AI generation issues
function sanitizeInstructions(instructions: Record<string, unknown>): Record<string, unknown> {
  if (!instructions || typeof instructions !== 'object') {
    return instructions;
  }

  if (!Array.isArray(instructions.content)) {
    instructions.content = [];
  }

  instructions.content = (instructions.content as Record<string, unknown>[])
    .map(sanitizeElement)
    .filter((element): element is Record<string, unknown> => element !== null);

  if (!instructions.metadata || typeof instructions.metadata !== 'object') {
    instructions.metadata = { title: 'Untitled Document' };
  } else if (!(instructions.metadata as { title?: string }).title) {
    (instructions.metadata as { title: string }).title = 'Untitled Document';
  }

  return instructions;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, options, provider, model, apiKey } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const selectedProvider: AIProvider = provider || 'anthropic';
    const selectedModel = model || (selectedProvider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o');

    const effectiveApiKey = apiKey || (selectedProvider === 'anthropic'
      ? process.env.ANTHROPIC_API_KEY
      : process.env.OPENAI_API_KEY);

    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: `API key for ${selectedProvider === 'anthropic' ? 'Anthropic' : 'OpenAI'} is not configured. Please add it in Settings.` },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(options);

    let instructions: Record<string, unknown>;

    if (selectedProvider === 'anthropic') {
      instructions = await generateWithAnthropic(effectiveApiKey, selectedModel, systemPrompt, prompt);
    } else {
      instructions = await generateWithOpenAI(effectiveApiKey, selectedModel, systemPrompt, prompt);
    }

    // Sanitize for edge cases (structured output should handle most issues)
    const sanitized = sanitizeInstructions(instructions);

    console.log('Sanitized content types:', (sanitized.content as Record<string, unknown>[]).map((el, i) => `${i}: ${el.type}`));

    // Validate against schema
    const validated = pdfInstructionsSchema.parse(sanitized);

    return NextResponse.json({
      success: true,
      instructions: validated,
    });
  } catch (error) {
    console.error('Generation error:', error);

    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', JSON.stringify(error.issues, null, 2));
      const formattedError = formatZodError(error);
      return NextResponse.json(
        {
          error: `AI generated invalid content: ${formattedError}. Please try again with a more specific prompt.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Generation failed',
      },
      { status: 500 }
    );
  }
}

async function generateWithAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const anthropic = new Anthropic({ apiKey });

  const toolSchema = getSchemaForProvider('anthropic');

  const response = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    tools: [toolSchema as Anthropic.Tool],
    tool_choice: { type: 'tool', name: 'generate_pdf' },
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('No tool use in response');
  }

  return toolUse.input as Record<string, unknown>;
}

async function generateWithOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const openai = new OpenAI({ apiKey });

  const jsonSchema = getSchemaForProvider('openai');

  const response = await openai.chat.completions.create({
    model,
    max_tokens: 8192,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: jsonSchema,
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}
