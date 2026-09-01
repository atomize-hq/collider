const SANS = 'Poppins',
  MONO = 'Roboto Mono';
const V = {};
figma.variables.getLocalVariables().forEach((v) => (V[v.name] = v));
const bindFill = (node, varName) => {
  const v = V[varName];
  if (!v) return false;
  node.fills = [
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 },
      'color',
      v
    ),
  ];
  return true;
};
const bindStroke = (node, varName) => {
  const v = V[varName];
  if (!v) return false;
  node.strokes = [
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 1 },
      'color',
      v
    ),
  ];
  return true;
};
const txt = (chars, o) => {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family: o.mono ? MONO : SANS, style: o.style || 'Regular' };
  t.fontSize = o.size || 12;
  t.characters = String(chars);
  if (o.tracking) t.letterSpacing = { unit: 'PIXELS', value: o.tracking };
  if (o.lineHeight) t.lineHeight = { unit: 'PERCENT', value: o.lineHeight };
  bindFill(t, o.fill || 'semantic/color/text/primary');
  if (o.width) {
    t.resize(o.width, t.height);
    t.textAutoResize = 'HEIGHT';
  } else t.textAutoResize = 'WIDTH_AND_HEIGHT';
  return t;
};
const frame = (name, o) => {
  o = o || {};
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = o.dir || 'VERTICAL';
  f.itemSpacing = o.gap == null ? 0 : o.gap;
  f.paddingTop = f.paddingBottom = o.py || 0;
  f.paddingLeft = f.paddingRight = o.px || 0;
  f.fills = [];
  // Width is the PRIMARY axis for a horizontal frame and the COUNTER axis for a
  // vertical one. Pinning the wrong axis fixes the height instead of the width,
  // which locks every row to Figma's default 100px.
  const horiz = f.layoutMode === 'HORIZONTAL';
  if (o.fixedW) {
    f.resize(o.fixedW, f.height);
    f.primaryAxisSizingMode = horiz ? 'FIXED' : 'AUTO';
    f.counterAxisSizingMode = horiz ? 'AUTO' : 'FIXED';
  } else {
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
  }
  if (o.align) f.counterAxisAlignItems = o.align;
  return f;
};
const W = 1120;
const shell = (title, blurb) => {
  const name = 'Foundations · ' + title;
  // Wipe by the SAME name we are about to create. Keeping the wipe in the
  // individual builders let the two drift (a builder removing "Color" while
  // shell created "Colour"), which silently left a stale duplicate frame.
  const host = figma.root.children.find((p) => p.name === 'Foundations');
  host.children.filter((c) => c.name === name).forEach((c) => c.remove());
  const root = frame(name, { gap: 56, py: 64, px: 64, fixedW: W + 128 });
  bindFill(root, 'semantic/color/background/base');
  const header = frame('header', { gap: 8, fixedW: W });
  header.appendChild(txt(title, { size: 32, style: 'SemiBold' }));
  header.appendChild(txt(blurb, { size: 13, width: 760, fill: 'semantic/color/text/secondary' }));
  root.appendChild(header);
  return root;
};
const section = (root, label, blurb) => {
  const s = frame('section/' + label, { gap: 16, fixedW: W });
  s.appendChild(txt(label, { size: 11, style: 'SemiBold', tracking: 1.2 }));
  if (blurb)
    s.appendChild(txt(blurb, { size: 12, width: 760, fill: 'semantic/color/text/tertiary' }));
  root.appendChild(s);
  return s;
};
const rowsFrame = (parent, gap) => {
  const r = frame('rows', { gap: gap == null ? 10 : gap, fixedW: W });
  parent.appendChild(r);
  return r;
};
const nameVal = (name, value, w) => {
  const m = frame('meta', { gap: 3, fixedW: w || 420 });
  m.appendChild(txt(name, { size: 13, style: 'Medium' }));
  m.appendChild(txt(value, { size: 11, mono: true, fill: 'semantic/color/text/tertiary' }));
  return m;
};
