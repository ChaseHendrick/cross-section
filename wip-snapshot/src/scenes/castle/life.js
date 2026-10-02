/* Conwy Castle: things that move. Drawbridges and portcullises on the day's timetable,
 * the portcullis winch, the well windlass and bucket, the kitchen spit, the forge bellows,
 * smoke and steam, the royal banner, boats on the tide, horses, cats, a dog, birds. */
import { THREE, mat, Kit } from '../../engine/index.js';
import { M, GATE_Z, WELL, TOWERS, DOCK, tideLevel, TIDE } from './common.js';
import { A } from './rooms.js';
import { crossbow } from './furniture.js';

const smooth = (a, b, t) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
// Gates open from first light to sunset (dossier 4.3: about 04:00 and 19:55).
const gateOpen = (h) => inH(h, 4.1, 19.9);

// Flue stacks on the wall tops where chimney smoke leaves (drawn in build()).
export const FLUES = [[23.0, 11.6, 4.6], [33.2, 11.0, 9.6], [TOWERS.sw.x - 2.6, 16.6, 3.4], [TOWERS.bake.x - 2.8, 16.4, 3.0], [TOWERS.nw.x, 16.2, 33.4], [TOWERS.kit.x + 1, 16.2, 33.4]];
export function buildFlues(k) { for (const [x, y, z] of FLUES) k.box(x - 0.35, y - 4.2, z - 0.35, x + 0.35, y - 0.05, z + 0.35, M.lime); }

export function buildLife(W, k, stage) {
  const g0 = GATE_Z[0], g1 = GATE_Z[1], g = (g0 + g1) / 2;
  const data = W.data;
  data.t = 0;

  // ---------------------------------------------------------------- drawbridges
  const deck = (len, w) => (q) => {
    q.box(-len, -0.28, 0, 0, 0, w, M.boards);
    for (let x = -len + 0.3; x < -0.1; x += 1.1) q.box(x, -0.4, 0.05, x + 0.18, -0.28, w - 0.05, M.oakDark);
    for (const z of [0.05, w - 0.15]) q.box(-len, -0.33, z, 0, -0.27, z + 0.1, M.iron);
  };
  const westBridge = k.part(-0.55, -2.18, g0 - 0.2, deck(5.6, g1 - g0 + 0.4));
  const midBridge = k.part(66.45, 0.02, g0 + 0.2, deck(4.4, g1 - g0 - 0.4));
  data.bridgeA = gateOpen(W.hour) ? 0 : 1;
  // Portcullises: oak lattice shod with iron, sliding in grooves.
  const lattice = (w, h) => (q) => {
    const wood = mat({ c: '#5a4430', c2: '#4a3626', pat: 'grain', cut: '#9a7448' });
    for (let z = 0.1; z <= w - 0.05; z += 0.34) { q.box(-0.07, 0, z - 0.06, 0.07, h, z + 0.06, wood); q.cyl(0, -0.22, z, 0.05, 0.22, M.iron, { seg: 4, r2: 0.0 }); }
    for (let y = 0.35; y < h; y += 0.42) q.box(-0.09, y - 0.05, 0, 0.09, y + 0.05, w, wood);
  };
  const pcOuter = k.part(0.35, -2.0, g0 + 0.15, lattice(g1 - g0 - 0.3, 3.6));
  const pcInner = k.part(14.55, 0.0, g0 + 0.05, lattice(g1 - g0 - 0.1, 4.3));
  // The winch in the chamber over the gate: a drum with two crank handles.
  const drum = k.part(16.4, 6.4, g, (q) => {
    q.cyl(0, 0, -1.6, 0.28, 3.2, M.oak, { axis: 'z', seg: 12 });
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; q.box(Math.cos(a) * 0.15 - 0.03, Math.sin(a) * 0.15 - 0.03, -1.6, Math.cos(a) * 0.15 + 0.03, Math.sin(a) * 0.15 + 0.03, 1.6, M.iron); }
    for (const z of [-1.75, 1.75]) { q.box(-0.04, -0.04, z - 0.05, 0.04, 0.6, z + 0.05, M.iron); q.box(-0.04, 0.55, z - 0.3 * Math.sign(z) - 0.05, 0.04, 0.63, z + 0.05, M.oakDark); }
  });
  // Drum supports and the chain down to the portcullis (static).
  for (const z of [g - 1.95, g + 1.95]) k.box(16.2, 4.9, z - 0.15, 16.6, 6.4, z + 0.15, M.oakDark);
  k.cyl(15.1, 4.9, g, 0.02, 1.5, M.iron, { seg: 4 });
  data.pc = gateOpen(W.hour) ? 1 : 0;
  W.addMachine((dt, t, w) => {
    const open = gateOpen(w.hour);
    const prevB = data.bridgeA, prevP = data.pc;
    // Bridges rise in about 25 s; the portcullis winds up slowly and drops fast.
    data.bridgeA += Math.sign((open ? 0 : 1) - data.bridgeA) * Math.min(Math.abs((open ? 0 : 1) - data.bridgeA), dt / 25);
    if (open) data.pc = Math.min(1, data.pc + dt / 70); else data.pc = Math.max(0, data.pc - dt / 2.5);
    westBridge.rotation.z = -data.bridgeA * 1.35;
    midBridge.rotation.z = -data.bridgeA * 1.35;
    pcOuter.position.y = -2.0 + data.pc * 3.3;
    pcInner.position.y = 0.0 + data.pc * 4.0;
    if (data.pc !== prevP && open) drum.rotation.z -= dt * 1.3;
    else if (data.pc !== prevP) drum.rotation.z += dt * 9;
    void prevB;
  });

  // ---------------------------------------------------------------- the well
  const windlass = k.part(WELL.x, A.well.y, WELL.z, (q) => {
    q.cyl(0, 0, -1.25, 0.2, 2.5, M.oak, { axis: 'z', seg: 10 });
    q.box(-0.04, -0.04, -1.42, 0.04, 0.5, -1.36, M.oakDark); q.box(-0.04, 0.44, -1.62, 0.04, 0.52, -1.36, M.oakDark);
  });
  const bucket = k.part(WELL.x, 0, WELL.z, (q) => { q.lathe([[0.16, -0.32], [0.2, 0], [0.17, 0], [0.001, -0.3]], 0, 0, mat('#6a5a48'), { seg: 10 }); q.box(-0.18, 0.02, -0.01, 0.18, 0.05, 0.01, M.iron); });
  const rope = k.part(WELL.x, 0, WELL.z, (q) => q.cyl(0, 0, 0, 0.022, 1, mat('#b8955a'), { seg: 5 }));
  data.wellY = 0.6;
  W.addMachine((dt, t, w) => {
    // A bucket every few minutes by day: down 18 m, a pause in the water, up again (about 0.5 m/s).
    const day = inH(w.hour, 5.2, 19.5);
    const cycle = 90, u = (t % cycle) / cycle;
    const depth = 13.8;
    let y = 0.6, spin = 0;
    if (day) {
      if (u < 0.4) { y = 0.6 - depth * smooth(0, 0.4, u); spin = -1; }
      else if (u < 0.48) { y = 0.6 - depth; }
      else if (u < 0.9) { y = 0.6 - depth * (1 - smooth(0.48, 0.9, u)); spin = 1; }
    }
    if (spin) windlass.rotation.z += spin * dt * 2.6;
    bucket.position.y = y + (y > 0.2 ? 0.5 : 0);
    rope.position.y = y + 0.05; rope.scale.y = Math.max(0.05, A.well.y - y - 0.05);
    data.wellY = y;
  });

  // ---------------------------------------------------------------- kitchen spit, cauldron steam, smoke
  const S = A.spit;
  const spit = k.part(S.x0, S.y, S.z, (q) => {
    q.cyl(0, 0, 0, 0.025, S.x1 - S.x0, M.iron, { axis: 'x', seg: 5 });
    q.box(-0.05, -0.32, -0.02, -0.0, 0.0, 0.02, M.iron); q.box(-0.25, -0.34, -0.02, -0.0, -0.3, 0.02, M.oakDark);
    for (let i = 0; i < 3; i++) q.sphere(0.9 + i * 1.1, 0, 0, 0.24, mat({ c: '#a8603a', c2: '#c8804a', pat: 'speckle' }), { seg: 9, rings: 6 });
  });
  W.addMachine((dt, t, w) => { if (inH(w.hour, 6.2, 18.2)) spit.rotation.x += dt * 0.85; });
  W.emitter({ kind: 'fire', x: 35.5, y: 0.5, z: 25.6, w: 4.5, d: 0.6, rate: 6, when: 'always' });
  for (const c of A.cauldrons) W.emitter({ kind: 'steam', x: c[0], y: 1.0, z: c[2] - 0.4, w: 0.4, d: 0.4, rate: 1.2, when: [5, 20] });
  W.emitter({ kind: 'steam', x: A.brew.pan[0], y: 1.4, z: A.brew.pan[2], w: 1.0, d: 0.8, rate: 2.2, when: [5.5, 18.5] });
  W.emitter({ kind: 'steam', x: A.brew.tun[0], y: 1.05, z: A.brew.tun[2], w: 1.0, d: 0.8, rate: 1.0, when: [6.8, 10] });
  // Smoke from the kitchen louvre, the hall-range flues, the towers' fireplaces, the forge and the town.
  const smoke = (x, y, z, rate, when, size = [1, 6]) => W.emitter({ kind: 'smoke', x, y, z, w: 0.8, d: 0.8, rate, size, color: '#7a726a', when });
  smoke(35.5, 8.2, 28.4, (w) => (inH(w.hour, 9, 11.5) || inH(w.hour, 16.5, 18.5) ? 5 : 2.2), 'always', [1.2, 8]);
  smoke(46.6, 7.6, 28.0, 1.2, [5.5, 18.5]);
  smoke(26.3, 7.6, 28.2, 1.0, [5.5, 18.5]);
  smoke(23.0, 11.6, 4.6, 0.9, [5, 22]);
  smoke(33.2, 11.0, 9.6, 0.6, [6, 21]);
  smoke(TOWERS.sw.x - 2.6, 16.6, 3.4, (w) => (inH(w.hour, 2.8, 7) ? 3 : 0.8), 'always');
  smoke(TOWERS.bake.x - 2.8, 16.4, 3.0, (w) => (inH(w.hour, 6.5, 10) ? 2.6 : 0.6), 'always');
  smoke(TOWERS.nw.x, 16.2, 33.4, 0.6, [17, 8]);
  smoke(TOWERS.kit.x + 1, 16.2, 33.4, 0.7, 'always');
  smoke(-42, 3.4, 3.2, 1.0, 'always', [1, 5]);
  smoke(-33.8, 3.4, 3.2, 1.0, 'always', [1, 5]);
  smoke(-45, 3.6, 13.6, 0.6, 'always', [1, 5]);
  // Embers in the cut-open ovens, sparks at the forge when the smith strikes.
  W.emitter({ kind: 'ember', x: TOWERS.sw.x - 4.15, y: 1.2, z: 1.25, w: 1.4, d: 1.0, rate: (w) => (inH(w.hour, 2.8, 9.8) ? 3 : 0.3), when: 'always' });
  W.emitter({ kind: 'ember', x: TOWERS.bake.x - 4.2, y: 1.2, z: 1.15, w: 1.2, d: 1.0, rate: (w) => (inH(w.hour, 6, 10) ? 2.5 : 0.3), when: 'always' });
  W.emitter({ kind: 'spark', x: 27.0, y: 1.0, z: 26.0, w: 0.3, d: 0.3, rate: (w) => (w.people.some((p) => p.name === 'Wat Hamond' && !p.moving && p.routine[p.step] && (p.routine[p.step].tags || []).includes('anvil')) ? 5 : 0), when: 'always' });

  // ---------------------------------------------------------------- the forge bellows
  const bel = k.part(A.forge.bellows[0], A.forge.bellows[1], A.forge.bellows[2], (q) => {
    q.box(-0.55, 0, -0.35, 0.45, 0.06, 0.35, M.oak);
    q.box(-0.55, 0.06, -0.33, 0.4, 0.3, 0.33, mat({ c: '#6a4a32', c2: '#5a3a26', pat: 'canvas' }));
    q.box(-0.55, 0.3, -0.35, 0.45, 0.36, 0.35, M.oak);
    q.box(0.45, 0.12, -0.05, 0.85, 0.22, 0.05, M.iron);
  });
  W.addMachine((dt, t, w) => { const on = inH(w.hour, 5.4, 18); bel.scale.y = on ? 0.65 + 0.35 * (0.5 + 0.5 * Math.sin(t * 3.4)) : 1; });

  // ---------------------------------------------------------------- the royal banner
  // Edward I's arms: three gold lions on red (dossier caption 34). Flown here from the
  // Chapel Tower's watch turret [illustrative choice of turret].
  const ct = TOWERS.chap, ta = 1.0, tr = 6 - 1.75;
  const bx = ct.x + Math.cos(ta) * tr, bz = ct.z + Math.sin(ta) * tr;
  k.cyl(bx, 21.5, bz, 0.05, 5.2, mat({ c: '#6a5038', whole: true }), { seg: 6 });
  const banner = k.part(bx, 26.0, bz, (q) => {
    const red = mat({ c: '#b0262a', c2: '#901e22', thin: true, whole: true });
    const gold = mat({ c: '#e0b040', thin: true, whole: true });
    const n = 6, L = 2.6, H = 1.6;
    for (let i = 0; i < n; i++) q.box((L * i) / n, -H, -0.01, (L * (i + 1)) / n + 0.005, 0, 0.01, red);
    for (let j = 0; j < 3; j++) { // three lions passant guardant, drawn as small gold figures
      const y = -0.3 - j * 0.48, x0 = 0.75;
      q.box(x0, y - 0.13, -0.02, x0 + 0.7, y + 0.0, 0.02, gold);
      q.box(x0 + 0.62, y - 0.02, -0.02, x0 + 0.86, y + 0.16, 0.02, gold);
      for (const lx of [x0 + 0.05, x0 + 0.55]) q.box(lx, y - 0.24, -0.02, lx + 0.08, y - 0.1, 0.02, gold);
      q.box(x0 - 0.18, y - 0.02, -0.02, x0 + 0.02, y + 0.12, 0.02, gold);
    }
  });
  W.addMachine((dt, t, w) => {
    const wv = w.wind || 2;
    banner.rotation.y = -0.35 + Math.sin(t * 1.3) * 0.18 * Math.min(1.5, wv / 2);
    banner.scale.x = 0.92 + 0.08 * Math.sin(t * 3.1);
    banner.rotation.z = Math.sin(t * 2.3) * 0.04;
  });

  // ---------------------------------------------------------------- the river: tide and boats
  const sea = k._castleSea;
  // The water's cut face, rising and falling with the sea (a sheet drawn in the overlay).
  const sk = new Kit({ id: 'castle-sheet' }, { local: true });
  sk.sheet(121.0, 700, 0, 1, 0.01, { c: '#3e6470', alpha: 0.34 });
  const sheet = new THREE.Group();
  for (const m of sk.meshes()) sheet.add(m);
  k.object(sheet, { overlay: true });
  const boats = [];
  const boat = (len, beam, opt = {}) => k.part(0, 0, 0, (q) => {
    const sec = [];
    const H = opt.h || 0.55;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = -len / 2 + len * t, w = beam / 2 * Math.pow(Math.sin(Math.PI * Math.min(0.97, Math.max(0.03, t))), 0.6);
      const sh = H * (1 + 0.35 * Math.pow(Math.abs(t - 0.5) * 2, 2)); // sheer: ends rise
      sec.push({ x, pts: [[-w, sh], [-w * 0.8, H * 0.22], [0, 0], [w * 0.8, H * 0.22], [w, sh]] });
    }
    q.loft(sec, mat({ c: opt.hull || '#6a4a30', c2: '#5a3c24', pat: 'planks', s: 0.2, cut: '#b08a5a', whole: true }), { caps: true });
    q.box(-len / 2 + 0.6, H * 0.4, -beam * 0.3, len / 2 - 0.6, H * 0.4 + 0.08, beam * 0.3, mat({ c: '#8a6a44', whole: true }));
    if (opt.mast) {
      q.cyl(0, 0.2, 0, 0.14, opt.mast, mat({ c: '#6a5038', whole: true }), { seg: 7 });
      q.cyl(-len * 0.3, opt.mast * 0.78, 0, 0.08, len * 0.6, mat({ c: '#6a5038', whole: true }), { axis: 'x', seg: 6 });
      q.cyl(-len * 0.3, opt.mast * 0.72, 0, 0.32, len * 0.6, mat({ c: '#e8dcc0', c2: '#d0c4a8', pat: 'canvas', whole: true }), { axis: 'x', seg: 8 });
      q.box(-len / 2 + 0.6, H * 1.1, -beam * 0.32, -len / 2 + 3.0, H * 1.1 + 1.2, beam * 0.32, mat({ c: '#6a4a30', c2: '#5a3c24', pat: 'planks', s: 0.25, whole: true }));
      q.box(len / 2 - 2.6, H * 1.1, -beam * 0.28, len / 2 - 0.5, H * 1.1 + 1.0, beam * 0.28, mat({ c: '#6a4a30', c2: '#5a3c24', pat: 'planks', s: 0.25, whole: true }));
    }
    if (opt.cargo) for (let i = 0; i < opt.cargo; i++) q.cyl(-len * 0.2 + i * 0.6, 0.28, (i % 2 ? 0.25 : -0.25), 0.25, 0.6, mat({ c: '#8a6038', whole: true }), { seg: 8 });
  });
  // Moored ship [illustrative], fishing boats at anchor, the royal ferry crossing, a boat at the dock.
  const ship = boat(16, 5.2, { mast: 13, hull: '#5a3e28', h: 2.2 });
  boats.push({ o: ship, x: 152, z: 46, rot: 0.25, bob: 0.3 });
  for (const [x, z, r] of [[136, 26, 0.8], [164, 30, -0.4], [143, 62, 1.6], [171, 70, 0.3]]) boats.push({ o: boat(4.4, 1.6, { hull: '#7a5a3a' }), x, z, rot: r, bob: 0.5 });
  const dockBoat = boat(5.2, 1.8, { cargo: 3, hull: '#6e5034' });
  boats.push({ o: dockBoat, x: 123.5, z: 35.0, rot: 0.05, bob: 0.4 });
  const ferry = boat(7.0, 2.4, { hull: '#5e4630' });
  const fer = { o: ferry, x: 130, z: 52, rot: 0, bob: 0.3, ferry: true };
  boats.push(fer);
  // A nervous horse in the ferry (H12): body, neck and head, tossing.
  const fhorse = horsePart(k, '#7a5034');
  data.tide = tideLevel(W.hour);
  W.addMachine((dt, t, w) => {
    const L = tideLevel(w.hour);
    data.tide = L;
    if (sea) sea.position.y = L;
    sheet.position.y = -14.5; sheet.scale.y = Math.max(0.01, L + 14.5);
    // The ferry shuttles across the river, about 50 m, with pauses at each bank.
    const per = 160, u = (t % per) / per;
    const p = u < 0.4 ? smooth(0, 0.4, u) : u < 0.5 ? 1 : u < 0.9 ? 1 - smooth(0.5, 0.9, u) : 0;
    fer.x = 128 + p * 44; fer.rot = u < 0.5 ? 0 : Math.PI; fer.moving = (u < 0.4 || (u > 0.5 && u < 0.9));
    for (const b of boats) {
      const y = L - 0.25 + Math.sin(t * 1.1 + b.x) * 0.06 * b.bob;
      b.o.position.set(b.x, b === boats[0] ? y - 1.2 : y, b.z);
      b.o.rotation.y = b.rot + Math.sin(t * 0.3 + b.z) * 0.04;
      b.o.rotation.x = Math.sin(t * 0.9 + b.x) * 0.03 * b.bob;
    }
    fhorse.position.set(fer.x + 0.6, L + 0.05, fer.z);
    fhorse.rotation.y = fer.rot;
    fhorse.userData.head.rotation.z = 0.25 + Math.sin(t * 2.6) * 0.25 + (fer.moving ? Math.sin(t * 7) * 0.1 : 0);
  });
  // Crews: the ferryman pair and a fisherman, riding the boats.
  const crew = (b, dx, dz, act, cos, dy = 0.28) => W.addPerson({ costume: cos, at: [b.x, 0, b.z], act, face: 0, update: (pp) => {
    const c = Math.cos(b.o.rotation.y), s = Math.sin(b.o.rotation.y);
    pp.x = b.o.position.x + dx * c + dz * s; pp.z = b.o.position.z - dx * s + dz * c; pp.y = b.o.position.y + dy;
    pp.heading = pp.targetHeading = -b.o.rotation.y + (act === 'sitRow' ? Math.PI : 0);
  } });
  crew(fer, -1.2, 0, 'sitRow', { top: '#6a5a42', bottom: '#4a3a2a', hat: 'hood', hatColor: '#4a5a4a', skin: '#e0b896' });
  crew(fer, 1.0, -0.4, 'sitTalk', { top: '#3a4a6a', bottom: '#3a3a3a', coat: 'long', coatColor: '#5a3a3a', hat: 'hood', hatColor: '#5a3a3a', skin: '#f0d0b0' });
  crew(boats[1], 0.4, 0, 'sitWork', { top: '#7a6a4a', bottom: '#4a3a2a', hat: 'straw', hatColor: '#d8c080', skin: '#dcb48e' });
  crew(boats[3], -0.3, 0, 'sitWork', { top: '#5a6a4a', bottom: '#4a3a2a', hat: 'hood', hatColor: '#6a5a3a', skin: '#e8c4a0' });
  crew(boats[0], -5.5, 0.4, 'stand', { top: '#8a5a3a', bottom: '#3a3a2e', hat: 'hood', hatColor: '#7a4a2a', skin: '#e4bc98' }, 0.98);
  crew(boats[0], 3.0, -0.8, 'haul', { top: '#5a5a6a', bottom: '#3a3a2e', skin: '#d0a47c' }, 0.98);

  // ---------------------------------------------------------------- animals
  // Horses in the stables: head down to the hay rack, tail swishing.
  A.horses.forEach((h, i) => {
    const hp = horsePart(k, ['#6a4028', '#3a2a22', '#a07048'][i]);
    hp.position.set(h[0], h[1], h[2]);
    hp.rotation.y = -Math.PI / 2;
    W.addMachine((dt, t) => { hp.userData.head.rotation.z = -0.3 + Math.sin(t * 0.5 + i * 2) * 0.35; hp.userData.tail.rotation.x = Math.sin(t * 1.7 + i) * 0.5; });
  });
  // Cats: one in the family chamber, one in the granary, one stalking a rat between the wine casks (H7).
  const catPart = (c) => k.part(0, 0, 0, (q) => {
    const m = mat(c);
    q.sphere(0, 0.13, 0, 0.13, m, { seg: 8, rings: 5 });
    q.sphere(0.17, 0.2, 0, 0.075, m, { seg: 8, rings: 5 });
    q.cyl(0.2, 0.26, -0.04, 0.02, 0.06, m, { seg: 3, r2: 0 }); q.cyl(0.2, 0.26, 0.04, 0.02, 0.06, m, { seg: 3, r2: 0 });
    q.cyl(-0.12, 0.15, 0, 0.018, 0.24, m, { axis: 'x', seg: 4 });
  }, { whole: true });
  const cats = [['cat.sw', '#4a4038', 0.5], ['cat.granary', '#c8884a', 0.9], ['cat.stable', '#2a2420', 0.3]];
  for (const [sp, col, r] of cats) {
    const c = catPart(col); const p0 = A.spots[sp];
    W.addActor({ object: c, update(dt, t) { const a = Math.sin(t * 0.08 + p0[0]); c.position.set(p0[0] + a * r, p0[1], p0[2] + Math.cos(t * 0.06) * 0.2); c.rotation.y = Math.cos(t * 0.08 + p0[0]) > 0 ? 0 : Math.PI; } });
  }
  const cellarCat = catPart('#6a6058');
  const rat = k.part(0, 0, 0, (q) => { const m = mat('#5a5048'); q.sphere(0, 0.05, 0, 0.055, m, { seg: 6, rings: 4 }); q.sphere(0.06, 0.05, 0, 0.03, m, { seg: 6, rings: 4 }); q.cyl(-0.05, 0.03, 0, 0.008, 0.14, m, { axis: 'x', seg: 3 }); });
  const cc = A.spots['cat.cellar'];
  W.addActor({ object: cellarCat, update(dt, t) {
    const u = (t % 40) / 40;
    const run = u > 0.7 && u < 0.8;
    const rx = cc[0] + 1.8 - (run ? (u - 0.7) * 30 : u * 0.6);
    rat.position.set(Math.max(cc[0] - 1.5, rx), cc[1], cc[2] + 0.5);
    rat.rotation.y = Math.PI;
    cellarCat.position.set(cc[0] - 0.4 + Math.min(u, 0.7) * 1.6 - (run ? (u - 0.7) * 12 : 0), cc[1], cc[2] + 0.45);
    cellarCat.scale.y = run ? 1 : 0.8; // crouched while stalking
    cellarCat.rotation.y = 0;
  } });
  W.addActor({ object: rat, update() {} });
  // The kitchen dog, and the moment it steals a bone and is chased (about 12.8 to 13.2).
  const dog = k.part(0, 0, 0, (q) => {
    const m = mat('#8a6a48');
    q.boxR(0, 0.38, 0, 0.6, 0.24, 0.22, m, {});
    q.sphere(0.36, 0.52, 0, 0.11, m, { seg: 7, rings: 5 });
    q.box(0.42, 0.46, -0.04, 0.56, 0.52, 0.04, m);
    for (const [x, z] of [[-0.22, -0.08], [-0.22, 0.08], [0.22, -0.08], [0.22, 0.08]]) q.box(x - 0.03, 0, z - 0.03, x + 0.03, 0.3, z + 0.03, m);
    q.beam([-0.3, 0.42, 0], [-0.5, 0.6, 0], 0.04, m);
  }, { whole: true });
  const dk = A.spots['dog.kitchen'];
  W.addActor({ object: dog, update(dt, t, w) {
    const h = w.hour;
    if (inH(h, 12.75, 13.25)) { const u = (h - 12.75) / 0.5; dog.position.set(dk[0] + u * 14, 0, dk[2] - 2.2 - Math.sin(u * 6) * 0.6); dog.rotation.y = 0; }
    else { dog.position.set(dk[0] + Math.sin(t * 0.05) * 0.5, 0, dk[2]); dog.rotation.y = Math.PI; }
  } });
  // Hens scratching in a corner of the outer ward.
  for (let i = 0; i < 5; i++) {
    const hen = k.part(0, 0, 0, (q) => { const m = mat(i % 2 ? '#b8743a' : '#e8e0d0'); q.sphere(0, 0.16, 0, 0.12, m, { seg: 7, rings: 5 }); q.sphere(0.1, 0.27, 0, 0.055, m, { seg: 6, rings: 4 }); q.box(0.14, 0.3, -0.01, 0.17, 0.33, 0.01, mat('#c83a2a')); }, { whole: true });
    W.addActor({ object: hen, update(dt, t, w) {
      const day = inH(w.hour, 5, 20);
      hen.visible = day;
      hen.position.set(24.6 + i * 0.7 + Math.sin(t * 0.3 + i * 2) * 0.5, 0, 11.4 + (i % 2) * 0.6 + Math.cos(t * 0.25 + i) * 0.3);
      hen.rotation.y = Math.sin(t * 0.4 + i) * 2;
      hen.rotation.z = Math.max(0, Math.sin(t * 3 + i * 1.7)) * 0.5;
    } });
  }
  // Gulls over the estuary, jackdaws round the towers; one jackdaw steals a scrap from the
  // courtyard and flies up into a putlog hole on the South-west Tower (H6).
  const bird = (c, s) => k.part(0, 0, 0, (q) => {
    const w = mat({ c, thin: true, whole: true });
    q.sphere(0, 0, 0, 0.12 * s, mat({ c, whole: true }), { seg: 6, rings: 4 });
    q.boxR(0, 0.02, 0.32 * s, 0.18 * s, 0.02, 0.55 * s, w, { x: 0.25 });
    q.boxR(0, 0.02, -0.32 * s, 0.18 * s, 0.02, 0.55 * s, w, { x: -0.25 });
  }, { whole: true });
  for (let i = 0; i < 9; i++) {
    const gl = bird('#f2f0ea', 1.2);
    const cx = 130 + (i % 3) * 14, cz = 20 + i * 4, r = 10 + i * 1.5, y0 = 8 + i * 2.2;
    W.addActor({ object: gl, update(dt, t, w) {
      gl.visible = w.sun().day > 0.3;
      const ph = t * (0.1 + i * 0.012) + i;
      gl.position.set(cx + Math.cos(ph) * r, y0 + Math.sin(t * 0.6 + i) * 1.2, cz + Math.sin(ph) * r * 0.6);
      gl.rotation.y = -ph - Math.PI / 2; gl.rotation.z = Math.sin(t * 5 + i) * 0.25;
    } });
  }
  for (let i = 0; i < 6; i++) {
    const jd = bird('#2e2c30', 0.75);
    const T = [TOWERS.sw, TOWERS.kit, TOWERS.stock, TOWERS.bake, TOWERS.nw, TOWERS.chap][i];
    W.addActor({ object: jd, update(dt, t, w) {
      jd.visible = w.sun().day > 0.25;
      const ph = t * (0.32 + i * 0.03) + i * 2;
      jd.position.set(T.x + Math.cos(ph) * 8, 17 + Math.sin(t * 0.8 + i) * 2.5, T.z + 3 + Math.sin(ph) * 5);
      jd.rotation.y = -ph - Math.PI / 2; jd.rotation.z = Math.sin(t * 8 + i) * 0.35;
    } });
  }
  const thief = bird('#2e2c30', 0.75);
  W.addActor({ object: thief, update(dt, t, w) {
    thief.visible = w.sun().day > 0.25;
    const u = (t % 60) / 60;
    const nest = [TOWERS.sw.x + 3.2, 9.6, 5.1], scrap = [31.0, 0.1, 14.8];
    let p;
    if (u < 0.35) p = nest.map((v, j) => v + (scrap[j] - v) * smooth(0, 0.35, u) + (j === 1 ? Math.sin(u / 0.35 * Math.PI) * 4 : 0));
    else if (u < 0.5) p = scrap;
    else if (u < 0.85) p = scrap.map((v, j) => v + (nest[j] - v) * smooth(0.5, 0.85, u) + (j === 1 ? Math.sin((u - 0.5) / 0.35 * Math.PI) * 4 : 0));
    else p = nest;
    thief.position.set(p[0], p[1], p[2]);
    thief.rotation.y = u < 0.5 ? Math.PI * 0.95 : 0;
    thief.rotation.z = (u < 0.35 || (u > 0.5 && u < 0.85)) ? Math.sin(t * 9) * 0.4 : 0;
  } });
  // Bees round the straw skep by day.
  W.emitter({ kind: 'mote', x: 115.4, y: 0.2, z: 6.0, w: 0.8, d: 0.8, rate: 2, when: 'day' });

  // ---------------------------------------------------------------- crossbow practice at the butt
  const xb = k.part(0, 0, 0, (q) => crossbow(q, 0, 0, 0, 0, {}), { whole: true });
  const bolt = k.part(0, 0, 0, (q) => { q.cyl(0, 0, 0, 0.012, 0.36, M.oakDark, { axis: 'x', seg: 4 }); q.box(0.32, -0.015, -0.015, 0.38, 0.015, 0.015, M.iron); }, { whole: true });
  W.addActor({ object: xb, update(dt, t, w) {
    const sh = w.people.find((p) => p.name === 'Robin Swan');
    const st = sh && sh.routine[sh.step];
    const on = sh && !sh.moving && st && (st.tags || []).includes('shooter');
    xb.visible = !!on; bolt.visible = false;
    if (!on) return;
    const hx = sh.x + Math.cos(sh.heading) * 0.35, hz = sh.z + Math.sin(sh.heading) * 0.35;
    xb.position.set(hx, sh.y + 1.35, hz); xb.rotation.y = -sh.heading;
    const u = (t % 12) / 12; // a shot about every half minute of clock time
    if (u < 0.12) { bolt.visible = true; const tgt = A.butt; const f = u / 0.12; bolt.position.set(hx + (tgt[0] - hx) * f, sh.y + 1.35 + (tgt[1] - sh.y - 1.35) * f, hz + (tgt[2] - hz) * f); bolt.rotation.y = 0; }
  } });
  W.addActor({ object: bolt, update() {} });

  // ---------------------------------------------------------------- the prisoner's crust (H2)
  const crust = k.part(0, 0, 0, (q) => { q.sphere(0, 0, 0, 0.06, mat('#c8904a'), { seg: 6, rings: 4 }); q.cyl(0, 0, 0, 0.004, 3.6, mat('#d8c8a0'), { seg: 3 }); }, { whole: true });
  W.addActor({ object: crust, update(dt, t, w) {
    const gp = w.people.find((p) => p.name === 'Geoffrey Hardel');
    const st = gp && gp.routine[gp.step];
    const on = gp && !gp.moving && st && (st.tags || []).includes('crust');
    crust.visible = !!on;
    if (!on) return;
    const pit = A.spots.pit;
    crust.position.set(pit[0] + 0.4, -3.0 + 0.6 + (Math.sin(t * 0.6) * 0.5 + 0.5) * 2.4, pit[2] + 0.1);
  } });
}

// A horse built as a part with a moving head and tail; returns the group (userData.head, .tail).
function horsePart(k, col) {
  const m = mat({ c: col, whole: true }), dark = mat({ c: '#2a2220', whole: true });
  const g = k.part(0, 0, 0, (q) => {
    q.boxR(0, 1.05, 0, 1.5, 0.6, 0.5, m, {});
    q.sphere(-0.65, 1.05, 0, 0.32, m, { seg: 8, rings: 5 }); q.sphere(0.65, 1.1, 0, 0.32, m, { seg: 8, rings: 5 });
    for (const [x, z] of [[-0.6, -0.16], [-0.6, 0.16], [0.6, -0.16], [0.6, 0.16]]) q.box(x - 0.06, 0, z - 0.06, x + 0.06, 0.85, z + 0.06, m);
    for (const [x, z] of [[-0.6, -0.16], [-0.6, 0.16], [0.6, -0.16], [0.6, 0.16]]) q.box(x - 0.07, 0, z - 0.07, x + 0.07, 0.1, z + 0.07, dark);
  }, { whole: true });
  const head = k.part(0, 0, 0, (q) => {
    q.beam([0, 0, 0], [0.45, 0.55, 0], 0.26, m);
    q.boxR(0.62, 0.55, 0, 0.5, 0.2, 0.2, m, { z: -0.5 });
    q.box(0.3, 0.3, -0.04, 0.45, 0.75, 0.04, dark);
  }, { whole: true });
  head.position.set(0.75, 1.25, 0);
  g.add(head);
  const tail = k.part(0, 0, 0, (q) => q.beam([0, 0, 0], [-0.25, -0.7, 0], 0.08, dark), { whole: true });
  tail.position.set(-0.8, 1.25, 0);
  g.add(tail);
  g.userData.head = head; g.userData.tail = tail;
  return g;
}
void DOCK; void TIDE;
