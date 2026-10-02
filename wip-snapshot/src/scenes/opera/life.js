/* The Opera: everything that moves. Scenery flying and sliding at the changes, drums and
 * counterweights, the trap, the house curtain and the iron mesh curtain, the chandelier
 * (hoisted for cleaning by day), the scenery lift with a horse, carriages on the Place,
 * swallows, the cat on the gril, the mouse in the Foyer de la Danse, smoke and sound.
 */
import { THREE, mat, glowMaterial } from '../../engine/index.js';
import { Y, MT, AX, ACTS, showAt, inH, stageY, ST0, SZ } from './common.js';
import { STAGE } from './stagehouse.js';
import { HOUSE } from './house.js';
import { BACK, fdY } from './back.js';

const PI = Math.PI;
const G = (c, o) => mat(Object.assign({ c, whole: true }, o || {}));

// ------------------------------------------------------------------ parts built at build time
export function lifeParts(k) {
  const L = {};
  // The chandelier: bronze and crystal, 340 gas lights (N p.145), on steel cables (fr.wikipedia).
  L.chandelier = k.part(AX, 0, 0, (q) => {
    const B = G('#b8913e', { c2: '#e0c070', pat: 'speckle' }), cry = G('#e8eef0', { c2: '#ffffff', noEdge: true });
    const glob = G('#fff0c8', { c2: '#fff4d0', glow: 'night', noEdge: true });
    const y0 = 20.6;
    q.lathe([[0.15, y0 - 0.2], [0.5, y0], [0.75, y0 + 0.8], [0.5, y0 + 1.6], [0.9, y0 + 2.4], [0.6, y0 + 3.4], [0.35, y0 + 4.2], [0.25, y0 + 5.0], [0.05, y0 + 5.2]], 0, 0, B, { seg: 12 });
    for (const [yy, rr, n] of [[y0 + 0.9, 2.0, 18], [y0 + 1.9, 1.6, 14], [y0 + 2.9, 1.15, 10], [y0 + 3.8, 0.7, 7]]) {
      q.lathe([[rr - 0.05, yy - 0.05], [rr + 0.05, yy - 0.05], [rr + 0.05, yy + 0.05], [rr - 0.05, yy + 0.05]], 0, 0, B, { seg: 20, capTop: false, capBot: false });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr;
        q.sphere(x, yy + 0.16, z, 0.075, glob, { seg: 5, rings: 3 });
        if (i % 2 === 0) q.box(x - 0.015, yy - 0.5, z - 0.015, x + 0.015, yy - 0.06, z + 0.015, cry);
      }
      q.beam([0, yy - 0.4, 0], [rr, yy, 0], 0.04, B); q.beam([0, yy - 0.4, 0], [-rr, yy, 0], 0.04, B);
      q.beam([0, yy - 0.4, 0], [0, yy, rr], 0.04, B); q.beam([0, yy - 0.4, 0], [0, yy, -rr], 0.04, B);
    }
    for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2; q.box(Math.cos(a) * 0.6 - 0.02, y0 - 0.9, Math.sin(a) * 0.6 - 0.02, Math.cos(a) * 0.6 + 0.02, y0 - 0.15, Math.sin(a) * 0.6 + 0.02, cry); }
    for (const a of [0.4, 2.0, 3.6, 5.2]) q.cyl(Math.cos(a) * 0.3, y0 + 5.2, Math.sin(a) * 0.3, 0.02, 4.0, G('#3a3a3e'), { seg: 4 });
  });
  // The jeu d'orgue's graduated wheel.
  const [wx, wy, wz] = HOUSE.organWheel;
  L.wheel = k.part(wx, wy, wz, (q) => {
    q.cyl(0, 0, -0.04, 0.42, 0.06, mat({ c: '#c8a050', c2: '#e0c070', pat: 'rings', s: 0.05 }), { axis: 'z', seg: 18 });
    for (let i = 0; i < 6; i++) q.boxR(0, 0, -0.06, 0.8, 0.04, 0.03, MT.ironD, { z: (i / 6) * PI });
    q.box(-0.03, 0.3, -0.12, 0.03, 0.42, -0.06, MT.ironD);
  });
  // The scenery lift's platform, with a horse being hoisted for another production [illustrative].
  const [lx, ly, lz] = BACK.lift;
  L.lift = k.part(lx, ly, lz, (q) => {
    q.box(-2.1, -0.15, -3.2, 2.1, 0, 3.2, MT.oak);
    q.box(-2.1, 0, -3.25, 2.1, 0.9, -3.15, MT.ironD);
  });
  L.horseOnLift = horse(k, lx, ly, lz - 0.3, '#6a4a32');
  // Carriages on the Place: a coupé, a fiacre and a private landau, each with its horse.
  L.coaches = [];
  for (let i = 0; i < 3; i++) {
    const body = ['#2a2a30', '#2e3a2a', '#3a2228'][i];
    const g = k.part(0, 0, 0, (q) => {
      q.box(-1.3, 0.75, -0.75, 0.6, 2.1, 0.75, mat({ c: body, c2: '#c8a050', pat: 'panels', s: 0.8 }));
      q.box(-1.2, 1.4, -0.77, -0.3, 1.95, 0.77, mat({ c: '#3a4a5a', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.4 }));
      q.box(0.6, 1.2, -0.7, 1.4, 1.35, 0.7, mat(body));
      q.box(0.8, 1.35, -0.6, 1.3, 1.8, 0.6, mat(body));
      q.box(-1.4, 2.1, -0.8, 0.7, 2.2, 0.8, mat('#1e1e22'));
      q.box(-1.5, 1.7, 0.8, -1.35, 1.95, 0.95, mat({ c: '#fff0c0', c2: '#fff4d0', glow: 'night', noEdge: true })); // lamp
      // Coachman on the box.
      q.box(0.85, 1.8, -0.25, 1.25, 2.5, 0.25, mat('#2a3a2a'));
      q.sphere(1.05, 2.68, 0, 0.13, mat('#e0b896'), { seg: 6, rings: 4 });
      q.cyl(1.05, 2.78, 0, 0.12, 0.25, mat('#1a1a1a'), { seg: 8 });
      q.beam([1.4, 1.2, 0.5], [3.4, 1.2, 0.5], 0.05, mat('#4a3a2a'));
      q.beam([1.4, 1.2, -0.5], [3.4, 1.2, -0.5], 0.05, mat('#4a3a2a'));
    });
    const wheels = [];
    for (const [x, r] of [[-1.0, 0.62], [0.9, 0.45]]) for (const z of [-0.85, 0.85]) {
      const w = new THREE.Group();
      w.position.set(x, r, z);
      const wk = k.part(0, 0, 0, (q) => {
        q.lathe([[r - 0.06, -0.04], [r, -0.04], [r, 0.04], [r - 0.06, 0.04]].map(([a, b]) => [a, b]), 0, 0, mat('#3a2a1e'), { seg: 14, capTop: false, capBot: false });
        for (let s = 0; s < 6; s++) q.boxR(0, 0, 0, r * 2 - 0.1, 0.03, 0.03, mat('#5a3a22'), { y: (s / 6) * PI });
      });
      wk.rotation.x = PI / 2;
      w.add(wk);
      g.add(w);
      wheels.push(w);
    }
    const h = horse(k, 0, 0, 0, ['#4a3426', '#2a2420', '#8a6a4a'][i]);
    g.add(h.group); h.group.position.set(2.6, 0, 0);
    g.userData.wheels = wheels; g.userData.horse = h;
    L.coaches.push(g);
  }
  // A groom's horse in the courtyard by day.
  L.yardHorse = horse(k, 166.5, Y.court, 10.2, '#7a5a3a');
  L.yardHorse.group.rotation.y = PI;
  // Swallows round the facade (they nest in its garlands, Nuitter's dedication).
  L.swallows = [];
  for (let i = 0; i < 8; i++) {
    L.swallows.push(k.part(0, 0, 0, (q) => {
      const c = mat({ c: '#1e2230', whole: true });
      q.sphere(0, 0, 0, 0.07, c, { seg: 5, rings: 3 });
      q.boxR(0, 0, 0.14, 0.1, 0.01, 0.26, mat({ c: '#1e2230', thin: true, whole: true }), { x: 0.3, y: 0.3 });
      q.boxR(0, 0, -0.14, 0.1, 0.01, 0.26, mat({ c: '#1e2230', thin: true, whole: true }), { x: -0.3, y: -0.3 });
      q.boxR(-0.12, 0, 0, 0.16, 0.01, 0.06, c, {});
    }));
  }
  // A cat on the third gril, watching a sparrow by the roof vents (an invention of this drawing).
  L.cat = k.part(112.5, Y.gril[2], 6, (q) => {
    const c = mat('#3a3430');
    q.sphere(0, 0.16, 0, 0.15, c, { seg: 8, rings: 5 });
    q.sphere(0.12, 0.3, 0, 0.09, c, { seg: 8, rings: 5 });
    q.boxR(0.14, 0.4, 0.04, 0.03, 0.06, 0.03, c, {}); q.boxR(0.14, 0.4, -0.04, 0.03, 0.06, 0.03, c, {});
  });
  L.catTail = k.part(112.35, Y.gril[2] + 0.12, 6, (q) => q.cyl(0, 0, 0, 0.018, 0.28, mat('#3a3430'), { seg: 4 }));
  L.sparrow = k.part(110.5, Y.gril[2] + 2.1, 5.2, (q) => { q.sphere(0, 0, 0, 0.05, mat('#7a5a3a'), { seg: 5, rings: 3 }); q.sphere(0.05, 0.03, 0, 0.03, mat('#5a4a3a'), { seg: 4, rings: 3 }); });
  // The mouse beside a pupil in the Foyer de la Danse (the young pupils were called "rats").
  L.mouse = k.part(0, 0, 0, (q) => { const c = mat('#6a625a'); q.sphere(0, 0.035, 0, 0.04, c, { seg: 6, rings: 4 }); q.sphere(0.045, 0.04, 0, 0.022, c, { seg: 5, rings: 3 }); q.cyl(-0.04, 0.02, 0, 0.005, 0.07, c, { axis: 'x', seg: 3 }); });
  // The piano on its platform for the day's rehearsal (N p.192).
  L.piano = k.part(95.4, stageY(95.4), 7.2, (q) => {
    q.box(-1.5, 0, -1.2, 1.5, 0.35, 1.2, MT.timber);
    q.box(-0.8, 0.35, 0.2, 0.8, 1.6, 0.7, mat('#1e1a18'));
    q.box(-0.8, 1.05, -0.05, 0.8, 1.1, 0.2, mat({ c: '#f4f0e6', pat: 'bars', s: 0.024 }));
  });
  // A beam of light from the arc lamp for the apotheosis (overlay, additive).
  const geo = new THREE.CylinderGeometry(1.6, 0.18, 18, 18, 1, true);
  geo.translate(0, -9, 0);
  const beam = new THREE.Mesh(geo, glowMaterial(0xf4f8ff));
  beam.frustumCulled = false;
  const [ax, ay, az] = STAGE.arc;
  const holder = new THREE.Group();
  holder.position.set(ax, ay, az);
  holder.add(beam);
  holder.rotation.set(0, 0, 0);
  k.object(holder, { overlay: true });
  L.arcBeam = holder; L.arcMesh = beam;
  return L;
}

// A horse, built of simple solids, with legs that can be swung. Returns { group, legs, update(t, moving) }.
function horse(k, x, y, z, coat) {
  const c = mat(coat), d = mat('#2a2420');
  const g = k.part(x, y, z, (q) => {
    q.boxR(0, 1.3, 0, 1.7, 0.7, 0.55, c, {});
    q.boxR(0.95, 1.75, 0, 0.35, 0.85, 0.32, c, { z: -0.6 });
    q.boxR(1.3, 2.05, 0, 0.6, 0.26, 0.24, c, { z: 0.35 });
    q.boxR(-0.95, 1.3, 0, 0.12, 0.6, 0.1, d, { z: 0.3 });
    q.boxR(0.95, 2.05, 0, 0.6, 0.1, 0.06, d, { z: -0.6 });
  });
  const legs = [];
  for (const [lx, lz] of [[0.65, -0.18], [0.65, 0.18], [-0.65, -0.18], [-0.65, 0.18]]) {
    const leg = k.part(0, 0, 0, (q) => q.box(-0.06, -1.0, -0.06, 0.06, 0, 0.06, c));
    const hp = new THREE.Group();
    hp.position.set(lx, 1.05, lz);
    hp.add(leg);
    g.add(hp);
    legs.push(hp);
  }
  return { group: g, legs, step(t, v) { legs.forEach((l, i) => { l.rotation.z = v > 0.05 ? Math.sin(t * 7 + (i === 0 || i === 3 ? 0 : PI)) * 0.4 : 0; }); } };
}

// ------------------------------------------------------------------ the living machinery
export function lifeSetup(W, L) {
  const D = W.data;
  D.L = L;
  D.dropY = {}; D.wingZ = {};
  for (const n of Object.keys(STAGE.sets)) { D.dropY[n] = 21; D.wingZ[n] = 10; }
  D.curtainY = 0; D.meshY = 14; D.chY = 0; D.coach = [0.1, 0.45, 0.8];
  // Smoke from the chimneys (14 furnaces and 450 fireplaces, N p.222), and from the city.
  for (const [x, y, z] of [[12.7, 41.8, 14.7], [26.7, 41.8, 22.7], [16.7, 41.8, 30.7], [142.8, 39.8, 6.8], [151.8, 39.8, 6.8]]) {
    W.emitter({ kind: 'smoke', x, y, z, rate: 1.2, w: 0.6, d: 0.6, vx: 0.4, size: [0.8, 4.5], color: '#7a746e' });
  }
  for (const [x, z] of [[-60, 59], [-12, 65], [40, 65], [100, 65], [160, 63]]) W.emitter({ kind: 'smoke', x, y: 28.5, z, rate: 0.7, w: 1, d: 1, vx: 0.4, size: [1, 5], color: '#8a847e' });
  // Heat and foul air rising from the dome's lantern while the chandelier burns (N p.228).
  W.emitter({ kind: 'steam', x: AX, y: 52.5, z: 0.5, rate: 2.5, w: 1.6, d: 1.6, vx: 0.3, size: [0.6, 3.5], color: '#d8d2c8', when: (w) => inH(w.hour, 18.8, 0.3) });
  // Embers at the furnace mouths, a drip in the cistern.
  W.emitter({ kind: 'ember', x: 27.5, y: Y.cellar + 0.9, z: 5.3, rate: 1.2, w: 0.6, d: 0.1 });
  W.emitter({ kind: 'ember', x: 53.5, y: Y.cellar + 0.9, z: 5.3, rate: 0.8, w: 0.6, d: 0.1 });
  W.emitter({ kind: 'splash', x: 100.3, y: Y.water + 0.02, z: 3.6, rate: 0.35, w: 0.2, d: 0.2 });
  W.emitter({ kind: 'bubble', x: 112, y: Y.water - 0.6, z: 2.4, rate: 0.6, w: 3, d: 1 });
  // The flaming cup in the fair scene, and the pyrotechnician's flash in Walpurgis Night.
  W.emitter({ kind: 'fire', x: 104.2, y: stageY(104) + 1.35, z: 4.4, rate: 14, w: 0.15, d: 0.15, when: (w) => w.hour > 20.33 && w.hour < 20.37 });
  W.emitter({ kind: 'spark', x: 106, y: stageY(106) + 0.2, z: 2.5, rate: 30, w: 1.2, d: 1.2, when: (w) => (w.hour > 23.05 && w.hour < 23.07) || (w.hour > 23.6 && w.hour < 23.63) });
  W.emitter({ kind: 'smoke', x: 106, y: stageY(106) + 0.2, z: 2.5, rate: 6, w: 1.5, d: 1.5, size: [0.6, 3], color: '#b8a8b8', when: (w) => w.hour > 23.05 && w.hour < 23.1 });
  // Breath of the horses in the cold March night.
  D.breath = L.coaches.map(() => W.emitter({ kind: 'steam', x: 0, y: 2, z: 10, rate: 0, w: 0.1, d: 0.1, vx: 0.4, size: [0.1, 0.6], color: '#f0eeea' }));
  // Sound: the house, the music of Faust, the machinery, the cellars, the street.
  const S = (h) => showAt(h);
  const actOn = (n) => (w) => { const s = S(w.hour); return s.phase === 'act' && (!n || s.act.n === n); };
  W.sound({ kind: 'strings', x: 83, y: 7, z: 4, r: 45, gain: 0.45, hz: 196, when: actOn() });
  W.sound({ kind: 'band', x: 98, y: 10, z: 3, r: 35, gain: 0.45, hz: 262, bpm: 168, when: actOn(2) });
  W.sound({ kind: 'voice', x: 97, y: 10.5, z: 2, r: 40, gain: 0.35, hz: 220, when: (w) => actOn()(w) && !actOn(2)(w) });
  W.sound({ kind: 'organ', x: 84, y: 14, z: 2, r: 50, gain: 0.4, hz: 98, when: (w) => w.hour > 22.08 && w.hour < 22.4 });
  W.sound({ kind: 'bell', x: 112, y: 31, z: 18, r: 40, gain: 0.3, hz: 330, when: (w) => w.hour > 22.08 && w.hour < 22.3 });
  W.sound({ kind: 'machine', x: 100, y: 1, z: 5, r: 25, gain: 0.35, pitch: 160, rate: (w) => (w.data.moving ? 3 : 0) });
  W.sound({ kind: 'creak', x: 100, y: 40, z: 15, r: 25, gain: 0.25, rate: (w) => (w.data.moving ? 1.5 : 0.1) });
  W.sound({ kind: 'fire', x: 27.5, y: -5, z: 5, r: 18, gain: 0.35 });
  W.sound({ kind: 'drip', x: 100, y: -8.5, z: 4, r: 20, gain: 0.3, rate: 0.4 });
  W.sound({ kind: 'hum', x: 89, y: 24.4, z: 10, r: 10, gain: 0.25, hz: 100, when: (w) => w.hour > 23.35 && w.hour < 23.75 });
  W.sound({ kind: 'clock', x: 152.5, y: 6, z: 7.9, r: 6, gain: 0.25 });
  W.sound({ kind: 'machine', x: -20, y: 0.5, z: 12, r: 35, gain: 0.25, pitch: 380, rate: (w) => (w.data.coachMoving ? 2.2 : 0) });
  W.sound({ kind: 'hum', x: 15, y: 15, z: 5, r: 30, gain: 0.12, hz: 180, when: 'night' });
}

// Which set stands on the stage at an hour.
function setAt(h) {
  const s = showAt(h);
  if (s.phase === 'act') return s.act.set;
  if (s.phase === 'interval') return s.next.set;
  if (s.phase === 'doors' || inH(h, 17.5, 18.75)) return 'study';
  return null;
}
const approach = (v, target, rate, dt) => (Math.abs(target - v) < rate * dt ? target : v + Math.sign(target - v) * rate * dt);

export function lifeUpdate(W, dt, t) {
  const D = W.data, L = D.L, h = W.hour, S = showAt(h);
  // ---- scenery: drops fly in and out, wings slide on their chariots
  const cur = setAt(h);
  let moving = false;
  for (const [n, set] of Object.entries(STAGE.sets)) {
    const tgY = cur === n ? 0 : 21, tgZ = cur === n ? 0 : 10;
    const y0 = D.dropY[n], z0 = D.wingZ[n];
    D.dropY[n] = approach(y0, tgY, 1.6, dt);
    D.wingZ[n] = approach(z0, tgZ, 0.9, dt);
    if (D.dropY[n] !== y0 || D.wingZ[n] !== z0) moving = true;
    set.drop.position.y = D.dropY[n];
    set.wings.position.z = D.wingZ[n];
  }
  D.moving = moving;
  // Counterweights travel opposite to the drops they balance.
  ['fair', 'garden', 'church'].forEach((n, i) => { if (STAGE.weights[i]) STAGE.weights[i].position.y = 9 + (21 - D.dropY[n]) * 1.2; });
  // Drums turn while a change is under way (10 to 20 turns a minute).
  for (let i = 0; i < STAGE.drums.length; i++) STAGE.drums[i].rotation.z += dt * (moving ? 1.6 + i * 0.2 : 0);
  // ---- the trap follows Mephistopheles up; otherwise it lies flush with the stage
  const tx = STAGE.trapX, ty = stageY(tx);
  const meph = D.meph;
  let trapY = ty;
  if (meph && Math.abs(meph.x - tx) < 0.7 && meph.z < 1.4 && meph.y < ty - 0.05) trapY = meph.y;
  STAGE.trap.position.y = trapY;
  // ---- the house curtain is flown out for the acts; the iron mesh is lowered at night
  const curtainUp = S.phase === 'act' || inH(h, 11.5, 16.5);
  D.curtainY = approach(D.curtainY, curtainUp ? 14 : 0, 1.4, dt);
  STAGE.curtain.position.y = D.curtainY;
  D.meshY = approach(D.meshY, inH(h, 1.0, 8.5) ? 0 : 14, 0.8, dt);
  STAGE.mesh.position.y = D.meshY;
  // ---- the bells swing in the church scene
  STAGE.bellParts.forEach((b, i) => { b.rotation.z = h > 22.08 && h < 22.3 ? Math.sin(t * (1.6 + i * 0.5)) * 0.45 : 0; });
  // ---- the jeu d'orgue wheel turns as the light changes at each act
  let turning = false;
  for (const A of ACTS) if (Math.abs(h - A.h0) < 0.03 || Math.abs(h - A.h1) < 0.03) turning = true;
  L.wheel.rotation.z += dt * (turning ? 0.8 : 0);
  // ---- the chandelier, hoisted up through the ceiling for cleaning by day [timing illustrative]
  const hoist = inH(h, 10.5, 14.5) ? 6.5 : 0;
  D.chY = approach(D.chY, hoist, 0.25, dt);
  L.chandelier.position.y = D.chY;
  // ---- the scenery lift: twenty minutes to rise (fr.wikipedia), here with a horse at 10:00
  const lift = h < 10 ? 0 : h < 10.333 ? (h - 10) / 0.333 : h < 15 ? 1 : h < 15.333 ? 1 - (h - 15) / 0.333 : 0;
  const ly = lift * (Y.back - Y.chorus);
  L.lift.position.y = BACK.lift[1] + ly;
  L.horseOnLift.group.position.y = BACK.lift[1] + ly;
  L.horseOnLift.group.visible = inH(h, 9.6, 10.8);
  L.yardHorse.group.visible = inH(h, 8, 9.6) || inH(h, 10.8, 17);
  L.yardHorse.step(t, 0);
  // ---- the rehearsal piano is there only by day
  L.piano.visible = inH(h, 11.6, 16.2);
  // ---- carriages on the Place: busy as the house fills and empties, a few cabs by day
  const busy = inH(h, 18.4, 19.8) || inH(h, 23.6, 0.6);
  const daytime = inH(h, 8, 18.4);
  let coachMoving = false;
  L.coaches.forEach((g, i) => {
    const on = busy || (daytime && i === 0);
    const speed = busy ? 0.014 : 0.008;
    D.coach[i] = (D.coach[i] + dt * speed) % 1;
    const s = D.coach[i];
    // In along a lane, a half turn before the perron, a pause, then away along the other lane.
    let x, z, hd, v = 1;
    const xs = -78, xe = -14, lanes = [11, 16.5], rr = (lanes[1] - lanes[0]) / 2;
    if (s < 0.42) { const u = s / 0.42; x = xs + (xe - xs) * u; z = lanes[0]; hd = 0; }
    else if (s < 0.5) { const u = (s - 0.42) / 0.08; const a = -PI / 2 + u * PI; x = xe + Math.cos(a) * rr; z = lanes[0] + rr + Math.sin(a) * rr; hd = a + PI / 2; }
    else if (s < 0.58) { x = xe; z = lanes[1]; hd = PI; v = 0; }
    else { const u = (s - 0.58) / 0.42; x = xe + (xs - xe) * u; z = lanes[1]; hd = PI; }
    g.visible = on && x > -76;
    g.position.set(x, 0, z);
    g.rotation.y = -hd;
    if (on && v) coachMoving = true;
    for (const w of g.userData.wheels) w.rotation.z -= dt * v * 2.4;
    g.userData.horse.step(t, v);
    const br = D.breath[i];
    br.x = x + Math.cos(hd) * 4.0; br.z = z + Math.sin(hd) * 4.0; br.y = 2.0;
    br.rate = on && W.sun().night > 0.5 ? 0.8 : 0;
  });
  D.coachMoving = coachMoving;
  // ---- swallows by day round the facade
  const day = W.sun().day > 0.3;
  L.swallows.forEach((b, i) => {
    b.visible = day;
    const ph = t * (0.5 + i * 0.07) + i * 1.7;
    b.position.set(-2 + Math.cos(ph) * (4 + i * 0.6), 26 + Math.sin(ph * 1.7) * 3 + i * 0.4, 4 + i * 2.5 + Math.sin(ph) * 3);
    b.rotation.y = -ph - PI / 2;
    b.rotation.z = Math.sin(t * 14 + i) * 0.3;
  });
  // ---- the cat watches the sparrow; its tail twitches
  L.catTail.rotation.z = 1.2 + Math.sin(t * 2.3) * 0.5;
  L.cat.rotation.y = Math.sin(t * 0.2) * 0.3 + PI;
  L.sparrow.position.set(110.5 + Math.sin(t * 0.7) * 0.6, Y.gril[2] + 2.1 + Math.abs(Math.sin(t * 2.1)) * 0.25, 5.2);
  // ---- the mouse scurries along the skirting of the Foyer de la Danse
  const ms = (t * 0.7) % 26, back = ms > 13;
  const X = back ? 137 - (ms - 13) : 124 + ms;
  L.mouse.position.set(X, fdY(X), 11.5);
  L.mouse.rotation.y = back ? PI : 0;
  // ---- the arc lamp for the apotheosis: harsh white, flickering
  const arc = h > 23.35 && h < 23.75;
  L.arcBeam.visible = arc;
  if (arc) {
    L.arcBeam.rotation.set(0, 0, 0);
    const tgt = new THREE.Vector3(97, stageY(97) + 1, -2.0);
    const dir = tgt.clone().sub(L.arcBeam.position).normalize();
    L.arcBeam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
    L.arcMesh.material.uniforms.uIntensity.value = 0.32 + Math.sin(t * 37) * 0.04;
  }
  void SZ; void ST0; void BACK; void fdY;
}

// ------------------------------------------------------------------ halos: the chandelier and the stage lights
export function lifeHalos(list, W) {
  const D = W.data, h = W.hour, S = showAt(h), n = W.sun().night;
  const lit = inH(h, 18.6, 0.4);
  if (lit) {
    // The house is turned down "to blue" during the acts, never dark (fr.wikipedia).
    const k = S.phase === 'act' ? 0.45 : 1;
    const y = 23 + (D.chY || 0);
    list.push({ x: AX, y, z: 0, r: 4.2, color: '#ffd890', a: 0.5 * k });
    list.push({ x: AX, y: y + 1, z: 0, r: 7.5, color: '#ffcf80', a: 0.22 * k });
    for (let i = 0; i < 10; i++) { const a = (i / 10) * PI * 2 + 0.3; list.push({ x: AX + Math.cos(a) * 2.0, y: 21.6 + (D.chY || 0), z: Math.sin(a) * 2.0, r: 0.6, color: '#fff2c8', a: 0.5 * k }); }
    // Stage light: battens, wing ladders and footlights brighter during the acts.
    if (S.phase === 'act') {
      for (let x = 91; x < 112; x += 4.8) list.push({ x, y: 15, z: 4, r: 6.5, color: '#fff0c8', a: 0.12 });
      for (const L of HOUSE.foot) L.i = 0.95;
    } else for (const L of HOUSE.foot) L.i = 0.35;
    for (const L of HOUSE.cornice) L.i = S.phase === 'act' ? 0.22 : 0.55;
    for (const L of HOUSE.boxLamps) L.i = S.phase === 'act' ? 0.25 : 0.55;
  }
  // The arc lamp.
  if (h > 23.35 && h < 23.75) list.push({ x: STAGE.arc[0], y: STAGE.arc[1], z: STAGE.arc[2], r: 1.2, color: '#f4f8ff', a: 0.9 });
  // The star twinkling on the soloist's forehead (N p.232).
  const z = D.zelie;
  if (z && h >= 22.917 && h < 23.35 && !z.moving) list.push({ x: z.x, y: z.y + z.H * 0.97, z: z.z - 0.1, r: 0.18, color: '#ffffff', a: 0.6 + Math.sin(W.time * 13) * 0.35 });
  void n;
}
