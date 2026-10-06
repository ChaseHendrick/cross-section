/* The Opera: behind the stage. The corridor and scenery lift, the Foyer de la Danse,
 * the extras' dressing room and the chorus hall beneath it, the costume store and the
 * workshops above, the administration with the battery laboratory, and the courtyard.
 */
import { mat, props } from '../../engine/index.js';
import { Y, D, MT, WIN, ST1 } from './common.js';
import { flight } from './stagehouse.js';
import { candelabrum, chandelier } from './front.js';

const Z0 = -0.45;
export const BACK = {};
export const fdY = (x) => Y.back + Math.max(0, x - 122.2) * 0.045; // the Foyer de la Danse floor, raked like the stage

export function back(k) {
  const L = (x, y, z, o) => k.lamp(x, y, z, o);
  const r = k.rng('back');
  const X0 = ST1 + 1.5; // 116.5
  // ---------------------------------------------------------------- corridor behind the stage
  k.box(X0, Y.back - 0.4, Z0, 121.6, Y.back, D.back, MT.stoneD, { top: MT.oak });
  // Iron doors to the administration side (N p.160).
  k.box(121.55, Y.back, 2.2, 121.6, Y.back + 3.0, 3.6, mat({ c: '#4a4e54', c2: '#5a5e64', pat: 'rivets', s: 0.3 }));
  L(119, 18.2, 4, { r: 6, i: 0.7, color: '#ffcf8a', bulbR: 0.05, halo: 0.3 });
  props.bench(k, 119, Y.back, 10.6, { w: 2.4, color: '#6a4a2a' });
  // A fire hose cabinet and the stage manager's bell.
  k.box(117.2, Y.back + 0.8, 11.5, 118.4, Y.back + 2.4, 12, mat({ c: '#a83a2a', c2: '#c8a050', pat: 'panels', s: 0.6 }));
  k.sphere(120.6, Y.back + 2.6, 11.9, 0.14, MT.gilt, { seg: 8, rings: 5, t1: Math.PI / 2 });
  // The scenery lift: winch and counterweights; it took twenty minutes to rise (fr.wikipedia).
  for (const [x, z] of [[117.2, 3.2], [121.0, 3.2], [117.2, 9.4], [121.0, 9.4]]) k.box(x - 0.12, Y.chorus, z - 0.12, x + 0.12, Y.back + 6, z + 0.12, MT.ironD);
  k.box(116.9, Y.back + 6, 3.0, 121.3, Y.back + 6.4, 9.6, MT.ironD);
  k.cyl(117.4, Y.back + 6.9, 4, 0.45, 5, MT.timber, { axis: 'z', seg: 10 });
  k.box(116.9, Y.chorus, 3.0, 121.3, Y.chorus + 0.1, 9.6, MT.concrete);
  BACK.lift = [119.1, Y.chorus, 6.3];
  // ---------------------------------------------------------------- the Foyer de la Danse
  const x0 = 122.2, x1 = 138.4, yc = 19.5;
  // Painted summer sky with Boulanger's panels and twenty portraits of dancers (N p.176 to 182).
  k.box(x0, yc - 0.05, Z0, x1, yc, 11.9, mat({ c: '#b8cede', c2: '#e8e0c8', pat: 'speckle', cut: '#8a9aa8' }));
  // Six spiral-fluted columns each side with butterfly capitals; we see the far row.
  for (let i = 0; i < 6; i++) {
    const x = x0 + 1.4 + i * 2.7, yb = fdY(x);
    k.cyl(x, yb, 7.6, 0.34, 0.5, MT.gilt, { seg: 10 });
    k.cyl(x, yb + 0.5, 7.6, 0.26, yc - yb - 1.6, mat({ c: '#d8b860', c2: '#a88a3a', pat: 'stripes', s: 0.12, cut: '#8a6a2a' }), { seg: 10 });
    k.lathe([[0.26, yc - 1.1], [0.55, yc - 0.6], [0.6, yc - 0.3]], x, 7.6, MT.gilt, { seg: 10 });
    // A dancer's portrait in an oval between the columns.
    if (i < 5) { k.box(x + 0.8, 15.0, 11.85, x + 1.9, 16.6, 11.95, MT.gilt); k.box(x + 0.9, 15.1, 11.8, x + 1.8, 16.5, 11.85, mat({ c: '#d8b8a0', c2: '#6a8aa8', pat: 'speckle' })); }
  }
  // Boulanger's painted panels on the far wall.
  for (let i = 0; i < 4; i++) k.box(x0 + 1.8 + i * 4.0, 12.6, 11.85, x0 + 4.6 + i * 4.0, 14.6, 11.95, mat({ c: '#a8b89a', c2: '#d8b080', pat: 'speckle' }));
  k.box(x0, 11.0, 11.9, x1, 19.4, 12, MT.gilt, { front: mat({ c: '#e8d4a0', c2: '#d4bc84', pat: 'panels', s: 1.4 }) });
  // The mirror in three pieces: Saint-Gobain had no table big enough to cast it whole (N p.181).
  for (let i = 0; i < 3; i++) k.box(x1 - 0.12, fdY(x1) + 0.4, 0.2 + i * 2.6, x1 - 0.04, 18.6, 2.6 + i * 2.6, MT.mirror);
  k.box(x1 - 0.16, 18.6, Z0, x1, 19.4, 8.4, MT.gilt);
  // Velvet barres along the far wall and the mirror; banquettes for mothers and maids.
  k.cyl(x0, fdY(x0) + 1.05, 11.6, 0.04, x1 - x0, mat('#8a2a2a'), { axis: 'x', seg: 6 });
  for (let x = x0 + 0.5; x < x1; x += 2.2) k.box(x, fdY(x), 11.55, x + 0.06, fdY(x) + 1.05, 11.65, MT.gilt);
  k.cyl(x1 - 0.5, fdY(x1) + 1.05, 0.2, 0.04, 7.5, mat('#8a2a2a'), { axis: 'z', seg: 6 });
  for (let x = x0 + 1.0; x < x1 - 2; x += 3.1) k.box(x, fdY(x), 9.0, x + 2.4, fdY(x) + 0.45, 9.6, MT.velvet);
  // The chandelier of 104 lights and gas girandoles (N p.176).
  BACK.fdd = chandelier(k, 130.3, yc, 3.5, 2.8, 1.4, { r: 10, i: 0.9 });
  for (const x of [125, 135.6]) candelabrum(k, x, fdY(x) + 0.0, 10.6, 2.2, MT.gilt, 5, { r: 4, i: 0.45, halo: 0.5 });
  // A dancer's basket, a watering can for the floor and the rosin box.
  k.box(128.2, fdY(128.2), 10.2, 128.8, fdY(128.2) + 0.35, 10.6, mat({ c: '#b89a5a', c2: '#8a6a3a', pat: 'grain' }));
  k.box(133.6, fdY(133.6), 10.4, 134.2, fdY(133.6) + 0.12, 10.9, mat('#e8e0d0'));
  BACK.rosin = [133.9, fdY(133.9), 10.6];
  // ---------------------------------------------------------------- the extras' dressing room
  // Under the Foyer de la Danse: men extras, the comparses (fr.wikipedia); Nuitter lists 190 places.
  const ye = Y.extras;
  for (let x = 123; x < x1; x += 2.6) {
    k.box(x, ye, 10.8, x + 2.2, ye + 0.45, 11.3, MT.timber);
    for (let i = 0; i < 4; i++) {
      k.box(x + 0.2 + i * 0.5, ye + 1.7, 11.88, x + 0.26 + i * 0.5, ye + 1.78, 11.95, MT.ironD);
      const col = r.pick(['#3a4a6a', '#5a4a3a', '#8a2a2a', '#6a6a5a', '#2a3a5a']);
      k.box(x + 0.08 + i * 0.5, ye + 0.85, 11.6, x + 0.38 + i * 0.5, ye + 1.7, 11.85, mat(col));
    }
  }
  k.box(x0, ye, 11.9, x1, Y.back - 0.4, 12, MT.plaster);
  for (const x of [126, 133]) L(x, Y.back - 0.8, 6, { r: 6, i: 0.6, color: '#ffcf8a', bulbR: 0.05, halo: 0.25, flicker: true });
  // Soldiers' helmets and halberds ready on a rack for the fourth act.
  for (let i = 0; i < 6; i++) k.sphere(124 + i * 0.5, ye + 2.3, 11.7, 0.14, MT.iron, { seg: 6, rings: 4, t0: Math.PI / 2 });
  // ---------------------------------------------------------------- the chorus hall
  // A rehearsal room with columns and six windows (fr.wikipedia), and its piano.
  for (let i = 0; i < 6; i++) { const x = x0 + 1.5 + i * 2.7; k.box(x - 0.6, 1.6, 11.95, x + 0.6, 4.8, 12.05, WIN); }
  for (const x of [126, 131, 136]) k.cyl(x, Y.chorus, 6.5, 0.3, Y.extras - 0.3 - Y.chorus, MT.stoneD, { seg: 10 });
  BACK.piano = props.piano(k, 125, Y.chorus, 9.2, { w: 1.6 });
  for (let x = 127; x < 137; x += 1.2) for (const z of [4.5, 6.8]) props.chair(k, x, Y.chorus, z, { face: -1, color: '#6a4a2a' });
  for (const x of [127, 134]) L(x, Y.extras - 0.8, 5, { r: 6, i: 0.6, color: '#ffcf8a', bulbR: 0.05, halo: 0.25 });
  // Stairs: chorus hall to the extras' room, to the corridor, and up to the stores.
  flight(k, 122.4, Y.chorus, 125.8, Y.extras, 0.4, 1.6, MT.timber);
  flight(k, 125.8, Y.extras, 122.6, Y.back, 2.0, 3.0, MT.timber);
  // ---------------------------------------------------------------- costume store and workshops
  // A central costume store with double rows of cupboards (N p.193).
  for (let x = 123; x < x1 - 1; x += 3.0) {
    for (const z of [3.2, 8.4]) props.wardrobe(k, x + 1.0, Y.costume, z, { w: 2.0, h: 3.6, d: 0.6, color: '#b0905e' });
  }
  for (let x = 124; x < x1 - 1; x += 4.5) { k.box(x, Y.costume, 11.2, x + 3.0, Y.costume + 2.6, 11.9, mat({ c: '#c8a878', c2: '#8a2a2a', pat: 'books', s: 0.3 })); }
  for (const x of [126, 134]) L(x, Y.workshop - 0.8, 6, { r: 6, i: 0.55, color: '#ffcf8a', bulbR: 0.05, halo: 0.25 });
  // Tailors' and seamstresses' workshops for sixty on the top floor (N p.193).
  for (let x = 124; x < x1 - 1; x += 3.4) {
    props.table(k, x + 1.2, Y.workshop, 7.4, { w: 2.4, d: 1.1, h: 0.8, items: false, top: '#b8a070' });
    k.box(x + 0.4, Y.workshop + 0.8, 7.6, x + 1.6, Y.workshop + 0.84, 8.2, mat({ c: r.pick(['#8a2a3a', '#2a4a8a', '#e8dcc0', '#5a6a3a']), c2: '#ffffff', pat: 'canvas', s: 0.2 }));
    for (const dz of [6.9, 9.0]) props.chair(k, x + 1.2, Y.workshop, dz, { face: dz > 8 ? -1 : 1 });
    k.box(x + 0.6, Y.workshop + 1.8, 11.95, x + 2.2, Y.workshop + 3.6, 12.05, WIN);
  }
  // Dressmakers' dummies and bolts of cloth.
  for (const x of [124.5, 131.5, 137.2]) { k.cyl(x, Y.workshop, 4.0, 0.03, 1.0, MT.ironD, { seg: 4 }); k.lathe([[0.2, Y.workshop + 1.0], [0.24, Y.workshop + 1.3], [0.18, Y.workshop + 1.55], [0.22, Y.workshop + 1.75], [0.08, Y.workshop + 1.85]], x, 4.0, mat('#d8c8a8'), { seg: 8 }); }
  for (let i = 0; i < 8; i++) k.cyl(123 + i * 0.35, Y.workshop, 10.8, 0.14, 1.4, mat(r.pick(['#8a2a3a', '#2a4a8a', '#c8b060', '#3a6a4a', '#e8dcc0'])), { seg: 7 });
  for (const x of [127, 134]) L(x, Y.backRoof - 0.7, 6, { r: 6, i: 0.6, color: '#ffcf8a', bulbR: 0.05, halo: 0.25 });
  // A steep service stair in the corridor up to the stores and workshops.
  flight(k, 117.0, Y.back, 121.2, 14.85, 10.4, 11.6, MT.timber);
  flight(k, 121.2, 14.85, 117.0, Y.costume, 10.4, 11.6, MT.timber);
  flight(k, 117.0, Y.costume, 121.2, Y.workshop, 10.4, 11.6, MT.timber);
  k.box(X0, Y.costume - 0.3, Z0, 121.6, Y.costume, 9.6, MT.timber, { top: MT.pine });
  k.box(X0, Y.workshop - 0.3, Z0, 121.6, Y.workshop, 9.6, MT.timber, { top: MT.pine });
  // ---------------------------------------------------------------- the administration
  admin(k, L, r);
  // ---------------------------------------------------------------- the courtyard and the stage door
  courtyard(k, L);
}

function admin(k, L, r) {
  const a0 = 139.6, a1 = 154.8, Dz = D.admin;
  const F = [Y.court, 7.6, 13.2, 18.8, 24.4];
  // Windows in the far wall on every floor.
  F.forEach((y) => { for (let x = a0 + 1.4; x < a1 - 1; x += 3.4) k.box(x, y + 1.0, Dz - 0.06, x + 1.4, y + 3.8, Dz + 0.04, WIN); });
  // A stair tower at the back of the block.
  for (let i = 0; i < 4; i++) flight(k, i % 2 ? a1 - 1.6 : a1 - 6.0, F[i], i % 2 ? a1 - 6.0 : a1 - 1.6, F[i + 1], Dz - 2.4, Dz - 1.2, MT.timber);
  // Ground floor: the battery laboratory, about 50 m2: six oak tables topped with thick glass,
  // seventy Bunsen cells and acid vats (N p.229 to 231; exact location [illustrative]).
  for (let i = 0; i < 6; i++) {
    const x = a0 + 0.8 + (i % 3) * 2.4, z = i < 3 ? 2.5 : 6.5;
    props.table(k, x + 1.0, Y.court, z, { w: 2.0, d: 1.1, h: 0.85, items: false, top: '#8a6a3a' });
    k.box(x, Y.court + 0.85, z, x + 2.0, Y.court + 0.9, z + 1.1, mat({ c: '#b8d0d4', c2: '#e0eef0', pat: 'speckle' }));
    for (let j = 0; j < 6; j++) k.cyl(x + 0.2 + j * 0.32, Y.court + 0.9, z + 0.55, 0.09, 0.26, mat({ c: '#9a8a6a', c2: '#c8b890', pat: 'speckle' }), { seg: 7 });
  }
  for (let i = 0; i < 3; i++) k.cyl(a0 + 1.2 + i * 1.6, Y.court, 10.2, 0.55, 0.9, mat({ c: '#8a7a5a', c2: '#a89a7a', pat: 'speckle' }), { seg: 10 });
  k.box(a0, Y.court, 11.5, a0 + 7.6, Y.court + 2.0, 12.0, MT.pine);
  BACK.lab = [a0 + 3.4, Y.court, 2.0];
  L(a0 + 3.8, 6.8, 5, { r: 6, i: 0.6, color: '#ffd48a', bulbR: 0.05, halo: 0.25 });
  k.box(147.4, Y.court, Z0, 147.6, 7.2, Dz, MT.plaster, { front: MT.plaster });
  // The stage door vestibule and the concierge's lodge (N p.184).
  k.box(150.4, Y.court, 3.6, 154.6, 5.0, 3.8, mat({ c: '#a8c0c8', c2: '#ffd890', pat: 'panes', s: 0.4, glow: 'night', cut: '#5a6a70' }));
  props.desk(k, 152.4, Y.court, 4.4, { w: 1.6 });
  k.box(150.4, Y.court, 3.8, 150.6, 5.0, 8.0, MT.mahogany);
  k.box(151, Y.court + 1.4, 7.8, 154, Y.court + 2.6, 7.95, mat({ c: '#7a5a3a', c2: '#c8a050', pat: 'grate', s: 0.12 })); // the board of copper tokens
  props.clock(k, 152.5, 6.0, 7.95, { r: 0.25 });
  BACK.lodge = [152.4, Y.court, 5.6];
  L(152.4, 6.6, 5, { r: 5, i: 0.7, color: '#ffd48a', bulbR: 0.05, halo: 0.3 });
  // First floor: the director's office and the accounts room where the takings are counted (N p.197 to 198).
  const y1 = F[1];
  props.rug(k, 143, y1, 3, { w: 4.2, d: 3.6, color: '#7a2a2a' });
  props.desk(k, 143, y1, 5.2, { w: 2.0 });
  props.chair(k, 143, y1, 6.1, { face: -1, tall: true, color: '#5a2a1a' });
  props.armchair(k, 141, y1, 2.2, { color: '#8a3a2a' });
  props.fireplace(k, 145.6, y1, Dz - 1.2, { w: 1.4, h: 1.3 });
  props.picture(k, 142.4, y1 + 2.4, Dz - 0.1, { w: 1.6, h: 1.2, color: '#6a5a4a' });
  L(143, y1 + 4.4, 4, { r: 6, i: 0.7, color: '#ffd48a', bulbR: 0.06, halo: 0.3 });
  k.box(147.4, y1, Z0, 147.6, y1 + 5.2, Dz, MT.plaster);
  props.table(k, 151, y1, 3.0, { w: 3.0, d: 1.2, h: 0.8, items: 'books', cloth: '#3a5a3a' });
  for (const x of [150, 152]) props.chair(k, x, y1, 4.4, { face: -1 });
  k.box(153.2, y1, 7, 154.6, y1 + 1.6, 8.2, mat({ c: '#3a3a3e', c2: '#c8a050', pat: 'panels', s: 0.6 })); // the safe
  props.shelves(k, 150, y1, Dz - 0.5, { w: 3.0, h: 2.4, n: 5, items: 'books' });
  BACK.accounts = [[150, y1, 4.6], [152, y1, 4.6], [151, y1, 2.4]];
  L(151, y1 + 4.4, 4, { r: 6, i: 0.7, color: '#ffd48a', bulbR: 0.06, halo: 0.3 });
  // Second floor: principals' dressing rooms [placement illustrative].
  const y2 = F[2];
  BACK.dress = [];
  for (let i = 0; i < 3; i++) {
    const x = a0 + i * 5.1;
    if (i) k.box(x - 0.1, y2, Z0, x + 0.1, y2 + 5.2, Dz, MT.plaster);
    props.table(k, x + 2.4, y2, Dz - 6.0, { w: 1.8, d: 0.6, h: 0.78, items: 'bottle', cloth: '#e8dcc8' });
    k.box(x + 1.7, y2 + 0.9, Dz - 5.4, x + 3.1, y2 + 2.2, Dz - 5.36, MT.mirror);
    props.chair(k, x + 2.4, y2, Dz - 7.2, { face: 'out', color: '#8a3a2a' });
    k.box(x + 0.4, y2, Dz - 3.6, x + 0.6, y2 + 1.9, Dz - 1.0, MT.ironD);
    k.box(x + 0.2, y2 + 0.5, Dz - 3.4, x + 0.8, y2 + 1.8, Dz - 1.2, mat(['#e8dcc0', '#2a2a4a', '#8a1a1a'][i]));
    props.armchair(k, x + 3.8, y2, 2.4, { color: '#6a4a6a', w: 0.9 });
    BACK.dress.push([x + 2.4, y2, Dz - 7.0]);
    L(x + 2.4, y2 + 4.3, 4, { r: 4.5, i: 0.65, color: '#ffd48a', bulbR: 0.05, halo: 0.3 });
  }
  // Third floor: chorus dressing rooms, women and men (N p.191: 50 and 60 places).
  const y3 = F[3];
  k.box(147.4, y3, Z0, 147.6, y3 + 5.2, Dz, MT.plaster);
  BACK.chorusRooms = [];
  for (const [xa, xb] of [[a0, 147.4], [147.6, a1]]) {
    props.table(k, (xa + xb) / 2, y3, 9.5, { w: xb - xa - 1.2, d: 0.7, h: 0.78, items: false, top: '#9a7a52' });
    for (let x = xa + 1; x < xb - 1; x += 1.4) { k.box(x - 0.3, y3 + 0.9, 10.15, x + 0.3, y3 + 1.6, 10.2, MT.mirror); BACK.chorusRooms.push([x, y3, 8.8]); }
    for (let x = xa + 0.6; x < xb - 0.6; x += 0.7) k.box(x, y3 + 1.0, Dz - 0.4, x + 0.4, y3 + 2.0, Dz - 0.1, mat(r.pick(['#e8dcc0', '#c84a4a', '#4a6a8a', '#d8c070'])));
    L((xa + xb) / 2, y3 + 4.4, 5, { r: 6, i: 0.6, color: '#ffd48a', bulbR: 0.05, halo: 0.25 });
  }
  // Fourth floor: the regisseurs' office and the music library.
  const y4 = F[4];
  props.shelves(k, 142, y4, Dz - 0.5, { w: 4, h: 3.2, n: 6, items: 'books' });
  props.shelves(k, 146.6, y4, Dz - 0.5, { w: 4, h: 3.2, n: 6, items: 'books' });
  props.table(k, 144, y4, 6, { w: 3.2, d: 1.2, items: 'books', top: '#7a5a3a' });
  props.desk(k, 151.6, y4, 3.6, { w: 1.8 });
  props.clock(k, 150, y4 + 3.4, Dz - 0.05);
  BACK.office = [151.6, y4, 4.6];
  L(146, y4 + 4.4, 5, { r: 7, i: 0.6, color: '#ffd48a', bulbR: 0.05, halo: 0.25 });
  // Roof attic: archives.
  for (let x = a0 + 2; x < a1 - 2; x += 2.6) props.crate(k, x, 30.6, 6 + (x % 3), { w: 1.2, h: 0.8, d: 1.0, color: '#9a7a52' });
  void r;
}

function courtyard(k, L) {
  // Paved, walled courtyard with its gate; the artists' entrance (N p.78, 184; fr.wikipedia).
  candelabrum(k, 162, Y.court, 7, 3.6, mat({ c: '#3e4a3a', c2: '#56624e', pat: 'speckle' }), 3, { r: 8, i: 0.8 });
  k.box(155.5, Y.court, 0.5, 157, Y.court + 0.4, 2.8, MT.stoneD); // the step of the stage door
  // Cigarette ends tossed by the musicians before going in (N p.188).
  for (let i = 0; i < 9; i++) k.box(157.5 + (i * 0.37) % 1.6, Y.court + 0.005, 1.2 + (i * 0.53) % 1.4, 157.56 + (i * 0.37) % 1.6, Y.court + 0.02, 1.22 + (i * 0.53) % 1.4, mat('#f2ece0'));
  BACK.butts = [158.3, Y.court, 1.8];
  // A water trough and a mounting block for the grooms' horses.
  k.box(164, Y.court, 11.6, 167, Y.court + 0.8, 12.8, MT.stoneD);
  k.box(164.1, Y.court + 0.7, 11.7, 166.9, Y.court + 0.75, 12.7, MT.water);
  void L;
}
