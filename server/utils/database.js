const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');
const LOCK_FILE = DB_FILE + '.lock';

// Simple file locking mechanism to prevent race conditions
class FileLock {
  constructor(lockFile) {
    this.lockFile = lockFile;
    this.locked = false;
  }

  async acquire(timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        if (!fs.existsSync(this.lockFile)) {
          fs.writeFileSync(this.lockFile, process.pid.toString());
          this.locked = true;
          return true;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.warn('Lock acquisition attempt failed:', error.message);
      }
    }
    throw new Error('Could not acquire file lock within timeout');
  }

  release() {
    if (this.locked) {
      try {
        if (fs.existsSync(this.lockFile)) {
          fs.unlinkSync(this.lockFile);
        }
        this.locked = false;
      } catch (error) {
        console.warn('Lock release failed:', error.message);
      }
    }
  }
}

// Centralized database operations
class DatabaseManager {
  constructor() {
    this.lock = new FileLock(LOCK_FILE);
  }

  async readDB() {
    const lock = new FileLock(LOCK_FILE);
    try {
      await lock.acquire();
      
      if (!fs.existsSync(DB_FILE)) {
        const initialData = { 
          users: [], 
          products: [], 
          orders: [],
          customers: [],
          created_at: new Date().toISOString(),
          version: '1.0.0'
        };
        await this.writeDB(initialData);
        return initialData;
      }

      const data = fs.readFileSync(DB_FILE, 'utf8');
      
      // Validate JSON structure
      try {
        const parsed = JSON.parse(data);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid database structure');
        }
        
        // Ensure required fields exist
        const defaultStructure = { 
          users: [], 
          products: [], 
          orders: [],
          customers: []
        };
        
        return { ...defaultStructure, ...parsed };
      } catch (parseError) {
        console.error('Database JSON parse error:', parseError);
        // Create backup of corrupted file
        const backupFile = `${DB_FILE}.corrupted.${Date.now()}`;
        fs.copyFileSync(DB_FILE, backupFile);
        console.log(`Corrupted database backed up to: ${backupFile}`);
        
        // Return fresh database
        const freshData = { 
          users: [], 
          products: [], 
          orders: [],
          customers: [],
          created_at: new Date().toISOString(),
          version: '1.0.0'
        };
        await this.writeDB(freshData);
        return freshData;
      }
    } catch (error) {
      console.error('Database read error:', error);
      throw new Error(`Failed to read database: ${error.message}`);
    } finally {
      lock.release();
    }
  }

  async writeDB(data) {
    const lock = new FileLock(LOCK_FILE);
    try {
      await lock.acquire();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure for database write');
      }

      // Ensure required fields
      const requiredFields = ['users', 'products', 'orders', 'customers'];
      for (const field of requiredFields) {
        if (!Array.isArray(data[field])) {
          data[field] = [];
        }
      }

      // Add metadata
      data.last_updated = new Date().toISOString();
      data.version = data.version || '1.0.0';

      const dbDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create backup before write
      if (fs.existsSync(DB_FILE)) {
        const backupFile = `${DB_FILE}.backup`;
        fs.copyFileSync(DB_FILE, backupFile);
      }

      // Write to temporary file first, then rename (atomic operation)
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempFile, DB_FILE);

      return true;
    } catch (error) {
      console.error('Database write error:', error);
      throw new Error(`Failed to write database: ${error.message}`);
    } finally {
      lock.release();
    }
  }

  // Utility methods for common operations
  async findUserByEmail(email) {
    const db = await this.readDB();
    return db.users.find(user => user.email === email);
  }

  async findUserById(id) {
    const db = await this.readDB();
    return db.users.find(user => user.id === id || user.id === parseInt(id, 10));
  }

  async updateUser(userId, updates) {
    const db = await this.readDB();
    const userIndex = db.users.findIndex(u => u.id === userId || u.id === parseInt(userId, 10));
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    db.users[userIndex] = { 
      ...db.users[userIndex], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    
    await this.writeDB(db);
    return db.users[userIndex];
  }

  async createUser(userData) {
    const db = await this.readDB();
    
    // Generate unique ID
    const newId = Math.max(0, ...db.users.map(u => parseInt(u.id) || 0)) + 1;
    
    const newUser = {
      id: newId,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.users.push(newUser);
    await this.writeDB(db);
    return newUser;
  }

  async deleteUser(userId) {
    const db = await this.readDB();
    const userIndex = db.users.findIndex(u => u.id === userId || u.id === parseInt(userId, 10));
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUser = db.users[userIndex];
    db.users.splice(userIndex, 1);
    await this.writeDB(db);
    return deletedUser;
  }

  // Health check method
  async healthCheck() {
    try {
      const db = await this.readDB();
      return {
        status: 'healthy',
        users_count: db.users?.length || 0,
        products_count: db.products?.length || 0,
        orders_count: db.orders?.length || 0,
        last_updated: db.last_updated,
        version: db.version
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

// Export singleton instance
const dbManager = new DatabaseManager();

// Legacy compatibility functions
const readDB = () => dbManager.readDB();
const writeDB = (data) => dbManager.writeDB(data);

module.exports = {
  DatabaseManager,
  dbManager,
  readDB,
  writeDB,
  FileLock
};