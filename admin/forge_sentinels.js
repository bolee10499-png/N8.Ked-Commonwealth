/**
 * 🏛️ NPC GENESIS - The Foundational Sentinels
 * 
 * Philosophy:
 * The 101 synthetic users are not trash to be deleted.
 * They are the unclaimed clay from creation - the primordial matter.
 * 
 * We transform them into SENTINELS:
 * - Transparent, labeled entities (entity_type: 'sentinel')
 * - They simulate a living economy for AI Observer pattern detection
 * - They serve as autonomous testing vessels for new features
 * - They provide social proof and guidance for real citizens
 * 
 * This is the Glass House principle applied to NPCs:
 * They are not hidden. They are a FEATURE of the commonwealth.
 */

require('dotenv').config();
const { db, herald, aiObserver } = require('../database/db_service.js');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏛️  NPC GENESIS - Forging the Foundational Sentinels');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Sentinel roles and their purposes
const SENTINEL_ROLES = {
  MARKET_MAKER: {
    count: 20,
    purpose: 'Provide baseline economic activity for pattern detection',
    behavior: 'Execute micro-transactions daily to simulate healthy economy'
  },
  GOVERNANCE_DELEGATE: {
    count: 15,
    purpose: 'Establish quorum baselines and voting patterns',
    behavior: 'Vote on proposals to maintain democratic health metrics'
  },
  REPUTATION_EXEMPLAR: {
    count: 25,
    purpose: 'Demonstrate achievement progression paths',
    behavior: 'Hold various reputation levels as reference points'
  },
  AUTONOMOUS_TESTER: {
    count: 20,
    purpose: 'Safe vessels for AI agent experimentation',
    behavior: 'Available for AI permission grants and autonomous actions'
  },
  SOCIAL_GUIDE: {
    count: 20,
    purpose: 'Provide examples and first interactions for newcomers',
    behavior: 'Visible in leaderboards and welcome messages'
  },
  PLATFORM_RESERVE: {
    count: 1,
    purpose: 'System account (already exists)',
    behavior: 'Mint/burn operations, treasury management'
  }
};

async function forgeFoundationalSentinels() {
  try {
    console.log('📊 PHASE 1: Current State Assessment...\n');
    
    // Get current users
    const existingUsers = db.prepare(`
      SELECT discord_id, frag_balance, reputation_score 
      FROM users 
      WHERE discord_id != 'platform'
      ORDER BY reputation_score DESC
    `).all();
    
    console.log(`  Found ${existingUsers.length} synthetic users to transform\n`);
    
    // Phase 2: Add entity_type column if it doesn't exist
    console.log('🔧 PHASE 2: Extending Schema for Sentinels...\n');
    
    try {
      db.prepare(`ALTER TABLE users ADD COLUMN entity_type TEXT DEFAULT 'citizen'`).run();
      console.log('  ✅ Added entity_type column to users table\n');
    } catch (error) {
      if (error.message.includes('duplicate column')) {
        console.log('  ℹ️  entity_type column already exists\n');
      } else {
        throw error;
      }
    }
    
    // Mark platform user
    db.prepare(`UPDATE users SET entity_type = 'system' WHERE discord_id = 'platform'`).run();
    
    // Phase 3: Assign roles to existing users
    console.log('🎭 PHASE 3: Assigning Sentinel Roles...\n');
    
    let assignedCount = 0;
    const roleAssignments = {};
    
    // Distribute users across roles
    for (const [role, config] of Object.entries(SENTINEL_ROLES)) {
      if (role === 'PLATFORM_RESERVE') continue; // Skip, already handled
      
      const usersForRole = existingUsers.slice(assignedCount, assignedCount + config.count);
      roleAssignments[role] = usersForRole.map(u => u.discord_id);
      
      // Update database
      const stmt = db.prepare(`UPDATE users SET entity_type = 'sentinel' WHERE discord_id = ?`);
      const updateMany = db.transaction((users) => {
        for (const user of users) {
          stmt.run(user.discord_id);
        }
      });
      
      updateMany(usersForRole);
      
      console.log(`  ✅ ${role.padEnd(22)} ${usersForRole.length} sentinels`);
      console.log(`     Purpose: ${config.purpose}`);
      console.log(`     Behavior: ${config.behavior}\n`);
      
      assignedCount += usersForRole.length;
    }
    
    // Phase 4: Grant appropriate AI permissions to AUTONOMOUS_TESTER sentinels
    console.log('🤖 PHASE 4: Granting AI Permissions to Test Vessels...\n');
    
    const autonomousTesters = roleAssignments.AUTONOMOUS_TESTER || [];
    let permissionsGranted = 0;
    
    for (const userId of autonomousTesters) {
      // Grant various AI permissions for testing
      const permissions = [
        { scope: 'read_balance', maxValue: 0 },
        { scope: 'trade_nfts', maxValue: 100 },
        { scope: 'vote_proposals', maxValue: 0 },
        { scope: 'claim_daily', maxValue: 0 }
      ];
      
      for (const perm of permissions) {
        try {
          herald.grantAIPermission(userId, 'tesseract_avatar', perm.scope, perm.maxValue);
          permissionsGranted++;
        } catch (error) {
          // Permission may already exist
        }
      }
    }
    
    console.log(`  ✅ Granted ${permissionsGranted} AI permissions to autonomous testers\n`);
    
    // Phase 5: Issue verifiable claims for REPUTATION_EXEMPLAR sentinels
    console.log('🏆 PHASE 5: Issuing Foundational Claims...\n');
    
    const exemplars = roleAssignments.REPUTATION_EXEMPLAR || [];
    let claimsIssued = 0;
    
    for (const userId of exemplars) {
      const user = existingUsers.find(u => u.discord_id === userId);
      if (!user) continue;
      
      // Issue claim based on their reputation level
      let claimType = 'foundational_spirit';
      let claimData = {
        role: 'REPUTATION_EXEMPLAR',
        reputationScore: user.reputation_score,
        balance: user.frag_balance,
        status: 'active_sentinel',
        genesis: true
      };
      
      if (user.reputation_score >= 500) {
        claimData.tier = 'governance_exemplar';
      } else if (user.reputation_score >= 100) {
        claimData.tier = 'marketplace_exemplar';
      } else {
        claimData.tier = 'newcomer_exemplar';
      }
      
      const result = herald.issueClaim(userId, claimType, claimData);
      if (result.success) claimsIssued++;
    }
    
    console.log(`  ✅ Issued ${claimsIssued} foundational claims\n`);
    
    // Phase 6: Create public transparency record
    console.log('📜 PHASE 6: Documenting Transparency...\n');
    
    const transparencyDoc = {
      created: new Date().toISOString(),
      totalSentinels: assignedCount,
      roleDistribution: Object.entries(roleAssignments).map(([role, users]) => ({
        role,
        count: users.length,
        purpose: SENTINEL_ROLES[role].purpose
      })),
      philosophy: 'Glass House Integrity: Sentinels are labeled, visible, and serve the commonwealth.',
      verification: 'Query: SELECT discord_id, entity_type FROM users WHERE entity_type = "sentinel"'
    };
    
    // Log to AI Observer
    aiObserver.logObservation(
      'npc_genesis',
      'sentinel_creation',
      transparencyDoc,
      1.0
    );
    
    console.log('  ✅ Transparency record logged to AI Observer\n');
    
    // Phase 7: Final statistics
    console.log('📊 PHASE 7: Genesis Complete - Final Statistics...\n');
    
    const finalStats = {
      citizens: db.prepare(`SELECT COUNT(*) as count FROM users WHERE entity_type = 'citizen'`).get().count,
      sentinels: db.prepare(`SELECT COUNT(*) as count FROM users WHERE entity_type = 'sentinel'`).get().count,
      system: db.prepare(`SELECT COUNT(*) as count FROM users WHERE entity_type = 'system'`).get().count,
      totalUsers: db.prepare(`SELECT COUNT(*) as count FROM users`).get().count,
      sovereignKeys: db.prepare(`SELECT COUNT(*) as count FROM sovereign_keys`).get().count,
      verifiableClaims: db.prepare(`SELECT COUNT(*) as count FROM verifiable_claims`).get().count,
      aiPermissions: db.prepare(`SELECT COUNT(*) as count FROM ai_agent_permissions`).get().count
    };
    
    console.log('  Entity Distribution:');
    console.log(`    Citizens (real users): ${finalStats.citizens}`);
    console.log(`    Sentinels (NPCs):      ${finalStats.sentinels}`);
    console.log(`    System accounts:       ${finalStats.system}`);
    console.log(`    ────────────────────`);
    console.log(`    Total:                 ${finalStats.totalUsers}\n`);
    
    console.log('  Sovereignty Infrastructure:');
    console.log(`    Sovereign keys:        ${finalStats.sovereignKeys}`);
    console.log(`    Verifiable claims:     ${finalStats.verifiableClaims}`);
    console.log(`    AI permissions:        ${finalStats.aiPermissions}\n`);
    
    // Create sentinel roster
    console.log('📋 PHASE 8: Generating Sentinel Roster...\n');
    
    const roster = {};
    for (const [role, userIds] of Object.entries(roleAssignments)) {
      roster[role] = {
        count: userIds.length,
        purpose: SENTINEL_ROLES[role].purpose,
        behavior: SENTINEL_ROLES[role].behavior,
        sampleIds: userIds.slice(0, 3) // First 3 as examples
      };
    }
    
    require('fs').writeFileSync(
      'admin/SENTINEL_ROSTER.json',
      JSON.stringify({ 
        generated: new Date().toISOString(),
        totalSentinels: assignedCount,
        roles: roster,
        transparency: transparencyDoc
      }, null, 2)
    );
    
    console.log('  ✅ Roster saved to admin/SENTINEL_ROSTER.json\n');
    
    // Final output
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ NPC GENESIS COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`🏛️  ${finalStats.sentinels} Foundational Sentinels forged from synthetic clay`);
    console.log(`🔬 ${permissionsGranted} AI permissions granted for autonomous testing`);
    console.log(`📜 ${claimsIssued} foundational claims issued`);
    console.log(`\n🎯 The commonwealth now has a living, breathing foundation.`);
    console.log(`🌟 The city was never empty. It was waiting for its citizens.\n`);
    
    return {
      success: true,
      sentinels: finalStats.sentinels,
      roles: Object.keys(roleAssignments).length,
      permissions: permissionsGranted,
      claims: claimsIssued
    };
    
  } catch (error) {
    console.error('\n❌ GENESIS FAILED:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute genesis
forgeFoundationalSentinels().then(result => {
  process.exit(result.success ? 0 : 1);
});
