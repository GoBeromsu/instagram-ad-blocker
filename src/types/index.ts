/**
 * Instagram Ad & Recommendation Blocker
 * Type Definitions
 */

export interface BlockedCount {
  ads: number;
  recommendations: number;
}

export interface Settings {
  enabled: boolean;
  blockAds: boolean;
  blockRecommendations: boolean;
}

export type BlockedType = 'ad' | 'recommendation';

// Message types for communication between scripts
export type MessageType =
  | 'GET_STATUS'
  | 'TOGGLE_ENABLED'
  | 'UPDATE_SETTINGS'
  | 'GET_BLOCKED_COUNT'
  | 'POST_BLOCKED'
  | 'GET_GLOBAL_COUNT';

export interface BaseMessage {
  type: MessageType;
}

export interface GetStatusMessage extends BaseMessage {
  type: 'GET_STATUS';
}

export interface ToggleEnabledMessage extends BaseMessage {
  type: 'TOGGLE_ENABLED';
  enabled: boolean;
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: 'UPDATE_SETTINGS';
  blockAds?: boolean;
  blockRecommendations?: boolean;
}

export interface GetBlockedCountMessage extends BaseMessage {
  type: 'GET_BLOCKED_COUNT';
}

export interface PostBlockedMessage extends BaseMessage {
  type: 'POST_BLOCKED';
  blockedType: BlockedType;
  count: BlockedCount;
}

export interface GetGlobalCountMessage extends BaseMessage {
  type: 'GET_GLOBAL_COUNT';
}

export type Message =
  | GetStatusMessage
  | ToggleEnabledMessage
  | UpdateSettingsMessage
  | GetBlockedCountMessage
  | PostBlockedMessage
  | GetGlobalCountMessage;

export interface StatusResponse {
  enabled: boolean;
  blockedCount: BlockedCount;
}

export interface SuccessResponse {
  success: boolean;
}

/**
 * Detector interface - Contract for ad/recommendation detectors
 */
export interface Detector {
  /**
   * Detect if article matches this detector's criteria
   * @param article - The article element to check
   * @returns true if detected
   */
  detect(article: Element): boolean;

  /**
   * The type of content this detector identifies
   */
  readonly type: BlockedType;
}
