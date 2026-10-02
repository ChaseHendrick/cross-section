/* Props: furniture and fittings built from kit primitives.
 *
 * Convention: (x, y, z) is the centre of the object's front edge on the floor:
 * x the centre along the subject, y the floor height, z the depth of its nearest face.
 * Sizes in metres. Every prop returns useful anchors where it makes sense (a seat
 * height, a bunk's mattress, a lamp position) so scenes can place people precisely.
 */
import { XS, shade, rng, hash } from './core.js';
import { mat } from './kit.js';

export const props = {};
const M = (c, extra) => mat(Object.assign({ c }, extra || {}));

props.table = (k, x, y, z, o = {}) => {
  const w = o.w || 1.2, d = o.d || 0.8, h = o.h || 0.75, top = o.top || '#8a5a32';
  const x0 = x - w / 2, x1 = x + w / 2, leg = 0.05;
  for (const [lx, lz] of [[x0 + 0.04, z + 0.04], [x1 - 0.09, z + 0.04], [x0 + 0.04, z + d - 0.09], [x1 - 0.09, z + d - 0.09]]) {
    k.box(lx, y, lz, lx + leg, y + h - 0.04, lz + leg, M(shade(top, -0.2)));
  }
  if (o.cloth) k.box(x0 - 0.04, y + h - 0.22, z - 0.04, x1 + 0.04, y + h, z + d + 0.04, M(o.cloth, { pat: o.clothPat || 'none' }));
  else k.box(x0, y + h - 0.05, z, x1, y + h, z + d, M(top, { pat: 'grain' }));
  if (o.items !== false) {
    const r = rng(hash('table', x, y, z));
    const n = Math.max(1, Math.round(w / 0.45));
    for (let i = 0; i < n; i++) {
      const ix = x0 + (i + 0.5) * (w / n), iz = z + d * (0.3 + r() * 0.4), ty = y + h;
      const kind = o.items || r.pick(['plate', 'plate', 'cup', 'bottle', 'candle']);
      if (kind === 'plate' || kind === 'setting') { k.cyl(ix, ty, iz, 0.11, 0.015, M('#f6f2ea'), { seg: 12 }); if (kind === 'setting') k.cyl(ix + 0.12, ty, iz - 0.08, 0.03, 0.1, M('#d8e6ea'), { seg: 8 }); }
      else if (kind === 'cup') k.cyl(ix, ty, iz, 0.035, 0.08, M('#ece6d8'), { seg: 8 });
      else if (kind === 'bottle') { k.cyl(ix, ty, iz, 0.035, 0.2, M('#3a5a3a'), { seg: 8 }); k.cyl(ix, ty + 0.2, iz, 0.012, 0.07, M('#3a5a3a'), { seg: 6 }); }
      else if (kind === 'candle') { k.cyl(ix, ty, iz, 0.015, 0.16, M('#f2ead0'), { seg: 6 }); k.lamp(ix, ty + 0.19, iz, { r: 2.2, i: 0.6, color: '#ffc070', bulbR: 0.025, halo: 0.25, flicker: true }); }
      else if (kind === 'books') k.box(ix - 0.12, ty, iz - 0.08, ix + 0.12, ty + 0.06, iz + 0.08, M('#7a2a20'));
      else if (kind === 'bread') k.sphere(ix, ty + 0.04, iz, 0.08, M('#c8904a'), { seg: 8, rings: 5 });
    }
  }
  return { top: y + h };
};

props.chair = (k, x, y, z, o = {}) => {
  const c = o.color || '#7a4a28', f = o.face || 1, s = 0.42;
  k.box(x - s / 2, y + 0.42, z, x + s / 2, y + 0.46, z + s, M(c));
  const bx = f > 0 ? x - s / 2 : x + s / 2 - 0.04;
  k.box(bx, y + 0.46, z + 0.02, bx + 0.04, y + (o.tall ? 1.2 : 0.95), z + s - 0.02, M(shade(c, -0.08)));
  for (const lx of [x - s / 2 + 0.02, x + s / 2 - 0.05]) for (const lz of [z + 0.02, z + s - 0.05]) k.box(lx, y, lz, lx + 0.03, y + 0.42, lz + 0.03, M(shade(c, -0.2)));
  if (o.cushion) k.box(x - s / 2 + 0.02, y + 0.46, z + 0.02, x + s / 2 - 0.02, y + 0.52, z + s - 0.02, M(o.cushion));
  return { seat: y + 0.46, x, z: z + s / 2 };
};

props.armchair = (k, x, y, z, o = {}) => {
  const c = o.color || '#8a3a2a', w = o.w || 0.85, d = 0.8;
  k.box(x - w / 2, y, z, x + w / 2, y + 0.45, z + d, M(c));
  k.box(x - w / 2, y + 0.45, z + d - 0.18, x + w / 2, y + 1.0, z + d, M(shade(c, -0.06)));
  k.box(x - w / 2, y + 0.45, z, x - w / 2 + 0.14, y + 0.68, z + d, M(shade(c, -0.04)));
  k.box(x + w / 2 - 0.14, y + 0.45, z, x + w / 2, y + 0.68, z + d, M(shade(c, -0.04)));
  return { seat: y + 0.45, x, z: z + d * 0.45 };
};

props.bench = (k, x, y, z, o = {}) => {
  const w = o.w || 1.8, c = o.color || '#8a6a42', d = o.d || 0.35, h = o.h || 0.45;
  k.box(x - w / 2, y + h - 0.06, z, x + w / 2, y + h, z + d, M(c, { pat: 'grain' }));
  for (const lx of [x - w / 2 + 0.1, x + w / 2 - 0.15]) k.box(lx, y, z + 0.04, lx + 0.05, y + h - 0.06, z + d - 0.04, M(shade(c, -0.25)));
  return { seat: y + h };
};

// A bed along x. Returns where a sleeper's feet go (head towards -x unless head:'right').
props.bed = (k, x, y, z, o = {}) => {
  const w = o.w || 1.95, d = o.d || 0.95, h = o.h || 0.5, frame = o.frame || '#6a4228', blanket = o.blanket || '#7a8aa8';
  k.box(x - w / 2, y, z, x + w / 2, y + h - 0.12, z + d, M(frame));
  k.box(x - w / 2 + 0.03, y + h - 0.12, z + 0.02, x + w / 2 - 0.03, y + h, z + d - 0.02, M('#f2ede2'));
  const right = o.head === 'right';
  k.box(right ? x - w / 2 + 0.02 : x - w / 2 + 0.45, y + h - 0.1, z, right ? x + w / 2 - 0.45 : x + w / 2 - 0.02, y + h + 0.05, z + d - 0.02, M(blanket, { pat: o.quilt ? 'quilt' : 'none', c2: shade(blanket, 0.3) }));
  const px = right ? x + w / 2 - 0.42 : x - w / 2 + 0.06;
  k.box(px, y + h, z + 0.12, px + 0.36, y + h + 0.1, z + d - 0.12, M('#fbf8f0'));
  if (o.headboard !== false) { const hx = right ? x + w / 2 - 0.06 : x - w / 2; k.box(hx, y, z, hx + 0.06, y + h + 0.5, z + d, M(shade(frame, -0.08))); }
  return { feet: [right ? x - w / 2 + 0.15 : x + w / 2 - 0.15, y + h + 0.02, z + d / 2], face: right ? 1 : 0, heading: right ? Math.PI : 0 };
};

// Stacked bunks. Returns mattress anchors for sleepers (feet at the +x end, heading 0).
props.bunk = (k, x, y, z, o = {}) => {
  const w = o.w || 1.9, d = o.d || 0.75, n = o.levels || 2, gap = o.gap || 0.9, c = o.color || '#8a6a4a';
  const out = [];
  const r = rng(hash('bunk', x, y, z));
  for (let i = 0; i < n; i++) {
    const by = y + 0.35 + i * gap;
    k.box(x - w / 2, by - 0.1, z, x + w / 2, by, z + d, M(c));
    const bl = o.blanket || r.pick(['#8a5a4a', '#6a7a8a', '#7a6a4a', '#5a6a5a']);
    k.box(x - w / 2 + 0.03, by, z + 0.02, x + w / 2 - 0.03, by + 0.09, z + d - 0.02, M(bl));
    k.box(x - w / 2 + 0.05, by + 0.09, z + 0.1, x - w / 2 + 0.4, by + 0.17, z + d - 0.1, M('#f2eee4'));
    out.push({ feet: [x + w / 2 - 0.15, by + 0.1, z + d / 2], heading: 0 });
  }
  for (const px of [x - w / 2, x + w / 2 - 0.05]) for (const pz of [z, z + d - 0.05]) k.box(px, y, pz, px + 0.05, y + 0.35 + (n - 1) * gap + 0.25, pz + 0.05, M(shade(c, -0.15)));
  return out;
};

// A canvas hammock slung along x. Returns a sleeper anchor.
props.hammock = (k, x, y, z, o = {}) => {
  const w = o.w || 1.8, sag = o.sag || 0.35, c = o.color || '#d8ccb0', dd = o.d || 0.5;
  const sections = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, xx = x - w / 2 + w * t, yy = y - Math.sin(Math.PI * t) * sag;
    const hw = 0.06 + Math.sin(Math.PI * t) * dd * 0.5;
    sections.push({ x: xx, pts: [[z + dd / 2 - hw, yy + 0.02], [z + dd / 2, yy - 0.06], [z + dd / 2 + hw, yy + 0.02], [z + dd / 2, yy + 0.05]] });
  }
  k.loft(sections, M(c, { pat: 'canvas' }));
  k.rope([x - w / 2, y, z + dd / 2], [x - w / 2 - 0.35, y + 0.25, z + dd / 2], 0.01, M('#b8955a'), 0.02, 3);
  k.rope([x + w / 2, y, z + dd / 2], [x + w / 2 + 0.35, y + 0.25, z + dd / 2], 0.01, M('#b8955a'), 0.02, 3);
  return { feet: [x + w / 2 - 0.25, y - sag * 0.7, z + dd / 2], heading: 0 };
};

props.shelves = (k, x, y, z, o = {}) => {
  const w = o.w || 1.2, h = o.h || 1.8, d = o.d || 0.35, c = o.color || '#7a5432', n = o.n || 4;
  k.box(x - w / 2, y, z + d - 0.03, x + w / 2, y + h, z + d, M(shade(c, -0.25)));
  k.box(x - w / 2, y, z, x - w / 2 + 0.03, y + h, z + d, M(c));
  k.box(x + w / 2 - 0.03, y, z, x + w / 2, y + h, z + d, M(c));
  for (let i = 0; i <= n; i++) {
    const sy = y + (h * i) / n;
    k.box(x - w / 2, sy, z, x + w / 2, sy + 0.03, z + d, M(c));
    if (i === n) break;
    const kind = o.items || 'books';
    const ih = (h / n) * 0.75;
    if (kind === 'books' || kind === 'mixed') k.box(x - w / 2 + 0.04, sy + 0.03, z + 0.06, x + w / 2 - 0.04, sy + 0.03 + ih, z + d - 0.04, M('#7a3a2a', { pat: 'books', c2: '#c8b48a' }));
    else {
      const r = rng(hash('shelf', x, sy));
      for (let ix = x - w / 2 + 0.1; ix < x + w / 2 - 0.08; ix += 0.16) {
        const col = kind === 'jars' ? r.pick(['#c8b890', '#8a9a7a', '#d8d0b8']) : kind === 'bottles' ? r.pick(['#3a5a3a', '#5a3a2a', '#2a3a4a']) : r.pick(['#f4f0e8', '#d8d0c0']);
        if (kind === 'plates') k.box(ix - 0.06, sy + 0.03, z + d - 0.08, ix + 0.06, sy + 0.03 + 0.2, z + d - 0.06, M(col));
        else k.cyl(ix, sy + 0.03, z + d / 2, 0.05, ih * (0.6 + r() * 0.35), M(col), { seg: 8 });
      }
    }
  }
};

props.stove = (k, x, y, z, o = {}) => {
  const w = o.w || 1.6, h = o.h || 0.85, d = o.d || 0.7, c = o.color || '#34343a';
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, M(c));
  for (let i = 0; i < Math.max(1, Math.floor(w / 0.5)); i++) {
    const dx = x - w / 2 + 0.12 + i * 0.5;
    k.box(dx, y + 0.15, z - 0.02, dx + 0.34, y + 0.5, z, M('#26262a'));
    k.box(dx + 0.14, y + 0.3, z - 0.03, dx + 0.2, y + 0.34, z - 0.02, M('#b89a5a'));
  }
  const pots = o.pots == null ? 2 : o.pots;
  for (let i = 0; i < pots; i++) {
    const px = x - w / 2 + 0.35 + i * (w / Math.max(pots, 1)) * 0.9;
    k.cyl(px, y + h, z + d * 0.5, 0.17, 0.26, M(i % 2 ? '#8a8a8a' : '#b06a3a'), { seg: 12 });
  }
  if (o.flue !== false) k.box(x + w / 2 - 0.3, y + h, z + d - 0.2, x + w / 2 - 0.12, y + h + (o.flueH || 1.4), z + d - 0.05, M('#2a2a2c'));
  if (o.fire !== false) k.lamp(x - w / 2 + 0.3, y + 0.32, z - 0.05, { always: true, r: 2.2, i: 0.6, color: '#ff8a40', bulb: false, halo: 0.35, flicker: true });
};

props.fireplace = (k, x, y, z, o = {}) => {
  const w = o.w || 1.6, h = o.h || 1.4, d = o.d || 0.5, c = o.stone || '#b8ab94';
  k.box(x - w / 2 - 0.25, y + h, z - 0.1, x + w / 2 + 0.25, y + h + 0.2, z + d, M(c, { pat: 'ashlar', s: 0.2 }));
  k.box(x - w / 2 - 0.25, y, z - 0.05, x - w / 2, y + h, z + d, M(c, { pat: 'ashlar', s: 0.2 }));
  k.box(x + w / 2, y, z - 0.05, x + w / 2 + 0.25, y + h, z + d, M(c, { pat: 'ashlar', s: 0.2 }));
  k.box(x - w / 2, y, z + d - 0.05, x + w / 2, y + h, z + d, M('#2a221e'));
  for (let i = 0; i < 3; i++) k.cyl(x - 0.4 + i * 0.25, y + 0.08, z + 0.1, 0.07, 0.6, M('#6a4428'), { axis: 'z', seg: 7 });
  if (o.fire !== false) k.lamp(x, y + 0.3, z + d * 0.4, { always: true, r: o.reach || 5, i: 0.9, color: '#ff8a40', bulb: false, halo: 0.6, flicker: true });
  return { fire: [x, y + 0.2, z + d * 0.4] };
};

props.barrel = (k, x, y, z, o = {}) => {
  const r = o.r || 0.3, h = o.h || 0.85, c = o.color || '#9a6a3a';
  const pts = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([r * (0.86 + 0.14 * Math.sin(Math.PI * t)), y + h * t]); }
  k.lathe(pts, x, z + r, M(c, { pat: 'grain' }), { seg: 14 });
  for (const hy of [0.12, 0.5, 0.88]) {
    const rr = r * (0.86 + 0.14 * Math.sin(Math.PI * hy)) + 0.008;
    k.lathe([[rr, y + h * hy - 0.025], [rr, y + h * hy + 0.025]], x, z + r, M('#4a4a4a'), { seg: 14, capTop: false, capBot: false });
  }
};

props.cask = (k, x, y, z, o = {}) => {
  const r = o.r || 0.32, l = o.l || 0.8, c = o.color || '#9a6a3a';
  k.cyl(x - l / 2, y + r, z + r, r * 0.9, l, M(c, { pat: 'grain' }), { axis: 'x', seg: 14 });
  for (const t of [0.1, 0.9]) k.cyl(x - l / 2 + l * t - 0.02, y + r, z + r, r * 0.93, 0.04, M('#4a4a4a'), { axis: 'x', seg: 14 });
};

props.crate = (k, x, y, z, o = {}) => {
  const w = o.w || 0.6, h = o.h || 0.5, d = o.d || 0.5, c = o.color || '#b08a52';
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, M(c, { pat: 'planks', s: h / 3, c2: shade(c, -0.15) }));
};

props.sack = (k, x, y, z, o = {}) => {
  const c = o.color || '#c8b080', w = o.w || 0.5, h = o.h || 0.55;
  k.sphere(x, y + h * 0.45, z + 0.22, w * 0.5, M(c), { seg: 10, rings: 6 });
};

// Hanging lamp from a ceiling at yCeil. Returns its light.
props.lamp = (k, x, yCeil, z, o = {}) => {
  const drop = o.drop || 0.5;
  k.cyl(x, yCeil - drop, z, 0.008, drop, M('#3a3028'), { seg: 4 });
  const y = yCeil - drop;
  if (o.kind === 'lantern') k.box(x - 0.08, y - 0.25, z - 0.08, x + 0.08, y, z + 0.08, M('#3a3a3a'));
  else if (o.kind === 'chandelier') {
    k.lathe([[0.02, y - 0.3], [0.45, y - 0.2], [0.42, y - 0.12], [0.05, y]], x, z, M('#d8b860'), { seg: 16 });
  } else k.lathe([[0.02, y - 0.02], [0.18, y - 0.15], [0.19, y - 0.18], [0.0, y - 0.17]], x, z, M(o.color || '#c8a050'), { seg: 12 });
  return k.lamp(x, y - 0.18, z, { r: o.r || 4.5, i: o.i != null ? o.i : 1, color: o.light || '#ffcf8a', bulbR: 0.06, halo: o.halo != null ? o.halo : 0.5, flicker: !!o.flicker });
};

props.desk = (k, x, y, z, o = {}) => {
  const w = o.w || 1.3;
  props.table(k, x, y, z, Object.assign({ w, d: 0.65, h: 0.76, items: 'books' }, o));
  k.box(x + w / 2 - 0.45, y, z + 0.02, x + w / 2 - 0.02, y + 0.7, z + 0.6, M(shade(o.top || '#8a5a32', -0.1)));
};

props.chest = (k, x, y, z, o = {}) => {
  const w = o.w || 0.9, h = o.h || 0.5, d = o.d || 0.5, c = o.color || '#7a4a28';
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, M(c, { pat: 'planks', s: 0.12 }));
  k.box(x - w / 2 - 0.01, y + h - 0.08, z - 0.01, x + w / 2 + 0.01, y + h - 0.04, z + d + 0.01, M('#4a4a4a'));
};

props.wardrobe = (k, x, y, z, o = {}) => {
  const w = o.w || 1.1, h = o.h || 2.0, d = o.d || 0.55, c = o.color || '#7a4a2a';
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, M(c, { pat: 'panels', s: w / 2, c2: shade(c, -0.1) }));
};

props.clock = (k, x, y, z, o = {}) => { // a wall clock on a back wall at depth z
  const r = o.r || 0.18;
  k.cyl(x, y, z - 0.04, r, 0.04, M('#f4ecd8'), { axis: 'z', seg: 18 });
  k.box(x - 0.006, y, z - 0.05, x + 0.006, y + r * 0.7, z - 0.045, M('#1a1410'));
  k.box(x, y - 0.006, z - 0.05, x + r * 0.5, y + 0.006, z - 0.045, M('#1a1410'));
};

props.piano = (k, x, y, z, o = {}) => {
  const w = o.w || 1.5, c = o.color || '#1e1a18';
  k.box(x - w / 2, y, z + 0.2, x + w / 2, y + 1.25, z + 0.65, M(c));
  k.box(x - w / 2, y + 0.7, z, x + w / 2, y + 0.75, z + 0.2, M('#f4f0e6', { pat: 'bars', s: 0.024 }));
  return { seat: y + 0.48, x, z: z - 0.5 };
};

props.plant = (k, x, y, z, o = {}) => { // potted palm, the lounge staple of the 1930s
  const h = o.h || 1.4;
  k.lathe([[0.16, y], [0.22, y + 0.38], [0.2, y + 0.4]], x, z + 0.25, M(o.pot || '#a85a3a'), { seg: 12 });
  const r = rng(hash('plant', x, y, z));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + r() * 0.4, L = h * (0.5 + r() * 0.4);
    const pts = [];
    for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push([x + Math.cos(a) * L * 0.55 * t, y + 0.4 + Math.sin(Math.PI * 0.8 * t) * L * 0.75, z + 0.25 + Math.sin(a) * L * 0.4 * t]); }
    k.tube(pts, 0.035, M(i % 2 ? '#5a7a3a' : '#4a6a32'), { seg: 4 });
  }
};

props.bath = (k, x, y, z, o = {}) => {
  const w = o.w || 1.6, d = o.d || 0.7;
  k.box(x - w / 2, y + 0.1, z, x + w / 2, y + 0.6, z + d, M('#f4f2ec'));
  k.box(x - w / 2 + 0.06, y + 0.55, z + 0.06, x + w / 2 - 0.06, y + 0.6, z + d - 0.06, M('#c8dce4'));
};

props.sink = (k, x, y, z, o = {}) => {
  k.box(x - 0.3, y + 0.7, z, x + 0.3, y + 0.85, z + 0.45, M('#f0eee8'));
  k.box(x - 0.05, y, z + 0.25, x + 0.05, y + 0.7, z + 0.35, M('#e8e4dc'));
  if (o.mirror !== false) k.box(x - 0.25, y + 1.1, z + 0.56, x + 0.25, y + 1.7, z + 0.6, M('#c8d8dc'));
};

props.rug = (k, x, y, z, o = {}) => {
  const w = o.w || 2, d = o.d || 1.2, c = o.color || '#8a3a2a';
  k.box(x - w / 2, y, z, x + w / 2, y + 0.012, z + d, M(c, { pat: 'carpet', c2: o.c2 || '#d8b860' }));
};

// On a back wall at depth z.
props.picture = (k, x, y, z, o = {}) => {
  const w = o.w || 0.8, h = o.h || 0.6;
  k.box(x - w / 2, y, z - 0.04, x + w / 2, y + h, z, M(o.frame || '#b08a3a'));
  k.box(x - w / 2 + 0.06, y + 0.06, z - 0.05, x + w / 2 - 0.06, y + h - 0.06, z - 0.04, M(o.color || '#6a8a9a', { pat: 'rock', c2: shade(o.color || '#6a8a9a', 0.3) }));
};

// A window in a back wall: glazing that reads as daylight by day and warm light by night.
props.window = (k, x, y, z, o = {}) => {
  const w = o.w || 1.0, h = o.h || 1.2;
  k.box(x - w / 2, y, z - 0.02, x + w / 2, y + h, z + 0.02, M(o.glass || '#b8d0dc', { pat: 'panes', s: o.pane || w / 2, c2: o.night || '#ffd890', glow: 'night' }));
  if (o.sill !== false) k.box(x - w / 2 - 0.06, y - 0.06, z - 0.12, x + w / 2 + 0.06, y, z + 0.02, M(o.frame || '#e8e0cc'));
};

props.porthole = (k, x, y, z, o = {}) => {
  const r = o.r || 0.22;
  k.cyl(x, y, z - 0.05, r * 1.28, 0.05, M(o.rim || '#b8a070'), { axis: 'z', seg: 16 });
  k.cyl(x, y, z - 0.07, r, 0.03, M(o.glass || '#9ab8cc', { c2: o.night || '#ffd890', glow: 'night', noEdge: false }), { axis: 'z', seg: 16 });
};

props.door = (k, x, y, z, o = {}) => {
  const w = o.w || 0.85, h = o.h || 2.0, c = o.color || '#7a4a28';
  if (o.open) k.box(x - w / 2, y, z - 0.01, x + w / 2, y + h, z + 0.01, M('#2a2420'));
  else {
    k.box(x - w / 2, y, z - 0.05, x + w / 2, y + h, z, M(c, { pat: 'panels', s: w / 2, c2: shade(c, -0.08) }));
    k.sphere(x + w / 2 - 0.1, y + 1.0, z - 0.07, 0.03, M('#c8a050'), { seg: 6, rings: 4 });
  }
};

// A straight flight of stairs from (x0, y0) up to (x1, y1), between depths z0 and z1.
props.stairs = (k, x0, y0, x1, y1, z0, z1, o = {}) => {
  const n = o.steps || Math.max(3, Math.round(Math.abs(y1 - y0) / 0.19));
  const c = o.color || '#8a6a42';
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n;
  for (let i = 0; i < n; i++) {
    const sx = x0 + dx * i;
    const a = Math.min(sx, sx + dx), b = Math.max(sx, sx + dx);
    k.box(a, o.solid ? y0 : y0 + dy * i - 0.05, z0, b, y0 + dy * (i + 1), z1, M(c));
  }
  if (o.rail !== false) {
    const h = 0.9;
    k.tube([[x0, y0 + h, z0 + 0.05], [x1, y1 + h, z0 + 0.05]], 0.025, M(o.railColor || '#5a3a20'));
    for (let i = 0; i <= n; i += Math.max(2, Math.round(n / 4))) k.cyl(x0 + dx * i, y0 + dy * i, z0 + 0.05, 0.015, h, M(o.railColor || '#5a3a20'), { seg: 5 });
  }
  return { n };
};

props.ladder = (k, x, y0, y1, z, o = {}) => {
  const w = o.w || 0.45, c = o.color || '#9a7a4a';
  const lean = o.lean || 0;
  k.beam([x - w / 2, y0, z + lean], [x - w / 2, y1, z], 0.05, M(c));
  k.beam([x + w / 2, y0, z + lean], [x + w / 2, y1, z], 0.05, M(c));
  for (let y = y0 + 0.28; y < y1; y += 0.3) { const t = (y - y0) / (y1 - y0); k.cyl(x - w / 2, y, z + lean * (1 - t), 0.018, w, M(shade(c, -0.1)), { axis: 'x', seg: 5 }); }
};

// A railing along x at height y, depth z.
props.rail = (k, x0, x1, y, z, o = {}) => {
  const h = o.h || 1.0, step = o.step || 1.2, c = M(o.color || '#3a3a3a');
  const r = o.r || 0.025;
  k.cyl(x0, y + h, z, r, x1 - x0, c, { axis: 'x', seg: 6 });
  if (o.mid !== false) k.cyl(x0, y + h * 0.5, z, r * 0.7, x1 - x0, c, { axis: 'x', seg: 5 });
  for (let x = x0; x <= x1 + 1e-6; x += step) k.cyl(x, y, z, r * 0.8, h, c, { seg: 5 });
};

props.coil = (k, x, y, z, o = {}) => {
  const r = o.r || 0.35;
  for (let i = 0; i < 4; i++) k.lathe([[r - i * 0.06, y + i * 0.04], [r - i * 0.06 + 0.04, y + i * 0.04 + 0.02], [r - i * 0.06, y + i * 0.04 + 0.04]], x, z + r, M('#c8a868'), { seg: 16, capTop: false, capBot: false });
};

props.anvil = (k, x, y, z) => {
  k.box(x - 0.15, y, z + 0.1, x + 0.15, y + 0.5, z + 0.4, M('#6a4a2a'));
  k.box(x - 0.3, y + 0.5, z + 0.12, x + 0.3, y + 0.72, z + 0.38, M('#3a3a3e'));
};

props.cauldron = (k, x, y, z, o = {}) => {
  const r = o.r || 0.4;
  k.lathe([[r * 0.5, y + 0.1], [r, y + r * 0.6], [r * 0.95, y + r * 1.15]], x, z + r, M('#2e2c2a'), { seg: 16, capTop: false });
  k.cyl(x, y + r * 1.0, z + r, r * 0.9, 0.02, M(o.contents || '#6a5a3a'), { seg: 16 });
};

props.lifebuoy = (k, x, y, z) => {
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
    const p0 = [x + Math.cos(a0) * 0.3, y + Math.sin(a0) * 0.3, z - 0.06], p1 = [x + Math.cos(a1) * 0.3, y + Math.sin(a1) * 0.3, z - 0.06];
    k.tube([p0, p1], 0.08, M(i % 2 ? '#c83a2a' : '#ece6da'), { seg: 6 });
  }
};

XS.props = props;
