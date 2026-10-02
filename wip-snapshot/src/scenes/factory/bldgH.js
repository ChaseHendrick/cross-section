/* The Car Factory: Building H, four storeys (x 196 to 298).
 * Ground floor: the chassis lines (S1 p.138 to 151). 2nd: dash assembly and stored bodies.
 * 3rd: wheels and tyres, tanks, hoods, lamps. 4th: fenders, commutators, small parts (S2; S1).
 */
import { mat, props } from '../../engine/index.js';
import { X, H, LINE, M, reflector, railX, railZ } from './common.js';
import { modelT, body, wheel, WR } from './car.js';

// Stations along each line (x) and what a chassis carries from there on.
export const ST = { tank: 208, engine: 220, dash: 232, wheels: 248, radiator: 256, pit: 264, end: 268, starter: 279, door: X.H1 };
export const stageAt = (x) => ({ axles: true, tank: x >= ST.tank, engine: x >= ST.engine, dash: x >= ST.dash, wheels: x >= ST.wheels, radiator: x >= ST.radiator });
export const RAIL_Y = LINE.rail + 0.06 - WR; // lift that puts the axles on the rails
export const CHUTE = { x0: 238.5, y0: H.y[2] + 0.9, x1: 247.2, y1: 1.05 };
export const DASH2 = { x0: 198, x1: 228, z: 3.2, y: H.y[1] + 0.92, pitch: 1.6, speed: 1.83 / 60 };
export const WHEEL3 = { x0: 198, x1: 214, z: 3.0, y0: H.y[2] + 1.5, y1: H.y[2] + 1.0, pitch: 0.95 };
export const SPIN = [{ x: 216.5, z: 3.0 }, { x: 219.5, z: 3.0 }, { x: 222.5, z: 3.0 }];
export const PRESS = [{ x: 200.5, z: 3.4 }, { x: 205.0, z: 3.4 }];
export const OVEN = { x0: 210, x1: 238, z: 15.6, y: H.y[3], pitch: 1.1 };

function rails(k, z) {
  // High rails on iron legs, with the chain between them (S1 p.138 photo).
  const y = LINE.rail;
  for (const s of [-0.45, 0.45]) {
    k.box(LINE.x0 - 1, y - 0.08, z + s - 0.04, ST.end, y, z + s + 0.04, M.steel);
    k.beam([ST.end, y - 0.04, z + s], [ST.end + 4, 0.04, z + s], 0.08, M.steel);
  }
  k.box(LINE.x0 - 1, y - 0.3, z - 0.08, ST.end, y - 0.24, z + 0.08, M.iron);
  for (let x = LINE.x0 - 0.5; x < ST.end; x += 1.5) {
    if (x > 262.2 && x < 267.8) continue;
    for (const s of [-0.45, 0.45]) k.box(x - 0.04, 0, z + s - 0.04, x + 0.04, y - 0.08, z + s + 0.04, M.iron);
    k.box(x - 0.04, 0.12, z - 0.45, x + 0.04, 0.18, z + 0.45, M.iron);
  }
  // Drive sprocket housing at the far end.
  k.box(ST.end - 0.8, 0, z - 0.3, ST.end, 0.5, z + 0.3, M.green);
}

function groundFloor(k) {
  H.lines.forEach((z) => rails(k, z));
  // Line 3 stands idle today: its chassis are drawn where they stopped.
  for (let x = LINE.x0; x <= ST.pit; x += LINE.pitch) modelT(k, x, RAIL_Y, H.lines[2], stageAt(x));
  // Frame side line along the back wall: press, frames, mufflers (S1 p.138, p.142).
  const fz = 19.4;
  k.box(205, 0, fz - 0.5, 219, 0.62, fz + 0.5, M.castIron);
  k.box(213.4, 0, fz - 0.7, 214.6, 2.6, fz + 0.7, M.machine);
  k.box(213.2, 1.8, fz - 0.8, 214.8, 2.3, fz + 0.8, M.machineLt);
  for (let j = 0; j < 9; j++) for (const s of [-0.42, 0.38]) k.box(215.4, 0.62 + j * 0.13, fz + s, 218.6, 0.72 + j * 0.13, fz + s + 0.04, mat({ c: '#1e1c1a', cut: '#121110' }));
  for (let x = 206; x < 212; x += 3.6) { modelT(k, x, 0.62 - 0.5, fz, { axles: false }); }
  // The muffler pyramid.
  for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) k.cyl(220.2 + i * 0.32 + row * 0.16, 0.14 + row * 0.26, fz - 0.6, 0.13, 1.2, M.iron, { axis: 'z', seg: 8 });
  // Gasoline-tank bridge over the lines, with drums and filling hoses (S1 p.144).
  const by = 2.6, bx0 = ST.tank - 1.6, bx1 = ST.tank + 1.6;
  k.box(bx0, by - 0.15, 0.6, bx1, by, 17.6, mat({ c: '#6a6058', c2: '#5a5048', pat: 'planks', s: 0.25, cut: '#4a4038' }));
  for (const x of [bx0 + 0.1, bx1 - 0.1]) for (const z of [0.7, 6.1, 12.2, 17.5]) k.box(x - 0.06, 0, z - 0.06, x + 0.06, by - 0.15, z + 0.06, M.iron);
  railX(k, bx0, bx1, by, 0.65, 1.0, 1.6);
  railZ(k, bx1 - 0.05, 0.65, 17.6, by, 1.0, 2.2);
  for (const z of [1.4, 7.4, 13.5]) {
    props.barrel(k, bx0 + 0.6, by, z, { r: 0.3, h: 0.85, color: '#7a2a20' });
    props.barrel(k, bx0 + 0.6, by, z + 0.8, { r: 0.3, h: 0.85, color: '#3a4a3a' });
  }
  for (const z of H.lines) k.tube([[ST.tank, by, z - 0.6], [ST.tank + 0.2, by - 0.6, z - 0.4], [ST.tank + 0.3, 1.3, z - 0.3]], 0.025, M.iron);
  props.ladder(k, bx1 + 0.3, 0, by, 17.9, { w: 0.5, color: '#3a3a3a' });
  // Engine conveyor in from the machine shop, and hoist tracks over the lines (S1 plan n162).
  k.box(X.H0, 3.55, 18.9, ST.engine + 1, 3.75, 19.3, M.steelDk);
  for (let x = X.H0 + 1.5; x < ST.engine; x += 3) {
    k.cyl(x, 3.2, 19.1, 0.012, 0.35, M.iron, { seg: 3 });
    k.box(x - 0.36, 2.7, 18.88, x + 0.36, 3.2, 19.32, mat({ c: '#2c2c30', cut: '#18181a' }));
  }
  for (const x of [ST.engine - 0.6, ST.engine + 0.6]) k.box(x - 0.08, 3.7, 0.4, x + 0.08, 3.92, 19.4, M.steelDk);
  // Dash platforms and dash conveyors down from the second floor (S1 plan n46).
  for (const z of H.lines.slice(0, 2)) {
    k.box(ST.dash - 4, 0, z + 0.95, ST.dash + 4, 0.45, z + 2.0, mat({ c: '#6a6058', c2: '#5a5048', pat: 'planks', s: 0.25, cut: '#4a4038' }));
    for (let i = 0; i < 6; i++) k.box(ST.dash - 3.4 + i * 0.12, 0.45, z + 1.5, ST.dash - 3.36 + i * 0.12, 1.15, z + 1.95, mat({ c: '#6a4428', c2: '#5a3820', pat: 'grain' }));
    k.beam([ST.dash - 6.5, H.y[1] + 0.2, z + 1.6], [ST.dash - 2.2, 1.0, z + 1.6], 0.45, M.steel);
    // Wheel chutes from the wheel room two floors up (S1 p.377).
    k.beam([CHUTE.x0, CHUTE.y0, z + 1.35], [CHUTE.x1, CHUTE.y1, z + 1.35], 0.12, M.steel);
    for (const s of [-0.13, 0.13]) k.beam([CHUTE.x0, CHUTE.y0 + 0.12, z + 1.35 + s], [CHUTE.x1, CHUTE.y1 + 0.12, z + 1.35 + s], 0.04, M.steel);
    k.box(CHUTE.x1 - 0.1, 0, z + 1.1, CHUTE.x1 + 0.6, 1.05, z + 1.6, M.iron);
    // Radiator platform.
    k.box(ST.radiator - 3.5, 0, z + 0.95, ST.radiator + 1.5, 0.55, z + 2.0, mat({ c: '#6a6058', c2: '#5a5048', pat: 'planks', s: 0.25 }));
    for (let i = 0; i < 4; i++) k.box(ST.radiator - 3.2 + i * 0.5, 0.55, z + 1.25, ST.radiator - 2.9 + i * 0.5, 1.35, z + 1.8, M.brass);
    // Pit steps.
    for (let i = 0; i < 5; i++) k.box(267.6, -1.5 + i * 0.3, z - 0.5, 267.6 + 0.3 * (5 - i), -1.2 + i * 0.3, z + 0.5, M.concreteDk);
    // Motor-starting drive: friction rollers in the floor under the rear wheels (S1 p.150).
    k.box(ST.starter - 0.6, -0.3, z - 1.0, ST.starter + 0.6, 0.0, z + 1.0, M.concreteDk);
    for (const s of [-0.71, 0.71]) for (const dx of [-0.22, 0.22]) k.cyl(ST.starter + dx, 0.0, z + s - 0.12, 0.13, 0.24, M.bright, { axis: 'z', seg: 10 });
    k.box(ST.starter - 1.4, 0, z - 1.5, ST.starter - 1.25, 1.3, z - 1.35, M.iron);
    k.beam([ST.starter - 1.33, 1.25, z - 1.43], [ST.starter - 0.6, 1.55, z - 1.43], 0.05, M.iron);
    k.cyl(ST.starter - 0.7, 1.45, z - 1.43, 0.12, 0.2, M.iron, { seg: 8 });
    k.tube([[ST.starter - 0.1, 0.35, z - 0.25], [ST.starter - 0.9, 0.1, z - 0.5], [ST.starter - 1.8, 0.05, z - 1.3]], 0.05, mat({ c: '#3a3634', cut: '#222' }));
  }
  // Stock beside door D: crates, axles, a hand truck.
  for (let i = 0; i < 6; i++) props.crate(k, 287 + (i % 3) * 1.3, Math.floor(i / 3) * 0.6, 13.0, { w: 1.1, h: 0.6, d: 1.0 });
  for (let i = 0; i < 6; i++) k.cyl(286.5, 0.1 + i * 0.12, 16.5 + (i % 2) * 0.12, 0.06, 1.4, mat({ c: '#1e1c1a', cut: '#121110' }), { axis: 'x', seg: 6 });
  for (let i = 0; i < 4; i++) wheel(k, 293 + i * 0.3, WR, 15.2 + i * 0.06);
  // Tool crib with closets above, beside the lines (S1 p.28).
  k.box(240, 0, 17.4, 246, 2.4, 20.6, mat({ c: '#8a8a80', c2: '#3a3a3a', pat: 'bars', s: 0.08, cut: '#3a3a3a' }));
  k.box(240.4, 2.4, 17.8, 245.6, 4.0 - 0.3, 20.6, M.whitewash, { front: mat({ c: '#d8d0bc', c2: '#b8b0a0', pat: 'panels', s: 0.9 }) });
  for (let i = 0; i < 12; i++) k.box(246 + i * 0.22, i * 0.2, 17.4, 246.22 + i * 0.22, i * 0.2 + 0.2, 18.2, mat({ c: '#9a948a', cut: '#6a665e' }));
  // Notices on the back wall.
  for (const x of [222, 252]) k.box(x, 1.6, H.zN - 0.04, x + 1.0, 2.4, H.zN, M.paper);
}

function secondFloor(k) {
  const y = H.y[1];
  // Dash-assembly line, moving 72 inches a minute (S1 p.140 to 142).
  k.box(DASH2.x0, y + 0.82, DASH2.z - 0.4, DASH2.x1, y + 0.88, DASH2.z + 0.4, M.castIron);
  for (let x = DASH2.x0 + 0.5; x < DASH2.x1; x += 1.6) k.box(x - 0.04, y, DASH2.z - 0.35, x + 0.04, y + 0.82, DASH2.z + 0.35, M.castIron);
  k.box(DASH2.x1, y, DASH2.z - 0.5, DASH2.x1 + 0.8, y + 0.9, DASH2.z + 0.5, M.green);
  // Benches with dash parts: coils, gauges, boards.
  for (let i = 0; i < 4; i++) props.table(k, 201 + i * 6.5, y, 8.2, { w: 3.0, d: 0.8, h: 0.9, top: '#7a6a52', items: false });
  for (let i = 0; i < 8; i++) k.box(200 + i * 3.4, y + 0.9, 8.4, 200.5 + i * 3.4, y + 1.05, 8.7, mat({ c: '#6a4428', c2: '#5a3820', pat: 'grain' }));
  for (let j = 0; j < 10; j++) k.box(222, y + j * 0.04, 12.5, 223.2, y + 0.03 + j * 0.04, 13.4, mat({ c: '#6a4428', c2: '#5a3820', pat: 'grain' }));
  // Stored bodies on trucks (what this floor held after August 1914 is not known; dossier 3.3).
  for (let i = 0; i < 9; i++) {
    const x = 236 + (i % 5) * 11.5 + (i > 4 ? 5 : 0), z = i > 4 ? 13.6 : 7.4;
    k.box(x - 1.0, y + 0.18, z - 0.7, x + 1.0, y + 0.26, z + 0.7, M.wood);
    for (const dx of [-0.8, 0.8]) for (const dz of [-0.6, 0.6]) k.cyl(x + dx, y + 0.09, z + dz - 0.03, 0.09, 0.06, M.iron, { axis: 'z', seg: 6 });
    body(k, x - 0.2, y - 0.42, z, M.enamel, false, true);
  }
  for (const x of [212.5, 229]) for (const z of [12.4, 16.4]) props.crate(k, x, y, z, { w: 1.6, h: 1.1, d: 1.2 });
}

function thirdFloor(k) {
  const y = H.y[2];
  // Gravity track to the centrifugal painting machines (S1 p.376 to 377).
  const w = WHEEL3;
  for (const s of [-0.12, 0.12]) k.beam([w.x0, w.y0, w.z + s], [w.x1, w.y1, w.z + s], 0.05, M.steel);
  for (let x = w.x0 + 0.5; x < w.x1; x += 2) k.box(x - 0.04, y, w.z - 0.04, x + 0.04, w.y0 - (x - w.x0) / (w.x1 - w.x0) * (w.y0 - w.y1) - 0.05, w.z + 0.04, M.iron);
  for (const s of SPIN) {
    k.box(s.x - 0.8, y, s.z - 0.8, s.x + 0.8, y + 0.7, s.z + 0.8, M.steelDk);
    k.box(s.x - 0.7, y + 0.62, s.z - 0.7, s.x + 0.7, y + 0.66, s.z + 0.7, M.enamel);
    k.box(s.x - 0.1, y + 0.7, s.z + 0.75, s.x + 0.1, y + 2.6, s.z + 0.95, M.machine);
    k.box(s.x - 0.12, y + 2.4, s.z - 0.1, s.x + 0.12, y + 2.6, s.z + 0.95, M.machine);
    k.box(s.x - 0.25, y + 2.6, s.z + 0.6, s.x + 0.25, y + 3.0, s.z + 1.0, M.green);
  }
  // Drying wheels on pegs, tyre racks and the head of the chutes to the chassis line.
  for (let i = 0; i < 10; i++) wheel(k, 226 + i * 0.32, y + WR + 0.1, 16.0 + (i % 2) * 0.1, { hub: M.iron });
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) k.cyl(201 + i * 0.22, y + 0.2 + r * 0.8, 12.4, 0.36, 0.1, M.rubber, { axis: 'x', seg: 12 });
  for (let r = 0; r < 3; r++) k.box(200.6, y + r * 0.8, 12.0, 202.8, y + r * 0.8 + 0.05, 12.8, M.wood);
  k.beam([197.5, y - 1.0, 18.5], [206, y + 0.9, 18.5], 0.5, M.steel);
  for (const z of H.lines.slice(0, 2)) { k.box(CHUTE.x0 - 1.6, y, z + 1.05, CHUTE.x0 + 0.2, y + 1.0, z + 1.65, M.steelDk); for (let i = 0; i < 3; i++) wheel(k, CHUTE.x0 - 1.3 + i * 0.5, y + 1.0 + WR, z + 1.35); }
  // Gas tanks, hoods, lamps and floorboards (S2).
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) k.cyl(250 + i * 1.0, y + 0.22 + j * 0.42, 15.6, 0.2, 0.9, mat({ c: '#1e1c1a', cut: '#121110' }), { axis: 'z', seg: 10 });
  for (let j = 0; j < 6; j++) k.extrudeX([[8.2, y + j * 0.24], [8.8, y + j * 0.24], [8.8, y + 0.18 + j * 0.24], [8.5, y + 0.22 + j * 0.24], [8.2, y + 0.18 + j * 0.24]], 262, 263.7, M.enamel);
  props.shelves(k, 272, y, 18.8, { w: 4.0, h: 2.4, n: 4, items: 'jars', d: 0.6, color: '#5a5a5a' });
  for (let i = 0; i < 8; i++) k.cyl(270.4 + i * 0.45, y + 0.95, 19.2, 0.11, 0.16, M.brass, { axis: 'z', seg: 10 });
  for (let j = 0; j < 12; j++) k.box(280, y + j * 0.05, 14, 283, y + 0.04 + j * 0.05, 15.2, M.lumber);
  for (let i = 0; i < 5; i++) props.table(k, 252 + i * 7, y, 7.6, { w: 3.2, d: 0.9, h: 0.9, top: '#7a6a52', items: false });
}

function fourthFloor(k) {
  const y = H.y[3];
  // Fender department: presses, the continuous enamelling oven traversed by chains (S1 ch. IX).
  for (const p of PRESS) {
    k.box(p.x - 0.9, y, p.z - 0.6, p.x + 0.9, y + 0.9, p.z + 0.6, M.machine);
    for (const s of [-0.75, 0.75]) k.box(p.x + s - 0.15, y + 0.9, p.z - 0.5, p.x + s + 0.15, y + 3.2, p.z + 0.5, M.machine);
    k.box(p.x - 0.95, y + 3.2, p.z - 0.6, p.x + 0.95, y + 3.7, p.z + 0.6, M.machine);
    k.cyl(p.x, y + 3.7, p.z + 0.6, 0.5, 0.25, M.castIron, { axis: 'z', seg: 14 });
  }
  for (let i = 0; i < 8; i++) k.extrude([[209 + 0, y + i * 0.06], [210.4, y + i * 0.06], [210.2, y + 0.05 + i * 0.06], [209.2, y + 0.05 + i * 0.06]], 4.5, 5.0, M.enamel);
  const o = OVEN;
  k.box(o.x0 + 3, y, o.z + 0.9, o.x1, y + 3.3, o.z + 4.0, M.brickDk);
  k.box(o.x0 + 3, y + 3.3, o.z + 0.8, o.x1, y + 3.5, o.z + 4.1, M.steelDk);
  k.box(o.x0 + 3.2, y + 0.4, o.z + 0.88, o.x1 - 0.2, y + 0.55, o.z + 0.9, M.glowFire);
  k.lamp((o.x0 + o.x1) / 2, y + 0.8, o.z + 0.4, { always: true, r: 3.6, i: 0.45, color: '#ff8a40', bulb: false, halo: 0.3 });
  k.box(o.x0, y + 2.55, o.z - 0.05, o.x1, y + 2.65, o.z + 0.05, M.steelDk);
  for (let x = o.x0; x < o.x1; x += 3) k.box(x - 0.04, y + 2.65, o.z - 0.04, x + 0.04, H.roof - 0.3, o.z + 0.04, M.iron);
  k.box(o.x0 - 1.5, y, o.z - 1.0, o.x0 + 1.0, y + 0.9, o.z + 1.0, M.steelDk);
  k.box(o.x0 - 1.4, y + 0.82, o.z - 0.9, o.x0 + 0.9, y + 0.86, o.z + 0.9, M.enamel);
  // Commutator department, with its small aluminium foundry (S1 p.219, p.327).
  for (let i = 0; i < 4; i++) for (const z of [3.2, 8.6]) {
    props.table(k, 243 + i * 5.2, y, z, { w: 4.2, d: 0.8, h: 0.85, top: '#7a6a52', items: false });
    for (let j = 0; j < 6; j++) k.cyl(241.4 + i * 5.2 + j * 0.62, y + 0.85, z + 0.4, 0.07, 0.05, M.bright, { seg: 8 });
  }
  k.box(260.5, y, 15, 262.5, y + 1.0, 17, M.brickDk);
  k.cyl(261.5, y + 1.0, 16, 0.32, 0.1, M.glowIron, { seg: 10 });
  k.lamp(261.5, y + 1.4, 15.4, { always: true, r: 3, i: 0.5, color: '#ff9a50', bulb: false, halo: 0.4, flicker: true });
  k.box(261.2, y + 1.0, 16.6, 261.8, H.roof - 0.3, 17.2, M.iron);
  for (let i = 0; i < 6; i++) k.box(263.4 + i * 0.4, y, 15.4, 263.7 + i * 0.4, y + 0.25, 16.6, M.iron);
  // Small parts: an overhead belt carrier and gravity slides down towards the motor lines (S1 p.283).
  for (let i = 0; i < 4; i++) props.table(k, 270 + i * 6.5, y, 3.4, { w: 4.6, d: 0.8, h: 0.88, top: '#7a6a52', items: false });
  k.box(268, y + 3.2, 6.4, 296, y + 3.35, 6.8, M.steelDk);
  for (let x = 269; x < 296; x += 0.9) k.box(x, y + 3.05, 6.45, x + 0.3, y + 3.2, 6.75, M.wood);
  for (const x of [272, 284]) k.beam([x, y + 1.2, 10.5], [x - 6, y - 1.0, 10.5], 0.32, M.steel);
}

export function buildH(k) {
  groundFloor(k);
  secondFloor(k);
  thirdFloor(k);
  fourthFloor(k);
  // Lamps: enamelled reflectors on every floor.
  for (let f = 0; f < H.y.length; f++) {
    const yc = (f + 1 < H.y.length ? H.y[f + 1] : H.roof) - 0.3;
    for (let i = 0; i < H.colX.length - 1; i++) {
      const x = (H.colX[i] + H.colX[i + 1]) / 2;
      for (const z of [3.05, 12.2]) reflector(k, x, yc, z + (f === 0 && z > 5 ? 3 : 0), { drop: 0.6, r: 7, i: 0.8 });
    }
  }
}
