import { neon } from '@neondatabase/serverless';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

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

/**
 * Execute a query returning typed rows.
 * Centralizes the type assertion at the library boundary.
 */
export async function query<T>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<T[]> {
  return sql(strings, ...params) as Promise<T[]>;
}

/**
 * Execute a query returning first row or undefined.
 * Useful for queries that should return at most one result.
 */
export async function queryOne<T>(
  strings: TemplateStringsArray,
  ...params: unknown[]
): Promise<T | undefined> {
  const rows = (await sql(strings, ...params)) as T[];
  return rows[0];
}

// Re-export sql for use in API routes (for non-typed queries like DELETE)
export { sql };
