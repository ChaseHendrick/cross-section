/* Warship scene: guns, messes, galley, capstans, pumps, hold, orlop, cabins, boats,
 * lanterns and the small furniture of a ship of the line. Positions are layout
 * estimates built on the dossier's zone table (docs/research/warship.md, section 3).
 */
import { mat, props, shade } from '../../engine/index.js';
import { Y, DT, BEAM, MAST, PORTS, innerZ, halfB, bottomInner, sternX, clamp } from './geom.js';
import { HATCH, sideAng, anchor } from './hull.js';
import { cylBetween } from './rig.js';

const m = (c, extra) => mat(Object.assign({ c }, extra || {}));
const OAK = m('#7a5634', { cut: '#a07848' });
const OAKL = m('#a07a4e', { pat: 'grain', cut: '#b88a58' });
const IRON = m('#2c2a28', { cut: '#3a3634' });
const GUNM = m('#262626', { cut: '#4a4644' });
const CARR = m('#8a4a32', { cut: '#a86a4a' }); // red-brown carriages [illustrative]
const HEMP = m('#9a7a4a', { cut: '#8a6a3a' });
const HEMPW = m('#6a5232', { cut: '#5a4228' });
const CASK = m('#8a6238', { pat: 'grain', c2: '#6a4a2a', cut: '#b08050' });
const CASKD = m('#6a4a2c', { pat: 'grain', c2: '#4a3220', cut: '#a07040' });
const HOOP = m('#3a3632');
const BRASS = m('#c8a050');
const COPPER = m('#c07c52', { cut: '#c07c52' });
const LINEN = m('#ece6d6', { pat: 'canvas', s: 0.2 });
const deckTop = { lower: Y.lower, middle: Y.middle, upper: Y.upper, qd: Y.qd, fc: Y.fc };
const ceilOf = (y) => (y < Y.orlop ? Y.orlop : y < Y.lower ? Y.lower : y < Y.middle ? Y.middle : y < Y.upper ? Y.upper : y < Y.fc ? Y.fc : Y.poop) - DT - BEAM;

// ------------------------------------------------------------------ small pieces
export function cask(k, x, y, z, r = 0.38, l = 1.0, mm = CASK) {
  k.cyl(x - l / 2, y + r, z + r, r * 0.88, l, mm, { axis: 'x', seg: 10 });
  k.cyl(x - l * 0.08, y + r, z + r, r * 0.92, l * 0.16, mm, { axis: 'x', seg: 10 });
  for (const t of [0.12, 0.84]) k.cyl(x - l / 2 + l * t, y + r, z + r, r * 0.91, 0.04, HOOP, { axis: 'x', seg: 10, caps: false });
}
export function barrelUp(k, x, y, z, r = 0.25, h = 0.62, mm = CASK) {
  k.lathe([[r * 0.86, y], [r, y + h * 0.5], [r * 0.86, y + h]], x, z + r, mm, { seg: 9 });
  k.lathe([[r * 0.93, y + h * 0.15], [r * 0.95, y + h * 0.2]], x, z + r, HOOP, { seg: 9, capTop: false, capBot: false });
}
function tub(k, x, y, z, r = 0.2, h = 0.22, c = '#8a6a42') {
  k.lathe([[r * 0.85, y], [r, y + h]], x, z, m(c), { seg: 8, capTop: false });
  k.cyl(x, y + h * 0.6, z, r * 0.9, 0.01, m('#c8b490'), { seg: 8 });
}
function coilFlat(k, x, y, z, r, h, mm = HEMP) {
  k.lathe([[r * 0.35, y], [r, y], [r, y + h], [r * 0.35, y + h]], x, z, mm, { seg: 14, capTop: false, capBot: false });
  k.cyl(x, y + h - 0.02, z, r, 0.02, mat({ c: '#8a6a3a', c2: '#6a4a2a', pat: 'rings', s: 0.09 }), { seg: 14, capBot: false });
}
function shotPile(k, x, y, z, n = 3, r = 0.08) {
  for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) k.sphere(x + (j - (n - i - 1) / 2) * r * 2.05, y + r + i * r * 1.65, z, r, IRON, { seg: 6, rings: 4 });
}
function lantern(k, x, yCeil, z, o = {}) {
  return props.lamp(k, x, yCeil, z, Object.assign({ kind: 'lantern', drop: 0.3, r: 5.2, i: 1.0, light: '#ffc878', flicker: true, halo: 0.5 }, o));
}
// A cot (a framed canvas bed slung from the beams).
function cot(k, x, yCeil, z, len = 1.85, wid = 0.75, hang = 0.55, c = '#e6dcc4') {
  const y = yCeil - hang;
  k.box(x - len / 2, y - 0.3, z, x + len / 2, y, z + wid, m(c, { pat: 'canvas', s: 0.3 }));
  k.box(x - len / 2 + 0.05, y - 0.02, z + 0.05, x + len / 2 - 0.05, y + 0.06, z + wid - 0.05, m('#c8c0ac'));
  for (const xx of [x - len / 2 + 0.05, x + len / 2 - 0.05]) for (const zz of [z + 0.05, z + wid - 0.05]) k.cyl(xx, y, zz, 0.008, hang, m('#8a7050'), { seg: 3 });
  return { feet: [x + len / 2 - 0.2, y, z + wid / 2], heading: 0 };
}
// A bench along x (for messes and cabins).
function benchX(k, x0, x1, y, z, d = 0.3, h = 0.42) {
  k.box(x0, y + h - 0.05, z, x1, y + h, z + d, OAKL);
  for (const xx of [x0 + 0.08, x1 - 0.12]) k.box(xx, y, z + 0.04, xx + 0.04, y + h - 0.05, z + d - 0.04, OAK);
}
// A bench along z.
function benchZ(k, x, y, z0, z1, d = 0.3, h = 0.42) {
  k.box(x - d / 2, y + h - 0.05, z0, x + d / 2, y + h, z1, OAKL);
  for (const zz of [z0 + 0.08, z1 - 0.12]) k.box(x - d / 2 + 0.04, y, zz, x + d / 2 - 0.04, y + h - 0.05, zz + 0.04, OAK);
}

// ------------------------------------------------------------------ guns
// A gun on its carriage, breech towards the viewer, muzzle in the port.
export function gun(k, x, yd, P, kind) {
  const s = kind === '32' ? 1 : kind === '24' ? 0.93 : 0.78;
  const ax = yd + P.sill + P.h / 2 - 0.04;
  const zi = innerZ(x, ax);
  const a = sideAng(x, ax);
  const L = (kind === '32' ? 2.9 : kind === '24' ? 2.75 : 2.3);
  const zm = zi + 0.32, zb = zm - L;
  const r0 = 0.3 * s, r1 = 0.2 * s;
  // Barrel: breech reinforce, chase, muzzle swell, cascabel.
  const rot = (px, pz) => { const dz = pz - zi; return [x - Math.sin(a) * dz + (px - x) * Math.cos(a), x === px ? 0 : 0, zi + Math.cos(a) * dz + (px - x) * Math.sin(a)]; };
  void rot;
  k.cyl(x, ax, zb, r0, L * 0.38, GUNM, { axis: 'z', r2: r0 * 0.92, seg: 12 });
  k.cyl(x, ax, zb + L * 0.38, r0 * 0.86, L * 0.62, GUNM, { axis: 'z', r2: r1, seg: 12 });
  k.cyl(x, ax, zm - 0.12, r1 * 1.18, 0.12, GUNM, { axis: 'z', seg: 12 });
  k.cyl(x, ax, zb - 0.1, r0 * 0.55, 0.1, GUNM, { axis: 'z', seg: 8 });
  k.sphere(x, ax, zb - 0.17, 0.09 * s + 0.02, GUNM, { seg: 8, rings: 5 });
  // Carriage: two stepped cheeks, transoms, axletrees and four trucks.
  const zc0 = zb + 0.15, zc1 = zi - 0.12;
  for (const sx of [-1, 1]) {
    const cx = x + sx * (r0 + 0.07);
    k.box(cx - 0.065, yd + 0.17, zc0 + (zc1 - zc0) * 0.45, cx + 0.065, ax + 0.05, zc1, CARR);
    k.box(cx - 0.065, yd + 0.17, zc0, cx + 0.065, ax - 0.18, zc0 + (zc1 - zc0) * 0.45, CARR);
    for (const [zz, rr] of [[zc1 - 0.22, 0.2 * s + 0.02], [zc0 + 0.25, 0.18 * s + 0.02]]) k.cyl(x + sx * (r0 + 0.2), yd + rr, zz, rr, 0.09, m('#6a4426'), { axis: 'x', seg: 9 });
  }
  for (const zz of [zc1 - 0.22, zc0 + 0.25]) k.box(x - r0 - 0.24, yd + 0.13, zz - 0.07, x + r0 + 0.24, yd + 0.27, zz + 0.07, CARR);
  k.box(x - r0 - 0.07, yd + 0.17, zc0 + 0.05, x + r0 + 0.07, yd + 0.4, zc0 + 0.6, CARR); // bed and quoin
  k.boxR(x, ax - r0 - 0.08, zb + 0.55, 0.22, 0.12, 0.5, OAKL, { x: 0.15 });
  // Breeching rope round the cascabel to ring bolts in the side; gun tackles.
  k.tube([[x - 0.85, ax + 0.05, zi + 0.02], [x - 0.35, ax - 0.02, zb + 0.2], [x - 0.12, ax, zb - 0.24], [x + 0.12, ax, zb - 0.24], [x + 0.35, ax - 0.02, zb + 0.2], [x + 0.85, ax + 0.05, zi + 0.02]], 0.035, HEMP, { seg: 4 });
  for (const sx of [-1, 1]) k.rope([x + sx * 0.75, ax - 0.25, zi - 0.02], [x + sx * (r0 + 0.12), yd + 0.4, zc1 - 0.4], 0.018, HEMP, 0.04, 4);
  return { x, y: yd, zb, zi, ax };
}
export function carronade(k, x, yd, P) {
  const ax = yd + P.sill + P.h / 2;
  const zi = innerZ(x, ax);
  k.box(x - 0.3, yd, zi - 2.1, x + 0.3, yd + 0.55, zi - 0.1, CARR); // slide
  k.box(x - 0.36, yd + 0.55, zi - 1.6, x + 0.36, yd + 0.72, zi - 0.6, CARR);
  k.cyl(x, ax, zi - 1.3, 0.34, 1.0, GUNM, { axis: 'z', r2: 0.28, seg: 12 });
  k.cyl(x, ax, zi - 0.3, 0.3, 0.35, GUNM, { axis: 'z', r2: 0.32, seg: 12 });
  k.sphere(x, ax, zi - 1.32, 0.3, GUNM, { seg: 10, rings: 6 });
  k.cyl(x, ax - 0.33, zi - 1.0, 0.1, 0.2, GUNM, { axis: 'z', seg: 6 });
}

export const DRILL = [PORTS.middle.xs[4], PORTS.middle.xs[5]];
export function buildGuns(k) {
  const guns = { lower: [], middle: [], upper: [], qd: [] };
  for (const x of PORTS.lower.xs) guns.lower.push(gun(k, x, Y.lower, PORTS.lower, '32'));
  for (const x of PORTS.middle.xs) if (!DRILL.includes(x)) guns.middle.push(gun(k, x, Y.middle, PORTS.middle, '24'));
  for (const x of PORTS.upper.xs) guns.upper.push(gun(k, x, Y.upper, PORTS.upper, '12'));
  for (const x of PORTS.qd.xs) guns.qd.push(gun(k, x, Y.qd, PORTS.qd, '12'));
  carronade(k, PORTS.fc.xs[0], Y.fc, PORTS.fc);
  gun(k, PORTS.fc.xs[1], Y.fc, PORTS.fc, '12');
  // Shot garlands (racks of round shot) along the side between some ports.
  for (const [P, yd] of [[PORTS.lower, Y.lower], [PORTS.middle, Y.middle]]) {
    for (let i = 1; i < P.xs.length - 1; i += 2) {
      const x = (P.xs[i] + P.xs[i + 1]) / 2 + 0.6, zi = innerZ(x, yd + 0.4);
      k.box(x - 0.45, yd + 0.25, zi - 0.32, x + 0.45, yd + 0.33, zi, OAK);
      for (let j = 0; j < 5; j++) k.sphere(x - 0.36 + j * 0.18, yd + 0.41, zi - 0.16, 0.08, IRON, { seg: 6, rings: 4 });
    }
  }
  return guns;
}

// ------------------------------------------------------------------ messes between the guns
export const MESS = [];
function messTable(k, x, yd, deck) {
  const zi = innerZ(x, yd + 0.8);
  const z0 = zi - 2.15, z1 = zi - 0.55;
  const ty = yd + 0.72;
  k.box(x - 0.28, ty - 0.05, z0, x + 0.28, ty, z1, OAKL);
  k.rope([x, ceilOf(yd + 0.5), z0 + 0.1], [x, ty, z0 + 0.1], 0.012, HEMP, 0, 2);
  k.box(x - 0.04, yd, z0 + 0.1, x + 0.04, ty - 0.05, z0 + 0.18, OAK);
  benchZ(k, x - 0.62, yd, z0 + 0.05, z1, 0.28);
  benchZ(k, x + 0.62, yd, z0 + 0.05, z1, 0.28);
  // Mess gear: kids (small tubs), bread bags, mugs.
  tub(k, x, ty, z0 + 0.45, 0.13, 0.12, '#7a5a36');
  for (const zz of [z0 + 0.9, z0 + 1.3]) k.cyl(x - 0.1, ty, zz, 0.035, 0.08, m('#9a8a70'), { seg: 6 });
  k.box(x + 0.05, ty, z1 - 0.3, x + 0.2, ty + 0.1, z1 - 0.1, m('#b8a888', { pat: 'canvas' }));
  // A shelf for mess kits on the side.
  k.box(x - 0.45, yd + 1.25, zi - 0.32, x + 0.45, yd + 1.29, zi, OAK);
  for (let i = 0; i < 4; i++) k.cyl(x - 0.33 + i * 0.22, yd + 1.29, zi - 0.16, 0.07, 0.1, m(i % 2 ? '#8a6a42' : '#b8a888'), { seg: 6 });
  const seats = [];
  for (const zz of [z0 + 0.3, z0 + 0.7, z0 + 1.1, z0 + 1.5]) { seats.push({ x: x - 0.62, y: yd, z: zz, face: 1 }); seats.push({ x: x + 0.62, y: yd, z: zz, face: -1 }); }
  MESS.push({ deck, x, y: yd, seats, table: [x, ty, (z0 + z1) / 2] });
}
// Gear about the gun decks: rammers and sponges racked under the beams over each gun,
// fire buckets, mess bags hung from the beams, belaying rails with coiled falls.
export function buildGear(k) {
  const pole = m('#a88458'), head = m('#5a4a3a'), bag = m('#c8b48a', { pat: 'canvas', s: 0.15 });
  for (const [P, yd] of [[PORTS.lower, Y.lower], [PORTS.middle, Y.middle], [PORTS.upper, Y.upper]]) {
    const yc = ceilOf(yd + 0.5) - 0.06;
    for (const x of P.xs) {
      if (yd === Y.upper && x > 13 && x < 34) continue; // the waist is open to the sky
      const zi = innerZ(x, yc);
      for (const dx of [-0.18, 0.18]) {
        k.cyl(x + dx, yc - 0.05, zi - 3.6, 0.025, 3.3, pole, { axis: 'z', seg: 5 });
        k.cyl(x + dx, yc - 0.05, zi - 3.75, dx < 0 ? 0.09 : 0.07, 0.18, dx < 0 ? head : m('#c8b48a'), { axis: 'z', seg: 7 });
      }
      for (const dz of [1.0, 2.6]) k.box(x - 0.3, yc - 0.04, zi - dz - 0.05, x + 0.3, yc, zi - dz + 0.05, m('#6a4a2c'));
    }
  }
  for (const T of MESS) {
    const yc = ceilOf(T.y + 0.5);
    for (const dz of [-0.4, 0.3]) {
      const z = T.table[2] + dz;
      k.rope([T.x + 0.1, yc, z], [T.x + 0.1, yc - 0.35, z], 0.01, HEMP, 0, 2);
      k.sphere(T.x + 0.1, yc - 0.5, z, 0.14, bag, { seg: 7, rings: 5 });
    }
  }
  // Fire buckets along the waist bulwarks and on the quarterdeck.
  for (let x = 14.5; x < 47; x += 2.4) {
    if (x > 33.5 && x < 34.6) continue;
    const yb = x < 34 ? Y.fc : Y.qd;
    const z = innerZ(x, yb + 0.8) - 0.18;
    k.lathe([[0.1, yb + 0.85], [0.13, yb + 1.15]], x, z, m('#2a2420', { cut: '#2a2420' }), { seg: 7, capTop: false });
    k.box(x - 0.15, yb + 1.17, z - 0.02, x + 0.15, yb + 1.2, z + 0.02, m('#c8a050'));
  }
  // Fife rails round the masts with belaying pins and coiled falls.
  for (const [mx, yd] of [[MAST.fore, Y.fc], [MAST.main, Y.upper], [MAST.mizzen, Y.qd]]) {
    k.box(mx - 1.1, yd + 0.75, -0.3, mx - 0.95, yd + 0.85, 1.2, OAK);
    k.box(mx + 0.95, yd + 0.75, -0.3, mx + 1.1, yd + 0.85, 1.2, OAK);
    k.box(mx - 1.1, yd + 0.75, 1.05, mx + 1.1, yd + 0.85, 1.2, OAK);
    for (const [px, pz] of [[mx - 1.03, 0.6], [mx + 1.03, 0.6], [mx - 0.5, 1.12], [mx + 0.5, 1.12]]) { k.box(px - 0.04, yd, pz - 0.04, px + 0.04, yd + 0.85, pz + 0.04, OAK); }
    for (let i = 0; i < 6; i++) { const px = mx - 0.9 + i * 0.36; k.cyl(px, yd + 0.62, 1.12, 0.022, 0.38, m('#8a6a42'), { seg: 4 }); k.lathe([[0.04, yd + 0.4], [0.16, yd + 0.35], [0.16, yd + 0.55], [0.04, yd + 0.6]], px, 1.25, HEMP, { seg: 8, capTop: false, capBot: false }); }
  }
  // Oars in the boats on the booms.
  for (let i = 0; i < 5; i++) k.cyl(17.2, Y.fc + 0.75 + i * 0.05, 0.2 + i * 0.22, 0.03, 8.5, m('#d8c8a0'), { axis: 'x', seg: 4 });
}

export function buildMesses(k) {
  const L = PORTS.lower.xs, Md = PORTS.middle.xs;
  for (let i = 0; i < L.length - 1; i++) {
    const x = (L[i] + L[i + 1]) / 2;
    if (x < 8 || x > 47 || Math.abs(x - MAST.main) < 2.2) continue;
    messTable(k, x, Y.lower, 'lower');
  }
  for (let i = 0; i < Md.length - 1; i++) {
    const x = (Md[i] + Md[i + 1]) / 2;
    if ((x > 9 && x < 14.2) || x > 42.5 || Math.abs(x - MAST.main) < 2.2) continue;
    messTable(k, x, Y.middle, 'middle');
  }
}

// ------------------------------------------------------------------ hammocks (slung at night)
export function buildHammocks(k) {
  const anchors = { lower: [], middle: [], gunroom: [] };
  const part = k.part(0, 0, 0, (q) => {
    for (const [deck, yd, x0, x1] of [['lower', Y.lower, 6.2, 47.2], ['middle', Y.middle, 14.6, 42.6]]) {
      const yh = ceilOf(yd + 0.5) + 0.02;
      const hatches = HATCH[deck];
      let col = 0;
      for (let x = x0; x < x1; x += 2.05, col++) {
        if (hatches.some((h) => x + 1 > h[0] - 0.1 && x - 1 < h[1] + 0.1)) continue;
        if ([MAST.fore, MAST.main, MAST.mizzen].some((mx) => Math.abs(x - mx) < 1.1)) continue;
        for (let r = 0; r < 10; r++) {
          const z = 0.32 + r * 0.56 + (col % 2) * 0.12;
          if (z + 0.5 > innerZ(x, yh - 0.3) - 0.4) break;
          const a = props.hammock(q, x, yh, z, { w: 1.75, sag: 0.36, d: 0.5, color: r % 3 === 0 ? '#e8dcc0' : r % 3 === 1 ? '#ddd0b0' : '#efe4cc' });
          anchors[deck].push(a);
        }
      }
    }
    for (const [x, z] of [[50.2, 1.6], [51.4, 2.6], [52.6, 1.5], [53.8, 2.7]]) anchors.gunroom.push(props.hammock(q, x, ceilOf(Y.lower + 0.5) + 0.02, z, { w: 1.6, sag: 0.28, d: 0.42 }));
  });
  return { part, anchors };
}
// Lashed hammocks stowed in the nettings along the rails by day.
export function buildNettings(k) {
  return k.part(0, 0, 0, (q) => {
    const hm = mat({ c: '#d8ccae', c2: '#b8aa88', pat: 'canvas', s: 0.12 });
    const run = (x0, x1, y) => {
      for (let x = x0; x < x1; x += 0.36) {
        const z = halfB(x, y) - 0.38;
        q.cyl(x, y, z, 0.17, 0.75, hm, { seg: 6 });
      }
    };
    run(0.6, 12.6, 16.35); run(13.2, 33.8, 16.35); run(34.4, 47.4, 16.35);
  });
}

// ------------------------------------------------------------------ lanterns throughout the ship
export function buildLanterns(k) {
  const L = [];
  const add = (x, y, z, o) => L.push(lantern(k, x, y, z, o));
  for (const x of [4.6, 9.4, 13.4, 17.6, 21.6, 25.6, 29.4, 33.2, 36.4, 41.6, 45.6]) add(x, ceilOf(Y.lower + 0.5), 2.4 + (Math.round(x) % 2) * 0.5, { r: 6.0, i: 1.1 });
  add(50.8, ceilOf(Y.lower + 0.5), 2.2, { r: 4.5 }); add(54.4, ceilOf(Y.lower + 0.5), 2.0, { r: 4.0 });
  for (const x of [2.4, 6.4, 16.2, 21.0, 25.2, 29.2, 33.0, 36.0, 40.0]) add(x, ceilOf(Y.middle + 0.5), 2.4 + (Math.round(x) % 2) * 0.5, { r: 6.0, i: 1.1 });
  add(45.4, ceilOf(Y.middle + 0.5), 3.0, { r: 3.6 }); add(48.6, ceilOf(Y.middle + 0.5), 3.0, { r: 3.6 });
  // Orlop: one lantern per working compartment (the magazine passage lantern kept well back).
  for (const [x, z] of [[5.6, 1.6], [10.0, 1.8], [12.6, 0.8], [20.5, 1.6], [28.0, 1.6], [32.2, 1.5], [37.0, 1.6], [39.8, 2.6], [42.6, 1.6], [45.8, 1.6]]) add(x, ceilOf(Y.orlop + 0.5), z, { r: 3.6, i: 0.75 });
  // Hold: the steward's lantern in the after hold.
  add(41.0, Y.orlop - DT - BEAM, 1.4, { r: 3.4, i: 0.6 });
  // Upper deck under the forecastle and quarterdeck.
  for (const x of [1.6, 4.8, 9.8, 37.4, 41.2]) add(x, ceilOf(Y.upper + 0.5), 2.4, { r: 4.6 });
  return L;
}

// ------------------------------------------------------------------ the hold
export function buildHold(k) {
  const floorF = 2.55; // top of the shingle bed
  // H1 forepeak: coal and wood for the galley.
  for (let i = 0; i < 9; i++) k.boulder(4.6 + (i % 3) * 0.9, bottomInner(5.5) + 0.2 + Math.floor(i / 3) * 0.25, 0.7 + (i % 4) * 0.5, 0.6, 0.35, 0.5, m('#2a2828', { pat: 'speckle', c2: '#3a3634' }), i + 3);
  // H2 grand magazine: copper-lined; platform floor, racks of powder barrels, filling room and light room.
  k.box(7.6, 2.9, -0.3, 14.4, 3.05, innerZ(11, 3.0) + 0.05, m('#b87c56', { pat: 'plates', s: 0.6, cut: '#9a6440' }));
  for (let i = 0; i < 6; i++) for (let t = 0; t < 2; t++) for (let r = 0; r < 4; r++) {
    const x = 8.1 + i * 0.58, z = 1.2 + r * 0.6;
    if (z > innerZ(x, 3.2 + t * 0.7) - 0.6) continue;
    barrelUp(k, x, 3.05 + t * 0.68, z, 0.24, 0.6, m('#c8a878', { pat: 'grain', c2: '#a88858' }));
  }
  // Filling room bench with cartridges.
  k.box(11.9, 3.05, 1.0, 13.0, 3.85, 2.0, OAKL);
  for (let i = 0; i < 5; i++) k.cyl(12.0 + i * 0.2, 3.85, 1.4, 0.07, 0.25, m('#e8dcc0', { pat: 'canvas' }), { seg: 7 });
  // Light room: a lantern behind glass, the only light allowed near the powder.
  k.box(13.4, 3.05, 0.2, 14.4, 5.4, 0.3, m('#5a3e28'));
  k.box(13.4, 3.05, 0.3, 13.5, 5.4, 1.6, m('#5a3e28'));
  k.glass([[13.38, 3.6, 0.35], [13.38, 3.6, 1.5], [13.38, 5.0, 1.5], [13.38, 5.0, 0.35]], { c: '#e8d090', alpha: 0.3 });
  k.lamp(13.95, 4.4, 0.9, { r: 3.2, i: 0.8, color: '#ffc070', halo: 0.5, flicker: true });

  // H3 fore hold: water and beer casks bedded in shingle [S35].
  const caskRows = (x0, x1, yb, r, l, tiers, mm) => {
    for (let t = 0; t < tiers; t++) for (let x = x0 + l / 2; x < x1 - l / 2; x += l + 0.08) {
      for (let z = 1.3; ; z += 2 * r + 0.05) {
        const yy = yb + t * (2 * r - 0.06);
        if (z + 2 * r > innerZ(x, yy + r) - 0.15) break;
        cask(k, x, yy, z, r, l, (Math.floor(x * 3) + t) % 3 ? mm : CASKD);
      }
    }
  };
  caskRows(15.0, 22.6, floorF, 0.4, 1.05, 3, CASK);
  // H4 main hold: leaguers, the largest casks aboard [S8]; the pump well round the mainmast; shot lockers.
  caskRows(23.2, 28.8, floorF, 0.56, 1.45, 2, CASK);
  caskRows(32.2, 35.8, floorF, 0.56, 1.45, 2, CASK);
  const well = m('#7a5a3a', { pat: 'planks', s: 0.22, cut: '#a07848' });
  k.box(29.2, floorF, -0.3, 29.32, Y.orlop - DT, 1.9, well);
  k.box(31.68, floorF, -0.3, 31.8, Y.orlop - DT, 1.9, well);
  k.box(29.2, floorF, 1.78, 31.8, Y.orlop - DT, 1.9, well);
  for (const x of [29.6, 31.4]) k.cyl(x, Y.hold + 0.4, 1.3, 0.16, Y.lower + 0.6 - Y.hold, m('#6a4a2c', { cut: '#8a6a3a' }), { seg: 8 });
  // Shot locker (black iron shot).
  k.box(28.0, floorF, 2.0, 29.1, floorF + 0.9, 3.4, m('#6a4a2c', { pat: 'planks', s: 0.2 }));
  shotPile(k, 28.55, floorF + 0.9, 2.7, 4, 0.08);
  // H5 after hold: salt beef and pork in brine, flour, pease and oatmeal; the spirit room aft.
  caskRows(36.3, 41.6, floorF, 0.38, 0.95, 3, CASKD);
  for (let i = 0; i < 10; i++) props.sack(k, 36.6 + (i % 5) * 0.55, floorF + Math.floor(i / 5) * 0.45, 3.3 + (i % 2) * 0.4, { color: i % 3 ? '#cdb88a' : '#b8a070', w: 0.55 });
  k.box(42.0, floorF, -0.3, 42.12, Y.orlop - DT, 2.6, m('#6a4a2c', { pat: 'planks', s: 0.22, cut: '#a07848' })); // spirit room bulkhead
  caskRows(42.3, 45.8, floorF, 0.3, 0.75, 3, CASKD);
  // H6 run: small casks and firewood where the hull narrows.
  for (let i = 0; i < 6; i++) cask(k, 46.8 + i * 0.75, 3.0 + (i % 2) * 0.1, 0.4, 0.26, 0.6, CASKD);
  for (let i = 0; i < 8; i++) k.cyl(47.0 + (i % 4) * 0.25, 3.6 + Math.floor(i / 4) * 0.14, 1.4, 0.07, 1.0, m('#8a6a42'), { axis: 'z', seg: 6 });
}

// ------------------------------------------------------------------ the orlop
export function buildOrlop(k) {
  const y = Y.orlop, yc = ceilOf(y + 0.5);
  // O1 boatswain's and gunner's stores: coils, blocks, wads, sponges.
  for (const [x, z, r] of [[4.6, 0.6, 0.55], [5.9, 0.7, 0.5], [6.7, 1.6, 0.45]]) coilFlat(k, x, y, z, r, 0.35);
  for (let i = 0; i < 6; i++) k.box(4.2 + i * 0.5, yc - 0.55, 2.4, 4.45 + i * 0.5, yc - 0.25, 2.55, OAK); // blocks hung up
  barrelUp(k, 7.2, y, 2.2, 0.26, 0.7, m('#2a2624'));
  // O2 carpenter's cabin and store: bench, cot, shot plugs, oakum, sheet lead.
  props.table(k, 9.6, y, 2.4, { w: 1.6, d: 0.6, h: 0.82, items: false, top: '#9a7448' });
  for (let i = 0; i < 6; i++) k.cyl(9.0 + i * 0.22, y + 0.82, 2.65, 0.05, 0.12, m('#b89060'), { r2: 0.08, seg: 6 });
  k.box(10.8, y + 0.82, 2.5, 11.3, y + 0.95, 2.9, m('#8a8e94')); // sheet lead
  cot(k, 10.2, yc, 0.4, 1.8, 0.7, 0.45, '#d8ccb0');
  props.shelves(k, 9.0, y, innerZ(9.0, y + 1) - 0.45, { w: 1.0, h: 1.2, n: 3, items: 'mixed', d: 0.3 });
  // O3 magazine passage: scuttle to the magazine, wet woollen screens [illustrative].
  props.ladder(k, 12.9, 3.05, y + 0.1, 0.75, { w: 0.42, color: '#8a6a42' });
  k.box(13.9, y, 0.2, 13.95, yc, 2.2, m('#8a8a84', { pat: 'canvas', s: 0.15 }));
  // O4 cable tiers: six cables 24 inches round, 600 feet long [S36].
  for (const [x, z, r, h] of [[17.0, 2.6, 1.65, 0.85], [20.5, 2.6, 1.65, 0.95], [24.0, 2.9, 1.0, 0.6]]) coilFlat(k, x, y, z, r, h, HEMPW);
  // O5 sail rooms: spare sails on platforms.
  k.box(26.2, y + 0.4, 0.2, 29.3, y + 0.5, 3.6, OAK);
  for (let i = 0; i < 5; i++) k.box(26.4 + (i % 3) * 0.95, y + 0.5 + Math.floor(i / 3) * 0.4, 0.5 + (i % 2) * 1.4, 27.2 + (i % 3) * 0.95, y + 0.88 + Math.floor(i / 3) * 0.4, 1.7 + (i % 2) * 1.4, m('#e6dcc0', { pat: 'canvas', s: 0.25 }));
  // O6 the well and slop room: pump casings; purser's slops in bales [S21].
  for (let i = 0; i < 6; i++) k.box(32.6 + (i % 3) * 0.7, y + Math.floor(i / 3) * 0.45, 2.4, 33.2 + (i % 3) * 0.7, y + 0.42 + Math.floor(i / 3) * 0.45, 3.1, m(i % 2 ? '#3a4a6a' : '#d8d0bc', { pat: 'canvas' }));
  props.shelves(k, 34.2, y, innerZ(34.2, y + 1) - 0.4, { w: 1.1, h: 1.4, n: 3, items: 'mixed', d: 0.3 });
  // O7 the cockpit: the midshipmen's berth; table, sea chests, lantern.
  props.table(k, 37.8, y, 1.4, { w: 2.2, d: 0.8, h: 0.72, items: 'plate', top: '#7a5434' });
  for (const [x, z] of [[36.2, 2.8], [37.2, 2.9], [38.3, 2.85], [39.4, 2.9], [40.2, 1.0]]) props.chest(k, x, y, z, { w: 0.75, h: 0.42, d: 0.45, color: '#5a3a24' });
  benchX(k, 36.8, 38.8, y, 0.75, 0.3, 0.4);
  for (const [x, z] of [[37.6, 3.1], [38.8, 1.2], [36.2, 3.1], [42.0, 2.7]]) props.hammock(k, x, yc + 0.02, z, { w: 1.75, sag: 0.3, d: 0.44 });
  // O8 surgeon's cabin and dispensary: jars, pewter, a lockable drug store [S57].
  props.shelves(k, 42.5, y, innerZ(42.5, y + 1) - 0.42, { w: 1.6, h: 1.5, n: 4, items: 'jars', d: 0.32 });
  props.table(k, 42.6, y, 1.5, { w: 1.2, d: 0.6, h: 0.78, items: 'bottle', top: '#8a6a42' });
  props.chest(k, 41.8, y, 2.6, { w: 0.6, h: 0.45, color: '#3a2a20' });
  // O9 purser's and officers' stores.
  props.desk(k, 45.0, y, 1.6, { w: 1.1 });
  props.shelves(k, 46.2, y, innerZ(46.2, y + 1) - 0.42, { w: 1.4, h: 1.5, n: 3, items: 'bottles', d: 0.32 });
  for (let i = 0; i < 3; i++) barrelUp(k, 44.4 + i * 0.6, y, 3.0, 0.24, 0.6);
  // O10 hanging magazine (copper).
  k.box(47.6, y, 0.4, 50.4, y + 1.5, 3.2, m('#c07c52', { pat: 'plates', s: 0.45, cut: '#a8663e' }));
  // O11 bread room: bins of biscuit.
  for (let i = 0; i < 3; i++) k.box(50.7 + i * 0.75, y, 0.3, 51.35 + i * 0.75, y + 0.9, 1.6, m('#a88a5a', { pat: 'planks', s: 0.15 }));
  for (let i = 0; i < 3; i++) k.box(50.75 + i * 0.75, y + 0.9, 0.35, 51.3 + i * 0.75, y + 0.95, 1.55, m('#d8b878', { pat: 'speckle', c2: '#b8945a', s: 0.05 }));
  for (let i = 0; i < 4; i++) props.sack(k, 50.9 + i * 0.5, y, 2.1, { color: '#c8b080', w: 0.45 });
}

// ------------------------------------------------------------------ lower deck fittings
export function buildLowerDeck(k) {
  const y = Y.lower;
  // L1 the manger: a low board across the bows catching water from the hawse holes.
  k.box(3.7, y, -0.3, 3.85, y + 0.5, innerZ(3.8, y + 0.3) + 0.05, OAK);
  // L2 riding bitts securing the cables, and the cables themselves.
  for (const z of [0.9, 3.0]) k.box(5.3, y - 0.3, z - 0.22, 5.75, ceilOf(y + 0.5), z + 0.22, m('#5a3e26', { cut: '#8a6a40' }));
  k.box(5.4, y + 0.85, -0.3, 5.75, y + 1.15, 3.4, m('#5a3e26', { cut: '#8a6a40' }));
  for (const [hx, z] of [[1.4, 0.9], [2.6, 3.0]]) {
    const zh = innerZ(hx, 9.3) - 0.1;
    k.tube([[hx, 9.3, zh], [hx + 1.0, y + 0.25, zh - 0.8], [4.6, y + 0.15, z + 0.35], [5.2, y + 0.9, z + 0.35], [6.0, y + 0.95, z + 0.35], [6.9, y + 0.15, z + 0.35], [7.2, y - 0.4, z + 0.35]], 0.1, HEMPW, { seg: 6 });
  }
  // L4 jeer capstan, lower barrel; L5 the chain pumps (two of four shown, on this side) [S33].
  capstanBarrel(k, 23.5, y, ceilOf(y + 0.5));
  capstanBarrel(k, 37.5, y, ceilOf(y + 0.5));
  for (const x of [29.4, 31.6]) {
    k.box(x - 0.32, y, 2.05, x + 0.32, y + 0.95, 2.75, m('#6a4a2c', { pat: 'planks', s: 0.15, cut: '#8a6a3a' }));
    k.box(x - 0.25, y + 0.95, 2.1, x + 0.25, y + 1.1, 2.7, OAK);
  }
  // The dale: a trough carrying the water across to the side.
  const zi = innerZ(30.5, y + 0.9);
  k.box(30.25, y + 0.55, 2.75, 30.75, y + 0.7, zi, m('#5a3e26'));
  // L6 marines' berths: a rack of muskets on the after bulkhead side.
  for (let i = 0; i < 10; i++) k.box(45.0 + i * 0.12, y + 0.2, innerZ(45.5, y + 1) - 0.3, 45.03 + i * 0.12, y + 1.6, innerZ(45.5, y + 1) - 0.26, m('#4a3626'));
  k.box(44.9, y + 0.2, innerZ(45.5, y + 1) - 0.35, 46.3, y + 0.28, innerZ(45.5, y + 1) - 0.1, OAK);
  // The grog tub: "Up spirits" at 11.30 [S20].
  tub(k, 38.9, y, 2.45, 0.42, 0.62, '#7a5a36');
  for (let i = 0; i < 3; i++) k.box(38.52 + i * 0.35, y + 0.62, 2.0, 38.56 + i * 0.35, y + 0.67, 2.9, HOOP);
  // Two sea chests by the mainmast (a pair of messmates sit on them to trade).
  for (const x of [34.0, 35.0]) props.chest(k, x, y, 3.68, { w: 0.6, h: 0.42, d: 0.42, color: x > 34.5 ? '#4a3020' : '#5a3a24' });
  // L7 gunroom: gunner's lockers along the side.
  for (let x = 49.2; x < 55.5; x += 1.6) { const z = innerZ(x, y + 0.6) - 0.6; k.box(x, y, z, x + 1.4, y + 0.8, z + 0.5, m('#8a5a3a', { pat: 'panels', s: 0.35 })); }
}
function capstanBarrel(k, x, y0, y1) {
  k.lathe([[0.42, y0], [0.42, y1]], x, 0, m('#6a4426', { cut: '#9a6a3a' }), { seg: 12 });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; k.box(x + Math.cos(a) * 0.45 - 0.07, y0, Math.sin(a) * 0.45 - 0.07, x + Math.cos(a) * 0.45 + 0.07, y0 + 1.1, Math.sin(a) * 0.45 + 0.07, m('#5a3a22')); }
}

// ------------------------------------------------------------------ middle deck: galley, capstans, cabins, wardroom
export function buildMiddleDeck(k) {
  const y = Y.middle;
  // M2 the galley: the Brodie stove [S61], with two great boilers, oven and distiller.
  const sx0 = 10.0, sx1 = 13.2, sz0 = -0.9, sz1 = 1.7, sh = 1.35;
  k.box(sx0 - 0.4, y, sz0 - 0.3, sx1 + 0.4, y + 0.14, sz1 + 0.35, m('#a8503a', { pat: 'brick', s: 0.1, c2: '#8a3a2a', cut: '#a8503a', cutPat: true }));
  k.box(sx0, y + 0.14, sz0, sx1, y + sh, sz1, m('#2a2828', { pat: 'plates', s: 0.45, c2: '#3a3634', cut: '#4a4442' }));
  // Fire doors and the glowing grate (facing forward and toward us).
  k.box(sx0 - 0.03, y + 0.3, 0.15, sx0 + 0.02, y + 0.8, 0.95, m('#ff9a40', { c2: '#ffb050', glow: 'always', cut: '#ff9a40' }));
  k.box(sx0 - 0.05, y + 0.82, 0.1, sx0, y + 0.88, 1.0, IRON);
  k.box(sx0 - 0.04, y + 0.3, 1.1, sx0 + 0.02, y + 1.0, 1.6, m('#1e1c1a'));
  k.box(sx0 - 0.07, y + 0.62, 1.15, sx0 - 0.04, y + 0.68, 1.55, BRASS);
  k.box(sx1 - 0.02, y + 0.35, 0.3, sx1 + 0.04, y + 1.1, 1.4, m('#1e1c1a')); // the oven door aft
  k.lamp(sx0 - 0.35, y + 0.55, 0.6, { always: true, r: 4.5, i: 1.0, color: '#ff9040', bulb: false, halo: 0.7, flicker: true });
  // Two coppers, cut through to show the oatmeal boiling in them.
  for (const [cx, c] of [[10.85, '#d8c49a'], [12.3, '#c8b078']]) {
    k.lathe([[0.62, y + sh - 0.5], [0.66, y + sh + 0.45], [0.7, y + sh + 0.5]], cx, 0.2, COPPER, { seg: 16, capTop: false });
    k.cyl(cx, y + sh + 0.28, 0.2, 0.6, 0.02, m(c, { pat: 'speckle', c2: shade(c, -0.2) }), { seg: 16 });
    k.box(cx - 0.72, y + sh + 0.52, 0.85, cx + 0.72, y + sh + 0.58, 0.95, BRASS); // lid hinge bar
  }
  // The chimney up through the upper deck and the forecastle.
  k.box(12.6, y + sh, 0.0, 13.1, 16.5, 0.6, m('#2a2828', { cut: '#4a4442' }));
  k.box(12.5, 16.5, -0.1, 13.2, 16.75, 0.7, m('#2a2828', { cut: '#4a4442' }));
  // The cook's dresser, chopping block, water cask, firewood.
  props.shelves(k, 9.4, y, innerZ(9.4, y + 1) - 0.4, { w: 1.0, h: 1.5, n: 3, items: 'plates', d: 0.3 });
  k.cyl(14.0, y, 3.5, 0.32, 0.75, m('#8a6a42', { pat: 'grain' }), { seg: 10 });
  cask(k, 9.0, y, 3.4, 0.36, 0.9);
  for (let i = 0; i < 6; i++) k.cyl(13.6 + (i % 3) * 0.2, y + Math.floor(i / 3) * 0.15, 1.6, 0.07, 0.8, m('#8a6a42'), { axis: 'z', seg: 6 });
  for (let i = 0; i < 4; i++) k.cyl(10.4 + i * 0.6, ceilOf(y + 0.5) - 0.35, 2.3, 0.012, 0.35, IRON, { seg: 3 }); // hooks with ladles
  // M3 / M5 capstan drumheads (parts, so they can turn) are built in setup.
  // M4 main hatch gratings over the hatch on the deck above are open for light; here a ladder.
  // M6 lieutenants' cabins: light partitions with cots, guns inside the cabins [S1].
  for (const x of [45.0, 47.0, 49.0]) k.box(x - 0.03, y, 4.2, x + 0.03, ceilOf(y + 0.5), innerZ(x, y + 1) + 0.05, m('#e6dcc2', { pat: 'canvas', s: 0.4, cut: '#b8a888' }));
  for (const [x, z] of [[43.8, 4.6], [46.0, 4.5], [48.0, 4.5], [50.0, 4.6]]) cot(k, x, ceilOf(y + 0.5), z, 1.6, 0.7, 0.75, '#e2d8c0');
  for (const x of [44.0, 46.1, 48.1, 50.1]) props.chest(k, x, y, 5.8, { w: 0.6, h: 0.4, d: 0.42, color: '#4a3020' });
  props.desk(k, 46.0, y, 6.0, { w: 0.8 });
  // M7 the wardroom: long table, chairs, sideboard, stern windows [S1].
  props.rug(k, 53.8, y, 0.4, { w: 4.6, d: 3.4, color: '#2a2a2a', c2: '#e8e0cc' });
  props.table(k, 53.8, y, 1.0, { w: 3.6, d: 1.0, h: 0.74, cloth: '#efe8d8', items: 'setting' });
  for (let i = 0; i < 5; i++) props.chair(k, 52.4 + i * 0.7, y, 2.15, { face: -1, color: '#5a3420', tall: true });
  props.chair(k, 51.7, y, 1.25, { face: 1, color: '#5a3420', tall: true });
  props.shelves(k, 52.0, y, innerZ(52, y + 1) - 0.42, { w: 1.2, h: 1.0, n: 2, items: 'bottles', d: 0.32 });
  props.lamp(k, 53.8, ceilOf(y + 0.5), 1.5, { drop: 0.4, r: 4.4, i: 1.0, light: '#ffcf8a', flicker: true, color: '#b89040' });
}

// A capstan drumhead with its barrel (a part; turn it with rotation.y).
export function capstanPart(k, x, y, withBars) {
  const g = k.part(x, y, 0, (q) => {
    const dark = m('#5a3a22', { cut: '#9a6a3a' });
    q.lathe([[0.5, 0], [0.42, 0.25], [0.42, 0.75], [0.95, 0.78], [0.95, 1.18], [0.0, 1.2]], 0, 0, dark, { seg: 14 });
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; q.box(Math.cos(a) * 0.48 - 0.07, 0.0, Math.sin(a) * 0.48 - 0.07, Math.cos(a) * 0.48 + 0.07, 0.75, Math.sin(a) * 0.48 + 0.07, m('#6a4426')); }
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; q.box(Math.cos(a) * 0.9 - 0.08, 0.88, Math.sin(a) * 0.9 - 0.08, Math.cos(a) * 0.96 + 0.0, 1.06, Math.sin(a) * 0.9 + 0.08, m('#1e1610')); }
    q.cyl(0, 1.18, 0, 0.3, 0.04, BRASS, { seg: 12 });
  });
  let bars = null;
  if (withBars) {
    bars = k.part(0, 0, 0, (q) => { for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; q.beam([Math.cos(a) * 0.9, 0.97, Math.sin(a) * 0.9], [Math.cos(a) * 3.2, 0.97, Math.sin(a) * 3.2], 0.09, m('#b89060')); } });
    g.add(bars);
  }
  return { g, bars };
}

// ------------------------------------------------------------------ upper deck, forecastle, quarterdeck, poop
export function buildUpperDecks(k) {
  const y = Y.upper;
  // U2 sick berth: cots slung over the guns [S25]; a table of medicines.
  const sick = [];
  for (const [x, z] of [[1.6, 2.2], [3.1, 3.9], [4.6, 2.4], [5.6, 4.2], [2.4, 0.4], [4.4, 0.6]]) sick.push(cot(k, x, ceilOf(y + 0.5), z, 1.8, 0.72, 0.65, '#ece4d0'));
  props.table(k, 6.2, y, 0.4, { w: 0.8, d: 0.5, h: 0.78, items: 'bottle', top: '#8a6a42' });
  tub(k, 0.9, y, 1.0, 0.25, 0.4, '#6a5a4a');
  // U4 the waist: livestock pen under the boats [S17]; spare spars; a topsail spread for mending.
  const pen = m('#8a6a42', { cut: '#a07848' });
  k.box(19.2, y, 1.6, 23.6, y + 0.08, 4.0, m('#b8a070', { pat: 'speckle', c2: '#9a8458' }));
  for (const [a, b, c, d] of [[19.2, 1.6, 23.6, 1.66], [19.2, 3.94, 23.6, 4.0], [19.2, 1.6, 19.26, 4.0], [23.54, 1.6, 23.6, 4.0]]) for (const yy of [0.35, 0.75]) k.box(a, y + yy, b, c, y + yy + 0.06, d, pen);
  for (const [a, b] of [[19.2, 1.6], [23.6, 1.6], [19.2, 4.0], [23.6, 4.0], [21.4, 1.6], [21.4, 4.0]]) k.box(a - 0.04, y, b - 0.04, a + 0.04, y + 0.9, b + 0.04, pen);
  for (let i = 0; i < 4; i++) k.cyl(13.8 + i * 0.05, Y.fc - DT - 0.35 - i * 0.2, innerZ(20, 14) - 1.9, 0.12, 15.0, m('#c49c64'), { axis: 'x', seg: 6 }); // spare spars on the gangway beams
  k.box(26.0, y + 0.01, 0.4, 31.8, y + 0.04, 3.0, m('#ece2c8', { pat: 'canvas', s: 0.5, c2: '#d4c6a2' }));
  // U6 ante-room and sleeping cabin; U7 dining cabin; U8 day cabin [S4, S8].
  const floorcloth = { color: '#efe8d6', c2: '#2a2a2a' };
  k.box(42.6, y, 0.0, 57.0, y + 0.012, 5.6, m('#efe8d6', { pat: 'checker', s: 0.55, c2: '#3a3634' }));
  void floorcloth;
  k.box(45.0 - 0.03, y, 0.3, 45.0 + 0.03, ceilOf(y + 0.5), innerZ(45, y + 1) + 0.05, m('#e6dcc2', { pat: 'canvas', s: 0.4, cut: '#b8a888' }));
  props.desk(k, 43.8, y, 2.4, { w: 1.2, top: '#6a3a22' });
  props.chair(k, 43.8, y, 1.75, { face: 'out', color: '#5a3420' });
  props.shelves(k, 43.8, y + 0.3, innerZ(43.8, y + 1) - 0.42, { w: 1.2, h: 1.2, n: 3, items: 'books', d: 0.3 });
  const adm = cot(k, 46.0, ceilOf(y + 0.5), 2.0, 1.85, 0.8, 0.8, '#f0e8d4');
  props.chest(k, 46.0, y, 3.4, { w: 0.8, h: 0.45, color: '#5a3020' });
  props.table(k, 49.25, y, 1.2, { w: 3.0, d: 1.1, h: 0.74, cloth: '#f2ece0', items: 'setting', top: '#5a2a18' });
  for (let i = 0; i < 4; i++) props.chair(k, 48.2 + i * 0.7, y, 2.45, { face: -1, color: '#4a2416', tall: true, cushion: '#8a2a20' });
  props.chair(k, 47.5, y, 1.5, { face: 1, color: '#4a2416', tall: true, cushion: '#8a2a20' });
  props.shelves(k, 50.4, y, innerZ(50.4, y + 1) - 0.42, { w: 1.4, h: 1.0, n: 2, items: 'plates', d: 0.32 });
  props.lamp(k, 49.25, ceilOf(y + 0.5), 1.7, { drop: 0.4, r: 4.6, i: 1.05, light: '#ffd090', flicker: true, color: '#c8a050' });
  props.desk(k, 54.0, y, 1.8, { w: 1.5, top: '#6a3a22' });
  k.box(53.4, y + 0.77, 1.9, 54.4, y + 0.78, 2.4, m('#e8dcc0', { pat: 'stripes', s: 0.05, c2: '#8aa0b0' })); // a chart
  props.chair(k, 54.1, y, 2.5, { face: -1, color: '#4a2416', cushion: '#2a3a6a' });
  props.armchair(k, 56.0, y, 2.0, { color: '#6a2a20', w: 0.75 });
  props.picture(k, 53.6, y + 1.05, innerZ(53.6, y + 1.3) - 0.02, { w: 0.55, h: 0.7, color: '#c8a090', frame: '#c8a040' }); // a portrait
  props.lamp(k, 54.8, ceilOf(y + 0.5), 1.8, { drop: 0.4, r: 4.6, i: 1.0, light: '#ffd090', flicker: true, color: '#c8a050' });
  props.lamp(k, 44.4, ceilOf(y + 0.5), 1.5, { drop: 0.4, r: 3.6, i: 0.8, flicker: true });
  // Q3 captain's quarters under the poop.
  const q = Y.qd;
  props.desk(k, 50.6, q, 2.2, { w: 1.3, top: '#6a3a22' });
  props.chair(k, 50.6, q, 1.6, { face: 'out', color: '#4a2416' });
  props.table(k, 55.8, q, 1.2, { w: 2.0, d: 0.9, h: 0.74, cloth: '#efe8d8', items: 'cup' });
  for (let i = 0; i < 3; i++) props.chair(k, 55.1 + i * 0.7, q, 2.2, { face: -1, color: '#4a2416' });
  const capt = cot(k, 52.2, Y.poop - DT - BEAM, 3.2, 1.8, 0.75, 0.7, '#f0e8d4');
  props.lamp(k, 51.0, Y.poop - DT - BEAM, 1.6, { drop: 0.35, r: 3.8, i: 0.9, flicker: true });
  props.lamp(k, 55.8, Y.poop - DT - BEAM, 1.6, { drop: 0.35, r: 3.8, i: 0.9, flicker: true });
  // QD: brace bitts, binnacle; FC: belfry; poop: hen coops and the signal-flag locker.
  for (const x of [35.2, 35.9]) k.box(x - 0.15, q, 2.2, x + 0.15, q + 1.1, 2.5, OAK);
  k.box(35.0, q + 0.75, 2.2, 36.1, q + 0.9, 2.5, OAK);
  k.box(45.65, q, -0.4, 46.2, q + 1.15, 0.4, m('#7a5634', { whole: true }));
  k.box(45.6, q + 1.15, -0.45, 46.25, q + 1.25, 0.45, m('#c8a050', { whole: true }));
  k.lamp(45.9, q + 1.0, 0.1, { r: 2.4, i: 0.55, color: '#ffd080', halo: 0.3 });
  // Hen coops along the poop rail.
  const coop = m('#8a6a42', { pat: 'bars', s: 0.08, c2: '#3a2a1a', cut: '#a07848' });
  for (let x = 49.0; x < 56.0; x += 1.4) { const z = innerZ(x, Y.poop + 0.4) - 0.75; k.box(x, Y.poop, z, x + 1.3, Y.poop + 0.6, z + 0.7, coop); k.box(x - 0.02, Y.poop + 0.6, z - 0.02, x + 1.32, Y.poop + 0.66, z + 0.72, OAK); }
  // Signal-flag locker with flags hanging ready.
  k.box(56.6, Y.poop, 1.0, 57.9, Y.poop + 1.0, 2.6, m('#7a5634', { pat: 'grate', s: 0.2, c2: '#3a2a1a' }));
  const fc = ['#c8302a', '#f2ece0', '#2a4a8a', '#e0b83a', '#c8302a', '#2a4a8a'];
  for (let i = 0; i < 6; i++) k.box(56.7 + i * 0.2, Y.poop + 1.0, 1.1 + (i % 2) * 0.6, 56.85 + i * 0.2, Y.poop + 1.35, 1.6 + (i % 2) * 0.6, m(fc[i], { thin: true }));
  // Stern lanterns on the taffrail (lit at night).
  for (const z of [0, 3.4]) sternLantern(k, 58.95, 19.35, z, z === 0);
  // Belfry and bell (the bell itself is a part) at the forecastle break.
  const bf = m('#7a5634', { whole: true, cut: '#a07848' });
  for (const z of [-0.65, 0.65]) k.box(11.0, Y.fc, z - 0.08, 11.16, Y.fc + 1.9, z + 0.08, bf);
  k.box(10.95, Y.fc + 1.9, -0.8, 11.2, Y.fc + 2.1, 0.8, bf);
  k.lathe([[0.0, Y.fc + 2.1], [0.5, Y.fc + 2.1], [0.1, Y.fc + 2.45]], 11.08, 0, m('#a8503a', { whole: true }), { seg: 8 });
  // Forecastle: riding bitts and coils.
  for (const z of [1.2, 3.0]) k.box(4.6, Y.fc, z - 0.15, 4.95, Y.fc + 0.9, z + 0.15, OAK);
  coilFlat(k, 6.4, Y.fc, 2.6, 0.45, 0.2); coilFlat(k, 37.2, Y.qd, 3.6, 0.45, 0.2); coilFlat(k, 41.0, Y.qd, 3.9, 0.4, 0.2);
  return { sick, adm, capt };
}
function sternLantern(k, x, y, z, whole) {
  const w = !!whole;
  const frame = m('#c8a040', { whole: w });
  k.lathe([[0.0, y], [0.28, y + 0.05], [0.36, y + 0.55], [0.3, y + 0.95], [0.12, y + 1.15], [0.03, y + 1.4]], x, z, frame, { seg: 6 });
  k.lathe([[0.3, y + 0.15], [0.37, y + 0.55], [0.31, y + 0.9]], x, z, m('#f0e0b0', { c2: '#ffe090', glow: 'night', whole: w }), { seg: 6, capTop: false, capBot: false });
  k.beam([x - 0.6, y - 0.2, z], [x, y, z], 0.08, frame);
  k.lamp(x, y + 0.55, z, { r: 5.5, i: 0.9, color: '#ffd080', bulb: false, halo: 1.3, flicker: true });
}

// ------------------------------------------------------------------ boats
export function boat(k, x0, x1, y, zc, beam, c = '#e8dcc0', inside = '#a8845a') {
  const L = x1 - x0, depth = beam * 0.42;
  const secs = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10, x = x0 + L * t;
    const w = beam / 2 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.02)), 0.55) * (t > 0.85 ? 0.96 : 1) + 0.04;
    const d = depth * (0.75 + 0.25 * Math.sin(Math.PI * t));
    secs.push({ x, pts: [[zc - w, y + depth], [zc - w * 0.92, y + depth * 0.35], [zc, y + depth - d], [zc + w * 0.92, y + depth * 0.35], [zc + w, y + depth], [zc + w - 0.07, y + depth], [zc + w * 0.85, y + depth * 0.4], [zc, y + depth - d + 0.08], [zc - w * 0.85, y + depth * 0.4], [zc - w + 0.07, y + depth]] });
  }
  k.loft(secs, m(c, { cut: '#a07848' }), { matFn: (s, i) => (i < 5 ? m(c, { cut: '#a07848' }) : m(inside, { cut: '#a07848' })) });
  for (let t = 0.2; t < 0.9; t += 0.18) k.box(x0 + L * t - 0.12, y + depth * 0.6, zc - beam * 0.42, x0 + L * t + 0.12, y + depth * 0.68, zc + beam * 0.42, m(inside));
}
export function buildBoats(k) {
  // On the booms over the waist: the launch with a cutter nested in it, and the barge [boat list unverified].
  boat(k, 16.4, 26.4, Y.fc + 0.05, 0.7, 2.9, '#e8dcc0', '#b08a5a');
  boat(k, 17.6, 25.0, Y.fc + 0.55, 0.7, 2.1, '#2a2a2a', '#b89a6a');
  boat(k, 24.4, 31.6, Y.fc + 0.05, 3.6, 2.1, '#e8dcc0', '#a8845a');
  // Quarter boats on davits at the stern.
  const zq = halfB(53, 16) + 1.7;
  boat(k, 50.6, 57.0, 15.6, zq, 1.8, '#e8dcc0', '#a8845a');
  for (const x of [51.4, 56.2]) { k.beam([x, 17.5, zq - 2.0], [x, 18.6, zq + 0.1], 0.15, OAK); k.rope([x, 18.5, zq + 0.05], [x, 16.4, zq], 0.02, HEMP, 0, 2); }
}

export { lantern, cot, tub, coilFlat, clamp, sternX, deckTop, cylBetween };
