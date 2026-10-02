/* The Car Factory: ground, streets and building envelopes (closed solids, cut at z = 0). */
import { mat, shade } from '../../engine/index.js';
import { X, H, N, SAW, P, M, glazedWall, endWall, bays, slabAround, mushroom, hcol, railX, railZ, reflector } from './common.js';

const PITS = [
  { x0: 262.5, x1: 267.5, z0: H.lines[0] - 0.55, z1: H.lines[0] + 0.55, y: -1.5 },
  { x0: 262.5, x1: 267.5, z0: H.lines[1] - 0.55, z1: H.lines[1] + 0.55, y: -1.5 },
];
export const HOLES = {
  base: { x0: 8.6, x1: 35.6, z0: -3, z1: 19.6, y: P.base },
  trench: { x0: 330.3, x1: 492, z0: N.cw0 + 0.3, z1: N.cw1 - 0.3, y: N.track - 0.25 },
  pits: PITS,
};

// ------------------------------------------------------------------ ground
function earth(k) {
  const holes = [HOLES.base, HOLES.trench, ...PITS];
  const layers = [[-1.2, -0.3, M.loam], [-7, -1.2, M.clay]];
  for (const [ya, yb, m] of layers) {
    const act = holes.filter((h) => h.y < yb);
    slabAround(k, -80, 500, -3, 125, ya, yb, m, act);
    for (const h of act) if (h.y > ya) k.box(h.x0, ya, h.z0, h.x1, Math.min(h.y, yb), h.z1, m);
  }
}

// Floor and yard surfaces, y -0.3 to 0.
function surfaces(k) {
  const all = [HOLES.base, HOLES.trench, ...PITS];
  const S = (x0, x1, z0, z1, m, y1 = 0) => slabAround(k, x0, x1, z0, z1, -0.3, y1, m, all);
  // Across Woodward: shop lots. Woodward Avenue itself, with streetcar rails.
  S(-80, -40, -3, 125, M.cinders);
  S(-40, 0, -3, 125, M.asphalt);
  S(0, X.P0, -3, 125, M.concrete, 0.12);
  // Buildings' floors.
  S(X.P0, X.P1, -3, P.zN, M.concrete);
  S(X.F0, X.F1, -3, SAW.F.z1, M.dirt);
  S(X.T0, X.T1, -3, SAW.F.z1, M.brickFloor);
  S(X.M0, X.M1, -3, SAW.M.z1, M.planks);
  S(X.H0, X.H1, -3, H.zN + 0.3, M.floorH);
  S(X.N0, X.N1, -3, N.nb1 + 0.3, M.floorH);
  // John R Street: brick paving with sidewalks.
  S(X.J0, X.J0 + 3, -3, 125, M.concrete, 0.12);
  S(X.J0 + 3, X.J1 - 3, -3, 125, M.paving);
  S(X.J1 - 3, X.J1, -3, 125, M.concrete, 0.12);
  // Yards behind the plant, and the ground east of the railway.
  S(X.P0, X.J0, Math.max(P.zN, H.zN) + 0.3, 125, M.cinders);
  S(X.P0, X.H0, H.zN + 0.3, SAW.F.z1, M.cinders);
  S(X.N0, X.N1, N.nb1 + 0.3, 125, M.cinders);
  S(X.N1, 500, -3, 125, M.cinders);
}

// Streetcar rails along Woodward (two tracks), kerbs and telegraph poles.
function woodward(k) {
  for (const cx of [-22, -17.5]) for (const dz of [-0.72, 0.72]) k.box(cx + dz - 0.04, 0, -3, cx + dz + 0.04, 0.04, 125, M.steel);
  k.box(-0.3, 0, -3, 0, 0.14, 125, M.kerb);
  for (let z = 4; z < 125; z += 14) {
    k.cyl(1.2, 0.12, z, 0.13, 10.5, M.woodDk, { seg: 6 });
    k.box(0.0, 9.6, z - 0.08, 2.4, 9.72, z + 0.08, M.woodDk);
    k.box(0.2, 8.8, z - 0.07, 2.2, 8.9, z + 0.07, M.woodDk);
  }
  for (let z = 4; z < 81; z += 14) for (const x of [0.2, 0.9, 1.6, 2.3]) for (const y of [9.75, 8.93]) k.rope([x, y, z], [x, y, z + 14], 0.01, M.iron, 0.25, 6);
}

// ------------------------------------------------------------------ the power house (x 8..36)
function powerHouse(k) {
  const x0 = X.P0, x1 = X.P1, hy = P.hall, zN = P.zN;
  // Basement: walls and floor.
  k.box(8.6, P.base - 0.2, -3, 35.6, P.base, 19.6, M.concreteDk);
  k.box(8.6, P.base, 19.2, 35.6, 0, 19.6, M.concreteDk);
  // Hall floor over the basement, open round the flywheel pits.
  slabAround(k, 8.6, 35.6, -3, 19.6, -0.3, 0, mat({ c: '#8a5e4c', c2: '#7a5040', pat: 'tiles', s: 0.3, cut: '#5a3a2e' }), [{ x0: 21, x1: 27.4, z0: 6.9, z1: 8.7 }, { x0: 16.6, x1: 21.8, z0: 12.5, z1: 13.7 }]);
  // West wall facing Woodward: tall arched-look windows that glow at night.
  endWall(k, x0, -3, zN + 0.4, P.base, hy + 0.3, { t: 0.6, sill: 5.6, head: 1.4, facing: 'west', bays: bays(0, zN, 3.4, 1.9).map(([a, b]) => [a, b]) });
  // Back wall with tall windows.
  glazedWall(k, x0, x1, 0, hy, zN, { t: 0.4, sill: 1.6, head: 1.4, outer: M.brick, glass: M.sashGlow, bays: bays(x0 + 0.6, x1, 3.5, 2.0) });
  k.box(x0, P.base, zN, x1, 0, zN + 0.4, M.concreteDk);
  // East party wall (shared with the foundry, which is lower).
  k.box(x1 - 0.4, P.base, -3, x1, hy + 0.3, zN + 0.4, M.brick, { left: M.whitewash });
  // Roof of the hall: the floor of the new power plant being built above.
  k.box(x0, hy, -3, x1, hy + 0.35, zN + 0.4, M.slab);
  k.box(x0, hy - 0.6, -3, x1, hy, -2.6, M.concrete);
  // Cornice band.
  k.box(x0 - 0.15, hy - 0.2, -3, x0 + 0.6, hy + 0.5, zN + 0.55, M.concrete);
  // Construction above: steel frame for two more floors (S1 p.4).
  const top = 22, mid = 14.3;
  const cxs = [8.6, 14.4, 20.2, 26.0, 31.8, 35.6];
  const czs = [0.2, 6.6, 13.0, 19.4];
  for (const x of cxs) for (const z of czs) {
    const h = x > 30 && z > 10 ? mid + 2.5 : top;
    hcol(k, x, z, hy + 0.35, h, M.red, 0.32);
  }
  for (const z of czs) { k.box(8.4, mid - 0.45, z - 0.15, 35.8, mid, z + 0.15, M.red); k.box(8.4, top - 0.5, z - 0.15, z > 10 ? 27 : 35.8, top, z + 0.15, M.red); }
  for (const x of cxs) { k.box(x - 0.15, mid - 0.45, -2.5, x + 0.15, mid, 19.6, M.red); if (x < 27) k.box(x - 0.15, top - 0.5, -2.5, x + 0.15, top, 19.6, M.red); }
  // Part of the ash floor is poured; the rest is still open framing with planks.
  k.box(8.4, mid, -3, 22, mid + 0.25, 19.6, M.slab);
  for (let z = -1.5; z < 19; z += 1.2) k.box(22.2, mid, z, 35.6, mid + 0.06, z + 0.45, M.lumber);
  // Formwork and scaffold poles.
  const pole = mat({ c: '#9a7a4a', cut: '#6a5232' });
  for (let x = 23; x < 36; x += 2.6) for (const z of [-0.4, 18.6]) k.cyl(x, mid + 0.25, z, 0.06, 8.5, pole, { seg: 5 });
  for (const y of [16.3, 18.5, 20.7]) { k.box(22.8, y, -0.6, 35.6, y + 0.06, 0.4, M.lumber); k.box(22.8, y, -0.5, 35.6, y + 0.9, -0.42, pole); }
  // Gas producers going up on the top floor: shells half built.
  for (const [x, z, hgt] of [[12.5, 5.5, 5.4], [18.5, 5.5, 3.2], [12.5, 13, 5.4]]) {
    k.lathe([[1.55, mid + 0.25], [1.62, mid + 0.25], [1.62, mid + 0.25 + hgt], [1.55, mid + 0.25 + hgt]], x, z, M.steelDk, { seg: 18, capTop: false, capBot: false });
    if (hgt > 4) k.cyl(x, mid + 0.25 + hgt, z, 0.5, 1.6, M.steelDk, { seg: 10 });
  }
  // A boiler drum on cribbing waiting to be set.
  k.cyl(27.5, mid + 1.4, 9, 0.9, 6, M.steelDk, { axis: 'x', seg: 14 });
  for (const x of [28.2, 32.6]) k.box(x, mid + 0.25, 8.2, x + 0.6, mid + 0.6, 9.8, M.lumber);

  // Five chimneys behind the power house (S2; heights illustrative). The fifth still in scaffolding.
  const chim = mat({ c: '#8a4434', c2: '#743828', pat: 'brick', s: 1.2, cut: '#6a3224', cutPat: true });
  const xs = [12, 17.2, 22.4, 27.6, 32.8];
  xs.forEach((x, i) => {
    const h = i === 4 ? 44 : 60;
    k.box(x - 2.1, 0, P.chimneyZ - 2.1, x + 2.1, 4, P.chimneyZ + 2.1, M.concreteDk);
    k.lathe([[2.0, 4], [1.95, 6], [1.45, h - 1.2], [1.6, h - 1.0], [1.6, h], [1.2, h], [1.2, h - 0.6]], x, P.chimneyZ, chim, { seg: 16, capBot: false, capTop: false });
    k.lathe([[1.62, h - 0.9], [1.7, h - 0.9], [1.7, h], [1.62, h]], x, P.chimneyZ, M.iron, { seg: 16, capBot: false, capTop: false });
    if (i === 4) for (let y = 30; y < h + 2; y += 2.2) {
      k.box(x - 2.3, y, P.chimneyZ - 2.3, x + 2.3, y + 0.08, P.chimneyZ - 2.0, M.lumber);
      k.box(x - 2.3, y, P.chimneyZ + 2.0, x + 2.3, y + 0.08, P.chimneyZ + 2.3, M.lumber);
    }
    if (i === 4) for (const [dx, dz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) k.cyl(x + dx, 28, P.chimneyZ + dz, 0.06, h - 26, pole, { seg: 4 });
  });
  // Breeching from the stacks into the back of the building.
  k.box(10, 6, zN + 0.4, 35, 8, P.chimneyZ - 1.5, M.steelDk);
}

// ------------------------------------------------------------------ saw-tooth shops
// Roof of a one-storey shop with north-light teeth 8 m deep (glazing faces +z).
function sawRoof(k, x0, x1, S, o = {}) {
  const t = 0.25, glass = o.glass || M.sash;
  const skip = o.skip || [];
  const segs = [];
  let cx = x0;
  for (const [a, b] of skip.sort((p, q) => p[0] - q[0])) { if (a > cx) segs.push([cx, a]); cx = b; }
  if (x1 > cx) segs.push([cx, x1]);
  for (let z = S.z0; z < S.z1 - 0.1; z += 8) {
    const z2 = Math.min(S.z1, z + 8);
    const prof = [[z, S.eave], [z2 - 0.12, S.ridge], [z2 - 0.12, S.ridge + t], [z, S.eave + t]];
    for (const [a, b] of segs) {
      k.extrudeX(prof, a, b, M.roof, { end: M.concreteDk });
      // Inside of the slope: whitewashed boards.
      k.extrudeX([[z + 0.2, S.eave - 0.06], [z2 - 0.32, S.ridge - 0.06], [z2 - 0.32, S.ridge], [z + 0.2, S.eave]], a, b, M.whitewash);
      // North glazing.
      k.box(a, S.eave, z2 - 0.12, b, S.ridge, z2 - 0.04, glass);
      // Gutter beam at the valley.
      k.box(a, S.eave - 0.45, z2 - 0.2, b, S.eave, z2 + 0.2, M.steel);
      // Trusses every 6 m.
      for (let x = a + 3; x < b - 1; x += 6) {
        k.beam([x, S.eave - 0.3, z + 0.2], [x, S.eave - 0.3, z2 - 0.2], 0.12, M.steel);
        k.beam([x, S.eave - 0.3, z + 0.2], [x, S.ridge - 0.1, z2 - 0.25], 0.1, M.steel);
        k.beam([x, S.eave - 0.3, z2 - 0.25], [x, S.ridge - 0.1, z2 - 0.25], 0.1, M.steel);
        k.beam([x, S.eave - 0.3, (z + z2) / 2], [x, (S.eave + S.ridge) / 2, (z + z2) / 2], 0.07, M.steel);
      }
    }
  }
}

function foundry(k) {
  const S = SAW.F, x0 = X.F0, x1 = X.F1;
  sawRoof(k, x0, x1, S);
  // Back wall: brick below, steel sash above.
  glazedWall(k, x0, x1, 0, S.eave, S.z1 - 0.3, { t: 0.35, sill: 2.4, head: 0.4, outer: M.brick, pier: M.brick, dado: true, bays: bays(x0, x1, 6, 4.4) });
  // East wall (party with the heat-treat building).
  k.box(x1 - 0.35, 0, -3, x1, S.eave + 0.2, S.z1, M.brick, { left: M.whitewash, right: M.whitewash });
  // Columns at the valleys.
  for (let x = x0 + 9; x < x1 - 2; x += 9) for (const z of [6, 14]) hcol(k, x, z, 0, S.eave - 0.4);
  // Roof gable ends above the power house roof line are hidden; end gables at x1.
  for (let z = S.z0; z < S.z1 - 0.1; z += 8) k.extrude([[z, S.eave], [z + 8 - 0.12, S.ridge], [z + 8 - 0.12, S.eave]].map(([zz, y]) => [zz, y]), 0, 0.01, M.brick, { front: false, back: false });
}

function heatTreat(k) {
  const x0 = X.T0, x1 = X.T1, top = 7.5;
  glazedWall(k, x0, x1, 0, top, SAW.F.z1 - 0.3, { t: 0.35, sill: 1.4, head: 0.8, outer: M.brick, pier: M.brick, bays: bays(x0, x1, 3.3, 1.8) });
  k.box(x0, top, -3, x1, top + 0.3, SAW.F.z1, M.slab, { top: M.tar });
  k.box(x0, top + 0.3, -3, x1, top + 0.9, -2.4, M.brick);
  // Roof monitor with louvres.
  k.box(x0 + 2, top + 0.3, 4, x1 - 2, top + 1.6, 14, mat({ c: '#6a6a66', c2: '#4a4a48', pat: 'bars', s: 0.2, cut: '#3a3a38' }));
  k.box(x0 + 1.8, top + 1.6, 3.8, x1 - 1.8, top + 1.8, 14.2, M.tar);
  k.box(x1 - 0.35, 0, -3, x1, SAW.M.eave + 0.2, SAW.F.z1, M.brick, { left: M.whitewash, right: M.whitewash });
}

function machineShop(k) {
  const S = SAW.M, x0 = X.M0, x1 = X.M1;
  sawRoof(k, x0, x1, S, { skip: [[X.CW0, X.CW1]] });
  glazedWall(k, x0, X.CW0, 0, S.eave, S.z1 - 0.3, { t: 0.3, sill: 1.2, head: 0.4, dado: true, bays: bays(x0, X.CW0, 6.1, 4.6) });
  glazedWall(k, X.CW1, x1, 0, S.eave, S.z1 - 0.3, { t: 0.3, sill: 1.2, head: 0.4, dado: true, bays: bays(X.CW1, x1, 6.1, 4.6) });
  for (let x = x0 + 6.1; x < x1 - 2; x += 6.1) if (x < X.CW0 - 0.5 || x > X.CW1 + 0.5) for (const z of [6, 14]) hcol(k, x, z, 0, S.eave - 0.45, M.steel, 0.26);
  // Craneway No. 1: a tall bay with a wired-glass roof (S1 p.24), running north-south.
  const cy = 12.5, pk = 15;
  for (const x of [X.CW0, X.CW1 - 0.3]) {
    for (let z = 0; z < S.z1 - 0.5; z += 5.5) hcol(k, x + 0.15, z, 0, cy, M.steel, 0.4);
    // Clerestory walls above the saw-tooth.
    k.box(x, S.ridge, -3, x + 0.3, S.ridge + 0.6, S.z1, M.concreteDk);
    k.box(x + 0.1, S.ridge + 0.6, -3, x + 0.2, cy - 0.3, S.z1, M.sashGlow);
    k.box(x, cy - 0.3, -3, x + 0.3, cy, S.z1, M.concreteDk);
    k.box(x, 0, S.z1 - 0.3, x + 0.3, S.ridge, S.z1, M.concreteDk);
    // Crane runway girders along z.
    k.box(x + (x < 145 ? 0.3 : -0.5), 10.2, -3, x + (x < 145 ? 0.8 : 0), 10.7, S.z1, M.steelDk);
  }
  // Back gable of the craneway.
  k.extrude([[X.CW0, 0], [X.CW1, 0], [X.CW1, cy], [145, pk], [X.CW0, cy]], S.z1 - 0.3, S.z1, M.concreteDk, { front: M.whitewash });
  // Glass roof: ribbed wire glass on light steel trusses.
  for (let z = -2; z < S.z1; z += 4) {
    k.beam([X.CW0, cy, z], [145, pk, z], 0.12, M.steel);
    k.beam([X.CW1, cy, z], [145, pk, z], 0.12, M.steel);
    k.beam([X.CW0 + 0.3, cy - 0.1, z], [X.CW1 - 0.3, cy - 0.1, z], 0.1, M.steel);
  }
  k.box(144.8, pk - 0.05, -3, 145.2, pk + 0.25, S.z1, M.steelDk);
  for (const s of [-1, 1]) {
    const xa = s < 0 ? X.CW0 : X.CW1;
    k.glass([[xa, cy, 0], [145, pk, 0], [145, pk, S.z1], [xa, cy, S.z1]], { c: '#c8dcd8', alpha: 0.32 });
  }
  // East wall (party with Building H): to the shop's eaves.
  k.box(x1 - 0.3, 0, -3, x1, S.eave, S.z1, M.brick, { left: M.whitewash, right: M.whitewash });
}

// ------------------------------------------------------------------ Building H
function buildingH(k) {
  const x0 = X.H0, x1 = X.H1, zN = H.zN;
  const fl = H.y.concat([H.roof]);
  // Floor slabs (upper floors and the roof).
  for (let i = 1; i < fl.length; i++) {
    const y = fl[i];
    k.box(x0, y - 0.3, H.zS - 2, x1, y, zN + 0.3, i === fl.length - 1 ? M.slab : M.floorH, { bottom: M.whitewash, top: i === fl.length - 1 ? M.tar : M.floorH });
  }
  // Parapet and cornice.
  k.box(x0, H.roof, zN, x1, H.parapet, zN + 0.35, M.concrete);
  k.box(x0, H.roof, H.zS - 2, x0 + 0.4, H.parapet, zN, M.concrete);
  k.box(x1 - 0.4, H.roof, H.zS - 2, x1, H.parapet, zN, M.concrete);
  k.box(x0 - 0.1, H.parapet - 0.25, H.zS - 2, x1 + 0.1, H.parapet, zN + 0.5, M.concreteDk);
  // Back wall: 75% glass (S1 p.24), brick piers, concrete spandrels.
  const bx = [];
  for (let i = 0; i <= H.colX.length; i++) {
    const a = i === 0 ? x0 : H.colX[i - 1], b = i === H.colX.length ? x1 : H.colX[i];
    bx.push([a + 0.45, b - 0.45]);
  }
  for (let f = 0; f < H.y.length; f++) {
    const y0 = H.y[f], y1 = (f + 1 < H.y.length ? H.y[f + 1] : H.roof) - 0.3;
    glazedWall(k, x0, x1, y0, y1, zN, { t: 0.35, sill: 0.95, head: 0.35, outer: M.concrete, pier: M.brick, pierIn: M.whitewash, dado: true, bays: bx });
  }
  // West wall: inside the machine shop up to its eaves, then exterior windows.
  const wb = bays(H.zS, zN, 3.05, 2.2);
  k.box(x0, 0, H.zS - 2, x0 + 0.4, SAW.M.eave, zN + 0.35, M.brick, { left: M.whitewash, right: M.whitewash });
  for (let f = 1; f < H.y.length; f++) {
    const y0 = Math.max(H.y[f], SAW.M.eave), y1 = (f + 1 < H.y.length ? H.y[f + 1] : H.roof) - 0.3;
    if (y1 - y0 > 1.5) endWall(k, x0, H.zS - 2, zN + 0.35, y0, y1, { t: 0.4, sill: Math.max(0.3, H.y[f] + 0.95 - y0), head: 0.35, facing: 'west', outer: M.brick, bays: wb.filter(([a]) => a > 0.4) });
    else k.box(x0, y0, H.zS - 2, x0 + 0.4, y1, zN + 0.35, M.brick);
  }
  for (let f = 1; f < H.y.length; f++) k.box(x0, H.y[f] - 0.3, H.zS - 2, x0 + 0.4, H.y[f], zN + 0.35, M.concrete);
  // East wall onto John R Street, with door D on the ground floor at line 1.
  for (let f = 0; f < H.y.length; f++) {
    const y0 = H.y[f], y1 = (f + 1 < H.y.length ? H.y[f + 1] : H.roof) - 0.3;
    let b = wb.filter(([a]) => a > 0.4);
    if (f === 0) {
      b = b.filter(([a, c]) => c < 1.5 || a > 5.0);
      endWall(k, x1 - 0.4, H.zS - 2, 1.6, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'east', outer: M.brick, bays: b.filter(([, c]) => c < 1.6) });
      k.box(x1 - 0.4, y0 + 3.0, 1.6, x1, y1, 4.6, M.brick);
      endWall(k, x1 - 0.4, 4.6, zN + 0.35, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'east', outer: M.brick, bays: b.filter(([a]) => a > 4.6) });
    } else endWall(k, x1 - 0.4, H.zS - 2, zN + 0.35, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'east', outer: M.brick, bays: b });
    if (f > 0) k.box(x1 - 0.4, H.y[f] - 0.3, H.zS - 2, x1, H.y[f], zN + 0.35, M.concrete);
  }
  // Mushroom columns on the 20 ft grid.
  for (let f = 0; f < H.y.length; f++) {
    const y0 = H.y[f], y1 = (f + 1 < H.y.length ? H.y[f + 1] : H.roof) - 0.3;
    for (const x of H.colX) for (const z of H.rows) mushroom(k, x, z, y0, y1, { r: f === 0 ? 0.3 : 0.26 });
  }
  // Stairs at the west end, one flight per storey along the back wall.
  for (let f = 0; f < H.y.length; f++) {
    const y0 = H.y[f], y1 = f + 1 < H.y.length ? H.y[f + 1] : H.roof;
    stairsX(k, 197.2, y0, 203.6, y1, 19.0, 20.6);
  }
  // Roof: water tank on a steel tower and the company's name (both illustrative here, see dossier 3.3).
  const tx = 287, tz = 13;
  for (const [dx, dz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) k.beam([tx + dx * 1.2, H.roof, tz + dz * 1.2], [tx + dx, H.roof + 6, tz + dz], 0.16, M.steelDk);
  for (const y of [H.roof + 2, H.roof + 4]) { k.box(tx - 1.9, y, tz - 1.9, tx + 1.9, y + 0.1, tz - 1.75, M.steelDk); k.box(tx - 1.9, y, tz + 1.75, tx + 1.9, y + 0.1, tz + 1.9, M.steelDk); }
  k.box(tx - 2, H.roof + 6, tz - 2, tx + 2, H.roof + 6.25, tz + 2, M.steelDk);
  k.lathe([[2.3, H.roof + 6.25], [2.3, H.roof + 10], [0.2, H.roof + 11.2]], tx, tz, mat({ c: '#8a6a48', c2: '#7a5a3a', pat: 'planks', s: 0.18, cut: '#5a4228' }), { seg: 16 });
  for (const y of [H.roof + 7, H.roof + 8.2, H.roof + 9.4]) k.lathe([[2.32, y], [2.32, y + 0.06]], tx, tz, M.iron, { seg: 16, capTop: false, capBot: false });
  sign(k, 'FORD MOTOR COMPANY', 226, H.roof + 1.2, 3.0, 2.2);
  // Roof vents and skylight curbs.
  for (let x = 205; x < 290; x += 18.3) { k.box(x, H.roof, 9, x + 3, H.roof + 0.9, 11, M.concreteDk); k.box(x + 0.1, H.roof + 0.9, 9.1, x + 2.9, H.roof + 1.2, 10.9, M.sashGlow); }
}

// A straight stair along x, from (xa, ya) to (xb, yb), between depths z0 and z1.
export function stairsX(k, xa, ya, xb, yb, z0, z1) {
  const n = Math.round((yb - ya) / 0.2);
  const dx = (xb - xa) / n, dy = (yb - ya) / n;
  const m = mat({ c: '#9a948a', c2: '#8a8478', cut: '#6a665e' });
  for (let i = 0; i < n; i++) k.box(xa + dx * i, ya + dy * i, z0, xa + dx * (i + 1), ya + dy * (i + 1), z1, m, { top: M.steel });
  k.beam([xa, ya + 0.95, z0 + 0.03], [xb, yb + 0.95, z0 + 0.03], 0.05, M.iron);
  for (let i = 0; i <= n; i += 5) k.cyl(xa + dx * i, ya + dy * i, z0 + 0.03, 0.02, 0.95, M.iron, { seg: 4, caps: false });
}

// Stroke letters for the rooftop sign: segments on a 4 x 6 grid.
const FONT = {
  F: [[0, 0, 0, 6], [0, 6, 4, 6], [0, 3, 3, 3]],
  O: [[1, 0, 3, 0], [3, 0, 4, 1], [4, 1, 4, 5], [4, 5, 3, 6], [3, 6, 1, 6], [1, 6, 0, 5], [0, 5, 0, 1], [0, 1, 1, 0]],
  R: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3], [2, 3, 4, 0]],
  D: [[0, 0, 0, 6], [0, 6, 2.5, 6], [2.5, 6, 4, 4.5], [4, 4.5, 4, 1.5], [4, 1.5, 2.5, 0], [2.5, 0, 0, 0]],
  M: [[0, 0, 0, 6], [0, 6, 2, 3], [2, 3, 4, 6], [4, 6, 4, 0]],
  T: [[0, 6, 4, 6], [2, 6, 2, 0]],
  C: [[4, 5, 3, 6], [3, 6, 1, 6], [1, 6, 0, 5], [0, 5, 0, 1], [0, 1, 1, 0], [1, 0, 3, 0], [3, 0, 4, 1]],
  P: [[0, 0, 0, 6], [0, 6, 3, 6], [3, 6, 4, 5], [4, 5, 4, 4], [4, 4, 3, 3], [3, 3, 0, 3]],
  A: [[0, 0, 0, 4], [0, 4, 2, 6], [2, 6, 4, 4], [4, 4, 4, 0], [0, 2.6, 4, 2.6]],
  N: [[0, 0, 0, 6], [0, 6, 4, 0], [4, 0, 4, 6]],
  Y: [[0, 6, 2, 3], [4, 6, 2, 3], [2, 3, 2, 0]],
};
function sign(k, text, x0, y0, z, h) {
  const u = h / 6, adv = u * 5.6, t = u * 0.7;
  const letter = mat({ c: '#efe8d8', c2: '#e2dac8', cut: '#bab2a0' });
  const w = text.length * adv;
  k.box(x0 - 0.5, y0 - 0.3, z + 0.2, x0 + w, y0 - 0.15, z + 0.35, M.steelDk);
  for (let x = x0; x < x0 + w; x += 3.2) { k.beam([x, H.roof, z + 0.3], [x, y0 + h, z + 0.3], 0.09, M.steelDk); k.beam([x, H.roof, z + 1.8], [x, y0 + h * 0.8, z + 0.3], 0.07, M.steelDk); }
  k.beam([x0 - 0.4, y0 + h * 0.55, z + 0.3], [x0 + w, y0 + h * 0.55, z + 0.3], 0.07, M.steelDk);
  [...text].forEach((ch, i) => {
    const g = FONT[ch];
    if (!g) return;
    const lx = x0 + i * adv;
    for (const [a, b, c, d] of g) k.beam([lx + a * u, y0 + b * u, z], [lx + c * u, y0 + d * u, z], t, letter);
  });
}

// ------------------------------------------------------------------ the new building (N)
function newBuilding(k) {
  const x0 = X.N0, x1 = X.N1;
  const fl = N.y.concat([N.roof]);
  // South building floors, 2nd floor up, and roof.
  for (let i = 1; i < fl.length; i++) {
    const y = fl[i], top = i === fl.length - 1;
    k.box(x0, y - 0.3, N.zS, x1, y, N.zW + 0.3, top ? M.slab : M.floorH, { bottom: M.whitewash, top: top ? M.tar : M.floorH });
  }
  // North building floors.
  for (let i = 1; i < fl.length; i++) k.box(x0, fl[i] - 0.3, N.cw1, x1, fl[i], N.nb1, M.floorH, { bottom: M.whitewash, top: i === fl.length - 1 ? M.tar : M.floorH });
  k.box(x0, -0.3, N.cw1, x1, 0, N.nb1, M.floorH);
  // Columns: mushroom capitals, hollow for the washed air (S1 p.389).
  for (let f = 0; f < N.y.length; f++) {
    const y0 = N.y[f], y1 = (f + 1 < N.y.length ? N.y[f + 1] : N.roof) - 0.3;
    for (const x of N.colX) { for (const z of [0, 6.1]) mushroom(k, x, z, y0, y1, { r: 0.3 }); for (const z of [30.5, 36.6]) mushroom(k, x, z, y0, y1, { r: 0.3, dado: false }); }
  }
  // Walls facing the craneway, with landing-stage doors, and the north building's back wall.
  const cwb = bays(x0, x1, 6.1, 4.2);
  for (let f = 0; f < N.y.length; f++) {
    const y0 = N.y[f], y1 = (f + 1 < N.y.length ? N.y[f + 1] : N.roof) - 0.3;
    glazedWall(k, x0, x1, y0, y1, N.zW, { t: 0.3, sill: 1.0, head: 0.4, outer: M.concrete, pier: M.brick, pierIn: M.whitewash, dado: true, glass: M.sash, bays: cwb });
    glazedWall(k, x0, x1, y0, y1, N.cw1 - 0.3, { t: 0.3, sill: 1.0, head: 0.4, outer: M.concrete, inner: M.concrete, pier: M.brick, pierIn: M.brick, glass: M.sashGlow, bays: cwb });
    glazedWall(k, x0, x1, y0, y1, N.nb1 - 0.3, { t: 0.3, sill: 1.0, head: 0.4, outer: M.concrete, pier: M.brick, glass: M.sashGlow, bays: cwb });
  }
  for (let f = 1; f < N.y.length; f++) k.box(x0, N.y[f] - 0.3, N.cw1 - 0.3, x1, N.y[f], N.cw1, M.concrete);
  // End walls: west (towards John R) and east (towards the railway).
  const eb = bays(N.zS, N.zW, 3.05, 2.1).concat(bays(N.cw1, N.nb1, 3.05, 2.1));
  for (let f = 0; f < N.y.length; f++) {
    const y0 = N.y[f], y1 = (f + 1 < N.y.length ? N.y[f + 1] : N.roof) - 0.3;
    endWall(k, x0, N.zS, N.zW + 0.3, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'west', outer: M.brick, bays: eb.filter(([a, b]) => a > N.zS + 0.5 && b < N.zW && !(f === 2 && a > 4.5 && b < 9.5)) });
    endWall(k, x0, N.cw1, N.nb1, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'west', outer: M.brick, bays: eb.filter(([a]) => a > N.cw1) });
    endWall(k, x1 - 0.4, N.zS, N.zW + 0.3, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'east', outer: M.brick, bays: eb.filter(([a, b]) => a > N.zS + 0.5 && b < N.zW) });
    endWall(k, x1 - 0.4, N.cw1, N.nb1, y0, y1, { t: 0.4, sill: 0.95, head: 0.35, facing: 'east', outer: M.brick, bays: eb.filter(([a]) => a > N.cw1) });
    if (f > 0) for (const x of [x0, x1 - 0.4]) { k.box(x, N.y[f] - 0.3, N.zS, x + 0.4, N.y[f], N.zW + 0.3, M.concrete); k.box(x, N.y[f] - 0.3, N.cw1, x + 0.4, N.y[f], N.nb1, M.concrete); }
  }
  // Doorway onto the bridge (3rd floor, west wall).
  k.box(x0, N.y[2], 4.5, x0 + 0.4, N.y[2] + 0.02, 9.5, M.floorH);
  // Parapets and cornices.
  for (const [za, zb] of [[N.zS, N.zW + 0.3], [N.cw1, N.nb1]]) {
    k.box(x0, N.roof, zb - 0.3, x1, N.parapet, zb, M.concrete);
    k.box(x0, N.roof, za, x0 + 0.4, N.parapet, zb, M.concrete);
    k.box(x1 - 0.4, N.roof, za, x1, N.parapet, zb, M.concrete);
    k.box(x0 - 0.1, N.parapet - 0.25, za, x1 + 0.1, N.parapet, zb + 0.15, M.concreteDk);
  }
  // Craneway ends: west wall glazed high up; east end has the vertical steel doors.
  const cw0 = N.cw0 + 0.3, cw1 = N.cw1 - 0.3;
  endWall(k, x0, cw0, cw1, N.track, N.peak - 3, { t: 0.4, sill: 4.0, head: 0.6, facing: 'west', outer: M.brick, bays: bays(cw0, cw1, 3.0, 2.2) });
  k.extrude([[cw0, N.peak - 3], [cw1, N.peak - 3], [N.cw0 + 6.1, N.peak]].map(([z, y]) => [z, y]), 0, 0.01, M.brick, { front: false, back: false });
  // East end: posts, a lintel and the counterweighted steel door, raised.
  k.box(x1 - 0.5, N.track, cw0, x1, N.peak - 3, cw0 + 1.0, M.brick);
  k.box(x1 - 0.5, N.track, cw1 - 1.0, x1, N.peak - 3, cw1, M.brick);
  k.box(x1 - 0.5, 9.5, cw0 + 1.0, x1, N.peak - 3, cw1 - 1.0, M.brick, { left: M.whitewash });
  k.box(x1 - 0.32, 5.6, cw0 + 1.0, x1 - 0.18, 9.5, cw1 - 1.0, mat({ c: '#4a5048', c2: '#3a4038', pat: 'plates', s: 0.6, cut: '#2a2e2a' }));
  // Crane runway girders on brackets, both sides.
  for (const z of [N.cw0 + 0.3, N.cw1 - 0.85]) k.box(x0 + 0.4, N.craneRail - 0.7, z, x1 - 0.5, N.craneRail, z + 0.55, M.steelDk);
  for (let x = x0 + 3.05; x < x1; x += 6.1) for (const s of [0, 1]) {
    const z = s ? N.cw1 - 0.3 : N.cw0 + 0.3, d = s ? -1 : 1;
    k.beam([x, N.craneRail - 2.2, z], [x, N.craneRail - 0.7, z + d * 0.5], 0.18, M.steelDk);
  }
  // Craneway roof: steel trusses with a wired-glass lantern.
  const eave = N.parapet, pk = N.peak;
  for (let x = x0 + 0.5; x < x1; x += 6.1) {
    k.beam([x, eave, N.cw0], [x, pk, (N.cw0 + N.cw1) / 2], 0.2, M.steelDk);
    k.beam([x, eave, N.cw1], [x, pk, (N.cw0 + N.cw1) / 2], 0.2, M.steelDk);
    k.beam([x, eave, N.cw0], [x, eave, N.cw1], 0.16, M.steelDk);
    for (const t of [0.33, 0.66]) { const z = N.cw0 + (N.cw1 - N.cw0) * t * 0.5; k.beam([x, eave, z], [x, eave + (pk - eave) * t, z], 0.08, M.steelDk); k.beam([x, eave, N.cw1 - (z - N.cw0)], [x, eave + (pk - eave) * t, N.cw1 - (z - N.cw0)], 0.08, M.steelDk); }
  }
  k.box(x0, pk - 0.1, (N.cw0 + N.cw1) / 2 - 0.2, x1, pk + 0.25, (N.cw0 + N.cw1) / 2 + 0.2, M.steelDk);
  for (const [za, zb] of [[N.cw0, (N.cw0 + N.cw1) / 2], [N.cw1, (N.cw0 + N.cw1) / 2]]) {
    k.glass([[x0, eave, za], [x1, eave, za], [x1, pk, zb], [x0, pk, zb]], { c: '#c8dcd8', alpha: 0.26 });
    for (let x = x0 + 0.5; x < x1; x += 1.525) k.beam([x, eave + 0.02, za], [x, pk + 0.02, zb], 0.04, M.steel);
  }
  // Roof penthouses for the ventilating fans (S1 p.390), and skylights by the craneway.
  for (const px of [338, 372]) {
    k.box(px, N.roof, -3.2, px + 7.0, N.roof + 4.6, 3.4, M.brick, { left: M.brick, front: M.brick });
    k.box(px - 0.2, N.roof + 4.6, -3.4, px + 7.2, N.roof + 4.9, 3.6, M.tar);
    k.box(px + 1.0, N.roof + 0.8, 3.38, px + 6.0, N.roof + 3.6, 3.42, mat({ c: '#6a6a66', c2: '#4a4a48', pat: 'bars', s: 0.16 }));
    // Brick air duct down into the building.
    k.box(px + 2.5, N.roof, 3.4, px + 4.5, N.roof + 2.4, 6.0, M.brick);
  }
  for (let x = x0 + 4; x < x1 - 4; x += 12.2) { k.box(x, N.roof, 8.2, x + 5, N.roof + 0.7, 11.2, M.concreteDk); k.boxR(x + 2.5, N.roof + 1.1, 9.7, 5, 0.12, 3.2, M.sashGlow, { x: 0.25 }); }
}

// The enclosed bridge from the new building to the incline over John R Street.
function bridge(k) {
  const y0 = N.y[2], x0 = 313.5, x1 = X.N0, z0 = 4.5, z1 = 9.5;
  k.box(x0, y0 - 0.45, z0, x1, y0, z1, M.concrete, { top: M.floorH });
  k.box(x0, y0, z1 - 0.25, x1, y0 + 3.3, z1, M.brick, { front: M.whitewash });
  k.box(x0, y0 + 3.3, z0, x1, y0 + 3.6, z1, M.slab, { top: M.tar });
  k.box(x0, y0 + 0.9, z1 - 0.18, x1, y0 + 2.9, z1 - 0.08, M.sashGlow);
  for (const z of [z0 + 0.3, z1 - 0.3]) for (const x of [x0 + 0.6, 322]) k.box(x - 0.2, 0, z - 0.2, x + 0.2, y0 - 0.45, z + 0.2, M.steelDk);
  k.box(x0, y0 - 1.1, z0 + 0.1, x1, y0 - 0.45, z0 + 0.4, M.steelDk);
  k.box(x0, y0 - 1.1, z1 - 0.4, x1, y0 - 0.45, z1 - 0.1, M.steelDk);
  railX(k, x0, x1, y0, z0 + 0.15, 1.0, 1.4);
}

// ------------------------------------------------------------------ railway and surroundings
function railway(k) {
  const z = (N.cw0 + N.cw1) / 2, y = N.track;
  // Retaining walls of the cutting beyond the building.
  for (const zz of [HOLES.trench.z0, HOLES.trench.z1 - 0.4]) k.box(X.N1, y - 0.3, zz, 492, 0, zz + 0.4, M.concreteDk);
  k.box(X.N0 + 0.3, y - 0.45, HOLES.trench.z0, 492, y - 0.25, HOLES.trench.z1, mat({ c: '#6a6258', c2: '#5a5248', pat: 'speckle', cut: '#4a443c' }));
  k.box(X.N0 + 0.3, y - 0.25, z - 1.3, 492, y - 0.12, z + 1.3, mat({ c: '#6a4a32', c2: '#3a2a1e', pat: 'bars', s: 0.6, cut: '#4a3424' }));
  for (const dz of [-0.72, 0.72]) k.box(X.N0 + 0.3, y - 0.12, z + dz - 0.04, 492, y, z + dz + 0.04, M.steel);
  // Platforms along the track at first-floor level inside the craneway.
  k.box(X.N0 + 0.4, -0.3, HOLES.trench.z0, X.N1 - 0.5, 0, z - 1.6, M.concrete);
  k.box(X.N0 + 0.4, -0.3, z + 1.6, X.N1 - 0.5, 0, HOLES.trench.z1, M.concrete);
  k.box(X.N0 + 0.4, y, HOLES.trench.z0, X.N1 - 0.5, -0.3, z - 1.6, M.concreteDk);
  k.box(X.N0 + 0.4, y, z + 1.6, X.N1 - 0.5, -0.3, HOLES.trench.z1, M.concreteDk);
  // Outdoor loading platform.
  k.box(X.N1, -0.3, 8.0, 446, 0.0, HOLES.trench.z0, M.concrete);
  // The belt line along the north boundary.
  const bz = 62;
  k.box(-80, 0, bz - 1.6, 500, 0.18, bz + 1.6, mat({ c: '#6a6258', c2: '#5a5248', pat: 'speckle' }));
  k.box(-80, 0.18, bz - 1.25, 500, 0.28, bz + 1.25, mat({ c: '#6a4a32', c2: '#3a2a1e', pat: 'bars', s: 0.6 }));
  for (const dz of [-0.72, 0.72]) k.box(-80, 0.28, bz + dz - 0.04, 500, 0.4, bz + dz + 0.04, M.steel);
  for (let x = -70; x < 500; x += 30) { k.cyl(x, 0, bz - 3, 0.12, 9, M.woodDk, { seg: 5 }); k.box(x - 1, 8.4, bz - 3.08, x + 1, 8.5, bz - 2.92, M.woodDk); }
}

function neighbourhood(k) {
  const r = k.rng('houses');
  const house = (x, z, w, d, h, face) => {
    const wall = r.pick(['#b8a07a', '#9a6a4a', '#c8b898', '#8a5a44', '#a8a08a']);
    const wm = mat({ c: wall, c2: shade(wall, -0.12), pat: wall === '#9a6a4a' || wall === '#8a5a44' ? 'brick' : 'planks', s: 0.18, cut: shade(wall, -0.3) });
    k.box(x, 0, z, x + w, h, z + d, wm);
    const rf = mat({ c: '#5a4a44', c2: '#4a3a34', pat: 'slates', s: 0.3, cut: '#3a2e2a' });
    if (face === 'x') k.extrude([[x - 0.3, h], [x + w + 0.3, h], [x + w / 2, h + w * 0.42]], z - 0.3, z + d + 0.3, rf);
    else k.extrudeX([[z - 0.3, h], [z + d + 0.3, h], [z + d / 2, h + d * 0.42]], x - 0.3, x + w + 0.3, rf);
    // Lit windows on the faces we can see.
    const win = mat({ c: '#6a7a84', c2: '#ffcf80', pat: 'panes', s: 0.35, glow: 'night' });
    for (let fy = 1; fy < h - 1; fy += 2.8) {
      if (face === 'x') for (let wz = z + 1; wz < z + d - 1; wz += 2.4) k.box(x + w, fy, wz, x + w + 0.05, fy + 1.4, wz + 0.9, win);
      else for (let wx = x + 1; wx < x + w - 1; wx += 2.4) k.box(wx, fy, z - 0.05, wx + 0.9, fy + 1.4, z, win);
    }
    k.box(x + w * 0.7, h, z + d * 0.4, x + w * 0.7 + 0.6, h + w * 0.42 + 0.8, z + d * 0.4 + 0.6, M.brickDk);
  };
  // Shops and houses across Woodward, facing the plant.
  for (let z = -2; z < 90; z += 9 + r() * 3) house(-58 - r() * 4, z, 10 + r() * 4, 7 + r() * 2, 5.5 + r() * 3.5, 'x');
  // Workers' houses beyond the belt line.
  for (let x = -40; x < 490; x += 13 + r() * 9) house(x, 96 + r() * 10, 7 + r() * 2, 8 + r() * 2, 4.5 + r() * 2.5, 'z');
  // Bare elms.
  const bark = mat({ c: '#4a4038', c2: '#3a3430', cut: '#2a2420' });
  const tree = (x, z, s) => {
    const tr = k.rng('elm' + x + ',' + z);
    k.cyl(x, 0, z, 0.25 * s, 4 * s, bark, { r2: 0.18 * s, seg: 6 });
    const fan = (ox, oy, oz, a, len, depth) => {
      if (depth === 0) return;
      const n = depth === 3 ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const aa = a + (tr() - 0.5) * 1.6, el = 0.6 + tr() * 0.6;
        const e = [ox + Math.cos(aa) * len * Math.cos(el), oy + Math.sin(el) * len, oz + Math.sin(aa) * len * Math.cos(el)];
        k.tube([[ox, oy, oz], e], 0.03 * depth * s, bark, { seg: 4 });
        fan(e[0], e[1], e[2], aa, len * 0.62, depth - 1);
      }
    };
    fan(x, 4 * s, z, tr() * 6.28, 3.4 * s, 3);
  };
  for (const [x, z] of [[-34, 6], [-34, 26], [-34, 48], [4.5, 30], [4.5, 52], [300.5, 40], [327.5, 58], [418, 4], [436, 30], [452, 6], [470, 40], [60, 40], [150, 46], [240, 34], [380, 52]]) tree(x, z, 0.9 + ((x * 7 + z) % 5) / 12);
}

// ------------------------------------------------------------------ build it all
export function buildShell(k) {
  earth(k);
  surfaces(k);
  woodward(k);
  powerHouse(k);
  foundry(k);
  heatTreat(k);
  machineShop(k);
  buildingH(k);
  newBuilding(k);
  bridge(k);
  railway(k);
  neighbourhood(k);
  // Pit linings in Building H.
  for (const p of PITS) {
    k.box(p.x0, p.y - 0.15, p.z0, p.x1, p.y, p.z1, M.concreteDk);
    k.box(p.x0 - 0.15, p.y, p.z0, p.x0, 0, p.z1, M.concreteDk);
    k.box(p.x1, p.y, p.z0, p.x1 + 0.15, 0, p.z1, M.concreteDk);
    k.box(p.x0, p.y, p.z1, p.x1, 0, p.z1 + 0.15, M.concreteDk);
  }
}
export { reflector, railZ };
