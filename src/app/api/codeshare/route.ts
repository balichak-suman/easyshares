import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  getCodeShare, 
  addCodeShare, 
  updateCodeShare, 
  deleteCodeShare,
  cleanupExpiredShares,
  type CodeShare 
} from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    // Clean up expired shares before processing
    await cleanupExpiredShares();
    
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const share = await getCodeShare(title);

    if (!share) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Code share has expired' },
        { status: 404 }
      );
    }

    // Return share without password hash
    const { passwordHash, ...publicData } = share;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error retrieving code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up expired shares before processing new ones
    await cleanupExpiredShares();
    
    const body = await request.json();
    const { id, title, code, language, password } = body;

    if (!id || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create URL-friendly slug from title
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : id;
    
    // Check if slug is used in code or file shares and not expired
    const existingCodeShare = await getCodeShare(slug);
    const existingFileShare = await (await import('@/lib/dataStore')).getFileShare(slug);
    const now = new Date();
    if (
      (existingCodeShare && new Date(existingCodeShare.expiresAt) > now) ||
      (existingFileShare && new Date(existingFileShare.expiresAt) > now)
    ) {
      return NextResponse.json(
        { error: 'This title is already in use for an active share. Please choose a different title or wait for the previous one to expire.' },
        { status: 409 }
      );
    }

    // Hash the password only if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : '';

    // Calculate expiration (14 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // Create code share object
    const codeShare: CodeShare = {
      id,
      title: slug,
      code,
      language: language || 'javascript',
      passwordHash,
      hasPassword: !!password,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save to database
    await addCodeShare(codeShare);

    // Return success without the password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...publicData } = codeShare;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error creating code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, code, language, password } = body;

    if (!title || !code || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingShare = await getCodeShare(title);

    if (!existingShare) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(existingShare.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'This code share has expired and cannot be edited.' },
        { status: 410 } // 410 Gone
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, existingShare.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Update the share
    const updatedShareData: Partial<CodeShare> = { code };
    if (language) {
      updatedShareData.language = language;
    }
    
    const updatedShare = await updateCodeShare(title, updatedShareData);

    if (!updatedShare) {
      // This case should ideally not be reached if getCodeShare found it
      return NextResponse.json(
        { error: 'Failed to update code share' },
        { status: 500 }
      );
    }

    // Return updated share without password hash
    const { passwordHash, ...publicData } = updatedShare;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error updating code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, password } = body;

    if (!title || !password) {
      return NextResponse.json(
        { error: 'Title and password are required' },
        { status: 400 }
      );
    }

    const share = await getCodeShare(title);

    if (!share) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'Code share has expired' },
        { status: 404 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, share.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Delete the share
    const deleted = await deleteCodeShare(title);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete code share' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Code share deleted successfully' });
  } catch (error) {
    console.error('Error deleting code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
