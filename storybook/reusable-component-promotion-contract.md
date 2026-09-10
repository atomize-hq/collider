# Collider component evidence

`artifacts/harness/reusable-component-status.json` is an installed-product-generated
status version 3 report with scope `configured-component-evidence`. It is not a frozen
consumer implementation or a mirrored component enrollment list.

Three evidence scopes remain independent: static story-reference coverage, current
revision-bound visual review, and token publication-ledger conformance. Static story
coverage does not prove browser execution; a publication attestation does not establish
component readiness or a new live Figma observation. Browser/a11y, build and native
checks continue as separate repository gates.

`pnpm generate:reusable-component-status` records current evidence, including failures.
`pnpm validate:reusable-component-status` checks report freshness and source agreement.
A conformant report can truthfully describe unmet requirements. Promotion always
reevaluates inputs instead of trusting a saved status or a highest-earned-claim field.
The portable contract is owned by ds-skills; the selected profiles are consumer data
in `ds-skills.project.json`. See [policy](reusable-component-promotion-policy.md).
