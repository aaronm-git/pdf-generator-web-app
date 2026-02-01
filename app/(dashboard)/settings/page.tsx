'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Key, Eye, EyeOff, Check, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AIProvider,
  getModelsForProvider,
  getDefaultModelForProvider,
} from '@/types/ai-settings';
import type { UserSettingsResponse } from '@/app/api/settings/route';

interface SettingsState {
  useCustomApiKey: boolean;
  provider: AIProvider;
  model: string;
  anthropicApiKeyMasked: string;
  openaiApiKeyMasked: string;
  hasAnthropicKey: boolean;
  hasOpenaiKey: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  useCustomApiKey: false,
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  anthropicApiKeyMasked: '',
  openaiApiKeyMasked: '',
  hasAnthropicKey: false,
  hasOpenaiKey: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For editing API keys - empty string means use existing, a value means replace
  const [anthropicKeyInput, setAnthropicKeyInput] = useState('');
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        const data: { settings: UserSettingsResponse } = await response.json();
        setSettings({
          useCustomApiKey: data.settings.useCustomApiKey,
          provider: data.settings.provider as AIProvider,
          model: data.settings.model,
          anthropicApiKeyMasked: data.settings.anthropicApiKeyMasked,
          openaiApiKeyMasked: data.settings.openaiApiKeyMasked,
          hasAnthropicKey: data.settings.hasAnthropicKey,
          hasOpenaiKey: data.settings.hasOpenaiKey,
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Save settings to API
  const saveSettings = useCallback(async (updates: Partial<{
    useCustomApiKey: boolean;
    provider: string;
    model: string;
    anthropicApiKey: string | null;
    openaiApiKey: string | null;
  }>) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Reload settings to get updated masked keys
      const reloadResponse = await fetch('/api/settings');
      if (reloadResponse.ok) {
        const data: { settings: UserSettingsResponse } = await reloadResponse.json();
        setSettings({
          useCustomApiKey: data.settings.useCustomApiKey,
          provider: data.settings.provider as AIProvider,
          model: data.settings.model,
          anthropicApiKeyMasked: data.settings.anthropicApiKeyMasked,
          openaiApiKeyMasked: data.settings.openaiApiKeyMasked,
          hasAnthropicKey: data.settings.hasAnthropicKey,
          hasOpenaiKey: data.settings.hasOpenaiKey,
        });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleUseCustomKeyChange = async (useCustom: boolean) => {
    setSettings(prev => ({ ...prev, useCustomApiKey: useCustom }));
    await saveSettings({ useCustomApiKey: useCustom });
  };

  const handleProviderChange = async (provider: AIProvider) => {
    const newModel = getDefaultModelForProvider(provider);
    setSettings(prev => ({ ...prev, provider, model: newModel }));
    await saveSettings({ provider, model: newModel });
  };

  const handleModelChange = async (model: string) => {
    setSettings(prev => ({ ...prev, model }));
    await saveSettings({ model });
  };

  const handleSaveAnthropicKey = async () => {
    if (!anthropicKeyInput) return;
    await saveSettings({ anthropicApiKey: anthropicKeyInput });
    setAnthropicKeyInput('');
  };

  const handleSaveOpenaiKey = async () => {
    if (!openaiKeyInput) return;
    await saveSettings({ openaiApiKey: openaiKeyInput });
    setOpenaiKeyInput('');
  };

  const handleClearAnthropicKey = async () => {
    await saveSettings({ anthropicApiKey: null });
  };

  const handleClearOpenaiKey = async () => {
    await saveSettings({ openaiApiKey: null });
  };

  const models = getModelsForProvider(settings.provider);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your AI provider and API keys
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="size-4" />
              Saved
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </div>
      </div>

      {/* Default AI Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5" />
            AI Generation
          </CardTitle>
          <CardDescription>
            AI features are enabled by default using the app&apos;s built-in configuration.
            You can optionally use your own API key for more control.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              {!settings.useCustomApiKey ? (
                <>
                  <strong className="text-green-600">AI is ready to use.</strong>{' '}
                  You&apos;re using the app&apos;s default AI configuration. No setup required.
                </>
              ) : (
                <>
                  <strong className="text-blue-600">Using your custom API key.</strong>{' '}
                  You&apos;ve enabled custom API key mode. Make sure to configure your keys below.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="use-custom-key" className="text-base">
                Use my own API key
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable this to use your own API key and choose your preferred model
              </p>
            </div>
            <Switch
              id="use-custom-key"
              checked={settings.useCustomApiKey}
              onCheckedChange={handleUseCustomKeyChange}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom API Key Settings - Only show when toggle is ON */}
      {settings.useCustomApiKey && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                AI Provider Settings
              </CardTitle>
              <CardDescription>
                Choose which AI provider and model to use for PDF generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="provider">AI Provider</Label>
                  <Select
                    value={settings.provider}
                    onValueChange={(v) => handleProviderChange(v as AIProvider)}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={settings.model}
                    onValueChange={handleModelChange}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="size-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Enter your API keys to use each provider. Keys are encrypted and stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                {settings.hasAnthropicKey ? (
                  <div className="flex gap-2">
                    <Input
                      value={settings.anthropicApiKeyMasked}
                      disabled
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={handleClearAnthropicKey}
                      disabled={isSaving}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="anthropic-key"
                        type={showAnthropicKey ? 'text' : 'password'}
                        value={anthropicKeyInput}
                        onChange={(e) => setAnthropicKeyInput(e.target.value)}
                        placeholder="sk-ant-..."
                        className="pr-10"
                        disabled={isSaving}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                      >
                        {showAnthropicKey ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleSaveAnthropicKey}
                      disabled={!anthropicKeyInput || isSaving}
                    >
                      Save
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                {settings.hasOpenaiKey ? (
                  <div className="flex gap-2">
                    <Input
                      value={settings.openaiApiKeyMasked}
                      disabled
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={handleClearOpenaiKey}
                      disabled={isSaving}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="openai-key"
                        type={showOpenaiKey ? 'text' : 'password'}
                        value={openaiKeyInput}
                        onChange={(e) => setOpenaiKeyInput(e.target.value)}
                        placeholder="sk-..."
                        className="pr-10"
                        disabled={isSaving}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      >
                        {showOpenaiKey ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      onClick={handleSaveOpenaiKey}
                      disabled={!openaiKeyInput || isSaving}
                    >
                      Save
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>

              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> API keys are encrypted and stored securely in our database.
                  They are only decrypted server-side when making API calls.
                  {settings.provider === 'anthropic' && !settings.hasAnthropicKey && (
                    <span className="mt-2 block text-amber-600">
                      You need to add an Anthropic API key to use Claude models.
                    </span>
                  )}
                  {settings.provider === 'openai' && !settings.hasOpenaiKey && (
                    <span className="mt-2 block text-amber-600">
                      You need to add an OpenAI API key to use GPT models.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
