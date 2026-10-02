/* The Car Factory: interiors of the power house, the gray-iron foundry and the heat-treat building. */
import { mat, props } from '../../engine/index.js';
import { X, SAW, P, M, reflector, railX, railZ, hcol, belt } from './common.js';
import { stairsX } from './shell.js';

const engGreen = mat({ c: '#2e3a34', c2: '#3a4840', cut: '#1a221e' });
const engBright = mat({ c: '#9aa0a4', c2: '#b8bec2', cut: '#5a6064' });

// Moving-part anchors, read by machines.js.
export const PH = {
  big: { crank: [23.4, 1.55, 0], z: 5.5, r: 0.9, rod: 3.5, fly: 7.8, flyR: 2.9, gen: 10.2 },
  small: { crank: [18.4, 1.25, 0], z: 15, r: 0.65, rod: 2.6, fly: 13.1, flyR: 2.2, gen: 17.2 },
};
export const CUPOLAS = [38.0, 40.7, 43.4, 46.1];
export const CUP5 = 48.8, CUPZ = 0.55, CUPR = 1.05;
export const CARRIER = { xa: 63.5, xb: 74.5, r: 1.545, zA: 2.6, zB: 13.6, y: 4.05 };
export const CORE = { x: 98.5, y: 2.2, z: 1.4 };
export const MONO = { y: 5.6, z: 1.0, x0: 52, x1: 190 };

// ------------------------------------------------------------------ power house
function powerHouse(k) {
  const B = PH.big, S = PH.small;
  // Foundations rising from the basement floor.
  k.box(10, P.base, 4.0, 21.2, 0, 7.0, M.concreteDk);
  k.box(21.2, P.base, 3.6, 27, -1.6, 12.2, M.concreteDk);
  k.box(10.6, P.base, 14.0, 16.4, 0, 16.0, M.concreteDk);
  // --- the 5,000 hp gas engine (S1 p.4): tandem cylinders, crosshead, crank, flywheel, generator.
  k.box(10.2, 0, 4.3, 21.6, 0.75, 6.7, engGreen);
  const cy = B.crank[1], cz = B.z;
  for (const [a, b] of [[10.6, 14.2], [15.2, 18.8]]) {
    k.cyl(a, cy, cz, 0.88, b - a, engGreen, { axis: 'x', seg: 16 });
    for (let x = a + 0.4; x < b; x += 0.9) k.cyl(x, cy, cz, 0.92, 0.12, M.castIron, { axis: 'x', seg: 16 });
    k.box(a + 0.6, cy + 0.85, cz - 0.35, b - 0.6, cy + 1.25, cz + 0.35, M.castIron);
    k.cyl((a + b) / 2 - 0.6, cy + 1.25, cz, 0.18, 0.7, engBright, { seg: 8 });
    k.cyl((a + b) / 2 + 0.6, cy + 1.25, cz, 0.18, 0.7, engBright, { seg: 8 });
    k.cyl((a + b) / 2, -2.5, cz - 0.6, 0.28, 2.6, M.iron, { seg: 8 }); // exhaust down to the basement
  }
  k.cyl(14.2, cy, cz, 0.42, 1.0, M.castIron, { axis: 'x', seg: 10 });
  k.box(18.8, 0.75, cz - 0.55, 21.6, cy + 0.45, cz + 0.55, engGreen);
  k.box(19.0, cy - 0.12, cz - 0.6, 21.4, cy + 0.12, cz - 0.55, engBright);
  // Main bearings and crankshaft.
  for (const z of [4.6, 6.6, 9.0, 11.6]) k.box(22.6, -1.6, z - 0.3, 24.2, cy - 0.1, z + 0.3, engGreen);
  k.cyl(B.crank[0], cy, 4.0, 0.22, 8.2, engBright, { axis: 'z', seg: 10 });
  // Generator stator around the armature.
  k.cyl(B.crank[0], cy + 0.3, B.gen - 0.55, 2.15, 1.1, mat({ c: '#3a4a44', c2: '#2e3c36', cut: '#1e2824' }), { axis: 'z', seg: 22 });
  k.box(B.crank[0] - 2.3, -1.6, B.gen - 0.6, B.crank[0] + 2.3, -0.4, B.gen + 0.6, engGreen);
  // Railed walkway alongside the cylinders.
  k.box(10.4, 2.7, 6.8, 19.2, 2.8, 7.6, mat({ c: '#4a4a4a', c2: '#3a3a3a', pat: 'grate' }));
  railX(k, 10.4, 19.2, 2.8, 7.55, 1.0, 1.4);
  for (const x of [10.6, 14.8, 19.0]) k.cyl(x, 0, 7.5, 0.05, 2.7, M.iron, { seg: 5 });
  props.ladder(k, 19.6, 0, 2.8, 7.2, { w: 0.5, color: '#3a3a3a' });
  // --- the 1,500 hp engine with its 850 kW dynamo and air compressor.
  k.box(11, 0, 14.2, 19.6, 0.6, 15.8, engGreen);
  k.cyl(11.4, S.crank[1], S.z, 0.68, 3.4, engGreen, { axis: 'x', seg: 14 });
  for (let x = 11.7; x < 14.8; x += 0.8) k.cyl(x, S.crank[1], S.z, 0.72, 0.1, M.castIron, { axis: 'x', seg: 14 });
  k.box(14.8, 0.6, S.z - 0.42, 16.9, S.crank[1] + 0.35, S.z + 0.42, engGreen);
  for (const z of [13.9, 15.8, 17.9]) k.box(17.8, -0.6, z - 0.25, 19.0, S.crank[1] - 0.1, z + 0.25, engGreen);
  k.cyl(S.crank[0], S.crank[1], 12.3, 0.17, 6.2, engBright, { axis: 'z', seg: 10 });
  k.cyl(S.crank[0], S.crank[1] + 0.2, S.gen - 0.45, 1.5, 0.9, mat({ c: '#3a4a44', c2: '#2e3c36', cut: '#1e2824' }), { axis: 'z', seg: 18 });
  k.cyl(20.2, S.crank[1], S.z, 0.52, 3.4, M.castIron, { axis: 'x', seg: 12 });
  k.box(20.4, 0, S.z - 0.5, 23.4, 0.7, S.z + 0.5, engGreen);
  k.cyl(21.9, S.crank[1] + 0.5, S.z, 0.25, 1.2, M.castIron, { seg: 8 });
  // Air receiver tank.
  k.cyl(25.5, 0, 16.8, 0.7, 3.4, M.steelDk, { seg: 12 });
  k.sphere(25.5, 3.4, 16.8, 0.7, M.steelDk, { seg: 12, rings: 5, t0: Math.PI / 2 });
  // Switchboard: marble panels with meters and knife switches.
  k.box(27.6, 0, 18.7, 35.2, 0.3, 19.2, M.iron);
  k.box(27.6, 0.3, 18.9, 35.2, 2.8, 19.2, M.marble);
  for (let x = 28.1; x < 35; x += 0.95) {
    for (const y of [2.3, 1.85]) k.cyl(x, y, 18.88, 0.13, 0.05, mat({ c: '#f2ecdc', c2: '#1a1a1a', cut: '#8a8478' }), { axis: 'z', seg: 10 });
    k.box(x - 0.2, 1.2, 18.82, x + 0.2, 1.5, 18.9, M.iron);
    k.box(x - 0.12, 1.25, 18.75, x - 0.08, 1.6, 18.82, M.brass);
    k.box(x + 0.08, 1.25, 18.75, x + 0.12, 1.6, 18.82, M.brass);
  }
  railX(k, 27.4, 35.3, 0, 17.7, 0.95, 1.6);
  props.desk(k, 25.6, 0, 16.6, { w: 1.4, top: '#6a4a2e' });
  props.chair(k, 25.4, 0, 17.4, { face: -1 });
  props.clock(k, 31.4, 3.6, 19.2, { r: 0.3 });
  // Oil cans and a tool board.
  for (let i = 0; i < 4; i++) k.cyl(9.4 + i * 0.3, 0, 18.6, 0.09, 0.3, i % 2 ? M.brass : M.red, { seg: 7 });
  k.box(9.2, 1.2, 19.1, 12.2, 2.6, 19.2, M.woodDk);
  // Basement: exhaust mains and water piping.
  k.cyl(9.0, -2.4, 4.9, 0.34, 26.2, M.iron, { axis: 'x', seg: 10 });
  k.cyl(9.0, -1.2, 18.4, 0.16, 26.2, M.green, { axis: 'x', seg: 8 });
  k.cyl(9.0, -1.6, 18.9, 0.12, 26.2, M.steel, { axis: 'x', seg: 8 });
  k.cyl(9.0, -2.8, 13.2, 0.26, 12, M.iron, { axis: 'x', seg: 8 });
  for (const x of [12, 18, 30]) { k.cyl(x, -3.6, 18.2, 0.35, 1.0, M.green, { seg: 10 }); k.cyl(x, -1.6, 18.2, 0.06, 1.2, M.brass, { seg: 6 }); }
  props.ladder(k, 34.4, P.base, 0, 18.0, { w: 0.5, color: '#3a3a3a' });
  // Lamps: hall and basement.
  for (let x = 11; x < 35; x += 6) for (const z of [3, 10.5, 17]) reflector(k, x, P.hall, z, { drop: 1.4, r: 7, i: 0.9, big: true });
  for (let x = 11; x < 35; x += 7) k.lamp(x, -0.8, 9 + (x % 2) * 4, { r: 5, i: 0.8, color: '#ffd080', bulbR: 0.07 });
  // The construction floor: a few lanterns left on the planks.
  k.lamp(24, 14.7, 4, { r: 3, i: 0.5, color: '#ffc070', bulbR: 0.05 });
}

// ------------------------------------------------------------------ foundry
function cupola(k, x, i, live) {
  const z = CUPZ, R = CUPR, r = R - 0.22;
  const top = live ? 18 : 9.4;
  const shell = mat({ c: '#2a2826', c2: '#3a3634', pat: 'plates', s: 0.7, cut: '#4a2a20' });
  const lining = mat({ c: '#b86a40', c2: '#a05a34', pat: 'brick', s: 0.8, cut: '#c87a48', cutPat: true });
  for (const [dx, dz] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.9], [0.7, 0.9]]) k.box(x + dx - 0.08, 0, z + dz - 0.08, x + dx + 0.08, 0.95, z + dz + 0.08, M.iron);
  k.cyl(x, 0.95, z, R + 0.1, 0.12, M.iron, { seg: 18 });
  // Shell and firebrick lining, with the charging door gap facing east.
  const ring = (y0, y1, a0, a1) => {
    const o = a0 == null ? {} : { a0, a1 };
    k.lathe([[R, y0], [R, y1], [r, y1], [r, y0]], x, z, shell, Object.assign({ seg: 20, capTop: false, capBot: false, matFn: (s) => (s === 2 ? lining : shell) }, o));
  };
  ring(1.07, 6.9);
  if (live) {
    ring(6.9, 8.2, 0.55, Math.PI * 2 - 0.55);
    ring(8.2, top);
    k.cyl(x, top, z, R + 0.15, 0.1, M.iron, { seg: 18 });
    k.cyl(x, top + 0.9, z, 0.5, 1.0, M.iron, { r2: R + 0.25, seg: 14 });
    k.cyl(x, top + 1.9, z, 0.08, 0.4, M.iron, { seg: 4 });
    // The charge: a glowing bed, then alternate layers of coke and pig iron up to the door.
    k.cyl(x, 1.07, z, r, 0.18, M.sand, { seg: 16 });
    k.cyl(x, 1.25, z, r, 0.8, M.glowIron, { seg: 16 });
    let y = 2.05, n = 0;
    while (y < 6.9) { const h = n % 2 ? 0.32 : 0.48; k.cyl(x, y, z, r, Math.min(h, 6.9 - y), n % 2 ? M.pig : M.coke, { seg: 16 }); y += h; n++; }
    // Wind box and tuyeres.
    k.lathe([[R + 0.02, 1.6], [R + 0.32, 1.7], [R + 0.32, 2.3], [R + 0.02, 2.4]], x, z, M.iron, { seg: 18, capTop: false, capBot: false });
    // Tap spout towards the east.
    k.boxR(x + R + 0.35, 1.32, z + 0.2, 0.75, 0.12, 0.26, mat({ c: '#4a3a30', cut: '#2a1a14' }), { z: -0.12 });
    k.boxR(x + R + 0.35, 1.37, z + 0.2, 0.7, 0.03, 0.12, M.glowIron, { z: -0.12 });
    k.lamp(x + 0.2, 1.6, z + 1.2, { always: true, r: 3.4, i: 0.75, color: '#ff8a40', bulb: false, halo: 0.6, flicker: true });
    k.lamp(x + 0.2, 7.6, z + 1.0, { always: true, r: 2.2, i: 0.4, color: '#ff9a50', bulb: false, halo: 0.3, flicker: true });
  } else {
    // The fifth cupola being placed: shell part-built, timber staging and a chain block.
    for (const [dx, dz] of [[-1.5, -0.2], [1.5, -0.2], [-1.5, 2.0], [1.5, 2.0]]) k.cyl(x + dx, 0, z + dz, 0.06, top + 1.2, M.wood, { seg: 4 });
    for (const yy of [3, 5.5]) k.box(x - 1.6, yy, z + 1.4, x + 1.6, yy + 0.06, z + 2.1, M.lumber);
    k.box(x - 1.6, top + 1.2, z + 0.8, x + 1.6, top + 1.4, z + 1.0, M.woodDk);
    k.cyl(x, top - 1.2, z + 0.9, 0.012, 2.4, M.iron, { seg: 3 });
  }
}

function foundry(k) {
  const S = SAW.F;
  // Charging stage, with the blower room underneath (S1 p.354 to 358).
  const sy = 6.5;
  k.box(36.4, sy - 0.3, 1.75, 50.6, sy, 12, M.concrete, { top: mat({ c: '#4a4844', c2: '#3a3836', pat: 'grate' }) });
  const gaps = [36.4].concat(CUPOLAS.map((x) => x - CUPR - 0.05)).concat([CUP5 - CUPR - 0.05]);
  for (let i = 0; i < CUPOLAS.length + 1; i++) {
    const a = i === 0 ? 36.4 : (i <= CUPOLAS.length ? CUPOLAS[i - 1] : CUP5) + CUPR + 0.05;
    const b = i < CUPOLAS.length ? CUPOLAS[i] - CUPR - 0.05 : CUP5 - CUPR - 0.05;
    if (b > a) k.box(a, sy - 0.3, -3, b, sy, 1.75, M.concrete, { top: mat({ c: '#4a4844', c2: '#3a3836', pat: 'grate' }) });
  }
  void gaps;
  for (const x of [36.8, 42.0, 47.5, 50.3]) for (const z of [2.0, 7.0, 11.7]) hcol(k, x, z, 0, sy - 0.3, M.steelDk, 0.28);
  railZ(k, 50.5, 1.8, 12, sy, 1.0, 1.4);
  railX(k, 36.4, 50.5, sy, 11.9, 1.0, 1.4);
  stairsX(k, 57.6, 0, 50.6, sy, 10.6, 11.8);
  CUPOLAS.forEach((x, i) => cupola(k, x, i, true));
  cupola(k, CUP5, 4, false);
  // Coke and pig iron on the stage, charging barrows.
  const r = k.rng('stage');
  for (let i = 0; i < 26; i++) k.boulder(37.5 + r() * 4, sy + 0.2, 6 + r() * 4.5, 0.35 + r() * 0.3, 0.25, 0.35, M.coke, i);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) k.box(43 + i * 0.16, sy + j * 0.1, 7 + (j % 2) * 0.1, 43.1 + i * 0.16, sy + 0.1 + j * 0.1, 8.1, M.pig);
  for (let i = 0; i < 9; i++) k.box(45 + (i % 3) * 0.7, sy, 9 + Math.floor(i / 3) * 0.5, 45.6 + (i % 3) * 0.7, sy + 0.12, 9.12 + Math.floor(i / 3) * 0.5, M.pig);
  for (const [x, z] of [[41.6, 3.4], [47.4, 3.0]]) { k.box(x - 0.35, sy + 0.25, z - 0.3, x + 0.35, sy + 0.6, z + 0.3, M.iron); k.cyl(x + 0.45, sy + 0.17, z, 0.17, 0.06, M.iron, { axis: 'z', seg: 8 }); k.beam([x - 0.35, sy + 0.5, z - 0.2], [x - 0.9, sy + 0.8, z - 0.2], 0.04, M.wood); k.beam([x - 0.35, sy + 0.5, z + 0.2], [x - 0.9, sy + 0.8, z + 0.2], 0.04, M.wood); }
  // Blowers under the stage (one Sturtevant blower per cupola).
  const blue = mat({ c: '#46525a', c2: '#3a464e', cut: '#262e34' });
  for (let i = 0; i < 4; i++) {
    const x = 38.4 + i * 3.0, z = 8.2;
    k.cyl(x, 1.3, z - 0.45, 1.05, 0.9, blue, { axis: 'z', seg: 16 });
    k.box(x - 1.05, 1.3, z - 0.4, x - 0.3, 2.9, z + 0.4, blue);
    k.box(x - 1.0, 2.9, z - 0.35, x - 0.35, 4.6, z + 0.35, M.steelDk);
    k.box(x - 1.0, 4.3, 1.9, x - 0.35, 4.9, z + 0.35, M.steelDk);
    k.cyl(x + 1.6, 0.25, z + 0.2, 0.38, 0.7, M.green, { axis: 'z', seg: 10 });
    k.box(x + 1.2, 0, z - 0.1, x + 2.0, 0.25, z + 1.0, M.iron);
    belt(k, [x, 1.3, z + 0.55], [x + 1.6, 0.63, z + 0.55], 0.12);
  }
  // Pattern room on a mezzanine east of the stage (S1 p.358).
  const py = 4.1;
  k.box(51.2, py - 0.3, 13.2, 58.6, py, 21.7, M.concrete, { top: M.planks });
  for (const x of [51.4, 58.4]) for (const z of [13.4, 21.4]) hcol(k, x, z, 0, py - 0.3, M.steelDk, 0.24);
  railX(k, 51.2, 58.6, py, 13.3, 1.0, 1.2);
  for (let i = 0; i < 3; i++) {
    const x = 52.4 + i * 2.2;
    props.table(k, x, py, 20.2, { w: 1.8, d: 0.75, h: 0.9, top: '#8a6a44', items: false });
    k.box(x - 0.2, py + 0.9, 20.3, x + 0.2, py + 1.05, 20.5, M.iron);
    k.box(x + 0.4, py + 0.9, 20.4, x + 0.8, py + 1.2, 20.8, mat({ c: '#c89a5a', cut: '#8a6a3a' }));
  }
  k.box(57.2, py, 17.0, 58.4, py + 1.1, 18.0, M.machine);
  k.cyl(57.0, py + 0.95, 17.5, 0.1, 1.2, M.bright, { axis: 'x', seg: 8 });
  props.shelves(k, 54.8, py, 21.1, { w: 2.6, h: 2.2, n: 4, items: 'jars', d: 0.4, color: '#6a4a2e' });
  props.ladder(k, 59.0, 0, py, 14.0, { w: 0.5, color: '#3a3a3a' });
  reflector(k, 53.5, 7.0, 17, { drop: 1.6, r: 5, i: 0.8 });
  reflector(k, 57, 7.0, 17, { drop: 1.6, r: 5, i: 0.8 });

  // Mould-carrier units: two loops of pendulum shelves hung from overhead chains (S1 p.336 to 337).
  const C = CARRIER;
  for (const zc of [C.zA, C.zB]) {
    for (const s of [-1, 1]) k.box(C.xa, C.y + 0.05, zc + s * C.r - 0.08, C.xb, C.y + 0.35, zc + s * C.r + 0.08, M.steelDk);
    for (const xc of [C.xa, C.xb]) {
      k.cyl(xc, C.y + 0.4, zc, 0.12, 0.6, M.steelDk, { seg: 8 });
      k.box(xc - 0.15, C.y + 1.0, zc - 2.2, xc + 0.15, C.y + 1.3, zc + 2.2, M.steelDk);
    }
    for (const x of [C.xa - 2, (C.xa + C.xb) / 2, C.xb + 2]) for (const s of [-1, 1]) hcol(k, x, zc + s * 2.1, 0, C.y + 1.3, M.steel, 0.22);
    k.box(C.xa - 2.1, C.y + 1.0, zc - 2.2, C.xb + 2.1, C.y + 1.3, zc - 2.0, M.steelDk);
    k.box(C.xa - 2.1, C.y + 1.0, zc + 2.0, C.xb + 2.1, C.y + 1.3, zc + 2.2, M.steelDk);
    // Drive motor on the north sprocket.
    k.box(C.xb - 0.4, C.y + 1.3, zc - 0.4, C.xb + 0.6, C.y + 1.9, zc + 0.4, M.green);
    // Shake-out grate at the loop's east end.
    k.box(C.xb + 2.6, 0, zc - 1.2, C.xb + 5.2, 0.5, zc + 1.2, mat({ c: '#3a3836', c2: '#2a2826', pat: 'grate', cut: '#1a1918' }));
    const rr = k.rng('sand' + zc);
    for (let i = 0; i < 6; i++) k.boulder(C.xb + 3 + rr() * 2.2, 0.5, zc - 1 + rr() * 2, 0.45, 0.22, 0.4, M.sand, i + 3);
  }
  // Moulding machines under sand chutes, in the space between the loops.
  for (let i = 0; i < 6; i++) {
    const x = 61 + i * 2.6, z = 6.6 + (i % 2) * 2.4;
    k.box(x - 0.45, 0, z - 0.4, x + 0.45, 0.85, z + 0.4, M.machine);
    k.box(x - 0.4, 0.85, z - 0.35, x + 0.4, 1.0, z + 0.35, M.iron);
    k.box(x - 0.08, 0.85, z + 0.35, x + 0.08, 2.0, z + 0.5, M.machine);
    k.box(x - 0.45, 1.9, z - 0.35, x + 0.45, 2.05, z + 0.5, M.machine);
    k.beam([x, 5.4, z + 1.6], [x, 2.4, z + 0.1], 0.32, M.steel);
    k.box(x - 0.5, 5.4, z + 1.2, x + 0.5, 6.0, z + 2.2, M.steelDk);
  }
  // Overhead sand hopper rail.
  k.box(59.5, 6.0, 7.6, 77, 6.3, 9.6, M.steelDk);
  // Check-taker's little table inside loop A (S1 p.336).
  props.table(k, 69, 0, C.zA - 0.3, { w: 0.8, d: 0.6, h: 0.75, items: false, top: '#7a5a3a' });
  for (let i = 0; i < 5; i++) k.cyl(68.75 + i * 0.12, 0.75, C.zA, 0.025, 0.006, M.brass, { seg: 6 });
  props.chair(k, 69, 0, C.zA + 0.4, { face: -1 });
  // Flasks waiting on the floor.
  for (let i = 0; i < 10; i++) k.box(60 + i * 1.6, 0, 11.4, 60.7 + i * 1.6, 0.35 + (i % 3) * 0.2, 12.0, M.iron);

  // Cylinder moulding floor: moulds on the floor under three parallel craneways (S1 p.336, p.355).
  const fz = [[0.4, 4.8], [4.8, 9.2], [9.2, 13.6]];
  for (const [za, zb] of fz) for (const z of [za, zb]) k.box(82.5, 6.0, z - 0.12, 95.8, 6.35, z + 0.12, M.steelDk);
  for (const x of [82.8, 89.2, 95.5]) for (const z of [0.4, 4.8, 9.2, 13.6]) hcol(k, x, z, 0, 6.0, M.steel, 0.24);
  const rr = k.rng('flasks');
  for (let i = 0; i < 4; i++) for (const zc of [2.6, 7.0, 11.4]) {
    const x = 84.4 + i * 2.8, h = 0.55 + rr() * 0.25;
    k.box(x - 0.9, 0, zc - 0.7, x + 0.9, h, zc + 0.7, M.iron);
    k.box(x - 0.82, h, zc - 0.62, x + 0.82, h + 0.02, zc + 0.62, M.sand);
    k.cyl(x - 0.5, h, zc, 0.12, 0.18, M.sand, { seg: 8 });
    k.box(x - 0.95, h * 0.5, zc - 0.75, x + 0.95, h * 0.5 + 0.05, zc + 0.75, M.steel);
  }
  for (const zc of [2.6, 7.0, 11.4]) for (let i = 0; i < 3; i++) k.boulder(83 + i * 4.6, 0, zc + 1.6, 0.6, 0.3, 0.5, M.sand, i * 5 + zc);
  // The two parked cranes of the back craneways.
  for (const [za, zb, x] of [[4.8, 9.2, 93.5], [9.2, 13.6, 85.5]]) {
    k.box(x - 0.25, 6.35, za - 0.1, x + 0.25, 6.85, zb + 0.1, mat({ c: '#6a5a3a', cut: '#3a3020' }));
    k.box(x - 0.4, 6.85, (za + zb) / 2 - 0.4, x + 0.4, 7.2, (za + zb) / 2 + 0.4, M.steelDk);
  }

  // Core room: a revolving core oven, cut open, and core-makers' benches (S1 p.341 to 342).
  const ov = mat({ c: '#8a4a36', c2: '#743c2c', pat: 'brick', s: 0.9, cut: '#6a3424', cutPat: true });
  k.box(96.3, 0, -1, 96.7, 4.6, 4.2, ov);
  k.box(100.3, 0, -1, 100.7, 4.6, 4.2, ov);
  k.box(96.3, 4.2, -1, 100.7, 4.6, 4.2, ov);
  k.box(96.3, 0, 3.8, 100.7, 4.2, 4.2, ov, { front: mat({ c: '#3a2a22', cut: '#2a1a14' }) });
  k.box(96.7, 0, -1, 100.3, 0.15, 3.8, ov);
  k.lamp(CORE.x, 1.2, 2.2, { always: true, r: 2.6, i: 0.5, color: '#ff8a40', bulb: false, halo: 0.4, flicker: true });
  k.box(97, 4.6, 3, 97.6, 9.5, 3.6, M.iron);
  // The double endless-chain core oven behind, closed.
  k.box(96.4, 0, 6.2, 100.6, 3.6, 9.4, ov);
  k.box(97.4, 0.4, 6.1, 99.6, 2.8, 6.2, mat({ c: '#3a3434', c2: '#5a3020', pat: 'bars', s: 0.3, glow: 'always' }));
  k.box(97, 3.6, 7, 97.6, 9.5, 7.6, M.iron);
  // Core benches with sand chutes from an overhead stage.
  k.box(96.3, 3.4, 13.4, 101, 3.6, 16.4, M.concrete);
  for (let i = 0; i < 3; i++) {
    const x = 97.1 + i * 1.5;
    props.table(k, x, 0, 11.6, { w: 1.3, d: 0.7, h: 0.9, top: '#7a6a52', items: false });
    k.beam([x, 3.4, 13.6], [x, 1.3, 12.1], 0.2, M.steel);
    for (let j = 0; j < 3; j++) k.box(x - 0.4 + j * 0.3, 0.9, 11.8, x - 0.25 + j * 0.3, 0.98, 12.0, M.sand);
  }
  props.shelves(k, 98.6, 0, 9.8, { w: 3.6, h: 2.0, n: 4, items: 'jars', d: 0.5, color: '#4a4a4a' });

  // Cleaning room: tumbling barrels (one row of the 62) and snagging wheels (S1 p.355).
  for (const x of [101.3, 105.5]) k.box(x - 0.15, 0, 2.4, x + 0.15, 1.5, 4.0, M.iron);
  k.box(101.3, 0, 2.6, 105.5, 0.25, 3.8, M.iron);
  for (let i = 0; i < 3; i++) {
    const x = 102.6 + i * 1.6;
    k.box(x - 0.15, 0, 7.6, x + 0.15, 0.9, 8.0, M.iron);
    k.cyl(x - 0.35, 0.95, 7.8, 0.32, 0.08, mat({ c: '#8a8680', c2: '#6a6660', pat: 'speckle', cut: '#5a5650' }), { axis: 'x', seg: 14 });
    k.cyl(x + 0.27, 0.95, 7.8, 0.32, 0.08, mat({ c: '#8a8680', c2: '#6a6660', pat: 'speckle', cut: '#5a5650' }), { axis: 'x', seg: 14 });
    k.box(x - 0.6, 0.6, 7.3, x + 0.6, 1.3, 7.4, M.steel);
  }
  for (let i = 0; i < 8; i++) k.box(101.5 + (i % 4) * 0.9, 0, 11 + Math.floor(i / 4) * 0.8, 102.2 + (i % 4) * 0.9, 0.2 + (i % 3) * 0.1, 11.6 + Math.floor(i / 4) * 0.8, M.castIron);
  // Overhead monorail track: from the cleaning room past heat treat to the machine shop (S1 p.26 to 27).
  k.box(MONO.x0, MONO.y, MONO.z - 0.09, MONO.x1, MONO.y + 0.28, MONO.z + 0.09, M.steelDk);
  k.box(MONO.x0, MONO.y + 0.28, MONO.z - 0.2, MONO.x1, MONO.y + 0.33, MONO.z + 0.2, M.steelDk);
  for (let x = MONO.x0 + 1; x < MONO.x1; x += 4) k.box(x - 0.05, MONO.y + 0.33, MONO.z - 0.05, x + 0.05, (x < X.F1 ? SAW.F.eave : x < X.T1 ? 7.5 : SAW.M.eave) - 0.2 + (x > X.CW0 && x < X.CW1 ? 4 : 0), MONO.z + 0.05, M.steelDk);
  // Lamps.
  for (let x = 54; x < 105; x += 7) for (const z of [3.5, 11, 18]) reflector(k, x, S.eave + 0.6, z, { drop: 1.6, r: 6.5, i: 0.85, big: true });
  for (const x of [38, 44, 49]) reflector(k, x, 9.8, 5, { drop: 1.2, r: 5, i: 0.7 });
  for (const x of [38.5, 44]) k.lamp(x, 4.6, 9, { r: 4, i: 0.6, color: '#ffd080', bulbR: 0.06 });
}

function heatTreat(k) {
  const fb = mat({ c: '#8a4a36', c2: '#743c2c', pat: 'brick', s: 0.9, cut: '#6a3424', cutPat: true });
  // A furnace cut open at the front, glowing.
  k.box(107, 0, -1, 107.4, 2.6, 2.8, fb);
  k.box(110.2, 0, -1, 110.6, 2.6, 2.8, fb);
  k.box(107, 2.2, -1, 110.6, 2.6, 2.8, fb);
  k.box(107, 0, 2.4, 110.6, 2.2, 2.8, fb);
  k.box(107.4, 0, -1, 110.2, 0.7, 2.4, fb);
  k.box(107.6, 0.7, 0.2, 110.0, 0.74, 2.2, M.glowFire);
  for (let i = 0; i < 5; i++) k.box(107.8 + i * 0.45, 0.74, 0.6 + (i % 2) * 0.5, 108.1 + i * 0.45, 0.82, 1.4 + (i % 2) * 0.5, M.glowIron);
  k.box(108.4, 2.6, 1.6, 109.2, 7.8, 2.4, fb);
  k.lamp(108.8, 1.2, 1.4, { always: true, r: 3.5, i: 0.8, color: '#ff7a30', bulb: false, halo: 0.7, flicker: true });
  // Two more furnaces at the back with glowing doors.
  for (const x0 of [106.8, 111.4]) {
    k.box(x0, 0, 11, x0 + 3.6, 2.6, 14.4, fb);
    k.box(x0 + 0.8, 0.5, 10.95, x0 + 2.8, 1.5, 11.0, M.glowFire);
    k.box(x0 + 1.4, 2.6, 12.4, x0 + 2.2, 7.8, 13.2, fb);
    k.lamp(x0 + 1.8, 1.0, 10.2, { always: true, r: 3, i: 0.6, color: '#ff7a30', bulb: false, halo: 0.5, flicker: true });
  }
  // Quench tank, sawdust and sand boxes.
  k.box(111.4, 0, 3.2, 114.6, 0.9, 5.4, M.steelDk);
  k.box(111.55, 0.75, 3.35, 114.45, 0.8, 5.25, M.water);
  for (const [x, c] of [[112, '#c8a46a'], [114, '#b89a6a']]) k.box(x - 0.7, 0, 7.2, x + 0.7, 0.6, 8.4, M.wood, { top: mat({ c, c2: '#a08458', pat: 'speckle' }) });
  for (let i = 0; i < 4; i++) k.box(107 + i * 0.8, 0, 6, 107.6 + i * 0.8, 0.5, 6.6, M.iron);
  k.box(106.5, 0, 16, 108, 1.8, 20, mat({ c: '#e8e2d6', c2: '#3a3a3a', pat: 'panels', s: 0.5 }));
  for (const x of [109, 113.5]) reflector(k, x, 7.5, 6, { drop: 1.2, r: 6, i: 0.8 });
  reflector(k, 111, 7.5, 15, { drop: 1.2, r: 6, i: 0.8 });
}

export function buildWest(k) {
  powerHouse(k);
  foundry(k);
  heatTreat(k);
}
