### S1b — Deterministic Artifact Freshness Validation

- **User/system value**: detect stale generated token artifacts immediately after rebuild so maintainers can trust checked-in outputs before the repo makes drift blocking.
- **Scope (in/out)**:
  - In: a seam-owned freshness checker under `scripts/**`, explicit watched-artifact paths, and deterministic drift messaging.
  - Out: `package.json` command-surface design, CI/`justfile` rollout wiring, and any reimplementation of token generation internals.
- **Acceptance criteria**:
  - The freshness checker exits non-zero when a watched generated artifact is stale after `pnpm build:tokens`.
  - A no-op rebuild with unchanged sources passes repeatedly.
  - Output identifies the drifting artifact and the command maintainers should rerun.
- **Dependencies**:
  - `SEAM-1`
  - `SEAM-2`
  - `SEAM-3`
  - `CT-5`
  - `S1a`
- **Verification**:
  - Hand-modify a watched artifact such as `src/lib/tokens/tokens.css`, rerun the checker, and confirm file-specific failure output.
  - Rebuild from canonical sources and confirm the check passes on repeated runs.
- **Rollout/safety**:
  - Keep the watched-path set narrow and explicit first; false positives should be fixed here before any mandatory gate promotion.

#### S1b.T1 — Add deterministic artifact freshness validation

- **Outcome**: a seam-owned script under `scripts/**` compares rebuilt outputs against tracked artifacts and fails deterministically when drift is present.
- **Files**:
  - `scripts/**`
  - `src/lib/tokens/tokens.css`
  - other explicit generated artifact paths defined by `CT-5`

Checklist:

- Implement:
  - Add the freshness checker script under `scripts/**`.
  - Enumerate the exact watched artifact paths instead of deriving them implicitly.
  - Reuse rebuilt outputs from `CT-5` rather than duplicating generation logic.
- Test:
  - Simulate stale output by editing one watched artifact and verify the script fails.
  - Rebuild the artifacts and verify the script passes.
- Validate:
  - Confirm the checker is deterministic across repeated no-change runs.
  - Confirm failure output names the drifting file and recovery command.
