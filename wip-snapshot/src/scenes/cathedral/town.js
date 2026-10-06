/* Salisbury 1245: the masons' cottages east of the Close and the new town beyond.
 *
 * Masons are recorded living just east of the Close (VCH, verified); the cottages, their
 * furnishings, the pig and the well are illustrative. The town's grid of "chequers" is
 * drawn as a silhouette of timber houses.
 */
import { mat, props } from '../../engine/index.js';
import { M, ZMIN, prism, mapZY, wall } from './common.js';
import { groundH, riverX } from './ground.js';

export const COTTAGES = [];
export const HOMES = []; // hidden spots inside town houses where people go when off duty

const FRAME = M.timberFrame;
const WINDOW = mat({ c: '#3a3430', c2: '#ffcf7a', glow: 'night' });

function thatch(k, x0, x1, zr, yr, z0, z1, ye) {
  k.extrudeX([[z0, ye], [zr, yr], [z1, ye], [z1, ye + 0.3], [zr, yr + 0.4], [z0, ye + 0.3]], x0, x1, M.thatch);
}

// A cut-open cottage: one room with a central hearth, a bed, a chest, a loft for stores.
function cottage(k, x0, x1, idx) {
  const z0 = -2.8, z1 = 5.4, h = 2.6, zr = 1.3;
  const r = k.rng('cottage' + idx);
  k.box(x0, -0.05, ZMIN, x1, 0.04, z1, M.earth);
  // Walls: daub between dark posts and rails.
  wall(k, x0, x1, z1, z1 + 0.2, 0, h, [{ cx: x1 - 0.6, w: 0.75, sill: 0, apex: 1.95 }], M.daub);
  for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 3) k.box(x - 0.08, 0, z1 - 0.04, x + 0.08, h, z1 + 0.24, FRAME);
  k.box(x0, h - 0.15, z1 - 0.04, x1, h, z1 + 0.24, FRAME);
  k.box(x0, 1.1, z1 - 0.04, x1, 1.22, z1 + 0.24, FRAME);
  const gable = (x, a, b) => {
    const s = (5.6 - h) / (z1 + 0.6 - zr);
    const O = [[ZMIN, 0], [z1 + 0.2, 0], [z1 + 0.2, h], [zr, 5.6], [ZMIN, 5.6 - s * (zr - ZMIN)]];
    prism(k, O, [], mapZY, a, b, M.daub);
    k.box(a - 0.03, 0, z1 - 0.05, b + 0.03, h, z1 + 0.25, FRAME);
    k.box(a - 0.03, h - 0.1, ZMIN, b + 0.03, h + 0.05, z1 + 0.2, FRAME);
    void x;
  };
  gable(x0, x0 - 0.2, x0);
  if (idx === 2) gable(x1, x1, x1 + 0.2);
  thatch(k, x0 - 0.5, x1 + 0.5, zr, 5.75, z0 - 0.8, z1 + 0.9, h - 0.1);
  for (let x = x0 + 0.4; x < x1; x += 1.2) k.beam([x, h, z1], [x, 5.5, zr], 0.1, M.oakOld);
  // A shelf of stores along the back wall, above the bed.
  k.box(x0 + 0.1, 1.75, z1 - 0.45, x1 - 0.1, 1.8, z1, M.boards);
  props.sack(k, x0 + 0.8, 1.8, z1 - 0.5, { color: '#b8a070', w: 0.4, h: 0.4 });
  props.barrel(k, x1 - 0.8, 1.8, z1 - 0.5, { r: 0.18, h: 0.4 });
  // Central hearth on the floor, its embers glowing day and night.
  const hx = (x0 + x1) / 2 + 0.3, hz = 1.6;
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; k.box(hx + Math.cos(a) * 0.45 - 0.09, 0.0, hz + Math.sin(a) * 0.45 - 0.07, hx + Math.cos(a) * 0.45 + 0.09, 0.14, hz + Math.sin(a) * 0.45 + 0.07, M.rubble); }
  k.cyl(hx, 0.0, hz, 0.36, 0.05, mat({ c: '#c85a2a', c2: '#ff9a40', glow: 'always', noEdge: true }), { seg: 10 });
  k.lamp(hx, 0.5, hz, { always: true, color: '#ff8a40', r: 4.8, i: 0.7, flicker: true, bulb: false, halo: 0.4 });
  k.lamp(x0 + 2.3, 1.95, z1 - 0.3, { r: 2.6, i: 0.6, color: '#ffc070', bulbR: 0.025, halo: 0.25, flicker: true }); // a rushlight on the shelf
  props.cauldron(k, hx + 0.1, 0.12, hz - 0.3, { r: 0.24 });
  // Bed against the back wall, a pallet, a chest, a bench and table, a distaff.
  const bed = props.bed(k, x0 + 1.15, 0.04, z1 - 1.05, { w: 1.9, d: 1.0, h: 0.42, blanket: r.pick(['#8a6a4a', '#6a7a5a', '#8a5a4a']), frame: '#5a3a24' });
  const pallet = props.bed(k, x1 - 1.1, 0.04, 2.6, { w: 1.8, d: 0.8, h: 0.18, blanket: '#9a8a6a', frame: '#c8b080', headboard: false, head: 'right' });
  props.chest(k, x0 + 2.45, 0.04, z1 - 0.55, { w: 0.5, h: 0.42, d: 0.44 });
  props.table(k, x0 + 1.0, 0.04, 0.3, { w: 1.1, d: 0.6, h: 0.7, items: 'bread', top: '#7a5a3a' });
  const seat = props.bench(k, x0 + 1.0, 0.04, 1.0, { w: 1.1, d: 0.3 });
  k.lamp(x0 + 1.0, 1.2, 0.7, { r: 2.6, i: 0.6, color: '#ffc070', bulbR: 0.03, flicker: true });
  COTTAGES.push({ x0, x1, bed, pallet, seat, hearth: [hx, 0, hz], door: [x1 - 0.6, 0, z1 + 0.1] });
}

// A town house: closed walls (timber frame and daub), thatch or shingle roof, glowing windows.
function house(k, x, z, w, d, h, seed, roofAlong = 'x') {
  const y = Math.max(0, groundH(x + w / 2, z + d / 2));
  k.box(x, y - 0.3, z, x + w, y + h, z + d, M.daub);
  for (let i = 0; i <= 2; i++) k.box(x + (i * w) / 2 - 0.08, y, z - 0.03, x + (i * w) / 2 + 0.08, y + h, z, FRAME);
  k.box(x, y + h * 0.5, z - 0.03, x + w, y + h * 0.5 + 0.12, z, FRAME);
  k.box(x + w * 0.3, y + h * 0.62, z - 0.05, x + w * 0.42, y + h * 0.85, z - 0.01, WINDOW);
  k.box(x + w * 0.6, y + 0.0, z - 0.04, x + w * 0.78, y + 1.9, z - 0.01, mat('#5a4030'));
  const rm = seed % 3 === 0 ? mat({ c: '#8a7058', c2: '#6e5844', pat: 'slates', s: 0.3 }) : M.thatch;
  if (roofAlong === 'x') k.extrudeX([[z - 0.5, y + h - 0.1], [z + d / 2, y + h + d * 0.6], [z + d + 0.5, y + h - 0.1], [z + d + 0.5, y + h + 0.15], [z + d / 2, y + h + d * 0.6 + 0.3], [z - 0.5, y + h + 0.15]], x - 0.3, x + w + 0.3, rm);
  else k.extrude([[x - 0.5, y + h - 0.1], [x + w / 2, y + h + w * 0.6], [x + w + 0.5, y + h - 0.1], [x + w + 0.5, y + h + 0.15], [x + w / 2, y + h + w * 0.6 + 0.3], [x - 0.5, y + h + 0.15]], z - 0.3, z + d + 0.3, rm);
  HOMES.push([x + w / 2, y, z + d / 2]);
}

export function buildTown(k) {
  COTTAGES.length = 0; HOMES.length = 0;
  cottage(k, 146.5, 150.5, 0);
  cottage(k, 150.5, 154.5, 1);
  cottage(k, 154.5, 158.5, 2);
  // A pig sty and a well beside the cottages.
  for (let i = 0; i < 6; i++) k.box(145.0 + i * 0.5, 0, 6.2, 145.08 + i * 0.5, 0.8, 6.28, M.oakOld);
  k.box(145.0, 0.6, 6.2, 147.6, 0.68, 6.28, M.oakOld);
  k.lathe([[0.7, 0], [0.7, 0.8], [0.55, 0.8], [0.55, 0.1]], 159.6, 2.6, M.rubble, { seg: 14, capTop: false });
  k.cyl(159.6, 0.75, 2.6, 0.5, 0.04, M.water, { seg: 12 });
  for (const dz of [-0.75, 0.75]) k.box(159.55, 0, 2.6 + dz - 0.05, 159.65, 2.0, 2.6 + dz + 0.05, M.oakOld);
  k.box(159.55, 1.95, 1.8, 159.65, 2.05, 3.4, M.oakOld);
  // Washing on a line.
  k.rope([146.0, 1.9, 7.6], [151.0, 1.9, 7.6], 0.008, M.rope, 0.02, 6);
  for (let i = 0; i < 4; i++) k.box(146.6 + i * 1.1, 1.3, 7.58, 147.3 + i * 1.1, 1.88, 7.62, mat({ c: ['#e8e0cc', '#9aa4b0', '#c8b48a', '#e8e0cc'][i], thin: true }));
  // The town beyond, in its grid of chequers (silhouette illustrative).
  const r = k.rng('town');
  let s = 0;
  for (let row = 0; row < 7; row++) {
    const z = 9 + row * 9 + (row > 2 ? 6 : 0);
    for (let x = 145; x < 196; ) {
      const w = 4 + r() * 3.5;
      if (Math.abs(x + w / 2 - riverX(z + 3)) < 13) { x += w + 2; continue; }
      if (row < 1 && x < 160) { x += w; continue; }
      house(k, x, z, w, 5.0 + r() * 1.5, 3.4 + r() * 2.2, s++, r() < 0.6 ? 'x' : 'z');
      x += w + (r() < 0.25 ? 3.5 : 0.4);
    }
  }
  // Street houses along the lane, cut open by the section like the cottages (closed fronts).
  for (const [x, w] of [[161, 5.5], [167.5, 4.5]]) house(k, x, 1.2, w, 5.2, 4.2, s++, 'x');
  // A canon's stone house in the Close, north of the cottages.
  k.box(146, 0, 16, 158, 6.5, 24, M.stoneOut);
  k.extrudeX([[15.6, 6.4], [20, 10.2], [24.4, 6.4], [24.4, 6.7], [20, 10.5], [15.6, 6.7]], 145.6, 158.4, M.leadOld);
  for (let i = 0; i < 4; i++) k.box(147.2 + i * 2.8, 3.6, 15.95, 147.9 + i * 2.8, 5.0, 16.0, WINDOW);
  HOMES.push([152, 0, 20]);
}
