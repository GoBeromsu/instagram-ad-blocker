/**
 * Instagram Ad & Recommendation Blocker
 * Content Script - Detects and hides sponsored/recommended posts
 */

class InstagramBlocker {
  constructor() {
    this.enabled = true;
    this.blockedCount = { ads: 0, recommendations: 0 };
    this.processedPosts = new WeakSet();

    // Selectors for Instagram feed posts
    this.selectors = {
      // Main feed article container
      feedPost: 'article',
      // Common parent containers for posts
      postContainer: 'div[style*="padding-bottom"]',
    };

    // Keywords to detect sponsored content (multi-language)
    this.sponsoredKeywords = [
      'Sponsored',
      '광고',        // Korean
      'Publicidad',  // Spanish
      'Gesponsert',  // German
      'Sponsorisé',  // French
      'Patrocinado', // Portuguese
      '広告',        // Japanese
      '贊助',        // Chinese Traditional
      '赞助',        // Chinese Simplified
    ];

    // Keywords to detect recommended content
    this.recommendedKeywords = [
      'Suggested for you',
      'Recommended for you',
      '추천',         // Korean (recommended)
      '회원님을 위한 추천', // Korean (suggested for you)
      'Sugerido para ti',
      'Empfohlen für dich',
      'Suggéré pour vous',
    ];

    this.init();
  }

  async init() {
    // Load settings from storage
    await this.loadSettings();

    // Initial scan
    this.scanAndBlock();

    // Set up MutationObserver for dynamic content
    this.observeDOM();

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep channel open for async response
    });

    console.log('[Instagram Blocker] Initialized');
  }

  async loadSettings() {
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

  handleMessage(message, sendResponse) {
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

  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      if (!this.enabled) return;

      // Debounce to avoid excessive processing
      clearTimeout(this.scanTimeout);
      this.scanTimeout = setTimeout(() => {
        this.scanAndBlock();
      }, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  scanAndBlock() {
    if (!this.enabled) return;

    // Find all article elements (Instagram posts)
    const articles = document.querySelectorAll('article');

    articles.forEach((article) => {
      if (this.processedPosts.has(article)) return;

      this.processPost(article);
      this.processedPosts.add(article);
    });
  }

  processPost(article) {
    const textContent = article.textContent || '';
    const innerHTML = article.innerHTML || '';

    // Check for sponsored content
    if (this.blockAds && this.isSponsored(article, textContent)) {
      this.hidePost(article, 'ad');
      return;
    }

    // Check for recommended content
    if (this.blockRecommendations && this.isRecommended(article, textContent)) {
      this.hidePost(article, 'recommendation');
      return;
    }
  }

  isSponsored(article, textContent) {
    // Method 1: Check for "Sponsored" text in specific locations
    // Instagram often puts "Sponsored" in a span near the username
    const sponsoredElements = article.querySelectorAll('span, a');

    for (const element of sponsoredElements) {
      const text = element.textContent?.trim();
      if (text && this.sponsoredKeywords.includes(text)) {
        return true;
      }
    }

    // Method 2: Check aria-labels for "Sponsored"
    const elementsWithAria = article.querySelectorAll('[aria-label]');
    for (const element of elementsWithAria) {
      const ariaLabel = element.getAttribute('aria-label') || '';
      if (this.sponsoredKeywords.some(keyword =>
        ariaLabel.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return true;
      }
    }

    // Method 3: Look for specific data attributes or class patterns
    // Instagram may use obfuscated classes, so we check multiple patterns
    const allSpans = article.querySelectorAll('span');
    for (const span of allSpans) {
      // Check if span contains only "Sponsored" text
      if (span.children.length === 0) {
        const trimmedText = span.textContent?.trim();
        if (trimmedText && this.sponsoredKeywords.includes(trimmedText)) {
          return true;
        }
      }
    }

    return false;
  }

  isRecommended(article, textContent) {
    // Check parent containers for "Suggested for you" sections
    let parent = article.parentElement;
    let depth = 0;
    const maxDepth = 5;

    while (parent && depth < maxDepth) {
      const parentText = parent.textContent || '';

      for (const keyword of this.recommendedKeywords) {
        // Check if the recommendation text appears near the article
        if (parentText.includes(keyword)) {
          // Verify it's actually labeling this post, not just nearby
          const siblingText = this.getSiblingText(article, parent);
          if (siblingText.includes(keyword)) {
            return true;
          }
        }
      }

      parent = parent.parentElement;
      depth++;
    }

    // Also check within the article for recommendation indicators
    const headerArea = article.querySelector('header');
    if (headerArea) {
      const headerText = headerArea.textContent || '';
      for (const keyword of this.recommendedKeywords) {
        if (headerText.includes(keyword)) {
          return true;
        }
      }
    }

    return false;
  }

  getSiblingText(article, container) {
    let text = '';
    const children = container.children;

    for (const child of children) {
      if (child === article || child.contains(article)) {
        break;
      }
      text += child.textContent || '';
    }

    return text;
  }

  hidePost(article, type) {
    // Find the appropriate container to hide
    // We want to hide the entire post container, not just the article
    const container = this.findPostContainer(article);

    if (container) {
      container.classList.add('ig-blocker-hidden');
      container.dataset.blockedType = type;

      // Update count
      if (type === 'ad') {
        this.blockedCount.ads++;
      } else {
        this.blockedCount.recommendations++;
      }

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'POST_BLOCKED',
        blockedType: type,
        count: this.blockedCount,
      }).catch(() => {
        // Ignore errors when background script is not available
      });

      console.log(`[Instagram Blocker] Blocked ${type}:`, container);
    }
  }

  findPostContainer(article) {
    // Try to find the outermost container that represents the entire post
    let current = article;
    let container = article;

    // Walk up the DOM to find a suitable container
    while (current.parentElement) {
      const parent = current.parentElement;

      // Stop at main/section elements
      if (['MAIN', 'SECTION'].includes(parent.tagName)) {
        break;
      }

      // Check if parent has specific layout properties
      const style = window.getComputedStyle(parent);
      if (style.display === 'flex' || style.display === 'grid') {
        // Check if this is a feed item container
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
