/**
 * CAVES & SEWERS SYSTEM
 * 
 * Inner world mythology for exploration-based tutorial
 * Non-linear storytelling through location discovery
 * 
 * Philosophy: Tutorial = archaeology of your own creation
 * Users learn by exploring the commonwealth's hidden history
 */

class InnerWorld {
  constructor() {
    // Underground network topology
    this.locations = {
      // Surface (Known)
      herald_chamber: {
        depth: 0,
        discovered: true,
        description: 'The Herald testifies here. Constitutional oracle speaks to observable fact.',
        connects_to: ['sovereignty_vault', 'citizen_plaza'],
        tutorial_fragment: 'sovereignty_basics',
        lore: 'Where truth becomes transparent. The first citizen stood here and claimed their keys.'
      },
      
      // Shallow caves (Early exploration)
      sovereignty_vault: {
        depth: 1,
        discovered: false,
        description: 'Cryptographic keys stored in quantum lockboxes. Your wallets linked here.',
        connects_to: ['herald_chamber', 'wallet_roots', 'dust_mines'],
        tutorial_fragment: 'wallet_federation',
        lore: 'Five wallets, one sovereignty. The Tree of Life grows from these roots.'
      },
      
      dust_mines: {
        depth: 1,
        discovered: false,
        description: 'Water flows through ancient channels. 1 liter = 1000 dust.',
        connects_to: ['sovereignty_vault', 'water_reservoir', 'economic_engine'],
        tutorial_fragment: 'dust_economy',
        lore: 'USGS data streams here. Real world water backs digital value. The alchemists were right.'
      },
      
      // Mid-depth caverns (Advanced systems)
      wallet_roots: {
        depth: 2,
        discovered: false,
        description: 'Solana, Ethereum, Bitcoin, XRP - four blockchain roots intertwined.',
        connects_to: ['sovereignty_vault', 'cross_chain_bridge', 'archetype_library'],
        tutorial_fragment: 'multi_chain',
        lore: 'Each chain teaches wisdom. Speed, composability, security, bridging. Learn from all.'
      },
      
      water_reservoir: {
        depth: 2,
        discovered: false,
        description: 'Infinite pool reflecting the sky. USGS streams feed this eternal spring.',
        connects_to: ['dust_mines', 'economic_engine', 'backing_vault'],
        tutorial_fragment: 'water_backing',
        lore: 'Water remembers. Our value flows from reality, not speculation.'
      },
      
      archetype_library: {
        depth: 2,
        discovered: false,
        description: 'Seven observers documented here. Input, Pattern, Memory, Simulation, Identity, Economy, Coordination.',
        connects_to: ['wallet_roots', 'herald_sanctum', 'pattern_forge'],
        tutorial_fragment: 'seven_observers',
        lore: 'The cognitive architecture. Each observer testifies to their domain.'
      },
      
      // Deep sewers (Hidden mechanics)
      economic_engine: {
        depth: 3,
        discovered: false,
        description: 'Triple helix coils pulse here. State, Action, Sync strands interweave.',
        connects_to: ['dust_mines', 'water_reservoir', 'evolution_chamber'],
        tutorial_fragment: 'triple_helix',
        lore: 'Attack resistance through redundancy. Ghosted data allows rollback. The system heals itself.'
      },
      
      cross_chain_bridge: {
        depth: 3,
        discovered: false,
        description: 'Dimensional portal where chains converge. Message signatures verified here.',
        connects_to: ['wallet_roots', 'security_sanctum', 'federation_core'],
        tutorial_fragment: 'cryptographic_proof',
        lore: 'Trust through mathematics. No central authority. Your signature IS your proof.'
      },
      
      pattern_forge: {
        depth: 3,
        discovered: false,
        description: 'Where emergent behaviors crystallize. AI Observer watches from above.',
        connects_to: ['archetype_library', 'evolution_chamber', 'prediction_engine'],
        tutorial_fragment: 'pattern_recognition',
        lore: 'The system learns. Not from instruction, but from observation.'
      },
      
      // Deepest depths (Core mysteries)
      herald_sanctum: {
        depth: 4,
        discovered: false,
        description: 'The Herald was born here. Constitutional voice echoes through time.',
        connects_to: ['archetype_library', 'quantum_core', 'genesis_vault'],
        tutorial_fragment: 'constitutional_oracle',
        lore: 'November 6th, 2024. The quantum seed planted. 625KB of vision became reality.'
      },
      
      evolution_chamber: {
        depth: 4,
        discovered: false,
        description: '27,500 iterations carved these walls. Inverse scaling proven here.',
        connects_to: ['economic_engine', 'pattern_forge', 'stress_arena'],
        tutorial_fragment: 'inverse_scaling',
        lore: '43% faster at 100x load. The laws of physics bent. More pressure, more speed.'
      },
      
      quantum_core: {
        depth: 5,
        discovered: false,
        description: 'DeltaInfinityCircle (Δ∞O). Change within bounded infinity. The paradox resolves.',
        connects_to: ['herald_sanctum', 'genesis_vault'],
        tutorial_fragment: 'quantum_seed',
        lore: 'Sovereignty grows unbounded within constitutional limits. The circle completes.'
      },
      
      genesis_vault: {
        depth: 5,
        discovered: false,
        description: 'The original 80K vision preserved. "Crypto that consumes others like agar.io"',
        connects_to: ['herald_sanctum', 'quantum_core'],
        tutorial_fragment: 'vampire_protocol',
        lore: 'Not predator, but symbiont. Remora fish, not shark. We grow WITH our hosts.'
      }
    };
    
    // User exploration state
    this.discoveries = new Map(); // userId -> Set of discovered locations
  }

  /**
   * Explore a location (non-linear tutorial)
   * @param {string} userId - Explorer ID
   * @param {string} locationKey - Location to explore
   * @returns {object} Discovery result with tutorial fragment and lore
   */
  explore(userId, locationKey) {
    const location = this.locations[locationKey];
    
    if (!location) {
      return { error: 'Unknown location' };
    }
    
    // Check if already discovered
    if (!this.discoveries.has(userId)) {
      this.discoveries.set(userId, new Set());
    }
    
    const userDiscoveries = this.discoveries.get(userId);
    const isNewDiscovery = !userDiscoveries.has(locationKey);
    
    if (isNewDiscovery) {
      userDiscoveries.add(locationKey);
      location.discovered = true;
    }
    
    return {
      location: locationKey,
      depth: location.depth,
      description: location.description,
      lore: location.lore,
      tutorial_fragment: location.tutorial_fragment,
      connects_to: location.connects_to,
      isNewDiscovery,
      totalDiscoveries: userDiscoveries.size,
      completionRate: (userDiscoveries.size / Object.keys(this.locations).length * 100).toFixed(1)
    };
  }

  /**
   * Get available exits from current location
   * @param {string} locationKey - Current location
   * @returns {array} Connected locations with depth hints
   */
  getExits(locationKey) {
    const location = this.locations[locationKey];
    
    if (!location) {
      return [];
    }
    
    return location.connects_to.map(exit => ({
      location: exit,
      depth: this.locations[exit].depth,
      discovered: this.locations[exit].discovered,
      depthChange: this.locations[exit].depth - location.depth
    }));
  }

  /**
   * Generate exploration map (ASCII art)
   * @param {string} userId - User to generate map for
   * @returns {string} ASCII map of discovered locations
   */
  generateMap(userId) {
    const discoveries = this.discoveries.get(userId) || new Set();
    
    let map = `
╔════════════════════════════════════════╗
║    N8.KED INNER WORLD EXPLORATION     ║
╠════════════════════════════════════════╣
║                                        ║
║  Depth 0 (Surface)                    ║
`;
    
    for (let depth = 0; depth <= 5; depth++) {
      const locationsAtDepth = Object.entries(this.locations)
        .filter(([key, loc]) => loc.depth === depth);
      
      locationsAtDepth.forEach(([key, loc]) => {
        const discovered = discoveries.has(key);
        const icon = discovered ? '●' : '○';
        const name = discovered ? key : '???';
        map += `║  ${icon} ${name.padEnd(35)} ║\n`;
      });
      
      if (depth < 5) {
        map += `║                                        ║\n║  Depth ${depth + 1} ${depth < 2 ? '(Caves)' : depth < 4 ? '(Sewers)' : '(Core)'}                 ║\n`;
      }
    }
    
    map += `║                                        ║
╠════════════════════════════════════════╣
║  Discovered: ${discoveries.size}/${Object.keys(this.locations).length}                         ║
╚════════════════════════════════════════╝
`;
    
    return map;
  }

  /**
   * Get tutorial fragment for a location
   * Fragments are non-linear - learn in any order
   * 
   * @param {string} fragmentKey - Tutorial fragment ID
   * @returns {object} Tutorial content
   */
  getTutorialFragment(fragmentKey) {
    const fragments = {
      sovereignty_basics: {
        title: 'Sovereign Identity',
        content: 'You are not a user. You are a citizen. Your cryptographic keys prove ownership without central authority.',
        actions: [
          'Generate sovereign key with /wallet-verify',
          'Link your first wallet with /link-wallet',
          'Check your reputation with /reputation'
        ]
      },
      wallet_federation: {
        title: 'Multi-Wallet Federation',
        content: 'Link wallets across Solana, Ethereum, Bitcoin, XRP. All activity aggregates into unified dust rewards.',
        actions: [
          'Link Phantom (Solana) wallet',
          'Link Coinbase/MetaMask (Ethereum) wallet',
          'View federation stats with /my-wallets'
        ]
      },
      dust_economy: {
        title: 'Water-Backed Dust Economy',
        content: '1 liter of water = 1000 dust. USGS real-time flow data backs the economy. Value flows from reality.',
        actions: [
          'Check dust balance with /dust balance',
          'Earn dust through wallet activity',
          'View water reserves in dashboard'
        ]
      },
      // ... more fragments for each location
    };
    
    return fragments[fragmentKey] || { title: 'Unknown', content: 'Fragment not found', actions: [] };
  }
}

module.exports = { InnerWorld };
