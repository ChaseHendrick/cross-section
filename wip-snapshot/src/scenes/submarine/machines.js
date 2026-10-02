/* Submarine scene: the conning tower, bridge rig, guns, stern gear and everything that moves. */
import { mat, props } from '../../engine/index.js';
import { X, DECK, LOW, CT, BRIDGE, SHEARS, SHAFT, M, RED, deckY, shaftY, keelY, phY, phR } from './geom.js';
import { light, dial, backZ, A } from './rooms.js';
import { outerZ } from './hull.js';

// ------------------------------------------------------------------ conning tower interior (S8)
function conningTowerInterior(k) {
  const y = CT.deck;
  // Torpedo Data Computer, aft on the port side (here at the after end against the shell).
  k.box(38.0, y, 0.35, 38.95, y + 1.35, 0.95, M.cabinet);
  for (let i = 0; i < 6; i++) dial(k, 38.15 + (i % 3) * 0.3, y + 0.85 + Math.floor(i / 3) * 0.28, 0.35, 0.06);
  for (let i = 0; i < 3; i++) k.cyl(38.2 + i * 0.28, y + 0.55, 0.32, 0.05, 0.04, M.steel, { axis: 'z', seg: 8 });
  A.spots.tdc = [38.45, y, -0.1];
  // SJ radar console with its scope, WCA sonar stack, torpedo indicating panel.
  k.box(34.05, y, 0.75, 34.75, y + 1.1, 1.05, M.cabinet);
  k.cyl(34.4, y + 0.85, 0.74, 0.12, 0.02, M.screen, { axis: 'z', seg: 14 });
  A.spots.radar = [34.4, y, 0.32];
  k.box(37.25, y, 0.82, 37.85, y + 1.25, 1.02, M.cabinet);
  k.cyl(37.55, y + 0.95, 0.81, 0.08, 0.02, M.screen, { axis: 'z', seg: 12 });
  // Main steering station: helm wheel and the engine order annunciators.
  k.box(35.05, y, 0.88, 35.3, y + 0.95, 1.05, M.machDk);
  k.cyl(35.18, y + 1.05, 0.62, 0.26, 0.05, M.brass, { axis: 'z', seg: 16 });
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; k.box(35.18 + Math.cos(a) * 0.28 - 0.015, y + 1.05 + Math.sin(a) * 0.28 - 0.015, 0.6, 35.18 + Math.cos(a) * 0.28 + 0.015, y + 1.05 + Math.sin(a) * 0.28 + 0.015, 0.68, M.brass); }
  dial(k, 35.55, y + 1.25, 0.95, 0.09); dial(k, 35.8, y + 1.25, 0.95, 0.09);
  A.spots.helm = [35.18, y, 0.3];
  // Dead reckoning tracer, the talker's phone box.
  k.box(36.2, y, 0.95, 36.9, y + 0.85, 1.12, M.cabinet);
  k.box(36.25, y + 0.85, 0.95, 36.85, y + 0.88, 1.12, mat({ c: '#d8d4c4', cut: '#a8a494' }));
  A.spots.talker = [36.0, y, 0.6];
  // Upper hatch to the bridge (S29) with its ladder.
  props.ladder(k, 34.3, y, CT.yc + CT.r + 0.05, 0.2, { w: 0.36, color: '#9aa09a' });
  k.lamp(36.3, CT.yc + CT.r - 0.25, 0.3, { color: RED, r: 1.8, i: 0.38, halo: 0.12, bulbR: 0.03 });
  k.lamp(38.4, y + 1.6, 0.3, { color: RED, r: 1.2, i: 0.25, halo: 0.08, bulbR: 0.025 });
}

// ------------------------------------------------------------------ shears, masts and the bridge
function shears(k) {
  const y0 = BRIDGE.deck;
  // Two tapered periscope shears, joined by webs (S45).
  const sh = mat({ c: '#8c9398', c2: '#7c8388', pat: 'plates', s: 0.6, whole: true });
  for (const px of [SHEARS.x1, SHEARS.x2]) k.lathe([[0.3, y0], [0.27, y0 + 2.2], [0.2, SHEARS.top - 0.2], [0.16, SHEARS.top]], px, 0, sh, { seg: 14, capTop: false, capBot: false });
  k.box(SHEARS.x1, y0 + 1.2, -0.04, SHEARS.x2, SHEARS.top - 0.6, 0.04, sh);
  k.box(SHEARS.x1 - 0.25, SHEARS.top - 0.15, -0.18, SHEARS.x2 + 0.25, SHEARS.top, 0.18, sh);
  // Lookout platforms either side of the shears, with rails (S22).
  for (const s of [1, -1]) {
    const z0 = s > 0 ? 0.32 : -1.32, z1 = s > 0 ? 1.32 : -0.32;
    k.box(35.7, 10.55, z0, 36.95, 10.62, z1, mat({ c: '#4a4e52', pat: 'grate', s: 0.08, c2: '#2a2e32', whole: true }));
    const zr = s > 0 ? 1.3 : -1.3;
    k.cyl(35.7, 10.62 + 0.9, zr, 0.02, 1.25, M.mastDk, { axis: 'x', seg: 5 });
    for (const x of [35.72, 36.33, 36.93]) k.cyl(x, 10.62, zr, 0.02, 0.9, M.mastDk, { seg: 5 });
    k.beam([35.75, 10.55, s * 0.4], [35.75, 9.0, s * 0.4], 0.05, M.mastDk);
    A.spots['look' + (s > 0 ? 'S' : 'P')] = [36.3, 10.62, s * 0.85];
  }
  // SJ radar mast with its reflector (animated) and the SD mast (S45, S48).
  k.cyl(38.25, y0, 0, 0.12, 14.55 - y0, M.mast, { seg: 10 });
  k.cyl(39.3, y0, 0, 0.08, 15.6 - y0, M.mast, { seg: 8 });
  // Vertical antenna mast, lowered position (S1).
  k.cyl(40.35, 9.7, 0, 0.05, 13.58 - 9.7, M.mastDk, { seg: 6 });
  // Bridge rail round the after gun deck and the bridge, whole so it reads.
  k.cyl(40.85, 9.7 + 0.95, 1.0, 0.025, 2.1, M.mastDk, { axis: 'x', seg: 5 });
}

// ------------------------------------------------------------------ guns
function guns(k) {
  // The 4-inch gun forward of the conning tower, trained fore and aft (S24, S1 p.26).
  const gx = 28.6, gy = deckY(gx), ax = 8.53;
  k.cyl(gx, gy, 0, 0.5, 0.22, M.gun, { seg: 16 });
  k.cyl(gx, gy + 0.22, 0, 0.3, ax - gy - 0.55, M.gun, { seg: 14 });
  k.box(gx - 0.55, ax - 0.4, -0.32, gx + 0.65, ax + 0.18, 0.32, M.gun);       // carriage and slide
  k.cyl(gx - 4.6, ax, 0, 0.075, 5.1, M.gun, { axis: 'x', seg: 12, r2: 0.11 }); // 4"/50 barrel
  k.cyl(gx - 0.2, ax, 0, 0.17, 1.0, M.gun, { axis: 'x', seg: 12 });           // recoil cylinder
  k.box(gx + 0.45, ax - 0.2, -0.15, gx + 0.8, ax + 0.14, 0.15, M.gunDk);      // breech
  for (const s of [-1, 1]) { k.box(gx - 0.1, ax - 0.75, s * 0.45 - 0.06, gx + 0.15, ax - 0.6, s * 0.45 + 0.06, M.gunDk); k.box(gx - 0.35, ax - 0.25, s * 0.42 - 0.03, gx - 0.15, ax + 0.0, s * 0.42 + 0.03, M.gunDk); }
  A.spots.gun = [gx + 1.2, gy, 0.6];
  // Ready-use ammunition locker (illustrative).
  k.box(30.3, deckY(30.3), 0.55, 30.9, deckY(30.3) + 0.6, 1.05, mat({ c: '#6a7276', cut: '#2a2e32' }));
  // 20 mm forward on the gun platform, 40 mm on the after gun deck (S22; March 1945 fit unverified).
  k.cyl(32.9, 9.1, 0, 0.1, 0.85, M.gun, { seg: 8 });
  k.box(32.75, 9.85, -0.12, 33.05, 10.15, 0.12, M.gun);
  k.cyl(32.88, 10.0, 0, 0.035, 1.5, M.gun, { axis: 'x', r2: 0.025, seg: 6 });
  k.cyl(41.9, 9.7, 0, 0.32, 0.55, M.gun, { seg: 12 });
  k.box(41.55, 10.25, -0.42, 42.35, 10.75, 0.42, M.gun);
  k.cyl(42.3, 10.5, -0.15, 0.05, 2.0, M.gun, { axis: 'x', seg: 8 });
}

// ------------------------------------------------------------------ stern gear
function sternGear(k, P) {
  // Rudder (9.1 square metres, S1 p.21) on the centreline, cut through.
  k.poly([[93.2, 0.7, 0.12], [95.6, 0.9, 0.12], [95.7, 4.4, 0.12], [93.6, 4.5, 0.12]], M.bottom);
  k.box(93.25, 0.75, -0.3, 95.6, 4.45, 0.12, mat({ c: '#33302e', cut: '#2a2626' }));
  // Stern planes, starboard half seen.
  k.box(91.2, 2.4, -0.3, 93.6, 2.52, 2.6, mat({ c: '#33302e', cut: '#2a2626' }));
  // Shaft, struts, and the propellers (animated parts below).
  const sx = 86.3, ex = 90.0;
  k.cyl(sx, shaftY(sx) + (shaftY(ex) - shaftY(sx)) * 0, SHAFT.z, 0.11, ex - sx, M.steel, { axis: 'x', seg: 10 });
  k.beam([88.6, shaftY(88.6), SHAFT.z], [88.3, keelY(88.3) + 0.3, 0.4], 0.09, M.bottom);
  k.beam([88.6, shaftY(88.6), SHAFT.z], [88.4, shaftY(88.6) + 1.2, outerZ(88.4, shaftY(88.6) + 1.2) - 0.05], 0.09, M.bottom);
  const blades = (q, hand) => {
    q.sphere(0, 0, 0, 0.22, M.propeller, { seg: 10, rings: 6 });
    q.cyl(-0.3, 0, 0, 0.18, 0.3, M.propeller, { axis: 'x', seg: 10 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      q.boxR(0, Math.cos(a) * 0.68, Math.sin(a) * 0.68, 0.06, 1.0, 0.42, M.propeller, { x: -a, y: hand * 0.5 });
    }
  };
  P.propS = k.part(90.15, shaftY(90.15), SHAFT.z, (q) => blades(q, 1));
  P.propP = k.part(90.15, shaftY(90.15), -SHAFT.z, (q) => blades(q, -1));
  P.propP.userData.whole = true;
  k.cyl(86.3, shaftY(86.3), -SHAFT.z, 0.11, 3.7, mat({ c: '#b4b8b6', whole: true }), { axis: 'x', seg: 10 });
  // Inside: the starboard shaft in the motor room, turning.
  P.shaft = k.part(76.3, shaftY(76.3) + 0.3, SHAFT.z, (q) => {
    q.cyl(-0.1, 0, 0, 0.12, 0.5, M.steel, { axis: 'x', seg: 8 });
    q.box(0.1, -0.02, -0.15, 0.2, 0.02, 0.15, M.machDk);
  });
}

// ------------------------------------------------------------------ moving parts
export function buildMachines(k) {
  const P = {};
  conningTowerInterior(k);
  shears(k);
  guns(k);
  sternGear(k, P);
  // Periscopes: tubes that slide up through the shears (S1 p.22: tops at 20.32 m raised).
  P.peri = [SHEARS.x1, SHEARS.x2].map((px, i) => k.part(px, SHEARS.top, 0, (q) => {
    const r = i === 0 ? 0.11 : 0.085;
    q.cyl(0, -12.2, 0, r, 12.2, M.peri, { seg: 10 });
    q.cyl(0, 0, 0, r * 0.9, 0.25, M.peri, { seg: 10, r2: r * 0.55 });
    q.box(-0.06, -0.05, -r - 0.02, 0.06, 0.05, -r + 0.01, mat({ c: '#2a3a4a', whole: true }));
    // Eyepiece box and training handles, seen in the conning tower when the tube is raised.
    const ey = -(SHEARS.top - (CT.deck + 1.45));
    q.box(-0.2, ey - 0.15, -0.14, 0.2, ey + 0.12, 0.14, mat({ c: '#4a4e52', whole: true }));
    q.box(-0.55, ey - 0.06, -0.03, 0.55, ey - 0.0, 0.03, mat({ c: '#3a3e42', whole: true }));
  }));
  // SJ radar reflector on its mast (S48).
  P.sj = k.part(38.25, 14.6, 0, (q) => {
    const m = mat({ c: '#9aa0a4', c2: '#7a8084', pat: 'grate', s: 0.06, whole: true });
    q.box(-0.06, -0.05, -0.06, 0.06, 0.12, 0.06, M.mast);
    q.boxR(0.18, 0.18, 0, 0.05, 0.42, 1.1, m, { z: 0.15 });
    q.box(-0.02, 0.1, -0.02, 0.22, 0.14, 0.02, M.mast);
  });
  // SD air-search antenna on its mast.
  P.sd = k.part(39.3, 15.6, 0, (q) => {
    q.cyl(-0.5, 0, 0, 0.025, 1.0, M.mastDk, { axis: 'x', seg: 5 });
    q.cyl(0, 0, -0.5, 0.025, 1.0, M.mastDk, { axis: 'z', seg: 5 });
  });
  // Bow planes: folded against the superstructure on the surface, rigged out to dive (S22, S33).
  P.bowPlane = k.part(8.6, 6.45, Math.max(0.6, outerZ(8.6, 6.45) - 0.05), (q) => {
    q.box(-1.25, -0.04, 0, 1.25, 0.04, 1.65, mat({ c: '#33302e', cut: '#2a2626' }));
    q.box(-0.15, -0.08, -0.05, 0.15, 0.08, 0.12, M.black);
  });
  // A torpedo being pulled partly out of tube 3 for its routine (S43): it slides on the rails.
  P.torp = k.part(X.ftrF + 0.84, 3.66, 0.56, (q) => {
    q.cyl(0, 0, 0, 0.265, 2.2, M.torpedo, { axis: 'x', seg: 14 });
    q.cyl(2.2, 0, 0, 0.265, 0.45, M.torpedo, { axis: 'x', seg: 12, r2: 0.08 });
    q.box(2.55, -0.24, -0.01, 2.65, 0.24, 0.01, M.machDk);
    q.cyl(2.62, 0, 0, 0.12, 0.05, M.bronze, { axis: 'x', seg: 8 });
  });
  P.torpDoor = k.part(X.ftrF + 0.75, 3.66, 0.56, (q) => { q.cyl(0, 0, 0, 0.4, 0.09, M.breech, { axis: 'x', seg: 18 }); q.cyl(0.09, 0, 0, 0.16, 0.06, M.brass, { axis: 'x', seg: 10 }); });
  // Engines: a part per engine so it can shiver while running; the generator coupling turns.
  P.couplings = [];
  for (const sp of A.spots.eng) {
    P.couplings.push(k.part(sp.gx0 - 0.05, LOW.eng + 1.0, 1.25, (q) => {
      q.cyl(-0.12, 0, 0, 0.62, 0.14, M.machDk, { axis: 'x', seg: 16 });
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; q.cyl(-0.14, Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.05, 0.18, M.steel, { axis: 'x', seg: 6 }); }
      q.box(-0.15, 0.4, -0.06, 0.04, 0.62, 0.06, M.white);
    }));
  }
  P.engineTops = A.spots.eng.map((sp) => k.part((sp.ex0 + sp.ex1) / 2, 5.0, (sp.z0 + 1.8) / 2, (q) => {
    // Upper crankshaft cover and the air box hood: shiver when running.
    q.box(-(sp.ex1 - sp.ex0) / 2, 0, -0.45, (sp.ex1 - sp.ex0) / 2, 0.12, 0.45, M.machDk);
    for (let i = 0; i < 5; i++) q.cyl(-1.6 + i * 0.8, 0.12, -0.2, 0.05, 0.12, M.steel, { seg: 6 });
  }));
  // The auxiliary engine's flywheel.
  P.auxFly = k.part(66.65, LOW.eng + 0.55, 0.1, (q) => { q.cyl(0, 0, 0, 0.45, 0.1, M.machDk, { axis: 'x', seg: 14 }); q.box(0.0, 0.3, -0.05, 0.11, 0.44, 0.05, M.white); });
  // Air circulation blower in the forward engine room overhead (S16).
  P.fans = [[58.0, 5.55, 0.6], [74.0, 5.55, 0.6]].map(([x, y, z]) => {
    k.cyl(x - 0.35, y, z, 0.32, 0.7, M.mach, { axis: 'x', seg: 14 });
    return k.part(x - 0.37, y, z, (q) => { for (let i = 0; i < 5; i++) q.boxR(0, Math.cos((i / 5) * 6.283) * 0.14, Math.sin((i / 5) * 6.283) * 0.14, 0.02, 0.24, 0.1, M.steel, { x: (i / 5) * 6.283 }); q.cyl(0, 0, 0, 0.06, 0.04, M.machDk, { axis: 'x', seg: 6 }); });
  });
  // Air compressor crossheads (pump room): thump at night while the air banks recharge (S43).
  P.comp = A.spots.compressors.map(([x, y, z]) => k.part(x, y, z, (q) => { q.box(-0.36, 0, -0.08, 0.36, 0.08, 0.08, M.steel); for (let s = 0; s < 4; s++) q.cyl(-0.3 + s * 0.2, 0.08, 0, 0.03, 0.18, M.steel, { seg: 5 }); }));
  // Motor-room shafts: a turning coupling on each motor.
  P.motors = [[70.65, 1.6], [74.7, 1.6]].map(([x, z]) => k.part(x, LOW.motor + 0.95, z, (q) => { q.cyl(-0.06, 0, 0, 0.3, 0.06, M.machDk, { axis: 'x', seg: 12 }); q.box(-0.08, 0.15, -0.04, 0.0, 0.3, 0.04, M.white); }));
  // Record player turntable in the wardroom.
  const [rx, ry, rz] = A.spots.record;
  P.record = k.part(rx, ry, rz, (q) => { q.cyl(0, 0, 0, 0.13, 0.015, M.gauge, { seg: 14 }); q.box(0.02, 0.015, -0.01, 0.12, 0.02, 0.01, M.white); });
  // The movie sheet and the projector beam glow (shown during the film).
  P.sheet = k.part(21.2, DECK.ftr + 0.55, 0, (q) => {
    q.box(-0.02, 0, 0.12, 0.02, 1.15, 1.3, mat({ c: '#f4f0e4', c2: '#ffffff', glow: 'always', noEdge: true, cut: '#f4f0e4' }));
    q.box(-0.03, 1.15, 0.1, 0.03, 1.2, 1.32, M.machDk);
  });
  const [px, py, pz] = A.spots.projector;
  P.projector = k.part(px, py, pz, (q) => {
    q.box(-0.15, 0, -0.1, 0.15, 0.22, 0.1, M.gauge);
    q.cyl(-0.05, 0.3, 0, 0.12, 0.03, M.gauge, { axis: 'z', seg: 12 });
    q.cyl(0.15, 0.3, 0, 0.12, 0.03, M.gauge, { axis: 'z', seg: 12 });
  });
  P.reels = [0, 1].map((i) => k.part(px - 0.05 + i * 0.2, py + 0.3, pz - 0.02, (q) => { for (let j = 0; j < 3; j++) q.boxR(0, 0, 0, 0.2, 0.025, 0.04, M.steel, { z: (j / 3) * Math.PI }); }));
  // Main induction valve disc (shuts on diving).
  P.induction = k.part(42.35, 8.79, 0.78, (q) => { q.cyl(0, 0, 0, 0.42, 0.06, M.machDk, { seg: 16 }); });
  // The cockroach behind the hot plates (S41: a "grim battle").
  P.roach = k.part(41.3, DECK.ab + 0.93, 0.6, (q) => { q.sphere(0, 0.012, 0, 0.022, mat('#4a2a18'), { seg: 6, rings: 4 }); q.sphere(0.03, 0.012, 0, 0.012, mat('#3a2010'), { seg: 5, rings: 3 }); });
  // A small dog (a plausible invention: mascots were common on fleet boats, S41).
  P.dog = k.part(0, 0, 0, (q) => {
    const c = mat('#b88a5a'), d = mat('#7a5a3a');
    q.sphere(0, 0.2, 0, 0.13, c, { seg: 8, rings: 5 });
    q.sphere(0.17, 0.27, 0, 0.08, c, { seg: 8, rings: 5 });
    q.box(0.2, 0.31, -0.05, 0.24, 0.36, -0.03, d); q.box(0.2, 0.31, 0.03, 0.24, 0.36, 0.05, d);
    for (const [lx, lz] of [[-0.08, -0.06], [-0.08, 0.06], [0.08, -0.06], [0.08, 0.06]]) q.cyl(lx, 0, lz, 0.025, 0.14, c, { seg: 5 });
    q.cyl(-0.12, 0.25, 0, 0.015, 0.14, c, { axis: 'x', seg: 4 });
  });
  void BRIDGE; void phY; void phR; void light; void backZ; void DECK;
  return P;
}
