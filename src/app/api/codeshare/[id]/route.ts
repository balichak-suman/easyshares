import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dataStore from '@/lib/productionDataStore';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const codeShare = await dataStore.get(id);

    if (!codeShare) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    // Return public data without password hash
    const { passwordHash: _, ...publicData } = codeShare;
    return NextResponse.json(publicData);

  } catch (error) {
    console.error('Error fetching code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const { code, password } = body;

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

    // Update the code
    await dataStore.update(id, { code });
    const updatedCodeShare = await dataStore.get(id);

    // Return updated data without password hash
    const { passwordHash: _, ...publicData } = updatedCodeShare!;
    return NextResponse.json(publicData);

  } catch (error) {
    console.error('Error updating code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
