# Reusable Component Promotion Policy

`storybook/reusable-component-promotion-policy.md` is the repo-owned claim-matrix and consumer-gating policy for `CT-12B`.

## Policy Scope

- This document defines the current change-class claim profiles for reusable-component promotion.
- This document defines which upstream rails each change class may read at baseline.
- This document defines the consumer ratchets for local, CI, handoff, and release promotion consumers.

## Baseline Claim Matrix

- `reusable-component-advancement` is the only profile that may read all three current rails: `ct8b`, `ct9b`, and `ct10b`.
- `token-only` stays on a narrower informational profile and may read only `ct8b`.
- `docs-only` stays on a narrower informational profile and may read only `ct9b`.
- `proof-only` stays on a narrower informational profile and may read only `ct9b` and `ct10b`.
- `other` stays on an explicit catch-all informational profile with no future-rail requirements by default.

## Change-Class Invariants

- Non-reusable change classes may not inherit the full reusable-component rail set.
- Informational status remains broader than blocking authority.
- The reusable-component profile is the only profile that may promote from informational to blocking behavior under the consumer rules below.
- Narrower change classes remain informational-only by default even if one of their narrower rails is stale or unsatisfied.

## Upstream Boundary Rules

- `review.requiredForClaim` is consumed from `CT-10B`; `CT-12B` may not re-decide that field.
- `CT-12B` summarizes upstream repo-owned contracts. It does not replace or broaden `CT-8B`, `CT-9B`, `CT-10B`.

## Consumer Contexts

- `local` is advisory-only. It may print the highest earned claim, refusal reasons, and a heuristic change-class recommendation when the requested class is unknown.
- `ci` may block only when the requested change class is explicitly `reusable-component-advancement`. `token-only`, `docs-only`, `proof-only`, `other`, and heuristic-only classifications remain advisory.
- `handoff` is advisory-only. It may expose the same `CT-12B` decision surface in workflow summaries or handoff notes, but it may not fail the consumer.
- `release` is the only consumer allowed to claim full reusable-component harness readiness. It may block `E-promotion-complete` when parity is deferred, stale, or unsatisfied.

## Change-Class Resolution

- `REUSABLE_COMPONENT_PROMOTION_CHANGE_CLASS` is the authoritative gate input.
- `unknown` is allowed only as an advisory input. The gate may recommend a class from touched files, but that heuristic is never authoritative and may not enable blocking behavior by itself.
- If a caller requests `blocking` for a consumer or class that policy keeps advisory-only, the gate must demote that request back to advisory and report the demotion explicitly.

## Ratchet Rules

- Proof may block only for `reusable-component-advancement`, and only in `ci` or `release`.
- Review may block only when `CT-10B` is current and `review.requiredForClaim=true`. Informational review must remain advisory even when Chromatic ran successfully.
- Parity remains advisory for `local`, `ci`, and `handoff` while `promotion.parityMode="deferred"`.
- Release is the only consumer that may turn deferred, stale, or unsatisfied parity into a blocking result.

## Stale-Trigger Handling

- Any stale `CT-10B` input must demote the relevant consumer branch back to advisory or explicit blocked state. No consumer may silently carry forward an older blocking entitlement.
- Drift in upstream field boundaries must be surfaced through repo-owned `CT-12B` reason codes and consumer output, not through raw upstream payload inspection.
- When the requested change class is unknown, stale upstream rails may still be reported, but the result must remain advisory because the heuristic classification is non-authoritative.

## Forbidden Policy Drift

- Do not broaden reusable-component review, proof or parity requirements onto `token-only`, `docs-only`, `proof-only`, or `other` by default.
- Do not treat `CT-10B` execution evidence or vendor UI summaries as claim authority.
- Do not let heuristic classification create blocking behavior on its own.
