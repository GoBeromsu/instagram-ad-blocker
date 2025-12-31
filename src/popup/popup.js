/**
 * Instagram Ad & Recommendation Blocker
 * Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const blockAdsCheckbox = document.getElementById('blockAds');
  const blockRecommendationsCheckbox = document.getElementById('blockRecommendations');
  const adsBlockedEl = document.getElementById('adsBlocked');
  const recsBlockedEl = document.getElementById('recsBlocked');

  // Load current settings
  const settings = await chrome.storage.sync.get({
    enabled: true,
    blockAds: true,
    blockRecommendations: true,
  });

  enableToggle.checked = settings.enabled;
  blockAdsCheckbox.checked = settings.blockAds;
  blockRecommendationsCheckbox.checked = settings.blockRecommendations;

  updateDisabledState(settings.enabled);

  // Get current blocked count from active tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.includes('instagram.com')) {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' });
      if (response) {
        adsBlockedEl.textContent = response.blockedCount?.ads || 0;
        recsBlockedEl.textContent = response.blockedCount?.recommendations || 0;
      }
    }
  } catch (error) {
    // Content script might not be loaded yet
    console.log('Could not get status from content script');
  }

  // Toggle extension enabled/disabled
  enableToggle.addEventListener('change', async () => {
    const enabled = enableToggle.checked;
    await chrome.storage.sync.set({ enabled });
    updateDisabledState(enabled);

    // Notify content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url?.includes('instagram.com')) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_ENABLED', enabled });
      }
    } catch (error) {
      console.log('Could not toggle content script');
    }
  });

  // Update block ads setting
  blockAdsCheckbox.addEventListener('change', async () => {
    const blockAds = blockAdsCheckbox.checked;
    await updateSettings({ blockAds });
  });

  // Update block recommendations setting
  blockRecommendationsCheckbox.addEventListener('change', async () => {
    const blockRecommendations = blockRecommendationsCheckbox.checked;
    await updateSettings({ blockRecommendations });
  });

  async function updateSettings(settings) {
    await chrome.storage.sync.set(settings);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url?.includes('instagram.com')) {
        await chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_SETTINGS', ...settings });
      }
    } catch (error) {
      console.log('Could not update content script settings');
    }
  }

  function updateDisabledState(enabled) {
    document.body.classList.toggle('disabled', !enabled);
  }
});
