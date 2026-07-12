import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { scoreSkill } from "../src/score.js";
import type { SkillAssessment } from "../src/types.js";

const cases = JSON.parse(
  readFileSync(new URL("./fixtures/cases.json", import.meta.url), "utf8"),
) as Record<string, SkillAssessment>;

describe("skill-score v0.1 draft", () => {
  it("scores strong observed evidence highly", () => {
    const result = scoreSkill(cases.excellent!);
    expect(result.score).toBeGreaterThan(90);
    expect(result.confidence).toBeGreaterThan(0.45);
  });

  it("caps invalid incomplete artifacts without treating unknown as failure", () => {
    const result = scoreSkill(cases.incomplete!);
    expect(result.uncappedScore).toBe(50);
    expect(result.score).toBe(20);
    expect(result.confidence).toBe(0);
    expect(result.gates).toContain("invalid-artifact");
  });

  it("keeps self-claims low-confidence", () => {
    const result = scoreSkill(cases.forged!);
    expect(result.dimensions.executability.score).toBe(100);
    expect(result.dimensions.executability.confidence).toBe(0.125);
    expect(result.confidence).toBeLessThan(0.05);
  });

  it("caps an artifact with observed privacy risk", () => {
    const result = scoreSkill(cases.privacyRisk!);
    expect(result.score).toBeLessThanOrEqual(30);
    expect(result.gates).toContain("exposed-secrets");
    expect(result.dimensions.privacySecurity.score).toBe(0);
  });

  it("uses profile-specific weights deterministically", () => {
    const release = scoreSkill(cases.excellent!, "release");
    const continuity = scoreSkill(cases.excellent!, "continuity");
    expect(release.formulaVersion).toBe("0.1.0-draft");
    expect(release).toEqual(scoreSkill(cases.excellent!, "release"));
    expect(release.score).not.toBe(continuity.score);
  });

  it("does not reward token or compute spend", () => {
    const base = cases.excellent!;
    const expensive = { ...base, metrics: { tokens: 1_000_000_000, computeSeconds: 999_999 } };
    expect(scoreSkill(expensive).score).toBe(scoreSkill(base).score);
  });
});
