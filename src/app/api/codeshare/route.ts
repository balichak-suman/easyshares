import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dataStore from '@/lib/productionDataStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, code, language, password, isCustomSlug } = body;

    if (!id || !password || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the ID already exists (for custom slugs)
    if (isCustomSlug && dataStore.exists(id)) {
      return NextResponse.json(
        { error: 'This custom URL is already taken' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Store the code share
    const codeShare = {
      id,
      title: title || 'Untitled Code Share',
      code,
      language: language || 'javascript',
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    dataStore.set(id, codeShare);

    // Return success without the password hash
    const { passwordHash: _, ...publicData } = codeShare;
    return NextResponse.json(publicData);

  } catch (error) {
    console.error('Error creating code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
