import { kv } from '@vercel/kv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Define the data structures
export interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  passwordHash: string;
  hasPassword: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface FileShare {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  content: string; // Base64 encoded file content
  passwordHash: string;
  hasPassword: boolean;
  createdAt: string;
  expiresAt: string;
}

// Check if we're running on Vercel
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

// Local file paths for development
const DATA_DIR = join(process.cwd(), 'data');
const CODE_SHARES_FILE = join(DATA_DIR, 'codeshares.json');
const FILE_SHARES_FILE = join(DATA_DIR, 'files.json');

// Ensure data directory exists (for local development)
function ensureDataDir() {
  if (!isVercel && !existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Code Shares Functions
export async function getCodeShares(): Promise<CodeShare[]> {
  if (isVercel) {
    try {
      const shares = await kv.get<CodeShare[]>('codeshares') || [];
      return shares;
    } catch (error) {
      console.error('Error reading code shares from KV:', error);
      return [];
    }
  } else {
    // Local development - use JSON files
    ensureDataDir();
    if (!existsSync(CODE_SHARES_FILE)) {
      return [];
    }
    try {
      const data = readFileSync(CODE_SHARES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading code shares from file:', error);
      return [];
    }
  }
}

export async function saveCodeShares(shares: CodeShare[]): Promise<void> {
  if (isVercel) {
    try {
      await kv.set('codeshares', shares);
    } catch (error) {
      console.error('Error saving code shares to KV:', error);
      throw new Error('Failed to save code shares');
    }
  } else {
    // Local development - use JSON files
    ensureDataDir();
    try {
      writeFileSync(CODE_SHARES_FILE, JSON.stringify(shares, null, 2));
    } catch (error) {
      console.error('Error saving code shares to file:', error);
      throw new Error('Failed to save code shares');
    }
  }
}

export async function getCodeShare(title: string): Promise<CodeShare | null> {
  const shares = await getCodeShares();
  return shares.find(share => share.title === title) || null;
}

export async function addCodeShare(share: CodeShare): Promise<void> {
  const shares = await getCodeShares();
  shares.push(share);
  await saveCodeShares(shares);
}

export async function updateCodeShare(title: string, updatedShare: Partial<CodeShare>): Promise<CodeShare | null> {
  const shares = await getCodeShares();
  const index = shares.findIndex(share => share.title === title);
  
  if (index === -1) {
    return null;
  }
  
  shares[index] = { ...shares[index], ...updatedShare };
  await saveCodeShares(shares);
  return shares[index];
}

export async function deleteCodeShare(title: string): Promise<boolean> {
  const shares = await getCodeShares();
  const filteredShares = shares.filter(share => share.title !== title);
  
  if (filteredShares.length === shares.length) {
    return false; // Not found
  }
  
  await saveCodeShares(filteredShares);
  return true;
}

// File Shares Functions
export async function getFileShares(): Promise<FileShare[]> {
  if (isVercel) {
    try {
      const shares = await kv.get<FileShare[]>('fileshares') || [];
      return shares;
    } catch (error) {
      console.error('Error reading file shares from KV:', error);
      return [];
    }
  } else {
    // Local development - use JSON files
    ensureDataDir();
    if (!existsSync(FILE_SHARES_FILE)) {
      return [];
    }
    try {
      const data = readFileSync(FILE_SHARES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading file shares from file:', error);
      return [];
    }
  }
}

export async function saveFileShares(shares: FileShare[]): Promise<void> {
  if (isVercel) {
    try {
      await kv.set('fileshares', shares);
    } catch (error) {
      console.error('Error saving file shares to KV:', error);
      throw new Error('Failed to save file shares');
    }
  } else {
    // Local development - use JSON files
    ensureDataDir();
    try {
      writeFileSync(FILE_SHARES_FILE, JSON.stringify(shares, null, 2));
    } catch (error) {
      console.error('Error saving file shares to file:', error);
      throw new Error('Failed to save file shares');
    }
  }
}

export async function getFileShare(title: string): Promise<FileShare | null> {
  const shares = await getFileShares();
  return shares.find(share => share.title === title) || null;
}

export async function addFileShare(share: FileShare): Promise<void> {
  const shares = await getFileShares();
  shares.push(share);
  await saveFileShares(shares);
}

export async function updateFileShare(title: string, updatedShare: Partial<FileShare>): Promise<FileShare | null> {
  const shares = await getFileShares();
  const index = shares.findIndex(share => share.title === title);
  
  if (index === -1) {
    return null;
  }
  
  shares[index] = { ...shares[index], ...updatedShare };
  await saveFileShares(shares);
  return shares[index];
}

export async function deleteFileShare(title: string): Promise<boolean> {
  const shares = await getFileShares();
  const filteredShares = shares.filter(share => share.title !== title);
  
  if (filteredShares.length === shares.length) {
    return false; // Not found
  }
  
  await saveFileShares(filteredShares);
  return true;
}

// Cleanup expired shares
export async function cleanupExpiredShares(): Promise<void> {
  const now = new Date();
  
  // Cleanup code shares
  const codeShares = await getCodeShares();
  const activeCodeShares = codeShares.filter(share => new Date(share.expiresAt) > now);
  if (activeCodeShares.length !== codeShares.length) {
    await saveCodeShares(activeCodeShares);
    console.log(`Cleaned up ${codeShares.length - activeCodeShares.length} expired code shares`);
  }
  
  // Cleanup file shares
  const fileShares = await getFileShares();
  const activeFileShares = fileShares.filter(share => new Date(share.expiresAt) > now);
  if (activeFileShares.length !== fileShares.length) {
    await saveFileShares(activeFileShares);
    console.log(`Cleaned up ${fileShares.length - activeFileShares.length} expired file shares`);
  }
}
