/* Conwy Castle: shared plan constants, materials and drawing helpers.
 *
 * All numbers are scene metres. x runs west to east (0 = tip of the west barbican),
 * y is height above the outer-ward courtyard, z is depth behind the cut (north).
 * See the layout plan at the top of ../castle.js and docs/research/castle.md.
 */
import { mat, shade } from '../../engine/index.js';

// ------------------------------------------------------------------ plan
export const TOWER_R = 6.0;          // outer radius of a great tower above its spurred base
export const TOWER_BASE = -5;        // external base of the towers on the rock
export const FL = [0, 4.5, 9, 13.5]; // tower floor levels; 13.5 is the roof platform
export const PARA = 14.4;            // top of the tower parapet breast wall
export const MERLON = 16.0;          // top of the tower merlons
export const WALK = 9.0;             // curtain wall-walk
export const CURT_TOP = 11.0;        // curtain merlon tops

// Front (cut) towers are centred on the cut plane; back towers are opened on their own centre line.
export const TOWERS = {
  sw: { x: 14.5, z: 0, name: 'South-west Tower', front: true },
  bake: { x: 68.3, z: 0, name: 'Bakehouse Tower', front: true, turret: true },
  king: { x: 99.0, z: 0, name: "King's Tower", front: true, turret: true },
  nw: { x: 11.8, z: 30, name: 'North-west Tower' },
  kit: { x: 40.5, z: 30, name: 'Kitchen Tower' },
  stock: { x: 68.3, z: 30, name: 'Stockhouse Tower', turret: true },
  chap: { x: 96.8, z: 30, name: 'Chapel Tower', turret: true },
};

// Hall range (outer ward, south side).
export const HALL = {
  x0: 23.3, x1: 62.3, z0: 0, z1: 9.0, back: 10.3, floor: 0.6, cellar: -3.0, plate: 7.0, ridge: 10.5,
  walls: { lesser: 31.0, small: 35.4, great: 47.0, passage: 50.6 },
};
// Inner ward south range (royal apartments).
export const ROYAL = { x0: 74.0, x1: 94.0, mid: 86.0, z0: 0, z1: 8.0, back: 9.2, first: 4.0, plate: 8.5, ridge: 11.0 };
export const OUTER_YARD = { x0: 23.3, x1: 62.0, z0: 10.3, z1: 27.0 };
export const INNER_YARD = { x0: 71.0, x1: 94.0, z0: 9.2, z1: 27.0 };
export const NCURT = { z0: 27.0, z1: 30.0 };           // north curtain
export const LEAN = { z0: 21.0, z1: 27.0, eave: 4.0, top: 7.0 }; // timber lean-to buildings
export const GATE_Z = [13, 17];                       // the axial gate passages run at these depths
export const WELL = { x: 60.4, z: 21.6, r: 0.95, depth: 28 };
export const DITCH = { x0: 62.0, x1: 66.5, z0: 6.0, z1: 24.0, y: -3.0 };
export const CROSS = { x0: 66.5, x1: 69.6, gx1: 71.0 }; // cross-wall and middle gatehouse
export const BARB_W = { x0: -0.5, x1: 13.5, z0: 6.0, z1: 24.0, y: -2.0 };
export const GARDEN = { x0: 97.6, x1: 117.0, z0: 1.0, z1: 25.0, y: -1.0 };
export const DOCK = { x0: 117.5, x1: 127.0, z0: 24.0, z1: 33.0, y: -6.2 };
export const TOWN_Y = -5.0;
export const TIDE = { mid: -9.8, amp: 2.4, high: 9.5, period: 12.42 };
export const tideLevel = (hour) => TIDE.mid + TIDE.amp * Math.cos(((hour - TIDE.high) / TIDE.period) * Math.PI * 2);

// ------------------------------------------------------------------ palette
export const C = {
  lime: '#ece6d6', limeDirty: '#d6d3c0', stoneCut: '#8c8a83', rubble: '#9a958a', sand: '#b5786a',
  plaster: '#f2eee4', redLine: '#a33b2a', oak: '#6b4a2f', oakCut: '#b08a5a', roof: '#5e6266', rock: '#7d7668',
};
export const M = {
  lime: mat({ c: C.lime, c2: '#dcd5c2', pat: 'stone', s: 0.7, cut: C.stoneCut, cutPat: true }),
  limeBase: mat({ c: C.limeDirty, c2: '#bfc0a6', pat: 'stone', s: 0.7, cut: C.stoneCut, cutPat: true }),
  cutStone: mat({ c: '#a29d92', c2: '#8a857a', pat: 'stone', s: 0.55 }), // drawn "section" faces of opened back towers
  rubble: mat({ c: C.rubble, c2: '#857f74', pat: 'stone', s: 0.45, cut: C.stoneCut, cutPat: true }),
  rubbleDark: mat({ c: '#7e786c', c2: '#6a645a', pat: 'stone', s: 0.4, cut: '#76726a', cutPat: true }),
  sooty: mat({ c: '#5a524a', c2: '#3e3832', pat: 'stone', s: 0.35, cut: '#5a544c' }),
  plasterRed: mat({ c: C.plaster, c2: C.redLine, pat: 'ashlar', s: 0.42, cut: C.stoneCut }),
  plaster: mat({ c: '#ebe4d4', c2: '#d8cfbc', pat: 'speckle', cut: C.stoneCut }),
  sand: mat({ c: C.sand, c2: '#9a6052', pat: 'ashlar', s: 0.32, cut: '#9a6052' }),
  oak: mat({ c: C.oak, c2: '#5a3c24', pat: 'grain', cut: C.oakCut }),
  oakDark: mat({ c: '#4e3624', c2: '#3e2a1a', pat: 'grain', cut: '#9a7448' }),
  oakGrey: mat({ c: '#8a8274', c2: '#746c60', pat: 'grain', cut: C.oakCut }),
  boards: mat({ c: '#9a7048', c2: '#7a5434', pat: 'planks', s: 0.28, cut: '#c49c64', cutPat: true }),
  rushes: mat({ c: '#b8aa70', c2: '#96884e', pat: 'thatch', s: 0.25, cut: '#c49c64' }),
  flags: mat({ c: '#8e897e', c2: '#77726a', pat: 'tiles', s: 0.7, cut: C.stoneCut }),
  roof: mat({ c: C.roof, c2: '#4c5054', pat: 'slates', s: 0.32, cut: '#3a3c40' }),
  roofUnder: mat({ c: '#6a5038', c2: '#5a4230', pat: 'planks', s: 0.22, cut: '#3a3c40' }),
  lead: mat({ c: '#86888a', c2: '#74767a', pat: 'planks', s: 0.6, cut: '#5a5c60' }),
  rock: mat({ c: C.rock, c2: '#6a6458', pat: 'rock', s: 1.2, cut: '#6f685c', cutPat: true }),
  rockDeep: mat({ c: '#6a6458', c2: '#5a554a', pat: 'rock', s: 1.6, cut: '#625c52', cutPat: true }),
  earth: mat({ c: '#9e8e74', c2: '#8a7a62', pat: 'speckle', cut: '#7a6a52' }),
  cobble: mat({ c: '#9a948a', c2: '#847e74', pat: 'stone', s: 0.35, cut: '#7a746a' }),
  turf: mat({ c: '#7a9a50', c2: '#6a8a42', pat: 'speckle', cut: '#6a5a40' }),
  grass: mat({ c: '#86a058', c2: '#74904a', pat: 'speckle', cut: '#6a5a40' }),
  mud: mat({ c: '#7e6e56', c2: '#6c5e48', pat: 'speckle', cut: '#5e5040' }),
  sandbank: mat({ c: '#c2b08a', c2: '#b0a07a', pat: 'speckle', cut: '#8a7a5a' }),
  dark: mat({ c: '#2a2420', cut: '#2a2420', plainCut: true }),
  void: mat({ c: '#1e1a18', cut: '#1e1a18', plainCut: true }),
  opening: mat({ c: '#7d93a2', c2: '#55697a' }),
  iron: mat({ c: '#3e3c3a', cut: '#2e2c2a' }),
  straw: mat({ c: '#d8c07a', c2: '#c0a660', pat: 'thatch', s: 0.15 }),
  thatch: mat({ c: '#a89060', c2: '#8a7448', pat: 'thatch', s: 0.3, cut: '#7a6440' }),
  daub: mat({ c: '#e6dcc4', c2: '#d4c8ae', pat: 'speckle', cut: '#b0a48a' }),
  frame: mat({ c: '#4a3626', c2: '#3a2a1e', pat: 'grain', cut: '#8a6a44' }),
  water: mat({ c: '#4e6e74', c2: '#3e5a60', pat: 'speckle' }),
};

// A pointed (two-centred) arch outline in x-y, from springing height ys, width w, centred at cx.
export function archPts(cx, y0, w, ys, n = 6) {
  const r = w * 0.85, pts = [[cx - w / 2, y0]];
  // Left arc: centred at (cx - w/2 + r, ys), from angle PI to the apex.
  const apexA = Math.acos((r - w / 2) / r);
  for (let i = 0; i <= n; i++) { const a = Math.PI - (Math.PI - apexA) * (i / n); pts.push([cx - w / 2 + r + Math.cos(a) * r, ys + Math.sin(a) * r]); }
  for (let i = n - 1; i >= 0; i--) { const a = Math.PI - (Math.PI - apexA) * (i / n); pts.push([cx + w / 2 - r - Math.cos(a) * r, ys + Math.sin(a) * r]); }
  pts.push([cx + w / 2, y0]);
  return pts;
}

// Points on a circle around (cx, cz) at angle a (0 = +x, PI/2 = away from the viewer).
export const polar = (cx, cz, r, a) => [cx + Math.cos(a) * r, cz + Math.sin(a) * r];

// A merlon with three small pointed finials (a Savoyard fashion at Conwy).
export function merlon(k, cx, y, cz, w, h, d, rotY, m, fin = true) {
  k.boxR(cx, y + h / 2, cz, w, h, d, m, { y: rotY });
  if (!fin) return;
  const c = Math.cos(rotY), s = Math.sin(rotY);
  for (const t of [-0.34, 0, 0.34]) {
    const fx = cx + c * t * w, fz = cz - s * t * w;
    k.cyl(fx, y + h, fz, 0.13, 0.42, m, { r2: 0.0, seg: 4 });
  }
}

// Straight battlements along x (dir 'x') or z (dir 'z') on a wall top at walk level y.
// Returns nothing. Breast wall from y to y+0.9, merlons above to y+2.
export function battlementsLine(k, a0, a1, fixed, y, dir, m, opt = {}) {
  const th = opt.t || 0.7, pitch = opt.pitch || 2.3, mw = opt.mw || 1.3, mh = opt.mh || 1.1, breast = opt.breast || 0.9;
  if (dir === 'x') k.box(a0, y, fixed - th / 2, a1, y + breast, fixed + th / 2, m);
  else k.box(fixed - th / 2, y, a0, fixed + th / 2, y + breast, a1, m);
  const n = Math.max(1, Math.floor((a1 - a0) / pitch));
  const step = (a1 - a0) / n;
  for (let i = 0; i < n; i++) {
    const c = a0 + step * (i + 0.5);
    if (dir === 'x') merlon(k, c, y + breast, fixed, mw, mh, th, 0, m, opt.fin !== false);
    else merlon(k, fixed, y + breast, c, mw, mh, th, Math.PI / 2, m, opt.fin !== false);
  }
}

// Ring of merlons on a round tower or turret top.
export function battlementsRing(k, cx, cz, rOut, rIn, y, n, m, opt = {}) {
  const a0 = opt.a0 != null ? opt.a0 : 0, a1 = opt.a1 != null ? opt.a1 : Math.PI * 2;
  const breast = opt.breast || 0.9, mh = opt.mh || 1.1;
  k.lathe([[rIn, y], [rOut, y], [rOut, y + breast], [rIn, y + breast], [rIn, y]], cx, cz, m, { seg: opt.seg || 40, a0, a1, capTop: false, capBot: false, wallMat: opt.wallMat });
  const rm = (rOut + rIn) / 2, d = rOut - rIn;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / n;
    const [x, z] = polar(cx, cz, rm, a);
    const w = (((a1 - a0) / n) * rm) * 0.58;
    merlon(k, x, y + breast, z, w, mh, d, -a + Math.PI / 2, m, opt.fin !== false);
  }
}

// A dark window or loop opening let into a curved inner wall, with a sandstone surround.
export function roundOpening(k, cx, cz, r, a, y, w, h, opt = {}) {
  const [x, z] = polar(cx, cz, r - 0.02, a);
  const rot = { y: -a + Math.PI / 2 };
  k.boxR(x, y + h / 2, z, w + 0.24, h + 0.24, 0.06, opt.frame || M.sand, rot);
  const [x2, z2] = polar(cx, cz, r - 0.05, a);
  k.boxR(x2, y + h / 2, z2, w, h, 0.07, opt.fill || M.opening, rot);
  if (opt.seat) {
    const [x3, z3] = polar(cx, cz, r - 0.25, a);
    k.boxR(x3, y - 0.05, z3, w + 0.2, 0.1, 0.5, M.sand, rot);
  }
}

export const sh = shade;
