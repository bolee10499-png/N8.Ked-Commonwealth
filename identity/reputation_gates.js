/**
 * ⚡ ARIEUS Reputation Gates
 * 
 * Progressive feature unlocking based on reputation score.
 * Reputation earned through:
 * - Daily !bite ritual
 * - Governance participation
 * - NFT creation
 * - Community engagement
 * 
 * Gates:
 * - 0-99: Basic access (bite, view)
 * - 100-499: Marketplace trading, NFT creation
 * - 500-999: Governance voting
 * - 1000+: Treasury proposals, 0% fees
 */

const { db, statements } = require('../database/db_service.js');

const REPUTATION_GATES = {
  TWILIGHT_DISTRICT: 0,      // Free tier - everyone
  DEMONS_BAZAAR: 100,         // Marketplace access
  GOVERNANCE_CHAMBER: 500,    // Voting rights
  VOID_COUNCIL: 1000          // Treasury access + 0% fees
};

class ReputationGates {
  constructor() {
    this.gates = REPUTATION_GATES;
  }

  /**
   * Get user's current reputation
   */
  getReputation(userId) {
    const user = statements.getUser.get(userId);
    return user ? user.reputation_score : 0;
  }

  /**
   * Award reputation points
   */
  awardReputation(userId, amount, reason = '') {
    const currentRep = this.getReputation(userId);
    const newRep = currentRep + amount;
    
    statements.updateReputation.run(newRep, userId);
    
    // Log transaction for audit trail
    statements.logTransaction.run(
      userId,
      'reputation_award',
      amount,
      'reputation',
      reason,
      null
    );
    
    // Check if user crossed a gate threshold
    const gatesCrossed = this.checkGatesCrossed(currentRep, newRep);
    
    return {
      previous: currentRep,
      current: newRep,
      awarded: amount,
      gatesCrossed
    };
  }

  /**
   * Check which gates were crossed
   */
  checkGatesCrossed(oldRep, newRep) {
    const crossed = [];
    
    Object.entries(this.gates).forEach(([gateName, threshold]) => {
      if (oldRep < threshold && newRep >= threshold) {
        crossed.push({
          name: gateName,
          threshold,
          rewards: this.getGateRewards(gateName)
        });
      }
    });
    
    return crossed;
  }

  /**
   * Get rewards for crossing a gate
   */
  getGateRewards(gateName) {
    const rewards = {
      TWILIGHT_DISTRICT: ['Daily !bite ritual', 'View marketplace', 'Check balance'],
      DEMONS_BAZAAR: ['Create NFTs', 'Trade in marketplace', 'List items for sale'],
      GOVERNANCE_CHAMBER: ['Vote on proposals', 'Create proposals', 'Stake FRAG'],
      VOID_COUNCIL: ['Treasury proposals', '0% transaction fees', 'Priority support']
    };
    
    return rewards[gateName] || [];
  }

  /**
   * Check if user has access to a feature
   */
  hasAccess(userId, requiredGate) {
    const userRep = this.getReputation(userId);
    const gateThreshold = this.gates[requiredGate];
    
    if (gateThreshold === undefined) {
      throw new Error(`Unknown reputation gate: ${requiredGate}`);
    }
    
    return userRep >= gateThreshold;
  }

  /**
   * Get user's current gate tier
   */
  getUserTier(userId) {
    const rep = this.getReputation(userId);
    
    if (rep >= this.gates.VOID_COUNCIL) return 'VOID_COUNCIL';
    if (rep >= this.gates.GOVERNANCE_CHAMBER) return 'GOVERNANCE_CHAMBER';
    if (rep >= this.gates.DEMONS_BAZAAR) return 'DEMONS_BAZAAR';
    return 'TWILIGHT_DISTRICT';
  }

  /**
   * Get formatted gate access message
   */
  getAccessDeniedMessage(userId, requiredGate) {
    const userRep = this.getReputation(userId);
    const gateThreshold = this.gates[requiredGate];
    const remaining = gateThreshold - userRep;
    
    const messages = {
      DEMONS_BAZAAR: `🔒 **The Demon's Bazaar is sealed.**\n\nYou need ${remaining} more reputation to trade.\nCurrent: ${userRep} | Required: ${gateThreshold}`,
      GOVERNANCE_CHAMBER: `🔒 **The Governance Chamber awaits the worthy.**\n\nYou need ${remaining} more reputation to vote.\nCurrent: ${userRep} | Required: ${gateThreshold}`,
      VOID_COUNCIL: `🔒 **The Void Council is closed to mortals.**\n\nYou need ${remaining} more reputation to propose.\nCurrent: ${userRep} | Required: ${gateThreshold}`
    };
    
    return messages[requiredGate] || `🔒 Insufficient reputation. Need ${gateThreshold}, have ${userRep}.`;
  }

  /**
   * Get gate celebration message
   */
  getGateCelebration(gateName) {
    const celebrations = {
      DEMONS_BAZAAR: `⚡ **The Demon's Bazaar opens before you!**\n\nYou've proven yourself worthy. The marketplace awaits.\n**New abilities unlocked:**\n• Create NFTs\n• Trade with others\n• List items for sale`,
      GOVERNANCE_CHAMBER: `⚡ **The Governance Chamber recognizes your voice!**\n\nYour reputation grants you power over the void.\n**New abilities unlocked:**\n• Vote on proposals\n• Create proposals\n• Shape ARIEUS destiny`,
      VOID_COUNCIL: `⚡ **The Void Council bows to your mastery!**\n\nYou have transcended. Maximum privileges granted.\n**New abilities unlocked:**\n• Treasury proposals\n• 0% transaction fees\n• Council member status`
    };
    
    return celebrations[gateName] || '⚡ Gate unlocked!';
  }

  /**
   * Automatic reputation awards for activities
   */
  autoAward = {
    dailyBite: (userId) => this.awardReputation(userId, 1, 'Daily bite ritual'),
    createNFT: (userId) => this.awardReputation(userId, 5, 'NFT creation'),
    voteProposal: (userId) => this.awardReputation(userId, 3, 'Governance vote'),
    createProposal: (userId) => this.awardReputation(userId, 10, 'Created proposal'),
    firstStake: (userId) => this.awardReputation(userId, 15, 'First FRAG stake'),
    helpCommunity: (userId) => this.awardReputation(userId, 2, 'Helped community member')
  };

  /**
   * Get user's reputation progress
   */
  getProgress(userId) {
    const rep = this.getReputation(userId);
    const tier = this.getUserTier(userId);
    
    // Find next gate
    let nextGate = null;
    let nextThreshold = null;
    
    const sortedGates = Object.entries(this.gates)
      .sort((a, b) => a[1] - b[1]);
    
    for (const [gateName, threshold] of sortedGates) {
      if (threshold > rep) {
        nextGate = gateName;
        nextThreshold = threshold;
        break;
      }
    }
    
    return {
      current: rep,
      tier,
      nextGate,
      nextThreshold,
      progress: nextThreshold ? ((rep / nextThreshold) * 100).toFixed(1) : 100,
      remaining: nextThreshold ? nextThreshold - rep : 0
    };
  }
}

module.exports = new ReputationGates();
