/**
 * 🔄 JSON to SQLite Migration Script
 * 
 * Safely migrates data from:
 * - economy_data.json → SQLite users, transactions, nfts, proposals, votes tables
 * - subscription_data.json → SQLite subscriptions table
 * 
 * Safety Features:
 * ✅ Automatic backups with timestamps
 * ✅ Atomic transactions (all-or-nothing)
 * ✅ Row count verification
 * ✅ Rollback on failure
 * ✅ Dry-run mode for testing
 */

const fs = require('fs');
const path = require('path');
const { db, statements, transaction, createBackup, getStats, DB_PATH } = require('./db_service.js');

// File paths
const ECONOMY_JSON_PATH = path.join(__dirname, '../economy_data.json');
const SUBSCRIPTION_JSON_PATH = path.join(__dirname, '../subscription_data.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Migration statistics
const migrationStats = {
    startTime: null,
    endTime: null,
    recordsMigrated: {
        users: 0,
        transactions: 0,
        nfts: 0,
        proposals: 0,
        votes: 0,
        subscriptions: 0
    },
    errors: [],
    backupPaths: []
};

/**
 * 💾 Backup existing JSON files
 */
function backupJSONFiles() {
    console.log('\n📦 Creating backups of JSON files...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backups = [];

    // Backup economy_data.json if exists
    if (fs.existsSync(ECONOMY_JSON_PATH)) {
        const backupPath = path.join(BACKUP_DIR, `economy_data_${timestamp}.json`);
        fs.copyFileSync(ECONOMY_JSON_PATH, backupPath);
        backups.push(backupPath);
        console.log(`✅ Backed up economy_data.json → ${backupPath}`);
    } else {
        console.log('ℹ️  No economy_data.json found (fresh start)');
    }

    // Backup subscription_data.json if exists
    if (fs.existsSync(SUBSCRIPTION_JSON_PATH)) {
        const backupPath = path.join(BACKUP_DIR, `subscription_data_${timestamp}.json`);
        fs.copyFileSync(SUBSCRIPTION_JSON_PATH, backupPath);
        backups.push(backupPath);
        console.log(`✅ Backed up subscription_data.json → ${backupPath}`);
    } else {
        console.log('ℹ️  No subscription_data.json found (fresh start)');
    }

    // Backup SQLite database
    const dbBackup = createBackup();
    if (dbBackup) {
        backups.push(dbBackup);
    }

    migrationStats.backupPaths = backups;
    return backups;
}

/**
 * 📖 Load and parse JSON files
 */
function loadJSONData() {
    console.log('\n📖 Loading JSON data...');
    
    const data = {
        economy: null,
        subscriptions: null
    };

    // Load economy data
    if (fs.existsSync(ECONOMY_JSON_PATH)) {
        try {
            data.economy = JSON.parse(fs.readFileSync(ECONOMY_JSON_PATH, 'utf8'));
            console.log(`✅ Loaded economy_data.json (${Object.keys(data.economy).length} keys)`);
        } catch (error) {
            migrationStats.errors.push(`Failed to parse economy_data.json: ${error.message}`);
            console.error(`❌ Error parsing economy_data.json:`, error.message);
        }
    }

    // Load subscription data
    if (fs.existsSync(SUBSCRIPTION_JSON_PATH)) {
        try {
            data.subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTION_JSON_PATH, 'utf8'));
            console.log(`✅ Loaded subscription_data.json (${Object.keys(data.subscriptions).length} keys)`);
        } catch (error) {
            migrationStats.errors.push(`Failed to parse subscription_data.json: ${error.message}`);
            console.error(`❌ Error parsing subscription_data.json:`, error.message);
        }
    }

    return data;
}

/**
 * 👤 Migrate users from economy ledger
 */
function migrateUsers(economyData) {
    if (!economyData || !economyData.ledger) {
        console.log('ℹ️  No user ledger data to migrate');
        return 0;
    }

    console.log('\n👤 Migrating users...');
    let count = 0;

    const ledger = Array.isArray(economyData.ledger) 
        ? economyData.ledger 
        : Array.from(economyData.ledger || []);

    for (const [userId, balance] of ledger) {
        try {
            // Check if user already exists
            const existing = statements.getUser.get(userId);
            
            if (!existing) {
                // Create new user with dust balance
                statements.createUser.run(userId, balance || 0, 0);
                count++;
            } else {
                // Update existing user's balance
                statements.updateUserBalance.run(
                    balance || 0,
                    existing.water_balance || 0,
                    existing.usd_balance || 0,
                    userId
                );
                count++;
            }
        } catch (error) {
            migrationStats.errors.push(`User ${userId}: ${error.message}`);
            console.error(`❌ Failed to migrate user ${userId}:`, error.message);
        }
    }

    console.log(`✅ Migrated ${count} users`);
    migrationStats.recordsMigrated.users = count;
    return count;
}

/**
 * 💸 Migrate transactions from economy history
 */
function migrateTransactions(economyData) {
    if (!economyData || !economyData.transactionHistory) {
        console.log('ℹ️  No transaction history to migrate');
        return 0;
    }

    console.log('\n💸 Migrating transactions...');
    let count = 0;

    for (const tx of economyData.transactionHistory) {
        try {
            statements.logTransaction.run(
                tx.userId || tx.user_id || 'unknown',
                tx.type || 'legacy',
                tx.amount || 0,
                tx.currency || 'dust',
                tx.note || tx.action || '',
                null // royalty_stream_id - not in old format
            );
            count++;
        } catch (error) {
            migrationStats.errors.push(`Transaction: ${error.message}`);
            console.error(`❌ Failed to migrate transaction:`, error.message);
        }
    }

    console.log(`✅ Migrated ${count} transactions`);
    migrationStats.recordsMigrated.transactions = count;
    return count;
}

/**
 * 🎨 Migrate NFTs (if they exist in economy data)
 */
function migrateNFTs(economyData) {
    // NFTs might be in various formats depending on implementation
    // For now, we'll check common structures
    
    if (!economyData) {
        console.log('ℹ️  No NFT data to migrate');
        return 0;
    }

    console.log('\n🎨 Migrating NFTs...');
    let count = 0;

    // Check for NFTs in common storage locations
    const nftSources = [
        economyData.nfts,
        economyData.userNFTs,
        economyData.assets
    ].filter(Boolean);

    for (const nftCollection of nftSources) {
        const nftArray = Array.isArray(nftCollection) 
            ? nftCollection 
            : Object.values(nftCollection);

        for (const nft of nftArray) {
            try {
                statements.createNFT.run(
                    nft.owner || nft.ownerId || nft.owner_id,
                    nft.template || nft.type || 'unknown',
                    JSON.stringify(nft.metadata || {}),
                    nft.worth || nft.value || 0,
                    nft.rarity || 'common',
                    nft.transferable !== false ? 1 : 0
                );
                count++;
            } catch (error) {
                migrationStats.errors.push(`NFT: ${error.message}`);
                console.error(`❌ Failed to migrate NFT:`, error.message);
            }
        }
    }

    console.log(`✅ Migrated ${count} NFTs`);
    migrationStats.recordsMigrated.nfts = count;
    return count;
}

/**
 * 🗳️ Migrate governance proposals
 */
function migrateProposals(economyData) {
    if (!economyData || !economyData.governanceProposals) {
        console.log('ℹ️  No governance proposals to migrate');
        return 0;
    }

    console.log('\n🗳️ Migrating governance proposals...');
    let count = 0;
    let voteCount = 0;

    for (const proposal of economyData.governanceProposals) {
        try {
            // Insert proposal
            const result = statements.createProposal.run(
                proposal.author || proposal.authorId || 'unknown',
                proposal.title || 'Untitled Proposal',
                proposal.description || '',
                proposal.expiresAt ? new Date(proposal.expiresAt).toISOString() : null,
                proposal.fundingAmount || 0
            );

            const proposalId = result.lastInsertRowid;
            count++;

            // Migrate votes if they exist
            if (proposal.voters) {
                const voters = Array.isArray(proposal.voters) 
                    ? proposal.voters 
                    : Array.from(proposal.voters || []);

                for (const voterId of voters) {
                    try {
                        // Determine vote from yesVotes/noVotes arrays if available
                        const vote = (proposal.yesVoters || []).includes(voterId) ? 'yes' : 'no';
                        
                        statements.recordVote.run(
                            proposalId,
                            voterId,
                            vote,
                            1 // Default weight
                        );
                        voteCount++;
                    } catch (error) {
                        // Skip duplicate votes (UNIQUE constraint)
                        if (!error.message.includes('UNIQUE')) {
                            migrationStats.errors.push(`Vote: ${error.message}`);
                        }
                    }
                }
            }
        } catch (error) {
            migrationStats.errors.push(`Proposal: ${error.message}`);
            console.error(`❌ Failed to migrate proposal:`, error.message);
        }
    }

    console.log(`✅ Migrated ${count} proposals and ${voteCount} votes`);
    migrationStats.recordsMigrated.proposals = count;
    migrationStats.recordsMigrated.votes = voteCount;
    return count;
}

/**
 * 💳 Migrate subscriptions
 */
function migrateSubscriptions(subscriptionData) {
    if (!subscriptionData || !subscriptionData.subscriptions) {
        console.log('ℹ️  No subscriptions to migrate');
        return 0;
    }

    console.log('\n💳 Migrating subscriptions...');
    let count = 0;

    const subs = Array.isArray(subscriptionData.subscriptions)
        ? subscriptionData.subscriptions
        : Object.entries(subscriptionData.subscriptions).map(([userId, data]) => ({
            userId,
            ...data
        }));

    for (const sub of subs) {
        try {
            statements.upsertSubscription.run(
                sub.userId || sub.discord_user_id || sub.user_id,
                sub.tier || 'FREE',
                sub.price || 0,
                JSON.stringify(sub.linkedStreamers || sub.linked_streamers || []),
                sub.nextBillingDate || sub.next_billing_date || null
            );
            count++;
        } catch (error) {
            migrationStats.errors.push(`Subscription: ${error.message}`);
            console.error(`❌ Failed to migrate subscription:`, error.message);
        }
    }

    console.log(`✅ Migrated ${count} subscriptions`);
    migrationStats.recordsMigrated.subscriptions = count;
    return count;
}

/**
 * ✅ Verify migration integrity
 */
function verifyMigration(expectedCounts) {
    console.log('\n🔍 Verifying migration integrity...');
    
    const currentStats = getStats();
    let allGood = true;

    for (const [table, expectedCount] of Object.entries(expectedCounts)) {
        const actualCount = currentStats[table] || 0;
        
        if (actualCount === expectedCount) {
            console.log(`✅ ${table}: ${actualCount} records (verified)`);
        } else {
            console.error(`❌ ${table}: Expected ${expectedCount}, got ${actualCount}`);
            allGood = false;
            migrationStats.errors.push(
                `Verification failed for ${table}: expected ${expectedCount}, got ${actualCount}`
            );
        }
    }

    return allGood;
}

/**
 * 🔄 Rollback migration (restore from backups)
 */
function rollback(backupPaths) {
    console.log('\n⚠️  ROLLING BACK MIGRATION...');
    
    try {
        // Close database connection
        db.close();

        // Find database backup
        const dbBackup = backupPaths.find(p => p.endsWith('.db'));
        if (dbBackup && fs.existsSync(dbBackup)) {
            fs.copyFileSync(dbBackup, DB_PATH);
            console.log(`✅ Restored database from ${dbBackup}`);
        }

        // Restore JSON files
        const economyBackup = backupPaths.find(p => p.includes('economy_data'));
        if (economyBackup && fs.existsSync(economyBackup)) {
            fs.copyFileSync(economyBackup, ECONOMY_JSON_PATH);
            console.log(`✅ Restored economy_data.json`);
        }

        const subBackup = backupPaths.find(p => p.includes('subscription_data'));
        if (subBackup && fs.existsSync(subBackup)) {
            fs.copyFileSync(subBackup, SUBSCRIPTION_JSON_PATH);
            console.log(`✅ Restored subscription_data.json`);
        }

        console.log('✅ Rollback complete');
        return true;
    } catch (error) {
        console.error('❌ Rollback failed:', error.message);
        return false;
    }
}

/**
 * 🚀 Main migration orchestrator
 */
async function migrate(dryRun = false) {
    migrationStats.startTime = Date.now();
    
    console.log('═══════════════════════════════════════════════');
    console.log('🔄 JSON → SQLite Migration Script');
    console.log('═══════════════════════════════════════════════');
    
    if (dryRun) {
        console.log('🧪 DRY RUN MODE (no changes will be made)');
    }

    try {
        // Step 1: Create backups
        const backups = backupJSONFiles();

        // Step 2: Load JSON data
        const jsonData = loadJSONData();

        if (!dryRun) {
            // Step 3: Migrate in atomic transaction
            const migrateAll = transaction(() => {
                migrateUsers(jsonData.economy);
                migrateTransactions(jsonData.economy);
                migrateNFTs(jsonData.economy);
                migrateProposals(jsonData.economy);
                migrateSubscriptions(jsonData.subscriptions);
            });

            migrateAll();

            // Step 4: Verify migration
            const verified = verifyMigration(migrationStats.recordsMigrated);

            if (!verified) {
                console.log('\n❌ Migration verification failed!');
                
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                readline.question('\nRollback migration? (yes/no): ', (answer) => {
                    if (answer.toLowerCase() === 'yes') {
                        rollback(backups);
                    }
                    readline.close();
                    process.exit(1);
                });
            } else {
                console.log('\n✅ Migration completed successfully!');
            }
        }

        migrationStats.endTime = Date.now();

        // Step 5: Print final report
        printMigrationReport();

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
        migrationStats.errors.push(`Critical: ${error.message}`);
        
        if (!dryRun) {
            console.log('\n⚠️  Attempting rollback...');
            rollback(migrationStats.backupPaths);
        }
        
        process.exit(1);
    }
}

/**
 * 📊 Print migration report
 */
function printMigrationReport() {
    const duration = ((migrationStats.endTime - migrationStats.startTime) / 1000).toFixed(2);
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 Migration Report');
    console.log('═══════════════════════════════════════════════');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log('\n📦 Records Migrated:');
    
    for (const [table, count] of Object.entries(migrationStats.recordsMigrated)) {
        console.log(`   ${table}: ${count}`);
    }
    
    console.log(`\n💾 Backups Created: ${migrationStats.backupPaths.length}`);
    migrationStats.backupPaths.forEach(p => console.log(`   ${p}`));
    
    if (migrationStats.errors.length > 0) {
        console.log(`\n⚠️  Errors: ${migrationStats.errors.length}`);
        migrationStats.errors.slice(0, 5).forEach(e => console.log(`   ${e}`));
        if (migrationStats.errors.length > 5) {
            console.log(`   ... and ${migrationStats.errors.length - 5} more`);
        }
    } else {
        console.log('\n✅ No errors');
    }
    
    console.log('\n═══════════════════════════════════════════════');
}

// Execute migration if run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    
    migrate(dryRun).then(() => {
        console.log('\n✅ Migration script completed');
        process.exit(0);
    }).catch(error => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
}

module.exports = { migrate, rollback };
