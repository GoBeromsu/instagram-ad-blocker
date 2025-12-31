/**
 * Suggestion Detector
 * Detects suggested/recommended posts in Instagram feed
 *
 * Signature: "Follow" text in a clickable element
 * This is user-facing text that's stable (part of product design)
 *
 * Detection Strategy:
 * 1. Primary: "Follow" button detection (stable signature)
 * 2. Fallback: "Suggested for you" text detection
 */

import type { BlockedType, Detector } from '@/types';
import { findClickableWithText, findTextInElement } from '@/utils/dom-utils';
import { logger } from '@/utils/logger';
import { FOLLOW_BUTTON_KEYWORDS, SUGGESTED_TEXT_KEYWORDS } from './index';

export class SuggestionDetector implements Detector {
  readonly type: BlockedType = 'recommendation';

  /**
   * Check if article is a suggested/recommended post
   * Signature: "Follow" text in clickable element
   */
  detect(article: Element): boolean {
    const header = article.firstElementChild;
    if (!header) return false;

    // Primary: "Follow" button - the real signature
    if (this.hasFollowButton(header)) {
      logger.log('Recommended (Follow button)');
      return true;
    }

    // Fallback: "Suggested for you" text
    if (this.hasSuggestedText(header)) {
      return true;
    }

    return false;
  }

  /**
   * Check for Follow button in the header area
   * Searches all clickable elements (button, role="button", tabindex="0")
   */
  private hasFollowButton(header: Element): boolean {
    return findClickableWithText(header, FOLLOW_BUTTON_KEYWORDS) !== null;
  }

  /**
   * Check for "Suggested for you" text in the header area
   * Fallback when Follow button is not found
   */
  private hasSuggestedText(header: Element): boolean {
    const matchedText = findTextInElement(header, SUGGESTED_TEXT_KEYWORDS);

    if (matchedText) {
      logger.log('Recommended (Text):', matchedText);
      return true;
    }

    return false;
  }
}
