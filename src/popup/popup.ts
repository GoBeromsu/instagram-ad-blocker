/**
 * Instagram Ad & Recommendation Blocker
 * Popup Script (iOS Style Redesign)
 */

import type { Settings, StatusResponse } from '@/types';

// Feature IDs matching the HTML toggle IDs (toggle-ID)
const TOGGLE_IDS: (keyof Settings)[] = ['blockAds', 'blockRecommendations', 'debugMode'];

class PopupManager {
  private settings: Settings = {
    enabled: true,
    blockAds: true,
    blockRecommendations: true,
    debugMode: false
  };

  private historyStack: string[] = ['page-home'];

  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.initNavigation();
    this.render();
    this.updateStats(); // Initial check
  }

  /* --------------------------
     Settings & State
     -------------------------- */
  async loadSettings() {
    this.settings = (await chrome.storage.sync.get({
      enabled: true,
      blockAds: true,
      blockRecommendations: true,
      debugMode: false,
    })) as Settings;
  }

  async updateSetting(key: string, value: boolean) {
    if (key === 'enabled') {
      this.settings.enabled = value;
    } else if (TOGGLE_IDS.includes(key as keyof Settings)) {
      (this.settings as any)[key] = value;
    }

    await chrome.storage.sync.set(this.settings);
    await this.notifyContentScript();
    this.render(); // Update UI state if needed
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url?.includes('instagram.com') && tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_SETTINGS',
          ...this.settings,
        });

        // Maintain compatibility with existing messages if needed
        if (this.settings.enabled !== undefined) {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_ENABLED',
            enabled: this.settings.enabled,
          });
        }
      }
    } catch {
      // Content script might not be loaded or active
    }
  }

  /* --------------------------
     Navigation (iOS Style)
     -------------------------- */
  initNavigation() {
    // Navigate forward buttons
    const navButtons = [
      { btnId: 'btn-feed-settings', pageId: 'page-feed' },
      { btnId: 'btn-dev-utils', pageId: 'page-dev' }
    ];

    navButtons.forEach(({ btnId, pageId }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => this.pushView(pageId));
      }
    });

    // Back buttons
    document.querySelectorAll('.nav-back-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.popView();
      });
    });

    // Contact button
    const contactBtn = document.getElementById('btn-contact');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        window.open('mailto:gobeumsu@gmail.com');
      });
    }
  }

  pushView(pageId: string) {
    const nextPage = document.getElementById(pageId);
    
    // Add logic to animate
    if (nextPage) {
      nextPage.classList.add('active');
      this.historyStack.push(pageId);
    }
  }

  popView() {
    if (this.historyStack.length <= 1) return; // Can't pop home

    const currentPageId = this.historyStack.pop();
    const currentPage = document.getElementById(currentPageId!);
    
    if (currentPage) {
        currentPage.classList.remove('active');
    }
  }

  /* --------------------------
     UI Rendering
     -------------------------- */
  render() {
    // 1. Master Toggle
    const masterToggle = document.getElementById('masterToggle') as HTMLInputElement;
    const masterStatusText = document.getElementById('masterStatusText');
    if (masterToggle) {
        // Prevent infinite loops by checking status
        if (masterToggle.checked !== this.settings.enabled) {
            masterToggle.checked = this.settings.enabled;
        }
        
        // Listeners usually added once, but safe here if we ensure idempotency or just add in init.
        // Better to add listener in init and just update DOM here.
        masterStatusText!.textContent = this.settings.enabled ? 'Active' : 'Inactive';
        document.body.style.opacity = this.settings.enabled ? '1' : '0.8';
    }

    // 2. Feature Toggles
    TOGGLE_IDS.forEach((id) => {
        const toggle = document.getElementById(`toggle-${id}`) as HTMLInputElement;
        if (toggle) {
            toggle.disabled = !this.settings.enabled;
            if (toggle.checked !== !!this.settings[id]) {
                toggle.checked = !!this.settings[id];
            }
        }
    });
  }

  async updateStats() {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.url?.includes('instagram.com') && tab.id) {
          const response = (await chrome.tabs.sendMessage(tab.id, {
            type: 'GET_STATUS',
          })) as StatusResponse;
    
          const total = response.blockedCount.ads + response.blockedCount.recommendations;
          const blockedCountEl = document.getElementById('blockedCount');
          const statsCard = document.getElementById('statsCard');

          if (total > 0 && blockedCountEl && statsCard) {
            blockedCountEl.textContent = total.toString();
            statsCard.classList.remove('stats-hidden');
          }
        }
      } catch {
        // Content script might not be ready
      }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    const app = new PopupManager();

    // Attach listeners once here to avoid re-binding in render
    const masterToggle = document.getElementById('masterToggle') as HTMLInputElement;
    masterToggle.addEventListener('change', (e) => {
        app.updateSetting('enabled', (e.target as HTMLInputElement).checked);
    });

    TOGGLE_IDS.forEach(id => {
        const toggle = document.getElementById(`toggle-${id}`) as HTMLInputElement;
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                app.updateSetting(id, (e.target as HTMLInputElement).checked);
            });
        }
    });
});
