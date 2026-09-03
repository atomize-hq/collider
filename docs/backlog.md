# Backlog

Deferred work with a decision already made. Items here are scoped and agreed but not
scheduled — they are not open questions. Anything still undecided belongs in a plan doc,
not here.

---

## BL-1 — `figmaComponentRef` needs dual-format support, not a single canonical form

**Raised:** 2026-09-03, from the repo staleness audit.
**Surface:** `storybook/component-specs/*.json` → `downstreamHooks.figmaComponentRef` (32 files).

### What's there now

The field carries two grammars, split roughly in half, with no validator on the shape:

| Form             | Example                                                                 | Count |
| ---------------- | ----------------------------------------------------------------------- | ----- |
| `fileKey#nodeId` | `23PLdynlRYoBYQx9teoC8A#2277:93`                                        | 17    |
| Figma web URL    | `https://www.figma.com/design/23PLdynlRYoBYQx9teoC8A?node-id=2237-1723` | 15    |

The node id differs too: `2277:93` in the hash form, `2237-1723` in the URL form. That is
Figma's own convention — a web URL hyphenates the colon — so the two are the same id written
two ways, not two different addressing schemes.

Hash form: `agent`, `attachments`, `checkpoint`, `commit`, `confirmation`,
`environment-variables`, `file-tree`, `jsx-preview`, `package-info`, `plan`, `queue`,
`sandbox`, `schema-display`, `stack-trace`, `terminal`, `test-results`, `web-preview`.

URL form: `artifact`, `chain-of-thought`, `code-block`, `context`, `image`,
`inline-citation`, `message`, `open-in-chat`, `prompt-input`, `reasoning`, `snippet`,
`sources`, `suggestion`, `task`, `tool`.

### The decision

**Support both. Do not normalize to one.**

The split is not a mistake to clean up — it reflects two consumers that want different
things, and the project expects to use both:

- **`figma-use`** (the CLI driving the seeding recipe today) addresses nodes as
  `fileKey` plus a colon node id.
- **The Figma MCP server / plugin surfaces** take a web URL. Any work routed through
  MCP rather than `figma-use` needs the URL form.

Picking one and migrating the other 15–17 files would just move the conversion cost to
whichever consumer lost, and the loser would hand-convert at every call site.

### Scope of the work

1. A small normalizer next to the spec contract that parses either form into
   `{ fileKey, nodeId }` and emits either form on request — one function pair,
   `parseFigmaComponentRef` / `formatFigmaComponentRef(ref, 'hash' | 'url')`.
2. Node-id canonicalization inside it: colon is the internal form, hyphen the URL form.
3. A shape check in the component-spec contract so a third grammar can't appear
   unnoticed the way this split did. **Validate both forms as legal** — the check
   exists to reject malformed refs, not to force one grammar.
4. Leave the 32 spec files as they are. Once the normalizer exists, the stored form
   stops mattering.

### Why it was not done in the audit pass

Nothing is broken today: every consumer is `figma-use`, and every ref it reads happens to
be resolvable by hand. The cost lands the first time a loop is driven through the Figma MCP
server, which is why this is queued rather than closed.

**Related:** the same audit found `docs/stage1/sync-policy.md`'s Stage 2→3 gate requiring
Code Connect artifacts that no component has, which contradicts
`docs/ai-elements-loop-handoff.md`. That is a policy decision, not backlog — it needs
resolving before this item's validator work touches the spec contract.
