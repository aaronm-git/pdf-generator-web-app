'use client';

import { useState, useMemo } from 'react';
import { History, Sparkles, FileEdit, Download, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
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
import { HistoryEntry } from '@/components/history/history-entry';
import { useDBHistory, useDeleteDBHistoryEntry, useCreateDocument } from '@/lib/swr';
import { toast } from 'sonner';
import type { HistoryEntry as HistoryEntryType } from '@/types/document';

type FilterTab = 'all' | 'ai-generated' | 'manual' | 'downloaded';

export default function HistoryPage() {
  const { entries, isLoading, error, mutate } = useDBHistory();
  const { deleteEntry } = useDeleteDBHistoryEntry();
  const { createDocument } = useCreateDocument();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Filter entries based on tab
  const filteredEntries = useMemo(() => {
    if (activeTab === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.type === activeTab);
  }, [entries, activeTab]);

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const handleSaveToDocuments = async (entry: HistoryEntryType) => {
    try {
      const name =
        entry.documentName ||
        entry.instructions.metadata.title ||
        'Untitled Document';
      await createDocument({
        name,
        instructions: entry.instructions,
      });
      toast.success('Document saved', {
        description: `"${name}" has been saved to your documents.`,
      });
    } catch (err) {
      toast.error('Failed to save document', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      // Delete all entries one by one (or we could add a bulk delete API)
      for (const entry of entries) {
        await deleteEntry(entry.id);
      }
      await mutate(); // Refresh the list
      toast.success('History cleared', {
        description: 'All history entries have been removed.',
      });
    } catch (err) {
      toast.error('Failed to clear history', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsClearing(false);
      setShowClearDialog(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">History</h2>
          <p className="text-muted-foreground">
            View your PDF generation history
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Failed to load history. Please refresh the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">History</h2>
            <p className="text-muted-foreground">
              View your PDF generation history
            </p>
          </div>
          {entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              Clear History
            </Button>
          )}
        </div>

        {/* Filters */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="ai-generated">
              <Sparkles className="mr-1 size-4" />
              AI Generated
            </TabsTrigger>
            <TabsTrigger value="manual">
              <FileEdit className="mr-1 size-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="downloaded">
              <Download className="mr-1 size-4" />
              Downloaded
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-6" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEntries.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <History className="size-12 text-muted-foreground/50" />
              {activeTab !== 'all' ? (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No {activeTab.replace('-', ' ')} entries found
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Try selecting a different filter
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No history yet
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Your generation history will appear here
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* History List */}
        {!isLoading && filteredEntries.length > 0 && (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onSaveToDocuments={handleSaveToDocuments}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear History Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {entries.length} history{' '}
              {entries.length === 1 ? 'entry' : 'entries'}. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearHistory}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? 'Clearing...' : 'Clear History'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
