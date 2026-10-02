/* The Car Factory: the navigation graph, the named cast (all fictional) and the crowds.
 * Hours are those S1 recorded at Highland Park in March 1914 (dossier 4.3), assumed to hold
 * in November. Day shift 6:30 to 3:00 with lunch at 10:30; second shift 3:30 to 11:40;
 * women 7:30 to 4:45; foundry shifts 6:30, 2:30 and 10:30; some trades round the clock.
 */
import { XS, anims } from '../../engine/index.js';
import { X, H, N, LINE, SAW } from './common.js';
import { ST, RAIL_Y } from './bldgH.js';
import { JR, NL } from './east.js';
import { MONO } from './west.js';
import { HOURS } from './machines.js';

const A = anims.table;
const { sin } = Math;
// Extra animations: a pit man working overhead, a moulder ramming sand, a sprayer.
anims.register('overhead', (p, t, P) => { A.stand(p, t, P); const s = sin(t * 3.1 + p.ph); P.uaF = -2.7 + s * 0.15; P.faF = 0.3 + s * 0.3; P.uaB = -2.5; P.faB = 0.5; P.head = -0.45; P.lean = -0.05; return P; });
anims.register('ram', (p, t, P) => { A.stand(p, t, P); const c = (t * 1.6 + p.ph) % 1, d = c < 0.3 ? c / 0.3 : 1 - (c - 0.3) / 0.7; P.lean = 0.25 + d * 0.1; P.uaF = -0.9 - d * 0.6; P.faF = 0.9; P.uaB = -0.8 - d * 0.6; P.faB = 0.8; P.prop = 'cane'; P.propAng = Math.PI; P.head = 0.4; return P; });
anims.register('spray', (p, t, P) => { A.stand(p, t, P); const s = sin(t * 1.2 + p.ph); P.uaF = -1.45 + s * 0.2; P.faF = 0.2; P.uaB = -0.9; P.faB = 0.9; P.lean = 0.1; P.prop = 'jug'; P.propAng = 1.6; P.head = 0.1 + s * 0.05; return P; });
anims.register('inspect', (p, t, P) => { A.stand(p, t, P); const c = (t * 0.3 + p.ph) % 1; P.lean = c < 0.5 ? 0.45 : 0.1; P.head = c < 0.5 ? 0.5 : 0.1; P.uaF = -0.6; P.faF = 1.4; P.uaB = 0.2; P.faB = 0.4; return P; });

// ------------------------------------------------------------------ costume palettes
const SKIN = ['#f1c9a5', '#e6b48f', '#d9a27a', '#c88c62'];
const SKIN_DARK = ['#8a5634', '#6b4026'];
const SHIRT = ['#d8d0bc', '#c8c0a8', '#9a9688', '#5a6a7a', '#6a5a4a', '#e2dccc', '#7a7a70'];
const TROUSER = ['#2a2a33', '#3a3a3a', '#4a3a2a', '#33302c', '#2e3440'];
const CAP = ['#3a3a3a', '#4a4038', '#5a5048', '#2a2a2a', '#6a6050'];
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
export function man(r, o = {}) {
  const c = { skin: pick(r, SKIN), hair: pick(r, ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#9a9a9a']), hairStyle: 'short', top: pick(r, SHIRT), bottom: pick(r, TROUSER), shoes: '#2a1e18', hat: 'flat', hatColor: pick(r, CAP) };
  if (r() < 0.3) { c.coat = 'jacket'; c.coatColor = pick(r, ['#3a3a40', '#4a4036', '#2e2e34']); }
  if (r() < 0.2) c.beard = pick(r, ['#3a2a1e', '#5a4030', '#7a7a70']);
  return Object.assign(c, o);
}
const woman = (r, o = {}) => Object.assign({ skin: pick(r, SKIN), hair: pick(r, ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c']), hairStyle: 'bun', top: '#f2ece0', dress: 'long', dressColor: pick(r, ['#2a2a33', '#3a2e2a', '#2e3440', '#3a3a40']), shoes: '#2a1e18' }, o);
const apron = (r, o) => man(r, Object.assign({ apron: pick(r, ['#ece6d8', '#e2dccc', '#c8b896']) }, o));

// ------------------------------------------------------------------ navigation
export const GATES = { P: 'gateP', F: 'gateF', M: 'gateM', H: 'gateH', N: 'gateN' };
export function buildNav(W) {
  const nav = W.nav;
  // Ground floor: one long aisle through every building, jogging round obstacles.
  const g = (id, x, z, y = 0) => nav.node(id, x, y, z);
  const spine = [
    g('wood', 4, 6), g('p0', 9.5, 2.6), g('p1', 34.5, 2.6),
    g('f0', 37, 5.3), g('f1', 60, 5.3), g('f2', 82, 5.3), g('f3', 105, 5.3),
    g('t0', 107, 5.8), g('t1', 115, 5.8),
    g('m0', 117, 4.0), g('m1', 128, 4.0), g('m2', 139, 5.0), g('m3', 151, 5.0), g('m4', 159, 5.0), g('m5', 170, 6.6), g('m6', 180, 6.6), g('m7', 187.4, 6.6), g('m8', 187.4, 15.6), g('m9', 196.6, 15.6),
    g('h0', 197.4, 6.6), g('h1', 205, 6.6), g('h2', 220, 6.6), g('h3', 235, 6.6), g('h4', 250, 6.6), g('h5', 265, 6.6), g('h6', 280, 6.6), g('h7', 296, 6.6),
  ];
  nav.chain(spine);
  nav.link('m9', 'h0');
  // H: second aisle, door D, the pit.
  nav.chain([g('hb0', 199, 12.7), g('hb1', 230, 12.7), g('hb2', 262, 12.7), g('hb3', 296, 12.7)]);
  nav.link('h0', 'hb0'); nav.link('h3', 'hb1'); nav.link('h5', 'hb2'); nav.link('h7', 'hb3');
  g('doorD', 297.4, 3.05);
  nav.link('h7', 'doorD');
  g('pitTop', 269.0, 3.05); g('pit', 265.0, 3.05, -1.5);
  nav.link('h5', 'pitTop'); nav.link('pitTop', 'pit', 'stairs');
  g('pit2Top', 269.0, 9.15); g('pit2', 265.0, 9.15, -1.5);
  nav.link('h5', 'pit2Top'); nav.link('pit2Top', 'pit2', 'stairs');
  // Tank bridge.
  g('tankFoot', ST.tank + 1.9, 17.9); g('tank', ST.tank + 1.2, 17.0, 2.6); g('tank1', ST.tank, 2.2, 2.6); g('tank2', ST.tank, 8.3, 2.6);
  nav.link('hb0', 'tankFoot'); nav.link('tankFoot', 'tank', 'ladder'); nav.chain(['tank', 'tank2', 'tank1']);
  // John R Street.
  nav.chain(['doorD', g('j0', 300.5, 5.6), g('j1', 310, 5.6), g('j2', 320, 5.6), g('j3', 329.4, 5.6)]);
  g('jn', 314, 30); nav.link('j1', 'jn');
  // New building: ground aisle, time clocks.
  nav.chain(['j3', g('n0', 331, 10.4), g('n1', 350, 10.4), g('n2', 370, 10.4), g('n3', 396, 10.4)]);
  // Gates (people come and go by the Manchester Avenue side, at the cut).
  g('gateP', 14, 0.7); nav.link('p0', 'gateP');
  g('gateF', 55, 0.7); nav.link('f1', 'gateF');
  g('gateM', 186.4, 0.6); nav.link('m7', 'gateM');
  g('gateH', 231, 0.7); nav.link('h3', 'gateH');
  g('gateN', 334.2, 0.6); nav.link('n0', 'gateN');
  // Power house: walkway, basement, construction floor.
  g('phWalk', 12, 7.2, 2.8); g('phWalkFoot', 19.6, 7.9); nav.link('p1', 'phWalkFoot'); nav.link('phWalkFoot', 'phWalk', 'ladder');
  g('phBase', 34.4, 17.6, -4.5); g('phBaseTop', 34.0, 17.4); nav.link('p1', 'phBaseTop'); nav.link('phBaseTop', 'phBase', 'ladder');
  g('phBase2', 18, 16.6, -4.5); nav.link('phBase', 'phBase2');
  g('phSwitch', 31, 17.0); nav.link('p1', 'phSwitch');
  g('phDesk', 26.4, 17.9); nav.link('phSwitch', 'phDesk');
  g('con0', 9.5, 3, 14.55); g('con1', 22, 3, 14.55); g('con2', 30, 3, 14.55); nav.chain(['con0', 'con1', 'con2']);
  nav.link('p0', 'con0', 'ladder');
  // Foundry: charging stage, pattern room, cupola floor.
  g('stageFoot', 57.4, 11.2); g('stageTop', 50.4, 11.2, 6.5); g('stage0', 48, 4.5, 6.5); g('stage1', 39, 4.5, 6.5);
  nav.link('f1', 'stageFoot'); nav.link('stageFoot', 'stageTop', 'stairs'); nav.chain(['stageTop', 'stage0', 'stage1']);
  g('patFoot', 59.3, 13.8); g('pat', 57, 14.5, 4.1); nav.link('f1', 'patFoot'); nav.link('patFoot', 'pat', 'ladder');
  g('cupFloor', 47.6, 2.6); nav.link('f0', 'cupFloor');
  // Machine-shop office: stairs up to first aid and the classroom.
  g('offStair', 195.7, 8.65); g('offTop', 190.0, 8.65, SHOP_Y); g('offUp', 190.6, 6.6, SHOP_Y); g('aid', 190.2, 4.0, SHOP_Y); g('class', 193.6, 5.6, SHOP_Y);
  nav.link('m8', 'offStair'); nav.link('offStair', 'offTop', 'stairs'); nav.chain(['offTop', 'offUp', 'aid']); nav.link('offUp', 'class');
  g('office', 191.0, 3.6); nav.link('gateM', 'office');
  // H upper floors: stairs at the west end, an aisle on each floor.
  for (let f = 0; f < H.y.length; f++) {
    const y = H.y[f];
    if (f > 0) nav.chain([g('h' + f + 'a', 204, 5.6, y), g('h' + f + 'b', 220, 5.6, y), g('h' + f + 'c', 240, 5.6, y), g('h' + f + 'd', 262, 5.6, y), g('h' + f + 'e', 290, 5.6, y)]);
    if (f < H.y.length - 1) {
      g('hs' + f, 197.6, 19.8, y);
      g('hst' + f, 203.8, 19.8, H.y[f + 1]);
      nav.link('hs' + f, 'hst' + f, 'stairs');
    }
    if (f > 0) { g('hl' + f, 204, 19.8, y); nav.link('hst' + (f - 1), 'hl' + f); nav.link('hl' + f, 'h' + f + 'a'); if (f < H.y.length - 1) nav.link('hl' + f, 'hs' + f); }
  }
  nav.link('hb0', 'hs0');
  // N upper floors: stairs at the west end, the elevator at the east end.
  const AZ = [10.4, 4.6, 5.4, 5.4, 4.95, 5.4];
  for (let f = 0; f < N.y.length; f++) {
    const y = N.y[f];
    if (f > 0) nav.chain([g('n' + f + 'a', 350.8, AZ[f], y), g('n' + f + 'b', 362, AZ[f], y), g('n' + f + 'c', 376, AZ[f], y), g('n' + f + 'd', 390, AZ[f], y), g('n' + f + 'e', 396, AZ[f], y)]);
    g('nlift' + f, NL.lift.x, NL.lift.z, y);
    if (f > 0) { nav.link('nlift' + f, 'n' + f + 'e'); nav.link('nlift' + (f - 1), 'nlift' + f, 'lift'); }
    if (f < N.y.length - 1) { g('ns' + f, 331.3, 11.15, y); g('nst' + f, 337.8, 11.15, N.y[f + 1]); nav.link('ns' + f, 'nst' + f, 'stairs'); }
    if (f > 0) { g('nl' + f, 350.8, 11.15, y); nav.link('nst' + (f - 1), 'nl' + f); nav.link('nl' + f, 'n' + f + 'a'); if (f < N.y.length - 1) { g('nw' + f, 331.3, 11.15 - 0.01, y); nav.link('nl' + f, 'nw' + f); nav.link('nw' + f, 'ns' + f); } }
  }
  nav.link('n0', 'ns0'); nav.link('n3', 'nlift0');
  // The bridge and the chute-top platform.
  g('n2w', 331.5, 5.4, N.y[2]); nav.link('n2w', 'n2a');
  nav.chain(['n2w', g('br0', 328.6, 7.0, N.y[2]), g('br1', 315, 7.0, N.y[2]), g('chuteTop', 313.6, 3.0, N.y[2])]);
  // Craneway landing stage used by the stage hands.
  for (const f of [2, 3]) { g('land' + f, 338.1, N.cw0 + 1.0, N.y[f]); nav.link('n' + f + 'a', 'land' + f); }
  return nav;
}
const SHOP_Y = 3.3;

// ------------------------------------------------------------------ helpers
const face = (f) => XS.faceToHeading(f);
// Put a person straight into the step that fits the current hour (no long walk at load).
function settle(W, p) {
  if (!p.routine) return p;
  const h = W.hour;
  let i = p.routine.findIndex((s) => !s.when || XS.math.inHours(h, s.when[0], s.when[1]));
  if (i < 0) i = 0;
  const st = p.routine[i];
  const at = W.resolve(st.at);
  p.x = at.x; p.y = at.y; p.z = at.z;
  p.step = i; p.stepT = 0; p.stepDur = Array.isArray(st.dur) ? st.dur[1] : st.dur || 30;
  p.moving = false; p.anim = st.act || 'stand'; p.prop = st.prop || null; p.seat = st.seat != null ? st.seat : null;
  if (st.face != null) p.heading = p.targetHeading = face(st.face);
  p.node = typeof st.at === 'string' && W.nav.get(st.at) ? st.at : null;
  p.hidden = !!st.off;
  return p;
}
const hideOff = (p) => { const st = p.routine && p.routine[p.step]; p.hidden = !!(st && st.off && !p.moving); };

// Shift patterns: lists of [from, to, kind] windows covering 24 hours.
const SHIFTS = {
  day: [[6.5, 10.5, 'w'], [10.5, 11, 'l'], [11, 15, 'w'], [15, 6.5, 'o']],
  second: [[15.5, 19.5, 'w'], [19.5, 19.67, 'l'], [19.67, 23.67, 'w'], [23.67, 15.5, 'o']],
  women: [[7.5, 12, 'w'], [12, 12.75, 'l'], [12.75, 16.75, 'w'], [16.75, 7.5, 'o']],
  f1: [[6.5, 14.5, 'w'], [14.5, 6.5, 'o']],
  f2: [[14.5, 22.5, 'w'], [22.5, 14.5, 'o']],
  f3: [[22.5, 6.5, 'w'], [6.5, 22.5, 'o']],
  three: [[0, 4, 'w'], [4, 4.17, 'l'], [4.17, 24, 'w']],
  office: [[8.25, 12, 'w'], [12, 13, 'l'], [13, 17.25, 'w'], [17.25, 8.25, 'o']],
};
// An extra who works a shift at one spot: [x, y, z, act, face, prop, label].
function worker(W, r, spot, shift, gate, cos, label) {
  const [x, y, z, act, f, prop] = spot;
  const routine = [];
  for (const [a, b, kind] of SHIFTS[shift]) {
    if (kind === 'w') routine.push({ at: [x, y, z], act, face: f, prop: prop || null, dur: [40, 90], when: [a, b], label: label || spot[6] });
    else if (kind === 'l') routine.push({ at: [x + (r() - 0.5) * 0.6, y, z + (z > 2 ? 0.4 : 0.2)], act: r() < 0.5 ? 'drink' : 'talk', face: 'out', prop: 'mug', dur: [20, 30], when: [a, b], label: 'Lunch at the work place' });
    else routine.push({ at: gate, act: 'stand', dur: 200, when: [a, b], off: true, label: 'Gone home' });
  }
  return settle(W, W.addPerson({ costume: cos, routine, update: hideOff }));
}

// ------------------------------------------------------------------ the cast
export function buildPeople(W, k) {
  buildNav(W);
  const r = k.rng('people');
  const D = W.data;
  const add = (def) => settle(W, W.addPerson(Object.assign({ update: hideOff }, def)));
  const off = (gate, when, label = 'Gone home') => ({ at: gate, act: 'stand', dur: 200, when, off: true, label });
  const L1 = H.lines[0], L2 = H.lines[1];
  const back = (z) => z + 1.2, front = (z) => z - 1.2;

  // ---- Building H, the chassis lines
  add({ name: 'Stanisław Wróbel', role: 'Chassis assembler, operation 10 (placing the motor)', bio: 'Sends money home to Galicia every second Saturday.',
    costume: man(r, { top: '#c8c0a8', apron: '#c8b896', hatColor: '#4a4038' }), routine: [
      { at: [ST.engine - 0.6, 0, back(L1)], act: 'workBench', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Guiding a motor down onto a frame with his partner' },
      { at: [ST.engine + 1.2, 0, 6.2], act: 'sitEat', seat: 0.4, face: 'out', dur: 40, when: [10.5, 11], label: 'Bread and sausage on a crate by the line' },
      { at: [ST.engine - 0.6, 0, back(L1)], act: 'workBench', face: 'out', dur: [60, 90], when: [11, 15], label: 'Guiding motors onto frames' },
      off(GATES.H, [15, 6.5], 'Gone home to his boarding house'),
    ] });
  add({ name: 'Antal Kovács', role: 'Pit man, operation 41', bio: 'Counts aloud in Hungarian to keep time with the chain.',
    costume: man(r, { top: '#4a4a52', bottom: '#4a4a52', hatColor: '#2a2a2a' }), routine: [
      { at: 'pit', act: 'overhead', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'In the pit under the chassis, capping the radius-rod globe' },
      { at: 'pitTop', act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Out of the pit, stiff in the knees, for lunch' },
      { at: 'pit', act: 'overhead', face: 'out', dur: [60, 90], when: [11, 15], label: 'Back in the pit, chassis after chassis' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Giuseppe Ferraro', role: 'Gasoline-tank bridge, operation 7½', bio: 'Pours a gallon into every tank. Has never driven a car.',
    costume: man(r, { top: '#9a9688', hatColor: '#3a3a3a', beard: '#3a2a1e' }), routine: [
      { at: 'tank1', act: 'pour', prop: 'jug', face: 'out', dur: [50, 70], when: [6.5, 10.5], label: 'One gallon of gasoline into each tank' },
      { at: [ST.tank - 1.0, 2.6, 1.6], act: 'workBench', face: -1, dur: 15, when: [6.5, 10.5], label: 'Refilling his can from the drum' },
      { at: [ST.tank + 1.2, 2.6, 10.5], act: 'sitEat', seat: 0.3, face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch on the platform' },
      { at: 'tank1', act: 'pour', prop: 'jug', face: 'out', dur: [50, 70], when: [11, 15], label: 'One gallon into each tank' },
      { at: [ST.tank - 1.0, 2.6, 1.6], act: 'workBench', face: -1, dur: 15, when: [11, 15], label: 'Refilling his can from the drum' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Ion Popescu', role: 'Wheel man, operation 33', bio: 'Learning his English words from the notices in six languages.',
    costume: man(r, { top: '#5a6a7a', hatColor: '#5a5048' }), routine: [
      { at: [ST.wheels + 0.3, 0, back(L1)], act: 'crank', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Catching wheels off the chute and spinning on the nuts' },
      { at: [ST.wheels + 1.5, 0, 6.2], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [ST.wheels + 0.3, 0, back(L1)], act: 'crank', face: 'out', dur: [60, 90], when: [11, 15], label: 'Putting on wheels and nuts' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Dragan Petrović', role: 'Radiator setter, operation 38', bio: 'Whistles the same Serbian song all day.',
    costume: man(r, { top: '#d8d0bc', hatColor: '#2a2a2a' }), routine: [
      { at: [ST.radiator - 0.6, 0.55, back(L1) + 0.15], act: 'carry', prop: 'box', face: 'out', dur: [50, 80], when: [6.5, 10.5], label: 'Lifting radiators onto the frames' },
      { at: [ST.radiator - 1.8, 0.55, back(L1) + 0.3], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [ST.radiator - 0.6, 0.55, back(L1) + 0.15], act: 'carry', prop: 'box', face: 'out', dur: [50, 80], when: [11, 15], label: 'Setting radiators' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Ivan Horvat', role: 'Final inspector, operation 43', bio: 'Proud of his eyes: spots a missing split pin at three paces.',
    costume: man(r, { coat: 'jacket', coatColor: '#3a3a40', hatColor: '#3a3a3a' }), routine: [
      { at: [ST.end + 0.6, 0, front(L1)], act: 'inspect', face: 'in', dur: [25, 35], when: [6.5, 15], label: 'Walking round each chassis, tagging defects' },
      { at: [ST.end + 0.6, 0, back(L1) + 0.2], act: 'inspect', face: 'out', dur: [25, 35], when: [6.5, 15], label: 'Checking the far side' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Wilhelm Brandt', role: 'Straw boss, line 2', bio: 'Since the appeal rule came in, he thinks twice before firing anyone.',
    costume: man(r, { top: '#e2dccc', bottom: '#3a3a3a', hat: 'flat', hatColor: '#4a4038' }), routine: [
      { at: [214, 0, front(L2) - 0.3], act: 'handsBehind', face: 'in', dur: [20, 30], when: [6.5, 15], label: 'Walking the line' },
      { at: [236, 0, front(L2) - 0.3], act: 'point', face: 'in', dur: [15, 25], when: [6.5, 15], label: 'Watching a slow new man' },
      { at: [252, 0, front(L2) - 0.3], act: 'read', prop: 'book', face: 'out', dur: [15, 20], when: [6.5, 15], label: 'Scribbling in his notebook' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Patrick Doyle', role: 'Job foreman, chassis lines', bio: 'Built carriages before he built cars.',
    costume: man(r, { coat: 'jacket', coatColor: '#2e2e34', hat: 'bowler', hatColor: '#1e1e22', top: '#e8e2d4', beard: '#8a7a6a' }), routine: [
      { at: 'h1', act: 'handsBehind', face: 'out', dur: [20, 30], when: [6.4, 15.2], label: 'Making sure the chain is running' },
      { at: 'h3', act: 'point', face: 'in', dur: [20, 30], when: [6.4, 15.2], label: 'Walking the lines' },
      { at: [292, 0, 5.2], act: 'handsBehind', face: 1, dur: [30, 40], when: [6.4, 15.2], label: 'At door D, watching the cars go out' },
      { at: [240, 0, 6.6], act: 'talk', face: -1, dur: 30, when: [11.4, 11.9], label: 'Arguing with the shortage chaser about wheels' },
      off(GATES.H, [15.2, 6.4]),
    ] });
  // Harold Pike is driven by the cars themselves (see below).
  add({ name: 'Moishe Levin', role: 'Record checker, operation 35', bio: 'Studies bookkeeping at night school.',
    costume: man(r, { coat: 'jacket', coatColor: '#3a3a40', top: '#e8e2d4', hatColor: '#3a3a3a' }), routine: [
      { at: [252.5, 0, front(L1)], act: 'read', prop: 'clipboard', face: 'in', dur: [50, 80], when: [6.5, 11.5], label: 'Copying chassis and car numbers into the record book' },
      { at: [200, 0, 10.4], act: 'read', prop: 'clipboard', face: -1, dur: 25, when: [11.5, 11.75], label: 'Taking his sheets to the clearing house' },
      { at: [252.5, 0, front(L1)], act: 'read', prop: 'clipboard', face: 'in', dur: [50, 80], when: [11.75, 15], label: 'Taking down numbers' },
      off(GATES.H, [15, 6.5]),
    ] });
  // ---- John R Street
  add({ name: 'Nikola Dimitrov', role: 'Lever man at the body chute', bio: 'Keeps a lucky horseshoe nail in his waistcoat.',
    costume: man(r, { top: '#9a9688', coat: 'jacket', coatColor: '#4a4036', hatColor: '#2a2a2a' }), routine: [
      { at: [JR.chuteTop[0] + 0.8, N.y[2], 2.0], act: 'crank', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Working the belt lever as each body is launched' },
      { at: [315, N.y[2], 6.8], act: 'sitEat', seat: 0.4, face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch in the bridge' },
      { at: [JR.chuteTop[0] + 0.8, N.y[2], 2.0], act: 'crank', face: 'out', dur: [60, 90], when: [11, 15], label: 'At the lever' },
      off(GATES.N, [15, 6.5]),
    ] });
  add({ name: 'Andrija Babić', role: 'Sling man under the gallows frame', bio: 'The cold gets into his hands by the afternoon.',
    costume: man(r, { top: '#6a5a4a', coat: 'jacket', coatColor: '#3a3a40', hatColor: '#4a4038' }), routine: [
      { at: [JR.gallows - 1.0, 0, 1.3], act: 'haul', face: 'in', dur: [60, 90], when: [6.5, 10.5], label: 'Hooking the slings onto each body' },
      { at: [JR.gallows - 2.5, 0, 6.0], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Warming his hands on his coffee' },
      { at: [JR.gallows - 1.0, 0, 1.3], act: 'haul', face: 'in', dur: [60, 90], when: [11, 15], label: 'Guiding bodies down onto the chassis' },
      off(GATES.H, [15, 6.5]),
    ] });
  add({ name: 'Gaspar Sánchez', role: 'Rear-axle tester at the idlers', bio: 'Came north from Texas by train.',
    costume: man(r, { skin: '#c88c62', top: '#5a6a7a', coat: 'jacket', coatColor: '#4a4036', hatColor: '#5a5048' }), routine: [
      { at: [JR.idler + 1.0, 0, 1.4], act: 'inspect', face: 'in', prop: 'clipboard', dur: [50, 80], when: [6.5, 10.5], label: 'Listening to each rear axle spin on the idlers' },
      { at: [JR.idler + 3, 0, 6.0], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [JR.idler + 1.0, 0, 1.4], act: 'inspect', face: 'in', prop: 'clipboard', dur: [50, 80], when: [11, 15], label: 'Writing faults on cards' },
      off(GATES.N, [15, 6.5]),
    ] });
  // ---- Foundry and heat treatment
  add({ name: 'Dimitrios Pappas', role: 'Pourer, mould-carrier unit', bio: 'His brother runs a candy store on Woodward.',
    costume: man(r, { top: '#7a7a70', apron: '#5a4030', hatColor: '#2a2a2a' }), routine: [
      { at: [66, 0, 5.0], act: 'pour', prop: 'bucket', face: 'out', dur: [40, 60], when: [6.5, 14.5], label: 'Pouring moulds as the shelves pass' },
      { at: [48.3, 0, 2.2], act: 'workBench', prop: 'bucket', face: -1, dur: 15, when: [6.5, 14.5], label: 'Filling his hand ladle at the cupola spout' },
      off(GATES.F, [14.5, 6.5]),
    ] });
  add({ name: 'Hagop Arakelian', role: 'Core-maker, night shift', bio: 'Writes poems in Armenian on the backs of production cards.',
    costume: man(r, { top: '#9a9688', apron: '#c8b896', hatColor: '#3a3a3a', beard: '#2a1e18' }), routine: [
      { at: [97.1, 0, 12.6], act: 'workBench', face: 'out', dur: [60, 90], when: [0, 4], label: 'Making cores at the bench' },
      { at: [101.0, 0, 2.2], act: 'workBench', face: -1, dur: 20, when: [0, 4], label: 'Loading the revolving core oven' },
      { at: [97.1, 0, 12.6], act: 'sitEat', seat: 0.4, face: 'out', dur: 25, when: [4, 4.17], label: 'Ten minutes for a meal at his bench' },
      { at: [97.1, 0, 12.6], act: 'workBench', face: 'out', dur: [60, 90], when: [4.17, 8], label: 'Cores for the morning' },
      { at: [101.0, 0, 2.2], act: 'workBench', face: -1, dur: 20, when: [4.17, 8], label: 'Loading the oven' },
      off(GATES.F, [8, 0]),
    ] });
  add({ name: 'Jan Novák', role: 'Night cupola man', bio: 'Likes the quiet of the foundry at night.',
    costume: man(r, { top: '#6a5a4a', apron: '#5a4030', hatColor: '#2a2a2a', beard: '#5a4030' }), routine: [
      { at: [41.9, 0, 2.6], act: 'shovel', prop: 'shovel', face: 'out', dur: [60, 80], when: [22, 23.5], label: 'Cleaning out under the cupolas' },
      { at: 'stage1', act: 'shovel', prop: 'shovel', face: 'out', dur: [60, 80], when: [23.5, 2.5], label: 'Making the bed of coke' },
      { at: 'stage0', act: 'carry', prop: 'box', face: -1, dur: [60, 80], when: [2.5, 5.5], label: 'Charging iron' },
      { at: [43.4, 0, 2.6], act: 'workBench', face: 'out', dur: 40, when: [5.5, 6], label: 'Lighting the bed before the day men come' },
      off(GATES.F, [6, 22]),
    ] });
  add({ name: 'Michał Kowalczyk', role: 'Shake-out man', bio: 'Married last spring, partly to qualify for the bonus.',
    costume: man(r, { top: '#9a9688', hatColor: '#4a4038' }), routine: [
      { at: [78.4, 0, 4.4], act: 'shovel', prop: 'shovel', face: 'out', dur: [60, 90], when: [6.5, 14.5], label: 'Knocking out castings over the grate' },
      off(GATES.F, [14.5, 6.5]),
    ] });
  add({ name: 'István Nagy', role: 'Heat-treat furnace man', bio: 'Judges heat by eye better than the pyrometer.',
    costume: man(r, { top: '#c8c0a8', apron: '#5a4030', hatColor: '#2a2a2a', beard: '#3a2a1e' }), routine: [
      { at: [108.8, 0, 3.3], act: 'workBench', face: 'out', dur: [40, 60], when: [8, 16], label: 'Watching the colour of the steel' },
      { at: [113, 0, 5.9], act: 'workBench', face: 'out', dur: 20, when: [8, 16], label: 'Quenching' },
      off(GATES.F, [16, 8]),
    ] });
  // ---- Power house
  add({ name: 'Edward Whitcomb', role: 'Power-house engineer', bio: 'Keeps his boots polished like brass.',
    costume: man(r, { coat: 'jacket', coatColor: '#2e2e34', top: '#e8e2d4', hat: 'peaked', hatColor: '#1e1e22' }), routine: [
      { at: 'phSwitch', act: 'read', prop: 'clipboard', face: 'in', dur: [30, 40], when: [7, 19], label: 'Logging the gauges on the switchboard' },
      { at: 'phWalk', act: 'pour', prop: 'jug', face: 'out', dur: [30, 40], when: [7, 19], label: 'Walking the big engine with an oil can' },
      { at: [25.4, 0, 17.6], act: 'sitWrite', seat: 0.46, face: -1, dur: [30, 40], when: [7, 19], label: 'Writing up the engine log' },
      { at: 'con1', act: 'talk', face: 'out', dur: 25, when: [13, 14], label: 'Talking with the construction foreman about the new floors' },
      off(GATES.P, [19, 7]),
    ] });
  // ---- Machine shop
  add({ name: 'Angus MacLeod', role: 'Toolmaker', bio: 'Complains that nobody serves an apprenticeship any more.',
    costume: man(r, { top: '#e2dccc', coat: 'jacket', coatColor: '#4a4036', hat: 'flat', hatColor: '#5a5048', hair: '#b07a3c', beard: '#b07a3c' }), routine: [
      { at: [118.6, 0, 2.85], act: 'workBench', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Grinding a special cutter' },
      { at: [126.7, 0, 10.8], act: 'inspect', face: 'out', dur: 30, when: [6.5, 10.5], label: 'Measuring with a micrometer on the surface plate' },
      { at: [119.5, 0, 13.4], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch at the bench' },
      { at: [119.5, 0, 13.3], act: 'workBench', face: 'in', dur: [60, 90], when: [11, 15], label: 'Fitting a new jig' },
      off(GATES.M, [15, 6.5]),
    ] });
  add({ name: 'Thomas Pryce', role: 'Tool-and-fixture draftsman', bio: 'Sketches the line workers in his margins.',
    costume: man(r, { coat: 'jacket', coatColor: '#3a3a40', top: '#f2ece0', hat: null }), routine: [
      { at: [118.6, 0, 15.5], act: 'sitWrite', seat: 0.46, face: 'in', dur: [60, 90], when: [8, 12], label: 'At the drawing board' },
      { at: [122, 0, 16.0], act: 'sitEat', seat: 0.46, face: 'out', dur: 40, when: [12, 13], label: 'Lunch' },
      { at: [120.5, 0, 4.0], act: 'talk', prop: 'paper', face: 'out', dur: 30, when: [13, 13.4], label: 'Taking a print to the tool room' },
      { at: [118.6, 0, 15.5], act: 'sitWrite', seat: 0.46, face: 'in', dur: [60, 90], when: [13.4, 17], label: 'Back at the board' },
      off(GATES.M, [17, 8]),
    ] });
  add({ name: 'Feliks Zając', role: 'Ingersoll mill loader, cylinder blocks', bio: 'The strongest man in the department.',
    costume: man(r, { top: '#c8c0a8', sleeves: 'short', build: 1.25, hatColor: '#3a3a3a' }), routine: [
      { at: [130.6, 0, 4.0], act: 'carry', prop: 'box', face: 'out', dur: [40, 60], when: [6.5, 15], label: 'Loading fifteen blocks onto the table' },
      { at: [133.8, 0, 4.0], act: 'handsBehind', face: 'out', dur: [40, 60], when: [6.5, 15], label: 'Watching the cutters' },
      off(GATES.M, [15, 6.5]),
    ] });
  add({ name: 'Samuel Turner', role: 'Motor block tester', bio: 'Came up from Kentucky; one of very few Black men in the department.',
    costume: man(r, { skin: '#6b4026', hair: '#2b1d14', top: '#d8d0bc', hatColor: '#2a2a2a' }), routine: [
      { at: [182.3, 0, 3.45], act: 'handsBehind', face: 'out', dur: [30, 50], when: [6.5, 15], label: 'Watching the ammeter as a motor runs in' },
      { at: [183.6, 0, 3.45], act: 'hammer', prop: 'hammer', face: 'out', dur: 10, when: [6.5, 15], label: 'Stamping his letter on a screw head' },
      off(GATES.M, [15, 6.5]),
    ] });
  add({ name: 'Rosa Bianchi', role: 'Coil winder, flywheel magnetos', bio: 'Saving for a sewing machine of her own.',
    costume: woman(r, { dressColor: '#2a2a33', apron: '#ece6d8' }), routine: [
      { at: [160.9, 0, 10.56], act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [7.5, 12], label: 'Winding field coils' },
      { at: [167, 0, 13], act: 'talk', face: 'out', dur: 40, when: [12, 12.75], label: 'Lunch with the other girls' },
      { at: [160.9, 0, 10.56], act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [12.75, 16.75], label: 'Winding coils' },
      off(GATES.M, [16.75, 7.5]),
    ] });
  add({ name: 'Henrik Lindqvist', role: 'Magneto line worker', bio: 'Was on the line the day it first moved.',
    costume: apron(r, { top: '#e2dccc', apron: '#f2ece0', hatColor: '#5a5048', hair: '#d8c9a8' }), routine: [
      { at: [164.0, 0, 3.75], act: 'workBench', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Placing magnets as the flywheels pass at 44 inches a minute' },
      { at: [164.5, 0, 6.4], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [164.0, 0, 3.75], act: 'workBench', face: 'out', dur: [60, 90], when: [11, 15], label: 'Placing magnets' },
      off(GATES.M, [15, 6.5]),
    ] });
  add({ name: 'Fyodor Belov', role: 'Motor assembler', bio: 'Goes to English School before his shift.',
    costume: apron(r, { top: '#c8c0a8', hatColor: '#3a3a3a', beard: '#4a3020' }), routine: [
      { at: [193.0, SHOP_Y, 2.5], act: 'sitRead', seat: 0.45, face: 'in', dur: 40, when: [5.8, 6.4], label: 'English School: "kettle", "soap", "hat"' },
      { at: [175.0, 0, 3.6], act: 'workBench', face: 'out', dur: [60, 90], when: [6.4, 10.5], label: 'Fitting pistons and rods' },
      { at: [176, 0, 6.2], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [175.0, 0, 3.6], act: 'workBench', face: 'out', dur: [60, 90], when: [11, 15], label: 'Fitting pistons and rods' },
      off(GATES.M, [15, 5.8]),
    ] });
  add({ name: 'William Hartley', role: 'English School teacher and office clerk', bio: 'Proud whenever a pupil reads a newspaper headline.',
    costume: man(r, { coat: 'jacket', coatColor: '#3a3a40', top: '#f2ece0', hat: null, hair: '#8d5a2b' }), routine: [
      { at: [193.4, SHOP_Y, 6.0], act: 'workBench', face: 'out', dur: 20, when: [5.6, 5.8], label: 'Setting out a kettle, a bar of soap and a hat' },
      { at: [193.4, SHOP_Y, 6.2], act: 'point', face: 'out', dur: 40, when: [5.8, 6.4], label: 'Teaching: he holds up the kettle and they say the word' },
      { at: [193.4, 0, 5.01], act: 'sitWrite', seat: 0.46, face: 1, dur: [60, 90], when: [8.25, 17.25], label: 'Clerk in the employment office' },
      off(GATES.M, [17.25, 5.6]),
    ] });
  add({ name: 'Dr. Arthur Dunn', role: 'Plant physician', bio: 'Keeps a jar of the steel slivers he has taken out of men’s eyes.',
    costume: man(r, { coat: 'long', coatColor: '#f0ece4', top: '#f2ece0', hat: null, hair: '#9a9a9a', beard: '#9a9a9a' }), routine: [
      { at: [190.0, SHOP_Y, 2.4], act: 'workBench', face: 1, dur: [40, 60], when: [7, 18], label: 'Taking grit out of a moulder’s eye' },
      { at: [189.6, SHOP_Y, 1.9], act: 'point', face: 'out', dur: 20, when: [7, 18], label: 'Lecturing a man about grinding without goggles' },
      off(GATES.M, [18, 7]),
    ] });
  add({ name: 'Margaret Shaw', role: 'Typist, employment office', bio: 'Has typed so many names she can spell them all.',
    costume: woman(r, { dressColor: '#2e3440', hair: '#4a3020' }), routine: [
      { at: [193.4, 0, 2.41], act: 'sitWrite', seat: 0.46, face: 1, dur: [60, 90], when: [8.25, 12], label: 'Typing record forms' },
      { at: [194.8, 0, 6.6], act: 'workBench', face: 'in', dur: [40, 60], when: [13, 17.25], label: 'Filing record envelopes' },
      off(GATES.M, [17.25, 8.25]),
    ] });
  add({ name: 'Ludwig Eckert', role: 'Interpreter, employment office', bio: 'Speaks five languages and drives none.',
    costume: man(r, { coat: 'jacket', coatColor: '#2e2e34', top: '#f2ece0', hat: null, hair: '#9a9a9a' }), routine: [
      { at: [192.7, 0, 2.6], act: 'talk', face: -1, dur: [40, 60], when: [8.25, 12], label: 'Translating for an applicant in Polish' },
      { at: [192.7, 0, 4.4], act: 'talk', face: -1, dur: [40, 60], when: [13, 17.25], label: 'Translating in German and Hungarian' },
      off(GATES.M, [17.25, 8.25]),
    ] });
  add({ name: 'Clarence Webb', role: 'Sociological Department investigator', bio: 'Privately uneasy about asking men about their savings.',
    costume: man(r, { coat: 'long', coatColor: '#3a3a40', top: '#f2ece0', hat: 'bowler', hatColor: '#1e1e22' }), routine: [
      { at: [194.6, 0, 3.8], act: 'read', prop: 'paper', face: 'out', dur: 40, when: [8.25, 8.8], label: 'Collecting his list of addresses' },
      off(GATES.M, [8.8, 14], 'Out visiting workers’ homes'),
      { at: [193.4, 0, 2.41], act: 'sitWrite', seat: 0.46, face: 1, dur: 60, when: [14, 17.25], label: 'Writing up his reports' },
      off(GATES.M, [17.25, 8.25]),
    ] });
  add({ name: 'Kazimierz Lis', role: 'Job seeker', bio: 'Walked from Hamtramck in borrowed boots.',
    costume: man(r, { coat: 'long', coatColor: '#4a4036', hatColor: '#3a3a3a' }), routine: [
      { at: [189.4, 0, 0.9], act: 'read', face: -1, dur: 60, when: [7.5, 9], label: 'Reading the board of wanted trades' },
      { at: [189.6, 0, 2.71], act: 'sitTalk', seat: 0.46, face: 1, dur: 40, when: [9, 9.5], label: 'Interviewed, with the interpreter' },
      { at: [60, 0, 5.3], act: 'shovel', prop: 'shovel', face: 'out', dur: 80, when: [9.5, 15], label: 'Sent to the foundry: his first day' },
      off(GATES.M, [15, 7.5]),
    ] });
  // ---- The new building
  add({ name: 'Lars Nyberg', role: 'Crane driver, craneway', bio: 'Sailed on Great Lakes ore boats before Ford.', costume: man(r, { coat: 'jacket', coatColor: '#4a4036', hatColor: '#2a2a2a', hair: '#d8c9a8' }), at: [356, 0, 13] });
  add({ name: 'Hiroshi Tanaka', role: 'Upholsterer', bio: 'Keeps a small bonsai on his windowsill at home.', costume: apron(r, { skin: '#e6b48f', hair: '#2b1d14', top: '#d8d0bc', hatColor: '#2a2a2a' }), at: [360, N.y[3], 3] });
  add({ name: 'Michele Esposito', role: 'Flow-on painter, fifth floor', bio: 'His overalls are as stiff as boards with paint.',
    costume: man(r, { top: '#2a3040', bottom: '#2a3040', hatColor: '#1e2230' }), routine: [
      { at: [376.6, N.y[4], 5.0], act: 'pour', prop: 'jug', face: 'out', dur: [60, 90], when: [6.5, 10.5], label: 'Showering each body with blue-black from the fan nozzle' },
      { at: [372, N.y[4], 5.0], act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [10.5, 11], label: 'Lunch' },
      { at: [376.6, N.y[4], 5.0], act: 'pour', prop: 'jug', face: 'out', dur: [60, 90], when: [11, 15], label: 'Flowing on the second coat' },
      off(GATES.N, [15, 6.5]),
    ] });
  add({ name: 'Kostas Galanis', role: 'Primer sprayer', bio: 'Hears the hiss of the atomiser in his sleep.',
    costume: man(r, { top: '#7a4a2e', bottom: '#5a3a24', hat: 'hood', hatColor: '#d8d0bc' }), routine: [
      { at: [354.0, N.y[4], 8.7], act: 'spray', face: 1, dur: [40, 60], when: [6.5, 10.5], label: 'Masked, spraying brown primer with the big atomiser' },
      { at: [355.0, N.y[4], 4.9], act: 'push', face: 1, dur: 10, when: [6.5, 10.5], label: 'Shoving a primed body on its way' },
      { at: [354.0, N.y[4], 8.7], act: 'spray', face: 1, dur: [40, 60], when: [11, 15], label: 'Spraying primer' },
      off(GATES.N, [10.5, 11], 'Lunch out of the booth'),
      off(GATES.N, [15, 6.5]),
    ] });
  const sewing = (i, row) => [334.6 + i * 2.6, N.y[3], 0.8 + row * 2.9 + 0.96];
  add({ name: 'Mary Kelly', role: 'Upholstery seamstress', bio: 'Writes letters to her sister in Cork.',
    costume: woman(r, { hair: '#7a2c14', dressColor: '#2e3440' }), routine: [
      { at: sewing(1, 0), act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [7.5, 12], label: 'Sewing cushion covers' },
      { at: [349, N.y[3], 9.6], act: 'talk', face: 'out', dur: 40, when: [12, 12.75], label: 'Lunch in the women’s rest room' },
      { at: sewing(1, 0), act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [12.75, 16.75], label: 'Sewing' },
      off(GATES.N, [16.75, 7.5]),
    ] });
  add({ name: 'Helena Zielińska', role: 'Top-maker, women’s department', bio: 'Supports her widowed mother, so she gets the profit share.',
    costume: woman(r, { hair: '#b07a3c', dressColor: '#3a2e2a' }), routine: [
      { at: sewing(3, 1), act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [7.5, 12], label: 'Cutting and stitching top material' },
      { at: [349, N.y[3], 9.4], act: 'talk', face: -1, dur: 40, when: [12, 12.75], label: 'Lunch' },
      { at: sewing(3, 1), act: 'sitWork', seat: 0.46, face: 'out', dur: [60, 90], when: [12.75, 16.75], label: 'Stitching tops' },
      off(GATES.N, [16.75, 7.5]),
    ] });
  add({ name: 'Agnes Duffy', role: 'Forewoman, women’s department', bio: 'Never sits down before noon.',
    costume: woman(r, { dressColor: '#1e1e26', hair: '#9a9a9a', top: '#e8e2d4' }), routine: [
      { at: [337, N.y[3], 5.4], act: 'handsBehind', face: 'out', dur: [20, 30], when: [7.5, 16.75], label: 'Walking the rows' },
      { at: [345, N.y[3], 5.4], act: 'inspect', face: 'out', dur: [20, 30], when: [7.5, 16.75], label: 'Checking finished tops' },
      { at: [341, N.y[3], 2.6], act: 'talk', face: 'in', dur: 15, when: [7.5, 16.75], label: 'Signing a rest-room pass' },
      off(GATES.N, [16.75, 7.5]),
    ] });
  add({ name: 'George Fairley', role: 'Time clerk', bio: 'Hears the whole shift’s gossip in thirty minutes.',
    costume: man(r, { coat: 'jacket', coatColor: '#2e2e34', top: '#f2ece0', hat: 'bowler', hatColor: '#1e1e22' }), routine: [
      { at: [336.3, 0, 2.4], act: 'handsBehind', face: 'out', dur: 40, when: [6, 7], label: 'Watching the clock racks at the change of shift' },
      { at: [339.5, 0, 2.6], act: 'read', prop: 'paper', face: 'out', dur: [60, 90], when: [7, 15], label: 'Working the pay-roll ledgers' },
      { at: [336.3, 0, 2.4], act: 'handsBehind', face: 'out', dur: 40, when: [15, 15.6], label: 'Collecting cards at the shift change' },
      off(GATES.N, [15.6, 6]),
    ] });
  // ---- Everywhere
  const BOARD = [197.0, 0, 10.0];
  add({ name: 'Walter Briggs', role: 'Day shortage chaser', bio: 'Carries three pencils and loses two a day.',
    costume: man(r, { coat: 'jacket', coatColor: '#4a4a52', top: '#f2ece0', hat: 'boater', hatColor: '#d8c890' }), routine: [
      { at: [199.5, 0, 12.6], act: 'read', prop: 'paper', face: 'out', dur: 30, when: [6.5, 6.75], label: 'Reading the night reports' },
      { at: 'h4', act: 'point', face: 'in', dur: 20, when: [6.75, 8.5], label: 'Touring the assembly stations' },
      { at: 'm4', act: 'talk', face: 'out', dur: 20, when: [6.75, 8.5], label: 'Hunting for missing parts' },
      { at: BOARD, act: 'workBench', face: -1, dur: 30, when: [8.5, 8.8], label: 'Chalking his first report on the blackboard' },
      { at: 'h3', act: 'run', face: 1, dur: 15, when: [8.8, 11.4], label: 'Chasing wheels' },
      { at: 'm2', act: 'point', face: 'out', dur: 20, when: [8.8, 11.4], label: 'Chasing a shortage of castings' },
      { at: [240.8, 0, 6.6], act: 'talk', face: 1, dur: 30, when: [11.4, 11.66], label: 'Arguing with the job foreman about wheels' },
      { at: BOARD, act: 'workBench', face: -1, dur: 30, when: [11.66, 11.95], label: 'Chalking the results' },
      { at: 'h5', act: 'point', face: 'in', dur: 20, when: [11.95, 14.5], label: 'Back on the hunt' },
      { at: BOARD, act: 'workBench', face: -1, dur: 30, when: [14.5, 15.3], label: 'The final record of the day' },
      off(GATES.H, [15.3, 6.5]),
    ] });
  add({ name: 'Ernest Vogel', role: 'Night shortage chaser', bio: 'Has never seen the plant by daylight on a weekday.',
    costume: man(r, { coat: 'jacket', coatColor: '#2e2e34', top: '#e8e2d4', hat: 'bowler', hatColor: '#1e1e22' }), routine: [
      { at: [199.5, 0, 12.6], act: 'read', prop: 'paper', face: 'out', dur: 30, when: [15.5, 15.8], label: 'Reading the day report' },
      { at: 'm3', act: 'point', face: 'out', dur: 25, when: [15.8, 19.5], label: 'Urging production in the machine shop' },
      { at: 'm5', act: 'talk', face: 'out', dur: 25, when: [15.8, 19.5], label: 'After a foreman about motors' },
      { at: [176.5, 0, 6.4], act: 'drink', prop: 'mug', face: 'out', dur: 20, when: [19.5, 19.67], label: 'Ten minutes to eat' },
      { at: 'h2', act: 'point', face: 'in', dur: 25, when: [19.67, 23.6], label: 'Walking line 1' },
      { at: BOARD, act: 'workBench', face: -1, dur: 30, when: [23.6, 23.9], label: 'Writing his notes for the morning' },
      off(GATES.H, [23.9, 15.5]),
    ] });
  add({ name: 'Anton Kraus', role: 'Night watchman', bio: 'Knows which cats sleep in the boiler house.',
    costume: man(r, { coat: 'long', coatColor: '#2a2e3a', hat: 'peaked', hatColor: '#1e2230', beard: '#9a9a9a' }), routine: [
      { at: 'h6', act: 'stand', prop: 'lantern', face: 'out', dur: 25, when: [0, 4], label: 'On his rounds with a lantern' },
      { at: [329, 0, 2.0], act: 'stand', prop: 'lantern', face: 1, dur: 20, when: [0, 4], label: 'Checking the doors on John R Street' },
      { at: 'm6', act: 'stand', prop: 'lantern', face: 'out', dur: 25, when: [0, 4], label: 'On his rounds' },
      { at: 'phBase2', act: 'drink', prop: 'mug', face: 'out', dur: 40, when: [4, 4.3], label: 'Coffee in the warm basement, with the cat' },
      { at: 'n2', act: 'stand', prop: 'lantern', face: 'out', dur: 25, when: [4.3, 8], label: 'On his rounds' },
      { at: 'f2', act: 'stand', prop: 'lantern', face: 'out', dur: 25, when: [4.3, 8], label: 'Through the foundry' },
      off(GATES.P, [8, 0]),
    ] });
  add({ name: 'Pyotr Sokolov', role: 'Monorail locomotive driver', bio: 'Rings his bell at every corner whether he needs to or not.', costume: man(r, { coat: 'jacket', coatColor: '#3a3a40', hatColor: '#2a2a2a' }), at: [100, 3.9, MONO.z] });
  add({ name: 'Mr. Alden', role: 'Visitor from Ohio', bio: 'He and his wife own a 1912 Model T.',
    costume: man(r, { coat: 'long', coatColor: '#4a4a52', top: '#f2ece0', hat: 'bowler', hatColor: '#2a2a2a', hair: '#9a9a9a', beard: '#9a9a9a' }), routine: visitors(0) });
  add({ name: 'Mrs. Alden', role: 'Visitor from Ohio', bio: 'Came to see where their own car was made.',
    costume: woman(r, { top: '#6a3a3a', dressColor: '#4a2a2e', coat: 'long', coatColor: '#5a3238', hat: 'bonnet', hatColor: '#3a2a2a' }), routine: visitors(0.8) });
  // Harold Pike: drives each car out of door D, hops off, walks back.
  const harold = W.addPerson({ name: 'Harold Pike', role: 'Chassis driver', bio: 'Secretly hopes to buy one himself.', costume: man(r, { coat: 'jacket', coatColor: '#4a4036', hatColor: '#3a3a3a' }), at: [ST.starter, 0, L1 - 1.4] });
  D.drivers = [harold];

  crowds(W, r);
  scripted(W);
}

function visitors(dx) {
  return [
    { at: [150 + dx, 0, 5.8], act: 'point', face: 'in', dur: [25, 35], when: [9, 15], label: 'Watching the machine shop' },
    { at: [222 + dx, 0, 6.8], act: 'point', face: 'in', dur: [30, 40], when: [9, 15], label: 'Watching a motor lowered onto a chassis' },
    { at: [300 + dx, 0, 6.2], act: 'point', face: 'in', dur: [25, 35], when: [9, 15], label: 'Watching bodies come down onto the chassis' },
    { at: 'gateM', act: 'stand', dur: 200, when: [15, 9], off: true, label: 'Gone back to their hotel' },
  ];
}

// ------------------------------------------------------------------ the crowds
function crowds(W, r) {
  const L = H.lines;
  const crew = (spots, shift, gate, cos, label) => {
    if (shift === 'both') { spots.forEach((s) => worker(W, r, s, 'day', gate, cos(), label)); spots.filter((_, i) => i % 2 === 0).forEach((s) => worker(W, r, s, 'second', gate, cos(), label)); return; }
    spots.forEach((s) => worker(W, r, s, shift, gate, cos(), label));
  };
  // Chassis lines: men on both sides, one or two operations each (S1 p.144 to 150).
  const lineMen = (z, x0, x1, step, shift) => {
    const out = [];
    for (let x = x0; x <= x1; x += step) {
      const backSide = Math.round((x - x0) / step) % 3 !== 1;
      const acts = ['workBench', 'crank', 'hammer', 'workBench', 'inspect'];
      out.push([x + (r() - 0.5) * 0.6, 0, backSide ? z + 1.15 : z - 1.15, acts[Math.floor(r() * acts.length)], backSide ? 'out' : 'in', r() < 0.3 ? 'hammer' : null, 'One or two operations on each chassis as it passes']);
    }
    return out;
  };
  crew(lineMen(L[0], 205, 262, 2.6, 'day').filter(([x]) => Math.abs(x - ST.engine) > 1.5 && Math.abs(x - ST.wheels) > 1.2 && Math.abs(x - 252.5) > 1), 'day', GATES.H, () => man(r, r() < 0.4 ? { apron: '#c8b896' } : {}));
  crew(lineMen(L[0], 206, 262, 3.6, 'second'), 'second', GATES.H, () => man(r, r() < 0.4 ? { apron: '#c8b896' } : {}));
  crew(lineMen(L[1], 205, 262, 3.0, 'day'), 'day', GATES.H, () => man(r, r() < 0.4 ? { apron: '#c8b896' } : {}));
  // Partner at the engine drop, line 2's engine and wheel men, starter men, side line, stock.
  crew([[ST.engine + 0.6, 0, L[0] - 1.15, 'workBench', 'in'], [ST.engine - 0.4, 0, L[1] + 1.15, 'workBench', 'out'], [ST.engine + 0.6, 0, L[1] - 1.15, 'workBench', 'in'],
    [ST.wheels + 0.3, 0, L[1] + 1.15, 'crank', 'out'], [ST.starter + 1.0, 0, L[0] + 1.3, 'pour', 'out', 'bucket', 'Filling the radiator'], [ST.starter - 1.3, 0, L[0] - 1.6, 'crank', 'in', null, 'Working the starting weight lever'],
    [ST.starter + 1.0, 0, L[1] + 1.3, 'pour', 'out', 'bucket', 'Filling the radiator'], [ST.starter - 1.3, 0, L[1] - 1.6, 'crank', 'in', null, 'Working the starting weight lever'],
    [214, 0, 18.4, 'workBench', 'in', null, 'Press man on the frame side line'], [216.5, 0, 18.4, 'carry', 'in', 'plank', 'Frame handler'], [209, 0, 18.4, 'hammer', 'in', 'hammer', 'Fixing rear springs'], [206.5, 0, 18.4, 'hammer', 'in', 'hammer', 'Fixing rear springs'],
    [288, 0, 12.2, 'carry', 'out', 'box', 'Trucker in the stock area'], [ST.tank, 2.6, 8.3, 'pour', 'out', 'jug', 'Gasoline into the tanks on line 2'],
    [ST.dash, 0.45, L[0] + 1.5, 'carry', 'out', 'plank', 'Placing the dash'], [ST.dash + 2, 0, L[0] - 1.15, 'workBench', 'in', null, 'Pedals and steering column'], [ST.dash, 0.45, L[1] + 1.5, 'carry', 'out', 'plank', 'Placing the dash'],
    [ST.radiator - 0.6, 0.55, L[1] + 1.35, 'carry', 'out', 'box', 'Setting radiators'], [ST.end + 0.6, 0, L[1] + 1.2, 'inspect', 'out', null, 'Final inspection, line 2'],
    [262, 0, L[2] + 1.2, 'workBench', 'out', null, 'Millwright: line 3 stands idle for repairs']], 'day', GATES.H, () => man(r));
  crew([[ST.engine + 0.6, 0, L[0] - 1.15, 'workBench', 'in'], [ST.wheels + 0.3, 0, L[0] + 1.15, 'crank', 'out'], [ST.starter + 1.0, 0, L[0] + 1.3, 'pour', 'out', 'bucket', 'Filling the radiator'], [ST.tank, 2.6, 2.2, 'pour', 'out', 'jug', 'Gasoline into the tanks'], [ST.radiator - 0.6, 0.55, L[0] + 1.35, 'carry', 'out', 'box', 'Setting radiators']], 'second', GATES.H, () => man(r));
  worker(W, r, [265, -1.5, L[1], 'overhead', 'out', null, 'In the pit under line 2'], 'day', GATES.H, man(r, { top: '#4a4a52', bottom: '#4a4a52' }));
  worker(W, r, [265, -1.5, L[0], 'overhead', 'out', null, 'Second-shift pit man'], 'second', GATES.H, man(r, { top: '#4a4a52', bottom: '#4a4a52' }));
  // H upper floors.
  const y1 = H.y[1], y2 = H.y[2], y3 = H.y[3];
  const dash = []; for (let x = 200; x < 227; x += 2.4) dash.push([x, y1, Math.round(x) % 2 ? 4.05 : 2.35, 'workBench', Math.round(x) % 2 ? 'out' : 'in', null, 'Dash assembly, 72 inches a minute']);
  crew(dash, 'both', GATES.H, () => apron(r));
  crew([[238, y1, 6.6, 'push', 1, null, 'Pushing a body on its truck'], [250, y1, 12.8, 'push', -1, null, 'Pushing a body on its truck'], [202, y1, 9.2, 'workBench', 'in'], [208.5, y1, 9.2, 'workBench', 'in'], [215, y1, 9.2, 'workBench', 'in']], 'day', GATES.H, () => man(r));
  crew([[199, y2, 3.9, 'workBench', 'out', null, 'Starting wheels down the gravity track'], [216.5, y2, 4.1, 'workBench', 'out', null, 'At the centrifugal painting machine'], [219.5, y2, 4.1, 'workBench', 'out', null, 'Dipping and spinning wheels'], [222.5, y2, 4.1, 'workBench', 'out'],
    [201.8, y2, 13.2, 'carry', 'in', 'box', 'Fitting tyres in the tyre room'], [CHUTE_X(), y2, L[0] + 2.0, 'carry', 'out', null, 'Sending wheels down the chute to the chassis line'],
    [252, y2, 8.8, 'workBench', 'out'], [259, y2, 8.8, 'workBench', 'out', null, 'Fitting lamps'], [266, y2, 8.8, 'workBench', 'out'], [272.5, y2, 17.8, 'carry', 'out', 'box']], 'both', GATES.H, () => apron(r));
  crew([[200.5, y3, 4.3, 'crank', 'out', null, 'Pressing front fenders'], [205, y3, 4.3, 'crank', 'out', null, 'Pressing fenders'], [OVEN_X(), y3, 14.2, 'carry', 'out', null, 'Hanging fenders on the oven chains'], [211, y3, 14.4, 'workBench', 'out'],
    [243, y3, 4.3, 'workBench', 'out', null, 'Commutators: 60 men, 1,750 a day'], [246, y3, 4.3, 'workBench', 'out'], [249, y3, 2.6, 'workBench', 'in'], [253.5, y3, 4.3, 'workBench', 'out'], [258, y3, 9.7, 'workBench', 'out'], [254, y3, 9.7, 'workBench', 'out'],
    [261.5, y3, 14.5, 'pour', 'out', 'jug', 'Pouring aluminium for commutator cases'], [271, y3, 4.5, 'workBench', 'out'], [277, y3, 4.5, 'workBench', 'out'], [284, y3, 4.5, 'workBench', 'out'], [290, y3, 4.5, 'workBench', 'out', null, 'Sending small parts down the gravity slides']], 'both', GATES.H, () => apron(r));
  // John R Street gang (S1 p.151): handlers on the platform, the gallows man, a second sling man, the motor inspector.
  crew([[JR.chuteTop[0] + 2.0, N.y[2], 2.6, 'push', -1, null, 'Platform handler, launching bodies'], [JR.chuteTop[0] + 3.0, N.y[2], 3.6, 'push', -1, null, 'Platform handler'],
    [JR.gallows + 0.9, 0.45, 5.3, 'crank', 'out', null, 'Working the gallows frame from his box'], [JR.gallows + 1.0, 0, 1.3, 'haul', 'in', null, 'Sling man'],
    [312, 0, 1.4, 'inspect', 'in', null, 'Motor inspector, listening to each engine'], [299.6, 0, 1.4, 'handsBehind', 'out', null, 'Watching the cars come out of door D']], 'day', GATES.H, () => man(r, { coat: 'jacket', coatColor: pick(r, ['#3a3a40', '#4a4036']) }));
  // Machine shop.
  crew([[121.0, 0, 2.85, 'workBench', 'out'], [123.8, 0, 6.15, 'workBench', 'in'], [126.6, 0, 2.85, 'workBench', 'out'], [118.2, 0, 6.15, 'workBench', 'in'], [122.0, 0, 10.6, 'workBench', 'out'], [125.4, 0, 10.6, 'workBench', 'out'],
    [121.6, 0, 15.5, 'sitWrite', 'in', null, 'Tool-and-fixture draftsman'], [124.6, 0, 15.5, 'sitWrite', 'in', null, 'Draftsman']], 'day', GATES.M, () => man(r, { coat: r() < 0.5 ? 'jacket' : null, coatColor: '#4a4036' }), 'Toolmaker');
  crew([[136.2, 0, 4.4, 'workBench', 'out', null, 'Tending the 49-hole drill'], [131, 0, 8.9, 'handsBehind', 'out', null, 'Tending an Ingersoll miller'], [129.6, 0, 11.9, 'push', 1, null, 'Puller and shover with a truck of castings'],
    [143, 0, 6.6, 'push', 1, null, 'Trucker under the crane'], [147, 0, 9.4, 'carry', 'out', 'box'], [144.5, 0, 15.6, 'haul', 'in', 'rope', 'Slinging a load for the crane'],
    [152.2, 0, 1.6, 'workBench', 'in', null, 'Grinding a crankshaft'], [154.8, 0, 1.6, 'workBench', 'in', null, 'Grinding a camshaft'], [157.4, 0, 1.6, 'workBench', 'in'], [153.6, 0, 8.6, 'workBench', 'out'], [156.6, 0, 8.6, 'workBench', 'out']], 'both', GATES.M, () => man(r));
  const mag = []; for (let x = 160.2; x < 169.4; x += 1.25) if (Math.abs(x - 164) > 0.6) mag.push([x, 0, 3.75, 'workBench', 'out', null, 'One operation each on the magneto line']);
  crew(mag, 'day', GATES.M, () => apron(r, { apron: '#f2ece0' }));
  crew(mag.filter((_, i) => i % 2 === 0), 'second', GATES.M, () => apron(r, { apron: '#f2ece0' }));
  const coil = []; for (let i = 0; i < 4; i++) for (const dx of [-0.5, 0.5]) if (!(i === 0 && dx > 0)) coil.push([160.4 + i * 2.3 + dx, 0, 10.56, 'sitWork', 'out', null, 'Winding field coils for flywheel magnetos']);
  coil.forEach((s) => worker(W, r, s, 'women', GATES.M, woman(r, { apron: '#ece6d8' })));
  const motor = []; for (let x = 171.5; x < 179.5; x += 1.6) { motor.push([x, 0, 3.6, 'workBench', 'out', null, 'Motor assembly: 84 operations']); motor.push([x + 0.8, 0, 12.2, 'workBench', 'out', null, 'Motor assembly']); }
  crew(motor.filter((s) => Math.abs(s[0] - 175) > 0.5), 'day', GATES.M, () => apron(r));
  crew(motor.filter((_, i) => i % 3 === 0), 'second', GATES.M, () => apron(r));
  crew([[181.0, 0, 3.45, 'handsBehind', 'out', null, 'Block tester'], [184.9, 0, 3.45, 'handsBehind', 'out', null, 'Block tester'], [186.2, 0, 3.45, 'inspect', 'out', null, 'Head tester'], [183.6, 0, 6.2, 'push', 1, null, 'Trucking motors away, five at a time']], 'day', GATES.M, () => man(r, { top: '#d8d0bc' }));
  crew([[182.3, 0, 3.45, 'handsBehind', 'out', null, 'Block tester, second shift'], [184.9, 0, 3.45, 'handsBehind', 'out']], 'second', GATES.M, () => man(r));
  // Job seekers on the chairs and bench of the employment office.
  [[189.6, 0, 4.01], [189.6, 0, 5.31], [189.8, 0, 6.97], [190.6, 0, 6.97]].forEach((p) => worker(W, r, [p[0], p[1], p[2], 'sitTalk', p[2] > 6 ? 'out' : 1, null, 'Waiting to be seen'], 'office', 'gateM', man(r, { coat: 'long', coatColor: pick(r, ['#4a4036', '#3a3a40', '#5a4a3a']) })));
  worker(W, r, [195.0, 0, 11.2, 'workBench', 'out', null, 'Tool crib: a brass check for every tool'], 'day', GATES.M, man(r, { coat: 'jacket', coatColor: '#3a3a40' }));
  worker(W, r, [191.15, 0, 5.0, 'talk', 1, null, 'A discharged man arguing his case: since 1913 a foreman must show cause'], 'office', 'gateM', man(r, { coat: 'jacket', coatColor: '#4a4036' }));
  // Heat treat (three shifts), power house, construction.
  [[110.3, 0, 3.4, 'shovel', 'out', 'shovel'], [112.5, 0, 9.8, 'workBench', 'out']].forEach((s) => worker(W, r, s, 'three', GATES.F, man(r, { apron: '#5a4030' })));
  crew([[14, 2.8, 7.2, 'pour', 'out', 'jug', 'Oiling the big engine'], [20.5, 0, 12.4, 'workBench', 'out', null, 'Watching the dynamo']], 'day', GATES.P, () => man(r, { top: '#4a4a52', bottom: '#4a4a52' }));
  worker(W, r, [29, 0, 17.2, 'read', 'in', 'clipboard', 'Night engineer at the switchboard'], 'three', GATES.P, man(r, { coat: 'jacket', coatColor: '#2e2e34', hat: 'peaked', hatColor: '#1e1e22' }));
  crew([[11, 14.55, 1.2, 'haul', 'out', 'rope', 'Rigger hauling a steel beam'], [16, 14.55, 1.2, 'hammer', 'out', 'hammer', 'Riveting the new frame'], [26, 14.85, 0.9, 'carry', 'out', 'plank', 'Laying planks on the new floor'], [30, 14.85, 6, 'hammer', 'out', 'hammer'], [24, 16.36, 0.0, 'hammer', 'out', 'hammer', 'On the scaffold']], 'day', GATES.P, () => man(r, { coat: 'jacket', coatColor: '#4a4036', hatColor: '#3a3a3a' }), 'Rigger on the new power plant');
  // Foundry: day, second and night shifts (S1 p.358).
  const fday = [
    [39.3, 0, 2.2, 'workBench', -1, null, 'Tapping a cupola'], [44.6, 0, 2.3, 'workBench', -1, null, 'Tapping a cupola'], [47.6, 0, 3.0, 'pour', -1, 'bucket', 'Filling a ladle at the spout'],
    [38.6, 6.5, 3.4, 'shovel', 'out', 'shovel', 'Charging coke'], [41.6, 6.5, 4.2, 'push', 1, null, 'Wheeling a barrow of iron'], [45.8, 6.5, 3.6, 'carry', 'out', 'box', 'Charging pig iron'],
    [52.6, 4.1, 19.4, 'workBench', 'in', null, 'Metal pattern maker'], [54.8, 4.1, 19.4, 'workBench', 'in', null, 'Metal pattern maker'], [56.8, 4.1, 18.6, 'workBench', -1, null, 'At the pattern lathe'],
    [61, 0, 5.85, 'workBench', 'out', null, 'Moulding machine'], [63.6, 0, 8.25, 'workBench', 'out', null, 'Moulding machine'], [66.2, 0, 5.85, 'workBench', 'out'], [68.8, 0, 8.25, 'workBench', 'out'], [71.4, 0, 5.85, 'workBench', 'out'], [74, 0, 8.25, 'workBench', 'out'],
    [70.5, 0, 5.0, 'pour', 'out', 'bucket', 'Pourer with a hand ladle'], [72.5, 0, 12.0, 'pour', 'in', 'bucket', 'Pouring the north loop'], [69.0, 0, 2.95, 'sitWrite', 'out', null, 'Check-taker collecting the moulders’ brass checks'],
    [78.8, 0, 15.2, 'shovel', 'out', 'shovel', 'Shake-out'], [84.4, 0, 4.1, 'ram', 'out', null, 'Ramming a cylinder mould'], [87.2, 0, 4.1, 'ram', 'out'], [90.0, 0, 4.0, 'shovel', 'out', 'shovel', 'Moulder'], [92.8, 0, 4.1, 'ram', 'out'],
    [86, 0, 8.6, 'ram', 'out'], [91, 0, 8.6, 'shovel', 'out', 'shovel'], [88.5, 0, 13.0, 'ram', 'out'], [94.2, 0, 12.9, 'workBench', 'out'],
    [98.6, 0, 12.6, 'workBench', 'out', null, 'Core-maker'], [100.1, 0, 12.6, 'workBench', 'out', null, 'Core-maker'],
    [102.6, 0, 8.5, 'workBench', 'out', null, 'Snagging castings on the wheel'], [104.2, 0, 8.5, 'workBench', 'out', null, 'Snagging castings'], [102, 0, 4.6, 'carry', 'out', 'box', 'Loading a tumbling barrel'], [105, 0, 11.8, 'carry', 'out', 'box'],
  ];
  crew(fday, 'f1', GATES.F, () => man(r, r() < 0.4 ? { apron: '#5a4030', top: '#7a7a70' } : { top: pick(r, ['#7a7a70', '#9a9688', '#6a5a4a']) }), 'Foundry');
  crew(fday.filter((_, i) => i % 3 === 0 && i > 5), 'f2', GATES.F, () => man(r, { top: '#7a7a70' }), 'Second foundry shift');
  crew([[38.6, 6.5, 3.4, 'shovel', 'out', 'shovel', 'Night cupola man, charging'], [45.8, 6.5, 3.6, 'carry', 'out', 'box', 'Night cupola man'], [73, 0, 9.0, 'shovel', 'out', 'shovel', 'Sand cutter on the second shift']], 'f3', GATES.F, () => man(r, { top: '#6a5a4a' }));
  [[98.6, 0, 12.6, 'workBench', 'out', null, 'Core-maker, three shifts']].forEach((s) => worker(W, r, s, 'three', GATES.F, man(r, { apron: '#c8b896' })));
  // New building.
  const n1 = N.y[1], n2 = N.y[2], n3 = N.y[3], n4 = N.y[4], n5 = N.y[5];
  crew([[352, 0, 3.4, 'carry', 'out', 'box', 'Boxing repair parts for shipping'], [360, 0, 9.6, 'push', 1, null, 'Hand truck to the dock'], [372, 0, 3.0, 'hammer', 'out', 'hammer', 'Nailing up a crate'], [386, 0, 3.6, 'read', 'out', 'clipboard', 'Weighing out a shipment'], [391, 0, 3.9, 'workBench', 'out', null, 'Packing'], [345, 0, 14.6, 'carry', 'in', 'box', 'Loading the box car']], 'both', GATES.N, () => man(r));
  crew([[350, n1, 4.4, 'carry', 'out', 'box', 'Stock clerk'], [370, n1, 4.4, 'read', 'out', 'clipboard', 'Stock clerk']], 'day', GATES.N, () => man(r, { coat: 'jacket', coatColor: '#3a3a40' }));
  const top = []; for (let x = 340; x < 396; x += 4.4) top.push([x, n2, x % 2 > 1 ? 4.35 : 2.0, x < 360 ? 'hammer' : 'workBench', x % 2 > 1 ? 'out' : 'in', x < 360 ? 'hammer' : null, x < 360 ? 'Fitting the top bows' : 'Windshield and top, fitted to each body']);
  crew(top, 'both', GATES.N, () => apron(r));
  crew([[332.4, n2, 6.2, 'push', 'in', null, 'Rolling a finished body to the bridge'], [355, n2, 8.8, 'carry', 'out', 'box', 'Throwing cushions, horn, mats and tool box into each body']], 'day', GATES.N, () => man(r));
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) if (!((row === 0 && i === 1) || (row === 1 && i === 3))) worker(W, r, [334.6 + i * 2.6, n3, 0.8 + row * 2.9 + 0.96, 'sitWork', 'out', null, 'Sewing car tops'], 'women', GATES.N, woman(r));
  crew([[356, n3, 4.25, 'hammer', 'out', 'hammer', 'Tacking leather with black-headed tacks'], [368, n3, 1.8, 'hammer', 'in', 'hammer', 'Upholstering'], [380, n3, 4.25, 'workBench', 'out', null, 'Stuffing curled hair'], [392, n3, 1.8, 'hammer', 'in', 'hammer'],
    [364, n3, 10.2, 'workBench', 'out', null, 'On the cushion line'], [369, n3, 10.2, 'workBench', 'out', null, 'Cushion line'], [374, n3, 10.2, 'workBench', 'out'],
    [384, n3, 11.3, 'scrub', 'out', null, 'Rubbing down with pumice and water'], [389, n3, 11.3, 'scrub', 'out', null, 'Rubbing deck'], [394, n3, 11.3, 'scrub', 'out']], 'both', GATES.N, () => apron(r));
  crew([[335, n4, 4.6, 'push', 1, null, 'Taking bodies off the incline'], [345, n4, 4.75, 'workBench', 'out'], [359.4, n4, 8.7, 'spray', 1, null, 'Spraying primer, masked'], [364.6, n4, 8.7, 'spray', 1, null, 'Spraying primer'],
    [379.4, n4, 5.0, 'pour', 'out', 'jug', 'Flowing on blue-black'], [388, n4, 7.8, 'workBench', 'out', null, 'Drying bodies'], [394, n4, 4.9, 'push', 1]], 'both', GATES.N, () => man(r, { top: '#2a3040', bottom: '#2a3040' }));
  crew([[378, n5, 5.4, 'workBench', 'out', null, 'Filling the gravity paint tanks'], [386, n5, 4.2, 'hammer', 'out', 'hammer', 'Millwright installing woodworking machinery'], [389, n5, 5.0, 'saw', 'out', 'saw', 'Opening crates of new machines'], [342, n5, 5.4, 'carry', 'out', 'plank', 'Stacking lumber']], 'day', GATES.N, () => man(r));
  crew([[338.1, n2, N.cw0 + 1.0, 'haul', 'in', 'rope', 'Taking in a load from the crane'], [338.1, n3, N.cw0 + 1.0, 'point', 'in', null, 'Signalling the crane driver']], 'day', GATES.N, () => man(r));
}
const CHUTE_X = () => 237.4;
const OVEN_X = () => 208.6;

// ------------------------------------------------------------------ people who ride things
function scripted(W) {
  const D = W.data;
  const find = (n) => W.people.find((p) => p.name === n);
  const lars = find('Lars Nyberg'), hiro = find('Hiroshi Tanaka'), pyotr = find('Pyotr Sokolov'), harold = find('Harold Pike');
  lars.onUpdate = (p) => {
    const c = D.cranes && D.cranes[0];
    const on = HOURS.both(W.hour);
    p.hidden = !on || !c;
    if (!c) return;
    p.x = c.trolley.position.x - 0.1; p.y = N.craneRail + 0.9 - 2.4 + 0.12; p.z = c.trolley.position.z - 0.8;
    p.anim = 'wheel'; p.heading = p.targetHeading = XS.faceToHeading('out');
    p.label = 'In the cab of the 5-ton crane, lifting loads to the landing stages';
  };
  hiro.onUpdate = (p) => {
    const U = D.uph;
    const on = HOURS.day(W.hour);
    p.hidden = !(W.hour >= 6.5 && W.hour < 15);
    p.label = on ? 'Riding inside a moving body, tacking leather' : 'Lunch';
    if (!U) return;
    p.x = U.base[0] + U.pitch * 2 + (U.s % U.pitch) - 0.45; p.y = N.y[3] + 0.4; p.z = NL.uph.z + 0.15;
    p.anim = on ? 'hammer' : 'sitEat'; p.prop = on ? 'hammer' : null; p.seat = 0.5;
    p.heading = p.targetHeading = XS.faceToHeading('out');
  };
  pyotr.onUpdate = (p) => {
    const ml = D.mono;
    p.hidden = !HOURS.both(W.hour);
    p.label = 'Driving the monorail locomotive: castings from the foundry to the machine shop';
    if (!ml) return;
    p.x = ml.x - 0.1; p.y = MONO.y - 1.85 + 0.12; p.z = MONO.z + 0.15;
    p.anim = 'wheel'; p.heading = p.targetHeading = XS.faceToHeading('out');
  };
  // Harold rides each car from the starter out of door D, then walks back for the next.
  const hs = { mode: 'wait', car: null };
  harold.onUpdate = (p, dt) => {
    p.hidden = !HOURS.both(W.hour);
    const cars = D.cars || [];
    const c = cars.find((q) => q.state === 'door');
    if (c) { hs.mode = 'ride'; hs.car = c; }
    if (hs.mode === 'ride') {
      const q = hs.car;
      if (q.state === 'door') { p.x = q.x + 0.15; p.y = q.y + 0.6; p.z = q.z - 0.2; p.anim = 'sit'; p.seat = 0.1; p.heading = p.targetHeading = q.h; p.label = 'Driving a new car out of door D'; return; }
      hs.mode = 'back';
    }
    if (hs.mode === 'back') {
      const tx = ST.starter + 1.6, tz = H.lines[0] - 1.4;
      const dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
      p.y = 0; p.anim = 'walk'; p.seat = null; p.label = 'Walking back for the next one';
      if (d < 0.1) { hs.mode = 'wait'; return; }
      const s = Math.min(d, dt * 1.3);
      p.x += (dx / d) * s; p.z += (dz / d) * s; p.dist += s;
      p.heading = p.targetHeading = Math.atan2(dz, dx);
      return;
    }
    p.y = 0; p.anim = 'handsBehind'; p.label = 'Waiting at the starter for the next chassis'; p.heading = p.targetHeading = XS.faceToHeading('out');
  };
  void LINE; void RAIL_Y; void SAW; void X;
}
