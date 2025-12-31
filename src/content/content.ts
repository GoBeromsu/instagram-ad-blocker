/**
 * Instagram Ad & Recommendation Blocker
 * Content Script - Detects and hides sponsored/recommended posts
 */

import type {
  BlockedCount,
  BlockedType,
  Message,
  StatusResponse,
  SuccessResponse,
} from '@/types';

class InstagramBlocker {
  private enabled = true;
  private blockAds = true;
  private blockRecommendations = true;
  private blockedCount: BlockedCount = { ads: 0, recommendations: 0 };
  private processedPosts = new WeakSet<Element>();
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  // Keywords to detect sponsored content (multi-language)
  private readonly sponsoredKeywords: readonly string[] = [
    'Sponsored',
    '광고', // Korean
    'Publicidad', // Spanish
    'Gesponsert', // German
    'Sponsorisé', // French
    'Patrocinado', // Portuguese
    '広告', // Japanese
    '贊助', // Chinese Traditional
    '赞助', // Chinese Simplified
  ];

  // Keywords to detect recommended content
  private readonly recommendedKeywords: readonly string[] = [
    'Suggested for you',
    'Recommended for you',
    '추천', // Korean (recommended)
    '회원님을 위한 추천', // Korean (suggested for you)
    'Sugerido para ti',
    'Empfohlen für dich',
    'Suggéré pour vous',
  ];

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.scanAndBlock();
    this.observeDOM();
    this.setupMessageListener();

    console.log('[Instagram Blocker] Initialized');
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        blockAds: true,
        blockRecommendations: true,
      });
      this.enabled = result.enabled;
      this.blockAds = result.blockAds;
      this.blockRecommendations = result.blockRecommendations;
    } catch (error) {
      console.error('[Instagram Blocker] Failed to load settings:', error);
    }
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        message: Message,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: StatusResponse | SuccessResponse | BlockedCount) => void
      ) => {
        this.handleMessage(message, sendResponse);
        return true; // Keep channel open for async response
      }
    );
  }

  private handleMessage(
    message: Message,
    sendResponse: (response: StatusResponse | SuccessResponse | BlockedCount) => void
  ): void {
    switch (message.type) {
      case 'GET_STATUS':
        sendResponse({
          enabled: this.enabled,
          blockedCount: this.blockedCount,
        });
        break;

      case 'TOGGLE_ENABLED':
        this.enabled = message.enabled;
        chrome.storage.sync.set({ enabled: this.enabled });
        if (this.enabled) {
          this.scanAndBlock();
        }
        sendResponse({ success: true });
        break;

      case 'UPDATE_SETTINGS':
        this.blockAds = message.blockAds ?? this.blockAds;
        this.blockRecommendations = message.blockRecommendations ?? this.blockRecommendations;
        chrome.storage.sync.set({
          blockAds: this.blockAds,
          blockRecommendations: this.blockRecommendations,
        });
        this.scanAndBlock();
        sendResponse({ success: true });
        break;

      case 'GET_BLOCKED_COUNT':
        sendResponse(this.blockedCount);
        break;
    }
  }

  private observeDOM(): void {
    const observer = new MutationObserver(() => {
      if (!this.enabled) return;

      // Debounce to avoid excessive processing
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }
      this.scanTimeout = setTimeout(() => {
        this.scanAndBlock();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private scanAndBlock(): void {
    if (!this.enabled) return;

    // Find all article elements (Instagram posts)
    const articles = document.querySelectorAll('article');

    articles.forEach((article) => {
      if (this.processedPosts.has(article)) return;

      this.processPost(article);
      this.processedPosts.add(article);
    });
  }

  private processPost(article: Element): void {
    const textContent = article.textContent || '';

    // Check for sponsored content
    if (this.blockAds && this.isSponsored(article, textContent)) {
      this.hidePost(article, 'ad');
      return;
    }

    // Check for recommended content
    if (this.blockRecommendations && this.isRecommended(article)) {
      this.hidePost(article, 'recommendation');
    }
  }

  private isSponsored(article: Element, _textContent: string): boolean {
    // Method 1: Check for "Sponsored" text in span, div, a elements
    // Instagram uses div elements for "Sponsored" label (seen in DOM analysis)
    const sponsoredElements = article.querySelectorAll('span, div, a');

    for (const element of sponsoredElements) {
      // Only check leaf nodes or elements with minimal children
      if (element.children.length <= 1) {
        const text = element.textContent?.trim();
        if (text && this.sponsoredKeywords.includes(text)) {
          console.log('[Instagram Blocker] Found sponsored text:', text);
          return true;
        }
      }
    }

    // Method 2: Check aria-labels for "Sponsored"
    const elementsWithAria = article.querySelectorAll('[aria-label]');
    for (const element of elementsWithAria) {
      const ariaLabel = element.getAttribute('aria-label') || '';
      if (
        this.sponsoredKeywords.some((keyword) =>
          ariaLabel.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        return true;
      }
    }

    return false;
  }

  private isRecommended(article: Element): boolean {
    // Method 1: Check for "Suggested for you" text directly in the article
    // Instagram puts this label in a div near the username (seen in DOM analysis)
    const textElements = article.querySelectorAll('span, div');

    for (const element of textElements) {
      if (element.children.length <= 1) {
        const text = element.textContent?.trim();
        if (text && this.recommendedKeywords.includes(text)) {
          console.log('[Instagram Blocker] Found recommended text:', text);
          return true;
        }
      }
    }

    // Method 2: Check for "Follow" button combined with header indicators
    // Recommended posts have a Follow button in the header area
    const followButton = article.querySelector('button');
    if (followButton?.textContent?.trim() === 'Follow') {
      // Check if there's a recommendation indicator nearby
      const headerArea = article.querySelector('header') || article.firstElementChild;
      if (headerArea) {
        const headerText = headerArea.textContent || '';
        for (const keyword of this.recommendedKeywords) {
          if (headerText.includes(keyword)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private hidePost(article: Element, type: BlockedType): void {
    const container = this.findPostContainer(article);

    if (container) {
      (container as HTMLElement).classList.add('ig-blocker-hidden');
      (container as HTMLElement).dataset.blockedType = type;

      // Update count
      if (type === 'ad') {
        this.blockedCount.ads++;
      } else {
        this.blockedCount.recommendations++;
      }

      // Notify background script
      chrome.runtime
        .sendMessage({
          type: 'POST_BLOCKED',
          blockedType: type,
          count: this.blockedCount,
        })
        .catch(() => {
          // Ignore errors when background script is not available
        });

      console.log(`[Instagram Blocker] Blocked ${type}:`, container);
    }
  }

  private findPostContainer(article: Element): Element {
    let current: Element = article;
    let container: Element = article;

    while (current.parentElement) {
      const parent = current.parentElement;

      if (['MAIN', 'SECTION'].includes(parent.tagName)) {
        break;
      }

      const style = window.getComputedStyle(parent);
      if (style.display === 'flex' || style.display === 'grid') {
        if (parent.children.length <= 3) {
          container = parent;
        }
      }

      current = parent;
    }

    return container;
  }
}

// Initialize blocker when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new InstagramBlocker();
  });
} else {
  new InstagramBlocker();
}
