/* The Opera: the auditorium and everything under and over it.
 * Stalls, pit, amphitheatre, boxes, corridors, ceiling, ventilation attic, the Rotonde
 * des abonnes beneath, the orchestra pit, the jeu d'orgue and the musicians' foyer.
 * Exports anchors (seats) for the people module.
 */
import { mat, props } from '../../engine/index.js';
import { Y, MT, AX, R1, R2, R3, PROS, TIERS, stallsY, ring } from './common.js';
import { annulus } from './shell.js';

const PI = Math.PI;
const Z0 = -0.45;
export const SEATS = { stalls: [], parterre: [], amph: [], boxes: [[], [], [], [], [], []], pit: [], rotonde: [], corridor: [[], [], [], [], [], []] };
export const HOUSE = {};

const velvetSeat = mat({ c: '#a8242c', c2: '#8a1a20', pat: 'quilt', s: 0.12, cut: '#5a1014' });
const seatBack = mat({ c: '#8e1c24', cut: '#5a1014' });

// An opera armchair: velvet seat and back, facing +x (the stage). Returns the seat anchor.
function stall(k, x, y, z, m = velvetSeat) {
  k.box(x - 0.24, y + 0.2, z - 0.24, x + 0.2, y + 0.46, z + 0.24, m);
  k.box(x - 0.34, y + 0.2, z - 0.25, x - 0.24, y + 0.95, z + 0.25, seatBack);
  return [x, y, z];
}

export function house(k) {
  const L = (x, y, z, o) => k.lamp(x, y, z, o);
  HOUSE.lamps = [];
  // ---------------------------------------------------------------- the stalls, in raked rows
  // Orchestra stalls (fauteuils, x 72..80), the pit benches (parterre, x 64..72) and the rear stalls.
  for (let x = 60.6; x < 80; x += 0.92) {
    const y = stallsY(x + 0.46);
    const zmax = x + 0.92 < AX ? Math.sqrt(Math.max(0, R1 * R1 - (AX - x - 0.92) ** 2)) - 0.25 : R1 - 0.25;
    k.box(x, 6.4, Z0, x + 0.92, y, Math.max(0.5, zmax), MT.stoneD, { top: MT.velvet });
    const fauteuil = x >= 72;
    if (fauteuil) {
      for (let z = 0.7; z < zmax - 0.4; z += 0.62) SEATS.stalls.push(stall(k, x + 0.5, y, z));
    } else if (x >= 64) {
      // Parterre benches: long red benches with a backrest (7 francs, Baedeker 1878).
      k.box(x + 0.25, y + 0.2, 0.2, x + 0.65, y + 0.46, zmax - 0.3, velvetSeat);
      k.box(x + 0.15, y + 0.2, 0.2, x + 0.25, y + 0.95, zmax - 0.3, seatBack);
      for (let z = 0.6; z < zmax - 0.5; z += 0.6) SEATS.parterre.push([x + 0.45, y, z]);
    } else {
      for (let z = 0.7; z < zmax - 0.5; z += 0.62) SEATS.parterre.push(stall(k, x + 0.5, y, z));
    }
  }
  // The central aisle is the cut itself; a side passage runs along the box fronts.
  // ---------------------------------------------------------------- the amphitheatre (eight raked rows)
  const am0 = PI - 0.62, am1 = PI + 0.03;
  for (let i = 0; i < 8; i++) {
    const r0 = 7.4 + i * 0.46, y = TIERS[1] + 0.05 + i * 0.3;
    annulus(k, r0, r0 + 0.46, TIERS[1] - 0.6 + i * 0.3, y, am0, am1, MT.stoneD, MT.velvet);
    for (let a = am0 + 0.06; a < PI - 0.02; a += 0.62 / (7.4 + i * 0.46) * 0.95) {
      const p = ring(a, r0 + 0.24, y);
      if (i % 2 === 0 || a > PI - 0.25) SEATS.amph.push([p[0], p[1], p[2], a]);
      k.boxR(p[0], y + 0.33, p[2], 0.42, 0.26, 0.44, velvetSeat, { y: -a });
    }
  }
  annulus(k, 7.1, 7.4, TIERS[1] - 0.6, TIERS[1] + 0.9, am0, am1, MT.boxFront, MT.velvetD);
  // Soffit of the amphitheatre over the rear stalls.
  annulus(k, 7.1, R1, TIERS[1] - 1.1, TIERS[1] - 0.55, am0, am1, MT.stoneD);
  // ---------------------------------------------------------------- the orchestra pit
  k.box(80, 5.9, Z0, 85.8, Y.pit, 9.6, MT.timber, { top: MT.oak });
  k.box(79.8, Y.pit, Z0, 80.15, 7.9, 9.6, MT.mahogany, { top: MT.velvetD }); // the rail toward the audience
  k.box(80, Y.pit, 9.6, 85.8, 8.4, 9.9, MT.mahogany);
  const r = k.rng('pit');
  for (let x = 80.9; x < 85.3; x += 1.05) for (let z = 0.8; z < 9; z += 1.1) {
    if (x > 85 && z < 1.6) continue;
    const zz = z + (r() - 0.5) * 0.2;
    k.box(x - 0.2, Y.pit, zz - 0.2, x + 0.2, Y.pit + 0.46, zz + 0.2, MT.timber); // chair
    k.box(x + 0.42, Y.pit + 0.9, zz - 0.2, x + 0.45, Y.pit + 1.25, zz + 0.2, mat('#e8dcc0')); // music on the stand
    k.cyl(x + 0.45, Y.pit, zz, 0.012, 0.9, MT.ironD, { seg: 4 });
    SEATS.pit.push([x, Y.pit, zz]);
  }
  // Conductor's desk at the stage end (he faces the stage, fr.wikipedia Orchestre).
  k.box(85.0, Y.pit, 0.2, 85.4, Y.pit + 0.6, 0.9, MT.mahogany);
  k.box(85.1, Y.pit + 1.15, 0.25, 85.6, Y.pit + 1.2, 0.85, mat('#e8dcc0'));
  // Candle-shielded stand lamps [illustrative] light the music.
  for (let z = 1.5; z < 9; z += 3.2) L(83, Y.pit + 1.4, z, { r: 3, i: 0.5, color: '#ffc070', bulbR: 0.04, halo: 0.25, flicker: true });
  // ---------------------------------------------------------------- forestage, footlights, prompter, jeu d'orgue
  k.box(85.8, 7.9, Z0, PROS + 2.05, 8.5, 7.8, MT.timber, { top: MT.oakWorn });
  // Inverted-flame footlights in glass with draught chimneys (N p.221): a gilt trough with glowing glasses.
  k.box(85.8, 8.5, 1.2, 86.2, 8.75, 7.6, MT.giltD);
  const foot = mat({ c: '#f4e6b8', c2: '#fff0c0', glow: 'always', noEdge: true });
  for (let z = 1.4; z < 7.5; z += 0.38) k.box(85.92, 8.75, z, 86.08, 8.9, z + 0.18, foot);
  HOUSE.foot = [];
  for (let z = 2.0; z < 7.6; z += 2.6) HOUSE.foot.push(L(86.0, 9.0, z, { r: 5.5, i: 0.75, color: '#fff2c8', bulb: false, halo: 0.6, flicker: true }));
  // The prompter's hood on the axis (cut in half by our section).
  k.lathe([[0.75, 8.5], [0.72, 8.95], [0.5, 9.25], [0.0, 9.32]], 86.6, 0, MT.giltD, { seg: 10, a0: -0.05, a1: PI + 0.05, walls: false, capBot: false });
  k.box(86.0, 6.0, Z0, 87.3, 6.2, 1.0, MT.timber); // his box floor
  k.box(86.0, 6.2, 1.0, 87.3, 8.5, 1.1, MT.timber);
  L(86.7, 7.4, 0.5, { r: 1.6, i: 0.6, color: '#ffc070', bulbR: 0.03, halo: 0.15, flicker: true });
  // The chief of lighting's niche beside the prompter (N p.220).
  k.box(86.2, 6.0, 1.1, 88.4, 6.2, 2.4, MT.timber);
  L(87.2, 7.3, 1.8, { r: 1.6, i: 0.5, color: '#ffc070', bulbR: 0.03, halo: 0.15 });
  // Mezzanine of the jeu d'orgue under the stage front, and the "gas organ" itself (N p.218 to 220).
  k.box(82.6, 3.6, Z0, ST(), 4.0, 8.0, MT.timber, { top: MT.pine });
  const brass = mat({ c: '#c8a050', c2: '#e0c070', pat: 'speckle', cut: '#8a6a2a' });
  k.box(83.4, 4.0, 5.6, 87.8, 5.8, 6.2, MT.ironGrey); // the backboard
  for (let row = 0; row < 4; row++) {
    k.cyl(83.5, 4.4 + row * 0.38, 5.45, 0.05, 4.2, brass, { axis: 'x', seg: 6 }); // gas pipes
    for (let x = 83.8; x < 87.6; x += 0.32) k.box(x - 0.04, 4.33 + row * 0.38, 5.3, x + 0.04, 4.47 + row * 0.38, 5.4, MT.ironD); // taps
  }
  // The pressure regulator with its water manometer.
  k.cyl(83.3, 4.0, 4.4, 0.4, 1.1, MT.ironGrey, { seg: 12 });
  k.cyl(83.3, 5.1, 4.4, 0.44, 0.08, brass, { seg: 12 });
  k.box(83.95, 4.3, 4.3, 84.03, 5.6, 4.38, mat({ c: '#cfe0e4', c2: '#4a8aa8', pat: 'bars', s: 0.4 }));
  HOUSE.organWheel = [85.2, 5.3, 5.2]; // the graduated wheel (a moving part, see life.js)
  L(85, 6.0, 3.6, { r: 3, i: 0.6, color: '#ffc070', bulbR: 0.04, halo: 0.2, flicker: true });
  // Musicians' foyer below, with lockers (N p.191: a hundred).
  for (let x = 82.8; x < 86.2; x += 0.62) k.box(x, Y.rot, 9.2, x + 0.58, 3.4, 9.8, MT.mahogany);
  props.table(k, 84.5, Y.rot, 4.5, { w: 2.4, d: 0.9, h: 0.76, items: 'cup' });
  props.bench(k, 84.5, Y.rot, 6.4, { w: 3.0 });
  for (let i = 0; i < 3; i++) k.box(83 + i * 1.2, Y.rot, 8.6, 83.5 + i * 1.2, Y.rot + 1.2, 9.1, mat('#3a2a20')); // instrument cases
  props.lamp(k, 84.5, 3.6, 3.6, { drop: 0.4, r: 4, i: 0.8, light: '#ffcf8a' });
  k.box(82.3, Y.rot, Z0, 82.6, 3.6, 9.8, MT.plaster, { front: false });
  k.box(82.3, Y.rot, 9.8, ST(), 3.6, 10.2, MT.plaster);
  // ---------------------------------------------------------------- boxes and corridors
  // Seats in every box: two at the front rail, a third behind (anchors for the audience).
  const lampsTier = [];
  TIERS.forEach((y, t) => {
    // Curved part.
    for (let a = PI / 2 + 0.16 + 0.095; a < PI - 0.08; a += 0.19) {
      if (t === 1 && a > PI - 0.62) continue; // the amphitheatre stands here
      boxSeats(k, t, y, (r2) => ring(a, r2, y), a);
    }
    // Straight part.
    for (let x = AX + 0.45; x < PROS - 4.1; x += 2.3) boxSeats(k, t, y, (r2) => [x + 1.15 - 0.5, y, r2], PI / 2);
    // Corridor: mosaic, mahogany doors, plinths for busts (some with stand-in casts, N p.135).
    const cy = y;
    for (let a = PI / 2 + 0.25; a < PI - 0.05; a += 0.38) {
      const p = ring(a, R2 + 0.33, cy);
      k.boxR(p[0], cy + 1.05, p[2], 0.04, 2.1, 0.9, MT.mahogany, { y: -a });
      SEATS.corridor[t].push(ring(a, (R2 + R3) / 2, cy));
    }
    for (let a = PI / 2 + 0.44; a < PI - 0.05; a += 0.38) {
      const p = ring(a, R3 - 0.45, cy);
      k.boxR(p[0], cy + 0.6, p[2], 0.6, 1.2, 0.6, MT.marbleW, { y: -a });
      if ((t + Math.round(a * 10)) % 3 === 0) k.sphere(p[0], cy + 1.55, p[2], 0.3, mat('#f4f0e6'), { seg: 8, rings: 6 });
      else if ((t + Math.round(a * 10)) % 3 === 1) k.lathe([[0.18, cy + 1.2], [0.3, cy + 1.5], [0.12, cy + 1.95], [0.18, cy + 2.1]], p[0], p[2], mat({ c: '#2a4a8a', c2: '#d8b860', pat: 'stripes', s: 0.1 }), { seg: 10 });
    }
    for (let x = AX + 1.2; x < PROS - 4; x += 3.4) SEATS.corridor[t].push([x, cy, (R2 + R3) / 2]);
    // Lamps: brackets in the boxes (small) and in the corridors.
    for (const a of [PI * 0.62, PI * 0.82]) { const p = ring(a, R2 - 0.2, y + 1.9); lampsTier.push(L(p[0], p[1], p[2], { r: 4.6, i: 0.8, color: '#ffc878', bulbR: 0.05, halo: 0.25 })); }
    lampsTier.push(L(AX + 8, y + 1.9, R2 - 0.2, { r: 4.6, i: 0.8, color: '#ffc878', bulbR: 0.05, halo: 0.25 }));
    for (const a of [PI * 0.7, PI * 0.95]) { const p = ring(a, R3 - 0.3, y + 2.2); L(p[0], p[1], p[2], { r: 4, i: 0.6, color: '#ffcf8a', bulbR: 0.05, halo: 0.25 }); }
    L(AX + 6, y + 2.2, R3 - 0.3, { r: 4, i: 0.6, color: '#ffcf8a', bulbR: 0.05, halo: 0.25 });
  });
  HOUSE.boxLamps = lampsTier;
  // ---------------------------------------------------------------- the proscenium
  // Painted lambrequin (with "ANNO 1669", N p.152) and the gilt frame.
  k.box(PROS - 0.35, 18.4, Z0, PROS + 0.05, 22.6, 8.4, mat({ c: '#9a2228', c2: '#d8b050', pat: 'stripes', s: 0.6, cut: '#5a1014' }));
  k.box(PROS - 0.4, 18.2, Z0, PROS + 0.1, 18.5, 8.4, MT.gilt);
  k.box(PROS - 0.6, 8.5, 7.8, PROS + 0.1, 22.8, 8.6, MT.gilt);
  k.box(PROS - 0.7, 22.6, Z0, PROS + 0.1, 23.4, 8.6, MT.gilt);
  // ---------------------------------------------------------------- the ceiling ring of lights
  // A ring of gas globes and jewel lanterns on the cornice (N p.144).
  HOUSE.cornice = [];
  for (let a = 0.12; a < PI + 0.01; a += 0.26) {
    const p = ring(a, R1 - 0.1, 27.7);
    HOUSE.cornice.push(L(p[0], p[1], p[2], { r: 5.5, i: 0.5, color: '#ffd890', bulbR: 0.12, halo: 0.5 }));
  }
  // ---------------------------------------------------------------- ventilation attic and chandelier gear
  // An iron flue rises from above the chandelier to the lantern of the dome (N p.228).
  k.cyl(AX, 30.5, 0, 1.4, 16.4, MT.ironGrey, { seg: 16, r2: 1.2 });
  // The chandelier's winch and four counterweights (fr.wikipedia).
  k.box(AX + 4, 33.4, 3, AX + 7, 34.4, 5, MT.timber);
  k.cyl(AX + 4.2, 34.9, 4, 0.5, 2.6, MT.timber, { axis: 'x', seg: 10 });
  for (const [dx, dz] of [[-3.2, 1.2], [3.2, 1.2], [-3.2, 3.6], [3.2, 3.6]]) {
    k.box(AX + dx - 0.3, 31.2, dz - 0.3, AX + dx + 0.3, 32.4, dz + 0.3, MT.ironD);
    k.cyl(AX + dx, 32.4, dz, 0.02, 4.0, MT.ironD, { seg: 4 });
    k.cyl(AX + dx, 36.4, dz, 0.25, 0.2, MT.iron, { axis: 'x', seg: 8 });
  }
  // Air registers in the attic floor (34 of them, 1.40 x 0.60 m, N p.226) and ducts to the boxes.
  for (let a = 0.3; a < PI; a += 0.42) { const p = ring(a, 13.5, 28.55); k.boxR(p[0], p[1], p[2], 1.4, 0.06, 0.6, MT.grate, { y: -a }); }
  for (let a = PI / 2 + 0.2; a < PI; a += 0.5) { const p = ring(a, 16.5, 30.8); k.boxR(p[0], p[1], p[2], 0.9, 1.6, 0.9, MT.ironGrey, { y: -a }); }
  L(AX + 6, 31.5, 4, { r: 4, i: 0.4, color: '#ffc070', bulbR: 0.04, halo: 0.2 });
  L(AX - 8, 31.5, 6, { r: 4, i: 0.4, color: '#ffc070', bulbR: 0.04, halo: 0.2 });
  // ---------------------------------------------------------------- the Rotonde des abonnes
  rotonde(k);
}

function ST() { return 88.5; }

// Box chairs and a mirror at the back; seat anchors for the audience.
function boxSeats(k, t, y, at, a) {
  const front = at(R1 + 0.55), back = at(R1 + 1.5);
  const P = SEATS.boxes[t];
  for (const [p, dz] of [[front, -0.42], [front, 0.42], [back, 0]]) {
    const ox = Math.sin(a) * dz, oz = -Math.cos(a) * dz;
    const q = [p[0] + ox, y, p[2] + oz];
    k.box(q[0] - 0.2, y + 0.2, q[2] - 0.2, q[0] + 0.2, y + 0.46, q[2] + 0.2, velvetSeat);
    P.push([q[0], y, q[2], a]);
  }
  void t;
}

function rotonde(k) {
  // The floor and the vault of the Rotonde under the stalls (Garnier's signature is in its arabesques).
  const yv = 6.2;
  annulus(k, 0.01, 11.2, yv - 0.5, yv, -0.03, PI + 0.03, MT.stoneD);
  k.box(AX, 0.3, Z0, AX + 0.01, 0.31, 0.01, MT.stoneD);
  // Ceiling paint (arabesques) on the underside.
  annulus(k, 0.01, 11.1, yv - 0.55, yv - 0.5, -0.03, PI + 0.03, mat({ c: '#e8d8b0', c2: '#c8a060', pat: 'rings', s: 0.6, cut: '#a8946a' }));
  // Sixteen fluted columns of Jura stone (N p.75): our half shows eight.
  for (let i = 0; i < 8; i++) {
    const a = (i + 0.5) * (PI / 8);
    const p = ring(a, 7.8, 0.3);
    k.cyl(p[0], 0.3, p[2], 0.42, 0.4, MT.stoneD, { seg: 10 });
    k.cyl(p[0], 0.7, p[2], 0.34, 4.4, mat({ c: '#e8dcbc', c2: '#d4c6a0', pat: 'bars', s: 0.11, cut: '#bba878' }), { seg: 12 });
    k.cyl(p[0], 5.1, p[2], 0.34, 0.6, MT.marbleW, { seg: 10, r2: 0.5 });
    // Benches between the columns for the waiting servants.
    const b = ring(a + PI / 16, 9.7, 0.3);
    k.boxR(b[0], 0.55, b[2], 2.2, 0.08, 0.45, MT.timber, { y: -(a + PI / 16) + PI / 2 });
    k.boxR(b[0], 0.42, b[2], 2.1, 0.25, 0.4, MT.stoneD, { y: -(a + PI / 16) + PI / 2 });
    SEATS.rotonde.push([b[0], 0.3, b[2], a + PI / 16]);
    // A bronze lamp and a Sevres vase on alternate bays.
    if (i % 2) k.lathe([[0.2, 0.3], [0.3, 0.6], [0.4, 1.1], [0.18, 1.6], [0.25, 1.75]], ring(a, 10.5, 0)[0], ring(a, 10.5, 0)[2], mat({ c: '#2a3e7a', c2: '#d8b860', pat: 'stripes', s: 0.15 }), { seg: 10 });
  }
  // The central round seat.
  k.lathe([[1.6, 0.3], [1.6, 0.75], [0.6, 0.78], [0.5, 1.6], [0.0, 1.62]], AX, 0, MT.velvet, { seg: 18, a0: -0.05, a1: PI + 0.05, walls: false, capBot: false });
  for (let a = 0.3; a < PI; a += 0.7) { const p = ring(a, 1.7, 0.3); SEATS.rotonde.push([p[0], 0.3, p[2], a]); }
  // Wall round the Rotonde; bronze lamps.
  annulus(k, 10.8, 11.2, 0.3, 5.7, 0.3, PI - 0.25, MT.stone);
  for (let a = 0.6; a < PI; a += 0.75) { const p = ring(a, 7.8, 4.6); k.lamp(p[0], p[1], p[2], { r: 6, i: 0.7, color: '#ffcf8a', bulbR: 0.1, halo: 0.4 }); }
}

export { R3 };
