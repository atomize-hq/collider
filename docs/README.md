# Docs

What is current, and what only looks current. Everything listed here is live unless this page
says otherwise.

## Live

| Document                                                                     | What it is                                                                                               |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`backlog.md`](./backlog.md)                                                 | Deferred work with a decision already made. Scoped and agreed, not scheduled.                            |
| [`ai-elements-inventory.md`](./ai-elements-inventory.md)                     | Per-component status across the ai-elements set. The planning surface — prefer it over any derived list. |
| [`ai-elements-loop-handoff.md`](./ai-elements-loop-handoff.md)               | How to run a Stage-2 component loop. Written for an agent picking the work up cold.                      |
| [`stage1/sync-policy.md`](./stage1/sync-policy.md)                           | What counts as drift, the stage gates, and who owns which artifact. Revised 2026-09-03.                  |
| [`stage1/architecture.md`](./stage1/architecture.md)                         | Layer boundaries.                                                                                        |
| [`stage1/native-boundary.md`](./stage1/native-boundary.md)                   | What may cross into Tauri.                                                                               |
| [`stage1/baseline-environment.md`](./stage1/baseline-environment.md)         | Pinned toolchain and its rationale.                                                                      |
| [`stage1/storybook-baseline.md`](./stage1/storybook-baseline.md)             | Storybook version policy and addon rules.                                                                |
| [`stage1/storybook-taxonomy.md`](./stage1/storybook-taxonomy.md)             | Story kinds and what each tier owes.                                                                     |
| [`stage1/primitives-wave.md`](./stage1/primitives-wave.md)                   | The primitive build order.                                                                               |
| [`stage1/figma-variables-plan.md`](./stage1/figma-variables-plan.md)         | How token variables reach Figma.                                                                         |
| [`stage1/ds-gap-audit-2026-08-30.md`](./stage1/ds-gap-audit-2026-08-30.md)   | The design-system gap audit driving Phase 2. **Current** — supersedes the 08-29 pass.                    |
| [`stage1/ds-phase-2-plan.md`](./stage1/ds-phase-2-plan.md)                   | The buildout plan that audit produced.                                                                   |
| [`stage1/foundations-page-plan.md`](./stage1/foundations-page-plan.md)       | The Figma Foundations page. Regenerate with `pnpm figma:foundations:build`; never hand-edit.             |
| [`collider_frontend_landing_guide.md`](./collider_frontend_landing_guide.md) | The Substrate ownership boundary. Architectural rather than procedural, so it does not decay.            |

## Superseded, kept in place

| Document                                                                                                 | Status                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`stage1/_superseded-migration-audit-2026-08-29.md`](./stage1/_superseded-migration-audit-2026-08-29.md) | **Mis-scoped — do not act on it.** A Figma tab confusion meant it analysed Atomize Systems while believing it was Collider-Old, so its gap map measures the wrong file. Replaced by the 08-30 audit. |
| [`figma-ref-drift-detection.md`](./figma-ref-drift-detection.md)                                         | Unimplemented, and its premises are stale — it was designed around Code Connect, which is retired. Token drift is solved separately by the plugin's **Check Drift** action.                          |

## Archived

Four seam-decomposition trees — 184 files, ~12,600 lines — moved to
[`archive/docs/`](../archive/README.md) on 2026-09-03: `figma-ci-sync`,
`harness-completion`, `harness-convergence`, `harness-future-rails`.

They are accurate as a record of what was built between 2026-03-17 and 2026-03-24. They were
moved because they sat beside live docs with nothing marking the difference, and because they
are where a search for retired tooling lands first. See
[`archive/README.md`](../archive/README.md) for what each tree covers.

## Conventions

- A doc that stops being true gets **corrected or archived**, not left standing. Both are
  cheap; a stale doc read as an instruction is not.
- Machine-readable state wins over prose. Where a doc and an artifact disagree — a ledger, a
  status file, a spec — the artifact is right and the doc is stale.
- Deferred work goes in [`backlog.md`](./backlog.md) only once the decision is made. Open
  questions belong in a plan doc.
