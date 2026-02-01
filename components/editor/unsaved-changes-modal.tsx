'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';
import { useEditorStore } from '@/lib/store/editor-store';
import { useCreateDocument, useUpdateDocument } from '@/lib/swr/use-documents';
import { toast } from 'sonner';

export function UnsavedChangesModal() {
  const [isSaving, setIsSaving] = useState(false);

  // UI Store
  const unsavedChangesModal = useUIStore((s) => s.unsavedChangesModal);
  const closeUnsavedChangesModal = useUIStore((s) => s.closeUnsavedChangesModal);
  const confirmDiscardChanges = useUIStore((s) => s.confirmDiscardChanges);

  // Editor Store
  const entity = useEditorStore((s) => s.entity);
  const markAsSaved = useEditorStore((s) => s.markAsSaved);

  // SWR Mutations
  const { createDocument } = useCreateDocument();
  const { updateDocument } = useUpdateDocument();

  const handleSaveAndContinue = async () => {
    if (!entity) return;

    setIsSaving(true);

    try {
      // Save to DB
      if (entity.origin.type === 'db') {
        await updateDocument({
          id: entity.origin.documentId,
          updates: {
            name: entity.name,
            instructions: entity.instructions,
          },
        });
        markAsSaved(entity.origin.documentId);
        toast.success('Document saved');
      } else {
        const result = await createDocument({
          name: entity.name,
          instructions: entity.instructions,
        });
        if (result?.document) {
          markAsSaved(result.document.id);
          toast.success('Document saved');
        }
      }

      // Continue with pending action
      confirmDiscardChanges();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardAndContinue = () => {
    confirmDiscardChanges();
  };

  return (
    <AlertDialog
      open={unsavedChangesModal.isOpen}
      onOpenChange={(open) => !open && closeUnsavedChangesModal()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes to &quot;{unsavedChangesModal.entityName}&quot;.
            What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <Button
            variant="outline"
            onClick={handleDiscardAndContinue}
            disabled={isSaving}
          >
            Discard & Continue
          </Button>
          <AlertDialogAction
            onClick={handleSaveAndContinue}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Continue'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
