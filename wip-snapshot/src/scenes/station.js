/* The Space Station: the International Space Station on Sunday 22 May 2011 (GMT), with
 * Space Shuttle Endeavour docked, during Expedition 27 and STS-134.
 *
 * Layout plan (metres; from docs/research/station.md, section 3). The station is a cross,
 * so the drawing is a declared two-view spread, like the left and right pages of a book:
 *
 *   Panel A, x 4 to 74: along the station, seen from the port side and cut along its axis.
 *     Forward on the left. y = 0 is the module axis; z is depth towards starboard.
 *     Endeavour 4-12 (upright, nose up, bay facing the station), PMA-2 12.0-13.9, Harmony
 *     13.9-20.6, Destiny 20.6-29.8 (S0 truss on its roof, the starboard truss receding into
 *     depth to z = 51 with two wing pairs), Unity 29.8-35.3 (Z1 above, Leonardo below),
 *     PMA-1 35.3-37.1, Zarya 37.1-50.1 (Rassvet and Soyuz TMA-20 below), Zvezda's ball
 *     50.0-53.0 (Poisk and Soyuz TMA-21 above, Pirs and Progress M-10M below), Zvezda
 *     52.9-63.2, ATV-2 63.2-73.5.
 *   Panel B, x 99 to 207: across the station, seen from behind (port on the left);
 *     x = 155 + metres to starboard. The truss at y 3.0-7.6 with eight wings, and two slices
 *     pulled apart: Harmony slice at y = -8 (Kibo, ELM-PS, Exposed Facility, Harmony end-on
 *     with its four crew quarters, Columbus), Unity slice at y = -24 (PMA-3, Tranquility and
 *     the Cupola, Unity end-on, Quest). Hatches join the views: people pass through them.
 *   The Earth below (not to scale), with the ground inset of control rooms along its top.
 *   Suggested cuts at real joints: 20.6, 29.8, 50.1, 63.2 (Panel A); 148.3, 161.7 (truss joints).
 *
 * The outside light follows the orbit (sunrise every ~91.5 minutes of the GMT clock), not the
 * crew's day: see orbitalSun(). Sources and confidence flags: docs/research/station.md.
 */
import { XS, THREE, Kit, mat, anims, newPose } from '../engine/index.js';
import { M, ORBIT_MIN, DAYF, orbitPhase } from './station/common.js';
import { buildOrbiter } from './station/orbiter.js';
import { buildSpine, buildStarboardTrussA, XA } from './station/spine.js';
import { buildAcross, XB, TY, TZ, HY, UY } from './station/across.js';
import { buildEarth, buildClouds, buildGround, EARTH, GROUND } from './station/earth.js';
import { buildNav, buildCast } from './station/people.js';

const SP = {}; // named spots, filled while building
const BACKDROP = { meshes: [], parts: [], group: null, off: null };
const PARTS = {}; // moving parts, filled while building
const { smoothstep } = XS.math;

const JOINTS = [12.0, 13.9, 20.6, 29.8, 35.3, 37.1, 50.1, 52.9, 61.0, 63.2, XB.p5[0], XB.p34[0], XB.p1[0], XB.s0[0], XB.s1[0], XB.s34[0], XB.s5[0], XB.s6[0], 141.6, 152.85, 157.15, 164.1];

// ------------------------------------------------------------------ orbital day and night
function orbitalSun(h) {
  const ph = orbitPhase(h);
  const e = 0.022;
  const day = smoothstep(0, e, ph) * (1 - smoothstep(DAYF - e, DAYF, ph));
  const dist = Math.min(ph, 1 - ph, Math.abs(ph - DAYF));
  const dusk = Math.max(0, 1 - dist / 0.045);
  const hour = day > 0.02 ? 6.4 + 11.2 * Math.min(1, ph / DAYF) : 21;
  return { day, dusk, hour, night: 1 - day, phase: ph };
}
// The next clock hour at or after h that is in orbital day (or night), for tour stops.
function hourWhen(h, wantDay) {
  for (let i = 0; i < 400; i++) {
    const hh = (h + i * 0.02) % 24, ph = orbitPhase(hh);
    const mid = wantDay ? Math.abs(ph - DAYF / 2) < DAYF * 0.25 : ph > DAYF + 0.08 && ph < 0.94;
    if (mid) return +hh.toFixed(2);
  }
  return h;
}

// ------------------------------------------------------------------ build
// A curved arrow between the two views: the truss, turned through a right angle to face you.
function joinArrow(k) {
  const INK = mat({ c: '#c8b48a', c2: '#a8946a', whole: true });
  const pts = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24, a = Math.PI * (0.15 + 0.7 * t); pts.push([86 - Math.cos(a) * 11, 6 + Math.sin(a) * 7, 2]); }
  k.tube(pts, 0.22, INK, { seg: 8 });
  const e = pts[pts.length - 1], d = pts[pts.length - 2];
  const dx = e[0] - d[0], dy = e[1] - d[1], L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  k.tri([e[0] + ux * 1.6, e[1] + uy * 1.6, 2], [e[0] - uy * 0.8, e[1] + ux * 0.8, 2], [e[0] + uy * 0.8, e[1] - ux * 0.8, 2], INK);
  k.tri([e[0] + ux * 1.6, e[1] + uy * 1.6, 2.01], [e[0] + uy * 0.8, e[1] - ux * 0.8, 2.01], [e[0] - uy * 0.8, e[1] + ux * 0.8, 2.01], INK);
}

function build(k) {
  joinArrow(k);
  buildOrbiter(k, SP);
  buildSpine(k, SP, PARTS);
  buildStarboardTrussA(k, PARTS);
  buildAcross(k, SP, PARTS);
  // The Earth is a backdrop, not part of the cutaway: it is built with its own kit and drawn once
  // with the sky (see setup), so opening slices never splits the planet.
  const ek = new Kit(k.scene, { local: true });
  buildEarth(ek);
  PARTS.clouds = buildClouds(ek);
  BACKDROP.meshes = ek.meshes();
  BACKDROP.parts = ek.parts.slice();
  buildGround(k);
  captions(k);
}

function captions(k) {
  // ---------------------------------------------------------------- the whole
  k.label({ x: 22, y: 9.5, z: 0, title: 'The International Space Station, 22 May 2011', text: 'About 420 tonnes, room for a permanent crew of six. For a few days this month, twelve people live aboard: six station crew and six from Endeavour.', min: 2, max: 14, priority: 3, side: 'left',
    body: 'In May 2011 the station weighed about 420 tonnes and held more than 916 cubic metres of pressurised space, room for a permanent crew of six.', source: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/International_Space_Station/About_the_International_Space_Station' });
  k.label({ x: 86, y: 13.2, z: 2, title: 'Two views of one station', text: 'Left: along the modules, seen from the port side. Right: across the truss, seen from behind, with two slices pulled apart. The truss crosses the module line at right angles above Destiny.', min: 2, max: 9, priority: 2, side: 'right' });
  k.label({ x: 20, y: -45, z: 300, title: 'The Earth, about 350 km below', text: 'The station circles it about every 90 minutes at 28,000 km/h: 16 sunrises and 16 sunsets a day. Here the light follows the orbit; the crew\u2019s day follows the clock.', min: 2, priority: 1,
    body: 'The station circles the Earth about every 90 minutes, travelling through 16 sunrises and 16 sunsets every day.', source: 'https://www.nasa.gov/international-space-station/space-station-facts-and-figures/' });
  // ---------------------------------------------------------------- Panel A
  k.label({ x: 6.5, y: 9.6, z: 0.5, title: 'Endeavour', text: 'Docked nose to deep space, its open payload bay facing the station. Standing on end, its middeck and flight deck run up the page.', min: 3, priority: 2,
    body: 'Endeavour docked with its nose pointing to deep space and its payload bay toward the station. STS-134 was the orbiter\u2019s 25th and final mission.', source: 'https://www.cbsnews.com/network/news/space/home/spacenews/files/553e7b1a2ca4c8e5f63072095033d29b-242.html' });
  k.label({ x: 16.2, y: 1.2, z: 0.9, title: 'Crew quarters', text: 'Four private sleeping booths, each about the size of a phone box, form a ring inside Harmony (seen end-on at right).', min: 12,
    body: 'Each crew quarter has a sleeping bag, a lamp, an air vent and a laptop. Sleepers stay near an air vent: in weightlessness, the carbon dioxide they breathe out could gather in a bubble around their heads.', source: 'https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/sleeping-in-space.asp' });
  k.label({ x: 24.5, y: 1.6, z: 1.0, title: 'Destiny, the US laboratory', text: 'Twenty-four equipment racks: 13 for science and 11 for running the station.', min: 7, priority: 1, body: 'Destiny holds 24 equipment racks, 13 for science and 11 for running the station, and a 51-centimetre Earth-facing window used for scientific photography of the planet below.', source: 'https://www.nasa.gov/pdf/508318main_ISS_ref_guide_nov2010.pdf' });
  k.label({ x: 25.2, y: -1.75, z: 0.5, title: 'Science window', text: '51 centimetres across, facing the Earth.', min: 22 });
  k.label({ x: 32.55, y: 1.4, z: 1.0, title: 'Unity: crossroads and dining room', text: 'Shuttle crews stick their mission patches on its walls.', min: 9, priority: 1 });
  k.label({ x: 31.15, y: -0.2, z: 0.5, title: 'Dinner', text: 'Three meals and a snack a day; every packet has a Velcro dot so it cannot float away.', min: 20,
    body: 'Each astronaut gets three meals and a snack a day, 1,900 to 3,200 calories. Space food must make minimal crumbs, so tortillas are on the menu, and salt comes dissolved in water.', source: 'https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/eating-in-space.asp' });
  k.label({ x: 32.55, y: -5.5, z: 0.6, title: 'Leonardo', text: 'Once a shuttle cargo canister; bolted to Unity for good on 1 March 2011 as a storeroom.', min: 8 });
  k.label({ x: 32.55, y: 5.4, z: 0.6, title: 'Control moment gyroscopes', text: 'Four 98-kilogram steel wheels spin at 6,600 rpm. Tilting them steers the station without fuel.', min: 9,
    body: 'Inside the Z1 truss, four steel wheels of 98 kilograms each spin at 6,600 revolutions a minute. Tilting them steers the whole station without using fuel. (The drawing turns them far more slowly.)', source: 'https://www.nasa.gov/pdf/508318main_ISS_ref_guide_nov2010.pdf' });
  k.label({ x: 44, y: 1.4, z: 0.8, title: 'Zarya', text: 'The first element, launched in 1998: now mostly storage, with propellant tanks.', min: 9 });
  k.label({ x: 39.6, y: -12.0, z: 0.5, title: 'Soyuz TMA-20', text: 'Tomorrow it takes three crew home: undocking was at 21:35 GMT on 23 May 2011.', min: 7,
    body: 'A Soyuz can stay docked for up to 200 days. It has three parts: an orbital module, the descent module that lands, and an instrument and propulsion module with solar wings.', source: 'https://www.nasa.gov/pdf/508318main_ISS_ref_guide_nov2010.pdf' });
  k.label({ x: 51.5, y: 11.5, z: 0.5, title: 'Soyuz TMA-21', text: 'Docked on Poisk, on the side away from the Earth.', min: 9 });
  k.label({ x: 51.5, y: -11.5, z: 0.5, title: 'Progress M-10M', text: 'A cargo ship carrying up to 2,250 kg. Filled with rubbish, it will finally burn up in the atmosphere.', min: 9 });
  k.label({ x: 57.5, y: 1.6, z: 0.9, title: 'Zvezda', text: 'The heart of the Russian half: galley table, two cabins, toilet, treadmill, and the station\u2019s engines.', min: 7, priority: 1,
    body: 'Zvezda was the first fully Russian part of the station and is still the heart of its Russian half: galley table, two crew cabins, toilet, treadmill and engines. It carries 32 small steering thrusters, each pushing with about 13 kilograms of force.', source: 'https://www.nasa.gov/pdf/508318main_ISS_ref_guide_nov2010.pdf' });
  k.label({ x: 56.9, y: 0.3, z: 1.6, title: 'Elektron', text: 'Splits water into oxygen to breathe and hydrogen, which is dumped overboard.', min: 22 });
  k.label({ x: 53.45, y: 0.9, z: 0.8, title: 'Station clock', text: 'The station runs on Greenwich Mean Time, a compromise between Houston and Moscow.', min: 22 });
  k.label({ x: 68.5, y: 2.6, z: 0.5, title: 'ATV-2 Johannes Kepler', text: 'Europe\u2019s space freighter. Its engines raised the station\u2019s orbit from about 350 to 400 kilometres.', min: 6 });
  // ---------------------------------------------------------------- Panel B
  k.label({ x: 155, y: TY + 2.4, z: TZ, title: 'The truss', text: '108.5 metres long. It carries the solar wings, the radiators and the rails of a railway for the robot arm.', min: 3, priority: 2,
    body: 'The Mobile Transporter that carries the robot arm along the truss is "the slowest and fastest train in the universe": 2.5 centimetres a second along the truss, 27,600 km/h around the Earth.', source: 'https://www.planetary.org/articles/20151218-mt-jams-contingency-spacewalk' });
  k.label({ x: 108.4, y: 30, z: 0.5, title: 'Solar wings', text: 'Each of the eight wings is about 35 metres long.', min: 3, priority: 1, body: 'Together the eight solar wings carry 262,400 solar cells. Two giant rotary joints turn the outer wings at four degrees a minute, one full turn every orbit, so the cells always face the Sun.', source: 'https://news.lockheedmartin.com/2006-08-21-Massive-Lockheed-Martin-Solar-Arrays-to-Be-Launched-to-International-Space-Station' });
  k.label({ x: XB.sarjP, y: TY - 1.6, z: TZ, title: 'Solar rotary joint', text: 'Turns the outer truss at four degrees a minute, one turn every orbit. Today the spacewalkers grease it.', min: 9 });
  k.label({ x: 141.45, y: TY - 2.6, z: 8, title: 'Radiators', text: 'They shed waste heat into space using ammonia, so toxic that the heat exchangers are mounted outside.', min: 6 });
  k.label({ x: SP.ams[0], y: SP.ams[1] + 0.4, z: TZ, title: 'Alpha Magnetic Spectrometer', text: 'New on the S3 truss: a particle detector delivered by Endeavour to study the origins of the universe.', min: 6 });
  k.label({ x: 147, y: HY + 1.6, z: 1.0, title: 'Kibo', text: 'The station\u2019s largest single room: 11.2 metres long, with places for 23 racks.', min: 6, priority: 1,
    body: 'Kibo has its own small airlock for passing experiments out to its open-air porch. It is not designed for spacewalkers.', source: 'https://iss.jaxa.jp/en/kibo/about/kibo/jpm/' });
  k.label({ x: 140.0, y: HY + 3.0, z: 1.0, title: 'Kibo\u2019s robot arm', text: '10 metres long, creeping at 2 to 6 centimetres a second depending on its load.', min: 10, body: 'Kibo\u2019s 10-metre robot arm moves at 20 to 60 millimetres a second, depending on what it carries. A 2.2-metre small fine arm fits on its end.', source: 'https://iss.jaxa.jp/en/kibo/about/kibo/rms/' });
  k.label({ x: 160.7, y: HY + 1.6, z: 1.0, title: 'Columbus', text: 'Europe\u2019s laboratory: 6.9 metres long, ten experiment racks, run from a control centre near Munich.', min: 7 });
  k.label({ x: 149.5, y: UY + 1.6, z: 1.0, title: 'Tranquility', text: 'Air, oxygen and water recycling, the toilet, and the gym.', min: 7, priority: 1,
    body: 'Machines in Tranquility turn urine and the moisture in cabin air back into drinking water and oxygen.', source: 'https://www.nasa.gov/pdf/508318main_ISS_ref_guide_nov2010.pdf' });
  k.label({ x: 147.3, y: UY + 0.9, z: 1.0, title: 'Toilet', text: 'A current of air, not gravity, draws waste away.', min: 18, body: 'The space toilet uses a current of air instead of gravity to draw waste away into a waste compartment.', source: 'https://www.asc-csa.gc.ca/eng/astronauts/living-in-space/personal-hygiene-in-space.asp' });
  k.label({ x: 147.45, y: UY + 0.5, z: 0.6, title: 'ARED', text: 'Vacuum cylinders give up to 272 kg of resistance: a barbell that works without gravity. Everyone is scheduled 2.5 hours of exercise a day.', min: 18, body: 'Every crew member is scheduled 2.5 hours a day for exercise, including setting up and packing away.', source: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4971634/' });
  k.label({ x: 151.2, y: UY - 0.3, z: 0.6, title: 'Treadmill', text: 'Runners are held down by a harness and bungees pulling with 60 to 85 percent of their weight.', min: 18,
    body: 'Treadmill running is the loudest daily noise aboard, about 77 decibels, over a background hum of 56 to 69 decibels.', source: 'https://ntrs.nasa.gov/citations/20100031889' });
  k.label({ x: 149.5, y: UY - 3.3, z: 0.4, title: 'The Cupola', text: 'Seven windows. The round one, 80 cm across, is the largest window ever flown in space.', min: 7, priority: 1,
    body: 'The Cupola\u2019s round top window is 80 centimetres across, the largest window ever flown in space; six more windows surround it. From the Cupola an astronaut can drive the station\u2019s robot arm while watching it through the windows.', source: 'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Node-3_Cupola/Wonderful_vistas_from_Cupola' });
  k.label({ x: 159.8, y: UY + 1.4, z: 1.0, title: 'Quest airlock', text: 'One room for servicing spacesuits, and a smaller one that is emptied of air when spacewalkers go out. A US suit weighs 178 kg on Earth.', min: 7,
    body: 'The night before this spacewalk, the two walkers slept in Quest with the air pressure lowered to 10.2 psi, part of their preparation for going outside.', source: 'http://www.cbsnews.com/network/news/space/home/flightdata/sts134.html' });
  k.label({ x: 125, y: TY - 4.2, z: 1.0, title: 'Today\u2019s spacewalk', text: 'Two of Endeavour\u2019s crew spend 8 hours 7 minutes outside.', min: 5, priority: 1,
    body: 'Today\u2019s jobs outside: top up an ammonia cooling line and grease the port solar rotary joint. Spacewalkers are told apart by stripes: today the lead wears red stripes and his partner a plain white suit.', source: 'http://www.cbsnews.com/network/news/space/home/flightdata/sts134.html' });
  // ---------------------------------------------------------------- the ground
  k.label({ x: 100, y: -40, z: 2, title: 'Meanwhile, on the ground', text: 'Control rooms in Houston, Huntsville, Saint-Hubert, Toulouse, Oberpfaffenhofen, Moscow and Tsukuba, from west to east (not to scale).', min: 2.5, priority: 1 });
  void M; void UY; void XA; void GROUND;
}

// Start everyone where their routine has them at the opening hour, rather than gliding there.
function settle(W) {
  const inH = (h, w) => !w || (w[0] <= w[1] ? h >= w[0] && h < w[1] : h >= w[0] || h < w[1]);
  for (const p of W.people) {
    if (!p.routine) continue;
    const i = p.routine.findIndex((st) => inH(W.hour, st.when));
    if (i < 0) continue;
    const st = p.routine[i], pos = W.resolve(st.at);
    p.x = pos.x; p.y = pos.y; p.z = pos.z;
    p.node = typeof st.at === 'string' ? st.at : null;
    p.tilt = st.tilt || 0;
    // Already arrived and busy: the engine picks the next step when this one's time is up.
    p.step = i; p.moving = false; p.path = null; p.stepT = 0;
    p.stepDur = Array.isArray(st.dur) ? st.dur[0] + (st.dur[1] - st.dur[0]) * ((i * 37 + p.x * 13) % 1) : st.dur || 20;
    p.anim = st.act || 'stand';
    if (st.face != null) p.heading = p.targetHeading = XS.faceToHeading(st.face);
    if (st.prop !== undefined) p.prop = st.prop;
    p.seat = st.seat != null ? st.seat : null;
    if (p.onUpdate) p.onUpdate(p, 0, 0);
  }
}

// ------------------------------------------------------------------ setup
function setup(W, stage, k) {
  W.sun = () => orbitalSun(W.hour);
  // Hang the Earth in the sky scene (mirrored in z like the stage root); take it down again when
  // another scene loads.
  const takeDown = () => {
    const G = BACKDROP.group;
    if (!G) return;
    if (G.parent) G.parent.remove(G);
    G.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    BACKDROP.group = null;
  };
  takeDown();
  const g = new THREE.Group();
  g.scale.z = -1;
  for (const m of BACKDROP.meshes) g.add(m);
  for (const p of BACKDROP.parts) g.add(p);
  stage.sky.scene.add(g);
  BACKDROP.group = g;
  if (BACKDROP.off) BACKDROP.off();
  BACKDROP.off = XS.bus.on('scene', (e) => { if (e.scene.id !== 'station') takeDown(); });
  buildNav(W, SP);
  const cast = buildCast(W, SP, { k });
  W.data.cast = cast;
  settle(W);
  // Spacewalkers' backpacks follow their torsos, and the lead's suit has red stripes on the legs.
  W.data.packs = SP.walkers.map((p) => {
    const g = k.part(0, 0, 0, (q) => {
      if (p === SP.walkers[0]) for (const zz of [-0.1, 0.1]) for (const y of [0.25, 0.5]) q.box(-0.075, y, zz - 0.075, 0.075, y + 0.07, zz + 0.075, mat({ c: '#b84a32', whole: true }));
    });
    const torso = k.part(0, 0, 0, (q) => {
      q.box(-0.4, 0.0, -0.21, -0.14, 0.62, 0.21, mat({ c: '#e8e6de', c2: '#cfcdc4', pat: 'panels', s: 0.2, whole: true }));
      q.box(-0.42, 0.5, -0.12, -0.36, 0.6, 0.12, mat({ c: '#c8a040', whole: true }));
    });
    k.parts.splice(k.parts.indexOf(torso), 1);
    g.add(torso);
    return { p, g, torso };
  });
  // ---------------------------------------------------------------- machines
  const st = { portAng: 0, starAng: 0 };
  W.addMachine((dt, t, w) => {
    const ph = orbitPhase(w.hour);
    // Rotary joints: one turn per orbit, the cells facing the Sun at orbital noon.
    const ang = (ph - DAYF / 2) * Math.PI * 2;
    const eva = w.hour > 5.9 && w.hour < 14.6; // the port joint is held still while it is greased
    const step = (from, to, max) => { let d = ((to - from + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return from + Math.max(-max, Math.min(max, d)); };
    st.portAng = step(st.portAng, eva ? 0 : ang, dt * 0.6);
    st.starAng = step(st.starAng, ang, dt * 0.6);
    PARTS.sarjB[0].rotation.x = st.portAng;
    PARTS.sarjB[1].rotation.x = st.starAng;
    // Main radiators turn slowly on their beams.
    const rad = Math.sin(t * 0.03) * 0.35 - 0.25;
    for (const g of PARTS.hrsB) g.rotation.x = rad;
    PARTS.hrsA.rotation.z = -0.35 + Math.sin(t * 0.03) * 0.3;
    // Control moment gyroscopes (6,600 rpm in reality: drawn as a slow, steady turn).
    for (const g of PARTS.cmg) g.rotation.z = t * 9;
    PARTS.centrifuge.rotation.z = t * 5;
    // Exercise machines, when someone is on them.
    const pc = cast.people;
    const on = (spot, act) => pc.some((p) => !p.moving && p.anim === act && Math.abs(p.x - spot[0]) < 0.6 && Math.abs(p.y - spot[1]) < 0.6);
    if (on(SP.cevis, 'cycle')) PARTS.cevis.rotation.z = -t * 5.5;
    const sq = pc.find((p) => !p.moving && p.anim === 'squat');
    PARTS.aredBar.position.y = UY + 0.1 - (sq ? (0.5 - 0.5 * Math.cos(((t * 0.4 + sq.ph) % 1) * Math.PI * 2)) * 0.28 : 0);
    // Robot arms: very slow movements.
    const A = PARTS.arm;
    A.base.rotation.y = Math.sin(t * 0.011) * 0.4;
    A.boomA.rotation.z = 0.55 + Math.sin(t * 0.017) * 0.12;
    A.boomB.rotation.z = -2.1 + Math.sin(t * 0.013 + 1) * 0.15;
    const K = PARTS.kiboArm;
    K.base.rotation.z = 0.35 + Math.sin(t * 0.02) * 0.1;
    K.a.rotation.z = 0.6 + Math.sin(t * 0.023 + 2) * 0.12;
    K.b.rotation.z = 1.9 + Math.sin(t * 0.019) * 0.15;
    // Clouds drift left (the station flies to the right).
    const C = PARTS.clouds, s = (t * 0.0009) % C.W;
    C.a.quaternion.setFromAxisAngle(C.axis, s); C.b.quaternion.setFromAxisAngle(C.axis, s - C.W);
    // Empty suits on their stands when nobody is wearing them.
    for (const [i, w2] of SP.walkers.entries()) PARTS.emu[i].visible = !w2.suited;
    // Backpacks on the spacewalkers, following the same pose as their figures.
    for (const { p, g, torso } of W.data.packs) {
      g.visible = !!p.suited && !p.hidden;
      if (!g.visible) continue;
      const P = newPose();
      P.prop = null; P.rot = 0; P.rootX = 0;
      (anims.table[p.anim] || anims.table.stand)(p, t, P);
      g.position.set(p.x, p.y, p.z);
      g.rotation.order = 'YZX';
      g.rotation.set(0, -p.heading, -(P.rot || 0));
      g.scale.setScalar(p.H / 1.7);
      torso.position.set((P.rootX || 0) * 1.7, P.rootY * 1.7, 0);
      torso.rotation.set(0, 0, -(P.lean || 0));
    }
    void w;
  });
  // ---------------------------------------------------------------- small life
  // Drops of water drifting over the Unity table, as spheres.
  const drops = k.part(SP.unityTable, 0.05, 0.5, (q) => {
    const D = mat({ c: '#cfe4ee', c2: '#ffffff', noEdge: true });
    for (let i = 0; i < 4; i++) q.sphere(i * 0.13 - 0.2, 0, 0, 0.018 + i * 0.006, D, { seg: 8, rings: 5 });
  });
  W.addActor({ object: drops, update(dt, t) { drops.position.set(SP.unityTable + Math.sin(t * 0.07) * 0.25, 0.05 + Math.sin(t * 0.11) * 0.12, 0.5 + Math.sin(t * 0.05) * 0.1); drops.rotation.z = t * 0.05; } });
  // The water bags Leon tows from Endeavour: a short chain trailing behind him.
  const leon = cast.people.find((p) => p.name === 'Leon Pruitt');
  const chain = k.part(0, 0, 0, (q) => { for (let i = 0; i < 3; i++) q.sphere(-0.55 - i * 0.42, 0, 0, 0.17, mat({ c: '#eef0ee', c2: '#d8dcdc', pat: 'canvas' }), { seg: 10, rings: 6 }); });
  const trail = [];
  W.addActor({ object: chain, update() {
    const on = leon && leon.routine && leon.step >= 0 && /water bags/.test(leon.routine[leon.step].label || '');
    chain.visible = !!on;
    if (!on) return;
    const last = trail[trail.length - 1];
    if (!last || Math.hypot(last[0] - leon.x, last[1] - leon.y) > 0.1) { trail.push([leon.x, leon.y, leon.z]); if (trail.length > 40) trail.shift(); }
    const head = trail[Math.max(0, trail.length - 6)] || [leon.x, leon.y, leon.z];
    const dir = trail.length > 6 ? Math.atan2(leon.y - head[1], leon.x - head[0]) : 0;
    chain.position.set(leon.x, leon.y + 0.85, leon.z + 0.05);
    chain.rotation.z = dir;
  } });
  // Wake-up music for the shuttle crew, played up from Houston.
  W.sound({ kind: 'strings', x: 5.6, y: 4.5, z: 1, r: 14, gain: 0.35, when: [1.43, 1.62] });
  // ---------------------------------------------------------------- particles
  // Attitude-thruster puffs: rare and brief.
  W.emitter({ kind: 'steam', x: 60.7, y: 1.8, z: 0.6, rate: (w) => (Math.sin(w.time * 0.37) > 0.995 ? 6 : 0), vy: 2.5, spread: 0.4, size: [0.15, 1.2], life: 1.2, alpha: 0.5 });
  W.emitter({ kind: 'steam', x: 5.0, y: 9.6, z: 0.8, rate: (w) => (Math.sin(w.time * 0.29 + 2) > 0.996 ? 8 : 0), vx: -2.5, vy: 0.5, spread: 0.3, size: [0.15, 1.0], life: 1.0, alpha: 0.5 });
  // Ammonia vented from the P5-P6 line during the spacewalk: a sprinkle of white crystals (illustrative look).
  W.emitter({ kind: 'snow', x: 119.0, y: TY - 2.4, z: 1.2, w: 0.4, d: 0.4, rate: 14, vx: -0.7, vy: -0.3, spread: 0.6, life: 9, when: [9.6, 10.2] });
  // Motes of dust drifting in the lamplight of the modules.
  W.emitter({ kind: 'mote', x: 25, y: 0.2, z: 0.6, w: 14, h: 1.6, d: 0.8, rate: 1.5, vy: 0.02, spread: 0.05 });
  W.emitter({ kind: 'mote', x: 57, y: 0.0, z: 0.6, w: 8, h: 1.6, d: 0.8, rate: 1.0, vy: 0.02, spread: 0.05 });
  // ---------------------------------------------------------------- sound
  for (const [x, y] of [[17, 0], [25, 0], [32.5, 0], [44, 0], [57, 0], [147, HY], [160, HY], [150, UY], [158, UY]]) W.sound({ kind: 'hum', x, y, z: 1, r: 10, gain: 0.18, hz: 118 + (x % 7) * 3 });
  W.sound({ kind: 'machine', x: 151.2, y: UY, z: 0.6, r: 8, gain: 0.3, pitch: 180, rate: (w) => (cast.people.some((p) => p.anim === 'runH' && p.x > 140) ? 2.6 : 0) });
  W.sound({ kind: 'machine', x: 54.8, y: -0.5, z: 0.6, r: 8, gain: 0.3, pitch: 170, rate: (w) => (cast.people.some((p) => p.anim === 'runH' && p.x < 70) ? 2.6 : 0) });
  W.sound({ kind: 'machine', x: 147.4, y: UY, z: 0.6, r: 6, gain: 0.25, pitch: 260, rate: (w) => (cast.people.some((p) => p.anim === 'squat') ? 0.4 : 0) });
  for (const id of Object.keys(GROUND)) { const R = GROUND[id]; W.sound({ kind: 'hum', x: R.xm, y: R.y + 1, z: 4, r: 12, gain: 0.1, hz: 60 }); }
  // ---------------------------------------------------------------- tour
  const day = (h) => hourWhen(h, true), night = (h) => hourWhen(h, false);
  W.stop({ x: 104, y: -4, z: 4, w: 235, title: 'Twelve people, five spacecraft', text: 'The International Space Station on Sunday 22 May 2011, with Endeavour docked on its last flight. The station is a cross, so it is drawn twice: along its modules on the left, across its truss on the right.', hold: 11, hour: day(9.2) });
  W.stop({ x: 10, y: -8, z: 1, w: 60, title: 'Endeavour', text: 'The orbiter docks nose to deep space with its payload bay facing the station. Its crew sleep in the middeck, whose floor here runs up the page.', hold: 10 });
  W.stop({ x: 24, y: 0.5, z: 0.6, w: 22, title: 'Harmony and Destiny', text: 'Racks line four walls: the laboratory, the crew quarters, the bicycle with no seat. Up is wherever you decide it is.', hold: 10, hour: day(13.6) });
  W.stop({ x: 33, y: -2.5, z: 0.6, w: 18, title: 'Unity, the dining room', text: 'Meals are eaten around a small table, packets Velcroed down. Below is Leonardo, the storeroom; above, the gyroscopes that steer the station.', hold: 10, hour: day(12.6) });
  W.stop({ x: 55, y: -0.5, z: 0.6, w: 26, title: 'The Russian segment', text: 'Zvezda has the galley table, two cabins, a treadmill and the engines. Two Soyuz ships and a Progress freighter are docked above and below.', hold: 11, hour: day(14.3) });
  W.stop({ x: 126, y: 4, z: 1, w: 30, title: 'The spacewalk', text: 'Two of Endeavour’s crew spent 8 hours 7 minutes outside: refilling an ammonia cooling line and greasing the port solar rotary joint.', hold: 11, hour: day(9.0) });
  W.stop({ x: 154, y: 14, z: 2, w: 125, title: 'The truss', text: 'Eight solar wings, each about 35 metres long, turn once every orbit to follow the Sun.', hold: 10 });
  W.stop({ x: 152, y: -8, z: 0.6, w: 26, title: 'Night in Harmony', text: 'In the orbital night the crew quarters glow. Each sleeper floats in a bag tied to the wall, near an air vent.', hold: 11, hour: night(1.0) });
  W.stop({ x: 151, y: -25, z: 0.6, w: 18, title: 'The Cupola', text: 'Seven windows facing the Earth: the favourite place aboard for a long-lens photograph of the planet.', hold: 10, hour: night(21.2) });
  W.stop({ x: 100, y: -43, z: 3, w: 120, title: 'Meanwhile, on the ground', text: 'Control rooms on three continents follow the station day and night.', hold: 10, hour: day(10.0) });
  void stage; void EARTH; void ORBIT_MIN; void XA; void TZ;
}

function update(W, dt, t, stage) {
  // There is no weather in orbit.
  if (stage.weather && stage.weather.kind !== 'clear') stage.weather.set('clear');
  void dt; void t;
}

XS.scenes.register({
  id: 'station',
  order: 90,
  title: 'The Space Station',
  subtitle: 'The International Space Station, 22 May 2011',
  blurb: 'Twelve people, five spacecraft and a sunrise every hour and a half, with Endeavour docked on its last flight.',
  bounds: { x0: -6, x1: 216, y0: -54, y1: 46, z0: 0, z1: 56 },
  frame: { x0: -2, x1: 212, y0: -50, y1: 44, z0: 0, z1: 6 },
  view: { yaw: -0.42, pitch: 0.26 },
  startHour: 9.3,
  daySeconds: 1440,
  wind: 0,
  clouds: 0,
  fog: [1700, 4600, 0.42],
  horizon: -0.34,
  skyTop: '#020308',
  skyBot: '#183660',
  ambient: { sky: '#d6d6d4', ground: '#b4c2d6' },
  lampGain: 2.6,
  suggestedCuts: [20.6, 29.8, 50.1, 63.2, 148.3, 161.7],
  snapCut: (x) => { let b = x, bd = 2.0; for (const j of JOINTS) { const d = Math.abs(j - x); if (d < bd) { bd = d; b = j; } } return Math.round(b * 100) / 100; },
  sliceGap: 7,
  focusDepth: 1.5,
  minDist: 2,
  maxDist: 1100,
  ambience: { room: 0.35, reverb: 0.08, size: 0.7 },
  build, setup, update,
});
