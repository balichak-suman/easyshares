import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  getFileShare, 
  addFileShare, 
  deleteFileShare,
  cleanupExpiredShares,
  type FileShare 
} from '@/lib/database';

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

    const share = await getFileShare(title);

    if (!share) {
      return NextResponse.json(
        { error: 'File share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'File share has expired' },
        { status: 404 }
      );
    }

    // Return share metadata without content and password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content: _content, passwordHash: _passwordHash, ...publicData } = share;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error retrieving file share:', error);
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
    const { id, title, description, password, fileName, fileSize, mimeType, content } = body;

    if (!id || !fileName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // File size limit (10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create URL-friendly slug from title
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : id;
    
    // Check if slug is used in code or file shares and not expired
    const existingFileShare = await getFileShare(slug);
    const existingCodeShare = await (await import('@/lib/database')).getCodeShare(slug);
    const now = new Date();
    if (
      (existingFileShare && new Date(existingFileShare.expiresAt) > now) ||
      (existingCodeShare && new Date(existingCodeShare.expiresAt) > now)
    ) {
      return NextResponse.json(
        { error: 'This title is already in use for an active share. Please choose a different title or wait for the previous one to expire.' },
        { status: 409 }
      );
    }

    // Hash the password only if provided
    const passwordHash = password ? await bcrypt.hash(password, 10) : '';

    // Calculate expiration (3 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Create file share object
    const fileShare: FileShare = {
      id,
      title: slug,
      description: description || '',
      fileName,
      fileSize,
      mimeType,
      content,
      passwordHash,
      hasPassword: !!password,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save to database
    await addFileShare(fileShare);

    // Return success without the content and password hash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content: _content2, passwordHash: _passwordHash2, ...publicData } = fileShare;
    return NextResponse.json(publicData);
  } catch (error) {
    console.error('Error creating file share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, password, action } = body;

    if (!title || !action) {
      return NextResponse.json(
        { error: 'Title and action are required' },
        { status: 400 }
      );
    }

    const share = await getFileShare(title);

    if (!share) {
      return NextResponse.json(
        { error: 'File share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'File share has expired' },
        { status: 404 }
      );
    }

    if (action === 'download') {
      // Check if this share has a password
      if (share.hasPassword) {
        if (!password) {
          return NextResponse.json(
            { error: 'Password is required to download this file' },
            { status: 401 }
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
      }

      // Return file content for download
      return NextResponse.json({
        fileName: share.fileName,
        mimeType: share.mimeType,
        content: share.content,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing file share request:', error);
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

    const share = await getFileShare(title);

    if (!share) {
      return NextResponse.json(
        { error: 'File share not found' },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'File share has expired' },
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
    const deleted = await deleteFileShare(title);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete file share' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'File share deleted successfully' });
  } catch (error) {
    console.error('Error deleting file share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
