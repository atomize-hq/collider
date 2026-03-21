# Reusable Component Promotion Policy

`storybook/reusable-component-promotion-policy.md` is the repo-owned claim-matrix baseline for `CT-12B`.

## Policy Scope

- This document freezes the `S1` change-class claim profiles for reusable-component promotion.
- This document defines which upstream rails each change class may read at baseline.
- This document does not activate consumer blocking behavior. Consumer ratchets remain owned by `S3`.

## Baseline Claim Matrix

- `reusable-component-advancement` is the only profile that may read all four future rails: `ct8b`, `ct9b`, `ct10b`, and `ct11b`.
- `token-only` stays on a narrower informational profile and may read only `ct8b`.
- `docs-only` stays on a narrower informational profile and may read only `ct9b`.
- `proof-only` stays on a narrower informational profile and may read only `ct9b` and `ct10b`.
- `other` stays on an explicit catch-all informational profile with no future-rail requirements in this slice.

## Change-Class Invariants

- Non-reusable change classes may not inherit the full reusable-component rail set.
- Informational status is broader than blocking authority in `S1`.
- The reusable-component profile may prepare for future blocking adoption, but it remains informational at the contract baseline until `S3` defines consumer ratchets.
- Narrower change classes remain informational-only in this slice even if one of their narrower rails is stale or unsatisfied.

## Upstream Boundary Rules

- `review.requiredForClaim` is consumed from `CT-10B`; `CT-12B` may not re-decide that field.
- Mapping is a current upstream input because `THR-07` is published and `SEAM-9B` is landed basis.
- Mapping being current does not authorize blocking adoption in this slice; consumer blocking and ratchet behavior remain out of scope until `S3`.
- `CT-12B` summarizes upstream repo-owned contracts. It does not replace or broaden `CT-8B`, `CT-9B`, `CT-10B`, or `CT-11B`.

## Forbidden Policy Drift

- Do not broaden reusable-component review, proof, mapping, or parity requirements onto `token-only`, `docs-only`, `proof-only`, or `other` by default.
- Do not treat `CT-10B` execution evidence or vendor UI summaries as claim authority.
- Do not treat mapping as deferred planning-only input now that `THR-07` is published.
- Do not activate blocking consumer behavior from this document alone.
