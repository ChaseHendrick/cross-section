/* The Jumbo Jet: below the main deck. Electronics bay, nose gear, the container holds, the
 * centre wing tank, air-conditioning bay, wheel wells, bulk hold, the aft fuselage and the APU.
 * Dossier zones Z03, Z04, Z28 to Z37.
 */
import { mat, props } from '../../engine/index.js';
import { ZC, FL, HOLD, HOLDTOP, M, farWall, wallZ, botY, sec, shade } from './common.js';
import { slab } from './airframe.js';

// LD-1 container [S1]: 1.56 m base, 2.34 m wide at the top, 1.63 m tall; two side by side.
const LD = { base: 1.56, top: 2.34, h: 1.63, len: 1.53, sh: 0.75 };
function ldProfile(side) { // [z, y] for one container, inboard edge at the centreline
  const s = side, z0 = ZC + s * 0.04, zb = ZC + s * (0.04 + LD.base), zt = ZC + s * (0.04 + LD.top);
  const y0 = HOLD + 0.02, y1 = HOLD + 0.02 + LD.h;
  return [[z0, y0], [zb, y0], [zt, y0 + LD.sh], [zt, y1], [z0, y1]];
}

function container(k, x0, side, r, open) {
  const x1 = x0 + LD.len;
  const pr = ldProfile(side);
  if (!open) { k.extrudeX(pr, x0, x1, M.container); return; }
  // The near container is cut through: thin walls with the bags inside.
  const t = 0.035;
  k.extrudeX(pr, x0, x0 + t, M.container);
  k.extrudeX(pr, x1 - t, x1, M.container);
  const zi = pr[0][0], zo = pr[2][0], y0 = pr[0][1], y1 = pr[3][1];
  k.box(x0, y0, Math.min(zi, zo), x1, y0 + t, Math.max(zi, zo), M.containerIn);
  k.box(x0, y1 - t, Math.min(zi, zo), x1, y1, Math.max(zi, zo), M.containerIn);
  k.box(x0, y0, zi - 0.02, x1, y1, zi + 0.015, M.container);
  // Suitcases, trunks and holdalls stacked inside.
  const cols = ['#5a3a2a', '#2a3a5a', '#7a2a2a', '#3a4a3a', '#8a6a3a', '#1e1e22', '#6a6a72', '#a8483a', '#c8a060', '#3a5a6a'];
  let yy = y0 + t;
  const fill = 0.55 + r() * 0.35;
  while (yy < y0 + (y1 - y0) * fill) {
    let xx = x0 + t + 0.02, hh = 0;
    while (xx < x1 - t - 0.25) {
      const w = r.range(0.45, 0.75), h = r.range(0.18, 0.32), d = r.range(0.5, 0.75);
      if (xx + w > x1 - t - 0.02) break;
      const zr = zi - 0.03 - r.range(0, 0.25), zl = zr - d - 0.9;
      const c = r.pick(cols);
      k.box(xx, yy, zl, xx + w, yy + h, zr, mat({ c, cut: shade(c, -0.25) }));
      if (r() < 0.5) k.box(xx + w / 2 - 0.06, yy + h, zr - 0.3, xx + w / 2 + 0.06, yy + h + 0.03, zr - 0.25, M.black);
      xx += w + 0.03; hh = Math.max(hh, h);
    }
    yy += hh + 0.01;
  }
}

function holdFloor(k, x0, x1, y) {
  slab(k, x0, x1, y - 0.14, y, M.roller, { z0: -0.3 });
}

// A four-wheel bogie (two axles) lying in its well; axles along z [S1: 44 in across, 58 in fore-and-aft].
function bogie(k, x, y, z) {
  const r = 0.585, w = 0.41; // 46 x 16 in tyres
  for (const dx of [-0.735, 0.735]) for (const dz of [-0.56, 0.56]) {
    k.cyl(x + dx, y, z + dz - w / 2, r, w, M.tyre, { axis: 'z', seg: 18 });
    k.cyl(x + dx, y, z + dz - w / 2 - 0.01, r * 0.5, w + 0.02, M.hub, { axis: 'z', seg: 12 });
  }
  k.box(x - 0.9, y - 0.08, z - 0.08, x + 0.9, y + 0.08, z + 0.08, M.strut);
  k.cyl(x - 0.735, y, z - 0.6, 0.06, 1.2, M.strut, { axis: 'z', seg: 8 });
  k.cyl(x + 0.735, y, z - 0.6, 0.06, 1.2, M.strut, { axis: 'z', seg: 8 });
}

export function buildBelow(k, S) {
  const r = k.rng('holds');
  // ---- electronics bay (Z03): racks of grey boxes, red status lamps [position illustrative].
  slab(k, 3.0, 6.1, 1.35, 1.45, mat({ c: '#7a7e84', c2: '#6a6e74', pat: 'grate', s: 0.3, cut: '#5a5e64' }));
  for (const [x0, x1] of [[3.25, 3.95], [4.15, 4.85], [5.05, 5.75]]) {
    const z1 = ZC + Math.min(1.3, wallZ((x0 + x1) / 2, 1.9) - 0.2);
    k.box(x0, 1.45, ZC - 0.5, x1, 2.28, z1, mat({ c: '#6e747c', c2: '#5e646c', pat: 'panels', s: 0.2, cut: '#3a3e44' }));
    for (let yy = 1.52; yy < 2.2; yy += 0.17) {
      for (let xx = x0 + 0.05; xx < x1 - 0.12; xx += 0.22) {
        k.box(xx, yy, ZC - 0.53, xx + 0.18, yy + 0.13, ZC - 0.5, mat(r.pick(['#3a3e44', '#4a4e56', '#2e3036', '#5a5048'])));
        if (r() < 0.3) k.box(xx + 0.13, yy + 0.08, ZC - 0.55, xx + 0.16, yy + 0.11, ZC - 0.53, mat({ c: '#c83a2a', c2: '#ff4a2a', glow: 'always' }));
      }
    }
  }
  k.lamp(4.5, 2.2, ZC - 0.8, { color: '#ff5a3a', r: 1.4, i: 0.35, always: true, bulb: false, halo: 0.12 });
  for (let x = 3.3; x < 5.9; x += 0.5) k.tube([[x, 2.25, ZC - 0.45], [x + 0.1, 2.2, ZC + 1.2]], 0.02, M.black, { seg: 4 });
  S.ebay = [4.5, 1.9, ZC - 0.5];

  // ---- nose gear well (Z04): two wheels folded forward under the cabin floor [S1].
  for (const dz of [-0.33, 0.33]) {
    k.cyl(7.3, 1.2, ZC + dz - 0.2, 0.585, 0.41, M.tyre, { axis: 'z', seg: 18 });
    k.cyl(7.3, 1.2, ZC + dz - 0.21, 0.3, 0.43, M.hub, { axis: 'z', seg: 12 });
  }
  k.beam([8.7, 2.2, ZC], [7.3, 1.2, ZC], 0.16, M.strut);
  k.beam([8.2, 2.25, ZC], [7.6, 1.6, ZC], 0.08, M.strut);
  k.box(6.0, 0.6, ZC - 1.1, 6.08, 2.3, ZC + 1.2, M.primer);
  k.box(9.0, 0.3, ZC - 1.4, 9.08, 2.3, ZC + 1.6, M.primer);

  // ---- forward hold (Z28): 8 rows of two LD-1s, x 9.0 to 21.5 [S1].
  holdFloor(k, 9.08, 21.5, HOLD);
  for (let i = 0; i < 8; i++) {
    const x0 = 9.12 + i * 1.5625;
    container(k, x0, 1, r, false);
    container(k, x0, -1, r, true);
  }
  cargoDoor(k, 12.0, 14.7);
  // ---- aft hold (Z34): 7 rows, x 37.0 to 48.0 [S1].
  holdFloor(k, 37.1, 48.0, HOLD);
  for (let i = 0; i < 7; i++) {
    const x0 = 37.12 + i * 1.571;
    container(k, x0, 1, r, false);
    container(k, x0, -1, r, true);
  }
  cargoDoor(k, 43.8, 46.4);
  k.box(37.0, 0.05, -0.3, 37.08, HOLDTOP, farWall(37, 1.2), M.primer);

  // ---- bulk hold (Z35): loose bags and mail behind a net [S1].
  const bf = (x) => Math.max(0.7, botY(x) + 0.32);
  slab(k, 48.0, 52.6, 0.55, 0.7, M.roller, { z0: -0.3 });
  k.box(48.0, 0.3, -0.3, 48.06, HOLDTOP, farWall(48, 1.4), mat({ c: '#6a6e74', c2: '#9a9ea4', pat: 'grate', s: 0.12 }));
  for (let i = 0; i < 26; i++) {
    const x = 48.3 + r() * 3.6, z = ZC - 0.9 + r() * 2.4, yy = bf(x);
    if (r() < 0.45) props.sack(k, x, yy, z, { color: r.pick(['#8a7a5a', '#6a6a5a', '#9a8a6a']), w: 0.42 }); // mailbags
    else k.box(x - 0.3, yy, z, x + 0.3, yy + r.range(0.2, 0.35), z + r.range(0.4, 0.6), mat({ c: r.pick(['#5a3a2a', '#2a3a5a', '#7a2a2a', '#8a6a3a', '#3a3a3a']), cut: '#2a2220' }));
  }
  for (const [x, z] of [[49.0, ZC + 0.6], [50.2, ZC - 0.5]]) props.sack(k, x, bf(x) + 0.3, z, { color: '#9a8a6a', w: 0.4 });
  // A dog travels in a kennel among the suitcases [illustrative].
  const kx = 50.8, ky = bf(50.8);
  k.box(kx - 0.45, ky, ZC - 0.62, kx + 0.45, ky + 0.62, ZC - 0.58, mat({ c: '#8a8e94', c2: '#5a5e64', pat: 'bars', s: 0.06 })); // wire door
  k.box(kx - 0.45, ky, ZC - 0.58, kx + 0.45, ky + 0.04, ZC + 0.05, mat('#c8b890'));
  k.box(kx - 0.45, ky + 0.6, ZC - 0.58, kx + 0.45, ky + 0.66, ZC + 0.05, mat('#c8b890'));
  k.box(kx - 0.45, ky, ZC, kx + 0.45, ky + 0.62, ZC + 0.05, mat('#c8b890'));
  k.box(kx - 0.48, ky, ZC - 0.6, kx - 0.44, ky + 0.66, ZC + 0.05, mat('#c8b890'));
  k.box(kx + 0.44, ky, ZC - 0.6, kx + 0.48, ky + 0.66, ZC + 0.05, mat('#c8b890'));
  S.kennel = [kx, ky + 0.04, ZC - 0.3];
  // Cargo net across the back of the bulk hold.
  k.box(52.45, bf(52.5), -0.3, 52.5, HOLDTOP, farWall(52.5, 1.6), mat({ c: '#4a4a3a', c2: '#c8b880', pat: 'grate', s: 0.15 }));
  cargoDoor(k, 48.13, 49.25);

  // ---- aft lower fuselage (Z36): hydraulic lines and cables running aft [illustrative].
  for (const [y, z, c] of [[2.15, ZC + 1.4, '#6a6a5a'], [2.05, ZC + 1.6, '#4a5a7a'], [1.95, ZC + 1.2, '#7a5a3a'], [2.2, ZC + 0.6, '#3a3a3e']]) {
    const pts = [];
    for (let x = 52.6; x <= 66.0; x += 1.4) pts.push([x, Math.max(y, botY(x) + 0.45 + (y - 1.95)), z]);
    k.tube(pts, 0.03, mat(c), { seg: 5 });
  }
  // ---- APU in the tail cone (Z37), switched off in cruise [illustrative].
  k.cyl(63.6, 5.0, ZC + 0.1, 0.42, 2.4, mat({ c: '#8a8478', c2: '#7a7468', pat: 'rings', s: 0.15 }), { axis: 'x', seg: 14 });
  k.cyl(66.0, 5.05, ZC + 0.1, 0.22, 2.6, M.black, { axis: 'x', seg: 10 });
  k.box(63.2, 4.3, ZC - 0.4, 63.28, 5.9, ZC + 0.9, mat({ c: '#b8b0a0', cut: '#5a5448' })); // firewall

  // ---- centre wing tank (Z30) between the front and rear spars [S35; extent layout estimate].
  const tz1 = (x, y) => farWall(x, y, 0.2);
  k.box(21.5, 0.4, -0.3, 21.7, HOLDTOP, tz1(21.6, 1.3), M.tank);
  k.box(29.3, 0.4, -0.3, 29.5, HOLDTOP, tz1(29.4, 1.3), M.tank);
  k.box(21.7, 0.4, -0.3, 29.3, 0.55, tz1(25, 0.5), M.tank);
  k.box(21.7, 2.16, -0.3, 29.3, HOLDTOP, tz1(25, 2.2), M.tank);
  k.box(21.7, 0.55, ZC + 2.55, 29.3, 2.16, ZC + 2.62, mat({ c: '#8a9a88', c2: '#6a7a68', pat: 'panels', s: 0.6, cut: '#4a5248' }));
  for (let x = 22.3; x < 29.2; x += 0.9) k.box(x, 0.55, ZC + 2.45, x + 0.06, 2.16, ZC + 2.55, M.tank); // ribs and stiffeners
  S.tank = { x0: 21.72, x1: 29.28, y0: 0.55, y1: 2.15, z1: ZC + 2.54 };

  // ---- air-conditioning bay (Z29) in the belly fairing [illustrative].
  for (const [x, z] of [[23.2, ZC - 0.2], [25.8, ZC + 0.9], [27.6, ZC - 0.1]]) {
    k.cyl(x - 0.9, 0.05, z, 0.28, 1.8, M.duct, { axis: 'x', seg: 12 });
    k.box(x - 0.5, -0.22, z - 0.35, x + 0.5, 0.32, z + 0.35, mat({ c: '#b8b4a8', c2: '#a8a498', pat: 'panels', s: 0.25, cut: '#7a766a' }));
  }
  k.tube([[21.0, 0.3, ZC + 0.4], [22.0, 0.1, ZC + 0.6], [28.8, 0.1, ZC + 0.6], [29.2, 0.3, ZC + 1.2]], 0.12, M.duct, { seg: 8 });
  // ---- engine injection water tank (Z31): 400 US gal, empty after take-off [S1, S3; position illustrative].
  const wt = mat({ c: '#9aa6b0', c2: '#8a96a0', pat: 'rivets', s: 0.25, cut: '#4a5660' });
  k.box(19.9, -0.12, -0.3, 21.35, -0.06, ZC + 1.3, wt);
  k.box(19.9, 0.4, -0.3, 21.35, 0.46, ZC + 1.3, wt);
  k.box(19.9, -0.12, -0.3, 19.96, 0.46, ZC + 1.3, wt);
  k.box(21.29, -0.12, -0.3, 21.35, 0.46, ZC + 1.3, wt);
  k.box(19.9, -0.12, ZC + 1.24, 21.35, 0.46, ZC + 1.3, wt);
  k.box(19.96, -0.06, -0.3, 21.29, -0.04, ZC + 1.24, mat({ c: '#7a9ab0', c2: '#9ab8c8' }));
  S.waterTank = [20.6, 0.2, ZC];

  // ---- wheel wells (Z32, Z33): wing gear and body gear bogies retracted [S1, S7].
  k.box(29.5, 0.0, -0.3, 29.6, HOLDTOP, farWall(29.5, 1.2), M.primer);
  bogie(k, 31.3, 1.0, ZC + 1.75);
  bogie(k, 35.0, 1.0, ZC + 1.92);
  k.beam([32.6, 2.2, ZC + 2.3], [31.3, 1.0, ZC + 1.75], 0.18, M.strut);
  k.beam([36.6, 2.2, ZC + 2.0], [35.0, 1.0, ZC + 1.92], 0.18, M.strut);
  k.box(33.0, 0.0, ZC + 0.9, 33.08, HOLDTOP, farWall(33, 1.2), M.primer);
  for (const x of [30.2, 31.6, 34.0, 35.8]) k.tube([[x, 2.25, ZC + 2.6], [x + 0.4, 1.6, ZC + 2.7]], 0.025, mat('#3a3a3e'), { seg: 4 });
  void FL; void sec;
}

function cargoDoor(k, x0, x1) {
  const fr = mat({ c: '#7a8a78', c2: '#6a7a68', cut: '#3a4238' });
  const y0 = HOLD + 0.05, y1 = Math.min(HOLDTOP - 0.05, y0 + 1.73);
  const z = (x, y) => farWall(x, y) - 0.03;
  const zm = Math.min(z(x0, 1.4), z(x1, 1.4));
  k.box(x0, y0, zm - 0.05, x1, y0 + 0.08, zm + 0.1, fr);
  k.box(x0, y1 - 0.08, zm - 0.05, x1, y1, zm + 0.1, fr);
  k.box(x0, y0, zm - 0.05, x0 + 0.08, y1, zm + 0.1, fr);
  k.box(x1 - 0.08, y0, zm - 0.05, x1, y1, zm + 0.1, fr);
  for (let x = x0 + 0.5; x < x1 - 0.3; x += 0.5) k.box(x, y0 + 0.4, zm - 0.04, x + 0.12, y0 + 0.5, zm, M.steelDark);
}
