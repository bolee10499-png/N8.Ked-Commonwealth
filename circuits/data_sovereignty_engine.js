/**
 * Data Sovereignty Engine
 * Cross-platform analytics correlation and data liberation
 * Multiplies platform value by 3x through unified insights
 */

const { google } = require('googleapis');
const { TwitterApi } = require('twitter-api-v2');
const Snoowrap = require('snoowrap');
const db = require('../core/db_service');

class DataSovereigntyEngine {
  constructor() {
    this.platforms = {
      youtube: null,
      twitter: null,
      reddit: null
    };
    
    this.correlationWeights = {
      engagement: 0.35,      // Cross-platform engagement patterns
      growth: 0.25,          // Follower/subscriber growth alignment
      contentQuality: 0.20,  // Quality signals across platforms
      audience: 0.20         // Audience overlap and behavior
    };
    
    this.initialized = false;
  }

  /**
   * Initialize all platform API clients
   */
  async initialize() {
    try {
      // YouTube Data API v3
      if (process.env.YOUTUBE_API_KEY) {
        this.platforms.youtube = google.youtube({
          version: 'v3',
          auth: process.env.YOUTUBE_API_KEY
        });
      }

      // Twitter API v2
      if (process.env.TWITTER_BEARER_TOKEN) {
        this.platforms.twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      }

      // Reddit API
      if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
        this.platforms.reddit = new Snoowrap({
          userAgent: 'n8.ked-bot/1.0.0',
          clientId: process.env.REDDIT_CLIENT_ID,
          clientSecret: process.env.REDDIT_CLIENT_SECRET,
          refreshToken: process.env.REDDIT_REFRESH_TOKEN
        });
      }

      this.initialized = true;
      return { success: true, platforms: this.getActivePlatforms() };
    } catch (error) {
      console.error('Data Sovereignty Engine initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get list of successfully initialized platforms
   */
  getActivePlatforms() {
    return Object.entries(this.platforms)
      .filter(([_, client]) => client !== null)
      .map(([platform, _]) => platform);
  }

  /**
   * Link YouTube channel to Discord user
   */
  async linkYouTubeChannel(discordUserId, channelId) {
    if (!this.platforms.youtube) {
      return { success: false, error: 'YouTube API not initialized' };
    }

    try {
      // Verify channel exists and get metadata
      const response = await this.platforms.youtube.channels.list({
        part: 'snippet,statistics',
        id: channelId
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { success: false, error: 'Channel not found' };
      }

      const channel = response.data.items[0];
      
      // Store in platform_integrations table
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO platform_integrations 
        (discord_user_id, platform, platform_user_id, platform_username, connected_at, metadata)
        VALUES (?, ?, ?, ?, datetime('now'), ?)
      `);

      stmt.run(
        discordUserId,
        'youtube',
        channelId,
        channel.snippet.title,
        JSON.stringify({
          subscriberCount: channel.statistics.subscriberCount,
          videoCount: channel.statistics.videoCount,
          viewCount: channel.statistics.viewCount
        })
      );

      return {
        success: true,
        channel: {
          id: channelId,
          name: channel.snippet.title,
          subscribers: parseInt(channel.statistics.subscriberCount),
          videos: parseInt(channel.statistics.videoCount),
          views: parseInt(channel.statistics.viewCount)
        }
      };
    } catch (error) {
      console.error('YouTube link error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Link Twitter account to Discord user
   */
  async linkTwitterAccount(discordUserId, twitterUsername) {
    if (!this.platforms.twitter) {
      return { success: false, error: 'Twitter API not initialized' };
    }

    try {
      // Get user details
      const user = await this.platforms.twitter.v2.userByUsername(twitterUsername, {
        'user.fields': ['public_metrics', 'created_at', 'verified']
      });

      if (!user.data) {
        return { success: false, error: 'Twitter user not found' };
      }

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO platform_integrations 
        (discord_user_id, platform, platform_user_id, platform_username, connected_at, metadata)
        VALUES (?, ?, ?, ?, datetime('now'), ?)
      `);

      stmt.run(
        discordUserId,
        'twitter',
        user.data.id,
        user.data.username,
        JSON.stringify({
          followers: user.data.public_metrics.followers_count,
          following: user.data.public_metrics.following_count,
          tweets: user.data.public_metrics.tweet_count,
          verified: user.data.verified || false
        })
      );

      return {
        success: true,
        account: {
          id: user.data.id,
          username: user.data.username,
          followers: user.data.public_metrics.followers_count,
          verified: user.data.verified || false
        }
      };
    } catch (error) {
      console.error('Twitter link error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Link Reddit account to Discord user
   */
  async linkRedditAccount(discordUserId, redditUsername) {
    if (!this.platforms.reddit) {
      return { success: false, error: 'Reddit API not initialized' };
    }

    try {
      const user = await this.platforms.reddit.getUser(redditUsername).fetch();

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO platform_integrations 
        (discord_user_id, platform, platform_user_id, platform_username, connected_at, metadata)
        VALUES (?, ?, ?, ?, datetime('now'), ?)
      `);

      stmt.run(
        discordUserId,
        'reddit',
        user.id,
        user.name,
        JSON.stringify({
          karma: user.total_karma,
          postKarma: user.link_karma,
          commentKarma: user.comment_karma,
          accountAge: Math.floor((Date.now() - user.created_utc * 1000) / (1000 * 60 * 60 * 24))
        })
      );

      return {
        success: true,
        account: {
          id: user.id,
          username: user.name,
          karma: user.total_karma,
          accountAgeDays: Math.floor((Date.now() - user.created_utc * 1000) / (1000 * 60 * 60 * 24))
        }
      };
    } catch (error) {
      console.error('Reddit link error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch recent analytics from YouTube
   */
  async getYouTubeAnalytics(discordUserId) {
    if (!this.platforms.youtube) {
      return { success: false, error: 'YouTube API not initialized' };
    }

    try {
      const integration = db.prepare(
        'SELECT platform_user_id FROM platform_integrations WHERE discord_user_id = ? AND platform = ?'
      ).get(discordUserId, 'youtube');

      if (!integration) {
        return { success: false, error: 'No YouTube channel linked' };
      }

      // Get latest channel statistics
      const response = await this.platforms.youtube.channels.list({
        part: 'statistics',
        id: integration.platform_user_id
      });

      if (!response.data.items || response.data.items.length === 0) {
        return { success: false, error: 'Channel not found' };
      }

      const stats = response.data.items[0].statistics;

      // Get recent videos (last 5)
      const videosResponse = await this.platforms.youtube.search.list({
        part: 'snippet',
        channelId: integration.platform_user_id,
        order: 'date',
        maxResults: 5,
        type: 'video'
      });

      const videos = videosResponse.data.items.map(v => ({
        id: v.id.videoId,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt
      }));

      return {
        success: true,
        analytics: {
          subscribers: parseInt(stats.subscriberCount),
          totalViews: parseInt(stats.viewCount),
          videoCount: parseInt(stats.videoCount),
          recentVideos: videos
        }
      };
    } catch (error) {
      console.error('YouTube analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch recent analytics from Twitter
   */
  async getTwitterAnalytics(discordUserId) {
    if (!this.platforms.twitter) {
      return { success: false, error: 'Twitter API not initialized' };
    }

    try {
      const integration = db.prepare(
        'SELECT platform_user_id FROM platform_integrations WHERE discord_user_id = ? AND platform = ?'
      ).get(discordUserId, 'twitter');

      if (!integration) {
        return { success: false, error: 'No Twitter account linked' };
      }

      // Get user metrics
      const user = await this.platforms.twitter.v2.user(integration.platform_user_id, {
        'user.fields': ['public_metrics']
      });

      // Get recent tweets
      const tweets = await this.platforms.twitter.v2.userTimeline(integration.platform_user_id, {
        max_results: 10,
        'tweet.fields': ['public_metrics', 'created_at']
      });

      const recentTweets = tweets.data.data.map(t => ({
        id: t.id,
        text: t.text.substring(0, 100),
        likes: t.public_metrics.like_count,
        retweets: t.public_metrics.retweet_count,
        replies: t.public_metrics.reply_count,
        createdAt: t.created_at
      }));

      return {
        success: true,
        analytics: {
          followers: user.data.public_metrics.followers_count,
          following: user.data.public_metrics.following_count,
          tweets: user.data.public_metrics.tweet_count,
          recentTweets
        }
      };
    } catch (error) {
      console.error('Twitter analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch recent analytics from Reddit
   */
  async getRedditAnalytics(discordUserId) {
    if (!this.platforms.reddit) {
      return { success: false, error: 'Reddit API not initialized' };
    }

    try {
      const integration = db.prepare(
        'SELECT platform_username FROM platform_integrations WHERE discord_user_id = ? AND platform = ?'
      ).get(discordUserId, 'reddit');

      if (!integration) {
        return { success: false, error: 'No Reddit account linked' };
      }

      const user = await this.platforms.reddit.getUser(integration.platform_username).fetch();
      
      // Get recent submissions
      const submissions = await user.getSubmissions({ limit: 10 });
      const recentPosts = submissions.slice(0, 10).map(s => ({
        id: s.id,
        title: s.title,
        subreddit: s.subreddit.display_name,
        score: s.score,
        comments: s.num_comments,
        createdAt: new Date(s.created_utc * 1000)
      }));

      return {
        success: true,
        analytics: {
          karma: user.total_karma,
          postKarma: user.link_karma,
          commentKarma: user.comment_karma,
          recentPosts
        }
      };
    } catch (error) {
      console.error('Reddit analytics error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate cross-platform correlation score
   * Identifies patterns across platforms to optimize content strategy
   */
  async calculateCorrelation(discordUserId) {
    try {
      const platforms = db.prepare(
        'SELECT platform FROM platform_integrations WHERE discord_user_id = ?'
      ).all(discordUserId).map(p => p.platform);

      if (platforms.length < 2) {
        return {
          success: false,
          error: 'Need at least 2 platforms linked for correlation analysis'
        };
      }

      const analytics = {};
      
      // Fetch analytics from all linked platforms
      for (const platform of platforms) {
        if (platform === 'youtube') {
          analytics.youtube = await this.getYouTubeAnalytics(discordUserId);
        } else if (platform === 'twitter') {
          analytics.twitter = await this.getTwitterAnalytics(discordUserId);
        } else if (platform === 'reddit') {
          analytics.reddit = await this.getRedditAnalytics(discordUserId);
        }
      }

      // Calculate engagement score (normalized 0-100)
      let engagementScore = 0;
      if (analytics.youtube?.success) {
        const avgViewsPerVideo = analytics.youtube.analytics.totalViews / analytics.youtube.analytics.videoCount;
        engagementScore += Math.min((avgViewsPerVideo / 10000) * 100, 100) * 0.4;
      }
      if (analytics.twitter?.success) {
        const avgEngagement = analytics.twitter.analytics.recentTweets.reduce((sum, t) => 
          sum + t.likes + t.retweets + t.replies, 0) / analytics.twitter.analytics.recentTweets.length;
        engagementScore += Math.min((avgEngagement / 100) * 100, 100) * 0.35;
      }
      if (analytics.reddit?.success) {
        const avgScore = analytics.reddit.analytics.recentPosts.reduce((sum, p) => 
          sum + p.score, 0) / analytics.reddit.analytics.recentPosts.length;
        engagementScore += Math.min((avgScore / 50) * 100, 100) * 0.25;
      }

      // Calculate growth potential (based on follower counts)
      let growthScore = 0;
      if (analytics.youtube?.success) {
        growthScore += Math.min((analytics.youtube.analytics.subscribers / 100000) * 100, 100) * 0.4;
      }
      if (analytics.twitter?.success) {
        growthScore += Math.min((analytics.twitter.analytics.followers / 50000) * 100, 100) * 0.35;
      }
      if (analytics.reddit?.success) {
        growthScore += Math.min((analytics.reddit.analytics.karma / 10000) * 100, 100) * 0.25;
      }

      // Overall correlation (higher = better multi-platform performance)
      const correlationScore = Math.round(
        engagementScore * this.correlationWeights.engagement +
        growthScore * this.correlationWeights.growth
      );

      return {
        success: true,
        correlation: {
          score: correlationScore,
          grade: this.scoreToGrade(correlationScore),
          breakdown: {
            engagement: Math.round(engagementScore),
            growth: Math.round(growthScore)
          },
          platforms: platforms.length,
          recommendation: this.getRecommendation(correlationScore, platforms)
        },
        analytics
      };
    } catch (error) {
      console.error('Correlation calculation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert numerical score to letter grade
   */
  scoreToGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Generate strategic recommendation based on correlation score
   */
  getRecommendation(score, platforms) {
    if (score >= 80) {
      return 'Excellent multi-platform presence! Focus on premium content and monetization.';
    } else if (score >= 60) {
      return 'Strong foundation. Consider cross-promoting content between platforms.';
    } else if (score >= 40) {
      return 'Growing presence. Analyze top-performing content and replicate across platforms.';
    } else {
      return 'Early stage. Link more platforms and focus on consistent posting schedule.';
    }
  }

  /**
   * Get unified cross-platform dashboard
   */
  async getDashboard(discordUserId) {
    const platforms = db.prepare(
      'SELECT * FROM platform_integrations WHERE discord_user_id = ? ORDER BY connected_at DESC'
    ).all(discordUserId);

    if (platforms.length === 0) {
      return {
        success: false,
        error: 'No platforms linked. Use !link_youtube, !link_twitter, or !link_reddit'
      };
    }

    const correlation = await this.calculateCorrelation(discordUserId);

    return {
      success: true,
      dashboard: {
        linkedPlatforms: platforms.length,
        platforms: platforms.map(p => ({
          platform: p.platform,
          username: p.platform_username,
          connectedAt: p.connected_at,
          metadata: JSON.parse(p.metadata)
        })),
        correlation: correlation.success ? correlation.correlation : null,
        multiplier: platforms.length >= 3 ? '3x' : platforms.length >= 2 ? '2x' : '1x'
      }
    };
  }
}

module.exports = DataSovereigntyEngine;
