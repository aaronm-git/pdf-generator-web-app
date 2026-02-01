'use client';

import { useState, useCallback } from 'react';
import type { PDFInstructions } from '@/lib/pdf/schema';
import type { GenerationState, GenerationStatus } from '@/types/ai';

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
      // The server will fetch user settings from the database
      // No need to send API keys from the client
      const genResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
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
