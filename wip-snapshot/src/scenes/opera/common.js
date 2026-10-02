/* The Opera: shared constants, materials and small helpers.
 *
 * All figures in metres, from docs/research/opera.md (section 2 and the zone table).
 * x runs north along the building's axis from the main facade (x = 0), y is height above
 * the pavement of the Place de l'Opera, z is depth behind the cut (the axis), westward.
 */
import { mat, shade } from '../../engine/index.js';

// ------------------------------------------------------------------ levels (dossier 2, derived)
export const Y = {
  place: 0, vest: 1.6, ctrl: 3.2, rot: 0.3, cellar: -6,
  loggia: 12, loggiaTop: 23, foyer: 12, foyerVault: 30, facadeTop: 32.12,
  stairTop: 30, lantern: 34,
  pit: 6.5, stalls0: 8.7, stalls1: 7.0,
  ceil: 28, flies: 29, gril: [46, 49.5, 53], roof: 50, ridge: 56, apollo: 63.5,
  under: [5.6, 2.7, -0.2, -3.3, -6.5], cistern: -10.13, water: -8.8, wells: -18,
  back: 9.7, extras: 6.5, chorus: 0.5, costume: 20, workshop: 25.6, backRoof: 31.5,
  court: 2.0,
};
// Box tiers: floor heights of baignoires, premieres, deuxiemes, troisiemes, quatriemes, cinquiemes.
export const TIERS = [8.0, 11.5, 15.0, 18.5, 22.0, 25.0];
export const TIER_NAMES = ['Baignoires', 'Premieres loges', 'Deuxiemes loges', 'Troisiemes loges', 'Quatriemes loges', 'Cinquiemes loges'];

// The auditorium horseshoe: a semicircle about (AX, 0) and straight sides to the proscenium.
export const AX = 71.5;
export const R1 = 11;    // box fronts
export const R2 = 15;    // box backs
export const R3 = 20.5;  // outer face of the box corridors
export const R4 = 21.5;  // outer wall
export const PROS = 86.5; // house face of the proscenium wall
export const ST0 = 88.5, ST1 = 115; // stage, front to back wall
export const SZ = 26.5;  // half width of the stage house inside
export const stageY = (x) => 8.5 + Math.max(0, Math.min(ST1, x) - ST0) * 0.045; // raked "almost 5 cm per metre"
export const stallsY = (x) => Y.stalls0 + (Y.stalls1 - Y.stalls0) * Math.max(0, Math.min(1, (x - 60.5) / 19.5));

// Block depths (far walls), metres behind the axis.
export const D = { front: 33, foyerEnd: 27, stair: 16, back: 12, admin: 20, court: 14 };

// ------------------------------------------------------------------ materials
const M = (c, o) => mat(Object.assign({ c }, o || {}));
export const MT = {
  stone: M('#e4d6ac', { c2: '#cfbd8e', pat: 'ashlar', s: 0.75, cut: '#bba878', cutPat: true }),
  stoneP: M('#e8dbb4', { c2: '#d6c69a', pat: 'speckle', cut: '#bba878' }),
  stoneD: M('#cbb98c', { c2: '#b8a678', pat: 'speckle', cut: '#a8946a' }),
  rubble: M('#9a8a72', { c2: '#7a6a56', pat: 'stone', s: 0.6, cut: '#7a6c58', cutPat: true }),
  concrete: M('#a49c8c', { c2: '#8c8474', pat: 'speckle', cut: '#8a8272' }),
  earth: M('#7c6650', { c2: '#68543e', pat: 'rock', s: 1.2, cut: '#6a5440', cutPat: true }),
  paving: M('#aaa496', { c2: '#928c80', pat: 'stone', s: 1.1, cut: '#7e786c' }),
  asphalt: M('#8e8a82', { c2: '#7a766e', pat: 'speckle', cut: '#6e6a62' }),
  brick: M('#9a5440', { c2: '#7a3e2e', pat: 'brick', s: 0.075, cut: '#6e3426', cutPat: true }),
  brickD: M('#6e3e30', { c2: '#58301f', pat: 'brick', s: 0.075, cut: '#4e2a1e', cutPat: true }),
  marbleW: M('#f0eadc', { c2: '#ddd4c2', pat: 'speckle', cut: '#c8bea8' }),
  marbleR: M('#a85848', { c2: '#d4a28c', pat: 'stone', s: 0.5, cut: '#7a3a30' }),
  marbleRed: M('#8e2e2a', { c2: '#b85a48', pat: 'speckle', cut: '#5e1e1a' }),
  marbleG: M('#4c7a5c', { c2: '#6e9a7a', pat: 'speckle', cut: '#335640' }),
  marbleY: M('#d8b46a', { c2: '#e8cc8a', pat: 'speckle', cut: '#a8864a' }),
  onyx: M('#d6ae6a', { c2: '#ecd09a', pat: 'grain', cut: '#a8844a' }),
  gilt: M('#d2aa4c', { c2: '#ecd27a', pat: 'speckle', cut: '#9a7a2e' }),
  giltD: M('#b08a3a', { c2: '#d0aa58', pat: 'speckle', cut: '#7a5e24' }),
  oldGold: M('#bca064', { c2: '#d4bc84', pat: 'panels', s: 1.6, cut: '#8a7244' }),
  bronze: M('#5e4a32', { c2: '#7a6444', pat: 'speckle', cut: '#3e3020' }),
  bronzeG: M('#4e5a46', { c2: '#6a7a5c', pat: 'speckle', cut: '#323a2c' }),
  velvet: M('#9a2028', { c2: '#7a161c', pat: 'carpet', s: 0.4, cut: '#5a1014' }),
  velvetD: M('#7a181e', { c2: '#5e1016', pat: 'quilt', s: 0.3, cut: '#4a0c10' }),
  damask: M('#a8303a', { c2: '#c04a4a', pat: 'panels', s: 0.6, cut: '#5a1014' }),
  boxFront: M('#c69a48', { c2: '#e4c070', pat: 'panels', s: 0.55, cut: '#8a6a2a' }),
  mahogany: M('#6a3020', { c2: '#542416', pat: 'panels', s: 0.45, cut: '#401a10' }),
  mosaic: M('#c8b088', { c2: '#9a6a44', pat: 'tiles', s: 0.25, cut: '#8a7458' }),
  mosaicGold: M('#c8a24a', { c2: '#e4c878', pat: 'tiles', s: 0.12, cut: '#8a6a2a' }),
  parquet: M('#a2703e', { c2: '#82562c', pat: 'planks', s: 0.12, cut: '#6a4424' }),
  oak: M('#b0905e', { c2: '#94744a', pat: 'planks', s: 0.18, cut: '#7a5e3a', cutPat: true }),
  oakWorn: M('#a68a62', { c2: '#8a7050', pat: 'deck', s: 0.2, cut: '#6e5638', cutPat: true }),
  timber: M('#9a7a4e', { c2: '#7a5e3a', pat: 'grain', cut: '#6a4e2e' }),
  pine: M('#c8a876', { c2: '#b08e5e', pat: 'planks', s: 0.15, cut: '#8a6e48' }),
  iron: M('#6a7078', { c2: '#565c64', pat: 'rivets', s: 0.4, cut: '#3a3e44' }),
  ironD: M('#4a4e54', { c2: '#3a3e44', cut: '#26282c' }),
  ironGrey: M('#7e848a', { c2: '#6a7076', pat: 'plates', s: 0.8, cut: '#444a50' }),
  grate: M('#7a6a52', { c2: '#4a3e30', pat: 'grate', s: 0.3, cut: '#4a3e2e' }),
  plaster: M('#ebdfc6', { c2: '#ddd0b4', pat: 'speckle', cut: '#b8aa90' }),
  plasterW: M('#f2ead8', { c2: '#e4dac6', pat: 'speckle', cut: '#bcb098' }),
  plasterBare: M('#d8cdb6', { c2: '#c4b89e', pat: 'speckle', cut: '#a89c84' }),
  paint: M('#e6dcc4', { c2: '#d4c8ac', pat: 'panels', s: 1.2, cut: '#b0a48a' }),
  copper: M('#7e5c40', { c2: '#5e8a70', pat: 'plates', s: 1.4, cut: '#4e3a28' }),
  zinc: M('#7c8288', { c2: '#686e74', pat: 'plates', s: 1.0, cut: '#4e5258' }),
  slate: M('#5e646c', { c2: '#4e545a', pat: 'slates', s: 0.4, cut: '#3e4248' }),
  canvas: M('#dccfae', { c2: '#c8b994', pat: 'canvas', s: 0.5, cut: '#a8987a' }),
  hemp: M('#b89a64', { c2: '#9a7e4e', cut: '#7a6038' }),
  water: M('#1e3440', { c2: '#2e4e5a', pat: 'rings', s: 0.9, cut: '#14242c' }),
  coal: M('#26241f', { c2: '#3a3832', pat: 'rock', s: 0.25 }),
  glassSky: M('#a8c4cc', { c2: '#ffd890', pat: 'panes', s: 0.8, glow: 'night', cut: '#5a6a70' }),
  mirror: M('#b8c8cc', { c2: '#ffe0a0', pat: 'panes', s: 1.8, glow: 'night', cut: '#6a7a80' }),
  ceilingSky: M('#8eaec4', { c2: '#c6d6de', pat: 'speckle', cut: '#5e7a8a' }),
  black: M('#22201e'),
  cream: M('#f2ece0'),
};

// A lit window that glows at night.
export const WIN = M('#a8bcc4', { c2: '#ffd48a', pat: 'panes', s: 0.45, glow: 'night', cut: '#5a6a70' });
export const WINS = M('#b0c4cc', { c2: '#ffd890', pat: 'panes', s: 0.3, glow: 'night', cut: '#5a6a70' });


// ------------------------------------------------------------------ helpers
export const TAU = Math.PI * 2;
// A point on the horseshoe at radius r and angle a (PI = the back of the house on the axis, PI/2 = straight across).
export const ring = (a, r, y) => [AX + Math.cos(a) * r, y, Math.sin(a) * r];
export { shade };

// Ordered list of the acts tonight (dossier 4.3, act clock [illustrative]).
export const ACTS = [
  { n: 1, name: 'Act 1: Faust in his study', h0: 19.5, h1: 19.917, set: 'study' },
  { n: 2, name: 'Act 2: the fair and the waltz', h0: 20.167, h1: 20.667, set: 'fair' },
  { n: 3, name: 'Act 3: Marguerite’s garden', h0: 20.917, h1: 21.75, set: 'garden' },
  { n: 4, name: 'Act 4: the church and the soldiers', h0: 22.0, h1: 22.667, set: 'church' },
  { n: 5, name: 'Act 5: Walpurgis Night', h0: 22.917, h1: 23.75, set: 'walpurgis' },
];
// Show state for an hour: { phase: 'day'|'doors'|'act'|'interval'|'out'|'night', act }.
export function showAt(h) {
  if (h >= 4 && h < 18.75) return { phase: 'day', act: null };
  if (h >= 18.75 && h < ACTS[0].h0) return { phase: 'doors', act: null };
  for (let i = 0; i < ACTS.length; i++) {
    const A = ACTS[i];
    if (h >= A.h0 && h < A.h1) return { phase: 'act', act: A };
    const nx = ACTS[i + 1];
    if (nx && h >= A.h1 && h < nx.h0) return { phase: 'interval', act: A, next: nx };
  }
  if (h >= ACTS[4].h1 || h < 0.5) return { phase: 'out', act: null };
  return { phase: 'night', act: null };
}
// Inside an hour window that may wrap midnight.
export const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
