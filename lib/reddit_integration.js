/**
 * Reddit Integration Module
 * 
 * Free tier script app for karma import and content aggregation
 * No API key required for read-only operations
 * 
 * Archetypal Learning: Reddit teaches community consensus patterns
 */

const https = require('https');

class RedditIntegration {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.userAgent = 'N8.KED-Commonwealth/1.0';
  }

  /**
   * Fetch user karma and post history (no auth required)
   * @param {string} username - Reddit username
   * @returns {Promise<object>} User data with karma and recent posts
   */
  async fetchUserData(username) {
    try {
      const userData = await this.makeRequest(`/user/${username}/about.json`);
      const posts = await this.makeRequest(`/user/${username}/submitted.json?limit=25`);
      
      return {
        username: userData.data.name,
        totalKarma: userData.data.total_karma,
        linkKarma: userData.data.link_karma,
        commentKarma: userData.data.comment_karma,
        accountAge: Math.floor((Date.now() - userData.data.created_utc * 1000) / (1000 * 60 * 60 * 24)),
        recentPosts: posts.data.children.map(post => ({
          title: post.data.title,
          subreddit: post.data.subreddit,
          score: post.data.score,
          url: `https://reddit.com${post.data.permalink}`
        }))
      };
    } catch (error) {
      console.error('[Reddit] User fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch N8.KED-related posts from programming subreddits
   * @returns {Promise<array>} Recent relevant posts
   */
  async fetchRelevantPosts() {
    const subreddits = ['programming', 'cryptocurrency', 'cryptodev', 'ethereum', 'solana'];
    const keywords = ['n8.ked', 'wallet federation', 'sovereign identity', 'dust economy'];
    
    const posts = [];
    
    for (const subreddit of subreddits) {
      try {
        const data = await this.makeRequest(`/r/${subreddit}/new.json?limit=25`);
        
        data.data.children.forEach(post => {
          const title = post.data.title.toLowerCase();
          const selftext = (post.data.selftext || '').toLowerCase();
          
          if (keywords.some(keyword => title.includes(keyword) || selftext.includes(keyword))) {
            posts.push({
              title: post.data.title,
              subreddit: post.data.subreddit,
              author: post.data.author,
              score: post.data.score,
              comments: post.data.num_comments,
              url: `https://reddit.com${post.data.permalink}`,
              timestamp: post.data.created_utc * 1000
            });
          }
        });
      } catch (error) {
        console.error(`[Reddit] Subreddit ${subreddit} fetch failed:`, error);
      }
    }
    
    return posts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Make HTTP request to Reddit API (no auth)
   * @param {string} endpoint - API endpoint
   * @returns {Promise<object>} JSON response
   */
  makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.reddit.com',
        path: endpoint,
        method: 'GET',
        headers: {
          'User-Agent': this.userAgent
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`Reddit API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Convert Reddit karma to dust rewards
   * @param {number} karma - Total Reddit karma
   * @returns {number} Dust amount
   */
  karmaToDust(karma) {
    // Logarithmic scaling: sqrt(karma) * 10
    // 1000 karma = 316 dust
    // 10000 karma = 1000 dust
    return Math.floor(Math.sqrt(karma) * 10);
  }
}

module.exports = { RedditIntegration };
