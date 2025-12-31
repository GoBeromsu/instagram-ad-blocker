/**
 * Instagram Ad & Recommendation Blocker
 * Content Script - Detects and hides sponsored/recommended posts
 *
 * Strategy:
 * 1. Find the feed container (parent of articles)
 * 2. Observe the feed for new posts being loaded
 * 3. Filter and hide ads/recommendations before they're visible
 */

import './content.css';

import type {
  BlockedCount,
  BlockedType,
  Message,
  StatusResponse,
  SuccessResponse,
} from '@/types';
import { AdDetector, SuggestionDetector } from './detectors';
import { logger } from '@/utils/logger';

class InstagramBlocker {
  private enabled = true;
  private blockAds = true;
  private blockRecommendations = true;
  private blockedCount: BlockedCount = { ads: 0, recommendations: 0 };
  private processedPosts = new WeakSet<Element>();
  private feedObserver: MutationObserver | null = null;
  private feedContainer: Element | null = null;

  // Detector instances
  private readonly adDetector = new AdDetector();
  private readonly suggestionDetector = new SuggestionDetector();

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.setupMessageListener();
    this.findFeedAndObserve();

    logger.info('Initialized');
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        blockAds: true,
        blockRecommendations: true,
        debugMode: false,
      });
      this.enabled = result.enabled;
      this.blockAds = result.blockAds;
      this.blockRecommendations = result.blockRecommendations;
      logger.setDebugMode(result.debugMode);
    } catch (error) {
      logger.error('Failed to load settings:', error);
    }
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener(
      (
        message: Message,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: StatusResponse | SuccessResponse | BlockedCount) => void,
      ) => {
        this.handleMessage(message, sendResponse);
        return true;
      }
    );
  }

  private handleMessage(
    message: Message,
    sendResponse: (response: StatusResponse | SuccessResponse | BlockedCount) => void,
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
          this.scanFeed();
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

        // Handle Debug Mode if passed
        if (message.debugMode !== undefined) {
          logger.setDebugMode(message.debugMode);
        }

        this.scanFeed();
        sendResponse({ success: true });
        break;

      case 'GET_BLOCKED_COUNT':
        sendResponse(this.blockedCount);
        break;
    }
  }

  /**
   * Find the feed container and start observing
   */
  private findFeedAndObserve(): void {
    const findFeed = (): Element | null => {
      // Find main element
      const main = document.querySelector('main');
      if (!main) return null;

      // Find the first article (post)
      const article = main.querySelector('article');
      if (!article) return null;

      // The feed container is the parent of articles
      return article.parentElement;
    };

    // Try to find feed immediately
    this.feedContainer = findFeed();

    if (this.feedContainer) {
      logger.log('Feed found, starting observation');
      this.observeFeed();
      this.scanFeed();
    } else {
      // Wait for feed to load
      logger.log('Waiting for feed to load...');
      const bodyObserver = new MutationObserver(() => {
        const feed = findFeed();
        if (feed) {
          this.feedContainer = feed;
          logger.log('Feed found, starting observation');
          bodyObserver.disconnect();
          this.observeFeed();
          this.scanFeed();
        }
      });

      bodyObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Cleanup after 30 seconds
      setTimeout(() => bodyObserver.disconnect(), 30000);
    }
  }

  /**
   * Observe the feed container for new posts
   */
  private observeFeed(): void {
    if (!this.feedContainer || this.feedObserver) return;

    this.feedObserver = new MutationObserver((mutations) => {
      if (!this.enabled) return;

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            // Process if it's an article
            if (node.tagName === 'ARTICLE') {
              this.processArticle(node);
            }
            // Or check for articles inside
            const articles = node.getElementsByTagName('article');
            for (const article of articles) {
              this.processArticle(article);
            }
          }
        }
      }
    });

    this.feedObserver.observe(this.feedContainer, {
      childList: true,
      subtree: true,
    });

    this.feedObserver.observe(this.feedContainer, {
      childList: true,
      subtree: true,
    });

    logger.log('Feed observer active');
  }

  /**
   * Scan all existing articles in the feed
   */
  private scanFeed(): void {
    if (!this.enabled) return;

    const container = this.feedContainer || document;
    const articles = container.querySelectorAll('article');

    logger.log(`Scanning ${articles.length} articles`);

    articles.forEach((article) => this.processArticle(article));
  }

  /**
   * Process a single article using detectors
   */
  private processArticle(article: Element): void {
    if (this.processedPosts.has(article)) return;
    this.processedPosts.add(article);

    // Check for sponsored content using AdDetector
    if (this.blockAds && this.adDetector.detect(article)) {
      this.hideArticle(article, this.adDetector.type);
      return;
    }

    // Check for recommended content using SuggestionDetector
    // (Follow button primary, text fallback)
    if (this.blockRecommendations && this.suggestionDetector.detect(article)) {
      this.hideArticle(article, this.suggestionDetector.type);
    }
  }

  /**
   * Hide the article element with a collapsed placeholder
   */
  private hideArticle(article: Element, type: BlockedType): void {
    const el = article as HTMLElement;

    // Set data attributes
    el.dataset.blockedBy = 'ig-blocker';
    el.dataset.blockedType = type;

    // Apply inline styles for collapsed placeholder
    // Apply inline styles for collapsed placeholder
    // Minimal Google-style placeholder
    const label = type === 'ad' ? 'Ad hidden' : 'Post hidden';

    // Create placeholder element
    const placeholder = document.createElement('div');
    placeholder.className = 'ig-blocker-placeholder';
    placeholder.style.cssText = `
      height: 32px !important;
      background-color: #f1f3f4 !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #5f6368 !important;
      font-size: 12px !important;
      font-family: Roboto, Arial, sans-serif !important;
      margin: 8px 0 !important;
      cursor: default !important;
    `;
    placeholder.textContent = label;

    // Store original children
    const children = Array.from(el.children);

    // Hide all original children first
    children.forEach((child) => {
      (child as HTMLElement).style.display = 'none';
    });

    // Then insert placeholder at the beginning
    el.insertBefore(placeholder, el.firstChild);

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
      .catch(() => {});

    logger.log(`Blocked ${type}`);
  }
}

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new InstagramBlocker());
} else {
  new InstagramBlocker();
}
