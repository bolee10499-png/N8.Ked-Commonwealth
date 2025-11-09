/**
 * N8.KED Browser Extension - Background Service Worker
 * Minimal background tasks for sovereign identity sync
 */

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('N8.KED - The Naked Authority installed');
  
  // Set default storage values
  chrome.storage.local.set({
    sovereignKey: null,
    userId: null,
    lastSync: null
  });
});

// Periodic sync (optional - can poll for reputation updates)
chrome.alarms.create('syncReputation', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'syncReputation') {
    const stored = await chrome.storage.local.get(['userId']);
    
    if (stored.userId) {
      try {
        const response = await fetch(`http://localhost:3000/api/sovereign/${stored.userId}`);
        const data = await response.json();
        
        // Cache latest data
        await chrome.storage.local.set({
          cachedData: data,
          lastSync: Date.now()
        });
        
        console.log('Reputation synced:', data.reputation_score);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
});

// Message handler for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSovereignKey') {
    chrome.storage.local.set({
      sovereignKey: request.key,
      userId: request.userId
    });
    sendResponse({ success: true });
  }
  
  return true;
});
