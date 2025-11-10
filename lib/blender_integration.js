/**
 * BLENDER INTEGRATION
 * 
 * Bridge between Discord bot and Blender 3D visualization service
 * Converts Inner World exploration data into 3D scenes
 * 
 * Philosophy:
 * Your commonwealth isn't just text - it's spatial. When users explore
 * locations, they should SEE the architecture, not just read about it.
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class BlenderIntegration {
  constructor(blenderUrl = 'http://localhost:8000') {
    this.blenderUrl = blenderUrl;
    this.isAvailable = false;
    this.outputDir = path.join(__dirname, '..', 'renders');
  }

  /**
   * CHECK IF BLENDER SERVICE IS RUNNING
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.blenderUrl}/health`, {
        timeout: 2000
      });
      this.isAvailable = response.status === 200;
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * GENERATE 3D SCENE FROM EXPLORATION DATA
   * 
   * @param {Object} explorationData - Data from InnerWorld.explore()
   * @param {Object} systemMetrics - AI Observer snapshot
   * @returns {Buffer} PNG image data
   */
  async generateExplorationScene(explorationData, systemMetrics) {
    if (!this.isAvailable) {
      const available = await this.checkHealth();
      if (!available) {
        throw new Error('Blender service not available. Start with: blender --background --python blender/blender_api_server.py');
      }
    }

    // Convert exploration data to topology format
    const topology = this.explorationToTopology(explorationData, systemMetrics);

    try {
      const response = await axios.post(
        `${this.blenderUrl}/generate_scene`,
        { topology },
        {
          responseType: 'arraybuffer',
          timeout: 30000 // 30 seconds for rendering
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('[BLENDER] Scene generation failed:', error.message);
      throw error;
    }
  }

  /**
   * CONVERT EXPLORATION DATA TO BLENDER TOPOLOGY
   * 
   * Maps Inner World concepts to 3D space:
   * - Location depth → Z-axis position
   * - Discovery count → Circle radius
   * - System health → Color intensity
   * - User reputation → Particle density
   */
  explorationToTopology(explorationData, systemMetrics) {
    const { location, depth, discoveries, fragmentsFound } = explorationData;

    // Circle 1: 7 Observers represented as outer ring
    const circle1 = this.createObserverCircle(systemMetrics);

    // Circle 2: Triple Helix represented as inner spiral
    const circle2 = this.createHelixCircle(depth, discoveries, fragmentsFound);

    return {
      circle1,
      circle2,
      metadata: {
        location: location?.name || 'Unknown',
        depth: depth || 0,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * CREATE OBSERVER CIRCLE (Outer Ring)
   * 7 Observers positioned in circle, height based on activity
   */
  createObserverCircle(systemMetrics) {
    const observers = [
      { name: 'Input', value: systemMetrics?.users?.totalUsers || 0 },
      { name: 'Pattern', value: systemMetrics?.reputation?.average || 0 },
      { name: 'Memory', value: systemMetrics?.economy?.totalFRAG || 0 },
      { name: 'Simulation', value: systemMetrics?.governance?.activeProposals || 0 },
      { name: 'Identity', value: systemMetrics?.nfts?.totalNFTs || 0 },
      { name: 'Economy', value: systemMetrics?.economy?.transactionVelocity || 0 },
      { name: 'Coordination', value: systemMetrics?.users?.totalUsers || 0 }
    ];

    return observers.map((observer, i) => {
      const angle = (2 * Math.PI * i) / 7;
      const radius = 5;
      const normalizedValue = Math.min(observer.value / 100, 10); // Scale for visibility

      return {
        x: Math.cos(angle) * (radius + normalizedValue),
        y: Math.sin(angle) * (radius + normalizedValue),
        z: normalizedValue,
        value: observer.value,
        module: observer.name
      };
    });
  }

  /**
   * CREATE HELIX CIRCLE (Inner Spiral)
   * Triple Helix strands represented as spiral
   */
  createHelixCircle(depth, discoveries, fragments) {
    const strands = [
      { name: 'State', value: depth || 1 },
      { name: 'Action', value: discoveries || 1 },
      { name: 'Sync', value: fragments || 1 }
    ];

    return strands.map((strand, i) => {
      const t = (i * 2 * Math.PI) / 3;
      const normalizedValue = Math.min(strand.value / 10, 5);

      return {
        x: Math.cos(t) * (2 + normalizedValue),
        y: Math.sin(t) * (2 + normalizedValue),
        z: normalizedValue * 2,
        value: strand.value,
        strand: strand.name
      };
    });
  }

  /**
   * SAVE RENDER TO DISK
   * Store generated scenes for later retrieval
   */
  async saveRender(imageBuffer, filename) {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDir, { recursive: true });

      const filepath = path.join(this.outputDir, filename);
      await fs.writeFile(filepath, imageBuffer);

      console.log(`[BLENDER] Saved render to ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('[BLENDER] Failed to save render:', error);
      throw error;
    }
  }

  /**
   * GENERATE SIMPLE FALLBACK SCENE
   * If Blender not available, generate ASCII art representation
   */
  generateFallbackScene(explorationData) {
    const { location, depth, discoveries, fragmentsFound } = explorationData;

    const art = `
╔════════════════════════════════════════╗
║   ${(location?.name || 'Unknown Location').padEnd(36)}   ║
╠════════════════════════════════════════╣
║                                        ║
║          ◉ ← 7 Observers              ║
║        ◉   ◉                          ║
║      ◉       ◉                        ║
║        ◉   ◉      ∿∿∿ ← Triple Helix  ║
║          ◉                            ║
║                                        ║
║  Depth: ${String(depth).padEnd(31)} ║
║  Discoveries: ${String(discoveries).padEnd(24)} ║
║  Fragments: ${String(fragmentsFound).padEnd(26)} ║
║                                        ║
╚════════════════════════════════════════╝

⚠️ 3D visualization requires Blender service
Run: blender --background --python blender/blender_api_server.py
    `;

    return art;
  }
}

module.exports = BlenderIntegration;
