/**
 * Instagram Ad & Recommendation Blocker
 * Popup Script
 */

import type { Settings, StatusResponse } from "@/types";

async function init(): Promise<void> {
  const enableToggle = document.getElementById(
    "enableToggle"
  ) as HTMLInputElement;
  const blockAdsCheckbox = document.getElementById(
    "blockAds"
  ) as HTMLInputElement;
  const blockRecommendationsCheckbox = document.getElementById(
    "blockRecommendations"
  ) as HTMLInputElement;
  const adsBlockedEl = document.getElementById("adsBlocked") as HTMLSpanElement;
  const recsBlockedEl = document.getElementById(
    "recsBlocked"
  ) as HTMLSpanElement;

  // Load current settings
  const settings = (await chrome.storage.sync.get({
    enabled: true,
    blockAds: true,
    blockRecommendations: true,
  })) as Settings;

  enableToggle.checked = settings.enabled;
  blockAdsCheckbox.checked = settings.blockAds;
  blockRecommendationsCheckbox.checked = settings.blockRecommendations;

  updateDisabledState(settings.enabled);

  // Get current blocked count from active tab
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url?.includes("instagram.com") && tab.id) {
      const response = (await chrome.tabs.sendMessage(tab.id, {
        type: "GET_STATUS",
      })) as StatusResponse;
      if (response) {
        adsBlockedEl.textContent = String(response.blockedCount?.ads || 0);
        recsBlockedEl.textContent = String(
          response.blockedCount?.recommendations || 0
        );
      }
    }
  } catch {
    // Content script might not be loaded yet
    console.log("Could not get status from content script");
  }

  // Toggle extension enabled/disabled
  enableToggle.addEventListener("change", async () => {
    const enabled = enableToggle.checked;
    await chrome.storage.sync.set({ enabled });
    updateDisabledState(enabled);

    // Notify content script
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.url?.includes("instagram.com") && tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "TOGGLE_ENABLED",
          enabled,
        });
      }
    } catch {
      console.log("Could not toggle content script");
    }
  });

  // Update block ads setting
  blockAdsCheckbox.addEventListener("change", async () => {
    const blockAds = blockAdsCheckbox.checked;
    await updateSettings({ blockAds });
  });

  // Update block recommendations setting
  blockRecommendationsCheckbox.addEventListener("change", async () => {
    const blockRecommendations = blockRecommendationsCheckbox.checked;
    await updateSettings({ blockRecommendations });
  });
}

async function updateSettings(settings: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(settings);

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url?.includes("instagram.com") && tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: "UPDATE_SETTINGS",
        ...settings,
      });
    }
  } catch {
    console.log("Could not update content script settings");
  }
}

function updateDisabledState(enabled: boolean): void {
  document.body.classList.toggle("disabled", !enabled);
}

document.addEventListener("DOMContentLoaded", init);
