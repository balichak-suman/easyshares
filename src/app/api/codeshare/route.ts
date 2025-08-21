import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from 'bcryptjs';

// Define the code share data structure
interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  passwordHash: string;
  createdAt: string;
  expiresAt: string;
}

const DATA_FILE = join(process.cwd(), 'data', 'codeshares.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
}

// Read code shares from JSON file
function readCodeShares(): CodeShare[] {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading code shares:', error);
    return [];
  }
}

// Write code shares to JSON file
function writeCodeShares(shares: CodeShare[]) {
  ensureDataDir();
  try {
    writeFileSync(DATA_FILE, JSON.stringify(shares, null, 2));
  } catch (error) {
    console.error('Error writing code shares:', error);
    throw new Error('Failed to save code share');
  }
}

// Clean up expired code shares (code expires after 14 days)
function cleanupExpiredShares() {
  const shares = readCodeShares();
  const now = new Date();
  const activeShares = shares.filter(share => new Date(share.expiresAt) > now);
  
  if (activeShares.length !== shares.length) {
    writeCodeShares(activeShares);
    console.log(`Cleaned up ${shares.length - activeShares.length} expired code shares`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Clean up expired shares before processing new ones
    cleanupExpiredShares();
    
    const body = await request.json();
    const { id, title, code, language, password } = body;

    if (!id || !password || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create URL-friendly slug from title
    const slug = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : id;
    
    // Check if slug already exists
    const existingShares = readCodeShares();
    if (existingShares.some(share => share.title === slug)) {
      return NextResponse.json(
        { error: 'A code share with this title already exists. Please choose a different title.' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

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
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Save to file
    const allShares = [...existingShares, codeShare];
    writeCodeShares(allShares);

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

export async function GET(request: NextRequest) {
  try {
    // Clean up expired shares
    cleanupExpiredShares();
    
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const shares = readCodeShares();
    const share = shares.find(s => s.title === title);

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, code, password } = body;

    if (!title || !code || !password) {
      return NextResponse.json(
        { error: 'Title, code, and password are required' },
        { status: 400 }
      );
    }

    const shares = readCodeShares();
    const shareIndex = shares.findIndex(s => s.title === title);

    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    const share = shares[shareIndex];

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

    // Update the code
    shares[shareIndex] = {
      ...share,
      code,
    };

    writeCodeShares(shares);

    // Return updated share without password hash
    const { passwordHash, ...publicData } = shares[shareIndex];
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

    const shares = readCodeShares();
    const shareIndex = shares.findIndex(s => s.title === title);

    if (shareIndex === -1) {
      return NextResponse.json(
        { error: 'Code share not found' },
        { status: 404 }
      );
    }

    const share = shares[shareIndex];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, share.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Delete the share
    shares.splice(shareIndex, 1);
    writeCodeShares(shares);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting code share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
