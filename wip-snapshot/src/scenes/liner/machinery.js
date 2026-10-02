/* The Atlantic Liner: the machinery. Five boiler rooms (three Scotch boilers for the
 * hotel load, then 24 Yarrow water-tube boilers, six to a room), two turbo-generator
 * rooms, two engine rooms with their turbine sets, gearing and condensers, the shaft
 * tunnels, the propellers and the rudder (dossier sections 3a Z42-Z49 and 6).
 */
import { mat, shade } from '../../engine/index.js';
import { DK, M, ybot } from './shape.js';
import { ROOMS } from './rooms.js';
import { C, lampC, counter } from './furn.js';

export const SHAFT_Y = 4.0;
export const SHAFTS = { inner: { z: 4.5, prop: 290, from: 216 }, outer: { z: 10, prop: 262, from: 193 } };

const casing = mat({ c: '#5a5e64', c2: '#4a4e54', pat: 'panels', s: 1.1, cut: '#2a2e32' });
const casingDark = mat({ c: '#3e4248', c2: '#33363c', pat: 'rivets', s: 0.8, cut: '#22262a' });
const turbRed = mat({ c: '#a83a2a', c2: '#8a2e22', pat: 'rivets', s: 0.7, cut: '#6a1e16' });
const turbBlack = mat({ c: '#2e2c2a', c2: '#3a3836', pat: 'rivets', s: 0.7, cut: '#1a1816' });
const pipe = mat({ c: '#d0d4d8', c2: '#b0b4b8', cut: '#7a7e82' });
const brassGauge = mat({ c: '#e8e0c8', c2: '#c8a050', cut: '#8a7a5a' });
const burner = mat({ c: '#ff8a30', c2: '#ffb050', glow: 'always', noEdge: false, cut: '#8a3a10' });
const brick = mat({ c: '#b86a4a', c2: '#a05a3a', pat: 'brick', s: 1.2, cut: '#7a3a2a' });

function yarrowBoiler(k, x0, x1, z0, z1, y0, face) {
  // Casing, steam drum on top, uptake hood; the burner front faces the firing aisle.
  const h = 7.2;
  k.box(x0, y0, z0, x1, y0 + h, z1, casing);
  k.box(x0 + 0.3, y0 + h, z0 + 0.2, x1 - 0.3, y0 + h + 0.9, z1 - 0.2, casingDark);
  k.cyl((x0 + x1) / 2, y0 + h + 1.4, z0 + 0.1, 0.75, z1 - z0 - 0.2, pipe, { axis: 'z', seg: 12 });
  k.box(x0 + 1.2, y0 + h + 1.6, z0 + 1.0, x1 - 1.2, y0 + h + 2.8, z1 - 1.0, casingDark);
  const fx = face > 0 ? x1 + 0.02 : x0 - 0.02;
  // Seven burners: four below, three above.
  const zs = [[0.2, 0.4, 0.6, 0.8], [0.3, 0.5, 0.7]];
  zs.forEach((row, ri) => row.forEach((t) => {
    const z = z0 + (z1 - z0) * t, y = y0 + 1.1 + ri * 1.0;
    k.box(Math.min(fx, fx + face * 0.25), y - 0.22, z - 0.22, Math.max(fx, fx + face * 0.25), y + 0.22, z + 0.22, casingDark);
    k.box(Math.min(fx + face * 0.25, fx + face * 0.27), y - 0.1, z - 0.1, Math.max(fx + face * 0.25, fx + face * 0.27), y + 0.1, z + 0.1, burner);
  }));
  // Gauge glass and a pair of pressure gauges high on the front.
  k.box(Math.min(fx, fx + face * 0.06), y0 + 4.5, z0 + 1.0, Math.max(fx, fx + face * 0.06), y0 + 5.6, z0 + 1.2, mat({ c: '#c8dce4', cut: '#6a7a80' }));
  k.cyl(fx + face * 0.05, y0 + 5.5, (z0 + z1) / 2, 0.22, 0.06, brassGauge, { axis: 'x', seg: 10 });
}

function scotchBoiler(k, x, y, z, L = 6.7, r = 2.65) {
  k.cyl(x - L / 2, y + r + 0.3, z + r, r, L, mat({ c: '#6a6e74', c2: '#5a5e64', pat: 'rivets', s: 0.6, cut: '#2a2e32' }), { axis: 'x', seg: 18 });
  for (const end of [-1, 1]) {
    const ex = x + end * (L / 2 + 0.02);
    for (let i = 0; i < 3; i++) {
      const zz = z + r + (i - 1) * 1.4;
      k.cyl(ex - (end > 0 ? 0 : 0.05), y + r - 0.2, zz, 0.42, 0.05, mat({ c: '#2a2826', cut: '#1a1816' }), { axis: 'x', seg: 10 });
      k.cyl(ex + (end > 0 ? 0.05 : -0.07), y + r - 0.2, zz, 0.2, 0.02, burner, { axis: 'x', seg: 8 });
    }
  }
  k.box(x - L / 2 + 0.5, y, z + 0.6, x + L / 2 - 0.5, y + 0.6, z + 2 * r - 0.6, brick);
  k.box(x - 1.2, y + 2 * r + 0.3, z + r - 0.8, x + 1.2, y + 2 * r + 1.5, z + r + 0.8, casingDark);
}

export function buildMachinery(k) {
  const lampsOut = [];
  for (const r of ROOMS) {
    if (r.kind === 'yarrow') {
      const mx = (r.x0 + r.x1) / 2, aisle = 1.6;
      for (let row = 0; row < 3; row++) {
        const z0 = 0.5 + row * 4.8, z1 = z0 + 4.2;
        if (z1 > r.d - 0.2) continue;
        yarrowBoiler(k, r.x0 + 0.4, mx - aisle, z0, z1, r.yF, 1);
        yarrowBoiler(k, mx + aisle, r.x1 - 0.4, z0, z1, r.yF, -1);
      }
      // Gratings and a catwalk at mid-height across the aisle; oil fuel pipes; vents.
      k.box(r.x0 + 0.4, r.yF + 7.2, 0.0, r.x1 - 0.4, r.yF + 7.3, 0.5, M.darkRail);
      k.cyl(r.x0, r.yF + 0.4, 0.3, 0.09, r.x1 - r.x0, mat({ c: '#4a4a46', cut: '#2a2a26' }), { axis: 'x', seg: 6 });
      k.cyl(r.x0, r.yC - 0.6, 1.0, 0.25, r.x1 - r.x0, pipe, { axis: 'x', seg: 8 });
      k.lamp(mx, r.yF + 1.4, 1.5, { always: true, color: '#ff9a50', r: 4.5, i: 0.55, bulb: false, halo: 0.4, flicker: true });
      lampC(k, mx, r.yC, 2.0, { kind: 'cage', r: 6, i: 0.6 });
      r.aisle = mx;
    } else if (r.kind === 'scotch') {
      scotchBoiler(k, (r.x0 + r.x1) / 2, r.yF, 0.4);
      scotchBoiler(k, (r.x0 + r.x1) / 2, r.yF, 6.6);
      k.lamp((r.x0 + r.x1) / 2 - 4, r.yF + 2.4, 0.5, { always: true, color: '#ff9a50', r: 3.5, i: 0.45, bulb: false, halo: 0.3, flicker: true });
      lampC(k, (r.x0 + r.x1) / 2, r.yC, 2.0, { kind: 'cage', r: 6, i: 0.6 });
      r.aisle = r.x0 + 1.4;
    } else if (r.kind === 'turbogen') {
      // Turbo-generator sets, each 1,300 kW DC: steam turbine, gearing, dynamo.
      for (let i = 0; i < r.sets; i++) {
        const z = 1.4 + i * 3.0;
        if (z + 2 > r.d) continue;
        k.box(r.x0 + 0.6, r.yF, z - 0.9, r.x1 - 0.6, r.yF + 0.7, z + 0.9, casingDark);
        k.cyl(r.x0 + 0.9, r.yF + 1.6, z, 0.85, 2.8, turbRed, { axis: 'x', seg: 14 });
        k.cyl(r.x0 + 4.3, r.yF + 1.6, z, 1.05, 2.4, mat({ c: '#4a6a4a', c2: '#3a5a3a', pat: 'rivets', s: 0.5, cut: '#2a3a2a' }), { axis: 'x', seg: 14 });
      }
      // The main switchboard along the back wall.
      k.box(r.x0 + 0.5, r.yF, r.d - 0.6, r.x1 - 0.5, r.yF + 2.6, r.d - 0.05, mat({ c: '#2a2a28', c2: '#3a3a36', pat: 'panels', s: 0.6, cut: '#1a1a18' }));
      for (let x = r.x0 + 0.9; x < r.x1 - 0.6; x += 0.6) k.cyl(x, r.yF + 1.9, r.d - 0.62, 0.12, 0.03, brassGauge, { axis: 'z', seg: 8 });
      lampC(k, (r.x0 + r.x1) / 2, r.yC, 2.0, { kind: 'dish', r: 6, i: 0.9, color: '#fff4dc' });
      r.coupling = [r.x0 + 3.9, r.yF + 1.6, 1.4];
    } else if (r.kind === 'engine') engineRoom(k, r);
    else if (r.kind === 'tunnel') {
      // Greaser's walkway and plummer blocks along both shafts.
      for (const S of [SHAFTS.inner, SHAFTS.outer]) {
        const end = Math.min(S.prop - 4, r.x1);
        for (let x = r.x0 + 2; x < end; x += 6) k.box(x - 0.5, r.yF, S.z - 0.6, x + 0.5, SHAFT_Y - 0.35, S.z + 0.6, casingDark);
        k.box(r.x0, r.yF + 0.0, S.z - 1.8, end, r.yF + 0.15, S.z - 1.0, M.darkRail);
      }
      for (let x = r.x0 + 4; x < r.x1 - 4; x += 9) { lampC(k, x, r.yC, 3.6, { kind: 'cage', r: 6, i: 0.8 }); lampsOut.push(x); }
    }
  }
  // Stern tubes: where the shafts leave the hull; A-brackets and bossing for the near-side pair.
  const pw = k.whole; k.whole = true;
  for (const S of [SHAFTS.inner, SHAFTS.outer]) {
    const zz = -S.z;
    k.cyl(S.prop - (S === SHAFTS.inner ? 6 : 10), SHAFT_Y, zz, 0.32, (S === SHAFTS.inner ? 6 : 10) - 1.2, M.steelGrey, { axis: 'x', seg: 10 });
    k.beam([S.prop - 2.6, SHAFT_Y, zz], [S.prop - 2.6, Math.max(SHAFT_Y + 2, ybot(S.prop - 2.6) - 0.2), zz * 0.3], 0.35, M.hullRed);
    k.cyl(S.prop - 3.0, SHAFT_Y, zz, 0.55, 1.0, M.hullRed, { axis: 'x', seg: 10 });
  }
  // The skeg and sternpost.
  k.box(268, 0, -0.3, 296, 0.9, 0.3, M.hullRed);
  k.box(294.5, 0, -0.3, 296.3, ybot(296) + 0.5, 0.3, M.hullRed);
  k.whole = pw;
}

function engineRoom(k, r) {
  // One turbine set as seen in the half we keep: HP, two IP and LP turbines round the gearing,
  // the LP turbine over its condenser (28 ft high), the control platform with its wheels.
  const x0 = r.x0, y0 = r.yF;
  const S = r.outer ? SHAFTS.outer : SHAFTS.inner;
  const gx0 = x0 + 12.5, gx1 = x0 + 17.5;
  // Condenser.
  k.box(x0 + 1.0, y0, 6.2, x0 + 6.0, y0 + 8.5, 10.4, mat({ c: '#6a7078', c2: '#5a6068', pat: 'rivets', s: 0.7, cut: '#2a3036' }));
  // LP turbine on top of the condenser.
  k.cyl(x0 + 0.8, y0 + 9.6, 8.3, 1.25, 6.0, r.outer ? turbRed : turbBlack, { axis: 'x', seg: 16 });
  k.box(x0 + 6.8, y0 + 9.4, 7.8, gx0, y0 + 9.8, 8.8, pipe);
  // HP and IP turbines.
  k.cyl(x0 + 4.0, y0 + 3.2, 3.0, 0.75, 7.0, r.outer ? turbBlack : turbRed, { axis: 'x', seg: 14 });
  k.cyl(x0 + 6.5, y0 + 5.8, 5.6, 0.95, 5.5, r.outer ? turbRed : turbBlack, { axis: 'x', seg: 14 });
  k.cyl(x0 + 6.5, y0 + 5.8, 11.0, 0.95, 5.5, r.outer ? turbRed : turbBlack, { axis: 'x', seg: 14 });
  // Gear case: the big double-helical gear wheel inside (shown by the part in setup).
  k.box(gx0, y0, 1.6, gx1, y0 + 6.8, 12.4, mat({ c: '#4a4e54', c2: '#3e4248', pat: 'rivets', s: 0.8, cut: '#22262a' }));
  k.box(gx0 - 0.1, y0 + 6.8, 2.0, gx1 + 0.1, y0 + 7.4, 12.0, casingDark);
  // Steam pipes: ahead and astern mains, from forward (the boiler rooms) along the deckhead.
  k.cyl(x0, r.yC - 0.9, 2.2, 0.4, 12, pipe, { axis: 'x', seg: 10 });
  k.tube([[x0 + 12, r.yC - 0.9, 2.2], [x0 + 13, y0 + 5, 2.5], [x0 + 11, y0 + 3.2, 3.0]], 0.3, pipe, { seg: 8 });
  k.cyl(x0, r.yC - 1.6, 4.5, 0.3, 10, pipe, { axis: 'x', seg: 8 });
  // Control platform: the throttle wheels, gauge board, engine-room telegraphs and rev counters.
  const px = gx1 + 1.2;
  k.box(px, y0, 0.3, r.x1 - 0.4, y0 + 0.25, 3.6, M.darkRail);
  k.box(px + 0.6, y0 + 0.25, 3.4, r.x1 - 0.8, y0 + 3.6, 3.7, mat({ c: '#2e2c2a', c2: '#3a3836', pat: 'panels', s: 0.5, cut: '#1a1816' }));
  for (let i = 0; i < 6; i++) k.cyl(px + 1.0 + i * 0.6, y0 + 2.6, 3.38, 0.2, 0.04, brassGauge, { axis: 'z', seg: 10 });
  for (let i = 0; i < 2; i++) { k.cyl(px + 1.4 + i * 1.6, y0 + 0.25, 1.4, 0.08, 1.0, M.brass, { seg: 6 }); k.cyl(px + 1.4 + i * 1.6, y0 + 1.25, 1.28, 0.24, 0.24, brassGauge, { axis: 'z', seg: 10 }); }
  counter(k, px + 0.6, px + 2.0, y0 + 0.25, 2.3, 0.6, 1.0, '#3a3836', '#7a5a3a');
  // Shaft from the gear case aft.
  void S;
  // Gratings and ladders up to E deck.
  k.box(x0, y0 + 7.4, 0.0, x0 + 12, y0 + 7.5, 1.2, M.darkRail);
  for (let y = y0; y < r.yC; y += 0.3) k.box(r.x1 - 1.0, y, 0.2, r.x1 - 0.5, y + 0.04, 0.3, M.darkRail);
  for (let x = x0 + 4; x < r.x1; x += 7) lampC(k, x, r.yC, 1.8, { kind: 'dish', r: 7, i: 0.9, color: '#fff4dc' });
  r.gear = [(gx0 + gx1) / 2, SHAFT_Y, 1.55];
  r.wheels = [px + 1.4, y0 + 1.37, 1.28];
  r.platform = { x: px + 1.5, y: y0 + 0.25 };
  void shade;
}

// ------------------------------------------------------------------ moving parts
// A cylinder about the x axis built of alternating strips, so its turning shows.
export function stripedShaft(q, x0, len, r, mA, mB, seg = 8) {
  for (let i = 0; i < seg; i++) {
    const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
    const P = (x, a) => [x, Math.cos(a) * r, Math.sin(a) * r];
    q.quad(P(x0, a0), P(x0, a1), P(x0 + len, a1), P(x0 + len, a0), i % 2 ? mA : mB);
  }
}
export function propeller(q, R = 3.05, hub = 0.75) {
  const bronze = mat({ c: '#c8904a', c2: '#a87038', cut: '#7a5028' });
  q.cyl(-0.9, 0, 0, hub, 1.8, bronze, { axis: 'x', seg: 12 });
  q.sphere(-0.95, 0, 0, hub * 0.95, bronze, { seg: 10, rings: 5 });
  for (let b = 0; b < 4; b++) {
    const a = (b / 4) * Math.PI * 2;
    for (let s = 0; s < 4; s++) {
      const r0 = hub + (s / 4) * (R - hub), r1 = hub + ((s + 1) / 4) * (R - hub), rm = (r0 + r1) / 2;
      const w = 1.25 * Math.sin(Math.PI * (0.25 + 0.75 * (s + 0.5) / 4)) + 0.35;
      q.boxR(0, Math.cos(a) * rm, Math.sin(a) * rm, 0.16, r1 - r0 + 0.02, w, bronze, { x: a, y: 0.62 - s * 0.07 });
    }
  }
}
export function fan(q, R = 0.8) {
  const m1 = mat({ c: '#8a9098', cut: '#4a4e54' }), m2 = mat({ c: '#5a6068', cut: '#3a3e44' });
  q.cyl(0, 0, -0.1, R + 0.12, 0.05, mat({ c: '#3a3e44', cut: '#2a2e32' }), { axis: 'z', seg: 16 });
  for (let b = 0; b < 6; b++) { const a = (b / 6) * Math.PI * 2; q.boxR(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, -0.16, 0.05, R * 0.95, 0.3, b % 2 ? m1 : m2, { z: a - Math.PI / 2, y: 0.4 }); }
  q.cyl(0, 0, -0.25, 0.16, 0.2, m2, { axis: 'z', seg: 8 });
}
