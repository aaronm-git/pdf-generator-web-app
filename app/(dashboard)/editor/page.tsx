'use client';

import { useEffect } from 'react';
import { PDFEditor } from '@/components/editor/pdf-editor';
import { useEditorStore } from '@/lib/store';

export default function EditorPage() {
  const entity = useEditorStore((s) => s.entity);
  const createNewEntity = useEditorStore((s) => s.createNewEntity);

  // Ensure we have an entity on mount
  useEffect(() => {
    if (!entity) {
      createNewEntity();
    }
  }, [entity, createNewEntity]);

  return (
    <div className="h-[calc(100vh-7rem)]">
      <PDFEditor />
    </div>
  );
}
