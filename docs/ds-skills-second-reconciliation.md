# The proof–ledger relationship, and the second reconciliation

**T12 of the `ds-skills` migration.** Implements
[`ds-skills-boundary-contract.md`](ds-skills-boundary-contract.md) §4 and §5, and records the
fixture reconciliation `SPEC.md` §5.2 requires to stay **separately reviewable** from T3's.

The rule that governs this document: a change caused by the retirement (T3, frozen in the T9
inventory §5) and a change caused by relationship enforcement (T12) are different claims, and
neither may absorb the other. So the T9 table is not edited. This is a second table, and every
changed input names its cause.

Everything below is measured against the implementation in `atomize-hq/ds-skills` at `519c96d`.

## 1. What was implemented

| Area                                                                | Where                                 |
| ------------------------------------------------------------------- | ------------------------------------- |
| `ledger validate` / `ledger parity` / `proof validate` / `validate` | `src/cli/rail.ts`, `src/cli/run.ts`   |
| The `--json` result and its serialization                           | `src/cli/result.ts`                   |
| The publication binding — agreement, sufficiency                    | `src/figma/publication-binding.mjs`   |
| The consumer profile                                                | `src/figma/profile.mjs`               |
| The status projection                                               | carried in the result's `rail` object |

The **hold point is met**: `ledger validate --json` returns the state, promotability, the nine
evidence keys, and the freshness / outcome / reason codes / source revision a status caller reads
today. Nothing requires the caller to open the ledger or the proof.

### 1.1 The binding

```json
"publication": {
  "proof": "./publish-proof.json",
  "sha256": "<sha256 of the proof file's bytes, as read>"
}
```

Bound to bytes, not to a path, and never to a re-serialization — so a reformat is a detected
change rather than an invisible one. Recomputing the digest is what a "fix" would look like, and
it is the one repair the design exists to prevent; there is a test that names it as such.

### 1.2 Agreement and sufficiency stay apart

**Agreement** — the six facts of §4's table hold for the exact bound record. **Sufficiency** —
that publication supports what the ledger claims _now_. Sufficiency runs **only once agreement
holds**, so a mismatched proof can never be reported as an unsupported claim, and a reader is
never sent looking for a publication when the real finding is a mismatch.

**An honest limit, recorded rather than hidden.** With facts 1–6 all enforced, sufficiency is
_subsumed_ by the ledger's own `CT-8B_PUBLISH_VALID_REQUIRES_CURRENT_REVISION` guardrail: both
fire on the same underlying state. It is kept because it reports that state **from the
publication's side**, with its own code, which is what tells a caller that re-attesting is not
the fix. Anyone reading it as an independent check would be overcounting the coverage.

### 1.3 Two branches that valid records cannot reach

- **Fact 1 (artifact path).** Both validators pin `artifact.path` to the same profile key, so two
  individually-valid records cannot disagree on it. The comparison is kept as defence in depth if
  that pinning is ever relaxed, and is exercised by driving the binding directly with a ledger the
  CLI would already have rejected — labelled as such in the test, not counted as a live check.
- **The profile re-checks §4 asks for in rows 1 and 4** ("and both equal the profile's declared
  …") are **not** repeated in the binding. Each validator already made exactly that comparison
  against exactly that profile key. Repeating it would be a second representation of one rule —
  the duplication §4.5 exists to close.

Fact 4's _mismatch_ branch is live and load-bearing: only the **proof** pins its destination to
the profile, so this comparison is what ties the ledger to the declared destination at all.

## 2. The second reconciliation — 11 ledger fixtures

Every fixture changed. **No fixture's outcome changed**: same state, same promotability, same
diagnostics as the T9 table freezes.

| fixture                          | inputs changed                                  | cause                                     | outcome   |
| -------------------------------- | ----------------------------------------------- | ----------------------------------------- | --------- |
| `blocked`                        | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `declared`                       | version; destination; _no publication_          | relationship (absence rule)               | unchanged |
| `incomplete`                     | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `invalid-contradictory-mode`     | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `invalid-deferred-complete`      | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `invalid-missing-required-field` | version; destination; _no publication_          | relationship (absence rule)               | unchanged |
| `invalid-tokens-studio-carrier`  | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `stale`                          | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `valid`                          | version; destination; **+publication**; wording | relationship; portability; **disclosure** | unchanged |
| `valid-carried`                  | version; destination; **+publication**          | relationship; portability                 | unchanged |
| `valid-required`                 | version; destination; **+publication**          | relationship; portability                 | unchanged |

Reading the causes:

- **relationship** — `ledgerVersion` `"2"` → `"3"`, and the conditionally-required `publication`
  key. Two fixtures gain no publication because their materialization has not run, which is the
  absence rule doing its job rather than an omission.
- **portability** — `publish.figmaFile` normalized to the fixture profile's declared destination.
  It had been a per-fixture label; nothing reads it in any evaluation, which is why no outcome
  moves. It has to agree now because fact 4 compares it.
- **disclosure** — `valid`'s `parityDeferredReason` named the consumer in prose. See §4.

### 2.1 The status-rail baseline is not rebaselined

`__fixtures__/status-rail.baseline.json` is T10's capture from the **pre-move** consumer
implementation. Its `sourceVersionOrRevision` values say `ledgerVersion:2`, and they still do.
The test substitutes `ledgerVersion:2|` → `ledgerVersion:3|` at comparison time and asserts that
the revision segment is byte-identical, so:

- the pre-move capture stays a pre-move capture, and
- a fixture that quietly changed **revision** under cover of the schema bump fails.

Rewriting the file would have made the reconciliation unfalsifiable. This is the same discipline
S5 applies to `outcomes.baseline.json`: the evidence keeps naming what it was captured against.

### 2.2 One diagnostic-surface change, with its cause

`CT-8B_INVALID_KEYS` is gone. The ledger's top level now uses the same
`CT-8B_MISSING_REQUIRED_KEY` / `CT-8B_UNEXPECTED_KEY` codes every nested object already used,
because `publication` is conditionally optional and the old exact-key check could not express
that. **Cause: relationship.** No fixture exercised `CT-8B_INVALID_KEYS`, so no outcome moves —
but a code disappearing is an interface change, and it is recorded here rather than discovered by
a consumer.

## 3. The proof fixtures

The five standalone proof fixtures keep their outcomes and gain nothing; only their destination
identity changed (§4). Nine **companion** proofs are new — one per ledger fixture whose
materialization has run — and are generated to agree with their ledger by construction.

That generation is fine for fixtures and forbidden in the validator, and the distinction matters:
these are _inputs that must agree_ so the agreement path can be exercised at all. **Every
disagreement case is hand-authored**, never derived from the other record.

New cases, per `SPEC.md` §5.2's "each record individually valid while their shared claims
disagree" — each one asserts both records pass their own validator first, so only the
cross-record check can catch them:

| case                             | fact | direction                                        |
| -------------------------------- | ---- | ------------------------------------------------ |
| attested revision ≠ verified     | 2    | proof behind the ledger                          |
| attested revision ≠ verified     | 2    | ledger behind the proof                          |
| modes disagree, carriers with it | 3, 6 | both reported together — see below               |
| destination disagrees            | 4    | ledger names a file the attestation does not     |
| materialization disagrees        | 5    | ledger claims a pass the attestation contradicts |
| missing required proof           | —    | `passed` and `failed`, both                      |
| forbidden proof                  | —    | `not-run` carrying a publication                 |
| unresolvable / malformed proof   | —    | never ignored                                    |
| digest mismatch                  | —    | never resolved by recomputing                    |
| valid historical proof           | —    | fails as unsupported claim, not invalid proof    |
| legitimately stale ledger        | —    | **passes** — history is not currentness          |

**Fact 6 always reports with fact 3.** Carrier is pinned to mode inside each record, so an unequal
carrier pair is only reachable through an unequal mode pair. That is not an argument against
ruling it in — it is one comparison, and leaving it out would be an arbitrary hole — but it does
mean fact 6 has no independent failure of its own.

## 4. Nine consumer constants, not four

`SPEC.md` §4.5 lists four. The measured count was nine:

| #   | constant                   | was                                          | now                              |
| --- | -------------------------- | -------------------------------------------- | -------------------------------- |
| 1   | `publishProofPilotName`    | `"Collider"`                                 | profile `destination-name`       |
| 2   | `publishProofPilotFile`    | the real Figma file key                      | profile `destination-figma-file` |
| 3   | `publishProofArtifactPath` | `design-tokens/dist/figma/tokens.json`       | profile `artifact-path`          |
| 4   | `syncLedgerArtifactPath`   | the **same literal, declared independently** | the **same** profile key         |
| 5   | `defaultSyncLedgerPath`    | `src/figma/sync-ledger.json`                 | no default; `--ledger` required  |
| 6   | `defaultPublishProofPath`  | `src/figma/publish-proof.json`               | no default; `--proof` required   |
| 7   | `syncLedgerUsage`          | `node scripts/validate-sync-ledger.mjs …`    | `ds-skills ledger validate …`    |
| 8   | `figmaParityUsage`         | `node scripts/validate-figma-parity.mjs …`   | `ds-skills ledger parity …`      |
| 9   | `publishProofUsage`        | `node scripts/validate-publish-proof.mjs …`  | `ds-skills proof validate …`     |

Rows 3 and 4 are the point §4.5 was making: two modules declared the same literal with nothing
checking they agreed. One profile key ends that by construction. Rows 5 and 6 mattered because a
default path is a consumer assumption that fires only when an argument is omitted — the case
least likely to be tested. Rows 7–9 named scripts T17 deletes.

**A profile declares, it does not relax.** The supported `ledgerVersion` and `proofVersion`, the
publish-mode enum, the carrier/mode rule, the SHA and digest formats and the rejection of
`rest-variables-oauth` stay in code. A profile may **narrow** the mode set and may not widen it,
and an attempt to override a portable invariant is **refused, not ignored** — silently dropping
the key would let a consumer believe it had relaxed something that still holds, which is worse
than either honouring or refusing it. Tested for every invariant key.

The two-consumer test is genuinely two consumers: different artifact path, different destination
identity, a narrowed mode set, and each record set rejected under the other's profile. Copying one
layout under another name would have proved only that the validators can read two files.

## 5. Findings

### 5.1 The package was carrying a real Figma file key into a public repository

Four proof fixtures embedded the pilot file key, five named the consumer, and one ledger fixture
named it in prose. **Nothing had been pushed**, so this was contained — but the reason it survived
T11's disclosure review is worth keeping: the boundary check reads **modules only**, on the
reasoning that "a fixture naming a consumer is sample data". That reasoning is right for coupling
and wrong for disclosure. In a public package, sample data is published data.

Closed two ways: a test over **every shipped file** (no consumer name, no `figma://file/<real
key>`), and the same two checks repeated in `pack-check.sh` against the **installed tarball** —
because a `files:` entry and a shipped file are different claims. Both proved to fail by
reintroducing each identifier.

The one exemption is `boundary.test.ts`, which must name what it forbids in order to look for it.
The Figma-key check has no exemption at all: a test may name a repository, nothing may embed a
real key.

### 5.2 A pack-check assertion had stopped testing what it claimed

`pack-check.sh` asserted that `ledger validate --ledger nope.json` exits 2 with empty stdout, as
evidence that an unimplemented command cannot look like a clean run. Once `ledger validate` was
implemented it still exited 2 with empty stdout — for a completely different reason (no
`--profile`). Green, and testing nothing it claimed. Repointed at `figma verify`, which is T13's
and still genuinely unimplemented.

This is the fourth filter-shaped lie in this migration, after `grep -v node_modules` matching line
content (T7), `grep -i plate` matching "templates" (T11), and the `jq` filter that dropped rows
whose field was `empty` (T16a). The pattern is the same each time: the check kept passing after
the thing it was checking moved.

### 5.3 What the gate proves

_This attestation is well formed, refers to the expected destination and artifact, and
consistently supports the ledger's present claim._ It does **not** establish that the claimed
human import happened, or that the remote Figma file still holds those values. Both the human
output and the `--json` result say so — `[RAIL_SCOPE] validated attestation and consistency; not
observed remote synchronization` — and only on commands that actually consulted a proof.

## 6. Scope note

`SPEC.md` §4.5 and the boundary contract §5 will read "four constants" until someone reconciles
them with §4 above. That correction belongs to whoever next edits those documents; changing them
here would edit a contract from inside its own implementation.

Typing the relocated `.mjs` modules (`checkJs`, ~99 measured implicit-any errors) is **not** T12's
— it is `docs/backlog.md`'s, and it was never in this task's acceptance criteria.
