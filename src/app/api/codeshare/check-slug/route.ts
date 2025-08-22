import { NextRequest, NextResponse } from 'next/server';
import { getCodeShare, getFileShare } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Check if slug exists in either code shares or file shares
    const codeShare = await getCodeShare(slug);
    const fileShare = await getFileShare(slug);
    
    const isAvailable = !codeShare && !fileShare;

    return NextResponse.json({ 
      available: isAvailable,
      slug: slug 
    });

  } catch (error) {
    console.error('Error checking slug availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
