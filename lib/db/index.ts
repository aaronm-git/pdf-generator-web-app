import { sql } from '@vercel/postgres';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

/**
 * Get the current authenticated user's ID.
 * Throws an error if no session exists.
 */
export async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized: No active session');
  }

  return session.user.id;
}

/**
 * Get the current session, or null if not authenticated.
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

// Re-export sql for use in API routes
export { sql };
