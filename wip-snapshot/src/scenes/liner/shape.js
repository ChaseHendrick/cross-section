/* The Atlantic Liner: hull form, deck heights and shared materials.
 *
 * Scene coordinates: x = metres from the stem (bow at the left), y = metres above the
 * keel, z = depth behind the centreline cut (the starboard half is built, z = 0..18).
 * Deck heights follow the dossier's derived vertical scale (docs/research/liner.md, 2).
 */
import { XS, mat } from '../../engine/index.js';

const { clamp, smoothstep, lerp } = XS.math;

export const LOA = 310.7;
export const BEAM = 36.0;
export const HB = BEAM / 2;
export const WL = 11.8;           // waterline above the keel
export const BOOT = 12.5;         // top of the red boot-topping
export const SLAB = 0.32;         // deck thickness (drawn a little heavy, as in the books)

// Floor heights of the decks (1936 letters).
export const DK = {
  tt: 1.8, H: 4.6, G: 7.4, F: 10.2, E: 13.0, D: 15.8, C: 18.6, B: 21.5, A: 24.4,
  M: 27.3, P: 30.3, S: 33.7, SP: 36.6, WH: 38.6, CP: 41.1,
};
export const DECK_NAMES = { tt: 'tank top', H: 'H deck', G: 'G deck', F: 'F deck', E: 'E deck', D: 'D deck', C: 'C deck', B: 'B deck', A: 'A deck', M: 'Main deck', P: 'Promenade deck', S: 'Sun deck', SP: 'Sports deck' };

// Funnels: x range of the ellipse, base on the Sun deck, top heights above the keel.
export const FUNNELS = [
  { x0: 104.5, x1: 115.5, top: 55.2 },
  { x0: 142.5, x1: 153.5, top: 54.3 },
  { x0: 180.5, x1: 191.5, top: 52.7 },
];
export const FOREMAST_X = 50;
export const MAINMAST_X = 262;

// Watertight bulkheads (18, positions are a layout estimate) used by the slicer.
export const BULKHEADS = [12, 30, 48, 62, 76, 92, 104, 118, 126, 140, 154, 162, 176, 199, 222, 250, 270, 285];

// ------------------------------------------------------------------ hull form
// Height of the hull's top edge (the sheer) along the ship.
export function sheer(x) {
  if (x < 60) return 30.3 + 2.3 * Math.pow(1 - x / 60, 2);
  if (x > 250) return 30.3 + 0.9 * Math.pow((x - 250) / 60.7, 2);
  return 30.3;
}
// The stem: x of the leading edge at height y.
const STEM = [[0, 14], [0.6, 11.2], [2, 8.8], [5, 7.0], [11.8, 4.4], [20, 2.4], [33, 0]];
export function stemX(y) {
  for (let i = 1; i < STEM.length; i++) if (y <= STEM[i][0]) { const [y0, x0] = STEM[i - 1], [y1, x1] = STEM[i]; return lerp(x0, x1, (y - y0) / (y1 - y0)); }
  return 0;
}
// Bottom of the hull at station x (the keel, rising into the stem and the cruiser stern).
export function ybot(x) {
  let y = 0;
  if (x < 14) { // invert the stem
    let lo = 0, hi = 33;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (stemX(m) > x) lo = m; else hi = m; }
    y = (lo + hi) / 2;
  }
  if (x > 265) y = Math.max(y, 17.5 * Math.pow(clamp((x - 265) / (LOA - 265), 0, 1), 1.8));
  return y;
}
// Half-breadth at deck level in plan.
export function hbDeck(x) {
  if (x <= 0) return 0;
  if (x < 80) return HB * Math.pow(1 - Math.pow(1 - x / 80, 2), 0.72);
  if (x > 240) return HB * Math.sqrt(Math.max(0, 1 - Math.pow((x - 240) / 72, 2)));
  return HB;
}
// Fullness of the sections: 1 in the parallel middle body, 0 at the ends.
const full = (x) => smoothstep(4, 80, x) * (1 - smoothstep(232, 300, x));
// Half-breadth of the outer plating at station x and height y (0 outside the hull).
export function hb(x, y) {
  const yb = ybot(x), ys = sheer(x);
  if (y < yb) return 0;
  const f = full(x);
  const Hb = 2.8 + (1 - f) * 15;
  const p = 1.5 + f * 2.6;
  const u = clamp((Math.min(y, ys) - yb) / Hb, 0, 1);
  return hbDeck(x) * (1 - Math.pow(1 - u, p));
}
// Inner face of the plating (usable half-width of a deck at height y).
export const inner = (x, y) => Math.max(0, hb(x, y) - 0.5);

// ------------------------------------------------------------------ materials
export const M = {
  hullBlack: mat({ c: '#262220', c2: '#34302c', pat: 'plates', s: 1.2, cut: '#1c1816' }),
  hullRed: mat({ c: '#a8402e', c2: '#963828', pat: 'plates', s: 1.2, cut: '#7a2a1e' }),
  hullIn: mat({ c: '#9a7462', c2: '#8a6452', pat: 'rivets', s: 1.2, cut: '#2a2220' }),
  sheerTop: mat({ c: '#e8e0d0', cut: '#1c1816' }),
  bottom: mat({ c: '#6a6a66', c2: '#5a5a56', pat: 'plates', s: 1.0, cut: '#7a2e22' }),
  whitePaint: mat({ c: '#f2ece0', c2: '#e2dccc', pat: 'plates', s: 0.9, cut: '#b8b0a0' }),
  whiteHouse: mat({ c: '#f0e9da', c2: '#e0d8c6', cut: '#b8b0a0' }),
  teak: mat({ c: '#c8a070', c2: '#a8804e', pat: 'deck', s: 0.14, cut: '#9a7448', cutPat: true }),
  deckSteel: mat({ c: '#8a8680', c2: '#7a7670', pat: 'plates', s: 1.2, cut: '#4a3a32' }),
  slabCut: mat({ c: '#b8b0a0', cut: '#5a4a40' }),
  bulkhead: mat({ c: '#a8a49a', c2: '#98948a', pat: 'rivets', s: 1.0, cut: '#3a302a' }),
  cunardRed: mat({ c: '#cc4a22', c2: '#b8401c', pat: 'rivets', s: 1.6, cut: '#8a2a12' }),
  funnelBlack: mat({ c: '#24201e', c2: '#2e2a28', pat: 'rivets', s: 1.6, cut: '#141210' }),
  soot: mat({ c: '#2a2624', c2: '#1e1a18', pat: 'speckle', cut: '#141210' }),
  mast: mat({ c: '#d8b880', c2: '#c8a870', cut: '#8a6a40' }),
  steelGrey: mat({ c: '#7a8088', c2: '#6a7078', cut: '#3a3e44' }),
  machGrey: mat({ c: '#7e848a', c2: '#6c7278', pat: 'plates', s: 0.8, cut: '#3a3e44' }),
  darkGrey: mat({ c: '#4a4e54', c2: '#3a3e44', cut: '#22262a' }),
  silverPipe: mat({ c: '#c8ccd0', c2: '#a8acb0', cut: '#6a6e72' }),
  brass: mat({ c: '#c8a050', c2: '#a88040', cut: '#7a5a2a' }),
  bronze: mat({ c: '#b8864a', c2: '#9a6a34', cut: '#6a4a24' }),
  rail: mat({ c: '#f2ece0', cut: '#a8a090' }),
  darkRail: mat({ c: '#3a3634', cut: '#2a2624' }),
  boatCover: mat({ c: '#c8b08a', c2: '#b8a07a', pat: 'canvas', s: 0.8, cut: '#8a7a5a' }),
  boatHull: mat({ c: '#f2ece0', c2: '#e2dccc', pat: 'planks', s: 0.25, cut: '#a89a84' }),
  water: mat({ c: '#3a7a8a', c2: '#5a9aaa', cut: '#2a5a6a' }),
  glassDay: mat({ c: '#a8c4d0', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.6, cut: '#6a7a80' }),
  porthole: mat({ c: '#9ab4c4', c2: '#ffd890', glow: 'night', cut: '#6a7a80' }),
};

// A deck slab following the hull: top at y, from the centreline cut to the inner plating.
// The slab starts at z = -0.45 so the cut plane shows its hatched section.
export function slab(k, x0, x1, y, m, opt = {}) {
  const th = opt.th || SLAB, zIn = opt.zIn != null ? opt.zIn : -0.45;
  const n = Math.max(1, Math.ceil((x1 - x0) / (opt.step || 6)));
  const secs = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const zt = opt.zOut != null ? opt.zOut : Math.max(0.3, inner(x, y) + 0.2);
    const zb = opt.zOut != null ? opt.zOut : Math.max(0.3, inner(x, y - th) + 0.2);
    secs.push({ x, pts: [[zIn, y - th], [zb, y - th], [zt, y], [zIn, y]] });
  }
  k.loft(secs, m, { matFn: (s, i) => (i === 2 ? (opt.top || m) : i === 0 ? (opt.under || M.slabCut) : m) });
}
