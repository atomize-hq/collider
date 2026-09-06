# Disposition inventory — every Collider path carrying rail semantics

**T9 of the `ds-skills` migration.** Blocking: without it, every later task can complete while
Collider still owns rail logic, and **S1** can be accepted on a name grep that a copied function
would pass.

Each path gets **exactly one** disposition:

|                 | meaning                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `package-owned` | The logic moves into `@atomize-hq/ds-skills`. Collider keeps no copy.                                         |
| `data`          | Stays in Collider as JSON the CLI reads. No behaviour.                                                        |
| `command-only`  | Collider keeps the _invocation_ — a `package.json` script, a `justfile` recipe, a CI step — and nothing else. |
| `deleted`       | Goes, with nothing replacing it.                                                                              |

## How the surface was found

Not by memory. Three passes, each recorded so the result is reproducible:

1. **Import graph** — `grep` for importers of `sync-ledger.mjs`, `publish-proof.mjs`,
   `figma-parity.mjs`, `@atomize-hq/figma-token-rail` and `figma/token-sync.config.json` across
   `scripts/`, `src/`, `design-tokens/`, `storybook/` and `.github/`. This is what found
   `reusable-component-status.mjs`, which no task had named.
2. **Caller graph** — `package.json` scripts, `justfile` recipes, `governanceSteps` in
   `scripts/lib/token-governance.mjs`, and every `run:` line in the 8 CI jobs.
3. **Boundary pass** — files that _mention_ Figma but do not carry rail semantics, listed in
   §4 so "touches Figma" is never mistaken for "is the rail".

## 1. The inventory

### 1.1 Entry points

| path                                           | lines | present callers                                                                                   | disposition     |
| ---------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------- | --------------- |
| `scripts/validate-sync-ledger.mjs`             |     5 | `pnpm validate:sync-ledger` → `governanceSteps[5]` → `pnpm govern:tokens` → CI job **governance** | `command-only`  |
| `scripts/validate-figma-parity.mjs`            |     5 | `pnpm validate:figma-parity` → `governanceSteps[6]` → same chain                                  | `command-only`  |
| `scripts/validate-publish-proof.mjs`           |    31 | **none** — see §3                                                                                 | `deleted`       |
| `scripts/build-figma-plugin.mjs`               |    33 | `pnpm figma:plugin:build`, `just figma-plugin-build`                                              | `package-owned` |
| `scripts/serve-figma-tokens.mjs`               |   142 | `pnpm figma:tokens:serve`, `just figma-token-server`                                              | `package-owned` |
| `scripts/capture-rail-baselines.mjs`           |   210 | `pnpm baseline:rail`. No gate runs it                                                             | `package-owned` |
| `.agents/skills/scripts/validate-artifact.mjs` |   335 | docs + skill templates, invoked as `node …`                                                       | `package-owned` |

### 1.2 Logic

| path                                                                                      | lines | what it owns                                                      | disposition            |
| ----------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------- | ---------------------- |
| `scripts/lib/sync-ledger.mjs`                                                             |   488 | CT-8B: schema validation, guardrails, conformance evaluation, CLI | `package-owned`        |
| `scripts/lib/figma-parity.mjs`                                                            |   112 | CT-15B promotion policy on top of the ledger evaluator            | `package-owned`        |
| `scripts/lib/publish-proof.mjs`                                                           |   229 | CT-7B publish proof validation                                    | `package-owned`        |
| `scripts/lib/reusable-component-status.mjs` → **`summarizeCt8b()` only**, 36 of 647 lines |    36 | Reads the ledger to produce one rail of a status report           | **carve-out — see §2** |

### 1.3 Tests

| path                                                | tests | disposition                                                                                                                                                                                                          |
| --------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/tokens/figma-sync-policy.test.ts`          |    20 | `package-owned` — moves with `sync-ledger.mjs` + `figma-parity.mjs`                                                                                                                                                  |
| `src/lib/tokens/figma-publish-proof.test.ts`        |     7 | `package-owned`, **except** the one case asserting Collider's real `src/figma/publish-proof.json` — see §3                                                                                                           |
| `src/lib/tokens/figma-token-rail.test.ts`           |     4 | `deleted` — replaced by `ds-skills figma verify`. Case 3 is self-referential; case 4's `$themeOverrides` assertion is real coverage and must survive as a CLI check against the real artifact, not a package fixture |
| `.agents/skills/scripts/validate-artifact.test.mjs` |     6 | `package-owned` — moves with its subject                                                                                                                                                                             |

### 1.4 Data — stays in Collider

| path                                                  | lines | disposition                                                                       |
| ----------------------------------------------------- | ----: | --------------------------------------------------------------------------------- |
| `figma/token-sync.config.json`                        |    11 | `data`                                                                            |
| `src/figma/sync-ledger.json`                          |    21 | `data`                                                                            |
| `src/figma/publish-proof.json`                        |    22 | `data` — see §3                                                                   |
| `figma/token-rail.baseline.json`                      |  1435 | `data`                                                                            |
| `figma/plugin-manifest.baseline.json`                 |    11 | `data`                                                                            |
| `figma/token-rail.expectations.json`                  |    ~7 | `data` — does not exist yet; T17 creates it                                       |
| `.agents/skills/profiles/collider.json`               |    39 | `data` — Collider's vocabulary for the portable schemas                           |
| `scripts/fixtures/sync-ledger/*` (11)                 |     — | `package-owned` — they test the validator, not Collider                           |
| `scripts/fixtures/publish-proof/*` (5)                |     — | `package-owned` — same                                                            |
| `scripts/fixtures/sync-ledger/outcomes.baseline.json` |   207 | `data`, then `deleted` at T18 — it is migration evidence, not a standing artifact |

### 1.5 Already deleted by T3

Listed so they are accounted for rather than absent because the inventory came afterwards.

| path                                              | lines | disposition           |
| ------------------------------------------------- | ----: | --------------------- |
| `scripts/figma-variables-sync-enterprise.mjs`     |     9 | `deleted` — `990cbff` |
| `scripts/lib/figma-variables-sync-enterprise.mjs` |   237 | `deleted` — `990cbff` |

## 2. The carve-out: `reusable-component-status.mjs`

The one place where a Collider-owned generator legitimately consumes rail output. **The whole
generator is not claimed** — 611 of its 647 lines are about Storybook proof coverage, Chromatic
status, story inventory and claim profiles, none of which is rail.

`summarizeCt8b()` (36 lines) imports three things and reads two ledger fields directly:

```js
import { defaultSyncLedgerPath } from './figma-parity.mjs';
import { evaluateSyncLedgerConformance, loadAndValidateSyncLedger } from './sync-ledger.mjs';
…
ledger.promotion.parityMode          // 'deferred' | 'required'
ledger.promotion.highestEarnedLevel  // 'E-promotion-complete' etc.
```

**This is the input T8 needs and does not yet have.** An exit status cannot satisfy this caller;
it needs structured output. Concretely, `ds-skills ledger validate --json` must emit at least:

```json
{
  "ok": true,
  "errors": [],
  "state": "verified-current",
  "promotable": true,
  "ledgerPath": "src/figma/sync-ledger.json",
  "evidence": {
    "promotion.parityMode": "required",
    "promotion.highestEarnedLevel": "E-promotion-complete"
  }
}
```

`evidence` already exists in `evaluateSyncLedgerConformance`'s return value with exactly those
keys, so this is a serialization decision, not a new design. Collider keeps `summarizeCt8b()`,
rewritten to spawn the CLI and parse that JSON — roughly the same 36 lines, owning the _mapping
to a status rail_ and no rail policy.

## 3. Unreferenced, and the decision it forces

**`pnpm validate:publish-proof` has no caller.** Not in the `justfile`, not in
`governanceSteps`, not in any of the 8 CI jobs. So `src/figma/publish-proof.json` — Collider's
CT-7B proof record — is validated **only** by `figma-publish-proof.test.ts:23`, which happens to
load the real file inside a unit test.

That test line is the only thing keeping the artifact honest, and it is in a file otherwise
about fixtures. Three ways forward, and this needs a decision before T12:

1. **Wire it.** Add `ds-skills proof validate` to the governance chain, so the proof record is
   gated like the ledger. Most consistent — the two records are peers and one is gated.
2. **Keep the test as the gate**, and say so in the test rather than leaving it incidental.
3. **Delete the proof record.** It is a snapshot of a publish that already happened, and nothing
   reads it.

**Recommendation: (1).** CT-7B and CT-8B are peer contracts; gating one and not the other is an
accident, not a policy — the 229-line validator and its 5 fixtures were built for a gate that
was never connected.

## 4. Boundary — mentions Figma, is not the rail

Recorded so a later grep for "figma" does not re-open settled ground:

| path                                                                | why it is out                                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `scripts/lib/token-artifacts.mjs`                                   | Produces the artifact the rail consumes. Collider's token build is canonical and stays.          |
| `design-tokens/build/**`                                            | Same — the token pipeline is the thing being published, not the publisher.                       |
| `scripts/lib/component-mapping.mjs`, `reusable-component-mapping-*` | Figma **component** references and Code Connect. A different Figma concern from the token rail.  |
| `scripts/build-foundations-page.mjs`                                | Renders a Figma page from tokens via `figma-use`. Collider-specific authoring, no rail contract. |
| `scripts/lib/chromatic-status-validator.mjs`                        | Visual review. Not Figma at all.                                                                 |

## 5. Frozen post-retirement fixture outcomes

The approved reference for T12, which rewrites policy evaluation. Reconciled against T1's
pre-retirement capture (`scripts/fixtures/sync-ledger/outcomes.baseline.json`): every difference
is a deliberate retirement change, and **no diagnostic reason changed**.

| fixture                          | publish.mode          | frozen outcome                                                 | promotable | vs T1 baseline |
| -------------------------------- | --------------------- | -------------------------------------------------------------- | ---------- | -------------- |
| `blocked`                        | plugin-import-manual  | blocked-exception                                              | false      | unchanged      |
| `declared`                       | plugin-import-manual  | declared                                                       | false      | unchanged      |
| `incomplete`                     | plugin-import-manual  | incomplete                                                     | false      | unchanged      |
| `invalid-contradictory-mode`     | plugin-import-manual  | invalid — `[CT-8B_FORBIDDEN_PARITY_DEFERRED_REASON]`           | —          | mode only      |
| `invalid-deferred-complete`      | plugin-import-manual  | invalid — `[CT-8B_EARNED_LEVEL_REQUIRES_REQUIRED_PARITY]`      | —          | unchanged      |
| `invalid-missing-required-field` | plugin-import-manual  | invalid — `[CT-8B_MISSING_REQUIRED_KEY] + [CT-8B_INVALID_SHA]` | —          | unchanged      |
| `invalid-tokens-studio-carrier`  | plugin-import-manual  | invalid — `[CT-8B_INVALID_TOKENS_STUDIO_CARRIER_COMBINATION]`  | —          | unchanged      |
| `stale`                          | plugin-import-manual  | verified-stale                                                 | false      | unchanged      |
| `valid-carried`                  | tokens-studio-carried | verified-current                                               | true       | unchanged      |
| `valid-required`                 | plugin-import-manual  | verified-current                                               | true       | mode only      |
| `valid`                          | plugin-import-manual  | verified-current                                               | true       | unchanged      |

Two fixtures moved, both `rest-variables-oauth` → `plugin-import-manual`, both in that field
alone. `invalid-contradictory-mode` still fails on the **parity/carrier** contradiction, not on
an invalid mode — a fixture that starts passing, or fails earlier for an unrelated reason, is a
regression however green the suite looks. Its name is misleading and always was: the
contradiction it exercises is parity metadata, not publish mode.

## 6. Replacement commands, and what each caller actually consumes

The column that matters. An exit status is enough for some callers and not others, and that is
established here from the caller, not improvised at T17.

| caller today                                               | replacement                                                                                       | what the caller consumes                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `pnpm validate:sync-ledger` (governance step 6)            | `ds-skills ledger validate --ledger src/figma/sync-ledger.json --profile .agents/…/collider.json` | exit status + stderr diagnostics, printed on failure                                |
| `pnpm validate:figma-parity` (governance step 7)           | `ds-skills ledger parity --ledger … --profile …`                                                  | exit status + stderr                                                                |
| `summarizeCt8b()` in `reusable-component-status.mjs`       | `ds-skills ledger validate --json`                                                                | **structured JSON** — `ok`, `errors[]`, `state`, `promotable`, `evidence{}`. See §2 |
| `pnpm figma:plugin:build`                                  | `ds-skills figma plugin build --config figma/token-sync.config.json`                              | exit status; writes `figma/plugins/collider-token-sync/`                            |
| `pnpm figma:tokens:serve`                                  | `ds-skills figma serve --config figma/token-sync.config.json`                                     | long-running; a dev command, not a gate                                             |
| `src/lib/tokens/figma-token-rail.test.ts`                  | `ds-skills figma verify --config … --expect figma/token-rail.expectations.json`                   | exit status + a **rail-specific diagnostic**, which S2 depends on                   |
| `pnpm baseline:rail`                                       | `ds-skills figma baseline --config … --out …`                                                     | exit status; refuses to overwrite drifted baselines                                 |
| `node .agents/…/validate-artifact.mjs <schema> <instance>` | `ds-skills validate <schema> <instance> [--profile …]`                                            | exit status + stderr; already the tested contract                                   |
| `pnpm validate:publish-proof` (**no caller**)              | `ds-skills proof validate --proof src/figma/publish-proof.json`                                   | exit status — **if** §3(1) is adopted                                               |

## 7. What this inventory changes about the plan

- **T8 must define a `--json` output mode.** Discovered here, not in T8's criteria. Without it
  `summarizeCt8b()` cannot be rewritten and CI job 8 quietly loses its CT-8B rail.
- **A `ds-skills ledger parity` command is required.** `SPEC.md` §4.2 lists `ledger validate` but
  no parity command, and `validate:figma-parity` is a separate governance step with its own
  policy module.
- **`ds-skills figma serve` and `figma baseline` are not in §4.2 either.** Both are needed if
  Collider is to own no rail executables.
- **§3 needs a decision before T12.**

## 8. Verification

- Every path above traces to a caller, or is explicitly marked unreferenced (§3).
- Three CI jobs enforce this surface: **governance** (`pnpm govern:tokens`), **test-all**
  (`just test-all`), and **reusable-component-promotion**
  (`pnpm govern:reusable-component-promotion`). Any replacement must keep all three biting;
  wiring only into `just preflight` would leave every job green while the gate stopped working.
- Reviewed before T12 starts.
