/* Conwy Castle: the ground. The rock ridge under the castle (cut in section with its
 * cellars, pits and well shaft), the walled town to the west, the River Conwy estuary
 * to the east and the hills beyond. */
import { XS, mat, makeSea } from '../../engine/index.js';
import { M, TOWN_Y, TIDE, WELL, DITCH, HALL, TOWERS, GARDEN, DOCK } from './common.js';

const noise = (x, z, s) => XS.noise1(x * 0.07 + z * 0.13, s) * 0.6 + XS.noise1(x * 0.021 - z * 0.017, s + 3) * 1.4;

// Castle footprint handled by the rock slabs (heights here are buried).
const inFoot = (x, z) => x > -1 && x < 121.5 && z < 36.5;

// Ground height outside the castle rock.
export function groundH(x, z) {
  if (inFoot(x, z)) return -32;
  // River Conwy: a channel running north-south east of the castle.
  const rc = 150 + Math.sin(z * 0.006) * 14;
  const dr = Math.abs(x - rc);
  const bed = -14.5 + noise(x, z, 11) * 0.5;
  // West bank: the town and the ground north of the castle.
  let land;
  if (x < rc) {
    land = TOWN_Y + noise(x, z, 2) * 0.35 - Math.max(0, (z - 140) * 0.01);
    const bankX = 119 + Math.max(0, z - 40) * 0.05;
    if (x > bankX) land = land + (bed - land) * Math.min(1, (x - bankX) / 7);
  } else {
    // East shore rising to the hills across the river (the Deganwy side).
    const e = x - (rc + 26);
    land = e < 0 ? bed + (TOWN_Y - 1 - bed) * Math.max(0, 1 + e / 8) : TOWN_Y - 1 + e * 0.06 + noise(x, z, 5) * 0.8;
    const hill = (hx, hz, h, s) => h * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (s * s));
    land += hill(330, 230, 70, 60) + hill(395, 285, 58, 50) + hill(470, 160, 40, 90) + hill(260, 420, 55, 120);
  }
  // Conwy Mountain far to the north-west, and low hills inland.
  const hillW = (hx, hz, h, s) => h * Math.exp(-((x - hx) ** 2 + (z - hz) ** 2) / (s * s));
  land += hillW(-420, 380, 150, 170) + hillW(-160, 520, 70, 160) + hillW(-700, 150, 120, 220);
  if (dr < 26) return Math.min(land, bed + (dr / 26) ** 2 * 3);
  return land;
}

// A heightfield as a closed solid (top, skirt and bottom), so the cut shows its section.
function heightfield(k, x0, x1, z0, z1, step, fn, mFn, bottom) {
  const nx = Math.round((x1 - x0) / step), nz = Math.round((z1 - z0) / step);
  const H = [];
  for (let j = 0; j <= nz; j++) { const row = []; for (let i = 0; i <= nx; i++) row.push(fn(x0 + i * step, z0 + j * step)); H.push(row); }
  const P = (i, j) => [x0 + i * step, H[j][i], z0 + j * step];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    if (Math.max(a[1], b[1], c[1], d[1]) < bottom + 0.5) continue;
    const m = mFn((a[0] + c[0]) / 2, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + c[2]) / 2);
    // Counter-clockwise seen from above (y up, z away): a, d, c, b.
    k.tri(a, d, c, m); k.tri(a, c, b, m);
  }
  // Skirts.
  const side = M.rockDeep;
  for (let i = 0; i < nx; i++) {
    const a = P(i, 0), b = P(i + 1, 0);
    k.quad([a[0], bottom, a[2]], [a[0], a[1], a[2]], [b[0], b[1], b[2]], [b[0], bottom, b[2]], side);
    const c = P(i, nz), d = P(i + 1, nz);
    k.quad([d[0], bottom, d[2]], [d[0], d[1], d[2]], [c[0], c[1], c[2]], [c[0], bottom, c[2]], side);
  }
  for (let j = 0; j < nz; j++) {
    const a = P(0, j), b = P(0, j + 1);
    k.quad([b[0], bottom, b[2]], [b[0], b[1], b[2]], [a[0], a[1], a[2]], [a[0], bottom, a[2]], side);
    const c = P(nx, j), d = P(nx, j + 1);
    k.quad([c[0], bottom, c[2]], [c[0], c[1], c[2]], [d[0], d[1], d[2]], [d[0], bottom, d[2]], side);
  }
  k.quad([x0, bottom, z0], [x1, bottom, z0], [x1, bottom, z1], [x0, bottom, z1], side);
}

function groundMat(x, y, z) {
  if (y < -12.2) return M.mud;
  if (y < TIDE.mid - TIDE.amp + 0.6) return M.mud;
  if (y < TIDE.mid + TIDE.amp + 0.3) return M.sandbank;
  if (y > 8) return M.grass;
  if (x < -1 && x > -60 && z < 70) return M.earth; // town streets and yards
  return M.grass;
}

// The rock ridge under the castle, built from boxes around true voids (the cellars, the
// tower basements, the rock-cut ditch, the well shaft), so the section shows them open.
// A block (x0..x1, z0..z1, bottom..top) minus axis-aligned voids {x0,x1,z0,z1,y} (void from y up).
function carve(k, x0, x1, z0, z1, bot, top, voids, m) {
  const xs = new Set([x0, x1]), zs = new Set([z0, z1]);
  for (const v of voids) { for (const x of [v.x0, v.x1]) if (x > x0 && x < x1) xs.add(x); for (const z of [v.z0, v.z1]) if (z > z0 && z < z1) zs.add(z); }
  const X = [...xs].sort((a, b) => a - b), Z = [...zs].sort((a, b) => a - b);
  for (let i = 0; i < X.length - 1; i++) for (let j = 0; j < Z.length - 1; j++) {
    const cx = (X[i] + X[i + 1]) / 2, cz = (Z[j] + Z[j + 1]) / 2;
    let t = top;
    for (const v of voids) if (cx > v.x0 && cx < v.x1 && cz > v.z0 && cz < v.z1) t = Math.min(t, v.y);
    if (t > bot + 0.01) k.box(X[i], bot, Z[j], X[i + 1], t, Z[j + 1], m);
  }
}

function ridge(k) {
  const B = -31;
  const T = TOWERS;
  const voids = [
    { x0: T.sw.x - 3.35, x1: T.sw.x + 3.35, z0: -1, z1: 3.6, y: -3.5 },
    { x0: HALL.x0, x1: HALL.x1, z0: -1, z1: 9.25, y: HALL.cellar - 0.05 },
    { x0: DITCH.x0, x1: DITCH.x1, z0: DITCH.z0, z1: DITCH.z1, y: DITCH.y },
    { x0: WELL.x - WELL.r, x1: WELL.x + WELL.r, z0: WELL.z - WELL.r, z1: WELL.z + WELL.r, y: -WELL.depth - 0.4 },
    { x0: T.king.x - 3.35, x1: T.king.x + 3.35, z0: -1, z1: 3.6, y: -3.0 },
  ];
  // West barbican block, main wards, east barbican garden.
  carve(k, -1, 13.5, -1, 36.5, B, -2.2, voids, M.rock);
  carve(k, 13.5, 97.6, -1, 36.5, B, 0, voids, M.rock);
  carve(k, 97.6, 117.4, -1, 36.5, B, GARDEN.y, voids.concat([{ x0: 104, x1: 117.4, z0: 25.5, z1: 36.5, y: DOCK.y - 0.4 }]), M.rock);
  // East cliff down to the river bed.
  k.extrude([[117.4, B], [121.5, B], [121.5, -15], [119.6, -9], [118.2, -3.2], [117.4, GARDEN.y]], -1, 25.5, M.rock);
  k.extrude([[117.4, B], [121.5, B], [121.5, -15], [119.6, -9], [117.4, DOCK.y - 0.4]], 25.5, 36.5, M.rock);
}

export function buildTerrain(k) {
  ridge(k);
  // Near ground (2.5 m grid aligned to the ridge edges at x = -1, z = 36.5), and far country.
  heightfield(k, -81, 239, -1, 119, 2.5, groundH, groundMat, -32);
  const far = (x, z) => (x >= -81 && x <= 239 && z <= 119 ? -45 : groundH(x, z));
  heightfield(k, -1241, 1399, -1, 1599, 40, far, (x, y) => (y < TIDE.mid ? M.mud : y > 30 ? mat({ c: '#8a9468', c2: '#7a8458', pat: 'speckle' }) : M.grass), -46);

  // The estuary: a sea surface that rises and falls with the tide, and its cut face.
  const sea = makeSea({ level: 0, x0: -500, x1: 900, detailX0: 100, detailX1: 240, step: 1.5, mask: (x, z) => groundH(x, z) > TIDE.mid + TIDE.amp + 0.5 || inFoot(x, z), maskBox: [-90, 0, 260, 140], deep: '#3e6470', shallow: '#6f8a84', amp: 0.55 });
  sea.position.y = TIDE.mid;
  k.object(sea);
  return sea;
}

export { GARDEN };
