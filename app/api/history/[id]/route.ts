import { NextRequest, NextResponse } from 'next/server';
import { sql, getCurrentUserId } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/history/[id]
 * Delete a history entry.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    const { rowCount } = await sql`
      DELETE FROM history
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete history entry:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete history entry' },
      { status: 500 }
    );
  }
}
