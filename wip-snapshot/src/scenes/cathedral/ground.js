/* Salisbury 1245: the ground and everything around the church.
 *
 * Myrifeld, the flat marshy meadow by the Avon (verified), on wet gravel. The section
 * shows the 1.2 m footings over gravel with the groundwater just below (dossier zones
 * 1, 2). North, behind the church: the churchyard, the detached belfry, and Old Sarum on
 * its hill on the horizon. East: the masons' cottages, the new town and the river.
 */
import { XS, mat, makeSea } from '../../engine/index.js';
import { M, ZMIN, AZ0, BZ, END, range, oq, prism, mapXY } from './common.js';

export const RIVER_LEVEL = -0.9;
export const riverX = (z) => 178 + Math.sin(z * 0.012) * 7 + Math.sin(z * 0.003 + 1) * 14;

// Pits and trenches open in the ground (vertical sides). [x0, x1, z0, z1, floor]
export const PITS = [
  [-0.5, 2.3, ZMIN - 0.1, 15.2, -1.2], // west front foundation trench, still open
  [5.6, 11.1, AZ0 - 0.6, BZ + 0.6, -1.2], // trench for the north aisle wall of bay 1
  [-4.7, -0.9, ZMIN - 0.1, 2.5, -0.85], // lime slaking pit
  [-32.7, -28.3, ZMIN - 0.1, 3.6, -2.5], // bell-casting pit
  [25.6, 30.4, 0.5, 1.5, -1.75], // saw pit
];
// Footings that the section cuts: the ground above them is kept paper thin so they show.
const CUT_FOOT = [[2.3, 5.6], [119.2, 121.1], [140.2, END + 0.3]];

const noise = (x, z, s) => XS.noise1(x * 0.011 + z * 0.017, s) * 0.6 + XS.noise1(x * 0.0041 - z * 0.0057, s + 3) * 1.4;
const hill = (x, z, hx, hz, h, sx, sz) => h * Math.exp(-(((x - hx) / sx) ** 2 + ((z - hz) / sz) ** 2));

// Old Sarum: an oval hill about 3 km north with ring ramparts (scaled into view).
const SARUM = { x: 80, z: 1050, h: 46 };
export function groundH(x, z) {
  for (const p of PITS) if (x > p[0] && x < p[1] && z > p[2] && z < p[3]) return p[4];
  let y = 0;
  // Gentle undulation away from the site; marshy hollows near the river.
  const away = Math.min(1, Math.max(0, (Math.abs(z - 20) - 30) / 60) + Math.max(0, (x - 200) / 40) + Math.max(0, (-60 - x) / 40));
  y += away * (noise(x, z, 4) * 0.35);
  // Downs to the north and the hill of Old Sarum.
  const r = Math.hypot((x - SARUM.x) / 1.35, z - SARUM.z);
  y += SARUM.h * Math.exp(-((r / 105) ** 2.2));
  y += 5.5 * Math.exp(-(((r - 62) / 7) ** 2)) - 3.5 * Math.exp(-(((r - 70) / 5) ** 2)); // rampart and ditch
  y += hill(x, z, -380, 1350, 38, 380, 240) + hill(x, z, 560, 1400, 44, 440, 260) + hill(x, z, 260, 1560, 34, 320, 220);
  y += hill(x, z, -900, 900, 30, 420, 320) + hill(x, z, 1100, 800, 28, 400, 320);
  // The Avon in its channel east of the town.
  // (beyond the meadows it runs out of sight among the downs)
  const d = Math.abs(x - riverX(z)), fade = Math.min(1, Math.max(0, (520 - z) / 120));
  if (d < 9 && fade > 0) { const t = Math.max(0, (d - 5.5) / 3.5); y = Math.min(y, y + (-2.6 + (y + 2.6) * t * t - y) * fade); }
  else if (d < 22 && z < 520) y = Math.min(y, -0.15 - noise(x, z, 9) * 0.05);
  return y;
}

function grid(a, b, fine0, fine1, step, coarse) {
  const out = new Set();
  for (let x = fine0; x <= fine1 + 1e-6; x += step) out.add(+x.toFixed(3));
  let w = step;
  for (let x = fine0 - step; x > a; x -= (w *= coarse)) out.add(+x.toFixed(2));
  w = step;
  for (let x = fine1 + step; x < b; x += (w *= coarse)) out.add(+x.toFixed(2));
  out.add(a); out.add(b);
  return out;
}

export function buildGround(k) {
  // Grid lines: fine around the site, coarse far away, with extra lines at pit edges.
  const X = grid(-1500, 1700, -70, 205, 1.0, 1.22);
  const Z = grid(ZMIN, 1700, ZMIN, 46, 1.0, 1.16);
  for (const p of PITS) { for (const x of [p[0] - 0.02, p[0] + 0.02, p[1] - 0.02, p[1] + 0.02]) X.add(+x.toFixed(3)); for (const z of [p[2] - 0.02, p[2] + 0.02, p[3] - 0.02, p[3] + 0.02]) if (z > ZMIN) Z.add(+z.toFixed(3)); }
  for (let x = 160; x < 200; x += 0.5) X.add(x);
  const xs = [...X].sort((a, b) => a - b), zs = [...Z].filter((z) => z >= ZMIN).sort((a, b) => a - b);
  const inSite = (x, z) => x > -48 && x < 62 && z < 16.5 && z > -2;
  const matFn = (x, z) => {
    if (inSite(x, z)) return x > 5 && x < 61.5 && z < 12 ? M.earth : (x < 0 && z < 9) ? M.dust : M.earth;
    if (x < -33 && z > 5.5 && z < 10.5) return M.gravelRoad; // the road in from Chilmark
    if (x > 141 && x < 172 && z < 7) return M.gravelRoad; // lane east past the cottages
    if (z > 13 && z < 68 && Math.abs(x - (30.7 - (z - 13) * 0.105)) < 1.1) return M.gravelRoad; // path from the north door to the belfry
    if (x > -8 && x < 150 && z > 41 && z < 43.5) return M.gravelRoad; // a track along the north of the Close
    const d = Math.abs(x - riverX(z));
    if (d < 12) return M.marsh;
    if (z > 400) return M.downs;
    return M.meadow;
  };
  const top = (x, z) => groundH(x, z);
  const bot = (x, z) => {
    const t = groundH(x, z);
    for (const [a, b] of CUT_FOOT) if (x > a && x < b && z < BZ + 1) return t - 0.02;
    return Math.min(-0.85, t - 0.3);
  };
  heightSolidFast(k, xs, zs, bot, top, matFn, M.gravel);

  // Strata under the section: dry gravel above the groundwater, wet gravel below.
  const holes = PITS.filter((p) => p[2] < 0.3).map((p) => [p[0], p[1], p[4] - 0.15]).concat(CUT_FOOT.map(([a, b]) => [a, b, -1.25]));
  const rv = [riverX(0) - 9, riverX(0) + 9];
  holes.push([rv[0], rv[1], -2.9]);
  holes.sort((a, b) => a[0] - b[0]);
  const DRY = mat({ c: '#9a8466', c2: '#7e6a50', pat: 'stone', s: 0.16, cut: '#a08a68', cutPat: true });
  const WET = mat({ c: '#7a705c', c2: '#625a4a', pat: 'stone', s: 0.16, cut: '#7c7462', cutPat: true });
  let x = -70;
  const seg = (a, b, yTop) => {
    if (b - a < 0.01) return;
    if (yTop > -1.5) k.box(a, -1.5, ZMIN, b, yTop, 0.25, DRY);
    k.box(a, -5, ZMIN, b, Math.min(-1.5, yTop), 0.25, WET);
  };
  for (const h of holes) { seg(x, h[0], -0.85); seg(h[0], h[1], h[2]); x = h[1]; }
  seg(x, 205, -0.85);
  // A film of water over the wet band (the cut face of the water table), and the river's section.
  const wet = (a, b, y1) => k.sheet(a, b, -5, y1, 0.012, { c: '#5a8a9a', alpha: 0.16 });
  wet(-70, -32.7, -1.5); wet(-32.7, -28.3, -2.65); wet(-28.3, rv[0], -1.5); wet(rv[1], 205, -1.5);
  k.sheet(rv[0] + 3.5, rv[1] - 3.5, -2.6, RIVER_LEVEL, 0.012, { c: '#3a6a7a', alpha: 0.42 });
  k.sheet(rv[0], rv[1], -5, -2.9, 0.012, { c: '#5a8a9a', alpha: 0.16 });

  // The river surface (a calm, masked sea) and its reeds and willows.
  // The water plane runs under the whole landscape; it is masked out over the site so it can
  // never show inside a pit, a trench or a cut footing.
  k.object(makeSea({ level: RIVER_LEVEL, x0: -200, x1: 400, depth: 1600, step: 2, deep: '#3c5c58', shallow: '#5e7e6c', amp: 0.08, mask: (x) => x < 166, maskBox: [-80, -1, 240, 60] }));
  const r = k.rng('river');
  const REED = mat({ c: '#7a8a46', c2: '#a0a060' });
  for (let i = 0; i < 160; i++) {
    const z = r() * 120 + 0.5, side = r() < 0.5 ? -1 : 1, x0 = riverX(z) + side * (5.6 + r() * 2.2);
    k.cyl(x0, groundH(x0, z) - 0.1, z, 0.025, 0.9 + r() * 0.8, REED, { seg: 3, r2: 0.005 });
  }
}

// heightSolid without per-face triangulation overhead: top, bottom, skirts.
function heightSolidFast(k, xs, zs, bot, top, matFn, side) {
  const nx = xs.length, nz = zs.length;
  const T = [], B = [];
  for (let j = 0; j < nz; j++) { const rt = new Float32Array(nx), rb = new Float32Array(nx); for (let i = 0; i < nx; i++) { rt[i] = top(xs[i], zs[j]); rb[i] = bot(xs[i], zs[j]); } T.push(rt); B.push(rb); }
  const up = [0, 1, 0], dn = [0, -1, 0];
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1];
    const m = matFn((x0 + x1) / 2, (z0 + z1) / 2);
    oq(k, [x0, T[j][i], z0], [x1, T[j][i + 1], z0], [x1, T[j + 1][i + 1], z1], [x0, T[j + 1][i], z1], m, up);
    // Bottom only near the section, where it is seen through the cut.
    if (z0 < 3) oq(k, [x0, B[j][i], z0], [x1, B[j][i + 1], z0], [x1, B[j + 1][i + 1], z1], [x0, B[j + 1][i], z1], side, dn);
  }
  for (let i = 0; i < nx - 1; i++) {
    const j = 0, z = zs[0];
    oq(k, [xs[i], B[j][i], z], [xs[i + 1], B[j][i + 1], z], [xs[i + 1], T[j][i + 1], z], [xs[i], T[j][i], z], side, [0, 0, -1]);
  }
}

// ------------------------------------------------------------------ trees, churchyard, belfry, Sarum
const LEAF = [mat({ c: '#5e7a3a', c2: '#4a6230', pat: 'speckle' }), mat({ c: '#6a8442', c2: '#56703a', pat: 'speckle' }), mat({ c: '#7a8e4e', c2: '#64783e', pat: 'speckle' })];
const BARK = mat({ c: '#5a4a3a' });
export function tree(k, x, z, h, seed, willow = false) {
  const y = groundH(x, z);
  k.cyl(x, y, z, 0.18 * h / 8, h * 0.55, BARK, { seg: 6, r2: 0.1 * h / 8 });
  const r = k.rng('tree' + seed);
  const n = willow ? 4 : 3;
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = r() * h * 0.18;
    k.boulder(x + Math.cos(a) * d, y + h * (0.62 + r() * 0.22), z + Math.sin(a) * d, h * (willow ? 0.26 : 0.22), h * (willow ? 0.24 : 0.2), h * 0.22, LEAF[(seed + i) % 3], seed * 7 + i, 0.35);
  }
}

export function buildSurroundings(k) {
  const r = k.rng('surround');
  // Churchyard north of the nave: a few timber grave markers (location illustrative).
  const WOOD = mat({ c: '#7a6448', cut: '#9a8060' });
  for (let i = 0; i < 26; i++) {
    const x = 8 + r() * 48, z = 17 + r() * 22;
    k.box(x - 0.04, 0, z, x + 0.04, 0.9, z + 0.06, WOOD);
    k.box(x - 0.25, 0.55, z, x + 0.25, 0.63, z + 0.06, WOOD);
    k.box(x - 0.45, 0, z + 0.2, x + 0.45, 0.12, z + 1.9, M.grass);
  }
  // The detached belfry, about 200 ft north of the nave, three tiers and a spire,
  // 200 ft high in all with walls 8 ft thick (VCH, verified); its 1245 state is uncertain.
  const bx = 25, bz = 74, S = M.stoneOut;
  const tier = (y0, y1, h) => k.box(bx - h, y0, bz - h, bx + h, y1, bz + h, S);
  tier(0, 14, 7.0); tier(14, 24, 6.2); tier(24, 33, 5.4);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k.box(bx + sx * 7.0 - 1.1, 0, bz + sz * 7.0 - 1.1, bx + sx * 7.0 + 1.1, 20, bz + sz * 7.0 + 1.1, S);
  const DARK = mat({ c: '#2e2a28' });
  for (const [y0, y1, h, n] of [[5, 10.5, 7.0, 2], [16, 22, 6.2, 2], [26, 31.5, 5.4, 3]]) {
    for (let i = 0; i < n; i++) {
      const cx = bx - h + ((i + 0.5) * 2 * h) / n;
      prism(k, [[cx - 0.55, y0], [cx + 0.55, y0], [cx + 0.55, y1 - 0.6], [cx, y1], [cx - 0.55, y1 - 0.6]], [], mapXY, bz - h - 0.02, bz - h + 0.3, DARK);
    }
  }
  // Spire (octagonal, lead).
  const sp = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; sp.push([5.6 * (1 - t) + 0.05, 33 + t * 28]); }
  k.lathe(sp, bx, bz, M.leadOld, { seg: 8, flat: true });
  k.cyl(bx, 61, bz, 0.06, 2.0, M.iron, { seg: 4 });

  // Old Sarum on its hill: castle walls and the old cathedral, partly taken down for stone.
  const sy = groundH(SARUM.x, SARUM.z);
  const GREY = mat({ c: '#aeb0a6', cut: '#9a968a' });
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = SARUM.x + Math.cos(a) * 26 * 1.35, z = SARUM.z + Math.sin(a) * 26;
    k.box(x - 3.2, groundH(x, z) - 1, z - 1.6, x + 3.2, groundH(x, z) + 4.5 + (i % 4 === 0 ? 3.5 : 0), z + 1.6, GREY);
  }
  k.box(SARUM.x - 5, sy - 1, SARUM.z - 5, SARUM.x + 5, sy + 15, SARUM.z + 5, GREY); // keep
  k.box(SARUM.x - 48, sy - 6, SARUM.z + 14, SARUM.x - 20, sy + 8, SARUM.z + 22, GREY); // old cathedral, partly taken down
  k.box(SARUM.x - 48, sy - 6, SARUM.z + 10, SARUM.x - 40, sy + 4, SARUM.z + 26, GREY);

  // Puddles and rushes in the wet meadow (Myrifeld means marshy ground).
  const PUD = mat({ c: '#8aa0a4', c2: '#a8bcc0', pat: 'speckle', noEdge: true });
  for (let i = 0; i < 26; i++) {
    const x = -40 + r() * 220, z = 46 + r() * 90;
    if (Math.abs(x - riverX(z)) < 14) continue;
    k.cyl(x, groundH(x, z) + 0.02, z, 0.8 + r() * 2.2, 0.02, PUD, { seg: 10 });
    for (let j = 0; j < 5; j++) { const a = r() * 6.28, d = 1.2 + r() * 1.8; k.cyl(x + Math.cos(a) * d, groundH(x, z), z + Math.sin(a) * d, 0.03, 0.6 + r() * 0.5, mat({ c: '#7a8a46' }), { seg: 3, r2: 0.005 }); }
  }
  // Trees: willows by the river, scattered oaks and elms in the meadows (illustrative).
  for (let i = 0; i < 24; i++) { const z = 8 + r() * 140; tree(k, riverX(z) + (r() < 0.5 ? -1 : 1) * (10 + r() * 6), z, 7 + r() * 4, i, true); }
  for (let i = 0; i < 40; i++) {
    const x = -260 + r() * 520, z = 45 + r() * 340;
    if (x > -50 && x < 170 && z < 95) continue;
    if (Math.abs(x - riverX(z)) < 14) continue;
    tree(k, x, z, 8 + r() * 7, 100 + i, false);
  }
  for (let i = 0; i < 10; i++) tree(k, -60 - r() * 60, -2 + r() * 40, 7 + r() * 5, 200 + i, false);
}
