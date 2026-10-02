/* Conwy Castle: the masonry shell. Towers, curtains, gates, barbicans, the hall range,
 * the royal apartments and the timber buildings against the north wall. Interiors are
 * furnished in rooms.js. */
import { mat } from '../../engine/index.js';
import {
  M, TOWERS, TOWER_R, TOWER_BASE, FL, PARA, MERLON, WALK, HALL, ROYAL, NCURT, LEAN, GATE_Z, DITCH, CROSS, BARB_W, GARDEN, DOCK,
  archPts, polar, merlon, battlementsLine, battlementsRing, roundOpening,
} from './common.js';

// Inner radius of each tower storey (walls thin as they rise).
export const RIN = { b: 3.35, 0: 3.4, 1: 3.6, 2: 3.8 };
export const STAIR = { a: 0.13, r: 4.7, rr: 0.78 }; // mural newel stair in front towers, straddling the cut

// ------------------------------------------------------------------ towers
// key: TOWERS entry. opt.inner: materials per storey [basement, ground, first, second].
export function tower(k, key, opt = {}) {
  const T = TOWERS[key];
  const cx = T.x, cz = T.z, half = !T.front;
  const a0 = half ? 0 : 0, a1 = half ? Math.PI : Math.PI * 2;
  const R = TOWER_R;
  const inner = opt.inner || [M.rubble, M.rubble, M.plaster, M.plaster];
  const basement = !!opt.basement;
  const by = opt.basementY != null ? opt.basementY : -3.5;
  // Ring wall profile: outer face up, parapet top, inner faces down storey by storey, base.
  // Front towers start at the rock top so nothing lies buried behind the section; the back
  // towers stand on a battered (spurred) base down the rock.
  const yb0 = opt.base != null ? opt.base : TOWER_BASE;
  const pr = [[R + (half ? 0.75 : 0.25), yb0], [R + 0.05, half ? -1.2 : yb0 + 0.6], [R, PARA], [R - 0.75, PARA], [R - 0.75, FL[3]], [RIN[2], FL[3]], [RIN[2], FL[2]], [RIN[1], FL[2]], [RIN[1], FL[1]], [RIN[0], FL[1]], [RIN[0], FL[0]], [RIN.b, FL[0]], [RIN.b, basement ? by : yb0 + 0.25], [RIN.b, yb0], [R + (half ? 0.75 : 0.25), yb0]];
  const segMat = [half ? M.limeBase : M.buried, M.lime, M.lime, M.lime, M.lead, inner[3], M.boards, inner[2], M.boards, inner[1], M.flags, inner[0], M.rock, M.rock];
  k.lathe(pr, cx, cz, M.lime, { seg: half ? 24 : 48, a0, a1, capTop: false, capBot: false, matFn: (i) => segMat[i] || M.lime, wallMat: M.cutStone, flat: false });
  // Floors: flagged ground floor, timber upper floors, lead-and-board roof platform.
  const disc = (y0, y1, r, m) => k.lathe([[0, y0], [r, y0], [r, y1], [0, y1]], cx, cz, m, { seg: half ? 24 : 48, a0, a1, capTop: false, capBot: false, wallMat: M.cutStone });
  disc(FL[0] - 0.35, FL[0], RIN[0] + 0.02, M.flags);
  disc(FL[1] - 0.32, FL[1], RIN[1] + 0.02, M.boards);
  disc(FL[2] - 0.32, FL[2], RIN[2] + 0.02, M.boards);
  disc(FL[3] - 0.4, FL[3], R - 0.73, M.lead);
  if (basement) disc(by - 0.3, by, RIN.b + 0.02, M.earth);
  // Floor joists seen from below (front towers only, where the underside shows).
  if (!half) for (const fy of [FL[1], FL[2], FL[3]]) {
    const rr = fy === FL[1] ? RIN[0] : fy === FL[2] ? RIN[1] : RIN[2];
    for (let j = -2; j <= 2; j++) {
      const x = cx + j * 1.25, zz = Math.sqrt(Math.max(0, rr * rr - (j * 1.25) ** 2));
      k.box(x - 0.12, fy - 0.62, -0.3, x + 0.12, fy - 0.32, zz + 0.2, M.oak);
    }
  }
  // Merlons with finials.
  const n = half ? 7 : 14;
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * (i + 0.5)) / n;
    const [x, z] = polar(cx, cz, R - 0.38, a);
    merlon(k, x, PARA, z, 1.45, MERLON - PARA, 0.74, -a + Math.PI / 2, M.lime);
  }
  // Putlog holes climbing in a spiral, and the square sockets of the hourd beams below the parapet.
  const vis = (a) => (half ? a > 0.05 && a < Math.PI - 0.05 : true);
  const hole = mat({ c: '#3a3530', cut: '#3a3530' });
  for (let t = 0; t < 1; t += 0.018) {
    const a = 0.4 + t * Math.PI * 2 * 2.6 + (key.length * 1.3);
    const aa = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (!vis(aa)) continue;
    const [x, z] = polar(cx, cz, R + 0.01, aa);
    k.boxR(x, -0.5 + t * 13.4, z, 0.24, 0.24, 0.06, hole, { y: -aa + Math.PI / 2 });
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + 0.13;
    if (!vis(a)) continue;
    const [x, z] = polar(cx, cz, R + 0.01, a);
    k.boxR(x, PARA - 1.55, z, 0.3, 0.3, 0.06, hole, { y: -a + Math.PI / 2 });
  }
  // Turret: a watch turret on the inner-ward towers, a stair turret elsewhere.
  const ta = opt.turretA != null ? opt.turretA : Math.PI / 2;
  const [tx, tz] = polar(cx, cz, R - 1.75, ta);
  const tTop = T.turret ? 20.9 : 17.2, tr = T.turret ? 1.85 : 1.45;
  k.lathe([[tr + 0.05, FL[3]], [tr, tTop], [0, tTop]], tx, tz, M.lime, { seg: 20, capBot: false });
  battlementsRing(k, tx, tz, tr, tr - 0.5, tTop, T.turret ? 6 : 5, M.lime, { seg: 20, breast: 0.6, mh: 0.95 });
  k.box(tx - 0.45, FL[3], tz - tr - 0.02, tx + 0.45, FL[3] + 1.9, tz - tr + 0.05, M.dark); // door onto the roof
  roundOpening(k, tx, tz, tr + 0.02, -Math.PI / 2, tTop - 2.8, 0.18, 1.1, { fill: M.dark });
  // Mural newel stair in the front towers, cut open in the section.
  if (!half && opt.stair !== false) {
    const [sx, sz] = polar(cx, cz, STAIR.r, STAIR.a);
    k.cyl(sx, FL[0], sz, STAIR.rr, FL[3] - FL[0] + 0.2, M.void, { seg: 14 });
    const stepM = mat({ c: '#b4ae9f', c2: '#9a9486', pat: 'stone', s: 0.3, cut: '#8c8a83' });
    const nSteps = 21 * 3;
    for (let s = 0; s < nSteps; s++) {
      const a = (s / 21) * Math.PI * 2 + 1.2;
      const y = FL[0] + ((s + 1) / nSteps) * (FL[3] - FL[0]);
      k.boxR(sx + Math.cos(a) * 0.42, y - 0.1, sz + Math.sin(a) * 0.42, 0.72, 0.2, 0.3, stepM, { y: -a });
    }
    k.cyl(sx, FL[0], sz, 0.13, FL[3] - FL[0], stepM, { seg: 8 });
    // Doorways from each floor into the stair.
    for (let f = 0; f < 3; f++) {
      const r = RIN[f];
      const [dx, dz] = polar(cx, cz, r - 0.03, STAIR.a + 0.42);
      k.boxR(dx, FL[f] + 1.0, dz, 0.75, 2.0, 0.08, M.dark, { y: -(STAIR.a + 0.42) + Math.PI / 2 });
    }
  }
  return { cx, cz, half };
}

// ------------------------------------------------------------------ walls
// A curtain run along x at depth z0..z1 with a wall-walk at WALK and battlements on one face.
function curtainX(k, x0, x1, z0, z1, battleSide, opt = {}) {
  const top = opt.top != null ? opt.top : WALK;
  k.box(x0, opt.base != null ? opt.base : -0.2, z0, x1, top, z1, M.lime, { front: opt.front || M.lime });
  k.box(x0, top - 0.05, z0, x1, top + 0.02, z1, M.flags, { bottom: false });
  const zb = battleSide > 0 ? z1 - 0.35 : z0 + 0.35;
  battlementsLine(k, x0, x1, zb, top, 'x', M.lime, { t: 0.7 });
}
function curtainZ(k, z0, z1, x0, x1, battleSide, opt = {}) {
  const top = opt.top != null ? opt.top : WALK;
  k.box(x0, opt.base != null ? opt.base : -0.2, z0, x1, top, z1, M.lime);
  k.box(x0, top - 0.05, z0, x1, top + 0.02, z1, M.flags, { bottom: false });
  const xb = battleSide > 0 ? x1 - 0.35 : x0 + 0.35;
  battlementsLine(k, z0, z1, xb, top, 'z', M.lime, { t: 0.7 });
}

// A solid block minus box-shaped voids (gate passages, chambers in the wall).
function block(k, x0, x1, y0, y1, z0, z1, voids, m) {
  const xs = new Set([x0, x1]), ys = new Set([y0, y1]), zs = new Set([z0, z1]);
  for (const v of voids) {
    for (const x of [v[0], v[1]]) if (x > x0 && x < x1) xs.add(x);
    for (const y of [v[2], v[3]]) if (y > y0 && y < y1) ys.add(y);
    for (const z of [v[4], v[5]]) if (z > z0 && z < z1) zs.add(z);
  }
  const X = [...xs].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b), Z = [...zs].sort((a, b) => a - b);
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Y.length - 1; j++) for (let l = 0; l < Z.length - 1; l++) {
    const cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2, cz = (Z[l] + Z[l + 1]) / 2;
    if (voids.some((v) => cx > v[0] && cx < v[1] && cy > v[2] && cy < v[3] && cz > v[4] && cz < v[5])) continue;
    k.box(X[i], Y[j], Z[l], X[i + 1], Y[j + 1], Z[l + 1], m);
  }
}

export function walls(k) {
  const T = TOWERS;
  const tw = (t) => [T[t].x - TOWER_R + 0.5, T[t].x + TOWER_R - 0.5];
  // North curtain between the four north towers, battlements on the outer (north) face.
  curtainX(k, tw('nw')[1], tw('kit')[0], NCURT.z0, NCURT.z1, 1);
  curtainX(k, tw('kit')[1], tw('stock')[0], NCURT.z0, NCURT.z1, 1);
  curtainX(k, tw('stock')[1], tw('chap')[0], NCURT.z0, NCURT.z1, 1);
  // Stone corbels that carried the roofs of the timber lean-tos (they still jut from the wall).
  for (let x = 25; x < 60; x += 2.0) k.box(x - 0.18, LEAN.top - 0.55, NCURT.z0 - 0.45, x + 0.18, LEAN.top - 0.2, NCURT.z0, M.rubble);
  for (let x = 75; x < 83; x += 2.0) k.box(x - 0.18, LEAN.top - 0.55, NCURT.z0 - 0.45, x + 0.18, LEAN.top - 0.2, NCURT.z0, M.rubble);

  // West curtain: the gatehouse block between the SW and NW towers, with the gate passage,
  // the chamber over the gate (portcullis winch), the guard room and the porter's lodge.
  const g0 = GATE_Z[0], g1 = GATE_Z[1];
  block(k, 13.5, 23.0, 0, WALK, 5.2, 24.8, [
    [13.4, 23.1, 0, 4.4, g0, g1],                // gate passage
    [13.9, 19.0, 4.9, 8.6, g0 - 0.6, g1 + 0.6],  // chamber over the gate
    [14.2, 14.9, 4.4, 4.9, g0, g1],              // portcullis slot into the chamber
    [17.6, 22.4, 0, 3.9, g1 + 0.7, 23.6],        // guard room
    [13.9, 17.0, 0, 3.9, g1 + 0.7, 23.6],        // porter's lodge
    [17.0, 17.6, 0, 2.4, g1 + 1.8, g1 + 3.0],    // door between them
    [19.2, 20.6, 0, 2.6, g1, g1 + 0.7],          // guard room door off the passage
    [14.8, 16.2, 0, 2.6, g1, g1 + 0.7],          // lodge door
  ], M.lime);
  k.box(13.5, WALK - 0.05, 5.2, 23.0, WALK + 0.02, 24.8, M.flags, { bottom: false });
  battlementsLine(k, 5.2, 24.8, 13.85, WALK, 'z', M.lime);
  // Machicolations over the main gate: a parapet carried out on corbels with gaps in its floor.
  for (let z = g0 - 1.2; z <= g1 + 1.2; z += 1.2) {
    k.box(12.9, WALK - 2.0, z - 0.25, 13.5, WALK - 1.5, z + 0.25, M.lime);
    k.box(12.4, WALK - 1.5, z - 0.25, 13.5, WALK - 0.9, z + 0.25, M.lime);
  }
  k.box(11.95, WALK - 0.9, g0 - 1.5, 12.4, WALK + 1.4, g1 + 1.5, M.lime);
  for (let z = g0 - 1.2; z <= g1 + 1.2; z += 1.2) k.box(11.95, WALK + 1.4, z - 0.3, 12.4, WALK + 2.4, z + 0.3, M.lime);
  // Portcullis grooves and the dark arch of the gate mouth on the west face.
  k.extrude(archPts(15, 0, 4, 3.0), 13.35, 13.5, M.void, {});
  void k;

  // Cross-wall between the wards, with the small middle gatehouse and its passage.
  block(k, CROSS.x0, CROSS.x1, 0, WALK, 5.2, 24.8, [[CROSS.x0 - 0.1, CROSS.x1 + 0.1, 0, 3.8, g0 + 0.3, g1 - 0.3]], M.lime);
  block(k, CROSS.x1, CROSS.gx1, 0, 6.2, g0 - 1.3, g1 + 1.3, [[CROSS.x1 - 0.1, CROSS.gx1 + 0.1, 0, 3.8, g0 + 0.3, g1 - 0.3]], M.lime);
  k.box(CROSS.x0, WALK - 0.05, 5.2, CROSS.x1, WALK + 0.02, 24.8, M.flags, { bottom: false });
  battlementsLine(k, 5.2, 24.8, CROSS.x0 + 0.35, WALK, 'z', M.lime);
  battlementsLine(k, g0 - 1.3, g1 + 1.3, CROSS.gx1 - 0.35, 6.2, 'z', M.lime, { pitch: 2.0 });
  k.extrude(archPts(CROSS.x0, 0, 3.4, 2.5).map(([a, b]) => [a, b]), 0, 0.01, M.void, { front: false, back: false });

  // East curtain with the east gate passage out to the barbican garden.
  block(k, 94.0, 97.6, -0.2, WALK, 5.2, 24.8, [[93.9, 97.7, 0, 3.8, g0 + 0.3, g1 - 0.3]], M.lime);
  k.box(94.0, WALK - 0.05, 5.2, 97.6, WALK + 0.02, 24.8, M.flags, { bottom: false });
  battlementsLine(k, 5.2, 24.8, 97.25, WALK, 'z', M.lime);

  // Junction blocks where the front towers meet the ranges (the south curtain itself is cut away).
  k.box(19.6, -0.3, -1, 21.7, WALK, 5.2, M.lime);
  k.box(62.3, -3.0, -1, 63.3, WALK, 6.0, M.lime);
  k.box(73.6, -0.3, -1, 74.0, ROYAL.plate, 5.2, M.lime);
  k.box(93.5, -0.3, 5.2, 94.0, ROYAL.plate, 8.0, M.lime);
}

// ------------------------------------------------------------------ barbicans
export function barbicans(k) {
  const B = BARB_W, g0 = GATE_Z[0], g1 = GATE_Z[1];
  // West barbican: walled yard before the gate, with three turrets.
  k.box(1.6, B.y - 0.2, B.z0, 13.5, B.y, B.z1, M.cobble);
  const wTop = 6.0;
  // Outer wall with the outer gate.
  block(k, -0.5, 1.6, -5, wTop, B.z0 - 0.6, B.z1 + 0.6, [[-0.6, 1.7, B.y, 1.6, g0 + 0.2, g1 - 0.2]], M.lime);
  battlementsLine(k, B.z0 - 0.6, B.z1 + 0.6, -0.15, wTop, 'z', M.lime, { pitch: 2.1 });
  // South and north walls of the barbican yard, to the towers.
  k.box(1.6, -5, B.z0 - 0.6, 9.2, wTop, B.z0 + 0.6, M.lime);
  battlementsLine(k, 1.6, 9.2, B.z0 - 0.25, wTop, 'x', M.lime, { pitch: 2.1 });
  k.box(1.6, -5, B.z1 - 0.6, 7.0, wTop, B.z1 + 0.6, M.lime);
  battlementsLine(k, 1.6, 7.0, B.z1 + 0.25, wTop, 'x', M.lime, { pitch: 2.1 });
  // Three turrets on corbel tables.
  for (const [tz, r] of [[g0 - 2.2, 2.0], [g1 + 2.2, 2.0], [B.z0 + 0.2, 2.2]]) {
    const tx = tz === B.z0 + 0.2 ? 1.2 : 0.4;
    k.lathe([[r - 0.35, -5], [r - 0.35, wTop - 1.6], [r, wTop - 0.8], [r, wTop + 0.6], [0, wTop + 0.6]], tx, tz, M.lime, { seg: 20, capBot: false });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; const [x, z] = polar(tx, tz, r - 0.2, a); k.boxR(x, wTop - 1.15, z, 0.3, 0.5, 0.45, M.lime, { y: -a + Math.PI / 2 }); }
    battlementsRing(k, tx, tz, r, r - 0.45, wTop + 0.6, 6, M.lime, { seg: 20, breast: 0.6, mh: 0.95 });
  }
  // The gate arch and its portcullis grooves on the outer face.
  k.extrude(archPts(15, 0, 3.6, 2.6).map(([z, y]) => [z, y]), -0.62, -0.5, M.sand, { front: false });
  // Steps up from the barbican yard to the gate passage.
  for (let i = 0; i < 9; i++) k.box(9.4 + i * 0.45, B.y - 0.2, g0 - 0.6, 13.5, B.y + (i + 1) * 0.222, g1 + 0.6, M.flags);

  // East barbican: the garden, a faceted wall with three turrets, the water gate.
  const G = GARDEN;
  k.box(G.x0, G.y - 0.25, -1, G.x1, G.y, G.z1, M.earth);
  const gTop = G.y + 6.0;
  // (The garden's south wall stands in front of the section plane, cut away like the south curtain.)
  k.box(104.6, G.y - 0.25, -1, G.x1 + 0.2, G.y + 0.5, 0.25, M.lime);
  k.box(G.x1 - 0.2, -5, -1, G.x1 + 1.6, gTop, G.z1 + 1.4, M.lime, { left: M.limeBase });  // east wall, weathered inside
  k.box(G.x1 - 0.24, G.y, 9.0, G.x1 - 0.19, gTop - 0.9, 14.6, mat({ c: '#f6f2e8', c2: '#ebe6da', pat: 'speckle' })); // fresh limewash, half done
  // Latrine chutes: outlets low on the outer faces with a brown stain below (and a gull).
  for (const [x, y, z, ry] of [[TOWERS.nw.x - 5.97, 0.6, 33.2, 0]]) {
    const s = ry === 0 ? -1 : 1;
    k.box(x - 0.06 * -s, y, z - 0.35, x + 0.02 * -s, y + 0.5, z + 0.35, M.dark);
    k.box(x - 0.03 * -s, y - 3.0, z - 0.45, x + 0.01 * -s, y, z + 0.45, mat({ c: '#7a6a4a', c2: '#6a5a3a', pat: 'speckle' }));
  }
  battlementsLine(k, -1, G.z1 + 1.4, G.x1 + 1.25, gTop, 'z', M.lime, { pitch: 2.1 });
  k.box(G.x0, -1.2, G.z1, 104.4, gTop, G.z1 + 1.4, M.lime);           // north wall (west part)
  battlementsLine(k, G.x0, 104.4, G.z1 + 1.05, gTop, 'x', M.lime, { pitch: 2.1 });
  for (const tz of [3.5, 13, 22.5]) {
    const tx = G.x1 + 1.3, r = 1.9;
    k.lathe([[r, -5], [r, gTop + 0.6], [0, gTop + 0.6]], tx, tz, M.lime, { seg: 20, capBot: false });
    battlementsRing(k, tx, tz, r, r - 0.45, gTop + 0.6, 6, M.lime, { seg: 20, breast: 0.6, mh: 0.95 });
  }
  // The water gate: a stair inside the barbican's north side, down to the river dock.
  k.box(104.4, DOCK.y - 0.4, G.z1, 106.4, G.y, 31.0, M.flags);                        // landing
  k.box(106.4, DOCK.y - 0.4, G.z1 + 0.6, 116.6, -0.2, G.z1 + 1.4, M.lime);           // retaining wall by the garden
  k.box(104.4, DOCK.y - 0.4, 31.0, 117.6, -0.2, 31.8, M.lime);                         // outer wall
  const st = 26;
  for (let i = 0; i < st; i++) {
    const x = 106.4 + (i * 10.2) / st;
    k.box(x, DOCK.y - 0.4, G.z1 + 1.4, x + 10.2 / st + 0.01, G.y + ((DOCK.y - G.y) * (i + 1)) / st, 31.0, M.flags);
  }
  block(k, 116.6, 117.6, DOCK.y - 0.4, -0.2, G.z1 + 1.4, 31.8, [[116.5, 117.7, DOCK.y, DOCK.y + 2.6, 27.4, 29.6]], M.lime);
  // Timber dock on piles.
  k.box(DOCK.x0, DOCK.y - 0.25, DOCK.z0, DOCK.x1, DOCK.y, DOCK.z1, M.boards);
  for (let x = DOCK.x0 + 0.5; x < DOCK.x1; x += 2.2) for (const z of [DOCK.z0 + 0.3, DOCK.z1 - 0.3]) k.cyl(x, -14, z, 0.16, 14 + DOCK.y - 0.25, M.oakGrey, { seg: 7 });
}

// ------------------------------------------------------------------ ranges
// A pitched roof along x: covered north slope, bare timber skeleton on the south slope
// (cut back to show the trusses), gable ends at x0 and x1.
export function roofX(k, x0, x1, zS, zN, plate, ridge, opt = {}) {
  const zr = (zS + zN) / 2;
  const th = 0.22;
  // North slope covering.
  k.extrudeX([[zr, ridge + th], [zr, ridge], [zN + 0.5, plate - 0.3], [zN + 0.5, plate - 0.3 + th]], x0 - 0.3, x1 + 0.3, M.roof, { end: M.roof });
  // Boards under the covering.
  k.extrudeX([[zr - 0.05, ridge - 0.02], [zr - 0.05, ridge - 0.1], [zN + 0.3, plate - 0.38], [zN + 0.3, plate - 0.3]], x0, x1, M.roofUnder, { end: M.roofUnder });
  // A narrow strip of covering along the south eave and ridge, so the cut-back reads as a cut.
  k.extrudeX([[zS - 1.2, plate - 0.3 + th], [zS - 1.2, plate - 0.3], [zS + 0.6, plate + 0.3], [zS + 0.6, plate + 0.3 + th]], x0 - 0.3, x1 + 0.3, M.roof, { end: M.roof });
  // Trusses: principal rafters, collar, arch braces, wall posts on corbels.
  const n = Math.max(2, Math.round((x1 - x0) / (opt.bay || 3.9)));
  const sl = (z) => (z < zr ? plate + ((z - (zS - 1.2)) / (zr - (zS - 1.2))) * (ridge - plate) : ridge - ((z - zr) / (zN + 0.5 - zr)) * (ridge - plate + 0.3));
  const trusses = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + 0.3 + ((x1 - x0 - 0.6) * i) / n;
    trusses.push(x);
    const t = 0.28;
    k.beam([x, plate - 0.15, zS - 0.6], [x, ridge - 0.12, zr], t, M.oakDark);
    k.beam([x, ridge - 0.12, zr], [x, plate - 0.25, zN + 0.2], t, M.oakDark);
    const cy = plate + (ridge - plate) * 0.62;
    const cz0 = zr - (zr - zS) * 0.38, cz1 = zr + (zN - zr) * 0.38;
    k.beam([x, cy, cz0], [x, cy, cz1], 0.22, M.oakDark);
    if (opt.posts !== false) {
      for (const [zw, dir] of [[zS + 0.25, 1], [zN - 0.25, -1]]) {
        const py = plate - 2.0;
        k.beam([x, py, zw], [x, plate, zw], 0.24, M.oakDark);
        k.box(x - 0.2, py - 0.35, zw - dir * 0.05, x + 0.2, py, zw + dir * 0.35, M.rubble); // stone corbel
        const zc = dir > 0 ? cz0 : cz1;
        k.beam([x, py + 0.9, zw], [x, cy - 0.1, zc], 0.17, M.oakDark);
      }
    }
  }
  // Ridge piece and purlins.
  k.box(x0, ridge - 0.3, zr - 0.1, x1, ridge - 0.05, zr + 0.1, M.oakDark);
  for (const f of [0.33, 0.66]) {
    const zS2 = zS - 1.2 + (zr - zS + 1.2) * f;
    k.box(x0, sl(zS2) - 0.32, zS2 - 0.11, x1, sl(zS2) - 0.1, zS2 + 0.11, M.oakDark);
    const zN2 = zr + (zN + 0.5 - zr) * f;
    k.box(x0, sl(zN2) - 0.4, zN2 - 0.11, x1, sl(zN2) - 0.18, zN2 + 0.11, M.oakDark);
  }
  // Common rafters on the exposed south slope.
  for (let x = x0 + 0.2; x < x1; x += 1.3) k.beam([x, plate + 0.05, zS - 1.2], [x, ridge + 0.02, zr - 0.1], 0.1, M.oak);
  // Gables.
  for (const [ga, gb] of opt.gables || []) k.extrudeX([[zS - 1.2, plate - 0.3], [zN + 0.5, plate - 0.3], [zr, ridge + 0.05]], ga, gb, M.lime, { end: opt.gableEnd || M.plasterRed });
  return trusses;
}

// The hall range: lesser hall, small chamber, great hall, cross passage and chapel, over rock-cut cellars.
export function hallRange(k) {
  const H = HALL;
  const wz0 = H.z1, wz1 = H.back;
  // Back (courtyard) wall: cellar part in rubble, upper part with the hall windows.
  k.box(H.x0 - 1.6, H.cellar - 0.05, wz0, H.x1, H.floor, wz1, M.rubble, { back: M.lime });
  const holes = [];
  const lancets = (cx, sill, spring, w = 0.55) => {
    holes.push(archPts(cx - w / 2 - 0.11, sill, w, spring).map(([x, y]) => [x, y]));
    holes.push(archPts(cx + w / 2 + 0.11, sill, w, spring).map(([x, y]) => [x, y]));
    const ring = [];
    for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; ring.push([cx + Math.cos(a) * 0.26, spring + 0.95 + Math.sin(a) * 0.26]); }
    holes.push(ring);
  };
  lancets(27.0, 2.6, 4.7);                // lesser hall
  lancets(38.2, 2.4, 5.0); lancets(43.8, 2.4, 5.0); // great hall, two-light windows with bar tracery
  lancets(56.4, 2.6, 4.9);                // chapel side window
  holes.push(archPts(48.8, H.floor + 0.02, 1.6, 2.6));      // porch door to the courtyard
  holes.push([[33.0, 3.0], [33.9, 3.0], [33.9, 4.4], [33.0, 4.4]]); // small chamber window
  const upper = [[H.x0 - 1.6, H.floor], [H.x1, H.floor], [H.x1, H.plate], [H.x0 - 1.6, H.plate]];
  k.extrude(upper, wz0, wz1, M.lime, { holes, front: M.plasterRed, back: M.lime, reveal: M.sand });
  // Tracery mullions and door.
  for (const cx of [27.0, 38.2, 43.8, 56.4]) k.box(cx - 0.11, 2.4, wz0 + 0.5, cx + 0.11, 5.4, wz0 + 0.7, M.sand);
  // Floors: timber over the cellars, on joists; rushes strewn in the halls.
  // (A stairwell is left open at the west end of the lesser hall, x 23.3..27.8, z 7.5..9.)
  k.box(H.x0, H.floor - 0.35, -1, H.x1, H.floor, 7.5, M.boards);
  k.box(27.8, H.floor - 0.35, 7.5, H.x1, H.floor, wz0, M.boards);
  for (let x = H.x0 + 0.5; x < H.x1; x += 1.1) k.box(x - 0.13, H.floor - 0.68, -0.6, x + 0.13, H.floor - 0.35, x < 27.9 ? 7.4 : wz0, M.oak);
  k.box(H.x0, H.floor, -1, H.walls.lesser - 0.3, H.floor + 0.02, 7.5, M.rushes);
  k.box(H.walls.small + 0.3, H.floor, -1, H.walls.great - 0.3, H.floor + 0.02, wz0, M.rushes);
  k.box(H.walls.great + 0.3, H.floor, -1, H.walls.passage - 0.3, H.floor + 0.02, wz0, M.flags);
  k.box(H.x0, H.cellar - 0.2, -1, H.x1, H.cellar, wz0, M.earth);
  // Cross walls up to the roof line, each with a doorway (cellar walls under the great hall and chapel).
  const zr = (-1.2 + wz1) / 2;
  const partition = (xc, t, door, lower, gable = true) => {
    const x0 = xc - t / 2, x1 = xc + t / 2;
    const [d0, d1, dh] = door;
    const ylo = lower ? H.cellar - 0.05 : H.floor;
    k.box(x0, ylo, -1, x1, H.plate, d0, M.plasterRed);
    k.box(x0, ylo, d1, x1, H.plate, wz0, M.plasterRed);
    k.box(x0, H.floor + dh, d0, x1, H.plate, d1, M.plasterRed);
    if (lower) { k.box(x0, H.cellar - 0.05, d0, x1, H.floor - 0.35, d0 + 0.0001 + 0, M.rubble); }
    if (gable) k.extrudeX([[-1.2, H.plate], [wz0, H.plate], [zr, H.ridge - 0.25]], x0, x1, M.plasterRed);
  };
  partition(H.walls.lesser, 0.6, [4.6, 5.8, 2.4], false);
  partition(H.walls.small, 0.6, [5.2, 6.4, 2.4], true);
  partition(H.walls.great, 0.6, [3.2, 4.6, 2.6], false);
  partition(H.walls.passage, 0.6, [3.2, 4.6, 2.6], true);
  // Cellar dividing walls with low doorways (rubble).
  for (const xc of [H.walls.small, H.walls.passage]) {
    k.box(xc - 0.3, H.cellar - 0.05, -1, xc + 0.3, H.floor - 0.35, 2.2, M.rubble);
    k.box(xc - 0.3, H.cellar - 0.05, 3.6, xc + 0.3, H.floor - 0.35, wz0, M.rubble);
    k.box(xc - 0.3, H.cellar + 2.1, 2.2, xc + 0.3, H.floor - 0.35, 3.6, M.rubble);
  }
  // West end wall (fireplace side of the lesser hall) and the chapel's east wall with its three-light window.
  k.box(H.x0 - 1.6, H.cellar - 0.05, -1, H.x0, H.plate, wz0, M.rubble, { right: M.plasterRed });
  const eastHoles = [];
  for (const dz of [-1.0, 0, 1.0]) eastHoles.push(archPts(4.4 + dz, 2.8, 0.62, dz === 0 ? 5.4 : 5.0));
  // East wall as an extrusion in z-y: build with extrude in x-y rotated is not available, so use boxes around the lights.
  const ex0 = H.x1, ex1 = H.x1 + 1.0;
  k.box(ex0, H.cellar - 0.05, -1, ex1, 2.8, wz1, M.plasterRed);
  k.box(ex0, 2.8, -1, ex1, H.plate, 3.05, M.plasterRed);
  k.box(ex0, 2.8, 5.75, ex1, H.plate, wz1, M.plasterRed);
  k.box(ex0, 6.4, 3.05, ex1, H.plate, 5.75, M.plasterRed);
  for (const zc of [3.4, 4.4, 5.4]) {
    k.box(ex0 - 0.02, 2.8, zc - 0.31, ex0 + 0.4, zc === 4.4 ? 6.2 : 5.7, zc + 0.31, M.opening);
  }
  for (const zc of [3.9, 4.9]) k.box(ex0 - 0.05, 2.8, zc - 0.09, ex0 + 0.5, 6.4, zc + 0.09, M.sand);
  k.box(ex0 - 0.06, 2.65, 3.0, ex0 + 0.3, 2.8, 5.8, M.sand);
  void eastHoles;
  // Roof over the whole range.
  const tr = roofX(k, H.x0 - 1.6, H.x1 + 1.0, -1.2 + 1.2, wz1, H.plate, H.ridge, { bay: 3.9, gables: [[H.x0 - 1.6, H.x0], [H.x1, H.x1 + 1.0]] });
  return tr;
}

// The royal apartments in the inner ward: ground-floor service rooms, king's hall and king's chamber above.
export function royalRange(k) {
  const R = ROYAL;
  const wz0 = R.z1, wz1 = R.back;
  const holes = [];
  // Ground floor: small square windows. First floor: tall square-headed windows with tracery.
  for (const cx of [77.5, 82.5, 90]) holes.push([[cx - 0.4, 1.4], [cx + 0.4, 1.4], [cx + 0.4, 2.6], [cx - 0.4, 2.6]]);
  for (const cx of [77.0, 83.0, 90.0]) {
    holes.push([[cx - 0.75, 4.6], [cx - 0.08, 4.6], [cx - 0.08, 7.0], [cx - 0.75, 7.0]]);
    holes.push([[cx + 0.08, 4.6], [cx + 0.75, 4.6], [cx + 0.75, 7.0], [cx + 0.08, 7.0]]);
  }
  holes.push(archPts(80.0, 0.02, 1.4, 2.3));
  k.extrude([[R.x0, -0.3], [R.x1, -0.3], [R.x1, R.plate], [R.x0, R.plate]], wz0, wz1, M.lime, { holes, front: M.plasterRed, back: M.lime, reveal: M.sand });
  // Relieving arches over the first-floor windows (seen on the courtyard face).
  for (const cx of [77.0, 83.0, 90.0]) k.extrude(archPts(cx, 7.05, 1.9, 7.2).filter((p) => p[1] >= 7.05), wz1, wz1 + 0.06, M.sand, {});
  // Floors.
  k.box(R.x0, -0.35, -1, R.x1, 0, wz0, M.flags);
  k.box(R.x0, R.first - 0.35, -1, R.x1, R.first, wz0, M.boards);
  for (let x = R.x0 + 0.5; x < R.x1; x += 1.1) k.box(x - 0.13, R.first - 0.65, -0.6, x + 0.13, R.first - 0.35, wz0, M.oak);
  // Partition between hall and chamber, both storeys, with doors; end walls.
  const zr = (-1.2 + wz1) / 2;
  const px = R.mid;
  k.box(px - 0.35, 0, -1, px + 0.35, R.plate, 3.4, M.plasterRed);
  k.box(px - 0.35, 0, 4.6, px + 0.35, R.plate, wz0, M.plasterRed);
  k.box(px - 0.35, 2.3, 3.4, px + 0.35, R.first + 0.0, 4.6, M.plasterRed);
  k.box(px - 0.35, R.first + 2.4, 3.4, px + 0.35, R.plate, 4.6, M.plasterRed);
  k.extrudeX([[-1.2, R.plate], [wz0, R.plate], [zr, R.ridge - 0.25]], px - 0.35, px + 0.35, M.plasterRed);
  k.box(R.x0 - 0.4, -0.3, 5.2, R.x0, R.plate, wz1, M.lime, { right: M.plasterRed });
  roofX(k, R.x0 - 0.4, R.x1 + 0.2, 0, wz1, R.plate, R.ridge, { bay: 4.0, gables: [[R.x0 - 0.4, R.x0], [R.x1 - 0.3, R.x1 + 0.2]] });
}

// Timber lean-to buildings against the north curtain, fronts cut away to show inside.
// parts: [{x0, x1, name}] separated by daub partitions.
export function leanTo(k, x0, x1, parts, opt = {}) {
  const L = LEAN;
  const zf = opt.zf || L.z0, zb = NCURT.z0, eave = opt.eave || L.eave, top = opt.top || L.top;
  const floorM = opt.floor || M.earth;
  k.box(x0, -0.02, zf, x1, 0.04, zb, floorM);
  // Roof: covered on its upper half against the wall; the lower half is cut back to its
  // rafters so the rooms show from above (as on the hall roofs).
  const ry = (z) => eave - 0.15 + ((z - (zf - 0.6)) / (zb - (zf - 0.6))) * (top - eave + 0.15);
  const zm = (zf + zb) / 2 + 0.4;
  k.extrudeX([[zm, ry(zm)], [zb, top], [zb, top + 0.22], [zm, ry(zm) + 0.22]], x0 - 0.2, x1 + 0.2, opt.roof || M.roof);
  k.extrudeX([[zf - 0.6, eave - 0.15], [zf + 0.5, ry(zf + 0.5)], [zf + 0.5, ry(zf + 0.5) + 0.22], [zf - 0.6, eave + 0.07]], x0 - 0.2, x1 + 0.2, opt.roof || M.roof);
  k.extrudeX([[zm, ry(zm) - 0.06], [zb, top - 0.06], [zb, top], [zm, ry(zm)]], x0, x1, M.roofUnder);
  for (const f of [0.45, 0.72]) { const z = zf + (zb - zf) * f; k.box(x0, ry(z) - 0.2, z - 0.09, x1, ry(z) - 0.02, z + 0.09, M.oakDark); }
  for (let x = x0 + 0.3; x < x1; x += 1.0) k.beam([x, eave - 0.32, zf - 0.5], [x, top - 0.2, zb], 0.14, M.oakDark);
  // Front frame: sill, posts, wall plate, braces. Walls between posts are cut away.
  k.box(x0, 0.0, zf - 0.12, x1, 0.25, zf + 0.12, M.frame);
  k.box(x0, eave - 0.45, zf - 0.14, x1, eave - 0.2, zf + 0.14, M.frame);
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 2.6))) {
    k.box(x - 0.12, 0.25, zf - 0.12, x + 0.12, eave - 0.45, zf + 0.12, M.frame);
  }
  // Partitions (daub panels in a timber frame) and end walls.
  const bounds = [x0].concat(parts.slice(1).map((p) => p.x0)).concat([x1]);
  bounds.forEach((bx, i) => {
    const t = 0.18;
    const yTop = (z) => eave - 0.2 + ((z - zf) / (zb - zf)) * (top - eave);
    const prof = [[zf, 0], [zb, 0], [zb, yTop(zb) - 0.2], [zf, yTop(zf) - 0.25]];
    k.extrudeX(prof, bx - t / 2, bx + t / 2, M.daub, { end: M.daub });
    k.box(bx - 0.1, 0, zf, bx + 0.1, yTop(zf) - 0.25, zf + 0.2, M.frame);
    k.box(bx - 0.1, 0, zb - 0.2, bx + 0.1, yTop(zb) - 0.2, zb, M.frame);
    k.beam([bx, 0.2, zf + 0.2], [bx, yTop(zb) - 0.4, zb - 0.2], 0.14, M.frame);
    void i;
  });
}

// The east range (great chamber over a cellar) and the granary, in the inner ward.
export function innerNorth(k) {
  // East range along the east curtain: closed, seen from the courtyard.
  const x0 = 88.4, x1 = 94.0, z0 = 9.2, z1 = 24.8;
  const holes = [archPts((z0 + z1) / 2 - 2.5, 0.02, 1.2, 2.0).map(([z, y]) => [z, y])];
  k.box(x0, -0.3, z0, x1, 8.4, z1, M.lime);
  // Big west window of the great chamber and a door below (drawn on the west face).
  k.box(x0 - 0.06, 4.6, 14.6, x0, 7.6, 16.4, M.sand);
  k.box(x0 - 0.08, 4.8, 14.8, x0 - 0.02, 7.4, 15.42, mat({ c: '#c8d8dc', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.3 }));
  k.box(x0 - 0.08, 4.8, 15.58, x0 - 0.02, 7.4, 16.2, mat({ c: '#c8d8dc', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.3 }));
  k.box(x0 - 0.06, 0, 19.0, x0, 2.4, 20.4, M.dark);
  k.box(x0 - 0.06, 1.2, 11.0, x0, 2.2, 11.8, M.dark);
  void holes;
  const zr = (z0 + z1) / 2;
  // Roof with the ridge along z.
  k.extrude([[x0 - 0.5, 8.1], [(x0 + x1) / 2, 11.0], [x1 + 0.3, 8.1], [x1 + 0.3, 8.35], [(x0 + x1) / 2, 11.25], [x0 - 0.5, 8.35]], z0 - 0.3, z1, M.roof);
  void zr;
}
