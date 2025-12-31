/**
 * Instagram Ad & Recommendation Blocker
 * Background Service Worker
 */

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      enabled: true,
      blockAds: true,
      blockRecommendations: true,
      debugMode: false,
    });
  }
});
