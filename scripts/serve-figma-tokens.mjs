import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';

const port = Number(process.env.FIGMA_TOKEN_SERVER_PORT ?? 4173);
const artifactPath = path.resolve(process.cwd(), 'design-tokens/dist/figma/tokens.json');
const artifactUrlPath = '/design-tokens/dist/figma/tokens.json';

if (!fs.existsSync(artifactPath)) {
  process.stderr.write(
    `[FIGMA_TOKEN_SERVER_MISSING_ARTIFACT] missing ${artifactPath}. Run pnpm build:tokens first.\n`
  );
  process.exit(1);
}

function handleRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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

const serverV4 = http.createServer(handleRequest);
const serverV6 = http.createServer(handleRequest);

serverV4.listen(port, '127.0.0.1', () => {
  process.stdout.write(
    `✓ Serving ${path.relative(process.cwd(), artifactPath)} at http://localhost:${port}${artifactUrlPath}\n`
  );
});

// Some environments resolve `localhost` to ::1; bind that explicitly so the plugin URL works reliably.
serverV6.listen(port, '::1');
