/* Submarine scene: outer hull, pressure hull, tanks, bulkheads, decks, superstructure,
 * conning tower, bridge fairwater, deck fittings and the water around her.
 */
import { mat, makeSea } from '../../engine/index.js';
import {
  X, DECK, LOW, CT, BRIDGE, WL, DAY_SEA, LOA, M, NS, keelY, deckY, phR, phY, phIn, roomZ, outerSection, inset,
  halfBeam, deckHalf, drySpanAt, hullSpanAt, clamp,
} from './geom.js';

// ------------------------------------------------------------------ helpers
// z of the outer skin at height y (on the side, below the deck edge).
export function outerZ(x, y) {
  const P = outerSection(x);
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    if (b[1] <= a[1]) break; // reached the deck crown
    if (y >= a[1] && y <= b[1]) { const t = (y - a[1]) / Math.max(1e-6, b[1] - a[1]); return a[0] + (b[0] - a[0]) * t; }
  }
  return 0;
}
const stationsSkin = () => {
  const xs = [0.03, 0.15, 0.35, 0.6, 0.9, 1.3, 1.8, 2.4, 3.1, 3.9, 4.8, 5.8, 6.9, 8.0, 9.2, 10.5, 12, 13.5, 15, 17, 19, 21, 23.5, 26, 29];
  for (let x = 32; x <= 70; x += 3) xs.push(x);
  xs.push(72.5, 75, 77.5, 80, 82, 84, 85.5, 87, 88.3, 89.5, 90.6, 91.6, 92.5, 93.3, 94, 94.5, 94.85, 95.0);
  return xs;
};

// ------------------------------------------------------------------ outer skin
function skinMat(y, x) {
  if (y < WL - 0.25) return M.bottom;
  if (y < 5.7) return M.greyLo;
  if (y < deckY(x) - 0.06) return M.greyHi;
  return M.deck;
}
export function buildSkin(k) {
  const secs = [];
  for (const x of stationsSkin()) {
    const out = outerSection(x);
    const K = keelY(x), D = deckY(x), Bm = halfBeam(x);
    const t = Math.min(0.08, Bm * 0.25, (D - K) * 0.2);
    const inn = inset(out, t);
    const pts = [[-0.3, out[0][1]]].concat(out, [[-0.3, out[NS - 1][1]], [-0.3, inn[NS - 1][1]]], inn.slice().reverse(), [[-0.3, inn[0][1]]]);
    secs.push({ x, pts });
  }
  const nOut = NS + 1;
  k.loft(secs, M.greyHi, {
    matFn: (s, i, A, B) => {
      if (i <= nOut - 1 || i === nOut) {
        const p = A.pts[i], q = A.pts[(i + 1) % A.pts.length];
        return skinMat((p[1] + q[1]) / 2, A.x);
      }
      return M.skinIn;
    },
    cap: M.skinIn,
  });
  // Keel bar along the bottom.
  for (let x = 13; x < 80; x += 6) k.box(x, -0.06, -0.3, Math.min(80, x + 6), 0.02, 0.18, M.bottom);
}

// ------------------------------------------------------------------ pressure hull
function phStations() {
  const xs = [X.phF, 10.2, 10.9, X.ftrF, 12.5, 13.5, 14.6, 15.8, 17, 18.5, 20, 21.5, X.fb];
  for (let x = 25; x < X.atr; x += 2.5) xs.push(x);
  xs.push(X.atr, 78, 79.5, 81, 82.5, 84, 85.3, 86.5, X.phA);
  return xs.sort((a, b) => a - b);
}
function phInnerMat(x, y) {
  const deck = x < X.fb ? DECK.ftr : x < X.cr ? DECK.fb : x < X.ab ? DECK.cr : DECK.eng;
  if (y < deck - 0.05) return M.phLow;
  if (x > X.fer && x < X.man) return M.phEng;
  return M.ph;
}
export function buildPressureHull(k) {
  const N = 22;
  const secs = [];
  for (const x of phStations()) {
    const c = phY(x), R = phR(x), Ri = R - 0.1;
    const pts = [[-0.3, c - R]];
    for (let i = 0; i <= N; i++) { const f = (i / N) * Math.PI; pts.push([R * Math.sin(f), c - R * Math.cos(f)]); }
    pts.push([-0.3, c + R], [-0.3, c + Ri]);
    for (let i = N; i >= 0; i--) { const f = (i / N) * Math.PI; pts.push([Ri * Math.sin(f), c - Ri * Math.cos(f)]); }
    pts.push([-0.3, c - Ri]);
    secs.push({ x, pts });
  }
  k.loft(secs, M.ph, {
    matFn: (s, i, A) => {
      const p = A.pts[i];
      if (i <= N + 1) return M.phOut;
      if (i <= N + 3) return M.ph;
      return phInnerMat(A.x, p[1]);
    },
    cap: M.ph,
  });
  // Frames: shallow ribs on the inside, every 0.76 m in the midbody, 0.61 m at the ends.
  const ribs = [];
  for (let x = X.ftrF + 0.6; x < X.phA - 0.4; ) { ribs.push(x); x += x > 21 && x < 78 ? 0.76 : 0.61; }
  for (const x of ribs) {
    if (Object.values(X).some((b) => Math.abs(b - x) < 0.25)) continue;
    const c = phY(x), Ri = phIn(x) + 0.005;
    const pts = [[-0.3, c + Ri]];
    const n = 10;
    for (let i = 0; i <= n; i++) { const f = Math.PI - (i / n) * Math.PI * 0.62; pts.push([Ri * Math.sin(f), c - Ri * Math.cos(f)]); }
    const inner = pts.slice(1).map(([z, y]) => { const l = Math.hypot(z, y - c) || 1; return [z - (z / l) * 0.07, y - ((y - c) / l) * 0.07]; }).reverse();
    const poly = pts.concat(inner, [[-0.3, c + Ri - 0.07]]);
    k.extrudeX(poly, x - 0.035, x + 0.035, M.frame);
  }
}

// ------------------------------------------------------------------ tanks between the hulls
const TANKS = [[X.phF, 17, 'trim'], [17, X.cr, 'fuel'], [X.cr, 48, 'mbt'], [48, 66, 'fuel'], [66, X.atr, 'mbt'], [X.atr, X.phA, 'mbt']];
function tankSection(x) {
  const out = outerSection(x);
  const K = keelY(x), D = deckY(x), Bm = halfBeam(x);
  const t = Math.min(0.08, Bm * 0.25, (D - K) * 0.2) + 0.01;
  const inn = inset(out, t);
  const c = phY(x), R = phR(x) + 0.01;
  const ytt = c + 0.55 * R;
  // Inner skin from the keel up to the tank top, resampled.
  const yAt = (y) => {
    for (let i = 1; i < inn.length; i++) {
      const a = inn[i - 1], b = inn[i];
      if (b[1] <= a[1]) break;
      if (y >= a[1] && y <= b[1]) { const u = (y - a[1]) / Math.max(1e-6, b[1] - a[1]); return a[0] + (b[0] - a[0]) * u; }
    }
    return inn[0][0];
  };
  const pts = [[-0.3, inn[0][1]]];
  const n = 14;
  for (let i = 0; i <= n; i++) { const y = inn[0][1] + (ytt - inn[0][1]) * (i / n); pts.push([Math.max(i === 0 ? 0 : 0.05, yAt(y)), y]); }
  const ft = Math.acos(clamp((c - ytt) / R, -1, 1));
  const m = 12;
  for (let i = 0; i <= m; i++) { const f = ft * (1 - i / m); pts.push([R * Math.sin(f), c - R * Math.cos(f)]); }
  pts.push([-0.3, c - R]);
  return pts;
}
export function buildTanks(k) {
  for (const [x0, x1, kind] of TANKS) {
    const secs = [];
    const n = Math.max(2, Math.ceil((x1 - x0) / 2));
    for (let i = 0; i <= n; i++) { const x = x0 + ((x1 - x0) * i) / n; secs.push({ x, pts: tankSection(x) }); }
    k.loft(secs, M[kind] || M.mbt);
  }
}

// ------------------------------------------------------------------ bulkheads, decks and flats
// A bulkhead disc (half) at x, with an optional door notch at the cut (z from -0.3 to dz).
export function bulkhead(k, x, opt = {}) {
  const c = phY(x), r = phIn(x) + 0.03, t = opt.t || 0.14;
  const pts = [];
  const n = 20;
  const door = opt.door; // [y0, y1, zw]
  pts.push([-0.3, c - r]);
  for (let i = 0; i <= n; i++) { const f = (i / n) * Math.PI; pts.push([r * Math.sin(f), c - r * Math.cos(f)]); }
  pts.push([-0.3, c + r]);
  let poly = pts;
  if (door) {
    const [y0, y1, zw] = door;
    poly = pts.slice(0, -1).concat([[-0.3, c + r], [-0.3, y1], [zw, y1], [zw, y0], [-0.3, y0]]);
    // Re-order: the notch lies on the cut edge between the top and bottom ends.
    poly = [[-0.3, c - r]].concat(pts.slice(1, -1), [[-0.3, c + r], [-0.3, y1 + 0.0001], [zw, y1], [zw, y0], [-0.3, y0 - 0.0001]]);
  }
  const lowSplit = opt.split;
  k.extrudeX(poly, x - t / 2, x + t / 2, opt.mat || M.bulk);
  if (door) {
    // Door frame: a thick rim round the opening, and the open door folded back against the bulkhead.
    const [y0, y1, zw] = door;
    const rim = mat({ c: '#7e847e', cut: '#4e544e' });
    k.box(x - t / 2 - 0.05, y0 - 0.08, -0.3, x + t / 2 + 0.05, y0, zw + 0.08, rim);
    k.box(x - t / 2 - 0.05, y1, -0.3, x + t / 2 + 0.05, y1 + 0.08, zw + 0.08, rim);
    k.box(x - t / 2 - 0.05, y0 - 0.08, zw, x + t / 2 + 0.05, y1 + 0.08, zw + 0.08, rim);
    if (opt.leaf !== false) k.box(x + t / 2 + 0.02, y0 - 0.05, zw + 0.1, x + t / 2 + 0.08, y1 + 0.05, zw + 0.92, M.door);
  }
  void lowSplit;
}
// A deck slab across the hull at height y, from x0 to x1, out to the hull wall.
export function deckSlab(k, x0, x1, y, m, opt = {}) {
  const t = opt.t || 0.12;
  const n = Math.max(1, Math.ceil((x1 - x0) / 1.5));
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
    const zw = Math.min(roomZ(a, y - t), roomZ(b, y - t), roomZ(a, y), roomZ(b, y)) + 0.02;
    k.box(a, y - t, -0.3, b, y, Math.min(opt.z1 || 99, zw), m);
  }
}

export function buildDecks(k) {
  // Main level.
  deckSlab(k, X.ftrF + 0.07, X.fb - 0.07, DECK.ftr, M.plate);
  deckSlab(k, X.fb + 0.07, X.pantry, DECK.fb, M.plate);
  deckSlab(k, X.pantry, X.cr - 0.07, DECK.fb, M.lino);
  deckSlab(k, X.cr + 0.07, X.ab - 0.07, DECK.cr, M.plate, { t: 0.14 });
  deckSlab(k, X.ab + 0.07, X.mess, DECK.ab, M.plate);
  deckSlab(k, X.mess, X.wash, DECK.ab, M.lino);
  deckSlab(k, X.wash, X.fer - 0.07, DECK.ab, M.enamel);
  deckSlab(k, X.man + 0.07, X.atr - 0.07, DECK.man, M.plate);
  deckSlab(k, X.atr + 0.07, X.phA - 0.07, DECK.atr, M.plate);
  // Lower flats and well floors.
  deckSlab(k, X.ftrF + 0.07, X.fb - 0.07, LOW.ftr, M.plate);
  deckSlab(k, X.fb + 0.07, X.cr - 0.07, LOW.well, M.plate, { t: 0.1 });
  deckSlab(k, X.cr + 0.07, X.ab - 0.07, LOW.pump, M.plate, { t: 0.1 });
  deckSlab(k, X.ab + 0.07, X.fer - 0.07, LOW.well, M.plate, { t: 0.1 });
  deckSlab(k, X.fer + 0.07, X.man - 0.07, LOW.eng, M.plate);
  deckSlab(k, X.man + 0.07, X.atr - 0.07, LOW.motor, M.plate);
  // Forward trim and WRT tanks under the torpedo room lower flat; after trim tank aft.
  const tankBlock = (x0, x1, y0, y1, m) => {
    const n = Math.max(1, Math.ceil((x1 - x0) / 1.2));
    for (let i = 0; i < n; i++) {
      const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
      const zw = Math.min(roomZ(a, y0 + 0.05), roomZ(b, y0 + 0.05), roomZ(a, y1), roomZ(b, y1));
      if (zw > 0.1) k.box(a, y0, -0.3, b, y1, zw, m);
    }
  };
  tankBlock(X.ftrF + 0.1, X.fb - 0.1, phY(15) - phIn(15) + 0.15, LOW.ftr - 0.12, M.trim);
  tankBlock(X.atr + 0.1, X.phA - 0.1, phY(82) - phIn(82) + 0.25, LOW.atr - 0.12, M.trim);
  // The after torpedo room lower flat.
  deckSlab(k, X.atr + 0.07, X.phA - 0.07, LOW.atr, M.plate);
}

export function buildBulkheads(k) {
  const D = (y) => [y + 0.42, y + 1.42, 0.62];
  bulkhead(k, X.phF + 0.07, { t: 0.14, mat: M.bulkLow });
  bulkhead(k, X.ftrF, { t: 0.12 });
  bulkhead(k, X.fb, { door: D(DECK.fb) });
  bulkhead(k, X.cr, { door: D(DECK.cr) });
  bulkhead(k, X.ab, { door: D(DECK.ab) });
  bulkhead(k, X.fer, { door: D(DECK.eng) });
  bulkhead(k, X.aer, { door: D(DECK.eng) });
  bulkhead(k, X.man, { door: D(DECK.eng) });
  bulkhead(k, X.atr, { door: D(DECK.atr) });
  bulkhead(k, X.phA - 0.07, { t: 0.14, mat: M.bulkLow });
}

// Light partitions (curtains, thin steel walls) between rooms of one compartment.
export function partition(k, x, y0, y1, opt = {}) {
  const zw = Math.min(roomZ(x, y0 + 0.05), roomZ(x, y1)) - 0.02;
  const z0 = opt.z0 != null ? opt.z0 : -0.3;
  k.box(x - 0.025, y0, z0, x + 0.025, y1, opt.z1 != null ? opt.z1 : zw, opt.mat || mat({ c: '#d8d4c8', c2: '#c8c4b8', pat: 'panels', s: 0.5, cut: '#8a8a84' }));
}

// ------------------------------------------------------------------ conning tower, bridge, fairwater
export function buildConningTower(k) {
  const { x0, x1, yc, r } = CT;
  const N = 18;
  const ring = [[-0.3, yc - r]];
  for (let i = 0; i <= N; i++) { const f = (i / N) * Math.PI; ring.push([r * Math.sin(f), yc - r * Math.cos(f)]); }
  ring.push([-0.3, yc + r], [-0.3, yc + r - 0.09]);
  for (let i = N; i >= 0; i--) { const f = (i / N) * Math.PI; ring.push([(r - 0.09) * Math.sin(f), yc - (r - 0.09) * Math.cos(f)]); }
  ring.push([-0.3, yc - r + 0.09]);
  const ctMat = mat({ c: '#d0cec4', c2: '#c0beb4', pat: 'speckle', cut: '#a8402e' });
  k.loft([{ x: x0, pts: ring }, { x: (x0 + x1) / 2, pts: ring }, { x: x1, pts: ring }], ctMat, { matFn: (s, i) => (i <= N + 1 ? M.greyHi : ctMat) });
  // Dished ends.
  for (const [x, d] of [[x0, -1], [x1, 1]]) {
    const disc = [[-0.3, yc - r]];
    for (let i = 0; i <= N; i++) { const f = (i / N) * Math.PI; disc.push([r * Math.sin(f), yc - r * Math.cos(f)]); }
    disc.push([-0.3, yc + r]);
    k.extrudeX(disc, d < 0 ? x - 0.12 : x, d < 0 ? x : x + 0.12, M.bulk);
  }
  // Deck inside the tower.
  const zc = Math.sqrt(Math.max(0, (r - 0.09) ** 2 - (CT.deck - yc) ** 2)) - 0.02;
  k.box(x0, CT.deck - 0.1, -0.3, x1, CT.deck, zc, M.plate);
  // Trunk from the control room overhead up to the tower (the lower hatch).
  const ty0 = phY(37.6) + phR(37.6) - 0.12, ty1 = CT.yc - r + 0.08;
  k.lathe([[0.36, ty0], [0.43, ty0], [0.43, ty1], [0.36, ty1], [0.36, ty0]], 37.6, 0.0, M.phOut, { seg: 14, capTop: false, capBot: false });
  // Supports between the pressure hull and the tower.
  for (const x of [34.2, 35.8, 38.7]) k.box(x - 0.08, 5.9, -0.3, x + 0.08, CT.yc - r + 0.15, 0.6, M.phOut);
}

// Fairwater: the free-flooding plating round the bridge, conning tower and shears.
const FW_TOP = [[32.4, 9.15], [33.0, 9.55], [33.35, 10.28], [40.6, 10.28], [40.85, 9.95], [43.0, 9.85], [43.4, 8.6], [44.6, 7.15]];
const fwTop = (x) => {
  if (x <= FW_TOP[0][0]) return FW_TOP[0][1];
  for (let i = 1; i < FW_TOP.length; i++) if (x <= FW_TOP[i][0]) { const a = FW_TOP[i - 1], b = FW_TOP[i]; return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); }
  return FW_TOP[FW_TOP.length - 1][1];
};
const fwHalf = (x) => (x < 32.4 ? 0.2 : x < 33.6 ? 0.2 + (1.12 * Math.sin(((x - 32.4) / 1.2) * Math.PI * 0.5)) : x < 42.2 ? 1.32 : Math.max(0.6, 1.32 - (x - 42.2) * 0.3));
export function buildFairwater(k) {
  const secs = [];
  const xs = [31.6, 31.9, 32.2, 32.4, 32.6, 32.85, 33.1, 33.35, 33.6, 34.5, 36, 38, 40, 40.6, 40.85, 42, 43.0, 43.4, 44.0, 44.6];
  for (const x of xs) {
    const w = fwHalf(x), y0 = deckY(x) - 0.02, y1 = Math.max(y0 + 0.08, fwTop(x));
    // A thin plate standing on the deck edge: an L in section (side plate plus the cap rail).
    secs.push({ x, pts: [[w - 0.06, y0], [w, y0], [w, y1], [w - 0.18, y1], [w - 0.18, y1 - 0.06], [w - 0.06, y1 - 0.06]] });
  }
  const fw = mat({ c: '#8c9398', c2: '#7c8388', pat: 'plates', s: 0.9, cut: '#2a2626' });
  k.loft(secs, fw, { matFn: (s, i) => (i === 2 || i === 3 ? M.black : i <= 1 ? fw : mat({ c: '#5e6468', cut: '#2a2626' })) });
  // Front of the fairwater, cut through on the centreline.
  k.box(31.55, deckY(31.6), -0.3, 31.75, 9.1, 0.25, fw);
  // Bridge flat (open grating) around the top of the conning tower.
  const g = M.grate, y = BRIDGE.deck;
  k.box(32.55, y - 0.1, -0.3, CT.x0, y, 1.26, g);
  k.box(CT.x1, y - 0.1, -0.3, 40.75, y, 1.26, g);
  const zc = Math.sqrt(Math.max(0, CT.r ** 2 - (y - 0.1 - CT.yc) ** 2)) + 0.02;
  k.box(CT.x0, y - 0.1, zc, CT.x1, y, 1.26, g);
  // After gun deck and forward gun platform.
  k.box(40.75, 9.6, -0.3, 43.0, 9.7, 1.0, g);
  k.box(32.45, 9.0, -0.3, 33.3, 9.1, 0.9, g);
  // Bridge fittings: speaking tube, gyro repeater pelorus, voice pipes.
  k.cyl(33.55, y, 0.35, 0.12, 1.15, M.machDk, { seg: 10 });
  k.sphere(33.55, y + 1.2, 0.35, 0.16, M.brass, { seg: 10, rings: 6 });
  k.tube([[34.05, y, 1.05], [34.05, y + 1.05, 1.05], [33.85, y + 1.2, 1.05]], 0.045, M.brass);
  // Fairwater underside framing (visible inside through the cut).
  for (let x = 33; x < 43; x += 1.1) k.box(x, deckY(x), 1.18, x + 0.06, fwTop(x) - 0.1, 1.26, mat({ c: '#5e6468', cut: '#2a2626' }));
  // Main induction: the 36 inch valve in the after superstructure (S21).
  k.box(41.4, 7.0, 0.35, 43.3, 8.55, 1.2, mat({ c: '#7a8288', c2: '#6a7278', pat: 'plates', s: 0.5, cut: '#2a2626' }));
  k.cyl(42.35, 8.55, 0.78, 0.46, 0.22, M.machDk, { seg: 16 });
  k.tube([[42.35, 7.0, 0.78], [42.35, 6.2, 0.78], [43.6, phY(44) + phR(44) - 0.05, 0.78]], 0.36, M.phOut, { seg: 10 });
  void fwHalf;
}

// ------------------------------------------------------------------ deck fittings
// Frames and stringers inside the free-flooding bow and stern, so the dark spaces read as structure.
export function buildFraming(k) {
  const fm = mat({ c: '#5a605c', c2: '#4e5450', cut: '#2a2626' });
  const xs = [];
  for (let x = 1.2; x < X.phF - 0.2; x += 0.85) xs.push(x);
  for (let x = X.phA + 0.5; x < 94.6; x += 0.85) xs.push(x);
  for (const x of xs) {
    const out = outerSection(x);
    const K = keelY(x), D = deckY(x), Bm = halfBeam(x);
    if (Bm < 0.45 || D - K < 1.2) continue;
    const t = Math.min(0.08, Bm * 0.25, (D - K) * 0.2) + 0.005;
    const a = inset(out, t), b = inset(out, t + Math.min(0.14, Bm * 0.2));
    const poly = [[-0.3, a[0][1]]].concat(a, [[-0.3, a[NS - 1][1]], [-0.3, b[NS - 1][1]]], b.slice().reverse(), [[-0.3, b[0][1]]]);
    k.extrudeX(poly, x - 0.035, x + 0.035, fm);
  }
  // Stringers along the bow and stern.
  for (const [x0, x1] of [[1.0, X.phF + 0.1], [X.phA - 0.1, 94.2]]) {
    for (const y of [3.2, 4.6, 6.0]) {
      const pts = [];
      for (let x = x0; x <= x1; x += 0.6) { const z = outerZ(x, y); if (z > 0.35 && y > keelY(x) + 0.2 && y < deckY(x) - 0.2) pts.push([x, y, z - 0.12]); }
      if (pts.length > 2) k.tube(pts, 0.04, fm, { seg: 4 });
    }
  }
  // Sound heads under the keel at frame 34 (S1 p.21).
  for (const x of [22.15, 22.75]) { k.cyl(x, -0.42, 0, 0.11, 0.42, M.machDk, { seg: 10 }); k.sphere(x, -0.42, 0, 0.11, M.machDk, { seg: 10, rings: 5 }); }
}

export function buildDeckFittings(k) {
  const dk = (x) => deckY(x);
  const fit = mat({ c: '#4a4c4c', cut: '#2a2828' });
  // Capstan and windlass on the bow (S22).
  k.cyl(5.6, dk(5.6), 0.0, 0.32, 0.42, fit, { seg: 14 });
  k.cyl(5.6, dk(5.6) + 0.42, 0.0, 0.36, 0.08, fit, { seg: 14 });
  k.box(7.0, dk(7.0) - 0.02, -0.3, 7.6, dk(7.0) + 0.18, 0.5, fit);
  // Anchor in its hawse on the starboard bow.
  const ax = 3.4, ay = 6.45, az = outerZ(ax, ay) + 0.05;
  k.box(ax - 0.12, ay - 0.5, az, ax + 0.12, ay + 0.35, az + 0.12, M.black);
  k.box(ax - 0.5, ay - 0.6, az, ax + 0.5, ay - 0.45, az + 0.12, M.black);
  // Hatches: torpedo loading, escape trunks, mess hatch, engine room hatches (S22, S35, S13).
  const hatch = (x, w, h = 0.22) => { k.box(x - w / 2, dk(x) - 0.02, -0.3, x + w / 2, dk(x) + h, 0.5, fit); k.box(x - w / 2 - 0.04, dk(x) + h, -0.3, x + w / 2 + 0.04, dk(x) + h + 0.05, 0.55, M.black); };
  hatch(14.4, 0.95, 0.18); hatch(17.25, 0.75, 0.32); hatch(44.2, 0.7); hatch(57.3, 0.8); hatch(66.0, 0.8); hatch(80.6, 0.75, 0.32); hatch(83.6, 0.95, 0.18);
  // Telephone marker buoys, fore and aft (S22, S35).
  for (const x of [20.6, 85.2]) { k.cyl(x, dk(x) - 0.02, 0.45, 0.3, 0.1, mat({ c: '#c8b048', cut: '#8a7a30' }), { seg: 14 }); }
  // Deck stanchions and the lifeline (rigged in port; here the bases only).
  for (let x = 4; x < 92; x += 3.2) { if (x > 31 && x < 44.5) continue; const z = deckHalf(x) - 0.08; k.box(x - 0.025, dk(x), z - 0.025, x + 0.025, dk(x) + 0.14, z + 0.025, fit); }
  // Flood ports (limber holes) along the superstructure side, and the bow's arched ports (S22).
  const holeM = mat({ c: '#121414', cut: '#121414' });
  for (let x = 5.5; x < 91; x += 0.62) {
    if (x > 9 && x < 12) continue;
    const y = Math.min(dk(x) - 0.42, 6.55);
    const z = outerZ(x, y);
    if (z < 0.3) continue;
    const big = x < 11;
    k.box(x - (big ? 0.18 : 0.12), y - (big ? 0.42 : 0.16), z - 0.07, x + (big ? 0.18 : 0.12), y + (big ? 0.12 : 0.04), z + 0.02, holeM);
  }
  // Draught marks aft of the bow shutters (S22).
  for (let i = 0; i < 6; i++) { const y = 2.0 + i * 0.6, x = 11.6 + y * 0.05; const z = outerZ(x, y); if (z > 0.2) k.box(x - 0.06, y, z - 0.03, x + 0.06, y + 0.1, z + 0.02, M.white); }
  // Engine exhaust outlets, two each side aft (S21).
  for (const x of [61.2, 62.6, 69.2, 70.6]) { const y = 5.25, z = outerZ(x, y); k.cyl(x, y, z - 0.25, 0.24, 0.35, M.black, { axis: 'z', seg: 12 }); }
  // Radio antenna wires: three run aft from the conning tower (S21).
  const w = mat({ c: '#262626', whole: true });
  for (let i = 0; i < 3; i++) k.rope([39.5 + i * 0.4, 13.2 - i * 0.6, 0.0], [93.0 - i * 2.6, 7.6 + i * 0.25, 0.0], 0.012, w, 0.012, 14);
  // Wire stays from the stem to the bow and the stern post.
  k.cyl(93.2, dk(93.2), 0, 0.05, 0.85, M.mastDk, { seg: 6 });
}

// ------------------------------------------------------------------ water
// The cut face of the sea (static part below the surface waterline) and moving bands above it,
// so the sea can rise over the boat when she dives at dawn.
export function buildWater(k) {
  const C = { c: '#1f5e70', alpha: 0.36 };
  // Deeper water reads darker: a few bands below the keel with rising opacity.
  const deep = [[-200, -18, 0.63]];
  for (let y = -18; y < 0.6 - 1e-6; y += 1.0) deep.push([y, Math.min(0.6, y + 1.0), 0.37 + 0.26 * Math.pow(Math.max(0, (0.6 - (y + 0.5)) / 18.6), 0.9)]);
  for (const [y0, y1, a] of deep) k.sheet(-400, 400, y0, y1, 0.01, { c: '#1a5466', alpha: a });
  const bands = [];
  for (let y = 0.6; y < WL - 1e-6; ) { const y1 = Math.min(WL, y + 0.25); bands.push([y, y1]); y = y1; }
  for (const [y0, y1] of bands) {
    const ym = (y0 + y1) / 2;
    const dry = drySpanAt(ym);
    if (!dry) { k.sheet(-400, 400, y0, y1, 0.01, C); continue; }
    k.sheet(-400, dry[0], y0, y1, 0.01, C);
    k.sheet(dry[1], 400, y0, y1, 0.01, C);
  }
  // Bands above the surface waterline: parts that scale up as the sea rises.
  const parts = [];
  const up = [[WL, 4.9], [4.9, 5.2], [5.2, 5.5], [5.5, 5.8], [5.8, 6.1], [6.1, 6.6], [6.6, 9.2], [9.2, 24]];
  for (const [y0, y1] of up) {
    const h = y1 - y0;
    const g = k.part(0, y0, 0, (q) => {
      const ym = (y0 + y1) / 2;
      let dry = y1 <= 6.15 ? drySpanAt(ym) : null;
      if (y0 >= 6.6 && y1 <= 9.2) dry = [CT.x0 + 0.1, CT.x1 - 0.1];
      if (y0 >= 6.1 && y0 < 6.6) dry = [CT.x0 + 0.3, 38.0];
      if (!dry) { q.sheet(-400, 400, 0, h, 0.01, C); return; }
      q.sheet(-400, dry[0], 0, h, 0.01, C);
      q.sheet(dry[1], 400, 0, h, 0.01, C);
    });
    g.userData.overlay = true;
    parts.push({ g, y0, h });
  }
  // The sea surface: one with a hole for the hull (surfaced), one without (dived).
  const wz = new Map();
  const inside = (x, z) => {
    if (x < 0.05 || x > LOA) return false;
    const key = Math.round(x * 20);
    let w = wz.get(key);
    if (w == null) { w = keelY(x) > WL || deckY(x) < WL ? -1 : outerZ(x, WL) + 0.12; wz.set(key, w); }
    return Math.abs(z) < w;
  };
  const seaSurf = makeSea({ level: WL, x0: -260, x1: 360, detailX0: -30, detailX1: 130, step: 1.0, mask: inside, maskBox: [-2, 0, 97, 6], deep: '#1e4e66', shallow: '#2f6f80', amp: 0.7 });
  const seaDive = makeSea({ level: WL, x0: -260, x1: 360, detailX0: -30, detailX1: 130, step: 1.6, deep: '#1e4e66', shallow: '#2f6f80', amp: 0.7 });
  k.object(seaDive);
  k.object(seaSurf);
  // Far water behind the boat (so the depths read as sea, not sky), rising with the surface.
  const back = k.part(0, WL, 0, (q) => {
    q.box(-900, -260, 34, 1000, -0.35, 35, mat({ c: '#1c4c5c', c2: '#163e4c', noEdge: true, cut: '#1c4c5c' }));
  });
  void hullSpanAt; void DAY_SEA;
  return { parts, seaSurf, seaDive, back };
}
