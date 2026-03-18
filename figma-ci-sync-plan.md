fiYes — and I’d split this into **two canonical layers**, not one:

1. **Design tokens JSON** as the source of truth for scalar design decisions like color, spacing, radius, typography, shadows, motion values, breakpoints, opacity, z-index, etc. The safest format is **DTCG JSON**, because the Design Tokens Community Group spec exists specifically for cross-tool interoperability, and Style Dictionary has first-class DTCG support. ([Style Dictionary][1])

2. A separate **component recipe / variant manifest** for things like `button.intent=primary`, `button.size=sm`, `card.elevation=raised`, state mappings, and slot-level token references. Tokens are great for values, but they are a poor fit for encoding whole component recipes by themselves; Tokens Studio explicitly notes that composition tokens are unofficial, hard to transform, and not a strong long-term path. ([Tokens Studio][2])

For your stack, the best practical setup is:

- **Repo JSON is canonical**
- **Figma consumes or syncs from that JSON**
- **Next.js / Storybook consume generated artifacts from that same JSON**
- **CI rebuilds and validates everything before app build**

The toolchain I’d pick is **Tokens Studio + Style Dictionary** as the default, with **Figma Variables REST API** as an optional stricter enterprise layer.

### What I’d use

**1) Tokens Studio for Figma**
This is the cleanest bridge between repo JSON and Figma. Tokens Studio supports Git-based sync providers like GitHub/GitLab/Azure DevOps with push/pull, and it also supports **URL sync in read-only mode**, which is especially useful when you want the repo JSON to be the true source of truth and do not want token edits originating in Figma. Tokens Studio can also export tokens to Figma Variables and Styles, and its Companion plugin is designed to consume synced tokens as variables inside Figma. ([Tokens Studio][3])

**2) Style Dictionary + `@tokens-studio/sd-transforms`**
Style Dictionary is the build system that turns the canonical token JSON into the actual artifacts your app uses. Tokens Studio’s docs explicitly recommend `@tokens-studio/sd-transforms` before Style Dictionary, and Style Dictionary has built-in formats like `css/variables` plus filters for splitting outputs. That makes it a good fit for generating one CSS variable file for Next.js, one token JSON/TS file for JS consumers, and any other platform output you want later. ([Tokens Studio][4])

**3) Optional: Figma Variables REST API**
If you want a more official and automatable Figma-side enforcement path, Figma’s Variables REST API can query and bulk create/update/delete local variables and collections, and Figma explicitly calls out CI integration as a use case. The catch is that this API is gated to **Enterprise**, and write access requires a Full seat with the right scopes. ([Figma Developers][5])

**4) Optional: Storybook token docs**
Since you already have Storybook as a contract layer, I’d strongly consider adding a token-doc addon so Storybook shows the same generated CSS variables that the app uses. The current `storybook-design-token` addon supports Storybook 10+ and provides docs blocks for token display. ([Storybook][6])

### My recommendation for your exact setup

I would make the canonical source look like this:

```text
packages/
  design-tokens/
    src/
      tokens/
        core.tokens.json
        semantic.tokens.json
        motion.tokens.json
        themes/
          light.tokens.json
          dark.tokens.json
      recipes/
        button.recipe.json
        input.recipe.json
        card.recipe.json
    build/
      style-dictionary.config.mjs
    dist/
      css/
        tokens.css
      js/
        tokens.ts
      figma/
        tokens.json
```

Then the flow becomes:

- `src/tokens/**/*.json` = canonical DTCG tokens
- `src/recipes/**/*.json` = canonical component variant/state mappings
- `dist/css/tokens.css` = imported by Next.js and Storybook
- `dist/js/tokens.ts` = optional typed JS/TS consumer
- `dist/figma/tokens.json` = what Figma syncs from if you want a dedicated export target

### How I’d wire Figma

If you want the repo JSON to be the real source of truth, I would **not** let Figma be the place people casually edit token values.

Use one of these two modes:

- **Strict mode:** Tokens Studio **URL sync read-only** or Generic Versioned read-only, so Figma can consume tokens but not author them. ([Tokens Studio][7])
- **Practical team mode:** Tokens Studio GitHub sync, but team convention says token edits go through PRs. This is still workable, but it is weaker than read-only consumption because the plugin supports push/pull both ways. ([Tokens Studio][3])

Then use Tokens Studio export/Companion to materialize those tokens as Figma variables/styles for designers. If you need theme modes in Figma, Tokens Studio’s more advanced Themes/multi-file sync path is the better fit than a single flat `tokens.json`. ([Tokens Studio][8])

### How I’d wire Next.js

Have Next.js and Storybook both consume the same generated CSS variable file. In practice that means:

```json
{
  "scripts": {
    "build:tokens": "node packages/design-tokens/build/build-tokens.mjs",
    "validate:tokens": "node packages/design-tokens/build/validate-tokens.mjs",
    "prebuild": "pnpm validate:tokens && pnpm build:tokens",
    "build": "next build"
  }
}
```

Then import the generated CSS once at the app root and once in Storybook preview:

```ts
// app/layout.tsx or app/globals.css import path
import '@acme/design-tokens/dist/css/tokens.css';
```

That ensures the frontend is not “redefining” tokens in component code; it is consuming the generated artifact from the canonical token package.

### What CI should do

I’d make CI fail if any of these drift:

- token JSON fails schema validation
- generated CSS/TS artifacts are stale
- recipe files reference missing tokens
- Storybook token docs are out of date
- optional: Figma variables snapshot no longer matches the canonical export

A good minimal CI sequence is:

1. validate DTCG token JSON + recipe JSON
2. run Style Dictionary build
3. check that `dist/` is up to date
4. run Storybook build/tests/Chromatic
5. optionally compare against Figma variables API output if you’re on Enterprise

That model is exactly what Figma’s Variables API and Style Dictionary are both good at: CI-driven synchronization/validation plus generated outputs. ([Figma Developers][5])

### The one thing I would not do

I would **not** try to store your entire component-variant system as only Figma variables or only raw token JSON without a recipe layer. Use tokens for values, and use a variant manifest for component contracts. That keeps the system durable and makes it much easier to drive both Figma documentation and React implementation from the same source.

My actual recommendation, in one sentence:

**Canonical DTCG JSON in the repo + Style Dictionary build outputs + Tokens Studio consuming that JSON for Figma + a separate component recipe manifest for variants/states.**

If you want, I can turn this into a concrete starter package structure with sample `tokens.json`, `button.recipe.json`, and a working `style-dictionary.config.mjs`.

[1]: https://styledictionary.com/info/dtcg/ 'Design Tokens Community Group | Style Dictionary'
[2]: https://docs.tokens.studio/token-storage/remote-multi-file-sync?utm_source=chatgpt.com 'Multi-file Sync to Remote Storage (pro) | Tokens Studio for Figma'
[3]: https://docs.tokens.studio/token-storage/remote/sync-git-github?utm_source=chatgpt.com 'GitHub - Git Sync Provider | Tokens Studio for Figma'
[4]: https://docs.tokens.studio/transform-tokens/style-dictionary 'Style Dictionary + SD Transforms | Tokens Studio for Figma'
[5]: https://developers.figma.com/docs/rest-api/variables/?utm_source=chatgpt.com 'Variables | Developer Docs'
[6]: https://storybook.js.org/addons/storybook-design-token?utm_source=chatgpt.com 'Storybook Design Token | Storybook integrations'
[7]: https://docs.tokens.studio/token-storage/remote/sync-server-url?utm_source=chatgpt.com 'URL - Server Sync Provider | Tokens Studio for Figma'
[8]: https://docs.tokens.studio/variables-and-styles/export-to-figma-overview?utm_source=chatgpt.com 'Export to Figma Guide | Tokens Studio for Figma'
