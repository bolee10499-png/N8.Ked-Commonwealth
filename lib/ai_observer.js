/**
 * 🤖 AI OBSERVER INTERFACE - The Tesseract Avatar's Eyes
 * 
 * Philosophy: AI doesn't guess. AI OBSERVES.
 * 
 * The tesseract avatar sits in 4D space, watching the sovereignty graph evolve.
 * It sees patterns humans don't: reputation velocity, governance cycles, market fractals.
 * 
 * This interface structures the chaos into READABLE STATE for autonomous agents.
 * 
 * Three Observation Modes:
 * 1. SNAPSHOT: Current system state (balances, reputation, active proposals)
 * 2. TRAJECTORY: Velocity and acceleration (reputation growth rate, trading volume trends)
 * 3. EMERGENCE: Patterns no single human sees (whale accumulation, governance cartels)
 */

const crypto = require('crypto');

class AIObserver {
  constructor(database) {
    this.db = database; // Use injected database instance
    this.observationHistory = [];
    this.initializeObservationTables();
  }

  /**
   * 🗄️ Initialize AI Observation Storage
   */
  initializeObservationTables() {
    if (!this.db) {
      console.warn('[AI_OBSERVER] ⚠️  No database instance provided, skipping schema initialization');
      return;
    }

    // Already created in sovereignty_schema.sql, but ensure they exist
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        observation_type TEXT NOT NULL,
        observation_data TEXT NOT NULL,
        confidence REAL DEFAULT 0.5,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS ai_action_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        action_data TEXT,
        success INTEGER DEFAULT 1,
        error_message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  }

  /**
   * 📸 SNAPSHOT: Get current system state
   * 
   * What exists RIGHT NOW across the sovereignty graph
   */
  getSystemSnapshot() {
    return {
      timestamp: new Date().toISOString(),
      users: this.getUserSnapshot(),
      economy: this.getEconomySnapshot(),
      governance: this.getGovernanceSnapshot(),
      nfts: this.getNFTSnapshot(),
      reputation: this.getReputationSnapshot()
    };
  }

  /**
   * 👥 User snapshot (population, activity, distribution)
   */
  getUserSnapshot() {
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    // Check if last_active column exists, otherwise use updated_at
    let activeUsersQuery;
    try {
      activeUsersQuery = `SELECT COUNT(*) as count FROM users WHERE last_active > datetime('now', '-7 days')`;
      this.db.prepare(activeUsersQuery).get();
    } catch (error) {
      // Fallback to updated_at if last_active doesn't exist
      activeUsersQuery = `SELECT COUNT(*) as count FROM users WHERE updated_at > datetime('now', '-7 days')`;
    }
    
    const activeUsers = this.db.prepare(activeUsersQuery).get().count;

    const newUsers = this.db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at > datetime('now', '-7 days')
    `).get().count;

    const reputationDistribution = this.db.prepare(`
      SELECT 
        COUNT(CASE WHEN reputation_score < 100 THEN 1 END) as twilight,
        COUNT(CASE WHEN reputation_score >= 100 AND reputation_score < 500 THEN 1 END) as bazaar,
        COUNT(CASE WHEN reputation_score >= 500 AND reputation_score < 1000 THEN 1 END) as chamber,
        COUNT(CASE WHEN reputation_score >= 1000 THEN 1 END) as void_council
      FROM users
    `).get();

    return {
      total: totalUsers,
      activeLastWeek: activeUsers,
      newLastWeek: newUsers,
      activityRate: totalUsers > 0 ? (activeUsers / totalUsers) : 0,
      growthRate: totalUsers > 0 ? (newUsers / totalUsers) : 0,
      reputationGates: reputationDistribution
    };
  }

  /**
   * 💰 Economy snapshot (FRAG circulation, velocity, concentration)
   */
  getEconomySnapshot() {
    const totalFrag = this.db.prepare('SELECT SUM(frag_balance) as total FROM users').get().total || 0;
    const totalWater = this.db.prepare('SELECT SUM(water_balance) as total FROM users').get().total || 0;
    const totalReputation = this.db.prepare('SELECT SUM(reputation_score) as total FROM users').get().total || 0;

    // Gini coefficient (wealth inequality - 0 = perfect equality, 1 = one person has everything)
    const dustBalances = this.db.prepare('SELECT frag_balance FROM users ORDER BY frag_balance DESC').all();
    const gini = this.calculateGini(dustBalances.map(u => u.frag_balance));

    // Transaction velocity (transactions per day)
    const recentTxCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM transactions 
      WHERE timestamp > datetime('now', '-1 day')
    `).get().count;

    // Top whales (concentration risk)
    const topWhales = this.db.prepare(`
      SELECT discord_id, frag_balance, reputation_score 
      FROM users 
      ORDER BY frag_balance DESC 
      LIMIT 10
    `).all();

    const whaleConcentration = topWhales.reduce((sum, w) => sum + w.frag_balance, 0) / totalFrag;

    return {
      totalFrag,
      totalWater,
      totalReputation,
      giniCoefficient: gini,
      inequality: this.interpretGini(gini),
      transactionsPerDay: recentTxCount,
      whaleConcentration: whaleConcentration || 0,
      topWhales: topWhales.length
    };
  }

  /**
   * 🏛️ Governance snapshot (active proposals, voter participation, democracy health)
   */
  getGovernanceSnapshot() {
    const activeProposals = this.db.prepare(`
      SELECT COUNT(*) as count FROM proposals WHERE status = 'active'
    `).get().count;

    const totalProposals = this.db.prepare('SELECT COUNT(*) as count FROM proposals').get().count;

    const recentVotes = this.db.prepare(`
      SELECT COUNT(*) as count FROM votes 
      WHERE voted_at > datetime('now', '-7 days')
    `).get().count;

    const voterParticipation = this.db.prepare(`
      SELECT COUNT(DISTINCT voter_id) as voters FROM votes
    `).get().voters;

    const totalEligibleVoters = this.db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE reputation_score >= 500
    `).get().count; // Only Governance Chamber+ can vote

    const turnoutRate = totalEligibleVoters > 0 ? (voterParticipation / totalEligibleVoters) : 0;

    return {
      activeProposals,
      totalProposals,
      recentVotes,
      voterParticipation,
      turnoutRate,
      democracyHealth: this.assessDemocracyHealth(turnoutRate, activeProposals)
    };
  }

  /**
   * 🎨 NFT snapshot (creation rate, trading volume, royalty generation)
   */
  getNFTSnapshot() {
    try {
      const totalNFTs = this.db.prepare('SELECT COUNT(*) as count FROM nfts').get().count;
      const activeCreators = this.db.prepare('SELECT COUNT(DISTINCT owner_id) as count FROM nfts').get().count;

      const recentNFTs = this.db.prepare(`
        SELECT COUNT(*) as count FROM nfts 
        WHERE created_at > datetime('now', '-7 days')
      `).get().count;

      const totalRoyalties = this.db.prepare(`
        SELECT SUM(total_generated) as total FROM royalty_streams WHERE active = 1
      `).get().total || 0;

      const avgNFTsPerCreator = activeCreators > 0 ? (totalNFTs / activeCreators) : 0;

      return {
        totalNFTs,
        activeCreators,
        recentNFTs,
        creationRatePerWeek: recentNFTs,
        avgNFTsPerCreator,
        totalRoyaltiesGenerated: totalRoyalties
      };
    } catch (error) {
      console.warn('[AI_OBSERVER] NFT snapshot error:', error.message);
      return {
        totalNFTs: 0,
        activeCreators: 0,
        recentNFTs: 0,
        creationRatePerWeek: 0,
        avgNFTsPerCreator: 0,
        totalRoyaltiesGenerated: 0
      };
    }
  }

  /**
   * 🏆 Reputation snapshot (score distribution, achievement completion, percentiles)
   */
  getReputationSnapshot() {
    const avgReputation = this.db.prepare('SELECT AVG(reputation_score) as avg FROM users').get().avg || 0;
    const medianReputation = this.calculateMedianReputation();

    const totalAchievements = this.db.prepare('SELECT COUNT(*) as count FROM identity_achievements').get().count;
    const portableAchievements = this.db.prepare(`
      SELECT COUNT(*) as count FROM identity_achievements WHERE portable = 1
    `).get().count;

    const topReputations = this.db.prepare(`
      SELECT discord_id, reputation_score 
      FROM users 
      ORDER BY reputation_score DESC 
      LIMIT 10
    `).all();

    return {
      average: avgReputation,
      median: medianReputation,
      totalAchievements,
      portableAchievements,
      portabilityRate: totalAchievements > 0 ? (portableAchievements / totalAchievements) : 0,
      topReputations
    };
  }

  /**
   * 📈 TRAJECTORY: Get velocity and acceleration (how fast things are changing)
   */
  getSystemTrajectory(timeWindowDays = 7) {
    try {
      const now = new Date();
      const past = new Date(now - timeWindowDays * 24 * 60 * 60 * 1000);

      return {
        timestamp: now.toISOString(),
        timeWindow: `${timeWindowDays} days`,
        userGrowthVelocity: this.getUserGrowthVelocity(past, now),
        economicVelocity: this.getEconomicVelocity(past, now),
        governanceVelocity: this.getGovernanceVelocity(past, now),
        reputationVelocity: this.getReputationVelocity(past, now)
      };
    } catch (error) {
      console.warn('[AI_OBSERVER] System trajectory error:', error.message);
      return {
        timestamp: new Date().toISOString(),
        timeWindow: `${timeWindowDays} days`,
        userGrowthVelocity: { newUsersPerDay: 0, churnedUsers: 0, netGrowthRate: 0 },
        economicVelocity: { transactionsPerDay: 0, volumePerDay: 0, avgTransactionSize: 0 },
        governanceVelocity: { proposalsPerWeek: 0, votesPerWeek: 0, engagementTrend: 'low_engagement' },
        reputationVelocity: { achievementsPerDay: 0, newAchievements: 0 }
      };
    }
  }

  /**
   * 👥 User growth velocity (new users per day, churn rate)
   */
  getUserGrowthVelocity(startDate, endDate) {
    try {
      const daysElapsed = (endDate - startDate) / (1000 * 60 * 60 * 24);

      const newUsers = this.db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE created_at BETWEEN ? AND ?
      `).get(startDate.toISOString(), endDate.toISOString()).count;

      const churned = this.db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE updated_at < ?
      `).get(new Date(endDate - 30 * 24 * 60 * 60 * 1000).toISOString()).count;

      return {
        newUsersPerDay: daysElapsed > 0 ? (newUsers / daysElapsed) : 0,
        churnedUsers: churned,
        netGrowthRate: newUsers - churned
      };
    } catch (error) {
      console.warn('[AI_OBSERVER] User growth velocity error:', error.message);
      return { newUsersPerDay: 0, churnedUsers: 0, netGrowthRate: 0 };
    }
  }

  /**
   * 💰 Economic velocity (transaction frequency, FRAG circulation speed)
   */
  getEconomicVelocity(startDate, endDate) {
    const transactions = this.db.prepare(`
      SELECT COUNT(*) as count, SUM(amount) as volume FROM transactions 
      WHERE timestamp BETWEEN ? AND ?
    `).get(startDate.toISOString(), endDate.toISOString());

    const daysElapsed = (endDate - startDate) / (1000 * 60 * 60 * 24);

    return {
      transactionsPerDay: daysElapsed > 0 ? (transactions.count / daysElapsed) : 0,
      volumePerDay: daysElapsed > 0 ? (transactions.volume / daysElapsed) : 0,
      avgTransactionSize: transactions.count > 0 ? (transactions.volume / transactions.count) : 0
    };
  }

  /**
   * 🏛️ Governance velocity (proposals per week, vote participation trend)
   */
  getGovernanceVelocity(startDate, endDate) {
    const proposals = this.db.prepare(`
      SELECT COUNT(*) as count FROM proposals 
      WHERE created_at BETWEEN ? AND ?
    `).get(startDate.toISOString(), endDate.toISOString()).count;

    const votes = this.db.prepare(`
      SELECT COUNT(*) as count FROM votes 
      WHERE timestamp BETWEEN ? AND ?
    `).get(startDate.toISOString(), endDate.toISOString()).count;

    const weeksElapsed = (endDate - startDate) / (1000 * 60 * 60 * 24 * 7);

    return {
      proposalsPerWeek: weeksElapsed > 0 ? (proposals / weeksElapsed) : 0,
      votesPerWeek: weeksElapsed > 0 ? (votes / weeksElapsed) : 0,
      engagementTrend: this.assessEngagementTrend(votes, proposals)
    };
  }

  /**
   * 🏆 Reputation velocity (average score growth, achievement completion rate)
   */
  getReputationVelocity(startDate, endDate) {
    const newAchievements = this.db.prepare(`
      SELECT COUNT(*) as count FROM identity_achievements 
      WHERE earned_at BETWEEN ? AND ?
    `).get(startDate.toISOString(), endDate.toISOString()).count;

    const daysElapsed = (endDate - startDate) / (1000 * 60 * 60 * 24);

    return {
      achievementsPerDay: daysElapsed > 0 ? (newAchievements / daysElapsed) : 0,
      newAchievements
    };
  }

  /**
   * 🌀 EMERGENCE: Detect patterns no single human sees
   */
  detectEmergentPatterns() {
    const patterns = [];

    // Pattern 1: Whale Accumulation (top 10% hold >50% of FRAG)
    const whalePattern = this.detectWhaleAccumulation();
    if (whalePattern.detected) {
      patterns.push({
        type: 'whale_accumulation',
        confidence: whalePattern.confidence,
        data: whalePattern.data,
        recommendation: 'Consider progressive taxation or whale gate limitations'
      });
    }

    // Pattern 2: Governance Cartel (same users vote yes on each other's proposals)
    const cartelPattern = this.detectGovernanceCartel();
    if (cartelPattern.detected) {
      patterns.push({
        type: 'governance_cartel',
        confidence: cartelPattern.confidence,
        data: cartelPattern.data,
        recommendation: 'Implement quadratic voting or reputation-weighted votes'
      });
    }

    // Pattern 3: NFT Market Manipulation (same users trading to inflate prices)
    const manipulationPattern = this.detectMarketManipulation();
    if (manipulationPattern.detected) {
      patterns.push({
        type: 'market_manipulation',
        confidence: manipulationPattern.confidence,
        data: manipulationPattern.data,
        recommendation: 'Implement cooldown on NFT re-sales or trade tax'
      });
    }

    // Pattern 4: Reputation Velocity Anomaly (sudden reputation spikes)
    const anomalyPattern = this.detectReputationAnomaly();
    if (anomalyPattern.detected) {
      patterns.push({
        type: 'reputation_anomaly',
        confidence: anomalyPattern.confidence,
        data: anomalyPattern.data,
        recommendation: 'Investigate for gaming or exploit'
      });
    }

    return {
      timestamp: new Date().toISOString(),
      patternsDetected: patterns.length,
      patterns
    };
  }

  /**
   * 🐋 Detect whale accumulation pattern
   */
  detectWhaleAccumulation() {
    const totalFrag = this.db.prepare('SELECT SUM(frag_balance) as total FROM users').get().total || 0;
    const top10Percent = this.db.prepare(`
      SELECT SUM(frag_balance) as whale_FRAG 
      FROM (
        SELECT frag_balance FROM users 
        ORDER BY frag_balance DESC 
        LIMIT (SELECT COUNT(*) / 10 FROM users)
      )
    `).get().whale_FRAG || 0;

    const concentration = totalFrag > 0 ? (top10Percent / totalFrag) : 0;

    return {
      detected: concentration > 0.5, // Top 10% hold >50%
      confidence: Math.min(concentration * 1.5, 1.0), // Higher concentration = higher confidence
      data: {
        top10PercentHolds: concentration,
        totalFrag,
        whaleConcentration: top10Percent
      }
    };
  }

  /**
   * 🤝 Detect governance cartel (coordinated voting)
   */
  detectGovernanceCartel() {
    // TODO: Implement correlation analysis between voters
    // For now, return simple placeholder
    return {
      detected: false,
      confidence: 0,
      data: {}
    };
  }

  /**
   * 📈 Detect NFT market manipulation
   */
  detectMarketManipulation() {
    // TODO: Analyze trading patterns for wash trading
    return {
      detected: false,
      confidence: 0,
      data: {}
    };
  }

  /**
   * ⚡ Detect reputation velocity anomaly
   */
  detectReputationAnomaly() {
    // Find users who gained >100 reputation in past 24 hours
    const anomalies = this.db.prepare(`
      SELECT user_id, COUNT(*) as achievements FROM identity_achievements 
      WHERE earned_at > datetime('now', '-1 day')
      GROUP BY user_id
      HAVING COUNT(*) > 10
    `).all();

    return {
      detected: anomalies.length > 0,
      confidence: anomalies.length > 0 ? 0.75 : 0,
      data: {
        suspiciousUsers: anomalies.length,
        users: anomalies.map(a => a.user_id)
      }
    };
  }

  /**
   * 📊 UTILITY: Calculate Gini coefficient (wealth inequality)
   */
  calculateGini(values) {
    if (values.length === 0) return 0;

    values.sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    if (sum === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (2 * (i + 1) - n - 1) * values[i];
    }

    return numerator / (n * sum);
  }

  /**
   * 📊 Interpret Gini coefficient
   */
  interpretGini(gini) {
    if (gini < 0.3) return 'low_inequality';
    if (gini < 0.5) return 'moderate_inequality';
    if (gini < 0.7) return 'high_inequality';
    return 'extreme_inequality';
  }

  /**
   * 📊 Calculate median reputation
   */
  calculateMedianReputation() {
    const scores = this.db.prepare('SELECT reputation_score FROM users ORDER BY reputation_score').all();
    if (scores.length === 0) return 0;

    const mid = Math.floor(scores.length / 2);
    if (scores.length % 2 === 0) {
      return (scores[mid - 1].reputation_score + scores[mid].reputation_score) / 2;
    }
    return scores[mid].reputation_score;
  }

  /**
   * 🏛️ Assess democracy health
   */
  assessDemocracyHealth(turnoutRate, activeProposals) {
    if (turnoutRate > 0.7 && activeProposals > 3) return 'healthy';
    if (turnoutRate > 0.5 && activeProposals > 1) return 'moderate';
    if (turnoutRate > 0.3) return 'weak';
    return 'at_risk';
  }

  /**
   * 📈 Assess engagement trend
   */
  assessEngagementTrend(votes, proposals) {
    const votesPerProposal = proposals > 0 ? (votes / proposals) : 0;
    if (votesPerProposal > 20) return 'highly_engaged';
    if (votesPerProposal > 10) return 'engaged';
    if (votesPerProposal > 5) return 'moderately_engaged';
    return 'low_engagement';
  }

  /**
   * 💾 Log AI observation to database
   */
  logObservation(agentId, observationType, observationData, confidence = 0.5) {
    this.db.prepare(`
      INSERT INTO ai_observations (agent_id, observation_type, observation_data, confidence)
      VALUES (?, ?, ?, ?)
    `).run(agentId, observationType, JSON.stringify(observationData), confidence);
  }

  /**
   * 📝 Log AI action to database
   */
  logAction(agentId, userId, actionType, actionData, success = true, errorMessage = null) {
    this.db.prepare(`
      INSERT INTO ai_action_logs (agent_id, user_id, action_type, action_data, success, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(agentId, userId, actionType, JSON.stringify(actionData), success ? 1 : 0, errorMessage);
  }

  /**
   * 🔍 Get recent AI observations
   */
  getRecentObservations(agentId = null, limit = 10) {
    if (agentId) {
      return this.db.prepare(`
        SELECT * FROM ai_observations 
        WHERE agent_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(agentId, limit);
    } else {
      return this.db.prepare(`
        SELECT * FROM ai_observations 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(limit);
    }
  }

  /**
   * 📜 Get recent AI actions
   */
  getRecentActions(agentId = null, limit = 10) {
    if (agentId) {
      return this.db.prepare(`
        SELECT * FROM ai_action_logs 
        WHERE agent_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(agentId, limit);
    } else {
      return this.db.prepare(`
        SELECT * FROM ai_action_logs 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(limit);
    }
  }
}

module.exports = AIObserver;
