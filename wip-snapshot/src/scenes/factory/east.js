/* The Car Factory: John R Street (x 298 to 330), the new six-storey building with its craneway
 * (x 330 to 400; S1 ch. XIV and XV) and the railway beyond.
 */
import { mat, props } from '../../engine/index.js';
import { X, N, M, reflector, railX, railZ } from './common.js';
import { stairsX } from './shell.js';
import { body, modelT, wheel, WR } from './car.js';

export const JR = { track: 3.05, gallows: 303.5, chuteTop: [311.8, N.y[2]], chuteBot: [306.4, 4.5], idler: 322.0 };
export const NL = {
  top: { y: N.y[2], z: 3.2, x0: 336, x1: 397, pitch: 4.4 },
  uph: { y: N.y[3], z: 3.0, x0: 352, x1: 398, pitch: 4.2 },
  cush: { y: N.y[3], z: 9.4, x0: 362, x1: 380, pitch: 0.9 },
  paint: { y: N.y[4], z: 3.4, x0: 334, x1: 398, pitch: 4.4, speed: 25 * 0.3048 / 60 },
  lift: { x: 397.8, z: 8.0 },
  car: { x0: 350, x1: 362.5 },
  fans: [341.5, 375.5],
  lamps: [339, 357.3, 375.6, 393.9],
};

// ------------------------------------------------------------------ John R Street
function johnR(k) {
  const z = JR.track;
  // Kerbs, the angle-iron track for chassis (S1 p.139 to 155), puddles.
  for (const x of [X.J0 + 3, X.J1 - 3]) k.box(x - 0.15, 0, -3, x + 0.15, 0.14, 125, M.kerb);
  for (const s of [-0.71, 0.71]) {
    k.box(X.J0, 0, z + s - 0.06, 327, 0.03, z + s + 0.06, M.steel);
    k.box(X.J0, 0.03, z + s - 0.06, 327, 0.1, z + s - 0.02, M.steel);
  }
  for (const [x, zz, w, d] of [[309, 11, 3.2, 1.6], [318, 22, 2.4, 1.2], [304, 30, 4, 2], [324, 7.5, 1.6, 0.9]]) k.box(x, 0.005, zz, x + w, 0.015, zz + d, mat({ c: '#6a7a84', c2: '#8aa0aa', pat: 'speckle', cut: '#4a5a64' }));
  // Idlers on ball bearings for testing the rear axle (S1 p.151).
  k.box(JR.idler - 0.6, -0.3, z - 1.1, JR.idler + 0.6, 0.0, z + 1.1, M.concreteDk);
  for (const s of [-0.71, 0.71]) for (const dx of [-0.22, 0.22]) k.cyl(JR.idler + dx, 0.0, z + s - 0.14, 0.13, 0.28, M.bright, { axis: 'z', seg: 10 });
  // The gallows frame over the waiting chassis, and the body chute from the bridge (S1 p.151; p.369 to 370).
  const g = JR.gallows, tim = mat({ c: '#8a6a44', c2: '#7a5a38', pat: 'grain', cut: '#5a4228' });
  for (const zz of [z - 1.5, z + 1.6]) {
    k.box(g - 0.13, 0, zz - 0.13, g + 0.13, 6.0, zz + 0.13, tim);
    k.beam([g - 1.3, 0, zz], [g - 0.1, 3.0, zz], 0.12, tim);
    k.beam([g + 1.3, 0, zz], [g + 0.1, 3.0, zz], 0.12, tim);
  }
  k.box(g - 0.15, 6.0, z - 1.65, g + 0.15, 6.25, z + 1.75, tim);
  props.crate(k, g - 0.9, 0, z + 2.0, { w: 0.5, h: 0.45, d: 0.45 });
  const [tx, ty] = JR.chuteTop, [bx, byy] = JR.chuteBot;
  k.box(311.6, ty - 0.45, 1.6, 316.5, ty, 4.5, M.concrete, { top: mat({ c: '#6a6058', c2: '#5a5048', pat: 'planks', s: 0.25 }) });
  railX(k, 312.2, 316.5, ty, 1.65, 1.0, 1.2);
  railZ(k, 316.45, 1.65, 4.5, ty, 1.0, 1.4);
  const cm = mat({ c: '#6a5a46', c2: '#5a4a38', pat: 'planks', s: 0.2, cut: '#4a3a28' });
  k.beam([tx, ty - 0.1, z], [bx, byy - 0.1, z], 0.18, cm);
  for (const s of [-0.75, 0.75]) {
    k.beam([tx, ty - 0.2, z + s], [bx, byy - 0.2, z + s], 0.12, cm);
    k.beam([tx, ty + 0.5, z + s], [bx, byy + 0.5, z + s], 0.05, M.iron);
  }
  k.beam([tx, ty - 0.12, z], [bx, byy - 0.12, z], 0.5, mat({ c: '#2e2a26', c2: '#3a3632', pat: 'bars', s: 0.2, cut: '#1a1816' }));
  for (const t of [0.15, 0.5, 0.85]) {
    const x = tx + (bx - tx) * t, y = ty + (byy - ty) * t;
    for (const s of [-0.8, 0.8]) k.box(x - 0.08, 0, z + s - 0.08, x + 0.08, y - 0.2, z + s + 0.08, M.steelDk);
  }
  // Lever for the endless belt, at the top.
  k.box(tx - 0.6, ty, 1.9, tx - 0.5, ty + 1.1, 2.0, M.iron);
  // The wooden horses once used to hold rear axles off the ground (S1 p.151).
  for (const dz of [0, 1.4]) {
    k.box(325.2, 0.62, 9 + dz, 326.6, 0.72, 9.15 + dz, M.wood);
    for (const [a, b] of [[325.3, 9 + dz - 0.3], [325.3, 9 + dz + 0.45], [326.5, 9 + dz - 0.3], [326.5, 9 + dz + 0.45]]) k.beam([a, 0, b], [a, 0.65, 9.07 + dz], 0.05, M.wood);
  }
  // Street lamps.
  for (const [x, zz] of [[X.J0 + 1.4, 12], [X.J1 - 1.4, 30], [X.J0 + 1.4, 52]]) {
    k.cyl(x, 0.12, zz, 0.08, 6.2, M.iron, { seg: 6 });
    k.beam([x, 6.2, zz], [x + (x < 314 ? 1.2 : -1.2), 6.5, zz], 0.06, M.iron);
    k.lamp(x + (x < 314 ? 1.2 : -1.2), 6.2, zz, { r: 7, i: 0.8, color: '#e8f0ff', bulbR: 0.14, halo: 0.9 });
  }
  reflector(k, 306, N.y[2] - 0.45, 5.2, { drop: 0.5, r: 6, i: 0.8 });
  reflector(k, 318, N.y[2] - 0.45, 5.2, { drop: 0.5, r: 6, i: 0.8 });
}

// ------------------------------------------------------------------ the new building
function floor1(k) {
  // Shipping and finished components; time clocks by the workmen's doors (S1 p.395, p.410).
  const r = k.rng('ship');
  for (let i = 0; i < 26; i++) {
    const x = 340 + (i % 9) * 6.2 + r() * 1.5, z = 4 + Math.floor(i / 9) * 2.4 + r() * 0.8;
    props.crate(k, x, 0, z, { w: 0.8 + r() * 0.8, h: 0.5 + r() * 0.7, d: 0.7 + r() * 0.6 });
    if (r() < 0.4) props.crate(k, x, 0.6, z + 0.1, { w: 0.6, h: 0.4, d: 0.5 });
  }
  for (let i = 0; i < 3; i++) {
    const x = 333.4 + i * 2.6;
    k.box(x - 0.5, 0, 0.6, x + 0.5, 1.9, 1.0, M.woodDk);
    k.box(x - 0.45, 1.0, 0.58, x + 0.45, 1.8, 0.6, mat({ c: '#e8e0cc', c2: '#6a5a3a', pat: 'tiles', s: 0.06 }));
    k.cyl(x, 2.05, 0.75, 0.16, 0.08, mat({ c: '#f2ecdc', cut: '#8a8478' }), { axis: 'z', seg: 10 });
    railZ(k, x + 1.3, 0.2, 5.0, 0, 1.0, 1.6);
  }
  // Platform scale and a packing bench.
  k.box(385, 0, 4, 387, 0.12, 5.6, M.castIron);
  k.box(386.7, 0, 5.4, 386.9, 1.4, 5.6, M.castIron);
  k.box(386.2, 1.2, 5.3, 387.4, 1.6, 5.7, M.brass);
  props.table(k, 391, 0, 4.4, { w: 3.2, d: 0.9, h: 0.9, top: '#9a7a52', items: false });
  for (let i = 0; i < 3; i++) k.box(381 + i * 1.6, 0.18, 8.6, 382.2 + i * 1.6, 0.26, 9.4, M.wood);
  // Stock to go out by rail on the dock along the craneway.
  for (let i = 0; i < 8; i++) props.crate(k, 336 + i * 7.5, 0, 13.0, { w: 1.4, h: 0.9, d: 1.2 });
}

function floor2(k) {
  // Finished-components storage (exact use illustrative): rows of bin racks.
  const y = N.y[1];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) {
    const x = 336 + i * 10, z = 2.5 + row * 3.4;
    k.box(x - 3.6, y, z, x + 3.6, y + 2.3, z + 0.8, mat({ c: '#7a6a52', c2: '#5a4a38', pat: 'tiles', s: 0.38, cut: '#4a3a28' }));
  }
}

function floor3(k) {
  // Top department: windshields and tops fitted on the conveyor; roller platform to the bridge (S1 p.368 to 370).
  const L = NL.top, y = L.y;
  k.box(L.x0 - 1, y + 0.3, L.z - 0.55, L.x1, y + 0.38, L.z + 0.55, M.castIron);
  for (let x = L.x0; x < L.x1; x += 2) k.box(x - 0.05, y, L.z - 0.5, x + 0.05, y + 0.3, L.z + 0.5, M.castIron);
  for (let i = 0; i < 9; i++) k.cyl(331.2 + 0, y + 0.32, L.z + 0.7 + i * 0.5, 0.06, 2.6, M.bright, { axis: 'x', seg: 6 });
  k.box(330.8, y, L.z + 0.5, 333.9, y + 0.28, L.z + 5.0, M.castIron);
  // Bows, rolls of top material, cushions, mats and tool boxes waiting to be thrown in.
  for (let i = 0; i < 6; i++) k.cyl(345 + i * 6, y, 9.6, 0.25, 1.6, mat({ c: '#24221f', c2: '#302d29', cut: '#141210' }), { axis: 'z', seg: 10 });
  for (let i = 0; i < 4; i++) props.table(k, 355 + i * 11, y, 7.6, { w: 3.0, d: 0.9, h: 0.9, top: '#7a6a52', items: false });
  for (let i = 0; i < 10; i++) k.box(352 + i * 3.6, y + 0.9, 7.8, 352.8 + i * 3.6, y + 1.05, 8.3, M.leather);
  for (let i = 0; i < 6; i++) k.beam([380 + i * 0.4, y, 9.0], [380.6 + i * 0.4, y + 1.6, 9.0], 0.04, M.woodDk);
}

function floor4(k) {
  const y = N.y[3];
  // Upholstery line along the floor; men ride inside the bodies (S1 p.363 to 366).
  const U = NL.uph;
  k.box(U.x0 - 1, y + 0.3, U.z - 0.55, U.x1, y + 0.38, U.z + 0.55, M.castIron);
  for (let x = U.x0; x < U.x1; x += 2) k.box(x - 0.05, y, U.z - 0.5, x + 0.05, y + 0.3, U.z + 0.5, M.castIron);
  // Women's body-top-making department: rows of sewing machines (S1 p.401 n425 photo).
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) {
    const x = 334.6 + i * 2.6, z = 0.8 + row * 2.9;
    props.table(k, x, y, z, { w: 1.1, d: 0.6, h: 0.76, top: '#6a4a2e', items: false });
    k.box(x - 0.25, y + 0.76, z + 0.15, x + 0.15, y + 0.95, z + 0.4, M.black);
    k.box(x + 0.05, y + 0.76, z + 0.22, x + 0.15, y + 1.1, z + 0.36, M.black);
    k.box(x - 0.3, y + 1.05, z + 0.2, x + 0.15, y + 1.12, z + 0.36, M.black);
    props.chair(k, x, y, z + 0.75, { face: -1, color: '#6a4a2a' });
  }
  for (let i = 0; i < 4; i++) k.box(334.4 + i * 3.4, y, 8.5, 336.8 + i * 3.4, y + 0.8, 9.5, mat({ c: '#24221f', c2: '#302d29', pat: 'canvas', cut: '#141210' }));
  // Cushion line: a chain conveyor in place of benches, 134 cushions an hour (S1 p.371).
  const C = NL.cush;
  k.box(C.x0, y + 0.72, C.z - 0.35, C.x1, y + 0.8, C.z + 0.35, M.castIron);
  for (let x = C.x0 + 0.4; x < C.x1; x += 1.6) k.box(x - 0.04, y, C.z - 0.3, x + 0.04, y + 0.72, C.z + 0.3, M.castIron);
  for (let i = 0; i < 6; i++) k.box(C.x0 + 1 + i * 2.8, y, C.z + 0.9, C.x0 + 2.2 + i * 2.8, y + 0.5, C.z + 1.6, mat({ c: '#b8a07a', c2: '#a08a68', pat: 'speckle' }));
  // Rubbing deck: a track in a concrete gutter with water outlets and pumice pans (S1 p.363).
  k.box(382, y, 8.4, 398, y + 0.25, 10.6, M.concreteDk);
  k.box(382.3, y + 0.2, 8.7, 397.7, y + 0.24, 10.3, M.water);
  for (let i = 0; i < 6; i++) k.box(383 + i * 2.6, y + 0.25, 10.65, 383.6 + i * 2.6, y + 0.32, 11.1, mat({ c: '#d8d4cc', cut: '#a8a49c' }));
  for (let i = 0; i < 3; i++) body(k, 385 + i * 4.6, y + 0.1, 9.5, M.blueBlack, false, false);
}

function floor5(k) {
  // The paint line: priming rooms on the north side, the flow-on hood, drip pans (S1 p.360 to 362).
  const P = NL.paint, y = P.y;
  k.box(P.x0 - 1, y + 0.3, P.z - 0.5, P.x1, y + 0.38, P.z + 0.5, M.castIron);
  for (let x = P.x0; x < P.x1; x += 2) k.box(x - 0.05, y, P.z - 0.45, x + 0.05, y + 0.3, P.z + 0.45, M.castIron);
  k.box(P.x0 - 1, y + 0.02, P.z - 1.2, P.x1, y + 0.08, P.z + 1.2, mat({ c: '#9aa0a2', c2: '#8a9092', pat: 'plates', s: 0.8, cut: '#6a7072' }));
  // Inclined conveyor bringing bodies up from the craneway dock (S1 p.361 photo).
  k.beam([331.2, y - 2.0, 6.6], [P.x0 - 0.5, y + 0.3, P.z + 0.6], 0.5, M.steel);
  // Priming rooms: three small booths north of the track.
  for (let i = 0; i < 3; i++) {
    const x0 = 352 + i * 5.2;
    k.box(x0, y, 5.2, x0 + 0.12, y + 3.0, 9.8, M.whitewash);
    k.box(x0 + 4.2, y, 5.2, x0 + 4.32, y + 3.0, 9.8, M.whitewash);
    k.box(x0, y + 3.0, 5.2, x0 + 4.32, y + 3.12, 9.8, M.whitewash);
    k.box(x0 + 0.12, y, 9.68, x0 + 4.2, y + 3.0, 9.8, mat({ c: '#7a4a2e', c2: '#8a5a3a', pat: 'speckle', cut: '#4a2a18' }));
    body(k, x0 + 2.2, y + 0.1, 7.6, M.primer, false, false);
    k.cyl(x0 + 0.6, y, 8.6, 0.25, 0.9, M.steelDk, { seg: 10 });
    k.lamp(x0 + 2.1, y + 2.6, 7.5, { r: 3, i: 0.6, color: '#ffe0a0', bulbR: 0.05 });
  }
  // The flow-on hood: two men shower each body with blue-black from fan nozzles fed from a tank above.
  const fx = 378;
  for (const s of [-1, 1]) k.box(fx + s * 2.2 - 0.12, y, P.z - 1.4, fx + s * 2.2 + 0.12, y + 3.1, P.z + 1.4, M.steelDk);
  k.box(fx - 2.3, y + 3.0, P.z - 1.5, fx + 2.3, y + 3.15, P.z + 1.5, M.steelDk);
  for (const s of [-1.1, 1.1]) k.cyl(fx - 2.0, y + 2.4, P.z + s, 0.05, 4.0, M.brass, { axis: 'x', seg: 6 });
  k.cyl(fx, y + 3.15, P.z + 0.5, 0.06, N.y[5] - y - 3.15, M.iron, { seg: 6 });
  k.box(fx - 2.4, y, P.z - 1.6, fx + 2.4, y + 0.12, P.z + 1.6, mat({ c: '#9aa0a2', c2: '#7a8082', pat: 'plates', s: 0.6 }));
  k.box(fx - 2.3, y + 0.12, P.z - 1.5, fx + 2.3, y + 0.14, P.z + 1.5, M.blueBlack);
  // Stacks of drying bodies on racks.
  for (let i = 0; i < 4; i++) body(k, 382 + i * 4.2, y + 0.4, 9.2, M.blueBlack, false, false);
  for (let i = 0; i < 4; i++) k.box(381.2 + i * 4.2, y, 8.4, 382.0 + i * 4.2, y + 0.42, 10.0, M.wood);
}

function floor6(k) {
  const y = N.y[5];
  // Gravity tanks feeding the flow-on nozzles below (S1 p.361 to 362); lumber and crated machines.
  for (const x of [376, 380]) { k.cyl(x, y + 0.8, 3.9, 0.8, 1.6, M.steelDk, { seg: 14 }); for (const dz of [-0.6, 0.6]) for (const dx of [-0.6, 0.6]) k.box(x + dx - 0.05, y, 3.9 + dz - 0.05, x + dx + 0.05, y + 0.8, 3.9 + dz + 0.05, M.iron); }
  for (let j = 0; j < 14; j++) k.box(336, y + j * 0.1, 3.0, 348, y + 0.09 + j * 0.1, 4.6 + (j % 2) * 0.2, M.lumber);
  for (let j = 0; j < 10; j++) k.box(352, y + j * 0.1, 8.0, 364, y + 0.09 + j * 0.1, 9.4, M.lumber);
  for (let i = 0; i < 3; i++) {
    const x = 385 + i * 4;
    k.box(x - 1.2, y, 6.5, x + 1.2, y + 1.6, 8.3, mat({ c: '#c8a46e', c2: '#9a7a4a', pat: 'bars', s: 0.25, cut: '#8a6a3a' }));
    k.box(x - 1.0, y, 2.4, x + 1.0, y + 1.1, 3.6, M.machine);
    k.box(x - 0.2, y + 1.1, 2.6, x + 0.2, y + 1.6, 3.2, M.machineLt);
  }
}

function northBuilding(k) {
  // Behind the craneway: stock and machinery being installed (body woodworking on the top floor, S1 p.410).
  for (let f = 0; f < N.y.length; f++) {
    const y = N.y[f], yc = (f + 1 < N.y.length ? N.y[f + 1] : N.roof) - 0.3;
    for (let x = 336; x < 398; x += 12.2) reflector(k, x, yc, 30, { drop: 0.5, r: 6, i: 0.7 });
    if (f === 5) for (let i = 0; i < 5; i++) { k.box(338 + i * 12, y, 27, 340.4 + i * 12, y + 1.1, 28.4, M.machine); k.box(341 + i * 12, y, 27.2, 342.6 + i * 12, y + 1.3, 28.6, mat({ c: '#c8a46e', c2: '#9a7a4a', pat: 'bars', s: 0.25 })); }
    else if (f > 0) for (let i = 0; i < 6; i++) k.box(334 + i * 11, y, 27.5, 340 + i * 11, y + 2.2, 28.4, mat({ c: '#7a6a52', c2: '#5a4a38', pat: 'tiles', s: 0.38 }));
  }
}

function craneway(k) {
  // Landing stages on both faces, staggered floor by floor (S1 p.399).
  const stage = (x, y, z, d) => {
    k.box(x - 1.5, y - 0.25, Math.min(z, z + d * 1.8), x + 1.5, y, Math.max(z, z + d * 1.8), M.concrete);
    railX(k, x - 1.5, x + 1.5, y, z + d * 1.75, 1.0, 1.0);
    railZ(k, x - 1.48, Math.min(z, z + d * 1.75), Math.max(z, z + d * 1.75), y, 1.0, 0.9);
    railZ(k, x + 1.48, Math.min(z, z + d * 1.75), Math.max(z, z + d * 1.75), y, 1.0, 0.9);
  };
  for (let f = 1; f < N.y.length; f++) for (let i = 0; i < 5; i++) {
    const off = (f % 2) * 6.1;
    const x = 336.1 + i * 12.2 + off;
    if (x < X.N1 - 3) { stage(x, N.y[f], N.cw0 + 0.3, 1); stage(x + 3.05, N.y[f], N.cw1 - 0.3, -1); }
  }
  // A box car on the sunk track, being unloaded.
  boxcar(k, NL.car.x0, NL.car.x1, (N.cw0 + N.cw1) / 2, N.track, true);
  boxcar(k, 405, 417.5, (N.cw0 + N.cw1) / 2, N.track, false);
  boxcar(k, 419, 431.5, (N.cw0 + N.cw1) / 2, N.track, false);
  for (let i = 0; i < 4; i++) props.crate(k, 353 + i * 2.5, 0, 15.2, { w: 1.2, h: 0.9, d: 1.0 });
  // Cooper Hewitt mercury-vapour lamps in the roof peak (S1 p.401): long tubes, blue-white.
  const zc = (N.cw0 + N.cw1) / 2;
  for (const x of NL.lamps) {
    k.box(x - 0.9, N.peak - 1.35, zc - 0.15, x + 0.9, N.peak - 1.25, zc + 0.15, M.iron);
    k.cyl(x - 0.85, N.peak - 1.45, zc, 0.05, 1.7, M.bulbBlue, { axis: 'x', seg: 6 });
    k.cyl(x - 0.05, N.peak - 1.25, zc, 0.012, 1.2, M.iron, { seg: 3 });
    k.lamp(x, N.peak - 1.6, zc, { r: 14, i: 0.75, color: '#bfdcff', bulb: false, halo: 1.4 });
  }
}

export function boxcar(k, x0, x1, z, y, open) {
  const red = mat({ c: '#7a3a2a', c2: '#6a3224', pat: 'planks', s: 0.15, cut: '#4a2218' });
  const w = 1.45;
  k.box(x0, y + 1.0, z - w, x1, y + 1.15, z + w, M.iron);
  k.box(x0 + 0.2, y + 1.15, z - w, x1 - 0.2, y + 3.6, z + w, red);
  k.extrudeX([[z - w - 0.1, y + 3.6], [z + w + 0.1, y + 3.6], [z + w + 0.1, y + 3.7], [z, y + 3.95], [z - w - 0.1, y + 3.7]], x0 + 0.1, x1 - 0.1, mat({ c: '#4a4440', cut: '#2a2624' }));
  if (open) k.box((x0 + x1) / 2 - 0.9, y + 1.15, z - w - 0.02, (x0 + x1) / 2 + 0.9, y + 3.3, z - w + 0.05, mat({ c: '#2a2220', cut: '#1a1614' }));
  for (const bx of [x0 + 1.6, x1 - 1.6]) for (const s of [-0.72, 0.72]) for (const dx of [-0.65, 0.65]) k.cyl(bx + dx, y + 0.45, z + s - 0.06, 0.42, 0.12, M.iron, { axis: 'z', seg: 10 });
  for (const bx of [x0 + 1.6, x1 - 1.6]) k.box(bx - 1.0, y + 0.5, z - 0.95, bx + 1.0, y + 1.0, z + 0.95, M.iron);
  k.box(x0 - 0.3, y + 0.8, z - 0.15, x0, y + 1.05, z + 0.15, M.iron);
  k.box(x1, y + 0.8, z - 0.15, x1 + 0.3, y + 1.05, z + 0.15, M.iron);
}

export function buildEast(k) {
  johnR(k);
  floor1(k); floor2(k); floor3(k); floor4(k); floor5(k); floor6(k);
  northBuilding(k);
  craneway(k);
  // Stairs at the west end of the south building, and the elevator shaft at the east end.
  for (let f = 0; f < N.y.length; f++) {
    const y0 = N.y[f], y1 = f + 1 < N.y.length ? N.y[f + 1] : N.roof;
    if (f < N.y.length - 1) stairsX(k, 331.0, y0, 337.6, y1, 10.4, 11.9);
  }
  const L = NL.lift;
  for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) k.box(L.x + dx - 0.06, 0, L.z + dz - 0.06, L.x + dx + 0.06, N.roof + 2.6, L.z + dz + 0.06, M.steelDk);
  for (let f = 1; f < N.y.length; f++) k.box(L.x - 1.35, N.y[f] - 0.3, L.z + 1.3, L.x + 1.35, N.y[f] + 0.1, L.z + 1.4, M.steelDk);
  k.box(L.x - 1.5, N.roof, L.z - 1.5, L.x + 1.5, N.roof + 2.8, L.z + 1.5, M.brick);
  // Lamps: ceiling reflectors on every floor (about 2,000 clusters in the two buildings, S1 p.401).
  for (let f = 0; f < N.y.length; f++) {
    const yc = (f + 1 < N.y.length ? N.y[f + 1] : N.roof) - 0.3;
    for (let i = 0; i < N.colX.length - 1; i++) for (const z of [2.6, 9.0]) reflector(k, (N.colX[i] + N.colX[i + 1]) / 2, yc, z, { drop: 0.45, r: 6.5, i: 0.8 });
  }
  void modelT; void wheel; void WR;
}
