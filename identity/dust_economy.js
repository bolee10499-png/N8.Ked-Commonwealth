const path = require('path');
const { db, statements, transaction } = require('../database/db_service.js');

class DustEconomy {
  constructor(dataFilePath = null) {
    // Legacy parameter kept for backward compatibility
    this.dataFilePath = dataFilePath || path.join(process.cwd(), 'economy_data.json');
    
    this.ledger = new Map();
    this.transactionHistory = [];
    this.cooldowns = new Map();
    this.assetReserves = {
      waterLiters: 0.0,
      usdCents: 0,
      backingRatio: 1000 // 1 liter water = 1000 dust
    };
    this.waterLedger = [];
    
    // Cooldown settings - ARIEUS Daily Ritual
    this.BITE_COOLDOWN_MS = 86400000; // 24 hours (daily dusk ritual)
    
    // STEP 4: Governance System
    this.governanceProposals = [];
    this.PROPOSAL_COST = 10; // dust cost to create proposal
    this.PROPOSAL_DURATION_MS = 24 * 3600 * 1000; // 24 hours
    this.PASS_THRESHOLD = 0.6; // 60% to pass
    
    // STEP 5: Monetization Bridge
    this.redemptionOffers = {
      consultation: {
        name: 'Quantum Pattern Recognition Session',
        dustCost: 100,
        realValue: 27.00,
        description: '30-min consultation to "see the source code" in your domain'
      },
      analysis: {
        name: 'System Architecture Analysis',
        dustCost: 50,
        realValue: 15.00,
        description: 'Quick architectural review and pattern recognition'
      },
      microtask: {
        name: '$1 Micro-Task',
        dustCost: 10,
        realValue: 1.00,
        description: 'Small paid task via payment platform'
      }
    };
    this.redemptionHistory = [];
    
    // STEP 7: Security Layer
    this.securityEvents = [];
    this.rateLimits = {
      bite: 30,     // Max 30 per hour
      transfer: 20, // Max 20 per hour
      propose: 5    // Max 5 per hour
    };
    this.userRateLimits = new Map();
    this.rateLimitWindows = new Map();
    
    // STEP 8: Advanced Economics
    this.economicEvents = [];
    this.INFLATION_RATE = 0.05; // 5% annual
    this.DUST_BURN_RATE = 0.01; // 1% transaction burn
    this.STAKE_APR = 0.10; // 10% annual staking yield
    this.stakes = new Map(); // userId -> { amount, timestamp }
    
    // Load existing data
    this.loadData();
  }

  // STEP 1: Cooldown System
  checkCooldown(actorId, action = 'bite') {
    const cooldownKey = `${actorId}-${action}`;
    const lastAction = this.cooldowns.get(cooldownKey);
    
    if (!lastAction) {
      return { canAct: true, remainingMs: 0 };
    }
    
    const elapsed = Date.now() - lastAction;
    const remaining = this.BITE_COOLDOWN_MS - elapsed;
    
    if (remaining <= 0) {
      return { canAct: true, remainingMs: 0 };
    }
    
    return { canAct: false, remainingMs: remaining };
  }

  setCooldown(actorId, action = 'bite') {
    const cooldownKey = `${actorId}-${action}`;
    this.cooldowns.set(cooldownKey, Date.now());
  }

  // STEP 2: Transaction Ledger
  addTransaction(actorId, type, amount, note = '') {
    const transaction = {
      timestamp: Date.now(),
      actorId,
      type,
      amount,
      balanceAfter: this.balance(actorId),
      note
    };
    
    // Store in memory for quick access
    this.transactionHistory.push(transaction);
    
    // Keep only last 1000 transactions in memory
    if (this.transactionHistory.length > 1000) {
      this.transactionHistory.shift();
    }
    
    // Persist to SQLite database
    try {
      statements.logTransaction.run(
        actorId,
        type,
        amount,
        'dust', // currency
        note,
        null // royalty_stream_id
      );
    } catch (error) {
      console.error('Failed to log transaction to database:', error);
    }
    
    // Auto-save balances on important transaction types
    if (['redemption', 'stake', 'unstake', 'burn'].includes(type)) {
      this.saveData();
    }
    
    return transaction;
  }

  getRecentTransactions(limit = 10) {
    return this.transactionHistory.slice(-limit).reverse();
  }

  getUserTransactions(actorId, limit = 10) {
    const userTxs = this.transactionHistory.filter(tx => tx.actorId === actorId);
    return userTxs.slice(-limit).reverse();
  }

  // STEP 3: Asset Backing
  addWaterReserve(liters, source = 'manual_add') {
    if (liters <= 0) {
      throw new Error('Water amount must be positive');
    }
    
    this.assetReserves.waterLiters += liters;
    
    const transaction = {
      timestamp: Date.now(),
      liters,
      totalWater: this.assetReserves.waterLiters,
      source
    };
    
    this.waterLedger.push(transaction);
    
    // Keep only last 100 water additions
    if (this.waterLedger.length > 100) {
      this.waterLedger.shift();
    }
    
    return transaction;
  }

  getReserveStatus() {
    const totalDust = Array.from(this.ledger.values()).reduce((sum, val) => sum + val, 0);
    const backedDust = this.assetReserves.waterLiters * this.assetReserves.backingRatio;
    const coveragePercent = totalDust > 0 ? (backedDust / totalDust) * 100 : 100;
    
    return {
      totalDust,
      backedDust,
      coveragePercent,
      waterLiters: this.assetReserves.waterLiters,
      backingRatio: this.assetReserves.backingRatio,
      isFullyBacked: coveragePercent >= 100
    };
  }

  getWaterHistory(limit = 10) {
    return this.waterLedger.slice(-limit).reverse();
  }

  // Enhanced credit/debit with transaction tracking
  credit(actorId, amount, note = '') {
    if (!this.ledger.has(actorId)) {
      this.ledger.set(actorId, 0);
    }
    const newBalance = this.ledger.get(actorId) + amount;
    this.ledger.set(actorId, newBalance);
    
    // Record transaction
    this.addTransaction(actorId, amount > 0 ? 'credit' : 'debit', amount, note);
    
    return newBalance;
  }

  debit(actorId, amount, note = '') {
    return this.credit(actorId, -amount, note || 'debit');
  }

  balance(actorId) {
    return this.ledger.get(actorId) ?? 0;
  }

  getTotalCirculation() {
    return Array.from(this.ledger.values()).reduce((sum, val) => sum + val, 0);
  }

  // STEP 4: Governance Methods
  createProposal(creatorId, proposalType, description, parameters = {}) {
    const proposalId = this.governanceProposals.length + 1;
    
    const proposal = {
      id: proposalId,
      creatorId,
      proposalType,
      description,
      parameters,
      votes: { yes: 0, no: 0 },
      voters: new Set(),
      createdAt: Date.now(),
      status: 'active', // active, passed, failed
      totalDustVoted: 0
    };
    
    this.governanceProposals.push(proposal);
    return proposal;
  }

  castVote(proposalId, voterId, voteChoice) {
    const proposal = this.governanceProposals.find(p => p.id === proposalId && p.status === 'active');
    
    if (!proposal) {
      throw new Error('Proposal not found or voting ended');
    }
    
    if (proposal.voters.has(voterId)) {
      throw new Error('Already voted on this proposal');
    }
    
    const votingPower = this.balance(voterId);
    if (votingPower <= 0) {
      throw new Error('Need dust to vote');
    }
    
    if (!['yes', 'no'].includes(voteChoice)) {
      throw new Error('Vote must be yes or no');
    }
    
    proposal.votes[voteChoice] += votingPower;
    proposal.voters.add(voterId);
    proposal.totalDustVoted += votingPower;
    
    return {
      proposal,
      votingPower,
      totalVoted: proposal.totalDustVoted
    };
  }

  getActiveProposals() {
    return this.governanceProposals.filter(p => p.status === 'active');
  }

  getRecentProposals(limit = 5) {
    return this.governanceProposals.slice(-limit).reverse();
  }

  processExpiredProposals() {
    const now = Date.now();
    const results = [];
    
    for (const proposal of this.governanceProposals) {
      if (proposal.status !== 'active') continue;
      
      const age = now - proposal.createdAt;
      if (age > this.PROPOSAL_DURATION_MS) {
        const totalVotes = proposal.votes.yes + proposal.votes.no;
        
        if (totalVotes > 0) {
          const yesRatio = proposal.votes.yes / totalVotes;
          proposal.status = yesRatio >= this.PASS_THRESHOLD ? 'passed' : 'failed';
          
          results.push({
            id: proposal.id,
            status: proposal.status,
            yesRatio,
            totalVotes
          });
        } else {
          proposal.status = 'failed'; // No votes = failed
          results.push({ id: proposal.id, status: 'failed', reason: 'no_votes' });
        }
      }
    }
    
    return results;
  }

  // STEP 5: Monetization Bridge Methods
  getRedemptionOffer(offerType) {
    return this.redemptionOffers[offerType.toLowerCase()];
  }

  getAllOffers() {
    return this.redemptionOffers;
  }

  processRedemption(actorId, offerType) {
    const offer = this.getRedemptionOffer(offerType);
    
    if (!offer) {
      throw new Error(`Offer not found: ${offerType}`);
    }
    
    const userBalance = this.balance(actorId);
    
    if (userBalance < offer.dustCost) {
      throw new Error(`Insufficient dust. Need ${offer.dustCost}, have ${userBalance}`);
    }
    
    // Deduct dust
    this.debit(actorId, offer.dustCost, `Redeemed: ${offer.name}`);
    
    // Record redemption
    const redemption = {
      timestamp: Date.now(),
      actorId,
      offerType,
      offerName: offer.name,
      dustCost: offer.dustCost,
      realValue: offer.realValue,
      status: 'pending' // pending, fulfilled, cancelled
    };
    
    this.redemptionHistory.push(redemption);
    
    // Keep only last 100 redemptions
    if (this.redemptionHistory.length > 100) {
      this.redemptionHistory.shift();
    }
    
    return redemption;
  }

  getRedemptionHistory(limit = 10) {
    return this.redemptionHistory.slice(-limit).reverse();
  }

  getUserRedemptions(actorId, limit = 10) {
    const userRedemptions = this.redemptionHistory.filter(r => r.actorId === actorId);
    return userRedemptions.slice(-limit).reverse();
  }

  getEconomyStatus() {
    const totalDust = this.getTotalCirculation();
    const totalUsers = this.ledger.size;
    const reserveStatus = this.getReserveStatus();
    
    // Calculate total potential value in USD
    let totalPotentialValue = 0;
    for (const offer of Object.values(this.redemptionOffers)) {
      const dustValueRatio = offer.realValue / offer.dustCost;
      totalPotentialValue += totalDust * dustValueRatio;
    }
    
    return {
      totalDust,
      totalUsers,
      backedDust: reserveStatus.backedDust,
      coveragePercent: reserveStatus.coveragePercent,
      potentialValueUSD: totalPotentialValue / Object.keys(this.redemptionOffers).length, // Average
      totalRedemptionOffers: Object.keys(this.redemptionOffers).length,
      totalProposals: this.governanceProposals.length,
      activeProposals: this.getActiveProposals().length,
      totalRedemptions: this.redemptionHistory.length,
      isHealthy: reserveStatus.coveragePercent >= 80
    };
  }

  // STEP 6: Persistent Storage Methods
  saveData() {
    try {
      // SQLite-based persistence (replaces JSON file writes)
      const saveAll = transaction(() => {
        // Save all user balances
        for (const [userId, balance] of this.ledger.entries()) {
          const user = statements.getUser.get(userId);
          
          if (!user) {
            // Create new user
            statements.createUser.run(userId, balance, 0);
          } else {
            // Update existing user
            statements.updateUserBalance.run(
              balance,
              user.water_balance || 0,
              user.usd_balance || 0,
              userId
            );
          }
        }
        
        // Note: Transactions are already logged individually in methods
        // Proposals, stakes, etc. are also saved in their respective methods
      });
      
      saveAll();
      return true;
    } catch (error) {
      console.error('Failed to save economy data:', error);
      return false;
    }
  }

  loadData() {
    try {
      // Load all users from SQLite
      const users = db.prepare('SELECT * FROM users').all();
      
      this.ledger.clear();
      for (const user of users) {
        this.ledger.set(user.discord_id, user.dust_balance || 0);
      }
      
      // Load transaction history (last 1000 for performance)
      const transactions = db.prepare(`
        SELECT * FROM transactions 
        ORDER BY timestamp DESC 
        LIMIT 1000
      `).all();
      
      this.transactionHistory = transactions.map(tx => ({
        userId: tx.user_id,
        type: tx.type,
        amount: tx.amount,
        currency: tx.currency,
        note: tx.note,
        timestamp: tx.timestamp
      }));
      
      // Load proposals
      const proposals = db.prepare('SELECT * FROM proposals').all();
      this.governanceProposals = proposals.map(p => {
        // Get votes for this proposal
        const votes = db.prepare('SELECT voter_id, vote FROM votes WHERE proposal_id = ?').all(p.id);
        
        return {
          id: p.id,
          author: p.author_id,
          title: p.title,
          description: p.description,
          yesVotes: p.yes_votes,
          noVotes: p.no_votes,
          status: p.status,
          voters: new Set(votes.map(v => v.voter_id)),
          createdAt: p.created_at,
          expiresAt: p.expires_at
        };
      });
      
      // Load stakes (if stored in database - for now keep in memory)
      // Stakes will be migrated in a future update
      
      console.log(`Economy data loaded from SQLite: ${users.length} users, ${transactions.length} recent transactions`);
      return true;
    } catch (error) {
      console.error('Failed to load economy data:', error);
      return false;
    }
  }

  getDataFileStats() {
    try {
      if (!fs.existsSync(this.dataFilePath)) {
        return { exists: false, size: 0 };
      }
      const stats = fs.statSync(this.dataFilePath);
      return {
        exists: true,
        size: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      return { exists: false, size: 0, error: error.message };
    }
  }

  // STEP 7: Security Methods
  checkRateLimit(actorId, action) {
    const now = Date.now();
    const windowKey = `${actorId}-${action}`;
    
    if (!this.userRateLimits.has(windowKey)) {
      this.userRateLimits.set(windowKey, 0);
      this.rateLimitWindows.set(windowKey, now);
    }
    
    const windowStart = this.rateLimitWindows.get(windowKey);
    const elapsed = now - windowStart;
    
    // Reset if window expired (1 hour)
    if (elapsed > 3600000) {
      this.userRateLimits.set(windowKey, 0);
      this.rateLimitWindows.set(windowKey, now);
    }
    
    const currentCount = this.userRateLimits.get(windowKey);
    const limit = this.rateLimits[action] || 10;
    
    if (currentCount >= limit) {
      return { allowed: false, remaining: 0, resetIn: 3600000 - elapsed };
    }
    
    this.userRateLimits.set(windowKey, currentCount + 1);
    return { allowed: true, remaining: limit - currentCount - 1, resetIn: 3600000 - elapsed };
  }

  logSecurityEvent(type, actorId, details, severity = 'low') {
    const event = {
      timestamp: Date.now(),
      type,
      actorId,
      details,
      severity
    };
    
    this.securityEvents.push(event);
    
    // Keep only last 500 events
    if (this.securityEvents.length > 500) {
      this.securityEvents.shift();
    }
    
    // Auto-save on high/critical events
    if (severity === 'high' || severity === 'critical') {
      this.saveData();
      console.log(`🚨 SECURITY ALERT [${severity}]: ${type} - ${details}`);
    }
    
    return event;
  }

  getSecurityEvents(limit = 10, severity = null) {
    let events = this.securityEvents;
    
    if (severity) {
      events = events.filter(e => e.severity === severity);
    }
    
    return events.slice(-limit).reverse();
  }

  validateTransfer(fromId, toId, amount) {
    const errors = [];
    
    if (amount <= 0) {
      errors.push('Amount must be positive');
    }
    
    if (amount > 1000) {
      errors.push('Transfer amount too large (max 1000)');
    }
    
    if (fromId === toId) {
      errors.push('Cannot transfer to yourself');
    }
    
    const balance = this.balance(fromId);
    if (balance < amount) {
      errors.push(`Insufficient balance (${balance} < ${amount})`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // STEP 8: Advanced Economic Methods
  applyTransactionBurn(amount) {
    return amount * this.DUST_BURN_RATE;
  }

  processTransfer(fromId, toId, amount, note = '', skipFee = false) {
    const validation = this.validateTransfer(fromId, toId, amount);
    
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // Calculate burn (0% for Void Council members)
    const burnAmount = skipFee ? 0 : this.applyTransactionBurn(amount);
    const netTransfer = amount - burnAmount;
    
    // Execute transfer
    this.debit(fromId, amount, note || `Transfer to ${toId}`);
    this.credit(toId, netTransfer, note || `Transfer from ${fromId}`);
    
    // Record burn + auto-generate water backing
    if (burnAmount > 0) {
      this.addTransaction('system', 'burn', -burnAmount, 'Transaction fee');
      this.logEconomicEvent('transaction_burn', burnAmount, `Burned ${burnAmount} FRAG from transfer`);
      
      // THERMODYNAMIC MODEL: Transaction heat generates water backing
      // 1 FRAG burned = 0.001 liters of water backing (emergent asset reserve)
      const waterGenerated = burnAmount * 0.001;
      this.assetReserves.waterLiters += waterGenerated;
      
      // Log thermodynamic event
      this.logEconomicEvent('thermodynamic_water_generation', waterGenerated, 
        `Generated ${waterGenerated.toFixed(6)}L water from ${burnAmount.toFixed(4)} FRAG transaction heat`);
    } else if (skipFee) {
      this.logEconomicEvent('fee_waived', amount, 'Void Council privilege - 0% fee');
    }
    
    return { netTransfer, burnAmount };
  }

  stake(actorId, amount) {
    const balance = this.balance(actorId);
    
    if (amount <= 0) {
      throw new Error('Stake amount must be positive');
    }
    
    if (amount > balance) {
      throw new Error('Insufficient balance to stake');
    }
    
    // Debit from balance
    this.debit(actorId, amount, `Staked for ${this.STAKE_APR * 100}% APR`);
    
    // Add to stakes
    const currentStake = this.stakes.get(actorId) || { amount: 0, timestamp: Date.now() };
    this.stakes.set(actorId, {
      amount: currentStake.amount + amount,
      timestamp: Date.now()
    });
    
    this.saveData();
    return this.stakes.get(actorId);
  }

  unstake(actorId, amount) {
    const stakeInfo = this.stakes.get(actorId);
    
    if (!stakeInfo || amount <= 0) {
      throw new Error('Invalid unstake amount');
    }
    
    if (amount > stakeInfo.amount) {
      throw new Error('Insufficient staked amount');
    }
    
    // Calculate yield
    const stakeTimeMs = Date.now() - stakeInfo.timestamp;
    const stakeTimeDays = stakeTimeMs / 86400000;
    const annualYield = stakeInfo.amount * this.STAKE_APR;
    const earnedYield = (annualYield / 365) * stakeTimeDays;
    
    // Calculate 10% unstaking fee (market stability)
    const unstakingFee = amount * 0.10;
    const netPrincipal = amount - unstakingFee;
    
    // Fee goes to treasury
    if (!this.treasury) {
      this.treasury = { balance: 0 };
    }
    this.treasury.balance += unstakingFee;
    
    // Update stake
    stakeInfo.amount -= amount;
    if (stakeInfo.amount <= 0) {
      this.stakes.delete(actorId);
    } else {
      this.stakes.set(actorId, stakeInfo);
    }
    
    // Credit balance (net principal + yield, no fee on yield)
    this.credit(actorId, netPrincipal, 'Unstaked principal (after 10% fee)');
    if (earnedYield > 0) {
      this.credit(actorId, earnedYield, 'Staking yield');
    }
    
    this.saveData();
    return { amount: netPrincipal, yield: earnedYield, fee: unstakingFee };
  }

  getStakeInfo(actorId) {
    const stakeInfo = this.stakes.get(actorId);
    
    if (!stakeInfo) {
      return { staked: 0, pendingYield: 0, stakeDays: 0 };
    }
    
    const stakeTimeMs = Date.now() - stakeInfo.timestamp;
    const stakeTimeDays = stakeTimeMs / 86400000;
    const annualYield = stakeInfo.amount * this.STAKE_APR;
    const pendingYield = (annualYield / 365) * stakeTimeDays;
    
    return {
      staked: stakeInfo.amount,
      pendingYield,
      stakeDays: stakeTimeDays,
      apr: this.STAKE_APR
    };
  }

  logEconomicEvent(type, amount, note = '') {
    const event = {
      timestamp: Date.now(),
      type,
      amount,
      note
    };
    
    this.economicEvents.push(event);
    
    // Keep only last 100 events
    if (this.economicEvents.length > 100) {
      this.economicEvents.shift();
    }
    
    return event;
  }

  getEconomicEvents(limit = 10) {
    return this.economicEvents.slice(-limit).reverse();
  }

  getAdvancedEconomicStats() {
    const totalDust = this.getTotalCirculation();
    const totalStaked = Array.from(this.stakes.values()).reduce((sum, s) => sum + s.amount, 0);
    const recentBurn = this.transactionHistory
      .filter(tx => tx.type === 'burn' && Date.now() - tx.timestamp < 86400000)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const hourlyTxCount = this.transactionHistory
      .filter(tx => Date.now() - tx.timestamp < 3600000)
      .length;
    
    const activeStakers = this.stakes.size;
    
    return {
      totalSupply: totalDust,
      totalStaked,
      circulatingSupply: totalDust - totalStaked,
      recentBurn24h: recentBurn,
      inflationRate: this.INFLATION_RATE,
      stakingAPR: this.STAKE_APR,
      burnRate: this.DUST_BURN_RATE,
      economicVelocity: hourlyTxCount,
      activeStakers,
      stakingRatio: totalDust > 0 ? (totalStaked / totalDust) : 0
    };
  }
}

module.exports = {
  DustEconomy
};
