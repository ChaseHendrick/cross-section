/* Panel A: the station's pressurised spine, seen from the port side and cut along its axis.
 *
 * Forward (Endeavour) on the left, Zvezda and ATV-2 on the right; zenith up. y = 0 is the axis
 * of the main module line; z is depth towards starboard. Module positions follow the dossier's
 * zone table (A7 to A26). Fittings inside are placed illustratively unless the dossier says so.
 */
import { mat } from '../../engine/index.js';
import {
  clutter, M, TAU, shellX, shellY, rackInterior, rackFace, laptop, lightBar, handrail, ctb, hatchRing, hatchSquare, bulkhead, lattice, spans,
} from './common.js';

// Module x ranges (Panel A), from the dossier.
export const XA = {
  pma2: [12.0, 13.9], harmony: [13.9, 20.6], destiny: [20.6, 29.8], unity: [29.8, 35.3], pma1: [35.3, 37.1],
  zarya: [37.1, 50.1], ball: [50.0, 53.0], zvezda: [52.9, 61.0], aft: [61.0, 63.2], atv: [63.2, 73.5],
};
export const FEET = -0.92; // where people's feet float in the US modules (deck racks top at -1.05)

const PATCH = ['#c83a2a', '#2a4a8a', '#e8b030', '#2a7a4a', '#7a3a8a', '#d8d2c0', '#1a3a6a', '#b85a2a'];

// ------------------------------------------------------------------ rack front details (back wall, z = 1.05)
function backRack(k, kind, x, yc = 0, z = 1.05) {
  const y0 = yc - 1.0, y1 = yc + 1.0;
  if (kind === 'stow') {
    for (let j = 0; j < 4; j++) ctb(k, x, y0 + 0.05 + j * 0.48, z - 0.34, 0.86, 0.42, 0.34, j % 2 ? M.bag : M.bagB);
  } else if (kind === 'express') {
    rackFace(k, x, y0, y1, z, mat({ c: '#d2d0c8', c2: '#b2b0a6', pat: 'tiles', s: 0.2 }));
    laptop(k, x - 0.1, yc + 0.15, z - 0.62);
  } else if (kind === 'sys') {
    rackFace(k, x, y0, y1, z, mat({ c: '#b4b6b4', c2: '#8e908e', pat: 'grate' }));
    for (const [c, dy] of [['#3a5a9a', 0.3], ['#b84a32', 0.45], ['#d8b040', -0.2]]) k.cyl(x - 0.4, yc + dy, z - 0.06, 0.02, 0.8, mat(c), { axis: 'x', seg: 5 });
  } else if (kind === 'melfi') {
    rackFace(k, x, y0, y1, z, mat({ c: '#f0eee6', c2: '#dcdad2', pat: 'panels', s: 0.5 }));
    for (let j = 0; j < 4; j++) k.cyl(x + (j % 2 ? 0.22 : -0.22), yc - 0.45 + Math.floor(j / 2) * 0.75, z - 0.08, 0.17, 0.05, M.alu, { axis: 'z', seg: 14 });
  } else if (kind === 'cir') {
    rackFace(k, x, y0, y1, z, mat({ c: '#a8aaa8', c2: '#8a8c8a', pat: 'panels', s: 0.33 }));
    k.cyl(x, yc + 0.1, z - 0.09, 0.32, 0.06, mat({ c: '#4a4c50' }), { axis: 'z', seg: 18 });
    k.cyl(x, yc + 0.1, z - 0.11, 0.2, 0.03, mat({ c: '#2a3440', c2: '#7ab0d8', glow: 'night' }), { axis: 'z', seg: 14 });
  } else if (kind === 'blank') {
    rackFace(k, x, y0, y1, z, mat({ c: '#e2ded2', c2: '#cac6ba', pat: 'panels', s: 0.25 }));
  }
}
// Deck rack faces (top surface at y = yc - 1.05).
function deckRack(k, kind, x, yc = 0) {
  const y = yc - 1.05;
  if (kind === 'stow') ctb(k, x, y, 0.1, 0.8, 0.22, 0.75, M.bag);
  else if (kind === 'sys') k.box(x - 0.48, y, 0.05, x + 0.48, y + 0.03, 0.95, mat({ c: '#b4b6b4', c2: '#9a9c9a', pat: 'grate' }));
  else k.box(x - 0.48, y, 0.05, x + 0.48, y + 0.025, 0.95, mat({ c: '#d8d4ca', c2: '#c0bcb0', pat: 'panels', s: 0.32 }));
}

// A standard US module: hull with end cones, rack rows, bulkheads, lights and handrails.
function usModule(k, x0, x1, opt = {}) {
  const c = opt.cone || 0.6, H = opt.hull || M.hullUS;
  shellX(k, [[x0, 1.02, 0.88], [x0 + c, 2.15, 2.0], [x1 - c, 2.15, 2.0], [x1, 1.02, 0.88]], 0, H, 16);
  const i0 = x0 + c, i1 = x1 - c;
  rackInterior(k, i0, i1, 0, { gaps: opt.gaps });
  clutter(k, i0 + 0.1, i1 - 0.1, 0, 'us' + x0);
  bulkhead(k, i0 + 0.05, 0);
  bulkhead(k, i1 - 0.05, 0);
  lightBar(k, i0 + 0.3, i1 - 0.3, 0.98, 0.92, { every: 2.0, r: 4.0, i: 1.0 });
  handrail(k, i0 + 0.3, i1 - 0.3, -0.75, 1.0);
  handrail(k, i0 + 0.3, i1 - 0.3, 0.75, 1.0);
  // Exterior: gold EVA handrails along the top and bottom, and a few blanket straps.
  const HR = mat({ c: '#d8b040', cut: '#8a7020' });
  for (const sy of [1, -1]) for (const z of [0.55, 1.35]) {
    const y = sy * (Math.sqrt(2.15 * 2.15 - z * z) + 0.12);
    for (let x = i0 + 0.3; x < i1 - 1.2; x += 1.6) {
      k.cyl(x, y, z, 0.022, 1.1, HR, { axis: 'x', seg: 5 });
      for (const xx of [x + 0.05, x + 1.05]) k.box(xx - 0.02, Math.min(y, y - sy * 0.12), z - 0.02, xx + 0.02, Math.max(y, y - sy * 0.12), z + 0.02, HR);
    }
  }
  return { i0, i1 };
}

// ------------------------------------------------------------------ build
export function buildSpine(k, SP, PARTS) {
  const r = k.rng('spine');
  // ---------------------------------------------------------------- PMA-2: crooked cone tunnel
  pma(k, 12.0, 13.9, -1);
  // ---------------------------------------------------------------- Harmony (Node 2)
  {
    const [x0, x1] = XA.harmony;
    const cq = [14.62, 15.72];
    const { i0, i1 } = usModule(k, x0, x1, { gaps: { back: [cq] } });
    // Crew quarters ring in the forward rack bay: starboard booth (closed door, seen from the front),
    // overhead and deck booths cut through by the section.
    const CQ = mat({ c: '#d9dde2', c2: '#c4c8ce', pat: 'panels', s: 0.5, cut: '#6a707a' });
    const door = mat({ c: '#c8ccd2', c2: '#f4e8c8', pat: 'quilt', s: 0.33, glow: 'night' });
    k.box(cq[0], -1.0, 0.72, cq[1], 1.0, 1.75, CQ);
    k.box(cq[0] + 0.05, -0.95, 0.7, cq[1] - 0.05, 0.95, 0.72, door);
    k.box(cq[0], 0.75, -0.5, cq[1], 1.75, 1.05, CQ); // overhead CQ (bump-out into the aisle)
    k.box(cq[0] + 0.06, 0.82, -0.5, cq[1] - 0.06, 1.68, 0.98, mat({ c: '#4a5a7a', c2: '#3a4a6a', pat: 'quilt', s: 0.2, cut: '#2a3448' }));
    k.box(cq[0], -1.75, -0.5, cq[1], -0.75, 1.05, CQ); // deck CQ
    k.box(cq[0] + 0.06, -1.68, -0.5, cq[1] - 0.06, -0.82, 0.98, mat({ c: '#5a6a4a', c2: '#4a5a3a', pat: 'quilt', s: 0.2, cut: '#2a3428' }));
    // Racks: eight in Harmony.
    const kinds = ['stow', 'sys', 'express', 'stow'];
    for (let i = 0; i < 4; i++) { const x = 16.27 + i * 1.05; if (x < i1 - 0.4) backRack(k, kinds[i], x); deckRack(k, i % 2 ? 'sys' : 'stow', x); }
    // Hatch to Columbus on the starboard wall (behind it, Columbus: see the right-hand view).
    hatchSquare(k, 18.4, 0, 1.03, 1.0);
    SP.harmonyCol = [18.4, FEET, 0.7];
    void i0;
  }
  // ---------------------------------------------------------------- Destiny (US Lab)
  {
    const [x0, x1] = XA.destiny;
    const win = [24.7, 25.75];
    const { i0, i1 } = usModule(k, x0, x1, { gaps: { deck: [win] } });
    const kinds = ['express', 'cir', 'melfi', 'sys', 'express', 'stow', 'sys'];
    for (let i = 0; i < 7; i++) { const x = i0 + 0.55 + i * 1.08; if (x < i1 - 0.4) backRack(k, kinds[i], x); }
    for (let i = 0; i < 7; i++) { const x = i0 + 0.55 + i * 1.08; if (x < i1 - 0.4 && (x < win[0] - 0.4 || x > win[1] + 0.4)) deckRack(k, i % 3 ? 'blank' : 'sys', x); }
    // The Earth-facing science window, in its rack bay in the deck.
    const wx = (win[0] + win[1]) / 2;
    k.box(win[0], -1.9, -0.5, win[1], -1.75, 1.05, M.bulk);
    k.cyl(wx, -1.76, 0.5, 0.36, 0.06, M.alu, { seg: 20 });
    k.cyl(wx, -1.72, 0.5, 0.26, 0.03, mat({ c: '#3a6a9a', c2: '#2a4a6a', pat: 'speckle' }), { seg: 20 });
    k.box(win[0], -1.75, 0.9, win[1], -1.05, 1.05, M.rackDark);
    // CEVIS exercise bicycle, bolted to the deck: no seat.
    const cv = 22.5;
    k.box(cv - 0.35, -1.05, 0.25, cv + 0.35, -0.95, 0.85, M.steel);
    k.box(cv - 0.08, -0.95, 0.45, cv + 0.08, -0.6, 0.65, M.steel);
    k.cyl(cv, -0.68, 0.38, 0.17, 0.06, M.black, { axis: 'z', seg: 14 });
    k.box(cv + 0.2, -0.95, 0.5, cv + 0.25, -0.15, 0.6, M.steel);
    k.box(cv + 0.1, -0.2, 0.3, cv + 0.45, -0.15, 0.8, M.black); // handlebar
    PARTS.cevis = k.part(cv, -0.68, 0.36, (q) => {
      q.box(-0.02, -0.17, -0.03, 0.02, 0.17, 0, M.black);
      q.box(-0.1, 0.15, -0.05, 0.1, 0.18, -0.02, M.alu);
      q.box(-0.1, -0.18, 0.06, 0.1, -0.15, 0.09, M.alu);
    });
    SP.cevis = [cv - 0.05, -0.9, 0.55];
    // Robonaut 2 aboard, packed in its foam-lined box, not yet switched on.
    k.box(28.0, -1.05, 0.25, 28.9, -0.45, 0.95, mat({ c: '#e8dcbc', c2: '#cfc29e', pat: 'canvas', cut: '#8a7e64' }));
    k.box(28.05, -0.45, 0.3, 28.85, -0.4, 0.9, mat({ c: '#d8ccaa' }));
    SP.robonaut = [28.45, -0.4, 0.6];
    // Laptop station where the systems are watched.
    laptop(k, 26.9, 0.15, 0.4);
    SP.destinyLaptop = [26.9, FEET, 0.35];
    SP.destinyWin = [wx, -1.72, 0.5];
    // Nail clippings on an air intake: a small mesh grille with a few specks.
    k.box(23.6, 0.55, 1.0, 24.0, 0.85, 1.04, mat({ c: '#c8c8c0', c2: '#9a9a92', pat: 'grate' }));
    for (let i = 0; i < 4; i++) k.box(23.65 + i * 0.08, 0.6 + (i % 2) * 0.12, 0.995, 23.67 + i * 0.08, 0.61 + (i % 2) * 0.12, 1.0, mat('#f2e6d0'));
    SP.intake = [23.8, 0.7, 1.0];
    // S0 truss mount on the roof.
    for (const x of [23.2, 27.2]) k.box(x - 0.15, 2.1, 0.2, x + 0.15, 3.05, 2.2, M.trussDark);
  }
  // ---------------------------------------------------------------- Unity (Node 1): crossroads and dining room
  {
    const [x0, x1] = XA.unity;
    const hx = 32.55, hg = [hx - 0.65, hx + 0.65];
    usModule(k, x0, x1, { cone: 0.55, gaps: { deck: [hg], back: [hg] } });
    // Nadir hatchway down into Leonardo; starboard hatchway into Quest (a dark doorway).
    k.box(hg[0], -1.98, 1.05, hg[1], 1.0, 1.95, mat({ c: '#3a3e46', cut: '#2a2e36' }));
    hatchSquare(k, hx, 0, 1.03, 1.15);
    k.box(hg[0] - 0.05, -2.2, -0.5, hg[0], -1.05, 1.05, M.bulk);
    k.box(hg[1], -2.2, -0.5, hg[1] + 0.05, -1.05, 1.05, M.bulk);
    // Zenith hatch (closed): Z1 above.
    hatchSquare(k, hx, 1.05, 0.5, 0.9);
    // The wall of mission patches, either side of the Quest hatch (one gap, waiting).
    let pi = 0;
    for (const side of [-1, 1]) for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
      if (side === 1 && j === 1 && i === 1) continue; // the gap
      const x = hx + side * (0.95 + i * 0.32), y = -0.6 + j * 0.42;
      k.cyl(x, y, 1.0, 0.12, 0.03, mat(PATCH[pi++ % PATCH.length]), { axis: 'z', seg: 10 });
      k.cyl(x, y, 0.995, 0.07, 0.01, mat(PATCH[(pi + 3) % PATCH.length]), { axis: 'z', seg: 8 });
    }
    SP.patchGap = [hx + 1.27, -0.18, 1.0];
    // Galley table on a post from the deck, food packets Velcroed on, water dispenser and food warmer on the wall.
    const tx = 31.15;
    k.cyl(tx, -1.05, 0.55, 0.05, 0.75, M.alu, { seg: 8 });
    k.box(tx - 0.55, -0.32, 0.15, tx + 0.55, -0.27, 0.95, mat({ c: '#c8c4b8', c2: '#aaa69a', pat: 'panels', s: 0.36, cut: '#6a665a' }));
    const pk = ['#d84a3a', '#e8c040', '#5a9a4a', '#f0eee6', '#c87a3a', '#6a8ac8'];
    for (let i = 0; i < 7; i++) k.box(tx - 0.45 + i * 0.13, -0.27, 0.25 + (i % 3) * 0.2, tx - 0.37 + i * 0.13, -0.24, 0.37 + (i % 3) * 0.2, mat(pk[i % pk.length]));
    k.box(30.45, -0.3, 0.75, 30.85, 0.35, 1.05, mat({ c: '#b8bcc0', c2: '#9a9ea2', pat: 'panels', s: 0.2 })); // potable water dispenser
    k.box(30.45, 0.4, 0.8, 30.85, 0.75, 1.05, mat({ c: '#c8c0b0', c2: '#aaa290', pat: 'tiles', s: 0.12 })); // food warmer
    // A magnetic word-game board on the wall.
    k.box(33.95, 0.1, 1.0, 34.45, 0.6, 1.04, mat({ c: '#d8c8a0', c2: '#b8a880', pat: 'checker', s: 0.05 }));
    SP.scrabble = [34.2, 0.35, 1.0];
    SP.unityTable = tx;
    SP.unityQuest = [hx, FEET, 0.75];
    // Leonardo below: the hatch frame in the deck.
    for (const x of hg) k.box(x - 0.03, -2.0, 0.0, x + 0.03, -1.05, 1.0, M.alu);
  }
  // ---------------------------------------------------------------- Leonardo PMM (storeroom on Unity's nadir port)
  {
    const cx = 32.55, y0 = -8.8, y1 = -2.15;
    shellY(k, [[y0, 1.25, 1.1], [y0 + 0.6, 2.25, 2.1], [y1 - 0.6, 2.25, 2.1], [y1, 1.05, 0.9]], cx, mat({ c: '#e6e2d6', c2: '#d0ccbe', pat: 'panels', s: 1.0, cut: '#46506a' }), { seg: 22 });
    const a = 1.0, e = 1.8, ya = y0 + 0.65, yb = y1 - 0.65;
    k.box(cx - e, ya, -0.5, cx - a, yb, a, M.rack); // left row
    k.box(cx + a, ya, -0.5, cx + e, yb, a, M.rack); // right row
    k.box(cx - a, ya, a, cx + a, yb, e, M.rack); // back row
    for (let j = 0; j < 5; j++) {
      const y = ya + 0.1 + j * 0.98;
      for (let i = 0; i < 2; i++) ctb(k, cx - 0.45 + i * 0.9, y, 0.6, 0.82, 0.42, 0.4, (i + j) % 2 ? M.bag : M.bagB);
      ctb(k, cx - a - 0.2, y + 0.45, 0.1, 0.36, 0.42, 0.7, M.bagB);
      ctb(k, cx + a + 0.2, y, 0.1, 0.36, 0.42, 0.7, M.bag);
    }
    // Bags packed into the end cone.
    for (let i = 0; i < 4; i++) ctb(k, cx - 0.9 + i * 0.6, y0 + 0.35, 0.1 + (i % 2) * 0.3, 0.55, 0.35, 0.6, i % 2 ? M.bag : M.bagB);
    lightBar(k, cx - 0.4, cx + 0.4, -3.5, 0.95, { every: 0.8, r: 3.0, i: 0.7 });
    lightBar(k, cx - 0.4, cx + 0.4, -6.4, 0.95, { every: 0.8, r: 3.0, i: 0.7 });
    SP.leo = (y) => [cx - 0.2, y, 0.45];
  }
  // ---------------------------------------------------------------- Z1 truss with the control moment gyroscopes
  {
    const x0 = 30.45, x1 = 34.65, y0 = 2.3, y1 = 6.75;
    lattice(k, 'x', x0, x1, (y0 + y1) / 2, 1.0, y1 - y0, 2.6, M.truss, 1.4, { t: 0.13 });
    k.box(x0, y0 - 0.15, -0.3, x1, y0, 2.3, M.trussDark);
    PARTS.cmg = [];
    for (const [x, y] of [[31.5, 3.55], [33.6, 3.55], [31.5, 5.55], [33.6, 5.55]]) {
      shellZ(k, x, y, 0.62, 0.52, -0.2, 1.4, mat({ c: '#d8d4c8', c2: '#c0bcb0', pat: 'rivets', s: 0.3, cut: '#6a6a72' }));
      k.cyl(x, y, 1.2, 0.52, 0.12, M.steel, { axis: 'z', seg: 18 });
      PARTS.cmg.push(k.part(x, y, 0.75, (q) => {
        q.cyl(0, 0, 0, 0.46, 0.14, mat({ c: '#8a9098', c2: '#c8ccd2', pat: 'rings', s: 0.07 }), { axis: 'z', seg: 18 });
        q.box(-0.45, -0.03, -0.01, 0.45, 0.03, 0.15, mat('#4a4e56'));
        q.cyl(0, 0, -0.05, 0.08, 0.3, M.alu, { axis: 'z', seg: 8 });
      }));
    }
    SP.cmg = [32.55, 4.55, 0.6];
  }
  // ---------------------------------------------------------------- PMA-1
  pma(k, 35.3, 37.1, 1);
  // ---------------------------------------------------------------- Zarya (FGB): storage and propulsion
  {
    const x0 = 37.1, x1 = 50.1;
    const RU = M.hullRU;
    shellX(k, [[x0, 0.75, 0.6], [37.5, 1.45, 1.3], [41.0, 1.45, 1.3], [42.4, 2.05, 1.9], [49.6, 2.05, 1.9], [x1, 1.2, 1.05]], 0, RU, 16);
    rackInterior(k, 37.5, 41.0, 0, { a: 0.92, ri: 1.28, rack: M.ruWall, deck: M.ruFloor, over: M.ruCeil, gaps: { deck: [[38.9, 40.3]] }, standoff: M.ruWall });
    rackInterior(k, 42.4, 49.6, 0, { a: 1.0, ri: 1.88, rack: M.ruWall, deck: M.ruFloor, over: M.ruCeil, standoff: M.ruWall });
    // Cone section lining.
    k.box(41.0, -1.25, -0.5, 42.4, -0.92, 1.0, M.ruFloor);
    k.box(41.0, 0.92, -0.5, 42.4, 1.25, 1.0, M.ruCeil);
    // Stowage everywhere: bags strapped to the walls and floor, food containers.
    for (let i = 0; i < 12; i++) {
      const x = 42.7 + i * 0.58;
      ctb(k, x, -0.95 + (i % 3) * 0.62, 0.62, 0.5, 0.5, 0.38, i % 2 ? M.bag : M.bagB);
      if (i % 2) ctb(k, x, -1.0, 0.05, 0.5, 0.25, 0.5, M.bagB);
    }
    for (let i = 0; i < 5; i++) ctb(k, 37.9 + i * 0.62, 0.35, 0.55, 0.5, 0.45, 0.35, i % 2 ? M.bagB : M.bag);
    k.lamp(45.0, 0.7, 0.6, { color: '#f4ecd0', r: 3.2, i: 0.55, bulb: false, halo: 0.3 });
    k.lamp(39.2, 0.6, 0.5, { color: '#f4ecd0', r: 2.6, i: 0.5, bulb: false, halo: 0.25 });
    k.box(44.5, 0.95, 0.3, 45.5, 1.0, 0.7, M.light);
    k.box(38.8, 0.86, 0.2, 39.6, 0.92, 0.6, M.light);
    // Propellant tanks between the hull and the lining (16 tanks in all): a row seen in the cut.
    for (let i = 0; i < 5; i++) k.cyl(43.2 + i * 1.3, -1.58, -0.4, 0.22, 1.2, mat({ c: '#c8c4b0', cut: '#6a6a5a' }), { axis: 'z', seg: 10 });
    // Dust-collector filter panel (one of Oleg's jobs today).
    k.box(47.6, 0.3, 0.98, 48.2, 0.8, 1.02, mat({ c: '#d8d8d0', c2: '#a8a8a0', pat: 'grate' }));
    SP.zaryaFilter = [47.9, -0.95, 0.5];
    // Exterior: docking target, antennas.
    k.cyl(46.0, 2.05, 0.6, 0.04, 0.9, M.alu, { seg: 5 });
  }
  // ---------------------------------------------------------------- Rassvet (MRM1) and Soyuz TMA-20 below Zarya
  {
    const cx = 39.6;
    shellY(k, [[-8.05, 0.8, 0.66], [-7.6, 1.175, 1.04], [-2.1, 1.175, 1.04], [-1.4, 0.75, 0.62]], cx, mat({ c: '#d6d8ca', c2: '#c0c4b2', pat: 'panels', s: 0.7, cut: '#4a5446' }), { seg: 18 });
    k.box(cx - 1.0, -7.5, 0.55, cx + 1.0, -2.2, 0.98, mat({ c: '#c6d0b4', c2: '#b0ba9e', pat: 'tiles', s: 0.45, cut: '#6a7462' }));
    for (let j = 0; j < 4; j++) ctb(k, cx - 0.45 + (j % 2) * 0.45, -7.3 + j * 1.25, 0.3, 0.42, 0.5, 0.25, j % 2 ? M.bag : M.bagB);
    k.lamp(cx, -4.2, 0.5, { color: '#f4ecd0', r: 2.6, i: 0.55, bulb: false, halo: 0.3 });
    k.box(cx - 0.3, -4.0, 0.95, cx + 0.3, -3.95, 1.0, M.light);
    // Outside: a spare robot-arm elbow strapped to the hull (illustrative).
    k.box(cx + 1.15, -6.4, 0.2, cx + 1.45, -4.2, 0.6, M.alu);
    soyuz(k, cx, -8.05, -1, SP, 'tma20', PARTS);
  }
  // ---------------------------------------------------------------- Zvezda: transfer ball, Poisk and Soyuz TMA-21 above, Pirs and Progress below
  {
    const bx = 51.5;
    const prof = [];
    for (let i = 0; i <= 10; i++) { const x = 50.0 + i * 0.3; const d = x - bx; prof.push([x, Math.max(0.62, Math.sqrt(Math.max(0, 1.55 * 1.55 - d * d))), Math.max(0.5, Math.sqrt(Math.max(0, 1.42 * 1.42 - d * d)))]); }
    shellX(k, prof, 0, M.hullRU, 16);
    k.box(50.5, -0.95, -0.5, 52.5, -0.9, 0.9, M.ruFloor);
    k.lamp(bx, 0.9, 0.5, { color: '#f4ecd0', r: 2.4, i: 0.6, bulb: false, halo: 0.25 });
    // Poisk (MRM2) up, Pirs (DC-1) down: near twins, Orlan suits stored inside.
    const RUi = mat({ c: '#c8d4b8', c2: '#b2bea0', pat: 'panels', s: 0.5, cut: '#6a7462' });
    for (const [s, name] of [[1, 'poisk'], [-1, 'pirs']]) {
      const ya = s * 1.35, yb = s * 7.0;
      shellY(k, s > 0 ? [[1.35, 0.95, 0.8], [2.1, 1.275, 1.13], [7.0, 1.275, 1.13]] : [[-7.0, 1.275, 1.13], [-2.1, 1.275, 1.13], [-1.35, 0.95, 0.8]], bx, M.hullRU, { seg: 18 });
      k.box(bx - 1.05, Math.min(ya, yb) + 0.3, 0.75, bx + 1.05, Math.max(ya, yb) - 0.3, 1.1, RUi);
      // Two Orlan suits, entered from the back through the backpack door.
      for (const dx of [-0.48, 0.48]) orlan(k, bx + dx, s > 0 ? 4.1 : -6.1, 0.55);
      // EVA hatch (round) on the far wall and a window.
      hatchRing(k, bx, s * 3.0, 1.08, 0.4, M.alu);
      k.lamp(bx, s * 5.6, 0.5, { color: '#f4ecd0', r: 2.4, i: 0.6, bulb: false, halo: 0.25 });
      k.box(bx - 0.25, s * 5.6 - 0.05, 1.05, bx + 0.25, s * 5.6 + 0.05, 1.08, M.light);
      SP[name] = [bx - 0.2, s > 0 ? 2.7 : -3.4, 0.45];
    }
    // The Strela cargo boom, folded along Pirs.
    k.cyl(bx + 1.35, -6.6, 0.4, 0.09, 5.2, M.alu, { seg: 8 });
    k.cyl(bx + 1.35, -6.6, 0.4, 0.14, 0.5, M.steel, { seg: 8 });
    soyuz(k, bx, 7.0, 1, SP, 'tma21', PARTS);
    progress(k, bx, -7.0, SP, PARTS);
  }
  // ---------------------------------------------------------------- Zvezda working compartment
  {
    const RU = M.hullRU;
    shellX(k, [[52.9, 1.45, 1.3], [56.4, 1.45, 1.3], [57.2, 2.1, 1.95], [61.0, 2.1, 1.95]], 0, RU, 16);
    rackInterior(k, 52.95, 56.4, 0, { a: 0.95, ri: 1.28, rack: M.ruWall, deck: M.ruFloor, over: M.ruCeil, standoff: M.ruWall, gaps: { deck: [[54.0, 55.6]] } });
    rackInterior(k, 57.2, 61.0, 0, { a: 1.05, ri: 1.93, rack: M.ruWall, deck: M.ruFloor, over: M.ruCeil, standoff: M.ruWall, gaps: { back: [[57.35, 58.45], [60.0, 60.95]] } });
    k.box(56.4, -1.3, -0.5, 57.2, -0.95, 1.0, M.ruFloor);
    k.box(56.4, 0.95, -0.5, 57.2, 1.3, 1.0, M.ruCeil);
    // TVIS treadmill set into the floor of the forward section.
    k.box(54.0, -1.25, -0.5, 55.6, -1.05, 0.95, M.steel);
    k.box(54.05, -1.05, 0.05, 55.55, -0.98, 0.85, mat({ c: '#2a2a2e', c2: '#4a4a4e', pat: 'stripes', s: 0.08 }));
    for (const x of [54.1, 55.5]) k.box(x - 0.03, -0.98, 0.05, x + 0.03, -0.1, 0.12, M.steel);
    SP.tvis = [54.8, -0.98, 0.45];
    // Caution and warning panel with its clock, the Toru docking control post, the greenhouse.
    k.box(53.1, 0.15, 0.78, 53.8, 0.75, 0.83, mat({ c: '#3a3c40', c2: '#d84a3a', pat: 'tiles', s: 0.08 }));
    k.cyl(53.45, 0.82, 0.8, 0.09, 0.03, mat({ c: '#f0ece0' }), { axis: 'z', seg: 12 });
    k.box(53.95, -0.2, 0.78, 54.6, 0.35, 0.83, mat({ c: '#4a4c50', c2: '#2a2c30', pat: 'panels', s: 0.2 }));
    k.box(54.05, -0.05, 0.6, 54.15, 0.05, 0.78, M.black);
    k.box(54.4, -0.05, 0.6, 54.5, 0.05, 0.78, M.black);
    k.box(54.0, 0.36, 0.76, 54.55, 0.62, 0.79, M.screenNight);
    SP.cwPanel = [53.45, -0.95, 0.4];
    // VELO bicycle ergometer on the floor of the forward section (no seat).
    k.box(52.95, -0.95, 0.25, 53.75, -0.88, 0.75, M.steel);
    k.box(53.3, -0.88, 0.42, 53.4, -0.6, 0.58, M.steel);
    k.cyl(53.35, -0.62, 0.36, 0.14, 0.05, M.black, { axis: 'z', seg: 12 });
    k.box(53.55, -0.88, 0.45, 53.6, -0.15, 0.55, M.steel);
    k.box(53.45, -0.2, 0.3, 53.75, -0.15, 0.7, M.black);
    SP.velo = [53.25, -0.86, 0.5];
    // Lada greenhouse: a small box of seedlings under its own lamp.
    k.box(55.2, 0.15, 0.62, 56.05, 0.72, 0.88, mat({ c: '#d8d8d0', c2: '#c0c0b8', pat: 'panels', s: 0.4 }));
    k.box(55.25, 0.2, 0.6, 56.0, 0.3, 0.84, mat({ c: '#6a4a2a' }));
    for (let i = 0; i < 9; i++) { const x = 55.32 + i * 0.08; k.cyl(x, 0.3, 0.68 + (i % 3) * 0.06, 0.008, 0.12 + (i % 4) * 0.03, mat('#5a9a3a'), { seg: 4 }); k.sphere(x, 0.43 + (i % 4) * 0.03, 0.68 + (i % 3) * 0.06, 0.03, mat('#6aaa42'), { seg: 5, rings: 3 }); }
    k.box(55.2, 0.66, 0.6, 56.05, 0.7, 0.88, mat({ c: '#f8f0d0', c2: '#fff4c0', glow: 'always' }));
    k.lamp(55.6, 0.6, 0.55, { color: '#f8f0c8', r: 1.2, i: 0.5, always: false, bulb: false, halo: 0.2 });
    SP.lada = [55.6, -0.95, 0.4];
    // Body-mass measuring device: a spring-mounted frame.
    k.box(56.55, -0.95, 0.5, 56.65, 0.4, 0.6, M.steel);
    k.box(56.4, 0.35, 0.45, 56.8, 0.45, 0.75, M.steel);
    // Kayutas: two crew cabins, each with its own small window. The starboard one, seen from the
    // front with its curtain drawn back; the port one is cut through by the section.
    const KY = mat({ c: '#e4dcc4', c2: '#cfc6aa', pat: 'panels', s: 0.45, cut: '#7a7462' });
    k.box(57.35, -1.05, 1.62, 58.45, 1.0, 1.75, KY);
    k.box(57.35, -1.05, 0.9, 57.42, 1.0, 1.65, KY);
    k.box(58.38, -1.05, 0.9, 58.45, 1.0, 1.65, KY);
    k.cyl(57.9, 0.45, 1.6, 0.13, 0.04, mat({ c: '#2a3a4a', c2: '#ffe0a0', glow: 'night' }), { axis: 'z', seg: 12 });
    k.box(57.45, -0.95, 1.5, 58.35, 0.9, 1.6, mat({ c: '#7a5a8a', c2: '#6a4a7a', pat: 'quilt', s: 0.22 })); // sleeping bag
    k.box(57.75, -0.1, 1.58, 57.95, 0.2, 1.6, mat({ c: '#f4f0e6' })); // paper calendar, crossed off in red
    for (let i = 0; i < 5; i++) k.box(57.77 + (i % 3) * 0.06, 0.12 - Math.floor(i / 3) * 0.08, 1.575, 57.81 + (i % 3) * 0.06, 0.13 - Math.floor(i / 3) * 0.08, 1.58, M.red);
    k.box(57.4, 0.92, 0.95, 57.48, 1.0, 1.55, mat({ c: '#c84a3a' })); // curtain, drawn back
    k.lamp(57.9, 0.7, 1.3, { color: '#ffe8c0', r: 1.4, i: 0.5, bulb: true, bulbR: 0.04, halo: 0.2 });
    SP.kayutaS = [57.9, -0.95, 1.25];
    // The port kayuta faces it across the aisle; the section cuts it open, so only its walls show.
    for (const x of [57.35, 58.4]) k.box(x, -1.05, -0.5, x + 0.05, 1.0, 0.12, KY);
    k.box(57.35, 0.95, -0.5, 58.45, 1.0, 0.12, KY);
    SP.kayutaP = [57.9, -0.95, 0.32];
    // Galley table on the floor, with a food warmer; the toilet compartment at the aft end.
    const tx = 59.4;
    k.box(tx - 0.08, -1.05, 0.45, tx + 0.08, -0.35, 0.6, M.steel);
    k.box(tx - 0.5, -0.38, 0.2, tx + 0.5, -0.3, 0.85, mat({ c: '#b8b0a0', c2: '#a0988a', pat: 'panels', s: 0.3, cut: '#6a6458' }));
    for (let i = 0; i < 5; i++) k.box(tx - 0.4 + i * 0.17, -0.3, 0.35 + (i % 2) * 0.25, tx - 0.32 + i * 0.17, -0.26, 0.45 + (i % 2) * 0.25, mat(['#d84a3a', '#e8c040', '#5a9a4a', '#f0eee6', '#6a8ac8'][i]));
    SP.zvTable = tx;
    k.box(60.0, -1.05, 0.95, 60.95, 1.0, 1.85, mat({ c: '#d0d4c4', c2: '#b8bcac', pat: 'panels', s: 0.45, cut: '#6a7462' }));
    k.box(60.05, -1.0, 0.92, 60.9, 0.95, 0.95, mat({ c: '#8a9aaa', c2: '#7a8a9a', pat: 'canvas', s: 0.12 })); // curtain
    SP.zvToilet = [60.5, -0.95, 0.6];
    // A vacuum cleaner with its hose, ready for haircuts.
    k.box(58.9, -1.05, 0.7, 59.15, -0.82, 0.9, mat({ c: '#c8c0a8', c2: '#aaa290', pat: 'grate' }));
    k.tube([[59.0, -0.82, 0.8], [58.8, -0.5, 0.75], [58.6, 0.0, 0.65], [58.45, 0.35, 0.6]], 0.025, mat('#4a4a50'));
    // Elektron oxygen generator and Vozdukh carbon-dioxide scrubber: equipment behind wall panels.
    k.box(56.6, -0.85, 1.6, 57.25, 0.3, 1.75, mat({ c: '#b8c0b0', c2: '#9aa292', pat: 'grate' }));
    k.cyl(56.9, 0.4, 1.6, 0.06, 0.6, M.steel, { axis: 'z', seg: 6 });
    SP.elektron = [56.9, 0.0, 1.6];
    // Lights.
    lightBar(k, 53.2, 56.2, 0.92, 0.6, { every: 1.5, r: 3.0, i: 0.85, color: '#f4ecd8' });
    lightBar(k, 57.5, 60.8, 1.0, 0.9, { every: 1.6, r: 3.4, i: 0.9, color: '#f4ecd8' });
    handrail(k, 57.5, 60.8, 0.75, 1.0);
    // Portholes on the visible hull (Zvezda has several windows).
    for (const x of [53.6, 55.4]) k.cyl(x, 1.42, 0.5, 0.11, 0.06, mat({ c: '#22303a', c2: '#ffe0a0', glow: 'night' }), { axis: 'y', seg: 10 });
    // Aft transfer chamber and the docking port where ATV-2 is attached.
    shellX(k, [[61.0, 1.1, 0.95], [63.2, 1.1, 0.95]], 0, RU, 14);
    k.box(61.05, -0.95, -0.5, 63.15, -0.9, 0.8, M.ruFloor);
    k.lamp(62.1, 0.5, 0.5, { color: '#f4ecd8', r: 2.0, i: 0.5, bulb: false, halo: 0.2 });
    // Zvezda's own solar wings: only the far wing is drawn, receding in depth.
    PARTS.zvWing = zvezdaWing(k);
    // Zvezda's thrusters: small nozzle clusters at the aft end (puffs are emitted in setup).
    for (const [y, z] of [[1.6, 0.6], [-1.6, 0.6]]) k.cyl(60.7, y, z, 0.1, 0.25, M.black, { axis: 'y', seg: 6 });
  }
  // ---------------------------------------------------------------- ATV-2 Johannes Kepler
  {
    const x0 = 63.2, x1 = 73.5;
    shellX(k, [[x0, 0.6, 0.48], [64.0, 0.9, 0.75], [65.0, 2.25, 2.1], [68.6, 2.25, 2.1]], 0, M.atv, 16);
    shellX(k, [[68.6, 2.25, 2.15], [x1, 2.25, 2.15]], 0, M.atvGold, 16);
    k.box(68.55, -2.1, -0.5, 68.65, 2.1, 2.1, M.bulk);
    rackInterior(k, 65.1, 68.5, 0, { a: 1.05, ri: 2.05 });
    for (let i = 0; i < 3; i++) { const x = 65.6 + i * 1.05; backRack(k, i === 1 ? 'stow' : 'blank', x); deckRack(k, 'stow', x); }
    for (let i = 0; i < 4; i++) ctb(k, 65.5 + i * 0.75, 0.0, 0.3, 0.6, 0.4, 0.45, i % 2 ? M.bag : M.bagB);
    lightBar(k, 65.4, 68.3, 0.98, 0.92, { every: 1.5, r: 3.0, i: 0.8 });
    // Propulsion bay: propellant tanks and the four main engines.
    for (const [x, y] of [[69.8, 0.9], [69.8, -0.9], [71.8, 0.9], [71.8, -0.9]]) k.sphere(x, y, 0.6, 0.78, mat({ c: '#c8c8c0', c2: '#aaaaa2', pat: 'rings', s: 0.2, cut: '#5a5a5a' }), { seg: 14, rings: 9 });
    for (const [y, z] of [[0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) k.cyl(73.5, y, z, 0.18, 0.45, mat({ c: '#4a4a4e', cut: '#2a2a2e' }), { axis: 'x', r2: 0.26, seg: 10 });
    PARTS.atvWings = atvWings(k);
    SP.atv = [66.2, FEET, 0.6];
  }
  // ---------------------------------------------------------------- Columbus and Quest behind the spine (outsides only)
  k.cyl(17.25, 0, 2.1, 2.25, 6.9, M.hullEU, { axis: 'z', seg: 22 });
  k.cyl(32.55, 0, 2.1, 2.0, 3.3, M.hullUS, { axis: 'z', seg: 20 });
  k.cyl(32.55, 0, 5.4, 1.2, 2.3, M.hullUS, { axis: 'z', seg: 16 });
  void r; void TAU; void spans;
}

// A Pressurised Mating Adapter: "a series of offset aluminum cylinders" (dir: which end is wider).
function pma(k, x0, x1, dir) {
  const L = x1 - x0, n = 3;
  for (let i = 0; i < n; i++) {
    const a = x0 + (L * i) / n, b = x0 + (L * (i + 1)) / n;
    const t = dir > 0 ? i / (n - 1) : 1 - i / (n - 1);
    const r = 0.95 - t * 0.27, yc = [0, -0.18, 0][i];
    shellX(k, [[a, r, r - 0.13], [b, r, r - 0.13]], yc, M.hullPMA, 12);
  }
  k.box(x0 + 0.1, -0.68, -0.5, x1 - 0.1, -0.62, 0.55, mat({ c: '#c8c4b8', c2: '#aaa69a', pat: 'panels', s: 0.4 }));
  k.lamp((x0 + x1) / 2, 0.45, 0.4, { color: '#dfe8ff', r: 1.8, i: 0.45, bulb: false, halo: 0.2 });
}

// A short shell along z (CMG housings).
function shellZ(k, x, y, ro, ri, z0, z1, m) {
  const n = 16, pts = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * TAU; pts.push([x + Math.cos(a) * ro, y + Math.sin(a) * ro]); }
  const hole = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * TAU; hole.push([x + Math.cos(a) * ri, y + Math.sin(a) * ri]); }
  pts.pop(); hole.pop();
  k.extrude(pts, z0, z1, m, { holes: [hole], front: false });
}

// An Orlan spacesuit standing in its stowage spot: rigid white torso, helmet, arms, backpack door.
function orlan(k, x, y, z) {
  const W = mat({ c: '#f0eee6', c2: '#dcdad0', pat: 'canvas', s: 0.15, cut: '#9a9890' });
  k.box(x - 0.24, y, z, x + 0.24, y + 0.75, z + 0.42, W);
  k.sphere(x, y + 0.92, z + 0.2, 0.2, W, { seg: 10, rings: 6 });
  k.cyl(x, y + 0.92, z + 0.0, 0.13, 0.02, mat({ c: '#c8a040', c2: '#e8c060' }), { axis: 'z', seg: 10 });
  for (const s of [-1, 1]) k.box(x + s * 0.24, y + 0.1, z + 0.1, x + s * 0.36, y + 0.7, z + 0.3, W);
  for (const s of [-1, 1]) k.box(x + s * 0.12 - 0.07, y - 0.75, z + 0.08, x + s * 0.12 + 0.07, y, z + 0.32, W);
}

// Soyuz: orbital module (nearest the station), descent module, instrument module with two wings.
// dir -1: hanging below (Earth side), +1 standing above.
function soyuz(k, cx, yDock, dir, SP, name, PARTS) {
  const s = dir, yAt = (d) => yDock + s * d;
  // Orbital module: a sphere about 2.2 m across, with its hatch.
  const om = yAt(1.15);
  const prof = [];
  for (let i = 0; i <= 10; i++) { const t = -1 + (2 * i) / 10; prof.push([om + t * 1.1, Math.max(0.35, Math.sqrt(1 - t * t) * 1.1), Math.max(0.25, Math.sqrt(1 - t * t) * 0.98)]); }
  if (s < 0) prof.reverse();
  shellY(k, prof.map(([y, a, b]) => [y, a, b]).sort((p, q) => p[0] - q[0]), cx, M.soyuz, { seg: 18 });
  // Cargo in the orbital module (the departing crew is packing TMA-20 today).
  for (let i = 0; i < 3; i++) ctb(k, cx - 0.4 + i * 0.4, om - 0.45 + (i % 2) * 0.35, 0.35, 0.36, 0.3, 0.3, i % 2 ? M.bag : M.bagB);
  k.lamp(cx, om + 0.3, 0.4, { color: '#f4ecd0', r: 1.6, i: 0.45, bulb: false, halo: 0.15 });
  // Descent module: a bell, its heat shield towards the instrument module.
  const d0 = yAt(2.25), d1 = yAt(4.45);
  const dm = [[d0, 0.7, 0.58], [yAt(2.9), 0.95, 0.83], [yAt(3.9), 1.08, 0.96], [d1, 1.1, 0.98]];
  shellY(k, dm.slice().sort((p, q) => p[0] - q[0]), cx, M.soyuzDM, { seg: 18 });
  // Three couches seen in the cut, and a plush toy on a string.
  const cy = yAt(3.55);
  for (const dx of [-0.55, 0, 0.55]) k.boxR(cx + dx, cy, 0.5, 0.42, 0.14, 0.7, mat({ c: '#6a6a72', cut: '#3a3a42' }), { z: s * 0.3 });
  if (name === 'tma20') {
    k.cyl(cx + 0.1, yAt(2.6), 0.4, 0.004, 0.32, mat('#e8e0c8'), { seg: 3 });
    k.sphere(cx + 0.1, yAt(2.6) + s * 0.4 + 0.02, 0.4, 0.07, mat({ c: '#d88a3a', c2: '#b86a2a' }), { seg: 8, rings: 5 });
    k.sphere(cx + 0.1, yAt(2.6) + s * 0.4 + 0.12, 0.4, 0.05, mat({ c: '#d88a3a' }), { seg: 8, rings: 5 });
    SP.toy = [cx + 0.1, yAt(2.6) + s * 0.45, 0.4];
  }
  k.lamp(cx, cy, 0.4, { color: '#ffe8c0', r: 1.4, i: 0.4, bulb: false, halo: 0.15 });
  k.cyl(cx + 0.8, yAt(3.2), 0.65, 0.1, 0.05, mat({ c: '#22303a', c2: '#ffe0a0', glow: 'night' }), { axis: 'x', seg: 10 });
  // Instrument and propulsion module, with its two wings.
  const i0 = yAt(4.45), i1 = yAt(7.0);
  const lo = Math.min(i0, i1), hi = Math.max(i0, i1);
  k.cyl(cx, lo, 0, 1.35, hi - lo, M.soyuzIM, { seg: 20 });
  k.cyl(cx, s < 0 ? lo - 0.3 : hi, 0, 0.35, 0.3, M.black, { seg: 10 });
  const wy = yAt(5.3);
  for (const side of [-1, 1]) {
    const xa = cx + side * 1.4, xb = cx + side * 5.3;
    k.box(Math.min(xa, xb), wy - 0.62, 0.25, Math.max(xa, xb), wy + 0.62, 0.3, M.ruCells);
    k.box(Math.min(xa, xb), wy - 0.04, 0.24, Math.max(xa, xb), wy + 0.04, 0.32, M.wingFrame);
  }
  // Kurs rendezvous antennas on the orbital module.
  for (const [dx, dz] of [[0.75, 0.6], [-0.7, 0.75]]) { k.cyl(cx + dx, om, dz, 0.025, s * 0.9, M.alu, { seg: 5 }); k.cyl(cx + dx, om + s * 0.9, dz, 0.16, 0.03, M.alu, { seg: 10 }); }
  SP[name] = { om: [cx - 0.2, om - 0.55, 0.45], dm: [cx - 0.25, yAt(3.0) - 0.3, 0.6] };
  void PARTS;
}

// Progress M: cargo module nearest the station, then the refuelling and instrument sections.
function progress(k, cx, yDock, SP, PARTS) {
  const yAt = (d) => yDock - d;
  const PG = mat({ c: '#8a9478', c2: '#747e64', pat: 'quilt', s: 0.4, cut: '#4a5440' });
  shellY(k, [[yAt(3.2), 0.9, 0.78], [yAt(2.7), 1.1, 0.98], [yAt(0.6), 1.1, 0.98], [yAt(0), 0.65, 0.52]], cx, PG, { seg: 18 });
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) ctb(k, cx - 0.4 + i * 0.75, yAt(2.7) + j * 0.62, 0.3, 0.6, 0.5, 0.35, (i + j) % 2 ? M.bag : M.bagB);
  k.lamp(cx, yAt(1.5), 0.4, { color: '#f4ecd0', r: 1.8, i: 0.45, bulb: false, halo: 0.2 });
  k.cyl(cx, yAt(4.4), 0, 0.85, 1.2, mat({ c: '#c8ccc0', cut: '#4a5440' }), { seg: 16 });
  k.cyl(cx, yAt(7.4), 0, 1.35, 3.0, M.soyuzIM, { seg: 20 });
  const wy = yAt(6.4);
  for (const side of [-1, 1]) {
    const xa = cx + side * 1.4, xb = cx + side * 5.35;
    k.box(Math.min(xa, xb), wy - 0.6, 0.25, Math.max(xa, xb), wy + 0.6, 0.3, M.ruCells);
  }
  SP.progress = [cx - 0.2, yAt(2.5), 0.45];
  void PARTS;
}

// Zvezda's far solar wing, tilted to the Sun (a part so it can track slowly).
function zvezdaWing(k) {
  return k.part(56.0, 0.0, 1.5, (q) => {
    q.box(-0.1, -0.1, 0, 0.1, 0.1, 13.4, M.alu);
    for (let i = 0; i < 4; i++) q.box(-1.6, -0.03, 1.2 + i * 3.1, 1.6, 0.03, 4.0 + i * 3.1, M.ruCells);
  }, { whole: true });
}

// ATV-2's four solar wings in an X.
function atvWings(k) {
  const parts = [];
  for (const a of [Math.PI / 4, -Math.PI / 4, (3 * Math.PI) / 4, (-3 * Math.PI) / 4]) {
    const g = k.part(70.6, 0, 0, (q) => {
      q.box(-0.06, 2.2, -0.06, 0.06, 2.6, 0.06, M.alu);
      for (let i = 0; i < 4; i++) q.box(-0.75, 2.6 + i * 2.42, -0.02, 0.75, 4.92 + i * 2.42, 0.02, M.atvCells);
    }, { whole: true });
    g.rotation.x = a + Math.PI / 2;
    parts.push(g);
  }
  return parts;
}

// The starboard half of the truss in Panel A, receding into depth from S0 on Destiny's roof.
// Only S0 and S1 are drawn here, ending in a break line: the whole truss, with its wings, is
// drawn turned to face the viewer in the right-hand view.
export function buildStarboardTrussA(k, PARTS) {
  const cx = 25.2, cy = 5.3, zEnd = 20.4;
  lattice(k, 'z', -0.4, zEnd, cy, cx, 4.4, 4.4, M.truss, 2.3, { t: 0.15 });
  // Gold-blanketed equipment boxes inside S0 and S1, MT rails along the face.
  for (let z = 1.0; z < zEnd - 2; z += 3.4) k.box(cx - 1.2, cy - 1.4, z, cx + 1.2, cy - 0.2, z + 1.8, M.gold);
  k.box(cx - 2.25, cy + 2.15, -0.4, cx - 2.05, cy + 2.25, zEnd, M.steel);
  k.box(cx + 2.05, cy + 2.15, -0.4, cx + 2.25, cy + 2.25, zEnd, M.steel);
  k.cyl(cx - 1.4, cy + 2.2, 2.0, 0.05, 1.4, M.alu, { seg: 6 }); // GPS antennas on S0
  k.cyl(cx + 1.4, cy + 2.2, 4.0, 0.05, 1.4, M.alu, { seg: 6 });
  // The break: ragged ends of the longerons.
  const r = k.rng('break');
  for (const [u, v] of [[-2.2, -2.2], [2.2, -2.2], [2.2, 2.2], [-2.2, 2.2]]) k.beam([cx + u, cy + v, zEnd], [cx + u + (r() - 0.5) * 0.4, cy + v + (r() - 0.5) * 0.4, zEnd + 0.6 + r() * 0.9], 0.14, M.trussDark);
  // Main radiators on S1: three panels on a slowly turning beam (a part).
  PARTS.hrsA = k.part(cx, cy - 2.2, 13.5, (q) => {
    for (let i = 0; i < 3; i++) {
      const z0 = -4.5 + i * 3.2;
      q.box(-0.12, -0.12, z0, 0.12, 0.12, z0 + 3.0, M.alu);
      q.box(0.2, -0.04, z0 + 0.1, 15.5, 0.04, z0 + 2.9, M.radiator);
    }
  }, { whole: true });
}
