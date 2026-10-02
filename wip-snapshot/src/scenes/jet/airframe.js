/* The Jumbo Jet: the airframe. Fuselage shell, floors, bulkheads, belly fairing, wings,
 * tail, engines and position lights. Interiors are in cabin.js and below.js.
 */
import { mat } from '../../engine/index.js';
import {
  ZC, FL, CEIL, UF, HOLDTOP, SKIN, M, MW, sec, rad, shellPt, wallZ, farWall, topY, botY,
  revolveX, skin, wingSolid, quadW, lerp,
} from './common.js';

const EPS = 0.03;
const NA = 56; // points around half... per side of the ring

// x stations for the shell: close in the nose and tail, wider in the constant section.
function stations(a, b) {
  const xs = [];
  let x = a;
  while (x < b - 1e-6) {
    xs.push(x);
    const st = x < 9 ? 0.4 : x < 24 ? 0.8 : x < 41 ? 3 : x < 56 ? 1.5 : 0.7;
    x = Math.min(b, x + st);
  }
  xs.push(b);
  return xs;
}

// One ring of the pressure shell: outer plating round the far side and back along the lining.
function ring(x) {
  const S = sec(x);
  const out = [], inn = [];
  for (let i = 0; i <= NA * 2; i++) {
    const th = Math.PI - EPS - ((2 * Math.PI - 2 * EPS) * i) / (NA * 2);
    const p = shellPt(S, th, 0), q = shellPt(S, th, SKIN);
    out.push([p[2], p[1]]);
    inn.push([q[2], q[1]]);
  }
  return { x, pts: out.concat(inn.reverse()) };
}

export function buildShell(k, S) {
  const xs = stations(2.6, 66.6);
  const secs = xs.map(ring);
  const nOut = NA * 2 + 1;
  const matFn = (s, i, A, B) => {
    const n = A.pts.length;
    const j = (i + 1) % n;
    const y = (A.pts[i][1] + A.pts[j][1] + B.pts[i][1] + B.pts[j][1]) / 4;
    const z = (A.pts[i][0] + A.pts[j][0]) / 2 - ZC;
    const x = (A.x + B.x) / 2;
    const belly = x > 20.4 && x < 37.6 && y < 0.55;
    if (i < nOut - 1) { // outer plating
      if (belly) return null;
      if (x > 4.4 && x < 6.6 && y > topY(x) - 0.95 && y < topY(x) - 0.08 && Math.abs(z) < 2.4 && (x < 5.6 || z > 0.9)) return M.windscreen;
      return y > 2.45 ? M.white : M.metal;
    }
    if (i === nOut - 1 || i === n - 1) return belly ? null : M.white; // seam walls (near side, cut away)
    // lining
    if (belly) return null;
    if (y < HOLDTOP + 0.15) return M.primer;
    if (x < 7.45 && y > UF) return M.panelGrey;
    if (x < 15.6 && y > UF - 0.05) return M.trim;
    if (y > CEIL + 0.05) return M.primer;
    if (x > 58.8) return M.primer;
    return M.trim;
  };
  k.loft(secs, M.white, { matFn, cap: M.primer });

  // Blue cheatline along the window row, on the far (right) side.
  const band = [];
  for (const x of stations(3.4, 63)) {
    const Sx = sec(x);
    const z0 = wallZ(x, 3.42, -0.012), z1 = wallZ(x, 4.18, -0.012);
    if (z0 < 0.5 || z1 < 0.5) continue;
    band.push({ x, pts: [[ZC + z0, 3.42], [ZC + z0 + 0.03, 3.42], [ZC + z1 + 0.03, 4.18], [ZC + z1, 4.18]] });
    void Sx;
  }
  k.loft(band, M.cheat);

  // Windows seen from outside on the far side: dark by day, lit at night.
  for (let x = 4.6 + 0.254; x < 58.4; x += 0.508) {
    if (DOOR_GAP(x)) continue;
    const zw = wallZ(x, 3.8, -0.03);
    k.box(x - 0.12, 3.6, ZC + zw - 0.02, x + 0.12, 3.98, ZC + zw + 0.03, M.winOut);
  }
  for (const x of [9.9, 11.6, 13.3]) { // three each side on the upper deck [S13]
    const zw = wallZ(x, 6.45, -0.03);
    k.box(x - 0.13, 6.25, ZC + zw - 0.02, x + 0.13, 6.62, ZC + zw + 0.03, M.winOut);
  }
  // Far-side doors outlined on the skin.
  for (const dx of S.DOORS) {
    const zw = wallZ(dx, 3.9, -0.02);
    k.box(dx - 0.56, FL + 0.02, ZC + zw - 0.03, dx + 0.56, FL + 2.0, ZC + zw + 0.02, mat({ c: '#e8e2d4', c2: '#d8d2c4', pat: 'panels', s: 1.1 }));
  }
  farTitles(k);

  // Radome: the pointed nose cone, black [S1 shape; colour illustrative].
  const rprof = [];
  for (let i = 0; i <= 10; i++) {
    const x = 2.6 * (i / 10) ** 0.85;
    const Sx = sec(Math.max(0.02, x));
    rprof.push([x, Math.max(0.02, Math.min(Sx.W, (topY(x) - botY(x)) / 2))]);
  }
  rprof.unshift([0, 0]);
  rprof.push([2.65, 0]);
  const ry = (x) => (topY(x) + botY(x)) / 2;
  // A short lathe around a slightly drooping axis: build ring by ring.
  const rr = [];
  for (let i = 0; i <= 12; i++) {
    const x = 0.02 + 2.62 * (i / 12) ** 0.8;
    const Sx = sec(x);
    const R = [];
    for (let j = 0; j < 24; j++) {
      const th = (j / 24) * Math.PI * 2;
      const p = shellPt(Sx, th, 0);
      R.push(p);
    }
    rr.push(R);
  }
  skin(k, rr, M.radome, { capA: M.radome, capB: M.primer });
  void rprof; void ry;

  // Tail cone tip: the unpressurised cone closes on the APU exhaust.
  const tr = [];
  for (let i = 0; i <= 6; i++) {
    const x = 66.4 + (2.2 * i) / 6;
    const Sx = sec(x);
    const R = [];
    for (let j = 0; j < 24; j++) R.push(shellPt(Sx, (j / 24) * Math.PI * 2, 0));
    tr.push(R);
  }
  skin(k, tr, M.white, { capA: M.primer, capB: M.black });
}

// Door positions on the far wall, where no windows go.
export const DOOR_GAP = (x) => [9.5, 18.8, 30.61, 40.74, 55.14].some((d) => Math.abs(x - d) < 0.62);

// "PAN AM" in widely spaced black capitals between doors 1 and 2, on the far side [S26].
function farTitles(k) {
  const ink = mat({ c: '#1a1a1e' });
  const y0 = 4.55, h = 0.62, sw = 0.11;
  // The far side is read from outside, nose to the right, so the letters run from x = 16.6 down to 10.6.
  const letters = 'PAN AM'.split('');
  let x = 16.4;
  for (const ch of letters) {
    if (ch === ' ') { x -= 0.75; continue; }
    const zw = (yy) => ZC + wallZ(x - 0.25, yy, -0.035);
    const bar = (xa, ya, xb, yb) => { // a stroke from (xa, ya) to (xb, yb) in letter space (x to the left)
      const p = [x - xa, y0 + ya, zw(y0 + ya)], q = [x - xb, y0 + yb, zw(y0 + yb)];
      k.beam(p, q, sw, ink);
    };
    const w = 0.5;
    if (ch === 'P') { bar(0, 0, 0, h); bar(0, h, w * 0.8, h); bar(w * 0.8, h, w * 0.8, h * 0.5); bar(w * 0.8, h * 0.5, 0, h * 0.5); }
    if (ch === 'A') { bar(0, 0, w / 2, h); bar(w / 2, h, w, 0); bar(w * 0.22, h * 0.4, w * 0.78, h * 0.4); }
    if (ch === 'N') { bar(0, 0, 0, h); bar(0, h, w, 0); bar(w, 0, w, h); }
    if (ch === 'M') { bar(0, 0, 0, h); bar(0, h, w / 2, h * 0.35); bar(w / 2, h * 0.35, w, h); bar(w, h, w, 0); }
    x -= 0.95;
  }
}

// A solid plate filling the inside of the shell between ymin and ymax, from x0 to x1,
// carried to z = -0.3 so the cut shows it in section.
export function plug(k, x0, x1, ymin, ymax, m, o = {}) {
  const N = o.n || 14;
  const mk = (x) => {
    const pts = [[-0.3, ymin]];
    for (let i = 0; i <= N; i++) {
      const y = ymin + ((ymax - ymin) * i) / N;
      pts.push([ZC + Math.max(0.05, wallZ(x, y, SKIN * 0.5)), y]);
    }
    pts.push([-0.3, ymax]);
    return { x, pts };
  };
  k.loft([mk(x0), mk(x1)], m);
}

// A slab across the inside of the shell at height y0..y1 from x0 to x1 (floors, ceilings).
export function slab(k, x0, x1, y0, y1, m, o = {}) {
  const zIn = o.z0 != null ? o.z0 : -0.3;
  const step = o.step || 0.6;
  const secs = [];
  for (let x = x0; ; x = Math.min(x1, x + step)) {
    const zf = o.z1 != null ? o.z1 : ZC + Math.max(0.2, Math.min(wallZ(x, y0, SKIN * 0.4), wallZ(x, y1, SKIN * 0.4)) - (o.inset || 0));
    secs.push({ x, pts: [[zIn, y0], [zf, y0], [zf, y1], [zIn, y1]] });
    if (x >= x1) break;
  }
  k.loft(secs, m);
}

// ------------------------------------------------------------------ floors and bulkheads
export function buildDecks(k) {
  // Main deck: carpeted floor panels on a layer of floor beams.
  slab(k, 2.9, 58.8, FL - 0.1, FL, M.floor);
  slab(k, 2.9, 58.8, HOLDTOP, FL - 0.1, M.beams);
  // Ceiling panels (holed for the spiral stair), and the upper deck floor above them.
  slab(k, 3.9, 9.55, CEIL, UF, M.floorBlue);
  slab(k, 9.55, 11.25, CEIL, UF, M.floorBlue, { z0: ZC + 0.85 });
  slab(k, 11.25, 15.6, CEIL, UF, M.floorBlue);
  slab(k, 2.9, 3.9, CEIL, CEIL + 0.06, M.ceiling, { inset: 0.05 });
  slab(k, 15.6, 58.8, CEIL, CEIL + 0.06, M.ceiling, { inset: 0.5 });
  // Pressure bulkheads (domed in reality; drawn as plates with ring stiffeners).
  plug(k, 2.6, 2.9, botY(2.75) + 0.12, topY(2.75) - 0.12, mat({ c: '#9aab94', c2: '#869a80', pat: 'rings', s: 0.35, cut: '#3a4440' }));
  plug(k, 58.8, 59.3, botY(59) + 0.2, topY(59) - 0.2, mat({ c: '#9aab94', c2: '#869a80', pat: 'rings', s: 0.35, cut: '#3a4440' }));
  // The upper deck ends at a bulkhead; aft of it the hump fairs down over a void of ducts.
  plug(k, 15.6, 15.72, UF, topY(15.66) - 0.15, M.bulkhead);
  // Shell frames in the holds and the crown, every 0.508 m (the window pitch): green primer.
  const fr = M.primer;
  for (let x = 3.1; x < 58.6; x += 0.508) {
    const S = sec(x);
    const lo = [], hi = [];
    for (let i = 0; i <= 10; i++) {
      const th = -Math.PI / 2 - 0.3 + (i / 10) * (Math.PI / 2 + 0.3 + Math.asin(Math.max(-1, Math.min(1, (HOLDTOP - S.yc) / Math.max(0.1, S.lh)))));
      lo.push(shellPt(S, th, SKIN + 0.05));
    }
    if (!(x > 20.4 && x < 37.6)) k.tube(lo, 0.035, fr, { seg: 4 });
    if (x > 15.7) {
      for (let i = 0; i <= 8; i++) {
        const th = 0.95 + (i / 8) * (Math.PI / 2 + 0.35 - 0.95);
        hi.push(shellPt(S, th, SKIN + 0.05));
      }
      k.tube(hi, 0.03, fr, { seg: 4 });
    }
  }
  // Air ducts and cable runs in the crown, above the ceiling.
  for (const [zz, r, y] of [[1.4, 0.2, CEIL + 0.45], [2.2, 0.14, CEIL + 0.35], [0.6, 0.12, CEIL + 0.3]]) {
    k.cyl(15.8, y, zz, r, 43, M.duct, { axis: 'x', seg: 10 });
  }
  k.cyl(15.8, CEIL + 0.85, 1.0, 0.05, 43, mat({ c: '#3a3a3e' }), { axis: 'x', seg: 5 });
  k.cyl(15.8, CEIL + 0.82, 1.7, 0.04, 43, mat({ c: '#6a4a3a' }), { axis: 'x', seg: 5 });
}

// ------------------------------------------------------------------ belly fairing
// The wing-to-body fairing under the centre section: lowest skin 0.35 m below the keel [S1].
export function buildFairing(k) {
  const secs = [];
  for (let x = 19.4; x <= 38.3; x += 0.9) {
    const e = Math.min(1, (x - 19.4) / 2.2, (38.3 - x) / 2.2);
    const bot = lerp(0.35, -0.35, Math.max(0, e));
    const yc = 1.05, a = 3.28, b = yc - bot, p = 3;
    const pts = [], inn = [];
    const n = 20;
    for (let i = 0; i <= n; i++) {
      const th = Math.PI - 0.05 + (i / n) * (Math.PI - 0.0) ; // near side round the bottom to the far side
      const c = Math.cos(th), s = Math.sin(th);
      const r = 1 / Math.pow(Math.pow(Math.abs(c) / a, p) + Math.pow(Math.abs(s) / b, p), 1 / p);
      const ri = 1 / Math.pow(Math.pow(Math.abs(c) / (a - 0.1), p) + Math.pow(Math.abs(s) / (b - 0.1), p), 1 / p);
      pts.push([ZC + r * c, yc + r * s]);
      inn.push([ZC + ri * c, yc + ri * s]);
    }
    secs.push({ x, pts: pts.concat(inn.reverse()) });
  }
  k.loft(secs, M.metal, { matFn: (s, i) => (i < 20 ? M.metal : M.primer), cap: M.metal });
}

// ------------------------------------------------------------------ wings
// Plan [S1, derived]: root leading edge x 20.6 and trailing edge 35.5 at the side of the body;
// tip chord 44.9 to 48.5; semispan 29.8 m; sweep 37.5 degrees [S7]; tip at y about 3.6.
const WST = [
  { zc: 3.0, le: 20.6, te: 35.5, y: 1.3, t: 0.13 },
  { zc: 12.1, le: 28.7, te: 37.6, y: 2.02, t: 0.115 },
  { zc: 21.3, le: 37.1, te: 42.2, y: 2.76, t: 0.105 },
  { zc: 29.8, le: 44.9, te: 48.5, y: 3.42, t: 0.095 },
];
export function wingAt(zc) {
  const a = Math.abs(zc);
  for (let i = 1; i < WST.length; i++) {
    if (a <= WST[i].zc || i === WST.length - 1) {
      const A = WST[i - 1], B = WST[i];
      const u = Math.max(0, Math.min(1, (a - A.zc) / (B.zc - A.zc)));
      return { le: lerp(A.le, B.le, u), te: lerp(A.te, B.te, u), y: lerp(A.y, B.y, u), t: lerp(A.t, B.t, u) };
    }
  }
  return WST[0];
}

export function buildWings(k) {
  // Far (right) wing: from inside the fuselage wall out to the tip.
  const far = [3.0, 6, 9, 12.1, 16, 21.3, 25.5, 29.8].map((zc) => Object.assign({ s: ZC + zc }, wingAt(zc)));
  const place = (x, y, z) => [x, y, z];
  wingSolid(k, far, mat({ c: '#c0c3c7', c2: '#adb1b5', pat: 'plates', s: 1.3, cut: '#3a3e44' }), { place });
  // Near (left) wing, drawn whole: we look down on it in front of the cut. Its inner end,
  // where the root has been taken away, shows the wing box in section: spars and fuel.
  const prev = k.whole;
  k.whole = true;
  const nz = [6.2, 9, 12.1, 16, 21.3, 25.5, 29.8].map((zc) => Object.assign({ s: ZC - zc }, wingAt(zc)));
  const rings = wingSolid(k, nz, MW.wing, { place, capA: MW.fuel, capB: MW.wing });
  // Spars on the section face: front spar at 15 percent chord, rear spar at 65 percent.
  const st = nz[0], ch = st.te - st.le;
  for (const u of [0.15, 0.65]) {
    const x = st.le + u * ch, hh = 0.5 * st.t * ch * (u < 0.3 ? 0.95 : 0.7);
    k.box(x - 0.07, st.y - hh, st.s - 0.02, x + 0.07, st.y + hh, st.s + 0.01, MW.spar);
  }
  k.box(st.le + 0.15 * ch, st.y + 0.5 * st.t * ch * 0.82, st.s - 0.02, st.le + 0.65 * ch, st.y + 0.5 * st.t * ch * 0.92, st.s + 0.01, MW.spar);
  k.box(st.le + 0.15 * ch, st.y - 0.5 * st.t * ch * 0.92, st.s - 0.02, st.le + 0.65 * ch, st.y - 0.5 * st.t * ch * 0.8, st.s + 0.01, MW.spar);
  // Walkway markings and flap track fairings on the near wing's upper and lower surfaces.
  for (const zc of [8.5, 15, 25]) {
    const w = wingAt(zc), ch2 = w.te - w.le;
    k.boxR(w.te - 0.2, w.y - w.t * ch2 * 0.2, ZC - zc, 2.2, 0.35, 0.32, MW.wingDark, {});
  }
  void rings;
  k.whole = prev;
}

// ------------------------------------------------------------------ tail
export function buildTail(k) {
  // Fin: leading edge root about x 54 at the crown, tip between x 66.5 and 70.6 at y 17.3 [S1, derived].
  const finSt = [
    { s: 6.6, le: 52.6, te: 67.6, t: 0.1 },
    { s: 7.15, le: 54.0, te: 67.9, t: 0.1 },
    { s: 12.0, le: 60.0, te: 69.2, t: 0.095 },
    { s: 17.3, le: 66.5, te: 70.6, t: 0.09 },
  ];
  const fin = finSt.map((st) => {
    const ch = st.te - st.le;
    return airfoilRing(st.le, ch, st.t).map(([x, v]) => [x, st.s, ZC + v]);
  });
  skin(k, fin, mat({ c: '#f2ede2', c2: '#e2dccf', cut: '#2a2f3a' }), { capA: M.white, capB: M.white });
  // The Pan Am blue globe on the fin [S26], on the side facing us.
  globe(k, 63.4, 11.6, ZC - finHalf(63.4, 11.6) - 0.02, 1.7);
  // Tailplanes: root at the body side about y 5.5, tips at y 7.3 [S1, derived].
  const tp = (side) => [2.0, 5.5, 8.5, 11.08].map((zc) => {
    const u = (zc - 2.0) / 9.08;
    return { s: ZC + side * zc, le: lerp(59.8, 67.4, u), te: lerp(66.6, 70.7, u), y: lerp(5.6, 7.3, u), t: lerp(0.1, 0.085, u) };
  });
  wingSolid(k, tp(1), mat({ c: '#e8e4da', c2: '#d4d0c6', cut: '#2a2f3a' }), { place: (x, y, z) => [x, y, z] });
  const prev = k.whole; k.whole = true;
  wingSolid(k, tp(-1).filter((st) => st.s < -0.4), MW.white, { place: (x, y, z) => [x, y, z] });
  k.whole = prev;
}
function airfoilRing(le, ch, t) {
  const yt = (u) => 5 * t * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
  const pts = [];
  const n = 9;
  for (let i = 0; i <= n; i++) { const u = (1 - Math.cos((i / n) * Math.PI)) / 2; pts.push([le + u * ch, (yt(u) + 0.004) * ch]); }
  for (let i = n - 1; i >= 1; i--) { const u = (1 - Math.cos((i / n) * Math.PI)) / 2; pts.push([le + u * ch, -(yt(u) + 0.004) * ch]); }
  return pts;
}
function finHalf(x, y) {
  const u = (y - 7.15) / (17.3 - 7.15), le = lerp(54, 66.5, u), te = lerp(67.9, 70.6, u), ch = te - le, t = 0.095;
  const uu = Math.max(0.01, Math.min(1, (x - le) / ch));
  return 5 * t * (0.2969 * Math.sqrt(uu) - 0.126 * uu - 0.3516 * uu * uu + 0.2843 * uu ** 3 - 0.1036 * uu ** 4) * ch;
}
function globe(k, x, y, z, r) {
  k.cyl(x, y, z, r, 0.03, mat({ c: '#3b6fb6', c2: '#2f5e9e' }), { axis: 'z', seg: 32 });
  const w = mat({ c: '#f6f4ee' });
  const zz = z - 0.025;
  const arc = (rx, ry, a0, a1) => { const pts = []; for (let i = 0; i <= 16; i++) { const a = a0 + ((a1 - a0) * i) / 16; pts.push([x + Math.cos(a) * rx, y + Math.sin(a) * ry, zz]); } k.tube(pts, 0.045, w, { seg: 4 }); };
  arc(r * 0.98, r * 0.98, 0, Math.PI * 2);
  arc(r * 0.5, r * 0.97, -Math.PI / 2, Math.PI / 2);
  arc(r * 0.5, r * 0.97, Math.PI / 2, Math.PI * 1.5);
  arc(0.02, r * 0.97, -Math.PI / 2, Math.PI / 2);
  for (const f of [-0.45, 0, 0.45]) { const yy = y + f * r, hw = Math.sqrt(r * r - (f * r) ** 2) * 0.97; k.tube([[x - hw, yy, zz], [x + hw, yy, zz]], 0.045, w, { seg: 4 }); }
}

// ------------------------------------------------------------------ engines
// Pratt and Whitney JT9D [S8-S11]: fan 2.34 m across with 46 titanium blades and a part-span
// shroud; 3-stage LP compressor, 11-stage HP compressor, annular combustor, 2-stage HP turbine,
// 4-stage LP turbine. Nacelles in side view: inner x 23.5 to 29.0, y -0.8 to 1.9; outer x 32.0
// to 37.4, y 0.0 to 2.7 [S1, derived].
export const ENGINES = [
  { id: 1, x0: 32.0, cy: 1.35, zc: -21.3 },
  { id: 2, x0: 23.5, cy: 0.55, zc: -12.1 },
  { id: 3, x0: 23.5, cy: 0.55, zc: 12.1 },
  { id: 4, x0: 32.0, cy: 1.35, zc: 21.3 },
];
const FAN_COWL = [[0.0, 1.22], [0.12, 1.33], [0.55, 1.37], [1.6, 1.36], [2.6, 1.28], [3.15, 1.2], [3.15, 1.15], [2.3, 1.18], [1.25, 1.19], [0.35, 1.17], [0.08, 1.19]];
const CORE_COWL = [[2.55, 0.96], [3.2, 1.0], [4.3, 0.88], [5.05, 0.66], [5.05, 0.6], [4.3, 0.8], [3.2, 0.92], [2.6, 0.9]];

export function buildEngines(k, P) {
  for (const E of ENGINES) {
    const cz = ZC + E.zc, near = E.zc < 0, cut = E.id === 2;
    const prev = k.whole;
    if (near) k.whole = true;
    const cowl = near ? MW.cowl : mat({ c: '#c6c8ca', c2: '#b2b4b8', pat: 'plates', s: 0.7, cut: '#3a3e44' });
    const inner = near ? MW.cowlIn : mat({ c: '#8e9298', cut: '#3a3e44' });
    const mf = (i) => (i <= 5 ? (i === 0 ? (near ? MW.lip : M.white) : cowl) : inner);
    if (cut) {
      // Engine No. 2 opened: the cowls on our side are taken away down the engine's axis.
      revolveX(k, FAN_COWL, E.x0, E.cy, cz, cowl, { a0: 0, a1: Math.PI, seg: 18, matFn: mf, capMat: MW.cutFace });
      revolveX(k, CORE_COWL, E.x0, E.cy, cz, cowl, { a0: 0, a1: Math.PI, seg: 14, matFn: (i) => (i < 3 ? cowl : MW.hot), capMat: MW.cutFace });
      // Static parts of the core seen through the opening: combustor ring and casing.
      revolveX(k, [[3.45, 0.42], [3.95, 0.42], [3.95, 0.66], [3.45, 0.66]], E.x0, E.cy, cz, MW.flame, { seg: 16, a0: 0, a1: Math.PI, capMat: MW.hot });
      revolveX(k, [[1.75, 0.0], [1.75, 0.18], [5.0, 0.18], [5.0, 0.0]], E.x0, E.cy, cz, MW.core, { seg: 10 });
      // Exhaust cone.
      revolveX(k, [[4.8, 0.0], [4.8, 0.52], [5.2, 0.45], [5.75, 0.0]], E.x0, E.cy, cz, MW.exhaust, { seg: 14 });
      k.lamp(E.x0 + 3.7, E.cy, cz - 0.3, { always: true, color: '#ff8a3a', r: 1.6, i: 0.8, flicker: true, bulb: false, halo: 0.5 });
    } else {
      revolveX(k, FAN_COWL, E.x0, E.cy, cz, cowl, { seg: near ? 22 : 14, matFn: mf });
      revolveX(k, [[2.55, 0.0], [2.55, 0.96], [3.2, 1.0], [4.3, 0.88], [5.05, 0.66], [5.05, 0.0]], E.x0, E.cy, cz, cowl, { seg: near ? 18 : 12 });
      revolveX(k, [[5.0, 0.0], [5.0, 0.5], [5.35, 0.44], [5.8, 0.0]], E.x0, E.cy, cz, near ? MW.exhaust : mat('#4a4440'), { seg: 12 });
      // Behind the fan: the engine core face.
      revolveX(k, [[1.7, 0.0], [1.7, 1.18], [1.8, 1.18], [1.8, 0.0]], E.x0, E.cy, cz, near ? MW.cowlIn : inner, { seg: 14 });
    }
    // Pylon (strut) up to the wing's lower surface.
    const w = wingAt(E.zc);
    const top = E.cy + 1.3, wl = w.y - w.t * (w.te - w.le) * 0.42;
    const prof = [[E.x0 + 1.4, top - 0.1], [w.le + 0.4, wl + 0.25], [w.le + 3.6, wl + 0.2], [E.x0 + 5.2, E.cy + 0.6], [E.x0 + 4.0, top - 0.05]];
    k.extrude(prof, cz - 0.2, cz + 0.2, near ? MW.pylon : mat({ c: '#c0c3c7', cut: '#3a3e44' }));
    k.whole = prev;
    // Rotating parts: the fan (and, on No. 2, the LP and HP spools).
    P.fans.push(fanPart(k, E, cz, near));
    if (cut) P.hp = hpPart(k, E, cz);
  }
}

function fanPart(k, E, cz, near) {
  return k.part(E.x0 + 1.25, E.cy, cz, (q) => {
    q.whole = near;
    const bm = near ? MW.blade : mat({ c: '#b8bcc2' });
    const n = 46; // [S11]
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rm = 0.72;
      q.boxR(0, Math.cos(a) * rm, Math.sin(a) * rm, 0.12, 0.84, 0.13, bm, { x: a, y: 0.55 });
    }
    // Part-span shroud ring (the blades' midspan snubbers form a stiffening ring) [S11].
    const sr = [];
    for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2; sr.push([0.0, Math.cos(a) * 0.82, Math.sin(a) * 0.82]); }
    q.tube(sr, 0.025, bm, { seg: 4 });
    // Spinner, painted with a spiral so the turning shows.
    revolveX(q, [[-0.55, 0.0], [-0.35, 0.18], [-0.05, 0.31], [0.1, 0.32], [0.1, 0.0]], 0, 0, 0, near ? MW.spinner : mat('#dcdcda'), { seg: 14, matFn: (i, s) => (s % 7 === 0 ? (near ? MW.exhaust : mat('#4a4440')) : (near ? MW.spinner : mat('#dcdcda'))) });
    if (E.id === 2) {
      // LP spool: 3-stage LP compressor behind the fan, shaft, 4-stage LP turbine at the back.
      for (let s = 0; s < 3; s++) {
        revolveX(q, [[0.3 + s * 0.16, 0.0], [0.3 + s * 0.16, 0.74 - s * 0.04], [0.37 + s * 0.16, 0.74 - s * 0.04], [0.37 + s * 0.16, 0.0]], 0, 0, 0, MW.blade, { seg: 16, a0: 0, a1: Math.PI });
      }
      for (let s = 0; s < 4; s++) {
        const x = 2.92 + s * 0.15;
        revolveX(q, [[x, 0.0], [x, 0.56 + s * 0.05], [x + 0.08, 0.56 + s * 0.05], [x + 0.08, 0.0]], 0, 0, 0, MW.hot, { seg: 16, a0: 0, a1: Math.PI });
      }
    }
  });
}
function hpPart(k, E, cz) {
  // HP spool: 11-stage HP compressor and 2-stage HP turbine [S8].
  return k.part(E.x0, E.cy, cz, (q) => {
    q.whole = true;
    for (let s = 0; s < 11; s++) {
      const x = 2.05 + s * 0.12, r = 0.62 - s * 0.018;
      revolveX(q, [[x, 0.19], [x, r], [x + 0.07, r], [x + 0.07, 0.19]], 0, 0, 0, s % 2 ? MW.core : MW.blade, { seg: 16, a0: 0, a1: Math.PI });
    }
    for (let s = 0; s < 2; s++) {
      const x = 4.0 + s * 0.12;
      revolveX(q, [[x, 0.19], [x, 0.58], [x + 0.07, 0.58], [x + 0.07, 0.19]], 0, 0, 0, MW.hot, { seg: 16, a0: 0, a1: Math.PI });
    }
  });
}

// ------------------------------------------------------------------ position lights [S31, S32]
export function buildLights(k, P) {
  const tipN = wingAt(29.8), tipF = tipN;
  const prev = k.whole; k.whole = true;
  k.lamp(tipN.le + 1.6, tipN.y, ZC - 29.95, { always: true, color: '#ff3a2a', r: 2.5, i: 0.9, halo: 1.1, bulbR: 0.12 });
  k.whole = prev;
  k.lamp(tipF.le + 1.6, tipF.y, ZC + 29.95, { always: true, color: '#3aff7a', r: 2.5, i: 0.9, halo: 1.1, bulbR: 0.12 });
  k.lamp(68.75, 5.3, ZC, { always: true, color: '#fffaf0', r: 2.0, i: 0.8, halo: 0.9, bulbR: 0.1 });
  // Anti-collision beacons: top of the fuselage and the belly (positions illustrative); flashed by halos().
  P.beacons = [[30.2, 7.32, ZC], [30.2, -0.42, ZC]];
  for (const b of P.beacons) k.cyl(b[0], b[1] - 0.06, b[2], 0.09, 0.14, mat({ c: '#c83a2a', c2: '#ff5a3a', glow: 'night' }), { seg: 10 });
}

export { quadW, rad };
