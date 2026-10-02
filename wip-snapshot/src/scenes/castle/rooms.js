/* Conwy Castle: furnishing every room, with lamps, and recording anchors (seats, beds,
 * work spots) that the people in setup() use. Zone ids (Z07...) follow the dossier. */
import { mat, props } from '../../engine/index.js';
import { M, TOWERS, FL, HALL, ROYAL, LEAN, NCURT, GARDEN, DOCK, WELL, BARB_W, GATE_Z, roundOpening } from './common.js';
import { RIN, STAIR } from './shell.js';
import {
  wallFrame, roundFrame, hoodFire, testerBed, pallet, crossbow, hanging, domedOven, trestle, buffet,
  barrels, casks, sacks, tub, faggots, candles, sconce,
} from './furniture.js';

// Anchors shared with setup(): spots[name] = [x, y, z]; beds[zone] = [{feet, heading}, ...].
export const A = { spots: {}, beds: {}, seats: {} };
const spot = (name, x, y, z) => { A.spots[name] = [x, y, z]; return A.spots[name]; };
const bed = (zone, anchor) => { (A.beds[zone] = A.beds[zone] || []).push(anchor); return anchor; };

const tw = (key) => TOWERS[key];
const ang = (cx, cz, r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];

// ------------------------------------------------------------------ towers
function swTower(k) {
  const { x: cx, z: cz } = tw('sw');
  // Basement store (Z07): sacks of flour, barrels, firewood, a ladder up through a trap.
  const yb = -3.5;
  sacks(k, cx - 1.8, yb, 1.4, 4, { stack: true });
  barrels(k, cx + 0.2, yb, 2.0, 3, { r: 0.28, h: 0.75 });
  faggots(k, cx - 0.4, yb, 0.6, 3);
  props.ladder(k, cx + 1.6, yb, 0, 1.2, { w: 0.45, lean: 0.4 });
  k.lamp(cx, yb + 2.2, 1.5, { r: 3.0, i: 0.5, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('sw.base', cx - 0.5, yb, 1.0);

  // Ground floor (Z07): the domed bread oven, cut open in the wall on the left.
  const y0 = FL[0];
  domedOven(k, cx - 4.15, y0 + 0.95, 1.25, 1.3, { loaves: true });
  // Dough trough on legs, peel, rack of loaves, faggot pile.
  k.box(cx - 0.6, y0 + 0.62, 1.7, cx + 1.4, y0 + 0.95, 2.35, M.oak);
  k.box(cx - 0.55, y0 + 0.9, 1.75, cx + 1.35, y0 + 0.93, 2.3, mat('#e8dcc0'));
  for (const lx of [cx - 0.5, cx + 1.25]) k.box(lx, y0, 1.8, lx + 0.1, y0 + 0.62, 2.25, M.oakDark);
  k.beam([cx - 2.1, y0 + 0.05, 2.0], [cx - 1.4, y0 + 2.6, 2.6], 0.05, M.oak);
  k.box(cx - 1.55, y0 + 2.45, 2.45, cx - 1.25, y0 + 2.9, 2.75, M.oak);
  props.shelves(k, cx + 1.9, y0, 1.95, { w: 1.0, h: 1.6, n: 4, items: 'jars', d: 0.4, color: '#7a5432' });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) k.sphere(cx + 1.5 + j * 0.24, y0 + 0.45 + i * 0.4, 2.15, 0.1, mat('#c08048'), { seg: 6, rings: 4 });
  faggots(k, cx - 0.6, y0, 0.3, 4);
  bed('Z07', pallet(k, cx + 1.0, y0, 0.25, { w: 1.6, d: 0.7, blanket: '#8a7a5a' }));
  k.lamp(cx - 0.6, y0 + 3.4, 1.4, { r: 3.6, i: 0.6, color: '#ffc070', bulbR: 0.03, halo: 0.25, flicker: true });
  spot('oven', cx - 2.5, y0, 0.9); spot('trough', cx + 0.4, y0, 1.25); spot('sw.0', cx + 0.6, y0, 0.8);

  // First floor (Z08): the constable's chamber.
  const y1 = FL[1];
  const F1 = roundFrame(k, cx, cz, RIN[1], 2.25, y1);
  hoodFire(k, F1, 1.3, { reach: 5, i: 0.75 });
  spot('sw1.fire', ...F1.at(0, 0, 1.3));
  const b1 = testerBed(k, cx + 0.25, y1, 1.75, { w: 2.0, d: 1.3, curtain: '#7a2a26', blanket: '#3a5288' });
  bed('Z08', b1[1]); bed('Z08', b1[2]);
  roundOpening(k, cx, cz, RIN[1], 0.95, y1 + 1.1, 0.9, 1.6, { seat: true });
  const latr = ang(cx, cz, RIN[1] - 0.04, 0.62, y1);
  k.boxR(latr[0], y1 + 0.95, latr[2], 0.6, 1.9, 0.08, M.dark, { y: -0.62 + Math.PI / 2 });
  props.chest(k, cx - 1.4, y1, 0.35, { w: 0.9, color: '#6a3a22' });
  // A folding (X-frame) chair.
  const fx = cx + 1.8, fz = 0.55;
  k.beam([fx - 0.25, y1, fz], [fx + 0.25, y1 + 0.5, fz], 0.04, M.oakDark); k.beam([fx + 0.25, y1, fz], [fx - 0.25, y1 + 0.5, fz], 0.04, M.oakDark);
  k.beam([fx - 0.25, y1, fz + 0.4], [fx + 0.25, y1 + 0.5, fz + 0.4], 0.04, M.oakDark); k.beam([fx + 0.25, y1, fz + 0.4], [fx - 0.25, y1 + 0.5, fz + 0.4], 0.04, M.oakDark);
  k.box(fx - 0.27, y1 + 0.48, fz - 0.02, fx + 0.27, y1 + 0.52, fz + 0.42, mat('#8a2a22'));
  hanging(k, roundFrame(k, cx, cz, RIN[1], 1.55, y1), 0, 1.9, 1.5, 1.7, '#4a6a3a', '#c8a050');
  k.lamp(cx + 0.4, y1 + 2.5, 1.1, { r: 3.5, i: 0.55, color: '#ffc070', bulbR: 0.03, halo: 0.25, flicker: true });
  spot('sw1.chest', cx - 1.4, y1, 0.2); spot('sw1.window', ...ang(cx, cz, RIN[1] - 0.7, 0.95, y1)); spot('sw1.mid', cx - 0.4, y1, 0.9);
  A.seats.constableChair = { x: fx, y: y1, z: fz + 0.2, seat: 0.5 };

  // Second floor (Z09): the family chamber. Truckle bed, spindle, toys, a cat.
  const y2 = FL[2];
  const F2 = roundFrame(k, cx, cz, RIN[2], 2.3, y2);
  hoodFire(k, F2, 1.2, { reach: 4.5, i: 0.7 });
  bed('Z09', pallet(k, cx + 0.6, y2 + 0.18, 1.9, { w: 1.6, d: 0.85, blanket: '#9a5a4a' }));
  k.box(cx - 0.25, y2, 1.85, cx + 1.45, y2 + 0.18, 2.8, M.oak); // truckle frame
  bed('Z09', { feet: [cx + 1.25, y2 + 0.34, 2.5], heading: 0 });
  bed('Z09', pallet(k, cx - 1.0, y2, 0.2, { w: 1.7, d: 0.7, blanket: '#5a6a8a' }));
  props.chest(k, cx + 2.2, y2, 0.5, { w: 0.6 });
  // Spindle and distaff by a stool, a wooden horse and a ball.
  props.chair(k, cx - 1.6, y2, 1.5, { face: 1, color: '#7a5432' });
  k.cyl(cx - 1.1, y2 + 0.7, 1.6, 0.03, 0.6, M.oak, { seg: 5 });
  k.box(cx + 1.6, y2, 0.3, cx + 1.9, y2 + 0.18, 0.4, mat('#a87a48'));
  k.sphere(cx + 0.9, y2 + 0.07, 0.4, 0.07, mat('#a83a2a'), { seg: 6, rings: 4 });
  // Lady Margery's banner for the chapel, on a frame.
  k.box(cx - 2.2, y2, 1.0, cx - 2.1, y2 + 1.6, 1.1, M.oakDark);
  k.box(cx - 1.2, y2, 1.0, cx - 1.1, y2 + 1.6, 1.1, M.oakDark);
  k.box(cx - 2.15, y2 + 0.7, 1.02, cx - 1.15, y2 + 1.55, 1.06, mat({ c: '#a8322a', c2: '#d8b048', pat: 'stripes', s: 0.15 }));
  roundOpening(k, cx, cz, RIN[2], 1.1, y2 + 1.2, 0.8, 1.4, { seat: true });
  k.lamp(cx, y2 + 2.6, 1.2, { r: 3.6, i: 0.5, color: '#ffc070', bulbR: 0.03, halo: 0.25, flicker: true });
  spot('sw2.frame', cx - 1.65, y2, 0.45); spot('sw2.stool', cx - 1.6, y2, 1.7); spot('sw2.mid', cx + 0.3, y2, 0.8); spot('sw2.window', ...ang(cx, cz, RIN[2] - 0.7, 1.1, y2));
  spot('cat.sw', cx - 0.4, y2, 2.3);

  // Roof (Z10).
  spot('sw.roof', cx - 1.0, FL[3], 2.8); spot('sw.roofE', cx + 2.5, FL[3], 2.5); spot('sw.roofW', cx - 3.6, FL[3], 2.2);
}

function bakeTower(k) {
  const { x: cx, z: cz } = tw('bake');
  const y0 = FL[0];
  // Ground floor (Z32): fireplace with the domed oven built behind it, cut open on the left.
  domedOven(k, cx - 4.2, y0 + 0.95, 1.15, 1.25, { loaves: true });
  const F0 = roundFrame(k, cx, cz, RIN[0], 2.6, y0);
  hoodFire(k, F0, 1.2, { reach: 4.2, i: 0.6 });
  // Kneading trough, flour sacks, loaves on boards.
  k.box(cx - 0.4, y0 + 0.6, 1.6, cx + 1.6, y0 + 0.92, 2.3, M.oak);
  k.box(cx - 0.35, y0 + 0.88, 1.65, cx + 1.55, y0 + 0.91, 2.25, mat('#e8dcc0'));
  for (const lx of [cx - 0.3, cx + 1.45]) k.box(lx, y0, 1.7, lx + 0.1, y0 + 0.6, 2.2, M.oakDark);
  sacks(k, cx + 1.9, y0, 0.6, 4, { stack: true, color: '#d8ccb0' });
  for (let j = 0; j < 6; j++) k.sphere(cx - 0.2 + j * 0.28, y0 + 0.98, 1.95, 0.1, mat('#d8b080'), { seg: 6, rings: 4 });
  k.lamp(cx, y0 + 3.4, 1.4, { r: 3.6, i: 0.55, color: '#ffc070', bulbR: 0.03, halo: 0.25, flicker: true });
  spot('bake.oven', cx - 2.4, y0, 0.9); spot('bake.trough', cx + 0.6, y0, 1.2); spot('bake.0', cx + 1.2, y0, 0.6);

  // First and second floors (Z33): garrison chambers. Bunks, chests, crossbows, barrels of quarrels.
  for (const f of [1, 2]) {
    const y = FL[f], r = RIN[f];
    const b1 = props.bunk(k, cx - 0.4, y, 2.2, { w: 1.95, d: 0.8, levels: 2, gap: 1.0, color: '#7a5a3a' });
    b1.forEach((b) => bed('Z33', b));
    const b2 = props.bunk(k, cx + 1.9, y, 1.0, { w: 1.9, d: 0.75, levels: 2, gap: 1.0, color: '#7a5a3a' });
    b2.forEach((b) => bed('Z33', b));
    props.chest(k, cx - 2.3, y, 0.6, { w: 0.8 });
    const F = roundFrame(k, cx, cz, r, 2.0, y);
    for (let i = 0; i < 3; i++) { F.box(-0.8 + i * 0.7, -0.75 + i * 0.7, 1.75, 1.8, 0, 0.12, M.oakDark); }
    for (let i = 0; i < 2; i++) { const p = F.at(-0.45 + i * 0.7, 1.55, 0.2); crossbow(k, p[0], p[1], p[2], Math.PI / 2 - F.phi + Math.PI / 2); }
    if (f === 1) {
      barrels(k, cx - 2.6, y, 1.4, 2, { r: 0.26, h: 0.7, color: '#6a5034' });
      for (let i = 0; i < 12; i++) k.cyl(cx - 2.45 + (i % 4) * 0.08, y + 0.7, 1.55 + Math.floor(i / 4) * 0.1, 0.012, 0.32, M.oak, { seg: 4 });
      spot('quarrels', cx - 2.0, y, 0.9);
    } else {
      props.table(k, cx - 1.5, y, 0.5, { w: 0.9, d: 0.6, items: 'cup', top: '#7a5432' });
      props.bench(k, cx - 1.5, y, 0.15, { w: 0.9 });
      spot('bake2.table', cx - 1.5, y, 0.1);
    }
    roundOpening(k, cx, cz, r, 1.15, y + 1.3, 0.16, 1.4);
    k.lamp(cx, y + 2.6, 1.2, { r: 3.4, i: 0.45, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
    spot('bake' + f + '.mid', cx + 0.4, y, 0.7);
  }
  spot('bake.roof', cx - 1.5, FL[3], 2.8);
}

function kingTower(k) {
  const { x: cx, z: cz } = tw('king');
  const yb = -3.0;
  casks(k, cx - 1.6, yb, 1.2, 3, { gap: 0.95 });
  k.lamp(cx, yb + 2.0, 1.4, { r: 2.6, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  const y0 = FL[0];
  props.bench(k, cx - 1.0, y0, 2.4, { w: 1.6 });
  props.chest(k, cx + 1.4, y0, 1.6, { w: 0.8 });
  const F0 = roundFrame(k, cx, cz, RIN[0], 1.9, y0);
  for (let i = 0; i < 2; i++) { const p = F0.at(-0.4 + i * 0.8, 1.6, 0.2); crossbow(k, p[0], p[1], p[2], Math.PI / 2 - F0.phi + Math.PI / 2); }
  sconce(k, F0, 0.9, 1.7);
  spot('king.0', cx - 0.6, y0, 1.0); spot('king.0b', cx + 0.9, y0, 0.8);
  // First floor (Z43): a small chamber kept ready, with a vaulted ceiling drawn as ribs.
  const y1 = FL[1];
  hanging(k, roundFrame(k, cx, cz, RIN[1], 1.6, y1), 0, 1.4, 1.8, 1.9, '#2a3a6a', '#c8a050');
  props.chest(k, cx - 1.5, y1, 1.2, { w: 1.0, color: '#5a3020' });
  props.bench(k, cx + 1.2, y1, 1.8, { w: 1.2 });
  for (const a of [0.6, 1.57, 2.5]) { const p = ang(cx, cz, RIN[1] - 0.05, a, y1 + 3.2); k.tube([p, [cx + (p[0] - cx) * 0.5, y1 + 4.15, cz + (p[2] - cz) * 0.5], [cx, y1 + 4.35, cz + 0.2]], 0.08, M.sand, { seg: 4 }); }
  roundOpening(k, cx, cz, RIN[1], 1.0, y1 + 1.2, 0.8, 1.5, { seat: true });
  k.lamp(cx, y1 + 2.5, 1.2, { r: 3.4, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  spot('king.1', cx, y1, 1.0);
  const y2 = FL[2];
  // Second floor: spare hangings and benches stored for the next royal visit.
  for (let i = 0; i < 3; i++) k.cyl(cx - 1.2 + i * 0.5, y2 + 0.2, 2.0 + i * 0.1, 0.18, 1.6, mat(i % 2 ? '#7a2a26' : '#3a5a7a'), { axis: 'x', seg: 8 });
  props.bench(k, cx + 0.3, y2, 0.5, { w: 1.6 });
  k.lamp(cx, y2 + 2.6, 1.2, { r: 3.2, i: 0.35, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('king.2', cx + 0.6, y2, 1.2);
  spot('king.roof', cx - 1.5, FL[3], 2.8);
}

// The four back towers are opened on their centre line (rooms from z = 30 to 33.4).
function backTowers(k) {
  // North-west Tower (Z11): stores below, a heated chamber, and the armoury of mail and helmets.
  { const { x: cx, z: cz } = tw('nw');
    barrels(k, cx - 2.0, FL[0], cz + 1.4, 3, { r: 0.28, h: 0.8 }); sacks(k, cx + 0.8, FL[0], cz + 1.4, 4, { stack: true });
    k.lamp(cx, FL[0] + 2.4, cz + 1.2, { r: 3.0, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
    const y1 = FL[1];
    hoodFire(k, roundFrame(k, cx, cz, RIN[1], Math.PI / 2, y1), 1.2, { reach: 4.5, i: 0.7 });
    const bb = props.bunk(k, cx - 1.7, y1, cz + 1.3, { w: 1.9, d: 0.75, levels: 2, gap: 1.0 }); bb.forEach((b) => bed('Z11', b));
    bed('Z11', pallet(k, cx + 1.6, y1, cz + 1.4, { w: 1.7, d: 0.7 }));
    bed('Z11', pallet(k, cx + 1.4, y1, cz + 0.3, { w: 1.7, d: 0.7, blanket: '#5a5a6a' }));
    k.lamp(cx, y1 + 2.6, cz + 1.2, { r: 3.5, i: 0.45, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
    const y2 = FL[2];
    // Mail shirts on poles, kettle hats on pegs, a bench for oiling.
    for (let i = 0; i < 3; i++) {
      const x = cx - 2.0 + i * 0.9;
      k.box(x - 0.02, y2, cz + 2.6, x + 0.02, y2 + 1.7, cz + 2.65, M.oakDark);
      k.box(x - 0.32, y2 + 0.75, cz + 2.45, x + 0.32, y2 + 1.55, cz + 2.6, mat({ c: '#8a8e94', c2: '#6a6e74', pat: 'rings', s: 0.04 }));
    }
    for (let i = 0; i < 3; i++) k.sphere(cx + 0.8 + i * 0.45, y2 + 1.7, cz + 2.9, 0.18, mat('#7a7e84'), { seg: 8, rings: 5, t0: 0, t1: Math.PI / 2 });
    props.bench(k, cx + 1.0, y2, cz + 1.0, { w: 1.4 });
    k.lamp(cx, y2 + 2.6, cz + 1.2, { r: 3.4, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
    spot('nw.0', cx, FL[0], cz + 0.7); spot('nw.1', cx + 0.3, y1, cz + 0.7); spot('nw.2', cx + 1.0, y2, cz + 0.65); spot('nw.roof', cx, FL[3], cz + 2.2);
  }
  // Kitchen Tower (Z24): larder below, two heated chambers for the household's women.
  { const { x: cx, z: cz } = tw('kit');
    const y0 = FL[0];
    props.shelves(k, cx - 1.0, y0, cz + 2.4, { w: 1.6, h: 1.8, n: 4, items: 'jars', d: 0.4 });
    barrels(k, cx + 0.8, y0, cz + 1.5, 3, { r: 0.28, h: 0.75 });
    for (let i = 0; i < 4; i++) { k.cyl(cx - 2.0 + i * 0.5, y0 + 3.6, cz + 1.4, 0.008, 0.6, M.iron, { seg: 4 }); k.sphere(cx - 2.0 + i * 0.5, y0 + 3.4, cz + 1.4, 0.18, mat('#8a4a3a'), { seg: 7, rings: 5 }); }
    k.lamp(cx, y0 + 2.2, cz + 1.3, { r: 3.0, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
    const y1 = FL[1];
    hoodFire(k, roundFrame(k, cx, cz, RIN[1], Math.PI / 2 + 0.4, y1), 1.2, { reach: 4.5, i: 0.7 });
    // Gowns on a pole, a chest and a bench for brushing and mending.
    k.box(cx - 2.6, y1 + 1.75, cz + 2.0, cx - 0.6, y1 + 1.8, cz + 2.05, M.oakDark);
    for (let i = 0; i < 3; i++) k.box(cx - 2.4 + i * 0.65, y1 + 0.5, cz + 1.9, cx - 1.95 + i * 0.65, y1 + 1.75, cz + 2.15, mat(['#3a5a8a', '#8a2a26', '#4a6a3a'][i]));
    props.chest(k, cx + 1.5, y1, cz + 1.6, { w: 0.9 });
    props.bench(k, cx + 0.2, y1, cz + 0.7, { w: 1.2 });
    k.lamp(cx, y1 + 2.6, cz + 1.2, { r: 3.4, i: 0.45, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
    const y2 = FL[2];
    hoodFire(k, roundFrame(k, cx, cz, RIN[2], Math.PI / 2 + 0.3, y2), 1.1, { reach: 4, i: 0.6 });
    for (const [x, z] of [[cx - 2.3, cz + 0.4], [cx - 2.0, cz + 1.4], [cx + 0.9, cz + 0.4], [cx + 1.1, cz + 1.5], [cx - 0.6, cz + 2.5]]) bed('Z24', pallet(k, x, y2, z, { w: 1.6, d: 0.75, blanket: '#8a6a5a' }));
    k.lamp(cx, y2 + 2.6, cz + 1.2, { r: 3.4, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
    spot('kt.0', cx - 0.3, y0, cz + 0.8); spot('kt.1', cx + 0.2, y1, cz + 0.4); spot('kt.1b', cx - 1.7, y1, cz + 1.0); spot('kt.2', cx - 0.4, y2, cz + 0.8);
  }
  // Stockhouse Tower (Z34): storage below, two heated floors for the garrison.
  { const { x: cx, z: cz } = tw('stock');
    sacks(k, cx - 2.2, FL[0], cz + 1.2, 6, { stack: true }); barrels(k, cx + 0.6, FL[0], cz + 1.6, 3);
    k.lamp(cx, FL[0] + 2.4, cz + 1.2, { r: 3.0, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
    for (const f of [1, 2]) {
      const y = FL[f];
      hoodFire(k, roundFrame(k, cx, cz, RIN[f], Math.PI / 2, y), 1.1, { reach: 4, i: 0.6 });
      props.bunk(k, cx - 1.9, y, cz + 1.1, { w: 1.9, d: 0.75, levels: 2, gap: 1.0 }).forEach((b) => bed('Z34', b));
      props.bunk(k, cx + 1.9, y, cz + 1.1, { w: 1.9, d: 0.75, levels: 2, gap: 1.0 }).forEach((b) => bed('Z34', b));
      k.lamp(cx, y + 2.6, cz + 1.0, { r: 3.4, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
      spot('st' + f, cx, y, cz + 0.5);
    }
    spot('st.0', cx, FL[0], cz + 0.5);
  }
  // Chapel Tower (Z45, Z46): the royal chapel on the first floor, the chaplain's room above.
  { const { x: cx, z: cz } = tw('chap');
    const y0 = FL[0];
    props.chest(k, cx - 1.6, y0, cz + 1.5, { w: 1.0, color: '#5a3020' });
    props.shelves(k, cx + 1.2, y0, cz + 2.3, { w: 1.2, h: 1.6, n: 3, items: 'books', d: 0.35 });
    k.lamp(cx, y0 + 2.2, cz + 1.2, { r: 3.0, i: 0.3, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
    spot('ct.0', cx, y0, cz + 0.8);
    const y1 = FL[1], r = RIN[1];
    // Blind arcading of small trefoil arches round the wall, wall shafts and ribs to a central boss.
    for (let i = 0; i <= 12; i++) {
      const a = (i / 12) * Math.PI;
      const p = ang(cx, cz, r - 0.12, a, y1 + 0.5);
      k.boxR(p[0], y1 + 0.95, p[2], 0.08, 0.9, 0.08, M.sand, { y: -a });
    }
    for (let i = 0; i < 12; i++) {
      const a0 = (i / 12) * Math.PI, a1 = ((i + 1) / 12) * Math.PI;
      const pts = [];
      for (let j = 0; j <= 4; j++) { const t = j / 4; const a = a0 + (a1 - a0) * t; const p = ang(cx, cz, r - 0.1, a, y1 + 1.4 + Math.sin(t * Math.PI) * 0.28); pts.push(p); }
      k.tube(pts, 0.04, M.sand, { seg: 4 });
    }
    k.box(cx - r, y1 + 0.42, cz + 0.0, cx + r, y1 + 0.5, cz + 0.05, M.sand);
    for (const a of [0.15, 0.6, 1.1, 1.57, 2.04, 2.54, 2.99]) {
      const p = ang(cx, cz, r - 0.12, a, y1);
      k.boxR(p[0], y1 + 1.6, p[2], 0.14, 3.2, 0.14, M.sand, { y: -a });
      const q = ang(cx, cz, r - 0.15, a, y1 + 3.2);
      const pts = [];
      for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push([q[0] + (cx - q[0]) * t, y1 + 3.2 + Math.sin(t * Math.PI / 2) * 1.1, q[2] + (cz + 0.2 - q[2]) * t]); }
      k.tube(pts, 0.07, M.sand, { seg: 4 });
    }
    k.sphere(cx, y1 + 4.25, cz + 0.2, 0.17, mat('#c8a050'), { seg: 8, rings: 5 });
    // The apse to the east: altar, three pointed lancets (glazed), sedilia (stone seats for the clergy).
    const altar = ang(cx, cz, r - 0.85, 0.35, y1);
    k.boxR(altar[0], y1 + 0.5, altar[2], 0.7, 1.0, 1.5, mat({ c: '#d8ccb4', c2: '#c0b49c', pat: 'ashlar', s: 0.3 }), { y: -0.35 });
    k.boxR(altar[0] - 0.36, y1 + 0.55, altar[2] - 0.12, 0.04, 0.85, 1.4, mat({ c: '#2a4a8a', c2: '#c8a050', pat: 'stripes', s: 0.2 }), { y: -0.35 });
    for (const dz of [-0.5, 0.5]) { const p = [altar[0] + 0.1, y1 + 1.0, altar[2] + dz]; k.cyl(p[0], p[1], p[2], 0.02, 0.32, mat('#c8a050'), { seg: 5 }); k.lamp(p[0], p[1] + 0.42, p[2], { r: 3.0, i: 0.6, color: '#ffc070', bulbR: 0.025, halo: 0.25, flicker: true }); }
    for (const a of [0.12, 0.42, 0.72]) {
      const p = ang(cx, cz, r - 0.02, a, y1);
      k.boxR(p[0], y1 + 2.7, p[2], 0.08, 2.0, 0.5, mat({ c: '#6a8ab0', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.16 }), { y: -a });
      k.boxR(p[0] - Math.cos(a) * 0.04, y1 + 2.7, p[2] - Math.sin(a) * 0.04, 0.05, 2.2, 0.7, M.sand, { y: -a });
    }
    for (let i = 0; i < 3; i++) {
      const a = 1.1 + i * 0.32;
      const p = ang(cx, cz, r - 0.3, a, y1);
      k.boxR(p[0], y1 + 0.25, p[2], 0.55, 0.5, 0.75, M.sand, { y: -a + Math.PI / 2 });
    }
    // The squint: a slanting slot from a side cell, drawn dark in the wall on the west side.
    const sq = ang(cx, cz, r - 0.03, 2.75, y1);
    k.boxR(sq[0], y1 + 1.5, sq[2], 0.06, 0.25, 0.18, M.dark, { y: -2.75 });
    k.box(cx - r, y1, cz, cx + r, y1 + 0.02, cz + 0.6, mat({ c: '#b07040', c2: '#e0c8a0', pat: 'checker', s: 0.3 }));
    spot('rchapel', cx - 0.8, y1, cz + 0.6); spot('rchapel.altar', altar[0] - 0.9, y1, altar[2] - 0.2); spot('rchapel.squint', cx - 2.6, y1, cz + 0.5);
    const y2 = FL[2];
    const bb = props.bed(k, cx - 1.0, y2, cz + 1.6, { w: 1.9, d: 0.9, blanket: '#5a4a3a' });
    bed('Z46', { feet: bb.feet, heading: bb.heading });
    props.desk(k, cx + 1.4, y2, cz + 1.4, { w: 1.0 });
    props.chair(k, cx + 1.2, y2, cz + 0.6, { face: 1 });
    hoodFire(k, roundFrame(k, cx, cz, RIN[2], 2.6, y2), 1.0, { reach: 3.5, i: 0.55 });
    k.lamp(cx + 1.4, y2 + 1.1, cz + 1.6, { r: 2.6, i: 0.55, color: '#ffc070', bulbR: 0.025, halo: 0.22, flicker: true });
    spot('ct.2', cx + 1.2, y2, cz + 0.7); spot('ct.roof', cx, FL[3], cz + 2.2);
  }
}

// ------------------------------------------------------------------ the hall range
function hallRooms(k) {
  const H = HALL, y = H.floor, yc = H.cellar;
  const back = wallFrame(k, 0, y, H.z1, -Math.PI / 2); // origin x = 0 on the back wall; u = x
  // Lesser hall (Z15): fireplace in the west end wall, trestle table, benches, chest.
  const W = wallFrame(k, H.x0, y, 4.6, 0);
  hoodFire(k, W, 1.7, { reach: 6, i: 0.95, hood: 2.2 });
  const lt = trestle(k, 25.6, 29.6, y, 2.9, { front: false, items: false });
  k.box(26.0, y + 0.74, 3.05, 26.3, y + 0.76, 3.3, mat('#f2ead8'));
  for (let i = 0; i < 4; i++) k.cyl(27.0 + i * 0.12, y + 0.74, 3.2, 0.012, 0.6, M.oak, { axis: 'z', seg: 4 });
  props.chair(k, 27.6, y, 3.95, { face: -1, tall: true, color: '#5a3a22', cushion: '#8a2a22' });
  props.chest(k, 29.6, y, 7.9, { w: 1.0, color: '#5a3020' });
  hanging(k, back, 28.6, 1.6, 2.0, 2.2, '#8a2a26', '#c8a050');
  candles(k, 25.6, y + 0.74, 3.2, { h: 0.3, r: 3.4 });
  sconce(k, back, 25.2, 2.2);
  A.seats.lesserChair = { x: 27.6, y, z: 4.15, seat: 0.46 };
  spot('lesser.petition', 27.6, y, 2.0); spot('lesser.petition2', 28.6, y, 1.6); spot('lesser.bench', 26.6, y, lt.back); spot('lesser.fire', 24.6, y, 3.4);
  // Cellar stair at the west end, down to the rock-cut cellar.
  props.stairs(k, 27.6, yc, 23.6, y, 7.6, 8.9, { color: '#9a948a', rail: false, solid: true });
  k.box(23.3, y - 0.36, 7.4, 28.0, y - 0.3, 7.6, M.oak);

  // Small chamber (Z16): fireplace on the north wall, the clerk's desk, tally sticks and rolls.
  const smallF = wallFrame(k, 33.2, y, H.z1, -Math.PI / 2);
  hoodFire(k, smallF, 1.2, { reach: 4.5, i: 0.75 });
  props.desk(k, 32.6, y, 1.2, { w: 1.4, top: '#6a4428' });
  for (let i = 0; i < 3; i++) k.cyl(32.1 + i * 0.25, y + 0.77, 1.4, 0.04, 0.3, mat('#efe6cc'), { axis: 'z', seg: 6 });
  for (let i = 0; i < 6; i++) k.box(33.2 + i * 0.05, y + 0.77, 1.35, 33.23 + i * 0.05, y + 0.79, 1.75, M.oakGrey);
  props.chair(k, 32.7, y, 2.0, { face: -1, color: '#5a3a22' });
  props.shelves(k, 34.4, y, 7.9, { w: 1.1, h: 2.0, n: 5, items: 'books', d: 0.4 });
  props.chest(k, 31.9, y, 7.6, { w: 0.8 });
  props.chair(k, 33.9, y, 0.8, { face: -1, color: '#7a5432' });
  candles(k, 32.0, y + 0.77, 1.6, { h: 0.2, r: 3.0 });
  A.seats.clerk = { x: 32.7, y, z: 2.2, seat: 0.46 };
  A.seats.visitor = { x: 33.9, y, z: 1.0, seat: 0.46 };
  spot('small.desk', 32.7, y, 2.25); spot('small.stand', 34.2, y, 0.9); spot('small.lesson', 31.9, y, 3.2); spot('small.lesson2', 32.5, y, 3.6); spot('small.chaplain', 34.2, y, 3.0);

  // Great hall (Z17): dais and high table at the west end, trestles, plate cupboard, candles.
  k.box(35.7, y, -1, 38.6, y + 0.3, H.z1, M.boards);
  const hy = y + 0.3;
  k.box(36.0, hy + 0.74 - 0.22, 2.0, 38.4, hy + 0.74, 2.8, mat({ c: '#f2ece0', c2: '#e0d6c4' }));
  for (const lx of [36.2, 38.1]) k.box(lx, hy, 2.2, lx + 0.08, hy + 0.5, 2.6, M.oakDark);
  props.chair(k, 37.2, hy, 2.95, { face: -1, tall: true, color: '#5a3020', cushion: '#2a3a7a' });
  props.bench(k, 36.3, hy, 2.95, { w: 0.9 }); props.bench(k, 38.1, hy, 2.95, { w: 0.6 });
  for (let i = 0; i < 4; i++) k.cyl(36.3 + i * 0.6, hy + 0.74, 2.3, 0.1, 0.012, mat('#c8ccd0'), { seg: 10 });
  k.cyl(37.2, hy + 0.74, 2.5, 0.12, 0.22, mat('#c8ccd0'), { seg: 10, r2: 0.08 }); // salt
  candles(k, 36.4, hy + 0.74, 2.6, { h: 0.25, r: 3.6 }); candles(k, 38.0, hy + 0.74, 2.6, { h: 0.25, r: 3.6 });
  hanging(k, back, 37.2, 2.0, 2.8, 3.2, '#2a3a6a', '#c8a050');
  buffet(k, 39.6, y, 8.4, 1.6);
  A.seats.high = [[36.3, hy, 3.12], [36.75, hy, 3.12], [37.2, hy, 3.15], [37.9, hy, 3.12], [38.3, hy, 3.12]];
  const t1 = trestle(k, 39.6, 46.2, y, 1.6, { front: false, cloth: '#efe8d8' });
  const t2 = trestle(k, 39.6, 46.2, y, 5.2, { front: true, cloth: '#efe8d8' });
  A.seats.hallA = []; A.seats.hallB = []; A.seats.hallC = [];
  for (let x = 40.0; x <= 45.9; x += 0.62) { A.seats.hallA.push([x, y, t1.back]); A.seats.hallB.push([x, y, t2.front]); A.seats.hallC.push([x, y, t2.back]); }
  for (const x of [41.0, 43.4, 45.6]) { candles(k, x, y + 0.74, 2.0, { h: 0.18, r: 3.2, i: 0.6 }); candles(k, x - 0.6, y + 0.74, 5.6, { h: 0.18, r: 3.2, i: 0.6 }); }
  sconce(k, back, 41.0, 2.4); sconce(k, back, 46.0, 2.4);
  // Sleeping pallets along the hall's back wall at night (servants slept where they could).
  for (let i = 0; i < 3; i++) bed('Z17', pallet(k, 41.9 + i * 1.75, y, 8.15, { w: 1.6, d: 0.7, blanket: ['#7a6a4a', '#6a5a4a', '#5a6a5a'][i] }));
  bed('Z17', pallet(k, 44.0, y, 3.05, { w: 1.7, d: 0.7, blanket: '#6a5a4a' }));
  bed('Z17', pallet(k, 41.0, y, 3.05, { w: 1.7, d: 0.7, blanket: '#5a6a6a' }));
  for (let i = 0; i < 2; i++) bed('Z17', pallet(k, 37.2, hy, 5.0 + i * 1.1, { w: 1.7, d: 0.75, blanket: ['#8a6a4a', '#6a5a6a'][i] }));
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) bed('Z15', pallet(k, 26.0 + i * 2.4, y, 5.2 + j * 1.0, { w: 1.8, d: 0.75, blanket: ['#7a5a4a', '#5a6a7a', '#6a6a4a', '#7a6a5a'][i * 2 + j] }));
  spot('hall.serve', 39.0, y, 1.0); spot('hall.serve2', 42.5, y, 4.2); spot('hall.buffet', 39.6, y, 7.6); spot('hall.mid', 43.0, y, 4.3);
  spot('hall.door', 46.0, y, 4.0); spot('hall.window', 38.2, y, 8.2);
  // The carpenter's ladder up into the roof (H3: a mason's carved face hides on a corbel up there).
  props.ladder(k, 44.6, y, H.plate + 0.6, 8.2, { w: 0.5, lean: -0.9 });
  k.sphere(41.75, H.plate - 2.15, 8.75, 0.13, M.sand, { seg: 8, rings: 5 });
  spot('roof.ladder', 44.6, y, 7.5);

  // Cross passage (Z18).
  props.bench(k, 48.8, y, 0.6, { w: 1.6 });
  sconce(k, back, 48.0, 2.2);
  spot('passage', 48.8, y, 4.5); spot('porch', 48.8, y, 8.6);
  k.lamp(48.8, 2.9, 10.7, { r: 4.0, i: 0.6, color: '#ffc070', bulbR: 0.05, halo: 0.45, flicker: true }); // lantern over the porch door

  // Chapel (Z19): altar under the three-light east window, candlesticks, stoup, a lectern.
  const ax = H.x1 - 0.1;
  k.box(ax - 1.0, y, 3.4, ax, y + 1.0, 5.4, mat({ c: '#d8ccb4', c2: '#c0b49c', pat: 'ashlar', s: 0.3 }));
  k.box(ax - 1.04, y + 0.08, 3.45, ax - 1.0, y + 0.95, 5.35, mat({ c: '#8a2a2a', c2: '#c8a050', pat: 'stripes', s: 0.25 }));
  k.box(ax - 0.9, y + 1.0, 3.5, ax - 0.1, y + 1.02, 5.3, mat('#f2ece0'));
  for (const z of [3.7, 5.1]) { k.cyl(ax - 0.5, y + 1.02, z, 0.02, 0.4, mat('#c8a050'), { seg: 5 }); k.lamp(ax - 0.5, y + 1.55, z, { r: 3.6, i: 0.7, color: '#ffc070', bulbR: 0.025, halo: 0.28, flicker: true }); }
  k.box(ax - 1.6, y, 3.0, ax - 1.0, y + 0.18, 5.8, M.boards);
  k.box(53.0, y, 1.3, 53.08, y + 1.15, 1.38, M.oakDark);
  k.boxR(53.04, y + 1.2, 1.34, 0.5, 0.05, 0.4, M.oak, { z: -0.4 });
  k.box(51.3, y, 8.4, 51.7, y + 0.9, 8.8, M.sand);
  k.cyl(51.5, y + 0.9, 8.6, 0.22, 0.12, M.sand, { seg: 10 });
  hanging(k, back, 58.8, 2.2, 1.6, 2.4, '#3a5a8a', '#e8d070');
  k.lamp(56.0, y + 3.0, 4.0, { r: 4.0, i: 0.4, color: '#ffc070', bulb: false, halo: 0 });
  spot('chapel.altar', ax - 1.9, y, 4.4); spot('chapel.lectern', 53.6, y, 1.4);
  A.seats.chapel = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) A.seats.chapel.push([54.5 + i * 0.9, y, 2.2 + j * 1.5]);

  // Cellars (Z13, Z14): barrels, salt-meat tubs, sacks; wine casks on chocks, ale, grain bins.
  barrels(k, 28.6, yc, 5.2, 5);
  for (let i = 0; i < 3; i++) tub(k, 29.0 + i * 0.9, yc, 1.0, 0.38, 0.6, M.oak, '#d8d0c0');
  sacks(k, 31.6, yc, 0.6, 6, { stack: true });
  props.crate(k, 25.0, yc, 1.4, { w: 0.8, h: 0.6, d: 0.7 }); props.crate(k, 25.2, yc + 0.6, 1.5, { w: 0.6, h: 0.45, d: 0.55 });
  k.lamp(30.0, yc + 2.2, 4.0, { r: 3.4, i: 0.4, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('cellW', 30.2, yc, 3.0); spot('cellW.steps', 27.8, yc, 8.2);
  casks(k, 44.6, yc, 0.5, 5, { gap: 1.05, stack: true });
  barrels(k, 44.4, yc, 4.4, 6);
  casks(k, 44.6, yc, 6.8, 5, { gap: 1.05 });
  for (let i = 0; i < 3; i++) k.box(51.6 + i * 1.5, yc, 0.6, 52.8 + i * 1.5, yc + 1.2, 2.4, mat({ c: '#8a6a44', c2: '#6a5034', pat: 'planks', s: 0.2 }));
  for (let i = 0; i < 3; i++) k.box(51.7 + i * 1.5, yc + 1.2, 0.7, 52.7 + i * 1.5, yc + 1.25, 2.3, mat({ c: '#d8b868', c2: '#c0a050', pat: 'speckle' }));
  // The candle-maker's corner: tallow pot on a brazier, a rack of dipped candles, rushes.
  k.cyl(57.5, yc, 2.2, 0.3, 0.45, M.iron, { seg: 10 });
  k.cyl(57.5, yc + 0.45, 2.2, 0.25, 0.3, mat('#4a4440'), { seg: 10 });
  k.lamp(57.5, yc + 0.5, 2.2, { always: true, r: 2.4, i: 0.5, color: '#ff8a40', bulb: false, halo: 0.25, flicker: true });
  k.box(58.3, yc + 1.4, 1.6, 60.4, yc + 1.45, 1.66, M.oakDark);
  for (let i = 0; i < 10; i++) k.cyl(58.45 + i * 0.2, yc + 0.95, 1.63, 0.018, 0.45, mat('#f0e6c8'), { seg: 4 });
  for (const lx of [58.3, 60.35]) k.box(lx, yc, 1.55, lx + 0.06, yc + 1.45, 1.7, M.oakDark);
  k.cyl(60.8, yc + 0.2, 3.6, 0.25, 1.2, M.straw, { axis: 'x', seg: 8 });
  k.lamp(48.0, yc + 2.2, 4.0, { r: 3.8, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  k.lamp(56.0, yc + 2.2, 5.0, { r: 3.4, i: 0.3, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('cellE', 49.2, yc, 3.2); spot('cellE.casks', 46.0, yc, 2.4); spot('candle', 58.0, yc, 1.3); spot('candle.rush', 60.0, yc, 2.8);
  spot('cat.cellar', 45.2, yc, 2.2);

  // The Prison Tower pit (Z21), drawn below the hall floor line: a round stone cell, straw, a bucket.
  const px = 40.0;
  k.lathe([[2.95, yc - 0.1], [2.95, y - 0.36], [2.05, y - 0.36], [2.05, yc + 0.05], [0.001, yc + 0.05], [0.001, yc - 0.1], [2.95, yc - 0.1]], px, 0, M.rubbleDark, { seg: 28, capTop: false, capBot: false });
  k.lathe([[0.42, y - 0.75], [2.1, y - 0.75], [2.1, y - 0.36], [0.42, y - 0.36], [0.42, y - 0.75]], px, 0, M.rubbleDark, { seg: 28, capTop: false, capBot: false });
  k.box(px - 1.2, yc + 0.05, 0.2, px + 1.0, yc + 0.15, 1.4, M.straw);
  k.cyl(px + 1.1, yc + 0.05, 1.2, 0.16, 0.3, M.oak, { seg: 8 });
  k.box(px + 1.92, yc + 1.6, 0.3, px + 2.06, yc + 1.75, 0.46, mat({ c: '#e8e4d0', glow: 'always', c2: '#c8d0d0' })); // the one tiny opening
  spot('pit', px - 0.4, yc + 0.05, 0.9); spot('pit.top', px + 0.2, y, 0.9);
}

// ------------------------------------------------------------------ royal apartments
function royalRooms(k) {
  const R = ROYAL;
  const back = wallFrame(k, 0, 0, R.z1, -Math.PI / 2);
  // Ground floor under the king's hall (Z37): service room, chests of linen and spare hangings.
  hoodFire(k, wallFrame(k, R.x0, 0, 3.8, 0), 1.4, { reach: 5, i: 0.6, fire: true });
  for (let i = 0; i < 4; i++) props.chest(k, 80.0 + i * 1.3, 0, 0.6 + (i % 2) * 0.2, { w: 1.1, h: 0.6, color: i % 2 ? '#5a3020' : '#6a3a22' });
  for (let i = 0; i < 3; i++) k.cyl(80.0, 0.2 + i * 0.36, 2.6, 0.17, 2.6, mat(['#7a2a26', '#3a5a7a', '#5a6a3a'][i]), { axis: 'x', seg: 8 });
  props.table(k, 84.4, 0, 3.4, { w: 1.4, d: 0.8, items: false });
  for (let i = 0; i < 3; i++) k.box(83.9 + i * 0.35, 0.74, 3.5 + (i % 2) * 0.15, 84.2 + i * 0.35, 0.82 + i * 0.03, 3.9 + (i % 2) * 0.15, mat(['#f2ede2', '#e8e0cc', '#f6f2e8'][i]));
  props.stairs(k, 75.0, 0, 79.0, R.first, 0.3, 1.3, { color: '#8a6a42' });
  k.lamp(80.0, 2.8, 3.5, { r: 4.2, i: 0.45, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  spot('royal.0', 84.4, 0, 2.9); spot('royal.0b', 82.2, 0, 2.2);
  // Ground floor under the king's chamber (Z39): stores.
  casks(k, 87.6, 0, 0.6, 3, { gap: 1.0 }); sacks(k, 88.0, 0, 3.6, 6, { stack: true });
  props.table(k, 91.4, 0, 1.0, { w: 1.4, d: 0.7, items: 'bottle' });
  k.lamp(90.0, 2.8, 3.5, { r: 3.6, i: 0.35, color: '#ffb060', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('royal.store', 90.0, 0, 2.6);
  // King's hall (Z38): kept ready; furniture under covers, a servant airing a hanging.
  const y1 = R.first;
  const cover = mat({ c: '#e8e2d4', c2: '#d8d0c0', pat: 'canvas' });
  k.box(77.0, y1, 3.0, 82.0, y1 + 0.85, 4.0, cover);
  k.box(78.4, y1, 5.6, 79.2, y1 + 1.3, 6.4, cover); k.box(80.2, y1, 5.6, 81.0, y1 + 1.3, 6.4, cover);
  k.box(83.2, y1, 1.0, 85.4, y1 + 0.55, 1.6, cover);
  hanging(k, back, 76.0, 1.8, 1.6, 2.6, '#7a2a26', '#e8c050');
  hanging(k, back, 86.0 - 1.4, 1.8, 1.4, 2.4, '#2a4a7a', '#e8c050');
  k.lamp(80.0, y1 + 3.0, 3.5, { r: 4.0, i: 0.35, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  spot('khall', 80.5, y1, 2.0); spot('khall.window', 83.0, y1, 7.6); spot('khall.b', 77.5, y1, 6.2);
  // King's chamber (Z40): bed frame, chest, bench.
  const kb = testerBed(k, 90.4, y1, 5.0, { w: 2.2, d: 1.6, curtain: '#2a4a7a', blanket: '#e8e2d4' });
  void kb;
  props.chest(k, 87.6, y1, 6.6, { w: 1.0, color: '#5a3020' });
  props.bench(k, 89.0, y1, 1.2, { w: 1.8 });
  hanging(k, wallFrame(k, R.mid + 0.35, y1, 4.0, 0), 1.0, 1.8, 1.5, 2.0, '#6a2a5a', '#e8c050');
  k.lamp(90.0, y1 + 3.0, 3.0, { r: 3.8, i: 0.35, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  spot('kchamber', 89.0, y1, 2.2); spot('kchamber.window', 90.0, y1, 7.5);
}

// ------------------------------------------------------------------ the north lean-tos and yards
function northRange(k) {
  const z0 = LEAN.z0, zb = NCURT.z0;
  // Forge [illustrative position]: hearth with bellows, anvil on a stump, quench tub.
  k.box(25.0, 0, zb - 1.6, 27.6, 0.85, zb, M.rubble);
  k.box(25.2, 0.85, zb - 1.4, 27.4, 0.9, zb - 0.2, mat({ c: '#c86a3a', c2: '#ffb060', glow: 'always' }));
  k.box(25.0, 2.6, zb - 1.7, 27.6, 3.4, zb, M.sooty);
  k.box(25.6, 3.4, zb - 1.0, 27.0, LEAN.top, zb, M.sooty);
  k.lamp(26.3, 1.4, zb - 0.9, { always: true, r: 3.8, i: 0.75, color: '#ff7a30', bulb: false, halo: 0.5, flicker: true });
  props.anvil(k, 27.0, 0, zb - 3.4);
  k.cyl(27.0, 0, zb - 3.25, 0.3, 0.5, M.oakDark, { seg: 10 });
  tub(k, 28.6, 0, zb - 2.6, 0.38, 0.55, M.oak, '#4e6e74');
  for (let i = 0; i < 5; i++) k.box(28.4 + i * 0.25, 1.6, zb - 0.06, 28.46 + i * 0.25, 2.2, zb - 0.02, M.iron);
  props.chest(k, 24.6, 0, z0 + 1.2, { w: 0.7, color: '#4a3a2a' });
  spot('forge', 27.0, 0, zb - 4.1); spot('forge.bellows', 24.5, 0, zb - 1.0); spot('forge.hearth', 26.3, 0, zb - 2.4);
  A.forge = { bellows: [24.3, 0.9, zb - 0.9] };

  // Kitchen (Z23): wide hearth against the stone wall, spits on firedogs, cauldrons on chains.
  const hx0 = 32.0, hx1 = 39.0;
  k.box(hx0, 0, zb - 0.5, hx1, LEAN.top, zb, M.sooty);
  k.box(hx0, 0, zb - 1.8, hx1, 0.32, zb - 0.5, M.flags);
  k.box(hx0 - 0.4, 0, zb - 2.0, hx0, 2.6, zb, M.rubble); k.box(hx1, 0, zb - 2.0, hx1 + 0.4, 2.6, zb, M.rubble);
  k.box(hx0 - 0.4, 2.6, zb - 2.1, hx1 + 0.4, 3.0, zb, M.rubble);
  k.box(hx0, 3.0, zb - 1.6, hx1, 4.1, zb, M.plaster);
  k.box(hx0 + 1.0, 4.1, zb - 1.1, hx1 - 1.0, LEAN.top - 0.4, zb, M.plaster);
  k.box(hx0 + 1.4, LEAN.top - 0.4, zb - 1.0, hx1 - 1.4, LEAN.top + 1.2, zb, M.sooty); // louvre stack through the roof
  for (let i = 0; i < 6; i++) k.cyl(hx0 + 1.0 + i * 0.95, 0.38, zb - 1.0, 0.09, 0.7, M.oakDark, { axis: 'z', seg: 6 });
  k.box(hx0 + 0.6, 0.32, zb - 1.6, hx1 - 0.6, 0.42, zb - 0.6, mat({ c: '#c86a3a', c2: '#ffb060', glow: 'always' }));
  k.lamp(35.5, 1.0, zb - 1.3, { always: true, r: 6.5, i: 1.0, color: '#ff8030', bulb: false, halo: 0.9, flicker: true });
  k.lamp(37.5, 0.9, zb - 1.2, { always: true, r: 4.0, i: 0.6, color: '#ff8a40', bulb: false, halo: 0.5, flicker: true });
  // Firedogs and the spit rest across the front of the fire.
  for (const fx of [hx0 + 0.9, hx0 + 4.6]) { k.box(fx - 0.05, 0.32, zb - 2.3, fx + 0.05, 1.05, zb - 2.2, M.iron); k.box(fx - 0.18, 0.32, zb - 2.3, fx + 0.18, 0.4, zb - 2.2, M.iron); }
  A.spit = { x0: hx0 + 0.8, x1: hx0 + 4.7, y: 0.95, z: zb - 2.25 };
  // Cauldron chains from a bar.
  k.box(hx0 + 4.8, 2.45, zb - 1.15, hx1 - 0.2, 2.55, zb - 1.05, M.iron);
  for (const cxp of [hx0 + 5.4, hx0 + 6.4]) { k.cyl(cxp, 1.25, zb - 1.1, 0.012, 1.2, M.iron, { seg: 4 }); props.cauldron(k, cxp, 0.6, zb - 1.5, { r: 0.4, contents: '#8a6a3a' }); }
  A.cauldrons = [[hx0 + 5.4, 1.2, zb - 1.1], [hx0 + 6.4, 1.2, zb - 1.1]];
  // Work table, chopping block, salting trough, shelves, baskets of fish.
  props.table(k, 41.2, 0, z0 + 1.3, { w: 2.8, d: 0.85, h: 0.85, items: 'bread', top: '#9a7448' });
  k.cyl(43.5, 0, z0 + 3.4, 0.32, 0.75, M.oakDark, { seg: 10 });
  k.box(39.6, 0, zb - 1.2, 42.4, 0.7, zb - 0.4, M.oak);
  k.box(39.7, 0.65, zb - 1.1, 42.3, 0.68, zb - 0.5, mat('#e8e4dc'));
  props.shelves(k, 43.6, 0, zb - 0.45, { w: 1.6, h: 2.0, n: 4, items: 'jars', d: 0.42 });
  for (let i = 0; i < 2; i++) { k.cyl(31.6 + i * 0.6, 0, z0 + 1.0, 0.25, 0.3, mat({ c: '#b08a4a', c2: '#8a6a3a', pat: 'thatch', s: 0.06 }), { seg: 10 }); k.box(31.45 + i * 0.6, 0.3, z0 + 0.95, 31.75 + i * 0.6, 0.36, z0 + 1.05, mat('#a8b4b8')); }
  for (let i = 0; i < 5; i++) { k.cyl(40.0 + i * 0.4, LEAN.eave - 0.5, z0 + 1.6, 0.006, 0.3, M.iron, { seg: 3 }); k.box(39.92 + i * 0.4, LEAN.eave - 1.15, z0 + 1.55, 40.08 + i * 0.4, LEAN.eave - 0.5, z0 + 1.65, mat(i % 2 ? '#8a4a3a' : '#a85a48')); }
  k.lamp(41.5, LEAN.eave - 0.9, z0 + 2.0, { r: 4.2, i: 0.45, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  bed('Z23', pallet(k, 35.0, 0, z0 + 0.7, { w: 1.7, d: 0.75, blanket: '#6a5a4a' })); bed('Z23', pallet(k, 37.2, 0, z0 + 0.7, { w: 1.5, d: 0.7, blanket: '#7a6a4a' }));
  spot('kitchen.spit', hx0 + 5.1, 0, zb - 2.9); spot('kitchen.table', 41.2, 0, z0 + 0.6); spot('kitchen.table2', 42.3, 0, z0 + 0.6); spot('kitchen.trough', 41.0, 0, zb - 1.7);
  spot('kitchen.pots', 37.5, 0, zb - 2.6); spot('kitchen.door', 44.0, 0, z0 - 0.6); spot('kitchen.block', 43.5, 0, z0 + 2.6); spot('kitchen.mid', 38.0, 0, z0 + 2.2);
  spot('dog.kitchen', 44.6, 0, z0 - 0.6);
  // Brewhouse (Z25): furnace with the boiling pan, the mash tun, cooling troughs, barrels.
  k.box(45.6, 0, zb - 2.2, 47.6, 0.9, zb - 0.4, M.rubble);
  k.box(46.0, 0.1, zb - 2.25, 47.2, 0.6, zb - 2.18, mat({ c: '#c86a3a', c2: '#ffb060', glow: 'always' }));
  k.lathe([[0.75, 0.9], [0.8, 1.35], [0.74, 1.35], [0.001, 0.98]], 46.6, zb - 1.3, mat('#a8703a'), { seg: 16 });
  k.cyl(46.6, 1.2, zb - 1.3, 0.72, 0.02, mat('#8a6a3a'), { seg: 16 });
  k.lamp(46.6, 0.4, zb - 2.1, { always: true, r: 3.4, i: 0.6, color: '#ff8030', bulb: false, halo: 0.45, flicker: true });
  tub(k, 49.0, 0, zb - 2.3, 0.85, 1.0, M.oak, '#a8803a');
  k.box(45.4, 0.55, z0 + 0.6, 48.0, 0.85, z0 + 1.3, M.oak); k.box(45.5, 0.8, z0 + 0.7, 47.9, 0.82, z0 + 1.2, mat('#a8803a'));
  barrels(k, 48.4, 0, z0 + 0.5, 3, { r: 0.3, h: 0.85 });
  k.lamp(48.0, LEAN.eave - 0.9, z0 + 2.4, { r: 3.6, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  spot('brew.tun', 49.8, 0, zb - 3.4); spot('brew.pan', 46.6, 0, zb - 2.9); spot('brew.trough', 46.6, 0, z0 + 0.1); spot('brew.barrels', 49.8, 0, z0 + 0.0);
  A.brew = { tun: [49.85, 1.0, zb - 1.45], pan: [46.6, 1.3, zb - 1.3] };
  // Stables (Z26): stalls, hay rack, manger, saddles on pegs, a hayloft at the back.
  k.box(51.1, 0.04, z0, 58.5, 0.07, zb, M.straw);
  for (let sx = 53.4; sx < 58.4; sx += 2.3) k.box(sx - 0.06, 0, z0 + 1.6, sx + 0.06, 1.4, zb - 0.2, M.boards);
  k.box(51.2, 0.5, zb - 0.75, 58.4, 1.0, zb - 0.15, M.oak);
  for (let x = 51.4; x < 58.4; x += 0.22) k.beam([x, 1.1, zb - 0.6], [x, 1.9, zb - 0.1], 0.03, M.oak);
  k.box(51.2, 1.75, zb - 0.62, 58.4, 1.85, zb - 0.05, M.oak);
  for (let x = 51.4; x < 58.4; x += 0.6) k.box(x, 1.85, zb - 0.6, x + 0.5, 2.05, zb - 0.1, M.straw);
  k.box(51.1, 2.75, zb - 2.6, 58.5, 2.9, zb, M.boards);
  k.box(51.3, 2.9, zb - 2.4, 56.4, 3.4, zb - 0.3, M.straw);
  props.ladder(k, 58.0, 0, 2.9, zb - 2.9, { w: 0.4, lean: -0.3 });
  for (let i = 0; i < 3; i++) { const x = 51.6 + i * 0.7; k.box(x - 0.04, 1.5, z0 + 0.4, x + 0.04, 1.58, z0 + 0.62, M.oakDark); k.box(x - 0.25, 1.15, z0 + 0.42, x + 0.25, 1.5, z0 + 0.7, mat('#6a3a1e')); }
  k.lamp(54.6, LEAN.eave - 1.0, z0 + 1.6, { r: 3.6, i: 0.35, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  A.horses = [[52.3, 0.07, z0 + 3.4], [54.6, 0.07, z0 + 3.4], [56.9, 0.07, z0 + 3.4]];
  spot('stable', 55.8, 0, z0 + 0.8); spot('stable.b', 53.3, 0, z0 + 0.7); spot('stable.saddles', 52.3, 0, z0 + 0.9);
  bed('Z26', { feet: [55.5, 3.42, zb - 1.4], heading: 0 }); bed('Z26', { feet: [53.4, 3.42, zb - 1.3], heading: 0 });
  spot('cat.stable', 52.5, 3.4, zb - 0.8);

  // Granary (Z42): raised boards, heaps of grain, sacks, a scoop.
  for (const [gx, gr] of [[76.0, 1.2], [78.6, 1.0]]) k.lathe([[gr, 0.07], [gr * 0.55, 0.5], [0.001, 0.75]], gx, zb - 2.0, mat({ c: '#d8b868', c2: '#c0a050', pat: 'speckle' }), { seg: 16 });
  sacks(k, 80.0, 0.07, z0 + 2.0, 6, { stack: true });
  k.box(81.0, 0.07, zb - 1.0, 82.6, 1.2, zb - 0.2, M.boards);
  k.lamp(78.5, LEAN.eave - 1.0, z0 + 2.0, { r: 3.6, i: 0.3, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
  spot('granary', 78.0, 0, z0 + 1.4); spot('granary.b', 80.6, 0, z0 + 1.0); spot('cat.granary', 77.0, 0.07, z0 + 2.4);
}

function yards(k) {
  // Outer ward courtyard (Z22): beaten earth; laundry tubs; woodpile; handcart; lime pit; the butt.
  k.box(HALL.x0, -0.02, HALL.back, 62.0, 0.03, LEAN.z0, M.earth);
  for (let i = 0; i < 3; i++) tub(k, 30.0 + i * 1.3, 0, 13.6, 0.5, 0.55, M.oak, '#c8d0d0');
  k.box(28.4, 0, 12.8, 28.6, 1.8, 13.0, M.oakDark); k.box(33.4, 0, 12.8, 33.6, 1.8, 13.0, M.oakDark);
  k.rope([28.5, 1.7, 12.9], [33.5, 1.7, 12.9], 0.01, mat('#c8b080'), 0.04);
  for (let i = 0; i < 4; i++) k.box(29.0 + i * 1.1, 0.9, 12.86, 29.8 + i * 1.1, 1.66, 12.9, mat({ c: '#f2ede2', thin: true }));
  faggots(k, 21.0 + 3.6, 0, LEAN.z0 - 1.4, 6);
  // Handcart.
  k.box(26.0, 0.55, 17.4, 27.6, 0.65, 18.4, M.oak);
  k.box(26.0, 0.65, 17.4, 27.6, 0.95, 17.45, M.oak); k.box(26.0, 0.65, 18.35, 27.6, 0.95, 18.4, M.oak);
  for (const zz of [17.3, 18.5]) k.cyl(26.8, 0.4, zz, 0.4, 0.06, M.oakDark, { axis: 'z', seg: 12 });
  k.beam([27.6, 0.6, 17.6], [28.6, 0.25, 17.6], 0.05, M.oak); k.beam([27.6, 0.6, 18.2], [28.6, 0.25, 18.2], 0.05, M.oak);
  // Lime pit and mortar board for the mason.
  k.box(51.4, -0.05, 16.4, 53.4, 0.3, 18.0, M.oak);
  k.box(51.55, 0.2, 16.55, 53.25, 0.27, 17.85, mat('#f2f0e8'));
  k.box(54.0, 0, 16.8, 55.0, 0.5, 17.6, M.oak);
  // The crossbow butt: a bank of turf with a cloth mark, against the ditch at the east end.
  k.box(58.4, 0, 11.6, 59.4, 1.6, 14.0, M.turf);
  k.cyl(58.38, 0.9, 12.8, 0.28, 0.03, mat('#f2ede2'), { axis: 'x', seg: 12 });
  k.cyl(58.36, 0.9, 12.8, 0.1, 0.03, mat('#a8322a'), { axis: 'x', seg: 10 });
  A.butt = [58.38, 0.9, 12.8];
  spot('laundry', 31.3, 0, 12.7); spot('laundry2', 32.6, 0, 14.6); spot('laundry.line', 30.4, 0, 12.2);
  spot('drill', 36.0, 0, 15.5); spot('butt.shoot', 38.0, 0, 12.8); spot('lime', 52.4, 0, 15.6); spot('cart', 27.0, 0, 16.6);
  spot('yard.porter', 22.0, 0, 15.6); spot('yard.mid', 44.0, 0, 16.0); spot('yard.e', 56.0, 0, 18.5); spot('yard.w', 28.0, 0, 19.5);
  // The well (Z28): stone kerb, windlass on two posts, trough. The shaft drops 28 m below.
  const W = WELL;
  k.lathe([[W.r, 0], [W.r + 0.35, 0], [W.r + 0.35, 0.75], [W.r, 0.75], [W.r, 0]], W.x, W.z, M.flags, { seg: 20, capTop: false, capBot: false });
  for (const dz of [-1.3, 1.3]) k.box(W.x - 0.1, 0, W.z + dz - 0.1, W.x + 0.1, 2.1, W.z + dz + 0.1, M.oakDark);
  k.lathe([[W.r - 0.05, -13.4], [W.r + 0.3, -13.4], [W.r + 0.3, -0.05], [W.r - 0.05, -0.05], [W.r - 0.05, -13.4]], W.x, W.z, M.rubbleDark, { seg: 16, capTop: false, capBot: false });
  k.box(W.x - W.r, -13.9, W.z - W.r, W.x + W.r, -13.4, W.z + W.r, M.water);
  k.box(W.x + 1.2, 0, W.z - 0.7, W.x + 2.6, 0.55, W.z - 0.2, M.oak);
  A.well = { x: W.x, y: 1.75, z: W.z };
  spot('well', W.x - 0.9, 0, W.z - 1.6); spot('well.trough', W.x + 1.9, 0, W.z - 1.2);
  // Inner ward courtyard (Z35): paved, a bench and potted herbs.
  k.box(71.0, -0.02, 9.2, 94.0, 0.03, LEAN.z0 + 0.0, M.cobble);
  k.box(83.0, -0.02, LEAN.z0, 88.4, 0.03, 27.0, M.cobble);
  props.bench(k, 84.6, 0, 12.0, { w: 1.8 });
  for (let i = 0; i < 3; i++) { k.lathe([[0.18, 0], [0.24, 0.4], [0.22, 0.42]], 86.4 + i * 0.6, 12.2, mat('#a85a3a'), { seg: 10 }); k.sphere(86.4 + i * 0.6, 0.55, 12.2, 0.2, mat('#5a7a3a'), { seg: 7, rings: 5 }); }
  spot('inner', 82.0, 0, 15.0); spot('inner.bench', 84.6, 0, 11.8); spot('inner.e', 90.5, 0, 16.0);
  // Ditch bottom and drawbridge pit edge.
  k.box(62.0, -3.05, 6.0, 66.5, -2.95, 24.0, M.mud);
}

function barbicanLife(k) {
  // West barbican yard (Z04) and gate.
  spot('bgate', 2.6, BARB_W.y, 15.0); spot('bgate.in', 5.0, BARB_W.y, 14.0); spot('byard', 8.0, BARB_W.y, 18.0);
  props.bench(k, 4.0, BARB_W.y, 7.2, { w: 1.6 });
  // Porter's lodge and guard room (Z12): bench, crossbows on pegs, dice on a barrel.
  props.bench(k, 20.0, 0, GATE_Z[1] + 5.4, { w: 2.0 });
  props.barrel(k, 21.2, 0, GATE_Z[1] + 2.0, { r: 0.3, h: 0.75 });
  for (let i = 0; i < 3; i++) crossbow(k, 18.4 + i * 1.1, 1.8, 23.5, 0);
  k.lamp(20.0, 2.8, 20.5, { r: 3.6, i: 0.5, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
  k.lamp(15.5, 2.8, 20.5, { r: 3.0, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
  k.lamp(18.0, 3.6, 15.0, { r: 3.6, i: 0.45, color: '#ffc070', bulbR: 0.04, halo: 0.3, flicker: true }); // gate passage lantern
  k.lamp(23.4, 3.2, 15.0, { r: 4.5, i: 0.6, color: '#ffc070', bulbR: 0.05, halo: 0.45, flicker: true }); // lantern at the inner end of the gate
  k.lamp(80.0, 2.9, 10.0, { r: 3.6, i: 0.45, color: '#ffc070', bulbR: 0.05, halo: 0.4, flicker: true }); // royal range door
  spot('guard', 20.0, 0, GATE_Z[1] + 2.3); spot('guard.dice', 21.0, 0, GATE_Z[1] + 1.4); spot('guard.dice2', 21.6, 0, GATE_Z[1] + 2.5);
  spot('lodge', 15.4, 0, GATE_Z[1] + 2.5); spot('gp', 18.5, 0, 15.0); spot('winch', 16.4, 4.9, 15.0);
  // East barbican garden (Z48): lawn, herb beds, a bee skep, linen spread to bleach, a bench.
  const G = GARDEN;
  k.box(102.0, G.y, 2.0, 116.4, G.y + 0.04, 24.4, M.turf);
  for (let i = 0; i < 4; i++) {
    const x = 104.0 + i * 3.0;
    k.box(x, G.y, 3.0, x + 2.2, G.y + 0.3, 4.6, mat({ c: '#6a5038', c2: '#5a4430', pat: 'planks', s: 0.15 }));
    for (let j = 0; j < 6; j++) k.sphere(x + 0.2 + j * 0.36, G.y + 0.42, 3.8 + (j % 2) * 0.3, 0.17, mat(j % 3 ? '#5a7a3a' : '#7a8a4a'), { seg: 6, rings: 4 });
  }
  k.lathe([[0.32, G.y + 0.5], [0.3, G.y + 0.8], [0.18, G.y + 1.0], [0.001, G.y + 1.05]], 115.4, 6.0, mat({ c: '#c8a860', c2: '#a88a48', pat: 'thatch', s: 0.06 }), { seg: 12 });
  k.box(115.1, G.y, 5.7, 115.7, G.y + 0.5, 6.3, M.oakDark);
  props.bench(k, 108.0, G.y, 22.4, { w: 2.0 });
  for (let i = 0; i < 3; i++) k.box(104.6 + i * 2.6, G.y + 0.05, 9.0 + (i % 2) * 2.2, 106.8 + i * 2.6, G.y + 0.07, 10.8 + (i % 2) * 2.2, mat({ c: '#f4f0e6', c2: '#e8e2d4', pat: 'canvas' }));
  // A fruit tree [illustrative].
  k.cyl(112.5, G.y, 17.5, 0.16, 2.0, M.oakDark, { seg: 7 });
  k.sphere(112.5, G.y + 2.7, 17.5, 1.3, mat({ c: '#5a7a3a', c2: '#4a6a32', pat: 'speckle' }), { seg: 10, rings: 7 });
  spot('garden', 108.0, G.y, 12.0); spot('garden.beds', 106.0, G.y, 5.4); spot('garden.lawn', 110.0, G.y, 14.6); spot('garden.bench', 108.0, G.y, 22.2);
  spot('garden.linen', 106.6, G.y, 8.4); spot('garden.wall', G.x1 - 0.9, G.y, 11.6); spot('garden.skep', 114.6, G.y, 7.0);
  // The water gate and dock (Z49, Z50).
  spot('wgate', 116.2, DOCK.y, 28.4); spot('dock', 121.0, DOCK.y, 28.0); spot('dock.b', 124.0, DOCK.y, 30.0); spot('dock.c', 119.4, DOCK.y, 26.0);
  barrels(k, 118.4, DOCK.y, 31.2, 3, { r: 0.3, h: 0.8 });
  k.beam([125.6, DOCK.y, 32.4], [125.6, DOCK.y + 3.2, 32.4], 0.16, M.oakGrey);
  k.beam([125.6, DOCK.y + 3.1, 32.4], [126.8, DOCK.y + 3.1, 32.4], 0.12, M.oakGrey);
  k.cyl(126.6, DOCK.y + 2.95, 32.4, 0.12, 0.08, M.oakDark, { axis: 'z', seg: 8 });
  props.coil(k, 120.4, DOCK.y, 30.6, { r: 0.35 });
}

// Soft fill light for a room at night (firelight and candles on the walls), no bulb.
function fills(k) {
  const f = (x, y, z, r, i, c = '#ffb868') => k.lamp(x, y, z, { r, i, color: c, bulb: false, halo: 0, flicker: true });
  const T = TOWERS;
  for (const [key, inten] of [['sw', 0.75], ['bake', 0.6], ['king', 0.3]]) {
    const t = T[key];
    for (let fl = 0; fl < 3; fl++) f(t.x, FL[fl] + 2.3, 1.4, 5.2, inten * (fl === 0 && key === 'king' ? 1.6 : 1));
  }
  f(T.sw.x, -1.6, 1.4, 4.0, 0.4); f(T.king.x, -1.3, 1.4, 3.6, 0.25);
  for (const [key, inten] of [['nw', 0.6], ['kit', 0.65], ['stock', 0.6], ['chap', 0.5]]) {
    const t = T[key];
    for (let fl = 0; fl < 3; fl++) f(t.x, FL[fl] + 2.3, t.z + 1.6, 5.0, inten * (fl === 0 ? 0.5 : 1));
  }
  f(T.chap.x, FL[1] + 2.0, T.chap.z + 1.4, 4.5, 0.55, '#ffc878');
  f(27.0, 3.4, 4.0, 7.0, 0.8); f(33.2, 3.2, 4.0, 5.0, 0.6);
  f(39.2, 3.6, 4.5, 7.0, 0.85); f(44.2, 3.6, 4.5, 7.0, 0.85); f(48.8, 3.0, 4.5, 4.0, 0.4); f(56.5, 3.4, 4.5, 7.0, 0.65);
  f(30.0, -1.3, 4.0, 6.0, 0.35); f(44.0, -1.3, 4.0, 6.0, 0.35); f(55.0, -1.3, 4.0, 6.0, 0.3);
  f(80.0, 2.0, 4.0, 6.0, 0.35); f(90.0, 2.0, 4.0, 5.0, 0.25); f(80.0, 6.2, 4.0, 6.0, 0.3); f(90.0, 6.2, 4.0, 5.0, 0.3);
  f(26.8, 2.4, 24.0, 5.0, 0.4); f(38.0, 2.6, 24.0, 8.0, 0.7); f(48.0, 2.4, 24.0, 5.0, 0.5); f(55.0, 2.4, 24.0, 6.0, 0.45); f(78.5, 2.4, 24.0, 5.0, 0.3);
  f(18.0, 2.6, 15.0, 5.0, 0.6); f(20.0, 2.4, 20.5, 4.0, 0.5);
  f(-42.0, -3.2, 3.0, 5.0, 0.55); f(-33.8, -3.2, 3.0, 5.0, 0.55); f(-27.4, -3.2, 2.0, 4.5, 0.5);
}

export function furnish(k) {
  A.spots = {}; A.beds = {}; A.seats = {};
  fills(k);
  swTower(k);
  bakeTower(k);
  kingTower(k);
  backTowers(k);
  hallRooms(k);
  royalRooms(k);
  northRange(k);
  yards(k);
  barbicanLife(k);
  return A;
}
void STAIR;
