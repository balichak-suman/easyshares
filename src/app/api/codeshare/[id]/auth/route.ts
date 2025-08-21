import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dataStore from '@/lib/productionDataStore';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const { password } = body;

    const codeShare = await dataStore.get(id);

    if (!codeShare) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, codeShare.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
