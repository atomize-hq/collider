# Storybook decision matrix for this stack

| Need                                                  | Recommended choice                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Best overall path for Next.js Storybook in this stack | `@storybook/nextjs-vite`                                                              |
| Modern Storybook test widget / Vitest integration     | `@storybook/addon-vitest`                                                             |
| Replayable multi-step UI flows                        | `play` functions + Interactions/Test panel                                            |
| CI visual regression                                  | Chromatic                                                                             |
| CI interaction validation from stories                | Chromatic interaction tests                                                           |
| Figma ↔ story linking                                 | `@storybook/addon-designs`, or Storybook Connect if published                         |
| Keep strict Webpack/Babel compatibility               | `@storybook/nextjs` (Webpack)                                                         |
| Webpack-based fallback                                | use `play` functions + Interactions panel + Chromatic, skip `@storybook/addon-vitest` |

## Where Collider actually sits

- **Framework**: `@storybook/nextjs-vite` with `@storybook/addon-vitest` — the top row.
- **Figma ↔ story linking**: `@storybook/addon-designs`. Code Connect is retired; the durable
  link is `downstreamHooks.figmaComponentRef` in the component spec.
- **Chromatic**: the rail works, but **no baseline exists** for any of the 32 components —
  Chromatic holds a March pilot only. Rows recommending Chromatic describe where this stack
  should end up, not a gate you can lean on today. See `docs/stage1/sync-policy.md`.
