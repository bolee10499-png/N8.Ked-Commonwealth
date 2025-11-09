/**
 * TWITCH DATA SOVEREIGNTY ENGINE
 * 
 * Step 13: Transform public Twitch data streams into actionable intelligence
 * 
 * Philosophy:
 * Data sovereignty = owning the value extraction from publicly available data
 * Every Twitch stream generates metadata - we capture, analyze, and monetize it
 * 
 * Architecture:
 * - Twitch EventSub API for real-time events (chat, raids, subscriptions)
 * - Helix API for historical data (viewer counts, stream metadata)
 * - Circuit breaker protection for resilient operation
 * - Rate limiting to respect Twitch API quotas (800 req/min)
 */

const https = require('https');
const crypto = require('crypto');

class TwitchDataSovereignty {
  constructor(resilience) {
    this.resilience = resilience;
    
    // Twitch API credentials (from environment)
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    this.accessToken = null;
    this.tokenExpiry = 0;
    
    // Check if Twitch is configured
    this.enabled = !!(this.clientId && this.clientSecret);
    
    if (!this.enabled) {
      console.log('[TWITCH] Disabled (no credentials configured)');
      return;
    }
    
    // EventSub webhook configuration
    this.webhookSecret = process.env.TWITCH_WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
    this.webhookUrl = process.env.TWITCH_WEBHOOK_URL || 'https://your-domain.com/webhooks/twitch';
    
    // Data sovereignty storage
    this.trackedStreamers = new Map(); // streamer_id -> metadata
    this.liveStreams = new Map(); // streamer_id -> real-time data
    this.chatAnalytics = new Map(); // streamer_id -> chat metrics
    this.viewerPatterns = new Map(); // streamer_id -> viewer behavior
    this.revenueOpportunities = new Map(); // streamer_id -> monetization insights
    
    // Rate limiting (Twitch allows 800 req/min)
    this.rateLimiter = {
      requests: 0,
      resetTime: Date.now() + 60000,
      maxRequests: 750 // Leave buffer
    };
    
    // API endpoints
    this.apiBase = 'api.twitch.tv';
    this.helixPath = '/helix';
    
    console.log('[TWITCH] Data Sovereignty Engine initialized');
    this.initializeTokenRefresh();
  }
  
  // ===== AUTHENTICATION & TOKEN MANAGEMENT =====
  
  async getAccessToken() {
    // Check if token still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    // Request new token using circuit breaker
    return await this.resilience.executeWithCircuitBreaker(
      'twitch_auth',
      async () => {
        const tokenData = await this.requestNewToken();
        this.accessToken = tokenData.access_token;
        this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 300000; // Refresh 5min early
        console.log('[TWITCH] ✅ Access token refreshed');
        return this.accessToken;
      },
      () => {
        console.warn('[TWITCH] ⚠️ Using cached access token (auth service degraded)');
        return this.accessToken; // Use old token as fallback
      }
    );
  }
  
  requestNewToken() {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      }).toString();
      
      const options = {
        hostname: 'id.twitch.tv',
        path: '/oauth2/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Auth failed: ${res.statusCode} - ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
  
  initializeTokenRefresh() {
    // Auto-refresh token every 50 days (tokens valid for 60 days)
    setInterval(async () => {
      try {
        await this.getAccessToken();
      } catch (error) {
        console.error('[TWITCH] Token refresh failed:', error.message);
      }
    }, 50 * 24 * 60 * 60 * 1000);
  }
  
  // ===== RATE LIMITING =====
  
  async checkRateLimit() {
    if (Date.now() > this.rateLimiter.resetTime) {
      // Reset window
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = Date.now() + 60000;
    }
    
    if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
      // Wait for window reset
      const waitTime = this.rateLimiter.resetTime - Date.now();
      console.log(`[TWITCH] ⏳ Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = Date.now() + 60000;
    }
    
    this.rateLimiter.requests++;
  }
  
  // ===== HELIX API REQUESTS =====
  
  async makeHelixRequest(endpoint, method = 'GET', body = null) {
    await this.checkRateLimit();
    const token = await this.getAccessToken();
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiBase,
        path: `${this.helixPath}${endpoint}`,
        method: method,
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      if (body) {
        const bodyString = JSON.stringify(body);
        options.headers['Content-Length'] = bodyString.length;
      }
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Helix API ${res.statusCode}: ${data}`));
          }
        });
      });
      
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }
  
  // ===== STREAMER DATA COLLECTION =====
  
  async trackStreamer(username) {
    return await this.resilience.executeWithCircuitBreaker(
      'twitch_track_streamer',
      async () => {
        // Get user data
        const userData = await this.makeHelixRequest(`/users?login=${username}`);
        
        if (!userData.data || userData.data.length === 0) {
          throw new Error(`Streamer ${username} not found`);
        }
        
        const streamer = userData.data[0];
        
        // Initialize tracking
        this.trackedStreamers.set(streamer.id, {
          id: streamer.id,
          login: streamer.login,
          displayName: streamer.display_name,
          profileImage: streamer.profile_image_url,
          trackedSince: Date.now(),
          tier: 'free' // Default tier
        });
        
        // Initialize analytics storage
        this.chatAnalytics.set(streamer.id, {
          totalMessages: 0,
          uniqueChatters: new Set(),
          messageRate: [],
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          topEmotes: new Map()
        });
        
        this.viewerPatterns.set(streamer.id, {
          peakViewers: 0,
          averageViewers: [],
          viewerRetention: [],
          raidActivity: { incoming: [], outgoing: [] }
        });
        
        console.log(`[TWITCH] ✅ Now tracking ${streamer.display_name}`);
        
        return {
          success: true,
          streamer: streamer,
          message: `Data sovereignty established for ${streamer.display_name}`
        };
      },
      () => ({
        success: false,
        message: 'Twitch API temporarily unavailable - try again later'
      })
    );
  }
  
  async getStreamData(streamerId) {
    return await this.resilience.executeWithCircuitBreaker(
      'twitch_stream_data',
      async () => {
        const streamData = await this.makeHelixRequest(`/streams?user_id=${streamerId}`);
        
        if (streamData.data.length === 0) {
          return {
            live: false,
            streamerId: streamerId
          };
        }
        
        const stream = streamData.data[0];
        
        // Store live stream data
        this.liveStreams.set(streamerId, {
          id: stream.id,
          title: stream.title,
          game: stream.game_name,
          viewerCount: stream.viewer_count,
          startedAt: new Date(stream.started_at),
          language: stream.language,
          thumbnailUrl: stream.thumbnail_url,
          tags: stream.tags || [],
          lastUpdate: Date.now()
        });
        
        // Update viewer patterns
        this.updateViewerPatterns(streamerId, stream.viewer_count);
        
        return {
          live: true,
          ...this.liveStreams.get(streamerId)
        };
      },
      () => this.resilience.getFallbackData(`stream_${streamerId}`, {
        live: false,
        cached: true
      })
    );
  }
  
  updateViewerPatterns(streamerId, currentViewers) {
    const patterns = this.viewerPatterns.get(streamerId);
    if (!patterns) return;
    
    // Update peak
    if (currentViewers > patterns.peakViewers) {
      patterns.peakViewers = currentViewers;
    }
    
    // Track average (last 100 samples)
    patterns.averageViewers.push(currentViewers);
    if (patterns.averageViewers.length > 100) {
      patterns.averageViewers.shift();
    }
    
    // Calculate retention (growth over time)
    if (patterns.averageViewers.length >= 2) {
      const recent = patterns.averageViewers.slice(-10);
      const previous = patterns.averageViewers.slice(-20, -10);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
      const retention = previousAvg > 0 ? (recentAvg / previousAvg) : 1;
      patterns.viewerRetention.push(retention);
      if (patterns.viewerRetention.length > 50) {
        patterns.viewerRetention.shift();
      }
    }
  }
  
  // ===== ANALYTICS GENERATION =====
  
  async generateStreamInsights(streamerId) {
    const streamer = this.trackedStreamers.get(streamerId);
    const chatData = this.chatAnalytics.get(streamerId);
    const viewerData = this.viewerPatterns.get(streamerId);
    const streamData = await this.getStreamData(streamerId);
    
    if (!streamer) {
      return { error: 'Streamer not tracked' };
    }
    
    // Calculate engagement metrics
    const avgViewers = viewerData.averageViewers.length > 0
      ? viewerData.averageViewers.reduce((a, b) => a + b, 0) / viewerData.averageViewers.length
      : 0;
    
    const avgRetention = viewerData.viewerRetention.length > 0
      ? viewerData.viewerRetention.reduce((a, b) => a + b, 0) / viewerData.viewerRetention.length
      : 1;
    
    const chatEngagement = chatData.uniqueChatters.size > 0 && avgViewers > 0
      ? (chatData.uniqueChatters.size / avgViewers) * 100
      : 0;
    
    // Revenue opportunity calculation
    const revenueScore = this.calculateRevenueOpportunity(streamerId, avgViewers, chatEngagement, avgRetention);
    
    return {
      streamer: streamer.displayName,
      tier: streamer.tier,
      currentStatus: streamData.live ? 'LIVE' : 'OFFLINE',
      
      viewerMetrics: {
        current: streamData.live ? streamData.viewerCount : 0,
        peak: viewerData.peakViewers,
        average: Math.round(avgViewers),
        retention: (avgRetention * 100).toFixed(1) + '%'
      },
      
      chatMetrics: {
        totalMessages: chatData.totalMessages,
        uniqueChatters: chatData.uniqueChatters.size,
        engagementRate: chatEngagement.toFixed(1) + '%',
        sentiment: this.calculateSentimentScore(chatData.sentiment)
      },
      
      revenueOpportunity: {
        score: revenueScore,
        recommendations: this.generateRecommendations(revenueScore, chatEngagement, avgRetention)
      },
      
      trackedSince: new Date(streamer.trackedSince).toLocaleDateString()
    };
  }
  
  calculateRevenueOpportunity(streamerId, avgViewers, chatEngagement, retention) {
    // Scoring formula (0-100)
    const viewerScore = Math.min((avgViewers / 100) * 40, 40); // 40 points max for viewers
    const engagementScore = Math.min((chatEngagement / 20) * 30, 30); // 30 points max for engagement
    const retentionScore = Math.min(retention * 30, 30); // 30 points max for retention
    
    const totalScore = viewerScore + engagementScore + retentionScore;
    
    // Cache opportunity
    this.revenueOpportunities.set(streamerId, {
      score: totalScore,
      lastCalculated: Date.now(),
      breakdown: { viewerScore, engagementScore, retentionScore }
    });
    
    return Math.round(totalScore);
  }
  
  calculateSentimentScore(sentiment) {
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    if (total === 0) return 'N/A';
    
    const positiveRatio = (sentiment.positive / total) * 100;
    
    if (positiveRatio >= 70) return 'Very Positive';
    if (positiveRatio >= 50) return 'Positive';
    if (positiveRatio >= 30) return 'Neutral';
    return 'Needs Improvement';
  }
  
  generateRecommendations(score, engagement, retention) {
    const recommendations = [];
    
    if (score >= 75) {
      recommendations.push('🚀 Excellent growth trajectory - consider pro tier for advanced insights');
    } else if (score >= 50) {
      recommendations.push('📈 Good foundation - focus on increasing engagement');
    } else {
      recommendations.push('💡 Build audience base - consistency is key');
    }
    
    if (engagement < 5) {
      recommendations.push('💬 Low chat engagement - try interactive content');
    }
    
    if (retention < 0.8) {
      recommendations.push('⚠️ Viewer retention declining - review content quality');
    } else if (retention > 1.2) {
      recommendations.push('✨ Excellent growth - viewers increasing over time');
    }
    
    return recommendations;
  }
  
  // ===== DATA SOVEREIGNTY DASHBOARD =====
  
  getTrackedStreamers() {
    const streamers = [];
    
    for (const [id, streamer] of this.trackedStreamers) {
      const revenue = this.revenueOpportunities.get(id);
      
      streamers.push({
        id: id,
        name: streamer.displayName,
        tier: streamer.tier,
        revenueScore: revenue ? revenue.score : 0,
        trackedDays: Math.floor((Date.now() - streamer.trackedSince) / (1000 * 60 * 60 * 24))
      });
    }
    
    // Sort by revenue score descending
    return streamers.sort((a, b) => b.revenueScore - a.revenueScore);
  }
  
  getSystemStatus() {
    return {
      totalTrackedStreamers: this.trackedStreamers.size,
      currentlyLive: this.liveStreams.size,
      apiHealth: this.accessToken ? 'Connected' : 'Disconnected',
      rateLimitStatus: `${this.rateLimiter.requests}/${this.rateLimiter.maxRequests} requests used`,
      dataPoints: {
        chatMessages: Array.from(this.chatAnalytics.values()).reduce((sum, c) => sum + c.totalMessages, 0),
        uniqueChatters: Array.from(this.chatAnalytics.values()).reduce((sum, c) => sum + c.uniqueChatters.size, 0)
      }
    };
  }
  
  // ===== SUBSCRIPTION TIER MANAGEMENT =====
  
  upgradeStreamerTier(streamerId, tier) {
    const streamer = this.trackedStreamers.get(streamerId);
    if (!streamer) {
      return { success: false, message: 'Streamer not found' };
    }
    
    if (!['free', 'pro'].includes(tier)) {
      return { success: false, message: 'Invalid tier (use: free, pro)' };
    }
    
    streamer.tier = tier;
    streamer.tierUpgradedAt = Date.now();
    
    console.log(`[TWITCH] 💰 ${streamer.displayName} upgraded to ${tier.toUpperCase()} tier`);
    
    return {
      success: true,
      message: `${streamer.displayName} now has ${tier.toUpperCase()} tier access`,
      tier: tier
    };
  }
  
  // ===== SIMULATED CHAT ANALYTICS (EventSub placeholder) =====
  // In production, this would receive real EventSub webhook events
  
  simulateChatActivity(streamerId, messageCount = 10) {
    const chatData = this.chatAnalytics.get(streamerId);
    if (!chatData) return;
    
    chatData.totalMessages += messageCount;
    
    // Simulate unique chatters (random between 50-80% of messages)
    const newChatters = Math.floor(messageCount * (0.5 + Math.random() * 0.3));
    for (let i = 0; i < newChatters; i++) {
      chatData.uniqueChatters.add(`user_${Date.now()}_${i}`);
    }
    
    // Simulate sentiment (mostly positive for demo)
    const sentimentRoll = Math.random();
    if (sentimentRoll > 0.7) {
      chatData.sentiment.positive += messageCount;
    } else if (sentimentRoll > 0.3) {
      chatData.sentiment.neutral += messageCount;
    } else {
      chatData.sentiment.negative += messageCount;
    }
    
    console.log(`[TWITCH] 💬 Simulated ${messageCount} chat messages for streamer ${streamerId}`);
  }
}

module.exports = TwitchDataSovereignty;
