/**
 * Twitter Integration Module
 * 
 * Free tier API v2 for social presence
 * Accounts: @n8ked_brand (community) + @n8ked_dev (technical)
 * 
 * Archetypal Learning: Twitter teaches viral pattern propagation
 */

const https = require('https');

class TwitterIntegration {
  constructor(bearerToken) {
    this.bearerToken = bearerToken;
    this.userAgent = 'N8.KED-Commonwealth/1.0';
    
    // Dual account strategy
    this.accounts = {
      brand: 'n8ked_brand',    // Community engagement, philosophy, brand voice
      dev: 'n8ked_dev'         // Technical updates, architecture, glass house
    };
  }

  /**
   * Fetch user profile data
   * @param {string} username - Twitter username
   * @returns {Promise<object>} User data
   */
  async fetchUserData(username) {
    try {
      const data = await this.makeRequest(`/2/users/by/username/${username}?user.fields=created_at,description,public_metrics,verified`);
      
      if (data.data) {
        const user = data.data;
        return {
          id: user.id,
          username: user.username,
          displayName: user.name,
          description: user.description,
          verified: user.verified || false,
          followersCount: user.public_metrics.followers_count,
          followingCount: user.public_metrics.following_count,
          tweetCount: user.public_metrics.tweet_count,
          createdAt: new Date(user.created_at)
        };
      }
      
      return null;
    } catch (error) {
      console.error('[Twitter] User fetch failed:', error);
      return null;
    }
  }

  /**
   * Fetch recent tweets from a user
   * @param {string} userId - Twitter user ID
   * @param {number} maxResults - Max tweets to fetch (5-100)
   * @returns {Promise<array>} Array of tweets
   */
  async fetchUserTweets(userId, maxResults = 10) {
    try {
      const data = await this.makeRequest(`/2/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics`);
      
      if (data.data) {
        return data.data.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          createdAt: new Date(tweet.created_at),
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          url: `https://twitter.com/i/web/status/${tweet.id}`
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[Twitter] Tweet fetch failed:', error);
      return [];
    }
  }

  /**
   * Search tweets mentioning N8.KED
   * @param {string} query - Search query
   * @param {number} maxResults - Max results (10-100)
   * @returns {Promise<array>} Array of tweets
   */
  async searchTweets(query = 'n8.ked OR @n8ked_brand OR @n8ked_dev', maxResults = 10) {
    try {
      const data = await this.makeRequest(`/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,public_metrics,author_id`);
      
      if (data.data) {
        return data.data.map(tweet => ({
          id: tweet.id,
          text: tweet.text,
          authorId: tweet.author_id,
          createdAt: new Date(tweet.created_at),
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          url: `https://twitter.com/i/web/status/${tweet.id}`
        }));
      }
      
      return [];
    } catch (error) {
      console.error('[Twitter] Search failed:', error);
      return [];
    }
  }

  /**
   * Make API request to Twitter API v2
   * @param {string} endpoint - API endpoint
   * @returns {Promise<object>} JSON response
   */
  makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.twitter.com',
        path: endpoint,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
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
          } else if (res.statusCode === 429) {
            reject(new Error('Rate limit exceeded'));
          } else {
            reject(new Error(`Twitter API error: ${res.statusCode}`));
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
   * Convert Twitter metrics to dust rewards
   * @param {number} followersCount - Follower count
   * @param {number} tweetCount - Total tweets
   * @param {number} engagementRate - Avg engagement rate (likes + retweets / followers)
   * @returns {number} Dust amount
   */
  metricsToDust(followersCount, tweetCount, engagementRate = 0.01) {
    // Logarithmic scaling with engagement multiplier
    const followerDust = Math.floor(Math.sqrt(followersCount) * 20);
    const contentDust = Math.floor(Math.sqrt(tweetCount) * 5);
    const engagementBonus = Math.floor(followerDust * engagementRate * 10);
    
    return followerDust + contentDust + engagementBonus;
  }

  /**
   * Generate tweet templates for N8.KED announcements
   * @param {string} type - Announcement type
   * @param {object} data - Tweet data
   * @returns {string} Formatted tweet text
   */
  generateTweet(type, data) {
    const templates = {
      wallet_linked: `🔗 New sovereign citizen linked ${data.chainCount} wallets across ${data.chains}!\n\nCross-chain dust economy activated.\nTree of Life Protocol: Each blockchain teaches archetypal wisdom.\n\n#Web3 #DeFi #Sovereignty`,
      
      milestone: `🏛️ N8.KED Commonwealth Milestone:\n\n${data.metric}: ${data.value}\n\nGlass House Transparency | Constitutional Voice\n\nJoin the sovereign digital nation → discord.gg/n8ked\n\n#Crypto #DAO`,
      
      herald_testimony: `📜 The Herald Speaks:\n\n"${data.message}"\n\nObservable fact, not persuasion.\nMathematics, not marketing.\n\n#Blockchain #Governance`,
      
      architecture_update: `⚡ Architecture Update:\n\n${data.feature} deployed\n${data.description}\n\nGitHub: github.com/n8ked-commonwealth\n\n#OpenSource #Development`
    };
    
    return templates[type] || data.text;
  }
}

module.exports = { TwitterIntegration };
