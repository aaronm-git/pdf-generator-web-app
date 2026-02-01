'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserSettingsResponse } from '@/app/api/settings/route';

interface AISettingsState {
  useCustomApiKey: boolean;
  hasAnthropicKey: boolean;
  hasOpenaiKey: boolean;
  provider: string;
  model: string;
}

const DEFAULT_SETTINGS: AISettingsState = {
  useCustomApiKey: false,
  hasAnthropicKey: false,
  hasOpenaiKey: false,
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettingsState>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data: { settings: UserSettingsResponse } = await response.json();
          setSettings({
            useCustomApiKey: data.settings.useCustomApiKey,
            hasAnthropicKey: data.settings.hasAnthropicKey,
            hasOpenaiKey: data.settings.hasOpenaiKey,
            provider: data.settings.provider,
            model: data.settings.model,
          });
        }
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
      setIsLoaded(true);
    }
    loadSettings();
  }, []);

  // Check if AI can be used (either default or custom key is available)
  const hasAnyApiKey = useCallback(() => {
    // If not using custom key, the app's default configuration is available
    if (!settings.useCustomApiKey) {
      return true;
    }
    // If using custom key, check if the current provider has a key
    if (settings.provider === 'anthropic') {
      return settings.hasAnthropicKey;
    }
    return settings.hasOpenaiKey;
  }, [settings.useCustomApiKey, settings.provider, settings.hasAnthropicKey, settings.hasOpenaiKey]);

  // Check if the current provider has an API key configured
  const hasCurrentProviderApiKey = useCallback(() => {
    if (!settings.useCustomApiKey) {
      return true; // Using default configuration
    }
    if (settings.provider === 'anthropic') {
      return settings.hasAnthropicKey;
    }
    return settings.hasOpenaiKey;
  }, [settings.useCustomApiKey, settings.provider, settings.hasAnthropicKey, settings.hasOpenaiKey]);

  return {
    settings,
    isLoaded,
    hasAnyApiKey,
    hasCurrentProviderApiKey,
  };
}
