/* Conwy Castle: the navigation graph and the household.
 *
 * The cast follows docs/research/castle.md section 4.4 (48 fictional people); routines
 * are the dossier's, fitted to the rooms as drawn. Hours are local sun time in mid May.
 * Two meals a day (dinner about 10 to 11.30, supper about 17.30); servants work from
 * about 5.30 to 19.00; the gate shuts at sunset. Extras: the five crossbowmen the cast
 * does not name (the 1283-84 establishment had fifteen), townsfolk and boat crews. */
import { XS } from '../../engine/index.js';
import { TOWERS, FL, TOWN_Y, GATE_Z, WALK, DOCK, GARDEN } from './common.js';
import { STAIR } from './shell.js';
import { A } from './rooms.js';
import { groundH } from './terrain.js';

const T = TOWN_Y;
const g = (GATE_Z[0] + GATE_Z[1]) / 2;

// ------------------------------------------------------------------ navigation
export function buildNav(W) {
  const N = W.nav;
  const n = (id, x, y, z) => N.node(id, x, y, z);
  const L = (a, b, kind = 'walk') => N.link(a, b, kind);
  const run = (prefix, pts, kind = 'walk') => { const ids = pts.map((p, i) => n(prefix + i, p[0], p[1], p[2])); N.chain(ids, kind); return ids; };

  // Town, square, ramp, drawbridge, west barbican, gate passage.
  n('t.sq', -16, T, 11); n('t.sq2', -18, T, 21); n('t.w', -34, T, 8.6); n('t.w2', -52, T, 8.6); n('t.far', -78, T, 9.5); n('t.n', -12, T, 30);
  L('t.sq', 't.sq2'); L('t.sq', 't.w'); L('t.w', 't.w2'); L('t.w2', 't.far'); L('t.sq2', 't.n');
  n('h42', -41.0, T, 4.6); L('h42', 't.w', 'door'); n('h42u', -42.5, T + 2.6, 4.0); L('h42', 'h42u', 'ladder');
  n('h34', -32.8, T, 4.6); L('h34', 't.w', 'door'); n('h34u', -34.3, T + 2.6, 4.0); L('h34', 'h34u', 'ladder');
  n('ale', -27.4, T, 2.4); L('ale', 't.sq', 'door');
  n('stalls', -18, T, 5.4); L('stalls', 't.sq'); n('stalls2', -18, T, 19.5); L('stalls2', 't.sq2');
  n('ramp0', -23.4, T + 0.15, g); L('t.sq', 'ramp0');
  n('ramp1', -6.7, -2.2, g); L('ramp0', 'ramp1');
  n('db', -3.4, -2.2, g); L('ramp1', 'db');
  n('bgate', 0.8, -2.0, g); L('db', 'bgate');
  n('by', 5.0, -2.0, g); L('bgate', 'by'); n('by.n', 6.5, -2.0, 20.5); n('by.s', 5.5, -2.0, 9.0); L('by', 'by.n'); L('by', 'by.s');
  n('bst', 9.2, -2.0, g); L('by', 'bst');
  n('gp0', 13.8, 0, g); L('bst', 'gp0', 'stairs');
  n('gp1', 18.4, 0, g); n('gp2', 22.8, 0, g); L('gp0', 'gp1'); L('gp1', 'gp2');
  n('lodge', 15.4, 0, 20.2); L('gp0', 'lodge', 'door');
  n('guard', 20.0, 0, 20.2); L('gp1', 'guard', 'door'); L('lodge', 'guard', 'door');
  n('winch', 16.4, 4.9, g); L('lodge', 'winch', 'stairs');

  // Outer ward courtyard: two runs along the ward, cross links.
  const oc = run('oc', [[23.6, 0, 15], [27, 0, 15.2], [31, 0, 15.6], [35, 0, 15.4], [39, 0, 15.2], [43, 0, 15.6], [47, 0, 15.4], [48.8, 0, 12.2], [51, 0, 15.2], [55, 0, 15.4], [58.6, 0, 15.2], [61.6, 0, g]]);
  const od = run('od', [[24.5, 0, 19.6], [28, 0, 19.6], [32, 0, 19.8], [36, 0, 19.6], [40, 0, 19.8], [44, 0, 19.6], [48, 0, 19.8], [52, 0, 19.6], [56, 0, 19.8], [59.0, 0, 19.0]]);
  L('gp2', oc[0]);
  for (const [a, b] of [[0, 0], [2, 2], [4, 4], [6, 6], [9, 8], [10, 9]]) L(oc[a], od[b]);
  L(oc[6], oc[8]); // past the porch
  // Lean-tos on the north wall.
  n('forge', 26.8, 0, 22.6); L('forge', od[1]);
  n('kc0', 43.8, 0, 21.4); L('kc0', od[5]); n('kc1', 40.5, 0, 23.0); n('kc2', 36.0, 0, 23.6); n('kc3', 32.4, 0, 23.0); N.chain(['kc0', 'kc1', 'kc2', 'kc3']);
  n('brew', 48.4, 0, 22.4); L('brew', od[6]); n('brew1', 47.0, 0, 24.2); L('brew', 'brew1');
  n('stab', 54.8, 0, 22.2); L('stab', od[7]); n('stab1', 57.6, 0, 23.0); L('stab', 'stab1'); n('stab2', 52.6, 0, 22.6); L('stab', 'stab2');
  n('loft', 57.6, 2.9, 25.6); L('stab1', 'loft', 'ladder'); n('loft1', 54.6, 2.9, 26.0); L('loft', 'loft1');
  n('well', 59.5, 0, 19.9); L('well', od[9]);
  // Hall range (floor 0.6): lesser hall, small chamber, great hall, passage, chapel. Porch to the courtyard.
  const hf = run('hf', [[24.8, 0.6, 4.3], [29.6, 0.6, 4.6], [31.0, 0.6, 5.2], [33.2, 0.6, 4.9], [35.4, 0.6, 5.8], [36.8, 0.9, 4.4], [38.9, 0.6, 4.3], [42.5, 0.6, 4.2], [46.2, 0.6, 3.9], [47.0, 0.6, 3.9], [48.8, 0.6, 4.4], [50.6, 0.6, 3.9], [53.0, 0.6, 4.0], [58.6, 0.6, 4.3]]);
  n('porch', 48.8, 0.6, 8.6); L(hf[10], 'porch'); L('porch', oc[7], 'door');
  // Cellars (y -3), from the stair at the west end of the lesser hall.
  n('cst0', 24.0, 0.6, 8.2); L(hf[0], 'cst0'); n('cst1', 27.9, -3.0, 8.2); L('cst0', 'cst1', 'stairs');
  const cl = run('cl', [[28.2, -3, 3.4], [33.0, -3, 3.4], [35.4, -3, 2.9], [37.4, -3, 3.6], [43.4, -3, 3.4], [49.4, -3, 3.0], [50.6, -3, 2.9], [53.4, -3, 3.4], [57.6, -3, 3.4]]);
  L('cst1', cl[0]);
  // Ladder from the great hall into the roof (the carpenter's).
  n('rl0', 44.6, 0.6, 7.4); L(hf[7], 'rl0'); n('rl1', 44.6, 5.6, 8.0); L('rl0', 'rl1', 'ladder');

  // Towers: floor nodes, stairs, roofs and turrets.
  const tnodes = {};
  for (const key of Object.keys(TOWERS)) {
    const t = TOWERS[key];
    const ids = [];
    if (t.front) {
      const sx = t.x + Math.cos(STAIR.a) * STAIR.r, sz = t.z + Math.sin(STAIR.a) * STAIR.r;
      const col = [];
      for (let f = 0; f < 4; f++) {
        const fid = n(key + f, t.x + (f === 3 ? -1.0 : 0.2), FL[f], f === 3 ? 2.8 : 1.15);
        const cid = n(key + 'c' + f, sx, FL[f], sz);
        if (f < 3) { const did = n(key + 'd' + f, t.x + 2.5, FL[f], 1.5); L(fid, did); L(did, cid, 'door'); }
        else L(fid, cid, 'door');
        col.push(cid); ids.push(fid);
      }
      N.chain(col, 'stairs');
    } else {
      const col = [];
      for (let f = 0; f < 4; f++) {
        const fid = n(key + f, t.x, FL[f], t.z + (f === 3 ? 2.4 : 0.9));
        const cid = n(key + 'c' + f, t.x + 1.6, FL[f], t.z + 3.75);
        L(fid, cid, 'door');
        col.push(cid); ids.push(fid);
      }
      N.chain(col, 'stairs');
    }
    if (t.turret) { const a = { bake: 1.9, king: 0.75, stock: 1.3, chap: 1.0 }[key]; const r = 6 - 1.75; n(key + 'T', t.x + Math.cos(a) * r, 20.9, t.z + Math.sin(a) * r); L(ids[3], key + 'T', 'ladder'); }
    tnodes[key] = ids;
  }
  n('sw.b', 14.0, -3.5, 1.2); L('sw0', 'sw.b', 'ladder');
  n('kg.b', 98.6, -3.0, 1.4); L('king0', 'kg.b', 'ladder');
  // Tower entrances.
  n('swdoor', 14.5, 0, 3.0); L('sw0', 'swdoor'); L('swdoor', 'gp0', 'door');
  L('lodge', 'nw0', 'door');
  // The larder in the Kitchen Tower opens off the kitchen.
  L('kc1', 'kit0', 'door');
  n('stdoor', 70.6, 0, 25.4);
  // Bakehouse Tower opens to the inner ward through a passage at its north-east.
  n('bkdoor', 70.8, 0, 6.6); L('bake0', 'bkdoor', 'door');
  // Middle gate and drawbridge over the rock-cut ditch.
  n('db2a', 62.2, 0, g); n('db2b', 66.4, 0, g); n('mg', 69.0, 0, g); n('mg2', 71.4, 0, g);
  L(oc[11], 'db2a'); L('db2a', 'db2b'); L('db2b', 'mg'); L('mg', 'mg2');
  // Inner ward.
  const iy = run('iy', [[72.6, 0, 13.6], [76, 0, 13.4], [80, 0, 11.0], [84, 0, 13.8], [87.6, 0, 14.6], [93.4, 0, g]]);
  const iz = run('iz', [[72.6, 0, 19.0], [76.5, 0, 19.4], [80.5, 0, 19.6], [84.5, 0, 19.0], [86.0, 0, 23.5]]);
  L('mg2', iy[0]); L(iy[0], iz[0]); L(iy[3], iz[3]); L('bkdoor', iy[0]);
  L(iz[0], 'stdoor'); L('stdoor', 'stock0', 'door');
  n('gran', 78.0, 0.07, 22.6); L('gran', iz[1]); n('gran1', 81.0, 0.07, 22.8); L('gran', 'gran1');
  // Royal apartments: door from the courtyard, ground-floor rooms, stair, king's hall and chamber.
  n('rdoor', 80.0, 0, 8.4); L(iy[2], 'rdoor', 'door');
  const r0 = run('r0', [[80.0, 0, 5.0], [83.6, 0, 4.4], [86.0, 0, 4.0], [89.2, 0, 4.4], [91.6, 0, 3.0]]);
  L('rdoor', r0[0]); n('rst0', 74.7, 0, 0.8); L(r0[0], 'rst0'); n('rst1', 79.4, 4.0, 0.8); L('rst0', 'rst1', 'stairs');
  const r1 = run('r1', [[80.6, 4.0, 2.2], [84.0, 4.0, 3.6], [86.0, 4.0, 4.0], [88.8, 4.0, 3.0], [91.8, 4.0, 2.6]]);
  L('rst1', r1[0]);
  // A mural passage from the king's chamber to the King's Tower; the east gate passage below.
  L(r1[4], 'king1', 'door');
  n('eg0', 93.4, 0, g); n('eg1', 97.9, GARDEN.y, g); L(iy[5], 'eg0'); L('eg0', 'eg1'); L('eg0', 'king0', 'door'); L('eg0', 'chap0', 'door');
  // East barbican garden, the water-gate stair and the dock.
  const gd = run('gd', [[99.5, GARDEN.y, g], [103.5, GARDEN.y, 12.0], [108.0, GARDEN.y, 12.6], [112.5, GARDEN.y, 12.0], [109.0, GARDEN.y, 20.0], [105.4, GARDEN.y, 23.4]]);
  L('eg1', gd[0]); L(gd[1], gd[5]);
  n('gd.beds', 106.0, GARDEN.y, 5.6); L(gd[1], 'gd.beds'); n('gd.s', 110.0, GARDEN.y, 7.0); L(gd[2], 'gd.s'); L('gd.s', 'gd.beds');
  n('wg0', 105.4, GARDEN.y, 28.4); L(gd[5], 'wg0'); n('wg1', 106.6, GARDEN.y - 0.1, 28.6); L('wg0', 'wg1');
  n('wg2', 116.4, DOCK.y, 28.6); L('wg1', 'wg2', 'stairs'); n('wgate', 117.6, DOCK.y, 28.6); L('wg2', 'wgate');
  const dk = run('dk', [[119.0, DOCK.y, 28.4], [122.0, DOCK.y, 27.0], [125.4, DOCK.y, 28.6], [122.6, DOCK.y, 31.4]]);
  L('wgate', dk[0]); L(dk[3], dk[0]);
  // Wall-walks: the north curtain (y 9) between the back towers, and the tops of the
  // gatehouse block, cross-wall and east curtain linking front and back towers.
  const tx = (k) => TOWERS[k].x;
  const seg = (id, x0, x1) => { const m = Math.max(1, Math.round((x1 - x0) / 3.5)); const pts = []; for (let i = 0; i <= m; i++) pts.push([x0 + ((x1 - x0) * i) / m, WALK, 28.5]); return run(id, pts); };
  const w1 = seg('wa', tx('nw') + 5.6, tx('kit') - 5.6), w2 = seg('wb', tx('kit') + 5.6, tx('stock') - 5.6), w3 = seg('wc', tx('stock') + 5.6, tx('chap') - 5.6);
  L('nw2', w1[0], 'door'); L(w1[w1.length - 1], 'kit2', 'door'); L('kit2', w2[0], 'door'); L(w2[w2.length - 1], 'stock2', 'door'); L('stock2', w3[0], 'door'); L(w3[w3.length - 1], 'chap2', 'door');
  const gw = run('gw', [[17.0, WALK, 6.4], [17.0, WALK, 11.0], [17.0, WALK, 16.0], [17.0, WALK, 21.0], [17.0, WALK, 24.4]]);
  L('sw2', gw[0], 'door'); L(gw[4], 'nw2', 'door');
  const xw = run('xw', [[68.0, WALK, 6.6], [68.0, WALK, 12.0], [68.0, WALK, 18.0], [68.0, WALK, 24.2]]);
  L('bake2', xw[0], 'door'); L(xw[3], 'stock2', 'door');
  const ew = run('ew', [[95.8, WALK, 6.6], [95.8, WALK, 12.0], [95.8, WALK, 18.0], [95.8, WALK, 24.2]]);
  L('king2', ew[0], 'door'); L(ew[3], 'chap2', 'door');
  return { N, tnodes, oc, od, hf, cl, iy, iz, r0, r1, gd, dk, w1, w2, w3 };
}

// ------------------------------------------------------------------ people
const SKIN = ['#f0d0b0', '#e8c4a0', '#dcb48e', '#e4bc98', '#f2d6bc', '#d0a47c'];
const HAIR = ['#3a2a1e', '#5a3a22', '#7a5a3a', '#2a2018', '#8a6a42', '#a07848', '#4a3a2e', '#6a6a66'];

// Costume helpers for about 1300 (dossier 4.2): tunics, hose, hoods and coifs; kirtles, veils, wimples.
const man = (top, bottom, o = {}) => Object.assign({ top, bottom, shoes: '#3a2a1e', sleeves: 'long' }, o);
const woman = (dress, o = {}) => Object.assign({ dress: 'long', dressColor: dress, top: dress, bottom: dress, shoes: '#3a2a1e', hat: 'veil', hatColor: '#f2ede2' }, o);
const xbow = (top, o = {}) => man(top, o.bottom || '#5a5248', Object.assign({ hat: 'kettle', hatColor: '#6e7278', coat: 'jacket', coatColor: top }, o));

export function buildPeople(W, nav) {
  const S = (name) => name; // stations are registered from the rooms' anchors
  for (const [k, v] of Object.entries(A.spots)) W.station(k, v[0], v[1], v[2]);
  const beds = {}; for (const [z, list] of Object.entries(A.beds)) beds[z] = list.slice();
  const bedIn = (zone) => { const b = beds[zone] && beds[zone].shift(); if (!b) { console.warn('no bed left in ' + zone); return { feet: [0, 0, 0], heading: 0 }; } return b; };
  const hall = { A: A.seats.hallA, B: A.seats.hallB, C: A.seats.hallC, H: A.seats.high, ch: A.seats.chapel };
  const hi = { A: 0, B: 0, C: 0 };
  const hallSeat = (row) => { const s = hall[row][hi[row]++ % hall[row].length]; return s; };
  const chapelSpot = (() => { let i = 0; return () => hall.ch[i++ % hall.ch.length]; })();

  // A routine step: [fromHour, toHour, where, act, label, extra].
  const step = ([h0, h1, at, act, label, ext]) => Object.assign({ at, act: act || 'stand', when: [h0, h1], dur: [5, 9], label, face: 'out' }, ext || {});
  const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
  const cover = (steps) => {
    // Hours no step covers: the person rests at the place of their first step.
    const gaps = [];
    let start = null;
    for (let q = 0; q < 96; q++) {
      const h = q / 4 + 0.01;
      const covered = steps.some((s) => inH(h, s[0], s[1]));
      if (!covered && start == null) start = q / 4;
      if (covered && start != null) { gaps.push([start, q / 4]); start = null; }
    }
    if (start != null) gaps.push([start, 24]);
    return gaps;
  };
  const people = [];
  // Start each person already in place at the step their clock calls for.
  function settle(p) {
    if (!p.routine) return;
    const i = p.routine.findIndex((s) => inH(W.hour, s.when[0], s.when[1]));
    if (i < 0) return;
    const st = p.routine[i];
    const at = W.resolve(st.at);
    Object.assign(p, { x: at.x, y: at.y, z: at.z, step: i, moving: false, stepT: 0, stepDur: 4 + (people.length % 5), node: null, anim: st.act || 'stand', prop: st.prop || null, seat: st.seat || null });
    p.heading = p.targetHeading = XS.faceToHeading(st.face != null ? st.face : 'out');
    p.hidden = !!st.away;
  }
  const P = (name, role, bio, costume, steps, base) => {
    const gaps = cover(steps);
    const full = steps.concat(gaps.map(([a, b]) => [a, b, base[0], base[1], base[2], base[3]]));
    const routine = full.map(step);
    const h = W.hour;
    const now = routine.find((s) => inH(h, s.when[0], s.when[1])) || routine[0];
    const p = W.addPerson({ name, role, bio, costume: Object.assign({ skin: SKIN[people.length % SKIN.length], hair: HAIR[(people.length * 3) % HAIR.length] }, costume), routine, at: now.at, face: now.face, update: awayUpdate });
    settle(p);
    people.push(p);
    return p;
  };
  // People who are away (out in the town, across the river) are hidden until they come back.
  function awayUpdate(p) { const st = p.routine && p.routine[p.step]; p.hidden = !!(st && st.away && !p.moving); }
  const away = (label) => ({ away: true, label });
  const sleep = (b, label = 'Asleep') => ({ at: b.feet, act: 'lie', label, face: b.heading });
  const sit = (s, label, act = 'sitEat', face = 'out', extra = {}) => Object.assign({ at: [s[0], s[1], s[2]], act, label, face }, extra);
  const Z = (h0, h1, o) => [h0, h1, o.at, o.act || 'stand', o.label, o];

  // --- The constable's household ---------------------------------------------------------
  const bHugh = bedIn('Z08'), bMargery = bedIn('Z08');
  P('Sir Hugh de Ashby', 'Constable of the castle and mayor of Conwy', 'Keeps a list of every leaking gutter, and the list only grows.',
    man('#8a1e1e', '#2a2a3a', { coat: 'long', coatColor: '#2a3a7a', hair: '#6a5a4a', beard: '#6a5a4a', build: 1.15 }), [
      Z(5.4, 5.9, { at: S('sw1.chest'), act: 'stand', label: 'Dressing in his chamber' }),
      Z(5.9, 6.6, { at: chapelSpot(), act: 'pray', label: 'At morning Mass', face: 1 }),
      Z(6.6, 7.9, { at: 'wb2', act: 'handsBehind', label: 'Walking the walls, counting leaking gutters', face: 'out' }),
      Z(7.9, 10.0, sit([A.seats.lesserChair.x, A.seats.lesserChair.y, A.seats.lesserChair.z], 'Hearing townsfolk in the lesser hall', 'sitTalk', 'out')),
      Z(10.0, 11.6, sit(hall.H[2], 'Dinner at the high table', 'sitEat')),
      Z(11.6, 13.8, sit([A.seats.lesserChair.x, A.seats.lesserChair.y, A.seats.lesserChair.z], 'Mayor’s business in the lesser hall', 'sitTalk')),
      Z(13.8, 14.8, { at: S('cellE.casks'), act: 'point', label: 'Inspecting the wine in the cellar', face: 1 }),
      Z(14.8, 16.8, { at: S('sw1.window'), act: 'read', label: 'Reading letters at the window', face: 'in' }),
      Z(16.8, 17.4, { at: chapelSpot(), act: 'pray', label: 'At Vespers', face: 1 }),
      Z(17.4, 18.6, sit(hall.H[2], 'Supper at the high table', 'sitEat')),
      Z(18.6, 19.8, { at: 'bgate.in', act: 'handsBehind', label: 'Seeing the gate shut at sunset', face: -1 }),
      Z(19.8, 21.0, sit([A.seats.constableChair.x, A.seats.constableChair.y, A.seats.constableChair.z], 'By the fire in his chamber', 'sitTalk', -1)),
      Z(21.0, 5.4, sleep(bHugh, 'Asleep in the curtained bed')),
    ], [S('sw1.mid'), 'stand', 'In his chamber']);
  P('Lady Margery de Ashby', 'The constable’s wife', 'Sews a banner for the chapel, slowly, one gold thread at a time.',
    woman('#2a4a8a', { hat: 'wimple', coat: 'long', coatColor: '#7a2a26', build: 0.95 }), [
      Z(5.9, 6.6, { at: chapelSpot(), act: 'pray', label: 'At morning Mass', face: 1 }),
      Z(6.6, 7.6, { at: S('laundry2'), act: 'point', label: 'Checking the laundry', face: -1 }),
      Z(7.6, 9.9, { at: S('sw2.frame'), act: 'sitWork', label: 'Embroidering the chapel banner', face: 'in', seat: 0.48 }),
      Z(9.9, 11.6, sit(hall.H[1], 'Dinner at the high table', 'sitEat')),
      Z(11.6, 12.1, { at: S('sw2.frame'), act: 'sitWork', label: 'Back at her embroidery', face: 'in' }),
      Z(12.1, 13.0, { at: S('rchapel.squint'), act: 'pray', label: 'Watching the chaplain at prayer through the squint', face: 0 }),
      Z(13.0, 14.8, { at: S('sw2.frame'), act: 'sitWork', label: 'Back at her embroidery', face: 'in' }),
      Z(14.8, 15.8, { at: 'gd2', act: 'stand', label: 'Walking in the garden', face: 1 }),
      Z(15.8, 16.8, { at: 'gd4', act: 'handsBehind', label: 'In the garden, by the fruit tree', face: 'out' }),
      Z(16.8, 17.4, { at: chapelSpot(), act: 'pray', label: 'At Vespers', face: 1 }),
      Z(17.4, 18.6, sit(hall.H[1], 'Supper at the high table', 'sitEat')),
      Z(18.6, 21.0, { at: S('sw2.stool'), act: 'sitWork', label: 'Spinning by the fire', face: 1 }),
      Z(21.0, 5.9, sleep(bMargery, 'Asleep')),
    ], [S('sw2.mid'), 'stand', 'In the family chamber']);
  const bThomas = bedIn('Z09'), bAgnes = bedIn('Z09'), bCecily = bedIn('Z09');
  P('Thomas de Ashby', 'The constable’s son (12), a page', 'Has counted every step of every stair and argues about the totals.',
    man('#3a6a3a', '#7a2a26', { child: true, hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.9, 6.6, { at: chapelSpot(), act: 'pray', label: 'At Mass, fidgeting', face: 1 }),
      Z(6.6, 7.7, { at: S('guard.dice'), act: 'point', label: 'Begging the guards for crossbow lessons', face: 1 }),
      Z(7.7, 9.6, { at: S('small.lesson'), act: 'read', label: 'Lessons with the chaplain', face: 'out' }),
      Z(9.6, 11.6, { at: S('hall.serve'), act: 'carryHigh', prop: 'tray', label: 'Serving at the high table', face: 1 }),
      Z(11.6, 12.4, sit(hallSeat('A'), 'His own dinner, quickly', 'sitEat')),
      Z(12.4, 14.4, { at: 'od3', act: 'run', label: 'Running messages across the ward', face: 1 }),
      Z(14.4, 15.4, { at: 'gw2', act: 'point', label: 'Counting the steps up to the wall-walk again', face: -1 }),
      Z(15.4, 17.2, { at: S('drill'), act: 'stand', label: 'Watching crossbow practice', face: 1 }),
      Z(17.2, 18.6, { at: S('hall.serve2'), act: 'carryHigh', prop: 'tray', label: 'Serving supper', face: 1 }),
      Z(18.6, 20.6, { at: S('sw2.mid'), act: 'sit', label: 'Telling his sister about the stairs', face: -1 }),
      Z(20.6, 5.9, sleep(bThomas)),
    ], [S('sw2.mid'), 'stand', 'In the family chamber']);
  P('Agnes de Ashby', 'The constable’s daughter (8)', 'Feeds crusts to the jackdaws when nobody is looking.',
    woman('#c8a040', { child: true, hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.9, 6.6, { at: chapelSpot(), act: 'pray', label: 'At Mass', face: 1 }),
      Z(6.6, 7.6, { at: S('cat.granary'), act: 'kneel', label: 'Hunting for the granary cat', face: 1 }),
      Z(7.6, 9.6, { at: S('small.lesson2'), act: 'read', label: 'Learning her psalter', face: 'out' }),
      Z(9.6, 11.0, sit(hall.H[0], 'Dinner at the high table', 'sitEat')),
      Z(11.0, 13.6, { at: S('sw2.window'), act: 'wave', label: 'Feeding crusts to the jackdaws at the window', face: 'in' }),
      Z(13.6, 15.6, { at: 'gd.s', act: 'kneel', label: 'Making daisy chains on the lawn', face: 'out' }),
      Z(15.6, 17.4, { at: S('sw2.stool'), act: 'sitWork', label: 'Learning to spin', face: 1 }),
      Z(17.4, 18.4, sit(hall.H[0], 'Supper', 'sitEat')),
      Z(18.4, 20.4, { at: S('sw2.mid'), act: 'sit', label: 'Playing with the wooden horse', face: 1 }),
      Z(20.4, 5.9, sleep(bAgnes, 'Asleep in the truckle bed')),
    ], [S('sw2.mid'), 'stand', 'In the family chamber']);
  P('Gilbert of Ludlow', 'The constable’s clerk', 'Has ink on his fingers that never quite washes off.',
    man('#3a3a3a', '#2a2a2a', { coat: 'long', coatColor: '#2e2e34', hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.9, 6.6, { at: chapelSpot(), act: 'pray', label: 'At Mass', face: 1 }),
      Z(6.6, 10.0, sit([A.seats.clerk.x, A.seats.clerk.y, A.seats.clerk.z], 'Writing up the accounts', 'sitWrite', 'out')),
      Z(10.0, 11.0, sit(hallSeat('A'), 'Dinner in the great hall', 'sitEat')),
      Z(11.0, 12.0, sit([A.seats.clerk.x, A.seats.clerk.y, A.seats.clerk.z], 'Taking the royal letters', 'sitWrite', 'out')),
      Z(12.0, 13.2, { at: 'dk1', act: 'read', prop: 'paper', label: 'Counting barrels landed at the dock', face: 1 }),
      Z(13.2, 17.0, sit([A.seats.clerk.x, A.seats.clerk.y, A.seats.clerk.z], 'Writing letters and tallying with the keeper', 'sitWrite', 'out')),
      Z(17.4, 18.4, sit(hallSeat('A'), 'Supper', 'sitEat')),
      Z(18.4, 20.6, sit([A.seats.clerk.x, A.seats.clerk.y, A.seats.clerk.z], 'Copying a letter by candlelight', 'sitWrite', 'out')),
      Z(20.6, 5.9, sleep(bedIn('Z15'), 'Asleep in the lesser hall')),
    ], [S('small.stand'), 'stand', 'In the small chamber']);
  P('Cecily Sparrow', 'Lady’s maid', 'Sings under her breath and stops when anyone comes in.',
    woman('#8a7a5a', { hat: 'veil', apron: '#f2ede2' }), [
      Z(5.3, 5.9, { at: 'well', act: 'carry', prop: 'bucket', label: 'Fetching water from the well', face: 1 }),
      Z(5.9, 6.6, { at: S('sw2.mid'), act: 'stand', label: 'Dressing her lady', face: -1 }),
      Z(6.6, 7.8, { at: S('kt.1b'), act: 'workBench', label: 'Brushing gowns in the Kitchen Tower', face: 'in' }),
      Z(7.8, 9.6, { at: S('kt.1'), act: 'sitWork', label: 'Mending a sleeve', face: 'out' }),
      Z(9.6, 11.4, { at: S('hall.serve2'), act: 'carry', prop: 'jug', label: 'Pouring ale at dinner', face: 1 }),
      Z(11.4, 12.2, sit(hallSeat('C'), 'Servants’ dinner', 'sitEat')),
      Z(12.2, 16.8, { at: S('sw2.stool'), act: 'sitWork', label: 'Mending linen', face: 1 }),
      Z(16.8, 18.8, { at: S('kt.1'), act: 'sitWork', label: 'Sewing, singing under her breath', face: 'out' }),
      Z(18.8, 20.4, { at: S('sw2.mid'), act: 'stand', label: 'Undressing her lady', face: 1 }),
      Z(20.4, 5.3, sleep(bCecily)),
    ], [S('sw2.mid'), 'stand', 'In the family chamber']);
  // --- The royal establishment ----------------------------------------------------------
  P('Walter Pykard', 'Chaplain', 'Writes letters for anyone who cannot, for a small fee in eggs.',
    man('#2a2a30', '#2a2a30', { dress: 'long', dressColor: '#2a2a30', hairStyle: 'bald', hair: '#7a6a5a' }), [
      Z(5.6, 6.7, { at: S('chapel.altar'), act: 'pray', label: 'Saying Mass in the chapel', face: 1 }),
      Z(6.7, 7.6, { at: S('chapel.lectern'), act: 'read', label: 'Reading at the lectern', face: 1 }),
      Z(7.6, 9.6, { at: S('small.chaplain'), act: 'talk', label: 'Teaching the constable’s children', face: -1 }),
      Z(9.9, 11.5, sit(hall.H[3], 'Grace, then dinner at the high table', 'sitEat')),
      Z(12.0, 13.4, { at: S('rchapel.altar'), act: 'pray', label: 'Praying in the royal chapel', face: 0.35 }),
      Z(13.4, 15.8, sit([A.seats.visitor.x, A.seats.visitor.y, A.seats.visitor.z], 'Writing a letter for a garrison man', 'sitWrite', -1)),
      Z(16.6, 17.4, { at: S('chapel.altar'), act: 'pray', label: 'Vespers in the chapel', face: 1 }),
      Z(17.4, 18.4, sit(hall.H[3], 'Supper', 'sitEat')),
      Z(18.4, 20.6, { at: S('ct.2'), act: 'sitRead', label: 'Reading in his room in the Chapel Tower', face: 1, seat: 0.46 }),
      Z(20.6, 5.6, sleep(bedIn('Z46'))),
    ], [S('ct.2'), 'stand', 'In his room']);
  P('Master Ralph Lightfoot', 'Attiliator (keeper and repairer of crossbows and armour)', 'Can tell a bad bowstring by its sound alone.',
    man('#6a5a42', '#4a3a2a', { apron: '#5a3a22', hat: 'coif', hatColor: '#e8e2d4', beard: '#5a4a3a' }), [
      Z(6.0, 7.6, { at: S('guard.dice2'), act: 'workBench', label: 'Inspecting the guard-room crossbows', face: 'in' }),
      Z(7.6, 9.8, { at: S('quarrels'), act: 'kneel', label: 'Counting quarrels in their barrels', face: 'in' }),
      Z(9.8, 11.0, sit(hallSeat('A'), 'Dinner', 'sitEat')),
      Z(11.0, 13.6, { at: S('drill'), act: 'workBench', label: 'Re-stringing a crossbow in the ward', face: 1 }),
      Z(13.6, 16.8, { at: S('nw.2'), act: 'workBench', label: 'Oiling mail shirts and kettle hats', face: 'in' }),
      Z(17.4, 18.4, sit(hallSeat('A'), 'Supper', 'sitEat')),
      Z(18.4, 20.4, { at: S('guard'), act: 'sitTalk', label: 'Talking crossbows in the guard room', face: 'out' }),
      Z(20.4, 6.0, sleep(bedIn('Z11'))),
    ], [S('nw.1'), 'stand', 'In the North-west Tower']);
  P('Roger atte Gate', 'Porter (doorkeeper)', 'Knows everyone’s business in the town.',
    man('#5a4a3a', '#3a3a3a', { coat: 'long', coatColor: '#4a3a2e', hat: 'hood', hatColor: '#6a5a42', beard: '#7a6a5a' }), [
      Z(4.0, 4.6, { at: S('bgate.in'), act: 'haul', label: 'Opening the gate at dawn', face: -1 }),
      Z(4.6, 10.0, { at: S('gp'), act: 'handsBehind', prop: 'cane', label: 'Questioning arrivals at the gate', face: 'out' }),
      Z(10.0, 10.8, sit(hallSeat('C'), 'A quick dinner', 'sitEat')),
      Z(10.8, 19.6, { at: S('gp'), act: 'handsBehind', prop: 'cane', label: 'At the gate', face: 'out' }),
      Z(19.6, 20.2, { at: S('bgate.in'), act: 'haul', label: 'Locking up at sunset', face: -1 }),
      Z(20.2, 21.4, { at: S('lodge'), act: 'sitDrink', label: 'Ale in the porter’s lodge', face: 'out' }),
      Z(21.4, 4.0, sleep(bedIn('Z11'))),
    ], [S('lodge'), 'stand', 'In the porter’s lodge']);
  P('Henry le Spenser', 'Keeper of victuals', 'Notches tally sticks with a little knife he never lends.',
    man('#4a5a3a', '#3a3a2e', { coat: 'long', coatColor: '#3e4a32', hat: 'hood', hatColor: '#5a5a3a' }), [
      Z(5.4, 6.8, { at: S('cellE'), act: 'carry', prop: 'basket', label: 'Issuing bread and ale', face: 1 }),
      Z(6.8, 8.6, { at: S('granary'), act: 'point', label: 'Checking the granary', face: 'in' }),
      Z(8.6, 9.9, { at: 'dk1', act: 'read', prop: 'paper', label: 'Receiving a boat’s cargo', face: 1 }),
      Z(9.9, 11.0, sit(hallSeat('A'), 'Dinner', 'sitEat')),
      Z(12.6, 14.6, { at: S('small.stand'), act: 'workBench', label: 'Tallying with the clerk', face: 'in' }),
      Z(14.6, 17.0, { at: S('cellE.casks'), act: 'workBench', label: 'Notching tally sticks in the cellar', face: 1 }),
      Z(17.4, 18.4, sit(hallSeat('A'), 'Supper', 'sitEat')),
      Z(18.4, 20.4, { at: S('cellW'), act: 'point', label: 'Locking up the stores', face: 1 }),
      Z(20.4, 5.4, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('cellE'), 'stand', 'In the cellars']);
  // Crossbowmen (fifteen in the 1283-84 establishment; ten named here).
  const xs = ['#e8e0cc', '#b8a888', '#d8ccb0', '#a89878', '#c8bca0'];
  const XB = (name, bio, cos, steps, bedZone) => P(name, 'Crossbowman', bio, xbow(xs[people.length % xs.length], cos), steps.concat([]), [S('bake1.mid'), 'stand', 'Off duty in the garrison chamber']);
  const bStephen = bedIn('Z33');
  XB('Stephen Cole', 'Has served since the building years and remembers the scaffolding spirals.', { beard: '#8a8a84', hair: '#8a8a84' }, [
    Z(3.6, 7.0, { at: 'xw1', act: 'handsBehind', prop: 'cane', label: 'Dawn watch on the cross-wall', face: -1 }),
    Z(7.0, 8.0, { at: S('drill'), act: 'point', label: 'Drilling the younger men', face: 1 }),
    Z(8.0, 9.8, { at: 'bake1', act: 'sitTalk', label: 'Telling the scaffolding story again', face: 'out' }),
    Z(9.8, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(11.2, 15.0, sleep(bStephen, 'Asleep after the dawn watch')),
    Z(17.4, 18.2, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(18.2, 20.6, { at: S('guard.dice'), act: 'sitTalk', label: 'Dice in the guard room', face: 1 }),
    Z(20.6, 3.6, sleep(bStephen)),
  ]);
  XB('Arnaud of Bayonne', 'Complains about the Welsh rain in two languages.', { hair: '#2a2018' }, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 9.9, { at: 'bakeT', act: 'handsBehind', prop: 'cane', label: 'Lookout on the Bakehouse turret', face: 'out' }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(12.4, 13.8, { at: S('guard.dice2'), act: 'sitTalk', label: 'Dice in the guard room', face: -1 }),
    Z(13.8, 19.4, sleep(bedIn('Z34'), 'Sleeping before the night watch')),
    Z(19.6, 23.9, { at: 'wb3', act: 'handsBehind', prop: 'lantern', label: 'Night watch on the north wall', face: 'out' }),
    Z(23.9, 4.0, { at: 'wa2', act: 'handsBehind', prop: 'lantern', label: 'Night watch, west end', face: 'out' }),
  ]);
  XB('Richard Mabbe', 'Whittles small animals from driftwood.', {}, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 9.9, { at: S('bgate'), act: 'handsBehind', prop: 'cane', label: 'Guarding the barbican gate', face: -1 }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(11.0, 13.6, { at: 'bake2', act: 'sitWork', label: 'Whittling a driftwood heron', face: 'out' }),
    Z(13.6, 16.8, { at: 'wb1', act: 'handsBehind', prop: 'cane', label: 'Afternoon watch on the wall', face: 'out' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(18.4, 20.8, { at: S('bake2.table'), act: 'sitWork', label: 'Whittling by the light', face: 'out' }),
    Z(20.8, 6.6, sleep(bedIn('Z33'))),
  ]);
  XB('Hamo Totty', 'Is courting the brewster and brings her wildflowers.', { hair: '#8a5a2a' }, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 9.4, { at: S('drill'), act: 'workBench', label: 'Cleaning his kit', face: 'out' }),
    Z(9.4, 9.9, { at: S('brew.trough'), act: 'talk', label: 'Bringing the brewster wildflowers', face: 1 }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(11.2, 16.6, { at: 'wc2', act: 'handsBehind', prop: 'cane', label: 'Wall watch above the inner ward', face: 'out' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(18.4, 19.8, { at: S('brew.barrels'), act: 'talk', label: 'Lingering at the brewhouse door', face: 1 }),
    Z(20.6, 6.6, sleep(bedIn('Z34'))),
  ]);
  const bOsbert = bedIn('Z33');
  XB('Osbert Faukes', 'Snores so loudly his mates make him sleep by the door.', { build: 1.2 }, [
    Z(3.6, 6.6, { at: 'kingT', act: 'handsBehind', prop: 'cane', label: 'Turret watch on the King’s Tower', face: 'out' }),
    Z(6.6, 7.2, sit(hallSeat('C'), 'Bread and ale after the watch', 'sitDrink')),
    Z(7.2, 10.8, sleep(bOsbert, 'Asleep, and snoring')),
    Z(10.8, 11.6, sit(hallSeat('B'), 'A late dinner', 'sitEat', 'in')),
    Z(12.4, 13.6, { at: S('drill'), act: 'stand', label: 'Afternoon drill', face: 1 }),
    Z(13.6, 17.2, { at: 'bake1', act: 'sitTalk', label: 'Mending his hose', face: 'out' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(19.6, 3.6, sleep(bOsbert, 'Asleep by the door, snoring')),
  ]);
  XB('Alan of Chester', 'Sends his wages home to his mother in Chester.', {}, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 9.7, { at: 'dk2', act: 'carry', prop: 'box', label: 'Helping to unload a boat', face: 1 }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(12.8, 16.0, { at: 'gp1', act: 'handsBehind', prop: 'cane', label: 'Gate duty', face: 'out' }),
    Z(16.0, 17.2, sit([A.seats.visitor.x, A.seats.visitor.y, A.seats.visitor.z], 'Having the chaplain write home for him', 'sitTalk', -1)),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(20.6, 6.6, sleep(bedIn('Z34'))),
  ]);
  XB('Hugh Morel', 'Afraid of heights, and posted to the highest turret.', { hair: '#3a2a1e' }, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.6, 9.9, { at: 'king0', act: 'handsBehind', prop: 'cane', label: 'Guarding the royal rooms', face: 'out' }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(13.6, 16.8, { at: 'chapT', act: 'handsBehind', prop: 'cane', label: 'On the Chapel Tower turret, not looking down', face: 'out' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(20.6, 6.6, sleep(bedIn('Z33'))),
  ]);
  XB('Robin Swan', 'The best shot in the garrison, and he knows it.', { hair: '#a07848' }, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 8.8, { at: 'well', act: 'crank', label: 'Hauling water at the well', face: 1 }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(11.6, 13.4, { at: S('butt.shoot'), act: 'point', label: 'Shooting at the butt', face: 1, tags: ['shooter'] }),
    Z(13.4, 19.4, sleep(bedIn('Z34'), 'Sleeping before the night watch')),
    Z(19.6, 23.9, { at: 'wc1', act: 'handsBehind', prop: 'lantern', label: 'Night watch above the inner ward', face: 'out' }),
    Z(23.9, 4.0, { at: 'ew1', act: 'handsBehind', prop: 'lantern', label: 'Night watch on the east curtain', face: 'out' }),
  ]);
  XB('Philip of Flint', 'Talks to the horses more than to people.', {}, [
    Z(7.0, 8.0, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(8.0, 9.9, { at: S('guard'), act: 'sitTalk', label: 'In the guard room', face: 'out' }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(12.6, 13.8, { at: S('stable'), act: 'talk', label: 'Helping the groom, talking to the horses', face: 'in' }),
    Z(13.8, 17.0, { at: S('stable.b'), act: 'sweep', label: 'Sweeping out the stalls', face: 'in' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(20.6, 6.6, sleep(bedIn('Z33'))),
  ]);
  XB('Geoffrey Hardel', 'Secretly slips the prisoner an extra crust.', { beard: '#5a4a3a' }, [
    Z(7.0, 7.8, { at: S('drill'), act: 'stand', label: 'Crossbow drill', face: 1 }),
    Z(7.8, 8.6, { at: S('pit.top'), act: 'kneel', label: 'Lowering bread and water to the prisoner', face: 'out', tags: ['crust'] }),
    Z(9.9, 11.0, sit(hallSeat('B'), 'Dinner', 'sitEat', 'in')),
    Z(11.0, 11.4, { at: S('pit.top'), act: 'kneel', label: 'Slipping the prisoner an extra crust on a string', face: 'out', tags: ['crust'] }),
    Z(13.6, 16.8, { at: 'wa1', act: 'handsBehind', prop: 'cane', label: 'Wall watch', face: 'out' }),
    Z(17.4, 18.4, sit(hallSeat('B'), 'Supper', 'sitEat', 'in')),
    Z(20.6, 6.6, sleep(bedIn('Z34'))),
  ]);
  // Watchmen.
  const bNicholas = bedIn('Z34');
  P('Nicholas Fowle', 'Night watchman', 'Counts stars to stay awake.',
    man('#4a4a52', '#3a3a3a', { coat: 'long', coatColor: '#3a3a42', hat: 'hood', hatColor: '#4a4a52' }), [
      Z(19.8, 23.9, { at: 'wb4', act: 'handsBehind', prop: 'lantern', label: 'Walking the north wall, counting stars', face: 'out' }),
      Z(23.9, 3.9, { at: 'stockT', act: 'handsBehind', prop: 'lantern', label: 'On the Stockhouse turret', face: 'out' }),
      Z(3.9, 4.6, sit(hallSeat('C'), 'Bread and ale after the watch', 'sitDrink')),
      Z(4.6, 9.9, sleep(bNicholas, 'Asleep until dinner')),
      Z(9.9, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.0, 18.0, sleep(bNicholas, 'Asleep again')),
    ], [S('st1'), 'stand', 'In the Stockhouse Tower']);
  const bElias = bedIn('Z33');
  P('Elias Brun', 'Night watchman', 'Carries a cow horn and has never yet had to blow it.',
    man('#5a4a3a', '#3a3a3a', { coat: 'long', coatColor: '#4a3a2e', hat: 'hood', hatColor: '#5a4a3a', beard: '#5a4a3a' }), [
      Z(19.8, 23.9, { at: 'sw3', act: 'handsBehind', prop: 'lantern', label: 'Night watch on the South-west Tower roof', face: 'out' }),
      Z(23.9, 4.2, { at: 'gw2', act: 'handsBehind', prop: 'lantern', label: 'Night watch over the west gate', face: -1 }),
      Z(4.4, 9.8, sleep(bElias, 'Asleep after the night watch')),
      Z(9.9, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.0, 18.6, sleep(bElias, 'Sleeping before the night')),
    ], [S('bake2.mid'), 'stand', 'In the Bakehouse Tower']);
  const bWilkin = bedIn('Z11');
  P('Wilkin of Wirral', 'Night watchman', 'Hums sea songs his father taught him.',
    man('#3a4a5a', '#3a3a3a', { coat: 'long', coatColor: '#34404a', hat: 'hood', hatColor: '#3a4a5a' }), [
      Z(19.8, 23.9, { at: 'chapT', act: 'handsBehind', prop: 'lantern', label: 'On the Chapel Tower turret', face: 'out' }),
      Z(23.9, 1.0, { at: 'wgate', act: 'handsBehind', prop: 'lantern', label: 'Checking the water gate', face: 1 }),
      Z(1.0, 4.2, { at: 'wc3', act: 'handsBehind', prop: 'lantern', label: 'On the wall-walk, humming', face: 'out' }),
      Z(4.4, 9.8, sleep(bWilkin, 'Asleep after the night watch')),
      Z(9.9, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.0, 18.6, sleep(bWilkin, 'Sleeping')),
    ], [S('nw.1'), 'stand', 'In the North-west Tower']);
  // Craftsmen.
  P('Adam of Shrewsbury', 'Mason', 'Has carved a tiny face on a hidden corbel high in the hall roof.',
    man('#9a8a6a', '#5a4a3a', { apron: '#c8b8a0', hat: 'coif', hatColor: '#f2ede2', beard: '#7a6a5a' }), [
      Z(5.6, 6.6, { at: S('lime'), act: 'stir', label: 'Mixing lime mortar', face: 'in' }),
      Z(6.6, 9.8, { at: 'sw3', act: 'chisel', label: 'Patching the render on the South-west Tower', face: 'in' }),
      Z(9.8, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 15.0, { at: S('cellW.steps'), act: 'chisel', label: 'Repairing the cellar steps', face: -1 }),
      Z(15.0, 17.2, { at: S('lime'), act: 'stir', label: 'Knocking up more mortar', face: 'in' }),
      Z(17.4, 18.4, sit(hallSeat('C'), 'Supper', 'sitEat')),
      Z(20.6, 5.6, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('lime'), 'stand', 'By the lime pit']);
  P('Bartholomew Hod', 'Mason’s labourer', 'Always white to the elbows.',
    man('#d8d0c0', '#8a7a62', { sleeves: 'short', hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.6, 7.4, { at: S('lime'), act: 'shovel', label: 'Slaking lime', face: 'in' }),
      Z(7.4, 9.8, { at: 'sw2', act: 'carry', prop: 'bucket', label: 'Hauling buckets up the tower stair', face: 1 }),
      Z(9.8, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 17.0, { at: S('laundry.line'), act: 'scrub', label: 'Limewashing the courtyard wall', face: 'in' }),
      Z(17.4, 18.4, sit(hallSeat('C'), 'Supper', 'sitEat')),
      Z(20.6, 5.6, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('lime'), 'stand', 'By the lime pit']);
  P('Peter Cressy', 'Carpenter', 'Can judge oak by smell.',
    man('#7a5a3a', '#4a3a2a', { apron: '#8a6a42', hat: 'hood', hatColor: '#6a5032' }), [
      Z(5.8, 7.4, { at: 'db', act: 'kneel', label: 'Checking the drawbridge timbers', face: 1 }),
      Z(7.4, 9.8, { at: 'rl1', act: 'hammer', label: 'Replacing a rotten batten in the hall roof', face: 'in' }),
      Z(9.8, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 12.8, { at: 'db2a', act: 'kneel', label: 'Greasing the middle drawbridge', face: 1 }),
      Z(12.8, 15.0, { at: S('kitchen.door'), act: 'saw', label: 'Mending the kitchen door', face: 'in' }),
      Z(15.0, 17.2, { at: S('cart'), act: 'saw', label: 'Sawing new battens', face: 'out' }),
      Z(17.4, 18.4, sit(hallSeat('C'), 'Supper', 'sitEat')),
      Z(20.6, 5.8, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('cart'), 'stand', 'In the ward']);
  P('Perkin Joiner', 'Carpenter’s apprentice', 'Wants to be a crossbowman instead.',
    man('#8a6a42', '#5a4a32', { child: false, build: 0.85, hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.8, 7.4, { at: S('cart'), act: 'workBench', label: 'Sharpening the tools', face: 'out' }),
      Z(7.4, 9.8, { at: 'rl0', act: 'stand', label: 'Holding the ladder', face: 'in' }),
      Z(9.8, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 12.8, { at: S('drill'), act: 'point', label: 'Watching the crossbowmen instead of sweeping', face: 1 }),
      Z(12.8, 15.0, { at: S('cart'), act: 'sweep', label: 'Sweeping up shavings', face: 'out' }),
      Z(15.0, 17.2, { at: S('cart'), act: 'carryShoulder', prop: 'plank', label: 'Carrying battens', face: 1 }),
      Z(17.4, 18.4, sit(hallSeat('C'), 'Supper', 'sitEat')),
      Z(20.6, 5.8, sleep(bedIn('Z15'), 'Asleep in the lesser hall')),
    ], [S('cart'), 'stand', 'In the ward']);
  P('Wat Hamond', 'Smith', 'Missing the tip of one finger.',
    man('#4a3a2e', '#3a3028', { apron: '#5a3a22', sleeves: 'short', beard: '#3a2a1e', build: 1.2 }), [
      Z(5.5, 6.2, { at: S('forge.bellows'), act: 'bellows', label: 'Lighting the forge', face: 'in' }),
      Z(6.2, 9.8, { at: S('forge'), act: 'hammer', label: 'Making nails at the anvil', face: 'in', tags: ['anvil'] }),
      Z(9.8, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 12.8, { at: S('stable'), act: 'hammer', label: 'Shoeing a horse', face: 'in' }),
      Z(13.6, 15.4, { at: 'winch', act: 'hammer', label: 'Mending the portcullis chain', face: 1 }),
      Z(15.4, 18.0, { at: S('forge'), act: 'hammer', label: 'Back at the anvil', face: 'in', tags: ['anvil'] }),
      Z(18.0, 18.8, sit(hallSeat('C'), 'Supper', 'sitEat')),
      Z(20.6, 5.5, sleep(bedIn('Z15'), 'Asleep in the lesser hall')),
    ], [S('forge'), 'stand', 'At the forge']);
  // Kitchen, bakery, brewhouse, stables.
  P('Matthew le Cuk', 'Cook', 'Guards his spice box with his life.',
    man('#e8e0cc', '#5a4a3a', { apron: '#f2ede2', hat: 'coif', hatColor: '#f2ede2', build: 1.25, beard: '#6a4a32' }), [
      Z(4.8, 5.5, { at: S('kitchen.pots'), act: 'kneel', label: 'Lighting the kitchen hearth', face: 'in' }),
      Z(5.5, 6.3, { at: S('cellW'), act: 'carry', prop: 'sack', label: 'Fetching salt meat from the cellar', face: 1 }),
      Z(6.3, 9.6, { at: S('kitchen.pots'), act: 'stir', label: 'Cooking dinner', face: 'in' }),
      Z(9.6, 11.6, { at: S('kitchen.table'), act: 'workBench', label: 'Dressing dishes for the hall', face: 'in' }),
      Z(11.6, 12.4, { at: S('kitchen.table2'), act: 'drink', label: 'A cup of ale', face: 'out' }),
      Z(14.6, 17.4, { at: S('kitchen.pots'), act: 'stir', label: 'Preparing supper', face: 'in' }),
      Z(17.4, 19.2, { at: S('kitchen.table'), act: 'workBench', label: 'Sending supper to the hall', face: 'in' }),
      Z(20.4, 4.8, sleep(bedIn('Z23'), 'Asleep by the banked fire')),
    ], [S('kitchen.mid'), 'stand', 'In the kitchen']);
  P('Dickon', 'Turnspit boy (11)', 'His face is pink on one side from the fire.',
    man('#d8ccb0', '#7a6a52', { child: true, sleeves: 'short' }), [
      Z(5.3, 6.4, { at: 'well', act: 'carry', prop: 'bucket', label: 'Fetching water', face: 1 }),
      Z(6.4, 9.8, { at: S('kitchen.spit'), act: 'crank', label: 'Turning the spit', face: -1, tags: ['spit'] }),
      Z(9.8, 10.4, { at: S('kitchen.door'), act: 'sitEat', label: 'Eating scraps by the door', face: 'out' }),
      Z(10.4, 12.8, { at: S('kitchen.spit'), act: 'sleepSit', label: 'Dozing while the meat turns', face: -1, tags: ['spit'] }),
      Z(12.8, 13.2, { at: 'od6', act: 'run', label: 'Chasing a dog that stole a bone', face: 1 }),
      Z(13.2, 14.8, { at: S('kitchen.spit'), act: 'crank', label: 'Turning the spit', face: -1, tags: ['spit'] }),
      Z(14.8, 17.8, { at: S('kitchen.spit'), act: 'crank', label: 'Turning the spit for supper', face: -1, tags: ['spit'] }),
      Z(20.4, 5.3, sleep(bedIn('Z23'), 'Asleep by the kitchen fire')),
    ], [S('kitchen.mid'), 'stand', 'In the kitchen']);
  P('Emma Pottere', 'Scullion', 'Saving coins to buy a tin brooch.',
    woman('#8a7a62', { hat: 'kerchief', hatColor: '#e8e2d4', apron: '#e8e2d4', sleeves: 'short' }), [
      Z(5.6, 9.6, { at: S('kitchen.trough'), act: 'scrub', label: 'Scouring pots with sand', face: 'in' }),
      Z(9.6, 11.2, { at: S('hall.serve2'), act: 'carry', prop: 'jug', label: 'Carrying dishes to the hall', face: 1 }),
      Z(11.2, 12.0, sit(hallSeat('C'), 'Servants’ dinner', 'sitEat')),
      Z(12.0, 14.0, { at: S('hall.mid'), act: 'scrub', label: 'Scrubbing the trestles', face: 'in' }),
      Z(14.0, 17.4, { at: S('kitchen.trough'), act: 'scrub', label: 'Scouring', face: 'in' }),
      Z(18.4, 19.6, { at: S('kitchen.trough'), act: 'scrub', label: 'Washing up after supper', face: 'in' }),
      Z(20.6, 5.6, sleep(bedIn('Z24'))),
    ], [S('kitchen.table2'), 'stand', 'In the kitchen']);
  P('Walter Baxter', 'Baker', 'Up before everyone, asleep after dinner.',
    man('#e8e2d4', '#8a7a62', { apron: '#f2ede2', sleeves: 'short', hat: 'coif', hatColor: '#f2ede2' }), [
      Z(2.8, 4.4, { at: S('oven'), act: 'shovel', label: 'Firing the bread oven', face: -1, tags: ['oven'] }),
      Z(4.4, 5.4, { at: S('trough'), act: 'workBench', label: 'Kneading and shaping loaves', face: 'in' }),
      Z(5.4, 6.8, { at: S('oven'), act: 'shovel', label: 'Loading loaves with the peel', face: -1, tags: ['oven'] }),
      Z(6.8, 9.6, { at: S('bake.oven'), act: 'shovel', label: 'Baking the second batch in the Bakehouse Tower', face: -1, tags: ['oven'] }),
      Z(9.8, 10.8, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 16.0, sleep(bedIn('Z07'), 'Asleep after dinner')),
      Z(16.0, 17.6, { at: S('bake.trough'), act: 'workBench', label: 'Setting dough to rise', face: 'in' }),
      Z(18.4, 2.8, sleep({ feet: A.beds.Z07 && A.beds.Z07[0] ? A.beds.Z07[0].feet : [15.5, 0.16, 0.6], heading: 0 }, 'Asleep by the oven')),
    ], [S('trough'), 'stand', 'In the bakehouse']);
  P('Alice Brewster', 'Brewster', 'Insists her ale is far better than the town’s.',
    woman('#6a7a4a', { hat: 'veil', hatColor: '#f2ede2', apron: '#e8e2d4', sleeves: 'short' }), [
      Z(5.4, 6.8, { at: S('brew.pan'), act: 'stand', label: 'Heating water in the pan', face: 'in' }),
      Z(6.8, 9.8, { at: S('brew.tun'), act: 'stir', label: 'Mashing the malt', face: 'in', tags: ['mash'] }),
      Z(9.8, 10.6, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 13.6, { at: S('brew.pan'), act: 'stir', label: 'Boiling the wort', face: 'in' }),
      Z(13.6, 15.6, { at: S('brew.trough'), act: 'stand', label: 'Cooling the wort, and tasting it', face: 'in' }),
      Z(15.6, 16.6, { at: S('cellE'), act: 'push', label: 'Rolling barrels to the cellar', face: 1 }),
      Z(16.6, 18.4, { at: S('brew.barrels'), act: 'workBench', label: 'Barrelling the ale', face: 'in' }),
      Z(20.6, 5.4, sleep(bedIn('Z24'))),
    ], [S('brew.trough'), 'stand', 'In the brewhouse']);
  P('Jordan Stabler', 'Groom', 'Can tell every horse by its hoofbeat.',
    man('#6a5a3a', '#4a3a2a', { hat: 'hood', hatColor: '#5a4a32' }), [
      Z(5.4, 6.8, { at: S('stable'), act: 'carry', prop: 'sack', label: 'Feeding the horses', face: 'in' }),
      Z(6.8, 7.6, { at: S('well.trough'), act: 'stand', label: 'Watering the horses', face: 1 }),
      Z(7.6, 9.8, { at: S('stable.b'), act: 'workBench', label: 'Grooming', face: 'in' }),
      Z(9.8, 10.8, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(12.6, 13.8, { at: 'ramp0', act: 'stand', label: 'Walking the messenger’s horse', face: 1 }),
      Z(13.8, 18.0, { at: S('stable.saddles'), act: 'workBench', label: 'Oiling saddles', face: 'in' }),
      Z(20.6, 5.4, sleep(bedIn('Z26'), 'Asleep in the hayloft')),
    ], [S('stable'), 'stand', 'In the stables']);
  P('Kit Hobbes', 'Stable boy (10)', 'Sleeps in the hayloft with the stable cat.',
    man('#9a8a62', '#6a5a42', { child: true, sleeves: 'short', hair: '#c8a060' }), [
      Z(5.4, 6.8, { at: S('stable.b'), act: 'shovel', label: 'Mucking out', face: 'in' }),
      Z(6.8, 7.8, { at: 'well', act: 'carry', prop: 'bucket', label: 'Carrying buckets from the well', face: 1 }),
      Z(9.8, 10.2, { at: S('kitchen.door'), act: 'sitEat', label: 'Eating in the kitchen doorway', face: 'out' }),
      Z(12.8, 13.8, sleep(bedIn('Z26'), 'Napping in the hay')),
      Z(13.8, 17.6, { at: S('stable.b'), act: 'shovel', label: 'Mucking out again', face: 'in' }),
      Z(20.2, 5.4, sleep({ feet: [54.0, 3.42, 25.3], heading: 0 }, 'Asleep in the hayloft with the cat')),
    ], [S('stable'), 'stand', 'In the stables']);
  P('Isabel Lavender', 'Laundress', 'Has a laugh you can hear from the turrets.',
    woman('#7a5a6a', { hat: 'kerchief', hatColor: '#f2ede2', apron: '#e8e2d4', sleeves: 'short' }), [
      Z(5.6, 6.8, { at: 'well', act: 'crank', label: 'Drawing water at the well', face: 1 }),
      Z(6.8, 10.2, { at: S('laundry'), act: 'scrub', label: 'Beating linen in the tubs', face: 'in', tags: ['bat'] }),
      Z(10.4, 11.2, sit(hallSeat('C'), 'Servants’ dinner', 'sitEat')),
      Z(11.6, 14.6, { at: S('garden.linen'), act: 'kneel', label: 'Spreading linen on the lawn to bleach', face: 'out' }),
      Z(14.6, 15.8, { at: S('laundry2'), act: 'talk', label: 'Laughing with the egg woman', face: 1 }),
      Z(15.8, 17.0, { at: S('sw2.mid'), act: 'carry', prop: 'basket', label: 'Returning folded linen', face: 1 }),
      Z(20.6, 5.6, sleep(bedIn('Z24'))),
    ], [S('laundry'), 'stand', 'By the laundry tubs']);
  P('Maud Lavender', 'Laundress, Isabel’s daughter', 'Writes letters home to her sister in Chester through the chaplain.',
    woman('#a88a5a', { hat: 'kerchief', hatColor: '#f2ede2', apron: '#e8e2d4', sleeves: 'short' }), [
      Z(5.6, 6.8, { at: 'od9', act: 'carry', prop: 'bucket', label: 'Carrying water', face: 1 }),
      Z(6.8, 10.2, { at: S('laundry2'), act: 'scrub', label: 'Wringing sheets', face: 'in', tags: ['bat'] }),
      Z(10.4, 11.2, sit(hallSeat('C'), 'Servants’ dinner', 'sitEat')),
      Z(11.6, 14.6, { at: 'gd.s', act: 'kneel', label: 'Laying out linen to bleach', face: 'out' }),
      Z(14.6, 16.2, { at: S('laundry'), act: 'scrub', label: 'Starching the chaplain’s alb', face: 'in' }),
      Z(20.6, 5.6, sleep(bedIn('Z24'))),
    ], [S('laundry'), 'stand', 'By the laundry tubs']);
  P('Hob Gardiner', 'Gardener', 'Talks to the bees.',
    man('#7a6a42', '#5a4a32', { hat: 'straw', hatColor: '#d8c080', sleeves: 'short' }), [
      Z(5.4, 7.2, { at: 'gd2', act: 'sweep', label: 'Scything the lawn while the dew is on it', face: 'out' }),
      Z(7.2, 9.6, { at: 'gd.beds', act: 'kneelPick', label: 'Weeding the herb beds', face: 'in' }),
      Z(9.8, 10.8, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 12.4, { at: 'gd.s', act: 'handsBehind', label: 'Frowning at linen on his lawn', face: 'out' }),
      Z(12.4, 14.6, { at: S('garden.skep'), act: 'talk', label: 'Talking to the bees', face: 1 }),
      Z(14.6, 17.6, { at: 'gd3', act: 'pour', prop: 'bucket', label: 'Watering the turf', face: 'out' }),
      Z(20.6, 5.4, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('garden.bench'), 'stand', 'In the garden']);
  P('Emmot Chaundeler', 'Candle-maker', 'Smells permanently of mutton fat.',
    woman('#7a6a52', { hat: 'coif', hatColor: '#e8e2d4', apron: '#c8b8a0' }), [
      Z(6.4, 8.6, { at: S('kitchen.table2'), act: 'stir', label: 'Rendering tallow in the kitchen', face: 'in' }),
      Z(8.6, 10.2, { at: S('candle'), act: 'workBench', label: 'Dipping tallow candles', face: 'in' }),
      Z(10.4, 11.2, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 14.6, { at: S('candle.rush'), act: 'sitWork', label: 'Peeling rushes for rushlights', face: 'out' }),
      Z(14.6, 17.0, { at: S('candle'), act: 'workBench', label: 'Dipping candles', face: 'in' }),
      Z(18.6, 20.4, { at: S('hall.mid'), act: 'stand', label: 'Setting out candles in the hall', face: 'in' }),
      Z(20.6, 6.4, sleep(bedIn('Z17'), 'Asleep in the great hall')),
    ], [S('candle'), 'stand', 'In the cellar']);
  P('Geoffrey Whitlimer', 'Limewasher', 'Leaves white handprints on everything.',
    man('#e8e4d8', '#9a9080', { sleeves: 'short', hat: 'coif', hatColor: '#f2ede2' }), [
      Z(5.6, 6.8, { at: S('lime'), act: 'stir', label: 'Mixing limewash', face: 'in' }),
      Z(6.8, 10.0, { at: 'bake3', act: 'scrub', label: 'Limewashing the Bakehouse Tower parapet', face: 'in' }),
      Z(10.2, 11.0, sit(hallSeat('C'), 'Dinner', 'sitEat')),
      Z(11.6, 17.2, { at: S('garden.wall'), act: 'scrub', label: 'Limewashing the garden wall, half done', face: 'in' }),
      Z(20.6, 5.6, sleep(bedIn('Z15'), 'Asleep in the lesser hall')),
    ], [S('lime'), 'stand', 'By the lime pit']);
  P('Jankin Tuppe', 'Prisoner', 'Held for a tavern brawl in the town; sings to keep his spirits up.',
    man('#d8ccb0', '#6a5a42', { sleeves: 'short', hair: '#5a3a22' }), [
      Z(7.6, 8.8, { at: S('pit'), act: 'kneel', label: 'Taking bread and water lowered on a rope', face: 'out' }),
      Z(8.8, 11.0, { at: S('pit'), act: 'sitTalk', label: 'Singing in the pit', face: 'out' }),
      Z(11.0, 11.4, { at: S('pit'), act: 'kneel', label: 'Catching a crust on a string', face: 'out' }),
      Z(11.4, 20.0, { at: S('pit'), act: 'sleepSit', label: 'Waiting in the dark', face: 'out' }),
      Z(20.0, 7.6, { at: [A.spots.pit[0] + 0.6, A.spots.pit[1] + 0.12, A.spots.pit[2]], act: 'lie', label: 'Asleep on the straw', face: 0 }),
    ], [S('pit'), 'sit', 'In the pit']);
  // --- Visitors -------------------------------------------------------------------------
  P('Iorwerth ap Cadwgan', 'Welsh bailiff (rhingyll), visiting', 'Counts every coin twice, out loud, in Welsh.',
    man('#4a6a5a', '#4a4a3a', { coat: 'long', coatColor: '#3a4a3a', beard: '#4a3a2a' }), [
      Z(7.8, 8.3, { at: 'gp1', act: 'talk', label: 'Arriving at the gate', face: -1 }),
      Z(8.3, 9.2, sit([A.seats.visitor.x, A.seats.visitor.y, A.seats.visitor.z], 'Paying the commote’s render to the clerk, coin by coin', 'sitTalk', -1)),
      Z(9.2, 9.9, { at: S('yard.porter'), act: 'drink', prop: 'mug', label: 'Tasting the castle ale, and pulling a face', face: 'out' }),
      Z(9.9, 7.8, Object.assign({ at: 't.far', act: 'stand' }, away('Gone home to his commote'))),
    ], ['t.far', 'stand', 'Away']);
  P('Gwenllian ferch Ithel', 'Welsh fishwife, visiting', 'Knows the tide tables of the river by heart.',
    woman('#5a6a7a', { hat: 'hood', hatColor: '#6a5a4a', apron: '#d8d0c0' }), [
      Z(6.6, 8.0, { at: 'dk1', act: 'carry', prop: 'basket', label: 'Selling fish at the dock', face: 'out' }),
      Z(8.0, 8.8, { at: 'gd0', act: 'talk', label: 'Haggling with the keeper of victuals', face: 1 }),
      Z(8.8, 9.4, { at: 'dk2', act: 'stand', label: 'Back to her boat', face: 1 }),
      Z(9.4, 6.6, Object.assign({ at: 'dk2', act: 'stand' }, away('Out on the river'))),
    ], ['dk2', 'stand', 'Away']);
  P('Hywel ap Dafydd', 'Boatman', 'His boat is older than he is.',
    man('#6a5a42', '#4a3a2a', { hat: 'hood', hatColor: '#4a5a4a', sleeves: 'short', beard: '#5a4a3a' }), [
      Z(7.8, 9.6, { at: 'dk0', act: 'carry', prop: 'box', label: 'Unloading barrels at the dock', face: -1 }),
      Z(9.6, 10.4, { at: 'dk3', act: 'sitEat', label: 'Eating on the dock', face: 'out' }),
      Z(10.4, 12.0, { at: 'dk0', act: 'carry', prop: 'box', label: 'More barrels', face: -1 }),
      Z(12.0, 7.8, Object.assign({ at: 'dk2', act: 'stand' }, away('Ferrying a merchant across the river'))),
    ], ['dk2', 'stand', 'Away']);
  P('Ralph Stannard', 'Burgess of Conwy', 'Has brought the same complaint three times.',
    man('#7a2a26', '#2a2a3a', { coat: 'long', coatColor: '#4a3a5a', hat: 'hood', hatColor: '#4a3a5a', beard: '#6a5a4a', build: 1.2 }), [
      Z(7.8, 8.2, { at: 'gp1', act: 'talk', label: 'Arriving at the gate', face: 1 }),
      Z(8.2, 9.0, { at: S('lesser.petition'), act: 'talk', label: 'Complaining to the mayor about a neighbour’s pig', face: 'in' }),
      Z(9.0, 9.4, { at: S('yard.porter'), act: 'talk', label: 'Gossiping with the porter', face: -1 }),
      Z(9.4, 12.4, { at: 'ale', act: 'sitDrink', label: 'At the alehouse, telling everyone', face: 'out', seat: 0.46 }),
      Z(12.4, 18.6, { at: 'stalls', act: 'talk', label: 'In the market', face: 'out' }),
      Z(18.6, 21.0, { at: 'h42', act: 'sitEat', label: 'Supper at home', face: 'out' }),
      Z(21.0, 6.0, sleep((A.beds.town || [])[0] || { feet: [-43, -2.3, 5], heading: 0 }, 'Asleep at home in the town')),
    ], ['h42', 'stand', 'At home']);
  P('Mabel Wyse', 'Townswoman selling eggs and cheese', 'Carries her eggs in a basket on her head.',
    woman('#8a6a3a', { hat: 'coif', hatColor: '#f2ede2', apron: '#e8e2d4' }), [
      Z(5.8, 6.4, { at: 'ramp1', act: 'carryHigh', prop: 'basket', label: 'Climbing the ramp with her eggs', face: 1 }),
      Z(6.4, 7.0, { at: S('kitchen.door'), act: 'talk', label: 'Selling eggs to the cook', face: 'in' }),
      Z(7.0, 7.8, { at: S('laundry2'), act: 'talk', label: 'Chatting with the laundresses', face: -1 }),
      Z(7.8, 15.0, { at: 'stalls', act: 'stand', label: 'Selling cheese in the square', face: 'out' }),
      Z(15.0, 20.4, { at: 'h34', act: 'stir', label: 'Cooking at home', face: 'in' }),
      Z(20.4, 5.8, sleep((A.beds.town || [])[2] || { feet: [-35, -2.3, 5], heading: 0 }, 'Asleep at home')),
    ], ['h34', 'stand', 'At home']);
  P('Thomas Wodeward', 'Royal messenger', 'Has ridden from Caernarfon and is soaked to the knees.',
    man('#2a3a6a', '#3a2a1e', { coat: 'long', coatColor: '#6a2a26', hat: 'hood', hatColor: '#6a2a26' }), [
      Z(10.8, 11.2, { at: 'gp1', act: 'talk', label: 'Riding in with letters', face: 1 }),
      Z(11.2, 11.6, { at: S('small.stand'), act: 'read', prop: 'paper', label: 'Handing letters to the clerk', face: 'in' }),
      Z(11.6, 12.4, sit(hallSeat('A'), 'A late dinner', 'sitEat')),
      Z(12.4, 12.9, { at: S('stable'), act: 'talk', label: 'Changing horses', face: 'in' }),
      Z(12.9, 10.8, Object.assign({ at: 't.far', act: 'stand' }, away('Riding on with letters'))),
    ], ['t.far', 'stand', 'Away']);
  P('Nest ferch Hywel', 'Welsh dairywoman, visiting', 'Wears a bright green hood her mother dyed.',
    woman('#7a6a4a', { hat: 'hood', hatColor: '#3a8a3a', apron: '#e8e2d4' }), [
      Z(6.8, 7.3, { at: 'ramp1', act: 'carry', prop: 'basket', label: 'Arriving with butter', face: 1 }),
      Z(7.3, 7.9, { at: S('kitchen.door'), act: 'talk', label: 'Selling butter to the cook', face: 'in' }),
      Z(7.9, 8.2, { at: 'well', act: 'drink', prop: 'mug', label: 'A drink from the well bucket', face: 1 }),
      Z(8.2, 6.8, Object.assign({ at: 't.far', act: 'stand' }, away('Gone home over the hills'))),
    ], ['t.far', 'stand', 'Away']);

  // --- Extras: the rest of the garrison, the townsfolk, boat crews ------------------------
  for (let i = 0; i < 5; i++) {
    const bz = i === 4 ? 'Z17' : i % 2 ? 'Z33' : 'Z34';
    const b = bedIn(bz);
    const watchNode = ['wb0', 'wc0', 'xw2', 'gw3', 'ew2'][i];
    W.addPerson({
      name: null, costume: Object.assign(xbow(xs[i]), { skin: SKIN[i], hair: HAIR[i + 2] }),
      routine: [
        { at: S('drill'), act: i % 2 ? 'point' : 'stand', when: [7.0, 8.4], dur: [5, 9], face: 1, label: 'Crossbow drill' },
        { at: watchNode, act: 'handsBehind', prop: 'cane', when: i < 2 ? [8.4, 9.9] : [12.0, 17.0], dur: [5, 9], face: 'out', label: 'On watch' },
        { at: hallSeat('B'), act: 'sitEat', when: [9.9, 11.0], dur: [5, 9], face: 'in', label: 'Dinner' },
        { at: i % 2 ? 'bake2' : 'st2', act: 'sitTalk', when: i < 2 ? [11.0, 17.2] : [8.4, 9.9], dur: [5, 9], face: 'out', label: 'Off duty' },
        { at: hallSeat('B'), act: 'sitEat', when: [17.4, 18.4], dur: [5, 9], face: 'in', label: 'Supper' },
        { at: S('guard'), act: 'sitTalk', when: [18.4, 20.4], dur: [5, 9], face: 'out', label: 'Talking in the guard room' },
        { at: b.feet, act: 'lie', when: [20.4, 7.0], dur: [5, 9], face: b.heading, label: 'Asleep' },
      ],
      at: b.feet, face: 'out',
    });
    settle(W.people[W.people.length - 1]);
  }
  // A household servant airing a royal hanging at the king's chamber window (H13), then other chores.
  W.addPerson({ costume: woman('#6a5a7a', { hat: 'veil', hatColor: '#f2ede2', apron: '#e8e2d4', skin: SKIN[1] }), at: S('kchamber.window'), act: 'wave', face: 'in', routine: [
    { at: S('kchamber.window'), act: 'wave', when: [8.5, 10.5], dur: [6, 10], face: 'in', label: 'Shaking the dust out of a hanging at the window' },
    { at: S('khall'), act: 'sweep', when: [10.5, 12.0], dur: [6, 10], face: 'out', label: 'Sweeping the king\u2019s hall' },
    { at: S('royal.0'), act: 'workBench', when: [12.0, 17.0], dur: [6, 10], face: 'in', label: 'Folding spare hangings' },
    { at: S('kt.2'), act: 'sitWork', when: [17.0, 21.0], dur: [6, 10], face: 'out', label: 'Mending by the fire' },
    { at: bedIn('Z24').feet, act: 'lie', when: [21.0, 8.5], dur: [6, 10], face: 0, label: 'Asleep' },
  ] });
  settle(W.people[W.people.length - 1]);
  // Townsfolk in Castle Square, the street and the alehouse.
  const R = W.R;
  const townCos = (i) => (i % 3 === 0
    ? woman(['#8a5a3a', '#6a7a4a', '#7a6a5a', '#5a6a8a', '#a8603a'][i % 5], { hat: ['veil', 'kerchief', 'coif', 'wimple'][i % 4], hatColor: '#f2ede2', apron: i % 2 ? '#e8e2d4' : null, skin: SKIN[i % 6] })
    : man(['#7a5a3a', '#5a6a4a', '#6a4a3a', '#8a7a5a', '#4a5a6a', '#9a4a32'][i % 6], ['#3a3a2e', '#4a3a2a', '#2a2a3a'][i % 3], { hat: ['hood', 'coif', 'straw', null, 'hood'][i % 5], hatColor: ['#6a5a3a', '#f2ede2', '#d8c080', null, '#4a5a3a'][i % 5], skin: SKIN[(i + 2) % 6], hair: HAIR[i % 8], beard: i % 4 === 1 ? HAIR[(i + 3) % 8] : null, child: i % 11 === 5 }));
  const townSpots = [];
  for (let i = 0; i < 20; i++) townSpots.push([-24 + R() * 16, T, 1.5 + R() * 9.0]);
  for (let i = 0; i < 14; i++) townSpots.push([-24 + R() * 14, T, 19.5 + R() * 9.0]);
  for (let i = 0; i < 10; i++) townSpots.push([-62 + R() * 34, T, 8.0 + R() * 1.6]);
  townSpots.forEach((p, i) => {
    const acts = ['talk', 'stand', 'carry', 'talk', 'point', 'handsBehind', 'drink', 'stand'];
    const act = acts[i % acts.length];
    const prop = act === 'carry' ? ['basket', 'sack', 'bucket'][i % 3] : act === 'drink' ? 'mug' : null;
    const wander = i % 3 === 0;
    W.addPerson({
      costume: townCos(i), at: p, act, prop, face: i % 2 ? 'out' : (i % 4 === 0 ? 1 : -1),
      routine: wander ? [
        { at: p, act, prop, when: [6, 20], dur: [8, 20], face: 'out' },
        { at: ['t.sq', 't.w', 'stalls', 'stalls2', 't.sq2'][i % 5], act: 'talk', when: [6, 20], dur: [8, 16], face: 'out' },
        { at: 't.far', act: 'stand', when: [20, 6], dur: [10, 20], face: 'out', away: true },
      ] : null,
      update: wander ? awayUpdate : (pp) => { const h = W.hour; pp.hidden = h < 5.6 || h > 20.8; },
    });
    if (wander) settle(W.people[W.people.length - 1]);
  });
  // Porters and a fisherman on the castle dock; fishermen and a carter on the far bank.
  const quay = [
    [{ at: 'dk1', act: 'carry', prop: 'box' }, man('#7a6a4a', '#4a3a2a', { hat: 'hood', hatColor: '#5a4a3a', sleeves: 'short' })],
    [{ at: 'dk3', act: 'haul' }, man('#5a5a4a', '#3a3a2e', { hat: 'coif', hatColor: '#e8e2d4' })],
    [{ at: [124.8, DOCK.y, 31.6], act: 'sitWork' }, man('#6a7a8a', '#3a3a3a', { hat: 'straw', hatColor: '#d8c080' })],
  ];
  for (const [d, cos] of quay) W.addPerson({ costume: Object.assign(cos, { skin: SKIN[(W.people.length) % 6] }), at: d.at, act: d.act, prop: d.prop, face: 'out', update: (pp) => { const h = W.hour; pp.hidden = h < 5.5 || h > 20.5; } });
  for (let i = 0; i < 6; i++) {
    const x = 182 + (i % 3) * 3.5 + R() * 2, z = 40 + i * 9 + R() * 3;
    W.addPerson({ costume: townCos(i + 20), at: [x, groundH(x, z), z], act: ['stand', 'haul', 'point', 'stand', 'talk', 'carry'][i], prop: i === 5 ? 'basket' : null, face: i % 2 ? -1 : 'out', update: (pp) => { const h = W.hour; pp.hidden = h < 5.5 || h > 20.5; } });
  }
  // Children playing in the square.
  for (let i = 0; i < 4; i++) W.addPerson({ costume: Object.assign(townCos(i + 30), { child: true }), at: [-12 - i * 1.4, T, 16.6 + (i % 2) * 1.2], act: i % 2 ? 'run' : 'dance', face: i % 2 ? 1 : -1, update: (pp) => { const h = W.hour; pp.hidden = h < 7 || h > 19.5; } });
  // Families in the cut-open houses.
  const homes = [[-41.0, 'house-42', 'houseB-42'], [-33.0, 'house-33.8', 'houseB-33.8']];
  homes.forEach(([hx, a, b2], i) => {
    W.addPerson({ costume: townCos(3 * i), at: A.spots[a], act: 'stir', face: 'in', routine: [
      { at: A.spots[a], act: 'stir', when: [5, 21], dur: [8, 14], face: 'in', label: 'Cooking at the hearth' },
      { at: (A.beds.town || [])[1 + i * 2] ? A.beds.town[1 + i * 2].feet : A.spots[a], act: 'lie', when: [21, 5], dur: [10, 20], face: 0, label: 'Asleep' },
    ] });
    settle(W.people[W.people.length - 1]);
    W.addPerson({ costume: Object.assign(townCos(3 * i + 1), { child: true }), at: A.spots[b2], act: 'sitEat', face: 'out' });
    void hx;
  });
  // Drinkers at the alehouse.
  W.addPerson({ costume: townCos(4), at: A.spots.alehouse, act: 'sitDrink', face: 'out' });
  W.addPerson({ costume: townCos(7), at: A.spots.alehouse2, act: 'sitTalk', face: 'out' });
  return people;
}
void XS;
