/* Submarine scene: the shape of USS Pampanito (SS-383) and the shared materials.
 * See ../submarine.js for the layout plan. Units are metres; x from the bow tip (0) to the
 * stern (95), y above the bottom of the keel, z behind the centreline cut (starboard half).
 */
import { mat } from '../../engine/index.js';

export const LOA = 95.0;
export const WL = 4.6;          // waterline on the surface (dossier 2b)
export const DAY_SEA = 19.4;    // sea level over the keel at periscope depth (illustrative)

// Watertight bulkheads and partitions (dossier 2c).
export const X = {
  stem: 0, phF: 9.65, ftrF: 11.48, fb: 23.06, pantry: 24.3, cr: 32.44, radio: 38.6, ab: 40.67,
  mess: 43.0, berth: 45.89, wash: 52.6, fer: 54.19, aer: 62.22, man: 70.42, atr: 76.56, phA: 87.53, stern: 95.0,
};
// Deck (floor) heights of the main level and the lower flats.
export const DECK = { ftr: 3.25, fb: 3.57, cr: 3.50, ab: 3.57, eng: 3.58, man: 3.58, atr: 3.58 };
export const LOW = { ftr: 1.55, well: 1.15, pump: 1.15, eng: 1.45, motor: 1.25, atr: 2.4 };
export const CT = { x0: 33.8, x1: 39.1, yc: 8.0, r: 1.22, deck: 7.40 };       // conning tower cylinder
export const BRIDGE = { x0: 32.4, x1: 43.0, deck: 8.95, top: 10.28 };       // fairwater and bridge flat
export const SHEARS = { top: 14.41, periTop: 20.32, x1: 35.6, x2: 36.9 };      // periscopes No. 1 and No. 2
export const SHAFT = { z: 1.73, y89: 2.06, slope: Math.tan((1.5 * Math.PI) / 180) };
export const shaftY = (x) => SHAFT.y89 + (89.4 - x) * SHAFT.slope;

const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Piecewise-linear table lookup with smoothstep between points.
export function table(T, x) {
  if (x <= T[0][0]) return T[0][1];
  for (let i = 1; i < T.length; i++) {
    if (x <= T[i][0]) {
      const t = (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]);
      return lerp(T[i - 1][1], T[i][1], t * t * (3 - 2 * t) * 0.5 + t * 0.5);
    }
  }
  return T[T.length - 1][1];
}

// ------------------------------------------------------------------ profile
// Keel line (bottom of the hull at the centreline) [layout estimate from Plate 6(A)].
const KEEL = [[0, 8.3], [0.5, 7.2], [1.2, 6.0], [2.2, 4.8], [3.6, 3.5], [5.4, 2.3], [7.6, 1.3], [10.2, 0.5], [13.0, 0.0],
  [72, 0.0], [77, 0.25], [82, 0.85], [87.5, 2.0], [91, 3.0], [93.6, 3.9], [95, 4.6]];
// Main deck at the centreline (dossier 2d).
const DECKL = [[0, 8.3], [1.4, 8.27], [10, 7.75], [22, 7.3], [36.8, 6.99], [60, 6.92], [95, 6.8]];
export const keelY = (x) => table(KEEL, x);
export const deckY = (x) => table(DECKL, x);
// Pressure hull: centre height and outer radius along the boat [derived / layout estimate].
const PHR = [[X.phF, 1.92], [X.ftrF, 2.05], [17, 2.3], [X.fb, 2.45], [X.atr, 2.45], [82, 2.17], [X.phA, 1.78]];
const PHY = [[X.phF, 3.45], [17, 3.5], [X.fb, 3.6], [X.atr, 3.6], [82, 3.76], [X.phA, 4.0]];
export const phR = (x) => table(PHR, x);
export const phY = (x) => table(PHY, x);
export const PH_T = 0.1; // plating thickness as drawn (the real plate was 7/8 in)
export const phIn = (x) => phR(x) - PH_T;
// Half-width of the room at height y (inner face of the pressure hull).
export function roomZ(x, y) {
  const r = phIn(x) - 0.02, d = y - phY(x);
  return d * d < r * r ? Math.sqrt(r * r - d * d) : 0;
}
// Overhead height above a point at depth z.
export function ceilY(x, z) { const r = phIn(x) - 0.02; return phY(x) + Math.sqrt(Math.max(0, r * r - z * z)); }

// Outer hull: half breadth at its widest, the height of the widest point, half width of the deck.
const BM = [[0, 0.05], [1.0, 0.5], [3, 1.15], [6, 1.75], [9.65, 2.15], [14, 2.6], [18, 3.1], [23, 3.7], [28, 4.08], [31, 4.16],
  [56, 4.16], [62, 4.02], [68, 3.65], [73, 3.15], [77, 2.75], [82, 2.35], [87.5, 1.95], [91, 1.3], [93.5, 0.75], [95, 0.3]];
const BD = [[0, 0.12], [1.5, 0.45], [6, 1.05], [12, 1.5], [22, 1.85], [30, 2.0], [60, 2.0], [76, 1.8], [86, 1.35], [91, 0.85], [95, 0.3]];
export const halfBeam = (x) => {
  let b = table(BM, x);
  if (x > X.phF && x < X.phA) b = Math.max(b, phR(x) + 0.16);
  return b;
};
export const deckHalf = (x) => table(BD, x);
export const beamY = (x) => Math.max(3.7, keelY(x) + (deckY(x) - keelY(x)) * 0.42);

// Outer hull section at x: points [z, y] from the keel (z = 0) round to the deck at the
// centreline. N points, the same count everywhere so sections loft.
export const NS = 26;
export function outerSection(x) {
  const K = keelY(x), D = deckY(x), Bm = halfBeam(x), Bd = Math.min(deckHalf(x), Bm), ym = Math.min(beamY(x), D - 0.05);
  const pts = [];
  const nLow = 12, nUp = 10, nDeck = NS - nLow - nUp;
  for (let i = 0; i < nLow; i++) {
    const u = 1 - i / nLow; // 1 at the keel, ->0 at the widest point
    const n = 2.5;
    const z = Bm * Math.pow(Math.max(0, 1 - Math.pow(u, n)), 1 / n);
    pts.push([Math.max(i === 0 ? 0 : 0.04, z), K + (ym - K) * (1 - u)]);
  }
  for (let i = 0; i < nUp; i++) {
    const s = i / (nUp - 1);
    const z = Bd + (Bm - Bd) * Math.pow(Math.cos((s * Math.PI) / 2), 0.85);
    const y = ym + (D - 0.04 - ym) * Math.sin((s * Math.PI) / 2);
    pts.push([z, y]);
  }
  for (let i = 1; i <= nDeck; i++) {
    const s = i / nDeck;
    pts.push([Bd * (1 - s), D - 0.04 + 0.04 * Math.sin((s * Math.PI) / 2)]);
  }
  return pts;
}

// Offset a section polyline inward by t (normal offset, approximate).
export function inset(pts, t) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dz = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dz, dy) || 1;
    dz /= l; dy /= l;
    // The path runs keel -> side -> deck (counter-clockwise seen with z right, y up); inward is to the left.
    out.push([pts[i][0] - dy * t, pts[i][1] + dz * t]);
  }
  return out;
}

// x positions of the hull at height y (where the outer skin meets the centreline), used for the
// water cut face. Returns [xBow, xStern].
export function hullSpanAt(y) {
  let a = null, b = null;
  for (let x = 0; x <= LOA; x += 0.05) {
    const inside = y >= keelY(x) && y <= deckY(x);
    if (inside) { if (a == null) a = x; b = x; }
  }
  return a == null ? null : [a, b];
}
// Dry interior at the cut plane at height y: [x0, x1] or null.
export function drySpanAt(y) {
  let a = null, b = null;
  for (let x = X.phF + 0.15; x <= X.phA - 0.15; x += 0.05) {
    const c = phY(x), r = phIn(x);
    if (Math.abs(y - c) < r) { if (a == null) a = x; b = x; }
  }
  return a == null ? null : [a, b];
}

// ------------------------------------------------------------------ materials
export const M = {
  // Outside. Two greys on the sides, black on horizontal surfaces (dossier 3, zone 3, S21).
  greyHi: mat({ c: '#8c9398', c2: '#7c8388', pat: 'plates', s: 1.2, cut: '#2a2626' }),
  greyLo: mat({ c: '#6e757b', c2: '#62696e', pat: 'plates', s: 1.2, cut: '#2a2626' }),
  bottom: mat({ c: '#33302e', c2: '#2a2826', pat: 'plates', s: 1.2, cut: '#2a2626' }),
  deck: mat({ c: '#3c3a37', c2: '#2e2c2a', pat: 'deck', s: 0.16, cut: '#5a4a3a' }),
  skinIn: mat({ c: '#646a66', c2: '#585e5a', pat: 'rivets', s: 0.5, cut: '#2a2626' }),
  black: mat({ c: '#2c2b2a', cut: '#2a2626' }),
  // The pressure hull: red-lead cut, white overheads inside.
  ph: mat({ c: '#e4e1d6', c2: '#d8d4c6', pat: 'speckle', cut: '#a8402e' }),
  phLow: mat({ c: '#a9aba4', c2: '#9a9c96', pat: 'speckle', cut: '#a8402e' }),
  phEng: mat({ c: '#d8dcd2', c2: '#c8ccc2', pat: 'speckle', cut: '#a8402e' }),
  phOut: mat({ c: '#4a4e4c', c2: '#3e4240', pat: 'rivets', s: 0.6, cut: '#a8402e' }),
  frame: mat({ c: '#d2cfc4', cut: '#a8402e' }),
  // Tanks between the hulls, in section.
  mbt: mat({ c: '#4a4e4c', c2: '#3e4240', cut: '#5e3a32' }),
  fuel: mat({ c: '#4a4e4c', c2: '#3e4240', cut: '#2e2822' }),
  trim: mat({ c: '#6a6e6a', c2: '#5e625e', cut: '#4e5a62' }),
  bulk: mat({ c: '#d6d3c8', c2: '#c8c5ba', pat: 'rivets', s: 0.45, cut: '#8a3a2a' }),
  bulkLow: mat({ c: '#9a9c96', c2: '#8a8c86', pat: 'rivets', s: 0.45, cut: '#8a3a2a' }),
  door: mat({ c: '#8a908c', c2: '#7a807c', cut: '#5a5e5c' }),
  // Floors.
  plate: mat({ c: '#6f726c', c2: '#5e615c', pat: 'plates', s: 0.6, cut: '#3a3a38' }),
  lino: mat({ c: '#6a5446', c2: '#5c473a', pat: 'tiles', s: 0.3, cut: '#3a3a38' }),
  grate: mat({ c: '#7a7e78', c2: '#4a4e4a', pat: 'grate', s: 0.08, cut: '#3a3a38' }),
  rubber: mat({ c: '#2e2c2a', c2: '#3a3836', pat: 'grate', s: 0.12, cut: '#1e1e1e' }),
  // Machinery and fittings.
  mach: mat({ c: '#8a948e', c2: '#7c8680', cut: '#4e5450' }),
  machDk: mat({ c: '#6a7470', c2: '#5c6662', cut: '#3e4440' }),
  engine: mat({ c: '#7e8a86', c2: '#6e7a76', pat: 'panels', s: 0.6, cut: '#4a5250' }),
  cabinet: mat({ c: '#9aa09a', c2: '#8a908a', pat: 'panels', s: 0.4, cut: '#5a605a' }),
  steel: mat({ c: '#b4b8b6', c2: '#a4a8a6', cut: '#6a6e6c' }),
  stainless: mat({ c: '#c8ccc8', c2: '#b8bcb8', cut: '#7a7e7a' }),
  brass: mat({ c: '#c8a050', c2: '#b08a40', cut: '#8a6a30' }),
  bronze: mat({ c: '#b0884a', c2: '#9a7840', cut: '#7a5a30' }),
  gauge: mat({ c: '#1e1e1c', cut: '#1e1e1c' }),
  dial: mat({ c: '#efe8d4', cut: '#cfc8b4' }),
  pipe: mat({ c: '#a4a8a0', cut: '#6a6e68' }),
  pipeDk: mat({ c: '#5e6662', cut: '#3e4440' }),
  pipeRed: mat({ c: '#a04a3a', cut: '#6a2a20' }),
  pipeGreen: mat({ c: '#5a7a5a', cut: '#3a5a3a' }),
  cable: mat({ c: '#3a3a36', cut: '#2a2a28' }),
  torpedo: mat({ c: '#6e7472', c2: '#5e6462', cut: '#3e4442' }),
  torpHead: mat({ c: '#8a8e84', cut: '#4e524a' }),
  breech: mat({ c: '#d8c088', c2: '#c4aa70', cut: '#8a6a30' }),
  cell: mat({ c: '#4a4440', c2: '#5e5650', pat: 'panels', s: 0.38, cut: '#1e1c1a' }),
  cellTop: mat({ c: '#8a8680', c2: '#7a7670', cut: '#4a4844' }),
  lead: mat({ c: '#7e807e', cut: '#5a5c5a' }),
  canvas: mat({ c: '#d8d0bc', c2: '#c8c0aa', pat: 'canvas', s: 0.2 }),
  mattress: mat({ c: '#c8c2b0', c2: '#b8b2a0', pat: 'quilt', s: 0.2 }),
  blanket: mat({ c: '#5a5e52', c2: '#4e5246', pat: 'stripes', s: 0.25 }),
  locker: mat({ c: '#9aa4a0', c2: '#8a9490', pat: 'panels', s: 0.32, cut: '#5a605a' }),
  wood: mat({ c: '#8a5e3a', c2: '#7a5030', pat: 'grain', cut: '#5a3a22' }),
  cloth: mat({ c: '#e8e4d8', cut: '#b8b4a8' }),
  green: mat({ c: '#4e6e52', c2: '#425e46', cut: '#2e4a32' }),
  oxy: mat({ c: '#4a7a4e', cut: '#2e5a32' }),
  white: mat({ c: '#eceae2', cut: '#b8b6ae' }),
  enamel: mat({ c: '#f0eee6', c2: '#e0ded6', pat: 'tiles', s: 0.15, cut: '#b8b6ae' }),
  curtain: mat({ c: '#6e7a5a', c2: '#5e6a4a', pat: 'stripes', s: 0.06, thin: true }),
  redLens: mat({ c: '#c03020', c2: '#ff4a30', glow: 'always', noEdge: true }),
  greenLens: mat({ c: '#30a040', c2: '#50ff70', glow: 'always', noEdge: true }),
  amberLens: mat({ c: '#c09030', c2: '#ffc860', glow: 'always', noEdge: true }),
  screen: mat({ c: '#2a3a2a', c2: '#6aff8a', glow: 'always', noEdge: true }),
  // Whole items (masts, periscopes, guns): ignore the cutaway.
  mast: mat({ c: '#8c9398', c2: '#7c8388', whole: true }),
  mastDk: mat({ c: '#5a6066', whole: true }),
  peri: mat({ c: '#b8bcb8', whole: true }),
  gun: mat({ c: '#7a8288', c2: '#6a7278', whole: true }),
  gunDk: mat({ c: '#3a3e42', whole: true }),
  propeller: mat({ c: '#b48a4e', c2: '#9a7440', whole: true }),
};

// Interior light colours (dossier 3: red where men needed night vision, white in the galley
// and engine rooms, after USS Grayback's practice).
export const RED = '#ff3a26';
export const WHITE = '#ffe8c8';
