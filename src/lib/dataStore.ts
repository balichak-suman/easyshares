// Persistent data store using JSON file
// In production, you'd use a proper database like PostgreSQL or MongoDB

import fs from 'fs';
import path from 'path';

interface CodeShare {
  id: string;
  title: string;
  code: string;
  language: string;
  passwordHash: string;
  createdAt: string;
}

class DataStore {
  private codeShares: Record<string, CodeShare> = {};
  private dataFile: string;

  constructor() {
    // Store data in a JSON file in the project root
    this.dataFile = path.join(process.cwd(), 'codeshare-data.json');
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        this.codeShares = JSON.parse(data);
        console.log(`📁 Loaded ${Object.keys(this.codeShares).length} code shares from storage`);
      } else {
        console.log('📁 No existing data file found, starting fresh');
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      this.codeShares = {};
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.codeShares, null, 2));
    } catch (error) {
      console.error('❌ Error saving data:', error);
    }
  }

  set(id: string, data: CodeShare) {
    this.codeShares[id] = data;
    this.saveData();
    console.log(`💾 Saved code share: ${id}`);
  }

  get(id: string): CodeShare | null {
    return this.codeShares[id] || null;
  }

  update(id: string, updates: Partial<CodeShare>) {
    if (this.codeShares[id]) {
      this.codeShares[id] = { ...this.codeShares[id], ...updates };
      this.saveData();
      console.log(`📝 Updated code share: ${id}`);
    }
  }

  exists(id: string): boolean {
    return id in this.codeShares;
  }
}

// Create a singleton instance
const dataStore = new DataStore();

export default dataStore;
