/* Salisbury 1245: fittings of the finished east end, and the lamps that light it.
 *
 * The quire stalls (made about 1236, verified), the high altar, tombs in the retrochoir,
 * the Trinity Chapel's altar and a plain tomb slab (never a shrine: see pitfalls), altars
 * in the transept chapels, a painter's hanging scaffold under the quire vault.
 */
import { mat, props } from '../../engine/index.js';
import { M, QUIRE, PRES, RETRO, TRIN, EWALL, ECROSS, CROSS, PZ, WZ0, AZ0, ZMIN, CROWN, TRAN_Z, ETRAN_Z, TRIN_Z } from './common.js';

export const STALLS = { seats: [], boys: [], z: 4.25, zb: 2.45, seatY: 0.62, boyY: 0.07 };
export const ALTAR = { x: 116.9, top: 1.64, step: 0.64 };
export const PAINTER = { x0: 80.4, x1: 84.6, y: 20.6 };

const CANDLE = mat({ c: '#f2ead0' });
function candle(k, x, y, z, h = 0.35, lamp = true, r = 2.6) {
  k.cyl(x, y, z, 0.022, h, CANDLE, { seg: 6 });
  if (lamp) k.lamp(x, y + h + 0.05, z, { r, i: 0.95, color: '#ffc46b', bulbR: 0.03, halo: 0.45, flicker: true });
}
function candlestick(k, x, y, z, h = 0.6) {
  k.lathe([[0.12, y], [0.1, y + 0.05], [0.03, y + 0.1], [0.025, y + h - 0.05], [0.07, y + h - 0.02], [0.07, y + h]], x, z, M.gold, { seg: 10 });
  candle(k, x, y + h, z, 0.3, true, 3.2);
}

function stalls(k) {
  STALLS.seats = []; STALLS.boys = [];
  const [x0, x1] = [QUIRE[0] + 1.8, QUIRE[1] - 0.6];
  const D = M.oakDark;
  const z = STALLS.z;
  // Raised platform, high backs, canopies, seats with arm divisions, desks in front.
  k.box(x0, 0.07, z - 1.0, x1, 0.4, WZ0 - 0.05, D);
  k.box(x0, 0.4, WZ0 - 0.35, x1, 3.3, WZ0 - 0.15, mat({ c: '#6e4a2c', c2: '#5a3a22', pat: 'panels', s: 0.42, cut: '#8a6038' }));
  const n = Math.floor((x1 - x0) / 0.82);
  const w = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * w;
    k.box(x - 0.04, 0.4, z - 0.3, x + 0.04, 1.35, WZ0 - 0.3, D);
    if (i < n) {
      const cx = x + w / 2;
      k.box(x + 0.05, STALLS.seatY + 0.18, z - 0.25, x + w - 0.05, STALLS.seatY + 0.24, WZ0 - 0.35, D);
      STALLS.seats.push([cx, 0.4, z]);
      // Canopy: a little gabled hood on two shafts.
      k.box(x + 0.02, 3.3, z - 0.55, x + w - 0.02, 3.42, WZ0 - 0.15, D);
      k.extrudeX([[z - 0.55, 3.42], [(z - 0.55 + WZ0 - 0.15) / 2, 4.05], [WZ0 - 0.15, 3.42]], x + 0.04, x + w - 0.04, D);
      k.cyl(x + 0.06, 1.35, z - 0.5, 0.03, 1.95, D, { seg: 5 });
    }
  }
  // Desk for the stalls with books, and candles every few seats.
  k.box(x0, 1.05, z - 0.95, x1, 1.12, z - 0.55, D);
  k.box(x0, 0.4, z - 0.95, x1, 1.05, z - 0.88, D);
  for (let x = x0 + 0.6; x < x1; x += 1.6) {
    k.box(x - 0.18, 1.12, z - 0.9, x + 0.18, 1.18, z - 0.6, mat({ c: '#7a2a20', c2: '#e8dcc0', pat: 'books' }));
    candle(k, x + 0.6, 1.12, z - 0.7, 0.28, true, 4.2);
  }
  // A warm glow over the stalls and forms from all those candles.
  for (let x = x0 + 2.5; x < x1; x += 5) k.lamp(x, 2.2, 3.0, { r: 7.5, i: 0.75, color: '#ffbf66', bulb: false, halo: false, flicker: true });
  // Lower forms for the choristers.
  k.box(x0 + 0.4, 0.07, STALLS.zb - 0.05, x1 - 0.4, 0.45, STALLS.zb + 0.3, D);
  k.box(x0 + 0.4, 0.9, STALLS.zb - 0.6, x1 - 0.4, 0.95, STALLS.zb - 0.32, D);
  k.box(x0 + 0.4, 0.07, STALLS.zb - 0.6, x1 - 0.4, 0.9, STALLS.zb - 0.55, D);
  for (let x = x0 + 1.0; x < x1 - 0.6; x += 0.62) STALLS.boys.push([x, 0.07, STALLS.zb + 0.1]);
  // The lectern on the axis, cut in half by the section, with its great book.
  const lx = (QUIRE[0] + QUIRE[1]) / 2 + 1;
  k.lathe([[0.32, 0.07], [0.24, 0.16], [0.07, 0.25], [0.06, 1.15], [0.12, 1.25]], lx, 0.2, M.bronze, { seg: 10 });
  k.boxR(lx, 1.38, 0.2, 0.7, 0.06, 0.55, M.bronze, { z: 0.35 });
  k.boxR(lx, 1.45, 0.2, 0.62, 0.08, 0.48, mat({ c: '#efe6cf', c2: '#7a2a20', pat: 'books' }), { z: 0.35 });
  candle(k, lx - 0.35, 1.25, 0.6, 0.3, true, 3.0);
  // Coronae (hanging rings of candles) over the quire.
  for (const x of [QUIRE[0] + 4.5, QUIRE[0] + 13.5]) {
    k.cyl(x, 6.0, 1.8, 0.006, CROWN - 6.4, mat('#3a3028'), { seg: 3 });
    k.lathe([[0.7, 5.9], [0.72, 6.0], [0.7, 6.05]], x, 1.8, M.iron, { seg: 16, capTop: false, capBot: false });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; candle(k, x + Math.cos(a) * 0.7, 6.05, 1.8 + Math.sin(a) * 0.7, 0.2, false); k.sphere(x + Math.cos(a) * 0.7, 6.3, 1.8 + Math.sin(a) * 0.7, 0.035, mat({ c: '#fff2c8', glow: 'night', c2: '#fff6d8', noEdge: true }), { seg: 6, rings: 4 }); }
    k.lamp(x, 6.2, 1.8, { r: 9, i: 1.1, color: '#ffc46b', bulb: false, halo: 1.2, flicker: true });
  }
}

function altars(k) {
  // High altar on its steps (x about 117: dossier zone 30), cut in half on the axis.
  const x = ALTAR.x, y = ALTAR.step;
  k.box(x - 0.8, y, ZMIN, x + 0.8, ALTAR.top, 1.6, M.stone);
  k.box(x - 0.86, y + 0.05, ZMIN, x - 0.8, ALTAR.top - 0.02, 1.6, M.frontal); // frontal
  k.box(x - 0.9, ALTAR.top, ZMIN, x + 0.9, ALTAR.top + 0.05, 1.7, M.linen);
  candlestick(k, x - 0.2, ALTAR.top + 0.05, 1.1, 0.5);
  candlestick(k, x - 0.2, ALTAR.top + 0.05, -0.3, 0.5);
  k.cyl(x + 0.3, ALTAR.top + 0.05, 0.4, 0.02, 0.9, M.gold, { seg: 6 });
  k.box(x + 0.27, ALTAR.top + 0.62, 0.15, x + 0.33, ALTAR.top + 0.68, 0.65, M.gold);
  // Riddel curtains on posts round the altar (illustrative).
  for (const zz of [2.1]) {
    k.cyl(x - 0.6, y, zz, 0.04, 2.6, M.gold, { seg: 6 }); k.cyl(x + 0.8, y, zz, 0.04, 2.6, M.gold, { seg: 6 });
    k.box(x - 0.6, y + 0.4, zz - 0.02, x + 0.8, y + 2.5, zz + 0.02, mat({ c: '#8a2a24', c2: '#b04a3a', pat: 'stripes', s: 0.2, thin: true }));
  }
  k.lamp(x - 0.6, ALTAR.top + 0.8, 0.5, { r: 6, i: 0.8, color: '#ffc46b', bulb: false, halo: false, flicker: true });
  // A hanging lamp before the altar.
  props.lamp(k, x - 2.4, 9.0, 1.0, { drop: 1.2, r: 6, i: 0.9, light: '#ffc46b', flicker: true, color: '#c8a050' });
  k.cyl(x - 2.4, 9.0, 1.0, 0.006, CROWN - 9.4, mat('#3a3028'), { seg: 3 });
  // A bench for the clergy (sedilia would stand in the south wall, cut away).
  props.bench(k, 111.5, 0.24, 4.2, { w: 2.4, color: '#5a3a22' });

  // Trinity Chapel: altar against the east wall, a plain tomb slab in the floor.
  const tx = EWALL[0] - 1.0;
  k.box(tx - 0.6, 0.04, ZMIN, tx + 0.7, 1.05, 1.4, M.stone);
  k.box(tx - 0.66, 0.08, ZMIN, tx - 0.6, 1.0, 1.4, M.frontal);
  k.box(tx - 0.7, 1.05, ZMIN, tx + 0.75, 1.1, 1.5, M.linen);
  candlestick(k, tx, 1.1, 1.0, 0.45); candlestick(k, tx, 1.1, -0.2, 0.45);
  k.lamp(tx - 0.8, 1.9, 0.8, { r: 6, i: 0.7, color: '#ffc46b', bulb: false, halo: false, flicker: true });
  k.box(TRIN[0] + 3.4, 0.04, 0.9, TRIN[0] + 5.6, 0.08, 2.0, M.pavingDark);
  // Retrochoir: tomb chests of the bishops (arrangement illustrative), one with an effigy.
  const R = RETRO[0];
  for (const [x, z, eff] of [[R + 3.6, 2.6, false], [R + 7.4, 8.6, true]]) {
    k.box(x - 1.15, 0.04, z, x + 1.15, 0.85, z + 1.0, M.stone);
    k.box(x - 1.2, 0.85, z - 0.05, x + 1.2, 0.95, z + 1.05, M.purbeck);
    if (eff) {
      k.box(x - 0.9, 0.95, z + 0.3, x + 0.7, 1.15, z + 0.7, mat({ c: '#c8c2b4', cut: '#a8a296' }));
      k.sphere(x - 0.85, 1.2, z + 0.5, 0.13, mat('#c8c2b4'), { seg: 8, rings: 5 });
      k.box(x - 1.12, 0.95, z + 0.25, x - 0.95, 1.4, z + 0.75, mat('#c8c2b4'));
    }
  }
  candle(k, R + 3.4, 0.95, 3.0, 0.25, true, 3.0);
  // Altars in the chapels of the transept's east aisle and the eastern transept.
  for (const z of [15.4, 21.4, 27.4]) {
    k.box(79.0, 0.04, z - 0.8, 79.5, 1.0, z + 0.8, M.stone);
    k.box(78.95, 0.1, z - 0.75, 79.0, 0.95, z + 0.75, M.frontal);
    candle(k, 79.25, 1.0, z - 0.5, 0.25, true, 3.0); candle(k, 79.25, 1.0, z + 0.5, 0.25, false);
  }
  k.box(ECROSS[1] - 0.6, 0.04, ETRAN_Z - 4.8, ECROSS[1], 1.0, ETRAN_Z - 3.2, M.stone);
  k.box(ECROSS[1] - 0.65, 0.1, ETRAN_Z - 4.75, ECROSS[1] - 0.6, 0.95, ETRAN_Z - 3.25, M.frontal);
  candle(k, ECROSS[1] - 0.3, 1.0, ETRAN_Z - 4.0, 0.25, true, 3.0);
}

function painter(k) {
  // A hanging scaffold under the quire vault for the painter (illustrative), slung on ropes.
  const { x0, x1, y } = PAINTER;
  k.box(x0, y - 0.08, 0.5, x1, y, 3.4, M.boards);
  k.box(x0, y, 3.32, x1, y + 0.9, 3.4, M.pole);
  for (const x of [x0 + 0.2, x1 - 0.2]) for (const z of [0.6, 3.3]) k.cyl(x, y, z, 0.015, CROWN - 0.6 - y, M.rope, { seg: 3 });
  // Paint pots, and the first border lines in red on the vault above (state in 1245 unknown).
  for (let i = 0; i < 3; i++) k.cyl(x0 + 0.6 + i * 0.25, y, 2.8, 0.07, 0.12, mat(['#a8402c', '#c89a3a', '#3a6a4a'][i]), { seg: 8 });
  k.cyl(82.5, CROWN - 0.38, 0.0, 1.2, 0.04, mat({ c: '#e8dcc0', c2: '#a8402c', pat: 'rings', s: 0.32, cut: '#a8402c' }), { seg: 20 });
  // A rope ladder up to it from the stall platform.
  k.rope([x0 + 0.3, y, 1.5], [x0 + 0.3, 0.07, 1.5], 0.012, M.rope, 0.0, 4);
  k.rope([x0 + 0.75, y, 1.5], [x0 + 0.75, 0.07, 1.5], 0.012, M.rope, 0.0, 4);
  for (let yy = 0.4; yy < y; yy += 0.4) k.cyl(x0 + 0.3, yy, 1.5, 0.012, 0.45, M.rope, { axis: 'x', seg: 3 });
  k.box(x0, y - 0.08, 0.5, x0 + 1.1, y, 3.4, M.boards);
}

// Night lamps in the east end so the church glows (candles before altars, a lamp at the screen).
function lamps(k) {
  // Night lights hanging in the aisles of the finished church.
  for (const x of [76.5, 88.5, 100.5, 112.0, 124.0]) props.lamp(k, x, 7.6, 9.4, { kind: 'lantern', drop: 1.2, r: 6.5, i: 0.85, light: '#ffc46b', flicker: true });
  for (const x of [106.2, 111.5]) props.lamp(k, x, 12.0, 2.5, { drop: 1.0, r: 7.5, i: 0.8, light: '#ffc46b', flicker: true, color: '#c8a050' });
  k.lamp(CROSS[0] + 0.8, 2.4, 2.8, { r: 4.0, i: 0.7, color: '#ffc46b', flicker: true, bulbR: 0.05 });
  k.lamp(TRIN[0] + 2.0, 3.0, 6.0, { r: 5.0, i: 0.6, color: '#ffc46b', flicker: true, bulbR: 0.04 });
  k.lamp(70.5, 1.6, 20.0, { r: 5.0, i: 0.5, color: '#ffc46b', flicker: true, bulbR: 0.04 });
  void TRAN_Z; void TRIN_Z; void AZ0; void PZ; void PRES;
}

export function buildFittings(k) {
  stalls(k);
  altars(k);
  painter(k);
  lamps(k);
}
