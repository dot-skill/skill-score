#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { scoreSkill } from "./score.js";
import type { Profile, SkillAssessment } from "./types.js";

const [file, profileArg = "release"] = process.argv.slice(2);
if (!file || !["continuity", "release"].includes(profileArg)) {
  console.error("Usage: skill-score <assessment.json> [continuity|release]");
  process.exit(2);
}

try {
  const input = JSON.parse(await readFile(file, "utf8")) as SkillAssessment;
  const result = scoreSkill(input, profileArg as Profile);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
