/* The Atlantic Liner: RMS Queen Mary on a westbound crossing, third day out, August 1938.
 *
 * Sources: docs/research/liner.md (Queen Mary dossier, source keys S1..S76).
 *
 * Layout plan (metres; x from the stem, bow at the left; y above the keel; z behind the
 * centreline cut, the starboard half is built from z = 0 to the plating at about z = 18):
 *   Decks (floor heights, dossier 2): tank top 1.8, H 4.6, G 7.4, F 10.2, waterline 11.8,
 *   E 13.0, D 15.8, C 18.6, B 21.5, A 24.4, Main 27.3, Promenade 30.3, Sun 33.7,
 *   Sports 36.6, wheelhouse 38.6, compass platform 41.1. Funnels to 55.2 / 54.3 / 52.7,
 *   foremast to 71.3 with the crow's nest at 50.5.
 *   x 0-48     forecastle and anchor gear, No. 1 hold (mail), No. 2 hold (cars), crew
 *              quarters, lamp room, carpenter, specie room; well deck and foremast 30-55.
 *   x 48-92    Third Class: cabins E to Main deck, galley and dining room, cinema and
 *              library, synagogue, playroom, smoking room, Garden Lounge; Observation
 *              Bar on the Promenade deck; gym, wireless, squash on the Sun deck; officers
 *              and the wheelhouse above.
 *   x 92-176   boiler rooms 1-5 and two turbo-generator rooms (tank top to E deck); cold
 *              stores and engineers on E deck; the Cabin Class pool, working alleyway and
 *              hospital on D deck; Main Restaurant and kitchens on C deck; staterooms on
 *              B, A and Main decks; the Main Hall, Main Lounge, Long Gallery and Ballroom
 *              on the Promenade deck; funnels, lifeboats, tennis courts and kennels above.
 *   x 176-222  forward and after engine rooms; Tourist dining room; Smoking Room.
 *   x 222-311  engineers' lift; shaft tunnels; Tourist pool and gymnasium; Tourist cabins,
 *              lounge and smoking room; Verandah Grill; Pig and Whistle; isolation wards;
 *              steering gear; propellers and rudder.
 *   Room positions along the hull are layout estimates (dossier 3a); see liner/rooms.js.
 *   Suggested cuts at the dossier's six slices: 52, 92, 154, 199, 250.
 */
import { XS, THREE, makeSea, glowMaterial, mat } from '../engine/index.js';
import { LOA, WL, DK, BULKHEADS, FUNNELS, FOREMAST_X } from './liner/shape.js';
import { buildHull, buildWater, buildFunnels, buildMasts, buildBoats, buildDeckGear } from './liner/hull.js';
import { buildRooms, ROOMS } from './liner/rooms.js';
import { buildMachinery, stripedShaft, propeller, fan, SHAFTS, SHAFT_Y } from './liner/machinery.js';
import { buildNav, buildPeople, updatePeople } from './liner/people.js';
import { dog } from './liner/furn.js';

const room = (kind, i = 0) => ROOMS.filter((r) => r.kind === kind)[i];

function build(k) {
  buildHull(k);
  buildWater(k, makeSea);
  buildFunnels(k);
  buildMasts(k);
  buildBoats(k);
  buildDeckGear(k);
  buildRooms(k);
  buildMachinery(k);
  captions(k);
}

// ------------------------------------------------------------------ captions
const SRC = {
  wiki: 'https://en.wikipedia.org/wiki/RMS_Queen_Mary',
  guide: 'https://www.queenmary.com/files/6994/QM24_Guide_Map_July_ADA.pdf',
  p16: 'https://www.shippingwondersoftheworld.com/part16.html',
  eng: 'https://www.shippingwondersoftheworld.com/queen_marys_engines.html',
  v: (p) => 'https://www.sterling.rmplc.co.uk/visions/' + p + '.html',
};
function captions(k) {
  const L = (d) => k.label(d);
  const r = (kind, i) => room(kind, i);
  // Whole-ship captions (shown in the margins at the overview).
  L({ x: 150, y: 12.5, z: 0, title: 'RMS Queen Mary', max: 9, text: '310.7 metres long and 36 metres wide, with 12 decks.', priority: 5, side: 'left',
    body: 'Queen Mary is 310.7 metres (1,019 feet) long and 36 metres (118 feet) wide, with 12 decks. Her keel was laid at John Brown’s yard on the Clyde in December 1930, but the Depression stopped work for over two years; until her launch in 1934 she was known only as “Hull 534”.', source: SRC.wiki });
  L({ x: 30, y: 40, z: 0, title: 'Westbound, August 1938', max: 9, min: 7, text: 'That month she crossed westbound at 30.99 knots to win the Blue Riband.', priority: 4, side: 'left', body: 'In August 1938 Queen Mary took the westbound Blue Riband, crossing from Bishop Rock to Ambrose Light at an average of 30.99 knots.', source: 'https://en.wikipedia.org/wiki/Blue_Riband' });
  L({ x: 110, y: 50, z: 0, title: 'Three funnels', text: 'Each is an oval 36 feet long and over 23 feet wide; the forward one stands 181 feet above the keel.', priority: 4, body: 'Each of the three funnels is elliptical, about 36 feet fore and aft and over 23 feet wide. The top of the forward funnel is 181 feet above the keel. They are painted Cunard red with black tops.', source: SRC.guide });
  L({ x: FOREMAST_X, y: 51.5, z: 0, title: 'Crow’s nest', text: 'The lookout climbs 110 steps inside the hollow steel foremast to a nest 130 feet above the waterline.', priority: 3, body: 'The lookout climbs 110 steps inside the hollow steel foremast to the crow’s nest, 130 feet above the waterline, where a glass weather screen shelters him.', source: SRC.p16 });
  L({ x: 72, y: 22, z: 2, title: 'Third Class', min: 7, text: 'In 1936 to 1939 the classes were Cabin, Tourist and Third. Third Class lived in the forward part of the ship.', priority: 3, side: 'left', body: 'From 1936 to 1939 the best class aboard was called Cabin Class, the second Tourist and the lowest Third. Third Class had its entrance, stairs and public rooms in the forward part of the ship.', source: SRC.v('3clp') });
  L({ x: 140, y: 6, z: 3, title: 'Boiler rooms', text: '24 Yarrow boilers, each about 31 feet tall with 7 oil burners: 168 flames in all.', priority: 4, body: 'Four boiler rooms each hold six Yarrow water-tube boilers, about 31 feet high, each fired by seven oil burners: 168 burners in all. A fifth, No. 1 boiler room, holds three Scotch boilers for the hotel services.', source: SRC.eng });
  L({ x: 199, y: 8, z: 3, title: 'Engine rooms', min: 7, text: 'Four turbine sets, one for each propeller shaft. The forward engine room turns the outer propellers.', priority: 3, body: 'Each of the four turbine sets has one high-pressure, two intermediate-pressure and one low-pressure turbine, driving its shaft through single-reduction gearing. The forward engine room drives the two outer shafts, the after engine room the two inner ones.', source: SRC.eng });
  L({ x: 290, y: 4, z: -4.5, title: 'Propellers', text: 'Four bronze propellers of 35 tons each, turning about three times a second at top speed.', priority: 4, side: 'right', body: 'Each four-bladed propeller weighs 35 tons; the rough casting weighed 53 tons and took ten days to cool. At top speed they turn about three times every second.', source: 'https://wondersofworldengineering.com/propellers.html' });
  L({ x: 236, y: 35.2, z: 2, title: 'Verandah Grill', min: 7, text: 'Seats 80 and looks out over the wake. Late at night it becomes the Starlight Club.', priority: 3, side: 'right', body: 'The Verandah Grill, at the after end of the Sun deck, seats 80 at tables round a sycamore dance floor, with a curved bay of windows looking aft over the sea. Late at night it becomes the “Starlight Club”.', source: SRC.v('retain1') });
  L({ x: 130, y: 22, z: 3, title: 'Main Restaurant', min: 7, text: 'Seats up to 815. On the wall a 24-foot map of the Atlantic, with a crystal model of the ship creeping towards New York.', priority: 3, body: 'The Main Restaurant runs 143 feet and seats up to 815. On its wall MacDonald Gill’s 24 by 15 foot map of the North Atlantic shows the two routes, with an illuminated crystal model of the ship moving along the track.', source: SRC.v('retain4') });
  // Room captions (shown as the viewer zooms in).
  const m = 14;
  L({ x: 21, y: 9, z: 2, title: 'No. 1 hold: the mails', text: 'Hold No. 1 carries the Royal Mail, which is why she is an RMS, a Royal Mail Ship.', min: m, body: 'The forward hold, No. 1, carried the Royal Mail, its sacks stacked deck by deck. Carrying the Royal Mail is why she is an RMS, a Royal Mail Ship.', source: SRC.v('holds') });
  L({ x: 21, y: 16.8, z: 2, title: 'Specie room', text: 'A strong room for bullion. On her maiden voyage she carried £2.5 million in gold.', min: m });
  L({ x: 60.5, y: 32, z: 2, title: 'Observation Bar', text: 'Curves round the front of the ship, with 21 windows looking dead ahead.', min: m, body: 'The Observation Bar curves round the forward end of the Promenade deck, with 21 windows looking dead ahead, a bar of Macassar ebony and a mural of the Royal Jubilee celebrations of 1935.', source: SRC.v('retain3') });
  L({ x: 64, y: 22.5, z: 2, title: 'Third Class cinema', text: 'About 120 steel-and-leather chairs in rows.', min: m });
  L({ x: 76.5, y: 23, z: 2, title: 'Synagogue', text: 'The first synagogue designed and built for a ship, dedicated in May 1936. It seats 23.', min: m, body: 'The synagogue, dedicated in May 1936, was the first designed and built for a ship. It seats 23 on cushioned pews.', source: SRC.v('retain7') });
  L({ x: 75, y: 19.6, z: 3, title: 'Third Class dining room', text: 'Seats 412 at tables for four to ten, with fresh flowers.', min: m });
  L({ x: 98.5, y: 18.6, z: 2, title: 'Cabin Class pool', text: 'Two decks high: 35 by 22 feet, 6 feet deep at one end, with diving boards and a chute.', min: m, body: 'The Cabin Class swimming pool rises through C and D decks. The basin is 35 by 22 feet, 6 feet deep forward and 4 feet aft, with two diving boards, a chute and four ladders.', source: SRC.v('1pool') });
  L({ x: 170, y: 20, z: 3, title: 'Main kitchens', text: 'Full width of the ship, drawing 1,500 kilowatts; nickel and Monel metal wherever food is touched.', min: m, body: 'The main kitchens run across the full width of the ship for about 150 feet, with a cooking load of about 1,500 kilowatts. Cabin and Tourist galleys share a bakery and confectioner’s shop.', source: SRC.v('kitchens') });
  const al = r('alley', 1);
  L({ x: al.x0 + 6, y: 17.5, z: 2, title: 'Egg store', text: 'Every day, apprentices turn all 50,000 eggs to keep the yolks centred.', min: m + 4, body: 'In the working alleyway’s stores, kitchen apprentices turned every egg each day to keep the yolks centred, and turned every lettuce leaf.', source: 'https://www.americanheritage.com/when-does-place-get-new-york' });
  const a0 = r('alley', 0);
  L({ x: a0.shopX.print, y: 17.5, z: 2, title: 'Print shop', text: 'The ship’s own presses print the daily menus and the ship’s newspaper.', min: m + 4 });
  L({ x: 271, y: 20.3, z: 2, title: 'The Pig and Whistle', text: 'The crew’s pub: a baggage space in port and a darts room at sea.', min: m, body: 'The crew bar at the after end of C deck was known as the “Pig and Whistle”. In port the space held baggage; at sea it was a place for a pint and a game of darts.', source: SRC.v('pig') });
  const s1 = r('smoke1');
  L({ x: (s1.x0 + s1.x1) / 2, y: 32.6, z: s1.d - 1.0, title: 'A coal fire at sea', text: 'The Smoking Room fireplace has a dog-grate burning real coal, the only fire of its kind aboard.', min: m, body: 'In an oil-fired ship, the Cabin Class Smoking Room kept a travertine fireplace with a dog-grate that burned real coal.', source: SRC.v('retain6') });
  L({ x: 132, y: 33, z: 2, title: 'Main Lounge', text: 'A full stage and a Steinway grand in makore veneer. On Sundays it becomes the church.', min: m, body: 'The Main Lounge has a stage with a 26 by 22 foot proscenium and a Steinway grand piano veneered in makore. It served for concerts, teas, films and dancing, and on Sundays for divine service with the Commodore presiding.', source: SRC.v('1loun') });
  L({ x: 74, y: 31.6, z: 3, title: 'Enclosed promenade', text: 'Deck chairs, cushions and rugs could be hired for five shillings each. Soup at 11, tea at 4.', min: m, body: 'The 1936 passenger lists tell passengers that deck chairs, cushions and rugs can be hired from the deck steward, and that soup is served on deck at 11 in the morning and tea at 4 in the afternoon.', source: 'https://www.ggarchives.com/OT/PLs/Cunard/QueenMary-PassengerList-1936-08-05.html ; https://www.ggarchives.com/OT/PLs/Cunard/QueenMary-PassengerList-1936-09-02.html' });
  L({ x: 236, y: 11.4, z: 2, title: 'Tourist pool', text: 'Deep in the hull on F deck: a 33-foot pool of ivory tiles banded in blue.', min: m });
  L({ x: 63.5, y: 35.2, z: 2, title: 'Gymnasium', text: 'Electric riding horses, rowing machines and a punch ball, under caricatures by Tom Webster.', min: m });
  L({ x: 160, y: 38.2, z: 16, title: 'Lifeboats', text: '24 boats, each with a diesel engine, can carry 3,266 people in all.', min: 8, body: 'Queen Mary carried 24 lifeboats in gravity davits, most 36 by 12 feet and each with a diesel engine; together they could carry 3,266 people.', source: SRC.v('lifeboats') });
  L({ x: 72.5, y: 35.2, z: 2, title: 'Wireless', text: 'Over 11 tons of transmitters and receivers. A call to Britain costs £3 12s for three minutes.', min: m });
  L({ x: 137.5, y: 37.8, z: 4, title: 'Kennels', text: 'Room for 26 dogs, with an 80-foot run and even a lamppost to make them feel at home.', min: 10, body: 'Kennels for 26 dogs stood on the Sports deck just forward of the second funnel, with an exercise run over 80 feet long and a lamppost. Dogs were handed to the livestock attendant; bell boys earned tips walking them.', source: SRC.v('kenn') });
  L({ x: 63, y: 39.8, z: 2, title: 'Wheelhouse', text: 'The first ship with twin steering wheels; telegraphs signal each of the four shafts separately.', min: 10, body: 'Queen Mary was the first ship fitted with two steering wheels in her wheelhouse, so that if one failed the other could take over in moments. Engine telegraphs on the bridge could signal each of the four propeller shafts separately.', source: SRC.p16 + ' ; ' + SRC.v('wlhse') });
  L({ x: 98, y: 7, z: 2, title: 'No. 1 boiler room', text: 'Three Scotch boilers just for hotel services, heating and laundry.', min: m });
  L({ x: 158, y: 6, z: 2, title: 'Turbo-generators', text: 'Seven sets make 9,100 kilowatts: enough, it was said, for a town of 100,000.', min: m });
  const fer = room('engine', 0);
  L({ x: fer.x0 + 3.5, y: 9, z: 6.5, title: 'Condenser', text: '28 feet high, with 13,780 tubes, turning spent steam back into water.', min: m + 4 });
  L({ x: 297, y: 16, z: 2, title: 'Steering gear', text: 'Hydraulic rams swing the 140-ton rudder; the steering gear alone weighs 180 tons.', min: m, body: 'Four hydraulic rams, with three electric motors to drive the gear, turn the rudder stock. The rudder weighs about 140 tons and the steering gear 180 tons.', source: 'https://www.queenmary.com/exhibits.htm ; ' + SRC.eng });
  const pg = r('pig');
  L({ x: pg.x0 + 5.5, y: 18.9, z: 5.5, title: 'The ship’s cat', text: 'An invention of this drawing: no record of a cat aboard has been found.', min: 40 });
}

// ------------------------------------------------------------------ the living world
function setup(W, stage, k) {
  buildNav(W);
  buildPeople(W);
  const D = W.data;

  // Propellers (the near, port pair, drawn whole) and the shafts inside the hull.
  D.props = [];
  for (const S of [SHAFTS.inner, SHAFTS.outer]) {
    const p = k.part(S.prop, SHAFT_Y, -S.z, (q) => { q.whole = true; propeller(q); });
    D.props.push({ g: p, dir: S === SHAFTS.inner ? 1 : -1 });
  }
  const sA = mat({ c: '#9aa0a8', cut: '#4a4e54' }), sB = mat({ c: '#5a6068', cut: '#3a3e44' });
  D.shafts = [];
  for (const S of [SHAFTS.inner, SHAFTS.outer]) {
    const x1 = S === SHAFTS.inner ? 286 : 258;
    const g = k.part(S.from, SHAFT_Y, S.z, (q) => { stripedShaft(q, 0, x1 - S.from, 0.34, sA, sB, 8); stripedShaft(q, 0.4, 0.5, 0.62, sA, sB, 8); });
    D.shafts.push(g);
  }
  // Forced-draught fans high in each boiler room; turbo-generator couplings.
  D.fans = [];
  for (const r of ROOMS) if (r.kind === 'yarrow' || r.kind === 'scotch') D.fans.push(k.part(r.aisle != null ? r.aisle : (r.x0 + r.x1) / 2, r.yC - 1.5, 0.35, (q) => fan(q, 0.8)));
  D.couplings = ROOMS.filter((r) => r.kind === 'turbogen').map((r) => k.part(r.coupling[0], r.coupling[1], r.coupling[2], (q) => stripedShaft(q, 0, 0.6, 0.5, sA, sB, 6)));
  // Throttle wheels on the engine-room platforms.
  D.wheels = ROOMS.filter((r) => r.kind === 'engine').map((r) => k.part(r.wheels[0], r.wheels[1], r.wheels[2] - 0.15, (q) => {
    const br = mat({ c: '#c8a050', cut: '#7a5a2a' });
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; q.boxR(Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0, 0.05, 0.4, 0.05, br, { z: a - Math.PI / 2 }); }
    q.lathe([[0.36, -0.03], [0.42, -0.03], [0.42, 0.03], [0.36, 0.03], [0.36, -0.03]], 0, 0, br, { seg: 14, capTop: false, capBot: false });
  }));
  for (const w of D.wheels) w.rotation.x = Math.PI / 2;
  // Rudder (drawn whole) and the steering yoke.
  D.rudder = k.part(297.5, 0, 0, (q) => {
    q.whole = true;
    const red = mat({ c: '#a8402e', c2: '#963828', pat: 'plates', s: 1.0, cut: '#7a2a1e' });
    q.extrude([[0, 1.6], [6.2, 1.8], [6.4, 7.5], [5.6, 11.5], [0.4, 10.0], [0, 9.6]], -0.35, 0.35, red);
    q.cyl(0, 1.4, 0, 0.45, 9.5, red, { seg: 10 });
  });
  const st = room('steering');
  D.yoke = k.part(st.yoke[0], st.yoke[1], st.yoke[2], (q) => { q.box(-0.4, -0.3, -1.4, 0.4, 0.3, 1.4, mat({ c: '#6a6e74', cut: '#3a3e44' })); });
  // The engineers' lift car.
  const L = ROOMS.find((r) => r.kind === 'lift');
  D.liftCar = k.part((L.x0 + L.x1) / 2, DK.tt, 1.35, (q) => {
    const m = mat({ c: '#8a7a5a', c2: '#7a6a4a', pat: 'bars', s: 0.12, cut: '#4a3a2a' });
    q.box(-1.0, 0, 0.1, 1.0, 0.12, 1.0, m); q.box(-1.0, 2.15, 0.1, 1.0, 2.25, 1.0, m); q.box(-1.0, 0, 0.95, 1.0, 2.25, 1.0, m);
    q.box(-1.0, 0, 0.1, -0.95, 2.25, 1.0, m); q.box(0.95, 0, 0.1, 1.0, 2.25, 1.0, m);
  });
  D.liftY = DK.tt; D.liftStops = ['tt', 'E', 'D', 'C', 'B', 'A', 'M', 'P', 'S', 'SP'].map((s) => DK[s]); D.liftT = 0; D.liftTarget = DK.tt;
  // The crystal ship on the restaurant map, and the magnetic ship on the Tourist Smoking Room map.
  D.maps = [];
  for (const r of [room('restaurant'), room('smoke2')]) {
    const g = k.part(r.map.x0, r.map.y0, r.map.z, (q) => {
      const m = r.kind === 'restaurant' ? mat({ c: '#e8f4f8', c2: '#ffffff', glow: 'always', cut: '#a8c0c8' }) : mat({ c: '#2a2a2a', cut: '#1a1a1a' });
      q.box(-0.22, -0.05, -0.02, 0.22, 0.05, 0.0, m);
      q.box(-0.06, 0.05, -0.02, 0.06, 0.13, 0.0, m);
    });
    D.maps.push({ g, r });
  }
  // The punch ball in the gymnasium.
  const gy = room('gym');
  D.punch = k.part(gy.punch[0], gy.punch[1] + 0.2, gy.punch[2], (q) => { q.cyl(0, -0.55, 0, 0.012, 0.55, mat('#3a3a3a'), { seg: 3 }); q.sphere(0, -0.6, 0, 0.13, mat({ c: '#8a3a22', cut: '#5a2a16' }), { seg: 8, rings: 5 }); });
  // Dogs on the exercise run, and the terrier at the lamppost.
  const ken = room('kennels');
  D.dogs = [];
  const dc = ['#e8dcc8', '#2a2622', '#c8a070'];
  for (let i = 0; i < 3; i++) D.dogs.push(k.part(0, ken.yF, 0, (q) => dog(q, 0, 0, 0, dc[i], i === 2 ? 1.25 : 0.8, 1)));
  D.terrier = k.part(ken.post[0] + 0.45, ken.yF, ken.post[2] + 0.1, (q) => dog(q, 0, 0, 0, '#f2ece0', 0.75, -1));
  D.ken = ken;
  // The cat (an invention, flagged in its caption): asleep by day, prowling the Pig and Whistle at night.
  const pg = room('pig');
  D.cat = k.part(pg.x0 + 5, pg.yF, 5.6, (q) => {
    const c = mat({ c: '#3a3430', cut: '#2a2420' });
    q.sphere(0, 0.12, 0, 0.12, c, { seg: 7, rings: 5 }); q.sphere(0.15, 0.2, 0, 0.07, c, { seg: 6, rings: 4 }); q.cyl(-0.12, 0.13, 0, 0.015, 0.22, c, { axis: 'x', seg: 4, r2: 0.01 });
  });
  D.catHome = [pg.x0 + 5, pg.yF, 5.6];
  // The forward funnel floodlit from the compass platform at night.
  const f1 = FUNNELS[0];
  const beamGeo = new THREE.CylinderGeometry(4.5, 0.25, 1, 18, 1, true);
  beamGeo.translate(0, 0.5, 0);
  const beam = new THREE.Mesh(beamGeo, glowMaterial(0xfff0d0));
  const a = new THREE.Vector3(62, DK.CP + 1.3, -1.0), b = new THREE.Vector3((f1.x0 + f1.x1) / 2 + 0.8, 47, -1.0);
  const dir = new THREE.Vector3().subVectors(b, a);
  beam.position.copy(a);
  beam.scale.set(1, dir.length(), 1);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  beam.frustumCulled = false;
  k.object(beam, { overlay: true });
  D.beam = beam;

  // Machines: everything turns at plausible speeds.
  W.addMachine((dt, t, w) => {
    const rev = 3.0 * Math.PI * 2; // about three revolutions a second at speed
    for (const p of D.props) p.g.rotation.x = p.dir * t * rev;
    for (const s of D.shafts) s.rotation.x = t * rev;
    for (const f of D.fans) f.rotation.z = t * 9;
    for (const c of D.couplings) c.rotation.x = t * 14;
    const steer = Math.sin(t * 0.21) * 0.03 + Math.sin(t * 0.53) * 0.012;
    D.rudder.rotation.y = steer;
    D.yoke.rotation.y = steer;
    D.wheels.forEach((wh, i) => { wh.rotation.y = Math.sin(t * 0.08 + i * 2) > 0.92 ? t * 1.5 : wh.rotation.y; });
    // Maps: the ship creeps about 1/100 of the track per hour; third day out.
    const prog = 0.45 + (w.hour / 24) * 0.24;
    for (const m of D.maps) { m.g.position.x = m.r.map.x0 + (m.r.map.x1 - m.r.map.x0) * prog; m.g.position.y = m.r.map.y0 + (m.r.map.y1 - m.r.map.y0) * prog; }
    D.punch.rotation.z = Math.sin(t * 7) * 0.5 * (Math.sin(t * 0.4) > 0 ? 1 : 0.15);
    // The lift follows an engineer riding it, otherwise works between decks.
    let rider = null;
    for (const p of w.people) if (p.moving && Math.abs(p.x - w.data.liftX) < 0.5 && Math.abs(p.z - 1.3) < 0.5) { rider = p; break; }
    if (rider) D.liftY = rider.y;
    else {
      D.liftT -= dt;
      if (D.liftT <= 0) { D.liftTarget = D.liftStops[Math.floor((Math.sin(t * 12.9898) * 0.5 + 0.5) * D.liftStops.length) % D.liftStops.length]; D.liftT = 14; }
      D.liftY += Math.max(-dt * 1.4, Math.min(dt * 1.4, D.liftTarget - D.liftY));
    }
    D.liftCar.position.y = D.liftY;
    // Dogs: exercised on the run in the morning and when Billy walks them in the afternoon.
    const out = XS.math.inHours(w.hour, 8, 10) || XS.math.inHours(w.hour, 15, 16);
    D.dogs.forEach((g, i) => {
      g.visible = out;
      const ph = t * 0.42 + i * 0.5;
      g.position.set(D.ken.x0 + 4.5 + Math.cos(ph) * 3.4, D.ken.yF, 5.0 + Math.sin(ph) * 1.4);
      g.rotation.y = -ph - Math.PI / 2;
    });
    // The cat: curled up by day, prowling the crew bar at night.
    const night = !XS.math.inHours(w.hour, 6, 21);
    D.cat.position.set(D.catHome[0] + (night ? Math.sin(t * 0.15) * 3 : 0), D.catHome[1], D.catHome[2]);
    D.cat.rotation.y = night && Math.cos(t * 0.15) < 0 ? Math.PI : 0;
    // Floodlight on the forward funnel at night.
    const n = w.sun().night;
    D.beam.visible = n > 0.5;
    D.beam.material.uniforms.uIntensity.value = 0.45 * Math.min(1, (n - 0.5) * 3);
  });

  // Emitters: funnel smoke, bow wave and wake, propeller wash, galley steam, the coal fire.
  for (const F of FUNNELS) {
    const cx = (F.x0 + F.x1) / 2 + (F.top - DK.S) * 0.07;
    W.emitter({ kind: 'smoke', x: cx, y: F.top + 0.3, z: 0, w: 6, d: 4, rate: 8, vy: 2.4, life: 13, size: [2.5, 14], color: '#5c554f', alpha: 0.78, when: 'always' });
  }
  W.emitter({ kind: 'spray', x: 3.5, y: WL + 0.3, z: 2.5, w: 2, d: 5, rate: 9, vx: -3, vy: 2.4, when: 'always' });
  W.emitter({ kind: 'spray', x: 314, y: WL + 0.1, z: 3, w: 8, d: 6, rate: 7, vx: 3.5, vy: 1.2, when: 'always' });
  for (const S of [SHAFTS.inner, SHAFTS.outer]) W.emitter({ kind: 'bubble', x: S.prop + 2, y: SHAFT_Y, z: -S.z, w: 2, d: 4, rate: 10, vx: 3, vy: 0.6, when: 'always' });
  const kit = room('kitchen');
  W.emitter({ kind: 'steam', x: kit.x0 + 15, y: kit.yF + 1.2, z: kit.d - 1.6, w: 4, d: 0.5, rate: 2.5, when: [6, 22] });
  const g3 = room('galley3');
  W.emitter({ kind: 'steam', x: g3.x0 + 12, y: g3.yF + 1.0, z: g3.d - 1.4, w: 2.4, d: 0.4, rate: 1.5, when: [6, 20] });
  const s1 = room('smoke1');
  W.emitter({ kind: 'ember', x: s1.fire[0], y: s1.fire[1], z: s1.fire[2], w: 0.6, d: 0.2, rate: 0.8, when: 'always' });

  // Sound.
  for (const r of ROOMS) {
    if (r.kind === 'engine') W.sound({ kind: 'engine', x: (r.x0 + r.x1) / 2, y: 6, z: 4, r: 30, gain: 0.5, hz: 36 });
    if (r.kind === 'turbogen') W.sound({ kind: 'hum', x: (r.x0 + r.x1) / 2, y: 4, z: 3, r: 14, gain: 0.25, hz: 100 });
    if (r.kind === 'yarrow' && r.n === 3) W.sound({ kind: 'fire', x: r.aisle, y: 4, z: 2, r: 30, gain: 0.45 });
    if (r.kind === 'kitchen') W.sound({ kind: 'machine', x: (r.x0 + r.x1) / 2, y: 20, z: 3, r: 20, gain: 0.25, rate: 3, pitch: 900 });
  }
  W.sound({ kind: 'band', x: room('ballroom').x1 - 2, y: 31, z: 3, r: 22, gain: 0.45, bpm: 96, when: [16.8, 18] });
  W.sound({ kind: 'band', x: room('verandah').x0 + 6, y: 35, z: 3, r: 22, gain: 0.45, bpm: 108, when: [22, 1.5] });
  W.sound({ kind: 'bell', x: 63, y: 39, z: 2, r: 40, gain: 0.25, hz: 640, ship: true });
  W.sound({ kind: 'fire', x: s1.fire[0], y: s1.fire[1], z: s1.fire[2], r: 6, gain: 0.25 });

  // Guided tour.
  W.stop({ x: LOA / 2, y: 30, z: 4, w: 330, title: 'A floating town', text: 'RMS Queen Mary, third day out from Southampton, westbound for New York in August 1938. She has room for 2,140 passengers in three classes and a crew of about 1,100, in a hull over 300 metres long.', hold: 11, hour: 11 });
  W.stop({ x: 60, y: 42, z: 2, w: 46, title: 'The bridge and the crow’s nest', text: 'A quartermaster steers at one of two wheels; the officer of the watch keeps his four hours; high on the foremast the lookout watches the horizon behind his glass screen.', hold: 10 });
  W.stop({ x: 70, y: 22, z: 2, w: 44, title: 'Third Class, forward', text: 'Cabins for two and four, a dining room for 412, a cinema, a synagogue and a playroom, with the galley below and the crew’s quarters further forward still.', hold: 11, hour: 12.4 });
  W.stop({ x: 132, y: 23, z: 3, w: 56, title: 'The heart of the ship', text: 'Luncheon in the Main Restaurant, with the crystal ship creeping across its map; the pool two decks high; the kitchens beyond; and the working alleyway where the eggs are turned and the menus printed.', hold: 12, hour: 13.4 });
  W.stop({ x: 160, y: 7, z: 4, w: 80, title: 'Steam', text: 'Below the waterline, 24 oil-fired boilers in four rooms make steam for four turbine sets. Firemen tend 168 burners; engineers watch the gauges at the throttle wheels.', hold: 12 });
  W.stop({ x: 272, y: 9, z: 1, w: 66, title: 'Shafts, propellers and rudder', text: 'Four shafts run aft through the tunnels to four bronze propellers, turning about three times a second at full speed. At the stern, hydraulic rams swing the rudder.', hold: 11 });
  W.stop({ x: 132, y: 38, z: 5, w: 34, title: 'Up on the Sports deck', text: 'Deck tennis between the funnels, and the kennels, where a bell boy earns his tips by walking the dogs.', hold: 10, hour: 15.3 });
  W.stop({ x: 190, y: 31, z: 3, w: 48, title: 'Afternoon tea and dancing', text: 'Tea in the Main Lounge, a tea-dance in the Ballroom, and in the Smoking Room a coal fire, the only one aboard an oil-fired ship.', hold: 11, hour: 17.2 });
  W.stop({ x: 236, y: 33, z: 3, w: 40, title: 'The Starlight Club', text: 'Late at night the Verandah Grill becomes the Starlight Club, with dancing above the wake. Below, the ship sleeps while the night watch stands its four hours.', hold: 12, hour: 23.2 });
  W.stop({ x: LOA / 2, y: 30, z: 4, w: 330, title: 'Through the night', text: 'At midnight the clocks go back an hour: westbound, each day at sea lasts 25 hours.', hold: 12, hour: 23.6 });
  void stage;
}

function update(W) {
  updatePeople(W);
}

// Colour-change lighting in the Verandah Grill at night (worked from the singer’s microphone).
function halos(list, W) {
  if (W.sun().night < 0.5) return;
  const v = room('verandah');
  if (!v || !XS.math.inHours(W.hour, 21, 2)) return;
  const cols = ['#ff7aa0', '#8aa0ff', '#ffd27a', '#9affc8'];
  for (let i = 0; i < 4; i++) list.push({ x: v.x0 + 2 + i * 4, y: v.yC - 0.3, z: 3, r: 1.4, color: cols[(Math.floor(W.time * 0.5) + i) % 4], a: 0.45 });
}

const snap = (x) => {
  let best = null, bd = 3;
  for (const b of BULKHEADS) if (Math.abs(b - 1 - x) < bd) { bd = Math.abs(b - 1 - x); best = b - 1; }
  return best != null ? best : Math.round(x * 2) / 2;
};

XS.scenes.register({
  id: 'liner', order: 10, title: 'The Atlantic Liner', subtitle: 'RMS Queen Mary, westbound, August 1938',
  blurb: 'Room for 2,140 passengers and 1,100 crew, three funnels and four great turbine sets, bound for New York.',
  bounds: { x0: -12, x1: 323, y0: -6, y1: 76, z0: 0, z1: 22 },
  frame: { x0: -4, x1: 315, y0: -2, y1: 72, z0: 0, z1: 18 },
  view: { yaw: -0.22, pitch: 0.17 },
  startHour: 11,
  daySeconds: 900,
  wind: 6,
  clouds: 0.42,
  fog: [500, 3500, 0.55],
  lampGain: 3.2,
  ambient: { sky: '#e8eef2', ground: '#b4aa96' },
  ambience: { sea: 0.75, wind: 0.55, crowd: 0.12, reverb: 0.15, size: 1.6 },
  suggestedCuts: [51, 91, 153, 198, 249],
  snapCut: snap,
  cutRange: [3, LOA - 3],
  sliceGap: 14,
  focusDepth: 3,
  build, setup, update, halos,
});
