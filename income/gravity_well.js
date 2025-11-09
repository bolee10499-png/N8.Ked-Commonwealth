/**
 * ⚡ ARIEUS Gravity Well
 * 
 * "The void provides for the broken souls."
 * 
 * Passive FRAG redistribution system that helps users with < 100 FRAG.
 * The Gravity Well pulls fragments from transaction fees and redistributes
 * them to struggling users, creating an economic safety net.
 * 
 * Philosophy:
 * - Users below Demon's Bazaar threshold (100 FRAG) receive passive income
 * - Funded by 1% of all transaction fees (not user balances)
 * - Proportional distribution based on how far below threshold
 * - Creates upward economic mobility
 */

const { db, statements } = require('../database/db_service.js');

class GravityWell {
  constructor() {
    // Gravity Well configuration
    this.THRESHOLD = 100;              // Users below this get help
    this.FEE_PERCENTAGE = 0.01;        // 1% of fees go to Gravity Well
    this.DISTRIBUTION_INTERVAL = 3600000; // Distribute every hour (1hr in ms)
    
    // Track accumulated fees for Gravity Well
    this.accumulatedFees = 0;
    this.lastDistribution = Date.now();
    
    // Load initial state
    this.loadState();
  }

  /**
   * Load Gravity Well state from database
   */
  loadState() {
    // Check if we have treasury data
    const treasuryData = db.prepare(`
      SELECT SUM(balance) as total 
      FROM treasury 
      WHERE source = 'gravity_well'
    `).get();
    
    this.accumulatedFees = treasuryData?.total || 0;
  }

  /**
   * Capture fees from transactions for Gravity Well
   */
  captureFees(feeAmount) {
    const gravityShare = feeAmount * this.FEE_PERCENTAGE;
    this.accumulatedFees += gravityShare;
    
    // Log to treasury
    db.prepare(`
      INSERT INTO treasury (balance, source, allocated_amount)
      VALUES (?, 'gravity_well', 0)
    `).run(gravityShare);
    
    return gravityShare;
  }

  /**
   * Get all users who qualify for Gravity Well support
   */
  getQualifyingUsers() {
    const users = db.prepare(`
      SELECT discord_id, frag_balance, reputation_score
      FROM users
      WHERE frag_balance < ?
      AND discord_id != 'platform'
      ORDER BY frag_balance ASC
    `).all(this.THRESHOLD);
    
    return users;
  }

  /**
   * Calculate distribution weights (more help for those with less)
   */
  calculateDistribution(users) {
    if (users.length === 0) return [];
    
    // Calculate deficit for each user (how far below threshold)
    const deficits = users.map(user => ({
      userId: user.discord_id,
      currentBalance: user.frag_balance,
      deficit: this.THRESHOLD - user.frag_balance,
      reputation: user.reputation_score
    }));
    
    // Total deficit across all users
    const totalDeficit = deficits.reduce((sum, u) => sum + u.deficit, 0);
    
    // Calculate proportional share for each user
    const distributions = deficits.map(user => {
      const proportion = user.deficit / totalDeficit;
      const amount = this.accumulatedFees * proportion;
      
      return {
        userId: user.userId,
        amount: amount,
        currentBalance: user.currentBalance,
        deficit: user.deficit,
        proportion: proportion
      };
    });
    
    return distributions;
  }

  /**
   * Execute Gravity Well distribution
   */
  distributeFragments() {
    const qualifyingUsers = this.getQualifyingUsers();
    
    if (qualifyingUsers.length === 0) {
      console.log('[GRAVITY WELL] No qualifying users (all above 100 FRAG threshold)');
      return {
        distributed: false,
        reason: 'no_qualifying_users',
        accumulatedFees: this.accumulatedFees
      };
    }
    
    if (this.accumulatedFees < 1) {
      console.log('[GRAVITY WELL] Insufficient accumulated fees (<1 FRAG)');
      return {
        distributed: false,
        reason: 'insufficient_fees',
        accumulatedFees: this.accumulatedFees
      };
    }
    
    const distributions = this.calculateDistribution(qualifyingUsers);
    const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
    
    // Execute distributions
    distributions.forEach(dist => {
      if (dist.amount > 0.01) { // Minimum 0.01 FRAG per user
        // Credit user
        const newBalance = dist.currentBalance + dist.amount;
        statements.updateUserBalance.run(
          newBalance,
          0, // water balance unchanged
          0, // usd balance unchanged
          dist.userId
        );
        
        // Log transaction
        statements.logTransaction.run(
          dist.userId,
          'gravity_well_distribution',
          dist.amount,
          'frag',
          `Gravity Well support: ${dist.amount.toFixed(2)} FRAG`,
          null
        );
      }
    });
    
    // Update Gravity Well state
    this.accumulatedFees -= totalDistributed;
    this.lastDistribution = Date.now();
    
    // Update treasury
    db.prepare(`
      UPDATE treasury 
      SET balance = ?, allocated_amount = allocated_amount + ?
      WHERE source = 'gravity_well'
    `).run(this.accumulatedFees, totalDistributed);
    
    console.log(`[GRAVITY WELL] Distributed ${totalDistributed.toFixed(2)} FRAG to ${distributions.length} users`);
    
    return {
      distributed: true,
      totalAmount: totalDistributed,
      recipientCount: distributions.length,
      distributions: distributions,
      remainingFees: this.accumulatedFees
    };
  }

  /**
   * Check if it's time to distribute and execute if needed
   */
  checkAndDistribute() {
    const timeSinceLastDistribution = Date.now() - this.lastDistribution;
    
    if (timeSinceLastDistribution >= this.DISTRIBUTION_INTERVAL) {
      return this.distributeFragments();
    }
    
    return {
      distributed: false,
      reason: 'not_time_yet',
      nextDistribution: this.DISTRIBUTION_INTERVAL - timeSinceLastDistribution
    };
  }

  /**
   * Get Gravity Well statistics
   */
  getStats() {
    const qualifyingUsers = this.getQualifyingUsers();
    const timeSinceLastDistribution = Date.now() - this.lastDistribution;
    const nextDistribution = Math.max(0, this.DISTRIBUTION_INTERVAL - timeSinceLastDistribution);
    
    return {
      accumulatedFees: this.accumulatedFees,
      qualifyingUserCount: qualifyingUsers.length,
      threshold: this.THRESHOLD,
      lastDistribution: this.lastDistribution,
      nextDistribution: nextDistribution,
      nextDistributionMinutes: Math.floor(nextDistribution / 60000)
    };
  }

  /**
   * Manual distribution trigger (admin command)
   */
  forceDistribute() {
    console.log('[GRAVITY WELL] Manual distribution triggered');
    return this.distributeFragments();
  }
}

module.exports = new GravityWell();
