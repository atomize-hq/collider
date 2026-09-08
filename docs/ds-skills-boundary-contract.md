# Boundary contract — every caller, every failure, every shared fact

**T8 of the `ds-skills` migration.** Restructured by the round-4 review from a CLI scaffold into
the contract that gates T10–T14. The reason it gates them: everything downstream is immutable once
T15 publishes, and a release cut without a command, without a stable machine interface, or without
the proof–ledger relationship specified cannot be amended — only replaced.

This document specifies. It does not implement. T12 and T13 implement it, and §6 says which owns
what.

Companion documents: [`ds-skills-disposition-inventory.md`](ds-skills-disposition-inventory.md)
(T9 — what exists and where it goes) and
[`ds-skills-execution-contract.md`](ds-skills-execution-contract.md) (T16a — where it runs and what
enforces it).

## 1. The caller-contract matrix

T9 recorded replacement commands. Round 4 requires seven columns per caller, because a replacement
command that satisfies the caller's happy path and not its failure path is not a replacement.

| Caller                                      | Replacement                          | Inputs                        | Output consumed                   | On failure                                    | Side effects           | Owner |
| ------------------------------------------- | ------------------------------------ | ----------------------------- | --------------------------------- | --------------------------------------------- | ---------------------- | ----- |
| `validate:sync-ledger` (governance step 6)  | `ledger validate --ledger --profile` | ledger path, profile          | exit status, stderr diagnostics   | **fails fast**, exit code propagates to job 1 | none — read-only       | T12   |
| `validate:figma-parity` (governance step 7) | `ledger parity --ledger --profile`   | ledger path, profile          | exit status, stderr               | **fails fast**, same chain                    | none — read-only       | T12   |
| `validate:publish-proof` (**newly wired**)  | `proof validate --proof --profile`   | proof path, profile           | exit status, stderr               | **fails fast**, same chain                    | none — read-only       | T12   |
| `summarizeCt8b()`                           | `ledger validate --json`             | ledger path, profile          | **structured result** — see §3    | **collapses — see §2.2**                      | none — read-only       | T12   |
| `pnpm figma:plugin:build`                   | `figma plugin build --config`        | config path                   | exit status                       | non-zero fails `just`                         | **writes** plugin dir  | T13   |
| `pnpm figma:tokens:serve`                   | `figma serve --config`               | config path                   | long-running; readiness on stderr | non-zero fails `just`                         | **binds a port**       | T13   |
| `figma-token-rail.test.ts`                  | `figma verify --config --expect`     | config, expectations          | exit status + rail diagnostic     | non-zero fails job 4 — **S2 depends on this** | none — read-only       | T13   |
| `pnpm baseline:rail`                        | `figma baseline --config --out`      | config, out dir, `--force`    | exit status                       | non-zero; refuses to overwrite drift          | **writes 3 baselines** | T13   |
| `node …/validate-artifact.mjs`              | `validate <schema> <instance>`       | schema, instance, `--profile` | exit status + stderr              | non-zero; already the tested contract         | none — read-only       | T12   |

Nine callers, nine commands, no orphans in either direction. Every T9 disposition has a
destination; every executable destination has an owning task.

## 2. Failure-consumer inspection

Round 4: _"A correctly failing CLI can still leave CI green if a wrapper swallows its error or
treats missing output as an empty result."_ So each caller was read, not assumed. Eight of the nine
behave well. One does not, and the reason is worse than a swallowed error.

### 2.1 The eight exit-status callers are sound

`runTokenGovernance` iterates `governanceSteps` and **returns the first non-zero exit code
immediately** (`token-governance.mjs:31-44`); `runTokenGovernanceCli` maps an uncaught throw to
`[UNEXPECTED_RUNTIME_FAILURE]` and exit 3; `govern-tokens.mjs` calls `process.exit()` with it. A
failing validator fails `pnpm govern:tokens`, which fails job 1 and the pre-push hook. `just`
recipes fail on non-zero by default.

**Nothing needs redesigning for these.** The requirement they impose on the CLI is narrow and
absolute: **a diagnostic on stderr and a non-zero exit**, and no interactive prompt — E2 and E3 are
both non-interactive.

### 2.2 `summarizeCt8b()` collapses every failure into one shape

`buildErroredRail` (`reusable-component-status.mjs`) is reached through `readJsonWithValidation`,
which catches **any** thrown error and also treats a non-empty `errors` array as a load failure. So
a missing ledger, malformed JSON, a schema violation and a runtime crash all produce the same rail:

```js
{ freshness: 'missing',
  outcome: base.claimRelevant ? 'unsatisfied' : 'not-applicable',
  reasonCodes: base.claimRelevant ? ['ct8b-missing'] : [] }
```

**"Could not evaluate" is already indistinguishable from "does not apply"** whenever CT-8B is not
claim-relevant — which is three of the five change classes. This predates the CLI. When
`summarizeCt8b()` is rewritten to spawn `ds-skills`, a missing executable, a non-zero exit and an
unparseable payload all land in that same `catch`, and the rail reports `not-applicable` with no
reason code. That is precisely the failure round 4 named, already built.

**The fix is a contract requirement on both sides**, in §3 and in T17:

- The CLI emits a parseable result on **expected** validation failure — nonconformance is a
  result, not an error.
- The rewritten `summarizeCt8b()` distinguishes three cases and never conflates them: a parsed
  result (conformant or not), an **unavailable evaluator** (missing binary, crash, timeout,
  unparseable stdout, unsupported result version), and a genuinely not-applicable rail.
- An unavailable evaluator is **never** `not-applicable`. It is its own outcome with its own
  reason code, so it can be seen.

### 2.3 What that rail actually enforces today: nothing

Worth stating plainly, because the T9 inventory's framing — "CI job 8 quietly loses its CT-8B
rail" — turned out to be too generous. There is no CT-8B gate in CI to lose. Four independent
mechanisms, each measured:

1. ~~**No required check exists.**~~ **Closed 2026-09-06** — ruleset `main` (22410608) now
   requires `Governance` and `Test All`. Job 8's context is deliberately _not_ required, because a
   skipped job reports Success to a required check
   ([`ds-skills-execution-contract.md`](ds-skills-execution-contract.md) §5.1–§5.2). The other
   three mechanisms below are untouched, so the rail is still inert — three ways over.
2. **Job 8 does not run.** It `needs: chromatic-review`, which fails on BL-2, and a failed `needs:`
   skips the dependent job. Latest `main` run: 1–6 green, 7 failure, 8 **skipped**.
3. **CI cannot reach blocking mode.** `blockingAllowed` requires `changeClassSource === 'explicit'`;
   CI passes `REUSABLE_COMPONENT_PROMOTION_CHANGE_CLASS: unknown`, which makes it `heuristic`, so
   `enforcementMode` is `advisory` and the gate returns 0 regardless.
4. **CT-8B reaches `blockingReasons` only when `consumer === 'release'`.** CI sets
   `REUSABLE_COMPONENT_PROMOTION_CONSUMER: ci`.

So CT-8B's real CI enforcement is **job 1**, through `validate:sync-ledger`'s exit status — a hard
gate that fails the job, the pre-push hook, and now a required check. Job 8 **reports**; it does
not enforce, and requiring it would not change that — it would only hide it behind a green check.

Two corrections follow, and both matter for how this work is judged:

- **`SPEC.md` §5.4's "three jobs enforce this surface" is wrong.** Two enforce (1 and 4); the third
  reports. The replacement must keep **two** gates biting and **one** report accurate.
- **`--json` is required for report correctness, not to preserve a gate.** That is a smaller claim
  than T9 made and it is still sufficient: a status report that silently reads `not-applicable`
  because the tool is missing is worse than no report, and it is the shape this migration would
  otherwise introduce.

## 3. The `--json` result contract

A versioned interface another program is written against, not a formatting flag.

```json
{
  "resultVersion": "1",
  "command": "ledger validate",
  "ok": false,
  "state": "verified-stale",
  "promotable": false,
  "ledgerPath": "src/figma/sync-ledger.json",
  "diagnostics": [
    {
      "code": "CT-8B_PUBLISH_VALID_REQUIRES_CURRENT_REVISION",
      "field": "verification.lastVerifiedRevision",
      "message": "…"
    }
  ],
  "evidence": {
    "artifact.path": "design-tokens/dist/figma/tokens.json",
    "artifact.revision": "dc97a26…",
    "publish.mode": "plugin-import-manual",
    "publish.tokensStudioCarrier": false,
    "verification.materializationStatus": "passed",
    "verification.lastVerifiedRevision": "dc97a26…",
    "promotion.parityMode": "required",
    "promotion.highestEarnedLevel": "E-promotion-complete",
    "exceptions.openBlockingCount": 0
  }
}
```

`evidence` is `evaluateSyncLedgerConformance`'s existing evidence map, verbatim — nine keys,
including `promotion.parityMode` and `promotion.highestEarnedLevel`, the two `summarizeCt8b()`
reads straight off the ledger today. That is what makes this a **projection** rather than a
passthrough: Collider stops opening the ledger.

Rules, all of them load-bearing:

- **`resultVersion` is independent** of `ledgerVersion` and of the release version. A consumer
  seeing an unsupported value **fails**; it does not best-effort parse.
- **`diagnostics[].code` is the interface.** The bare `CT-8B_…` / `CT-7B_…` identifiers, without
  the bracket punctuation the human formatter adds. Renaming one is a breaking change; rewording
  `message` is not.
- **Deterministic ordering** of `diagnostics` and of `evidence` keys.
- **stdout carries the result and nothing else.** Logs, progress and human formatting go to stderr.
- **A completed evaluation always emits a result**, conformant or not. `ok: false` with populated
  `diagnostics` is a _successful evaluation reporting nonconformance_.

### 3.1 Exit codes

| Code | Meaning                                                                                 | `--json` stdout     |
| ---- | --------------------------------------------------------------------------------------- | ------------------- |
| 0    | Evaluated; conformant                                                                   | result, `ok: true`  |
| 1    | Evaluated; **not** conformant                                                           | result, `ok: false` |
| 2    | **Could not evaluate** — missing input, unreadable file, unknown profile, bad arguments | **nothing**         |
| 3    | Unexpected runtime failure                                                              | **nothing**         |

The line between 1 and 2 is the whole point: 1 is an answer, 2 is the absence of one. A caller must
be able to tell them apart without parsing prose, and the deliberate asymmetry — no stdout at all
on 2 and 3 — means a caller that parses stdout cannot mistake a non-answer for an empty result.

`runTokenGovernance` already propagates any non-zero code unchanged, so the exit-status callers
need no special handling. **A subprocess helper that throws on non-zero exit must not discard the
result on stdout** when the code is 1 — that payload is the reason `--json` exists.

## 4. The proof and the ledger — per-fact relationships

`SPEC.md` §5.5 sets the rule: the ledger's duplicated facts become a **checked projection** of an
explicitly identified proof. This is that rule made specific.

| #   | Fact              | Proof (source)           | Ledger (projection)                  | Required relationship                                                      |
| --- | ----------------- | ------------------------ | ------------------------------------ | -------------------------------------------------------------------------- |
| 1   | artifact path     | `artifact.path`          | `artifact.path`                      | equal, **and** both equal the profile's declared artifact path             |
| 2   | artifact revision | `artifact.gitSha`        | `verification.lastVerifiedRevision`  | equal. Binds the ledger's _verification_ claim to the attested publication |
| 3   | publish mode      | `mode`                   | `publish.mode`                       | equal, and both in the portable enum                                       |
| 4   | destination       | `destination.figmaFile`  | `publish.figmaFile`                  | equal, **and** both equal the profile's declared destination               |
| 5   | materialization   | `materialization.status` | `verification.materializationStatus` | `passed`↔`passed`, `failed`↔`failed`. `not-run` **must have no proof**     |
| 6   | carrier           | `carrier.used`           | `publish.tokensStudioCarrier`        | equal — **ruled in**; see below                                            |

**Fact 6 is ruled in.** Each record already checks its carrier flag against its own `mode` and
never against the other's. Since fact 3 forces the modes equal, an unequal carrier pair is a
contradiction that both records currently accept. It costs one comparison to close, and leaving it
out would be an arbitrary hole in an otherwise complete set.

**Fact 2 deliberately binds `verification.lastVerifiedRevision`, not `artifact.revision`.** The
ledger's `artifact.revision` is what the tokens are _now_; `lastVerifiedRevision` is what was
_verified_. The proof attests to a publication, so it constrains the verification claim. The ledger
already self-checks `lastVerifiedRevision === artifact.revision` for `verified-current`, so
currentness stays where it is — §4.2 keeps it there on purpose.

### 4.1 The binding

The ledger names the proof it projects. Not "the proof file", which would let any record satisfy
the check:

```json
"publication": {
  "proof": "src/figma/publish-proof.json",
  "sha256": "<digest of the proof file's bytes>"
}
```

A path alone is a location, not an identity. The digest makes the binding exact, so editing the
proof without updating the ledger is a detected change rather than a silent re-pointing.

**Version consequence, stated rather than discovered:** this adds a required key, so
`ledgerVersion` moves `2` → `3`, `requireLiteral(data.ledgerVersion, '2')` moves with it, and all
11 fixtures change. `SPEC.md` §5.2 governs how: a **second** reconciliation table, separate from
T9's, in which every changed outcome names its cause. A retirement-driven change and a
relationship-driven change are different claims and neither may absorb the other.

### 4.2 Agreement and sufficiency are two checks

- **Agreement** — the six facts hold, for the exact proof the binding names.
- **Sufficiency** — that publication supports what the ledger claims _now_, under the existing
  staleness and promotion rules.

A proof attesting revision A while the ledger claims `verified-current` at revision B **agrees**
(nothing contradicts) and is **insufficient**. It fails as `CT-8B_PUBLICATION_DOES_NOT_SUPPORT_CLAIM`
— never as an invalid proof, and **never** repaired by rewriting the attestation to B. A stale
proof is a real signal that a publication has not happened yet.

### 4.3 Absence

| Ledger's claim                            | Proof required?                                                |
| ----------------------------------------- | -------------------------------------------------------------- |
| `materializationStatus: not-run`          | **No.** `publication` must be absent; a proof here is an error |
| `materializationStatus: failed`           | **Yes** — a failed attempt is still an attestation             |
| `materializationStatus: passed`           | **Yes**, and it must be sufficient per §4.2                    |
| `publication` present but proof missing   | **Error** — a named binding that resolves to nothing           |
| `publication` present but digest mismatch | **Error** — never resolved by recomputing the digest           |

A pre-publication repository is valid with no proof. A repository claiming current materialization
cannot pass by omitting one. A present-but-malformed proof is never ignorable.

### 4.4 What the gate proves

It establishes: _this attestation is well formed, refers to the expected destination and artifact,
and consistently supports the ledger's present claim._

It does **not** establish: _the claimed human import happened, and the remote Figma file still holds
those values._

The CLI's human output and its `--json` result must both say **validated attestation and
consistency**, not observed synchronization. That limit is not an argument for deleting the proof
or restoring the retired REST rail — it is why the retired rail's absence costs nothing.

## 5. Configuration ownership

Per `SPEC.md` §4.5. The four constants enforced today by `requireLiteral` against a
Collider-specific literal move into the profile as **declared expectations**, still compared by
literal equality:

| Constant                   | Becomes profile key     | Required when                            |
| -------------------------- | ----------------------- | ---------------------------------------- |
| `publishProofPilotName`    | `destination.name`      | always                                   |
| `publishProofPilotFile`    | `destination.figmaFile` | always                                   |
| `publishProofArtifactPath` | `artifact.path`         | always                                   |
| `syncLedgerArtifactPath`   | `artifact.path`         | **same key** — the duplication is closed |

The last row is the point. Two modules declared the same literal independently, with nothing
checking they agreed. One profile key ends that by construction rather than by comparison.

Portable invariants stay in code and stay unconfigurable: the supported `ledgerVersion` and
`proofVersion`, the publish-mode enum, the carrier/mode agreement rule, the SHA format, and the
rejection of `rest-variables-oauth`. **A profile cannot re-enable a retired mode or relax an
invariant**, and T12 tests that it cannot.

## 6. Ownership, and what T8 does not decide

| Area                                                             | Owner         |
| ---------------------------------------------------------------- | ------------- |
| `ledger validate` / `parity` / `proof validate`, `validate`      | T12           |
| The proof–ledger relationship and the second reconciliation      | T12           |
| The `--json` result and the status projection                    | T12           |
| Constant generalization and the profile schema                   | T12           |
| `figma plugin build` / `verify` / `drift` / `serve` / `baseline` | T13           |
| The durable T6 substitution tests                                | T13           |
| Rewriting `summarizeCt8b()` to §2.2's three-case contract        | T17           |
| The `bin/ds-skills` executable and dispatch                      | T8 (scaffold) |

No overlap, and no entry without an owner.

**T8 does not decide** the plugin's `networkAccess` posture beyond recording it as a constraint
(T13 tests it), the required-check binding (T16a raised it; it is the user's call), or whether
BL-2's Chromatic failure gets fixed (out of scope — fixing it here would put a Chromatic change in
a tooling diff).
