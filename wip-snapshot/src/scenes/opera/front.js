/* The Opera: the public front of the house.
 * The Place and its gas candelabra, portico, grand vestibule with the four seated composers,
 * the contrôle, the loggia, the Grand Foyer, the avant-foyer, the grand staircase with the
 * Pythia beneath it, the cellars with their furnaces, and the attic stores.
 */
import { mat, props } from '../../engine/index.js';
import { Y, D, MT, WIN } from './common.js';
import { flight } from './stagehouse.js';
import { shellRoof } from './shell.js';

const PI = Math.PI;
const Z0 = -0.45;
export const FRONT = {};

// A candelabrum: base, shaft and a cluster of gas globes (bronze, green-bronze or gilt).
export function candelabrum(k, x, y, z, h, m, n = 5, o = {}) {
  k.lathe([[0.32, y], [0.3, y + 0.25], [0.12, y + 0.4], [0.1, y + h * 0.8], [0.16, y + h * 0.85], [0.08, y + h]], x, z, m, { seg: 8 });
  const glob = mat({ c: '#f6ecd0', c2: '#fff4d0', glow: 'night', noEdge: true });
  for (let i = 0; i < n; i++) {
    const a = (i / n) * PI * 2, rr = n > 1 ? 0.42 : 0;
    k.beam([x, y + h * 0.9, z], [x + Math.cos(a) * rr, y + h * 0.95, z + Math.sin(a) * rr], 0.04, m);
    k.sphere(x + Math.cos(a) * rr, y + h + 0.05, z + Math.sin(a) * rr, 0.13, glob, { seg: 8, rings: 5 });
  }
  if (n > 1) k.sphere(x, y + h + 0.3, z, 0.15, glob, { seg: 8, rings: 5 });
  return k.lamp(x, y + h + 0.15, z, { r: o.r || 6, i: o.i || 0.8, color: o.color || '#ffd48a', bulb: false, halo: o.halo || 0.8, flicker: true });
}

// A gas chandelier: gilt tiers of arms with glowing globes.
export function chandelier(k, x, yCeil, z, drop, R, o = {}) {
  const y = yCeil - drop, G = MT.gilt;
  k.cyl(x, y, z, 0.03, drop, MT.giltD, { seg: 4 });
  k.lathe([[0.05, y - R * 0.9], [R * 0.25, y - R * 0.7], [R * 0.32, y - R * 0.45], [R * 0.12, y - R * 0.2], [0.06, y]], x, z, G, { seg: 10 });
  const glob = mat({ c: '#f6ecd0', c2: '#fff4d0', glow: 'night', noEdge: true });
  for (const [ry, rr, n] of [[0.7, 1.0, 10], [0.4, 0.7, 7]]) {
    const yy = y - R * ry;
    k.lathe([[R * rr - 0.04, yy - 0.04], [R * rr + 0.04, yy - 0.04], [R * rr + 0.04, yy + 0.04], [R * rr - 0.04, yy + 0.04]], x, z, G, { seg: 16, capTop: false, capBot: false });
    for (let i = 0; i < n; i++) { const a = (i / n) * PI * 2; k.sphere(x + Math.cos(a) * R * rr, yy + 0.12, z + Math.sin(a) * R * rr, Math.max(0.06, R * 0.07), glob, { seg: 6, rings: 4 }); }
  }
  return k.lamp(x, y - R * 0.6, z, { r: o.r || 9, i: o.i || 0.9, color: '#ffd890', bulb: false, halo: o.halo || R * 1.1, flicker: true });
}

// A seated marble figure on a plinth (the four composers of the vestibule, N p.69).
function seated(k, x, y, z, m, face = -1) {
  k.box(x - 0.9, y, z - 0.9, x + 0.9, y + 1.6, z + 0.9, MT.marbleG);
  const b = y + 1.6;
  k.box(x - 0.45, b, z - 0.5, x + 0.55, b + 0.9, z + 0.5, m); // chair
  k.box(x + face * 0.1 - 0.35, b + 0.9, z - 0.42, x + face * 0.1 + 0.35, b + 1.3, z + 0.42, m); // lap
  k.boxR(x + face * 0.6, b + 0.45, z, 0.5, 0.9, 0.7, m, { z: 0.1 }); // legs and drapery
  k.lathe([[0.36, b + 1.2], [0.3, b + 2.0], [0.2, b + 2.2]], x - face * 0.05, z, m, { seg: 8 });
  k.sphere(x - face * 0.02, b + 2.42, z, 0.22, m, { seg: 8, rings: 6 });
  k.beam([x, b + 1.95, z - 0.3], [x + face * 0.45, b + 1.4, z - 0.35], 0.12, m);
  k.box(x - 0.52, b + 0.9, z - 0.52, x + 0.4, b + 2.1, z - 0.42, m); // the chair back seen in profile
}

export function front(k) {
  const L = (x, y, z, o) => k.lamp(x, y, z, o);
  const r = k.rng('front');
  // ---------------------------------------------------------------- the Place
  // Gas candelabra and lamp columns of the "belt of light" (gas until 1954, fr.wikipedia).
  FRONT.place = [];
  for (const [x, z] of [[-11, 1.2], [-22, 1.2], [-33, 1.2], [-44, 1.2], [-11, 14], [-22, 22], [-33, 22], [-50, 14], [-8.5, 20]]) {
    FRONT.place.push(candelabrum(k, x, 0, z, 4.6, mat({ c: '#3e4a3a', c2: '#56624e', pat: 'speckle', cut: '#2a3226' }), 3, { r: 9, i: 0.75 }));
  }
  // A rostral column with its crown of lanterns.
  for (const [x, z] of [[-3.5, 24], [-3.5, 31]]) {
    k.box(x - 0.7, 0, z - 0.7, x + 0.7, 1.4, z + 0.7, MT.stoneD);
    k.cyl(x, 1.4, z, 0.35, 6.5, MT.bronzeG, { seg: 10 });
    FRONT.place.push(candelabrum(k, x, 7.9, z, 1.2, MT.bronzeG, 5, { r: 9, i: 0.8, halo: 1.0 }));
  }
  // A Morris column with its posters (a period street fixture) and a kiosk for programmes.
  k.cyl(-16, 0, 30, 0.75, 3.4, mat({ c: '#4a6a4a', c2: '#e8d8b0', pat: 'stripes', s: 0.6 }), { seg: 12 });
  k.lathe([[0.95, 3.4], [0.7, 4.1], [0.1, 4.5]], -16, 30, MT.bronzeG, { seg: 12 });
  // Programme seller's stand at the foot of the perron.
  props.table(k, -9.5, 0, 6.6, { w: 1.4, d: 0.6, h: 0.9, items: 'books', top: '#6a4a2a' });
  // ---------------------------------------------------------------- portico and vestibule
  for (const x of [5.2]) for (const z of [3.4, 10.6, 17.8]) {
    // Gas lanterns hanging from the vaults.
    k.cyl(x, 8.8, z, 0.02, 1.8, MT.ironD, { seg: 4 });
    k.box(x - 0.25, 8.0, z - 0.25, x + 0.25, 8.8, z + 0.25, mat({ c: '#f2e6c0', c2: '#ffe8a8', pat: 'panes', s: 0.25, glow: 'night' }));
    L(x, 8.3, z, { r: 6, i: 0.7, color: '#ffd48a', bulb: false, halo: 0.5, flicker: true });
  }
  // Double doors forming draught lobbies between portico and vestibule (N p.69).
  for (const z of [4.0, 11.2, 18.4]) {
    k.box(8.42, Y.vest, z - 1.1, 8.5, Y.vest + 4.2, z + 1.1, MT.mahogany);
    k.box(8.4, Y.vest + 4.2, z - 1.3, 8.5, Y.vest + 4.5, z + 1.3, MT.gilt);
  }
  // The grand vestibule: Lully, Rameau, Gluck and Handel in marble (N p.69).
  seated(k, 13.2, Y.vest, 5.6, MT.marbleW, -1);
  seated(k, 13.2, Y.vest, 14.8, MT.marbleW, -1);
  // Four lantern groups on dark marble sheaths (fr.wikipedia): our half shows two.
  for (const z of [9.8, 19.8]) { k.box(12.5, Y.vest, z - 0.4, 13.3, Y.vest + 2.4, z + 0.4, MT.marbleRed); candelabrum(k, 12.9, Y.vest + 2.4, z, 2.2, MT.gilt, 5, { r: 6.5, i: 0.8 }); }
  // The box office windows designed by Garnier (fr.wikipedia), open 11 to 6 (Baedeker 1878).
  k.box(15.6, Y.vest, 7.6, 16.95, Y.vest + 2.8, 12.0, MT.mahogany);
  k.box(15.55, Y.vest + 1.1, 8.2, 15.6, Y.vest + 2.2, 9.4, mat({ c: '#c8b878', c2: '#3a2a18', pat: 'grate', s: 0.12, glow: 'night' }));
  k.box(15.55, Y.vest + 1.1, 10.2, 15.6, Y.vest + 2.2, 11.4, mat({ c: '#c8b878', c2: '#3a2a18', pat: 'grate', s: 0.12, glow: 'night' }));
  k.box(15.4, Y.vest + 1.0, 8, 15.6, Y.vest + 1.08, 11.6, MT.marbleY);
  L(16.3, Y.vest + 2.2, 9.8, { r: 2.5, i: 0.5, color: '#ffc070', bulbR: 0.04, halo: 0.2 });
  FRONT.boxOffice = [15.1, Y.vest, 8.8];
  // Floor patterns of the vestibule and portico.
  k.box(1.8, Y.vest, Z0, 17, Y.vest + 0.01, D.front - 7.5, mat({ c: '#d8ccb0', c2: '#a89878', pat: 'checker', s: 1.2, cut: '#a89878' }));
  // ---------------------------------------------------------------- the contrôle
  // The checkers' counters, nicknamed "salt boxes" (fr.wikipedia).
  for (const z of [2.6, 8.2]) {
    k.box(20.2, Y.ctrl, z, 22.6, Y.ctrl + 1.1, z + 1.0, MT.marbleR);
    k.box(20.1, Y.ctrl + 1.1, z - 0.05, 22.7, Y.ctrl + 1.18, z + 1.05, MT.marbleG);
  }
  candelabrum(k, 21.4, Y.ctrl, 12.4, 3.0, MT.bronze, 5, { r: 6, i: 0.75 });
  FRONT.salt = [21.4, Y.ctrl, 2.1];
  // ---------------------------------------------------------------- loggia
  for (const z of [3.6, 10.8, 17.8]) {
    k.cyl(4.2, 22.92, z, 1.0, 0.06, MT.gilt, { seg: 14 }); // enamel mosaic medallions (N p.124)
    k.cyl(4.2, 22.9, z, 0.8, 0.03, mat({ c: '#2e5a8a', c2: '#d8b050', pat: 'rings', s: 0.15 }), { seg: 14 });
  }
  for (const z of [7.2, 14.4]) { k.box(8.2, Y.loggia, z - 0.35, 8.9, Y.loggia + 1.4, z + 0.35, MT.stoneD); candelabrum(k, 8.55, Y.loggia + 1.4, z, 1.6, MT.bronze, 3, { r: 5, i: 0.7 }); }
  k.box(1.8, Y.loggia, Z0, 9, Y.loggia + 0.01, D.front - 7.5, mat({ c: '#e0d4b8', c2: '#9a7a5a', pat: 'tiles', s: 0.6 }));
  // ---------------------------------------------------------------- the Grand Foyer
  // Windows on the loggia; mirrors almost 6 m high opposite (fr.wikipedia); old gold (N p.110).
  for (const z of [4.2, 10.4, 16.6, 22.8]) {
    k.box(9.95, 13.0, z - 1.4, 10.05, 19.6, z + 1.4, WIN);
    k.box(19.9, 13.0, z - 1.5, 19.98, 18.8, z + 1.5, MT.mirror);
    k.box(19.85, 18.8, z - 1.7, 19.98, 19.6, z + 1.7, MT.gilt);
  }
  // Pilasters with statues of the "Qualities" over them (twenty in all, fr.wikipedia).
  for (const z of [1.1, 7.3, 13.5, 19.7, 25.9]) {
    k.box(19.5, Y.foyer, z - 0.5, 20, 22.0, z + 0.5, MT.giltD);
    k.box(19.3, 22.0, z - 0.6, 20, 22.4, z + 0.6, MT.gilt);
    k.lathe([[0.22, 22.4], [0.16, 23.4], [0.1, 23.8]], 19.55, z, MT.gilt, { seg: 8 });
    k.sphere(19.55, 23.95, z, 0.13, MT.gilt, { seg: 6, rings: 4 });
  }
  // Garnier's assistants carved two gilded Apollo heads with his face (fr.wikipedia): here, one of them.
  k.sphere(19.75, 24.0, 4.2, 0.32, MT.gilt, { seg: 10, rings: 7 });
  FRONT.garnierHead = [19.75, 24.0, 4.2];
  // Painted compartments by Baudry along the crown of the vault.
  for (const z of [1, 9, 17]) k.box(13.6, 29.35, z, 16.4, 29.45, z + 6.5, mat({ c: '#7a90b0', c2: '#d8b878', pat: 'speckle', cut: '#8a7244' }));
  for (const z of [5.8, 13.6, 21.4]) k.box(11.0, 27.4, z - 1.2, 11.1, 28.6, z + 1.2, mat({ c: '#8aa0b8', c2: '#c8a060', pat: 'speckle' }));
  // Chandeliers and girandoles, all gas.
  FRONT.foyer = [];
  for (const z of [3.5, 10.5, 17.5, 24.5]) FRONT.foyer.push(chandelier(k, 15, 29.3, z, 4.2, 1.5, { r: 12, i: 1.0 }));
  for (const z of [7.3, 19.7]) candelabrum(k, 19.0, Y.foyer, z, 2.4, MT.gilt, 5, { r: 4, i: 0.5, halo: 0.6 });
  // Velvet banquettes along the walls; the parquet floor.
  for (const z of [3, 9.2, 15.4, 21.6]) { k.box(18.6, Y.foyer, z, 19.5, Y.foyer + 0.45, z + 2.4, MT.velvet); k.box(10.1, Y.foyer, z, 10.9, Y.foyer + 0.45, z + 2.4, MT.velvet); }
  // The monumental fireplace at the end of the foyer (N p.222), with a mirror above.
  const fz = D.foyerEnd;
  k.box(12.8, Y.foyer, fz - 0.9, 17.2, Y.foyer + 3.6, fz, MT.marbleRed);
  k.box(13.6, Y.foyer, fz - 0.95, 16.4, Y.foyer + 2.2, fz - 0.4, mat('#2a221e'));
  k.box(12.6, Y.foyer + 3.6, fz - 1.1, 17.4, Y.foyer + 4.0, fz, MT.gilt);
  k.box(13.4, Y.foyer + 4.2, fz - 0.1, 16.6, Y.foyer + 9.5, fz, MT.mirror);
  for (const sd of [-1, 1]) { k.lathe([[0.3, Y.foyer + 3.6], [0.22, Y.foyer + 6.6], [0.12, Y.foyer + 7.4]], 15 + sd * 2.2, fz - 0.7, MT.gilt, { seg: 8 }); }
  L(15, Y.foyer + 0.5, fz - 1.2, { always: true, r: 4, i: 0.55, color: '#ff9a4a', bulb: false, halo: 0.4, flicker: true });
  // ---------------------------------------------------------------- the avant-foyer
  k.box(21, Y.foyer, Z0, 29, Y.foyer + 0.01, 10, mat({ c: '#e8d8b0', c2: '#8a5a3a', pat: 'tiles', s: 0.4 }));
  for (const z of [3, 7]) chandelier(k, 25, 21.0, z, 1.6, 0.8, { r: 6, i: 0.6 });
  // The curtained-off glacier: provisional recesses closed by hangings (N p.128).
  k.box(22, Y.foyer, 9.75, 27.2, 18.6, 9.95, mat({ c: '#8a2a2a', c2: '#6a1a1a', pat: 'bars', s: 0.35 }));
  k.box(25.5, Y.foyer, 9.7, 26.4, 18.0, 9.76, MT.plasterBare);
  FRONT.glacier = [24.5, 15, 9.7];
  // ---------------------------------------------------------------- the grand staircase
  staircase(k, L);
  // ---------------------------------------------------------------- cellars with the furnaces
  cellars(k, L, r);
  // ---------------------------------------------------------------- attic stores
  attics(k, L, r);
}

function staircase(k, L) {
  const W = MT.marbleW;
  // The mass under the grand flight and the landing, pierced by the arch over the Pythia.
  const arch = [];
  for (let i = 0; i <= 16; i++) { const t = (i / 16) * PI; arch.push([44.5 + Math.cos(t) * 5.4, Y.rot + Math.sin(t) * 5.0]); }
  k.extrude([[31, Y.ctrl], [43.6, 7.2], [50, 7.2]].concat(arch).concat([[34, Y.rot], [31, 0.9]]), Z0, 4.8, MT.stoneP, { side: MT.stoneP });
  // Steps of white Seravezza marble (N p.81).
  const n = 23, dx = (43.6 - 31) / n, dy = (7.6 - Y.ctrl) / n;
  for (let i = 0; i < n; i++) k.box(31 + i * dx, Y.ctrl + i * dy - 0.1, Z0, 31 + (i + 1) * dx, Y.ctrl + (i + 1) * dy, 4.8, W);
  // Balustrade: onyx rail on red antique balusters with green bases (N p.81).
  k.box(31, Y.ctrl, 4.8, 43.6, Y.ctrl + 0.25, 5.2, MT.marbleG, {});
  k.extrude([[31, Y.ctrl + 0.25], [43.6, 7.85], [43.6, 8.75], [31, Y.ctrl + 1.15]], 4.85, 5.15, mat({ c: '#8e2e2a', c2: '#b85a48', pat: 'bars', s: 0.22, cut: '#5e1e1a' }));
  k.extrude([[31, Y.ctrl + 1.15], [43.6, 8.75], [43.6, 8.95], [31, Y.ctrl + 1.35]], 4.8, 5.2, MT.onyx);
  // Torch-bearing groups by Carrier-Belleuse at the foot (N p.77, 85).
  k.box(30.3, Y.ctrl, 4.4, 31.3, Y.ctrl + 1.6, 5.6, MT.marbleG);
  k.lathe([[0.36, Y.ctrl + 1.6], [0.28, Y.ctrl + 3.0], [0.18, Y.ctrl + 3.4]], 30.8, 5.0, MT.bronze, { seg: 8 });
  k.sphere(30.8, Y.ctrl + 3.6, 5.0, 0.18, MT.bronze, { seg: 6, rings: 4 });
  FRONT.torch = candelabrum(k, 30.8, Y.ctrl + 3.4, 5.0, 1.3, MT.bronze, 5, { r: 7, i: 0.9, halo: 0.9 });
  // The landing at the amphitheatre door, on its arches; the door with bronze caryatids (N p.86).
  k.box(43.6, 7.2, 4.8, 50, 8.0, 12.5, MT.stoneP, { top: W });
  k.box(43.6, 7.6, Z0, 50, 8.0, 4.8, W);
  for (const z of [6.4, 9.6, 12.2]) k.cyl(46.8, Y.rot, z, 0.38, 6.9, MT.stoneD, { seg: 10 });
  k.box(49.4, 8.0, 2.5, 50, 12.6, 3.1, MT.marbleY);
  k.lathe([[0.3, 8.6], [0.24, 10.8], [0.16, 11.4]], 49.5, 3.6, MT.bronze, { seg: 8 });
  k.sphere(49.5, 11.6, 3.6, 0.17, MT.bronze, { seg: 6, rings: 4 });
  k.box(49.2, 8.0, 3.2, 49.8, 8.6, 4.0, MT.marbleG);
  k.box(49.4, 12.4, Z0, 50.1, 13.0, 3.1, MT.marbleG);
  // The two curving flights back up to the premieres loges level (N p.86): our half shows the far one.
  flight(k, 44, 8.0, 32, Y.loggia, 7.2, 11.4, W, false);
  k.extrude([[44, 8.0], [32, Y.loggia], [32, Y.loggia - 1.0], [44, 7.2]], 7.2, 11.4, MT.stoneP);
  k.extrude([[44, 8.0], [32, Y.loggia], [32, Y.loggia + 0.95], [44, 8.95]], 7.0, 7.2, mat({ c: '#8e2e2a', c2: '#b85a48', pat: 'bars', s: 0.22, cut: '#5e1e1a' }));
  k.extrude([[44, 8.95], [32, Y.loggia + 0.95], [32, Y.loggia + 1.1], [44, 9.1]], 6.95, 7.25, MT.onyx);
  // The twenty steps from the Rotonde level up to the contrôle (N p.77): our half shows the far ramp.
  flight(k, 44, Y.rot, 34, Y.ctrl, 6.6, 10.4, W, false);
  k.extrude([[44, Y.rot], [34, Y.ctrl], [34, Y.rot]], 6.6, 10.4, MT.stoneP);
  // Gallery at the premieres level round the far side and the left.
  k.box(29, Y.loggia - 0.45, 11.4, 50, Y.loggia, D.stair, MT.stoneP, { top: MT.mosaic });
  k.box(29, Y.loggia - 0.45, Z0, 32, Y.loggia, 11.4, MT.stoneP, { top: MT.mosaic });
  k.box(32, Y.loggia, Z0, 32.25, Y.loggia + 1.0, 7.0, mat({ c: '#8e2e2a', c2: '#b85a48', pat: 'bars', s: 0.22, cut: '#5e1e1a' }), { top: MT.onyx });
  // Thirty monolith columns of Sarrancolin (N p.88 to 89): our far side shows ten.
  for (const x of [30.6, 34.6, 38.6, 42.6, 46.6]) for (const dx of [-0.45, 0.45]) {
    k.box(x + dx - 0.35, Y.loggia, 11.2, x + dx + 0.35, Y.loggia + 0.6, 11.9, MT.marbleW);
    k.cyl(x + dx, Y.loggia + 0.6, 11.55, 0.27, 5.2, MT.marbleR, { seg: 10 });
    k.box(x + dx - 0.36, Y.loggia + 5.8, 11.19, x + dx + 0.36, Y.loggia + 6.4, 11.91, MT.gilt);
  }
  // Balconies at every level (bronze fronts at the 2nd and 3rd, Campan marble with fire-pots at the 5th, N p.90).
  FRONT.potsAFeu = [];
  for (const [y, front] of [[18.5, MT.gilt], [22.0, MT.gilt], [25.0, MT.marbleG]]) {
    k.box(29, y - 0.45, 11.0, 50, y, D.stair, MT.stoneP, { top: MT.mosaic, front: MT.stoneD });
    k.box(29, y, 11.0, 50, y + 1.0, 11.25, mat({ c: front === MT.gilt ? '#c69a48' : '#4c7a5c', c2: '#7a5a28', pat: 'bars', s: 0.3, cut: '#6a4a20' }), { top: MT.onyx });
    if (front === MT.marbleG) for (let x = 30; x < 50; x += 3.2) {
      k.lathe([[0.18, y + 1.0], [0.25, y + 1.3], [0.12, y + 1.5]], x, 11.1, MT.bronze, { seg: 8 });
      FRONT.potsAFeu.push(L(x, y + 1.65, 11.1, { r: 3.5, i: 0.6, color: '#ffb060', bulbR: 0.09, halo: 0.45, flicker: true }));
    }
  }
  // Side balconies at the two ends of the cage, cut through by our section.
  for (const y of [15.0, 18.5, 22.0, 25.0]) for (const [x0, x1, fx] of [[29, 31.4, 31.4], [47.6, 50, 47.6]]) {
    k.box(x0, y - 0.45, Z0, x1, y, 11.0, MT.stoneP, { top: MT.mosaic });
    k.box(fx - 0.12, y, Z0, fx + 0.12, y + 1.0, 11.0, mat({ c: '#c69a48', c2: '#7a5a28', pat: 'bars', s: 0.3, cut: '#6a4a20' }), { top: MT.onyx });
  }
  // Pils's four painted compartments on the coving of the ceiling (N p.90).
  k.box(29.2, 27.0, 15.9, 50, 29.8, 16.0, mat({ c: '#c4a46a', c2: '#6a80a8', pat: 'panels', s: 3.4, cut: '#8a7244' }));
  // Candelabra on the balustrades and the landings.
  FRONT.stair = [];
  for (const [x, y, z] of [[33, Y.loggia + 1.0, 7.0], [44, 8.0, 12.2], [32, 15.0, 10.8], [48, 15.0, 10.8]]) FRONT.stair.push(candelabrum(k, x, y, z, 1.8, MT.gilt, 5, { r: 7, i: 0.85, halo: 0.8 }));
  FRONT.stair.push(chandelier(k, 39.5, Y.stairTop, 6, 5.5, 1.6, { r: 12, i: 0.9 }));
  for (const x of [34, 44]) for (const y of [21, 24.2]) L(x, y, 14.8, { r: 5, i: 0.5, color: '#ffd48a', bulbR: 0.07, halo: 0.35 });
  // The Pythia: bronze oracle over a basin with flowers, under the landing (N p.77; fr.wikipedia).
  k.lathe([[2.4, Y.rot], [2.45, Y.rot + 0.6], [2.2, Y.rot + 0.7], [2.2, Y.rot + 0.35]], 44.5, 0, MT.marbleG, { seg: 16, a0: -0.05, a1: PI + 0.05, walls: false, capBot: false, capTop: false });
  k.lathe([[2.2, Y.rot + 0.35], [0, Y.rot + 0.35]], 44.5, 0, MT.water, { seg: 16, a0: -0.05, a1: PI + 0.05, walls: false, capBot: false, capTop: false });
  k.boulder(44.5, Y.rot + 0.6, 0.4, 0.9, 1.0, 0.8, MT.bronze, 4);
  k.cyl(44.5, Y.rot + 1.4, 0.4, 0.06, 0.6, MT.bronze, { seg: 5 });
  k.lathe([[0.4, Y.rot + 1.9], [0.32, Y.rot + 2.8], [0.2, Y.rot + 3.0]], 44.5, 0.4, MT.bronze, { seg: 8 });
  k.sphere(44.6, Y.rot + 3.2, 0.4, 0.17, MT.bronze, { seg: 6, rings: 4 });
  k.beam([44.5, Y.rot + 2.8, 0.2], [44.0, Y.rot + 3.6, 0.0], 0.08, MT.bronze);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * PI; k.sphere(44.5 + Math.cos(a) * 1.9, Y.rot + 0.55, Math.sin(a) * 1.9, 0.22, mat(i % 3 ? '#4a7a3a' : '#e8a0a8'), { seg: 6, rings: 4 }); }
  for (const x of [40.6, 48.4]) { k.lathe([[0.3, Y.rot], [0.24, Y.rot + 3.6], [0.16, Y.rot + 4.0]], x, 3.6, MT.marbleY, { seg: 8 }); k.sphere(x, Y.rot + 4.2, 3.6, 0.16, MT.marbleY, { seg: 6, rings: 4 }); }
  FRONT.pythia = [44.5, Y.rot + 3.2, 0.4];
  L(44.5, 4.6, 2.5, { r: 6, i: 0.7, color: '#ffd48a', bulbR: 0.08, halo: 0.4 });
}

function cellars(k, L, r) {
  // Vaulted brick cellars under the front of the house, one level (Beauvert section).
  k.box(0, Y.cellar - 0.4, Z0, 79, Y.cellar, 16.5, MT.concrete, { top: mat({ c: '#8a7e6a', c2: '#6e6454', pat: 'stone', s: 0.8 }) });
  k.box(0, Y.cellar, 16.5, 79, -0.5, 17.4, MT.brickD);
  k.box(-1.2, Y.cellar - 0.4, Z0, 0, 0.9, 17.4, MT.brickD);
  k.box(0, -0.5, Z0, 29, 0.9, 17.4, MT.brickD);
  for (let x = 0; x < 78; x += 6.5) {
    // A transverse vault over each bay, on piers cut by our section and repeated in depth.
    const arch = Array.from({ length: 11 }, (_, i) => { const t = i / 10; return [x + 0.6 + 5.3 * t, -3.0 + Math.sin(PI * t) * 2.1]; });
    k.extrude([[x, -3.0]].concat(arch).concat([[x + 6.5, -3.0], [x + 6.5, -0.5], [x, -0.5]]), Z0, 16.5, MT.brickD);
    for (const [z0, z1] of [[Z0, 0.9], [8.6, 9.6], [15.6, 16.5]]) k.box(x - 0.3, Y.cellar, z0, x + 0.6, -3.0, z1, MT.brickD);
  }
  // Calorifere furnaces (fourteen in the building, up to 10 t of coal a day, N p.222).
  FRONT.furnaces = [];
  for (const x of [14.5, 27.5, 40.5, 53.5, 66.5]) {
    k.box(x - 1.6, Y.cellar, 5.5, x + 1.6, Y.cellar + 2.8, 8.5, MT.brick);
    k.box(x - 1.7, Y.cellar + 2.8, 5.4, x + 1.7, Y.cellar + 3.1, 8.6, MT.ironD);
    k.box(x - 0.45, Y.cellar + 0.5, 5.42, x + 0.45, Y.cellar + 1.2, 5.5, mat({ c: '#ff8a3a', c2: '#ffb860', glow: 'always', noEdge: true }));
    k.box(x - 0.6, Y.cellar + 1.4, 5.4, x + 0.6, Y.cellar + 2.2, 5.5, MT.ironD);
    k.cyl(x, Y.cellar + 3.1, 7, 0.45, -Y.cellar - 3.6, MT.ironGrey, { seg: 10 }); // hot-air duct up
    FRONT.furnaces.push(L(x, Y.cellar + 0.9, 4.6, { always: true, r: 5, i: 0.7, color: '#ff8a40', bulb: false, halo: 0.5, flicker: true }));
    // Coal heaps beside each furnace.
    k.boulder(x + 2.8, Y.cellar, 7.5, 1.3, 0.8, 1.2, MT.coal, Math.round(x));
  }
  // Coal store and the gas and water mains running the length of the cellars (N p.217).
  for (let i = 0; i < 6; i++) k.boulder(4 + r() * 3, Y.cellar, 10 + r() * 4, 1.4, 0.9 + r() * 0.6, 1.3, MT.coal, 40 + i);
  k.cyl(0, -1.5, 15.6, 0.32, 79, MT.ironGrey, { axis: 'x', seg: 10 });
  k.cyl(0, -1.1, 14.8, 0.22, 79, mat({ c: '#4a5a6a', c2: '#3a4a5a', pat: 'rivets', s: 0.4 }), { axis: 'x', seg: 8 });
  // Night-light jets (veilleuses) along the cellar.
  for (let x = 8; x < 78; x += 13) L(x, -2.6, 3, { r: 5, i: 0.45, color: '#ffbe70', bulbR: 0.04, halo: 0.25, flicker: true });
  // Stair down from the galleries to the cellars, and a shovel leaning on a heap.
  flight(k, 61, Y.rot, 55, Y.cellar, 13.6, 15.2, MT.stoneD);
  k.box(55, Y.cellar, 13.6, 61, Y.rot - 0.8, 15.2, MT.brickD, { top: false, front: false });
  FRONT.stoke = [27.5, Y.cellar, 4.5];
}

function attics(k, L, r) {
  // Long store galleries above the salle, the staircase and the foyer (N p.194).
  const stuff = ['#b08a52', '#8a6a3a', '#c8b48a', '#6a5a4a'];
  for (let x = 3; x < 28; x += 2.2) {
    if (r() < 0.25) continue;
    const z = 2 + r() * 8;
    if (r() < 0.5) props.crate(k, x, 31.0, z, { w: 1.0 + r() * 0.5, h: 0.6 + r() * 0.5, d: 0.9, color: stuff[Math.floor(r() * 4)] });
    else k.cyl(x - 0.6, 31.25, z, 0.25, 1.6, mat({ c: '#d0c4a0', c2: '#b0a480', pat: 'canvas', s: 0.4 }), { axis: 'x', seg: 7 });
  }
  for (let x = 36; x < 44; x += 2.6) props.crate(k, x, Y.stairTop + 0.6, 10 + r() * 3, { w: 1.2, h: 0.8, d: 1.0 });
  // Daylight from skylights in the roof.
  for (const x of [13, 23]) k.box(x, 34.5, 4, x + 1.6, 34.6, 6, MT.glassSky);
  L(14, 33.2, 6, { r: 5, i: 0.35, color: '#ffc070', bulbR: 0.04, halo: 0.2 });
  void shellRoof;
}
