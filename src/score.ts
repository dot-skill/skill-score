import {
  DIMENSIONS,
  type Dimension,
  type DimensionResult,
  type EvidenceKind,
  type EvidenceReceipt,
  type Profile,
  type ScoreResult,
  type SkillAssessment,
} from "./types.js";

const WEIGHTS: Record<Profile, Record<Dimension, number>> = {
  continuity: {
    structuralCompleteness: 0.14, executability: 0.13, validationEvidence: 0.08,
    portability: 0.08, privacySecurity: 0.14, provenanceIntegrity: 0.1,
    reproducibility: 0.11, efficiency: 0.06, maintenanceFreshness: 0.14,
    adoptionOutcomes: 0.02,
  },
  release: {
    structuralCompleteness: 0.12, executability: 0.16, validationEvidence: 0.15,
    portability: 0.1, privacySecurity: 0.14, provenanceIntegrity: 0.1,
    reproducibility: 0.1, efficiency: 0.06, maintenanceFreshness: 0.04,
    adoptionOutcomes: 0.03,
  },
};

const KIND_CONFIDENCE: Record<EvidenceKind, number> = {
  observed: 1,
  "verified-external": 0.9,
  "self-reported": 0.25,
};
const STATUS_SCORE = { pass: 100, partial: 50, fail: 0 } as const;

function evaluateDimension(
  dimension: Dimension,
  evidence: EvidenceReceipt[],
  weight: number,
): DimensionResult {
  const relevant = evidence.filter((item) => item.dimension === dimension);
  const known = relevant.filter((item) => item.status !== "unknown");
  if (known.length === 0) {
    return {
      score: 50, confidence: 0, coverage: 0, weight, evidenceIds: relevant.map((e) => e.id),
      explanation: "No usable evidence; neutral quality estimate with zero confidence.",
    };
  }

  let weightedScore = 0;
  let confidenceMass = 0;
  for (const receipt of known) {
    const confidence = KIND_CONFIDENCE[receipt.kind];
    const score = receipt.value ?? STATUS_SCORE[receipt.status as keyof typeof STATUS_SCORE];
    weightedScore += Math.max(0, Math.min(100, score)) * confidence;
    confidenceMass += confidence;
  }
  const confidence = Math.min(1, confidenceMass / 2);
  const coverage = known.length / Math.max(relevant.length, 1);
  return {
    score: weightedScore / confidenceMass,
    confidence,
    coverage,
    weight,
    evidenceIds: relevant.map((e) => e.id),
    explanation: `${known.length} known receipt(s); evidence confidence ${confidence.toFixed(2)}.`,
  };
}

export function scoreSkill(input: SkillAssessment, profile: Profile = "release"): ScoreResult {
  const weights = WEIGHTS[profile];
  const dimensions = {} as Record<Dimension, DimensionResult>;
  for (const dimension of DIMENSIONS) {
    dimensions[dimension] = evaluateDimension(dimension, input.evidence, weights[dimension]);
  }

  const uncappedScore = DIMENSIONS.reduce(
    (sum, dimension) => sum + dimensions[dimension].score * weights[dimension],
    0,
  );
  const confidence = DIMENSIONS.reduce(
    (sum, dimension) => sum + dimensions[dimension].confidence * weights[dimension],
    0,
  );
  const coverage = DIMENSIONS.reduce(
    (sum, dimension) => sum + dimensions[dimension].coverage * weights[dimension],
    0,
  );

  const gates: string[] = [];
  let cap = 100;
  if (!input.artifact.parseable || !input.artifact.valid) {
    cap = 20;
    gates.push("invalid-artifact");
  }
  if (input.artifact.containsSecrets) {
    cap = Math.min(cap, 30);
    gates.push("exposed-secrets");
  }
  if (input.artifact.dangerousBehavior) {
    cap = Math.min(cap, 40);
    gates.push("dangerous-behavior");
  }

  const score = Math.min(uncappedScore, cap);
  return {
    protocolVersion: "0.1",
    formulaVersion: "0.1.0-draft",
    profile,
    score: Number(score.toFixed(2)),
    uncappedScore: Number(uncappedScore.toFixed(2)),
    confidence: Number(confidence.toFixed(3)),
    coverage: Number(coverage.toFixed(3)),
    cap,
    gates,
    dimensions,
    explanations: [
      "Unknown evidence is neutral for quality and lowers confidence.",
      "Self-reported evidence has limited confidence mass.",
      "Tokens and compute are not positive score inputs; they may support efficiency analysis.",
      ...(gates.length ? [`Hard cap applied: ${cap}.`] : []),
    ],
  };
}
