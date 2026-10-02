/* Big Pit: the ground. The strata are cut in section as closed solids, with every
 * roadway, shaft and chamber carved out of them, so a slice anywhere shows the rock
 * bands as hatched poché and the workings as rooms in the rock. Behind the cut block the
 * hillside rises to the moor and the town of Blaenavon.
 */
import { XS, mat, THREE } from '../../engine/index.js';
import { PB, SHAFT, ZR, X0, X1, FAULT, BANDS, BOTTOM, MAT, boundary, ground, lerp, clamp } from './common.js';

// ------------------------------------------------------------------ the voids
// Every opening in the rock: x range, floor at each end, roof at each end, depth behind the cut.
const V = (id, x0, x1, y0, y1, d, extra) => Object.assign({ id, x0, x1, f0: y0, f1: y0, r0: y1, r1: y1, d }, extra || {});
const VS = (id, x0, x1, f0, f1, h, d) => ({ id, x0, x1, f0, f1, r0: f0 + h, r1: f1 + h, d });
export const VOIDS = [
  V('face', 0, 20, PB, PB + 1.25, 2.4),
  V('horse', 20, 52, PB, PB + 2.1, 3.0),
  VS('drift', 26, 48, PB + 0.1, -77, 2.3, 2.8),
  V('parting', 52, 60, PB, PB + 3.0, 3.2),
  V('lip', 52, 56.5, PB + 2.9, PB + 4.1, 3.2),
  V('road', 60, 122, PB, PB + 2.5, 3.4),
  V('bottom', 122, 180, PB, PB + 4.0, 4.4),
  V('shaft', SHAFT.x0 - 0.45, SHAFT.x1 + 0.45, SHAFT.sump - 0.6, 1.2, 2.6),
  V('pump', 180, 192, PB, PB + 3.5, 4.4),
  V('haulage', 192, 205, PB, PB + 3.5, 4.4),
  V('stables', 205, 238, PB, PB + 3.0, 6.6),
  V('returnL', 54, 143, -83, -81, 2.2),
  V('returnR', 156, 238, -83, -81, 2.2),
  VS('incline', 238, 296, -83, -121, 2.0, 2.2),
  V('returnF', 296, 341, -121, -119, 2.2),
  V('coityB', 341, 351, -123.5, -119, 3.0),
  V('coity1', 342.4, 344.8, -123.5, 3.0, 2.4),
  V('coity2', 347.2, 349.6, -123.5, 3.5, 2.4),
  V('fandrift', 334, 349.6, -4.2, -1.6, 2.4),
  V('oldCoity', 351, 418, -121.6, -119.1, 2.6),
  V('oldUpper', 62, 138, -61, -59.6, 2.2),
  V('inset', 138, SHAFT.x0 - 0.4, -61, -58, 2.4),
  // refuge holes (manholes) let into the back wall of the main road every 20 yards
  V('mh1', 63.9, 65.1, PB, PB + 1.9, 4.3), V('mh2', 82.2, 83.4, PB, PB + 1.9, 4.3), V('mh3', 100.5, 101.7, PB, PB + 1.9, 4.3),
  // refuges on the horse road (every 50 yards)
  V('mh4', 35.4, 36.6, PB, PB + 1.8, 3.9),
  // the fault: a zone of crushed rock filled separately (see buildRock)
  V('fault', 243, 245.2, BOTTOM + 0.01, -6, ZR + 1, { fault: true }),
];
VOIDS.forEach((v) => {
  v.f = (x) => lerp(v.f0, v.f1, (x - v.x0) / (v.x1 - v.x0));
  v.r = (x) => lerp(v.r0, v.r1, (x - v.x0) / (v.x1 - v.x0));
});
export const voidById = (id) => VOIDS.find((v) => v.id === id);

const EPS = 0.006;
const SKIN = 0.25; // depth of the section skin

// Sample a piece {top(x), bot(x)} at xs, split it into runs where it has height, and return polygons.
function pieceRuns(xs, top, bot, tagT, tagB) {
  const pts = [];
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i], h = top(x) - bot(x);
    if (i > 0) {
      const p = pts[pts.length - 1];
      if ((p.h > 0) !== (h > 0) && Math.abs(p.h - h) > 1e-9) {
        const xc = p.x + (x - p.x) * (p.h / (p.h - h));
        if (xc > p.x + 1e-6 && xc < x - 1e-6) pts.push({ x: xc, h: 0, t: top(xc), b: top(xc) });
      }
    }
    pts.push({ x, h, t: top(x), b: bot(x) });
  }
  const polys = [];
  let run = [];
  const flush = () => {
    if (run.length >= 2) {
      const P = [];
      for (const p of run) P.push([p.x, Math.max(p.t, p.b), tagT ? tagT(p.x, p.t) : 1]);
      for (let i = run.length - 1; i >= 0; i--) { const p = run[i]; if (p.h > 1e-4) P.push([p.x, p.b, tagB ? tagB(p.x, p.b) : 1]); }
      // Drop consecutive duplicates.
      const Q = P.filter((p, i) => { const q = P[(i + P.length - 1) % P.length]; return Math.abs(p[0] - q[0]) > 1e-5 || Math.abs(p[1] - q[1]) > 1e-5; });
      let area = 0;
      for (let i = 0; i < Q.length; i++) { const a = Q[i], b = Q[(i + 1) % Q.length]; area += a[0] * b[1] - b[0] * a[1]; }
      if (Q.length >= 3 && Math.abs(area) > 1e-4) polys.push(Q);
    }
    run = [];
  };
  for (const p of pts) {
    if (p.h >= -1e-6) run.push(p);
    else { flush(); }
    if (p.h <= 1e-6 && run.length > 1) { flush(); run.push(p); }
  }
  flush();
  return polys;
}

// Extrude a polygon [[x, y, keep], ...] from z0 to z1, drawing the side face after vertex i only
// when the edge from i to i+1 is exposed (both ends kept). Internal band boundaries are skipped.
function extrudeF(k, poly, z0, z1, m, front, back) {
  let area = 0;
  for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const P = area < 0 ? poly.slice().reverse() : poly;
  for (let i = 0; i < P.length; i++) {
    const p = P[i], q = P[(i + 1) % P.length];
    if (!p[2] && !q[2] && Math.abs(p[0] - q[0]) > 1e-6) continue; // along an internal boundary
    k.quad([p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1], m);
  }
  if (front || back) {
    const tris = THREE.ShapeUtils.triangulateShape(P.map((p) => new THREE.Vector2(p[0], p[1])), []);
    for (const t of tris) {
      const a = P[t[0]], b = P[t[1]], c = P[t[2]];
      if (front) k.tri([a[0], a[1], z0], [c[0], c[1], z0], [b[0], b[1], z0], m);
      if (back) k.tri([a[0], a[1], z1], [b[0], b[1], z1], [c[0], c[1], z1], m);
    }
  }
}

// Subtract voids from a band piece, returning the list of remaining pieces.
function subtract(pieces, voids) {
  let out = pieces;
  for (const v of voids) {
    const next = [];
    for (const p of out) {
      next.push({ top: (x) => Math.min(p.top(x), v.f(x)), bot: p.bot });
      next.push({ top: p.top, bot: (x) => Math.max(p.bot(x), v.r(x)) });
    }
    out = next;
  }
  return out;
}

const soilFor = (x) => (x < -6 ? MAT.soilGrass : x < 46 ? MAT.soilTip : x < 330 ? MAT.soil : MAT.soilMoor);

// Merge polygons that touch along vertical column edges into seamless regions: split the
// shared vertical edges at every breakpoint, cancel opposite pairs, and trace what is left
// into outer loops (counter-clockwise) and holes (clockwise).
function mergeRegions(polys) {
  const key = (x, y) => x.toFixed(6) + ',' + y.toFixed(6);
  const edges = [];
  for (let P of polys) {
    let a = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a < 0) P = P.slice().reverse();
    for (let i = 0; i < P.length; i++) edges.push([P[i], P[(i + 1) % P.length]]);
  }
  // split vertical edges at the y of every vertex lying on the same vertical line
  const byX = new Map();
  for (const [p, q] of edges) if (Math.abs(p[0] - q[0]) < 1e-9) { const kx = p[0].toFixed(6); if (!byX.has(kx)) byX.set(kx, []); byX.get(kx).push(p[1], q[1]); }
  const split = [];
  for (const [p, q] of edges) {
    if (Math.abs(p[0] - q[0]) >= 1e-9) { split.push([p, q]); continue; }
    const ys = byX.get(p[0].toFixed(6)).filter((y) => y > Math.min(p[1], q[1]) + 1e-7 && y < Math.max(p[1], q[1]) - 1e-7);
    const uniq = [...new Set(ys.map((y) => y.toFixed(6)))].map(Number).sort((a, b) => (q[1] > p[1] ? a - b : b - a));
    let prev = p;
    for (const y of uniq) { const n = [p[0], y, p[2]]; split.push([prev, n]); prev = n; }
    split.push([prev, q]);
  }
  // cancel opposite pairs
  const count = new Map();
  for (const [p, q] of split) { const k = key(p[0], p[1]) + '>' + key(q[0], q[1]); count.set(k, (count.get(k) || 0) + 1); }
  const out = new Map();
  for (const [p, q] of split) {
    const kf = key(p[0], p[1]) + '>' + key(q[0], q[1]), kr = key(q[0], q[1]) + '>' + key(p[0], p[1]);
    if (count.get(kr)) continue;
    const ks = key(p[0], p[1]);
    if (!out.has(ks)) out.set(ks, []);
    out.get(ks).push([p, q]);
    void kf;
  }
  // trace loops
  const loops = [];
  for (const [ks, list] of out) {
    while (list.length) {
      const loop = [];
      let e = list.pop(), guard = 0;
      const startK = ks;
      loop.push(e[0]);
      while (guard++ < 100000) {
        const nk = key(e[1][0], e[1][1]);
        if (nk === startK) break;
        loop.push(e[1]);
        const nl = out.get(nk);
        if (!nl || !nl.length) break;
        e = nl.pop();
      }
      // drop collinear points
      const L = loop.filter((p, i) => {
        const a = loop[(i + loop.length - 1) % loop.length], b = loop[(i + 1) % loop.length];
        const cr = (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]);
        return Math.abs(cr) > 1e-9 || (a[2] !== p[2]) || (p[2] !== b[2]);
      });
      if (L.length >= 3) loops.push(L);
    }
  }
  const area = (L) => { let a = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const outers = loops.filter((L) => area(L) > 1e-6).map((L) => ({ outer: L, holes: [], a: area(L) }));
  const holes = loops.filter((L) => area(L) < -1e-6);
  const inside = (pt, L) => { let c = false; for (let i = 0, j = L.length - 1; i < L.length; j = i++) { const a = L[i], b = L[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < ((b[0] - a[0]) * (pt[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  for (const H of holes) {
    const c = [H.reduce((s, p) => s + p[0], 0) / H.length, H.reduce((s, p) => s + p[1], 0) / H.length];
    const o = outers.filter((O) => inside(H[0], O.outer) || inside(c, O.outer)).sort((a, b) => a.a - b.a)[0];
    if (o) o.holes.push(H);
  }
  return outers;
}

// Side walls only, for loops already oriented (outer counter-clockwise, holes clockwise).
// Edges along internal band boundaries (both ends tagged 0, not vertical) are skipped.
function sidesF(k, L, z0, z1, m) {
  for (let i = 0; i < L.length; i++) {
    const p = L[i], q = L[(i + 1) % L.length];
    if (!p[2] && !q[2] && Math.abs(p[0] - q[0]) > 1e-6) continue;
    k.quad([p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1], m);
  }
}

// One band (or the fault zone): its region within [xa, xb] between top and bot, minus the voids.
function bandRegions(top, bot, voids, xa, xb, extraEdges, wavy, tagT, tagB) {
  const edges = new Set([xa, xb].concat(extraEdges || []));
  for (const v of voids) { if (v.x0 > xa && v.x0 < xb) edges.add(v.x0); if (v.x1 > xa && v.x1 < xb) edges.add(v.x1); }
  const E = [...edges].sort((a, b) => a - b);
  const polys = [];
  for (let c = 0; c < E.length - 1; c++) {
    const a = E[c], b = E[c + 1];
    if (b - a < 1e-4) continue;
    const act = voids.filter((v) => v.x0 <= a + 1e-6 && v.x1 >= b - 1e-6);
    const sloped = act.some((v) => Math.abs(v.f0 - v.f1) > 1e-6);
    const inFault = b > FAULT.x0 - 1 && a < FAULT.x1 + 1;
    const step = sloped ? 0.5 : inFault ? 1 : wavy ? 4 : 1e9;
    const xs = [a];
    if (step < 1e8) for (let x = Math.ceil((a + 1e-3) / step) * step; x < b - 1e-3; x += step) xs.push(x);
    xs.push(b);
    for (const p of subtract([{ top, bot }], act)) for (const poly of pieceRuns(xs, p.top, p.bot, tagT, tagB)) polys.push(poly);
  }
  return mergeRegions(polys);
}

export function buildRock(k) {
  const nb = BANDS.length;
  for (let i = 0; i < nb; i++) {
    const top = (x) => boundary(i, x) - EPS, bot = (x) => boundary(i + 1, x) + EPS;
    const touches = (v) => {
      for (let t = 0; t <= 8; t++) {
        const x = v.x0 + ((v.x1 - v.x0) * t) / 8;
        if (Math.min(v.f(x), v.r(x)) < top(x) && Math.max(v.f(x), v.r(x)) > bot(x)) return true;
      }
      return false;
    };
    const mine = VOIDS.filter(touches);
    const wavy = i === 0 || BANDS[i].n || (BANDS[i + 1] && BANDS[i + 1].n);
    // Tag polygon vertices: 0 where the outline follows an internal band boundary (never seen
    // in the deep rock), 1 where it meets air (a void or the ground).
    const tagT = (x, y) => (i === 0 || Math.abs(y - top(x)) > 1e-5 ? 1 : 0);
    const tagB = (x, y) => (i === nb - 1 || Math.abs(y - bot(x)) > 1e-5 ? 1 : 0);
    // The soil band changes its surface material (garden, tip, yard, moor) along x.
    const spans = i === 0 ? [[X0, -6, MAT.soilGrass], [-6, 46, MAT.soilTip], [46, 330, MAT.soil], [330, X1, MAT.soilMoor]] : [[X0, X1, BANDS[i].m]];
    for (const [xa, xb, m] of spans) {
      const xa2 = xa === X0 ? xa : xa + EPS, xb2 = xb === X1 ? xb : xb - EPS;
      for (const R of bandRegions(top, bot, mine.filter((v) => v.x1 > xa2 && v.x0 < xb2), xa2, xb2, [], wavy, tagT, tagB)) {
        // A thin skin at the cut (its back face is the hatched section) and the deep rock behind.
        k.extrude(R.outer, -1, SKIN, m, { front: false, holes: R.holes });
        sidesF(k, R.outer, SKIN + 0.012, ZR, m);
        for (const H of R.holes) sidesF(k, H, SKIN + 0.012, ZR, m);
      }
    }
    // Backfill behind shallow voids: the rock beyond the back wall of each opening.
    for (const v of mine) {
      if (v.fault) continue;
      const deeper = mine.filter((u) => u !== v && u.d > v.d && u.x1 > v.x0 && u.x0 < v.x1);
      const ftop = (x) => Math.min(top(x), v.r(x) - EPS), fbot = (x) => Math.max(bot(x), v.f(x) + EPS);
      for (const R of bandRegions(ftop, fbot, deeper, v.x0 + EPS, v.x1 - EPS, [], wavy)) k.extrude(R.outer, v.d, ZR - 0.02, i === 0 ? MAT.soil : BANDS[i].m, { holes: R.holes });
    }
  }
  // The fault zone: crushed, broken rock, with the return airway driven through it.
  const F = VOIDS.find((v) => v.fault);
  const others = VOIDS.filter((v) => !v.fault && v.x1 > F.x0 && v.x0 < F.x1);
  for (const R of bandRegions(() => F.r0 - EPS, () => F.f0 + EPS, others, F.x0 + EPS, F.x1 - EPS, [], false)) {
    k.extrude(R.outer, -1, SKIN, MAT.breccia, { front: false, holes: R.holes });
    k.extrude(R.outer, SKIN + 0.012, ZR, MAT.breccia, { front: false, back: false, holes: R.holes });
  }
  for (const v of others) for (const R of bandRegions((x) => v.r(x) - EPS, (x) => v.f(x) + EPS, [], Math.max(F.x0, v.x0) + EPS, Math.min(F.x1, v.x1) - EPS, [], false)) k.extrude(R.outer, v.d, ZR - 0.02, MAT.breccia);
}

// Section skins across the block at the slice positions: thin slabs of each band, so a slice
// there shows the strata as a flat hatched face instead of looking into the hollow deep rock.
export const SLICE_STEP = 20;
export function buildSliceSkins(k, extra) {
  const xs = new Set(extra || []);
  for (let x = Math.ceil(X0 / SLICE_STEP) * SLICE_STEP; x < X1; x += SLICE_STEP) xs.add(x);
  const W = 0.22;
  const nb = BANDS.length;
  const F = VOIDS.find((v) => v.fault);
  for (const c of xs) {
    const xa = c - W, xb = c + W;
    for (let i = 0; i < nb; i++) {
      const top = (x) => boundary(i, x) - EPS, bot = (x) => boundary(i + 1, x) + EPS;
      const vs = VOIDS.filter((v) => v.x1 > xa && v.x0 < xb);
      const m = i === 0 ? (c < -6 ? MAT.soilGrass : c < 46 ? MAT.soilTip : c < 330 ? MAT.soil : MAT.soilMoor) : BANDS[i].m;
      for (const R of bandRegions(top, bot, vs, xa, xb, [], true)) k.extrude(R.outer, SKIN + 0.03, ZR - 0.03, m, { front: false, holes: R.holes });
      // the rock behind each shallow opening
      for (const v of vs) {
        if (v.fault) continue;
        const deeper = vs.filter((u) => u !== v && u.d > v.d);
        const ftop = (x) => Math.min(top(x), v.r(x) - EPS), fbot = (x) => Math.max(bot(x), v.f(x) + EPS);
        for (const R of bandRegions(ftop, fbot, deeper, Math.max(xa, v.x0 + EPS), Math.min(xb, v.x1 - EPS), [], true)) k.extrude(R.outer, v.d + 0.03, ZR - 0.05, m, { front: false, holes: R.holes });
      }
    }
    if (c + W > F.x0 && c - W < F.x1) {
      const others = VOIDS.filter((v) => !v.fault && v.x1 > xa && v.x0 < xb);
      for (const R of bandRegions(() => F.r0 - EPS, () => F.f0 + EPS, others, Math.max(xa, F.x0 + EPS), Math.min(xb, F.x1 - EPS), [], false)) k.extrude(R.outer, SKIN + 0.03, ZR - 0.03, MAT.breccia, { front: false, holes: R.holes });
    }
  }
}

// ------------------------------------------------------------------ the land behind the cut
const hill = (x, z, hx, hz, h, s) => h * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (s * s));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
// The hillside behind the colliery rises gently to the town and the moor; far hills ring the valley.
export function terrainH(x, z) {
  const xc = clamp(x, X0, X1);
  let y = ground(xc);
  const t = smooth(ZR, 200, z);
  y += t * 30 + (XS.noise1(x * 0.02 + z * 0.013, 4) - 0.5) * 6 * t;
  y += hill(x, z, 420, 220, 26, 130) + hill(x, z, -70, 260, 34, 150) + hill(x, z, 170, 420, 60, 220);
  return y;
}
function farH(x, z) {
  const inside = x >= X0 - 4 && x <= X1 + 4;
  let y = terrainH(x, z) + smooth(170, 600, z) * 40;
  y += hill(x, z, -320, 420, 80, 190) + hill(x, z, 700, 380, 95, 200) + hill(x, z, 220, 640, 120, 260) + (XS.noise1(x * 0.006 + z * 0.004, 9) - 0.5) * 30 * smooth(200, 500, z);
  if (!inside) y -= 70 * (1 - smooth(170, 330, z)) * smooth(0, 40, Math.max(X0 - x, x - X1));
  return y;
}

const land = {
  grass: mat({ c: '#7e8a54', c2: '#6a7644', pat: 'speckle', noEdge: true }),
  grass2: mat({ c: '#8a9058', c2: '#76804a', pat: 'speckle', noEdge: true }),
  bracken: mat({ c: '#9a6634', c2: '#7e5028', pat: 'speckle', noEdge: true }),
  moor: mat({ c: '#86764c', c2: '#6e6240', pat: 'speckle', noEdge: true }),
  cinder: mat({ c: '#4e4842', c2: '#3a3632', pat: 'speckle', noEdge: true }),
  far: mat({ c: '#8a9070', c2: '#7a8064', pat: 'speckle', noEdge: true }),
  far2: mat({ c: '#98886a', c2: '#867658', pat: 'speckle', noEdge: true }),
  wall: mat({ c: '#8a8478', c2: '#7a7468', pat: 'stone', s: 0.3 }),
};
function landMat(x, z) {
  const n = XS.noise1(x * 0.018 + z * 0.027, 11), n2 = XS.noise1(x * 0.05 - z * 0.04, 13);
  if (z < 95 && x > 46 && x < 330 && n2 < 0.6) return land.cinder;
  if (x > 345 || z > 150) return n > 0.5 ? land.bracken : land.moor;
  return n > 0.62 ? land.bracken : n2 > 0.5 ? land.grass2 : land.grass;
}

// A heightfield with smooth normals, one material per quad.
function field(k, xs, zs, hf, mf, skip) {
  const H = zs.map((z) => xs.map((x) => hf(x, z)));
  const N = (i, j) => {
    const i0 = Math.max(0, i - 1), i1 = Math.min(xs.length - 1, i + 1), j0 = Math.max(0, j - 1), j1 = Math.min(zs.length - 1, j + 1);
    const dx = (H[j][i1] - H[j][i0]) / (xs[i1] - xs[i0]), dz = (H[j1][i] - H[j0][i]) / (zs[j1] - zs[j0]);
    const l = Math.hypot(dx, 1, dz);
    return [-dx / l, 1 / l, -dz / l];
  };
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    if (skip && skip(xs[i], xs[i + 1], zs[j], zs[j + 1])) continue;
    const a = [xs[i], H[j][i], zs[j]], b = [xs[i + 1], H[j][i + 1], zs[j]], c = [xs[i + 1], H[j + 1][i + 1], zs[j + 1]], d = [xs[i], H[j + 1][i], zs[j + 1]];
    const m = mf((a[0] + c[0]) / 2, (a[2] + c[2]) / 2);
    k.tri(a, d, c, m, N(i, j), N(i, j + 1), N(i + 1, j + 1));
    k.tri(a, c, b, m, N(i, j), N(i + 1, j + 1), N(i + 1, j));
  }
  return H;
}

export function buildLand(k) {
  // Hillside behind the block, as wide as the block, with skirts at its ends.
  const zs = [];
  for (let z = ZR; z < 170; z += 6) zs.push(z);
  zs.push(170);
  const xs = [];
  for (let x = X0; x < X1; x += 6) xs.push(x);
  xs.push(X1);
  const H = field(k, xs, zs, terrainH, landMat);
  const skirt = MAT.mud;
  for (let j = 0; j < zs.length - 1; j++) {
    for (const [i, s] of [[0, -1], [xs.length - 1, 1]]) {
      const p = [xs[i], H[j][i], zs[j]], q = [xs[i], H[j + 1][i], zs[j + 1]];
      if (s < 0) k.quad([p[0], BOTTOM, p[2]], [q[0], BOTTOM, q[2]], q, p, skirt);
      else k.quad([p[0], BOTTOM, p[2]], p, q, [q[0], BOTTOM, q[2]], skirt);
    }
  }
  // Dry-stone field walls running up the hillside, and a lane.
  const r = k.rng('walls');
  for (let w = 0; w < 9; w++) {
    const x0 = -20 + w * 52 + r() * 20;
    if (x0 > X1 - 10) break;
    let px = x0, pz = 66;
    for (let s = 0; s < 14; s++) {
      const nx = px + (r() - 0.5) * 6, nz = pz + 7.5;
      if (nx < X0 + 2 || nx > X1 - 2 || nz > 168) break;
      const ya = terrainH(px, pz), yb = terrainH(nx, nz);
      k.beam([px, ya + 0.35, pz], [nx, yb + 0.35, nz], 0.6, land.wall);
      px = nx; pz = nz;
    }
  }
  for (let z = 72; z < 168; z += 24 + r() * 10) {
    let px = X0 + 4;
    for (let x = X0 + 4; x < X1 - 4; x += 8) { const nx = Math.min(X1 - 4, x + 8); if (r() < 0.82) k.beam([px, terrainH(px, z) + 0.35, z], [nx, terrainH(nx, z) + 0.35, z], 0.55, land.wall); px = nx; }
  }
  // Distant hills ringing the valley, soft and hazy.
  const fz = [170, 190, 215, 245, 285, 335, 400, 480, 580, 700];
  const fx = [];
  for (let x = -700; x <= 1150; x += 25) fx.push(x);
  const farMat = (x, z) => (XS.noise1(x * 0.008 + z * 0.006, 2) > 0.55 ? land.far2 : land.far);
  field(k, fx, fz, farH, farMat, (xa, xb, za) => za < 171 && xa >= X0 - 25 && xb <= X1 + 25 && false);
}
