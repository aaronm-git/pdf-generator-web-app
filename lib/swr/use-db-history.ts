import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SWR_KEYS } from './keys';
import { fetcher, postFetcher, deleteFetcher } from './fetchers';
import type { HistoryEntry, CreateHistoryInput } from '@/types/document';

interface HistoryResponse {
  entries: HistoryEntry[];
}

interface HistoryEntryResponse {
  entry: HistoryEntry;
}

/**
 * Fetch DB history entries.
 * Uses the existing /api/history endpoint that was previously unused!
 */
export function useDBHistory() {
  const { data, error, isLoading, mutate } = useSWR<HistoryResponse>(
    SWR_KEYS.DB_HISTORY,
    fetcher
  );

  return {
    entries: data?.entries ?? [],
    isLoading,
    error: error?.message,
    mutate,
  };
}

/**
 * Add a new history entry to the database.
 */
export function useAddDBHistoryEntry() {
  const { trigger, isMutating, error } = useSWRMutation<
    HistoryEntryResponse,
    Error,
    string,
    CreateHistoryInput
  >(SWR_KEYS.DB_HISTORY, postFetcher, {
    revalidate: true,
  });

  return {
    addEntry: trigger,
    isAdding: isMutating,
    error: error?.message,
  };
}

/**
 * Delete a history entry.
 */
export function useDeleteDBHistoryEntry() {
  const { trigger, isMutating, error } = useSWRMutation<
    { success: boolean },
    Error,
    string,
    string
  >(SWR_KEYS.DB_HISTORY, deleteFetcher, {
    revalidate: true,
  });

  return {
    deleteEntry: trigger,
    isDeleting: isMutating,
    error: error?.message,
  };
}
