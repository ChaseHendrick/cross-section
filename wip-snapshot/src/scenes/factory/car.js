/* The 1914 Model T, in stages of assembly (dossier sections 2 and 10).
 * Wheelbase 2.54 m, track 1.42 m, length 3.40 m, 30 in wheels. Black only from 1914; a flat
 * hood without louvres; acetylene headlamps; wooden artillery wheels.
 * Local frame: origin on the ground under the middle of the rear axle, front towards +x.
 */
import { THREE, mat } from '../../engine/index.js';
import { M } from './common.js';

export const WB = 2.54, TRACK = 1.42, WR = 0.38;
const frameM = mat({ c: '#1e1c1a', c2: '#2a2826', cut: '#121110' });
const engM = mat({ c: '#2c2c30', c2: '#3a3a40', cut: '#18181a' });
const woodDash = mat({ c: '#6a4428', c2: '#5a3820', pat: 'grain', cut: '#3a2414' });
const spokeM = mat({ c: '#2a2422', cut: '#1a1614' });
const tyreM = mat({ c: '#6a665e', c2: '#5a564e', cut: '#4a463e' });
const topM = mat({ c: '#24221f', c2: '#302d29', cut: '#141210' });
const glassM = mat({ c: '#b8ccd2', c2: '#d8e4e8', cut: '#8a9ea4' });

const torus = new THREE.TorusGeometry(WR - 0.04, 0.045, 5, 14);
const mtx = new THREE.Matrix4();

// A wooden artillery wheel in the x-y plane at (x, y, z) (y = hub height).
export function wheel(k, x, y, z, o = {}) {
  mtx.makeTranslation(x, y, z);
  k.geo(torus, mtx, tyreM);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    const dx = Math.cos(a) * (WR - 0.07), dy = Math.sin(a) * (WR - 0.07);
    k.beam([x - dx, y - dy, z], [x + dx, y + dy, z], 0.035, spokeM);
  }
  k.cyl(x, y, z - 0.07, 0.07, 0.14, o.hub || M.brass, { axis: 'z', seg: 7 });
}

// Stage flags: { axles, tank, engine, dash, wheels, radiator, hood, body, top, fenders, lamps, paint }
export function modelT(k, x, y, z, s = {}) {
  const X = (dx) => x + dx, Y = (dy) => y + dy, Z = (dz) => z + dz;
  const bodyM = s.paint || M.enamel;
  if (s.frame !== false) {
    // Frame: two channel rails and cross members, and the rear transverse spring.
    for (const dz of [-0.43, 0.39]) k.box(X(-0.42), Y(0.52), Z(dz), X(2.78), Y(0.64), Z(dz + 0.04), frameM);
    k.box(X(2.72), Y(0.5), Z(-0.43), X(2.8), Y(0.62), Z(0.43), frameM);
    k.box(X(-0.46), Y(0.54), Z(-0.43), X(-0.38), Y(0.64), Z(0.43), frameM);
    k.box(X(-0.08), Y(0.62), Z(-0.5), X(0.08), Y(0.7), Z(0.5), frameM);
  }
  if (s.axles) {
    // Rear axle with its differential and torque tube; front axle with radius rods.
    k.cyl(X(0), Y(WR), Z(-0.68), 0.055, 1.36, frameM, { axis: 'z', seg: 6 });
    k.sphere(X(0), Y(WR), Z(0), 0.16, frameM, { seg: 8, rings: 5 });
    k.cyl(X(0.1), Y(WR + 0.04), Z(0), 0.045, 1.25, frameM, { axis: 'x', seg: 6 });
    k.box(X(WB - 0.04), Y(WR - 0.04), Z(-0.66), X(WB + 0.04), Y(WR + 0.05), Z(0.66), frameM);
    k.box(X(WB - 0.07), Y(0.58), Z(-0.45), X(WB + 0.07), Y(0.64), Z(0.45), frameM);
    k.beam([X(WB), Y(WR), Z(-0.55)], [X(1.25), Y(0.42), Z(0)], 0.035, frameM);
    k.beam([X(WB), Y(WR), Z(0.55)], [X(1.25), Y(0.42), Z(0)], 0.035, frameM);
    k.sphere(X(1.25), Y(0.42), Z(0), 0.05, frameM, { seg: 6, rings: 4 });
  }
  if (s.tank) k.cyl(X(0.42), Y(0.86), Z(-0.45), 0.2, 0.9, frameM, { axis: 'z', seg: 10 });
  if (s.engine) {
    // Flywheel-magneto housing and transmission, then the four-cylinder block and head.
    k.cyl(X(1.02), Y(0.74), Z(0), 0.26, 0.5, engM, { axis: 'x', seg: 10 });
    k.box(X(1.52), Y(0.56), Z(-0.2), X(2.3), Y(1.02), Z(0.2), engM);
    k.box(X(1.55), Y(1.02), Z(-0.17), X(2.27), Y(1.1), Z(0.17), engM);
    k.box(X(1.5), Y(0.45), Z(-0.16), X(2.32), Y(0.58), Z(0.16), engM);
    k.cyl(X(1.6), Y(0.82), Z(0.2), 0.05, 0.6, M.steel, { axis: 'x', seg: 5 });
    k.cyl(X(2.38), Y(0.98), Z(0), 0.07, 0.06, M.steel, { axis: 'x', seg: 8 });
  }
  if (s.dash) {
    k.box(X(1.08), Y(0.62), Z(-0.5), X(1.12), Y(1.32), Z(0.5), woodDash);
    k.beam([X(1.05), Y(1.0), Z(-0.2)], [X(0.55), Y(1.55), Z(-0.2)], 0.04, frameM);
    k.cyl(X(0.53), Y(1.56), Z(-0.2), 0.2, 0.025, woodDash, { axis: 'x', seg: 12 });
  }
  if (s.radiator) {
    k.box(X(2.78), Y(0.66), Z(-0.31), X(2.94), Y(1.5), Z(0.31), M.brass);
    k.box(X(2.94), Y(0.74), Z(-0.25), X(2.95), Y(1.42), Z(0.25), mat({ c: '#2a2a2a', c2: '#4a4a48', pat: 'grate' }));
    k.cyl(X(2.86), Y(1.5), Z(0), 0.04, 0.06, M.brass, { seg: 6 });
  }
  if (s.hood) {
    // A flat, five-sided hood without louvres.
    k.extrudeX([[Z(-0.3), Y(1.08)], [Z(0.3), Y(1.08)], [Z(0.3), Y(1.3)], [Z(0.12), Y(1.38)], [Z(-0.12), Y(1.38)], [Z(-0.3), Y(1.3)]], X(1.12), X(2.78), bodyM);
  }
  if (s.wheels) {
    for (const dz of [-TRACK / 2, TRACK / 2]) { wheel(k, X(0), Y(WR), Z(dz)); wheel(k, X(WB), Y(WR), Z(dz)); }
  }
  if (s.fenders) {
    for (const dz of [-1, 1]) {
      const zz = Z(dz * 0.74);
      k.box(X(0.35), Y(0.66), zz - 0.13, X(2.1), Y(0.7), zz + 0.13, bodyM);
      k.extrude([[X(WB - 0.5), Y(0.68)], [X(WB - 0.42), Y(0.86)], [X(WB - 0.1), Y(0.92)], [X(WB + 0.3), Y(0.86)], [X(WB + 0.45), Y(0.74)], [X(WB + 0.4), Y(0.72)], [X(WB + 0.25), Y(0.82)], [X(WB - 0.1), Y(0.87)], [X(WB - 0.38), Y(0.82)]], zz - 0.13, zz + 0.13, bodyM);
      k.extrude([[X(-0.45), Y(0.68)], [X(-0.35), Y(0.86)], [X(0), Y(0.92)], [X(0.35), Y(0.86)], [X(0.4), Y(0.68)], [X(0.32), Y(0.68)], [X(0.28), Y(0.82)], [X(0), Y(0.87)], [X(-0.3), Y(0.82)], [X(-0.38), Y(0.68)]], zz - 0.13, zz + 0.13, bodyM);
    }
  }
  if (s.lamps) {
    for (const dz of [-0.42, 0.42]) {
      k.cyl(X(3.02), Y(1.12), Z(dz), 0.11, 0.16, M.brass, { axis: 'x', seg: 10 });
      k.cyl(X(3.18), Y(1.12), Z(dz), 0.09, 0.01, glassM, { axis: 'x', seg: 10 });
    }
  }
  if (s.body) body(k, x, y, z, bodyM, s.top, s.seats !== false);
}

// The five-passenger touring body, alone (as it rides the paint and trim lines) or on a chassis.
// Local frame as for modelT; the body sits from the dash (x 1.1) back to the tail (x -0.6).
export function body(k, x, y, z, m = M.enamel, top = false, seats = true) {
  const X = (dx) => x + dx, Y = (dy) => y + dy, Z = (dz) => z + dz;
  const w = 0.72;
  // Floor and sides (a tub open at the top).
  k.box(X(-0.62), Y(0.66), Z(-w), X(1.1), Y(0.72), Z(w), m);
  for (const s of [-1, 1]) k.extrude([[X(-0.62), Y(0.72)], [X(1.1), Y(0.72)], [X(1.1), Y(1.25)], [X(0.15), Y(1.28)], [X(-0.1), Y(1.36)], [X(-0.62), Y(1.36)]], Z(s * w - 0.04), Z(s * w + 0.04), m);
  k.box(X(-0.66), Y(0.72), Z(-w), X(-0.6), Y(1.36), Z(w), m);
  k.box(X(1.06), Y(0.72), Z(-w), X(1.12), Y(1.25), Z(w), m);
  if (seats) {
    const seat = M.leather;
    k.box(X(0.3), Y(0.72), Z(-w + 0.05), X(0.75), Y(1.0), Z(w - 0.05), seat);
    k.box(X(0.22), Y(0.95), Z(-w + 0.05), X(0.32), Y(1.45), Z(w - 0.05), seat);
    k.box(X(-0.5), Y(0.72), Z(-w + 0.05), X(-0.05), Y(1.02), Z(w - 0.05), seat);
    k.box(X(-0.6), Y(1.0), Z(-w + 0.05), X(-0.5), Y(1.5), Z(w - 0.05), seat);
  }
  if (top) {
    // Windshield and the folding top raised on its bows.
    k.box(X(1.08), Y(1.25), Z(-w), X(1.12), Y(1.95), Z(w), m, { front: glassM, back: glassM });
    k.box(X(-0.7), Y(1.92), Z(-w - 0.02), X(1.12), Y(1.98), Z(w + 0.02), topM);
    for (const bx of [-0.6, 0.25]) for (const s of [-1, 1]) k.beam([X(bx), Y(1.3), Z(s * (w - 0.02))], [X(bx), Y(1.94), Z(s * (w - 0.02))], 0.03, frameM);
    k.extrude([[X(-0.7), Y(1.36)], [X(-0.62), Y(1.36)], [X(-0.62), Y(1.92)], [X(-0.7), Y(1.92)]], Z(-w), Z(w), topM);
  }
}
