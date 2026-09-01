const SECTIONS = __SECTIONS__;
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

  const root = shell(
    'Colour',
    'Every swatch is bound to its Figma variable, so this page follows the mode switcher. Values are written ' +
      'dark / light; a single value means the token is identical in both modes. Contrast ratios are measured ' +
      'against background/base and are static text — a ratio cannot be variable-bound, so both modes are printed.'
  );

  let count = 0;
  SECTIONS.forEach((sec) => {
    const s = section(root, sec.label, sec.blurb);
    const rows = rowsFrame(s, 8);
    sec.rows.forEach((r) => {
      const row = frame('row/' + r.name, {
        dir: 'HORIZONTAL',
        gap: 20,
        align: 'CENTER',
        fixedW: W,
      });
      const sw = figma.createRectangle();
      sw.name = 'swatch';
      sw.resize(64, 48);
      sw.cornerRadius = 6;
      if (!bindFill(sw, r.name)) sw.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 1 } }];
      bindStroke(sw, 'semantic/color/border/default');
      sw.strokeWeight = 1;
      row.appendChild(sw);

      const valueLine = r.themed ? r.dark + '   /   ' + r.light : r.dark + '   both modes';
      row.appendChild(nameVal(r.name, valueLine, 460));

      const metric = r.metric || sec.metric;
      if (metric && r.crDark != null) {
        const cr = frame('contrast', { gap: 3, fixedW: 240 });
        const verdict = (n) =>
          metric === 'text'
            ? n >= 4.5
              ? 'AA'
              : n >= 3
                ? 'AA-large only'
                : 'below AA'
            : metric === 'ui'
              ? n >= 3
                ? 'pass 3:1'
                : 'below 3:1'
              : 'ratio only';
        cr.appendChild(
          txt(r.crDark.toFixed(2) + ' / ' + r.crLight.toFixed(2), {
            size: 11,
            mono: true,
            fill: 'semantic/color/text/secondary',
          })
        );
        const vd = verdict(r.crDark),
          vl = verdict(r.crLight);
        const bad = [vd, vl].some((x) => x.indexOf('below') === 0 || x === 'AA-large only');
        const label =
          metric === 'info' ? 'vs ' + r.against.split('/').slice(-2).join('/') : vd + ' / ' + vl;
        cr.appendChild(
          txt(label, {
            size: 10,
            style: bad ? 'Medium' : 'Regular',
            fill: bad ? 'semantic/color/text/caution' : 'semantic/color/text/tertiary',
          })
        );
        row.appendChild(cr);
      }
      rows.appendChild(row);
      count++;
    });
  });

  page.appendChild(root);
  root.x = 0;
  root.y = 0;
  return { frame: root.id, width: root.width, height: root.height, swatches: count };
});
