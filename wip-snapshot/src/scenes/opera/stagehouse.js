/* The Opera: inside the stage house. The raked stage, the wings, fly galleries and grils,
 * five understage levels of hand-worked machinery, and the flooded cistern beneath.
 * Moving parts (scenery, curtain, drums, chariots, traps, counterweights) are made here
 * and animated in life.js.
 */
import { mat } from '../../engine/index.js';
import { Y, MT, ST0, ST1, SZ, PROS, stageY } from './common.js';

const Z0 = -0.45;
export const PLANS = Array.from({ length: 11 }, (_, i) => ST0 + 0.8 + i * 2.4); // the eleven "plans" 0 to 10
export const STAGE = { parts: {} };
const U = Y.under;

// A painted canvas: a thin flat in the z-y plane at x, from z0 to z1, y0 to y1, drawn with a kit.
function canvas(q, x, z0, z1, y0, y1, c, frame = true) {
  q.box(x - 0.04, y0, z0, x + 0.04, y1, z1, mat({ c, c2: '#a89878', pat: 'canvas', s: 0.6, cut: '#8a7a5a' }));
  if (frame) q.box(x - 0.06, y1 - 0.12, z0, x + 0.06, y1, z1, MT.timber);
}

export function stagehouse(k) {
  const L = (x, y, z, o) => k.lamp(x, y, z, o);
  // ---------------------------------------------------------------- the stage floor
  const yb = stageY(ST1);
  k.extrude([[ST0, 8.1], [ST1, yb - 0.4], [ST1, yb], [ST0, 8.5]], Z0, SZ, MT.timber, { side: MT.oakWorn });
  // Slots (costieres) for the masts and the traps (rues), across the stage at each plan (fr.wikipedia).
  const slot = mat({ c: '#3a2e22', c2: '#2a2018', cut: '#1e1610' });
  for (const x of PLANS) {
    k.box(x - 0.06, stageY(x) - 0.02, 4.0, x + 0.06, stageY(x) + 0.006, SZ - 2, slot);
    k.box(x + 0.6, stageY(x + 0.6) - 0.02, 0.0, x + 0.62, stageY(x + 0.6) + 0.006, 3.6, slot);
    k.box(x + 1.72, stageY(x + 1.72) - 0.02, 0.0, x + 1.74, stageY(x + 1.72) + 0.006, 3.6, slot);
  }
  // ---------------------------------------------------------------- understage: five levels on iron posts
  const deck = [MT.oak, MT.oak, MT.pine, MT.pine, MT.pine];
  U.forEach((y, i) => {
    k.box(ST0, y - 0.3, Z0, ST1, y, SZ, MT.timber, { top: deck[i] });
    const ytop = i === 0 ? 8.1 : U[i - 1] - 0.3;
    for (let x = ST0 + 1.7; x < ST1; x += 3.3) for (let z = 2.2; z < SZ; z += 4.4) k.cyl(x, y, z, 0.11, ytop - y, MT.ironGrey, { seg: 6 });
    // Caged gas jets.
    for (const [x, z] of [[93, 4], [104, 7], [111, 3]]) {
      k.box(x - 0.12, ytop - 0.55, z - 0.12, x + 0.12, ytop - 0.25, z + 0.12, mat({ c: '#3a3a3a', c2: '#ffcf8a', pat: 'bars', s: 0.06 }));
      L(x, ytop - 0.45, z, { r: 6.5, i: 1.0, color: '#ffc878', bulbR: 0.05, halo: 0.3, flicker: true });
    }
  });
  // Rails for the chariots in the 1st and 2nd understage, along the slots.
  for (const x of PLANS) for (const y of [U[0], U[1]]) {
    k.box(x - 0.42, y, 3.6, x - 0.36, y + 0.08, SZ - 1, MT.ironD);
    k.box(x + 0.36, y, 3.6, x + 0.42, y + 0.08, SZ - 1, MT.ironD);
  }
  // Iron guides (cassettes) for the fermes, rising from the 4th understage (fr.wikipedia).
  for (const x of [PLANS[4] + 1.2, PLANS[7] + 1.2]) for (const z of [5.5, 9.5, 13.5]) k.box(x - 0.08, U[3], z - 0.08, x + 0.08, 8.0, z + 0.08, MT.ironD);
  // Trap counterweights hanging in the 1st understage.
  for (const x of [PLANS[2] + 1.2, PLANS[5] + 1.2]) { k.cyl(x, U[0] + 0.4, 0.9, 0.18, 1.0, MT.ironD, { seg: 8 }); k.cyl(x, U[0] + 1.4, 0.9, 0.015, 6.6 - U[0] + 0.5, MT.hemp, { seg: 3 }); }
  // Capstans and winches in the lowest levels; coils of hemp.
  for (const [x, i] of [[96, 4], [108, 4], [102, 3]]) {
    k.cyl(x, U[i], 11, 0.35, 1.0, MT.timber, { seg: 10 });
    for (let a = 0; a < 4; a++) k.boxR(x, U[i] + 0.9, 11, 2.2, 0.08, 0.08, MT.timber, { y: a * Math.PI / 4 });
  }
  for (const [x, i, z] of [[91, 2, 6], [113, 3, 9], [99, 4, 4], [110, 1, 12]]) { k.cyl(x, U[i], z, 0.45, 0.25, MT.hemp, { seg: 10 }); k.cyl(x, U[i] + 0.25, z, 0.32, 0.15, MT.hemp, { seg: 10 }); }
  // Stairs down through the understage at the back corner, and ladders.
  for (let i = 0; i < 5; i++) {
    const ytop = i === 0 ? stageY(ST1 - 2) : U[i - 1];
    flight(k, ST1 - 3.6, ytop, ST1 - 0.4, U[i], 15.2, 16.4, MT.timber);
  }
  // ---------------------------------------------------------------- the cistern (la cuve)
  // Brick pillars and arcades carry the lowest floor over about 1.3 m of water.
  const pillars = [];
  for (let x = 81.5; x < 126; x += 4.4) for (let z = 1.6; z < 31; z += 4.4) {
    k.box(x - 0.45, Y.cistern, z - 0.45, x + 0.45, U[4] - 0.3, z + 0.45, MT.brickD);
    pillars.push([x, z]);
  }
  for (let z = 1.6; z < 31; z += 4.4) {
    const prof = [[78.9, U[4] - 0.3], [78.9, U[4] - 1.9]];
    for (let x = 81.5; x < 122; x += 4.4) {
      for (let j = 0; j <= 8; j++) { const a = Math.PI - (j / 8) * Math.PI; prof.push([x + 2.2 + Math.cos(a) * 1.75, U[4] - 2.0 + Math.sin(a) * 1.3]); }
    }
    prof.push([127.6, U[4] - 1.9], [127.6, U[4] - 0.3]);
    k.extrude(prof, z - 0.45, z + 0.45, MT.brickD);
  }
  k.box(79, Y.water - 0.05, Z0, 127.5, Y.water, 31.8, MT.water);
  k.box(79, Y.cistern, Z0, 127.5, Y.water - 0.05, 31.8, mat({ c: '#162630', cut: '#14222a', plainCut: true }));
  k.sheet(79, 127.5, Y.cistern, Y.water, 0.01, { c: '#2a5a6a', alpha: 0.42 });
  // Iron ladder into the water from the access chamber behind the stage (fr.wikipedia).
  ladder(k, 118.2, Y.water - 0.6, -0.2, 3.0);
  ladder(k, 124.5, Y.water - 0.6, -0.2, 7.5);
  // ---------------------------------------------------------------- the wings: flats in store, ladders of gas
  // Flats in use and in store (the "tas") lean against the far wall (N p.160).
  const r = k.rng('tas');
  const tasCols = ['#c8b48a', '#a8b48a', '#b89a7a', '#9aa4b0', '#c8a88a', '#8a9a7a'];
  for (let i = 0; i < 26; i++) {
    const x = ST0 + 1.6 + i * 0.95 + r() * 0.3;
    if (Math.abs(x - 93) < 1.2 || Math.abs(x - 101) < 1.2 || Math.abs(x - 109) < 1.2) continue;
    const h = 8 + r() * 4, lean = 0.5 + r() * 0.5;
    const y0 = stageY(x);
    k.boxR(x, y0 + h / 2, SZ - 1.2 - lean / 2, 0.08, h, 3.2, mat({ c: tasCols[i % 6], c2: '#8a7a5a', pat: 'canvas', s: 0.8, cut: '#7a6a4a' }), { x: -lean / h, y: Math.PI / 2 });
  }
  // Ladders of gas jets (portants) behind each wing at the first plans.
  for (let i = 1; i < 8; i++) {
    const x = PLANS[i] + 1.0, y0 = stageY(x);
    k.box(x - 0.05, y0, 8.6, x + 0.05, y0 + 9, 8.75, MT.ironD);
    k.box(x - 0.07, y0 + 0.5, 8.5, x + 0.07, y0 + 8.6, 8.56, mat({ c: '#f2e2b0', c2: '#fff0c0', glow: 'always', noEdge: true }));
    if (i % 2) L(x, y0 + 4.5, 8.0, { r: 6, i: 0.55, color: '#fff0c8', bulb: false, halo: 0.6, flicker: true });
  }
  // ---------------------------------------------------------------- counterweight chimneys
  // Open lattice shafts from the foundations to the roof (N p.160): 65 t of lead, 47 t of iron (N p.244).
  STAGE.cw = [];
  for (const x of [93, 101, 109]) {
    const z0 = SZ - 1.6, z1 = SZ - 0.1, y0 = U[4], y1 = Y.gril[0];
    for (const [px, pz] of [[x - 0.7, z0], [x + 0.7, z0], [x - 0.7, z1], [x + 0.7, z1]]) k.box(px - 0.06, y0, pz - 0.06, px + 0.06, y1, pz + 0.06, MT.ironD);
    for (let y = y0; y < y1 - 2; y += 2.2) {
      k.beam([x - 0.7, y, z0], [x + 0.7, y + 2.2, z0], 0.06, MT.ironD);
      k.beam([x + 0.7, y, z0], [x - 0.7, y + 2.2, z0], 0.06, MT.ironD);
      k.box(x - 0.7, y, z0 - 0.04, x + 0.7, y + 0.06, z1 + 0.04, MT.ironD);
    }
    STAGE.cw.push(x);
  }
  // ---------------------------------------------------------------- fly galleries on the far wall
  for (const y of [Y.flies, 33.5, 38]) {
    k.box(ST0, y - 0.25, SZ - 4.2, ST1, y, SZ, MT.timber, { top: MT.pine });
    k.box(ST0, y, SZ - 4.25, ST1, y + 1.05, SZ - 4.18, MT.ironD, { top: MT.ironD });
    // The pin rail and its belaying pins.
    k.cyl(ST0, y + 0.95, SZ - 4.3, 0.06, ST1 - ST0, MT.ironGrey, { axis: 'x', seg: 6 });
    for (let x = ST0 + 0.4; x < ST1; x += 0.55) k.cyl(x, y + 0.75, SZ - 4.38, 0.025, 0.5, MT.timber, { seg: 4 });
    // Hand winches on the gallery.
    for (const x of [95, 105]) { k.box(x - 0.6, y, SZ - 2.6, x + 0.6, y + 0.9, SZ - 1.4, MT.timber); k.cyl(x - 0.7, y + 1.0, SZ - 2.0, 0.35, 1.4, MT.timber, { axis: 'x', seg: 10 }); }
    L(100, y + 2.2, SZ - 2.5, { r: 5, i: 0.5, color: '#ffc878', bulbR: 0.05, halo: 0.3 });
  }
  // Stair tower to the galleries and the grils: "300 steps" in the back far corner.
  let yy = stageY(ST1 - 2);
  const levels = [Y.flies, 33.5, 38, Y.gril[0], Y.gril[1], Y.gril[2]];
  levels.forEach((yt, i) => { flight(k, i % 2 ? ST1 - 0.4 : ST1 - 3.6, yy, i % 2 ? ST1 - 3.6 : ST1 - 0.4, yt, SZ - 5.8, SZ - 4.6, MT.timber); yy = yt; });
  // The electric-light bridge (N p.232) with the arc lantern, near the proscenium.
  k.box(ST0 + 0.4, 23.8, 9, ST0 + 2.0, 24.0, SZ - 4.2, MT.timber, { top: MT.pine });
  k.box(ST0 + 0.4, 24.0, 9, ST0 + 2.0, 25.0, 9.05, MT.ironD);
  k.box(ST0 + 0.6, 24.0, 9.6, ST0 + 1.6, 24.9, 10.6, MT.timber);
  k.cyl(ST0 + 0.6, 24.45, 10.1, 0.3, 0.12, mat({ c: '#e8f0f2', c2: '#ffffff', glow: 'night', noEdge: true }), { axis: 'x', seg: 10 });
  STAGE.arc = [ST0 + 0.5, 24.45, 10.1];
  // A flying bridge across the stage (cut by our section).
  k.box(99.3, 35.8, Z0, 100.3, 36.0, SZ - 4.2, MT.timber, { top: MT.pine });
  k.box(99.3, 36.0, Z0, 99.34, 37.0, SZ - 4.2, MT.ironD);
  k.box(100.26, 36.0, Z0, 100.3, 37.0, SZ - 4.2, MT.ironD);
  // ---------------------------------------------------------------- borders and battens
  for (let i = 1; i < 10; i += 1) {
    const x = PLANS[i] + 1.9;
    if (i % 2) canvas(k, x, Z0, 15.5, 20.5 + i * 0.25, 24.5 + i * 0.25, i % 4 === 1 ? '#a4b8c4' : '#b4c4c8');
    else {
      // A batten of gas jets (herse), hung across the stage.
      k.cyl(x, 20.2 + i * 0.2, Z0, 0.08, 15.5, MT.ironD, { axis: 'z', seg: 6 });
      k.box(x - 0.06, 20.0 + i * 0.2, 0.2, x + 0.06, 20.12 + i * 0.2, 15, mat({ c: '#f2e2b0', c2: '#fff0c0', glow: 'always', noEdge: true }));
      L(x, 19.6 + i * 0.2, 4.5, { r: 12, i: 0.8, color: '#fff2cc', bulb: false, halo: 0.9, flicker: true });
    }
    for (const z of [1.5, 7.5, 13.5]) k.cyl(x, 24.5 + i * 0.25, z, 0.018, Y.gril[0] - 24.5 - i * 0.25, MT.hemp, { seg: 3 });
  }
  // ---------------------------------------------------------------- back-wall shelving for rolled drops
  for (let y = 12; y < 44; y += 4) {
    k.box(ST1 - 1.6, y - 0.12, 2, ST1, y, SZ - 5, MT.timber);
    for (let j = 0; j < 3; j++) k.cyl(ST1 - 1.25 + j * 0.42, y + 0.2, 2.2, 0.2, SZ - 7.4, mat({ c: ['#cbbd98', '#b8c0a8', '#c8aa8a'][(j + Math.round(y)) % 3], c2: '#a89878', pat: 'canvas', s: 0.4 }), { axis: 'z', seg: 7 });
  }
  // ---------------------------------------------------------------- the grils
  Y.gril.forEach((y, i) => {
    k.box(ST0, y - 0.18, Z0, ST1, y, SZ, MT.grate);
    for (let x = ST0 + 1; x < ST1; x += 4.5) k.box(x - 0.15, y - 0.6, Z0, x + 0.15, y - 0.18, SZ, MT.ironD);
    if (i === 0) for (const x of [95, 102, 109]) { k.cyl(x, y + 0.85, 3, 0.8, 9, MT.timber, { axis: 'z', seg: 12 }); k.box(x - 0.5, y, 3, x + 0.5, y + 0.4, 12, MT.timber); }
    // Blocks (pulleys) over each line.
    for (let x = ST0 + 2; x < ST1; x += 2.4) for (const z of [1.5, 7.5, 13.5]) k.cyl(x - 0.15, y + 0.15, z, 0.14, 0.3, MT.ironD, { axis: 'x', seg: 6 });
    L(100, y + 1.6, 8, { r: 4.5, i: 0.4, color: '#ffc070', bulbR: 0.04, halo: 0.2 });
  });
  // Fire reservoirs under the roof, at the level of the third gril (N p.235, 245).
  for (const z of [16, 21.5]) k.cyl(98 + (z > 20 ? 8 : 0), Y.gril[2], z, 2.2, 2.6, MT.ironGrey, { seg: 14 });
  // Ten bells hang in the flies, the heaviest 650 kg (N p.237): here three of them on a beam.
  k.box(110, 31.4, 18, 114, 31.7, 18.4, MT.timber);
  STAGE.bells = [[110.8, 31.4, 18.2, 0.55], [112.2, 31.4, 18.2, 0.42], [113.3, 31.4, 18.2, 0.32]];
}

// A straight flight of solid steps from (xa, ya) to (xb, yb) between depths z0..z1.
export function flight(k, xa, ya, xb, yb, z0, z1, m, rail = true) {
  const n = Math.max(3, Math.round(Math.abs(yb - ya) / 0.19));
  const dx = (xb - xa) / n, dy = (yb - ya) / n;
  for (let i = 0; i < n; i++) {
    const x = xa + dx * i, y = ya + dy * (i + (dy > 0 ? 1 : 0));
    k.box(Math.min(x, x + dx), y - Math.abs(dy) - 0.18, z0, Math.max(x, x + dx), y, z1, m);
  }
  if (rail) {
    const ym = 0.95;
    k.tube([[xa, ya + ym, z0 + 0.04], [xb, yb + ym, z0 + 0.04]], 0.025, MT.ironD, { seg: 4 });
    for (let i = 0; i <= n; i += Math.max(2, Math.round(n / 3))) k.cyl(xa + dx * i, ya + dy * i, z0 + 0.04, 0.015, ym, MT.ironD, { seg: 4 });
  }
}

export function ladder(k, x, y0, y1, z) {
  k.box(x - 0.25, y0, z - 0.03, x - 0.2, y1, z + 0.03, MT.ironD);
  k.box(x + 0.2, y0, z - 0.03, x + 0.25, y1, z + 0.03, MT.ironD);
  for (let y = y0 + 0.3; y < y1; y += 0.32) k.cyl(x - 0.2, y, z, 0.015, 0.4, MT.ironD, { axis: 'x', seg: 4 });
}

// ------------------------------------------------------------------ moving scenery (parts)
// Five sets for tonight's Faust. Each has a backdrop (flies up and down) and wing flats on
// chariots (slide in and out along z, with their masts down through the slots).
const SETS = {
  study: { drop: 97.2, col: '#7a5a3e', wing: '#8a6a48' },
  fair: { drop: 109.2, col: '#a8c0d0', wing: '#c8b48a' },
  garden: { drop: 106.8, col: '#9ab0b8', wing: '#5e7a4a' },
  church: { drop: 104.4, col: '#8a8a90', wing: '#9a9488' },
  walpurgis: { drop: 111.6, col: '#4a3a5a', wing: '#4a4048' },
};
export function scenery(k) {
  const out = {};
  let n = 0;
  for (const [name, S] of Object.entries(SETS)) {
    const x = S.drop, y0 = stageY(x);
    for (const z of [0.6, 6.5, 12.5]) k.cyl(x, 26, z, 0.018, Y.gril[0] - 26, MT.hemp, { seg: 3 });
    // The backdrop, drawn at its lowered position; the part moves it up into the flies.
    const drop = k.part(x, 0, 0, (q) => {
      canvas(q, 0, Z0 + 0.05, 13.5, y0, y0 + 12.5, S.col);
      paint(q, name, y0);
      for (const z of [0.6, 6.5, 12.5]) q.cyl(0, y0 + 12.5, z, 0.018, 3.2, MT.hemp, { seg: 3 });
    });
    // Wing flats on chariots: two per side plan, deep in the set.
    const wings = k.part(0, 0, 0, (q) => {
      const plans = name === 'study' ? [1, 3] : name === 'walpurgis' ? [2, 5, 8] : [1, 3, 6];
      for (const pi of plans) {
        const px = PLANS[pi] + n * 0.22 - 0.4, py = stageY(px);
        canvas(q, px, 8.5, 11.8, py, py + 10.5, S.wing);
        wingPaint(q, name, px, py);
        // Mast down through the slot to its chariot in the first understage.
        q.box(px - 0.05, U[0] + 0.3, 9.9, px + 0.05, py + 3, 10.1, MT.ironD);
        q.box(px - 0.45, U[0] + 0.08, 9.4, px + 0.45, U[0] + 0.5, 10.6, MT.ironGrey);
        for (const wz of [9.6, 10.4]) q.cyl(px - 0.45, U[0] + 0.16, wz, 0.08, 0.9, MT.ironD, { axis: 'x', seg: 6 });
      }
    });
    out[name] = { drop, wings, x, y0 };
    n++;
  }
  STAGE.sets = out;
  // The house curtain: a painted drop flown out during the acts [method illustrative].
  STAGE.curtain = k.part(PROS + 0.75, 0, 0, (q) => {
    q.box(-0.05, 8.5, Z0, 0.05, 22.4, 8.4, mat({ c: '#a2242a', c2: '#7a1018', pat: 'bars', s: 0.55, cut: '#5a1014' }));
    q.box(-0.08, 8.5, Z0, 0.08, 9.1, 8.4, mat({ c: '#d8b050', c2: '#a88a30', pat: 'bars', s: 0.08 }));
    q.box(-0.07, 10.6, Z0, 0.07, 10.9, 8.4, MT.gilt);
  });
  // The iron mesh safety curtain between stage and house (N p.160).
  STAGE.mesh = k.part(PROS + 1.35, 0, 0, (q) => {
    q.box(-0.03, 8.5, Z0, 0.03, 22.4, 8.6, mat({ c: '#5a5e62', c2: '#2e3236', pat: 'grate', s: 0.22, cut: '#2a2e32' }));
    q.box(-0.08, 8.5, Z0, 0.08, 8.9, 8.6, MT.ironD);
  });
  // A trap platform in a rue near the front (Mephistopheles rises through it).
  STAGE.trapX = PLANS[2] + 1.15;
  STAGE.trap = k.part(STAGE.trapX, 0, 0, (q) => {
    q.box(-0.5, -0.12, 0.1, 0.5, 0, 1.2, MT.oak);
    q.box(-0.06, -3.2, 0.6, 0.06, -0.12, 0.7, MT.ironD);
  });
  // Drums in the third and fourth understage, two metres across (fr.wikipedia).
  STAGE.drums = [];
  for (const [x, i, z, len] of [[94.5, 2, 4.5, 6], [104.5, 2, 3.5, 7], [99.5, 3, 6, 6], [109.5, 3, 4, 5], [97, 4, 12, 5]]) {
    const y = U[i] + 1.15;
    const d = k.part(x, y, z, (q) => {
      q.cyl(0, 0, 0, 1.0, len, mat({ c: '#9a7a4e', c2: '#7a5e3a', pat: 'planks', s: 0.3, cut: '#6a4e2e' }), { axis: 'z', seg: 14 });
      for (const zz of [0.1, len - 0.2]) q.cyl(0, 0, zz, 1.08, 0.1, MT.timber, { axis: 'z', seg: 14 });
      q.cyl(0, 0, -0.5, 0.12, len + 1, MT.ironD, { axis: 'z', seg: 6 });
      for (let a = 0; a < 6; a++) q.boxR(Math.cos(a) * 0.5, Math.sin(a) * 0.5, len / 2, 0.08, 0.08, len - 0.3, MT.hemp, {});
    });
    k.box(x - 0.2, U[i], z - 0.7, x + 0.2, y, z - 0.5, MT.timber);
    k.box(x - 0.2, U[i], z + len + 0.5, x + 0.2, y, z + len + 0.7, MT.timber);
    // Ropes from the drum up to the stage machinery.
    k.cyl(x + 0.9, y, z + len / 2, 0.02, (i === 2 ? 8.1 : U[i - 1]) - y, MT.hemp, { seg: 3 });
    STAGE.drums.push(d);
  }
  // Counterweights in the three chimneys (one per set of lines).
  STAGE.weights = STAGE.cw.map((x) => k.part(x, 30, SZ - 0.85, (q) => { q.box(-0.5, 0, -0.5, 0.5, 2.2, 0.5, mat({ c: '#4a4e54', c2: '#5a5e64', pat: 'plates', s: 0.4 })); q.cyl(0, 2.2, 0, 0.02, 14, MT.hemp, { seg: 3 }); }));
  // Bells (they swing in the church scene).
  STAGE.bellParts = STAGE.bells.map(([x, y, z, s]) => k.part(x, y, z, (q) => {
    q.lathe([[s * 0.9, -s * 1.5], [s * 0.85, -s * 1.3], [s * 0.6, -s * 0.6], [s * 0.4, -s * 0.15], [0.0, -s * 0.05]], 0, 0, mat({ c: '#8a6a3a', c2: '#a88a4a', pat: 'speckle' }), { seg: 12 });
    q.box(-0.06, -s * 0.1, -0.06, 0.06, 0, 0.06, MT.ironD);
  }));
}

// Painted scenes on the backdrops (simple shapes stuck on the canvas, a hair in front of it).
function paint(q, name, y0) {
  const P = (z0, z1, ya, yb, c, glow) => q.box(-0.1, y0 + ya, z0, -0.05, y0 + yb, z1, mat(glow ? { c, c2: '#ffd890', glow: 'night', noEdge: true } : { c, c2: '#8a7a5a', pat: 'canvas', s: 0.7 }));
  if (name === 'fair') {
    // A town square: gabled houses, a church spire, sky.
    const cols = ['#d8c49a', '#c8a882', '#e0d0a8', '#b89a78'];
    for (let i = 0; i < 6; i++) { const z = i * 2.2; P(z, z + 2.0, 0, 5 + (i % 3), cols[i % 4]); P(z + 0.3, z + 1.7, 5 + (i % 3), 6.5 + (i % 3), '#8a5a40'); for (let w = 0; w < 2; w++) P(z + 0.4 + w * 0.8, z + 0.8 + w * 0.8, 2.2, 3.2, '#4a5a6a', true); }
    P(5.5, 6.6, 6, 11.5, '#9a9488'); P(5.8, 6.3, 11.5, 12.4, '#6a6460');
    P(0, 13.5, 0, 0.4, '#8a8a6a');
  } else if (name === 'garden') {
    for (let i = 0; i < 7; i++) { const z = i * 1.9; P(z, z + 1.8, 0, 3.5 + (i % 3), i % 2 ? '#5a7a46' : '#4a6a3a'); P(z + 0.6, z + 1.2, 0, 1.2, '#6a4a2e'); }
    P(4.5, 8, 0, 4.2, '#e0d4b8'); P(5.6, 6.8, 0, 2.4, '#5a4a3a', true); P(4.2, 8.3, 4.2, 5.2, '#a85a40');
    for (let i = 0; i < 9; i++) P(i * 1.5, i * 1.5 + 0.35, 0.3, 0.7, i % 2 ? '#e8a0b0' : '#f0e0a0');
  } else if (name === 'church') {
    for (let i = 0; i < 4; i++) { const z = i * 3.3; P(z, z + 0.8, 0, 11, '#7a7670'); P(z + 1.0, z + 2.8, 3, 9, '#5a6a9a', true); P(z + 1.4, z + 2.4, 9, 10.2, '#6a7a8a'); }
    P(0, 13.5, 11, 12.5, '#6a6660');
  } else if (name === 'study') {
    P(0, 13.5, 0, 12.5, '#6a4a32');
    for (let i = 0; i < 3; i++) P(0.6 + i * 2.6, 2.6 + i * 2.6, 0.5, 5.5, '#7a3a2a');
    P(9, 12, 3, 9, '#7a8aa0', true); P(10.4, 10.6, 3, 9, '#3a2a20');
  } else if (name === 'walpurgis') {
    for (let i = 0; i < 6; i++) { const z = i * 2.4; P(z, z + 2.6, 0, 3 + ((i * 7) % 5), i % 2 ? '#3a3040' : '#2e2836'); }
    P(3, 8, 9, 10.5, '#8a4a5a'); P(7, 9, 1, 2, '#c84a2a', true);
  }
}
function wingPaint(q, name, px, py) {
  const P = (z0, z1, ya, yb, c) => q.box(px - 0.1, py + ya, z0, px - 0.05, py + yb, z1, mat({ c, c2: '#8a7a5a', pat: 'canvas', s: 0.6 }));
  if (name === 'fair') { P(8.6, 11.7, 0, 7, '#d8c49a'); P(9.0, 11.3, 7, 9, '#8a5a40'); P(9.4, 10.2, 2, 3.4, '#4a5a6a'); }
  else if (name === 'garden') { P(8.5, 11.8, 2, 10, '#4a6a3a'); P(9.8, 10.4, 0, 3, '#6a4a2e'); }
  else if (name === 'church') { P(8.5, 9.6, 0, 10.5, '#7a7670'); P(9.6, 11.8, 6, 8, '#6a6660'); }
  else if (name === 'study') { P(8.5, 11.8, 0, 10.5, '#6a4a32'); P(9.2, 11.2, 1, 6, '#7a3a2a'); }
  else { P(8.5, 11.8, 0, 6, '#3a3040'); P(9, 11, 6, 9, '#2e2836'); }
}
