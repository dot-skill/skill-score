# skill-score

> **v0.1 DRAFT:** experimental, vendor-neutral scoring protocol and TypeScript reference
> implementation for `.skill` artifacts.

`skill-score` estimates quality and completeness without pretending there is one universal measure
of worth. It reports a normalized `0–100` score alongside confidence, coverage, dimension
sub-scores, evidence receipts, gate caps, and explanations.

## What it does

- Separates observed and independently verified evidence from self-reported claims.
- Uses release and continuity profiles with transparent, versioned weights.
- Leaves unknown quality neutral while reducing confidence.
- Applies hard caps for invalid artifacts, exposed secrets, and dangerous behavior.
- Treats token/compute use as possible efficiency or provenance data—never as “more is better.”
- Produces deterministic JSON suitable for policy engines and registries.

This project does **not** certify safety, prove authorship, perform cryptographic verification, or
replace human judgment. See the [draft specification](docs/spec-v0.1.md).

## Install and use

```sh
npm install
npm run build
node dist/src/cli.js test/fixtures/cases.json release
```

Library usage:

```ts
import { scoreSkill } from "@dot-skill/skill-score";

const result = scoreSkill(assessment, "release");
```

Assessment inputs follow [`schema/assessment.schema.json`](schema/assessment.schema.json).

## Formula at a glance

Known receipt values are averaged using evidence multipliers: observed `1.0`,
verified-external `0.9`, and self-reported `0.25`. Dimension results are combined using profile
weights. Unknown-only dimensions estimate quality at 50 with zero confidence. Overall confidence
and coverage are separately weighted. The lowest applicable gate cap is then applied.

## Development

```sh
npm install
npm run check
```

Fixtures cover excellent, incomplete, self-claimed/forged-looking, and privacy-risk assessments.
Contributions are welcome under the governance and contribution policies in this repository.

## License

MIT © Bharat Dudeja.
