/**
 * Generic fetcher for SWR.
 * Handles JSON parsing and error responses.
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'API request failed');
  }
  return res.json();
}

/**
 * POST fetcher for SWR mutations.
 */
export async function postFetcher<T, A>(
  url: string,
  { arg }: { arg: A }
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to create');
  }
  return res.json();
}

/**
 * PUT fetcher for SWR mutations.
 */
export async function putFetcher<T, A extends { id: string; updates: unknown }>(
  url: string,
  { arg }: { arg: A }
): Promise<T> {
  const res = await fetch(`${url}/${arg.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg.updates),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to update');
  }
  return res.json();
}

/**
 * DELETE fetcher for SWR mutations.
 */
export async function deleteFetcher<T>(
  url: string,
  { arg }: { arg: string }
): Promise<T> {
  const res = await fetch(`${url}/${arg}`, { method: 'DELETE' });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to delete');
  }
  return res.json();
}
