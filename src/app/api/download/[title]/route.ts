import { getShareByTitle } from '@/lib/dataStore';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ title: string }> }) {
  const { title } = await context.params;
  try {
    const share = await getShareByTitle(title);

    if (!share || share.type !== 'file') {
      return new NextResponse('File not found or not a file share.', { status: 404 });
    }

    if (share.hasPassword) {
      return new NextResponse('This file is password-protected and cannot be downloaded directly.', { status: 403 });
    }

    const fileContentBase64 = await kv.get<string>(`file:${share.id}`);
    if (!fileContentBase64) {
      return new NextResponse('File content not found.', { status: 404 });
    }

    const fileBuffer = Buffer.from(fileContentBase64, 'base64');

    const headers = new Headers();
    headers.set('Content-Type', share.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${share.fileName}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error('Error downloading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
