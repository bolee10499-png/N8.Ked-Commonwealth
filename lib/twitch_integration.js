/**
 * Twitch Integration Module
 * 
 * Free tier API for stream metadata capture
 * Requires Twitch Client ID (free registration)
 * 
 * Archetypal Learning: Twitch teaches live engagement patterns
 */

const https = require('https');

class TwitchIntegration {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.tokenExpiry = 0;
  }

  /**
   * Get OAuth access token (app access token, no user auth required)
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const data = await this.makeAuthRequest();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      console.log('[Twitch] Access token obtained');
      return this.accessToken;
    } catch (error) {
      console.error('[Twitch] Auth failed:', error);
      throw error;
    }
  }

  /**
   * Fetch user data by username
   * @param {string} username - Twitch username
   * @returns {Promise<object>} User data
   */
  async fetchUserData(username) {
    const token = await this.getAccessToken();
    
    try {
      const data = await this.makeAPIRequest(`/users?login=${username}`, token);
      
      if (data.data && data.data.length > 0) {
        const user = data.data[0];
        return {
          id: user.id,
          username: user.login,
          displayName: user.display_name,
          description: user.description,
          viewCount: user.view_count,
          createdAt: new Date(user.created_at),
          profileImageUrl: user.profile_image_url
        };
      }
      
      return null;
    } catch (error) {
      console.error('[Twitch] User fetch failed:', error);
      return null;
    }
  }

  /**
   * Check if user is currently streaming
   * @param {string} userId - Twitch user ID
   * @returns {Promise<object|null>} Stream data or null if offline
   */
  async getActiveStream(userId) {
    const token = await this.getAccessToken();
    
    try {
      const data = await this.makeAPIRequest(`/streams?user_id=${userId}`, token);
      
      if (data.data && data.data.length > 0) {
        const stream = data.data[0];
        return {
          gameId: stream.game_id,
          gameName: stream.game_name,
          title: stream.title,
          viewerCount: stream.viewer_count,
          startedAt: new Date(stream.started_at),
          thumbnailUrl: stream.thumbnail_url
        };
      }
      
      return null; // Offline
    } catch (error) {
      console.error('[Twitch] Stream check failed:', error);
      return null;
    }
  }

  /**
   * Make auth request to Twitch OAuth
   * @returns {Promise<object>} Auth response
   */
  makeAuthRequest() {
    return new Promise((resolve, reject) => {
      const postData = `client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`;
      
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
            reject(new Error(`Twitch auth error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Make API request to Twitch Helix API
   * @param {string} endpoint - API endpoint
   * @param {string} token - Access token
   * @returns {Promise<object>} JSON response
   */
  makeAPIRequest(endpoint, token) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.twitch.tv',
        path: `/helix${endpoint}`,
        method: 'GET',
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`
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
            reject(new Error(`Twitch API error: ${res.statusCode}`));
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
   * Convert Twitch metrics to dust rewards
   * @param {number} viewCount - Total view count
   * @param {number} followerCount - Follower count (if available)
   * @returns {number} Dust amount
   */
  metricsToDust(viewCount, followerCount = 0) {
    // Logarithmic scaling based on views and followers
    const viewDust = Math.floor(Math.sqrt(viewCount) * 5);
    const followerDust = Math.floor(Math.sqrt(followerCount) * 15);
    return viewDust + followerDust;
  }
}

module.exports = { TwitchIntegration };
