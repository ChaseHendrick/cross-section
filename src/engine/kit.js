/* The Kit: builds a scene's static 3D geometry, batched into a handful of meshes.
 *
 * Scene code calls kit primitives with SCENE coordinates (x along the subject,
 * y up, z = depth behind the cut). The stage puts every mesh under a root group
 * mirrored in z, so scene coordinates are also the local coordinates of anything
 * a scene animates.
 *
 * Materials are small specs, interned by mat():
 *   { c: '#hex' base colour, c2: second colour (pattern or night glow), cut: colour of the cut face,
 *     pat: 'planks'|'brick'|... (see PAT), s: pattern scale, whole: ignore the cutaway,
 *     thin: two-sided sheet (sails, flags), glow: 'night'|'always', noEdge: no ink outline }
 * A bare '#hex' string is shorthand for { c: '#hex' }.
 *
 * Solids are closed so a cut shows their inside as a hatched cut face. Rooms are
 * built from slabs with thickness for the same reason.
 */
import * as THREE from 'three';
import { XS, h01, hash, rng, toRgb, shade } from './core.js';
import { PAT, F, inkMaterial, overlayMaterial } from './materials.js';

const TAU = Math.PI * 2;

class Batch {
  constructor(overlay = false) {
    this.overlay = overlay;
    this.n = 0;
    this.cap = 4096;
    this.pos = new Float32Array(this.cap * 3);
    this.nrm = new Float32Array(this.cap * 3);
    this.col = new Uint8Array(this.cap * 3);
    if (!overlay) {
      this.col2 = new Uint8Array(this.cap * 3);
      this.cut = new Uint8Array(this.cap * 3);
      this.pat = new Float32Array(this.cap * 4);
      this.shd = new Uint8Array(this.cap * 3);
    } else {
      this.ov = new Float32Array(this.cap * 4);
    }
  }
  grow(need) {
    if (this.n + need <= this.cap) return;
    let c = this.cap;
    while (this.n + need > c) c *= 2;
    const g = (a, k) => { const b = new a.constructor(c * k); b.set(a); return b; };
    this.pos = g(this.pos, 3); this.nrm = g(this.nrm, 3); this.col = g(this.col, 3);
    if (!this.overlay) { this.col2 = g(this.col2, 3); this.cut = g(this.cut, 3); this.pat = g(this.pat, 4); this.shd = g(this.shd, 3); }
    else this.ov = g(this.ov, 4);
    this.cap = c;
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    const n = this.n;
    g.setAttribute('position', new THREE.BufferAttribute(this.pos.slice(0, n * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nrm.slice(0, n * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col.slice(0, n * 3), 3, true));
    if (!this.overlay) {
      g.setAttribute('color2', new THREE.BufferAttribute(this.col2.slice(0, n * 3), 3, true));
      g.setAttribute('cutc', new THREE.BufferAttribute(this.cut.slice(0, n * 3), 3, true));
      g.setAttribute('pat', new THREE.BufferAttribute(this.pat.slice(0, n * 4), 4));
      g.setAttribute('shadeC', new THREE.BufferAttribute(this.shd.slice(0, n * 3), 3, true));
    } else {
      g.setAttribute('ov', new THREE.BufferAttribute(this.ov.slice(0, n * 4), 4));
    }
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

// ------------------------------------------------------------------ material specs
const matCache = new Map();
let matSerial = 1;
export function mat(spec) {
  if (spec && spec._m) return spec;
  if (typeof spec === 'string') spec = { c: spec };
  const key = JSON.stringify(spec);
  let m = matCache.get(key);
  if (m) return m;
  const c = toRgb(spec.c || '#c8b89a');
  const c2 = toRgb(spec.c2 || shade(spec.c || '#c8b89a', -0.25));
  const cut = toRgb(spec.cut || shade(spec.c || '#c8b89a', -0.55));
  let flags = 0;
  if (spec.whole) flags |= F.WHOLE;
  if (spec.thin) flags |= F.THIN;
  if (spec.glow === 'night') flags |= F.GLOW_NIGHT;
  if (spec.glow === 'always') flags |= F.GLOW;
  if (spec.noEdge) flags |= F.NOEDGE;
  if (spec.plainCut) flags |= F.NOCUT_HATCH;
  if (spec.cutPat) flags |= F.CUT_PAT;
  m = {
    _m: true, c, c2, cut, flags,
    pat: PAT[spec.pat || 'none'] || 0, s: spec.s || 0,
    id: spec.id != null ? spec.id : ((matSerial++ * 0.61803398875) % 1) * 0.98 + 0.01,
    alpha: spec.alpha != null ? spec.alpha : 0.35,
    soft: spec.soft || 0,
    hex: spec.c || '#c8b89a',
  };
  matCache.set(key, m);
  return m;
}

// ------------------------------------------------------------------ the kit
export class Kit {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.chunk = opts.chunk || scene.chunk || 30;
    this.solid = new Map(); // chunk index -> Batch
    this.over = new Map();
    this.lamps = [];
    this.labels = [];
    this.parts = [];
    this.seed = hash(scene && scene.id ? scene.id : 'scene');
    this.tint = 1; // current per-vertex shade multiplier
    this.whole = false;
    this.local = opts.local || false;
    this.tris = 0;
  }
  rng(salt) { return rng(hash(this.seed, salt || 0)); }
  mat(spec) { return mat(spec); }

  _batch(map, x, overlay) {
    const k = this.local ? 0 : Math.floor(x / this.chunk);
    let b = map.get(k);
    if (!b) { b = new Batch(overlay); map.set(k, b); }
    return b;
  }

  // ------------------------------------------------------------ raw triangles
  // Triangle with optional per-vertex normals (n0..n2) and shades (s0..s2).
  tri(a, b, c, m, n0, n1, n2, s0 = 1, s1 = 1, s2 = 1) {
    m = mat(m);
    let fn = null;
    if (!n0) {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const l = Math.hypot(nx, ny, nz);
      if (l < 1e-12) return;
      fn = [nx / l, ny / l, nz / l];
    }
    const B = this._batch(this.solid, (a[0] + b[0] + c[0]) / 3, false);
    B.grow(3);
    const t = this.tint;
    const flags = m.flags | (this.whole ? F.WHOLE : 0);
    const put = (p, n, s) => {
      const i = B.n++;
      B.pos[i * 3] = p[0]; B.pos[i * 3 + 1] = p[1]; B.pos[i * 3 + 2] = p[2];
      const nn = n || fn;
      B.nrm[i * 3] = nn[0]; B.nrm[i * 3 + 1] = nn[1]; B.nrm[i * 3 + 2] = nn[2];
      B.col[i * 3] = m.c[0]; B.col[i * 3 + 1] = m.c[1]; B.col[i * 3 + 2] = m.c[2];
      B.col2[i * 3] = m.c2[0]; B.col2[i * 3 + 1] = m.c2[1]; B.col2[i * 3 + 2] = m.c2[2];
      B.cut[i * 3] = m.cut[0]; B.cut[i * 3 + 1] = m.cut[1]; B.cut[i * 3 + 2] = m.cut[2];
      B.pat[i * 4] = m.pat; B.pat[i * 4 + 1] = m.s; B.pat[i * 4 + 2] = flags; B.pat[i * 4 + 3] = m.id;
      const sv = Math.max(0, Math.min(255, Math.round(s * t * 200)));
      B.shd[i * 3] = sv; B.shd[i * 3 + 1] = sv; B.shd[i * 3 + 2] = sv;
    };
    put(a, n0, s0); put(b, n1, s1); put(c, n2, s2);
    this.tris++;
  }
  quad(a, b, c, d, m, s) {
    const S = s || [1, 1, 1, 1];
    this.tri(a, b, c, m, null, null, null, S[0], S[1], S[2]);
    this.tri(a, c, d, m, null, null, null, S[0], S[2], S[3]);
  }
  // Polygon (convex or concave) given as 3D points lying in a plane, triangulated. The face
  // points along the polygon's own winding (counter-clockwise seen from the front), or along
  // `want` ([nx, ny, nz]) when given.
  poly(pts, m, s = 1, want = null) {
    if (pts.length < 3) return;
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      nx += (p[1] - q[1]) * (p[2] + q[2]); ny += (p[2] - q[2]) * (p[0] + q[0]); nz += (p[0] - q[0]) * (p[1] + q[1]);
    }
    const W = want || [nx, ny, nz];
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    const proj = az >= ax && az >= ay ? (p) => new THREE.Vector2(p[0], p[1]) : ax >= ay ? (p) => new THREE.Vector2(p[1], p[2]) : (p) => new THREE.Vector2(p[2], p[0]);
    const tris = pts.length === 3 ? [[0, 1, 2]] : THREE.ShapeUtils.triangulateShape(pts.map(proj), []);
    for (const t of tris) this._oriented(pts[t[0]], pts[t[1]], pts[t[2]], W, m, s);
  }
  _oriented(a, b, c, W, m, s = 1) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const d = (uy * vz - uz * vy) * W[0] + (uz * vx - ux * vz) * W[1] + (ux * vy - uy * vx) * W[2];
    if (d >= 0) this.tri(a, b, c, m, null, null, null, s, s, s); else this.tri(a, c, b, m, null, null, null, s, s, s);
  }

  // ------------------------------------------------------------ solids
  // Axis-aligned box. opt: { top, bottom, front, back, left, right: material or false; shadeTop, shadeBot }
  box(x0, y0, z0, x1, y1, z1, m, opt = {}) {
    if (x1 < x0) [x0, x1] = [x1, x0];
    if (y1 < y0) [y0, y1] = [y1, y0];
    if (z1 < z0) [z0, z1] = [z1, z0];
    const M = mat(m);
    const fm = (k) => (opt[k] === false ? null : opt[k] ? mat(opt[k]) : M);
    const sb = opt.shadeBot != null ? opt.shadeBot : 1, st = opt.shadeTop != null ? opt.shadeTop : 1;
    const A = [x0, y0, z0], B = [x1, y0, z0], C = [x1, y1, z0], D = [x0, y1, z0];
    const E = [x0, y0, z1], Fp = [x1, y0, z1], G = [x1, y1, z1], H = [x0, y1, z1];
    // Winding is counter-clockwise seen from outside, in scene coordinates (x right, y up, z away).
    // Seen from the viewer (z < 0 side) the front face is A B C D.
    let f;
    if ((f = fm('front'))) this.quad(A, D, C, B, f, [sb, st, st, sb]);
    if ((f = fm('back'))) this.quad(E, Fp, G, H, f, [sb, sb, st, st]);
    if ((f = fm('left'))) this.quad(A, E, H, D, f, [sb, sb, st, st]);
    if ((f = fm('right'))) this.quad(B, C, G, Fp, f, [sb, st, st, sb]);
    if ((f = fm('top'))) this.quad(D, H, G, C, f, [st, st, st, st]);
    if ((f = fm('bottom'))) this.quad(A, B, Fp, E, f, [sb, sb, sb, sb]);
  }
  // Box from a centre-bottom-front anchor convention used by props: x centre, y floor, z front.
  boxAt(cx, y, z, w, h, d, m, opt) { return this.box(cx - w / 2, y, z, cx + w / 2, y + h, z + d, m, opt); }
  // Rotated box about its centre. rot: { x, y, z } radians (applied in that order).
  boxR(cx, cy, cz, w, h, d, m, rot = {}) {
    const e = new THREE.Euler(rot.x || 0, rot.y || 0, rot.z || 0, 'XYZ');
    const q = new THREE.Matrix4().makeRotationFromEuler(e);
    const v = new THREE.Vector3();
    const P = (x, y, z) => { v.set(x, y, z).applyMatrix4(q); return [cx + v.x, cy + v.y, cz + v.z]; };
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const A = P(-hw, -hh, -hd), B = P(hw, -hh, -hd), C = P(hw, hh, -hd), D = P(-hw, hh, -hd);
    const E = P(-hw, -hh, hd), Fp = P(hw, -hh, hd), G = P(hw, hh, hd), H = P(-hw, hh, hd);
    this.quad(A, D, C, B, m); this.quad(E, Fp, G, H, m); this.quad(A, E, H, D, m);
    this.quad(B, C, G, Fp, m); this.quad(D, H, G, C, m); this.quad(A, B, Fp, E, m);
  }
  // A beam between two points with a square section of size t.
  beam(a, b, t, m) {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    const L = Math.hypot(dx, dy, dz);
    if (L < 1e-6) return;
    const dir = new THREE.Vector3(dx / L, dy / L, dz / L);
    const up = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const s = new THREE.Vector3().crossVectors(dir, up).normalize().multiplyScalar(t / 2);
    const u = new THREE.Vector3().crossVectors(s, dir).normalize().multiplyScalar(t / 2);
    const c = (p, i, j) => [p[0] + s.x * i + u.x * j, p[1] + s.y * i + u.y * j, p[2] + s.z * i + u.z * j];
    const a0 = c(a, -1, -1), a1 = c(a, 1, -1), a2 = c(a, 1, 1), a3 = c(a, -1, 1);
    const b0 = c(b, -1, -1), b1 = c(b, 1, -1), b2 = c(b, 1, 1), b3 = c(b, -1, 1);
    this.quad(a0, a1, b1, b0, m); this.quad(a1, a2, b2, b1, m); this.quad(a2, a3, b3, b2, m); this.quad(a3, a0, b0, b3, m);
    this.quad(a0, a3, a2, a1, m); this.quad(b0, b1, b2, b3, m);
  }

  // Extrude a closed profile drawn in the x-y plane from depth z0 to z1.
  // opt: { holes: [[[x,y],...],...], front, back, side, reveal (material of hole sides), front:false, back:false }
  extrude(profile, z0, z1, m, opt = {}) {
    const area2 = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
    let pr = profile.map((p) => [p[0], p[1]]);
    if (area2(pr) < 0) pr.reverse(); // counter-clockwise
    const sm = opt.side ? mat(opt.side) : mat(m);
    const sides = (P, mm, inward) => {
      for (let i = 0; i < P.length; i++) {
        const p = P[i], q = P[(i + 1) % P.length];
        const A = [p[0], p[1], z0], B = [q[0], q[1], z0], C = [q[0], q[1], z1], D = [p[0], p[1], z1];
        if (inward) this.quad(A, D, C, B, mm); else this.quad(A, B, C, D, mm);
      }
    };
    sides(pr, sm, false);
    const holes = (opt.holes || []).map((h) => { const hh = h.map((p) => [p[0], p[1]]); if (area2(hh) < 0) hh.reverse(); return hh; });
    for (const h of holes) sides(h, opt.reveal ? mat(opt.reveal) : sm, true);
    const contour = pr.map((p) => new THREE.Vector2(p[0], p[1]));
    const hs = holes.map((h) => h.map((p) => new THREE.Vector2(p[0], p[1])));
    const tris = THREE.ShapeUtils.triangulateShape(contour, hs);
    const all = pr.concat(...holes);
    const fm = opt.front ? mat(opt.front) : mat(m), bm = opt.back ? mat(opt.back) : mat(m);
    for (const t of tris) {
      const a = all[t[0]], b = all[t[1]], c = all[t[2]];
      if (opt.front !== false) this._oriented([a[0], a[1], z0], [b[0], b[1], z0], [c[0], c[1], z0], [0, 0, -1], fm);
      if (opt.back !== false) this._oriented([a[0], a[1], z1], [b[0], b[1], z1], [c[0], c[1], z1], [0, 0, 1], bm);
    }
  }

  // Extrude a closed profile drawn in the depth-height plane ([z, y] pairs) along x from x0 to x1.
  extrudeX(profile, x0, x1, m, opt = {}) {
    let P = profile.map((p) => [p[0], p[1]]); // (u = z, v = y)
    let a = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a < 0) P.reverse();
    const n = P.length;
    for (let i = 0; i < n; i++) {
      const [ua, va] = P[i], [ub, vb] = P[(i + 1) % n];
      this.quad([x0, va, ua], [x1, va, ua], [x1, vb, ub], [x0, vb, ub], m);
    }
    if (opt.ends !== false) {
      const em = opt.end ? mat(opt.end) : m;
      this.poly(P.map(([u, v]) => [x0, v, u]), em, 1, [-1, 0, 0]);
      this.poly(P.map(([u, v]) => [x1, v, u]), em, 1, [1, 0, 0]);
    }
  }

  // Loft a closed solid through cross-sections taken along x (ascending). sections: [{ x, pts: [[z, y], ...] }]
  // with the same point count in each. Hulls, fuselages, carriage roofs. opt: { matFn(s, i), cap, caps:false, open }
  loft(sections, m, opt = {}) {
    let a = 0;
    const P0 = sections[0].pts;
    for (let i = 0; i < P0.length; i++) { const p = P0[i], q = P0[(i + 1) % P0.length]; a += p[0] * q[1] - q[0] * p[1]; }
    const S = a < 0 ? sections.map((s) => ({ x: s.x, pts: s.pts.slice().reverse() })) : sections;
    const n = S[0].pts.length;
    for (let s = 0; s < S.length - 1; s++) {
      const A = S[s], B = S[s + 1];
      for (let i = 0; i < n - (opt.open ? 1 : 0); i++) {
        const j = (i + 1) % n;
        const mm = opt.matFn ? opt.matFn(s, a < 0 ? n - 1 - i : i, A, B) : m;
        if (!mm) continue;
        this.quad([A.x, A.pts[i][1], A.pts[i][0]], [B.x, B.pts[i][1], B.pts[i][0]], [B.x, B.pts[j][1], B.pts[j][0]], [A.x, A.pts[j][1], A.pts[j][0]], mm);
      }
    }
    if (opt.caps !== false && !opt.open) {
      const first = S[0], last = S[S.length - 1];
      this.poly(first.pts.map(([z, y]) => [first.x, y, z]), opt.cap || m, 1, [-1, 0, 0]);
      this.poly(last.pts.map(([z, y]) => [last.x, y, z]), opt.cap || m, 1, [1, 0, 0]);
    }
  }

  // Surface of revolution about a vertical axis at (cx, cz). pts: [[r, y], ...] from bottom to top.
  // opt: { seg, a0, a1 (angle range, 0 = +x, PI/2 = away from viewer), capTop, capBot, smooth }
  lathe(pts, cx, cz, m, opt = {}) {
    const seg = opt.seg || 24;
    const a0 = opt.a0 != null ? opt.a0 : 0, a1 = opt.a1 != null ? opt.a1 : TAU;
    const full = Math.abs(a1 - a0 - TAU) < 1e-6;
    const P = (r, y, a) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    const N = (dr, dy, a) => { const l = Math.hypot(dr, dy) || 1; return [Math.cos(a) * dy / l, -dr / l, Math.sin(a) * dy / l]; };
    for (let k = 0; k < seg; k++) {
      const ta = a0 + ((a1 - a0) * k) / seg, tb = a0 + ((a1 - a0) * (k + 1)) / seg;
      for (let i = 0; i < pts.length - 1; i++) {
        const [r0, y0] = pts[i], [r1, y1] = pts[i + 1];
        const dr = r1 - r0, dy = y1 - y0;
        const n0 = N(dr, dy, ta), n1 = N(dr, dy, tb);
        const p00 = P(r0, y0, ta), p01 = P(r0, y0, tb), p10 = P(r1, y1, ta), p11 = P(r1, y1, tb);
        const mm = opt.matFn ? opt.matFn(i, k) : m;
        if (opt.flat) { this.quad(p00, p10, p11, p01, mm); continue; }
        this.tri(p00, p10, p11, mm, n0, n0, n1);
        this.tri(p00, p11, p01, mm, n0, n1, n1);
      }
    }
    const cap = (r, y, up) => {
      if (r <= 1e-6) return;
      const c = [cx, y, cz];
      for (let k = 0; k < seg; k++) {
        const ta = a0 + ((a1 - a0) * k) / seg, tb = a0 + ((a1 - a0) * (k + 1)) / seg;
        if (up) this.tri(c, P(r, y, tb), P(r, y, ta), opt.capMat || m); else this.tri(c, P(r, y, ta), P(r, y, tb), opt.capMat || m);
      }
    };
    if (opt.capBot !== false) cap(pts[0][0], pts[0][1], false);
    if (opt.capTop !== false) cap(pts[pts.length - 1][0], pts[pts.length - 1][1], true);
    // Close a partial lathe with its two radial walls.
    if (!full && opt.walls !== false) {
      for (const a of [a0, a1]) {
        const wall = pts.map(([r, y]) => P(r, y, a)).concat(pts.slice().reverse().map(([, y]) => [cx, y, cz]));
        // Outward normal of each radial wall points away from the solid's angular range.
        const t = a === a0 ? [Math.sin(a), 0, -Math.cos(a)] : [-Math.sin(a), 0, Math.cos(a)];
        this.poly(wall, opt.wallMat || m, 1, t);
      }
    }
  }
  // Cylinder. axis 'y' (default), 'x' or 'z'. (x, y, z) is the centre of the bottom/left/front end.
  cyl(x, y, z, r, len, m, opt = {}) {
    const axis = opt.axis || 'y';
    const r2 = opt.r2 != null ? opt.r2 : r;
    const pts = [[r, 0], [r2, len]];
    if (axis === 'y') return this.lathe(pts.map(([rr, yy]) => [rr, y + yy]), x, z, m, opt);
    // Build around y in a scratch kit transform, then remap axes.
    const seg = opt.seg || 18;
    const ring = (t, rr) => {
      const out = [];
      for (let k = 0; k < seg; k++) {
        const a = (k / seg) * TAU, u = Math.cos(a) * rr, v = Math.sin(a) * rr;
        out.push(axis === 'x' ? [x + t, y + u, z + v] : [x + u, y + v, z + t]);
      }
      return out;
    };
    const A = ring(0, r), B = ring(len, r2);
    for (let k = 0; k < seg; k++) {
      const j = (k + 1) % seg;
      const a = (k / seg) * TAU, b = (j / seg) * TAU;
      const na = axis === 'x' ? [0, Math.cos(a), Math.sin(a)] : [Math.cos(a), Math.sin(a), 0];
      const nb = axis === 'x' ? [0, Math.cos(b), Math.sin(b)] : [Math.cos(b), Math.sin(b), 0];
      this.tri(A[k], A[j], B[j], m, na, nb, nb);
      this.tri(A[k], B[j], B[k], m, na, nb, na);
    }
    if (opt.caps !== false) {
      const c0 = axis === 'x' ? [x, y, z] : [x, y, z], c1 = axis === 'x' ? [x + len, y, z] : [x, y, z + len];
      for (let k = 0; k < seg; k++) {
        const j = (k + 1) % seg;
        this.tri(c0, A[j], A[k], opt.capMat || m);
        this.tri(c1, B[k], B[j], opt.capMat || m);
      }
    }
  }
  sphere(x, y, z, r, m, opt = {}) {
    const seg = opt.seg || 14, rings = opt.rings || 9;
    const pts = [];
    const t0 = opt.t0 != null ? opt.t0 : 0, t1 = opt.t1 != null ? opt.t1 : Math.PI; // from bottom pole to top pole
    for (let i = 0; i <= rings; i++) {
      const t = t0 + ((t1 - t0) * i) / rings;
      pts.push([Math.sin(t) * r, y - Math.cos(t) * r]);
    }
    this.lathe(pts, x, z, m, Object.assign({ seg, capBot: t0 > 0.01, capTop: t1 < Math.PI - 0.01 }, opt));
  }
  // A tube along a polyline of 3D points (ropes, pipes, rails, hoses).
  tube(path, r, m, opt = {}) {
    const seg = opt.seg || 6;
    let prev = null;
    const v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      const q = path[Math.min(path.length - 1, i + 1)], o = path[Math.max(0, i - 1)];
      v.set(q[0] - o[0], q[1] - o[1], q[2] - o[2]).normalize();
      const ref = Math.abs(v.dot(up)) > 0.9 ? new THREE.Vector3(1, 0, 0) : up;
      const s = new THREE.Vector3().crossVectors(v, ref).normalize();
      const u = new THREE.Vector3().crossVectors(s, v).normalize();
      const ring = [];
      for (let k = 0; k < seg; k++) {
        const a = (k / seg) * TAU;
        const c = Math.cos(a), sn = Math.sin(a);
        ring.push({ p: [p[0] + (s.x * c + u.x * sn) * r, p[1] + (s.y * c + u.y * sn) * r, p[2] + (s.z * c + u.z * sn) * r], n: [s.x * c + u.x * sn, s.y * c + u.y * sn, s.z * c + u.z * sn] });
      }
      if (prev) for (let k = 0; k < seg; k++) {
        const j = (k + 1) % seg;
        this.tri(prev[k].p, ring[k].p, ring[j].p, m, prev[k].n, ring[k].n, ring[j].n);
        this.tri(prev[k].p, ring[j].p, prev[j].p, m, prev[k].n, ring[j].n, prev[j].n);
      }
      prev = ring;
    }
  }
  // A rope sagging between two points.
  rope(a, b, r, m, sag = 0.05, n = 10) {
    const pts = [];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag * L, a[2] + (b[2] - a[2]) * t]);
    }
    this.tube(pts, r, m, { seg: 5 });
  }

  // ------------------------------------------------------------ rooms
  // An interior seen through the cut: floor slab, back wall, side walls, optional ceiling.
  // opt: { floor, wall, side (or left/right), ceiling, t (wall thickness), ft (floor thickness),
  //        left/right: false to omit, ao: true }
  room(x0, x1, y0, y1, z0, z1, opt = {}) {
    const t = opt.t || 0.15, ft = opt.ft != null ? opt.ft : 0.25;
    const wall = mat(opt.wall || '#e8dcc0'), floor = mat(opt.floor || '#b88a5a');
    const side = opt.side ? mat(opt.side) : wall;
    if (opt.floor !== false) this.box(x0, y0 - ft, z0, x1, y0, z1 + t, floor);
    const prev = this.tint;
    // Back wall with a soft darkening towards the floor (ambient occlusion).
    if (opt.wall !== false) this.box(x0, y0, z1, x1, y1, z1 + t, wall, { shadeBot: opt.ao === false ? 1 : 0.8 });
    if (opt.left !== false) this.box(x0 - t, y0, z0, x0, y1, z1 + t, opt.left ? mat(opt.left) : side, { shadeBot: opt.ao === false ? 1 : 0.85 });
    if (opt.right !== false) this.box(x1, y0, z0, x1 + t, y1, z1 + t, opt.right ? mat(opt.right) : side, { shadeBot: opt.ao === false ? 1 : 0.85 });
    if (opt.ceiling) this.box(x0, y1, z0, x1, y1 + (opt.ct || 0.2), z1 + t, mat(opt.ceiling));
    this.tint = prev;
  }

  // ------------------------------------------------------------ glass and overlays
  // Translucent pane (windows you look through, lantern glazing). Drawn after the ink pass.
  glass(pts, spec = {}) {
    const m = mat(Object.assign({ c: '#bcd6e2', alpha: 0.28 }, spec));
    const B = this._batch(this.over, pts[0][0], true);
    const tris = [];
    for (let i = 1; i < pts.length - 1; i++) tris.push(pts[0], pts[i], pts[i + 1]);
    B.grow(tris.length);
    const flags = (m.flags & F.WHOLE ? 1 : 0) | (m.flags & F.GLOW_NIGHT ? 4 : 0);
    for (const p of tris) {
      const i = B.n++;
      B.pos.set(p, i * 3);
      B.nrm.set([0, 0, -1], i * 3);
      B.col[i * 3] = m.c[0]; B.col[i * 3 + 1] = m.c[1]; B.col[i * 3 + 2] = m.c[2];
      B.ov[i * 4] = m.alpha; B.ov[i * 4 + 1] = flags; B.ov[i * 4 + 2] = m.soft;
    }
  }
  // Water (or any translucent volume) cut face: a vertical sheet at the cut plane.
  sheet(x0, x1, y0, y1, z, spec) { this.glass([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], Object.assign({ whole: true }, spec)); }

  // ------------------------------------------------------------ lamps
  // A light that pools warm colour on its surroundings at night (or always, for fires and furnaces).
  // opt: { color, r (reach, m), i (intensity), always, halo (bool or size), bulb (bool), fixture }
  lamp(x, y, z, opt = {}) {
    const L = { x, y, z, color: opt.color || '#ffcf8a', r: opt.r || 4, i: opt.i != null ? opt.i : 1, always: !!opt.always, up: opt.up || 0.15, halo: opt.halo !== false ? (typeof opt.halo === 'number' ? opt.halo : 0.6) : 0, flicker: !!opt.flicker };
    this.lamps.push(L);
    if (opt.bulb !== false) {
      const prev = this.whole;
      this.sphere(x, y, z, opt.bulbR || 0.08, mat({ c: '#fff2c8', c2: '#fff6d8', glow: opt.always ? 'always' : 'night', noEdge: true }), { seg: 8, rings: 5 });
      this.whole = prev;
    }
    return L;
  }

  // Import the triangles of any three.js geometry (icosahedra for boulders, tori, text...),
  // transformed by a Matrix4 (scene coordinates). opt.smooth keeps its normals.
  geo(geometry, matrix, m, opt = {}) {
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    const P = g.attributes.position, N = g.attributes.normal;
    const nm = new THREE.Matrix3().getNormalMatrix(matrix);
    const v = new THREE.Vector3(), n = new THREE.Vector3();
    const pts = [], nrm = [];
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i).applyMatrix4(matrix);
      pts.push([v.x, v.y, v.z]);
      if (N && opt.smooth) { n.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nrm.push([n.x, n.y, n.z]); }
    }
    for (let i = 0; i + 2 < pts.length; i += 3) {
      if (opt.smooth && N) this.tri(pts[i], pts[i + 1], pts[i + 2], m, nrm[i], nrm[i + 1], nrm[i + 2]);
      else this.tri(pts[i], pts[i + 1], pts[i + 2], m);
    }
  }
  // A lumpy boulder (deformed icosahedron).
  boulder(x, y, z, rx, ry, rz, m, seed = 1, rough = 0.28) {
    const g = new THREE.IcosahedronGeometry(1, 1);
    const P = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < P.count; i++) {
      v.fromBufferAttribute(P, i);
      const k = 1 + (h01(Math.round(v.x * 97 + 13), Math.round(v.y * 89 + 7), Math.round(v.z * 83 + seed)) - 0.5) * rough * 2;
      P.setXYZ(i, v.x * k, v.y * k, v.z * k);
    }
    const M4 = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, seed * 1.7, 0)), new THREE.Vector3(rx, ry, rz));
    this.geo(g, M4, m);
  }
  // Attach an extra object (already in scene coordinates) to the scene root.
  // opt.overlay: draw it in the overlay pass (beams, glows) instead of the ink pass.
  object(o, opt = {}) { if (opt.overlay) o.userData.overlay = true; this.parts.push(o); return o; }

  // ------------------------------------------------------------ captions and parts
  label(def) { this.labels.push(def); return def; }

  // Geometry for something that moves: fn(k) draws with a local kit in coordinates relative to
  // the pivot (px, py, pz). Returns a THREE.Group to animate (rotate, translate) in scene coordinates.
  part(px, py, pz, fn, opt = {}) {
    const k = new Kit(this.scene, { local: true });
    k.seed = hash(this.seed, this.parts.length + 1);
    fn(k);
    const g = new THREE.Group();
    g.position.set(px, py, pz);
    for (const mesh of k.meshes()) g.add(mesh);
    g.userData.lamps = k.lamps;
    g.userData.whole = !!opt.whole;
    this.parts.push(g);
    return g;
  }

  // ------------------------------------------------------------ finishing
  meshes() {
    const out = [];
    for (const B of this.solid.values()) if (B.n) { const m = new THREE.Mesh(B.geometry(), inkMaterial()); m.frustumCulled = true; out.push(m); }
    for (const B of this.over.values()) if (B.n) { const m = new THREE.Mesh(B.geometry(), overlayMaterial()); m.userData.overlay = true; m.renderOrder = 10; out.push(m); }
    return out;
  }
}

// ------------------------------------------------------------------ lamp light volume
// Splat every lamp into a coarse 3D texture over the scene bounds. rgb: night lamps, a: always-on fires.
export function bakeLamps(lamps, bounds) {
  const pad = 2;
  const x0 = bounds.x0 - pad, y0 = bounds.y0 - pad, z0 = (bounds.z0 != null ? bounds.z0 : -2) - pad;
  const x1 = bounds.x1 + pad, y1 = bounds.y1 + pad, z1 = (bounds.z1 != null ? bounds.z1 : 40) + pad;
  const maxDim = Math.max(x1 - x0, y1 - y0, z1 - z0);
  const cell = Math.max(0.35, maxDim / 230);
  const nx = Math.max(2, Math.ceil((x1 - x0) / cell)), ny = Math.max(2, Math.ceil((y1 - y0) / cell)), nz = Math.max(2, Math.ceil((z1 - z0) / cell));
  const data = new Float32Array(nx * ny * nz * 4);
  for (const L of lamps) {
    const c = toRgb(L.color);
    const r = L.r;
    const ix0 = Math.max(0, Math.floor((L.x - r - x0) / cell)), ix1 = Math.min(nx - 1, Math.ceil((L.x + r - x0) / cell));
    const iy0 = Math.max(0, Math.floor((L.y - r - y0) / cell)), iy1 = Math.min(ny - 1, Math.ceil((L.y + r * 0.5 - y0) / cell));
    const iz0 = Math.max(0, Math.floor((L.z - r - z0) / cell)), iz1 = Math.min(nz - 1, Math.ceil((L.z + r - z0) / cell));
    for (let k = iz0; k <= iz1; k++) for (let j = iy0; j <= iy1; j++) for (let i = ix0; i <= ix1; i++) {
      const px = x0 + (i + 0.5) * cell, py = y0 + (j + 0.5) * cell, pz = z0 + (k + 0.5) * cell;
      const dx = px - L.x, dy = py - L.y, dz = pz - L.z;
      const d = Math.hypot(dx, dy * 1.15, dz);
      if (d > r) continue;
      let w = Math.pow(1 - d / r, 1.6) * L.i;
      if (dy > L.up) w *= Math.exp(-(dy - L.up) * 4); // light does not leak up through the ceiling
      const o = ((k * ny + j) * nx + i) * 4;
      if (L.always) data[o + 3] += w;
      else { data[o] += (c[0] / 255) * w; data[o + 1] += (c[1] / 255) * w; data[o + 2] += (c[2] / 255) * w; }
    }
  }
  const half = new Uint16Array(data.length);
  for (let i = 0; i < data.length; i++) half[i] = THREE.DataUtils.toHalfFloat(Math.min(data[i], 60000));
  const tex = new THREE.Data3DTexture(half, nx, ny, nz);
  tex.format = THREE.RGBAFormat;
  tex.type = THREE.HalfFloatType;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  return { tex, min: new THREE.Vector3(x0, y0, z0), size: new THREE.Vector3(nx * cell, ny * cell, nz * cell) };
}

XS.Kit = Kit;
XS.mat = mat;
void h01;
