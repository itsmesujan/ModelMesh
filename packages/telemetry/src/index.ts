import { redactObject } from '@modelmesh/secure-store';

export interface TelemetryEvent {
  id: string;
  requestId: string;
  timestamp: number;
  canonicalModel: string;
  providerId: string;
  providerModelId: string;
  statusCode: number;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  policyMode: string;
  traceRationale?: string;
  isStream: boolean;
  error?: string;
}

export interface TelemetrySummary {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  totalTokens: number;
  estimatedCostUsd: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  requestsByProvider: Record<string, number>;
  requestsByModel: Record<string, number>;
  requestsByStatus: Record<number, number>;
}

export class TelemetryManager {
  private events: TelemetryEvent[] = [];
  private maxInMemoryEvents: number;

  constructor(maxInMemoryEvents: number = 1000) {
    this.maxInMemoryEvents = maxInMemoryEvents;
  }

  public record(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): TelemetryEvent {
    const fullEvent: TelemetryEvent = redactObject({
      ...event,
      id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now()
    });

    this.events.unshift(fullEvent);
    if (this.events.length > this.maxInMemoryEvents) {
      this.events.pop();
    }

    return fullEvent;
  }

  public getEvents(limit: number = 50): TelemetryEvent[] {
    return this.events.slice(0, limit);
  }

  public getSummary(): TelemetrySummary {
    const totalRequests = this.events.length;
    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        totalErrors: 0,
        errorRate: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        p50LatencyMs: 0,
        p95LatencyMs: 0,
        requestsByProvider: {},
        requestsByModel: {},
        requestsByStatus: {}
      };
    }

    let totalErrors = 0;
    let totalTokens = 0;
    let estimatedCostUsd = 0;
    const latencies: number[] = [];
    const requestsByProvider: Record<string, number> = {};
    const requestsByModel: Record<string, number> = {};
    const requestsByStatus: Record<number, number> = {};

    for (const e of this.events) {
      if (e.statusCode >= 400) totalErrors += 1;
      totalTokens += e.totalTokens;
      estimatedCostUsd += e.estimatedCostUsd;
      latencies.push(e.latencyMs);

      requestsByProvider[e.providerId] = (requestsByProvider[e.providerId] || 0) + 1;
      requestsByModel[e.canonicalModel] = (requestsByModel[e.canonicalModel] || 0) + 1;
      requestsByStatus[e.statusCode] = (requestsByStatus[e.statusCode] || 0) + 1;
    }

    latencies.sort((a, b) => a - b);
    const p50Index = Math.floor(latencies.length * 0.5);
    const p95Index = Math.floor(latencies.length * 0.95);

    return {
      totalRequests,
      totalErrors,
      errorRate: Math.round((totalErrors / totalRequests) * 1000) / 1000,
      totalTokens,
      estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
      p50LatencyMs: latencies[p50Index] || 0,
      p95LatencyMs: latencies[p95Index] || 0,
      requestsByProvider,
      requestsByModel,
      requestsByStatus
    };
  }
}
