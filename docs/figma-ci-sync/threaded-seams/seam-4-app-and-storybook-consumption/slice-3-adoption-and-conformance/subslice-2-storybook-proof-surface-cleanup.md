### S3b — Storybook Proof Surface Cleanup

- **User/system value**: Storybook contract and proof surfaces stay trustworthy because they read generated outputs or thin adapters instead of re-encoding token or recipe data inside docs helpers.
- **Scope (in/out)**:
  - In: `storybook/**` loaders, docs helpers, presenters, and any local metadata that still duplicates token or recipe values already published by `CT-3`, `CT-5`, or `CT-6`.
  - Out: `.storybook/**` preview bootstrapping; new failure-path tests; CI or repo-wide governance wiring.
- **Acceptance criteria**:
  - `storybook/**` no longer carries a hand-authored token table, copied recipe payload, or parallel theme metadata when the same information exists in generated artifacts.
  - Token and pilot recipe proof surfaces remain reviewable, but their data path is traceable back to generated outputs or one thin artifact-derived adapter.
  - Any local Storybook metadata introduced for discoverability remains derived from the new artifact-backed surfaces rather than becoming a second truth source.
- **Dependencies**:
  - `S2`
  - `CT-3`
  - `CT-5`
  - `CT-6`
- **Verification**:
  - Run `pnpm storybook` and `pnpm test:storybook` to exercise the docs surfaces after cleanup.
  - If a loader or adapter remains, run its focused local test or manual load path and confirm the surfaced values trace back to generated artifacts.
- **Rollout/safety**:
  - Keep the adapter layer thin and inspectable so `SEAM-6` can later enforce freshness without reworking Storybook docs architecture.
  - Do not broaden beyond the existing proof surfaces or add a second catalog experience here.

#### S3b.T1 — Remove duplicated data from Storybook docs helpers

- **Outcome**: Storybook proof surfaces consume generated token and recipe artifacts without maintaining local copies of the underlying contract data.
- **Files**:
  - `storybook/**`
  - `src/**/*.stories.*`
  - `src/**/*.mdx`

Checklist:

- Implement:
  - Replace any copied token or recipe payloads in `storybook/**` with reads from generated artifacts or one thin adapter built from those artifacts.
  - Keep any local discoverability metadata derived from the same artifact-backed source instead of hard-coded parallel values.
- Test:
  - Render the token and pilot recipe proof surfaces in Storybook after the cleanup.
  - Run `pnpm test:storybook` if those surfaces participate in the existing Storybook test path.
- Validate:
  - Confirm the docs surfaces fail to load if their artifact input disappears rather than silently serving stale copied data.
  - Confirm reviewers can still trace the visible values back to the canonical generated outputs.
- Cleanup:
  - Remove stale helper constants, JSON mirrors, or prose tables that duplicate artifact data.
  - Keep surface-specific presentation code separate from data-loading code so `S3c` can target the loader path cleanly.
