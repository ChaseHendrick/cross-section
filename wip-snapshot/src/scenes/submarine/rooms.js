/* Submarine scene: the furnished compartments, end to end, with their lights.
 * Each builder records anchors (bunks, seats, work spots) in A for the cast.
 */
import { mat, props, shade } from '../../engine/index.js';
import { X, DECK, LOW, CT, M, RED, WHITE, roomZ, ceilY, phY, phR, phIn } from './geom.js';
import { partition } from './hull.js';

export const A = { bunks: {}, seats: {}, spots: {} };
const push = (o, key, v) => { (o[key] || (o[key] = [])).push(v); return v; };

// z of the front face of something of depth d standing against the hull between heights y0 and y1.
export function backZ(x0, x1, y0, y1, d) {
  let z = 9;
  for (const x of [x0, (x0 + x1) / 2, x1]) for (const y of [y0, y1]) z = Math.min(z, roomZ(x, y));
  return z - d - 0.03;
}
// A small overhead light fitting with its lamp.
export function light(k, x, z, color, opt = {}) {
  const y = (opt.y != null ? opt.y : ceilY(x, z)) - 0.06;
  k.cyl(x, y - 0.02, z, 0.11, 0.08, mat({ c: '#c8c8c0', cut: '#8a8a84' }), { seg: 10 });
  return k.lamp(x, y - 0.06, z, { color, r: (opt.r || 2.6) * 1.1, i: (opt.i != null ? opt.i : 0.95) * (color === RED ? 1.7 : 1.45), halo: opt.halo != null ? opt.halo : 0.42, bulbR: 0.045, always: !!opt.always });
}
// Overhead pipe and cable runs along a stretch of hull: the overhead clutter of every compartment.
function overheadRuns(k, x0, x1, opt = {}) {
  const runs = opt.runs || [[0.35, M.pipe, 0.045], [0.55, M.cable, 0.03], [0.75, M.pipeRed, 0.035], [1.05, M.pipeDk, 0.05], [1.35, M.pipeGreen, 0.035], [1.6, M.cable, 0.04]];
  for (const [z, m, r] of runs) {
    const pts = [];
    for (let x = x0; x <= x1 + 1e-6; x += Math.max(0.5, (x1 - x0) / 6)) pts.push([Math.min(x, x1), ceilY(Math.min(x, x1), z) - r - 0.05, z]);
    if (pts.length < 2) continue;
    k.tube(pts, r, m, { seg: 5 });
  }
  // Hangers.
  for (let x = x0 + 0.4; x < x1; x += 1.2) k.box(x - 0.015, ceilY(x, 0.9) - 0.22, 0.3, x + 0.015, ceilY(x, 0.9) - 0.04, 1.4, M.pipeDk);
}
// A vertical gauge dial facing the viewer at depth z.
export function dial(k, x, y, z, r = 0.07) {
  k.cyl(x, y, z - 0.03, r + 0.012, 0.03, M.gauge, { axis: 'z', seg: 12 });
  k.cyl(x, y, z - 0.035, r, 0.01, M.dial, { axis: 'z', seg: 12 });
  k.box(x - 0.004, y - 0.004, z - 0.04, x + r * 0.8, y + 0.004, z - 0.036, M.gauge);
}
// A handwheel valve.
function valve(k, x, y, z, r = 0.09, m = M.brass) {
  k.cyl(x, y, z - 0.02, r, 0.02, m, { axis: 'z', seg: 10 });
  k.cyl(x, y, z, 0.02, 0.12, M.steel, { axis: 'z', seg: 6 });
}
// A row of bunks along x on pipe frames, at height y (mattress top returned as anchor).
function bunk(k, x0, x1, y, z0, z1, list, opt = {}) {
  const frame = opt.frame || M.steel;
  k.box(x0, y - 0.06, z0, x1, y - 0.02, z1, M.canvas);
  k.tube([[x0, y - 0.02, z0], [x1, y - 0.02, z0]], 0.022, frame, { seg: 5 });
  k.box(x0 + 0.04, y - 0.02, z0 + 0.03, x1 - 0.04, y + 0.07, z1 - 0.03, opt.mat || M.mattress);
  const bl = opt.blanket || mat({ c: k.rng('bl' + x0 + y)() < 0.5 ? '#5e6650' : '#6a6e72', c2: '#4e5446', pat: 'stripes', s: 0.3 });
  k.box(x0 + 0.5, y + 0.07, z0 + 0.04, x1 - 0.06, y + 0.11, z1 - 0.05, bl);
  k.box(x0 + 0.06, y + 0.07, z0 + 0.1, x0 + 0.42, y + 0.15, z1 - 0.12, M.white);
  if (list) list.push({ feet: [x1 - 0.2, y + 0.08, (z0 + z1) / 2], heading: 0, x0, x1, y, z: (z0 + z1) / 2 });
}
function sack(k, x, y, z, c = '#b8a678', r = 0.22) { k.sphere(x, y + r * 0.8, z + r, r, mat({ c, c2: shade(c, -0.15), pat: 'canvas', s: 0.08 }), { seg: 8, rings: 5 }); }
function can(k, x, y, z, c) { k.cyl(x, y, z, 0.05, 0.11, mat({ c, cut: shade(c, -0.3) }), { seg: 7 }); }
function shelfCans(k, x0, x1, y, z, d, rows = 3, gap = 0.3) {
  const r = k.rng('cans' + x0 + y);
  for (let j = 0; j < rows; j++) {
    const yy = y + j * gap;
    k.box(x0, yy - 0.03, z, x1, yy, z + d, M.steel);
    for (let x = x0 + 0.07; x < x1 - 0.05; x += 0.12) can(k, x, yy, z + d * 0.5, r.pick(['#b84a32', '#c8a050', '#5a7a5a', '#d8d0b8', '#6a7a9a', '#a07040']));
  }
}

// A torpedo along x (nose towards -x unless flip), centre (y, z).
export function torpedo(k, x0, y, z, flip = false, len = 6.25) {
  const r = 0.265;
  const x1 = x0 + len;
  k.cyl(x0 + 0.5, y, z, r, len - 1.0, M.torpedo, { axis: 'x', seg: 14 });
  const nose = flip ? x1 : x0;
  const tail = flip ? x0 : x1;
  const s = flip ? -1 : 1;
  // Warhead (the blunt nose) and the tail cone with screws and fins.
  k.cyl(flip ? x1 - 0.5 : x0, y, z, flip ? r : r * 0.55, 0.5, M.torpHead, { axis: 'x', seg: 14, r2: flip ? r * 0.55 : r });
  k.cyl(flip ? x0 : x1 - 0.5, y, z, flip ? r * 0.3 : r, 0.5, M.torpedo, { axis: 'x', seg: 12, r2: flip ? r : r * 0.3 });
  k.box(tail - s * 0.15 - 0.06, y - r * 0.9, z - 0.01, tail - s * 0.15 + 0.06, y + r * 0.9, z + 0.01, M.machDk);
  k.box(tail - s * 0.15 - 0.06, y - 0.01, z - r * 0.9, tail - s * 0.15 + 0.06, y + 0.01, z + r * 0.9, M.machDk);
  k.cyl(tail - (flip ? 0.08 : 0), y, z, 0.13, 0.05, M.bronze, { axis: 'x', seg: 8 });
  void nose;
}

// ================================================================== forward torpedo room
function forwardTorpedoRoom(k) {
  const y = DECK.ftr;
  A.bunks.ftr = [];
  // Tube breeches on the forward bulkhead: the starboard tubes (1, 3 above the deck, 5 below).
  for (const [ty, n] of [[4.53, 1], [3.66, 3], [2.78, 5]]) {
    const z = 0.56;
    k.cyl(X.ftrF, ty, z, 0.34, 0.75, M.steel, { axis: 'x', seg: 18 });
    k.cyl(X.ftrF + 0.75, ty, z, 0.4, 0.09, M.breech, { axis: 'x', seg: 18 });   // the polished breech door
    k.cyl(X.ftrF + 0.84, ty, z, 0.16, 0.06, M.brass, { axis: 'x', seg: 10 });
    k.box(X.ftrF + 0.78, ty - 0.03, z + 0.3, X.ftrF + 0.98, ty + 0.03, z + 0.55, M.brass); // operating lever
    k.box(X.ftrF + 0.05, ty + 0.36, z - 0.06, X.ftrF + 0.3, ty + 0.46, z + 0.06, M.white); // number plate
    void n;
    // Tubes forward through the bulkhead to the muzzle (seen in the bow through the cut).
    const muzzle = ty > 4.2 ? 3.7 : ty > 3.2 ? 4.7 : 6.0;
    k.cyl(muzzle, ty, z, 0.3, X.ftrF - muzzle, M.machDk, { axis: 'x', seg: 14 });
    k.cyl(muzzle - 0.02, ty, z, 0.33, 0.12, M.bronze, { axis: 'x', seg: 14 });
  }
  // Gyro angle setters and the depth and spindle gear beside the tubes.
  k.box(X.ftrF + 0.1, y, 1.35, X.ftrF + 0.6, y + 1.3, 1.75, M.cabinet);
  dial(k, X.ftrF + 0.35, y + 1.05, 1.35, 0.08);
  // Reload torpedoes on racks along the starboard side, two per upper tube (S3).
  const tx = 13.15;
  for (const [ty, tz] of [[y + 0.42, 1.2], [y + 0.42, 1.74], [y + 1.06, 1.12]]) {
    torpedo(k, tx, ty, tz);
    for (const x of [tx + 0.9, tx + 3.1, tx + 5.3]) k.box(x - 0.05, ty - 0.3, tz - 0.3, x + 0.05, ty - 0.2, tz + 0.3, M.machDk);
  }
  for (const x of [tx + 0.9, tx + 3.1, tx + 5.3]) { k.box(x - 0.04, y, 0.9, x + 0.04, y + 0.75, 0.96, M.steel); k.box(x - 0.04, y + 0.6, 0.82, x + 0.04, y + 0.66, 2.0, M.steel); }
  // Bunks above the reloads, and a stack of three aft where there are no torpedoes (S3).
  bunk(k, 13.35, 15.25, y + 1.6, 0.55, 1.25, A.bunks.ftr);
  bunk(k, 15.45, 17.35, y + 1.6, 0.55, 1.25, A.bunks.ftr);
  bunk(k, 17.55, 19.45, y + 1.6, 0.55, 1.25, A.bunks.ftr);
  for (const [i, by] of [[0, y + 0.42], [1, y + 1.05], [2, y + 1.68]]) bunk(k, 20.05, 21.95, by, 0.85 + (i === 2 ? -0.15 : 0), 1.6 + (i === 2 ? -0.2 : 0), A.bunks.ftr);
  for (const x of [20.0, 22.0]) k.box(x - 0.025, y, 0.82, x + 0.025, y + 2.05, 0.87, M.steel);
  // Chain-fall rail overhead, with a chain hanging (S20).
  k.box(12.2, 5.15, 0.52, 22.6, 5.24, 0.6, M.machDk);
  k.rope([16.0, 5.15, 0.56], [16.0, 4.4, 0.56], 0.012, M.steel, 0, 4);
  k.box(15.93, 4.25, 0.5, 16.07, 4.42, 0.62, M.machDk);
  // Escape trunk in the overhead, centre of the room (S3).
  const ec = 17.25, eTop = 7.65, eBot = ceilY(ec, 0) - 0.15;
  k.lathe([[0.62, eBot], [0.7, eBot], [0.7, eTop], [0.62, eTop], [0.62, eBot]], ec, 0, mat({ c: '#c8c8be', c2: '#b8b8ae', pat: 'rivets', s: 0.3, cut: '#a8402e' }), { seg: 18, capTop: false, capBot: false });
  k.box(ec - 0.4, eBot - 0.06, -0.3, ec + 0.4, eBot, 0.5, M.machDk);
  // Momsen lungs stowed nearby (S49): a locker with canisters.
  k.box(18.4, y + 0.0, 1.95, 19.6, y + 0.85, backZ(18.4, 19.6, y, y + 0.85, 0) + 0.01, M.locker);
  // Toilet and shower at the after end (S3).
  partition(k, 22.15, y, ceilY(22.15, 0.3) - 0.05, { z0: 1.0 });
  k.box(22.3, y, 1.25, 22.75, y + 0.42, 1.65, M.white);
  k.cyl(22.85, y + 1.9, 1.35, 0.06, 0.05, M.steel, { seg: 8 });
  // Sound gear: training handwheel and receiver at the forward end; underwater log.
  k.box(12.4, y, 0.55 + 1.0, 13.0, y + 1.05, 1.95, M.cabinet);
  k.cyl(12.7, y + 1.1, 1.5, 0.16, 0.03, M.brass, { axis: 'z', seg: 12 });
  // Projector stand and a sheet for the movie (the sheet is shown by setup at film time).
  k.box(13.55, y, 0.25, 13.95, y + 0.75, 0.6, M.wood);
  A.spots.projector = [13.75, y + 0.75, 0.42];
  // Lights: red at night (S41).
  for (const x of [13.2, 16.0, 19.0, 21.6]) light(k, x, 0.45, RED, { r: 2.5 });
  overheadRuns(k, X.ftrF + 0.2, X.fb - 0.2);

  // Lower flat: lower tubes, the reload for tube 5, trim manifold, potatoes (S3, S35, S41).
  const yl = LOW.ftr;
  torpedo(k, 13.3, yl + 0.4, 0.95);
  for (const x of [14.3, 16.5, 18.7]) k.box(x - 0.05, yl, 0.7, x + 0.05, yl + 0.18, 1.2, M.machDk);
  k.box(20.8, yl, backZ(20.8, 22.6, yl, yl + 1.4, 0.35), 22.6, yl + 1.3, backZ(20.8, 22.6, yl, yl + 1.4, 0), M.cabinet);
  for (let i = 0; i < 6; i++) valve(k, 21.0 + i * 0.28, yl + 0.95, backZ(20.8, 22.6, yl, yl + 1.4, 0.35) - 0.02, 0.07, i % 2 ? M.brass : M.pipeRed);
  for (let i = 0; i < 7; i++) sack(k, 19.7 + (i % 4) * 0.42, yl + (i > 3 ? 0.36 : 0), 0.15 + (i % 2) * 0.12, '#b8a070', 0.2);
  light(k, 17.0, 0.6, RED, { y: y - 0.12, r: 2.0, i: 0.6 });
  light(k, 21.5, 0.6, RED, { y: y - 0.12, r: 1.6, i: 0.5 });
  // Hatch and ladder to the lower flat.
  props.ladder(k, 21.8, yl, y, 0.45, { w: 0.4, color: '#8a908c' });
}

// ================================================================== forward battery compartment
function officersCountry(k) {
  const y = DECK.fb;
  A.bunks.officers = []; A.seats.wardroom = [];
  const top = (x) => ceilY(x, 0.3) - 0.05;
  partition(k, X.pantry, y, top(X.pantry), { z0: 0.75 });
  partition(k, 27.05, y, top(27.05), { z0: 0.7 });
  partition(k, 28.45, y, top(28.45), { z0: 0.7 });
  partition(k, 29.9, y, top(29.9), { z0: 0.7 });
  partition(k, 31.35, y, top(31.35), { z0: 0.7 });
  // Curtains in place of doors (illustrative).
  for (const x of [27.05, 28.45, 29.9, 31.35]) k.box(x + 0.04, y + 0.25, 0.05, x + 0.06, top(x) - 0.3, 0.68, M.curtain);
  // Pantry: coffee and toast only (S4); china behind the serving hatch (S5).
  const pz = backZ(X.fb, X.pantry, y, y + 1.9, 0.5);
  k.box(X.fb + 0.12, y, pz, X.pantry - 0.05, y + 0.9, pz + 0.5, M.stainless);
  k.cyl(23.45, y + 0.9, pz + 0.25, 0.12, 0.36, M.stainless, { seg: 12 });
  k.box(23.75, y + 0.9, pz + 0.12, 24.05, y + 1.08, pz + 0.38, M.steel); // toaster
  shelfCans(k, X.fb + 0.15, X.pantry - 0.1, y + 1.3, pz + 0.12, 0.3, 2, 0.32);
  light(k, 23.7, 0.4, RED, { r: 1.8, i: 0.7 });
  // Wardroom: one table and four chairs (S37), bench against the hull with a fold-down bunk (S5).
  const wx = 25.65;
  props.table(k, wx, y, 0.72, { w: 1.5, d: 0.75, h: 0.74, cloth: '#e6e0cc', items: 'setting' });
  for (const [cx, f] of [[wx - 1.0, 1], [wx + 1.0, -1]]) { const c = props.chair(k, cx, y, 0.88, { face: f, color: '#6a5a4a' }); A.seats.wardroom.push({ at: [c.x, y, c.z], seat: c.seat - y, face: f }); }
  const bz = Math.max(1.5, backZ(24.35, 27.0, y, y + 1.0, 0.45));
  props.bench(k, wx, y, bz, { w: 2.5, d: 0.45, color: '#6a5a4a' });
  k.box(24.4, y + 0.45, bz + 0.03, 27.0, y + 0.53, bz + 0.45, mat({ c: '#4a5a6a', c2: '#3e4e5e', pat: 'quilt', s: 0.2 }));
  A.seats.wardroom.push({ at: [wx - 0.35, y, bz + 0.2], seat: 0.53, face: 'out' }, { at: [wx + 0.4, y, bz + 0.2], seat: 0.53, face: 'out' });
  // Chronometer box, books (the library), record player and charts (S4, S5).
  const sz = backZ(24.4, 27.0, y + 1.3, y + 1.9, 0.28);
  k.box(24.4, y + 1.3, sz, 27.0, y + 1.33, sz + 0.28, M.wood);
  k.box(24.5, y + 1.33, sz + 0.03, 25.7, y + 1.58, sz + 0.25, mat({ c: '#7a3a2a', c2: '#c8b48a', pat: 'books', s: 0.06 }));
  k.box(25.9, y + 1.33, sz + 0.03, 26.3, y + 1.5, sz + 0.25, mat({ c: '#6a4a2a', cut: '#3a2a1a' })); // chronometer box
  k.box(26.4, y + 1.33, sz + 0.03, 26.9, y + 1.45, sz + 0.25, M.wood); // record player
  A.spots.record = [26.65, y + 1.46, sz + 0.14];
  k.box(wx - 0.5, y + 0.745, 0.8, wx + 0.05, y + 0.75, 1.2, M.white); // chart on the table
  light(k, wx, 0.45, RED, { r: 2.4 });
  k.lamp(wx - 0.25, y + 1.35, 1.0, { color: '#ffd8a0', r: 1.1, i: 0.55, halo: 0.18, bulbR: 0.03 }); // small white chart lamp
  // Stateroom: two bunks, wash basin, lockers.
  const sx0 = 27.12, sx1 = 28.38;
  bunk(k, sx0, sx1, y + 0.45, backZ(sx0, sx1, y + 0.4, y + 0.6, 0.72), backZ(sx0, sx1, y + 0.4, y + 0.6, 0), A.bunks.officers);
  bunk(k, sx0, sx1, y + 1.3, backZ(sx0, sx1, y + 1.2, y + 1.5, 0.66), backZ(sx0, sx1, y + 1.2, y + 1.5, 0), A.bunks.officers);
  k.box(sx0, y, backZ(sx0, sx1, y, y + 0.4, 0.72), sx1, y + 0.38, backZ(sx0, sx1, y, y + 0.4, 0), M.locker);
  light(k, 27.75, 0.4, RED, { r: 1.6, i: 0.7 });
  // Captain's stateroom: bunk, desk, depth gauge and course repeater at the foot of the bunk (S6).
  const cx0 = 28.52, cx1 = 29.84;
  const cz0 = backZ(cx0, cx1, y + 0.6, y + 0.8, 0.75);
  bunk(k, cx0, cx1 - 0.1, y + 0.7, cz0, cz0 + 0.72, A.bunks.officers, { blanket: mat({ c: '#4a5a6a', c2: '#3a4a5a', pat: 'stripes', s: 0.3 }) });
  A.bunks.captain = A.bunks.officers[A.bunks.officers.length - 1];
  k.box(cx0, y, cz0, cx1 - 0.1, y + 0.62, cz0 + 0.72, M.locker);
  k.box(cx1 - 0.3, y + 1.0, cz0 - 0.02, cx1 - 0.08, y + 1.45, cz0 + 0.2, M.cabinet);
  dial(k, cx1 - 0.19, y + 1.33, cz0 - 0.02, 0.07);
  dial(k, cx1 - 0.19, y + 1.12, cz0 - 0.02, 0.05);
  props.desk(k, 29.0, y, 0.12, { w: 0.9, top: '#7a7a74', items: false });
  A.spots.captainDesk = [29.0, y, 0.0];
  light(k, 29.2, 0.4, RED, { r: 1.6, i: 0.7 });
  // Chiefs' quarters (the goat locker): bunks and a small table for coffee (S4).
  const gx0 = 29.98, gx1 = 31.28;
  A.bunks.chiefs = [];
  for (const [by, d] of [[y + 0.45, 0.72], [y + 1.15, 0.66], [y + 1.8, 0.5]]) bunk(k, gx0, gx1, by, backZ(gx0, gx1, by - 0.05, by + 0.2, d), backZ(gx0, gx1, by - 0.05, by + 0.2, 0), A.bunks.chiefs);
  props.table(k, 30.6, y, 0.12, { w: 0.7, d: 0.45, h: 0.7, top: '#7a7a74', items: 'cup' });
  A.seats.chiefs = [{ at: [30.2, y, 0.32], seat: 0.46, face: 1 }];
  props.chair(k, 30.2, y, 0.12, { face: 1, color: '#5a5a5a' });
  light(k, 30.65, 0.4, RED, { r: 1.6, i: 0.7 });
  // Yeoman's office: desk, typewriter, files; the mail sacks from Sea Robin (S4, S24).
  props.desk(k, 31.95, y, 0.12, { w: 0.9, top: '#6a6a64', items: false });
  k.box(31.75, y + 0.76, 0.25, 32.1, y + 0.9, 0.5, M.gauge); // typewriter
  k.box(31.45, y, backZ(31.45, 32.35, y, y + 1.3, 0.5), 32.35, y + 1.25, backZ(31.45, 32.35, y, y + 1.3, 0), M.cabinet);
  A.spots.yeoman = [31.95, y, 0.0];
  light(k, 31.9, 0.4, RED, { r: 1.6, i: 0.7 });
  // Mail sacks stacked in the passage and office.
  for (let i = 0; i < 6; i++) sack(k, 31.5 + (i % 3) * 0.32, y + (i > 2 ? 0.32 : 0), 0.62 + (i % 2) * 0.1, '#a89a70', 0.2);
  overheadRuns(k, X.fb + 0.2, X.cr - 0.2, { runs: [[0.9, M.pipe, 0.04], [1.15, M.cable, 0.03], [1.4, M.pipeDk, 0.045]] });

  // Forward battery well below: 126 cells in six rows of 21; we see the three starboard rows (S38).
  batteryWell(k, 23.55, 'fwd');
}

export function batteryWell(k, x0, key) {
  const n = 21, cw = 0.38, y0 = LOW.well;
  A.spots[key + 'Well'] = [];
  const rows = [[0.03, 0.53, y0 + 0.15], [0.56, 1.06, y0 + 0.42], [1.09, 1.59, y0 + 0.82]];
  for (const [z0, z1, by] of rows) {
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * (cw + 0.012), xb = xa + cw;
      const zc = (z0 + z1) / 2;
      const yb = Math.max(by, phY(xa) - Math.sqrt(Math.max(0, (phIn(xa) - 0.08) ** 2 - z1 * z1)) + 0.02);
      k.box(xa, yb, z0, xb, yb + 1.33, z1, M.cell);
      k.box(xa + 0.01, yb + 1.33, z0 + 0.01, xb - 0.01, yb + 1.37, z1 - 0.01, M.cellTop);
      if (i % 2 === 0) k.box(xa + 0.02, yb + 1.37, zc - 0.05, xb + 0.35, yb + 1.41, zc + 0.05, M.lead);
      k.cyl(xa + cw / 2, yb + 1.37, zc + 0.12, 0.03, 0.05, M.white, { seg: 6 });
    }
    // Hard-rubber exhaust duct along the row.
    k.box(x0, by + 1.42 + (by - rows[0][2]), z1 - 0.12, x0 + n * (cw + 0.012), by + 1.5 + (by - rows[0][2]), z1 - 0.04, M.rubber);
  }
  // Walkway panels over the centre rows.
  k.box(x0 - 0.1, y0 + 0.15 + 1.41, -0.3, x0 + n * (cw + 0.012) + 0.1, y0 + 0.15 + 1.47, 0.5, M.rubber);
  A.spots[key + 'Well'].push([x0 + 1.5, y0 + 0.15 + 1.47, 0.25], [x0 + 4.0, y0 + 0.15 + 1.47, 0.25], [x0 + 6.5, y0 + 0.15 + 1.47, 0.25]);
  // One inspection lamp (illustrative).
  k.lamp(x0 + 3.0, y0 + 2.05, 0.6, { color: '#ffe2b0', r: 2.4, i: 0.9, halo: 0.25, bulbR: 0.03 });
  k.lamp(x0 + 6.2, y0 + 2.05, 0.6, { color: '#ffe2b0', r: 1.8, i: 0.5, halo: 0.15, bulbR: 0.03 });
}

// ================================================================== control room, radio room, pump room
function controlRoom(k, parts) {
  const y = DECK.cr;
  A.spots.cr = {};
  // Diving station against the hull: bow and stern plane wheels, depth gauges, plane angle indicators (S7).
  const dz = backZ(32.7, 34.7, y + 0.8, y + 2.1, 0.32);
  k.box(32.65, y + 0.75, dz, 34.75, y + 2.05, dz + 0.32, M.cabinet);
  for (const [x, g] of [[33.1, 0.11], [33.55, 0.15], [34.05, 0.15], [34.45, 0.11]]) dial(k, x, y + 1.75, dz, g);
  for (const x of [33.2, 34.3]) dial(k, x, y + 1.35, dz, 0.07);
  for (const [x, r] of [[33.25, 0.4], [34.2, 0.4]]) {
    k.cyl(x, y + 1.05, dz - 0.35, 0.05, 0.35, M.steel, { axis: 'z', seg: 6 });
    k.box(x - 0.12, y, dz - 0.25, x + 0.12, y + 0.95, dz, M.machDk);
  }
  A.spots.cr.bowPlanes = [33.25, y, dz - 0.85]; A.spots.cr.sternPlanes = [34.2, y, dz - 0.85];
  A.spots.cr.wheels = [[33.25, y + 1.05, dz - 0.38], [34.2, y + 1.05, dz - 0.38]];
  A.spots.cr.gauges = [[33.55, y + 1.75, dz], [34.05, y + 1.75, dz]];
  for (const x of [33.25, 34.2]) { k.cyl(x, y, dz - 0.85, 0.03, 0.42, M.steel, { seg: 6 }); k.cyl(x, y + 0.42, dz - 0.85, 0.17, 0.04, M.machDk, { seg: 12 }); }
  // "Christmas tree": hull opening indicator panel (S7). Lamps are parts so setup can switch them.
  const tz = backZ(34.9, 35.5, y + 1.0, y + 2.1, 0.12);
  k.box(34.85, y + 0.95, tz, 35.55, y + 2.1, tz + 0.12, M.gauge);
  const red = k.part(0, 0, 0, (q) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i * 4 + j) % 3 === 0) q.sphere(34.98 + j * 0.17, y + 1.1 + i * 0.17, tz - 0.01, 0.035, M.redLens, { seg: 6, rings: 4 }); });
  const green = k.part(0, 0, 0, (q) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i * 4 + j) % 3 !== 0) q.sphere(34.98 + j * 0.17, y + 1.1 + i * 0.17, tz - 0.01, 0.035, M.greenLens, { seg: 6, rings: 4 }); });
  const allGreen = k.part(0, 0, 0, (q) => { for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i * 4 + j) % 3 === 0) q.sphere(34.98 + j * 0.17, y + 1.1 + i * 0.17, tz - 0.01, 0.035, M.greenLens, { seg: 6, rings: 4 }); });
  parts.tree = { red, green, allGreen };
  k.lamp(35.2, y + 1.5, tz - 0.15, { color: '#ff7050', r: 0.9, i: 0.35, halo: 0, bulb: false, always: false });
  // Master gyrocompass (Arma Mark 7) (S7).
  k.cyl(36.2, y, 1.25, 0.32, 0.25, M.machDk, { seg: 14 });
  k.cyl(36.2, y + 0.25, 1.25, 0.26, 0.7, M.mach, { seg: 14 });
  k.sphere(36.2, y + 1.0, 1.25, 0.27, M.mach, { seg: 14, rings: 7 });
  // Air manifolds: 3000 lb, 225 lb, 600 and 10 lb (S7) along the after starboard side.
  const az = backZ(36.75, 38.45, y + 0.6, y + 1.9, 0.18);
  k.box(36.75, y + 0.55, az + 0.12, 38.45, y + 1.9, az + 0.18, M.machDk);
  for (let i = 0; i < 4; i++) { k.tube([[36.8, y + 0.8 + i * 0.3, az + 0.08], [38.4, y + 0.8 + i * 0.3, az + 0.08]], 0.035, i % 2 ? M.pipe : M.pipeGreen); for (let j = 0; j < 4; j++) valve(k, 37.0 + j * 0.42, y + 0.8 + i * 0.3, az + 0.02, 0.06); }
  for (let j = 0; j < 4; j++) dial(k, 37.0 + j * 0.42, y + 1.9 + 0.12, az + 0.1, 0.06);
  // Trim pump manifold, after corner (S7).
  k.box(38.0, y, backZ(38.0, 38.55, y, y + 0.6, 0.4), 38.55, y + 0.55, backZ(38.0, 38.55, y, y + 0.6, 0), M.cabinet);
  // Steering stand (repeater) forward and the hydraulic plant handwheel.
  k.box(32.65, y, 0.15, 32.95, y + 1.0, 0.45, M.machDk);
  k.cyl(32.8, y + 1.05, 0.3, 0.22, 0.04, M.brass, { axis: 'x', seg: 14 });
  // The ladder to the conning tower (S35, S29) and a curtain rigged round it at night (S34).
  props.ladder(k, 37.6, y, CT.deck, 0.42, { w: 0.42, color: '#9aa09a' });
  k.box(38.05, y + 0.2, -0.3, 38.07, ceilY(38.05, 0.2) - 0.15, 0.9, M.curtain);
  A.spots.cr.ladder = [37.6, y, 0.42];
  // Periscope wells.
  for (const px of [35.6, 36.9]) k.lathe([[0.2, LOW.pump], [0.24, LOW.pump], [0.24, y + 0.2], [0.2, y + 0.2]], px, 0.0, M.steel, { seg: 12, capTop: false, capBot: false });
  // Lights: red at night (S34, S41).
  for (const x of [33.7, 36.0, 37.9]) light(k, x, 0.5, RED, { r: 2.7 });
  overheadRuns(k, X.cr + 0.2, X.radio - 0.1);

  // Radio room (port side of the control room in the boat; drawn here at its after end) (S10).
  partition(k, X.radio, y, ceilY(X.radio, 0.3) - 0.05, { z0: 0.75 });
  const rz = backZ(X.radio + 0.1, X.ab - 0.1, y, y + 1.85, 0.5);
  k.box(X.radio + 0.1, y, rz, 39.6, y + 1.85, rz + 0.5, M.cabinet);
  k.box(39.65, y + 0.75, rz, X.ab - 0.12, y + 1.75, rz + 0.5, M.cabinet);
  k.box(39.65, y + 0.72, rz - 0.35, X.ab - 0.12, y + 0.76, rz + 0.1, M.machDk);
  for (let i = 0; i < 5; i++) { dial(k, 38.85 + (i % 2) * 0.45, y + 0.6 + Math.floor(i / 2) * 0.4, rz, 0.06); k.lamp(38.85 + (i % 2) * 0.45, y + 0.6 + Math.floor(i / 2) * 0.4, rz - 0.05, { color: '#ffb060', r: 0.5, i: 0.25, halo: 0.08, bulb: false }); }
  for (let i = 0; i < 4; i++) dial(k, 39.85 + i * 0.22, y + 1.4, rz, 0.05);
  k.box(39.8, y + 0.76, rz - 0.3, 40.15, y + 0.93, rz - 0.05, mat({ c: '#3a3a36', cut: '#2a2a28' })); // the ECM cipher machine
  k.box(40.25, y + 0.76, rz - 0.28, 40.5, y + 1.0, rz - 0.1, M.machDk); // sound-powered phone box
  props.chair(k, 40.05, y, rz - 0.85, { face: -1, color: '#5a5a5a' });
  A.spots.radio = [[40.05, y, rz - 0.62], [39.4, y, rz - 0.5]];
  light(k, 39.7, 0.4, RED, { r: 1.7, i: 0.8 });

  // Pump room below (S9).
  const yp = LOW.pump;
  for (const [x, i] of [[33.7, 0], [35.0, 1]]) { // two 3,000 lb air compressors
    k.box(x - 0.45, yp, 0.9, x + 0.45, yp + 0.5, 1.6, M.machDk);
    for (let s = 0; s < 4; s++) k.cyl(x - 0.3 + s * 0.2, yp + 0.5, 1.25, 0.09 - s * 0.012, 0.55 - s * 0.05, M.mach, { seg: 10 });
    void i;
  }
  A.spots.compressors = [[33.7, yp + 1.05, 1.25], [35.0, yp + 1.05, 1.25]];
  k.cyl(36.4, yp + 0.4, 1.0, 0.36, 1.2, M.mach, { axis: 'x', seg: 14 }); // trim pump
  k.cyl(36.7, yp + 0.35, 0.25, 0.28, 0.9, M.machDk, { axis: 'x', seg: 14 }); // drain pump
  k.box(37.75, yp, 0.85, 38.6, yp + 0.95, 1.5, M.cabinet); // refrigeration and air-conditioning plant
  k.cyl(38.9, yp, 0.45, 0.22, 1.75, M.mach, { seg: 12 }); // hydraulic accumulator
  k.cyl(33.3, yp + 0.55, 0.3, 0.3, 1.1, M.pipeGreen, { axis: 'x', seg: 12 }); // motor-generator set
  k.sphere(37.2, yp + 1.6, 1.35, 0.42, M.mach, { seg: 12, rings: 7 }); // low-pressure blower
  props.ladder(k, 34.5, yp, y, 0.25, { w: 0.4, color: '#8a908c' });
  light(k, 36.0, 0.5, '#fff0d0', { y: y - 0.14, r: 2.2, i: 0.55 });
  // Store room and fresh water tanks below the radio room.
  k.box(39.3, yp, 0.2, 40.55, yp + 1.6, backZ(39.3, 40.55, yp, yp + 1.6, 0), M.trim);
}

// ================================================================== galley, mess, cold stores
function galleyAndMess(k) {
  const y = DECK.ab;
  A.seats.mess = [];
  // Galley range with square pots under the hood, along the hull (S12).
  const gz = backZ(40.8, 42.9, y, y + 0.92, 0.65);
  k.box(40.8, y, gz, 42.9, y + 0.9, gz + 0.65, M.stainless);
  for (let i = 0; i < 4; i++) k.box(40.95 + i * 0.48, y + 0.9, gz + 0.06, 41.35 + i * 0.48, y + 0.93, gz + 0.55, M.gauge); // hot plates
  for (const [x, h] of [[41.05, 0.3], [41.55, 0.22], [42.1, 0.34], [42.6, 0.26]]) k.box(x - 0.17, y + 0.93, gz + 0.12, x + 0.17, y + 0.93 + h, gz + 0.46, M.steel); // square pots
  const hz = backZ(40.8, 42.9, y + 1.6, y + 1.95, 0.5);
  k.box(40.75, y + 1.6, hz, 42.95, y + 1.68, hz + 0.6, M.stainless); // ventilation hood
  shelfCans(k, 40.85, 42.85, y + 1.75, Math.max(hz + 0.05, backZ(40.85, 42.85, y + 1.75, y + 2.1, 0.22)), 0.18, 1);
  // Counter and dough board in front of the range, and the mixer.
  k.box(40.9, y, 0.3, 42.25, y + 0.88, 0.85, M.stainless);
  k.box(41.05, y + 0.88, 0.35, 41.85, y + 0.92, 0.8, mat({ c: '#c8a878', c2: '#b89868', pat: 'grain', cut: '#8a6a40' }));
  k.sphere(41.45, y + 0.94, 0.58, 0.14, mat({ c: '#efe4cc', cut: '#c8bca4' }), { seg: 10, rings: 6 }); // dough
  for (let i = 0; i < 4; i++) k.box(41.95 + (i % 2) * 0.14, y + 0.88 + Math.floor(i / 2) * 0.1, 0.4, 42.07 + (i % 2) * 0.14, y + 0.97 + Math.floor(i / 2) * 0.1, 0.62, mat({ c: '#c8904a', cut: '#8a5a2a' })); // loaves
  k.cyl(42.6, y, 0.35, 0.2, 0.75, M.steel, { seg: 12 });
  k.cyl(42.6, y + 0.75, 0.35, 0.12, 0.25, M.stainless, { seg: 10 }); // mixer
  A.spots.baker = [41.45, y, 1.18]; A.spots.cook = [42.3, y, 1.2]; A.spots.range = [41.6, y, gz - 0.35];
  // Bread locker and pie locker (S12).
  k.box(40.78, y + 0.92, 0.95, 41.05, y + 1.6, 1.25, M.stainless);
  // Coffee urn: the coffee pot was always on (S11).
  k.cyl(43.15, y + 0.95, 1.55, 0.14, 0.42, M.stainless, { seg: 12 });
  k.box(42.95, y, 1.35, 43.4, y + 0.95, 1.8, M.stainless);
  light(k, 41.3, 0.6, WHITE, { r: 2.5, i: 1.0 });
  light(k, 42.5, 0.6, WHITE, { r: 2.2, i: 0.9 });
  // Ammunition scuttle in the overhead nearby (S13).
  k.box(43.05, ceilY(43.05, 0.2) - 0.2, -0.3, 43.6, ceilY(43.05, 0.2), 0.45, M.machDk);
  // Crew's mess: four tables with benches, dishes stowed in the benches (S12, S13); we see two.
  for (const [i, tx] of [[0, 43.95], [1, 45.25]]) {
    k.box(tx - 0.35, y + 0.72, 0.55, tx + 0.35, y + 0.76, 1.95, mat({ c: '#6a6e5a', c2: '#5e624e', pat: 'tiles', s: 0.4, cut: '#3a3a30' }));
    k.box(tx - 0.04, y, 1.2, tx + 0.04, y + 0.72, 1.3, M.steel);
    for (const s of [-1, 1]) {
      const bx = tx + s * 0.62;
      k.box(bx - 0.2, y, 0.55, bx + 0.2, y + 0.44, 1.95, M.locker);
      k.box(bx - 0.21, y + 0.44, 0.53, bx + 0.21, y + 0.48, 1.97, mat({ c: '#8a6a4a', cut: '#5a3a2a' }));
      for (const z of [0.8, 1.25, 1.7]) A.seats.mess.push({ at: [bx, y, z], seat: 0.48, face: -s, table: i });
    }
    // Plates and mugs on the tables.
    for (const z of [0.8, 1.25, 1.7]) { k.cyl(tx - 0.18, y + 0.76, z, 0.1, 0.015, M.white, { seg: 10 }); k.cyl(tx + 0.18, y + 0.76, z, 0.1, 0.015, M.white, { seg: 10 }); }
  }
  // Acey-deucey board on the forward table, and the tin of Christmas cookies on the after one (S11, S24).
  k.box(43.75, y + 0.76, 0.85, 44.15, y + 0.78, 1.25, mat({ c: '#c8a870', c2: '#7a3a2a', pat: 'checker', s: 0.05 }));
  k.cyl(45.1, y + 0.76, 1.05, 0.12, 0.09, mat({ c: '#b84a32', c2: '#c8a050', pat: 'stripes', s: 0.03 }), { seg: 12 });
  A.spots.cookies = [45.1, y + 0.85, 1.05];
  // Library shelf and games (S11).
  const lz = backZ(44.5, 45.85, y + 1.5, y + 1.9, 0.25);
  k.box(44.5, y + 1.5, lz, 45.85, y + 1.53, lz + 0.25, M.wood);
  k.box(44.55, y + 1.53, lz + 0.02, 45.8, y + 1.78, lz + 0.22, mat({ c: '#6a3a2a', c2: '#c8b48a', pat: 'books', s: 0.05 }));
  light(k, 43.9, 0.6, WHITE, { r: 2.2, i: 0.85 });
  light(k, 45.2, 0.6, WHITE, { r: 2.2, i: 0.85 });
  overheadRuns(k, X.ab + 0.2, X.berth - 0.1, { runs: [[1.1, M.pipe, 0.04], [1.35, M.cable, 0.035], [1.6, M.pipeDk, 0.05]] });
  partition(k, X.berth, y, ceilY(X.berth, 0.3) - 0.05, { z0: 0.9 });

  // Below: magazine, meat and cool rooms, canned goods (S11, S13).
  const yl = LOW.well;
  partition(k, 43.6, yl, y - 0.14, { mat: mat({ c: '#e8e8e2', c2: '#d8d8d2', pat: 'panels', s: 0.4, cut: '#9a9a94' }) });
  partition(k, 44.9, yl, y - 0.14, { mat: mat({ c: '#e8e8e2', c2: '#d8d8d2', pat: 'panels', s: 0.4, cut: '#9a9a94' }) });
  shelfCans(k, 41.75, 43.45, yl + 0.35, 0.35, 0.3, 4, 0.42);
  for (let i = 0; i < 4; i++) k.box(43.75 + (i % 2) * 0.5, yl + Math.floor(i / 2) * 0.5, 0.4, 44.15 + (i % 2) * 0.5, yl + 0.45 + Math.floor(i / 2) * 0.5, 1.1, mat({ c: '#e6e2d6', c2: '#d6d2c6', pat: 'planks', s: 0.12, cut: '#a8a49a' }));
  for (let i = 0; i < 3; i++) k.cyl(45.05 + i * 0.25, yl + 1.3, 0.6, 0.09, 0.5, mat({ c: '#b86a5a', cut: '#7a3a2a' }), { seg: 8 }); // hanging meat
  k.lamp(43.0, y - 0.35, 0.6, { color: '#e8f0ff', r: 1.6, i: 0.35, halo: 0.1, bulbR: 0.03 });
}

// ================================================================== crew's berthing and washroom
function berthing(k) {
  const y = DECK.ab;
  A.bunks.crew = [];
  // Three racks of three bunks along the hull: 36 bunks in all, in tiers on both sides (S14).
  const racks = [[46.95, 48.75], [48.9, 50.7], [50.85, 52.5]];
  for (const [x0, x1] of racks) {
    const tiers = [[y + 0.38, 0.95, 1.65], [y + 1.0, 0.92, 1.62], [y + 1.62, 0.88, 1.48]];
    for (const [by, z0, z1] of tiers) bunk(k, x0, x1, by, z0, Math.min(z1, roomZ(x0, by + 0.35) - 0.05, roomZ(x1, by + 0.35) - 0.05), A.bunks.crew);
    for (const x of [x0 - 0.03, x1 + 0.03]) k.box(x - 0.02, y, 0.88, x + 0.02, y + 2.05, 0.92, M.steel);
    // Lockers behind and under.
    const lz = backZ(x0, x1, y, y + 0.32, 0.5);
    k.box(x0, y, Math.max(0.95, lz), x1, y + 0.3, Math.max(1.4, lz + 0.5), M.locker);
  }
  // Photos and a pin-up taped above the bunks (illustrative).
  for (const [x, yy] of [[47.4, y + 1.35], [49.6, y + 0.72], [51.6, y + 1.35]]) k.box(x, yy, 1.5, x + 0.12, yy + 0.16, 1.52, M.white);
  // The ice cream freezer, perhaps "the only luxury on the whole boat" (S14).
  k.box(46.05, y, 0.95, 46.8, y + 0.78, 1.6, M.enamel);
  k.box(46.05, y + 0.78, 0.95, 46.8, y + 0.82, 1.6, M.stainless);
  A.spots.freezer = [46.42, y, 0.62];
  for (const x of [47.8, 49.8, 51.7]) light(k, x, 0.45, RED, { r: 2.3, i: 0.85 });
  overheadRuns(k, X.berth + 0.1, X.wash - 0.1, { runs: [[0.35, M.pipe, 0.04], [0.55, M.cable, 0.03]] });
  // Washroom and heads: two toilets, two showers, basins, a washing machine for about 70 men (S15, S37).
  partition(k, X.wash, y, ceilY(X.wash, 0.3) - 0.05, { z0: 0.7 });
  for (let i = 0; i < 3; i++) props.sink(k, 52.85 + i * 0.42, y, backZ(52.7, 54.0, y + 0.7, y + 1.0, 0.48), { mirror: false });
  k.box(53.75, y, 0.15, 54.1, y + 0.85, 0.6, M.enamel); // washing machine
  k.cyl(53.92, y + 0.85, 0.38, 0.15, 0.04, M.steel, { seg: 10 });
  // Shower stall full of potatoes (S11).
  const sz = backZ(52.7, 53.4, y + 1.2, y + 1.6, 0.0);
  k.box(52.68, y + 1.0, sz - 0.02, 53.42, ceilY(53.0, 0.6) - 0.1, sz, M.enamel);
  for (let i = 0; i < 3; i++) sack(k, 52.8 + i * 0.22, y + 0.95 + (i % 2) * 0.15, sz - 0.5, '#b8a070', 0.18);
  A.spots.wash = [[53.05, y, 0.45], [53.45, y, 0.45], [53.85, y, 0.0]];
  light(k, 53.4, 0.5, RED, { r: 1.6, i: 0.7 });
  // After battery well below (S14), and the soft patch in the hull above it for changing cells.
  batteryWell(k, 45.85, 'aft');
  for (let x = 47.6; x < 50.6; x += 0.2) { k.sphere(x, 6.07, 0.35, 0.03, M.machDk, { seg: 5, rings: 3 }); k.sphere(x, 6.03, 0.95, 0.03, M.machDk, { seg: 5, rings: 3 }); }
}

// ================================================================== engine rooms
// One Fairbanks-Morse 38D8 1/8 opposed-piston engine and its generator (S40, S16, S17).
export function engineBlock(k, x0, x1, yb, z0, z1) {
  const top = 5.0;
  // Bed, crankcase (lower), cylinder block (middle), upper crankcase, all welded and box-like (S40).
  k.box(x0 - 0.1, yb, z0 - 0.05, x1 + 0.1, yb + 0.25, z1 + 0.05, M.machDk);
  k.box(x0, yb + 0.25, z0, x1, yb + 1.15, z1, M.engine);
  k.box(x0 + 0.05, yb + 1.15, z0 + 0.12, x1 - 0.05, top - 0.75, z1 - 0.05, M.engine);
  k.box(x0, top - 0.75, z0 + 0.05, x1, top, z1, M.engine);
  // Ten cylinder covers along the inboard face, with fuel pumps and injector lines.
  const n = 10, cw = (x1 - x0 - 0.3) / n;
  for (let i = 0; i < n; i++) {
    const cx = x0 + 0.15 + (i + 0.5) * cw;
    k.box(cx - cw * 0.38, yb + 1.35, z0 + 0.06, cx + cw * 0.38, top - 1.0, z0 + 0.12, M.mach);
    k.box(cx - 0.06, yb + 1.95, z0 - 0.06, cx + 0.06, yb + 2.2, z0 + 0.12, M.steel);
    k.tube([[cx, yb + 2.2, z0 + 0.0], [cx + 0.1, yb + 2.5, z0 + 0.04], [cx + 0.1, yb + 2.75, z0 + 0.1]], 0.012, M.brass, { seg: 4 });
  }
  // Fuel header and lube lines along the side.
  k.tube([[x0 + 0.1, yb + 1.85, z0 - 0.02], [x1 - 0.1, yb + 1.85, z0 - 0.02]], 0.035, M.pipeRed);
  k.tube([[x0 + 0.1, yb + 1.6, z0 - 0.02], [x1 - 0.1, yb + 1.6, z0 - 0.02]], 0.03, M.brass);
  // Exhaust manifold on the outboard side (water-jacketed, black).
  k.cyl(x0 + 0.1, top - 1.3, z1 + 0.18, 0.2, x1 - x0 - 0.2, M.black, { axis: 'x', seg: 10 });
  // Control end: gauge board and the governor.
  k.box(x0 - 0.35, yb + 1.3, z0 + 0.1, x0, yb + 2.4, z1 - 0.3, M.cabinet);
  for (let i = 0; i < 4; i++) dial(k, x0 - 0.18, yb + 1.55 + i * 0.22, z0 + 0.1, 0.06);
  k.box(x0 - 0.2, top - 0.6, z0 + 0.3, x0, top - 0.2, z0 + 0.7, M.machDk);
}
function engineRooms(k) {
  const y = DECK.eng, yl = LOW.eng;
  A.spots.eng = [];
  for (const [xa, xb, key] of [[X.fer, X.aer, 'fer'], [X.aer, X.man, 'aer']]) {
    const ex0 = xa + 1.25, ex1 = xa + 5.35;
    const z0 = 0.78, z1 = 2.0;
    engineBlock(k, ex0, ex1, yl, z0, Math.min(z1, roomZ(ex0, 4.6) - 0.25));
    // Generator coupled aft of the engine on the lower flat (S16, S17).
    const gx0 = ex1 + 0.15, gx1 = xb - 0.35;
    k.cyl(gx0, yl + 1.0, 1.25, 0.85, gx1 - gx0, M.mach, { axis: 'x', seg: 18 });
    for (let x = gx0 + 0.25; x < gx1; x += 0.45) k.cyl(x, yl + 1.0, 1.25, 0.88, 0.06, M.machDk, { axis: 'x', seg: 18 });
    k.box(gx0 - 0.05, yl, 0.55, gx1, yl + 0.2, 1.95, M.machDk);
    // Upper flats: centre walkway grating and the platform over the generator.
    k.box(xa + 0.08, y - 0.06, -0.3, xb - 0.08, y, 0.62, M.grate);
    k.box(gx0 - 0.1, y - 0.06, 0.62, xb - 0.08, y, roomZ(gx0, y) - 0.02, M.grate);
    for (let x = xa + 0.6; x < xb - 0.3; x += 1.4) k.box(x - 0.03, yl, 0.56, x + 0.03, y - 0.06, 0.62, M.steel);
    props.rail(k, xa + 0.2, ex1 + 0.1, y, 0.68, { h: 0.85, step: 1.0, color: '#9aa09a', r: 0.018 });
    // Stairs between the levels.
    props.ladder(k, xb - 0.6, yl, y, 0.3, { w: 0.4, color: '#8a908c' });
    // Gauge board and telegraph repeaters on the forward bulkhead.
    const bz = backZ(xa + 0.1, xa + 1.1, y + 0.8, y + 1.8, 0.1);
    k.box(xa + 0.12, y + 0.8, bz, xa + 1.1, y + 1.85, bz + 0.1, M.cabinet);
    for (let i = 0; i < 6; i++) dial(k, xa + 0.3 + (i % 3) * 0.3, y + 1.15 + Math.floor(i / 3) * 0.4, bz, 0.07);
    A.spots.eng.push({ key, walk: [ex0 + 1.0, y, 0.3], end: [ex0 - 0.6, yl, 0.4], lower: [gx0 + 0.6, yl, 0.35], top: [gx0 + 1.0, y, 1.0], ex0, ex1, gx0, gx1, z0 });
    // Lights: white in the engine rooms (Grayback practice, S41).
    for (const x of [xa + 1.8, xa + 4.2, xa + 6.6]) light(k, x, 0.45, WHITE, { r: 2.9, i: 1.0 });
    light(k, xa + 3.0, 0.35, WHITE, { y: y - 0.08, r: 2.0, i: 0.6 });
    overheadRuns(k, xa + 0.2, xb - 0.2, { runs: [[0.35, M.pipe, 0.05], [0.6, M.cable, 0.04], [0.85, M.pipeDk, 0.06]] });
  }
  // Forward engine room: two stainless stills at the forward bulkhead (S16); fuel and lube pumps below.
  for (const yy of [y + 0.25, y + 0.95]) k.cyl(X.fer + 0.15, yy + 0.3, 1.25, 0.28, 0.95, M.stainless, { axis: 'x', seg: 14 });
  k.box(55.0, yl, 0.05, 55.7, yl + 0.55, 0.5, M.pipeRed);
  k.box(56.0, yl, 0.05, 56.6, yl + 0.5, 0.5, M.machDk);
  A.spots.stills = [X.fer + 0.7, y, 0.55];
  // After engine room: the 7-cylinder auxiliary engine and its 300 kW generator on the centreline (S17, S1).
  const ax0 = 64.0;
  k.box(ax0, yl, -0.3, ax0 + 2.6, yl + 1.1, 0.48, M.engine);
  for (let i = 0; i < 7; i++) k.box(ax0 + 0.15 + i * 0.34, yl + 1.1, -0.3, ax0 + 0.42 + i * 0.34, yl + 1.25, 0.4, M.mach);
  k.cyl(ax0 + 2.7, yl + 0.55, 0.1, 0.5, 1.3, M.mach, { axis: 'x', seg: 16 });
  A.spots.aux = [ax0 + 1.3, yl, 0.75];
  // Oil purifiers (S29).
  for (const x of [68.6, 69.3]) { k.cyl(x, y, 0.95, 0.2, 0.6, M.steel, { seg: 12 }); k.sphere(x, y + 0.65, 0.95, 0.2, M.steel, { seg: 12, rings: 6 }); }
}

// ================================================================== maneuvering room and motor room
function maneuvering(k) {
  const y = DECK.man;
  // Control cubicle against the hull and the control stand with its levers (S39, S18).
  const cz = backZ(70.6, 74.4, y, y + 1.55, 0.45);
  k.box(70.6, y, cz, 74.4, y + 1.55, cz + 0.45, mat({ c: '#8a9490', c2: '#7a8480', pat: 'grate', s: 0.09, cut: '#4e5450' }));
  for (let i = 0; i < 8; i++) dial(k, 70.85 + i * 0.47, y + 1.35, cz, 0.08);
  for (let i = 0; i < 6; i++) k.lamp(71.0 + i * 0.6, y + 1.1, cz - 0.05, { color: '#ffb050', r: 0.5, i: 0.25, halo: 0.1, bulbR: 0.025 });
  k.box(71.0, y, 0.85, 74.0, y + 1.0, 1.25, M.cabinet);
  k.box(70.95, y + 1.0, 0.8, 74.05, y + 1.06, 1.3, M.machDk);
  A.spots.levers = [];
  for (let i = 0; i < 10; i++) { const x = 71.2 + i * 0.29; A.spots.levers.push(x); }
  // Motor order telegraphs.
  for (const x of [71.4, 73.6]) { k.cyl(x, y + 1.06, 1.05, 0.05, 0.25, M.steel, { seg: 6 }); k.cyl(x, y + 1.45, 1.05 - 0.04, 0.18, 0.08, M.brass, { axis: 'z', seg: 14 }); dial(k, x, y + 1.45, 1.0, 0.13); }
  A.spots.stand = [[71.8, y, 0.42], [73.2, y, 0.42]];
  // The ship's lathe aft (S18) and a toolbox.
  k.box(74.8, y, backZ(74.8, 76.4, y, y + 1.1, 0.45), 76.4, y + 0.95, backZ(74.8, 76.4, y, y + 1.1, 0), M.machDk);
  k.cyl(74.95, y + 1.05, backZ(74.8, 76.4, y, y + 1.1, 0.22), 0.09, 1.2, M.steel, { axis: 'x', seg: 10 });
  A.spots.lathe = [75.6, y, 0.6];
  for (const x of [71.6, 73.7, 75.6]) light(k, x, 0.45, RED, { r: 2.4, i: 0.85 });
  overheadRuns(k, X.man + 0.2, X.atr - 0.2, { runs: [[0.4, M.cable, 0.05], [0.6, M.cable, 0.05], [0.85, M.pipe, 0.04], [1.1, M.cable, 0.05]] });
  // Motor room below: two Elliott motors on the starboard shaft and the reduction gear (S19).
  const yl = LOW.motor;
  k.box(70.6, yl, 1.05, 74.9, yl + 0.25, 2.1, M.machDk);
  for (const [a, b] of [[70.7, 72.6], [72.75, 74.65]]) {
    k.cyl(a, yl + 0.95, 1.6, 0.62, b - a, M.mach, { axis: 'x', seg: 18 });
    for (let x = a + 0.2; x < b; x += 0.35) k.cyl(x, yl + 0.95, 1.6, 0.65, 0.05, M.machDk, { axis: 'x', seg: 18 });
  }
  k.box(74.8, yl, 0.95, 76.35, yl + 1.65, 2.15, M.engine); // reduction gear
  A.spots.motor = [[72.6, yl, 0.4], [75.2, yl, 0.55]];
  props.ladder(k, 70.85, yl, y, 0.3, { w: 0.4, color: '#8a908c' });
  light(k, 72.5, 0.5, '#ffe8c8', { y: y - 0.12, r: 2.2, i: 0.5 });
}

// ================================================================== after torpedo room
function afterTorpedoRoom(k) {
  const y = DECK.atr;
  A.bunks.atr = [];
  // Four tubes; the two starboard breeches (S20).
  for (const ty of [4.95, 4.04]) {
    const z = 0.52, x = X.phA - 0.07;
    k.cyl(x - 0.75, ty, z, 0.34, 0.75, M.steel, { axis: 'x', seg: 18 });
    k.cyl(x - 0.84, ty, z, 0.4, 0.09, M.breech, { axis: 'x', seg: 18 });
    k.cyl(x - 0.9, ty, z, 0.16, 0.06, M.brass, { axis: 'x', seg: 10 });
    // Out through the stern to the muzzle.
    k.cyl(x, ty, z, 0.3, 92.3 - x - (ty > 4.5 ? 0 : 1.2), M.machDk, { axis: 'x', seg: 14 });
  }
  // Four reloads on skids; we see two (S20).
  torpedo(k, 79.2, y + 0.38, 1.25, true);
  torpedo(k, 79.2, y + 1.0, 1.15, true);
  for (const x of [80.2, 82.4, 84.6]) k.box(x - 0.05, y, 0.95, x + 0.05, y + 0.14, 1.55, M.machDk);
  // Bunks above and forward; small lockers (S20).
  bunk(k, 79.4, 81.3, y + 1.6, 0.55, 1.2, A.bunks.atr);
  bunk(k, 81.5, 83.4, y + 1.6, 0.55, 1.2, A.bunks.atr);
  bunk(k, 83.6, 85.5, y + 1.55, 0.55, 1.15, A.bunks.atr);
  for (const [i, by] of [[0, y + 0.4], [1, y + 1.02], [2, y + 1.64]]) bunk(k, 76.8, 78.7, by, 0.9 - i * 0.08, 1.6 - i * 0.12, A.bunks.atr);
  for (const x of [76.75, 78.75]) k.box(x - 0.02, y, 0.82, x + 0.02, y + 2.05, 0.86, M.steel);
  // Green oxygen cylinders (S20), bosun's locker and spare parts.
  for (let i = 0; i < 4; i++) k.cyl(85.8 + i * 0.24, y, backZ(85.7, 86.8, y, y + 1.4, 0.13) + 0.12, 0.11, 1.35, M.oxy, { seg: 10 });
  k.box(78.9, y, backZ(78.9, 79.3, y, y + 1.2, 0.4), 79.3, y + 1.1, backZ(78.9, 79.3, y, y + 1.2, 0), M.locker);
  // Hydraulic steering rams and stern plane tilting gear overhead aft (S20).
  k.cyl(84.0, ceilY(84, 0.6) - 0.35, 0.6, 0.14, 2.6, M.mach, { axis: 'x', seg: 10 });
  k.cyl(84.6, ceilY(84.6, 1.0) - 0.3, 1.0, 0.1, 2.1, M.machDk, { axis: 'x', seg: 10 });
  // The head that discharges to sea (S20).
  k.box(86.4, y, 0.2, 86.8, y + 0.42, 0.6, M.white);
  // Escape and rescue hatch in the overhead (S20).
  const ec = 80.55, eb = ceilY(ec, 0) - 0.1;
  k.lathe([[0.5, eb], [0.57, eb], [0.57, 7.25], [0.5, 7.25], [0.5, eb]], ec, 0, mat({ c: '#c8c8be', c2: '#b8b8ae', pat: 'rivets', s: 0.3, cut: '#a8402e' }), { seg: 16, capTop: false, capBot: false });
  for (const x of [77.8, 80.6, 83.2, 85.9]) light(k, x, 0.45, RED, { r: 2.4, i: 0.85 });
  overheadRuns(k, X.atr + 0.2, X.phA - 0.2);
  // Lower flat: after trim and WRT tanks, store room.
  light(k, 81.5, 0.5, RED, { y: y - 0.12, r: 1.5, i: 0.4 });
}

// ================================================================== superstructure void and the bow
function superstructure(k) {
  // Torpedo impulse air flasks under the forward deck (S23).
  for (const [x0, x1, yy, z] of [[12.0, 19.5, 6.55, 0.55], [12.0, 19.5, 6.55, 1.05], [21.0, 30.5, 6.45, 0.75]]) {
    k.cyl(x0, yy, z, 0.2, x1 - x0, mat({ c: '#5a6a5a', cut: '#3a4a3a' }), { axis: 'x', seg: 12 });
    k.sphere(x0, yy, z, 0.2, mat({ c: '#5a6a5a', cut: '#3a4a3a' }), { seg: 10, rings: 6 });
    k.sphere(x1, yy, z, 0.2, mat({ c: '#5a6a5a', cut: '#3a4a3a' }), { seg: 10, rings: 6 });
  }
  // Air banks aft, and the main induction duct running aft to the engine rooms.
  k.cyl(44.5, 6.4, 0.55, 0.33, 17.2, M.pipeDk, { axis: 'x', seg: 12 });
  for (const [x0, x1] of [[63.0, 76.0], [77, 86]]) k.cyl(x0, 6.5, 0.9, 0.2, x1 - x0, mat({ c: '#5a6a5a', cut: '#3a4a3a' }), { axis: 'x', seg: 10 });
  // Superstructure frames: light vertical webs every few metres.
  const web = mat({ c: '#3e4442', cut: '#2a2a28' });
  for (let x = 6; x < 92; x += 2.4) {
    if (x > 31.5 && x < 44.6) continue;
    k.box(x - 0.04, Math.max(phY(x) + phR(x) - 0.2, 5.6), 0.1, x + 0.04, 6.95, 0.2, web);
  }
  // Bow plane tilting and rigging gear under the forward deck (S23).
  k.box(8.0, 6.2, 0.2, 9.2, 6.9, 0.8, M.machDk);
  k.cyl(8.6, 6.55, 0.8, 0.08, 0.35, M.steel, { axis: 'z', seg: 8 });
}

export function buildRooms(k, parts) {
  forwardTorpedoRoom(k);
  officersCountry(k);
  controlRoom(k, parts);
  galleyAndMess(k);
  berthing(k);
  engineRooms(k);
  maneuvering(k);
  afterTorpedoRoom(k);
  superstructure(k);
}
