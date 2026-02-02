import { NextRequest, NextResponse } from 'next/server';
import { sql, getCurrentUserId } from '@/lib/db';
import { generateId } from '@/lib/utils/id';
import type { HistoryRow, CreateHistoryInput } from '@/types/document';
import { historyRowToHistoryEntry } from '@/types/document';

// Maximum number of history entries to keep per user
const MAX_HISTORY_ENTRIES = 100;

/**
 * GET /api/history
 * List history entries for the current user, sorted by created_at DESC.
 * Limited to the most recent 100 entries.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const rows = await sql<HistoryRow>`
      SELECT * FROM history
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${MAX_HISTORY_ENTRIES}
    `;

    const entries = rows.map(historyRowToHistoryEntry);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Failed to fetch history:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history
 * Add a new history entry.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body: CreateHistoryInput = await request.json();

    if (!body.type || !body.instructions) {
      return NextResponse.json(
        { error: 'Type and instructions are required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();

    const rows = await sql<HistoryRow>`
      INSERT INTO history (id, user_id, type, prompt, document_name, instructions, thumbnail, created_at)
      VALUES (
        ${id},
        ${userId},
        ${body.type},
        ${body.prompt ?? null},
        ${body.documentName ?? null},
        ${JSON.stringify(body.instructions)},
        ${body.thumbnail ?? null},
        ${now}
      )
      RETURNING *
    `;

    const entry = historyRowToHistoryEntry(rows[0]);

    // Clean up old entries (keep only the most recent MAX_HISTORY_ENTRIES)
    await sql`
      DELETE FROM history
      WHERE user_id = ${userId}
      AND id NOT IN (
        SELECT id FROM history
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${MAX_HISTORY_ENTRIES}
      )
    `;

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Failed to create history entry:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}
