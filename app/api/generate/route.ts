import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { generateObject } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { auth } from '@/lib/auth';
import { getUserSettings } from '@/lib/db/user-settings';
import { pdfInstructionsSchema } from '@/lib/pdf/schema';
import { buildSystemPrompt } from '@/lib/ai/prompt-builder';
import type { AIProvider } from '@/types/ai-settings';

// Get default AI configuration from environment
const DEFAULT_PROVIDER =
  (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'anthropic';
const DEFAULT_MODEL =
  process.env.DEFAULT_AI_MODEL || 'claude-sonnet-4-20250514';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, options } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get user's settings from database
    const userSettings = await getUserSettings(session.user.id);

    let selectedProvider: AIProvider;
    let selectedModel: string;
    let effectiveApiKey: string | undefined;

    if (userSettings?.useCustomApiKey) {
      // User wants to use their own API key
      selectedProvider = (userSettings.provider as AIProvider) || 'anthropic';
      selectedModel =
        userSettings.model ||
        (selectedProvider === 'anthropic'
          ? 'claude-sonnet-4-20250514'
          : 'gpt-4o');

      effectiveApiKey =
        selectedProvider === 'anthropic'
          ? userSettings.anthropicApiKey ?? undefined
          : userSettings.openaiApiKey ?? undefined;

      if (!effectiveApiKey) {
        return NextResponse.json(
          {
            error: `You've enabled custom API key mode but haven't provided an API key for ${selectedProvider === 'anthropic' ? 'Anthropic' : 'OpenAI'}. Please add it in Settings.`,
          },
          { status: 400 }
        );
      }
    } else {
      // Use app default configuration
      selectedProvider = DEFAULT_PROVIDER;
      selectedModel = DEFAULT_MODEL;
      effectiveApiKey =
        selectedProvider === 'anthropic'
          ? process.env.ANTHROPIC_API_KEY
          : process.env.OPENAI_API_KEY;

      if (!effectiveApiKey) {
        return NextResponse.json(
          {
            error: 'AI service is not configured. Please contact the administrator.',
          },
          { status: 500 }
        );
      }
    }

    const aiModel =
      selectedProvider === 'anthropic'
        ? createAnthropic({ apiKey: effectiveApiKey })(selectedModel)
        : createOpenAI({ apiKey: effectiveApiKey })(selectedModel);

    const { object: instructions } = await generateObject({
      model: aiModel,
      schema: pdfInstructionsSchema,
      system: buildSystemPrompt(options),
      prompt,
      maxRetries: 2,
    });

    return NextResponse.json({
      success: true,
      instructions,
    });
  } catch (error) {
    console.error('Generation error:', error);

    if (
      error instanceof Error &&
      error.message.includes('does not match schema')
    ) {
      return NextResponse.json(
        {
          error:
            'AI generated invalid content. Please try again with a more specific prompt.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
