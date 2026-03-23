import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const defaultStaleAfterMs = 2 * 60_000;
const defaultPollIntervalMs = 100;
const lockMetadataFileName = 'owner.json';

export async function withDirectoryLock(lockPath, callback, options = {}) {
  const lock = await acquireDirectoryLock(lockPath, options);
  try {
    return await callback(lock);
  } finally {
    lock.release();
  }
}

export async function acquireDirectoryLock(lockPath, options = {}) {
  const resolvedLockPath = path.resolve(lockPath);
  const metadataPath = path.join(resolvedLockPath, lockMetadataFileName);
  const ownerId = options.ownerId ?? crypto.randomUUID();
  const pid = options.pid ?? process.pid;
  const label = options.label ?? path.basename(resolvedLockPath);
  const staleAfterMs = options.staleAfterMs ?? defaultStaleAfterMs;
  const pollIntervalMs = options.pollIntervalMs ?? defaultPollIntervalMs;

  ensureParentDirectory(resolvedLockPath);

  while (true) {
    try {
      fs.mkdirSync(resolvedLockPath);

      const acquiredAtMs = Date.now();
      const record = createLockRecord({ ownerId, pid, label, acquiredAtMs });
      writeAtomicText(metadataPath, `${JSON.stringify(record, null, 2)}\n`);

      return createLockHandle(resolvedLockPath, metadataPath, record);
    } catch (error) {
      if (!isLockAlreadyHeldError(error)) {
        throw error;
      }

      if (tryRecoverStaleLock(resolvedLockPath, metadataPath, staleAfterMs)) {
        continue;
      }

      await delay(pollIntervalMs);
    }
  }
}

function createLockHandle(lockPath, metadataPath, record) {
  let released = false;

  return {
    record,
    release() {
      if (released) {
        return;
      }

      released = true;
      releaseDirectoryLock(lockPath, metadataPath, record.ownerId);
    },
  };
}

function createLockRecord({ ownerId, pid, label, acquiredAtMs }) {
  return {
    ownerId,
    pid,
    label,
    acquiredAtMs,
    acquiredAtIso: new Date(acquiredAtMs).toISOString(),
  };
}

function releaseDirectoryLock(lockPath, metadataPath, ownerId) {
  const record = readLockRecord(metadataPath);
  if (!record || record.ownerId !== ownerId) {
    return;
  }

  fs.rmSync(lockPath, { recursive: true, force: true });
}

function tryRecoverStaleLock(lockPath, metadataPath, staleAfterMs) {
  const snapshot = readLockSnapshot(lockPath, metadataPath, staleAfterMs);
  if (!snapshot.stale) {
    return false;
  }

  const verification = readLockSnapshot(lockPath, metadataPath, staleAfterMs);
  if (!verification.stale) {
    return false;
  }

  fs.rmSync(lockPath, { recursive: true, force: true });
  return true;
}

function readLockSnapshot(lockPath, metadataPath, staleAfterMs) {
  const lockStat = safeStat(lockPath);
  if (!lockStat) {
    return { stale: true };
  }

  const record = readLockRecord(metadataPath);
  if (!record) {
    return { stale: Date.now() - lockStat.mtimeMs > staleAfterMs };
  }

  if (!isValidLockRecord(record)) {
    return { stale: Date.now() - lockStat.mtimeMs > staleAfterMs };
  }

  if (!isProcessAlive(record.pid)) {
    return { stale: true, record };
  }

  return { stale: false, record };
}

function readLockRecord(metadataPath) {
  try {
    return JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  } catch {
    return null;
  }
}

function isValidLockRecord(record) {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.ownerId === 'string' &&
    record.ownerId.length > 0 &&
    Number.isInteger(record.pid) &&
    record.pid > 0 &&
    Number.isFinite(record.acquiredAtMs)
  );
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (isFsErrorWithCode(error, 'EPERM')) {
      return true;
    }

    return false;
  }
}

function isLockAlreadyHeldError(error) {
  return isFsErrorWithCode(error, 'EEXIST');
}

function isFsErrorWithCode(error, code) {
  return (
    error instanceof Error && typeof error === 'object' && 'code' in error && error.code === code
  );
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeAtomicText(filePath, contents) {
  const tempPath = `${filePath}.tmp-${process.pid}-${crypto.randomUUID()}`;

  try {
    fs.writeFileSync(tempPath, contents, 'utf8');
    fs.renameSync(tempPath, filePath);
  } catch (error) {
    try {
      fs.rmSync(tempPath, { force: true });
    } catch {}

    throw error;
  }
}
