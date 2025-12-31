/**
 * Instagram Ad & Recommendation Blocker
 * Popup Script
 */

import type { Settings } from '@/types';

interface FeatureDef {
  id: keyof Settings;
  label: string;
  description: string;
}

// Configuration: easy to add new features here
// 'enabled' is handled separately as the master switch
const FEATURES: FeatureDef[] = [
  {
    id: 'blockAds',
    label: 'Block Ads',
    description: 'Hide sponsored posts in feed',
  },
  {
    id: 'blockRecommendations',
    label: 'Block Recommendations',
    description: 'Hide suggested posts and reels',
  },
  {
    id: 'debugMode',
    label: 'Debug Mode',
    description: 'Show detailed logs in console',
  },
];

async function init(): Promise<void> {
  const enableToggle = document.getElementById('enableToggle') as HTMLInputElement;
  const featuresList = document.getElementById('featuresList') as HTMLDivElement;
  const refreshLink = document.getElementById('refreshLink') as HTMLAnchorElement;

  // Load current settings
  const settings = (await chrome.storage.sync.get({
    enabled: true,
    blockAds: true,
    blockRecommendations: true,
    debugMode: false,
  })) as Settings;

  // Initialize Master Toggle
  enableToggle.checked = settings.enabled;
  updateDisabledState(settings.enabled);

  enableToggle.addEventListener('change', async () => {
    const enabled = enableToggle.checked;
    await updateSettings({ enabled });
    updateDisabledState(enabled);
  });

  // Render Features dynamically
  FEATURES.forEach((feature) => {
    const item = document.createElement('label');
    item.className = 'feature-item';

    // Checkbox input (hidden but functional)
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'feature-checkbox';
    checkbox.style.display = 'none'; // Controlled by the switch UI
    checkbox.checked = !!settings[feature.id];

    // UI Structure
    const infoDiv = document.createElement('div');
    infoDiv.className = 'feature-info';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'feature-label';
    labelSpan.textContent = feature.label;

    const descSpan = document.createElement('span');
    descSpan.className = 'feature-desc';
    descSpan.textContent = feature.description;

    infoDiv.appendChild(labelSpan);
    infoDiv.appendChild(descSpan);

    // Switch UI
    const switchDiv = document.createElement('div');
    switchDiv.className = 'switch';
    const slider = document.createElement('span');
    slider.className = 'slider round';
    // We need a visual checkbox for the switch CSS to work or reuse the structure
    // Since we are generating the structure:
    /*
        <label class="feature-item">
            <div class="feature-info">...</div>
            <div class="switch">
                <input type="checkbox">
                <span class="slider round"></span>
            </div>
        </label>
     */
    // Let's restructure properly
    // The event listener should be on the input
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!settings[feature.id];
    input.addEventListener('change', async () => {
      await updateSettings({ [feature.id]: input.checked });
    });

    switchDiv.appendChild(input);
    switchDiv.appendChild(slider);

    item.appendChild(infoDiv);
    item.appendChild(switchDiv);

    featuresList.appendChild(item);
  });

  // Refresh link
  refreshLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.reload();
  });
}

async function updateSettings(settings: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(settings);

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.url?.includes('instagram.com') && tab.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_SETTINGS',
        ...settings,
      });
      // Also send toggle enabled if that's what changed, content script handles both usually via UPDATE_SETTINGS or TOGGLE_ENABLED
      // The original code had TOGGLE_ENABLED separate, checking if we need to maintain that compatibility
      if (settings.enabled !== undefined) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_ENABLED',
          enabled: settings.enabled,
        });
      }
    }
  } catch {
    // console.log('Could not update content script settings');
  }
}

function updateDisabledState(enabled: boolean): void {
  document.body.classList.toggle('disabled', !enabled);
}

document.addEventListener('DOMContentLoaded', init);
