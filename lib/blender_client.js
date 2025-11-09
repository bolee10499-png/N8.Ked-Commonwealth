/**
 * BLENDER CLIENT
 * 
 * HTTP client for calling Blender microservice running on html-project
 * Connects to Blender API server on port 8000 for 3D scene generation
 * 
 * Server location: html-project/blender_service/blender_api_server.py
 * 
 * Endpoints:
 * - POST /generate_scene - Generate 3D topology visualization
 * - POST /update_topology - Update topology circles
 */

const fetch = require('node-fetch');

class BlenderClient {
  constructor(baseUrl = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.timeout = 30000; // 30 second timeout for rendering
  }

  /**
   * GENERATE 3D SCENE
   * 
   * @param {Object} sceneData - Scene configuration
   * @param {string} sceneData.topology.location - Location identifier
   * @param {string} sceneData.user_id - User requesting scene
   * @param {number} sceneData.timestamp - Request timestamp
   * 
   * @returns {Buffer} - PNG image buffer
   */
  async generateScene(sceneData) {
    try {
      console.log('[BLENDER] Generating scene:', sceneData.topology?.location);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/generate_scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sceneData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Blender server error: ${response.status} ${response.statusText}`);
      }

      // Response is base64 encoded PNG
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Blender render failed: ${data.error}`);
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(data.image, 'base64');
      
      console.log('[BLENDER] ✅ Scene generated successfully');
      return imageBuffer;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Blender render timeout (30s exceeded)');
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Blender server not running (port 8000)');
      }

      console.error('[BLENDER] Generation failed:', error.message);
      throw error;
    }
  }

  /**
   * UPDATE TOPOLOGY CIRCLES
   * 
   * @param {Array} circles - Array of circle data
   * @returns {Object} - Update status
   */
  async updateTopology(circles) {
    try {
      console.log('[BLENDER] Updating topology circles:', circles.length);

      const response = await fetch(`${this.baseUrl}/update_topology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ circles })
      });

      if (!response.ok) {
        throw new Error(`Topology update failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('[BLENDER] ✅ Topology updated');
      return result;

    } catch (error) {
      console.error('[BLENDER] Topology update failed:', error.message);
      throw error;
    }
  }

  /**
   * CHECK SERVER HEALTH
   * 
   * @returns {boolean} - Server status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * GET SERVER INFO
   * 
   * @returns {Object} - Server metadata
   */
  async getServerInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Server info unavailable');
      }

      return await response.json();
    } catch (error) {
      console.error('[BLENDER] Info request failed:', error.message);
      return {
        status: 'unknown',
        version: 'unknown',
        error: error.message
      };
    }
  }
}

module.exports = BlenderClient;
