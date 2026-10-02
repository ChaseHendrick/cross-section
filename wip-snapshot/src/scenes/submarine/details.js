/* Submarine scene: the small things that make the compartments feel lived in and worked in:
 * hand wheels, levers, needles, ventilation trunks, phones, extinguishers, clothes on hooks,
 * coffee mugs, shoes under bunks. Some are parts the scene animates.
 */
import { THREE, mat, shade } from '../../engine/index.js';
import { X, DECK, LOW, CT, M, roomZ, ceilY, phY, phIn } from './geom.js';
import { A, backZ, dial } from './rooms.js';

// A spoked hand wheel facing the viewer (axis z), built in a part kit around (0, 0, 0).
function wheel(q, r, m, spokes = 6, t = 0.035) {
  const g = new THREE.TorusGeometry(r, t, 6, 20);
  q.geo(g, new THREE.Matrix4(), m);
  for (let i = 0; i < spokes; i++) { const a = (i / spokes) * Math.PI * 2; q.beam([0, 0, 0], [Math.cos(a) * r, Math.sin(a) * r, 0], 0.025, m); }
  q.cyl(0, 0, -0.04, 0.06, 0.08, M.steel, { axis: 'z', seg: 8 });
}
// A needle for a dial, pivot at (0, 0, 0), pointing up.
function needle(q, len, m = M.gauge) { q.box(-0.006, 0, -0.012, 0.006, len, -0.004, m); }

// Small fittings hung on the hull face at height y.
function onHull(k, x, y, d, fn) { const z = Math.min(roomZ(x, y), roomZ(x, y + 0.3)) - d - 0.02; if (z > 0.3) fn(z); }
function extinguisher(k, x, y) { onHull(k, x, y, 0.16, (z) => { k.cyl(x, y, z + 0.08, 0.075, 0.5, mat({ c: '#b8322a', cut: '#7a2018' }), { seg: 8 }); k.box(x - 0.03, y + 0.5, z + 0.05, x + 0.03, y + 0.58, z + 0.11, M.gauge); }); }
function phone(k, x, y) { onHull(k, x, y, 0.12, (z) => { k.box(x - 0.11, y, z, x + 0.11, y + 0.28, z + 0.12, M.machDk); k.box(x - 0.04, y + 0.06, z - 0.04, x + 0.04, y + 0.2, z, M.gauge); }); }
function coat(k, x, y, c) { onHull(k, x, y, 0.14, (z) => { k.box(x - 0.16, y - 0.75, z + 0.02, x + 0.16, y, z + 0.14, mat({ c, c2: shade(c, -0.15), pat: 'canvas', s: 0.1 })); k.cyl(x, y, z + 0.08, 0.012, 0.06, M.brass, { seg: 4 }); }); }
function hatOnHook(k, x, y, c) { onHull(k, x, y, 0.16, (z) => { k.sphere(x, y, z + 0.08, 0.1, mat(c), { seg: 8, rings: 4, t0: Math.PI / 2 }); }); }
function lifeJacket(k, x, y) { onHull(k, x, y, 0.12, (z) => { k.box(x - 0.15, y - 0.45, z, x + 0.15, y, z + 0.12, mat({ c: '#c8a84a', c2: '#b8983a', pat: 'quilt', s: 0.08 })); }); }
function valveWheel(k, x, y, r = 0.1, m = M.brass) { onHull(k, x, y, 0.1, (z) => { k.cyl(x, y, z + 0.04, 0.02, 0.08, M.steel, { axis: 'z', seg: 5 }); const g = new THREE.TorusGeometry(r, 0.015, 4, 12); k.geo(g, new THREE.Matrix4().makeTranslation(x, y, z), m); }); }
function junction(k, x, y) { onHull(k, x, y, 0.08, (z) => { k.box(x - 0.08, y, z, x + 0.08, y + 0.16, z + 0.08, M.cabinet); }); }

// A rectangular ventilation trunk along the overhead.
function ventTrunk(k, x0, x1, z) {
  const m = mat({ c: '#bcc0b8', c2: '#acb0a8', pat: 'panels', s: 0.6, cut: '#7a7e78' });
  const n = Math.ceil((x1 - x0) / 1.2);
  for (let i = 0; i < n; i++) {
    const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n;
    const top = Math.min(ceilY(a, z + 0.18), ceilY(b, z + 0.18)) - 0.04;
    k.box(a, top - 0.22, z - 0.16, b, top, z + 0.16, m);
  }
  for (let x = x0 + 0.8; x < x1; x += 2.4) k.box(x - 0.12, ceilY(x, z) - 0.3, z - 0.18, x + 0.12, ceilY(x, z) - 0.26, z + 0.18, M.machDk);
}

export function buildDetails(k, P) {
  const cr = A.spots.cr;
  // Diving station: bow and stern plane hand wheels (S7), turning while submerged.
  P.planeWheels = cr.wheels.map(([x, y, z]) => k.part(x, y, z, (q) => wheel(q, 0.36, M.brass, 6, 0.035)));
  P.depthNeedles = cr.gauges.map(([x, y, z]) => k.part(x, y, z - 0.045, (q) => needle(q, 0.12)));
  // Maneuvering room: the ten levers of the control stand (S39) and the battery ammeter.
  P.levers = A.spots.levers.map((x, i) => k.part(x, DECK.man + 1.06, 1.0, (q) => {
    q.cyl(0, 0, 0, 0.012, 0.32, M.steel, { seg: 5 });
    q.sphere(0, 0.34, 0, 0.035, i % 5 === 0 ? M.redLens : M.brass, { seg: 6, rings: 4 });
  }));
  const az = backZ(70.6, 74.4, DECK.man, DECK.man + 1.55, 0.45);
  k.cyl(72.5, DECK.man + 1.72, az + 0.1, 0.17, 0.05, M.gauge, { axis: 'z', seg: 16 });
  k.cyl(72.5, DECK.man + 1.72, az + 0.05, 0.15, 0.02, M.dial, { axis: 'z', seg: 16 });
  P.ammeter = k.part(72.5, DECK.man + 1.72, az + 0.03, (q) => needle(q, 0.13, mat({ c: '#b8322a' })));
  // Ventilation trunks along the overhead.
  ventTrunk(k, X.ftrF + 0.4, X.fb - 0.3, 1.25);
  ventTrunk(k, X.fb + 0.3, X.cr - 0.3, 1.3);
  ventTrunk(k, X.ab + 0.3, X.fer - 0.3, 0.95);
  ventTrunk(k, X.man + 0.3, X.atr - 0.3, 1.3);
  ventTrunk(k, X.atr + 0.4, X.phA - 0.5, 1.25);
  // Extinguishers, phones, junction boxes, valves along the hull in every compartment.
  const r = k.rng('detail');
  const rooms = [[X.ftrF + 0.4, X.fb - 0.3, DECK.ftr], [X.fb + 0.2, X.cr - 0.2, DECK.fb], [X.cr + 0.2, X.ab - 0.2, DECK.cr], [X.ab + 0.2, X.fer - 0.2, DECK.ab],
    [X.fer + 0.2, X.man - 0.2, DECK.eng], [X.man + 0.2, X.atr - 0.2, DECK.man], [X.atr + 0.2, X.phA - 0.3, DECK.atr]];
  for (const [x0, x1, y] of rooms) {
    extinguisher(k, x0 + 0.35, y + 1.35);
    phone(k, x1 - 0.4, y + 1.55);
    for (let x = x0 + 0.9; x < x1 - 0.3; x += 1.1 + r() * 0.8) {
      const pick = r();
      if (pick < 0.4) valveWheel(k, x, y + 1.9 + r() * 0.2, 0.06 + r() * 0.05, r() < 0.5 ? M.brass : M.pipeRed);
      else if (pick < 0.7) junction(k, x, y + 1.85);
    }
  }
  // Clothes: foul-weather parkas and life jackets by the control room ladder (S41), caps on hooks.
  coat(k, 38.3, DECK.cr + 1.85, '#4a4e44');
  coat(k, 38.55, DECK.cr + 1.8, '#3e4448');
  lifeJacket(k, 33.0, DECK.cr + 2.0);
  hatOnHook(k, 24.6, DECK.fb + 1.95, '#b8a47a');
  hatOnHook(k, 28.6, DECK.fb + 1.9, '#2e2e30');
  for (const x of [77.4, 85.4]) lifeJacket(k, x, DECK.atr + 1.95);
  // Shoes under the berthing bunks, towels and dungarees hung on the bunk rails.
  for (const b of A.bunks.crew) if (b.y < DECK.ab + 0.6 && r() < 0.7) { const x = b.x0 + 0.3 + r() * 1.2; k.box(x, DECK.ab, 0.7, x + 0.1, DECK.ab + 0.08, 0.98, M.gauge); k.box(x + 0.13, DECK.ab, 0.72, x + 0.23, DECK.ab + 0.08, 1.0, M.gauge); }
  for (const b of A.bunks.crew.concat(A.bunks.ftr, A.bunks.atr)) if (r() < 0.35) k.box(b.x0 + 0.6, b.y - 0.25, b.z - 0.37, b.x0 + 0.9, b.y + 0.02, b.z - 0.34, mat({ c: r.pick(['#e8e4d8', '#8a9aa8', '#c8b88a']) }));
  // Mugs on the mess tables, a pie under a cover, the coffee urn's spout.
  for (const [x, z] of [[43.8, 0.9], [44.1, 1.6], [45.1, 1.4], [45.4, 0.75], [43.95, 1.3]]) k.cyl(x, DECK.ab + 0.76, z, 0.04, 0.09, mat({ c: '#e8e2d2', cut: '#b8b2a2' }), { seg: 8 });
  k.cyl(45.3, DECK.ab + 0.76, 1.75, 0.13, 0.05, mat({ c: '#c8904a', c2: '#a87038', pat: 'grain', s: 0.03 }), { seg: 12 });
  // Galley: bread pans stacked, ladles on hooks, a meat block.
  for (let i = 0; i < 4; i++) k.box(42.35, DECK.ab + 0.88 + i * 0.07, 0.45, 42.75, DECK.ab + 0.93 + i * 0.07, 0.75, M.steel);
  for (let i = 0; i < 4; i++) k.cyl(41.0 + i * 0.4, DECK.ab + 1.25, 1.55, 0.012, 0.3, M.steel, { seg: 4 });
  // Wardroom: the coffee pot, cups, a pile of letters, a framed photograph.
  k.cyl(25.95, DECK.fb + 0.74, 1.05, 0.08, 0.2, M.stainless, { seg: 10 });
  for (const [x, z] of [[25.2, 0.95], [26.2, 1.25], [25.6, 1.35]]) k.cyl(x, DECK.fb + 0.74, z, 0.035, 0.07, M.white, { seg: 8 });
  for (let i = 0; i < 5; i++) k.box(26.0 + (i % 3) * 0.05, DECK.fb + 0.745 + i * 0.012, 0.85 + i * 0.03, 26.2 + (i % 3) * 0.05, DECK.fb + 0.755 + i * 0.012, 0.98 + i * 0.03, M.white);
  // Captain's desk: night order book and the mail.
  k.box(28.75, DECK.fb + 0.76, 0.25, 29.05, DECK.fb + 0.8, 0.45, mat({ c: '#2a3a5a', cut: '#1a2a3a' }));
  for (let i = 0; i < 6; i++) k.box(29.1, DECK.fb + 0.76 + i * 0.01, 0.3, 29.32, DECK.fb + 0.77 + i * 0.01, 0.45, M.white);
  // Forward torpedo room: grease buckets, a tool rack, the trim manifold handles.
  for (const x of [13.2, 19.8]) k.cyl(x, DECK.ftr, 0.2, 0.12, 0.28, mat({ c: '#5a5e5a', cut: '#3a3e3a' }), { seg: 8 });
  const tz = backZ(19.6, 20.0, DECK.ftr + 0.2, DECK.ftr + 1.1, 0.06);
  k.box(19.55, DECK.ftr + 0.25, tz, 19.95, DECK.ftr + 1.05, tz + 0.04, M.wood);
  for (let i = 0; i < 5; i++) k.box(19.6 + i * 0.07, DECK.ftr + 0.5, tz - 0.03, 19.63 + i * 0.07, DECK.ftr + 0.85, tz, M.steel);
  // Pump room: the drain and trim pump pipework.
  k.tube([[36.4, LOW.pump + 0.4, 1.0], [36.4, LOW.pump + 1.3, 1.0], [37.4, LOW.pump + 1.6, 1.4]], 0.06, M.pipeGreen);
  k.tube([[33.3, LOW.pump + 0.55, 0.3], [33.3, LOW.pump + 1.7, 0.3], [35.0, LOW.pump + 1.9, 0.9]], 0.05, M.pipe);
  // Engine rooms: the vertical drive housing at the generator end, jacket water piping, tool boards.
  for (const sp of A.spots.eng) {
    const x = sp.ex1 + 0.02;
    k.box(x - 0.25, LOW.eng + 0.25, sp.z0 + 0.15, x + 0.12, 4.95, 1.75, M.engine);
    k.tube([[sp.ex0 + 0.2, 4.45, sp.z0 - 0.05], [sp.ex1 - 0.2, 4.45, sp.z0 - 0.05]], 0.045, M.pipeGreen);
    k.tube([[sp.ex0 - 0.1, 4.45, sp.z0 - 0.05], [sp.ex0 - 0.3, 4.2, sp.z0 + 0.2], [sp.ex0 - 0.3, LOW.eng + 0.4, sp.z0 + 0.2]], 0.045, M.pipeGreen);
    k.box(sp.ex0 + 0.4, 4.95, sp.z0 + 0.2, sp.ex0 + 1.4, 5.25, sp.z0 + 0.8, M.machDk); // scavenging air blower
    const bz = backZ(sp.gx0 + 0.3, sp.gx0 + 1.3, DECK.eng + 0.4, DECK.eng + 1.4, 0.05);
    k.box(sp.gx0 + 0.3, DECK.eng + 0.4, bz, sp.gx0 + 1.3, DECK.eng + 1.35, bz + 0.04, M.wood);
    for (let i = 0; i < 6; i++) k.box(sp.gx0 + 0.38 + i * 0.15, DECK.eng + 0.7, bz - 0.03, sp.gx0 + 0.42 + i * 0.15, DECK.eng + 1.15, bz, M.steel);
    // Oil cans and rags on the upper flat.
    k.cyl(sp.gx0 + 1.6, DECK.eng, 0.95, 0.08, 0.2, mat({ c: '#b8322a', cut: '#7a2018' }), { seg: 8 });
    k.box(sp.gx0 + 1.75, DECK.eng, 0.85, sp.gx0 + 1.95, DECK.eng + 0.05, 1.05, mat({ c: '#d8d0b8' }));
  }
  // Maneuvering room: switchboard knife switches and the ground detector lamps (S18).
  const cz = backZ(70.6, 74.4, DECK.man, DECK.man + 1.55, 0.45);
  for (let i = 0; i < 12; i++) k.box(70.8 + i * 0.3, DECK.man + 0.6, cz - 0.04, 70.86 + i * 0.3, DECK.man + 0.85, cz, M.gauge);
  // After torpedo room: canned food stacked on the deck between the reloads (S11: stores everywhere).
  for (let i = 0; i < 8; i++) k.box(80.0 + i * 0.36, DECK.atr, 0.62, 80.32 + i * 0.36, DECK.atr + 0.22, 0.88, mat({ c: '#c8b48a', c2: '#b8a47a', pat: 'planks', s: 0.07, cut: '#8a7a5a' }));
  // Conning tower: the periscope hoist control and a chart of the patrol area.
  k.box(35.95, CT.deck + 1.2, 0.95, 36.55, CT.deck + 1.55, 1.0, mat({ c: '#e8e0c8', c2: '#9ab0b8', pat: 'stripes', s: 0.08 }));
  // Hull frames in the control room show as rings already; add the hull number on the bulkhead.
  void LOW; void phY; void phIn;
}
