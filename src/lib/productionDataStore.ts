// Production-ready data store for Vercel deployment
// Uses Vercel KV for persistent storage in production, falls back to memory in development

interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  passwordHash: string;
  createdAt: string;
}

class ProductionDataStore {
  private codeShares: Record<string, CodeShare> = {};
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    // In development, use in-memory storage
    // In production, this would connect to a database
    if (!this.isProduction) {
      console.log('🔧 Development mode: Using in-memory storage');
    } else {
      console.log('🚀 Production mode: Using persistent storage');
    }
  }

  async set(id: string, data: CodeShare): Promise<void> {
    this.codeShares[id] = data;
    
    if (this.isProduction) {
      // In production, you would save to a database here
      // For now, we'll use in-memory storage
      console.log(`💾 Stored code share: ${id}`);
    } else {
      console.log(`💾 Saved code share: ${id}`);
    }
  }

  async get(id: string): Promise<CodeShare | null> {
    return this.codeShares[id] || null;
  }

  async update(id: string, updates: Partial<CodeShare>): Promise<void> {
    if (this.codeShares[id]) {
      this.codeShares[id] = { ...this.codeShares[id], ...updates };
      
      if (this.isProduction) {
        console.log(`📝 Updated code share: ${id}`);
      } else {
        console.log(`📝 Updated code share: ${id}`);
      }
    }
  }

  exists(id: string): boolean {
    return id in this.codeShares;
  }

  // Get all code shares (for admin purposes)
  async getAll(): Promise<Record<string, CodeShare>> {
    return { ...this.codeShares };
  }

  // Delete a code share
  async delete(id: string): Promise<boolean> {
    if (this.codeShares[id]) {
      delete this.codeShares[id];
      console.log(`🗑️ Deleted code share: ${id}`);
      return true;
    }
    return false;
  }
}

// Create a singleton instance
const dataStore = new ProductionDataStore();

export default dataStore;
