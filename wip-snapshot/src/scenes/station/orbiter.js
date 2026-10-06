/* Space Shuttle Endeavour, docked nose to deep space with its payload bay facing the station.
 *
 * Panel A coordinates: the orbiter stands upright, nose up (+y), belly to the left (x = 4.0),
 * open payload bay facing the station (+x). Its centreline is the cut plane, so the cutaway
 * shows the crew cabin (flight deck over middeck, both "floors" vertical here) and the bay.
 * Dimensions from the dossier (length 37.2 m, span 23.8 m, bay 18.3 m); shapes illustrative.
 */
import { mat } from '../../engine/index.js';
import { M, loftRings, lightBar, laptop, hatchRing } from './common.js';

const se = (v, p) => Math.sign(v) * Math.pow(Math.abs(v), 2 / p);
const lerpTab = (tab, y) => {
  if (y >= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (y >= tab[i][0]) { const [y0, v0] = tab[i - 1], [y1, v1] = tab[i]; return v1 + ((v0 - v1) * (y - y1)) / (y0 - y1); }
  return tab[tab.length - 1][1];
};
// Side profile of the forward fuselage: belly line, top line, half width, by height y.
const TOP = [[10.5, 5.5], [10.1, 6.7], [9.4, 7.9], [8.4, 9.0], [7.2, 9.85], [5.0, 10.1], [3.0, 9.9], [1.5, 9.4]];
const BEL = [[10.5, 5.2], [10.1, 4.6], [9.4, 4.25], [8.4, 4.02], [7.2, 4.0], [1.5, 4.0]];
const HW = [[10.5, 0.15], [10.1, 1.05], [9.4, 1.6], [8.4, 2.05], [7.2, 2.35], [5.0, 2.55], [1.5, 2.6]];

export const ORB = { bayTop: 9.4, belly: 4.0, hw: 2.6, bay0: -16.8, bay1: 1.5, mid: 7.0, deck: 4.55 };

function ring(y, inset, n = 16, m = 0.34) {
  const xt = lerpTab(TOP, y) - inset, xb = lerpTab(BEL, y) + inset, hw = Math.max(0.04, lerpTab(HW, y) - inset);
  const xc = (xt + xb) / 2, rx = Math.max(0.03, (xt - xb) / 2);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const f = -Math.PI / 2 - m + ((Math.PI + 2 * m) * i) / n;
    pts.push([xc + rx * se(Math.sin(f), 3.2), y, hw * se(Math.cos(f), 3.2)]);
  }
  return pts;
}

export function buildOrbiter(k, SP) {
  // ---------------------------------------------------------------- forward fuselage shell
  const ys = [1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.2, 7.8, 8.4, 8.9, 9.4, 9.8, 10.1, 10.35, 10.5];
  const rings = ys.map((y) => { const o = ring(y, 0), i = ring(y, Math.min(0.14, 0.04 + (10.5 - y) * 0.05)); return o.concat(i.reverse()); });
  const nOut = 17;
  loftRings(k, rings, M.tilesWhite, {
    flip: true,
    matFn: (s, i) => {
      const y = ys[s];
      if (i >= nOut) return M.cabin; // inner skin
      if (y > 9.9 && i < nOut) return M.rcc; // nose cap
      return i < 6 ? M.tilesBlack : M.tilesWhite; // black belly tiles, white upper surface
    },
  });
  // Windscreen and overhead windows (glow from the lit cabin at night).
  const win = mat({ c: '#22303a', c2: '#ffe2a8', glow: 'night' });
  k.boxR(9.15, 8.15, 0.9, 0.05, 0.95, 0.8, win, { z: 0.85 });
  k.boxR(9.15, 8.15, 1.85, 0.05, 0.85, 0.7, win, { z: 0.85, y: 0.25 });
  k.box(10.08, 5.0, 0.3, 10.14, 5.9, 1.0, win);
  // ---------------------------------------------------------------- crew cabin
  // Middeck floor (x = 4.55) and the flight-deck floor (x = 7.0): both vertical planes here.
  const cab = mat({ c: '#d2d0c6', c2: '#bab8ac', pat: 'panels', s: 0.6, cut: '#5a5e66' });
  k.box(4.15, 2.0, -0.5, ORB.deck, 8.2, 2.2, mat({ c: '#9a9a92', c2: '#86867e', pat: 'grate', cut: '#4a4e56' }));
  k.box(6.9, 2.0, -0.5, 7.05, 7.6, 2.2, cab);
  k.box(6.9, 2.0, -0.5, 7.05, 2.55, 2.2, cab);
  k.box(4.1, 1.7, -0.5, 9.7, 2.0, 2.4, cab); // aft cabin bulkhead
  k.box(4.4, 8.15, -0.5, 7.2, 8.35, 2.0, cab); // forward middeck bulkhead
  // Middeck lockers on the forward bulkhead (face -y) and the far wall.
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const x0 = 4.7 + i * 0.55, z0 = 0.2 + j * 0.55;
    k.box(x0, 7.8, z0, x0 + 0.5, 8.15, z0 + 0.5, M.locker);
  }
  k.box(4.6, 2.1, 1.95, 6.85, 7.8, 2.2, mat({ c: '#cfcdc2', c2: '#b4b2a6', pat: 'tiles', s: 0.45, cut: '#6a6a62' }));
  // Sleeping bags tied to the far middeck wall (crew sleep here: illustrative).
  const bagM = [mat({ c: '#4a6a9a', c2: '#3a5a8a', pat: 'quilt', s: 0.25 }), mat({ c: '#6a7a5a', pat: 'quilt', s: 0.25, c2: '#5a6a4a' }), mat({ c: '#8a5a4a', pat: 'quilt', s: 0.25, c2: '#7a4a3a' }), mat({ c: '#5a5a7a', pat: 'quilt', s: 0.25, c2: '#4a4a6a' })];
  // Each bag hangs from the far wall; a sleeper's head and arms stay outside it.
  SP.midBags = [];
  for (let i = 0; i < 4; i++) {
    const y = 2.55 + i * 1.3;
    k.box(4.66, y, 1.12, 5.95, y + 0.52, 1.62, bagM[i]);
    k.box(5.95, y + 0.05, 1.55, 6.2, y + 0.47, 1.62, bagM[i]);
    SP.midBags.push([4.68, y + 0.3, 1.38]);
  }
  for (let i = 0; i < 2; i++) {
    const y = 4.0 + i * 1.3;
    k.box(7.12, y, 1.12, 8.45, y + 0.52, 1.62, bagM[(i + 2) % 4]);
    SP.midBags.push([7.14, y + 0.3, 1.38]);
  }
  // Galley block on the far wall near the aft bulkhead.
  k.box(5.0, 2.05, 1.5, 6.3, 2.7, 1.95, mat({ c: '#b8b6aa', pat: 'panels', s: 0.3, c2: '#a2a094' }));
  lightBar(k, 6.2, 6.7, 5.0, 1.7, { every: 0.6, r: 3.0, i: 0.8 });
  k.lamp(5.8, 6.8, 1.2, { color: '#fff0d0', r: 2.8, i: 0.8, bulb: false, halo: 0.25 });
  // Flight deck: forward panels and seats, aft station facing the bay windows.
  const panel = mat({ c: '#3a3c40', c2: '#5a5c60', pat: 'tiles', s: 0.12 });
  k.box(7.1, 7.35, -0.5, 9.2, 7.75, 1.9, panel);
  k.box(7.1, 2.05, 0.2, 9.0, 2.5, 1.8, panel); // aft flight deck panels
  for (const z of [0.6, 1.5]) k.box(7.05, 6.2, z - 0.25, 7.6, 6.8, z + 0.25, mat({ c: '#6a5a4a' })); // seats (folded against the floor)
  k.box(9.25, 1.95, 0.3, 9.5, 2.05, 1.6, win); // aft windows into the bay
  lightBar(k, 8.2, 8.6, 4.6, 1.8, { every: 0.4, r: 3.0, i: 0.9 });
  for (const [x, y] of [[8.4, 7.6], [7.7, 7.6], [8.9, 7.6], [8.0, 2.4]]) k.box(x - 0.18, y - 0.01, 1.85, x + 0.18, y + 0.02, 1.9, M.screenNight);
  laptop(k, 8.2, 3.1, 1.3);
  // Interdeck access (a dark opening in the flight-deck floor).
  k.box(6.88, 2.6, 0.2, 7.07, 3.4, 1.0, M.black);
  // Middeck side hatch (round, on the far wall) and airlock hatch in the aft bulkhead.
  hatchRing(k, 5.5, 4.4, 2.18, 0.4, M.alu);
  // ---------------------------------------------------------------- mid fuselage: payload bay
  const y0 = ORB.bay0, y1 = ORB.bay1;
  // Belly and bay floor (cut through), far side wall, bay liner.
  k.box(4.0, y0, -0.5, 4.6, y1, 2.6, M.tilesBlack, { right: M.bayLiner, top: M.bayLiner });
  k.box(4.6, y0, -0.5, 5.3, y1, 2.45, mat({ c: '#b8b8ae', c2: '#a0a096', pat: 'rivets', s: 0.6, cut: '#3a4048' }));
  k.box(4.0, y0, 2.45, 9.4, y1, 2.62, M.tilesWhite, { front: M.bayLiner });
  k.box(4.0, y0, 2.62, 4.3, y1, 2.75, M.tilesBlack);
  // The bay's frames, a rib every metre and a half down the far wall, and blanket seams.
  for (let y = y0 + 0.75; y < y1 - 0.3; y += 1.5) k.box(4.6, y, 2.3, 9.3, y + 0.12, 2.45, mat({ c: '#c8c8be', cut: '#3a4048' }));
  // Sill longeron with trunnion fittings.
  k.box(9.1, y0, 2.2, 9.45, y1, 2.65, M.alu);
  for (let y = y0 + 1.5; y < y1 - 1; y += 2.6) k.box(8.8, y, 2.0, 9.1, y + 0.3, 2.45, M.steel);
  // Keel bridges across the bay floor.
  for (let y = y0 + 2.2; y < y1 - 3; y += 3.1) k.box(5.3, y, -0.5, 5.55, y + 0.25, 2.45, M.alu);
  // The far payload-bay door, opened outward, its radiator panels facing the station.
  const door = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    door.push([9.45 - Math.sin(t * 1.3) * 0.9, 2.7 + t * 4.4]);
  }
  for (let i = 0; i < door.length - 1; i++) {
    const [xa, za] = door[i], [xb, zb] = door[i + 1];
    k.quad([xa, y0, za], [xb, y0, zb], [xb, y1, zb], [xa, y1, za], M.doorRad);
    k.quad([xa - 0.08, y1, za], [xb - 0.08, y1, zb], [xb - 0.08, y0, zb], [xa - 0.08, y0, za], M.tilesWhite);
  }
  // ---------------------------------------------------------------- airlock and docking system
  const AL = mat({ c: '#d8d6cc', c2: '#c0beb2', pat: 'panels', s: 0.8, cut: '#46506a' });
  shellXLocal(k, [[5.4, 0.85, 0.72], [9.4, 0.85, 0.72]], 0.4, AL); // external airlock, its axis along x
  shellXLocal(k, [[9.4, 0.62, 0.5], [11.4, 0.62, 0.5], [11.6, 0.9, 0.5], [12.0, 0.9, 0.5]], 0.0, AL); // ODS tunnel and docking ring
  k.box(5.2, 1.2, -0.5, 6.4, 2.0, 0.7, AL); // tunnel from the middeck hatch
  hatchRing(k, 7.6, 0.4, 0.75, 0.38, M.alu);
  lightBar(k, 7.0, 8.2, 1.05, 0.55, { every: 1.2, r: 2.4, i: 0.7 });
  SP.airlockOrb = [7.4, -0.2, 0.35];
  // ---------------------------------------------------------------- aft fuselage, engines, fin
  const ya = y0, yb = -21.5;
  k.box(4.0, yb, -0.5, 9.4, ya, 2.6, M.tilesWhite, { left: M.tilesBlack, bottom: mat({ c: '#4a4a4e', cut: '#3a4048' }) });
  k.box(4.0, yb, -0.5, 4.06, ya, 2.6, M.tilesBlack);
  // OMS pod on the far side.
  k.box(8.6, -21.3, 1.4, 10.3, -15.8, 2.9, mat({ c: '#efeee6', c2: '#d8d6cc', pat: 'tiles', s: 0.35, cut: '#3a4048' }));
  k.cyl(9.5, -22.2, 2.1, 0.32, 1.0, M.rcc, { r2: 0.22 });
  // Main engines: three bells pointing at the Earth.
  for (const [x, z] of [[8.0, 0.0], [5.9, 1.25], [5.9, -1.25]]) {
    k.lathe([[0.62, -21.5], [0.5, -22.2], [0.75, -23.2], [1.05, -24.0], [1.2, -24.6]], x, z, mat({ c: '#5a5a5e', c2: '#3a3a3e', pat: 'rings', s: 0.12, cut: '#2a2a2e' }), { seg: 18, capTop: false, capBot: false });
  }
  k.box(4.0, -23.4, -0.5, 4.7, -21.5, 2.3, M.tilesBlack); // body flap
  // Fin and rudder, standing out towards the station.
  const fin = [[9.4, -14.6], [19.0, -19.6], [19.0, -21.9], [9.4, -21.5]];
  k.extrude(fin, -0.28, 0.28, mat({ c: '#efeee6', c2: '#dcdad0', pat: 'tiles', s: 0.4, cut: '#3a4048' }));
  k.extrude([[9.4, -14.6], [19.0, -19.6], [19.0, -19.95], [9.4, -15.0]], -0.3, 0.3, M.rcc); // leading edge
  k.extrude([[9.6, -20.6], [18.6, -21.0], [18.6, -21.75], [9.6, -21.45]], -0.3, 0.3, mat({ c: '#e4e2da', cut: '#3a4048' }));
  // ---------------------------------------------------------------- the far wing
  const wing = [[2.6, -2.5], [4.6, -9.5], [11.9, -19.2], [11.9, -20.4], [2.6, -21.0]];
  k.extrudeX(wing, 4.2, 4.75, M.tilesWhite, { end: M.tilesWhite });
  k.extrudeX(wing, 4.0, 4.2, M.tilesBlack, { end: M.tilesBlack });
  k.extrudeX([[2.6, -2.5], [4.6, -9.5], [4.4, -9.5], [2.6, -3.3]], 4.0, 4.78, M.rcc); // leading edge strake
  // Cabin people anchors.
  SP.orbMid = (y, z = 0.9) => [ORB.deck + 0.02, y, z];
  SP.orbFlight = (y, z = 0.9) => [7.07, y, z];
}

// A hollow shell along x about (y = yc, z = 0) used for the airlock and docking tunnel.
function shellXLocal(k, prof, yc, m) {
  const pts = (ro, ri) => {
    const out = [];
    const n = 12, a0 = -Math.PI / 2 - 0.35, a1 = Math.PI / 2 + 0.35;
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * ro, yc + Math.sin(a) * ro]); }
    for (let i = n; i >= 0; i--) { const a = a0 + ((a1 - a0) * i) / n; out.push([Math.cos(a) * ri, yc + Math.sin(a) * ri]); }
    return out;
  };
  k.loft(prof.map(([x, ro, ri]) => ({ x, pts: pts(ro, ri) })), m);
}

