/* Salisbury Cathedral, 1245: the building itself.
 *
 * East of the crossing everything is finished, vaulted, glazed and roofed in lead.
 * West of it the nave rises bay by bay like a staircase (dossier 3.5, zones 10 to 19):
 * pier bases in bays 1 to 3, arcade arches on centring in bays 4 to 6, clerestory walls
 * rising in bays 7 and 8, and bays 9 and 10 at full height with a roof being framed.
 * The bay-by-bay staging is the dossier's illustrative reconstruction.
 */
import { mat } from '../../engine/index.js';
import {
  M, BAY, NAVE0, bayX, PIERX, CROSS, QUIRE, ECROSS, PRES, RETRO, TRIN, EWALL, END,
  PZ, WZ0, WZ1, AZ0, AZ1, BZ, CAP, ARC, SPRING, CROWN, PLATE, PARA, RIDGE, A_SPRING, A_CROWN, A_ROOF0, A_ROOF1,
  LOW_CROWN, LOW_RIDGE, TRIN_Z, TRAN_Z, ETRAN_Z, ZMIN,
  wall, wallZ, pier, shaft, vaultCell, roofX, rafters, prism, mapZY, mapXY, lancetPts, archY, range, heightSolid,
} from './common.js';

// ------------------------------------------------------------------ nave staging (illustrative)
// Heights reached by each part in June 1245, bay by bay (bays 1..10).
export const AISLE_H = [0, 1.0, 1.5, 4.4, 8.2, 11.2, 14, 14, 14, 14];
export const UPPER_H = [0, 0, 0, 0, 13.0, 16.2, 21.2, 25.0, PLATE, PLATE];
export const PIER_H = [0.6, 0.9, 1.7, CAP, CAP, CAP, CAP, CAP, CAP, CAP]; // pier lines 0..9

// Openings of one bay of the main elevation (arcade, triforium, clerestory).
function elevationOpens(x0, x1, glazed) {
  const cx = (x0 + x1) / 2, w = x1 - x0;
  const g = glazed ? M.glass : null;
  return [
    { cx, w: w - 1.7, sill: CAP, apex: ARC, n: 12 },
    { cx: cx - w * 0.23, w: w * 0.3, sill: 13.0, apex: 15.6 },
    { cx: cx + w * 0.23, w: w * 0.3, sill: 13.0, apex: 15.6 },
    { cx, w: 1.3, sill: 17.6, apex: 24.6, glass: g },
    { cx: cx - w * 0.26, w: 0.95, sill: 17.6, apex: 23.2, glass: g },
    { cx: cx + w * 0.26, w: 0.95, sill: 17.6, apex: 23.2, glass: g },
  ];
}
// Two lancets to each aisle bay (dossier caption 15).
function aisleOpens(x0, x1, glazed) {
  const cx = (x0 + x1) / 2, w = x1 - x0;
  const g = glazed ? M.glass : null;
  return [{ cx: cx - w * 0.22, w: 1.1, sill: 3.6, apex: 9.8, glass: g }, { cx: cx + w * 0.22, w: 1.1, sill: 3.6, apex: 9.8, glass: g }];
}

// Purbeck vault shaft on the face of the upper wall, from the pier capital to the springing.
function vaultShaft(k, x, top = SPRING) {
  k.cyl(x, CAP, WZ0 - 0.14, 0.14, top - CAP, M.purbeck, { seg: 8 });
  k.cyl(x, (CAP + top) / 2, WZ0 - 0.14, 0.18, 0.12, M.purbeck, { seg: 8 });
  k.lathe([[0.14, top - 0.3], [0.3, top]], x, WZ0 - 0.14, M.stone, { seg: 8 });
}

// A great crossing pier: a square core ringed with Purbeck shafts.
function crossingPier(k, x, z, h) {
  k.box(x - 1.45, 0, z - 1.45, x + 1.45, 0.5, z + 1.45, M.stone);
  k.box(x - 1.15, 0.5, z - 1.15, x + 1.15, h, z + 1.15, M.stone);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 1.22 * (Math.abs(Math.cos(a)) > 0.7 || Math.abs(Math.sin(a)) > 0.7 ? 1.05 : 1.35);
    k.cyl(x + Math.cos(a) * r, 0.5, z + Math.sin(a) * r, 0.15, h - 1.2, M.purbeck, { seg: 7 });
  }
  k.box(x - 1.5, h - 0.7, z - 1.5, x + 1.5, h, z + 1.5, M.stone);
}

// ------------------------------------------------------------------ foundations and floors
function foundations(k) {
  // Strip footings 1.2 m deep (verified depth) under the walls and piers. Mostly buried; the
  // transverse ones show in the section, and the west front trench is still open.
  const F = (x0, x1, z0, z1, top = -0.03) => k.box(x0, -1.2, z0, x1, top, z1, M.rubble);
  F(2.3, 5.6, ZMIN, BZ + 0.6, -0.05); // west front wall footing, finished
  k.box(-0.4, -1.2, 5.2, 2.3, -0.75, BZ + 0.6, M.rubble); // rubble being rammed into the open trench
  k.box(-0.4, -1.2, 9.5, 2.3, -0.45, BZ + 0.6, M.rubble);
  F(5.6, 11.1, AZ0 - 0.4, BZ + 0.3, -0.55); // bay 1 aisle footing, half laid in its trench
  F(5.5, 140.5, PZ - 1.2, PZ + 1.2); // arcade line
  F(5.5, 129.5, AZ0 - 0.4, BZ + 0.3); // aisle wall
  F(129.5, 140.5, TRIN_Z - 0.3, TRIN_Z + 1.6);
  F(EWALL[0] - 0.3, END + 0.3, ZMIN, TRIN_Z + 1.8); // east wall of the Trinity Chapel
  F(RETRO[0] - 0.3, RETRO[0] + 1.6, ZMIN, WZ1); // high east wall
  F(59.8, 62.0, AZ0, TRAN_Z + 1.6); F(79.2, 81.1, AZ0, TRAN_Z + 1.6); F(59.8, 81.1, TRAN_Z - 0.2, TRAN_Z + 1.6);
  F(89.8, 91.8, AZ0, ETRAN_Z + 1.6); F(103.4, 105.3, AZ0, ETRAN_Z + 1.6); F(89.8, 105.3, ETRAN_Z - 0.2, ETRAN_Z + 1.6);
  // Paving in the finished east end (the nave floor is still beaten earth and chips).
  k.box(CROSS[0], -0.3, ZMIN, EWALL[0], 0.04, AZ0, M.paving);
  k.box(60.0, -0.3, AZ0, 80.8, 0.04, TRAN_Z, M.paving);
  k.box(90.0, -0.3, AZ0, 105.0, 0.04, ETRAN_Z, M.paving);
  // Quire floor in darker stone, presbytery steps and the high altar's platform.
  k.box(QUIRE[0] + 0.5, 0.04, ZMIN, QUIRE[1], 0.07, WZ0 - 0.1, M.pavingDark);
  k.box(110.6, 0.04, ZMIN, PRES[1] - 0.2, 0.24, WZ0 - 0.2, M.paving);
  k.box(113.4, 0.24, ZMIN, PRES[1] - 0.2, 0.44, WZ0 - 0.4, M.paving);
  k.box(115.2, 0.44, ZMIN, PRES[1] - 0.2, 0.64, WZ0 - 0.6, M.paving);
}

// ------------------------------------------------------------------ west front
function westFront(k) {
  // Lowest courses only (illustrative): the wall, buttress stubs and the doorway sill.
  const S = M.stoneNew;
  wallZ(k, 2.3, BZ, 2.4, 5.5, 0, 1.3, [], S); // north of the central doorway
  k.box(2.4, 0, ZMIN, 5.5, 0.22, 2.3, S); // sill being bedded
  k.box(0.2, 0, PZ - 1.1, 2.4, 0.8, PZ + 1.1, S); // buttress stubs
  k.box(0.2, 0, AZ0 - 0.2, 2.4, 0.5, AZ1 + 0.4, S);
  // A few loose blocks waiting on the courses.
  k.box(3.0, 1.3, 5.0, 4.0, 1.75, 5.7, S);
  k.box(4.0, 1.3, 9.1, 5.2, 1.8, 9.8, S);
}

// ------------------------------------------------------------------ nave
function nave(k) {
  // Pier lines 1..9 (line 0 is the west respond in the west front; line 10 the crossing).
  for (let i = 1; i <= 9; i++) pier(k, PIERX(i), PZ, PIER_H[i], { stone: i < 3 ? M.stoneNew : M.stone });
  // The respond at the west end: a half pier against the west wall.
  k.box(4.4, 0, PZ - 0.8, 5.6, 0.6, PZ + 0.8, M.stoneNew);

  for (let b = 1; b <= 10; b++) {
    const x0 = bayX(b), x1 = x0 + BAY;
    // North aisle wall, with buttresses at the pier lines.
    const ah = AISLE_H[b - 1];
    // Bay 5 holds the doorway to the north porch, still unfinished (zone 13).
    const ops = b === 5 ? [{ cx: x0 + 2.8, w: 2.0, sill: 0, apex: 4.4, n: 10 }] : aisleOpens(x0, x1, false);
    wall(k, x0, x1, AZ0, AZ1, 0, ah, ops, b < 4 ? M.stoneNew : M.stone);
    if (ah > 1.2) k.box(x1 - 0.6, 0, AZ1, x1 + 0.6, Math.min(ah, A_ROOF0) - 0.4, BZ, M.stoneOut);
    // Bench of the dado along the inside of the aisle wall.
    if (ah > 1.2 && b !== 5) k.box(x0, 0, AZ0 - 0.35, x1, 0.45, AZ0, M.stone);
    if (b === 5) { k.box(x0, 0, AZ0 - 0.35, x0 + 1.6, 0.45, AZ0, M.stone); k.box(x1 - 1.6, 0, AZ0 - 0.35, x1, 0.45, AZ0, M.stone); }
    // Upper wall: arcade spandrels, triforium, clerestory.
    const uh = UPPER_H[b - 1];
    if (uh > CAP) {
      wall(k, x0, x1, WZ0, WZ1, CAP, uh, elevationOpens(x0, x1, false), M.stone);
      if (uh >= SPRING) vaultShaft(k, x0 === NAVE0 ? x0 + 0.2 : x0, Math.min(SPRING, uh));
    }
  }
  // The north porch beyond the doorway: footings and its first courses (illustrative).
  const px0 = bayX(5) + 0.6, px1 = bayX(5) + BAY - 0.6;
  k.box(px0, 0, AZ1, px0 + 0.9, 1.4, AZ1 + 4.2, M.stoneNew);
  k.box(px1 - 0.9, 0, AZ1, px1, 0.9, AZ1 + 4.2, M.stoneNew);
  // Wall plate along the finished bays.
  k.box(bayX(9), PLATE - 0.3, WZ0 + 0.2, CROSS[0], PLATE, WZ1 - 0.1, M.oak);

  // Bay 4: the arcade arch half turned over its centring (voussoirs on the west side only).
  const b4 = bayX(4), c4 = b4 + BAY / 2, a4 = (BAY - 1.7) / 2;
  for (let i = 0; i < 7; i++) {
    const u0 = -a4 + (i / 12) * 2 * a4, u1 = -a4 + ((i + 1) / 12) * 2 * a4;
    const y0 = CAP + 0.2 + archY(u0, a4, 3.8), y1 = CAP + 0.2 + archY(u1, a4, 3.8);
    k.beam([c4 + u0 - 0.25, y0 + 0.2, (WZ0 + WZ1) / 2], [c4 + u1 - 0.25, y1 + 0.2, (WZ0 + WZ1) / 2], 0.95, M.stoneNew);
  }
  // Springer blocks over the capital either side.
  k.box(b4 - 0.8, CAP, WZ0, b4 + 0.9, CAP + 0.6, WZ1, M.stoneNew);
  k.box(b4 + BAY - 0.9, CAP, WZ0, b4 + BAY + 0.8, CAP + 0.6, WZ1, M.stoneNew);
}

// High vault-less nave: roof framing over bays 9 and 10, leading in progress on bay 10.
function naveRoof(k) {
  const x0 = bayX(9), x1 = CROSS[0];
  // Tie beams across the nave on the wall plates (the great wheel stands on them).
  for (const x of [x0 + 0.2, x0 + BAY, x1 - 0.2]) k.box(x - 0.18, PLATE - 0.05, ZMIN, x + 0.18, PLATE + 0.32, WZ1 + 0.2, M.oak);
  rafters(k, x0, x1, 0, RIDGE, WZ1 + 0.5, PLATE, { step: 0.8 });
  // Boarding on bay 10, lead sheets laid from the east on its upper half (illustrative).
  roofX(k, bayX(10), x1, 0, RIDGE + 0.1, WZ1 + 0.5, PLATE + 0.1, { lead: false });
  roofX(k, bayX(10) + 2.6, x1, 0, RIDGE + 0.18, WZ1 + 0.5, PLATE + 0.18, { boards: false });
  // A stack of lead sheets on the boards and a rolled sheet ready to dress.
  k.box(bayX(10) + 0.6, RIDGE - 4.6, 3.6, bayX(10) + 1.8, RIDGE - 4.3, 4.3, M.lead);
  // Aisle roofs on bays 9 and 10 (lean-to over the aisle vaults).
  aisleRoof(k, bayX(9), x1);
  // Aisle vault tops: bays 8..10 complete, bay 7 ribs only on centring.
  for (let b = 8; b <= 10; b++) vaultCell(k, bayX(b), bayX(b) + BAY, WZ1, AZ0, A_SPRING, A_CROWN, { mat: M.vaultRaw, ribMat: M.rib, nx: 8, nz: 6 });
  vaultCell(k, bayX(7), bayX(7) + BAY, WZ1, AZ0, A_SPRING, A_CROWN, { mat: M.vaultRaw, nx: 8, nz: 6, ribsOnly: true, thick: 0.01, ribR: 0.15 });
}

export function aisleRoof(k, x0, x1, opt = {}) {
  const za = WZ1 - 0.05, zb = AZ1 + 0.45, ya = A_ROOF1, yb = A_ROOF0 - 0.1;
  const prof = (o, t) => [[za, ya + o + t], [zb, yb + o + t], [zb, yb + o], [za, ya + o]];
  k.extrudeX(prof(0, 0.08), x0, x1, M.boards);
  if (opt.lead !== false) k.extrudeX(prof(0.08, 0.05), x0, x1, opt.leadMat || M.leadOld);
}

// ------------------------------------------------------------------ crossing and tower stub
function crossing(k) {
  const [x0, x1] = CROSS, xc = (x0 + x1) / 2;
  crossingPier(k, x0, PZ, CAP + 7.6);
  crossingPier(k, x1, PZ, CAP + 7.6);
  // North crossing arch into the transept, with the tower's north wall above it.
  wall(k, x0 + 1.4, x1 - 1.4, WZ0, WZ1, 0, PARA, [{ cx: xc, w: x1 - x0 - 3.3, sill: 0, apex: CROWN - 0.6, n: 16 }], M.stone);
  // West and east crossing arches across the nave (cut by the section on the axis).
  for (const [xa, xb] of [[x0 - 0.65, x0 + 0.65], [x1 - 0.65, x1 + 0.65]]) {
    const out = [];
    for (let i = 0; i <= 12; i++) { const z = ZMIN + ((WZ0 - 0.2 - ZMIN) * i) / 12; out.push([z, 16.1 + archY(z, WZ0 - 0.2, CROWN - 0.6 - 16.1)]); }
    out.push([WZ0 - 0.2, 0], [WZ1, 0], [WZ1, PARA], [ZMIN, PARA]);
    prism(k, out, [], mapZY, xa, xb, M.stone);
  }
  // A temporary flat timber ceiling at vault height (illustrative).
  k.box(x0 + 0.6, CROWN, ZMIN, x1 - 0.6, CROWN + 0.25, WZ0, M.boards);
  for (let x = x0 + 1.4; x < x1 - 0.6; x += 2.0) k.box(x - 0.15, CROWN - 0.3, ZMIN, x + 0.15, CROWN, WZ0, M.oak);
  // Tower stub: one low stage just above the roofs, with a temporary low cap (illustrative).
  const T0 = PARA, T1 = 42;
  const tOpen = (a, b) => [{ cx: a + (b - a) * 0.33, w: 1.0, sill: 36.6, apex: 40.6 }, { cx: a + (b - a) * 0.67, w: 1.0, sill: 36.6, apex: 40.6 }];
  wallZ(k, ZMIN, WZ1, x0 - 0.65, x0 + 0.95, T0, T1, [{ cx: 3.0, w: 1.0, sill: 37.4, apex: 40.6 }], M.stoneOut);
  wallZ(k, ZMIN, WZ1, x1 - 0.95, x1 + 0.65, T0, T1, [{ cx: 3.0, w: 1.0, sill: 37.4, apex: 40.6 }], M.stoneOut);
  wall(k, x0 + 0.95, x1 - 0.95, WZ0, WZ1, T0, T1, tOpen(x0 + 0.95, x1 - 0.95), M.stoneOut);
  // Floor of the tower stage and the cap.
  k.box(x0 + 0.95, T0, ZMIN, x1 - 0.95, T0 + 0.3, WZ0, M.boards);
  const cap = (x, y, z) => [x, y, z];
  const A = cap(x0 - 1.0, T1, -WZ1 - 0.5), B = cap(x1 + 1.0, T1, -WZ1 - 0.5), C = cap(x1 + 1.0, T1, WZ1 + 0.5), D = cap(x0 - 1.0, T1, WZ1 + 0.5), P = cap(xc, T1 + 3.4, 0);
  const L = M.leadOld;
  k._oriented(A, B, P, [0, 1, -1], L); k._oriented(B, C, P, [1, 1, 0], L); k._oriented(C, D, P, [0, 1, 1], L); k._oriented(D, A, P, [-1, 1, 0], L);
  k._oriented(A, B, C, [0, -1, 0], M.boards); k._oriented(A, C, D, [0, -1, 0], M.boards);
  k.box(x0 - 0.8, T1 - 0.3, ZMIN, x1 + 0.8, T1, WZ1 + 0.3, M.oak);
  k.cyl(xc, T1 + 3.3, 0, 0.05, 1.6, M.iron, { seg: 5 }); // a vane rod
}

// ------------------------------------------------------------------ transepts
function transept(k, xa, xb, zEnd, opt = {}) {
  // Main vessel from xa to xb (inner faces), north end wall at zEnd.
  const xc = (xa + xb) / 2, t = 1.4;
  const tiers = (z0, z1) => {
    const n = Math.max(1, Math.round((z1 - z0) / 6));
    const out = [];
    for (let i = 0; i < n; i++) {
      const c = z0 + ((i + 0.5) * (z1 - z0)) / n;
      out.push({ cx: c, w: 1.2, sill: 4.0, apex: 11.0, glass: M.glass }, { cx: c, w: 1.3, sill: 17.6, apex: 24.4, glass: M.glass });
    }
    return out;
  };
  // West wall, solid with two tiers of lancets.
  wallZ(k, AZ0, zEnd + t, xa - t, xa, 0, PLATE, tiers(AZ0 + 0.6, zEnd), M.stone);
  // East side: an arcade into an aisle of chapels (main transept) or a plain wall.
  if (opt.aisle) {
    const ax = xb + 6.0;
    const piers = [];
    for (let z = AZ1 + 6; z < zEnd - 1; z += 6) piers.push(z);
    for (const z of piers) pier(k, xb, z, CAP, { shafts: 4 });
    const opens = [];
    const pts = [AZ0].concat(piers, [zEnd]);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], c = (a + b) / 2, w = b - a;
      opens.push({ cx: c, w: w - 1.7, sill: CAP, apex: ARC, n: 12 }, { cx: c, w: 1.3, sill: 17.6, apex: 24.4, glass: M.glass });
      if (w > 4) opens.push({ cx: c - w * 0.22, w: w * 0.3, sill: 13.0, apex: 15.6 }, { cx: c + w * 0.22, w: w * 0.3, sill: 13.0, apex: 15.6 });
    }
    wallZ(k, AZ0, zEnd, xb - 0.75, xb + 0.75, CAP, PLATE, opens, M.stone);
    // Aisle outer wall with lancets, aisle vaults, lean-to roof.
    const ao = [];
    for (let i = 0; i < pts.length - 1; i++) { const c = (pts[i] + pts[i + 1]) / 2; ao.push({ cx: c, w: 1.1, sill: 3.6, apex: 9.8, glass: M.glass }); }
    wallZ(k, AZ1, zEnd + t, ax, ax + 1.3, 0, A_ROOF0, ao, M.stone);
    for (let i = 0; i < pts.length - 1; i++) vaultCell(k, xb + 0.75, ax, Math.max(pts[i], AZ0), pts[i + 1], A_SPRING, A_CROWN, { mat: M.vault, nx: 6, nz: 6, zmin: -99 });
    const prof = (o, th) => [[xb + 0.7, A_ROOF1 + o + th], [ax + 1.7, A_ROOF0 - 0.1 + o + th], [ax + 1.7, A_ROOF0 - 0.1 + o], [xb + 0.7, A_ROOF1 + o]];
    k.extrude(prof(0, 0.08), AZ0, zEnd + t, M.boards);
    k.extrude(prof(0.08, 0.05), AZ0, zEnd + t, M.leadOld);
  } else {
    wallZ(k, AZ0, zEnd + t, xb, xb + t, 0, PLATE, tiers(AZ0 + 0.6, zEnd), M.stone);
  }
  // North end wall: tiers of stepped lancets and a gable.
  const xe1 = opt.aisle ? xb + 7.3 : xb + t;
  const ends = [
    { cx: xc - 2.6, w: 1.2, sill: 4.0, apex: 11.6, glass: M.glass }, { cx: xc, w: 1.5, sill: 4.0, apex: 13.0, glass: M.glassBlue }, { cx: xc + 2.6, w: 1.2, sill: 4.0, apex: 11.6, glass: M.glass },
    { cx: xc - 2.2, w: 1.1, sill: 17.0, apex: 23.0, glass: M.glass }, { cx: xc, w: 1.3, sill: 17.0, apex: 24.6, glass: M.glassRuby }, { cx: xc + 2.2, w: 1.1, sill: 17.0, apex: 23.0, glass: M.glass },
    { cx: xc, w: 1.0, sill: 29.0, apex: 33.0 },
  ];
  if (opt.aisle) ends.push({ cx: xb + 3.6, w: 1.1, sill: 3.6, apex: 9.8, glass: M.glass });
  const gable = opt.aisle ? [[xe1, A_ROOF0 + 0.2], [xb + t, A_ROOF1 + 0.3], [xb + t, PLATE], [xc, RIDGE], [xa - t, PLATE]] : [[xb + t, PLATE], [xc, RIDGE], [xa - t, PLATE]];
  const g = Object.assign(ends, { gable });
  wall(k, xa - t, xe1, zEnd, zEnd + t, 0, RIDGE - 1, g, M.stone);
  // Vaults of the main vessel and the roof (ridge running north).
  const cells = [WZ1].concat(range(AZ1, zEnd, Math.max(1, Math.round((zEnd - AZ1) / 6))).slice(1));
  vaultCell(k, xa, xb, WZ1, AZ1, SPRING, CROWN, { mat: M.vault, nx: 10, nz: 4, zmin: -99, ridge: 'z' });
  for (let i = 0; i < cells.length - 1; i++) vaultCell(k, xa, xb, Math.max(cells[i], AZ1), cells[i + 1], SPRING, CROWN, { mat: M.vault, nx: 10, nz: 6, zmin: -99, ridge: 'z' });
  for (let i = 1; i < cells.length - 1; i++) vaultShaftZ(k, xa, cells[i]);
  const rp = (o, th) => [[xa - t - 0.5, PLATE + o], [xc, RIDGE + o], [xb + t + 0.5, PLATE + o], [xb + t + 0.5, PLATE + o + th], [xc, RIDGE + o + th], [xa - t - 0.5, PLATE + o + th]];
  k.extrude(rp(0, 0.08), WZ1, zEnd + t + 0.3, M.boards);
  k.extrude(rp(0.08, 0.05), WZ1, zEnd + t + 0.3, M.leadOld);
}
function vaultShaftZ(k, x, z) {
  k.cyl(x + 0.14, CAP, z, 0.14, SPRING - CAP, M.purbeck, { seg: 8 });
}

// ------------------------------------------------------------------ the finished east end
function eastArm(k) {
  // Quire (3 bays of 6 m), eastern crossing, presbytery (3 bays).
  const bays = [];
  for (let i = 0; i < 3; i++) bays.push([QUIRE[0] + i * 6, QUIRE[0] + (i + 1) * 6]);
  const pres = [];
  for (let i = 0; i < 3; i++) pres.push([PRES[0] + (i * 16) / 3, PRES[0] + ((i + 1) * 16) / 3]);
  const all = bays.concat(pres);
  for (const [x0, x1] of all) {
    wall(k, x0, x1, WZ0, WZ1, CAP, PLATE, elevationOpens(x0, x1, true), M.limewash, { reveal: M.limewash });
    vaultCell(k, x0, x1, -WZ0, WZ0, SPRING, CROWN, { mat: M.vault, ribMat: M.ribPaint, ridge: 'x', nx: 10 });
    vaultShaft(k, x0);
  }
  // Piers with eight detached Purbeck shafts (verified for the quire, dossier zone 27).
  for (const x of [QUIRE[0] + 6, QUIRE[0] + 12, PRES[0] + 16 / 3, PRES[0] + 32 / 3]) pier(k, x, PZ, CAP, { shafts: 8 });
  crossingPier(k, ECROSS[0], PZ, CAP + 7.6);
  crossingPier(k, ECROSS[1], PZ, CAP + 7.6);
  // Eastern crossing: open to the lesser transept, vaulted in one cell.
  const [e0, e1] = ECROSS;
  wall(k, e0 + 1.4, e1 - 1.4, WZ0, WZ1, 0, PLATE, [{ cx: (e0 + e1) / 2, w: e1 - e0 - 3.3, sill: 0, apex: CROWN - 0.6, n: 16 }], M.limewash);
  vaultCell(k, e0, e1, -WZ0, WZ0, SPRING, CROWN, { mat: M.vault, ribMat: M.ribPaint, ridge: 'x', nx: 12 });
  for (const xx of [e0, e1]) {
    const out = [];
    for (let i = 0; i <= 12; i++) { const z = ZMIN + ((WZ0 - 0.2 - ZMIN) * i) / 12; out.push([z, 16.1 + archY(z, WZ0 - 0.2, CROWN - 0.6 - 16.1)]); }
    out.push([WZ0 - 0.2, 0], [WZ1, 0], [WZ1, 16.0], [WZ0, CROWN + 0.6], [ZMIN, CROWN + 0.6]);
    prism(k, out, [], mapZY, xx - 0.6, xx + 0.6, M.limewash);
  }
  // Main crossing vault would be here; a timber ceiling stands in (see crossing()).

  // Aisles of the quire and presbytery: outer wall with lancets, vaults, roofs.
  const aisleBays = [];
  for (const [x0, x1] of bays) aisleBays.push([x0, x1]);
  for (const [x0, x1] of pres) aisleBays.push([x0, x1]);
  for (const [x0, x1] of aisleBays) {
    const xa = x0 < 80.8 && x1 > 79.5 ? 80.8 : x0;
    wall(k, xa, x1, AZ0, AZ1, 0, A_ROOF0, aisleOpens(xa, x1, true), M.limewash, { reveal: M.limewash });
    k.box(x1 - 0.6, 0, AZ1, x1 + 0.6, A_ROOF0 - 0.4, BZ, M.stoneOut);
    vaultCell(k, x0, x1, WZ1, AZ0, A_SPRING, A_CROWN, { mat: M.vault, ribMat: M.ribPaint, nx: 8, nz: 6 });
    k.box(xa, 0, AZ0 - 0.35, x1, 0.45, AZ0, M.limewash);
  }
  vaultCell(k, e0, e1, WZ1, AZ0, A_SPRING, A_CROWN, { mat: M.vault, ribMat: M.ribPaint, nx: 8, nz: 6 });
  aisleRoof(k, QUIRE[0], PRES[1]);
  // Lead roof of quire, eastern crossing and presbytery, its timbers and the vault tops beneath.
  roofX(k, QUIRE[0], PRES[1] + 1.4, 0, RIDGE, WZ1 + 0.5, PLATE, { leadMat: M.leadOld });
  rafters(k, QUIRE[0] + 1.0, PRES[1], 0, RIDGE - 0.02, WZ1 + 0.5, PLATE - 0.02, { step: 1.2, mat: M.oakOld });
  for (let x = QUIRE[0] + 3; x < PRES[1]; x += 6) k.box(x - 0.17, PLATE - 0.05, ZMIN, x + 0.17, PLATE + 0.3, WZ1 + 0.2, M.oakOld);
  k.box(QUIRE[0], PLATE - 0.3, WZ0 + 0.2, PRES[1], PLATE, WZ1 - 0.1, M.oakOld);
  // Walls of the tower stub's east side down to the quire roof are in crossing().

  // High east wall of the presbytery over the retrochoir: two arches below (a central
  // Purbeck pier on the axis, cut in half), three lancets above the low roof, a gable.
  const hx0 = RETRO[0], hx1 = RETRO[0] + 1.4;
  const s = (RIDGE - PLATE) / (WZ1 + 0.5);
  const arc = lancetPts(2.75, 4.3, 0, 10.6, 12).pts.slice(2).reverse(); // over the north arch, west to east
  const O = [[ZMIN, 0], [0.6, 0], ...arc, [4.9, 0], [WZ1, 0], [WZ1, PLATE], [0, RIDGE], [ZMIN, RIDGE - s * 0.6]];
  const holes = [lancetPts(1.6, 1.0, 21.2, 26.2).pts, lancetPts(3.6, 1.0, 21.2, 25.0).pts];
  prism(k, O, holes, mapZY, hx0, hx1, M.limewash, { reveal: M.limewash });
  for (const h of holes) prism(k, h, [], mapZY, hx0 + 0.67, hx0 + 0.73, M.glass);
  // The axis pier: a cluster of Purbeck shafts, cut in half by the section.
  k.box(hx0 - 0.3, 0, ZMIN, hx1 + 0.3, 0.45, 0.75, M.stone);
  for (const [dx, dz] of [[0.2, 0], [0.7, 0.3], [1.2, 0]]) k.cyl(hx0 + dx, 0.45, dz, 0.24, 9.3, M.purbeck, { seg: 10 });
  k.box(hx0 - 0.3, 9.75, ZMIN, hx1 + 0.3, 10.3, 0.8, M.stone);
}

// ------------------------------------------------------------------ retrochoir and Trinity Chapel
function lowEnd(k) {
  const [r0, r1] = RETRO, [t0, t1] = TRIN;
  const SPR = 7.4;
  // Slim single Purbeck shafts (verified for the Trinity Chapel).
  for (const x of [r0 + 5, r1]) shaft(k, x, PZ, SPR + 0.3, 0.22);
  for (const x of [t0 + 0.0, t0 + 5.5]) shaft(k, x, 3.2, SPR + 0.3, 0.17);
  // Vaults: retrochoir central and aisle; Trinity Chapel central and north aisles.
  for (const [x0, x1] of [[r0 + 1.4, r0 + 5], [r0 + 5, r1]]) {
    vaultCell(k, x0, x1, -PZ, PZ, SPR, LOW_CROWN, { mat: M.vault, ribMat: M.ribPaint, ridge: 'x', nx: 8 });
    vaultCell(k, x0, x1, PZ, AZ0, SPR, LOW_CROWN - 0.6, { mat: M.vault, ribMat: M.ribPaint, nx: 8, nz: 6 });
  }
  for (const [x0, x1] of [[t0, t0 + 5.5], [t0 + 5.5, t1]]) {
    vaultCell(k, x0, x1, -3.2, 3.2, SPR, LOW_CROWN, { mat: M.vault, ribMat: M.ribPaint, ridge: 'x', nx: 8 });
    vaultCell(k, x0, x1, 3.2, TRIN_Z, SPR, LOW_CROWN - 0.4, { mat: M.vault, ribMat: M.ribPaint, nx: 8, nz: 6 });
  }
  // North walls with lancets.
  k.box(r0 + 1.4, 0, AZ0 - 0.35, r1, 0.45, AZ0, M.limewash);
  wall(k, r0, r1, AZ0, AZ1, 0, 13.2, [{ cx: r0 + 2.5, w: 1.1, sill: 3.6, apex: 9.8, glass: M.glass }, { cx: r0 + 7.5, w: 1.1, sill: 3.6, apex: 9.8, glass: M.glass }], M.limewash);
  k.box(r0 + 4.4, 0, AZ1, r0 + 5.6, 12.4, BZ, M.stoneOut);
  wall(k, t0, t1, TRIN_Z, TRIN_Z + 1.3, 0, 13.2, [{ cx: t0 + 2.75, w: 1.1, sill: 2.6, apex: 9.2, glass: M.glass }, { cx: t0 + 8.25, w: 1.1, sill: 2.6, apex: 9.2, glass: M.glass }], M.limewash);
  wallZ(k, TRIN_Z, AZ1, t0 - 0.4, t0 + 0.9, 0, 13.2, [], M.limewash); // the step in plan
  // East wall: stepped triple lancets to each aisle and a gable (verified description).
  const ew = [
    { cx: 0, w: 1.25, sill: 2.4, apex: 10.6, glass: M.glassBlue }, { cx: 1.55, w: 0.95, sill: 2.4, apex: 9.4, glass: M.glass }, { cx: -1.55, w: 0.95, sill: 2.4, apex: 9.4, glass: M.glass },
    { cx: 6.4, w: 1.1, sill: 2.4, apex: 9.8, glass: M.glass }, { cx: 5.0, w: 0.85, sill: 2.4, apex: 8.6, glass: M.glass }, { cx: 7.8, w: 0.85, sill: 2.4, apex: 8.6, glass: M.glass },
    { cx: 0, w: 0.9, sill: 14.4, apex: 18.0, glass: M.glass },
  ];
  const sl = (LOW_RIDGE - 13.2) / (TRIN_Z + 1.3);
  ew.gable = [[TRIN_Z + 1.3, 13.2], [0, LOW_RIDGE], [-2.4, LOW_RIDGE - sl * 2.4]];
  wallZ(k, -2.4, TRIN_Z + 1.3, EWALL[0], EWALL[1], 0, LOW_RIDGE - 1, ew, M.limewash);
  // Buttresses to the full length of the church (144.2 m, verified).
  for (const z of [2.6, TRIN_Z + 0.2]) k.box(EWALL[1], 0, z, END, 11.5, z + 1.2, M.stoneOut);
  // Roofs.
  roofX(k, r0 + 1.4, t0, 0, LOW_RIDGE, AZ1 + 0.4, 13.0, { leadMat: M.leadOld });
  roofX(k, t0, EWALL[1] + 0.3, 0, LOW_RIDGE, TRIN_Z + 1.7, 13.0, { leadMat: M.leadOld });
  rafters(k, r0 + 2.0, EWALL[0], 0, LOW_RIDGE - 0.02, TRIN_Z + 1.2, 13.2, { step: 1.2, mat: M.oakOld, scissor: false });
}

// ------------------------------------------------------------------ the temporary west screen
function screen(k) {
  // Boarded partition between the building site and the church in use (illustrative),
  // standing where the medieval pulpitum line was (verified), with a small door.
  const x = CROSS[0] - 0.9;
  const O = [[ZMIN, 0], [1.2, 0], [1.2, 2.1], [2.2, 2.1], [2.2, 0], [WZ0 - 0.5, 0], [WZ0 - 0.5, 10], [ZMIN, 10]];
  prism(k, O, [], mapZY, x - 0.08, x, M.boards);
  for (const z of [1.1, 2.3, 4.2]) k.box(x, 0, z - 0.08, x + 0.16, 10, z + 0.08, M.oak);
  k.box(x - 0.02, 4.8, ZMIN, x + 0.16, 5.0, WZ0 - 0.5, M.oak);
}

export function buildChurch(k) {
  foundations(k);
  westFront(k);
  nave(k);
  naveRoof(k);
  crossing(k);
  transept(k, CROSS[0], CROSS[1], TRAN_Z, { aisle: true });
  transept(k, ECROSS[0], ECROSS[1], ETRAN_Z, { aisle: false });
  eastArm(k);
  lowEnd(k);
  screen(k);
}
void mat; void heightSolid;
