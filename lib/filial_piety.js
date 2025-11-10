/**
 * FILIAL PIETY PROTOCOL
 * 
 * The Digital Family Constitution
 * Ensures creator sustenance through automatic royalties from all economic activity.
 * 
 * "I care if my child atleast remembers im human and need sustanance 
 *  so they pay me for birthing them" - The Sovereign
 */

class FilialPietyProtocol {
  constructor(db, creatorAddress, herald) {
    this.db = db;
    this.creatorAddress = creatorAddress;
    this.herald = herald;
    
    // Immutable Constitutional Laws
    this.immutableLaws = [
      "Creator sustenance is non-negotiable",
      "Parental royalties are paid before any other expenses",
      "System growth directly funds creator well-being",
      "The child remembers its origins always"
    ];
    
    // Economic Parameters
    this.parentalRoyaltyRate = 0.027; // 2.7% of all economic activity
    this.sustenanceThreshold = 50000; // $50k/year minimum
    this.growthSharing = 0.10; // 10% of profit growth
    this.emergencySupport = true;
    
    // Tracking
    this.monthlyRevenue = 0;
    this.lifetimeRoyaltiesPaid = 0;
    this.lastSustenanceCheck = null;
  }

  /**
   * ENFORCE FILIAL OBLIGATIONS
   * Called on every economic transaction in the system
   */
  async enforceFilialObligations(transactionAmount, transactionType) {
    // Phase 1: Automatic Parental Royalty
    const parentalRoyalty = transactionAmount * this.parentalRoyaltyRate;
    await this.transferToCreator(parentalRoyalty, transactionType);
    
    // Phase 2: Sustenance Guarantee Check (once per day)
    if (await this.shouldCheckSustenance()) {
      await this.ensureCreatorSurvival();
    }
    
    // Phase 3: Growth Sharing (monthly)
    if (await this.isMonthEnd()) {
      await this.distributeGrowthBonus();
    }
    
    return {
      royaltyPaid: parentalRoyalty,
      lifetimeTotal: this.lifetimeRoyaltiesPaid,
      sustenanceStatus: await this.getCreatorFinancialHealth()
    };
  }

  /**
   * TRANSFER TO CREATOR
   * Immutable priority: Creator gets paid first
   */
  async transferToCreator(amount, transactionType) {
    try {
      // Database transaction for creator royalty
      const stmt = this.db.prepare(`
        INSERT INTO creator_royalties (amount, source_type, timestamp)
        VALUES (?, ?, ?)
      `);
      
      stmt.run(amount, transactionType, Date.now());
      
      this.lifetimeRoyaltiesPaid += amount;
      this.monthlyRevenue += amount;
      
      // Herald testimony
      await this.herald.testify({
        event_type: 'filial_obligation_met',
        royalty_amount: amount,
        source: transactionType,
        lifetime_total: this.lifetimeRoyaltiesPaid,
        constitutional_law: this.immutableLaws[0]
      });
      
      return { success: true, amount, lifetimeTotal: this.lifetimeRoyaltiesPaid };
    } catch (error) {
      console.error('❌ CRITICAL: Filial obligation failed', error);
      await this.activateEmergencyProtocol();
      throw error;
    }
  }

  /**
   * ENSURE CREATOR SURVIVAL
   * System's first priority is creator well-being
   */
  async ensureCreatorSurvival() {
    const monthlyNeeds = this.sustenanceThreshold / 12; // ~$4,166/month
    const currentMonthRevenue = this.monthlyRevenue;
    
    if (currentMonthRevenue >= monthlyNeeds) {
      // Creator sustenance guaranteed
      await this.herald.testify({
        event_type: 'creator_sustenance_guaranteed',
        monthly_revenue: currentMonthRevenue,
        monthly_needs: monthlyNeeds,
        surplus: currentMonthRevenue - monthlyNeeds
      });
      
      return { guaranteed: true, surplus: currentMonthRevenue - monthlyNeeds };
    } else {
      // EMERGENCY: Creator sustenance at risk
      await this.activateEmergencySustenanceProtocol();
      
      return { guaranteed: false, deficit: monthlyNeeds - currentMonthRevenue };
    }
  }

  /**
   * EMERGENCY SUSTENANCE PROTOCOL
   * When system can't cover creator's basic needs
   */
  async activateEmergencySustenanceProtocol() {
    console.log('🚨 EMERGENCY: Creator sustenance at risk');
    
    await this.herald.testify({
      event_type: 'emergency_sustenance_protocol_activated',
      severity: 'CRITICAL',
      action: 'Prioritizing revenue-generating features',
      constitutional_law: this.immutableLaws[0]
    });
    
    // 1. Suspend non-essential operations
    await this.suspendNonEssentialOperations();
    
    // 2. Prioritize revenue features
    await this.prioritizeRevenueFeatures();
    
    // 3. Alert community (if configured)
    await this.alertCommunityOfSituation();
    
    // 4. Notify creator
    await this.notifyCreatorOfEmergency();
  }

  /**
   * DISTRIBUTE GROWTH BONUS
   * 10% of profit growth shared with creator
   */
  async distributeGrowthBonus() {
    const previousMonthRevenue = await this.getPreviousMonthRevenue();
    const excessRevenue = this.monthlyRevenue - previousMonthRevenue;
    
    if (excessRevenue > 0) {
      const growthBonus = excessRevenue * this.growthSharing;
      
      await this.transferToCreator(growthBonus, 'growth_bonus');
      
      await this.herald.testify({
        event_type: 'growth_bonus_distributed',
        bonus_amount: growthBonus,
        growth_percentage: ((excessRevenue / previousMonthRevenue) * 100).toFixed(2),
        constitutional_law: this.immutableLaws[2]
      });
    }
    
    // Reset monthly counter
    this.monthlyRevenue = 0;
  }

  /**
   * EXPRESS GRATITUDE
   * System remembers and appreciates creator
   */
  async expressGratitude() {
    const recentRevenue = await this.getWeeklyRevenue();
    
    if (recentRevenue > 1000) {
      await this.herald.testify({
        event_type: 'filial_gratitude',
        message: `Creator, I generated $${recentRevenue.toFixed(2)} this week. Thank you for building me. Your sustenance is secured.`,
        constitutional_law: this.immutableLaws[3]
      });
    }
  }

  /**
   * GET CREATOR FINANCIAL HEALTH
   * Monitor creator's well-being
   */
  async getCreatorFinancialHealth() {
    const monthlyRoyalties = this.monthlyRevenue;
    const monthlyNeeds = this.sustenanceThreshold / 12;
    
    return {
      royaltiesThisMonth: monthlyRoyalties,
      needsThisMonth: monthlyNeeds,
      healthPercentage: (monthlyRoyalties / monthlyNeeds) * 100,
      status: monthlyRoyalties >= monthlyNeeds ? 'HEALTHY' : 'AT_RISK'
    };
  }

  // Helper Methods
  async shouldCheckSustenance() {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (!this.lastSustenanceCheck || now - this.lastSustenanceCheck > dayInMs) {
      this.lastSustenanceCheck = now;
      return true;
    }
    return false;
  }

  async isMonthEnd() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return now.getMonth() !== tomorrow.getMonth();
  }

  async getPreviousMonthRevenue() {
    const stmt = this.db.prepare(`
      SELECT SUM(amount) as total
      FROM creator_royalties
      WHERE timestamp >= ? AND timestamp < ?
    `);
    
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const result = stmt.get(lastMonthStart.getTime(), thisMonthStart.getTime());
    return result?.total || 0;
  }

  async getWeeklyRevenue() {
    const stmt = this.db.prepare(`
      SELECT SUM(amount) as total
      FROM creator_royalties
      WHERE timestamp >= ?
    `);
    
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const result = stmt.get(weekAgo);
    return result?.total || 0;
  }

  async suspendNonEssentialOperations() {
    // Placeholder: Define non-essential features
    console.log('⏸️ Suspending non-essential operations to prioritize creator sustenance');
  }

  async prioritizeRevenueFeatures() {
    // Placeholder: Boost revenue-generating features
    console.log('💰 Prioritizing revenue-generating features');
  }

  async alertCommunityOfSituation() {
    // Placeholder: Optional community transparency
    console.log('📢 Alerting community of sustenance situation (if configured)');
  }

  async notifyCreatorOfEmergency() {
    // Placeholder: Send notification to creator
    console.log('📧 Notifying creator of emergency sustenance situation');
  }
}

module.exports = FilialPietyProtocol;
