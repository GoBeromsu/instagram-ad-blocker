/**
 * Detectors Module Entry Point
 * Exports detector classes and keyword constants
 */

export { AdDetector } from './ad-detector';
export { SuggestionDetector } from './suggestion-detector';

/**
 * Keywords to detect sponsored content (multi-language)
 */
export const SPONSORED_KEYWORDS = [
  'Sponsored',
  '광고', // Korean
  'Publicidad', // Spanish
  'Gesponsert', // German
  'Sponsorisé', // French
  'Patrocinado', // Portuguese
  '広告', // Japanese
  '贊助', // Chinese Traditional
  '赞助', // Chinese Simplified
] as const;

/**
 * Keywords to detect Follow button (multi-language)
 * Primary detection method for suggested posts
 */
export const FOLLOW_BUTTON_KEYWORDS = [
  'Follow',
  '팔로우', // Korean
  'Seguir', // Spanish/Portuguese
  'Folgen', // German
  'Suivre', // French
  'フォローする', // Japanese
  '追蹤', // Chinese Traditional
  '关注', // Chinese Simplified
  'Segui', // Italian
] as const;

/**
 * Keywords to detect suggested/recommended text (multi-language)
 * Fallback detection method for suggested posts
 */
export const SUGGESTED_TEXT_KEYWORDS = [
  'Suggested for you',
  'Recommended for you',
  '회원님을 위한 추천', // Korean
  'Sugerido para ti', // Spanish
  'Empfohlen für dich', // German
  'Suggéré pour vous', // French
] as const;
