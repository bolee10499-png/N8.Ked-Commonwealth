/**
 * N8.KED Web Overlay Application
 * 
 * Connects to N8.KED Discord bot backend for live data
 * Dark aesthetic with "spooky" theme per user preference
 */

const API_BASE = 'http://localhost:3000'; // Update with actual API endpoint

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[N8.KED] Web overlay initialized');
  
  // Load initial data
  await loadFederationStats();
  await loadHeraldFeed();
  await loadLeaderboard();
  
  // Start live updates (15 second intervals)
  setInterval(loadFederationStats, 15000);
  setInterval(loadHeraldFeed, 15000);
  setInterval(loadLeaderboard, 30000);
});

/**
 * Load wallet federation statistics
 */
async function loadFederationStats() {
  try {
    // TODO: Replace with actual API endpoint
    // For now, use mock data for zero-budget deployment
    const mockStats = {
      totalCitizens: 42,
      totalWallets: 127,
      totalDust: 84250.75,
      chainsConnected: 4,
      waterReserves: 84.25,
      chainStats: [
        { chain: 'solana', wallet_count: 45, total_dust: 32500 },
        { chain: 'ethereum', wallet_count: 38, total_dust: 28750 },
        { chain: 'bitcoin', wallet_count: 32, total_dust: 18000 },
        { chain: 'xrp', wallet_count: 12, total_dust: 5000.75 }
      ]
    };

    // Update hero stats
    updateElement('total-citizens', mockStats.totalCitizens);
    updateElement('total-wallets', mockStats.totalWallets);
    updateElement('total-dust', formatNumber(mockStats.totalDust));
    updateElement('chains-connected', mockStats.chainsConnected);

    // Update chain-specific stats
    mockStats.chainStats.forEach(chain => {
      updateElement(`${chain.chain}-wallets`, chain.wallet_count);
      updateElement(`${chain.chain}-dust`, formatNumber(chain.total_dust));
    });

    // Update water economy
    updateElement('water-reserves', mockStats.waterReserves.toFixed(2));
    updateElement('dust-backing', formatNumber(mockStats.waterReserves * 1000));

  } catch (error) {
    console.error('[N8.KED] Failed to load federation stats:', error);
  }
}

/**
 * Load Herald testimony feed
 */
async function loadHeraldFeed() {
  try {
    // TODO: Replace with actual API endpoint
    const mockHeraldMessages = [
      {
        id: 1,
        type: 'SOVEREIGNTY_CLAIMED',
        message: 'Citizen aris.reality linked 3 wallets across Solana, Ethereum, and Bitcoin. Cross-chain federation activated.',
        timestamp: Date.now() - 120000,
        dust_impact: 150
      },
      {
        id: 2,
        type: 'WATER_RESERVE_ADDED',
        message: 'USGS flow data integrated: 8.5 liters added to reserves. Backing ratio: 1000 dust/liter.',
        timestamp: Date.now() - 300000,
        dust_impact: 8500
      },
      {
        id: 3,
        type: 'REPUTATION_THRESHOLD',
        message: 'Citizen quantum.seeker achieved Sentinel rank with 5,000 reputation points.',
        timestamp: Date.now() - 600000,
        dust_impact: 0
      }
    ];

    const feedContainer = document.getElementById('herald-feed');
    feedContainer.innerHTML = mockHeraldMessages.map(msg => `
      <div class="herald-message ${msg.type.toLowerCase()}">
        <div class="message-header">
          <span class="message-type">${formatHeraldType(msg.type)}</span>
          <span class="message-time">${formatTimestamp(msg.timestamp)}</span>
        </div>
        <p class="message-text">${msg.message}</p>
        ${msg.dust_impact > 0 ? `<span class="dust-impact">+${formatNumber(msg.dust_impact)} dust</span>` : ''}
      </div>
    `).join('');

  } catch (error) {
    console.error('[N8.KED] Failed to load Herald feed:', error);
    document.getElementById('herald-feed').innerHTML = `
      <div class="herald-message error">
        <p>Herald connection unavailable. Retrying...</p>
      </div>
    `;
  }
}

/**
 * Load reputation leaderboard
 */
async function loadLeaderboard() {
  try {
    // TODO: Replace with actual API endpoint
    const mockLeaderboard = [
      { username: 'aris.reality', reputation: 8750, dust_balance: 42500, wallets_linked: 5, rank: 1 },
      { username: 'quantum.seeker', reputation: 5240, dust_balance: 28750, wallets_linked: 3, rank: 2 },
      { username: 'void.wanderer', reputation: 3890, dust_balance: 19200, wallets_linked: 2, rank: 3 },
      { username: 'crystal.miner', reputation: 2750, dust_balance: 15600, wallets_linked: 4, rank: 4 },
      { username: 'dust.collector', reputation: 1980, dust_balance: 12300, wallets_linked: 2, rank: 5 }
    ];

    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = `
      <div class="leaderboard-table">
        <div class="leaderboard-header">
          <span>Rank</span>
          <span>Citizen</span>
          <span>Reputation</span>
          <span>Dust Balance</span>
          <span>Wallets</span>
        </div>
        ${mockLeaderboard.map(citizen => `
          <div class="leaderboard-row rank-${citizen.rank}">
            <span class="rank">${getRankMedal(citizen.rank)}</span>
            <span class="username">${citizen.username}</span>
            <span class="reputation">${formatNumber(citizen.reputation)}</span>
            <span class="dust">${formatNumber(citizen.dust_balance)}</span>
            <span class="wallets">${citizen.wallets_linked}</span>
          </div>
        `).join('')}
      </div>
    `;

  } catch (error) {
    console.error('[N8.KED] Failed to load leaderboard:', error);
  }
}

/**
 * Utility: Update element text content
 */
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Utility: Format numbers with commas
 */
function formatNumber(num) {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Utility: Format Herald message type
 */
function formatHeraldType(type) {
  const types = {
    'SOVEREIGNTY_CLAIMED': '👑 Sovereignty',
    'WATER_RESERVE_ADDED': '💧 Water Reserve',
    'REPUTATION_THRESHOLD': '⭐ Reputation',
    'CIRCUIT_BUILT': '⚡ Circuit',
    'EXPLORATION_COMPLETED': '🗺️ Exploration'
  };
  return types[type] || type;
}

/**
 * Utility: Format timestamp to relative time
 */
function formatTimestamp(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Utility: Get rank medal emoji
 */
function getRankMedal(rank) {
  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };
  return medals[rank] || `#${rank}`;
}

/**
 * Smooth scroll for navigation links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
