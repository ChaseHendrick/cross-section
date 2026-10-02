/* Big Pit: the people. A navigation graph over the yard, the bank, the shaft and the
 * roads below; a casting list of named (fictional) men, women and boys with routines over a
 * working day of October 1910; and crowds of extras. Men ride the cage hidden from view
 * (the cage itself carries a load of riders at shift times).
 *
 * The law in 1910 governs who appears where: no women or girls underground (1842), no boys
 * under 13 below ground (1900), women and boys on the surface only between 5 am and 9 pm.
 */
import { XS, anims } from '../../engine/index.js';
import { PB, BANK, CAGE, SX, SHAFT } from './common.js';
import { windAt, cageY } from './machines.js';
import { FACE } from './under.js';
import { terrainH } from './geology.js';

export const DAY_SECONDS = 1800;
const M = (min) => (min / 60) * (DAY_SECONDS / 24); // sim minutes to real seconds

// ------------------------------------------------------------------ extra animations
anims.register('mineCrawl', (p, t, P) => { // stooping along a low working
  const ph = p.dist * 4.2 + p.ph;
  const s = Math.sin(ph);
  P.rootY = 0.3; P.lean = 1.05; P.head = -0.7;
  P.thF = 0.9 + s * 0.35; P.shF = -1.3; P.thB = 0.9 - s * 0.35; P.shB = -1.3;
  P.uaF = 0.9 - s * 0.4; P.faF = 0.2; P.uaB = 0.9 + s * 0.4; P.faB = 0.2;
  return P;
});
anims.register('mineHole', (p, t, P) => { // holing: kneeling low, pick swung at the foot of the coal
  const c = (t * 0.75 + p.ph) % 1;
  const u = c < 0.62 ? c / 0.62 : 1 - (c - 0.62) / 0.38;
  P.rootY = 0.22; P.lean = 1.15; P.head = -0.9;
  P.thF = 1.55; P.shF = -1.6; P.thB = 1.2; P.shB = -1.75;
  P.uaF = 0.5 - u * 1.3; P.faF = 0.35; P.uaB = 0.45 - u * 1.2; P.faB = 0.4;
  P.prop = 'pick'; P.propAng = 1.4 - u * 1.3;
  return P;
});
anims.register('mineShovelLow', (p, t, P) => { // filling small coal on his knees
  const c = (t * 0.5 + p.ph) % 1;
  const sw = c < 0.5 ? 0 : c < 0.72 ? (c - 0.5) / 0.22 : 1 - (c - 0.72) / 0.28;
  P.rootY = 0.3; P.lean = 0.9 - sw * 0.3; P.head = -0.6;
  P.thF = 1.5; P.shF = -1.6; P.thB = 0.3; P.shB = -1.6;
  P.uaF = 0.4 - sw * 0.9; P.faF = 0.5; P.uaB = 0.2 - sw * 0.8; P.faB = 0.7;
  P.prop = 'shovel'; P.propAng = 1.8 - sw * 1.0;
  return P;
});
anims.register('mineListen', (p, t, P) => { // pick raised, head tilted, listening to the roof
  anims.table.kneel(p, t, P);
  P.rootY = 0.3; P.lean = 0.5; P.uaF = -1.6; P.faF = 0.6; P.head = -0.35 + Math.sin(t * 0.5) * 0.05;
  P.prop = 'pick'; P.propAng = -0.2;
  return P;
});
anims.register('mineTest', (p, t, P) => { // a fireman holding his lamp up to the roof, watching the flame
  anims.table.kneel(p, t, P);
  P.rootY = 0.3; P.lean = 0.2; P.uaF = -1.9 + Math.sin(t * 0.6) * 0.1; P.faF = 0.4; P.head = -0.5;
  P.prop = 'lamp';
  return P;
});
anims.register('mineSitLamp', (p, t, P) => { // sitting on the floor against the side, food tin on knees
  anims.table.sitEat(p, t, P);
  P.rootY = 0.12; P.thF = 1.3; P.shF = -0.9; P.thB = 1.25; P.shB = -0.8;
  return P;
});

// ------------------------------------------------------------------ costumes
const SK = ['#e8c4a0', '#dcae88', '#d09c78', '#c89070', '#e0b898'];
const DUSTY = ['#8a7666', '#7e6a5c', '#94806e', '#86725f']; // faces grey with coal dust
const HAIR = ['#2b1d14', '#4a3020', '#6b4428', '#3a2a1e', '#8d5a2b', '#9a9a9a', '#1e1814'];
const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
export function collier(r, o = {}) {
  const vest = r() < 0.5;
  return Object.assign({
    skin: o.clean ? pick(r, SK) : pick(r, DUSTY), hair: pick(r, HAIR), hat: 'flat', hatColor: pick(r, ['#2a2622', '#3a3430', '#4a4038', '#2e2a2a']),
    top: vest ? pick(r, ['#c8bca4', '#b8ac94', '#a89c84']) : pick(r, ['#7a6a58', '#5e5446', '#8a7a62', '#6a6050']), sleeves: vest ? 'short' : 'long',
    bottom: pick(r, ['#8e8068', '#7a6e5a', '#9a8a6e', '#6e6252']), shoes: '#221a14', build: 0.95 + r() * 0.2,
  }, o);
}
const official = (r, o = {}) => Object.assign({ skin: pick(r, SK), hair: pick(r, HAIR), hat: 'flat', hatColor: '#2a2622', top: '#d8d0c0', coat: 'jacket', coatColor: pick(r, ['#2e2a28', '#3a3430', '#2a2e34']), bottom: '#2e2a28', shoes: '#1a1410' }, o);
const surfaceMan = (r, o = {}) => Object.assign({ skin: pick(r, SK), hair: pick(r, HAIR), hat: 'flat', hatColor: pick(r, ['#2a2622', '#3a3430', '#4a4038']), top: pick(r, ['#c8bca4', '#7a6a58', '#8a7a62', '#5a6070']), coat: r() < 0.5 ? 'jacket' : null, coatColor: pick(r, ['#3a3430', '#4a4038', '#2e2a28']), bottom: pick(r, ['#5a5046', '#3a3430', '#6e6252']), shoes: '#221a14' }, o);
const screenWoman = (r, o = {}) => Object.assign({ skin: pick(r, SK), hair: pick(r, HAIR), hat: 'kerchief', hatColor: pick(r, ['#7a3a2a', '#4a5a6a', '#8a7a5a', '#5a4a6a', '#3a4a3a']), top: pick(r, ['#5a4a3a', '#6a5a4a', '#4a4a5a']), dress: 'long', dressColor: pick(r, ['#3a3430', '#4a3a30', '#2e2e34', '#5a4a3a']), apron: pick(r, ['#c8bca4', '#a89c84', '#8a7e6a']), shoes: '#2a2018', coat: 'jacket', coatColor: pick(r, ['#6a5a4a', '#5a4a3e', '#7a6a58']) }, o);

// ------------------------------------------------------------------ navigation graph
function buildNav(W) {
  const nav = W.nav;
  const N = (id, x, y, z) => nav.node(id, x, y, z);
  // The street in front of the cut (z < 0): out of sight, as the near side of the yard is.
  const street = [];
  for (let x = -26; x <= 344; x += 6) street.push(N('st' + x, x, x < -6 ? 0.3 : x > 330 ? (x - 330) / 22 * 1.6 : 0, -1.4));
  nav.chain(street);
  const st = (x) => 'st' + (Math.round((x + 26) / 6) * 6 - 26);
  const spur = (id, x, y, z, from) => { N(id, x, y, z); nav.link(id, from || st(x)); return id; };
  N('town', 118, 0, -2.2); nav.link('town', st(118));
  // cottages: kitchen, stairs, bedroom
  for (const [c, x0, x1] of [['c1', -32, -21.2], ['c2', -20.6, -9.6]]) {
    spur(c + 'k', x0 + 7.6, 0.3, 2.6);
    N(c + 's0', x1 - 4.2, 0.3, 4.2); N(c + 's1', x1 - 1.4, 3.15, 4.2); N(c + 'b', x0 + 5.5, 3.15, 2.4);
    nav.chain([c + 'k', c + 's0']); nav.link(c + 's0', c + 's1', 'stairs'); nav.link(c + 's1', c + 'b');
  }
  // the screens: stair to the pickers' floor, the floor along the belt
  spur('scrFoot', 58.5, 0, 5.4, st(58));
  N('scrTop', 62.4, 3.0, 5.4); nav.link('scrFoot', 'scrTop', 'stairs');
  nav.chain(['scrTop', N('scr1', 70, 3.0, 2.6), N('scr2', 80, 3.0, 2.6), N('scr3', 88, 3.0, 2.6)]);
  // lamp room, stair to the deck, the deck and bank, the cage tops
  spur('lampQ', 120, 0, 0.8);
  spur('lampIn', 118, 0, 3.0);
  N('bankFoot', 133.2, 0, 4.1); nav.link('bankFoot', st(130));
  N('bankTop', 127.2, BANK, 3.1); nav.link('bankFoot', 'bankTop', 'stairs');
  nav.chain(['bankTop', N('bank1', 132, BANK, 2.0), N('bank2', 140, BANK, 2.0), N('bankS', 145.2, BANK, 2.0)]);
  nav.chain(['bank1', N('deck1', 118, BANK, 2.0), N('weigh', 104, BANK, 2.0), N('tipD', 97, BANK, 2.0)]);
  N('cabin', 129.2, BANK, 1.6); nav.link('cabin', 'bank1');
  N('cageAT', CAGE.ax, BANK + 0.12, 0.95); N('cageBT', CAGE.bx, BANK + 0.12, 0.95);
  nav.link('bankS', 'cageAT'); nav.link('cageAT', 'cageBT');
  // the shaft
  N('cageAB', CAGE.ax, PB + 0.12, 0.95); N('cageBB', CAGE.bx, PB + 0.12, 0.95);
  nav.link('cageAT', 'cageAB', 'lift'); nav.link('cageBT', 'cageBB', 'lift');
  nav.link('cageAB', 'cageBB');
  // surface buildings
  spur('engine', 179.8, 0.35, 4.0); spur('engineF', 178, 0, 1.2);
  spur('boiler', 205, 0, 1.0); spur('boiler2', 211, 0, 1.0);
  spur('smithy', 232, 0, 2.0); spur('fitting', 252, 0, 2.0); spur('saw', 272, 0, 1.0);
  spur('stableS', 292, 0, 1.6); spur('office', 304, 0, 1.6);
  N('officeUp0', 308.2, 0, 4.6); nav.link('office', 'officeUp0'); N('officeUp', 311.2, 3.4, 4.6); nav.link('officeUp0', 'officeUp', 'stairs'); N('officeUp2', 305, 3.4, 2.2); nav.link('officeUp', 'officeUp2');
  spur('fan', 330, 1.0, 1.6); spur('yardL', 50, 0, 7.6); spur('tipFoot', 44, 0, 0.6);
  N('tipTop', 24.5, 13.9, 1.4); nav.link('tipFoot', 'tipTop', 'stairs');
  N('moor', 380, 6.2, 8); nav.link('moor', st(338));
  // ---- underground
  // pit bottom
  nav.chain([N('pb0', 124, PB, 1.8), N('pb1', 132, PB, 1.8), N('pb2', 140, PB, 1.8), N('pbL', 145.4, PB, 1.8)]);
  nav.link('pbL', 'cageAB');
  nav.chain(['cageBB', N('pbR', 154.6, PB, 1.8), N('pb3', 162, PB, 1.8), N('pb4', 172, PB, 1.8), N('pump', 185, PB, 1.2), N('haul', 198, PB, 1.0), N('stb0', 207, PB, 1.0)]);
  const sw = nav.walkway('stb', 209, 236, PB, 1.0, 3);
  nav.link('stb0', sw[0]);
  // main road
  const road = nav.walkway('rd', 122, 60, PB, 1.8, 3.1);
  nav.link('pb0', road[0]);
  nav.chain([road[road.length - 1], N('part', 56, PB, 1.8), N('part2', 52.5, PB, 2.2)]);
  // horse road and the face
  const hr = nav.walkway('hr', 51, 21, PB, 2.3, 3);
  nav.link('part2', hr[0]);
  const fc = nav.walkway('fc', 20, 8.2, PB, 1.1, 1.5);
  nav.link(hr[hr.length - 1], fc[0]);
  // the drift
  const dr = [];
  for (let i = 0; i <= 6; i++) { const x = 27 + (i / 6) * 19.5; dr.push(N('dr' + i, x, PB + 0.1 + ((x - 26) / 22) * (-77 - PB - 0.1) + 0.05, 1.6)); }
  nav.chain(dr, 'stairs');
  nav.link(hr[hr.length - 3] || hr[0], 'dr0');
  // the return airway: reached by a ladder road at the parting [illustrative]
  const ra = nav.walkway('ra', 56, 140, -83, 1.2, 4);
  nav.link('part', ra[0], 'lift');
  return nav;
}

// ------------------------------------------------------------------ people
export function setupPeople(W, k) {
  const R = k.rng('people');
  buildNav(W);
  const hour0 = W.hour;
  const inH = XS.math.inHours;
  // Each person starts where their routine would have them at the opening hour.
  const add = (def) => {
    if (def.routine) {
      const st = def.routine.find((s) => !s.when || inH(hour0, s.when[0], s.when[1]));
      if (st) def.at = st.at;
    }
    const p = W.addPerson(def);
    p.baseSpeed = p.speed;
    const prev = def.update;
    p.onUpdate = (pp, dt, t) => {
      const path = pp.path, s = pp.routine && pp.routine[pp.step];
      const lift = pp.moving && path && path[pp.pi] && path[pp.pi].kind === 'lift';
      pp.speed = lift ? 6 : pp.baseSpeed;
      pp.hidden = lift || !!(s && s.away && !pp.moving);
      // stoop in the low seam at the face
      if (s) s.walkAnim = pp.y < PB + 0.5 && pp.x < 20.5 ? 'mineCrawl' : undefined;
      if (prev) prev(pp, dt, t, W);
    };
    return p;
  };
  const AWAY = { at: 'town', act: 'stand', away: true, label: 'At home in the town' };
  const away = (when) => Object.assign({}, AWAY, { when });
  const lamp = (when, label = 'Collecting his numbered lamp at the lamp room') => ({ at: 'lampQ', act: 'stand', face: 'in', dur: M(4), label, when });
  const giveBack = (when) => ({ at: 'lampQ', act: 'stand', face: 'in', dur: M(4), label: 'Handing his lamp back in', when, prop: null });
  const faceX = (i) => FACE.x0 + 1.0 + i * 1.45;
  const people = [];
  const P = (def) => { const p = add(def); people.push(p); return p; };

  // ---- Colliers at the face (day shift)
  const colliers = [
    ['Richard Gwilym', 'Saving to buy his own house.', 0],
    ['Dai Pritchard', 'Sings bass in a chapel choir.', 1],
    ['Owen Lloyd', 'Claims he can tell the weather above from the creak of the roof.', 2],
    ['William Harries', 'Lost two fingers in 1904 and works left-handed.', 3],
    ['Morgan Bevan', 'Chalks his dram tally number on his boot.', 4],
    ['Patrick Doyle', 'His grandfather came from County Cork to the ironworks.', 5],
    ['Albert Hale', 'Born in Somerset; still says "tub" and gets teased for it.', 6],
    ['Ifor Rees', 'Reads a Welsh newspaper on the walk home.', 7],
  ];
  for (const [name, bio, i] of colliers) {
    const x = faceX(i);
    const r = k.rng(name);
    const cos = collier(r, i === 2 ? { beard: '#6a6a6a', hair: '#8a8a8a' } : {});
    const homeBed = name === 'Richard Gwilym' ? [-28.9, 3.8, 3.72] : null;
    const routine = [
      lamp([4.6, 5.3]),
      { at: [141.5 - i * 0.7, BANK, 1.4 + (i % 2) * 0.7], act: i % 3 ? 'stand' : 'talk', face: 1, dur: M(3), label: 'Waiting on the bank for the cage', when: [5.0, 5.8] },
      { at: [x, PB, 1.75], act: 'mineHole', face: 'in', prop: 'pick', dur: M(i % 2 ? 70 : 90), label: 'Holing under the coal with his pick', when: [5.8, 9.5] },
      { at: [x + 0.4, PB, 1.4], act: i === 2 ? 'mineListen' : 'kneel', face: 'in', dur: M(8), label: i === 2 ? 'Freezing, pick raised, listening to the roof' : 'Setting a prop', when: [5.8, 9.5] },
      name === 'Patrick Doyle' ? { at: [23.7, PB, 2.45], act: 'stand', face: 'in', dur: M(18), label: 'Food break: looking at a fossil in the roof by the light of his lamp', when: [9.5, 9.9] }
        : { at: [x + 0.3, PB, 0.9], act: 'mineSitLamp', face: 'out', dur: M(18), label: 'Food break by the light of his lamp', when: [9.5, 9.9] },
      { at: [x, PB, 1.75], act: 'mineHole', face: 'in', prop: 'pick', dur: M(60), label: 'Holing under the coal', when: [9.9, 12.4] },
      { at: [x, PB, 1.5], act: 'mineShovelLow', face: 'in', prop: 'shovel', dur: M(45), label: 'Filling coal for the dram', when: [9.9, 12.4] },
      { at: 'cageAB', act: 'stand', dur: M(3), label: 'Riding the cage up at the end of the shift', when: [12.4, 13.4] },
      giveBack([13.0, 14.0]),
    ];
    if (homeBed) {
      const c = 'c1';
      routine.push({ at: c + 'k', act: 'sitEat', face: 'out', seat: 0.46, dur: M(80), label: 'Home black from the pit; dinner, then the tin bath', when: [14.0, 21.0] });
      routine.push({ at: homeBed, act: 'lie', face: 0, dur: M(200), label: 'Asleep', when: [21.0, 4.6] });
    } else routine.push(away([13.7, 4.6]));
    P({ name, role: 'collier', bio, costume: cos, routine, prop: 'lamp' });
  }
  // ---- Collier's boys (13 and over underground)
  const boys = [
    ['Gwilym Thomas', "collier's boy, 14", 'Keeps a crust for the horse he likes.', 'carry'],
    ['Johnny Price', "collier's boy, 13", 'Started work this year: his first season below.', 'shovel'],
    ['Emrys Davies', "collier's boy, 15", 'Wants to be a fireman one day.', 'pack'],
  ];
  boys.forEach(([name, role, bio, kind], i) => {
    const r = k.rng(name);
    const cos = collier(r, { build: 0.85, hat: 'flat' });
    const routine = [
      lamp([4.7, 5.4]),
      { at: [134.5 + i * 0.8, BANK, 1.5 + (i % 2) * 0.6], act: 'stand', face: 1, dur: M(3), label: 'Waiting on the bank to go down with the men', when: [5.0, 5.8] },
    ];
    if (kind === 'carry') routine.push(
      { at: 'rd18', act: 'carryShoulder', prop: 'plank', dur: M(5), label: 'Fetching props from the timber store', when: [6.0, 12.4] },
      { at: [FACE.x1 - 0.6, PB, 1.1], act: 'kneel', face: 'in', dur: M(20), label: 'Bringing timber in to the face', when: [6.0, 12.4] },
      { at: 'part', act: 'stand', face: 'out', dur: M(10), label: 'Running a message to the parting', when: [6.0, 12.4] },
      { at: [57.9, PB, 2.2], act: 'stand', face: 1, dur: M(6), label: 'Slipping his crust to the grey horse', when: [9.5, 10.0] });
    else if (kind === 'shovel') routine.push(
      { at: [21.8, PB, 2.25], act: 'shovel', face: -1, prop: 'shovel', dur: M(60), label: 'Shovelling small coal into the dram', when: [6.0, 12.4] },
      { at: [21.2, PB, 2.6], act: 'mineSitLamp', face: 'out', dur: M(18), label: 'Food break with his father', when: [9.5, 9.9] });
    else routine.push(
      { at: [2.6, PB, 1.4], act: 'kneel', face: 'in', dur: M(40), label: 'Building a pack of stone in the gob', when: [6.0, 12.4] },
      { at: [FACE.x0 + 1.5, PB, 1.4], act: 'mineShovelLow', face: 'in', prop: 'shovel', dur: M(40), label: 'Filling at the face', when: [6.0, 12.4] });
    routine.push({ at: 'cageAB', act: 'stand', dur: M(3), label: 'Riding up', when: [12.4, 13.4] }, giveBack([13.0, 14.0]));
    if (name === 'Johnny Price') routine.push({ at: 'c2k', act: 'sit', face: 'out', seat: 0.46, dur: M(100), label: 'Home with his mother', when: [14.0, 21.0] }, { at: [-12.85, 3.8, 3.93], act: 'lie', face: Math.PI, dur: M(200), label: 'Asleep', when: [21.0, 4.7] });
    else routine.push(away([13.7, 4.7]));
    P({ name, role, bio, costume: cos, routine, prop: 'lamp' });
  });
  // ---- Fireman, overman, under-manager, shot-firer
  P({ name: 'Evan Prosser', role: 'fireman (shift examiner)', bio: 'Keeps a pressed fern in his report book.', costume: official(k.rng('ep'), { skin: '#c89a78' }), prop: 'lamp', routine: [
    { at: 'lampQ', act: 'stand', face: 'in', dur: M(5), label: 'Taking his locked lamp', when: [2.5, 3.0] },
    { at: [11, PB, 1.2], act: 'mineTest', face: 'in', prop: 'lamp', dur: M(60), label: 'Testing the face for gas before the shift: watching for a blue cap on the flame', when: [3.0, 5.4] },
    { at: [44, -77.6, 1.6], act: 'mineTest', face: 1, prop: 'lamp', dur: M(30), label: 'Examining the drift', when: [3.0, 5.4] },
    { at: [115.6, PB, 2.6], act: 'sitWrite', face: 'out', seat: 0.8, prop: 'paper', dur: M(25), label: 'Writing his report at the lamp station', when: [5.4, 6.2] },
    { at: 'ra8', act: 'mineTest', face: 'in', prop: 'lamp', dur: M(30), label: 'Examining the return airway', when: [6.2, 11.0] },
    { at: 'rd10', act: 'walk', face: -1, dur: M(20), label: 'Walking the roads', when: [6.2, 11.0] },
    { at: 'cageAB', act: 'stand', dur: M(3), label: 'Going up', when: [11.0, 12.0] },
    away([11.6, 2.5]),
  ] });
  P({ name: 'Thomas Watkins', role: 'overman', bio: 'Hums hymn tunes when he is worried.', costume: official(k.rng('tw'), { beard: '#4a3020' }), prop: 'cane', routine: [
    { at: 'office', act: 'talk', face: 'out', dur: M(15), label: 'Taking his orders at the office', when: [4.8, 5.4] },
    { at: 'hr5', act: 'point', face: 'in', prop: 'cane', dur: M(15), label: 'Checking the props on the horse road', when: [5.6, 13.0] },
    { at: [54.2, PB, 1.4], act: 'talk', face: -1, dur: M(20), label: 'Arguing with the rippers about the height', when: [5.6, 13.0] },
    { at: 'pb2', act: 'handsBehind', face: 'out', dur: M(30), label: 'Watching the drams go up at the pit bottom', when: [5.6, 13.0] },
    { at: 'cageAB', act: 'stand', dur: M(3), label: 'Going up', when: [13.0, 13.6] },
    away([13.5, 4.8]),
  ] });
  P({ name: 'Edwin Jarrett', role: 'under-manager', bio: 'Studying at night for a first-class certificate.', costume: official(k.rng('ej'), { top: '#e8e0d0', coatColor: '#2a2a30' }), prop: 'lamp', routine: [
    { at: 'office', act: 'sitWrite', face: 'in', dur: M(30), label: 'Reading the firemen’s reports', when: [6.0, 7.2] },
    { at: [133.2, BANK, 2.55], act: 'point', face: 'in', dur: M(4), label: 'Tapping the barometer before going down', when: [7.0, 7.6] },
    { at: [FACE.x0 + 6, PB, 0.8], act: 'mineCrawl', face: -1, prop: 'lamp', dur: M(40), label: 'Inspecting the faces', when: [7.6, 11.5] },
    { at: 'rd3', act: 'point', face: 'in', prop: 'cane', dur: M(20), label: 'Looking at a cracked collar', when: [7.6, 11.5] },
    { at: 'officeUp2', act: 'sitWrite', face: 'in', seat: 0.46, dur: M(60), label: 'Writing up his inspection', when: [11.5, 16] },
    away([16, 6]),
  ] });
  P({ name: 'Henry Bowen', role: 'shot-firer', bio: 'Never takes sugar in his tea: a superstition.', costume: official(k.rng('hb'), { coat: null, top: '#6a6050' }), prop: 'lamp', routine: [
    { at: [116.8, PB, 2.6], act: 'workBench', face: 'in', prop: 'box', dur: M(15), label: 'Collecting the canister and the firing battery', when: [7.0, 18.0] },
    { at: 'dr6', act: 'mineTest', face: 1, prop: 'lamp', dur: M(10), label: 'Examining everything within 20 yards of the shot', when: [7.0, 18.0] },
    { at: 'dr3', act: 'crank', face: 1, dur: M(6), label: 'Firing the shot from a safe distance', when: [7.0, 18.0], onArrive: (p, w) => { w.data.shotAt = w.time + 3; } },
    { at: [55.0, PB, 1.0], act: 'stand', face: -1, dur: M(20), label: 'Waiting for the rippers to bore their holes', when: [7.0, 18.0] },
    away([18.0, 7.0]),
  ] });
  // ---- Hauliers, door boys, rider, hitchers, haulage engineman
  const harry = P({ name: 'Harry Coombes', role: 'haulier', bio: 'Talks to his horse in Welsh.', costume: collier(k.rng('hc')), prop: 'lamp', update: (p, dt, t, w) => {
    const H = w.data.horse1;
    if (!H || p.step < 0) return;
    const st = p.routine[p.step];
    if (st && st.horse && !p.moving) { p.x = H.x + H.dir * 0.4; p.z = 2.15; p.y = PB; p.targetHeading = H.dir > 0 ? 0 : Math.PI; st.act = H.moving ? 'walk' : 'stand'; p.dist += H.moving ? dt * 0.7 : 0; }
  }, routine: [
    { at: 'stb2', act: 'stand', face: 'in', dur: M(10), label: 'Fetching his horse from the stables', when: [5.6, 6.0] },
    { at: 'hr4', act: 'walk', horse: true, dur: M(200), label: 'Leading the horse with two drams between the face and the parting', when: [6.0, 13.1] },
    { at: 'stb3', act: 'stand', face: 'in', dur: M(10), label: 'Taking the horse back to its stall', when: [13.1, 13.4] },
    away([13.6, 5.6]),
  ] });
  void harry;
  P({ name: 'Tom Jenkins', role: 'haulier', bio: 'Whittles little horses from the ends of props.', costume: collier(k.rng('tj')), prop: 'lamp', routine: [
    { at: [57.6, PB, 1.7], act: 'sitWork', face: 'out', seat: 0.3, dur: M(30), label: 'Waiting by his horse, which has thrown a shoe; whittling', when: [6.0, 12.5] },
    { at: [56.6, PB, 2.1], act: 'stand', face: 1, dur: M(10), label: 'Talking to the horse', when: [6.0, 12.5] },
    away([13.5, 5.8]),
  ] });
  P({ name: 'Billy Powell', role: 'haulier (boy, 15)', bio: 'Afraid of rats, says he is not.', costume: collier(k.rng('bp'), { build: 0.85 }), prop: 'lamp', routine: [
    { at: [22.0, PB, 0.6], act: 'stand', face: 1, dur: M(20), label: 'Waiting at the loading end with his sprags', when: [6.0, 13.0] },
    { at: 'hr8', act: 'walk', face: 1, dur: M(8), label: 'Checking the rails for a derailed dram', when: [6.0, 13.0] },
    away([13.6, 5.8]),
  ] });
  const doorBoy = (name, bio, x, rel) => P({ name, role: 'door boy', bio, costume: collier(k.rng(name), { build: 0.8, top: '#6a5a48' }), prop: 'lamp', update: (p, dt, t, w) => {
    const st = p.routine[p.step];
    if (st && st.door != null && !p.moving) st.act = w.data.doorOpen && w.data.doorOpen[st.door] ? 'haul' : rel;
  }, routine: [
    { at: [x, PB, 3.22], act: rel, door: x < 109 ? 0 : 1, face: x < 109 ? -1 : 1, seat: 0.45, dur: M(240), label: 'Opening and shutting the air doors all shift, alone in the dark', when: [6.0, 13.2] },
    { at: [109.2, PB, 2.9], act: 'sitEat', face: 'out', seat: 0.45, dur: M(15), label: 'Sharing his bread', when: [9.6, 9.9] },
    away([13.6, 5.9]),
  ] });
  doorBoy('Sam Hopkins', 'Sings to himself to keep the dark away.', 107.0, 'sit');
  doorBoy('Willie Morris', 'Collects fossil leaves from the gob edge.', 111.2, 'sit');
  P({ name: 'Ned Parfitt', role: 'rider', bio: 'Counts the drams aloud in English and Welsh.', costume: collier(k.rng('np')), prop: 'lamp', routine: [
    { at: [58.4, PB, 0.55], act: 'kneel', face: 'in', dur: M(20), label: 'Clipping full drams on to the endless rope', when: [6.0, 13.0] },
    { at: 'rd12', act: 'walk', face: 1, dur: M(10), label: 'Walking the road, checking the clips', when: [6.0, 13.0] },
    away([13.6, 5.8]),
  ] });
  P({ name: 'Arthur Lewis', role: 'hitcher', bio: 'Has a whistle he is not supposed to use.', costume: collier(k.rng('al'), { clean: true }), prop: 'lamp', routine: [
    { at: [143.2, PB, 1.9], act: 'push', face: 1, dur: M(25), label: 'Pushing full drams into the cage', when: [5.7, 13.4] },
    { at: [145.6, PB, 3.1], act: 'point', face: 'in', dur: M(4), label: 'Signalling the bank on the knocker', when: [5.7, 13.4] },
    away([14.0, 5.5]),
  ] });
  P({ name: 'George Powell', role: 'hitcher', bio: 'Brother of Billy the haulier.', costume: collier(k.rng('gp'), { clean: true }), prop: 'lamp', routine: [
    { at: [155.6, PB, 1.9], act: 'push', face: 1, dur: M(25), label: 'Pulling the empties out of the other cage', when: [5.7, 13.4] },
    { at: 'pb3', act: 'talk', face: -1, dur: M(6), label: 'A word with the pumpsman', when: [5.7, 13.4] },
    away([14.0, 5.5]),
  ] });
  P({ name: 'Elias Hughes', role: 'haulage engineman', bio: 'Proud of the new electric haulage gear.', costume: collier(k.rng('eh'), { clean: true, coat: 'jacket', coatColor: '#4a4a44' }), prop: 'lamp', routine: [
    { at: [199.4, PB, 1.0], act: 'handsBehind', face: 'in', dur: M(40), label: 'Watching the haulage gear', when: [5.5, 13.6] },
    { at: [197.5, PB, 1.9], act: 'kneel', face: 'in', prop: 'jug', dur: M(12), label: 'Oiling the bearings', when: [5.5, 13.6] },
    away([14.0, 5.4]),
  ] });
  // ---- Afternoon and night shift below: rippers, repairer, roadman, pumpsman, ostler
  P({ name: 'Joseph Gibbs', role: 'ripper', bio: 'Works afternoons to be home for his sick wife in the mornings.', costume: collier(k.rng('jg')), prop: 'lamp', routine: [
    { at: [53.4, PB + 0.4, 1.6], act: 'pick', face: 'in', prop: 'pick', dur: M(50), label: 'Taking down the roof to give height', when: [14.5, 21.6] },
    { at: [55.4, PB, 0.9], act: 'stand', face: -1, dur: M(15), label: 'Waiting for the shot-firer', when: [14.5, 21.6] },
    { at: [53.0, PB, 2.6], act: 'carry', prop: 'box', dur: M(25), label: 'Clearing stone for the packs', when: [14.5, 21.6] },
    away([22, 14.2]),
  ] });
  P({ name: 'Daniel Edmunds', role: 'ripper', bio: 'Champion at the colliery quoits match.', costume: collier(k.rng('de')), prop: 'lamp', routine: [
    { at: [54.6, PB + 0.4, 1.9], act: 'pick', face: 'in', prop: 'pick', dur: M(60), label: 'Barring down loose roof', when: [14.5, 21.6] },
    { at: [2.8, PB, 1.3], act: 'kneel', face: 'in', dur: M(60), label: 'Building a pack in the gob', when: [14.5, 21.6] },
    away([22, 14.2]),
  ] });
  P({ name: 'Llewellyn Rowlands', role: 'repairer', bio: 'Keeps a tame robin at home.', costume: collier(k.rng('lr')), prop: 'lamp', routine: [
    { at: 'rd1', act: 'carryShoulder', prop: 'plank', dur: M(10), label: 'Carrying props in from the store', when: [21.5, 5.5] },
    { at: [86.0, PB, 2.2], act: 'hammer', face: 'in', prop: 'mallet', dur: M(80), label: 'Replacing a broken collar', when: [21.5, 5.5] },
    { at: [82.8, PB, 3.6], act: 'stand', face: 'out', dur: M(5), label: 'Checking the refuge hole is clear', when: [21.5, 5.5] },
    away([5.7, 21.3]),
  ] });
  P({ name: 'Walter Brice', role: 'roadman', bio: 'Measures everything with the length of his boot.', costume: collier(k.rng('wb')), prop: 'lamp', routine: [
    { at: 'part', act: 'carryShoulder', prop: 'plank', dur: M(10), label: 'Carrying rails', when: [14.5, 21.8] },
    { at: [54.0, PB, 1.6], act: 'kneel', face: 'in', prop: 'hammer', dur: M(70), label: 'Relaying the switch at the parting', when: [14.5, 21.8] },
    away([22.2, 14.2]),
  ] });
  P({ name: 'Rhys Owen', role: 'pumpsman', bio: 'The only man who likes the warm pump room.', costume: collier(k.rng('ro'), { clean: true, top: '#6a6050' }), prop: 'lamp', routine: [
    { at: [SHAFT.x1 - 0.3, PB, 2.3], act: 'point', face: 'in', dur: M(10), label: 'Checking the level in the sump', when: [0, 24] },
    { at: [187.6, PB, 1.4], act: 'kneel', face: 'in', prop: 'jug', dur: M(20), label: 'Oiling the pumps', when: [0, 24] },
    { at: [184.5, PB, 1.0], act: 'handsBehind', face: 'in', dur: M(40), label: 'Listening to the pumps', when: [0, 24] },
  ] });
  P({ name: 'Isaac Phillips', role: 'ostler', bio: 'Names every horse after a Welsh preacher.', costume: collier(k.rng('ip'), { clean: true, apron: '#5a4a38', top: '#7a6a58' }), prop: 'lamp', routine: [
    { at: 'stb1', act: 'sweep', prop: 'broom', dur: M(50), label: 'Mucking out the stalls', when: [4, 22] },
    { at: [206.6, PB, 2.8], act: 'carry', prop: 'bucket', dur: M(20), label: 'Carrying maize and chaff to the mangers', when: [4, 22] },
    { at: 'stb6', act: 'workBench', face: 'in', dur: M(60), label: 'Grooming', when: [4, 22] },
    { at: 'stb4', act: 'kneel', face: 'in', dur: M(20), label: 'Dressing a galled shoulder', when: [4, 22] },
    { at: [206.0, PB, 2.6], act: 'sleepSit', face: 'out', seat: 0.9, dur: M(120), label: 'Dozing by the feed bins on the night watch', when: [22, 4] },
  ] });
  // ---- Surface: banksman, winding engineman, stoker, lamp-men, weighers, smiths, others
  P({ name: 'John Henry Probert', role: 'banksman', bio: 'Keeps his cabin stove going all day.', costume: surfaceMan(k.rng('jhp'), { apron: '#6a5a46' }), routine: [
    { at: [146.4, BANK, 2.5], act: 'point', face: -1, dur: M(20), label: 'Receiving the cages and ringing the signals', when: [4.5, 21.6] },
    { at: [144.2, BANK, 1.4], act: 'talk', face: 1, dur: M(15), label: 'Checking the men into the cage', when: [4.5, 6.2] },
    { at: 'cabin', act: 'sitDrink', face: 'out', seat: 0.46, prop: 'mug', dur: M(12), label: 'A mug of tea by the cabin stove', when: [4.5, 21.6] },
    away([21.8, 4.5]),
  ] });
  P({ name: 'Benjamin Cole', role: 'winding engineman, 41', bio: 'Wears a clean collar to work every day.', costume: surfaceMan(k.rng('bc'), { top: '#f0e8d8', coat: 'jacket', coatColor: '#3a3a40', bottom: '#2e2a28', hat: 'flat' }), routine: [
    { at: [179.8, 0.35, 4.1], act: 'sit', face: 'out', seat: 0.46, dur: M(120), label: 'At the levers, winding the cages', when: [4.4, 13.8] },
    { at: [181.0, 0.35, 3.9], act: 'sitWrite', face: 'out', seat: 0.46, prop: 'book', dur: M(10), label: 'Entering the winds in his log', when: [4.4, 13.8] },
    away([14, 4.4]),
  ] });
  P({ name: 'Edward Pask', role: 'winding engineman (night)', bio: 'Reads the Western Mail between winds.', costume: surfaceMan(k.rng('epk'), { coat: 'jacket', coatColor: '#3a3a40' }), routine: [
    { at: [179.8, 0.35, 4.1], act: 'sitRead', face: 'out', seat: 0.46, prop: 'paper', dur: M(120), label: 'At the levers through the night', when: [14, 4.4] },
    away([4.4, 14]),
  ] });
  P({ name: 'Frank Rudge', role: 'boiler stoker', bio: 'From Staffordshire; misses the Potteries.', costume: surfaceMan(k.rng('fr'), { top: '#d8d0c0', sleeves: 'short', coat: null, hat: 'flat', skin: '#c89a78' }), routine: [
    { at: [206.4, 0, 1.25], act: 'shovel', face: 'in', prop: 'shovel', dur: M(30), label: 'Firing the boilers', when: [4, 16] },
    { at: [213.0, 0, 1.25], act: 'sweep', face: 'in', prop: 'broom', dur: M(8), label: 'Raking out a fire', when: [4, 16] },
    { at: [207.9, 0, 1.6], act: 'stand', face: 'in', dur: M(4), label: 'Checking the gauge glass', when: [4, 16] },
    away([16.2, 4]),
  ] });
  P({ name: 'Moss Hopkin', role: 'boiler stoker (night)', bio: 'Brews his tea on a shovel blade.', costume: surfaceMan(k.rng('mh'), { top: '#c8bca4', sleeves: 'short', coat: null }), routine: [
    { at: [199.6, 0, 1.25], act: 'shovel', face: 'in', prop: 'shovel', dur: M(30), label: 'Firing the boilers through the night', when: [16, 4] },
    { at: [205.2, 0, 0.5], act: 'sitDrink', face: 'out', seat: 0.3, prop: 'mug', dur: M(10), label: 'Tea', when: [16, 4] },
    away([4.2, 16]),
  ] });
  P({ name: 'Evan Lewis', role: 'lamp-man', bio: 'Knows every man by his lamp number.', costume: surfaceMan(k.rng('el'), { apron: '#4a3a2a', coat: null }), routine: [
    { at: [117.2, 0, 2.3], act: 'workBench', face: 'out', dur: M(60), label: 'Issuing lamps through the window', when: [4.5, 6.2] },
    { at: [117.2, 0, 2.3], act: 'workBench', face: 'out', dur: M(60), label: 'Taking lamps back in and counting them', when: [12.8, 14.3] },
    { at: [113.5, 0, 2.3], act: 'workBench', face: 'in', dur: M(90), label: 'Cleaning and filling lamps', when: [6.2, 12.8] },
    { at: [113.5, 0, 2.3], act: 'workBench', face: 'in', dur: M(90), label: 'Cleaning and filling lamps', when: [14.3, 18] },
    away([18, 4.5]),
  ] });
  P({ name: 'Reuben Clark', role: 'lamp-man', bio: 'Sneezes all day from the oil.', costume: surfaceMan(k.rng('rc'), { apron: '#4a3a2a', coat: null }), routine: [
    { at: [124.2, 0, 2.4], act: 'hammer', face: 'in', prop: 'hammer', dur: M(40), label: 'Locking lamps with a lead rivet', when: [4.5, 18] },
    { at: [121.0, 0, 2.3], act: 'workBench', face: 'out', dur: M(40), label: 'At the serving window', when: [4.5, 18] },
    away([18, 4.5]),
  ] });
  P({ name: 'David Jeremy', role: 'weigher', bio: 'Writes a neat copperplate hand.', costume: surfaceMan(k.rng('dj'), { top: '#e8e0d0', coat: 'jacket', coatColor: '#3a3430' }), routine: [
    { at: [104.8, BANK, 1.9], act: 'sitWrite', face: 'out', seat: 0.46, prop: 'paper', dur: M(60), label: 'Weighing each dram and writing up the tally', when: [5.8, 13.6] },
    away([14, 5.8]),
  ] });
  P({ name: 'Jacob Harris', role: 'checkweigher', bio: 'Elected by the men; a chapel deacon.', costume: surfaceMan(k.rng('jh'), { top: '#e8e0d0', coat: 'jacket', coatColor: '#2a2a30', beard: '#3a2a1e' }), routine: [
    { at: [106.4, BANK, 1.9], act: 'sitWrite', face: 'out', seat: 0.46, dur: M(40), label: 'Watching every weighing for the men', when: [5.8, 13.6] },
    { at: [104.0, BANK, 1.3], act: 'point', face: -1, dur: M(6), label: 'Disputing a dram with too much stone in it', when: [5.8, 13.6] },
    away([14, 5.8]),
  ] });
  P({ name: 'Moses Llewellyn', role: 'blacksmith', bio: 'Can sharpen a pick in under a minute.', costume: surfaceMan(k.rng('ml'), { apron: '#3a2a1e', coat: null, sleeves: 'short', top: '#c8bca4', beard: '#5a4030' }), routine: [
    { at: [228.5, 0, 2.2], act: 'hammer', face: 'in', prop: 'hammer', dur: M(60), label: 'Sharpening blunt pick points', when: [6, 17] },
    { at: [229.6, 0, 3.6], act: 'workBench', face: 'in', dur: M(15), label: 'Heating a bar in the hearth', when: [6, 17] },
    away([17.2, 6]),
  ] });
  P({ name: 'Alfie Moss', role: 'striker', bio: 'Courting a girl from the screens.', costume: surfaceMan(k.rng('am'), { apron: '#3a2a1e', coat: null, sleeves: 'short', top: '#d8d0c0' }), routine: [
    { at: [227.6, 0, 2.6], act: 'hammer', face: 1, prop: 'mallet', dur: M(60), label: 'Swinging the sledge for the smith', when: [6, 17] },
    { at: [230.2, 0, 3.7], act: 'bellows', face: 1, dur: M(10), label: 'Working the bellows', when: [6, 17] },
    away([17.2, 6]),
  ] });
  P({ name: 'Jim Tanner', role: 'farrier', bio: 'Carries peppermints for the horses.', costume: surfaceMan(k.rng('jt'), { apron: '#3a2a1e', coat: null }), routine: [
    { at: [234.8, 0, 2.2], act: 'hammer', face: 'in', prop: 'hammer', dur: M(60), label: 'Making horseshoes', when: [6, 9.5] },
    { at: [58.8, PB, 2.0], act: 'kneel', face: 1, prop: 'hammer', dur: M(70), label: 'Below ground, shoeing the horse that cast a shoe', when: [9.5, 12] },
    { at: [234.8, 0, 2.2], act: 'hammer', face: 'in', prop: 'hammer', dur: M(60), label: 'Making horseshoes', when: [12, 17] },
    away([17.2, 6]),
  ] });
  P({ name: 'Herbert Nash', role: 'fitter', bio: 'Building a bicycle from scrap.', costume: surfaceMan(k.rng('hn'), { top: '#4a5060', bottom: '#4a5060', coat: null }), routine: [
    { at: [252.8, 0, 0.6], act: 'hammer', face: 'in', prop: 'hammer', dur: M(60), label: 'Repairing dram wheels', when: [6.5, 17] },
    { at: [247.6, 0, 2.2], act: 'workBench', face: 'in', dur: M(60), label: 'Turning a shaft on the lathe', when: [6.5, 17] },
    away([17.2, 6.5]),
  ] });
  P({ name: 'Percy Wade', role: 'electrician', bio: 'One of the few in Blaenavon who understands the dynamo.', costume: surfaceMan(k.rng('pw'), { coat: 'jacket', coatColor: '#3a4048' }), prop: 'lamp', routine: [
    { at: [327.8, 1.0, 1.2], act: 'workBench', face: 'in', dur: M(30), label: 'Checking the fan motor', when: [7, 8.5] },
    { at: [196.0, PB, 1.4], act: 'workBench', face: 'in', dur: M(60), label: 'Below ground at the haulage motor', when: [8.5, 10.5] },
    { at: 'pb1', act: 'point', face: 'in', dur: M(30), label: 'Seeing to the lights at the pit bottom', when: [10.5, 11.5] },
    { at: [327.8, 1.0, 1.2], act: 'workBench', face: 'in', dur: M(60), label: 'In the fan house', when: [11.5, 17] },
    away([17, 7]),
  ] });
  P({ name: 'Caleb Morgan', role: 'sawyer', bio: 'Brother of Hannah at the screens.', costume: surfaceMan(k.rng('cm'), { apron: '#8a7a5a', coat: null }), routine: [
    { at: [269.4, 0, 1.3], act: 'push', face: 1, dur: M(40), label: 'Cutting pit props on the circular saw', when: [7, 16.5] },
    { at: [276.0, 0, 0.8], act: 'carryShoulder', prop: 'plank', dur: M(15), label: 'Stacking props', when: [7, 16.5] },
    away([16.7, 7]),
  ] });
  P({ name: 'Luke Williams', role: 'fan attendant', bio: 'Grows leeks in the fan-house yard.', costume: surfaceMan(k.rng('lw'), {}), routine: [
    { at: [336.2, 1.0, 5.0], act: 'stand', face: 'in', dur: M(5), label: 'Reading the water gauge', when: [6, 18] },
    { at: [332.0, 1.0, 1.0], act: 'kneel', face: 'in', prop: 'jug', dur: M(15), label: 'Oiling the fan bearings', when: [6, 18] },
    { at: [329.0, 1.0, 4.6], act: 'sitRead', face: 'out', seat: 0.46, dur: M(20), label: 'Reading between rounds', when: [6, 18] },
    away([18.2, 6]),
  ] });
  P({ name: 'Ben Watts', role: 'fan attendant (night)', bio: 'Whistles the same hymn all night.', costume: surfaceMan(k.rng('bw'), {}), routine: [
    { at: [336.2, 1.0, 5.0], act: 'stand', face: 'in', dur: M(5), label: 'Reading the water gauge', when: [18, 6] },
    { at: [329.0, 1.0, 4.6], act: 'sleepSit', face: 'out', seat: 0.46, dur: M(25), label: 'Nodding off by the motor', when: [18, 6] },
    away([6.2, 18]),
  ] });
  P({ name: 'Thomas Evans', role: 'clerk and timekeeper', bio: 'Plays the harmonium at chapel.', costume: official(k.rng('te'), { hat: null, top: '#f0e8d8' }), routine: [
    { at: [304.6, 0, 3.0], act: 'sitWrite', face: 'in', seat: 0.62, prop: 'paper', dur: M(60), label: 'Writing up the time book', when: [7.5, 17] },
    { at: [304.4, 0, 4.2], act: 'stand', face: 'in', dur: M(10), label: 'Pinning the Eight Hours notice', when: [7.5, 17] },
    away([17.2, 7.5]),
  ] });
  P({ name: 'Will Bennett', role: 'shunter', bio: 'A former railwayman from Pontypool.', costume: surfaceMan(k.rng('wbn'), { coat: 'jacket', coatColor: '#2a2e3a', hat: 'peaked', hatColor: '#2a2a30' }), prop: 'cane', routine: [
    { at: [58.2, 0, 3.0], act: 'push', face: -1, dur: M(20), label: 'Moving waggons under the chute with his pole', when: [6, 17] },
    { at: [70.0, 0, 3.1], act: 'stand', face: 'out', dur: M(15), label: 'Watching the waggon fill', when: [6, 17] },
    away([17.2, 6]),
  ] });
  // ---- The screens: women, girls and boys picking stone (from 5 am; the 10-hour limit)
  const pickers = [
    ['Hannah Morgan', 'Sends a shilling a week to her mother in Abergavenny.', 69.5],
    ['Mary Ann Price', 'Mother of Johnny, the collier’s boy.', 72.5],
    ['Sarah Jane Evans', 'Sixteen; saving for a Sunday hat.', 75.5],
  ];
  for (const [name, bio, x] of pickers) P({ name, role: name === 'Sarah Jane Evans' ? 'screen hand, 16' : 'screen hand', bio, costume: screenWoman(k.rng(name)), routine: [
    { at: [x, 3.0, 2.45], act: 'workBench', face: 'out', dur: M(120), label: 'Picking stone and dirt from the coal on the belt', when: [6, 10] },
    { at: [64 + (x - 69.5) * 0.5, 3.0, 4.6], act: 'sitEat', face: 'out', seat: 0.46, dur: M(30), label: 'The half-hour break', when: [10, 10.5] },
    { at: [x, 3.0, 2.45], act: 'workBench', face: 'out', dur: M(120), label: 'Picking on the belt', when: [10.5, 16] },
    name === 'Mary Ann Price' ? { at: 'c2k', act: 'pour', prop: 'jug', face: 1, dur: M(60), label: 'Heating water again and again for the tin bath', when: [16.5, 21] } : away([16.5, 6]),
    ...(name === 'Mary Ann Price' ? [{ at: [-17.5, 3.8, 3.98], act: 'lie', face: 0, dur: M(200), label: 'Asleep', when: [21, 5.5] }] : []),
  ] });
  P({ name: 'Tommy Short', role: 'screen boy, 13', bio: 'Wants to go underground "like a man".', costume: surfaceMan(k.rng('ts'), { build: 0.8, coat: null }), routine: [
    { at: [78.5, 3.0, 2.45], act: 'workBench', face: 'out', dur: M(90), label: 'Picking stone on the belt', when: [6, 16] },
    { at: [40, 0, 1.0], act: 'run', face: -1, dur: M(4), label: 'Chasing a dog off the tip', when: [11, 11.5] },
    away([16.5, 6]),
  ] });
  // ---- At home: a collier's wife and children in the cottages (fictional family)
  P({ name: 'Margaret Gwilym', role: 'collier’s wife', bio: 'Richard’s wife. There are no pithead baths until 1939, so she heats the water.', costume: screenWoman(k.rng('mg'), { hat: null, hairStyle: 'bun', apron: '#e8e0d0', coat: null, top: '#5a4a5a' }), routine: [
    { at: [-26.9, 0.3, 2.9], act: 'stir', face: 'in', dur: M(60), label: 'Cooking at the range', when: [5, 13.5] },
    { at: [-26.6, 0.3, 1.7], act: 'pour', face: 1, prop: 'jug', dur: M(50), label: 'Pouring a kettle into the tin bath', when: [13.5, 17] },
    { at: [-24.0, 0.3, 1.9], act: 'sitWork', face: 'out', seat: 0.46, dur: M(60), label: 'Darning by the lamp', when: [17, 22] },
    { at: [-28.9, 3.8, 4.22], act: 'lie', face: 0, dur: M(200), label: 'Asleep', when: [22, 5] },
  ] });
  for (const [name, x, bed] of [['Annie Gwilym', -23.4, [-24.45, 3.8, 3.72]], ['Tom Gwilym', -22.6, [-24.45, 3.8, 4.15]]]) P({ name, role: 'child', bio: name === 'Annie Gwilym' ? 'Eight; carries her father’s dinner.' : 'Five; frightened of the pit hooter.', costume: { child: true, skin: '#e8c4a0', hair: '#6b4428', top: name === 'Annie Gwilym' ? '#8a4a3a' : '#4a5a6a', dress: name === 'Annie Gwilym' ? 'knee' : null, dressColor: '#7a3a2a', bottom: '#3a3430' }, routine: [
    { at: [x, 0.3, 2.4], act: name === 'Annie Gwilym' ? 'sitRead' : 'sit', face: 'out', seat: 0.3, dur: M(60), label: 'At home', when: [7, 20.5] },
    { at: bed, act: 'lie', face: Math.PI, dur: M(200), label: 'Asleep', when: [20.5, 7] },
  ] });

  // ---- Extras
  const extras = [];
  const X = (def) => { const p = add(def); extras.push(p); return p; };
  // more colliers at the face and in the roads
  for (let i = 0; i < 6; i++) {
    const r = k.rng('ex' + i);
    const x = 1.6 + i * 1.0;
    if (i < 2) X({ role: 'collier', costume: collier(r), prop: 'lamp', routine: [
      lamp([4.6, 5.3]), { at: [FACE.x1 - 0.3 - i * 0.6, PB, 1.0], act: i ? 'mineShovelLow' : 'mineHole', face: 'in', prop: i ? 'shovel' : 'pick', dur: M(90), label: 'At the face', when: [5.8, 12.6] }, away([13.4, 4.6]) ] });
    else X({ role: 'collier', costume: collier(r), prop: 'lamp', routine: [
      lamp([4.6, 5.3]), { at: [21 + i * 0.7, PB, 2.5], act: 'shovel', face: -1, prop: 'shovel', dur: M(90), label: 'Filling the drams at the loading end', when: [5.8, 12.6] }, away([13.4, 4.6]) ] });
    void x;
  }
  // repairers and rippers on the night shift, men on the afternoon shift
  for (let i = 0; i < 6; i++) {
    const r = k.rng('nr' + i);
    const spots = [[70.5, 'hammer', 'mallet'], [96.0, 'carryShoulder', 'plank'], [120.4, 'carryShoulder', 'plank'], [30.0, 'hammer', 'mallet'], [40.5, 'kneel', null], [16.2, 'kneel', null]];
    const [x, act, prop] = spots[i];
    X({ role: i < 3 ? 'repairer (night shift)' : 'repairer (afternoon shift)', costume: collier(r), prop: 'lamp', routine: [
      { at: [x, PB, i < 3 ? 2.2 : 2.2], act, prop, face: 'in', dur: M(90), label: 'Renewing props and collars on the road', when: i < 3 ? [22, 5.6] : [14.4, 21.6] },
      away(i < 3 ? [5.8, 21.8] : [22, 14.2]) ] });
  }
  // the cage riders: a load of men in each cage at shift changes
  const ridersOn = (h) => (h >= 4.9 && h < 6.0) || (h >= 12.6 && h < 13.8) || (h >= 14.2 && h < 14.7) || (h >= 21.4 && h < 22.4);
  for (let c = 0; c < 2; c++) for (let j = 0; j < 4; j++) {
    const r = k.rng('cr' + c + j);
    add({ role: 'collier riding the cage', costume: collier(r, { clean: true }), prop: j % 2 ? 'lamp' : null, act: 'stand', face: j < 2 ? 'out' : 'in', update: (p, dt, t, w) => {
      const s = w.data.wind && w.data.wind.s != null ? w.data.wind.s : 0;
      p.hidden = !ridersOn(w.hour) || (w.hour >= 6 && w.hour < 13.2);
      p.x = (c ? CAGE.bx : CAGE.ax) - 0.55 + (j % 2) * 1.1; p.y = cageY(c, s) + 0.12; p.z = j < 2 ? 0.55 : 1.3;
    } });
  }
  // a man reading the notice of winding times with his finger
  X({ role: 'collier', costume: collier(k.rng('notice'), { clean: true }), prop: 'lamp', routine: [
    { at: [136.4, BANK, 2.55], act: 'point', face: 'in', dur: M(20), label: 'Reading the notice of winding times with his finger', when: [4.8, 5.8] }, away([5.9, 4.7]) ] });
  // men waiting at the bank and in the lamp room queue at the change of shift
  for (let i = 0; i < 10; i++) {
    const r = k.rng('q' + i);
    const pos = i < 5 ? [113 + i * 2.6, 0, 0.6 + (i % 2) * 0.4] : [133 + (i - 5) * 2.2, BANK, 1.3 + (i % 2) * 0.8];
    X({ role: 'collier', costume: collier(r, { clean: true }), prop: i < 5 ? null : 'lamp', routine: [
      { at: pos, act: i % 3 ? 'stand' : 'talk', face: i < 5 ? 'in' : 1, dur: M(30), label: i < 5 ? 'Queueing at the lamp-room window' : 'Waiting for the cage', when: [4.6, 5.9] },
      { at: pos, act: i % 3 ? 'stand' : 'talk', face: i < 5 ? 'in' : -1, dur: M(30), label: i < 5 ? 'Handing in his lamp' : 'Just up from below, black from the pit', when: [12.9, 13.9] },
      away([14.0, 4.6]), away([5.9, 12.9]) ] });
  }
  // more screen hands and boys
  for (let i = 0; i < 7; i++) {
    const r = k.rng('sh' + i);
    const woman = i < 4;
    X({ role: woman ? 'screen hand' : 'screen boy', costume: woman ? screenWoman(r) : surfaceMan(r, { build: 0.82, coat: null }), routine: [
      { at: [67.6 + i * 2.6 + (i > 0 ? 6.4 : 0) * 0, 3.0, 2.45], act: 'workBench', face: 'out', dur: M(120), label: 'Picking stone from the coal', when: [6, 10] },
      { at: [63.0 + i * 0.9, 3.0, 5.2], act: 'sitEat', face: 'out', seat: 0.46, dur: M(30), label: 'The half-hour break', when: [10, 10.5] },
      { at: [67.6 + i * 2.6, 3.0, 2.45], act: 'workBench', face: 'out', dur: M(120), label: 'Picking stone from the coal', when: [10.5, 16] },
      away([16.4, 6]) ] });
  }
  // smiths at the other hearths, a tip man, the manager, labourers in the yard
  X({ role: 'blacksmith', costume: surfaceMan(k.rng('s2'), { apron: '#3a2a1e', coat: null, sleeves: 'short' }), routine: [{ at: [241.1, 0, 2.2], act: 'hammer', face: 'in', prop: 'hammer', dur: M(60), label: 'Making links for a haulage chain', when: [6, 17] }, away([17.2, 6])] });
  X({ role: 'tip man', costume: surfaceMan(k.rng('tip'), { coat: null }), routine: [{ at: 'tipTop', act: 'shovel', face: -1, prop: 'shovel', dur: M(60), label: 'Emptying waste trams at the top of the tip', when: [6.5, 16] }, away([16.2, 6.5])] });
  X({ name: null, role: 'colliery manager', costume: official(k.rng('mgr'), { hat: 'bowler', hatColor: '#1e1c1c', coatColor: '#1e1e22', top: '#f0e8d8', coat: 'long' }), prop: 'cane', routine: [
    { at: 'officeUp2', act: 'sitWrite', face: 'in', seat: 0.46, dur: M(60), label: 'At his desk', when: [8, 11] },
    { at: [140, BANK, 2.6], act: 'talk', face: -1, dur: M(20), label: 'Inspecting the bank', when: [11, 12] },
    { at: 'officeUp2', act: 'sitWrite', face: 'in', seat: 0.46, dur: M(60), label: 'At his desk', when: [12, 17] },
    away([17, 8]) ] });
  for (let i = 0; i < 4; i++) X({ role: 'labourer', costume: surfaceMan(k.rng('lab' + i), { coat: null }), routine: [
    { at: [[160.5, 0, 4.6], [160, 0, 1.0], [262.6, 0, 3.2], [315, 0, 1.0]][i], act: ['shovel', 'push', 'carryShoulder', 'sweep'][i], prop: ['shovel', null, 'plank', 'broom'][i], face: 'out', dur: M(40), label: ['Shovelling ashes', 'Pushing a barrow', 'Carrying split timber', 'Sweeping the yard'][i], when: [7, 16.5] },
    away([16.7, 7]) ] });
  // the night shift: repairers on the roads, a second fireman, the night banksman
  [[31.0, 'hammer', 'mallet'], [42.0, 'carryShoulder', 'plank'], [214.0, 'sweep', 'broom'], [128.0, 'carry', 'box']].forEach(([x, act, prop], i) => X({ role: 'repairer (night shift)', costume: collier(k.rng('nn' + i)), prop: 'lamp', routine: [
    { at: [x, PB, 2.3], act, prop, face: 'in', dur: M(90), label: 'Night work on the roads while the coal is still', when: [21.8, 5.4] }, away([5.8, 21.6]) ] }));
  P({ name: 'Abel Morris', role: 'fireman (afternoon and night)', bio: 'Keeps a canary at home and swears it can sing in Welsh.', costume: official(k.rng('abm')), prop: 'lamp', routine: [
    { at: [12.6, PB, 1.2], act: 'mineTest', face: 'in', prop: 'lamp', dur: M(40), label: 'Examining the face for gas', when: [14.2, 2.5] },
    { at: 'rd6', act: 'walk', face: -1, dur: M(20), label: 'Walking the roads', when: [14.2, 2.5] },
    { at: [115.6, PB, 2.6], act: 'sitWrite', face: 'out', seat: 0.8, prop: 'paper', dur: M(20), label: 'Writing his report', when: [14.2, 2.5] },
    away([2.8, 14]) ] });
  P({ name: 'Gomer Jones', role: 'night banksman', bio: 'Counts the stars between winds.', costume: surfaceMan(k.rng('gj'), { apron: '#6a5a46' }), routine: [
    { at: [146.4, BANK, 2.5], act: 'point', face: -1, dur: M(20), label: 'Ringing the signals for the night winds', when: [21.6, 4.5] },
    { at: 'cabin', act: 'sitDrink', face: 'out', seat: 0.46, prop: 'mug', dur: M(25), label: 'Keeping warm by the cabin stove', when: [21.6, 4.5] },
    away([4.6, 21.5]) ] });
  // more hands below: timbermen, a lad at the parting, men waiting at the pit bottom
  const below = [
    [[119.6, PB, 1.9], 'carryShoulder', 'plank', 'timberman', 'Sending props in-bye from the store', [6, 13.2]],
    [[54.6, PB, 0.8], 'push', null, 'rider’s lad', 'Pushing an empty dram on to the switch', [6, 13.2]],
    [[138.0, PB, 2.2], 'talk', null, 'collier', 'Waiting at the pit bottom for the cage up', [12.4, 13.6]],
    [[136.6, PB, 1.4], 'stand', null, 'collier', 'Waiting at the pit bottom for the cage up', [12.4, 13.6]],
    [[134.8, PB, 2.4], 'sitEat', null, 'collier', 'Waiting for the cage, finishing his food', [12.4, 13.6]],
    [[231.5, PB, 1.0], 'carry', 'bucket', 'ostler’s boy', 'Carrying water to the stalls', [6, 18]],
    [[64.5, PB, 3.4], 'stand', null, 'collier', 'Stepping into a refuge hole as the drams go by', [6, 13]],
    [[160.0, PB, 2.6], 'push', null, 'collier', 'Pushing an empty dram along the pit bottom', [6, 13]],
  ];
  below.forEach(([at, act, prop, role, label, when], i) => X({ role, costume: collier(k.rng('bl' + i), { build: role.includes('lad') || role.includes('boy') ? 0.85 : 1 }), prop: prop || 'lamp', routine: [
    { at, act, prop, face: act === 'sitEat' ? 'out' : i % 2 ? 1 : -1, seat: act === 'sitEat' ? 0.0 : undefined, dur: M(60), label, when }, away([when[1] + 0.3, when[0] - 0.4]) ] }));
  // more hands about the yard and the shops
  const yard = [
    [[226.6, 0, 3.8], 'bellows', null, 'striker', 'Working the bellows at the far hearth', [6, 17]],
    [[240.0, 0, 2.6], 'hammer', 'mallet', 'striker', 'Striking for the smith', [6, 17]],
    [[202.8, 0, 0.6], 'shovel', 'shovel', 'boiler-house labourer', 'Wheeling coal to the boilers', [6, 16]],
    [[279.0, 0, 0.6], 'carryShoulder', 'plank', 'timber yard labourer', 'Stacking pit props', [7, 16.5]],
    [[257.8, 0, 4.4], 'workBench', null, 'fitter’s apprentice', 'Filing at the vice', [6.5, 17]],
    [[92.0, BANK, 1.8], 'push', null, 'banksman’s lad', 'Running the full drams to the tippler', [6, 13.4]],
    [[97.4, BANK, 2.4], 'workBench', null, 'tippler man', 'Turning over the drams on to the screens', [6, 13.4]],
    [[66.2, 3.0, 2.4], 'workBench', null, 'screen hand', 'Watching the coal into the chute', [6, 16]],
    [[160.6, 0, 2.6], 'sweep', 'broom', 'yard labourer', 'Sweeping coal dust from the yard', [7, 16]],
    [[300.8, 0, 1.2], 'talk', null, 'collier', 'At the pay window', [12.5, 15]],
  ];
  yard.forEach(([at, act, prop, role, label, when], i) => X({ role, costume: role === 'screen hand' ? screenWoman(k.rng('yd' + i)) : surfaceMan(k.rng('yd' + i), { apron: role.includes('striker') ? '#3a2a1e' : null, coat: role.includes('striker') ? null : undefined }), routine: [
    { at, act, prop, face: i % 2 ? 'in' : 'out', dur: M(60), label, when }, away([when[1] + 0.2, when[0] - 0.2]) ] }));
  // more hands: boys at the jigging screen, a winchman at the foot of the tip, men at the coal heap
  const more = [
    [[87.6, 3.0, 2.3], 'workBench', null, 'screen boy', 'Raking stone off the jigging screen', [6, 16], 'boy'],
    [[85.6, 3.0, 2.4], 'workBench', null, 'screen boy', 'Picking out the big stones', [6, 16], 'boy'],
    [[45.6, 0, 3.4], 'crank', null, 'winchman', 'Working the winch that draws trams up the tip', [6.5, 16], 'man'],
    [[199.0, 0, 0.6], 'shovel', 'shovel', 'boiler-house labourer', 'Shovelling coal into the barrow', [5, 16], 'man'],
    [[264.6, 0, 4.0], 'carryShoulder', 'plank', 'timber yard labourer', 'Carrying split timber', [7, 16.5], 'man'],
    [[248.8, 0, 3.3], 'hammer', 'hammer', 'fitter', 'Fitting a new axle to a dram', [6.5, 17], 'man'],
    [[210.5, PB, 1.0], 'walk', null, 'haulier', 'Leading a horse to the stables at the end of his shift', [13.2, 13.8], 'below'],
    [[236.4, PB, 4.0], 'carryShoulder', 'sack', 'ostler\u2019s boy', 'Carrying chaff to the far stalls', [14, 21], 'below'],
  ];
  more.forEach(([at, act, prop, role, label, when, kind], i) => X({ role, costume: kind === 'below' ? collier(k.rng('mo' + i)) : surfaceMan(k.rng('mo' + i), { build: kind === 'boy' ? 0.8 : 1, coat: null }), prop: kind === 'below' ? 'lamp' : null, routine: [
    { at, act, prop, face: i % 2 ? 'in' : 'out', dur: M(60), label, when }, away([when[1] + 0.2, when[0] - 0.2]) ] }));
  // townsfolk on the hillside streets, small in the distance
  for (let i = 0; i < 18; i++) {
    const x = [-30, -20, 6, 40, 60, 78, 96, 150, 182, 214, 268, 290, -12, 22, 66, 160, 200, 276][i], z = [69.6, 69.6, 69.6, 91.6, 91.6, 91.6, 73.6, 117.6, 117.6, 117.6, 103.6, 103.6, 69.6, 69.6, 91.6, 117.6, 117.6, 103.6][i];
    const woman = i % 3 !== 1;
    const y = terrainH(x + 1.5, z - 1.2);
    add({ role: woman ? 'neighbour' : 'child', costume: woman ? screenWoman(k.rng('tw' + i), { apron: '#e8e0d0', coat: null }) : { child: true, top: '#6a4a3a', bottom: '#3a3430' }, at: [x + 1.5, y, z - 1.2], act: woman ? (i % 2 ? 'talk' : 'stand') : 'stand', face: 'out', update: (p, dt, t, w) => { p.hidden = w.sun().day < 0.3; } });
  }
  return { people, extras };
}

void SX; void windAt;
