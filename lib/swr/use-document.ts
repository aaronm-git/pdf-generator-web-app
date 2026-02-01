import useSWR from 'swr';
import { SWR_KEYS } from './keys';
import { fetcher } from './fetchers';
import type { SavedDocument } from '@/types/document';

interface DocumentResponse {
  document: SavedDocument;
}

/**
 * Fetch a single document by ID.
 * Pass null to skip fetching.
 */
export function useDocument(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DocumentResponse>(
    id ? SWR_KEYS.DOCUMENT(id) : null,
    fetcher
  );

  return {
    document: data?.document ?? null,
    isLoading,
    error: error?.message,
    mutate,
  };
}
