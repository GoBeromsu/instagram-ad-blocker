/**
 * Instagram Ad & Recommendation Blocker
 * Logger Utility
 */

export class Logger {
  private debugMode: boolean;
  private prefix: string;

  constructor(debugMode: boolean = false, prefix: string = '[IG Blocker]') {
    this.debugMode = debugMode;
    this.prefix = prefix;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  log(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`${this.prefix} ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.warn(`${this.prefix} ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Errors are always logged, but with prefix
    console.error(`${this.prefix} ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.info(`${this.prefix} ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
