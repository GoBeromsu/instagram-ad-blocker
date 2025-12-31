/**
 * Instagram Ad & Recommendation Blocker
 * Background Service Worker
 */

// Track blocked count across tabs
let globalBlockedCount = { ads: 0, recommendations: 0 };

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      enabled: true,
      blockAds: true,
      blockRecommendations: true,
    });

    console.log('[Instagram Blocker] Extension installed');
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'POST_BLOCKED':
      handlePostBlocked(message, sender);
      break;

    case 'GET_GLOBAL_COUNT':
      sendResponse(globalBlockedCount);
      break;
  }

  return true;
});

function handlePostBlocked(message, sender) {
  globalBlockedCount = message.count;

  // Update badge to show blocked count
  const total = globalBlockedCount.ads + globalBlockedCount.recommendations;
  if (total > 0) {
    chrome.action.setBadgeText({
      text: total.toString(),
      tabId: sender.tab?.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#e74c3c',
      tabId: sender.tab?.id,
    });
  }
}

// Reset badge when navigating to non-Instagram pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!tab.url.includes('instagram.com')) {
      chrome.action.setBadgeText({ text: '', tabId });
    }
  }
});
