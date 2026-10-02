/* Salisbury 1245: the works yard west of the church and the gear of the building site.
 *
 * Zones 3 to 9 and 12 to 21 of the dossier. Where the lodge, tracing floor and workshops
 * actually stood is not recorded; this arrangement is illustrative. The section plane on
 * the church's axis slices through the yard buildings too, opening them like the church.
 */
import { mat, props } from '../../engine/index.js';
import {
  M, BAY, bayX, PIERX, PZ, WZ0, WZ1, AZ0, CAP, ARC, PLATE, RIDGE, ZMIN, A_SPRING,
  archY, lancetPts, prism, mapXY, mapZY, wallZ, platform, pole, ladder,
} from './common.js';
import { AISLE_H, UPPER_H } from './church.js';

const STRAW = mat({ c: '#d8c07a', c2: '#c0a660', pat: 'thatch', s: 0.2 });
const CLOTH = mat({ c: '#d8ccb0', c2: '#c8bca0', pat: 'canvas', thin: true });
const CHIPS = mat({ c: '#e4dfd2', c2: '#cfc8b8', pat: 'speckle' });

// Thatched roof along x: ridge at (zr, yr), eaves at y ye on both sides (z0, z1).
function thatchRoof(k, x0, x1, zr, yr, z0, z1, ye, th = 0.35) {
  const prof = [[z0, ye], [zr, yr], [z1, ye], [z1, ye + th], [zr, yr + th * 1.3], [z0, ye + th]];
  k.extrudeX(prof, x0, x1, M.thatch);
}

// ------------------------------------------------------------------ the masons' lodge and tracing loft
export const LODGE = { x0: -22, x1: -8, z0: -2.6, z1: 6.8, loft: 3.7, bankers: [] };
function lodge(k) {
  const { x0, x1, z0, z1, loft } = LODGE;
  const T = M.timberFrame;
  // Posts, sill beams and wall plates.
  for (let x = x0; x <= x1 + 0.01; x += 3.5) for (const z of [z0, z1]) k.box(x - 0.13, 0, z - 0.13, x + 0.13, 4.0, z + 0.13, T);
  for (const z of [z0, z1]) k.box(x0 - 0.15, 3.85, z - 0.15, x1 + 0.15, 4.1, z + 0.15, T);
  // Back wall of wattle and daub with its timber frame.
  k.box(x0, 0.0, z1, x1, 3.85, z1 + 0.18, M.daub);
  for (let x = x0 + 1.75; x < x1; x += 3.5) k.box(x - 0.08, 0, z1 - 0.04, x + 0.08, 3.85, z1, T);
  k.box(x0, 1.9, z1 - 0.04, x1, 2.05, z1, T);
  // End walls (the west gable lights the tracing loft).
  const sl = (8.15 - 3.75) / (2.1 - (z0 - 0.9));
  const gw = [{ cx: 2.1, w: 1.0, sill: 5.0, apex: 6.6 }, { cx: 1.3, w: 1.2, sill: 0, apex: 2.3 }];
  gw.gable = [[z1 + 0.18, 3.9], [2.1, 8.15], [ZMIN, 8.15 - sl * (2.1 - ZMIN)]];
  wallZ(k, ZMIN, z1 + 0.18, x0 - 0.18, x0, 0, 7.5, gw, M.daub);
  wallZ(k, ZMIN, z1 + 0.18, x1, x1 + 0.18, 0, 4.0, [{ cx: 2.0, w: 1.6, sill: 0, apex: 2.4 }], M.daub);
  // Thatched roof.
  thatchRoof(k, x0 - 0.6, x1 + 0.6, 2.1, 8.2, z0 - 0.9, z1 + 0.9, 3.75);
  for (let x = x0 + 0.3; x < x1; x += 1.0) {
    k.beam([x, 4.0, Math.max(ZMIN, z0)], [x, 8.1, 2.1], 0.12, M.oakOld);
    k.beam([x, 8.1, 2.1], [x, 4.0, z1], 0.12, M.oakOld);
  }
  // The tracing loft: a thin plaster floor over boards, scratched with full-size arcs.
  k.box(x0, loft - 0.18, ZMIN, -12, loft - 0.02, z1, M.boards);
  k.box(x0, loft - 0.02, ZMIN, -12, loft + 0.05, z1, M.plaster);
  for (let x = x0 + 1.0; x < -12; x += 2.5) k.box(x - 0.12, loft - 0.42, ZMIN, x + 0.12, loft - 0.18, z1, M.oakOld);
  k.box(-12.15, loft - 0.18, ZMIN, -12, loft + 0.9, z1, M.boards); // loft edge rail
  // Big iron compasses, a straightedge and a cord pinned to the floor.
  k.beam([-18.2, loft + 0.06, 2.0], [-17.0, loft + 1.1, 2.3], 0.04, M.iron);
  k.beam([-17.0, loft + 1.1, 2.3], [-15.9, loft + 0.06, 2.6], 0.04, M.iron);
  k.box(-20.6, loft + 0.05, 4.4, -16.4, loft + 0.09, 4.52, M.oak);
  k.rope([-14.4, loft + 0.07, 0.9], [-12.8, loft + 0.07, 4.6], 0.012, M.rope, 0.0, 4);
  // A full-size lancet head drawn out, the arc picked out in a scratched line.
  const arc = lancetPts(-17.6, 2.6, 0.0, 3.4, 12).pts;
  const pts = arc.slice(2).map(([x, y]) => [x, loft + 0.065, 0.6 + y]);
  k.tube(pts, 0.012, mat('#7a7468'), { seg: 3 });
  // Templates of thin board on pegs along the back wall.
  for (let i = 0; i < 9; i++) {
    const x = -11.4 + i * 0.36;
    if (i % 3 === 0) prism(k, [[0, 0], [0.3, 0], [0.3, 0.55], [0.12, 0.62], [0, 0.4]], [], (u, v, d) => [x + u, 2.25 + v, d], z1 - 0.06, z1 - 0.02, M.boards);
    else k.box(x, 2.3 + (i % 2) * 0.15, z1 - 0.06, x + 0.26, 2.9, z1 - 0.02, M.boards);
  }
  for (let i = 0; i < 6; i++) k.box(-21.4 + i * 0.5, 2.1, z1 - 0.06, -21.1 + i * 0.5, 2.85 - (i % 3) * 0.12, z1 - 0.02, M.boards);
  // Bankers: waist-high stone benches, each with a block being dressed.
  const rows = [[-21.0, 2.6], [-19.2, 2.6], [-17.4, 2.6], [-15.6, 2.6], [-13.8, 2.6], [-20.1, 0.5], [-16.5, 0.5]];
  const r = k.rng('bankers');
  LODGE.bankers = [];
  for (const [i, [x, zb]] of rows.entries()) {
    k.box(x - 0.55, 0, zb, x + 0.55, 0.72, zb + 0.8, M.stone);
    const w = 0.55 + r() * 0.35, h = 0.3 + r() * 0.25;
    if (i % 3 === 1) {
      // a rib voussoir with its moulding roughed out
      prism(k, [[-w / 2, 0], [w / 2, 0], [w / 2, h * 0.6], [w * 0.2, h], [-w * 0.2, h], [-w / 2, h * 0.6]], [], (u, v, d) => [x + u, 0.72 + v, d], zb + 0.15, zb + 0.65, M.stoneNew);
    } else k.box(x - w / 2, 0.72, zb + 0.12, x + w / 2, 0.72 + h, zb + 0.7, M.stoneNew);
    for (let c = 0; c < 6; c++) { const cx = x - 0.7 + r() * 1.4, cz = zb - 0.3 + r() * 1.6; k.box(cx - 0.05, 0, cz - 0.04, cx + 0.05, 0.05, cz + 0.04, CHIPS); }
    LODGE.bankers.push([x, 0, zb + 1.35]);
  }
  // The marbler's corner: a Purbeck shaft on trestles, being trued and polished.
  for (const x of [-12.0, -10.6]) { k.beam([x, 0, 2.5], [x, 0.7, 2.8], 0.05, M.oakOld); k.beam([x, 0, 3.1], [x, 0.7, 2.8], 0.05, M.oakOld); }
  k.cyl(-12.4, 0.86, 2.8, 0.16, 2.2, M.purbeck, { axis: 'x', seg: 10 });
  k.cyl(-12.4, 0.86, 2.8, 0.161, 0.9, M.purbeckRaw, { axis: 'x', seg: 10 });
  LODGE.marble = [-11.3, 0, 3.35];
  // The glazier's whitewashed table with a panel drawn out full size, and his little kiln.
  props.table(k, -9.4, 0, 2.5, { w: 1.4, d: 0.9, h: 0.8, items: false, top: '#f0ece2' });
  k.box(-9.9, 0.8, 2.65, -8.9, 0.805, 3.25, mat({ c: '#f2efe6', c2: '#6a7068', pat: 'panes', s: 0.14 }));
  for (const [dx, c] of [[-0.35, '#c4cdbf'], [-0.1, '#9a3a34'], [0.15, '#3e5a96'], [0.4, '#c4cdbf']]) k.box(-9.4 + dx - 0.08, 0.8, 2.55, -9.4 + dx + 0.08, 0.81, 2.62, mat(c));
  k.lathe([[0.45, 0], [0.48, 0.5], [0.35, 0.95], [0.12, 1.1]], -8.6, 5.7, M.clay, { seg: 12 });
  k.box(-8.75, 0.15, 5.22, -8.45, 0.4, 5.26, mat({ c: '#ff9a40', glow: 'always', c2: '#ffb060', noEdge: true }));
  LODGE.glass = [-9.4, 0, 3.75];
  // A gaming board scratched on a bench, and a daisy-wheel hexafoil on a post (vignette 3).
  props.bench(k, -13.0, 0, 5.6, { w: 1.6, color: '#8a6a42' });
  k.box(-13.35, 0.451, 5.68, -12.95, 0.455, 5.88, mat({ c: '#b89a6a', c2: '#5a4a32', pat: 'checker', s: 0.05 }));
  k.cyl(-15.0, 1.6, z0 + 0.135, 0.17, 0.01, mat({ c: '#a08060', c2: '#5a4430', pat: 'rings', s: 0.06 }), { axis: 'z', seg: 14 });
  // A stag carved on a corbel block waiting by the wall (vignette 14).
  k.box(-18.7, 0, 5.4, -18.1, 0.5, 6.0, M.stoneNew);
  k.box(-18.6, 0.5, 5.5, -18.2, 0.62, 5.9, M.stoneNew);
  k.beam([-18.45, 0.62, 5.55], [-18.6, 0.85, 5.5], 0.03, M.stoneNew); k.beam([-18.35, 0.62, 5.55], [-18.2, 0.85, 5.5], 0.03, M.stoneNew);
  // Water barrel, tool rack, sacks; the haunch of venison under one of them (vignette 6).
  props.barrel(k, -21.0, 0, 5.4, { r: 0.35, h: 0.9 });
  props.sack(k, -11.2, 0, 5.9, { color: '#b8a070' });
  k.sphere(-10.7, 0.12, 6.2, 0.14, mat({ c: '#7a3a2a' }), { seg: 8, rings: 5 });
  props.sack(k, -10.6, 0, 6.0, { color: '#a89068' });
  // Straw where itinerant masons sleep in the loft.
  k.box(-21.7, loft + 0.05, 5.0, -18.6, loft + 0.2, 6.6, STRAW);
  // The watchman's straw in the corner, and a lantern hook.
  k.box(-9.6, 0, 4.6, -8.3, 0.18, 6.4, STRAW);
  props.lamp(k, -15.5, 3.5, 2.2, { kind: 'lantern', drop: 0.4, r: 7.5, i: 1.1, flicker: true });
  props.lamp(k, -10.0, 3.9, 2.2, { kind: 'lantern', drop: 0.6, r: 6.5, i: 1.0, flicker: true });
  props.lamp(k, -17.0, 7.2, 3.2, { kind: 'lantern', drop: 0.6, r: 5, i: 0.7, flicker: true });
  // The apprentice's wren, cut on the hidden bed of a block (vignette 1).
  k.box(-13.2, 0, 0.6, -12.3, 0.45, 1.2, M.stoneNew);
  k.sphere(-12.75, 0.46, 0.9, 0.05, mat('#9a948a'), { seg: 6, rings: 4 });
}

// ------------------------------------------------------------------ smithy
export const SMITHY = { hearth: [-26.0, 0.9, 3.9], anvil: [-24.6, 0, 2.2] };
function smithy(k) {
  const T = M.timberFrame;
  for (const x of [-27.9, -22.3]) for (const z of [-1.6, 5.0]) k.box(x - 0.12, 0, z - 0.12, x + 0.12, z > 0 ? 4.4 : 3.2, z + 0.12, T);
  k.box(-28.0, 0, 5.0, -22.2, 4.4, 5.18, M.daub);
  wallZ(k, 2.6, 5.18, -28.15, -27.95, 0, 4.3, [], M.daub);
  const prof = [[-2.4, 2.95], [5.6, 4.55], [5.6, 4.8], [-2.4, 3.2]];
  k.extrudeX(prof, -28.4, -21.9, mat({ c: '#7a6a58', c2: '#5e5040', pat: 'planks', s: 0.3, cut: '#8a6a48' }));
  // Hearth with its hood and chimney.
  k.box(-27.0, 0, 3.2, -25.0, 0.85, 4.8, mat({ c: '#8a8070', c2: '#6a6050', pat: 'stone', s: 0.25, cut: '#7a7060', cutPat: true }));
  k.box(-26.6, 0.85, 3.5, -25.4, 0.95, 4.5, M.soot);
  k.box(-27.0, 2.2, 3.4, -25.0, 2.6, 5.0, M.soot);
  k.box(-26.4, 2.6, 4.0, -25.6, 6.0, 4.9, mat({ c: '#6a6058', c2: '#4a4440', pat: 'stone', s: 0.25 }));
  k.lamp(-26.0, 1.1, 3.9, { always: true, color: '#ff7a30', r: 5.5, i: 1.1, flicker: true, bulb: false, halo: 0.9 });
  k.sphere(-26.0, 0.96, 3.95, 0.22, mat({ c: '#ff9a40', c2: '#ffb050', glow: 'always', noEdge: true }), { seg: 8, rings: 4 });
  props.anvil(k, -24.6, 0, 2.0);
  props.barrel(k, -23.3, 0, 3.3, { r: 0.38, h: 0.65, color: '#6a5038' }); // quenching tub
  k.cyl(-22.92, 0.58, 3.68, 0.34, 0.04, M.water, { seg: 12 });
  // Rack of chisels and punches waiting to be re-steeled.
  k.box(-24.4, 1.4, 4.95, -22.7, 1.5, 5.0, T);
  for (let i = 0; i < 14; i++) k.box(-24.3 + i * 0.12, 1.15, 4.9, -24.28 + i * 0.12, 1.42, 4.94, M.iron);
  props.crate(k, -27.4, 0, 3.4, { w: 0.6, h: 0.4, color: '#3a3430' }); // charcoal
}

// ------------------------------------------------------------------ bell-casting pit
export const BELL = { x: -30.4, z: 0.4, floor: -2.5, core2: [-29.2, 2.4] };
const bellOuter = (t) => [0.62 - 0.2 * Math.pow(t, 0.8) - 0.04 * Math.sin(t * Math.PI), BELL.floor + t * 1.05]; // r, y
function bellPit(k) {
  const { x, z, floor } = BELL;
  // Cope (outer mould), the bell-shaped gap where the false bell was, and the loam core.
  const n = 10, outer = [], inner = [];
  for (let i = 0; i <= n; i++) { const t = i / n; const [r, y] = bellOuter(t); outer.push([r, y]); inner.push([Math.max(0.02, r - 0.09), y]); }
  const cope = [[0.95, floor], [0.95, floor + 1.25], [0.12, floor + 1.32]].concat(outer.slice().reverse().map(([r, y]) => [r + 0.005, y]));
  k.lathe(cope, x, z, M.loam, { seg: 20, capTop: false, capBot: false });
  k.lathe([[0, floor]].concat(inner).concat([[0, inner[inner.length - 1][1]]]), x, z, M.clay, { seg: 20, capTop: false, capBot: false });
  k.cyl(x, floor + 1.32, z, 0.06, 0.12, M.clay, { seg: 8 }); // pouring cup
  // A second core on its spindle, being shaped with a strickle board (the board turns: setup).
  const [cx, cz] = BELL.core2;
  k.lathe([[0.0, floor], [0.55, floor], [0.5, floor + 0.4], [0.4, floor + 0.8], [0.18, floor + 0.98], [0, floor + 1.0]], cx, cz, M.clay, { seg: 16 });
  k.cyl(cx, floor, cz, 0.03, 1.5, M.oakOld, { seg: 5 });
  // Timber shoring of the pit sides and a ladder down.
  for (const zz of [3.45]) k.box(-32.7, floor, zz, -28.3, 0, zz + 0.12, M.boards);
  k.box(-28.42, floor, ZMIN, -28.3, 0, 3.6, M.boards); k.box(-32.7, floor, ZMIN, -32.58, 0, 3.6, M.boards);
  ladder(k, -31.8, floor, 0.9, 2.9, 3.35, 0.45);
  // The furnace on the pit edge, with its bellows and a clay channel towards the mould.
  k.lathe([[0.75, 0], [0.8, 0.6], [0.6, 1.4], [0.35, 1.8], [0.3, 2.2]], -31.0, 6.0, M.clay, { seg: 14, capTop: false });
  k.lathe([[0.26, 2.2], [0.3, 2.2]], -31.0, 6.0, M.soot, { seg: 14 });
  k.box(-31.25, 0.0, 3.6, -30.75, 0.16, 5.3, M.clay);
  k.lamp(-31.0, 0.6, 5.2, { always: true, color: '#ff8a3a', r: 3.6, i: 0.9, flicker: true, bulb: false, halo: 0.6 });
  k.box(-31.15, 0.25, 5.18, -30.85, 0.5, 5.24, mat({ c: '#ff9a40', glow: 'always', c2: '#ffb060', noEdge: true }));
  props.sack(k, -32.6, 0, 6.2, { color: '#3a3430' });
  // Strickle boards and a heap of loam.
  k.box(-29.6, 0, 5.4, -28.6, 0.04, 6.6, M.boards);
  k.lathe([[1.0, 0], [0.6, 0.35], [0.0, 0.5]], -33.6, 2.5, M.loam, { seg: 10 });
}

// ------------------------------------------------------------------ clerk's booth, lime pits, stall, stone
export const CLERK = { seat: [-6.5, 0, 2.6] };
function booth(k) {
  const T = M.timberFrame;
  for (const [x, z] of [[-7.9, 0.2], [-5.1, 0.2], [-7.9, 3.6], [-5.1, 3.6]]) k.box(x - 0.08, 0, z - 0.08, x + 0.08, z > 1 ? 2.8 : 2.3, z + 0.08, T);
  k.extrudeX([[-0.2, 2.25], [3.9, 2.85], [3.9, 2.95], [-0.2, 2.35]], -8.2, -4.8, M.boards);
  props.table(k, -6.5, 0, 1.0, { w: 1.6, d: 0.6, h: 0.78, items: false, top: '#5a4028' });
  // Tally sticks, a wax tablet, the money box and a balance.
  for (let i = 0; i < 7; i++) k.box(-7.1 + i * 0.06, 0.78, 1.15, -7.08 + i * 0.06, 0.8, 1.45, M.oak);
  k.box(-6.6, 0.78, 1.2, -6.3, 0.8, 1.42, mat('#2a2420'));
  k.box(-6.62, 0.8, 1.22, -6.32, 0.805, 1.4, mat('#c8a050'));
  props.chest(k, -5.6, 0.78, 1.1, { w: 0.34, h: 0.2, d: 0.26, color: '#4a3020' });
  k.cyl(-7.4, 0.78, 1.5, 0.015, 0.4, M.iron, { seg: 4 });
  k.box(-7.62, 1.17, 1.48, -7.18, 1.19, 1.52, M.iron);
  for (const dx of [-0.2, 0.2]) k.cyl(-7.4 + dx, 1.02, 1.5, 0.07, 0.015, M.bronze, { seg: 8 });
  props.chair(k, -6.5, 0, 1.85, { face: -1, color: '#5a4028' });
}

function limePits(k) {
  // Slaked lime filling the pit (white in the section), sand heap, mortar trough, hoes.
  k.box(-4.7, -0.85, ZMIN, -0.9, -0.42, 2.5, M.lime);
  k.box(-4.8, -0.06, 2.5, -0.8, 0.12, 2.62, M.boards);
  k.lathe([[1.5, 0], [1.1, 0.45], [0.5, 0.85], [0, 0.95]], -2.6, 5.6, M.sand, { seg: 14 });
  k.box(-6.4, 0, 4.6, -4.8, 0.45, 5.4, M.boards);
  k.box(-6.3, 0.3, 4.7, -4.9, 0.42, 5.3, M.lime);
  for (const [a, b] of [[[-5.2, 0, 4.4], [-4.4, 1.6, 4.2]], [[-1.0, 0, 4.2], [-0.4, 1.5, 4.0]]]) { k.beam(a, b, 0.04, M.oakOld); k.box(a[0] - 0.12, 0, a[2] - 0.05, a[0] + 0.12, 0.18, a[2] + 0.02, M.iron); }
  props.barrel(k, -7.6, 0, 5.0, { r: 0.3, h: 0.7, color: '#8a7050' });
  // A wheelbarrow, new technology (first recorded 1222): parked by the sand.
  barrow(k, -1.3, 0, 6.9, 0);
}

export function barrow(k, x, y, z, rot) {
  void rot;
  k.box(x - 0.45, y + 0.35, z - 0.28, x + 0.35, y + 0.62, z + 0.28, M.boards);
  k.beam([x - 1.15, y + 0.62, z - 0.25], [x + 0.5, y + 0.3, z - 0.25], 0.05, M.oakOld);
  k.beam([x - 1.15, y + 0.62, z + 0.25], [x + 0.5, y + 0.3, z + 0.25], 0.05, M.oakOld);
  k.cyl(x + 0.55, y + 0.22, z - 0.04, 0.22, 0.08, M.oakOld, { axis: 'z', seg: 10 });
  k.box(x - 0.6, y, z - 0.25, x - 0.55, y + 0.35, z - 0.2, M.oakOld); k.box(x - 0.6, y, z + 0.2, x - 0.55, y + 0.35, z + 0.25, M.oakOld);
}

export const STALL = { pot: [-42.2, 0, 1.4] };
function stall(k) {
  props.table(k, -43.4, 0, 2.0, { w: 2.6, d: 0.8, h: 0.8, items: 'bread', top: '#8a6a42' });
  props.cauldron(k, -41.4, 0, 3.3, { r: 0.36, contents: '#8a6a3a' });
  k.lamp(-41.05, 0.15, 3.65, { always: true, color: '#ff8a40', r: 2.2, i: 0.6, flicker: true, bulb: false, halo: 0.3 });
  for (let i = 0; i < 4; i++) k.cyl(-44.2 + i * 0.3, 0.8, 2.2, 0.05, 0.11, mat('#8a6040'), { seg: 8 });
  k.cyl(-42.4, 0.8, 2.4, 0.09, 0.32, mat('#7a5a3a'), { seg: 10, r2: 0.06 }); // ale jug
  props.barrel(k, -45.3, 0, 3.2, { r: 0.32, h: 0.8 });
  // An awning on two poles.
  pole(k, -44.9, 3.9, 0, 2.4, 0.05); pole(k, -40.9, 3.9, 0, 2.4, 0.05);
  k.quad([-45.1, 2.35, 4.0], [-40.7, 2.35, 4.0], [-40.7, 2.05, 1.6], [-45.1, 2.05, 1.6], CLOTH);
  props.chair(k, -44.0, 0, 3.15, { face: -1, color: '#6a4a2a' });
}

function stones(k) {
  const r = k.rng('stones');
  // Rough blocks from Chilmark stacked on timber skids; some carry quarry marks in red ochre.
  for (let row = 0; row < 3; row++) {
    const z = 2.0 + row * 1.25;
    k.box(-39.0, 0, z + 0.1, -33.6, 0.14, z + 0.22, M.oakOld); k.box(-39.0, 0, z + 0.8, -33.6, 0.14, z + 0.92, M.oakOld);
    let x = -38.9;
    while (x < -34.0) {
      const w = 0.7 + r() * 0.6, h = 0.5 + r() * 0.3;
      k.box(x, 0.14, z, x + w, 0.14 + h, z + 1.0, M.stoneOut);
      if (r() < 0.6) k.box(x + w * 0.3, 0.3, z - 0.005, x + w * 0.45, 0.42, z, M.ochre);
      if (row < 2 && r() < 0.5) k.box(x + 0.1, 0.14 + h, z + 0.1, x + w - 0.1, 0.14 + h + 0.45, z + 0.9, M.stoneOut);
      x += w + 0.1;
    }
  }
  // Timber in stacks, a trough for the oxen, a heap of rubble for the wall cores.
  for (let i = 0; i < 6; i++) k.cyl(-46.5, 0.2 + (i % 3) * 0.38, 12.0 + Math.floor(i / 3) * 0.4 + (i % 3) * 0.05, 0.19, 6.5, M.oakOld, { axis: 'x', seg: 8 });
  k.box(-45.8, 0, 4.2, -44.0, 0.5, 4.8, M.boards);
  k.box(-45.7, 0.3, 4.3, -44.1, 0.45, 4.7, M.water);
  k.lathe([[1.6, 0], [1.0, 0.5], [0, 0.8]], -36.2, 12.4, M.rubble, { seg: 10 });
  // Reused stones from Old Sarum (verified), one with its Romanesque chevrons (vignette 4).
  k.box(13.4, 0, 10.2, 14.4, 0.55, 10.9, M.stoneOut);
  const zz = [];
  for (let i = 0; i <= 8; i++) zz.push([13.45 + i * 0.11, 0.18 + (i % 2) * 0.22]);
  prism(k, zz.concat([[14.33, 0.1], [13.45, 0.1]]), [], mapXY, 10.17, 10.2, mat('#9a948a'));
}

// ------------------------------------------------------------------ on the nave floor
export const SEATS = [7.0, 8.5, 10.0, 15.2, 16.7, 18.2, 19.7];
export const CAST = { bed: [44.5, 52.5, 0.3, 1.7], pot: [53.8, 0, 1.0] };
function naveFloor(k) {
  // Setting-out cords on pegs along the line of the west front and bay 1.
  const peg = (x, z) => k.box(x - 0.03, 0, z - 0.03, x + 0.03, 0.35, z + 0.03, M.oakOld);
  for (const [a, b] of [[[0.0, 0.3], [0.0, 14.8]], [[6.0, 11.0], [11.0, 11.0]], [[6.0, 14.6], [11.0, 14.6]]]) { peg(...a); peg(...b); k.rope([a[0], 0.3, a[1]], [b[0], 0.3, b[1]], 0.008, mat('#e8e0c8'), 0.003, 6); }
  // Planks bridging the open trench of the west front.
  for (const z of [1.62, 1.95]) k.box(-0.8, 0.0, z, 2.6, 0.06, z + 0.3, M.boards);
  // A lantern on a post by the lead stack, for the watchman.
  k.box(43.0, 0, 3.8, 43.1, 2.2, 3.9, M.oakOld);
  k.lamp(43.05, 2.3, 3.85, { r: 4.5, i: 0.8, color: '#ffbe66', bulbR: 0.07, halo: 0.6, flicker: true });
  // Plumbers' casting bed: a long frame of sand, a sheet newly cast, the melting pot on its fire.
  const [b0, b1, z0, z1] = CAST.bed;
  k.box(b0, 0, z0, b1, 0.12, z1, M.sand);
  for (const z of [z0 - 0.08, z1]) k.box(b0, 0, z, b1, 0.2, z + 0.08, M.oakOld);
  k.box(b0 + 0.2, 0.12, z0 + 0.12, b0 + 3.4, 0.135, z1 - 0.12, M.lead);
  for (let i = 0; i < 4; i++) k.box(b0 - 1.6, 0.0 + i * 0.03, 2.4, b0 - 0.2, 0.03 + i * 0.03, 3.4, M.lead); // stacked sheets
  const [px, , pz] = CAST.pot;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.box(px + Math.cos(a) * 0.55 - 0.15, 0, pz + 0.45 + Math.sin(a) * 0.55 - 0.12, px + Math.cos(a) * 0.55 + 0.15, 0.3, pz + 0.45 + Math.sin(a) * 0.55 + 0.12, M.rubble); }
  props.cauldron(k, px, 0.18, pz, { r: 0.42, contents: '#c8ccd0' });
  k.lamp(px, 0.2, pz + 0.45, { always: true, color: '#ff8a40', r: 3.0, i: 0.8, flicker: true, bulb: false, halo: 0.5 });
  k.box(px - 0.2, 0.02, pz + 0.3, px + 0.2, 0.14, pz + 0.6, mat({ c: '#ff9040', glow: 'always', c2: '#ffb060', noEdge: true }));
  // Carpenters' trestles and an arch centring frame being assembled on the ground.
  for (const x of [22.8, 24.6]) { k.beam([x, 0, 2.4], [x, 0.8, 2.7], 0.06, M.oakOld); k.beam([x, 0, 3.0], [x, 0.8, 2.7], 0.06, M.oakOld); }
  k.box(22.4, 0.8, 2.5, 25.0, 0.88, 2.9, M.oak);
  const cx = 32.2, cz = 3.6, a = 2.0;
  const pts = [];
  for (let i = 0; i <= 12; i++) { const u = -a + (2 * a * i) / 12; pts.push([cx + u, 0.25, cz + archY(u, a, 3.6) * 0.62]); }
  k.tube(pts, 0.09, M.oak, { seg: 5 });
  k.beam([cx - a, 0.25, cz], [cx + a, 0.25, cz], 0.14, M.oak);
  for (const u of [-1.2, 0, 1.2]) k.beam([cx + u, 0.25, cz], [cx + u, 0.25, cz + archY(u, a, 3.6) * 0.62], 0.1, M.oak);
  for (let i = 0; i < 5; i++) k.box(34.6, 0.05 + i * 0.1, 1.0, 37.8, 0.13 + i * 0.1, 1.6, M.boards); // lagging boards
  // The saw pit with a log on its trestles, half sawn into planks.
  k.cyl(25.0, 0.38, 1.0, 0.32, 6.0, M.oakOld, { axis: 'x', seg: 10 });
  k.box(27.6, 0.06, 0.66, 28.6, 0.7, 1.34, M.oak);
  for (const x of [26.0, 30.0]) k.box(x - 0.1, 0, 0.4, x + 0.1, 0.12, 1.6, M.oakOld);
  for (let i = 0; i < 5; i++) k.box(26.2 + i * 0.7, -1.75, 0.6, 26.6 + i * 0.7, -1.68, 1.4, mat('#d8b880'));
  k.box(25.65, -1.75, 0.5, 25.75, 0, 1.5, M.boards); k.box(30.25, -1.75, 0.5, 30.35, 0, 1.5, M.boards);
  barrow(k, 20.4, 0, 5.6, 0);
  // Rough blocks where the men sit at dinner in bays 1 to 3.
  for (const x of SEATS) k.box(x - 0.42, 0, 3.75, x + 0.42, 0.45, 4.3, M.stoneOut);
}

// ------------------------------------------------------------------ scaffolds and centring
// Lifts and ladders of the two scaffolds, recorded for the walking graph.
export const SCAF = { tallZ: 4.6, tall: [], tallLadders: [], putZ: 10.8, put: [], putLadders: [], roofLadder: null, hatch: [59.5, 60.8] };
function scaffolds(k) {
  SCAF.tall = []; SCAF.tallLadders = []; SCAF.put = []; SCAF.putLadders = [];
  // Tall scaffold inside the nave against bays 7 and 8 (illustrative lifts).
  const x0 = bayX(7) + 0.3, x1 = bayX(8) + BAY - 0.3, zf = 3.7, zb = 5.5;
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 6) pole(k, x, zf, 0, 24.2);
  const lifts = [[4.2, x0], [8.6, x0], [12.8, x0], [16.4, x0], [19.8, x0], [22.9, bayX(8) + 0.2]];
  const lx = [x0 + 0.8, x1 - 0.8, x0 + 0.8, x1 - 0.8, x1 - 1.8];
  lifts.forEach(([y, xa], i) => {
    platform(k, xa, x1, y, zf - 0.2, zb, { step: 1.9, into: 0.5 });
    k.box(xa, y + 0.9, zf - 0.25, x1, y + 0.96, zf - 0.19, M.pole);
    SCAF.tall.push({ y, x0: xa + 0.2, x1: x1 - 0.2 });
    if (i < lifts.length - 1) { ladder(k, lx[i], y, lifts[i + 1][0] + 0.9, zf + 0.25, zf + 0.6); SCAF.tallLadders.push(lx[i]); }
  });
  ladder(k, x0 + 0.8, 0, lifts[0][0] + 0.9, zf - 0.5, zf + 0.3);
  SCAF.tallLadders.unshift(x0 + 0.8);
  // Ladder from the top lift up to the tie beams of bay 9.
  ladder(k, x1 - 0.5, 22.9, PLATE + 1.0, 4.3, 4.9);
  SCAF.roofLadder = x1 - 0.5;
  // Diagonal braces, zig-zagging up the face of the scaffold.
  for (let i = 0; i < 5; i++) { const a = i % 2 ? x0 + 5.2 : x0 + 1.6, b = i % 2 ? x0 + 1.6 : x0 + 5.2; k.beam([a, 1.0 + i * 4.3, zf - 0.08], [b, 5.0 + i * 4.3, zf - 0.08], 0.06, M.pole); }

  // Putlog scaffold against the aisle wall of bays 4 to 6, its putlogs resting in the wall.
  // Each lift runs along the bays whose wall has already reached it.
  const p1 = bayX(6) + BAY - 0.4, zs = 10.0;
  const startFor = (y) => { for (let b = 4; b <= 6; b++) if (AISLE_H[b - 1] >= y + 0.9) return bayX(b) + 0.4; return null; };
  for (let x = bayX(4) + 0.4; x <= p1 + 0.01; x += (p1 - bayX(4) - 0.4) / 8) {
    const b = Math.min(6, Math.max(4, Math.floor((x - bayX(4)) / BAY) + 4));
    pole(k, x, zs, 0, Math.min(11.0, AISLE_H[b - 1] + 1.6));
  }
  const ys = [2.2, 4.4, 6.6, 8.8];
  ys.forEach((y, i) => {
    const xa = startFor(y);
    if (xa == null) return;
    platform(k, xa, p1, y, zs - 0.2, AZ0 - 0.05, { step: 1.4, into: 0.25 });
    SCAF.put.push({ y, x0: xa + 0.2, x1: p1 - 0.2 });
  });
  SCAF.put.forEach((L, i) => {
    const prev = i === 0 ? 0 : SCAF.put[i - 1].y;
    const x = L.x0 + 0.5 + (i % 2) * 1.6;
    ladder(k, x, prev, L.y + 0.9, zs - 0.6, zs - 0.05);
    SCAF.putLadders.push(x);
  });
  // Gin pole for the ground windlass, lashed to the scaffold in bay 5 (zone 12).
  pole(k, bayX(5) + 3.6, AZ0 - 0.9, 0, 10.4, 0.1);
  k.beam([bayX(5) + 3.6, 10.2, AZ0 - 0.9], [bayX(5) + 3.6, 10.2, AZ0 - 2.0], 0.12, M.pole);
  k.cyl(bayX(5) + 3.6, 10.0, AZ0 - 1.9, 0.14, 0.08, M.oak, { axis: 'x', seg: 10 });

  // Centring under the arcade arches of bays 4 and 5 (the bay 6 frame already struck).
  for (const b of [4, 5]) centring(k, bayX(b) + BAY / 2, (BAY - 1.7) / 2, b === 4);
  // Aisle vault centring in bays 7 and 8: a stage at springing level with rib frames on it.
  for (const b of [7, 8]) {
    const xa = bayX(b), xb = xa + BAY, ya = A_SPRING - 0.3;
    for (const x of [xa + 0.6, xb - 0.6]) for (const z of [WZ1 + 0.5, AZ0 - 0.5]) pole(k, x, z, 0, ya, 0.08);
    k.box(xa + 0.4, ya - 0.2, WZ1 + 0.3, xb - 0.4, ya, AZ0 - 0.3, M.boards);
    for (const [ax, az, bx, bz] of [[xa, WZ1, xb, AZ0], [xa, AZ0, xb, WZ1]]) {
      const pts = [];
      for (let i = 1; i < 12; i++) {
        const u = i / 12, x = ax + (bx - ax) * u, z = az + (bz - az) * u;
        const xc = (xa + xb) / 2, zc = (WZ1 + AZ0) / 2;
        const y = A_SPRING + Math.max(archY(x - xc, BAY / 2, 12 - A_SPRING), archY(z - zc, (AZ0 - WZ1) / 2, 12 - A_SPRING)) - 0.35;
        pts.push([x, y, z]);
      }
      k.tube(pts, 0.08, M.oak, { seg: 4 });
      for (const p of pts.filter((_, i) => i % 3 === 1)) k.beam([p[0], ya, p[2]], p, 0.07, M.oak);
    }
    if (b === 7) for (let i = 0; i < 4; i++) k.box(xa + 1.2 + i * 0.9, 10.8 - Math.abs(i - 1.5) * 0.3, WZ1 + 1.0, xa + 1.9 + i * 0.9, 10.9 - Math.abs(i - 1.5) * 0.3, AZ0 - 1.0, M.boards);
  }
  // Platform boards on the tie beams of bays 9 and 10, around the great wheel.
  k.box(bayX(9) + 0.4, PLATE + 0.32, 0.4, SCAF.hatch[0], PLATE + 0.38, 4.2, M.boards);
  k.box(SCAF.hatch[1], PLATE + 0.32, 0.4, CROSSX() - 0.4, PLATE + 0.38, 4.2, M.boards);
  // Long sill beams that carry the wheel across the tie beams.
  for (const z of [0.55, 3.75]) k.box(bayX(9) + 4.0, PLATE + 0.32, z - 0.15, CROSSX() - 0.4, PLATE + 0.6, z + 0.15, M.oak);
}
const CROSSX = () => 61.5;

// Timber centring under an arcade arch: a curved rib on each face, struts, a tie at
// capital level, posts to the floor standing on folding wedges.
function centring(k, cx, a, partial) {
  const rise = 3.8, y0 = CAP + 0.2;
  for (const z of [WZ0 + 0.15, WZ1 - 0.15]) {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const u = -a + 0.05 + ((2 * a - 0.1) * i) / 14; pts.push([cx + u, y0 + archY(u, a, rise) - 0.12, z]); }
    k.tube(pts, 0.09, M.oak, { seg: 5 });
    k.beam([cx - a, CAP - 0.05, z], [cx + a, CAP - 0.05, z], 0.16, M.oak);
    for (const u of [-a * 0.6, 0, a * 0.6]) k.beam([cx + u, CAP - 0.05, z], [cx + u, y0 + archY(u, a, rise) - 0.15, z], 0.1, M.oak);
  }
  // Lagging across the top of the frame.
  for (let i = 1; i < 12; i++) { const u = -a + (2 * a * i) / 12; const y = y0 + archY(u, a, rise) - 0.02; k.box(cx + u - 0.08, y - 0.06, WZ0 + 0.05, cx + u + 0.08, y, WZ1 - 0.05, M.boards); }
  for (const u of [-a + 0.4, a - 0.4]) {
    for (const z of [WZ0 + 0.15, WZ1 - 0.15]) pole(k, cx + u, z, 0.2, CAP - 0.1, 0.09);
    k.box(cx + u - 0.2, 0, WZ0 - 0.1, cx + u + 0.2, 0.2, WZ1 + 0.1, M.oakOld); // folding wedges on a sole plate
  }
  void partial;
}

export function buildSite(k) {
  lodge(k);
  smithy(k);
  bellPit(k);
  booth(k);
  limePits(k);
  stall(k);
  stones(k);
  naveFloor(k);
  scaffolds(k);
}
void PIERX; void PZ; void ARC; void RIDGE; void UPPER_H; void mapZY;
