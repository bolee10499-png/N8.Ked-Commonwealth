/**
 * N8.KED - The Capital Dashboard Logic
 * THE ACTIVE CITADEL
 * 
 * This script brings the city to life with real-time data from the commonwealth.
 */

// Configuration
const API_BASE = 'http://localhost:3000'; // Update with actual API endpoint
const REFRESH_INTERVAL = 5000; // 5 seconds

// State
let currentFilter = 'all';
let observerData = null;
let leaderboardData = [];

/**
 * Initialize dashboard on load
 */
async function initializeDashboard() {
  console.log('🏛️ Initializing The Capital...');
  
  // Load initial data
  await Promise.all([
    loadSystemStats(),
    loadHeraldFeed(),
    loadLeaderboard(),
    loadObserverSnapshot(),
    initializePulseVisualization()
  ]);
  
  // Set up event listeners
  setupEventListeners();
  
  // Start auto-refresh
  setInterval(refreshDashboard, REFRESH_INTERVAL);
  
  console.log('✅ The Capital is live');
}

/**
 * Load system statistics (header pills)
 */
async function loadSystemStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    if (!response.ok) {
      // Fallback to mock data
      updateSystemStats({
        totalCitizens: 0,
        totalSentinels: 100,
        systemHealth: 98
      });
      return;
    }
    
    const data = await response.json();
    updateSystemStats(data);
  } catch (error) {
    console.error('Failed to load system stats:', error);
    // Use mock data
    updateSystemStats({
      totalCitizens: 0,
      totalSentinels: 100,
      systemHealth: 98
    });
  }
}

/**
 * Update system statistics in UI
 */
function updateSystemStats(stats) {
  document.getElementById('totalCitizens').textContent = stats.totalCitizens;
  document.getElementById('totalSentinels').textContent = stats.totalSentinels;
  document.getElementById('systemHealth').textContent = stats.systemHealth + '%';
}

/**
 * Load Herald welcome feed
 */
async function loadHeraldFeed() {
  try {
    const response = await fetch(`${API_BASE}/api/herald/feed`);
    if (!response.ok) {
      // Mock feed
      addHeraldMessage('The Capital awaits the first citizen...');
      return;
    }
    
    const messages = await response.json();
    const feedElement = document.getElementById('heraldFeed');
    feedElement.innerHTML = '';
    
    messages.forEach(msg => {
      addHeraldMessage(msg.text, msg.timestamp);
    });
  } catch (error) {
    console.error('Failed to load Herald feed:', error);
    addHeraldMessage('The Capital awaits the first citizen...');
  }
}

/**
 * Add message to Herald feed
 */
function addHeraldMessage(text, timestamp = null) {
  const feedElement = document.getElementById('heraldFeed');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'herald-message';
  
  const time = timestamp ? new Date(timestamp) : new Date();
  const timeStr = time.toLocaleTimeString('en-US', { hour12: false });
  
  messageDiv.innerHTML = `
    <span class="herald-time">${timeStr}</span>
    <span class="herald-text">${text}</span>
  `;
  
  feedElement.insertBefore(messageDiv, feedElement.firstChild);
  
  // Keep only last 50 messages
  while (feedElement.children.length > 50) {
    feedElement.removeChild(feedElement.lastChild);
  }
}

/**
 * Load reputation leaderboard
 */
async function loadLeaderboard() {
  try {
    const response = await fetch(`${API_BASE}/api/leaderboard`);
    if (!response.ok) {
      // Mock leaderboard from Sentinels
      leaderboardData = generateMockLeaderboard();
      renderLeaderboard(leaderboardData);
      return;
    }
    
    leaderboardData = await response.json();
    renderLeaderboard(leaderboardData);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    leaderboardData = generateMockLeaderboard();
    renderLeaderboard(leaderboardData);
  }
}

/**
 * Generate mock leaderboard from Sentinels
 */
function generateMockLeaderboard() {
  const sentinels = [];
  for (let i = 1; i <= 100; i++) {
    const score = Math.floor(1000 - (i * 8) + Math.random() * 50);
    sentinels.push({
      id: `stress_test_user_${i}`,
      displayId: `Sovereign #${String(i).padStart(4, '0')}`,
      reputation_score: score,
      entity_type: 'sentinel',
      role: getSentinelRole(i)
    });
  }
  return sentinels.sort((a, b) => b.reputation_score - a.reputation_score);
}

/**
 * Get Sentinel role based on position
 */
function getSentinelRole(index) {
  if (index <= 20) return 'Market Maker';
  if (index <= 35) return 'Governance Delegate';
  if (index <= 60) return 'Reputation Exemplar';
  if (index <= 80) return 'Autonomous Tester';
  return 'Social Guide';
}

/**
 * Render leaderboard with current filter
 */
function renderLeaderboard(data) {
  const listElement = document.getElementById('leaderboardList');
  listElement.innerHTML = '';
  
  // Filter data
  let filteredData = data;
  if (currentFilter === 'citizens') {
    filteredData = data.filter(item => item.entity_type === 'citizen');
  } else if (currentFilter === 'sentinels') {
    filteredData = data.filter(item => item.entity_type === 'sentinel');
  }
  
  if (filteredData.length === 0) {
    listElement.innerHTML = '<div class="leaderboard-loading">No entities in this category yet.</div>';
    return;
  }
  
  // Render top 100
  filteredData.slice(0, 100).forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = `leaderboard-item ${item.entity_type === 'sentinel' ? 'sentinel' : ''}`;
    
    const percentile = Math.floor(((filteredData.length - index) / filteredData.length) * 100);
    const badge = item.entity_type === 'sentinel' 
      ? `<span style="color: #3b7fc2;">⚙</span> ${item.role || 'Sentinel'}`
      : 'Citizen';
    
    itemDiv.innerHTML = `
      <div class="item-rank">${index + 1}</div>
      <div class="item-identity">
        <div class="item-id">${item.displayId || item.id}</div>
        <div class="item-badge">${badge}</div>
      </div>
      <div class="item-score">${item.reputation_score}</div>
      <div class="item-percentile">${percentile}th</div>
    `;
    
    listElement.appendChild(itemDiv);
  });
}

/**
 * Load AI Observer snapshot
 */
async function loadObserverSnapshot() {
  try {
    const response = await fetch(`${API_BASE}/api/observer/snapshot`);
    if (!response.ok) {
      // Mock observer data
      observerData = {
        gini_coefficient: 0.28,
        transaction_velocity: 42,
        governance_health: 0,
        emergent_patterns: []
      };
      renderObserverSnapshot(observerData);
      return;
    }
    
    observerData = await response.json();
    renderObserverSnapshot(observerData);
  } catch (error) {
    console.error('Failed to load Observer snapshot:', error);
    observerData = {
      gini_coefficient: 0.28,
      transaction_velocity: 42,
      governance_health: 0,
      emergent_patterns: []
    };
    renderObserverSnapshot(observerData);
  }
}

/**
 * Render AI Observer snapshot
 */
function renderObserverSnapshot(data) {
  // Update timestamp
  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  document.getElementById('observerTimestamp').textContent = `Last updated: ${now}`;
  
  // Gini coefficient
  const gini = data.gini_coefficient || 0;
  document.getElementById('giniCoefficient').textContent = gini.toFixed(2);
  document.getElementById('economyStatus').textContent = 
    gini < 0.3 ? 'Healthy Distribution' : 
    gini < 0.5 ? 'Moderate Inequality' : 
    'High Inequality Detected';
  
  // Transaction velocity
  const velocity = data.transaction_velocity || 0;
  document.getElementById('txVelocity').textContent = velocity;
  document.getElementById('velocityStatus').textContent = 
    velocity > 100 ? 'High Activity' :
    velocity > 50 ? 'Moderate Activity' :
    'Baseline Activity';
  
  // Governance health
  const govHealth = data.governance_health || 0;
  document.getElementById('govHealth').textContent = govHealth + '%';
  document.getElementById('govStatus').textContent = 
    govHealth > 0 ? `${govHealth}% Quorum Reached` : 'No Active Proposals';
  
  // Emergent patterns
  const patternCount = data.emergent_patterns?.length || 0;
  document.getElementById('patternCount').textContent = patternCount;
  document.getElementById('patternStatus').textContent = 
    patternCount > 0 ? `${patternCount} Pattern(s) Detected` : 'No Anomalies Detected';
}

/**
 * Initialize pulse visualization (Sentinel activity)
 */
function initializePulseVisualization() {
  const canvas = document.getElementById('pulseCanvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = canvas.offsetWidth;
  canvas.height = 200;
  
  // Draw baseline waveform
  animatePulse(ctx, canvas.width, canvas.height);
}

/**
 * Animate pulse waveform
 */
function animatePulse(ctx, width, height) {
  const centerY = height / 2;
  const amplitude = 30;
  const frequency = 0.02;
  let phase = 0;
  
  function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#2a3441';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw waveform
    ctx.strokeStyle = '#3b7fc2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x++) {
      const y = centerY + Math.sin((x * frequency) + phase) * amplitude;
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Add random spikes (Sentinel activity)
    if (Math.random() > 0.97) {
      const spikeX = Math.random() * width;
      const spikeHeight = Math.random() * 60 + 20;
      
      ctx.strokeStyle = '#d4a952';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(spikeX, centerY);
      ctx.lineTo(spikeX, centerY - spikeHeight);
      ctx.stroke();
    }
    
    phase += 0.05;
    requestAnimationFrame(draw);
  }
  
  draw();
}

/**
 * Refresh dashboard data
 */
async function refreshDashboard() {
  await Promise.all([
    loadSystemStats(),
    loadHeraldFeed(),
    loadLeaderboard(),
    loadObserverSnapshot()
  ]);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Leaderboard filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderLeaderboard(leaderboardData);
    });
  });
  
  // Resource links
  document.getElementById('registerLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Registration flow: To be implemented. Connect wallet and sign challenge.');
  });
  
  document.getElementById('sourceLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://github.com/yourusername/n8.ked', '_blank');
  });
  
  document.getElementById('schemaLink').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('/schema/sovereignty_schema.sql', '_blank');
  });
  
  document.getElementById('extensionLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Browser extension: Load from /browser-extension/ folder in Chrome Developer Mode.');
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Simulate new Herald messages (for testing)
setInterval(() => {
  if (Math.random() > 0.95) {
    const messages = [
      'The Commonwealth Pulse remains stable. Sentinel activity within normal parameters.',
      'AI Observer reports: Economic distribution healthy. Gini coefficient below threshold.',
      'Market Makers executing baseline transactions. System immune system operational.',
      'Governance Delegates standing by. No proposals require quorum.',
      'The Capital stands ready. The law applies equally to all.'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    addHeraldMessage(randomMessage);
  }
}, 10000); // Every 10 seconds
