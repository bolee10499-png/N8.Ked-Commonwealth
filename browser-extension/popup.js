/**
 * N8.KED Browser Extension - Popup Logic
 * The Banner on the Highway
 * 
 * Philosophy: Minimal, utility-focused. Not an app - a lens.
 * Shows sovereign key, reputation, and path to the capital.
 */

// Configuration
const API_BASE = 'http://localhost:3000'; // Update with actual API endpoint

// DOM Elements
const statusSection = document.getElementById('statusSection');
const identitySection = document.getElementById('identitySection');
const statusMessage = document.getElementById('statusMessage');
const keyText = document.getElementById('keyText');
const copyBtn = document.getElementById('copyBtn');
const scoreValue = document.getElementById('scoreValue');
const percentile = document.getElementById('percentile');
const balance = document.getElementById('balance');
const claims = document.getElementById('claims');
const capitalBtn = document.getElementById('capitalBtn');
const registerLink = document.getElementById('registerLink');

// State
let userData = null;
let fullSovereignKey = null;

/**
 * Initialize extension on popup open
 */
async function initialize() {
  try {
    // Check if user has sovereign key stored
    const stored = await chrome.storage.local.get(['sovereignKey', 'userId']);
    
    if (stored.sovereignKey && stored.userId) {
      fullSovereignKey = stored.sovereignKey;
      await loadUserData(stored.userId);
    } else {
      showRegistrationPrompt();
    }
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to connect to commonwealth');
  }
}

/**
 * Load user data from API
 */
async function loadUserData(userId) {
  try {
    statusMessage.innerHTML = '<p>Fetching sovereign data...</p>';
    
    // Fetch user data from API
    const response = await fetch(`${API_BASE}/api/sovereign/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    userData = await response.json();
    
    // Display user identity
    displayIdentity(userData);
    
  } catch (error) {
    console.error('Load user data error:', error);
    showError('Failed to load sovereign data');
  }
}

/**
 * Display user identity in UI
 */
function displayIdentity(data) {
  // Hide status, show identity
  statusSection.style.display = 'none';
  identitySection.style.display = 'block';
  
  // Sovereign key (truncated)
  if (fullSovereignKey) {
    const truncated = fullSovereignKey.substring(0, 16) + '...' + fullSovereignKey.substring(fullSovereignKey.length - 4);
    keyText.textContent = truncated;
  }
  
  // Reputation score
  scoreValue.textContent = data.reputation_score || 0;
  
  // Calculate percentile (mock - replace with actual API data)
  const percentileValue = calculatePercentile(data.reputation_score || 0);
  percentile.textContent = getOrdinal(percentileValue) + ' percentile';
  
  // Balance
  balance.textContent = (data.frag_balance || 0).toFixed(2) + ' FRAG';
  
  // Claims count
  claims.textContent = data.claims_count || 0;
}

/**
 * Calculate percentile based on score (simplified)
 */
function calculatePercentile(score) {
  // This should come from API - using mock calculation
  if (score >= 900) return 99;
  if (score >= 700) return 90;
  if (score >= 500) return 75;
  if (score >= 300) return 50;
  if (score >= 100) return 25;
  return 10;
}

/**
 * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Show registration prompt
 */
function showRegistrationPrompt() {
  statusSection.style.display = 'block';
  identitySection.style.display = 'none';
  statusMessage.innerHTML = `
    <p><strong>No sovereign key registered.</strong></p>
    <p style="margin-top: 8px; font-size: 12px;">
      Visit the Capital to register your identity and join the commonwealth.
    </p>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  statusSection.style.display = 'block';
  identitySection.style.display = 'none';
  statusMessage.innerHTML = `
    <p style="color: #8b2e2e;"><strong>Error:</strong> ${message}</p>
    <p style="margin-top: 8px; font-size: 12px;">
      Check your connection and try again.
    </p>
  `;
}

/**
 * Copy sovereign key to clipboard
 */
async function copySovereignKey() {
  if (!fullSovereignKey) return;
  
  try {
    await navigator.clipboard.writeText(fullSovereignKey);
    
    // Visual feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓';
    copyBtn.style.background = '#4a7c4e';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 1500);
    
  } catch (error) {
    console.error('Copy failed:', error);
  }
}

/**
 * Open the Capital dashboard
 */
function openCapital() {
  chrome.tabs.create({
    url: 'http://localhost:8080' // Update with actual dashboard URL
  });
}

/**
 * Open registration flow
 */
function openRegistration() {
  chrome.tabs.create({
    url: 'http://localhost:8080/register' // Update with actual registration URL
  });
}

// Event Listeners
copyBtn.addEventListener('click', copySovereignKey);
capitalBtn.addEventListener('click', openCapital);
registerLink.addEventListener('click', (e) => {
  e.preventDefault();
  openRegistration();
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);
