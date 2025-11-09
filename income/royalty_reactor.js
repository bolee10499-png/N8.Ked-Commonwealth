/**
 * 💰 ROYALTY FISSION REACTOR - The Money Maker
 * 
 * Step 14: Compounding revenue engine that turns platform activity into passive income
 * 
 * Revenue Streams:
 * 1. 5% fee on all dust→USD redemptions
 * 2. 2.5% fee on all NFT marketplace transactions
 * 3. Subscription revenue reinvestment
 * 4. White-label licensing revenue (5-15% of partner revenue)
 * 
 * Compounding Strategy:
 * - 30% reinvested in infrastructure (servers, APIs, scaling)
 * - 70% reinvested in growth (features, marketing, user acquisition)
 * 
 * Philosophy: The reactor doesn't extract value, it MULTIPLIES it
 * Every transaction feeds back into making the platform better
 */

const { db, statements } = require('../database/db_service.js');

class RoyaltyFissionReactor {
  constructor() {
    this.feeRates = {
      redemption: 0.05,      // 5% on dust→USD
      nftMarketplace: 0.025, // 2.5% on NFT sales
      subscription: 0.10,    // 10% to community treasury
      whiteLabelMin: 0.05,   // 5% min white-label fee
      whiteLabelMax: 0.15    // 15% max white-label fee
    };
    
    this.compoundingRates = {
      infrastructure: 0.30,  // 30% to scaling
      growth: 0.70           // 70% to features
    };
    
    this.totalGenerated = 0;
    this.totalCompounded = 0;
    
    this.loadRoyaltyStreams();
  }

  /**
   * 📊 Load all royalty streams from database
   */
  loadRoyaltyStreams() {
    try {
      const streams = statements.getAllRoyalties.all();
      
      this.totalGenerated = streams.reduce((sum, stream) => sum + stream.total_generated, 0);
      
      console.log(`[ROYALTY REACTOR] Loaded ${streams.length} revenue streams`);
      console.log(`[ROYALTY REACTOR] Total generated: $${this.totalGenerated.toFixed(2)}`);
    } catch (error) {
      console.error('[ROYALTY REACTOR] Failed to load streams:', error.message);
    }
  }

  /**
   * 💸 Process redemption fee (5% on dust→USD)
   */
  processRedemptionFee(userId, dustAmount, usdValue) {
    const fee = usdValue * this.feeRates.redemption;
    
    if (fee <= 0) return { success: false, error: 'Invalid redemption amount' };
    
    try {
      // Create royalty stream
      const result = statements.createRoyaltyStream.run(
        'redemption_fee',
        userId,
        fee,
        this.compoundingRates.infrastructure,
        fee // Initial total
      );
      
      const streamId = result.lastInsertRowid;
      
      // Log transaction with royalty link
      statements.logTransaction.run(
        'platform',
        'royalty_collection',
        fee,
        'usd',
        `5% redemption fee from ${userId}`,
        streamId
      );
      
      this.totalGenerated += fee;
      
      // Compound the fee
      const compounded = this.compound(fee, streamId);
      
      console.log(`[ROYALTY REACTOR] Redemption fee collected: $${fee.toFixed(2)} from ${userId}`);
      
      return {
        success: true,
        fee,
        streamId,
        compounded
      };
    } catch (error) {
      console.error('[ROYALTY REACTOR] Redemption fee error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎨 Process NFT marketplace fee (2.5% on sales)
   */
  processNFTMarketplaceFee(sellerId, buyerId, salePrice) {
    const fee = salePrice * this.feeRates.nftMarketplace;
    
    if (fee <= 0) return { success: false, error: 'Invalid sale price' };
    
    try {
      const result = statements.createRoyaltyStream.run(
        'nft_fee',
        `${sellerId}_${buyerId}`,
        fee,
        this.compoundingRates.infrastructure,
        fee
      );
      
      const streamId = result.lastInsertRowid;
      
      statements.logTransaction.run(
        'platform',
        'royalty_collection',
        fee,
        'dust',
        `2.5% NFT marketplace fee (${sellerId} → ${buyerId})`,
        streamId
      );
      
      this.totalGenerated += fee;
      
      const compounded = this.compound(fee, streamId);
      
      console.log(`[ROYALTY REACTOR] NFT fee collected: ${fee.toFixed(2)} dust`);
      
      return {
        success: true,
        fee,
        streamId,
        compounded
      };
    } catch (error) {
      console.error('[ROYALTY REACTOR] NFT fee error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 💳 Process subscription revenue (10% to treasury, rest compounds)
   */
  processSubscriptionRevenue(userId, amount, tier) {
    const treasuryShare = amount * this.feeRates.subscription;
    const platformShare = amount - treasuryShare;
    
    try {
      // Create royalty stream for platform share
      const result = statements.createRoyaltyStream.run(
        'subscription',
        userId,
        platformShare,
        this.compoundingRates.infrastructure,
        platformShare
      );
      
      const streamId = result.lastInsertRowid;
      
      // Platform revenue
      statements.logTransaction.run(
        'platform',
        'subscription_revenue',
        platformShare,
        'usd',
        `${tier} subscription from ${userId}`,
        streamId
      );
      
      // Community treasury contribution
      statements.addTreasuryFunds.run(
        treasuryShare,
        'subscription_revenue',
        null
      );
      
      this.totalGenerated += amount;
      
      const compounded = this.compound(platformShare, streamId);
      
      console.log(`[ROYALTY REACTOR] Subscription processed: $${amount} (Platform: $${platformShare}, Treasury: $${treasuryShare})`);
      
      return {
        success: true,
        total: amount,
        platformShare,
        treasuryShare,
        streamId,
        compounded
      };
    } catch (error) {
      console.error('[ROYALTY REACTOR] Subscription revenue error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🏢 Process white-label licensing revenue
   */
  processWhiteLabelRevenue(partnerId, partnerRevenue, feeRate = 0.10) {
    // Validate fee rate is within bounds
    const validatedRate = Math.max(
      this.feeRates.whiteLabelMin,
      Math.min(this.feeRates.whiteLabelMax, feeRate)
    );
    
    const platformFee = partnerRevenue * validatedRate;
    
    try {
      const result = statements.createRoyaltyStream.run(
        'white_label',
        partnerId,
        platformFee,
        this.compoundingRates.infrastructure,
        platformFee
      );
      
      const streamId = result.lastInsertRowid;
      
      statements.logTransaction.run(
        'platform',
        'white_label_revenue',
        platformFee,
        'usd',
        `${(validatedRate * 100).toFixed(0)}% white-label fee from ${partnerId}`,
        streamId
      );
      
      this.totalGenerated += platformFee;
      
      const compounded = this.compound(platformFee, streamId);
      
      console.log(`[ROYALTY REACTOR] White-label revenue: $${platformFee} (${(validatedRate * 100).toFixed(0)}% of $${partnerRevenue})`);
      
      return {
        success: true,
        partnerRevenue,
        platformFee,
        feeRate: validatedRate,
        streamId,
        compounded
      };
    } catch (error) {
      console.error('[ROYALTY REACTOR] White-label revenue error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔄 Compound revenue into infrastructure and growth
   */
  compound(amount, streamId) {
    const infrastructureAmount = amount * this.compoundingRates.infrastructure;
    const growthAmount = amount * this.compoundingRates.growth;
    
    this.totalCompounded += amount;
    
    // In production, this would:
    // - infrastructureAmount → Server scaling, API credits, database upgrades
    // - growthAmount → Feature development, marketing, user acquisition
    
    return {
      total: amount,
      infrastructure: infrastructureAmount,
      growth: growthAmount,
      percentages: {
        infrastructure: this.compoundingRates.infrastructure * 100,
        growth: this.compoundingRates.growth * 100
      }
    };
  }

  /**
   * 📊 Get all royalty streams
   */
  getRoyaltyStreams() {
    try {
      const streams = statements.getAllRoyalties.all();
      
      return streams.map(stream => ({
        id: stream.id,
        type: stream.type,
        source: stream.source,
        amount: stream.amount,
        totalGenerated: stream.total_generated,
        compoundRate: stream.compound_rate,
        lastPayout: stream.last_payout,
        createdAt: stream.created_at
      }));
    } catch (error) {
      console.error('[ROYALTY REACTOR] Error fetching streams:', error.message);
      return [];
    }
  }

  /**
   * 📈 Get revenue report
   */
  getRevenueReport() {
    const streams = this.getRoyaltyStreams();
    
    const byType = {};
    streams.forEach(stream => {
      if (!byType[stream.type]) {
        byType[stream.type] = {
          count: 0,
          total: 0
        };
      }
      byType[stream.type].count++;
      byType[stream.type].total += stream.totalGenerated;
    });
    
    // Calculate projection (simple linear extrapolation)
    const avgDailyRevenue = this.totalGenerated / Math.max(1, this.getDaysSinceLaunch());
    const monthlyProjection = avgDailyRevenue * 30;
    const annualProjection = avgDailyRevenue * 365;
    
    return {
      totalGenerated: this.totalGenerated,
      totalCompounded: this.totalCompounded,
      streamCount: streams.length,
      byType,
      projections: {
        daily: avgDailyRevenue,
        monthly: monthlyProjection,
        annual: annualProjection
      },
      compoundingAllocation: {
        infrastructure: this.totalCompounded * this.compoundingRates.infrastructure,
        growth: this.totalCompounded * this.compoundingRates.growth
      }
    };
  }

  /**
   * 🎯 Forecast revenue based on user growth
   */
  forecastRevenue(targetUsers, avgRedemptionPerUser = 10, avgNFTTradesPerUser = 2) {
    // Redemption revenue
    const redemptionRevenue = targetUsers * avgRedemptionPerUser * this.feeRates.redemption;
    
    // NFT marketplace revenue (assuming average 50 dust per trade)
    const nftRevenue = targetUsers * avgNFTTradesPerUser * 50 * this.feeRates.nftMarketplace;
    
    // Subscription revenue (assuming 10% conversion at $10/mo)
    const subscriptionRevenue = targetUsers * 0.10 * 10;
    
    const totalRevenue = redemptionRevenue + nftRevenue + subscriptionRevenue;
    
    return {
      targetUsers,
      assumptions: {
        redemptionPerUser: avgRedemptionPerUser,
        nftTradesPerUser: avgNFTTradesPerUser,
        subscriptionConversion: '10%',
        avgSubscriptionPrice: '$10/mo'
      },
      breakdown: {
        redemptions: redemptionRevenue,
        nftMarketplace: nftRevenue,
        subscriptions: subscriptionRevenue
      },
      total: totalRevenue,
      compounded: {
        infrastructure: totalRevenue * this.compoundingRates.infrastructure,
        growth: totalRevenue * this.compoundingRates.growth
      }
    };
  }

  /**
   * 📅 Calculate days since launch
   */
  getDaysSinceLaunch() {
    try {
      const firstStream = db.prepare(`
        SELECT MIN(created_at) as first_stream 
        FROM royalty_streams
      `).get();
      
      if (!firstStream || !firstStream.first_stream) {
        return 1; // Default to 1 day if no data
      }
      
      const firstDate = new Date(firstStream.first_stream);
      const now = new Date();
      const diffMs = now - firstDate;
      const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      
      return diffDays;
    } catch (error) {
      return 1;
    }
  }

  /**
   * 💎 Get financial sovereignty metrics
   */
  getSovereigntyMetrics() {
    const report = this.getRevenueReport();
    const streams = this.getRoyaltyStreams();
    
    // Calculate diversity score (how well diversified are revenue streams)
    const typeCount = Object.keys(report.byType).length;
    const maxTypes = 4; // redemption, nft, subscription, white_label
    const diversityScore = (typeCount / maxTypes) * 100;
    
    // Calculate sustainability score (is revenue growing?)
    const recentRevenue = streams
      .filter(s => new Date(s.createdAt) > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .reduce((sum, s) => sum + s.totalGenerated, 0);
    const oldRevenue = this.totalGenerated - recentRevenue;
    const growthRate = oldRevenue > 0 ? ((recentRevenue / oldRevenue) - 1) * 100 : 100;
    
    const sustainabilityScore = Math.min(100, Math.max(0, 50 + growthRate));
    
    // Overall sovereignty score
    const sovereigntyScore = (diversityScore * 0.4) + (sustainabilityScore * 0.6);
    
    return {
      sovereigntyScore: sovereigntyScore.toFixed(1),
      grade: sovereigntyScore >= 90 ? 'A' : sovereigntyScore >= 80 ? 'B' : 
             sovereigntyScore >= 70 ? 'C' : sovereigntyScore >= 60 ? 'D' : 'F',
      diversityScore: diversityScore.toFixed(1),
      sustainabilityScore: sustainabilityScore.toFixed(1),
      growthRate: growthRate.toFixed(1),
      metrics: {
        totalRevenue: report.totalGenerated,
        activeStreams: streams.length,
        revenueTypes: typeCount,
        weeklyRevenue: recentRevenue,
        compoundedToDate: report.totalCompounded
      }
    };
  }
}

module.exports = RoyaltyFissionReactor;
