/**
 * Ad Detector
 * Detects sponsored/ad posts in Instagram feed
 */

import type { BlockedType, Detector } from '@/types';
import { findTextInElement } from '../utils/dom-utils';
import { SPONSORED_KEYWORDS } from './index';

export class AdDetector implements Detector {
  readonly type: BlockedType = 'ad';

  /**
   * Check if article is a sponsored post
   * Only searches in the header area (first child) where "Sponsored" label appears
   */
  detect(article: Element): boolean {
    const header = article.firstElementChild;
    if (!header) return false;

    const matchedText = findTextInElement(header, SPONSORED_KEYWORDS);

    if (matchedText) {
      console.log('[Instagram Blocker] Sponsored:', matchedText);
      return true;
    }

    return false;
  }
}
