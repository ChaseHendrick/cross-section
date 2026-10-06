/* Gresley A4 Pacific No. 4489 Dominion of Canada and its corridor tender, 1937.
 *
 * x from the front buffer face (0) to the tender's rear (21.65); the engine runs towards -x.
 * Verified anchors (docs/research/train.md, section 2): height 3.99, width 2.74, wheel
 * diameters (driving 2.032, bogie 0.965, trailing 1.118, tender 1.27), wheelbases, boiler
 * 1.96 max diameter. Axle positions follow the dossier's derived table. Everything else is
 * drawn to period practice and kept out of the captions.
 */
import { THREE, mat, shade } from '../../engine/index.js';
import { M, COL, FL, ZI, letters } from './common.js';

const TAU = Math.PI * 2;
export const AX = {
  bogie: [1.9, 3.81], rB: 0.4825,
  coupled: [6.2, 8.4, 10.6], rD: 1.016,
  trailing: [12.8], rT: 0.559,
  tender: [15.6, 17.2, 18.8, 20.46], rTd: 0.635,
};
const CYL_Y = 1.02;        // outside cylinder axis height
const CRANK = 0.33;        // half the 26 in stroke
const CONROD = 3.15;
export const CAB = { x0: 12.9, x1: 14.5, floor: 1.5, roof: 3.95 };
export const TENDER = { x0: 14.7, x1: 21.65, floor: 1.0, top: 3.8, corrZ0: 0.84, corrZ1: 1.28, corrY0: 1.6, corrY1: 3.12 };

// ------------------------------------------------------------------ casing section
// Half-section of the streamlined casing at full size: outer contour from the top (just
// past the centreline, so the cut passes through it) round the far side to the valance foot.
const OUT = [[-0.3, 3.97], [0.0, 3.97], [0.42, 3.92], [0.78, 3.77], [1.05, 3.52], [1.22, 3.16], [1.31, 2.72], [1.36, 2.2], [1.37, 1.6], [1.37, 0.95]];
function shellRing(out, t) {
  const n = out.length, inner = [];
  for (let i = 0; i < n; i++) {
    const a = out[Math.max(0, i - 1)], b = out[Math.min(n - 1, i + 1)];
    let tz = b[0] - a[0], ty = b[1] - a[1];
    const l = Math.hypot(tz, ty) || 1; tz /= l; ty /= l;
    const nz = -ty, ny = tz; // outward normal
    inner.push([out[i][0] - nz * t, out[i][1] - ny * t]);
  }
  return out.concat(inner.reverse());
}
const smooth = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
// Height of the casing top along the nose: a quarter ellipse from the buffer beam to the boiler top.
const NOSE_X0 = 0.45, NOSE_X1 = 4.7;
function topY(x) { if (x >= NOSE_X1) return 3.97; const u = (NOSE_X1 - x) / (NOSE_X1 - NOSE_X0); return 1.35 + 2.62 * Math.sqrt(Math.max(0, 1 - u * u)); }
function halfW(x) { return 1.37 * (0.58 + 0.42 * smooth(NOSE_X0, 3.6, x)); }
function botY(x) { return 0.95 - 0.22 * (1 - smooth(NOSE_X0, 2.6, x)); }
function casingSection(x) {
  const top = topY(x), bot = botY(x), w = halfW(x) / 1.37;
  const out = OUT.map(([z, y]) => [z < 0 ? z : z * w, bot + (y - 0.95) * (top - bot) / (3.97 - 0.95)]);
  return shellRing(out, 0.07);
}

// Half-annulus of a horizontal cylinder (boiler, smokebox), as a [z, y] ring through the far side.
function halfTube(r, t, yc, steps = 14) {
  const out = [];
  const a0 = Math.PI / 2 + 0.3, a1 = -Math.PI / 2 - 0.3;
  for (let i = 0; i <= steps; i++) { const a = a0 + (a1 - a0) * (i / steps); out.push([Math.cos(a) * r, yc + Math.sin(a) * r]); }
  const inner = out.map(([z, y]) => [z * (r - t) / r, yc + (y - yc) * (r - t) / r]);
  return out.concat(inner.reverse());
}

// ------------------------------------------------------------------ build
export function buildLoco(k, S) {
  // --- frames, buffer beam, buffers
  k.box(0.42, 0.55, 0.52, 13.7, 1.42, 0.6, M.frame);           // far main frame plate
  k.box(0.42, 0.75, -1.37, 0.62, 1.38, 1.37, M.noseBlack);      // buffer beam (cut)
  k.box(0.6, 1.38, -1.1, 13.0, 1.46, 1.1, M.dark);              // running plate under the casing
  for (const s of [1, -1]) {
    const mm = s > 0 ? M.steel : M.steelW;
    k.cyl(0.05, 1.05, s * 0.87, 0.07, 0.4, mm, { axis: 'x', seg: 10 });
    k.cyl(0.0, 1.05, s * 0.87, 0.2, 0.06, mm, { axis: 'x', seg: 16 });
    // Two white headlamps on lamp irons over the buffers (express headcode).
    const lm = s > 0 ? mat({ c: '#e8e4dc' }) : mat({ c: '#e8e4dc', whole: true });
    k.box(0.34, 1.42, s * 0.62 - 0.1, 0.5, 1.68, s * 0.62 + 0.1, lm);
  }
  k.box(0.0, 1.0, -0.12, 0.42, 1.12, 0.12, M.steel);            // screw coupling hook

  // --- streamlined casing (lofted shell)
  const xs = [NOSE_X0, 0.52, 0.62, 0.78, 1.0, 1.28, 1.6, 1.84, 1.9, 2.2, 2.7, 3.3, 3.9, NOSE_X1, 7.0, 10.0, CAB.x0];
  const secs = xs.map((x) => ({ x, pts: casingSection(x) }));
  const nOut = OUT.length;
  k.loft(secs, M.casing, {
    matFn: (s, i) => {
      const xm = (xs[s] + xs[s + 1]) / 2;
      if (i >= nOut) return M.casingIn;
      if (xm < 1.84) return M.noseBlack;
      if (xm < 1.9) return M.redLine;
      return M.casing;
    },
  });
  // The front skirt below the curve of the nose.
  k.box(0.38, 0.72, -0.3, 0.46, 1.36, halfW(0.45), M.noseBlack);
  // Stainless strip along the valance foot.
  k.box(NOSE_X1 - 1.5, 0.95, 1.37, CAB.x0, 1.0, 1.385, M.stainless);

  // --- smokebox, chimney and blastpipe
  const SBX0 = 1.86, SBX1 = 4.62, SBR = 0.88, SBY = 2.98;
  k.extrudeX(halfTube(SBR, 0.03, SBY), SBX0, SBX1, M.smokebox);
  k.cyl(SBX0 - 0.06, SBY, 0, SBR * 0.92, 0.06, M.smokebox, { axis: 'x', seg: 24 }); // the door
  k.cyl(SBX0 - 0.12, SBY, 0, 0.06, 0.08, M.steel, { axis: 'x', seg: 8 });           // its dart
  k.box(SBX0 + 0.04, SBY - SBR + 0.02, -0.3, SBX1, SBY - SBR + 0.22, 0.6, M.ash);      // char in the bottom
  k.cyl(3.25, 2.1, 0, 0.13, 0.95, M.steel, { seg: 12 });                              // blastpipe
  k.cyl(3.25, 3.05, 0, 0.13, 0.2, M.steel, { seg: 12, r2: 0.09 });                    // nozzle
  k.lathe([[0.2, 3.3], [0.17, 3.6], [0.2, 3.95], [0.24, 4.03]], 3.25, 0, mat({ c: '#262222', cut: '#3a2a26' }), { seg: 16, capTop: false, capBot: false }); // petticoat and chimney
  k.lathe([[0.17, 3.3], [0.14, 3.6], [0.17, 3.95], [0.2, 4.03]], 3.25, 0, mat({ c: '#121010' }), { seg: 16, capTop: false, capBot: false });
  k.box(2.0, 3.25, -0.3, 2.55, 3.6, 0.7, M.steel);                                     // superheater header
  k.tube([[2.4, 3.3, 0.6], [2.6, 3.0, 0.95], [3.0, 2.0, 1.12], [3.2, 1.55, 1.1]], 0.09, M.steel); // outside steam pipe (far)
  k.lamp(2.9, SBY - 0.5, 0.25, { always: true, color: '#c84a28', r: 1.2, i: 0.35, bulb: false, halo: 0.15, flicker: true }); // cinders glowing

  // --- boiler barrel (tapered), tubes, flues, water
  const BX0 = SBX1, BX1 = 9.8;
  const ringA = halfTube(0.86, 0.03, 3.83 - 0.86), ringB = halfTube(0.98, 0.03, 3.83 - 0.98);
  k.loft([{ x: BX0, pts: ringA }, { x: 6.6, pts: ringA }, { x: BX1, pts: ringB }], M.boilerIn, { matFn: (s, i) => (i < 15 ? M.lagging : M.boilerIn) });
  k.cyl(BX0, 3.83 - 0.86, 0, 0.84, 0.04, M.boilerIn, { axis: 'x', seg: 24 });        // front tube plate
  const r = k.rng('tubes');
  for (let row = 0; row < 9; row++) {
    const y = 2.22 + row * 0.085;
    for (const z of [0, 0.09, 0.18]) k.cyl(BX0 + 0.04, y + (z ? 0.04 : 0), z, 0.029, BX1 - BX0 - 0.04, M.tubes, { axis: 'x', seg: 6 });
  }
  for (let row = 0; row < 3; row++) {
    const y = 3.04 + row * 0.16;
    for (const z of [0, 0.17]) {
      k.cyl(BX0 + 0.04, y, z, 0.066, BX1 - BX0 - 0.04, M.flue, { axis: 'x', seg: 8 });
      k.cyl(BX0 + 0.04, y + 0.02, z, 0.018, BX1 - BX0 - 0.3, mat({ c: '#8a5a3a', cut: '#6a3a2a' }), { axis: 'x', seg: 5 }); // superheater element
    }
  }
  void r;
  // Water round the tubes and steam above: translucent cut faces.
  k.glass([[BX0 + 0.04, 3.83 - 1.72 + 0.05, 0.012], [BX1, 3.83 - 1.96 + 0.05, 0.012], [BX1, 3.32, 0.012], [BX0 + 0.04, 3.32, 0.012]], { c: '#9ac8dc', alpha: 0.2 });
  k.glass([[BX0 + 0.04, 3.32, 0.012], [BX1, 3.32, 0.012], [BX1, 3.8, 0.012], [BX0 + 0.04, 3.8, 0.012]], { c: '#f4f2ee', alpha: 0.12 });
  // Regulator rod running back to the cab along the steam space.
  k.cyl(BX0 + 0.3, 3.58, 0.25, 0.022, CAB.x0 - BX0 - 0.2, M.steel, { axis: 'x', seg: 5 });

  // --- firebox: steel wrapper, copper inner box, water space, grate, brick arch, ashpan
  const FX0 = BX1, FX1 = 12.78;
  const wrapOut = [[-0.3, 3.8], [0.0, 3.8], [0.5, 3.74], [0.9, 3.52], [1.12, 3.15], [1.18, 2.5], [1.18, 1.0]];
  const box1 = [[-0.3, 3.46], [0.0, 3.46], [0.42, 3.4], [0.78, 3.2], [0.96, 2.85], [1.0, 2.3], [1.0, 1.24]];
  k.extrudeX(shellRing(wrapOut, 0.035), FX0, FX1, M.boilerIn);
  k.extrudeX(shellRing(box1, 0.03), FX0 + 0.22, FX1 - 0.16, M.copper);
  k.box(FX0 + 0.18, 1.24, -0.3, FX0 + 0.24, 3.46, 1.0, M.copper);                     // firebox tube plate
  k.box(FX1 - 0.04, 1.0, -0.3, FX1, 3.8, 1.18, M.boilerIn, { front: false });        // backhead outer
  // Backhead inner plate with the firehole opening.
  const fh = { x: FX1 - 0.16, y0: 1.72, y1: 2.05, z0: -0.3, z1: 0.24 };
  k.box(fh.x, 1.24, -0.3, fh.x + 0.03, fh.y0, 1.0, M.copper);
  k.box(fh.x, fh.y1, -0.3, fh.x + 0.03, 3.46, 1.0, M.copper);
  k.box(fh.x, fh.y0, fh.z1, fh.x + 0.03, fh.y1, 1.0, M.copper);
  // Water space round the box.
  const W = { c: '#7ab0c8', alpha: 0.3 };
  k.glass([[FX0 + 0.04, 3.46, 0.012], [FX1 - 0.04, 3.46, 0.012], [FX1 - 0.04, 3.76, 0.012], [FX0 + 0.04, 3.76, 0.012]], W);
  k.glass([[FX0 + 0.04, 1.02, 0.012], [FX0 + 0.18, 1.02, 0.012], [FX0 + 0.18, 3.46, 0.012], [FX0 + 0.04, 3.46, 0.012]], W);
  k.glass([[FX1 - 0.13, 1.02, 0.012], [FX1 - 0.04, 1.02, 0.012], [FX1 - 0.04, 3.46, 0.012], [FX1 - 0.13, 3.46, 0.012]], W);
  // Grate and fire bed, sloping down towards the front.
  k.boxR((FX0 + FX1) / 2 + 0.03, 1.3, 0.35, FX1 - FX0 - 0.42, 0.06, 1.3, mat({ c: '#3a3230', pat: 'bars', s: 0.06 }), { z: -0.05 });
  // The fire: a saucer-shaped bed, glowing orange, white-hot in the middle, black where fresh coal lies.
  k.boxR((FX0 + FX1) / 2 + 0.03, 1.4, 0.45, FX1 - FX0 - 0.5, 0.1, 1.05, M.fireBed, { z: -0.05 });
  const fb = k.rng('firebed');
  for (let i = 0; i < 22; i++) {
    const x = FX0 + 0.35 + (i % 11) * 0.2 + fb() * 0.06, z = 0.08 + fb() * 0.8;
    const mid = Math.abs(x - (FX0 + FX1) / 2) < 0.6 && z > 0.25 && z < 0.7;
    const m = mid ? M.fireHot : (i % 5 === 0 ? M.fireCoal : M.fireBed);
    k.boulder(x, 1.45 + (x - FX0) * 0.04 + (mid ? -0.02 : 0.03), z, 0.11, 0.05 + fb() * 0.03, 0.12, m, i + 3, 0.3);
  }
  k.boxR(FX0 + 1.05, 2.15, 0.35, 1.65, 0.12, 1.3, M.brick, { z: 0.36 });                 // brick arch
  k.box(FX0 + 0.25, 0.86, -0.3, FX1 - 0.2, 1.18, 1.0, mat({ c: '#3a3634', c2: '#5a5652', pat: 'speckle', cut: '#2e2422' })); // ashpan
  // Safety valves on the firebox top, under the casing.
  for (const z of [0.12, 0.42]) k.cyl(FX0 + 0.35, 3.8, z, 0.07, 0.14, M.brass, { seg: 10 });
  S.fire = { x0: FX0 + 0.3, x1: FX1 - 0.25, y: 1.5, z0: 0.05, z1: 0.9, hole: fh };
  k.lamp(FX0 + 1.4, 1.9, 0.4, { always: true, color: '#ff9a40', r: 2.6, i: 1.3, bulb: false, halo: 0.9, flicker: true });
  k.lamp(FX0 + 0.6, 1.6, 0.6, { always: true, color: '#ffb050', r: 1.6, i: 0.8, bulb: false, halo: 0.5, flicker: true });

  // --- cylinders and the inside motion
  // Inside cylinder, cut through on the centreline: a shell with its piston (animated in setup).
  k.extrudeX(halfTube(0.26, 0.03, 1.32, 10), 1.35, 3.15, M.steel);
  for (const x of [1.32, 3.15]) k.cyl(x, 1.32, 0, 0.27, 0.04, M.steel, { axis: 'x', seg: 14 });
  k.box(1.25, 1.42, -0.85, 1.55, 1.52, 0.85, M.steel); // conjugating lever beam across the frames
  // Far outside cylinder and slidebars (behind the frame).
  k.cyl(2.25, CYL_Y, 1.08, 0.3, 1.85, M.black, { axis: 'x', seg: 14 });
  k.cyl(2.4, CYL_Y + 0.5, 1.0, 0.15, 1.6, M.black, { axis: 'x', seg: 10 });
  // Near outside cylinder, drawn whole in front of the cut, as the books do.
  k.cyl(2.25, CYL_Y, -1.08, 0.3, 1.85, M.blackW, { axis: 'x', seg: 14 });
  k.cyl(2.2, CYL_Y, -1.08, 0.26, 0.06, M.steelW, { axis: 'x', seg: 14 });
  k.cyl(2.4, CYL_Y + 0.5, -1.0, 0.15, 1.6, M.blackW, { axis: 'x', seg: 10 });
  for (const dy of [0.13, -0.13]) k.box(4.1, CYL_Y + dy - 0.025, -1.11, 6.0, CYL_Y + dy + 0.025, -1.05, M.rodW); // slidebars
  k.box(5.9, CYL_Y - 0.2, -1.1, 6.05, CYL_Y + 0.6, -0.95, M.blackW);                    // motion bracket
  k.box(6.6, 1.25, -1.08, 6.75, 1.95, -1.0, M.blackW);                                  // expansion link bracket

  // --- cab
  const C = CAB;
  k.box(C.x0, C.floor - 0.12, -1.3, C.x1 + 0.12, C.floor, 1.3, M.cabFloor);           // footplate
  // Far cab side with its window.
  k.extrude([[C.x0, C.floor], [C.x1, C.floor], [C.x1, 3.05], [C.x0, 3.05]], 1.27, 1.37, M.cabIn, { holes: [[[C.x0 + 0.35, 2.35], [C.x1 - 0.15, 2.35], [C.x1 - 0.15, 2.95], [C.x0 + 0.35, 2.95]]], back: M.casing, side: M.casing, reveal: M.cabIn });
  k.glass([[C.x0 + 0.35, 2.35, 1.33], [C.x1 - 0.15, 2.35, 1.33], [C.x1 - 0.15, 2.95, 1.33], [C.x0 + 0.35, 2.95, 1.33]], { c: '#c8dce4', alpha: 0.2 });
  // Cab roof.
  const roof = [];
  for (let i = 0; i <= 8; i++) { const t = i / 8; roof.push([-0.3 + t * 1.67, 3.05 + 0.9 * (1 - Math.pow(Math.max(0, (-0.3 + t * 1.67) / 1.37), 2.2))]); }
  k.extrudeX(shellRing(roof, 0.05), C.x0, C.x1, mat({ c: COL.garter, cut: '#2e2422' }));
  // Cab front: the wedge spectacle plate with two windows above the firebox casing.
  k.box(C.x0 - 0.02, 3.05, -0.3, C.x0 + 0.03, 3.12, 1.3, M.cabIn);
  for (const [z0, z1] of [[-0.3, 0.08], [0.62, 0.8], [1.18, 1.3]]) k.box(C.x0 - 0.02, 3.12, z0, C.x0 + 0.03, 3.85, z1, M.cabIn);
  k.glass([[C.x0, 3.12, 0.08], [C.x0, 3.12, 0.62], [C.x0, 3.85, 0.62], [C.x0, 3.85, 0.08]], { c: '#c8dce4', alpha: 0.18 });
  k.glass([[C.x0, 3.12, 0.8], [C.x0, 3.12, 1.18], [C.x0, 3.85, 1.18], [C.x0, 3.85, 0.8]], { c: '#c8dce4', alpha: 0.18 });
  // Backhead fittings: gauge glasses, regulator, injector valves, gauges turned to the viewer.
  for (const z of [0.55, 0.85]) {
    k.cyl(FX1 + 0.03, 2.35, z, 0.025, 0.5, mat({ c: '#cfe2ea' }), { seg: 6 });
    k.box(FX1, 2.3, z - 0.04, FX1 + 0.08, 2.35, z + 0.04, M.brass);
    k.box(FX1, 2.85, z - 0.04, FX1 + 0.08, 2.9, z + 0.04, M.brass);
  }
  k.box(FX1, 3.0, -0.25, FX1 + 0.06, 3.1, 0.25, M.brass);                          // regulator handle stand
  k.beam([FX1 + 0.05, 3.05, 0.0], [FX1 + 0.22, 2.85, -0.32], 0.04, M.brassW);         // regulator handle, driver's side
  for (const [z, y, rr] of [[0.15, 3.35, 0.1], [0.45, 3.4, 0.08], [0.72, 3.35, 0.09]]) {
    k.cyl(FX1 + 0.02, y, z - 0.05, rr, 0.04, M.brass, { axis: 'z', seg: 14 });
    k.cyl(FX1 + 0.02, y, z - 0.07, rr * 0.82, 0.02, M.gauge, { axis: 'z', seg: 14 });
    k.box(FX1 + 0.015, y - 0.004, z - 0.085, FX1 + 0.025 + rr * 0.6, y + 0.004, z - 0.08, M.black);
  }
  for (const z of [0.25, 0.75]) k.cyl(FX1 + 0.03, 1.95, z, 0.06, 0.12, M.brass, { axis: 'x', seg: 8 }); // injector steam valves
  // Seats with backs for the crew, facing the front windows.
  const seatM = mat({ c: '#5a3a24', c2: '#4a2a18', pat: 'grain' }), seatW = mat({ c: '#5a3a24', whole: true });
  k.box(13.35, 2.0, 0.62, 13.8, 2.07, 1.1, seatM); k.box(13.78, 2.07, 0.62, 13.84, 2.5, 1.1, seatM); k.box(13.5, C.floor, 0.8, 13.6, 2.0, 0.9, M.steel);
  k.box(13.35, 2.0, -1.0, 13.8, 2.07, -0.52, seatW); k.box(13.78, 2.07, -1.0, 13.84, 2.5, -0.52, seatW); k.box(13.5, C.floor, -0.8, 13.6, 2.0, -0.7, M.steelW);
  // Driver's controls on the near (left) side, drawn whole: reversing screw pedestal, vacuum brake.
  k.box(13.0, C.floor, -0.95, 13.18, 2.35, -0.75, M.blackW);
  k.cyl(13.09, 2.35, -0.85, 0.16, 0.04, M.brassW, { seg: 14 });
  k.box(12.95, 2.45, -0.62, 13.15, 2.6, -0.42, M.blackW); k.beam([13.05, 2.55, -0.52], [13.3, 2.68, -0.52], 0.035, M.brassW);
  // Flaman self-recording speed indicator and pyrometer, faced to the viewer.
  k.box(12.92, 3.3, -1.05, 13.12, 3.6, -0.9, M.blackW);
  k.cyl(13.02, 3.45, -1.08, 0.11, 0.03, M.brassW, { axis: 'z', seg: 14 });
  k.cyl(13.02, 3.45, -1.1, 0.09, 0.02, mat({ c: '#f2ead8', whole: true }), { axis: 'z', seg: 14 });
  k.cyl(13.0, 3.15, -1.0, 0.06, 0.03, M.brassW, { axis: 'z', seg: 12 });
  // Near cab side, kept below the windows like a book's cutaway, with crest and number.
  k.box(C.x0 + 0.02, C.floor, -1.37, C.x1, 2.32, -1.31, M.casingW);
  k.box(C.x0 + 0.02, 2.32, -1.38, C.x1, 2.36, -1.3, M.stainlessW);
  letters(k, '4489', 12.98, 1.7, -1.39, 0.24, M.stainlessW, 1.0);
  // The arms of Canada: a small painted shield.
  k.box(13.95, 1.58, -1.385, 14.33, 2.02, -1.375, mat({ c: '#c8a050', whole: true }));
  k.box(13.99, 1.64, -1.39, 14.29, 1.98, -1.38, mat({ c: '#b8322a', whole: true }));
  k.box(14.05, 1.84, -1.395, 14.23, 1.94, -1.385, mat({ c: '#e8e2d2', whole: true }));
  k.box(14.05, 1.68, -1.395, 14.23, 1.8, -1.385, mat({ c: '#3a6a3a', whole: true }));
  // Cab lamps for the gauges at night.
  k.lamp(13.3, 3.6, 0.35, { color: '#ffd890', r: 2.0, i: 0.7, bulbR: 0.04, halo: 0.3 });
  k.lamp(13.1, 3.45, -0.4, { color: '#ffd890', r: 1.4, i: 0.4, bulbR: 0.03, halo: 0.2 });
  // Fall plate to the tender.
  k.box(C.x1, C.floor - 0.06, -0.6, TENDER.x0 + 0.15, C.floor, 0.9, M.steel);

  // --- trailing truck and far-side wheels (static; the near side turns)
  for (const [xs2, r2] of [[AX.bogie, AX.rB], [AX.coupled, AX.rD], [AX.trailing, AX.rT]]) {
    for (const x of xs2) {
      k.cyl(x, r2, 0.66, r2, 0.12, M.black, { axis: 'z', seg: 20 });
      k.cyl(x, r2, 0.64, r2 * 0.4, 0.02, M.wheelRed, { axis: 'z', seg: 12 });
      k.cyl(x, r2, -0.66, 0.08, 1.32, M.steel, { axis: 'z', seg: 8 });                // axle (cut)
    }
  }
  k.box(1.3, 0.55, -0.6, 4.4, 0.75, 0.6, M.frame);                                   // bogie frame

  // --- tender
  buildTender(k, S);
}

function buildTender(k, S) {
  const T = TENDER;
  const x0 = T.x0, x1 = T.x1 - 0.35;
  // Frames, tank bottom, far side, front and rear plates.
  k.box(x0 + 0.2, 0.45, 0.52, x1 - 0.1, 1.0, 0.6, M.frame);
  k.box(x0, 0.95, -1.3, x1, 1.05, 1.37, M.tank);                               // tank bottom
  k.extrude([[x0, 0.95], [x1, 0.95], [x1, T.top], [x0 + 0.5, T.top], [x0, 3.2]], 1.27, 1.37, M.tank, { back: M.casing, side: M.casing });
  k.box(x0 + 0.5, 0.95, 1.37, x1, 1.0, 1.385, M.stainless);
  // Coal space: the shovelling plate, the sloping coal heap (cut through on the centreline).
  k.box(x0, 1.05, -1.3, x0 + 0.08, 1.95, T.corrZ0, M.tank);                    // front coal plate
  k.box(x0 + 0.08, 1.42, -1.3, x0 + 0.7, 1.5, T.corrZ0, M.steel);               // shovelling plate
  const coal = [[x0 + 0.6, 1.5], [17.65, 1.5], [17.65, 3.78], [16.6, 3.72], [15.9, 3.35], [15.3, 2.6], [x0 + 0.6, 1.62]];
  k.extrude(coal, -1.2, T.corrZ0 - 0.04, M.coal);
  const cr = k.rng('coal');
  for (let i = 0; i < 26; i++) {
    const x = 15.1 + cr() * 2.4;
    const yTop = x < 15.3 ? 1.62 : x < 15.9 ? 2.6 + (x - 15.3) * 1.25 : x < 16.6 ? 3.35 + (x - 15.9) * 0.53 : 3.72;
    k.boulder(x, yTop - 0.02, 0.05 + cr() * 0.7, 0.1 + cr() * 0.08, 0.07, 0.1 + cr() * 0.08, M.coal, i + 11, 0.4);
  }
  // The tank behind the coal space: water as a translucent cut face, a lid on top.
  k.box(17.65, 1.05, -1.3, 17.72, T.top, T.corrZ0, M.tank);                     // coal-space back plate
  k.box(17.65, T.top - 0.06, -1.3, x1, T.top, 1.37, M.tank);                     // tank top
  k.box(x1 - 0.06, 0.95, -1.3, x1, T.top, 1.37, M.tank, { front: false });       // rear plate
  // Water in the tank (a translucent cut face) up to its level, an air space above it.
  k.glass([[17.75, 1.06, 0.012], [x1 - 0.08, 1.06, 0.012], [x1 - 0.08, 2.95, 0.012], [17.75, 2.95, 0.012]], { c: '#3a7c94', alpha: 0.3 });
  k.box(17.75, 2.94, 0.0, x1 - 0.08, 2.96, 0.05, mat({ c: '#cfe4ec', noEdge: true }));
  k.glass([[x0 + 0.1, 1.06, 0.012], [17.6, 1.06, 0.012], [17.6, 1.4, 0.012], [x0 + 0.1, 1.4, 0.012]], { c: '#3a7c94', alpha: 0.34 });
  // Water scoop riser and its deflecting dome.
  k.cyl(18.3, 0.35, 0.1, 0.11, 3.0, M.steel, { seg: 10 });
  k.sphere(18.3, 3.35, 0.1, 0.32, M.steel, { seg: 12, rings: 6, t0: Math.PI / 2 });
  k.box(17.9, 0.22, -0.2, 18.75, 0.36, 0.4, M.black);                           // the scoop, raised
  // Water-scoop handle and handbrake column on the tender front.
  k.cyl(x0 + 0.2, 1.5, -0.8, 0.04, 0.9, M.steel, { seg: 6 });
  k.cyl(x0 + 0.2, 2.4, -0.8, 0.14, 0.04, M.steel, { seg: 12 });
  k.cyl(x0 + 0.2, 1.5, 0.55, 0.04, 0.9, M.steel, { seg: 6 });
  k.cyl(x0 + 0.2, 2.4, 0.55, 0.14, 0.04, M.steel, { seg: 12 });
  // Coal-watering hose on its hook.
  k.tube([[x0 + 0.12, 2.1, 0.7], [x0 + 0.18, 1.8, 0.75], [x0 + 0.15, 1.6, 0.6], [x0 + 0.1, 1.9, 0.45]], 0.025, mat({ c: '#3a3634' }));

  // Corridor along the right-hand (far) side: 18 in wide, 5 ft high, two steps at each end.
  const cz0 = T.corrZ0, cz1 = T.corrZ1, cy0 = T.corrY0, cy1 = T.corrY1;
  k.box(x0 + 0.1, cy0 - 0.08, cz0, x1 - 0.1, cy0, 1.27, M.cabFloor);                // corridor floor
  k.box(x0 + 0.1, cy1, cz0, x1 - 0.1, cy1 + 0.05, 1.27, M.tank);                     // its roof
  // The tank-side wall of the corridor, drawn as a translucent plate so the passage reads.
  k.glass([[x0 + 0.1, cy0, cz0], [x1 - 0.1, cy0, cz0], [x1 - 0.1, cy1, cz0], [x0 + 0.1, cy1, cz0]], { c: '#8a9298', alpha: 0.1 });
  // The passage's own walls are painted light, so it reads as a lit slot in the dark tank.
  k.box(x0 + 0.1, cy0, 1.255, x1 - 0.1, cy1, 1.27, mat({ c: '#b8c0b4', c2: '#a8b0a4', pat: 'plates', s: 0.7 }));
  k.box(x0 + 0.1, cy0, cz0 - 0.03, x1 - 0.1, cy0 + 0.04, cz0, M.steel);
  k.box(x0 + 0.1, cy1 - 0.04, cz0 - 0.03, x1 - 0.1, cy1, cz0, M.steel);
  for (const sx of [x0 + 0.15, x1 - 0.55]) { k.box(sx, 1.05, cz0, sx + 0.4, 1.3, 1.27, M.steel); k.box(sx + (sx < 17 ? 0.2 : 0), 1.3, cz0, sx + (sx < 17 ? 0.4 : 0.2), 1.52, 1.27, M.steel); }
  // The round window high in the tender rear, seen from inside the corridor.
  k.cyl(x1 - 0.07, 2.75, (cz0 + 1.27) / 2, 0.17, 0.02, mat({ c: '#cfe2f0', c2: '#ffd890', glow: 'night' }), { axis: 'x', seg: 16 });
  k.cyl(x1 - 0.08, 2.75, (cz0 + 1.27) / 2, 0.2, 0.01, M.brass, { axis: 'x', seg: 16 });
  // Rear gangway: Pullman-type bellows between tender and train.
  k.box(x1, FL - 0.05, -0.55, T.x1 + 0.02, FL + 2.0, 0.55, M.bellows);
  // Near side of the tender, kept low like the cab side, with stainless LNER letters.
  k.box(x0, 0.98, -1.37, x1, 1.96, -1.31, M.casingW);
  k.box(x0, 1.96, -1.38, x1, 2.0, -1.3, M.stainlessW);
  let lx = 15.6;
  for (const ch of 'LNER') { letters(k, ch, lx, 1.28, -1.39, 0.42, M.stainlessW); lx += 1.25; }
  // Far tender wheels (static), axles cut on the centreline.
  for (const x of AX.tender) {
    k.cyl(x, AX.rTd, 0.66, AX.rTd, 0.12, M.black, { axis: 'z', seg: 18 });
    k.cyl(x, AX.rTd, -0.66, 0.07, 1.32, M.steel, { axis: 'z', seg: 8 });
    k.box(x - 0.18, 0.5, 0.84, x + 0.18, 0.9, 0.98, M.black);                        // axlebox
  }
  S.tenderEnd = T.x1;
}

// ------------------------------------------------------------------ moving parts
// A spoked wheel in the x-y plane (axis z), drawn into part kit q at local origin.
function spokedWheel(q, r, n, face, m, tyre, whole) {
  q.whole = !!whole;
  const g = new THREE.TorusGeometry(r - 0.045, 0.05, 4, 28);
  q.geo(g, new THREE.Matrix4().makeTranslation(0, 0, face), tyre);
  q.cyl(0, 0, face - 0.03, r - 0.07, 0.025, mat({ c: shade(m.hex, -0.25), whole: !!whole }), { axis: 'z', seg: 24 });
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    q.beam([Math.cos(a) * 0.14, Math.sin(a) * 0.14, face - 0.02], [Math.cos(a) * (r - 0.07), Math.sin(a) * (r - 0.07), face - 0.02], Math.max(0.035, r * 0.055), m);
  }
  q.cyl(0, 0, face - 0.05, 0.16, 0.07, m, { axis: 'z', seg: 12 });
  q.cyl(0, 0, face - 0.07, 0.07, 0.03, tyre, { axis: 'z', seg: 8 });
}

export function locoParts(k, S) {
  const P = (S.parts = { wheels: [], rods: {} });
  const near = -0.79; // outer face of the near wheels
  // Driving wheels: dark red with polished rims, crank bosses and balance weights.
  AX.coupled.forEach((x, i) => {
    const w = k.part(x, AX.rD, -0.72, (q) => {
      spokedWheel(q, AX.rD, 20, near + 0.72, M.wheelRedW, M.tyreW, true);
      q.whole = true;
      q.cyl(CRANK, 0, near + 0.72 - 0.1, 0.1, 0.1, M.wheelRedW, { axis: 'z', seg: 10 });          // crank boss
      q.boxR(-0.55, 0, near + 0.72 - 0.035, 0.32, 0.6, 0.05, M.wheelRedW);                       // balance weight
    });
    P.wheels.push({ g: w, r: AX.rD, ph: 0 });
    void i;
  });
  for (const [xs, r, n] of [[AX.bogie, AX.rB, 10], [AX.trailing, AX.rT, 12], [AX.tender, AX.rTd, 12]]) {
    for (const x of xs) {
      const w = k.part(x, r, -0.72, (q) => spokedWheel(q, r, n, near + 0.72, M.wheelRedW, M.tyreW, true));
      P.wheels.push({ g: w, r, ph: 0 });
    }
  }
  // Coupling rod (translates on the crank circle), connecting rod, crosshead, piston rod.
  const rodZ = -0.9;
  P.rods.coupling = k.part(0, 0, 0, (q) => {
    q.whole = true;
    q.box(AX.coupled[0] - 0.08, -0.05, rodZ - 0.03, AX.coupled[2] + 0.08, 0.05, rodZ + 0.03, M.rodW);
    for (const x of AX.coupled) q.cyl(x, 0, rodZ - 0.06, 0.07, 0.12, M.rodW, { axis: 'z', seg: 10 });
  });
  P.rods.conn = k.part(0, 0, 0, (q) => {
    q.whole = true;
    q.box(0, -0.065, -0.04, CONROD, 0.065, 0.04, M.rodW);
    q.cyl(0, 0, -0.06, 0.09, 0.12, M.rodW, { axis: 'z', seg: 10 });
    q.cyl(CONROD, 0, -0.06, 0.1, 0.12, M.rodW, { axis: 'z', seg: 10 });
  });
  P.rods.cross = k.part(0, CYL_Y, -1.08, (q) => {
    q.whole = true;
    q.box(-0.18, -0.1, -0.06, 0.18, 0.1, 0.06, M.steelW);
    q.box(-1.75, -0.03, -0.03, -0.18, 0.03, 0.03, M.rodW);                                      // piston rod
    q.box(-0.05, -0.32, -0.03, 0.05, -0.1, 0.03, M.steelW);                                      // drop arm to union link
  });
  // Walschaerts gear: expansion link (rocks), radius rod and combination lever (driven per frame).
  P.rods.link = k.part(6.68, 1.6, -1.12, (q) => { q.whole = true; q.box(-0.06, -0.32, -0.03, 0.06, 0.32, 0.03, M.steelW); q.cyl(0, 0, -0.06, 0.05, 0.1, M.rodW, { axis: 'z', seg: 8 }); });
  P.rods.radius = k.part(0, 0, 0, (q) => { q.whole = true; q.box(0, -0.03, -1.18, 2.1, 0.03, -1.14, M.rodW); });
  P.rods.combo = k.part(0, 0, 0, (q) => { q.whole = true; q.box(-0.025, -0.55, -1.2, 0.025, 0.0, -1.16, M.rodW); });
  P.rods.ecc = k.part(0, 0, 0, (q) => { q.whole = true; q.box(0, -0.03, -1.16, 1.65, 0.03, -1.12, M.rodW); });
  // Inside piston (seen in the cut-open middle cylinder).
  P.rods.innerPiston = k.part(0, 1.32, 0, (q) => {
    q.cyl(-0.05, 0, 0, 0.23, 0.1, mat({ c: '#9aa0a6', cut: '#6a6e72' }), { axis: 'x', seg: 14 });
    q.cyl(0.05, 0, 0, 0.04, 1.6, mat({ c: '#c4c8cc', cut: '#6a6e72' }), { axis: 'x', seg: 8 });
  });
  // The firehole door, swung open when the fireman fires.
  const fh = S.fire.hole;
  P.door = k.part(fh.x + 0.05, fh.y0, fh.z1, (q) => { q.box(0, 0, -0.55, 0.04, fh.y1 - fh.y0, 0, mat({ c: '#3a3634', cut: '#2a2422' })); });
}

// Per-frame motion. a = rolling distance angle of the driving wheels (radians).
export function animateLoco(S, dist) {
  const P = S.parts;
  for (const w of P.wheels) w.g.rotation.z = dist / w.r;
  const th = dist / AX.rD;
  const R = P.rods;
  // Coupling rod: rides on the crank circle without rotating.
  R.coupling.position.set(Math.cos(th) * CRANK, AX.rD + Math.sin(th) * CRANK, 0);
  // Connecting rod: from the crosshead (on the cylinder axis) to the crank pin of the middle axle.
  const px = AX.coupled[1] + Math.cos(th) * CRANK, py = AX.rD + Math.sin(th) * CRANK;
  const dy = py - CYL_Y;
  const cx = px - Math.sqrt(CONROD * CONROD - dy * dy);
  R.cross.position.x = cx;
  R.conn.position.set(cx, CYL_Y, -0.98);
  R.conn.rotation.z = Math.atan2(dy, px - cx);
  // Expansion link rocks a quarter turn out of phase; radius rod and lever follow.
  const la = 0.32 * Math.sin(th + Math.PI / 2);
  R.link.rotation.z = la;
  const die = [6.68 - Math.sin(la) * 0.12, 1.6 + Math.cos(la) * 0.12];
  const vx = 4.55 + 0.05 * Math.sin(th);
  R.radius.position.set(vx, 1.62, 0);
  R.radius.rotation.z = Math.atan2(die[1] - 1.62, die[0] - vx);
  R.radius.scale.x = Math.hypot(die[0] - vx, die[1] - 1.62) / 2.1;
  R.combo.position.set(vx, 1.62, 0);
  R.combo.rotation.z = Math.atan2(cx - vx, -(1.62 - (CYL_Y - 0.32))) * -1 * 0.6;
  // Eccentric rod: from the return crank on the middle wheel to the foot of the link.
  const ex = AX.coupled[1] + Math.cos(th + Math.PI / 2) * 0.22, ey = AX.rD + Math.sin(th + Math.PI / 2) * 0.22;
  const fx = 6.68 + Math.sin(la) * 0.3, fy = 1.6 - Math.cos(la) * 0.3;
  R.ecc.position.set(fx, fy, 0);
  R.ecc.rotation.z = Math.atan2(ey - fy, ex - fx);
  R.ecc.scale.x = Math.hypot(ex - fx, ey - fy) / 1.65;
  // Inside cylinder: its crank leads the outside one by a third of a turn.
  const thi = th + (TAU / 3);
  R.innerPiston.position.x = 2.2 + Math.cos(thi) * CRANK * 0.9;
}
export { CYL_Y };
void ZI;
