/* Panel B: across the station, seen from behind (the wake view), port on the left.
 *
 * x = 155 + metres to starboard. The 108.5 m truss runs across the top at its true height
 * (y 3.0 to 7.6) with its eight solar wings; below it, two transverse slices of the station
 * are pulled apart vertically: the Harmony slice (Kibo, Harmony end-on, Columbus) at y = -8
 * and the Unity slice (PMA-3, Tranquility with the Cupola, Unity end-on, Quest) at y = -24.
 * Zone table B1 to B24 in the dossier.
 */
import { mat, shade } from '../../engine/index.js';
import { clutter, M, TAU, shellX, rackInterior, rackFace, laptop, lightBar, handrail, ctb, hatchRing, hatchSquare, bulkhead, lattice } from './common.js';

export const TY = 5.3, TZ = 2.45; // truss axis (Panel B)
export const HY = -8, UY = -24; // exploded slice axes
export const XB = {
  p6: [99.2, 117.5], p5: [117.5, 120.9], p34: [120.9, 134.6], p1: [134.6, 148.3], s0: [148.3, 161.7], s1: [161.7, 175.4],
  s34: [175.4, 189.1], s5: [189.1, 192.5], s6: [192.5, 206.2], sarjP: 127.7, sarjS: 182.3,
  kibo: [141.6, 152.8], elm: [144.8, 149.2], ef: [136.0, 141.6], hub: [152.85, 157.15], columbus: [157.2, 164.1],
  pma3: [144.3, 146.2], tranq: [146.2, 152.85], cupola: [148.0, 151.0], quest: [157.15, 160.4], crewlock: [160.4, 162.65],
};
const FEETB = (yc) => yc - 0.92;

function rackB(k, kind, x, yc, z = 1.05) {
  const y0 = yc - 1.0, y1 = yc + 1.0;
  if (kind === 'stow') { for (let j = 0; j < 4; j++) ctb(k, x, y0 + 0.05 + j * 0.48, z - 0.34, 0.86, 0.42, 0.34, j % 2 ? M.bag : M.bagB); return; }
  const look = {
    express: mat({ c: '#d2d0c8', c2: '#b2b0a6', pat: 'tiles', s: 0.2 }),
    sys: mat({ c: '#b4b6b4', c2: '#8e908e', pat: 'grate' }),
    white: mat({ c: '#f0eee6', c2: '#dcdad2', pat: 'panels', s: 0.5 }),
    grey: mat({ c: '#a8aaa8', c2: '#8a8c8a', pat: 'panels', s: 0.33 }),
    blue: mat({ c: '#b8c4d4', c2: '#9aa8ba', pat: 'panels', s: 0.4 }),
  }[kind] || mat({ c: '#e2ded2', c2: '#cac6ba', pat: 'panels', s: 0.25 });
  rackFace(k, x, y0, y1, z, look);
}

export function buildAcross(k, SP, PARTS) {
  // ================================================================ the truss
  const tr = (x0, x1, bay = 2.3) => lattice(k, 'x', x0 + 0.08, x1 - 0.08, TY, TZ, 4.4, 4.4, M.truss, bay, { t: 0.15 });
  tr(XB.p34[0] + 6.8, XB.p34[1]); // P3 (inboard of the port rotary joint)
  tr(...XB.p1); tr(...XB.s0); tr(...XB.s1);
  tr(XB.s34[0], XB.sarjS - 0.6);
  // Equipment boxes in gold blankets, the Mobile Transporter's rails along the top.
  for (let x = XB.p34[0] + 7.5; x < XB.s34[0] + 6; x += 3.3) k.box(x, TY - 1.6, TZ - 1.0, x + 1.9, TY - 0.3, TZ + 1.2, M.gold);
  for (const z of [TZ - 1.4, TZ + 1.4]) k.box(XB.p1[0], TY + 2.2, z - 0.08, XB.s1[1], TY + 2.32, z + 0.08, M.steel);
  // Ammonia lines and cable trays along the inboard truss, and grapple fixtures for the arm.
  for (const [dy, c] of [[-2.0, '#c8ccd2'], [-1.85, '#d8b040'], [2.0, '#c8ccd2']]) k.cyl(XB.p34[0] + 6.9, TY + dy, TZ - 2.1, 0.06, XB.s34[0] + 6.5 - (XB.p34[0] + 6.9), mat({ c, whole: true }), { axis: 'x', seg: 6 });
  for (const x of [139.0, 152.0, 158.5, 171.0]) { k.box(x - 0.35, TY - 2.35, TZ - 0.35, x + 0.35, TY - 2.2, TZ + 0.35, M.alu); k.cyl(x, TY - 2.75, TZ, 0.06, 0.4, M.steel, { seg: 6 }); }
  // Rotary joints.
  for (const x of [XB.sarjP, XB.sarjS]) k.cyl(x - 0.5, TY, TZ, 1.6, 1.0, mat({ c: '#b8bcc4', c2: '#9aa0a8', pat: 'rings', s: 0.2, whole: true }), { axis: 'x', seg: 22 });
  // New cargo delivered by Endeavour: the Alpha Magnetic Spectrometer on S3, ELC-3 on P3.
  {
    const ax = 179.2, ay = TY + 2.3;
    k.box(ax - 2.2, ay, TZ - 1.6, ax + 2.2, ay + 0.6, TZ + 1.6, M.alu);
    k.cyl(ax, ay + 0.6, TZ, 1.55, 2.4, mat({ c: '#d8d4c8', c2: '#bab6aa', pat: 'panels', s: 0.5, cut: '#5a5e66' }), { seg: 20 });
    k.cyl(ax, ay + 3.0, TZ, 1.75, 0.35, mat({ c: '#c9a04a', c2: '#a8802e', pat: 'quilt', s: 0.3 }), { seg: 20 });
    k.box(ax - 1.9, ay + 0.6, TZ - 1.9, ax - 1.5, ay + 3.3, TZ + 1.9, M.radiator);
    k.box(ax + 1.5, ay + 0.6, TZ - 1.9, ax + 1.9, ay + 3.3, TZ + 1.9, M.radiator);
    SP.ams = [ax, ay + 3.4, TZ];
    const ex = 131.0;
    k.box(ex - 2.0, TY + 2.25, TZ - 1.3, ex + 2.0, TY + 2.45, TZ + 1.3, M.alu);
    for (const [dx, h, c] of [[-1.3, 0.9, '#e8e4d8'], [0, 1.2, '#c9a04a'], [1.3, 0.7, '#d8d4c8']]) k.box(ex + dx - 0.5, TY + 2.45, TZ - 0.9, ex + dx + 0.5, TY + 2.45 + h, TZ + 0.9, mat(c));
    SP.elc3 = [ex, TY + 3.4, TZ];
  }
  // Main radiators on P1 and S1: three eight-panel radiators each, on slowly turning beams.
  PARTS.hrsB = [];
  for (const xc of [141.45, 168.55]) {
    PARTS.hrsB.push(k.part(xc, TY - 2.2, TZ, (q) => {
      for (let i = 0; i < 3; i++) {
        const x0 = -4.6 + i * 3.2;
        q.box(x0, -0.12, -0.12, x0 + 2.9, 0.12, 0.12, M.alu);
        for (let p = 0; p < 8; p++) q.box(x0 + 0.05, -0.03, 0.3 + p * 1.95, x0 + 2.85, 0.03, 2.15 + p * 1.95, M.radiator);
      }
    }, { whole: true }));
  }
  // Outboard truss and wings on each side turn with their rotary joint.
  PARTS.sarjB = [];
  const outboard = (pivot, segs, pairs) => k.part(pivot, TY, TZ, (q) => {
    for (const [a, b] of segs) lattice(q, 'x', a - pivot + 0.08, b - pivot - 0.08, 0, 0, 4.2, 4.2, M.truss, 2.3, { t: 0.14 });
    for (const xc of pairs) {
      wingPairX(q, xc - pivot);
      // Photovoltaic radiator (one per array pair), reaching back into depth.
      q.box(xc - pivot + 4.2, -0.06, 0.5, xc - pivot + 7.3, 0.06, 14.1, M.radiator);
    }
  }, { whole: true });
  PARTS.sarjB.push(outboard(XB.sarjP, [[XB.p6[0], XB.p6[1]], [XB.p5[0], XB.p5[1]], [XB.p34[0], XB.sarjP - 0.5]], [108.4, 124.2]));
  PARTS.sarjB.push(outboard(XB.sarjS, [[XB.sarjS + 0.5, XB.s34[1]], [XB.s5[0], XB.s5[1]], [XB.s6[0], XB.s6[1]]], [185.9, 199.6]));

  // Mobile Base System on its transporter, parked on S0, with Canadarm2 and Dextre.
  {
    const mx = 152.0, my = TY + 2.3;
    k.box(mx - 2.85, my, TZ - 2.25, mx + 2.85, my + 1.0, TZ + 2.25, mat({ c: '#e4e2da', c2: '#cfcdc4', pat: 'panels', s: 0.9, cut: '#5a5e66' }));
    k.box(mx - 2.4, my + 1.0, TZ - 1.8, mx + 2.4, my + 1.5, TZ + 1.8, M.gold);
    SP.mbs = [mx, my + 1.5, TZ];
    PARTS.arm = canadarm(k, mx - 1.6, my + 1.5, TZ - 0.4);
    // Dextre: a two-armed handyman, 3.5 m tall, standing on the base.
    const dx = mx + 1.7, dy = my + 1.5;
    k.box(dx - 0.35, dy, TZ - 0.4, dx + 0.35, dy + 2.6, TZ + 0.4, mat({ c: '#e8e4d8', c2: '#d0ccc0', pat: 'panels', s: 0.6 }));
    k.box(dx - 0.5, dy + 2.6, TZ - 0.5, dx + 0.5, dy + 3.1, TZ + 0.5, mat({ c: '#c8c4b8' }));
    k.cyl(dx, dy + 3.1, TZ, 0.18, 0.35, M.steel, { seg: 10 });
    for (const s of [-1, 1]) {
      k.box(dx + s * 0.35, dy + 2.2, TZ - 0.12, dx + s * 1.4, dy + 2.35, TZ + 0.12, M.white);
      k.box(dx + s * 1.3, dy + 0.9, TZ - 0.12, dx + s * 1.45, dy + 2.35, TZ + 0.12, M.white);
      k.box(dx + s * 1.25, dy + 0.75, TZ - 0.2, dx + s * 1.5, dy + 0.95, TZ + 0.2, M.black);
    }
    k.cyl(dx, dy - 0.1, TZ, 0.32, 0.15, M.steel, { seg: 12 });
    SP.dextre = [dx, dy, TZ];
  }
  // ================================================================ Harmony slice (y = -8)
  const hy = HY;
  // ---- Kibo pressurised module
  {
    const [x0, x1] = XB.kibo;
    shellX(k, [[x0, 1.2, 1.05], [x0 + 0.6, 2.2, 2.05], [x1 - 0.45, 2.2, 2.05], [x1, 1.1, 0.95]], hy, M.hullJP, 16);
    const i0 = x0 + 0.6, i1 = x1 - 0.45;
    rackInterior(k, i0, i1, hy, { a: 1.05, ri: 2.02, gaps: { over: [[144.95, 149.05]] } });
    clutter(k, i0 + 0.1, i1 - 0.1, hy, 'kibo', { over: false });
    bulkhead(k, i0 + 0.05, hy); bulkhead(k, i1 - 0.05, hy);
    const kinds = ['white', 'express', 'white', 'grey', 'blue', 'express', 'stow', 'sys', 'white'];
    for (let i = 0; i < 9; i++) { const x = i0 + 0.6 + i * 1.07; if (x < i1 - 0.4) rackB(k, kinds[i], x, hy); }
    // Two MELFI freezers: dewar doors on the first and third racks.
    for (const x of [i0 + 0.6, i0 + 2.74]) for (let j = 0; j < 4; j++) k.cyl(x + (j % 2 ? 0.22 : -0.22), hy - 0.45 + Math.floor(j / 2) * 0.75, 0.97, 0.17, 0.05, M.alu, { axis: 'z', seg: 14 });
    SP.melfi = [i0 + 0.6, FEETB(hy), 0.55];
    // The port end: robot-arm console, and the small experiment airlock with two windows above it.
    k.box(i0 + 0.12, hy - 0.5, 0.2, i0 + 0.22, hy + 0.5, 0.9, M.bulk);
    k.box(i0 + 0.22, hy + 0.2, 0.25, i0 + 0.5, hy + 0.6, 0.85, mat({ c: '#4a4c50', c2: '#2a2c30', pat: 'panels', s: 0.2 }));
    for (const z of [0.35, 0.75]) k.box(i0 + 0.5, hy + 0.3, z - 0.12, i0 + 0.52, hy + 0.55, z + 0.12, M.screenNight);
    k.cyl(i0 + 0.05, hy - 0.35, 0.55, 0.42, 0.18, M.alu, { axis: 'x', seg: 16 });
    for (const yy of [0.55, 0.95]) k.cyl(x0 + 0.25, hy + yy, 0.65, 0.12, 0.08, mat({ c: '#22303a', c2: '#ffe0a0', glow: 'night' }), { axis: 'x', seg: 10 });
    SP.kiboConsole = [i0 + 0.75, FEETB(hy), 0.55];
    lightBar(k, i0 + 0.3, i1 - 0.3, hy + 0.98, 0.92, { every: 2.4, r: 3.4, i: 0.95 });
    handrail(k, i0 + 0.3, i1 - 0.3, hy - 0.75, 1.0);
    for (let i = 0; i < 4; i++) ctb(k, 149.6 + i * 0.6, hy - 1.05, 0.15, 0.5, 0.3, 0.6, i % 2 ? M.bag : M.bagB);
  }
  // ---- Kibo logistics module (ELM-PS) on top
  {
    const cx = 147.0, y0 = hy + 2.2, y1 = hy + 6.4;
    const pts = [];
    const prof = [[y0, 1.05, 0.9], [y0 + 0.4, 2.2, 2.05], [y1 - 0.4, 2.2, 2.05], [y1, 1.6, 1.45]];
    for (const [y, ro] of prof) pts.push([ro, y]);
    for (let i = prof.length - 1; i >= 0; i--) pts.push([prof[i][2], prof[i][0]]);
    pts.push(pts[0]);
    k.lathe(pts, cx, 0, M.hullJP, { seg: 20, a0: -0.3, a1: Math.PI + 0.3, capTop: false, capBot: false });
    k.box(cx - 1.9, y0 + 0.45, 0.9, cx + 1.9, y1 - 0.45, 1.85, M.rack);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) ctb(k, cx - 1.1 + i * 1.1, y0 + 0.55 + j * 1.05, 0.45, 0.9, 0.5, 0.42, (i + j) % 2 ? M.bag : M.bagB);
    k.lamp(cx, y1 - 0.9, 0.7, { color: '#dfe8ff', r: 2.8, i: 0.55, bulb: false, halo: 0.25 });
    k.box(cx - 0.4, y1 - 0.62, 0.6, cx + 0.4, y1 - 0.55, 1.0, M.light);
    SP.elm = [cx - 0.3, y0 + 0.5, 0.5];
  }
  // ---- Kibo Exposed Facility: the outdoor porch, with experiment boxes
  {
    const [x0, x1] = XB.ef;
    const EF = mat({ c: '#e2e0d6', c2: '#c8c6bc', pat: 'panels', s: 1.0, cut: '#5a5e66' });
    k.box(x0, hy - 2.0, 0.2, x1, hy - 1.4, 5.0, EF);
    k.box(x1 - 0.4, hy - 2.0, 0.2, x1, hy + 1.6, 1.0, EF);
    const cols = ['#c9a04a', '#e8e4d8', '#d8d4c8', '#c9a04a', '#b8bcc4'];
    for (let i = 0; i < 5; i++) {
      const bx = x0 + 0.6 + (i % 3) * 1.6, bz = i < 3 ? 1.0 : 3.2;
      k.box(bx, hy - 1.4, bz, bx + 1.3, hy - 1.4 + 0.9 + (i % 2) * 0.5, bz + 1.6, mat({ c: cols[i], c2: '#a8802e', pat: i % 3 ? 'panels' : 'quilt', s: 0.4 }));
    }
    PARTS.kiboArm = kiboArm(k, x1 - 0.2, hy + 2.2, 0.8);
  }
  // ---- Harmony, end-on: the ring of four crew quarters around the aisle
  {
    const cx = 155.0;
    hubSection(k, cx, hy, M.hullUS, 3.35);
    const CQ = mat({ c: '#d9dde2', c2: '#c4c8ce', pat: 'panels', s: 0.5, cut: '#6a707a' });
    const inner = mat({ c: '#b8c4d4', c2: '#a8b4c4', pat: 'quilt', s: 0.3, cut: '#5a6470' });
    const z0 = -0.5, z1 = 1.05;
    // Starboard and port booths (stand-up sleepers), deck and overhead (sleepers lying across).
    const booths = [
      { box: [cx + 0.72, hy - 1.05, cx + 1.85, hy + 1.05], feet: [cx + 1.45, hy - 0.98], face: -1, kind: 'stand' },
      { box: [cx - 1.85, hy - 1.05, cx - 0.72, hy + 1.05], feet: [cx - 1.45, hy - 0.98], face: 1, kind: 'stand' },
      { box: [cx - 1.05, hy - 1.85, cx + 1.05, hy - 0.72], feet: [cx + 0.9, hy - 1.55], face: 1, kind: 'lie' },
      { box: [cx - 1.05, hy + 0.72, cx + 1.05, hy + 1.85], feet: [cx + 0.9, hy + 1.15], face: -1, kind: 'lie' },
    ];
    SP.cq = [];
    for (const b of booths) {
      const [bx0, by0, bx1, by1] = b.box;
      // Walls of the booth (back, sides) and its padded lining; open at the cut.
      k.box(bx0, by0, z1 - 0.06, bx1, by1, z1, CQ);
      const vert = by1 - by0 > bx1 - bx0;
      if (vert) { k.box(bx0, by0, z0, bx1, by0 + 0.06, z1, CQ); k.box(bx0, by1 - 0.06, z0, bx1, by1, z1, CQ); }
      else { k.box(bx0, by0, z0, bx0 + 0.06, by1, z1, CQ); k.box(bx1 - 0.06, by0, z0, bx1, by1, z1, CQ); }
      const outer = b.box[0] > cx ? [bx1 - 0.08, by0, z0, bx1, by1, z1] : b.box[2] < cx ? [bx0, by0, z0, bx0 + 0.08, by1, z1] : b.box[1] > hy ? [bx0, by1 - 0.08, z0, bx1, by1, z1] : [bx0, by0, z0, bx1, by0 + 0.08, z1];
      k.box(...outer, inner);
      // Lamp, laptop and the air vent each crew quarter has.
      const lx = (bx0 + bx1) / 2, ly = (by0 + by1) / 2;
      k.lamp(lx, vert ? by1 - 0.25 : ly, 0.6, { color: '#f4ecd8', r: 1.3, i: 0.45, bulb: true, bulbR: 0.035, halo: 0.18 });
      k.box(lx - 0.15, ly - 0.1, z1 - 0.1, lx + 0.15, ly + 0.1, z1 - 0.06, M.screenNight);
      k.box(lx + 0.2, ly + 0.25, z1 - 0.08, lx + 0.38, ly + 0.4, z1 - 0.06, mat({ c: '#9aa0a8', c2: '#6a7078', pat: 'grate' }));
      // The sleeping bag, tied to the wall: its occupant's head and arms stay out.
      const BAGS = ['#4a6a9a', '#7a4a6a', '#5a7a4a', '#8a6a3a'];
      const bagM = mat({ c: BAGS[SP.cq.length], c2: shade(BAGS[SP.cq.length], 0.18), pat: 'quilt', s: 0.16, cut: '#3a3a44' });
      if (b.kind === 'stand') {
        const sx = b.face < 0 ? b.feet[0] - 0.22 : b.feet[0] - 0.13;
        k.box(sx, b.feet[1] + 0.05, 0.22, sx + 0.35, b.feet[1] + 1.15, 0.7, bagM);
      } else {
        const x1 = b.feet[0] + 0.08, x0 = b.feet[0] - 1.15; // both lying sleepers have their heads to port
        const yb = b.feet[1] - 0.2;
        k.box(Math.min(x0, x1), yb, 0.22, Math.max(x0, x1), yb + 0.42, 0.7, bagM);
      }
      SP.cq.push({ at: [b.feet[0], b.feet[1], 0.45], face: b.face, kind: b.kind });
    }
    // A flute strapped inside one crew quarter; earplugs and a sleep mask on a cord.
    k.cyl(cx + 0.8, hy + 0.55, 0.85, 0.012, 0.55, M.alu, { axis: 'y', seg: 6 });
    k.box(cx - 1.6, hy + 0.5, 0.95, cx - 1.45, hy + 0.58, 0.98, mat('#2a2a3a'));
    k.sphere(cx - 1.5, hy + 0.3, 0.93, 0.02, mat('#e8a040'), { seg: 5, rings: 3 });
    SP.flute = [cx + 0.8, hy + 0.8, 0.85];
    SP.harmonyHub = [cx, FEETB(hy) + 0.3, 0.45];
  }
  // ---- Columbus
  {
    const [x0, x1] = XB.columbus;
    shellX(k, [[x0, 1.1, 0.95], [x0 + 0.55, 2.25, 2.1], [x1 - 0.7, 2.25, 2.1], [x1, 1.3, 1.15]], hy, M.hullEU, 16);
    const i0 = x0 + 0.55, i1 = x1 - 0.7;
    rackInterior(k, i0, i1, hy, { a: 1.05, ri: 2.07 });
    clutter(k, i0 + 0.1, i1 - 0.1, hy, 'columbus');
    bulkhead(k, i0 + 0.05, hy); k.box(i1 - 0.05, hy - 1.05, -0.5, i1 + 0.05, hy + 1.05, 1.05, M.bulk);
    // BioLab with its centrifuge, the Microgravity Science Glovebox, the European Physiology Modules.
    rackB(k, 'white', i0 + 0.6, hy);
    k.cyl(i0 + 0.6, hy + 0.3, 0.98, 0.3, 0.05, M.black, { axis: 'z', seg: 18 });
    PARTS.centrifuge = k.part(i0 + 0.6, hy + 0.3, 0.97, (q) => {
      q.box(-0.26, -0.03, -0.02, 0.26, 0.03, 0, M.alu);
      q.box(-0.03, -0.26, -0.02, 0.03, 0.26, 0, M.alu);
      for (const [x, y] of [[0.24, 0], [-0.24, 0], [0, 0.24], [0, -0.24]]) q.box(x - 0.04, y - 0.04, -0.05, x + 0.04, y + 0.04, 0, mat('#d8b040'));
    });
    rackB(k, 'grey', i0 + 1.67, hy);
    k.box(i0 + 1.27, hy - 0.1, 0.55, i0 + 2.07, hy + 0.45, 1.0, mat({ c: '#5a5e66' })); // glovebox work volume
    for (const dx of [-0.15, 0.15]) k.cyl(i0 + 1.67 + dx, hy + 0.15, 0.55, 0.07, 0.25, mat('#2a2a2e'), { axis: 'z', seg: 8 });
    rackB(k, 'blue', i0 + 2.74, hy);
    rackB(k, 'express', i0 + 3.81, hy);
    rackB(k, 'white', i0 + 4.88, hy);
    for (let i = 0; i < 5; i++) k.box(i0 + 0.15 + i * 1.07, hy - 1.05, 0.08, i0 + 0.95 + i * 1.07, hy - 1.02, 0.95, mat({ c: '#d8d4ca', c2: '#c0bcb0', pat: 'panels', s: 0.32 }));
    lightBar(k, i0 + 0.3, i1 - 0.3, hy + 0.98, 0.92, { every: 2.2, r: 3.3, i: 0.95 });
    handrail(k, i0 + 0.3, i1 - 0.3, hy - 0.75, 1.0);
    // A hand-written welcome card tucked behind a handrail.
    k.box(i1 - 0.9, hy - 0.73, 0.94, i1 - 0.72, hy - 0.62, 0.96, mat('#f4ecd8'));
    SP.card = [i1 - 0.81, hy - 0.68, 0.95];
    SP.epm = [i0 + 2.74, FEETB(hy), 0.55];
    SP.biolab = [i0 + 0.6, FEETB(hy), 0.5];
    // External payload platform on the end cone.
    k.box(x1 - 0.2, hy - 1.6, 0.4, x1 + 1.0, hy - 0.4, 1.7, mat({ c: '#c9a04a', c2: '#a8802e', pat: 'quilt', s: 0.3 }));
    k.box(x1 - 0.2, hy + 0.4, 0.4, x1 + 0.9, hy + 1.5, 1.6, M.white);
  }
  // ================================================================ Unity slice (y = -24)
  const uy = UY;
  // ---- PMA-3 on Tranquility's port end
  for (let i = 0; i < 3; i++) {
    const [x0, x1] = XB.pma3, L = x1 - x0;
    const a = x0 + (L * i) / 3, b = x0 + (L * (i + 1)) / 3, r = 0.7 + (i / 2) * 0.27;
    shellX(k, [[a, r, r - 0.13], [b, r, r - 0.13]], uy + [0, -0.18, 0][i], M.hullPMA, 12);
  }
  // ---- Tranquility (Node 3): life support, toilet, gym, and the hatch down to the Cupola
  {
    const [x0, x1] = XB.tranq;
    shellX(k, [[x0, 1.02, 0.88], [x0 + 0.55, 2.15, 2.0], [x1 - 0.5, 2.15, 2.0], [x1, 1.02, 0.88]], uy, M.hullUS, 16);
    const i0 = x0 + 0.55, i1 = x1 - 0.5;
    const cupHole = [148.85, 150.15];
    rackInterior(k, i0, i1, uy, { gaps: { deck: [cupHole], back: [[146.8, 147.85]] } });
    clutter(k, 147.9, i1 - 0.1, uy, 'tranq');
    bulkhead(k, i0 + 0.05, uy); bulkhead(k, i1 - 0.05, uy);
    // Waste and Hygiene Compartment: a booth with a folding door.
    k.box(146.8, uy - 1.0, 1.0, 147.85, uy + 1.0, 1.9, mat({ c: '#e0e2e4', c2: '#c8cacc', pat: 'panels', s: 0.4, cut: '#6a6e78' }));
    k.box(146.85, uy - 0.95, 0.95, 147.8, uy + 0.95, 1.0, mat({ c: '#b8c4d0', c2: '#a8b4c0', pat: 'stripes', s: 0.1 }));
    SP.whc = [147.3, FEETB(uy), 0.55];
    // Life-support racks: oxygen generation, water recovery, air revitalisation.
    rackB(k, 'sys', 148.5, uy); rackB(k, 'grey', 150.6, uy); rackB(k, 'sys', 151.65, uy);
    k.cyl(150.2, uy + 0.2, 0.95, 0.18, 0.08, mat({ c: '#c8ccd2' }), { axis: 'z', seg: 12 });
    k.box(150.15, uy + 0.12, 0.92, 150.25, uy + 0.32, 0.95, mat('#3a7ab0'));
    SP.wrs = [151.1, FEETB(uy), 0.5];
    // T2 treadmill on the far wall... here bolted to the deck, the runner held down by bungees.
    k.box(150.4, uy - 1.05, 0.2, 152.0, uy - 0.95, 0.95, M.steel);
    PARTS.t2belt = k.part(151.2, uy - 0.95, 0.575, (q) => {
      q.box(-0.75, 0, -0.32, 0.75, 0.06, 0.32, mat({ c: '#2a2a2e', c2: '#45454a', pat: 'stripes', s: 0.12 }));
    });
    for (const x of [150.45, 151.95]) k.box(x - 0.03, uy - 0.95, 0.15, x + 0.03, uy - 0.05, 0.22, M.steel);
    SP.t2 = [151.2, uy - 0.89, 0.55];
    // ARED: a bar on vacuum cylinders, on a frame bolted to the deck.
    k.box(146.7, uy - 1.05, 0.15, 148.2, uy - 0.95, 0.95, M.steel);
    for (const x of [146.8, 148.1]) k.box(x - 0.06, uy - 0.95, 0.5, x + 0.06, uy + 0.7, 0.62, M.steel);
    for (const x of [146.95, 147.95]) k.cyl(x, uy - 0.95, 0.85, 0.12, 0.7, mat({ c: '#c8ccd2', c2: '#a8acb2', pat: 'rings', s: 0.1 }), { seg: 10 });
    PARTS.aredBar = k.part(147.45, uy + 0.1, 0.56, (q) => {
      q.cyl(-0.9, 0, 0, 0.03, 1.8, M.steel, { axis: 'x', seg: 6 });
      for (const x of [-0.8, 0.8]) q.cyl(x, 0, 0, 0.09, 0.06, M.black, { axis: 'x', seg: 10 });
    });
    SP.ared = [147.45, uy - 0.94, 0.55];
    lightBar(k, i0 + 0.3, i1 - 0.3, uy + 0.98, 0.92, { every: 2.2, r: 3.4, i: 0.95 });
    handrail(k, i0 + 0.3, i1 - 0.3, uy + 0.75, 1.0);
    // Cupola hatch frame in the deck.
    for (const x of cupHole) k.box(x - 0.04, uy - 2.0, -0.2, x + 0.04, uy - 1.05, 1.0, M.alu);
  }
  // ---- The Cupola: seven windows looking down at the Earth, with a robotics workstation
  {
    const cx = 149.5, top = uy - 2.15, bot = uy - 3.65;
    const CU = mat({ c: '#d8dade', c2: '#c0c4ca', pat: 'rivets', s: 0.35, cut: '#4a5060' });
    // Frame: a six-sided frustum, the near half cut away; windows between the posts.
    const R0 = 1.48, R1 = 0.62;
    const ring6 = (r, y) => { const p = []; for (let i = 0; i <= 6; i++) { const a = -Math.PI / 6 + (i / 6) * TAU - Math.PI / 2; p.push([cx + Math.cos(a) * r, y, Math.sin(a) * r]); } return p; };
    const A = ring6(R0, top), B = ring6(R1, bot + 0.1);
    k.lathe([[R0 + 0.05, top], [R0 + 0.05, top + 0.2], [0.9, top + 0.2], [0.9, top]], cx, 0, CU, { seg: 12, a0: -0.3, a1: Math.PI + 0.3, capTop: false, capBot: false });
    for (let i = 0; i < 6; i++) {
      const p = A[i], q = A[i + 1], s = B[i + 1], t = B[i];
      if (Math.max(p[2], q[2]) < -0.2) continue;
      // posts
      k.beam(p, t, 0.12, CU);
      // window glass, Earth light at night
      k.glass([lerp3(p, q, 0.12, t, s, 0.1), lerp3(p, q, 0.88, t, s, 0.1), lerp3(p, q, 0.88, t, s, 0.9), lerp3(p, q, 0.12, t, s, 0.9)], { c: '#9ec4dc', alpha: 0.22 });
      // open shutters, folded out
      const mid = [(p[0] + q[0]) / 2, top - 0.1, (p[2] + q[2]) / 2];
      k.box(mid[0] - 0.25, mid[1] - 0.05, Math.max(-0.4, mid[2]) , mid[0] + 0.25, mid[1] + 0.02, Math.max(-0.4, mid[2]) + 0.12, mat({ c: '#e8e6dc' }));
    }
    // The round top window, 80 cm across, at the bottom (facing the Earth).
    k.lathe([[R1 + 0.05, bot], [R1 + 0.05, bot + 0.15], [0.42, bot + 0.15], [0.42, bot]], cx, 0, CU, { seg: 16, a0: -0.3, a1: Math.PI + 0.3, capTop: false, capBot: false });
    k.glass([[cx - 0.42, bot + 0.05, 0], [cx + 0.42, bot + 0.05, 0], [cx + 0.3, bot + 0.05, 0.3], [cx - 0.3, bot + 0.05, 0.3]], { c: '#7ab0d0', alpha: 0.3 });
    // Robotics workstation: hand controllers and screens on the far side.
    k.box(cx - 0.55, top - 0.75, 0.75, cx + 0.55, top - 0.25, 0.95, mat({ c: '#4a4c50', c2: '#2a2c30', pat: 'panels', s: 0.2 }));
    for (const dx of [-0.3, 0.3]) k.box(cx + dx - 0.18, top - 0.62, 0.72, cx + dx + 0.18, top - 0.36, 0.75, M.screenNight);
    for (const dx of [-0.45, 0.45]) k.box(cx + dx - 0.04, top - 0.8, 0.55, cx + dx + 0.04, top - 0.68, 0.72, M.black);
    k.lamp(cx, top - 0.4, 0.45, { color: '#cfe0ff', r: 1.8, i: 0.45, bulb: false, halo: 0.2 });
    SP.cupola = [[cx - 0.32, uy - 1.0, 0.45], [cx + 0.38, uy - 1.0, 0.6]]; // feet up in Tranquility, heads down in the dome
  }
  // ---- Unity, end-on: the galley table seen in the section
  {
    const cx = 155.0;
    hubSection(k, cx, uy, M.hullUS, 2.75);
    k.box(cx - 0.7, uy - 0.3, 0.2, cx + 0.7, uy - 0.25, 1.0, mat({ c: '#c8c4b8', c2: '#aaa69a', pat: 'panels', s: 0.36, cut: '#6a665a' }));
    k.cyl(cx, uy - 1.05, 0.6, 0.05, 0.75, M.alu, { seg: 8 });
    for (let i = 0; i < 5; i++) k.box(cx - 0.55 + i * 0.25, uy - 0.25, 0.3 + (i % 2) * 0.35, cx - 0.45 + i * 0.25, uy - 0.22, 0.42 + (i % 2) * 0.35, mat(['#d84a3a', '#e8c040', '#5a9a4a', '#f0eee6', '#6a8ac8'][i]));
    SP.unityHub = [cx, FEETB(uy), 0.5];
  }
  // ---- Quest airlock: equipment lock with two spacesuits, and the smaller crew lock
  {
    const [x0, x1] = XB.quest, [c0, c1] = XB.crewlock;
    shellX(k, [[x0, 1.02, 0.88], [x0 + 0.4, 2.0, 1.86], [x1, 2.0, 1.86], [x1 + 0.3, 1.2, 1.06], [c1 - 0.2, 1.2, 1.06], [c1, 0.85, 0.7]], uy, M.hullUS, 16);
    rackInterior(k, x0 + 0.4, x1, uy, { a: 1.0, ri: 1.84 });
    k.box(x1 - 0.05, uy - 1.0, -0.5, x1 + 0.05, uy - 0.55, 1.0, M.bulk);
    k.box(x1 - 0.05, uy + 0.55, -0.5, x1 + 0.05, uy + 1.0, 1.0, M.bulk);
    k.box(c0 + 0.1, uy - 1.06, -0.5, c1 - 0.2, uy - 0.95, 1.0, M.rackDark);
    // Battery chargers, water recharge bags, toolboxes.
    for (let i = 0; i < 3; i++) k.box(x0 + 0.6 + i * 0.5, uy + 0.5, 0.85, x0 + 1.0 + i * 0.5, uy + 0.85, 1.0, mat({ c: '#4a4c50', c2: '#7ab0d8', pat: 'tiles', s: 0.1 }));
    for (let i = 0; i < 2; i++) k.box(x0 + 2.2 + i * 0.4, uy + 0.4, 0.75, x0 + 2.5 + i * 0.4, uy + 0.9, 1.0, mat({ c: '#d8dce4', c2: '#b8bcc4', pat: 'canvas' }));
    ctb(k, x0 + 0.9, uy - 1.0, 0.2, 0.6, 0.3, 0.5, mat({ c: '#c84a3a', cut: '#7a2e20' }));
    lightBar(k, x0 + 0.6, x1 - 0.2, uy + 0.95, 0.9, { every: 1.5, r: 3.0, i: 0.9 });
    k.lamp(c0 + 1.0, uy + 0.5, 0.4, { color: '#dfe8ff', r: 1.8, i: 0.6, bulb: false, halo: 0.2 });
    // Outer EVA hatch at the end of the crew lock.
    hatchRingX(k, c1 - 0.05, uy, 0.5);
    // Spacesuits on their don/doff stands (hidden while the spacewalkers wear them).
    PARTS.emu = [];
    for (const [i, x] of [[0, x0 + 1.15], [1, x0 + 2.35]]) {
      k.box(x - 0.05, uy - 1.0, 0.75, x + 0.05, uy - 0.2, 0.85, M.steel);
      PARTS.emu.push(k.part(x, uy - 0.95, 0.6, (q) => emuSuit(q, i === 0)));
    }
    SP.emuStand = [[x0 + 1.15, FEETB(uy), 0.6], [x0 + 2.35, FEETB(uy), 0.6]];
    SP.crewlock = [c0 + 0.9, uy - 0.9, 0.35];
    SP.campout = [[x0 + 0.6, uy - 0.92, 0.45], [x1 - 0.35, uy - 0.92, 0.45]];
    // Sleeping bags tied up among the suits for the campout.
    for (const [i, [cx, cy]] of SP.campout.entries()) k.box(cx - (i ? 0.13 : 0.22), cy + 0.05, 0.22, cx + (i ? 0.22 : 0.13), cy + 1.15, 0.7, mat({ c: i ? '#5a6a8a' : '#8a5a4a', c2: i ? '#6a7a9a' : '#9a6a5a', pat: 'quilt', s: 0.16 }));
    SP.questOut = [c1 + 0.4, uy - 0.6, 0.6];
    // High-pressure oxygen and nitrogen tanks outside.
    for (const [x, y] of [[x0 + 0.8, uy + 2.4], [x0 + 2.4, uy + 2.4], [x0 + 0.8, uy - 2.4], [x0 + 2.4, uy - 2.4]]) k.sphere(x, y, 0.8, 0.55, mat({ c: '#d8dce0', c2: '#b8bcc0', pat: 'rings', s: 0.15 }), { seg: 12, rings: 8 });
  }
}

const lerp3 = (p, q, u, t, s, v) => {
  const a = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
  const b = [t[0] + (s[0] - t[0]) * u, t[1] + (s[1] - t[1]) * u, t[2] + (s[2] - t[2]) * u];
  return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v, a[2] + (b[2] - a[2]) * v];
};

// A node seen end-on: hull ring cut at z = 0, running back in depth, with its rack rows receding.
function hubSection(k, cx, yc, m, depth) {
  const n = 28, ro = 2.15, ri = 2.0;
  const outer = [], inner = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; outer.push([cx + Math.cos(a) * ro, yc + Math.sin(a) * ro]); inner.push([cx + Math.cos(a) * ri, yc + Math.sin(a) * ri]); }
  k.extrude(outer, -0.5, depth, m, { holes: [inner], front: false });
  const a = 1.05, e = 1.68, R = mat({ c: '#ebe7dc', c2: '#cfcabc', pat: 'panels', s: 1.05, cut: '#8a8a82' });
  k.box(cx - e, yc - a, 1.05, cx - a, yc + a, depth, R);
  k.box(cx + a, yc - a, 1.05, cx + e, yc + a, depth, R);
  k.box(cx - a, yc - e, 1.05, cx + a, yc - a, depth, R);
  k.box(cx - a, yc + a, 1.05, cx + a, yc + e, depth, R);
  k.box(cx - a, yc - a, depth - 0.1, cx + a, yc + a, depth, mat({ c: '#3a3e46' }));
  hatchSquare(k, cx, yc, depth - 0.1, 1.15);
  k.box(cx - 0.6, yc + a - 0.06, 1.2, cx + 0.6, yc + a, 1.4, M.light);
  k.lamp(cx, yc + 0.7, 0.8, { color: '#dfe8ff', r: 2.6, i: 0.7, bulb: false, halo: 0.25 });
}

// A round hatch facing along x (the crew lock's outer hatch).
function hatchRingX(k, x, y, r) {
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a0 = -Math.PI / 2 + (i / n) * Math.PI * 1.2, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 1.2;
    k.beam([x, y + Math.sin(a0) * r, Math.cos(a0) * r], [x, y + Math.sin(a1) * r, Math.cos(a1) * r], 0.08, M.alu);
  }
}

// An empty US spacesuit (EMU) on its stand: white, with a backpack; the lead's has red stripes.
function emuSuit(q, red) {
  const W = mat({ c: '#f2f0ea', c2: '#dedcd4', pat: 'canvas', s: 0.12 });
  q.box(-0.22, 0.85, -0.18, 0.22, 1.45, 0.18, W);
  q.box(-0.2, 0.8, 0.18, 0.2, 1.5, 0.42, mat({ c: '#e8e6de', c2: '#d0cec6', pat: 'panels', s: 0.2 }));
  q.sphere(0, 1.64, 0, 0.19, W, { seg: 10, rings: 7 });
  q.sphere(0, 1.64, -0.04, 0.16, mat({ c: '#c8a040', c2: '#e8c870' }), { seg: 10, rings: 6, t0: Math.PI * 0.3, t1: Math.PI * 0.75 });
  for (const s of [-1, 1]) {
    q.box(s * 0.22 - 0.07, 0.75, -0.07, s * 0.22 + 0.07, 1.4, 0.07, W);
    q.box(s * 0.11 - 0.08, 0.0, -0.08, s * 0.11 + 0.08, 0.85, 0.08, W);
    if (red) for (const y of [0.25, 0.55]) q.box(s * 0.11 - 0.085, y, -0.085, s * 0.11 + 0.085, y + 0.07, 0.085, M.red);
  }
}

// A solar wing pair on a truss along x (Panel B), about the local origin: wings up and down.
function wingPairX(q, xc) {
  for (const s of [-1, 1]) {
    const y0 = s * 2.4, y1 = s * 37.4;
    q.box(xc - 1.0, Math.min(y0, s * 3.2), -0.5, xc + 1.0, Math.max(y0, s * 3.2), 0.5, M.wingBox);
    q.box(xc - 0.09, Math.min(y0, y1), -0.09, xc + 0.09, Math.max(y0, y1), 0.09, M.alu);
    for (const side of [-1, 1]) {
      const xa = xc + side * 0.8, xb = xc + side * 5.8;
      q.box(Math.min(xa, xb), Math.min(s * 3.3, y1), -0.03, Math.max(xa, xb), Math.max(s * 3.3, y1), 0.03, M.wingCells);
    }
    q.box(xc - 5.8, s > 0 ? y1 : y1 - 0.4, -0.5, xc + 5.8, s > 0 ? y1 + 0.4 : y1, 0.5, M.wingBox);
  }
}

// Canadarm2 on the Mobile Base: two long booms and seven joints. Returns the joint groups.
function canadarm(k, x, y, z) {
  const W = mat({ c: '#f0eee6', c2: '#dcdad2', pat: 'canvas', s: 0.4, whole: true });
  const J = mat({ c: '#c8ccd2', c2: '#a8acb2', whole: true });
  const base = k.part(x, y, z, (q) => { q.cyl(0, 0, 0, 0.3, 0.6, J, { seg: 10 }); q.sphere(0, 0.75, 0, 0.32, J, { seg: 10, rings: 6 }); });
  const boomA = sub(k, (q) => { q.cyl(0, 0, 0, 0.18, 7.6, W, { seg: 10 }); q.sphere(0, 7.8, 0, 0.32, J, { seg: 10, rings: 6 }); });
  const boomB = sub(k, (q) => { q.cyl(0, 0, 0, 0.18, 7.4, W, { seg: 10 }); q.sphere(0, 7.6, 0, 0.28, J, { seg: 10, rings: 6 }); q.cyl(0, 7.6, 0, 0.22, 1.1, J, { seg: 10 }); q.cyl(0, 8.7, 0, 0.3, 0.3, mat({ c: '#4a4c50', whole: true }), { seg: 10 }); });
  base.add(boomA); boomA.position.set(0, 0.75, 0);
  boomA.add(boomB); boomB.position.set(0, 7.8, 0);
  return { base, boomA, boomB };
}

// Kibo's robot arm: a 10 m main arm with the 2.2 m small fine arm at its end.
function kiboArm(k, x, y, z) {
  const W = mat({ c: '#ece8dc', c2: '#d4d0c4', pat: 'canvas', s: 0.3, whole: true });
  const J = mat({ c: '#c8ccd2', whole: true });
  const base = k.part(x, y, z, (q) => { q.cyl(0, -0.4, 0, 0.25, 0.4, J, { seg: 10 }); q.sphere(0, 0, 0, 0.26, J, { seg: 10, rings: 6 }); });
  const a = sub(k, (q) => { q.cyl(0, 0, 0, 0.14, 4.6, W, { seg: 8 }); q.sphere(0, 4.75, 0, 0.22, J, { seg: 8, rings: 5 }); });
  const b = sub(k, (q) => { q.cyl(0, 0, 0, 0.13, 4.6, W, { seg: 8 }); q.sphere(0, 4.7, 0, 0.18, J, { seg: 8, rings: 5 }); q.cyl(0, 4.7, 0, 0.08, 2.0, J, { seg: 6 }); q.box(-0.15, 6.7, -0.15, 0.15, 6.95, 0.15, mat({ c: '#4a4c50', whole: true })); });
  base.add(a); a.position.set(0, 0, 0);
  a.add(b); b.position.set(0, 4.75, 0);
  return { base, a, b };
}

// A part nested inside another (not added to the scene root on its own).
function sub(k, fn) {
  const g = k.part(0, 0, 0, fn);
  k.parts.splice(k.parts.indexOf(g), 1);
  return g;
}
