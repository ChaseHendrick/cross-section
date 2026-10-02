/* The Car Factory: shared constants, materials and drawing helpers.
 * See the layout plan at the top of src/scenes/factory.js.
 */
import { mat, shade } from '../../engine/index.js';

// Segment boundaries along x (metres). West (Woodward Avenue) on the left.
export const X = {
  WOOD: 2, P0: 8, P1: 36, F0: 36, F1: 106, T0: 106, T1: 116, M0: 116, M1: 196,
  CW0: 139, CW1: 151, H0: 196, H1: 298, J0: 298, J1: 330, N0: 330, N1: 400, R1: 412,
};

// Building H: four storeys (floor heights illustrative, dossier 3.3), 6.1 m column grid.
export const H = {
  y: [0, 4.2, 8.4, 12.6], roof: 16.8, parapet: 18.4,
  zS: -1.0, zN: 20.86, rows: [0, 6.1, 12.2, 18.3],
  lines: [3.05, 9.15, 15.25], colX: [],
};
for (let x = 199.0; x < X.H1 - 2; x += 6.1) H.colX.push(+x.toFixed(2));

// The new south building (six storeys, S1 p.391), its craneway and the north building.
export const N = {
  y: [0, 4.37, 8.03, 11.69, 15.35, 19.01], roof: 22.67, parapet: 23.5,
  zS: -6.1, zW: 12.2, cw0: 12.2, cw1: 24.4, nb1: 42.7, track: -1.07,
  craneRail: 23.33, peak: 27.1, colX: [],
};
for (let x = 333.05; x < X.N1 - 2; x += 6.1) N.colX.push(+x.toFixed(2));

// One-storey saw-tooth shops: teeth 8 m deep, glazing facing north (+z).
export const SAW = { F: { eave: 7, ridge: 10.5, z0: -2, z1: 22 }, M: { eave: 6, ridge: 9, z0: -2, z1: 22 } };

// Power house.
export const P = { hall: 11, base: -4.5, zN: 20, chimneyZ: 24 };

// Chassis line geometry: chain speed and pitch (dossier section 6: about 2 m/min, 4 m apart).
export const LINE = { x0: 204, x1: 273, rail: 0.68, pitch: 4.0, speed: 2.0 / 60 };
export const PERIOD = LINE.pitch / LINE.speed; // 120 s per chassis

// ------------------------------------------------------------------ materials
export const M = {
  concrete: mat({ c: '#c9c3b5', c2: '#b4ad9e', pat: 'speckle', cut: '#9a9282' }),
  concreteDk: mat({ c: '#b2ab9c', c2: '#9c9586', pat: 'speckle', cut: '#8e8676' }),
  slab: mat({ c: '#bdb6a6', c2: '#a8a090', pat: 'speckle', cut: '#8a8272' }),
  brick: mat({ c: '#9a4a36', c2: '#7e3a2a', pat: 'brick', s: 1, cut: '#7a3a2a', cutPat: true }),
  brickDk: mat({ c: '#84402e', c2: '#6a3224', pat: 'brick', s: 1, cut: '#6a3224', cutPat: true }),
  whitewash: mat({ c: '#ece6d8', c2: '#ddd6c6', pat: 'speckle', cut: '#9a9282' }),
  dado: mat({ c: '#6c6a62', c2: '#5e5c55', cut: '#8a8272' }),
  sash: mat({ c: '#a9bcc4', c2: '#d6e2e6', pat: 'panes', s: 0.42, cut: '#3a3d3a' }),
  sashGlow: mat({ c: '#9fb4bc', c2: '#ffd890', pat: 'panes', s: 0.42, glow: 'night', cut: '#3a3d3a' }),
  sashBlue: mat({ c: '#9fb4bc', c2: '#cfe6ff', pat: 'panes', s: 0.5, glow: 'night', cut: '#3a3d3a' }),
  steel: mat({ c: '#5a5e62', c2: '#4a4e52', cut: '#2a2c2e' }),
  steelDk: mat({ c: '#3a3d40', c2: '#2e3134', cut: '#1e2022' }),
  iron: mat({ c: '#2e2c2a', c2: '#3c3a36', cut: '#1a1918' }),
  castIron: mat({ c: '#4e5054', c2: '#5e6064', pat: 'speckle', cut: '#2a2b2d' }),
  machine: mat({ c: '#5c6460', c2: '#4c5450', cut: '#2e3230' }),
  machineLt: mat({ c: '#7a8282', c2: '#6a7272', cut: '#3a4040' }),
  bright: mat({ c: '#c4c8cc', c2: '#a8acb0', cut: '#7a7e82' }),
  brass: mat({ c: '#c8a050', c2: '#a88038', cut: '#8a6a2a' }),
  black: mat({ c: '#22201e', c2: '#2c2a28', cut: '#141312' }),
  enamel: mat({ c: '#1a1a1e', c2: '#3a3a44', cut: '#0e0e10' }),
  wood: mat({ c: '#b08a5a', c2: '#9a7448', pat: 'grain', cut: '#7a5a38' }),
  woodDk: mat({ c: '#7a5232', c2: '#6a4428', pat: 'grain', cut: '#4a3220' }),
  planks: mat({ c: '#9a7e5a', c2: '#86684a', pat: 'planks', s: 0.6, cut: '#6a4e30' }),
  floorH: mat({ c: '#8a7a64', c2: '#766852', pat: 'speckle', cut: '#8a8272' }),
  dirt: mat({ c: '#7e705c', c2: '#6a5e4c', pat: 'speckle', cut: '#4a4036' }),
  sand: mat({ c: '#b89a6a', c2: '#a08458', pat: 'speckle', cut: '#8a7048' }),
  brickFloor: mat({ c: '#8a4a3a', c2: '#74402e', pat: 'brick', s: 1.4, cut: '#6a3a2a' }),
  paving: mat({ c: '#7a5e4e', c2: '#6a5042', pat: 'speckle', cut: '#5a4236' }),
  asphalt: mat({ c: '#5a5652', c2: '#4e4a46', pat: 'speckle', cut: '#3a3734' }),
  kerb: mat({ c: '#a8a296', c2: '#948e82', pat: 'ashlar', s: 0.3, cut: '#7a7468' }),
  loam: mat({ c: '#7a6448', c2: '#6a5640', pat: 'speckle', cut: '#8a6a44', cutPat: true }),
  clay: mat({ c: '#6a6a68', c2: '#5e605e', pat: 'speckle', cut: '#76726c', cutPat: true }),
  cinders: mat({ c: '#5e5a54', c2: '#4e4a44', pat: 'speckle', cut: '#3e3a34' }),
  grass: mat({ c: '#6a7048', c2: '#5a6040', pat: 'speckle', cut: '#4a4a34' }),
  roof: mat({ c: '#7a766e', c2: '#6a665e', pat: 'speckle', cut: '#4a4844' }),
  tar: mat({ c: '#3e3c3a', c2: '#4e4c48', pat: 'speckle', cut: '#2a2826' }),
  coke: mat({ c: '#2a2826', c2: '#3a3836', pat: 'rock', cut: '#1a1918' }),
  pig: mat({ c: '#6a6460', c2: '#7a726a', pat: 'speckle', cut: '#4a4440' }),
  glowIron: mat({ c: '#ff8a30', c2: '#ffb050', glow: 'always', noEdge: true, cut: '#ff9a40' }),
  glowFire: mat({ c: '#e86a28', c2: '#ffa040', glow: 'always', noEdge: true, cut: '#ff8a30' }),
  bulb: mat({ c: '#fff2c8', c2: '#fff6d8', glow: 'night', noEdge: true }),
  bulbBlue: mat({ c: '#e8f4ff', c2: '#d8ecff', glow: 'night', noEdge: true }),
  shadeW: mat({ c: '#eeeae0', c2: '#d8d4ca', cut: '#8a8680' }),
  marble: mat({ c: '#e8e2d6', c2: '#cfc8b8', pat: 'speckle', cut: '#a8a090' }),
  canvas: mat({ c: '#d8ccb0', c2: '#c4b898', pat: 'canvas', cut: '#9a8e74' }),
  leather: mat({ c: '#2a2422', c2: '#3a3230', pat: 'quilt', s: 0.16, cut: '#1a1614' }),
  rubber: mat({ c: '#5a5650', c2: '#4a4640', cut: '#3a3630' }),
  primer: mat({ c: '#7a4a2e', c2: '#6a3e26', cut: '#4a2a18' }),
  blueBlack: mat({ c: '#1e2230', c2: '#2a3040', cut: '#10121a' }),
  bareBody: mat({ c: '#8a8e90', c2: '#7a7e80', cut: '#5a5e60' }),
  lumber: mat({ c: '#c8a46e', c2: '#b08a58', pat: 'planks', s: 0.12, cut: '#9a7a4a' }),
  water: mat({ c: '#4a5a62', c2: '#5a6a72', cut: '#3a4a52' }),
  paper: mat({ c: '#f2ece0', c2: '#e2dccf', cut: '#c2bcaf' }),
  green: mat({ c: '#3e5a48', c2: '#344e3e', cut: '#22342a' }),
  red: mat({ c: '#a83a2a', c2: '#8a2e22', cut: '#6a2218' }),
};

// ------------------------------------------------------------------ helpers
// A factory reflector lamp hanging from a ceiling at yC (enamelled cone over a tungsten bulb).
export function reflector(k, x, yC, z, o = {}) {
  const drop = o.drop || 0.7, y = yC - drop;
  k.cyl(x, y, z, 0.01, drop, M.iron, { seg: 3, caps: false });
  k.cyl(x, y - 0.14, z, o.big ? 0.32 : 0.24, 0.14, M.shadeW, { r2: 0.05, seg: 7 });
  k.cyl(x, y - 0.2, z, 0.05, 0.08, o.blue ? M.bulbBlue : M.bulb, { seg: 5 });
  return k.lamp(x, y - 0.2, z, { r: (o.r || 5.5) * 1.15, i: (o.i != null ? o.i : 0.85) * 1.3, color: o.color || '#ffd890', bulb: false, halo: o.halo != null ? o.halo : 0.45 });
}

// A wall along x at depth z (thickness t) between y0 and y1, with glazed bays between piers.
// bays: list of [xa, xb] window spans; sill and head heights above y0. inner: face towards -z.
export function glazedWall(k, x0, x1, y0, y1, z, o = {}) {
  const t = o.t || 0.3, sill = o.sill != null ? o.sill : 0.9, head = o.head != null ? o.head : 0.45;
  const outer = o.outer || M.concrete, inner = o.inner || M.whitewash, glass = o.glass || M.sash;
  const fo = { front: inner, back: outer };
  const wy0 = y0 + sill, wy1 = y1 - head;
  if (sill > 0) k.box(x0, y0, z, x1, wy0, z + t, o.dado ? M.dado : outer, Object.assign({}, fo, o.dado ? { front: M.dado } : {}));
  if (head > 0) k.box(x0, wy1, z, x1, y1, z + t, outer, fo);
  const bays = o.bays || [];
  let cx = x0;
  for (const [a, b] of bays) {
    if (a > cx + 0.01) k.box(cx, wy0, z, a, wy1, z + t, o.pier || outer, Object.assign({}, fo, { front: o.pierIn || inner }));
    k.box(a, wy0, z + t * 0.35, b, wy1, z + t * 0.65, glass);
    cx = b;
  }
  if (x1 > cx + 0.01) k.box(cx, wy0, z, x1, wy1, z + t, o.pier || outer, Object.assign({}, fo, { front: o.pierIn || inner }));
}

// Regular window bays: every `pitch` metres, `w` wide, starting half a pier in.
export function bays(x0, x1, pitch, w, skip) {
  const out = [];
  const n = Math.max(1, Math.round((x1 - x0) / pitch));
  const p = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    if (skip && skip(i)) continue;
    const c = x0 + p * (i + 0.5);
    out.push([c - w / 2, c + w / 2]);
  }
  return out;
}

// A wall across the subject (constant x, spanning z), with window bays along z.
export function endWall(k, x, z0, z1, y0, y1, o = {}) {
  const t = o.t || 0.4, sill = o.sill != null ? o.sill : 0.9, head = o.head != null ? o.head : 0.5;
  const outer = o.outer || M.brick, inner = o.inner || M.whitewash, glass = o.glass || M.sashGlow;
  const side = o.facing === 'west' ? { left: outer, right: inner } : { left: inner, right: outer };
  const wy0 = y0 + sill, wy1 = y1 - head;
  k.box(x, y0, z0, x + t, wy0, z1, outer, side);
  k.box(x, wy1, z0, x + t, y1, z1, outer, side);
  let cz = z0;
  for (const [a, b] of o.bays || []) {
    if (a > cz + 0.01) k.box(x, wy0, cz, x + t, wy1, a, outer, side);
    k.box(x + t * 0.35, wy0, a, x + t * 0.65, wy1, b, glass);
    cz = b;
  }
  if (z1 > cz + 0.01) k.box(x, wy0, cz, x + t, wy1, z1, outer, side);
}

// Split a slab into boxes around rectangular holes (in x-z), for basements, pits and tracks.
// holes: [{x0, x1, z0, z1}]
export function slabAround(k, x0, x1, z0, z1, y0, y1, m, holes) {
  const hs = holes.filter((h) => h.x1 > x0 && h.x0 < x1 && h.z1 > z0 && h.z0 < z1);
  if (!hs.length) { k.box(x0, y0, z0, x1, y1, z1, m); return; }
  const xs = [...new Set([x0, x1, ...hs.flatMap((h) => [Math.max(x0, h.x0), Math.min(x1, h.x1)])])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1];
    if (b - a < 1e-4) continue;
    const act = hs.filter((h) => h.x0 <= a + 1e-4 && h.x1 >= b - 1e-4).sort((p, q) => p.z0 - q.z0);
    let cz = z0;
    for (const h of act) {
      if (h.z0 > cz + 1e-4) k.box(a, y0, cz, b, y1, Math.min(h.z0, z1), m);
      cz = Math.max(cz, h.z1);
    }
    if (z1 > cz + 1e-4) k.box(a, y0, cz, b, y1, z1, m);
  }
}

// A mushroom-capital concrete column (flat-slab construction) from y0 to y1.
export function mushroom(k, x, z, y0, y1, o = {}) {
  const r = o.r || 0.26;
  k.cyl(x, y0, z, r, y1 - y0 - 0.55, o.m || M.whitewash, { seg: 8 });
  k.cyl(x, y1 - 0.55, z, r, 0.4, o.m || M.whitewash, { r2: r * 2.6, seg: 8 });
  k.box(x - 0.9, y1 - 0.15, z - 0.9, x + 0.9, y1, z + 0.9, o.cap || M.concrete);
  if (o.dado !== false) k.cyl(x, y0, z, r + 0.01, 1.5, M.dado, { seg: 8, caps: false });
}

// A steel H-column (rolled section) from y0 to y1.
export function hcol(k, x, z, y0, y1, m = M.steel, s = 0.3) {
  k.box(x - s / 2, y0, z - 0.03, x + s / 2, y1, z + 0.03, m);
  k.box(x - s / 2, y0, z - s / 2, x - s / 2 + 0.04, y1, z + s / 2, m);
  k.box(x + s / 2 - 0.04, y0, z - s / 2, x + s / 2, y1, z + s / 2, m);
}

// Pipe railing along x.
export function railX(k, x0, x1, y, z, h = 1.0, step = 1.5) {
  k.cyl(x0, y + h, z, 0.025, x1 - x0, M.iron, { axis: 'x', seg: 5 });
  k.cyl(x0, y + h * 0.5, z, 0.02, x1 - x0, M.iron, { axis: 'x', seg: 4 });
  for (let x = x0; x <= x1 + 1e-6; x += step) k.cyl(x, y, z, 0.022, h, M.iron, { seg: 4, caps: false });
}
export function railZ(k, x, z0, z1, y, h = 1.0, step = 1.5) {
  k.cyl(x, y + h, z0, 0.025, z1 - z0, M.iron, { axis: 'z', seg: 5 });
  k.cyl(x, y + h * 0.5, z0, 0.02, z1 - z0, M.iron, { axis: 'z', seg: 4 });
  for (let z = z0; z <= z1 + 1e-6; z += step) k.cyl(x, y, z, 0.022, h, M.iron, { seg: 4, caps: false });
}

// A belt between two pulleys (thin flat strip).
export function belt(k, a, b, w = 0.1) { k.beam(a, b, w, mat({ c: '#6a4a30', cut: '#4a3420' })); }

export { shade, mat };
