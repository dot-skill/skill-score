# Skill Score Protocol v0.1 — DRAFT

Status: experimental draft; not a certification, security audit, or universal measure of worth.

## Principles

1. Report a transparent, profile-dependent estimate, never one universal truth.
2. Keep quality (`score`) separate from epistemic support (`confidence`, `coverage`).
3. Distinguish observed, independently verified, and self-reported evidence.
4. Treat missing facts as unknown: use a neutral 50 estimate and zero confidence.
5. Never reward raw token, latency, energy, or compute spend. Resource use belongs in an
   efficiency denominator or a provenance receipt.
6. Make every score reproducible from versioned inputs, weights, gates, and receipts.

## Formula

For dimension `d`, each known receipt has value `v` in `[0,100]` and confidence multiplier
`k`: observed `1.0`, verified-external `0.9`, self-reported `0.25`.

`D_d = sum(v_i * k_i) / sum(k_i)`

`C_d = min(1, sum(k_i) / 2)`. Unknown-only dimensions use `D_d = 50`, `C_d = 0`.
Receipt coverage is known receipts divided by all receipts for that dimension.

`rawScore = sum(profileWeight_d * D_d)`

Overall confidence and coverage are the corresponding weighted sums. The final score is
`min(rawScore, gateCap)`, rounded to two decimals. Confidence is not multiplied into quality:
consumers can impose their own confidence threshold without turning absence into a quality failure.

## Dimensions

- Structural completeness: required files, metadata, declarations, and coherent boundaries.
- Executability: runnable entry points and successful execution in declared environments.
- Validation evidence: tests, checks, reviews, and outcome measurements.
- Portability/generalization: bounded assumptions, adapters, and multi-environment evidence.
- Privacy/security hygiene: secret handling, data minimization, permissions, and unsafe behavior.
- Provenance integrity: attributable sources and tamper-evident digests where supplied.
- Reproducibility: pinned inputs, setup instructions, deterministic or bounded outputs.
- Efficiency: useful outcomes relative to resource use; spending more is never intrinsically better.
- Maintenance/freshness: ownership, compatibility, update cadence, and deprecation policy.
- Adoption/outcomes: optional external evidence of real use and outcomes.

## Profiles

`release` emphasizes execution and validation. `continuity` emphasizes structure, safety,
reproducibility, and maintenance. Weights are normative in `src/score.ts` and sum to 1.

## Gates

Invalid or unparseable artifacts cap at 20. Exposed secrets cap at 30. Declared dangerous
behavior caps at 40. Caps stack by taking the minimum. These flags are assessment inputs, not
claims that this implementation discovered every secret or vulnerability.

## Evidence receipts and anti-gaming

Receipts identify a source, evidence kind, status, optional measurement, timestamp, and digest.
A digest is only a content identifier unless a verifier separately establishes signatures and
identity. Duplicate correlated receipts should not be represented as independent evidence.
Evaluators should retain raw receipts, disclose sampling, use fresh isolated execution where
appropriate, and avoid metrics that can be inflated without useful outcomes. Self-claims receive
low confidence and cannot become observed facts through repetition.

## Versioning

Formula version `0.1.0-draft` is immutable once released. Breaking semantics require a new
protocol/formula version. Consumers must persist input, profile, and formula version with results.
