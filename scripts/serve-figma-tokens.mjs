import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const port = Number(process.env.FIGMA_TOKEN_SERVER_PORT ?? 4173);
const artifactPath = path.resolve(process.cwd(), 'design-tokens/dist/figma/tokens.json');
const artifactUrlPath = '/design-tokens/dist/figma/tokens.json';
const pullUrlPath = '/figma/pull';
const tokenSourceDir = path.resolve(process.cwd(), 'design-tokens/src/tokens');

if (!fs.existsSync(artifactPath)) {
  process.stderr.write(
    `[FIGMA_TOKEN_SERVER_MISSING_ARTIFACT] missing ${artifactPath}. Run pnpm build:tokens first.\n`
  );
  process.exit(1);
}

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (!req.url) {
    res.statusCode = 400;
    res.end('missing url');
    return;
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === pullUrlPath) {
    handlePull(req, res);
    return;
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.end('method not allowed');
    return;
  }

  if (req.url !== artifactUrlPath) {
    res.statusCode = 404;
    res.end('not found');
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  fs.createReadStream(artifactPath).pipe(res);
}

function handlePull(req, res) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('error', (err) => {
    sendJson(res, 400, { error: `Request read error: ${err.message}` });
  });
  req.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      sendJson(res, 400, { error: 'Request body must be valid JSON' });
      return;
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      sendJson(res, 400, { error: 'Payload must be a plain object keyed by collection name' });
      return;
    }

    const collections = Object.entries(payload).filter(
      ([key]) => key !== '$extensions' && typeof key === 'string' && key.length > 0
    );

    if (collections.length === 0) {
      sendJson(res, 400, { error: 'Payload contains no collection entries' });
      return;
    }

    const written = [];
    try {
      for (const [collectionKey, tree] of collections) {
        const destPath = path.join(tokenSourceDir, `${collectionKey}.tokens.json`);
        const content = JSON.stringify(tree, null, 2) + '\n';
        const tmpPath = path.join(os.tmpdir(), `collider-pull-${collectionKey}-${Date.now()}.json`);
        fs.writeFileSync(tmpPath, content, 'utf8');
        fs.renameSync(tmpPath, destPath);
        written.push(`design-tokens/src/tokens/${collectionKey}.tokens.json`);
        process.stdout.write(`[FIGMA_PULL] wrote ${destPath}\n`);
      }
    } catch (err) {
      sendJson(res, 500, { error: `File write error: ${err.message}` });
      return;
    }

    process.stdout.write('[FIGMA_PULL] running pnpm build:tokens…\n');
    const build = spawnSync('pnpm', ['build:tokens'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 60000,
    });
    const buildOk = build.status === 0;
    const buildOutput = (build.stdout ?? '') + (build.stderr ?? '');
    if (buildOk) {
      process.stdout.write('[FIGMA_PULL] build:tokens succeeded\n');
    } else {
      process.stderr.write(
        `[FIGMA_PULL] build:tokens failed (exit ${build.status})\n${buildOutput}\n`
      );
    }

    sendJson(res, 200, {
      written,
      buildStatus: buildOk ? 'ok' : 'failed',
      buildOutput: buildOk ? undefined : buildOutput.slice(0, 2000),
    });
  });
}

function sendJson(res, status, body) {
  const json = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(json);
}

const serverV4 = http.createServer(handleRequest);
const serverV6 = http.createServer(handleRequest);

serverV4.listen(port, '127.0.0.1', () => {
  process.stdout.write(
    `✓ Serving ${path.relative(process.cwd(), artifactPath)} at http://localhost:${port}${artifactUrlPath}\n`
  );
});

// Some environments resolve `localhost` to ::1; bind that explicitly so the plugin URL works reliably.
serverV6.listen(port, '::1');
