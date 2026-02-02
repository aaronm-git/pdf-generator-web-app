import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';
import { encrypt, decrypt, maskApiKey } from '@/lib/utils/encryption';
import { generateId } from '@/lib/utils/id';

interface UserSettingsRow {
  id: string;
  user_id: string;
  use_custom_api_key: boolean;
  ai_provider: string;
  ai_model: string;
  anthropic_api_key_encrypted: string | null;
  openai_api_key_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsResponse {
  useCustomApiKey: boolean;
  provider: string;
  model: string;
  anthropicApiKeyMasked: string;
  openaiApiKeyMasked: string;
  hasAnthropicKey: boolean;
  hasOpenaiKey: boolean;
}

/**
 * GET /api/settings
 * Get the current user's settings with masked API keys.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const rows = await sql<UserSettingsRow>`
      SELECT * FROM user_settings WHERE user_id = ${userId}
    `;

    if (rows.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          useCustomApiKey: false,
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          anthropicApiKeyMasked: '',
          openaiApiKeyMasked: '',
          hasAnthropicKey: false,
          hasOpenaiKey: false,
        } as UserSettingsResponse,
      });
    }

    const settings = rows[0];

    // Decrypt and mask API keys
    let anthropicKeyMasked = '';
    let openaiKeyMasked = '';
    let hasAnthropicKey = false;
    let hasOpenaiKey = false;

    if (settings.anthropic_api_key_encrypted) {
      try {
        const decrypted = decrypt(settings.anthropic_api_key_encrypted);
        anthropicKeyMasked = maskApiKey(decrypted);
        hasAnthropicKey = true;
      } catch {
        // Key decryption failed, treat as no key
      }
    }

    if (settings.openai_api_key_encrypted) {
      try {
        const decrypted = decrypt(settings.openai_api_key_encrypted);
        openaiKeyMasked = maskApiKey(decrypted);
        hasOpenaiKey = true;
      } catch {
        // Key decryption failed, treat as no key
      }
    }

    return NextResponse.json({
      settings: {
        useCustomApiKey: settings.use_custom_api_key,
        provider: settings.ai_provider,
        model: settings.ai_model,
        anthropicApiKeyMasked: anthropicKeyMasked,
        openaiApiKeyMasked: openaiKeyMasked,
        hasAnthropicKey,
        hasOpenaiKey,
      } as UserSettingsResponse,
    });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

interface UpdateSettingsInput {
  useCustomApiKey?: boolean;
  provider?: string;
  model?: string;
  anthropicApiKey?: string | null;
  openaiApiKey?: string | null;
}

/**
 * PUT /api/settings
 * Update the current user's settings. API keys are encrypted before storage.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body: UpdateSettingsInput = await request.json();

    // Check if settings exist
    const { rows: existingRows } = await sql<UserSettingsRow>`
      SELECT * FROM user_settings WHERE user_id = ${userId}
    `;

    const now = new Date().toISOString();

    if (existingRows.length === 0) {
      // Create new settings
      const id = generateId();

      let anthropicEncrypted: string | null = null;
      let openaiEncrypted: string | null = null;

      if (body.anthropicApiKey) {
        anthropicEncrypted = encrypt(body.anthropicApiKey);
      }
      if (body.openaiApiKey) {
        openaiEncrypted = encrypt(body.openaiApiKey);
      }

      await sql`
        INSERT INTO user_settings (
          id, user_id, use_custom_api_key, ai_provider, ai_model,
          anthropic_api_key_encrypted, openai_api_key_encrypted,
          created_at, updated_at
        )
        VALUES (
          ${id},
          ${userId},
          ${body.useCustomApiKey ?? false},
          ${body.provider ?? 'anthropic'},
          ${body.model ?? 'claude-sonnet-4-20250514'},
          ${anthropicEncrypted},
          ${openaiEncrypted},
          ${now},
          ${now}
        )
      `;
    } else {
      // Update existing settings
      const existing = existingRows[0];

      let anthropicEncrypted = existing.anthropic_api_key_encrypted;
      let openaiEncrypted = existing.openai_api_key_encrypted;

      // Only update API keys if explicitly provided
      if (body.anthropicApiKey !== undefined) {
        anthropicEncrypted = body.anthropicApiKey
          ? encrypt(body.anthropicApiKey)
          : null;
      }
      if (body.openaiApiKey !== undefined) {
        openaiEncrypted = body.openaiApiKey ? encrypt(body.openaiApiKey) : null;
      }

      await sql`
        UPDATE user_settings
        SET
          use_custom_api_key = ${body.useCustomApiKey ?? existing.use_custom_api_key},
          ai_provider = ${body.provider ?? existing.ai_provider},
          ai_model = ${body.model ?? existing.ai_model},
          anthropic_api_key_encrypted = ${anthropicEncrypted},
          openai_api_key_encrypted = ${openaiEncrypted},
          updated_at = ${now}
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
