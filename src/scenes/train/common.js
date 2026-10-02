/* Shared dimensions, materials and small builders for the train scene.
 *
 * Scene coordinates: x metres from the engine's front buffer face (the train runs
 * towards -x), y metres above the rail top, z depth behind the cut (z = 0 is the
 * centreline of the down line; the far, east side of the train is z = +1.41).
 * Sources: docs/research/train.md (zone table, section 3).
 */
import { mat, shade } from '../../engine/index.js';

// ------------------------------------------------------------------ dimensions
export const GAUGE = 0.7175;         // rail centres either side of the centreline
export const FL = 1.25;              // coach floor (illustrative, section 2)
export const CEIL = 3.4;             // coach ceiling at the centre
export const ZW = 1.41;              // coach body half width, outer face (9 ft 3 in body)
export const ZI = 1.31;              // inner face of the far wall
export const SILL = 1.95, WTOP = 2.75, CANT = 3.02, CROWN = 3.9;
export const AISLE = -0.12;          // where people walk (just in front of the cut)
// Vehicle boundaries along the train (zone table): tender end, twins, observation car.
export const ENGINE_END = 14.6, TENDER_END = 21.65;
export const B = [21.65, 39.1, 56.6, 74.1, 91.6, 109.1, 126.6, 144.1, 161.6, 178.05];
export const LEN = 178.05;
export const SPEED = 26.8;           // m/s, 60 mph over the bridge (illustrative, section 6)

// ------------------------------------------------------------------ colours
export const COL = {
  garter: '#21406c',      // Garter blue: engine casing, coach sides below the waist
  marl: '#7393c4',        // Marlborough blue: coach sides above the waist
  roof: '#6a86b2',
  stainless: '#d4d8dc',
  black: '#22201e',
  wheelRed: '#6e2420',    // driving wheels dark red with polished rims
  tyre: '#b4b8bc',
  steel: '#7a8088',
  oil: '#2c2a2a',
  copper: '#b8683a',
  brass: '#c8a050',
  coal: '#26241f',
  teak: '#9a6a3a',
};

// ------------------------------------------------------------------ materials
export const M = {
  casing: mat({ c: COL.garter, c2: shade(COL.garter, -0.15), cut: '#2e2422' }),
  casingIn: mat({ c: '#3a3634', cut: '#2e2422' }),
  noseBlack: mat({ c: COL.black, cut: '#2e2422' }),
  redLine: mat({ c: '#b8322a' }),
  steel: mat({ c: COL.steel, cut: '#3a3436' }),
  dark: mat({ c: '#34302e', cut: '#2a2422' }),
  black: mat({ c: COL.black, cut: '#1a1614' }),
  frame: mat({ c: '#2a2626', c2: '#3a3434', pat: 'rivets', s: 0.5, cut: '#8a2a22' }),
  boiler: mat({ c: '#5a5450', cut: '#a8402e' }),
  boilerIn: mat({ c: '#8a7e70', c2: '#7a6e60', pat: 'plates', s: 0.6, cut: '#a8402e' }),
  lagging: mat({ c: '#c8bfa8', c2: '#b8ae96', pat: 'quilt', s: 0.3, cut: '#c8bfa8' }),
  smokebox: mat({ c: '#1e1c1c', c2: '#2a2626', cut: '#3a2a26' }),
  ash: mat({ c: '#4a4642', c2: '#6a6560', pat: 'speckle' }),
  copper: mat({ c: COL.copper, c2: '#a85a30', pat: 'rivets', s: 0.35, cut: '#c87a4a' }),
  brick: mat({ c: '#c8a070', c2: '#b08050', pat: 'brick', s: 1.2, cut: '#a87a50' }),
  fireBed: mat({ c: '#ff9a3a', c2: '#ffd070', pat: 'speckle', glow: 'always' }),
  fireHot: mat({ c: '#ffcf6a', c2: '#fff0b0', glow: 'always', noEdge: true }),
  tubes: mat({ c: '#6a625a', cut: '#4a4038' }),
  flue: mat({ c: '#5a524a', cut: '#4a4038' }),
  wheelRed: mat({ c: COL.wheelRed, cut: '#4a1a18' }),
  tyre: mat({ c: COL.tyre, cut: '#6a6e72' }),
  rod: mat({ c: '#c4c8cc', c2: '#9aa0a6', cut: '#6a6e72' }),
  rodW: mat({ c: '#c4c8cc', whole: true }),
  wheelRedW: mat({ c: COL.wheelRed, whole: true }),
  tyreW: mat({ c: COL.tyre, whole: true }),
  oilW: mat({ c: COL.oil, whole: true }),
  steelW: mat({ c: '#5a5e64', whole: true }),
  casingW: mat({ c: COL.garter, whole: true }),
  blackW: mat({ c: COL.black, whole: true }),
  stainlessW: mat({ c: COL.stainless, whole: true }),
  brassW: mat({ c: COL.brass, whole: true }),
  cabIn: mat({ c: '#6a5a44', c2: '#5a4a36', pat: 'panels', s: 0.5, cut: '#2e2422' }),
  cabFloor: mat({ c: '#6a5a46', c2: '#4a3e30', pat: 'planks', s: 0.12, cut: '#7a5a3a' }),
  brass: mat({ c: COL.brass }),
  gauge: mat({ c: '#f2ead8', c2: '#2a2420' }),
  coal: mat({ c: COL.coal, c2: '#46423a', pat: 'rock', cut: '#1e1c18' }),
  tank: mat({ c: '#4a4e52', c2: '#3a3e42', pat: 'plates', s: 0.8, cut: '#2e2422' }),
  // Coach body: steel panels on timber framing; the cut shows honey timber.
  sideLo: mat({ c: COL.garter, cut: '#a8783e' }),
  sideHi: mat({ c: COL.marl, cut: '#a8783e' }),
  roof: mat({ c: COL.roof, c2: shade(COL.roof, -0.1), cut: '#9a7040' }),
  under: mat({ c: '#2c2a2a', c2: '#3a3636', cut: '#3a2e26' }),
  floorSlab: mat({ c: '#6a5a48', cut: '#b08a52', pat: 'planks', s: 0.12, cutPat: true }),
  bellows: mat({ c: '#2a2a2c', c2: '#4a4a4c', pat: 'stripes', s: 0.06, cut: '#2a2a2a' }),
  stainless: mat({ c: COL.stainless }),
  rail: mat({ c: '#8a8a8c', c2: '#6a6a6c', cut: '#5a5a5c' }),
  sleeper: mat({ c: '#5a4636', c2: '#4a3a2c', pat: 'grain', cut: '#8a6a4a' }),
  ballast: mat({ c: '#8a8278', c2: '#6a645c', pat: 'speckle', cut: '#7a7268' }),
};

// ------------------------------------------------------------------ helpers
// A box rotated about the vertical axis. Its local +x points along heading h (0 = +x, PI/2 = away).
export function hbox(k, cx, y0, cz, w, h, d, m, hd = 0) {
  k.boxR(cx, y0 + h / 2, cz, w, h, d, m, { y: -hd });
}

// A seat (armchair) facing along +x (f = 1) or -x (f = -1), centred on (x, z), floor y.
// Returns the anchor where a sitter's feet/hips go.
export function seatX(k, x, y, z, f, o = {}) {
  const w = o.w || 0.5, dep = o.d || 0.56, sh = o.seat || 0.45, bh = o.back || 1.08;
  const fab = mat({ c: o.color || '#5a6a8a', c2: shade(o.color || '#5a6a8a', -0.12), pat: o.pat || 'none', s: 0.08 });
  const fr = mat({ c: o.frame || shade(o.color || '#5a6a8a', -0.35) });
  const bx = x - f * (dep / 2); // back edge
  // Seat cushion.
  k.box(Math.min(bx, bx + f * dep), y + 0.12, z - w / 2, Math.max(bx, bx + f * dep), y + sh, z + w / 2, fab);
  // Back.
  const b0 = bx - f * 0.12;
  k.box(Math.min(b0, bx), y + 0.12, z - w / 2, Math.max(b0, bx), y + bh, z + w / 2, fab);
  // Head roll.
  k.box(Math.min(b0, bx) - 0.01, y + bh - 0.14, z - w / 2 + 0.02, Math.max(b0, bx) + 0.01, y + bh + 0.02, z + w / 2 - 0.02, mat({ c: shade(o.color || '#5a6a8a', 0.12) }));
  // Arms.
  if (o.arms !== false) for (const s of [-1, 1]) {
    const za = z + s * (w / 2 - 0.04);
    k.box(Math.min(bx, bx + f * dep * 0.85), y + 0.12, za - 0.04, Math.max(bx, bx + f * dep * 0.85), y + sh + 0.2, za + 0.04, fab);
  }
  // Plinth.
  k.box(Math.min(bx, bx + f * dep) + 0.03, y, z - w / 2 + 0.03, Math.max(bx, bx + f * dep) - 0.03, y + 0.12, z + w / 2 - 0.03, fr);
  return { x: x + f * 0.02, y, z };
}

// A swivel armchair turned to heading hd (radians, 0 = +x).
export function seatH(k, x, y, z, hd, o = {}) {
  const w = o.w || 0.56, dep = 0.56, sh = 0.45, bh = o.back || 1.0;
  const col = o.color || '#c8b088';
  const fab = mat({ c: col, c2: shade(col, -0.12) });
  const c = Math.cos(hd), s = Math.sin(hd);
  hbox(k, x, y, z, 0.4, 0.14, 0.4, mat({ c: '#8a8a8e' }), hd);
  hbox(k, x, y + 0.14, z, dep, sh - 0.14, w, fab, hd);
  hbox(k, x - c * (dep / 2 + 0.05), y + 0.14, z - s * (dep / 2 + 0.05), 0.12, bh - 0.14, w, fab, hd);
  for (const side of [-1, 1]) hbox(k, x + -s * side * (w / 2 - 0.04) * -1, y + 0.14, z + c * side * (w / 2 - 0.04), dep * 0.85, sh + 0.06, 0.08, fab, hd);
  return { x: x + c * 0.02, y, z: z + s * 0.02 };
}

// Simple stroke letters built from thin boxes on a plane facing -z (towards the viewer) at depth z.
// Each glyph is a list of segments in a 0..1 x 0..1 cell.
const GLYPH = {
  L: [[0, 0, 0, 1], [0, 0, 0.8, 0]], N: [[0, 0, 0, 1], [0, 1, 0.8, 0], [0.8, 0, 0.8, 1]],
  E: [[0, 0, 0, 1], [0, 1, 0.8, 1], [0, 0.5, 0.6, 0.5], [0, 0, 0.8, 0]], R: [[0, 0, 0, 1], [0, 1, 0.7, 1], [0.7, 1, 0.8, 0.75], [0.8, 0.75, 0.7, 0.5], [0.7, 0.5, 0, 0.5], [0.3, 0.5, 0.8, 0]],
  4: [[0.6, 0, 0.6, 1], [0.6, 1, 0, 0.35], [0, 0.35, 0.8, 0.35]], 8: [[0, 0, 0.8, 0], [0.8, 0, 0.8, 1], [0.8, 1, 0, 1], [0, 1, 0, 0], [0, 0.5, 0.8, 0.5]],
  9: [[0.8, 0, 0.8, 1], [0.8, 1, 0, 1], [0, 1, 0, 0.5], [0, 0.5, 0.8, 0.5]],
  C: [[0.8, 0, 0, 0], [0, 0, 0, 1], [0, 1, 0.8, 1]], O: [[0, 0, 0.8, 0], [0.8, 0, 0.8, 1], [0.8, 1, 0, 1], [0, 1, 0, 0]],
  A: [[0, 0, 0.4, 1], [0.4, 1, 0.8, 0], [0.18, 0.4, 0.62, 0.4]], T: [[0, 1, 0.8, 1], [0.4, 1, 0.4, 0]], I: [[0.4, 0, 0.4, 1]],
};
export function letters(k, text, x0, y0, z, h, m, step = 0.9) {
  let x = x0;
  const t = Math.max(0.012, h * 0.11);
  for (const ch of text) {
    const g = GLYPH[ch];
    if (g) for (const [a, b, c, d] of g) k.beam([x + a * h * 0.75, y0 + b * h, z], [x + c * h * 0.75, y0 + d * h, z], t, m);
    x += h * step;
  }
  return x;
}
