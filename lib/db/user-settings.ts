import { sql } from '@/lib/db';
import { decrypt } from '@/lib/utils/encryption';

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

export interface DecryptedUserSettings {
  useCustomApiKey: boolean;
  provider: string;
  model: string;
  anthropicApiKey: string | null;
  openaiApiKey: string | null;
}

/**
 * Get user settings with decrypted API keys.
 * Only call this on the server-side.
 */
export async function getUserSettings(
  userId: string
): Promise<DecryptedUserSettings | null> {
  try {
    const rows = await sql`
      SELECT * FROM user_settings WHERE user_id = ${userId}
    `;

    if (rows.length === 0) {
      return null;
    }

    const settings = rows[0];

    let anthropicApiKey: string | null = null;
    let openaiApiKey: string | null = null;

    if (settings.anthropic_api_key_encrypted) {
      try {
        anthropicApiKey = decrypt(settings.anthropic_api_key_encrypted);
      } catch {
        // Decryption failed
      }
    }

    if (settings.openai_api_key_encrypted) {
      try {
        openaiApiKey = decrypt(settings.openai_api_key_encrypted);
      } catch {
        // Decryption failed
      }
    }

    return {
      useCustomApiKey: settings.use_custom_api_key,
      provider: settings.ai_provider,
      model: settings.ai_model,
      anthropicApiKey,
      openaiApiKey,
    };
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return null;
  }
}
