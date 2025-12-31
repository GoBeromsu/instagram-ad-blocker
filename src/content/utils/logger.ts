/**
 * Logger Utility
 * Only outputs logs when debugMode is enabled
 */

const PREFIX = '[Instagram Blocker]';

class Logger {
  private debugMode = false;

  /**
   * Initialize logger with current debug mode setting
   */
  async init(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get({ debugMode: false });
      this.debugMode = result.debugMode;
    } catch {
      this.debugMode = false;
    }
  }

  /**
   * Update debug mode setting
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Log message (only when debugMode is enabled)
   */
  log(...args: unknown[]): void {
    if (this.debugMode) {
      console.log(PREFIX, ...args);
    }
  }

  /**
   * Log info message (alias for log)
   */
  info(...args: unknown[]): void {
    this.log(...args);
  }

  /**
   * Log warning (only when debugMode is enabled)
   */
  warn(...args: unknown[]): void {
    if (this.debugMode) {
      console.warn(PREFIX, ...args);
    }
  }

  /**
   * Log error (always shown - errors are important)
   */
  error(...args: unknown[]): void {
    console.error(PREFIX, ...args);
  }
}

export const logger = new Logger();
