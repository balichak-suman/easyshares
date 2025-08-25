import { kv } from '@vercel/kv';

// Define interfaces for our data structures
export interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  passwordHash: string;
  hasPassword?: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface FileShare {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  content: string; // Base64 encoded content
  passwordHash: string;
  hasPassword?: boolean;
  createdAt: string;
  expiresAt: string;
}

// Helper function to read data from Vercel KV
async function readData<T>(key: string): Promise<Record<string, T>> {
  const data = await kv.get<Record<string, T>>(key);
  return data || {};
}

// Helper function to write data to Vercel KV
async function writeData<T>(key: string, data: Record<string, T>): Promise<void> {
  await kv.set(key, data);
}

// --- Code Share Functions ---

export async function getCodeShare(title: string): Promise<CodeShare | null> {
  const shares = await readData<CodeShare>('codeshares');
  return shares[title] || null;
}

export async function addCodeShare(share: CodeShare): Promise<void> {
  const shares = await readData<CodeShare>('codeshares');
  shares[share.title] = share;
  await writeData('codeshares', shares);
}

export async function updateCodeShare(title: string, updates: Partial<CodeShare>): Promise<CodeShare | null> {
  const shares = await readData<CodeShare>('codeshares');
  if (shares[title]) {
    shares[title] = { ...shares[title], ...updates };
    await writeData('codeshares', shares);
    return shares[title];
  }
  return null;
}

export async function deleteCodeShare(title: string): Promise<boolean> {
  const shares = await readData<CodeShare>('codeshares');
  if (shares[title]) {
    delete shares[title];
    await writeData('codeshares', shares);
    return true;
  }
  return false;
}

// --- File Share Functions ---

export async function getFileShare(title: string): Promise<FileShare | null> {
  const shares = await readData<FileShare>('fileshares');
  return shares[title] || null;
}

export async function addFileShare(share: FileShare): Promise<void> {
  const shares = await readData<FileShare>('fileshares');
  shares[share.title] = share;
  await writeData('fileshares', shares);
}

export async function deleteFileShare(title: string): Promise<boolean> {
  const shares = await readData<FileShare>('fileshares');
  if (shares[title]) {
    delete shares[title];
    await writeData('fileshares', shares);
    return true;
  }
  return false;
}

export async function getShareByTitle(title: string): Promise<(CodeShare & { type: 'code' }) | (FileShare & { type: 'file' }) | null> {
  const codeShare = await getCodeShare(title);
  if (codeShare) {
    return { ...codeShare, type: 'code' };
  }

  const fileShare = await getFileShare(title);
  if (fileShare) {
    return { ...fileShare, type: 'file' };
  }

  return null;
}

// --- Cleanup Function for Expired Shares ---

export async function cleanupExpiredShares(): Promise<void> {
  const now = new Date();
  
  // Cleanup code shares
  const codeShares = await readData<CodeShare>('codeshares');
  const activeCodeShares: Record<string, CodeShare> = {};
  for (const title in codeShares) {
    if (new Date(codeShares[title].expiresAt) > now) {
      activeCodeShares[title] = codeShares[title];
    }
  }
  await writeData('codeshares', activeCodeShares);

  // Cleanup file shares
  const fileShares = await readData<FileShare>('fileshares');
  const activeFileShares: Record<string, FileShare> = {};
  for (const title in fileShares) {
    if (new Date(fileShares[title].expiresAt) > now) {
      activeFileShares[title] = fileShares[title];
    }
  }
  await writeData('fileshares', activeFileShares);
}
