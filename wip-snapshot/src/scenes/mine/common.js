/* Big Pit colliery, Blaenavon, 1910: shared constants, materials and small helpers.
 *
 * Coordinates follow the research dossier (docs/research/mine.md): x is metres from the
 * left edge of the panorama, y is metres above the collar of the Big Pit shaft (y = 0),
 * so the workings are at about y = -89. z is depth behind the cut plane.
 */
import { XS, mat, shade } from '../../engine/index.js';

export const PB = -89;           // pit bottom and Old Coal seam floor
export const SX = 150;           // Big Pit shaft centreline
export const SHAFT = { x0: 147.25, x1: 152.75, rz: 2.0, sump: -96 };
export const BANK = 6.0;         // banking (landing) deck height [illustrative]
export const SHEAVE = { y: 15.0, r: 1.8 };  // sheave centre height and radius [illustrative]
export const CAGE = { ax: 148.75, bx: 151.25, w: 2.1, h: 2.5 }; // cage compartments, side by side
export const FAULT = { x0: 239, x1: 249, throw: 30 };  // fault zone and throw [illustrative]
export const ZR = 20;            // depth of the cut block of ground; the hillside continues behind
export const X0 = -34, X1 = 440; // ends of the section block

// Ground surface along the cut (top of the soil band).
export function ground(x) {
  if (x < -6) return 0.3;
  if (x < 330) return 0;
  if (x < 352) return ((x - 330) / 22) * 1.6;
  return 1.6 + Math.pow((x - 352) / 88, 1.25) * 24;
}

// Fault offset: the strata step down by FAULT.throw across the fault zone, with drag.
export function faultOff(x) {
  if (x <= FAULT.x0) return 0;
  if (x >= FAULT.x1) return FAULT.throw;
  const t = (x - FAULT.x0) / (FAULT.x1 - FAULT.x0);
  return FAULT.throw * (t * t * (3 - 2 * t));
}

const M = (spec) => mat(spec);
// Materials. Watercolour tones, warm and never pure black or white.
export const MAT = {
  // geology: c is the colour of a tunnel wall cut into the band, cut is the section colour
  soil: M({ c: '#4e463c', c2: '#3a342e', pat: 'speckle', cut: '#8a6a48' }),
  soilMoor: M({ c: '#7a6a42', c2: '#8a4a26', pat: 'speckle', cut: '#8a6a48' }),
  soilGrass: M({ c: '#7a8450', c2: '#5e6a3a', pat: 'speckle', cut: '#8a6a48' }),
  soilTip: M({ c: '#3e3c3c', c2: '#5a4a40', pat: 'speckle', cut: '#8a6a48' }),
  mud: M({ c: '#5a5c5e', c2: '#686a6e', pat: 'rings', s: 0.55, cut: '#74787c', cutPat: true }),
  mud2: M({ c: '#5e5c58', c2: '#6c6a66', pat: 'rings', s: 0.75, cut: '#82807a', cutPat: true }),
  silt: M({ c: '#6e695e', c2: '#7e786c', pat: 'rings', s: 0.9, cut: '#9c9486', cutPat: true }),
  sand: M({ c: '#9a8c6c', c2: '#7e7258', pat: 'stone', s: 0.9, cut: '#c9b48a', cutPat: true }),
  sandBase: M({ c: '#a49a80', c2: '#8a806a', pat: 'stone', s: 1.1, cut: '#cfc5aa', cutPat: true }),
  thinCoal: M({ c: '#2a2826', c2: '#3a3836', pat: 'rock', cut: '#2c2a2a' }),
  ironstone: M({ c: '#5a5650', c2: '#8a5634', pat: 'speckle', cut: '#6e6a63', cutPat: true }),
  roofShale: M({ c: '#4e4c4a', c2: '#8a8e90', pat: 'rock', cut: '#5c5a58' }),
  coal: M({ c: '#232120', c2: '#4a4a52', pat: 'rings', s: 0.12, cut: '#1f1d1d', cutPat: true }),
  seatearth: M({ c: '#a8a088', c2: '#8a826a', pat: 'speckle', cut: '#c8c0aa' }),
  lower: M({ c: '#5a5852', c2: '#686660', pat: 'rings', s: 0.6, cut: '#72716c', cutPat: true }),
  lower2: M({ c: '#66625a', c2: '#757068', pat: 'rings', s: 0.8, cut: '#8c877c', cutPat: true }),
  breccia: M({ c: '#6a645a', c2: '#8a8476', pat: 'rock', cut: '#7a7466', cutPat: true }),
  // works
  brick: M({ c: '#a8563a', c2: '#8a4630', pat: 'brick', cut: '#8a4a34', cutPat: true }),
  brickDark: M({ c: '#7a4632', c2: '#5e3628', pat: 'brick', cut: '#6a3a2a', cutPat: true }),
  whiteBrick: M({ c: '#e2dccb', c2: '#cfc7b2', pat: 'brick', cut: '#a8563a' }),
  whitewash: M({ c: '#e6e0cf', c2: '#d4ccb6', pat: 'speckle', cut: '#9a8e78' }),
  stone: M({ c: '#9a9282', c2: '#857d6e', pat: 'stone', s: 0.38, cut: '#8a8272', cutPat: true }),
  dressed: M({ c: '#b4aa96', c2: '#9c9280', pat: 'ashlar', s: 0.45, cut: '#9a907e', cutPat: true }),
  rubble: M({ c: '#d8d0bc', c2: '#bfb6a0', pat: 'stone', s: 0.3, cut: '#8e8676', cutPat: true }),
  slate: M({ c: '#4e5560', c2: '#3e444e', pat: 'slates', s: 0.24, cut: '#3a3f48' }),
  slateWet: M({ c: '#5a6270', c2: '#454c58', pat: 'slates', s: 0.24, cut: '#3a3f48' }),
  corr: M({ c: '#7a7a74', c2: '#6a6a64', pat: 'corrugated', s: 0.07, cut: '#4a4a46' }),
  corrRust: M({ c: '#8a6a52', c2: '#6e5240', pat: 'corrugated', s: 0.07, cut: '#4a3a30' }),
  timber: M({ c: '#7a5636', c2: '#5e4028', pat: 'grain', cut: '#b08a5a' }),
  tarred: M({ c: '#4a3a2c', c2: '#3a2e24', pat: 'grain', cut: '#9a7448' }),
  prop: M({ c: '#c8a86a', c2: '#a88a52', pat: 'grain', cut: '#d8bc84' }),
  propOld: M({ c: '#8a8070', c2: '#6a6256', pat: 'grain', cut: '#9a9080' }),
  planks: M({ c: '#8a6a48', c2: '#6e5236', pat: 'planks', s: 0.22, cut: '#b08a5a' }),
  deck: M({ c: '#8a7c66', c2: '#6e6250', pat: 'deck', s: 0.24, cut: '#a88a5c' }),
  iron: M({ c: '#4e5258', c2: '#3e4248', cut: '#2e3034' }),
  ironDark: M({ c: '#2e3034', c2: '#24262a', cut: '#1e2024' }),
  ironRed: M({ c: '#8a3a2a', c2: '#6a2a20', cut: '#4a2018' }),
  plate: M({ c: '#3a3e44', c2: '#2e3238', pat: 'plates', s: 0.5, cut: '#22262a' }),
  rail: M({ c: '#6a6a6e', cut: '#3a3a3e' }),
  brass: M({ c: '#c8a050', c2: '#a88038', cut: '#8a6a30' }),
  green: M({ c: '#4a6a4a', c2: '#3a5a3a', cut: '#2a3a2a' }),
  greenLight: M({ c: '#5e7e58', c2: '#4a6a46', cut: '#2a3a2a' }),
  boiler: M({ c: '#9a968c', c2: '#7e7a72', pat: 'canvas', s: 0.7, cut: '#5a5650' }),
  sooty: M({ c: '#3a3634', c2: '#2a2826', pat: 'speckle', cut: '#2a2624' }),
  coalHeap: M({ c: '#2a2828', c2: '#4a4a50', pat: 'rock', cut: '#1e1c1c' }),
  shale: M({ c: '#4a4a4e', c2: '#6a5e54', pat: 'rock', cut: '#5a5656' }),
  water: M({ c: '#1e2a30', c2: '#3a5058', cut: '#1a2228' }),
  hay: M({ c: '#c8aa5a', c2: '#a88a42', pat: 'thatch', cut: '#a88a42' }),
  bracken: M({ c: '#9a5a2a', c2: '#7a4420', pat: 'thatch', cut: '#7a4420' }),
  straw: M({ c: '#b89a58', c2: '#9a7e44', pat: 'thatch', cut: '#9a7e44' }),
  canvas: M({ c: '#7a6a4a', c2: '#6a5a3a', pat: 'canvas', cut: '#5a4a32' }),
  brattice: M({ c: '#3a3028', c2: '#2a221c', pat: 'canvas', s: 0.5, cut: '#2a221c' }),
  glassWin: M({ c: '#8aa0aa', c2: '#ffcf80', glow: 'night', pat: 'panes', s: 0.32 }),
  glassWinWide: M({ c: '#8aa0aa', c2: '#ffcf80', glow: 'night', pat: 'panes', s: 0.45 }),
  paint: M({ c: '#e8e0cc', cut: '#a89a80' }),
  paintBrown: M({ c: '#6a4a30', c2: '#5a3e28', pat: 'planks', s: 0.18, cut: '#9a7448' }),
  red: M({ c: '#9a3a2a', cut: '#6a2a20' }),
  rope: M({ c: '#2e3034', c2: '#4a4e54', cut: '#1e2024' }),
  cream: M({ c: '#e8dcc0', c2: '#d8ccb0', cut: '#a89a80' }),
  white: M({ c: '#f2ece0', cut: '#b8b0a0' }),
  black: M({ c: '#24221f', cut: '#1a1816' }),
  lampBrass: M({ c: '#d0a850', c2: '#ffd070', glow: 'always' }),
  fire: M({ c: '#ff9a40', c2: '#ffb050', glow: 'always', noEdge: true }),
  bulb: M({ c: '#fff0c0', c2: '#fff6d8', glow: 'always', noEdge: true }),
};

// Band table (left of the fault; the right side drops by FAULT.throw). Tops in metres.
// Each band runs from its top down to the next band's top. 'n' adds a gentle waver.
export const BANDS = [
  { id: 'G01', top: null, m: MAT.soil, n: 0 },
  { id: 'G02a', top: -5, m: MAT.mud, n: 0.6 },
  { id: 'G02b', top: -11.5, m: MAT.thinCoal, n: 0.6 },
  { id: 'G02c', top: -11.9, m: MAT.silt, n: 0.6 },
  { id: 'G02d', top: -19, m: MAT.sand, n: 0.5 },
  { id: 'G02e', top: -27, m: MAT.mud2, n: 0.5 },
  { id: 'G02f', top: -34.5, m: MAT.thinCoal, n: 0.5 },
  { id: 'G02g', top: -34.9, m: MAT.silt, n: 0.4 },
  { id: 'G02h', top: -43, m: MAT.mud, n: 0.4 },
  { id: 'G02i', top: -48.6, m: MAT.thinCoal, n: 0.3 },
  { id: 'G02j', top: -49.1, m: MAT.mud2, n: 0.3 },
  { id: 'G03', top: -59.5, m: MAT.thinCoal, n: 0 },
  { id: 'G03b', top: -61, m: MAT.mud, n: 0 },
  { id: 'G04', top: -64, m: MAT.sand, n: 0 },
  { id: 'G05', top: -72, m: MAT.ironstone, n: 0 },
  { id: 'G06', top: -86, m: MAT.roofShale, n: 0 },
  { id: 'G07', top: -88, m: MAT.coal, n: 0 },
  { id: 'G08', top: -89, m: MAT.seatearth, n: 0 },
  { id: 'G09a', top: -92, m: MAT.lower, n: 0 },
  { id: 'G09b', top: -101, m: MAT.thinCoal, n: 0 },
  { id: 'G09c', top: -101.6, m: MAT.lower2, n: 0 },
  { id: 'G09d', top: -110, m: MAT.sand, n: 0 },
  { id: 'G09e', top: -115.5, m: MAT.lower, n: 0 },
  { id: 'G10', top: -125, m: MAT.sandBase, n: 0 },
];
export const BOTTOM = -142;

// Boundary k (top of band k), at x. k = 0 is the ground; k = BANDS.length is the base.
export function boundary(k, x) {
  if (k === 0) return ground(x);
  if (k >= BANDS.length) return BOTTOM;
  const B = BANDS[k];
  const wav = B.n ? (XS.noise1(x * 0.018, k * 7.3) - 0.5) * 2 * B.n + (XS.noise1(x * 0.06, k * 3.1) - 0.5) * B.n * 0.6 : 0;
  // Bands near the surface do not feel the fault.
  return Math.max(BOTTOM, B.top + wav - faultOff(x) * Math.min(1, Math.max(0, (-B.top - 5) / 8)));
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export { shade };

// ------------------------------------------------------------------ building helpers
// A building cut open along its ridge: the ridge runs along x exactly at the cut (z = 0), so
// the far roof slope stays and the room beneath shows through the open front.
//   o: { x0, x1, y0 (floor), eaves, ridge, zb (inside depth), t (wall), wall, inner, roof, floor,
//        left/right: false to omit a gable, hip: true for a hipped far slope }
export function shed(k, o) {
  const t = o.t || 0.45, y0 = o.y0 || 0, zb = o.zb || 5, ov = o.over != null ? o.over : 0.45;
  const wall = o.wall || MAT.stone, inner = o.inner || wall, roof = o.roof || MAT.slate;
  if (o.floor !== false) k.box(o.x0 - t, y0 - 0.25, -1, o.x1 + t, y0, zb + t, o.floor || MAT.planks);
  // Back wall: interior face in the inner material, a band of the outer material on top.
  k.box(o.x0, y0, zb, o.x1, o.eaves, zb + t, inner, { shadeBot: 0.78 });
  const gable = (xa, xb) => k.extrudeX([[-1, y0], [zb + t, y0], [zb + t, o.eaves], [0, o.ridge], [-1, o.ridge - (o.ridge - o.eaves) / zb]].map(([z, y]) => [z, y]), xa, xb, wall);
  if (o.left !== false) gable(o.x0 - t, o.x0);
  if (o.right !== false) gable(o.x1, o.x1 + t);
  // Roof slab from the ridge to the back eaves.
  const rt = 0.22, s = (o.ridge - o.eaves) / zb;
  const za = -0.5, zc = zb + t + ov;
  k.extrudeX([[za, o.ridge + 0.05 - za * s], [zc, o.ridge + 0.05 - zc * s], [zc, o.ridge + 0.05 - zc * s + rt], [za, o.ridge + 0.05 - za * s + rt]], o.x0 - t - (o.oe != null ? o.oe : 0.3), o.x1 + t + (o.oe != null ? o.oe : 0.3), roof);
  // Rafters and tie beams every few metres.
  if (o.trusses !== false) {
    const step = o.truss || 3.6;
    for (let x = o.x0 + step * 0.5; x < o.x1 - 0.5; x += step) {
      k.beam([x, o.eaves, zb], [x, o.ridge - 0.05, 0.02], 0.16, MAT.timber);
      k.box(x - 0.08, o.eaves - 0.1, 0.02, x + 0.08, o.eaves + 0.08, zb, MAT.timber);
      k.beam([x, o.eaves, zb * 0.5], [x, o.ridge - 0.1 - (o.ridge - o.eaves) * 0.5 * 0, 0.02], 0.1, MAT.timber);
    }
  }
  return { zb, t, y0 };
}

// Windows in a back wall: glazing that glows at night, with a stone sill.
export function windows(k, xs, y, zb, w, h, glass) {
  for (const x of xs) {
    k.box(x - w / 2, y, zb - 0.03, x + w / 2, y + h, zb + 0.02, glass || MAT.glassWin);
    k.box(x - w / 2 - 0.08, y - 0.1, zb - 0.12, x + w / 2 + 0.08, y, zb + 0.02, MAT.dressed);
  }
}

// An elliptical shell about a vertical axis (the shaft lining), angles a0..a1 (0 = +x, PI/2 = away).
export function ellipseShell(k, cx, rx, rz, t, y0, y1, a0, a1, m, seg = 20) {
  const P = (a, r, y) => [cx + Math.cos(a) * (rx + r), y, Math.sin(a) * (rz + r)];
  for (let i = 0; i < seg; i++) {
    const a = a0 + ((a1 - a0) * i) / seg, b = a0 + ((a1 - a0) * (i + 1)) / seg;
    k.quad(P(a, 0, y0), P(b, 0, y0), P(b, 0, y1), P(a, 0, y1), m); // inner (faces the axis)
    k.quad(P(b, t, y0), P(a, t, y0), P(a, t, y1), P(b, t, y1), m); // outer
    k.quad(P(a, 0, y1), P(b, 0, y1), P(b, t, y1), P(a, t, y1), m); // top
    k.quad(P(b, 0, y0), P(a, 0, y0), P(a, t, y0), P(b, t, y0), m); // bottom
  }
  k.quad(P(a0, t, y0), P(a0, 0, y0), P(a0, 0, y1), P(a0, t, y1), m);
  k.quad(P(a1, 0, y0), P(a1, t, y0), P(a1, t, y1), P(a1, 0, y1), m);
}
