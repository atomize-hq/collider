import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { describe, expect, it } from 'vitest';
import { acquireDirectoryLock } from '../../../scripts/lib/directory-lock.mjs';

const repoRoot = process.cwd();

describe('directory lock recovery', () => {
  it('recovers stale build-token lock metadata immediately', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'build-tokens-lock-stale-'));
    const lockPath = path.join(tempRoot, 'build-tokens.lock');
    fs.mkdirSync(lockPath, { recursive: true });

    const staleTimestamp = Date.now() - 10 * 60_000;
    fs.writeFileSync(
      path.join(lockPath, 'owner.json'),
      JSON.stringify(
        {
          ownerId: 'stale-lock',
          pid: 999999,
          label: 'build:tokens',
          acquiredAtMs: staleTimestamp,
          acquiredAtIso: new Date(staleTimestamp).toISOString(),
        },
        null,
        2
      ),
      'utf8'
    );

    try {
      const lock = await acquireDirectoryLock(lockPath, {
        label: 'build:tokens',
        staleAfterMs: 1_000,
        pollIntervalMs: 10,
      });

      try {
        expect(lock.record.pid).toBe(process.pid);
        expect(lock.record.ownerId).not.toBe('stale-lock');
        expect(fs.existsSync(path.join(lockPath, 'owner.json'))).toBe(true);
      } finally {
        lock.release();
      }
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  });
});

describe('build:tokens locking', () => {
  it('serializes concurrent pnpm build:tokens processes', async () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'build-tokens-lock-run-'));
    const tracePath = path.join(tempRoot, 'first-lock.json');
    let firstProcess: ReturnType<typeof spawn> | undefined;
    let secondProcess: ReturnType<typeof spawn> | undefined;

    try {
      firstProcess = spawn('pnpm', ['build:tokens'], {
        cwd: repoRoot,
        env: {
          ...process.env,
          COLLIDER_BUILD_TOKENS_LOCK_TRACE_FILE: tracePath,
          COLLIDER_BUILD_TOKENS_LOCK_HOLD_MS: '2000',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      firstProcess.stdout?.resume();
      firstProcess.stderr?.resume();

      const firstExit = once(firstProcess, 'exit');
      const firstTrace = await Promise.race([
        waitForJsonFile(tracePath),
        firstExit.then(() => {
          throw new Error('pnpm build:tokens exited before writing the lock trace');
        }),
      ]);
      expect(firstTrace.lockPath).toContain('.codex-artifacts/locks/build-tokens.lock');
      expect(firstTrace.pid).toBeGreaterThan(0);

      const firstExitAt = firstExit.then(() => Date.now());

      secondProcess = spawn('pnpm', ['build:tokens'], {
        cwd: repoRoot,
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      secondProcess.stdout?.resume();
      secondProcess.stderr?.resume();

      const secondExit = once(secondProcess, 'exit');
      const secondExitAt = secondExit.then(() => Date.now());
      const [firstExitTime, secondExitTime] = await Promise.all([firstExitAt, secondExitAt]);

      expect(firstProcess.exitCode).toBe(0);
      expect(secondProcess.exitCode).toBe(0);
      expect(secondExitTime).toBeGreaterThan(firstExitTime);
    } finally {
      terminateChildProcess(firstProcess);
      terminateChildProcess(secondProcess);
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  }, 30_000);
});

async function waitForJsonFile(filePath: string) {
  const timeoutAt = Date.now() + 10_000;

  for (;;) {
    if (fs.existsSync(filePath)) {
      const contents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(contents) as {
        pid: number;
        acquiredAtMs: number;
        lockPath: string;
      };
    }

    if (Date.now() > timeoutAt) {
      throw new Error(`timed out waiting for lock trace file ${filePath}`);
    }

    await sleep(25);
  }
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function terminateChildProcess(child: ReturnType<typeof spawn> | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');
}
