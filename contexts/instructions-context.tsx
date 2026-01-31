'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PDFInstructions } from '@/types/pdf';

interface InstructionsContextType {
  pendingInstructions: PDFInstructions | null;
  setPendingInstructions: (instructions: PDFInstructions | null) => void;
  clearPendingInstructions: () => void;
}

const InstructionsContext = createContext<InstructionsContextType | undefined>(undefined);

interface InstructionsProviderProps {
  children: ReactNode;
}

export function InstructionsProvider({ children }: InstructionsProviderProps) {
  const [pendingInstructions, setPendingInstructionsState] = useState<PDFInstructions | null>(null);

  const setPendingInstructions = useCallback((instructions: PDFInstructions | null) => {
    setPendingInstructionsState(instructions);
  }, []);

  const clearPendingInstructions = useCallback(() => {
    setPendingInstructionsState(null);
  }, []);

  return (
    <InstructionsContext.Provider
      value={{
        pendingInstructions,
        setPendingInstructions,
        clearPendingInstructions,
      }}
    >
      {children}
    </InstructionsContext.Provider>
  );
}

export function useInstructions() {
  const context = useContext(InstructionsContext);
  if (context === undefined) {
    throw new Error('useInstructions must be used within an InstructionsProvider');
  }
  return context;
}
