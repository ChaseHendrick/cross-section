/* The Submarine: USS Pampanito (SS-383), a Balao-class fleet submarine, on the night of
 * 11 to 12 March 1945, sixth war patrol, off the east coast of the Malay Peninsula.
 *
 * Research: docs/research/submarine.md (source keys S1..S63). Modelled on Pampanito herself from
 * her 1943 builder's book (S1); room positions are scaled from its compartment plan and simplified
 * where port and starboard rooms overlap. All named people are fictional (dossier 4d).
 *
 * Layout plan (metres; helpers in src/scenes/submarine/):
 *   x: bow tip 0 (LEFT) to stern 95. Pressure hull 9.65 to 87.53. Bulkheads (dossier 2c):
 *      forward torpedo room 11.48-23.06 | forward battery (pantry, wardroom, staterooms, captain,
 *      chiefs, yeoman) 23.06-32.44 | control room 32.44-38.6, radio room 38.6-40.67 |
 *      galley 40.67-43.0, crew's mess 43.0-45.89, berthing 45.89-52.6, washroom 52.6-54.19 |
 *      forward engine room 54.19-62.22 | after engine room 62.22-70.42 | maneuvering 70.42-76.56 |
 *      after torpedo room 76.56-87.53 | stern gear 86-95.6.
 *   y: keel 0; lower flats and battery wells 1.15-3.5; main deck 3.57 (control room 3.50,
 *      forward torpedo room 3.25); pressure hull top 6.05; main deck about 7.0; conning tower
 *      deck 7.40; bridge flat 8.95; fairwater top 10.28; shears 14.41; periscopes raised 20.32.
 *      Waterline 4.6 on the surface; by day the sea stands at 19.4, periscope depth (illustrative).
 *   z: 0 = centreline cut; we look into the starboard half; pressure hull radius 2.45, beam 8.32.
 *   Living cycle: on the surface from about 1900 to 0530, diesels charging; dives before dawn,
 *   periscope depth all day (S25, S34, S41). Red light fore and aft, white in the galley and
 *   engine rooms (dossier 3, after USS Grayback's practice). Bridge completely dark (S43).
 *   Cuts at the watertight bulkheads: 23.06, 32.44, 40.67, 54.19, 70.42, 76.56 (dossier 3).
 */
import { XS, updateSea, glowMaterial, THREE } from '../engine/index.js';
import { WL, DAY_SEA, X, DECK, LOW, SHEARS, SHAFT, shaftY, deckY, outerSection } from './submarine/geom.js';
import { buildSkin, buildPressureHull, buildTanks, buildDecks, buildBulkheads, buildConningTower, buildFairwater, buildDeckFittings, buildFraming, buildWater, outerZ } from './submarine/hull.js';
import { buildRooms, A } from './submarine/rooms.js';
import { buildMachines } from './submarine/machines.js';
import { buildDetails } from './submarine/details.js';
import { buildNav, buildCast, settle } from './submarine/cast.js';


function captions(k) {
  const L = (d) => k.label(d);
  // The whole boat (margins at the overview).
  L({ x: 48, y: -5, z: 0, title: 'USS Pampanito (SS-383)', text: 'A Balao-class fleet submarine, 311 ft 8 in (95.0 m) long and 27 ft 3 1/2 in (8.3 m) wide.', priority: 6, side: 'left',
    body: 'USS Pampanito is 311 ft 8 in (95.0 m) long and 27 ft 3 1/2 in (8.3 m) wide, by the general information book her builder, Portsmouth Navy Yard, compiled in 1943. She is drawn here as she was in March 1945.', source: 'https://legacy.maritime.org/doc/pdf/ss383-general-info.pdf' });
  L({ x: 12, y: 12.5, z: 0, title: 'Sixth war patrol', text: '25 February to 24 April 1945. On her return it was called “a hard and boring patrol.”', priority: 5, side: 'left',
    body: 'Pampanito’s sixth war patrol ran from 25 February to 24 April 1945, off the Malay Peninsula. On her return the captain and crew were congratulated on “a hard and boring patrol.”', source: 'http://legacy.maritime.org/pamphist/patrol6.php' });
  L({ x: 80, y: -5, z: 0, title: 'About eighty men', text: 'On war patrols the average officer was about 27 years old, the average sailor about 22.', priority: 5, side: 'right',
    body: 'About 80 men lived aboard. A wartime Navy study of 1,471 patrol reports found the average officer was about 27 years old and the average enlisted man about 22.', source: ['http://legacy.maritime.org/tour/cm.php?pano=nr', 'https://legacy.maritime.org/doc/pdf/duff.pdf'] });
  L({ x: 60, y: 14.5, z: 0, title: 'No snorkel', text: 'To run her diesels and charge her batteries she had to surface, usually at night.', priority: 5, side: 'right',
    body: 'Pampanito had no snorkel. To run her diesels and charge her batteries she had to come to the surface, so she stayed submerged by day and ran on the surface at night.', source: 'http://legacy.maritime.org/pamphist/patrol2.php' });
  // Forward torpedo room.
  L({ x: 16.5, y: 5.4, z: 0.8, title: 'Forward torpedo room', text: 'About 14 men slept here alongside 16 torpedoes: six in the tubes and ten reloads.', min: 24,
    body: 'About 14 men slept in the forward torpedo room alongside 16 torpedoes: six in the tubes and ten reloads, two for each upper tube on racks and one for each lower tube below the deck.', source: 'http://legacy.maritime.org/tour/ftr.php?pano=nr' });
  L({ x: 14.0, y: 3.7, z: 1.4, title: 'Mark 14 torpedo', text: '20 ft 6 in long and about 3,000 lb. Reloads were moved by hand with block and tackle.', min: 60,
    body: 'A Mark 14 torpedo was 20 ft 6 in long and weighed about 3,000 lb. Reloads were moved by hand with block and tackle and chain falls.', source: ['https://en.wikipedia.org/wiki/Mark_14_torpedo', 'http://legacy.maritime.org/tour/atr.php?pano=nr'] });
  L({ x: 18.3, y: 4.0, z: 0.4, title: 'Movie night', text: 'Films were a great comfort on patrol; one boat showed them in alternate torpedo rooms. Whether Pampanito had a projector is not known.', min: 90 });
  // Officers' country and the battery.
  L({ x: 25.6, y: 5.2, z: 1.0, title: 'Wardroom', text: 'Officers’ dining room, office, chart room and meeting room in one, with the chronometers and a record player.', min: 30,
    body: 'The wardroom was the officers’ mess, recreation room, workspace and meeting room. The ship’s chronometers and charts were kept here, and a record player.', source: ['http://legacy.maritime.org/tour/fbc.php?pano=nr', 'http://legacy.maritime.org/tour/fbc-wardroom.php?pano=nr'] });
  L({ x: 29.2, y: 5.4, z: 0.9, title: 'Captain’s stateroom', text: 'The only private room aboard. Gauges at the foot of the bunk let him check the boat without getting up.', min: 40,
    body: 'The captain’s stateroom was the only private room aboard. A depth gauge and course repeater at the foot of the bunk let him check the boat without getting up.', source: ['http://legacy.maritime.org/tour/fbc-captain.php?pano=nr', 'http://legacy.maritime.org/tour/fbc.php?pano=nr'] });
  L({ x: 31.8, y: 4.7, z: 0.7, title: 'Christmas in March', text: 'On 11 March another boat handed over 34 sacks of overdue mail. Some of the cookies were moldy.', min: 45,
    body: 'On 11 March 1945 USS Sea Robin passed over 34 sacks of long overdue mail. Christmas had finally caught up with Pampanito, though some of the cookies were moldy.', source: 'http://legacy.maritime.org/pamphist/patrol6.php' });
  L({ x: 27.5, y: 2.2, z: 0.6, title: 'Forward battery', text: '126 cells under the officers’ feet, each about 4 1/2 ft tall and about 1,650 lb.', min: 28,
    body: 'The forward battery holds 126 cells in six rows of 21. Each cell is about 4 1/2 ft tall and weighs about 1,650 lb.', source: ['http://legacy.maritime.org/doc/fleetsub/elect/chap5.php', 'https://legacy.maritime.org/doc/pdf/ss383-general-info.pdf'] });
  // Control room, conning tower, bridge.
  L({ x: 33.7, y: 5.4, z: 1.2, title: 'Diving station', text: 'One wheel for the bow planes, one for the stern planes. The stern planes hold the angle; the bow planes control depth.', min: 34,
    body: 'At the diving station one man works the bow planes and another the stern planes. The stern planes hold the boat’s angle; the bow planes control her depth.', source: 'http://legacy.maritime.org/tour/cr.php?pano=nr' });
  L({ x: 35.2, y: 5.7, z: 1.6, title: 'The Christmas tree', text: 'A red or green light for every hull opening. A “green board” means all are shut and she can dive.', min: 50,
    body: 'The hull opening indicator panel shows a red or green light for every hatch, valve and opening in the hull. A “green board” means all are shut and the boat can dive.', source: ['http://legacy.maritime.org/tour/cr.php?pano=nr', 'http://legacy.maritime.org/doc/fleetsub/chap18.php'] });
  L({ x: 37.4, y: 4.4, z: 0.2, title: 'Red goggles', text: 'Before a night watch a lookout wore red goggles for at least 20 minutes.', min: 70,
    body: 'Before going up for a night watch, lookouts wore red dark-adaptation goggles for at least 20 minutes.', source: 'http://legacy.maritime.org/doc/fleetsub/chap20.php' });
  L({ x: 36.0, y: 2.0, z: 0.8, title: 'Pump room', text: 'Air compressors, trim and drain pumps, hydraulics, the air conditioning. Nobody stood watch here unless something needed fixing.', min: 34,
    body: 'Below the control room: two 3,000 lb air compressors, trim and drain pumps, hydraulic pumps and the air conditioning plant. Nobody stood watch here unless something needed fixing.', source: 'http://legacy.maritime.org/tour/pump.php?pano=nr' });
  L({ x: 36.4, y: 8.5, z: 0.3, title: 'Conning tower', text: 'A steel cylinder 8 ft across and 17 ft long: the captain’s battle station.', min: 30,
    body: 'The conning tower is a steel cylinder 8 ft across and 17 ft long, the captain’s battle station, where up to ten men could work.', source: 'http://legacy.maritime.org/tour/ct.php?pano=nr' });
  L({ x: SHEARS.x1, y: 17.5, z: 0, title: 'Periscopes', text: 'The larger forward one for night use; the slim after one, harder to see, for attacks.', min: 16,
    body: 'The larger forward periscope was for night use; the slim after one, harder to see, for attacks. Raised, their tops stood about 66 ft above the keel.', source: ['http://legacy.maritime.org/tour/ct.php?pano=nr', 'https://legacy.maritime.org/doc/pdf/ss383-general-info.pdf'] });
  L({ x: 38.3, y: 14.9, z: 0, title: 'SJ radar', text: 'Used 10 cm waves to find ships on the surface, even on a black night.', min: 22,
    body: 'The SJ radar used 10 cm waves to find ships on the surface and give their range and bearing, even on a black night.', source: 'https://en.wikipedia.org/wiki/SJ_radar' });
  L({ x: 36.3, y: 11.4, z: 0.9, title: 'Lookouts', text: 'On platforms either side of the shears, each searching his own slice of sea and sky.', min: 22,
    body: 'Lookouts stood on raised platforms either side of the periscope shears, each searching his own sector of sea and sky.', source: ['http://legacy.maritime.org/tour/fdeck.php?pano=nr', 'http://legacy.maritime.org/doc/fleetsub/chap20.php'] });
  L({ x: 33.2, y: 10.4, z: 0.4, title: 'Completely darkened', text: '“This ship will run completely darkened at night.” No smoking topside.', min: 26,
    body: 'A sister boat’s orders: “This ship will run completely darkened at night.” No smoking was allowed topside when darkened.', source: 'https://legacy.maritime.org/doc/pdf/suborders.pdf' });
  L({ x: 26.5, y: 8.9, z: 0, title: '4-inch deck gun', text: 'Carried forward of the conning tower on all six patrols; a 5-inch gun aft replaced it in mid-1945.', min: 20,
    body: 'Pampanito carried a 4-inch deck gun forward of the conning tower on all six war patrols. In mid-1945 a 5-inch gun aft replaced it.', source: 'http://legacy.maritime.org/pamphist/patrol6.php' });
  // Galley, mess, berthing.
  L({ x: 41.6, y: 5.5, z: 1.0, title: 'Galley', text: 'Square pots on rectangular hot plates. The bakers worked overnight, and a pie locker held pie for the whole crew.', min: 30,
    body: 'Square pots sit on rectangular hot plates because they hold more. The bakers worked overnight, and a special pie locker held pie for the whole crew.', source: 'http://legacy.maritime.org/tour/cm-galley.php' });
  L({ x: 44.6, y: 5.3, z: 1.2, title: 'Crew’s mess', text: 'Four tables fed the crew in sittings; the watch going on duty ate first.', min: 30,
    body: 'Four tables fed the crew in sittings. The watch section going on duty ate first. The coffee pot was always on.', source: ['http://legacy.maritime.org/tour/cm-mess.php', 'http://legacy.maritime.org/tour/cm.php?pano=nr'] });
  L({ x: 43.5, y: 2.3, z: 0.6, title: 'Cold stores and potatoes', text: 'Food for a 60 to 90 day patrol filled the cold rooms, then the showers, the engine rooms, even the deck.', min: 36,
    body: 'Food for a 60 to 90 day patrol filled the freezer and cold rooms, then the shower stalls, the spaces behind the engines and even the deck, under cardboard.', source: 'http://legacy.maritime.org/tour/cm.php?pano=nr' });
  L({ x: 49.5, y: 5.6, z: 1.0, title: 'Hot bunks', text: '36 bunks for many more men: three men shared two bunks, sleeping in turn.', min: 28,
    body: 'The crew’s berthing had 36 bunks for many more men, so three men shared two bunks, sleeping in turn. This was called hot bunking.', source: 'http://legacy.maritime.org/tour/abc.php?pano=nr' });
  L({ x: 46.4, y: 4.6, z: 1.2, title: 'Ice cream', text: 'An ice cream freezer, perhaps “the only luxury on the whole boat.”', min: 70,
    body: 'An ice cream freezer stood in the crew’s berthing, perhaps “the only luxury on the whole boat.”', source: 'http://legacy.maritime.org/tour/abc.php?pano=nr' });
  L({ x: 53.3, y: 5.3, z: 0.8, title: 'Washroom', text: 'About 70 men shared two toilets, two showers and one washing machine.', min: 46,
    body: 'About 70 men shared two toilets, two showers and one washing machine. Fresh water was so precious that a man might shower once in ten days.', source: ['http://legacy.maritime.org/tour/abc-head.php?pano=nr', 'http://legacy.maritime.org/tour/fer.php?pano=nr'] });
  L({ x: 49.0, y: 2.2, z: 0.6, title: 'Smoking lamp out', text: 'Charging cells give off hydrogen. When the charge reached its finishing rate, no smoking.', min: 36,
    body: 'Charging cells give off hydrogen. A sister boat’s orders said it must never exceed 3 per cent in the ducts, and put the smoking lamp out when the charge reached its finishing rate.', source: 'https://legacy.maritime.org/doc/pdf/suborders.pdf' });
  // Engines and motors.
  L({ x: 58.0, y: 5.4, z: 1.3, title: 'Four diesels', text: 'Fairbanks-Morse engines of 1,600 horsepower at 720 rpm, with two pistons in every cylinder.', min: 22,
    body: 'Four Fairbanks-Morse diesels, each 1,600 horsepower at 720 rpm. They are opposed-piston engines: two pistons in every cylinder move towards each other.', source: ['https://legacy.maritime.org/doc/pdf/ss383-general-info.pdf', 'http://legacy.maritime.org/doc/fleetsub/diesel/chap3.php'] });
  L({ x: 66.2, y: 5.2, z: 1.0, title: 'Diesel-electric', text: 'The engines never turned the propellers: they drove generators that charged the batteries, ran the motors, or both.', min: 24,
    body: 'Diesel-electric drive: the engines never turned the propellers. They drove generators, and the electricity charged the batteries, ran the motors, or both.', source: ['http://legacy.maritime.org/tour/aer.php?pano=nr', 'https://en.wikipedia.org/wiki/Balao-class_submarine'] });
  L({ x: 72.5, y: 5.2, z: 1.0, title: 'Maneuvering room', text: 'Every change of speed was ordered from forward and set here by electricians at the control stand.', min: 30,
    body: 'Every change of speed was ordered from the bridge, conning tower or control room, and set here by electricians at the control stand.', source: 'http://legacy.maritime.org/tour/man.php?pano=nr' });
  L({ x: 73.0, y: 2.0, z: 1.2, title: 'Motor room', text: 'Four electric motors, two to each shaft, geared down to turn the propellers at up to 280 rpm.', min: 30,
    body: 'Four electric motors, two to each shaft, drove the propellers through reduction gears at up to 280 rpm. The gears were the boat’s loudest noise under water.', source: ['https://legacy.maritime.org/doc/pdf/ss383-general-info.pdf', 'http://legacy.maritime.org/tour/mot.php?pano=nr'] });
  L({ x: 82.0, y: 5.4, z: 0.8, title: 'After torpedo room', text: 'Four tubes, four reloads on skids, bunks for 12 men and three more that could be rigged.', min: 26,
    body: 'The after torpedo room has four tubes, four reloads on skids, and bunks for 12 men with three more that could be rigged.', source: 'http://legacy.maritime.org/tour/atr.php?pano=nr' });
  // Hidden details (no fact cards: small stories, some invented and said so).
  L({ x: 41.4, y: 4.75, z: 0.9, title: 'The night baker', text: 'The bakers worked through the night.', min: 110 });
  L({ x: 72.0, y: 4.75, z: 1.1, title: 'A cricket', text: 'Pure invention: an electrician’s pet cricket lives in a matchbox by the control stand.', min: 150 });
}

function build(k) {
  k.data = {};
  buildSkin(k);
  buildPressureHull(k);
  buildTanks(k);
  buildDecks(k);
  buildBulkheads(k);
  buildConningTower(k);
  buildFairwater(k);
  buildDeckFittings(k);
  buildFraming(k);
  const parts = {};
  buildRooms(k, parts);
  k.data.parts = Object.assign(parts, buildMachines(k));
  buildDetails(k, k.data.parts);
  k.data.water = buildWater(k);
  // Sunlight under the sea by day: faint shafts slanting down behind the boat.
  const rays = new THREE.Group();
  const geo = new THREE.CylinderGeometry(1.4, 3.6, 30, 10, 1, true);
  geo.rotateX(Math.PI);
  geo.translate(0, -15, 0);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(geo, glowMaterial(0xbfe8e0));
    m.position.set(-12 + i * 14.5, 0, 9 + (i % 3) * 7);
    m.rotation.z = 0.28; m.rotation.x = 0.1;
    m.frustumCulled = false;
    rays.add(m);
  }
  k.object(rays, { overlay: true });
  k.data.rays = rays;
  captions(k);
}

// ------------------------------------------------------------------ the day: surface by night, dive by day
const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const DIVE = 5.45, SURFACE = 19.05;  // hours (dossier 4c: surface about 1900, dive before first light)
function diveState(h) {
  // 0 on the surface, 1 at periscope depth.
  if (h >= DIVE && h < DIVE + 0.14) return ease((h - DIVE) / 0.14);
  if (h >= SURFACE && h < SURFACE + 0.2) return 1 - ease((h - SURFACE) / 0.2);
  return h >= DIVE + 0.14 && h < SURFACE ? 1 : 0;
}

function setup(W, stage, k) {
  const D = k.data, P = D.parts;
  W.data.water = D.water;
  W.data.rays = D.rays;
  W.data.P = P;
  buildNav(W);
  buildCast(W, k.rng('crew'));
  settle(W);

  const surf = () => W.data.dive < 0.02;
  const running = () => W.data.dive < 0.02 && (W.hour >= SURFACE + 0.25 || W.hour < DIVE - 0.02);
  W.data.dive = diveState(W.hour);
  // Machinery.
  let propA = 0, sjA = 0, periH = [0, 0], plane = 0, torp = 0;
  W.addMachine((dt, t, w) => {
    const h = w.hour;
    const dv = diveState(h);
    w.data.dive = dv;
    const eng = running();
    // Propellers: about 120 rpm on the surface, slow on battery submerged [illustrative].
    const rps = eng ? 2.0 : 0.8;
    propA += dt * rps * Math.PI * 2;
    P.propS.rotation.x = propA; P.propP.rotation.x = -propA;
    P.shaft.rotation.x = propA;
    for (const m of P.motors) m.rotation.x = propA * 4.279;
    // Diesels and generators while charging.
    for (const c of P.couplings) c.rotation.x += dt * (eng ? 12 : 0) * Math.PI * 2 * 0.5;
    P.engineTops.forEach((g, i) => { g.position.y = 5.0 + (eng ? Math.sin(t * 75 + i) * 0.006 : 0); });
    P.auxFly.rotation.x += dt * (eng ? 20 : 0) * 0.5;
    for (const f of P.fans) f.rotation.x += dt * 30;
    P.comp.forEach((c, i) => { const on = eng && (h >= 19.5 || h < 2); c.position.y = A.spots.compressors[i][1] + (on ? Math.abs(Math.sin(t * 6 + i)) * 0.05 : 0); });
    // Periscopes: down on the surface; by day raised now and then for a look round.
    for (let i = 0; i < 2; i++) {
      let want = 0;
      if (dv > 0.95) { const c = (t + i * 40) % 90; want = i === 0 ? (c < 35 ? 1 : 0) : (c > 50 && c < 70 ? 1 : 0); }
      if (dv < 0.05 && h > 21 && h < 21.5 && i === 0) want = 1; // cleaning the periscopes at night (S43)
      periH[i] += Math.sign(want - periH[i]) * Math.min(Math.abs(want - periH[i]), dt / 8);
      P.peri[i].position.y = SHEARS.top + (SHEARS.periTop - SHEARS.top - 0.25) * ease(periH[i]);
    }
    // SJ radar sweeping on the surface.
    sjA += dt * (surf() ? 0.6 : 0);
    P.sj.rotation.y = Math.sin(sjA) * 1.4;
    // Bow planes: rigged in on the surface, rigged out to dive.
    const wantPlane = dv > 0.01 ? 1 : 0;
    plane += Math.sign(wantPlane - plane) * Math.min(Math.abs(wantPlane - plane), dt / 3);
    P.bowPlane.rotation.x = -(1 - ease(plane)) * 1.45 + (dv > 0.99 ? Math.sin(t * 0.3) * 0.08 : 0);
    // The Christmas tree: red lights for open hull openings on the surface, a green board submerged.
    P.tree.red.visible = dv < 0.02; P.tree.allGreen.visible = !P.tree.red.visible;
    // Main induction: open on the surface, shut on diving.
    P.induction.position.y = 8.79 + (dv < 0.02 ? 0.35 : 0);
    // A torpedo pulled partly out of tube 3 for its routine (S43).
    const want = h >= 19.75 && h < 21.0 ? 1 : 0;
    torp += Math.sign(want - torp) * Math.min(Math.abs(want - torp), dt / 25);
    P.torp.position.x = X.ftrF + 0.84 + 1.7 * ease(torp);
    P.torpDoor.visible = torp < 0.02;
    // Wardroom record player, the movie.
    P.record.rotation.y += dt * (h >= 20.0 && h < 22.2 ? 3.5 : 0);
    const film = h >= 20.2 && h < 22.5;
    P.sheet.visible = film;
    for (const r of P.reels) { r.visible = true; r.rotation.z -= dt * (film ? 4 : 0); }
    // Diving station wheels and depth gauges; the control stand levers and the charging ammeter.
    P.planeWheels.forEach((g, i) => { g.rotation.z = dv > 0.5 ? Math.sin(t * (0.4 + i * 0.13) + i) * 0.9 : 0; });
    P.depthNeedles.forEach((g) => { g.rotation.z = -dv * 2.4 - (dv > 0.9 ? Math.sin(t * 0.2) * 0.04 : 0); });
    P.levers.forEach((g, i) => { g.rotation.x = (eng ? (i % 5 < 3 ? 0.45 : -0.2) : (i % 5 === 1 ? 0.3 : -0.1)) + Math.sin(t * 0.05 + i) * 0.03; });
    const charge = eng ? Math.max(0, Math.min(1, ((h < 12 ? h + 24 : h) - 19.4) / 9.5)) : 1;
    P.ammeter.rotation.z = eng ? 1.0 - charge * 1.5 : -0.6 + Math.sin(t * 0.1) * 0.02;
    // Sea level.
    const L = WL + (DAY_SEA - WL) * dv;
    w.data.level = L;
  });

  // The cockroach behind the hot plates and the dog.
  W.addActor({ object: P.roach, update(dt, t, w) { const c = (t * 0.07) % 1; P.roach.position.x = 40.95 + Math.abs(c * 2 - 1) * 1.8; P.roach.rotation.y = c < 0.5 ? 0 : Math.PI; P.roach.visible = w.hour > 19 || w.hour < 6; } });
  W.addActor({ object: P.dog, update(dt, t, w) {
    const h = w.hour;
    if (h > 7 && h < 18) { P.dog.position.set(44.6, DECK.ab, 1.35); P.dog.rotation.y = 0.3; P.dog.scale.y = 0.7; return; } // asleep under the mess table
    P.dog.scale.y = 1;
    const c = (t * 0.02) % 1, u = Math.abs(c * 2 - 1);
    P.dog.position.set(43.4 + u * 8.2, DECK.ab, 0.35 + Math.sin(t * 0.4) * 0.08);
    P.dog.rotation.y = c < 0.5 ? Math.PI : 0;
  } });

  // Particles: bow wave and wake on the surface, the wet exhaust aft (S21), galley steam,
  // phosphorescence in the wake [illustrative], bubbles from the screws submerged.
  W.emitter({ kind: 'spray', x: 0.6, y: WL + 0.2, z: 1.2, w: 1.6, d: 2.2, rate: (w) => (surf() ? 7 : 0), vx: -1.2, vy: 1.4, size: [0.3, 1.2] });
  W.emitter({ kind: 'spray', x: 96.5, y: WL + 0.1, z: 1.5, w: 4, d: 3, rate: (w) => (surf() ? 3 : 0), vx: 1.4, vy: 0.4, size: [0.4, 1.4] });
  W.emitter({ kind: 'spray', x: 104, y: WL + 0.05, z: 2.5, w: 16, d: 4, rate: (w) => (surf() ? 5 : 0), vx: 0.8, vy: 0.15, size: [0.6, 2.2], alpha: 0.35, life: 3 });
  W.emitter({ kind: 'spray', x: 3.5, y: WL + 0.05, z: 4.2, w: 6, d: 1.5, rate: (w) => (surf() ? 4 : 0), vx: 0.6, vy: 0.3, size: [0.4, 1.4], alpha: 0.45 });
  for (const x of [61.9, 69.9]) {
    W.emitter({ kind: 'steam', x, y: 5.4, z: outerZ(x, 5.3) + 0.3, w: 0.4, d: 0.4, rate: (w) => (running() ? 2.5 + 2 * Math.max(0, Math.sin(w.time * 5 + x)) : 0), vx: 0.9, vy: 0.9, size: [0.4, 2.2], color: '#a8a8a4' });
    W.emitter({ kind: 'spray', x, y: 5.1, z: outerZ(x, 5.2) + 0.3, w: 0.3, d: 0.3, rate: (w) => (running() ? 4 : 0), vx: 0.6, vy: 1.2, size: [0.2, 0.8] });
  }
  W.emitter({ kind: 'mote', x: 98, y: WL + 0.15, z: 1.4, w: 8, d: 3, rate: (w) => (surf() && w.sun().night > 0.5 ? 6 : 0), color: '#9affd8', vx: 0.2, vy: 0.02, life: 4 });
  W.emitter({ kind: 'mote', x: 1.0, y: WL + 0.1, z: 1.0, w: 2, d: 2, rate: (w) => (surf() && w.sun().night > 0.5 ? 4 : 0), color: '#9affd8', vx: -0.5, vy: 0.05, life: 3 });
  W.emitter({ kind: 'steam', x: 41.6, y: DECK.ab + 1.25, z: 1.75, w: 1.6, d: 0.3, rate: (w) => (w.when([18, 4.5]) || w.when([9.5, 13]) ? 1.6 : 0), size: [0.08, 0.5], vy: 0.5, life: 1.6, alpha: 0.5 });
  W.emitter({ kind: 'bubble', x: 90.2, y: shaftY(90.2), z: SHAFT.z, w: 1.6, d: 0.8, h: 1.6, rate: (w) => (w.data.dive > 0.9 ? 9 : 0), vx: 0.6, vy: 0.6 });
  W.emitter({ kind: 'bubble', x: 47, y: 5.8, z: 2.5, w: 80, d: 2, rate: (w) => (w.data.dive > 0.05 && w.data.dive < 0.95 ? 40 : 0), vy: 1.5, size: [0.05, 0.12] });
  W.emitter({ kind: 'spray', x: 47, y: deckY(47) + 0.2, z: 1.5, w: 70, d: 2, rate: (w) => (w.data.dive > 0.02 && w.data.dive < 0.4 ? 60 : 0), vy: 4.5, size: [0.3, 1.6] });

  // Sound: the sea on the surface, the diesels charging, the motors and gears submerged.
  W.sound({ kind: 'engine', x: 62, y: 3.5, z: 1, r: 30, gain: 0.5, hz: 38, when: () => running() });
  W.sound({ kind: 'hum', x: 73, y: 2.3, z: 1.4, r: 14, gain: 0.25, hz: 92 });
  W.sound({ kind: 'machine', x: 34.4, y: 1.8, z: 1.2, r: 8, gain: 0.25, pitch: 260, rate: (w) => (running() && (w.hour >= 19.5 || w.hour < 2) ? 2.5 : 0) });
  W.sound({ kind: 'hum', x: 57, y: 5.5, z: 0.6, r: 10, gain: 0.15, hz: 140 });
  for (const [x, y] of [[20, 4], [48, 4.2], [80, 4.2]]) W.sound({ kind: 'creak', x, y, z: 1, r: 14, gain: 0.18, rate: 0.12 });
  W.sound({ kind: 'drip', x: 52, y: 2.0, z: 0.8, r: 8, gain: 0.15, rate: 0.4 });
  W.sound({ kind: 'clock', x: 25.9, y: 5.0, z: 1.8, r: 4, gain: 0.15 });

  // Guided tour.
  W.stop({ x: 47, y: 7, z: 2, w: 112, title: 'USS Pampanito, 11 March 1945', text: 'A Sunday night in the South China Sea, off the Malay Peninsula. The boat runs on the surface in the dark, her diesels charging the batteries for tomorrow’s dive. About eighty men live inside this steel tube. Zoom in anywhere, or click a man to follow him.', hold: 12, hour: 21.4 });
  W.stop({ x: 36.5, y: 10.4, z: 0.6, w: 15, title: 'The bridge', text: 'The boat runs completely darkened. The officer of the deck stands forward; lookouts on their platforms each search one slice of sea and sky. Below them the radar sweeps the dark.', hold: 11, hour: 21.5 });
  W.stop({ x: 36.2, y: 6.0, z: 1.0, w: 11, title: 'Control room and conning tower', text: 'Red light keeps the men’s night vision. At the ladder a lookout waits out his twenty minutes in red goggles; above, the helmsman, talker and radar operator keep the watch.', hold: 12, hour: 21.6 });
  W.stop({ x: 43.6, y: 4.8, z: 1.0, w: 8, title: 'Galley and mess', text: 'Under the galley light the baker kneads tomorrow’s bread. In the mess a game of acey-deucey has drawn a crowd.', hold: 12, hour: 22.1 });
  W.stop({ x: 49.6, y: 4.6, z: 1.0, w: 8, title: 'Hot bunks', text: 'Thirty-six bunks for many more men: they sleep in turns. Tonight there are letters in the bunks: the overdue mail came aboard today.', hold: 11, hour: 22.4 });
  W.stop({ x: 62.3, y: 3.8, z: 1.0, w: 17, title: 'The engine rooms', text: 'Four diesels roar so loudly that the men talk in hand signals. They drive generators: some current turns the propellers, the rest charges the batteries.', hold: 12, hour: 22.7 });
  W.stop({ x: 27.6, y: 2.6, z: 0.8, w: 10, title: 'The battery', text: 'Under the officers’ feet stand 126 cells as tall as a child. An electrician crawls along the top reading each one as the charge goes in.', hold: 11, hour: 21.6 });
  W.stop({ x: 16.8, y: 4.4, z: 1.0, w: 12, title: 'Forward torpedo room', text: 'Men sleep among the torpedoes. Tonight a torpedo is drawn half out of its tube for routine checks, and off-watch men watch a film on a sheet, as on many boats.', hold: 12, hour: 20.9 });
  W.stop({ x: 47, y: 7, z: 2, w: 112, title: 'Dive, dive', text: 'Before first light: two blasts on the alarm. The diesels stop, the vents open, the bow planes swing out, and in about thirty seconds she is at periscope depth.', hold: 13, hour: 5.42 });
  W.stop({ x: 47, y: 9, z: 2, w: 112, title: 'A day under the sea', text: 'All day she stays submerged, running slowly on her batteries; at periscope depth a periscope goes up now and then for a look round. At dusk she will surface and begin again.', hold: 12, hour: 12.0 });
  void LOW; void outerSection;
}

function update(W) {
  const w = W.data.water;
  const L = W.data.level != null ? W.data.level : WL;
  for (const b of w.parts) { const s = Math.max(0, Math.min(1, (L - b.y0) / b.h)); b.g.visible = s > 0.001; b.g.scale.y = Math.max(0.001, s); }
  w.seaSurf.position.y = L - WL; w.seaDive.position.y = L - WL; w.back.position.y = L;
  w.seaSurf.visible = L < WL + 0.5; w.seaDive.visible = !w.seaSurf.visible;
  updateSea(w.seaDive, W);
  const s = W.sun();
  const under = Math.max(0, Math.min(1, (L - 8) / 8));
  W.data.rays.visible = under > 0.01 && s.day > 0.2;
  for (const m of W.data.rays.children) { m.position.y = L; m.material.uniforms.uIntensity.value = 0.09 * under * s.day; }
}

XS.scenes.register({
  id: 'submarine', order: 100, title: 'The Submarine', subtitle: 'USS Pampanito on war patrol, March 1945',
  blurb: 'About eighty men in a steel tube, charging the batteries on the surface by night and diving at dawn.',
  bounds: { x0: -10, x1: 106, y0: -14, y1: 24, z0: 0, z1: 12 },
  frame: { x0: -4, x1: 99, y0: -3, y1: 21, z0: 0, z1: 4 },
  startHour: 20.4,
  daySeconds: 1440,
  view: { yaw: -0.3, pitch: 0.14 },
  wind: 3.2,
  clouds: 0.3,
  fog: [260, 1600, 0.55],
  focusDepth: 1.0,
  lampGain: 1.5,
  suggestedCuts: [X.fb, X.cr, X.ab, X.fer, X.man, X.atr],
  cutRange: [2, 93],
  sliceGap: 4.5,
  snapCut(x) {
    for (const c of [X.fb, X.cr, X.radio, X.ab, X.berth, X.fer, X.aer, X.man, X.atr]) if (Math.abs(x - c) < 1.2) return c;
    return Math.round(x / 0.762) * 0.762;
  },
  ambience: { sea: 0.55, wind: 0.25, room: 0.35, reverb: 0.15, size: 0.6 },
  build, setup, update,
});
