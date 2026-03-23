# Native Boundary

**Status:** Stage 1 — contracts defined, implementations pending
**Date:** 2026-03-23

---

## Overview

All privileged OS access flows through Tauri. The React frontend communicates with Rust via typed bridge adapters in `src/bridge/`. Direct use of `window.__TAURI__` outside `src/bridge/` is banned.

```
React component
    ↓  calls typed fn
src/bridge/<domain>.ts
    ↓  invoke() / listen()
Tauri command / event (Rust)
    ↓
OS / filesystem / process
```

---

## Bridge naming convention

Bridge modules are named by domain:

| File                   | Domain                                      | Status  |
| ---------------------- | ------------------------------------------- | ------- |
| `src/bridge/shell.ts`  | Shell command execution, process management | planned |
| `src/bridge/fs.ts`     | Filesystem read/write                       | planned |
| `src/bridge/window.ts` | Window management, focus, resize            | planned |
| `src/bridge/auth.ts`   | Secure credential storage                   | planned |
| `src/bridge/update.ts` | Auto-update checks                          | planned |

Each module exports typed async functions. No module exports raw `invoke` or `listen` — those are internal implementation details.

Pattern:

```ts
// src/bridge/shell.ts
import { invoke } from '@tauri-apps/api/core';

export interface RunCommandOptions {
  cwd?: string;
  env?: Record<string, string>;
}

export interface RunCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runCommand(
  command: string,
  args: string[],
  options?: RunCommandOptions
): Promise<RunCommandResult> {
  return invoke('run_command', { command, args, options });
}
```

---

## Storybook bridge mock pattern

Every bridge module has a corresponding mock in `src/bridge/__mocks__/`. Storybook imports mocks instead of real bridge modules via Vite alias or `vi.mock`.

Mock pattern:

```ts
// src/bridge/__mocks__/shell.ts
import { vi } from 'vitest';
import type { RunCommandResult } from '../shell';

export const runCommand = vi.fn<[], Promise<RunCommandResult>>().mockResolvedValue({
  stdout: '',
  stderr: '',
  exitCode: 0,
});
```

Stories that need specific behavior override the mock in their `play` function or via `parameters.bridgeMocks`. No story should ever call real Tauri commands.

---

## Capability and permission naming

Tauri v2 uses capabilities (`src-tauri/capabilities/`) to declare what the app can do. Convention:

- Capability files: `src-tauri/capabilities/<domain>.json`
- Permission names: `<plugin>:<action>` (Tauri v2 standard)
- Do not use wildcard permissions in production capabilities

Planned capabilities:

| File           | Domain                          |
| -------------- | ------------------------------- |
| `default.json` | Core window and app permissions |
| `shell.json`   | Shell command execution         |
| `fs.json`      | Filesystem read/write scopes    |

---

## Desktop features expected in early builds

These are the first native features likely to be scoped, in priority order:

1. **Shell command execution** — run `cargo`, `git`, `npm` commands from the UI. Core to the Collider use case.
2. **Working directory management** — open, switch, remember the project directory.
3. **File watching** — watch for file changes to trigger UI updates (likely via Tauri event stream).
4. **Secure token storage** — store API keys or auth tokens using the OS keychain via `tauri-plugin-stronghold` or `tauri-plugin-keyring`.

For each of these, define the bridge contract before writing the UI component that depends on it.

---

## Rules for adding a new bridge command

1. Define the TypeScript type contract in `src/bridge/<domain>.ts` first.
2. Define the Rust command signature in `src-tauri/src/lib.rs` (or a new module).
3. Add the required capability/permission.
4. Write the Storybook mock in `src/bridge/__mocks__/<domain>.ts`.
5. Write a Vitest unit test for the bridge module if it has non-trivial logic.
6. Only then wire the component to the bridge.

---

## Events (Rust → frontend)

For Rust-initiated events (file change notifications, process output streaming, etc.), use the Tauri event system:

```ts
// src/bridge/events.ts
import { listen } from '@tauri-apps/api/event';

export function onOutputLine(handler: (line: string) => void) {
  return listen<string>('output-line', (event) => handler(event.payload));
}
```

Event names use `kebab-case`. The return value is an unlisten function — always call it in a `useEffect` cleanup.

Storybook mock for event listeners:

```ts
// src/bridge/__mocks__/events.ts
export const onOutputLine = vi.fn().mockReturnValue(() => undefined); // noop unlisten
```
