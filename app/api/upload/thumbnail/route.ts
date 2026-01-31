import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/upload/thumbnail
 * Upload a thumbnail image to Vercel Blob storage.
 * Expects a base64 encoded image in the request body.
 */
export async function POST(request: NextRequest) {
  try {
    const { image, filename } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Remove data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer (Node.js runtime)
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Vercel Blob
    const blob = await put(filename || `thumbnail-${Date.now()}.png`, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Failed to upload thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to upload thumbnail' },
      { status: 500 }
    );
  }
}
