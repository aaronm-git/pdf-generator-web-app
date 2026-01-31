'use client';

import { useState, useCallback } from 'react';
import type { PDFInstructions } from '@/types/pdf';
import type { GenerationState, GenerationStatus } from '@/types/ai';
import type { AISettings } from '@/types/ai-settings';

const STORAGE_KEY = 'pdf-generator-ai-settings';

function getAISettings(): AISettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load AI settings:', error);
  }
  return null;
}

export function usePDFGeneration() {
  const [state, setState] = useState<GenerationState>({
    status: 'idle',
    instructions: null,
    pdfData: null,
    error: null,
  });

  const setStatus = useCallback((status: GenerationStatus) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const generate = useCallback(async (prompt: string): Promise<PDFInstructions> => {
    setState((prev) => ({ ...prev, status: 'generating', error: null }));

    try {
      // Get AI settings from localStorage
      const settings = getAISettings();
      const provider = settings?.provider || 'anthropic';
      const model = settings?.model || (provider === 'anthropic' ? 'claude-sonnet-4-20250514' : 'gpt-4o');
      const apiKey = provider === 'anthropic'
        ? settings?.anthropicApiKey
        : settings?.openaiApiKey;

      // Get AI instructions only (no PDF render)
      const genResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider,
          model,
          apiKey,
        }),
      });

      if (!genResponse.ok) {
        const errorData = await genResponse.json();
        throw new Error(errorData.error || 'Failed to generate instructions');
      }

      const { instructions } = await genResponse.json();
      setState((prev) => ({
        ...prev,
        instructions,
        status: 'complete',
      }));

      return instructions;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      instructions: null,
      pdfData: null,
      error: null,
    });
  }, []);

  const setInstructions = useCallback((instructions: PDFInstructions) => {
    setState((prev) => ({ ...prev, instructions }));
  }, []);

  const setPdfData = useCallback((pdfData: string) => {
    setState((prev) => ({ ...prev, pdfData }));
  }, []);

  return {
    ...state,
    generate,
    reset,
    setStatus,
    setInstructions,
    setPdfData,
  };
}
