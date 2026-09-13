export type QuotaClass = 
  | 'recurring-free'
  | 'daily-free'
  | 'rate-limited-free'
  | 'signup-credit'
  | 'promotional'
  | 'paid'
  | 'unknown';

export interface RateLimitStatus {
  limitRequests?: number;
  remainingRequests?: number;
  resetRequestsSeconds?: number;
  limitTokens?: number;
  remainingTokens?: number;
  resetTokensSeconds?: number;
  retryAfterSeconds?: number;
  lastUpdated: number;
}

export interface QuotaEntry {
  connectionId: string;
  providerId: string;
  quotaClass: QuotaClass;
  rateLimit: RateLimitStatus;
  activeConcurrency: number;
  maxConcurrency: number;
  totalTokensUsed: number;
}

export class QuotaEngine {
  private quotas: Map<string, QuotaEntry> = new Map();

  /**
   * Initializes or gets quota entry for a connection.
   */
  public getOrCreate(connectionId: string, providerId: string, quotaClass: QuotaClass = 'unknown'): QuotaEntry {
    let entry = this.quotas.get(connectionId);
    if (!entry) {
      entry = {
        connectionId,
        providerId,
        quotaClass,
        rateLimit: {
          lastUpdated: Date.now()
        },
        activeConcurrency: 0,
        maxConcurrency: quotaClass === 'rate-limited-free' ? 2 : 10,
        totalTokensUsed: 0
      };
      this.quotas.set(connectionId, entry);
    }
    return entry;
  }

  /**
   * Parses rate-limit headers from HTTP responses.
   */
  public updateFromHeaders(connectionId: string, headers: Headers | Record<string, string | string[] | undefined>): void {
    const entry = this.quotas.get(connectionId);
    if (!entry) return;

    const getHeader = (key: string): string | undefined => {
      if (typeof (headers as any).get === 'function') {
        return (headers as any).get(key) || (headers as any).get(key.toLowerCase()) || undefined;
      }
      const map = headers as Record<string, any>;
      return map[key] || map[key.toLowerCase()];
    };

    const parseNum = (val?: string): number | undefined => {
      if (!val) return undefined;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? undefined : parsed;
    };

    const remainingReq = parseNum(
      getHeader('x-ratelimit-remaining-requests') || 
      getHeader('ratelimit-remaining') ||
      getHeader('x-ratelimit-remaining')
    );

    const limitReq = parseNum(
      getHeader('x-ratelimit-limit-requests') || 
      getHeader('ratelimit-limit') ||
      getHeader('x-ratelimit-limit')
    );

    const remainingTokens = parseNum(getHeader('x-ratelimit-remaining-tokens'));
    const limitTokens = parseNum(getHeader('x-ratelimit-limit-tokens'));
    const retryAfter = parseNum(getHeader('retry-after'));

    if (remainingReq !== undefined) entry.rateLimit.remainingRequests = remainingReq;
    if (limitReq !== undefined) entry.rateLimit.limitRequests = limitReq;
    if (remainingTokens !== undefined) entry.rateLimit.remainingTokens = remainingTokens;
    if (limitTokens !== undefined) entry.rateLimit.limitTokens = limitTokens;
    if (retryAfter !== undefined) entry.rateLimit.retryAfterSeconds = retryAfter;

    entry.rateLimit.lastUpdated = Date.now();
  }

  public trackRequestStart(connectionId: string): void {
    const entry = this.quotas.get(connectionId);
    if (entry) {
      entry.activeConcurrency += 1;
    }
  }

  public trackRequestEnd(connectionId: string, tokensUsed: number = 0): void {
    const entry = this.quotas.get(connectionId);
    if (entry) {
      entry.activeConcurrency = Math.max(0, entry.activeConcurrency - 1);
      entry.totalTokensUsed += tokensUsed;
    }
  }

  /**
   * Calculates quota headroom score between 0.0 and 1.0.
   */
  public calculateHeadroomScore(connectionId: string): number {
    const entry = this.quotas.get(connectionId);
    if (!entry) return 0.5; // Neutral default

    // If currently throttled via retry-after
    if (entry.rateLimit.retryAfterSeconds && entry.rateLimit.retryAfterSeconds > 0) {
      const elapsed = (Date.now() - entry.rateLimit.lastUpdated) / 1000;
      if (elapsed < entry.rateLimit.retryAfterSeconds) {
        return 0.0; // Throttled
      }
    }

    // Check concurrency pressure
    const concurrencyRatio = entry.activeConcurrency / entry.maxConcurrency;
    if (concurrencyRatio >= 1.0) {
      return 0.1; // Saturated
    }

    let requestScore = 1.0;
    if (entry.rateLimit.limitRequests && entry.rateLimit.remainingRequests !== undefined) {
      requestScore = Math.max(0, entry.rateLimit.remainingRequests / entry.rateLimit.limitRequests);
    }

    let tokenScore = 1.0;
    if (entry.rateLimit.limitTokens && entry.rateLimit.remainingTokens !== undefined) {
      tokenScore = Math.max(0, entry.rateLimit.remainingTokens / entry.rateLimit.limitTokens);
    }

    const headroom = Math.min(requestScore, tokenScore) * (1 - concurrencyRatio * 0.5);
    return Math.max(0, Math.min(1, headroom));
  }

  public getAll(): QuotaEntry[] {
    return Array.from(this.quotas.values());
  }
}
