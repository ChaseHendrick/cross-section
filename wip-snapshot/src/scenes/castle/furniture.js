/* Conwy Castle: period furniture and fittings drawn with kit primitives.
 * Each helper takes scene coordinates. `wallFrame` gives a local frame on any wall so
 * the same fitting can stand against a straight wall or a round tower wall. */
import { mat, props } from '../../engine/index.js';
import { M } from './common.js';

// A local frame on a wall: origin (ox, oy, oz) on the wall face, `phi` the direction into
// the room in the x-z plane (0 = +x, -PI/2 = towards the viewer). box(u0,u1, v0,v1, w0,w1):
// u along the wall (to the right seen from the room), v up, w out from the wall.
export function wallFrame(k, ox, oy, oz, phi) {
  const nx = Math.cos(phi), nz = Math.sin(phi);
  const tx = -nz, tz = nx; // tangent, to the right when facing the wall
  const rot = { y: Math.PI / 2 - phi };
  const at = (u, v, w) => [ox + tx * u + nx * w, oy + v, oz + tz * u + nz * w];
  return {
    at,
    box(u0, u1, v0, v1, w0, w1, m) {
      const c = at((u0 + u1) / 2, (v0 + v1) / 2, (w0 + w1) / 2);
      k.boxR(c[0], c[1], c[2], Math.abs(u1 - u0), Math.abs(v1 - v0), Math.abs(w1 - w0), m, rot);
    },
    tri(u0, u1, v0, v1, w0, w1, m) { // a raked hood: full depth at the bottom, shallow at the top
      const wt = w0 + (w1 - w0) * 0.3, du = (u1 - u0) * 0.12;
      const a = at(u0, v0, w0), b = at(u1, v0, w0), c = at(u1, v0, w1), d = at(u0, v0, w1);
      const e = at(u0 + du, v1, w0), f = at(u1 - du, v1, w0), g = at(u1 - du, v1, wt), h = at(u0 + du, v1, wt);
      const up = [0, 1, 0], dn = [0, -1, 0], out = [nx, 0.5, nz], back = [-nx, 0, -nz], rt = [tx, 0.2, tz], lt = [-tx, 0.2, -tz];
      k.poly([d, c, g, h], m, 1, out); k.poly([e, f, g, h], m, 1, up); k.poly([a, b, c, d], m, 1, dn);
      k.poly([a, e, f, b], m, 1, back); k.poly([b, f, g, c], m, 1, rt); k.poly([a, d, h, e], m, 1, lt);
    },
    phi,
  };
}
// Frame on a round tower's inner wall at angle a (radius r), facing the centre.
export const roundFrame = (k, cx, cz, r, a, y) => wallFrame(k, cx + Math.cos(a) * r, y, cz + Math.sin(a) * r, a + Math.PI);

// A freestone fireplace with a raked hood, logs and a fire that glows day and night.
export function hoodFire(k, F, w = 1.6, opt = {}) {
  const jh = opt.jh || 1.3, hood = opt.hood || 1.6, d = opt.d || 0.75;
  const stone = opt.stone || M.free;
  F.box(-w / 2 - 0.28, -w / 2, 0, jh, 0, d, stone);
  F.box(w / 2, w / 2 + 0.28, 0, jh, 0, d, stone);
  F.box(-w / 2 - 0.35, w / 2 + 0.35, jh, jh + 0.22, 0, d + 0.06, stone);
  F.tri(-w / 2 - 0.3, w / 2 + 0.3, jh + 0.22, jh + 0.22 + hood, 0, d, opt.hoodM || M.plaster);
  F.box(-w / 2, w / 2, 0, jh, -0.05, 0.04, M.sooty);
  F.box(-w / 2, w / 2, 0, 0.12, 0, d, M.flags);
  if (opt.fire !== false) {
    for (let i = 0; i < 3; i++) { const p = F.at(-0.35 + i * 0.3, 0.16, 0.35); k.cyl(p[0], p[1], p[2], 0.07, 0.55, M.oakDark, { axis: 'x', seg: 6 }); }
    const f = F.at(0, 0.35, 0.4);
    k.lamp(f[0], f[1], f[2], { always: true, r: opt.reach || 5.5, i: opt.i || 0.9, color: '#ff8a40', bulb: false, halo: 0.6, flicker: true });
    return f;
  }
  return F.at(0, 0.35, 0.4);
}

// A curtained bed (tester) along x, head at -x. Returns a sleeper anchor and a second one beside it.
export function testerBed(k, x, y, z, opt = {}) {
  const w = opt.w || 2.0, d = opt.d || 1.5, cur = opt.curtain || '#7a2a26';
  const b = props.bed(k, x, y, z, { w, d, frame: '#5a3a22', blanket: opt.blanket || '#3e5a8a', quilt: true, headboard: true });
  const top = y + 2.2;
  for (const px of [x - w / 2, x + w / 2 - 0.08]) for (const pz of [z + d - 0.08]) k.box(px, y, pz, px + 0.08, top, pz + 0.08, M.oakDark);
  k.box(x - w / 2, top, z + 0.3, x + w / 2, top + 0.18, z + d, mat({ c: cur, c2: '#c8a050', pat: 'stripes', s: 0.25 }));
  k.box(x - w / 2 - 0.02, y + 0.6, z + d - 0.06, x + w / 2 + 0.02, top, z + d - 0.02, mat({ c: cur, c2: '#5a1e1a', pat: 'canvas' }));
  k.box(x - w / 2 - 0.04, y + 0.5, z + 0.3, x - w / 2 + 0.02, top, z + d, mat({ c: cur, c2: '#5a1e1a', pat: 'canvas' }));
  const feet = b.feet;
  return [{ feet, heading: 0 }, { feet: [feet[0], feet[1], feet[2] - 0.35], heading: 0 }, { feet: [feet[0], feet[1], feet[2] + 0.35], heading: 0 }];
}

// A straw pallet on the floor, head at -x. Returns a sleeper anchor.
export function pallet(k, x, y, z, opt = {}) {
  const w = opt.w || 1.85, d = opt.d || 0.75;
  k.box(x - w / 2, y, z, x + w / 2, y + 0.14, z + d, M.straw);
  k.box(x - w / 2 + 0.25, y + 0.14, z + 0.04, x + w / 2 - 0.02, y + 0.2, z + d - 0.04, mat(opt.blanket || '#7a6a4a'));
  return { feet: [x + w / 2 - 0.15, y + 0.16, z + d / 2], heading: 0 };
}

// A crossbow lying or hanging: stock, bow, stirrup. dir: 1 along +x.
export function crossbow(k, x, y, z, rotY = 0, opt = {}) {
  const c = Math.cos(rotY), s = Math.sin(rotY);
  const P = (u, v, w) => [x + c * u + s * w, y + v, z - s * u + c * w];
  const wood = opt.wood || M.oak;
  const a = P(-0.45, 0, 0), b = P(0.35, 0, 0);
  k.beam(a, b, 0.06, wood);
  const bow = [];
  for (let i = 0; i <= 8; i++) { const t = (i / 8) * 2 - 1; bow.push(P(0.32 - 0.12 * t * t, 0.0, t * 0.42)); }
  k.tube(bow, 0.022, M.iron, { seg: 4 });
  k.beam(P(0.35, 0, 0), P(0.47, 0, 0), 0.04, M.iron);
}

// A wall hanging (painted or woven cloth) on a wall frame.
export function hanging(k, F, u, v, w, h, color, color2) {
  F.box(u - w / 2, u + w / 2, v, v + h, 0.02, 0.06, mat({ c: color, c2: color2 || '#c8a050', pat: 'carpet', s: 0.5 }));
  F.box(u - w / 2 - 0.1, u + w / 2 + 0.1, v + h, v + h + 0.05, 0.02, 0.09, M.oakDark);
}

// A domed bread oven as a hollow masonry shell, so a cut through it shows the fire inside.
export function domedOven(k, x, y, z, r = 1.3, opt = {}) {
  const shell = [];
  const n = 8;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; shell.push([Math.cos(a) * (r + 0.32), y + Math.sin(a) * (r + 0.32) * 0.82]); }
  const inner = [];
  for (let i = n; i >= 0; i--) { const a = (i / n) * Math.PI / 2; inner.push([Math.max(0.001, Math.cos(a) * r), y + 0.05 + Math.sin(a) * r * 0.78]); }
  const prof = shell.concat(inner).concat([[r + 0.32, y]]);
  const sooty = mat({ c: '#6a5e52', c2: '#4a4038', pat: 'stone', s: 0.25, cut: '#4e4238' });
  k.lathe(prof, x, z, sooty, { seg: 20, capTop: false, capBot: false });
  k.cyl(x, y - 0.95, z, r + 0.34, 0.95, M.rubble, { seg: 20 }); // hearth base
  k.cyl(x, y, z, r, 0.05, mat({ c: '#c86a3a', c2: '#ffb060', glow: 'always' }), { seg: 16 }); // embers
  if (opt.loaves) for (let i = 0; i < 5; i++) { const a = i * 1.3; k.sphere(x + Math.cos(a) * r * 0.5, y + 0.12, z + Math.sin(a) * r * 0.5, 0.13, mat('#c8904a'), { seg: 7, rings: 4 }); }
  k.lamp(x, y + 0.5, z, { always: true, r: 3.2, i: 0.85, color: '#ff7a30', bulb: false, halo: 0.45, flicker: true });
}

// A trestle table along x with benches either side (front bench optional). Returns seat rows.
export function trestle(k, x0, x1, y, z, opt = {}) {
  const d = opt.d || 0.75, h = 0.74;
  const cloth = opt.cloth;
  if (cloth) k.box(x0 - 0.04, y + h - 0.2, z - 0.04, x1 + 0.04, y + h, z + d + 0.04, mat({ c: cloth, c2: '#e8e0cc', pat: 'none' }));
  else k.box(x0, y + h - 0.05, z, x1, y + h, z + d, M.oak);
  for (const tx of [x0 + 0.3, x1 - 0.3]) {
    k.beam([tx, y, z + 0.05], [tx, y + h - 0.05, z + d / 2], 0.07, M.oakDark);
    k.beam([tx, y, z + d - 0.05], [tx, y + h - 0.05, z + d / 2], 0.07, M.oakDark);
  }
  const rows = {};
  if (opt.back !== false) { props.bench(k, (x0 + x1) / 2, y, z + d + 0.12, { w: x1 - x0 - 0.2, d: 0.32 }); rows.back = z + d + 0.28; }
  if (opt.front) { props.bench(k, (x0 + x1) / 2, y, z - 0.44, { w: x1 - x0 - 0.2, d: 0.32 }); rows.front = z - 0.28; }
  // Things on the table: trenchers, cups, a jug, bread.
  const items = opt.items || 'meal';
  if (items) {
    const n = Math.max(1, Math.floor((x1 - x0) / 0.6));
    for (let i = 0; i < n; i++) {
      const ix = x0 + 0.3 + i * ((x1 - x0 - 0.6) / Math.max(1, n - 1));
      if (items === 'meal') {
        k.box(ix - 0.1, y + h, z + d - 0.32, ix + 0.1, y + h + 0.02, z + d - 0.14, mat('#c8a070'));
        if (i % 2 === 0) k.cyl(ix + 0.18, y + h, z + d * 0.4, 0.035, 0.1, mat('#8a6a48'), { seg: 6 });
        if (i % 3 === 1) k.sphere(ix, y + h + 0.05, z + d * 0.35, 0.07, mat('#c8904a'), { seg: 6, rings: 4 });
      }
    }
    if (items === 'meal') { const jx = (x0 + x1) / 2; k.cyl(jx, y + h, z + d * 0.45, 0.08, 0.24, mat('#a0603a'), { seg: 8, r2: 0.06 }); }
  }
  return rows;
}

// A plate cupboard (buffet) with stepped shelves of pewter and silver.
export function buffet(k, x, y, z, w = 1.4) {
  k.box(x - w / 2, y, z, x + w / 2, y + 0.9, z + 0.5, mat({ c: '#6a4428', c2: '#5a3a22', pat: 'panels', s: 0.35 }));
  k.box(x - w / 2 + 0.1, y + 0.9, z + 0.25, x + w / 2 - 0.1, y + 1.3, z + 0.5, mat('#6a4428'));
  k.box(x - w / 2 + 0.2, y + 1.3, z + 0.38, x + w / 2 - 0.2, y + 1.65, z + 0.5, mat('#6a4428'));
  const silver = mat({ c: '#c8ccd0', c2: '#9aa0a8' });
  for (let i = 0; i < 4; i++) k.cyl(x - w / 2 + 0.25 + i * (w - 0.5) / 3, y + 1.3, z + 0.38, 0.13, 0.03, silver, { axis: 'z', seg: 12 });
  for (let i = 0; i < 3; i++) k.cyl(x - w / 2 + 0.35 + i * (w - 0.7) / 2, y + 0.9, z + 0.12, 0.05, 0.2, silver, { seg: 8, r2: 0.07 });
}

// Barrels in a row, casks on chocks.
export function barrels(k, x0, y, z, n, opt = {}) {
  for (let i = 0; i < n; i++) props.barrel(k, x0 + i * (opt.gap || 0.68), y, z + (i % 2) * 0.12, { r: opt.r || 0.3, h: opt.h || 0.85, color: opt.color || (i % 3 ? '#8a6038' : '#7a5432') });
}
export function casks(k, x0, y, z, n, opt = {}) {
  for (let i = 0; i < n; i++) {
    const x = x0 + i * (opt.gap || 1.0);
    k.box(x - 0.42, y, z + 0.05, x + 0.42, y + 0.12, z + 0.2, M.oakDark);
    k.box(x - 0.42, y, z + 0.6, x + 0.42, y + 0.12, z + 0.75, M.oakDark);
    props.cask(k, x, y + 0.1, z, { r: opt.r || 0.4, l: 0.85, color: opt.color || '#7a5030' });
    if (opt.stack && i < n - 1) props.cask(k, x + 0.5, y + 0.85, z + 0.02, { r: 0.36, l: 0.8, color: '#6e4a2c' });
  }
}
export function sacks(k, x0, y, z, n, opt = {}) {
  for (let i = 0; i < n; i++) props.sack(k, x0 + i * 0.42 + (i % 2) * 0.05, y + (opt.stack && i % 3 === 2 ? 0.4 : 0), z + (i % 2) * 0.25, { color: opt.color || (i % 2 ? '#c8b080' : '#bba070') });
}
// An open tub or vat.
export function tub(k, x, y, z, r, h, m, contents) {
  k.lathe([[r * 0.92, y], [r, y + h], [r - 0.06, y + h], [r * 0.86, y + 0.06], [0.001, y + 0.06]], x, z + r, m || M.oak, { seg: 16, capBot: true, capTop: false });
  if (contents) k.cyl(x, y + h * 0.7, z + r, r - 0.07, 0.02, mat(contents), { seg: 16 });
}
// A bundle of faggots (brushwood) lying along x.
export function faggots(k, x, y, z, n) {
  for (let i = 0; i < n; i++) k.cyl(x - 0.6, y + 0.18 + Math.floor(i / 3) * 0.3, z + 0.2 + (i % 3) * 0.32, 0.15, 1.2, mat({ c: '#7a6440', c2: '#5a4a30', pat: 'thatch', s: 0.08 }), { axis: 'x', seg: 6 });
}
// Candles on a pricket stand (always lit at night).
export function candles(k, x, y, z, opt = {}) {
  k.cyl(x, y, z, 0.12, 0.05, M.iron, { seg: 8 });
  k.cyl(x, y + 0.05, z, 0.025, opt.h || 1.0, M.iron, { seg: 5 });
  k.cyl(x, y + 0.05 + (opt.h || 1.0), z, 0.03, 0.2, mat('#f2ead0'), { seg: 6 });
  return k.lamp(x, y + (opt.h || 1.0) + 0.32, z, { r: opt.r || 3.2, i: opt.i || 0.75, color: '#ffc070', bulbR: 0.03, halo: 0.3, flicker: true });
}
// A rushlight or candle on a wall bracket.
export function sconce(k, F, u, v, opt = {}) {
  F.box(u - 0.04, u + 0.04, v, v + 0.06, 0, 0.22, M.iron);
  const p = F.at(u, v + 0.2, 0.2);
  k.cyl(p[0], p[1] - 0.14, p[2], 0.025, 0.14, mat('#f2ead0'), { seg: 5 });
  return k.lamp(p[0], p[1] + 0.06, p[2], { r: opt.r || 3.4, i: opt.i || 0.7, color: '#ffc070', bulbR: 0.03, halo: 0.32, flicker: true });
}
