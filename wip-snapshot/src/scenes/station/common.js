/* The Space Station: shared materials, constants and geometry helpers.
 *
 * Modules are hollow pressure shells: a ring profile in the depth-height plane lofted
 * along the module axis. The profile runs a little past the cut plane (z < 0) so the
 * cutaway shows a hatched cut face through the hull. See station.js for the layout.
 */
import { mat, shade } from '../../engine/index.js';

export const TAU = Math.PI * 2;

// ------------------------------------------------------------------ orbital light
// The station circles the Earth about every 91.5 minutes (derived in the dossier); the sun
// therefore rises and sets every orbit, independent of the GMT crew clock. Phase 0 is
// orbital sunrise; DAYF of the orbit is sunlit (about 55 of 91.5 minutes).
export const ORBIT_MIN = 91.5;
export const DAYF = 0.61;
export const PHASE0 = 0.27; // chosen so 11:00 GMT falls in sunlight and 22:00 GMT in darkness
export const orbitPhase = (hour) => { const v = (hour * 60) / ORBIT_MIN + PHASE0; return v - Math.floor(v); };

// ------------------------------------------------------------------ materials
export const M = {
  // Exterior blankets of the US and European modules (off-white, panelled).
  hullUS: mat({ c: '#e8e3d4', c2: '#d6d0bf', pat: 'panels', s: 1.15, cut: '#46506a' }),
  hullEU: mat({ c: '#e4e2d8', c2: '#cfcfc4', pat: 'panels', s: 0.95, cut: '#46506a' }),
  hullJP: mat({ c: '#ebe6d6', c2: '#d8d2bf', pat: 'panels', s: 1.3, cut: '#46506a' }),
  hullRU: mat({ c: '#d9dccf', c2: '#c3c8b6', pat: 'panels', s: 0.8, cut: '#4a5446' }),
  hullPMA: mat({ c: '#dcd6c4', c2: '#c4bca6', pat: 'quilt', s: 0.55, cut: '#46506a' }),
  // Interiors.
  rack: mat({ c: '#ebe7dc', c2: '#cfcabc', pat: 'panels', s: 1.05, cut: '#8a8a82' }),
  rackDark: mat({ c: '#c9c6bc', c2: '#aeab9f', pat: 'panels', s: 0.52, cut: '#7a7a72' }),
  standoff: mat({ c: '#8f939a', c2: '#757980', pat: 'grate', cut: '#5a5e66' }),
  bulk: mat({ c: '#dedad0', c2: '#c8c4b8', pat: 'rivets', s: 0.5, cut: '#6a6e78' }),
  ruWall: mat({ c: '#c4d2b2', c2: '#aebd9c', pat: 'panels', s: 0.62, cut: '#6a7462' }),
  ruFloor: mat({ c: '#e6dcc0', c2: '#cfc4a6', pat: 'panels', s: 0.55, cut: '#7a7462' }),
  ruCeil: mat({ c: '#ece6d2', c2: '#d8d0b8', pat: 'panels', s: 0.7, cut: '#7a7462' }),
  bag: mat({ c: '#e6dfcc', c2: '#cfc6ae', pat: 'canvas', s: 0.25, cut: '#9a927c' }),
  bagB: mat({ c: '#d8ccaa', c2: '#c0b28c', pat: 'canvas', s: 0.25, cut: '#8a7e64' }),
  rail: mat({ c: '#9eacbc', cut: '#5a6470' }),
  screen: mat({ c: '#1e2630', c2: '#7ab0d8', glow: 'always' }),
  screenNight: mat({ c: '#24303c', c2: '#8cc0e0', glow: 'night' }),
  laptop: mat({ c: '#2a2a2e', cut: '#1a1a1e' }),
  light: mat({ c: '#e4e8e6', c2: '#f2f6ff', glow: 'night', noEdge: true }),
  steel: mat({ c: '#8a9098', c2: '#70767e', cut: '#4a4e56' }),
  alu: mat({ c: '#b8bec6', c2: '#9aa0a8', cut: '#5a6068' }),
  gold: mat({ c: '#c9a04a', c2: '#a8802e', pat: 'quilt', s: 0.4, cut: '#7a5a20' }),
  black: mat({ c: '#24242a', cut: '#18181c' }),
  white: mat({ c: '#f0eee6', cut: '#9a9890' }),
  velcro: mat({ c: '#e8e0c8', cut: '#9a927c' }),
  red: mat({ c: '#b84a32', cut: '#7a2e20' }),
  blue: mat({ c: '#3a5a8a', cut: '#24385a' }),
  green: mat({ c: '#5a8a4a', cut: '#3a5a30' }),
  // Truss and outside.
  truss: mat({ c: '#c9ccd0', c2: '#a9adb2', cut: '#6a6e74' }),
  trussDark: mat({ c: '#9aa0a6', cut: '#5a5e64' }),
  wingCells: mat({ c: '#b4843e', c2: '#7a5226', pat: 'tiles', s: 0.62, whole: true, cut: '#5a3a18' }),
  wingFrame: mat({ c: '#d8d4c8', whole: true }),
  wingBox: mat({ c: '#e8e4d8', whole: true }),
  radiator: mat({ c: '#f2f0ea', c2: '#dcdad2', pat: 'stripes', s: 0.45, whole: true }),
  ruCells: mat({ c: '#2e3f6a', c2: '#20305a', pat: 'tiles', s: 0.5, whole: true }),
  atvCells: mat({ c: '#2a3658', c2: '#1c2644', pat: 'tiles', s: 0.55, whole: true }),
  // Shuttle orbiter.
  tilesBlack: mat({ c: '#28282c', c2: '#1e1e22', pat: 'tiles', s: 0.2, cut: '#3a4048' }),
  tilesWhite: mat({ c: '#efeee6', c2: '#dcdad0', pat: 'tiles', s: 0.3, cut: '#3a4048' }),
  rcc: mat({ c: '#4a4a4e', cut: '#2a2a2e' }),
  bayLiner: mat({ c: '#d6d6cc', c2: '#c2c2b6', pat: 'panels', s: 1.2, cut: '#3a4048' }),
  doorRad: mat({ c: '#f2f2ec', c2: '#d8dad6', pat: 'stripes', s: 0.3, cut: '#3a4048', whole: true }),
  cabin: mat({ c: '#c8c8c0', c2: '#b0b0a6', pat: 'panels', s: 0.45, cut: '#3a4048' }),
  locker: mat({ c: '#d8d6cc', c2: '#bab8ac', pat: 'tiles', s: 0.45, cut: '#6a6a62' }),
  // Russian vehicles.
  soyuz: mat({ c: '#8e9a7c', c2: '#76826a', pat: 'quilt', s: 0.35, cut: '#4a5440' }),
  soyuzDM: mat({ c: '#6e6a58', c2: '#5a5646', pat: 'speckle', cut: '#3e3a2e' }),
  soyuzIM: mat({ c: '#c8ccc0', c2: '#b0b4a8', pat: 'panels', s: 0.6, cut: '#4a5440' }),
  atv: mat({ c: '#e6e4dc', c2: '#cfccc2', pat: 'panels', s: 1.0, cut: '#46506a' }),
  atvGold: mat({ c: '#c8a24e', c2: '#a68434', pat: 'quilt', s: 0.5, cut: '#6a5420' }),
};

// ------------------------------------------------------------------ geometry helpers
// A ring section [[z, y], ...] (outer arc, then inner arc back) about the axis (y = yc, z = 0),
// covering the far half plus a margin past the cut so the cut shows the hull's section.
export function ringPts(rOut, rIn, yc = 0, n = 14, margin = 0.32) {
  const a0 = -Math.PI / 2 - margin, a1 = Math.PI / 2 + margin;
  const out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * rOut, yc + Math.sin(a) * rOut]); }
  for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * rIn, yc + Math.sin(a) * rIn]); }
  return out;
}

// A hollow shell along x: prof = [[x, rOut, rIn], ...] ascending in x.
export function shellX(k, prof, yc, m, n = 14) {
  k.loft(prof.map(([x, ro, ri]) => ({ x, pts: ringPts(ro, Math.max(0.02, ri), yc, n) })), m);
}

// A hollow vertical shell about a vertical axis at (cx, cz = 0): prof = [[y, rOut, rIn], ...].
export function shellY(k, prof, cx, m, opt = {}) {
  const pts = [];
  for (const [y, ro] of prof) pts.push([ro, y]);
  for (let i = prof.length - 1; i >= 0; i--) pts.push([Math.max(0.02, prof[i][2]), prof[i][0]]);
  pts.push(pts[0]);
  k.lathe(pts, cx, 0, m, { seg: opt.seg || 18, a0: -0.3, a1: Math.PI + 0.3, capTop: false, capBot: false });
}

// A general loft through closed 3D rings (same point count), with end caps.
export function loftRings(k, rings, m, opt = {}) {
  const n = rings[0].length;
  for (let s = 0; s < rings.length - 1; s++) {
    const A = rings[s], B = rings[s + 1];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mm = opt.matFn ? opt.matFn(s, i) : m;
      if (!mm) continue;
      if (opt.flip) k.quad(A[i], A[j], B[j], B[i], mm); else k.quad(A[i], B[i], B[j], A[j], mm);
    }
  }
  if (opt.caps !== false) {
    const cen = (R) => { const c = [0, 0, 0]; for (const p of R) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; } return c.map((v) => v / R.length); };
    const c0 = cen(rings[0]), c1 = cen(rings[1]), cl = cen(rings[rings.length - 1]), cp = cen(rings[rings.length - 2]);
    const dir = (a, b) => { const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; const l = Math.hypot(...d) || 1; return d.map((v) => v / l); };
    k.poly(rings[0].slice(), opt.cap || m, 1, dir(c0, c1));
    k.poly(rings[rings.length - 1].slice(), opt.cap || m, 1, dir(cl, cp));
  }
}

// An ellipse-ish blob seen from the side (a plush toy, a water drop) as a sphere.
export const blob = (k, x, y, z, r, m) => k.sphere(x, y, z, r, m, { seg: 8, rings: 5 });

// A US-style rack interior for a horizontal module: aisle half-size a, inner hull radius ri.
// Returns helpers for placing things on the back wall, overhead and deck.
// Split [x0, x1] around gaps [[a, b], ...].
export function spans(x0, x1, gaps = []) {
  const out = [];
  let s = x0;
  for (const [a, b] of gaps.slice().sort((p, q) => p[0] - q[0])) { if (a > s) out.push([s, a]); s = Math.max(s, b); }
  if (s < x1) out.push([s, x1]);
  return out;
}

export function rackInterior(k, x0, x1, yc, opt = {}) {
  const a = opt.a || 1.05, ri = opt.ri || 1.98, near = -0.5;
  const RK = opt.rack || M.rack;
  const e = Math.sqrt(ri * ri - a * a) - 0.02;
  const g = opt.gaps || {};
  for (const [p, q] of spans(x0, x1, g.deck)) k.box(p, yc - e, near, q, yc - a, a, opt.deck || RK, { shadeBot: 0.8 }); // deck row
  for (const [p, q] of spans(x0, x1, g.over)) k.box(p, yc + a, near, q, yc + e, a, opt.over || RK); // overhead row
  for (const [p, q] of spans(x0, x1, g.back)) k.box(p, yc - a, a, q, yc + a, e, opt.back || RK, { shadeBot: 0.85 }); // back (starboard) row
  // Corner standoffs: wedges between the rack rows and the hull, carrying ducts and cables.
  const wedge = (sy) => {
    const p = [[a, yc + sy * a], [e, yc + sy * a]];
    const t0 = Math.atan2(sy * a, e), t1 = Math.atan2(sy * e, a);
    for (let i = 1; i < 5; i++) { const t = t0 + ((t1 - t0) * i) / 5; p.push([Math.cos(t) * ri * 0.99, yc + Math.sin(t) * ri * 0.99]); }
    p.push([a, yc + sy * e]);
    k.extrudeX(p, x0, x1, opt.standoff || M.standoff);
  };
  wedge(1); wedge(-1);
  // Near-side standoffs (cut through): the far edge of the port wall's rack row.
  return { a, e, yc, x0, x1 };
}

// A rack front: an inset panel on the back wall (face towards -z) with a material and details.
export function rackFace(k, x, y0, y1, zWall, m, w = 1.0) {
  k.box(x - w / 2 + 0.03, y0 + 0.04, zWall - 0.04, x + w / 2 - 0.03, y1 - 0.04, zWall, m);
}

// A laptop on a swing arm, facing the viewer; screen glows at night.
export function laptop(k, x, y, z, open = true) {
  k.box(x - 0.17, y - 0.01, z, x + 0.17, y + 0.015, z + 0.24, M.laptop);
  if (open) {
    k.boxR(x, y + 0.12, z + 0.25, 0.34, 0.24, 0.015, M.laptop, { x: -0.25 });
    k.boxR(x, y + 0.12, z + 0.24, 0.3, 0.2, 0.006, M.screen, { x: -0.25 });
  }
  k.beam([x, y - 0.01, z + 0.2], [x, y - 0.2, z + 0.55], 0.03, M.steel);
}

// A fluorescent light bar along x (overhead corner), glowing at night, with its lamp.
export function lightBar(k, x0, x1, y, z, opt = {}) {
  k.box(x0, y - 0.05, z - 0.08, x1, y + 0.02, z + 0.08, M.light);
  const n = Math.max(1, Math.round((x1 - x0) / (opt.every || 2.6)));
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + 0.5) * (x1 - x0)) / n;
    k.lamp(x, y - 0.2, z, { color: opt.color || '#e8eeff', r: opt.r || 3.2, i: opt.i != null ? opt.i : 0.85, bulb: false, halo: opt.halo != null ? opt.halo : 1.0 });
  }
}

// Handrail along x on a wall: a tube with two standoffs.
export function handrail(k, x0, x1, y, z, m = M.rail) {
  k.cyl(x0, y, z, 0.018, x1 - x0, m, { axis: 'x', seg: 6 });
  for (const x of [x0 + 0.05, x1 - 0.05]) k.box(x - 0.015, y - 0.015, z, x + 0.015, y + 0.015, z + 0.07, m);
}

// A stowage bag (cargo transfer bag) as a soft box.
export function ctb(k, x, y, z, w = 0.5, h = 0.3, d = 0.4, m = M.bag) {
  k.box(x - w / 2, y, z, x + w / 2, y + h, z + d, m);
  k.box(x - w / 2 + 0.06, y + h, z + d * 0.3, x + w / 2 - 0.06, y + h + 0.02, z + d * 0.7, shadeM(m));
}
const shadeCache = new Map();
function shadeM(m) {
  let v = shadeCache.get(m);
  if (!v) { v = mat({ c: shade(m.hex, -0.15) }); shadeCache.set(m, v); }
  return v;
}

// Round hatch frame in a wall facing the viewer (on the back wall at depth z).
export function hatchRing(k, x, y, z, r = 0.42, m = M.alu) {
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    k.beam([x + Math.cos(a0) * r, y + Math.sin(a0) * r, z - 0.03], [x + Math.cos(a1) * r, y + Math.sin(a1) * r, z - 0.03], 0.07, m);
  }
  k.cyl(x, y, z - 0.012, r - 0.04, 0.012, M.black, { axis: 'z', seg: 16 });
}
// Square hatch frame (US CBM hatch) on the back wall.
export function hatchSquare(k, x, y, z, s = 1.27, m = M.alu) {
  const h = s / 2;
  k.box(x - h - 0.06, y - h - 0.06, z - 0.05, x + h + 0.06, y - h, z, m);
  k.box(x - h - 0.06, y + h, z - 0.05, x + h + 0.06, y + h + 0.06, z, m);
  k.box(x - h - 0.06, y - h, z - 0.05, x - h, y + h, z, m);
  k.box(x + h, y - h, z - 0.05, x + h + 0.06, y + h, z, m);
  k.box(x - h, y - h, z - 0.012, x + h, y + h, z, mat({ c: '#3a3e46' }));
}

// A bulkhead across a module at x with a square hatch opening (aisle half-size a).
export function bulkhead(k, x, yc, a = 1.05, hatch = 0.64, t = 0.1, m = M.bulk) {
  k.box(x - t / 2, yc - a, -0.5, x + t / 2, yc - hatch, a, m);
  k.box(x - t / 2, yc + hatch, -0.5, x + t / 2, yc + a, a, m);
  k.box(x - t / 2, yc - hatch, hatch, x + t / 2, yc + hatch, a, m);
}

// Truss lattice: a box-section beam frame between x0..x1 (or along z), section w x h.
// axis 'x' (Panel B) or 'z' (Panel A). Bays every `bay` metres with diagonals.
export function lattice(k, axis, s0, s1, c1, c2, w, h, m, bay = 2.3, opt = {}) {
  // c1, c2: section centre (y, and the other horizontal coordinate).
  const P = (s, u, v) => (axis === 'x' ? [s, c1 + v, c2 + u] : [c2 + u, c1 + v, s]);
  const hw = w / 2, hh = h / 2;
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  const t = opt.t || 0.16;
  for (const [u, v] of corners) k.beam(P(s0, u, v), P(s1, u, v), t, m);
  const n = Math.max(1, Math.round((s1 - s0) / bay));
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    for (let c = 0; c < 4; c++) { const [u0, v0] = corners[c], [u1, v1] = corners[(c + 1) % 4]; k.beam(P(s, u0, v0), P(s, u1, v1), t * 0.8, m); }
    if (i < n) {
      const sn = s0 + ((s1 - s0) * (i + 1)) / n;
      for (let c = 0; c < 4; c++) {
        const [u0, v0] = corners[c], [u1, v1] = corners[(c + 1) % 4];
        if (i % 2) k.beam(P(s, u0, v0), P(sn, u1, v1), t * 0.6, m); else k.beam(P(s, u1, v1), P(sn, u0, v0), t * 0.6, m);
      }
    }
  }
}

// Everyday clutter on a US-style module's rack faces: Velcro patches, labels, cables in loose arcs,
// bungee straps with checklists and small packets held on them. Seeded, so it never changes.
const CLUT = ['#e8e0c8', '#d8d0b8', '#f4f2ea', '#c84a3a', '#3a6a9a', '#e8c040', '#6a9a5a'];
export function clutter(k, x0, x1, yc, seed, opt = {}) {
  const r = k.rng(seed);
  const a = opt.a || 1.05, zb = opt.zb || a - 0.005;
  const n = Math.round((x1 - x0) * 2.2);
  for (let i = 0; i < n; i++) {
    const x = x0 + 0.2 + r() * (x1 - x0 - 0.4), y = yc - a + 0.15 + r() * (2 * a - 0.3);
    const w = 0.05 + r() * 0.12, h = 0.04 + r() * 0.1;
    k.box(x - w / 2, y - h / 2, zb - 0.012, x + w / 2, y + h / 2, zb, mat(CLUT[Math.floor(r() * 3)]));
  }
  // Bungee straps across the back wall, with things tucked under them.
  for (let i = 0; i < Math.max(1, Math.round((x1 - x0) / 2.4)); i++) {
    const x = x0 + 0.5 + r() * (x1 - x0 - 1.0), y = yc - 0.3 + r() * 0.9;
    k.box(x - 0.5, y - 0.012, zb - 0.02, x + 0.5, y + 0.012, zb, mat('#2a2a30'));
    for (let j = 0; j < 3; j++) {
      const px = x - 0.35 + j * 0.33 + r() * 0.05, c = CLUT[2 + Math.floor(r() * 5)];
      k.box(px - 0.06, y - 0.12, zb - 0.035, px + 0.06, y + 0.1, zb - 0.015, mat(c));
    }
  }
  // Cables and hoses in loose arcs on the back wall (nothing sags without gravity).
  for (let i = 0; i < Math.max(1, Math.round((x1 - x0) / 3)); i++) {
    const xa = x0 + 0.3 + r() * (x1 - x0 - 1.6), xb = xa + 0.6 + r() * 1.0, y = yc - 0.6 + r() * 1.2, bulge = 0.12 + r() * 0.2;
    const pts = [];
    for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push([xa + (xb - xa) * t, y + Math.sin(t * Math.PI) * bulge, zb - 0.04 - Math.sin(t * Math.PI) * 0.12]); }
    k.tube(pts, 0.012, mat(r() < 0.5 ? '#2a2a30' : '#d8d4c8'), { seg: 4 });
  }
  // Packets and bags Velcroed to the overhead.
  if (opt.over !== false) for (let i = 0; i < Math.round((x1 - x0) * 0.8); i++) {
    const x = x0 + 0.3 + r() * (x1 - x0 - 0.6), z = 0.15 + r() * 0.75;
    const c = CLUT[Math.floor(r() * CLUT.length)];
    k.box(x - 0.07, yc + a - 0.06, z - 0.05, x + 0.07, yc + a, z + 0.05, mat(c));
  }
}
