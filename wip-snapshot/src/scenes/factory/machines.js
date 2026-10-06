/* The Car Factory: everything that moves. Speeds from the dossier (section 6) where documented.
 *
 * Long conveyors use one moving group per line: identical items, shifted by (distance mod pitch),
 * so a line of sixteen chassis costs one animated part. Where an item changes along the line
 * (a chassis gaining its engine, a body its paint), it takes on the next station's state each
 * time the group steps back one pitch, as if fitted there.
 */
import { mat, THREE } from '../../engine/index.js';
import { X, H, N, LINE, PERIOD, M, SAW } from './common.js';
import { modelT, body, wheel, WR, WB } from './car.js';
import { PH, CARRIER, CORE, MONO } from './west.js';
import { SHOP } from './shop.js';
import { ST, stageAt, RAIL_Y, CHUTE, DASH2, WHEEL3, SPIN, PRESS, OVEN } from './bldgH.js';
import { JR, NL } from './east.js';

const inHours = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
// Working hours (S1 p.59 to 61, p.358; March 1914, assumed still in force in November).
export const HOURS = {
  day: (h) => (h >= 6.5 && h < 10.5) || (h >= 11 && h < 15),
  second: (h) => (h >= 15.5 && h < 19.5) || (h >= 19.67 && h < 23.67),
  both: (h) => HOURS.day(h) || HOURS.second(h),
  women: (h) => (h >= 7.5 && h < 12) || (h >= 12.75 && h < 16.75),
  foundry: (h) => inHours(h, 6.5, 22.5),
  tapping: (h) => inHours(h, 6.5, 15.25),
};

const enginePart = (q, x, y, z) => {
  const e = mat({ c: '#2c2c30', c2: '#3a3a40', cut: '#18181a' });
  q.cyl(x - 0.5, y + 0.25, z, 0.26, 0.5, e, { axis: 'x', seg: 10 });
  q.box(x, y, z - 0.2, x + 0.78, y + 0.46, z + 0.2, e);
  q.box(x + 0.03, y + 0.46, z - 0.17, x + 0.75, y + 0.54, z + 0.17, e);
};

// A group of identical items along a straight line, stepping back one pitch each cycle.
function conveyor(k, W, o) {
  const [dx, dy, dz] = o.dir || [1, 0, 0];
  const g = k.part(o.base[0], o.base[1], o.base[2], (q) => { for (let i = 0; i < o.n; i++) o.item(q, i, i * o.pitch * dx, i * o.pitch * dy, i * o.pitch * dz); });
  o.s = 0;
  W.addMachine((dt, t, w) => {
    if (!o.run || o.run(w.hour, w)) o.s += dt * o.speed;
    const u = o.s % o.pitch;
    g.position.set(o.base[0] + dx * u, o.base[1] + dy * u, o.base[2] + dz * u);
  });
  return g;
}

// ------------------------------------------------------------------ the power house engines
function engines(k, W) {
  for (const [E, rpm] of [[PH.big, 80], [PH.small, 95]]) {
    const [cx, cy] = E.crank;
    const shaft = k.part(cx, cy, 0, (q) => {
      // Crank disc and pin.
      q.cyl(0, 0, E.z - 0.15, E.r + 0.25, 0.14, M.castIron, { axis: 'z', seg: 16 });
      q.cyl(E.r, 0, E.z - 0.35, 0.12, 0.5, M.bright, { axis: 'z', seg: 8 });
      // Flywheel: rim, spokes and hub.
      const fm = mat({ c: '#2e3a34', c2: '#3a4840', cut: '#1a221e' });
      q.geo(new THREE.TorusGeometry(E.flyR - 0.18, 0.2, 6, 30), new THREE.Matrix4().makeTranslation(0, 0, E.fly), fm);
      q.cyl(0, 0, E.fly - 0.25, E.flyR - 0.02, 0.5, fm, { axis: 'z', seg: 30, caps: false });
      for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI; q.beam([Math.cos(a) * (E.flyR - 0.2), Math.sin(a) * (E.flyR - 0.2), E.fly], [-Math.cos(a) * (E.flyR - 0.2), -Math.sin(a) * (E.flyR - 0.2), E.fly], 0.22, fm); }
      q.cyl(0, 0, E.fly - 0.4, 0.5, 0.8, fm, { axis: 'z', seg: 12 });
      // Armature face of the generator with commutator bars.
      q.cyl(0, 0, E.gen - 0.75, E === PH.big ? 1.4 : 1.0, 0.16, mat({ c: '#8a5a32', c2: '#b8864a', pat: 'bars', s: 0.08, cut: '#5a3a22' }), { axis: 'z', seg: 24 });
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; const R = E === PH.big ? 1.3 : 0.9; q.beam([Math.cos(a) * R, Math.sin(a) * R, E.gen - 0.8], [-Math.cos(a) * R, -Math.sin(a) * R, E.gen - 0.8], 0.08, M.iron); }
    });
    const xh = k.part(0, cy, E.z, (q) => {
      q.box(-0.3, -0.25, -0.3, 0.3, 0.25, 0.3, M.bright);
      q.cyl(-3.0, 0, 0, 0.09, 3.0, M.bright, { axis: 'x', seg: 6 });
    });
    const rod = k.part(0, cy, E.z, (q) => {
      q.box(0, -0.13, -0.09, E.rod, 0.13, 0.09, M.bright);
      q.cyl(0, 0, -0.16, 0.2, 0.32, M.bright, { axis: 'z', seg: 8 });
      q.cyl(E.rod, 0, -0.16, 0.22, 0.32, M.bright, { axis: 'z', seg: 8 });
    });
    const w = (rpm / 60) * Math.PI * 2;
    W.addMachine((dt, t) => {
      const a = t * w;
      shaft.rotation.z = a;
      const px = cx + Math.cos(a) * E.r, py = cy + Math.sin(a) * E.r;
      const xc = px - Math.sqrt(E.rod * E.rod - (py - cy) ** 2);
      xh.position.x = xc;
      rod.position.x = xc;
      rod.rotation.z = Math.atan2(py - cy, px - xc);
    });
  }
}

// ------------------------------------------------------------------ foundry
function carriers(k, W) {
  const C = CARRIER, L = C.xb - C.xa, perim = 2 * L + 2 * Math.PI * C.r, v = 12 * 0.3048 / 60;
  const at = (s, zc) => {
    s = ((s % perim) + perim) % perim;
    if (s < L) return [C.xa + s, zc - C.r, 0];
    s -= L;
    const arc = Math.PI * C.r;
    if (s < arc) { const a = -Math.PI / 2 + s / C.r; return [C.xb + Math.cos(a) * C.r, zc + Math.sin(a) * C.r, a + Math.PI / 2]; }
    s -= arc;
    if (s < L) return [C.xb - s, zc + C.r, Math.PI];
    s -= L;
    const a = Math.PI / 2 + s / C.r;
    return [C.xa + Math.cos(a) * C.r, zc + Math.sin(a) * C.r, a + Math.PI / 2];
  };
  const shelf = (q) => {
    for (const s of [-0.3, 0.3]) q.beam([s, 0, 0], [s, -2.9, 0], 0.03, M.iron);
    q.box(-0.45, -3.05, -0.3, 0.45, -2.95, 0.3, M.steelDk);
    q.box(-0.3, -2.95, -0.22, 0.3, -2.62, 0.22, M.iron);
    q.box(-0.27, -2.62, -0.19, 0.27, -2.6, 0.19, M.sand);
  };
  const n = 15, items = [];
  for (const zc of [C.zA, C.zB]) for (let i = 0; i < n; i++) items.push({ zc, s0: (i / n) * perim, g: k.part(0, C.y, 0, shelf) });
  const spr = [];
  for (const zc of [C.zA, C.zB]) for (const xc of [C.xa, C.xb]) spr.push(k.part(xc, C.y, zc, (q) => {
    q.cyl(0, 0, 0, C.r, 0.1, M.steelDk, { seg: 24 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; q.beam([Math.cos(a) * (C.r - 0.1), 0.05, Math.sin(a) * (C.r - 0.1)], [-Math.cos(a) * (C.r - 0.1), 0.05, -Math.sin(a) * (C.r - 0.1)], 0.1, M.steel); }
    q.cyl(0, -0.1, 0, 0.25, 0.3, M.steelDk, { seg: 8 });
  }));
  let s = 0;
  W.addMachine((dt, t, w) => {
    if (HOURS.foundry(w.hour)) s += dt * v;
    for (const it of items) { const p = at(it.s0 + s, it.zc); it.g.position.set(p[0], C.y, p[1]); it.g.rotation.y = -p[2]; }
    for (const g of spr) g.rotation.y = -s / C.r;
  });
}

function foundryLife(k, W) {
  // The crane over the cylinder floor: travel, pour, travel (S1 p.336).
  const crane = k.part(84, 6.35, 0, (q) => {
    q.box(-0.3, 0, 0.3, 0.3, 0.5, 4.9, mat({ c: '#6a5a3a', cut: '#3a3020' }));
    q.box(-0.45, 0.5, 2.1, 0.45, 0.85, 3.0, M.steelDk);
    for (const s of [-0.3, 0.3]) q.cyl(s, -3.4, 2.55, 0.012, 3.9, M.iron, { seg: 3 });
    q.box(-0.4, -3.5, 2.2, 0.4, -3.4, 2.9, M.steelDk);
    q.lathe([[0.25, -4.6], [0.42, -4.3], [0.45, -3.65], [0.4, -3.65]], 0, 2.55, mat({ c: '#3a3634', cut: '#2a1a14' }), { seg: 12 });
    q.cyl(0, -3.75, 2.55, 0.38, 0.04, M.glowIron, { seg: 12 });
  });
  const stops = [84.4, 87.2, 90.0, 92.8];
  const ladle = { x: 84.4, pour: false };
  W.addMachine((dt, t, w) => {
    const cyc = 30, i = Math.floor(t / cyc) % stops.length, f = (t % cyc) / cyc;
    const a = stops[i], b = stops[(i + 1) % stops.length];
    const x = f < 0.55 ? a : a + (b - a) * Math.min(1, (f - 0.55) / 0.4);
    crane.position.x = x;
    ladle.x = x;
    ladle.pour = f > 0.1 && f < 0.5 && HOURS.tapping(w.hour);
  });
  const pourSpark = W.emitter({ kind: 'spark', x: 84, y: 1.8, z: 2.6, rate: () => (ladle.pour ? 10 : 0), w: 0.3, d: 0.3, vy: 1 });
  const pourSmoke = W.emitter({ kind: 'smoke', x: 84, y: 1.5, z: 2.6, rate: () => (ladle.pour ? 2.5 : 0.3), w: 2, d: 1.5, vy: 0.6, size: [0.8, 3], color: '#8a8480' });
  W.addMachine(() => { pourSmoke.x = ladle.x; pourSpark.x = ladle.x; });
  // The core oven's reel (Rockwell revolving oven) turning slowly; shelves stay level.
  const reel = k.part(CORE.x, CORE.y, CORE.z, (q) => {
    for (let i = 0; i < 2; i++) { const a = (i / 2) * Math.PI; q.beam([Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0], [-Math.cos(a) * 1.35, -Math.sin(a) * 1.35, 0], 0.1, M.iron); }
    q.cyl(0, 0, -0.5, 0.15, 1.6, M.iron, { axis: 'z', seg: 8 });
  });
  const shelves = [];
  for (let i = 0; i < 4; i++) shelves.push(k.part(0, 0, CORE.z, (q) => {
    q.box(-0.6, -0.05, -0.8, 0.6, 0, 0.8, M.iron);
    for (let j = 0; j < 4; j++) q.box(-0.5 + j * 0.27, 0, -0.5, -0.32 + j * 0.27, 0.16, 0.5, M.sand);
    q.beam([0, 0, 0], [0, 0.3, 0], 0.03, M.iron);
  }));
  // Tumbling barrels on one shaft.
  const barrels = k.part(103.4, 0.85, 3.2, (q) => {
    const bm = mat({ c: '#4a4846', c2: '#5a5856', pat: 'rivets', s: 0.3, cut: '#2a2826' });
    for (let i = 0; i < 4; i++) { q.cyl(-1.9 + i * 0.98, 0, 0, 0.55, 0.86, bm, { axis: 'x', seg: 8 }); q.box(-1.9 + i * 0.98, 0.5, -0.12, -1.04 + i * 0.98, 0.6, 0.12, M.steel); }
    q.cyl(-2.2, 0, 0, 0.06, 4.4, M.steel, { axis: 'x', seg: 6 });
  });
  W.addMachine((dt, t, w) => {
    const a = t * 0.06;
    reel.rotation.z = a;
    shelves.forEach((g, i) => { const b = a + (i / 4) * Math.PI * 2; g.position.set(CORE.x + Math.cos(b) * 1.0, CORE.y + Math.sin(b) * 1.0 - 0.3, CORE.z); });
    if (HOURS.foundry(w.hour)) barrels.rotation.x = t * 1.6;
  });
  // The monorail locomotive: castings from the cleaning room to the machine shop (S1 p.26 to 27, p.354).
  const loco = k.part(MONO.x0, MONO.y, MONO.z, (q) => {
    q.box(-0.4, -0.15, -0.12, 0.4, 0.0, 0.12, M.steelDk);
    q.box(1.6, -0.15, -0.12, 2.4, 0.0, 0.12, M.steelDk);
    q.box(-0.6, -1.85, -0.55, 0.6, -0.15, 0.55, mat({ c: '#4a5a4a', c2: '#3a4a3a', cut: '#2a342a' }));
    q.box(-0.55, -1.25, -0.56, 0.55, -0.7, -0.54, mat({ c: '#a8bcc4', c2: '#ffd890', glow: 'night' }));
    q.box(-0.65, -0.2, -0.6, 0.65, -0.1, 0.6, M.iron);
    for (const s of [-0.5, 0.5]) q.beam([1.8 + s * 0.6, -0.15, 0], [1.8 + s * 1.1, -1.6, 0], 0.05, M.iron);
    q.box(0.6, -1.75, -0.55, 3.0, -1.6, 0.55, M.steelDk);
    for (let i = 0; i < 4; i++) q.box(0.75 + i * 0.55, -1.6, -0.25, 1.2 + i * 0.55, -1.25, 0.25, M.castIron);
  });
  const ML = { x: 99, cargo: true };
  W.addMachine((dt, t, w) => {
    const run = HOURS.both(w.hour);
    const cyc = 140, f = (t % cyc) / cyc;
    let x;
    if (f < 0.15) x = 99; else if (f < 0.45) x = 99 + (133 - 99) * ((f - 0.15) / 0.3); else if (f < 0.6) x = 133; else if (f < 0.9) x = 133 - (133 - 99) * ((f - 0.6) / 0.3); else x = 99;
    if (!run) x = 108;
    loco.position.x = x;
    ML.x = x;
  });
  W.data.mono = ML;
  // Smoke, sparks and dust.
  W.emitter({ kind: 'smoke', x: 42, y: 19.2, z: 0.8, w: 9, d: 1, rate: (w) => (HOURS.tapping(w.hour) ? 3.5 : 0.8), vy: 1.2, size: [1.5, 7], color: '#6a625c' });
  W.emitter({ kind: 'spark', x: 42, y: 19.4, z: 0.8, w: 8, d: 0.6, rate: (w) => (HOURS.tapping(w.hour) ? 3 : 0), vy: 3 });
  W.emitter({ kind: 'spark', x: 44.4, y: 1.4, z: 1.0, w: 0.3, d: 0.3, rate: (w) => (HOURS.tapping(w.hour) ? 5 : 0), vy: 0.8 });
  W.emitter({ kind: 'spark', x: 104, y: 1.0, z: 7.6, w: 3, d: 0.3, rate: (w) => (HOURS.foundry(w.hour) ? 6 : 0), vy: 0.6 });
  W.emitter({ kind: 'dust', x: 103.4, y: 1.4, z: 3.2, w: 4, d: 1.2, rate: (w) => (HOURS.foundry(w.hour) ? 2 : 0), vy: 0.2 });
  W.emitter({ kind: 'steam', x: 113, y: 0.9, z: 4.3, w: 2.5, d: 1.5, rate: (w) => 1 + 3 * Math.max(0, Math.sin(w.time * 0.21)), vy: 0.8, size: [0.5, 2.5] });
}

// ------------------------------------------------------------------ machine shop
function shopMachines(k, W) {
  const shafts = SHOP.shafts.map((s) => k.part(s.x0, SHOP.shaftY, s.z, (q) => {
    q.cyl(0, 0, 0, 0.045, s.x1 - s.x0, M.bright, { axis: 'x', seg: 6 });
    for (let x = 1.4; x < s.x1 - s.x0; x += 2.8) {
      q.cyl(x - 0.1, 0, 0, 0.26, 0.2, M.castIron, { axis: 'x', seg: 10 });
      q.box(x - 0.11, -0.25, -0.03, x + 0.11, 0.25, 0.03, M.iron);
    }
  }));
  const m = SHOP.mill;
  const table = k.part(m.x0 + 0.4, m.y, m.z, (q) => {
    q.box(0, 0, -0.85, 3.4, 0.12, 0.85, M.machineLt);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) q.box(0.2 + i * 0.62, 0.12, -0.7 + j * 0.5, 0.72 + i * 0.62, 0.42, -0.32 + j * 0.5, M.castIron);
  });
  const crane = k.part((SHOP.crane.x0 + SHOP.crane.x1) / 2, SHOP.crane.y, 2, (q) => {
    const w = (SHOP.crane.x1 - SHOP.crane.x0) / 2;
    for (const s of [-0.5, 0.5]) q.box(-w, 0, s - 0.15, w, 0.6, s + 0.15, mat({ c: '#6a5a3a', cut: '#3a3020' }));
    q.box(-0.6, 0.6, -0.7, 0.6, 1.0, 0.7, M.steelDk);
    q.box(-w + 0.2, -1.6, -0.6, -w + 1.4, 0, 0.6, mat({ c: '#5a4a32', c2: '#a8bcc4', cut: '#3a3020' }));
    for (const s of [-0.15, 0.15]) q.cyl(s, -6.2, 0, 0.012, 6.2, M.iron, { seg: 3 });
    q.box(-0.25, -6.4, -0.2, 0.25, -6.2, 0.2, M.steelDk);
    q.box(-0.7, -7.6, -0.5, 0.7, -6.6, 0.5, mat({ c: '#b08a52', c2: '#8a6a3a', pat: 'planks', s: 0.2 }));
    for (const s of [-0.5, 0.5]) q.beam([0, -6.4, 0], [s * 1.2, -6.6, s], 0.02, M.iron);
  });
  const grind = SHOP.grinders.map((x) => k.part(x, 1.3, SHOP.grindZ + 0.55, (q) => {
    q.cyl(0, 0, -0.1, 0.32, 0.12, mat({ c: '#8a8680', c2: '#6a6660', pat: 'speckle', cut: '#5a5650' }), { axis: 'z', seg: 14 });
    q.box(-0.04, -0.3, -0.12, 0.04, 0.3, -0.1, M.iron);
  }));
  const g = SHOP.mag;
  conveyor(k, W, { base: [g.x0 + 0.3, g.y, g.z], n: 11, pitch: 0.9, speed: 44 * 0.0254 / 60, run: HOURS.both, item: (q, i, x) => {
    q.cyl(x, 0, 0, 0.3, 0.07, M.castIron, { seg: 14 });
    for (let j = 0; j < (i > 2 ? 8 : 2 + i * 2); j++) { const a = (j / 8) * Math.PI * 2; q.box(x + Math.cos(a) * 0.2 - 0.04, 0.07, Math.sin(a) * 0.2 - 0.04, x + Math.cos(a) * 0.2 + 0.04, 0.17, Math.sin(a) * 0.2 + 0.04, M.steel); }
  } });
  // Overhead endless carriers on the motor lines.
  for (const L of SHOP.motor) conveyor(k, W, { base: [171.25, 0.4, L.z + 1.1], dir: [0, 1, 0], n: 5, pitch: 1.1, speed: 0.12, run: HOURS.both, item: (q, i, x, y) => { q.box(-0.15, y, -0.12, 0.15, y + 0.2, 0.12, M.bright); } });
  // Test blocks: each new motor turned over at speed (S1 p.130).
  const tests = SHOP.tests.map((x) => k.part(x + 0.62, 0.8, SHOP.testZ, (q) => {
    q.cyl(-0.04, 0, -0.04, 0.2, 0.08, M.steelDk, { axis: 'x', seg: 10 });
    q.box(0, -0.03, -0.2, 0.03, 0.03, 0.2, M.iron);
  }));
  W.addMachine((dt, t, w) => {
    const on = HOURS.both(w.hour);
    for (const s of shafts) if (on) s.rotation.x = t * 12;
    const f = (t % 90) / 90;
    table.position.x = m.x0 + 0.4 + (f < 0.8 ? f / 0.8 * 2.2 : 2.2 * (1 - (f - 0.8) / 0.2));
    const cf = (t % 70) / 70;
    crane.position.z = 2 + 14 * (cf < 0.4 ? cf / 0.4 : cf < 0.5 ? 1 : cf < 0.9 ? 1 - (cf - 0.5) / 0.4 : 0);
    if (on) grind.forEach((g2, i) => { g2.rotation.z = t * 25 + i; });
    if (on) tests.forEach((g2, i) => { g2.rotation.x = t * (30 + i * 3); });
  });
  W.emitter({ kind: 'spark', x: 154.8, y: 1.25, z: SHOP.grindZ + 0.3, w: 5.2, d: 0.2, rate: (w) => (HOURS.both(w.hour) ? 8 : 0), vy: 0.5 });
}

// ------------------------------------------------------------------ Building H
function chassisLines(k, W) {
  const D = W.data;
  D.line = [0, 60]; // seconds of running; line 2 half a period behind line 1
  const runs = [HOURS.both, HOURS.day];
  const groups = [0, 1].map((L) => {
    const z = H.lines[L];
    const n = Math.floor((ST.pit - LINE.x0) / LINE.pitch) + 1;
    return k.part(LINE.x0, RAIL_Y, z, (q) => { for (let i = 0; i < n; i++) modelT(q, i * LINE.pitch, 0, 0, stageAt(LINE.x0 + i * LINE.pitch)); });
  });
  // Engine hoists (op 10): the hook brings the next motor down onto the arriving chassis.
  const hoists = [0, 1].map((L) => ({
    eng: k.part(0, 0, H.lines[L], (q) => modelT(q, 0, 0, 0, { frame: false, engine: true })),
    chain: k.part(0, 3.65, H.lines[L], (q) => { q.cyl(0, -1, 0, 0.012, 1, M.iron, { seg: 3 }); q.box(-0.12, -1.05, -0.12, 0.12, -0.95, 0.12, M.steelDk); }),
    trolley: k.part(0, 3.62, H.lines[L], (q) => q.box(-0.25, 0, -0.18, 0.25, 0.2, 0.18, M.steelDk)),
  }));
  // Wheels coming down the chutes from the wheel room (op 33).
  for (const L of [0, 1]) {
    const z = H.lines[L] + 1.35;
    const dx = CHUTE.x1 - CHUTE.x0, dy = CHUTE.y1 - CHUTE.y0, len = Math.hypot(dx, dy);
    conveyor(k, W, { base: [CHUTE.x0, CHUTE.y0 + WR + 0.05, z], dir: [dx / len, dy / len, 0], n: Math.floor(len / 1.2), pitch: 1.2, speed: 0.04, run: (h) => runs[L](h), item: (q, i, x, y) => wheel(q, x, y, 0, { hub: M.iron }) });
  }
  const x3 = ST.engine - LINE.pitch; // the chassis about to reach the hoist
  W.addMachine((dt, t, w) => {
    for (let L = 0; L < 2; L++) {
      if (runs[L](w.hour)) D.line[L] += dt;
      const u = (D.line[L] * LINE.speed) % LINE.pitch;
      groups[L].position.x = LINE.x0 + u;
      const h = hoists[L], f = u / LINE.pitch;
      let hx, ey, show;
      if (f < 0.25) { hx = ST.engine - (f / 0.25) * (LINE.pitch - 1) + 1.6; ey = RAIL_Y + 2.2; show = false; }
      else { const g = (f - 0.25) / 0.75; hx = x3 + u + 1.6; ey = RAIL_Y + 2.2 * (1 - g); show = true; }
      h.eng.visible = show;
      h.eng.position.set(hx - 1.6, ey, H.lines[L]);
      const hookY = show ? ey + 1.15 : 3.0;
      h.chain.position.x = hx;
      h.chain.scale.y = Math.max(0.05, 3.65 - hookY);
      h.trolley.position.x = hx;
    }
  });
  return groups;
}

// The cars: from the end of the line, down the incline, onto the starter, out of door D,
// along John R Street to the body chute, the idlers, and away (S1 p.139 to 155).
function cars(k, W) {
  const D = W.data;
  const pool = [];
  for (let i = 0; i < 5; i++) {
    const c = { state: 'free', x: 0, y: 0, z: 0, h: 0, t: 0, body: false, roll: 0, spin: 0 };
    c.g = k.part(0, 0, 0, (q) => modelT(q, 0, 0, 0, { axles: true, tank: true, engine: true, dash: true, radiator: true }));
    c.b = k.part(0, 0, 0, (q) => { body(q, 0, 0, 0, M.enamel, true, true); modelT(q, 0, 0, 0, { frame: false, hood: true, fenders: true, lamps: true }); });
    c.wr = k.part(0, 0, 0, (q) => { for (const dz of [-0.71, 0.71]) wheel(q, 0, 0, dz); });
    c.wf = k.part(0, 0, 0, (q) => { for (const dz of [-0.71, 0.71]) wheel(q, 0, 0, dz); });
    pool.push(c);
  }
  D.cars = pool;
  const G = { state: 'idle', t: 0, car: null };
  D.gallows = G;
  const lastWrap = [0, Math.floor(60 / PERIOD)];
  const spawn = (L) => {
    const c = pool.find((p) => p.state === 'free');
    if (!c) return;
    Object.assign(c, { state: 'incline', line: L, t: 0, x: ST.end, z: H.lines[L], y: RAIL_Y, h: 0, body: false });
  };
  const ahead = (c, ds) => pool.some((o) => o !== c && o.state !== 'free' && o.state !== 'incline' && o.state !== 'starter' && Math.abs(o.z - c.z) < 1 && o.x > c.x && o.x - c.x < ds);
  const runs = [HOURS.both, HOURS.day];
  W.addMachine((dt, t, w) => {
    for (let L = 0; L < 2; L++) { const n = Math.floor(D.line[L] / PERIOD); if (n > lastWrap[L]) { lastWrap[L] = n; spawn(L); } }
    for (const c of pool) {
      const on = runs[c.line || 0](w.hour);
      let v = 0;
      c.spin = 0;
      switch (c.state) {
        case 'incline': if (on) { c.t += dt; c.x = ST.end + Math.min(1, c.t / 8) * 8; c.y = RAIL_Y * (1 - Math.min(1, c.t / 8)); v = 1; if (c.t > 8) { c.state = 'starter'; c.t = 0; } } break;
        case 'starter': c.x = ST.starter; c.y = 0; if (on) c.t += dt; c.spin = c.t > 10 && c.t < 42 ? 14 : 0; if (c.t > 45 && !ahead({ x: ST.starter, z: H.lines[0] }, 26) && !pool.some((o) => o.state === 'door')) { c.state = 'door'; c.t = 0; } break;
        case 'door': {
          v = 2.2;
          const tz = H.lines[0];
          if (Math.abs(c.z - tz) > 0.01 && c.x > 286) { c.z += Math.sign(tz - c.z) * Math.min(Math.abs(tz - c.z), dt * 1.6); c.h = Math.atan2(tz - c.z, 2); }
          else c.h = 0;
          c.x += dt * v;
          if (c.x >= X.H1 + 0.5) { c.state = 'track'; c.z = tz; c.h = 0; }
          break;
        }
        case 'track': v = 0.35; if (c.x >= JR.gallows || ahead(c, 4.2)) v = 0; c.x = Math.min(JR.gallows, c.x + dt * v); if (c.x >= JR.gallows && G.state === 'idle') { G.state = 'drop'; G.t = 0; G.car = c; c.state = 'gallows'; } break;
        case 'gallows': if (G.state === 'done' && G.car === c) { c.body = true; c.state = 'creep'; G.state = 'idle'; G.car = null; } break;
        case 'creep': v = 0.3; if (ahead(c, 4.2)) v = 0; c.x = Math.min(JR.idler, c.x + dt * v); if (c.x >= JR.idler) { c.state = 'idler'; c.t = 0; } break;
        case 'idler': c.t += dt; c.spin = c.t > 2 && c.t < 11 ? 10 : 0; if (c.t > 13) { c.state = 'away'; c.t = 0; } break;
        case 'away': {
          c.t += dt; v = 3;
          if (c.x < 326) { c.x += dt * v; c.h = 0; } else { c.z += dt * v; c.h = Math.PI / 2; c.x = 326; }
          if (c.z > 80) c.state = 'free';
          break;
        }
        default: break;
      }
      c.roll += (v * dt) / WR;
      const vis = c.state !== 'free';
      c.g.visible = c.wr.visible = c.wf.visible = vis;
      c.b.visible = vis && c.body;
      c.g.position.set(c.x, c.y, c.z); c.g.rotation.y = -c.h;
      c.b.position.copy(c.g.position); c.b.rotation.y = -c.h;
      const cs = Math.cos(c.h), sn = Math.sin(c.h);
      c.wr.position.set(c.x, c.y + WR, c.z); c.wr.rotation.set(0, -c.h, 0);
      c.wf.position.set(c.x + cs * WB, c.y + WR, c.z + sn * WB); c.wf.rotation.set(0, -c.h, 0);
      c.wr.rotateZ(-(c.roll + (c.spinA = (c.spinA || 0) + c.spin * dt)));
      c.wf.rotateZ(-c.roll);
    }
  });
  // The body comes down the chute, the gallows frame rocks it over the chassis, and it is lowered.
  const [tx, ty] = JR.chuteTop, [bx, byy] = JR.chuteBot;
  const bodyG = k.part(0, 0, 0, (q) => body(q, 0, -0.66, 0, M.enamel, true, true));
  const beam = k.part(JR.gallows, 6.1, JR.track, (q) => {
    const tim = mat({ c: '#8a6a44', c2: '#7a5a38', pat: 'grain', cut: '#5a4228' });
    q.box(-0.12, -0.12, -1.7, 0.12, 0.12, 1.8, tim);
    for (const z of [-1.6, 1.7]) q.box(-0.1, -1.6, z - 0.1, 0.1, 0, z + 0.1, tim);
    q.box(-0.1, -1.7, -1.7, 0.1, -1.5, 1.8, tim);
  });
  const slings = k.part(0, 0, 0, (q) => { for (const [dx, dz] of [[-0.6, -0.6], [-0.6, 0.6], [0.9, -0.6], [0.9, 0.6]]) q.beam([0, 0, 0], [dx, -1.25, dz], 0.025, mat({ c: '#b8955a', cut: '#7a6a40' })); });
  const slope = Math.atan2(ty - byy, tx - bx);
  W.addMachine((dt) => {
    let px = tx, py = ty, rot = slope, sl = false, ang = 0.22, vis = false;
    if (G.state === 'drop') {
      G.t += dt;
      const T = G.t;
      vis = true;
      if (T < 3) { px = tx + 1.2; py = ty; rot = 0; }
      else if (T < 13) { const f = (T - 3) / 10; px = tx + (bx - tx) * f; py = ty + (byy - ty) * f; }
      else if (T < 21) { const f = (T - 13) / 8; px = bx + (JR.gallows - bx) * f; py = byy + Math.sin(f * Math.PI) * 0.5; rot = slope * (1 - Math.min(1, f * 2)); sl = true; ang = 0.22 * (1 - f) - 0.05 * Math.sin(f * Math.PI); }
      else if (T < 34) { const f = (T - 21) / 13; px = JR.gallows; py = byy + (0.66 - byy) * f; rot = 0; sl = true; ang = 0; }
      else { px = JR.gallows; py = 0.66; rot = 0; ang = 0; sl = T < 36; if (T > 37) { G.state = 'done'; vis = false; } }
    }
    bodyG.visible = vis;
    bodyG.position.set(px, py, JR.track);
    bodyG.rotation.z = rot;
    beam.rotation.z = ang;
    slings.visible = sl;
    slings.position.set(px, py + 1.95, JR.track);
  });
  // Exhaust: blue haze at the starters and on the street.
  for (const z of H.lines.slice(0, 2)) W.emitter({ kind: 'smoke', x: ST.starter - 0.6, y: 0.4, z: z - 0.4, w: 0.4, d: 0.4, rate: (w) => (pool.some((c) => c.state === 'starter' && Math.abs(c.z - z) < 0.5 && c.spin) ? 2.5 : 0), vy: 0.3, size: [0.3, 1.6], color: '#9aa4b4' });
  W.emitter({ kind: 'smoke', x: JR.idler - 0.5, y: 0.4, z: JR.track - 0.4, w: 0.4, d: 0.4, rate: (w) => (pool.some((c) => c.state === 'idler') ? 3 : 0), vy: 0.3, size: [0.3, 1.8], color: '#9aa4b4' });
}

function upperH(k, W) {
  // Dash line (2nd floor), 72 in a minute.
  conveyor(k, W, { base: [DASH2.x0 + 0.4, DASH2.y, DASH2.z], n: Math.floor((DASH2.x1 - DASH2.x0) / DASH2.pitch), pitch: DASH2.pitch, speed: DASH2.speed, run: HOURS.both, item: (q, i, x) => {
    q.box(x - 0.04, 0, -0.5, x + 0.04, 0.7, 0.5, mat({ c: '#6a4428', c2: '#5a3820', pat: 'grain', cut: '#3a2414' }));
    q.box(x - 0.3, 0, -0.3, x + 0.3, 0.05, 0.3, M.castIron);
    if (i > 4) q.cyl(x - 0.06, 0.45, -0.2, 0.06, 0.04, M.brass, { axis: 'x', seg: 8 });
    if (i > 10) q.beam([x - 0.04, 0.4, 0.2], [x - 0.6, 0.9, 0.2], 0.035, M.black);
  } });
  // Wheels rolling down the gravity track to the spinners (3rd floor).
  const w = WHEEL3, dx = w.x1 - w.x0, dy = w.y1 - w.y0, len = Math.hypot(dx, dy);
  conveyor(k, W, { base: [w.x0, w.y0 + WR - 0.05, w.z], dir: [dx / len, dy / len, 0], n: Math.floor(len / w.pitch), pitch: w.pitch, speed: 0.12, run: HOURS.both, item: (q, i, x, y) => wheel(q, x, y, 0, { hub: M.iron }) });
  const spins = SPIN.map((s) => k.part(s.x, H.y[2] + 1.6, s.z, (q) => {
    q.cyl(0, 0.2, 0, 0.03, 0.8, M.steel, { seg: 5 });
    const tor = new THREE.TorusGeometry(WR - 0.04, 0.045, 5, 14); tor.rotateX(Math.PI / 2);
    q.geo(tor, new THREE.Matrix4(), mat({ c: '#1e1c1a', cut: '#121110' }));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; q.beam([Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32], [-Math.cos(a) * 0.32, 0, -Math.sin(a) * 0.32], 0.035, mat({ c: '#1e1c1a' })); }
  }));
  // Fender oven chain, presses (4th floor).
  conveyor(k, W, { base: [OVEN.x0 + 0.5, OVEN.y + 2.5, OVEN.z], n: Math.floor((OVEN.x1 - OVEN.x0) / OVEN.pitch), pitch: OVEN.pitch, speed: 0.05, run: HOURS.both, item: (q, i, x) => {
    q.cyl(x, -0.5, 0, 0.01, 0.5, M.iron, { seg: 3 });
    q.extrude([[x - 0.6, -1.4], [x - 0.5, -0.95], [x, -0.75], [x + 0.5, -0.95], [x + 0.6, -1.4], [x + 0.5, -1.4], [x + 0.42, -1.0], [x, -0.84], [x - 0.42, -1.0], [x - 0.5, -1.4]], -0.15, 0.15, M.enamel);
  } });
  const rams = PRESS.map((p) => k.part(p.x, H.y[3] + 2.2, p.z, (q) => { q.box(-0.6, 0, -0.45, 0.6, 0.9, 0.45, M.machineLt); q.box(-0.12, 0.9, -0.12, 0.12, 1.1, 0.12, M.bright); }));
  W.addMachine((dt, t, wd) => {
    const on = HOURS.both(wd.hour);
    spins.forEach((g, i) => { const f = ((t + i * 3) % 9) / 9; g.position.y = H.y[2] + 1.6 + (f < 0.3 ? -0.7 * Math.sin((f / 0.3) * Math.PI) : 0); g.rotation.y += on && f >= 0.3 ? dt * 22 : 0; });
    rams.forEach((g, i) => { const f = (t * 0.4 + i * 0.5) % 1; g.position.y = H.y[3] + 2.2 - (on && f < 0.14 ? 1.25 * Math.sin((f / 0.14) * Math.PI) : 0); });
  });
}

// ------------------------------------------------------------------ the new building and the craneway
function newBuilding(k, W) {
  // Paint line: bare metal, brown primer, then blue-black (S1 p.360 to 362).
  const P = NL.paint;
  const colour = (x) => (x < 352 ? M.bareBody : x < 376 ? M.primer : M.blueBlack);
  conveyor(k, W, { base: [P.x0, P.y + 0.38, P.z], n: Math.floor((P.x1 - P.x0) / P.pitch), pitch: P.pitch, speed: P.speed, run: HOURS.both, item: (q, i, x) => body(q, x - 0.2, -0.66 + 0.02, 0, colour(P.x0 + x), false, false) });
  // Top line: windshields and tops go on as the bodies move west (S1 p.368 to 370).
  const T = NL.top;
  const tn = Math.floor((T.x1 - T.x0) / T.pitch);
  conveyor(k, W, { base: [T.x1 - 1, T.y + 0.38, T.z], dir: [-1, 0, 0], n: tn, pitch: T.pitch, speed: 2 / 60, run: HOURS.both, item: (q, i, x) => body(q, x - 0.2, -0.66 + 0.02, 0, M.enamel, i > tn * 0.45, true) });
  // Upholstery line.
  const U = NL.uph;
  const uph = { base: [U.x0, U.y + 0.38, U.z], n: Math.floor((U.x1 - U.x0) / U.pitch), pitch: U.pitch, speed: 1.5 / 60, run: HOURS.both, item: (q, i, x) => body(q, x - 0.2, -0.66 + 0.02, 0, M.enamel, false, i > 4) };
  conveyor(k, W, uph);
  W.data.uph = uph;
  // Cushion line, about 8 ft a minute (S1 p.371).
  const C = NL.cush;
  conveyor(k, W, { base: [C.x0 + 0.3, C.y + 0.8, C.z], n: Math.floor((C.x1 - C.x0) / C.pitch), pitch: C.pitch, speed: 8 * 0.3048 / 60, run: HOURS.both, item: (q, i, x) => q.box(x - 0.32, 0, -0.3, x + 0.32, 0.12 + (i > 8 ? 0.06 : 0), 0.3, i > 8 ? M.leather : mat({ c: '#b8a07a', c2: '#a08a68', pat: 'speckle' })) });
  // Two 5-ton cranes with four-cable suspension (S1 p.399 to 401).
  const zc = (N.cw0 + N.cw1) / 2;
  const cranes = [0, 1].map((i) => {
    const bridge = k.part(0, N.craneRail, 0, (q) => {
      for (const s of [-0.6, 0.6]) q.box(s - 0.2, 0, N.cw0 + 0.4, s + 0.2, 0.9, N.cw1 - 0.4, mat({ c: '#4a4e3e', c2: '#3a3e30', pat: 'rivets', s: 0.4, cut: '#2a2e22' }));
      for (const z of [N.cw0 + 0.5, N.cw1 - 0.5]) q.box(-1.2, -0.2, z - 0.4, 1.2, 0.9, z + 0.4, M.steelDk);
    });
    const trolley = k.part(0, N.craneRail + 0.9, 0, (q) => {
      q.box(-0.9, 0, -0.9, 0.9, 0.7, 0.9, M.steelDk);
      q.box(-0.8, -2.4, -1.3, 0.6, -0.1, -0.3, mat({ c: '#4a4e3e', cut: '#2a2e22' }));
      q.box(-0.7, -1.7, -1.31, 0.5, -0.9, -1.29, mat({ c: '#a8bcc4', c2: '#ffd890', glow: 'night' }));
    });
    const hook = k.part(0, 0, 0, (q) => {
      for (const [dx, dz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) q.cyl(dx, 0, dz, 0.01, 1, M.iron, { seg: 3 });
      q.box(-0.4, -0.2, -0.4, 0.4, 0, 0.4, M.steelDk);
    });
    const load = k.part(0, 0, 0, (q) => {
      q.box(-0.8, -1.2, -0.6, 0.8, -0.3, 0.6, mat({ c: '#b08a52', c2: '#8a6a3a', pat: 'planks', s: 0.2 }));
      for (const s of [-1, 1]) q.beam([0, -0.2, 0], [s * 0.75, -0.32, 0], 0.02, M.iron);
    });
    return { bridge, trolley, hook, load, i };
  });
  W.data.cranes = cranes;
  // Stages the cranes visit: [x, floor y, side z].
  const visits = [[338.1, N.y[2], N.cw0 + 1.2], [366.15, N.y[4], N.cw1 - 1.2], [354.1, N.y[3], N.cw0 + 1.2], [378.35, N.y[1], N.cw1 - 1.2], [348.25, N.y[5], N.cw0 + 1.2], [390.55, N.y[4], N.cw1 - 1.2]];
  W.addMachine((dt, t, w) => {
    const on = HOURS.both(w.hour);
    for (const c of cranes) {
      const cyc = 80, tt = on ? t + c.i * 40 : 0, n = Math.floor(tt / cyc), f = (tt % cyc) / cyc;
      const v = visits[(n * 2 + c.i) % visits.length];
      const home = [c.i ? 382 : 356, 1.4, zc];
      // Phases: lift from the car, travel, lower to the stage, return.
      let x, z, y, carry = true;
      const top = N.craneRail - 3.0;
      if (f < 0.2) { x = home[0]; z = home[2]; y = home[1] + (top - home[1]) * (f / 0.2); }
      else if (f < 0.45) { const g = (f - 0.2) / 0.25; x = home[0] + (v[0] - home[0]) * g; z = home[2] + (v[2] - home[2]) * g; y = top; }
      else if (f < 0.6) { const g = (f - 0.45) / 0.15; x = v[0]; z = v[2]; y = top + (v[1] + 1.3 - top) * g; }
      else if (f < 0.65) { x = v[0]; z = v[2]; y = v[1] + 1.3; carry = false; }
      else if (f < 0.9) { const g = (f - 0.65) / 0.25; x = v[0] + (home[0] - v[0]) * g; z = v[2] + (home[2] - v[2]) * g; y = top; carry = false; }
      else { const g = (f - 0.9) / 0.1; x = home[0]; z = home[2]; y = top + (home[1] + 1.3 - top) * g; carry = false; }
      c.bridge.position.x = x;
      c.trolley.position.set(x, N.craneRail + 0.9, z);
      const hy = y + 0.3;
      c.hook.position.set(x, hy, z);
      c.hook.scale.set(1, Math.max(0.1, N.craneRail + 0.9 - hy), 1);
      c.hook.children.forEach(() => {});
      c.load.visible = carry;
      c.load.position.set(x, hy, z);
    }
  });
  // The elevator, between floors.
  const L = NL.lift;
  const lift = k.part(L.x, 0, L.z, (q) => {
    q.box(-1.15, 0, -1.15, 1.15, 0.12, 1.15, M.steelDk);
    q.box(-1.15, 2.3, -1.15, 1.15, 2.4, 1.15, M.steelDk);
    for (const [dx, dz] of [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]]) q.box(dx - 0.04, 0, dz - 0.04, dx + 0.04, 2.3, dz + 0.04, M.steelDk);
    q.box(-1.12, 0.12, 1.08, 1.12, 1.1, 1.12, mat({ c: '#7a7a72', c2: '#3a3a3a', pat: 'bars', s: 0.1 }));
    q.box(-0.5, 0.12, -0.4, 0.5, 0.8, 0.4, mat({ c: '#b08a52', c2: '#8a6a3a', pat: 'planks', s: 0.2 }));
    q.cyl(0, 2.4, 0, 0.012, 30, M.iron, { seg: 3 });
  });
  W.data.lift = { y: 0 };
  W.addMachine((dt, t, w) => {
    const cyc = 22 * N.y.length, f = (t % (cyc * 2)) / cyc;
    const pos = f < 1 ? f : 2 - f;
    const fl = pos * (N.y.length - 1), i = Math.floor(fl), fr = fl - i;
    const y = i >= N.y.length - 1 ? N.y[N.y.length - 1] : N.y[i] + (N.y[i + 1] - N.y[i]) * Math.min(1, Math.max(0, (fr - 0.6) / 0.4));
    lift.position.y = HOURS.both(w.hour) ? y : 0;
    W.data.lift.y = lift.position.y;
  });
  // Sirocco fans in the roof penthouses, 218 rpm (S1 p.412 to 414).
  const fans = NL.fans.map((x) => k.part(x + 0.5, N.roof + 2.3, 0.6, (q) => {
    q.cyl(0, 0, -0.4, 1.3, 0.1, M.steelDk, { axis: 'z', seg: 16 });
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; q.box(Math.cos(a) * 1.1 - 0.05, Math.sin(a) * 1.1 - 0.25, -0.4, Math.cos(a) * 1.1 + 0.05, Math.sin(a) * 1.1 + 0.25, 1.4, M.steel); }
    q.cyl(0, 0, -0.5, 0.2, 2.0, M.steelDk, { axis: 'z', seg: 8 });
  }));
  W.addMachine((dt, t) => { fans.forEach((g) => { g.rotation.z = t * 218 / 60 * Math.PI * 2 * 0.25; }); });
  // A belt-line switch engine, moving cars mainly at night (S1 p.407).
  const sw = k.part(440, N.track, zc, (q) => {
    const bl = mat({ c: '#24221f', c2: '#302d29', cut: '#141210' });
    q.box(-4, 1.0, -1.3, 4, 1.25, 1.3, bl);
    q.cyl(-3.6, 2.2, 0, 0.85, 4.6, bl, { axis: 'x', seg: 12 });
    q.cyl(-2.6, 3.05, 0, 0.3, 1.0, bl, { seg: 8 });
    q.cyl(-0.4, 3.0, 0, 0.28, 0.5, M.brass, { seg: 8 });
    q.box(1.0, 1.25, -1.3, 3.9, 4.0, 1.3, bl);
    q.box(1.1, 2.6, -1.31, 3.8, 3.4, -1.29, mat({ c: '#a8bcc4', c2: '#ffd890', glow: 'night' }));
    q.box(0.9, 4.0, -1.45, 4.0, 4.2, 1.45, bl);
    for (const x of [-2.6, -1.0, 0.6]) for (const s of [-0.72, 0.72]) q.cyl(x, 0.62, s - 0.07, 0.6, 0.12, M.red, { axis: 'z', seg: 12 });
    q.lamp(-4.1, 2.4, 0, { r: 9, i: 0.9, color: '#ffe0a0', bulbR: 0.14, halo: 1.2 });
  });
  const chuff = W.emitter({ kind: 'smoke', x: 437, y: N.track + 3.6, z: zc, w: 0.4, d: 0.4, rate: 0, vy: 2.2, size: [0.8, 4.5], color: '#5a5654' });
  W.addMachine((dt, t, w) => {
    const night = w.hour >= 21 || w.hour < 5;
    const f = (t % 120) / 120;
    const x = 445 + Math.sin(f * Math.PI * 2) * 14;
    sw.position.x = night ? x : 470;
    chuff.x = sw.position.x - 2.6;
    chuff.rate = night ? 3 + 4 * Math.abs(Math.cos(f * Math.PI * 2)) : 0.4;
  });
}

// ------------------------------------------------------------------ life
function life(k, W) {
  // A horse-drawn delivery wagon on Woodward Avenue (illustrative).
  const horse = k.part(0, 0, 0, (q) => {
    const hm = mat({ c: '#5a3e2a', c2: '#4a3222', cut: '#2a1a12' });
    q.sphere(0, 1.25, 0, 0.42, hm, { seg: 8, rings: 6 });
    q.box(-0.75, 1.0, -0.28, 0.6, 1.5, 0.28, hm);
    q.beam([0.6, 1.4, 0], [1.05, 1.95, 0], 0.22, hm);
    q.box(0.95, 1.75, -0.12, 1.4, 2.0, 0.12, hm);
    for (const [x, s] of [[0.45, -0.18], [0.45, 0.18], [-0.6, -0.18], [-0.6, 0.18]]) q.beam([x, 1.05, s], [x, 0, s], 0.09, hm);
    const wg = mat({ c: '#3a4a3a', c2: '#2e3c2e', cut: '#1a221a' });
    q.box(-4.2, 0.85, -0.85, -1.4, 2.4, 0.85, wg);
    q.box(-4.2, 2.4, -0.9, -1.4, 2.5, 0.9, M.iron);
    for (const x of [-3.8, -1.8]) for (const s of [-0.85, 0.85]) q.cyl(x, 0.5, s - 0.04, 0.5, 0.08, M.woodDk, { axis: 'z', seg: 10 });
    q.beam([-1.4, 1.1, -0.35], [0.4, 1.2, -0.35], 0.05, M.woodDk);
    q.beam([-1.4, 1.1, 0.35], [0.4, 1.2, 0.35], 0.05, M.woodDk);
  });
  W.addMachine((dt, t) => {
    const f = (t % 140) / 140;
    horse.position.set(-19, 0, 92 - f * 100);
    horse.rotation.y = Math.PI / 2;
    horse.visible = f < 0.97;
  });
  // The watchman's cat in the warm power-house basement (illustrative).
  const cat = k.part(0, 0, 0, (q) => {
    const c = mat('#4a4038');
    q.sphere(0, 0.13, 0, 0.13, c, { seg: 8, rings: 5 });
    q.sphere(0.16, 0.2, 0, 0.075, c, { seg: 8, rings: 5 });
    q.cyl(-0.12, 0.15, 0, 0.018, 0.22, c, { axis: 'x', seg: 4 });
  });
  W.addActor({ object: cat, update(dt, t, w) {
    const nightish = w.hour > 20 || w.hour < 6;
    if (nightish) { cat.position.set(17 + Math.sin(t * 0.07) * 6, -4.5, 17.4); cat.rotation.y = Math.cos(t * 0.07) > 0 ? 0 : Math.PI; }
    else { cat.position.set(26.5, -2.0 + 0.36, 17.9); cat.rotation.y = 0.4; }
  } });
  // Sparrows in the craneway trusses (illustrative).
  for (let i = 0; i < 4; i++) {
    const bird = k.part(0, 0, 0, (q) => { q.sphere(0, 0.05, 0, 0.06, mat('#6a5a48'), { seg: 6, rings: 4 }); q.sphere(0.06, 0.09, 0, 0.035, mat('#6a5a48'), { seg: 5, rings: 3 }); });
    const home = [342 + i * 14.3, N.parapet + 0.25, N.cw0 + 0.1 + (i % 2) * 12];
    W.addActor({ object: bird, update(dt, t) {
      const f = ((t * 0.05 + i * 0.37) % 1);
      if (f < 0.85) { bird.position.set(home[0] + Math.sin(t * 0.3 + i) * 0.1, home[1], home[2]); bird.rotation.y = Math.floor(t * 0.4 + i) % 2 ? 0 : Math.PI; }
      else { const g = (f - 0.85) / 0.15; bird.position.set(home[0] + g * 8, home[1] + Math.sin(g * Math.PI) * 2.5, home[2] + g * 3); }
    } });
  }
  // Chimney smoke from the stacks that were working (two of five, illustrative).
  for (const x of [12, 22.4]) W.emitter({ kind: 'smoke', x, y: 60.5, z: 24, w: 1.4, d: 1.4, rate: 2.2, vy: 1.6, vx: 0.8, size: [2, 12], color: '#6a6460' });
  W.emitter({ kind: 'smoke', x: 17.2, y: 60.5, z: 24, w: 1.4, d: 1.4, rate: 0.8, vy: 1.4, vx: 0.8, size: [2, 9], color: '#8a8480' });
}

export function setupMachines(W, k) {
  engines(k, W);
  carriers(k, W);
  foundryLife(k, W);
  shopMachines(k, W);
  chassisLines(k, W);
  cars(k, W);
  upperH(k, W);
  newBuilding(k, W);
  life(k, W);
  void SAW;
}
