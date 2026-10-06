/* The Man-of-War: HMS Victory, 104 guns, at sea west of Cadiz on Wednesday 9 October 1805.
 *
 * Research: docs/research/warship.md. Modelled on Victory herself; room positions are
 * layout estimates built from verified dimensions and deck order. All named people are
 * fictional; real people (Nelson, Hardy) are deliberately not drawn as clickable figures.
 *
 * Layout plan (metres; helpers in src/scenes/warship/):
 *   x: bow LEFT. Stem at x 0 (lower-deck height), figurehead about x -5, bowsprit end
 *      x -10.3, jib-boom x -24; gun deck x 0 to 56.7; taffrail about x 59; driver boom to 66.
 *      Keel x 7.5 to 54. Masts: fore 8.0, main 30.5, mizzen 45.0.
 *   y: keel underside 0; hold floor 1.8 (shingle bed 2.55); orlop 6.4; waterline 7.6;
 *      lower deck 8.4; middle 10.5; upper 12.6; forecastle and quarterdeck 14.7; poop 16.7;
 *      main truck 70.1. Decks are drawn flat (no sheer).
 *   z: 0 = centreline cut; we see the inside of the starboard side, half-breadth up to 7.9.
 *   Zones (dossier zone table):
 *     hold   H1 forepeak 3-7.5 | H2 copper magazine 7.5-14.5 | H3 fore hold 14.5-23 |
 *            H4 main hold, well 23-36 | H5 after hold, spirit room 36-46 | H6 run 46-52
 *     orlop  O1 bosun 3-8 | O2 carpenter 8-12 | O3 magazine passage 12-15 | O4 cable tiers 15-26 |
 *            O5 sail room 26-29.5 | O6 well, slops 29.5-35 | O7 cockpit 35-41 | O8 surgeon 41-44 |
 *            O9 purser 44-47.5 | O10 hanging magazine 47.5-50.5 | O11 bread room 50.5-53
 *     lower  L1 manger 0-4 | L2 bitts 4-7 | L3-L6 guns and messes 7-48 (jeer capstan 23.5,
 *            chain pumps 29-32, grog tub 38.9) | L7 gunroom and tiller 48-56.7
 *     middle M1 forward messes | M2 galley 9.5-14 | M3 messes, jeer drumhead 23.5 | M4 main hatch |
 *            M5 main capstan 37.5 | M6 lieutenants' cabins 43-51 | M7 wardroom 51-56.7
 *     upper  U1 heads -5..-0.5 | U2 sick berth 0-7 | U3 under the forecastle | U4 waist 13-34 |
 *            U5 under the quarterdeck | U6 ante-room and sleeping cabin 42.5-47 |
 *            U7 dining cabin 47-51.5 | U8 day cabin 51.5-57.5
 *     above  F1/F2 forecastle -1.5-13 | gangways 13-34 | Q1/Q2 quarterdeck 34-48 (wheel 47.5) |
 *            Q3 captain's quarters 48-58.5 | P1 poop 48-59 | boats on the booms 16-32
 *   Cuts: 11.5 (abaft the galley), 22, 34 (break of the quarterdeck), 42.5 (admiral's
 *   bulkhead), 48 (break of the poop). Frames every 1.25 m for snapping.
 */
import { XS, mat, makeSea, props } from '../engine/index.js';
import { halfB, stemX, sternX, WL, MAST } from './warship/geom.js';
import { buildRig, buildPennant } from './warship/rig.js';
import { buildGuns, buildMesses, buildHammocks, buildNettings, buildLanterns, buildHold, buildOrlop, buildLowerDeck, buildMiddleDeck, buildUpperDecks, buildBoats, buildGear, MESS } from './warship/rooms.js';
import { buildNearBow, buildHull, buildDecks, buildBulkheads, buildPorts, buildOpenPorts, buildHead, buildStern, buildChannels, buildLadders } from './warship/hull.js';
import { buildNav } from './warship/nav.js';
import { places, castNamed } from './warship/cast.js';
import { castExtras, castFixed, castCapstan, machines, animals, buildFleet, transportLife } from './warship/life.js';

const SRC = {
  wiki: 'https://en.wikipedia.org/wiki/HMS_Victory',
  threedecks: 'https://threedecks.org/index.php?display_type=show_ship&id=17',
  topsail: 'https://www.royalnavymuseums.org.uk/news/caring-hms-victorys-fore-topsail',
  chequer: 'https://www.historyanswers.co.uk/history-of-war/hms-victory-returns-to-her-1805-colours-and-nelson-hated-them/',
  figure: 'https://www.solarnavigator.net/history/hms_victory_figurehead.htm',
  gun24: 'https://en.wikipedia.org/wiki/24-pounder_long_gun',
  visitor: 'https://www.britain-visitor.com/museums-in-britain/hms-victory',
  brodie: 'https://x.com/NatMuseumRN/status/1941361875054215283',
  rations: 'https://www.navalgazing.net/Naval-Rations-Part-1',
  jmvh: 'https://jmvh.org/article/georgian-naval-warfare-ships-and-medicine-1714-1815/',
  rmuni: 'https://en.wikipedia.org/wiki/Uniforms_of_the_Royal_Marines',
  diversity: 'https://www.royalnavymuseums.org.uk/news/victory-diversity',
  cables: 'https://www.sailingtexas.com/shmsvictoryb.html',
  capstan: 'http://margaretmuirauthor.blogspot.com/2012/11/hms-victory-captsan-turned-by-140-men.html',
  pumps: 'http://margaretmuirauthor.blogspot.com/2012/12/eighteenth-century-bilge-pumps-hms.html',
  ballast: 'http://margaretmuirauthor.blogspot.com/2012/11/hms-victorys-ballast-pig-iron-and.html',
  rudder: 'https://www.royalnavymuseums.org.uk/hms-victory-conservation-log',
  transport: 'https://www.wtj.com/archives/nelson/1805_10c.htm',
  beatty: 'https://www.gutenberg.org/ebooks/15233',
};

function captions(k) {
  const L = (d) => k.label(d);
  L({ x: 27, y: 18.2, z: 6, title: 'HMS Victory, 1805', text: 'A first rate of 104 guns, at sea about fifty miles west of Cadiz on 9 October 1805.', body: 'HMS Victory floated out at Chatham on 7 May 1765. Around 6,000 trees went into her, 90 per cent of them oak.', source: SRC.wiki, priority: 5, max: 26 });
  L({ x: 6.0, y: 42.0, z: 3, title: 'The fore topsail', text: 'The fore topsail Victory carried at Trafalgar survives: 80 feet across the foot and 54 feet deep.', body: 'Victory’s fore topsail from Trafalgar survives. It is 80 feet across the foot and 54 feet deep, and the battle left about 90 shot holes in it.', source: SRC.topsail, min: 9, priority: 2 });
  L({ x: MAST.fore, y: 21.0, z: 0.3, title: 'Yellow mast hoops', text: 'British ships painted their iron mast hoops yellow, the French and Spanish black.', body: 'British ships painted their iron mast hoops yellow, the French and Spanish black. Before battle Nelson made two British ships repaint theirs.', source: SRC.beatty, min: 22 });
  L({ x: 2.6, y: 11.2, z: -5.6, title: 'Ochre and black', text: 'Pale ochre bands along the rows of ports, black between them and black port lids.', body: 'Nelson thought the ochre too dark and asked for more white to make it paler. He died before the request reached the Admiralty.', source: SRC.chequer, min: 10, priority: 2 });
  L({ x: 18.3, y: 9.5, z: 7.2, title: 'Low in the water', text: 'Her lowest gunports were only 4 ft 6 in (1.4 m) above the sea, so in rough weather they stayed shut.', body: 'Victory always sat low. Her lowest gunports were only 4 ft 6 in (1.4 m) above the sea, so in rough weather they stayed shut.', source: SRC.wiki, min: 30 });
  L({ x: 44, y: 1.6, z: 3.6, title: 'Copper bottom', text: 'Below the waterline she wears copper against shipworm and weed.', body: 'Below the waterline she wears copper: 3,923 sheets were fitted in 1780 against shipworm and weed.', source: SRC.wiki, min: 10, priority: 1 });
  L({ x: -4.9, y: 12.4, z: 0, title: 'The figurehead', text: 'Two cupids holding the royal arms beneath a crown, carved in 1801 to 1803.', body: 'The 1801 to 1803 figurehead: two cupids holding the royal arms beneath a crown. The 1765 original, with figures of four continents, was far grander.', source: SRC.figure, min: 24 });
  L({ x: -2.2, y: 13.3, z: 2.2, title: 'The heads', text: 'Out on the beakhead: six seats of ease for more than 600 sailors and marines.', body: 'Out on the beakhead: six seats of ease for more than 600 sailors and marines. Officers had their own heads aft.', source: SRC.jmvh, min: 28 });
  L({ x: 5.4, y: 13.8, z: 1.4, title: 'Sick berth', text: 'Forward on the upper deck, by the door to the heads. Patients lie in cots slung over the guns.', body: 'Since 1795 lemon juice has gone into the grog against scurvy. By 1804 the Navy used about 230,000 litres a year.', source: SRC.jmvh, min: 28 });
  L({ x: 11.6, y: 12.35, z: 0.3, title: 'The galley', text: 'The Brodie stove: one galley cooked for more than 800 men, each getting one hot meal a day.', body: 'Deep on the middle gun deck stands the Brodie stove, a cast-iron range introduced in 1781. It could boil, bake, grill and even distil seawater.', source: SRC.brodie, min: 24, priority: 2 });
  L({ x: 11.5, y: 9.6, z: 5.6, title: '32-pounders', text: 'Thirty 32-pounders line the lower deck.', body: 'Thirty 32-pounders line the lower deck. Each Blomefield barrel weighs about 56 hundredweight (2.85 tonnes) and is 9 ft 6 in long.', source: SRC.threedecks, min: 34 });
  L({ x: 22.3, y: 11.7, z: 5.4, title: '24-pounders', text: 'Twenty-eight long 24-pounders on the middle deck. Each needed about 12 men and a powder boy.', body: 'Twenty-eight long 24-pounders stand on the middle deck. Each needed a crew of about 12 men and a powder boy.', source: SRC.gun24, min: 34 });
  L({ x: 12.5, y: 9.5, z: 2.6, title: 'The lower gun deck', text: 'It is 186 feet (56.7 m) long, and the ship almost 52 feet (15.8 m) wide.', body: 'Her lowest gun deck is 186 feet (56.7 m) long, and she is almost 52 feet (15.8 m) wide.', source: SRC.wiki, min: 22 });
  L({ x: 20.0, y: 10.0, z: 2.2, title: 'Messes between the guns', text: 'At meal times more than 600 men ate on this deck, and at night 460 slept here in hammocks.', body: 'At meal times more than 600 men ate on this deck, and at night 460 slept here in hammocks.', source: SRC.visitor, min: 26 });
  L({ x: 16.7, y: 9.25, z: 5.0, title: 'Wednesday', text: 'A meatless day: oatmeal, butter, cheese and pease, with the daily pound of biscuit.', body: 'Wednesday is a meatless day: a pint of oatmeal, two ounces of butter, four of cheese and half a pint of pease, with the daily pound of biscuit.', source: SRC.rations, min: 40 });
  L({ x: 30.5, y: 9.75, z: 2.4, title: 'Chain pumps', text: 'Leather saucers every three feet on an endless chain lift the bilge water as men turn the cranks.', body: 'Four chain pumps clear the bilge: leather saucers every three feet on an endless chain lift the water as men turn the cranks.', source: SRC.pumps, min: 30 });
  L({ x: 23.5, y: 12.0, z: 0.6, title: 'Jeer capstan', text: 'Up to 140 men on 14 bars turned the capstans, hoisting stores, boats and yards.', body: 'Up to 140 men on 14 bars turned the capstan. It is the only surviving late 18th-century capstan, still turning in its bearings.', source: SRC.capstan, min: 30 });
  L({ x: 37.6, y: 10.1, z: 4.4, title: '22 nations', text: 'Men from at least 22 nations served in her.', body: '820 men from at least 22 nations: English, Irish, Scots and Welsh, but also Americans, Africans, Indians, Maltese, Italians, Swedes and more.', source: SRC.diversity, min: 26 });
  L({ x: 52.0, y: 9.6, z: 2.8, title: 'The gunroom', text: 'Victory’s muster lists 31 boys; powder boys were usually 12 to 14. The tiller swings overhead.', min: 34 });
  L({ x: 53.8, y: 11.7, z: 1.4, title: 'The wardroom', text: 'The senior officers’ mess, lit by the stern windows.', min: 32 });
  L({ x: 49.2, y: 13.9, z: 1.6, title: 'The admiral’s dining cabin', text: 'The admiral dined at about half past two, seldom with fewer than eight or nine at table.', body: 'The admiral dined at about half past two, seldom with fewer than eight or nine at table; captains were often invited by flag signal.', source: SRC.beatty, min: 30 });
  L({ x: 37.5, y: 15.5, z: 1.4, title: 'Divisions', text: '9.30: divisions. Any floggings happen now, with the whole crew made to watch.', min: 30 });
  L({ x: 47.5, y: 16.9, z: 0.3, title: 'The wheel', text: 'Every half hour the glass is turned and the bell struck. Eight bells end each four-hour watch.', min: 30 });
  L({ x: 52.0, y: 17.7, z: 2.0, title: 'Royal Marines', text: 'Red coats with blue facings since 1802. They pump, haul and drill, but are never sent aloft.', body: 'Since 1802 they have been the Royal Marines, with blue facings on red coats. They pump, haul and drill, but are never sent aloft.', source: SRC.rmuni, min: 30 });
  L({ x: 18.0, y: 13.4, z: 0.7, title: 'Holystoning', text: 'Scrubbing the deck with soft sandstone. On a ship of the line it could take four hours.', min: 34 });
  L({ x: 24.0, y: 16.8, z: 6.0, title: 'Hammock nettings', text: 'Before eight in the morning every hammock is lashed up and stowed in the nettings along the rails.', min: 30 });
  L({ x: 28.6, y: 13.4, z: 2.6, title: 'No uniform', text: 'Men wore "slops", ready-made clothes sold aboard. Ratings got a uniform only in 1857.', min: 40 });
  L({ x: MAST.main - 0.6, y: 55.6, z: 0.6, title: 'Mastheaded', text: 'Midshipmen were rarely flogged. A young gentleman might instead be sent to sit at the masthead.', min: 22 });
  L({ x: 18.8, y: 7.4, z: 2.6, title: 'Cable tiers', text: 'Six anchor cables, each 24 inches round and 600 feet long, are coiled here.', body: 'Six anchor cables, each 24 inches round and 600 feet long, are coiled here. It took 40 men to coil a wet one.', source: SRC.cables, min: 28 });
  L({ x: 37.8, y: 7.5, z: 0.8, title: 'The cockpit', text: 'The midshipmen’s berth, where the orlop’s headroom is just 5 feet (1.5 m) under the beams. In battle, the surgeon’s station.', body: 'Twelve days later, at Trafalgar, Nelson was shot on the quarterdeck about 1.15 pm and carried here with a handkerchief over his face. He died at 4.30. His body was kept in a cask of brandy.', source: SRC.beatty, min: 30 });
  L({ x: 42.4, y: 7.6, z: 1.4, title: 'Surgeon’s dispensary', text: 'The surgeon visits the sick twice a day, keeps a journal of every case and gives the captain a daily sick list.', min: 36 });
  L({ x: 10.8, y: 4.9, z: 1.0, title: 'Grand magazine', text: 'Powder barrels in a copper-lined room, with a filling room where cartridges are made up.', body: 'In the 1800 to 1803 rebuild the powder magazine was lined with copper, against sparks and rats.', source: SRC.wiki, min: 26 });
  L({ x: 18.6, y: 2.2, z: 0.5, title: 'The hold', text: 'Water and beer casks bedded in shingle over pig-iron ballast.', body: 'About 257 tons of pig-iron ballast lie in the bottom of the hold under loose shingle, which beds the water casks.', source: SRC.ballast, min: 24 });
  L({ x: 55.6, y: 4.0, z: 0, title: 'The rudder', text: 'Nearly 12 metres tall: four upright timbers of oak and pitch pine held by copper bolts.', body: 'The rudder is nearly 12 metres tall: four upright timbers of oak and pitch pine held by copper bolts.', source: SRC.rudder, min: 10, priority: 1 });
  L({ x: -47, y: 26, z: 34, title: 'A transport', text: 'Bringing bread and wine to the fleet. Emptied, she hoists her ensign at the masthead to take back casks and staves.', body: 'Transports bring bread and wine to the fleet. An emptied transport hoists her ensign at the masthead to take back empty casks and staves.', source: SRC.transport, min: 0, priority: 1 });
}

function build(k) {
  k.data = {};
  buildHull(k);
  buildNearBow(k);
  buildDecks(k);
  buildBulkheads(k);
  buildPorts(k);
  buildHead(k);
  buildStern(k);
  buildChannels(k);
  buildLadders(k, props);
  k.data.aloft = buildRig(k);
  k.data.ports = buildOpenPorts(k);
  k.data.guns = buildGuns(k);
  buildMesses(k);
  buildGear(k);
  k.data.hammocks = buildHammocks(k);
  k.data.nettings = buildNettings(k);
  buildLanterns(k);
  buildHold(k);
  buildOrlop(k);
  buildLowerDeck(k);
  buildMiddleDeck(k);
  k.data.upper = buildUpperDecks(k);
  buildBoats(k);
  k.data.fleet = buildFleet(k);
  // Stern lanterns of the nearer ships of the fleet.
  for (const [x, z] of [[-104, 260], [100, 420], [235, 330]]) k.lamp(x, 18, z, { r: 2, i: 0.6, color: '#ffd080', halo: 3.2 });
  // The sea, with a cut face where the section passes through it.
  const inside = (x, z) => Math.abs(z) < halfB(x, WL) + 0.15 && x > stemX(WL) - 0.3 && x < sternX(WL) + 0.3;
  k.object(makeSea({ level: WL, x0: -80, x1: 150, detailX0: -40, detailX1: 110, step: 1.2, mask: inside, maskBox: [-4, 0, 60, 10], deep: '#2a5a76', shallow: '#3f7c90', amp: 1 }));
  for (let y = -8; y < WL - 1e-6; y += 0.5) {
    const y1 = Math.min(WL, y + 0.5);
    if (y1 <= 0) { k.sheet(-400, 400, y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 }); continue; }
    k.sheet(-400, Math.min(stemX(Math.max(0, y)), stemX(y1)), y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 });
    k.sheet(Math.max(sternX(Math.max(0, y)), sternX(y1)) + 1.9, 400, y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 });
  }
  captions(k);
  void mat;
}

function setup(W, stage, k) {
  const D = k.data;
  const r = k.rng('crew');
  // Ports open by day; hammocks slung at night and stowed in the nettings by day.
  const H = D.hammocks.part, N = D.nettings, ports = D.ports;
  W.addMachine(() => { ports.visible = W.sun().day > 0.5; const h = W.hour; const slung = h >= 19.9 || h < 7.6; H.visible = slung; N.visible = !slung; });
  const pen = buildPennant(k);
  W.addMachine((dt, t) => { pen.forEach((g, i) => { g.rotation.y = Math.sin(t * 3.1 - i * 0.8) * 0.18; g.rotation.z = Math.sin(t * 2.3 - i * 0.6) * 0.06 - 0.03; }); });

  const nav = buildNav(W, D.aloft);
  const S = places(nav, D.aloft);
  const seats = [];
  for (const T of MESS) for (const s of T.seats) seats.push(Object.assign({ deck: T.deck }, s));
  const hams = { lower: D.hammocks.anchors.lower.map((a) => Object.assign({}, a)), middle: D.hammocks.anchors.middle.map((a) => Object.assign({}, a)), gunroom: D.hammocks.anchors.gunroom };
  castNamed(W, S, seats, hams, r);
  castExtras(W, S, seats, hams, nav, r);
  castFixed(W, S, D.upper.sick, r);
  castCapstan(W, r, { x: 23.5 });
  machines(W, k, stage);
  animals(W, k);
  transportLife(W, k, D.fleet, r);
  settle(W);

  // Galley smoke and steam; spray at the bow and in the wake.
  W.emitter({ kind: 'smoke', x: 12.85, y: 16.9, z: 0.3, rate: 2.5, w: 0.3, d: 0.3, vx: -0.6, size: [0.4, 3.2], color: '#8a8580', when: [4.5, 19.5] });
  W.emitter({ kind: 'smoke', x: 12.85, y: 16.9, z: 0.3, rate: 0.6, w: 0.3, d: 0.3, vx: -0.4, size: [0.3, 2.0], color: '#7a7570', when: [19.5, 4.5] });
  for (const x of [10.85, 12.3]) W.emitter({ kind: 'steam', x, y: 12.4, z: 0.25, rate: 1.4, w: 0.6, d: 0.4, size: [0.2, 1.1], when: [5, 13.5] });
  W.emitter({ kind: 'spray', x: -1.2, y: WL + 0.2, z: 2.5, w: 1.5, d: 3, rate: (w) => 2 + 3 * Math.max(0, Math.sin(w.time * 0.6)), vx: -1.4, vy: 1.6 });
  W.emitter({ kind: 'spray', x: 57.5, y: WL + 0.1, z: 3.5, w: 3, d: 4, rate: 1.2, vx: 1.2, vy: 0.6, size: [0.3, 1.0] });

  // Sound: the sea and wind in the rigging, the bell, the galley fire, pumps, timbers.
  W.sound({ kind: 'bell', ship: true, x: 11.1, y: 16.6, z: 0, r: 60, gain: 0.3, hz: 620 });
  W.sound({ kind: 'fire', x: 10.0, y: 11.0, z: 0.6, r: 6, gain: 0.3 });
  W.sound({ kind: 'machine', x: 30.5, y: 9.2, z: 2.4, r: 10, gain: 0.25, pitch: 340, rate: (w) => (w.data.pumping ? 2.4 : 0) });
  for (const [x, y] of [[20, 9.4], [40, 11.5], [12, 7.2], [50, 13.6]]) W.sound({ kind: 'creak', x, y, z: 3, r: 16, gain: 0.22, rate: 0.25 });
  W.sound({ kind: 'gulls', x: 30, y: 34, z: 18, r: 80, gain: 0.25, when: 'day' });

  // Guided tour.
  W.stop({ x: 20, y: 26, z: 3, w: 92, title: 'HMS Victory, 9 October 1805', text: 'Nelson’s flagship keeps the sea fifty miles west of Cadiz, with the enemy fleet in harbour and out of sight. Inside her live more than eight hundred men. Zoom in anywhere, or click someone to follow them.', hold: 11, hour: 10 });
  W.stop({ x: 2.5, y: 12.6, z: 2.5, w: 20, title: 'The head', text: 'Forward, the sick lie in cots slung over the guns. Beyond the bulkhead, out on the beakhead above the figurehead, are six seats of ease for more than 600 sailors and marines.', hold: 10, hour: 10.2 });
  W.stop({ x: 17, y: 11.3, z: 3, w: 21, title: 'Galley and messes', text: 'Noon: the Brodie stove has boiled dinner for the whole ship, and the mess cooks carry it to tables slung between the guns. Today is Wednesday, a day without meat.', hold: 11, hour: 12.2 });
  W.stop({ x: 28, y: 10.2, z: 3, w: 19, title: 'Pumps and capstan', text: 'Landsmen and marines turn the chain-pump cranks, while on the deck above men walk round the capstan bars to sway stores aboard.', hold: 10, hour: 10.5 });
  W.stop({ x: 31, y: 5.4, z: 2.5, w: 28, title: 'Below the waterline', text: 'The orlop holds the cables, sails and stores, the surgeon and the cockpit. Beneath it the hold is packed with casks bedded in shingle over iron ballast.', hold: 11, hour: 11 });
  W.stop({ x: 11, y: 5.0, z: 2, w: 13, title: 'The grand magazine', text: 'Lined with copper in the rebuild of 1800 to 1803, against sparks and rats. Here the yeoman of the powder room fills cartridges.', hold: 9, hour: 9.5 });
  W.stop({ x: 51, y: 14.2, z: 2.5, w: 17, yaw: 0.5, pitch: 0.12, title: 'The admiral’s cabins', text: 'Aft on the upper deck are the admiral\u2019s cabins, with the captain\u2019s above them under the poop, all lit by the stern windows. The admiral dines at about half past two.', hold: 11, hour: 14.6 });
  W.stop({ x: 29, y: 37, z: 0, w: 30, yaw: 0.72, pitch: 0.13, title: 'Aloft', text: 'Topmen work on the yards high above the deck. A midshipman sits alone at the main masthead, sent there as a punishment.', hold: 10, hour: 10.8 });
  W.stop({ x: 24, y: 10.3, z: 2.5, w: 19, title: 'Hammocks', text: 'Each man\u2019s hammock space was about 14 inches (36 cm) wide. One watch sleeps while the other keeps the deck, so a sleeper often had his neighbour\u2019s space too.', hold: 11, hour: 22.5 });
  W.stop({ x: 22, y: 22, z: 3, w: 88, title: 'Night at sea', text: 'Stern lanterns burn and the galley fire is banked. Midnight: eight bells, and the middle watch comes on deck.', hold: 12, hour: 23.9 });
}

// Put everyone where their routine has them at the starting hour, so the ship opens mid-day
// rather than with the whole crew walking from their hammocks.
function settle(W) {
  const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
  for (const p of W.people) {
    if (!p.routine) continue;
    const i = p.routine.findIndex((st) => !st.when || inH(W.hour, st.when[0], st.when[1]));
    if (i < 0) continue;
    const st = p.routine[i];
    const pos = W.resolve(st.at);
    p.x = pos.x; p.y = pos.y; p.z = pos.z;
    p.step = i; p.stepT = 0; p.stepDur = 4 + (p.ph % 1) * 10; p.moving = false; p.path = null; p.node = null;
    p.anim = st.act || 'stand';
    if (st.prop !== undefined) p.prop = st.prop;
    p.seat = st.seat != null ? st.seat : null;
    if (st.face != null) p.heading = p.targetHeading = XS.faceToHeading(st.face);
  }
}

function update(W) {
  // Now and then at night a distant ship burns a blue light (fleet signals by night [S8]).
  W.data.blueOn = W.sun().night > 0.6 && (W.time % 47) < 4;
}

XS.scenes.register({
  id: 'warship', order: 30, title: 'The Man-of-War', subtitle: 'HMS Victory off Cadiz, October 1805',
  blurb: 'More than eight hundred men on five decks, a hundred guns and a forest of rigging, twelve days before Trafalgar.',
  bounds: { x0: -26, x1: 68, y0: -6, y1: 72, z0: 0, z1: 22 },
  frame: { x0: -24, x1: 64, y0: -2, y1: 40, z0: 0, z1: 8 },
  startHour: 10,
  daySeconds: 1440,
  view: { yaw: -0.36, pitch: 0.1 },
  wind: -3,
  clouds: 0.42,
  fog: [220, 1600, 0.6],
  focusDepth: 2.5,
  lampGain: 1.15,
  suggestedCuts: [11.5, 22, 34, 42.5, 48],
  cutRange: [-4, 60],
  sliceGap: 6,
  snapCut(x) {
    for (const c of [11.5, 22, 34, 42.5, 48]) if (Math.abs(x - c) < 1.2) return c;
    return Math.round(x / 1.25) * 1.25;
  },
  ambience: { sea: 0.55, wind: 0.5, crowd: 0.22, room: 0.12, reverb: 0.25, size: 1.0 },
  halos(list, W) {
    if (W.data.blueOn) { const f = 0.7 + 0.3 * Math.sin(W.time * 13); list.push({ x: 100, y: 22, z: 420, r: 9, color: '#7aa8ff', a: 0.9 * f }); }
  },
  build, setup, update,
});
