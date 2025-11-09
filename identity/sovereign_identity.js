/**
 * 🆔 SOVEREIGN IDENTITY - Portable Reputation Across Platforms
 * 
 * Step 16: Cross-platform identity that transcends any single service
 * 
 * Features:
 * - 0-1000 reputation score (weighted algorithm)
 * - Achievement NFTs (earn once, display everywhere)
 * - Data wallet (user controls what platforms see)
 * - Cross-platform verification hooks
 * - Portable history across Discord, Twitch, YouTube, Twitter, Reddit
 * 
 * Philosophy: Your identity and reputation belong to YOU, not the platform
 */

const { db, statements } = require('../database/db_service.js');

class SovereignIdentity {
  constructor() {
    this.reputationWeights = {
      governance: 0.30,      // 30% from governance participation
      nfts: 0.25,            // 25% from NFT creation & ownership
      royalties: 0.20,       // 20% from royalty generation
      community: 0.15,       // 15% from community contributions
      tenure: 0.10           // 10% from time in ecosystem
    };
    
    this.achievements = this.defineAchievements();
  }

  /**
   * 🏆 Define all available achievements
   */
  defineAchievements() {
    return {
      // Economic Achievements
      first_bite: {
        title: 'First Bite',
        description: 'Claimed your first dust',
        category: 'economic',
        portable: true,
        points: 10
      },
      whale: {
        title: 'Whale Status',
        description: 'Accumulated 1000+ dust',
        category: 'economic',
        portable: true,
        points: 50
      },
      redeemer: {
        title: 'First Redemption',
        description: 'Redeemed dust for real value',
        category: 'economic',
        portable: true,
        points: 25
      },
      
      // Governance Achievements
      voter: {
        title: 'Democratic Participant',
        description: 'Cast your first vote',
        category: 'governance',
        portable: true,
        points: 20
      },
      proposal_creator: {
        title: 'Proposal Creator',
        description: 'Created a governance proposal',
        category: 'governance',
        portable: true,
        points: 30
      },
      governance_king: {
        title: 'Governance Champion',
        description: 'Passed 5 proposals',
        category: 'governance',
        portable: true,
        points: 100
      },
      
      // NFT Achievements
      artist: {
        title: 'Digital Artist',
        description: 'Created your first NFT',
        category: 'nft',
        portable: true,
        points: 30
      },
      collector: {
        title: 'Collector',
        description: 'Own 10+ NFTs',
        category: 'nft',
        portable: true,
        points: 40
      },
      market_maker: {
        title: 'Market Maker',
        description: 'Completed 10 NFT trades',
        category: 'nft',
        portable: true,
        points: 50
      },
      
      // Community Achievements
      helpful: {
        title: 'Community Helper',
        description: 'Helped 5 new users',
        category: 'community',
        portable: true,
        points: 25
      },
      influencer: {
        title: 'Platform Influencer',
        description: 'Referred 10+ users',
        category: 'community',
        portable: true,
        points: 60
      },
      
      // Revenue Achievements
      revenue_generator: {
        title: 'Revenue Generator',
        description: 'Generated $100 in platform royalties',
        category: 'royalty',
        portable: true,
        points: 75
      },
      entrepreneur: {
        title: 'Entrepreneur',
        description: 'Launched white-label instance',
        category: 'royalty',
        portable: false, // Business achievement, not portable
        points: 150
      },
      
      // Platform Achievements
      early_adopter: {
        title: 'Early Adopter',
        description: 'Joined in first 100 users',
        category: 'tenure',
        portable: true,
        points: 40
      },
      veteran: {
        title: 'Veteran',
        description: '6+ months active',
        category: 'tenure',
        portable: true,
        points: 80
      }
    };
  }

  /**
   * 📊 Calculate reputation score (0-1000)
   */
  calculateReputation(userId) {
    try {
      const user = statements.getUser.get(userId);
      if (!user) {
        return { score: 0, breakdown: {}, error: 'User not found' };
      }
      
      const breakdown = {};
      let totalScore = 0;
      
      // GOVERNANCE SCORE (0-300 points)
      const votes = db.prepare('SELECT COUNT(*) as count FROM votes WHERE voter_id = ?').get(userId);
      const proposals = db.prepare('SELECT COUNT(*) as count FROM proposals WHERE author_id = ?').get(userId);
      const passedProposals = db.prepare(`
        SELECT COUNT(*) as count FROM proposals 
        WHERE author_id = ? AND status = 'executed'
      `).get(userId);
      
      const governanceScore = Math.min(300, 
        (votes.count * 5) + 
        (proposals.count * 20) + 
        (passedProposals.count * 50)
      );
      breakdown.governance = governanceScore;
      totalScore += governanceScore;
      
      // NFT SCORE (0-250 points)
      const nfts = statements.getUserNFTs.get(userId);
      const nftCount = nfts ? db.prepare('SELECT COUNT(*) as count FROM nfts WHERE owner_id = ?').get(userId).count : 0;
      const nftTrades = db.prepare(`
        SELECT COUNT(*) as count FROM transactions 
        WHERE user_id = ? AND type = 'nft_trade'
      `).get(userId);
      
      const nftScore = Math.min(250,
        (nftCount * 10) +
        (nftTrades.count * 5)
      );
      breakdown.nfts = nftScore;
      totalScore += nftScore;
      
      // ROYALTY SCORE (0-200 points)
      const royalties = db.prepare(`
        SELECT SUM(amount) as total FROM royalty_streams 
        WHERE source = ?
      `).get(userId);
      
      const royaltyScore = Math.min(200, (royalties.total || 0) * 2);
      breakdown.royalties = royaltyScore;
      totalScore += royaltyScore;
      
      // COMMUNITY SCORE (0-150 points)
      const achievements = this.getUserAchievements(userId);
      const communityAchievements = achievements.filter(a => 
        this.achievements[a.achievement_id]?.category === 'community'
      );
      
      const communityScore = Math.min(150, 
        communityAchievements.reduce((sum, a) => sum + (this.achievements[a.achievement_id]?.points || 0), 0)
      );
      breakdown.community = communityScore;
      totalScore += communityScore;
      
      // TENURE SCORE (0-100 points)
      const accountAge = Date.now() - new Date(user.created_at).getTime();
      const daysActive = accountAge / (1000 * 60 * 60 * 24);
      const tenureScore = Math.min(100, daysActive * 0.5); // 0.5 points per day, max 200 days
      
      breakdown.tenure = tenureScore;
      totalScore += tenureScore;
      
      // Normalize to 0-1000 scale
      const normalizedScore = Math.min(1000, Math.round(totalScore));
      
      return {
        score: normalizedScore,
        breakdown,
        percentile: this.calculatePercentile(userId, normalizedScore)
      };
    } catch (error) {
      console.error('[IDENTITY] Reputation calculation error:', error.message);
      return { score: 0, breakdown: {}, error: error.message };
    }
  }

  /**
   * 📈 Calculate user's percentile rank
   */
  calculatePercentile(userId, userScore) {
    try {
      // Get all users' scores (simplified - in production would cache this)
      const allUsers = db.prepare('SELECT discord_id FROM users').all();
      
      let lowerCount = 0;
      for (const user of allUsers) {
        const otherScore = this.calculateReputation(user.discord_id).score;
        if (otherScore < userScore) {
          lowerCount++;
        }
      }
      
      const percentile = (lowerCount / Math.max(1, allUsers.length)) * 100;
      return Math.round(percentile);
    } catch (error) {
      return 50; // Default to median
    }
  }

  /**
   * 🏆 Grant achievement to user
   */
  grantAchievement(userId, achievementId, nftId = null) {
    const achievement = this.achievements[achievementId];
    
    if (!achievement) {
      return { success: false, error: 'Achievement not found' };
    }
    
    try {
      statements.grantAchievement.run(
        userId,
        achievementId,
        achievement.title,
        achievement.description,
        nftId
      );
      
      // Update reputation score
      const updatedRep = this.calculateReputation(userId);
      statements.updateReputation.run(updatedRep.score, userId);
      
      console.log(`[IDENTITY] Achievement granted: ${achievementId} to ${userId}`);
      
      return {
        success: true,
        achievement,
        newReputation: updatedRep.score,
        points: achievement.points
      };
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        return { success: false, error: 'Achievement already earned' };
      }
      
      console.error('[IDENTITY] Grant achievement error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🎖️ Get user's achievements
   */
  getUserAchievements(userId) {
    try {
      return statements.getUserAchievements.all(userId);
    } catch (error) {
      console.error('[IDENTITY] Get achievements error:', error.message);
      return [];
    }
  }

  /**
   * 🌐 Get portable identity data (what can be shared cross-platform)
   */
  getPortableIdentity(userId) {
    const reputation = this.calculateReputation(userId);
    const achievements = this.getUserAchievements(userId);
    
    // Only include portable achievements
    const portableAchievements = achievements.filter(a => 
      this.achievements[a.achievement_id]?.portable === true
    );
    
    return {
      userId,
      reputation: {
        score: reputation.score,
        percentile: reputation.percentile,
        breakdown: reputation.breakdown
      },
      achievements: portableAchievements.map(a => ({
        id: a.achievement_id,
        title: a.title,
        description: a.description,
        earnedAt: a.earned_at,
        category: this.achievements[a.achievement_id]?.category
      })),
      verificationHash: this.generateVerificationHash(userId, reputation.score),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * 🔐 Generate verification hash for cross-platform identity
   */
  generateVerificationHash(userId, reputationScore) {
    const crypto = require('crypto');
    const data = `${userId}:${reputationScore}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * 🔗 Link external platform account
   */
  linkPlatformAccount(discordUserId, platform, platformUserId, accessToken = null) {
    try {
      statements.linkPlatform.run(
        discordUserId,
        platform,
        platformUserId,
        accessToken,
        null, // refresh_token
        null  // token_expires_at
      );
      
      console.log(`[IDENTITY] Linked ${platform} account ${platformUserId} to ${discordUserId}`);
      
      return {
        success: true,
        platform,
        platformUserId
      };
    } catch (error) {
      console.error('[IDENTITY] Link platform error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🌍 Get all linked platforms for user
   */
  getLinkedPlatforms(userId) {
    try {
      return statements.getPlatformIntegrations.all(userId);
    } catch (error) {
      console.error('[IDENTITY] Get platforms error:', error.message);
      return [];
    }
  }

  /**
   * 📊 Get identity network statistics
   */
  getNetworkStatistics() {
    try {
      const stats = {
        totalUsers: 0,
        averageReputation: 0,
        topPerformers: [],
        achievementDistribution: {},
        platformConnections: {}
      };
      
      // Total users
      stats.totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      
      // Average reputation
      const avgRep = db.prepare('SELECT AVG(reputation_score) as avg FROM users').get();
      stats.averageReputation = Math.round(avgRep.avg || 0);
      
      // Top 10 performers
      const top = db.prepare(`
        SELECT discord_id, reputation_score 
        FROM users 
        ORDER BY reputation_score DESC 
        LIMIT 10
      `).all();
      stats.topPerformers = top;
      
      // Achievement distribution
      const achDist = db.prepare(`
        SELECT achievement_id, COUNT(*) as count 
        FROM identity_achievements 
        GROUP BY achievement_id 
        ORDER BY count DESC
      `).all();
      
      achDist.forEach(a => {
        stats.achievementDistribution[a.achievement_id] = a.count;
      });
      
      // Platform connections
      const platforms = db.prepare(`
        SELECT platform, COUNT(*) as count 
        FROM platform_integrations 
        WHERE status = 'active'
        GROUP BY platform
      `).all();
      
      platforms.forEach(p => {
        stats.platformConnections[p.platform] = p.count;
      });
      
      return stats;
    } catch (error) {
      console.error('[IDENTITY] Network stats error:', error.message);
      return null;
    }
  }
}

module.exports = SovereignIdentity;
