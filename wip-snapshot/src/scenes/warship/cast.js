/* Warship scene: the people. Fifty named (fictional) crew from the dossier's casting
 * list, each with a day built from the documented routine at sea (dossier section 4c),
 * plus the extras who fill the messes, the hammocks, the yards and the waist.
 *
 * Routine windows follow the two-watch system: the starboard watch (S) has the first
 * watch (20 to 24) and the morning watch (4 to 7.30) on deck and sleeps 0 to 4; the
 * larboard watch (L) sleeps 20 to 24 and 4 to 7.30 and keeps the middle watch (0 to 4).
 * All hands are up from "up all hammocks" at 7.30 until hammocks are piped down at 20.
 */
import { Y, MAST, innerZ, halfB, PORTS } from './geom.js';
import { MESS, DRILL } from './rooms.js';

const SKINS = ['#f1c9a5', '#e6b48f', '#d9a27a', '#c88c62', '#a96e47', '#8a5634', '#6b4026', '#5a3420'];
const HAIRS = ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#c9a160', '#9a9a9a', '#1e1612'];
const SHIRTS = ['#ece6d8', '#e4dccb', '#c7d0dc', '#b86a5a', '#d8c8a0', '#9aa8c0', '#ece6d8', '#c8b8a0'];
const TROUSERS = ['#ece6d8', '#e0d8c4', '#4a5a7a', '#5a6478', '#8a8070', '#ece6d8'];
const NAVY = '#1f2a48';

export function seaman(r, o = {}) {
  const jacket = r() < 0.4;
  const hat = r();
  return Object.assign({
    skin: r() < 0.16 ? r.pick(SKINS.slice(4)) : r.pick(SKINS.slice(0, 5)), hair: r.pick(HAIRS),
    hairStyle: r() < 0.45 ? 'queue' : 'short', top: r.pick(SHIRTS), bottom: r.pick(TROUSERS), shoes: r() < 0.5 ? '#2a1e18' : '#b88a6a',
    coat: jacket ? 'jacket' : null, coatColor: jacket ? r.pick(['#2a3448', '#26304a', '#3a3a44', '#4a3a2a']) : null,
    hat: hat < 0.3 ? 'boater' : hat < 0.45 ? 'kerchief' : hat < 0.55 ? 'tam' : null,
    hatColor: hat < 0.3 ? r.pick(['#2a2622', '#3a342c', '#d8c890']) : hat < 0.45 ? r.pick(['#a8302a', '#2a4a8a', '#e8e0d0']) : '#2a3448',
    beard: r() < 0.12 ? r.pick(HAIRS) : null, build: 0.9 + r() * 0.25,
  }, o);
}
export const MARINE = { top: '#b02a22', coat: 'jacket', coatColor: '#b02a22', bottom: '#ece6d6', stockings: '#ece6d6', shoes: '#1a1410', hat: 'bowler', hatColor: '#1e1e1e', hairStyle: 'queue' };
const OFFICER = { coat: 'tail', coatColor: NAVY, top: '#ece6d6', bottom: '#ece6d6', stockings: '#f0ece0', shoes: '#1a1410', hat: 'bicorne', hatColor: '#141414', hairStyle: 'queue' };
const WARRANT = { coat: 'tail', coatColor: NAVY, top: '#ece6d6', bottom: '#2a2a33', shoes: '#1a1410', hat: 'bicorne', hatColor: '#1a1a1a' };
const MID = { coat: 'jacket', coatColor: NAVY, top: '#ece6d6', bottom: '#ece6d6', shoes: '#1a1410', hat: 'bicorne', hatColor: '#141414', build: 0.85 };

// ------------------------------------------------------------------ places
const P = (x, y, z) => [x, y, z];
export function places(nav, aloft) {
  const rig = nav.rig;
  const yardPt = (mast, yard, i) => { const L = rig[mast].yards[yard]; const p = L[Math.min(i, L.length - 1)]; return [p.x, p.y, p.z]; };
  const portIn = (deck, i, back = 1.0) => { const Pd = PORTS[deck]; const x = Pd.xs[i]; return [x + 0.75, Pd.y, innerZ(x, Pd.y + 1) - back]; };
  return {
    yardPt,
    portIn,
    // Galley
    fire: P(9.35, Y.middle, 0.6), copperA: P(10.85, Y.middle, 2.15), copperB: P(12.3, Y.middle, 2.15), galleyIssue: P(13.9, Y.middle, 1.6), galleyDoze: P(9.2, Y.middle, 2.5),
    // Waist and decks
    fcMuster: P(9.6, Y.fc, 2.2), fcLook: P(0.6, Y.fc, 2.6), fcBitts: P(5.3, Y.fc, 2.1), cathead: P(1.4, Y.fc, 4.0), belfry: P(11.6, Y.fc, 0.9),
    waist: (i) => P(14.6 + (i % 9) * 1.95, Y.upper, 0.6 + Math.floor(i / 9) * 0.9),
    gangway: (x) => P(x, Y.fc, innerZ(x, Y.fc + 0.1) - 0.9),
    sail: (i) => P(26.4 + (i % 5) * 1.25, Y.upper, 0.55 + Math.floor(i / 5) * 1.9),
    pen: P(21.4, Y.upper, 1.25), launch: P(21.5, Y.fc + 0.35, 0.8),
    upPort: (x) => P(x + 0.7, Y.upper, innerZ(x, Y.upper + 1) - 0.55),
    adDoor: P(42.15, Y.upper, 2.1), clerkDesk: P(43.8, Y.upper, 1.95), dayDesk: P(54.0, Y.upper, 2.35), dining: P(49.0, Y.upper, 0.75), anteWash: P(44.6, Y.upper, 4.5),
    sickA: P(3.0, Y.upper, 1.6), sickB: P(5.0, Y.upper, 3.3), sickTable: P(6.2, Y.upper, 1.0), heads: P(-1.2, 12.95, 2.6), headsB: P(-2.3, 12.5, 1.2),
    qdA: P(37.0, Y.qd, 1.6), qdB: P(40.5, Y.qd, 2.2), qdRail: P(35.6, Y.qd, 4.0), bitts: P(35.55, Y.qd, 1.9), wheelF: P(46.6, Y.qd, 0.55), wheelA: P(48.35, Y.qd, 0.55),
    capDoor: P(47.6, Y.qd, 2.4), capDesk: P(50.6, Y.qd, 1.75),
    poopA: P(50.0, Y.poop, 2.0), poopB: P(53.0, Y.poop, 2.6), poopFlags: P(57.0, Y.poop, 3.0), taffrail: P(58.0, Y.poop, 1.6), hens: P(51.6, Y.poop, 3.9), poopDrill: (i) => P(49.4 + i * 0.85, Y.poop, 1.7),
    mizTop: P(MAST.mizzen + 0.6, 27.52, 1.2),
    // Lower deck
    manger: P(3.2, Y.lower, 1.6), bittsL: P(6.3, Y.lower, 2.0), pump: (i) => P(28.0 + (i % 6) * 1.05, Y.lower, i < 6 ? 1.62 : 3.15), tub: P(38.9, Y.lower, 1.75), gunroom: P(51.5, Y.lower, 2.2), musket: P(45.6, Y.lower, innerZ(45.6, 9.4) - 0.8),
    drillGun: (g, i) => { const x = DRILL[g]; const zi = innerZ(x, Y.middle + 1); return P(x + (i % 2 ? 0.75 : -0.75), Y.middle, zi - 1.2 - Math.floor(i / 2) * 0.8); },
    // Orlop and hold
    cableTier: P(18.8, Y.orlop, 0.55), sailRoom: P(27.8, Y.orlop, 0.9), boatswainStore: P(5.6, Y.orlop, 1.5), carpBench: P(9.6, Y.orlop, 1.95), carpWalk: (x) => P(x, Y.orlop, innerZ(x, Y.orlop + 0.6) - 0.45),
    magPassage: P(12.9, Y.orlop, 1.7), fillBench: P(12.45, 3.05, 0.65), cockpit: P(37.2, Y.orlop, 0.9), cockpitB: P(38.6, Y.orlop, 0.9), surgeon: P(42.0, Y.orlop, 1.0), purser: P(45.0, Y.orlop, 1.05),
    slops: P(32.0, Y.orlop, 1.5), breadRoom: P(51.6, Y.orlop, 2.2), wellTop: P(30.5, Y.orlop, 0.9),
    foreHold: P(19.0, 2.55, 0.7), mainHold: P(25.5, 2.55, 0.7), afterHold: P(38.5, 2.55, 0.8), well: P(30.5, 2.55, 0.6),
    // Rig
    foreTop: [MAST.fore + 0.3, 33.12, 1.6], mainTop: [MAST.main + 0.3, 35.32, 1.6], foreXT: [MAST.fore - 0.55, 50.92, 0.7], mainXT: [MAST.main - 0.55, 55.12, 0.6],
    foreShroud: [6.4, 22.0, 6.4], mainShroud: [29.6, 24.0, 6.1], bowsprit: [-3.6, 18.9, 0.0], jibboom: [-14.0, 25.2, 0.0],
  };
}

// ------------------------------------------------------------------ routine helpers
const D = [6, 12];
export const step = (at, act, when, label, o = {}) => Object.assign({ at, act, when, label, dur: D }, o);
export const seatAt = (s, act, when, label, o = {}) => Object.assign({ at: [s.x, s.y, s.z], act, face: s.face, seat: 0.42, when, label, dur: D }, o);
export const sleep = (a, when, label = 'Asleep in his hammock') => ({ at: a.feet, act: 'lie', face: 1, when, label, dur: [20, 30] });

// The night for a seaman of watch S or L: hammock below, a station on deck.
function nightOf(watch, ham, deckAt, deckAct, deckLabel, morningAt, morningAct, morningLabel) {
  if (watch === 'S') return [
    sleep(ham, [0, 4]),
    step(morningAt || deckAt, morningAct || 'scrub', [4, 7.5], morningLabel || 'Morning watch: washing and scrubbing the decks', morningAct === 'scrub' || !morningAct ? { face: 1 } : {}),
    step(deckAt, deckAct, [20, 24], deckLabel),
  ];
  return [
    step(deckAt, deckAct, [0, 4], deckLabel),
    sleep(ham, [4, 7.5]),
    sleep(ham, [20, 24]),
  ];
}

// ------------------------------------------------------------------ the named cast
export function castNamed(W, S, seats, hams, rng) {
  const r = rng;
  const take = (deck, near) => {
    let best = -1, bd = Infinity;
    seats.forEach((s, i) => { if (s.used || s.deck !== deck) return; const d = Math.abs(s.x - near); if (d < bd) { bd = d; best = i; } });
    const s = seats[best]; s.used = true; return s;
  };
  const ham = (deck, near) => {
    let best = -1, bd = Infinity;
    hams[deck].forEach((h, i) => { if (h.used) return; const d = Math.abs(h.feet[0] - near) + h.feet[2] * 0.3; if (d < bd) { bd = d; best = i; } });
    const h = hams[deck][best]; h.used = true; return h;
  };
  const add = (name, role, bio, costume, routine, extra = {}) => W.addPerson(Object.assign({ name, role, bio, costume, routine, H: 1.62 + r() * 0.12 }, extra));
  const sea = (o) => seaman(r, o);
  const yp = S.yardPt;
  const day = (mess, extra = []) => [
    step(S.gangway(14 + r() * 18), 'carryShoulder', [7.5, 8], 'Up all hammocks: carrying his lashed hammock to the nettings', { prop: 'sack', face: 'in' }),
    seatAt(mess, 'sitEat', [8, 8.75], 'Breakfast: burgoo, oatmeal boiled in water'),
    seatAt(mess, 'sitDrink', [11.5, 12], 'Up spirits: his grog, served before dinner', { prop: 'mug' }),
    seatAt(mess, 'sitEat', [12, 13.5], 'Dinner, the main meal of the day'),
    seatAt(mess, 'sitEat', [17, 17.5], 'Supper: biscuit with cheese or butter'),
  ].concat(extra);

  // 1-15: topmen, forecastlemen, afterguard, landsmen and able seamen.
  let m = take('lower', 10);
  add('Thomas Penhallow', 'captain of the foretop', 'A Cornishman with a wife in Penzance. He has been aloft since he was twelve.', sea({ hairStyle: 'queue', coat: 'jacket', coatColor: '#2a3448', hat: 'boater', hatColor: '#2a2622' }), day(m, [
    step(S.fcMuster, 'talk', [8.75, 9.2], 'Mustering the foretopmen on the forecastle', { face: 'out' }),
    step(yp('fore', 1, 0), 'workBench', [9.2, 11.5], 'On the fore topsail yard, overhauling the gear', { face: -2.6 }),
    step(S.foreXT, 'haul', [13.5, 16], 'Sending down a topgallant yard from the crosstrees', { face: 'in' }),
    step(S.fcBitts, 'stand', [16, 17], 'A pipe of tobacco by the bitts', { prop: 'pipe', face: 'out' }),
    step(S.fcBitts, 'talk', [17.5, 20], 'Yarning on the forecastle in the dog watches', { face: -1 }),
  ]).concat(nightOf('S', ham('lower', 10), S.fcLook, 'lookout', 'First watch: lookout on the forecastle')));

  m = take('lower', 11);
  add('Giuseppe Ferrante', 'foretopman, from Genoa', 'Hums under his breath, though singing at work is forbidden.', sea({ skin: '#d9a27a', hair: '#1e1612', hat: 'kerchief', hatColor: '#a8302a' }), day(m, [
    step(yp('fore', 1, 1), 'workBench', [8.75, 11.5], 'Loosing the fore topsail', { face: -2.6 }),
    step(S.gangway(15), 'haul', [13.5, 14.5], 'Hauling on the braces', { face: -1 }),
    seatAt(m, 'sitWork', [14.5, 16], 'Mending a shirt'),
    step(S.foreTop, 'lookout', [16, 17], 'Lookout in the fore top', { face: -1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches: talk of Genoa'),
  ]).concat(nightOf('L', ham('lower', 11), S.foreTop, 'lookout', 'Middle watch: lookout in the fore top')));

  m = take('middle', 20);
  add('Pieter Brink', 'maintopman, Dutch', 'Keeps a carved clog from home in his ditty bag.', sea({ hair: '#c9a160', beard: '#b07a3c' }), day(m, [
    step(yp('main', 1, 0), 'workBench', [8.75, 10], 'Out on the main topsail yard', { face: -2.6 }),
    step(S.mainTop, 'sitWork', [10, 11.5], 'Splicing in the main top', { seat: 0.1, face: 'out' }),
    step(S.mainTop, 'sitWork', [13.5, 16], 'More splicing in the main top', { seat: 0.1, face: 'out' }),
    seatAt(m, 'sitTalk', [16, 17], 'Resting at his mess'),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches at the mess table'),
  ]).concat(nightOf('S', ham('middle', 20), S.mainTop, 'lookout', 'First watch in the main top')));

  m = take('lower', 40);
  add('Carmelo Zammit', 'mizzen topman, from Malta', 'Wears a small cross on a cord round his neck.', sea({ skin: '#c88c62', hair: '#1e1612' }), day(m, [
    step(S.mizTop, 'workBench', [8.75, 11], 'Overhauling the mizzen rigging from the top', { face: 'in' }),
    step(S.qdRail, 'workBench', [11, 11.5], 'Coiling down the falls on the quarterdeck', { face: 'in' }),
    step(S.poopFlags, 'haul', [13.5, 16], 'Tending the signal halyards on the poop', { face: 1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('lower', 40), S.qdRail, 'stand', 'Middle watch on the quarterdeck')));

  m = take('lower', 8);
  add('Ezekiel Dobbs', 'forecastleman, from Salem, Massachusetts', 'Insists to anyone who asks that he is a British subject.', sea({ hat: 'boater', hatColor: '#2a2622' }), day(m, [
    step(S.cathead, 'workBench', [8.75, 10], 'Checking the anchor lashings at the cathead', { face: 'in' }),
    step(S.cableTier, 'haul', [10, 11.5], 'Shifting the cable in the tier', { face: 1 }),
    step(S.cableTier, 'haul', [13.5, 15.5], 'Still at the cables', { face: 1 }),
    step(S.fcBitts, 'stand', [15.5, 17], 'A pipe of tobacco on the forecastle', { prop: 'pipe', face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Arguing about the war with America'),
  ]).concat(nightOf('S', ham('lower', 8), S.fcBitts, 'stand', 'First watch on the forecastle')));

  m = take('middle', 36);
  add("Anthony D'Souza", 'afterguard, from Bombay', 'Has the best handwriting in his mess and writes letters for his messmates.', sea({ skin: '#8a5634', hair: '#1e1612', hairStyle: 'short' }), day(m, [
    step(S.qdB, 'haul', [8.75, 11], 'Tending the mizzen sheets', { face: 1 }),
    step(S.bitts, 'haul', [11, 11.5], 'Hauling on the fore braces at the bitts', { face: -1 }),
    seatAt(m, 'sitWrite', [13.5, 16], "Writing a messmate's letter home", { prop: 'paper' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('middle', 36), S.qdA, 'stand', 'Middle watch with the afterguard')));

  m = take('lower', 20);
  add('Josiah Pickering', 'landsman, a pressed Lancashire weaver', 'Notches the days at sea on his knife handle.', sea({ coat: null, hat: null, hairStyle: 'short', top: '#e4dccb' }), day(m, [
    step(S.waist(2), 'scrub', [8.75, 10], 'Holystoning the deck on his knees', { face: 1 }),
    step(S.pump(1), 'crank', [10, 11.5], 'At the chain pump cranks', { face: 'in' }),
    step(S.gangway(22), 'haul', [13.5, 16], 'Hauling on a rope he cannot name', { face: -1 }),
    seatAt(m, 'sitWork', [17.5, 20], 'Notching another day on his knife handle'),
  ]).concat(nightOf('S', ham('lower', 20), S.gangway(24), 'sleepSit', 'First watch: dozing on the gangway between calls', S.waist(3), 'scrub', 'Morning watch: holystoning the deck')));

  m = take('lower', 26);
  add('Ned Partridge', 'landsman, Norfolk quota man', 'Afraid of heights, which nobody aboard is allowed to forget.', sea({ hat: 'tam', hatColor: '#4a3a2a' }), day(m, [
    step(S.pump(7), 'crank', [8.75, 10], 'Pumping ship', { face: 'in' }),
    step(S.mainHold, 'carryShoulder', [10, 11.5], 'Swaying up casks in the main hold', { prop: 'box', face: 'out' }),
    step(S.cableTier, 'sleepSit', [13.5, 14.5], 'Dozing in the cable tier, out of sight', { seat: 0.6 }),
    step(S.mainHold, 'carryShoulder', [14.5, 16], 'Back to the casks', { prop: 'box', face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('lower', 26), S.waist(5), 'stand', 'Middle watch in the waist')));

  m = take('middle', 24);
  add('Manoel da Costa', 'able seaman, Portuguese', 'His catch goes first to the sick, as was the custom.', sea({ skin: '#c88c62', hair: '#2b1d14', beard: '#2b1d14' }), day(m, [
    step(S.drillGun(0, 0), 'haul', [8.75, 10], 'Gun drill at a 24-pounder', { face: 'in' }),
    step(S.portIn('middle', 7, 0.9), 'stand', [10, 11.5], 'Fishing from a port; his catch goes to the sick', { prop: 'cane', face: 'in' }),
    step(S.mainShroud, 'workBench', [13.5, 16], 'Tarring the main shrouds', { face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('S', ham('middle', 24), S.gangway(28), 'stand', 'First watch on the gangway')));

  m = take('lower', 33);
  add('Jakob Steiner', 'able seaman, Swiss', 'Never saw the sea until he was twenty.', sea({ hair: '#8d5a2b' }), day(m, [
    step([25.5, Y.lower, 3.2], 'scrub', [8.75, 11.5], 'Scraping the lower deck', { face: 1 }),
    seatAt(m, 'sitWork', [13.5, 16], 'Mending his trousers'),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('lower', 33), S.waist(7), 'stand', 'Middle watch in the waist')));

  m = take('lower', 44);
  const vogt = add('Heinrich Vogt', 'able seaman, from Hamburg', 'Owns a dog-eared pack of cards, much in demand.', sea({ hair: '#c9a160' }), day(m, [
    step(S.launch, 'haul', [8.75, 10], 'Rigging tackles to hoist out a cutter', { face: 1 }),
    step(S.sailRoom, 'workBench', [10, 11.5], 'Folding spare sails in the sail room', { face: 'in' }),
    seatAt(m, 'sitTalk', [13.5, 16], 'A game of cards at the mess table', { prop: 'cards' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Cards again in the dog watches', { prop: 'cards' }),
  ]).concat(nightOf('S', ham('lower', 44), S.gangway(30), 'stand', 'First watch on the gangway')));
  void vogt;

  m = take('middle', 28);
  add('Niels Kjaer', 'ordinary seaman, Danish', 'Practises his English on a slate.', sea({ hair: '#d8c9a8' }), day(m, [
    seatAt(m, 'sitWork', [8.75, 9.5], 'Scrubbing the mess kids'),
    step(S.mainTop, 'stand', [10, 11.5], 'Learning the ropes in the main top', { face: 'out' }),
    seatAt(m, 'sitWrite', [13.5, 16], 'Practising English letters on a slate', { prop: 'paper' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('middle', 28), S.fcLook, 'lookout', 'Middle watch: lookout forward')));

  m = take('lower', 13);
  add('Caleb Moss', 'able seaman, from Nova Scotia', 'Can tie any knot blindfold.', sea({}), day(m, [
    step(S.bittsL, 'workBench', [8.75, 10], 'Checking the cables at the riding bitts', { face: 'in' }),
    step(S.pen, 'haul', [10, 11.5], 'Helping sway livestock aboard', { face: 1 }),
    seatAt(m, 'sitWork', [13.5, 16], 'Teaching a landsman his knots'),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('S', ham('lower', 13), S.fcLook, 'lookout', 'First watch: lookout', S.manger, 'scrub', 'Morning watch: bailing the manger')));

  m = take('lower', 17);
  add('William Kewley', 'able seaman, Isle of Man', 'Rows short and fast, like the fisherman he was.', sea({ hat: 'tam', hatColor: '#2a3448' }), day(m, [
    step(S.launch, 'scrub', [8.75, 11.5], 'Scrubbing out the launch on the booms', { face: 1 }),
    step(S.gangway(20), 'haul', [13.5, 16], 'Hauling on the yard tackle to hoist casks', { face: -1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('lower', 17), S.gangway(18), 'stand', 'Middle watch on the gangway')));

  m = take('lower', 7);
  add('Joao Batista', 'able seaman, from Brazil', 'Laughs at the cold mornings off Spain.', sea({ skin: '#8a5634', hair: '#1e1612' }), day(m, [
    step(S.bowsprit, 'workBench', [8.75, 10], 'Out on the bowsprit, furling the spritsail gear', { face: 'out' }),
    step(S.heads, 'sit', [10, 10.4], 'At the heads, on one of the six seats of ease', { face: -1, seat: 0.35 }),
    step(S.bowsprit, 'lookout', [13.5, 16], 'Lookout on the bowsprit', { face: -1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('S', ham('lower', 7), S.fcLook, 'lookout', 'First watch: lookout on the forecastle')));

  // 16-18: the galley.
  const galleyHam = ham('middle', 15), cookHam = ham('middle', 16);
  add('Joseph Liberty', "cook's mate, from Jamaica", 'Free-born, and saving his pay for a shop ashore.', sea({ skin: '#5a3420', hair: '#1e1612', hairStyle: 'short', apron: '#ece6d6', hat: 'kerchief', hatColor: '#e8e0d0' }), [
    step(S.fire, 'shovel', [4.5, 5.5], 'Lighting the galley fire', { face: 1 }),
    step(S.copperA, 'stir', [5.5, 8], 'Boiling the oatmeal for burgoo', { face: 'out', prop: 'spoon' }),
    step(S.copperB, 'stir', [8, 11.5], 'Skimming the coppers', { face: 'out', prop: 'spoon' }),
    step(S.galleyIssue, 'pour', [11.5, 13], 'Issuing dinner to the mess cooks', { face: 1 }),
    step(S.copperA, 'stir', [13, 17.5], 'At the coppers again', { face: 'out', prop: 'spoon' }),
    step(S.fire, 'stand', [17.5, 19], 'Banking down the fire', { face: 1 }),
    step([16.7, Y.middle, 3.5], 'sitTalk', [19, 20], 'An hour off by the fore hatch', { seat: 0.2 }),
    sleep(galleyHam, [20, 4.5]),
  ]);
  add('John Ollerenshaw', "ship's cook, wooden leg", 'Like many ship’s cooks, an old seaman who lost a leg in the service.', sea({ hair: '#9a9a9a', beard: '#9a9a9a', apron: '#ece6d6', build: 1.2, hat: 'kerchief', hatColor: '#d8d0c0' }), [
    step(S.copperB, 'point', [5, 11.5], 'Overseeing the coppers', { face: 'out' }),
    step(S.galleyIssue, 'pour', [11.5, 13], 'Issuing dinner', { face: -1, prop: 'jug' }),
    step(S.galleyDoze, 'sleepSit', [13, 15], 'Dozing by the warm stove', { seat: 0.4 }),
    step(S.copperB, 'stand', [15, 18], 'Watching the coppers', { face: 'out' }),
    step([17.4, Y.middle, 3.6], 'sitTalk', [18, 20], 'Pipe and gossip', { seat: 0.2, prop: 'pipe' }),
    sleep(cookHam, [20, 5]),
  ], { speed: 0.6 });
  m = take('lower', 24);
  add('Dick Haverty', 'mess cook for the week, from Cork', 'Writes to his sister in Cork every Sunday.', sea({ hair: '#7a2c14' }), [
    step(S.afterHold, 'carryShoulder', [7, 7.6], "Fetching his mess's oatmeal and cheese from the hold", { prop: 'sack', face: 'out' }),
    step(S.galleyIssue, 'carry', [7.6, 8], 'Handing in the mess bag at the galley', { prop: 'sack', face: -1 }),
    seatAt(m, 'pour', [8, 8.4], 'Sharing out breakfast', { seat: null, act: 'pour' }),
    seatAt(m, 'sitEat', [8.4, 8.75], 'Breakfast'),
    step(S.galleyIssue, 'carry', [11.4, 12], "Collecting his mess's dinner from the galley", { prop: 'bucket', face: 1 }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    seatAt(m, 'sitWrite', [13.5, 16], 'Writing to his sister in Cork', { prop: 'paper' }),
    seatAt(m, 'sitEat', [17, 17.5], 'Supper'),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
    sleep(ham('lower', 24), [20, 7]),
  ]);

  // 19-21: gunners.
  m = take('lower', 15);
  add('Robert Stainthorpe', "gunner's mate", 'Deaf in one ear from years of gunfire.', sea({ coat: 'jacket', coatColor: '#2a3448', hair: '#6b4428' }), day(m, [
    step(S.portIn('lower', 3, 1.4), 'workBench', [8.75, 10.5], 'Inspecting the breechings of the lower-deck guns', { face: 'in' }),
    step(S.boatswainStore, 'workBench', [10.5, 11.5], "Counting wads in the gunner's store", { face: 'in' }),
    step(S.drillGun(1, 4), 'point', [13.5, 15], 'Drilling a gun crew', { face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 15), [20, 7.5])]));
  m = take('middle', 22);
  add('Patrick Dunleavy', 'quarter gunner, Irish', "Proud of his gun crew's speed.", sea({ hair: '#7a2c14', beard: '#7a2c14' }), day(m, [
    step(S.drillGun(1, 0), 'push', [10, 11.5], 'Gun drill: sponging out a 24-pounder', { face: 'in' }),
    step(S.portIn('upper', 1, 1.3), 'haul', [13.5, 15], 'Rigging a gun tackle under the forecastle', { face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat(nightOf('L', ham('middle', 22), S.qdA, 'stand', 'Middle watch')));
  m = take('lower', 38);
  add('Isaac Mundy', 'yeoman of the powder room', 'Wears no metal buttons below, for fear of a spark.', sea({ top: '#e4dccb', coat: null, shoes: '#c8b090' }), day(m, [
    step(S.fillBench, 'workBench', [8.75, 11.5], 'Filling cartridges in the filling room', { face: 1 }),
    step(S.magPassage, 'carry', [13.5, 15], 'Passing cartridges in drill', { prop: 'box', face: 1 }),
    step(S.fillBench, 'workBench', [15, 17], 'Back in the filling room', { face: 1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 38), [20, 7.5])]));

  // 22-29: petty officers and idlers.
  m = take('lower', 22);
  add('William Harbottle', "boatswain's mate", 'His silver call was his father’s.', sea({ coat: 'jacket', coatColor: '#2a3448', hat: 'boater', hatColor: '#2a2622', build: 1.2 }), [
    step(S.waist(4), 'handsBehind', [5, 7.3], 'Supervising the holystoning', { face: 'out' }),
    step([18, Y.upper, 2.4], 'point', [7.3, 7.5], 'Piping "Up all hammocks"', { face: 'out' }),
    step([22, Y.lower, 2.2], 'point', [7.5, 8], 'Rousing the late sleepers below', { face: 1 }),
    seatAt(m, 'sitEat', [8, 8.75], 'Breakfast'),
    step(S.waist(13), 'point', [8.75, 9.5], 'Driving the deck sweepers', { face: 'out' }),
    step(S.qdA, 'handsBehind', [9.5, 10], 'Divisions on the quarterdeck', { face: 'out' }),
    step(S.waist(10), 'point', [10, 11.5], 'Piping the time for every haul', { face: 'out' }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    step(S.gangway(26), 'handsBehind', [13.5, 17], 'Watching the afternoon work', { face: 'out' }),
    seatAt(m, 'sitEat', [17, 17.5], 'Supper'),
    step([18, Y.upper, 2.4], 'point', [19.8, 20.2], 'Piping down the hammocks', { face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 19.8], 'Dog watches'),
    sleep(ham('lower', 22), [20.2, 5]),
  ]);
  m = take('lower', 35);
  add('Owen Pritchard', "carpenter's mate, Welsh", 'Hums hymns as he works.', sea({ apron: '#8a6a4a', top: '#d8c8a0' }), [
    step(S.carpBench, 'workBench', [4.5, 6], 'Sharpening tools at the bench', { face: 'in' }),
    step(S.well, 'workBench', [6, 6.5], 'Sounding the well', { face: 'in' }),
    step(S.carpWalk(18), 'hammer', [6.5, 7.5], "On the carpenter's walk, tapping the hull for rot", { face: 'in', prop: 'mallet' }),
    seatAt(m, 'sitEat', [8, 8.75], 'Breakfast'),
    step(S.carpWalk(38), 'hammer', [8.75, 10], "Tapping the timbers along the carpenter's walk", { face: 'in', prop: 'mallet' }),
    step(S.pump(4), 'workBench', [10, 11.5], 'Greasing the pump chains', { face: 'in' }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    step(S.carpBench, 'saw', [13.5, 17], 'Making shot plugs', { face: 'in' }),
    seatAt(m, 'sitEat', [17, 17.5], 'Supper'),
    seatAt(m, 'sitTalk', [17.5, 20.5], 'Humming a hymn at the mess table'),
    sleep(ham('lower', 35), [20.5, 4.5]),
  ]);
  m = take('lower', 18);
  add('Jabez Truscott', 'caulker', 'Smells permanently of pitch.', sea({ top: '#8a8070', coat: null }), day(m, [
    step(S.waist(16), 'scrub', [8.75, 11.5], 'Caulking a deck seam with oakum and mallet', { face: 1, prop: 'mallet' }),
    step(S.qdB, 'scrub', [13.5, 16], 'Paying the seams with hot pitch', { face: 1 }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 18), [20, 7.5])]));
  m = take('middle', 27);
  add('Matthias Holm', "sailmaker's mate, Swedish", 'His stitches are tiny and perfectly even.', sea({ hair: '#d8c9a8', top: '#ece6d8' }), day(m, [
    step(S.sail(2), 'sitWork', [8.75, 11.5], 'Sewing a torn topsail on deck', { seat: 0.12, face: 'out' }),
    step(S.sail(2), 'sitWork', [13.5, 16], 'Still sewing', { seat: 0.12, face: 'out' }),
    step(S.sailRoom, 'carryShoulder', [16, 17], 'Stowing the mended sail', { prop: 'sack', face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('middle', 27), [20, 7.5])]));
  m = take('lower', 6);
  add('Hans Vermeulen', 'ropemaker, Dutch', 'Saves every scrap of twine.', sea({ hair: '#9a9a9a' }), day(m, [
    step(S.boatswainStore, 'sitWork', [8.75, 11], 'Splicing blocks in the store', { seat: 0.3, face: 'out' }),
    step(S.fcBitts, 'haul', [13.5, 15], 'Re-reeving a halyard', { face: 'in' }),
    step(S.boatswainStore, 'sitWork', [15, 17], 'More splicing', { seat: 0.3, face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 6), [20, 7.5])]));
  m = take('lower', 21);
  add('Nathaniel Ruddle', 'cooper', 'Judges a cask of beer by knocking on it.', sea({ apron: '#8a6a4a' }), day(m, [
    step(S.foreHold, 'hammer', [8.75, 11.5], 'Knocking down empty casks in the fore hold', { face: 'in' }),
    step(S.gangway(19), 'carry', [13.5, 15], "Passing staves down to the transport's boat", { prop: 'plank', face: 'in' }),
    step(S.foreHold, 'hammer', [15, 17], 'Back to the casks', { face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 21), [20, 7.5])]));
  m = take('lower', 47);
  add('Silas Kettlewell', 'armourer', 'Keeps a pet sparrow, against orders.', sea({ apron: '#5a4a3a', hair: '#4a3020' }), day(m, [
    step(S.musket, 'workBench', [8.75, 11], "Cleaning the marines' muskets", { face: 'in' }),
    step(S.boatswainStore, 'workBench', [13.5, 15], 'Filing cutlasses', { face: 'in' }),
    step(S.musket, 'workBench', [15, 17], 'Back at the muskets', { face: 'in' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 47), [20, 7.5])]));
  add('Josias Grubb', 'master-at-arms', 'Nobody aboard has seen him smile.', Object.assign(sea({}), { coat: 'jacket', coatColor: '#3a3a44', hat: 'boater', hatColor: '#1a1a1a', build: 1.15 }), [
    step([42, Y.lower, 2.2], 'handsBehind', [5, 7.5], 'Morning rounds of the lower deck', { face: 'out' }),
    step([24, Y.lower, 1.4], 'handsBehind', [7.5, 9], 'Rounds of the lower deck', { face: 'out' }),
    step(S.slops, 'handsBehind', [9, 9.5], 'Checking the prisoners', { face: 'out' }),
    step(S.qdA, 'handsBehind', [9.5, 10], 'Divisions', { face: 'out' }),
    step([22, Y.middle, 1.4], 'handsBehind', [10, 12], 'Rounds of the middle deck', { face: 'out' }),
    step([45.5, Y.lower, 2.2], 'sitWrite', [12, 14], 'Writing up his book', { seat: 0.42, prop: 'paper' }),
    step([30, Y.lower, 1.4], 'handsBehind', [14, 19.8], 'Afternoon rounds', { face: 'out' }),
    step([24, Y.lower, 1.4], 'point', [19.8, 20.5], 'Lights out below', { face: 'out' }),
    step([46.4, Y.lower, 1.0], 'sitTalk', [20.5, 21.5], 'A last look round', { seat: 0.42 }),
    sleep(ham('lower', 46), [21.5, 5]),
  ]);

  // 30-32: quartermasters and the coxswain.
  add('Duncan McPhail', 'quartermaster, Scottish', 'Steers by the feel of the wind on his cheek.', sea({ hair: '#8d5a2b', beard: '#8d5a2b', coat: 'jacket', coatColor: '#2a3448' }), [
    step(S.wheelF, 'wheel', [8, 12], 'At the wheel', { face: 1 }),
    step(S.wheelF, 'wheel', [16, 20], 'At the wheel', { face: 1 }),
    step(S.wheelF, 'wheel', [0, 4], 'At the wheel through the middle watch', { face: 1 }),
    seatAt(take('lower', 42), 'sitEat', [12, 13.5], 'Dinner'),
    step([46, Y.lower, 1.3], 'sitTalk', [13.5, 16], 'Off watch', { seat: 0.42 }),
    sleep(ham('lower', 45), [20, 0]), sleep(ham('lower', 45.5), [4, 8]),
  ]);
  add('Lars Eriksen', "quartermaster's mate, Norwegian", 'Whittles little boats for the ship’s boys.', sea({ hair: '#d8c9a8', beard: '#c9a160' }), [
    step(S.wheelA, 'wheel', [8, 10], 'Second man at the wheel', { face: -1 }),
    step(S.taffrail, 'haul', [10, 10.4], 'Heaving the log to measure the speed', { face: 1 }),
    step(S.wheelA, 'wheel', [10.4, 12], 'Second man at the wheel', { face: -1 }),
    step([46.4, Y.lower, 3.0], 'sitWork', [12, 16], 'Whittling a little boat', { seat: 0.42 }),
    step(S.wheelA, 'wheel', [16, 20], 'At the wheel', { face: -1 }),
    step(S.wheelA, 'wheel', [0, 4], 'At the wheel', { face: -1 }),
    sleep(ham('lower', 46.5), [20, 0]), sleep(ham('lower', 47), [4, 8]),
  ]);
  add('James Treloar', "captain's coxswain", 'Fiercely proud of his boat’s crew.', sea({ coat: 'jacket', coatColor: '#2a3448', hat: 'boater', hatColor: '#2a2622' }), [
    step(S.poopB, 'point', [8, 10], 'Inspecting the quarter boats', { face: 'in' }),
    step(S.capDoor, 'handsBehind', [10, 12], "Waiting at the captain's door", { face: 'out' }),
    seatAt(take('lower', 43), 'sitEat', [12, 13.5], 'Dinner'),
    step(S.capDoor, 'handsBehind', [13.5, 17], "Waiting at the captain's door", { face: 'out' }),
    step([43.5, Y.lower, 3.2], 'sitTalk', [17, 20], 'Off duty', { seat: 0.42 }),
    sleep(ham('lower', 43.5), [20, 8]),
  ]);

  // 33-36: officers and young gentlemen.
  const ltCot = { feet: [44.4, Y.middle + 0.95, 4.95], heading: 0 };
  add('Lt Henry Ashcombe', 'lieutenant', 'Reads Cowper in his cot.', Object.assign({}, OFFICER, { hair: '#4a3020' }), [
    step(S.qdA, 'handsBehind', [8, 12], 'Officer of the forenoon watch', { face: 'out' }),
    step([53.0, Y.middle, 2.15], 'sitEat', [12.5, 14], 'Dinner in the wardroom', { face: -1, seat: 0.46 }),
    step([44.2, Y.middle, 3.6], 'read', [14, 16], 'Reading Cowper in his cabin', { face: 'out' }),
    step([12, Y.lower, 2.6], 'point', [16, 17], 'Exercising the lower-deck guns', { face: 'in' }),
    step(S.qdB, 'handsBehind', [17, 20], 'On the quarterdeck in the dog watches', { face: 'out' }),
    step(ltCot.feet, 'lie', [20, 3.8], 'Asleep in his cot', { face: 1 }),
    step(S.qdA, 'handsBehind', [3.8, 8], 'Morning watch', { face: 'out' }),
  ]);
  add('Daniel Ormsby', "master's mate, 19", 'Hopes a battle will bring him promotion.', Object.assign({}, MID, { hair: '#8d5a2b', build: 1.0 }), [
    step(S.qdB, 'handsBehind', [8, 11.6], 'Keeping the forenoon watch', { face: 'out' }),
    step([38.5, Y.qd, 3.8], 'lookout', [11.6, 12.2], 'Taking the noon sight', { face: 'in' }),
    step(S.cockpit, 'sitWrite', [12.2, 13.5], 'Working up the reckoning in the cockpit', { seat: 0.4, face: 'in', prop: 'paper' }),
    step(S.cockpit, 'sitEat', [13.5, 14.5], 'Dinner in the cockpit', { seat: 0.4, face: 'in' }),
    step(S.qdB, 'handsBehind', [16, 20], 'First dog watch on deck', { face: 'out' }),
    step(S.cockpitB, 'sitTalk', [14.5, 16], 'Arguing about prize money', { seat: 0.4, face: 'in' }),
    step([38.23, 7.74, 3.32], 'lie', [20, 8], 'Asleep in a hammock in the cockpit', { face: 1 }),
  ]);
  add('George Fenwick', 'midshipman, 14', 'Homesick for his dog.', Object.assign({}, MID, { hair: '#c9a160', build: 0.8, H: 1.45 }), [
    step(S.poopA, 'lookout', [8, 10.5], 'Watching for signals on the poop', { face: 'in' }),
    step(S.mainXT, 'sit', [10.5, 12], 'Sent to sit at the masthead as a punishment', { seat: 0.2, face: 'out' }),
    step(S.cockpitB, 'sitEat', [12, 13], 'Biscuit and cheese in the cockpit', { seat: 0.4, face: 'in' }),
    step(S.poopA, 'stand', [13, 17], 'Afternoon watch on the poop', { face: 'out' }),
    step(S.cockpitB, 'sitWrite', [17, 20], 'Writing home about his dog', { seat: 0.4, face: 'in', prop: 'paper' }),
    step([39.43, 7.74, 1.42], 'lie', [20, 8], 'Asleep in a hammock in the cockpit', { face: 1 }),
  ], { H: 1.45 });
  add('Arthur Danvers', 'signal midshipman, 16', 'Knows the signal book by heart.', Object.assign({}, MID, { hair: '#2b1d14' }), [
    step(S.poopFlags, 'lookout', [8, 11.5], 'Reading the flags of the other ships', { face: 'in' }),
    step(S.qdA, 'salute', [11.5, 11.8], 'Reporting a signal to the officer of the watch', { face: 1 }),
    step(S.cockpit, 'sitEat', [12, 13], 'Dinner in the cockpit', { seat: 0.4, face: 'in' }),
    step(S.poopFlags, 'lookout', [13, 18], 'Signal watch on the poop', { face: 'in' }),
    step(S.cockpit, 'sitRead', [18, 20], 'Studying the signal book', { seat: 0.4, face: 'in' }),
    step([36.83, 7.74, 3.32], 'lie', [20, 8], 'Asleep in a hammock in the cockpit', { face: 1 }),
  ]);

  // 37-41: the surgeon's people, the purser's steward, the admiral's household.
  add('Alexander Crombie', "surgeon's mate, Scottish", 'Studying for an Edinburgh degree between sick calls.', Object.assign({}, WARRANT, { coat: null, top: '#ece6d6', apron: '#ece6d6', hat: null, hair: '#8d5a2b' }), [
    step(S.sickA, 'workBench', [8, 10], 'Morning rounds of the sick berth', { face: 'in' }),
    step(S.surgeon, 'sitWork', [10, 12], 'Rolling pills in the dispensary', { seat: 0.4, face: 'in' }),
    step(S.cockpit, 'sitEat', [12, 13], 'Dinner in the cockpit', { seat: 0.4, face: 'in' }),
    step(S.sickB, 'workBench', [13, 15], 'Afternoon rounds of the sick', { face: 'in' }),
    step(S.surgeon, 'sitWrite', [15, 19], 'Writing up the sick journal', { seat: 0.4, face: 'in', prop: 'paper' }),
    step(S.sickA, 'workBench', [19, 20.5], 'Evening visit to the sick berth', { face: 'in' }),
    step([42.63, 7.74, 2.92], 'lie', [20.5, 8], 'Asleep in a hammock by the dispensary', { face: 1 }),
  ]);
  add('Abel Crane', 'loblolly boy', 'Dreads the cockpit, where the wounded are taken in battle.', seaman(r, { build: 0.85, apron: '#ece6d6', hat: null }), [
    step(S.sickB, 'carry', [8, 9.5], 'Carrying gruel to the sick', { prop: 'bucket', face: 'in' }),
    step(S.headsB, 'pour', [9.5, 9.9], 'Emptying the buckets at the head', { prop: 'bucket', face: -1 }),
    step(S.surgeon, 'workBench', [9.9, 12], 'Washing bandages', { face: 'in' }),
    step(S.sickTable, 'carry', [12, 14], 'Feeding the patients', { prop: 'bucket', face: 'in' }),
    step(S.surgeon, 'workBench', [14, 18], 'Rolling bandages', { face: 'in' }),
    step(S.sickTable, 'sitTalk', [18, 21], 'Sitting up with the sick', { seat: 0.3 }),
    step([3.6, Y.upper + 0.05, 4.9], 'sleepSit', [21, 8], 'Dozing by the sick berth door', { seat: 0.3 }),
  ]);
  add('Samuel Twelvetrees', "purser's steward", 'Accounts for every farthing.', Object.assign(sea({}), { coat: 'jacket', coatColor: '#3a3a44', hat: null, top: '#ece6d6' }), [
    step(S.afterHold, 'workBench', [7, 8], 'Broaching casks in the after hold', { face: 'in' }),
    step(S.purser, 'sitWrite', [8, 10], 'Weighing out oatmeal and cheese', { seat: 0.4, face: 'in', prop: 'paper' }),
    step(S.slops, 'talk', [10, 11], 'Selling slops: shirts, trousers and jackets', { face: 'in' }),
    step(S.purser, 'sitWrite', [11, 18], 'At his ledgers', { seat: 0.4, face: 'in', prop: 'book' }),
    step(S.purser, 'sleepSit', [18, 7], 'Asleep over his ledgers', { seat: 0.4, face: 'in' }),
  ]);
  add('Peregrine Lusk', "admiral's clerk", 'Ink-stained, and seasick on every first day out.', { coat: 'tail', coatColor: '#2a2a2a', top: '#ece6d6', bottom: '#2a2a2a', hat: null, hair: '#b07a3c', build: 0.85 }, [
    step(S.clerkDesk, 'sitWrite', [8, 11.5], 'Copying the admiral’s orders in a fair hand', { face: 'in', seat: 0.46, prop: 'paper' }),
    step(S.dayDesk, 'sitWrite', [11.5, 12.5], 'Making fair copies in the day cabin', { face: 'in', seat: 0.46, prop: 'paper' }),
    step([53.6, Y.middle, 2.15], 'sitEat', [12.5, 13.5], 'A meal in the wardroom', { face: -1, seat: 0.46 }),
    step(S.clerkDesk, 'sitWrite', [13.5, 19], 'Copying dispatches', { face: 'in', seat: 0.46, prop: 'paper' }),
    step(S.clerkDesk, 'sleepSit', [19, 8], 'Asleep at his desk', { seat: 0.46 }),
  ]);
  add('Luigi Russo', "admiral's cook's mate, from Naples", 'Buys onions and lemons whenever the boats come.', sea({ skin: '#d9a27a', hair: '#1e1612', apron: '#ece6d6', hat: 'chef', hatColor: '#f4f0e8' }), [
    step(S.copperA, 'stir', [11, 13.8], 'Borrowing a corner of the stove for the admiral’s dinner', { face: 'out', prop: 'spoon' }),
    step(S.dining, 'carryHigh', [13.8, 15], 'Carrying up the admiral’s dinner', { prop: 'tray', face: 'out' }),
    step(S.anteWash, 'workBench', [15, 17], 'Washing the plate', { face: 'in' }),
    step([16.0, Y.middle, 3.6], 'sitTalk', [17, 21], 'Talking of Naples', { seat: 0.2 }),
    step([12.8, Y.middle, 3.7], 'sleepSit', [21, 6], 'Sleeping by the warm galley', { seat: 0.2 }),
    step(S.copperB, 'stir', [6, 11], 'Preparing the admiral’s breakfast', { face: 'out', prop: 'spoon' }),
  ]);

  // 42-45: livestock man and the boys.
  add('Benjamin Stubbs', "seaman tending the officers' livestock", 'Has given every hen a name.', sea({ top: '#d8c8a0', hat: 'boater', hatColor: '#d8c890' }), [
    step(S.hens, 'kneel', [6.5, 7.5], 'Feeding the hens on the poop', { face: 'in' }),
    step(S.pen, 'pour', [7.5, 8.2], 'Watering the sheep and the goat', { prop: 'bucket', face: 'in' }),
    step(S.hens, 'kneel', [8.2, 9], 'Collecting eggs', { face: 'in' }),
    step(S.pen, 'stand', [9, 12], 'Mucking out the pen', { prop: 'broom', act: 'sweep', face: 'in' }),
    seatAt(take('lower', 39), 'sitEat', [12, 13.5], 'Dinner'),
    step(S.pen, 'stand', [13.5, 17], 'Talking to the goat', { face: 'in' }),
    step(S.hens, 'kneel', [17, 18], 'Shutting up the hens', { face: 'in' }),
    step([40.6, Y.lower, 3.2], 'sitTalk', [18, 20], 'Dog watches', { seat: 0.3 }),
    sleep(ham('lower', 39), [20, 6.5]),
  ]);
  const boy = (o) => seaman(r, Object.assign({ child: true, hat: null, coat: null }, o));
  add('Tom Larkin', "boy, 12, a lieutenant's servant", 'Came to the Navy through the Marine Society; learning his letters.', boy({ hair: '#8d5a2b' }), [
    step([46.0, Y.middle, 3.6], 'workBench', [7, 8], "Brushing his lieutenant's coat", { face: 'in' }),
    step([52.2, Y.middle, 0.7], 'carryHigh', [8, 9], 'Serving breakfast in the wardroom', { prop: 'tray', face: 'out' }),
    step(S.cockpit, 'sitRead', [9, 12.5], 'Learning his letters', { seat: 0.4, face: 'in', prop: 'book' }),
    step([54.6, Y.middle, 0.7], 'carryHigh', [12.5, 14], 'Waiting at table in the wardroom', { prop: 'tray', face: 'out' }),
    step(S.clerkDesk, 'stand', [14, 15.5], "Watching the clerk's quill, learning his letters", { face: 'in' }),
    step([52.2, Y.middle, 0.7], 'sweep', [15.5, 19.5], 'Sweeping the wardroom', { face: 'out' }),
    sleep(hams.gunroom[0], [19.5, 7], 'Asleep in a hammock in the gunroom'),
  ], { H: 1.28 });
  add('Billy Sprat', 'boy, 13, powder boy at quarters', 'The fastest boy aboard on the ladders.', boy({ hair: '#c9a160' }), [
    step(S.gunroom, 'workBench', [8, 10], 'Polishing brass in the gunroom', { face: 'in' }),
    step(S.magPassage, 'run', [10, 10.4], 'Drill: fetching a cartridge from the magazine passage', { prop: 'box', face: 1 }),
    step(S.drillGun(0, 3), 'stand', [10.4, 10.8], 'Drill: delivering the cartridge to the gun', { prop: 'box', face: 'in' }),
    step(S.magPassage, 'run', [10.8, 11.2], 'Running for another cartridge', { prop: 'box', face: 1 }),
    step(S.drillGun(0, 3), 'stand', [11.2, 11.6], 'Delivering it', { prop: 'box', face: 'in' }),
    seatAt(take('lower', 30.5), 'sitEat', [12, 13.5], 'Dinner'),
    step(S.gunroom, 'workBench', [13.5, 17], 'More brass to polish', { face: 'in' }),
    step([51.0, Y.lower, 3.0], 'sitTalk', [17, 20], 'Playing with the other boys', { seat: 0.2 }),
    sleep(hams.gunroom[1], [20, 8], 'Asleep in a hammock in the gunroom'),
  ], { H: 1.3 });
  m = take('lower', 9);
  add('Henry Moxon', 'boy, 15', 'Means to be captain of the foretop one day.', seaman(r, { build: 0.85, hat: null }), day(m, [
    step(S.foreShroud, 'climb', [8.75, 11], 'Climbing the fore shrouds with the topmen', { face: 'in' }),
    step(S.fcBitts, 'workBench', [13.5, 15], 'Coiling down ropes on the forecastle', { face: 'in' }),
    step(S.foreTop, 'stand', [15, 17], 'In the fore top with Penhallow', { face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Dog watches'),
  ]).concat([sleep(ham('lower', 9), [20, 7.5])]), { H: 1.55 });

  // 46-50: Royal Marines, and a woman off the books.
  m = take('lower', 41);
  add('Jeremiah Coombes', 'Royal Marine private', 'Carries pipeclay and blacking in a tin.', Object.assign({}, MARINE, { hair: '#4a3020' }), [
    seatAt(m, 'sitEat', [7.5, 8], 'Breakfast'),
    step(S.adDoor, 'stand', [8, 10], "Sentry at the admiral's door", { face: 'out' }),
    step(S.poopDrill(1), 'stand', [10, 11], 'Musket drill on the poop', { face: 'out' }),
    step(S.pump(9), 'crank', [11, 11.5], 'Taking a turn at the pumps', { face: 'in' }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    seatAt(m, 'sitWork', [13.5, 16], 'Pipeclaying his crossbelts'),
    step(S.adDoor, 'stand', [16, 18], "Sentry at the admiral's door", { face: 'out' }),
    seatAt(m, 'sitEat', [18, 18.5], 'Supper'),
    seatAt(m, 'sitTalk', [18.5, 20], 'Evening at the mess'),
    sleep(ham('lower', 41), [20, 7.5]),
  ]);
  m = take('lower', 41);
  add('Patrick Feeney', 'Royal Marine private', 'Sends half his pay home to his mother.', Object.assign({}, MARINE, { hair: '#7a2c14' }), [
    seatAt(m, 'sitEat', [7.5, 8], 'Breakfast'),
    step(S.poopDrill(2), 'stand', [8, 10], 'Drill on the poop', { face: 'out' }),
    step(S.magPassage, 'handsBehind', [10, 12], 'Sentry at the magazine passage, his lantern held well back', { face: 'out', prop: 'lantern' }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    step(S.magPassage, 'handsBehind', [13.5, 16], 'Sentry at the magazine passage', { face: 'out', prop: 'lantern' }),
    seatAt(m, 'sitEat', [17, 17.5], 'Supper'),
    seatAt(m, 'sitTalk', [17.5, 20], 'Evening at the mess'),
    sleep(ham('lower', 42), [20, 7.5]),
  ]);
  m = take('lower', 44);
  add('Thomas Albright', 'Royal Marine sergeant', 'Served ashore in the West Indies.', Object.assign({}, MARINE, { hair: '#6b4428', build: 1.15 }), [
    step(S.poopDrill(0), 'handsBehind', [8, 9.5], 'Inspecting the detachment on the poop', { face: 1 }),
    step(S.qdA, 'stand', [9.5, 10], 'Divisions', { face: 'out' }),
    step(S.poopDrill(5), 'point', [10, 11.5], 'Drilling the marines', { face: -1 }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    seatAt(m, 'sitWrite', [13.5, 14.5], 'Writing up the duty roster', { prop: 'paper' }),
    step(S.poopA, 'handsBehind', [14.5, 17], 'On the poop', { face: 'out' }),
    seatAt(m, 'sitTalk', [17.5, 20], 'Evening'),
    sleep(ham('lower', 44), [20, 8]),
  ]);
  m = take('lower', 45);
  add('Isaac Reddish', 'Royal Marine drummer, 16', 'His drum is painted with the royal arms.', Object.assign({}, MARINE, { hair: '#c9a160', build: 0.85 }), [
    step(S.poopDrill(4), 'stand', [9.2, 9.5], 'Beating the drum for parade', { face: 'out' }),
    step(S.poopDrill(4), 'stand', [10, 11.5], 'Drill on the poop', { face: 'out' }),
    seatAt(m, 'sitEat', [12, 13.5], 'Dinner'),
    seatAt(m, 'sitWork', [13.5, 15], 'Practising his beats on a board'),
    seatAt(m, 'sitTalk', [15, 20], 'At the mess'),
    sleep(ham('lower', 45), [20, 9.2]),
  ], { H: 1.6 });
  add('Margaret Cairns', "a gunner's mate's wife, off the books", 'An invented figure: no woman is positively identified aboard Victory. She is modelled on reported accounts of wives who helped nurse the sick.', { dress: 'long', dressColor: '#4a3a3a', top: '#6a4a3a', apron: '#ece6d6', hat: 'bonnet', hatColor: '#ece6d6', hair: '#6b4428', skin: '#e6b48f' }, [
    step(S.sickTable, 'workBench', [8.5, 11], 'Helping to nurse the sick', { face: 'in' }),
    step([44.6, Y.lower, 3.4], 'scrub', [11, 13], 'Washing clothes in a tub', { face: 1 }),
    step([45.4, Y.lower, 3.0], 'sitEat', [13, 14], 'Dinner', { seat: 0.42 }),
    step(S.sickB, 'workBench', [14, 17], 'Back with the sick', { face: 'in' }),
    step([45.4, Y.lower, 3.0], 'sitWork', [17, 20], 'Mending', { seat: 0.42 }),
    sleep(hams.gunroom[2], [20, 8.5], 'Asleep in a hammock in the gunroom'),
  ]);
}

export { halfB };
