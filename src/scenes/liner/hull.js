/* The Atlantic Liner: hull shell, double bottom, bulkheads, water, funnels, masts,
 * lifeboats and deck gear. Everything here is the ship's fabric; rooms.js fills it.
 */
import { THREE, mat, props, shade } from '../../engine/index.js';
import { LOA, WL, BOOT, DK, SLAB, FUNNELS, FOREMAST_X, MAINMAST_X, BULKHEADS, M, sheer, stemX, ybot, hb, hbDeck, inner, slab } from './shape.js';

const LEVELS = [0, 0.5, 1.2, 2.2, 3.4, 4.6, 6, 7.4, 9, 10.2, BOOT, 15.8, 18.6, 21.5, 24.4, 27.3, 99];

function stations(a, b) {
  const xs = [];
  for (let x = a; x <= b + 1e-6;) {
    xs.push(Math.min(x, b));
    if (x >= b) break;
    const st = x < 16 ? 1 : x < 60 ? 2.5 : x < 248 ? 6 : x < 296 ? 2.5 : 1.2;
    x = Math.min(b, x + st);
  }
  return xs;
}

// One section of the shell: a closed polygon in (z, y), outer plating up and inner lining down.
function shellSection(x, sign = 1, t = 0.45) {
  const yb = ybot(x), ys = sheer(x);
  const out = [[-0.45 * sign, yb]];
  const inn = [];
  for (const L of LEVELS) {
    const y = Math.max(yb, Math.min(ys, L));
    const z = hb(x, y);
    out.push([z * sign, y]);
    inn.push([Math.max(-0.45, z - t) * sign, Math.min(ys, Math.max(y, yb + t))]);
  }
  inn.reverse();
  return { x, pts: out.concat(inn, [[-0.45 * sign, Math.min(ys, yb + t)]]) };
}

export function buildHull(k) {
  const L = LEVELS.length;
  const matFn = (s, i, A) => {
    if (i === 0) return M.hullRed;
    if (i < L) { const y = (A.pts[i][1] + A.pts[i + 1][1]) / 2; return y < BOOT ? M.hullRed : M.hullBlack; }
    if (i === L) return M.hullBlack;
    return M.hullIn;
  };
  const secs = stations(0.6, LOA).map((x) => shellSection(x));
  k.loft(secs, M.hullBlack, { matFn, cap: M.hullBlack });

  // Near-side plating at the two ends, drawn whole, to frame the picture as in the books.
  const prev = k.whole;
  k.whole = true;
  const n = LEVELS.length * 2 + 2;
  const mirFn = (s, i, A) => { const j = n - 1 - i; const y = (A.pts[j][1] + A.pts[(j + 1) % n][1]) / 2; return y < BOOT ? M.hullRed : M.hullBlack; };
  k.loft(stations(0.6, 9).map((x) => shellSection(x, -1)), M.hullBlack, { matFn: mirFn, cap: M.hullBlack });
  k.loft(stations(303, LOA).map((x) => shellSection(x, -1)), M.hullBlack, { matFn: mirFn, cap: M.hullBlack });
  // The keel bar and bilge strake on the near side, so the bottom line reads.
  const keel = [];
  for (const x of stations(13, 266)) keel.push({ x, pts: [[0, -0.05], [-Math.max(0.6, hb(x, 1.2)), 1.2], [-Math.max(0.6, hb(x, 1.2)) + 0.4, 1.5], [0, 0.45]] });
  k.loft(keel, M.hullRed, { cap: M.hullRed });
  k.whole = prev;

  // Double bottom: a solid band from keel to tank top (1.8 m), red lead in section.
  const db = [];
  for (const x of stations(14, 268)) {
    const yb = ybot(x);
    db.push({ x, pts: [[-0.45, yb + 0.2], [Math.max(0.2, hb(x, yb + 0.9) - 0.5), yb + 0.4], [Math.max(0.2, inner(x, DK.tt)), DK.tt], [-0.45, DK.tt]] });
  }
  k.loft(db, mat({ c: '#7a7672', c2: '#6a6662', pat: 'plates', s: 1.0, cut: '#8a3a26' }), { matFn: (s, i) => (i === 2 ? M.deckSteel : null) || mat({ c: '#6a3a2a', cut: '#8a3a26' }) });

  // Watertight bulkheads from the tank top up to D deck.
  for (const bx of BULKHEADS) {
    const yt = bx < 50 || bx > 270 ? DK.C : DK.D;
    const y0 = Math.max(DK.tt, ybot(bx) + 0.4);
    const z1 = Math.max(0.5, inner(bx, (y0 + yt) / 2) + 0.2);
    k.box(bx - 0.12, y0, -0.45, bx + 0.12, yt - SLAB, z1, M.bulkhead);
  }
}

// The sea round the ship and the water's cut face (opaque deep water drawn round the hull's
// profile, so the engine rooms below the waterline stay clear).
export function buildWater(k, makeSea) {
  const deep = mat({ c: '#2e6478', c2: '#2e6478', noEdge: true, plainCut: true });
  const Z = 0.04;
  const band = (x0a, x1a, x0b, x1b, y0, y1) => {
    const s0 = 0.55 + 0.6 * Math.max(0, Math.min(1, (y0 + 40) / 52)), s1 = 0.55 + 0.6 * Math.max(0, Math.min(1, (y1 + 40) / 52));
    k.quad([x0a, y0, Z], [x0b, y1, Z], [x1b, y1, Z], [x1a, y0, Z], deep, [s0, s1, s1, s0]);
  };
  const FAR = 3000;
  band(-FAR, FAR, -FAR, FAR, -40, -12);
  band(-FAR, FAR, -FAR, FAR, -12, 0);
  // Bow: water up to the stem; stern: water under the counter.
  const sternX = (y) => { // aftmost x where the hull bottom is at or below y
    let lo = 265, hi = LOA;
    if (y >= ybot(LOA)) return LOA;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (ybot(m) <= y) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const step = 0.6;
  for (let y = 0; y < WL - 1e-6; y += step) {
    const y1 = Math.min(WL, y + step);
    band(-FAR, stemX(y), -FAR, stemX(y1), y, y1);
    band(sternX(y), FAR, sternX(y1), FAR, y, y1);
  }
  const inside = (x, z) => x > stemX(WL) - 0.3 && x < LOA + 0.3 && z < hb(x, WL) + 0.5;
  k.object(makeSea({ level: WL, x0: -900, x1: 1200, detailX0: -60, detailX1: 380, step: 1.6, mask: inside, maskBox: [-5, 0, 315, 22], deep: '#24566c', shallow: '#3c7c8e', amp: 1.1 }));
}

// ------------------------------------------------------------------ funnels
// An elliptical tube (a, b semi-axes in x and z), raked aft by `rake` metres per metre.
function ellTube(k, cx, y0, y1, a, b, rake, m, inward) {
  const seg = 28;
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
    const P = (t, y) => [cx + Math.cos(t) * a + (y - y0) * rake, y, Math.sin(t) * b];
    const A = P(t0, y0), B = P(t1, y0), C = P(t1, y1), D = P(t0, y1);
    if (inward) k.quad(A, B, C, D, m); else k.quad(A, D, C, B, m);
  }
}
function ellRing(k, cx, y, a0, b0, a1, b1, rake, y0, m, up) {
  const seg = 28;
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
    const dx = (y - y0) * rake;
    const P = (t, a, b) => [cx + dx + Math.cos(t) * a, y, Math.sin(t) * b];
    if (up) k.quad(P(t0, a0, b0), P(t1, a0, b0), P(t1, a1, b1), P(t0, a1, b1), m);
    else k.quad(P(t0, a0, b0), P(t0, a1, b1), P(t1, a1, b1), P(t1, a0, b0), m);
  }
}
export function buildFunnels(k) {
  const rake = 0.07;
  for (const F of FUNNELS) {
    const cx = (F.x0 + F.x1) / 2, a = (F.x1 - F.x0) / 2, b = 7.1 / 2, y0 = DK.S, y1 = F.top;
    const H = y1 - y0, topBlack = y1 - H * 0.2;
    const bands = [y0 + H * 0.45, y0 + H * 0.62];
    // Outer skin in bands: red, thin black rings at two segment joints, black top.
    const cuts = [y0, bands[0], bands[0] + 0.35, bands[1], bands[1] + 0.35, topBlack, y1];
    for (let i = 0; i < cuts.length - 1; i++) ellTube(k, cx, cuts[i], cuts[i + 1], a, b, rake, i === 1 || i === 3 || i === 5 ? M.funnelBlack : M.cunardRed, false);
    // Inner skin (soot), offset in and following the same rake; the cut shows the gap as section.
    const ins = 0.35;
    const P0 = (y) => cx + (y - y0) * rake;
    ellTubeOff(k, P0, y0, y1, a - ins, b - ins, M.soot);
    ellRing(k, cx, y1, a - ins, b - ins, a, b, rake, y0, M.funnelBlack, true);
    // Uptake: a dark trunk inside, with the boiler smoke rising (particles in setup).
    k.box(cx - a * 0.55, y0, 0.0, cx + a * 0.55, y0 + 2.5, b * 0.55, M.soot);
    // Whistles (two on the forward funnel, one on the second) on a small platform.
    const nW = F === FUNNELS[0] ? 2 : F === FUNNELS[1] ? 1 : 0;
    for (let w = 0; w < nW; w++) {
      const wx = cx - a - 0.6 + (topBlack - 2.5 - y0) * rake, wy = topBlack - 3.2, wz = 0.8 + w * 1.4;
      k.cyl(wx, wy, wz, 0.32, 1.6, M.brass, { seg: 10 });
      k.cyl(wx, wy + 1.6, wz, 0.12, 0.4, M.brass, { seg: 8 });
      k.cyl(wx + 0.4, wy - 4, wz, 0.08, 4, M.steelGrey, { seg: 6 });
    }
    // Guy wires to the deck.
    for (const [dx, dz] of [[-1, 0.3], [1, 0.3], [-0.6, 1], [0.6, 1]]) {
      const top = [cx + (topBlack - 1 - y0) * rake + dx * a * 0.9, topBlack - 1, dz * b * 0.9];
      k.rope(top, [cx + dx * (a + 7), DK.S + 0.3, dz * (b + 6)], 0.03, M.darkRail, 0.01, 4);
    }
  }
}
function ellTubeOff(k, P0, y0, y1, a, b, m) {
  const seg = 28;
  for (let i = 0; i < seg; i++) {
    const t0 = (i / seg) * Math.PI * 2, t1 = ((i + 1) / seg) * Math.PI * 2;
    const P = (t, y) => [P0(y) + Math.cos(t) * a, y, Math.sin(t) * b];
    k.quad(P(t0, y0), P(t1, y0), P(t1, y1), P(t0, y1), m);
  }
}

// ------------------------------------------------------------------ masts and rigging
export function buildMasts(k) {
  // Foremast: a hollow steel tube with the lookout's ladder inside (cut open by the section).
  const fx = FOREMAST_X, fy0 = DK.M, top = 71.3;
  k.lathe([[0.5, fy0], [0.66, fy0], [0.5, 50.4], [0.36, 50.4], [0.5, fy0]], fx, 0, M.mast, { seg: 16, capTop: false, capBot: false });
  // Upper mast above the nest: solid, drawn whole.
  const pw = k.whole; k.whole = true;
  k.lathe([[0.34, 51.7], [0.26, 62], [0.13, top]], fx, 0, M.mast, { seg: 10 });
  k.sphere(fx, top + 0.15, 0, 0.18, M.mast, { seg: 8, rings: 5 });
  // Crow's nest: a drum on a floor, with a glass weather screen facing forward.
  k.lathe([[1.12, 50.5], [1.25, 50.5], [1.25, 51.6], [1.12, 51.6], [1.12, 50.5]], fx, 0, M.mast, { seg: 20, capTop: false, capBot: false });
  k.cyl(fx, 50.3, 0, 1.25, 0.2, M.mast, { seg: 20 });
  k.whole = pw;
  for (let i = 0; i < 4; i++) {
    const a0 = Math.PI * (0.7 + i * 0.15), a1 = a0 + Math.PI * 0.15;
    const P = (a, y) => [fx + Math.cos(a) * 1.22, y, Math.sin(a) * 1.22];
    k.glass([P(a0, 51.6), P(a1, 51.6), P(a1, 52.35), P(a0, 52.35)], { c: '#d8eef4', alpha: 0.3, whole: true });
  }
  // Ladder rungs inside the mast (the 110 steps).
  for (let y = fy0 + 0.4; y < 50.3; y += 0.3) k.box(fx - 0.25, y, 0.05, fx + 0.25, y + 0.04, 0.12, M.darkRail);
  // Derricks stowed against the mast (7 tubular steel derricks; four drawn).
  for (const [ang, len, dz] of [[0.22, 18, 0.9], [-0.22, 18, 0.9], [0.26, 15, 3.2], [-0.26, 15, 3.2]]) {
    const foot = [fx + Math.sign(ang) * 0.8, fy0 + 3.2, dz];
    k.cyl(foot[0], foot[1], foot[2], 0.22, 0.01, M.mast, { seg: 6 });
    const tip = [foot[0] + Math.sin(ang) * len, foot[1] + Math.cos(ang) * len, dz];
    k.tube([foot, tip], 0.2, M.mast, { seg: 6 });
    k.rope(tip, [fx, 46, 0.2], 0.03, M.darkRail, 0.02, 3);
  }
  // Mainmast aft.
  const mx = MAINMAST_X, my0 = DK.P;
  k.whole = true;
  k.lathe([[0.55, my0], [0.42, 50], [0.16, 66]], mx, 0, M.mast, { seg: 12 });
  k.whole = pw;
  // Rigging: forestay to the stem, shrouds, and the wireless aerials between the masts.
  const ink = M.darkRail;
  k.rope([fx, 66, 0], [1.2, sheer(1.2) + 1.2, 0.1], 0.04, ink, 0.0, 8);
  for (const dz of [6, 12]) k.rope([fx, 49, 0.3], [fx - 6, sheer(fx) + 0.8, Math.min(dz, hb(fx - 6, 30) - 0.5)], 0.035, ink, 0.0, 4);
  for (const dz of [6, 12]) k.rope([fx, 49, 0.3], [fx + 5, DK.M + 1.2, Math.min(dz, hb(fx + 5, 28) - 0.5)], 0.035, ink, 0.0, 4);
  for (const [y0, y1, z] of [[64, 60, 0.6], [62, 58.5, 2.0]]) k.rope([fx, y0, z], [mx, y1, z], 0.025, ink, 0.012, 24);
  k.rope([mx, 64, 0.3], [LOA - 1.5, sheer(LOA - 1.5) + 1.5, 0.3], 0.035, ink, 0.0, 8);
  // Flag at the mainmast head (Blue Ensign or house flag not drawn: no source).
}

// ------------------------------------------------------------------ lifeboats
function boat(k, x, y, z, m) {
  const L = 11.0, B = 3.7, D = 1.5;
  const secs = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, xx = x - L / 2 + L * t;
    const w = (B / 2) * Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, t))), 0.55);
    const dd = D * (0.6 + 0.4 * Math.pow(Math.sin(Math.PI * t), 0.4));
    secs.push({ x: xx, pts: [[z, y - dd], [z + w * 0.7, y - dd * 0.55], [z + w, y], [z + w * 0.85, y + 0.35], [z, y + 0.55], [z - w * 0.85, y + 0.35], [z - w, y], [z - w * 0.7, y - dd * 0.55]] });
  }
  k.loft(secs, M.boatHull, { matFn: (s, i) => (i === 3 || i === 4 ? M.boatCover : M.boatHull) });
  void m;
}
export const BOAT_XS = [87, 99, 120, 132, 160, 172, 196, 208, 219];
export function buildBoats(k) {
  const y = DK.S + 3.6;
  const zb = 17.4;
  const xs = [86.5, 98.0, 118.5, 130.0, 157.0, 168.5, 194.0, 205.5, 217.0];
  // 24 boats were carried, 12 a side; this layout fits 12 between the funnels.
  const all = [86.5, 98.0, 118.5, 130.0, 157.0, 168.5, 194.0, 205.5, 217.0, 229, 240.5, 252];
  void xs;
  for (const x of all) {
    boat(k, x, y, zb);
    // Gravity davits: two curved arms on sloping trackways.
    for (const dx of [-4.2, 4.2]) {
      k.beam([x + dx, DK.S, 13.8], [x + dx, DK.S + 2.6, 15.3], 0.22, M.whiteHouse);
      k.tube([[x + dx, DK.S + 2.6, 15.3], [x + dx, DK.S + 5.4, 16.3], [x + dx, DK.S + 5.9, 17.4], [x + dx, DK.S + 5.6, 18.1]], 0.16, M.whiteHouse, { seg: 5 });
      k.rope([x + dx, DK.S + 5.6, 18.0], [x + dx * 0.9, y + 0.5, zb], 0.02, M.darkRail, 0, 2);
    }
  }
  return all;
}

// ------------------------------------------------------------------ deck gear and fittings
export function ventilator(k, x, y, z, h = 2.4, r = 0.45, face = -1) {
  k.cyl(x, y, z, r * 0.7, h, M.whiteHouse, { seg: 10 });
  // Cowl mouth turned to face the wind (forward).
  k.sphere(x + face * 0.15, y + h + 0.1, z, r, M.whiteHouse, { seg: 10, rings: 6 });
  k.cyl(x + face * r * 0.9, y + h + 0.1, z, r * 0.8, 0.12, mat({ c: '#b8402e', cut: '#7a2a1e' }), { axis: 'x', seg: 10 });
}

export function buildDeckGear(k) {
  // Forecastle deck: teak, 1.1 m below the top of the bulwark.
  const secs = [];
  for (const x of stations(0.8, 30)) {
    const y = sheer(x) - 1.1;
    secs.push({ x, pts: [[-0.45, y - SLAB], [Math.max(0.3, inner(x, y - SLAB) + 0.2), y - SLAB], [Math.max(0.3, inner(x, y) + 0.2), y], [-0.45, y]] });
  }
  k.loft(secs, M.slabCut, { matFn: (s, i) => (i === 2 ? M.teak : M.slabCut) });
  const fy = (x) => sheer(x) - 1.1;
  // Windlass and capstans, the cable running to the hawse pipe and down the navel pipe.
  const wx = 16;
  k.box(wx - 1.6, fy(wx), 0.4, wx + 1.6, fy(wx) + 1.1, 3.6, M.darkGrey);
  for (const dz of [1.0, 3.0]) {
    k.cyl(wx, fy(wx) + 1.1, dz, 0.75, 0.35, M.darkGrey, { seg: 14 });
    k.cyl(wx, fy(wx) + 1.45, dz, 0.45, 0.6, M.steelGrey, { seg: 12 });
  }
  for (const [cx, cz] of [[24, 4.5], [8, 3.0]]) { k.cyl(cx, fy(cx), cz, 0.45, 0.9, M.darkGrey, { seg: 12 }); k.cyl(cx, fy(cx) + 0.9, cz, 0.55, 0.15, M.darkGrey, { seg: 12 }); }
  const chain = mat({ c: '#3a3634', pat: 'rings', s: 0.12, cut: '#2a2624' });
  k.tube([[wx - 0.4, fy(wx) + 1.4, 3.0], [9, fy(9) + 0.3, 3.4], [4.5, fy(4.5) + 0.2, 3.0]], 0.16, chain, { seg: 6 });
  // Anchor in its hawse pipe on the starboard bow (seen through the hull from inside).
  k.tube([[4.5, fy(4.5), 3.0], [5.2, 24, hb(5.2, 24) - 0.2]], 0.35, M.darkGrey, { seg: 8 });
  // Mooring bitts and fairleads along the bulwark.
  for (const x of [6, 12, 20, 27]) { const z = Math.max(0.6, inner(x, fy(x)) - 0.6); k.cyl(x - 0.3, fy(x), z, 0.18, 0.7, M.darkGrey, { seg: 8 }); k.cyl(x + 0.3, fy(x), z, 0.18, 0.7, M.darkGrey, { seg: 8 }); }
  // Bulwark rail cap and a rail along the forecastle edge (the step down to the well deck).
  props.rail(k, 29.6, 30.0, fy(30), 0.2, { h: 1.0, step: 0.4, color: '#f2ece0' });
  for (let z = 0.4; z < inner(30, fy(30)); z += 1.6) k.cyl(29.9, fy(30), z, 0.025, 1.0, M.rail, { seg: 5 });
  k.cyl(29.9, fy(30) + 1.0, 0, 0.03, 0.01, M.rail, { seg: 4 });
  k.tube([[29.9, fy(30) + 1.0, -0.1], [29.9, fy(30) + 1.0, inner(30, fy(30))]], 0.03, M.rail, { seg: 5 });
}

export function railRun(k, x0, x1, y, z, step = 1.6, h = 1.05) {
  props.rail(k, x0, x1, y, z, { h, step, color: '#f2ece0', r: 0.03 });
}

export { shade, THREE };
