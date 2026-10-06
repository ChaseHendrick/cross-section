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
  if (inFoot(x, z)) return -15;
  // River Conwy: a channel running north-south east of the castle.
  const rc = 150 + Math.sin(z * 0.006) * 14;
  const dr = Math.abs(x - rc);
  const bed = -12.6 + noise(x, z, 11) * 0.4;
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
// xs, zs: node positions (fine near the castle, widening towards the horizon).
function heightfield(k, xs, zs, fn, mFn, bottom) {
  const nx = xs.length - 1, nz = zs.length - 1;
  const H = zs.map((z) => xs.map((x) => fn(x, z)));
  const P = (i, j) => [xs[i], H[j][i], zs[j]];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    if (Math.max(a[1], b[1], c[1], d[1]) < bottom + 0.5) continue;
    const m = mFn((a[0] + c[0]) / 2, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + c[2]) / 2);
    k.tri(a, d, c, m); k.tri(a, c, b, m);
  }
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
  // Bottom, only under the section near the cut (further back nothing can see it).
  k.quad([xs[0], bottom, zs[0]], [xs[nx], bottom, zs[0]], [xs[nx], bottom, Math.min(zs[nz], 4)], [xs[0], bottom, Math.min(zs[nz], 4)], side);
}
// Node positions: a fine run from a to b with step s, widening by `grow` out to `far` on each side.
function nodes(a, b, s, lo, hi, grow = 1.16) {
  const out = [];
  for (let v = a; v <= b + 1e-6; v += s) out.push(+v.toFixed(3));
  let w = s, v = a;
  while (v > lo) { w *= grow; v -= w; out.unshift(+Math.max(lo, v).toFixed(3)); }
  w = s; v = out[out.length - 1];
  while (v < hi) { w *= grow; v += w; out.push(+Math.min(hi, v).toFixed(3)); }
  return out;
}

function groundMat(x, y, z) {
  if (y < -11.4) return M.mud;
  if (y < TIDE.mid - TIDE.amp + 0.6) return M.mud;
  if (y < TIDE.mid + TIDE.amp + 0.3) return M.sandbank;
  if (y > 8) return M.grass;
  if (x < -1 && x > -60 && z < 70) return M.earth; // town streets and yards
  return M.grass;
}

// The rock ridge under the castle, with true voids for the cellars, the tower basements,
// the rock-cut ditch and the well shaft, so the section shows them open.
function ridge(k) {
  const B = -14;
  const T = TOWERS;
  // Front slab (z -1..3.6): one extrusion, so the section reads as one face of rock, with the
  // cellars and the front tower basements notched into its top.
  const sw = T.sw.x, kg = T.king.x;
  const front = [[-1, B], [-1, -2.2], [sw - 3.35, -2.2], [sw - 3.35, -3.5], [sw + 3.35, -3.5], [sw + 3.35, 0], [HALL.x0, 0], [HALL.x0, HALL.cellar - 0.05],
    [HALL.x1, HALL.cellar - 0.05], [HALL.x1, 0], [kg - 3.35, 0], [kg - 3.35, -3.0], [kg + 3.35, -3.0], [kg + 3.35, GARDEN.y], [117.4, GARDEN.y],
    [118.2, -3.2], [119.6, -9], [121.5, -12.8], [121.5, B]];
  // Strata: the section is drawn in three beds of rock, darker with depth.
  const clipY = (poly, lo, hi) => {
    let out = poly;
    const clip = (pts, test, yy) => {
      const res = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const ia = test(a[1]), ib = test(b[1]);
        if (ia) res.push(a);
        if (ia !== ib) { const t = (yy - a[1]) / (b[1] - a[1]); res.push([a[0] + (b[0] - a[0]) * t, yy]); }
      }
      return res;
    };
    out = clip(out, (y) => y >= lo, lo);
    out = clip(out, (y) => y <= hi, hi);
    return out.filter((p, i) => i === 0 || Math.abs(p[0] - out[i - 1][0]) > 1e-6 || Math.abs(p[1] - out[i - 1][1]) > 1e-6);
  };
  const beds = [[-4.6, 1, M.rock], [-9.2, -4.6, M.rock2], [B, -9.2, M.rock3]];
  for (const [lo, hi, m] of beds) k.extrude(clipY(front, lo, hi), -1, 3.6, m);
  // Behind it, bands along z whose profiles carry the voids that open at the top: the
  // cellars, the rock-cut ditch, the well shaft, the water-gate stair. Bands share no
  // caps (no hidden internal faces); the ends of the voids get their own faces.
  const base = (x) => (x < 13.5 ? -2.2 : x < 97.6 ? 0 : GARDEN.y);
  const band = (z0, z1, notches, backCap = false) => {
    const xs = [-1, 13.5, 97.6, 117.4];
    const pts = [[-1, B]];
    let cur = -1;
    const all = notches.slice().sort((a, b) => a[0] - b[0]);
    const pushTop = (xa, xb) => { // base top from xa to xb, with its steps
      for (const sx of xs) if (sx > xa && sx < xb) { pts.push([sx, base(sx - 0.01)]); pts.push([sx, base(sx + 0.01)]); }
      pts.push([xb, base(xb - 0.01)]);
    };
    pts.push([-1, base(-0.99)]);
    for (const [n0, n1, ny] of all) { pushTop(cur, n0); pts.push([n0, ny]); pts.push([n1, ny]); pts.push([n1, base(n1 + 0.01)]); cur = n1; }
    pushTop(cur, 117.4);
    pts.push([118.2, -3.2], [119.6, -9], [121.5, -12.8], [121.5, B]);
    // Drop consecutive duplicates.
    const clean = pts.filter((p, i) => i === 0 || Math.abs(p[0] - pts[i - 1][0]) > 1e-6 || Math.abs(p[1] - pts[i - 1][1]) > 1e-6);
    k.extrude(clean, z0, z1, M.rock, backCap ? { front: false } : { front: false, back: false });
  };
  const cel = [HALL.x0, HALL.x1, HALL.cellar - 0.05], dit = [DITCH.x0, DITCH.x1, DITCH.y];
  const wel = [WELL.x - WELL.r, WELL.x + WELL.r, B + 0.5], wg = [104, 117.4, DOCK.y - 0.4];
  band(3.6, DITCH.z0, [cel]);
  band(DITCH.z0, 9.25, [cel, dit]);
  band(9.25, WELL.z - WELL.r, [dit]);
  band(WELL.z - WELL.r, WELL.z + WELL.r, [wel, dit]);
  band(WELL.z + WELL.r, DITCH.z1, [dit]);
  band(DITCH.z1, 25.5, []);
  band(25.5, 36.5, [wg], true);
  // End faces of the voids, and the back of the ridge.
  k.quad([DITCH.x0, DITCH.y, DITCH.z0], [DITCH.x0, 0, DITCH.z0], [DITCH.x1, 0, DITCH.z0], [DITCH.x1, DITCH.y, DITCH.z0], M.rock);
  k.quad([DITCH.x1, DITCH.y, DITCH.z1], [DITCH.x1, 0, DITCH.z1], [DITCH.x0, 0, DITCH.z1], [DITCH.x0, DITCH.y, DITCH.z1], M.rock);
  k.quad([104, DOCK.y - 0.4, 25.5], [104, GARDEN.y, 25.5], [117.4, GARDEN.y, 25.5], [117.4, DOCK.y - 0.4, 25.5], M.rock);
}

export function buildTerrain(k) {
  ridge(k);
  // The ground: one heightfield, 2.5 m cells near the castle (aligned to the ridge edges at
  // x = -1 and z = 36.5) widening towards the hills on the horizon.
  const xs = nodes(-81, 239, 2.5, -1300, 1500), zs = nodes(-1, 119, 2.5, -1, 1700).filter((z) => z >= -1);
  heightfield(k, xs, zs, groundH, (x, y, z) => (y > 30 ? mat({ c: '#8a9468', c2: '#7a8458', pat: 'speckle' }) : groundMat(x, y, z)), -14.5);

  // The estuary: a sea surface that rises and falls with the tide, and its cut face.
  const sea = makeSea({ level: 0, x0: -500, x1: 900, detailX0: 100, detailX1: 240, step: 1.5, mask: (x, z) => groundH(x, z) > TIDE.mid + TIDE.amp + 0.5 || inFoot(x, z), maskBox: [-90, 0, 260, 140], deep: '#3e6470', shallow: '#6f8a84', amp: 0.55 });
  sea.position.y = TIDE.mid;
  k.object(sea);
  return sea;
}

export { GARDEN };
