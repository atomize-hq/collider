# T14 evidence: the release product

**Scope.** `SPEC.md` §7.5 asks four separate questions of any completion claim, and T14 is the
task where the third one — _installed-artifact-tested_ — is either earned or not. This records
what was built, what each gate proves, what happens when each gate is faulted, and what the
cutover rehearsal found. Nothing here has been published; every artifact is a staged candidate.

All work is in the pack (`atomize-hq/ds-skills`). **Collider's code is untouched.**

---

## 1. The builder: §7.3's optional-peer defect is gone

`pack-check` ran `pnpm add "$tarball" esbuild`. It installed the optional peer itself, so it
proved the plugin builds _when a consumer already has a bundler_ and never that a plain install
can. npm does not install optional peers, so `figma plugin build` worked by coincidence.

§7.3 offered two routes. The chosen one is the second: **the invariant plugin code is bundled
once when the package is built and shipped inside the release**, and only the consumer's config
is substituted at command time.

The seam is two identifiers. `plugin/code.ts` declares `__html__` and `__RAIL_CONFIG__` and never
defines them, and both survive bundling as free global references — so command-time assembly is
two textual substitutions of an identifier by a JSON literal, which is always valid in expression
position. The build refuses to publish a bundle in which either identifier appears anything other
than **exactly once**: a bundler change that resolved or renamed one would otherwise produce a
plugin with no config in it, silently.

Consequences:

- `esbuild` is no longer a peer dependency at all. It is the package's own build tool.
- `buildPlugin` is **synchronous**. Nothing it does is asynchronous any more, and the lint gate
  is what said so — the `async` keyword was describing a shape the function no longer had. The
  change propagated to `figma baseline` and to the CLI handlers.
- `pack-check` installs no bundler, and asserts none is present.

Two escapes were closed while writing this. The config is baked as a JS **object literal**, not a
string — baking it as a string parses, runs, and gives every field as `undefined`. And `<`, `>`,
U+2028 and U+2029 are escaped in the baked JSON, because `target: es2017` predates U+2028 being
legal inside a string literal.

**New evidence:** the assembled bundle is executed against a stub Figma in `node:vm`, and the
plugin's reply to `UI_READY` is asserted to carry the configured artifact URL. Substitution was
tested before; that the result still runs never was.

---

## 2. The release product

`scripts/release/stage.mjs` produces a complete candidate: five platform assets, `SHA256SUMS`,
both bootstraps with their identity baked in, and the reviewed record.

- **Deterministic archives, written here.** `tar` and `zip` were not shelled out to. GNU tar and
  bsdtar disagree about the flags that pin ownership and mtime, `zip` is not on every runner, and
  gzip stamps the current time into its header — so the one property that has to hold would have
  depended on which machine ran it. `scripts/release/archive.mjs` writes ustar and zip directly.
  **Staging twice produces byte-identical assets**, which is what lets "the bytes we tested" and
  "the bytes we publish" be one claim. Unpacking still uses the platform's own tools.
- **The payload tree is `package.json`'s `files` list**, so a `files` omission is a release
  omission too, rather than two lists that can disagree.
- **The release identity is stamped into the payload, not the working tree.** `release.json` and
  `skills/RELEASE.json` are written from one object, so within a single asset the CLI and its
  skills cannot disagree about which release they are. The working tree keeps saying `dev`, which
  is what it is — deriving `v0.3.0` from `package.json` would let an unstaged tree pass the check
  that exists to identify releases.

### The five-platform matrix

Every pair in §10.5 selects its own asset, verifies it against the baked digest, and installs a
working executable. The four Unix pairs run with a shimmed `uname`; **Windows runs the real
`install.ps1` under `pwsh`**, including its tampered-payload and unsupported-architecture
refusals. `pwsh` is a hard requirement of the gate, with no escape hatch: claiming the PowerShell
installer works because the bash one does is exactly the overclaim §7.5 forbids.

Because the payload is platform-independent, _every_ asset would verify — so the gate asserts the
installer **named its own asset**, not merely that something installed. That assertion only
became possible after the installers were changed to report which asset they selected.

### The trust chain, each link tested

> reviewed record → verified bootstrap bytes → verified payload bytes → installed executable

| Link                       | Negative test                                                |
| -------------------------- | ------------------------------------------------------------ |
| record pins the bootstrap  | an appended byte changes the bootstrap's digest              |
| bootstrap enforces payload | **a modified payload with a matching modified `SHA256SUMS`** |
| integrity is mandatory     | a release with no `SHA256SUMS` fails rather than warning     |
| identity is baked          | the ungenerated template refuses to run                      |

The decisive one is the second. A merely corrupted archive proves only that the weaker check
works, because `SHA256SUMS` ships beside the archive and whoever can replace one replaces both.
The reviewed record is held unchanged throughout, and rejection is asserted to happen **before**
anything is unpacked — not merely before it is used.

### Lifecycle (§10.6)

Reinstall is idempotent. A failed install leaves the existing one intact and working — proven
with a canary file, not by inspection. Paths containing spaces work, from any working directory.
Versions coexist, with no `current` pointer and no symlink in the prefix root that one project
could use to override another's selection. Unsupported OS, unsupported architecture and an
unsupported Node each fail with the supported list and the exact requirement.

**Found by writing a test wrongly:** pointing the `v0.4.0` bootstrap at a mirror serving only
`v0.4.1` produced a 404. That is the contract working — the asset _is_ the version — so it is now
an explicit assertion rather than a bug I had to explain to myself.

---

## 3. The decisive consumer scenario

Two data-only consumers, outside both checkouts, with no product dependencies, no credentials and
no ambient builder, running the installed release against their own data. Every command, with
valid and invalid inputs, and the 0/1/2 exit contract checked at each.

They differ in every profiled dimension — namespace, artifact path, origin, plugin identity,
theme names, collection name, and the permitted publish modes. §7.3: copying one layout under
another directory name proves nothing about portability.

Their expected Figma observation is **hand-computed from the artifact**, not produced by the
package's own flattener. An expectation generated by the code under test agrees with it by
construction. It matched.

**`figma serve` is started, fetched, and stopped**, and the port is asserted to stop listening.

### The read boundary, measured rather than assumed

"It worked" is weak evidence that the CLI reaches into nothing it does not own: a stray absolute
path into the development checkout resolves fine on the machine that has one. So the installed
CLI is run with `fs` instrumented, and every path it opens is checked against exactly two
directories — its own install prefix and the consumer's data. Faulted with a single
`fs.existsSync` into the development checkout, it goes red.

---

## 4. What the new gates found

1. **`--port 0` reported port 0** and bound the two loopback families to two _different_
   ephemeral ports. A "serve on any free port" that prints a URL nothing can connect to.
2. **`ds-skills validate` required a path into the package's own tree.** A consumer had to write
   `<prefix>/lib/schemas/sync-ledger.schema.json` — reaching into the package's layout in order
   to use the package, which is this migration's coupling reintroduced from the other side. A
   shipped schema is now named (`validate sync-ledger …`), a path is still accepted for a
   consumer's own schema, and an unknown name lists what is available. A file named
   `sync-ledger` in the working directory does not shadow it.
3. **The placeholder-command assertion had gone vacuous a third time.** It asserted every command
   exits non-zero with no arguments, which is a proxy, and `ds-skills skills` legitimately
   succeeds with none. Rather than an inline exception that would outlive its reason, the
   registry gained `requiresArguments` — a property of the command, checkable.
4. **CI ran neither the lint gate nor the LOC guard.** The workflow listed steps individually
   while `pnpm check` listed nine; that is how the two drift apart. CI now runs `pnpm check`, and
   installs `tokei` so the LOC guard cannot be the thing that silently never runs.

---

## 5. The cutover rehearsal

Run against a **disposable clone** of Collider, with the staged candidate, before anything is
published. The consumer's working tree is asserted untouched afterwards.

**Passing already, through the installed release, against Collider's real data:**

- `figma verify` against the committed `figma/token-rail.baseline.json` — **S3**
- `figma plugin build` reproduces `figma/plugin-manifest.baseline.json` **byte for byte** — **S4**
- `figma baseline --check` against both committed references
- `figma serve` answers at the URL the plugin is built with

**Five findings, one root-cause pair. Both are consumer data migrations, and both belong to T17:**

1. **`.agents/skills/profiles/collider.json` is missing `destination-name` and
   `destination-figma-file`.** T12 made them required profile keys. Every record command exits 2
   with `[PROFILE_MISSING_KEY]`, which also means `--json` produces nothing — so the promotion
   job would have no rail projection to read.
2. **`src/figma/sync-ledger.json` is still `ledgerVersion: "2"` with no `publication` block.**
   The schema requires `"3"`, and requires a publication whenever materialization has run.

Neither is a package defect. Both are exactly what this rehearsal exists to surface: an immutable
release cannot be amended, so discovering these after publication would have cost a release.

**A sixth finding was mine, not Collider's**, and is worth recording because it will recur: the
manifest baseline records its own `source` path, so building the plugin into a scratch directory
reports drift that is only a different location. The cutover must build where the consumer builds.

---

## 6. Scope and what is still open

- `SPEC.md` §10.1, §10.4 and §10.5 were amended, each with the amendment marked in place. §10.5's
  original rationale — per-platform assets _because the builder carries a native binary_ — stopped
  being true when the builder was prebuilt. **Four of the five digests in the record are now
  identical.** That is expected, it is documented in §10.5, and a reviewer who has not read it
  will reasonably suspect a staging bug.
- §4.5 and the boundary contract §5 still say "four constants" where T11 found nine. Flagged in
  the second reconciliation doc; still unedited.
- T11's remaining item — the two rail-referencing skills still describe `pnpm`/`node` invocations
  — is deliberately left for T17, when the commands actually change.
