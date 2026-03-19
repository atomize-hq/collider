import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  extractCustomPropertyNames,
  loadRuntimeCompatibilitySurface,
  runRuntimeCssCompatibilityCheck,
} from '../../../scripts/lib/token-runtime-compatibility.mjs';

describe('extractCustomPropertyNames', () => {
  it('collects declared custom property names from runtime css', () => {
    expect(
      extractCustomPropertyNames(
        ':root {\n  --color-text-primary: var(--semantic-color-text-primary);\n}\n'
      )
    ).toEqual(new Set(['--color-text-primary']));
  });
});

describe('loadRuntimeCompatibilitySurface', () => {
  it('rejects malformed compatibility surface files', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-compatibility-'));
    const surfacePath = path.join(tempDir, 'surface.json');
    fs.writeFileSync(surfacePath, JSON.stringify({ requiredCustomProperties: [''] }), 'utf8');

    expect(() => loadRuntimeCompatibilitySurface(surfacePath)).toThrow(
      'runtime compatibility surface must define a non-empty requiredCustomProperties string array'
    );
  });
});

describe('runRuntimeCssCompatibilityCheck', () => {
  it('passes when all required custom properties are present', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-compatibility-'));
    const runtimeCssPath = path.join(tempDir, 'tokens.css');
    const surfacePath = path.join(tempDir, 'surface.json');
    fs.writeFileSync(
      runtimeCssPath,
      ':root {\n  --color-text-primary: #fff;\n  --color-text-secondary: #aaa;\n}\n',
      'utf8'
    );
    fs.writeFileSync(
      surfacePath,
      JSON.stringify({
        requiredCustomProperties: ['--color-text-primary', '--color-text-secondary'],
      }),
      'utf8'
    );

    expect(runRuntimeCssCompatibilityCheck({ runtimeCssPath, surfacePath })).toEqual({
      ok: true,
      diagnostics: [],
    });
  });

  it('reports missing required custom properties precisely', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-compatibility-'));
    const runtimeCssPath = path.join(tempDir, 'tokens.css');
    const surfacePath = path.join(tempDir, 'surface.json');
    fs.writeFileSync(runtimeCssPath, ':root {\n  --color-text-primary: #fff;\n}\n', 'utf8');
    fs.writeFileSync(
      surfacePath,
      JSON.stringify({
        requiredCustomProperties: ['--color-text-primary', '--color-text-secondary'],
      }),
      'utf8'
    );

    expect(runRuntimeCssCompatibilityCheck({ runtimeCssPath, surfacePath })).toEqual({
      ok: false,
      diagnostics: [
        {
          severity: 'error',
          code: 'RUNTIME_CSS_COMPATIBILITY_MISSING',
          message:
            'generated runtime CSS is missing required legacy custom property "--color-text-secondary". Rebuild generated token artifacts with `pnpm build:tokens`.',
          path: path.relative(process.cwd(), runtimeCssPath).replaceAll(path.sep, '/'),
          rule: 'CT-6',
        },
      ],
    });
  });
});
