/**
 * Assembles the runnable `figma-use eval` scripts that build the Figma
 * Foundations page from the generated token artifact.
 *
 * The page is a specimen surface: swatches are variable-bound so they follow
 * the mode switcher, but names, values and contrast ratios are baked as static
 * text — a ratio cannot be variable-bound. That makes the page go stale
 * whenever tokens change, so it is generated rather than hand-maintained.
 *
 *   node scripts/build-foundations-page.mjs          # writes build/foundations/*.run.js
 *   node scripts/build-foundations-page.mjs --json   # machine-readable summary
 *
 * Then, with Figma open on the remote-debug port:
 *   figma-use eval --json --timeout 120000 "$(cat build/foundations/color.run.js)"
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const artifactPath = path.join(repoRoot, 'design-tokens/dist/figma/tokens.json');
const srcDir = path.join(repoRoot, 'figma/foundations');
const outDir = path.join(repoRoot, 'build/foundations');

if (!fs.existsSync(artifactPath)) {
  process.stderr.write(
    `[FOUNDATIONS_MISSING_ARTIFACT] missing ${artifactPath}. Run pnpm build:tokens first.\n`
  );
  process.exit(1);
}

const doc = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const base = Object.fromEntries(Object.entries(doc).filter(([k]) => !k.startsWith('$')));
const lightTree = doc.$themeOverrides?.light ?? {};

function* walk(node, trail = []) {
  if (!node || typeof node !== 'object') return;
  if ('$value' in node) {
    yield [trail.join('.'), node.$type, node.$value];
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (!k.startsWith('$')) yield* walk(v, [...trail, k]);
  }
}

const dark = new Map([...walk(base)].map(([id, type, value]) => [id, { type, value }]));
const light = new Map([...walk(lightTree)].map(([id, , value]) => [id, value]));

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  if (!isHex(a) || !isHex(b)) return null;
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
const isHex = (v) => typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v);

const tokens = [...dark.entries()].map(([id, { type, value }]) => ({
  id,
  figma: id.replaceAll('.', '/'),
  type,
  dark: value,
  light: light.has(id) ? light.get(id) : value,
  themed: light.has(id),
}));
const byId = Object.fromEntries(tokens.map((t) => [t.id, t]));

// Foreground tokens are measured against the surface they actually sit on,
// not against the page ground — `accent/primary-foreground` on the page
// background is a meaningless number.
const GROUND = 'semantic.color.background.base';
const PAIRS = {
  'accent.primary-foreground': 'accent.primary',
  'accent.sidebar-primary-foreground': 'accent.sidebar-primary',
};

const pick = (prefix) => tokens.filter((t) => t.id.startsWith(prefix));
function toRow(t) {
  const against = byId[PAIRS[t.id] ?? GROUND];
  const row = {
    name: t.figma,
    dark: t.dark,
    light: t.light,
    themed: t.themed,
    against: against.figma,
  };
  if (isHex(t.dark)) {
    row.crDark = ratio(t.dark, against.dark);
    row.crLight = ratio(t.light, against.light);
  }
  if (t.id.startsWith('accent.')) row.metric = t.id.endsWith('-foreground') ? 'text' : 'info';
  return row;
}

// metric: 'text' = 4.5 verdict | 'ui' = real 1.4.11 3:1 verdict | 'info' = ratio only | null = none
const SECTIONS = [
  [
    'BACKGROUND & SURFACE',
    'Page grounds and layered surfaces. `base` is the app ground — everything else in this file sits on it. No ratio column: a ground measured against itself says nothing.',
    null,
    'semantic.color.background.',
  ],
  [
    'BORDER',
    'Hairlines and dividers, measured against `background/base`. Ratio only, no verdict — WCAG 1.4.11 exempts purely decorative dividers, so a low number here is a design choice rather than a defect. Judge it by eye against the swatch.',
    'info',
    'semantic.color.border.',
  ],
  [
    'TEXT',
    'The reading ladder, measured against `background/base`. The bar is 4.5:1 for body copy and 3:1 for large text.',
    'text',
    'semantic.color.text.',
  ],
  [
    'INTERACTION',
    'Focus and selection affordances, measured against `background/base`. These DO answer to 1.4.11 at 3:1 — a focus ring is a UI component indicator, not decoration.',
    'ui',
    'semantic.color.interaction.',
  ],
  [
    'STATUS STRIP',
    'Run-state strip fills against `background/base`. Ratio only: whether these need 3:1 depends on whether the strip is the sole carrier of the state or is paired with a label, which varies by component.',
    'info',
    'semantic.color.status-strip.',
  ],
  [
    'ACCENT',
    'The single accent rail — one name carrying a value per mode. `sidebar-primary` is the only value that actually differs between modes. Each `-foreground` is measured against its own accent surface, not against the page ground.',
    'info',
    'accent.',
  ],
];

const colorSections = SECTIONS.map(([label, blurb, metric, prefix]) => ({
  label,
  blurb,
  metric,
  rows: pick(prefix).map(toRow),
}));

const lib = fs.readFileSync(path.join(srcDir, 'lib-frame.js'), 'utf8');
const slim = (families) =>
  tokens
    .filter((t) => families.includes(t.id.split('.')[0]))
    .map((t) => ({ id: t.id, dark: t.dark }));

const builds = [
  ['color', 'build-color.js', { __SECTIONS__: colorSections }],
  ['type', 'build-type.js', { __TOKENS__: slim(['type']) }],
  [
    'rest',
    'build-rest.js',
    { __TOKENS__: slim(['spacing', 'radius', 'shape', 'elevation', 'motion', 'layout']) },
  ],
];

fs.mkdirSync(outDir, { recursive: true });
const written = builds.map(([name, file, subs]) => {
  let js = fs.readFileSync(path.join(srcDir, file), 'utf8').replace('__LIB__', lib);
  for (const [token, data] of Object.entries(subs)) js = js.replace(token, JSON.stringify(data));
  const target = path.join(outDir, `${name}.run.js`);
  fs.writeFileSync(target, js);
  return { id: name, path: path.relative(repoRoot, target), bytes: js.length };
});

const summary = {
  ok: true,
  tokenCount: tokens.length,
  themedCount: tokens.filter((t) => t.themed).length,
  scripts: written,
};
if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} else {
  process.stdout.write(
    `✓ Foundations builders ready (${tokens.length} tokens, ${summary.themedCount} themed)\n`
  );
  for (const w of written) process.stdout.write(`  ${w.id.padEnd(6)} ${w.path}\n`);
  process.stdout.write('\nRun each with Figma open on the remote-debug port:\n');
  for (const w of written)
    process.stdout.write(`  figma-use eval --json --timeout 180000 "$(cat ${w.path})"\n`);
}
