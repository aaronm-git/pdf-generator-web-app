import { NextRequest, NextResponse } from 'next/server';
import { sql, getCurrentUserId } from '@/lib/db';
import type { DocumentRow, UpdateDocumentInput } from '@/types/document';
import { documentRowToSavedDocument } from '@/types/document';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/documents/[id]
 * Get a single document by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    const rows = await sql<DocumentRow>`
      SELECT * FROM documents
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = documentRowToSavedDocument(rows[0]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Failed to fetch document:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id]
 * Update an existing document.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const body: UpdateDocumentInput = await request.json();

    // Check if document exists
    const existingRows = await sql<DocumentRow>`
      SELECT * FROM documents
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (existingRows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const existing = existingRows[0];
    const now = new Date().toISOString();

    // Update with provided fields, keeping existing values for others
    const rows = await sql<DocumentRow>`
      UPDATE documents
      SET
        name = ${body.name ?? existing.name},
        instructions = ${body.instructions ? JSON.stringify(body.instructions) : JSON.stringify(existing.instructions)},
        thumbnail = ${body.thumbnail !== undefined ? body.thumbnail : existing.thumbnail},
        favorite = ${body.favorite !== undefined ? body.favorite : existing.favorite},
        updated_at = ${now}
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    const document = documentRowToSavedDocument(rows[0]);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Failed to update document:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a document.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();

    const result = await sql`
      DELETE FROM documents
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
