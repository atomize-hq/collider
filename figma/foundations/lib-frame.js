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

// Every numeric field that has a token behind it is BOUND, not merely set to
// the matching number — a literal that happens to agree with the scale today
// drifts silently the next time the scale moves, and this page is the one
// surface with no excuse for that. `num` still takes a raw number, but only for
// geometry genuinely derived at build time (a proportionally scaled specimen
// bar, a shadow's reach) where no token exists to bind.
const bindVar = (node, field, token) => {
  const v = V[token];
  if (!v) throw new Error('no variable "' + token + '" to bind to ' + field);
  node.setBoundVariable(field, v);
};
const num = (node, field, value) => {
  if (typeof value === 'string') bindVar(node, field, value);
  else node[field] = value;
};
// Figma binds each corner separately — there is no bindable `cornerRadius`.
const CORNERS = ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'];
const setRadius = (node, value) => CORNERS.forEach((f) => num(node, f, value));
// Two token families CANNOT be bound, because Figma reads those variables on a
// different scale than we author them: a `leading` multiplier of 1.5 binds as
// 1.5 PIXELS, and a `shape/opacity` of 0.7 binds as 0.7%. Read the number and
// apply it ourselves instead, so the page still derives from the token.
const varNum = (token) => {
  const v = V[token];
  if (!v) throw new Error('no variable "' + token + '"');
  return v.valuesByMode[Object.keys(v.valuesByMode)[0]];
};

const txt = (chars, o) => {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family: o.mono ? MONO : SANS, style: o.style || 'Regular' };
  t.characters = String(chars);
  num(t, 'fontSize', o.size || 'type/size/xs');
  if (o.font) bindVar(t, 'fontFamily', o.font);
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
  num(f, 'itemSpacing', o.gap == null ? 0 : o.gap);
  if (o.py == null) f.paddingTop = f.paddingBottom = 0;
  else {
    num(f, 'paddingTop', o.py);
    num(f, 'paddingBottom', o.py);
  }
  if (o.px == null) f.paddingLeft = f.paddingRight = 0;
  else {
    num(f, 'paddingLeft', o.px);
    num(f, 'paddingRight', o.px);
  }
  f.fills = [];
  if (o.radius != null) setRadius(f, o.radius);
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
// The artboard and its column widths are documentation layout, not system
// values — `layout/container/*` describes app shells and reading columns, so
// binding these to it would be a false claim. They stay literal on purpose.
const W = 1120;
const shell = (title, blurb) => {
  const name = 'Foundations · ' + title;
  // Wipe by the SAME name we are about to create. Keeping the wipe in the
  // individual builders let the two drift (a builder removing "Color" while
  // shell created "Colour"), which silently left a stale duplicate frame.
  const host = figma.root.children.find((p) => p.name === 'Foundations');
  host.children.filter((c) => c.name === name).forEach((c) => c.remove());
  const root = frame(name, {
    gap: 'spacing/14',
    py: 'spacing/16',
    px: 'spacing/16',
    fixedW: W + 2 * varNum('spacing/16'),
  });
  bindFill(root, 'semantic/color/background/base');
  const header = frame('header', { gap: 'spacing/2', fixedW: W });
  header.appendChild(txt(title, { size: 'type/size/2xl', style: 'SemiBold' }));
  header.appendChild(
    txt(blurb, { size: 'type/size/xs', width: 760, fill: 'semantic/color/text/secondary' })
  );
  root.appendChild(header);
  return root;
};
const section = (root, label, blurb) => {
  const s = frame('section/' + label, { gap: 'spacing/4', fixedW: W });
  s.appendChild(
    txt(label, {
      size: 'type/size/2xs',
      style: 'SemiBold',
      // The Type frame claims `tracking/wide` is what these section headers use.
      // It used to be a hand-picked 1.2px, which made that claim false.
      tracking: varNum('type/tracking/wide') * varNum('type/size/2xs'),
    })
  );
  if (blurb)
    s.appendChild(
      txt(blurb, { size: 'type/size/xs', width: 760, fill: 'semantic/color/text/tertiary' })
    );
  root.appendChild(s);
  return s;
};
const rowsFrame = (parent, gap) => {
  const r = frame('rows', { gap: gap == null ? 'spacing/2-5' : gap, fixedW: W });
  parent.appendChild(r);
  return r;
};
const nameVal = (name, value, w) => {
  const m = frame('meta', { gap: 'spacing/0-5', fixedW: w || 420 });
  m.appendChild(txt(name, { size: 'type/size/sm', style: 'Medium' }));
  m.appendChild(
    txt(value, { size: 'type/size/2xs', mono: true, fill: 'semantic/color/text/tertiary' })
  );
  return m;
};
