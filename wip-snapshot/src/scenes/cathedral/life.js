/* Salisbury 1245: the walking graph, the moving machinery, animals, smoke and sound.
 *
 * Machines (dossier section 6): a great wheel on the nave tie beams (a plausible
 * reconstruction: England's first record of a treadwheel is 1331), a ground windlass,
 * smith's bellows, a pit saw, the bell-founder's strickle board, the plumbers' strickle,
 * ox carts on the Chilmark road, a thurible at High Mass.
 */
import { THREE, mat, anims } from '../../engine/index.js';
import { M, BAY, bayX, PIERX, CROSS, QUIRE, PRES, RETRO, TRIN, ECROSS, PZ, WZ1, AZ0, PLATE, RIDGE, ZMIN, archY } from './common.js';
import { SCAF, LODGE, SMITHY, BELL, CAST } from './site.js';
import { STALLS, PAINTER, ALTAR } from './fittings.js';
import { COTTAGES, HOMES } from './town.js';
import { riverX } from './ground.js';

// ------------------------------------------------------------------ extra animations
anims.register('paintUp', (p, t, P) => {
  anims.table.stand(p, t, P);
  const s = Math.sin(t * 2.2 + p.ph);
  P.uaF = -2.7 + s * 0.2; P.faF = -0.3 + s * 0.3; P.uaB = -0.4; P.faB = 0.6; P.head = -0.5; P.lean = -0.12;
  return P;
});
anims.register('sawTop', (p, t, P) => { // top sawyer on the log, hauling the pit saw up and guiding it down
  anims.table.stand(p, t, P);
  const s = Math.sin(t * 6.2 + p.ph);
  P.lean = 0.35 + s * 0.12; P.uaF = -0.4 + s * 0.35; P.faF = 0.6; P.uaB = -0.35 + s * 0.35; P.faB = 0.65; P.head = 0.45;
  return P;
});
anims.register('sawPit', (p, t, P) => { // bottom sawyer in the pit, pulling down with arms above his head
  anims.table.stand(p, t, P);
  const s = Math.sin(t * 6.2 + p.ph);
  P.lean = -0.05; P.uaF = -2.5 - s * 0.3; P.faF = 0.4 + s * 0.3; P.uaB = -2.4 - s * 0.3; P.faB = 0.4 + s * 0.3; P.head = -0.4;
  return P;
});
anims.register('ram', (p, t, P) => { // ramming rubble into the footing
  anims.table.stand(p, t, P);
  const c = (t * 0.9 + p.ph) % 1, u = c < 0.6 ? c / 0.6 : 1 - (c - 0.6) / 0.4;
  P.lean = 0.15; P.uaF = -1.4 - u * 0.9; P.faF = 1.0; P.uaB = -1.3 - u * 0.9; P.faB = 1.05; P.rootY = 0.52 + u * 0.02;
  P.prop = 'shovel'; P.propAng = Math.PI - 0.1;
  return P;
});
anims.register('bless', (p, t, P) => { // a priest at the altar, hands raised
  anims.table.stand(p, t, P);
  const s = Math.sin(t * 0.6 + p.ph);
  P.uaF = -1.9 + s * 0.15; P.faF = 0.7; P.uaB = -1.8 + s * 0.15; P.faB = 0.7; P.head = -0.1;
  return P;
});
anims.register('sing', (p, t, P) => { // standing in choir, book in hand
  anims.table.stand(p, t, P);
  P.uaF = -0.6; P.faF = 1.7; P.uaB = -0.5; P.faB = 1.7; P.head = 0.2 + Math.sin(t * 0.8 + p.ph) * 0.05; P.prop = P.prop || 'book';
  P.mouth = Math.sin(t * 3 + p.ph) > -0.2 ? 1 : 0;
  return P;
});
anims.register('sitSing', (p, t, P) => { anims.table.sitRead(p, t, P); P.head = 0.15; P.mouth = Math.sin(t * 3 + p.ph) > -0.2 ? 1 : 0; return P; });
anims.register('preach', (p, t, P) => {
  anims.table.talk(p, t, P);
  const g = Math.sin(t * 1.4 + p.ph) * 0.5 + 0.5;
  P.uaB = -0.8 - g * 0.9; P.faB = 0.6; P.uaF = -1.6 - g * 0.6; P.faF = 0.3;
  return P;
});

// ------------------------------------------------------------------ the walking graph
export function buildNav(W) {
  const nav = W.nav;
  const N = (id, x, y, z) => nav.node(id, x, y, z);
  const chain = (prefix, pts, kind = 'walk') => { const ids = pts.map((p, i) => N(prefix + i, p[0], p[1], p[2])); nav.chain(ids, kind); return ids; };
  const near = (x, y, z, f) => nav.nearest(x, y, z, f);
  const link = (a, b, kind = 'walk') => nav.link(a, b, kind);

  // Main line: the Chilmark road, the yard, through the lodge, over the trench, up the nave,
  // through the screen door and east through the church to the Trinity Chapel.
  const yard = [[-62, 0, 8.0], [-52, 0, 8.0], [-46.5, 0, 6.8], [-45, 0, 1.2], [-41, 0, 1.2], [-37, 0, 1.2], [-34.2, 0, 1.2], [-33.6, 0, 4.3], [-30.5, 0, 4.3], [-28.2, 0, 4.3], [-27.6, 0, 1.2], [-25.2, 0, 1.2], [-23.2, 0, 1.25], [-22.4, 0, 1.3],
    [-21.4, 0, 1.95], [-19.2, 0, 1.95], [-17.4, 0, 1.95], [-15.6, 0, 1.95], [-13.6, 0, 1.95], [-11.0, 0, 1.95], [-9.2, 0, 1.95], [-7.8, 0, 1.95], [-7.0, 0, 3.0], [-4.9, 0, 3.1], [-2.8, 0, 3.15], [-0.8, 0, 3.0], [-0.4, 0, 1.9], [0.9, 0.06, 1.9], [2.4, 0.06, 1.9], [4.0, 0.22, 1.9], [5.8, 0, 1.9]];
  const ids = chain('m', yard);
  W.data.exitW = ids[0];
  const nave = [];
  for (let x = 8.3; x < 59.5; x += 2.8) nave.push([x, 0, x > 52 && x < 56 ? 2.5 : 2.1]);
  nave.push([59.6, 0, 2.1], [60.25, 0, 1.7], [61.3, 0, 1.7], [64.5, 0, 1.7], [67.5, 0, 1.7], [70.5, 0, 1.7], [73.3, 0, 1.2]);
  for (let x = 75.0; x < 91.5; x += 2.0) nave.push([x, 0.07, 1.0]);
  nave.push([92.5, 0, 1.2], [95.0, 0, 1.3], [97.5, 0, 1.3], [100.5, 0, 1.4], [103.5, 0, 1.6], [106.2, 0, 2.2], [109.6, 0, 2.8], [111.9, 0.24, 2.8], [114.3, 0.44, 2.8], [116.0, 0.64, 2.95], [118.8, 0.64, 2.95], [120.2, 0, 2.8], [121.4, 0, 1.6], [123.5, 0, 1.6], [126.0, 0, 1.6], [129.0, 0, 1.6], [131.5, 0, 1.6], [134.0, 0, 1.6], [137.6, 0, 1.4]);
  const nids = chain('n', nave);
  link(ids[ids.length - 1], nids[0]);
  // The cart road behind the yard.
  const road = chain('road', [[-52, 0, 8.0], [-46, 0, 8.6], [-41, 0, 7.2], [-36, 0, 7.0]]);
  link(road[0], ids[1]); link(road[1], ids[2]);
  // North aisle of the nave, linked through every arcade bay.
  const aisle = [];
  for (let x = 6.5; x < 60.5; x += 2.8) aisle.push([x, 0, 9.4]);
  const aids = chain('na', aisle);
  for (let b = 1; b <= 10; b++) {
    const x = bayX(b) + BAY / 2;
    link(near(x, 0, 2.1, (n) => n.id.startsWith('n') && !n.id.startsWith('na')), near(x, 0, 9.4, (n) => n.id.startsWith('na')));
  }
  // East aisle: quire, presbytery, retrochoir, with links where the stalls leave room.
  const eaPts = [];
  for (let x = 63.5; x < 125; x += 3.0) eaPts.push([x, 0, 9.4]);
  const eids = chain('ea', eaPts);
  link(aids[aids.length - 1], eids[0]);
  const linkX = (x, z1) => link(near(x, 0, z1, (n) => n.id.startsWith('n') && !n.id.startsWith('na')), near(x, 0, 9.4, (n) => n.id.startsWith('ea')));
  linkX(67.5, 1.7); linkX(97.5, 1.3); linkX(106.2, 2.2); linkX(121.4, 1.6);
  // The north porch doorway in bay 5: workers on the nave and the roof come and go here.
  const pd = chain('pd', [[bayX(5) + 2.8, 0, 9.4], [bayX(5) + 2.8, 0, 12.3], [bayX(5) + 2.8, 0, 16.0]]);
  link(pd[0], near(bayX(5) + 2.8, 0, 9.4, (n) => n.id.startsWith('na')));
  W.data.exitN = pd[2];
  W.data.cdoor = N('cdoor', 75.6, 0, 10.4); link('cdoor', near(75.6, 0, 9.4, (n) => n.id.startsWith('ea')));
  // Main transept and its chapels; the eastern transept.
  const tr = chain('tr', [[67.5, 0, 9.4], [67.5, 0, 13.0], [67.5, 0, 15.4], [67.5, 0, 19.0], [67.5, 0, 22.0], [67.5, 0, 25.0], [67.5, 0, 28.0], [67.5, 0, 29.6]]);
  link(tr[0], near(67.5, 0, 9.4, (n) => n.id.startsWith('ea')));
  for (const [zt, zc] of [[15.4, 15.4], [22.0, 21.4], [28.0, 27.4]]) { const c = N('tc' + zc, 77.2, 0, zc); link(near(67.5, 0, zt, (n) => n.id.startsWith('tr')), c); }
  const et = chain('et', [[97.5, 0, 9.4], [97.5, 0, 13.5], [97.5, 0, 18.0]]);
  link(et[0], near(97.5, 0, 9.4, (n) => n.id.startsWith('ea')));

  // Quire: the stall platform behind the desks, and the floor in front of the forms.
  const qs = [], qb = [];
  for (let x = 75.6; x < 91; x += 1.65) { qs.push([x, 0.4, 3.85]); qb.push([x + 0.2, 0.07, 3.0]); }
  const qsi = chain('qs', qs), qbi = chain('qb', qb);
  const qw = N('qw', 74.8, 0.07, 3.4);
  link(qw, qsi[0], 'stairs'); link(qw, qbi[0]); link(qw, near(75.0, 0.07, 1.0, (n) => n.id.startsWith('n')));
  // Painter's rope ladder and hanging scaffold.
  const pf = N('pf', PAINTER.x0 + 0.5, 0.07, 1.2), pt = N('pt', PAINTER.x0 + 0.5, PAINTER.y, 1.6), pm = N('pm', 82.6, PAINTER.y, 2.0);
  link(pf, near(PAINTER.x0 + 0.5, 0.07, 1.0, (n) => n.id.startsWith('n'))); link(pf, pt, 'rope'); link(pt, pm);

  // Tall scaffold (bays 7 and 8): lifts joined by ladders, and a long ladder to the roof.
  const tz = SCAF.tallZ;
  const liftNodes = SCAF.tall.map((L, i) => {
    const xs = new Set([L.x0, L.x1, (L.x0 + L.x1) / 2]);
    for (let x = L.x0; x < L.x1; x += 2.2) xs.add(+x.toFixed(2));
    for (const lx of SCAF.tallLadders) if (lx >= L.x0 - 0.3 && lx <= L.x1 + 0.3) xs.add(lx);
    if (i === SCAF.tall.length - 1) xs.add(SCAF.roofLadder);
    return chain('t' + i + '_', [...xs].sort((a, b) => a - b).map((x) => [x, L.y, tz]));
  });
  const tg = N('tg', SCAF.tallLadders[0], 0, 3.0);
  link(tg, near(SCAF.tallLadders[0], 0, 2.1, (n) => n.id.startsWith('n')));
  link(tg, near(SCAF.tallLadders[0], SCAF.tall[0].y, tz, (n) => n.id.startsWith('t0_')), 'ladder');
  for (let i = 0; i < SCAF.tall.length - 1; i++) {
    const lx = SCAF.tallLadders[i + 1];
    link(near(lx, SCAF.tall[i].y, tz, (n) => n.id.startsWith('t' + i + '_')), near(lx, SCAF.tall[i + 1].y, tz, (n) => n.id.startsWith('t' + (i + 1) + '_')), 'ladder');
  }
  // Roof: boards on the tie beams, the wheel, the ridge.
  const rp = chain('rp', [[50.9, PLATE + 0.38, 3.0], [52.4, PLATE + 0.38, 2.6], [54.0, PLATE + 0.38, 3.2], [55.6, PLATE + 0.38, 3.2], [57.0, PLATE + 0.38, 3.4], [58.4, PLATE + 0.38, 3.4], [59.3, PLATE + 0.38, 3.4]]);
  link(near(SCAF.roofLadder, 22.9, tz, (n) => n.id.startsWith('t5_')), rp[0], 'ladder');
  W.data.wheelIn = [N('wh0', 57.0, 28.32, 1.78), N('wh1', 57.0, 28.32, 2.42)];
  link(rp[4], W.data.wheelIn[0], 'ladder'); link(rp[4], W.data.wheelIn[1], 'ladder');
  const ridge = chain('rg', [[52.6, 36.2, 0.35], [55.0, 36.25, 0.35], [57.5, 36.3, 0.35], [60.2, 36.3, 0.35]]);
  link(rp[1], ridge[0], 'ladder');
  // Putlog scaffold on the aisle wall (bays 4 to 6).
  const pz = SCAF.putZ;
  const putNodes = SCAF.put.map((L, i) => {
    const xs = new Set([L.x0, L.x1]);
    for (let x = L.x0; x < L.x1; x += 2.2) xs.add(+x.toFixed(2));
    for (const lx of SCAF.putLadders) if (lx >= L.x0 - 0.3 && lx <= L.x1 + 0.3) xs.add(lx);
    return chain('p' + i + '_', [...xs].sort((a, b) => a - b).map((x) => [x, L.y, pz]));
  });
  SCAF.put.forEach((L, i) => {
    const lx = SCAF.putLadders[i];
    const lower = i === 0 ? N('pg', lx, 0, 9.4) : near(lx, SCAF.put[i - 1].y, pz, (n) => n.id.startsWith('p' + (i - 1) + '_'));
    if (i === 0) link(lower, near(lx, 0, 9.4, (n) => n.id.startsWith('na')));
    link(lower, near(lx, L.y, pz, (n) => n.id.startsWith('p' + i + '_')), 'ladder');
  });
  // Stage under the aisle vault of bay 7, by a ladder from the aisle floor.
  const sv = chain('sv', [[bayX(7) + 0.7, 7.9, 9.4], [bayX(7) + 2.4, 7.9, 9.4], [bayX(7) + 4.2, 7.9, 9.4]]);
  link(near(bayX(7) + 0.3, 0, 9.4, (n) => n.id.startsWith('na')), sv[0], 'ladder');
  // Pits and trenches.
  const wt = N('wt', 0.9, -1.2, 3.4), wr = N('wr', 0.9, -0.75, 7.2), wr2 = N('wr2', 0.9, -0.45, 11.0);
  link(near(0.9, 0.06, 1.9), wt, 'ladder'); link(wt, wr, 'stairs'); link(wr, wr2, 'stairs');
  const bt = N('bt', 8.3, -0.55, 12.6); link(near(8.3, 0, 9.4, (n) => n.id.startsWith('na')), bt, 'stairs');
  const bp0 = N('bp0', -31.8, 0, 3.95), bp1 = N('bp1', -31.8, -2.5, 2.7), bp2 = N('bp2', -29.0, -2.5, 3.0);
  link(bp0, near(-31.8, 0, 4.3), 'walk'); link(bp0, bp1, 'ladder'); link(bp1, bp2);
  const sp = N('sp', 26.0, -1.75, 1.0); link(sp, near(26.0, 0, 2.1, (n) => n.id.startsWith('n')), 'ladder');
  // Lodge loft by its ladder.
  const lf0 = N('lf0', -11.5, 0, 5.9), lf1 = N('lf1', -12.6, LODGE.loft + 0.05, 5.6), lf2 = N('lf2', -15.5, LODGE.loft + 0.05, 3.2), lf3 = N('lf3', -19.0, LODGE.loft + 0.05, 3.2);
  link(lf0, near(-11.0, 0, 1.95)); link(lf0, lf1, 'ladder'); nav.chain([lf1, lf2, lf3]);

  // Cottages: a separate little graph along the back lane (people reach it from the road
  // in one jump: the walk from the site to the east end is longer than the clock allows).
  const lane = [[168, 0, 7.0], [161, 0, 7.0]];
  for (const c of COTTAGES) lane.push([c.x1 - 0.6, 0, 7.0]);
  lane.sort((a, b) => b[0] - a[0]);
  const lids = chain('lane', lane);
  W.data.exitE = lids[0];
  COTTAGES.forEach((c, i) => {
    const out = near(c.x1 - 0.6, 0, 7.0, (n) => n.id.startsWith('lane'));
    const din = N('cd' + i, c.x1 - 0.6, 0, 4.4), mid = N('cm' + i, (c.x0 + c.x1) / 2 - 0.4, 0, 2.9);
    link(out, din, 'door'); link(din, mid);
    c.mid = mid;
  });
  // Homes in town and in the Close: separate, unreachable spots (people jump to them).
  W.data.homes = HOMES.map((h, i) => N('home' + i, h[0], h[1], h[2]));
  void tr; void eids; void putNodes; void liftNodes; void qbi; void et;
}

// ------------------------------------------------------------------ machines
function rot(o, ax, a) { o.rotation[ax] = a; }

export function buildMachines(W, k) {
  const D = W.data;
  // --- The great wheel on the tie beams of bays 9 and 10 (zone 18).
  const WX = 57.0, WY = 30.35, WZc = 2.1, R = 2.25;
  D.wheelY = WY;
  const wheel = k.part(WX, WY, WZc, (q) => {
    const O = M.oak;
    for (const z of [-0.7, 0.7]) {
      const ring = [];
      for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI * 2; ring.push([Math.cos(a) * R, Math.sin(a) * R, z]); }
      q.tube(ring, 0.1, O, { seg: 5 });
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2; q.beam([0, 0, z], [Math.cos(a) * R, Math.sin(a) * R, z], 0.11, O); }
    }
    for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; q.boxR(Math.cos(a) * (R - 0.12), Math.sin(a) * (R - 0.12), 0, 0.3, 0.05, 1.42, M.boards, { z: a + Math.PI / 2 }); }
    q.cyl(0, 0, -1.6, 0.16, 3.2, M.oakOld, { axis: 'z', seg: 10 });
    q.cyl(0, 0, -1.3, 0.3, 0.55, M.oakOld, { axis: 'z', seg: 12 }); // rope drum
  });
  // Its frame on the sill beams.
  const frame = k.part(WX, PLATE + 0.6, 0, (q) => {
    for (const z of [0.55, 3.75]) { q.beam([-1.6, 0, z], [0, WY - PLATE - 0.6, z], 0.16, M.oak); q.beam([1.6, 0, z], [0, WY - PLATE - 0.6, z], 0.16, M.oak); }
    // A jib carrying the pulley out over the hatch.
    q.beam([1.6, 0, 0.55], [3.25, WY - PLATE - 0.3, 0.55], 0.14, M.oak);
    q.beam([3.25, WY - PLATE - 0.3, 0.55], [3.25, WY - PLATE - 0.3, 1.5], 0.12, M.oak);
    q.cyl(3.0, WY - PLATE - 0.6, 0.95, 0.2, 0.2, M.oak, { axis: 'z', seg: 10 }); // pulley
  });
  void frame;
  // Rope from the drum over the pulley and down to the load; the load on scissor tongs.
  const ROPE = mat({ c: '#b8955a', whole: false });
  const ropeH = k.part(0, 0, 0, (q) => { q.cyl(0, 0, 0, 0.045, 1, ROPE, { seg: 5 }); });
  const ropeV = k.part(0, 0, 0, (q) => { q.cyl(0, 0, 0, 0.045, 1, ROPE, { seg: 5 }); });
  const load = k.part(0, 0, 0, (q) => {
    q.box(-0.55, 0, -0.35, 0.55, 0.62, 0.35, M.stoneNew);
    q.beam([-0.4, 0.5, 0], [0.12, 1.1, 0], 0.06, M.iron); q.beam([0.4, 0.5, 0], [-0.12, 1.1, 0], 0.06, M.iron);
    q.cyl(0, 1.1, 0, 0.06, 0.12, M.iron, { seg: 6 });
  });
  const PX = WX + 3.0, PZr = 1.05;
  D.hoist = { y: 0.3, phase: 0, t: 0, ang: 0, walking: false };
  W.addMachine((dt) => {
    const H = D.hoist;
    // A slow cycle: hook on at the floor, a long steady lift, unhook on the beams, lower the empty tongs.
    const day = W.hour > 4.6 && W.hour < 19;
    H.t += dt;
    const lift = 0.12, lower = 0.3, top = PLATE - 0.9, bot = 0.3;
    let v = 0;
    if (!day) { H.phase = 0; H.t = 0; }
    else if (H.phase === 0) { if (H.t > 25) { H.phase = 1; H.t = 0; } }
    else if (H.phase === 1) { v = lift; H.y += v * dt; if (H.y >= top) { H.y = top; H.phase = 2; H.t = 0; } }
    else if (H.phase === 2) { if (H.t > 20) { H.phase = 3; H.t = 0; } }
    else if (H.phase === 3) { v = -lower; H.y += v * dt; if (H.y <= bot) { H.y = bot; H.phase = 0; H.t = 0; } }
    H.walking = v !== 0;
    H.ang += (v / 0.3) * dt;
    rot(wheel, 'z', H.ang);
    load.visible = H.phase !== 3;
    load.position.set(PX + 0.2, H.y, PZr);
    const yTop = WY - 0.2;
    ropeV.position.set(PX + 0.2, H.y + 1.15, PZr);
    ropeV.scale.set(1, Math.max(0.05, yTop - H.y - 1.15), 1);
    ropeH.position.set(WX, WY + 0.0, PZr);
    ropeH.rotation.z = -Math.PI / 2; ropeH.scale.set(1, PX - WX + 0.2, 1);
  });

  // --- Ground windlass in bay 5 hoisting stone to the aisle wall (zone 12).
  const GX = bayX(5) + 2.4, GZ = 8.3, PY = 10.0, PZp = AZ0 - 1.95;
  const drum = k.part(GX, 0.8, GZ, (q) => {
    q.cyl(-0.7, 0, 0, 0.17, 1.4, M.oakOld, { axis: 'x', seg: 10 });
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; q.beam([0.75, 0, 0], [0.75, Math.cos(a) * 0.75, Math.sin(a) * 0.75], 0.06, M.oak); q.beam([-0.75, 0, 0], [-0.75, Math.cos(a + 0.785) * 0.75, Math.sin(a + 0.785) * 0.75], 0.06, M.oak); }
  });
  k.part(GX, 0, GZ, (q) => { for (const x of [-0.85, 0.85]) { q.beam([x, 0, -0.5], [x, 0.85, 0], 0.08, M.oakOld); q.beam([x, 0, 0.5], [x, 0.85, 0], 0.08, M.oakOld); } });
  const basket = k.part(0, 0, 0, (q) => {
    q.lathe([[0.25, 0], [0.32, 0.35], [0.3, 0.38]], 0, 0, mat({ c: '#a08048', c2: '#7a6038', pat: 'thatch', s: 0.06 }), { seg: 10, capTop: false });
    for (let i = 0; i < 3; i++) q.box(-0.15 + i * 0.1, 0.2, -0.1, -0.07 + i * 0.1, 0.36, 0.08, M.stoneNew);
    q.beam([-0.3, 0.38, 0], [0, 0.9, 0], 0.02, M.rope); q.beam([0.3, 0.38, 0], [0, 0.9, 0], 0.02, M.rope);
  });
  const gRope = k.part(0, 0, 0, (q) => { q.cyl(0, 0, 0, 0.04, 1, ROPE, { seg: 5 }); });
  k.part(0, 0, 0, (q) => q.rope([GX, 0.8, GZ + 0.15], [GX + 1.2, PY, PZp], 0.022, M.rope, 0.0, 2));
  D.wind = { y: 0.2, dir: 1, wait: 0, ang: 0 };
  W.addMachine((dt) => {
    const G = D.wind;
    const on = W.hour > 12.5 && W.hour < 18.5;
    let v = 0;
    if (on) {
      if (G.wait > 0) G.wait -= dt;
      else { v = G.dir > 0 ? 0.15 : -0.3; G.y += v * dt; if (G.y > 8.3) { G.y = 8.3; G.dir = -1; G.wait = 14; } if (G.y < 0.2) { G.y = 0.2; G.dir = 1; G.wait = 18; } }
    }
    G.ang += (v / 0.17) * dt;
    drum.rotation.x = G.ang;
    basket.position.set(GX + 1.2, G.y, PZp);
    basket.visible = G.dir > 0 || G.wait <= 0 || G.y > 0.3;
    gRope.position.set(GX + 1.2, G.y + 0.9, PZp);
    gRope.scale.set(1, Math.max(0.05, PY - G.y - 1.0), 1);
  });

  // --- Smith's bellows (about 20 strokes a minute), pulsing with the hearth.
  const [hx, , hz] = SMITHY.hearth;
  const bel = k.part(hx - 1.55, 0.75, hz, (q) => {
    q.box(-0.45, 0, -0.35, 0.45, 0.04, 0.35, M.oakOld);
    q.lathe([[0.32, 0.04], [0.36, 0.14], [0.32, 0.24]], 0, 0, mat('#6a4a30'), { seg: 10, capTop: false, capBot: false });
    q.box(-0.45, 0.24, -0.35, 0.45, 0.28, 0.35, M.oakOld);
    q.beam([0.45, 0.14, 0], [0.75, 0.15, 0], 0.06, M.iron);
    q.beam([-0.45, 0.28, 0], [-0.8, 0.5, 0], 0.04, M.oakOld);
  });
  k.part(hx - 1.55, 0, hz, (q) => { q.box(-0.4, 0, -0.3, 0.4, 0.75, 0.3, M.oakOld); });
  W.addMachine((dt, t) => { const s = 0.75 + 0.25 * Math.sin(t * 2.1); bel.scale.set(1, W.hour > 4 && W.hour < 19.5 ? s : 0.8, 1); });

  // --- Pit saw: the blade rises and falls about once a second.
  const saw = k.part(28.1, 0, 1.0, (q) => {
    q.box(-0.03, -1.6, -0.01, 0.03, 1.5, 0.01, mat('#b8bec4'));
    q.box(-0.25, 1.45, -0.03, 0.25, 1.55, 0.03, M.oak); q.box(-0.25, -1.55, -0.03, 0.25, -1.45, 0.03, M.oak);
  });
  W.addMachine((dt, t) => { const on = W.hour > 5 && W.hour < 18.8 && !(W.hour > 11 && W.hour < 12.5); saw.position.y = on ? 0.15 + Math.sin(t * 6.2) * 0.32 : 0.0; });

  // --- Bell-founder's strickle board, swept round the loam core.
  const [cx, cz] = BELL.core2;
  const strk = k.part(cx, BELL.floor, cz, (q) => { q.box(0, 0, -0.02, 0.62, 1.05, 0.02, M.boards); q.box(0.55, 0.9, -0.03, 0.66, 1.4, 0.03, M.oakOld); });
  W.addMachine((dt) => { if (W.hour > 5 && W.hour < 18) strk.rotation.y += dt * 0.35; });

  // --- Plumbers' strickle drawn along the sand bed.
  const [b0, b1, z0, z1] = CAST.bed;
  const pst = k.part(b0, 0.13, (z0 + z1) / 2, (q) => { q.box(-0.06, 0, -(z1 - z0) / 2 - 0.12, 0.06, 0.18, (z1 - z0) / 2 + 0.12, M.oak); });
  W.addMachine((dt, t) => { const c = (t / 40) % 1; pst.position.x = b0 + 3.6 + (b1 - b0 - 4) * (c < 0.7 ? c / 0.7 : 1 - (c - 0.7) / 0.3); });

  // --- The thurible, swung at High Mass (period about 1.5 s).
  const thur = k.part(ALTAR.x - 3.2, 1.75, 3.2, (q) => {
    q.cyl(0, -0.9, 0, 0.004, 0.9, M.gold, { seg: 3 });
    q.sphere(0, -1.0, 0, 0.09, M.gold, { seg: 8, rings: 5 });
  });
  W.addMachine((dt, t) => { const on = W.hour > 9.2 && W.hour < 11; thur.visible = on; thur.rotation.x = Math.sin(t * 4.2) * 0.6; });
  D.thurible = thur;

  // --- A bell swinging in the belfry's top stage for the services (bells illustrative).
  const bell = k.part(25, 31.0, 68.9, (q) => {
    q.lathe([[0.62, -1.1], [0.55, -0.95], [0.4, -0.5], [0.36, -0.2], [0.2, -0.05], [0.0, 0.0]], 0, 0, M.bronze, { seg: 12, capBot: false });
    q.box(-0.1, 0, -0.1, 0.1, 0.25, 0.1, M.oakOld);
  });
  W.addMachine((dt, t) => {
    const h = W.hour;
    const ring = [2.0, 5.9, 9.0, 15.0, 17.8].some((a) => h > a - 0.25 && h < a);
    bell.rotation.x = ring ? Math.sin(t * 2.4) * 0.7 : bell.rotation.x * 0.95;
  });
  // --- Ox carts on the Chilmark road: about 3 km/h, unloading at the stone stack.
  for (let c = 0; c < 2; c++) cart(W, k, c);
}

// A static straight rope as an object (for the windlass run).
function ropeLine(a, b) {
  const g = new THREE.CylinderGeometry(0.022, 0.022, 1, 4);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x8a6a3a }));
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.scale.set(1, A.distanceTo(B), 1);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
}

const OX = [mat({ c: '#8a4a2a', cut: '#6a3a22' }), mat({ c: '#e8e0d0', cut: '#c8c0b0' }), mat({ c: '#7a3a24', cut: '#5a2a1a' })];
function ox(q, x, z, m, headRef) {
  q.box(x - 0.95, 0.75, z - 0.35, x + 0.85, 1.45, z + 0.35, m);
  for (const [dx, dz] of [[-0.75, -0.22], [-0.75, 0.22], [0.65, -0.22], [0.65, 0.22]]) q.cyl(x + dx, 0, z + dz, 0.08, 0.8, m, { seg: 5 });
  q.box(x + 0.75, 1.2, z - 0.22, x + 1.05, 1.5, z + 0.22, m);
  void headRef;
}
function cart(W, k, idx) {
  const body = k.part(0, 0, 0, (q) => {
    q.box(-1.3, 0.75, -0.85, 1.3, 0.9, 0.85, M.boards);
    for (const z of [-0.85, 0.8]) q.box(-1.3, 0.9, z, 1.3, 1.25, z + 0.05, M.boards);
    for (let i = 0; i < 3; i++) q.box(-1.1 + i * 0.8, 0.9, -0.6, -0.45 + i * 0.8, 1.45 - (i % 2) * 0.1, 0.55, M.stoneOut);
    q.beam([1.3, 0.82, -0.3], [4.6, 1.2, -0.3], 0.08, M.oakOld); q.beam([1.3, 0.82, 0.3], [4.6, 1.2, 0.3], 0.08, M.oakOld);
    q.box(4.4, 1.45, -0.9, 4.55, 1.55, 0.9, M.oakOld); // yoke
    ox(q, 3.6, -0.5, OX[idx % 3]); ox(q, 3.6, 0.5, OX[(idx + 1) % 3]);
  });
  const wheels = [-0.95, 0.95].map((z) => k.part(0, 0, 0, (q) => {
    const ring = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2; ring.push([Math.cos(a) * 0.68, Math.sin(a) * 0.68, 0]); }
    q.tube(ring, 0.06, M.oakOld, { seg: 4 });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; q.beam([0, 0, 0], [Math.cos(a) * 0.66, Math.sin(a) * 0.66, 0], 0.05, M.oakOld); }
    q.cyl(0, 0, -0.08, 0.1, 0.16, M.oakOld, { axis: 'z', seg: 8 });
    void z;
  }));
  const X0 = -300, X1 = -40.5, Z = 8.0, V = 0.85;
  const L = X1 - X0, T = L / V;
  const cycle = 2 * T + 150;
  const off = idx * cycle * 0.5;
  let dist = 0;
  W.addActor({ object: new THREE.Group(), update(dt, t) {
    const u = (t + off) % cycle;
    let x, dir, moving = true;
    if (u < T) { x = X0 + V * u; dir = 1; }
    else if (u < T + 90) { x = X1; dir = 1; moving = false; }
    else if (u < T + 96) { x = X1; dir = (u - T - 90) / 6 < 0.5 ? 1 : -1; moving = false; }
    else if (u < 2 * T + 96) { x = X1 - V * (u - T - 96); dir = -1; }
    else { x = X0; dir = -1; moving = false; }
    if (moving) dist += V * dt;
    const yaw = dir > 0 ? 0 : Math.PI;
    body.position.set(x, 0, Z); body.rotation.y = yaw;
    const off2 = dir > 0 ? 0 : 0;
    wheels.forEach((w, i) => {
      const zz = i ? 0.95 : -0.95;
      w.position.set(x + off2, 0.68, Z + (dir > 0 ? zz : -zz));
      w.rotation.z = -dist / 0.68 * dir;
    });
  } });
}

// ------------------------------------------------------------------ animals and birds
export function buildAnimals(W, k) {
  const small = (c) => mat({ c, cut: c });
  // The lodge cat stalking a rat among the timber stacks (vignette 10).
  const cat = k.part(0, 0, 0, (q) => {
    const c = small('#5a4a3a');
    q.sphere(0, 0.13, 0, 0.13, c, { seg: 8, rings: 5 }); q.sphere(0.17, 0.2, 0, 0.075, c, { seg: 8, rings: 5 });
    q.cyl(-0.12, 0.15, 0, 0.018, 0.25, c, { axis: 'x', seg: 4 });
    for (const [x, z] of [[-0.08, -0.06], [-0.08, 0.06], [0.1, -0.06], [0.1, 0.06]]) q.cyl(x, 0, z, 0.02, 0.1, c, { seg: 4 });
  });
  const rat = k.part(0, 0, 0, (q) => { const c = small('#6a5e54'); q.sphere(0, 0.05, 0, 0.05, c, { seg: 6, rings: 4 }); q.cyl(-0.05, 0.03, 0, 0.008, 0.12, c, { axis: 'x', seg: 3 }); });
  W.addActor({ object: new THREE.Group(), update(dt, t) {
    const u = (t * 0.05) % 1, s = Math.sin(u * Math.PI * 2);
    const rx = -44 + s * 2.2, rz = 11.0 + Math.cos(u * Math.PI * 4) * 0.4;
    rat.position.set(rx, 0, rz); rat.rotation.y = Math.cos(u * Math.PI * 2) > 0 ? 0 : Math.PI;
    const lag = Math.sin((u - 0.04) * Math.PI * 2);
    cat.position.set(-44 + lag * 2.2 - 1.0, 0, 10.4); cat.rotation.y = Math.cos((u - 0.04) * Math.PI * 2) > 0 ? 0 : Math.PI;
  } });
  // A carter's dog trotting about the yard.
  const dog = k.part(0, 0, 0, (q) => {
    const c = small('#8a6a44');
    q.box(-0.3, 0.3, -0.1, 0.3, 0.52, 0.1, c); q.box(0.28, 0.45, -0.08, 0.48, 0.62, 0.08, c);
    for (const [x, z] of [[-0.25, -0.07], [-0.25, 0.07], [0.22, -0.07], [0.22, 0.07]]) q.cyl(x, 0, z, 0.03, 0.32, c, { seg: 4 });
    q.beam([-0.3, 0.48, 0], [-0.5, 0.65, 0], 0.03, c);
  });
  W.addActor({ object: new THREE.Group(), update(dt, t) {
    const a = t * 0.12;
    dog.position.set(-38 + Math.sin(a) * 6, 0, 7.6 + Math.sin(a * 2.3) * 0.8);
    dog.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI;
  } });
  // A pig in its sty and hens by the cottages.
  const pig = k.part(0, 0, 0, (q) => { const c = small('#d8a090'); q.sphere(0, 0.35, 0, 0.35, c, { seg: 10, rings: 6 }); q.sphere(0.38, 0.33, 0, 0.16, c, { seg: 8, rings: 5 }); });
  pig.scale.set(1.4, 0.9, 0.9);
  W.addActor({ object: new THREE.Group(), update(dt, t) { pig.position.set(146.2 + Math.sin(t * 0.08) * 0.7, 0, 7.2 + Math.cos(t * 0.05) * 0.25); pig.rotation.y = Math.cos(t * 0.08) > 0 ? 0 : Math.PI; } });
  for (let h = 0; h < 4; h++) {
    const hen = k.part(0, 0, 0, (q) => { const c = small(h % 2 ? '#a0603a' : '#e8e0d0'); q.sphere(0, 0.18, 0, 0.13, c, { seg: 7, rings: 5 }); q.sphere(0.12, 0.3, 0, 0.06, c, { seg: 6, rings: 4 }); q.box(0.16, 0.34, -0.01, 0.2, 0.38, 0.01, small('#c03020')); });
    W.addActor({ object: new THREE.Group(), update(dt, t) {
      const a = t * (0.07 + h * 0.01) + h * 1.7;
      hen.position.set(152 + h * 1.4 + Math.sin(a) * 1.2, 0, 7.6 + Math.cos(a * 1.3) * 0.6);
      hen.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI;
      hen.rotation.z = Math.max(0, Math.sin(t * 3 + h)) * 0.6;
      hen.visible = W.sun().day > 0.3;
    } });
  }
  // Swifts screaming round the scaffolds by day; jackdaws round the belfry.
  const swift = mat({ c: '#2a2624', whole: true, noEdge: true });
  for (let i = 0; i < 9; i++) {
    const b = k.part(0, 0, 0, (q) => { q.boxR(0, 0, 0, 0.25, 0.03, 0.06, swift); q.boxR(0.02, 0, 0.16, 0.12, 0.02, 0.3, swift, { y: 0.5 }); q.boxR(0.02, 0, -0.16, 0.12, 0.02, 0.3, swift, { y: -0.5 }); });
    b.scale.setScalar(1.6);
    W.addActor({ object: new THREE.Group(), update(dt, t) {
      b.visible = W.sun().day > 0.25;
      const ph = t * (0.32 + i * 0.03) + i * 0.7;
      b.position.set(44 + Math.cos(ph) * (16 + i * 2.5), 30 + i * 1.6 + Math.sin(ph * 2.3) * 4, 4 + Math.sin(ph) * (6 + i));
      b.rotation.y = -ph - Math.PI / 2;
    } });
  }
  const daw = mat({ c: '#1e1c1e', whole: true, noEdge: true });
  for (let i = 0; i < 6; i++) {
    const b = k.part(0, 0, 0, (q) => { q.sphere(0, 0, 0, 0.16, daw, { seg: 6, rings: 4 }); q.boxR(0, 0.02, 0, 0.22, 0.02, 0.9, daw, { x: 0.1 }); });
    W.addActor({ object: new THREE.Group(), update(dt, t) {
      b.visible = W.sun().day > 0.25;
      const ph = t * (0.18 + i * 0.02) + i;
      b.position.set(25 + Math.cos(ph) * (11 + i), 50 + Math.sin(ph * 1.7) * 6 + i, 74 + Math.sin(ph) * (10 + i));
      b.rotation.y = -ph;
      b.rotation.z = Math.sin(t * 7 + i) * 0.3;
    } });
  }
  // A heron fishing at the river's edge, and a cart horse tethered by the trough.
  const her = k.part(riverX(6) - 6.2, -0.75, 6, (q) => {
    const g = small('#8a9098');
    q.sphere(0, 0.75, 0, 0.18, g, { seg: 8, rings: 5 }); q.box(-0.05, 0, -0.02, -0.02, 0.6, 0.02, small('#c8a050')); q.box(0.05, 0, -0.02, 0.08, 0.6, 0.02, small('#c8a050'));
    q.beam([0.12, 0.82, 0], [0.22, 1.2, 0], 0.05, g); q.beam([0.22, 1.2, 0], [0.45, 1.18, 0], 0.025, small('#c8a050'));
  });
  W.addActor({ object: new THREE.Group(), update(dt, t) { her.rotation.z = Math.max(0, Math.sin(t * 0.3)) > 0.97 ? -0.5 : 0; } });
  const horse = k.part(-46.6, 0, 5.4, (q) => {
    const c = small('#6a4a32');
    q.box(-0.8, 0.85, -0.25, 0.8, 1.45, 0.25, c);
    for (const [x, z] of [[-0.65, -0.15], [-0.65, 0.15], [0.6, -0.15], [0.6, 0.15]]) q.cyl(x, 0, z, 0.07, 0.9, c, { seg: 5 });
    q.beam([0.75, 1.35, 0], [1.1, 1.75, 0], 0.22, c); q.box(1.0, 1.55, -0.1, 1.35, 1.75, 0.1, c);
    q.beam([-0.8, 1.35, 0], [-1.05, 0.8, 0], 0.06, small('#3a2a1e'));
  });
  W.addActor({ object: new THREE.Group(), update(dt, t) { horse.rotation.y = Math.PI / 2 + Math.sin(t * 0.05) * 0.1; } });
  // Sheep grazing on the downs near Old Sarum (distant flecks).
  const wool = mat({ c: '#ece6d8', noEdge: true });
  const r = k.rng('sheep');
  for (let i = 0; i < 14; i++) {
    const x = -120 + r() * 260, z = 330 + r() * 220;
    const s = k.part(x, 0, z, (q) => { q.sphere(0, 0.9, 0, 0.9, wool, { seg: 6, rings: 4 }); });
    s.scale.set(1.8, 1, 1);
    W.addActor({ object: new THREE.Group(), update(dt, t) { s.position.x = x + Math.sin(t * 0.01 + i) * 2; } });
  }
}

// ------------------------------------------------------------------ smoke, dust, sparks, sound
export function buildEffects(W) {
  const day = (w) => w.hour > 4.6 && w.hour < 19;
  W.emitter({ kind: 'smoke', x: SMITHY.hearth[0], y: 6.1, z: 4.45, rate: 2.5, w: 0.5, d: 0.5, size: [0.6, 4], color: '#5e5854' });
  W.emitter({ kind: 'spark', x: SMITHY.anvil[0], y: 0.95, z: 2.25, rate: (w) => (day(w) ? 4 : 0), w: 0.2, d: 0.2 });
  W.emitter({ kind: 'ember', x: SMITHY.hearth[0], y: 1.0, z: SMITHY.hearth[2], rate: 1.5, w: 0.5, d: 0.5 });
  W.emitter({ kind: 'smoke', x: -31.0, y: 2.3, z: 6.0, rate: 2.0, w: 0.4, d: 0.4, size: [0.5, 3.5], color: '#6a625c' });
  W.emitter({ kind: 'steam', x: -2.8, y: -0.3, z: 1.2, rate: 3, w: 3.2, d: 2.0, size: [0.3, 1.8] });
  W.emitter({ kind: 'smoke', x: CAST.pot[0], y: 0.9, z: CAST.pot[2] + 0.45, rate: (w) => (day(w) ? 2 : 0.5), w: 0.4, d: 0.4, size: [0.4, 3], color: '#7a746c' });
  W.emitter({ kind: 'dust', x: -17.0, y: 0.9, z: 3.0, rate: (w) => (day(w) ? 6 : 0), w: 8, d: 2.8, color: '#e8e2d4', size: [0.1, 0.8] });
  W.emitter({ kind: 'dust', x: 28.1, y: -1.2, z: 1.0, rate: (w) => (day(w) ? 4 : 0), w: 0.3, d: 0.3, color: '#d8b880', size: [0.05, 0.3] });
  W.emitter({ kind: 'dust', x: 0.9, y: -0.5, z: 7.5, rate: (w) => (day(w) ? 2 : 0), w: 1.5, d: 4, color: '#c8b896', size: [0.1, 0.7] });
  for (const c of COTTAGES) W.emitter({ kind: 'smoke', x: (c.x0 + c.x1) / 2 + 0.3, y: 5.8, z: 1.6, rate: 1.2, w: 0.6, d: 0.6, size: [0.5, 3.2], color: '#8a847c' });
  W.emitter({ kind: 'smoke', x: 166, y: 8.5, z: 12, rate: 0.8, w: 1, d: 1, size: [0.8, 4], color: '#8a847c' });
  W.emitter({ kind: 'smoke', x: 175, y: 9, z: 30, rate: 0.8, w: 1, d: 1, size: [0.8, 4], color: '#8a847c' });
  W.emitter({ kind: 'smoke', x: ALTAR.x - 3.2, y: 1.0, z: 3.2, rate: (w) => (w.hour > 9.2 && w.hour < 11 ? 3 : 0), w: 0.2, d: 0.2, size: [0.2, 1.4], color: '#d8d4cc', vy: 0.4 });
  W.emitter({ kind: 'mote', x: 84, y: 8, z: 3, rate: (w) => (w.sun().day > 0.5 ? 3 : 0), w: 14, d: 3, });

  // Sound: chisels in the lodge, the anvil, the hearth, the creak of the wheel, chant in the quire.
  W.sound({ kind: 'machine', x: -16, y: 1, z: 3, r: 14, gain: 0.35, rate: (w) => (day(w) ? 3.2 : 0), pitch: 2600 });
  W.sound({ kind: 'machine', x: SMITHY.anvil[0], y: 1, z: 2.2, r: 10, gain: 0.3, rate: (w) => (day(w) ? 1.1 : 0), pitch: 1800 });
  W.sound({ kind: 'fire', x: SMITHY.hearth[0], y: 1, z: SMITHY.hearth[2], r: 6, gain: 0.25 });
  W.sound({ kind: 'creak', x: 57, y: 30, z: 2, r: 16, gain: 0.3, rate: (w) => (w.data.hoist && w.data.hoist.walking ? 0.8 : 0) });
  W.sound({ kind: 'voice', x: 84, y: 3, z: 3, r: 26, gain: 0.35, hz: 196, notes: [0, 2, 3, 5, 3, 2, 0, -2, 0], when: (w) => { const h = w.hour; return (h > 2 && h < 4.5) || (h > 5.9 && h < 6.6) || (h > 9 && h < 11.2) || (h > 15 && h < 15.6) || (h > 17.8 && h < 19.6); } });
  W.sound({ kind: 'bell', x: 25, y: 40, z: 74, r: 120, gain: 0.3, hz: 330 });
  W.sound({ kind: 'drip', x: 178, y: -1, z: 6, r: 20, gain: 0.15, rate: 0.6 });
  void CROSS; void QUIRE; void PRES; void RETRO; void TRIN; void ECROSS; void PZ; void WZ1; void RIDGE; void ZMIN; void archY; void PIERX; void STALLS;
}
