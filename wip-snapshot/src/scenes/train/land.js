/* The hero frame's setting: the Royal Border Bridge over the Tweed at Berwick, looking
 * east (downstream) from the west side of the line.
 *
 * Verified: 28 arches of 60 ft (18.3 m), 659 m long, rails 37 m above the river (S23);
 * downstream, the 1928 concrete Royal Tweed Bridge (four unequal arches, 430 m, S25) and
 * the sandstone Berwick Bridge of 1624 (15 arches, 355 m, S26). Pier widths, bank shapes,
 * the river's width, distances to the other bridges and the town are illustrative.
 */
import { THREE, mat, shade, noise2, makeSea } from '../../engine/index.js';
import { M, GAUGE } from './common.js';

export const RIVER = -37.0;      // water level, 37 m below the rails
const BED = -40.0;
export const PITCH = 22.4, SPAN = 18.3, PIER = PITCH - SPAN;
export const BRIDGE_X0 = -230, NARCH = 28;
export const BRIDGE_X1 = BRIDGE_X0 + NARCH * PITCH + PIER + 26;
const DECK = -0.55;               // top of the masonry under the ballast
const ZN = -3.2, ZF = 5.6;       // bridge faces (west, east), double track

// River centre and half width as they change downstream (z), and the ground height.
export const riverC = (z) => 100 + 0.06 * z + 30 * Math.sin(z / 420);
export const riverW = (z) => 78 + 0.22 * Math.max(0, z);
export function ground(x, z) {
  const d = Math.abs(x - riverC(z)) - riverW(z);
  const n = noise2(x * 0.012, z * 0.012, 7) * 6 + noise2(x * 0.05, z * 0.05, 3) * 1.5;
  if (d < 0) return BED + (d > -14 ? ((14 + d) / 14) * 2.6 : 0);
  const north = x < riverC(z);
  // North bank (Berwick) climbs higher and sooner; the south bank (Tweedmouth) rises gently.
  const reach = north ? 230 : 300;
  const top = north ? -1.5 : -3.5;
  const u = Math.min(1, d / reach);
  const s = u * u * (3 - 2 * u);
  return RIVER - 0.6 + (top - RIVER + 0.6) * Math.pow(s, 0.85) + n * Math.min(1, d / 40);
}

const STONE = mat({ c: '#c8ad86', c2: '#b39670', pat: 'ashlar', s: 0.62, cut: '#8e6a56' });
const BRICK = mat({ c: '#a8644a', c2: '#8a4e38', pat: 'brick', s: 4.0, cut: '#8e6a56' });
const SOFFIT = mat({ c: '#9a5a44', c2: '#844a36', pat: 'brick', s: 1.4, cut: '#8e6a56' });

// ------------------------------------------------------------------ the viaduct
function viaduct(k, S) {
  const x0 = BRIDGE_X0, x1 = BRIDGE_X1;
  const rr = SPAN / 2, spring = DECK - 2.0 - rr;
  S.piers = [];
  // The whole arcade as one outline (no seams in the cut): along the bottom from the north
  // abutment, round every arch, up the south abutment, and back along the deck.
  const pts = [];
  const pierX = (i) => x0 + 13 + PIER / 2 + i * PITCH;
  const foot = (px) => Math.max(BED - 0.6, ground(px, 2.5) - 0.8);
  const xa = pierX(0) - PIER / 2 - 26, xb = pierX(NARCH) + PIER / 2 + 26;
  pts.push([xa, foot(pierX(0))]);
  for (let i = 0; i <= NARCH; i++) {
    const px = pierX(i), g = foot(px);
    S.piers.push(px);
    if (i < NARCH) {
      pts.push([px + PIER / 2, g], [px + PIER / 2, spring]);
      const cx = px + PITCH / 2;
      for (let j = 1; j < 16; j++) { const a = Math.PI - (j / 16) * Math.PI; pts.push([cx + rr * Math.cos(a), spring + rr * Math.sin(a)]); }
      const gn = foot(pierX(i + 1));
      pts.push([px + PITCH - PIER / 2, spring], [px + PITCH - PIER / 2, gn]);
    }
  }
  pts.push([xb, foot(pierX(NARCH))], [xb, DECK], [xa, DECK]);
  k.extrude(pts, ZN, ZF, BRICK, { front: false, back: STONE, side: SOFFIT });
  for (const px of S.piers) k.box(px - PIER / 2 - 0.05, foot(px) + 0.6, ZF + 0.005, px + PIER / 2 + 0.05, spring, ZF + 0.12, STONE);
  // String course and the far parapet with its coping.
  k.box(x0, DECK - 0.5, ZF + 0.005, x1, DECK - 0.2, ZF + 0.25, mat({ c: '#d4bc96', c2: '#c0a47e', pat: 'ashlar', s: 0.3 }));
  k.box(x0, DECK, ZF - 0.55, x1, 0.85, ZF, STONE);
  k.box(x0, 0.85, ZF - 0.62, x1, 1.0, ZF + 0.07, mat({ c: '#d8c4a0', c2: '#c4ae88', pat: 'ashlar', s: 0.25 }));
  // Ballast bed for both lines; sleepers and bullhead rails in the view.
  k.box(x0, DECK, ZN + 0.4, x1, -0.22, ZF - 0.55, M.ballast);
  const sl0 = -40, sl1 = 220;
  for (let x = sl0; x < sl1; x += 0.76) {
    k.box(x, -0.28, -1.35, x + 0.25, -0.15, 1.35, M.sleeper);
    k.box(x, -0.28, 3.4 - 1.35, x + 0.25, -0.15, 3.4 + 1.35, M.sleeper);
  }
  for (const zc of [0, 3.4]) for (const s of [-1, 1]) {
    const z = zc + s * GAUGE;
    k.box(x0, -0.15, z - 0.035, x1, -0.01, z + 0.035, M.rail);
    k.box(x0, -0.01, z - 0.03, x1, 0.0, z + 0.03, mat({ c: '#c8ccd0' }));
  }
  // Cess path and cable trough along the far side.
  k.box(x0, -0.22, ZF - 1.3, x1, -0.12, ZF - 0.6, mat({ c: '#6a645a', c2: '#5a544a', pat: 'speckle' }));
  // Cutwaters on the piers that stand in the river (downstream faces), refuges in the parapet.
  for (const px of S.piers) {
    const g = ground(px, 8);
    if (g < RIVER + 0.5) k.box(px - PIER / 2 + 0.3, BED, ZF + 0.005, px + PIER / 2 - 0.3, RIVER + 2.5, ZF + 1.2, STONE);
    k.box(px - PIER / 2 - 0.2, DECK - 2.6, ZF + 0.005, px + PIER / 2 + 0.2, DECK - 0.5, ZF + 0.18, STONE);
  }
}

// ------------------------------------------------------------------ terrain, river, sea
function terrain(k) {
  const xs = [];
  for (let x = -900; x < -320; x += 40) xs.push(x);
  for (let x = -320; x < 520; x += 10) xs.push(x);
  for (let x = 520; x <= 1300; x += 40) xs.push(x);
  const zs = [-3, 0.6, 3, 6, 10, 15, 21, 28, 36, 46, 58, 72, 90, 112, 140, 175, 215, 260, 310, 370, 440, 520, 610, 710, 820, 940, 1080, 1240];
  const G = zs.map((z) => xs.map((x) => ground(x, z)));
  const grass = [mat({ c: '#7e8c52', c2: '#6a7a44', pat: 'speckle' }), mat({ c: '#8a9658', c2: '#76844a', pat: 'speckle' }), mat({ c: '#a8a060', c2: '#c4b46a', pat: 'stripes', s: 3.5 }), mat({ c: '#9aa262', c2: '#7a8a4a', pat: 'stripes', s: 2.8 }), mat({ c: '#b8a868', c2: '#a89458', pat: 'stripes', s: 4.0 })];
  const mud = mat({ c: '#9a8a68', c2: '#8a7a58', pat: 'speckle' });
  const bed = mat({ c: '#6a6450', c2: '#5a5440', pat: 'rock' });
  const earth = mat({ c: '#8a7256', c2: '#74604a', pat: 'stone', s: 1.8, cut: '#54463a' });
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    const a = [xs[i], G[j][i], zs[j]], b = [xs[i + 1], G[j][i + 1], zs[j]], c = [xs[i + 1], G[j + 1][i + 1], zs[j + 1]], d = [xs[i], G[j + 1][i], zs[j + 1]];
    const y = (a[1] + b[1] + c[1] + d[1]) / 4;
    const field = Math.floor(xs[i] / 90) * 7 + Math.floor(zs[j] / 120) * 3;
    const m = y < RIVER - 0.3 ? bed : y < RIVER + 1.2 ? mud : (Math.abs(xs[i] - 100) > 220 || zs[j] > 200) ? grass[((field % 5) + 5) % 5] : grass[field & 1];
    k.quad(a, d, c, b, m);
  }
  // Close a thin slab behind the cut so the section shows earth (kept small: big hidden faces
  // still cost fragment shading in a software renderer).
  const yB = -48, zb = 9;
  for (let i = 0; i < xs.length - 1; i++) {
    if (xs[i + 1] < -60 || xs[i] > 260) continue;
    const g0 = ground(xs[i], zb), g1 = ground(xs[i + 1], zb);
    k.quad([xs[i], yB, zb], [xs[i + 1], yB, zb], [xs[i + 1], g1 - 0.4, zb], [xs[i], g0 - 0.4, zb], earth);
    k.quad([xs[i], yB, zs[0]], [xs[i + 1], yB, zs[0]], [xs[i + 1], yB, zb], [xs[i], yB, zb], earth);
  }
}

function river(k, S) {
  const sea = makeSea({ level: RIVER, x0: -900, x1: 1300, detailX0: -200, detailX1: 400, step: 6, depth: 3000, mask: (x, z) => ground(x, z) > RIVER + 0.8, maskBox: [-500, 0, 900, 1300], deep: '#2a5a6e', shallow: '#4a7e86', amp: 0.35 });
  k.object(sea);
  // The river's cut face where the section passes through the water.
  const z = 0.01;
  k.sheet(riverC(0) - riverW(0) - 3, riverC(0) + riverW(0) + 3, BED - 0.2, RIVER, z, { c: '#3a7088', alpha: 0.42 });
  void S;
}

// ------------------------------------------------------------------ downstream bridges and the town
function concreteBridge(k) {
  // The Royal Tweed Bridge: four unequal concrete arches, high at the Berwick end.
  const z = 360, x0 = riverC(z) - riverW(z) - 70, x1 = riverC(z) + riverW(z) + 40;
  const C = mat({ c: '#d4d0c4', c2: '#c4c0b4', cut: '#a8a498' });
  const deckY = (x) => -8 - 22 * ((x - x0) / (x1 - x0));
  const spans = [0.34, 0.27, 0.22, 0.17];
  let ax = x0 + 20;
  const L = x1 - x0 - 40;
  for (const f of spans) {
    const w = L * f, cx = ax + w / 2, rise = w * 0.28, foot = Math.max(RIVER, ground(cx, z) - 1);
    const pts = [];
    for (let j = 0; j <= 12; j++) { const t = j / 12; const x = ax + w * t; pts.push([x, foot + Math.sin(Math.PI * t) * rise, z]); }
    k.tube(pts, 1.1, C, { seg: 6 });
    // Spandrel columns up to the deck.
    for (let j = 1; j < 12; j += 2) { const p = pts[j]; if (deckY(p[0]) - p[1] > 1) k.box(p[0] - 0.5, p[1], z - 0.6, p[0] + 0.5, deckY(p[0]), z + 0.6, C); }
    k.box(ax - 2.5, foot - 2, z - 3, ax + 2.5, deckY(ax), z + 3, C);
    ax += w;
  }
  k.box(ax - 2.5, ground(ax, z) - 2, z - 3, ax + 2.5, deckY(ax), z + 3, C);
  for (let x = x0; x < x1; x += 12) k.box(x, deckY(x + 6) - 1.2, z - 3.2, x + 12.2, deckY(x + 6), z + 3.2, C);
  for (let x = x0; x < x1; x += 12) k.box(x, deckY(x + 6), z - 3.2, x + 12.2, deckY(x + 6) + 1.1, z - 2.9, C);
}

function oldBridge(k) {
  // Berwick Bridge: fifteen sandstone arches, low over the water, rising to the Berwick end.
  const z = 520, x0 = riverC(z) - riverW(z) - 20, x1 = riverC(z) + riverW(z) + 10;
  const S2 = mat({ c: '#c09a78', c2: '#a88262', pat: 'ashlar', s: 0.5, cut: '#9a7458' });
  const n = 15, P = (x1 - x0) / n;
  const top = (x) => RIVER + 13 - 6 * ((x - x0) / (x1 - x0));
  const holes = [];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * P + 2.2, b = x0 + (i + 1) * P - 2.2, cx = (a + b) / 2, rr = (b - a) / 2;
    const sp = RIVER + 1.2 + (top(cx) - RIVER - 13) * 0.5;
    const h = [[a, RIVER - 1.5], [b, RIVER - 1.5]];
    for (let j = 0; j <= 10; j++) { const t = (j / 10) * Math.PI; h.push([cx + Math.cos(t) * rr, sp + Math.sin(t) * rr * 0.8]); }
    h.splice(2, 1);
    holes.push(h);
  }
  const prof = [[x0, RIVER - 3], [x1, RIVER - 3], [x1, top(x1)], [x0, top(x0)]];
  k.extrude(prof, z - 3, z + 3, S2, { holes });
  for (let i = 1; i < n; i++) k.box(x0 + i * P - 2.0, RIVER - 2, z - 5.5, x0 + i * P + 2.0, top(x0 + i * P) - 3, z - 3, S2); // cutwaters
}

function town(k) {
  // Berwick on its hill above the north bank: red roofs, grey walls, lit windows at night.
  const r = k.rng('town');
  const roofs = ['#a8503a', '#b85e44', '#9a4a36', '#8a5a4a', '#6a6a72'];
  const walls = ['#d8ccb4', '#c8b89a', '#b8a888', '#e0d4bc', '#a89a86'];
  const win = mat({ c: '#6a6a72', c2: '#ffd27a', pat: 'panes', s: 0.9, glow: 'night' });
  const place = (x, z, rot) => {
    const g = ground(x, z);
    if (g < RIVER + 2.5) return;
    const w = 7 + r() * 8, d = 6 + r() * 4, h = 6 + r() * 7;
    const wall = mat({ c: r.pick(walls), c2: shade(r.pick(walls), -0.1), pat: 'ashlar', s: 0.5 });
    const rm = mat({ c: r.pick(roofs), c2: '#6a3a2a', pat: 'slates', s: 0.6 });
    const c = Math.cos(rot), s = Math.sin(rot);
    const P = (u, y, v) => [x + u * c - v * s, y, z + u * s + v * c];
    // Walls (as a rotated box) and a pitched roof.
    k.boxR(x, g - 2 + (h + 2) / 2, z, w, h + 2, d, wall, { y: -rot });
    k.boxR(x - s * (-d / 2 - 0.03), g + h * 0.55, z + c * (-d / 2 - 0.03), w * 0.8, h * 0.45, 0.05, win, { y: -rot });
    const y0 = g + h, y1 = y0 + d * 0.45;
    k.quad(P(-w / 2, y0, -d / 2 - 0.3), P(w / 2, y0, -d / 2 - 0.3), P(w / 2, y1, 0), P(-w / 2, y1, 0), rm);
    k.quad(P(-w / 2, y0, d / 2 + 0.3), P(-w / 2, y1, 0), P(w / 2, y1, 0), P(w / 2, y0, d / 2 + 0.3), rm);
    k.tri(P(-w / 2, y0, -d / 2), P(-w / 2, y0, d / 2), P(-w / 2, y1, 0), wall);
    k.tri(P(w / 2, y0, d / 2), P(w / 2, y0, -d / 2), P(w / 2, y1, 0), wall);
    if (r() < 0.7) k.box(x + (r() - 0.5) * w * 0.6 - 0.5, y1 - 1.0, z - 0.5, x + (r() - 0.5) * w * 0.6 + 0.5, y1 + 1.4, z + 0.5, wall);
  };
  // Streets climbing from the quay on the north bank, downstream of the viaduct.
  for (let row = 0; row < 26; row++) {
    const z = 230 + row * 30 + r() * 10;
    const edge = riverC(z) - riverW(z) - 18;
    for (let i = 0; i < 9; i++) {
      const x = edge - i * 17 - r() * 6;
      if (r() < 0.15) continue;
      place(x, z + r() * 8, (r() - 0.5) * 0.2);
    }
  }
  // Tweedmouth, lower on the south bank.
  for (let row = 0; row < 14; row++) {
    const z = 300 + row * 34 + r() * 10;
    const edge = riverC(z) + riverW(z) + 16;
    for (let i = 0; i < 6; i++) if (r() > 0.25) place(edge + i * 18 + r() * 6, z + r() * 8, (r() - 0.5) * 0.2);
  }
  // A quay wall along the Berwick bank.
  for (let z = 300; z < 1100; z += 40) {
    const x = riverC(z) - riverW(z) - 1;
    k.box(x - 4, RIVER - 1, z, x, RIVER + 3.2, z + 40.5, mat({ c: '#a89a84', c2: '#968872', pat: 'ashlar', s: 0.5 }));
  }
  // The fishermen's shiel on the south bank, close under the viaduct.
  const sx = riverC(30) + riverW(30) + 9, sz = 30, sg = ground(sx, sz);
  k.box(sx - 3, sg - 0.5, sz - 2, sx + 3, sg + 2.6, sz + 2, mat({ c: '#b8aa90', c2: '#a89a80', pat: 'stone', s: 0.35 }));
  k.quad([sx - 3.3, sg + 2.6, sz - 2.3], [sx + 3.3, sg + 2.6, sz - 2.3], [sx + 3.3, sg + 3.8, sz], [sx - 3.3, sg + 3.8, sz], mat({ c: '#8a4a3a', pat: 'slates', s: 0.4 }));
  k.quad([sx - 3.3, sg + 2.6, sz + 2.3], [sx - 3.3, sg + 3.8, sz], [sx + 3.3, sg + 3.8, sz], [sx + 3.3, sg + 2.6, sz + 2.3], mat({ c: '#8a4a3a', pat: 'slates', s: 0.4 }));
  k.box(sx - 0.5, sg, sz - 2.05, sx + 0.5, sg + 1.9, sz - 2.0, mat({ c: '#5a4030' }));
  k.box(sx + 1.2, sg + 1.1, sz - 2.05, sx + 2.0, sg + 1.7, sz - 2.0, mat({ c: '#8a9aa0', c2: '#ffd27a', glow: 'night' }));
  k.lamp(sx + 1.6, sg + 1.4, sz - 2.3, { color: '#ffc070', r: 3, i: 0.5, bulb: false, halo: 1.0 });
  // Net-drying poles.
  for (let i = 0; i < 4; i++) k.cyl(sx + 5 + i * 2.5, sg, sz - 4, 0.08, 2.4, mat({ c: '#6a5a44' }), { seg: 5 });
  k.box(sx + 5, sg + 1.4, sz - 4.05, sx + 12.5, sg + 2.3, sz - 3.95, mat({ c: '#6a6a5a', c2: '#4a4a3a', pat: 'quilt', s: 0.12, thin: true }));
  // Sheep on the south bank meadows.
  for (let i = 0; i < 14; i++) {
    const x = riverC(60) + riverW(60) + 30 + r() * 140, z = 40 + r() * 140, g = ground(x, z);
    k.sphere(x, g + 0.55, z, 0.55, mat({ c: '#ece6d8', noEdge: false }), { seg: 7, rings: 5 });
    k.sphere(x + 0.55, g + 0.7, z, 0.2, mat({ c: '#2a2622' }), { seg: 6, rings: 4 });
  }
  // Moored cobles by the shiel, and trees along the banks and hedgerows.
  for (let i = 0; i < 2; i++) {
    const bx = riverC(48 + i * 9) + riverW(48 + i * 9) - 3.5, bz = 48 + i * 9;
    k.boxR(bx, RIVER + 0.25, bz, 5.2, 0.5, 1.6, mat({ c: i ? '#5a7a6a' : '#4a6a7a' }), { y: 0.3 });
  }
  const leaf = [mat({ c: '#5a6e3a', c2: '#4a5e2e', pat: 'speckle' }), mat({ c: '#6a7a42', c2: '#56683a', pat: 'speckle' }), mat({ c: '#4e6236', c2: '#3e5228', pat: 'speckle' })];
  const trunk = mat({ c: '#5a4a38' });
  let planted = 0;
  for (let i = 0; i < 400 && planted < 110; i++) {
    const z = 18 + Math.pow(r(), 1.3) * 700, x = -250 + r() * 650;
    const d = Math.abs(x - riverC(z)) - riverW(z);
    if (d < 6 || d > 160) continue;
    if (x < riverC(z) && z > 220) continue; // the town
    const g = ground(x, z), h = 5 + r() * 6;
    k.cyl(x, g - 0.5, z, 0.3, h * 0.5, trunk, { seg: 5 });
    k.sphere(x, g + h * 0.62, z, h * 0.38, leaf[i % 3], { seg: 8, rings: 5 });
    if (r() < 0.5) k.sphere(x + h * 0.25, g + h * 0.5, z + 1, h * 0.28, leaf[(i + 1) % 3], { seg: 7, rings: 4 });
    planted++;
  }
  return { shiel: [sx, sg, sz] };
}

export function buildLand(k, S) {
  viaduct(k, S);
  terrain(k);
  river(k, S);
  concreteBridge(k);
  oldBridge(k);
  S.town = town(k);
}

// ------------------------------------------------------------------ life on the river
export function landLife(W, k, S) {
  // The coble rows a half circle across the stream, paying out the net; the boy holds the shore end.
  const sx = riverC(30) + riverW(30) - 2, sz = 34;
  const coble = k.part(0, 0, 0, (q) => {
    const wood = mat({ c: '#4a6a7a', cut: '#3a4a52' }), tar = mat({ c: '#2a2622' });
    q.loft([-2.6, -1.6, 0, 1.6, 2.4].map((x, i) => {
      const w = [0.15, 0.75, 0.9, 0.7, 0.1][i], h = [0.7, 0.55, 0.5, 0.55, 0.75][i];
      return { x, pts: [[-w, h], [-w * 0.7, 0.05], [w * 0.7, 0.05], [w, h]] };
    }), wood);
    q.box(-2.0, 0.42, -0.62, 2.0, 0.47, -0.55, tar);
    q.box(-0.5, 0.35, -0.6, -0.1, 0.4, 0.6, mat({ c: '#8a6a44' }));
    q.box(1.0, 0.4, -0.3, 1.9, 0.6, 0.3, mat({ c: '#5a5a4a', c2: '#3a3a2a', pat: 'quilt', s: 0.1 })); // the net heaped in the stern
  });
  const floats = [];
  for (let i = 0; i < 7; i++) floats.push(k.part(0, RIVER + 0.05, 0, (q) => q.sphere(0, 0, 0, 0.16, mat({ c: '#e8d8b0' }), { seg: 6, rings: 4 })));
  const arc = (u) => {
    const a = Math.PI * u;
    return [sx - Math.sin(a) * 42, RIVER, sz + 22 - Math.cos(a) * 22];
  };
  W.data.coble = { u: 0 };
  W.addActor({
    object: coble,
    update(dt, t) {
      const C = W.data.coble;
      const cyc = 160; // seconds for one shot of the net
      C.u = (t % cyc) / cyc;
      const u = Math.min(1, C.u * 1.35);
      const p = arc(u), p2 = arc(Math.min(1, u + 0.01));
      coble.position.set(p[0], RIVER - 0.2 + Math.sin(t * 1.3) * 0.05, p[2]);
      coble.rotation.y = -Math.atan2(p2[2] - p[2], p2[0] - p[0]) + Math.PI;
      coble.rotation.z = Math.sin(t * 1.1) * 0.03;
      for (let i = 0; i < floats.length; i++) {
        const fu = (i / floats.length) * u;
        const f = arc(fu);
        floats[i].position.set(f[0], RIVER + 0.02 + Math.sin(t * 1.5 + i) * 0.04, f[2]);
        floats[i].visible = fu > 0.01;
      }
    },
  });
  S.coble = coble;
  // Evening chimney smoke over Berwick.
  for (const [x, z] of [[-60, 330], [-110, 420], [-40, 520], [-150, 600], [-80, 700]]) W.emitter({ kind: 'smoke', x, y: ground(x, z) + 14, z, rate: 0.6, vx: 1.5, vy: 1.2, size: [2, 10], color: '#9a948e', alpha: 0.35 });
  S.shoreNet = [sx + 1.5, ground(sx + 1.5, sz + 1), sz + 1];
  // Gulls over the estuary by day.
  const gulls = [];
  for (let g = 0; g < 5; g++) {
    const gull = k.part(0, 0, 0, (q) => {
      const w = mat({ c: '#f2f0ea', thin: true, whole: true });
      q.sphere(0, 0, 0, 0.16, mat({ c: '#f2f0ea', whole: true }), { seg: 6, rings: 4 });
      q.boxR(0, 0.02, 0.45, 0.22, 0.02, 0.8, w, { x: 0.25 });
      q.boxR(0, 0.02, -0.45, 0.22, 0.02, 0.8, w, { x: -0.25 });
    });
    gulls.push(gull);
    W.addActor({ object: gull, update(dt, t, w) {
      gull.visible = w.sun().day > 0.25;
      const ph = t * (0.05 + g * 0.006) + g * 1.7;
      const cx = 60 + g * 22, cz = 40 + (g % 4) * 30;
      gull.position.set(cx + Math.cos(ph) * (30 + g * 3), -18 + (g % 5) * 5 + Math.sin(t * 0.4 + g) * 2, cz + Math.sin(ph) * (20 + g * 2));
      gull.rotation.y = -ph - Math.PI / 2;
      gull.rotation.x = Math.sin(t * 5 + g) * 0.25;
    } });
  }
  void THREE;
}
