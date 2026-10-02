/* Big Pit: underground. The shaft and its lining, the pit bottom with its brick arch and
 * electric bulbs, the pump and haulage engine rooms, the underground stables, the main
 * haulage road with its ventilation doors and refuge holes, the parting, the horse road, the
 * cross-measures drift and the coal face in the Old Coal seam; the return airway through the
 * fault to the Coity shafts, and the old workings above and beyond.
 */
import { mat, props } from '../../engine/index.js';
import { MAT, PB, SX, SHAFT, CAGE, ellipseShell, shade } from './common.js';
import { voidById } from './geology.js';
import { track, dramBody } from './surface.js';

const P = (c, extra) => mat(Object.assign({ c }, extra || {}));
const WET = P('#b8ae98', { c2: '#6a7a5a', pat: 'brick', cut: '#8a4a34', cutPat: true });
const WHITE = P('#e2dccb', { c2: '#cdc5ae', pat: 'brick', cut: '#8a4a34', cutPat: true });
const PROP = MAT.prop, COLLAR = P('#b8945a', { c2: '#9a7a48', pat: 'grain', cut: '#d8bc84' });
const LAG = P('#7a6a50', { c2: '#6a5a42', pat: 'planks', s: 0.16, cut: '#a88a5a' });
const ROTTEN = P('#6a6456', { c2: '#58524a', pat: 'grain', cut: '#7a7466' });

// An underground lamp: a flame safety lamp hung on a prop or nail, glowing day and night.
export function flameLamp(k, x, y, z, r0 = 3.2, i0 = 0.7) {
  const r = r0 * 1.45, i = Math.min(1.3, i0 * 1.45);
  k.cyl(x, y - 0.12, z, 0.035, 0.05, MAT.brass, { seg: 6 });
  k.cyl(x, y - 0.07, z, 0.028, 0.06, MAT.lampBrass, { seg: 6 });
  k.cyl(x, y - 0.01, z, 0.03, 0.05, P('#8a8c90'), { seg: 6 });
  return k.lamp(x, y - 0.04, z - 0.02, { always: true, r, i, color: '#ffb860', bulb: false, halo: 0.35, flicker: true });
}
// An electric bulb on a cable (pit bottom, engine rooms).
function bulb(k, x, y, z, r = 6, i = 1.05) {
  k.cyl(x, y - 0.25, z, 0.008, 0.25, MAT.black, { seg: 4 });
  return k.lamp(x, y - 0.3, z, { always: true, r, i, color: '#ffe0a0', bulbR: 0.05, halo: 0.45 });
}

// Three-piece timber sets along a roadway: a leg at the back and a collar across the roof,
// with lagging boards over the collars. The near leg is cut away with the rock.
function sets(k, x0, x1, y0, h, back, step = 1.5, m = PROP, legs = true) {
  for (let x = x0 + step / 2; x < x1; x += step) {
    if (legs) k.beam([x, y0, back - 0.15], [x, y0 + h - 0.12, back - 0.1], 0.2, m);
    k.box(x - 0.11, y0 + h - 0.24, -0.6, x + 0.11, y0 + h, back + 0.05, COLLAR);
  }
  k.box(x0, y0 + h, -0.6, x1, y0 + h + 0.05, back, LAG);
}

// A refuge hole: whitewashed recess in the back wall.
function manhole(k, id) {
  const v = voidById(id);
  k.box(v.x0 + 0.02, v.f0, v.d - 0.05, v.x1 - 0.02, v.r0 - 0.02, v.d - 0.01, MAT.whitewash);
  k.box(v.x0 + 0.02, v.f0, 3.0, v.x0 + 0.06, v.r0 - 0.02, v.d - 0.02, MAT.whitewash);
  k.box(v.x1 - 0.06, v.f0, 3.0, v.x1 - 0.02, v.r0 - 0.02, v.d - 0.02, MAT.whitewash);
}

function shaft(k) {
  // Elliptical brick lining, 18 ft by 13 ft, open at the pit bottom landing and the old inset.
  const rx = (SHAFT.x1 - SHAFT.x0) / 2, rz = SHAFT.rz;
  ellipseShell(k, SX, rx, rz, 0.42, -85.0, -61.0, -0.12, Math.PI + 0.12, WET, 22);
  ellipseShell(k, SX, rx, rz, 0.42, -58.0, -0.02, -0.12, Math.PI + 0.12, WET, 22);
  ellipseShell(k, SX, rx, rz, 0.42, -61.0, -58.0, -0.12, Math.PI * 0.62, WET, 14);
  ellipseShell(k, SX, rx, rz, 0.42, SHAFT.sump, PB - 0.3, -0.12, Math.PI + 0.12, WET, 22);
  // walling cribs (stone rings) every 12 m
  for (let y = -80; y < -2; y += 12) ellipseShell(k, SX, rx - 0.08, rz - 0.08, 0.2, y, y + 0.35, 0.05, Math.PI - 0.05, MAT.dressed, 16);
  // buntons: timbers across the shaft at the back, carrying the guides
  for (let y = -86; y < -1; y += 6) k.box(SHAFT.x0 + 0.2, y, 1.25, SHAFT.x1 - 0.2, y + 0.22, 1.47, P('#6a5a46', { pat: 'grain' }));
  // pump rising main and the electric cables down the far side
  k.cyl(SHAFT.x1 - 0.55, PB + 0.3, 1.75, 0.13, 89.3 + 0.4, P('#5a6a5a', { pat: 'rings', s: 2.0, c2: '#4a5a4a' }), { seg: 10 });
  k.cyl(SHAFT.x0 + 0.45, PB + 0.5, 1.8, 0.04, 89.3, MAT.ironDark, { seg: 5 });
  k.cyl(SHAFT.x0 + 0.6, PB + 0.5, 1.82, 0.04, 89.3, MAT.ironDark, { seg: 5 });
  // signal wire
  k.cyl(SX, PB + 1.5, 1.9, 0.012, 94, MAT.ironDark, { seg: 4 });
  // the sump: black water below the landing
  k.box(SHAFT.x0 - 0.3, SHAFT.sump, -0.5, SHAFT.x1 + 0.3, SHAFT.sump + 0.2, 2.4, MAT.water);
  k.sheet(SHAFT.x0 + 0.05, SHAFT.x1 - 0.05, SHAFT.sump, PB - 2.2, 0.02, { c: '#10242c', alpha: 0.5 });
  k.box(SHAFT.x0 - 0.2, PB - 2.25, 0.0, SHAFT.x1 + 0.2, PB - 2.2, 2.4, P('#2a4a54', { c2: '#6a8a94', pat: 'speckle' }));
  // landing: iron plates over the sump, keps (folding supports) at the cage mouths
  k.box(SHAFT.x0 - 0.45, PB - 0.3, 0.0, SHAFT.x1 + 0.45, PB, 0.25, MAT.plate);
  for (const cx of [CAGE.ax, CAGE.bx]) for (const dx of [-0.85, 0.85]) k.box(cx + dx - 0.08, PB - 0.3, 0.3, cx + dx + 0.08, PB, 2.2, MAT.ironDark);
  // the old inset at -61, boarded up
  for (let y = -60.9; y < -58.1; y += 0.32) k.box(SHAFT.x0 - 0.75, y, 0.0, SHAFT.x0 - 0.62, y + 0.28, 2.3, ROTTEN);
  k.box(SHAFT.x0 - 0.8, -61, 2.25, SHAFT.x0 - 0.55, -58, 2.4, ROTTEN);
}

function pitBottom(k) {
  // Brick arch over the landing, whitewashed; electric bulbs on a cable near the shaft.
  const v = voidById('bottom');
  const arch = (x0, x1) => {
    const pts = [];
    const zs = v.d - 0.4, spring = PB + 2.2, crown = PB + 3.62;
    pts.push([zs, PB]);
    pts.push([zs, spring]);
    for (let i = 1; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push([zs * Math.cos(a) - 0.0, spring + (crown - spring) * Math.sin(a)]); }
    pts.push([-0.5, crown]);
    pts.push([-0.5, PB + 3.99]);
    pts.push([v.d - 0.01, PB + 3.99]);
    pts.push([v.d - 0.01, PB]);
    k.extrudeX(pts, x0, x1, WHITE);
  };
  arch(122.02, SHAFT.x0 - 0.47);
  arch(SHAFT.x1 + 0.47, 179.98);
  // floor of plates near the shaft, wet stone beyond
  k.box(122, PB - 0.05, -0.5, 180, PB + 0.02, v.d, P('#5a5a58', { pat: 'plates', s: 0.6, c2: '#4a4a48', cut: '#3a3a38' }));
  // full road and empty road: rails to the cage mouths from each side
  track(k, 122, SHAFT.x0 - 0.45, PB + 0.02, 1.0, 0.6, false);
  track(k, 122, SHAFT.x0 - 0.45, PB + 0.02, 2.6, 0.6, false);
  track(k, SHAFT.x1 + 0.45, 180, PB + 0.02, 1.0, 0.6, false);
  track(k, SHAFT.x1 + 0.45, 205, PB + 0.02, 2.6, 0.6, false);
  for (let x = 124; x < 180; x += 6) if (x < 144 || x > 156) bulb(k, x, PB + 3.5, 1.8);
  k.cyl(122, PB + 3.5, 1.8, 0.015, 58, MAT.ironDark, { axis: 'x', seg: 4 });
  // hitcher's post: bench, signal knocker wire and a chalk board
  props.bench(k, 143.4, PB, 3.3, { w: 1.5, d: 0.35, color: '#6a5a46' });
  k.box(145.6, PB, 3.4, 145.8, PB + 2.6, 3.6, MAT.timber);
  k.box(145.3, PB + 1.5, 3.36, 145.9, PB + 1.7, 3.42, MAT.ironDark);
  k.box(141.6, PB + 1.3, v.d - 0.45, 143.2, PB + 2.2, v.d - 0.4, P('#2e3a32'));
  for (let i = 0; i < 5; i++) k.box(141.75 + i * 0.25, PB + 1.5, v.d - 0.47, 141.79 + i * 0.25, PB + 1.9, v.d - 0.45, P('#e8e4dc'));
  // first aid: stretcher, splints and bandages in a box (Rule 34)
  k.box(124.2, PB, 3.2, 127.6, PB + 0.25, 3.9, MAT.timber);
  k.box(124.3, PB + 0.25, 3.25, 126.9, PB + 0.33, 3.85, MAT.canvas);
  for (const dz of [3.2, 3.85]) k.cyl(124.0, PB + 0.3, dz, 0.03, 3.3, MAT.timber, { axis: 'x', seg: 5 });
  k.box(126.6, PB + 1.1, v.d - 0.85, 127.6, PB + 1.8, v.d - 0.4, P('#e8e0cc'));
  k.box(127.0, PB + 1.35, v.d - 0.87, 127.2, PB + 1.55, v.d - 0.85, P('#a8322a'));
  // a dram waiting on each road
  dramBody(k, 133, PB + 0.02, 1.0, true); wheels(k, 133, PB + 0.02, 1.0);
  dramBody(k, 162, PB + 0.02, 2.6, false); wheels(k, 162, PB + 0.02, 2.6);
  // water channel along the back, running toward the sump
  k.box(122, PB - 0.08, 3.6, 180, PB + 0.01, 3.9, P('#2a3e46', { c2: '#7a9aa4', pat: 'speckle' }));
}

export function wheels(k, x, y, z) {
  for (const dx of [-0.55, 0.55]) for (const dz of [-0.3, 0.3]) k.cyl(x + dx, y + 0.17, z + dz - 0.04, 0.17, 0.08, MAT.ironDark, { axis: 'z', seg: 10 });
}

function pumpRoom(k) {
  const v = voidById('pump');
  k.box(180, PB - 0.05, -0.5, 192, PB + 0.02, v.d, P('#6a6a64', { pat: 'tiles', s: 0.6, c2: '#5a5a54', cut: '#4a4a44' }));
  k.box(180.05, PB, v.d - 0.3, 191.95, PB + 3.45, v.d - 0.02, WHITE);
  // electric motor and a three-throw ram pump on a bed, pipes to the shaft
  k.box(182, PB, 1.6, 190.4, PB + 0.6, 3.6, MAT.dressed);
  k.cyl(183.4, PB + 1.2, 1.9, 0.6, 1.4, P('#4a6a4a', { pat: 'rivets' }), { axis: 'z', seg: 16 });
  k.box(182.6, PB + 0.6, 2.0, 184.2, PB + 0.75, 3.1, P('#3a5a3a'));
  for (const x of [186.6, 187.6, 188.6]) k.cyl(x, PB + 0.6, 2.6, 0.24, 0.9, P('#4a6a5a'), { seg: 12 }); // pump barrels
  k.box(186.0, PB + 1.5, 2.2, 189.2, PB + 1.7, 3.0, P('#3e4e46'));
  k.tube([[188.6, PB + 1.7, 2.6], [188.6, PB + 3.0, 2.6], [182, PB + 3.0, 2.6], [SHAFT.x1 + 0.6, PB + 3.0, 1.75]], 0.13, P('#5a6a5a'));
  k.tube([[187.6, PB + 0.6, 3.1], [187.6, PB + 0.1, 3.5], [SHAFT.x1 + 0.4, PB + 0.1, 3.5], [SHAFT.x1 - 0.2, PB - 3, 2.0]], 0.11, P('#5a6a5a'));
  // switch panel
  k.box(190.6, PB + 0.8, v.d - 0.35, 191.8, PB + 2.2, v.d - 0.3, P('#3a3a3a', { pat: 'panels', s: 0.4 }));
  bulb(k, 184, PB + 3.4, 2.2); bulb(k, 189, PB + 3.4, 2.2);
}

function haulageRoom(k) {
  const v = voidById('haulage');
  k.box(192, PB - 0.05, -0.5, 205, PB + 0.02, v.d, P('#6a6a64', { pat: 'tiles', s: 0.6, c2: '#5a5a54', cut: '#4a4a44' }));
  k.box(192.05, PB, v.d - 0.3, 204.95, PB + 3.45, v.d - 0.02, WHITE);
  // motor, gearing, the great drive pulley (a part) and the tension carriage
  k.box(194, PB, 2.4, 203.8, PB + 0.55, 4.0, MAT.dressed);
  k.cyl(195.6, PB + 1.3, 2.6, 0.7, 1.3, P('#4a6a4a', { pat: 'rivets' }), { axis: 'z', seg: 16 });
  k.box(196.6, PB + 0.55, 2.7, 198.4, PB + 1.6, 3.7, P('#3e4e46'));
  // tension carriage on rails with its weight
  track(k, 201, 204.6, PB + 0.55, 3.2, 0.6, false);
  k.box(201.6, PB + 0.75, 2.85, 203.0, PB + 1.15, 3.55, MAT.ironDark);
  k.box(203.9, PB + 0.55, 3.0, 204.3, PB + 2.5, 3.4, MAT.timber);
  k.box(203.95, PB + 0.6, 3.05, 204.25, PB + 1.2, 3.35, MAT.ironDark);
  k.box(201.0, PB + 1.6, v.d - 0.35, 202.4, PB + 2.6, v.d - 0.3, P('#3a3a3a', { pat: 'panels', s: 0.4 }));
  bulb(k, 196, PB + 3.4, 2.0); bulb(k, 202, PB + 3.4, 2.0);
  props.bench(k, 199.2, PB, 0.5, { w: 1.2, color: '#6a5a46' });
}

// Underground stables: stalls 6 ft wide along the back, timber partitions, mangers, bedding.
export const STALLS = [];
function stables(k) {
  const v = voidById('stables');
  const x0 = 205, x1 = 238, back = v.d;
  k.box(x0, PB - 0.05, -0.5, x1, PB + 0.02, back, P('#7a6a52', { pat: 'planks', s: 0.25, c2: '#6a5a42', cut: '#9a7a50' }));
  k.box(x0 + 0.05, PB, back - 0.3, x1 - 0.05, PB + 2.95, back - 0.02, MAT.whitewash);
  // drain channel along the road side
  k.box(x0, PB - 0.06, 1.5, x1, PB + 0.03, 1.7, P('#3a3a32', { c2: '#6a6a5a', pat: 'speckle' }));
  // road along the front
  track(k, x0, x1, PB + 0.02, 0.8, 0.6, false);
  // stalls: 1.8 m wide, 3.4 m from the road to the head of the stall
  const sw = 1.8, n = 15, sx = x0 + 2.4;
  for (let i = 0; i <= n; i++) {
    const x = sx + i * sw;
    k.beam([x, PB, 2.0], [x, PB + 2.85, 2.0], 0.2, PROP);
    k.box(x - 0.04, PB + 0.15, 2.0, x + 0.04, PB + 1.35, back - 0.4, P('#8a6a46', { pat: 'planks', s: 0.22, c2: '#7a5a3a' }));
    k.beam([x, PB, back - 0.45], [x, PB + 2.85, back - 0.45], 0.2, PROP);
    k.box(x - 0.12, PB + 2.75, -0.5, x + 0.12, PB + 2.97, back, COLLAR);
  }
  for (let i = 0; i < n; i++) {
    const x = sx + i * sw + sw / 2;
    // manger and hay rack
    k.box(x - 0.75, PB + 0.75, back - 1.0, x + 0.75, PB + 1.05, back - 0.4, P('#7a5a3a', { pat: 'grain' }));
    k.box(x - 0.7, PB + 1.04, back - 0.95, x + 0.7, PB + 1.06, back - 0.45, P('#c8a24a'));
    k.box(x - 0.6, PB + 1.5, back - 0.55, x + 0.6, PB + 2.0, back - 0.4, P('#6a5a3a', { pat: 'bars', s: 0.08 }));
    // bracken bedding
    k.box(x - 0.85, PB + 0.02, 2.05, x + 0.85, PB + 0.1, back - 0.45, P('#8a5a2a', { c2: '#a87a3a', pat: 'thatch' }));
    // harness hung on the stall post
    k.lathe([[0.22, PB + 1.7], [0.27, PB + 1.85], [0.22, PB + 2.0]], x - sw / 2 + 0.2, 2.1, P('#3a2618'), { seg: 8, capTop: false, capBot: false });
    STALLS.push({ x, z: 3.6, y: PB });
    // beetles along the manger edge (the eggs come down with the corn)
    for (let b = 0; b < 3; b++) k.sphere(x - 0.5 + b * 0.37 + (i % 3) * 0.05, PB + 1.06, back - 0.98, 0.018, P('#1a1612'), { seg: 4, rings: 3 });
    if (i % 3 === 1) flameLamp(k, x - sw / 2 + 0.12, PB + 2.4, 1.85, 4, 0.8);
  }
  // feed bins and the ostler's corner
  for (const x of [206.0, 207.2]) k.box(x - 0.5, PB, 3.2, x + 0.5, PB + 0.9, 4.2, P('#7a5a3a', { pat: 'planks', s: 0.2 }));
  k.box(205.4, PB + 0.9, 3.15, 207.8, PB + 0.98, 4.25, P('#6a4a2a'));
  props.sack(k, 206.6, PB, 4.6, { color: '#c8b080' });
  props.sack(k, 207.4, PB, 4.9, { color: '#bca878' });
  k.box(236.0, PB, 3.0, 237.8, PB + 1.2, 6.2, P('#c8a85a', { pat: 'thatch', c2: '#a88a42' })); // stacked chaff
}

function mainRoad(k) {
  const v = voidById('road');
  k.box(60, PB - 0.05, -0.5, 122, PB + 0.02, v.d, P('#3e3a36', { c2: '#55504a', pat: 'speckle', cut: '#2e2a26' }));
  sets(k, 60, 122, PB, 2.5, v.d - 0.05, 1.5);
  track(k, 52, 122, PB + 0.02, 1.0, 0.6);
  track(k, 52, 122, PB + 0.02, 2.6, 0.6, false);
  // endless rope rollers between the rails
  for (let x = 62; x < 205; x += 5.5) for (const z of [1.0, 2.6]) if (x < 145 || x > 155) k.cyl(x, PB + 0.12, z - 0.12, 0.05, 0.24, P('#8a8a8a'), { axis: 'z', seg: 8 });
  // water channel
  k.box(52, PB - 0.08, 3.05, 122, PB + 0.01, 3.3, P('#2a3e46', { c2: '#7a9aa4', pat: 'speckle' }));
  ['mh1', 'mh2', 'mh3'].forEach((id) => manhole(k, id));
  // ventilation doors: two masonry frames with iron guards (the leaves are parts)
  for (const dx of [106, 112]) {
    k.box(dx - 0.35, PB, v.d - 0.6, dx + 0.35, PB + 2.5, v.d, MAT.brick);
    k.box(dx - 0.35, PB + 2.05, -0.5, dx + 0.35, PB + 2.5, v.d, MAT.brick);
    k.box(dx - 0.36, PB + 1.95, -0.5, dx + 0.36, PB + 2.06, v.d - 0.6, MAT.ironDark);
    // brattice cloth around the frame
    k.box(dx - 0.42, PB + 2.06, v.d - 0.65, dx + 0.42, PB + 2.48, v.d - 0.6, MAT.brattice);
  }
  // the door boys' seats: a block of wood by each door
  for (const x of [107.0, 111.2]) k.box(x - 0.2, PB, 3.12, x + 0.2, PB + 0.42, 3.38, MAT.timber);
  // door boy's bench and his initials in the frame
  props.bench(k, 109, PB, v.d - 0.55, { w: 1.1, d: 0.3, color: '#5a4a36' });
  k.box(106.38, PB + 1.2, 2.2, 106.4, PB + 1.32, 2.5, P('#d8c8a0'));
  flameLamp(k, 109.0, PB + 1.9, v.d - 0.3, 3.4, 0.7);
  // lamp station: an official's bench and a hook for relighting lamps
  k.box(114.6, PB, v.d - 0.7, 117.6, PB + 0.8, v.d - 0.05, MAT.timber);
  k.box(114.7, PB + 1.6, v.d - 0.25, 117.5, PB + 1.7, v.d - 0.05, MAT.timber);
  flameLamp(k, 115.4, PB + 1.6, v.d - 0.15, 3.6, 0.8);
  // timber store: props and collars stacked for sending in-bye
  for (let r = 0; r < 6; r++) for (let i = 0; i < 4; i++) k.cyl(118.2, PB + 0.12 + r * 0.22, 2.3 + i * 0.24 + (r % 2) * 0.1, 0.11, 3.4, PROP, { axis: 'x', seg: 7 });
  // lamps along the road where men work (the road is otherwise lit only by what men carry)
  flameLamp(k, 70.6, PB + 2.0, v.d - 0.25, 3.0, 0.6);
  flameLamp(k, 92.6, PB + 2.0, v.d - 0.25, 3.0, 0.6);
}

function parting(k) {
  const v = voidById('parting');
  k.box(52, PB - 0.05, -0.5, 60, PB + 0.02, v.d, P('#3e3a36', { c2: '#55504a', pat: 'speckle', cut: '#2e2a26' }));
  sets(k, 56.5, 60, PB, 3.0, v.d - 0.05, 1.2);
  // the ripping lip: roof taken down for height, a ragged edge and a heap of stone for packs
  for (let i = 0; i < 5; i++) k.boulder(52.6 + i * 0.85, PB + 0.05, 2.4 + (i % 2) * 0.4, 0.55, 0.35, 0.5, P('#6a6660', { pat: 'rock', c2: '#55524c' }), 500 + i);
  for (let i = 0; i < 4; i++) k.beam([52.4 + i * 1.2, PB, v.d - 0.2], [52.4 + i * 1.2, PB + 4.0, v.d - 0.2], 0.22, PROP);
  k.box(52.1, PB + 3.85, -0.5, 56.5, PB + 4.05, v.d, COLLAR);
  // a switch where the horse road meets the double road
  for (const dz of [-0.3, 0.3]) k.beam([52, PB + 0.13, 1.0 + dz], [56.5, PB + 0.13, 2.6 + dz], 0.06, MAT.rail);
  flameLamp(k, 57.0, PB + 2.6, v.d - 0.2, 4.0, 0.85);
  flameLamp(k, 53.3, PB + 3.3, v.d - 0.3, 3.4, 0.7);
  // a bundle of blunt picks waiting to go up the shaft
  for (let i = 0; i < 6; i++) k.beam([58.6 + i * 0.05, PB, 2.9], [58.3 + i * 0.07, PB + 0.85, 3.1], 0.04, MAT.timber);
  k.box(58.2, PB + 0.75, 2.85, 59.2, PB + 0.85, 3.15, MAT.iron);
}

function horseRoad(k) {
  const v = voidById('horse');
  k.box(20, PB - 0.05, -0.5, 52, PB + 0.02, v.d, P('#3e3a36', { c2: '#55504a', pat: 'speckle', cut: '#2e2a26' }));
  sets(k, 20, 52, PB, 2.1, v.d - 0.05, 1.6);
  track(k, 14, 52, PB + 0.02, 1.3, 0.6);
  manhole(k, 'mh4');
  flameLamp(k, 36, PB + 1.6, v.d - 0.25, 3.0, 0.7);
  // a fossil in the roof shale: the scarred bark of a giant club-moss, with a lamp propped to see it
  k.box(23.0, PB + 1.55, v.d - 0.07, 24.4, PB + 2.0, v.d - 0.03, P('#8a8e92', { pat: 'carpet', s: 0.09, c2: '#c8ccce' }));
  flameLamp(k, 24.6, PB + 1.5, v.d - 0.15, 2.0, 0.5);
  // a sprag or two lying by the rails, a dropped crust, a rat's run along the wall
  for (let i = 0; i < 3; i++) k.beam([28 + i * 7, PB + 0.04, 2.3], [28.6 + i * 7, PB + 0.04, 2.35], 0.05, MAT.timber);
}

function drift(k) {
  // The cross-measures drift, rising from the horse road through the rock toward an upper seam.
  const v = voidById('drift');
  const slope = (v.f1 - v.f0) / (v.x1 - v.x0);
  const f = (x) => v.f(x);
  // a sloping floor of broken stone and a few sets of timber up the drift
  for (let x = v.x0 + 2; x < v.x1 - 0.3; x += 1.8) {
    k.beam([x, f(x), v.d - 0.2], [x, f(x) + 2.15, v.d - 0.2], 0.2, PROP);
    k.box(x - 0.1, f(x) + 2.08, -0.5, x + 0.1, f(x) + 2.28, v.d, COLLAR);
  }
  k.boxR((v.x0 + v.x1) / 2 + 1, (f(v.x0) + f(v.x1)) / 2 + 0.55, 1.4, Math.hypot(v.x1 - v.x0, v.f1 - v.f0) - 2, 0.12, 2.6, P('#5a5650', { pat: 'rock', c2: '#4a4640' }), { z: Math.atan(slope) });
  // the face of the drift: shot holes and a heap of fallen stone
  for (let i = 0; i < 3; i++) k.cyl(v.x1 - 0.02, f(v.x1) + 0.7 + i * 0.5, 0.9 + i * 0.5, 0.03, 0.05, P('#1a1a1a'), { axis: 'x', seg: 6 });
  k.boulder(v.x1 - 1.2, f(v.x1 - 1.2), 1.6, 0.9, 0.4, 0.8, P('#6a6660', { pat: 'rock', c2: '#55524c' }), 600);
  flameLamp(k, v.x1 - 2.0, f(v.x1 - 2.0) + 1.9, v.d - 0.2, 3.0, 0.7);
}

// The coal face in the Old Coal: a low working along the seam, propped every few feet.
export const FACE = { x0: 7.5, x1: 19.6, roof: PB + 1.25, back: 2.4 };
function face(k) {
  const v = voidById('face');
  // floor of seatearth with small coal, the coal face as the back wall
  k.box(0, PB - 0.05, -0.5, 20, PB + 0.02, v.d, P('#3a3632', { c2: '#55504a', pat: 'speckle', cut: '#2e2a26' }));
  for (let i = 0; i < 9; i++) k.boulder(8 + i * 1.35, PB + 0.02, 1.2 + (i % 3) * 0.35, 0.4, 0.14, 0.35, MAT.coalHeap, 700 + i);
  // props in rows (no more than six feet apart), with lids under the roof
  const r = k.rng('face');
  for (let x = 1.0; x < 20; x += 1.4) for (const z of [0.55, 1.65]) {
    const lean = (r() - 0.5) * 0.06;
    k.beam([x + lean, PB + 0.02, z], [x, PB + 1.22, z], 0.15, PROP);
    k.box(x - 0.2, PB + 1.17, z - 0.08, x + 0.2, PB + 1.25, z + 0.08, COLLAR);
  }
  // sprags under the undercut coal
  for (let x = 8.6; x < 19.5; x += 2.2) k.beam([x, PB + 0.05, 2.0], [x, PB + 0.6, 2.38], 0.07, PROP);
  // the undercut (holing) along the bottom of the face: a dark slot
  k.box(7.6, PB + 0.02, v.d - 0.05, 19.8, PB + 0.22, v.d - 0.01, P('#141212'));
  // the gob: worked-out ground with stone packs and a sagging roof
  for (let i = 0; i < 4; i++) k.box(0.4 + i * 1.7, PB, 0.4, 1.6 + i * 1.7, PB + 1.05 - i * 0.05, 2.3, P('#6a6660', { pat: 'stone', s: 0.22, c2: '#55524c', cut: '#7a766e' }));
  k.boxR(3.6, PB + 1.12, 1.2, 7.4, 0.18, 2.6, P('#4e4c4a', { pat: 'rock', c2: '#5e5c5a' }), { z: 0.03 });
  // tools: shovels, a sledge, wedges, a saw and an axe; food tins and water cans
  for (let i = 0; i < 4; i++) {
    const x = 9.5 + i * 2.8;
    k.box(x, PB + 0.02, 0.25, x + 0.16, PB + 0.1, 0.4, P('#9a9ca0'));
    k.cyl(x + 0.4, PB + 0.02, 0.35, 0.06, 0.16, P('#9a9ca0'), { seg: 8 });
  }
  // lamps hung on the props by each collier
  for (const x of [9.4, 12.2, 15.0, 17.8]) flameLamp(k, x, PB + 1.0, 1.65, 3.0, 0.75);
  flameLamp(k, 3.0, PB + 0.95, 0.6, 2.4, 0.4);
}

function airways(k) {
  // Return airway: low, rough and partly crushed, with broken props. Few people come here.
  const rough = (id, step) => {
    const v = voidById(id);
    for (let x = v.x0 + 1; x < v.x1 - 0.5; x += step) {
      const y0 = v.f(x), y1 = v.r(x);
      const r = k.rng(id + x);
      const broken = r() < 0.18;
      if (broken) k.beam([x, y0, v.d - 0.25], [x + 0.4, y0 + (y1 - y0) * 0.55, v.d - 0.35], 0.16, ROTTEN);
      else k.beam([x, y0, v.d - 0.2], [x, y1 - 0.1, v.d - 0.2], 0.16, ROTTEN);
      k.box(x - 0.09, y1 - 0.16, -0.5, x + 0.09, y1 + 0.02, v.d, ROTTEN);
    }
    // a floor of fallen shale
    k.box(v.x0, Math.min(v.f0, v.f1) - 0.04, -0.5, v.x1, Math.min(v.f0, v.f1) + 0.01, v.d, P('#4a4844', { pat: 'rock', c2: '#3a3834' }));
  };
  rough('returnL', 2.4);
  rough('returnR', 2.4);
  rough('returnF', 2.4);
  // the incline through the fault: steps cut in the floor and a hand rope
  const v = voidById('incline');
  for (let x = v.x0 + 0.5; x < v.x1; x += 0.9) k.box(x - 0.45, v.f(x) - 0.3, -0.5, x + 0.45, v.f(x) + 0.02, v.d, P('#4a4844', { pat: 'rock', c2: '#3a3834' }));
  for (let x = v.x0 + 1.5; x < v.x1; x += 3.2) k.beam([x, v.f(x), v.d - 0.2], [x, v.r(x) - 0.1, v.d - 0.2], 0.16, ROTTEN);
  k.tube([[v.x0, v.f0 + 1.0, v.d - 0.3], [v.x1, v.f1 + 1.0, v.d - 0.3]], 0.025, P('#8a7a5a'));
  // Coity shaft bottoms: wet brick, the air rising
  const c = voidById('coityB');
  k.box(c.x0, c.f0 - 0.05, -0.5, c.x1, c.f0 + 0.02, c.d, P('#3a3632', { c2: '#55504a', pat: 'speckle' }));
  k.box(c.x0 + 0.05, c.f0, c.d - 0.3, c.x1 - 0.05, c.r0 - 0.05, c.d - 0.02, WET);
  for (const id of ['coity1', 'coity2']) {
    const s = voidById(id);
    k.box(s.x0 + 0.02, -119, s.d - 0.3, s.x1 - 0.02, -2, s.d - 0.02, WET);
    for (let y = -116; y < -4; y += 9) k.box(s.x0, y, 0.0, s.x1, y + 0.25, s.d - 0.3, P('#6a5a46', { pat: 'grain' }));
  }
  k.sheet(c.x0, c.x1, c.f0, c.f0 + 0.35, 0.02, { c: '#10242c', alpha: 0.45 });
  k.box(c.x0, c.f0 + 0.3, 0.0, c.x1, c.f0 + 0.35, c.d, P('#2a4a54', { c2: '#6a8a94', pat: 'speckle' }));
  // the fan drift under the fan house
  const fd = voidById('fandrift');
  k.box(fd.x0, fd.f0, -0.5, fd.x1, fd.f0 + 0.05, fd.d, MAT.brick);
  k.box(fd.x0 + 0.1, fd.f0, fd.d - 0.3, fd.x1 - 0.1, fd.r0 - 0.05, fd.d - 0.02, MAT.brick);
  // Old Coity workings: abandoned and partly flooded, rotting props, fallen roof
  const o = voidById('oldCoity');
  for (let x = o.x0 + 2; x < o.x1 - 1; x += 3.1) {
    const r = k.rng('oc' + x);
    if (r() < 0.35) k.boulder(x, o.f0, 1.4, 1.0 + r(), 0.6 + r() * 0.8, 1.0, P('#5a5650', { pat: 'rock', c2: '#4a4640' }), 800 + x);
    else k.beam([x, o.f0, 2.2], [x + (r() - 0.5) * 0.6, o.r0 - 0.1, 2.2], 0.16, ROTTEN);
  }
  k.box(o.x0, o.f0 - 0.05, -0.5, o.x1, o.f0 + 0.6, o.d, P('#1e2a30', { c2: '#3a5a64', pat: 'speckle' }));
  k.sheet(o.x0, o.x1, o.f0, o.f0 + 0.6, 0.02, { c: '#10242c', alpha: 0.45 });
  // Old upper workings, abandoned before the 1878 deepening: collapsed props, a rotted dram
  const u = voidById('oldUpper');
  for (let x = u.x0 + 1.5; x < u.x1 - 1; x += 2.6) {
    const r = k.rng('ou' + x);
    if (r() < 0.3) k.boulder(x, u.f0, 1.2, 0.9 + r() * 0.8, 0.5 + r() * 0.6, 0.9, P('#5a5650', { pat: 'rock', c2: '#4a4640' }), 900 + x);
    else if (r() < 0.5) k.beam([x, u.f0 + 0.05, 1.4], [x + 1.2, u.f0 + 0.3, 1.7], 0.14, ROTTEN);
    else k.beam([x, u.f0, 1.9], [x, u.r0 - 0.08, 1.9], 0.14, ROTTEN);
  }
  dramBody(k, 120, u.f0 - 0.15, 1.2);
}

export function buildUnder(k) {
  shaft(k);
  pitBottom(k);
  pumpRoom(k);
  haulageRoom(k);
  stables(k);
  mainRoad(k);
  parting(k);
  horseRoad(k);
  drift(k);
  face(k);
  airways(k);
  void shade;
}
