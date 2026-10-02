/* Big Pit: everything that moves. The winding engine, reels, sheaves, ropes and cages;
 * drams on the endless rope and at the bank; the horses; the fan, pumps, tippler, screens,
 * smithy bellows, line shafting and saw; doors; smoke, steam, dust and water.
 */
import { mat, THREE } from '../../engine/index.js';
import { MAT, PB, BANK, SHEAVE, CAGE, SHAFT, shade } from './common.js';
import { dramBody, waggon } from './surface.js';
import { wheels, STALLS } from './under.js';

const P = (c, extra) => mat(Object.assign({ c }, extra || {}));
const TAU = Math.PI * 2;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Winding timing [illustrative]: a wind of 95 m (bank deck to pit bottom) in about 40 s.
export const WIND = { L: BANK - PB, T: 40, wait: 26, r0: 1.0, r1: 2.45, axX: 176, axY: 3.0 };
const CYC = WIND.T * 2 + WIND.wait * 2;
// Position of cage A as a fraction of the wind (0 at the bank, 1 at the bottom) at time t.
export function windAt(t) {
  const c = ((t % CYC) + CYC) % CYC;
  if (c < WIND.wait) return { s: 0, moving: false, arrive: 'top', phase: c };
  if (c < WIND.wait + WIND.T) return { s: ease((c - WIND.wait) / WIND.T), moving: true, v: 1 };
  if (c < WIND.wait * 2 + WIND.T) return { s: 1, moving: false, arrive: 'bottom', phase: c - WIND.wait - WIND.T };
  return { s: 1 - ease((c - WIND.wait * 2 - WIND.T) / WIND.T), moving: true, v: -1 };
}
export const cageY = (i, s) => (i === 0 ? BANK - s * WIND.L : PB + s * WIND.L);

// A unit flat-rope segment: spans x 0..1 so a part can be stretched between two points.
function ropePart(k, w = 0.12, t = 0.05) {
  return k.part(0, 0, 0, (q) => { q.box(0, -t / 2, -w / 2, 1, t / 2, w / 2, MAT.rope); });
}
function stretch(g, a, b, z) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  g.position.set(a[0], a[1], z);
  g.rotation.z = Math.atan2(dy, dx);
  g.scale.x = Math.hypot(dx, dy);
}

// A dram as a moving part (with an optional coal load as a child that can be hidden).
export function dramPart(k, coal = true) {
  const g = k.part(0, 0, 0, (q) => { dramBody(q, 0, 0, 0, false); wheels(q, 0, 0, 0); });
  const c = k.part(0, 0, 0, (q) => { q.boulder(0, 0.97, 0, 0.8, 0.32, 0.45, MAT.coalHeap, 31); });
  g.add(c);
  c.visible = coal;
  g.userData.coal = c;
  return g;
}

// A horse, about 1.4 m at the withers, built facing +x, with four swinging legs and a head
// that nods. Coat colours: bay, brown, grey, black.
export function horsePart(k, coat = '#6a3e22', opts = {}) {
  const C = P(coat, { c2: shade(coat, -0.15), cut: shade(coat, -0.3) });
  const D = P(opts.mane || shade(coat, -0.45));
  const g = k.part(0, 0, 0, (q) => {
    q.cyl(-0.5, 1.02, 0, 0.33, 1.0, C, { axis: 'x', seg: 12 });
    q.sphere(0.52, 1.04, 0, 0.34, C, { seg: 12, rings: 7 });
    q.sphere(-0.52, 1.02, 0, 0.35, C, { seg: 12, rings: 7 });
    q.beam([0.62, 1.08, 0], [0.92, 1.55, 0], 0.26, C);
    q.beam([0.66, 1.3, 0], [0.88, 1.66, 0], 0.08, D); // mane
    q.beam([-0.82, 1.12, 0], [-0.98, 0.55, 0], 0.09, D); // tail
    if (opts.harness !== false) {
      q.beam([0.6, 1.0, -0.2], [0.82, 1.5, -0.2], 0.07, P('#2e2016'));
      q.beam([0.6, 1.0, 0.2], [0.82, 1.5, 0.2], 0.07, P('#2e2016'));
      q.box(-0.3, 1.32, -0.25, 0.2, 1.38, 0.25, P('#2e2016'));
    }
  });
  const head = k.part(0.9, 1.58, 0, (q) => {
    q.beam([0, 0, 0], [0.34, -0.3, 0], 0.2, C);
    q.box(0.22, -0.45, -0.08, 0.42, -0.25, 0.08, P(shade(coat, -0.1)));
    q.box(-0.02, 0.05, -0.08, 0.04, 0.16, -0.04, C);
    q.box(-0.02, 0.05, 0.04, 0.04, 0.16, 0.08, C);
    q.sphere(0.18, -0.12, -0.09, 0.025, P('#1a1410'), { seg: 5, rings: 3 });
    q.sphere(0.18, -0.12, 0.09, 0.025, P('#1a1410'), { seg: 5, rings: 3 });
  });
  g.add(head);
  const legs = [];
  if (opts.still) {
    const S = k.part(0, 0, 0, (q) => { for (const [lx, lz] of [[0.5, -0.17], [0.5, 0.17], [-0.5, -0.17], [-0.5, 0.17]]) { q.beam([lx, 1.0, lz], [lx, 0.45, lz], 0.13, C); q.beam([lx, 0.45, lz], [lx + 0.02, 0.07, lz], 0.09, C); q.box(lx - 0.06, 0, lz - 0.06, lx + 0.08, 0.08, lz + 0.06, P('#2a2420')); } });
    // merge the legs into the body group (a single extra mesh rather than four parts)
    for (const m of [...S.children]) g.add(m);
    S.removeFromParent && S.removeFromParent();
    k.parts.splice(k.parts.indexOf(S), 1);
    g.userData.legs = null; g.userData.head = head;
    return g;
  }
  for (const [lx, lz] of [[0.5, -0.17], [0.5, 0.17], [-0.5, -0.17], [-0.5, 0.17]]) {
    const L = k.part(lx, 0.95, lz, (q) => {
      q.beam([0, 0.05, 0], [0, -0.5, 0], 0.13, C);
      q.beam([0, -0.5, 0], [0.02, -0.88, 0], 0.09, C);
      q.box(-0.06, -0.95, -0.06, 0.08, -0.87, 0.06, P('#2a2420'));
    });
    g.add(L);
    legs.push(L);
  }
  g.userData.legs = legs;
  g.userData.head = head;
  return g;
}
// Animate a horse: walking (phase from distance) or standing (an occasional head nod).
export function animHorse(h, moving, dist, t, seed = 0) {
  const L = h.userData.legs;
  const ph = dist * 3.2;
  if (!L) { h.userData.head.rotation.z = -Math.max(0, Math.sin(t * 0.35 + seed * 2.1)) * 0.35 * (Math.sin(t * 0.13 + seed) > 0.3 ? 1 : 0); return; }
  const a = moving ? 0.38 : 0;
  L[0].rotation.z = Math.sin(ph) * a; L[3].rotation.z = Math.sin(ph) * a;
  L[1].rotation.z = -Math.sin(ph) * a; L[2].rotation.z = -Math.sin(ph) * a;
  const nod = moving ? Math.sin(ph * 2) * 0.06 : Math.max(0, Math.sin(t * 0.35 + seed * 2.1)) * 0.35 * (Math.sin(t * 0.13 + seed) > 0.3 ? 1 : 0);
  h.userData.head.rotation.z = -nod;
}

// ------------------------------------------------------------------ the winding engine
function winding(k, W) {
  const d = W.data;
  const sheaves = [];
  for (const [i, cx, z] of [[0, CAGE.ax + SHEAVE.r, 0.5], [1, CAGE.bx + SHEAVE.r, 1.4]]) {
    const g = k.part(cx, SHEAVE.y, z, (q) => {
      // cast-iron rim on wrought-iron spokes, flat-rope groove
      q.lathe([[SHEAVE.r - 0.12, -0.1], [SHEAVE.r, -0.1], [SHEAVE.r, 0.1], [SHEAVE.r - 0.12, 0.1]].map(([r, y]) => [r, y]), 0, 0, MAT.ironDark, { seg: 28, capTop: false, capBot: false });
      for (let s = 0; s < 8; s++) { const a = (s / 8) * TAU; q.beam([Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], [Math.cos(a) * (SHEAVE.r - 0.1), 0, Math.sin(a) * (SHEAVE.r - 0.1)], 0.07, MAT.ironDark); }
      q.cyl(0, -0.15, 0, 0.22, 0.3, MAT.iron, { seg: 12 });
    });
    g.rotation.x = Math.PI / 2; // stand the wheel up in the x-y plane
    sheaves.push({ g, i });
  }
  // Reels: two flat-rope bobbins on the engine shaft, with coils that grow and shrink.
  const reels = [], coils = [];
  for (const z of [0.5, 1.4]) {
    const g = k.part(WIND.axX, WIND.axY, z, (q) => {
      for (const dz of [-0.17, 0.17]) {
        // cheek plates as six arms and a light rim, so the coil shows between them
        const rim = [];
        for (let i = 0; i <= 30; i++) { const a = (i / 30) * TAU; rim.push([Math.cos(a) * (WIND.r1 + 0.18), Math.sin(a) * (WIND.r1 + 0.18), dz]); }
        q.tube(rim, 0.05, P('#3e5a46', { cut: '#2a3a2e' }), { seg: 5 });
        for (let s = 0; s < 6; s++) { const a = (s / 6) * TAU; q.beam([Math.cos(a) * 0.4, Math.sin(a) * 0.4, dz], [Math.cos(a) * (WIND.r1 + 0.15), Math.sin(a) * (WIND.r1 + 0.15), dz], 0.11, P('#3e5a46', { cut: '#2a3a2e' })); }
      }
      q.cyl(0, 0, -0.2, 0.45, 0.4, MAT.iron, { axis: 'z', seg: 14 });
    });
    reels.push(g);
    const c = k.part(WIND.axX, WIND.axY, z, (q) => {
      q.cyl(0, 0, -0.07, 1, 0.14, P('#2a2c30', { c2: '#4a4e54', pat: 'rings', s: 0.05 }), { axis: 'z', seg: 26 });
    });
    coils.push(c);
  }
  // Cranks, connecting rods and pistons (two cylinders, cranks at 90 degrees).
  const cr = 0.75, Lc = 4.5;
  const engines = [];
  for (const [z, off] of [[0.1, 0], [2.7, Math.PI / 2]]) {
    const crank = k.part(WIND.axX, WIND.axY, z, (q) => {
      q.cyl(0, 0, -0.08, 1.0, 0.16, P('#5a5e64'), { axis: 'z', seg: 20 });
      q.cyl(cr, 0, -0.18, 0.11, 0.36, MAT.brass, { axis: 'z', seg: 8 });
    });
    const rod = k.part(0, 0, z - 0.18, (q) => { q.box(0, -0.09, -0.06, 1, 0.09, 0.06, P('#9a9ea4')); });
    const piston = k.part(0, WIND.axY, z, (q) => {
      q.box(-0.2, -0.25, -0.25, 0.2, 0.25, 0.25, P('#8a8e94')); // crosshead
      q.cyl(0, 0, 0, 0.07, 6.0, P('#c8ccd0'), { axis: 'x', seg: 8 }); // piston rod
      q.cyl(5.85, 0, 0, 0.5, 0.3, P('#7a7e84'), { axis: 'x', seg: 18 }); // piston
    });
    engines.push({ crank, rod, piston, off, z });
  }
  // Ropes: sheave to reel (two), and down the shaft to each cage.
  const ropeHi = [ropePart(k), ropePart(k)];
  const ropeShaft = [0, 1].map(() => k.part(0, 0, 0, (q) => { q.box(-0.02, -1, -0.06, 0.02, 0, 0.06, MAT.rope); }));
  // Cages: iron frames with a cover overhead (required for men by Rule 27) and a dram inside.
  const cages = [0, 1].map((i) => {
    const g = k.part(i ? CAGE.bx : CAGE.ax, 0, 0, (q) => {
      const w = CAGE.w / 2, z0 = 0.28, z1 = 1.62, h = CAGE.h;
      q.box(-w, 0, z0, w, 0.12, z1, MAT.plate);
      for (const x of [-w, w - 0.08]) q.box(x, 0, z1 - 0.08, x + 0.08, h, z1, MAT.ironDark);
      for (const x of [-w, w - 0.08]) q.box(x, 0, z0, x + 0.08, h, z0 + 0.08, MAT.ironDark);
      q.box(-w, h, z0, w, h + 0.08, z1, P('#3a3e44', { pat: 'plates', s: 0.3 })); // cover
      q.box(-w, h - 0.06, z1 - 0.04, w, h, z1, MAT.ironDark);
      q.box(-w, 1.2, z1 - 0.04, w, 1.26, z1, MAT.ironDark);
      for (const x of [-0.5, 0.5]) q.beam([x, h + 0.08, 0.95], [0, h + 0.9, 0.95], 0.04, MAT.ironDark); // chains
      q.box(-0.08, h + 0.85, 0.87, 0.08, h + 1.15, 1.03, MAT.iron); // capel
      for (const dz of [0.65, 1.25]) q.box(-w, 0.12, dz - 0.03, w, 0.18, dz + 0.03, MAT.rail);
    });
    const dram = dramPart(k, true);
    g.add(dram);
    dram.position.set(0, 0.12, 0.95);
    return { g, dram };
  });
  d.wind = { s: 0, theta: 0 };
  d.cages = cages;
  W.addMachine((dt, t, w) => {
    const st = windAt(t);
    const s = st.s;
    w.data.wind.s = s; w.data.wind.st = st;
    const L = WIND.L;
    const rA = Math.sqrt(WIND.r0 ** 2 + (WIND.r1 ** 2 - WIND.r0 ** 2) * (1 - s));
    const rB = Math.sqrt(WIND.r0 ** 2 + (WIND.r1 ** 2 - WIND.r0 ** 2) * s);
    const theta = (s * L) / ((WIND.r0 + WIND.r1) / 2);
    w.data.wind.theta = theta;
    for (const g of reels) g.rotation.z = theta;
    coils[0].scale.set(rA, rA, 1); coils[1].scale.set(rB, rB, 1);
    coils[0].rotation.z = theta; coils[1].rotation.z = theta;
    sheaves[0].g.rotation.y = (s * L) / SHEAVE.r;
    sheaves[1].g.rotation.y = -(s * L) / SHEAVE.r;
    for (const e of engines) {
      const a = theta + e.off;
      e.crank.rotation.z = a;
      const px = WIND.axX + cr * Math.cos(a), py = WIND.axY + cr * Math.sin(a);
      const xc = WIND.axX + cr * Math.cos(a) + Math.sqrt(Lc * Lc - (cr * Math.sin(a)) ** 2);
      e.piston.position.x = xc;
      stretch(e.rod, [px, py], [xc, WIND.axY], e.z);
    }
    // ropes from the sheave tops to the reels (A over the top, B from underneath)
    stretch(ropeHi[0], [CAGE.ax + SHEAVE.r, SHEAVE.y + SHEAVE.r - 0.05], [WIND.axX, WIND.axY + rA], 0.5);
    stretch(ropeHi[1], [CAGE.bx + SHEAVE.r, SHEAVE.y + SHEAVE.r - 0.05], [WIND.axX, WIND.axY - rB], 1.4);
    for (let i = 0; i < 2; i++) {
      const y = cageY(i, s);
      cages[i].g.position.y = y;
      const top = y + CAGE.h + 1.15;
      ropeShaft[i].position.set(i ? CAGE.bx : CAGE.ax, SHEAVE.y, i ? 1.4 : 0.5);
      ropeShaft[i].scale.y = Math.max(0.1, SHEAVE.y - top);
    }
  });
  d.engineSpeed = () => { const st = windAt(W.time); return st.moving ? 1 : 0; };
}

// ------------------------------------------------------------------ drams at the bank and the bottom
function bankFlow(k, W) {
  // At the bank: each full dram leaves the cage, stops on the weighing machine, runs on to the
  // tippler and is turned over; the empty comes back on the other road.
  const full = dramPart(k, true), empty = dramPart(k, false);
  // The tippler: a cradle of two iron hoops that turns the dram over on to the screens.
  const tip = k.part(97.2, BANK + 0.75, 1.0, (q) => {
    const ring = new THREE.TorusGeometry(1.0, 0.06, 6, 22);
    for (const dx of [-1.0, 1.0]) q.geo(ring, new THREE.Matrix4().makeTranslation(dx, 0, 0).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)), MAT.ironDark, { smooth: true });
    for (const y of [-0.95, 0.95]) q.box(-1.05, y - 0.04, -0.5, 1.05, y + 0.04, 0.5, MAT.iron);
    q.box(-1.05, -0.8, -0.04, 1.05, -0.72, 0.04, MAT.rail);
  });
  // Bottom: a full dram pushed into the cage from the left, an empty pushed out to the right.
  const bFull = dramPart(k, true), bEmpty = dramPart(k, false);
  const d = W.data;
  d.bank = { full, empty, tip, bFull, bEmpty };
  W.addMachine((dt, t, w) => {
    const st = w.data.wind.st;
    const coalHours = w.hour >= 6 && w.hour < 13.2;
    const c = d.cages;
    c[0].dram.visible = coalHours; c[1].dram.visible = coalHours;
    full.visible = empty.visible = bFull.visible = bEmpty.visible = false;
    tip.rotation.x = 0;
    if (!coalHours || !st || st.moving) return;
    const i = st.arrive === 'top' ? 0 : 1; // which cage is at the bank
    const ph = st.phase;
    const atBank = c[i], atBottom = c[1 - i];
    const xb = i ? CAGE.bx : CAGE.ax, xbot = i ? CAGE.ax : CAGE.bx;
    // bank sequence (26 s): out to the weigh (0-6), weigh (6-10), to tippler (10-15), tip (15-21)
    atBank.dram.visible = false;
    let x, rot = 0, vis = true, coal = true;
    if (ph < 6) x = xb - (xb - 104.5) * ease(ph / 6);
    else if (ph < 10) x = 104.5;
    else if (ph < 15) x = 104.5 - (104.5 - 97.2) * ease((ph - 10) / 5);
    else if (ph < 21) { x = 97.2; rot = Math.sin(clamp01((ph - 15) / 6) * Math.PI) * Math.PI; coal = (ph - 15) < 2.0; }
    else { x = 97.2; vis = false; }
    full.visible = vis; full.userData.coal.visible = coal;
    full.position.set(x, BANK + (rot ? 0.75 : 0), 1.0);
    // turned over in the tippler about its axis, 0.75 m above the rails
    if (rot) { full.rotation.x = rot; full.position.y = BANK + 0.75 - 0.75 * Math.cos(rot); full.position.z = 1.0 - 0.75 * Math.sin(rot); tip.rotation.x = rot; }
    else full.rotation.x = 0;
    if (rot && (ph - 15) > 1.0 && (ph - 15) < 3.2 && w.R() < 0.6) w.particles.emit({ kind: 'dust', x: 97.2 + (w.R() - 0.5), y: BANK - 0.2, z: 1.0, vy: -1.5, color: '#3a3836', life: 2.5 }, w);
    w.data.weighing = ph > 6 && ph < 10;
    // the empty returning on the other road and into the cage
    if (ph > 4 && ph < 22) { empty.visible = true; const u = clamp01((ph - 4) / 16); empty.position.set(100 + (xb - 100) * ease(u), BANK, 2.6); if (u >= 1) empty.visible = false; }
    // pit bottom: full dram pushed in from the left by the hitcher, empty out to the right
    atBottom.dram.visible = ph > 9;
    if (ph < 9) { bFull.visible = true; bFull.position.set(xbot - 7 + 7 * ease(clamp01(ph / 9)), PB + 0.02, 1.0); }
    if (ph < 8) { bEmpty.visible = true; bEmpty.position.set(xbot + 7 * ease(clamp01(ph / 8)), PB + 0.02, 1.0); bEmpty.visible = ph < 7.5; }
  });
}

// ------------------------------------------------------------------ endless rope haulage
function haulage(k, W) {
  // Full drams ride the near road toward the shaft, empties the far road back in-bye, at about
  // 1.1 m/s (Hughes gives 2 to 3 mph for endless ropes). Spacing 22 m [illustrative].
  const spacing = 22, v = 1.1, xa = 56, xb = 142;
  const fulls = [], empties = [];
  for (let i = 0; i < 4; i++) fulls.push(dramPart(k, true));
  for (let i = 0; i < 4; i++) empties.push(dramPart(k, false));
  const pulley = k.part(199.5, PB + 1.7, 2.3, (q) => {
    q.lathe([[0.95, -0.12], [1.05, -0.12], [1.05, 0.12], [0.95, 0.12]], 0, 0, MAT.ironDark, { seg: 24, capTop: false, capBot: false });
    for (let s = 0; s < 6; s++) { const a = (s / 6) * TAU; q.beam([0, 0, 0], [Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95], 0.08, MAT.ironDark); }
    q.cyl(0, -0.2, 0, 0.16, 0.4, MAT.iron, { seg: 10 });
  });
  pulley.rotation.x = Math.PI / 2;
  const doors = [106, 112].map((x) => {
    const g = k.part(x, PB, 3.0, (q) => {
      q.box(-0.05, 0.02, -2.95, 0.05, 1.95, 0, P('#6a5038', { pat: 'planks', s: 0.25, c2: '#5a4430', cut: '#9a7448' }));
      q.box(-0.06, 0.4, -2.9, 0.06, 0.5, -0.05, MAT.ironDark);
      q.box(-0.06, 1.4, -2.9, 0.06, 1.5, -0.05, MAT.ironDark);
    });
    return { g, x, a: 0 };
  });
  W.data.doors = doors;
  const L = xb - xa;
  W.addMachine((dt, t, w) => {
    const run = w.hour >= 5.8 && w.hour < 13.3 ? 1 : 0;
    w.data.hpos = (w.data.hpos || 0) + dt * v * run;
    pulley.rotation.y = -w.data.hpos / 1.0;
    const P0 = w.data.hpos;
    const want = [0, 0];
    fulls.forEach((g, i) => {
      const x = xa + ((P0 + i * spacing) % L + L) % L;
      g.position.set(x, PB + 0.02, 1.0);
      g.visible = run > 0 || i < 2;
      doors.forEach((D, j) => { if (g.visible && x > D.x - 3.0 && x < D.x + 1.2) want[j] = 1; });
    });
    empties.forEach((g, i) => {
      const x = xb - ((P0 + i * spacing + spacing / 2) % L + L) % L;
      g.position.set(x, PB + 0.02, 2.6);
      g.visible = run > 0 || i < 2;
      doors.forEach((D, j) => { if (g.visible && x < D.x + 3.0 && x > D.x - 1.2) want[j] = 1; });
    });
    // never both open at once: the second waits
    if (want[0] && want[1]) want[doors[0].a > doors[1].a ? 1 : 0] = 0;
    doors.forEach((D, j) => {
      D.a += Math.sign(want[j] - D.a) * Math.min(Math.abs(want[j] - D.a), dt / 1.5);
      D.g.rotation.y = -D.a * 1.45;
    });
    w.data.doorOpen = want;
  });
}

// ------------------------------------------------------------------ horses
function horses(k, W) {
  const d = W.data;
  // Horse road: a horse pulls two drams between the face end (x 22) and the parting (x 50).
  const h1 = horsePart(k, '#6a3e22');
  const tr = [dramPart(k, true), dramPart(k, true)];
  d.horse1 = { g: h1, x: 30, dist: 0, dir: 1, moving: false };
  const cycle = 120; // s [illustrative]: load 25, haul 35, swap 25, return 35
  W.addMachine((dt, t, w) => {
    const H = d.horse1;
    const working = (w.hour >= 6 && w.hour < 13.2) || (w.hour >= 14.5 && w.hour < 21.5);
    const c = t % cycle;
    let x, dir, moving = false, full;
    if (!working) { x = 46; dir = -1; full = false; h1.visible = false; tr.forEach((g) => (g.visible = false)); H.moving = false; H.x = x; return; }
    h1.visible = true; tr.forEach((g) => (g.visible = true));
    if (c < 25) { x = 24.5; dir = 1; full = true; }
    else if (c < 60) { x = 24.5 + 24 * ease((c - 25) / 35); dir = 1; moving = true; full = true; }
    else if (c < 85) { x = 48.5; dir = -1; full = false; }
    else { x = 48.5 - 24 * ease((c - 85) / 35); dir = -1; moving = true; full = false; }
    H.dist += Math.abs(x - H.x); H.x = x; H.dir = dir; H.moving = moving;
    h1.position.set(x, PB + 0.02, 1.3);
    h1.rotation.y = dir > 0 ? 0 : Math.PI;
    animHorse(h1, moving, H.dist, t, 1);
    tr.forEach((g, i) => { g.position.set(x - dir * (2.4 + i * 1.95), PB + 0.02, 1.3); g.userData.coal.visible = full; });
  });
  // At the parting: a horse that has cast a shoe, waiting for the farrier.
  const h2 = horsePart(k, '#8a8478', { mane: '#5a5650', still: true });
  h2.position.set(58.3, PB + 0.02, 2.55); h2.rotation.y = Math.PI;
  // Stables: horses in their stalls, eating, nodding; some out at work by day.
  const coats = ['#5a3420', '#2e2a28', '#7a4a2a', '#8a8478', '#4a3020', '#6a3e22', '#3a2a22', '#7a5a3a'];
  const stabled = [];
  STALLS.forEach((S, i) => {
    if (i % 2 === 1 && i > 9) return;
    const h = horsePart(k, coats[i % coats.length], { harness: false, still: true });
    h.position.set(S.x, PB + 0.06, S.z + 0.2);
    h.rotation.y = -Math.PI / 2; // head to the manger
    h.scale.set(0.95, 0.95, 0.95);
    stabled.push({ h, i, out: i === 3 || i === 7 });
  });
  // Surface stables: two horses, and one hauling timber trams across the yard.
  const sh = [horsePart(k, '#6a4a2a', { harness: false, still: true }), horsePart(k, '#3a3430', { harness: false, still: true })];
  sh[0].position.set(289.9, 0.02, 3.8); sh[0].rotation.y = -Math.PI / 2;
  sh[1].position.set(293.5, 0.02, 3.8); sh[1].rotation.y = -Math.PI / 2;
  const h3 = horsePart(k, '#7a4a2a');
  const tt = [0, 1].map(() => k.part(0, 0, 0, (q) => {
    q.box(-0.8, 0.3, -0.45, 0.8, 0.4, 0.45, MAT.timber);
    for (let i = 0; i < 5; i++) q.cyl(-0.9, 0.52 + (i % 2) * 0.2, -0.32 + i * 0.16, 0.1, 1.8, MAT.prop, { axis: 'x', seg: 6 });
    for (const dx of [-0.5, 0.5]) for (const dz of [-0.32, 0.32]) q.cyl(dx, 0.17, dz - 0.03, 0.17, 0.06, MAT.ironDark, { axis: 'z', seg: 8 });
  }));
  d.horse3 = { x: 262, dist: 0 };
  W.addMachine((dt, t, w) => {
    for (const s of stabled) {
      const away = s.out && w.hour >= 5.6 && w.hour < 13.4;
      s.h.visible = !away;
      animHorse(s.h, false, 0, t, s.i);
    }
    animHorse(h2, false, 0, t, 9);
    animHorse(sh[0], false, 0, t, 11); animHorse(sh[1], false, 0, t, 12);
    // timber horse: from the saw mill to the bank and back, by day
    const day = w.hour > 7 && w.hour < 16;
    h3.visible = day; tt.forEach((g) => (g.visible = day));
    if (!day) return;
    const c = t % 150;
    let x, dir;
    if (c < 30) { x = 262; dir = -1; } else if (c < 75) { x = 262 - 96 * ease((c - 30) / 45); dir = -1; } else if (c < 100) { x = 166; dir = 1; } else { x = 166 + 96 * ease((c - 100) / 50); dir = 1; }
    const H = d.horse3;
    const moving = Math.abs(x - H.x) > 1e-4;
    H.dist += Math.abs(x - H.x); H.x = x;
    h3.position.set(x, 0.02, 0.9); h3.rotation.y = dir > 0 ? 0 : Math.PI;
    animHorse(h3, moving, H.dist, t, 3);
    tt.forEach((g, i) => g.position.set(x - dir * (2.2 + i * 1.9), 0.02, 0.9));
  });
}

// ------------------------------------------------------------------ the rest of the works
function works(k, W) {
  const d = W.data;
  // Fan: motor pulley and the fan shaft pulley turning; ropes drive between them.
  const pul = (x, y, z, r) => {
    const g = k.part(x, y, z, (q) => {
      q.lathe([[r - 0.08, -0.1], [r, -0.1], [r, 0.1], [r - 0.08, 0.1]], 0, 0, MAT.ironDark, { seg: 20, capTop: false, capBot: false });
      for (let s = 0; s < 6; s++) { const a = (s / 6) * TAU; q.beam([0, 0, 0], [Math.cos(a) * (r - 0.05), 0, Math.sin(a) * (r - 0.05)], 0.06, MAT.ironDark); }
    });
    g.rotation.x = Math.PI / 2;
    return g;
  };
  const fp1 = pul(327.5, 2.2, 1.45, 0.45), fp2 = pul(333.5, 4.4, 0.4, 1.4);
  for (const dy of [-1, 1]) k.part(0, 0, 0, (q) => { q.beam([327.5, 2.2 + dy * 0.45, 1.45], [333.5, 4.4 + dy * 1.4, 0.4], 0.05, P('#8a7a5a')); });
  // Pumps: three rams rising and falling about once a second.
  const rams = [0, 1, 2].map((i) => k.part(186.6 + i, PB + 1.5, 2.6, (q) => { q.cyl(0, -0.1, 0, 0.12, 0.7, P('#c8ccd0'), { seg: 8 }); q.box(-0.18, 0.55, -0.18, 0.18, 0.65, 0.18, MAT.iron); }));
  // Smithy bellows and the fitting shop's line shaft, a lathe chuck and the saw.
  const bellows = [228.5, 234.8, 241.1].map((hx) => k.part(hx + 1.6, 0.9, 4.25, (q) => {
    q.box(-0.4, 0, -0.3, 0.4, 0.08, 0.3, P('#5a3a22'));
    q.box(-0.38, 0.08, -0.28, 0.38, 0.5, 0.28, P('#3a2a1e', { pat: 'rings', s: 0.08, c2: '#4a3626' }));
    q.box(-0.4, 0.5, -0.3, 0.4, 0.58, 0.3, P('#5a3a22'));
  }));
  const shaftL = k.part(245.5, 4.6, 2.1, (q) => {
    q.cyl(0, 0, 0, 0.06, 14, P('#9a9ea4'), { axis: 'x', seg: 8 });
    for (const x of [2.1, 6.1, 10.7]) q.cyl(x, 0, -0.09, 0.32, 0.18, P('#7a5a3a', { pat: 'grain' }), { axis: 'z', seg: 14 });
  });
  for (const lx of [247.6, 251.6]) k.part(0, 0, 0, (q) => { q.beam([lx - 0.95 + 0.1, 4.6, 2.1], [lx - 0.85, 1.15, 2.9], 0.06, P('#6a4a2a')); });
  k.part(0, 0, 0, (q) => { q.beam([256.2, 4.6, 2.1], [256.4, 2.25, 3.2], 0.06, P('#6a4a2a')); });
  const chuck = [247.6, 251.6].map((lx) => k.part(lx - 0.6, 1.15, 2.9, (q) => { q.cyl(0, 0, 0, 0.16, 0.2, P('#8a8e94'), { axis: 'x', seg: 8 }); q.box(0.05, 0.14, -0.03, 0.15, 0.2, 0.03, P('#5a5e64')); }));
  const saw = k.part(270.5, 0.85, 2.1, (q) => { q.cyl(0, 0, -0.01, 0.6, 0.02, P('#b8bec4', { pat: 'rings', s: 0.08 }), { axis: 'z', seg: 22 }); for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; q.box(Math.cos(a) * 0.55 - 0.04, Math.sin(a) * 0.55 - 0.04, -0.012, Math.cos(a) * 0.55 + 0.04, Math.sin(a) * 0.55 + 0.04, 0.012, P('#5a5e64')); } });
  // Jigging screen tray and the picking belt's coal.
  const jig = k.part(90.5, 4.4, 1.05, (q) => { q.boxR(0, 0, 0, 7.6, 0.12, 1.5, P('#4a4a4c', { pat: 'grate', c2: '#2a2a2c' }), { z: 0.11 }); q.boulder(-1.5, 0.15, 0, 1.6, 0.18, 0.5, MAT.coalHeap, 5); });
  const lumps = k.part(66, 3.85, 1.05, (q) => {
    const r = q.rng('belt');
    for (let i = 0; i < 46; i++) { const x = r() * 21, z = (r() - 0.5) * 1.2; q.boulder(x, 0, z, 0.1 + r() * 0.12, 0.08 + r() * 0.06, 0.1 + r() * 0.1, r() < 0.15 ? P('#7a7470', { pat: 'rock' }) : MAT.coalHeap, i + 9); }
  });
  // Weigh dial needle.
  const needle = k.part(103.0, BANK + 2.1, 3.3, (q) => { q.box(-0.015, 0, -0.01, 0.015, 0.26, 0.01, P('#1a1410')); });
  // A waggon eased along under the chute as it fills (the shunter's pole does the work).
  const wag = k.part(0, 0, 0, (q) => { waggon(q, 0, 0, 0, '#6a5a4e'); });
  // Tip tram on the incline.
  const tram = k.part(0, 0, 0, (q) => { q.box(-0.55, 0.15, -0.4, 0.55, 0.85, 0.4, P('#5a4a3a', { pat: 'planks', s: 0.2 })); q.boulder(0, 0.85, 0, 0.45, 0.2, 0.35, MAT.shale, 4); for (const dx of [-0.35, 0.35]) q.cyl(dx, 0.15, -0.33, 0.15, 0.66, MAT.ironDark, { axis: 'z', seg: 8 }); });
  const tipPath = (u) => { const x = 45 - u * 20.5; const y = 14 * (1 - Math.min(1, Math.hypot(x - 22, 0.9 - 3.5) / 21.5)) + 0.2; return [x, Math.max(0.2, y), 0.85]; };
  W.addMachine((dt, t, w) => {
    const ws = w.data.wind && w.data.wind.st;
    fp1.rotation.y = -t * 9.0; fp2.rotation.y = -t * 2.9;
    rams.forEach((g, i) => { g.position.y = PB + 1.5 + Math.sin(t * TAU * 0.9 + (i * TAU) / 3) * 0.18; });
    bellows.forEach((g, i) => { g.scale.y = 0.75 + 0.3 * (0.5 + 0.5 * Math.sin(t * TAU * 0.5 + i * 1.7)); });
    shaftL.rotation.x = t * 6; chuck.forEach((g) => (g.rotation.x = t * 12));
    saw.rotation.z = -t * 40; saw.visible = true;
    const screening = w.hour >= 5 && w.hour < 17.5;
    jig.position.x = 90.5 + (screening ? Math.sin(t * TAU * 1.5) * 0.06 : 0);
    if (screening) lumps.position.x = 66 - ((t * 0.3) % 1.4);
    needle.rotation.z = w.data.weighing ? -1.4 - Math.sin(t * 8) * 0.05 * Math.exp(-((t % 4) * 1.2)) : -0.05;
    wag.position.set(58.2 + Math.sin(t * 0.018) * 3.2, 0, 1.6);
    // tip tram: up the incline, tip, down again
    const c = t % 90;
    const u = c < 35 ? ease(c / 35) : c < 50 ? 1 : 1 - ease((c - 50) / 40);
    const [x, y, z] = tipPath(u);
    tram.position.set(x, y, z);
    const [x2, y2] = tipPath(Math.min(1, u + 0.02));
    tram.rotation.z = Math.atan2(y2 - y, x2 - x) + (c > 36 && c < 49 ? -Math.sin(((c - 36) / 13) * Math.PI) * 1.1 : 0);
    if (c > 38 && c < 46 && w.R() < 0.3) w.particles.emit({ kind: 'dust', x: 24, y: 13.8, z: 1.0, vx: -0.6, vy: -0.6, color: '#5a5654', life: 3 }, w);
    void ws;
  });
  d.works = true;
}

// ------------------------------------------------------------------ smoke, steam, water
function airAndWater(W) {
  // boiler chimney: dark smoke drifting on the south-west wind
  W.emitter({ kind: 'soot', x: 221.4, y: 29.8, z: 7.0, rate: 3.5, w: 1.6, d: 1.6, size: [1.2, 9], color: '#4a4440' });
  // winding engine exhaust: a puff each stroke while the engine runs
  W.emitter({ kind: 'steam', x: 190.5, y: 14.6, z: 3.5, rate: (w) => (w.data.wind && w.data.wind.st && w.data.wind.st.moving ? 7 : 0.4), w: 0.3, d: 0.3, size: [0.4, 3.0] });
  // fan chimney: warm, damp air from the workings
  W.emitter({ kind: 'steam', x: 333.5, y: 16.4, z: 2.6, rate: 2.2, w: 3.2, d: 3.2, vy: 1.4, size: [1.0, 5.5], color: '#e8e6e0' });
  // the smithy chimneys and cottage chimneys
  for (const x of [228.5, 234.8, 241.1]) W.emitter({ kind: 'smoke', x, y: 7.7, z: 4.6, rate: 0.9, w: 0.3, d: 0.3, size: [0.4, 3], color: '#6a6460' });
  for (const x of [-26.8, -15.4]) W.emitter({ kind: 'smoke', x, y: 9.6, z: 3.5, rate: 0.6, w: 0.2, d: 0.2, size: [0.3, 2.4], color: '#7a7470' });
  W.emitter({ kind: 'smoke', x: 129.5, y: BANK + 4.4, z: 2.45, rate: 0.5, w: 0.1, d: 0.1, size: [0.2, 1.4], color: '#7a7470' });
  // sparks at the anvils while the smiths hammer
  for (const x of [228.5, 234.8]) W.emitter({ kind: 'spark', x, y: 0.75, z: 2.8, rate: (w) => (w.hour > 6 && w.hour < 17 ? 1.6 : 0), w: 0.2, d: 0.2 });
  // forge embers
  for (const x of [228.5, 234.8, 241.1]) W.emitter({ kind: 'ember', x, y: 1.0, z: 4.4, rate: 0.8, w: 0.5, d: 0.4 });
  // sawdust
  W.emitter({ kind: 'dust', x: 270.5, y: 0.9, z: 2.0, rate: (w) => (w.hour > 7 && w.hour < 16.5 ? 3 : 0), w: 0.2, d: 0.2, color: '#c8aa70', size: [0.05, 0.3] });
  // water dripping from the roof of the roads and the shaft
  W.emitter({ kind: 'splash', x: 90, y: PB + 2.4, z: 2.2, rate: 0.7, w: 60, d: 2.5, vy: -1, color: '#a8c0c8', size: [0.04, 0.03] });
  W.emitter({ kind: 'splash', x: SHAFT.x0 + 2.7, y: PB + 3.5, z: 1.4, rate: 2, w: 4.5, d: 1.5, vy: -2, color: '#a8c0c8', size: [0.04, 0.03] });
  // dust hanging at the face
  W.emitter({ kind: 'dust', x: 14, y: PB + 0.7, z: 1.4, rate: (w) => (w.hour > 6 && w.hour < 13 ? 1.4 : 0.1), w: 11, d: 1.5, color: '#4a4844', size: [0.1, 0.8] });
}

// ------------------------------------------------------------------ animals
function animals(k, W) {
  const r = k.rng('animals');
  // sheep grazing on the moor
  const sheep = [];
  for (let i = 0; i < 6; i++) {
    const g = k.part(0, 0, 0, (q) => {
      const wool = P('#e4ddcc', { c2: '#d0c8b4', pat: 'speckle' });
      q.sphere(0, 0.55, 0, 0.36, wool, { seg: 10, rings: 6 });
      q.sphere(0.36, 0.62, 0, 0.13, P('#2e2a28'), { seg: 8, rings: 5 });
      for (const [lx, lz] of [[0.2, -0.12], [0.2, 0.12], [-0.2, -0.12], [-0.2, 0.12]]) q.beam([lx, 0.35, lz], [lx, 0, lz], 0.05, P('#2e2a28'));
    });
    g.scale.set(1.25, 1.0, 1.0);
    sheep.push({ g, x: 360 + r() * 70, z: 4 + r() * 13, a: r() * TAU, sp: 0.05 + r() * 0.08 });
  }
  // crows over the tip and the moor
  const crows = [0, 1, 2, 3].map(() => k.part(0, 0, 0, (q) => {
    const b = P('#1e1c1e', { thin: true });
    q.sphere(0, 0, 0, 0.1, P('#1e1c1e'), { seg: 6, rings: 4 });
    q.boxR(0, 0.01, 0.25, 0.14, 0.015, 0.45, b, { x: 0.2 });
    q.boxR(0, 0.01, -0.25, 0.14, 0.015, 0.45, b, { x: -0.2 });
  }));
  // a dog on the tip, chased off at times by the screen boy
  const dog = k.part(0, 0, 0, (q) => {
    const c = P('#5a4a3a');
    q.cyl(-0.3, 0.42, 0, 0.13, 0.6, c, { axis: 'x', seg: 8 });
    q.sphere(0.38, 0.55, 0, 0.12, c, { seg: 8, rings: 5 });
    q.box(0.42, 0.48, -0.05, 0.58, 0.56, 0.05, P('#3a2e24'));
    for (const [lx, lz] of [[0.2, -0.08], [0.2, 0.08], [-0.24, -0.08], [-0.24, 0.08]]) q.beam([lx, 0.35, lz], [lx, 0, lz], 0.05, c);
    q.beam([-0.32, 0.45, 0], [-0.5, 0.65, 0], 0.04, c);
  });
  // the stable cat (surface stables), and rats below at the corn bins and along the horse road
  const cat = k.part(0, 0, 0, (q) => { const c = P('#3a3430'); q.sphere(0, 0.12, 0, 0.12, c, { seg: 8, rings: 5 }); q.sphere(0.15, 0.2, 0, 0.07, c, { seg: 8, rings: 5 }); q.cyl(-0.12, 0.14, 0, 0.018, -0.24, c, { axis: 'x', seg: 4 }); });
  const rats = [0, 1, 2].map(() => k.part(0, 0, 0, (q) => { const c = P('#4a4038'); q.sphere(0, 0.05, 0, 0.06, c, { seg: 6, rings: 4 }); q.sphere(0.07, 0.06, 0, 0.03, c, { seg: 6, rings: 3 }); q.cyl(-0.05, 0.03, 0, 0.008, -0.14, P('#8a6a5a'), { axis: 'x', seg: 3 }); }));
  W.addMachine((dt, t, w) => {
    const day = w.sun().day > 0.4;
    for (const s of sheep) {
      s.a += Math.sin(t * 0.07 + s.x) * dt * 0.2;
      const graze = Math.sin(t * 0.13 + s.z) > -0.2;
      if (!graze) { s.x += Math.cos(s.a) * s.sp * dt * 4; s.z += Math.sin(s.a) * s.sp * dt * 4; }
      s.x = Math.max(356, Math.min(436, s.x)); s.z = Math.max(2.5, Math.min(18, s.z));
      const y = 1.6 + Math.pow(Math.max(0, s.x - 352) / 88, 1.25) * 24;
      s.g.position.set(s.x, y, s.z); s.g.rotation.y = -s.a; s.g.rotation.z = graze ? -0.25 : 0;
    }
    crows.forEach((c, i) => {
      c.visible = day;
      const ph = t * (0.09 + i * 0.013) + i * 1.7;
      c.position.set((i < 2 ? 25 : 380) + Math.cos(ph) * (12 + i * 3), 22 + i * 2 + Math.sin(t * 0.6 + i) * 1.5, 10 + Math.sin(ph) * 8);
      c.rotation.y = -ph - Math.PI / 2;
      c.rotation.x = Math.sin(t * 7 + i) * 0.25;
    });
    // dog: wanders the foot of the tip, bolts when Tommy chases it (11:00-11:30)
    const chased = w.hour >= 11 && w.hour < 11.5;
    const dx = chased ? 30 - ((t * 3) % 25) : 38 + Math.sin(t * 0.08) * 5;
    dog.position.set(dx, 0.02, 2.2 + Math.cos(t * 0.11) * 0.8);
    dog.rotation.y = chased ? Math.PI : Math.cos(t * 0.08) > 0 ? 0 : Math.PI;
    cat.position.set(289 + Math.sin(t * 0.05) * 2.5, 0.02, 1.4); cat.rotation.y = Math.cos(t * 0.05) > 0 ? 0 : Math.PI;
    // rats: one at the corn bins (bolder when the ostler is elsewhere), two along the roads
    rats[0].position.set(206.6 + Math.sin(t * 0.9) * 0.6, PB + 0.9 + (Math.sin(t * 0.3) > 0.6 ? 0.08 : 0), 3.5); rats[0].rotation.y = Math.cos(t * 0.9) > 0 ? 0 : Math.PI;
    rats[1].position.set(30 + ((t * 0.7) % 18), PB + 0.02, 2.75); rats[1].rotation.y = 0;
    rats[2].position.set(118 - ((t * 0.5) % 40), PB + 0.02, 3.2); rats[2].rotation.y = Math.PI;
  });
}

export function setupMachines(k, W) {
  animals(k, W);
  winding(k, W);
  bankFlow(k, W);
  haulage(k, W);
  horses(k, W);
  works(k, W);
  airAndWater(W);
  void SHAFT;
}
