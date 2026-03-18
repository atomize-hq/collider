### S3b — Local Artifact Freshness Checker

- **User/system value**: maintainers can detect stale generated token artifacts locally before `SEAM-6` turns that behavior into a repo-wide governance path.
- **Scope (in/out)**:
  - In: a deterministic checker such as `scripts/validate-token-artifacts.mjs`; missing-output detection; stale-output detection for `design-tokens/dist/**` and `src/lib/tokens/tokens.css`; stable diagnostics.
  - Out: package-script orchestration; `justfile` or CI integration; app or Storybook adoption; changes to token generation semantics.
- **Acceptance criteria**:
  - A clean rebuild passes the checker.
  - Mutating or deleting a generated artifact causes the checker to fail non-zero.
  - Diagnostic ordering is deterministic across repeated runs.
- **Dependencies**:
  - `S3a`
  - `CT-5`
  - `CT-6`
  - canonical token and recipe sources from `SEAM-1` and `SEAM-2`
- **Verification**:
  - Run the checker on a clean tree after `pnpm build:tokens`.
  - Intentionally mutate one generated file and rerun the checker to prove stale-artifact failure.
  - Delete one expected output and rerun the checker to prove missing-artifact failure.
- **Rollout/safety**:
  - Keep invocation local to the seam so `SEAM-6` can later wrap the checker without redefining its behavior.

#### S3.T2 — Add a seam-local artifact freshness checker

- **Outcome**: stale generated files are detectable locally before `SEAM-6` takes ownership of merge-gate wiring.
- **Files**:
  - `scripts/validate-token-artifacts.mjs`
  - `design-tokens/build/build-tokens.mjs`
  - `design-tokens/dist/**`
  - `src/lib/tokens/tokens.css`

Checklist:

- Implement:
  - Add `scripts/validate-token-artifacts.mjs` as the seam-owned drift checker.
  - Compare expected generated outputs against a fresh rebuild or deterministic re-generation flow.
  - Fail when required outputs are missing or when published artifacts drift from rebuilt output.
- Test:
  - Run the checker on a clean tree after `pnpm build:tokens`.
  - Modify `src/lib/tokens/tokens.css` or one file under `design-tokens/dist/**` and confirm the checker fails.
  - Remove one required generated artifact and confirm the checker fails with deterministic diagnostics.
- Validate:
  - Confirm the checker does not add package scripts, `justfile` changes, or CI config in this slice.
  - Confirm repeated failing runs report files in the same order so downstream governance can rely on stable output.
