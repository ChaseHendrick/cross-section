/* The Atlantic Liner: cheap furniture and fittings.
 *
 * Props here are deliberately frugal (a dozen to a few dozen triangles each) because a
 * liner needs thousands of them. Positions follow the props.js convention: (x, y, z) is
 * the centre of the front edge on the floor. Each returns anchors for people when useful.
 */
import { mat, shade } from '../../engine/index.js';

export const C = (c, extra) => mat(Object.assign({ c }, extra || {}));

// A chair or armchair as an upholstered block with a back. face: 1 (+x), -1 (-x) or 'out'.
export function chair(k, x, y, z, c = '#8a3a2a', face = 'out', o = {}) {
  const w = o.w || 0.46, d = o.d || 0.46, sh = o.sh || 0.45, bh = o.bh || 0.5;
  const m = C(c), mb = C(shade(c, -0.12));
  if (o.legs) {
    k.box(x - w / 2, y + sh - 0.07, z, x + w / 2, y + sh, z + d, m);
    k.box(x - 0.03, y, z + d / 2 - 0.03, x + 0.03, y + sh - 0.07, z + d / 2 + 0.03, C('#3a3634'));
  } else k.box(x - w / 2, y, z, x + w / 2, y + sh, z + d, m);
  if (face === 'out') k.box(x - w / 2, y + sh, z + d - 0.1, x + w / 2, y + sh + bh, z + d, mb);
  else if (face === 'in') k.box(x - w / 2, y + sh, z, x + w / 2, y + sh + bh, z + 0.1, mb);
  else if (face > 0) k.box(x - w / 2, y + sh, z, x - w / 2 + 0.1, y + sh + bh, z + d, mb);
  else k.box(x + w / 2 - 0.1, y + sh, z, x + w / 2, y + sh + bh, z + d, mb);
  return { x, y, z: z + d / 2, face, seat: sh + 0.02 };
}

// A table: top and a pedestal (or a cloth hanging to the floor).
export function table(k, x, y, z, w, d, o = {}) {
  const h = o.h || 0.74, top = o.top || '#7a5232';
  if (o.cloth) k.box(x - w / 2, y + h - 0.25, z, x + w / 2, y + h, z + d, C(o.cloth, { c2: shade(o.cloth, -0.06) }));
  else k.box(x - w / 2, y + h - 0.05, z, x + w / 2, y + h, z + d, C(top, { pat: 'grain', c2: shade(top, -0.15) }));
  k.box(x - 0.06, y, z + d / 2 - 0.06, x + 0.06, y + h - 0.05, z + d / 2 + 0.06, C(shade(top, -0.3)));
  if (o.items) {
    const n = Math.max(1, Math.round(w / 0.5));
    for (let i = 0; i < n; i++) {
      const ix = x - w / 2 + (i + 0.5) * (w / n);
      if (o.items === 'set') { k.box(ix - 0.11, y + h, z + d * 0.25, ix + 0.11, y + h + 0.015, z + d * 0.25 + 0.2, C('#f6f2ea')); if (i % 2 === 0) k.box(ix + 0.08, y + h, z + d * 0.6, ix + 0.12, y + h + 0.14, z + d * 0.6 + 0.04, C('#d8e6ea')); }
      else if (o.items === 'cups') k.box(ix - 0.04, y + h, z + d * 0.4, ix + 0.04, y + h + 0.07, z + d * 0.4 + 0.08, C('#f2ece0'));
      else if (o.items === 'glass') k.box(ix - 0.03, y + h, z + d * 0.4, ix + 0.03, y + h + 0.12, z + d * 0.4 + 0.06, C('#c8dcdc'));
      else if (o.items === 'cards') k.box(ix - 0.08, y + h, z + d * 0.4, ix + 0.08, y + h + 0.01, z + d * 0.4 + 0.12, C('#f4f0e6'));
    }
  }
  if (o.flowers) { k.box(x - 0.06, y + h, z + d / 2 - 0.06, x + 0.06, y + h + 0.16, z + d / 2 + 0.06, C('#d8e4e8')); k.sphere(x, y + h + 0.24, z + d / 2, 0.12, C(o.flowers, { c2: '#4a7a3a', pat: 'speckle' }), { seg: 6, rings: 4 }); }
  return { top: y + h };
}
export function roundTable(k, x, y, zc, r, o = {}) {
  const h = o.h || 0.72;
  k.cyl(x, y + h - (o.cloth ? 0.22 : 0.04), zc, r, o.cloth ? 0.22 : 0.04, C(o.cloth || o.top || '#7a5232'), { seg: 10 });
  k.cyl(x, y, zc, 0.05, h - 0.04, C('#3a2e26'), { seg: 5 });
  if (o.flowers) k.sphere(x, y + h + 0.1, zc, 0.1, C(o.flowers, { c2: '#4a7a3a', pat: 'speckle' }), { seg: 6, rings: 4 });
  if (o.lamp) { k.cyl(x, y + h, zc, 0.02, 0.3, C('#c8a050'), { seg: 4 }); k.cyl(x, y + h + 0.3, zc, 0.12, 0.12, C('#f2d8a0', { c2: '#ffe0a0', glow: 'night' }), { seg: 8, r2: 0.06 }); }
}

// Built-in settee or banquette along the back wall (z is its front).
export function settee(k, x0, x1, y, z, c, d = 0.6) {
  k.box(x0, y, z, x1, y + 0.44, z + d, C(c));
  k.box(x0, y + 0.44, z + d - 0.14, x1, y + 0.95, z + d, C(shade(c, -0.1)));
}

// Hanging or ceiling light: a glowing fitting and the light it casts at night.
export function lampC(k, x, yc, z, o = {}) {
  const kind = o.kind || 'dish';
  const col = o.color || '#ffd49a';
  const gl = C(o.shade || '#f4e4c0', { c2: '#fff0c8', glow: 'night', noEdge: kind === 'trough' });
  if (kind === 'dish') k.cyl(x, yc - 0.12, z, 0.24, 0.1, gl, { seg: 8, r2: 0.12 });
  else if (kind === 'bulb') { k.cyl(x, yc - 0.25, z, 0.006, 0.25, C('#2a2624'), { seg: 3 }); k.box(x - 0.07, yc - 0.38, z - 0.07, x + 0.07, yc - 0.24, z + 0.07, gl); }
  else if (kind === 'cage') { k.box(x - 0.09, yc - 0.2, z - 0.09, x + 0.09, yc, z + 0.09, C('#4a4a46', { pat: 'grate' })); k.box(x - 0.05, yc - 0.18, z - 0.05, x + 0.05, yc - 0.04, z + 0.05, gl); }
  else if (kind === 'trough') k.box(x - (o.w || 1.2) / 2, yc - 0.06, z - 0.1, x + (o.w || 1.2) / 2, yc, z + 0.1, gl);
  else if (kind === 'chand') { k.cyl(x, yc - 0.5, z, 0.01, 0.5, C('#8a7040'), { seg: 3 }); k.cyl(x, yc - 0.8, z, 0.18, 0.32, gl, { seg: 8, r2: 0.42 }); }
  else if (kind === 'sconce') k.box(x - 0.1, yc, z - 0.06, x + 0.1, yc + 0.28, z, gl);
  return k.lamp(x, kind === 'sconce' ? yc + 0.15 : yc - 0.35, z + (kind === 'sconce' ? -0.25 : 0), { color: col, r: o.r || 5, i: o.i != null ? o.i : 0.9, bulb: false, halo: o.halo != null ? o.halo : 0.35, always: !!o.always, flicker: !!o.flicker });
}

export function porthole(k, x, y, zb, o = {}) {
  const r = o.r || 0.2;
  k.cyl(x, y, zb - 0.04, r * 1.3, 0.04, C(o.rim || '#b8a070'), { axis: 'z', seg: 10 });
  k.cyl(x, y, zb - 0.06, r, 0.03, C('#9ab4c4', { c2: o.night || '#ffd890', glow: 'night' }), { axis: 'z', seg: 10 });
}
// A big window (or a row of them) set in a back wall at depth zb.
export function windows(k, x0, x1, y0, y1, zb, o = {}) {
  const n = o.n || Math.max(1, Math.round((x1 - x0) / (o.every || 1.6)));
  const w = (x1 - x0) / n;
  const g = C(o.glass || '#a8c4d0', { c2: o.night || '#ffd890', glow: 'night', pat: 'panes', s: o.pane || 0.5 });
  for (let i = 0; i < n; i++) {
    const a = x0 + i * w + (o.gap != null ? o.gap : 0.18), b = x0 + (i + 1) * w - (o.gap != null ? o.gap : 0.18);
    k.box(a, y0, zb - 0.05, b, y1, zb + 0.02, g);
  }
}
export function picture(k, x, y, zb, w, h, c = '#6a8a9a', frame = '#b08a3a') {
  k.box(x - w / 2, y, zb - 0.04, x + w / 2, y + h, zb, C(frame));
  k.box(x - w / 2 + 0.06, y + 0.06, zb - 0.05, x + w / 2 - 0.06, y + h - 0.06, zb - 0.04, C(c, { pat: 'rock', c2: shade(c, 0.3) }));
}
export function deckchair(k, x, y, z, face = 'out', c = '#d8c8a0', rug) {
  const wood = C('#c8a878');
  k.box(x - 0.3, y + 0.25, z, x + 0.3, y + 0.33, z + 0.8, wood);
  k.boxR(x, y + 0.6, z + 0.92, 0.6, 0.06, 0.62, C(c, { pat: 'stripes', s: 0.1, c2: shade(c, -0.15) }), { x: -1.0 });
  k.box(x - 0.3, y, z + 0.05, x - 0.25, y + 0.25, z + 0.1, wood); k.box(x + 0.25, y, z + 0.05, x + 0.3, y + 0.25, z + 0.1, wood);
  if (rug) k.box(x - 0.31, y + 0.33, z + 0.05, x + 0.31, y + 0.38, z + 0.6, C(rug, { pat: 'quilt', s: 0.15, c2: shade(rug, 0.25) }));
  return { x, y, z: z + 0.45, face, seat: 0.36 };
}
export function sack(k, x, y, z, c = '#c8b080', r = 0.25, rot = 0) {
  k.boxR(x, y + r * 0.7, z + r, r * 2.2, r * 1.4, r * 1.7, C(c, { pat: 'canvas', s: 0.2 }), { y: rot });
}
export function trunk(k, x, y, z, w, h, d, c = '#6a4a2a') {
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, C(c, { pat: 'stripes', s: w / 3, c2: shade(c, -0.18) }));
}
export function shelfRack(k, x0, x1, y, z, h, d, c, items = '#c8b890', n = 4) {
  k.box(x0, y, z + d - 0.04, x1, y + h, z + d, C(shade(c, -0.15)));
  for (let i = 0; i <= n; i++) {
    const sy = y + 0.1 + ((h - 0.1) * i) / n;
    k.box(x0, sy, z, x1, sy + 0.03, z + d, C(c));
    if (i < n && items) k.box(x0 + 0.05, sy + 0.03, z + 0.05, x1 - 0.05, sy + (h / n) * 0.6, z + d - 0.06, C(items, { pat: 'books', s: 0.1, c2: shade(items, -0.2) }));
  }
  for (const xx of [x0, x1 - 0.04]) k.box(xx, y, z, xx + 0.04, y + h, z + d, C(c));
}
export function basin(k, x, y, zb) {
  k.box(x - 0.25, y + 0.72, zb - 0.42, x + 0.25, y + 0.84, zb, C('#f0eee8'));
  k.box(x - 0.05, y, zb - 0.2, x + 0.05, y + 0.72, zb - 0.1, C('#e8e4dc'));
  k.box(x - 0.22, y + 1.05, zb - 0.03, x + 0.22, y + 1.55, zb, C('#c8d8dc'));
}
export function wardrobe(k, x, y, zb, w = 0.9, c = '#7a4a2a', h = 1.9) {
  k.box(x - w / 2, y, zb - 0.55, x + w / 2, y + h, zb, C(c, { pat: 'panels', s: w / 2, c2: shade(c, -0.1) }));
}
// A berth along x against the back wall; returns the sleeper anchor (feet at +x end).
export function berth(k, x, y, zb, o = {}) {
  const w = o.w || 1.9, d = o.d || 0.8, h = o.h || 0.45, frame = o.frame || '#6a4228', bl = o.blanket || '#6a7a9a';
  const z = zb - d;
  k.box(x - w / 2, y + h - 0.2, z, x + w / 2, y + h - 0.1, zb, C(frame));
  if (!o.upper) k.box(x - w / 2, y, z, x + w / 2, y + h - 0.2, zb, C(frame));
  k.box(x - w / 2 + 0.03, y + h - 0.1, z + 0.03, x + w / 2 - 0.03, y + h, zb - 0.02, C('#f2ede2'));
  k.box(x - w / 2 + 0.45, y + h - 0.08, z, x + w / 2 - 0.03, y + h + 0.04, zb - 0.02, C(bl, { pat: o.quilt ? 'quilt' : 'none', c2: shade(bl, 0.25) }));
  k.box(x - w / 2 + 0.05, y + h, z + 0.12, x - w / 2 + 0.4, y + h + 0.1, zb - 0.12, C('#fbf8f0'));
  if (o.board !== false) k.box(x - w / 2 - 0.05, y, z, x - w / 2, y + h + 0.45, zb, C(shade(frame, -0.1)));
  return { feet: [x + w / 2 - 0.18, y + h + 0.02, z + d / 2], heading: 0 };
}
// Two-tier berths with a ladder end; returns the two anchors.
export function bunks(k, x, y, zb, o = {}) {
  const lo = berth(k, x, y, zb, Object.assign({}, o, { h: 0.42 }));
  const hi = berth(k, x, y + 1.15, zb, Object.assign({}, o, { h: 0.42, upper: true, board: false, blanket: o.blanket2 || o.blanket }));
  const fr = C(shade(o.frame || '#6a4228', -0.1));
  for (const px of [x - (o.w || 1.9) / 2 - 0.05, x + (o.w || 1.9) / 2]) k.box(px, y, zb - (o.d || 0.8), px + 0.05, y + 1.75, zb - (o.d || 0.8) + 0.05, fr);
  return [lo, hi];
}
export function rug(k, x0, x1, y, z0, z1, c, c2) { k.box(x0, y, z0, x1, y + 0.012, z1, C(c, { pat: 'carpet', s: 0.5, c2: c2 || shade(c, 0.3) })); }
// A plant in a pot (a cheap lump of foliage).
export function plant(k, x, y, z, h = 1.0, pot = '#a85a3a') {
  k.cyl(x, y, z + 0.2, 0.16, 0.35, C(pot), { seg: 7, r2: 0.2 });
  k.sphere(x, y + 0.35 + h * 0.45, z + 0.2, h * 0.42, C('#4a6a34', { c2: '#6a8a44', pat: 'speckle' }), { seg: 7, rings: 5 });
}
export function stoveRange(k, x0, x1, y, z, d = 1.0, c = '#3a3a3e', fire = true) {
  k.box(x0, y, z, x1, y + 0.9, z + d, C(c, { pat: 'plates', s: 0.4, c2: shade(c, 0.1) }));
  k.box(x0 - 0.02, y + 0.88, z - 0.02, x1 + 0.02, y + 0.94, z + d + 0.02, C('#c8ccd0'));
  for (let x = x0 + 0.4; x < x1 - 0.2; x += 0.8) k.box(x - 0.2, y + 0.25, z - 0.02, x + 0.2, y + 0.6, z, C('#26262a'));
  if (fire) k.lamp((x0 + x1) / 2, y + 0.45, z - 0.1, { always: true, r: 2.4, i: 0.5, color: '#ff9a50', bulb: false, halo: 0.25, flicker: true });
}
export function pot(k, x, y, z, r = 0.2, c = '#b8bcc0') { k.cyl(x, y, z + r, r, r * 1.3, C(c), { seg: 8 }); }
export function counter(k, x0, x1, y, z, d = 0.6, h = 1.0, c = '#6a4a32', top = '#c8ccd0') {
  k.box(x0, y, z, x1, y + h - 0.05, z + d, C(c, { pat: 'panels', s: 0.6, c2: shade(c, -0.1) }));
  k.box(x0 - 0.03, y + h - 0.05, z - 0.03, x1 + 0.03, y + h, z + d + 0.03, C(top));
}
// Wire-mesh or bar screen as a row of thin uprights.
export function bars(k, x0, x1, y0, y1, z, step = 0.15, c = '#4a4a46') {
  const m = C(c);
  for (let x = x0; x <= x1 + 1e-6; x += step) k.box(x - 0.012, y0, z - 0.012, x + 0.012, y1, z + 0.012, m);
  k.box(x0, y1 - 0.04, z - 0.02, x1, y1, z + 0.02, m);
  k.box(x0, y0, z - 0.02, x1, y0 + 0.04, z + 0.02, m);
}
// A dog: body, head and legs, standing on y, facing +x (or -x with dir -1).
export function dog(k, x, y, z, c = '#c8a878', s = 1, dir = 1) {
  const m = C(c);
  k.box(x - 0.25 * s, y + 0.22 * s, z - 0.09 * s, x + 0.25 * s, y + 0.42 * s, z + 0.09 * s, m);
  k.box(x + dir * 0.22 * s - 0.08 * s, y + 0.38 * s, z - 0.07 * s, x + dir * 0.22 * s + 0.1 * s, y + 0.55 * s, z + 0.07 * s, m);
  for (const dx of [-0.18, 0.18]) for (const dz of [-0.06, 0.06]) k.box(x + dx * s - 0.025 * s, y, z + dz * s - 0.025 * s, x + dx * s + 0.025 * s, y + 0.24 * s, z + dz * s + 0.025 * s, m);
}
