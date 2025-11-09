/**
 * TIERED ACCESS SYSTEM
 * Glass House with Mystery
 * 
 * Philosophy: Code is transparent. Execution is gated.
 * Users can SEE what's possible, but must EARN access.
 */

const AccessTiers = {
  // Level 0: Newcomer (20% spectrum)
  newcomer: {
    percentage: 20,
    price: 0,
    name: 'Newcomer',
    color: '#808080', // Gray
    
    access: {
      commands: [
        '/reputation', // See your score
        '/dust', // See balance
        '/status', // See system health
        '/help' // Get started
      ],
      
      inner_world: ['herald_chamber'], // Can only see surface
      
      wallet_federation: false, // Cannot link wallets yet
      council_observer: false, // Cannot see council deliberations
      pattern_contribution: false // Cannot submit patterns
    },
    
    mystery: {
      visible_but_locked: [
        'sovereignty_vault - "Requires Beta Access"',
        'wallet_roots - "Multi-chain federation locked"',
        'council_chamber - "Observer status unavailable"'
      ],
      
      hooks: [
        'The Herald testifies... but you cannot ask WHY yet',
        'You see others aggregating dust across chains... but yours stays on one',
        'The Council deliberates above... but you cannot observe'
      ]
    },
    
    impulse_triggers: [
      'See Beta users with 4-chain federation',
      'Notice higher reputation scores getting Herald mentions',
      'Watch Citizens earning from pattern contributions'
    ]
  },

  // Level 1: Beta Tester (40% spectrum)
  beta_tester: {
    percentage: 40,
    price: 27, // $27 consultation = beta access (30 days)
    name: 'Beta Tester',
    color: '#4169E1', // Royal Blue
    
    access: {
      commands: [
        ...AccessTiers.newcomer.access.commands,
        '/wallet', // Link wallets
        '/federation', // View cross-chain dust
        '/explore <location>', // Explore Inner World (depth 0-2)
        '/council observe' // Watch council (read-only)
      ],
      
      inner_world: [
        'herald_chamber',
        'citizen_plaza',
        'sovereignty_vault',
        'dust_mines',
        'wallet_roots',
        'water_reservoir',
        'archetype_library'
      ],
      
      wallet_federation: true, // 4 chains max
      council_observer: true, // Can watch, not vote
      pattern_contribution: false // Still locked
    },
    
    mystery: {
      visible_but_locked: [
        'economic_engine - "Citizen tier required"',
        'pattern_forge - "Submit patterns to unlock"',
        'herald_sanctum - "Inner sanctum access restricted"',
        'quantum_core - "Sovereign status only"'
      ],
      
      hooks: [
        'You can aggregate dust... but Citizens earn INTEREST on theirs',
        'You observe the Council... but Citizens can VOTE',
        'You explore caves... but the SEWERS hold the real power'
      ]
    },
    
    impulse_triggers: [
      'Citizens earning passive income from patterns',
      'Council votes showing real governance impact',
      'Sovereign keys granting unknown privileges'
    ]
  },

  // Level 2: Citizen (70% spectrum)
  citizen: {
    percentage: 70,
    price: 97, // $97/month subscription
    name: 'Citizen',
    color: '#FFD700', // Gold
    
    access: {
      commands: [
        ...AccessTiers.beta_tester.access.commands,
        '/pattern submit <data>', // Contribute patterns
        '/council vote <proposal>', // Vote on proposals
        '/revenue', // See your earnings
        '/explore deep' // Access sewers (depth 3-4)
      ],
      
      inner_world: [
        ...AccessTiers.beta_tester.access.inner_world,
        'economic_engine',
        'cross_chain_bridge',
        'pattern_forge',
        'herald_sanctum',
        'evolution_chamber'
      ],
      
      wallet_federation: true, // Unlimited chains
      council_observer: true,
      council_voting: true, // Can vote
      pattern_contribution: true, // Earns revenue share
      revenue_sharing: 0.30 // 30% of value from your patterns
    },
    
    mystery: {
      visible_but_locked: [
        'quantum_core - "Sovereign status only"',
        'genesis_vault - "Invitation required"',
        'sentinel_command - "Admin privileges needed"'
      ],
      
      hooks: [
        'You vote on proposals... but Sovereigns CREATE them',
        'You earn 30% revenue... but Sovereigns earn 70%',
        'You access the sewers... but the CORE remains sealed'
      ]
    },
    
    impulse_triggers: [
      'Sovereigns with direct Herald access',
      'Pattern contributions earning hundreds monthly',
      'Quantum core containing "the source code of genius"'
    ]
  },

  // Level 3: Sovereign (100% spectrum)
  sovereign: {
    percentage: 100,
    price: 'Invitation Only', // Must prove contribution
    name: 'Sovereign',
    color: '#9400D3', // Deep Purple
    
    access: {
      commands: [
        ...AccessTiers.citizen.access.commands,
        '/herald admin', // Direct Herald configuration
        '/sentinel <command>', // Command Sentinel NPCs
        '/proposal create', // Create governance proposals
        '/explore quantum_core', // Access deepest layer
        '/architect' // View and suggest code changes
      ],
      
      inner_world: 'ALL', // Full access
      
      wallet_federation: true,
      council_observer: true,
      council_voting: true,
      council_creation: true, // Create proposals
      pattern_contribution: true,
      revenue_sharing: 0.70, // 70% of value from your patterns
      code_access: true, // Can view implementation
      sentinel_command: true // Direct NPC control
    },
    
    mystery: {
      visible_but_locked: [], // No mysteries - full glass house
      
      hooks: [
        'You ARE the system',
        'Your patterns become law',
        'The architecture bends to your vision'
      ]
    },
    
    impulse_triggers: [] // No need - already achieved everything
  }
};

/**
 * Tier Validation Middleware
 */
function validateAccess(userId, requiredTier, specificFeature = null) {
  const userTier = getUserTier(userId); // From database
  
  const tierHierarchy = ['newcomer', 'beta_tester', 'citizen', 'sovereign'];
  const userLevel = tierHierarchy.indexOf(userTier);
  const requiredLevel = tierHierarchy.indexOf(requiredTier);
  
  if (userLevel < requiredLevel) {
    return {
      allowed: false,
      tier: userTier,
      required: requiredTier,
      upgrade_message: generateUpgradeMessage(userTier, requiredTier, specificFeature)
    };
  }
  
  // Check specific feature access
  if (specificFeature) {
    const tierConfig = AccessTiers[userTier];
    const hasFeature = tierConfig.access[specificFeature];
    
    if (!hasFeature) {
      return {
        allowed: false,
        tier: userTier,
        required: requiredTier,
        upgrade_message: generateFeatureUpgradeMessage(userTier, specificFeature)
      };
    }
  }
  
  return { allowed: true, tier: userTier };
}

/**
 * Generate upgrade message with mystery hooks
 */
function generateUpgradeMessage(currentTier, requiredTier, feature) {
  const current = AccessTiers[currentTier];
  const required = AccessTiers[requiredTier];
  
  const mystery = current.mystery.visible_but_locked.find(m => m.includes(feature)) || 
                  current.mystery.hooks[0];
  
  return {
    title: `🔒 ${required.name} Access Required`,
    description: mystery,
    price: required.price,
    benefits: `Unlock ${required.percentage}% of N8.KED Commonwealth`,
    impulse: current.impulse_triggers[Math.floor(Math.random() * current.impulse_triggers.length)],
    cta: required.price === 0 ? 'Join Now (Free)' : 
         typeof required.price === 'number' ? `Upgrade for $${required.price}` :
         'Apply for Invitation'
  };
}

/**
 * Helper: Get user tier from database
 */
function getUserTier(userId) {
  const { db } = require('../database/db_service');
  
  const user = db.prepare('SELECT user_type FROM users WHERE discord_id = ?').get(userId);
  
  if (!user) return 'newcomer';
  
  // Map user_type to tier
  const tierMap = {
    'newcomer': 'newcomer',
    'beta_tester': 'beta_tester',
    'citizen': 'citizen',
    'sovereign': 'sovereign',
    'sentinel_npc': 'sovereign' // Sentinels are sovereign-level
  };
  
  return tierMap[user.user_type] || 'newcomer';
}

/**
 * Upgrade user tier (after payment)
 */
function upgradeTier(userId, newTier) {
  const { db } = require('../database/db_service');
  
  db.prepare('UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE discord_id = ?')
    .run(newTier, userId);
  
  // Log the upgrade
  db.prepare('INSERT INTO reputation_logs (user_id, action_type, reputation_delta, reason) VALUES (?, ?, ?, ?)')
    .run(userId, 'tier_upgrade', 0, `Upgraded to ${newTier}`);
  
  return {
    success: true,
    tier: newTier,
    access_percentage: AccessTiers[newTier].percentage,
    new_commands: AccessTiers[newTier].access.commands
  };
}

module.exports = {
  AccessTiers,
  validateAccess,
  getUserTier,
  upgradeTier
};
