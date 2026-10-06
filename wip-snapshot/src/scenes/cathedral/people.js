/* Salisbury 1245: the people. Fifty named, fictional characters from the dossier's
 * casting list (section 4.4) with routines through a midsummer day, and the crowds of
 * masons, labourers, carters, clergy and choirboys around them.
 *
 * Clothing follows the dossier (section 4.2): short belted tunics, hose, coifs, hoods and
 * straw hats for the men; long tunics with wimples or veils for the women; leather aprons
 * only for smiths; surplices and black choir copes for the clergy. Real people (the master
 * mason, the bishop, the keeper of the fabric) are never named characters.
 *
 * The clock runs about 120 times faster than life, so walks are long in clock time: people
 * who live in town walk out by the Chilmark road or the north door and are then at home.
 */
import { XS } from '../../engine/index.js';
import { bayX, PLATE, AZ0 } from './common.js';
import { LODGE, SCAF, SEATS, CAST, BELL } from './site.js';
import { STALLS, ALTAR, PAINTER } from './fittings.js';
import { COTTAGES } from './town.js';

const TUNIC = ['#8a7458', '#a08868', '#8a4a2e', '#5a6a7e', '#5e6e4a', '#8a8478', '#7a5a3a', '#6a5a48', '#9a8a6a', '#7a6248'];
const DUSTY = ['#c8c0b0', '#b8b0a0', '#bab4a6', '#a8a294', '#c4baa6'];
const HOSE = ['#6a5a48', '#4a4038', '#7a6a58', '#5a4a3a', '#8a7a64', '#5a5048'];
const HOOD = ['#6a5a48', '#7a4a32', '#5a6a58', '#8a7a5a', '#4a5466', '#7a6a52'];
const SKIN = ['#f1c9a5', '#e6b48f', '#d9a27a', '#efc4a0', '#e2b28a', '#d8a682'];
const HAIR = ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#c9a160', '#7a2c14', '#5a4030'];
const DRESS = ['#6a5a48', '#5a6a7e', '#7a4a32', '#6a7a5a', '#8a7a5a', '#4a5a6a'];
const LINEN = '#ece6d6', STRAW = '#d4b878', SHOES = '#3a2a1e';

const S = (at, act, when, dur, label, o) => Object.assign({ at, act, when, dur, label }, o || {});
const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
// Start each person where their routine has them at the scene's opening hour, rather than
// at the first step (which may be a walk in from the road hours earlier).
function placed(W, def) {
  const R = def.routine;
  const i = R && R.length ? R.findIndex((q) => !q.when || inH(W.hour, q.when[0], q.when[1])) : -1;
  const st = i >= 0 ? R[i] : null;
  if (st) { def.at = st.at; if (st.face != null) def.face = st.face; }
  const p = W.addPerson(def);
  if (st) {
    // Already settled into that step: doing it, not walking to it.
    const d = st.dur == null ? 20 : Array.isArray(st.dur) ? st.dur[1] : st.dur;
    p.step = i; p.stepT = W.R() * d * 0.8; p.stepDur = d; p.moving = false;
    p.anim = st.act || 'stand'; p.seat = st.seat != null ? st.seat : null;
    if (st.prop !== undefined) p.prop = st.prop;
    if (st.face != null) p.heading = p.targetHeading = XS.faceToHeading(st.face);
  }
  return p;
}

// ------------------------------------------------------------------ costumes
export function costumes(r) {
  const pick = (a) => a[Math.floor(r() * a.length)];
  const head = () => { const x = r(); return x < 0.45 ? { hat: 'coif', hatColor: LINEN } : x < 0.75 ? { hat: 'hood', hatColor: pick(HOOD) } : x < 0.9 ? { hat: 'straw', hatColor: STRAW } : { hat: 'beret', hatColor: pick(HOOD) }; };
  const base = () => ({ skin: pick(SKIN), hair: pick(HAIR), hairStyle: 'short', bottom: pick(HOSE), shoes: SHOES, beard: r() < 0.3 ? pick(HAIR) : null });
  return {
    worker: (o) => Object.assign(base(), { top: pick(TUNIC) }, head(), o || {}),
    mason: (o) => Object.assign(base(), { top: pick(DUSTY) }, r() < 0.7 ? { hat: 'coif', hatColor: LINEN } : head(), o || {}),
    labourer: (o) => Object.assign(base(), { top: pick(TUNIC), bottom: r() < 0.5 ? '#c8a888' : pick(HOSE) }, r() < 0.55 ? { hat: 'straw', hatColor: STRAW } : head(), o || {}),
    smith: (o) => Object.assign(base(), { top: '#6a5a48', apron: '#5a3a24', hat: 'coif', hatColor: '#c8c0b0' }, o || {}),
    woman: (o) => Object.assign({ skin: pick(SKIN), hair: pick(HAIR), dress: 'long', dressColor: pick(DRESS), top: pick(DRESS), hat: r() < 0.6 ? 'wimple' : 'veil', hatColor: LINEN, apron: r() < 0.6 ? '#e6dfcc' : null, shoes: SHOES }, o || {}),
    child: (o) => Object.assign(base(), { child: true, top: pick(TUNIC), beard: null }, r() < 0.4 ? { hat: 'hood', hatColor: pick(HOOD) } : {}, o || {}),
    girl: (o) => Object.assign({ skin: pick(SKIN), hair: pick(HAIR), hairStyle: 'long', child: true, dress: 'long', dressColor: pick(DRESS), top: pick(DRESS), shoes: SHOES }, o || {}),
    choir: (o) => Object.assign({ skin: pick(SKIN), hair: pick(HAIR), hairStyle: r() < 0.5 ? 'bald' : 'short', top: '#f2eee4', dress: 'long', dressColor: '#f2eee4', coat: 'long', coatColor: '#1e1c1c', shoes: '#1a1410', beard: null }, o || {}),
    boy: (o) => Object.assign({ skin: pick(SKIN), hair: pick(HAIR), hairStyle: 'short', child: true, top: '#f2eee4', dress: 'long', dressColor: '#f2eee4', shoes: '#1a1410' }, o || {}),
  };
}

// ------------------------------------------------------------------ routine builders
// A worker's day: arrive by the road or the north door, work blocks, breakfast, dinner, ale,
// leave at the end of the day, then home (a jump: home is out of sight).
function day(W, o) {
  const exit = o.exit || W.data.exitW;
  const home = o.home;
  const R = [];
  R.push(S(exit, 'walk', [o.start || 4.3, (o.start || 4.3) + 0.6], 1, 'Arriving for the day\'s work'));
  for (const st of o.work1) R.push(st);
  if (o.breakfast !== false) R.push(o.breakfast || S([-44.6 + (o.i || 0) % 5 * 0.8, 0, 1.55], 'drink', [8.0, 8.6], 20, 'Breakfast: bread and ale at the stall', { face: 'in', prop: 'mug' }));
  for (const st of o.work2) R.push(st);
  R.push(o.dinner || S(SEATS[(o.i || 0) % SEATS.length] != null ? [SEATS[(o.i || 0) % SEATS.length], 0, 4.02] : [12, 0, 5], 'sitEat', [11.0, 12.5], 40, 'Dinner and a rest', { seat: 0.45, face: 'out' }));
  for (const st of o.work3) R.push(st);
  if (o.ale !== false) R.push(o.ale || S(o.aleAt || o.work3[0].at, 'drink', [15.0, 15.4], 10, 'Water and ale break', { prop: 'mug', face: 'out' }));
  for (const st of o.work4 || o.work3) R.push(Object.assign({}, st, { when: [15.4, o.end || 18.8] }));
  if (o.evening) for (const st of o.evening) R.push(st);
  R.push(S(exit, 'walk', [o.end || 18.8, (o.end || 18.8) + 1.4], 1, 'Walking home'));
  if (o.cottage != null) {
    const c = COTTAGES[o.cottage];
    R.push(S(W.data.exitE, 'walk', [(o.end || 18.8) + 1.4, 21.2], 1, 'Home along the lane'));
    R.push(S([(c.x0 + 0.7 + (o.side || 0) * 0.55), 0.04, 1.15], 'sitEat', [19.4, 21.5], 25, 'Supper by the hearth', { seat: 0.43, face: 'out' }));
    const bed = o.bedKind === 'pallet' ? c.pallet : c.bed;
    const feet = bed.feet.slice(); feet[2] += (o.side || 0) * 0.35 - 0.18 * (o.bedKind === 'pallet' ? 0 : 1);
    R.push(S(feet, 'lie', [21.5, 3.9], 240, 'Asleep', { face: bed.heading }));
    R.push(S(W.data.exitE, 'walk', [3.9, 4.3], 1, 'Off to work at first light'));
  } else {
    R.push(S(home, 'lie', [(o.end || 18.8) + 1.4, o.start || 4.3], 300, 'At home in the town'));
  }
  return R;
}
// Work block helper: the same activity in all four work windows.
const at4 = (at, act, label, o) => ({
  work1: [S(at, act, [4.8, 8.0], 40, label, o)],
  work2: [S(at, act, [8.6, 11.0], 40, label, o)],
  work3: [S(at, act, [12.5, 15.0], 40, label, o)],
});

// Clergy: the hours sung in the quire, home in the Close between them.
const HOURS = [[2.0, 4.4, 'Singing Matins and Lauds by candlelight'], [5.9, 6.5, 'Prime'], [9.0, 11.6, 'Terce, High Mass and Sext'], [15.0, 15.5, 'None'], [17.8, 19.6, 'Vespers and Compline']];
function clergy(W, seat, o = {}) {
  const R = [];
  const home = W.data.close;
  HOURS.forEach(([a, b, label], i) => {
    const next = HOURS[(i + 1) % HOURS.length][0];
    const sv = (o.service && o.service[i]) || S(seat.at, seat.act || 'sitSing', [a - 0.4, b], 60, label, { seat: seat.seat, face: seat.face || 'out', prop: seat.prop });
    R.push(S(W.data.cdoor, 'walk', [a - 1.0, a - 0.4], 1, 'Coming in for ' + label.split(' ')[0].replace(',', '')));
    R.push(sv);
    R.push(S(W.data.cdoor, 'walk', [b, b + 0.4], 1, 'Leaving the quire'));
    if (o.between && o.between[i]) for (const st of o.between[i]) R.push(st);
    else R.push(S(home, 'stand', [b + 0.4, next - 1.0], 120, i === 4 ? 'Asleep in his house in the Close' : 'At his house in the Close'));
  });
  return R;
}

// ------------------------------------------------------------------ the cast
export function buildPeople(W, k) {
  const r = k.rng('people');
  const C = costumes(r);
  const homes = W.data.homes;
  W.data.close = homes[homes.length - 1];
  let hi = 0;
  const home = () => homes[hi++ % (homes.length - 1)];
  const exitN = W.data.exitN;
  const P = (name, role, bio, costume, routine) => placed(W, { name, role, bio, costume, routine });
  const B = LODGE.bankers; // banker positions: back row [0..4] face out, front row [5, 6]
  const bank = (i) => (i < 5 ? { at: B[i], face: 'out' } : { at: [B[i][0], 0, 0.2], face: 'in' });
  const lift = (i, x) => [x, SCAF.tall[i].y, SCAF.tallZ + 0.3];
  const put = (i, x) => [x, SCAF.put[Math.min(i, SCAF.put.length - 1)].y, SCAF.putZ + 0.2];
  const RY = PLATE + 0.38;

  // 1 Gilbert of Teffont, warden of the lodge.
  P('Gilbert of Teffont', 'warden of the lodge', 'Grew up beside the Chilmark quarry and can tell a bad bed of stone by its smell when wet.',
    C.mason({ top: '#7a6a52', hat: 'coif', beard: '#6b4428' }), day(W, { home: home(), i: 0,
      work1: [S([-14.4, 0, 2.15], 'talk', [4.8, 5.4], 15, 'Unlocking the lodge and handing out templates', { face: 'out' }), S([-17.6, LODGE.loft + 0.05, 2.0], 'kneel', [5.4, 8.0], 40, 'Re-scribing a lancet arc on the tracing floor', { face: 'in' })],
      work2: [S(SCAF.tall[4] ? lift(4, 42.0) : [42, 0, 3], 'point', [8.6, 9.6], 25, 'Checking a setter\'s joint on the bay 7 scaffold', { face: 'in' }), S([-19.2, 0, 2.15], 'workBench', [9.6, 11.0], 40, 'Inspecting blocks on the bankers, chalking the rejects', { face: 'in' })],
      work3: [S([-7.5, 0, 0.65], 'talk', [12.5, 13.0], 15, 'Arguing with the clerk about a cartload', { face: 'in' }), S([18.4, 0, 6.2], 'point', [13.0, 14.0], 25, 'Walking the nave works with the canon', { face: 'out' }), S([-16.0, 0, 2.15], 'workBench', [14.0, 15.0], 40, 'Checking blocks against their templates', { face: 'in' })],
      work4: [S([-16.0, 0, 2.15], 'workBench', [15.4, 18.0], 40, 'Checking blocks against their templates', { face: 'in' }), S([-14.4, 0, 2.15], 'talk', [18.0, 18.8], 20, 'Counting the tools back into the lodge', { face: 'out' })],
    }));
  // 2 Walter le Mason, banker mason.
  P('Walter le Mason', 'banker mason', 'His banker mark is a little arrow, because he says the cathedral began with one.',
    C.mason({ beard: '#4a3020' }), day(W, { home: home(), i: 1,
      work1: [S(bank(0).at, 'chisel', [4.8, 8.0], 50, 'Roughing out a rib voussoir', { face: 'out' })],
      work2: [S([-24.6, 0, 1.6], 'stand', [8.6, 9.0], 10, 'Collecting his re-sharpened chisels', { face: 'in' }), S(bank(0).at, 'chisel', [9.0, 11.0], 50, 'Finishing the moulding to the template', { face: 'out' })],
      work3: [S(bank(0).at, 'chisel', [12.5, 15.0], 50, 'Cutting his arrow mark on the finished stone', { face: 'out' })],
      evening: [S([-13.4, 0, 5.78], 'sitTalk', [18.8, 19.8], 30, 'A game on the board scratched into the lodge bench', { seat: 0.45, face: 'out' })],
    }));
  // 3 Hugh of Chilmark.
  P('Hugh of Chilmark', 'banker mason', 'Sings under his breath in time with his mallet.', C.mason(), day(W, Object.assign({ home: home(), i: 2 }, at4(bank(1).at, 'chisel', 'Dressing plain ashlar', { face: 'out' }), {
    dinner: S([-12.9, 0, 5.78], 'sitEat', [11.0, 12.5], 40, 'Eating on the lodge bench with his eyes closed', { seat: 0.45, face: 'out' }),
    evening: [S([-12.7, 0, 5.78], 'sitTalk', [18.8, 19.8], 30, 'Losing a game on the scratched board, and singing anyway', { seat: 0.45, face: 'out' })] })));
  // 4 Geoffrey Wrenne, apprentice.
  P('Geoffrey Wrenne', 'apprentice mason, 15', 'Has secretly carved a tiny wren on the hidden face of a block.',
    C.mason({ hat: null, hair: '#b07a3c', beard: null, build: 0.9 }), day(W, { home: home(), i: 3,
      work1: [S([-14.6, 0, 2.15], 'sweep', [4.8, 5.4], 15, 'Sweeping the stone dust'), S([-21.0, 0, 4.75], 'pour', [5.4, 6.0], 15, 'Fetching water for the lodge barrel', { face: 'in', prop: 'bucket' }), S([-16.4, LODGE.loft + 0.05, 2.9], 'stand', [6.0, 8.0], 30, 'Watching the warden scribe arcs on the tracing floor', { face: 'in' })],
      work2: [S([-12.75, 0, 1.45], 'chisel', [8.6, 11.0], 45, 'Practising on a scrap block (with a wren hidden on its bed)', { face: 'in' })],
      work3: [S([-24.9, 0, 1.6], 'carry', [12.5, 13.2], 10, 'Carrying chisels to the smithy', { face: 'in', prop: 'box' }), S([-12.75, 0, 1.45], 'chisel', [13.2, 15.0], 45, 'Practising on a scrap block', { face: 'in' })],
      evening: [S([-42.6, 0, 1.5], 'talk', [18.8, 19.6], 20, 'Lingering at the stall to talk to Cecily', { face: 'in' })],
    }));
  // 5 Adam Bonde, setter.
  P('Adam Bonde', 'setter', 'Will not walk under a ladder, even his own.', C.worker({ hat: 'hood', hatColor: '#7a4a32' }), day(W, { home: home(), i: 4, exit: exitN, start: 4.0, end: 17.6,
    work1: [S(lift(4, 41.2), 'workBench', [4.8, 8.0], 45, 'Bedding clerestory blocks as they come up', { face: 'in' })],
    breakfast: S(lift(4, 41.8), 'drink', [8.0, 8.6], 15, 'Breakfast on the scaffold', { face: 'out', prop: 'mug' }),
    work2: [S(lift(4, 42.4), 'point', [8.6, 9.2], 15, 'Checking his work with a plumb line', { face: 'in' }), S(lift(4, 41.2), 'workBench', [9.2, 11.0], 45, 'Setting a lancet jamb', { face: 'in' })],
    dinner: S(lift(4, 40.7), 'sitEat', [11.0, 12.5], 40, 'Dinner on the scaffold', { seat: 0.05, face: 'out' }),
    work3: [S(lift(4, 41.2), 'workBench', [12.5, 15.0], 45, 'Setting clerestory lancet jambs', { face: 'in' })], ale: false }));
  // 6 Roger Faukes, setter.
  P('Roger Faukes', 'setter', 'Missing two fingertips from a careless moment years ago.', C.worker({ beard: '#5a4030' }), day(W, { home: home(), i: 5,
    work1: [S([11.1, 0, 5.15], 'workBench', [4.8, 8.0], 40, 'Laying pier drums in mortar in bay 2', { face: 'in' })],
    work2: [S([16.7, 0, 5.15], 'workBench', [8.6, 11.0], 40, 'Levelling the next course of the pier', { face: 'in' })],
    work3: [S([30.3, 0, 9.05], 'crank', [12.5, 15.0], 40, 'Hauling on the ground windlass in bay 5', { face: 'out' })],
    work4: [S([16.7, 0, 5.15], 'workBench', [15.4, 18.8], 40, 'Back to the piers of bay 3', { face: 'in' })] }));
  // 7 Osbert the Carver.
  P('Osbert the Carver', 'carver', 'Gives his stone heads the faces of men he dislikes.', C.mason({ beard: '#9a9a9a', hair: '#9a9a9a' }), day(W, { home: home(), i: 6,
    work1: [S(bank(2).at, 'chisel', [4.8, 8.0], 50, 'Carving a bell capital', { face: 'out' })],
    work2: [S(bank(2).at, 'chisel', [8.6, 10.2], 50, 'Carving a bell capital', { face: 'out' }), S([79.4, 0, 9.4], 'lookout', [10.2, 11.0], 20, 'Comparing his work with the finished capitals in the quire aisle', { face: 'in' })],
    work3: [S(bank(2).at, 'chisel', [12.5, 15.0], 50, 'Carving a stag on a corbel, for the old story of the arrow from Old Sarum and the deer', { face: 'out' })] }));
  // 8 Simon of Corfe, marbler.
  P('Simon of Corfe', 'marbler', 'Came up from Dorset with the marble and misses the sea.', C.worker({ hat: 'straw', hatColor: STRAW }), day(W, { home: home(), i: 7,
    work1: [S(LODGE.marble, 'workBench', [4.8, 8.0], 50, 'Truing a Purbeck shaft', { face: 'out' })],
    work2: [S(LODGE.marble, 'workBench', [8.6, 11.0], 50, 'Truing a Purbeck shaft', { face: 'out' })],
    work3: [S([133.0, 0, 2.6], 'lookout', [12.5, 13.4], 25, 'Admiring the slim shafts his father cut in the Trinity Chapel', { face: 'in' }), S(LODGE.marble, 'workBench', [13.4, 15.0], 50, 'Truing a Purbeck shaft', { face: 'out' })] }));
  // 9 Jordan Polisher.
  P('Jordan Polisher', 'marble polisher', 'His hands are permanently grey-green from marble slurry.', C.worker({ top: '#6e7468' }), day(W, { home: home(), i: 8,
    work1: [S([-12.4, 0, 2.2], 'scrub', [4.8, 8.0], 50, 'Rubbing a shaft with sand and water', { face: 'in' })],
    work2: [S([-12.4, 0, 2.2], 'scrub', [8.6, 11.0], 50, 'Polishing with a finer stone', { face: 'in' })],
    work3: [S([27.9, 0, 5.0], 'scrub', [12.5, 15.0], 50, 'Polishing a shaft in place in bay 5', { face: 'in' })] }));
  // 10 Martin the Fleming, itinerant mason.
  P('Martin the Fleming', 'itinerant mason', 'Has been given a few days\' work to pay for his journey on.', C.mason({ top: '#5a6a7e', hat: 'beret', hatColor: '#3a3a4a', beard: '#c9a160' }), [
    S(W.data.exitW, 'walk', [4.0, 4.4], 1, 'Arriving on the road with his tools'),
    S([-15.8, 0, 2.15], 'talk', [4.4, 5.0], 15, 'Asking the warden for work', { face: 'in' }),
    S(bank(3).at, 'chisel', [5.0, 8.0], 50, 'Given three days\' work dressing ashlar', { face: 'out' }),
    S([-7.5, 0, 0.65], 'talk', [8.0, 8.6], 15, 'At the clerk\'s booth having his name taken', { face: 'in' }),
    S(bank(3).at, 'chisel', [8.6, 11.0], 50, 'Dressing ashlar', { face: 'out' }),
    S([-12.35, 0, 5.78], 'sitEat', [11.0, 12.5], 40, 'Dinner on the lodge bench', { seat: 0.45, face: 'out' }),
    S(bank(3).at, 'chisel', [12.5, 18.8], 50, 'Dressing ashlar', { face: 'out' }),
    S([-43.6, 0, 1.5], 'drink', [18.8, 20.2], 30, 'Supper and ale at the stall', { face: 'in', prop: 'mug' }),
    S([-20.4, LODGE.loft + 0.05, 5.7], 'lie', [20.2, 4.0], 200, 'Sleeping on straw in the lodge loft', { face: 0 }),
  ]);
  // 11 Ralph of Teffont, quarryman with the carts.
  P('Ralph of Teffont', 'quarryman with the carts', 'Counts the jolts of the cart wheels to pass the time.', C.labourer({ hat: 'hood', hatColor: '#6a5a48' }), [
    S(W.data.exitW, 'walk', [4.0, 7.0], 30, 'Walking beside the cart from Chilmark'),
    S([-40.5, 0, 6.6], 'haul', [7.0, 10.5], 40, 'Unloading blocks with levers', { face: 'in' }),
    S([-43.6, 0, 1.5], 'sitEat', [10.5, 11.8], 30, 'Eating at the stall', { face: 'in', seat: 0.0, act: 'drink', prop: 'mug' }),
    S([-38.0, 0, 6.6], 'haul', [11.8, 14.5], 40, 'Stacking blocks on the skids', { face: 'out' }),
    S(W.data.exitW, 'walk', [14.5, 15.5], 1, 'Walking back to the quarry'),
    S(home(), 'lie', [15.5, 4.0], 300, 'Back at Teffont'),
  ]);
  // 12 Wat Cokk, ox-carter; 13 Tom Cokk, goad boy.
  P('Wat Cokk', 'ox-carter', 'Talks to his oxen more than to his wife.', C.labourer({ hat: 'hood', hatColor: '#5a6a58', beard: '#4a3020' }), [
    S([-44.9, 0, 5.3], 'stand', [4.0, 5.0], 20, 'Yoking the oxen', { face: 'out' }),
    S([-40.5, 0, 6.7], 'haul', [5.0, 8.0], 40, 'Unloading the cart', { face: 'in' }),
    S([-44.9, 0, 5.3], 'pour', [8.0, 9.0], 30, 'Watering the oxen at the trough', { face: 'out', prop: 'bucket' }),
    S([-41.6, 0, 6.7], 'talk', [9.0, 12.0], 40, 'Talking to Broad and Bright', { face: 'in' }),
    S([-43.0, 0, 1.5], 'drink', [12.0, 12.6], 20, 'A cup of ale', { face: 'in', prop: 'mug' }),
    S([-40.5, 0, 6.7], 'haul', [12.6, 17.5], 40, 'Unloading another cartload', { face: 'in' }),
    S(W.data.exitW, 'walk', [17.5, 18.5], 1, 'Driving out empty'),
    S(home(), 'lie', [18.5, 4.0], 300, 'At home'),
  ]);
  P('Tom Cokk', 'goad boy, 10', 'Has named the oxen Broad and Bright.', C.child({ top: '#8a4a2e' }), [
    S([-45.6, 0, 5.4], 'stand', [4.0, 8.0], 30, 'Holding the oxen while the cart is unloaded', { face: 'out' }),
    S([-42.2, 0, 1.5], 'stand', [8.0, 8.4], 10, 'Begging a crust at the stall', { face: 'in' }),
    S([-36.0, 0, 7.4], 'run', [8.4, 8.8], 8, 'Chasing the dog'),
    S([-45.6, 0, 5.4], 'stand', [8.8, 17.5], 40, 'At the lead ox\'s head', { face: 'out' }),
    S(W.data.exitW, 'walk', [17.5, 18.5], 1, 'Walking home beside the cart'),
    S(home(), 'lie', [18.5, 4.0], 300, 'Asleep'),
  ]);
  // 14 Reginald Hod, hod carrier.
  P('Reginald Hod', 'hod carrier', 'Counts his climbs on a knotted string; sixty is a good day.', C.labourer(), day(W, { home: home(), i: 9,
    work1: [S([-2.8, 0, 3.5], 'carryShoulder', [4.8, 8.0], 6, 'Loading his hod with mortar', { face: 'out', prop: 'sack' }), S(lift(2, 41.0), 'carryShoulder', [4.8, 8.0], 6, 'Up the ladders to bay 7', { face: 'in', prop: 'sack' })],
    work2: [S([-2.8, 0, 3.5], 'carryShoulder', [8.6, 11.0], 6, 'Another hod of mortar', { face: 'out', prop: 'sack' }), S(lift(3, 44.0), 'carryShoulder', [8.6, 11.0], 6, 'Climbing the scaffold again', { face: 'in', prop: 'sack' })],
    work3: [S([-2.8, 0, 3.5], 'carryShoulder', [12.5, 15.0], 6, 'Loading up', { face: 'out', prop: 'sack' }), S(lift(4, 43.0), 'carryShoulder', [12.5, 15.0], 6, 'Up to the clerestory masons', { face: 'in', prop: 'sack' })] }));
  // 15 Alan le Ditchere, digger.
  P('Alan le Ditchere', 'digger', 'Always wet to the knees, always cheerful.', C.labourer({ bottom: '#c8a888', hat: 'straw', hatColor: STRAW }), day(W, { home: home(), i: 10,
    work1: [S([0.9, -1.2, 3.4], 'shovel', [4.8, 8.0], 40, 'Digging out wet gravel in the west front trench', { face: 'out' })],
    work2: [S([0.9, -0.75, 7.0], 'ram', [8.6, 11.0], 40, 'Ramming rubble into the footing', { face: 'out' })],
    work3: [S([0.9, -1.2, 3.4], 'pour', [12.5, 15.0], 40, 'Bailing water with a bucket', { face: 'out', prop: 'bucket' })] }));
  // 16 Agnes la Barwe, labourer (with her children); she lives in the third cottage.
  P('Agnes la Barwe', 'labourer', 'Proud to be trusted with the new wheelbarrow.', C.woman({ apron: '#d8cfb8', dressColor: '#7a4a32' }), day(W, { i: 11, cottage: 2, side: 0, exit: W.data.exitW,
    work1: [S([-2.4, 0, 3.6], 'push', [4.8, 6.4], 10, 'Wheeling sand from the heap to the mortar pit', { face: 'out' }), S([-5.4, 0, 4.15], 'push', [4.8, 6.4], 10, 'Tipping the barrow by the mortar trough', { face: 'in' }), S([-36.5, 0, 6.5], 'carry', [6.4, 8.0], 20, 'Carrying baskets of stone chips', { face: 'out', prop: 'basket' })],
    work2: [S([-2.4, 0, 3.6], 'push', [8.6, 11.0], 10, 'Wheeling sand', { face: 'out' }), S([-5.4, 0, 4.15], 'push', [8.6, 11.0], 10, 'Tipping the barrow', { face: 'in' })],
    dinner: S([-12.35, 0, 5.78], 'sitEat', [11.0, 12.5], 40, 'Dinner with her children at the lodge', { seat: 0.45, face: 'out' }),
    work3: [S([-36.5, 0, 6.5], 'carry', [12.5, 15.0], 20, 'Carrying baskets of stone chips', { face: 'out', prop: 'basket' }), S([12.0, 0, 9.4], 'carry', [12.5, 15.0], 20, 'Tipping chips into the wall core', { face: 'in', prop: 'basket' })] }));
  // 17 Petronilla of Fisherton, water carrier.
  P('Petronilla of Fisherton', 'water carrier', 'Knows every bit of gossip in the Close.', C.woman({ dressColor: '#5a6a7e', hat: 'veil' }), day(W, { home: home(), i: 12,
    work1: [S([-21.0, 0, 4.75], 'pour', [4.8, 8.0], 15, 'Filling the lodge barrel', { face: 'in', prop: 'bucket' }), S([-4.2, 0, 2.95], 'pour', [4.8, 8.0], 15, 'Watering the slaking pit', { face: 'out', prop: 'bucket' })],
    work2: [S([-44.4, 0, 5.2], 'pour', [8.6, 11.0], 15, 'Filling the oxen trough', { face: 'out', prop: 'bucket' }), S([52.6, 0, 2.6], 'carry', [8.6, 11.0], 15, 'Bringing water to the plumbers\' fire bucket', { face: 'in', prop: 'bucket' })],
    work3: [S([-6.8, 0, 3.1], 'talk', [12.5, 13.4], 20, 'Passing on the latest news from the Close', { face: 'out' }), S([-21.0, 0, 4.75], 'pour', [13.4, 15.0], 15, 'Filling the lodge barrel', { face: 'in', prop: 'bucket' })] }));
  // 18 Ivo the Limeburner, mortar maker.
  P('Ivo the Limeburner', 'mortar maker', 'Eyes red-rimmed from lime dust; keeps a rag over his mouth.', C.labourer({ top: '#c8c0b0', hat: 'kerchief', hatColor: '#d8d0c0' }), day(W, Object.assign({ home: home(), i: 13 }, {
    work1: [S([-2.8, 0, 2.95], 'stir', [4.8, 8.0], 40, 'Slaking quicklime in the pit', { face: 'out', prop: 'shovel' })],
    work2: [S([-5.6, 0, 4.15], 'stir', [8.6, 11.0], 40, 'Mixing mortar to order', { face: 'in', prop: 'shovel' })],
    work3: [S([-5.6, 0, 4.15], 'stir', [12.5, 15.0], 40, 'Mixing mortar to order', { face: 'in', prop: 'shovel' })] })));
  // 19, 20 Baldwin Strong and Peter Blund, wheel men; 21 Stephen the Hoistman.
  const tread = [];
  const wheelDay = (spot, label, after) => {
    const st = S(spot, 'tread', [7.0, 11.0], 60, label, { face: 1 });
    const st2 = S(spot, 'tread', [12.5, after || 17.0], 60, label, { face: 1 });
    tread.push(st, st2);
    return [st, st2];
  };
  const bw = wheelDay(W.data.wheelIn[0], 'Walking the great wheel on command');
  P('Baldwin Strong', 'wheel man', 'Afraid of heights, but more afraid of being thought so.', C.labourer({ hat: null, hair: '#8d5a2b', bottom: '#8a7a64' }), [
    S(exitN, 'walk', [4.0, 4.4], 1, 'Arriving'), S([52.4, RY, 2.6], 'climb', [4.4, 7.0], 5, 'Climbing the long ladders to the roof', { face: 'in' }), bw[0],
    S([53.0, RY, 1.4], 'sitEat', [11.0, 12.5], 30, 'Resting on the tie beams', { seat: 0.3, face: 'out' }), bw[1],
    S(exitN, 'walk', [17.0, 18.5], 1, 'Down the ladders and home'), S(home(), 'lie', [18.5, 4.0], 300, 'At home'),
  ]);
  const pw = wheelDay(W.data.wheelIn[1], 'Walking the wheel, whistling to keep in step', 11.0);
  P('Peter Blund', 'wheel man', 'Whistles to keep in step with Baldwin.', C.labourer({ hat: 'straw', hatColor: STRAW }), [
    S(exitN, 'walk', [4.0, 4.4], 1, 'Arriving'), S([53.8, RY, 2.8], 'stand', [4.4, 7.0], 5, 'Up on the roof', { face: 'out' }), pw[0],
    S([53.6, RY, 1.4], 'sitEat', [11.0, 12.5], 30, 'Dinner on the tie beams', { seat: 0.3, face: 'out' }),
    S([30.3, 0, 7.55], 'crank', [12.5, 17.5], 40, 'On the ground windlass in bay 5', { face: 'in' }),
    S(exitN, 'walk', [17.5, 18.5], 1, 'Home'), S(home(), 'lie', [18.5, 4.0], 300, 'At home'),
  ]);
  W.data.treadSteps = tread;
  P('Stephen the Hoistman', 'crane master', 'Loud voice on the roof, a quiet man at home.', C.worker({ top: '#5a6a7e', hat: 'hood', hatColor: '#7a4a32', beard: '#2b1d14' }), [
    S(exitN, 'walk', [4.0, 4.4], 1, 'Arriving'),
    S([59.2, RY, 3.5], 'point', [7.0, 11.0], 40, 'Calling orders to the wheel men and steering the load with a tag line', { face: 1 }),
    S([58.2, RY, 3.6], 'sitEat', [11.0, 12.5], 30, 'Dinner on the boards', { seat: 0.3, face: 'out' }),
    S([59.2, RY, 3.5], 'point', [12.5, 17.0], 40, 'Signalling to the setters', { face: 1 }),
    S(exitN, 'walk', [17.0, 18.5], 1, 'Home'), S(home(), 'lie', [18.5, 4.0], 300, 'At home'),
  ]);
  // 22 Richard le Carpenter, master carpenter.
  P('Richard le Carpenter', 'master carpenter', 'Chooses each oak by tapping it and listening.', C.worker({ top: '#7a5a3a', hat: 'coif', hatColor: LINEN, beard: '#9a9a9a' }), day(W, { home: home(), i: 14,
    work1: [S([32.2, 0, 3.05], 'kneel', [4.8, 8.0], 40, 'Laying out a centring frame on the ground', { face: 'in' })],
    work2: [S([52.0, RY, 1.5], 'point', [8.6, 11.0], 40, 'Supervising the raising of rafter pairs', { face: 'in' })],
    work3: [S([-15.0, 0, 2.15], 'talk', [12.5, 13.2], 20, 'Talking with the master mason in the lodge', { face: 'in' }), S([33.6, 0, 3.05], 'hammer', [13.2, 15.0], 40, 'Pegging the centring frame', { face: 'in' })] }));
  // 23, 24 The sawyers.
  P('Laurence Sawyer', 'top sawyer', 'Prides himself on never wandering off the chalk line.', C.worker({ hat: 'straw', hatColor: STRAW }), day(W, Object.assign({ home: home(), i: 15 }, at4([28.6, 0.7, 1.0], 'sawTop', 'Guiding the pit saw along a chalk line', { face: -1 }))));
  P('Hob Underwood', 'bottom sawyer', 'Sneezes constantly and blames the oak.', C.labourer({ top: '#c8b088', hat: 'hood', hatColor: '#8a7a5a' }), day(W, Object.assign({ home: home(), i: 16 }, at4([27.6, -1.75, 1.0], 'sawPit', 'Pulling the saw down in the pit, eyes shut against the sawdust', { face: 1 }))));
  // 25 Henry Wymark, roof carpenter (lives in the first cottage with Juliana).
  P('Henry Wymark', 'roof carpenter', 'Carves a tiny cross into every joint he finishes.', C.worker({ top: '#6a5a48', hat: 'coif', hatColor: LINEN, beard: '#6b4428' }), day(W, { i: 17, cottage: 0, side: 0, exit: exitN, start: 4.0, end: 17.4,
    work1: [S([52.2, RY, 1.2], 'hammer', [4.8, 8.0], 45, 'Pegging collars and scissor braces into rafter pairs', { face: 'in' })],
    breakfast: S([52.8, RY, 2.6], 'drink', [8.0, 8.6], 15, 'Breakfast on the tie beams', { face: 'out', prop: 'mug' }),
    work2: [S([54.2, RY, 1.4], 'haul', [8.6, 9.4], 20, 'Helping hoist a rafter', { face: 'in' }), S([52.2, RY, 1.2], 'hammer', [9.4, 11.0], 45, 'Pegging joints', { face: 'in' })],
    dinner: S([51.6, RY, 2.8], 'sitEat', [11.0, 12.5], 40, 'Dinner his wife brought up', { seat: 0.3, face: 'out' }),
    work3: [S([52.2, RY, 1.2], 'hammer', [12.5, 15.0], 45, 'Pegging joints, a cross cut into each', { face: 'in' })], ale: false }));
  // 26 John of Clarendon, carpenter (centring).
  P('John of Clarendon', 'carpenter', 'Once worked at the king\'s palace at Clarendon and mentions it too often.', C.worker({ top: '#8a4a2e', hat: 'beret', hatColor: '#4a5466' }), day(W, { home: home(), i: 18,
    work1: [S([bayX(6) + 1.4, 0, 5.0], 'hammer', [4.8, 6.4], 30, 'Wedging centring under an arch', { face: 'in' }), S([bayX(4) + 0.9, 0, 5.0], 'hammer', [6.4, 8.0], 30, 'Striking centring: knocking out the folding wedges', { face: 'in' })],
    work2: [S([bayX(7) + 2.4, 7.9, 9.0], 'workBench', [8.6, 11.0], 45, 'Building rib centring for the aisle vault', { face: 'in' })],
    work3: [S([bayX(7) + 4.2, 7.9, 9.0], 'hammer', [12.5, 15.0], 45, 'Fixing lagging boards on the centring', { face: 'in' })] }));
  // 27 Warin Faber, smith; 28 Mabel Faber.
  P('Warin Faber', 'smith', 'Can draw a chisel from the fire at exactly the right cherry-red.', C.smith({ beard: '#2b1d14' }), day(W, { home: home(), i: 19, start: 3.9,
    work1: [S([-26.0, 0, 2.7], 'workBench', [4.2, 5.0], 20, 'Lighting the hearth', { face: 'in' }), S([-24.6, 0, 2.85], 'hammer', [5.0, 8.0], 40, 'Re-steeling chisel edges', { face: 'out' })],
    breakfast: S([-26.0, 0, 2.7], 'drink', [8.0, 8.6], 15, 'Bread and ale by the hearth', { face: 'out', prop: 'mug' }),
    work2: [S([-24.6, 0, 2.85], 'hammer', [8.6, 11.0], 40, 'Sharpening chisels and punches', { face: 'out' })],
    dinner: S([-26.0, 0, 2.7], 'drink', [11.0, 12.5], 40, 'Dinner Mabel brought', { face: 'out', prop: 'mug' }),
    work3: [S([-24.6, 0, 2.85], 'hammer', [12.5, 15.0], 40, 'Making iron cramps for the roof', { face: 'out' }), S([-26.0, 0, 2.7], 'workBench', [12.5, 15.0], 20, 'Drawing iron from the fire', { face: 'in' })], ale: false }));
  P('Mabel Faber', 'smith\'s wife', 'Keeps the smithy accounts in her head and is never wrong.', C.woman({ dressColor: '#6a5a48', apron: '#5a3a24' }), day(W, { home: home(), i: 20,
    work1: [S([-27.55, 0, 3.0], 'bellows', [4.8, 8.0], 40, 'Working the bellows', { face: 'in' })],
    breakfast: S([-27.55, 0, 3.0], 'bellows', [8.0, 8.6], 20, 'Working the bellows', { face: 'in' }),
    work2: [S([-27.55, 0, 3.0], 'bellows', [8.6, 10.6], 40, 'Working the bellows', { face: 'in' }), S([-25.4, 0, 1.6], 'carry', [10.6, 11.0], 10, 'Bringing dinner', { face: 'in', prop: 'basket' })],
    dinner: S([-25.2, 0, 2.2], 'talk', [11.0, 12.5], 30, 'Talking accounts with Warin', { face: 'in' }),
    work3: [S([-38.8, 0, 7.2], 'talk', [12.5, 13.4], 20, 'Selling horseshoe nails to the carters', { face: 'in' }), S([-27.55, 0, 3.0], 'bellows', [13.4, 15.0], 40, 'Working the bellows', { face: 'in' })] }));
  // 29 Gervase le Plumer (lives in the second cottage); 30 Odo le Plumer.
  P('Gervase le Plumer', 'plumber', 'Burn scars on both wrists; says lead "talks" when it is ready.', C.smith({ top: '#7a6a58', apron: '#6a4a30', hat: 'hood', hatColor: '#5a5048' }), day(W, { i: 21, cottage: 1, side: 0, exit: exitN,
    work1: [S(CAST.pot.map((v, i) => (i === 2 ? 2.4 : v)), 'stir', [4.8, 8.0], 40, 'Melting lead in the pot', { face: 'in', prop: 'spoon' })],
    work2: [S([48.0, 0, 2.15], 'pour', [8.6, 11.0], 25, 'Pouring a sheet on the sand bed', { face: 'in', prop: 'jug' }), S([51.0, 0, 2.15], 'workBench', [8.6, 11.0], 25, 'Trimming the edges of a sheet', { face: 'in' })],
    work3: [S(CAST.pot.map((v, i) => (i === 2 ? 2.4 : v)), 'stir', [12.5, 15.0], 30, 'Melting lead', { face: 'in', prop: 'spoon' }), S([48.0, 0, 2.15], 'pour', [12.5, 15.0], 25, 'Pouring lead in the cooler afternoon', { face: 'in', prop: 'jug' })] }));
  P('Odo le Plumer', 'plumber on the roof', 'Likes the view of Old Sarum from the roof and points it out to everyone.', C.worker({ top: '#5a5a58', hat: 'hood', hatColor: '#4a4a48' }), [
    S(exitN, 'walk', [4.0, 4.4], 1, 'Arriving'),
    S([59.4, 36.3, 0.35], 'scrub', [6.5, 11.0], 45, 'Dressing lead sheets over the boards', { face: 'in' }),
    S([57.8, 36.3, 0.35], 'point', [11.0, 11.6], 15, 'Resting on the ridge, pointing out Old Sarum', { face: 'in' }),
    S([56.6, RY, 3.0], 'sitEat', [11.6, 12.5], 30, 'Dinner on the boards', { seat: 0.3, face: 'out' }),
    S([59.4, 36.3, 0.35], 'scrub', [12.5, 16.6], 45, 'Dressing lead with a wooden dresser', { face: 'in' }),
    S(exitN, 'walk', [16.6, 18.4], 1, 'Home'), S(home(), 'lie', [18.4, 4.0], 300, 'At home'),
  ]);
  // 31 Matthew le Glasiere; 32 Christina.
  P('Matthew le Glasiere', 'glazier', 'Keeps his best ruby glass wrapped in wool like jewels.', C.worker({ top: '#4a5a6a', hat: 'coif', hatColor: LINEN, beard: '#8d5a2b' }), day(W, { home: home(), i: 22,
    work1: [S(LODGE.glass, 'workBench', [4.8, 8.0], 45, 'Drawing a grisaille panel full size on the whitewashed table', { face: 'out' })],
    work2: [S(LODGE.glass, 'workBench', [8.6, 11.0], 45, 'Cutting pieces and grozing their edges', { face: 'out' })],
    work3: [S(LODGE.glass, 'workBench', [12.5, 14.0], 45, 'Painting the leaf lines', { face: 'out' }), S([-8.6, 0, 5.05], 'workBench', [14.0, 15.0], 30, 'Firing the painted pieces in the little kiln', { face: 'in' })] }));
  P('Christina le Glasiere', 'glazier\'s daughter', 'Wants to paint faces, not leaves.', C.girl({ hair: '#8d5a2b', dressColor: '#4a5a6a' }), day(W, { home: home(), i: 23,
    work1: [S([-10.3, 0, 3.75], 'workBench', [4.8, 8.0], 40, 'Grinding paint with a muller', { face: 'out' })],
    work2: [S([-10.3, 0, 3.75], 'workBench', [8.6, 11.0], 40, 'Sorting glass by colour', { face: 'out' })],
    work3: [S([-10.3, 0, 3.75], 'workBench', [12.5, 15.0], 40, 'Grinding paint', { face: 'out' })] }));
  // 33 Philip the Painter.
  P('Philip the Painter', 'painter', 'Stops work and kneels every time the bell rings for a service.', C.worker({ top: '#9a8a6a', hat: 'coif', hatColor: '#e8d8c0' }), day(W, { home: home(), i: 24,
    work1: [S([-9.8, 0, 5.0], 'workBench', [4.8, 8.0], 30, 'Grinding his pigments in the lodge', { face: 'in' })],
    work2: [S([82.6, 0.07, 1.4], 'stand', [8.6, 11.6], 40, 'Waiting for High Mass to end before he can climb', { face: 'in' })],
    dinner: S([82.6, PAINTER.y, 2.0], 'paintUp', [11.6, 12.5], 30, 'Painting red masonry lines on the vault', { face: 'out' }),
    work3: [S([82.6, PAINTER.y, 2.0], 'paintUp', [12.5, 15.0], 40, 'Painting a border on the quire vault', { face: 'out' })],
    ale: S([82.6, PAINTER.y, 2.0], 'kneel', [15.0, 15.5], 15, 'Kneeling on his scaffold as the bell rings for None', { face: 'in' }),
    work4: [S([82.6, PAINTER.y, 2.0], 'paintUp', [15.5, 17.6], 40, 'Painting, between services', { face: 'out' }), S([81.2, 0.07, 1.2], 'stand', [17.6, 18.8], 20, 'Cleaning his brushes', { face: 'out' })] }));
  // 34 Master Robert de la Mare, clerk of the works.
  P('Master Robert de la Mare', 'clerk of the works', 'Writes very small to save wax.', C.choir({ coat: null, dressColor: '#3a3a4a', top: '#3a3a4a', hairStyle: 'bald' }), day(W, { home: home(), i: 25,
    work1: [S([-6.5, 0, 2.06], 'sitWrite', [4.8, 8.0], 40, 'Notching tally sticks for each cartload', { seat: 0.46, face: 'out' })],
    breakfast: false,
    work2: [S([-6.5, 0, 2.06], 'sitWrite', [8.0, 9.6], 40, 'Recording stone and wages on the wax tablet', { seat: 0.46, face: 'out' }), S([24.0, 0, 6.4], 'point', [9.6, 10.6], 30, 'Walking the site, counting the men', { face: 'out' }), S([-6.5, 0, 2.06], 'sitWrite', [10.6, 11.0], 30, 'Back at his booth', { seat: 0.46, face: 'out' })],
    dinner: S([-6.5, 0, 2.06], 'sitEat', [11.0, 12.5], 30, 'Eating at his table', { seat: 0.46, face: 'out' }),
    work3: [S([-6.5, 0, 2.06], 'sitWrite', [12.5, 15.0], 40, 'Paying a departing itinerant', { seat: 0.46, face: 'out' })], ale: false }));

  // ---------------- clergy (35 to 42) and the choristers
  const seats = STALLS.seats, boys = STALLS.boys;
  const seat = (i) => ({ at: seats[i % seats.length], seat: 0.46, act: 'sitSing' });
  const boySeat = (i) => ({ at: boys[(i * 2) % boys.length], seat: 0.38, act: 'sitSing' });
  // 35 Canon William of Bemerton.
  P('Canon William of Bemerton', 'resident canon', 'Keeps a list of every gift to the fabric, down to a single penny.', C.choir({ hair: '#9a9a9a', hairStyle: 'bald' }), clergy(W, seat(3), { between: [null, null, [
    S(W.data.close, 'stand', [12.0, 12.6], 30, 'Dinner at his house in the Close'),
    S([18.4, 0, 6.9], 'talk', [12.6, 13.7], 40, 'Walking the nave works with the warden', { face: 'in' }),
    S(W.data.close, 'stand', [13.7, 14.0], 30, 'At his house'),
  ]] }));
  // 36 Canon Ranulf of Lavington, back from an alms tour.
  P('Canon Ranulf of Lavington', 'canon back from an alms tour', 'Has just come back from collecting alms in Ireland.', C.choir({ coat: 'long', coatColor: '#5a4a3a', dressColor: '#3a3430', top: '#3a3430', beard: '#6b4428' }), [
    S(W.data.exitW, 'walk', [6.0, 6.6], 1, 'Arriving dusty from the road'),
    S([-7.5, 0, 0.65], 'talk', [6.6, 8.4], 40, 'Handing a purse of alms to the clerk', { face: 'in' }),
    S(W.data.cdoor, 'walk', [8.4, 8.6], 1, 'To the quire'),
    S(seats[9].slice(), 'sitSing', [8.6, 11.6], 60, 'Terce, High Mass and Sext', { seat: 0.46, face: 'out' }),
    S(W.data.cdoor, 'walk', [11.6, 12.0], 1, 'Leaving the quire'),
    S(W.data.close, 'stand', [12.0, 14.4], 60, 'Resting at his house in the Close'),
    S(W.data.cdoor, 'walk', [14.4, 14.6], 1, 'Back for None'),
    S(seats[9].slice(), 'sleepSit', [14.6, 15.6], 40, 'Sleeping through None', { seat: 0.46, face: 'out' }),
    S(W.data.cdoor, 'walk', [15.6, 16.0], 1, 'Leaving'),
    S(W.data.close, 'stand', [16.0, 6.0], 300, 'At his house in the Close'),
  ]);
  // 37 Sir John Godhine, vicar choral: Lady Mass in the Trinity Chapel, teaches the boys.
  P('Sir John Godhine', 'vicar choral', 'Writes letters to his mother in Devizes.', C.choir({ hair: '#4a3020' }), clergy(W, seat(5), { between: [null, [
    S([138.3, 0, 0.7], 'bless', [6.9, 7.8], 40, 'Saying Lady Mass in the Trinity Chapel', { face: 1 }),
    S(W.data.close, 'stand', [7.8, 8.0], 20, 'At home'),
  ], [
    S([67.5, 0, 18.4], 'preach', [12.0, 13.4], 40, 'Teaching the choristers in the north transept', { face: 'out' }),
    S([58.6, 0, 3.4], 'run', [13.4, 13.7], 10, 'Hauling Hugh Spark back from the nave', { face: 1 }),
    S([67.5, 0, 18.4], 'preach', [13.7, 14.0], 40, 'Teaching the choristers', { face: 'out' }),
  ]] }));
  // 38 Sir Thomas Wyse, vicar choral and deacon at High Mass.
  P('Sir Thomas Wyse', 'vicar choral', 'Hums the chant while walking and cannot stop.', C.choir({ hair: '#c9a160' }), clergy(W, seat(7), { service: [null, null,
    S([ALTAR.x - 1.9, ALTAR.step, 1.2], 'pray', [8.6, 11.6], 60, 'Serving as deacon at High Mass', { face: 1 })] }));
  // 39 Hugh Spark and 40 Adam Swift, choristers.
  P('Hugh Spark', 'chorister, 10', 'Dreams of becoming a mason instead.', C.boy({ hair: '#7a2c14' }), clergy(W, boySeat(0), { between: [null, null, [
    S([67.5, 0, 16.0], 'stand', [12.0, 13.1], 30, 'At his lesson (yawning)', { face: 'in' }),
    S([58.4, 0, 3.6], 'point', [13.1, 13.6], 15, 'Slipped out to watch the great wheel', { face: 1 }),
    S([67.2, 0, 16.0], 'stand', [13.6, 14.0], 30, 'Back at his lesson', { face: 'in' }),
  ]] }));
  P('Adam Swift', 'chorister, 8', 'The smallest boy, with the clearest voice.', C.boy({ hair: '#c9a160', build: 0.85 }), clergy(W, boySeat(1), { between: [null, [
    S([136.0, 0, 2.6], 'kneel', [6.9, 7.5], 30, 'Carrying a candle at Lady Mass', { face: 1, prop: 'lantern' }),
    S([132.4, 0, 8.6], 'stand', [7.5, 7.8], 10, 'Hiding behind a shaft in the Trinity Chapel', { face: 'out' }),
    S(W.data.close, 'stand', [7.8, 8.0], 20, 'At the boys\' house'),
  ], [
    S([67.9, 0, 16.0], 'stand', [12.0, 14.0], 30, 'At his lesson', { face: 'in' }),
  ]] }));
  // 41 Brother Gilbert, Franciscan friar.
  P('Brother Gilbert', 'Franciscan friar', 'Barefoot on gravel, and never complains.', { skin: '#e6b48f', hair: '#6b4428', hairStyle: 'bald', top: '#6a5e4c', dress: 'long', dressColor: '#6a5e4c', hat: 'hood', hatColor: '#6a5e4c', shoes: '#b08a6a' }, [
    S(W.data.exitW, 'walk', [5.5, 6.0], 1, 'Walking in from the town'),
    S([-42.8, 0, 1.55], 'stand', [6.0, 8.6], 30, 'Begging bread at the stall', { face: 'in' }),
    S([13.0, 0, 4.4], 'preach', [8.6, 11.0], 40, 'Talking with the setters', { face: 'out' }),
    S([12.6, 0, 4.4], 'preach', [11.0, 12.5], 40, 'Preaching to the workmen at their dinner', { face: 'out' }),
    S([59.6, 0, 3.4], 'pray', [12.5, 14.0], 40, 'Praying at the west screen', { face: 1 }),
    S([-6.0, 0, 3.1], 'talk', [14.0, 16.0], 30, 'Gossiping with the water carrier', { face: 'out' }),
    S(W.data.exitW, 'walk', [16.0, 17.0], 1, 'Back to the friars\' house'),
    S(home(), 'pray', [17.0, 5.5], 300, 'At prayer with his brothers'),
  ]);
  // 42 Wulfric the Sexton.
  P('Wulfric the Sexton', 'sexton', 'Has a running feud with the masons about dust.', C.worker({ top: '#4a4038', hat: 'hood', hatColor: '#3a3430', beard: '#9a9a9a' }), [
    S(W.data.cdoor, 'walk', [1.0, 1.4], 1, 'Letting himself in'),
    S([80.0, 0.4, 3.85], 'workBench', [1.4, 2.0], 15, 'Lighting the candles on the stall desks', { face: 'in' }),
    S([75.2, 0.07, 6.0], 'stand', [2.0, 4.4], 60, 'Keeping watch during Matins', { face: 'out' }),
    S([110.4, 0.24, 3.4], 'sweep', [4.4, 5.6], 40, 'Sweeping the presbytery', { face: 'out' }),
    S([86.0, 0.4, 3.85], 'workBench', [5.6, 6.0], 15, 'Trimming candles for Prime', { face: 'in' }),
    S([104.0, 0, 1.6], 'wave', [8.6, 9.0], 10, 'Ringing a handbell for Terce', { face: 'out' }),
    S([97.5, 0, 9.4], 'stand', [9.0, 11.6], 40, 'Standing by during High Mass', { face: 'out' }),
    S([61.8, 0, 2.6], 'talk', [11.6, 12.4], 20, 'Complaining to the masons about the dust', { face: -1 }),
    S([123.0, 0, 6.2], 'sweep', [12.4, 14.6], 40, 'Sweeping the retrochoir', { face: 'out' }),
    S([104.0, 0, 1.6], 'wave', [14.6, 15.0], 10, 'Ringing for None', { face: 'out' }),
    S([88.0, 0.4, 3.85], 'workBench', [15.0, 17.6], 30, 'Mending candle stubs', { face: 'in' }),
    S([97.5, 0, 9.4], 'stand', [17.6, 19.8], 40, 'Standing by at Vespers', { face: 'out' }),
    S([79.8, 0, 15.4], 'workBench', [19.8, 20.4], 15, 'Snuffing the chapel candles', { face: 1 }),
    S(W.data.close, 'lie', [20.4, 1.0], 200, 'Asleep'),
  ]);
  // 43 Benedict Belyeter and 44 Robin.
  P('Benedict Belyeter', 'bell-founder', 'Travels from church to church and has cast bells in four counties.', C.smith({ top: '#6e5a48', beard: '#9a9a9a', hair: '#9a9a9a' }), day(W, Object.assign({ home: home(), i: 26 }, {
    work1: [S([-29.0, -2.5, 3.1], 'workBench', [4.8, 8.0], 40, 'Shaping the loam core with a strickle board', { face: 'out' })],
    work2: [S([-30.5, -2.5, 1.4], 'workBench', [8.6, 11.0], 40, 'Drying the mould with a low fire', { face: 'out' })],
    work3: [S([-30.3, 0, 4.5], 'point', [12.5, 13.2], 20, 'Checking the furnace', { face: 'in' }), S([-29.0, -2.5, 3.1], 'workBench', [13.2, 15.0], 40, 'Shaping the core', { face: 'out' })] })));
  P('Robin Belyeter', 'bell-founder\'s apprentice', 'Burnt his eyebrows off last week.', C.child({ child: false, build: 0.9, top: '#7a6248', apron: '#5a3a24', hat: null, hair: '#b07a3c' }), day(W, { home: home(), i: 27,
    work1: [S([-31.0, 0, 4.6], 'bellows', [4.8, 8.0], 40, 'Working the furnace bellows', { face: 'in' })],
    work2: [S([-27.0, 0, 3.6], 'carry', [8.6, 9.2], 10, 'Fetching charcoal from the smithy', { face: 'in', prop: 'sack' }), S([-31.0, 0, 4.6], 'bellows', [9.2, 11.0], 40, 'Working the bellows', { face: 'in' })],
    work3: [S([-31.0, 0, 4.6], 'bellows', [12.5, 15.0], 40, 'Working the bellows', { face: 'in' })] }));
  // 45 Aylmer, almsman; 46 Joan of Wilton.
  P('Aylmer', 'old almsman of St Nicholas\'s Hospital', 'Remembers Old Sarum "when the wind blew the candles out at Mass".', C.worker({ top: '#8a7a62', bottom: '#6a5a48', hat: 'hood', hatColor: '#6a5a48', beard: '#e8e4dc', hair: '#e8e4dc', build: 0.85 }), [
    S(W.data.cdoor, 'walk', [5.6, 6.0], 1, 'Shuffling in for Prime'),
    S([126.6, 0, 11.25], 'sitTalk', [6.0, 12.0], 60, 'Begging by the Trinity Chapel', { seat: 0.45, face: 'out' }),
    S([122.8, 0, 4.3], 'pray', [12.0, 13.0], 40, 'Praying at the bishops\' tombs', { face: 'in' }),
    S([126.6, 0, 11.25], 'sleepSit', [13.0, 17.0], 60, 'Dozing on the bench', { seat: 0.45, face: 'out' }),
    S(W.data.cdoor, 'walk', [17.0, 17.4], 1, 'Back to the hospital'),
    S(home(), 'lie', [17.4, 5.6], 300, 'At St Nicholas\'s Hospital'),
  ]);
  P('Joan of Wilton', 'visitor', 'Has walked from Wilton to give thanks for a child\'s recovery.', C.woman({ dressColor: '#3e5a7a', hat: 'veil', coat: 'long', coatColor: '#5a4a3a' }), [
    S(W.data.cdoor, 'walk', [7.0, 7.4], 1, 'Arriving from Wilton'),
    S([123.6, 0, 2.15], 'pray', [7.4, 9.0], 40, 'Praying before the bishops\' tombs', { face: 'in' }),
    S([124.4, 0, 2.15], 'workBench', [9.0, 9.4], 10, 'Lighting a candle', { face: 'in' }),
    S([97.5, 0, 12.0], 'stand', [9.4, 11.6], 40, 'Hearing High Mass from the transept', { face: 'out' }),
    S([62.4, 0, 2.6], 'stand', [11.6, 12.4], 20, 'Peering through the screen door at the nave works', { face: -1 }),
    S([57.6, 0, 3.6], 'lookout', [12.4, 13.0], 20, 'Staring up at the building site', { face: 1 }),
    S(W.data.exitN, 'walk', [13.0, 13.6], 1, 'Setting off home'),
    S(home(), 'lie', [13.6, 7.0], 300, 'Home in Wilton'),
  ]);
  // 47 Edith atte Brigge and 48 Cecily atte Brigge.
  P('Edith atte Brigge', 'food and ale seller', 'Lives by the new Harnham bridge and calls it "the bishop\'s bridge".', C.woman({ dressColor: '#7a4a32', apron: '#ece6d6' }), [
    S(W.data.exitW, 'walk', [3.6, 4.0], 1, 'Arriving with her pots'),
    S([-43.0, 0, 3.0], 'workBench', [4.0, 7.6], 30, 'Setting up the stall at dawn', { face: 'out' }),
    S([-41.4, 0, 2.9], 'stir', [7.6, 9.0], 40, 'Selling pottage and ale for breakfast', { face: 'out' }),
    S([-44.0, 0, 3.36], 'sitTalk', [9.0, 10.8], 40, 'Minding the stall', { seat: 0.46, face: 'out' }),
    S([-41.4, 0, 2.9], 'stir', [10.8, 12.6], 40, 'Serving dinner: pottage, bread and ale', { face: 'out' }),
    S([-43.6, 0, 3.0], 'scrub', [12.6, 15.0], 40, 'Washing pots', { face: 'out' }),
    S([-42.2, 0, 2.95], 'pour', [15.0, 15.6], 20, 'Pouring ale for the afternoon break', { face: 'out', prop: 'jug' }),
    S([-44.0, 0, 3.36], 'sitTalk', [15.6, 19.6], 40, 'Minding the stall', { seat: 0.46, face: 'out' }),
    S(W.data.exitW, 'walk', [19.6, 20.2], 1, 'Home to Harnham'),
    S(home(), 'lie', [20.2, 3.6], 300, 'At home by the bridge'),
  ]);
  P('Cecily atte Brigge', 'her daughter, 12', 'Flirts with the apprentice Geoffrey.', C.girl({ hair: '#c9a160', dressColor: '#8a7a5a' }), [
    S(W.data.exitW, 'walk', [3.6, 4.0], 1, 'Arriving with her mother'),
    S([-42.4, 0, 3.0], 'stand', [4.0, 8.0], 30, 'Helping at the stall', { face: 'out' }),
    S([-14.6, 0, 2.15], 'carry', [8.0, 8.6], 15, 'Carrying bread to the lodge', { face: 'out', prop: 'basket' }),
    S([-13.0, 0, 1.45], 'talk', [8.6, 9.2], 15, 'Lingering by the apprentice\'s block', { face: 'in' }),
    S([-42.4, 0, 3.0], 'stand', [9.2, 11.0], 30, 'Back at the stall', { face: 'out' }),
    S([10.6, 0, 3.2], 'carry', [11.0, 12.4], 15, 'Carrying bread to the men at dinner', { face: 'out', prop: 'basket' }),
    S([16.0, 0, 3.0], 'carry', [12.4, 15.4], 20, 'Collecting cups', { face: 'out', prop: 'mug' }),
    S([-42.4, 0, 3.0], 'stand', [15.4, 19.6], 30, 'At the stall', { face: 'out' }),
    S(W.data.exitW, 'walk', [19.6, 20.2], 1, 'Home with her mother'),
    S(home(), 'lie', [20.2, 3.6], 300, 'Asleep at home'),
  ]);
  // 49 Juliana Wymark, carpenter's wife (first cottage).
  const c0 = COTTAGES[0];
  P('Juliana Wymark', 'carpenter\'s wife', 'Has never climbed higher than her own loft and never will.', C.woman({ dressColor: '#6a7a5a' }), [
    S([c0.x0 + 2.6, 0.04, 2.2], 'stir', [4.0, 6.0], 30, 'Cooking at the hearth', { face: 'out', prop: 'spoon' }),
    S([c0.x0 + 1.25, 0.04, 1.15], 'sitWork', [6.0, 10.4], 40, 'Spinning wool', { seat: 0.43, face: 'out' }),
    S(W.data.exitE, 'walk', [10.4, 10.8], 1, 'Setting out with Henry\'s dinner'),
    S(W.data.exitN, 'walk', [10.8, 11.0], 1, 'Coming in by the north door'),
    S([55.8, 0, 3.4], 'wave', [11.0, 12.2], 30, 'Bringing dinner to the site and waving up to the roof', { face: 'in', prop: 'basket' }),
    S(W.data.exitN, 'walk', [12.2, 12.6], 1, 'Off home'),
    S(W.data.exitE, 'walk', [12.6, 12.8], 1, 'Back down the lane'),
    S([c0.x0 + 1.25, 0.04, 1.15], 'sitWork', [12.8, 19.4], 40, 'Spinning wool in the cottage', { seat: 0.43, face: 'out' }),
    S([c0.x0 + 1.8, 0.04, 1.15], 'sitEat', [19.4, 21.5], 30, 'Supper with Henry', { seat: 0.43, face: 'out' }),
    S(c0.bed.feet.map((v, i) => (i === 2 ? v + 0.18 : v)), 'lie', [21.5, 4.0], 240, 'Asleep', { face: c0.bed.heading }),
  ]);
  // 50 Godfrey the Watchman.
  P('Godfrey the Watchman', 'night watchman', 'Talks to the cat that shares his rounds.', C.worker({ top: '#4a4a3a', coat: 'long', coatColor: '#3a3428', hat: 'hood', hatColor: '#3a3428', beard: '#9a9a9a' }), [
    S(W.data.exitW, 'walk', [19.4, 19.8], 1, 'Arriving at dusk'),
    S([-9.0, 0, 5.4], 'sleepSit', [19.8, 21.0], 40, 'Dozing in the lodge corner', { seat: 0.18, face: 'out' }),
    S([-30.5, 0, 4.3], 'walk', [21.0, 4.2], 2, 'Walking his rounds with a lantern', { prop: 'lantern' }),
    S([47.0, 0, 2.4], 'stand', [21.0, 4.2], 10, 'Guarding the lead by the casting bed', { face: 'out', prop: 'lantern' }),
    S([-38.0, 0, 6.6], 'stand', [21.0, 4.2], 8, 'Checking the stone stack', { face: 'out', prop: 'lantern' }),
    S([-9.0, 0, 5.4], 'sleepSit', [21.0, 4.2], 30, 'Dozing between rounds', { seat: 0.18, face: 'out' }),
    S(W.data.exitW, 'walk', [4.2, 4.6], 1, 'Going home at dawn'),
    S(home(), 'lie', [4.6, 19.4], 300, 'Asleep at home by day'),
  ]);
  void BELL; void AZ0;
}

// ------------------------------------------------------------------ the crowds
export function buildExtras(W, k) {
  const r = k.rng('extras');
  const C = costumes(r);
  const homes = W.data.homes;
  let hi = 7;
  const home = () => homes[hi++ % (homes.length - 1)];
  const exitN = W.data.exitN;
  const E = (costume, routine) => placed(W, { costume, routine });
  const B = LODGE.bankers;
  const lift = (i, x) => [x, SCAF.tall[i].y, SCAF.tallZ + 0.3];
  const put = (i, x) => [x, SCAF.put[Math.min(i, SCAF.put.length - 1)].y, SCAF.putZ + 0.2];
  const RY = PLATE + 0.38;
  // Dinner places: the rough blocks in bays 1 to 3, the stone bench along the north aisle,
  // the lodge bench. Assigned in turn.
  const dine = [];
  for (const x of SEATS) dine.push([[x, 0, 4.02], 'out']);
  for (let x = 17.0; x < 60; x += 0.85) { if (x > bayX(5) + 1.5 && x < bayX(5) + BAYW - 1.5) continue; dine.push([[x, 0, AZ0 - 0.17], 'out']); }
  let di = 0;
  const dinner = () => { const d = dine[di++ % dine.length]; return S(d[0], 'sitEat', [11.0, 12.5], 40, 'Dinner and a rest', { seat: 0.45, face: d[1] }); };
  const bk = (i) => S([-45.0 + (i % 6) * 0.75, 0, 1.55], 'drink', [8.0, 8.6], 20, 'Breakfast: bread and ale at the stall', { face: 'in', prop: 'mug' });
  let n = 0;
  const worker = (cos, at, act, label, o = {}) => {
    const i = n++;
    const W4 = { work1: [S(at, act, [4.8, 8.0], 45, label, o)], work2: [S(at, act, [8.6, 11.0], 45, label, o)], work3: [S(at, act, [12.5, 15.0], 45, label, o)] };
    if (o.alt) { W4.work2.push(S(o.alt[0], o.alt[1], [8.6, 11.0], 30, o.alt[2], o.alt[3])); W4.work3.push(S(o.alt[0], o.alt[1], [12.5, 15.0], 30, o.alt[2], o.alt[3])); }
    const aloft = o.aloft;
    return E(cos, day(W, Object.assign({ home: home(), i, exit: aloft ? exitN : o.exit, start: aloft ? 4.0 : undefined, end: aloft ? 17.6 : undefined,
      breakfast: aloft ? S(at, 'drink', [8.0, 8.6], 15, 'Breakfast where he works', { face: 'out', prop: 'mug' }) : bk(i),
      dinner: aloft ? S(at, 'sitEat', [11.0, 12.5], 40, 'Dinner aloft', { seat: 0.05, face: 'out' }) : dinner(), ale: aloft ? false : undefined }, W4)));
  };
  // Banker masons in the lodge and dressers at the stone stack.
  for (const i of [4, 5, 6]) worker(C.mason(), i < 5 ? B[i] : [B[i][0], 0, 0.2], 'chisel', 'Dressing a block to its template', { face: i < 5 ? 'out' : 'in' });
  for (const x of [-38.4, -36.6, -34.8]) worker(C.mason(), [x, 0, 6.45], 'chisel', 'Squaring a rough block from the quarry', { face: 'out' });
  // Setters and their mates on the scaffolds; a mason laying vault webs on the centring.
  for (const x of [46.2, 47.8]) worker(C.worker(), lift(5, x), 'workBench', 'Setting the clerestory of bay 8', { face: 'in', aloft: true });
  worker(C.worker(), lift(4, 43.6), 'workBench', 'Bedding a block in mortar', { face: 'in', aloft: true });
  worker(C.labourer(), lift(2, 45.0), 'stand', 'Passing up mortar', { face: 'out', aloft: true });
  for (const [i, x] of [[0, 25.2], [1, 33.0], [2, 35.8]]) worker(C.worker(), put(i, x), 'workBench', 'Setting the aisle wall from the putlog scaffold', { face: 'in' });
  worker(C.mason(), [bayX(7) + 3.3, 7.9, 9.6], 'workBench', 'Laying thin web stones on the centring', { face: 'in' });
  worker(C.worker(), [6.1, 0, 7.0], 'workBench', 'Setting the lowest courses of the west front', { face: -1 });
  worker(C.worker(), [6.1, 0, 10.6], 'point', 'Checking the line with a plumb bob', { face: -1 });
  worker(C.worker(), [16.7, 0, 7.75], 'workBench', 'Laying a pier base in bay 3', { face: 'out' });
  worker(C.labourer(), [13.9, 0, 10.0], 'haul', 'Levering a reused block from Old Sarum into the wall core', { face: 'in' });
  // Hod carriers and labourers carrying stone, sand and timber between the yard and the nave.
  for (let i = 0; i < 4; i++) {
    const L = SCAF.tall[1 + (i % 3)];
    worker(C.labourer(), [-5.2 + i * 0.4, 0, 3.5], 'carryShoulder', 'Loading a hod with mortar', { face: 'out', prop: 'sack', alt: [[L.x0 + 1 + i, L.y, SCAF.tallZ + 0.3], 'carryShoulder', 'Carrying mortar up the scaffold', { face: 'in', prop: 'sack' }] });
  }
  for (let i = 0; i < 8; i++) {
    const a = [[-37.5 + i * 0.5, 0, 6.6], 'carry', 'Lifting a block from the stack', { face: 'out', prop: 'box' }];
    const b = [[18 + i * 4.2, 0, i % 2 ? 9.4 : 3.2], 'carry', 'Carrying stone into the nave', { face: 'out', prop: 'box' }];
    worker(C.labourer(), a[0], a[1], a[2], Object.assign({}, a[3], { alt: b }));
  }
  for (let i = 0; i < 2; i++) worker(C.labourer(), [-2.2 - i * 0.6, 0, 3.7], 'push', 'Wheeling sand', { face: 'out', alt: [[20.0 + i, 0, 6.2], 'push', 'Wheeling sand to the nave', { face: 'out' }] });
  // Diggers and rammers in the trenches.
  worker(C.labourer(), [7.0, -0.55, 12.6], 'pick', 'Digging out the trench for the north aisle wall', { face: 'out' });
  worker(C.labourer(), [9.6, -0.55, 13.4], 'shovel', 'Throwing gravel out of the trench', { face: 'out' });
  worker(C.labourer(), [0.9, -0.45, 11.0], 'ram', 'Ramming rubble into the west front footing', { face: 'out' });
  // Mortar makers.
  worker(C.labourer({ top: '#c8c0b0' }), [-4.0, 0, 2.95], 'stir', 'Hoeing the slaking lime', { face: 'out', prop: 'shovel' });
  worker(C.labourer({ top: '#c8c0b0' }), [-2.6, 0, 3.9], 'shovel', 'Screening sand', { face: 'in' });
  // Carpenters at the trestles, on the roof and on the aisle centring.
  worker(C.worker(), [23.2, 0, 3.45], 'saw', 'Sawing lagging boards', { face: 'out' });
  worker(C.worker(), [24.4, 0, 3.45], 'hammer', 'Cutting a mortise', { face: 'out' });
  worker(C.worker(), [53.6, RY, 2.2], 'workBench', 'Fitting a collar to a rafter pair', { face: 'in', aloft: true });
  worker(C.worker(), [55.2, RY, 1.2], 'hammer', 'Driving oak pegs', { face: 'in', aloft: true });
  worker(C.worker(), [bayX(8) + 2.0, 0, 9.4], 'hammer', 'Wedging the aisle vault centring of bay 8', { face: 'in' });
  // A smith's striker; a plumber's mate; labourers hooking loads on the hoist.
  worker(C.smith({ apron: '#6a4a30' }), [-24.6, 0, 1.55], 'hammer', 'Striking for the smith', { face: 'in' });
  worker(C.worker({ top: '#6a6a68' }), [50.5, 0, 2.15], 'workBench', 'Rolling up a cast sheet of lead', { face: 'in' });
  worker(C.labourer(), [59.4, 0, 2.2], 'haul', 'Hooking the tongs on the next block', { face: 1 });
  worker(C.labourer(), [58.9, 0, 0.6], 'point', 'Steadying the load as it leaves the ground', { face: 1 });
  worker(C.labourer(), [30.3, 0, 7.55], 'crank', 'Turning the windlass', { face: 'in' });
  worker(C.labourer(), [bayX(5) + 3.0, 0, 10.4], 'haul', 'Guiding the basket up the aisle wall', { face: 'in' });

  // A mason who has hidden something under a sack (vignette 6), more setters, more hands.
  worker(C.mason(), [-11.0, 0, 5.2], 'kneel', 'Checking the haunch of venison he has hidden under a sack', { face: 'in', alt: [[-14.6, 0, 2.15], 'sweep', 'Sweeping chips, looking innocent', { face: 'out' }] });
  for (const [i, x] of [[0, 28.6], [1, 31.2], [2, 34.2], [3, 37.4]]) worker(C.worker(), put(i, x), i % 2 ? 'hammer' : 'workBench', 'Setting stones on the aisle wall', { face: 'in' });
  for (const x of [40.6, 49.0]) worker(C.worker(), lift(3, x), 'workBench', 'Pointing joints on the triforium', { face: 'in', aloft: true });
  for (let i = 0; i < 5; i++) worker(C.labourer(), [-35.0 + i * 0.5, 0, 7.0], 'carryShoulder', 'Shouldering a sack of sand', { face: 'out', prop: 'sack', alt: [[22 + i * 6, 0, i % 2 ? 9.4 : 3.0], 'carryShoulder', 'Carrying sand to the setters', { face: 'out', prop: 'sack' }] });
  worker(C.worker(), [31.4, 0, 3.05], 'saw', 'Trimming a centring rib', { face: 'in' });
  worker(C.worker(), [34.0, 0, 5.9], 'hammer', 'Pegging the centring frame', { face: 'out' });
  // A labourer who slipped on a ladder, his leg being bound (vignette 5).
  E(C.labourer(), [S(exitN, 'walk', [4.0, 4.4], 1, 'Arriving'), S(lift(1, 44.0), 'carryShoulder', [4.4, 13.5], 20, 'Carrying mortar up the scaffold', { face: 'in', prop: 'sack' }), S([38.2, 0, 3.0], 'lie', [13.5, 17.0], 60, 'Hurt in a slip from the ladder, his leg being bound', { face: 0 }), S(exitN, 'walk', [17.0, 18.0], 1, 'Helped home'), S(home(), 'lie', [18.0, 4.0], 300, 'At home, nursing his leg')]);
  E(C.woman({ apron: '#e6dfcc' }), [S(W.data.exitW, 'walk', [13.0, 13.4], 1, 'Arriving'), S([37.6, 0, 3.6], 'kneel', [13.4, 17.0], 60, 'Binding the hurt man\'s leg', { face: 1 }), S(W.data.exitW, 'walk', [17.0, 17.6], 1, 'Leaving'), S(home(), 'lie', [17.6, 13.0], 300, 'At home')]);

  // Clergy: canons and vicars in the stalls, choristers on the forms.
  const seats = STALLS.seats, boys = STALLS.boys;
  const used = new Set([3, 5, 7, 9]);
  let si = 0;
  const nextSeat = () => { let g = 0; while (used.has(si % seats.length) && g++ < seats.length) si++; const s = seats[si % seats.length]; used.add(si++ % seats.length); return { at: s, seat: 0.46, act: 'sitSing' }; };
  // A canon celebrates High Mass; a vicar is subdeacon; another swings the thurible.
  E(C.choir({ hairStyle: 'bald', hair: '#9a9a9a', coatColor: '#8a2a24' }), clergy(W, nextSeat(), { service: [null, null, S([ALTAR.x - 1.05, ALTAR.step, 0.6], 'bless', [8.6, 11.6], 60, 'Celebrating High Mass', { face: 1 })] }));
  E(C.choir(), clergy(W, nextSeat(), { service: [null, null, S([ALTAR.x - 2.6, 0.44, 0.7], 'stand', [8.6, 11.6], 60, 'Subdeacon at High Mass', { face: 1 })] }));
  E(C.choir(), clergy(W, nextSeat(), { service: [null, null, S([ALTAR.x - 3.45, 0.44, 3.2], 'point', [8.6, 11.6], 60, 'Swinging the thurible', { face: 1 })] }));
  for (let i = 0; i < 2; i++) E(C.choir({ hairStyle: 'bald' }), clergy(W, nextSeat(), { between: [null, [S([135.2 + i * 1.2, 0, 2.4], 'pray', [6.9, 7.8], 40, 'At Lady Mass in the Trinity Chapel', { face: 1 }), S(W.data.close, 'stand', [7.8, 8.0], 20, 'At home')]] }));
  for (let i = 0; i < 11; i++) E(C.choir(), clergy(W, i < 9 ? nextSeat() : { at: [83.2 + (i - 9) * 0.7, 0.07, 1.25], act: 'sing', face: 'out' }));
  for (let i = 2; i < 10; i++) E(C.boy(), clergy(W, { at: boys[(i * 2) % boys.length], seat: 0.38, act: 'sitSing' }, { between: [null, null, [S([66.6 + (i % 4) * 0.6, 0, 15.2 + Math.floor(i / 4) * 0.7], 'stand', [12.0, 14.0], 30, 'At his lesson', { face: 'in' })]] }));
  // A family praying in the Trinity Chapel, a pilgrim at the retrochoir tombs.
  E(C.woman({ dressColor: '#6a5a48' }), [S(W.data.cdoor, 'walk', [8.0, 8.4], 1, 'Arriving'), S([134.0, 0, 3.8], 'pray', [8.4, 14.0], 60, 'At prayer in the Trinity Chapel', { face: 1 }), S(W.data.cdoor, 'walk', [14.0, 14.4], 1, 'Leaving'), S(home(), 'lie', [14.4, 8.0], 300, 'At home')]);
  E(C.worker({ top: '#7a6a52' }), [S(W.data.cdoor, 'walk', [8.0, 8.4], 1, 'Arriving'), S([134.8, 0, 3.8], 'pray', [8.4, 14.0], 60, 'At prayer in the Trinity Chapel', { face: 1 }), S(W.data.cdoor, 'walk', [14.0, 14.4], 1, 'Leaving'), S(home(), 'lie', [14.4, 8.0], 300, 'At home')]);
  E(C.child(), [S(W.data.cdoor, 'walk', [8.0, 8.4], 1, 'Arriving'), S([134.4, 0, 4.6], 'kneel', [8.4, 14.0], 60, 'Fidgeting at prayer', { face: 1 }), S(W.data.cdoor, 'walk', [14.0, 14.4], 1, 'Leaving'), S(home(), 'lie', [14.4, 8.0], 300, 'At home')]);
  E(C.worker({ coat: 'long', coatColor: '#5a4a3a' }), [S(W.data.cdoor, 'walk', [9.0, 9.4], 1, 'Arriving'), S([126.8, 0, 7.9], 'pray', [9.4, 16.0], 60, 'Praying at a bishop\'s tomb', { face: 'in' }), S(W.data.cdoor, 'walk', [16.0, 16.4], 1, 'Leaving'), S(home(), 'lie', [16.4, 9.0], 300, 'At home')]);

  // Women and children of the site: customers at the stall, a child running errands,
  // Agnes's children, wives at the cottages.
  for (let i = 0; i < 2; i++) E(C.woman(), [S(W.data.exitW, 'walk', [6.0, 6.4], 1, 'Arriving'), S([-44.4 + i * 1.6, 0, 1.55], 'talk', [6.4, 13.0], 40, 'Buying bread at the stall', { face: 'in' }), S([-36.5 + i, 0, 6.5], 'carry', [13.0, 16.0], 30, 'Carrying a basket of chips', { face: 'out', prop: 'basket' }), S(W.data.exitW, 'walk', [16.0, 16.6], 1, 'Leaving'), S(home(), 'lie', [16.6, 6.0], 300, 'At home')]);
  E(C.child(), [S(W.data.exitW, 'walk', [5.0, 5.4], 1, 'Arriving'), S([-24.0, 0, 1.4], 'run', [5.4, 18.0], 8, 'Running errands', { face: 'out' }), S([10.0, 0, 3.0], 'run', [5.4, 18.0], 8, 'Running a message to the nave', { face: 'out' }), S([-42.0, 0, 1.4], 'stand', [5.4, 18.0], 10, 'Waiting for a crust', { face: 'in' }), S(W.data.exitW, 'walk', [18.0, 18.6], 1, 'Home'), S(home(), 'lie', [18.6, 5.0], 300, 'Asleep')]);
  const c2 = COTTAGES[2], c1 = COTTAGES[1];
  for (let i = 0; i < 2; i++) {
    const feet = c2.pallet.feet.slice(); feet[2] += i * 0.35 - 0.18;
    E(C.child({ build: 0.8 }), [S(W.data.exitE, 'walk', [4.0, 4.4], 1, 'Off with their mother'), S(W.data.exitW, 'walk', [4.4, 4.8], 1, 'Arriving'), S([-36.5 + i * 0.6, 0, 6.6], 'carry', [4.8, 11.0], 20, 'Carrying baskets with their mother', { face: 'out', prop: 'basket' }), S([-12.9 + i * 0.5, 0, 6.3], 'sitEat', [11.0, 12.5], 30, 'Dinner at the lodge', { seat: 0.0, face: 'out' }), S([-43.6 + i, 0, 1.5], 'run', [12.5, 18.8], 10, 'Playing in the yard', { face: 'out' }), S(W.data.exitW, 'walk', [18.8, 20.2], 1, 'Home'), S(W.data.exitE, 'walk', [20.2, 21.0], 1, 'Down the lane'), S(feet, 'lie', [21.0, 4.0], 240, 'Asleep', { face: c2.pallet.heading })]);
  }
  E(C.woman({ dressColor: '#8a7a5a' }), [S([c1.x0 + 2.6, 0.04, 2.2], 'stir', [4.0, 7.0], 30, 'Cooking at the hearth', { face: 'out', prop: 'spoon' }), S([c1.x0 + 1.25, 0.04, 1.15], 'sitWork', [7.0, 19.4], 40, 'Mending a tunic', { seat: 0.43, face: 'out' }), S([156.6, 0, 7.6], 'pour', [10.0, 11.0], 20, 'Drawing water at the well', { face: 1, prop: 'bucket' }), S([c1.x0 + 1.8, 0.04, 1.15], 'sitEat', [19.4, 21.5], 30, 'Supper with Gervase', { seat: 0.43, face: 'out' }), S(c1.bed.feet.map((v, i) => (i === 2 ? v + 0.18 : v)), 'lie', [21.5, 4.0], 240, 'Asleep', { face: c1.bed.heading })]);
  // Townsfolk along the lane by the well.
  for (let i = 0; i < 3; i++) E(i === 1 ? C.woman() : C.worker(), [S([161 + i * 1.5, 0, 7.4], 'talk', [6.0, 20.0], 40, 'Passing the time by the well', { face: 'out' }), S([150 + i * 2, 0, 7.4], 'walk', [6.0, 20.0], 10, 'Walking down the lane', { face: 1 }), S(W.data.homes[i], 'lie', [20.0, 6.0], 300, 'At home')]);
  void BELL; void CAST; void PAINTER;
}
const BAYW = 5.6;
