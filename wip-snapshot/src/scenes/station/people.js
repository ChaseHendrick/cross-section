/* The Space Station: weightless animations, the navigation graph and the cast.
 *
 * Aboard: the twelve people of 22 May 2011, as fictional stand-ins for the real roles
 * (dossier section 4d). On the ground: thirty named controllers and the console teams
 * of seven control centres (the dossier's ground inset). All names are invented.
 */
import { anims, costume } from '../../engine/index.js';
import { FEET } from './spine.js';
import { HY, UY, TY, TZ } from './across.js';
import { GROUND } from './earth.js';

const { sin, cos, PI, abs, hypot } = Math;

// ------------------------------------------------------------------ animations (weightless)
// p.tilt turns the whole body about the feet (upside down in the Cupola, sideways in the orbiter).
function float(p, t, P) {
  const b = sin(t * 0.6 + p.ph), rest = ((p.ph * 7.3) % 1 - 0.5) * 0.62;
  // Neutral body posture: knees drawn up, arms drifting forward, the body never quite upright.
  P.rootY = 0.62 + b * 0.015; P.lean = 0.08 + sin(t * 0.37 + p.ph) * 0.06;
  P.thF = 0.75 + b * 0.05; P.shF = -1.05; P.thB = 0.5; P.shB = -0.85;
  P.uaF = -0.85 + b * 0.1; P.faF = 0.85; P.uaB = -0.6 - b * 0.08; P.faB = 0.9;
  P.head = sin(t * 0.3 + p.ph * 2) * 0.1 - 0.05;
  P.rot = (p.tilt || 0) + rest + sin(t * 0.21 + p.ph) * 0.05;
  return P;
}
anims.register('float', float);
anims.register('floatWork', (p, t, P) => {
  float(p, t, P);
  const s = sin(t * 3.4 + p.ph);
  P.lean = 0.22; P.uaF = -0.85 + s * 0.12; P.faF = 1.35 + s * 0.2; P.uaB = -0.75 - s * 0.08; P.faB = 1.45; P.head = 0.35;
  P.thF = 0.25; P.shF = -0.35; P.thB = 0.15; P.shB = -0.3;
  return P;
});
anims.register('floatTalk', (p, t, P) => {
  float(p, t, P);
  const g = sin(t * 2.1 + p.ph) * 0.5 + 0.5;
  P.uaF = -0.4 - g * 0.6; P.faF = 1.2 + sin(t * 3.1 + p.ph) * 0.3; P.head = sin(t * 1.5 + p.ph) * 0.1;
  P.mouth = sin(t * 10 + p.ph) > 0.2 ? 1 : 0;
  return P;
});
anims.register('floatRead', (p, t, P) => {
  float(p, t, P);
  P.uaF = -0.65; P.faF = 1.6; P.uaB = -0.55; P.faB = 1.65; P.head = 0.4; P.lean = 0.12;
  return P;
});
anims.register('floatEat', (p, t, P) => {
  float(p, t, P);
  const c = (t * 0.45 + p.ph) % 1, up = c < 0.25 ? sin((c / 0.25) * PI) : 0;
  P.uaF = -0.45 - up * 0.9; P.faF = 1.3 + up * 1.0; P.uaB = -0.6; P.faB = 1.3; P.lean = 0.1; P.head = -0.05 + up * 0.1;
  P.mouth = up > 0.6 ? 1 : 0;
  return P;
});
anims.register('floatPhoto', (p, t, P) => {
  float(p, t, P);
  P.uaF = -1.55; P.faF = 1.5; P.uaB = -1.35; P.faB = 1.7; P.head = -0.05 + sin(t * 0.2 + p.ph) * 0.05;
  P.prop = 'telescope'; P.propAng = PI / 2 - 0.05;
  return P;
});
// Gliding from handhold to handhold: body stretched out along the direction of travel.
anims.register('glide', (p, t, P) => {
  const tg = p.path && p.path[p.pi];
  let vert = 0;
  if (tg) { const dy = tg.y - p.y, dh = hypot(tg.x - p.x, tg.z - p.z); if (abs(dy) > dh * 1.2 && abs(dy) > 0.05) vert = dy > 0 ? 1 : -1; }
  const s = sin(t * 1.3 + p.ph);
  P.thF = 0.08 + s * 0.06; P.shF = -0.15; P.thB = -0.05 - s * 0.06; P.shB = -0.2;
  P.uaF = -2.75 + s * 0.12; P.faF = 0.15; P.uaB = -0.3; P.faB = 0.4; P.head = -0.25; P.lean = 0;
  if (vert > 0) { P.rot = 0; P.rootY = 0.52; }
  else if (vert < 0) { P.rot = PI; P.rootY = 0.52; P.rootX = 0; }
  else { P.rot = PI / 2 - 0.08; P.rootX = -0.5; P.rootY = 0.46; }
  return P;
});
anims.register('sleepBag', (p, t, P) => {
  const b = sin(t * 0.9 + p.ph);
  P.rootY = 0.53; P.lean = 0.04;
  P.thF = 0.2; P.shF = -0.35; P.thB = 0.12; P.shB = -0.3;
  P.uaF = -1.1 + b * 0.04; P.faF = 0.55; P.uaB = -1.0 - b * 0.04; P.faB = 0.6; P.head = 0.42 + b * 0.02;
  P.rot = (p.tilt || 0);
  return P;
});
anims.register('sleepLie', (p, t, P) => {
  const b = sin(t * 0.9 + p.ph);
  P.rootY = 0.52; P.thF = 0.15; P.shF = -0.25; P.thB = 0.05; P.shB = -0.2;
  P.uaF = -0.6 + b * 0.04; P.faF = 0.5; P.uaB = -0.5; P.faB = 0.4; P.head = 0.3;
  P.rot = p.tilt != null ? p.tilt : -PI / 2;
  return P;
});
// Cycling with clip-in pedals and no seat.
anims.register('cycle', (p, t, P) => {
  const a = t * 5.5 + p.ph;
  P.rootY = 0.44; P.lean = 0.35;
  P.thF = 1.05 + sin(a) * 0.35; P.shF = -1.25 + cos(a) * 0.35; P.thB = 1.05 - sin(a) * 0.35; P.shB = -1.25 - cos(a) * 0.35;
  P.uaF = -1.1; P.faF = 0.4; P.uaB = -1.05; P.faB = 0.45; P.head = 0.1;
  return P;
});
// Running on a treadmill, held down by a harness.
anims.register('runH', (p, t, P) => {
  const ph = t * 6.2 + p.ph, s = sin(ph);
  P.thF = s * 0.55; P.thB = -s * 0.55;
  P.shF = -Math.max(0, -cos(ph)) * 1.0 - 0.1; P.shB = -Math.max(0, cos(ph)) * 1.0 - 0.1;
  P.rootY = 0.52 - abs(cos(ph)) * 0.015; P.lean = 0.12;
  P.uaF = -s * 0.6; P.uaB = s * 0.6; P.faF = 1.3; P.faB = 1.3; P.head = 0;
  return P;
});
// Squats on the weight machine: the bar across the shoulders.
anims.register('squat', (p, t, P) => {
  const c = (t * 0.4 + p.ph) % 1, u = 0.5 - 0.5 * cos(c * 2 * PI);
  P.rootY = 0.52 - u * 0.17; P.lean = 0.12 + u * 0.25;
  P.thF = 0.15 + u * 1.15; P.shF = -0.2 - u * 1.6; P.thB = 0.1 + u * 1.15; P.shB = -0.2 - u * 1.6;
  P.uaF = -2.1; P.faF = 2.4; P.uaB = -2.0; P.faB = 2.5; P.head = -0.1;
  return P;
});
// Spacewalkers: stiff pressurised suits; p.evaTilt is PI when hanging under the truss.
anims.register('evaWork', (p, t, P) => {
  const s = sin(t * 1.6 + p.ph);
  P.rootY = 0.53; P.lean = 0.3; P.thF = 0.12; P.shF = -0.08; P.thB = 0.05; P.shB = -0.05;
  P.uaF = -1.0 + s * 0.22; P.faF = 0.75 + s * 0.15; P.uaB = -0.85; P.faB = 0.8; P.head = 0.25;
  P.rot = (p.evaTilt || 0) + 0.1;
  return P;
});
anims.register('evaMove', (p, t, P) => {
  const s = sin(t * 1.4 + p.ph);
  P.rootY = 0.53; P.lean = 0.55; P.thF = 0.1; P.shF = -0.1; P.thB = -0.05; P.shB = -0.1;
  P.uaF = -1.9 + s * 0.45; P.faF = 0.3; P.uaB = -1.9 - s * 0.45; P.faB = 0.3; P.head = 0.1;
  P.rot = (p.evaTilt || 0) + 0.25;
  return P;
});

// ------------------------------------------------------------------ navigation
const PORTALS = new Map();
function portal(nav, a, b) { nav.link(a, b, 'door'); PORTALS.set(a, b); PORTALS.set(b, a); }

export function buildNav(W, SP) {
  const nav = W.nav;
  const N = (id, x, y, z = 0.5) => nav.node(id, x, y, z);
  const chain = (ids) => nav.chain(ids, 'walk');
  // ---- Panel A: Endeavour's cabin, the airlock, then the spine from PMA-2 to ATV-2
  N('fd3', 7.6, 6.6, 0.75); N('fd2', 7.6, 5.0, 0.75); N('fd1', 7.6, 3.4, 0.75); N('interdeck', 6.6, 2.75, 0.55);
  N('mid3', 5.3, 6.4, 0.7); N('mid2', 5.3, 4.6, 0.7); N('mid1', 5.3, 2.7, 0.7);
  N('midHatch', 5.8, 1.1, 0.45); N('airlockO', 7.4, -0.45, 0.35); N('ods', 10.7, -0.75, 0.35); N('pma2', 12.95, -0.8, 0.4);
  chain(['fd3', 'fd2', 'fd1', 'interdeck', 'mid1', 'mid2', 'mid3']);
  chain(['mid1', 'midHatch', 'airlockO', 'ods', 'pma2']);
  const spine = [['h1', 14.9], ['h2', 16.5], ['h3', 18.4], ['h4', 19.8], ['d1', 21.6], ['d2', 23.2], ['d3', 25.2], ['d4', 27.0], ['d5', 28.9], ['u1', 30.7], ['u2', 32.55], ['u3', 34.4]];
  for (const [id, x] of spine) N(id, x, FEET, 0.55);
  chain(['pma2'].concat(spine.map((s) => s[0])));
  N('p1', 36.2, -0.82, 0.42);
  N('z1', 38.1, -0.9, 0.5); N('z2', 39.6, -0.9, 0.5); N('z3', 42.0, -0.97, 0.5); N('z4', 44.6, -0.97, 0.55); N('z5', 47.1, -0.97, 0.55); N('z6', 49.3, -0.92, 0.5);
  N('zb', 51.4, -0.86, 0.5);
  N('zv1', 53.4, -0.93, 0.45); N('zv2', 55.0, -0.93, 0.45); N('zv3', 56.8, -0.97, 0.5); N('zv4', 58.9, -1.02, 0.55); N('zv5', 60.4, -1.02, 0.55);
  N('zvA', 62.1, -0.86, 0.42); N('atv1', 64.0, -0.85, 0.4); N('atv2', 66.0, FEET, 0.55); N('atv3', 67.8, FEET, 0.55);
  chain(['u3', 'p1', 'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'zb', 'zv1', 'zv2', 'zv3', 'zv4', 'zv5', 'zvA', 'atv1', 'atv2', 'atv3']);
  // Branches: Leonardo below Unity, Rassvet and Soyuz TMA-20 below Zarya, Poisk and Soyuz TMA-21
  // above the transfer ball, Pirs and Progress below it.
  N('leo1', 32.35, -3.3, 0.45); N('leo2', 32.35, -5.4, 0.45); N('leo3', 32.35, -7.5, 0.45);
  chain(['u2', 'leo1', 'leo2', 'leo3']);
  N('ras1', 39.4, -3.6, 0.42); N('ras2', 39.4, -5.9, 0.42); N('tma20', 39.4, -9.95, 0.38);
  chain(['z2', 'ras1', 'ras2', 'tma20']);
  N('poisk1', 51.3, 2.4, 0.42); N('poisk2', 51.3, 4.7, 0.42); N('tma21', 51.3, 7.35, 0.38);
  chain(['zb', 'poisk1', 'poisk2', 'tma21']);
  N('pirs1', 51.3, -3.5, 0.42); N('pirs2', 51.3, -5.7, 0.42); N('prog', 51.3, -9.75, 0.4);
  chain(['zb', 'pirs1', 'pirs2', 'prog']);
  N('harmonyCol', 18.4, FEET, 0.85); nav.link('h3', 'harmonyCol');
  N('unityQuest', 32.55, FEET, 0.85); nav.link('u2', 'unityQuest');
  // ---- Panel B: the Harmony slice and the Unity slice
  const hf = HY - 0.92, uf = UY - 0.92;
  N('kibo1', 142.9, hf, 0.55); N('kibo2', 145.0, hf, 0.55); N('kibo3', 147.0, hf, 0.55); N('kibo4', 149.3, hf, 0.55); N('kibo5', 151.6, hf, 0.55);
  N('elm', 146.7, HY + 2.35, 0.45);
  N('hub', 155.0, HY - 0.85, 0.45);
  N('col1', 158.4, hf, 0.55); N('col2', 160.3, hf, 0.55); N('col3', 162.3, hf, 0.55);
  chain(['kibo1', 'kibo2', 'kibo3', 'kibo4', 'kibo5', 'hub', 'col1', 'col2', 'col3']);
  nav.link('kibo3', 'elm');
  N('tr1', 147.3, uf, 0.55); N('tr2', 149.5, uf, 0.55); N('tr3', 151.3, uf, 0.55);
  N('hubU', 155.0, uf, 0.45);
  N('q1', 158.2, uf, 0.55); N('q2', 159.6, uf, 0.55); N('cl', 161.4, UY - 0.85, 0.38); N('qOut', 163.4, UY - 0.6, 0.6);
  chain(['tr1', 'tr2', 'tr3', 'hubU', 'q1', 'q2', 'cl', 'qOut']);
  N('cupola', 149.25, UY - 0.75, 0.45); nav.link('tr2', 'cupola');
  // ---- Outside: along the underside of the truss to the work sites, and over the top to Dextre
  const ey = TY - 2.3;
  const ev = [['ev0', 158.0], ['evS1', 168.2], ['ev1', 150.2], ['ev2', 141.0], ['evP3', 131.2], ['evSarj', 127.9], ['evP5', 119.6]];
  for (const [id, x] of ev) N(id, x, ey, 1.0);
  chain(['evS1', 'ev0', 'ev1', 'ev2', 'evP3', 'evSarj', 'evP5']);
  N('evUp1', 147.2, TY, 0.42); N('evUp2', 147.2, TY + 2.3, 1.0); N('evDex', 152.6, TY + 3.8, 1.2);
  chain(['ev1', 'evUp1', 'evUp2', 'evDex']);
  // ---- The ground: an aisle along the front of each control room, stepping up the tiers.
  for (const id of Object.keys(GROUND)) {
    const R = GROUND[id];
    const ids = [nav.node('g:' + id + ':front', R.front[0], R.y, 0.35)];
    const seen = new Set();
    for (const st of R.seats) { const key = st.at[0].toFixed(2); if (seen.has(key)) continue; seen.add(key); ids.push(nav.node('g:' + id + ':' + key, st.at[0], st.at[1], 0.35)); }
    ids.push(nav.node('g:' + id + ':back', R.back[0], R.back[1], 0.35));
    nav.chain(ids, 'stairs');
  }
  // ---- Hatches that join the two views: passing through one, people step across the page.
  portal(nav, 'harmonyCol', 'hub');
  portal(nav, 'unityQuest', 'hubU');
  portal(nav, 'hub', 'hubU');
  portal(nav, 'qOut', 'ev0');
  void SP;
}

// Teleport across a portal link instead of flying through the gap between the views.
function portalHop(p) {
  if (!p.moving || !p.path || p.pi >= p.path.length) return;
  const tg = p.path[p.pi];
  if (!tg.id || !PORTALS.has(tg.id)) return;
  if (hypot(tg.x - p.x, tg.y - p.y, tg.z - p.z) > 6) { p.x = tg.x; p.y = tg.y; p.z = tg.z; }
}

// ------------------------------------------------------------------ costumes
const SOCKS = '#e8e4da';
const crew = (top, bottom, skin, hair, extra) => Object.assign({ top, bottom, skin, hair, shoes: SOCKS, hairStyle: 'short' }, extra || {});
const SUIT = { top: '#f2f0ea', bottom: '#eceae2', shoes: '#d8d6ce', hat: 'bonnet', hatColor: '#f4f2ec', build: 1.28, sleeves: 'long' };

// ------------------------------------------------------------------ the cast
export function buildCast(W, SP, ctx) {
  const people = [];
  // Short step durations keep everyone on schedule: a step only checks its hours when it starts,
  // and a step that is still due simply repeats in place.
  const shortDur = (d) => (Array.isArray(d) ? [Math.min(d[0], 20), Math.min(d[1], 34)] : Math.min(d == null ? 20 : d, 30));
  const G = (steps) => steps.map((s) => Object.assign({ walkAnim: 'glide', onArrive: (p) => { p.tilt = s.tilt || 0; } }, s, { dur: shortDur(s.dur) }));
  const aboard = (def) => {
    const p = W.addPerson(Object.assign({ speed: 0.5 }, def, { routine: G(def.routine), update: (q) => portalHop(q) }));
    people.push(p);
    return p;
  };
  const at = (a, dy = 0, dz = 0) => [a[0], a[1] + dy, a[2] + dz];
  const cq = SP.cq;
  const mb = SP.midBags;
  const cupA = SP.cupola[0], cupB = SP.cupola[1];
  // Places around the Unity galley table: left end, right end, and one floating upside down above it.
  const uT = (dx) => (dx < 0 ? { at: [SP.unityTable - 0.82, FEET, 0.55], face: 1 } : dx > 0 ? { at: [SP.unityTable + 0.82, FEET, 0.55], face: -1 } : { at: [SP.unityTable + 0.1, 1.0, 0.6], face: 1, tilt: PI });
  const zT = (dx) => (dx < 0 ? { at: [SP.zvTable - 0.78, -1.0, 0.55], face: 1 } : dx > 0 ? { at: [SP.zvTable + 0.78, -1.0, 0.55], face: -1 } : { at: [SP.zvTable, 1.02, 0.55], face: 1, tilt: PI });
  const hf = HY - 0.92, uf = UY - 0.92;
  const orbAft = { at: [7.12, 3.3, 0.85], face: 1, tilt: PI / 2 };
  const orbFwd = { at: [7.12, 5.6, 0.9], face: -1, tilt: -PI / 2 };
  const midDeck = (y) => ({ at: [4.62, y, 0.9], face: -1, tilt: -PI / 2 });
  const sleepMid = (i) => ({ at: [mb[i][0] + 0.05, mb[i][1] - 0.05, 1.38], act: 'sleepBag', face: -1, tilt: -PI / 2 });

  // ---------------------------------------------------------------- station crew (Expedition 27)
  aboard({
    name: 'Viktor Belousov', role: 'station commander (Russian), going home tomorrow',
    bio: 'Keeps a paper calendar taped inside his cabin and crosses off each day in red pencil.',
    costume: crew('#2a3a5a', '#3a3e48', '#e6b48f', '#6b4428'),
    routine: [
      { at: SP.kayutaS, act: 'sleepBag', face: 'out', dur: 200, label: 'Asleep in his cabin in Zvezda', when: [0, 9.02] },
      { at: SP.cwPanel, act: 'floatWork', face: 'in', dur: [25, 40], label: 'Morning check of the caution and warning panel', when: [9.02, 9.5] },
      { ...zT(0), act: 'floatEat', dur: [30, 50], label: 'Breakfast at the Zvezda galley table', when: [9.5, 10] },
      { at: SP.tma20.om, act: 'floatWork', face: 'out', dur: [40, 60], label: 'Packing the Soyuz orbital module for tomorrow', when: [10, 14] },
      { at: 'ras2', act: 'floatWork', face: 'in', dur: [20, 30], label: 'Fetching return items from Rassvet', when: [10, 14] },
      { at: SP.tvis, act: 'runH', face: 1, dur: [60, 90], label: 'Running on the TVIS treadmill', when: [14, 15.5] },
      { at: 'ras1', act: 'floatWork', face: 'in', dur: [30, 40], label: 'Sorting return items in Rassvet', when: [15.5, 17] },
      { at: 'zv3', act: 'floatRead', face: 'out', prop: 'clipboard', dur: [40, 60], label: 'Writing handover notes for the next commander', when: [17, 21] },
      { ...uT(0.45), act: 'floatEat', dur: [40, 60], label: 'Dinner in Unity with the others', when: [21, 22.5] },
      { at: SP.kayutaS, act: 'floatRead', face: 'out', dur: [40, 60], label: 'Pre-sleep: reading in his cabin', when: [22.5, 24] },
    ],
  });
  aboard({
    name: 'Dana Merrow', role: 'station flight engineer (US), going home tomorrow',
    bio: 'Has photographed every sunrise over the Pacific she was awake for.',
    costume: crew('#5a7a9a', '#3a4048', '#f1c9a5', '#8d5a2b', { hairStyle: 'long' }),
    routine: [
      { at: cq[0].at, act: 'sleepBag', face: cq[0].face, dur: 200, label: 'Asleep in her crew quarter in Harmony', when: [0, 9.02] },
      { ...uT(-0.4), act: 'floatEat', dur: [30, 40], label: 'Breakfast in Unity', when: [9.02, 10] },
      { at: SP.melfi, act: 'floatWork', face: 'in', dur: [40, 60], label: 'Moving samples in and out of the freezer in Kibo', when: [10, 12.5] },
      { at: 'kibo4', act: 'floatRead', face: 'in', dur: [20, 30], label: 'Logging the samples', when: [10, 12.5] },
      { ...uT(-0.45), act: 'floatEat', dur: [40, 60], label: 'Lunch in Unity', when: [12.5, 13.5] },
      { at: SP.cevis, act: 'cycle', face: 1, dur: [60, 90], label: 'Riding the CEVIS bicycle (no seat needed)', when: [13.5, 15] },
      { at: cq[0].at, act: 'floatWork', face: cq[0].face, dur: [40, 60], label: 'Packing her personal kit to go home', when: [15, 18] },
      { ...uT(-0.4), act: 'floatEat', dur: [40, 60], label: 'Dinner in Unity', when: [18, 21] },
      { at: cupA, act: 'floatPhoto', face: 1, tilt: PI, dur: [40, 60], label: 'In the Cupola, photographing the Earth', when: [21, 22] },
      { at: cq[0].at, act: 'floatRead', face: cq[0].face, dur: [40, 60], label: 'Pre-sleep: e-mail home on her laptop', when: [22, 24] },
    ],
  });
  aboard({
    name: 'Marco Bellandi', role: 'station flight engineer (ESA, Italian), going home tomorrow',
    bio: 'Leaves a hand-written welcome card tucked behind a Columbus handrail for whoever comes next.',
    costume: crew('#2a4a8a', '#4a4a50', '#e6b48f', '#2b1d14'),
    routine: [
      { at: cq[1].at, act: 'sleepBag', face: cq[1].face, dur: 200, label: 'Asleep in his crew quarter in Harmony', when: [0, 9.02] },
      { ...uT(0.4), act: 'floatEat', dur: [30, 40], label: 'Breakfast in Unity', when: [9.02, 10] },
      { at: SP.epm, act: 'floatWork', face: 'in', dur: [40, 60], label: 'A physiology experiment in Columbus', when: [10, 13] },
      { ...uT(0.45), act: 'floatEat', dur: [40, 60], label: 'Lunch in Unity', when: [13, 14] },
      { at: SP.ared, act: 'squat', face: 'out', dur: [60, 90], label: 'Squats on the ARED weight machine', when: [14, 16] },
      { at: SP.tma20.om, act: 'floatWork', face: 'out', dur: [40, 60], label: 'Packing for the trip home in the Soyuz', when: [16, 19] },
      { at: SP.card, act: 'floatWork', face: 'in', dur: [30, 50], label: 'Writing notes for his successor', when: [19, 21] },
      { ...uT(0), act: 'floatTalk', dur: [40, 60], label: 'Dinner in Unity, floating above the table, talking in Italian', when: [21, 22.5] },
      { at: cq[1].at, act: 'floatRead', face: cq[1].face, dur: [40, 60], label: 'Pre-sleep in his crew quarter', when: [22.5, 24] },
    ],
  });
  aboard({
    name: 'Oleg Zavarzin', role: 'Russian flight engineer, commander of Soyuz TMA-21',
    bio: 'Hums the same folk song whenever he unscrews a panel.',
    costume: crew('#4a5a3a', '#3a3e48', '#e6b48f', '#4a3020'),
    routine: [
      { at: SP.kayutaP, act: 'sleepBag', face: 'out', dur: 200, label: 'Asleep in his cabin in Zvezda', when: [0, 9.02] },
      { ...zT(0.5), act: 'floatEat', dur: [30, 50], label: 'Breakfast at the Zvezda galley table', when: [9.02, 10] },
      { at: SP.zaryaFilter, act: 'floatWork', face: 'in', dur: [40, 60], label: 'Changing the dust-collector filters in Zarya', when: [10, 12] },
      { at: SP.progress, act: 'floatWork', face: 'out', dur: [30, 45], label: 'Unloading Progress through Pirs', when: [12, 15] },
      { at: 'pirs1', act: 'floatWork', prop: 'box', face: 'out', dur: [10, 20], label: 'Carrying cargo up from Progress', when: [12, 15] },
      { at: SP.velo, act: 'cycle', face: 1, prop: null, dur: [60, 90], label: 'On the VELO bicycle', when: [15, 16.5] },
      { at: SP.elektron, act: 'floatWork', face: 'in', dur: [40, 60], label: 'Russian systems checks: Elektron and Vozdukh', when: [16.5, 17.5] },
      { at: [58.55, -1.0, 0.5], act: 'float', face: 'out', dur: [40, 60], label: 'Having his hair cut (a vacuum hose catches every snip)', when: [17.5, 18] },
      { at: SP.elektron, act: 'floatWork', face: 'in', dur: [40, 60], label: 'Russian systems checks: Elektron and Vozdukh', when: [18, 20] },
      { ...zT(0.5), act: 'floatEat', dur: [40, 60], label: 'Dinner at the Zvezda table', when: [20, 22] },
      { ...zT(0.5), act: 'floatTalk', dur: [40, 60], label: 'Pre-sleep: a chat over tea', when: [22, 24] },
    ],
  });
  aboard({
    name: 'Pavel Kudrin', role: 'Russian flight engineer',
    bio: 'Talks to the greenhouse seedlings when he thinks no one is listening.',
    costume: crew('#7a3a2a', '#3a3e48', '#d9a27a', '#2b1d14'),
    routine: [
      { at: cq[2].at, act: 'sleepLie', face: cq[2].face, tilt: -PI / 2, dur: 200, label: 'Asleep in a crew quarter in Harmony', when: [0, 9.02] },
      { ...zT(-0.5), act: 'floatEat', dur: [30, 50], label: 'Breakfast in Zvezda', when: [9.02, 10] },
      { at: SP.progress, act: 'floatWork', face: 'out', dur: [25, 40], label: 'Taking cargo out of Progress', when: [10, 13] },
      { at: 'z5', act: 'floatWork', prop: 'box', face: 'out', dur: [15, 25], label: 'Stowing cargo in Zarya', when: [10, 13] },
      { ...zT(-0.55), act: 'floatEat', dur: [40, 60], label: 'Lunch at the Zvezda table', when: [13, 14] },
      { at: SP.lada, act: 'floatTalk', face: 'in', dur: [40, 60], label: 'Checking the Lada greenhouse (and talking to it)', when: [14, 16] },
      { at: 'zv3', act: 'floatWork', face: 'in', dur: [40, 60], label: 'Maintenance in Zvezda', when: [16, 17.5] },
      { at: [58.0, -0.98, 0.5], act: 'floatWork', face: 1, dur: [40, 60], label: 'Giving Oleg a haircut with vacuum clippers, so no hair floats away', when: [17.5, 18] },
      { at: SP.tvis, act: 'runH', face: 1, dur: [60, 90], label: 'Evening run on the treadmill', when: [18, 19.5] },
      { ...zT(-0.5), act: 'floatEat', dur: [40, 60], label: 'Dinner in Zvezda', when: [19.5, 21] },
      { at: 'u1', act: 'floatRead', face: 'out', dur: [40, 60], label: 'Pre-sleep: reading', when: [21, 24] },
    ],
  });
  aboard({
    name: 'Sam Okafor', role: 'station flight engineer (US), on the shuttle crew’s schedule',
    bio: 'Plays chess by e-mail with his old high-school maths teacher.',
    costume: crew('#3a4a3a', '#4a4a50', '#8a5634', '#2b1d14', { hairStyle: 'bald' }),
    routine: [
      { at: cq[3].at, act: 'sleepLie', face: cq[3].face, tilt: PI / 2, dur: 200, label: 'Asleep in a crew quarter in Harmony', when: [16.43, 1.43] },
      { ...uT(0.4), act: 'floatEat', dur: [30, 50], label: 'An early breakfast in Unity', when: [1.43, 3.18] },
      { at: SP.emuStand[1], act: 'floatWork', face: 'out', dur: [40, 60], label: 'Helping the spacewalkers into their suits', when: [3.18, 6.25] },
      { at: SP.destinyLaptop, act: 'floatWork', face: 'in', dur: [60, 90], label: 'Watching the station’s systems from a Destiny laptop', when: [6.25, 12.75] },
      { at: 'd4', act: 'floatRead', face: 'out', dur: [20, 30], label: 'His chess move of the day, on the laptop', when: [6.25, 12.75] },
      { at: 'q2', act: 'floatWork', face: 'out', dur: [40, 60], label: 'Helping the spacewalkers out of their suits', when: [12.75, 15.5] },
      { ...uT(0), act: 'floatEat', dur: [40, 60], label: 'Dinner in Unity, upside down above the table', when: [15.5, 16.43] },
    ],
  });
  // ---------------------------------------------------------------- shuttle crew (STS-134) and their spacewalk
  aboard({
    name: 'Tom Haverill', role: 'shuttle commander, “Suit IV” for the spacewalk',
    bio: 'Carries a child’s drawing of the shuttle folded in his pocket.',
    costume: crew('#7a2a2a', '#3a3e48', '#e6b48f', '#9a9a9a'),
    routine: [
      { ...sleepMid(0), dur: 200, label: 'Asleep in the middeck', when: [16.93, 1.43] },
      { ...midDeck(3.2), act: 'floatEat', dur: [30, 50], label: 'Wake-up music from Houston, then breakfast in the middeck', when: [1.43, 3.18] },
      { at: SP.emuStand[0], act: 'floatWork', face: 'out', dur: [40, 60], label: 'Dressing the spacewalkers in Quest', when: [3.18, 6.25] },
      { ...orbAft, act: 'floatWork', dur: [60, 90], label: 'Orbiter systems at the aft flight deck', when: [6.25, 12] },
      { ...orbFwd, act: 'floatRead', dur: [30, 50], label: 'Checking the forward panels', when: [6.25, 12] },
      { ...midDeck(3.4), act: 'floatEat', dur: [40, 60], label: 'Lunch in the middeck', when: [12, 12.9] },
      { at: 'q1', act: 'floatWork', face: 'out', dur: [40, 60], label: 'Helping the spacewalkers out of their suits', when: [12.9, 15.5] },
      { ...midDeck(5.4), act: 'floatTalk', dur: [40, 60], label: 'Evening in the middeck', when: [15.5, 16.93] },
    ],
  });
  aboard({
    name: 'Leon Pruitt', role: 'shuttle pilot, robot-arm operator on other days',
    bio: 'Labels every bag he moves with tiny smiley faces.',
    costume: crew('#7a2a2a', '#3a3e48', '#c88c62', '#2b1d14'),
    routine: [
      { ...sleepMid(1), dur: 200, label: 'Asleep in the middeck', when: [16.93, 1.43] },
      { ...midDeck(4.2), act: 'floatEat', dur: [20, 40], label: 'Breakfast in the middeck', when: [1.43, 2.0] },
      { at: 'mid1', act: 'floatWork', prop: 'sack', face: 'out', dur: [10, 20], label: 'Collecting water bags filled by the shuttle’s fuel cells', when: [2.0, 6.0] },
      { at: 'u1', act: 'floatWork', face: 'in', prop: null, dur: [20, 30], label: 'Towing the water bags into the station', when: [2.0, 6.0] },
      { at: 'h2', act: 'floatWork', face: 'in', dur: [25, 40], label: 'Cargo transfers with Stefano', when: [6.0, 12] },
      { at: 'mid2', act: 'floatWork', prop: 'box', face: 'out', dur: [15, 25], label: 'Fetching cargo from the middeck', when: [6.0, 12] },
      { ...uT(0.45), act: 'floatEat', dur: [40, 60], label: 'Lunch in Unity', when: [12, 13] },
      { at: SP.leo(-5.4), act: 'floatWork', face: 'in', dur: [40, 60], label: 'Stowing cargo in Leonardo', when: [13, 16.93] },
    ],
  });
  const ev = (name, role, bio, cos, idx, red, outside) => aboard({
    name, role, bio, costume: cos,
    routine: [
      { at: SP.campout[idx], act: 'sleepBag', face: idx ? -1 : 1, dur: 200, label: 'Camping out in the airlock at reduced pressure', when: [0, 2.02] },
      { at: SP.whc, act: 'float', face: 'in', dur: [30, 40], label: 'Hygiene break while the airlock is repressurised', when: [2.02, 2.85] },
      { at: SP.emuStand[idx], act: 'floatWork', face: 'out', dur: [40, 60], label: 'Suiting up and breathing pure oxygen', when: [2.85, 5.77] },
      { at: 'cl', act: 'float', face: 1, dur: [30, 40], label: 'In the crew lock as the air is pumped out', when: [5.77, 6.35] },
      ...outside,
      { at: 'cl', act: 'float', face: -1, dur: [20, 30], label: 'Back inside: the crew lock repressurises', when: [14.4, 14.75] },
      { at: SP.emuStand[idx], act: 'floatWork', face: 'out', dur: [40, 60], label: 'Out of the suit, helped by the others', when: [14.75, 15.6] },
      { ...uT(idx ? 0.5 : -0.5, idx ? -1 : 'out'), act: 'floatEat', dur: [40, 60], label: 'A late meal in Unity', when: [15.6, 16.93] },
      { ...sleepMid(idx ? 2 : 3), dur: 200, label: 'Asleep in the middeck after the spacewalk', when: [16.93, 24] },
    ],
  });
  const E = (at, label, when, act = 'evaWork', face = 'out') => ({ at, act, face, walkAnim: 'evaMove', dur: [40, 70], label, when });
  const evNode = (id) => id;
  const dan = ev('Dan Kessler', 'spacewalker EV-1 (red stripes)', 'Keeps a laminated photo of his dog in his suit pocket.', crew('#2a3a6a', '#3a3e48', '#f1c9a5', '#6b4428'), 0, true, [
    E(evNode('evP3'), 'Re-routing an ammonia jumper on the P3-P4 truss', [6.35, 8.2]),
    E(evNode('evP5'), 'Filling the P5-P6 ammonia line', [8.2, 9.6]),
    E(evNode('evP5'), 'Venting the leftover ammonia overboard', [9.6, 10.2]),
    E(evNode('evDex'), 'Greasing Dextre’s latching end effector', [10.2, 12.2]),
    E(evNode('evSarj'), 'Greasing the port solar rotary joint', [12.2, 14.4]),
  ]);
  const erik = ev('Erik Lindqvist', 'spacewalker EV-2 (plain white suit)', 'Counts sunrises from inside his helmet and loses count at four.', crew('#4a5a6a', '#3a3e48', '#e6b48f', '#c9a160'), 1, false, [
    E(evNode('evP3'), 'Setting up the ammonia tool', [6.35, 7.6]),
    E(evNode('evSarj'), 'Taking the covers off the port solar rotary joint', [7.6, 9.4]),
    E(evNode('evSarj'), 'First round of greasing', [9.4, 10.6]),
    E(evNode('evS1'), 'Stowing a radiator grapple bar on S1', [10.6, 12.4]),
    E(evNode('evSarj'), 'Second round of greasing, then the covers back on', [12.4, 14.4]),
  ]);
  SP.walkers = [dan, erik];
  aboard({
    name: 'Stefano Ricci', role: 'shuttle flight engineer (ESA, Italian), cargo lead',
    bio: 'Speaks Italian with Marco at every meal they share.',
    costume: crew('#7a2a2a', '#3a3e48', '#e6b48f', '#2b1d14'),
    routine: [
      { ...sleepMid(4), dur: 200, label: 'Asleep on the flight deck', when: [16.93, 1.43] },
      { ...midDeck(4.8), act: 'floatEat', dur: [20, 40], label: 'Breakfast in the middeck', when: [1.43, 2.0] },
      { at: SP.leo(-3.3), act: 'floatRead', face: 'in', prop: 'clipboard', dur: [40, 60], label: 'Cargo inventory in Leonardo', when: [2.0, 6.0] },
      { at: SP.leo(-7.4), act: 'floatWork', face: 'in', dur: [30, 50], label: 'Counting bags in Leonardo’s end cone', when: [2.0, 6.0] },
      { at: 'h1', act: 'floatWork', face: 'in', dur: [25, 40], label: 'Transfers between the middeck and Harmony', when: [6.0, 11] },
      { at: 'mid3', act: 'floatWork', prop: 'box', face: 'out', dur: [15, 25], label: 'Unpacking a locker in the middeck', when: [6.0, 11] },
      { ...uT(0.5), act: 'floatEat', dur: [40, 60], label: 'Lunch in Unity', when: [11, 12] },
      { at: SP.atv, act: 'floatWork', face: 'in', dur: [40, 60], label: 'Checking cargo in ATV-2', when: [12, 15] },
      { at: SP.leo(-5.4), act: 'floatRead', face: 'in', prop: 'clipboard', dur: [40, 60], label: 'Updating the stowage list', when: [15, 16.93] },
    ],
  });
  aboard({
    name: 'Howard Lim', role: 'intravehicular choreographer for the spacewalk',
    bio: 'Times each task with a stopwatch and announces the totals at dinner.',
    costume: crew('#7a2a2a', '#3a3e48', '#e6b48f', '#2b1d14'),
    routine: [
      { ...sleepMid(5), dur: 200, label: 'Asleep on the flight deck', when: [16.93, 1.43] },
      { ...midDeck(6.2), act: 'floatEat', dur: [30, 50], label: 'Breakfast in the middeck', when: [1.43, 3.18] },
      { at: 'q2', act: 'floatRead', face: 'out', prop: 'clipboard', dur: [40, 60], label: 'Reading the suit-up checklist in Quest', when: [3.18, 6.25] },
      { at: cupB, act: 'floatRead', face: -1, tilt: PI, prop: 'clipboard', dur: [60, 90], label: 'Reading every step aloud to the spacewalkers, from the Cupola', when: [6.25, 14.6] },
      { at: 'q1', act: 'floatTalk', face: 'out', dur: [40, 60], label: 'Debriefing the spacewalkers', when: [14.6, 15.6] },
      { ...midDeck(5.0), act: 'floatTalk', dur: [40, 60], label: 'Dinner in the middeck: announcing the times from his stopwatch', when: [15.6, 16.93] },
    ],
  });
  // Spacewalkers change into their suits for the EVA window, and hang under the truss outside.
  const suitOn = (h) => h >= 5.0 && h < 15.0;
  for (const [i, w] of SP.walkers.entries()) {
    const own = w.cos, suit = costume(Object.assign({}, SUIT, { skin: own.skin, hair: own.hair }), 77 + i);
    const prev = w.onUpdate;
    w.onUpdate = (p, dt, t) => {
      prev && prev(p, dt, t);
      const on = suitOn(W.hour);
      p.cos = on ? suit : own;
      p.suited = on;
      p.evaTilt = p.x > 100 && p.y < TY - 1 && p.y > TY - 4 ? PI : 0;
      p.red = i === 0;
    };
  }

  // ---------------------------------------------------------------- the ground
  const ground = [];
  const office = (top, bottom, skin, hair, extra) => Object.assign({ top, bottom, skin, hair, shoes: '#2a1e18' }, extra || {});
  const GND = (room, def, seatIdx, shift) => {
    const R = GROUND[room];
    const s = R.seats[seatIdx % R.seats.length];
    const steps = [
      { at: s.at, act: 'sitWork', seat: s.seat, face: s.face, dur: [50, 90], label: def.task, when: shift },
      { at: R.front, act: 'point', face: 1, dur: [12, 20], label: 'At the big screen', when: shift },
      { at: s.at, act: 'sitTalk', seat: s.seat, face: s.face, dur: [30, 50], label: def.task2 || 'On the voice loops', when: shift },
      { at: R.back, act: 'drink', prop: 'mug', face: 'out', dur: [15, 25], label: 'A coffee at the back of the room', when: shift },
    ];
    for (const st of steps) st.dur = [Math.min(st.dur[0], 20), Math.min(st.dur[1], 34)];
    const p = W.addPerson({ name: def.name, role: def.role, bio: def.bio, costume: def.cos, routine: steps,
      update: (q) => { q.hidden = !XS_in(W.hour, shift); } });
    R.taken = R.taken || new Set();
    R.taken.add(seatIdx % R.seats.length);
    ground.push(p);
    return p;
  };
  const sk = ['#f1c9a5', '#e6b48f', '#d9a27a', '#c88c62', '#a96e47', '#8a5634', '#6b4026'];
  GND('jsc', { name: 'Carla Mendes', role: 'ISS flight director, Houston (orbit 1 shift)', bio: 'Drinks exactly two coffees per shift.', task: 'Leading the shift through the spacewalk preparations', cos: office('#3a4a6a', '#2a2a33', sk[3], '#2b1d14', { hairStyle: 'bun' }) }, 9, [3, 12]);
  GND('jsc', { name: 'Anne-Marie Holt', role: 'ISS flight director, Houston (orbit 2 shift)', bio: 'Keeps a model Soyuz on her console.', task: 'Running the end of the spacewalk and the ingress', cos: office('#6a3a4a', '#2a2a33', sk[0], '#b07a3c', { hairStyle: 'long' }) }, 9, [12, 21]);
  GND('jsc', { name: 'Russell Grady', role: 'ISS flight director, Houston (orbit 3, the night shift)', bio: 'Brings homemade cookies on Fridays.', task: 'Quiet systems monitoring while the crew sleeps', cos: office('#4a5a4a', '#3a3a4a', sk[1], '#9a9a9a') }, 9, [21, 3]);
  GND('jsc', { name: 'Jim Albrecht', role: 'ISS CAPCOM (an astronaut)', bio: 'Flew a shuttle mission years ago.', task: 'The one voice that talks to the station crew', task2: 'Reading up the day’s plan', cos: office('#2a3a5a', '#2a2a33', sk[1], '#6b4428') }, 5, [8, 20]);
  GND('jsc', { name: 'Priya Natarajan', role: 'EVA officer', bio: 'Has a tiny suit-glove keyring.', task: 'Following each spacewalk task on the timeline', cos: office('#7a4a5a', '#2a2a33', sk[4], '#2b1d14', { hairStyle: 'bun' }) }, 4, [2, 15]);
  GND('jsc', { name: 'Kevin Duchesne', role: 'robotics officer', bio: 'Learned to fly model aircraft as a boy.', task: 'Planning Canadarm2 moves for later in the mission', cos: office('#5a6a7a', '#3a3a4a', sk[0], '#c9a160') }, 6, [8, 17]);
  GND('jsc', { name: 'Ben Okonkwo', role: 'attitude officer (ADCO)', bio: 'Whistles when the gyroscopes look healthy.', task: 'Watching the station’s orientation and its gyroscopes', cos: office('#3a5a4a', '#2a2a33', sk[5], '#2b1d14') }, 1, [3, 12]);
  GND('jsc', { name: 'Laura Steiner', role: 'trajectory officer (TOPO)', bio: 'Draws orbits on napkins.', task: 'Planning tomorrow’s Soyuz departure path', cos: office('#8a6a3a', '#3a3a4a', sk[0], '#d8c9a8', { hairStyle: 'long' }) }, 2, [8, 17]);
  GND('jsc', { name: 'Marcus Bell', role: 'maintenance officer (OSO)', bio: 'Keeps a jar of spare screws.', task: 'Writing the procedure for a repair', cos: office('#4a4a5a', '#2a2a33', sk[2], '#4a3020') }, 3, [12, 21]);
  GND('jsc', { name: 'Tom Vasquez', role: 'power and thermal controller', bio: 'Grew up near a refinery.', task: 'Watching ammonia pressures during the refill', cos: office('#6a5a4a', '#2a2a33', sk[3], '#2b1d14') }, 7, [4, 15]);
  GND('jsc', { name: 'Dr Helen Park', role: 'flight surgeon', bio: 'Jogs at lunchtime.', task: 'A private medical conference with a crew member', cos: office('#e8e4dc', '#3a3a4a', sk[1], '#2b1d14', { hairStyle: 'bun' }) }, 10, [9, 12]);
  GND('jsc', { name: 'Doug Ellery', role: 'public affairs commentator', bio: 'Famous for his calm voice.', task: 'Narrating the spacewalk for NASA TV', cos: office('#2a3a5a', '#2a2a33', sk[0], '#9a9a9a') }, 13, [5, 15]);
  GND('jsc', { name: 'Rachel Ng', role: 'planning team', bio: 'Colour-codes everything.', task: 'Building tomorrow’s timeline', cos: office('#5a7a6a', '#2a2a33', sk[1], '#2b1d14', { hairStyle: 'long' }) }, 14, [12, 21]);
  GND('jscS', { name: 'Lisa Moreno', role: 'shuttle CAPCOM', bio: 'Chose today’s wake-up song.', task: 'Talking to the shuttle crew', task2: 'Calling up the wake-up music', cos: office('#7a3a3a', '#2a2a33', sk[2], '#4a3020', { hairStyle: 'long' }) }, 5, [1, 17.5]);
  GND('jscS', { name: 'Glenn Farrow', role: 'shuttle flight director', bio: 'This is the last shuttle mission he will lead.', task: 'Running Endeavour’s systems team', cos: office('#3a4a5a', '#2a2a33', sk[0], '#d8d2c4') }, 9, [1, 10]);
  GND('mer', { name: 'Grace Holloway', role: 'thermal engineer, Houston support room', bio: 'Knits during long simulations.', task: 'Analysing the ammonia refill data', cos: office('#8a5a7a', '#3a3a4a', sk[0], '#8d5a2b', { hairStyle: 'bun' }) }, 1, [5, 15]);
  GND('poic', { name: 'Wade Collins', role: 'payload operations director, Huntsville', bio: 'Barbecues for the whole team.', task: 'Coordinating the US experiments', cos: office('#6a7a8a', '#2a2a33', sk[1], '#6b4428') }, 5, [12, 23]);
  GND('poic', { name: 'Shonda Price', role: 'payload communicator, Huntsville', bio: 'Sings in a church choir.', task: 'Talking the crew through an experiment', cos: office('#5a3a6a', '#2a2a33', sk[5], '#2b1d14', { hairStyle: 'bun' }) }, 1, [12, 23]);
  GND('csa', { name: 'Mathieu Leblanc', role: 'robotics engineer, Saint-Hubert', bio: 'Plays hockey on Tuesdays.', task: 'Checking Dextre after its latching end is greased', cos: office('#a83a3a', '#2a2a33', sk[0], '#4a3020') }, 1, [10, 22]);
  GND('atv', { name: 'Élodie Marchand', role: 'ATV controller, Toulouse', bio: 'Paints watercolours of rockets.', task: 'Watching ATV-2’s tanks and power', cos: office('#3a6a8a', '#2a2a33', sk[0], '#6b4428', { hairStyle: 'long' }) }, 1, [6, 18]);
  GND('atv', { name: 'Pierre Gautier', role: 'ATV propulsion engineer', bio: 'Owns a very old Citroën.', task: 'Planning an ATV reboost', cos: office('#4a4a3a', '#2a2a33', sk[1], '#9a9a9a') }, 6, [6, 18]);
  GND('col', { name: 'Katrin Weiss', role: 'Columbus flight director, Oberpfaffenhofen', bio: 'Cycles to work in all weather.', task: 'Running Columbus systems', cos: office('#2a4a7a', '#2a2a33', sk[0], '#c9a160', { hairStyle: 'bun' }) }, 5, [6, 18]);
  GND('col', { name: 'Jonas Brandt', role: 'Columbus operator', bio: 'Collects mission patches.', task: 'Commanding the experiment racks', cos: office('#5a6a4a', '#2a2a33', sk[0], '#8d5a2b') }, 1, [6, 18]);
  GND('col', { name: 'Femke de Vries', role: 'European user support centre', bio: 'Keeps a tulip on her desk.', task: 'Supporting a fluid experiment', cos: office('#d88a3a', '#2a2a33', sk[0], '#d8c9a8', { hairStyle: 'long' }) }, 10, [8, 17]);
  GND('tsup', { name: 'Sergei Lapin', role: 'shift flight director, Moscow (TsUP)', bio: 'Keeps a photo of a 1970s Soyuz.', task: 'Running the Russian segment; Soyuz TMA-20 departure preparations', cos: office('#3a3a4a', '#2a2a33', sk[1], '#9a9a9a') }, 9, [6, 18]);
  GND('tsup', { name: 'Irina Volkova', role: 'Russian systems specialist', bio: 'Speaks four languages.', task: 'Monitoring Elektron and Vozdukh', cos: office('#6a3a3a', '#2a2a33', sk[0], '#7a2c14', { hairStyle: 'bun' }) }, 1, [6, 18]);
  GND('tsup', { name: 'Alexei Gromov', role: 'ballistics, Moscow', bio: 'Plays the bayan at weekends.', task: 'Calculating the Soyuz landing time', cos: office('#4a5a6a', '#2a2a33', sk[1], '#4a3020') }, 5, [6, 15]);
  GND('tsup', { name: 'Nikolai Fedorov', role: 'communications, Moscow', bio: 'Grows tomatoes on his balcony.', task: 'Scheduling radio passes over Russia', cos: office('#5a5a4a', '#2a2a33', sk[0], '#d8d2c4') }, 13, [6, 18]);
  GND('ssipc', { name: 'Hiroshi Tanabe', role: 'Kibo flight director, Tsukuba', bio: 'Folds paper cranes during quiet passes.', task: 'Running Kibo’s systems and its arm', cos: office('#2a3a4a', '#2a2a33', sk[1], '#2b1d14') }, 5, [23, 9]);
  GND('ssipc', { name: 'Yuki Morimoto', role: 'Kibo payload controller', bio: 'Brought her lucky pen.', task: 'Tending the Saibo and Ryutai racks', cos: office('#8a6a8a', '#2a2a33', sk[0], '#2b1d14', { hairStyle: 'bun' }) }, 1, [23, 9]);

  // Console teams: every other seat is staffed around the clock.
  const extraCos = (i, r) => office(r.pick(['#3a4a6a', '#5a5a5a', '#6a4a3a', '#e4e0d4', '#3a5a4a', '#7a6a5a', '#4a4a5a', '#8a3a3a', '#d8d0bc']), r.pick(['#2a2a33', '#3a3a4a', '#4a3a2a', '#5a5a60']), r.pick(sk), r.pick(['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#9a9a9a', '#c9a160']), { hairStyle: r.pick(['short', 'short', 'bun', 'long', 'bald']) });
  let ei = 0;
  for (const id of Object.keys(GROUND)) {
    const R = GROUND[id];
    R.seats.forEach((s, i) => {
      if (R.taken && R.taken.has(i)) return;
      if ((i * 7 + id.length) % 6 === 5) return; // a few empty consoles
      const c = extraCos(ei++, W.R);
      const p = W.addPerson({ at: s.at, act: i % 4 === 1 ? 'sitTalk' : 'sitWork', seat: s.seat, face: s.face, costume: c, role: 'flight controller at ' + R.name.split(':')[0], label: 'On console' });
      ground.push(p);
    });
  }
  void ctx; void hf; void uf; void TZ;
  return { people, ground };
}

// Hour inside a window (which may wrap past midnight).
function XS_in(h, w) { return w[0] <= w[1] ? h >= w[0] && h < w[1] : h >= w[0] || h < w[1]; }
