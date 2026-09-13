# ADR-0003: Multi-Signal Routing and Policy Gates

## Status
Accepted

## Context
Traditional AI proxy routers make routing decisions based solely on static priority lists or basic round-robin. This leads to frequent 429 rate limit errors, silent failures when local backends go offline, violation of privacy constraints (e.g., routing private enterprise data to public training providers), and inability to explain why a specific provider was selected.

## Decision
1. **Hard Policy Gates**:
   - Before numerical scoring, every candidate offering must pass all active policy gates:
     - `Free Only`: Filters out any offering with non-zero pricing.
     - `Local Only`: Restricts strictly to `category === 'local'` runtimes (Ollama, LM Studio, vLLM).
     - `Fast`: Enforces maximum latency threshold (< 1000ms p95).
     - `Private`: Restricts strictly to zero-data-retention or local providers.
2. **9-Factor Multi-Signal Scoring Equation**:
   - Offerings that pass the policy gates are scored via:
     $$\text{Score} = \sum_{i} W_i \cdot S_i$$
     Factors evaluated: Health, Capability Fit, Quota Headroom, Latency EMA, Quality Tier, Cost Class, Stability, and User Affinity.
3. **Resilient Fallback Chains**:
   - The router compiles an ordered fallback chain of top candidates.
   - Upstream failures (429, 503, timeout) immediately trigger execution of candidate N+1 without returning failure to the user.
4. **Explainable Decision Traces**:
   - Every route decision produces a structured trace containing the evaluated candidates, applied policy gates, factor score breakdown, and selected offering.

## Consequences
- **Positive**: Complete routing predictability; adherence to zero-cost or zero-data-leakage mandates; resilient recovery from transient upstream downtime; transparent explainability for debugging.
- **Negative**: Adds a minor calculation step prior to upstream dispatch (< 1ms CPU time in Node.js).
