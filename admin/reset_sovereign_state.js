/**
 * 🗑️ SOVEREIGN STATE RESET - Return to Genesis
 * 
 * This script wipes all synthetic test data and returns the database
 * to its constitutional, empty state - ready for its first true citizen.
 * 
 * Philosophy:
 * Test users are scaffolding. Real users are sovereignty.
 * Before launch, sweep away the construction debris.
 * 
 * What Gets Wiped:
 * - All users (except 'platform' system user)
 * - All transactions
 * - All NFTs
 * - All proposals and votes
 * - All Herald sovereign keys
 * - All verifiable claims
 * - All AI permissions and logs
 * - All subscriptions
 * - All platform integrations
 * 
 * What Stays:
 * - Database schema (all tables intact)
 * - Royalty stream definitions (templates)
 * - Treasury balance structure
 * - System configuration
 */

require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database', 'n8ked.db');
const BACKUP_DIR = path.join(__dirname, 'database', 'backups');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🗑️  SOVEREIGN STATE RESET - Return to Genesis');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function resetToGenesisState() {
  try {
    // Step 1: Create backup before wiping
    console.log('📦 STEP 1: Creating pre-reset backup...\n');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `pre_reset_${timestamp}.db`);
    
    fs.copyFileSync(DB_PATH, backupPath);
    const backupSize = (fs.statSync(backupPath).size / 1024).toFixed(2);
    console.log(`  ✅ Backup created: ${backupPath}`);
    console.log(`  📊 Backup size: ${backupSize} KB\n`);
    
    // Step 2: Connect to database
    console.log('🔌 STEP 2: Connecting to database...\n');
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
    
    // Step 3: Capture current state statistics
    console.log('📊 STEP 3: Current State (Before Reset)...\n');
    
    const tables = [
      'users', 'transactions', 'nfts', 'proposals', 'votes',
      'subscriptions', 'royalty_streams', 'treasury',
      'identity_achievements', 'platform_integrations',
      'sovereign_keys', 'verifiable_claims', 'external_reputation',
      'auth_sessions', 'ai_agent_permissions', 'ai_action_logs', 'ai_observations'
    ];
    
    const beforeStats = {};
    tables.forEach(table => {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
        beforeStats[table] = count;
        if (count > 0) {
          console.log(`  ${table.padEnd(25)} ${count.toString().padStart(6)} rows`);
        }
      } catch (error) {
        beforeStats[table] = 0;
      }
    });
    
    const totalRecords = Object.values(beforeStats).reduce((sum, count) => sum + count, 0);
    console.log(`\n  📊 Total records: ${totalRecords}\n`);
    
    // Step 4: Execute the purge
    console.log('🗑️  STEP 4: Executing Sovereign Purge...\n');
    
    // Begin transaction for atomic wipe
    db.prepare('BEGIN').run();
    
    try {
      // Delete in proper order (respecting foreign keys)
      
      // 1. AI systems (no dependencies)
      console.log('  🤖 Wiping AI observations...');
      db.prepare('DELETE FROM ai_observations').run();
      console.log('  🤖 Wiping AI action logs...');
      db.prepare('DELETE FROM ai_action_logs').run();
      console.log('  🤖 Wiping AI agent permissions...');
      db.prepare('DELETE FROM ai_agent_permissions').run();
      
      // 2. Herald authentication (depends on users)
      console.log('  🛡️  Wiping auth sessions...');
      db.prepare('DELETE FROM auth_sessions').run();
      console.log('  🛡️  Wiping external reputation...');
      db.prepare('DELETE FROM external_reputation').run();
      console.log('  🛡️  Wiping verifiable claims...');
      db.prepare('DELETE FROM verifiable_claims').run();
      console.log('  🛡️  Wiping sovereign keys...');
      db.prepare('DELETE FROM sovereign_keys').run();
      
      // 3. Platform integrations
      console.log('  🔗 Wiping platform integrations...');
      db.prepare('DELETE FROM platform_integrations').run();
      
      // 4. Identity achievements
      console.log('  🏆 Wiping identity achievements...');
      db.prepare('DELETE FROM identity_achievements').run();
      
      // 5. Governance (votes depend on proposals)
      console.log('  🗳️  Wiping votes...');
      db.prepare('DELETE FROM votes').run();
      console.log('  📜 Wiping proposals...');
      db.prepare('DELETE FROM proposals').run();
      
      // 6. Economic data
      console.log('  💰 Wiping treasury records...');
      db.prepare('DELETE FROM treasury').run();
      console.log('  💸 Wiping royalty streams...');
      db.prepare('DELETE FROM royalty_streams').run();
      console.log('  🎨 Wiping NFTs...');
      db.prepare('DELETE FROM nfts').run();
      console.log('  📊 Wiping transactions...');
      db.prepare('DELETE FROM transactions').run();
      
      // 7. Subscriptions
      console.log('  📅 Wiping subscriptions...');
      db.prepare('DELETE FROM subscriptions').run();
      
      // 8. Analytics caches
      console.log('  📈 Wiping Twitch analytics cache...');
      try {
        db.prepare('DELETE FROM twitch_analytics').run();
      } catch (error) {
        // Table might not exist
      }
      
      // 9. Resilience events
      console.log('  ⚡ Wiping resilience events...');
      try {
        db.prepare('DELETE FROM resilience_events').run();
      } catch (error) {
        // Table might not exist
      }
      
      // 10. Users (CASCADE will handle remaining dependencies)
      console.log('  👥 Wiping all users (except platform)...');
      db.prepare("DELETE FROM users WHERE discord_id != 'platform'").run();
      
      // Commit the purge
      db.prepare('COMMIT').run();
      
      console.log('\n  ✅ Purge complete\n');
      
    } catch (error) {
      // Rollback on error
      db.prepare('ROLLBACK').run();
      throw error;
    }
    
    // Step 5: Verify empty state
    console.log('✅ STEP 5: Genesis State (After Reset)...\n');
    
    const afterStats = {};
    tables.forEach(table => {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
        afterStats[table] = count;
        if (count > 0) {
          console.log(`  ${table.padEnd(25)} ${count.toString().padStart(6)} rows (retained)`);
        }
      } catch (error) {
        afterStats[table] = 0;
      }
    });
    
    const remainingRecords = Object.values(afterStats).reduce((sum, count) => sum + count, 0);
    console.log(`\n  📊 Remaining records: ${remainingRecords}`);
    
    // Step 6: Reset SQLite auto-increment counters
    console.log('\n🔄 STEP 6: Resetting auto-increment counters...\n');
    
    db.prepare("DELETE FROM sqlite_sequence").run();
    console.log('  ✅ All ID counters reset to 1\n');
    
    // Step 7: Vacuum database to reclaim space
    console.log('🧹 STEP 7: Vacuuming database...\n');
    
    const beforeSize = (fs.statSync(DB_PATH).size / 1024).toFixed(2);
    db.prepare('VACUUM').run();
    const afterSize = (fs.statSync(DB_PATH).size / 1024).toFixed(2);
    const reclaimed = (beforeSize - afterSize).toFixed(2);
    
    console.log(`  📦 Before: ${beforeSize} KB`);
    console.log(`  📦 After: ${afterSize} KB`);
    console.log(`  ♻️  Reclaimed: ${reclaimed} KB\n`);
    
    // Step 8: Close database
    db.close();
    
    // Final report
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ GENESIS STATE ACHIEVED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`📊 Records purged: ${totalRecords - remainingRecords}`);
    console.log(`💾 Database size: ${afterSize} KB`);
    console.log(`📦 Backup location: ${backupPath}`);
    console.log(`\n🎯 The database is now in its constitutional, empty state.`);
    console.log(`🚀 Ready for its first true citizen.\n`);
    
    return {
      success: true,
      recordsPurged: totalRecords - remainingRecords,
      databaseSize: afterSize,
      backupPath
    };
    
  } catch (error) {
    console.error('\n❌ RESET FAILED:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute reset with confirmation prompt
console.log('⚠️  WARNING: This will delete all data except the platform user.');
console.log('⚠️  A backup will be created automatically.\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Type "RESET" to confirm sovereign state wipe: ', (answer) => {
  rl.close();
  
  if (answer.trim().toUpperCase() === 'RESET') {
    console.log('\n🔥 Confirmation received. Initiating reset...\n');
    resetToGenesisState().then(result => {
      process.exit(result.success ? 0 : 1);
    });
  } else {
    console.log('\n❌ Reset cancelled. Database unchanged.\n');
    process.exit(0);
  }
});
