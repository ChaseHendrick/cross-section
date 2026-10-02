/* Warship scene: masts, tops, yards, sails, standing rigging and flags.
 *
 * Masts, yards, sails and stays are drawn whole (they ignore the cutaway); shrouds and
 * ratlines are drawn on the starboard side only, as the larboard rigging is cut away
 * with the larboard half of the hull. Yards are braced round about 34 degrees so each
 * square sail reads as a foreshortened trapezoid (picture-book convention, dossier sec. 3).
 */
import { THREE, mat } from '../../engine/index.js';
import { MAST } from './geom.js';
import { CHANNEL, CH_Y, chainZ } from './hull.js';

const W = (spec) => mat(Object.assign({ whole: true }, typeof spec === 'string' ? { c: spec } : spec));
const SPAR = W({ c: '#c49c64', c2: '#a8844e', pat: 'grain', cut: '#c49c64' });
const SPAR_DARK = W({ c: '#3a302a', cut: '#3a302a' });
const HOOP = W({ c: '#e0b83a', cut: '#e0b83a' });
const TOP = W({ c: '#6a4a2e', c2: '#4a3220', pat: 'planks', s: 0.25, cut: '#a07848' });
const TAR = W({ c: '#2a2420', noEdge: true });
const RUN = W({ c: '#a88a5a', noEdge: true });
const CANVAS = W({ c: '#efe6cc', c2: '#d8caa6', pat: 'canvas', s: 0.95, thin: true, cut: '#d8caa6' });
const FURL = W({ c: '#e4d8b6', c2: '#cdbf98', pat: 'canvas', s: 0.4, cut: '#cdbf98' });

// A tapered cylinder between two points (any direction).
export function cylBetween(k, a, b, r0, r1, m, seg = 10) {
  const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b);
  const d = new THREE.Vector3().subVectors(Bv, A);
  const L = d.length();
  if (L < 1e-4) return;
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, false);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  const M4 = new THREE.Matrix4().compose(A.clone().add(d.clone().multiplyScalar(0.5)), q, new THREE.Vector3(1, 1, 1));
  k.geo(g, M4, m, { smooth: true });
}

// The plan of the rig (layout estimate; main truck 70.1 m above the keel [S1]).
export const BRACE = 0.32;
const dir = (th) => [-Math.sin(th), 0, Math.cos(th)];
const fwd = (th) => [-Math.cos(th), 0, -Math.sin(th)];
export const RIG = {
  fore: { x: MAST.fore, foot: 2.25, top: 33.0, head: 35.6, tm: [31.2, 52.6], xt: 50.8, tg: [49.8, 64.0],
    yards: [{ y: 31.0, L: 27.5, sail: 'course', foot: 19.8, fw: 28 }, { y: 47.5, L: 17.5, sail: 'top' }, { y: 56.6, L: 11.6, sail: 'tg' }, { y: 61.6, L: 7.6, sail: 'royal' }] },
  main: { x: MAST.main, foot: 2.25, top: 35.2, head: 37.9, tm: [33.4, 57.0], xt: 55.0, tg: [54.0, 70.1],
    yards: [{ y: 33.0, L: 31.0, sail: 'course', foot: 20.6, fw: 32 }, { y: 51.0, L: 20.0, sail: 'top' }, { y: 61.4, L: 13.0, sail: 'tg' }, { y: 66.8, L: 8.6, sail: 'royal' }] },
  mizzen: { x: MAST.mizzen, foot: 8.4, top: 27.4, head: 29.8, tm: [25.8, 44.4], xt: 42.8, tg: [42.0, 52.0],
    yards: [{ y: 26.4, L: 19.0, sail: null }, { y: 38.6, L: 13.0, sail: 'top' }, { y: 46.0, L: 8.6, sail: 'tg' }] },
};

function sail(k, c, th, yH, wH, yF, wF, belly, xOff = 0) {
  const d = dir(th), n = fwd(th);
  const nu = 8, nv = 5;
  const P = (u, v) => {
    const w = wH + (wF - wH) * v;
    const y = yH + (yF - yH) * v + Math.sin(Math.PI * u) * v * v * 0.6; // a little roach at the foot
    const s = (u - 0.5) * w;
    const b = belly * Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(1, v * 0.85 + 0.15));
    return [c + xOff + d[0] * s + n[0] * b, y, d[2] * s + n[2] * b];
  };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = P(i / nu, j / nv), b = P((i + 1) / nu, j / nv), cc = P((i + 1) / nu, (j + 1) / nv), dd = P(i / nu, (j + 1) / nv);
    k.quad(a, b, cc, dd, CANVAS);
  }
}

export function buildRig(k) {
  const aloft = [];
  for (const [name, R] of Object.entries(RIG)) {
    const x = R.x;
    // Lower mast with yellow iron hoops [S8], black masthead.
    cylBetween(k, [x, R.foot, 0], [x, R.head, 0], name === 'mizzen' ? 0.4 : 0.52, name === 'mizzen' ? 0.3 : 0.4, SPAR, 12);
    for (let y = 15.5; y < R.top - 1; y += 1.25) cylBetween(k, [x, y, 0], [x, y + 0.09, 0], (name === 'mizzen' ? 0.4 : 0.52) + 0.03, (name === 'mizzen' ? 0.4 : 0.52) + 0.03, HOOP, 12);
    cylBetween(k, [x, R.top, 0], [x, R.head, 0], 0.44, 0.42, SPAR_DARK, 10);
    // The top: a platform that spreads the topmast shrouds; marines and lookouts stood here.
    const tw = name === 'mizzen' ? 2.0 : 2.8;
    k.box(x - 1.6, R.top - 0.12, -tw, x + 1.9, R.top + 0.12, tw, TOP);
    k.box(x + 1.75, R.top + 0.12, -tw, x + 1.9, R.top + 0.85, tw, TOP); // after rail
    for (const z of [-tw + 0.1, tw - 0.1]) for (let xx = x - 1.4; xx < x + 1.8; xx += 0.9) cylBetween(k, [xx, R.top - 2.6, z * 0.25], [xx, R.top - 0.1, z], 0.025, 0.025, TAR, 4); // futtocks
    // Cap and topmast (forward of the lower masthead), crosstrees, topgallant mast.
    const tx = x - 0.85;
    k.box(x - 1.3, R.head - 0.05, -0.45, x + 0.5, R.head + 0.35, 0.45, SPAR_DARK);
    cylBetween(k, [tx, R.tm[0], 0], [tx, R.tm[1], 0], 0.32, 0.22, SPAR, 10);
    k.box(tx - 0.9, R.xt - 0.08, -1.7, tx + 1.0, R.xt + 0.12, 1.7, TOP);
    cylBetween(k, [tx - 0.05, R.tg[0], 0], [tx - 0.05, R.tg[1], 0], 0.17, 0.07, SPAR, 8);
    k.sphere(tx - 0.05, R.tg[1] + 0.1, 0, 0.2, SPAR_DARK, { seg: 8, rings: 5 }); // truck

    // Yards and sails.
    const ys = R.yards;
    for (let i = 0; i < ys.length; i++) {
      const Yd = ys[i];
      const mx = i === 0 ? x : tx;
      const d = dir(BRACE);
      const a = [mx - 0.55 - d[0] * Yd.L / 2, Yd.y, -d[2] * Yd.L / 2], b = [mx - 0.55 + d[0] * Yd.L / 2, Yd.y, d[2] * Yd.L / 2];
      const c = [mx - 0.55, Yd.y, 0];
      const r = Yd.L * 0.012;
      cylBetween(k, a, c, r * 0.45, r, SPAR, 8);
      cylBetween(k, c, b, r, r * 0.45, SPAR, 8);
      // Footrope under the yard.
      const fp = [];
      for (let j = 0; j <= 10; j++) { const t = j / 10; fp.push([a[0] + (b[0] - a[0]) * t, Yd.y - 0.9 - Math.sin(Math.PI * t) * 0.25, a[2] + (b[2] - a[2]) * t]); }
      k.tube(fp, 0.025, RUN, { seg: 3 });
      if (!Yd.sail) continue;
      if (Yd.sail === 'course') {
        // The courses are furled on their yards today (an illustrative choice): a bundle of
        // canvas lashed along the top of the yard, with gaskets.
        const fa = [a[0] * 0.92 + c[0] * 0.08, Yd.y + 0.28, a[2] * 0.92], fb = [b[0] * 0.92 + c[0] * 0.08, Yd.y + 0.28, b[2] * 0.92];
        cylBetween(k, fa, [c[0], Yd.y + 0.3, 0], 0.14, 0.3, FURL, 8);
        cylBetween(k, [c[0], Yd.y + 0.3, 0], fb, 0.3, 0.14, FURL, 8);
        for (let g = -6; g <= 6; g++) { if (!g) continue; const u = g / 7; const p = [c[0] + d[0] * u * Yd.L * 0.46, Yd.y + 0.3, d[2] * u * Yd.L * 0.46]; cylBetween(k, [p[0] - 0.02, p[1] - 0.05, p[2] - 0.02], [p[0] + 0.02, p[1] + 0.05, p[2] + 0.02], 0.32 * (1 - Math.abs(u) * 0.5), 0.32 * (1 - Math.abs(u) * 0.5), RUN, 8); }
      } else {
        const below = ys[i - 1];
        sail(k, mx - 0.55, BRACE, Yd.y + 0.25, Yd.L * 0.92, below.y + 0.55, below.L * (Yd.sail === 'top' ? 0.9 : 0.86), Yd.sail === 'top' ? 2.0 : 1.2, 0);
      }
      // People's places along the starboard yardarm (for topmen).
      for (const u of [0.45, 0.6, 0.75]) aloft.push({ mast: name, yard: i, x: c[0] + d[0] * u * Yd.L / 2 + 0.75, y: Yd.y - 0.88, z: d[2] * u * Yd.L / 2 + 0.25 });
    }

    // Shrouds and ratlines (starboard side), from the channels to the top.
    const [c0, c1] = CHANNEL[name];
    const nS = name === 'mizzen' ? 6 : 8;
    const low = [], high = [];
    for (let i = 0; i < nS; i++) {
      const cx = c0 + 0.4 + ((c1 - c0 - 0.8) * i) / (nS - 1);
      low.push([cx, CH_Y + 1.25, chainZ(cx) + 0.05]);
      high.push([x - 0.6 + (i / (nS - 1)) * 1.6, R.top - 0.3, tw - 0.35]);
    }
    const dead = W({ c: '#1e1a16' });
    for (let i = 0; i < nS; i++) {
      cylBetween(k, low[i], high[i], 0.045, 0.04, TAR, 4);
      cylBetween(k, [low[i][0], CH_Y + 0.05, low[i][2]], low[i], 0.035, 0.035, TAR, 4); // lanyards
      k.cyl(low[i][0], low[i][1] - 0.15, low[i][2], 0.16, 0.3, dead, { seg: 8 }); // deadeyes
    }
    for (let t = 0.04; t < 0.96; t += 0.022) {
      const row = low.map((p, i) => [p[0] + (high[i][0] - p[0]) * t, p[1] + (high[i][1] - p[1]) * t, p[2] + (high[i][2] - p[2]) * t]);
      k.tube(row, 0.014, TAR, { seg: 3 });
    }
    // Topmast shrouds from the top's edge to the crosstrees.
    const tl = [], th = [];
    for (let i = 0; i < 4; i++) { tl.push([x - 1.2 + i * 0.85, R.top + 0.15, tw - 0.15]); th.push([tx - 0.5 + i * 0.3, R.xt - 0.2, 1.4]); }
    for (let i = 0; i < 4; i++) cylBetween(k, tl[i], th[i], 0.03, 0.025, TAR, 4);
    for (let t = 0.05; t < 0.95; t += 0.045) k.tube(tl.map((p, i) => [p[0] + (th[i][0] - p[0]) * t, p[1] + (th[i][1] - p[1]) * t, p[2] + (th[i][2] - p[2]) * t]), 0.011, TAR, { seg: 3 });
    // Backstays to the channels, topgallant shrouds.
    for (const off of [1.0, 1.9]) cylBetween(k, [tx, R.tm[1] - 1.0, 0.4], [c1 + off, CH_Y + 0.6, chainZ(c1) + 0.3], 0.035, 0.035, TAR, 4);
    cylBetween(k, [tx, R.tg[1] - 3, 0.2], [tx + 0.4, R.xt, 1.55], 0.02, 0.02, TAR, 3);
    aloft.push({ mast: name, top: true, x: x + 0.3, y: R.top + 0.12, z: 1.6 }, { mast: name, top: true, x: x - 0.9, y: R.top + 0.12, z: 2.1 }, { mast: name, xt: true, x: tx + 0.3, y: R.xt + 0.12, z: 0.9 });
  }

  // Bowsprit and jib-boom (about 30 degrees of steeve), spritsail yard.
  const bs0 = [4.2, 14.6, 0], bs1 = [-10.3, 22.6, 0];
  cylBetween(k, bs0, bs1, 0.55, 0.32, SPAR, 12);
  for (const t of [0.35, 0.55]) { const p = [bs0[0] + (bs1[0] - bs0[0]) * t, bs0[1] + (bs1[1] - bs0[1]) * t, 0]; cylBetween(k, [p[0] + 0.05, p[1] - 0.03, 0], [p[0] - 0.08, p[1] + 0.05, 0], 0.48, 0.48, SPAR_DARK, 10); }
  const jb0 = [-7.2, 21.0, 0], jb1 = [-24.0, 30.4, 0];
  cylBetween(k, jb0, jb1, 0.24, 0.1, SPAR, 8);
  k.box(-10.7, 22.2, -0.4, -9.9, 23.0, 0.4, SPAR_DARK);
  cylBetween(k, [-7.6, 20.4, -8.5], [-7.6, 20.4, 8.5], 0.12, 0.12, SPAR, 6);
  cylBetween(k, [-8.4, 22.0, 0], [-8.0, 17.0, 0], 0.08, 0.08, SPAR_DARK, 5); // dolphin striker
  // Stays and jibs.
  const F = RIG.fore, Mn = RIG.main, Mz = RIG.mizzen;
  const stays = [
    [[F.x - 0.3, F.top + 0.5, 0], [-2.0, 17.1, 0], 0.07],
    [[F.x - 0.9, F.tm[1] - 1.2, 0], [-10.0, 22.6, 0], 0.05],
    [[F.x - 0.9, F.tm[1] - 0.6, 0], [-17.5, 26.6, 0], 0.04],
    [[F.x - 0.9, F.tg[1] - 2.0, 0], [-23.6, 30.2, 0], 0.03],
    [[Mn.x - 0.3, Mn.top + 0.5, 0], [F.x + 0.5, 16.0, 0], 0.07],
    [[Mn.x - 0.9, Mn.tm[1] - 1.0, 0], [F.x + 0.2, F.top + 0.3, 0], 0.05],
    [[Mn.x - 0.9, Mn.tg[1] - 2.5, 0], [F.x - 0.9, F.xt, 0], 0.03],
    [[Mz.x - 0.3, Mz.top + 0.5, 0], [Mn.x + 0.4, 16.0, 0], 0.05],
    [[Mz.x - 0.9, Mz.tm[1] - 1.0, 0], [Mn.x, Mn.top + 0.4, 0], 0.04],
  ];
  for (const [a, b, r] of stays) k.rope(a, b, r, TAR, 0.006, 8);
  const jib = (a, b, f0, f1, clew, belly) => {
    const p0 = [a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0, 0];
    const p1 = [a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1, 0];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n;
      const L = (t) => [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, Math.sin(Math.PI * t) * belly * 0.4];
      const C = (t) => [clew[0] + (p1[0] - clew[0]) * t, clew[1] + (p1[1] - clew[1]) * t, Math.sin(Math.PI * t) * belly];
      k.quad(L(t0), C(t0), C(t1), L(t1), CANVAS);
    }
  };
  // Fore topmast staysail, jib and flying jib (tacks at the bowsprit and jib-boom).
  jib(stays[1][1], stays[1][0], 0.02, 0.62, [-0.6, 24.2, 0], 1.0);
  jib(stays[2][1], stays[2][0], 0.02, 0.58, [-5.5, 27.6, 0], 1.0);
  jib(stays[3][1], stays[3][0], 0.02, 0.5, [-11.5, 31.4, 0], 0.8);
  // Main topmast staysail between the masts.
  jib([F.x + 1.8, F.top + 1.5, 0], stays[5][0], 0.02, 0.62, [F.x + 12.0, F.top + 3.5, 0], 1.0);

  // Mizzen gaff, driver boom over the stern, and the driver.
  const g0 = [Mz.x + 0.5, 30.4, 0], g1 = [57.6, 35.8, 0];
  cylBetween(k, g0, g1, 0.2, 0.12, SPAR, 8);
  const b0 = [Mz.x + 0.5, 17.9, 0], b1 = [66.0, 19.6, 0];
  cylBetween(k, b0, b1, 0.24, 0.14, SPAR, 8);
  const nd = 7;
  for (let i = 0; i < nd; i++) {
    const t0 = i / nd, t1 = (i + 1) / nd;
    const top = (t) => [g0[0] + (g1[0] - g0[0]) * t, g0[1] + (g1[1] - g0[1]) * t - 0.2, Math.sin(Math.PI * t) * 0.6];
    const bot = (t) => [b0[0] + (b1[0] - b0[0]) * t * 0.97, b0[1] + (b1[1] - b0[1]) * t + 0.4, Math.sin(Math.PI * t) * 0.8];
    k.quad(bot(t0), bot(t1), top(t1), top(t0), CANVAS);
  }
  cylBetween(k, [Mz.x + 0.6, 30.2, 0], [Mz.x + 0.6, 18.4, 0], 0.03, 0.03, RUN, 3);
  // A few braces and sheets (running rigging, natural hemp).
  const run = [
    [[F.x - 0.55 + (-Math.sin(BRACE)) * 13.7, 31.0, Math.cos(BRACE) * 13.7], [Mn.x - 3, 16.4, 6.6]],
    [[Mn.x - 0.55 + (-Math.sin(BRACE)) * 15.5, 33.0, Math.cos(BRACE) * 15.5], [Mz.x - 2, 16.4, 6.4]],
    [[Mn.x - 1.4 + (-Math.sin(BRACE)) * 10, 51.0, Math.cos(BRACE) * 10], [Mz.x - 0.9, Mz.top + 1, 1.0]],
    [[F.x - 1.4 + (-Math.sin(BRACE)) * 8.75, 47.5, Math.cos(BRACE) * 8.75], [Mn.x - 0.9, Mn.top + 1.5, 1.0]],
    [[F.x - 0.55 - Math.sin(BRACE) * 14, 19.9, Math.cos(BRACE) * 14], [F.x + 4.0, 16.4, 6.4]],
    [[Mn.x - 0.55 - Math.sin(BRACE) * 16, 20.7, Math.cos(BRACE) * 16], [Mn.x + 4.0, 16.4, 6.2]],
  ];
  for (const [a, b] of run) k.rope(a, b, 0.025, RUN, 0.01, 8);
  return aloft;
}

// The masthead pennant: a long streamer that flies from the main truck, built as
// segments so it can wave.
export function buildPennant(k) {
  const R = RIG.main;
  const segs = [];
  const root = k.part(R.x - 0.9, R.tg[1] - 0.6, 0, (q) => { q.cyl(0, 0, 0, 0.02, 0.02, W('#2a2420'), { seg: 3 }); });
  let prev = null;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const L = 2.2, w0 = 0.42 * (1 - i / n) + 0.06, w1 = 0.42 * (1 - (i + 1) / n) + 0.06;
    const g = k.part(0, 0, 0, (q) => {
      const m = W({ c: i === 0 ? '#c8302a' : '#f2ece0', thin: true, noEdge: i > 0 });
      q.quad([0, 0, 0], [0, -w0, 0], [-L, -w1 * 0.9, 0], [-L, 0, 0], m);
      if (i === 0) q.quad([0, -w0 * 0.33, 0.001], [0, -w0 * 0.66, 0.001], [-L, -w1 * 0.6, 0.001], [-L, -w1 * 0.3, 0.001], W({ c: '#f2ece0', thin: true }));
    });
    if (prev) { prev.add(g); g.position.set(-L, 0, 0); } else { root.add(g); }
    segs.push(g);
    prev = g;
  }
  return segs;
}
