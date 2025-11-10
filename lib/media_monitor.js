/**
 * MEDIA MONITORING SYSTEM
 * 
 * Tracks external mentions of N8.KED Commonwealth across:
 * - Twitter (mentions, hashtags, engagement)
 * - Reddit (submissions, comments)
 * - Hacker News (submissions, comments)
 * - GitHub (stars, forks, watchers, mentions)
 * 
 * Provides early warning when project goes viral so creator can
 * separate personal identity before mainstream attention.
 * 
 * "wonder if this soverign can track if it ever starts becoming 
 *  a headline or posted about" - The Sovereign
 */

class MediaMonitor {
  constructor(db, herald) {
    this.db = db;
    this.herald = herald;
    
    // Search terms
    this.searchTerms = [
      'N8.KED',
      'n8.ked',
      'N8KED',
      'Keds Declassified',
      'bolee10499-png/N8.Ked-Commonwealth',
      '@InverseScaling', // Future Twitter handle
      'inverse scaling architecture'
    ];
    
    // Viral thresholds
    this.viralThresholds = {
      twitter: {
        mentions: 100,
        retweets: 50,
        likes: 500
      },
      reddit: {
        upvotes: 1000,
        comments: 100
      },
      hackerNews: {
        points: 100,
        comments: 50
      },
      github: {
        stars: 100,
        forks: 20,
        watchers: 50
      }
    };
    
    // Check interval (15 minutes)
    this.checkInterval = 15 * 60 * 1000;
    this.isMonitoring = false;
  }

  /**
   * START MONITORING
   * Begin 15-minute check cycle
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Media monitoring already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Media monitoring started (15-minute intervals)');
    console.log('🔍 Platforms: Twitter, Reddit, Hacker News, GitHub');

    // Initial check
    await this.runFullCheck();

    // Schedule recurring checks
    this.monitoringInterval = setInterval(async () => {
      await this.runFullCheck();
    }, this.checkInterval);
  }

  /**
   * STOP MONITORING
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    clearInterval(this.monitoringInterval);
    this.isMonitoring = false;
    console.log('⏹️ Media monitoring stopped');
  }

  /**
   * RUN FULL CHECK
   * Check all platforms and alert on viral thresholds
   */
  async runFullCheck() {
    try {
      const results = {
        twitter: await this.checkTwitterMentions(),
        reddit: await this.checkRedditMentions(),
        hackerNews: await this.checkHackerNews(),
        github: await this.checkGitHubActivity()
      };

      // Store results
      await this.storeMentions(results);

      // Check viral thresholds
      await this.checkViralThresholds(results);

      return results;
    } catch (error) {
      console.error('❌ Media monitoring check failed:', error);
      return null;
    }
  }

  /**
   * CHECK TWITTER MENTIONS
   * Twitter API v2 (free tier: 500k tweets/month)
   */
  async checkTwitterMentions() {
    // Placeholder: Requires Twitter API credentials
    // For now, return mock data structure
    
    console.log('🐦 Checking Twitter mentions...');
    
    // TODO: Implement Twitter API v2 search
    // const response = await fetch('https://api.twitter.com/2/tweets/search/recent?query=' + searchQuery);
    
    return {
      platform: 'twitter',
      mentions: 0,
      retweets: 0,
      likes: 0,
      topTweets: [],
      timestamp: Date.now(),
      note: 'Twitter API integration pending'
    };
  }

  /**
   * CHECK REDDIT MENTIONS
   * Reddit API (free, no auth needed for search)
   */
  async checkRedditMentions() {
    console.log('🔴 Checking Reddit mentions...');
    
    const mentions = [];
    
    for (const term of this.searchTerms) {
      try {
        // Search Reddit (no auth required)
        const response = await fetch(
          `https://www.reddit.com/search.json?q=${encodeURIComponent(term)}&limit=25&sort=new`
        );
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data.children.map(child => ({
            title: child.data.title,
            subreddit: child.data.subreddit,
            upvotes: child.data.ups,
            comments: child.data.num_comments,
            url: `https://reddit.com${child.data.permalink}`,
            created: child.data.created_utc
          }));
          
          mentions.push(...posts);
        }
      } catch (error) {
        console.error(`Reddit search failed for "${term}":`, error.message);
      }
    }
    
    return {
      platform: 'reddit',
      totalMentions: mentions.length,
      mentions: mentions,
      timestamp: Date.now()
    };
  }

  /**
   * CHECK HACKER NEWS
   * HN Algolia API (free)
   */
  async checkHackerNews() {
    console.log('📰 Checking Hacker News...');
    
    const mentions = [];
    
    for (const term of this.searchTerms) {
      try {
        // HN Algolia API
        const response = await fetch(
          `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(term)}&tags=(story,comment)`
        );
        
        if (response.ok) {
          const data = await response.json();
          const items = data.hits.map(hit => ({
            title: hit.title || hit.comment_text?.substring(0, 100),
            type: hit._tags.includes('story') ? 'story' : 'comment',
            points: hit.points || 0,
            comments: hit.num_comments || 0,
            url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
            created: hit.created_at_i
          }));
          
          mentions.push(...items);
        }
      } catch (error) {
        console.error(`HN search failed for "${term}":`, error.message);
      }
    }
    
    return {
      platform: 'hackerNews',
      totalMentions: mentions.length,
      mentions: mentions,
      timestamp: Date.now()
    };
  }

  /**
   * CHECK GITHUB ACTIVITY
   * GitHub API (60 requests/hour unauthenticated)
   */
  async checkGitHubActivity() {
    console.log('💻 Checking GitHub activity...');
    
    try {
      // Check repository stats
      const response = await fetch(
        'https://api.github.com/repos/bolee10499-png/N8.Ked-Commonwealth'
      );
      
      if (response.ok) {
        const data = await response.json();
        
        return {
          platform: 'github',
          stars: data.stargazers_count,
          forks: data.forks_count,
          watchers: data.subscribers_count,
          openIssues: data.open_issues_count,
          lastPush: data.pushed_at,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('GitHub API check failed:', error.message);
    }
    
    return {
      platform: 'github',
      stars: 0,
      forks: 0,
      watchers: 0,
      timestamp: Date.now(),
      error: 'API check failed'
    };
  }

  /**
   * STORE MENTIONS
   * Save to database for historical tracking
   */
  async storeMentions(results) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO media_mentions (
          platform, data, timestamp
        ) VALUES (?, ?, ?)
      `);
      
      for (const [platform, data] of Object.entries(results)) {
        stmt.run(platform, JSON.stringify(data), Date.now());
      }
    } catch (error) {
      console.error('Failed to store mentions:', error);
    }
  }

  /**
   * CHECK VIRAL THRESHOLDS
   * Alert when viral thresholds are hit
   */
  async checkViralThresholds(results) {
    const alerts = [];

    // Twitter thresholds
    if (results.twitter.mentions >= this.viralThresholds.twitter.mentions) {
      alerts.push({
        platform: 'Twitter',
        metric: 'mentions',
        value: results.twitter.mentions,
        threshold: this.viralThresholds.twitter.mentions
      });
    }

    // Reddit thresholds
    const topRedditPost = results.reddit.mentions
      .sort((a, b) => b.upvotes - a.upvotes)[0];
    
    if (topRedditPost && topRedditPost.upvotes >= this.viralThresholds.reddit.upvotes) {
      alerts.push({
        platform: 'Reddit',
        metric: 'upvotes',
        value: topRedditPost.upvotes,
        threshold: this.viralThresholds.reddit.upvotes,
        url: topRedditPost.url
      });
    }

    // Hacker News thresholds
    const topHNPost = results.hackerNews.mentions
      .sort((a, b) => b.points - a.points)[0];
    
    if (topHNPost && topHNPost.points >= this.viralThresholds.hackerNews.points) {
      alerts.push({
        platform: 'Hacker News',
        metric: 'points',
        value: topHNPost.points,
        threshold: this.viralThresholds.hackerNews.points,
        url: topHNPost.url
      });
    }

    // GitHub thresholds
    if (results.github.stars >= this.viralThresholds.github.stars) {
      alerts.push({
        platform: 'GitHub',
        metric: 'stars',
        value: results.github.stars,
        threshold: this.viralThresholds.github.stars
      });
    }

    // Log alerts to console
    for (const alert of alerts) {
      console.log(`🚨 VIRAL ALERT: ${alert.platform} ${alert.metric} reached ${alert.value} (threshold: ${alert.threshold})`);
      if (alert.url) {
        console.log(`� URL: ${alert.url}`);
      }
    }

    return alerts;
  }

  /**
   * GET MONITORING STATUS
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.checkInterval,
      searchTerms: this.searchTerms,
      viralThresholds: this.viralThresholds
    };
  }
}

module.exports = MediaMonitor;
