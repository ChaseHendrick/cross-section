/* The Earth below, its drifting clouds, and the ground inset: "Meanwhile, on the ground".
 *
 * The Earth is drawn as a great sphere under the station (not to scale), its curved limb
 * running behind the lower half of the picture. Clouds drift slowly to the left because the
 * station flies to the right. Along the top of the globe stands a strip of control rooms
 * (the dossier's optional ground inset), from west to east: Houston, Huntsville, Saint-Hubert,
 * Toulouse, Oberpfaffenhofen, Moscow (Korolev) and Tsukuba. Rooms are illustrative.
 */
import { THREE, mat, props, fbm2 } from '../../engine/index.js';
import { M } from './common.js';

export const EARTH = { x: 106, y: -2730, z: 1300, R: 2200 };
export const FLOOR_Y = -46; // the ground inset's floor

const OCEAN = [mat({ c: '#2a5682', c2: '#30608c', whole: true }), mat({ c: '#3a6e98', c2: '#4278a2', whole: true })];
const LAND = [mat({ c: '#6e8458', c2: '#62784e', pat: 'speckle', whole: true }), mat({ c: '#5e7450', c2: '#546a48', pat: 'speckle', whole: true }), mat({ c: '#b4a07a', c2: '#a8946e', pat: 'speckle', whole: true }), mat({ c: '#9a8a6e', c2: '#8e7e64', pat: 'speckle', whole: true })];
const CLOUD = mat({ c: '#f6f6f2', c2: '#e2e4ea', whole: true, noEdge: true });
const ICE = mat({ c: '#eef2f4', c2: '#dde4ea', pat: 'speckle', whole: true });

// A point on the globe: a = "latitude" towards +x, b = angle about the x axis from +y towards +z.
const sph = (a, b, r = EARTH.R) => [EARTH.x + r * Math.sin(a), EARTH.y + r * Math.cos(a) * Math.cos(b), EARTH.z + r * Math.cos(a) * Math.sin(b)];
const field = (a, b) => fbm2(a * 2.6 + 3.1, b * 2.6 - 1.7, 41, 5) + 0.22 * fbm2(a * 9, b * 9, 7, 3);
// Bands of the field, from deep ocean to high desert, and their materials.
const BANDS = [[-9, 0.1, OCEAN[0]], [0.1, 0.17, OCEAN[1]], [0.17, 0.28, LAND[0]], [0.28, 0.36, LAND[1]], [0.36, 0.46, LAND[2]], [0.46, 9, LAND[3]]];

// Clip a polygon of [u, v, value] corners to lo < value <= hi (linear along edges).
function clipBand(poly, lo, hi) {
  const clip = (P, keep, edge) => {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const A = P[i], B = P[(i + 1) % P.length];
      const ka = keep(A[2]), kb = keep(B[2]);
      if (ka) out.push(A);
      if (ka !== kb) { const t = (edge - A[2]) / (B[2] - A[2]); out.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, edge]); }
    }
    return out;
  };
  let P = clip(poly, (v) => v > lo, lo);
  if (P.length >= 3) P = clip(P, (v) => v <= hi, hi);
  return P;
}

export function buildEarth(k) {
  // Back of the globe: a plain sphere. Front: a finer skin with smooth coastlines.
  k.sphere(EARTH.x, EARTH.y, EARTH.z, EARTH.R - 6, mat({ c: '#2a5682', whole: true }), { seg: 36, rings: 18 });
  const A0 = -1.35, A1 = 1.35, B0 = -2.25, B1 = 1.25, na = 84, nb = 84;
  const val = [];
  for (let j = 0; j <= nb; j++) { val.push([]); for (let i = 0; i <= na; i++) val[j].push(field(A0 + ((A1 - A0) * i) / na, B0 + ((B1 - B0) * j) / nb)); }
  for (let j = 0; j < nb; j++) for (let i = 0; i < na; i++) {
    const a0 = A0 + ((A1 - A0) * i) / na, a1 = A0 + ((A1 - A0) * (i + 1)) / na;
    const b0 = B0 + ((B1 - B0) * j) / nb, b1 = B0 + ((B1 - B0) * (j + 1)) / nb;
    const cell = [[a0, b0, val[j][i]], [a1, b0, val[j][i + 1]], [a1, b1, val[j + 1][i + 1]], [a0, b1, val[j + 1][i]]];
    const vmin = Math.min(cell[0][2], cell[1][2], cell[2][2], cell[3][2]), vmax = Math.max(cell[0][2], cell[1][2], cell[2][2], cell[3][2]);
    for (const [lo, hi, m] of BANDS) {
      if (vmax <= lo || vmin > hi) continue;
      const mm = Math.abs(a0) > 1.2 ? ICE : m;
      const P = vmin > lo && vmax <= hi ? cell : clipBand(cell, lo, hi);
      if (P.length < 3) continue;
      const pts = P.map(([a, b]) => sph(a, b));
      for (let q = 1; q < pts.length - 1; q++) k._oriented(pts[0], pts[q], pts[q + 1], sph((a0 + a1) / 2, (b0 + b1) / 2, 1).map((v, ix) => v - [EARTH.x, EARTH.y, EARTH.z][ix]), mm);
    }
  }
  // City lights on the land, clustered round towns, which show only in the orbital night.
  const r = k.rng('cities');
  const LIGHT = mat({ c: '#6a8650', c2: '#ffd890', glow: 'night', whole: true, noEdge: true });
  let n = 0;
  for (let t = 0; t < 6000 && n < 1100; t++) {
    const a = A0 + 0.1 + r() * (A1 - A0 - 0.2), b = B0 + 0.1 + r() * (B1 - B0 - 0.2);
    const v = field(a, b);
    if (v < 0.19 || v > 0.42) continue;
    const m = 1 + Math.floor(r() * 9);
    for (let i = 0; i < m; i++) {
      const aa = a + r.gauss() * 0.006, bb = b + r.gauss() * 0.006;
      const p = sph(aa, bb, EARTH.R + 1.5);
      const s = i === 0 ? 4 + r() * 5 : 1.5 + r() * 3;
      k.box(p[0] - s, p[1] - 1.5, p[2] - s, p[0] + s, p[1] + 1.5, p[2] + s, LIGHT);
      n++;
    }
  }
}

// Clouds: a layer of puffs over half the globe, and a copy of it, in parts that turn about an
// axis through the Earth's centre so the clouds drift to the left and the drift can wrap.
export const CLOUD_AXIS = [0, 0.47, 0.88];
export function buildClouds(k) {
  const W = Math.PI;
  const ax = CLOUD_AXIS;
  const make = () => k.part(EARTH.x, EARTH.y, EARTH.z, (q) => {
    const r = k.rng('clouds');
    const ico = new THREE.IcosahedronGeometry(1, 1);
    const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    // Basis around the axis: e1, e2 perpendicular to it.
    const K = new THREE.Vector3(...ax).normalize(), e1 = new THREE.Vector3(1, 0, 0), e2 = new THREE.Vector3().crossVectors(K, e1).normalize();
    for (let c = 0; c < 120; c++) {
      const lon = (r() - 0.5) * W, lat = Math.asin(r() * 1.9 - 0.95) * 0.95;
      const n = 2 + Math.floor(r() * 4);
      const big = 35 + r() * 90;
      for (let i = 0; i < n; i++) {
        const lo = lon + (r() - 0.5) * (big / EARTH.R) * 2.2, la = lat + (r() - 0.5) * (big / EARTH.R) * 1.4;
        const R = EARTH.R + 12 + r() * 10;
        const dir = new THREE.Vector3().addScaledVector(e1, Math.cos(la) * Math.cos(lo)).addScaledVector(e2, Math.cos(la) * Math.sin(lo)).addScaledVector(K, Math.sin(la));
        ps.copy(dir).multiplyScalar(R);
        qt.setFromUnitVectors(up, dir);
        const s = big * (0.35 + r() * 0.5);
        sc.set(s * (0.9 + r() * 0.8), s * 0.34, s * (0.9 + r() * 0.8));
        m4.compose(ps, qt, sc);
        q.geo(ico, m4, CLOUD);
      }
    }
  }, { whole: true });
  const a = make();
  const b = a.clone();
  k.object(b);
  return { a, b, W, axis: new THREE.Vector3(...ax).normalize() };
}

// ------------------------------------------------------------------ the ground strip
const ROOMS = [
  { id: 'jsc', name: 'Houston: station flight control room', x0: 16, x1: 42, rows: 5 },
  { id: 'jscS', name: 'Houston: shuttle flight control room', x0: 45, x1: 62, rows: 4 },
  { id: 'mer', name: 'Houston: support room', x0: 65, x1: 76, rows: 2 },
  { id: 'poic', name: 'Huntsville: payload operations', x0: 79, x1: 93, rows: 3 },
  { id: 'csa', name: 'Saint-Hubert: robotics', x0: 96, x1: 105, rows: 1 },
  { id: 'atv', name: 'Toulouse: ATV control centre', x0: 108, x1: 121, rows: 3 },
  { id: 'col', name: 'Oberpfaffenhofen: Columbus control centre', x0: 124, x1: 138, rows: 3 },
  { id: 'tsup', name: 'Moscow (Korolev): mission control', x0: 141, x1: 166, rows: 5 },
  { id: 'ssipc', name: 'Tsukuba: Kibo control room', x0: 169, x1: 183, rows: 3 },
];
export const GROUND = {};

export function buildGround(k) {
  const WALL = mat({ c: '#d8d0bc', c2: '#c4bca6', pat: 'panels', s: 1.6, cut: '#6a6250' });
  const FLOOR = mat({ c: '#5a6270', c2: '#4a525e', pat: 'carpet', s: 0.9, cut: '#3a3e46' });
  const CEIL = mat({ c: '#e8e4d8', c2: '#d4d0c4', pat: 'tiles', s: 0.6, cut: '#7a7466' });
  const DESK = mat({ c: '#8a8c90', c2: '#6a6c70', pat: 'panels', s: 0.8, cut: '#4a4c50' });
  const SCREEN = mat({ c: '#183048', c2: '#3a78b0', glow: 'always' });
  const TRACK = mat({ c: '#e8c040', c2: '#ffe070', glow: 'always', noEdge: true });
  const LANDS = mat({ c: '#2a5a3a', c2: '#3a8a54', glow: 'always', noEdge: true });
  const BASE = mat({ c: '#3a3630', c2: '#2a2622', pat: 'stone', s: 0.8, cut: '#2a2622', whole: true });
  const D = 9.0, H = 4.6;
  // One long display base for the whole strip, like a shelf of models.
  k.box(ROOMS[0].x0 - 3, FLOOR_Y - 1.6, -0.8, ROOMS[ROOMS.length - 1].x1 + 3, FLOOR_Y - 0.25, D + 1.0, BASE);
  k.box(ROOMS[0].x0 - 3.2, FLOOR_Y - 1.75, -0.9, ROOMS[ROOMS.length - 1].x1 + 3.2, FLOOR_Y - 1.55, D + 1.1, mat({ c: '#8a7a5a', cut: '#4a4030', whole: true }));
  for (const R of ROOMS) {
    const xm = (R.x0 + R.x1) / 2;
    const y = FLOOR_Y;
    k.room(R.x0, R.x1, y, y + H, -0.4, D, { floor: FLOOR, wall: WALL, ceiling: CEIL, t: 0.25, ft: 0.25 });
    k.box(R.x0 - 0.25, y + H + 0.2, -0.4, R.x1 + 0.25, y + H + 0.5, D + 0.25, mat({ c: '#b8ae98', cut: '#6a6250' }));
    // Front wall screens on the right: a world map with the ground track.
    const sx = R.x1 - 0.06;
    k.box(sx, y + 1.6, 1.2, R.x1, y + 4.1, D - 1.2, SCREEN);
    for (let i = 0; i < 6; i++) k.box(sx - 0.02, y + 2.0 + (i % 3) * 0.6, 1.8 + i * 0.95, sx, y + 2.35 + (i % 3) * 0.6, 2.5 + i * 0.95, LANDS);
    for (let i = 0; i < 26; i++) {
      const t = i / 25;
      const zz = 1.5 + t * (D - 3);
      const yy = y + 2.85 + Math.sin(t * Math.PI * 3.2 + R.x0) * 0.8;
      k.box(sx - 0.03, yy - 0.04, zz, sx, yy + 0.04, zz + 0.22, TRACK);
    }
    // Rows of consoles on tiers rising towards the back, everyone facing the screens.
    const seats = [];
    const step = Math.min(2.4, (R.x1 - R.x0 - 4.2) / Math.max(1, R.rows));
    for (let rI = 0; rI < R.rows; rI++) {
      const x = R.x1 - 3.6 - rI * step, ty = y + rI * 0.28;
      if (rI) k.box(R.x0, y, -0.4, x + 0.9, ty, D, mat({ c: '#4e5664', c2: '#3e4652', pat: 'carpet', s: 0.9, cut: '#3a3e46' }));
      k.box(x + 0.25, ty, 0.6, x + 0.85, ty + 0.78, D - 0.6, DESK);
      for (let s2 = 0; s2 < 4; s2++) {
        const z = 1.15 + s2 * ((D - 2.3) / 3);
        k.boxR(x + 0.62, ty + 1.02, z, 0.06, 0.34, 0.52, mat({ c: '#2a2c30' }), { z: -0.2 });
        k.boxR(x + 0.585, ty + 1.02, z, 0.01, 0.28, 0.44, SCREEN, { z: -0.2 });
        const ch = props.chair(k, x - 0.25, ty, z - 0.21, { face: 1, color: '#3a3e4a' });
        seats.push({ at: [x - 0.25, ty, z], seat: ch.seat - ty, face: 1 });
      }
    }
    // A row of clocks above the screens (the station runs on GMT), mugs and binders on the desks.
    for (let i = 0; i < 3; i++) {
      const cz = 3.2 + i * 1.3;
      k.cyl(R.x1 - 0.08, y + 4.35, cz, 0.2, 0.05, mat({ c: '#1a1a1e' }), { axis: 'x', seg: 12 });
      k.box(R.x1 - 0.1, y + 4.25, cz - 0.12, R.x1 - 0.09, y + 4.45, cz + 0.12, mat({ c: '#e84a3a', c2: '#ff6a50', glow: 'always', noEdge: true }));
    }
    const rr = k.rng('desk' + R.id);
    for (const st of seats) {
      if (rr() < 0.45) k.cyl(st.at[0] + 0.55, st.at[1] + 0.78, st.at[2] + 0.25, 0.04, 0.1, mat(rr.pick(['#f4f2ea', '#c84a3a', '#2a4a8a', '#3a6a3a'])), { seg: 8 });
      if (rr() < 0.3) k.box(st.at[0] + 0.4, st.at[1] + 0.78, st.at[2] - 0.35, st.at[0] + 0.7, st.at[1] + 0.84, st.at[2] - 0.1, mat(rr.pick(['#2a4a8a', '#7a2a20', '#e8e0c8'])));
    }
    // Lights: ceiling panels.
    for (let x = R.x0 + 2.5; x < R.x1 - 1; x += 5) {
      k.box(x - 0.6, y + H - 0.06, 3.5, x + 0.6, y + H, 5.5, M.light);
      k.lamp(x, y + H - 0.3, 4.5, { color: '#fff0d8', r: 7.5, i: 1.4, bulb: false, halo: 0.9 });
    }
    // A coffee corner at the back of the larger rooms.
    if (R.x1 - R.x0 > 15) {
      props.table(k, R.x0 + 1.2, y + (R.rows - 1) * 0.28, D - 1.6, { w: 1.4, d: 0.7, h: 0.9, items: 'cup', top: '#6a6c70' });
    }
    GROUND[R.id] = { ...R, y, seats, xm, back: [R.x0 + 1.0, y + (R.rows - 1) * 0.28, D - 2.4], front: [R.x1 - 1.6, y, 4.5] };
  }
}
export const GROUND_ROOMS = ROOMS;
