import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { SWR_KEYS } from './keys';
import { fetcher, postFetcher, putFetcher, deleteFetcher } from './fetchers';
import type {
  SavedDocument,
  CreateDocumentInput,
  UpdateDocumentInput,
} from '@/types/document';

interface DocumentsResponse {
  documents: SavedDocument[];
}

interface DocumentResponse {
  document: SavedDocument;
}

/**
 * Fetch all documents.
 */
export function useDocuments() {
  const { data, error, isLoading, mutate } = useSWR<DocumentsResponse>(
    SWR_KEYS.DOCUMENTS,
    fetcher
  );

  return {
    documents: data?.documents ?? [],
    isLoading,
    error: error?.message,
    mutate,
  };
}

/**
 * Create a new document.
 */
export function useCreateDocument() {
  const { trigger, isMutating, error } = useSWRMutation<
    DocumentResponse,
    Error,
    string,
    CreateDocumentInput
  >(SWR_KEYS.DOCUMENTS, postFetcher, {
    // Revalidate the documents list after creation
    revalidate: true,
  });

  return {
    createDocument: trigger,
    isCreating: isMutating,
    error: error?.message,
  };
}

/**
 * Update an existing document.
 */
export function useUpdateDocument() {
  const { trigger, isMutating, error } = useSWRMutation<
    DocumentResponse,
    Error,
    string,
    { id: string; updates: UpdateDocumentInput }
  >(SWR_KEYS.DOCUMENTS, putFetcher, {
    revalidate: true,
  });

  return {
    updateDocument: trigger,
    isUpdating: isMutating,
    error: error?.message,
  };
}

/**
 * Delete a document.
 */
export function useDeleteDocument() {
  const { trigger, isMutating, error } = useSWRMutation<
    { success: boolean },
    Error,
    string,
    string
  >(SWR_KEYS.DOCUMENTS, deleteFetcher, {
    revalidate: true,
  });

  return {
    deleteDocument: trigger,
    isDeleting: isMutating,
    error: error?.message,
  };
}
