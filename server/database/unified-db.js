const fs = require('fs');
const _path = require('path');
const _crypto = require('crypto');

// Configuration
const _DEFAULT_DB_PATH = path.join(__dirname, '../data/unified-db.json');
const _BACKUP_DIR = path.join(__dirname, '../data/backups');
const _LOCK_DIR = path.join(__dirname, '../data/locks');

// Ensure directories exist
const _ensureDirectories = () => {
  [path.dirname(DEFAULT_DB_PATH), BACKUP_DIR, LOCK_DIR].forEach(_dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// File locking mechanism
class DatabaseLock {
  constructor(dbPath) {
    this.lockFile = path.join(LOCK_DIR, `${path.basename(dbPath)}.lock`);
    this.locked = false;
    this.lockId = crypto.randomUUID();
  }

  async acquire(timeout = 10000) {
    const _start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        if (!fs.existsSync(this.lockFile)) {
          fs.writeFileSync(this.lockFile, JSON.stringify({
            pid: process.pid,
            lockId: this.lockId,
            timestamp: new Date().toISOString()
          }));
          this.locked = true;
          return true;
        }
        
        // Check if lock is stale (older than 30 seconds)
        try {
          const _lockInfo = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
          const _lockTime = new Date(lockInfo.timestamp);
          if (Date.now() - lockTime.getTime() > 30000) {
            fs.unlinkSync(this.lockFile);
            continue;
          }
        } catch (_error) {
          // Lock file corrupted, remove it
          fs.unlinkSync(this.lockFile);
          continue;
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (_error) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    throw new Error(`Could not acquire database lock within ${timeout}ms`);
  }

  release() {
    if (this.locked) {
      try {
        if (fs.existsSync(this.lockFile)) {
          const _lockInfo = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
          if (lockInfo.lockId === this.lockId) {
            fs.unlinkSync(this.lockFile);
          }
        }
        this.locked = false;
      } catch (_error) {
        // Ignore errors during release
        this.locked = false;
      }
    }
  }
}

// Database schema definition
const _DEFAULT_SCHEMA = {
  version: '2.0.0',
  created_at: new Date().toISOString(),
  last_updated: new Date().toISOString(),
  
  // User management
  users: [],
  user_sessions: [],
  user_preferences: [],
  
  // Product catalog
  products: [],
  product_categories: [],
  product_variants: [],
  product_reviews: [],
  
  // Orders and transactions
  orders: [],
  order_items: [],
  order_status_history: [],
  payments: [],
  
  // Customer management
  customers: [],
  customer_addresses: [],
  customer_interactions: [],
  customer_loyalty_points: [],
  
  // Inventory management
  inventory: [],
  inventory_movements: [],
  warehouses: [],
  suppliers: [],
  
  // Content management
  blog_posts: [],
  blog_categories: [],
  blog_comments: [],
  testimonials: [],
  
  // Marketing
  newsletters: [],
  newsletter_subscribers: [],
  campaigns: [],
  coupons: [],
  
  // Analytics and reports
  analytics_events: [],
  sales_reports: [],
  performance_metrics: [],
  
  // System
  audit_logs: [],
  configurations: [],
  notifications: [],
  
  // ERP modules
  financial_transactions: [],
  accounts: [],
  purchase_orders: [],
  receipts: [],
  employees: [],
  departments: [],
  
  // Courses and education
  courses: [],
  course_enrollments: [],
  course_progress: [],
  
  // Communication
  whatsapp_messages: [],
  email_templates: [],
  notifications_queue: []
};

class UnifiedDatabase {
  constructor(dbPath = DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    this.lock = null;
    this.cache = null;
    this.cacheTimeout = 5000; // 5 seconds
    this.lastCacheUpdate = 0;
    
    ensureDirectories();
    this.initializeDatabase();
  }

  // Initialize database with default schema
  initializeDatabase() {
    if (!fs.existsSync(this.dbPath)) {
      this.writeDatabase(DEFAULT_SCHEMA);
      console.log(`✅ Initialized unified database at ${this.dbPath}`);
    }
  }

  // Create backup of current database
  createBackup() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const _timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const _backupPath = path.join(BACKUP_DIR, `db-backup-${timestamp}.json`);
        fs.copyFileSync(this.dbPath, backupPath);
        
        // Keep only last 10 backups
        const _backups = fs.readdirSync(BACKUP_DIR)
          .filter(file => file.startsWith('db-backup-'))
          .sort()
          .reverse();
          
        if (backups.length > 10) {
          backups.slice(10).forEach(_backup => {
            fs.unlinkSync(path.join(BACKUP_DIR, backup));
          });
        }
        
        return backupPath;
      }
    } catch (_error) {
      console.warn('Failed to create database backup');
    }
    return null;
  }

  // Read database with caching
  async readDatabase() {
    const _now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return { ...this.cache };
    }

    const _lock = new DatabaseLock(this.dbPath);
    try {
      await lock.acquire();
      
      if (!fs.existsSync(this.dbPath)) {
        this.writeDatabase(DEFAULT_SCHEMA);
        this.cache = { ...DEFAULT_SCHEMA };
        this.lastCacheUpdate = now;
        return { ...this.cache };
      }

      const _data = fs.readFileSync(this.dbPath, 'utf8');
      let parsed;
      
      try {
        parsed = JSON.parse(data);
      } catch (parseError) {
        console.error('Database corruption detected:', parseError);
        
        // Try to restore from backup
        const _restored = this.restoreFromBackup();
        if (restored) {
          console.log('✅ Database restored from backup');
          this.cache = { ...restored };
          this.lastCacheUpdate = now;
          return { ...this.cache };
        }
        
        // If no backup available, reinitialize
        console.log('⚠️ Reinitializing database with default schema');
        this.writeDatabase(DEFAULT_SCHEMA);
        this.cache = { ...DEFAULT_SCHEMA };
        this.lastCacheUpdate = now;
        return { ...this.cache };
      }

      // Merge with default schema to ensure all tables exist
      const _mergedData = { ...DEFAULT_SCHEMA, ...parsed };
      mergedData.last_accessed = new Date().toISOString();
      
      this.cache = { ...mergedData };
      this.lastCacheUpdate = now;
      return { ...this.cache };
      
    } finally {
      lock.release();
    }
  }

  // Write database with atomic operations
  async writeDatabase(data) {
    const _lock = new DatabaseLock(this.dbPath);
    try {
      await lock.acquire();
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure for database write');
      }

      // Merge with default schema to ensure integrity
      const _safeData = { ...DEFAULT_SCHEMA, ...data };
      safeData.last_updated = new Date().toISOString();
      safeData.version = DEFAULT_SCHEMA.version;

      // Create backup before writing
      this.createBackup();

      // Atomic write using temporary file
      const _tempPath = `${this.dbPath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(safeData, null, 2), 'utf8');
      fs.renameSync(tempPath, this.dbPath);

      // Update cache
      this.cache = { ...safeData };
      this.lastCacheUpdate = Date.now();

      return true;
    } finally {
      lock.release();
    }
  }

  // Restore from most recent backup
  restoreFromBackup() {
    try {
      const _backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('db-backup-'))
        .sort()
        .reverse();

      for (const backup of backups) {
        try {
          const _backupPath = path.join(BACKUP_DIR, backup);
          const _data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
          fs.copyFileSync(backupPath, this.dbPath);
          return data;
        } catch (_error) {
          continue;
        }
      }
    } catch (_error) {
      // No backups available
    }
    return null;
  }

  // Generic CRUD operations
  async find(table, filter = {}) {
    const _db = await this.readDatabase();
    if (!db[table]) {
      throw new Error(`Table ${table} does not exist`);
    }

    let _results = db[table];
    
    Object.keys(filter).forEach(_key => {
      results = results.filter(_item => {
        if (typeof filter[key] === 'object' && filter[key] !== null) {
          // Support for operators like { $gt: value }, { $in: [values] }
          if (filter[key].$gt !== undefined) return item[key] > filter[key].$gt;
          if (filter[key].$lt !== undefined) return item[key] < filter[key].$lt;
          if (filter[key].$in !== undefined) return filter[key].$in.includes(item[key]);
          if (filter[key].$like !== undefined) return item[key]?.toString().toLowerCase().includes(filter[key].$like.toLowerCase());
        }
        return item[key] === filter[key];
      });
    });

    return results;
  }

  async findOne(table, filter = {}) {
    const _results = await this.find(table, filter);
    return results[0] || null;
  }

  async findById(table, id) {
    return await this.findOne(table, { id });
  }

  async insert(table, data) {
    const _db = await this.readDatabase();
    if (!db[table]) {
      throw new Error(`Table ${table} does not exist`);
    }

    // Generate ID if not provided
    if (!data.id) {
      data.id = crypto.randomUUID();
    }

    // Add timestamps
    data.created_at = data.created_at || new Date().toISOString();
    data.updated_at = new Date().toISOString();

    db[table].push(data);
    await this.writeDatabase(db);
    
    // Log action
    await this.logAction('INSERT', table, data.id, data);
    
    return data;
  }

  async update(table, filter, updates) {
    const _db = await this.readDatabase();
    if (!db[table]) {
      throw new Error(`Table ${table} does not exist`);
    }

    let _updated = 0;
    db[table] = db[table].map(_item => {
      const _matches = Object.keys(filter).every(key => item[key] === filter[key]);
      if (matches) {
        updated++;
        const _updatedItem = { 
          ...item, 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        
        // Log action
        this.logAction('UPDATE', table, item.id, { old: item, new: updatedItem });
        
        return updatedItem;
      }
      return item;
    });

    if (updated > 0) {
      await this.writeDatabase(db);
    }
    
    return updated;
  }

  async updateById(table, id, updates) {
    return await this.update(table, { id }, updates);
  }

  async delete(table, filter) {
    const _db = await this.readDatabase();
    if (!db[table]) {
      throw new Error(`Table ${table} does not exist`);
    }

    const _initialLength = db[table].length;
    const _toDelete = db[table].filter(item => 
      Object.keys(filter).every(key => item[key] === filter[key])
    );

    db[table] = db[table].filter(item => 
      !Object.keys(filter).every(key => item[key] === filter[key])
    );

    const _deleted = initialLength - db[table].length;
    
    if (deleted > 0) {
      await this.writeDatabase(db);
      
      // Log deletions
      toDelete.forEach(_item => {
        this.logAction('DELETE', table, item.id, item);
      });
    }
    
    return deleted;
  }

  async deleteById(table, id) {
    return await this.delete(table, { id });
  }

  // Specialized methods for common operations
  async createUser(userData) {
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    // Check if user already exists
    const _existing = await this.findOne('users', { email: userData.email });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    return await this.insert('users', {
      ...userData,
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      points: userData.points || 0,
      level: userData.level || 'Bronze'
    });
  }

  async createOrder(orderData) {
    const _orderId = crypto.randomUUID();
    
    // Create order
    const _order = await this.insert('orders', {
      ...orderData,
      id: orderId,
      status: orderData.status || 'pending'
    });

    // Create order items if provided
    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        await this.insert('order_items', {
          ...item,
          order_id: orderId
        });
      }
    }

    return order;
  }

  async getUserOrders(userId) {
    const _orders = await this.find('orders', { user_id: userId });
    
    // Populate order items
    for (const order of orders) {
      order.items = await this.find('order_items', { order_id: order.id });
    }
    
    return orders;
  }

  // Analytics and reporting
  async getStats() {
    const _db = await this.readDatabase();
    
    return {
      users: {
        total: db.users.length,
        active: db.users.filter(u => u.is_active).length,
        admins: db.users.filter(u => u.user_type === 'admin').length
      },
      orders: {
        total: db.orders.length,
        pending: db.orders.filter(o => o.status === 'pending').length,
        completed: db.orders.filter(o => o.status === 'completed').length
      },
      products: {
        total: db.products.length,
        active: db.products.filter(p => p.is_active !== false).length
      },
      revenue: {
        total: db.orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
      },
      database: {
        size: this.getDatabaseSize(),
        last_backup: this.getLastBackupTime(),
        version: db.version
      }
    };
  }

  // Utility methods
  getDatabaseSize() {
    try {
      const _stats = fs.statSync(this.dbPath);
      return `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
    } catch (_error) {
      return 'Unknown';
    }
  }

  getLastBackupTime() {
    try {
      const _backups = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith('db-backup-'))
        .sort()
        .reverse();
      
      if (backups.length > 0) {
        const _stats = fs.statSync(path.join(BACKUP_DIR, backups[0]));
        return stats.mtime.toISOString();
      }
    } catch (_error) {
      // No backups
    }
    return null;
  }

  // Audit logging
  async logAction(action, table, recordId, data) {
    try {
      const _db = await this.readDatabase();
      db.audit_logs.push({
        id: crypto.randomUUID(),
        action,
        table,
        record_id: recordId,
        data: typeof data === 'object' ? JSON.stringify(data) : data,
        timestamp: new Date().toISOString(),
        user_id: null // Can be set by middleware
      });
      
      // Keep only last 1000 audit logs
      if (db.audit_logs.length > 1000) {
        db.audit_logs = db.audit_logs.slice(-1000);
      }
      
      await this.writeDatabase(db);
    } catch (_error) {
      // Don't fail operations if audit logging fails
      console.warn('Failed to log audit action:', _error.message);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const _start = Date.now();
      const _db = await this.readDatabase();
      const _readTime = Date.now() - start;

      const _testData = { id: 'health-check', timestamp: new Date().toISOString() };
      const _writeStart = Date.now();
      await this.insert('audit_logs', testData);
      const _writeTime = Date.now() - writeStart;

      // Clean up test data
      await this.delete('audit_logs', { id: 'health-check' });

      return {
        status: 'healthy',
        read_time_ms: readTime,
        write_time_ms: writeTime,
        database_size: this.getDatabaseSize(),
        last_backup: this.getLastBackupTime(),
        cache_status: this.cache ? 'active' : 'inactive',
        total_tables: Object.keys(db).filter(key => Array.isArray(db[key])).length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Export/Import functionality
  async exportData(tables = null) {
    const _db = await this.readDatabase();
    
    if (tables) {
      const _exported = {};
      tables.forEach(_table => {
        if (db[table]) {
          exported[table] = db[table];
        }
      });
      return exported;
    }
    
    return db;
  }

  async importData(data, options = { merge: false }) {
    if (options.merge) {
      const _db = await this.readDatabase();
      Object.keys(data).forEach(_table => {
        if (Array.isArray(data[table])) {
          db[table] = db[table] || [];
          db[table].push(...data[table]);
        }
      });
      await this.writeDatabase(db);
    } else {
      await this.writeDatabase(data);
    }
    
    return true;
  }

  // Close database (cleanup)
  async close() {
    if (this.lock) {
      this.lock.release();
    }
    this.cache = null;
  }
}

// Create singleton instance
const _unifiedDB = new UnifiedDatabase();

// Legacy compatibility functions
const _readDB = () => unifiedDB.readDatabase();
const _writeDB = (data) => unifiedDB.writeDatabase(data);
const _findUser = (email) => unifiedDB.findOne('users', { email });
const _createUser = (userData) => unifiedDB.createUser(userData);

module.exports = {
  UnifiedDatabase,
  unifiedDB,
  readDB,
  writeDB,
  findUser,
  createUser,
  DEFAULT_SCHEMA
};