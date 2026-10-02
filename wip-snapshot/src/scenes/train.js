/* The Coronation: the LNER's streamlined express crossing the Royal Border Bridge at
 * Berwick-upon-Tweed, about 9.05 pm on Thursday 29 July 1937, hauled by A4 Pacific
 * No. 4489 Dominion of Canada. Sources: docs/research/train.md.
 *
 * Layout plan (metres). x runs along the train from the engine's front buffer face; the
 * train runs towards -x. y is height above the rail top. z is depth behind the cut: the
 * cut runs down the centreline of the down line, so we look into the far (east) half of
 * every vehicle, whose far wall is at z = 1.41.
 *
 *   x 0 to 14.6        A4 engine: nose 0 to 4.7, smokebox 1.9 to 4.6, boiler 4.6 to 9.8,
 *                      firebox 9.8 to 12.8, cab 12.9 to 14.5 (floor 1.5)
 *   x 14.7 to 21.65    corridor tender: coal 14.7 to 17.6, tank to 21.3, corridor on the far side
 *   x 21.65 to 56.6    Twin A: guard's van (Z18), brake third (Z19), open third (Z21), lavatory (Z22)
 *   x 56.6 to 91.6     Twin B: kitchen (Z23), kitchen third (Z24), open third (Z26)
 *   x 91.6 to 126.6    Twin C: two open firsts (Z29, Z30)
 *   x 126.6 to 161.6   Twin D: kitchen (Z32), kitchen third (Z33), brake third (Z35), guard (Z36)
 *   x 161.6 to 178.05  observation car (Z37 to Z39), beaver tail from 175.1
 *   Coach floor 1.25, ceiling 3.4, roof 3.9. Rails at y 0; the river 37 m below.
 *   Bridge: 28 arches of 18.3 m on piers at a 22.4 m pitch, x -230 to about 440.
 *   Suggested cuts at the vehicle gaps: 14.6, 21.65, 56.6, 91.6, 126.6, 161.6.
 *
 * The clock: the scene's light follows a late-July day at 55.8 N (sunset about 9.20 pm
 * summer time), by warping the engine's generic sun. The train stays on the bridge at
 * every hour; routines follow the booked day of the run (tea from 4.10, dinner 6.45 to 8.45).
 */
import { XS, mat, sun as sunAt } from '../engine/index.js';
import { FL, AISLE, SPEED, B, LEN } from './train/common.js';
import { buildLoco, locoParts, animateLoco, CAB, TENDER } from './train/loco.js';
import { buildCars, carParts, COACH_WHEEL_R } from './train/cars.js';
import { buildLand, landLife, riverC, riverW, RIVER } from './train/land.js';
import { cast } from './train/cast.js';

const S = {}; // shared between build and setup (rebuilt on every load)
const CUTS = [14.6, B[0], B[2], B[4], B[6], B[8]];

// Map the clock to the engine's generic sun so that sunrise (about 4.50) and sunset (about
// 9.20 pm) fall where they did at Berwick in late July, with solar noon about 1.10 pm.
const KN = [[1.1, 0], [4.8, 6.0], [13.1, 12.0], [21.35, 19.55], [25.1, 24]];
function warp(h) {
  let x = h < KN[0][0] ? h + 24 : h;
  for (let i = 0; i < KN.length - 1; i++) {
    const [a, A] = KN[i], [b, Bv] = KN[i + 1];
    if (x >= a && x <= b) return (A + ((x - a) / (b - a)) * (Bv - A)) % 24;
  }
  return h;
}

// A smoke kind that keeps the train's speed: the plume streams back over the carriages.
XS.particleKinds.plume = { life: 4.2, size: [0.6, 3.6], vy: 1.1, spread: 0.45, color: '#ece8e0', alpha: 0.5, drag: 0.03, rise: 0.12, puff: 1 };

// ------------------------------------------------------------------ build
function build(k) {
  for (const key of Object.keys(S)) delete S[key];
  // Near things first: within a batch, triangles drawn earlier can hide later ones.
  buildLoco(k, S);
  buildCars(k, S);
  buildLand(k, S);
  locoParts(k, S);
  carParts(k, S);
  // The chime whistle on the casing behind the chimney.
  k.cyl(4.35, 3.95, 0.0, 0.05, 0.22, mat({ c: '#c8a050', cut: '#8a6a30' }), { seg: 10 });
  k.cyl(4.35, 4.17, 0.0, 0.07, 0.05, mat({ c: '#c8a050' }), { seg: 10 });
  captions(k);
}

function captions(k) {
  const L = (d) => k.label(d);
  // Overview.
  L({ x: 92, y: 5.2, z: 0, title: 'The Coronation, 1937', text: 'King’s Cross to Edinburgh in six hours, crossing the Tweed at Berwick at about 9.05 pm.', priority: 3, max: 40,
    body: 'The down Coronation left King’s Cross at 4.00 pm, stopped only at York (6.37 to 6.40) and was booked into Edinburgh Waverley at 10.00 pm: nearly 393 miles at an overall average of 65.5 mph. Nine carriages weighed 312 tons and stretched 513 ft 2½ in; with the engine, 479 tons and 584 ft 1¾ in.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 7, y: 4.6, z: 0, title: 'Dominion of Canada', text: 'Gresley A4 Pacific No. 4489, in Garter blue.', priority: 2, max: 60,
    body: 'On its test run of 30 June 1937 this engine reached 109½ mph with 320 tons behind the tender. 188 miles to York in 157 minutes, an average of 71.9 mph, made the down Coronation the fastest train in the British Empire in 1937.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 40, y: -18, z: 0, title: 'The Royal Border Bridge', text: '28 arches of 60 ft carry the line 37 m above the Tweed.', priority: 2, max: 30,
    body: 'The Royal Border Bridge at Berwick-upon-Tweed has 28 arches of 60 ft, is 659 m long and carries the railway 37 m above the river. It has stood since 1850. Here it is drawn cut open along the line, so its brick core shows in section.', source: 'https://en.wikipedia.org/wiki/Royal_Border_Bridge' });
  L({ x: 135, y: 4.3, z: 1.3, title: 'Two blues', text: 'Marlborough blue above the waist, Garter blue below, with stainless steel mouldings.', min: 4, max: 60,
    body: 'The carriages were painted Marlborough blue above the waist and Garter blue below, with stainless steel mouldings. The colours came from a group chosen for the coronation of King George VI.', source: 'https://en.wikipedia.org/wiki/The_Coronation_(train)' });
  L({ x: riverC(440), y: RIVER + 22, z: 440, title: 'Three bridges, three centuries', text: 'Downstream: the concrete Royal Tweed Bridge of 1928 and the stone Berwick Bridge of 1624.', min: 2, max: 40,
    body: 'Downstream of the railway viaduct stand the reinforced-concrete Royal Tweed Bridge of 1928, with four unequal arches, and the sandstone Berwick Bridge, opened in 1624, with fifteen arches. Their positions here are drawn, not surveyed.', source: 'https://en.wikipedia.org/wiki/Royal_Tweed_Bridge' });
  L({ x: riverC(30) + riverW(30) - 30, y: RIVER + 3, z: 40, title: 'Net and coble', text: 'A salmon crew shoots its net below the bridge.', min: 3, max: 60,
    body: 'On the Tweed, one fisherman holds the net on the shore while the coble rows a half circle across the river, paying out the net to trap the salmon.', source: 'https://thisisnorthumberland.co.uk/journal/salmon-netting-on-the-tweed' });
  // The engine.
  L({ x: 1.2, y: 3.2, z: 0.3, title: 'Cleaving the air', text: 'The wedge front lifts the air so it carries the exhaust steam high over the cab.', min: 14,
    body: 'The A4’s wedge-shaped front throws the air upward, to catch the column of exhaust steam and carry it well up over the driver’s cab.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 4.35, y: 4.2, z: 0, title: 'A Canadian voice', text: 'The whistle came from the Canadian Pacific Railway.', min: 30,
    body: 'Dominion of Canada’s whistle was specially sent over by the Canadian Pacific Railway, so that it sounds like the engines of Canada.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 7.2, y: 2.9, z: 0.1, title: 'Pressed to 250 lb', text: 'Tubes and flues run through the water; steam collects above.', min: 14,
    body: 'The boiler works at 250 lb per square inch. Steam passes through 43 superheater elements, inside the larger flues, before it reaches the cylinders.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 11.3, y: 2.4, z: 0.3, title: 'A bigger fire', text: 'The wide grate burns under a brick arch; water surrounds the copper box.', min: 14,
    body: 'The grate is 41¼ square feet, and the firebox is extended forward into a combustion chamber next to the tube plate.', source: 'https://www.railwaywondersoftheworld.com/jubilee.html' });
  L({ x: 3.2, y: 1.15, z: -1.1, title: 'Three cylinders, two valve gears', text: 'The middle cylinder’s valve is worked by Gresley’s levers from the two outside gears.', min: 14,
    body: 'The A4 has three cylinders. The middle cylinder’s valve has no gear of its own: Gresley’s levers add up the movements of the two outside valve gears to drive it.', source: 'https://en.wikipedia.org/wiki/Gresley_conjugated_valve_gear' });
  L({ x: 8.4, y: 0.3, z: -0.9, title: 'Red wheels, bright rims', text: 'Driving wheels 6 ft 8 in across, dark red with polished rims.', min: 10,
    body: 'The 6 ft 8 in driving wheels are painted dark red with polished rims; the lettering and fittings are stainless steel.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 5.6, y: 5.6, z: 0, title: 'A purr at speed', text: 'Six exhaust beats for every turn of the wheels.', min: 10,
    body: 'Three double-acting cylinders give six exhaust beats each time the driving wheels turn: at 90 mph that is nearly 38 beats a second, too fast to hear as separate chuffs. At the 60 mph drawn here the wheels turn about four times a second.', source: 'https://en.wikipedia.org/wiki/LNER_Class_A4' });
  L({ x: 13.8, y: 3.35, z: 0.5, title: 'A comfortable footplate', text: 'Seats with backs for the crew, facing the front windows.', min: 18,
    body: 'Among the novelties on these engines: seats with backs for the crew, facing towards the front cab windows, a speed indicator and a pyrometer.', source: 'https://www.railwaywondersoftheworld.com/jubilee.html' });
  L({ x: 13.02, y: 3.62, z: -1.0, title: 'Every speed on paper', text: 'A self-recording speed indicator.', min: 30,
    body: 'A self-recording speed indicator drew the train’s speed on a moving roll of paper, so managers could check how fast each curve was taken.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 13.4, y: 2.95, z: -1.0, title: '“Off!”', text: 'Driver and fireman call out each signal to each other as they sight it.', min: 25,
    body: 'Driver and fireman both look out for the signals and call each one aloud to the other as it comes into sight.', source: 'https://www.railwaywondersoftheworld.com/driving-locomotive.html' });
  L({ x: 14.15, y: 2.05, z: -1.38, title: 'The arms of Canada', text: 'Each Coronation engine carried the arms of a Dominion on its cab.', min: 22,
    body: 'Each of the five engines built for the Coronation carries the coat of arms of a Dominion of the Empire on its cab, by permission of that country’s government.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 16.2, y: 3.6, z: 0.2, title: 'Enough coal, not enough water', text: '8 tons of coal; 5,000 gallons of water, topped up on the move.', min: 14,
    body: 'The tender holds 8 tons of coal, enough for London to Edinburgh, but its 5,000 gallons of water must be topped up from troughs between the rails, picked up at speed.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 19.2, y: 2.4, z: 1.06, title: 'A corridor through the tender', text: '18 in wide and 5 ft high, so crews can change on the move.', min: 18,
    body: 'A passage 18 inches wide and 5 feet high runs along the right side of the tender, lit by one round window at the back, so that men can walk from the train to the footplate.', source: 'https://en.wikipedia.org/wiki/Gangway_connection' });
  L({ x: 18.3, y: 0.45, z: 0.1, title: 'The water scoop', text: 'Lowered into a trough between the rails, it drives water up into the tank.', min: 22,
    body: 'Dipped into a trough between the rails at about 60 mph, a tender scoop could gather 2,000 gallons in about 20 seconds.', source: 'https://www.railwaymagazine.co.uk/17295/water-troughs-another-rm-scoop/' });
  // The carriages.
  L({ x: 24.5, y: 2.6, z: 0.8, title: 'Guns, rods and dogs', text: 'Luggage for the Scottish season in the guard’s van.', min: 16,
    body: 'In summer the railways carried guns, fishing tackle and dogs north for the Scottish sporting season.', source: 'https://blog.railwaymuseum.org.uk/a-short-history-of-railway-luggage/' });
  L({ x: 39.1, y: 0.55, z: 0.7, title: 'Two coaches, three bogies', text: 'One bogie carries the ends of both bodies of a twin.', min: 8,
    body: 'In each articulated twin, one bogie carries the ends of both bodies: twelve wheels instead of sixteen, saving weight.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 47, y: 2.8, z: 0.9, title: 'Third class in sections', text: 'Armchairs two abreast on one side of the gangway, one on the other.', min: 14,
    body: 'Armchairs stand two abreast on one side of the gangway and singly on the other, in sections of twelve with the privacy of a compartment.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 56.6, y: 2.6, z: 1.35, title: 'No gaps', text: 'Rubber sheeting in the body colours covers the joints.', min: 18,
    body: 'The spaces between carriages are covered with indiarubber sheeting painted in the same colours as the sides, so the train presents one smooth surface.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 59.5, y: 2.75, z: 0.8, title: 'An all-electric kitchen', text: 'Electric ranges, a water-boiler, a refrigerator; no flame anywhere.', min: 16 });
  L({ x: 26.6, y: 0.75, z: 0.4, title: 'Cooking by axle', text: 'Belt-driven dynamos under the floor make the train’s electricity.', min: 16,
    body: 'Both kitchens are all-electric. Generators driven from the axles make 32 kilowatts for cooking, lights, fans and refrigerators.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 68.5, y: 2.9, z: 0.8, title: 'Dinner at your seat', text: 'Tea and dinner come to every seat; there is no dining car.', min: 16,
    body: 'Nobody walks to a dining car: tea (1s) and table d’hôte dinner (5s first class, 4s 6d third) are served at every seat from the two kitchens.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 82, y: 3.38, z: 0.4, title: 'Fresh air every three minutes', text: 'Air enters at floor level and leaves through roof grilles.', min: 20,
    body: 'Filtered air enters at floor level and leaves by roof grilles, changed every three minutes; double windows and packed walls keep out the noise.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 100, y: 2.75, z: 0.8, title: 'Alcoves for two', text: 'Swivelling armchairs angled to the window at tapered tables.', min: 14,
    body: 'In first class two swivelling armchairs face each tapered table, turned diagonally towards the window; ornamental screens turn each table into an alcove.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 104.5, y: 1.75, z: 1.28, title: 'Grey-green and fawn', text: 'One documented first-class scheme.', min: 25,
    body: 'One documented scheme used two shades of grey-green Rexine with fretted trim, fawn moquette and green carpet. The second saloon’s colours here are invented, since its scheme is not recorded in our sources.', source: 'https://gresley.org/coach/5064/' });
  L({ x: 113.5, y: 2.1, z: 1.05, title: 'Silent cutlery', text: 'Flat-handled knives and forks cannot rattle at speed.', min: 30,
    body: 'Even the knives and forks have flat handles, so they cannot rattle on the table at speed.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 169, y: 2.95, z: 0.9, title: 'A shilling an hour', text: 'Observation car chairs are let by the hour.', min: 14,
    body: 'Seats in the observation car could not be booked for the whole run; a chair for one hour cost 1s, paid to the attendant.', source: 'https://locoyard.com/2013/07/10/coronation-1937-lner-brochure-courtesy-of-nick-littlewood/' });
  L({ x: 162.4, y: 3.5, z: 0.3, title: 'Turned every night', text: 'Only the observation car is turned at each end of the run.', min: 16,
    body: 'At each end of the run the observation car is uncoupled, turned on a turntable and worked round to the new rear of the train; the eight-car set keeps its orientation.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 176.6, y: 3.2, z: 0.3, title: 'The beaver tail', text: 'The roof curves right down to the buffers.', min: 8,
    body: 'The rounded tail was calculated to save 35 horsepower at 100 mph, matching the streamlined nose at the other end of the train.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
  L({ x: 177.2, y: 2.2, z: 0.9, title: 'Aeroplane glass', text: 'Sloping windows moulded in a glass substitute.', min: 22,
    body: 'The curved rear windows are moulded from a glass substitute used in aeroplane construction.', source: 'https://wondersofworldengineering.com/streamlined-expresses.html' });
}

// ------------------------------------------------------------------ setup
function setup(W, stage, k) {
  W.sun = () => sunAt(warp(W.hour));
  const nav = W.nav;
  // The gangway that runs the length of the train.
  const STEP = 1.0, AX0 = 21.95, AX1 = 176.9;
  const aisle = nav.walkway('a', AX0, AX1, FL, AISLE, STEP);
  const near = (x) => aisle[Math.max(0, Math.min(aisle.length - 1, Math.round((x - AX0) / ((AX1 - AX0) / (aisle.length - 1)))))];
  const spot = (id, x, z) => { nav.node(id, x, FL, z); nav.link(id, near(x)); return id; };
  for (const zone of Object.keys(S.seats)) S.seats[zone].forEach((q, i) => spot(zone + ':s' + i, q.x, q.z));
  S.stations.Z23.pass = [64.3, 0.0];
  S.stations.Z32.pass = [134.3, 0.0];
  S.stations.Z24 = { pass: [65.2, 0.0] };
  for (const zone of Object.keys(S.stations)) for (const [n, [x, z]] of Object.entries(S.stations[zone])) spot(zone + ':' + n, x, z);
  // Footplate and tender corridor.
  const cf = CAB.floor;
  nav.node('cab', 13.95, cf, 0.15);
  for (const [id, x, z] of [['driver', 13.58, -0.76], ['fireman', 13.72, 0.1], ['fireSeat', 13.58, 0.86], ['lookL', 13.25, -1.0], ['lookR', 13.25, 1.0], ['gaugeL', 13.12, -0.35], ['gaugeR', 13.12, 0.6], ['coalHose', 14.95, 0.3], ['cabStand', 14.15, -0.35], ['tcFront', 14.6, 0.95]]) { nav.node(id, x, cf, z); nav.link('cab', id); }
  const T = TENDER, tc = [];
  for (let i = 0; i <= 5; i++) tc.push(nav.node('tc' + i, 15.1 + i * 1.2, T.corrY0, (T.corrZ0 + T.corrZ1) / 2));
  nav.chain(tc);
  nav.link('tcFront', 'tc0', 'stairs');
  nav.node('tg', 21.45, FL, 0.3);
  nav.link('tc5', 'tg', 'stairs');
  nav.link('tg', aisle[0]);

  landLife(W, k, S);
  cast(W, S);

  // The spaniel in the front van: lies by her water bowl, gets up and wags for visitors.
  const dogAt = S.stations.Z18.dog;
  const dog = k.part(dogAt[0] + 0.55, FL, dogAt[1], (q) => {
    const liver = mat({ c: '#6a3a24' }), white = mat({ c: '#efe8dc' });
    q.boulder(0, 0.32, 0, 0.32, 0.15, 0.13, white, 3, 0.05);
    q.boulder(-0.08, 0.36, 0, 0.18, 0.12, 0.135, liver, 4, 0.05);
    q.boulder(-0.36, 0.48, 0, 0.11, 0.1, 0.09, liver, 5, 0.05);
    q.boulder(-0.47, 0.44, 0, 0.07, 0.05, 0.05, white, 6, 0.05);
    for (const s of [-1, 1]) q.boulder(-0.33, 0.42, s * 0.09, 0.05, 0.1, 0.03, liver, 7, 0.05);
    for (const [x, s] of [[-0.2, -1], [-0.2, 1], [0.2, -1], [0.2, 1]]) q.box(x - 0.03, 0, s * 0.07 - 0.025, x + 0.03, 0.26, s * 0.07 + 0.025, white);
  });
  const tail = k.part(0, 0, 0, (q) => q.boulder(0.12, 0, 0, 0.13, 0.03, 0.03, mat({ c: '#efe8dc' }), 8, 0.05));
  W.addActor({ object: dog, update(dt, t) {
    const visit = W.people.some((p) => p.anim === 'pat' && Math.abs(p.x - dogAt[0]) < 1.6 && Math.abs(p.y - FL) < 0.3);
    W.data.dogUp = (W.data.dogUp || 0) + ((visit ? 1 : 0) - (W.data.dogUp || 0)) * Math.min(1, dt * 3);
    const u = W.data.dogUp;
    dog.position.y = FL - 0.24 * (1 - u);
    dog.rotation.z = (1 - u) * 0.0;
    dog.scale.y = 1 - 0.0 * u;
    tail.position.set(dog.position.x + 0.3, dog.position.y + 0.42, dog.position.z);
    tail.rotation.y = Math.sin(t * (u > 0.5 ? 14 : 2)) * (u > 0.5 ? 0.7 : 0.15);
    tail.rotation.z = 0.5 + u * 0.3;
  } });
  W.addActor({ object: tail, update() {} });


  // ---------------- machines
  W.data.door = 0;
  W.addMachine((dt, t, w) => {
    const d = SPEED * t;
    animateLoco(S, d);
    for (const g of S.carWheels) g.rotation.z = d / COACH_WHEEL_R;
    for (const g of S.pulleys) g.rotation.z = d / 0.14 * 0.5;
    // The firehole door swings open as each shovelful goes in.
    const f = S.fireman;
    let open = 0;
    if (f && f.anim === 'shovel' && !f.moving) { const c = (t * 0.45 + f.ph) % 1; open = c > 0.32 && c < 0.78 ? 1 : 0; }
    w.data.door += (open - w.data.door) * Math.min(1, dt * 10);
    S.parts.door.rotation.y = -w.data.door * 1.3;
    if (w.data.hoseT > 0) w.data.hoseT -= dt;
  });

  // ---------------- smoke, steam, fire
  const plume = W.emitter({ kind: 'plume', x: 3.25, y: 4.15, z: 0, w: 0.3, d: 0.3, rate: 10, vx: 25.5, vy: 1.1 });
  W.data.plume = plume;
  W.emitter({ kind: 'ember', x: 3.25, y: 4.1, z: 0, rate: 3, vx: 21, vy: 2.5, when: 'night' });
  W.emitter({ kind: 'fire', x: 11.25, y: 1.55, z: 0.45, w: 2.3, d: 0.8, rate: 22, vy: 1.2, when: 'always' });
  W.emitter({ kind: 'steam', x: 10.15, y: 4.0, z: 0.25, rate: (w) => ((w.time % 70) < 4.5 ? 40 : 0), vy: 5, vx: 18, size: [0.3, 2.6] });
  W.emitter({ kind: 'splash', x: 15.15, y: 2.0, z: 0.35, w: 0.3, d: 0.3, rate: (w) => (w.data.hoseT > 0 ? 30 : 0), vx: 0.9, vy: 0.4 });
  for (const [x, y, z] of S.steam) W.emitter({ kind: 'steam', x, y, z, rate: 2.2, vy: 0.3, size: [0.08, 0.45], life: 1.5, alpha: 0.5 });

  // ---------------- sound
  W.sound({ kind: 'chuff', x: 3.25, y: 4, z: 0, r: 40, gain: 0.55, rate: 25 });
  W.sound({ kind: 'fire', x: 11.3, y: 1.6, z: 0.4, r: 12, gain: 0.5 });
  for (const x of [30, 80, 120, 170]) W.sound({ kind: 'machine', x, y: 0.5, z: 0.7, r: 25, gain: 0.35, rate: 3, pitch: 0.7 });
  W.sound({ kind: 'hum', x: 60, y: 2, z: 0.8, r: 10, gain: 0.25, hz: 110 });
  W.sound({ kind: 'hum', x: 130, y: 2, z: 0.8, r: 10, gain: 0.25, hz: 110 });
  W.sound({ kind: 'gulls', x: 120, y: -25, z: 60, r: 60, gain: 0.4, when: 'day' });

  // ---------------- guided tour
  W.stop({ x: 90, y: -12, z: 2, w: 215, hour: 21.08, hold: 12, title: 'High over the Tweed', text: 'Thursday 29 July 1937, about 9.05 pm. The LNER’s Coronation passes Berwick on the Royal Border Bridge, five hours out of King’s Cross and an hour from Edinburgh. Every one of its nine carriages is full of people at dinner, at work, or dozing.' });
  W.stop({ x: 3.4, y: 1.6, z: 0.4, w: 15, hour: 21.1, hold: 10, title: 'Dominion of Canada', text: 'The wedge front lifts the air to carry the exhaust over the cab. Inside the blue casing: the smokebox and single chimney, then the boiler, its tubes running through the water.' });
  W.stop({ x: 11.8, y: 1.6, z: 0.2, w: 8, hour: 21.2, hold: 11, title: 'On the footplate', text: 'The fireman feeds the fire a little and often, swinging the shovel through the firehole; the driver watches the road ahead. Both call out each signal as they sight it.' });
  W.stop({ x: 17.4, y: 1.6, z: 0.6, w: 9, hour: 21.25, hold: 9, title: 'Through the tender', text: 'A narrow corridor runs past the coal and the water tank, so a man can walk from the train to the footplate while it runs.' });
  W.stop({ x: 24.5, y: 1.4, z: 0.6, w: 10, hour: 17.5, hold: 10, title: 'Guns, rods and a spaniel', text: 'In summer the railways carried guns, rods and dogs north for the Scottish season. Here a sportsman’s spaniel rides among the trunks, and at half past five a small boy is allowed in to see her.' });
  W.stop({ x: 45.5, y: 1.3, z: 0.6, w: 15, hour: 16.6, hold: 11, title: 'Tea at every seat', text: 'Third class sits in sections of twelve. There is no dining car: attendants bring tea from the kitchens to every table.' });
  W.stop({ x: 60.5, y: 1.4, z: 0.6, w: 10, hour: 19.3, hold: 10, title: 'An all-electric kitchen', text: 'Ranges, a water-boiler and a refrigerator, all run on electricity made by dynamos turned from the axles.' });
  W.stop({ x: 102.5, y: 1.4, z: 0.6, w: 13, hour: 19.6, hold: 11, title: 'Dinner in first class', text: 'Two swivelling armchairs at each tapered table, turned towards the window, with a little lamp; the knives and forks have flat handles so nothing rattles.' });
  W.stop({ x: 170.5, y: 1.4, z: 0.6, w: 17, yaw: 0.3, pitch: 0.12, hour: 21.05, hold: 11, title: 'The beaver tail', text: 'A shilling buys an hour in the observation car. Tonight the chairs are full for the crossing at Berwick, the old bridges and the sea in the last of the sun.' });
  W.stop({ x: 90, y: -8, z: 2, w: 200, hour: 22.9, hold: 12, title: 'Into the night', text: 'Lamps glow in every carriage, the fire lights the footplate and sparks fly from the chimney. The Coronation was booked into Edinburgh Waverley at 10.00 pm.' });
  void stage; void LEN;
}

function update(W) {
  // Tint the plume with the light: warm in the low sun, grey-violet at night.
  const s = W.sun();
  const P = W.data.plume;
  if (P) P.color = s.day > 0.6 ? (s.dusk > 0.5 ? '#f4dcc4' : '#efece6') : s.day > 0.2 ? '#d8c4b8' : '#6e6a78';
}

function halos(list, W) {
  // The firehole glows on the fireman as the door opens.
  const d = W.data.door || 0;
  if (d > 0.05) list.push({ x: 12.75, y: 1.9, z: 0.0, r: 0.8 * d, color: '#ffb050', a: 0.7 * d });
}

XS.scenes.register({
  id: 'train',
  order: 40,
  title: 'The Express',
  subtitle: 'The Coronation crossing the Tweed, 29 July 1937',
  blurb: 'Dominion of Canada and nine streamlined carriages, high on the Royal Border Bridge at dinner time.',
  chunk: 400,
  bounds: { x0: -14, x1: 192, y0: -42, y1: 14, z0: 0, z1: 8 },
  frame: { x0: -6, x1: 184, y0: -6, y1: 8, z0: 0, z1: 3 },
  view: { yaw: -0.45, pitch: 0.1 },
  startHour: 20.95,
  daySeconds: 1800,
  wind: 3,
  clouds: 0.3,
  fog: [300, 2600, 0.55],
  focusDepth: 0.8,
  lampGain: 2.6,
  minDist: 1.5,
  sliceGap: 8,
  suggestedCuts: CUTS,
  cutRange: [2, 176],
  snapCut(x) {
    let best = null, bd = 2.5;
    for (const c of CUTS) { const d = Math.abs(c - x); if (d < bd) { bd = d; best = c; } }
    return best != null ? best : Math.round(x * 2) / 2;
  },
  ambience: { wind: 0.35, crowd: 0.2, room: 0.15, sea: 0.1, reverb: 0.12, size: 0.8 },
  build, setup, update, halos,
});
