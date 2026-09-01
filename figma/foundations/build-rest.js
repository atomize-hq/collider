const T = __TOKENS__;
const grp = (p) =>
  T.filter((t) => t.id.startsWith(p)).map((t) => ({ leaf: t.id.slice(p.length), v: t.dark }));
const px = (s) => parseFloat(String(s));

const fonts = [
  { family: 'Poppins', style: 'Regular' },
  { family: 'Poppins', style: 'Medium' },
  { family: 'Poppins', style: 'SemiBold' },
  { family: 'Roboto Mono', style: 'Regular' },
];

return Promise.all(fonts.map((f) => figma.loadFontAsync(f).catch(() => null))).then(() => {
  const page = figma.root.children.find((p) => p.name === 'Foundations');
  figma.currentPage = page;

  __LIB__;

  const out = {};
  const rect = (w, h, o) => {
    o = o || {};
    const r = figma.createRectangle();
    r.resize(Math.max(w, 0.01), h);
    r.cornerRadius = o.radius || 0;
    bindFill(r, o.fill || 'semantic/color/text/secondary');
    if (o.opacity != null) r.opacity = o.opacity;
    if (o.stroke) {
      bindStroke(r, o.stroke);
      r.strokeWeight = o.strokeWeight || 1;
      r.fills = [];
    }
    return r;
  };
  const place = (root, x) => {
    page.appendChild(root);
    root.x = x;
    root.y = 0;
    return { id: root.id, w: root.width, h: root.height };
  };

  // ─────────── SPACE & SHAPE ───────────
  let root = shell(
    'Space & Shape',
    'Raw scales first, usage-named aliases second — the hybrid model set in Phase 1b. New components pick from ' +
      'the scale; the alias blocks record the vocabulary that formalised atoms already use. Bars and boxes below ' +
      'are drawn at their real value.'
  );

  const scale = grp('spacing.')
    .filter((x) => !x.leaf.includes('.'))
    .sort((a, b) => px(a.v) - px(b.v));
  let s = section(
    root,
    'SPACING SCALE',
    '20 steps from 0 to 128px. Bars are drawn at the token’s actual width.'
  );
  let rows = rowsFrame(s, 8);
  scale.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('spacing/' + x.leaf, x.v, 280));
    r.appendChild(rect(px(x.v), 16, { fill: 'accent/primary', radius: 2 }));
    rows.appendChild(r);
  });

  const gaps = grp('spacing.gap.'),
    pads = grp('spacing.padding.');
  s = section(root, 'SPACING ROLE ALIASES', 'Usage-named steps inherited from Collider-Old atoms.');
  rows = rowsFrame(s, 8);
  gaps
    .concat([])
    .sort((a, b) => px(a.v) - px(b.v))
    .forEach((x) => {
      const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
      r.appendChild(nameVal('spacing/gap/' + x.leaf, x.v, 280));
      r.appendChild(rect(px(x.v), 14, { fill: 'semantic/color/text/tertiary', radius: 2 }));
      rows.appendChild(r);
    });
  pads
    .sort((a, b) => px(a.v) - px(b.v))
    .forEach((x) => {
      const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
      r.appendChild(nameVal('spacing/padding/' + x.leaf, x.v, 280));
      r.appendChild(rect(px(x.v), 14, { fill: 'semantic/color/text/tertiary', radius: 2 }));
      rows.appendChild(r);
    });

  const radii = grp('radius.')
    .filter((x) => !x.leaf.startsWith('role.'))
    .sort((a, b) => px(a.v) - px(b.v));
  s = section(
    root,
    'RADIUS',
    'Corner radii drawn on a 72×56 box. `full` clamps to a pill at this size.'
  );
  rows = rowsFrame(s, 10);
  radii.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('radius/' + x.leaf, x.v, 280));
    r.appendChild(
      rect(72, 56, {
        radius: Math.min(px(x.v), 28),
        fill: 'semantic/color/background/elevated',
        stroke: 'semantic/color/border/strong',
      })
    );
    rows.appendChild(r);
  });
  const rroles = grp('radius.role.').sort((a, b) => px(a.v) - px(b.v));
  s = section(root, 'RADIUS ROLE ALIASES', null);
  rows = rowsFrame(s, 10);
  rroles.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('radius/role/' + x.leaf, x.v, 280));
    r.appendChild(
      rect(72, 40, {
        radius: px(x.v),
        fill: 'semantic/color/background/elevated',
        stroke: 'semantic/color/border/strong',
      })
    );
    rows.appendChild(r);
  });

  const bw = grp('shape.border.width.');
  s = section(
    root,
    'BORDER WIDTHS',
    'Tailwind v4 defaults `border` to currentColor; the role bridge restores the semantic colour.'
  );
  rows = rowsFrame(s, 10);
  bw.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('shape/border/width/' + x.leaf, x.v, 280));
    r.appendChild(
      rect(120, 40, { stroke: 'semantic/color/border/strong', strokeWeight: px(x.v), radius: 4 })
    );
    rows.appendChild(r);
  });

  const op = grp('shape.opacity.').sort((a, b) => Number(b.v) - Number(a.v));
  s = section(root, 'OPACITY', 'Applied to a solid accent fill on the page ground.');
  rows = rowsFrame(s, 10);
  op.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('shape/opacity/' + x.leaf, String(x.v), 280));
    r.appendChild(rect(120, 36, { fill: 'accent/primary', opacity: Number(x.v), radius: 4 }));
    rows.appendChild(r);
  });
  const oroles = grp('shape.role.').sort((a, b) => Number(b.v) - Number(a.v));
  s = section(root, 'OPACITY ROLE ALIASES', null);
  rows = rowsFrame(s, 10);
  oroles.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('shape/role/' + x.leaf, String(x.v), 280));
    r.appendChild(rect(120, 36, { fill: 'accent/primary', opacity: Number(x.v), radius: 4 }));
    rows.appendChild(r);
  });
  out.spaceShape = place(root, 2800);

  // ─────────── ELEVATION ───────────
  // A CSS box-shadow length is unitless when it is zero (every token here starts
  // `0 `), and an optional 4th length is spread. The previous pattern required a
  // literal `p` on the x offset, so no elevation token ever parsed — and because
  // a parse failure returned null, all 13 cards shipped with no effect and
  // nothing reported it. Unparsable input now throws.
  const SHADOW_RE =
    /^\s*(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})\s*$/;
  const parseColor = (s) => {
    const fn = s.match(/^rgba?\(([^)]*)\)$/);
    if (fn) {
      const c = fn[1]
        .split(/[,/\s]+/)
        .filter(Boolean)
        .map(parseFloat);
      return { r: c[0] / 255, g: c[1] / 255, b: c[2] / 255, a: c[3] == null ? 1 : c[3] };
    }
    let h = s.slice(1);
    if (h.length < 6)
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    const ch = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { r: ch(0), g: ch(2), b: ch(4), a: h.length === 8 ? ch(6) : 1 };
  };
  const parseShadow = (css) => {
    if (!css || css === 'none') return null;
    const m = String(css).match(SHADOW_RE);
    if (!m) throw new Error('unparsable elevation token: ' + css);
    return {
      type: 'DROP_SHADOW',
      color: parseColor(m[5]),
      offset: { x: parseFloat(m[1]), y: parseFloat(m[2]) },
      radius: parseFloat(m[3]),
      spread: m[4] == null ? 0 : parseFloat(m[4]),
      visible: true,
      blendMode: 'NORMAL',
    };
  };
  let shadowsApplied = 0;
  const applyShadow = (card, css) => {
    const e = parseShadow(css);
    if (!e) return;
    card.effects = [e];
    shadowsApplied += 1;
  };
  root = shell(
    'Elevation',
    'Dark-tuned drop shadows. These are string tokens, not Figma effect variables, so the cards below carry a ' +
      'hand-applied effect matching the token’s CSS — they will not follow the mode switcher. ' +
      'Values were authored for the dark ground and have not yet been re-tuned for light.'
  );
  const lv = grp('elevation.level.').sort((a, b) => a.leaf.localeCompare(b.leaf));
  s = section(root, 'LEVELS', 'The raw ramp, drawn on background/surface cards.');
  rows = rowsFrame(s, 24);
  lv.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('elevation/level/' + x.leaf, x.v, 420));
    const card = frame('card', { fixedW: 200, py: 26, px: 20 });
    bindFill(card, 'semantic/color/background/surface');
    card.cornerRadius = 8;
    applyShadow(card, x.v);
    card.appendChild(txt('level ' + x.leaf, { size: 12, fill: 'semantic/color/text/secondary' }));
    r.appendChild(card);
    rows.appendChild(r);
  });
  const er = grp('elevation.role.').sort((a, b) => a.leaf.localeCompare(b.leaf));
  s = section(root, 'ROLE ALIASES', 'Which surface uses which level.');
  rows = rowsFrame(s, 24);
  er.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    const match = lv.find((l) => l.v === x.v);
    r.appendChild(
      nameVal('elevation/role/' + x.leaf, x.v + (match ? '   →  level/' + match.leaf : ''), 420)
    );
    const card = frame('card', { fixedW: 200, py: 26, px: 20 });
    bindFill(card, 'semantic/color/background/surface');
    card.cornerRadius = 8;
    applyShadow(card, x.v);
    card.appendChild(txt(x.leaf, { size: 12, fill: 'semantic/color/text/secondary' }));
    r.appendChild(card);
    rows.appendChild(r);
  });
  // Self-check: a silently-skipped effect is exactly the failure this section
  // already shipped once. Every non-`none` token must have produced a shadow.
  const wantShadows = lv.concat(er).filter((x) => x.v !== 'none').length;
  if (shadowsApplied !== wantShadows)
    throw new Error('elevation: applied ' + shadowsApplied + ' shadows, expected ' + wantShadows);
  out.elevation = Object.assign(place(root, 4200), { shadowsApplied });

  // ─────────── MOTION ───────────
  root = shell(
    'Motion',
    'Motion has no rendered form, so this frame is a table rather than a specimen. Duration bars are drawn ' +
      'proportionally (1ms = 1px) purely to make the ramp legible at a glance — they are not a preview of the ' +
      'animation. Easing curves are recorded as their CSS value.'
  );
  const dur = grp('motion.duration.').sort((a, b) => px(a.v) - px(b.v));
  s = section(root, 'DURATIONS', null);
  rows = rowsFrame(s, 10);
  dur.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('motion/duration/' + x.leaf, x.v, 300));
    r.appendChild(rect(px(x.v), 14, { fill: 'accent/primary', radius: 2 }));
    rows.appendChild(r);
  });
  const eas = grp('motion.easing.');
  s = section(root, 'EASING', null);
  rows = rowsFrame(s, 10);
  eas.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('motion/easing/' + x.leaf, x.v, 300));
    rows.appendChild(r);
  });
  const mr = {};
  T.filter((t) => t.id.startsWith('motion.role.')).forEach((t) => {
    const parts = t.id.split('.');
    const role = parts[2],
      kind = parts[3];
    mr[role] = mr[role] || {};
    mr[role][kind] = t.dark;
  });
  s = section(root, 'ROLE ALIASES', 'Each interaction role pairs one duration with one curve.');
  rows = rowsFrame(s, 10);
  Object.keys(mr)
    .sort()
    .forEach((role) => {
      const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
      r.appendChild(
        nameVal('motion/role/' + role, mr[role].duration + '   ·   ' + mr[role].easing, 760)
      );
      rows.appendChild(r);
    });
  out.motion = place(root, 5600);

  // ─────────── LAYOUT ───────────
  root = shell(
    'Layout',
    'Container maximums and gutters. Bars are drawn to scale at 60% so the whole ramp fits one column.'
  );
  const cont = grp('layout.container.').sort((a, b) => px(a.v) - px(b.v));
  s = section(root, 'CONTAINERS', 'Max content widths for route shells and reading columns.');
  rows = rowsFrame(s, 12);
  cont.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('layout/container/' + x.leaf, x.v, 280));
    r.appendChild(
      rect(px(x.v) * 0.6, 22, {
        fill: 'semantic/color/background/elevated',
        radius: 3,
        stroke: 'semantic/color/border/strong',
      })
    );
    rows.appendChild(r);
  });
  const gut = grp('layout.gutter.').sort((a, b) => px(a.v) - px(b.v));
  s = section(root, 'GUTTERS', null);
  rows = rowsFrame(s, 10);
  gut.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('layout/gutter/' + x.leaf, x.v, 280));
    r.appendChild(rect(px(x.v), 16, { fill: 'accent/primary', radius: 2 }));
    rows.appendChild(r);
  });
  out.layout = place(root, 7000);

  return out;
});
