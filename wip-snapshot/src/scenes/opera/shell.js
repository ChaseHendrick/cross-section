/* The Opera: ground, envelope, floors, roofs, the dome, the stage gable and the statues.
 * Rooms and their furniture are in rooms-*.js; this file draws the building's bones.
 */
import { mat, props } from '../../engine/index.js';
import { Y, D, MT, WIN, AX, R1, R2, R3, R4, PROS, ST0, ST1, SZ, TIERS, stageY, ring, TAU } from './common.js';

const PI = Math.PI;
const Z0 = -0.45; // every solid starts just in front of the cut so the cut shows its section

// ------------------------------------------------------------------ ground and city
export function ground(k) {
  const r = k.rng('ground');
  // The Place and the streets round the building: pavement slabs at street level.
  k.box(-90, -0.5, Z0, 0, 0, 90, MT.paving);
  k.box(0, -0.5, D.front + 1, 190, 0, 90, MT.paving);
  // Aprons of pavement between each block's far wall and the street line.
  for (const [x0, x1, z0] of [[29, 50, D.stair + 1], [50, 86.5, 21.5], [86.5, 116.5, 28], [116.5, 139, D.back + 1], [139, 155, D.admin + 1], [155, 190, D.court + 1]]) k.box(x0, -0.5, z0, x1, x0 > 130 ? 2.0 : 0, D.front + 1, MT.paving);
  k.box(172, -0.5, Z0, 190, 2.0, D.court + 1, MT.paving);
  // Earth in section under everything, around the cellars and the cistern.
  k.box(-90, -22, Z0, 0, -0.5, 60, MT.earth);
  k.box(0, -22, Z0, 79, -6.4, 40, MT.earth);
  k.box(0, -6.4, D.front + 1, 190, -0.5, 60, MT.earth);
  k.box(79, -22, Z0, 128, Y.wells, 40, MT.earth);
  k.box(128, -22, Z0, 190, -0.5, 40, MT.earth);
  k.box(139, -0.5, Z0, 190, 1.6, D.admin + 1, MT.earth);
  // Kerbs and the carriage way across the Place.
  k.box(-90, 0, -0.2, -9, 0.14, 0.05, MT.stoneD);
  k.box(-62, -0.02, Z0, -14, 0.01, 40, MT.asphalt);
  // City blocks behind the Opera (rue Scribe, rue Auber side): Haussmann fronts, lit at night.
  const block = (x0, x1, z0, h, mans) => {
    const c = mat({ c: '#ddd0ae', c2: '#c8ba94', pat: 'ashlar', s: 0.6, cut: '#a89a78' });
    k.box(x0, 0, z0, x1, h, z0 + 14, c);
    // Mansard roof and chimney stacks.
    k.extrudeX([[z0, h], [z0 + 2.2, h + mans], [z0 + 12, h + mans], [z0 + 14, h]], x0, x1, MT.slate);
    for (let x = x0 + 3; x < x1 - 2; x += 7 + r() * 5) k.box(x, h + mans - 0.2, z0 + 6, x + 1.6, h + mans + 1.6, z0 + 7.2, MT.brick);
    // Rows of tall windows on the front facing the Opera, with shop fronts below.
    const floors = Math.floor((h - 5) / 3.4);
    for (let x = x0 + 1.2; x < x1 - 1.2; x += 2.8) {
      for (let f = 0; f < floors; f++) {
        const y = 5 + f * 3.4;
        const lit = r() < 0.55;
        k.box(x, y, z0 - 0.08, x + 1.2, y + 2.2, z0 + 0.05, lit ? WIN : mat({ c: '#6a7a84', c2: '#4a5a64', pat: 'panes', s: 0.4, cut: '#3a4448' }));
      }
      k.box(x - 0.3, 0.3, z0 - 0.06, x + 1.5, 3.6, z0 + 0.05, r() < 0.5 ? WIN : mat({ c: '#4a3a2a', c2: '#3a2c20', pat: 'panels', s: 0.6 }));
    }
    // Iron balcony at the second floor and the fifth.
    k.box(x0, 8.4, z0 - 0.7, x1, 8.55, z0, MT.ironD);
    k.box(x0, 8.55, z0 - 0.7, x1, 9.4, z0 - 0.62, mat({ c: '#2e2c2a', pat: 'bars', s: 0.12, c2: '#3e3a36' }));
    k.box(x0, 18.6, z0 - 0.7, x1, 18.75, z0, MT.ironD);
  };
  block(-88, -40, 52, 21, 4.6);
  block(-36, 14, 58, 21, 4.6);
  block(18, 70, 58, 22, 4.8);
  block(74, 128, 58, 22, 4.8);
  block(132, 188, 56, 21, 4.6);
}

// ------------------------------------------------------------------ the facade block (x 0..29)
export function frontBlock(k) {
  const S = MT.stone;
  // Perron: ten broad steps up to the portico (N p.69).
  for (let i = 0; i < 10; i++) {
    const x0 = -7 + i * 0.7;
    k.box(x0, 0, Z0, 1, 0.16 * (i + 1), D.front - 7.5, MT.stoneP);
  }
  // Ground storey of the facade: seven arches on the facade line, piers between.
  const P = 7.2, AW = 2.3, spring = 6.8, top = 11.2;
  for (const zc of [0, P, 2 * P, 3 * P]) {
    const arch = [];
    for (let i = 0; i <= 12; i++) { const a = PI - (i / 12) * PI; arch.push([zc + Math.cos(a) * AW, spring + Math.sin(a) * AW]); }
    arch.push([zc + AW, top], [zc - AW, top]);
    k.extrudeX(arch.map(([z, y]) => [z, y]), -0.2, 1.8, S);
    // Glazed iron gates in the bays and a draught lobby behind (N p.69).
    if (zc > 0) k.box(0.9, Y.vest, zc - AW, 1.0, spring + 0.6, zc + AW, mat({ c: '#3a3832', c2: '#2a2824', pat: 'bars', s: 0.18, cut: '#1e1c1a' }));
  }
  for (const zc of [P / 2, P * 1.5, P * 2.5]) {
    k.box(-0.4, 0, zc - 1.3, 1.8, top, zc + 1.3, S);
    // A sculpture group on its plinth before each pier (four groups on the facade; our half shows these).
    k.box(-2.6, Y.vest, zc - 1.2, -0.4, Y.vest + 1.4, zc + 1.2, MT.stoneD);
    group(k, -1.5, Y.vest + 1.4, zc, MT.stoneP);
  }
  // The corner pavilion, solid, with its own arch and the gilded group on top.
  k.box(-1.2, 0, 3 * P + 2.3, 1.8, Y.facadeTop + 0.6, D.front, S);
  k.box(-1.6, 23.2, 3 * P + 2.0, 1.8, 24.0, D.front + 0.4, MT.stoneD);
  k.box(-1.6, Y.facadeTop, 3 * P + 2.0, 1.8, Y.facadeTop + 0.6, D.front + 0.4, MT.stoneD);
  winged(k, 0.2, Y.facadeTop + 0.6, 29.5, 7.5, MT.gilt);
  // Loggia storey: paired monolithic columns about 10 m tall (Baedeker 1884).
  k.box(-0.6, top, Z0, 1.8, Y.loggia + 0.2, 3 * P + 2.3, MT.stoneD); // the loggia floor slab edge and balustrade base
  k.box(-0.4, Y.loggia + 0.2, Z0, 0.3, Y.loggia + 1.1, 3 * P + 2.3, mat({ c: '#e4d6ac', c2: '#c4b080', pat: 'bars', s: 0.28, cut: '#bba878' }));
  for (const zc of [P / 2, P * 1.5, P * 2.5]) {
    for (const dz of [-0.85, 0.85]) {
      k.box(0.0, Y.loggia + 0.2, zc + dz - 0.7, 1.4, Y.loggia + 1.4, zc + dz + 0.7, MT.stoneD);
      k.cyl(0.7, Y.loggia + 1.4, zc + dz, 0.55, 8.6, MT.marbleR, { seg: 12 });
      k.box(0.05, Y.loggia + 10.0, zc + dz - 0.68, 1.35, Y.loggia + 10.6, zc + dz + 0.68, MT.gilt);
    }
  }
  // Entablature and the attic with its medallions and gilded mask frieze.
  k.box(-0.8, 22.6, Z0, 1.8, 24.0, 3 * P + 2.3, S);
  k.box(-0.81, 23.0, Z0, -0.79, 23.5, 3 * P + 2.3, MT.gilt);
  k.box(-0.2, 24.0, Z0, 1.8, 31.4, 3 * P + 2.3, S);
  k.box(-0.9, 31.4, Z0, 1.8, Y.facadeTop, D.front + 0.4, MT.stoneD);
  for (const zc of [P / 2, P * 1.5, P * 2.5]) k.cyl(-0.26, 27.6, zc, 1.3, 0.1, MT.gilt, { axis: 'x', seg: 16 });
  for (let z = 0.6; z < 3 * P + 2; z += 1.8) k.sphere(-0.85, 30.6, z, 0.28, MT.gilt, { seg: 6, rings: 4 });
  // Wall between portico and vestibule; the vestibule's far wall; floor of the ground storey.
  k.box(-0.2, 0.9, Z0, 23, Y.vest, D.front, MT.stoneP);
  k.box(8.5, Y.vest, 1.6, 9.5, top, D.front, S);
  k.box(8.5, 7.4, Z0, 9.5, top, 1.6, S);
  k.box(1.8, Y.vest, D.front - 7.5, 23, top, D.front - 6.5, S);
  // Vaults over the portico and vestibule (shallow arches in section).
  vault(k, 1.8, 8.5, 9.6, top, D.front - 7.5, MT.stoneP);
  vault(k, 9.5, 17, 9.8, top, D.front - 7.5, MT.stoneP);
  // Floor slab of the loggia, Grand Foyer and avant-foyer.
  k.box(1.8, top, Z0, 29, Y.foyer, D.front, MT.stoneD, { top: MT.parquet });
  // Contrôle level: ten green marble steps up from the vestibule (N p.73).
  for (let i = 0; i < 10; i++) k.box(17 + i * 0.2, Y.vest, Z0, 19, Y.vest + 0.16 * (i + 1), 12, MT.marbleG);
  k.box(19, 0.9, Z0, 34, Y.ctrl, 16, MT.stoneP, { top: MT.mosaic });
  // Walls of the Grand Foyer: windows to the loggia (x 9..10), mirrors opposite (x 20..21).
  k.box(9, Y.foyer, 1.2, 10, 24.5, D.foyerEnd, S);
  k.box(9, 20.5, Z0, 10, 24.5, 1.2, S);
  k.box(20, Y.foyer, 2.4, 21, 24.5, D.foyerEnd, MT.oldGold);
  k.box(20, 19.5, Z0, 21, 24.5, 2.4, MT.oldGold);
  // The Grand Foyer vault (54 x 13 x 18 m, N p.106), drawn across its width.
  barrel(k, 9, 21, 24.5, Y.foyerVault, Z0, D.foyerEnd, MT.oldGold, S);
  k.box(9, Y.foyer, D.foyerEnd, 21, 27, D.foyerEnd + 1, S);
  // Loggia ceiling and the attic store over it.
  k.box(1.8, 23.0, Z0, 9, 23.8, D.front - 7.5, MT.stoneD, { bottom: MT.mosaicGold });
  // Avant-foyer: a barrel vault of gold mosaic (fr.wikipedia), 20 m long (here 10 m in our half).
  k.box(21, Y.foyer, 10, 29, 21.5, 11, S);
  barrel(k, 21, 29, 17.5, 21.5, Z0, 10, MT.mosaicGold, MT.stoneD);
  k.box(21, 21.5, Z0, 29, 22.1, 16, MT.stoneD);
  // Roofs: a terrace behind the attic, the pitched zinc roof over the foyer and stores.
  k.box(1.8, 30.4, Z0, 29, 31.0, D.front, MT.timber, { top: MT.pine });
  shellRoof(k, [[1.8, 32.0], [9, 32.0], [19, 38.6], [29, 33.4]], 0.5, Z0, D.front, MT.zinc);
  k.box(-0.2, 31.0, D.front, 29, 32, D.front + 1, S);
  // The far end of the block at the depth of the side pavilions.
  k.box(1.8, 0, D.front, 29, 30.4, D.front + 1, S);
  // Chimney stacks with coppered crowns (fr.wikipedia), on the roof.
  for (const [x, z] of [[12, 14], [26, 22], [16, 30]]) { k.box(x, 33, z, x + 1.4, 41, z + 1.4, MT.stoneD); k.cyl(x + 0.7, 41, z + 0.7, 0.9, 0.7, MT.copper, { seg: 10 }); }
}

// A roof (or any shell) of thickness t along a polyline in x-y, extruded in depth.
export function shellRoof(k, pts, t, z0, z1, m) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    k.extrude([[ax, ay - t], [bx, by - t], [bx, by], [ax, ay]], z0, z1, m);
  }
}
// A shallow vault in section between x0 and x1 (crown at yc, springing at y1 - rise), along z.
function vault(k, x0, x1, ys, ytop, z1, m) {
  const pts = [];
  const n = 10, w = x1 - x0;
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + w * t, ys + Math.sin(PI * t) * (ytop - ys - 0.4)]); }
  pts.push([x1, ytop], [x0, ytop]);
  k.extrude(pts, Z0, z1, m);
}
// A barrel vault between x0 and x1 springing at ys with its crown at yc, along z. m inside, mo outside.
function barrel(k, x0, x1, ys, yc, z0, z1, m, mo) {
  const n = 16, cx = (x0 + x1) / 2, rx = (x1 - x0) / 2, ry = yc - ys;
  const inner = [], outer = [];
  for (let i = 0; i <= n; i++) {
    const a = PI - (i / n) * PI;
    inner.push([cx + Math.cos(a) * rx, ys + Math.sin(a) * ry]);
    outer.push([cx + Math.cos(a) * (rx + 0.01), ys + Math.sin(a) * (ry + 0.7)]);
  }
  for (let i = 0; i < n; i++) {
    const a = inner[i], b = inner[i + 1], c = outer[i + 1], d = outer[i];
    k.extrude([a, b, c, d], z0, z1, i % 4 === 1 ? m : m, { side: m });
  }
  void mo;
}

// A stone group: three robed figures on a mound (a stand-in for the facade sculpture).
function group(k, x, y, z, m) {
  k.lathe([[0.9, y], [0.8, y + 0.9], [0.3, y + 1.2]], x, z, m, { seg: 10 });
  const fig = (dx, dz, h, lean) => {
    k.lathe([[0.32, y], [0.22, y + h * 0.55], [0.16, y + h * 0.75]], x + dx, z + dz, m, { seg: 8 });
    k.sphere(x + dx + lean, y + h * 0.84, z + dz, 0.13, m, { seg: 8, rings: 5 });
    k.beam([x + dx, y + h * 0.72, z + dz], [x + dx + lean * 3, y + h * 1.05, z + dz + 0.2], 0.08, m);
  };
  fig(0, 0, 2.6, 0.08); fig(-0.2, -0.55, 2.1, -0.06); fig(0.15, 0.6, 2.2, 0.1);
}
// A gilded winged figure (Harmony and Poetry crown the facade, 7.5 m, gilded by Christofle).
export function winged(k, x, y, z, h, m, opt = {}) {
  k.box(x - 1.2, y, z - 1.2, x + 1.2, y + 0.6, z + 1.2, MT.stoneD);
  const b = y + 0.6, s = h / 7.5;
  k.lathe([[0.9 * s, b], [0.75 * s, b + 2.4 * s], [0.42 * s, b + 4.2 * s], [0.34 * s, b + 4.9 * s]], x, z, m, { seg: 10 });
  k.lathe([[0.36 * s, b + 4.9 * s], [0.42 * s, b + 5.4 * s], [0.3 * s, b + 5.9 * s]], x, z, m, { seg: 8 });
  k.sphere(x, b + 6.3 * s, z, 0.33 * s, m, { seg: 8, rings: 6 });
  // Wings swept up and back.
  for (const sd of [-1, 1]) {
    k.boxR(x + 0.35 * s, b + 5.6 * s, z + sd * 1.0 * s, 0.18 * s, 3.0 * s, 1.1 * s, m, { x: sd * 0.5, z: -0.25 });
    k.boxR(x + 0.5 * s, b + 6.6 * s, z + sd * 1.5 * s, 0.14 * s, 1.8 * s, 0.8 * s, m, { x: sd * 0.8, z: -0.35 });
  }
  // Arms raised, holding a wreath or lyre.
  k.beam([x, b + 5.6 * s, z - 0.3 * s], [x - 0.3 * s, b + 7.0 * s, z - 0.5 * s], 0.18 * s, m);
  k.beam([x, b + 5.6 * s, z + 0.3 * s], [x - 0.3 * s, b + 7.0 * s, z + 0.5 * s], 0.18 * s, m);
  if (opt.lyre) {
    const L = (a, b2) => k.tube([a, b2], 0.07 * s, m, { seg: 5 });
    const top = b + 7.6 * s;
    L([x - 0.3 * s, top - 1.0 * s, z - 0.55 * s], [x - 0.3 * s, top + 0.4 * s, z - 0.75 * s]);
    L([x - 0.3 * s, top - 1.0 * s, z + 0.55 * s], [x - 0.3 * s, top + 0.4 * s, z + 0.75 * s]);
    L([x - 0.3 * s, top + 0.25 * s, z - 0.8 * s], [x - 0.3 * s, top + 0.25 * s, z + 0.8 * s]);
    L([x - 0.3 * s, top - 1.0 * s, z - 0.55 * s], [x - 0.3 * s, top - 1.0 * s, z + 0.55 * s]);
  } else k.lathe([[0.55 * s, b + 7.2 * s], [0.6 * s, b + 7.3 * s], [0.5 * s, b + 7.4 * s]], x - 0.3 * s, z, m, { seg: 12, capTop: false, capBot: false });
}

// ------------------------------------------------------------------ the staircase hall (x 29..50)
export function stairHall(k) {
  const S = MT.stone;
  // Floors: Rotonde level under the landing, the cellars below.
  k.box(29, -0.5, Z0, 50, Y.rot, D.stair, MT.stoneD, { top: MT.mosaic });
  // Far wall of the cage, rising through all the levels.
  k.box(29, Y.rot, D.stair, 50, Y.stairTop + 0.6, D.stair + 1, MT.marbleR);
  // Cross wall with the amphitheatre door at x 50 (the auditorium side).
  k.box(50, Y.rot, 2.6, 51, 32, D.stair + 1, S);
  // Under the cross wall, from the avant-foyer: arches into the cage above y 12.
  k.box(28, 21.5, Z0, 29.2, Y.stairTop + 0.6, D.stair + 1, S);
  // The ceiling with Pils's painted compartments and the skylight lantern (fr.wikipedia).
  k.box(29, Y.stairTop, 7.5, 50, Y.stairTop + 0.6, D.stair + 1, MT.stoneD, { bottom: mat({ c: '#c8a870', c2: '#7a8aa8', pat: 'panels', s: 3.5, cut: '#8a7244' }) });
  k.box(29, Y.stairTop, Z0, 34, Y.stairTop + 0.6, 7.5, MT.stoneD, { bottom: MT.oldGold });
  k.box(45, Y.stairTop, Z0, 50, Y.stairTop + 0.6, 7.5, MT.stoneD, { bottom: MT.oldGold });
  // Lantern: glazed lay-light and the glass roof above.
  k.box(34, Y.stairTop + 0.2, Z0, 45, Y.stairTop + 0.35, 7.5, MT.glassSky);
  k.extrude([[33.5, Y.stairTop + 0.6], [33.5, Y.lantern - 0.4], [39.5, Y.lantern + 1.2], [45.5, Y.lantern - 0.4], [45.5, Y.stairTop + 0.6]], Z0, 8, MT.glassSky);
  // Store attic and roof over the hall.
  shellRoof(k, [[29, 33.4], [33.5, 35]], 0.4, Z0, D.stair + 1, MT.zinc);
  shellRoof(k, [[45.5, 35], [51, 33]], 0.4, Z0, D.stair + 1, MT.zinc);
  k.box(33.5, 34.6, 8, 45.5, 35, D.stair + 1, MT.zinc);
  k.box(29, Y.stairTop + 0.6, D.stair, 51, 34.6, D.stair + 1, MT.stone);
}

// ------------------------------------------------------------------ the auditorium shell (x 50..86.5)
// Box tiers, corridors, outer drum, ceiling bowl, ventilation attic and dome.
export function houseShell(k) {
  const A0 = PI / 2, A1 = PI + 0.03;
  // Rotonde floor (under the house) and the galleries to the staircase.
  k.box(50, -0.5, Z0, PROS, Y.rot, R4, MT.stoneD, { top: MT.mosaic });
  // Outer wall: the drum, from the Rotonde to the dome's springing.
  annulus(k, R3, R4, Y.rot, 33.0, A0, PI - 0.14, MT.stone);
  // Near the axis the drum is pierced by the galleries from the Rotonde and the amphitheatre door.
  for (const [y0, y1] of [[5.0, 7.6], [12.6, 33.0]]) k.box(50, y0, Z0, 51, y1, 3.1, MT.stone);
  k.box(AX, Y.rot, R3, PROS, 33.0, R4, MT.stone);
  // Terrace round the dome.
  annulus(k, 16, R4 + 0.4, 32.4, 33.4, 0.8, A1, MT.stoneD);
  k.box(AX, 32.4, 16, PROS + 2, 33.4, R4 + 0.4, MT.stoneD);
  // Tier floors (box floors and corridors) and the top of the fifth tier.
  TIERS.forEach((y, i) => {
    if (i === 0) {
      annulus(k, R1 - 0.2, R3, y - 0.6, y, A0, A1, MT.stoneD, MT.velvet);
      k.box(AX, y - 0.6, R1 - 0.2, PROS, y, R3, MT.stoneD, { top: MT.velvet });
      return;
    }
    annulus(k, R1 - 0.25, R3, y - 0.45, y, A0, A1, MT.stoneD, MT.velvet);
    k.box(AX, y - 0.45, R1 - 0.25, PROS, y, R3, MT.stoneD, { top: MT.velvet });
  });
  annulus(k, R1 - 0.3, R4, Y.ceil, Y.ceil + 0.5, A0, A1, MT.stoneD);
  k.box(AX, Y.ceil, R1 - 0.3, PROS, Y.ceil + 0.5, R4, MT.stoneD);
  // Box backs (with mahogany doors to the corridor), box fronts in red and gold.
  TIERS.forEach((y, i) => {
    const h = (TIERS[i + 1] || Y.ceil) - y - (i === 5 ? 0 : 0.45);
    annulus(k, R2, R2 + 0.3, y, y + h, A0, A1, MT.damask, MT.damask);
    k.box(AX, y, R2, PROS - 3.6, y + h, R2 + 0.3, MT.damask);
    // The parapet: gilded front, velvet capping.
    annulus(k, R1 - 0.25, R1, y, y + 0.85, A0, A1, MT.boxFront, MT.velvetD);
    k.box(AX, y, R1 - 0.25, PROS - 0.1, y + 0.85, R1, MT.boxFront, { top: MT.velvetD });
    // Partitions between the boxes, radial on the curve, across on the straight.
    for (let a = A0 + 0.16; a < PI - 0.05; a += 0.19) wedge(k, a, R1, R2, y, y + h - 0.02, MT.damask);
    for (let x = AX + 1.6; x < PROS - 3.8; x += 2.3) k.box(x, y, R1, x + 0.1, y + h - 0.02, R2, MT.damask);
  });
  // The stage boxes beside the proscenium, framed by gilt columns (N p.152).
  for (let i = 0; i < 4; i++) {
    const y0 = 8.0 + i * 4.4;
    k.box(PROS - 3.6, y0, R1 - 0.6, PROS - 3.3, y0 + 4.0, R2, MT.gilt);
    k.box(PROS - 3.6, y0 - 0.4, R1 - 0.6, PROS, y0, R2, MT.stoneD, { top: MT.velvet });
    k.box(PROS - 3.6, y0, R1 - 0.6, PROS, y0 + 0.95, R1 - 0.35, MT.boxFront);
  }
  for (const z of [R1 - 0.9, R2 - 0.4]) k.cyl(PROS - 3.45, 8.0, z, 0.32, 18.5, MT.gilt, { seg: 10 });
  // Corridor ceilings are the next tier's floor; the corridor outer wall face.
  // The ceiling bowl: copper panels hung on iron rods (N p.142), painted as a sky.
  const sky = (seg, kk) => {
    if (seg >= 3) return MT.stoneD;
    const t = kk / 18; // 0 = stage side, 1 = the back of the house
    return mat({ c: seg === 0 ? '#c8d0c4' : t < 0.35 ? '#e2c482' : t > 0.7 ? '#6e8cb2' : '#9ab4cc', c2: '#e8e0c8', pat: 'speckle', cut: '#6a5a40' });
  };
  k.lathe([[0.2, 30.0], [6, 29.6], [R1 + 0.6, 28.4], [R1 + 0.6, 28.9], [6, 30.1], [0.2, 30.5], [0.2, 30.0]], AX, 0, MT.stoneD, { seg: 18, a0: -0.03, a1: PI + 0.03, walls: false, capTop: false, capBot: false, matFn: (s, kk) => sky(s <= 1 ? s : 3, kk) });
  // Gilded cornice ring at the foot of the ceiling, with the jewel lanterns (N p.144).
  annulus(k, R1 - 0.3, R1 + 0.8, 27.9, 28.4, -0.03, PI + 0.03, MT.gilt);
  // Between the bowl's edge and the proscenium: a flat cove.
  k.box(AX + R1 - 0.2, Y.ceil, Z0, PROS + 0.1, Y.ceil + 0.6, R1 - 0.3, MT.stoneD, { bottom: MT.gilt });
  // Ventilation attic floor ring and the dome.
  const dome = [];
  const rb = 17.2, yb = 33.4, yt = 46.5;
  for (let i = 0; i <= 10; i++) { const t = i / 10; dome.push([rb * Math.cos(t * PI / 2 * 0.86) + 0.2, yb + (yt - yb) * Math.sin(t * PI / 2)]); }
  const inner = dome.map(([r, y]) => [r - 0.7, y - 0.5]).reverse();
  const prof = dome.concat(inner);
  prof.push(dome[0]);
  // Outer face first going up (copper with darker ribs), inner face coming down.
  k.lathe(prof, AX, 0, MT.copper, { seg: 24, a0: -0.03, a1: PI + 0.03, walls: false, capTop: false, capBot: false,
    matFn: (s, kk) => (s >= 10 ? MT.timber : kk % 3 === 0 ? mat({ c: '#6a5a42', c2: '#4e7a62', pat: 'plates', s: 1.0, cut: '#4e3a28' }) : MT.copper) });
  // The lantern of the dome: gilded, with the flue's outlet.
  k.lathe([[3.4, yt - 0.6], [3.3, yt + 2.6], [3.6, yt + 2.9], [2.2, yt + 4.4], [0.6, yt + 5.0], [0.0, yt + 5.1]], AX, 0, MT.gilt, { seg: 16, a0: -0.03, a1: PI + 0.03, walls: false });
  for (let a = 0.2; a < PI; a += 0.39) k.boxR(AX + Math.cos(a) * 3.38, yt + 1.1, Math.sin(a) * 3.38, 0.12, 2.0, 0.8, WIN, { y: -a });
  k.cyl(AX, yt + 5.0, 0, 0.12, 1.6, mat({ c: '#d2aa4c', whole: true }), { seg: 6 });
  k.sphere(AX, yt + 6.8, 0, 0.35, mat({ c: '#e0bc5a', whole: true }), { seg: 8, rings: 6 });
}

// The Emperor's pavilion on the west side of the auditorium, still unfinished in 1876, its
// stones left rough-cut (fr.wikipedia). Seen beyond the cut, behind the drum of the house.
export function pavilion(k) {
  const rough = mat({ c: '#d8c8a0', c2: '#bfae84', pat: 'stone', s: 1.1, cut: '#a89870' });
  k.box(64, 0, 22.5, 79, 18, 29, rough);
  k.box(60, 0, 29, 83, 24, 46, rough);
  k.box(59.4, 24, 28.4, 83.6, 25.4, 46.6, MT.stoneD);
  for (const z of [31, 36, 41]) for (const x of [61.6, 81.4]) k.box(x - 0.8, 2, z - 0.8, x + 0.8, 24, z + 0.8, MT.stone);
  k.lathe([[7.6, 25.4], [7.6, 28.5], [6.9, 31.2], [5.2, 33.6], [2.6, 35.2], [0.6, 35.6]], 71.5, 37.5, MT.copper, { seg: 18 });
  k.lathe([[1.0, 35.5], [0.9, 37.4], [0.2, 38.2]], 71.5, 37.5, MT.giltD, { seg: 10 });
  // Scaffold poles where the masons were still at work [illustrative].
  for (let x = 60.5; x < 83; x += 2.8) k.box(x, 0, 28.3, x + 0.14, 26, 28.44, MT.timber);
  for (let y = 4; y < 26; y += 4) k.box(60.4, y, 28.1, 83, y + 0.12, 28.3, MT.timber);
}

// A slab (or wall) on the horseshoe between radii r0..r1 and heights y0..y1, angle range a0..a1.
export function annulus(k, r0, r1, y0, y1, a0, a1, m, mTop) {
  const seg = Math.max(4, Math.round(((a1 - a0) / PI) * 22));
  k.lathe([[r1, y0], [r1, y1], [r0, y1], [r0, y0], [r1, y0]], AX, 0, m, { seg, a0, a1, walls: false, capTop: false, capBot: false, matFn: mTop ? (s) => (s === 1 ? mTop : m) : null });
}
// A thin radial wall on the horseshoe at angle a.
function wedge(k, a, r0, r1, y0, y1, m) {
  const p = ring(a, (r0 + r1) / 2, (y0 + y1) / 2);
  k.boxR(p[0], p[1], p[2], r1 - r0, y1 - y0, 0.1, m, { y: -a });
}

// ------------------------------------------------------------------ the stage house (x 86.5..116.5)
export function stageShell(k) {
  const S = MT.stone, B = MT.brick;
  // Proscenium wall with the opening (max 15.60 x 10 m; architectural frame about 16 x 14 m).
  k.box(PROS, -6.5, 8.0, ST0, Y.roof, SZ + 1.5, B);
  k.box(PROS, 22.5, Z0, ST0, Y.roof, 8.0, B);
  k.box(PROS, -6.5, Z0, ST0 - 1.2, 4.0, 8.0, B);
  // Back wall of the stage, with the great opening to the Foyer de la Danse at stage level.
  k.box(ST1, Y.cistern, 7.5, ST1 + 1.5, Y.roof, SZ + 1.5, B);
  k.box(ST1, 19.8, Z0, ST1 + 1.5, Y.roof, 7.5, B);
  k.box(ST1, Y.cistern, Z0, ST1 + 1.5, 0.0, 7.5, B);
  // The far side wall of the stage house.
  k.box(PROS, Y.cistern, SZ, ST1 + 1.5, Y.roof, SZ + 1.5, B);
  // Gable roof: ridge on the axis at 55.97 m, a ridge walk 2 m wide between 1.5 m walls (N p.66).
  const roofProf = [[Z0, Y.ridge], [SZ + 2.4, Y.roof - 0.2], [SZ + 2.4, Y.roof - 0.8], [Z0, Y.ridge - 0.6]];
  k.extrudeX(roofProf, PROS - 0.6, ST1 + 2.1, MT.zinc);
  k.box(PROS - 0.6, Y.ridge - 0.1, 1.0, ST1 + 2.1, Y.ridge + 1.5, 1.4, S);
  k.box(PROS - 0.6, Y.ridge - 0.1, Z0, ST1 + 2.1, Y.ridge + 0.05, 1.0, MT.stoneD);
  // Gable ends in stone (south over the proscenium, north over the back wall).
  for (const [x0, x1] of [[PROS - 1.2, PROS + 0.6], [ST1 + 0.3, ST1 + 2.1]]) {
    k.extrudeX([[Z0, Y.roof - 1], [Z0, Y.ridge + 1.6], [1.6, Y.ridge + 1.6], [SZ + 2.6, Y.roof + 0.4], [SZ + 2.6, Y.roof - 1]], x0, x1, S);
  }
  k.box(PROS - 1.4, Y.roof - 1.6, Z0, ST1 + 2.3, Y.roof - 0.6, SZ + 2.6, MT.stoneD);
  // Gutters "like canals" at the eaves (N p.67).
  k.box(PROS - 0.6, Y.roof - 0.6, SZ + 2.2, ST1 + 2.1, Y.roof + 0.1, SZ + 2.9, MT.zinc);
  // The cistern: concrete tank, brick walls 2.2 m thick (fr.wikipedia), foundation below.
  k.box(79, Y.wells, Z0, 128, Y.cistern - 0.4, 34, MT.rubble);
  k.box(79, Y.cistern - 0.4, Z0, 128, Y.cistern, 34, MT.concrete);
  k.box(76.8, Y.cistern - 0.4, Z0, 79, Y.under[4] + 0.5, 34, MT.brickD);
  k.box(127.5, Y.cistern - 0.4, Z0, 129.7, 0, 34, MT.brickD);
  k.box(79, Y.cistern - 0.4, 31.8, 128, Y.under[4] + 0.5, 34, MT.brickD);
  // Foundation wells: concrete shafts sunk 8 m below the cistern (N p.250).
  for (let x = 82; x < 127; x += 6.2) k.box(x, Y.wells, Z0, x + 2.2, Y.cistern - 0.4, 30, MT.concrete);
}

// ------------------------------------------------------------------ the back block and administration
export function backShell(k) {
  const S = MT.stone;
  const x0 = ST1 + 1.5, x1 = 138.5;
  // Slabs: chorus hall floor, extras' room, Foyer de la Danse (raked like the stage), costume store, workshop, roof.
  k.box(x0, -0.2, Z0, x1 + 0.5, Y.chorus, D.back, MT.stoneD, { top: MT.oak });
  k.box(122, Y.extras - 0.3, Z0, x1 + 0.5, Y.extras, D.back, MT.timber, { top: MT.pine });
  // The Foyer de la Danse floor slopes exactly like the stage (N p.176).
  k.extrude([[x0, Y.back - 0.4], [x1 + 0.5, Y.back - 0.4], [x1 + 0.5, Y.back + (x1 + 0.5 - 122) * 0.045], [122, Y.back], [x0, Y.back]], Z0, D.back, MT.timber, { side: MT.oakWorn });
  k.box(x0, 19.5, Z0, x1 + 0.5, Y.costume, D.back, MT.stoneD, { bottom: mat({ c: '#e6d2a0', c2: '#b8c8d8', pat: 'panels', s: 2.2, cut: '#a8946a' }) });
  k.box(x0, Y.workshop - 0.3, Z0, x1 + 0.5, Y.workshop, D.back, MT.timber, { top: MT.pine });
  k.box(x0, Y.backRoof, Z0, x1 + 0.5, Y.backRoof + 0.5, D.back, MT.timber);
  shellRoof(k, [[x0, 33.0], [x1 + 0.5, 34.5]], 0.4, Z0, D.back + 1, MT.zinc);
  k.box(x1, Y.backRoof + 0.5, Z0, x1 + 0.5, 34.5, D.back + 1, MT.stone);
  // Far wall with windows (the chorus hall has six, fr.wikipedia), cross wall between corridor and foyer.
  k.box(x0, -0.2, D.back, x1 + 0.5, Y.backRoof + 0.5, D.back + 1, S);
  k.box(121.6, Y.back, 2.2, 122.2, 19.5, D.back, MT.paint);
  k.box(121.6, 16.0, Z0, 122.2, 19.5, 2.2, MT.paint);
  k.box(121.6, Y.chorus, 2.2, 122.2, Y.extras - 0.3, D.back, MT.plaster);
  k.box(121.6, Y.extras, 3.0, 122.2, Y.back - 0.4, D.back, MT.plaster);
  // Access to the cistern: a vaulted chamber behind the stage (fr.wikipedia; Garnier's section).
  k.box(x0, Y.cistern - 0.4, Z0, 127.5, -10, 10, MT.brickD);
  vault(k, x0, 127.5, -1.8, -0.2, 10, MT.brickD);
  k.box(x0, -10, 10, 127.5, -0.2, 11, MT.brickD);
  k.box(127.5, -10, Z0, 128.6, -0.2, 11, MT.brickD);
  // Administration (x 139..155): five storeys and a mansard.
  const a0 = 139, a1 = 155, Dz = D.admin;
  k.box(x1 + 0.5, Y.court - 0.4, Z0, a1, Y.court, Dz, MT.stoneD, { top: MT.parquet });
  for (const y of [7.6, 13.2, 18.8, 24.4, 30.0]) k.box(a0, y - 0.4, Z0, a1, y, Dz, MT.stoneD, { top: MT.parquet });
  k.box(x1 + 0.4, -0.2, Z0, x1 + 1.2, Y.backRoof, 1.4, S);
  k.box(x1 + 0.4, 2.0, 1.4, x1 + 1.2, Y.backRoof, D.back, S);
  k.box(a1 - 0.2, Y.court, 3.2, a1 + 0.9, 30.4, Dz + 1, S);
  k.box(a1 - 0.2, 5.6, Z0, a1 + 0.9, 30.4, 3.2, S); // over the stage door
  k.box(a0, Y.court, Dz, a1, 30.4, Dz + 1, S);
  k.box(a0, 30.0, Z0, a1 + 0.9, 30.6, Dz + 1, MT.stoneD);
  shellRoof(k, [[a0 - 0.4, 30.6], [a0 + 1.4, 34.4], [a1 - 1, 34.4], [a1 + 1.2, 30.6]], 0.35, Z0, Dz + 1, MT.slate);
  // Dormers and chimney stacks.
  for (let x = a0 + 2.4; x < a1 - 2; x += 4.2) { k.box(x, 31.0, Dz - 1.2, x + 1.6, 33.6, Dz + 0.4, S); k.box(x + 0.3, 31.4, Dz - 1.26, x + 1.3, 33.0, Dz - 1.2, WIN); }
  for (const x of [142, 151]) { k.box(x, 33.5, 6, x + 1.6, 39, 7.6, MT.stoneD); k.cyl(x + 0.8, 39, 6.8, 1.0, 0.8, MT.copper, { seg: 10 }); }
  // The courtyard of the administration: paving, curved wall, monumental gate.
  k.box(a1, Y.court - 0.4, Z0, 172, Y.court, D.court + 1, MT.paving);
  k.box(a1, Y.court, D.court, 170, 7.5, D.court + 1, S);
  k.box(169, Y.court, Z0 + 4, 170, 7.5, D.court, S);
  k.box(169.1, 6.9, Z0, 170.1, 9.0, 4, MT.stoneD);
  // Iron gates of the courtyard.
  k.box(169.4, Y.court, Z0, 169.6, 6.9, 4, mat({ c: '#2e2c2a', c2: '#46423c', pat: 'bars', s: 0.16, cut: '#1e1c1a' }));
  void props;
}

// ------------------------------------------------------------------ Apollo, Pegasus and Minerva
export function statues(k) {
  const BR = mat({ c: '#4a4036', c2: '#6a5a46', pat: 'speckle', whole: true, cut: '#2a221a' });
  const GL = mat({ c: '#e0b850', c2: '#f4d880', pat: 'speckle', whole: true });
  // Apollo lifting his golden lyre on the south gable (7.50 m, 13 t, N p.250; fr.wikipedia).
  const x = PROS - 0.3, y = Y.ridge + 1.6;
  k.box(x - 1.0, y - 0.2, -1.0, x + 1.0, y + 0.6, 1.0, mat({ c: '#cbb98c', whole: true }));
  const b = y + 0.6;
  k.lathe([[0.75, b], [0.62, b + 1.6], [0.4, b + 3.0], [0.34, b + 3.6]], x, 0, BR, { seg: 10 });
  k.lathe([[0.34, b + 3.6], [0.4, b + 4.0], [0.28, b + 4.5]], x, 0, BR, { seg: 8 });
  k.sphere(x, b + 4.8, 0, 0.3, BR, { seg: 8, rings: 6 });
  k.beam([x, b + 4.1, -0.3], [x - 0.15, b + 5.6, -0.55], 0.17, BR);
  k.beam([x, b + 4.1, 0.3], [x - 0.15, b + 5.6, 0.55], 0.17, BR);
  // The lyre, raised above his head.
  const L = (p, q) => k.tube([p, q], 0.07, GL, { seg: 5 });
  const ty = b + 5.3;
  L([x - 0.2, ty, -0.45], [x - 0.2, ty + 1.5, -0.75]); L([x - 0.2, ty, 0.45], [x - 0.2, ty + 1.5, 0.75]);
  L([x - 0.2, ty + 1.35, -0.8], [x - 0.2, ty + 1.35, 0.8]); L([x - 0.2, ty, -0.45], [x - 0.2, ty, 0.45]);
  for (const z of [-0.2, 0, 0.2]) L([x - 0.2, ty, z], [x - 0.2, ty + 1.35, z * 1.4]);
  k.cyl(x - 0.2, ty + 1.5, 0, 0.03, 0.9, GL, { seg: 4 }); // the lightning rod above it
  // Pegasus groups at the corners of the south gable (fr.wikipedia): a winged horse on each.
  pegasus(k, PROS - 0.3, Y.roof + 0.4, SZ + 1.6, BR);
  // Minerva's bust on the north gable (fr.wikipedia).
  const mx = ST1 + 1.2, my = Y.ridge + 1.6;
  k.box(mx - 0.8, my, -0.8, mx + 0.8, my + 1.4, 0.8, mat({ c: '#cbb98c', whole: true }));
  k.lathe([[1.2, my + 1.4], [1.0, my + 2.6], [0.45, my + 3.0], [0.32, my + 3.4]], mx, 0, BR, { seg: 10 });
  k.sphere(mx, my + 3.8, 0, 0.5, BR, { seg: 8, rings: 6 });
  k.lathe([[0.55, my + 3.8], [0.45, my + 4.5], [0.05, my + 5.0]], mx, 0, BR, { seg: 8 });
}
function pegasus(k, x, y, z, m) {
  k.box(x - 1.6, y, z - 1.0, x + 1.6, y + 0.8, z + 1.0, mat({ c: '#cbb98c', whole: true }));
  const by = y + 2.3;
  k.boxR(x, by, z, 2.6, 0.95, 0.85, m, { z: 0.35 });
  k.boxR(x - 1.3, by + 1.1, z, 0.5, 1.5, 0.45, m, { z: -0.4 });
  k.boxR(x - 1.7, by + 1.7, z, 0.75, 0.38, 0.36, m, { z: 0.3 });
  for (const [dx, dz, a] of [[-0.9, -0.3, 0.6], [-0.9, 0.3, 0.9], [0.9, -0.3, -0.1], [0.9, 0.3, 0.1]]) k.boxR(x + dx, by - 0.9, z + dz, 0.18, 1.6, 0.18, m, { z: a });
  for (const sd of [-1, 1]) k.boxR(x + 0.3, by + 1.2, z + sd * 0.8, 1.8, 0.12, 1.4, m, { x: sd * 0.7, z: -0.4 });
  // A figure of Fame on its back.
  k.lathe([[0.32, by + 0.4], [0.2, by + 1.6], [0.14, by + 1.9]], x + 0.2, z, m, { seg: 8 });
  k.sphere(x + 0.2, by + 2.1, z, 0.16, m, { seg: 6, rings: 4 });
  k.beam([x + 0.2, by + 1.7, z], [x - 0.3, by + 3.0, z], 0.1, m);
}

export { stageY, ring, TAU, R2, ST0 };
