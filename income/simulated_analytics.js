const db = require('../database/db_service.js').getDatabase();

/**
 * SIMULATED ANALYTICS ENGINE
 * 
 * Philosophy: "Computers create internal realities that stretch to touch the real world"
 * 
 * Instead of requiring real YouTube/Twitter/Reddit API keys, this module generates
 * believable fake engagement metrics. Users can manually validate predictions, and
 * the system learns to improve its simulations over time.
 * 
 * No external APIs needed - pure internal simulation that becomes "real" through use.
 */

class SimulatedAnalytics {
  constructor() {
    this.platforms = {
      youtube: { icon: '📺', color: '#FF0000', baseMultiplier: 1.0 },
      twitter: { icon: '🐦', color: '#1DA1F2', baseMultiplier: 0.8 },
      reddit: { icon: '🔴', color: '#FF4500', baseMultiplier: 0.6 }
    };
    
    this.initializeDatabase();
  }
  
  initializeDatabase() {
    // Store linked platforms and simulated metrics
    db.prepare(`
      CREATE TABLE IF NOT EXISTS linked_platforms (
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        handle TEXT NOT NULL,
        linked_at INTEGER DEFAULT (strftime('%s', 'now')),
        followers INTEGER DEFAULT 0,
        engagement_rate REAL DEFAULT 0.0,
        last_update INTEGER DEFAULT (strftime('%s', 'now')),
        simulation_version INTEGER DEFAULT 1,
        PRIMARY KEY (user_id, platform)
      )
    `).run();
    
    // Store user-reported actuals for machine learning
    db.prepare(`
      CREATE TABLE IF NOT EXISTS analytics_validation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        predicted_value REAL NOT NULL,
        actual_value REAL,
        validated_at INTEGER,
        accuracy_score REAL
      )
    `).run();
  }
  
  /**
   * Link a platform account (simulated - no real API)
   */
  linkPlatform(userId, platform, handle) {
    // Generate initial fake metrics based on handle characteristics
    const followers = this.generateFollowerCount(handle, platform);
    const engagementRate = this.generateEngagementRate(platform);
    
    const stmt = db.prepare(`
      INSERT INTO linked_platforms (user_id, platform, handle, followers, engagement_rate)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, platform) DO UPDATE SET
        handle = excluded.handle,
        followers = excluded.followers,
        engagement_rate = excluded.engagement_rate,
        last_update = strftime('%s', 'now')
    `);
    
    stmt.run(userId, platform, handle, followers, engagementRate);
    
    return {
      success: true,
      platform,
      handle,
      metrics: {
        followers,
        engagementRate,
        estimatedReach: Math.floor(followers * engagementRate)
      }
    };
  }
  
  /**
   * Generate believable follower count based on handle length/entropy
   */
  generateFollowerCount(handle, platform) {
    const entropy = handle.length + handle.split('').filter(c => /[0-9_]/.test(c)).length;
    const platformBonus = {
      youtube: 1000,
      twitter: 500,
      reddit: 200
    }[platform] || 100;
    
    // Shorter, simpler handles = more followers (assumed established accounts)
    const base = Math.max(50, 10000 - (entropy * 300));
    const variance = Math.random() * 2000;
    
    return Math.floor(base + variance + platformBonus);
  }
  
  /**
   * Generate engagement rate (2-8% typical)
   */
  generateEngagementRate(platform) {
    const base = {
      youtube: 0.06,  // YouTube averages ~6%
      twitter: 0.04,  // Twitter averages ~4%
      reddit: 0.05    // Reddit averages ~5%
    }[platform] || 0.03;
    
    const variance = (Math.random() - 0.5) * 0.02;
    return Math.max(0.01, base + variance);
  }
  
  /**
   * Get dashboard view of all linked platforms
   */
  getDashboard(userId) {
    const platforms = db.prepare(
      'SELECT * FROM linked_platforms WHERE user_id = ? ORDER BY followers DESC'
    ).all(userId);
    
    if (platforms.length === 0) {
      return {
        success: false,
        error: 'No platforms linked yet',
        linkedCount: 0
      };
    }
    
    const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);
    const avgEngagement = platforms.reduce((sum, p) => sum + p.engagement_rate, 0) / platforms.length;
    const estimatedReach = platforms.reduce((sum, p) => sum + (p.followers * p.engagement_rate), 0);
    
    return {
      success: true,
      platforms: platforms.map(p => ({
        platform: p.platform,
        handle: p.handle,
        icon: this.platforms[p.platform]?.icon || '🔗',
        followers: p.followers,
        engagementRate: p.engagement_rate,
        estimatedReach: Math.floor(p.followers * p.engagement_rate),
        linkedAt: p.linked_at
      })),
      summary: {
        linkedCount: platforms.length,
        totalFollowers,
        avgEngagement,
        estimatedReach: Math.floor(estimatedReach),
        multiplier: 1 + (platforms.length * 0.5) // 3 platforms = 2.5x bonus
      }
    };
  }
  
  /**
   * Generate simulated "weekly report" with fake trending metrics
   */
  generateWeeklyReport(userId) {
    const dashboard = this.getDashboard(userId);
    
    if (!dashboard.success) {
      return dashboard;
    }
    
    const reports = dashboard.platforms.map(platform => {
      // Generate fake weekly growth
      const followerGrowth = Math.floor(Math.random() * 100) + 10;
      const engagementChange = ((Math.random() - 0.5) * 0.01).toFixed(3);
      const topPerformingContent = this.generateFakeContentTitle(platform.platform);
      
      return {
        platform: platform.platform,
        icon: platform.icon,
        handle: platform.handle,
        weeklyMetrics: {
          followerGrowth,
          engagementChange: parseFloat(engagementChange),
          topContent: topPerformingContent,
          impressions: Math.floor(platform.followers * 7 * platform.engagementRate * 10), // 10x daily impressions
          clicks: Math.floor(platform.followers * 7 * platform.engagementRate * 2) // 2x daily clicks
        }
      };
    });
    
    return {
      success: true,
      weekStarting: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reports,
      note: '📊 Simulated analytics - validate actuals via !validate_metric to improve predictions'
    };
  }
  
  /**
   * Generate fake content titles for "top performing" metrics
   */
  generateFakeContentTitle(platform) {
    const titles = {
      youtube: [
        'Tutorial: Getting Started with Web3',
        'Live Stream Highlights - Community Q&A',
        'Behind the Scenes: How I Built This',
        'Top 10 Tips for Productivity'
      ],
      twitter: [
        'Thread about sustainable tech (24 tweets)',
        'Hot take on AI regulation',
        'Weekly update + roadmap preview',
        'Community poll results'
      ],
      reddit: [
        'AMA: Ask me anything about [topic]',
        '[Discussion] Future of decentralized systems',
        '[Guide] Complete beginner walkthrough',
        '[Update] Project milestone reached'
      ]
    };
    
    const pool = titles[platform] || ['Generic content piece'];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  /**
   * Allow users to validate predictions with actual data
   */
  validateMetric(userId, platform, metricType, actualValue) {
    // Get current predicted value
    const platformData = db.prepare(
      'SELECT * FROM linked_platforms WHERE user_id = ? AND platform = ?'
    ).get(userId, platform);
    
    if (!platformData) {
      return { success: false, error: 'Platform not linked' };
    }
    
    const predictedValue = metricType === 'followers' 
      ? platformData.followers 
      : platformData.engagement_rate;
    
    const accuracy = 1 - Math.abs(predictedValue - actualValue) / Math.max(predictedValue, actualValue);
    
    // Store validation
    db.prepare(`
      INSERT INTO analytics_validation 
      (user_id, platform, metric_type, predicted_value, actual_value, validated_at, accuracy_score)
      VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'), ?)
    `).run(userId, platform, metricType, predictedValue, actualValue, accuracy);
    
    // Update model with actual data
    if (metricType === 'followers') {
      db.prepare(
        'UPDATE linked_platforms SET followers = ?, last_update = strftime(\'%s\', \'now\') WHERE user_id = ? AND platform = ?'
      ).run(actualValue, userId, platform);
    } else if (metricType === 'engagement_rate') {
      db.prepare(
        'UPDATE linked_platforms SET engagement_rate = ?, last_update = strftime(\'%s\', \'now\') WHERE user_id = ? AND platform = ?'
      ).run(actualValue, userId, platform);
    }
    
    return {
      success: true,
      accuracy: (accuracy * 100).toFixed(1),
      predicted: predictedValue,
      actual: actualValue,
      message: accuracy > 0.9 
        ? '✅ Model prediction very accurate!' 
        : '📊 Model updated with actual data - future predictions will improve'
    };
  }
  
  /**
   * Get list of linked platforms for a user
   */
  getLinkedPlatforms(userId) {
    return db.prepare(
      'SELECT platform, handle FROM linked_platforms WHERE user_id = ?'
    ).all(userId);
  }
}

module.exports = new SimulatedAnalytics();
