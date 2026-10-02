/* The nine carriages of the down Coronation, 1937: four articulated twins and the
 * beaver-tail observation car. Formation and seat counts follow the LNER brochure's
 * seat plan (docs/research/train.md, section 1 and zone table Z17 to Z41). Partition
 * positions, interior colours (except the one documented first-class scheme), fittings
 * and luggage are illustrative.
 *
 * Each car is cut on the centreline: the far (east) half is built from z = 0 to the far
 * wall at z = 1.41; floors, roofs and end walls straddle the cut so it shows their section.
 */
import { THREE, mat, shade, props } from '../../engine/index.js';
import { M, COL, FL, CEIL, ZW, ZI, SILL, WTOP, CANT, CROWN, B, seatX, seatH, hbox } from './common.js';

// Interior colour schemes (illustrative except FIRST_A, which is the documented scheme, S29).
const THIRD = { wallHi: '#e2d4b2', wallLo: '#8a6a48', seat: '#4a5f86', carpet: '#5a4a5a', carpet2: '#7a6a5a', trim: '#b89a62' };
const FIRST_A = { wallHi: '#a9b8a0', wallLo: '#7d9076', seat: '#c4a87e', carpet: '#4f6b48', carpet2: '#5f7d56', trim: '#d8dcd8' };
const FIRST_B = { wallHi: '#d8c8a8', wallLo: '#a8865e', seat: '#8a5a52', carpet: '#6a4a46', carpet2: '#7a5a52', trim: '#d8dcd8' };

// Bodies and their zones (x from the engine's buffer face). Zone ids follow the dossier.
export const BODIES = [
  { id: 'A1', twin: 'A', x0: B[0], x1: B[1], zones: [{ z: 'Z18', kind: 'guard', x0: B[0], x1: 27.6 }, { z: 'Z18v', kind: 'vest', x0: 27.6, x1: 29.0 }, { z: 'Z19', kind: 'third', x0: 29.0, x1: B[1], bays: 4 }] },
  { id: 'A2', twin: 'A', x0: B[1], x1: B[2], zones: [{ z: 'Z21', kind: 'third', x0: B[1], x1: 54.6, bays: 7 }, { z: 'Z22', kind: 'lav', x0: 54.6, x1: B[2] }] },
  { id: 'B1', twin: 'B', x0: B[2], x1: B[3], zones: [{ z: 'Z23', kind: 'kitchen', x0: B[2], x1: 64.6 }, { z: 'Z24', kind: 'third', x0: 64.6, x1: 72.1, bays: 3 }, { z: 'Z25', kind: 'vest', x0: 72.1, x1: B[3] }] },
  { id: 'B2', twin: 'B', x0: B[3], x1: B[4], zones: [{ z: 'Z26', kind: 'third', x0: B[3], x1: 89.6, bays: 7 }, { z: 'Z27', kind: 'lav', x0: 89.6, x1: B[4] }] },
  { id: 'C1', twin: 'C', x0: B[4], x1: B[5], zones: [{ z: 'Z28', kind: 'vest', x0: B[4], x1: 93.6 }, { z: 'Z29', kind: 'first', x0: 93.6, x1: B[5], bays: 6, scheme: FIRST_A }] },
  { id: 'C2', twin: 'C', x0: B[5], x1: B[6], zones: [{ z: 'Z30', kind: 'first', x0: B[5], x1: 124.6, bays: 6, scheme: FIRST_B }, { z: 'Z31', kind: 'lav', x0: 124.6, x1: B[6] }] },
  { id: 'D1', twin: 'D', x0: B[6], x1: B[7], zones: [{ z: 'Z32', kind: 'kitchen', x0: B[6], x1: 134.6 }, { z: 'Z33', kind: 'third', x0: 134.6, x1: 142.1, bays: 3 }, { z: 'Z34', kind: 'vest', x0: 142.1, x1: B[7] }] },
  { id: 'D2', twin: 'D', x0: B[7], x1: B[8], zones: [{ z: 'Z35', kind: 'third', x0: B[7], x1: 156.6, bays: 5 }, { z: 'Z36', kind: 'guard', x0: 156.6, x1: B[8] }] },
  { id: 'OBS', twin: null, x0: B[8], x1: B[9], zones: [{ z: 'Z37', kind: 'obsEnd', x0: B[8], x1: 164.1 }, { z: 'Z38', kind: 'obs', x0: 164.1, x1: 175.1 }, { z: 'Z39', kind: 'tail', x0: 175.1, x1: B[9] }] },
];
// Bogie centres: each twin rides on three (one shared under the joint), the observation car on two.
export const BOGIES = [24.4, 39.1, 53.85, 59.35, 74.1, 88.85, 94.35, 109.1, 123.85, 129.35, 144.1, 158.85, 164.3, 173.3];
export const COACH_WHEEL_R = 0.5; // illustrative
const TAIL0 = 175.1;

// Roof profile (outer) as a function of depth z from the centreline.
const roofY = (z) => CANT + (CROWN - CANT) * (1 - Math.pow(Math.min(1, Math.abs(z) / ZW), 2.2));
const ceilY = (z) => CEIL - 0.28 * Math.pow(Math.min(1, Math.abs(z) / ZI), 2);
function roofRing(top = roofY, z1 = ZW, t = 0.07) {
  const out = [];
  for (let i = 0; i <= 10; i++) { const z = -0.35 + (z1 + 0.35) * (i / 10); out.push([z, top(z)]); }
  const inner = out.map(([z, y]) => [Math.min(z, z1 - t), y - t]);
  return out.concat(inner.reverse());
}

function zoneColours(zone) {
  switch (zone.kind) {
    case 'third': return [THIRD.wallHi, THIRD.wallLo];
    case 'first': return [zone.scheme.wallHi, zone.scheme.wallLo];
    case 'kitchen': return ['#e8e6dc', '#c8c8c0'];
    case 'guard': return ['#b8a47e', '#8a7654'];
    case 'obsEnd': case 'obs': return ['#ddd0b0', '#a88a62'];
    default: return ['#d4c4a0', '#9a7a52'];
  }
}

// ------------------------------------------------------------------ the shell of one body
function shell(k, b, S) {
  const x0 = b.x0 + 0.16, x1 = (b.id === 'OBS' ? TAIL0 : b.x1 - 0.16);
  // Floor slab (honey timber in the cut), underframe and solebar.
  k.box(x0, FL - 0.22, -1.3, x1, FL, ZI, M.floorSlab, { top: false });
  k.box(x0 + 0.3, 0.86, -1.15, x1 - 0.3, FL - 0.22, 1.2, M.under);
  // Far side: lower panel (Garter blue outside), upper with windows (Marlborough blue outside).
  const wins = S.windows.filter((w) => w.x0 > x0 && w.x1 < x1);
  // The far wall, zone by zone so each room has its own wall colour inside.
  for (const zone of b.zones) {
    if (zone.kind === 'tail') continue;
    const zx0 = Math.max(x0, zone.x0), zx1 = Math.min(x1, zone.x1);
    if (zx1 - zx0 < 0.05) continue;
    const [hi, lo] = zoneColours(zone);
    const zw = wins.filter((w) => w.x0 > zx0 && w.x1 < zx1);
    const holes = zw.map((w) => [[w.x0, w.y0], [w.x1, w.y0], [w.x1, w.y1], [w.x0, w.y1]]);
    k.extrude([[zx0, 0.3], [zx1, 0.3], [zx1, SILL - 0.04], [zx0, SILL - 0.04]], ZI, ZW, mat({ c: lo, c2: shade(lo, -0.1), pat: 'panels', s: 1.1, cut: '#a8783e' }), { back: M.sideLo, side: M.sideLo });
    k.extrude([[zx0, SILL - 0.04], [zx1, SILL - 0.04], [zx1, CANT], [zx0, CANT]], ZI, ZW, mat({ c: hi, c2: shade(hi, -0.08), pat: zone.kind === 'kitchen' ? 'tiles' : 'none', s: 0.15, cut: '#a8783e' }), { holes, back: M.sideHi, side: M.sideHi, reveal: mat({ c: shade(hi, -0.1) }) });
  }
  for (const w of wins) {
    k.glass([[w.x0, w.y0, ZW - 0.04], [w.x1, w.y0, ZW - 0.04], [w.x1, w.y1, ZW - 0.04], [w.x0, w.y1, ZW - 0.04]], { c: '#b8d4e4', alpha: 0.2 });
    k.box(w.x0 - 0.03, w.y0 - 0.05, ZI - 0.05, w.x1 + 0.03, w.y0, ZI, M.stainless); // sill trim
  }
  // Stainless waist moulding outside (seen over the roof edge and in slices).
  k.box(x0, SILL - 0.06, ZW, x1, SILL - 0.02, ZW + 0.012, M.stainless);
  // Roof and inner ceiling.
  k.extrudeX(roofRing(), x0, x1, M.roof);
  k.extrudeX(roofRing(ceilY, ZI, 0.035), x0, x1, mat({ c: '#efe6d0', c2: '#f0c890', glow: 'night', cut: '#a8783e' }));
  // Roof grilles where the stale air leaves, along the ceiling.
  for (let x = x0 + 1.2; x < x1 - 0.8; x += 2.4) k.box(x - 0.3, CEIL - 0.035, 0.25, x + 0.3, CEIL - 0.025, 0.55, mat({ c: '#b8b2a4', c2: '#8a8476', pat: 'bars', s: 0.04 }));
  // End walls with gangway doorways.
  for (const ex of [x0, x1]) {
    if (b.id === 'OBS' && ex === x1) continue;
    const prof = [[-1.3, FL], [-0.45, FL], [-0.45, FL + 2.0], [0.45, FL + 2.0], [0.45, FL], [ZI, FL], [ZI, ceilY(ZI)], [0.6, ceilY(0.6)], [-1.3, CEIL]];
    k.extrudeX(prof, ex === x0 ? ex : ex - 0.07, ex === x0 ? ex + 0.07 : ex, mat({ c: '#cbb994', c2: '#b8a47a', pat: 'panels', s: 0.6, cut: '#a8783e' }));
  }
  // Near-side body strip below the floor, kept like the books' cutaways (drawn whole).
  k.box(x0, FL - 0.32, -ZW, x1, FL - 0.02, -ZW + 0.06, mat({ c: COL.garter, whole: true }));
  // Far skirt between the bogies (to within 10 in of the rail on the Silver Jubilee).
  k.box(x0, 0.3, ZW - 0.06, x1, 0.95, ZW, M.sideLo);
}

// Gangway bellows and the indiarubber fairing in body colours between two bodies.
function gangway(k, xa, xb) {
  k.box(xa, FL - 0.06, -0.55, xb, FL, 0.55, M.dark);
  k.box(xa, FL + 2.0, -0.55, xb, FL + 2.06, 0.55, M.bellows);
  k.box(xa, FL, 0.5, xb, FL + 2.0, 0.56, M.bellows);
  k.box(xa, 0.3, ZI, xb, SILL - 0.04, ZW, mat({ c: COL.garter, cut: '#1a1a1c' }));
  k.box(xa, SILL - 0.04, ZI, xb, CANT, ZW, mat({ c: COL.marl, cut: '#1a1a1c' }));
  k.extrudeX(roofRing(), xa, xb, mat({ c: COL.roof, cut: '#1a1a1c' }));
}

// ------------------------------------------------------------------ interiors
function luggageRack(k, x0, x1, r) {
  k.box(x0, 2.92, 0.92, x1, 2.95, ZI, mat({ c: '#c8ccd0', c2: '#9aa0a6', pat: 'bars', s: 0.05 }));
  for (let x = x0 + 0.2; x < x1 - 0.4; x += 0.35 + r() * 0.5) {
    if (r() < 0.35) continue;
    const w = 0.35 + r() * 0.3, h = 0.16 + r() * 0.12;
    const c = r.pick(['#6a4024', '#8a5a34', '#4a3a2a', '#7a2a24', '#5a5a4a', '#a88a5a']);
    k.box(x, 2.95, 1.0, x + w, 2.95 + h, ZI - 0.02, mat({ c }));
    if (r() < 0.4) k.box(x + 0.05, 2.95 + h, 1.02, x + 0.15, 2.95 + h + 0.004, 1.12, mat({ c: r.pick(['#e8dcc0', '#c84a3a', '#3a6a9a']) })); // a travel label
    x += w;
  }
}

function ceilingLamp(k, x, z = 0.55, r = 2.6, i = 0.85) {
  k.box(x - 0.22, CEIL - 0.05, z - 0.14, x + 0.22, CEIL - 0.02, z + 0.14, mat({ c: '#d8dcd8', c2: '#a8aca8', pat: 'bars', s: 0.04 }));
  return k.lamp(x, CEIL - 0.12, z, { color: '#ffd49a', r: r * 1.2, i: i * 1.3, bulbR: 0.05, halo: 0.45 });
}

function floorAndWalls(k, x0, x1, sc, opt = {}) {
  // Carpet, a dado below the windows and the panelled wall above.
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: sc.carpet, c2: sc.carpet2, pat: opt.floorPat || 'carpet', s: opt.floorS || 0.45 }));
  k.box(x0, FL, ZI - 0.015, x1, SILL - 0.06, ZI, mat({ c: sc.wallLo, c2: shade(sc.wallLo, -0.1), pat: 'panels', s: 1.1 }));
  k.box(x0, SILL - 0.06, ZI - 0.03, x1, SILL - 0.03, ZI, mat({ c: sc.trim }));
}

// Third class: armchairs two abreast on the far side of the gangway, facing in bays across tables.
function third(k, zone, S, r) {
  const sc = THIRD;
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  floorAndWalls(k, x0, x1, sc);
  const P = (x1 - x0) / zone.bays;
  const seats = (S.seats[zone.z] = []);
  for (let i = 0; i < zone.bays; i++) {
    const bx = x0 + i * P;
    const ta = bx + 0.86, tb = bx + P - 0.86;
    // Table across both seats, fixed to the wall, laid for tea or dinner.
    k.box(ta, FL + 0.7, 0.22, tb, FL + 0.74, ZI - 0.02, mat({ c: '#f4efe4' }));
    k.box((ta + tb) / 2 - 0.05, FL, 0.6, (ta + tb) / 2 + 0.05, FL + 0.7, 0.7, M.stainless);
    for (const z of [0.48, 1.0]) {
      k.cyl(ta + 0.13, FL + 0.74, z, 0.1, 0.012, mat({ c: '#f8f6f0' }), { seg: 10 });
      k.cyl(tb - 0.13, FL + 0.74, z, 0.1, 0.012, mat({ c: '#f8f6f0' }), { seg: 10 });
      if (r() < 0.6) k.cyl(ta + 0.22, FL + 0.74, z + 0.12, 0.035, 0.07, mat({ c: '#f2ede2' }), { seg: 8 });
      if (r() < 0.6) k.cyl(tb - 0.22, FL + 0.74, z + 0.12, 0.035, 0.07, mat({ c: '#f2ede2' }), { seg: 8 });
    }
    if (r() < 0.5) k.cyl((ta + tb) / 2, FL + 0.74, 1.1, 0.05, 0.16, mat({ c: '#f4f2ee' }), { seg: 10 }); // teapot
    // Small stories on the tables: a folded newspaper, a hand of cards, crayons.
    const story = zone.z === 'Z21' && i === 3 ? 'paper' : zone.z === 'Z35' && i === 3 ? 'cards' : zone.z === 'Z21' && i === 0 ? 'crayons' : r() < 0.2 ? 'paper' : null;
    if (story === 'paper') { k.box(ta + 0.05, FL + 0.74, 0.3, ta + 0.33, FL + 0.752, 0.62, mat({ c: '#ece6d4', c2: '#8a8478', pat: 'stripes', s: 0.02 })); }
    if (story === 'cards') for (let c = 0; c < 6; c++) k.box(ta + 0.12 + c * 0.05, FL + 0.74, 0.5 + (c % 3) * 0.12, ta + 0.18 + c * 0.05, FL + 0.746, 0.59 + (c % 3) * 0.12, mat({ c: c % 2 ? '#f8f4ec' : '#c83a2a' }));
    if (story === 'crayons') for (let c = 0; c < 5; c++) k.box(ta + 0.1 + c * 0.03, FL + 0.74, 0.32, ta + 0.115 + c * 0.03, FL + 0.755, 0.42, mat({ c: ['#c83a2a', '#3a6ab8', '#e8c040', '#3a8a4a', '#2a2a8a'][c] }));
    for (const z of [0.5, 1.03]) {
      seats.push(Object.assign(seatX(k, bx + 0.42, FL, z, 1, { color: sc.seat, pat: 'quilt' }), { face: 1, bay: i }));
      seats.push(Object.assign(seatX(k, bx + P - 0.42, FL, z, -1, { color: sc.seat, pat: 'quilt' }), { face: -1, bay: i }));
    }
    S.windows.push({ x0: bx + 0.45, x1: bx + P - 0.45, y0: SILL, y1: WTOP });
    ceilingLamp(k, bx + P / 2);
    // Partition between sections of twelve, with its doorway on the gangway.
    if (i % 2 === 1 && i < zone.bays - 1) {
      const px = bx + P;
      k.box(px - 0.03, FL, 0.25, px + 0.03, CEIL - 0.25, ZI, mat({ c: sc.wallHi, c2: shade(sc.wallHi, -0.1), pat: 'panels', s: 0.5, cut: '#a8783e' }));
      k.box(px - 0.05, CEIL - 0.3, -0.3, px + 0.05, CEIL - 0.25, 0.25, mat({ c: sc.trim }));
    }
  }
  luggageRack(k, x0 + 0.2, x1 - 0.2, r);
  // Coat hooks with a hat or two on the partitions.
  for (let x = x0 + 1.0; x < x1; x += 4.4) props.picture(k, x, 2.2, ZI - 0.005, { w: 0.55, h: 0.36, color: r.pick(['#7a9aa8', '#a8946a', '#6a8a6a']), frame: '#8a7a5a' });
}

// First class: two swivelling armchairs at each tapered table, turned towards the window;
// ornamental screens between the alcoves; table lamps.
function first(k, zone, S, r) {
  const sc = zone.scheme;
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  floorAndWalls(k, x0, x1, sc, { floorS: 0.6 });
  const P = (x1 - x0) / zone.bays;
  const seats = (S.seats[zone.z] = []);
  for (let i = 0; i < zone.bays; i++) {
    const bx = x0 + i * P, cx = bx + P / 2;
    // Tapered table: narrow on the gangway side, wide at the window.
    k.box(cx - 0.36, FL + 0.7, 0.85, cx + 0.36, FL + 0.74, ZI - 0.02, mat({ c: '#f6f2e8' }));
    k.box(cx - 0.24, FL + 0.7, 0.5, cx + 0.24, FL + 0.74, 0.85, mat({ c: '#f6f2e8' }));
    k.box(cx - 0.05, FL, 0.85, cx + 0.05, FL + 0.7, 0.95, M.stainless);
    // Silverware with flat handles, plates, glasses, a little lamp.
    for (const s of [-1, 1]) {
      k.cyl(cx + s * 0.2, FL + 0.74, 0.92, 0.11, 0.012, mat({ c: '#fbfaf6' }), { seg: 12 });
      k.box(cx + s * 0.2 - 0.12, FL + 0.74, 1.06, cx + s * 0.2 + 0.12, FL + 0.746, 1.08, mat({ c: '#e4e6e8' }));
      k.cyl(cx + s * 0.08, FL + 0.74, 1.12, 0.03, 0.09, mat({ c: '#d8e8ee' }), { seg: 8 });
    }
    k.cyl(cx, FL + 0.74, 1.18, 0.05, 0.22, M.stainless, { seg: 8 });
    k.lathe([[0.06, FL + 0.94], [0.12, FL + 1.06], [0.04, FL + 1.1]], cx, 1.18, mat({ c: '#f0d8a8', c2: '#ffe0a0', glow: 'night' }), { seg: 10 });
    k.lamp(cx, FL + 1.0, 1.1, { color: '#ffd090', r: 1.8, i: 0.6, bulb: false, halo: 0.3 });
    const a = 0.55;
    seats.push(Object.assign(seatH(k, bx + 0.55, FL, 0.72, a, { color: sc.seat }), { face: a, bay: i }));
    seats.push(Object.assign(seatH(k, bx + P - 0.55, FL, 0.72, Math.PI - a, { color: sc.seat }), { face: Math.PI - a, bay: i }));
    S.windows.push({ x0: bx + 0.42, x1: bx + P - 0.42, y0: SILL, y1: WTOP });
    // Ornamental screen wing at the alcove end, fretted along its top.
    if (i < zone.bays - 1) {
      const px = bx + P;
      k.box(px - 0.03, FL, 0.62, px + 0.03, FL + 1.55, ZI, mat({ c: sc.wallHi, c2: sc.wallLo, pat: 'panels', s: 0.35, cut: '#a8783e' }));
      k.box(px - 0.035, FL + 1.55, 0.62, px + 0.035, FL + 1.75, ZI, mat({ c: sc.trim, c2: shade(sc.trim, -0.3), pat: 'bars', s: 0.06 }));
    }
    ceilingLamp(k, cx, 0.5, 2.4, 0.6);
  }
  // Aluminium architraves at the saloon ends.
  for (const ex of [x0 + 0.05, x1 - 0.05]) k.box(ex - 0.04, FL, 0.45, ex + 0.04, FL + 2.08, 0.55, mat({ c: '#d8dcd8' }));
}

function kitchen(k, zone, S, r) {
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  const pantry = x1 - 2.5;
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: '#8a8a7a', c2: '#6a6a5a', pat: 'checker', s: 0.25 }));
  k.box(x0, FL, ZI - 0.015, x1, CANT - 0.1, ZI, mat({ c: '#e8e6dc', c2: '#d0cec4', pat: 'tiles', s: 0.15 }));
  // Steel worktop along the far wall.
  k.box(x0 + 0.1, FL, 0.68, pantry - 0.1, FL + 0.88, ZI - 0.02, mat({ c: '#a8aeb4', c2: '#8a9096', pat: 'panels', s: 0.6 }));
  k.box(x0 + 0.08, FL + 0.88, 0.62, pantry - 0.08, FL + 0.92, ZI - 0.01, M.stainless);
  // All-electric range with hotplates and pans (no flame), an oven below.
  const rx = x0 + 1.2;
  k.box(rx - 0.75, FL, 0.62, rx + 0.75, FL + 0.93, ZI - 0.02, mat({ c: '#2a2a2c' }));
  k.box(rx - 0.6, FL + 0.2, 0.6, rx + 0.6, FL + 0.7, 0.63, mat({ c: '#3a3a3c', c2: '#5a5a5c', pat: 'panels', s: 0.6 }));
  for (const dx of [-0.45, 0.0, 0.45]) {
    k.cyl(rx + dx, FL + 0.93, 0.95, 0.15, 0.015, mat({ c: '#5a3a30', c2: '#c84a2a', glow: 'always' }), { seg: 12 });
  }
  k.cyl(rx - 0.45, FL + 0.945, 0.95, 0.16, 0.22, mat({ c: '#b8bcc0' }), { seg: 12 });
  k.cyl(rx + 0.45, FL + 0.945, 0.95, 0.14, 0.14, mat({ c: '#b06a3a' }), { seg: 12 });
  S.steam.push([rx - 0.45, FL + 1.2, 0.95], [rx + 0.45, FL + 1.1, 0.95]);
  // Electric water boiler, refrigerator, sink, racks of crockery.
  k.cyl(rx + 1.35, FL + 0.92, 0.95, 0.2, 0.55, M.stainless, { seg: 14 });
  k.cyl(rx + 1.35, FL + 1.47, 0.95, 0.12, 0.06, M.stainless, { seg: 10 });
  S.steam.push([rx + 1.35, FL + 1.55, 0.95]);
  k.box(rx + 1.75, FL, 0.6, rx + 2.6, FL + 1.75, ZI - 0.02, mat({ c: '#ece6d4', c2: '#d4ccb8', pat: 'panels', s: 0.8 }));
  k.box(rx + 2.5, FL + 0.9, 0.58, rx + 2.55, FL + 1.3, 0.6, M.stainless);
  k.box(rx + 2.75, FL + 0.8, 0.7, rx + 3.5, FL + 0.92, ZI - 0.05, mat({ c: '#c8cdd2' }));
  k.box(rx + 3.08, FL + 0.92, 1.15, rx + 3.14, FL + 1.15, 1.2, M.stainless);
  props.shelves(k, (x0 + pantry) / 2 + 0.6, FL + 1.25, ZI - 0.32, { w: 2.6, h: 0.75, n: 2, d: 0.3, items: 'plates', color: '#a8aeb4' });
  S.windows.push({ x0: x0 + 0.3, x1: x0 + 1.9, y0: SILL + 0.15, y1: WTOP }, { x0: x0 + 3.6, x1: x0 + 4.6, y0: SILL + 0.15, y1: WTOP });
  // Pantry: shelves of linen and crockery, trays, the dumb-waiter counter.
  k.box(pantry - 0.04, FL, 0.45, pantry + 0.04, CEIL - 0.2, ZI, mat({ c: '#e0dcd0', cut: '#a8783e' }));
  props.shelves(k, pantry + 1.25, FL, ZI - 0.4, { w: 1.9, h: 1.9, n: 5, d: 0.38, items: 'plates', color: '#9a8a6a' });
  k.box(pantry + 0.2, FL, 0.45, pantry + 2.3, FL + 0.9, 0.85, mat({ c: '#9a7a52', c2: '#8a6a42', pat: 'grain' }));
  for (let i = 0; i < 4; i++) k.box(pantry + 0.4 + i * 0.45, FL + 0.9, 0.5 + (i % 2) * 0.05, pantry + 0.75 + i * 0.45, FL + 0.92 + i * 0.01, 0.78, mat({ c: '#c0c4c8' }));
  k.box(x1 - 0.03, FL, 0.45, x1 + 0.03, CEIL - 0.2, ZI, mat({ c: '#e0dcd0', cut: '#a8783e' }));
  S.windows.push({ x0: pantry + 0.4, x1: pantry + 2.1, y0: SILL + 0.15, y1: WTOP });
  for (const x of [x0 + 1.5, x0 + 4.0, pantry + 1.2]) k.lamp(x, CEIL - 0.1, 0.5, { color: '#fff0d0', r: 2.6, i: 1.0, bulbR: 0.06, halo: 0.5 });
  S.stations[zone.z] = { range: [rx, 0.3], urn: [rx + 1.35, 0.3], sink: [rx + 3.1, 0.3], fridge: [rx + 2.2, 0.3], pantry: [pantry + 1.2, 0.2], bench: [x0 + 3.8, 0.35] };
}

function vestibule(k, zone, S) {
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: '#6a5a4a', c2: '#5a4a3a', pat: 'tiles', s: 0.3 }));
  const dx = (x0 + x1) / 2;
  // Entrance door on the far side, with its drop-light window and grab rails.
  k.box(x0, FL, ZI - 0.015, x1, CANT - 0.1, ZI, mat({ c: '#cbb994', c2: '#b8a47a', pat: 'panels', s: 0.7 }));
  k.box(dx - 0.4, FL, ZI - 0.04, dx + 0.4, FL + 1.95, ZI - 0.015, mat({ c: '#8a6a48', c2: '#7a5a38', pat: 'panels', s: 0.4 }));
  S.windows.push({ x0: dx - 0.28, x1: dx + 0.28, y0: SILL, y1: WTOP - 0.05 });
  for (const s of [-1, 1]) k.box(dx + s * 0.5 - 0.015, FL + 0.9, ZI - 0.08, dx + s * 0.5 + 0.015, FL + 1.7, ZI - 0.05, M.stainless);
  k.lamp(dx, CEIL - 0.1, 0.4, { color: '#ffd9a0', r: 2.0, i: 0.6, bulbR: 0.04, halo: 0.3 });
  S.stations[zone.z] = { door: [dx, 0.85] };
}

function lavatory(k, zone, S) {
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  const lx = x0 + 1.05;
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: '#6a5a4a', c2: '#5a4a3a', pat: 'tiles', s: 0.3 }));
  // Lavatory compartment (far side): partition with a door, pan, basin, frosted window.
  k.box(x0, FL, 0.55, lx, FL + 0.012, ZI, mat({ c: '#e8e4d8', c2: '#d8d4c8', pat: 'checker', s: 0.15 }));
  k.box(lx - 0.03, FL, 0.45, lx + 0.03, CEIL - 0.15, ZI, mat({ c: '#cbb994', c2: '#b8a47a', pat: 'panels', s: 0.4, cut: '#a8783e' }));
  k.box(x0, FL, 0.45, lx, FL + 2.0, 0.5, mat({ c: '#cbb994', c2: '#b8a47a', pat: 'panels', s: 0.45, cut: '#a8783e' }), { front: mat({ c: '#b8a47a', c2: '#a8946a', pat: 'panels', s: 0.45 }) });
  k.box(x0, FL, ZI - 0.015, x1, CANT - 0.1, ZI, mat({ c: '#cbb994', c2: '#b8a47a', pat: 'panels', s: 0.7 }));
  k.box(lx, FL, ZI - 0.04, x1, FL + 1.95, ZI - 0.015, mat({ c: '#8a6a48', c2: '#7a5a38', pat: 'panels', s: 0.4 }));
  S.windows.push({ x0: (lx + x1) / 2 - 0.25, x1: (lx + x1) / 2 + 0.25, y0: SILL, y1: WTOP - 0.05 });
  k.lamp(x1 - 0.4, CEIL - 0.1, 0.35, { color: '#ffd9a0', r: 1.8, i: 0.5, bulbR: 0.04, halo: 0.25 });
  S.stations[zone.z] = { window: [(lx + x1) / 2, 0.85], lav: [x0 + 0.5, 0.25] };
}

function guardVan(k, zone, S, r, front) {
  const x0 = zone.x0 + 0.12, x1 = zone.x1 - 0.12;
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: '#9a7a52', c2: '#7a5a3a', pat: 'planks', s: 0.14 }));
  k.box(x0, FL, ZI - 0.015, x1, CANT - 0.1, ZI, mat({ c: '#a8946e', c2: '#8a7654', pat: 'planks', s: 0.16 }));
  // Double luggage doors in the far side, with small windows.
  const dx = (x0 + x1) / 2 + (front ? 0.6 : -0.6);
  k.box(dx - 0.85, FL, ZI - 0.04, dx + 0.85, FL + 1.95, ZI - 0.015, mat({ c: '#7a6040', c2: '#6a5030', pat: 'planks', s: 0.12 }));
  S.windows.push({ x0: dx - 0.7, x1: dx - 0.2, y0: SILL + 0.1, y1: WTOP - 0.1 }, { x0: dx + 0.2, x1: dx + 0.7, y0: SILL + 0.1, y1: WTOP - 0.1 });
  // Guard's desk and stool, handbrake wheel, vacuum gauge.
  const gx = front ? x0 + 0.6 : x1 - 0.6;
  k.box(gx - 0.45, FL + 0.75, 0.7, gx + 0.45, FL + 0.8, ZI - 0.02, mat({ c: '#7a5232', c2: '#6a4222', pat: 'grain' }));
  k.box(gx - 0.42, FL, 0.95, gx + 0.42, FL + 0.75, ZI - 0.04, mat({ c: '#6a4428' }));
  k.box(gx - 0.12, FL + 0.8, 0.95, gx + 0.12, FL + 0.84, 1.15, mat({ c: '#f4ecd8' }));
  k.cyl(gx + (front ? 0.75 : -0.75), FL, 0.95, 0.05, 1.0, M.steel, { seg: 8 });
  k.cyl(gx + (front ? 0.75 : -0.75), FL + 1.0, 0.95, 0.24, 0.04, M.black, { seg: 16 });
  k.cyl(gx, FL + 1.55, ZI - 0.05, 0.1, 0.04, M.brass, { axis: 'z', seg: 14 });
  k.cyl(gx, FL + 1.55, ZI - 0.07, 0.085, 0.02, M.gauge, { axis: 'z', seg: 14 });
  // Luggage: trunks with labels, suitcases, gun cases, fishing rods, hampers.
  const lx0 = front ? x0 + 1.6 : x0 + 0.3, lx1 = front ? x1 - 0.3 : x1 - 1.6;
  let x = lx0;
  while (x < lx1 - 0.6) {
    const w = 0.5 + r() * 0.5, h = 0.35 + r() * 0.35;
    const c = r.pick(['#5a3a24', '#7a4a2a', '#3a3a3a', '#6a5a3a', '#8a2a24', '#2a3a5a']);
    k.box(x, FL, 0.55, x + w, FL + h, ZI - 0.05, mat({ c, c2: shade(c, -0.15), pat: r() < 0.5 ? 'stripes' : 'none', s: 0.3 }));
    if (r() < 0.7) { const h2 = 0.2 + r() * 0.15; k.box(x + 0.05, FL + h, 0.62, x + w - 0.08, FL + h + h2, ZI - 0.1, mat({ c: r.pick(['#a87a4a', '#6a4024', '#c8b48a', '#4a5a6a']) })); }
    if (r() < 0.5) k.box(x + 0.08, FL + h * 0.5, 0.548, x + 0.22, FL + h * 0.5 + 0.1, 0.552, mat({ c: r.pick(['#e8dcc0', '#c8a040', '#d84a3a']) }));
    x += w + 0.08;
  }
  // Gun cases and rods leaning on the wall.
  for (let i = 0; i < 4; i++) {
    const rx = lx0 + 0.3 + i * 0.35;
    k.boxR(rx, FL + 0.65, ZI - 0.12, 0.1, 1.3, 0.06, mat({ c: i % 2 ? '#5a3a20' : '#7a6a4a' }), { z: 0.12 });
  }
  for (let i = 0; i < 3; i++) k.beam([lx1 - 0.2 - i * 0.15, FL, ZI - 0.1], [lx1 - 0.6 - i * 0.15, FL + 2.3, ZI - 0.08], 0.025, mat({ c: '#6a4a2a' }));
  if (front) { k.cyl(x0 + 1.75, FL, 0.35, 0.12, 0.06, mat({ c: '#8a8e94' }), { seg: 12 }); k.cyl(x0 + 1.75, FL + 0.05, 0.35, 0.1, 0.012, mat({ c: '#7ab0c8' }), { seg: 12 }); } // the dog's water bowl
  k.lamp((x0 + x1) / 2, CEIL - 0.1, 0.5, { color: '#ffd9a0', r: 3.2, i: 0.75, bulbR: 0.05, halo: 0.4 });
  S.stations[zone.z] = { desk: [gx, 0.45], brake: [gx + (front ? 0.75 : -0.75), 0.4], dog: [front ? x0 + 0.75 : x1 - 1.0, 0.3], lug: [(lx0 + lx1) / 2, 0.3] };
}

// Observation car: attendant's station, armchairs facing the big windows and the tail.
function obsEnd(k, zone, S) {
  const x0 = zone.x0 + 0.12, x1 = zone.x1;
  k.box(x0, FL, 0.0, x1, FL + 0.012, ZI - 0.01, mat({ c: '#5a6a7a', c2: '#6a7a8a', pat: 'carpet', s: 0.5 }));
  k.box(x0, FL, ZI - 0.015, x1, CANT - 0.1, ZI, mat({ c: '#d8c8a0', c2: '#c8b890', pat: 'panels', s: 0.6 }));
  // Attendant's counter with shelves of glasses and bottles.
  k.box(x0 + 0.3, FL, 0.55, x0 + 2.0, FL + 1.0, 0.95, mat({ c: '#7a5232', c2: '#6a4222', pat: 'grain' }));
  k.box(x0 + 0.25, FL + 1.0, 0.5, x0 + 2.05, FL + 1.05, 1.0, M.stainless);
  props.shelves(k, x0 + 1.15, FL + 1.25, ZI - 0.28, { w: 1.6, h: 0.8, n: 2, d: 0.26, items: 'bottles', color: '#7a5232' });
  for (let i = 0; i < 4; i++) k.cyl(x0 + 0.6 + i * 0.3, FL + 1.05, 0.75, 0.03, 0.1, mat({ c: '#d8e8ee' }), { seg: 8 });
  k.lamp(x0 + 1.2, CEIL - 0.1, 0.5, { color: '#ffd9a0', r: 2.4, i: 0.8, bulbR: 0.05, halo: 0.4 });
  S.stations[zone.z] = { counter: [x0 + 1.15, 0.2] };
}

function obsSaloon(k, zone, S) {
  const x0 = zone.x0, x1 = zone.x1;
  k.box(x0, FL, 0.0, x1 + 2.2, FL + 0.012, ZI - 0.01, mat({ c: '#5a6a7a', c2: '#6a7a8a', pat: 'carpet', s: 0.5 }));
  k.box(x0, FL, ZI - 0.015, x1, SILL - 0.25, ZI, mat({ c: '#a88a62', c2: '#987a52', pat: 'panels', s: 1.0 }));
  const seats = (S.seats[zone.z] = []);
  const n = 8, P = (x1 - x0 - 0.4) / n;
  for (let i = 0; i < n; i++) {
    const cx = x0 + 0.4 + P * (i + 0.5);
    seats.push(Object.assign(seatH(k, cx, FL, 0.85, 0.4, { color: '#5a7a8a', back: 1.05 }), { face: 0.4 }));
    S.windows.push({ x0: cx - P / 2 + 0.12, x1: cx + P / 2 - 0.12, y0: SILL - 0.2, y1: WTOP + 0.05 });
    if (i % 2 === 0) k.lamp(cx, CEIL - 0.1, 0.5, { color: '#ffd9a0', r: 2.4, i: 0.6, bulbR: 0.04, halo: 0.35 });
    if (i % 2 === 1) { k.cyl(cx - P / 2, FL, 1.05, 0.18, 0.55, mat({ c: '#7a5232' }), { seg: 12 }); k.cyl(cx - P / 2, FL + 0.55, 1.05, 0.04, 0.12, mat({ c: '#d8e8ee' }), { seg: 8 }); }
  }
  // A row of chairs along the gangway side, turned towards the tail.
  for (let i = 0; i < 4; i++) seats.push(Object.assign(seatH(k, x0 + 1.6 + i * 2.6, FL, 0.25, 0.25, { color: '#5a7a8a', back: 1.05 }), { face: 0.25 }));
}

// The beaver tail: the roof carried in a curve right down to the buffers, sloping windows.
function tail(k, S) {
  const xs = [TAIL0, 175.6, 176.1, 176.6, 177.05, 177.45, 177.75, 177.95, 178.05];
  const kf = (x) => { const u = (x - TAIL0) / (178.05 - TAIL0); return Math.sqrt(Math.max(0, 1 - Math.pow(u, 1.6))); };
  const base = 0.3;
  const sec = (x) => {
    const k1 = Math.max(0.12, kf(x));
    const w = 0.55 + 0.45 * Math.sqrt(k1);
    const out = [];
    for (let i = 0; i <= 10; i++) { const z = -0.35 + (ZW + 0.35) * (i / 10); out.push([z < 0 ? z : z * w, base + (roofY(z) - base) * k1]); }
    out.push([ZW * w, base + (2.3 - base) * k1], [ZW * w, base + (1.0 - base) * k1], [ZW * w, base]);
    const inner = out.map(([z, y]) => [Math.min(z, ZW * w - 0.06), Math.max(base + 0.06, y - 0.06)]);
    return out.concat(inner.reverse());
  };
  const glassBand = mat({ c: '#8aa8c0', c2: '#ffd890', pat: 'panes', s: 0.45, glow: 'night', cut: '#a8783e' });
  k.loft(xs.map((x) => ({ x, pts: sec(x) })), M.roof, {
    matFn: (s, i) => {
      if (i >= 14) return i >= 14 && i < 18 ? mat({ c: '#cfe0ea', c2: '#ffd890', pat: 'panes', s: 0.45, glow: 'night' }) : mat({ c: '#e8dcc0', cut: '#a8783e' });
      if (i >= 5 && i <= 11) return glassBand;
      return i > 11 ? M.sideLo : M.roof;
    },
  });
  // The CORONATION name across the back is on the far end; seen here as a stainless band.
  k.box(177.6, 0.75, 0.0, 177.9, 0.8, 0.9, M.stainless);
  // Chairs in the tail facing out through the sloping glass.
  const seats = S.seats.Z38;
  for (const z of [0.35, 0.95]) seats.push(Object.assign(seatH(k, 176.0, FL, z, 0.05, { color: '#5a7a8a', back: 1.0 }), { face: 0.05 }));
  // A red tail lamp at the very end of the train.
  k.lamp(177.95, 0.95, 0.5, { color: '#ff3a2a', r: 1.2, i: 0.5, bulbR: 0.06, halo: 0.35 });
}

// ------------------------------------------------------------------ underneath
function bogie(k, cx) {
  const r = COACH_WHEEL_R, wb = 2.59 / 2;
  k.box(cx - 1.6, 0.42, 0.84, cx + 1.6, 0.72, 0.94, M.black);                   // side frame
  k.box(cx - 1.3, 0.6, -0.9, cx + 1.3, 0.78, 0.9, M.black);                     // bolsters (cut)
  for (const s of [-1, 1]) {
    k.box(cx + s * wb - 0.16, 0.35, 0.84, cx + s * wb + 0.16, 0.7, 0.98, M.dark); // axlebox
    k.cyl(cx + s * wb, r, -0.72, 0.065, 1.44, M.steel, { axis: 'z', seg: 8 });     // axle
  }
  for (const s of [-0.55, 0.55]) for (let c = 0; c < 4; c++) k.cyl(cx + s, 0.72 + c * 0.04, 0.89, 0.07, 0.03, mat({ c: '#4a4a4a' }), { axis: 'z', seg: 10 }); // springs
}

function underGear(k, b, r) {
  const x0 = b.x0 + 3.5, x1 = b.x1 - 3.5;
  if (x1 - x0 < 3) return;
  // Battery boxes, vacuum brake cylinders, air-conditioning plant (positions illustrative).
  k.box(x0 + 0.3, 0.55, 0.3, x0 + 1.6, 0.95, 1.1, mat({ c: '#3a3a3c', c2: '#2a2a2c', pat: 'panels', s: 0.6 }));
  k.cyl(x0 + 2.4, 0.78, 0.1, 0.2, 0.9, M.black, { axis: 'z', seg: 12 });
  k.cyl(x1 - 2.0, 0.78, 0.1, 0.2, 0.9, M.black, { axis: 'z', seg: 12 });
  if (r() < 0.6) k.box(x1 - 1.5, 0.5, 0.2, x1 - 0.2, 0.98, 1.05, mat({ c: '#4a4c50', c2: '#3a3c40', pat: 'bars', s: 0.08 }));
  k.cyl(x0, 0.95, -0.2, 0.03, x1 - x0, M.steel, { axis: 'x', seg: 6 }); // brake pipe
}

// ------------------------------------------------------------------ build all
export function buildCars(k, S) {
  const r = k.rng('cars');
  S.windows = [];
  S.seats = {};
  S.stations = {};
  S.steam = [];
  // Interiors first (they register their windows), then the shells.
  for (const b of BODIES) {
    for (const zone of b.zones) {
      if (zone.kind === 'third') third(k, zone, S, r);
      else if (zone.kind === 'first') first(k, zone, S, r);
      else if (zone.kind === 'kitchen') kitchen(k, zone, S, r);
      else if (zone.kind === 'vest') vestibule(k, zone, S);
      else if (zone.kind === 'lav') lavatory(k, zone, S);
      else if (zone.kind === 'guard') guardVan(k, zone, S, r, zone.z === 'Z18');
      else if (zone.kind === 'obsEnd') obsEnd(k, zone, S);
      else if (zone.kind === 'obs') obsSaloon(k, zone, S);
    }
  }
  for (const b of BODIES) { shell(k, b, S); underGear(k, b, r); }
  tail(k, S);
  for (let i = 1; i < B.length - 1; i++) gangway(k, B[i] - 0.16, B[i] + 0.16);
  gangway(k, B[0] - 0.02, B[0] + 0.16);
  for (const cx of BOGIES) bogie(k, cx);
  // Axle-driven generators: belt-driven dynamos hung near four bogies.
  S.dynamos = [];
  for (const bc of [24.4, 59.35, 94.35, 129.35]) {
    k.box(bc + 1.95, 0.6, 0.15, bc + 2.75, 0.98, 0.65, mat({ c: '#4a4c3e', c2: '#3a3c30', pat: 'rings', s: 0.06 }));
    S.dynamos.push(bc);
  }
}

// Coach wheels (far side): plain disc wheels, static, drawn into the main batch to keep draw calls
// down (a turning plain disc looks the same). The dynamo pulleys are static too.
export function carParts(k, S) {
  const wm = mat({ c: '#3a3634', cut: '#2a2422' }), tm = mat({ c: '#a8acb0', cut: '#5a5e62' });
  for (const cx of BOGIES) for (const s of [-1, 1]) {
    const x = cx + s * 1.295;
    k.cyl(x, COACH_WHEEL_R, 0.66, COACH_WHEEL_R, 0.12, tm, { axis: 'z', seg: 18 });
    k.cyl(x, COACH_WHEEL_R, 0.645, COACH_WHEEL_R - 0.06, 0.02, wm, { axis: 'z', seg: 18 });
    k.cyl(x, COACH_WHEEL_R, 0.62, 0.1, 0.04, mat({ c: '#c8ccd0' }), { axis: 'z', seg: 10 });
  }
  for (const bc of S.dynamos) {
    k.cyl(bc + 1.85, 0.8, 0.35, 0.14, 0.1, mat({ c: '#6a6a6c' }), { axis: 'z', seg: 12 });
    k.beam([bc + 1.85, 0.94, 0.35], [bc + 1.295, COACH_WHEEL_R + 0.12, 0.35], 0.03, mat({ c: '#2a2422' }));
    k.beam([bc + 1.85, 0.66, 0.35], [bc + 1.295, COACH_WHEEL_R - 0.12, 0.35], 0.03, mat({ c: '#2a2422' }));
  }
  S.carWheels = [];
  S.pulleys = [];
}
void THREE; void hbox;
