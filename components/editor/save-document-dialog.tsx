'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PDFInstructions } from '@/lib/pdf/schema';

interface SaveDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructions: PDFInstructions;
  onSave: (name: string, instructions: PDFInstructions) => Promise<void>;
  initialName?: string;
  isUpdate?: boolean;
}

export function SaveDocumentDialog({
  open,
  onOpenChange,
  instructions,
  onSave,
  initialName = '',
  isUpdate = false,
}: SaveDocumentDialogProps) {
  const [name, setName] = useState(initialName || instructions.metadata.title || 'Untitled Document');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset name when dialog opens
  useEffect(() => {
    if (open) {
      setName(initialName || instructions.metadata.title || 'Untitled Document');
      setError(null);
    }
  }, [open, initialName, instructions.metadata.title]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a document name');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(name.trim(), instructions);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update Document' : 'Save Document'}</DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update the saved document with your changes.'
              : 'Save your document to access it later from the Documents page.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Document Name</Label>
            <Input
              id="document-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter document name"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="size-4" />
            {isSaving ? 'Saving...' : isUpdate ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
