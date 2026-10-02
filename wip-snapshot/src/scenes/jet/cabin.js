/* The Jumbo Jet: the main deck, the spiral stair, the upper deck lounge and the flight deck.
 *
 * Every seat is recorded in S.seats (with the hip position of whoever sits in it) so the
 * people module can fill the aircraft. Layout: dossier section 3a (zones Z05 to Z27); seat
 * positions inside each zone are layout estimates from Boeing's mixed-class plan [S1] and
 * Pan Am's seat counts [S12].
 */
import { mat, props } from '../../engine/index.js';
import { ZC, FL, CEIL, UF, SKIN, M, C, DOORS, farWall, wallZ, topY, shade } from './common.js';
import { DOOR_GAP } from './airframe.js';

// Zones along the main deck (x ranges).
export const Z = {
  A: [3.2, 9.0], door1: [9.0, 10.0], stair: [9.6, 11.2], fcGalley: [11.2, 13.0], fwdLav: [13.0, 14.2],
  B: [10.0, 17.0], g2: [16.9, 18.2], C: [19.4, 29.7], lav3: [29.9, 32.1], D: [32.3, 39.0],
  g4a: [39.05, 40.2], g4b: [41.3, 43.5], E: [43.6, 54.4], door5: [54.4, 55.9], aft: [55.9, 58.8],
  lounge: [8.6, 14.8], bar: [14.8, 15.6], fd: [3.9, 7.4],
};
// Seat centres across the cabin (scene z). Economy 3-3-3 (seats 0.5 m: a triple is 1.51 m [S1]).
export const ZS_CENTRE = [ZC - 0.5, ZC, ZC + 0.5];
export const ZS_RIGHT = [ZC + 1.52, ZC + 2.02, ZC + 2.52];
const ACCENT = { C: '#a8402e', D: '#c8a03a', E: '#c87032' }; // (R): reported zone accents

// ------------------------------------------------------------------ seats
// An economy seat facing the nose; xb is the front face of its backrest.
function ySeat(k, xb, z, accent, o = {}) {
  const y = o.y != null ? o.y : FL;
  const cush = o.cushion || M.beige;
  k.box(xb - 0.46, y + 0.36, z - 0.23, xb, y + 0.47, z + 0.23, cush);
  k.boxR(xb + 0.07, y + 0.8, z, 0.12, 0.7, 0.46, o.back || M.beige, { z: -0.16 });
  k.boxR(xb + 0.115, y + 0.8, z, 0.03, 0.66, 0.44, M.seatShell, { z: -0.16 }); // back shell
  k.boxR(xb + 0.025, y + 1.06, z, 0.03, 0.18, 0.4, M.cover, { z: -0.16 }); // headrest cover
  k.box(xb - 0.42, y + 0.05, z - 0.18, xb - 0.06, y + 0.36, z - 0.15, M.seatLeg);
  if (o.arm !== false) k.box(xb - 0.42, y + 0.58, z + 0.225, xb - 0.02, y + 0.63, z + 0.265, mat({ c: accent || '#8a6a4a', cut: '#5a3a2a' }));
}
// A first-class seat: wider, deeper, with a thick armrest each side.
function fSeat(k, xb, z, colour, o = {}) {
  const y = o.y != null ? o.y : FL, w = 0.29, f = o.face || -1;
  const back = f < 0 ? xb : xb; // xb is the backrest face; seat extends towards the facing side
  const sx0 = f < 0 ? xb - 0.56 : xb, sx1 = f < 0 ? xb : xb + 0.56;
  const cm = colour === 'blue' ? M.blue : M.beige;
  k.box(sx0, y + 0.3, z - w + 0.06, sx1, y + 0.46, z + w - 0.06, cm);
  const bx = f < 0 ? back + 0.08 : back - 0.08;
  k.boxR(bx, y + 0.86, z, 0.16, 0.82, w * 2 - 0.1, cm, { z: f < 0 ? -0.14 : 0.14 });
  k.boxR(bx + (f < 0 ? 0.06 : -0.06), y + 1.2, z, 0.04, 0.2, w * 2 - 0.16, M.cover, { z: f < 0 ? -0.14 : 0.14 });
  for (const s of [-1, 1]) k.box(sx0 - 0.02, y + 0.12, z + s * (w - 0.03) - 0.04, sx1 + 0.02, y + 0.62, z + s * (w - 0.03) + 0.04, M.seatShell);
  k.box(sx0 + 0.12, y, z - 0.12, sx1 - 0.12, y + 0.3, z + 0.12, M.seatLeg);
}

function seatRecord(S, o) { S.seats.push(o); return o; }

// ------------------------------------------------------------------ fittings
function lav(k, x0, x1, z0, z1, o = {}) {
  const y = FL, h = 2.15;
  const wall = M.door;
  k.box(x0, y, z1 - 0.05, x1, y + h, z1, wall);
  if (o.left !== false) k.box(x0, y, z0, x0 + 0.05, y + h, z1, wall);
  if (o.right !== false) k.box(x1 - 0.05, y, z0, x1, y + h, z1, wall);
  k.box(x0, y + h, z0, x1, y + h + 0.05, z1, M.ceiling);
  k.box(x0 + 0.02, y, z0 + 0.02, x1 - 0.02, y + 0.01, z1 - 0.02, mat({ c: '#c8c0b0', c2: '#b8b0a0', pat: 'checker', s: 0.15 }));
  // Toilet against the back wall, basin and mirror beside it.
  const tx = o.toiletLeft ? x0 + 0.32 : x1 - 0.32;
  k.box(tx - 0.2, y, z1 - 0.55, tx + 0.2, y + 0.42, z1 - 0.05, mat('#f4f2ec'));
  k.box(tx - 0.22, y + 0.42, z1 - 0.58, tx + 0.22, y + 0.46, z1 - 0.08, mat('#e8e4dc'));
  const bx = o.toiletLeft ? x1 - 0.32 : x0 + 0.32;
  k.box(bx - 0.25, y, z1 - 0.5, bx + 0.25, y + 0.85, z1 - 0.05, mat({ c: '#d8ccb0', c2: '#c8bca0', pat: 'grain', s: 0.3 }));
  k.cyl(bx, y + 0.83, z1 - 0.28, 0.15, 0.04, M.steel, { seg: 12 });
  k.box(bx - 0.22, y + 1.15, z1 - 0.07, bx + 0.22, y + 1.65, z1 - 0.05, mat({ c: '#c8dae2', c2: '#e8f2f6', pat: 'panes', s: 0.44 }));
  k.lamp((x0 + x1) / 2, y + h - 0.12, (z0 + z1) / 2, { color: '#f4f6ff', r: 1.4, i: 0.55, bulbR: 0.05, halo: 0.25 });
}

// A galley island: open towards us, counters, carts and ovens along its back.
function galley(k, S, x0, x1, o = {}) {
  const y = FL, z0 = ZC - 0.755, z1 = ZC + 0.755, h = CEIL - FL;
  k.box(x0, y + 0.004, z0, x1, y + 0.012, z1, M.floorGalley);
  k.box(x0, y, z0, x0 + 0.06, y + h, z1, M.laminate);
  k.box(x1 - 0.06, y, z0, x1, y + h, z1, M.laminate);
  k.box(x0, y, z1 - 0.06, x1, y + h, z1, M.laminate);
  // Lower cabinets with carts parked in their bays.
  const cz0 = z1 - 0.72, cz1 = z1 - 0.06;
  k.box(x0 + 0.06, y, cz0, x1 - 0.06, y + 0.04, cz1, M.steelDark);
  k.box(x0 + 0.06, y + 0.98, cz0 - 0.04, x1 - 0.06, y + 1.04, cz1, M.steel);
  const nb = Math.max(1, Math.floor((x1 - x0 - 0.12) / 0.34));
  for (let i = 0; i < nb; i++) {
    const bx = x0 + 0.08 + i * ((x1 - x0 - 0.16) / nb), bw = (x1 - x0 - 0.16) / nb - 0.04;
    if (!o.noCarts && i % 2 === 0) {
      k.box(bx, y + 0.06, cz0 + 0.02, bx + bw, y + 0.96, cz1 - 0.02, mat({ c: '#b8bcc0', c2: '#a8acb0', pat: 'panels', s: 0.3 }));
      k.box(bx + 0.02, y + 0.84, cz0 - 0.02, bx + bw - 0.02, y + 0.88, cz0 + 0.02, M.black);
    } else k.box(bx, y + 0.06, cz1 - 0.08, bx + bw, y + 0.96, cz1 - 0.04, M.steelDark);
  }
  // Ovens and warming cabinets above the worktop, doors facing us.
  const oz = z1 - 0.48;
  k.box(x0 + 0.06, y + 1.2, oz, x1 - 0.06, y + 2.2, z1 - 0.06, M.steel);
  const no = Math.max(1, Math.floor((x1 - x0 - 0.12) / 0.42));
  for (let i = 0; i < no; i++) {
    const ox = x0 + 0.1 + i * ((x1 - x0 - 0.2) / no), ow = (x1 - x0 - 0.2) / no - 0.06;
    k.box(ox, y + 1.28, oz - 0.02, ox + ow, y + 1.68, oz, mat({ c: '#3a3c40', c2: '#ffb860', glow: 'night' }));
    k.box(ox, y + 1.76, oz - 0.02, ox + ow, y + 2.12, oz, mat({ c: '#a8acb0', c2: '#989ca0', pat: 'panels', s: 0.18 }));
  }
  // On the worktop: coffee makers, stacked trays, a bottle or two.
  const r = k.rng('galley' + x0);
  for (let x = x0 + 0.2; x < x1 - 0.2; x += 0.32) {
    const kind = r.pick(['urn', 'trays', 'bottle', 'trays', 'cups']);
    const zz = z1 - 0.45;
    if (kind === 'urn') { k.cyl(x, y + 1.04, zz, 0.09, 0.32, M.steel, { seg: 10 }); k.cyl(x, y + 1.36, zz, 0.05, 0.04, M.black, { seg: 8 }); }
    else if (kind === 'trays') for (let t = 0; t < 4; t++) k.box(x - 0.13, y + 1.04 + t * 0.03, zz - 0.18, x + 0.13, y + 1.06 + t * 0.03, zz + 0.18, mat(t % 2 ? '#d8d0bc' : '#c8bca4'));
    else if (kind === 'bottle') { k.cyl(x, y + 1.04, zz, 0.035, 0.24, mat('#3a5a3a'), { seg: 8 }); k.cyl(x + 0.09, y + 1.04, zz + 0.05, 0.035, 0.26, mat('#6a2a2a'), { seg: 8 }); }
    else for (let c = 0; c < 3; c++) k.cyl(x - 0.08 + c * 0.08, y + 1.04, zz, 0.03, 0.07, mat('#f4f0e8'), { seg: 7 });
  }
  if (o.champagne) { k.cyl(x0 + 0.5, y + 1.04, z1 - 0.62, 0.11, 0.2, M.chrome, { seg: 12 }); k.cyl(x0 + 0.5, y + 1.18, z1 - 0.62, 0.04, 0.24, mat('#2a4a2a'), { seg: 8 }); }
  if (o.pan) { k.cyl(x1 - 0.5, y + 1.04, z1 - 0.62, 0.13, 0.04, M.black, { seg: 12 }); k.box(x1 - 0.36, y + 1.06, z1 - 0.64, x1 - 0.18, y + 1.08, z1 - 0.6, M.black); }
  // Bright galley light.
  k.box(x0 + 0.1, CEIL - 0.06, z0 + 0.3, x1 - 0.1, CEIL - 0.02, z1 - 0.3, mat({ c: '#f4f2ea', c2: '#fff8e8', glow: 'night' }));
  k.lamp((x0 + x1) / 2, CEIL - 0.25, ZC, { color: '#f6f4ff', r: 2.6, i: 0.75, bulb: false, halo: 0.4 });
  S.galleys.push({ x0, x1, work: [(x0 + x1) / 2, FL, ZC - 0.1] });
}

// A passenger door on the far wall, seen from inside [S1: 1.07 x 1.93 m].
function doorIn(k, x, o = {}) {
  const zw = farWall(x, FL + 1.0) - 0.02;
  k.box(x - 0.6, FL, zw - 0.06, x + 0.6, FL + 2.05, zw + 0.06, mat({ c: '#cfc4aa', c2: '#bfb49a', cut: '#8a7e66' }));
  k.box(x - 0.535, FL + 0.03, zw - 0.1, x + 0.535, FL + 1.96, zw - 0.04, M.door);
  k.box(x - 0.11, FL + 1.25, zw - 0.12, x + 0.11, FL + 1.55, zw - 0.09, mat({ c: '#bcd2e4', c2: '#5c6e90', glow: 'night' }));
  k.box(x - 0.3, FL + 0.95, zw - 0.16, x + 0.3, FL + 1.0, zw - 0.1, M.chrome);
  k.box(x - 0.45, FL + 0.12, zw - 0.2, x + 0.45, FL + 0.38, zw - 0.09, mat({ c: '#6a6e74', c2: '#5a5e64', pat: 'canvas', s: 0.2 })); // packed escape slide
  k.box(x - 0.2, FL + 2.08, zw - 0.14, x + 0.2, FL + 2.22, zw - 0.08, mat({ c: '#c83a2a', c2: '#ff6a4a', glow: 'night' })); // exit sign
  // Attendant's fold-down jump seat beside the door.
  if (o.jump !== false) {
    const jx = x + (o.jumpSide || 1) * 0.95;
    k.box(jx - 0.24, FL + 0.42, zw - 0.5, jx + 0.24, FL + 0.48, zw - 0.08, mat('#5a6474'));
    k.box(jx - 0.24, FL + 0.48, zw - 0.14, jx + 0.24, FL + 1.1, zw - 0.06, mat('#5a6474'));
  }
}

// Interior windows on the far wall: panes with shades, some half drawn.
function windows(k, x0, x1, y0, y1, S) {
  const r = k.rng('shades' + x0);
  for (let x = Math.ceil((x0 - 0.254) / 0.508) * 0.508 + 0.254; x < x1; x += 0.508) {
    if (DOOR_GAP(x)) continue;
    const zw = farWall(x, (y0 + y1) / 2) - 0.015;
    k.box(x - 0.17, y0 - 0.06, zw - 0.03, x + 0.17, y1 + 0.06, zw + 0.03, mat({ c: '#e4dac4', c2: '#d4caa4', cut: '#9a8e74' }));
    k.box(x - 0.12, y0, zw - 0.05, x + 0.12, y1, zw - 0.02, M.glassWin);
    const sh = r() < 0.35 ? r.range(0.3, 1) : 0;
    if (sh > 0) k.box(x - 0.125, y1 - (y1 - y0) * sh, zw - 0.06, x + 0.125, y1, zw - 0.05, M.shade);
    if (S) S.windows.push([x, (y0 + y1) / 2, zw]);
  }
}

// Ceiling lights, passenger service units and the far-side bins along a stretch of cabin.
function ceilingRun(k, x0, x1) {
  for (let x = x0 + 0.9; x < x1 - 0.4; x += 2.1) {
    k.lamp(x, CEIL - 0.08, ZC + 0.4, { color: '#fff2da', r: 2.6, i: 0.5, bulbR: 0.04, halo: 0.3 });
    k.lamp(x + 1.0, 4.4, farWall(x + 1.0, 4.4) - 0.7, { color: '#fff0d0', r: 2.0, i: 0.45, bulb: false, halo: 0.2 });
  }
  // Far-side stowage bins and their valance.
  const segs = [];
  for (let x = x0; ; x = Math.min(x1, x + 1.2)) {
    const zf = farWall(x, 4.6) + 0.05;
    segs.push({ x, pts: [[zf - 0.62, 4.48], [zf, 4.48], [zf, CEIL + 0.04], [zf - 0.62, CEIL + 0.04]] });
    if (x >= x1) break;
  }
  if (segs.length > 1) k.loft(segs, M.bin);
  // Passenger service units: a strip of reading lights and air nozzles over each block.
  k.box(x0, CEIL - 0.06, ZC - 0.6, x1, CEIL - 0.01, ZC + 0.6, mat({ c: '#e8e0cc', c2: '#cfc6b0', pat: 'rivets', s: 0.86 }));
  k.box(x0, 4.42, farWall(x0 + 1, 4.4) - 1.25, x1, 4.48, farWall(x0 + 1, 4.4) - 0.6, mat({ c: '#e8e0cc', c2: '#cfc6b0', pat: 'rivets', s: 0.86 }));
}

// ------------------------------------------------------------------ the main deck
export function buildMainDeck(k, S) {
  // Zone A: first class in the nose, 2-2-2 narrowing forward [S12, S1].
  k.box(2.95, FL, ZC - 0.6, 3.02, CEIL, farWall(3.0, 4) - 0.05, mat({ c: C.blue747, c2: shade(C.blue747, -0.1), pat: 'panels', s: 0.8 }));
  const rowsA = [4.25, 5.29, 6.33, 7.37, 8.41];
  rowsA.forEach((xb, i) => {
    const room = farWall(xb - 0.25, FL + 0.6) - 0.06;
    const centre = [ZC - 0.3, ZC + 0.3];
    const right = [ZC + 1.36, ZC + 1.96];
    for (const z of centre) { fSeat(k, xb, z, 'blue'); seatRecord(S, { zone: 'A', cls: 'F', x: xb - 0.27, y: FL, z, face: -1, row: i, block: 'c' }); }
    for (const z of right) if (z + 0.29 < room) { fSeat(k, xb, z, 'beige'); seatRecord(S, { zone: 'A', cls: 'F', x: xb - 0.27, y: FL, z, face: -1, row: i, block: 'r' }); }
  });
  windows(k, 3.7, 9.0, 3.55, 3.95, S);
  ceilingRun(k, 3.1, 9.0);
  props.rug(k, 6.2, FL + 0.002, ZC - 0.45, { w: 5.6, d: 0.3, color: '#8a6a48', c2: '#a88a60' });

  // Door 1 vestibule, the spiral stair, first-class galley and forward lavatories (Z12-Z14).
  doorIn(k, DOORS[0], { jumpSide: -1 });
  galley(k, S, Z.fcGalley[0], Z.fcGalley[1], { champagne: true, pan: true });
  lav(k, Z.fwdLav[0], 13.6, ZC - 0.755, ZC + 0.755, { toiletLeft: true });
  lav(k, 13.6, Z.fwdLav[1], ZC - 0.755, ZC + 0.755, { left: false });
  // Zone B: first-class pairs on the right of the island [S12, S14].
  const rowsB = [10.95, 11.99, 13.03, 14.07, 15.11, 16.15, 17.19];
  rowsB.forEach((xb, i) => {
    const swivel = i === 2; // a pair turned to face the next row across a small table [S14]
    for (const z of [ZC + 1.5, ZC + 2.12]) {
      if (swivel) { fSeat(k, xb - 0.6, z, 'beige', { face: 1 }); seatRecord(S, { zone: 'B', cls: 'F', x: xb - 0.6 + 0.27, y: FL, z, face: 1, row: i, block: 'r' }); }
      else { fSeat(k, xb, z, i % 2 ? 'beige' : 'blue'); seatRecord(S, { zone: 'B', cls: 'F', x: xb - 0.27, y: FL, z, face: -1, row: i, block: 'r' }); }
    }
    if (swivel) props.table(k, xb + 0.22, FL, ZC + 1.35, { w: 0.42, d: 0.95, h: 0.66, cloth: '#f4f0e6', items: 'setting' });
  });
  windows(k, 10.0, 17.9, 3.55, 3.95, S);
  ceilingRun(k, 10.0, 18.2);
  // The door 2 galley (Z16) and its cross-aisle.
  galley(k, S, Z.g2[0], Z.g2[1]);
  doorIn(k, DOORS[1]);

  // Economy zones C, D, E: nine abreast, 3-3-3, two aisles [S5, S12], 34 in pitch [S1].
  const econ = (zone, x0, x1, pitch = 0.86) => {
    const rows = [];
    for (let xb = x0 + 0.5; xb < x1; xb += pitch) rows.push(xb);
    rows.forEach((xb, i) => {
      const room = farWall(xb - 0.25, FL + 0.7) - 0.04;
      for (const z of ZS_CENTRE) { ySeat(k, xb, z, ACCENT[zone]); seatRecord(S, { zone, cls: 'Y', x: xb - 0.2, y: FL, z, face: -1, row: i, block: 'c' }); }
      for (const z of ZS_RIGHT) if (z + 0.25 < room) { ySeat(k, xb, z, ACCENT[zone]); seatRecord(S, { zone, cls: 'Y', x: xb - 0.2, y: FL, z, face: -1, row: i, block: 'r' }); }
    });
    return rows;
  };
  S.rows.C = econ('C', Z.C[0], Z.C[1]);
  windows(k, 18.2, 29.9, 3.55, 3.95, S);
  ceilingRun(k, 19.3, 29.8);
  // Door 3: overwing exit, centre lavatories (Z18).
  lav(k, 29.9, 31.0, ZC - 0.755, ZC, { toiletLeft: true });
  lav(k, 31.0, 32.1, ZC - 0.755, ZC, { left: false });
  lav(k, 29.9, 31.0, ZC, ZC + 0.755, { toiletLeft: true });
  lav(k, 31.0, 32.1, ZC, ZC + 0.755, { left: false });
  doorIn(k, DOORS[2], { jumpSide: -1 });
  S.rows.D = econ('D', Z.D[0], Z.D[1]);
  windows(k, 32.0, 39.0, 3.55, 3.95, S);
  ceilingRun(k, 32.1, 39.1);
  // Door 4: the big galley complex (Z20).
  galley(k, S, Z.g4a[0], Z.g4a[1]);
  galley(k, S, Z.g4b[0], Z.g4b[1]);
  doorIn(k, DOORS[3]);
  windows(k, 39.0, 43.6, 3.55, 3.95, S);
  ceilingRun(k, 39.0, 43.6);
  S.rows.E = econ('E', Z.E[0], Z.E[1]);
  windows(k, 43.6, 58.6, 3.55, 3.95, S);
  ceilingRun(k, 43.6, 58.6);
  doorIn(k, DOORS[4], { jumpSide: -1 });
  // The aft cabin (Z23): two last rows, lavatories and an aft galley in the narrowing tail.
  S.rows.aft = [];
  for (const xb of [56.4, 57.26]) {
    const room = farWall(xb - 0.25, FL + 0.7) - 0.04;
    for (const z of [ZC + 1.52, ZC + 2.02, ZC + 2.52]) if (z + 0.25 < room) { ySeat(k, xb, z, ACCENT.E); seatRecord(S, { zone: 'E', cls: 'Y', x: xb - 0.2, y: FL, z, face: -1, row: 99, block: 'r' }); }
  }
  lav(k, 55.9, 56.95, ZC - 0.755, ZC + 0.55, { toiletLeft: true });
  galley(k, S, 57.0, 58.75, { noCarts: false });

  // The film: a pull-down screen at the front of zones C and E [illustrative positions].
  S.screens = [
    { x: 19.5, y0: CEIL - 1.05, y1: CEIL - 0.15, z0: ZC - 0.65, z1: ZC + 0.65, proj: [26.2, CEIL - 0.15, ZC] },
    { x: 43.55, y0: CEIL - 1.05, y1: CEIL - 0.15, z0: ZC - 0.65, z1: ZC + 0.65, proj: [50.0, CEIL - 0.15, ZC] },
  ];
  for (const sc of S.screens) {
    k.box(sc.x - 0.02, sc.y1, sc.z0 - 0.05, sc.x + 0.03, sc.y1 + 0.1, sc.z1 + 0.05, M.steelDark);
    const [px, py, pz] = sc.proj;
    k.box(px - 0.22, py - 0.24, pz - 0.16, px + 0.22, py, pz + 0.16, mat({ c: '#4a4c50', c2: '#3a3c40', pat: 'panels', s: 0.2 }));
    k.cyl(px - 0.22, py - 0.12, pz, 0.05, 0.06, mat('#222'), { axis: 'x', seg: 8 });
  }
}

// ------------------------------------------------------------------ spiral stair (Z07)
// Circular stair rising 2.73 m from the main deck to the upper deck [S1], 13 steps.
export const STAIR = { x: 10.4, z: ZC, r: 0.78, n: 13, a0: 5.4, a1: 0 };
export function stairStep(i) { // centre of step i (0 = bottom), at radius 0.45
  const a = STAIR.a0 + (STAIR.a1 - STAIR.a0) * (i / (STAIR.n - 1));
  const y = FL + ((i + 1) * (UF - FL)) / (STAIR.n + 1);
  return [STAIR.x + Math.cos(a) * 0.45, y, STAIR.z + Math.sin(a) * 0.45, a];
}
export function buildStair(k) {
  const tread = mat({ c: '#b89a6a', c2: '#a48858', pat: 'carpet', s: 0.2, cut: '#7a5a3a' });
  const da = Math.abs(STAIR.a1 - STAIR.a0) / (STAIR.n - 1);
  for (let i = 0; i < STAIR.n; i++) {
    const [, y, , a] = stairStep(i);
    k.lathe([[0.07, y - 0.05], [STAIR.r, y - 0.05], [STAIR.r, y], [0.07, y]], STAIR.x, STAIR.z, tread, { seg: 3, a0: a - da / 2 - 0.02, a1: a + da / 2 + 0.02 });
  }
  k.cyl(STAIR.x, FL, STAIR.z, 0.07, UF - FL + 1.0, M.chrome, { seg: 12 });
  // Handrail on the outer curve, with balusters.
  const rail = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, a = STAIR.a0 + (STAIR.a1 - STAIR.a0) * t;
    rail.push([STAIR.x + Math.cos(a) * STAIR.r, FL + 0.95 + t * (UF - FL), STAIR.z + Math.sin(a) * STAIR.r]);
  }
  k.tube(rail, 0.025, M.chrome, { seg: 5 });
  for (let i = 0; i < STAIR.n; i += 2) {
    const [, y, , a] = stairStep(i);
    k.cyl(STAIR.x + Math.cos(a) * STAIR.r, y, STAIR.z + Math.sin(a) * STAIR.r, 0.012, 0.95, M.chrome, { seg: 4 });
  }
  // A rail round the stairwell on the upper deck.
  props.rail(k, 9.55, 11.25, UF, ZC + 0.85, { h: 0.9, step: 0.42, color: '#c8c8c8', r: 0.02 });
  k.lamp(STAIR.x, UF - 0.25, STAIR.z + 0.6, { color: '#ffe8c0', r: 2.2, i: 0.5, bulbR: 0.05, halo: 0.3 });
}

// ------------------------------------------------------------------ upper deck (Z06, Z08, Z09)
export function buildUpperDeck(k, S) {
  const y = UF;
  // Lounge: banquette along the far wall, two tables, chairs at their ends [S12, S13; layout (R)].
  const banq = mat({ c: '#d6c6a0', c2: '#c4b28a', pat: 'quilt', s: 0.2, cut: '#9a8a68' });
  k.box(11.3, y, ZC + 1.45, 14.6, y + 0.42, ZC + 1.95, banq);
  k.boxR(12.95, y + 0.78, ZC + 1.98, 3.3, 0.62, 0.14, banq, { x: 0.2 });
  for (const tx of [12.1, 13.75]) {
    k.cyl(tx, y, ZC + 0.95, 0.05, 0.66, M.chrome, { seg: 8 });
    k.box(tx - 0.42, y + 0.66, ZC + 0.6, tx + 0.42, y + 0.71, ZC + 1.3, mat({ c: C.blue747, c2: '#2a4a7a', cut: '#24385a' }));
    k.cyl(tx - 0.15, y + 0.71, ZC + 0.9, 0.035, 0.11, mat('#d8e6ea'), { seg: 8 });
    k.cyl(tx + 0.18, y + 0.71, ZC + 1.05, 0.035, 0.09, mat('#c8a050'), { seg: 8 });
    k.cyl(tx, y + 0.71, ZC + 1.1, 0.06, 0.02, mat('#f4f0e6'), { seg: 10 });
    for (const s of [-1, 1]) {
      const cx = tx + s * 0.78;
      k.box(cx - 0.3, y, ZC + 0.65, cx + 0.3, y + 0.42, ZC + 1.25, banq);
      k.box(s > 0 ? cx + 0.18 : cx - 0.3, y + 0.42, ZC + 0.65, s > 0 ? cx + 0.3 : cx - 0.18, y + 0.95, ZC + 1.25, banq);
      S.lounge.push({ x: cx - s * 0.05, y, z: ZC + 0.95, face: -s, seat: 0.42 });
    }
    S.lounge.push({ x: tx - 0.3, y, z: ZC + 1.68, face: 'out', seat: 0.42 });
    S.lounge.push({ x: tx + 0.3, y, z: ZC + 1.68, face: 'out', seat: 0.42 });
    k.lamp(tx, y + 1.25, ZC + 1.55, { color: '#ffd8a0', r: 2.0, i: 0.65, bulbR: 0.05, halo: 0.35 });
  }
  // A small sofa forward of the stairwell.
  k.box(8.75, y, ZC + 0.4, 9.3, y + 0.42, ZC + 1.9, banq);
  k.box(8.75, y + 0.42, ZC + 0.4, 8.9, y + 0.95, ZC + 1.9, banq);
  S.lounge.push({ x: 9.05, y, z: ZC + 0.85, face: 1, seat: 0.42 });
  S.lounge.push({ x: 9.05, y, z: ZC + 1.45, face: 1, seat: 0.42 });
  props.rug(k, 12.4, y + 0.003, ZC + 0.3, { w: 5.0, d: 1.4, color: '#c8b088', c2: '#a8906a' });
  // Three small windows on the far side [S13].
  for (const x of [9.9, 11.6, 13.3]) {
    const zw = farWall(x, 6.45) - 0.015;
    k.box(x - 0.17, 6.19, zw - 0.03, x + 0.17, 6.68, zw + 0.03, mat({ c: '#e4dac4', cut: '#9a8e74' }));
    k.box(x - 0.12, 6.25, zw - 0.05, x + 0.12, 6.62, zw - 0.02, M.glassWin);
  }
  // Service counter and bar (Z09): bottles, ice bin and glasses.
  k.box(14.85, y, ZC - 0.1, 15.2, y + 1.02, ZC + 1.6, M.laminate);
  k.box(14.8, y + 1.02, ZC - 0.12, 15.25, y + 1.06, ZC + 1.62, mat({ c: '#e8e0cc', c2: '#d8d0bc', pat: 'grain', s: 0.2 }));
  const r = k.rng('bar');
  for (let z = ZC + 0.0; z < ZC + 1.5; z += 0.13) {
    k.cyl(15.45, y + 1.3, z, 0.035, r.range(0.18, 0.3), mat(r.pick(['#3a5a3a', '#6a2a2a', '#c8a050', '#2a3a4a', '#e8e0c8'])), { seg: 7 });
  }
  k.box(15.35, y + 1.27, ZC - 0.1, 15.6, y + 1.3, ZC + 1.6, M.wood);
  k.box(15.35, y + 1.72, ZC - 0.1, 15.6, y + 1.75, ZC + 1.6, M.wood);
  for (let z = ZC + 0.05; z < ZC + 1.5; z += 0.15) k.cyl(15.45, y + 1.75, z, 0.03, 0.09, mat('#d8e6ea'), { seg: 7 });
  k.box(14.9, y + 1.06, ZC + 1.15, 15.15, y + 1.18, ZC + 1.45, M.steel); // ice bin
  k.lamp(15.0, y + 1.8, ZC + 0.7, { color: '#ffd8a0', r: 1.6, i: 0.6, bulb: false, halo: 0.25 });
  S.bar = [15.42, y, ZC + 0.7];

  // Vestibule (Z06): cockpit bulkhead with its door, coat closet, the small exit on the far side [S1].
  k.box(7.38, y, ZC - 0.3, 7.46, topY(7.4) - 0.2, ZC + 0.25, mat({ c: '#cfc4aa', cut: '#8a7e66' }));
  k.box(7.38, y, ZC + 1.05, 7.46, topY(7.4) - 0.2, farWall(7.4, 6.0), mat({ c: '#cfc4aa', cut: '#8a7e66' }));
  k.box(7.38, y + 1.95, ZC + 0.25, 7.46, topY(7.4) - 0.2, ZC + 1.05, mat({ c: '#cfc4aa', cut: '#8a7e66' }));
  props.door(k, 7.48, y, ZC + 0.65, { w: 0.78, h: 1.92, color: '#8a7a64', open: false });
  k.box(7.5, y, ZC + 1.15, 8.2, y + 1.8, farWall(7.9, 6.2) - 0.1, M.laminate); // coat closet
  const ezw = farWall(8.0, 6.0) - 0.02;
  k.box(8.0 - 0.33, y + 0.3, ezw - 0.06, 8.0 + 0.33, y + 1.58, ezw + 0.04, M.door); // 0.61 x 1.22 m exit [S1]
  k.box(8.0 - 0.12, y + 1.62, ezw - 0.1, 8.0 + 0.12, y + 1.72, ezw - 0.04, mat({ c: '#c83a2a', c2: '#ff6a4a', glow: 'night' }));
  k.lamp(8.2, y + 1.9, ZC + 0.5, { color: '#ffe8c8', r: 1.8, i: 0.5, bulbR: 0.04, halo: 0.25 });
  // Lounge ceiling lights (warm, indirect).
  for (const x of [9.4, 11.0, 12.6, 14.2]) k.lamp(x, topY(x) - 0.45, ZC + 0.6, { color: '#ffdcae', r: 2.4, i: 0.5, bulbR: 0.04, halo: 0.25 });
  // Hump void aft of the upper deck (Z10): ducts and wiring.
  k.cyl(15.8, 6.3, ZC + 0.4, 0.22, 6.5, M.duct, { axis: 'x', seg: 10 });
  k.cyl(15.8, 6.75, ZC + 1.1, 0.14, 5.0, M.duct, { axis: 'x', seg: 10 });
}

// ------------------------------------------------------------------ flight deck (Z05)
export function buildFlightDeck(k, S) {
  const y = UF;
  const grey = M.panelGrey;
  // Main instrument panel and glareshield.
  k.box(4.05, y + 0.45, ZC - 0.95, 4.42, y + 1.12, ZC + 0.95, M.panel);
  k.box(4.05, y + 1.12, ZC - 1.0, 4.62, y + 1.2, ZC + 1.0, M.black);
  for (let i = 0; i < 18; i++) {
    const zz = ZC - 0.85 + (i % 9) * 0.21, yy = y + 0.62 + Math.floor(i / 9) * 0.26;
    k.cyl(4.42, yy, zz, 0.075, 0.02, M.dial, { axis: 'x', seg: 12 });
  }
  // Centre pedestal with four thrust levers [S3: four engines].
  k.box(4.5, y, ZC - 0.18, 5.45, y + 0.72, ZC + 0.18, grey);
  for (let i = 0; i < 4; i++) k.boxR(4.8, y + 0.88, ZC - 0.12 + i * 0.08, 0.03, 0.3, 0.025, M.chrome, { z: 0.25 });
  for (let i = 0; i < 4; i++) k.box(4.75, y + 1.02, ZC - 0.135 + i * 0.08, 4.85, y + 1.06, ZC - 0.105 + i * 0.08, M.black);
  // Pilots' seats, control columns with yokes.
  for (const zz of [ZC - 0.55, ZC + 0.55]) {
    k.box(5.25, y, zz - 0.12, 5.55, y + 0.3, zz + 0.12, M.seatLeg);
    k.box(5.05, y + 0.3, zz - 0.25, 5.6, y + 0.44, zz + 0.25, mat({ c: '#4a4e58', c2: '#3a3e48', pat: 'quilt', s: 0.12 }));
    k.boxR(5.68, y + 0.95, zz, 0.14, 0.95, 0.5, mat({ c: '#4a4e58', c2: '#3a3e48', pat: 'quilt', s: 0.12 }), { z: -0.12 });
    k.beam([4.62, y, zz], [4.72, y + 0.82, zz], 0.07, M.black);
    k.boxR(4.74, y + 0.86, zz, 0.04, 0.12, 0.34, M.black, { z: 0.2 });
    S.fd.push({ x: 5.36, y, z: zz });
  }
  // Overhead panel.
  k.box(4.75, topY(5.6) - 0.42, ZC - 0.6, 6.3, topY(5.6) - 0.3, ZC + 0.6, mat({ c: '#5a6068', c2: '#3a3e44', pat: 'rivets', s: 0.06 }));
  // Flight engineer's station on the right sidewall: "over fifty gauges" [S34].
  const fez = farWall(6.6, y + 1.0) - 0.08;
  k.box(5.85, y + 0.0, fez - 0.12, 7.3, y + 0.72, fez + 0.06, grey);
  k.box(5.85, y + 0.72, fez - 0.5, 7.3, y + 0.77, fez + 0.06, mat({ c: '#6a6e74', c2: '#5a5e64', pat: 'grain', s: 0.2 }));
  const pz = fez - 0.02;
  k.box(5.85, y + 0.78, pz - 0.04, 7.3, y + 1.85, pz + 0.04, M.panel);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 10; c++) {
    k.cyl(5.98 + c * 0.135, y + 0.9 + r * 0.155, pz - 0.05, 0.05, 0.02, M.dial, { axis: 'z', seg: 10 });
  }
  k.box(6.3, y + 0.77, fez - 0.42, 6.62, y + 0.79, fez - 0.2, mat({ c: '#f4f0e6', c2: '#c8c0b0', pat: 'stripes', s: 0.02 })); // the fuel log
  k.lamp(6.45, y + 1.0, fez - 0.35, { color: '#fff4dc', r: 0.9, i: 0.5, bulbR: 0.03, halo: 0.15 });
  // Engineer's seat (facing the panel) and the observer's jump seat.
  k.box(6.45, y, fez - 0.95, 6.75, y + 0.44, fez - 0.6, mat('#4a4e58'));
  k.box(6.45, y + 0.44, fez - 1.0, 6.75, y + 1.0, fez - 0.92, mat('#4a4e58'));
  S.fe = { x: 6.6, y, z: fez - 0.75 };
  k.box(6.85, y, ZC - 0.2, 7.25, y + 0.44, ZC + 0.2, mat('#5a5e68'));
  S.obs = { x: 7.05, y, z: ZC };
  // Roof escape hatch with inertia reels for the crew [S7].
  const hy = topY(6.4) - 0.14;
  k.box(6.05, hy - 0.06, ZC - 0.3, 6.75, hy + 0.02, ZC + 0.3, mat({ c: '#c8b090', c2: '#b09a7a', pat: 'panels', s: 0.3 }));
  for (const zz of [ZC - 0.18, ZC + 0.18]) k.cyl(6.4, hy - 0.16, zz, 0.07, 0.1, mat('#c83a2a'), { axis: 'z', seg: 10 });
  // Panel floodlights.
  k.lamp(5.0, y + 1.6, ZC, { color: '#f0f4ff', r: 1.8, i: 0.45, bulbR: 0.03, halo: 0.2 });
  k.lamp(6.6, y + 1.9, ZC + 0.8, { color: '#ffe0d0', r: 1.6, i: 0.35, bulbR: 0.03, halo: 0.15 });
  // Chart case and flight bags on the floor.
  k.box(5.7, y, ZC - 0.92, 6.1, y + 0.35, ZC - 0.75, mat('#3a2a20'));
  k.box(6.0, y, ZC + 1.05, 6.35, y + 0.3, ZC + 1.25, mat('#2a2a2e'));
}

export { wallZ, SKIN };
