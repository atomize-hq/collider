# `SEAM-5` — Figma Sync Rail

- Name: Figma Sync Rail
- Type: integration
- Goal / user value: let designers consume repo-approved tokens inside Figma without making Figma the canonical authoring surface.

## Scope

- In: Tokens Studio sync mode selection; Figma-facing export shape; sync policy documentation; optional parity hooks for enterprise Figma Variables API users.
- Out: canonical token authoring in Figma; broad design-process changes unrelated to token sync; runtime consumption logic.

## Primary Interfaces (Contracts)

- Inputs: generated Figma export from `SEAM-3`; token theme definitions from `SEAM-1`; optional sync-ledger validation precedent from `scripts/validate-sync-ledger.mjs`.
- Outputs: a documented sync policy; a stable Figma export artifact such as `design-tokens/dist/figma/tokens.json`; optional sync-ledger or parity metadata if the team chooses to enforce it.

## Key Invariants / Rules

- Repo JSON remains canonical in v1.
- Read-only or effectively read-only Figma consumption is the default posture unless the team explicitly accepts bidirectional sync risk.
- Enterprise REST parity checks are optional hardening, not the only valid v1 path.

## Dependencies

- Blocks: `SEAM-6`
- Blocked by: `SEAM-1`, `SEAM-3`

## Touch Surface

- `design-tokens/dist/figma/**`
- `scripts/validate-sync-ledger.mjs`
- Figma/Tokens Studio operational docs

## Verification

- A designer can pull the canonical export into a test Figma file and materialize variables or styles without manual value entry.
- The sync mode is documented well enough that maintainers can tell whether Figma edits are authoritative, ignored, or forbidden.
- Optional parity metadata validates cleanly if the team chooses to track it.

## Risks / Unknowns

- Risk: bidirectional sync creates hidden divergence or accidental source-of-truth flips.
- De-risk plan: default to read-only consumption, document the policy, and treat two-way sync as an explicit follow-up decision.

## Rollout / Safety

- Start with one Figma test file and one sync transport.
- Gate enterprise-only parity enforcement behind a separate enablement decision.
