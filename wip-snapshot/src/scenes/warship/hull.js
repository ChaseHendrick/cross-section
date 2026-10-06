/* Warship scene: hull shell, decks, beams, bulkheads, gun ports, head and stern.
 * See ../warship.js for the layout plan.
 */
import { mat, shade } from '../../engine/index.js';
import { Y, DT, BEAM, MAST, LV, PORTS, halfB, innerZ, bottomY, bottomInner, topY, stemX, sternX, thick, clamp } from './geom.js';

// ------------------------------------------------------------------ materials
const CUT_OAK = '#8a5c34';
export const M = {
  copper: mat({ c: '#b07048', c2: '#8a8a64', pat: 'plates', s: 0.55, cut: CUT_OAK }),
  black: mat({ c: '#262220', c2: '#363230', pat: 'planks', s: 0.32, cut: CUT_OAK }),
  ochre: mat({ c: '#dcbc86', c2: '#c8a670', pat: 'planks', s: 0.32, cut: CUT_OAK }),
  rail: mat({ c: '#3e2e22', cut: CUT_OAK }),
  keel: mat({ c: '#4a3a2c', cut: '#6a4a2c' }),
  ceiling: mat({ c: '#6a4c32', c2: '#5a3e28', pat: 'planks', s: 0.3, cut: CUT_OAK }),
  orlopSide: mat({ c: '#8a6a48', c2: '#76583a', pat: 'planks', s: 0.3, cut: CUT_OAK }),
  white: mat({ c: '#e8dec6', c2: '#d8ccb0', pat: 'planks', s: 0.3, cut: CUT_OAK }),
  ochreIn: mat({ c: '#d8b47a', c2: '#c49c62', pat: 'planks', s: 0.3, cut: CUT_OAK }),
  bulwark: mat({ c: '#c9a066', c2: '#b48c56', pat: 'planks', s: 0.28, cut: CUT_OAK }),
  deck: mat({ c: '#d2b688', c2: '#a8875a', pat: 'deck', s: 0.26, cut: '#c79a5c', cutPat: true }),
  deckDark: mat({ c: '#a8885e', c2: '#86683e', pat: 'deck', s: 0.26, cut: '#b88a50', cutPat: true }),
  deckOpen: mat({ c: '#dccaa2', c2: '#b4986c', pat: 'deck', s: 0.26, cut: '#c79a5c', cutPat: true }),
  beam: mat({ c: '#9a7448', cut: '#c79a5c' }),
  bulk: mat({ c: '#d6c8a8', c2: '#c4b490', pat: 'planks', s: 0.25, cut: '#b89060' }),
  bulkDark: mat({ c: '#8a6a46', c2: '#76583a', pat: 'planks', s: 0.25, cut: '#b89060' }),
  canvasWall: mat({ c: '#e6dcc2', c2: '#d4c6a4', pat: 'canvas', s: 0.4, cut: '#b8a888' }),
  copperWall: mat({ c: '#c07c52', c2: '#a8663e', pat: 'plates', s: 0.5, cut: '#a8663e' }),
  portDay: mat({ c: '#cfe0e4', c2: '#e6f0ee', glow: 'always', noEdge: false, cut: '#cfe0e4' }),
  portLid: mat({ c: '#9e3b2b', cut: '#6a2a20' }),
  lidOut: mat({ c: '#1e1c1a', cut: '#6a2a20' }),
  hatch: mat({ c: '#8a6a42', c2: '#4a3a28', pat: 'grate', s: 0.12, cut: '#a07848' }),
  coaming: mat({ c: '#7a5634', cut: '#a07848' }),
  gilt: mat({ c: '#d8b050', c2: '#a88030', whole: true }),
  window: mat({ c: '#a8c4d0', c2: '#ffd88a', glow: 'night', pat: 'panes', s: 0.22, cut: '#3a3028' }),
  shingle: mat({ c: '#9a968a', c2: '#7a766c', pat: 'speckle', s: 0.08, cut: '#8a867a', cutPat: true }),
  pigiron: mat({ c: '#4a4646', c2: '#3a3636', pat: 'grain', cut: '#3e3a3a' }),
  bilge: mat({ c: '#2a3a30', c2: '#1e2a24', cut: '#2a3a30' }),
};

// Paint and finish of each hull face by height (outer side) or deck band (inner side).
function outerMat(y, set = M) {
  if (y < 7.5) return set.copper;
  if (y < 8.7) return set.black;
  if (y < 10.2) return set.ochre;
  if (y < 10.9) return set.black;
  if (y < 12.3) return set.ochre;
  if (y < 12.95) return set.black;
  if (y < 14.4) return set.ochre;
  return set.black;
}
// Whole (uncut) versions for the larboard bow, which the drawing leaves standing.
const MW = {
  copper: mat({ c: '#b07048', c2: '#8a8a64', pat: 'plates', s: 0.55, whole: true }),
  black: mat({ c: '#262220', c2: '#363230', pat: 'planks', s: 0.32, whole: true }),
  ochre: mat({ c: '#dcbc86', c2: '#c8a670', pat: 'planks', s: 0.32, whole: true }),
  inner: mat({ c: '#d8ccb0', c2: '#c4b898', pat: 'planks', s: 0.3, whole: true }),
  rail: mat({ c: '#3e2e22', whole: true }),
  edge: mat({ c: '#c09060', c2: '#9a6c40', pat: 'planks', s: 0.22, whole: true, noEdge: false }),
  lid: mat({ c: '#1e1c1a', whole: true }),
};
function innerMat(y) {
  if (y < Y.orlop) return M.ceiling;
  if (y < Y.lower) return M.orlopSide;
  if (y < Y.upper) return M.white;
  if (y < Y.fc) return M.ochreIn;
  return M.bulwark;
}

// ------------------------------------------------------------------ the shell
export function hullSection(x) {
  const b = bottomY(x), t = Math.max(topY(x), b);
  const bi = Math.min(Math.max(bottomInner(x), b), t);
  const out = [[-0.3, b]];
  for (const y of LV) { const yc = clamp(y, b, t); out.push([halfB(x, yc), yc]); }
  const inn = [];
  for (let i = LV.length - 1; i >= 0; i--) { const yc = clamp(LV[i], bi, t); inn.push([Math.max(-0.3, halfB(x, yc) - thick(yc)), yc]); }
  inn.push([-0.3, bi]);
  return out.concat(inn);
}

export function stations() {
  const xs = [-1.05, -0.8, -0.55, -0.31, -0.3, 0, 0.4, 0.8, 1.3, 1.9, 2.6, 3.4, 4.3, 5.3, 6.4, 7.5];
  for (let x = 9; x <= 45.5; x += 1.5) xs.push(x);
  xs.push(46.5, 47.6, 48.4, 49.4, 50.4, 51.4, 52.4, 53.2, 54, 54.5, 55, 55.5, 56, 56.4, 56.8, 57.2, 57.6, 58, 58.4, 58.7, 59.0);
  return xs;
}

// The larboard bow, left standing forward of a frame at x = xEnd, so the paint of the
// outside of the hull can be seen: ochre bands along the ports, black between, black lids.
export function buildNearBow(k, xEnd = 4.4) {
  const xs = stations().filter((x) => x < xEnd - 0.05);
  xs.push(xEnd);
  const nOut = LV.length + 1;
  const secs = xs.map((x) => ({ x, pts: hullSection(x).map(([z, y]) => [-z, y]).reverse() }));
  const n = secs[0].pts.length;
  const matFn = (sIdx, i) => {
    const o = n - 1 - i; // index in the unmirrored list; face o runs from point o-1 to o
    const f = o - 1;
    if (f < 0 || f === n - 1) return MW.rail;
    if (f === 0) return MW.copper;
    if (f < nOut) return outerMat((LV[f - 1] + LV[f]) / 2, MW);
    if (f === nOut) return MW.rail;
    return MW.inner;
  };
  k.loft(secs, MW.ochre, { matFn, caps: false });
  // The cut edge of the standing bow.
  const last = secs[secs.length - 1];
  k.poly(last.pts.map(([z, y]) => [xEnd, y, z]), MW.edge, 1, [1, 0, 0]);
  // Port lids on this side.
  for (const p of portList()) {
    if (p.x > xEnd - 0.6) continue;
    const ym = (p.y0 + p.y1) / 2, zo = halfB(p.x, ym), ao = sideAng(p.x, ym, halfB);
    k.boxR(p.x, ym, -zo + 0.08, p.w, p.y1 - p.y0, 0.3, MW.lid, { y: ao });
  }
  // Larboard cathead and bower anchor.
  const cz = halfB(1.2, 15.3);
  k.beam([2.4, 15.35, -(cz - 1.2)], [0.6, 15.75, -(cz + 1.9)], 0.42, mat({ c: '#2a2624', whole: true }));
  anchor(k, 0.9, 10.2, -(halfB(0.9, 12.0) + 0.4), 1, 'x', true);
}

export function buildHull(k) {
  const xs = stations();
  const secs = xs.map((x) => ({ x, pts: hullSection(x) }));
  const nOut = LV.length + 1;
  const matFn = (s, i) => {
    if (i === 0) return M.keel;
    if (i < nOut) return outerMat((LV[i - 1] + LV[i]) / 2);
    if (i === nOut) return M.rail;
    const j = i - nOut - 1; // inner faces, top down
    if (j < LV.length - 1) { const a = LV[LV.length - 1 - j], b = LV[LV.length - 2 - j]; return innerMat((a + b) / 2); }
    return M.ceiling;
  };
  k.loft(secs, M.ochre, { matFn, caps: false });

  // Keel and false keel, crossing the cut so the section shows them.
  k.box(7.3, -0.35, -0.3, 54.1, 0.05, 0.36, M.keel);
  // Keelson over the floors.
  k.box(8.5, Y.hold - 0.05, -0.3, 53, Y.hold + 0.42, 0.45, mat({ c: '#7a5634', cut: '#a07040' }));
  // Stem and knee of the head: a solid plate on the centreline from the forefoot to the figurehead.
  const knee = [];
  for (let y = 0.2; y <= 12.6; y += 0.6) knee.push([stemX(y) + 0.45, y]);
  knee.push([-1.3, 12.9], [-3.4, 12.55], [-4.9, 12.2], [-5.25, 11.4], [-4.6, 10.2], [-3.2, 9.1], [-1.9, 7.9]);
  for (let y = 7.4; y >= 0.2; y -= 0.6) knee.push([stemX(y) - 0.4, y]);
  knee.push([7.8, 0.0]);
  k.extrude(knee, -0.26, 0.26, mat({ c: '#2a2624', cut: '#7a5434' }));
  // Sternpost and rudder (nearly 12 m tall, copper below the waterline).
  const rud = [];
  for (let y = 0.15; y <= 10.4; y += 0.65) rud.push([sternX(Math.min(y, 8)) + 0.12 + (y > 8 ? (y - 8) * 0.05 : 0), y]);
  const back = [];
  for (let y = 10.4; y >= 0.15; y -= 0.65) back.push([sternX(Math.min(y, 8)) + 0.12 + 1.75 - (y / 10.4) * 1.0, y]);
  k.extrude(rud.concat(back), -0.3, 0.3, mat({ c: '#a86c46', c2: '#8a8a64', pat: 'plates', s: 0.5, cut: '#7a5434' }), { side: mat({ c: '#a86c46', cut: '#7a5434' }) });
}

// ------------------------------------------------------------------ decks
// A deck slab lofted to the inner face of the side. segs: [[x0, x1, zFrom]], zFrom > -0.3 leaves a hatch.
export function deckSlab(k, y, x0, x1, m, zFrom = -0.3, dt = DT) {
  const xs = [];
  const step = 0.75;
  for (let x = x0; x < x1 - 1e-6; x += step) xs.push(x);
  xs.push(x1);
  const secs = [];
  for (const x of xs) {
    const zi = Math.max(zFrom + 0.02, Math.min(innerZ(x, y - dt), innerZ(x, y)) + 0.06);
    secs.push({ x, pts: [[zFrom, y - dt], [zi, y - dt], [zi, y], [zFrom, y]] });
  }
  k.loft(secs, m);
}
// First x where the hull is wide enough at height y for a deck to begin / end.
export function deckEnds(y) {
  let a = -1.2, b = 59.2;
  while (a < 30 && innerZ(a, y) < 0.4) a += 0.05;
  while (b > 30 && innerZ(b, y) < 0.4) b -= 0.05;
  return [a, b];
}

// Hatch openings per deck: [x0, x1, half-width].
export const HATCH = {
  orlop: [[12.4, 13.4, 1.2], [23.2, 24.8, 0.9], [33.2, 34.6, 0.9]],
  lower: [[15.0, 16.6, 0.9], [26.4, 28.4, 1.3], [39.0, 40.6, 0.9]],
  middle: [[19.0, 20.6, 0.9], [26.4, 28.4, 1.3], [33.2, 34.8, 0.9]],
  upper: [[15.0, 16.6, 0.9], [26.4, 28.4, 1.3], [39.0, 40.6, 0.9]],
};
// Companion ladders: foot (x0, y0) to the hatch edge above (x1, y1), between depths z0 and z1.
export const LADDERS = [
  { a: 'hold', b: 'orlop', x0: 24.7, y0: 2.55, x1: 23.3, y1: 6.4 },
  { a: 'hold', b: 'orlop', x0: 34.5, y0: 2.55, x1: 33.3, y1: 6.4 },
  { a: 'orlop', b: 'lower', x0: 16.5, y0: 6.4, x1: 15.1, y1: 8.4 },
  { a: 'orlop', b: 'lower', x0: 40.5, y0: 6.4, x1: 39.1, y1: 8.4 },
  { a: 'lower', b: 'middle', x0: 20.5, y0: 8.4, x1: 19.1, y1: 10.5 },
  { a: 'lower', b: 'middle', x0: 34.7, y0: 8.4, x1: 33.3, y1: 10.5 },
  { a: 'middle', b: 'upper', x0: 16.5, y0: 10.5, x1: 15.1, y1: 12.6 },
  { a: 'middle', b: 'upper', x0: 40.5, y0: 10.5, x1: 39.1, y1: 12.6 },
  { a: 'upper', b: 'fc', x0: 14.2, y0: 12.6, x1: 12.95, y1: 14.7, z0: 1.7, z1: 2.5 },
  { a: 'upper', b: 'qd', x0: 32.8, y0: 12.6, x1: 34.05, y1: 14.7, z0: 1.7, z1: 2.5 },
  { a: 'qd', b: 'poop', x0: 46.5, y0: 14.7, x1: 48.05, y1: 16.7, z0: 3.6, z1: 4.3 },
];
export function buildLadders(k, props) {
  for (const L of LADDERS) props.stairs(k, L.x0, L.y0, L.x1, L.y1, L.z0 != null ? L.z0 : 0.25, L.z1 != null ? L.z1 : 0.95, { color: '#9a7448', railColor: '#5a3e26', steps: Math.round((L.y1 - L.y0) / 0.24) });
  // Gratings over the main hatch on the upper deck let light down to the decks below.
  k.box(26.4, Y.upper + 0.12, -0.3, 28.4, Y.upper + 0.2, 1.3, M.hatch);
}

function deckWithHatches(k, y, x0, x1, hatches, m) {
  const cuts = hatches.filter((h) => h[1] > x0 && h[0] < x1).sort((a, b) => a[0] - b[0]);
  let cur = x0;
  for (const [h0, h1, hw] of cuts) {
    if (h0 > cur + 0.05) deckSlab(k, y, cur, h0, m);
    deckSlab(k, y, Math.max(cur, h0), Math.min(h1, x1), m, hw);
    // Coamings round the opening.
    k.box(h0 - 0.12, y, -0.3, h0, y + 0.22, hw + 0.12, M.coaming);
    k.box(h1, y, -0.3, h1 + 0.12, y + 0.22, hw + 0.12, M.coaming);
    k.box(h0 - 0.12, y, hw, h1 + 0.12, y + 0.22, hw + 0.12, M.coaming);
    cur = Math.min(h1, x1);
  }
  if (cur < x1 - 0.05) deckSlab(k, y, cur, x1, m);
}

function beams(k, y, x0, x1, hatches, every = 1.25) {
  for (let x = x0 + 0.6; x < x1 - 0.3; x += every) {
    const yb = y - DT;
    if (hatches.some((h) => x > h[0] - 0.15 && x < h[1] + 0.15)) continue;
    const zi = innerZ(x, yb - BEAM / 2) + 0.05;
    if (zi < 0.3) continue;
    k.box(x - 0.13, yb - BEAM, -0.3, x + 0.13, yb, zi, M.beam);
  }
}

// Transverse bulkhead at x between y0 and y1 with an optional doorway [z0, z1].
export function bulkhead(k, x, y0, y1, m, door = null, zMax = null) {
  const zi = zMax != null ? zMax : Math.min(innerZ(x, y0), innerZ(x, y1)) + 0.05;
  const t = 0.06;
  if (!door) { k.box(x - t, y0, -0.3, x + t, y1, zi, m); return; }
  const [d0, d1, dh] = door;
  k.box(x - t, y0, -0.3, x + t, y1, d0, m);
  k.box(x - t, y0, d1, x + t, y1, zi, m);
  k.box(x - t, y0 + (dh || 1.75), d0, x + t, y1, d1, m);
}

export function buildDecks(k) {
  // Hold floor: pig-iron ballast under loose shingle, which beds the casks.
  const [hx0, hx1] = [9.2, 51.5];
  deckSlab(k, 2.15, hx0, hx1, M.pigiron, -0.3, 0.3);
  deckSlab(k, 2.55, hx0 + 6, 46, M.shingle, -0.3, 0.4);
  // Bilge water glimpsed at the very bottom by the well.
  k.box(26.5, Y.hold + 0.42, -0.3, 34.5, Y.hold + 0.5, 0.5, M.bilge);

  // Orlop: a platform deck, ends where the hull narrows.
  const [o0, o1] = deckEnds(Y.orlop);
  deckWithHatches(k, Y.orlop, Math.max(o0, 2.6), Math.min(o1, 53.4), HATCH.orlop, M.deckDark);
  beams(k, Y.orlop, Math.max(o0, 2.6), Math.min(o1, 53.4), HATCH.orlop, 1.4);
  // Red ochre floor of the cable tiers [S36].
  deckSlab(k, Y.orlop + 0.02, 15.1, 25.9, mat({ c: '#a8503a', c2: '#8a4030', pat: 'planks', s: 0.26, cut: '#a8503a' }), -0.3, 0.02);

  for (const [name, y] of [['lower', Y.lower], ['middle', Y.middle], ['upper', Y.upper]]) {
    const [a, b] = deckEnds(y);
    const x0 = Math.max(a, -0.3), x1 = b;
    if (name === 'upper') {
      // The waist (x 13 to 34) is open to the sky; the deck itself is continuous.
      deckWithHatches(k, y, x0, x1, HATCH.upper, M.deckOpen);
    } else deckWithHatches(k, y, x0, x1, HATCH[name], M.deck);
    // Beams under the deck above this one are drawn by that deck; beams for this deck:
    beams(k, y, x0, x1, HATCH[name] || []);
  }
  // Forecastle (to x 13) and quarterdeck (from x 34), and the gangways joining them along the side.
  const [f0] = deckEnds(Y.fc);
  deckSlab(k, Y.fc, Math.max(f0, -0.3), 13.0, M.deckOpen);
  beams(k, Y.fc, Math.max(f0, -0.3), 13.0, []);
  deckSlab(k, Y.qd, 34.0, 58.0, M.deckOpen);
  beams(k, Y.qd, 34.0, 58.0, []);
  for (let x = 13.0; x < 34.0; x += 1.5) {
    const x1 = Math.min(34.0, x + 1.5);
    const zi = Math.min(innerZ(x, Y.fc), innerZ(x1, Y.fc)) + 0.06;
    k.box(x, Y.fc - DT, zi - 1.7, x1, Y.fc, zi, M.deckOpen);
  }
  // Skid beams across the waist carrying the boats.
  for (const x of [16.0, 20.5, 25.0, 29.5]) k.box(x - 0.15, Y.fc - 0.3, -0.3, x + 0.15, Y.fc, innerZ(x, Y.fc) + 0.05, M.beam);
  // Poop deck.
  deckSlab(k, Y.poop, 48.0, 58.6, M.deckOpen);
  beams(k, Y.poop, 48.0, 58.6, []);
  // Rails: forecastle and quarterdeck breaks, poop break.
  rail(k, 12.85, Y.fc, 0, innerZ(12.85, Y.fc) - 1.7);
  rail(k, 34.15, Y.qd, 0, innerZ(34.15, Y.qd) - 1.7);
  rail(k, 48.15, Y.poop, 0, innerZ(48.15, Y.poop));
}

function rail(k, x, y, z0, z1) {
  const m = mat({ c: '#6a4a2e', cut: '#a07848' });
  k.box(x - 0.06, y + 0.95, z0 - 0.3, x + 0.06, y + 1.05, z1, m);
  for (let z = z0 + 0.2; z < z1; z += 0.7) k.box(x - 0.04, y, z - 0.04, x + 0.04, y + 0.95, z + 0.04, m);
}

// ------------------------------------------------------------------ bulkheads and partitions
export function buildBulkheads(k) {
  const dr = [0.6, 1.5, 1.6];
  const h = (x, d0, d1, m, door) => bulkhead(k, x, d0, d1 - DT, m, door);
  // Hold: copper-lined grand magazine and its filling room, after hold, spirit room.
  h(7.5, bottomInner(7.5), Y.orlop, M.copperWall);
  h(14.5, Y.hold + 0.4, Y.orlop, M.copperWall);
  h(36.0, Y.hold + 0.4, Y.orlop, M.bulkDark, [0.2, 1.1, 1.8]);
  h(46.0, Y.hold + 0.4, Y.orlop, M.bulkDark);
  // Orlop compartments.
  for (const [x, m, door] of [[8, M.bulkDark, dr], [12, M.bulkDark, dr], [15, M.canvasWall, null], [26, M.bulkDark, dr], [29.5, M.bulkDark, dr], [35, M.bulk, dr], [41, M.bulk, dr], [44, M.bulk, dr], [47.5, M.copperWall, null], [50.5, M.bulkDark, null], [53, M.bulkDark, null]]) {
    h(x, Y.orlop, Y.lower, m, door);
  }
  // Lower deck: gunroom partition (canvas screens).
  h(48.0, Y.lower, Y.middle, M.canvasWall, [0.4, 1.5, 1.6]);
  // Middle deck: lieutenants' cabins and the wardroom bulkhead.
  h(43.0, Y.middle, Y.upper, M.canvasWall, [0.4, 1.5, 1.65]);
  h(51.0, Y.middle, Y.upper, M.bulk, [0.4, 1.5, 1.65]);
  // Upper deck: sick-berth bulkhead, admiral's bulkhead and cabin divisions.
  h(7.0, Y.upper, Y.fc, M.bulk, [0.4, 1.5, 1.7]);
  h(42.5, Y.upper, Y.qd, mat({ c: '#e4dcc4', c2: '#c8bc9c', pat: 'panels', s: 0.6, cut: '#b89060' }), [0.4, 1.5, 1.75]);
  h(47.0, Y.upper, Y.qd, M.canvasWall, [0.4, 1.5, 1.75]);
  h(51.5, Y.upper, Y.qd, mat({ c: '#e4dcc4', c2: '#c8bc9c', pat: 'panels', s: 0.6, cut: '#b89060' }), [0.4, 1.5, 1.75]);
  // Captain's quarters under the poop.
  h(48.15, Y.qd, Y.poop, mat({ c: '#e8e0c8', c2: '#c8bc9c', pat: 'panels', s: 0.55, cut: '#b89060' }), [0.8, 1.6, 1.75]);
  h(53.5, Y.qd, Y.poop, M.canvasWall, [0.4, 1.3, 1.75]);
  // Beakhead bulkhead windows/doors are part of the head (buildHead).
}

// ------------------------------------------------------------------ gun ports
export function portList() {
  const out = [];
  for (const [deck, P] of Object.entries(PORTS)) for (const x of P.xs) out.push({ deck, x, y0: P.y + P.sill, y1: P.y + P.sill + P.h, w: P.w, yDeck: P.y });
  return out;
}
// Inner face: red lids (seen when shut) built static; the daylight of open ports is a part
// (shown by day). Outer face: black lids on the ochre bands.
// Angle of the side in plan at x (so ports and fittings follow the curve of the bow and stern).
export function sideAng(x, y, f = innerZ) { return Math.atan2(f(x + 0.4, y) - f(x - 0.4, y), 0.8); }
export function buildPorts(k) {
  for (const p of portList()) {
    const ym = (p.y0 + p.y1) / 2, h = p.y1 - p.y0;
    const zi = innerZ(p.x, ym), zo = halfB(p.x, ym);
    const a = sideAng(p.x, ym), ao = sideAng(p.x, ym, halfB);
    // Inner lid (red) set into the side, and its frame.
    k.boxR(p.x, ym, zi + 0.1, p.w, h, 0.26, M.portLid, { y: -a });
    k.boxR(p.x, p.y0 - 0.04, zi + 0.06, p.w + 0.16, 0.08, 0.3, M.rail, { y: -a });
    k.boxR(p.x, p.y1 + 0.04, zi + 0.06, p.w + 0.16, 0.08, 0.3, M.rail, { y: -a });
    // Outer lid.
    if (p.deck !== 'qd' && p.deck !== 'fc') k.boxR(p.x, ym, zo - 0.08, p.w, h, 0.3, M.lidOut, { y: -ao });
  }
}
export function buildOpenPorts(k) {
  return k.part(0, 0, 0, (q) => {
    for (const p of portList()) {
      const ym = (p.y0 + p.y1) / 2;
      const zi = innerZ(p.x, ym);
      q.boxR(p.x, ym, zi + 0.06, p.w - 0.06, p.y1 - p.y0 - 0.06, 0.24, M.portDay, { y: -sideAng(p.x, ym) });
    }
  });
}

// ------------------------------------------------------------------ head, stern, outside fittings
export function buildHead(k) {
  const W = mat({ c: '#d8c49a', c2: '#a8946a', pat: 'grate', s: 0.14, cut: '#a07848' });
  // Beakhead platform (gratings) and the head rails.
  const plat = [];
  for (let x = -0.3; x >= -4.6; x -= 0.43) { const t = (-0.3 - x) / 4.3; plat.push({ x, w: 3.6 * (1 - t * 0.85) }); }
  for (let i = 0; i < plat.length - 1; i++) {
    const a = plat[i], b = plat[i + 1];
    k.box(b.x, 12.45 - i * 0.03, -0.3, a.x, 12.6 - i * 0.03, Math.min(a.w, b.w), W);
  }
  const rm = mat({ c: '#e0c28a', cut: '#a07848', whole: false });
  for (const [y, z] of [[13.4, 0.0], [14.1, 0.0]]) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push([-0.4 - t * 4.4, y - t * t * 1.3 - (y - 13.4) * t, 3.7 * (1 - t) + 0.15 + z]); }
    k.tube(pts, 0.07, rm, { seg: 5 });
  }
  // Seats of ease: six in all for over 600 men [S25]; three on this side.
  for (let i = 0; i < 3; i++) {
    const x = -1.2 - i * 0.95, z = 2.6 - i * 0.7;
    k.box(x - 0.35, 12.55, z - 0.3, x + 0.35, 12.95, z + 0.3, mat({ c: '#8a6a42', cut: '#a07848' }));
    k.cyl(x, 12.951, z, 0.13, 0.01, mat({ c: '#1e1a16', noEdge: true }), { seg: 10 });
  }
  // Roundhouse (for senior ratings) at the bulkhead corner.
  k.lathe([[0.55, 12.55], [0.55, 13.9], [0.62, 14.0], [0.0, 14.25]], -0.9, 3.6, mat({ c: '#dcbc86', c2: '#c4a470', pat: 'planks', s: 0.2, cut: '#a07848' }), { seg: 12 });
  // Beakhead bulkhead face: ochre, with doors and small windows.
  const bh = mat({ c: '#dcbc86', c2: '#c4a470', pat: 'panels', s: 0.5, cut: '#8a5c34' });
  k.box(-0.42, 12.6, -0.3, -0.25, 14.7, 0.5, bh);
  k.box(-0.42, 12.6, 1.4, -0.25, 14.7, 4.3, bh);
  k.box(-0.42, 14.4, 0.5, -0.25, 14.7, 1.4, bh);
  // Figurehead of 1801 to 1803: two cupids holding the royal arms beneath a crown [S1, S50];
  // their sashes blue on the starboard side and red on the larboard.
  const fx = -4.7, fy = 11.0;
  const gilt = M.gilt, Wg = (c) => mat({ c, whole: true });
  // The shield faces forward, framed in gilt, quartered red, gold and blue.
  k.boxR(fx + 0.2, fy + 0.75, 0, 0.18, 1.2, 0.95, gilt, { z: 0.38 });
  k.boxR(fx + 0.12, fy + 0.78, -0.22, 0.12, 0.5, 0.42, Wg('#c0302a'), { z: 0.38 });
  k.boxR(fx + 0.12, fy + 0.78, 0.22, 0.12, 0.5, 0.42, Wg('#2a4a8a'), { z: 0.38 });
  k.boxR(fx + 0.32, fy + 0.25, 0.0, 0.12, 0.45, 0.85, Wg('#c0302a'), { z: 0.38 });
  // The crown above: a band, arches and an orb.
  k.lathe([[0.3, fy + 1.55], [0.34, fy + 1.71], [0.3, fy + 1.75]], fx - 0.05, 0, gilt, { seg: 12, capTop: true });
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI; k.tube([[fx - 0.05 + Math.cos(a) * 0.3, fy + 1.55 + 0.18, Math.sin(a) * 0.3], [fx - 0.05 + Math.cos(a) * 0.22, fy + 1.55 + 0.42, Math.sin(a) * 0.22], [fx - 0.05, fy + 1.55 + 0.5, 0], [fx - 0.05 - Math.cos(a) * 0.22, fy + 1.55 + 0.42, -Math.sin(a) * 0.22], [fx - 0.05 - Math.cos(a) * 0.3, fy + 1.55 + 0.18, -Math.sin(a) * 0.3]], 0.03, gilt, { seg: 4 }); }
  k.sphere(fx - 0.05, fy + 1.55 + 0.6, 0, 0.08, gilt, { seg: 8, rings: 5 });
  k.cyl(fx - 0.05, fy + 1.55, 0, 0.36, 0.08, Wg('#8a2a2a'), { seg: 12 });
  // Two cupids, one either side, each with a hand on the shield.
  const skin = Wg('#f2dcc2');
  for (const sd of [-1, 1]) {
    const cz = sd * 0.68, cx = fx + 0.35, cy = fy + 0.15;
    k.lathe([[0.0, cy], [0.17, cy + 0.06], [0.21, cy + 0.28], [0.17, cy + 0.5], [0.1, cy + 0.58], [0.0, cy + 0.6]], cx, cz, skin, { seg: 10 });
    k.sphere(cx - 0.03, cy + 0.0 + 0.78, cz, 0.16, skin, { seg: 10, rings: 7 });
    k.sphere(cx - 0.02, cy + 0.0 + 0.9, cz, 0.15, Wg('#d8b050'), { seg: 10, rings: 6, t0: Math.PI * 0.45 }); // gilt curls
    k.beam([cx, fy + 0.45, cz], [cx - 0.2, fy + 0.55, cz - sd * 0.4], 0.07, skin); // arm on the shield
    k.beam([cx, fy + 0.15, cz], [cx - 0.25, fy - 0.25, cz + sd * 0.08], 0.09, skin); // legs
    k.beam([cx, fy + 0.15, cz], [cx + 0.1, fy - 0.28, cz - sd * 0.06], 0.09, skin);
    k.boxR(cx, fy + 0.42, cz, 0.36, 0.08, 0.44, Wg(sd > 0 ? '#3a5aa8' : '#c0302a'), { x: sd * 0.7, z: 0.5 }); // sash
    for (const w of [0.18, 0.36]) k.boxR(cx + 0.22, fy + 0.62 + w * 0.5, cz + sd * w, 0.04, 0.42, 0.26, Wg('#f6f2e8'), { y: sd * 0.5, z: -0.3 }); // wings
    k.sphere(cx, fy - 0.02, cz, 0.13, gilt, { seg: 8, rings: 5 }); // gilt cloud they stand on
  }
  k.sphere(fx + 0.5, fy - 0.3, 0, 0.42, gilt, { seg: 10, rings: 6 });
  // Catheads with the best bower anchor hung ready.
  const ch = mat({ c: '#2a2624', cut: '#7a5434' });
  const cz = halfB(1.2, 15.3);
  k.beam([2.4, 15.35, cz - 1.2], [0.6, 15.75, cz + 1.9], 0.42, ch);
  anchor(k, 0.9, 10.2, halfB(0.9, 12.0) + 0.4, 1, 'x');
  k.rope([0.7, 15.6, cz + 1.8], [0.9, 15.0, halfB(0.9, 12.0) + 0.4], 0.04, mat({ c: '#6a5232' }), 0.02, 4);
  // Hawse holes in the bows (two on this side).
  for (const [x, y] of [[1.4, 9.3], [2.6, 9.1]]) k.cyl(x, y, halfB(x, y) - 0.6, 0.3, 0.75, mat({ c: '#161210', cut: '#161210' }), { axis: 'z', seg: 12 });
}

export function anchor(k, x, y, z, s = 1, along = 'z', whole = false) {
  // Shank vertical; arms spread along `along` (the flukes lie against the ship's side when
  // hung at the cathead); the wooden stock crosses the other way.
  const iron = mat({ c: '#2e2c2a', cut: '#2e2c2a', whole });
  const A = (u, v) => (along === 'z' ? [x, y + v, z + u] : [x + u, y + v, z]);
  k.beam(A(0, 0), A(0, 4.6 * s), 0.16 * s, iron);
  for (const sg of [-1, 1]) k.tube([A(0, 0.1), A(sg * 0.7 * s, 0.25 * s), A(sg * 1.25 * s, 0.9 * s)], 0.09 * s, iron, { seg: 5 });
  for (const sg of [-1, 1]) { const p = A(sg * 1.25 * s, 0.95 * s); k.boxR(p[0], p[1], p[2], along === 'z' ? 0.08 * s : 0.42 * s, 0.32 * s, along === 'z' ? 0.42 * s : 0.08 * s, iron, along === 'z' ? { x: -sg * 0.6 } : { z: sg * 0.6 }); }
  const st = A(0, 4.15 * s);
  if (along === 'z') k.box(st[0] - 1.6 * s, st[1] - 0.15 * s, st[2] - 0.2 * s, st[0] + 1.6 * s, st[1] + 0.15 * s, st[2] + 0.2 * s, mat({ c: '#7a5634', cut: '#7a5634', whole }));
  else k.box(st[0] - 0.2 * s, st[1] - 0.15 * s, st[2] - 1.6 * s, st[0] + 0.2 * s, st[1] + 0.15 * s, st[2] + 1.6 * s, mat({ c: '#7a5634', cut: '#7a5634', whole }));
  const ring = A(0, 4.75 * s);
  k.lathe([[0.25 * s, ring[1] - 0.1 * s], [0.32 * s, ring[1]], [0.25 * s, ring[1] + 0.1 * s]], ring[0], ring[2], iron, { seg: 8, capTop: false, capBot: false });
}

// Stern windows on each tier, set in the raked stern, and the quarter gallery.
export function buildStern(k) {
  const tiers = [{ y: Y.middle + 0.75, h: 1.05 }, { y: Y.upper + 0.75, h: 1.1 }, { y: Y.qd + 0.6, h: 1.05 }];
  const fr = mat({ c: '#e8dcc0', cut: '#8a5c34' });
  for (const T of tiers) {
    const ym = T.y + T.h / 2;
    const xs = sternX(ym);
    const zMax = halfB(xs - 0.6, ym) - 0.5;
    for (let z = 0.55; z < zMax - 0.4; z += 1.25) {
      k.boxR(xs - 0.12, ym, z + 0.45, 0.62, T.h, 0.85, M.window, { z: -0.26 });
      k.boxR(xs - 0.05, T.y - 0.06, z + 0.45, 0.6, 0.1, 1.0, fr, { z: -0.26 });
    }
    // A carved rail outside each tier of the stern.
    k.boxR(xs + 0.12, T.y - 0.12, 2.5, 0.25, 0.18, 6.2, M.gilt, { z: -0.26 });
  }
  // Quarter gallery (the admiral's and captain's private heads [S25]) on the starboard quarter.
  const gx0 = 51.6, gx1 = 56.4;
  for (const [y0, y1] of [[Y.upper + 0.2, Y.qd - 0.1], [Y.qd + 0.2, Y.poop + 0.1]]) {
    const z0 = halfB(53.5, (y0 + y1) / 2) - 0.2;
    k.box(gx0, y0, z0, gx1, y1, z0 + 1.0, M.black);
    for (let x = gx0 + 0.6; x < gx1 - 0.4; x += 1.1) k.box(x - 0.35, y0 + 0.35, z0 + 0.99, x + 0.35, y1 - 0.35, z0 + 1.05, M.window);
    k.box(gx0 - 0.1, y1 - 0.12, z0, gx1 + 0.1, y1 + 0.08, z0 + 1.15, M.gilt);
  }
  k.lathe([[0.9, Y.upper - 0.4], [0.5, Y.upper - 1.4], [0.05, Y.upper - 1.9]], 54, halfB(54, Y.upper) + 0.55, M.black, { seg: 10, capTop: true });
  // Taffrail carving.
  k.box(58.2, 18.9, -0.3, 58.9, 19.35, 5.0, M.gilt);
}

// Channels (platforms that spread the shrouds), above the upper-deck ports since 1803 [S1].
export const CHANNEL = { fore: [4.6, 11.2], main: [26.6, 34.0], mizzen: [42.0, 47.0] };
export const CH_Y = 15.45;
export function buildChannels(k) {
  const m = mat({ c: '#2a2624', cut: '#7a5434' });
  for (const [a, b] of Object.values(CHANNEL)) {
    for (let x = a; x < b; x += 0.8) {
      const x1 = Math.min(b, x + 0.8);
      const z = halfB(x, CH_Y);
      k.box(x, CH_Y - 0.15, z - 0.1, x1, CH_Y + 0.1, z + 0.75, m);
    }
  }
}
export function chainZ(x) { return halfB(x, CH_Y) + 0.62; }

export { MAST, shade };
