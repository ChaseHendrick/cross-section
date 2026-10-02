/* Warship scene: extras, machines, animals, the sea around and the guided tour. */
import { THREE, mat, props } from '../../engine/index.js';
import { Y, MAST, PORTS, innerZ, halfB, sternX } from './geom.js';
import { MESS, DRILL, gun, capstanPart, boat } from './rooms.js';
import { seaman, MARINE, step, seatAt, sleep } from './cast.js';
import { RIG, BRACE } from './rig.js';

const TAU = Math.PI * 2;
const inH = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);

// ------------------------------------------------------------------ extras
export function castExtras(W, S, seats, hams, nav, r) {
  const free = seats.filter((s) => !s.used);
  const hamFor = (deck, x) => {
    let best = -1, bd = Infinity;
    hams[deck].forEach((h, i) => { if (h.used) return; const d = Math.abs(h.feet[0] - x) + h.feet[2] * 0.15; if (d < bd) { bd = d; best = i; } });
    if (best < 0) return null;
    hams[deck][best].used = true;
    return hams[deck][best];
  };
  // Jobs for the forenoon (10 to 11.30) and the afternoon.
  const aloftSpots = [];
  for (const mast of ['fore', 'main']) for (const p of nav.rig[mast].yards[0]) aloftSpots.push([p.x, p.y, p.z]);
  for (const mast of ['fore', 'main', 'mizzen']) for (const p of nav.rig[mast].yards[1]) aloftSpots.push([p.x, p.y, p.z]);
  const jobs = [];
  // Each job type hands out its places in turn, so no two men share a spot.
  const J = (n, f) => { let c = 0; for (let i = 0; i < n; i++) jobs.push(() => f(c++)); };
  J(6, (i) => step(aloftSpots[(i * 4) % aloftSpots.length], 'workBench', null, 'Aloft on a yard, working on the rigging', { face: -2.6 }));
  J(9, (i) => step(S.pump((i + 5) % 12), 'crank', null, 'Pumping ship at the chain-pump cranks', { face: 'in' }));
  J(8, (i) => step(S.drillGun(i % 2, 1 + (Math.floor(i / 2) % 5)), i % 3 === 0 ? 'push' : 'haul', null, 'Gun drill: running the gun in and out', { face: 'in' }));
  J(6, (i) => step(S.sail([0, 1, 3, 4, 5, 6, 7, 8, 9][i % 9]), 'sitWork', null, 'Mending a topsail on deck', { seat: 0.12, face: i % 2 ? 'out' : 'in' }));
  J(10, (i) => step(S.gangway(14.5 + (i % 11) * 1.75), 'haul', null, 'Hauling on the yard tackles', { face: i % 2 ? 1 : -1 }));
  const holdSpots = [[17.4, 0.8], [19.0, 0.9], [20.6, 0.8], [26.2, 0.8], [27.8, 0.9], [36.8, 0.8], [40.2, 0.9]].map(([x, z]) => [x, 2.55, z]);
  J(5, (i) => step(holdSpots[i % holdSpots.length], 'carryShoulder', null, 'Swaying up casks in the hold', { prop: 'box', face: 'out' }));
  J(5, (i) => step(S.waist((18 + i * 2) % 27), 'scrub', null, 'Holystoning the deck', { face: 1 }));
  J(4, (i) => step([16.0 + (i % 4) * 2.6, Y.orlop, 0.55], 'haul', null, 'Shifting the cable in the tier', { face: 1 }));
  const tops = [];
  for (const [mx, ty] of [[MAST.fore, 33.12], [MAST.main, 35.32]]) for (const [dx, dz] of [[-1.1, 0.7], [-0.2, 2.0], [1.0, 1.0], [0.6, -1.4], [-0.9, -1.9]]) tops.push([mx + dx, ty, dz]);
  J(8, (i) => step(tops[i % tops.length], i % 3 ? 'workBench' : 'lookout', null, i % 3 ? 'Working in the top' : 'Lookout in the top', { face: i % 2 ? 'out' : -1 }));
  const NIGHT = [];
  for (let i = 0; i < 9; i++) NIGHT.push([S.gangway(14 + i * 2.2), i % 3 ? 'sleepSit' : 'stand', 'On deck in the night watch, dozing between calls']);
  for (let i = 0; i < 6; i++) NIGHT.push([[1.5 + i * 1.8, Y.fc, 2.8 + (i % 2)], i % 2 ? 'sleepSit' : 'stand', 'Night watch on the forecastle']);
  for (let i = 0; i < 6; i++) NIGHT.push([[35.5 + i * 1.7, Y.qd, 3.0 + (i % 2) * 0.6], i % 3 ? 'stand' : 'sleepSit', 'Night watch with the afterguard on the quarterdeck']);
  for (let i = 0; i < 8; i++) NIGHT.push([S.waist(i * 2 + 1), 'sleepSit', 'Night watch: sitting out the hours in the waist']);
  const leisure = ['sitTalk', 'sitTalk', 'sitWork', 'sitTalk', 'sleepSit', 'sitDrink'];
  let n = 0;
  const out = [];
  for (const s of free) {
    const deck = s.deck;
    const marine = deck === 'lower' && s.x > 40 && n % 3 !== 0;
    const ham = hamFor(deck, s.x) || hamFor(deck === 'lower' ? 'middle' : 'lower', s.x);
    if (!ham) break;
    const watch = n % 2 ? 'S' : 'L';
    const job = marine ? null : jobs[n % jobs.length]();
    const job2 = marine ? null : jobs[(n * 7 + 3) % jobs.length]();
    const night = NIGHT[n % NIGHT.length];
    const muster = [s.x + (s.face > 0 ? -0.3 : 0.3), s.y, 3.2 + (n % 3) * 0.3];
    const R = [
      step(S.gangway(14 + (n % 10) * 2), 'carryShoulder', [7.5, 8], 'Up all hammocks: carrying his hammock up to the nettings', { prop: 'sack', face: 'in' }),
      seatAt(s, 'sitEat', [8, 8.75], 'Breakfast: burgoo or "Scotch coffee" and biscuit'),
      step([s.x, s.y, 3.3], 'sweep', [8.75, 9.5], 'Sweeping the deck and stowing the mess gear', { face: 'out' }),
      step(muster, 'handsBehind', [9.5, 10], 'Divisions: mustered for inspection', { face: 'out' }),
      seatAt(s, 'sitDrink', [11.5, 12], 'Up spirits: the forenoon grog', { prop: 'mug' }),
      seatAt(s, 'sitEat', [12, 13.5], 'Dinner: today oatmeal, butter, cheese and pease'),
      seatAt(s, 'sitEat', [17, 17.5], 'Supper and the second grog'),
    ];
    if (marine) {
      R.push(step(S.poopDrill(3 + (n % 6)), 'stand', [10, 11.5], 'Musket drill on the poop', { face: 'out' }));
      R.push(seatAt(s, n % 2 ? 'sitWork' : 'sitTalk', [13.5, 17], n % 2 ? 'Pipeclaying his crossbelts' : 'Off duty at the mess'));
      R.push(seatAt(s, 'sitTalk', [17.5, 20], 'Evening at the mess'));
      R.push(sleep(ham, [20, 7.5]));
    } else {
      job.when = [10, 11.5]; R.push(job);
      const onDeck = Object.assign({}, job2, { when: watch === 'S' ? [13.5, 16] : [16, 17] });
      R.push(onDeck);
      R.push(seatAt(s, leisure[n % leisure.length], watch === 'S' ? [16, 17] : [13.5, 16], 'Watch below: resting and mending at the mess', n % 5 === 0 ? { prop: 'cards' } : {}));
      R.push(seatAt(s, leisure[(n + 2) % leisure.length], [17.5, 20], 'The dog watches: talk, mending, a game of cards', n % 4 === 0 ? { prop: 'cards' } : {}));
      if (watch === 'S') {
        R.push(sleep(ham, [0, 4]));
        R.push(step(S.waist(n % 27), 'scrub', [4, 7.5], 'Morning watch: holystoning the deck', { face: 1 }));
        R.push(step(night[0], night[1], [20, 24], night[2], { seat: night[1] === 'sleepSit' ? 0.3 : undefined }));
      } else {
        R.push(step(night[0], night[1], [0, 4], night[2], { seat: night[1] === 'sleepSit' ? 0.3 : undefined }));
        R.push(sleep(ham, [4, 7.5]));
        R.push(sleep(ham, [20, 24]));
      }
    }
    const role = marine ? 'Royal Marine private' : r() < 0.25 ? 'landsman' : r() < 0.5 ? 'ordinary seaman' : 'able seaman';
    out.push(W.addPerson({ role, costume: marine ? Object.assign({}, MARINE, { hair: r.pick(['#2b1d14', '#4a3020', '#8d5a2b', '#6b4428']) }) : seaman(r), routine: R, H: 1.58 + r() * 0.16 }));
    n++;
  }
  return out;
}

// Extras who keep to one place: the sick, the wardroom, the cockpit, the fiddler.
export function castFixed(W, S, sick, r) {
  for (let i = 0; i < sick.length - 1; i++) W.addPerson({ role: 'seaman on the sick list', costume: seaman(r, { top: '#ece6d6', coat: null, hat: null }), at: sick[i].feet, act: 'lie', face: 1, label: 'Sick in a cot in the sick berth' });
  const wr = [[52.4, 2.15, -1], [53.1, 2.15, -1], [54.5, 2.15, -1], [51.7, 1.45, 1]];
  wr.forEach(([x, z, f], i) => W.addPerson({ role: i === 3 ? 'marine officer' : 'lieutenant', costume: i === 3 ? { coat: 'tail', coatColor: '#b02a22', top: '#ece6d6', bottom: '#ece6d6', hat: null, hairStyle: 'queue' } : { coat: 'tail', coatColor: '#1f2a48', top: '#ece6d6', bottom: '#ece6d6', hat: null, hairStyle: 'queue', hair: r.pick(['#4a3020', '#8d5a2b', '#9a9a9a']) }, routine: [
    step([x, Y.middle, z], 'sitEat', [12.6, 14.2], 'Dinner in the wardroom', { face: f, seat: 0.46 }),
    step([x, Y.middle, z], i % 2 ? 'sitRead' : 'sitTalk', [14.2, 15.5], 'Lingering at the wardroom table', { face: f, seat: 0.46 }),
    step(i === 3 ? S.poopA : i % 2 ? S.qdA : S.qdB, 'handsBehind', [15.5, 20], i === 3 ? 'With the marines on the poop' : 'On the quarterdeck', { face: 'out' }),
    step([x, Y.middle, z], 'sitTalk', [20, 21.5], 'Evening in the wardroom', { face: f, seat: 0.46, prop: i === 1 ? 'glass' : undefined }),
    step([44 + i * 2, Y.middle + 0.95, 4.95], 'lie', [21.5, 6], 'Asleep in his cot', { face: 1 }),
    step(i % 2 ? S.qdB : [36.5 + i, Y.qd, 2.0], 'handsBehind', [6, 12.6], i === 3 ? 'Inspecting the marines' : 'Officer of the watch', { face: 'out' }),
  ] }));
  // Midshipmen in the cockpit.
  for (let i = 0; i < 2; i++) W.addPerson({ role: 'midshipman', costume: { coat: 'jacket', coatColor: '#1f2a48', top: '#ece6d6', bottom: '#ece6d6', hat: null, build: 0.85 }, H: 1.5, routine: [
    step([37.2 + i * 1.1, Y.orlop, 0.95], i ? 'sitWrite' : 'sitRead', [6, 20], i ? 'Working a navigation problem' : 'Reading by the purser’s dip', { face: 'in', seat: 0.4, prop: i ? 'paper' : 'book' }),
    step([36.83 + 0.01 * i, 7.78, 3.32], 'lie', [20, 6], 'Asleep in the cockpit', { face: 1 }),
  ] });
  // A seasick landsman by a bucket, and two messmates trading cheese for tobacco.
  W.addPerson({ role: 'landsman, new to the sea', costume: seaman(r, { coat: null, hat: null, top: '#e4dccb' }), routine: [
    step([44.2, Y.lower, 3.7], 'kneel', [7.6, 20], 'Seasick, by a bucket that cannot be emptied till the watch changes', { prop: 'bucket', face: 'out' }),
    step([44.2, Y.lower + 0.02, 3.7], 'sleepSit', [20, 7.6], 'Dozing miserably by his bucket', { seat: 0.2 }),
  ] });
  for (let i = 0; i < 2; i++) W.addPerson({ role: 'able seaman', costume: seaman(r), routine: [
    step([34.0 + i * 1.0, Y.lower, 3.9], 'sitTalk', [13.5, 16.5], i ? 'Trading a twist of tobacco for his messmate\u2019s cheese' : 'Trading his cheese for a twist of tobacco', { face: i ? -1 : 1, seat: 0.42, prop: i ? 'pipe' : undefined }),
    step([34.0 + i * 1.0, Y.lower, 3.9], 'sitTalk', [16.5, 13.5], 'Off watch on a sea chest', { face: i ? -1 : 1, seat: 0.42 }),
  ] });
  // A fiddler on the forecastle in the dog watches, and dancers.
  W.addPerson({ role: 'seaman with a fiddle', costume: seaman(r, { hat: 'boater', hatColor: '#2a2622' }), routine: [
    step([6.4, Y.fc, 1.6], 'violin', [17.5, 20], 'Fiddling in the dog watches', { face: 'out' }),
    step([22.8, Y.middle, 4.4], 'sitTalk', [20, 17.5], 'Off watch', { seat: 0.2 }),
  ] });
  for (let i = 0; i < 4; i++) W.addPerson({ role: 'able seaman', costume: seaman(r), routine: [
    step([4.6 + i * 0.85, Y.fc, 2.3 + (i % 2) * 0.6], 'dance', [18, 19.8], 'Dancing a hornpipe in the dog watches', { face: 'out' }),
    step([3.4 + i * 1.5, Y.fc, 3.6], i % 2 ? 'sleepSit' : 'stand', [19.8, 18], 'On the forecastle', { seat: 0.3, face: 'out' }),
  ] });
}

// The capstan crew: men on the bars of the jeer capstan while stores come aboard.
export function castCapstan(W, r, cap) {
  for (let i = 0; i < 14; i++) {
    W.addPerson({ role: i % 3 ? 'seaman on the capstan bars' : 'Royal Marine on the capstan bars', costume: i % 3 ? seaman(r, { coat: null }) : Object.assign({}, MARINE, { coat: null, top: '#ece6d6' }), at: [cap.x, Y.middle, 2.5], act: 'push', label: 'Heaving at the jeer capstan, hoisting stores from the transport',
      update(p) {
        const on = inH(W.hour, 10, 11.5);
        const a = W.data.capAng + (i / 14) * TAU + 0.11;
        const z = Math.sin(a) * 2.75;
        p.hidden = !on || z < 0.35;
        p.x = cap.x + Math.cos(a) * 2.75; p.z = z; p.y = Y.middle;
        p.targetHeading = p.heading = Math.atan2(Math.cos(a), -Math.sin(a));
        p.dist = W.time * 0.4;
      } });
  }
}

// ------------------------------------------------------------------ machines and moving parts
export function machines(W, k, stage) {
  const D = W.data;
  D.capAng = 0;
  // Jeer capstan drumhead (turns while stores are hoisted) and the main capstan (at rest).
  const jeer = capstanPart(k, 23.5, Y.middle, true);
  const main = capstanPart(k, 37.5, Y.middle, false);
  void main;
  // Two middle-deck guns at drill: run in and out by their crews.
  const drill = DRILL.map((x) => k.part(0, 0, 0, (q) => gun(q, x, Y.middle, PORTS.middle, '24')));
  // Chain-pump cranks: a long iron crank through both pump heads.
  const crank = k.part(0, Y.lower + 0.98, 2.4, (q) => {
    const iron = mat('#2c2a28');
    q.cyl(27.4, 0, 0, 0.05, 6.2, iron, { axis: 'x', seg: 6 });
    for (const x of [28.2, 30.5, 32.8]) { q.box(x - 0.04, -0.04, -0.04, x + 0.04, 0.34, 0.04, iron); q.cyl(x - 0.5, 0.3, 0, 0.04, 1.0, mat('#8a6a42'), { axis: 'x', seg: 5 }); }
  });
  // The double wheel on the quarterdeck, and the tiller in the gunroom that it works.
  const wheel = k.part(47.5, Y.qd + 1.0, 0, (q) => {
    const wd = mat({ c: '#8a4a2a', whole: true }), br = mat({ c: '#c8a050', whole: true });
    q.cyl(-0.65, 0, 0, 0.14, 1.3, wd, { axis: 'x', seg: 8 });
    for (const dx of [-0.5, 0.5]) {
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; q.beam([dx, 0, 0], [dx, Math.cos(a) * 1.08, Math.sin(a) * 1.08], 0.045, wd); }
      q.cyl(dx - 0.06, 0, 0, 0.16, 0.12, br, { axis: 'x', seg: 10 });
    }
  });
  for (const s of [-0.5, 0.5]) {
    const rim = k.part(0, 0, 0, (q) => {
      const wd = mat({ c: '#8a4a2a', whole: true });
      const pts = [];
      for (let i = 0; i <= 24; i++) { const a = (i / 24) * TAU; pts.push([s, Math.cos(a) * 0.86, Math.sin(a) * 0.86]); }
      q.tube(pts, 0.05, wd, { seg: 5 });
    });
    wheel.add(rim);
  }
  const tiller = k.part(sternX(9.6) - 0.3, Y.lower + 1.48, 0, (q) => {
    q.beam([0, 0, 0], [-6.2, -0.05, 0], 0.26, mat({ c: '#6a4426', whole: true }));
    q.cyl(-6.0, -0.12, 0, 0.05, 0.15, mat({ c: '#2c2a28', whole: true }));
  });
  // The ship's bell in the belfry: struck every half hour as the glass is turned.
  const bell = k.part(11.08, Y.fc + 1.88, 0, (q) => {
    const b = mat({ c: '#c8a050', c2: '#a88030', whole: true });
    q.lathe([[0.0, -0.02], [0.08, -0.02], [0.14, -0.2], [0.22, -0.42], [0.25, -0.5], [0.0, -0.5]], 0, 0, b, { seg: 14 });
  });
  D.bellT = -1; D.lastHalf = -1;

  W.addMachine((dt, t, w) => {
    const h = w.hour;
    // Capstan: about 1.5 turns a minute while working.
    const capOn = inH(h, 10, 11.5);
    if (capOn) D.capAng += dt * 0.16;
    jeer.g.rotation.y = -D.capAng;
    if (jeer.bars) jeer.bars.visible = capOn;
    // Drill: a cycle of about 50 s: run in, load, run out.
    const drOn = inH(h, 10, 11.5) || inH(h, 13.5, 15);
    drill.forEach((g, i) => {
      if (!drOn) { g.position.z = 0; return; }
      const c = ((t + i * 17) % 50) / 50;
      const back = c < 0.15 ? c / 0.15 : c < 0.6 ? 1 : c < 0.8 ? 1 - (c - 0.6) / 0.2 : 0;
      g.position.z = -1.15 * (back * back * (3 - 2 * back));
    });
    // Pumps: cranks turn at about 30 rpm when men are at them.
    let pumpers = 0;
    for (const p of w.people) if (p.anim === 'crank' && !p.moving && p.y > 8 && p.y < 9 && p.x > 27 && p.x < 34.5) pumpers++;
    D.pumping = pumpers > 0;
    if (pumpers) crank.rotation.x -= dt * 3.2;
    // Wheel and tiller: a few spokes either way as the helmsman meets the swell.
    const helm = Math.sin(t * 0.21) * 0.35 + Math.sin(t * 0.077) * 0.25;
    wheel.rotation.x = helm;
    tiller.rotation.y = -helm * 0.12;
    // Bell: struck at each half hour (eight bells end each four-hour watch).
    const half = Math.floor(h * 2);
    if (D.lastHalf < 0) D.lastHalf = half;
    if (half !== D.lastHalf) { D.lastHalf = half; D.bellT = 0; }
    if (D.bellT >= 0) { D.bellT += dt; bell.rotation.x = Math.sin(D.bellT * 9) * 0.35 * Math.exp(-D.bellT * 0.8); if (D.bellT > 6) { D.bellT = -1; bell.rotation.x = 0; } }
  });
  return { jeer };
}

// ------------------------------------------------------------------ animals
function critter(k, spec) {
  return k.part(0, 0, 0, (q) => {
    const c = mat(spec.c);
    q.sphere(0, spec.h, 0, spec.r, c, { seg: 8, rings: 5 });
    q.sphere(spec.r * 1.1, spec.h + spec.r * 0.4, 0, spec.r * 0.55, mat(spec.head || spec.c), { seg: 8, rings: 5 });
    if (spec.legs) for (const [dx, dz] of [[-0.6, -0.5], [-0.6, 0.5], [0.6, -0.5], [0.6, 0.5]]) q.cyl(dx * spec.r, 0, dz * spec.r * 0.8, spec.r * 0.12, spec.h - spec.r * 0.6, mat(spec.leg || '#3a3028'), { seg: 4 });
    if (spec.tail) q.cyl(-spec.r * 1.6, spec.h + spec.r * 0.1, 0, spec.r * 0.12, spec.r * 1.4, c, { axis: 'x', seg: 4 });
    if (spec.horns) for (const dz of [-0.06, 0.06]) q.cyl(spec.r * 1.3, spec.h + spec.r * 0.85, dz, 0.02, 0.14, mat('#8a7a5a'), { seg: 4, r2: 0.005 });
  });
}
export function animals(W, k) {
  const add = (o, fn) => W.addActor({ object: o, update: fn });
  // The goat wanders the waist; two sheep in the pen [S17].
  const goat = critter(k, { c: '#e8e0d0', head: '#d8d0c0', h: 0.48, r: 0.27, legs: true, tail: false, horns: true });
  add(goat, (dt, t) => { const a = t * 0.05; goat.position.set(21.4 + Math.sin(a) * 1.8, Y.upper + 0.08, 2.8 + Math.sin(a * 2.3) * 0.7); goat.rotation.y = -Math.atan2(Math.cos(a * 2.3) * 1.6, Math.cos(a) * 1.8) ; goat.children.forEach(() => {}); });
  for (let i = 0; i < 2; i++) {
    const sh = critter(k, { c: '#f0ece0', head: '#3a3028', h: 0.42, r: 0.3, legs: true });
    sh.position.set(20.2 + i * 2.2, Y.upper + 0.08, 3.4 - i * 0.3); sh.rotation.y = i ? Math.PI : 0;
    add(sh, (dt, t) => { sh.rotation.z = Math.sin(t * 0.7 + i) * 0.04; });
  }
  // Hens pecking by their coops on the poop.
  for (let i = 0; i < 4; i++) {
    const hen = critter(k, { c: i % 2 ? '#c87a3a' : '#f2ece0', head: '#c8302a', h: 0.16, r: 0.11, legs: true, leg: '#d8a040' });
    const x0 = 49.6 + i * 1.6;
    add(hen, (dt, t) => { const ph = t * 1.3 + i * 2; hen.position.set(x0 + Math.sin(t * 0.13 + i) * 0.4, Y.poop, innerZ(x0, Y.poop + 0.3) - 1.05); hen.rotation.z = Math.max(0, Math.sin(ph * 3)) * -0.5; hen.rotation.y = Math.sin(t * 0.13 + i) > 0 ? 0 : Math.PI; });
  }
  // The ship's cat stalking a rat by the bread room [S30, S13].
  const cat = critter(k, { c: '#4a4038', h: 0.13, r: 0.12, legs: false, tail: true });
  const rat = critter(k, { c: '#5a5048', h: 0.05, r: 0.055, legs: false, tail: true });
  add(cat, (dt, t) => {
    const c = (t % 40) / 40;
    const x = c < 0.7 ? 50.3 + c * 1.6 : 51.4 + (c - 0.7) * 2.4;
    cat.position.set(x, Y.orlop, 2.65); cat.rotation.y = 0; cat.scale.y = c < 0.7 ? 0.85 : 1;
  });
  add(rat, (dt, t) => {
    const c = (t % 40) / 40;
    const x = c < 0.7 ? 52.0 + Math.sin(t * 2) * 0.1 : 52.0 + (c - 0.7) * 4.0;
    rat.position.set(x, Y.orlop, 2.75); rat.rotation.y = 0;
    rat.visible = c < 0.95;
  });
  // Rats in the hold, running along the casks.
  for (let i = 0; i < 3; i++) {
    const rt = critter(k, { c: '#4a4038', h: 0.05, r: 0.055, legs: false, tail: true });
    const x0 = 16 + i * 9, len = 5 + i;
    add(rt, (dt, t) => { const c = ((t * 0.09 + i * 0.37) % 1); const fw = c < 0.5; const u = fw ? c * 2 : 2 - c * 2; rt.position.set(x0 + u * len, 2.55, 1.15 + (i % 2) * 0.05); rt.rotation.y = fw ? 0 : Math.PI; rt.visible = Math.sin(t * 0.2 + i * 2) > -0.3; });
  }
  // Gulls by day and dolphins in the swell.
  for (let g = 0; g < 6; g++) {
    const gull = k.part(0, 0, 0, (q) => {
      const w = mat({ c: '#f2f0ea', thin: true, whole: true });
      q.sphere(0, 0, 0, 0.14, mat({ c: '#f2f0ea', whole: true }), { seg: 6, rings: 4 });
      q.boxR(0, 0.02, 0.4, 0.2, 0.02, 0.7, w, { x: 0.25 });
      q.boxR(0, 0.02, -0.4, 0.2, 0.02, 0.7, w, { x: -0.25 });
    });
    add(gull, (dt, t, w) => {
      gull.visible = w.sun().day > 0.3;
      const ph = t * (0.09 + g * 0.012) + g * 1.1;
      gull.position.set(30 + Math.cos(ph) * (34 + g * 4), 30 + g * 3 + Math.sin(t * 0.6 + g) * 2, 18 + Math.sin(ph) * (14 + g * 2));
      gull.rotation.y = -ph - Math.PI / 2;
      gull.rotation.z = Math.sin(t * 5 + g) * 0.15;
    });
  }
  for (let i = 0; i < 3; i++) {
    const dol = k.part(0, 0, 0, (q) => {
      const c = mat({ c: '#5a6a78', whole: true });
      q.sphere(0, 0, 0, 0.32, c, { seg: 8, rings: 5 });
      q.cyl(0.25, 0, 0, 0.26, 0.9, c, { axis: 'x', r2: 0.06, seg: 8 });
      q.cyl(-0.9, 0, 0, 0.12, 0.9, c, { axis: 'x', r2: 0.26, seg: 8 });
      q.boxR(0, 0.32, 0, 0.3, 0.3, 0.05, c, { z: -0.5 });
    });
    add(dol, (dt, t) => {
      const per = 9 + i * 1.7;
      const c = ((t + i * 3.1) % per) / per;
      const leap = c < 0.25;
      const u = leap ? c / 0.25 : 0;
      const x = -8 - ((t * 3.2 + i * 6) % 60);
      dol.visible = leap;
      dol.position.set(x, 7.6 + Math.sin(u * Math.PI) * 1.3 - 0.4, 12 + i * 3.5);
      dol.rotation.z = -Math.cos(u * Math.PI) * 0.7;
      dol.rotation.y = Math.PI;
    });
  }
}

// ------------------------------------------------------------------ the fleet and the transport
function shipModel(k, x, z, L, decks, opts = {}) {
  const yb = 7.6 - L * 0.12, beam = L * 0.27;
  const W = (c) => mat({ c, whole: true });
  const top = 7.6 + decks * 2.1 + 1.0;
  const secs = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, xx = x + L * t;
    const f = Math.pow(Math.sin(Math.PI * (0.06 + t * 0.9)), 0.45);
    const w = beam / 2 * f;
    secs.push({ x: xx, pts: [[z - w * 0.4, yb + 1], [z - w, 7.6], [z - w * 0.92, top], [z + w * 0.92, top], [z + w, 7.6], [z + w * 0.4, yb + 1]] });
  }
  const band = (s, i) => (i === 1 ? W(opts.side || '#262220') : i === 2 ? W('#3a2a1e') : i === 0 || i === 4 ? W('#262220') : W('#262220'));
  k.loft(secs, W('#262220'), { matFn: band });
  for (let d = 0; d < decks; d++) k.box(x + L * 0.08, 8.3 + d * 2.1, z - beam * 0.48, x + L * 0.92, 8.9 + d * 2.1, z - beam * 0.47, W(opts.band || '#d8b880'));
  const masts = decks >= 2 ? [0.18, 0.48, 0.74] : opts.brig ? [0.28, 0.62] : [0.2, 0.5, 0.76];
  masts.forEach((t, j) => {
    const mx = x + L * t, H = L * (j === 1 ? 1.05 : j === 0 ? 0.95 : 0.75) * (opts.short || 1);
    k.cyl(mx, top - 1, z, 0.25, H, W('#c49c64'), { seg: 6, r2: 0.1 });
    for (let s = 0; s < (opts.bare ? 0 : 3); s++) {
      const y0 = top + 2 + H * (0.08 + s * 0.28), hgt = H * 0.24, wdt = L * (0.42 - s * 0.1);
      const sk = Math.sin(BRACE) * wdt * 0.5;
      k.quad([mx - sk, y0, z - wdt * 0.42], [mx + sk, y0, z + wdt * 0.42], [mx + sk * 0.8, y0 + hgt, z + wdt * 0.34], [mx - sk * 0.8, y0 + hgt, z - wdt * 0.34], mat({ c: '#ece2c8', c2: '#d8caa6', pat: 'canvas', s: 1.5, thin: true, whole: true }));
    }
  });
  k.cyl(x - L * 0.04, top - 1.5, z, 0.2, L * 0.3, W('#c49c64'), { seg: 5, r2: 0.08 });
  return { top };
}
export function buildFleet(k) {
  // Ships of the fleet at various ranges (Nelson had 23 sail of the line about 6 October [S27]).
  const ships = [[-160, 260, 56, 2], [40, 420, 60, 3], [180, 330, 55, 2], [-320, 520, 54, 2], [300, 600, 58, 2], [-60, 760, 52, 2], [480, 900, 56, 3], [-480, 980, 40, 1, { short: 0.9 }]];
  for (const [x, z, L, d, o] of ships) shipModel(k, x, z, L, d, o);
  // The transport: a merchant-built ship come to unload bread and wine [S27, S28].
  const tx = -62, tz = 34;
  const tr = shipModel(k, tx, tz, 30, 1, { side: '#5a4232', band: '#4a3a2e', brig: true, short: 0.95, bare: false });
  // Her ensign hoisted at the masthead: emptied, she will take back casks and staves [S28].
  return { tx, tz, top: tr.top };
}
export function transportLife(W, k, tr, r) {
  const flag = k.part(tr.tx + 30 * 0.62, tr.top - 1 + 30 * 1.05 * 0.95 - 0.3, tr.tz, (q) => {
    const red = mat({ c: '#b8302a', thin: true, whole: true });
    q.quad([0, 0, 0], [0, -1.0, 0], [-1.9, -1.05, 0], [-1.9, 0.05, 0], red);
    q.quad([-0.02, -0.02, 0.01], [-0.02, -0.5, 0.01], [-0.8, -0.5, 0.01], [-0.8, -0.02, 0.01], mat({ c: '#2a3a7a', thin: true, whole: true }));
  });
  W.addActor({ object: flag, update(dt, t) { flag.rotation.y = Math.sin(t * 2.4) * 0.25; } });
  // Her jolly boat pulling to and fro with casks.
  const jb = k.part(0, 0, 0, (q) => boat(q, -2.6, 2.6, 7.35, 0, 1.6, '#3a3a3a', '#a8845a'));
  const rowers = [];
  for (let i = 0; i < 4; i++) rowers.push(W.addPerson({ role: "transport's boat crew", costume: seaman(r, { coat: null }), at: [70, 7.7, 20], act: i === 3 ? 'sit' : 'sitRow', seat: 0.3, label: i === 3 ? 'Steering the boat loaded with empty casks' : 'Rowing between the transport and the flagship', H: 1.62, update() {} }));
  W.addActor({ object: jb, update(dt, t) {
    const c = (t % 160) / 160;
    const u = c < 0.5 ? c * 2 : 2 - c * 2;
    const s = u * u * (3 - 2 * u);
    const x = -6 - s * 22, z = 11 + s * 17;
    jb.position.set(x, Math.sin(t * 0.9) * 0.08, z);
    const hd = c < 0.5 ? Math.atan2(17, -22) : Math.atan2(-17, 22);
    jb.rotation.y = -hd;
    rowers.forEach((p, i) => {
      const off = (i - 1.5) * 1.1;
      p.x = x + Math.cos(hd) * off; p.z = z + Math.sin(hd) * off; p.y = 7.68 + Math.sin(t * 0.9) * 0.08;
      p.targetHeading = p.heading = i === 3 ? hd + Math.PI : hd + Math.PI;
    });
  } });
}

export { MAST, halfB, RIG, props, THREE, MESS };
