import { NextRequest, NextResponse } from 'next/server';
import dataStore from '@/lib/productionDataStore';

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

    const isAvailable = !dataStore.exists(slug);

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
