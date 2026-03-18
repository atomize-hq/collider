### S3c — Local Artifact Conformance Checks

- **User/system value**: the seam gains one loud, local signal when generated token or recipe artifacts go missing or stale, giving `SEAM-6` a concrete verification path to adopt instead of inventing one later.
- **Scope (in/out)**:
  - In: one focused seam-local verification path for artifact availability, loader parity, or proof-surface conformance; documentation of the deliberate broken-artifact exercise.
  - Out: `package.json`, `justfile`, CI definitions, and any repo-wide enforcement policy.
- **Acceptance criteria**:
  - At least one local verification path fails loudly when a required generated artifact path or required artifact field is missing, renamed, or stale.
  - The failure mode is actionable for engineers working in this seam rather than silently falling back to copied values or empty docs output.
  - The verification surface stays small enough for `SEAM-6` to promote into governance without redesigning `SEAM-4`.
  - `pnpm test:storybook` is the required automated execution path for this conformance check; manual Storybook inspection does not satisfy the seam by itself.
- **Dependencies**:
  - `S3a`
  - `S3b`
  - `CT-5`
  - `CT-6`
- **Verification**:
  - Run `pnpm test:storybook` and any focused local test added for the artifact loader or parity smoke path.
  - Exercise the verification once with the expected artifact path and once with a deliberately broken or renamed artifact reference.
  - Run `just check` after the local verification path is in place.
- **Rollout/safety**:
  - Keep all enforcement local to this seam; leave command wiring and policy rollout for `SEAM-6`.
  - Prefer one decisive verification path over several overlapping checks that would need consolidation later.

#### S3c.T1 — Add a focused broken-artifact conformance path

- **Outcome**: one seam-local test or verification surface catches missing generated artifacts or broken loader assumptions before governance work begins.
- **Files**:
  - `storybook/**`
  - `src/**/*.test.*`
  - `src/**/*.stories.*`

Checklist:

- Implement:
  - Add one focused verification path for the artifact-backed Storybook docs or parity smoke surface.
  - Make the verification assert on required artifact presence or required fields instead of accepting silent fallback behavior.
- Test:
  - Run the verification against the expected artifact path and confirm it passes.
  - Deliberately break the artifact reference or artifact shape and confirm the verification fails loudly and specifically.
- Validate:
  - Confirm the signal is local to this seam and does not require new CI or command wiring.
  - Confirm the failure output points engineers to the missing artifact or stale adapter condition directly.
  - Confirm the required failure signal is reachable from `pnpm test:storybook` rather than only through a manual demo path.
- Cleanup:
  - Remove redundant checks that overlap without improving signal quality.
  - Keep the verification surface narrow enough that `SEAM-6` can adopt it as-is or with minimal wiring.
