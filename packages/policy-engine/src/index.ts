import type { ModelOffering, Capability } from '@modelmesh/model-registry';

export type PolicyMode = 
  | 'Balanced'
  | 'Free'
  | 'Local'
  | 'Fast'
  | 'Cheap'
  | 'Best'
  | 'Resilient'
  | 'Private';

export interface PolicyWeights {
  health: number;
  capability: number;
  quota: number;
  latency: number;
  quality: number;
  cost: number;
  stability: number;
}

export interface RoutingPolicy {
  id: string;
  name: string;
  mode: PolicyMode;
  weights: PolicyWeights;
  allowedProviders?: string[];
  disallowedProviders?: string[];
  maxPricePerM?: number;
  requireLocalOnly?: boolean;
  requireFreeOnly?: boolean;
  noTrainingRequired?: boolean;
}

export interface RequestRequirements {
  requiredCapabilities?: Capability[];
  minContextWindow?: number;
  streamRequested?: boolean;
}

export interface PolicyGateResult {
  allowed: boolean;
  reasons: string[];
}

export const PRESET_POLICIES: Record<PolicyMode, RoutingPolicy> = {
  Balanced: {
    id: 'policy-balanced',
    name: 'Balanced',
    mode: 'Balanced',
    weights: {
      health: 0.25,
      capability: 0.15,
      quota: 0.15,
      latency: 0.15,
      quality: 0.15,
      cost: 0.10,
      stability: 0.05
    }
  },
  Free: {
    id: 'policy-free',
    name: 'Free Only',
    mode: 'Free',
    requireFreeOnly: true,
    weights: {
      health: 0.30,
      capability: 0.15,
      quota: 0.25,
      latency: 0.15,
      quality: 0.10,
      cost: 0.00,
      stability: 0.05
    }
  },
  Local: {
    id: 'policy-local',
    name: 'Local Only',
    mode: 'Local',
    requireLocalOnly: true,
    weights: {
      health: 0.25,
      capability: 0.20,
      quota: 0.10,
      latency: 0.25,
      quality: 0.15,
      cost: 0.00,
      stability: 0.05
    }
  },
  Fast: {
    id: 'policy-fast',
    name: 'Fastest Response',
    mode: 'Fast',
    weights: {
      health: 0.20,
      capability: 0.10,
      quota: 0.10,
      latency: 0.45,
      quality: 0.10,
      cost: 0.00,
      stability: 0.05
    }
  },
  Cheap: {
    id: 'policy-cheap',
    name: 'Cost Minimizer',
    mode: 'Cheap',
    weights: {
      health: 0.20,
      capability: 0.10,
      quota: 0.15,
      latency: 0.05,
      quality: 0.10,
      cost: 0.35,
      stability: 0.05
    }
  },
  Best: {
    id: 'policy-best',
    name: 'Maximum Quality',
    mode: 'Best',
    weights: {
      health: 0.20,
      capability: 0.15,
      quota: 0.10,
      latency: 0.05,
      quality: 0.40,
      cost: 0.05,
      stability: 0.05
    }
  },
  Resilient: {
    id: 'policy-resilient',
    name: 'High Availability',
    mode: 'Resilient',
    weights: {
      health: 0.35,
      capability: 0.10,
      quota: 0.20,
      latency: 0.05,
      quality: 0.10,
      cost: 0.00,
      stability: 0.20
    }
  },
  Private: {
    id: 'policy-private',
    name: 'Privacy & Data Residency',
    mode: 'Private',
    noTrainingRequired: true,
    weights: {
      health: 0.25,
      capability: 0.20,
      quota: 0.15,
      latency: 0.15,
      quality: 0.15,
      cost: 0.05,
      stability: 0.05
    }
  }
};

export class PolicyEngine {
  private activePolicy: RoutingPolicy = PRESET_POLICIES.Balanced;

  public getActivePolicy(): RoutingPolicy {
    return this.activePolicy;
  }

  public setActivePolicy(policy: RoutingPolicy): void {
    this.activePolicy = policy;
  }

  public setMode(mode: PolicyMode): void {
    if (PRESET_POLICIES[mode]) {
      this.activePolicy = PRESET_POLICIES[mode];
    }
  }

  /**
   * Evaluates if a candidate offering is permitted by policy gates and request constraints.
   */
  public evaluateGate(
    offering: ModelOffering, 
    policy: RoutingPolicy = this.activePolicy,
    requirements?: RequestRequirements
  ): PolicyGateResult {
    const reasons: string[] = [];

    // 1. Free only gate
    if (policy.requireFreeOnly && offering.costClass !== 'free') {
      reasons.push(`Rejected: Policy requires free offerings only, but offering cost is ${offering.costClass}`);
    }

    // 2. Local only gate
    if (policy.requireLocalOnly && !offering.isLocal) {
      reasons.push('Rejected: Policy requires local machine/LAN inference only');
    }

    // 3. Allowed/Disallowed providers gate
    if (policy.allowedProviders && policy.allowedProviders.length > 0) {
      if (!policy.allowedProviders.includes(offering.providerId)) {
        reasons.push(`Rejected: Provider ${offering.providerId} not in allowedProviders list`);
      }
    }
    if (policy.disallowedProviders && policy.disallowedProviders.includes(offering.providerId)) {
      reasons.push(`Rejected: Provider ${offering.providerId} is in disallowedProviders list`);
    }

    // 4. Max price ceiling
    if (policy.maxPricePerM !== undefined && (offering.inputPricePerM > policy.maxPricePerM || offering.outputPricePerM > policy.maxPricePerM)) {
      reasons.push(`Rejected: Offering price exceeds ceiling of $${policy.maxPricePerM}/M tokens`);
    }

    // 5. Context window requirements
    if (requirements?.minContextWindow && offering.contextWindow < requirements.minContextWindow) {
      reasons.push(`Rejected: Offering context ${offering.contextWindow} < requested ${requirements.minContextWindow}`);
    }

    // 6. Capability requirements
    if (requirements?.requiredCapabilities) {
      for (const reqCap of requirements.requiredCapabilities) {
        if (!offering.capabilities.includes(reqCap)) {
          reasons.push(`Rejected: Offering lacks required capability "${reqCap}"`);
        }
      }
    }

    return {
      allowed: reasons.length === 0,
      reasons
    };
  }
}
