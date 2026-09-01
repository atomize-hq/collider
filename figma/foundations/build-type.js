const T = __TOKENS__;
const get = (id) => (T.find((t) => t.id === id) || {}).dark;
const grp = (p) =>
  T.filter((t) => t.id.startsWith(p)).map((t) => ({
    id: t.id,
    leaf: t.id.slice(p.length),
    v: t.dark,
  }));
const px = (s) => parseFloat(String(s));

const fonts = [];
['Regular', 'Medium', 'SemiBold', 'Bold'].forEach((s) =>
  fonts.push({ family: 'Poppins', style: s })
);
['Regular', 'Medium'].forEach((s) => fonts.push({ family: 'Roboto Mono', style: s }));

return Promise.all(fonts.map((f) => figma.loadFontAsync(f).catch(() => null))).then(() => {
  const page = figma.root.children.find((p) => p.name === 'Foundations');
  figma.currentPage = page;

  __LIB__;

  const root = shell(
    'Type',
    'Two families: Poppins for UI, Roboto Mono for code and numerals. Samples below are live text at the ' +
      'token’s real size and weight, so this frame is a specimen, not a table of numbers. ' +
      'Role aliases at the bottom record the usage vocabulary inherited from Collider-Old.'
  );

  // FONT FAMILIES
  let s = section(
    root,
    'FONT FAMILIES',
    'The role layer reads these as --font-sans and --font-mono.'
  );
  let rows = rowsFrame(s, 20);
  [
    ['type/font/poppins', get('type.font.poppins'), 'UI — headings, body, labels', false],
    [
      'type/font/roboto-mono',
      get('type.font.roboto-mono'),
      'Code, paths, numerals, terminal',
      true,
    ],
  ].forEach(([name, fam, use, mono]) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal(name, fam + '  ·  ' + use, 420));
    r.appendChild(txt('Aa Bb Cc 0123', { size: 28, mono: mono, style: 'Medium' }));
    rows.appendChild(r);
  });

  // SIZE RAMP
  const sizes = grp('type.size.').sort((a, b) => px(a.v) - px(b.v));
  s = section(
    root,
    'SIZE RAMP',
    'Seven steps, 2pt-tuned for Collider. Each line is set at its own token size.'
  );
  rows = rowsFrame(s, 14);
  sizes.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('type/size/' + x.leaf, x.v, 300));
    r.appendChild(txt('The quick brown fox jumps', { size: px(x.v) }));
    rows.appendChild(r);
  });

  // WEIGHTS
  const wts = grp('type.weight.').sort((a, b) => Number(a.v) - Number(b.v));
  const styleFor = { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };
  s = section(root, 'WEIGHTS', 'Poppins ships all four. Roboto Mono is used at 400 and 500 only.');
  rows = rowsFrame(s, 14);
  wts.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(
      nameVal('type/weight/' + x.leaf, String(x.v) + '  ·  ' + styleFor[String(x.v)], 300)
    );
    r.appendChild(txt('The quick brown fox jumps', { size: 18, style: styleFor[String(x.v)] }));
    rows.appendChild(r);
  });

  // LEADING
  const lead = grp('type.leading.').sort((a, b) => Number(a.v) - Number(b.v));
  s = section(root, 'LEADING', 'Line-height multipliers, shown on wrapped body copy at 14px.');
  rows = rowsFrame(s, 20);
  lead.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, fixedW: W });
    r.appendChild(nameVal('type/leading/' + x.leaf, String(x.v), 300));
    r.appendChild(
      txt(
        'Line height changes how dense a block of running text feels. This paragraph wraps so the effect is visible across lines.',
        {
          size: 14,
          width: 620,
          lineHeight: Number(x.v) * 100,
          fill: 'semantic/color/text/secondary',
        }
      )
    );
    rows.appendChild(r);
  });

  // TRACKING
  const trk = grp('type.tracking.');
  s = section(
    root,
    'TRACKING',
    'Letter-spacing. `wide` is for small uppercase labels like the section headers on this page.'
  );
  rows = rowsFrame(s, 14);
  trk.forEach((x) => {
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(nameVal('type/tracking/' + x.leaf, String(x.v), 300));
    r.appendChild(
      txt('SECTION LABEL · SPECIMEN', {
        size: 12,
        style: 'SemiBold',
        tracking: parseFloat(String(x.v)) * 12,
      })
    );
    rows.appendChild(r);
  });

  // ROLE ALIASES
  const roles = grp('type.role.').sort((a, b) => px(a.v) - px(b.v));
  s = section(
    root,
    'ROLE ALIASES',
    'Usage-named aliases onto the size ramp, carried over from Collider-Old. New work picks from the ramp; ' +
      'this block grows as atoms formalise.'
  );
  rows = rowsFrame(s, 12);
  roles.forEach((x) => {
    const match = sizes.find((sz) => px(sz.v) === px(x.v));
    const r = frame('row', { dir: 'HORIZONTAL', gap: 24, align: 'CENTER', fixedW: W });
    r.appendChild(
      nameVal('type/role/' + x.leaf, x.v + (match ? '  →  type/size/' + match.leaf : ''), 420)
    );
    r.appendChild(
      txt(x.leaf.replace(/-/g, ' '), {
        size: px(x.v),
        mono: x.leaf === 'output-line' || x.leaf === 'path',
      })
    );
    rows.appendChild(r);
  });

  page.appendChild(root);
  root.x = 1400;
  root.y = 0;
  return { frame: root.id, width: root.width, height: root.height };
});
