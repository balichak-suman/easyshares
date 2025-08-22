import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

// Define the file share data structure
interface FileShare {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  content: string; // Base64 encoded file content
  passwordHash: string;
  createdAt: string;
  expiresAt: string;
}

const DATA_FILE = join(process.cwd(), 'data', 'files.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Read file shares from JSON file
function readFileShares(): FileShare[] {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading file shares:', error);
    return [];
  }
}

// Write file shares to JSON file
function writeFileShares(shares: FileShare[]) {
  ensureDataDir();
  try {
    writeFileSync(DATA_FILE, JSON.stringify(shares, null, 2));
  } catch (error) {
    console.error('Error writing file shares:', error);
    throw new Error('Failed to save file share');
  }
}

// Clean up expired file shares (files expire after 3 days)
function cleanupExpiredFiles() {
  const shares = readFileShares();
  const now = new Date();
  const activeShares = shares.filter(share => new Date(share.expiresAt) > now);
  
  if (activeShares.length !== shares.length) {
    writeFileShares(activeShares);
    console.log(`Cleaned up ${shares.length - activeShares.length} expired files`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up expired files before processing new uploads
    cleanupExpiredFiles();
    
    const body = await request.json();
    const { id, title, description, password, fileName, fileSize, mimeType, content } = body;

    // Validate required fields
    if (!id || !title || !fileName || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Create URL-friendly slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Check if slug already exists
    const existingShares = readFileShares();
    if (existingShares.some(share => share.title.toLowerCase() === slug)) {
      return NextResponse.json(
        { error: 'A file with this title already exists. Please choose a different title.' },
        { status: 409 }
      );
    }

    // Hash the password (only if provided)
    const passwordHash = password ? await bcrypt.hash(password, 10) : '';

    // Calculate expiration (3 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Create file share object
    const fileShare: FileShare = {
      id,
      title: slug,
      description,
      fileName,
      fileSize,
      mimeType,
      content,
      passwordHash,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save to file
    const allShares = [...existingShares, fileShare];
    writeFileShares(allShares);

    return NextResponse.json({
      success: true,
      title: slug,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating file share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clean up expired files
    cleanupExpiredFiles();
    
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const shares = readFileShares();
    const share = shares.find(s => s.title === title);

    if (!share) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if file has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 404 }
      );
    }

    // Return file info without content (for metadata)
    const { content, passwordHash, ...fileInfo } = share;
    return NextResponse.json({
      ...fileInfo,
      hasPassword: !!passwordHash && passwordHash !== ''
    });
  } catch (error) {
    console.error('Error retrieving file share:', error);
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

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const shares = readFileShares();
    const shareIndex = shares.findIndex(s => s.title === title);

    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const share = shares[shareIndex];

    // Check if file has expired
    if (new Date(share.expiresAt) <= new Date()) {
      return NextResponse.json(
        { error: 'File has expired' },
        { status: 404 }
      );
    }

    // Verify password only if the file has a password
    if (share.passwordHash && share.passwordHash !== '') {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required for this file' },
          { status: 400 }
        );
      }
      
      const isPasswordValid = await bcrypt.compare(password, share.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    if (action === 'download') {
      // Return the file content for download
      return NextResponse.json({
        success: true,
        fileName: share.fileName,
        mimeType: share.mimeType,
        content: share.content,
      });
    } else if (action === 'delete') {
      // Delete the file
      shares.splice(shareIndex, 1);
      writeFileShares(shares);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing file action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
