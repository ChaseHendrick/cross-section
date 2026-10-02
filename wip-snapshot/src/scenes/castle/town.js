/* Conwy Castle: the edge of the walled town, the ramp up to the castle and the drawbridge pit.
 * Houses are [illustrative]: timber-framed with daub panels and thatch. The front row is
 * cut open like the castle; the rest are seen from outside, their shutters lit at night. */
import { mat, props } from '../../engine/index.js';
import { M, TOWN_Y, GATE_Z } from './common.js';
import { pallet } from './furniture.js';
import { A } from './rooms.js';

const T = TOWN_Y;
const glowWin = mat({ c: '#5a4630', c2: '#ffc070', glow: 'night', pat: 'bars', s: 0.12 });

function house(k, x0, x1, z0, z1, opt = {}) {
  const fl = T, up = T + 2.6, eave = T + 5.0, ridge = T + 8.0;
  const along = opt.along !== false; // ridge along x
  const wall = opt.stone ? M.lime : M.daub;
  // Ground floor (beaten earth), upper floor on joists.
  k.box(x0, fl - 0.05, z0, x1, fl + 0.02, z1, M.earth);
  k.box(x0 + 0.2, up - 0.22, z0, x1 - 0.2, up, z1 - 0.2, M.boards);
  // Walls: back and sides (and the front when not cut).
  const t = 0.22;
  k.box(x0, fl, z1 - t, x1, eave, z1, wall);
  k.box(x0, fl, z0, x0 + t, eave, z1, wall);
  k.box(x1 - t, fl, z0, x1, eave, z1, wall);
  if (z0 >= 0) {
    k.box(x0, fl, z0, x1, eave, z0 + t, wall);
    const n = Math.max(1, Math.floor((x1 - x0) / 3));
    for (let i = 0; i < n; i++) {
      const cx = x0 + (x1 - x0) * ((i + 0.5) / n);
      k.box(cx - 0.4, up + 0.7, z0 - 0.04, cx + 0.4, up + 1.6, z0 + 0.02, glowWin);
      if (i === 0) k.box(cx - 0.5, fl, z0 - 0.04, cx + 0.5, fl + 2.0, z0 + 0.02, M.oakDark);
      else k.box(cx - 0.4, fl + 1.0, z0 - 0.04, cx + 0.4, fl + 1.8, z0 + 0.02, glowWin);
    }
  }
  // Timber frame on the visible faces (posts, rail, braces).
  if (!opt.stone) {
    const zf = z0 >= 0 ? z0 - 0.03 : null;
    for (const z of [zf, z1 - t - 0.01].filter((v) => v != null)) {
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(2, Math.round((x1 - x0) / 1.6))) k.box(x - 0.09, fl, z - 0.03, x + 0.09, eave, z + 0.03, M.frame);
      k.box(x0, up - 0.1, z - 0.03, x1, up + 0.08, z + 0.03, M.frame);
      k.box(x0, eave - 0.18, z - 0.03, x1, eave, z + 0.03, M.frame);
    }
  }
  // Roof: a thatched prism with gable ends.
  if (along) {
    const zr = (z0 + z1) / 2;
    k.extrudeX([[z0 - 0.5, eave - 0.3], [z1 + 0.5, eave - 0.3], [zr, ridge]], x0 - 0.4, x1 + 0.4, M.thatch);
  } else {
    const xr = (x0 + x1) / 2;
    k.extrude([[x0 - 0.5, eave - 0.3], [x1 + 0.5, eave - 0.3], [xr, ridge]], z0 - 0.4, z1 + 0.4, M.thatch);
  }
  return { fl, up, eave };
}

export function buildTown(k) {
  // Castle Square and streets (beaten earth is the ground material in the town).
  // The ramp: a stone causeway from the square up to the drawbridge.
  const g0 = GATE_Z[0] - 0.5, g1 = GATE_Z[1] + 0.5;
  k.extrude([[-24, T - 0.2], [-6.2, T - 0.2], [-6.2, -2.2], [-24, T + 0.1]], g0, g1, mat({ c: '#a8a296', c2: '#8e887c', pat: 'stone', s: 0.4, cut: '#8c8a83', cutPat: true }));
  for (const [za, zb] of [[g0 - 0.45, g0], [g1, g1 + 0.45]]) k.extrude([[-24, T + 0.1], [-6.2, -2.2], [-6.2, -1.2], [-24, T + 1.0]], za, zb, M.lime);
  // Pit walls below the drawbridge.
  k.box(-6.4, T - 0.2, g0 - 0.45, -6.2, -2.2, g1 + 0.45, M.lime);
  k.box(-6.2, T - 0.05, g0, -0.5, T + 0.02, g1, M.mud);

  // Front row, cut open: two houses with their families' rooms.
  const h1 = house(k, -46, -38, -1, 6.5);
  const h2 = house(k, -37.6, -30, -1, 6.5, { stone: false });
  for (const [hx, h] of [[-42, h1], [-33.8, h2]]) {
    // Central hearth with a cooking pot, a table and a bench below; beds and a chest above.
    k.box(hx - 0.7, h.fl, 2.6, hx + 0.7, h.fl + 0.18, 3.8, M.flags);
    props.cauldron(k, hx, h.fl + 0.18, 2.8, { r: 0.3, contents: '#7a6a3a' });
    k.lamp(hx, h.fl + 0.4, 3.2, { always: true, r: 3.6, i: 0.7, color: '#ff8a40', bulb: false, halo: 0.35, flicker: true });
    props.table(k, hx + 2.2, h.fl, 1.2, { w: 1.4, d: 0.7, items: 'bread', top: '#8a6038' });
    props.bench(k, hx + 2.2, h.fl, 2.05, { w: 1.3 });
    props.shelves(k, hx - 2.6, h.fl, 5.6, { w: 1.2, h: 1.6, n: 3, items: 'jars', d: 0.4 });
    props.ladder(k, hx - 3.2, h.fl, h.up, 4.2, { w: 0.4, lean: 0.3 });
    A.beds['town'] = A.beds['town'] || [];
    A.beds['town'].push(pallet(k, hx - 1.6, h.up, 4.6, { w: 1.7, d: 0.8, blanket: '#7a5a4a' }));
    A.beds['town'].push(pallet(k, hx + 1.0, h.up, 4.6, { w: 1.7, d: 0.8, blanket: '#5a6a7a' }));
    props.chest(k, hx + 2.6, h.up, 1.0, { w: 0.8 });
    k.lamp(hx, h.up + 1.6, 3.0, { r: 3.2, i: 0.4, color: '#ffc070', bulbR: 0.03, halo: 0.2, flicker: true });
    A.spots['house' + hx] = [hx + 1.2, h.fl, 2.4];
    A.spots['houseB' + hx] = [hx + 2.2, h.fl, 2.25];
  }
  // A smithy-style open workshop [illustrative] and a cut-open alehouse front.
  house(k, -29.6, -25, -1, 5.0);
  props.barrel(k, -27.8, T, 3.6, { r: 0.32, h: 0.85 }); props.barrel(k, -26.8, T, 3.8, { r: 0.32, h: 0.85 });
  props.table(k, -27.4, T, 1.0, { w: 1.6, d: 0.7, items: 'cup' });
  props.bench(k, -27.4, T, 0.55, { w: 1.4 });
  k.lamp(-27.4, T + 2.2, 2.0, { r: 3.4, i: 0.5, color: '#ffc070', bulbR: 0.03, halo: 0.22, flicker: true });
  A.spots['alehouse'] = [-27.6, T, 1.9]; A.spots['alehouse2'] = [-26.6, T, 1.9];

  // Houses behind the square and along the street to the west.
  const rows = [
    [-60, -50, 10, 17, true], [-49, -41, 10.5, 17, true], [-40, -33, 11, 17.5, true],
    [-70, -61, -1, 7, true], [-80, -71, 1, 8, true],
    [-58, -50, 24, 31, true], [-48, -40, 24, 30, true], [-39, -31, 25, 31, false],
    [-30, -22, 26, 33, true], [-21, -13, 30, 37, false], [-12, -4, 38, 45, true], [-58, -48, 40, 47, true],
    [-70, -62, 18, 26, false], [-36, -28, 40, 48, true],
  ];
  for (const [a, b, c, d, al] of rows) house(k, a, b, c, d, { along: al });
  // Market stalls in Castle Square, with awnings.
  for (const [sx, sz, col] of [[-20, 4.5, '#b84a32'], [-16, 7.5, '#d8c890'], [-21, 21.5, '#5a7a9a'], [-15, 23, '#b84a32']]) {
    k.box(sx - 1.0, T, sz, sx + 1.0, T + 0.85, sz + 0.8, M.oak);
    for (const px of [sx - 1.0, sx + 0.95]) for (const pz of [sz, sz + 0.75]) k.box(px, T, pz, px + 0.06, T + 2.2, pz + 0.06, M.oakDark);
    k.boxR(sx, T + 2.25, sz + 0.4, 2.3, 0.04, 1.2, mat({ c: col, c2: '#efe6d0', pat: 'stripes', s: 0.3, thin: true }), { x: -0.18 });
    for (let i = 0; i < 4; i++) k.sphere(sx - 0.7 + i * 0.45, T + 0.93, sz + 0.4, 0.1, mat(['#e8dcc0', '#c8904a', '#a8b4b8', '#f2ead8'][i % 4]), { seg: 6, rings: 4 });
  }
  A.spots['stall1'] = [-20, T, 3.6]; A.spots['stall2'] = [-16, T, 6.6]; A.spots['stall3'] = [-21, T, 20.6]; A.spots['stall4'] = [-15, T, 22.0];
  // A preaching or market cross [illustrative].
  const cx = -11.5, cz = 6.5;
  k.cyl(cx, T, cz, 1.1, 0.5, M.flags, { seg: 10 }); k.cyl(cx, T + 0.5, cz, 0.7, 0.4, M.flags, { seg: 10 });
  k.box(cx - 0.15, T + 0.9, cz - 0.15, cx + 0.15, T + 4.2, cz + 0.15, M.lime); k.box(cx - 0.6, T + 3.4, cz - 0.15, cx + 0.6, T + 3.65, cz + 0.15, M.lime);
  A.spots['cross'] = [cx, T, cz - 1.6];
}
