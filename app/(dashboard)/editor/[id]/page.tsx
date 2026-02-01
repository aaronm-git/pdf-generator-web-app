'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFEditor } from '@/components/editor/pdf-editor';
import { useDocument } from '@/lib/swr';
import { useEditorStore, useUIStore } from '@/lib/store';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditorWithDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;
  const hasLoadedRef = useRef(false);

  // SWR for fetching document
  const { document, isLoading, error } = useDocument(documentId);

  // Stores
  const entity = useEditorStore((s) => s.entity);
  const loadFromDB = useEditorStore((s) => s.loadFromDB);
  const hasUnsavedWork = useEditorStore((s) => s.hasUnsavedWork);
  const showUnsavedChangesModal = useUIStore((s) => s.showUnsavedChangesModal);

  useEffect(() => {
    if (!document || hasLoadedRef.current) return;

    // Check if we're already editing this document
    if (
      entity?.origin.type === 'db' &&
      entity.origin.documentId === documentId
    ) {
      hasLoadedRef.current = true;
      return; // Already editing this document
    }

    const performLoad = () => {
      loadFromDB(documentId, document.name, document.instructions);
      hasLoadedRef.current = true;
    };

    // Check for unsaved changes
    if (entity && hasUnsavedWork()) {
      showUnsavedChangesModal(entity.name, performLoad);
    } else {
      performLoad();
    }
  }, [
    document,
    documentId,
    entity,
    loadFromDB,
    hasUnsavedWork,
    showUnsavedChangesModal,
  ]);

  // Reset the loaded ref when documentId changes
  useEffect(() => {
    hasLoadedRef.current = false;
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="space-y-4 text-center">
          <Spinner className="mx-auto size-8" />
          <p className="text-sm text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={() => router.push('/documents')}>
                Back to Documents
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)]">
      <PDFEditor />
    </div>
  );
}
