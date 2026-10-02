/* Salisbury Cathedral, 1245: shared dimensions, materials and geometry helpers.
 *
 * Coordinates follow the research dossier (docs/research/cathedral.md, section 2):
 * x = metres east of the west face of the future west-front buttresses (west is left),
 * y = metres above the nave floor, z = depth north of the cathedral's axis. The cut runs
 * along the axis, so the south half is taken away and we look north.
 */
import { THREE, mat, shade } from '../../engine/index.js';

// ------------------------------------------------------------------ plan (x)
export const BAY = 5.6;
export const NAVE0 = 5.5;
export const bayX = (i) => NAVE0 + (i - 1) * BAY; // west edge of nave bay i (1..10)
export const PIERX = (i) => NAVE0 + i * BAY; // pier line i (0 = west respond, 10 = crossing)
export const CROSS = [61.5, 73.5];
export const QUIRE = [73.5, 91.5];
export const ECROSS = [91.5, 103.5];
export const PRES = [103.5, 119.5];
export const RETRO = [119.5, 129.5];
export const TRIN = [129.5, 140.5];
export const EWALL = [140.5, 141.9];
export const END = 144.2;

// ------------------------------------------------------------------ section (z, y)
export const PZ = 6.4; // centre line of the main arcade piers
export const WZ0 = 5.65, WZ1 = 7.15; // upper wall (triforium, clerestory) thickness
export const AZ0 = 11.7, AZ1 = 13.0; // north aisle outer wall
export const BZ = 14.3; // outer face of the aisle buttresses
export const CAP = 8.5, ARC = 12.5, TRI1 = 16, SPRING = 17, CROWN = 25.5, PLATE = 27.5, PARA = 28.5, RIDGE = 36.5;
export const A_SPRING = 8.2, A_CROWN = 12, A_ROOF0 = 14, A_ROOF1 = 16.5;
export const LOW_CROWN = 12.5, LOW_RIDGE = 20; // retrochoir and Trinity Chapel
export const TRIN_Z = 9.6; // north wall of the Trinity Chapel (inner face)
export const TRAN_Z = 31; // north end of the main transept (inner face)
export const ETRAN_Z = 22; // north end of the eastern transept (inner face)
export const ZMIN = -0.6; // solids that cross the axis start here, so the cut shows them hatched

// ------------------------------------------------------------------ materials
// Chilmark stone, Purbeck marble, oak, lead, lime, glass (dossier 3.4).
export const M = {
  stone: mat({ c: '#cfcbc0', c2: '#b3aea2', pat: 'ashlar', s: 0.42, cut: '#a7a296', cutPat: true }),
  stoneNew: mat({ c: '#d8d4c8', c2: '#bab5a8', pat: 'ashlar', s: 0.42, cut: '#aaa598', cutPat: true }),
  stoneOut: mat({ c: '#c4c0b4', c2: '#a7a296', pat: 'ashlar', s: 0.5, cut: '#a29d90', cutPat: true }),
  limewash: mat({ c: '#ede6d6', c2: '#c27a62', pat: 'ashlar', s: 0.5, cut: '#a7a296' }),
  vault: mat({ c: '#e9e2d0', c2: '#c9b8a0', pat: 'ashlar', s: 0.55, cut: '#a7a296', cutPat: true }),
  vaultRaw: mat({ c: '#d4d0c4', c2: '#b8b3a6', pat: 'ashlar', s: 0.45, cut: '#a29d90', cutPat: true }),
  rib: mat({ c: '#c8c0ae', cut: '#a29d90' }),
  ribPaint: mat({ c: '#b4553e', cut: '#a29d90' }),
  purbeck: mat({ c: '#2e3432', c2: '#5c6b66', cut: '#3c4644' }),
  purbeckRaw: mat({ c: '#6b6457', c2: '#5a5448', pat: 'speckle', cut: '#4e4a40' }),
  oak: mat({ c: '#b8874e', c2: '#9a6e3c', pat: 'grain', cut: '#c89a5e' }),
  oakDark: mat({ c: '#6e4a2c', c2: '#5a3a22', pat: 'grain', cut: '#8a6038' }),
  oakOld: mat({ c: '#8a6e50', c2: '#6e5640', pat: 'grain', cut: '#a08060' }),
  pole: mat({ c: '#9a7c56', c2: '#7a6044', cut: '#b89464' }),
  hurdle: mat({ c: '#a48a5c', c2: '#7a6440', pat: 'thatch', s: 0.25, cut: '#8a7048' }),
  boards: mat({ c: '#c09a64', c2: '#9a7848', pat: 'planks', s: 0.22, cut: '#c89e66' }),
  lead: mat({ c: '#9ea4a8', c2: '#868c90', pat: 'panels', s: 0.65, cut: '#5e6468' }),
  leadOld: mat({ c: '#858c91', c2: '#737a7f', pat: 'panels', s: 0.65, cut: '#5e6468' }),
  thatch: mat({ c: '#b89a5c', c2: '#8f7442', pat: 'thatch', s: 0.3, cut: '#9a7c46' }),
  daub: mat({ c: '#d9c49a', c2: '#c4ad80', pat: 'speckle', cut: '#a8946c' }),
  timberFrame: mat({ c: '#5e4430', c2: '#4a3424', pat: 'grain', cut: '#7a5a3c' }),
  // Grisaille glass; at night it glows faintly with the candlelight inside the church.
  glass: mat({ c: '#c4cdbf', c2: '#e8b864', pat: 'panes', s: 0.16, cut: '#4a5048', glow: 'night' }),
  glassRuby: mat({ c: '#9a3a34', c2: '#a83a2a', pat: 'panes', s: 0.16, glow: 'night' }),
  glassBlue: mat({ c: '#3e5a96', c2: '#3e5aa6', pat: 'panes', s: 0.16, glow: 'night' }),
  earth: mat({ c: '#a8916c', c2: '#cfc7b4', pat: 'speckle', cut: '#8e7a5a' }),
  dust: mat({ c: '#cdc6b4', c2: '#e6e0d2', pat: 'speckle', cut: '#a8a090' }),
  grass: mat({ c: '#8c9c5c', c2: '#74864a', pat: 'speckle', cut: '#8a7656' }),
  meadow: mat({ c: '#7e9454', c2: '#94a866', pat: 'speckle', cut: '#8a7656' }),
  marsh: mat({ c: '#6e8a52', c2: '#8a9a5a', pat: 'speckle', cut: '#8a7656' }),
  downs: mat({ c: '#a4ae74', c2: '#8e9a62', pat: 'speckle', cut: '#8a7656' }),
  gravelRoad: mat({ c: '#b0a080', c2: '#988866', pat: 'speckle', cut: '#9a8466' }),
  gravel: mat({ c: '#9a8466', c2: '#7e6a50', pat: 'stone', s: 0.18, cut: '#9a8466', cutPat: true }),
  rubble: mat({ c: '#aea68f', c2: '#8a8270', pat: 'stone', s: 0.32, cut: '#8f8774', cutPat: true }),
  paving: mat({ c: '#bab3a2', c2: '#9a9384', pat: 'stone', s: 0.7, cut: '#9a9384', cutPat: true }),
  pavingDark: mat({ c: '#4a504c', c2: '#363c38', pat: 'tiles', s: 0.6, cut: '#3a403c' }),
  plaster: mat({ c: '#efebe2', c2: '#a8a49a', pat: 'rings', s: 1.4, cut: '#c8c0b0' }),
  lime: mat({ c: '#f2efe6', c2: '#dcd6c8', pat: 'speckle', cut: '#d8d2c2' }),
  sand: mat({ c: '#d6bf8a', c2: '#c0a674', pat: 'speckle', cut: '#c0a674' }),
  clay: mat({ c: '#9a6a46', c2: '#7a5236', pat: 'speckle', cut: '#b07a50' }),
  loam: mat({ c: '#8a6448', c2: '#6e4e38', pat: 'speckle', cut: '#a47452' }),
  bronze: mat({ c: '#b08040', c2: '#8a6030', cut: '#c89048' }),
  iron: mat({ c: '#4a4c50', cut: '#3a3c40' }),
  soot: mat({ c: '#3a3634', c2: '#2a2624', pat: 'speckle', cut: '#2a2624' }),
  rope: mat({ c: '#b8955a', cut: '#8a6a3a' }),
  red: mat({ c: '#8e2a26', c2: '#c8a050', pat: 'carpet', s: 0.25, cut: '#6a2020' }),
  frontal: mat({ c: '#9a2a24', c2: '#d4aa50', pat: 'stripes', s: 0.3 }),
  gold: mat({ c: '#c8a050', cut: '#a07a30' }),
  linen: mat({ c: '#f2ede0', c2: '#e2dccc', pat: 'canvas', cut: '#c8c0b0' }),
  water: mat({ c: '#4a6a72', c2: '#5a7a80', cut: '#3a5a62' }),
  ochre: mat({ c: '#a0402c' }),
};
void shade;

// ------------------------------------------------------------------ arch geometry
// Height of a pointed arch of half-span a and rise h, at offset x from its centre.
export function archY(x, a, h) {
  if (a <= 0) return 0;
  const d = (h * h - a * a) / (2 * a), R = a + d;
  const t = R * R - (Math.abs(x) + d) ** 2;
  return t > 0 ? Math.sqrt(t) : 0;
}

// Outline of a pointed opening (lancet, doorway) as [x, y] points, anticlockwise.
export function lancetPts(cx, w, sill, apex, n = 8) {
  const a = w / 2;
  const rise = Math.min(Math.max(0.05, apex - sill - 0.05), a * 1.9);
  const spring = apex - rise;
  const pts = [[cx - a, sill], [cx + a, sill]];
  for (let i = 0; i <= n; i++) {
    const x = a * (1 - (2 * i) / n);
    pts.push([cx + x, spring + archY(x, a, rise)]);
  }
  return { pts, spring };
}

// ------------------------------------------------------------------ oriented faces
export function oq(k, a, b, c, d, m, W) { k._oriented(a, b, c, W, m); k._oriented(a, c, d, W, m); }

// A closed solid between two height functions over a grid of xs and zs (vault webs,
// heightfields). bot(x, z) and top(x, z) give the lower and upper surfaces.
export function heightSolid(k, xs, zs, bot, top, m, opt = {}) {
  const side = opt.side || m, under = opt.under || m;
  const nx = xs.length, nz = zs.length;
  const T = [], B = [];
  for (let j = 0; j < nz; j++) { const rt = [], rb = []; for (let i = 0; i < nx; i++) { rt.push(top(xs[i], zs[j])); rb.push(bot(xs[i], zs[j])); } T.push(rt); B.push(rb); }
  const up = [0, 1, 0], dn = [0, -1, 0];
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1], z0 = zs[j], z1 = zs[j + 1];
    const mt = opt.matFn ? opt.matFn((x0 + x1) / 2, (z0 + z1) / 2) : m;
    oq(k, [x0, T[j][i], z0], [x1, T[j][i + 1], z0], [x1, T[j + 1][i + 1], z1], [x0, T[j + 1][i], z1], mt, up);
    if (opt.bottom !== false) oq(k, [x0, B[j][i], z0], [x1, B[j][i + 1], z0], [x1, B[j + 1][i + 1], z1], [x0, B[j + 1][i], z1], under, dn);
  }
  for (let i = 0; i < nx - 1; i++) {
    for (const [j, W] of [[0, [0, 0, -1]], [nz - 1, [0, 0, 1]]]) {
      const z = zs[j];
      oq(k, [xs[i], B[j][i], z], [xs[i + 1], B[j][i + 1], z], [xs[i + 1], T[j][i + 1], z], [xs[i], T[j][i], z], side, W);
    }
  }
  for (let j = 0; j < nz - 1; j++) {
    for (const [i, W] of [[0, [-1, 0, 0]], [nx - 1, [1, 0, 0]]]) {
      const x = xs[i];
      oq(k, [x, B[j][i], zs[j]], [x, B[j + 1][i], zs[j + 1]], [x, T[j + 1][i], zs[j + 1]], [x, T[j][i], zs[j]], side, W);
    }
  }
}

export const range = (a, b, n) => { const out = []; for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n); return out; };

// ------------------------------------------------------------------ walls
// A wall in the x-y plane from depth z0 to z1, base y0 up to `top`, pierced by pointed
// openings [{cx, w, sill, apex, glass}]. Openings taller than the wall become notches
// (jambs still rising); openings from the floor become doorways.
export function wallOutline(x0, x1, y0, top, opens) {
  const bottom = [], tops = [], holes = [], panes = [];
  for (const o of opens || []) {
    if (o.cx - o.w / 2 < x0 + 0.12 || o.cx + o.w / 2 > x1 - 0.12) continue;
    if (o.sill <= y0 + 0.01) { bottom.push(o); continue; }
    if (o.sill >= top - 0.1) continue;
    if (o.apex < top - 0.25) { const L = lancetPts(o.cx, o.w, o.sill, o.apex, o.n || 8); holes.push(L.pts); if (o.glass) panes.push({ pts: L.pts, glass: o.glass }); }
    else tops.push(o);
  }
  bottom.sort((a, b) => a.cx - b.cx);
  tops.sort((a, b) => b.cx - a.cx);
  const P = [[x0, y0]];
  for (const o of bottom) {
    const apex = Math.min(o.apex, top - 0.3);
    const L = lancetPts(o.cx, o.w, y0, apex, o.n || 10);
    const arc = L.pts.slice(2).reverse(); // left spring ... apex ... right spring
    P.push([o.cx - o.w / 2, y0]);
    for (const p of arc) P.push(p);
    P.push([o.cx + o.w / 2, y0]);
  }
  P.push([x1, y0]);
  if (opensGable(opens)) for (const g of opens.gable) P.push(g); else P.push([x1, top]);
  for (const o of tops) { P.push([o.cx + o.w / 2, top], [o.cx + o.w / 2, o.sill], [o.cx - o.w / 2, o.sill], [o.cx - o.w / 2, top]); }
  if (!opensGable(opens)) P.push([x0, top]);
  return { P, holes, panes };
}
const opensGable = (o) => o && o.gable;

export function wall(k, x0, x1, z0, z1, y0, top, opens, m, opt = {}) {
  if (top <= y0 + 0.02) return;
  const { P, holes, panes } = wallOutline(x0, x1, y0, top, opens);
  prism(k, P, holes, mapXY, z0, z1, m, { reveal: opt.reveal || m, side: opt.side || m, front: opt.front, back: opt.back });
  const zm = opt.paneZ != null ? opt.paneZ : (z0 + z1) / 2;
  for (const p of panes) prism(k, p.pts, [], mapXY, zm - 0.03, zm + 0.03, p.glass);
}

// The same, for a wall running across the axis: (z0, z1) along the wall, (x0, x1) its thickness.
export function wallZ(k, z0, z1, x0, x1, y0, top, opens, m, opt = {}) {
  if (top <= y0 + 0.02) return;
  const { P, holes, panes } = wallOutline(z0, z1, y0, top, opens);
  prism(k, P, holes, mapZY, x0, x1, m, { reveal: opt.reveal || m, side: opt.side || m, front: opt.front, back: opt.back });
  const xm = (x0 + x1) / 2;
  for (const p of panes) prism(k, p.pts, [], mapZY, xm - 0.03, xm + 0.03, p.glass);
}

// ------------------------------------------------------------------ piers
// A nave pier: square plinth, a core with four attached Purbeck shafts, shaft rings and
// a moulded bell capital. h is the height built so far (CAP when complete).
export function pier(k, x, z, h, opt = {}) {
  const S = opt.stone || M.stone, P = opt.purbeck || M.purbeck;
  const full = h >= CAP - 0.01;
  const hb = Math.min(h, 0.45);
  k.box(x - 0.95, 0, z - 0.95, x + 0.95, hb, z + 0.95, S);
  if (h <= 0.45) return;
  const top = full ? CAP - 0.55 : h;
  k.lathe([[0.62, 0.45], [0.62, top]], x, z, S, { seg: 8, capBot: false });
  const n = opt.shafts || 4;
  if (h > 2.2) for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (n === 8 ? Math.PI / 8 : 0);
    const r = n === 8 ? 0.7 : 0.66;
    const sx = x + Math.cos(a) * r, sz = z + Math.sin(a) * r;
    const sh = full ? top - 0.45 : Math.max(0, h - 1.4);
    k.cyl(sx, 0.45, sz, 0.21, 0.18, S, { seg: 8 });
    if (sh > 0.6) k.cyl(sx, 0.63, sz, n === 8 ? 0.13 : 0.16, sh - 0.18, P, { seg: 8 });
    if (full) k.cyl(sx, top * 0.52, sz, n === 8 ? 0.16 : 0.19, 0.12, P, { seg: 8 });
  }
  if (full) {
    k.lathe([[0.62, CAP - 0.55], [0.66, CAP - 0.42], [0.82, CAP - 0.2], [0.98, CAP - 0.12], [0.98, CAP - 0.05]], x, z, opt.capital || S, { seg: 16, capBot: false, capTop: false });
    k.box(x - 1.0, CAP - 0.12, z - 1.0, x + 1.0, CAP, z + 1.0, opt.capital || S);
  }
}

// A slim single Purbeck shaft column (Trinity Chapel) with base and capital.
export function shaft(k, x, z, h, r = 0.2) {
  k.lathe([[r + 0.16, 0], [r + 0.16, 0.18], [r + 0.06, 0.32]], x, z, M.purbeck, { seg: 12 });
  k.cyl(x, 0.32, z, r, h - 0.62, M.purbeck, { seg: 10 });
  k.lathe([[r, h - 0.3], [r + 0.12, h - 0.12], [r + 0.22, h - 0.04], [r + 0.22, h]], x, z, M.purbeck, { seg: 12 });
}

// ------------------------------------------------------------------ vaults
// One quadripartite vault compartment over [x0,x1] x [z0,z1], clipped to z >= zmin.
// Intrados = spring + max(transverse arch, longitudinal arch): ridges, groins and wall arches.
export function vaultCell(k, x0, x1, z0, z1, spring, crown, opt = {}) {
  const m = opt.mat || M.vault, rm = opt.ribMat || M.rib;
  const zmin = opt.zmin != null ? opt.zmin : ZMIN;
  const xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2, rise = crown - spring;
  const t = opt.thick || 0.32;
  const intr = (x, z) => spring + Math.max(archY(x - xc, hx, rise), archY(z - zc, hz, rise));
  const za = Math.max(z0, zmin);
  if (za >= z1) return;
  const nx = opt.nx || 10, nz = opt.nz || Math.max(4, Math.round(((z1 - za) / (z1 - z0)) * 10));
  const xs = range(x0, x1, nx), zs = range(za, z1, nz);
  if (!opt.ribsOnly) heightSolid(k, xs, zs, intr, (x, z) => intr(x, z) + t + Math.max(0, 0.8 - (intr(x, z) - spring)) * 0.6, m);
  if (opt.ribs === false) return;
  const r = opt.ribR || 0.13;
  const line = (ax, az, bx, bz, n = 14) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u;
      if (z < zmin) continue;
      pts.push([x, intr(x, z) - r * 0.6, z]);
    }
    if (pts.length > 1) k.tube(pts, r, rm, { seg: 5 });
  };
  line(x0, z0, x1, z1); line(x0, z1, x1, z0);
  if (opt.transverse !== false) { line(x0, z0, x0, z1, 10); line(x1, z0, x1, z1, 10); }
  if (opt.ridge === 'x') line(x0, zc, x1, zc, 8);
  if (opt.ridge === 'z') line(xc, z0, xc, z1, 8);
}

// ------------------------------------------------------------------ roofs
// A pitched roof along x: ridge on z = zr at height yr, eaves at depth ze (north) at height ye.
// Built as a lead skin over boarding, both closed solids crossing the axis.
export function roofX(k, x0, x1, zr, yr, ze, ye, opt = {}) {
  const s = (yr - ye) / (ze - zr);
  const za = zr + (opt.zmin != null ? opt.zmin : ZMIN);
  const y = (z) => yr - s * Math.abs(z - zr);
  const skin = (off, th, m) => {
    const prof = [[za, y(za) + off + th], [zr, yr + off + th], [ze, y(ze) + off + th], [ze, y(ze) + off], [zr, yr + off], [za, y(za) + off]];
    k.extrudeX(prof, x0, x1, m);
  };
  if (opt.boards !== false) skin(0, 0.08, opt.boardMat || M.boards);
  if (opt.lead !== false) skin(0.08, 0.05, opt.leadMat || M.lead);
  return { s, y };
}

// Single-framed rafter pairs with collars and scissor braces under a roofX roof.
export function rafters(k, x0, x1, zr, yr, ze, ye, opt = {}) {
  const step = opt.step || 0.75, t = opt.t || 0.16, m = opt.mat || M.oak;
  const s = (yr - ye) / (ze - zr);
  for (let x = x0 + step / 2; x < x1; x += step) {
    const top = [x, yr - 0.05, zr], foot = [x, ye - 0.05, ze];
    k.beam([x, yr - 0.05 - s * 0.6, zr - 0.6], top, t, m);
    k.beam(top, foot, t, m);
    if (opt.collar !== false) {
      const yc = ye + (yr - ye) * 0.62, zc = ze - (yc - ye) / s;
      k.beam([x, yc, Math.max(ZMIN, zr - (zc - zr))], [x, yc, zc], t * 0.85, m);
      // scissor brace from the foot of the rafter to the collar on the far side
      if (opt.scissor !== false) k.beam([x, ye + 0.4, ze - 0.35], [x, yc, Math.max(ZMIN, zr - (zc - zr) * 0.4)], t * 0.75, m);
    }
  }
}

// A hurdle (wattle) platform with its supporting putlogs.
export function platform(k, x0, x1, y, z0, z1, opt = {}) {
  k.box(x0, y - 0.06, z0, x1, y, z1, opt.mat || M.hurdle);
  for (let x = x0 + 0.3; x < x1; x += opt.step || 1.6) k.box(x - 0.06, y - 0.2, z0 - 0.1, x + 0.06, y - 0.06, z1 + (opt.into || 0.4), M.pole);
}

// A vertical scaffold pole.
export function pole(k, x, z, y0, y1, r = 0.07) { k.cyl(x, y0, z, r, y1 - y0, M.pole, { seg: 6 }); }

// A ladder leaning against something: foot at (x, y0, zf), top at (x, y1, zt).
export function ladder(k, x, y0, y1, zf, zt, w = 0.5) {
  const m = M.pole;
  k.beam([x - w / 2, y0, zf], [x - w / 2, y1, zt], 0.06, m);
  k.beam([x + w / 2, y0, zf], [x + w / 2, y1, zt], 0.06, m);
  for (let y = y0 + 0.3; y < y1 - 0.1; y += 0.32) { const t = (y - y0) / (y1 - y0); k.cyl(x - w / 2, y, zf + (zt - zf) * t, 0.022, w, m, { axis: 'x', seg: 5 }); }
}

// ------------------------------------------------------------------ general prisms
// Extrude a 2D outline (with holes) between depths d0 and d1. map(u, v, d) returns the
// scene point; use it for walls that run across the axis (outline in z-y, depth along x).
export function prism(k, outline, holes, map, d0, d1, m, opt = {}) {
  const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
  const O = area(outline) < 0 ? outline.slice().reverse() : outline.slice();
  const H = (holes || []).map((h) => (area(h) < 0 ? h.slice().reverse() : h.slice()));
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const nF = sub(map(0, 0, d0), map(0, 0, d1)), nB = sub(map(0, 0, d1), map(0, 0, d0));
  const side = opt.side || m, rev = opt.reveal || side;
  const edges = (P, hole, mm) => {
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length];
      const du = q[0] - p[0], dv = q[1] - p[1];
      const nu = hole ? -dv : dv, nv = hole ? du : -du; // outward from the material
      const W = sub(map(p[0] + nu, p[1] + nv, d0), map(p[0], p[1], d0));
      oq(k, map(p[0], p[1], d0), map(q[0], q[1], d0), map(q[0], q[1], d1), map(p[0], p[1], d1), mm, W);
    }
  };
  edges(O, false, side);
  for (const h of H) edges(h, true, rev);
  const tris = THREE.ShapeUtils.triangulateShape(O.map((p) => new THREE.Vector2(p[0], p[1])), H.map((h) => h.map((p) => new THREE.Vector2(p[0], p[1]))));
  const all = O.concat(...H);
  const fm = opt.front || m, bm = opt.back || m;
  for (const t of tris) {
    const a = all[t[0]], b = all[t[1]], c = all[t[2]];
    if (opt.frontFace !== false) k._oriented(map(a[0], a[1], d0), map(b[0], b[1], d0), map(c[0], c[1], d0), nF, fm);
    if (opt.backFace !== false) k._oriented(map(a[0], a[1], d1), map(b[0], b[1], d1), map(c[0], c[1], d1), nB, bm);
  }
}

// Wall across the axis: outline in (z, y), thickness from x0 to x1.
export const mapZY = (u, v, d) => [d, v, u];
// Wall along the axis: outline in (x, y), depth from z0 to z1.
export const mapXY = (u, v, d) => [u, v, d];
