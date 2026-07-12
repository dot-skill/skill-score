export const DIMENSIONS = [
  "structuralCompleteness",
  "executability",
  "validationEvidence",
  "portability",
  "privacySecurity",
  "provenanceIntegrity",
  "reproducibility",
  "efficiency",
  "maintenanceFreshness",
  "adoptionOutcomes",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];
export type EvidenceKind = "observed" | "verified-external" | "self-reported";
export type EvidenceStatus = "pass" | "partial" | "fail" | "unknown";

export interface EvidenceReceipt {
  id: string;
  dimension: Dimension;
  kind: EvidenceKind;
  status: EvidenceStatus;
  value?: number;
  source: string;
  observedAt?: string;
  digest?: string;
  note?: string;
}

export interface SkillAssessment {
  protocolVersion: "0.1";
  artifact: {
    id: string;
    valid: boolean;
    parseable: boolean;
    containsSecrets?: boolean;
    dangerousBehavior?: boolean;
  };
  evidence: EvidenceReceipt[];
  metrics?: {
    usefulOutcomes?: number;
    tokens?: number;
    computeSeconds?: number;
  };
}

export type Profile = "continuity" | "release";

export interface DimensionResult {
  score: number;
  confidence: number;
  coverage: number;
  weight: number;
  evidenceIds: string[];
  explanation: string;
}

export interface ScoreResult {
  protocolVersion: "0.1";
  formulaVersion: "0.1.0-draft";
  profile: Profile;
  score: number;
  uncappedScore: number;
  confidence: number;
  coverage: number;
  cap: number;
  gates: string[];
  dimensions: Record<Dimension, DimensionResult>;
  explanations: string[];
}
