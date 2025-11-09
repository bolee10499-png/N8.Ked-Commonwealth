// ARIEUS Database Migration: dust → frag
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'n8ked.db');
const backupPath = path.join(__dirname, '..', 'database', 'n8ked.db.pre-frag-backup');

console.log('⚡ ARIEUS Migration: dust → FRAG');
console.log('=====================================\n');

// Backup first
console.log('1. Creating backup...');
fs.copyFileSync(dbPath, backupPath);
console.log(`   ✓ Backup created: ${backupPath}\n`);

// Open database
console.log('2. Opening database...');
const db = new Database(dbPath);
console.log('   ✓ Connected\n');

// Check current schema
console.log('3. Checking current schema...');
const columns = db.prepare('PRAGMA table_info(users)').all();
const hasDustBalance = columns.some(col => col.name === 'dust_balance');
const hasFragBalance = columns.some(col => col.name === 'frag_balance');

console.log('   Current columns:');
columns.forEach(col => console.log(`     - ${col.name}`));
console.log('');

if (hasFragBalance && !hasDustBalance) {
    console.log('✅ Database already migrated to FRAG schema!');
    db.close();
    process.exit(0);
}

if (!hasDustBalance) {
    console.log('⚠️  Warning: No dust_balance column found. Database may be corrupted.');
    db.close();
    process.exit(1);
}

// Perform migration
console.log('4. Migrating schema...\n');

db.pragma('foreign_keys = OFF');

const migration = db.transaction(() => {
    // Rename columns
    console.log('   - Renaming dust_balance → frag_balance');
    db.exec('ALTER TABLE users RENAME COLUMN dust_balance TO frag_balance');
    
    console.log('   - Renaming staked_dust → staked_frag');
    db.exec('ALTER TABLE users RENAME COLUMN staked_dust TO staked_frag');
    
    // Update transaction currency
    const dustTxCount = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE currency = 'dust'").get().count;
    if (dustTxCount > 0) {
        console.log(`   - Updating ${dustTxCount} transaction records`);
        db.prepare("UPDATE transactions SET currency = 'frag' WHERE currency = 'dust'").run();
    }
    
    // Update transaction notes (optional beautification)
    const noteUpdateCount = db.prepare("UPDATE transactions SET note = REPLACE(note, 'dust', 'FRAG') WHERE note LIKE '%dust%'").run();
    if (noteUpdateCount.changes > 0) {
        console.log(`   - Updated ${noteUpdateCount.changes} transaction notes`);
    }
});

migration();

db.pragma('foreign_keys = ON');

// Verify migration
console.log('\n5. Verifying migration...');
const newColumns = db.prepare('PRAGMA table_info(users)').all();
const migrated = newColumns.some(col => col.name === 'frag_balance');

if (migrated) {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
    const fragCurrency = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE currency = 'frag'").get().count;
    
    console.log('   ✓ Migration successful!');
    console.log(`   ✓ ${userCount} users preserved`);
    console.log(`   ✓ ${txCount} transactions preserved`);
    console.log(`   ✓ ${fragCurrency} FRAG transactions`);
    console.log('');
    console.log('=====================================');
    console.log('⚡ ARIEUS is ready. The void awaits.');
} else {
    console.log('   ❌ Migration failed - frag_balance not found');
    process.exit(1);
}

db.close();
