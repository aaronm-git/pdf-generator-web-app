'use client';

import { useEffect, useRef } from 'react';
import { PDFEditor, type PDFEditorRef } from '@/components/editor/pdf-editor';
import { useInstructions } from '@/contexts/instructions-context';

export default function EditorPage() {
  const { pendingInstructions, clearPendingInstructions } = useInstructions();
  const editorRef = useRef<PDFEditorRef>(null);

  useEffect(() => {
    if (pendingInstructions && editorRef.current) {
      editorRef.current.loadInstructions(pendingInstructions);
      clearPendingInstructions();
    }
  }, [pendingInstructions, clearPendingInstructions]);

  return (
    <div className="h-[calc(100vh-7rem)]">
      <PDFEditor ref={editorRef} />
    </div>
  );
}
