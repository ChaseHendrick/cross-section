/* The people of the down Coronation, Thursday 29 July 1937 (all fictional; casting list,
 * roles and costume notes from docs/research/train.md, section 4).
 *
 * The scene keeps the train on the Royal Border Bridge at every hour, so routines follow
 * the booked day of the run (tea from 4.10 pm, dinner 6.45 to 8.45 pm) and passengers doze
 * through the night hours. The Fairbairns and the biscuit traveller leave at York (6.37 pm)
 * and Ada Scorer joins there, so they appear or vanish with the clock.
 */
import { XS, mat, anims } from '../../engine/index.js';
import { FL, AISLE } from './common.js';
import { CAB, TENDER } from './loco.js';

const { inHours } = XS.math;
const TEA = [16.1, 17.6], DIN = [18.75, 20.75];

// ------------------------------------------------------------------ extra animations
anims.register('drive', (p, t, P) => {
  anims.table.sit(p, t, P);
  P.uaF = -1.1 + Math.sin(t * 0.4 + p.ph) * 0.05; P.faF = 0.9; P.uaB = 0.3; P.faB = 1.0; P.head = -0.05 + Math.sin(t * 0.21 + p.ph) * 0.06; P.lean = 0.08;
  return P;
});
anims.register('stoop', (p, t, P) => { anims.table.walk(p, t, P); P.lean = 0.55; P.head = -0.35; P.rootY = 0.47; return P; });
anims.register('stopwatch', (p, t, P) => {
  anims.table.stand(p, t, P);
  P.uaF = -1.2; P.faF = 1.9; P.uaB = -0.5; P.faB = 1.7; P.head = -0.1 + Math.sin(t * 0.8) * 0.15; P.prop = 'book';
  return P;
});
anims.register('hose', (p, t, P) => {
  anims.table.stand(p, t, P);
  P.lean = 0.15; P.uaF = -0.9 + Math.sin(t * 1.3) * 0.25; P.faF = 0.5; P.uaB = -0.7; P.faB = 0.8; P.head = 0.35;
  return P;
});
anims.register('serve', (p, t, P) => {
  anims.table.stand(p, t, P);
  const c = (t * 0.25 + p.ph) % 1;
  const d = c < 0.5 ? Math.sin(c * 2 * Math.PI) : 0;
  P.lean = 0.1 + d * 0.15; P.uaF = -1.25 + d * 0.35; P.faF = 1.45; P.uaB = 0.15; P.faB = 1.4; P.prop = 'tray'; P.head = 0.25;
  return P;
});
anims.register('pat', (p, t, P) => {
  anims.table.kneel(p, t, P);
  P.lean = 0.3; P.uaF = -0.4 + Math.sin(t * 3 + p.ph) * 0.2; P.faF = 0.6; P.head = 0.3;
  return P;
});
anims.register('knit', (p, t, P) => {
  anims.table.sit(p, t, P);
  const s = Math.sin(t * 7 + p.ph);
  P.uaF = -0.55 + s * 0.06; P.faF = 1.75; P.uaB = -0.55 - s * 0.06; P.faB = 1.75; P.head = 0.35; P.lean = 0.12;
  return P;
});
anims.register('cards', (p, t, P) => {
  anims.table.sit(p, t, P);
  const c = (t * 0.3 + p.ph) % 1;
  const up = c < 0.15 ? Math.sin((c / 0.15) * Math.PI) : 0;
  P.uaF = -0.7 - up * 0.5; P.faF = 1.5; P.uaB = -0.6; P.faB = 1.8; P.head = 0.2; P.lean = 0.12; P.prop = 'cards';
  return P;
});
XS.actLabel && Object.assign(XS, {});

// ------------------------------------------------------------------ costumes
const SKIN = ['#f1c9a5', '#e6b48f', '#ecc19c', '#d9a27a'];
const HAIR = ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#9a9a9a', '#c9a160'];
const SUIT = ['#4a4e58', '#2e3446', '#5a4a3a', '#6a6a66', '#3a3a40', '#5a5a4a', '#4a3a30', '#5e5446'];
const FROCK = ['#8a5a6a', '#5a7a9a', '#a87a5a', '#6a8a6a', '#9a6a8a', '#c8a87a', '#4a6a8a', '#b85a4a', '#7a6a9a', '#2e3a5a'];
const pick = (r, a) => a[Math.floor(r() * a.length)];
export function man(r, o = {}) { const s = o.suit || pick(r, SUIT); return Object.assign({ skin: pick(r, SKIN), hair: pick(r, HAIR), hairStyle: 'short', top: '#ece6da', coat: 'jacket', coatColor: s, bottom: s, shoes: '#2a1e18' }, o); }
export function woman(r, o = {}) { const f = o.frock || pick(r, FROCK); return Object.assign({ skin: pick(r, SKIN), hair: pick(r, HAIR), hairStyle: r() < 0.6 ? 'bun' : 'short', top: f, dress: 'long', dressColor: f, stockings: '#c8a890', hat: r() < 0.7 ? (r() < 0.6 ? 'cloche' : 'beret') : null, hatColor: pick(r, ['#3a2a2a', '#6a4a3a', '#2a3a5a', '#7a2a2a', '#d8ccb4']), shoes: '#3a2a20' }, o); }
const boy = (r, o = {}) => Object.assign({ child: true, skin: pick(r, SKIN), hair: pick(r, HAIR), top: '#2a3a5a', coat: 'jacket', coatColor: '#2a3a5a', bottom: '#6a6a6a', stockings: '#5a5a5a', hat: 'cap', hatColor: '#2a3a5a' }, o);
const girl = (r, o = {}) => Object.assign({ child: true, skin: pick(r, SKIN), hair: pick(r, HAIR), hairStyle: 'long', top: '#e8b8b8', dress: 'knee', dressColor: '#d88a8a', stockings: '#f2eee4' }, o);
const ATTENDANT = { top: '#f4f0e6', coat: 'jacket', coatColor: '#f6f2ea', bottom: '#1e1e22', shoes: '#141210' };
const CHEF = { top: '#f4f2ee', coat: 'jacket', coatColor: '#f4f2ee', bottom: '#4a4a4e', apron: '#fbfaf6', hat: 'chef', shoes: '#141210' };
const CREW = { top: '#3d5078', coat: 'jacket', coatColor: '#3d5078', bottom: '#34466a', hat: 'cap', hatColor: '#141416', shoes: '#141210' };
const GUARD = { top: '#1e2436', coat: 'jacket', coatColor: '#1e2436', bottom: '#1e2436', hat: 'peaked', hatColor: '#141822', shoes: '#141210' };

// ------------------------------------------------------------------ the cast
export function cast(W, S) {
  const nav = W.nav;
  const r = W.R;
  const taken = new Set();
  const seat = (zone, i) => { const id = zone + ':s' + i; taken.add(id); return id; };
  const sf = (zone, i) => S.seats[zone][i].face;
  const st = (zone, name) => zone + ':' + name;
  const bay = (zone, i) => { const s = S.seats[zone].filter((q) => q.bay === i); const x = s.reduce((a, q) => a + q.x, 0) / s.length; return [x, FL, AISLE + 0.02]; };
  const add = (def) => W.addPerson(def);
  // The scene loops one day of the run: those who leave at York are gone until morning.
  const hideAfterYork = (p) => { p.hidden = inHours(W.hour, 18.62, 6); };
  for (const i of [1, 2, 3, 4, 9, 10, 12, 13]) taken.add('Z38:s' + i);
  taken.add('Z24:s11');

  // ---------------- footplate
  add({ name: 'Albert Hensman', role: 'driver', bio: 'Keeps a pressed cornflower from his wife’s garden in his cap.', costume: Object.assign({}, CREW, { skin: '#e6b48f', hair: '#9a9a9a', beard: null }), H: 1.72,
    routine: [
      { at: 'driver', act: 'drive', face: -1, dur: [40, 70], label: 'Driving: hand on the regulator, eyes on the road ahead' },
      { at: 'lookL', act: 'point', face: -1, dur: [5, 8], label: 'Sighting a distant signal and calling “Off!”' },
      { at: 'driver', act: 'drive', face: -1, dur: [30, 50], label: 'Easing the regulator for the Border curves' },
      { at: 'gaugeL', act: 'workBench', face: 1, dur: [6, 10], label: 'A glance at the speed recorder and the gauges' },
    ] });
  const fireman = add({ name: 'Walter Cowling', role: 'fireman', bio: 'Practising for his driver’s exam with a dog-eared rule book.', costume: Object.assign({}, CREW, { skin: '#f1c9a5', hair: '#6b4428' }), H: 1.76,
    routine: [
      { at: 'fireman', act: 'shovel', face: -1, dur: [22, 34], label: 'Firing: a little and often, into each corner of the box' },
      { at: 'fireSeat', act: 'sit', face: -1, dur: [12, 20], label: 'Watching the road from his seat' },
      { at: 'lookR', act: 'point', face: -1, dur: [5, 8], label: 'Calling the signal back to his mate: “Off!”' },
      { at: 'fireman', act: 'shovel', face: -1, dur: [18, 28], label: 'Firing again: under the door, down the sides' },
      { at: 'coalHose', act: 'hose', face: 1, dur: [8, 12], label: 'Damping the coal with the hose so the dust does not blow about', onArrive: (p, w) => { w.data.hoseT = 10; } },
      { at: 'gaugeR', act: 'crank', face: 1, dur: [6, 10], label: 'Working the injector to feed the boiler' },
      { at: 'fireSeat', act: 'sitRead', face: -1, prop: 'book', dur: [12, 18], label: 'A look at his rule book between rounds' },
    ] });
  S.fireman = fireman;
  add({ name: 'Frederick Tasker', role: 'locomotive inspector', bio: 'Hates the corridor: he is six foot two and the passage is five foot.', costume: man(r, { suit: '#2a2a30', coat: 'long', hat: 'bowler', hatColor: '#1a1a1e', hair: '#5a5a5a', skin: '#e6b48f' }), H: 1.88,
    routine: [
      { at: st('Z18', 'desk'), act: 'sitWrite', face: 'in', dur: [60, 90], label: 'Writing up his pocket book in the van', when: [6, 18.4] },
      { at: 'tc3', act: 'stand', face: -1, dur: [2, 3], walkAnim: 'stoop', label: 'Stooping through the corridor tender to the footplate', when: [18.4, 18.6] },
      { at: 'cabStand', act: 'handsBehind', face: -1, dur: [50, 80], label: 'On the footplate, watching the road ahead', when: [18.4, 22.5] },
      { at: 'cabGauge', act: 'stand', face: -1, dur: [12, 20], label: 'Watching the water level in the gauge glasses', when: [18.4, 22.5] },
      { at: 'tc3', act: 'stand', face: 1, dur: [2, 3], walkAnim: 'stoop', label: 'Back through the corridor, bent double', when: [22.5, 22.7] },
      { at: st('Z18', 'desk'), act: 'sleepSit', face: 'in', dur: [80, 120], label: 'Dozing in the van', when: [22.5, 6] },
    ] });

  // ---------------- guard and the dog
  add({ name: 'Ernest Pybus', role: 'guard', bio: 'Collects railway tickets from every station he has worked.', costume: Object.assign({}, GUARD, { skin: '#ecc19c', hair: '#9a9a9a', beard: '#8a8a8a' }), H: 1.7,
    routine: [
      { at: st('Z36', 'desk'), act: 'sitWrite', face: 'in', dur: [50, 80], label: 'Writing up the guard’s journal', when: [6, 17.4] },
      { at: st('Z36', 'lug'), act: 'workBench', face: 'in', dur: [15, 25], label: 'Checking the labels on the luggage', when: [6, 17.4] },
      { at: st('Z18', 'dog'), act: 'pat', face: 1, dur: [30, 40], label: 'Sharing a biscuit with the spaniel in the front van', when: [17.4, 18.0] },
      { at: st('Z36', 'desk'), act: 'sitWrite', face: 'in', dur: [60, 90], label: 'Entering the passing times in his journal', when: [18.0, 20.4] },
      { at: st('Z18', 'lug'), act: 'workBench', face: 'in', dur: [25, 35], label: 'Walking forward to check the luggage and the dog', when: [20.4, 20.9] },
      { at: st('Z36', 'brake'), act: 'handsBehind', face: 1, dur: [30, 50], label: 'At the handbrake, ready for the run into Edinburgh', when: [20.9, 23] },
      { at: st('Z36', 'desk'), act: 'sleepSit', face: 'in', dur: [60, 90], label: 'Nodding over the journal', when: [23, 6] },
    ] });

  // ---------------- kitchens
  // Cooks work turned three-quarters to the bench, so their faces show (left- or right-handed).
  const kitchenCrew = (name, role, bio, zone, cos, steps, turn = 0.8) => add({ name, role, bio, costume: cos, routine: steps.map((q) => (q.face === 'in' ? Object.assign({}, q, { face: turn }) : q)) });
  kitchenCrew('Tom Ridsdale', 'chef, kitchen B', 'Grew up in a York bakery.', 'Z23', Object.assign({}, CHEF, { skin: '#f1c9a5', hair: '#8d5a2b' }), [
    { at: st('Z23', 'bench'), act: 'workBench', face: 'in', dur: [30, 50], label: 'Scones and teacakes for afternoon tea', when: [13, 17.6] },
    { at: st('Z23', 'range'), act: 'stir', face: 'in', dur: [30, 50], label: 'At the electric range: roasts for dinner', when: [17.6, 20.8] },
    { at: st('Z23', 'bench'), act: 'workBench', face: 'in', dur: [20, 40], label: 'Carving and plating', when: [17.6, 20.8] },
    { at: st('Z23', 'range'), act: 'scrub', face: 'in', dur: [40, 60], label: 'The scrub-down after dinner', when: [20.8, 23] },
    { at: st('Z23', 'pantry'), act: 'sleepSit', face: 'in', dur: [80, 120], label: 'A rest on an upturned crate', when: [23, 13] },
  ]);
  kitchenCrew('Billy Overend', 'kitchen boy, kitchen B', 'Fifteen, on his second week, secretly delighted by the speed.', 'Z23', Object.assign({}, CHEF, { hat: null, coat: null, skin: '#ecc19c', hair: '#c9a160', apron: '#f0ece4' }), [
    { at: st('Z23', 'bench'), act: 'workBench', face: 'in', dur: [30, 50], label: 'Peeling potatoes, very fast', when: [6, 16.1] },
    { at: st('Z23', 'sink'), act: 'workBench', face: 'in', dur: [30, 50], label: 'Washing teacups', when: [16.1, 18.6] },
    { at: st('Z24', 'pass'), act: 'carry', prop: 'tray', face: 1, dur: [6, 10], walkAnim: 'carry', label: 'Carrying a tray through to the seats', when: [16.1, 20.8] },
    { at: st('Z23', 'sink'), act: 'workBench', face: 'in', dur: [30, 60], label: 'Washing up after dinner', when: [18.6, 23] },
    { at: st('Z23', 'pantry'), act: 'sleepSit', face: 'in', dur: [80, 120], label: 'Asleep sitting up in the pantry', when: [23, 6] },
  ], Math.PI - 0.8);
  kitchenCrew('Luigi Bertolini', 'chef, kitchen D', 'Misses gas flames but praises the electric ovens.', 'Z32', Object.assign({}, CHEF, { skin: '#d9a27a', hair: '#2b1d14' }), [
    { at: st('Z32', 'range'), act: 'stir', face: 'in', dur: [40, 60], label: 'Soups and fish for the first-class dinner', when: [14, 20.8] },
    { at: st('Z32', 'bench'), act: 'workBench', face: 'in', dur: [20, 35], label: 'Dressing the fish', when: [14, 20.8] },
    { at: st('Z32', 'range'), act: 'scrub', face: 'in', dur: [40, 60], label: 'Cleaning the ranges', when: [20.8, 23] },
    { at: st('Z32', 'pantry'), act: 'sleepSit', face: 'in', dur: [80, 120], label: 'Resting his feet', when: [23, 14] },
  ], Math.PI - 0.8);
  kitchenCrew('Stanley Keld', 'second cook, kitchen D', 'Sends money home to his mother in Hull.', 'Z32', Object.assign({}, CHEF, { hat: null, skin: '#f1c9a5', hair: '#4a3020' }), [
    { at: st('Z32', 'bench'), act: 'workBench', face: 'in', dur: [30, 50], label: 'Preparing the vegetables', when: [6, 18.75] },
    { at: st('Z32', 'fridge'), act: 'workBench', face: 'in', dur: [10, 16], label: 'At the refrigerator', when: [6, 18.75] },
    { at: st('Z32', 'bench'), act: 'workBench', face: 'in', dur: [30, 50], label: 'Plating dinner', when: [18.75, 20.8] },
    { at: st('Z32', 'sink'), act: 'workBench', face: 'in', dur: [40, 60], label: 'Washing up', when: [20.8, 6] },
  ]);
  // Conductors.
  add({ name: 'Arthur Gedling', role: 'restaurant car conductor (third class)', bio: 'Can carry nine teacups on one forearm.', costume: Object.assign({}, ATTENDANT, { skin: '#e6b48f', hair: '#4a3020' }),
    routine: [
      { at: st('Z23', 'pantry'), act: 'workBench', face: 'in', dur: [25, 40], label: 'Checking the stores in the pantry', when: [6, 16.1] },
      { at: bay('Z21', 2), act: 'talk', face: 1, prop: 'paper', dur: [15, 25], label: 'Taking tea orders', when: [16.1, 17.6] },
      { at: bay('Z26', 3), act: 'talk', face: -1, prop: 'paper', dur: [15, 25], label: 'Taking tea orders at the far end', when: [16.1, 17.6] },
      { at: st('Z23', 'pantry'), act: 'workBench', face: 'in', dur: [20, 30], label: 'Running the dinner service', when: [17.6, 20.8] },
      { at: bay('Z24', 1), act: 'serve', face: 1, dur: [10, 16], walkAnim: 'carryHigh', label: 'Serving dinner himself when it gets busy', when: [17.6, 20.8] },
      { at: st('Z24', 's11'), act: 'sitWrite', face: -1, dur: [40, 60], label: 'Tallying the bills', when: [20.8, 6] },
    ] });
  add({ name: 'Cyril Mawson', role: 'restaurant car conductor (first class)', bio: 'Learned his trade on Cunard liners.', costume: Object.assign({}, ATTENDANT, { skin: '#ecc19c', hair: '#9a9a9a' }),
    routine: [
      { at: bay('Z29', 2), act: 'workBench', face: 'in', dur: [20, 30], label: 'Laying the tables just so', when: [6, 18.75] },
      { at: bay('Z30', 3), act: 'workBench', face: 'in', dur: [20, 30], label: 'Laying the tables in the second saloon', when: [6, 18.75] },
      { at: bay('Z29', 4), act: 'serve', face: -1, dur: [14, 22], walkAnim: 'carryHigh', label: 'Serving dinner in first class', when: [18.75, 20.75] },
      { at: bay('Z30', 1), act: 'serve', face: 1, dur: [14, 22], walkAnim: 'carryHigh', label: 'Serving the fish course', when: [18.75, 20.75] },
      { at: st('Z32', 'pantry'), act: 'workBench', face: 'in', dur: [40, 60], label: 'Settling the accounts in the pantry', when: [20.75, 6] },
    ] });
  // Attendants: pantry, then the seats, at tea and dinner.
  const attendant = (name, bio, skin, hair, kz, zones) => {
    const steps = [];
    for (const [w, what] of [[TEA, 'tea'], [DIN, 'dinner']]) {
      steps.push({ at: st(kz, 'pantry'), act: 'workBench', prop: 'tray', face: 'in', dur: [8, 14], label: 'Loading a tray in the pantry', when: w });
      zones.forEach(([z, b], j) => steps.push({ at: bay(z, b), act: 'serve', face: j % 2 ? -1 : 1, dur: [10, 18], walkAnim: 'carryHigh', label: what === 'tea' ? 'Serving tea at the seats (1s, or 9d)' : 'Serving dinner at the seats', when: w }));
    }
    steps.push({ at: st(kz, 'pantry'), act: 'workBench', prop: null, face: 'in', dur: [30, 50], label: 'Polishing the flat-handled cutlery', when: [20.75, 16.1] });
    steps.push({ at: bay(zones[0][0], zones[0][1]), act: 'talk', face: 1, dur: [12, 20], label: 'Clearing and chatting with the passengers', when: [17.6, 18.75] });
    steps.push({ at: st(kz, 'pantry'), act: 'workBench', prop: null, face: 'in', dur: [20, 40], label: 'Clearing away the tea things', when: [17.6, 18.75] });
    return add({ name, role: 'attendant', bio, costume: Object.assign({}, ATTENDANT, { skin, hair }), routine: steps });
  };
  attendant('Reg Ashby', 'Proud that nothing on his tray rattles.', '#f1c9a5', '#2b1d14', 'Z32', [['Z29', 1], ['Z29', 3], ['Z29', 5]]);
  attendant('Percy Blenkin', 'Whistles hymns under his breath.', '#e6b48f', '#b07a3c', 'Z32', [['Z30', 0], ['Z30', 2], ['Z30', 4]]);
  attendant('Jack Dobbie', 'Supports Hearts; going home to Edinburgh.', '#ecc19c', '#7a2c14', 'Z23', [['Z26', 1], ['Z26', 3], ['Z26', 5]]);
  attendant('Alf Hornsey', 'Keeps a list of famous passengers he has served.', '#e6b48f', '#4a3020', 'Z23', [['Z21', 1], ['Z21', 3], ['Z21', 5]]);
  attendant('Sidney Pallister', 'Engaged to a York dressmaker; waves from the York platform.', '#f1c9a5', '#8d5a2b', 'Z32', [['Z35', 1], ['Z35', 3], ['Z33', 1]]);
  add({ name: 'Leonard Crake', role: 'observation car attendant', bio: 'Knows every lineside landmark by heart.', costume: Object.assign({}, ATTENDANT, { skin: '#e6b48f', hair: '#6b4428' }),
    routine: [
      { at: st('Z37', 'counter'), act: 'workBench', face: 'in', dur: [15, 25], label: 'Pouring drinks at his counter' },
      { at: [168.5, FL, 0.1], act: 'serve', face: 1, dur: [8, 12], walkAnim: 'carryHigh', label: 'Taking drinks to the armchairs' },
      { at: [172.5, FL, 0.1], act: 'point', face: 1, dur: [6, 10], label: 'Pointing out the Tweed and the old bridges below' },
      { at: [166.0, FL, 0.0], act: 'talk', face: 1, dur: [10, 14], label: 'Collecting a shilling for the next hour in a chair' },
    ] });
  add({ name: 'Norman Thwaites', role: 'train attendant', bio: 'Keeps a pencil behind each ear.', costume: Object.assign({}, ATTENDANT, { coatColor: '#2a2e40', top: '#2a2e40', bottom: '#2a2e40', hat: 'peaked', hatColor: '#1e2230', skin: '#ecc19c', hair: '#4a3020' }),
    routine: [
      { at: bay('Z30', 3), act: 'talk', face: -1, prop: 'paper', dur: [8, 12], label: 'Collecting letters to post and telegram forms' },
      { at: bay('Z26', 4), act: 'talk', face: -1, prop: 'paper', dur: [8, 12], label: 'Asking if anyone has letters for the post' },
      { at: bay('Z21', 3), act: 'talk', face: -1, prop: 'paper', dur: [8, 12], label: 'Taking a telegram for a passenger' },
      { at: bay('Z19', 1), act: 'talk', face: -1, prop: 'paper', dur: [8, 12], label: 'Collecting letters at the front of the train' },
      { at: bay('Z33', 1), act: 'talk', face: 1, prop: 'paper', dur: [8, 12], label: 'Collecting letters' },
      { at: bay('Z35', 3), act: 'talk', face: 1, prop: 'paper', dur: [8, 12], label: 'Collecting letters' },
      { at: st('Z37', 'counter'), act: 'sitWrite', face: 'in', dur: [20, 40], label: 'Sorting the letters into his bag' },
    ] });

  // ---------------- first class
  const meal = (z, i, cos, name, role, bio, day, extra = []) => {
    const s = seat(z, i), f = sf(z, i);
    return add({ name, role, bio, costume: cos, at: s, routine: [
      Object.assign({ at: s, face: f, dur: [40, 80], when: [6, 16.1] }, day),
      { at: s, act: 'sitDrink', prop: 'mug', face: f, dur: [40, 70], label: 'Afternoon tea', when: TEA },
      Object.assign({ at: s, face: f, dur: [40, 80], when: [17.6, 18.75] }, day),
      { at: s, act: 'sitEat', face: f, dur: [50, 90], label: 'Dinner at the table', when: DIN },
      Object.assign({ at: s, face: f, dur: [40, 80], when: [20.75, 22.4] }, day),
      { at: s, act: 'sleepSit', face: f, dur: [80, 140], label: 'Dozing', when: [22.4, 6] },
    ].concat(extra) });
  };
  meal('Z29', 2, man(r, { suit: '#2e3446', hair: '#9a9a9a', skin: '#ecc19c' }), 'Hugh Mounsey', 'first-class passenger, shipping broker', 'Going home to Leith after a week of meetings.', { act: 'sitRead', prop: 'paper', label: 'Reading the papers' },
    [{ at: 'Z38:s1', act: 'sit', face: 0.4, dur: [60, 80], label: 'An hour in the observation car', when: [20.0, 20.75] }]);
  meal('Z29', 3, woman(r, { frock: '#5a4a6a', hat: 'cloche', hatColor: '#3a2a3a', hair: '#9a9a9a', skin: '#f1c9a5' }), 'Violet Mounsey', 'first-class passenger', 'Worried about her daughter’s first baby.', { act: 'knit', label: 'Knitting a matinée jacket for the baby' });
  meal('Z29', 6, man(r, { suit: '#5a4a3a', hair: '#e8e4dc', beard: '#d8d4cc', skin: '#ecc19c' }), 'Prof. Ewan Sillars', 'first-class passenger, lecturer', 'Underlines every misprint in red.', { act: 'sitWrite', label: 'Proofing his book, red pencil in hand' });
  meal('Z29', 8, man(r, { suit: '#7a7a72', hair: '#4a3020', skin: '#f1c9a5' }), 'Dwight Haldeman', 'first-class passenger, American tourist', 'Comparing it all to the Twentieth Century Limited.', { act: 'sitTalk', label: 'Comparing it all to the Twentieth Century Limited' },
    [{ at: 'Z38:s2', act: 'sitTalk', face: 0.4, dur: [60, 80], label: 'In the observation car for the crossing at Berwick', when: [20.75, 21.6] }]);
  meal('Z29', 9, woman(r, { frock: '#c8a87a', hat: 'beret', hatColor: '#7a2a2a', hair: '#b07a3c' }), 'Ruth Haldeman', 'first-class passenger, American tourist', 'Has filled half a notebook with postcards to buy.', { act: 'sitTalk', label: 'Admiring the lamps and the alcoves' },
    [{ at: 'Z38:s3', act: 'sit', face: 0.4, dur: [60, 80], label: 'Watching for the sea from the observation car', when: [20.75, 21.6] }]);
  const strachan = meal('Z30', 0, man(r, { suit: '#6a6a48', hair: '#8a8a8a', skin: '#e6b48f', beard: null }), 'Major Lionel Strachan', 'first-class passenger, sportsman', 'Off to a borrowed fishing beat, then the grouse.', { act: 'sitDrink', prop: 'glass', label: 'A whisky and soda' },
    [{ at: st('Z18', 'dog'), act: 'pat', face: 1, dur: [30, 40], label: 'Visiting his spaniel in the van', when: [17.45, 17.8] }, { at: st('Z18', 'dog'), act: 'pat', face: 1, dur: [30, 40], label: 'A last look at the spaniel before Edinburgh', when: [20.45, 20.8] }]);
  void strachan;
  meal('Z30', 5, woman(r, { frock: '#2e3a5a', hat: 'cloche', hatColor: '#d8ccb4', hair: '#c9a160', skin: '#f1c9a5' }), 'Daphne Arbuthnot', 'first-class passenger, actress', 'Touring a comedy to an Edinburgh theatre.', { act: 'sitRead', prop: 'book', label: 'Learning her lines' },
    [{ at: 'Z38:s9', act: 'sit', face: 0.25, dur: [60, 80], label: 'Watching the sea from the observation car', when: [21.0, 22.0] }]);
  meal('Z30', 8, man(r, { suit: '#3a3a40', hair: '#2b1d14', skin: '#e6b48f' }), 'Isidore Lavin', 'first-class passenger, fur buyer', 'Bets the reporter they’ll be in on time.', { act: 'sitWrite', label: 'Doing his accounts' },
    [{ at: 'Z38:s4', act: 'sitTalk', face: 0.4, dur: [60, 80], label: 'His hour in the observation car', when: [18.75, 19.6] }]);

  // ---------------- third class
  const fair = (i, cos, name, role, bio, day) => {
    const p = meal('Z21', i, cos, name, role, bio, day);
    p.onUpdate = hideAfterYork;
    return p;
  };
  fair(2, man(r, { suit: '#4a3a30', hair: '#6b4428' }), 'George Fairbairn', 'third-class passenger, draper', 'Wanted the whole family to “ride the fastest train in the Empire”.', { act: 'sitRead', prop: 'paper', label: 'Reading about Dominion of Canada’s 109½ mph test run: last month’s news' });
  fair(3, woman(r, { frock: '#6a8a6a', hat: 'cloche', hatColor: '#4a5a3a' }), 'Elsie Fairbairn', 'third-class passenger', 'Saved the supplement out of the housekeeping.', { act: 'sitTalk', label: 'Minding the children' });
  fair(0, girl(r, { dressColor: '#e8a0a0' }), 'Joan Fairbairn', 'third-class passenger, aged 7', 'Has named the engine “Mr Blue”.', { act: 'sitWork', label: 'Drawing Mr Blue with her crayons' });
  const peter = add({ name: 'Peter Fairbairn', role: 'third-class passenger, aged 11', bio: 'Certain they did 90 down from Stevenage.', costume: boy(r, { hair: '#8d5a2b' }), at: seat('Z21', 1),
    routine: [
      { at: st('Z22', 'window'), act: 'stopwatch', face: 1.25, dur: [40, 70], label: 'Timing the mileposts with his stopwatch' },
      { at: 'Z21:s1', act: 'sitWrite', face: -1, dur: [20, 40], label: 'Pencilling the speeds into his notebook' },
    ] });
  peter.onUpdate = hideAfterYork;
  const nanny = meal('Z19', 7, woman(r, { frock: '#2e3a5a', hat: 'cloche', hatColor: '#1e2a4a', hair: '#9a9a9a' }), 'Agnes Pringle', 'third-class passenger, nanny', 'Has been to sea but never above 60 mph.', { act: 'sitRead', prop: 'book', label: 'Reading aloud to the children' });
  void nanny;
  add({ name: 'Robin Lockhart', role: 'third-class passenger, aged 9', bio: 'Wants to be an engine driver.', costume: boy(r, { top: '#6a2a2a', coatColor: '#6a2a2a', hatColor: '#6a2a2a' }), at: seat('Z19', 6),
    routine: [
      { at: 'Z19:s6', act: 'sitRead', prop: 'book', face: 1, dur: [40, 80], label: 'Reading his comics', when: [6, 17.4] },
      { at: st('Z18', 'dog'), act: 'pat', face: 1, dur: [30, 40], label: 'Allowed to see the dog in the van with the guard', when: [17.4, 17.9] },
      { at: 'Z19:s6', act: 'sitEat', face: 1, dur: [40, 80], label: 'Tea, then dinner', when: [17.9, 20.75] },
      { at: 'Z19:s6', act: 'sitTalk', face: 1, dur: [40, 80], label: 'Asking how fast the engine is going', when: [20.75, 22.0] },
      { at: 'Z19:s6', act: 'sleepSit', face: 1, dur: [80, 140], label: 'Asleep against the window', when: [22.0, 6] },
    ] });
  meal('Z19', 4, girl(r, { dressColor: '#8aa8c8' }), 'Fiona Lockhart', 'third-class passenger, aged 6', 'Lost a tooth on the train at Doncaster.', { act: 'sitTalk', label: 'Showing everyone the gap where her tooth was' });
  const tebb = meal('Z26', 2, man(r, { suit: '#5a5a4a' }), 'Harold Tebb', 'third-class passenger, biscuit traveller', 'A sample case of biscuits under the seat.', { act: 'sitWrite', label: 'Writing up his order books' });
  tebb.onUpdate = hideAfterYork;
  meal('Z26', 7, man(r, { suit: '#4a4e58', hair: '#2b1d14' }), 'Bernard Quayle', 'third-class passenger, newspaper reporter', 'Wants to ride the footplate; refused.', { act: 'sitWrite', label: 'Writing up the new train for his paper' },
    [{ at: st('Z23', 'pass'), act: 'talk', face: -1, dur: [30, 40], label: 'Interviewing the attendants for his piece', when: [17.6, 18.5] }, { at: 'Z38:s10', act: 'sitWrite', face: 0.25, dur: [60, 80], label: 'Notes on the view from the observation car', when: [19.0, 19.9] }]);
  meal('Z24', 2, man(r, { suit: '#1e1e22', top: '#f6f4ee', hair: '#9a9a9a', skin: '#f1c9a5' }), 'Rev. Alastair Muir', 'third-class passenger, minister', 'Refuses the wine, accepts a second pudding.', { act: 'sitWrite', label: 'Writing Sunday’s sermon' });
  meal('Z24', 7, man(r, { suit: '#3a3a40', skin: '#8a5634', hair: '#1a1410' }), 'Rajan Menon', 'third-class passenger, medical student', 'First time seeing the Border.', { act: 'sitRead', prop: 'book', label: 'Deep in an anatomy textbook' });
  meal('Z33', 2, woman(r, { frock: '#1e2a4a', hat: 'beret', hatColor: '#1e2a4a', hair: '#4a3020' }), 'Winifred Hoyle', 'third-class passenger, nurse', 'Returning to an Edinburgh hospital.', { act: 'sleepSit', label: 'Asleep after a night shift' });
  const ada = meal('Z33', 11, woman(r, { frock: '#7a6a9a', hat: 'cloche', hatColor: '#4a3a5a', hair: '#9a9a9a', skin: '#ecc19c' }), 'Ada Scorer', 'third-class passenger, joined at York', 'Visiting her sister in Portobello.', { act: 'sitTalk', label: 'Telling her neighbour about her sister' });
  ada.onUpdate = (p) => { p.hidden = !inHours(W.hour, 18.67, 6); };
  const cairns = (i, cos, name, bio, extraLabel) => meal('Z35', i, cos, name, 'third-class passenger, honeymooner', bio, { act: 'sitTalk', label: 'Holding hands under the table' },
    [{ at: 'Z38:s' + (i === 6 ? 12 : 13), act: 'sitTalk', face: 0.05, dur: [50, 70], label: extraLabel, when: [20.95, 21.6] }]);
  cairns(6, man(r, { suit: '#3a3a40', hair: '#7a2c14' }), 'Donald Cairns', 'Spent their savings on the supplement.', 'At the tail window for the crossing at Berwick');
  cairns(7, woman(r, { frock: '#b85a4a', hat: 'cloche', hatColor: '#f2ece0' }), 'Moira Cairns', 'Spent their savings on the supplement.', 'Watching the river from the beaver tail');
  // The soldier and his card game.
  const sp = seat('Z35', 14);
  add({ name: 'Thomas Pratt', role: 'third-class passenger, soldier on leave', bio: 'Kilted regiment, going home on leave.', costume: { skin: '#e6b48f', hair: '#6b4428', top: '#6a6448', coat: 'jacket', coatColor: '#6a6448', dress: 'knee', dressColor: '#2e4a3a', stockings: '#c8c0a8', hat: 'tam', hatColor: '#1e2a22' }, at: sp,
    routine: [
      { at: sp, act: 'cards', face: sf('Z35', 14), dur: [60, 100], label: 'A game of cards with strangers', when: [6, 18.75] },
      { at: sp, act: 'sitEat', face: sf('Z35', 14), dur: [60, 100], label: 'Dinner', when: DIN },
      { at: sp, act: 'cards', face: sf('Z35', 14), dur: [60, 100], label: 'Another hand, for matches', when: [20.75, 23] },
      { at: sp, act: 'sleepSit', face: sf('Z35', 14), dur: [80, 140], label: 'Asleep in his greatcoat', when: [23, 6] },
    ] });
  for (const i of [12, 13, 15]) {
    const s = seat('Z35', i);
    add({ role: 'third-class passenger', costume: man(r), at: s, routine: [
      { at: s, act: 'cards', face: sf('Z35', i), dur: [60, 100], label: 'Playing cards with the soldier', when: [6, 18.75] },
      { at: s, act: 'sitEat', face: sf('Z35', i), dur: [60, 100], label: 'Dinner', when: DIN },
      { at: s, act: 'cards', face: sf('Z35', i), dur: [60, 100], label: 'Playing cards for matches', when: [20.75, 23] },
      { at: s, act: 'sleepSit', face: sf('Z35', i), dur: [80, 140], label: 'Dozing', when: [23, 6] },
    ] });
  }

  // ---------------- everyone else: passengers in most of the remaining seats
  const occ = { Z19: 0.7, Z21: 0.8, Z24: 0.75, Z26: 0.8, Z29: 0.6, Z30: 0.6, Z33: 0.7, Z35: 0.75, Z38: 0.45 };
  const dayActs = ['sitTalk', 'sitRead', 'sitTalk', 'sit', 'sitRead', 'sleepSit', 'knit'];
  for (const zone of Object.keys(S.seats)) {
    S.seats[zone].forEach((q, i) => {
      const id = zone + ':s' + i;
      if (taken.has(id) || r() > (occ[zone] || 0.6)) return;
      const f = q.face;
      const female = r() < 0.45;
      const child = r() < 0.08;
      const cos = child ? (female ? girl(r) : boy(r)) : female ? woman(r) : man(r);
      const a1 = dayActs[Math.floor(r() * dayActs.length)], a2 = r() < 0.5 ? 'sitTalk' : 'sitRead';
      const read = (a) => (a === 'sitRead' ? (r() < 0.5 ? 'paper' : 'book') : null);
      const obs = zone === 'Z38';
      add({ role: zone === 'Z29' || zone === 'Z30' ? 'first-class passenger' : obs ? 'passenger, an hour in the observation car' : 'third-class passenger', costume: cos, at: id, routine: [
        { at: id, act: obs ? 'sit' : a1 === 'knit' && !female ? 'sitRead' : a1, prop: read(a1), face: f, dur: [40, 90], when: [6, 16.1] },
        { at: id, act: obs ? 'sitDrink' : 'sitDrink', prop: 'mug', face: f, dur: [40, 90], label: 'Afternoon tea at the seat', when: TEA },
        { at: id, act: a2, prop: read(a2), face: f, dur: [40, 90], when: [17.6, 18.75] },
        { at: id, act: obs ? 'sitTalk' : 'sitEat', face: f, dur: [40, 90], label: obs ? 'Watching the view' : 'Dinner at the seat', when: DIN },
        { at: id, act: r() < 0.5 ? 'sitTalk' : 'sitRead', face: f, dur: [40, 90], when: [20.75, 22.4] },
        { at: id, act: 'sleepSit', face: f, dur: [80, 140], label: 'Dozing', when: [22.4, 6] },
      ] });
    });
  }

  // ---------------- on the river and beside the line
  const coble = S.coble;
  const davie = add({ name: 'Davie Purves', role: 'salmon fisherman', bio: 'Can tell the time by the Coronation.', costume: { skin: '#d9a27a', hair: '#6a6a6a', top: '#3a4458', bottom: '#2a2a2e', hat: 'flat', hatColor: '#3a3a36', shoes: '#1a1612' }, act: 'sitRow', label: 'Rowing the coble round in a half circle, paying out the net', at: [0, 0, 0] });
  davie.onUpdate = (p) => { p.x = coble.position.x; p.y = coble.position.y + 0.25; p.z = coble.position.z; p.heading = p.targetHeading = -coble.rotation.y + Math.PI; };
  const mate = add({ role: 'salmon fisherman', costume: { skin: '#e6b48f', hair: '#4a3020', top: '#5a4a3a', bottom: '#2a2a2e', hat: 'flat', hatColor: '#2a2a26' }, act: 'haul', label: 'Paying the net out over the stern', at: [0, 0, 0] });
  mate.onUpdate = (p) => { const c = Math.cos(coble.rotation.y), s = Math.sin(coble.rotation.y); p.x = coble.position.x + c * 1.4; p.y = coble.position.y + 0.25; p.z = coble.position.z - s * 1.4; p.heading = p.targetHeading = -coble.rotation.y; };
  const [nx, ny, nz] = S.shoreNet;
  add({ name: 'Andrew Purves', role: 'fisherman’s son', bio: 'Waves his cap at the observation car.', costume: boy(r, { child: false, top: '#4a3a2a', coatColor: '#4a3a2a', bottom: '#3a3a3a', hat: 'flat', hatColor: '#3a3a36' }), H: 1.5, at: [nx, ny, nz],
    routine: [
      { at: [nx, ny, nz], act: 'haul', face: -1, dur: [40, 60], label: 'Holding the shore end of the net' },
      { at: [nx, ny, nz], act: 'wave', face: 'out', dur: [6, 9], label: 'Waving his cap at the observation car high above' },
    ] });
  // A platelayer stands clear in the cess as the train passes.
  add({ role: 'platelayer', costume: { skin: '#d9a27a', hair: '#4a3020', top: '#4a4438', coat: 'jacket', coatColor: '#4a4438', bottom: '#3a3630', hat: 'flat', hatColor: '#2a2824' }, at: [186.5, -0.12, 4.6], act: 'stand', prop: 'shovel', face: -1.9, label: 'Standing clear in the cess as 312 tons of blue rush past' });

  void nav; void mat; void CAB; void TENDER;
}
