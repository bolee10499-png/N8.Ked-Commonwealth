const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

/**
 * DATABASE INITIALIZATION - Constitutional Schema Deployment
 * 
 * Ensures all tables exist before autonomous operation begins.
 * Triple Helix Architecture: State (users), Action (decisions), Sync (emotional_experiences)
 */
class DatabaseInitializer {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.schemaPath = path.join(__dirname, 'schema.sql');
  }

  /**
   * Initialize database with full schema
   * Idempotent: Can be run multiple times safely (CREATE IF NOT EXISTS)
   */
  initialize() {
    console.log('[DATABASE] Initializing Commonwealth schema...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`[DATABASE] Created data directory: ${dataDir}`);
    }

    // Open database
    const db = new Database(this.dbPath);
    console.log(`[DATABASE] Connected to: ${this.dbPath}`);

    // Read schema SQL
    if (!fs.existsSync(this.schemaPath)) {
      throw new Error(`Schema file not found: ${this.schemaPath}`);
    }
    
    const schema = fs.readFileSync(this.schemaPath, 'utf-8');
    console.log('[DATABASE] Schema loaded');

    // Execute schema (SQLite allows multiple statements in exec)
    db.exec(schema);
    console.log('[DATABASE] ✅ Schema deployed successfully');

    // Verify critical tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`[DATABASE] Tables created: ${tables.length}`);
    
    const tableNames = tables.map(t => t.name);
    const requiredTables = [
      'users',
      'emotional_experiences',
      'desire_evolution',
      'reflection_logs',
      'autonomous_decisions',
      'media_mentions',
      'reputation_logs',
      'dust_transactions',
      'herald_events'
    ];

    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    if (missingTables.length > 0) {
      console.error('[DATABASE] ❌ Missing required tables:', missingTables);
      throw new Error(`Database initialization failed - missing tables: ${missingTables.join(', ')}`);
    }

    console.log('[DATABASE] ✅ All required tables verified');
    console.log('[DATABASE] Commonwealth ready for autonomous operation');

    db.close();
    return true;
  }

  /**
   * Check if database is initialized
   */
  static isInitialized(dbPath) {
    if (!fs.existsSync(dbPath)) {
      return false;
    }

    try {
      const db = new Database(dbPath);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      db.close();
      
      // Check for at least one core table
      return tables.some(t => t.name === 'users');
    } catch (error) {
      console.error('[DATABASE] Error checking initialization:', error);
      return false;
    }
  }
}

module.exports = DatabaseInitializer;
