'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AISettings,
  DEFAULT_AI_SETTINGS,
  AIProvider,
  getDefaultModelForProvider,
} from '@/types/ai-settings';

const STORAGE_KEY = 'pdf-generator-ai-settings';

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_AI_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save AI settings:', error);
      }
      return updated;
    });
  }, []);

  // Update provider and reset model to default for that provider
  const setProvider = useCallback((provider: AIProvider) => {
    saveSettings({
      provider,
      model: getDefaultModelForProvider(provider),
    });
  }, [saveSettings]);

  // Update model
  const setModel = useCallback((model: string) => {
    saveSettings({ model });
  }, [saveSettings]);

  // Update API keys
  const setAnthropicApiKey = useCallback((apiKey: string) => {
    saveSettings({ anthropicApiKey: apiKey });
  }, [saveSettings]);

  const setOpenaiApiKey = useCallback((apiKey: string) => {
    saveSettings({ openaiApiKey: apiKey });
  }, [saveSettings]);

  // Get the current API key for the selected provider
  const getCurrentApiKey = useCallback(() => {
    return settings.provider === 'anthropic'
      ? settings.anthropicApiKey
      : settings.openaiApiKey;
  }, [settings.provider, settings.anthropicApiKey, settings.openaiApiKey]);

  return {
    settings,
    isLoaded,
    setProvider,
    setModel,
    setAnthropicApiKey,
    setOpenaiApiKey,
    getCurrentApiKey,
    saveSettings,
  };
}
