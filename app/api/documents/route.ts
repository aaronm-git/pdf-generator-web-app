import { NextRequest, NextResponse } from 'next/server';
import { sql, getCurrentUserId } from '@/lib/db';
import { generateId } from '@/lib/utils/id';
import type { DocumentRow, CreateDocumentInput } from '@/types/document';
import { documentRowToSavedDocument } from '@/types/document';

/**
 * GET /api/documents
 * List all documents for the current user, sorted by updated_at DESC.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const rows = await sql<DocumentRow>`
      SELECT * FROM documents
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    const documents = rows.map(documentRowToSavedDocument);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Failed to fetch documents:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Create a new document.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body: CreateDocumentInput = await request.json();

    if (!body.name || !body.instructions) {
      return NextResponse.json(
        { error: 'Name and instructions are required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();

    const rows = await sql<DocumentRow>`
      INSERT INTO documents (id, user_id, name, instructions, thumbnail, favorite, created_at, updated_at)
      VALUES (
        ${id},
        ${userId},
        ${body.name},
        ${JSON.stringify(body.instructions)},
        ${body.thumbnail ?? null},
        ${body.favorite ?? false},
        ${now},
        ${now}
      )
      RETURNING *
    `;

    const document = documentRowToSavedDocument(rows[0]);

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Failed to create document:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
