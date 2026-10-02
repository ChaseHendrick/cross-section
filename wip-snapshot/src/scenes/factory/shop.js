/* The Car Factory: the one-storey machine shop (x 116 to 196): tool room, cylinder-block
 * machining, Craneway No. 1, crank and cam shafts, the magneto line, motor assembly, test
 * blocks, and the employment office with first aid and the English class upstairs.
 */
import { mat, props } from '../../engine/index.js';
import { X, SAW, M, reflector, railX, belt } from './common.js';
import { stairsX } from './shell.js';
import { modelT } from './car.js';

export const SHOP = {
  shafts: [{ z: 3.6, x0: 116.6, x1: 128 }, { z: 7.4, x0: 116.6, x1: 128 }], shaftY: 4.4,
  mill: { x0: 128.6, x1: 135.0, z: 2.6, y: 0.8 },
  crane: { x0: 139.6, x1: 150.4, y: 10.7 },
  grinders: [152.2, 154.8, 157.4], grindZ: 2.4,
  mag: { x0: 159.6, x1: 169.6, z: 3.0, y: 0.89 },
  motor: [{ z: 2.8 }, { z: 11.4 }], motorX: [170.6, 179.6],
  tests: [181.0, 182.3, 183.6, 184.9, 186.2], testZ: 2.4,
  office: { x0: 188.3, x1: 195.7, y1: 3.3 },
};

const lathe = (k, x, y, z, len = 2.2, face = 1) => {
  k.box(x - len / 2, y, z - 0.25, x - len / 2 + 0.18, y + 0.8, z + 0.25, M.machine);
  k.box(x + len / 2 - 0.18, y, z - 0.25, x + len / 2, y + 0.8, z + 0.25, M.machine);
  k.box(x - len / 2, y + 0.8, z - 0.22, x + len / 2, y + 0.98, z + 0.22, M.machine);
  const hx = face > 0 ? x - len / 2 : x + len / 2 - 0.55;
  k.box(hx, y + 0.98, z - 0.22, hx + 0.55, y + 1.38, z + 0.22, M.machineLt);
  k.cyl(hx + (face > 0 ? 0.55 : -0.05), y + 1.18, z, 0.12, 0.06, M.bright, { axis: 'x', seg: 8 });
  k.box(x + (face > 0 ? 0.5 : -0.8), y + 0.98, z - 0.15, x + (face > 0 ? 0.8 : -0.5), y + 1.24, z + 0.15, M.machineLt);
  k.box(x - 0.15, y + 0.98, z - 0.3, x + 0.15, y + 1.1, z + 0.3, M.bright);
  k.cyl(hx + 0.27, y + 1.38, z, 0.16, 0.5, M.iron, { axis: 'z', seg: 8 });
};

function toolRoom(k) {
  // Rows of lathes and millers, belted from line shafts overhead (S1 p.6 photo).
  for (const [z, f] of [[2.2, 1], [5.6, -1]]) for (let i = 0; i < 4; i++) {
    const x = 118.2 + i * 2.8;
    lathe(k, x, 0, z, 2.1, f);
    belt(k, [x - 0.78 * f, 1.38, z + 0.05], [x - 0.78 * f, SHOP.shaftY, z < 4 ? SHOP.shafts[0].z : SHOP.shafts[1].z], 0.06);
  }
  for (let i = 0; i < 3; i++) {
    const x = 118.6 + i * 3.4, z = 9.8;
    k.box(x - 0.4, 0, z - 0.4, x + 0.4, 2.0, z + 0.4, M.machine);
    k.box(x - 0.4, 1.6, z - 1.1, x + 0.4, 2.0, z, M.machine);
    k.box(x - 0.7, 0.9, z - 1.0, x + 0.7, 1.05, z - 0.4, M.machineLt);
    k.cyl(x, 1.4, z - 0.85, 0.1, 0.2, M.bright, { seg: 8 });
    belt(k, [x, 2.0, z], [x, SHOP.shaftY, SHOP.shafts[1].z], 0.06);
  }
  // Shaft hangers.
  for (const s of SHOP.shafts) for (let x = s.x0 + 1; x < s.x1; x += 2.8) k.box(x - 0.05, SHOP.shaftY, s.z - 0.05, x + 0.05, SAW.M.eave - 0.3, s.z + 0.05, M.iron);
  // Benches with vises along the back, and a surface plate.
  for (let i = 0; i < 3; i++) props.table(k, 118.5 + i * 2.6, 0, 12.4, { w: 2.3, d: 0.8, h: 0.9, top: '#7a6a52', items: false });
  for (let i = 0; i < 6; i++) k.box(117.8 + i * 1.3, 0.9, 12.5, 118.1 + i * 1.3, 1.1, 12.8, M.iron);
  k.box(126, 0, 9.4, 127.4, 0.9, 10.6, M.castIron);
  // Drawing office: tool-and-fixture draftsmen behind a glazed partition (S1 p.8).
  const ox0 = 117.0, ox1 = 127.4, oz = 14.6;
  k.box(ox0, 0, oz, ox1, 0.9, oz + 0.12, M.woodDk);
  k.box(ox0, 2.9, oz, ox1, 3.2, oz + 0.12, M.woodDk);
  for (let x = ox0; x <= ox1 + 0.01; x += 1.3) k.box(x - 0.04, 0.9, oz, x + 0.04, 2.9, oz + 0.12, M.woodDk);
  k.glass([[ox0, 0.9, oz + 0.06], [ox1, 0.9, oz + 0.06], [ox1, 2.9, oz + 0.06], [ox0, 2.9, oz + 0.06]], { c: '#d0e0e4', alpha: 0.16 });
  k.box(ox0, 3.2, oz, ox1, 3.3, 21.7, M.woodDk);
  k.box(ox0 - 0.1, 0, oz, ox0, 3.2, 21.7, M.woodDk, { right: M.whitewash });
  k.box(ox1, 0, oz, ox1 + 0.1, 3.2, 21.7, M.woodDk, { left: M.whitewash });
  for (let i = 0; i < 3; i++) {
    const x = 118.6 + i * 3.0;
    for (const [lx, lz] of [[-0.55, 16.4], [0.55, 16.4], [-0.55, 17.2], [0.55, 17.2]]) k.box(x + lx - 0.03, 0, lz - 0.03, x + lx + 0.03, 0.95, lz + 0.03, M.woodDk);
    k.boxR(x, 1.05, 16.8, 1.3, 0.04, 0.95, mat({ c: '#f2ece0', c2: '#3a4a6a', pat: 'tiles', s: 0.25 }), { x: -0.45 });
    props.chair(k, x, 0, 15.3, { face: 1, tall: true });
    k.lamp(x, 2.4, 16.6, { r: 3.2, i: 0.7, color: '#ffd890', bulbR: 0.05 });
  }
  k.box(125.4, 0, 19.8, 127.2, 1.0, 21.4, M.woodDk);
  props.shelves(k, 121.4, 0, 21.0, { w: 2.0, h: 2.0, n: 4, items: 'books', d: 0.4 });
}

function blocks(k) {
  // Ingersoll planer-type millers: 15 blocks milled at once (S7). The table on No. 1 moves.
  const m = SHOP.mill;
  for (const zc of [m.z, 7.4]) {
    k.box(m.x0, 0, zc - 1.0, m.x1, m.y, zc + 1.0, M.castIron);
    for (const x of [131.0, 132.8]) for (const s of [-1, 1]) k.box(x - 0.3, 0, zc + s * 1.25 - 0.22, x + 0.3, 2.45, zc + s * 1.25 + 0.22, M.machine);
    k.box(130.6, 2.0, zc - 1.5, 133.2, 2.45, zc + 1.5, M.machine);
    for (const s of [-0.55, 0, 0.55]) { k.box(131.5, 1.5, zc + s - 0.18, 132.3, 2.0, zc + s + 0.18, M.machineLt); k.cyl(131.9, 1.3, zc + s, 0.2, 0.22, M.bright, { seg: 10 }); }
    k.box(132.2, 2.45, zc - 0.4, 133.0, 3.0, zc + 0.4, M.green);
    if (zc !== m.z) for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) k.box(129.1 + i * 0.6, m.y + 0.1, zc - 0.7 + j * 0.5, 129.6 + i * 0.6, m.y + 0.42, zc - 0.32 + j * 0.5, M.castIron);
  }
  // A machine that drills 49 holes in a cylinder casting from four sides at once (S1 p.5).
  const dx = 137.2, dz = 3.0;
  k.box(dx - 0.9, 0, dz - 0.9, dx + 0.9, 0.8, dz + 0.9, M.machine);
  k.box(dx - 0.35, 0.8, dz - 0.25, dx + 0.35, 1.1, dz + 0.25, M.castIron);
  for (const [ax, az] of [[-1, 0], [1, 0], [0, 1]]) {
    k.box(dx + ax * 0.75 - 0.3, 0.75, dz + az * 0.75 - 0.3, dx + ax * 0.75 + 0.3, 1.25, dz + az * 0.75 + 0.3, M.machineLt);
    k.box(dx + ax * 1.05 - 0.2, 0.6, dz + az * 1.05 - 0.2, dx + ax * 1.05 + 0.2, 1.5, dz + az * 1.05 + 0.2, M.machine);
  }
  k.box(dx - 0.3, 1.6, dz - 0.3, dx + 0.3, 2.6, dz + 0.3, M.machine);
  k.box(dx - 0.15, 2.6, dz - 0.15, dx + 0.15, 3.4, dz + 0.15, M.green);
  // Rough castings on hand trucks; a rack of finished blocks.
  for (let t = 0; t < 2; t++) {
    const x = 129.4 + t * 3.8, z = 11.2;
    k.box(x - 0.6, 0.18, z - 0.4, x + 0.6, 0.26, z + 0.4, M.wood);
    k.cyl(x - 0.4, 0.09, z - 0.42, 0.09, 0.84, M.iron, { axis: 'z', seg: 6 });
    k.cyl(x + 0.4, 0.09, z - 0.42, 0.09, 0.84, M.iron, { axis: 'z', seg: 6 });
    for (let i = 0; i < 3; i++) k.box(x - 0.55 + i * 0.38, 0.26, z - 0.25, x - 0.22 + i * 0.38, 0.56, z + 0.25, M.castIron);
  }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) k.box(135.5 + i * 0.7, j * 0.4, 9.8, 136.1 + i * 0.7, 0.35 + j * 0.4, 10.4, M.castIron);
}

function craneway1(k) {
  // Stock under the crane: bar stock, castings, crates.
  for (let i = 0; i < 6; i++) k.cyl(140.4, 0.1 + i * 0.09, 12 + (i % 3) * 0.15, 0.05, 7, M.steel, { axis: 'x', seg: 5 });
  for (let i = 0; i < 5; i++) props.crate(k, 141 + i * 1.6, 0, 16, { w: 1.2, h: 0.8 + (i % 2) * 0.4, d: 1.0 });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) k.box(146 + i * 0.6, j * 0.32, 8 + (i % 2) * 0.3, 146.5 + i * 0.6, 0.3 + j * 0.32, 8.6 + (i % 2) * 0.3, M.castIron);
  for (let x = 141; x < 150; x += 4) reflector(k, x, 12.5, 6, { drop: 2.4, r: 8, i: 0.85, big: true });
}

function crankCam(k) {
  // Cylindrical grinders for crank and cam shafts (spinning wheels are moving parts).
  for (const x of SHOP.grinders) {
    const z = SHOP.grindZ;
    k.box(x - 1.1, 0, z - 0.4, x + 1.1, 0.95, z + 0.4, M.machine);
    k.box(x - 1.0, 0.95, z - 0.3, x + 1.0, 1.05, z + 0.1, M.machineLt);
    k.box(x - 0.95, 1.05, z - 0.25, x - 0.7, 1.35, z + 0.05, M.machineLt);
    k.box(x + 0.7, 1.05, z - 0.25, x + 0.95, 1.35, z + 0.05, M.machineLt);
    k.cyl(x - 0.7, 1.2, z - 0.1, 0.05, 1.4, M.bright, { axis: 'x', seg: 6 });
    k.box(x - 0.3, 0.95, z + 0.4, x + 0.3, 1.5, z + 1.0, M.machine);
  }
  for (let i = 0; i < 3; i++) { const x = 152.4 + i * 2.6; k.box(x - 0.7, 0, 7, x + 0.7, 1.6, 8.2, M.machine); k.box(x - 0.5, 1.6, 7.3, x + 0.5, 2.4, 8.0, M.machineLt); }
  for (let i = 0; i < 8; i++) k.cyl(152 + i * 0.25, 0.05, 11.5, 0.04, 0.9, M.bright, { axis: 'z', seg: 5 });
  k.box(151.6, 0, 11.3, 154.4, 0.05, 12.6, M.wood);
}

function magneto(k) {
  // The flywheel-magneto line: waist-high, 35 in, with a chain in the bottom, worm-driven at the east end (S1 p.110).
  const g = SHOP.mag;
  for (const s of [-0.32, 0.32]) k.box(g.x0, g.y - 0.08, g.z + s - 0.04, g.x1, g.y, g.z + s + 0.04, M.castIron);
  k.box(g.x0, g.y - 0.22, g.z - 0.28, g.x1, g.y - 0.18, g.z + 0.28, M.iron);
  for (let x = g.x0 + 0.3; x < g.x1; x += 1.4) for (const s of [-0.3, 0.3]) k.box(x - 0.04, 0, g.z + s - 0.04, x + 0.04, g.y - 0.08, g.z + s + 0.04, M.castIron);
  k.box(g.x1, 0, g.z - 0.4, g.x1 + 0.7, 1.0, g.z + 0.4, M.green);
  belt(k, [g.x1 + 0.35, 1.0, g.z], [g.x1 + 0.35, SAW.M.eave - 0.6, g.z], 0.08);
  // Inclined chain elevator feeding the gravity chutes to the motor lines (S1 p.284 to 285).
  k.beam([g.x1 + 0.5, 0.9, g.z + 0.8], [g.x1 + 2.2, 4.0, g.z + 0.8], 0.4, M.steel);
  k.beam([g.x1 + 2.2, 4.0, g.z + 0.8], [173.5, 1.2, 1.4], 0.3, M.steel);
  k.beam([g.x1 + 2.2, 4.0, g.z + 0.8], [173.5, 1.2, 10.2], 0.3, M.steel);
  for (let i = 0; i < 12; i++) props.crate(k, 160 + i * 0.85, 0, 5.2, { w: 0.6, h: 0.35, d: 0.5, color: '#a08050' });
  // Women's coil-winding benches behind (S1 p.21).
  for (let i = 0; i < 4; i++) {
    const x = 160.4 + i * 2.3;
    props.table(k, x, 0, 9.4, { w: 2.0, d: 0.75, h: 0.78, top: '#8a6a44', items: false });
    for (let j = 0; j < 3; j++) { k.cyl(x - 0.6 + j * 0.6, 0.78, 9.7, 0.1, 0.08, M.brass, { seg: 10 }); k.cyl(x - 0.6 + j * 0.6, 0.78, 9.95, 0.035, 0.18, M.iron, { seg: 6 }); }
    props.chair(k, x - 0.5, 0, 10.35, { face: -1, color: '#6a4a2a' });
    props.chair(k, x + 0.5, 0, 10.35, { face: -1, color: '#6a4a2a' });
  }
  // A notice in many languages on the back wall (S1 p.59).
  k.box(163, 2.0, 21.35, 165.4, 3.4, 21.4, M.paper);
  for (let i = 0; i < 6; i++) k.box(163.2, 3.15 - i * 0.2, 21.33, 163.4 + (i % 3) * 0.5 + 1.2, 3.2 - i * 0.2, 21.35, M.iron);
}

function motorLines(k) {
  // Two widely separated motor-assembling lines, fed from overhead (S1 p.283).
  for (const L of SHOP.motor) {
    const z = L.z;
    k.box(SHOP.motorX[0], 0.7, z - 0.4, SHOP.motorX[1], 0.78, z + 0.4, M.castIron);
    for (let x = SHOP.motorX[0] + 0.3; x < SHOP.motorX[1]; x += 1.5) k.box(x - 0.05, 0, z - 0.35, x + 0.05, 0.7, z + 0.35, M.castIron);
    // Overhead endless carrier up to the roof beams, and the gravity slides down.
    k.box(170.9, 0, z + 0.9, 171.6, SAW.M.eave - 0.2, z + 1.3, M.steel);
    k.beam([171.3, SAW.M.eave - 0.5, z + 1.1], [176.5, 1.0, z + 0.7], 0.22, M.steel);
    k.beam([171.3, SAW.M.eave - 0.9, z + 1.1], [178.8, 1.0, z + 0.7], 0.18, M.steel);
    for (let i = 0; i < 5; i++) k.box(172 + i * 1.6, 0, z + 1.4, 173 + i * 1.6, 0.8, z + 2.0, M.wood);
  }
  for (let i = 0; i < 6; i++) k.box(171 + i * 1.4, 0.8, 1.6, 171.3 + i * 1.4, 0.95, 1.8, M.bright);
}

function testBlocks(k) {
  // Test blocks: each new motor turned over by an electric motor (S1 p.130).
  const z = SHOP.testZ;
  for (const zz of [z, 8.6]) for (const x of SHOP.tests) {
    k.box(x - 0.55, 0, zz - 0.45, x + 0.55, 0.55, zz + 0.45, M.castIron);
    k.box(x - 0.4, 0.55, zz - 0.2, x + 0.25, 1.0, zz + 0.2, mat({ c: '#2c2c30', cut: '#18181a' }));
    k.box(x - 0.37, 1.0, zz - 0.17, x + 0.22, 1.08, zz + 0.17, mat({ c: '#2c2c30', cut: '#18181a' }));
    k.cyl(x + 0.3, 0.85, zz - 0.26, 0.24, 0.52, mat({ c: '#3a4a44', c2: '#2e3c36', cut: '#1e2824' }), { axis: 'z', seg: 10 });
    k.box(x - 0.6, 0, zz + 0.6, x - 0.5, 1.7, zz + 0.7, M.iron);
    k.box(x - 0.75, 1.3, zz + 0.55, x - 0.35, 1.7, zz + 0.6, M.marble);
    k.cyl(x - 0.55, 1.5, zz + 0.54, 0.1, 0.02, mat({ c: '#f2ecdc', cut: '#8a8478' }), { axis: 'z', seg: 10 });
  }
  // Motors leave by truck, five at a time; a rejected one carries white fault cards (S1 p.130 to 131).
  const tx = 183.6, tz = 5.4;
  k.box(tx - 1.6, 0.25, tz - 0.45, tx + 1.6, 0.32, tz + 0.45, M.wood);
  for (const dx of [-1.3, 1.3]) k.cyl(tx + dx, 0.13, tz - 0.48, 0.13, 0.96, M.iron, { axis: 'z', seg: 8 });
  for (let i = 0; i < 5; i++) k.box(tx - 1.45 + i * 0.6, 0.32, tz - 0.2, tx - 1.0 + i * 0.6, 0.75, tz + 0.2, mat({ c: '#2c2c30', cut: '#18181a' }));
  k.box(187.0, 0, 11.2, 187.8, 0.45, 12.0, mat({ c: '#2c2c30', cut: '#18181a' }));
  for (let i = 0; i < 3; i++) k.box(187.1 + i * 0.22, 0.25, 11.17, 187.25 + i * 0.22, 0.4, 11.19, M.paper);
}

function office(k) {
  // Employment office (ground) and first aid + English class (upstairs), at the shop's front corner.
  const o = SHOP.office, y1 = o.y1, z1 = 8.0;
  k.box(o.x0, 0, -3, o.x0 + 0.25, SAW.M.eave, z1, M.brick, { right: M.whitewash });
  k.box(o.x0, 0, z1 - 0.25, o.x1, SAW.M.eave, z1, M.brick, { front: M.whitewash });
  k.box(o.x0 + 0.25, y1 - 0.25, -3, o.x1, y1, z1 - 0.25, M.slab, { top: M.planks, bottom: M.whitewash });
  k.box(o.x0 + 0.25, SAW.M.eave - 0.2, -3, o.x1, SAW.M.eave, z1 - 0.25, M.slab);
  k.box(o.x0 + 0.25, 0, 0, o.x1, 0.01, z1 - 0.25, mat({ c: '#8a6a4a', c2: '#7a5a3e', pat: 'planks', s: 0.12 }));
  // Counter running front to back; applicants on chairs to its west, clerks to its east.
  k.box(191.6, 0, 1.0, 192.2, 1.05, 6.6, M.woodDk);
  k.box(191.5, 1.05, 0.9, 192.3, 1.1, 6.7, M.wood);
  for (let i = 0; i < 4; i++) props.chair(k, 189.6, 0, 1.2 + i * 1.3, { face: 1, color: '#6a4a2a' });
  props.bench(k, 190.3, 0, 6.8, { w: 2.6, d: 0.35 });
  for (let i = 0; i < 2; i++) { props.desk(k, 194.1, 0, 1.4 + i * 2.6, { w: 1.3, top: '#7a5232' }); props.chair(k, 193.4, 0, 2.2 + i * 2.6, { face: 1 }); }
  k.box(193.6, 0.76, 1.6, 194.0, 0.98, 1.95, M.iron);
  for (let i = 0; i < 4; i++) k.box(194.6 + (i % 2) * 0.55, 0, 6.0 + Math.floor(i / 2) * 0.01, 195.1 + (i % 2) * 0.55, 1.4, 7.6, mat({ c: '#6a6a5a', c2: '#5a5a4a', pat: 'panels', s: 0.18 }));
  for (let i = 0; i < 3; i++) k.box(192.6 + i * 0.6, 0, 7.1, 193.1 + i * 0.6, 1.4, 7.7, mat({ c: '#6a6a5a', c2: '#5a5a4a', pat: 'panels', s: 0.18 }));
  // The wanted-trades board by the door (S1 p.44).
  k.box(o.x0 + 0.26, 1.1, 0.3, o.x0 + 0.3, 2.3, 1.5, M.woodDk, { right: mat({ c: '#e8e0cc', c2: '#3a3a3a', pat: 'stripes', s: 0.12 }) });
  props.clock(k, 192.0, 2.7, 7.75);
  props.lamp(k, 190.4, y1 - 0.25, 3.4, { drop: 0.4, r: 4, i: 0.8 });
  props.lamp(k, 194.2, y1 - 0.25, 3.4, { drop: 0.4, r: 4, i: 0.8 });
  // Upstairs: partition, first-aid room (west) and classroom (east).
  k.box(191.9, y1, 0, 192.05, SAW.M.eave - 0.2, z1 - 0.25, M.woodDk, { left: M.whitewash, right: M.whitewash });
  props.bed(k, 189.6, y1, 5.6, { w: 1.9, d: 0.8, frame: '#e8e4dc', blanket: '#e8e4dc' });
  k.box(190.8, y1, 7.2, 191.7, y1 + 1.9, 7.7, mat({ c: '#e8e4dc', c2: '#a8c0c8', pat: 'panes', s: 0.25 }));
  props.chair(k, 190.6, y1, 2.0, { face: -1, color: '#e8e4dc', tall: true });
  props.table(k, 189.6, y1, 1.2, { w: 1.0, d: 0.6, h: 0.8, top: '#e8e4dc', items: 'bottle' });
  k.cyl(189.3, y1 + 0.8, 1.45, 0.06, 0.14, mat({ c: '#c8dce0', cut: '#8a9ea4' }), { seg: 8 });
  props.sink(k, 191.3, y1, 7.0, { mirror: true });
  props.desk(k, 194.6, y1, 6.6, { w: 1.2, top: '#7a5232' });
  k.cyl(194.3, y1 + 0.76, 6.9, 0.11, 0.14, M.bright, { seg: 10 });
  k.box(194.75, y1 + 0.76, 6.8, 194.95, y1 + 0.82, 6.95, mat({ c: '#e8d8a8', cut: '#a89868' }));
  k.box(192.5, y1 + 1.2, 7.7, 194.6, y1 + 2.4, 7.74, mat({ c: '#2a3a2e', c2: '#3a4a3e', cut: '#1a221e' }));
  for (let i = 0; i < 2; i++) { props.bench(k, 193.4, y1, 2.0 + i * 1.6, { w: 2.2, d: 0.32 }); props.table(k, 193.4, y1, 2.5 + i * 1.6, { w: 2.2, d: 0.4, h: 0.7, items: false, top: '#7a5a3a' }); }
  props.lamp(k, 190.0, SAW.M.eave - 0.2, 3.8, { drop: 0.4, r: 3.6, i: 0.8 });
  props.lamp(k, 193.8, SAW.M.eave - 0.2, 3.8, { drop: 0.4, r: 3.6, i: 0.8 });
  // Stairs up behind the office.
  stairsX(k, 195.4, 0, 190.2, y1, 8.1, 9.2);
  k.box(189.6, y1 - 0.2, 8.0, 190.4, y1, 9.2, M.slab);
  // Tool crib behind, with the closets perched above it (S1 p.28, p.30).
  const cz0 = 10.4, cz1 = 13.6, cx0 = 189.2, cx1 = 195.4;
  k.box(cx0, 0, cz0, cx1, 2.5, cz0 + 0.05, mat({ c: '#8a8a80', c2: '#3a3a3a', pat: 'bars', s: 0.08, cut: '#3a3a3a' }));
  k.box(cx0, 0, cz0, cx0 + 0.05, 2.5, cz1, mat({ c: '#8a8a80', c2: '#3a3a3a', pat: 'bars', s: 0.08 }));
  k.box(cx0, 2.5, cz0, cx1, 2.65, cz1, M.wood);
  k.box(191.4, 0.95, cz0 - 0.2, 193.0, 1.05, cz0 + 0.1, M.wood);
  props.shelves(k, 190.8, 0, cz1 - 0.6, { w: 2.6, h: 2.2, n: 5, items: 'mixed', d: 0.5, color: '#5a5a5a' });
  props.shelves(k, 193.8, 0, cz1 - 0.6, { w: 2.6, h: 2.2, n: 5, items: 'jars', d: 0.5, color: '#5a5a5a' });
  k.box(195.0, 1.3, cz0 + 0.06, 195.35, 2.1, cz0 + 0.1, mat({ c: '#c8a050', c2: '#7a5a2a', pat: 'tiles', s: 0.06 }));
  k.box(cx0 + 0.6, 2.65, cz0 + 0.4, cx1 - 0.6, 4.6, cz1 - 0.2, M.whitewash, { front: mat({ c: '#d8d0bc', c2: '#b8b0a0', pat: 'panels', s: 0.8 }) });
  k.box(cx0 + 0.6, 4.6, cz0 + 0.3, cx1 - 0.6, 4.7, cz1 - 0.1, M.wood);
  stairsX(k, 195.6, 0, 192.2, 2.65, cz1 + 0.1, cz1 + 0.9);
  for (let i = 0; i < 3; i++) props.door(k, 191.2 + i * 1.5, 2.65, cz0 + 0.38, { w: 0.6, h: 1.8, color: '#7a5a3a' });
}

export function buildShop(k) {
  toolRoom(k);
  blocks(k);
  craneway1(k);
  crankCam(k);
  magneto(k);
  motorLines(k);
  testBlocks(k);
  office(k);
  // Lamps over the shop floor (enamelled reflectors).
  for (let x = 119; x < 188; x += 6.1) if (x < X.CW0 - 0.5 || x > X.CW1 + 0.5) for (const z of [3, 10.5, 18]) if (!(x > 188 && z < 9)) reflector(k, x, SAW.M.eave + 0.4, z, { drop: 1.5, r: 6.5, i: 0.85 });
  void modelT; void railX;
}
