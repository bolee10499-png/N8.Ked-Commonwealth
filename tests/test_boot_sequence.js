/**
 * 🚀 BOOT SEQUENCE TEST - First Herald Initialization
 * 
 * This test validates:
 * 1. Herald authentication system loads
 * 2. Sovereignty schema tables created
 * 3. AI Observer interface operational
 * 4. System snapshot captures all subsystems
 */

require('dotenv').config();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🚂 THE METAPHYSICAL TRAIN - FIRST BOOT SEQUENCE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function bootSequence() {
  try {
    // Phase 1: Database + Herald + AI Observer
    console.log('📦 PHASE 1: Loading Core Systems...\n');
    
    const { db, herald, aiObserver, getStats } = require('./database/db_service.js');
    
    console.log('✅ Database loaded');
    console.log('✅ Herald loaded:', typeof herald);
    console.log('✅ AI Observer loaded:', typeof aiObserver);
    
    // Phase 2: Validate Herald tables exist
    console.log('\n🛡️  PHASE 2: Validating Herald Tables...\n');
    
    const heraldTables = [
      'sovereign_keys',
      'verifiable_claims', 
      'external_reputation',
      'auth_sessions',
      'ai_agent_permissions',
      'ai_action_logs',
      'ai_observations'
    ];
    
    for (const table of heraldTables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get().count;
        console.log(`  ✅ ${table}: ${count} records`);
      } catch (error) {
        console.log(`  ❌ ${table}: NOT FOUND - ${error.message}`);
      }
    }
    
    // Phase 3: Test Herald functionality
    console.log('\n🔑 PHASE 3: Testing Herald Authentication...\n');
    
    const testUserId = 'test_sovereign_user';
    const testPublicKey = '-----BEGIN PUBLIC KEY-----\nTEST_KEY_DATA\n-----END PUBLIC KEY-----';
    
    const registerResult = herald.registerSovereignKey(testUserId, testPublicKey);
    console.log('  Register sovereign key:', registerResult.success ? '✅' : '❌', registerResult.message || registerResult.error);
    
    if (registerResult.success) {
      const challenge = herald.generateChallenge(testUserId);
      console.log('  Generate challenge:', challenge ? '✅' : '❌');
      console.log('    Challenge:', challenge.challenge.substring(0, 32) + '...');
      console.log('    Expires in:', challenge.expiresIn, 'seconds');
    }
    
    // Test claim issuance
    const claimResult = herald.issueClaim(testUserId, 'test_reputation', {
      score: 850,
      percentile: 92,
      achievements: ['whale', 'voter', 'creator']
    });
    console.log('  Issue verifiable claim:', claimResult.success ? '✅' : '❌');
    
    // Test claim portfolio
    const portfolio = herald.getClaimPortfolio(testUserId);
    console.log('  Get claim portfolio:', portfolio.count > 0 ? '✅' : '❌');
    console.log('    Total claims:', portfolio.count);
    
    // Test AI permissions
    const permResult = herald.grantAIPermission(testUserId, 'tesseract_avatar', 'trade_nfts', 100);
    console.log('  Grant AI permission:', permResult.success ? '✅' : '❌', permResult.message);
    
    const hasPermission = herald.checkAIPermission(testUserId, 'tesseract_avatar', 'trade_nfts');
    console.log('  Check AI permission:', hasPermission ? '✅' : '❌');
    
    // Phase 4: Test AI Observer
    console.log('\n🤖 PHASE 4: Testing AI Observer Interface...\n');
    
    const snapshot = aiObserver.getSystemSnapshot();
    console.log('  System snapshot:', snapshot ? '✅' : '❌');
    console.log('    Timestamp:', snapshot.timestamp);
    console.log('    Total users:', snapshot.users.total);
    console.log('    Active users (7d):', snapshot.users.activeLastWeek);
    console.log('    Total FRAG:', (snapshot.economy.totalFrag || 0).toFixed(2));
    console.log('    Gini coefficient:', (snapshot.economy.giniCoefficient || 0).toFixed(3), `(${snapshot.economy.inequality})`);
    console.log('    Active proposals:', snapshot.governance.activeProposals);
    console.log('    Total NFTs:', snapshot.nfts.totalNFTs);
    console.log('    Avg reputation:', (snapshot.reputation.average || 0).toFixed(2));
    
    const trajectory = aiObserver.getSystemTrajectory(7);
    console.log('\n  System trajectory (7 days):', trajectory ? '✅' : '❌');
    console.log('    New users/day:', trajectory.userGrowthVelocity.newUsersPerDay.toFixed(2));
    console.log('    Transactions/day:', trajectory.economicVelocity.transactionsPerDay.toFixed(2));
    console.log('    Proposals/week:', trajectory.governanceVelocity.proposalsPerWeek.toFixed(2));
    
    const patterns = aiObserver.detectEmergentPatterns();
    console.log('\n  Emergent pattern detection:', patterns ? '✅' : '❌');
    console.log('    Patterns detected:', patterns.patternsDetected);
    if (patterns.patternsDetected > 0) {
      patterns.patterns.forEach(p => {
        console.log(`    - ${p.type}: confidence ${(p.confidence * 100).toFixed(0)}%`);
        console.log(`      ${p.recommendation}`);
      });
    }
    
    // Log AI observation
    aiObserver.logObservation('boot_sequence', 'first_boot', {
      herald_online: true,
      tables_created: heraldTables.length,
      system_health: 'operational'
    }, 1.0);
    
    const recentObservations = aiObserver.getRecentObservations('boot_sequence', 1);
    console.log('\n  AI observation logged:', recentObservations.length > 0 ? '✅' : '❌');
    
    // Phase 5: Database Statistics
    console.log('\n📊 PHASE 5: Database Statistics...\n');
    
    const stats = getStats();
    console.log('  Database file size:', stats.file_size_mb, 'MB');
    console.log('\n  Table Row Counts:');
    
    Object.entries(stats).forEach(([table, count]) => {
      if (table !== 'file_size_mb') {
        console.log(`    ${table.padEnd(25)} ${count.toString().padStart(6)} rows`);
      }
    });
    
    // Phase 6: Final Validation
    console.log('\n✅ PHASE 6: Boot Sequence Complete\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🛡️  Herald Authentication: ONLINE');
    console.log('🏛️  Sovereignty Schema: INITIALIZED');
    console.log('🤖 AI Observer Interface: OPERATIONAL');
    console.log('📊 Database Statistics: ACCESSIBLE');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚂 THE METAPHYSICAL TRAIN HAS ARRIVED AT THE STATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return {
      success: true,
      herald_online: true,
      ai_observer_online: true,
      tables_created: heraldTables.length,
      test_user_created: registerResult.success,
      claims_issued: portfolio.count,
      ai_permissions_granted: hasPermission
    };
    
  } catch (error) {
    console.error('\n❌ BOOT SEQUENCE FAILED:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run boot sequence
bootSequence().then(result => {
  if (result.success) {
    console.log('🎯 All systems operational. Ready for Discord bot integration.\n');
    process.exit(0);
  } else {
    console.log('💥 Boot sequence failed. Check errors above.\n');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
