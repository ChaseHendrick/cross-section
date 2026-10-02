/* Submarine scene: the walkway graph, the casting list (dossier 4d, all fictional) and the extras.
 *
 * About 80 men aboard (dossier 4a): 42 named characters and 38 others. Night is the boat's working
 * day: she surfaces about 1900 to charge her batteries and dives before first light (S25, S34).
 * Times below are ship's hours; the bridge and deck are manned only while she is on the surface.
 */
import { XS, anims } from '../../engine/index.js';
import { X, DECK, LOW, CT, BRIDGE, deckY } from './geom.js';
import { A } from './rooms.js';

export const SURF = [19.2, 5.45];   // on the surface (dossier 4c, times composite)

// ------------------------------------------------------------------ the walkway graph
export function buildNav(W) {
  const nav = W.nav;
  const n = (id, x, y, z) => nav.node(id, x, y, z);
  const Z = 0.32;
  // Main level, bow to stern, with the watertight doors.
  const main = [
    n('ftr:fwd', 12.9, DECK.ftr, 0.3), n('ftr:a', 14.6, DECK.ftr, Z), n('ftr:b', 17.0, DECK.ftr, Z), n('ftr:c', 19.6, DECK.ftr, Z), n('ftr:aft', 21.8, DECK.ftr, 0.4),
  ];
  nav.chain(main);
  const door = (id, x, y) => n(id, x, y, 0.3);
  const seq = (ids) => nav.chain(ids);
  door('d:fb', X.fb, DECK.fb);
  nav.link('ftr:aft', 'd:fb', 'door');
  seq(['d:fb', n('fb:pantry', 23.7, DECK.fb, Z), n('fb:ward', 25.6, DECK.fb, Z), n('fb:state', 27.7, DECK.fb, Z), n('fb:capt', 29.15, DECK.fb, Z), n('fb:chief', 30.6, DECK.fb, Z), n('fb:yeo', 31.9, DECK.fb, Z)]);
  door('d:cr', X.cr, DECK.cr);
  nav.link('fb:yeo', 'd:cr', 'door');
  seq(['d:cr', n('cr:fwd', 33.0, DECK.cr, 0.4), n('cr:pump', 34.5, DECK.cr, 0.32), n('cr:mid', 35.3, DECK.cr, 0.55), n('cr:gyro', 36.4, DECK.cr, 0.55), n('cr:lad', 37.6, DECK.cr, 0.42), n('cr:aft', 38.25, DECK.cr, 0.4), n('radio', 39.3, DECK.cr, 0.35)]);
  door('d:ab', X.ab, DECK.ab);
  nav.link('radio', 'd:ab', 'door');
  seq(['d:ab', n('galley', 41.6, DECK.ab, 0.12), n('mess:a', 43.3, DECK.ab, 0.25), n('mess:b', 44.6, DECK.ab, 0.25), n('mess:c', 45.6, DECK.ab, 0.25),
    n('berth:a', 46.6, DECK.ab, Z), n('berth:b', 48.6, DECK.ab, Z), n('berth:c', 50.6, DECK.ab, Z), n('berth:d', 52.2, DECK.ab, Z), n('wash', 53.2, DECK.ab, 0.35)]);
  door('d:fer', X.fer, DECK.eng);
  nav.link('wash', 'd:fer', 'door');
  seq(['d:fer', n('fer:a', 55.2, DECK.eng, Z), n('fer:b', 57.4, DECK.eng, Z), n('fer:c', 59.8, DECK.eng, Z), n('fer:d', 61.5, DECK.eng, Z)]);
  door('d:aer', X.aer, DECK.eng);
  nav.link('fer:d', 'd:aer', 'door');
  seq(['d:aer', n('aer:a', 63.2, DECK.eng, Z), n('aer:b', 65.4, DECK.eng, Z), n('aer:c', 67.8, DECK.eng, Z), n('aer:d', 69.6, DECK.eng, Z)]);
  door('d:man', X.man, DECK.man);
  nav.link('aer:d', 'd:man', 'door');
  seq(['d:man', n('man:a', 71.0, DECK.man, 0.35), n('man:b', 72.5, DECK.man, 0.42), n('man:c', 74.4, DECK.man, 0.42), n('man:d', 75.8, DECK.man, 0.4)]);
  door('d:atr', X.atr, DECK.atr);
  nav.link('man:d', 'd:atr', 'door');
  seq(['d:atr', n('atr:a', 77.6, DECK.atr, Z), n('atr:b', 80.4, DECK.atr, Z), n('atr:c', 83.3, DECK.atr, Z), n('atr:d', 85.9, DECK.atr, 0.35)]);

  // Lower flats and wells.
  n('ftrL:lad', 21.8, LOW.ftr, 0.45); nav.link('ftr:aft', 'ftrL:lad', 'ladder');
  seq(['ftrL:lad', n('ftrL:a', 19.0, LOW.ftr, 0.3), n('ftrL:b', 15.6, LOW.ftr, 0.3), n('ftrL:c', 13.0, LOW.ftr, 0.3)]);
  const wy = LOW.well + 0.15 + 1.47;
  n('well1:in', 31.4, wy, 0.25); nav.link('fb:chief', 'well1:in', 'ladder');
  nav.chain(['well1:in', n('well1:a', 29.0, wy, 0.25), n('well1:b', 26.5, wy, 0.25), n('well1:c', 24.3, wy, 0.25)], 'swim');
  n('well2:in', 52.4, wy, 0.25); nav.link('berth:d', 'well2:in', 'ladder');
  nav.chain(['well2:in', n('well2:a', 50.0, wy, 0.25), n('well2:b', 47.6, wy, 0.25)], 'swim');
  n('pump:lad', 34.5, LOW.pump, 0.25); nav.link('cr:pump', 'pump:lad', 'ladder');
  seq(['pump:lad', n('pump:a', 35.9, LOW.pump, 0.45), n('pump:b', 38.3, LOW.pump, 0.3)]);
  n('store:lad', 42.3, LOW.well, 0.2); nav.link('galley', 'store:lad', 'ladder');
  for (const [k, xb] of [['fer', X.aer], ['aer', X.man]]) {
    const lx = xb - 0.6;
    n(k + 'L:lad', lx, LOW.eng, 0.3); nav.link(k + ':d', k + 'L:lad', 'ladder');
    seq([k + 'L:lad', n(k + 'L:a', lx - 2.4, LOW.eng, 0.32), n(k + 'L:b', lx - 4.6, LOW.eng, 0.3), n(k + 'L:c', lx - 6.6, LOW.eng, 0.35)]);
  }
  n('mot:lad', 70.85, LOW.motor, 0.3); nav.link('man:a', 'mot:lad', 'ladder');
  seq(['mot:lad', n('mot:a', 72.6, LOW.motor, 0.4), n('mot:b', 75.2, LOW.motor, 0.55)]);

  // Conning tower and bridge.
  n('ct:lad', 37.6, CT.deck, 0.42); nav.link('cr:lad', 'ct:lad', 'ladder');
  seq(['ct:lad', n('ct:mid', 36.3, CT.deck, 0.35), n('ct:fwd', 34.4, CT.deck, 0.3)]);
  n('br:hatch', 34.4, CT.yc + CT.r - 0.03, 0.22); nav.link('ct:fwd', 'br:hatch', 'ladder');
  seq(['br:hatch', n('br:fwd', 33.05, BRIDGE.deck, 0.45), n('br:fgun', 32.85, 9.1, 0.35)]);
  seq(['br:hatch', n('br:side', 34.9, BRIDGE.deck, 0.98), n('br:mid', 36.3, BRIDGE.deck, 1.0), n('br:aft', 39.7, BRIDGE.deck, 0.7), n('br:agun', 41.7, 9.7, 0.55)]);
  n('lk:S', 36.3, 10.62, 0.85); nav.link('br:mid', 'lk:S', 'ladder');
  n('lk:P', 36.3, 10.62, -0.85); nav.link('br:mid', 'lk:P', 'ladder');
  n('lk:A', 40.2, BRIDGE.deck, 0.35); nav.link('br:aft', 'lk:A');
  n('deck:fwd', 31.2, deckY(31.2), 0.45); nav.link('br:fgun', 'deck:fwd', 'ladder');
  n('deck:gun', 29.9, deckY(29.9), 0.6); nav.link('deck:fwd', 'deck:gun');
  n('deck:aft', 44.3, deckY(44.3), 0.6); nav.link('br:agun', 'deck:aft', 'ladder');
}

// ------------------------------------------------------------------ costumes
const SK = { pale: '#f1c9a5', fair: '#e6b48f', tan: '#d9a27a', olive: '#c88c62', brown: '#a96e47', dark: '#8a5634', deep: '#6b4026' };
const C = {
  khaki: (o = {}) => Object.assign({ top: '#b8a47a', bottom: '#a8946a', shoes: '#4a3424', hat: 'peaked', hatColor: '#b8a47a' }, o),
  chief: (o = {}) => Object.assign({ top: '#b4a078', bottom: '#a4906a', shoes: '#3a2a1e', hat: 'peaked', hatColor: '#2e2e30' }, o),
  dung: (o = {}) => Object.assign({ top: '#7f9ab6', bottom: '#33455e', shoes: '#2a2420' }, o),
  tee: (o = {}) => Object.assign({ top: '#e8e4da', bottom: '#33455e', sleeves: 'short', shoes: '#2a2420' }, o),
  cook: (o = {}) => Object.assign({ top: '#f0eee6', bottom: '#d8d4c8', sleeves: 'short', apron: '#f6f4ec', hat: 'cap', hatColor: '#f4f2ea', shoes: '#2a2420' }, o),
  steward: (o = {}) => Object.assign({ top: '#f2efe6', bottom: '#2c2c34', coat: 'jacket', coatColor: '#f2efe6', shoes: '#1e1a18' }, o),
  dark: (o = {}) => Object.assign({ top: '#3a4048', bottom: '#2e3440', shoes: '#1e1a18' }, o),
};

// ------------------------------------------------------------------ helpers
const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
// Step: [from, to, at, act, label, opt]
function steps(list) {
  return list.map(([a, b, at, act, label, o = {}]) => Object.assign({ at, act: act || 'stand', label, when: [a, b], dur: o.dur || [24, 48] }, o));
}
const sleep = (b) => ({ at: b.feet, act: 'lie', face: b.heading });

export function buildCast(W, r) {
  const B = A.bunks, S = A.seats, P = A.spots;
  const mess = S.mess;
  const seat = (i) => ({ at: mess[i % mess.length].at, seat: mess[i % mess.length].seat, face: mess[i % mess.length].face });
  const ward = (i) => ({ at: S.wardroom[i].at, seat: S.wardroom[i].seat, face: S.wardroom[i].face });
  const add = (name, role, bio, costume, list) => W.addPerson({ name, role, bio, costume, routine: steps(list) });
  const z = (p, dz = 0) => [p[0], p[1], p[2] + dz];
  const eng = P.eng; // [fer, aer]
  const peri1 = [35.95, CT.deck, 0.18], peri2 = [37.25, CT.deck, 0.18];
  const bk = (b) => [b.feet[0] - 0.7, b.feet[1], b.feet[2]];

  // ---------------- officers
  add('Cdr. Elliot Garrow', 'Commanding officer', 'Keeps his wife’s letters in date order and opens one a day.', C.khaki({ skin: SK.fair, hair: '#6b4428' }), [
    [19.2, 20.4, 'br:fwd', 'lookout', 'On the bridge with the officer of the deck, scanning the dark', { prop: 'telescope', face: -1 }],
    [20.4, 21.0, P.radar, 'point', 'In the conning tower, checking the radar picture', { face: 'in' }],
    [21.0, 22.6, [29.0, DECK.fb, 0.62], 'sitRead', 'Reading the night’s mail in his stateroom', { seat: 0.46, face: 'in', prop: 'letter' }],
    [22.6, 4.6, sleep(B.captain).at, 'lie', 'Dozing in his clothes, one eye on the gauges at the foot of his bunk', { face: B.captain.heading }],
    [4.6, 5.5, 'br:fwd', 'lookout', 'Up for the morning dive', { prop: 'telescope', face: -1 }],
    [5.5, 7.0, peri1, 'lookout', 'At the periscope as the light comes up', { face: -1 }],
    [7.0, 8.0, ward(0).at, 'sitEat', 'Breakfast in the wardroom', { seat: ward(0).seat, face: ward(0).face }],
    [8.0, 10.5, peri1, 'lookout', 'A periscope sweep of the horizon', { face: -1, dur: [20, 30] }],
    [8.0, 10.5, [29.0, DECK.fb, 0.62], 'sitWrite', 'Writing up the patrol report', { seat: 0.46, face: 'in' }],
    [10.5, 15.5, sleep(B.captain).at, 'lie', 'Sleeping in snatches', { face: B.captain.heading }],
    [15.5, 17.0, ward(0).at, 'sitTalk', 'Going over the night’s plans with the exec', { seat: ward(0).seat, face: ward(0).face }],
    [17.0, 19.2, peri1, 'lookout', 'Last look round before surfacing', { face: -1 }],
  ]);
  add('Lt. Cdr. Ross Pelletier', 'Executive officer and navigator', 'Hums the same Glenn Miller tune for weeks.', C.khaki({ skin: SK.pale, hair: '#2b1d14' }), [
    [19.2, 20.0, 'br:fwd', 'lookout', 'Star sights at dusk', { prop: 'telescope', face: -1 }],
    [20.0, 21.0, ward(1).at, 'sitWrite', 'Working out the fix', { seat: ward(1).seat, face: ward(1).face }],
    [21.0, 22.2, ward(1).at, 'sitRead', 'Censoring the crew’s outgoing letters', { seat: ward(1).seat, face: ward(1).face, prop: 'paper' }],
    [22.2, 4.3, B.officers[1].feet, 'lie', 'Asleep in the upper bunk', { face: 0 }],
    [4.3, 5.4, 'br:fwd', 'lookout', 'Morning star sights', { prop: 'telescope', face: -1 }],
    [5.4, 6.6, 'cr:mid', 'point', 'In the control room for the dive', { face: 'in' }],
    [6.6, 12.0, ward(1).at, 'sitWrite', 'Charts and the day’s paperwork', { seat: ward(1).seat, face: ward(1).face }],
    [12.0, 17.0, B.officers[1].feet, 'lie', 'Sleeping', { face: 0 }],
    [17.0, 19.2, ward(1).at, 'sitEat', 'Supper before surfacing', { seat: ward(1).seat, face: ward(1).face }],
  ]);
  add('Lt. Harlan Voss', 'Engineering officer', 'Grew up on a Kansas farm fixing tractors.', C.khaki({ skin: SK.tan, hair: '#8d5a2b', hat: null }), [
    [19.4, 1.5, 'man:b', 'point', 'Checking the charging rate at the control stand', { face: 'in', dur: [15, 20] }],
    [19.4, 1.5, 'well2:a', 'subCrawl', 'In the after battery well, reading hydrometers with an electrician', { dur: [28, 36] }],
    [19.4, 1.5, ward(2).at, 'sitDrink', 'Coffee and the engineering log', { seat: ward(2).seat, face: ward(2).face, prop: 'mug', dur: [18, 24] }],
    [1.5, 7.5, B.officers[0].feet, 'lie', 'Asleep', { face: 0 }],
    [7.5, 13.0, eng[0].walk, 'workBench', 'Rounds of the silent engine rooms', { face: 'in' }],
    [7.5, 13.0, 'mot:a', 'point', 'Checking the main motors on battery', { face: 'in' }],
    [13.0, 19.4, B.officers[0].feet, 'lie', 'Sleeping before the night’s charge', { face: 0 }],
  ]);
  add('Lt. (jg) Wendell Ashby', 'Torpedo officer', 'Writes poems he shows no one.', C.khaki({ skin: SK.pale, hair: '#c9a160', hat: null }), [
    [19.5, 21.0, 'ftr:a', 'point', 'Watching a torpedo pulled for its routine', { face: 'in' }],
    [21.0, 22.5, 'atr:b', 'point', 'The same routine in the after torpedo room', { face: 'in' }],
    [22.5, 4.0, B.chiefs[2] ? B.officers[0].feet : B.officers[0].feet, 'lie', 'Asleep', { face: 0 }],
    [4.0, 9.0, ward(3).at, 'sitWrite', 'Writing, and crossing out', { seat: ward(3).seat, face: ward(3).face }],
    [9.0, 13.0, 'cr:mid', 'handsBehind', 'Diving officer of the forenoon watch', { face: 'in' }],
    [13.0, 19.5, B.officers[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('Lt. (jg) Carl Whitlock', 'Officer of the deck, first watch', 'Engaged to a schoolteacher in Duluth.', C.khaki({ skin: SK.fair, hair: '#4a3020' }), [
    [19.1, 19.6, 'cr:fwd', 'stand', 'Red goggles on before going up', { face: 'out' }],
    [19.6, 0.0, 'br:fwd', 'lookout', 'Officer of the deck, first watch', { prop: 'telescope', face: -1, dur: [30, 40] }],
    [19.6, 0.0, 'br:side', 'handsBehind', 'Officer of the deck, walking the bridge', { face: 1, dur: [12, 18] }],
    [0.0, 0.4, ward(2).at, 'sitEat', 'A sandwich after the watch', { seat: ward(2).seat, face: ward(2).face }],
    [0.4, 8.0, B.officers[0].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, 'cr:mid', 'handsBehind', 'Diving officer, forenoon', { face: 'in' }],
    [12.0, 19.1, B.officers[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('Ens. Philip Danforth', 'Junior officer of the deck, communications', 'Youngest officer aboard; seasick in his first week.', C.khaki({ skin: SK.pale, hair: '#b07a3c', hat: null }), [
    [19.2, 20.2, P.radio[1], 'sitWrite', 'Decoding the fleet broadcast on the ECM', { seat: 0, face: 'in' }],
    [20.2, 23.5, 'br:aft', 'lookout', 'Junior officer of the deck', { prop: 'telescope', face: 1 }],
    [23.5, 12.0, B.officers[1].feet, 'lie', 'Asleep', { face: 0 }],
    [12.0, 16.0, 'cr:fwd', 'handsBehind', 'Diving officer, afternoon', { face: 'in' }],
    [16.0, 19.2, ward(3).at, 'sitRead', 'Reading in the wardroom', { seat: ward(3).seat, face: ward(3).face, prop: 'book' }],
  ]);
  add('Ens. Morris Feld', 'Assistant engineer, diving officer for the dawn dive', 'Former high-school chemistry teacher.', C.khaki({ skin: SK.tan, hair: '#2b1d14', hat: null }), [
    [21.0, 4.0, B.officers[1].feet, 'lie', 'Asleep until four', { face: 0 }],
    [4.0, 5.3, 'cr:fwd', 'sitWrite', 'Checking the trim sheet', { seat: 0.0, face: 'in' }],
    [5.3, 8.0, 'cr:mid', 'point', 'Diving officer: taking her down at dawn', { face: 'in' }],
    [8.0, 14.0, B.officers[1].feet, 'lie', 'Sleeping', { face: 0 }],
    [14.0, 19.3, 'cr:mid', 'handsBehind', 'Diving officer, afternoon and dog watches', { face: 'in' }],
    [19.3, 21.0, eng[0].walk, 'workBench', 'With the engineers during the charge', { face: 'in' }],
  ]);
  add('Lt. (jg) Earl Brandt', 'Gunnery officer, officer of the deck for the middle watch', 'Carries a lucky silver dollar.', C.khaki({ skin: SK.fair, hair: '#6b4428' }), [
    [19.0, 23.3, B.officers[1].feet, 'lie', 'Asleep until a quarter to midnight', { face: 0 }],
    [23.3, 23.8, 'cr:fwd', 'stand', 'Red goggles, waiting for his eyes to adjust', { face: 'out' }],
    [23.8, 4.0, 'br:fwd', 'lookout', 'Officer of the deck, middle watch', { prop: 'telescope', face: -1 }],
    [4.0, 12.0, B.officers[1].feet, 'lie', 'Sleeping', { face: 0 }],
    [12.0, 19.0, ward(0).at, 'sitRead', 'Reading in the wardroom', { seat: ward(0).seat, face: ward(0).face, prop: 'book' }],
  ]);
  add('Lt. Owen Strickland', 'Commissary officer, officer of the deck for the morning watch', 'Keeps a tally of how many potatoes are left.', C.khaki({ skin: SK.pale, hair: '#9a9a9a' }), [
    [19.3, 20.0, [42.0, DECK.ab, 0.15], 'talk', 'Going over the stores list with the cook', { face: 'in' }],
    [20.0, 3.6, B.officers[0].feet, 'lie', 'Asleep', { face: 0 }],
    [3.6, 5.45, 'br:fwd', 'lookout', 'Officer of the deck, morning watch', { prop: 'telescope', face: -1 }],
    [5.45, 9.0, ward(2).at, 'sitWrite', 'Counting potatoes', { seat: ward(2).seat, face: ward(2).face }],
    [9.0, 19.3, B.officers[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);

  // ---------------- chiefs and petty officers
  add('CTM Walter Kincaid', 'Chief of the boat', 'Has made more war patrols than anyone aboard.', C.chief({ skin: SK.fair, hair: '#9a9a9a' }), [
    [19.5, 23.5, 'cr:gyro', 'handsBehind', 'Chief of the watch in the control room', { face: 'in', dur: [40, 60] }],
    [19.5, 23.5, 'berth:b', 'talk', 'Settling an argument over a bunk', { face: 'in', dur: [10, 14] }],
    [23.5, 0.2, seat(5).at, 'sitDrink', 'Coffee in the mess', { seat: seat(5).seat, face: seat(5).face, prop: 'mug' }],
    [0.2, 7.5, B.chiefs[0].feet, 'lie', 'Asleep in the goat locker', { face: 0 }],
    [7.5, 11.5, 'cr:gyro', 'handsBehind', 'Chief of the watch, forenoon', { face: 'in' }],
    [11.5, 12.5, seat(4).at, 'sitEat', 'Dinner', { seat: seat(4).seat, face: seat(4).face }],
    [12.5, 19.5, B.chiefs[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('TM1 Leo Marchetti', 'Torpedoman', 'Tapes a photo of his baby daughter above his bunk.', C.tee({ skin: SK.olive, hair: '#2b1d14' }), [
    [19.5, 21.0, [14.6, DECK.ftr, 0.15], 'haul', 'Pulling a torpedo partly out of tube 3 for its routine', { face: -1, prop: 'rope', onArrive: (p, w) => { w.data.torpPull = 1; } }],
    [21.0, 21.6, [12.9, DECK.ftr, 0.2], 'workBench', 'Greasing the tube doors', { face: -1, onArrive: (p, w) => { w.data.torpPull = 0; } }],
    [21.6, 2.0, B.ftr[0].feet, 'lie', 'Asleep among the reloads', { face: 0 }],
    [2.0, 6.0, 'ftr:b', 'handsBehind', 'Torpedo room watch', { face: 'out' }],
    [6.0, 19.5, B.ftr[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('TM2 Dewey Sutter', 'Torpedoman', 'Collects matchbooks from every port.', C.dung({ skin: SK.fair, hair: '#8d5a2b' }), [
    [20.0, 0.0, 'ftr:c', 'handsBehind', 'Torpedo room watch', { face: 'out' }],
    [0.0, 0.4, seat(0).at, 'sitEat', 'Eats', { seat: seat(0).seat, face: seat(0).face }],
    [0.4, 8.0, B.ftr[1].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, 'ftr:b', 'handsBehind', 'Torpedo room watch', { face: 'out' }],
    [12.0, 20.0, B.ftr[1].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('TM3 Arnie Kowalczyk', 'Torpedoman', 'Got a fruitcake in the mail, three months late.', C.tee({ skin: SK.pale, hair: '#d8c9a8' }), [
    [20.0, 0.0, 'atr:b', 'handsBehind', 'After torpedo room watch', { face: 'out' }],
    [0.0, 0.3, 'wash', 'stand', 'A shave in the washroom', { face: 'in' }],
    [0.3, 8.0, B.crew[0].feet, 'lie', 'Hot bunk in the crew’s berthing', { face: 0 }],
    [8.0, 12.0, 'atr:c', 'handsBehind', 'After torpedo room watch', { face: 'out' }],
    [12.0, 20.0, B.atr[0].feet, 'lie', 'Sleeping aft', { face: 0 }],
  ]);
  add('GM1 Ray Tolliver', 'Gunner’s mate', 'Talks about opening a hardware store.', C.dung({ skin: SK.tan, hair: '#4a3020' }), [
    [20.5, 21.3, 'deck:gun', 'workBench', 'Topside with permission, servicing the 4-inch gun', { face: -1 }],
    [21.3, 22.4, seat(2).at, 'sitWork', 'Cleaning small arms in the mess', { seat: seat(2).seat, face: seat(2).face }],
    [22.4, 8.0, B.crew[1].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, seat(2).at, 'sitTalk', 'Talking hardware stores', { seat: seat(2).seat, face: seat(2).face }],
    [12.0, 20.5, B.crew[1].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('QM1 Stanley Orcutt', 'Quartermaster', 'Can name every star he can see.', C.dung({ skin: SK.fair, hair: '#6b4428' }), [
    [19.6, 23.6, 'lk:A', 'lookout', 'Quartermaster of the watch, aft on the bridge', { prop: 'telescope', face: 1 }],
    [23.6, 0.2, [36.6, CT.deck, 0.62], 'sitWrite', 'Writing up the log in the conning tower', { seat: 0, face: 'in' }],
    [0.2, 8.0, B.crew[2].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, [36.6, CT.deck, 0.62], 'stand', 'Quartermaster, forenoon', { face: 'in' }],
    [12.0, 19.6, B.crew[2].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('SM1 Joe Babineaux', 'Signalman', 'Cajun French speaker from Louisiana.', C.dung({ skin: SK.tan, hair: '#2b1d14' }), [
    [19.3, 20.3, 'br:aft', 'point', 'Checking the night’s recognition signals', { face: 1 }],
    [20.3, 20.8, seat(3).at, 'sitDrink', 'Coffee', { seat: seat(3).seat, face: seat(3).face, prop: 'mug' }],
    [20.8, 4.5, B.crew[3].feet, 'lie', 'Asleep', { face: 0 }],
    [4.5, 5.4, 'br:aft', 'lookout', 'On the bridge for the morning stars', { prop: 'telescope', face: 1 }],
    [5.4, 12.0, seat(3).at, 'sitTalk', 'Telling stories in French and English', { seat: seat(3).seat, face: seat(3).face }],
    [12.0, 19.3, B.crew[3].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('FC1 Norbert Ehrlich', 'Fire controlman', 'Built radios as a boy in Milwaukee.', C.dung({ skin: SK.pale, hair: '#b07a3c' }), [
    [19.5, 20.5, P.tdc, 'workBench', 'Adjusting the Torpedo Data Computer', { face: 'in' }],
    [20.5, 4.0, B.crew[4].feet, 'lie', 'Asleep', { face: 0 }],
    [4.0, 12.0, P.tdc, 'workBench', 'Tending the TDC', { face: 'in' }],
    [12.0, 19.5, B.crew[4].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('S1c Billy Haskins', 'Lookout', '19 years old, from Tennessee; this is his first patrol.', C.dark({ skin: SK.fair, hair: '#c9a160' }), [
    [19.4, 20.0, 'cr:fwd', 'stand', 'Red goggles on, waiting out his twenty minutes', { face: 'out' }],
    [20.0, 22.0, 'lk:S', 'lookout', 'Starboard lookout: 350 to 130 degrees', { prop: 'telescope', face: 'in' }],
    [22.0, 22.3, seat(1).at, 'sitDrink', 'Cocoa in the mess', { seat: seat(1).seat, face: seat(1).face, prop: 'mug' }],
    [22.3, 9.0, B.crew[5].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 12.0, 'cr:fwd', 'sitWork', 'Learning the trim manifold', { seat: 0.0, face: 'in' }],
    [12.0, 19.4, B.crew[5].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('S1c Tomas Echeverria', 'Lookout', 'Sends half his pay to his mother in Texas.', C.dark({ skin: SK.brown, hair: '#2b1d14' }), [
    [19.4, 20.0, 'cr:fwd', 'stand', 'Red goggles on', { face: 'out' }],
    [20.0, 22.0, 'lk:P', 'lookout', 'Port lookout: 230 to 010 degrees', { prop: 'telescope', face: 'out' }],
    [22.0, 22.3, 'wash', 'stand', 'In the washroom', { face: 'in' }],
    [22.3, 9.0, B.crew[6].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 12.0, seat(6).at, 'sitWrite', 'Writing home', { seat: seat(6).seat, face: seat(6).face }],
    [12.0, 19.4, B.crew[6].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('S1c Gordon Lusk', 'Helmsman', 'Whistles under his breath and gets told to stop.', C.dung({ skin: SK.fair, hair: '#8d5a2b' }), [
    [20.0, 0.0, P.helm, 'wheel', 'At the wheel in the conning tower', { face: 'in' }],
    [0.0, 0.3, seat(7).at, 'sitEat', 'Midnight soup', { seat: seat(7).seat, face: seat(7).face }],
    [0.3, 8.0, B.crew[7].feet, 'lie', 'Hot bunk', { face: 0 }],
    [8.0, 12.0, P.helm, 'wheel', 'At the wheel, forenoon', { face: 'in' }],
    [12.0, 20.0, B.crew[7].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('S1c Frank Pettibone', 'Mess cook', 'Wants to strike for cook.', C.tee({ skin: SK.fair, hair: '#d8c9a8', apron: '#e8e4d8' }), [
    [19.3, 20.0, 'br:agun', 'pour', 'Dumping the day’s garbage over the side', { prop: 'sack', face: 1 }],
    [20.0, 21.5, [42.2, DECK.ab, 0.2], 'scrub', 'Scrubbing pots', { face: 'out' }],
    [21.5, 22.0, 'mess:b', 'carry', 'Fetching tins from the store below', { prop: 'box', face: 'out' }],
    [22.0, 0.5, 'mess:a', 'carryHigh', 'Setting the tables for midnight', { prop: 'tray', face: 'out' }],
    [0.5, 10.0, B.crew[8].feet, 'lie', 'Asleep', { face: 0 }],
    [10.0, 13.0, 'mess:b', 'carryHigh', 'Serving dinner', { prop: 'tray', face: 'out' }],
    [13.0, 19.3, B.crew[8].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('S2c Lyle Danner', 'Conning tower talker', 'Stammers, except on the phones.', C.dung({ skin: SK.pale, hair: '#b07a3c' }), [
    [20.0, 0.0, P.talker, 'stand', 'On the sound-powered headset', { face: 'in' }],
    [0.0, 8.0, B.crew[0].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, P.talker, 'stand', 'Talker, forenoon', { face: 'in' }],
    [12.0, 20.0, B.crew[0].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('CEM Otto Lindqvist', 'Chief electrician’s mate', 'The men joke that he smells hydrogen before the detector does.', C.chief({ skin: SK.pale, hair: '#d8c9a8' }), [
    [19.4, 21.4, A.spots.stand[0], 'point', 'Overseeing the battery charge', { face: 'in' }],
    [21.4, 22.2, 'well1:b', 'subCrawl', 'Crawling the forward battery well, reading cells', {}],
    [22.2, 22.6, S.chiefs[0].at, 'sitDrink', 'Coffee in the goat locker', { seat: S.chiefs[0].seat, face: 1, prop: 'mug' }],
    [22.6, 1.0, A.spots.stand[0], 'point', 'The charge at its finishing rate', { face: 'in' }],
    [1.0, 9.0, B.chiefs[1].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 13.0, 'mot:a', 'workBench', 'Checking the motor brushes', { face: 'in' }],
    [13.0, 19.4, B.chiefs[1].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('EM1 Vernon Rasch', 'Electrician', 'Keeps a pet cricket in a matchbox.', C.tee({ skin: SK.fair, hair: '#4a3020' }), [
    [20.0, 0.0, A.spots.stand[1], 'crank', 'At the control stand, answering bells', { face: 'in' }],
    [0.0, 0.3, seat(8).at, 'sitEat', 'Eats, and feeds the cricket a crumb', { seat: seat(8).seat, face: seat(8).face }],
    [0.3, 8.0, B.crew[1].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, A.spots.stand[1], 'crank', 'Control stand, forenoon', { face: 'in' }],
    [12.0, 20.0, B.crew[1].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('EM2 Dale Wetherby', 'Electrician', 'Writes to a girl he met once at a dance.', C.tee({ skin: SK.tan, hair: '#6b4428' }), [
    [19.6, 22.6, 'well2:a', 'subCrawl', 'Hydrometer readings in the after battery well', { dur: [26, 34] }],
    [19.6, 22.6, 'well2:b', 'subCrawl', 'Holding an unlit cigarette: the smoking lamp is out', { dur: [12, 16] }],
    [22.6, 22.9, 'wash', 'stand', 'Washing up', { face: 'in' }],
    [22.9, 9.0, B.crew[2].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 12.0, seat(9).at, 'sitWrite', 'Another letter to the girl from the dance', { seat: seat(9).seat, face: seat(9).face }],
    [12.0, 19.6, B.crew[2].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('CRM Harold Bixby', 'Chief radioman', 'Taps Morse on the table while he eats.', C.chief({ skin: SK.fair, hair: '#6b4428' }), [
    [19.2, 22.5, P.radio[0], 'sitWrite', 'Copying the fleet broadcast', { seat: 0.46, face: 'in' }],
    [22.5, 23.0, S.chiefs[0].at, 'sitDrink', 'Coffee in the goat locker', { seat: S.chiefs[0].seat, face: 1, prop: 'mug' }],
    [23.0, 9.0, B.chiefs[2].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 13.0, P.radio[0], 'sitRead', 'Radio room, listening', { seat: 0.46, face: 'in' }],
    [13.0, 19.2, B.chiefs[2].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('RM2 Sidney Kaplan', 'Radioman', 'Brooklyn Dodgers fan.', C.dung({ skin: SK.fair, hair: '#2b1d14' }), [
    [22.5, 2.5, P.radio[0], 'sitWrite', 'Radio watch', { seat: 0.46, face: 'in' }],
    [2.5, 3.2, seat(10).at, 'sitTalk', 'Chess with the yeoman', { seat: seat(10).seat, face: seat(10).face }],
    [3.2, 13.0, B.crew[3].feet, 'lie', 'Asleep', { face: 0 }],
    [13.0, 17.0, P.radio[0], 'sitRead', 'Radio watch, afternoon', { seat: 0.46, face: 'in' }],
    [17.0, 22.5, B.crew[3].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('RT1 Glenn Ostrowski', 'Radar technician', 'Studied electrical engineering for a year before the war.', C.dung({ skin: SK.pale, hair: '#8d5a2b' }), [
    [19.3, 23.5, P.radar, 'workBench', 'SJ radar watch', { face: 'in' }],
    [23.5, 0.0, 'pump:a', 'workBench', 'Checking the radar motor-generator in the pump room', { face: 'in' }],
    [0.0, 12.0, B.crew[4].feet, 'lie', 'Asleep', { face: 0 }],
    [12.0, 19.3, seat(11).at, 'sitRead', 'Reading a radio manual', { seat: seat(11).seat, face: seat(11).face, prop: 'book' }],
  ]);
  add('CMoMM Augie Ferraro', 'Chief motor machinist’s mate', 'Can tell a sick cylinder by ear.', C.chief({ skin: SK.olive, hair: '#4a3020', hat: null }), [
    [19.3, 3.0, eng[0].walk, 'workBench', 'Walking the forward engines, listening', { face: 'in', dur: [25, 35] }],
    [19.3, 3.0, eng[1].walk, 'workBench', 'Walking the after engines', { face: 'in', dur: [25, 35] }],
    [19.3, 3.0, S.chiefs[0].at, 'sitDrink', 'Coffee in the goat locker', { seat: S.chiefs[0].seat, face: 1, prop: 'mug', dur: [15, 20] }],
    [3.0, 11.0, B.chiefs[0].feet, 'lie', 'Asleep', { face: 0 }],
    [11.0, 19.3, eng[1].lower, 'workBench', 'Overhauling a fuel pump while the engines rest', { face: 'in' }],
  ]);
  add('MoMM1 Clyde Rutter', 'Engine room watch', 'Lost the hearing in one ear to the engines.', C.tee({ skin: SK.fair, hair: '#6b4428' }), [
    [20.0, 0.0, eng[0].walk, 'point', 'Forward engine room watch: hand signals only', { face: 'in', dur: [30, 40] }],
    [20.0, 0.0, eng[0].end, 'workBench', 'Reading the gauges at the engine’s control end', { face: 1, dur: [15, 20] }],
    [0.0, 0.3, 'wash', 'stand', 'Scrubbing off the oil', { face: 'in' }],
    [0.3, 8.0, B.crew[5].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, eng[0].lower, 'workBench', 'Wiping down the generator', { face: 'in' }],
    [12.0, 20.0, B.crew[5].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('MoMM2 Lewis Haight', 'Auxiliary engine', 'Counts every gallon of fresh water.', C.tee({ skin: SK.tan, hair: '#2b1d14' }), [
    [19.5, 22.0, A.spots.aux, 'workBench', 'Tending the auxiliary engine', { face: 'in' }],
    [22.0, 23.0, A.spots.stills, 'workBench', 'At the stills, making fresh water', { face: -1 }],
    [23.0, 9.0, B.crew[6].feet, 'lie', 'Asleep', { face: 0 }],
    [9.0, 19.5, A.spots.stills, 'workBench', 'Logging the stills', { face: -1 }],
  ]);
  add('F1c Bobby Lanier', 'Fireman', '18; he lied about his age by a few months.', C.tee({ skin: SK.fair, hair: '#c9a160' }), [
    [20.0, 0.0, eng[1].walk, 'workBench', 'Oiling and wiping the engines', { face: 'in' }],
    [0.0, 0.3, seat(4).at, 'sitEat', 'Pie', { seat: seat(4).seat, face: seat(4).face }],
    [0.3, 8.0, B.crew[7].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, eng[1].end, 'workBench', 'Oiler, forenoon', { face: 1 }],
    [12.0, 20.0, B.crew[7].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('Y1c Marvin Tuttle', 'Yeoman', 'Knows everyone’s birthday.', C.dung({ skin: SK.fair, hair: '#4a3020' }), [
    [19.3, 20.6, [31.9, DECK.fb, 0.6], 'sitWork', 'Sorting the 34 sacks of mail into bundles', { seat: 0.46, face: 'out' }],
    [20.6, 22.6, [31.9, DECK.fb, 0.6], 'sitWrite', 'Typing reports', { seat: 0.46, face: 'out' }],
    [22.6, 23.2, seat(11).at, 'sitTalk', 'Chess in the mess', { seat: seat(11).seat, face: seat(11).face }],
    [23.2, 8.0, B.crew[8].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 19.3, [31.9, DECK.fb, 0.6], 'sitWrite', 'Ship’s office', { seat: 0.46, face: 'out' }],
  ]);
  add('PhM1 Arthur Lindell', 'Pharmacist’s mate', 'The crew call him “Doc”: the only medical man aboard.', C.dung({ skin: SK.fair, hair: '#9a9a9a', top: '#e8e4da' }), [
    [19.5, 20.2, 'mess:c', 'talk', 'Sick call in the crew’s mess', { face: 'out' }],
    [20.2, 20.6, 'atr:a', 'talk', 'Checking a man with a fever aft', { face: 'in' }],
    [20.6, 21.2, [26.4, DECK.fb, 0.3], 'talk', 'Issuing library books, one at a time', { prop: 'book', face: 'in' }],
    [21.2, 6.0, B.crew[0].feet, 'lie', 'Asleep', { face: 0 }],
    [6.0, 19.5, seat(10).at, 'sitRead', 'Reading, and on call', { seat: seat(10).seat, face: seat(10).face, prop: 'book' }],
  ]);
  add('Bkr1c Henry Gaudet', 'Baker', 'Learned to bake in his father’s bakery in Maine.', C.cook({ skin: SK.fair, hair: '#6b4428' }), [
    [20.0, 21.0, P.baker, 'workBench', 'Mixing and kneading dough', { face: 'out' }],
    [21.0, 22.0, P.range, 'stir', 'Proofing and cleaning up', { face: 'in' }],
    [22.0, 4.5, P.baker, 'workBench', 'Baking bread and pies through the night', { face: 'out', dur: [40, 60] }],
    [22.0, 4.5, P.range, 'stir', 'Loaves into the oven', { face: 'in', dur: [20, 30] }],
    [4.5, 13.0, B.crew[1].feet, 'lie', 'To his bunk at dawn', { face: 0 }],
    [13.0, 20.0, seat(0).at, 'sitRead', 'Reading', { seat: seat(0).seat, face: seat(0).face, prop: 'book' }],
  ]);
  add('SC1c Lou Abernathy', 'Ship’s cook', 'Swears his stew tastes the same as his mother’s.', C.cook({ skin: SK.tan, hair: '#4a3020' }), [
    [18.0, 20.5, P.range, 'stir', 'Cooking the night meal', { face: 'in' }],
    [20.5, 21.0, P.cook, 'workBench', 'Swatting a cockroach behind the hot plates', { face: 'in' }],
    [21.0, 22.0, P.cook, 'workBench', 'Setting out sandwich makings and coffee', { face: 'out' }],
    [22.0, 9.5, B.crew[2].feet, 'lie', 'Asleep', { face: 0 }],
    [9.5, 13.0, P.range, 'stir', 'Dinner for the day watch', { face: 'in' }],
    [13.0, 18.0, B.crew[2].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('SC3c Raymond Kittle', 'Ship’s cook', 'Saves bits of pie crust for the cricket.', C.cook({ skin: SK.pale, hair: '#b07a3c', hat: null }), [
    [19.5, 21.5, P.cook, 'workBench', 'Peeling potatoes', { face: 'out' }],
    [21.5, 22.0, 'cr:fwd', 'stand', 'Red goggles: cooks stood lookout on some boats', { face: 'out' }],
    [22.0, 0.0, 'lk:S', 'lookout', 'Starboard lookout', { prop: 'telescope', face: 'in' }],
    [0.0, 11.0, B.crew[3].feet, 'lie', 'Asleep', { face: 0 }],
    [11.0, 19.5, P.cook, 'workBench', 'Peeling, and more peeling', { face: 'out' }],
  ]);
  add('StM1c Julius Hargrove', 'Steward’s mate', 'From Norfolk, Virginia; sings in a church choir at home.', C.steward({ skin: SK.deep, hair: '#1e1612' }), [
    [19.2, 20.2, [23.75, DECK.fb, 0.6], 'pour', 'Coffee and toast in the pantry', { prop: 'jug', face: 'in' }],
    [20.2, 20.8, [25.6, DECK.fb, 0.3], 'carryHigh', 'Laying out the wardroom table', { prop: 'tray', face: 'in' }],
    [20.8, 21.3, [27.7, DECK.fb, 0.55], 'workBench', 'Making up the officers’ bunks', { face: 'in' }],
    [21.3, 6.0, B.crew[4].feet, 'lie', 'Asleep', { face: 0 }],
    [6.0, 8.5, [23.75, DECK.fb, 0.6], 'pour', 'Breakfast coffee for the wardroom', { prop: 'jug', face: 'in' }],
    [8.5, 19.2, B.crew[4].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('StM2c Benigno Dacanay', 'Steward’s mate', 'Has not heard from his family in the Philippines since 1941.', C.steward({ skin: SK.olive, hair: '#1e1612' }), [
    [19.2, 20.0, [23.75, DECK.fb, 0.6], 'scrub', 'Washing the china', { face: 'in' }],
    [20.0, 20.8, [25.0, DECK.fb, 0.3], 'carryHigh', 'Serving the night meal in the wardroom', { prop: 'tray', face: 'in' }],
    [20.8, 8.0, B.crew[5].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 19.2, [23.75, DECK.fb, 0.6], 'stand', 'In the pantry', { face: 'in' }],
  ]);
  add('S1c Wally Brecken', 'Sound operator', 'Plays harmonica, quietly, off watch.', C.dung({ skin: SK.fair, hair: '#8d5a2b' }), [
    [20.0, 0.0, [12.7, DECK.ftr, 1.15], 'sitWork', 'Listening on the sound gear', { seat: 0.0, face: 'in' }],
    [0.0, 8.0, B.crew[6].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, [37.55, CT.deck, 0.55], 'stand', 'Sound watch in the conning tower', { face: 'in' }],
    [12.0, 20.0, B.ftr[3].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('TM2 Chester Dunphy', 'Torpedoman and movie operator', 'Knows every line of the only good movie aboard.', C.tee({ skin: SK.fair, hair: '#2b1d14' }), [
    [19.5, 20.2, [13.75, DECK.ftr, 0.15], 'workBench', 'Threading the 16 mm projector', { face: 'in' }],
    [20.2, 22.5, [13.75, DECK.ftr, 0.15], 'stand', 'Running a film for the off-watch men', { face: 1 }],
    [22.5, 8.0, B.ftr[4].feet, 'lie', 'Asleep', { face: 0 }],
    [8.0, 12.0, 'ftr:a', 'handsBehind', 'Torpedo room watch', { face: 'out' }],
    [12.0, 19.5, B.ftr[4].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);
  add('EM3 Tony Russo', 'Electrician', 'Got six letters at once on 11 March.', C.tee({ skin: SK.olive, hair: '#2b1d14' }), [
    [19.4, 21.4, 'well1:a', 'subCrawl', 'Forward battery readings', {}],
    [21.4, 22.4, bk(B.crew[6]), 'sitRead', 'Reading his mail again on the edge of a bunk', { seat: 0.0, face: 'out', prop: 'letter' }],
    [22.4, 9.0, B.crew[6].feet, 'lie', 'Asleep with a letter on his chest', { face: 0 }],
    [9.0, 13.0, 'man:c', 'workBench', 'Maneuvering room, on battery', { face: 'in' }],
    [13.0, 19.4, B.crew[6].feet, 'lie', 'Sleeping', { face: 0 }],
  ]);

  // ---------------- the others (dossier 4b): watchstanders, off-watch men and sleepers
  const named = W.people.length;
  const rng = r;
  const costume = (kind) => {
    const skin = rng.pick([SK.pale, SK.pale, SK.fair, SK.fair, SK.tan, SK.tan, SK.olive, SK.brown]);
    const hair = rng.pick(['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#c9a160']);
    return kind === 'tee' ? C.tee({ skin, hair }) : kind === 'dark' ? C.dark({ skin, hair }) : kind === 'chief' ? C.chief({ skin, hair }) : C.dung({ skin, hair });
  };
  const extra = (role, kind, list) => W.addPerson({ role, costume: costume(kind), routine: steps(list) });
  // Lookouts and bridge watch for the middle and morning watches.
  extra('Lookout, middle watch', 'dark', [[23.3, 0.0, 'cr:fwd', 'stand', 'Red goggles, waiting', { face: 'out' }], [0.0, 2.0, 'lk:S', 'lookout', 'Starboard lookout', { prop: 'telescope', face: 'in' }], [2.0, 23.3, B.crew[7].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Lookout, middle watch', 'dark', [[23.3, 0.0, 'cr:fwd', 'stand', 'Red goggles, waiting', { face: 'out' }], [0.0, 2.0, 'lk:P', 'lookout', 'Port lookout', { prop: 'telescope', face: 'out' }], [2.0, 23.3, B.crew[8].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Lookout', 'dark', [[19.4, 20.0, 'cr:fwd', 'stand', 'Red goggles on', { face: 'out' }], [20.0, 24.0, 'lk:A', 'lookout', 'After lookout: 120 to 240 degrees', { prop: 'telescope', face: 1 }], [0.0, 19.4, B.ftr[5].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Lookout, morning watch', 'dark', [[1.4, 2.0, 'cr:fwd', 'stand', 'Red goggles', { face: 'out' }], [2.0, 5.4, 'lk:S', 'lookout', 'Starboard lookout until the dive', { prop: 'telescope', face: 'in' }], [5.4, 1.4, B.crew[0].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Lookout, morning watch', 'dark', [[1.4, 2.0, 'cr:fwd', 'stand', 'Red goggles', { face: 'out' }], [2.0, 5.4, 'lk:P', 'lookout', 'Port lookout until the dive', { prop: 'telescope', face: 'out' }], [5.4, 1.4, B.crew[3].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Lookout, morning watch', 'dark', [[0.0, 5.4, 'lk:A', 'lookout', 'After lookout', { prop: 'telescope', face: 1 }], [5.4, 0.0, B.ftr[2].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Helmsman, middle watch', 'dung', [[0.0, 4.0, P.helm, 'wheel', 'At the wheel', { face: 'in' }], [4.0, 0.0, B.crew[1].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Radar operator, middle watch', 'dung', [[23.5, 8.0, P.radar, 'workBench', 'SJ radar watch', { face: 'in' }], [8.0, 23.5, B.atr[1].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Quartermaster of the watch', 'dung', [[0.0, 5.4, 'lk:A', 'lookout', 'Quartermaster, middle watch', { prop: 'telescope', face: 1 }], [5.4, 12.0, [36.6, CT.deck, 0.62], 'stand', 'Quartermaster', { face: 'in' }], [12.0, 0.0, B.atr[2].feet, 'lie', 'Asleep', { face: 0 }]]);
  // Diving station: planesmen on the bow and stern plane wheels while submerged (S7).
  extra('Bow planesman', 'dung', [[5.3, 12.0, P.cr.bowPlanes, 'sitWork', 'Bow planes: holding her at periscope depth', { seat: 0.46, face: 'in' }], [12.0, 5.3, B.atr[3].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Stern planesman', 'dung', [[5.3, 12.0, P.cr.sternPlanes, 'sitWork', 'Stern planes: holding the angle', { seat: 0.46, face: 'in' }], [12.0, 5.3, B.atr[4].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Bow planesman', 'dung', [[12.0, 19.3, P.cr.bowPlanes, 'sitWork', 'Bow planes, afternoon', { seat: 0.46, face: 'in' }], [19.3, 12.0, B.atr[5].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Stern planesman', 'dung', [[12.0, 19.3, P.cr.sternPlanes, 'sitWork', 'Stern planes, afternoon', { seat: 0.46, face: 'in' }], [19.3, 12.0, B.atr[0].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Chief of the watch', 'chief', [[23.5, 7.5, 'cr:gyro', 'handsBehind', 'Chief of the watch, middle and morning', { face: 'in' }], [7.5, 23.5, B.chiefs[2].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Chief of the watch', 'chief', [[12.0, 19.5, 'cr:gyro', 'handsBehind', 'Chief of the watch, afternoon', { face: 'in' }], [19.5, 22.0, S.chiefs[0].at, 'sitDrink', 'Coffee in the goat locker', { seat: S.chiefs[0].seat, face: 1, prop: 'mug' }], [22.0, 12.0, B.chiefs[1].feet, 'lie', 'Asleep', { face: 0 }]]);
  // Engine rooms and maneuvering through the night charge.
  extra('Motor machinist’s mate', 'tee', [[0.0, 5.5, eng[0].walk, 'workBench', 'Forward engine room, middle watch', { face: 'in' }], [5.5, 0.0, B.crew[4].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Motor machinist’s mate', 'tee', [[19.3, 0.0, eng[1].walk, 'point', 'After engine room watch: hand signals over the roar', { face: 'in', dur: [30, 40] }], [19.3, 0.0, eng[1].lower, 'workBench', 'Checking the generator bearings', { face: 'in', dur: [20, 30] }], [0.0, 19.3, B.atr[1].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Fireman', 'tee', [[0.0, 5.5, eng[1].end, 'workBench', 'Oiler, middle watch', { face: 1 }], [5.5, 0.0, B.atr[2].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Fireman', 'tee', [[19.5, 0.0, eng[0].lower, 'workBench', 'Fuel and lube oil transfer', { face: 'in' }], [0.0, 19.5, B.ftr[1].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Electrician’s mate', 'tee', [[0.0, 8.0, A.spots.stand[1], 'crank', 'Control stand, middle and morning', { face: 'in' }], [8.0, 0.0, B.crew[5].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Electrician’s mate', 'tee', [[12.0, 20.0, A.spots.stand[0], 'crank', 'Control stand, afternoon', { face: 'in' }], [20.0, 12.0, B.crew[6].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Electrician’s mate', 'tee', [[22.5, 4.0, 'mot:b', 'workBench', 'Motor room: reduction gear lube oil', { face: 'in' }], [4.0, 22.5, B.crew[7].feet, 'lie', 'Asleep', { face: 0 }]]);
  // Torpedo rooms.
  extra('Torpedoman’s mate', 'tee', [[19.5, 21.0, [15.6, DECK.ftr, 0.15], 'haul', 'Hauling on the chain fall', { prop: 'rope', face: -1 }], [21.0, 2.0, B.ftr[2].feet, 'lie', 'Asleep', { face: 0 }], [2.0, 19.5, 'ftr:c', 'handsBehind', 'Torpedo room watch', { face: 'out' }]]);
  extra('Torpedoman’s mate', 'tee', [[0.0, 8.0, 'atr:c', 'handsBehind', 'After torpedo room watch', { face: 'out' }], [8.0, 0.0, B.atr[3].feet, 'lie', 'Asleep', { face: 0 }]]);
  extra('Torpedoman’s mate', 'tee', [[19.5, 22.5, [81.5, DECK.atr, 0.25], 'workBench', 'Servicing a torpedo on its skid', { face: 'in' }], [22.5, 19.5, B.atr[4].feet, 'lie', 'Asleep', { face: 0 }]]);
  // The movie audience (S41: films were shown in the torpedo rooms on some boats).
  const film = [[16.4, 0.25], [17.3, 0.6], [18.3, 0.2]];
  film.forEach(([x, zz], i) => extra('Off watch', i % 2 ? 'tee' : 'dung', [
    [20.2, 22.5, [x, DECK.ftr, zz], 'sit', 'Watching the movie', { seat: 0.0, face: 1 }],
    [22.5, 20.2, i < 3 ? B.ftr[3 + (i % 3)].feet : B.atr[5 - (i % 2)].feet, 'lie', 'Asleep', { face: 0 }],
  ]));
  // The mess: night meal, acey-deucey, card games, the midnight meal (S11, S41).
  const diners = [
    ['Off watch: acey-deucey', [[19.5, 23.0, seat(12), 'sitTalk', 'Acey-deucey, with a ring of watchers'], [23.0, 19.5, B.crew[8].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Off watch: acey-deucey', [[19.5, 23.0, seat(13), 'sitTalk', 'Acey-deucey: losing again'], [23.0, 19.5, B.crew[0].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Off watch', [[19.5, 21.0, seat(14), 'sitEat', 'The night meal'], [21.0, 23.5, seat(14), 'sitTalk', 'A card game', { prop: 'cards' }], [23.5, 19.5, B.crew[1].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Off watch', [[19.5, 21.0, seat(15), 'sitEat', 'The night meal'], [21.0, 23.5, seat(15), 'sitTalk', 'A card game', { prop: 'cards' }], [23.5, 19.5, B.crew[2].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Off watch', [[19.5, 20.5, seat(16), 'sitEat', 'The night meal'], [20.5, 22.0, seat(16), 'sitRead', 'Reading the mail', { prop: 'letter' }], [22.0, 19.5, B.crew[3].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Off watch', [[23.8, 0.8, seat(17), 'sitEat', 'Midnight soup and sandwiches'], [0.8, 11.5, B.crew[4].feet, 'lie', 'Asleep', { face: 0 }], [11.5, 23.8, seat(17), 'sitRead', 'Reading', { prop: 'book' }]]],
    ['Off watch', [[21.0, 22.0, A.spots.freezer, 'stand', 'Sneaking a scoop from the ice cream freezer', { face: 'in', prop: 'spoon' }], [22.0, 21.0, B.crew[5].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Seasick newcomer', [[0.0, 24.0, B.crew[2].feet, 'lie', 'Green-faced in his bunk, a bucket close by', { face: 0, prop: 'bucket' }]]],
    ['Off watch: laundry', [[20.5, 21.5, A.spots.wash[2], 'workBench', 'Feeding dungarees into the washing machine', { face: 'in' }], [21.5, 20.5, B.crew[6].feet, 'lie', 'Asleep', { face: 0 }]]],
    ['Mess cook', [[19.5, 22.0, 'store:lad', 'carry', 'Fetching tins from the cold store', { prop: 'box', face: 'in' }], [22.0, 19.5, B.crew[7].feet, 'lie', 'Asleep', { face: 0 }]]],
  ];
  for (const [role, list] of diners) {
    W.addPerson({ role, costume: costume(rng() < 0.5 ? 'tee' : 'dung'), routine: steps(list.map((s) => {
      const [a, b, at, act, label, o = {}] = s;
      if (at && typeof at === 'object' && !Array.isArray(at)) return [a, b, at.at, act, label, Object.assign({ seat: at.seat, face: at.face }, o)];
      return s;
    })) });
  }
  void named; void XS;
}

// Put everyone where their routine has them at the starting hour.
export function settle(W) {
  for (const p of W.people) {
    if (!p.routine) continue;
    const i = p.routine.findIndex((st) => !st.when || inH(W.hour, st.when[0], st.when[1]));
    if (i < 0) continue;
    const st = p.routine[i];
    const pos = W.resolve(st.at);
    p.x = pos.x; p.y = pos.y; p.z = pos.z;
    p.step = i; p.stepT = 0; p.stepDur = 4 + (p.ph % 1) * 10; p.moving = false; p.path = null;
    p.node = typeof st.at === 'string' ? st.at : null;
    p.anim = st.act || 'stand';
    if (st.prop !== undefined) p.prop = st.prop;
    p.seat = st.seat != null ? st.seat : null;
    if (st.face != null) p.heading = p.targetHeading = XS.faceToHeading(st.face);
  }
}

// A prone crawl for the battery wells, where headroom over the cells is under a metre.
anims.register('subCrawl', (p, t, P) => {
  anims.table.lie(p, t, P);
  P.rot = -Math.PI / 2;
  const s = Math.sin(t * 1.6 + p.ph);
  P.uaF = -2.6 + s * 0.25; P.faF = 0.4; P.uaB = -2.2 - s * 0.2; P.faB = 0.6; P.head = -0.5;
  return P;
});
