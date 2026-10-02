/* The Jumbo Jet: shared dimensions, materials, the fuselage section and geometry helpers.
 *
 * World units are metres. x runs from the nose tip (x = 0) to the tail; y is height above
 * the keel line in level flight; z is depth behind the cut. The fuselage centreline lies at
 * z = ZC, so the cut (z = 0) runs along the left-hand aisle of the main deck: everything from
 * the centre seats to the right-hand windows stays standing. Sources: docs/research/jet.md.
 */
import { XS, mat, shade } from '../../engine/index.js';

export const ZC = 1.0;      // fuselage centreline (scene z)
export const FL = 2.7;      // main deck floor [S1, derived]
export const CEIL = 5.24;   // main deck ceiling, 2.54 m above the floor [S1]
export const UF = 5.43;     // upper deck and flight deck floor, 2.73 m above the main deck [S1]
export const HOLD = 0.6;    // container floor (roller beds) [derived]
export const HOLDTOP = 2.3; // underside of the floor beams [derived]
export const SKIN = 0.16;   // shell thickness drawn (skin, frames, insulation, trim)
export const AISLE_N = 0.08; // the near (left) aisle, at the cut
export const AISLE_F = ZC + 1.0; // the far (right) aisle

// Door centrelines from the nose [S1].
export const DOORS = [9.5, 18.8, 30.61, 40.74, 55.14];

const { clamp, smoothstep } = XS.math;

// ------------------------------------------------------------------ profile tables [S1, derived]
// Top line, bottom line, main-lobe crown and main-lobe half-width, from the dossier's outline
// polyline (nose tip (0, 3.7), windscreen base (4.6, 6.3), hump crown 7.74 from 8.0 to 14.3,
// main crown 7.15 from 23 to 63, keel flat 10 to 41, upsweep to (68.4, 5.0)).
const TOP = [[0, 3.7], [0.6, 4.3], [1.5, 4.92], [2.6, 5.45], [3.6, 5.86], [4.6, 6.3], [5.5, 6.86], [6.4, 7.3], [7.2, 7.6], [8.0, 7.74], [14.3, 7.74], [16, 7.7], [18, 7.55], [20, 7.34], [22, 7.2], [23, 7.15], [63, 7.15], [64.5, 6.97], [66, 6.6], [67.4, 6.1], [68.6, 5.5]];
// The dossier gives the upsweep as a straight line from (41, 0) to (68.4, 5.0); it is drawn here as
// a gentle curve through the same end points so the aft cabin keeps its floor width.
const BOT = [[0, 3.7], [0.3, 3.15], [0.8, 2.66], [1.6, 2.14], [2.6, 1.7], [3.8, 1.3], [5, 1.0], [6.5, 0.6], [8, 0.26], [9, 0.08], [10, 0], [41, 0], [46, 0.25], [50, 0.7], [54, 1.25], [57, 1.75], [59.5, 2.3], [62, 3.0], [65, 3.9], [68.4, 5.0], [68.6, 5.2]];
const YCF = [[0, 0.545], [44, 0.545], [52, 0.43], [58, 0.38], [63, 0.39], [66, 0.45], [69, 0.5]];
const MAIN = [[0, 3.7], [0.6, 4.3], [1.5, 4.92], [2.6, 5.45], [3.6, 5.82], [4.6, 6.1], [6, 6.45], [8, 6.82], [10, 7.04], [12, 7.13], [13, 7.15], [100, 7.15]];
const WID = [[0, 0.05], [0.3, 0.75], [0.8, 1.25], [1.6, 1.7], [2.6, 2.08], [3.8, 2.38], [5.6, 2.62], [7.5, 2.86], [9.5, 3.05], [11.5, 3.18], [13, 3.25], [42, 3.25], [48, 3.16], [53, 2.96], [58, 2.62], [61, 2.26], [64, 1.76], [66.5, 1.16], [68.6, 0.35]];

export function tab(T, x) {
  if (x <= T[0][0]) return T[0][1];
  for (let i = 1; i < T.length; i++) {
    if (x <= T[i][0]) {
      const a = T[i - 1], b = T[i];
      const u = (x - a[0]) / (b[0] - a[0]);
      const s = u * u * (3 - 2 * u) * 0.35 + u * 0.65; // a little easing between knots
      return a[1] + (b[1] - a[1]) * s;
    }
  }
  return T[T.length - 1][1];
}
export const topY = (x) => tab(TOP, x);
export const botY = (x) => tab(BOT, x);

// The fuselage section at x: a main lobe (round above, deeper ellipse below, as Boeing's
// constant-section drawing) with the upper-deck hump as a smaller circle on top.
export function sec(x) {
  const B = botY(x), T = topY(x), M = Math.min(T, tab(MAIN, x)), W = tab(WID, x);
  const yc = B + (M - B) * tab(YCF, x);
  let hump = null;
  if (T > M + 0.01) { const r = Math.min(2.3, W * 0.78); hump = { r, y: T - r }; }
  return { x, B, T, M, W, yc, uh: M - yc, lh: yc - B, hump };
}
// Distance from the lobe centre to the surface along angle th (0 = towards +z, PI/2 = up), inset by t.
export function rad(S, th, t = 0) {
  const c = Math.cos(th), s = Math.sin(th);
  const w = Math.max(0.02, S.W - t), h = Math.max(0.02, (s >= 0 ? S.uh : S.lh) - t);
  let r = 1 / Math.sqrt((c / w) ** 2 + (s / h) ** 2);
  if (S.hump) {
    const dy = S.hump.y - S.yc, R = S.hump.r - t;
    const b = -s * dy, cc = dy * dy - R * R, disc = b * b - cc;
    if (disc >= 0) { const q = -b + Math.sqrt(disc); if (q > r) r = q; }
  }
  return r;
}
// Point on the shell: [x, y, z] in scene coordinates.
export function shellPt(S, th, t = 0) {
  const r = rad(S, th, t);
  return [S.x, S.yc + r * Math.sin(th), ZC + r * Math.cos(th)];
}
// The inner wall's distance from the centreline at height y (0 when y is outside the lobe).
export function wallZ(x, y, t = SKIN) {
  const S = sec(x);
  const h = (y >= S.yc ? S.uh : S.lh) - t, w = S.W - t;
  const v = (y - S.yc) / h;
  let z = Math.abs(v) < 1 ? w * Math.sqrt(1 - v * v) : 0;
  if (S.hump) {
    const R = S.hump.r - t, d = y - S.hump.y;
    if (Math.abs(d) < R) z = Math.max(z, Math.sqrt(R * R - d * d));
  }
  return z;
}
// Scene z of the right-hand inner wall at (x, y).
export const farWall = (x, y, t = SKIN) => ZC + wallZ(x, y, t);

// ------------------------------------------------------------------ materials
// Colours tagged (R) in the dossier (Galaxy Beige, 747 Blue) are reported, not verified.
export const M = {
  white: mat({ c: '#f2ede2', c2: '#e2dccf', cut: '#2a2f3a' }),
  metal: mat({ c: '#b9bcc0', c2: '#a4a8ae', pat: 'plates', s: 1.1, cut: '#2a2f3a' }),
  cheat: mat({ c: '#2f5d9e', c2: '#264e86', cut: '#2a2f3a' }),
  trim: mat({ c: '#e8dfca', c2: '#ddd2b9', pat: 'panels', s: 0.51, cut: '#2a2f3a' }),
  primer: mat({ c: '#8fa58a', c2: '#7c9277', pat: 'rivets', s: 0.5, cut: '#2a2f3a' }),
  bare: mat({ c: '#a9adb0', c2: '#94989c', pat: 'plates', s: 0.6, cut: '#3a3e44' }),
  radome: mat({ c: '#4a4c52', c2: '#3c3e44', cut: '#24262a' }),
  windscreen: mat({ c: '#3c4a5c', c2: '#7a90a8', glow: 'night', cut: '#2a2f3a' }),
  floor: mat({ c: '#b8a07a', c2: '#a48a64', pat: 'carpet', s: 0.4, cut: '#c89a52' }),
  floorBlue: mat({ c: '#3e5a86', c2: '#344e76', pat: 'carpet', s: 0.4, cut: '#c89a52' }),
  floorGalley: mat({ c: '#9a9890', c2: '#86847c', pat: 'tiles', s: 0.3, cut: '#c89a52' }),
  beams: mat({ c: '#9aa0a6', c2: '#868c92', pat: 'grate', s: 0.5, cut: '#6a7078' }),
  ceiling: mat({ c: '#f0e9da', c2: '#e4dccb', pat: 'panels', s: 1.2, cut: '#cfc4ae' }),
  bin: mat({ c: '#e4dac4', c2: '#d4c8b0', pat: 'panels', s: 0.9, cut: '#b8ab92' }),
  bulkhead: mat({ c: '#e2d6bc', c2: '#d2c4a6', pat: 'panels', s: 0.6, cut: '#9a8c74' }),
  laminate: mat({ c: '#8a6a48', c2: '#7a5a3c', pat: 'grain', s: 0.4, cut: '#5a4430' }),
  steel: mat({ c: '#c4c8cc', c2: '#aeb2b6', pat: 'panels', s: 0.3, cut: '#7a7e84' }),
  steelDark: mat({ c: '#8a8e94', c2: '#7a7e84', cut: '#5a5e64' }),
  beige: mat({ c: '#d6c6a0', c2: '#c4b28a', pat: 'quilt', s: 0.18, cut: '#9a8a68' }),
  blue: mat({ c: '#3a5a8c', c2: '#304c78', pat: 'quilt', s: 0.18, cut: '#24385a' }),
  seatShell: mat({ c: '#c2b28e', c2: '#b0a07c', cut: '#8a7a5a' }),
  seatLeg: mat({ c: '#8a8e94', cut: '#5a5e64' }),
  cover: mat({ c: '#f6f2ea', c2: '#e8e2d6', cut: '#c8c0b0' }),
  black: mat({ c: '#26262a', cut: '#18181a' }),
  dial: mat({ c: '#1e1f22', c2: '#f2f0ea', pat: 'rings', s: 0.03, cut: '#18181a' }),
  panel: mat({ c: '#5a6068', c2: '#4c5258', pat: 'panels', s: 0.18, cut: '#3a3e44' }),
  panelGrey: mat({ c: '#6e747c', c2: '#5e646c', pat: 'rivets', s: 0.08, cut: '#3a3e44' }),
  container: mat({ c: '#b4b8bc', c2: '#a0a4a8', pat: 'corrugated', s: 0.12, cut: '#6a7078' }),
  containerIn: mat({ c: '#9a9ea2', c2: '#8a8e92', cut: '#6a7078' }),
  roller: mat({ c: '#7e848a', c2: '#6a7076', pat: 'bars', s: 0.25, cut: '#5a6068' }),
  fuel: mat({ c: '#d8a24a', c2: '#c8903a', cut: '#e0a848', plainCut: true }),
  tank: mat({ c: '#8a9a88', c2: '#7a8a78', pat: 'rivets', s: 0.4, cut: '#4a5248' }),
  tyre: mat({ c: '#2a2a2c', c2: '#1e1e20', cut: '#1a1a1c' }),
  hub: mat({ c: '#9a9ea4', cut: '#5a5e64' }),
  strut: mat({ c: '#c8ccd0', c2: '#b4b8bc', cut: '#6a6e74' }),
  duct: mat({ c: '#c8c4b8', c2: '#b8b4a8', pat: 'corrugated', s: 0.15, cut: '#8a867a' }),
  insul: mat({ c: '#d8c890', c2: '#c8b880', pat: 'quilt', s: 0.3, cut: '#b8a870' }),
  red: mat({ c: '#b84a32', cut: '#7a2a1a' }),
  glassWin: mat({ c: '#bcd2e4', c2: '#5c6e90', glow: 'night', cut: '#2a2f3a' }),
  winOut: mat({ c: '#3a4658', c2: '#ffd890', glow: 'night', cut: '#2a2f3a' }),
  shade: mat({ c: '#efe8d6', c2: '#e0d8c4', cut: '#b8ae98' }),
  door: mat({ c: '#ddd2ba', c2: '#cbbfa4', pat: 'panels', s: 0.5, cut: '#9a8c74' }),
  wood: mat({ c: '#7a5232', c2: '#6a4428', pat: 'grain', s: 0.3, cut: '#5a3a22' }),
  chrome: mat({ c: '#d8dade', c2: '#c4c6ca', cut: '#8a8c90' }),
};
// Materials drawn whole (outside the cut: the near wing, engines and tail).
export const MW = {
  wing: mat({ c: '#c4c7cb', c2: '#b0b4b8', pat: 'plates', s: 1.3, whole: true }),
  wingDark: mat({ c: '#9ea2a8', c2: '#8a8e94', pat: 'plates', s: 0.8, whole: true }),
  walkway: mat({ c: '#8a8e92', c2: '#7a7e82', pat: 'grate', s: 0.4, whole: true }),
  cowl: mat({ c: '#d4d6d8', c2: '#c0c2c6', pat: 'plates', s: 0.7, whole: true }),
  cowlIn: mat({ c: '#8e9298', c2: '#7e8288', whole: true }),
  lip: mat({ c: '#e8e8e6', whole: true }),
  cutFace: mat({ c: '#3a3036', c2: '#5a4a50', pat: 'stripes', s: 0.12, whole: true }),
  hot: mat({ c: '#8a5a3a', c2: '#6a4028', pat: 'rings', s: 0.08, whole: true }),
  core: mat({ c: '#9a8e7e', c2: '#8a7e6e', pat: 'rings', s: 0.1, whole: true }),
  blade: mat({ c: '#c8ccd2', c2: '#b4b8be', whole: true }),
  spinner: mat({ c: '#e6e6e4', c2: '#cfcfcd', whole: true }),
  exhaust: mat({ c: '#4a4440', c2: '#3a3430', whole: true }),
  fuel: mat({ c: '#d8a24a', c2: '#e8b860', whole: true }),
  spar: mat({ c: '#6a6e74', whole: true }),
  white: mat({ c: '#f2ede2', c2: '#e2dccf', whole: true }),
  pylon: mat({ c: '#c4c7cb', c2: '#b0b4b8', pat: 'rivets', s: 0.4, whole: true }),
  flame: mat({ c: '#ff9a40', c2: '#ffb860', glow: 'always', whole: true, noEdge: true }),
};

export const C = {
  galaxyBeige: '#d6c6a0', blue747: '#3a5a8c', superjetBlue: '#2c4a86', galaxyGold: '#c89a3a',
  navy: '#1e2436', shirt: '#f4f2ec',
};

// ------------------------------------------------------------------ geometry helpers
// A triangle (or quad) turned so its face points along W.
export function triW(k, a, b, c, W, m) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const d = (uy * vz - uz * vy) * W[0] + (uz * vx - ux * vz) * W[1] + (ux * vy - uy * vx) * W[2];
  if (d >= 0) k.tri(a, b, c, m); else k.tri(a, c, b, m);
}
export function quadW(k, a, b, c, d, W, m) { triW(k, a, b, c, W, m); triW(k, a, c, d, W, m); }

// Surface of revolution about an axis parallel to x through (cy, cz). prof: closed loop of
// [x, r] (x relative to x0). a0..a1: angle range (0 = up, PI/2 = away from the viewer).
// Partial revolutions get end caps (capMat) so the solid stays closed.
export function revolveX(k, prof, x0, cy, cz, m, o = {}) {
  const TAU = Math.PI * 2, seg = o.seg || 24;
  const a0 = o.a0 != null ? o.a0 : 0, a1 = o.a1 != null ? o.a1 : TAU;
  const full = Math.abs(a1 - a0 - TAU) < 1e-6;
  let area = 0;
  for (let i = 0; i < prof.length; i++) { const p = prof[i], q = prof[(i + 1) % prof.length]; area += p[0] * q[1] - q[0] * p[1]; }
  const sgn = area >= 0 ? 1 : -1;
  const P = (p, a) => [x0 + p[0], cy + p[1] * Math.cos(a), cz + p[1] * Math.sin(a)];
  const n = o.open ? prof.length - 1 : prof.length;
  for (let s = 0; s < seg; s++) {
    const ta = a0 + ((a1 - a0) * s) / seg, tb = a0 + ((a1 - a0) * (s + 1)) / seg, tm = (ta + tb) / 2;
    for (let i = 0; i < n; i++) {
      const p = prof[i], q = prof[(i + 1) % prof.length];
      if (p[1] < 1e-4 && q[1] < 1e-4) continue;
      const dx = q[0] - p[0], dr = q[1] - p[1];
      const nx = dr * sgn, nr = -dx * sgn; // outward in the (x, r) plane
      const W = [nx, nr * Math.cos(tm), nr * Math.sin(tm)];
      const mm = o.matFn ? o.matFn(i, s) : m;
      if (!mm) continue;
      quadW(k, P(p, ta), P(q, ta), P(q, tb), P(p, tb), W, mm);
    }
  }
  if (!full && o.caps !== false) {
    const cm = o.capMat || m;
    k.poly(prof.map((p) => P(p, a0)), cm, 1, [0, Math.sin(a0), -Math.cos(a0)]);
    k.poly(prof.map((p) => P(p, a1)), cm, 1, [0, -Math.sin(a1), Math.cos(a1)]);
  }
}

// A closed solid through a run of rings (each a closed loop of 3D points, same count).
// Faces are turned away from the rings' centroids; caps close both ends.
export function skin(k, rings, m, o = {}) {
  const cen = rings.map((R) => { const c = [0, 0, 0]; for (const p of R) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; } return c.map((v) => v / R.length); });
  const n = rings[0].length;
  for (let s = 0; s < rings.length - 1; s++) {
    const A = rings[s], B = rings[s + 1];
    const cc = [(cen[s][0] + cen[s + 1][0]) / 2, (cen[s][1] + cen[s + 1][1]) / 2, (cen[s][2] + cen[s + 1][2]) / 2];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mid = [(A[i][0] + A[j][0] + B[i][0] + B[j][0]) / 4, (A[i][1] + A[j][1] + B[i][1] + B[j][1]) / 4, (A[i][2] + A[j][2] + B[i][2] + B[j][2]) / 4];
      const W = o.out ? o.out(mid, s, i) : [mid[0] - cc[0], mid[1] - cc[1], mid[2] - cc[2]];
      const mm = o.matFn ? o.matFn(s, i, mid) : m;
      if (!mm) continue;
      quadW(k, A[i], A[j], B[j], B[i], W, mm);
    }
  }
  if (o.caps !== false) {
    const f = rings[0], l = rings[rings.length - 1], c0 = cen[0], c1 = cen[1], cl = cen[cen.length - 1], cp = cen[cen.length - 2];
    k.poly(f, o.capA || m, 1, [c0[0] - c1[0], c0[1] - c1[1], c0[2] - c1[2]]);
    k.poly(l, o.capB || o.capA || m, 1, [cl[0] - cp[0], cl[1] - cp[1], cl[2] - cp[2]]);
  }
}

// A symmetric aerofoil as a loop of (u, v): u along the chord 0..1, v thickness fraction of chord.
export function airfoil(t, n = 9) {
  const yt = (u) => 5 * t * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
  const us = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI; us.push((1 - Math.cos(a)) / 2); }
  const top = us.map((u) => [u, yt(u) + 0.004]);
  const bot = us.slice(1, -1).reverse().map((u) => [u, -yt(u) - 0.004]);
  return top.concat(bot); // upper surface LE to TE, then lower surface TE back to LE
}

// A lifting surface through spanwise stations { s (span position), le, te, y (chord-line height),
// t (thickness/chord) }, laid out by place(u, s, le, te) -> [x, y, z].
export function wingSolid(k, stations, m, o = {}) {
  const rings = stations.map((st) => {
    const af = airfoil(st.t, o.n || 9);
    const ch = st.te - st.le;
    return af.map(([u, v]) => o.place(st.le + u * ch, st.y + v * ch, st.s));
  });
  skin(k, rings, m, o);
  return rings;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export { clamp, smoothstep, shade };
