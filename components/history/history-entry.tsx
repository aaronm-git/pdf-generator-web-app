'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Sparkles,
  FileEdit,
  Download,
  MoreVertical,
  ExternalLink,
  Save,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useEditorStore, useUIStore } from '@/lib/store';
import type { HistoryEntry as HistoryEntryType } from '@/types/document';

interface HistoryEntryProps {
  entry: HistoryEntryType;
  onDelete: (id: string) => Promise<void>;
  onSaveToDocuments: (entry: HistoryEntryType) => Promise<void>;
}

const typeConfig = {
  'ai-generated': {
    icon: Sparkles,
    label: 'AI Generated',
    variant: 'default' as const,
  },
  manual: {
    icon: FileEdit,
    label: 'Manual',
    variant: 'secondary' as const,
  },
  downloaded: {
    icon: Download,
    label: 'Downloaded',
    variant: 'outline' as const,
  },
};

export function HistoryEntry({
  entry,
  onDelete,
  onSaveToDocuments,
}: HistoryEntryProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Stores
  const entity = useEditorStore((s) => s.entity);
  const loadFromHistory = useEditorStore((s) => s.loadFromHistory);
  const hasUnsavedWork = useEditorStore((s) => s.hasUnsavedWork);
  const showUnsavedChangesModal = useUIStore((s) => s.showUnsavedChangesModal);

  const config = typeConfig[entry.type];
  const Icon = config.icon;

  const handleOpen = () => {
    const performLoad = () => {
      loadFromHistory(entry.id, entry.instructions, entry.documentName);
      router.push('/editor');
    };

    // Check for unsaved changes
    if (entity && hasUnsavedWork()) {
      showUnsavedChangesModal(entity.name, performLoad);
    } else {
      performLoad();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(entry.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveToDocuments = async () => {
    setIsSaving(true);
    try {
      await onSaveToDocuments(entry);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail or Icon */}
            {entry.thumbnail ? (
              <div className="relative h-26 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img
                  src={entry.thumbnail}
                  alt={entry.documentName || 'Document preview'}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5 text-muted-foreground" />
              </div>
            )}

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant={config.variant}>{config.label}</Badge>
                {entry.documentName && (
                  <span className="truncate text-sm font-medium">
                    {entry.documentName}
                  </span>
                )}
              </div>

              {entry.prompt && (
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                  {entry.prompt}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time
                  dateTime={entry.createdAt}
                  title={format(new Date(entry.createdAt), 'PPpp')}
                >
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })}
                </time>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="ghost" size="icon-sm" onClick={handleOpen}>
                <ExternalLink className="size-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpen}>
                    <ExternalLink />
                    Open in Editor
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSaveToDocuments}
                    disabled={isSaving}
                  >
                    <Save />
                    {isSaving ? 'Saving...' : 'Save to Documents'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete History Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this history entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
