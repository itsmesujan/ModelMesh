import type { ModelOffering, ModelRegistry, CanonicalModel } from '@modelmesh/model-registry';
import type { PolicyEngine, RoutingPolicy, RequestRequirements } from '@modelmesh/policy-engine';
import type { HealthEngine } from '@modelmesh/health-engine';
import type { QuotaEngine } from '@modelmesh/quota-engine';

export interface SignalBreakdown {
  health: number;
  capability: number;
  quota: number;
  latency: number;
  quality: number;
  cost: number;
  stability: number;
}

export interface CandidateEvaluation {
  offering: ModelOffering;
  gatePassed: boolean;
  gateRejectionReasons?: string[];
  signals: SignalBreakdown;
  finalScore: number;
}

export interface RoutingDecision {
  requestId: string;
  requestedModel: string;
  policyMode: string;
  selectedCandidate?: ModelOffering;
  fallbackChain: ModelOffering[];
  evaluations: CandidateEvaluation[];
  rationale: string;
  timestamp: number;
}

export class CoreRouter {
  private modelRegistry: ModelRegistry;
  private policyEngine: PolicyEngine;
  private healthEngine: HealthEngine;
  private quotaEngine: QuotaEngine;

  constructor(
    modelRegistry: ModelRegistry,
    policyEngine: PolicyEngine,
    healthEngine: HealthEngine,
    quotaEngine: QuotaEngine
  ) {
    this.modelRegistry = modelRegistry;
    this.policyEngine = policyEngine;
    this.healthEngine = healthEngine;
    this.quotaEngine = quotaEngine;
  }

  /**
   * Evaluates all candidates and selects the best offering plus an ordered fallback chain.
   */
  public route(
    requestedModel: string,
    requestId: string = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    requirements?: RequestRequirements
  ): RoutingDecision {
    const policy = this.policyEngine.getActivePolicy();
    const candidateOfferings = this.modelRegistry.resolveOfferings(requestedModel);

    const evaluations: CandidateEvaluation[] = [];

    for (const offering of candidateOfferings) {
      // 1. Policy Gate Evaluation
      const gateResult = this.policyEngine.evaluateGate(offering, policy, requirements);
      
      // Check circuit breaker
      const canAccept = this.healthEngine.canAcceptRequests(offering.connectionId);
      if (!canAccept) {
        gateResult.allowed = false;
        gateResult.reasons.push('Circuit breaker is OPEN (cooldown active)');
      }

      if (!gateResult.allowed) {
        evaluations.push({
          offering,
          gatePassed: false,
          gateRejectionReasons: gateResult.reasons,
          signals: { health: 0, capability: 0, quota: 0, latency: 0, quality: 0, cost: 0, stability: 0 },
          finalScore: 0
        });
        continue;
      }

      // 2. Score calculation across signals
      const signals = this.calculateSignals(offering, requirements);
      const w = policy.weights;
      
      const finalScore = 
        w.health * signals.health +
        w.capability * signals.capability +
        w.quota * signals.quota +
        w.latency * signals.latency +
        w.quality * signals.quality +
        w.cost * signals.cost +
        w.stability * signals.stability;

      evaluations.push({
        offering,
        gatePassed: true,
        signals,
        finalScore: Math.round(finalScore * 1000) / 1000
      });
    }

    // Filter passed candidates and sort descending by score
    const passed = evaluations
      .filter(e => e.gatePassed)
      .sort((a, b) => b.finalScore - a.finalScore);

    if (passed.length === 0) {
      return {
        requestId,
        requestedModel,
        policyMode: policy.mode,
        selectedCandidate: undefined,
        fallbackChain: [],
        evaluations,
        rationale: `No candidates satisfied policy "${policy.name}" for model "${requestedModel}".`,
        timestamp: Date.now()
      };
    }

    const winner = passed[0];
    const fallbackChain = passed.slice(1).map(p => p.offering);

    const rationale = `Selected ${winner.offering.providerId}/${winner.offering.providerModelId} (Score: ${winner.finalScore}) under policy "${policy.name}". Primary drivers: Health ${winner.signals.health}, Latency ${winner.signals.latency}, Quota ${winner.signals.quota}, Cost ${winner.signals.cost}. ${fallbackChain.length} fallbacks prepared.`;

    return {
      requestId,
      requestedModel,
      policyMode: policy.mode,
      selectedCandidate: winner.offering,
      fallbackChain,
      evaluations,
      rationale,
      timestamp: Date.now()
    };
  }

  private calculateSignals(offering: ModelOffering, requirements?: RequestRequirements): SignalBreakdown {
    // 1. Health Signal
    const healthProfile = this.healthEngine.getOrCreateProfile(offering.connectionId, offering.providerId);
    const health = healthProfile.healthScore;

    // 2. Capability Signal
    let capability = 1.0;
    if (requirements?.requiredCapabilities) {
      const matchCount = requirements.requiredCapabilities.filter(c => offering.capabilities.includes(c)).length;
      capability = matchCount / Math.max(1, requirements.requiredCapabilities.length);
    }

    // 3. Quota Headroom Signal
    const quota = this.quotaEngine.calculateHeadroomScore(offering.connectionId);

    // 4. Latency Signal: p95 latency inverted normalized against 2000ms
    const p95 = healthProfile.p95LatencyMs || 500;
    const latency = Math.max(0, Math.min(1, 1 - (p95 / 2000)));

    // 5. Quality Signal
    const canonical = this.modelRegistry.getCanonical(offering.canonicalId);
    const benchmark = canonical?.benchmarkScore || 75;
    const quality = benchmark / 100;

    // 6. Cost Signal
    let cost = 1.0;
    if (offering.costClass === 'free') {
      cost = 1.0;
    } else {
      const avgPrice = (offering.inputPricePerM + offering.outputPricePerM) / 2;
      // Invert price: $0 -> 1.0, $5 -> 0.67, $20 -> 0.33
      cost = Math.max(0.1, 1 / (1 + avgPrice * 0.1));
    }

    // 7. Stability Signal
    const stability = healthProfile.consecutiveFailures === 0 ? 1.0 : Math.max(0.1, 1 - healthProfile.consecutiveFailures * 0.3);

    return {
      health: Math.round(health * 100) / 100,
      capability: Math.round(capability * 100) / 100,
      quota: Math.round(quota * 100) / 100,
      latency: Math.round(latency * 100) / 100,
      quality: Math.round(quality * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      stability: Math.round(stability * 100) / 100
    };
  }
}
