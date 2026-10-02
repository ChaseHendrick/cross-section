/* Big Pit: the surface. Pit bank, timber headframe, winding engine house, boilers and
 * chimney, workshops, stables, office and the new fan house, the screens and sidings, the
 * spoil tip, a miner's cottage, and the town on the hillside behind. Everything here is
 * static; moving parts are made in machines.js.
 */
import { XS, mat, props } from '../../engine/index.js';
import { MAT, BANK, SHEAVE, SX, SHAFT, shed, windows, ground, shade } from './common.js';

const P = (c, extra) => mat(Object.assign({ c }, extra || {}));

// ------------------------------------------------------------------ rails and waggons
export function track(k, x0, x1, y, z, gauge = 0.6, sleepers = true) {
  for (const dz of [-gauge / 2, gauge / 2]) k.box(x0, y + 0.1, z + dz - 0.03, x1, y + 0.17, z + dz + 0.03, MAT.rail);
  if (sleepers) for (let x = x0 + 0.3; x < x1; x += 0.7) k.box(x - 0.09, y, z - gauge / 2 - 0.2, x + 0.09, y + 0.1, z + gauge / 2 + 0.2, MAT.timber);
}

// A wooden-bodied railway coal waggon, about 5.5 m long, on standard-gauge track at (x, y, z).
export function waggon(k, x, y, z, c, load = true) {
  const L = 5.4, W = 2.3, H = 1.55, by = y + 0.85;
  const body = P(c, { pat: 'planks', s: 0.26, c2: shade(c, -0.15), cut: shade(c, -0.3) });
  k.box(x - L / 2, by, z - W / 2, x + L / 2, by + H, z + W / 2, body);
  k.box(x - L / 2 - 0.05, by - 0.22, z - W / 2 + 0.25, x + L / 2 + 0.05, by, z + W / 2 - 0.25, MAT.ironDark);
  for (const dx of [-1.6, 1.6]) for (const dz of [-0.72, 0.72]) k.cyl(x + dx, y + 0.48, z + dz - 0.05, 0.46, 0.1, MAT.ironDark, { axis: 'z', seg: 12 });
  for (const s of [-1, 1]) { k.cyl(x + s * (L / 2 + 0.15), by + 0.05, z - 0.55, 0.16, 0.06, MAT.iron, { axis: 'z', seg: 8 }); k.cyl(x + s * (L / 2 + 0.15), by + 0.05, z + 0.5, 0.16, 0.06, MAT.iron, { axis: 'z', seg: 8 }); }
  // strapping
  for (const dx of [-1.8, -0.6, 0.6, 1.8]) k.box(x + dx - 0.05, by, z - W / 2 - 0.03, x + dx + 0.05, by + H, z - W / 2, MAT.ironDark);
  if (load) k.boulder(x, by + H - 0.05, z, L * 0.46, 0.45, W * 0.42, MAT.coalHeap, Math.round(x * 7));
}

// ------------------------------------------------------------------ the parts of the works
function cottages(k) {
  // Two terraced cottages at the left edge, cut open: kitchen below, bedroom above.
  const wall = P('#b8b0a0', { c2: '#a49c8a', pat: 'stone', s: 0.3, cut: '#8e8676', cutPat: true });
  const plaster = P('#e4dcc4', { c2: '#d4caae', pat: 'speckle', cut: '#8e8676' });
  const y0 = 0.3, f1 = 2.9, f2 = 3.15, eaves = 5.6, ridge = 7.6, zb = 4.6;
  for (const [x0, x1] of [[-32, -21.2], [-20.6, -9.6]]) {
    shed(k, { x0, x1, y0, eaves, ridge, zb, wall, inner: plaster, roof: MAT.slate, floor: P('#9a8a72', { pat: 'tiles', s: 0.3, c2: '#8a7a62', cut: '#7a6a52' }), trusses: false });
    // Upper floor of boards on joists.
    k.box(x0, f1, -1, x1, f2, zb, P('#8a6a46', { pat: 'planks', s: 0.2, c2: '#6e5236', cut: '#b08a5a' }));
    for (let x = x0 + 0.4; x < x1; x += 0.9) k.box(x - 0.07, f1 - 0.18, -1, x + 0.07, f1, zb, MAT.timber);
    windows(k, [x0 + 2.2, x1 - 2.4], 1.0, zb, 1.0, 1.25);
    windows(k, [x0 + 2.2, x1 - 2.4], f2 + 0.7, zb, 0.95, 1.1);
    // chimney stack through the ridge
    k.box(x0 + 4.4, y0 + 1.55, zb - 0.5, x0 + 6.0, ridge - 0.4, zb, P('#6a625a', { pat: 'brick', c2: '#5a524a', cut: '#5a524a' }));
    k.box(x0 + 4.6, ridge - 0.6, 3.2, x0 + 5.8, ridge + 1.6, zb + 0.3, wall);
    k.box(x0 + 4.75, ridge + 1.6, 3.35, x0 + 5.0, ridge + 2.0, 3.6, P('#9a5a3a'));
    // Kitchen: the range in the fire-place, table, dresser, tin bath before the fire.
    const fx = x0 + 5.2;
    k.box(fx - 1.0, y0, zb - 0.55, fx + 1.0, y0 + 1.45, zb, P('#6a625a', { pat: 'brick', c2: '#5a524a' }));
    props.stove(k, fx, y0, zb - 0.95, { w: 1.4, h: 0.85, d: 0.45, pots: 1, flue: false });
    k.box(fx - 1.15, y0 + 1.45, zb - 0.62, fx + 1.15, y0 + 1.55, zb, MAT.timber); // mantel
    props.clock(k, fx, y0 + 1.95, zb - 0.6, { r: 0.13 });
    props.table(k, x0 + 8.0, y0, 1.6, { w: 1.3, d: 0.8, h: 0.74, cloth: '#d8c8a8', items: 'bread' });
    props.chair(k, x0 + 7.0, y0, 1.8, { face: 1 });
    props.chair(k, x0 + 9.0, y0, 1.8, { face: -1 });
    props.shelves(k, x0 + 1.4, y0, zb - 0.45, { w: 1.4, h: 1.9, n: 4, items: 'plates', d: 0.4, color: '#6a4a2e' });
    // tin bath (oval-ish) by the fire
    k.lathe([[0.32, y0 + 0.02], [0.4, y0 + 0.3], [0.42, y0 + 0.33], [0.36, y0 + 0.33], [0.3, y0 + 0.06]], fx + 0.2, 2.2, P('#a8a8a4', { c2: '#8a8a88' }), { seg: 16 });
    k.cyl(fx + 0.2, y0 + 0.24, 2.2, 0.34, 0.02, P('#9ab4c0', { c2: '#c8dae0' }), { seg: 14 });
    props.rug(k, fx, y0, 1.3, { w: 1.8, d: 1.0, color: '#7a3a2a', c2: '#c8a050' });
    props.lamp(k, x0 + 8.0, f1 - 0.05, 1.9, { drop: 0.4, r: 4.5, i: 0.9, kind: 'lantern', light: '#ffc878', flicker: true });
    // Bedroom: two beds, washstand, a text on the wall.
    props.bed(k, x0 + 2.3, f2, zb - 1.15, { w: 1.9, d: 1.05, blanket: '#8a5a4a', quilt: true });
    props.bed(k, x1 - 2.5, f2, zb - 1.15, { w: 1.8, d: 0.95, blanket: '#5a6a7a', quilt: true, head: 'right' });
    props.chest(k, x0 + 5.6, f2, zb - 0.6, { w: 0.9 });
    props.picture(k, x0 + 5.6, f2 + 1.3, zb, { w: 0.6, h: 0.45, color: '#e8e0c8' });
    props.lamp(k, x0 + 5.6, ridge - 1.5, 1.6, { drop: 0.3, r: 3.6, i: 0.55, kind: 'lantern', light: '#ffc070', flicker: true });
    k.lamp(fx - 0.4, y0 + 0.35, zb - 0.9, { always: true, r: 2.6, i: 0.55, color: '#ff8a40', bulb: false, halo: 0.3, flicker: true });
    // stairs up the side wall
    props.stairs(k, x1 - 4.2, y0, x1 - 1.4, f2, zb - 0.9, zb - 0.05, { color: '#7a5a3a', rail: false });
  }
  // Back gardens and a privy, a washing line.
  k.box(-32, 0.3, 5.1, -9.6, 1.2, 5.4, P('#a49c8a', { pat: 'stone', s: 0.3 }));
  k.rope([-30, 2.4, 9], [-12, 2.4, 9], 0.012, P('#c8b890'), 0.03);
  for (const x of [-30, -12]) k.cyl(x, 0.3, 9, 0.05, 2.2, MAT.timber, { seg: 6 });
  for (let i = 0; i < 5; i++) k.box(-27 + i * 3, 1.5, 8.95, -26 + i * 3, 2.35, 9.0, P(['#e8e2d4', '#8a3a2a', '#c8c0b0', '#5a6a8a', '#e8e2d4'][i], { thin: true }));
}

function tip(k) {
  // The spoil tip: a cone of shale with a tram incline up its flank.
  const prof = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push([0.4 + 21.5 * (1 - t) * (1 - 0.18 * Math.sin(t * Math.PI)), 0.02 + 14 * t]); }
  prof[prof.length - 1][0] = 0.6;
  k.lathe(prof, 22, 3.5, P('#3e3c3e', { c2: '#5e544c', pat: 'rock', cut: '#4a4648' }), { seg: 30, capBot: true });
  // Incline of rails from the foot (x 44) to the top.
  const yAt = (x) => 14 * (1 - Math.min(1, Math.max(0, (Math.hypot(x - 22, 0.9 - 3.5)) / 21.5)) );
  const pts = [];
  for (let x = 45; x >= 24; x -= 1.5) pts.push([x, Math.max(0.1, yAt(x)) + 0.05]);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    for (const dz of [0.55, 1.15]) k.beam([a[0], a[1] + 0.12, dz], [b[0], b[1] + 0.12, dz], 0.06, MAT.rail);
    k.beam([a[0], a[1], 0.4], [a[0], a[1], 1.3], 0.12, MAT.timber);
  }
  // Top platform with the tipping frame and a winch at the foot.
  k.box(21, 13.6, 0.1, 26, 13.9, 2.4, MAT.planks);
  k.box(44.5, 0, 2.2, 46.5, 1.2, 3.6, MAT.timber);
  k.cyl(45.5, 1.4, 2.0, 0.35, 1.8, MAT.iron, { axis: 'z', seg: 12 });
  // bracken at the foot
  for (let i = 0; i < 26; i++) {
    const r = k.rng('br' + i);
    const a = Math.PI * (0.05 + 0.9 * r()), d = 21 + r() * 5;
    const x = 22 + Math.cos(a) * d, z = 3.5 + Math.sin(a) * d * 0.6;
    if (z < 0.5) continue;
    k.boulder(x, 0.2, z, 0.9 + r(), 0.5, 0.8, MAT.bracken, i + 3);
  }
}

function sidings(k) {
  track(k, 30, 102, 0, 1.6, 1.43);
  track(k, 30, 102, 0, 4.6, 1.43);
  // the main line curving away behind the tip
  track(k, -34, 30, 0.02, 9.5, 1.43);
  for (let i = 0; i < 6; i++) { const x = 30 + i * 2; k.box(x - 0.1, 0, 4.6 + i * 0.8, x + 0.1, 0.1, 6.3 + i * 0.8, MAT.timber); }
  // waggons under the screens and waiting on the siding
  waggon(k, 48, 0, 1.6, '#7a4a36');
  waggon(k, 78, 0, 4.6, '#7a4a36');
  waggon(k, 84, 0, 4.6, '#5a5250', false);
  waggon(k, 90, 0, 4.6, '#7a4a36', false);
  waggon(k, 10, 0.02, 9.5, '#6a5a4e');
  waggon(k, 4, 0.02, 9.5, '#7a4a36');
  // buffer stop
  k.box(100.5, 0, 0.6, 101.5, 1.1, 5.6, MAT.timber);
}

function screens(k) {
  // The screens: a raised timber shed. Pickers' floor at y 3, tippler at the bank level (6).
  const F = 3.0;
  // trestles
  for (let x = 62; x <= 100; x += 4) for (const z of [0.15, 3.1, 6.1]) k.box(x - 0.15, 0, z, x + 0.15, F, z + 0.3, MAT.tarred);
  // pickers' floor (behind the belt) and the belt gantry
  k.box(62, F - 0.25, 2.25, 100, F, 6.4, MAT.deck);
  for (let x = 62; x <= 100; x += 2) k.box(x - 0.1, F - 0.55, -0.4, x + 0.1, F - 0.25, 6.4, MAT.timber);
  k.box(66, F + 0.55, 0.15, 87, F + 0.75, 1.95, MAT.timber); // belt frame
  k.box(66, F + 0.75, 0.25, 87, F + 0.85, 1.85, P('#3a3634', { pat: 'grate', c2: '#2a2826' })); // belt surface (coal moves on it as a part)
  for (const x of [66, 87]) k.cyl(x, F + 0.8, 0.2, 0.18, 1.7, MAT.iron, { axis: 'z', seg: 12 });
  for (let x = 67; x < 87; x += 2) k.box(x - 0.08, F, 0.3, x + 0.08, F + 0.55, 0.45, MAT.timber);
  // the jigging screen trough, sloping down from the tippler
  k.box(86.5, F + 0.6, 0.2, 87.3, F + 1.6, 1.9, MAT.timber);
  // chute from the belt into the waggon below
  k.beam([65.6, F + 0.7, 1.05], [61.5, 2.75, 1.05], 0.9, P('#4a4a4c', { pat: 'plates', s: 0.3 }));
  k.box(61.4, 2.4, 0.4, 62.0, 2.9, 1.7, MAT.ironDark);
  // a hopper for small coal and a stone wagon chute at the back
  k.beam([80, F, 4.6], [80, 1.0, 4.6], 0.8, P('#4a4a4c', { pat: 'plates', s: 0.3 }));
  // upper deck: tippler house
  k.box(90, BANK - 0.3, 0.1, 100, BANK, 3.4, MAT.deck);
  for (let x = 90; x <= 100; x += 2.5) for (const z of [0.2, 3.1]) k.box(x - 0.13, F, z, x + 0.13, BANK - 0.3, z + 0.26, MAT.tarred);
  // roof
  const zb = 6.4;
  for (let x = 62; x <= 100; x += 4) k.box(x - 0.13, F, zb, x + 0.13, 9.6, zb + 0.26, MAT.tarred);
  k.extrudeX([[-0.5, 12.15], [zb + 1.0, 9.3], [zb + 1.0, 9.45], [-0.5, 12.3]], 61.5, 100.5, MAT.corr);
  for (let x = 64; x < 100; x += 4) k.beam([x, 9.6, zb], [x, 12.0, 0.05], 0.14, MAT.timber);
  // the back of the shed is boarded, with gaps
  for (let y = F + 1.2; y < 9.4; y += 1.1) k.box(62, y, zb + 0.28, 100, y + 0.75, zb + 0.34, P('#6a5a46', { pat: 'planks', s: 0.25, c2: '#5a4a38', cut: '#9a7a50' }));
  // stair up from the yard
  props.stairs(k, 58.5, 0, 62, F, 5.0, 6.0, { color: '#6a5a46' });
  // lamps for the late picking shift (oil lamps on posts)
  for (const x of [70, 80, 90]) props.lamp(k, x, 9.4, 2.6, { drop: 0.6, r: 5, i: 0.8, kind: 'lantern', light: '#ffc878', flicker: true });
}

function deckAndLampRoom(k) {
  // The tram deck from the screens to the shaft at the bank level, on timber trestles.
  const y = BANK;
  k.box(96, y - 0.28, 0.0, 147, y, 3.6, MAT.deck);
  for (let x = 96; x <= 146; x += 2.0) k.box(x - 0.1, y - 0.6, -0.4, x + 0.1, y - 0.28, 3.6, MAT.timber);
  for (let x = 98; x <= 146; x += 4) if (x < 111 || x > 127) for (const z of [0.2, 3.2]) k.box(x - 0.15, 0, z, x + 0.15, y - 0.6, z + 0.3, MAT.tarred);
  track(k, 96, 147, y, 1.0, 0.6, false);
  track(k, 96, 147, y, 2.6, 0.6, false);
  props.rail(k, 100, 146, y, 3.5, { h: 1.0, step: 2, color: '#4a3a2a' });
  // Lamp room under the deck: whitewashed brick, serving windows, racks of numbered lamps.
  const x0 = 111.5, x1 = 126.5, zb = 5.0, top = y - 0.6;
  k.box(x0 - 0.3, -0.2, -1, x1 + 0.3, 0, zb + 0.3, P('#8a8478', { pat: 'tiles', s: 0.45, c2: '#7a7468', cut: '#6a6458' }));
  k.box(x0, 0, zb, x1, top, zb + 0.3, MAT.whiteBrick, { shadeBot: 0.8 });
  for (const [a, b] of [[x0 - 0.35, x0], [x1, x1 + 0.35]]) k.box(a, 0, -1, b, top, zb + 0.3, MAT.whiteBrick);
  k.box(x0 - 0.35, top, -1, x1 + 0.35, top + 0.2, zb + 0.3, P('#6a6a68', { cut: '#4a4a48' })); // flat roof slab under the deck
  // serving counter: a partition with three hatches
  const cz = 1.7;
  for (let i = 0; i < 4; i++) { const xa = x0 + i * 3.8; k.box(xa, 0, cz, xa + (i < 3 ? 1.8 : 0.5), top, cz + 0.22, MAT.whiteBrick); }
  for (let i = 0; i < 3; i++) { const xa = x0 + 1.8 + i * 3.8; k.box(xa, 0, cz, xa + 2.0, 1.0, cz + 0.22, MAT.whiteBrick); k.box(xa - 0.05, 1.0, cz - 0.15, xa + 2.05, 1.08, cz + 0.4, MAT.timber); k.box(xa, 2.35, cz, xa + 2.0, top, cz + 0.22, MAT.whiteBrick); }
  // racks of lamps on the back wall: shelves with rows of little brass lamps
  for (let r = 0; r < 4; r++) {
    const sy = 0.55 + r * 0.62;
    k.box(x0 + 0.3, sy - 0.04, zb - 0.4, x1 - 0.3, sy, zb, MAT.timber);
    for (let x = x0 + 0.5; x < x1 - 0.4; x += 0.27) {
      k.cyl(x, sy, zb - 0.22, 0.06, 0.1, MAT.brass, { seg: 6 });
      k.cyl(x, sy + 0.1, zb - 0.22, 0.045, 0.1, P('#cfe0e4'), { seg: 6 });
      k.cyl(x, sy + 0.2, zb - 0.22, 0.05, 0.1, P('#8a8c90'), { seg: 6 });
    }
  }
  // cleaning bench, oil cans, the riveting machine
  k.box(x0 + 1.0, 0, 2.5, x0 + 5.5, 0.9, 3.2, MAT.timber);
  for (let i = 0; i < 4; i++) k.cyl(x0 + 1.4 + i * 0.4, 0.9, 2.85, 0.07, 0.2, MAT.brass, { seg: 8 });
  k.box(x1 - 3.4, 0, 2.5, x1 - 1.0, 0.9, 3.2, MAT.timber);
  k.box(x1 - 2.5, 0.9, 2.65, x1 - 2.1, 1.35, 2.95, MAT.iron);
  k.cyl(x1 - 2.3, 1.35, 2.8, 0.03, 0.35, MAT.iron, { seg: 6 });
  props.barrel(k, x1 - 0.8, 0, 3.6, { r: 0.3, h: 0.8, color: '#6a5a3a' });
  // the railed passage and turnstile outside
  props.rail(k, x0 - 2.5, x1 + 0.5, 0, 0.35, { h: 1.0, step: 1.5, color: '#4a4a4a' });
  for (const x of [x0 + 0.9, x0 + 4.7, x0 + 8.5]) props.lamp(k, x + 1.0, top, 3.4, { drop: 0.25, r: 4.2, i: 1.0, light: '#ffd890' });
  // signboard
  k.box(x0 + 5, top - 0.75, cz - 0.04, x0 + 9, top - 0.25, cz - 0.01, P('#2a3a4a'));
}

function bank(k) {
  // Pit bank: plank deck at the shaft mouth, banksman's cabin, signal post, barometer, notice.
  const y = BANK;
  k.box(126.5, y - 0.3, 0.0, SHAFT.x0 - 0.05, y, 3.6, MAT.deck);
  k.box(SHAFT.x1 + 0.05, y - 0.3, 0.0, 158, y, 3.6, MAT.deck);
  // corrugated roof over the bank on posts
  for (let x = 127; x <= 145; x += 3) k.box(x - 0.12, y, 3.4, x + 0.12, 11.0, 3.65, MAT.tarred);
  k.extrudeX([[-0.4, 11.6], [4.4, 10.8], [4.4, 10.95], [-0.4, 11.75]], 126, 146, MAT.corrRust);
  // banksman's cabin with a stove pipe
  shed(k, { x0: 127.2, x1: 130.6, y0: y, eaves: y + 2.4, ridge: y + 2.9, zb: 3.0, t: 0.12, wall: MAT.paintBrown, inner: P('#c8b890'), roof: MAT.corr, floor: false, trusses: false });
  props.stove(k, 128.0, y, 2.0, { w: 0.55, h: 0.7, d: 0.45, pots: 0, flueH: 2.5 });
  props.chair(k, 129.6, y, 1.6, { face: -1 });
  windows(k, [129.4], y + 1.1, 3.0, 0.7, 0.7);
  props.lamp(k, 129.0, y + 2.4, 1.6, { drop: 0.2, r: 3, i: 0.7, kind: 'lantern', light: '#ffc878' });
  // barometer and thermometer on a post, the notice of winding times on a board
  k.box(132.9, y, 3.0, 133.1, y + 2.2, 3.2, MAT.timber);
  k.cyl(133.0, y + 1.65, 2.98, 0.14, 0.04, P('#e8dcc0'), { axis: 'z', seg: 14 });
  k.box(132.96, y + 0.9, 2.95, 133.04, y + 1.35, 2.99, P('#d8d0c0'));
  k.box(135.4, y, 3.0, 135.55, y + 2.0, 3.15, MAT.timber);
  k.box(137.2, y, 3.0, 137.35, y + 2.0, 3.15, MAT.timber);
  k.box(135.3, y + 1.0, 2.96, 137.45, y + 1.95, 3.0, P('#6a4a30'));
  k.box(135.45, y + 1.1, 2.94, 136.3, y + 1.85, 2.96, P('#ece4d0'));
  k.box(136.4, y + 1.1, 2.94, 137.3, y + 1.6, 2.96, P('#e4dcc4'));
  // signal post with knocker wire and bell
  k.box(145.6, y, 2.7, 145.8, y + 2.6, 2.9, MAT.timber);
  k.lathe([[0.02, y + 2.3], [0.16, y + 2.15], [0.17, y + 2.05], [0, y + 2.05]], 145.7, 2.55, MAT.brass, { seg: 10 });
  // shaft gates
  for (const x of [SHAFT.x0 - 0.3, SHAFT.x1 + 0.3]) k.box(x - 0.04, y, 0.2, x + 0.04, y + 1.1, 2.4, P('#4a4a4a', { pat: 'bars', s: 0.15 }));
  // stair from the yard to the deck
  props.stairs(k, 118, 0, 125.8, y - 0.28, 3.65, 4.6, { color: '#6a5a46' });
  props.lamp(k, 138, 10.9, 2.0, { drop: 0.6, r: 6, i: 1.0, kind: 'lantern', light: '#ffc878', flicker: true });
  props.lamp(k, 131, 10.9, 2.0, { drop: 0.6, r: 5, i: 0.8, kind: 'lantern', light: '#ffc878', flicker: true });
}

// Weigh cabin at deck level: weighing machine let into the tram road, desk with ledgers.
function weighCabin(k) {
  const y = BANK;
  shed(k, { x0: 100.5, x1: 109.5, y0: y, eaves: y + 3.0, ridge: y + 3.9, zb: 3.4, t: 0.15, wall: MAT.paintBrown, inner: P('#d8c8a0', { pat: 'planks', s: 0.2, c2: '#c8b890' }), roof: MAT.slate, floor: false, trusses: false });
  k.box(102.5, y + 0.01, 0.6, 106.5, y + 0.05, 1.4, P('#5a5a5e', { pat: 'grate' }));
  props.desk(k, 105.5, y, 2.3, { w: 2.2, top: '#6a4a2e' });
  props.chair(k, 104.8, y, 1.75, { face: 'out' });
  props.chair(k, 106.4, y, 1.75, { face: 'out' });
  // the weighing machine dial
  k.cyl(103.0, y + 2.1, 3.36, 0.32, 0.04, P('#f0e8d4'), { axis: 'z', seg: 18 });
  // tally board
  k.box(107.3, y + 1.3, 3.34, 109.2, y + 2.5, 3.38, P('#2e3a32'));
  windows(k, [101.6], y + 1.2, 3.4, 0.8, 0.9);
  props.lamp(k, 105.5, y + 3.0, 2.0, { drop: 0.3, r: 3.6, i: 0.9, kind: 'lantern', light: '#ffd080', flicker: true });
}

// Timber headframe: four legs over the shaft, raking back legs toward the engine.
function headframe(k) {
  const T = P('#5a4632', { c2: '#4a3a28', pat: 'grain', cut: '#b08a5a' });
  const top = SHEAVE.y - 0.9;
  const zs = [0.05, 2.75];
  for (const z of zs) {
    k.beam([SHAFT.x0 - 0.9, 0, z], [SHAFT.x0 - 0.5, top, z], 0.42, T);
    k.beam([SHAFT.x1 + 0.9, 0, z], [SHAFT.x1 + 0.5, top, z], 0.42, T);
    k.beam([SHAFT.x1 + 0.5, top, z], [164.5, 0, z], 0.4, T); // back leg
    k.beam([SHAFT.x1 + 0.6, BANK + 1.5, z], [161, BANK - 2, z], 0.25, T); // strut
    for (const y of [BANK + 0.2, 10.0, top]) k.box(SHAFT.x0 - 0.9, y - 0.18, z - 0.18, SHAFT.x1 + 0.9, y + 0.18, z + 0.18, T);
    k.beam([SHAFT.x0 - 0.8, BANK + 0.3, z], [SHAFT.x1 + 0.6, 9.8, z], 0.18, T);
    k.beam([SHAFT.x1 + 0.8, BANK + 0.3, z], [SHAFT.x0 - 0.6, 9.8, z], 0.18, T);
    k.beam([SHAFT.x0 - 0.7, 10.2, z], [SHAFT.x1 + 0.5, top - 0.2, z], 0.16, T);
  }
  // cross beams through the frame (cut where they pass the section)
  for (const x of [SHAFT.x0 - 0.6, SHAFT.x1 + 0.6]) for (const y of [10.0, top]) k.box(x - 0.18, y - 0.2, -0.6, x + 0.18, y + 0.2, 3.0, T);
  // sheave platform and bearings
  k.box(SHAFT.x0 - 1.1, top + 0.18, -0.6, SHAFT.x1 + 3.6, top + 0.42, 3.0, P('#6a5a46', { pat: 'planks', s: 0.25 }));
  for (const [cx, z] of [[CAGEX(0) + SHEAVE.r, 0.5], [CAGEX(1) + SHEAVE.r, 1.4]]) {
    for (const dz of [-0.28, 0.28]) k.box(cx - 0.3, top + 0.42, z + dz - 0.1, cx + 0.3, SHEAVE.y - 0.05, z + dz + 0.1, MAT.ironDark);
  }
  props.rail(k, SHAFT.x0 - 1.0, SHAFT.x1 + 3.4, top + 0.42, 2.85, { h: 0.9, step: 1.2, color: '#3a2e22' });
  props.ladder(k, SHAFT.x1 + 0.2, BANK, top + 0.3, 2.95, { w: 0.4, color: '#5a4a38' });
  // cage guides: timber rods from the headframe to the pit bottom, behind each cage
  for (const cx of [CAGEX(0), CAGEX(1)]) for (const dx of [-1.15, 1.15]) {
    if ((cx === CAGEX(0) && dx > 0) || (cx === CAGEX(1) && dx < 0)) continue;
    k.box(cx + dx - 0.07, -89, 1.0, cx + dx + 0.07, top - 0.2, 1.2, P('#6a5a46', { pat: 'grain' }));
  }
  k.box(SX - 0.07, -89, 1.0, SX + 0.07, top - 0.2, 1.2, P('#6a5a46', { pat: 'grain' }));
  // timber casing around the shaft between the collar and the bank
  k.box(SHAFT.x0 - 0.3, 0, 2.3, SHAFT.x1 + 0.3, BANK - 0.3, 2.45, P('#5a4a38', { pat: 'planks', s: 0.25, c2: '#4a3a2a' }));
}
const CAGEX = (i) => (i ? 151.25 : 148.75);

// Winding engine house: tall stone house with the twin-cylinder engine and the two reels.
function engineHouse(k) {
  const x0 = 166, x1 = 194, zb = 5.6, eaves = 10.5, ridge = 13.6;
  shed(k, { x0, x1, eaves, ridge, zb, wall: MAT.dressed, inner: P('#ddd4bc', { c2: '#cdc3a8', pat: 'speckle', cut: '#9a907e' }), roof: MAT.slate, floor: P('#9a8e7a', { pat: 'tiles', s: 0.6, c2: '#8a7e6a', cut: '#7a6e5a' }), truss: 4 });
  // tall round-headed windows in the back wall
  windows(k, [170, 175, 186, 191], 3.0, zb, 1.5, 4.6, MAT.glassWinWide);
  // rope window in the left gable
  k.box(x0 - 0.5, 7.2, 0.0, x0 + 0.05, 11.2, 2.2, P('#2a2420'));
  // engine bed: masonry plinths for the reel bearings and the cylinders
  const ax = 176, ay = 3.0;
  for (const z of [0.05, 1.0, 1.95]) k.box(ax - 0.9, 0, z - 0.12 + (z === 0.05 ? 0.15 : 0), ax + 0.9, ay - 0.35, z + 0.12, MAT.dressed);
  k.box(ax - 0.9, 0, 2.15, ax + 0.9, ay - 0.35, 2.75, MAT.dressed);
  for (const z of [0.2, 1.0, 1.9, 2.45]) k.box(ax - 0.35, ay - 0.35, z - 0.08, ax + 0.35, ay - 0.1, z + 0.08, MAT.brass);
  // the reel shaft
  k.cyl(ax, ay, -0.3, 0.18, 3.3, P('#5a5e64'), { axis: 'z', seg: 12 });
  // cylinder beds and the two cylinders (left one cut open by the section)
  k.box(181.2, 0, -0.5, 192.5, ay - 0.65, 0.6, MAT.dressed);
  k.box(181.2, 0, 2.3, 192.5, ay - 0.95, 3.1, MAT.dressed);
  // slide bars
  for (const z of [0.1, 2.7]) for (const dy of [-0.32, 0.32]) k.box(180.5, ay + dy - 0.05, z - 0.06, 186.2, ay + dy + 0.05, z + 0.06, P('#9a9ea4'));
  const cylM = P('#3e5a46', { c2: '#2e4a36', cut: '#2a2e30' });
  // cylinder 1 (cut): a hollow barrel so the piston shows inside
  hollowCyl(k, 186.4, ay, 0.1, 0.62, 0.52, 4.0, cylM, P('#6a6e74'));
  // cylinder 2, whole, behind
  k.cyl(186.4, ay, 2.7, 0.62, 4.0, cylM, { axis: 'x', seg: 18 });
  for (const x of [186.4, 190.4]) k.cyl(x - 0.06, ay, 2.7, 0.72, 0.12, MAT.brass, { axis: 'x', seg: 18 });
  k.box(187.4, ay + 0.55, 2.4, 189.4, ay + 1.05, 3.0, cylM); // valve chest
  k.box(187.4, ay + 0.55, -0.3, 189.4, ay + 1.05, 0.55, cylM);
  // steam pipe from the boilers along the back wall
  k.tube([[196, 6.5, 4.6], [190, 6.5, 4.6], [188.4, 6.5, 3.4], [188.4, ay + 1.05, 2.7]], 0.14, P('#8a8a84', { pat: 'canvas' }));
  k.tube([[188.4, 6.5, 3.4], [188.4, 6.2, 0.9], [188.4, ay + 1.05, 0.45]], 0.12, P('#8a8a84', { pat: 'canvas' }));
  // the exhaust pipe up through the roof (it puffs with each stroke)
  k.tube([[190.4, ay + 0.9, 2.9], [190.4, 6.0, 3.5], [190.5, 14.6, 3.5]], 0.16, P('#4a4a4c'));
  // brake post and the engineman's platform with levers and the depth indicator
  k.box(172.6, 0, 1.6, 173.1, 4.2, 2.0, MAT.ironDark);
  k.box(178.6, 0, 3.4, 181.2, 0.35, 5.0, MAT.planks);
  props.chair(k, 179.8, 0.35, 4.1, { face: 'out', color: '#5a3a22' });
  for (const x of [179.2, 180.4]) k.beam([x, 0.35, 3.6], [x - 0.15, 1.5, 3.45], 0.06, MAT.brass);
  k.box(181.4, 0, 4.6, 182.0, 4.6, 5.2, P('#5a4630', { pat: 'panels', s: 0.6 })); // indicator column
  k.box(181.45, 1.0, 4.55, 181.95, 4.4, 4.6, P('#e8dcc0', { pat: 'stripes', s: 0.25, c2: '#c8b890' }));
  // lamps (oil) for night winding
  for (const x of [171, 179, 188]) props.lamp(k, x, eaves, 2.6, { drop: 1.6, r: 6.5, i: 1.1, kind: 'chandelier', light: '#ffd080' });
}

// A hollow cylinder along x (thick-walled barrel) from x to x + len: closed ring solid.
export function hollowCyl(k, x, y, z, ro, ri, len, m, inner, seg = 20) {
  const R = (r, a, xx) => [xx, y + Math.cos(a) * r, z + Math.sin(a) * r];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2, b = ((i + 1) / seg) * Math.PI * 2;
    k.quad(R(ro, a, x), R(ro, a, x + len), R(ro, b, x + len), R(ro, b, x), m);
    k.quad(R(ri, a, x), R(ri, b, x), R(ri, b, x + len), R(ri, a, x + len), inner || m);
    k.quad(R(ro, a, x), R(ro, b, x), R(ri, b, x), R(ri, a, x), m);
    k.quad(R(ro, a, x + len), R(ri, a, x + len), R(ri, b, x + len), R(ro, b, x + len), m);
  }
}

function boilerHouse(k) {
  const x0 = 196, x1 = 218, zb = 10.5, eaves = 7.2, ridge = 10.2;
  shed(k, { x0, x1, eaves, ridge, zb, wall: MAT.brick, inner: P('#8a6a5a', { c2: '#6a4a3a', pat: 'brick', cut: '#8a4a34' }), roof: MAT.slateWet, floor: P('#4a4440', { pat: 'tiles', s: 0.5, c2: '#3a3430', cut: '#5a5048' }), truss: 4.4 });
  // Three Lancashire boilers lying front to back, their fire-doors facing us.
  for (const bx of [200.2, 207, 213.8]) {
    k.box(bx - 1.75, 0, 2.4, bx + 1.75, 1.0, 10.2, MAT.brick); // seating
    k.cyl(bx, 2.35, 2.5, 1.38, 7.6, MAT.boiler, { axis: 'z', seg: 22 });
    k.cyl(bx, 2.35, 2.35, 1.42, 0.16, P('#4a4a4e', { pat: 'rivets' }), { axis: 'z', seg: 22 });
    for (const dx of [-0.62, 0.62]) {
      k.cyl(bx + dx, 1.95, 2.25, 0.46, 0.12, P('#2e2e30'), { axis: 'z', seg: 14 });
      k.box(bx + dx - 0.26, 1.72, 2.16, bx + dx + 0.26, 2.1, 2.24, MAT.fire);
      k.lamp(bx + dx, 1.9, 1.9, { always: true, r: 3.0, i: 0.75, color: '#ff8a30', bulb: false, halo: 0.45, flicker: true });
    }
    // steam dome, safety valve, gauge glass
    k.cyl(bx, 3.7, 5.2, 0.32, 0.6, P('#8a8a84'), { seg: 12 });
    k.cyl(bx, 3.7, 8.2, 0.12, 0.7, MAT.brass, { seg: 8 });
    k.box(bx + 0.9, 2.6, 2.33, bx + 0.98, 3.2, 2.36, P('#cfe0e4'));
  }
  // coal heap in front of the boilers, shovels, a barrow
  for (let i = 0; i < 4; i++) k.boulder(198 + i * 5.2, 0, 0.8, 1.8, 0.7, 0.9, MAT.coalHeap, 40 + i);
  windows(k, [200.2, 207, 213.8], 4.3, zb, 1.3, 1.9);
  props.lamp(k, 203.6, eaves, 4.0, { drop: 1.2, r: 6, i: 0.8, kind: 'lantern', light: '#ffc878' });
  props.lamp(k, 210.4, eaves, 4.0, { drop: 1.2, r: 6, i: 0.8, kind: 'lantern', light: '#ffc878' });
  // The boiler chimney: red brick, about 30 m [illustrative].
  const cx = 221.4, cz = 7.0;
  k.lathe([[2.0, 0], [2.0, 2.5], [1.75, 3.0], [1.6, 26], [1.75, 28], [1.75, 28.6], [1.45, 29.6], [1.2, 29.6]], cx, cz, MAT.brickDark, { seg: 18, capTop: false });
  k.lathe([[1.2, 29.6], [1.2, 27.5]], cx, cz, MAT.sooty, { seg: 18, capTop: false, capBot: true });
  // flue from the boilers to the chimney (along the back)
  k.box(218.3, 0.0, 6.2, 219.5, 1.5, 7.8, MAT.brick);
}

function smithy(k) {
  const x0 = 225, x1 = 244.6, zb = 5.2;
  shed(k, { x0, x1, eaves: 4.6, ridge: 6.6, zb, wall: MAT.rubble, inner: P('#5a524a', { c2: '#4a423a', pat: 'stone', s: 0.3, cut: '#8e8676' }), roof: MAT.slate, floor: P('#4a4440', { pat: 'speckle', c2: '#3a3430', cut: '#5a5048' }), truss: 3.2 });
  // three forge hearths with hoods and chimneys through the roof
  for (const hx of [228.5, 234.8, 241.1]) {
    k.box(hx - 1.0, 0, zb - 1.3, hx + 1.0, 0.85, zb, P('#7a6a5a', { pat: 'brick', c2: '#6a5a4a' }));
    k.box(hx - 0.45, 0.85, zb - 1.0, hx + 0.45, 0.95, zb - 0.3, MAT.fire);
    k.lamp(hx, 1.2, zb - 0.8, { always: true, r: 3.2, i: 0.9, color: '#ff7a30', bulb: false, halo: 0.6, flicker: true });
    k.lathe([[1.0, 2.2], [0.35, 3.2], [0.32, 7.6]], hx, zb - 0.6, P('#3a3634', { pat: 'rivets' }), { seg: 10, capTop: false, capBot: false });
    // bellows (leather wedge) beside the hearth: moving part made in machines.js; the frame here
    k.box(hx + 1.1, 0, zb - 1.1, hx + 1.25, 1.4, zb - 0.95, MAT.timber);
    props.anvil(k, hx, 0, zb - 2.6);
    props.barrel(k, hx - 1.4, 0, zb - 2.3, { r: 0.32, h: 0.65, color: '#5a4a3a' }); // quench tub
  }
  // racks of blunt pick points, horseshoes and chains on the back wall
  for (let i = 0; i < 18; i++) k.box(226 + i * 0.95, 2.1, zb - 0.06, 226.05 + i * 0.95, 2.45, zb - 0.02, MAT.iron);
  k.box(225.6, 2.0, zb - 0.15, 243.5, 2.08, zb - 0.02, MAT.timber);
  for (let i = 0; i < 10; i++) k.lathe([[0.1, 2.75 - 0.002 * i], [0.12, 2.75], [0.1, 2.77]], 227 + i * 0.6, zb - 0.1, MAT.iron, { seg: 8, a0: 0, a1: Math.PI * 1.6, capTop: false, capBot: false });
  windows(k, [231.6, 238], 2.1, zb, 1.0, 1.3);
  props.lamp(k, 234.8, 4.6, 2.2, { drop: 0.5, r: 5, i: 0.7, kind: 'lantern', light: '#ffc070' });
}

function fittingShop(k) {
  const x0 = 245, x1 = 260, zb = 5.4;
  shed(k, { x0, x1, eaves: 5.4, ridge: 7.6, zb, wall: P('#a89c86', { c2: '#968a74', pat: 'stone', s: 0.32, cut: '#8a8272', cutPat: true }), inner: P('#ddd4bc', { c2: '#cdc3a8', pat: 'speckle' }), roof: MAT.slate, floor: MAT.planks, left: false, truss: 3 });
  windows(k, [247.5, 251, 257], 1.4, zb, 1.2, 2.4, MAT.glassWinWide);
  // tram door in the middle of the back wall
  k.box(253, 0, zb - 0.05, 255, 2.8, zb + 0.02, P('#4a3a2a', { pat: 'planks', s: 0.2 }));
  // line shaft along the roof with hangers; belts and pulleys are parts
  k.box(245.5, 4.75, 2.0, 259.5, 4.85, 2.2, MAT.timber);
  for (const x of [247, 251, 255, 258.5]) k.box(x - 0.05, 4.4, 2.05, x + 0.05, 4.75, 2.15, MAT.iron);
  // two lathes and a pillar drill, a vice bench
  for (const lx of [247.6, 251.6]) {
    k.box(lx - 1.2, 0, 2.6, lx + 1.2, 0.8, 3.2, MAT.ironDark);
    k.box(lx - 1.2, 0.8, 2.7, lx + 1.2, 0.95, 3.1, P('#5a6a5a'));
    k.box(lx - 1.1, 0.95, 2.65, lx - 0.6, 1.35, 3.15, P('#4a5a4a'));
    k.box(lx + 0.6, 0.95, 2.75, lx + 0.9, 1.25, 3.05, P('#4a5a4a'));
  }
  k.box(256.2, 0, 3.0, 256.6, 2.0, 3.4, MAT.ironDark);
  k.box(255.8, 1.95, 2.9, 257.0, 2.25, 3.5, P('#4a5a4a'));
  k.box(257.6, 0, 4.4, 259.6, 0.9, 5.3, MAT.timber);
  // a dram on trestles for repair, wheels off
  dramBody(k, 252.8, 0.55, 1.2);
  k.box(251.9, 0, 0.9, 252.1, 0.55, 1.6, MAT.timber); k.box(253.5, 0, 0.9, 253.7, 0.55, 1.6, MAT.timber);
  props.lamp(k, 249.5, 5.3, 2.2, { drop: 0.4, r: 5, i: 0.8, light: '#ffd890' });
  props.lamp(k, 256.0, 5.3, 2.2, { drop: 0.4, r: 5, i: 0.8, light: '#ffd890' });
}

export function dramBody(k, x, y, z, coal = false) {
  const L = 1.7, W = 1.0, H = 0.8;
  k.box(x - L / 2, y + 0.22, z - W / 2, x + L / 2, y + 0.22 + H, z + W / 2, P('#6a5038', { pat: 'planks', s: 0.2, c2: '#5a4430', cut: '#9a7448' }));
  for (const dx of [-0.82, -0.25, 0.25, 0.82]) k.box(x + dx - 0.03, y + 0.22, z - W / 2 - 0.02, x + dx + 0.03, y + 0.22 + H, z - W / 2, MAT.ironDark);
  if (coal) k.boulder(x, y + 0.22 + H - 0.05, z, L * 0.47, 0.32, W * 0.45, MAT.coalHeap, Math.round(x * 13 + z));
}

function sawMill(k) {
  const x0 = 262, x1 = 284, zb = 5.6;
  shed(k, { x0, x1, eaves: 4.8, ridge: 7.0, zb, wall: P('#a85a3e', { c2: '#8a4a32', pat: 'brick', cut: '#8a4a34', cutPat: true }), inner: P('#9a6a4e', { c2: '#8a5a40', pat: 'brick' }), roof: MAT.corr, floor: P('#a08a64', { pat: 'speckle', c2: '#c8aa70', cut: '#7a6a52' }), truss: 3.6 });
  // circular saw bench
  k.box(268, 0, 1.6, 273, 0.85, 2.6, MAT.timber);
  for (const x of [268.2, 272.6]) k.box(x, 0, 1.7, x + 0.2, 0.85, 2.5, MAT.timber);
  // stacks of pit props and split timber
  const propM = MAT.prop;
  for (let s = 0; s < 3; s++) {
    const sx = 275.5 + s * 2.6;
    for (let r = 0; r < 5; r++) for (let i = 0; i < 6 - (r % 2); i++) k.cyl(sx - 1.0, 0.13 + r * 0.24, 0.6 + i * 0.25 + (r % 2) * 0.12 + 1.0, 0.12, 2.2, propM, { axis: 'x', seg: 7 });
  }
  for (let r = 0; r < 4; r++) k.box(263, r * 0.12, 3.6, 267, r * 0.12 + 0.1, 5.2, MAT.prop);
  track(k, 258, 286, 0, 0.9, 0.6);
  props.lamp(k, 270.5, 4.8, 2.2, { drop: 0.4, r: 5, i: 0.7, kind: 'lantern', light: '#ffc878' });
  // sawdust heap
  k.boulder(266, 0, 1.0, 1.2, 0.35, 0.8, P('#c8aa70', { c2: '#b09060', pat: 'speckle' }), 77);
}

function surfaceStables(k) {
  const x0 = 286, x1 = 298, zb = 5.4;
  shed(k, { x0, x1, eaves: 4.6, ridge: 6.8, zb, wall: MAT.brick, inner: MAT.whitewash, roof: MAT.slate, floor: P('#8a7a62', { pat: 'tiles', s: 0.25, c2: '#7a6a52', cut: '#6a5a42' }), truss: 3 });
  // hay loft over the back half
  k.box(x0, 3.0, 2.6, x1, 3.2, zb, MAT.planks);
  for (let i = 0; i < 6; i++) k.boulder(x0 + 1 + i * 1.9, 3.2, 4.0, 0.9, 0.55, 0.9, MAT.hay, 90 + i);
  // three stalls with partitions and mangers
  for (let i = 0; i <= 3; i++) k.box(x0 + 0.4 + i * 3.6, 0, 2.3, x0 + 0.55 + i * 3.6, 1.6, zb, MAT.timber);
  for (let i = 0; i < 3; i++) {
    k.box(x0 + 0.8 + i * 3.6, 0.8, zb - 0.6, x0 + 3.6 + i * 3.6, 1.1, zb, MAT.timber);
    k.boulder(x0 + 2.2 + i * 3.6, 0.0, 3.4, 1.2, 0.18, 0.9, MAT.straw, 120 + i);
  }
  // harness pegs
  for (let i = 0; i < 6; i++) k.cyl(x0 + 1 + i * 1.8, 2.3, zb - 0.02, 0.04, -0.25, MAT.timber, { axis: 'z', seg: 6 });
  for (let i = 0; i < 3; i++) k.lathe([[0.3, 1.9], [0.36, 2.1], [0.3, 2.3]], x0 + 1.9 + i * 3.6, zb - 0.15, P('#4a3020'), { seg: 10, capTop: false, capBot: false });
  props.lamp(k, 292, 2.95, 1.6, { drop: 0.3, r: 4.5, i: 0.6, kind: 'lantern', light: '#ffc070', flicker: true });
}

function office(k) {
  const x0 = 300, x1 = 312, zb = 5.0, fl = 3.4;
  shed(k, { x0, x1, eaves: 6.6, ridge: 8.8, zb, wall: P('#e4dccc', { c2: '#d4ccba', pat: 'speckle', cut: '#9a8e78' }), inner: P('#d8cca8', { c2: '#c8bc98', pat: 'panels', s: 0.8 }), roof: MAT.slate, floor: MAT.planks, truss: 4 });
  k.box(x0, fl - 0.2, -1, x1, fl, zb, P('#7a5a3a', { pat: 'planks', s: 0.18, c2: '#6a4a2e', cut: '#b08a5a' }));
  windows(k, [302.2, 306, 309.8], 1.0, zb, 1.0, 1.5);
  windows(k, [302.2, 306, 309.8], fl + 0.9, zb, 1.0, 1.4);
  // ground floor: clerks' high desks along the back, the pay window at the side
  for (const dx of [301.6, 304.6, 307.6]) { k.box(dx - 0.9, 0, 3.8, dx + 0.9, 1.15, 4.6, MAT.timber); k.boxR(dx, 1.22, 4.15, 1.8, 0.06, 0.75, MAT.timber, { x: -0.25 }); props.chair(k, dx, 0, 3.1, { face: 'in', tall: true, color: '#6a4a2a' }); }
  k.box(310.6, 0, 0.8, 310.9, 2.6, 4.9, MAT.timber);
  k.box(310.55, 1.0, 1.8, 310.95, 1.6, 2.6, P('#3a2a20'));
  props.shelves(k, 311.4, 0, 4.4, { w: 0.9, h: 2.2, n: 5, items: 'books', d: 0.5 });
  props.clock(k, 306.0, 2.85, zb - 0.02, { r: 0.18 });
  // notice board
  k.box(303.5, 1.5, zb - 0.05, 305.3, 2.6, zb - 0.01, P('#6a4a30'));
  for (let i = 0; i < 4; i++) k.box(303.65 + i * 0.42, 1.65 + (i % 2) * 0.35, zb - 0.07, 303.95 + i * 0.42, 2.05 + (i % 2) * 0.35, zb - 0.05, P('#ece4d0'));
  // upstairs: the manager's office with a desk, a map of the workings, a bird cage
  props.desk(k, 305, fl, 3.4, { w: 1.6, top: '#5a3a22' });
  props.chair(k, 305, fl, 2.8, { face: 'in', color: '#5a3a22', cushion: '#6a2a20' });
  k.box(301.2, fl + 1.0, zb - 0.04, 303.6, fl + 2.3, zb - 0.01, P('#e8dcc0', { pat: 'rock', c2: '#a89a78' }));
  props.wardrobe(k, 310.6, fl, 4.2, { w: 1.4, h: 2.0, color: '#5a3a22' });
  props.rug(k, 305, fl, 1.5, { w: 3, d: 2, color: '#6a2a24', c2: '#c8a050' });
  props.stairs(k, 308.2, 0, 311.2, fl - 0.2, 4.4, 4.95, { color: '#6a4a2e', rail: false });
  props.lamp(k, 304, fl - 0.2, 2.0, { drop: 0.5, r: 4.5, i: 0.9, kind: 'chandelier', light: '#ffe0a0' });
  props.lamp(k, 305.5, 6.4, 2.0, { drop: 0.6, r: 4.5, i: 0.9, light: '#ffe0a0' });
  // chimney stacks
  k.box(300.4, 6.0, 3.6, 301.4, 10.2, 4.6, MAT.brick);
  k.box(310.6, 6.0, 3.6, 311.6, 10.2, 4.6, MAT.brick);
}

function fanHouse(k) {
  // Red-brick fan house on a dressed-stone plinth (1909-10). The fan wheel is hidden in its
  // casing; the flared iron chimney rises above it.
  const x0 = 322, x1 = 339.5, zb = 6.0;
  k.box(x0 - 0.6, 0, -1, x1 + 0.6, 1.0, zb + 0.6, MAT.dressed);
  shed(k, { x0, x1, y0: 1.0, eaves: 7.4, ridge: 9.4, zb, wall: P('#b05a3e', { c2: '#94482f', pat: 'brick', cut: '#8a4a34', cutPat: true }), inner: P('#e8e0cc', { c2: '#d8d0bc', pat: 'brick' }), roof: MAT.slate, floor: P('#8a8a84', { pat: 'tiles', s: 0.5, c2: '#7a7a74', cut: '#6a6a64' }), truss: 3.5 });
  windows(k, [324.5, 328.5], 3.0, zb, 1.2, 2.4, MAT.glassWinWide);
  // fan casing: a great iron scroll, cut through to show its curved wall
  const fx = 333.5, fy = 4.4;
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, b = ((i + 1) / 26) * Math.PI * 2;
    const r1 = 3.0 + 0.4 * (i / 26), r2 = 3.0 + 0.4 * ((i + 1) / 26);
    const p = (r, an, z) => [fx + Math.cos(an) * r, fy + Math.sin(an) * r, z];
    if (Math.sin(a) < -0.6) continue;
    k.quad(p(r1, a, 0.6), p(r2, b, 0.6), p(r2, b, 4.6), p(r1, a, 4.6), P('#3e4a52', { pat: 'plates', s: 0.6, c2: '#2e3a42', cut: '#22282c' }));
  }
  k.cyl(fx, fy, 4.6, 3.3, 0.25, P('#3e4a52', { pat: 'rivets', cut: '#22282c' }), { axis: 'z', seg: 26 });
  k.cyl(fx, fy, 0.35, 0.5, 4.5, P('#4a4e54'), { axis: 'z', seg: 12 });
  // The flared chimney (evasé) of riveted plate, rising from the casing.
  k.lathe([[1.0, 7.4], [1.05, 9.0], [1.35, 12.0], [1.9, 15.0], [2.3, 16.2]], 333.5, 2.6, P('#2e3236', { pat: 'plates', s: 0.6, c2: '#24272a', cut: '#1a1c1e' }), { seg: 18, capTop: false, capBot: false });
  // electric motor on its bed with a rope pulley
  k.box(325.5, 1.0, 1.6, 329.5, 1.5, 3.6, MAT.dressed);
  k.cyl(327.5, 2.2, 1.9, 0.75, 1.2, P('#4a6a4a', { pat: 'rivets' }), { axis: 'z', seg: 16 });
  k.box(326.6, 1.5, 2.0, 328.4, 1.75, 2.9, P('#3a5a3a'));
  // switchboard and the water gauge
  k.box(337.2, 1.0, 5.6, 339.3, 3.4, 6.0, P('#3a3a3a', { pat: 'panels', s: 0.5, c2: '#2a2a2a' }));
  k.box(336.6, 2.2, 5.85, 336.8, 3.6, 5.98, P('#cfe0e4'));
  k.box(336.62, 2.3, 5.83, 336.78, 2.9, 5.86, P('#3a6a8a'));
  // electric bulbs inside (this is the electric part of the colliery)
  for (const x of [325, 330, 336]) props.lamp(k, x, 7.3, 2.4, { drop: 0.9, r: 5, i: 0.9, light: '#fff0c8' });
  // the drift down to the Coity shafts: a brick arch mouth behind the casing
  k.box(334, -4.4, 4.0, 349.8, -4.2, 6.2, MAT.brick);
}

function coityHeads(k) {
  // Two capped, sealed shaft tops, 8 ft across and 8 ft apart, joined to the fan drift.
  for (const cx of [343.6, 348.4]) {
    const y = ground(cx);
    k.lathe([[1.65, -1.6], [1.65, y + 1.2], [1.2, y + 1.2], [1.2, -1.6]], cx, 0.6, MAT.brick, { seg: 18, capTop: false, capBot: false });
    k.cyl(cx, y + 1.2, 0.6, 1.7, 0.18, P('#4a4e54', { pat: 'rivets' }), { seg: 18 });
    k.cyl(cx - 0.4, y + 1.38, 0.9, 0.18, 0.4, P('#3a3e44'), { seg: 8 });
  }
}

function magazine(k) {
  const cx = 375, y = ground(375);
  // earth bank around a small brick store with an iron door
  k.lathe([[5.5, y - 0.4], [3.6, y + 2.2], [3.0, y + 2.4]], cx, 6.5, MAT.soilMoor, { seg: 16, capTop: false });
  k.box(cx - 1.6, y, 4.0, cx + 1.6, y + 2.8, 7.4, MAT.brick);
  k.extrudeX([[3.8, y + 2.8], [7.6, y + 2.8], [5.7, y + 3.5]], cx - 1.8, cx + 1.8, MAT.slate);
  k.box(cx - 0.45, y, 3.95, cx + 0.45, y + 1.9, 4.0, MAT.red);
}

function moor(k) {
  // Bracken, a few stone walls and the old tramroad embankment on the moor.
  const r = k.rng('moor');
  for (let i = 0; i < 60; i++) {
    const x = 352 + r() * 86, z = 1 + r() * 17;
    const y = ground(x);
    k.boulder(x, y + 0.05, z, 0.8 + r() * 1.2, 0.35 + r() * 0.3, 0.6 + r(), r() < 0.7 ? MAT.bracken : MAT.soilMoor, i * 5 + 1);
  }
  for (let i = 0; i < 10; i++) { const x = 356 + r() * 80, z = 2 + r() * 16; k.boulder(x, ground(x) + 0.1, z, 0.6, 0.4, 0.5, P('#8a8478', { pat: 'rock', c2: '#6a6458' }), 300 + i); }
  // stone wall running up the moor
  for (let x = 352; x < 436; x += 4) k.beam([x, ground(x) + 0.45, 15.3], [x + 4, ground(x + 4) + 0.45, 15.3], 0.9, P('#8a8478', { pat: 'stone', s: 0.25, c2: '#7a7468' }));
  // the old tramroad embankment
  for (let x = 352; x < 436; x += 6) k.beam([x, ground(x) + 0.5, 10.5], [x + 6, ground(x + 6) + 0.5, 10.5], 2.4, MAT.soilMoor);
}

// The town on the hillside behind: rows of terraced houses, a chapel and the cold ironworks.
function town(k, terrainH) {
  const r = k.rng('town');
  const wallC = ['#b8b0a0', '#a8a090', '#c8bca4', '#b4ac9c'];
  const terrace = (x0, n, z, w = 5.2) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + i * w, y = Math.min(terrainH(x, z), terrainH(x + w, z), terrainH(x, z + 8), terrainH(x + w, z + 8)) - 0.5;
      const h = 6.2;
      const m = P(r.pick(wallC), { pat: 'stone', s: 0.35, c2: '#9a9282' });
      k.box(x, y, z, x + w - 0.05, y + h, z + 7, m);
      k.extrudeX([[z - 0.3, y + h], [z + 7.3, y + h], [z + 3.5, y + h + 2.4]], x, x + w - 0.05, MAT.slate);
      k.box(x + 0.6, y + 1.0, z - 0.03, x + 1.6, y + 2.3, z, MAT.glassWin);
      k.box(x + 2.6, y + 3.4, z - 0.03, x + 3.6, y + 4.6, z, MAT.glassWin);
      k.box(x + 2.8, y + 0.0, z - 0.03, x + 3.6, y + 2.1, z, P('#4a3a2a'));
      if (i % 2 === 0) k.box(x + w - 0.6, y + h + 1.2, z + 3.0, x + w + 0.4, y + h + 3.2, z + 4.0, P('#8a5a4a'));
    }
  };
  terrace(-40, 12, 70);
  terrace(30, 10, 92);
  terrace(-30, 9, 110);
  terrace(140, 14, 118);
  terrace(260, 8, 104);
  // Chapel: gabled, round-headed windows, facing us.
  const cx = 104, cz = 74, cy = terrainH(cx, cz) - 0.5;
  const cm = P('#c8bca4', { pat: 'ashlar', s: 0.5, c2: '#b4a890' });
  k.box(cx - 7, cy, cz, cx + 7, cy + 9, cz + 16, cm);
  k.extrude([[cx - 7.5, cy + 9], [cx + 7.5, cy + 9], [cx, cy + 14]], cz - 0.2, cz + 16.2, MAT.slate);
  k.extrude([[cx - 7, cy + 9], [cx + 7, cy + 9], [cx, cy + 13.6]], cz - 0.01, cz + 0.4, cm);
  for (const dx of [-4.5, -1.5, 1.5, 4.5]) k.box(cx + dx - 0.6, cy + 3.5, cz - 0.04, cx + dx + 0.6, cy + 7.2, cz, MAT.glassWin);
  k.box(cx - 1.0, cy, cz - 0.05, cx + 1.0, cy + 2.8, cz, P('#4a3a2a'));
  k.cyl(cx, cy + 11.2, cz - 0.08, 0.8, 0.1, P('#e8e0cc'), { axis: 'z', seg: 16 });
  // The ironworks: cold blast furnaces of stone, a cast house, no smoke (idle since the 1900s).
  const ix = 196, iz = 135, iy = terrainH(ix, iz) - 1;
  const im = P('#9a8a78', { pat: 'ashlar', s: 0.7, c2: '#8a7a68' });
  for (let i = 0; i < 4; i++) {
    const x = ix + i * 13;
    k.box(x, iy, iz, x + 10, iy + 15, iz + 10, im);
    k.box(x + 3, iy + 2, iz - 0.05, x + 7, iy + 7, iz, P('#4a3a30'));
  }
  k.box(ix - 4, iy, iz - 8, ix + 52, iy + 6, iz, P('#8a7e6a', { pat: 'stone', s: 0.5, c2: '#7a6e5a' }));
  k.extrudeX([[iz - 8.3, iy + 6], [iz + 0.3, iy + 6], [iz - 4, iy + 8.5]], ix - 4.2, ix + 52.2, MAT.slate);
  // a few trees in the valley
  for (let i = 0; i < 22; i++) {
    const x = -40 + r() * 460, z = 45 + r() * 90;
    const y = terrainH(x, z);
    k.cyl(x, y, z, 0.25, 3, MAT.timber, { seg: 5 });
    k.sphere(x, y + 4.2, z, 2.2 + r(), P(r.pick(['#5a6a3a', '#6a6a34', '#8a6a2e', '#7a5a2a']), { pat: 'speckle', c2: '#4a5a2e' }), { seg: 8, rings: 5 });
  }
}

export function buildSurface(k, terrainH) {
  cottages(k);
  tip(k);
  sidings(k);
  screens(k);
  deckAndLampRoom(k);
  weighCabin(k);
  bank(k);
  headframe(k);
  engineHouse(k);
  boilerHouse(k);
  smithy(k);
  fittingShop(k);
  sawMill(k);
  surfaceStables(k);
  office(k);
  fanHouse(k);
  coityHeads(k);
  magazine(k);
  moor(k);
  town(k, terrainH);
  // a cart of bracken cut on the hill, for the horses' bedding
  k.box(298.4, 0.55, 0.5, 300.4, 0.75, 1.9, MAT.timber);
  for (const dx of [-0.7, 0.7]) k.cyl(299.4 + dx, 0.5, 0.42, 0.5, 0.08, MAT.ironDark, { axis: 'z', seg: 12 });
  k.cyl(299.4 - 0.7, 0.5, 1.9, 0.5, 0.08, MAT.ironDark, { axis: 'z', seg: 12 });
  k.boulder(299.4, 0.75, 1.2, 1.1, 0.7, 0.75, MAT.bracken, 515);
  k.beam([298.4, 0.65, 1.2], [296.6, 0.4, 1.2], 0.08, MAT.timber);
  // yard lamps on posts
  for (const x of [104, 160, 222.5, 261, 299, 318]) {
    k.cyl(x, 0, 1.2, 0.06, 3.6, MAT.ironDark, { seg: 6 });
    k.box(x - 0.14, 3.6, 1.06, x + 0.14, 3.95, 1.34, P('#3a3a3a'));
    k.lamp(x, 3.78, 1.2, { r: 6, i: 0.9, color: '#ffd090', halo: 0.5, flicker: true });
  }
  void XS; void SX;
}
