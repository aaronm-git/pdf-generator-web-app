'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, Search, Star, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { DocumentCard } from '@/components/documents/document-card';
import {
  useDocuments,
  useDeleteDocument,
  useUpdateDocument,
} from '@/lib/swr';

type FilterTab = 'all' | 'favorites';

export default function DocumentsPage() {
  const { documents, isLoading, error } = useDocuments();
  const { deleteDocument } = useDeleteDocument();
  const { updateDocument } = useUpdateDocument();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Filter documents based on search and tab
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by tab
    if (activeTab === 'favorites') {
      filtered = filtered.filter((doc) => doc.favorite);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [documents, searchQuery, activeTab]);

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
  };

  const handleToggleFavorite = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (doc) {
      await updateDocument({ id, updates: { favorite: !doc.favorite } });
    }
  };

  const handleRename = async (id: string, newName: string) => {
    await updateDocument({ id, updates: { name: newName } });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            View and manage your generated PDFs
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-sm text-destructive">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Please check your database connection and try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            View and manage your generated PDFs
          </p>
        </div>
        <Button asChild>
          <Link href="/editor">
            <Plus />
            New Document
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="mr-1 size-4" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <Spinner className="size-6" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="size-12 text-muted-foreground/50" />
            {searchQuery || activeTab === 'favorites' ? (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  No matching documents found
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted-foreground">
                  No documents yet
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Documents you save will appear here
                </p>
                <Button asChild className="mt-4">
                  <Link href="/editor">
                    <Plus />
                    Create your first document
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Grid */}
      {!isLoading && filteredDocuments.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
              onRename={handleRename}
            />
          ))}
        </div>
      )}
    </div>
  );
}
