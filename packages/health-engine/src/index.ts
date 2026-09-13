export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface ProviderHealthProfile {
  connectionId: string;
  providerId: string;
  circuitState: CircuitState;
  consecutiveFailures: number;
  failureThreshold: number;
  cooldownPeriodMs: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  recentLatencies: number[];
  totalRequests: number;
  totalFailures: number;
  healthScore: number;
}

export type ErrorClassification = 
  | 'AUTH_FAILED'        // 401, 403
  | 'RATE_LIMITED'       // 429
  | 'UPSTREAM_ERROR'     // 500, 502, 503, 504
  | 'TIMEOUT'            // Network timeout
  | 'CLIENT_ERROR'       // 400, 422
  | 'UNKNOWN';

export class HealthEngine {
  private profiles: Map<string, ProviderHealthProfile> = new Map();

  public getOrCreateProfile(connectionId: string, providerId: string): ProviderHealthProfile {
    let profile = this.profiles.get(connectionId);
    if (!profile) {
      profile = {
        connectionId,
        providerId,
        circuitState: 'CLOSED',
        consecutiveFailures: 0,
        failureThreshold: 3,
        cooldownPeriodMs: 30_000, // 30s cooldown
        p50LatencyMs: 250,
        p95LatencyMs: 600,
        recentLatencies: [],
        totalRequests: 0,
        totalFailures: 0,
        healthScore: 1.0
      };
      this.profiles.set(connectionId, profile);
    }
    return profile;
  }

  public classifyError(statusCode?: number, errorMessage?: string): ErrorClassification {
    if (!statusCode && errorMessage?.toLowerCase().includes('timeout')) {
      return 'TIMEOUT';
    }
    if (statusCode === 401 || statusCode === 403) return 'AUTH_FAILED';
    if (statusCode === 429) return 'RATE_LIMITED';
    if (statusCode && statusCode >= 500 && statusCode < 600) return 'UPSTREAM_ERROR';
    if (statusCode && statusCode >= 400 && statusCode < 500) return 'CLIENT_ERROR';
    return 'UNKNOWN';
  }

  public recordSuccess(connectionId: string, latencyMs: number): void {
    const profile = this.profiles.get(connectionId);
    if (!profile) return;

    profile.totalRequests += 1;
    profile.lastSuccessTime = Date.now();
    profile.consecutiveFailures = 0;

    if (profile.circuitState === 'HALF_OPEN') {
      profile.circuitState = 'CLOSED';
    }

    // Update latencies
    profile.recentLatencies.push(latencyMs);
    if (profile.recentLatencies.length > 50) {
      profile.recentLatencies.shift();
    }

    // EMA calculation
    const alpha = 0.2;
    profile.p50LatencyMs = Math.round(profile.p50LatencyMs * (1 - alpha) + latencyMs * alpha);
    profile.p95LatencyMs = Math.round(Math.max(profile.p95LatencyMs * 0.95, latencyMs));

    this.recalculateHealthScore(profile);
  }

  public recordFailure(connectionId: string, statusCode?: number, errorMsg?: string): ErrorClassification {
    const profile = this.profiles.get(connectionId);
    const classification = this.classifyError(statusCode, errorMsg);
    if (!profile) return classification;

    profile.totalRequests += 1;
    profile.lastFailureTime = Date.now();

    // Client errors (400) do not penalize upstream circuit breaker
    if (classification !== 'CLIENT_ERROR') {
      profile.totalFailures += 1;
      profile.consecutiveFailures += 1;

      if (profile.consecutiveFailures >= profile.failureThreshold) {
        profile.circuitState = 'OPEN';
      }
    }

    this.recalculateHealthScore(profile);
    return classification;
  }

  public canAcceptRequests(connectionId: string): boolean {
    const profile = this.profiles.get(connectionId);
    if (!profile) return true;

    if (profile.circuitState === 'OPEN') {
      const elapsed = Date.now() - (profile.lastFailureTime || 0);
      if (elapsed >= profile.cooldownPeriodMs) {
        profile.circuitState = 'HALF_OPEN';
        return true; // Probe request allowed
      }
      return false; // Circuit remains open
    }

    return true;
  }

  private recalculateHealthScore(profile: ProviderHealthProfile): void {
    if (profile.circuitState === 'OPEN') {
      profile.healthScore = 0.0;
      return;
    }

    const successRatio = profile.totalRequests === 0 
      ? 1.0 
      : Math.max(0, (profile.totalRequests - profile.totalFailures) / profile.totalRequests);
      
    let stateWeight = 1.0;
    if (profile.circuitState === 'HALF_OPEN') stateWeight = 0.5;
    else if (profile.consecutiveFailures > 0) stateWeight = Math.max(0.2, 1 - profile.consecutiveFailures * 0.25);

    profile.healthScore = Math.round((successRatio * 0.7 + stateWeight * 0.3) * 100) / 100;
  }

  public getAllProfiles(): ProviderHealthProfile[] {
    return Array.from(this.profiles.values());
  }
}
