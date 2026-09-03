import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const port = Number(process.env.FIGMA_TOKEN_SERVER_PORT ?? 4173);
const artifactPath = path.resolve(process.cwd(), 'design-tokens/dist/figma/tokens.json');
const artifactUrlPath = '/design-tokens/dist/figma/tokens.json';
const driftReportUrlPath = '/figma/drift-report';
const driftReportPath = path.resolve(process.cwd(), 'artifacts/figma/drift-report.json');

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

  if (req.method === 'POST' && req.url === driftReportUrlPath) {
    handleDriftReport(req, res);
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

// Records the plugin's read-only comparison as a repo artifact, so the sync
// ledger's `verification.materializationStatus` can cite a measurement instead
// of a hand-entered claim. This writes a report only — never token sources.
function handleDriftReport(req, res) {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('error', (err) => {
    sendJson(res, 400, { error: `Request read error: ${err.message}` });
  });
  req.on('end', () => {
    let report;
    try {
      report = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      sendJson(res, 400, { error: 'Request body must be valid JSON' });
      return;
    }

    if (!report || typeof report !== 'object' || !Array.isArray(report.findings)) {
      sendJson(res, 400, { error: 'Payload must be a drift report with a findings array' });
      return;
    }

    // Stamp provenance here rather than trusting the client: the report is only
    // meaningful against a specific artifact build.
    const envelope = {
      checkedAt: new Date().toISOString(),
      artifactPath: 'design-tokens/dist/figma/tokens.json',
      artifactSha256: sha256OfArtifact(),
      repoRevision: currentRevision(),
      ...report,
    };

    try {
      fs.mkdirSync(path.dirname(driftReportPath), { recursive: true });
      const content = JSON.stringify(envelope, null, 2) + '\n';
      const tmpPath = path.join(os.tmpdir(), `collider-drift-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, content, 'utf8');
      fs.renameSync(tmpPath, driftReportPath);
    } catch (err) {
      sendJson(res, 500, { error: `File write error: ${err.message}` });
      return;
    }

    const written = path.relative(process.cwd(), driftReportPath);
    process.stdout.write(
      `[FIGMA_DRIFT] ${envelope.ok ? 'no drift' : `${envelope.findings.length} finding(s)`} → ${written}\n`
    );
    sendJson(res, 200, { written, ok: envelope.ok, findingCount: envelope.findings.length });
  });
}

function sha256OfArtifact() {
  return crypto.createHash('sha256').update(fs.readFileSync(artifactPath)).digest('hex');
}

function currentRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
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
