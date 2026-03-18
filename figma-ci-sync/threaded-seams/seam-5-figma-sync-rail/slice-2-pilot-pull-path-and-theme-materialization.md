### S2 — Pilot Pull Path and Theme Materialization

- **User/system value**: prove a designer can pull the repo-approved artifact into one Figma test file and materialize the supported theme contract without manual token entry.
- **Scope (in/out)**:
  - In: one team-owned Figma pilot file; the exact Tokens Studio setup flow for consuming `design-tokens/dist/figma/tokens.json`; ledger updates that record which themes and statuses were proven.
  - Out: broader team rollout across many Figma files; enterprise REST parity; CI ownership or gate promotion.
- **Acceptance criteria**:
  - The pilot Figma file can pull the canonical export without hand-entering token values.
  - The required `dark` theme and any additive theme behavior from `CT-2` are mapped and recorded explicitly.
  - The ledger captures the last successful pull state and any remaining manual exceptions or drift.
- **Dependencies**: `S1`, `SEAM-1/CT-2`, `SEAM-3/CT-5`
- **Verification**: follow the pilot setup doc from a clean starting point; pull the artifact into the pilot Figma file; inspect that variables or styles materialize for the required theme; update the ledger with the observed result.
- **Rollout/safety**: limit the proof to one pilot file and one transport so failures are localized and the team does not silently fan out a weak sync posture.

#### S2.T1 — Configure and document the pilot Tokens Studio pull flow

- **Outcome**: a maintainer can connect one Figma test file to the canonical export using a documented, repeatable setup flow.
- **Inputs/outputs**:
  - Inputs: `src/figma/README.md`; `design-tokens/dist/figma/tokens.json`; the chosen default sync mode from `S1.T1`.
  - Outputs: `src/figma/pilot-setup.md` capturing provider settings, authentication expectations, the artifact URL or path used by the plugin, and the exact pull or refresh steps.
- **Implementation notes**: document the plugin path the team actually intends to support; if the transport is effectively read-only rather than technically hard-locked, say that plainly and name the human policy guardrail.
- **Acceptance criteria**:
  - A maintainer following `src/figma/pilot-setup.md` can attach the pilot file to the canonical artifact.
  - The setup instructions do not require undocumented local rewrites or manual token value entry.
  - The doc links back to `src/figma/README.md` instead of introducing a competing policy source.
- **Test notes**: have one maintainer perform the setup from the doc against a fresh or reset pilot file and note any missing prerequisites.
- **Risk/rollback notes**: plugin UI drift is the main risk; keep the guide versioned and concise so the team can update screenshots or field names without changing policy.

Checklist:

- Implement: add `src/figma/pilot-setup.md` with the exact pilot-file setup steps and supported provider settings.
- Test: follow the doc against a clean pilot file and confirm the artifact can be pulled.
- Validate: confirm no step depends on editing token values directly in Figma.
- Cleanup: move any one-off troubleshooting notes into a short prerequisites section rather than scattering them through the flow.

#### S2.T2 — Record theme materialization proof in the ledger

- **Outcome**: the repo has a concrete record of which theme IDs and import results the pilot file actually materialized.
- **Inputs/outputs**:
  - Inputs: `CT-2` theme IDs; the pilot-file setup from `S2.T1`; `src/figma/sync-ledger.json`.
  - Outputs: updates to `src/figma/sync-ledger.json` that fill `links.figmaFile`, `status.themeIds`, `status.themeMapping`, `status.artifactGitSha`, `status.lastSuccessfulPullAt`, and any remaining `drift` entries.
- **Implementation notes**: record enough detail that a later maintainer can tell whether a pull succeeded against the right artifact revision; keep any manual exceptions in `drift` instead of leaving them implicit in chat or screenshots.
  - Use `status.artifactGitSha` as the only revision field for the reviewed pull. Do not add a second `artifactRevision`, `artifactCommit`, or duplicated SHA field elsewhere in the ledger.
  - `status.themeMapping` must use one object per theme with the shape `{ "themeId": "<ct-2-theme-id>", "figmaMode": "<Tokens Studio mode name>" }`.
  - Every unresolved manual exception must become one `drift[]` object with `code`, `severity`, `message`, and `status=open`; resolved items may stay in the ledger only if they flip to `status=resolved`.
- **Acceptance criteria**:
  - The ledger records the exact pilot file and the `status.artifactGitSha` value used for the successful pull.
  - The ledger shows how the required `dark` theme and any additive themes map into the pilot file.
  - Any unresolved manual step or mismatch is listed explicitly in `drift`.
- **Test notes**: perform at least one successful pull, then intentionally change the referenced artifact revision or theme mapping in the ledger to confirm review catches the inconsistency.
- **Risk/rollback notes**: external file access can fail; if the pilot file is temporarily unavailable, record a blocked status and reason in the ledger rather than pretending the proof exists.

Checklist:

- Implement: update `src/figma/sync-ledger.json` after the pilot import with artifact revision, theme mapping, and status details.
- Test: compare the recorded ledger state with the actual pilot-file result after a pull.
- Validate: confirm every manual exception is captured in `drift` and not left as unwritten tribal knowledge.
- Cleanup: remove placeholder pilot identifiers or TODO values once the real file is linked.
