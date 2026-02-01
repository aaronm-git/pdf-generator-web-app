export type AIProvider = 'anthropic' | 'openai';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export const ANTHROPIC_MODELS: AIModel[] = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
];

export const OPENAI_MODELS: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
];

export interface AISettings {
  /** Whether to use custom API key (true) or app default (false) */
  useCustomApiKey: boolean;
  provider: AIProvider;
  model: string;
  anthropicApiKey: string;
  openaiApiKey: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  useCustomApiKey: false,
  provider: 'anthropic',
  model: 'claude-sonnet-4-20250514',
  anthropicApiKey: '',
  openaiApiKey: '',
};

export function getModelsForProvider(provider: AIProvider): AIModel[] {
  return provider === 'anthropic' ? ANTHROPIC_MODELS : OPENAI_MODELS;
}

export function getDefaultModelForProvider(provider: AIProvider): string {
  return provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o';
}
