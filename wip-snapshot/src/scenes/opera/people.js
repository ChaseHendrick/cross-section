/* The Opera: the navigation graph, the cast (47 fictional people from the dossier's casting
 * list, docs/research/opera.md 4.4) and the crowds of extras, with their hours.
 *
 * Clock: daySeconds 2160, so one minute of the clock passes in 1.5 real seconds. Routine
 * durations are written in clock minutes with M(). Visibility of crowds follows the show
 * (showAt in common.js): the house fills from 19:00, empties in the intervals' promenade,
 * and is dark by day.
 */
import { Y, D, AX, R1, R2, R3, PROS, ST0, ST1, SZ, TIERS, stageY, stallsY, ring, ACTS, showAt, inH } from './common.js';
import { SEATS } from './house.js';
import { fdY, BACK } from './back.js';
import { FRONT } from './front.js';

const PI = Math.PI;
export const M = (min) => min * 1.5; // clock minutes to real seconds
const U = Y.under;

// ------------------------------------------------------------------ costumes
const C = {
  tails: (o) => Object.assign({ top: '#f2ece0', bottom: '#1a1a1e', coat: 'tail', coatColor: '#1a1a1e', shoes: '#141210' }, o),
  gown: (c, o) => Object.assign({ dress: 'long', dressColor: c, top: c, hairStyle: 'bun', sleeves: 'short', stockings: '#f2e8dc' }, o),
  blouse: (o) => Object.assign({ top: '#3e5a86', bottom: '#4a4a52', hat: 'flat', hatColor: '#2a2a2e', shoes: '#2a1e18' }, o),
  shirt: (o) => Object.assign({ top: '#e2dac8', bottom: '#4a4038', hat: 'flat', hatColor: '#3a3430', sleeves: 'short', shoes: '#2a1e18' }, o),
  fireman: (o) => Object.assign({ top: '#1e2640', bottom: '#1e2640', coat: 'jacket', coatColor: '#1e2640', hat: 'helmet', hatColor: '#c8a050', shoes: '#141210' }, o),
  black: (o) => Object.assign({ top: '#f0ead8', bottom: '#1e1e22', coat: 'long', coatColor: '#1e1e22', shoes: '#141210' }, o),
  dancer: (o) => Object.assign({ dress: 'knee', dressColor: '#f6f2ec', top: '#f2ece4', stockings: '#f0d8d4', shoes: '#f0d0cc', hairStyle: 'bun', sleeves: 'short' }, o),
  mother: (o) => Object.assign({ dress: 'long', dressColor: '#2a2a30', top: '#2a2a30', hat: 'bonnet', hatColor: '#1e1e22' }, o),
  maid: (o) => Object.assign({ dress: 'long', dressColor: '#26262a', top: '#26262a', apron: '#f2ece0', hat: 'coif', hatColor: '#f2ece0' }, o),
};
const GOWNS = ['#7a1e34', '#2a4a6a', '#d8c8a8', '#5a2a5a', '#3a5a4a', '#e0d0e0', '#8a6a3a', '#1e2a44', '#a84a4a', '#c8b8d8', '#f0e4c8'];

// ------------------------------------------------------------------ the navigation graph
function buildNav(W) {
  const nav = W.nav;
  const N = (id, x, y, z) => nav.node(id, x, y, z);
  const link = (a, b, kind) => nav.link(a, b, kind || 'walk');
  const chain = (ids, kind) => nav.chain(ids, kind || 'walk');
  // Off-stage homes: the city to the left, the street beyond the courtyard gate to the right,
  // and the subscribers' carriage pavilion on the near (east) side, all hidden.
  N('homeL', -60, 0, 6); N('homeR', 180, Y.court, 2); N('subsIn', 66, Y.rot, -5);
  // The Place, the perron and the portico.
  const place = nav.walkway('place', -52, -8.5, 0, 4, 5.5);
  link('homeL', place[0]);
  N('perron0', -7.4, 0, 4); N('perron1', 0.6, Y.vest, 4);
  link(place[place.length - 1], 'perron0'); link('perron0', 'perron1', 'stairs');
  N('queue', -6, 0, 8.5); link('queue', place[place.length - 1]);
  N('portico', 4.5, Y.vest, 2.2); link('perron1', 'portico');
  // Vestibule, box office, contrôle steps, contrôle.
  N('vest', 12, Y.vest, 0.8); link('portico', 'vest');
  N('boxoffice', 15.0, Y.vest, 8.8); link('vest', 'boxoffice');
  N('vestE', 16.8, Y.vest, 2.4); link('vest', 'vestE');
  N('ctrl0', 19.3, Y.ctrl, 2.4); link('vestE', 'ctrl0', 'stairs');
  N('ctrl', 23, Y.ctrl, 2.0); link('ctrl0', 'ctrl');
  N('ctrlSalt', 21.4, Y.ctrl, 1.9); link('ctrl0', 'ctrlSalt'); link('ctrlSalt', 'ctrl');
  N('flight0', 30.6, Y.ctrl, 2.4); link('ctrl', 'flight0');
  N('flight1', 43.8, 8.0, 2.4); link('flight0', 'flight1', 'stairs');
  N('landing', 47, 8.0, 2.0); link('flight1', 'landing');
  N('landingN', 46, 8.0, 9.0); link('landing', 'landingN');
  // The double flight up to the premieres level and its gallery.
  N('dfl1', 32.4, Y.loggia, 9.2); link('landingN', 'dfl1', 'stairs');
  N('gal12', 30.5, Y.loggia, 4.0); link('dfl1', 'gal12');
  N('gal12far', 40, Y.loggia, 13.5); link('dfl1', 'gal12far');
  N('gal12E', 49, Y.loggia, 13.5); link('gal12far', 'gal12E');
  // Lower ramp: from the contrôle level down to the Rotonde level and the Pythia.
  N('rampTop', 33.6, Y.ctrl, 8.5); link('ctrl', 'rampTop');
  N('rampFoot', 44.6, Y.rot, 8.5); link('rampTop', 'rampFoot', 'stairs');
  N('pythia', 47.6, Y.rot, 3.4); link('rampFoot', 'pythia');
  N('gallery0', 52, Y.rot, 1.6); link('pythia', 'gallery0');
  N('gallery1', 58, Y.rot, 1.6); link('gallery0', 'gallery1');
  // The Rotonde des abonnes.
  N('rot', 66, Y.rot, 2.0); link('gallery1', 'rot');
  N('rotC', 69.6, Y.rot, 1.2); link('rot', 'rotC');
  N('rotE', 78, Y.rot, 2.2); link('rotC', 'rotE');
  N('rotN', 71.5, Y.rot, 6.0); link('rotC', 'rotN'); link('rot', 'rotN'); link('rotE', 'rotN');
  link('subsIn', 'rotC');
  // Down to the cellars.
  N('cellarStair', 60.5, Y.rot, 14.4); link('gallery1', 'cellarStair');
  N('cellarFoot', 55, Y.cellar, 14.4); link('cellarStair', 'cellarFoot', 'stairs');
  const cel = nav.walkway('cellar', 54, 3, Y.cellar, 3.8, 6.5);
  link('cellarFoot', cel[0]);
  // Auditorium: the corridor behind the boxes at baignoire level, the door to the stalls.
  N('amphDoor', 51.4, 8.0, 1.5); link('landing', 'amphDoor', 'door');
  N('stallsDoor', 58.4, stallsY(58.4) - 0.3, 0.5); link('amphDoor', 'stallsDoor');
  const aisle = [];
  for (let x = 60.8; x <= 79.4; x += 2.32) aisle.push(N('aisle' + aisle.length, x, stallsY(x) + 0.0, 0.32));
  link('stallsDoor', aisle[0]); chain(aisle);
  // Corridors of every tier round the horseshoe, joined by a service stair deep in the ring.
  const cor = TIERS.map((y, t) => {
    const ids = [];
    for (let a = PI - 0.08; a > PI / 2; a -= 0.19) ids.push(N(`cor${t}_${ids.length}`, ...ring(a, (R2 + R3) / 2, y)));
    for (let x = AX + 1.5; x < PROS - 4; x += 3.4) ids.push(N(`cor${t}_${ids.length}`, x, y, (R2 + R3) / 2));
    chain(ids);
    return ids;
  });
  for (let t = 0; t < TIERS.length - 1; t++) {
    const mid = N('cstair' + t, ...ring(PI * 0.62, (R2 + R3) / 2 + 0.6, (TIERS[t] + TIERS[t + 1]) / 2));
    link(cor[t][4], mid, 'stairs'); link(mid, cor[t + 1][4], 'stairs');
  }
  link('amphDoor', cor[0][0], 'door');
  link('gal12E', cor[1][0], 'door');
  N('bal18', 40, 18.5, 13.2); N('bal22', 40, 22, 13.2); N('bal25', 40, 25, 13.2); N('bal15', 48.8, 15, 4);
  link('bal18', cor[3][0], 'door'); link('bal22', cor[4][0], 'door'); link('bal25', cor[5][0], 'door'); link('bal15', cor[2][0], 'door');
  // Boxes: a node in each box, off its corridor node (named people use them).
  const boxNode = (t, i) => {
    const id = `box${t}_${i}`;
    if (!nav.get(id)) { const c = nav.get(cor[t][i]); const a = Math.atan2(c.z, c.x - AX); const p = c.x < AX + 0.5 ? ring(a, R1 + 1.1, c.y) : [c.x, c.y, R1 + 1.1]; N(id, ...p); link(cor[t][i], id, 'door'); }
    return id;
  };
  // The amphitheatre at the back of the premieres level.
  N('amph', ...ring(PI - 0.05, 9.0, TIERS[1] + 1.2)); link(cor[1][0], 'amph', 'stairs');
  // Attic over the auditorium (ventilation), up from the top corridor.
  N('attic', AX - 12, 29.2, 6); link(cor[5][2], 'attic', 'ladder');
  N('atticW', AX + 5, 30.8, 3); link('attic', 'atticW');
  // The avant-foyer, Grand Foyer and loggia.
  N('avf', 25, Y.foyer, 2.0); link('gal12', 'avf');
  N('foyer', 15, Y.foyer, 1.8); link('avf', 'foyer');
  N('foyer1', 14, Y.foyer, 8); N('foyer2', 16, Y.foyer, 15); N('foyer3', 14.5, Y.foyer, 22); N('foyerFire', 15, Y.foyer, 24.6);
  chain(['foyer', 'foyer1', 'foyer2', 'foyer3', 'foyerFire']);
  N('loggia', 5, Y.loggia, 1.2); link('foyer', 'loggia', 'door');
  N('loggia1', 5.5, Y.loggia, 10); link('loggia', 'loggia1');
  // Orchestra pit and the musicians' way in beneath the stage front.
  const pit = nav.walkway('pit', 80.7, 85.4, Y.pit, 0.5, 1.6);
  N('pitStair', 85.4, Y.pit, 8.7); link(pit[pit.length - 1], 'pitStair');
  N('mezz', 84.5, 4.0, 7.3); link('pitStair', 'mezz', 'stairs');
  N('mezzW', 87.6, 4.0, 3.6); link('mezz', 'mezzW');
  N('organ', 85.4, 4.0, 4.6); link('mezzW', 'organ'); link('mezz', 'organ');
  N('mfoyer', 84.5, Y.rot, 5.6); link('mezz', 'mfoyer', 'stairs');
  N('prompt', 86.7, 6.2, 0.4); link('mezzW', 'prompt', 'ladder');
  N('niche', 87.3, 6.2, 1.8); link('mezzW', 'niche', 'ladder');
  N('l1front', 89.6, U[0], 3.6); link('mezzW', 'l1front', 'stairs');
  // The stage: a grid of nodes over the raked floor (front, middle, wings).
  const st = {};
  for (const [row, z] of [['f', 1.4], ['m', 5.0], ['w', 10.5], ['d', 17.5]]) {
    const ids = [];
    for (let x = ST0 + 0.6; x <= ST1 - 0.8; x += 3.2) ids.push(N(`st${row}${ids.length}`, x, stageY(x), z));
    chain(ids);
    st[row] = ids;
  }
  for (let i = 0; i < st.f.length; i++) { link(st.f[i], st.m[i]); link(st.m[i], st.w[i]); link(st.w[i], st.d[i]); }
  N('trapTop', 95.25, stageY(95.25), 0.65); link(st.f[2], 'trapTop');
  N('trapBot', 95.25, U[0], 0.65); link('trapTop', 'trapBot', 'lift');
  // Stairs at the back corner down through the understage, and up to the galleries and grils.
  const back = N('stBack', ST1 - 1.2, stageY(ST1 - 1.2), 15.8); link(st.d[st.d.length - 1], back); link(st.w[st.w.length - 1], back);
  let prev = back;
  const lv = [];
  U.forEach((y, i) => {
    const a = N('ul' + i, i % 2 ? ST1 - 0.8 : ST1 - 3.4, y, 15.8);
    link(prev, a, 'stairs');
    const row = [];
    for (let x = ST0 + 1.4; x < ST1 - 1; x += 3.3) row.push(N(`u${i}_${row.length}`, x, y, 3.0));
    chain(row);
    link(a, row[row.length - 1]);
    lv.push(row);
    prev = a;
  });
  link('l1front', lv[0][0]); link('trapBot', lv[0][2]);
  N('cisternEdge', 117.5, Y.chorus, 1.2); N('water', 118.2, Y.water + 0.05, 1.6);
  link('cisternEdge', 'water', 'ladder');
  const gal = [];
  let gp = N('flyStair0', ST1 - 1.5, stageY(ST1 - 1.5), SZ - 5.2); link(st.d[st.d.length - 1], gp);
  [Y.flies, 33.5, 38, Y.gril[0], Y.gril[1], Y.gril[2]].forEach((y, i) => {
    const n = N('fly' + i, i % 2 ? ST1 - 3.4 : ST1 - 0.8, y, SZ - 5.2);
    link(gp, n, 'stairs');
    gp = n;
    const row = [];
    for (let x = ST1 - 2.5; x > ST0 + 1; x -= 4) row.push(N(`g${i}_${row.length}`, x, y, i < 3 ? SZ - 2.6 : 8));
    link(n, row[0]); chain(row);
    gal.push(row);
  });
  N('bridge', 99.8, 36.0, 10); link(gal[2][4], 'bridge', 'ladder');
  N('arcBridge', ST0 + 1.2, 24.0, 12); link(gal[0][gal[0].length - 1], 'arcBridge', 'ladder');
  N('roofWalk', 104, Y.ridge, 0.5); link(gal[5][3], 'roofWalk', 'ladder');
  N('roofApollo', PROS + 1.2, Y.ridge, 0.5); link('roofWalk', 'roofApollo');
  // Behind the stage: corridor, Foyer de la Danse, stores, the extras' room, the chorus hall.
  N('corr', 119, Y.back, 1.4); link(st.f[st.f.length - 1], 'corr'); link(st.m[st.m.length - 1], 'corr');
  N('corrN', 119.5, Y.back, 8.5); link('corr', 'corrN');
  N('liftTop', 119.1, Y.back, 6.3); N('liftBot', 119.1, Y.chorus, 6.3); link('corrN', 'liftTop'); link('liftTop', 'liftBot', 'lift');
  const fdd = [];
  for (let x = 123; x < 138; x += 2.4) fdd.push(N('fdd' + fdd.length, x, fdY(x), 2.6));
  N('fddDoor', 121.9, Y.back, 1.0); link('corr', 'fddDoor'); link('fddDoor', fdd[0]); chain(fdd);
  N('fddBench', 129, fdY(129), 8.6); link(fdd[3], 'fddBench');
  N('fddBarre', 131.5, fdY(131.5), 11.0); link(fdd[4], 'fddBarre');
  N('svc0', 117.2, Y.back, 11.0); link('corrN', 'svc0');
  N('svc1', 121.0, 14.85, 11.0); link('svc0', 'svc1', 'stairs');
  N('svc2', 117.2, Y.costume, 11.0); link('svc1', 'svc2', 'stairs');
  N('svc3', 121.0, Y.workshop, 11.0); link('svc2', 'svc3', 'stairs');
  const cos = nav.walkway('cos', 118, 136, Y.costume, 2.0, 3.6); link('svc2', cos[0]);
  const wk = nav.walkway('wk', 120, 136, Y.workshop, 2.0, 3.2); link('svc3', wk[0]);
  N('extrasTop', 119.4, Y.back, 2.5); link('corr', 'extrasTop');
  N('extras0', 122.8, Y.extras, 2.5); link('extrasTop', 'extras0', 'stairs');
  const ex = nav.walkway('extras', 124, 137, Y.extras, 4.5, 3.25); link('extras0', ex[0]);
  N('chorusTop', 127.6, Y.extras, 1.0); link('extras0', 'chorusTop');
  N('chorus0', 122.6, Y.chorus, 1.0); link('chorusTop', 'chorus0', 'stairs');
  const ch = nav.walkway('chorus', 124, 137, Y.chorus, 2.6, 3.25); link('chorus0', ch[0]);
  link('liftBot', 'chorus0'); link('cisternEdge', 'chorus0');
  // Administration and the courtyard: up two steps from the chorus hall.
  N('admin0', 140.4, Y.court, 1.2); link(ch[ch.length - 1], 'admin0', 'stairs');
  const ad = nav.walkway('adm', 141, 154, Y.court, 1.4, 3.25); link('admin0', ad[0]);
  N('stageDoor', 155.6, Y.court, 1.6); link(ad[ad.length - 1], 'stageDoor', 'door');
  const yard = nav.walkway('yard', 157, 167, Y.court, 2.4, 2.5); link('stageDoor', yard[0]);
  N('gate', 170, Y.court, 1.8); link(yard[yard.length - 1], 'gate'); link('gate', 'homeR');
  N('yardDeep', 163, Y.court, 9); link(yard[2], 'yardDeep');
  // Admin floors via the stair tower.
  const F = [Y.court, 7.6, 13.2, 18.8, 24.4];
  let ap = N('aSt0', 151, Y.court, 17.6); link(ad[3], ap);
  const floors = [ad];
  for (let i = 1; i < F.length; i++) {
    const n = N('aSt' + i, i % 2 ? 149.2 : 153.4, F[i], 17.6);
    link(ap, n, 'stairs'); ap = n;
    const row = nav.walkway('a' + i + '_', 141, 154, F[i], 3.0, 3.25);
    link(n, row[3]);
    floors.push(row);
  }
  return { place, cel, aisle, cor, boxNode, pit, st, lv, gal, fdd, cos, wk, ex, ch, ad, yard, floors };
}

// ------------------------------------------------------------------ hours
// Visibility windows for crowds. h: clock hour, S: showAt(h).
const inHouse = (a, l) => (h) => inH(h, a, l);
const duringAct = (n, pad = 0) => (h) => { const A = ACTS[n - 1]; return h >= A.h0 - pad && h < A.h1 + pad; };

// ------------------------------------------------------------------ the cast
export function people(W, stage) {
  const G = buildNav(W);
  const R = W.R;
  const P = (def) => { const p = W.addPerson(Object.assign({ speed: 1.45 + R() * 0.2 }, def)); return p; };
  const st = (row, i) => G.st[row][i];
  const box = (t, i) => G.boxNode(t, i);
  const act = (n) => [ACTS[n - 1].h0, ACTS[n - 1].h1];
  const SY = (x) => stageY(x);
  // Stage positions for the singers.
  const ON = { c: [97, SY(97), 2.0], l: [93, SY(93), 3.2], r: [101, SY(101), 2.6], back: [104, SY(104), 4.5] };

  // ---------------------------------------------------------------- machinists and stage staff
  P({ name: 'Anselme Guérineau', role: 'brigadier of machinists, stage floor (jardin side)', bio: 'Counts his men aloud like a sergeant, and knows every flat in the tas by its smell of size and canvas.',
    costume: C.shirt({ top: '#d8d0bc', beard: '#5a4a3a', hair: '#5a4a3a' }), routine: [
      { at: 'gate', act: 'walk', dur: M(2), label: 'Arriving at the stage door with his men', when: [16.3, 16.6] },
      { at: G.st.d[3], act: 'point', face: 1, dur: M(20), label: 'Checking the flats in the tas', when: [16.6, 19.3] },
      { at: G.st.w[1], act: 'handsBehind', face: 1, dur: M(8), label: 'Calling the changes from the wings', when: [19.3, 23.9] },
      { at: G.yard[1], act: 'stand', prop: 'pipe', face: 'out', dur: M(6), label: 'A pipe in the courtyard in the interval', when: [20.67, 20.9] },
      { at: G.st.d[5], act: 'point', face: -1, dur: M(15), label: 'Striking the set after the final curtain', when: [23.9, 0.6] },
      { at: G.st.m[4], act: 'point', face: 1, dur: M(20), label: 'Setting the rehearsal platform', when: [11.5, 16.3] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.6, 11.5] },
    ] });
  P({ name: 'Prosper Delhomme', role: 'machinist, first understage', bio: 'Hums the Faust waltz out of tune while he pushes the chariots.',
    costume: C.shirt({ top: '#c8bca4' }), routine: [
      { at: G.lv[0][3], act: 'push', face: 'in', dur: M(4), label: 'Pushing the chariots on cue', when: [19.4, 23.9] },
      { at: G.lv[0][5], act: 'workBench', face: 'in', dur: M(6), label: 'Oiling the rails', when: [16.5, 23.9] },
      { at: G.lv[0][1], act: 'sit', seat: 0.3, face: 'out', dur: M(10), label: 'Waiting for the next change', when: [19.4, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.2, 16.5] },
    ] });
  P({ name: 'Désiré Malfilâtre', role: 'drum man, third understage', bio: 'Missing two fingers from a rope burn; turns the great drum by feel.',
    costume: C.shirt({ top: '#b8b098', hair: '#8a8a8a', beard: '#9a9a9a' }), routine: [
      { at: [96.5, U[2], 3.6], act: 'crank', face: 'in', dur: M(2), label: 'Turning the great drum', when: [19.4, 23.9] },
      { at: G.lv[2][4], act: 'haul', face: 'in', dur: M(5), label: 'Re-coiling the rope', when: [17, 23.9] },
      { at: G.lv[2][2], act: 'sleepSit', seat: 0.3, face: 'out', dur: M(12), label: 'Dozing between changes', when: [19.4, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.2, 17] },
    ] });
  P({ name: 'Théodule Ravenel', role: 'fly man, second gallery', bio: 'Keeps a sparrow feather in his cap; climbs three hundred steps a night.',
    costume: C.shirt({ top: '#d0c8b4', hatColor: '#4a3a2a' }), routine: [
      { at: G.gal[1][2], act: 'haul', face: 'in', dur: M(3), label: 'Hauling a drop up into the flies', when: [17.5, 23.9] },
      { at: G.gal[1][4], act: 'sitEat', seat: 0.3, face: 'out', prop: null, dur: M(12), label: 'Eating bread on the gallery', when: [17.5, 23.9] },
      { at: G.gal[1][1], act: 'lookout', face: 'out', dur: M(6), label: 'Watching for the brigadier’s signal', when: [19.4, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.2, 17.5] },
    ] });
  P({ name: 'Onésime Carrel', role: 'gril man', bio: 'Afraid of nothing but the cellar.',
    costume: C.shirt({ top: '#bcb4a0' }), routine: [
      { at: G.gal[3][2], act: 'workBench', face: 'in', dur: M(15), label: 'Inspecting the blocks on the first gril', when: [9, 23.5] },
      { at: G.gal[5][1], act: 'point', face: 'in', dur: M(8), label: 'Checking the level of the fire reservoirs', when: [9, 23.5] },
      { at: G.gal[4][2], act: 'haul', face: 'in', dur: M(2), label: 'Signalling down by rope', when: [9, 23.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.5, 9] },
    ] });
  P({ name: 'Bastien Lhuillier', role: 'apprentice machinist, 16', bio: 'Wants to be a scene painter. Old Malfilâtre has told him the story of the Saint Bartholomew bell twice tonight.',
    costume: C.shirt({ top: '#d8ccb0', hair: '#8d5a2b', build: 0.85 }), H: 1.6, routine: [
      { at: G.lv[2][3], act: 'talk', face: 1, dur: M(5), label: 'Hearing the old bell story again (N p.238)', when: [16, 23.9] },
      { at: G.gal[0][5], act: 'lookout', face: 'out', dur: M(6), label: 'Watching the ballet from the flies', when: [22.9, 23.5] },
      { at: G.yard[2], act: 'carry', prop: 'jug', face: 'out', dur: M(4), label: 'Fetching beer for the men', when: [16, 23.9] },
      { at: G.st.w[3], act: 'run', face: 1, dur: M(2), label: 'Running a message to the brigadier', when: [16, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.2, 16] },
    ] });
  P({ name: 'Eugène Fourcade', role: 'lamplighter', bio: 'Smells permanently of gas. Lights nothing until the firemen have made their check (N p.185).',
    costume: C.blouse(), routine: [
      { at: G.st.f[2], act: 'point', prop: 'cane', face: 'in', dur: M(10), label: 'Following the firemen’s check', when: [17.2, 17.6] },
      { at: G.gal[0][3], act: 'point', prop: 'cane', face: 'out', dur: M(20), label: 'Lighting the battens with his pole', when: [17.6, 19.0] },
      { at: G.cor[5][3], act: 'point', prop: 'cane', face: 'in', dur: M(15), label: 'Lighting the jets in the corridors', when: [17.6, 19.0] },
      { at: G.st.w[2], act: 'workBench', face: 'in', dur: M(10), label: 'Trimming jets in the wings', when: [19.0, 0.3] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [0.3, 17.2] },
    ] });
  P({ name: 'Auguste Rondelet', role: 'chief of lighting', bio: 'Can tell the hour by the hiss of the pipes.',
    costume: C.black({ hair: '#7a7a7a', beard: '#8a8a8a' }), routine: [
      { at: 'organ', act: 'read', prop: 'book', face: 'in', dur: M(5), label: 'Reading his cue book', when: [18.3, 19.4] },
      { at: 'niche', act: 'talk', face: 1, dur: M(8), label: 'Calling orders from his niche beside the prompter (N p.220)', when: [19.4, 23.8] },
      { at: 'organ', act: 'point', face: 'in', dur: M(4), label: 'Checking the pressure regulator', when: [18.3, 23.8] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.8, 18.3] },
    ] });
  P({ name: 'Narcisse Pellerin', role: 'jeu d’orgue operator', bio: 'Deaf in one ear from years beside the pit. Brings night to the stage with one turn of the wheel.',
    costume: C.blouse({ top: '#2e4a76' }), routine: [
      { at: 'organ', act: 'wheel', face: 'in', dur: M(6), label: 'At the graduated wheel of the jeu d’orgue', when: [18.0, 23.9] },
      { at: 'mfoyer', act: 'sitDrink', seat: 0.46, face: 'out', dur: M(8), label: 'A glass in the musicians’ foyer', when: [20.67, 20.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.0] },
    ] });
  P({ name: 'Hector Maillefer', role: 'electrician', bio: 'Proud of his burned cuffs. The arc lamp is the newest thing in the house.',
    costume: C.black({ coat: 'jacket', coatColor: '#3a3a42' }), routine: [
      { at: 'arcBridge', act: 'workBench', face: 'in', dur: M(8), label: 'Adjusting the carbons of the arc lamp', when: [18, 23.9] },
      { at: 'arcBridge', act: 'crank', face: 'in', dur: M(5), label: 'Following the singers with the arc light', when: act(5) },
      { at: G.ad[1], act: 'talk', face: 1, dur: M(10), label: 'Checking the batteries with Barthe', when: [17, 18] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 17] },
    ] });
  P({ name: 'Léonce Barthe', role: 'battery laboratory man', bio: 'Eats his lunch as far from the acid vats as the room allows.',
    costume: C.shirt({ top: '#e0dccc', apron: '#7a6a4a', hat: null }), routine: [
      { at: G.ad[0], act: 'pour', face: 'in', dur: M(25), label: 'Pouring acid into the Bunsen cells', when: [9, 18] },
      { at: G.ad[1], act: 'read', face: 'in', dur: M(5), label: 'Reading the galvanometers', when: [9, 23.5] },
      { at: G.ad[2], act: 'sitEat', face: 'out', dur: M(20), label: 'Lunch, far from the acid', when: [12, 13] },
      { at: G.ad[0], act: 'workBench', face: 'in', dur: M(15), label: 'Keeping the cells up for the night', when: [18, 23.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.5, 9] },
    ] });
  P({ name: 'Joseph Kerhervé', role: 'fireman corporal', bio: 'A Breton who writes to his mother in Quimper. Firemen here belong to a military regiment (fr.wikipedia).',
    costume: C.fireman({ hair: '#2a1d14' }), routine: [
      { at: G.st.f[0], act: 'handsBehind', face: 'out', dur: M(10), label: 'Inspecting the hose cabinets', when: [17.0, 19.4] },
      { at: [ST0 + 0.2, SY(ST0 + 0.2), 9.4], act: 'handsBehind', face: -1, dur: M(15), label: 'Standing by the iron curtain', when: [19.4, 23.9] },
      { at: G.gal[4][3], act: 'walk', prop: 'lantern', face: 1, dur: M(4), label: 'Round of the grils with his lantern', when: [0.3, 6] },
      { at: 'water', act: 'lookout', prop: 'lantern', face: 'out', dur: M(4), label: 'Checking the water in the cistern', when: [0.3, 6] },
      { at: G.cel[4], act: 'walk', prop: 'lantern', face: -1, dur: M(4), label: 'Night round of the cellars', when: [0.3, 6] },
      { at: G.ad[4], act: 'sitWrite', face: 'out', dur: M(20), label: 'Writing to his mother in Quimper', when: [6, 17] },
      { at: 'corr', act: 'stand', face: 'out', dur: M(10), label: 'On duty behind the stage', when: [23.9, 0.3] },
    ] });
  P({ name: 'Aristide Coulon', role: 'pyrotechnician', bio: 'His eyebrows have never fully grown back.',
    costume: C.shirt({ top: '#b8a888', apron: '#5a4a3a' }), routine: [
      { at: G.lv[0][4], act: 'workBench', face: 'in', dur: M(20), label: 'Preparing flash charges', when: [18, 23.5] },
      { at: G.lv[0][2], act: 'kneel', face: 'in', dur: M(3), label: 'Firing a flash on cue', when: act(5) },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.5, 18] },
    ] });
  P({ name: 'Félicien Gros', role: 'property mechanic', bio: 'Invents mechanical toys for his nephews. Tonight: Faust’s flaming cup, worked by a spring (N p.189).',
    costume: C.shirt({ top: '#c8c0a8', apron: '#6a5a3a' }), routine: [
      { at: G.st.w[0], act: 'workBench', face: 'in', dur: M(8), label: 'Loading the flaming cup', when: [18.5, 20.1] },
      { at: G.st.w[1], act: 'stand', prop: 'glass', face: 1, dur: M(4), label: 'Handing the cup on in the wings', when: [20.1, 20.4] },
      { at: G.wk[0], act: 'workBench', face: 'in', dur: M(20), label: 'Mending props in the workshop', when: [9, 18.5] },
      { at: G.st.w[2], act: 'scrub', face: 'in', dur: M(8), label: 'Cleaning the cup', when: [20.4, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 9] },
    ] });
  P({ name: 'Pélagie Vasseur', role: 'florist', bio: 'Sells real violets on the boulevard by day; plants paper ones in Marguerite’s garden by night.',
    costume: C.maid({ dressColor: '#5a4a3a', top: '#5a4a3a', apron: '#d8ccb0', hat: 'bonnet', hatColor: '#3a2a1a' }), routine: [
      { at: G.place[4], act: 'stand', prop: 'basket', face: 'out', dur: M(30), label: 'Selling violets on the Place', when: [10, 17.5] },
      { at: G.st.m[4], act: 'kneelPick', face: 'in', dur: M(15), label: 'Planting the artificial flowers of the garden', when: [20.67, 20.92] },
      { at: G.st.w[4], act: 'sitWork', seat: 0.4, face: 'out', dur: M(10), label: 'Repairing petals', when: [17.5, 23.5] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.5, 10] },
    ] });
  // ---------------------------------------------------------------- dressers and the costume floors
  P({ name: 'Ernestine Lebrun', role: 'dresser, chorus women', bio: 'Has dressed three generations of choristers.',
    costume: C.maid({ hair: '#9a9a9a', hat: null }), routine: [
      { at: G.cos[2], act: 'workBench', face: 'in', dur: M(40), label: 'The mise en loge: laying out every costume (N p.185)', when: [13, 17.5] },
      { at: G.floors[3][1], act: 'workBench', face: 'in', dur: M(10), label: 'Hooks and laces for the chorus', when: [17.5, 20.2] },
      { at: G.st.d[2], act: 'sitWork', seat: 0.4, face: 'out', dur: M(10), label: 'Mending in the wings', when: [20.2, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 13] },
    ] });
  P({ name: 'Rose Chauvel', role: 'dresser to the soprano', bio: 'Secretly knows every note of Marguerite.',
    costume: C.maid({ hair: '#4a3020', hat: null }), routine: [
      { at: G.floors[2][4], act: 'workBench', face: 'in', dur: M(15), label: 'Laying out Marguerite’s gown', when: [17, 19.0] },
      { at: G.floors[2][3], act: 'talk', face: 1, dur: M(8), label: 'Lacing the soprano’s corset', when: [18.3, 19.3] },
      { at: G.st.w[2], act: 'stand', face: -1, dur: M(4), label: 'A quick change in the wings', when: [20.6, 21.1] },
      { at: G.floors[2][4], act: 'sitWork', face: 'out', dur: M(10), label: 'Pressing the garden dress', when: [19.3, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 17] },
    ] });
  P({ name: 'Victorine Maupin', role: 'seamstress', bio: 'Saving for a sewing machine.',
    costume: C.maid({ dressColor: '#3a3a4a', top: '#3a3a4a', hat: null, hair: '#6b4428' }), routine: [
      { at: [125.2, Y.workshop, 6.9], act: 'sitWork', face: 'out', dur: M(60), label: 'Sewing by daylight at the window', when: [8, 17] },
      { at: G.st.w[3], act: 'carry', prop: 'box', face: 'out', dur: M(5), label: 'Delivering a costume to the wings', when: [16, 17.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [17.5, 8] },
    ] });
  // ---------------------------------------------------------------- the stage door
  P({ name: 'Isidore Lemercier', role: 'stage-door concierge', bio: 'Knows everyone’s secrets and tells none. Takes the copper tokens of the extras (N p.186).',
    costume: C.black({ coat: 'long', coatColor: '#2a2a32', hat: 'cap', hatColor: '#1e1e22', beard: '#7a7a7a' }), routine: [
      { at: BACK.lodge, act: 'sitWrite', seat: 0.46, face: -1, dur: M(30), label: 'Watching every arrival at the stage door', when: [8, 0.5] },
      { at: G.ad[4], act: 'stand', face: 1, dur: M(10), label: 'Taking tokens from the extras', when: [18.3, 18.8] },
      { at: 'stageDoor', act: 'stand', prop: 'lantern', face: 1, dur: M(10), label: 'Locking up', when: [0.5, 1.2] },
      { at: BACK.lodge, act: 'sleepSit', seat: 0.46, face: -1, dur: M(60), label: 'Asleep in his lodge', when: [1.2, 8] },
    ] });
  P({ name: 'Benoît Ravaud', role: 'caller (avertisseur)', bio: 'The fastest legs in the building: fetches the artists before every entrance (N p.185).',
    costume: C.black({ coat: null, top: '#e8e0d0', bottom: '#2a2a30' }), routine: [
      { at: G.floors[2][2], act: 'talk', face: 'in', dur: M(2), label: 'Calling the principals to the stage', when: [19.2, 23.6] },
      { at: G.floors[3][3], act: 'talk', face: 'in', dur: M(2), label: 'Calling the chorus', when: [19.2, 23.6] },
      { at: G.st.d[4], act: 'stand', face: -1, dur: M(4), label: 'Waiting at the bell', when: [19.2, 23.6] },
      { at: G.ex[2], act: 'talk', face: 'in', dur: M(2), label: 'Calling the extras for the soldiers’ chorus', when: [21.7, 22.0] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.6, 19.2] },
    ] });
  P({ name: 'Polydore Cassagne', role: 'chef de claque', bio: 'Takes envelopes from singers before every debut; his men clap on his signal.',
    costume: C.tails({ hat: 'top', hatColor: '#1a1a1e', coat: 'long', beard: '#3a2a20' }), routine: [
      { at: 'gate', act: 'point', face: -1, dur: M(4), label: 'Leading his men in by the stage door, before the public (N p.185)', when: [18.4, 18.8] },
      { at: [67.2, stallsY(67.2), 0.6], act: 'sit', face: 0, dur: M(10), label: 'Under the chandelier, ready to signal', when: [18.8, 23.9] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.4] },
    ] });
  // ---------------------------------------------------------------- extras, chorus, children
  P({ name: 'Firmin Delorme', role: 'extra (a soldier in Act 4)', bio: 'A cabinetmaker from the Faubourg Saint-Antoine, earning a second wage after his day’s work (N p.186).',
    costume: C.blouse({ top: '#4a6a9a', hat: 'flat' }), routine: [
      { at: 'gate', act: 'walk', dur: M(2), label: 'Arriving in his work blouse', when: [18.2, 18.5] },
      { at: G.ex[1], act: 'sit', seat: 0.45, face: 'out', dur: M(20), label: 'Dressing as a soldier', when: [18.5, 21.9] },
      { at: [102, SY(102), 5.5], act: 'walk', walkAnim: 'walk', face: -1, dur: M(4), label: 'Marching in the soldiers’ chorus', when: act(4) },
      { at: G.ex[3], act: 'sitTalk', face: 'out', dur: M(15), label: 'Changing back into his blouse', when: [22.7, 23.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'Home to the Faubourg', when: [23.5, 18.2] },
    ] });
  P({ name: 'Augustin Pichard', role: 'extras’ squad leader', bio: 'An old soldier who still salutes officers.',
    costume: C.blouse({ top: '#5a5a6a', beard: '#7a6a5a' }), routine: [
      { at: 'stageDoor', act: 'point', face: 1, dur: M(8), label: 'Picking men at the door', when: [17.8, 18.4] },
      { at: G.ex[2], act: 'salute', face: 'out', dur: M(8), label: 'Drilling his squad', when: [18.4, 21.9] },
      { at: [99, SY(99), 6.5], act: 'salute', face: -1, dur: M(4), label: 'Leading them on', when: act(4) },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [22.8, 17.8] },
      { at: G.ex[4], act: 'talk', face: 'out', dur: M(10), label: 'Paying off his men', when: [22.7, 22.8] },
    ] });
  P({ name: 'Henriette Despréaux', role: 'chorister, soprano', bio: 'Wraps her shoulders in a shawl on every stair.',
    costume: C.gown('#c8a888', { apron: '#f2ece0', hat: 'coif', hatColor: '#f2ece0' }), routine: [
      { at: G.floors[3][1], act: 'talk', face: 'out', dur: M(15), label: 'Singing scales in the dressing room', when: [18.2, 20.1] },
      { at: [99, SY(99), 2.4], act: 'dance', face: 'out', dur: M(5), label: 'Singing in the fair scene', when: act(2) },
      { at: G.floors[3][2], act: 'sitTalk', face: 'out', dur: M(15), label: 'Resting her voice', when: [20.7, 23.6] },
      { at: [97, SY(97), 1.5], act: 'talk', face: 'out', dur: M(4), label: 'Rehearsing with the piano (in her own clothes)', when: [12, 15.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.6, 12] },
    ] });
  P({ name: 'Mathurin Gaudry', role: 'chorister, bass', bio: 'The loudest man in the “Gloire immortelle”.',
    costume: { top: '#3a4a7a', bottom: '#5a4a3a', coat: 'jacket', coatColor: '#8a8a90', hat: 'helmet', hatColor: '#9a9aa0', beard: '#3a2a1a' }, routine: [
      { at: G.floors[3][4], act: 'sit', face: 'out', dur: M(20), label: 'Dressing as a soldier', when: [18.4, 21.9] },
      { at: [100, SY(100), 3.4], act: 'talk', face: 'out', dur: M(4), label: 'Singing the soldiers’ chorus', when: act(4) },
      { at: G.floors[3][5], act: 'sitTalk', face: 'out', dur: M(20), label: 'A card game in the dressing room', when: [22.7, 23.7] },
      { at: [96, SY(96), 3.0], act: 'talk', face: 'out', prop: 'cane', dur: M(4), label: 'Rehearsing: a cane for a sword (N p.192)', when: [12, 15.5] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.7, 12] },
    ] });
  P({ name: 'Léon Morand', role: 'chorus child, 10', bio: 'Eats the sugared almonds his grandmother smuggles in.',
    costume: { child: true, top: '#7a5a3a', bottom: '#4a3a2a', hat: 'beret', hatColor: '#3a3a5a' }, routine: [
      { at: G.ex[0], act: 'run', face: 1, dur: M(4), label: 'Playing in the corridor', when: [18.6, 20.1] },
      { at: [95, SY(95), 1.2], act: 'dance', face: 'out', dur: M(5), label: 'Singing in the fair', when: act(2) },
      { at: G.ch[2], act: 'sleepSit', seat: 0.46, face: 'out', dur: M(30), label: 'Asleep on a bench', when: [20.7, 23.8] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'Carried home', when: [23.8, 18.6] },
    ] });
  P({ name: 'Célestine Arnoult', role: 'coryphée', bio: 'Dreams of promotion at the next examination.',
    costume: C.dancer({ hair: '#4a3020' }), routine: [
      { at: 'fddBarre', act: 'stand', face: 'in', dur: M(20), label: 'Warming up at the barre', when: [19.0, 22.8] },
      { at: G.fdd[5], act: 'dance', face: 'out', dur: M(5), label: 'Checking her skirts in the mirror', when: [19.0, 22.8] },
      { at: [104, SY(104), 3.8], act: 'dance', face: 'out', dur: M(4), label: 'Dancing in the Walpurgis ballet', when: [22.917, 23.4] },
      { at: G.fdd[2], act: 'dance', face: 'out', dur: M(30), label: 'Morning class', when: [9, 12] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.4, 9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [12, 19.0] },
    ] });
  P({ name: 'Blanche Rivière', role: 'dancer, second quadrille', bio: 'Sends half her pay to her father in Lyon.',
    costume: C.dancer({ hair: '#c9a160' }), routine: [
      { at: BACK.rosin, act: 'tread', face: 'out', dur: M(2), label: 'Crushing rosin under her shoe (N p.182)', when: [19.0, 22.8] },
      { at: G.fdd[3], act: 'stand', face: 'out', dur: M(4), label: 'Whitening her arms with rice powder', when: [19.0, 22.8] },
      { at: [107, SY(107), 3.0], act: 'dance', face: 'out', dur: M(4), label: 'Dancing in the ballet', when: [22.917, 23.4] },
      { at: G.fdd[1], act: 'dance', face: 'out', dur: M(30), label: 'Morning class', when: [9, 12] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.4, 9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [12, 19.0] },
    ] });
  P({ name: 'Alphonsine Picard', role: 'dance pupil (a “rat”), 11', bio: 'Practises pirouettes on every landing.',
    costume: C.dancer({ child: true, hair: '#6b4428' }), routine: [
      { at: G.fdd[1], act: 'dance', face: 'out', dur: M(30), label: 'Class in the Foyer de la Danse', when: [9, 12] },
      { at: G.cos[3], act: 'run', face: 1, dur: M(8), label: 'Running errands for the older dancers', when: [18.5, 22.9] },
      { at: G.st.d[1], act: 'lookout', face: -1, dur: M(8), label: 'Watching from the wings', when: [22.9, 23.6] },
      { at: G.fdd[6], act: 'dance', face: 'out', dur: M(5), label: 'A pirouette on the raked floor', when: [18.5, 22.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.6, 9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [12, 18.5] },
    ] });
  P({ name: 'Hortense Picard', role: 'Alphonsine’s mother', bio: 'A laundress who calls every subscriber “Monsieur le Comte”. Mothers attend their daughters by right (N p.182).',
    costume: C.mother(), routine: [
      { at: 'fddBench', act: 'sitWork', face: 'out', prop: 'basket', dur: M(30), label: 'Knitting on the banquette, basket at her feet', when: [9, 12] },
      { at: 'fddBench', act: 'sitWork', face: 'out', dur: M(30), label: 'Knitting and watching the subscribers', when: [18.5, 23.6] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.6, 9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At the wash-house', when: [12, 18.5] },
    ] });
  P({ name: 'Zélie Fontanel', role: 'soloist in the Walpurgis ballet', bio: 'Superstitious: always enters left foot first. A small battery in her headdress makes a star twinkle on her forehead (N p.232).',
    costume: C.dancer({ dressColor: '#f8f0f8', hair: '#2b1d14' }), routine: [
      { at: BACK.dress[2], act: 'sitWork', face: 'out', dur: M(15), label: 'Darning new shoes with white cotton', when: [18.5, 20.7] },
      { at: 'fddBarre', act: 'stand', face: 'in', dur: M(20), label: 'Barre in the Foyer de la Danse', when: [20.7, 22.85] },
      { at: [100, SY(100), 1.6], act: 'dance', face: 'out', dur: M(3), label: 'Dancing her solo, the star on her brow', when: [22.917, 23.35] },
      { at: G.fdd[4], act: 'talk', face: 'out', dur: M(8), label: 'Receiving visitors between acts', when: [21.75, 22.0] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.35, 18.5] },
    ] });
  P({ name: 'Valère Dorcy', role: 'tenor: Faust', bio: 'Eats a raw egg before Act 3. Keeps a light scarf on until his entrance (N p.188).',
    costume: { top: '#6a1e2a', bottom: '#2a1a1a', coat: 'long', coatColor: '#3a1a22', hat: 'beret', hatColor: '#2a1a1a', beard: '#4a3020', hair: '#4a3020' }, routine: [
      { at: 'stageDoor', act: 'walk', dur: M(2), label: 'Arriving early with his valet', when: [18.0, 18.3] },
      { at: BACK.dress[0], act: 'talk', face: 'out', dur: M(10), label: 'Vocalising in his dressing room', when: [18.3, 19.45] },
      { at: ON.l, act: 'talk', face: 'out', dur: M(5), label: 'Singing Faust', when: act(1) },
      { at: BACK.dress[0], act: 'sitDrink', face: 'out', dur: M(8), label: 'Resting in his room', when: [19.92, 20.15] },
      { at: ON.r, act: 'talk', face: 'out', dur: M(5), label: 'Singing Faust', when: act(2) },
      { at: BACK.dress[0], act: 'sitDrink', face: 'out', dur: M(8), label: 'A raw egg before Act 3', when: [20.67, 20.9] },
      { at: ON.c, act: 'talk', face: 'out', dur: M(5), label: 'The garden scene', when: act(3) },
      { at: ON.l, act: 'point', face: 1, dur: M(5), label: 'The duel', when: act(4) },
      { at: ON.back, act: 'talk', face: 'out', dur: M(5), label: 'Walpurgis Night and the prison', when: [23.35, 23.75] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.0] },
    ] });
  P({ name: 'Léontine Aubriot', role: 'soprano: Marguerite', bio: 'Keeps a portrait of her late teacher on her mirror.',
    costume: C.gown('#e6e0f0', { hairStyle: 'long', hair: '#d8b878', sleeves: 'long' }), routine: [
      { at: 'stageDoor', act: 'walk', dur: M(2), label: 'Arriving with her maid', when: [17.8, 18.1] },
      { at: BACK.dress[1], act: 'sit', face: 'out', dur: M(15), label: 'Dressing and “making her face” (N p.188)', when: [18.1, 20.3] },
      { at: ON.c, act: 'talk', face: 'out', dur: M(5), label: 'Marguerite meets Faust', when: [20.4, 20.667] },
      { at: ON.r, act: 'talk', face: 'out', dur: M(5), label: 'The Jewel Song', when: act(3) },
      { at: BACK.dress[1], act: 'sitRead', face: 'out', dur: M(8), label: 'Resting between acts', when: [21.75, 22.05] },
      { at: ON.c, act: 'pray', face: 'out', dur: M(5), label: 'The church scene', when: act(4) },
      { at: ON.c, act: 'kneel', face: 'out', dur: M(5), label: 'The prison and the apotheosis', when: [23.35, 23.75] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 17.8] },
    ] });
  P({ name: 'Barthélemy Saulnier', role: 'bass: Méphistophélès', bio: 'Collects old engravings of devils. Rises through the trap in Act 1.',
    costume: { top: '#a81a1a', bottom: '#8a1414', coat: 'long', coatColor: '#a01818', hat: 'beret', hatColor: '#8a1414', beard: '#1a1210', hair: '#1a1210', skin: '#d8907a' }, routine: [
      { at: BACK.dress[2], act: 'sit', face: 'out', dur: M(20), label: 'Red make-up', when: [18.4, 19.5] },
      { at: 'trapBot', act: 'stand', face: 'out', dur: M(4), label: 'Waiting under the trap', when: [19.5, 19.62] },
      { at: 'trapTop', act: 'point', face: 'out', dur: M(4), label: '“Me voici!”: rising from the trap', when: [19.62, 19.7] },
      { at: ON.c, act: 'talk', face: 'out', dur: M(5), label: 'Singing Méphistophélès', when: [19.7, 19.92] },
      { at: ON.back, act: 'talk', face: 'out', dur: M(5), label: 'The Song of the Golden Calf', when: act(2) },
      { at: ON.l, act: 'point', face: 1, dur: M(5), label: 'In the garden', when: act(3) },
      { at: ON.back, act: 'talk', face: 'out', dur: M(5), label: 'The serenade', when: act(4) },
      { at: ON.l, act: 'wave', face: 'out', dur: M(5), label: 'Walpurgis Night', when: act(5) },
      { at: BACK.dress[2], act: 'sitRead', face: 'out', dur: M(5), label: 'Between acts', when: [19.92, 23.9] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.4] },
    ] });
  P({ name: 'Théophraste Guyon', role: 'prompter (souffleur)', bio: 'Has not seen an opera from the front for twenty years.',
    costume: C.black({ hair: '#9a9a9a' }), routine: [
      { at: 'prompt', act: 'read', prop: 'book', face: 1, dur: M(6), label: 'Whispering the cues from his hood', when: [19.4, 23.8] },
      { at: 'mezz', act: 'stand', face: 'out', dur: M(5), label: 'Stretching his back in the interval', when: [19.92, 20.1] },
      { at: 'mezz', act: 'stand', face: 'out', dur: M(5), label: 'Stretching his back in the interval', when: [21.75, 21.95] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.8, 19.4] },
    ] });
  P({ name: 'Ernest Moutier', role: 'stage manager (régisseur)', bio: 'Carries three pocket watches, all set to different times.',
    costume: C.black({ coat: 'tail', beard: '#4a3a2a' }), routine: [
      { at: G.floors[4][2], act: 'sitWrite', face: 'out', dur: M(15), label: 'Checking absences (N p.182)', when: [17.5, 19.2] },
      { at: G.st.w[0], act: 'point', face: 1, dur: M(2), label: 'Ringing the stage bell', when: [19.2, 19.5] },
      { at: G.st.w[0], act: 'handsBehind', face: 1, dur: M(6), label: 'Watching the cues from the wings', when: [19.5, 23.9] },
      { at: G.st.f[3], act: 'point', face: 'out', dur: M(20), label: 'Directing the day’s rehearsal', when: [12, 16] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 12] },
      { at: G.floors[4][1], act: 'sitWrite', face: 'out', dur: M(30), label: 'At his desk', when: [16, 17.5] },
    ] });
  // ---------------------------------------------------------------- the orchestra
  P({ name: 'Désiré Pommier', role: 'bassoonist', bio: 'Teaches the bassoon to the baker’s son by day. Musicians toss their cigarettes in the courtyard before going in (N p.188).',
    costume: C.tails({ hat: 'bowler', hatColor: '#1a1a1e' }), routine: [
      { at: BACK.butts, act: 'stand', prop: 'pipe', face: 'out', dur: M(4), label: 'A last cigarette in the courtyard', when: [18.7, 19.0] },
      { at: 'mfoyer', act: 'stand', face: 'out', dur: M(5), label: 'Putting on his white cravat', when: [19.0, 19.25] },
      { at: [83.0, Y.pit, 5.2], act: 'sit', face: 0, dur: M(10), label: 'Playing the bassoon', when: [19.25, 23.85] },
      { at: 'homeR', act: 'stand', dur: M(30), label: 'At home', when: [23.85, 18.7] },
    ] });
  P({ name: 'Fulbert Chassaigne', role: 'organist', bio: 'Watches the conductor in a mirror. The organ stands in the stage boxes on the far (east) side, cut away in this drawing (N p.237).',
    costume: C.tails(), routine: [
      { at: G.cor[2][G.cor[2].length - 1], act: 'stand', face: 1, dur: M(10), label: 'Waiting for the church scene', when: [19.0, 22.1] },
      { at: G.cor[2][G.cor[2].length - 1], act: 'sitRead', face: 'out', dur: M(10), label: 'Playing the church scene (the organ is on the far side, cut away)', when: [22.1, 22.4] },
      { at: G.cor[2][G.cor[2].length - 2], act: 'stand', face: 'out', dur: M(10), label: 'Done for the night', when: [22.4, 23.9] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 19.0] },
    ] });
  P({ name: 'Pierrot Badel', role: 'organ bellows man', bio: 'Pumps in time with the music, against orders. The bellows are weighted with 1,000 kg of iron (N p.237).',
    costume: C.shirt({ top: '#e0d8c4' }), routine: [
      { at: G.cor[2][G.cor[2].length - 1], act: 'sit', face: 'out', dur: M(20), label: 'Resting for two acts', when: [19.0, 22.05] },
      { at: G.cor[2][G.cor[2].length - 1], act: 'tread', face: 1, dur: M(5), label: 'Pumping the organ bellows', when: [22.05, 22.4] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [22.4, 19.0] },
    ] });
  // ---------------------------------------------------------------- front of house
  P({ name: 'Euphrasie Collard', role: 'box opener (ouvreuse), premières loges', bio: 'Knows which count is in which box, and with whom.',
    costume: C.maid({ hat: null }), routine: [
      { at: G.cor[1][2], act: 'stand', prop: 'cane', face: 'out', dur: M(4), label: 'Opening boxes', when: [18.9, 19.6] },
      { at: G.cor[1][5], act: 'carry', prop: 'box', face: 'out', dur: M(3), label: 'Fetching a footstool', when: [18.9, 23.9] },
      { at: G.cor[1][3], act: 'talk', face: 'out', dur: M(10), label: 'Gossiping in the corridor', when: [19.6, 23.9] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.9] },
    ] });
  P({ name: 'Séverin Lagarde', role: 'ticket checker at the contrôle', bio: 'Counts the ladies who faint per season. The counters are nicknamed “salt boxes” for the smelling salts (fr.wikipedia).',
    costume: C.black({ coat: 'tail' }), routine: [
      { at: 'ctrlSalt', act: 'stand', face: -1, dur: M(15), label: 'Checking tickets', when: [18.95, 19.7] },
      { at: 'ctrl', act: 'pour', face: 'out', dur: M(2), label: 'Smelling salts for a fainting lady', when: [19.2, 19.4] },
      { at: 'ctrlSalt', act: 'handsBehind', face: -1, dur: M(20), label: 'At the counter', when: [19.7, 23.9] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 18.95] },
    ] });
  P({ name: 'Gaspard Roumieux', role: 'usher at the dance-foyer passage', bio: 'Says “Monsieur” a thousand times a night, and admits only subscribers with three nights a week.',
    costume: C.black({ coat: 'tail', hair: '#7a7a7a' }), routine: [
      { at: 'fddDoor', act: 'handsBehind', face: -1, dur: M(15), label: 'Checking subscribers’ faces', when: [19.0, 23.9] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.9, 19.0] },
    ] });
  P({ name: 'Amaury de Brévannes', role: 'subscriber, three nights a week', bio: 'Dines late and misses the first act, like the gentlemen of the Jockey Club. Brings sugared violets for a coryphée.',
    costume: C.tails({ hat: 'top', hatColor: '#141414', beard: '#6a4a2a', hair: '#6a4a2a' }), routine: [
      { at: 'subsIn', act: 'stand', dur: M(30), label: 'Still at dinner', when: [16, 19.8] },
      { at: box(1, 3), act: 'sit', face: 0.2, dur: M(10), label: 'In his box', when: [19.8, 20.667] },
      { at: G.fdd[4], act: 'talk', face: 'out', dur: M(8), label: 'Visiting the Foyer de la Danse (N p.173)', when: [20.667, 20.9] },
      { at: box(1, 3), act: 'sit', face: 0.2, dur: M(10), label: 'In his box', when: [20.9, 21.75] },
      { at: G.fdd[3], act: 'talk', face: 'out', dur: M(8), label: 'Sugared violets for Célestine', when: [21.75, 22.0] },
      { at: box(1, 3), act: 'sit', face: 0.2, dur: M(10), label: 'In his box for the ballet', when: [22.0, 23.8] },
      { at: 'subsIn', act: 'stand', dur: M(30), label: 'Gone to his club', when: [23.8, 16] },
    ] });
  P({ name: 'Mathilde Cordier', role: 'a banker’s wife, deuxièmes loges', bio: 'Has her daughter sit facing the subscribers’ boxes.',
    costume: C.gown('#4a2a6a', { hair: '#6b4428' }), routine: [
      { at: 'perron1', act: 'walk', dur: M(2), label: 'Arriving by carriage', when: [18.9, 19.1] },
      { at: box(2, 5), act: 'sit', face: 0.3, dur: M(10), label: 'Studying the house through her opera glasses', when: [19.1, 23.8] },
      { at: 'foyer1', act: 'talk', face: 'out', dur: M(10), label: 'Promenading in the Grand Foyer', when: [20.667, 20.9] },
      { at: 'foyer2', act: 'talk', face: 'out', dur: M(10), label: 'Promenading in the Grand Foyer', when: [21.75, 21.98] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.8, 18.9] },
    ] });
  P({ name: 'Étienne Mauduit', role: 'Conservatoire student, cinquièmes loges', bio: 'Sleeps on a straw mattress in the Latin Quarter; follows the score by gaslight from the nearly blind seats.',
    costume: { top: '#e8e0d0', bottom: '#3a3a3a', coat: 'jacket', coatColor: '#3a3a40', hair: '#2b1d14' }, routine: [
      { at: 'perron1', act: 'walk', dur: M(2), label: 'Climbing the stairs to the top', when: [18.9, 19.1] },
      { at: box(5, 2), act: 'sitRead', prop: 'book', face: 0.3, dur: M(10), label: 'Following the score', when: [19.1, 23.85] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'Home to the Latin Quarter', when: [23.85, 18.9] },
    ] });
  P({ name: 'Arsène Guilbert', role: 'pit regular', bio: 'A glover who has seen Faust 61 times. Ties his handkerchief to the bench to keep his seat (Baedeker 1878).',
    costume: { top: '#e8e0d0', bottom: '#3a3a40', coat: 'long', coatColor: '#4a4038', hat: 'bowler', hatColor: '#2a2420' }, routine: [
      { at: 'queue', act: 'stand', face: 1, dur: M(20), label: 'Queueing an hour before the doors', when: [17.9, 19.0] },
      { at: [69.0, stallsY(69.0), 1.2], act: 'sit', face: 0, dur: M(10), label: 'On his bench under the chandelier', when: [19.0, 23.85] },
      { at: G.place[6], act: 'stand', prop: 'pipe', face: 'out', dur: M(6), label: 'A smoke on the Place in the interval', when: [21.75, 21.95] },
      { at: 'homeL', act: 'stand', dur: M(30), label: 'At home', when: [23.85, 17.9] },
    ] });
  P({ name: 'Baptiste Ollivier', role: 'footman', bio: 'Reads penny novels under the Rotonde lamps while his master is in the box.',
    costume: C.tails({ coat: 'tail', coatColor: '#3a2a4a', bottom: '#d8ccb0', hat: 'top', hatColor: '#1a1a1e', stockings: '#f0ece0' }), routine: [
      { at: SEATS.rotonde[2], act: 'sitRead', prop: 'book', face: 'out', dur: M(30), label: 'Reading a penny novel on the bench', when: [19.8, 23.6] },
      { at: 'subsIn', act: 'walk', dur: M(6), label: 'Fetching the carriage', when: [23.6, 23.9] },
      { at: 'subsIn', act: 'stand', dur: M(30), label: 'With the carriage', when: [23.9, 19.8] },
    ] });
  P({ name: 'Quentin Rabier', role: 'stoker', bio: 'Has never once seen the stage.',
    costume: { top: '#6a645a', bottom: '#3a3632', sleeves: 'short', hat: 'cap', hatColor: '#2a2622', skin: '#c8a888' }, routine: [
      { at: FRONT.stoke, act: 'shovel', prop: 'shovel', face: 'in', dur: M(30), label: 'Feeding the calorifère', when: [5, 23] },
      { at: [14.5, Y.cellar, 4.6], act: 'shovel', prop: 'shovel', face: 'in', dur: M(20), label: 'Raking the fires', when: [5, 23] },
      { at: [8, Y.cellar, 12], act: 'lie', face: 0, dur: M(40), label: 'Asleep on the coal sacks', when: [23, 5] },
    ] });

  // ---------------------------------------------------------------- crowds (extras)
  const crowd = (pos, def, vis) => {
    const out = W.crowd(pos, def);
    for (const p of out) { p.vis = vis; p.speed = 1.5; }
    return out;
  };
  const RNG = R;
  const lady = (i) => C.gown(GOWNS[(i * 7) % GOWNS.length], { hair: ['#2b1d14', '#6b4428', '#b07a3c', '#4a3020', '#c9a160'][i % 5] });
  const gent = (i) => C.tails({ beard: i % 3 === 0 ? ['#3a2a1a', '#6a4a2a', '#8a8a8a'][i % 3] : null, hair: ['#2b1d14', '#4a3020', '#9a9a9a', '#6b4428'][i % 4] });
  // Show-time visibility with an arrival hour and a chance of promenading in the intervals.
  const audience = (early, late, promen) => {
    const a = early + RNG() * (late - early), l = 23.78 + RNG() * 0.15, walk = RNG() < promen;
    return (h, S) => inH(h, a, l) && !(walk && S.phase === 'interval');
  };
  // The boxes: subscribers and their guests, ladies in front (bare shoulders, long gloves, fans).
  SEATS.boxes.forEach((list, t) => {
    list.forEach((s, i) => {
      const front = i % 3 !== 2;
      if (RNG() < (t === 5 ? 0.6 : front ? 0.38 : 0.85)) return;
      const isLady = front && (t < 5) && RNG() < 0.7;
      const face = Math.atan2(3 - s[2], 90 - s[0]);
      const def = { at: [s[0], s[1], s[2]], act: isLady ? (RNG() < 0.3 ? 'sitTalk' : 'sit') : (front ? 'sit' : 'stand'), face, costume: isLady ? lady(i + t) : t >= 4 ? { top: '#e8e0d0', bottom: '#3a3a40', coat: 'jacket', coatColor: ['#3a3a40', '#4a4038', '#2a3040'][i % 3] } : gent(i + t) };
      if (!front && def.act === 'stand') def.at = [s[0], s[1], s[2]];
      // Jockey Club subscribers in the premieres loges come after the first act.
      const jockey = t === 1 && !isLady && RNG() < 0.5;
      const P1 = W.addPerson(def);
      P1.vis = audience(jockey ? 19.85 : 18.95, jockey ? 20.1 : 19.6, 0.35);
    });
  });
  // Orchestra stalls: gentlemen only, evening dress obligatory (Baedeker 1884).
  const stalls = SEATS.stalls.filter((_, i) => i % 2 === 0 || i < 10).slice(0, 28);
  stalls.forEach((s, i) => { const p = W.addPerson({ at: s, act: i % 5 === 0 ? 'sitTalk' : 'sit', face: 0, costume: gent(i + 3) }); p.vis = audience(19.0, 19.55, 0.4); });
  // The pit: the claque in shabby black, shopkeepers, students, a few women ("seldom seen in the parterre, except at the Opera", Baedeker 1878).
  SEATS.parterre.filter((_, i) => i % 2 === 0).slice(0, 22).forEach((s, i) => {
    const claque = s[0] > 64 && s[0] < 70 && i % 3 !== 1;
    const woman = !claque && i % 6 === 2;
    const p = W.addPerson({ at: s, act: i % 4 === 0 ? 'sitTalk' : 'sit', face: 0, costume: woman ? C.gown('#3a3a4a', { sleeves: 'long' }) : claque ? { top: '#d8d0c0', bottom: '#2a2a2e', coat: 'long', coatColor: '#2e2c2a' } : { top: '#e8e0d0', bottom: '#4a4038', coat: 'jacket', coatColor: ['#4a4038', '#3a3a40', '#5a4a3a'][i % 3] } });
    p.vis = audience(claque ? 18.8 : 19.0, 19.5, 0.3);
    if (claque) p.tags = ['claque'];
  });
  // Amphitheatre: "the prince's eye", where scenery is painted to be seen from.
  SEATS.amph.filter((_, i) => i % 2 === 0).slice(0, 14).forEach((s, i) => { const p = W.addPerson({ at: [s[0], s[1], s[2]], act: 'sit', face: 0, costume: i % 3 ? gent(i) : lady(i + 2) }); p.vis = audience(19.0, 19.6, 0.3); });
  // The orchestra: town clothes changed for a white cravat (N p.188).
  SEATS.pit.filter((_, i) => i % 2 === 0).slice(0, 18).forEach((s, i) => {
    const p = W.addPerson({ at: s, act: i % 4 === 0 ? 'violin' : 'sit', face: 0, prop: i % 4 === 0 ? 'violin' : null, costume: C.tails({ hair: ['#2b1d14', '#9a9a9a', '#4a3020'][i % 3], beard: i % 4 === 1 ? '#5a4a3a' : null }) });
    p.vis = (h) => inH(h, 19.2, 23.85);
  });
  const cond = W.addPerson({ name: null, at: [85.3, Y.pit, 0.5], act: 'point', face: 0, costume: C.tails({ beard: '#7a7a7a', hair: '#8a8a8a' }) });
  cond.vis = (h) => inH(h, 19.4, 23.8);
  cond.label = 'The conductor beats time facing the stage';
  // Promenaders: the Grand Foyer, the avant-foyer, the loggia and the staircase balconies in the intervals.
  const promVis = (h, S) => S.phase === 'interval' || S.phase === 'doors' || inH(h, 23.75, 0.1);
  const promPts = [];
  for (let i = 0; i < 9; i++) promPts.push([11 + (i % 3) * 3.4, Y.foyer, 2 + Math.floor(i / 3) * 6.5 + (i % 2)]);
  for (let i = 0; i < 4; i++) promPts.push([23 + i * 1.7, Y.foyer, 2.5 + (i % 2) * 3]);
  for (let i = 0; i < 6; i++) promPts.push([31 + i * 3.2, 18.5 + (i % 3) * 3.5, 11.6]);
  for (let i = 0; i < 4; i++) promPts.push([33 + i * 4, Y.loggia, 12.6]);
  for (let i = 0; i < 3; i++) promPts.push([45 + i * 1.5, 8.0, 1.5 + i * 2.5]);
  promPts.forEach((s, i) => {
    const lean = s[2] > 11 && s[1] > 15;
    const p = W.addPerson({ at: s, act: lean ? 'lookout' : i % 3 ? 'talk' : 'stand', face: lean ? 'out' : i % 2 ? 1 : -1, costume: i % 2 ? lady(i) : gent(i) });
    p.vis = promVis;
  });
  // A few promenaders who stroll the length of the Grand Foyer.
  for (let i = 0; i < 5; i++) {
    const p = W.addPerson({ costume: i % 2 ? lady(i + 5) : gent(i + 5), speed: 0.9, routine: [
      { at: 'foyer', act: 'talk', face: 'out', dur: [M(1), M(3)] }, { at: 'foyer2', act: 'stand', face: 'out', dur: [M(1), M(3)] }, { at: 'foyer3', act: 'talk', face: 'out', dur: M(2) }, { at: 'foyer1', act: 'stand', face: 'out', dur: M(1) },
    ] });
    p.vis = promVis;
  }
  // Footmen and coachmen waiting under the house, on the Rotonde benches (N p.75 to 77).
  SEATS.rotonde.slice(0, 7).forEach((s, i) => {
    if (i === 2) return;
    const p = W.addPerson({ at: [s[0], s[1], s[2]], act: ['sleepSit', 'sitTalk', 'sitRead', 'sit'][i % 4], seat: 0.55, face: 'out', costume: C.tails({ coat: 'tail', coatColor: ['#3a2a4a', '#2a3a2a', '#5a2a2a'][i % 3], bottom: '#d8ccb0', hat: i % 2 ? 'top' : null, hatColor: '#1a1a1e' }) });
    p.vis = (h) => inH(h, 19.4, 23.95);
  });
  // The fair in Act 2: villagers, students and burghers dancing the waltz.
  const fair = [];
  for (let i = 0; i < 16; i++) fair.push([92 + (i % 8) * 1.9, SY(92 + (i % 8) * 1.9), 1.6 + Math.floor(i / 8) * 2.6 + (i % 2) * 0.6]);
  fair.forEach((s, i) => {
    const w = i % 2 === 1;
    const p = W.addPerson({ at: s, act: i % 5 === 4 ? 'talk' : 'dance', face: 'out', costume: w ? C.gown(['#c84a3a', '#3a6a9a', '#d8b860', '#5a8a4a'][i % 4], { apron: '#f2ece0', hat: 'coif', hatColor: '#f2ece0', sleeves: 'short' }) : { top: ['#7a3a2a', '#3a4a7a', '#5a6a3a'][i % 3], bottom: '#d8c8a8', stockings: '#c8b890', hat: i % 4 ? 'tam' : 'beret', hatColor: '#3a2a2a', coat: 'jacket', coatColor: ['#6a2a2a', '#2a3a6a'][i % 2] } });
    p.vis = duringAct(2);
  });
  // The soldiers' chorus in Act 4: extras and chorus in helmets and breastplates.
  for (let i = 0; i < 12; i++) {
    const x = 94 + (i % 6) * 2.2, z = 2.2 + Math.floor(i / 6) * 3.0;
    const p = W.addPerson({ at: [x, SY(x), z], act: i % 3 === 0 ? 'salute' : 'stand', face: 'out', prop: i % 2 ? 'flag' : null, costume: { top: '#3a4a7a', bottom: '#4a3a2a', coat: 'jacket', coatColor: '#8a8a92', hat: 'helmet', hatColor: '#9a9aa0', beard: i % 3 === 1 ? '#4a3a2a' : null } });
    p.vis = (h) => h >= 22.15 && h < 22.5;
  }
  // The Walpurgis Night ballet: knee-to-calf tulle skirts, pointe shoes darned with white cotton (N p.182).
  for (let i = 0; i < 12; i++) {
    const x = 92.5 + (i % 6) * 2.4, z = 3.6 + Math.floor(i / 6) * 2.8;
    const p = W.addPerson({ at: [x, SY(x), z], act: 'dance', face: 'out', costume: C.dancer({ dressColor: i % 2 ? '#e8e0f0' : '#f6f2ec', hair: ['#2b1d14', '#6b4428', '#c9a160'][i % 3] }) });
    p.vis = (h) => h >= 22.917 && h < 23.35;
  }
  // Dancers warming up in the Foyer de la Danse (in used shoes and canvas gaiters, N p.182), and a morning class.
  for (let i = 0; i < 9; i++) {
    const x = 124 + i * 1.5;
    const p = W.addPerson({ at: [x, fdY(x), i % 2 ? 11.0 : 5.0], act: i % 3 === 0 ? 'dance' : 'stand', face: i % 2 ? 'in' : 'out', costume: C.dancer({ hair: ['#2b1d14', '#6b4428', '#c9a160', '#4a3020'][i % 4], stockings: '#d8ccb0' }) });
    p.vis = (h) => inH(h, 19.1, 22.85) || inH(h, 9, 12);
  }
  for (let i = 0; i < 4; i++) {
    const x = 125 + i * 3.1;
    const p = W.addPerson({ at: [x + 0.4, fdY(x), 9.0], act: i % 2 ? 'sitWork' : 'sitTalk', seat: 0.45, face: 'out', costume: C.mother({ dressColor: ['#2a2a30', '#3a2a2a', '#2a3030'][i % 3] }) });
    p.vis = (h) => inH(h, 18.6, 23.5) || inH(h, 9, 12);
  }
  const master = W.addPerson({ at: [131, fdY(131), 2.0], act: 'point', face: 1, costume: C.black({ coat: 'tail', hair: '#9a9a9a' }) });
  master.vis = (h) => inH(h, 9, 12); master.label = 'A dance class (dossier: classes by day)';
  // Extras dressing as soldiers (190 places, N p.191).
  for (let i = 0; i < 8; i++) {
    const x = 123.5 + i * 1.8;
    const p = W.addPerson({ at: [x, Y.extras, i % 2 ? 10.5 : 7.0], act: i % 3 === 0 ? 'sit' : 'stand', seat: 0.45, face: 'out', costume: i % 2 ? C.blouse({ hat: null }) : { top: '#3a4a7a', bottom: '#4a3a2a', coat: 'jacket', coatColor: '#8a8a92' } });
    p.vis = (h) => inH(h, 18.3, 22.1) || inH(h, 22.6, 23.2);
  }
  // Machinists at their posts in the wings, the flies and below.
  const mach = [[G.st.d[0], 'haul'], [G.st.d[6], 'push'], [G.st.w[5], 'stand'], [G.gal[0][1], 'haul'], [G.gal[0][3], 'haul'], [G.gal[2][2], 'haul'], [G.lv[0][6], 'push'], [G.lv[1][3], 'push'], [G.lv[3][4], 'crank'], [G.lv[2][5], 'haul'], [G.gal[3][4], 'workBench'], [G.st.d[3], 'carryShoulder']];
  mach.forEach(([n, a], i) => {
    const nd = W.nav.get(n);
    const p = W.addPerson({ at: [nd.x + 0.4, nd.y, nd.z + 0.3], act: a, prop: a === 'carryShoulder' ? 'plank' : null, face: i % 2 ? 'in' : 'out', costume: C.shirt({ top: ['#d8d0bc', '#c8bca4', '#b8b098'][i % 3] }) });
    p.vis = (h) => inH(h, 16.5, 0.3) || (i < 5 && inH(h, 11, 16.5));
  });
  // The day's rehearsal with piano on a platform, no costumes (N p.192): canes and umbrellas for swords.
  for (let i = 0; i < 8; i++) {
    const x = 93 + i * 1.5;
    const p = W.addPerson({ at: [x, SY(x), 3.6 + (i % 2) * 1.2], act: i % 3 ? 'talk' : 'point', prop: i % 2 ? 'cane' : null, face: 'out', costume: i % 3 === 1 ? C.gown(['#5a4a3a', '#3a4a5a'][i % 2], { sleeves: 'long', hat: 'bonnet', hatColor: '#3a2a2a' }) : { top: '#e8e0d0', bottom: '#4a4038', coat: 'jacket', coatColor: ['#4a4038', '#3a3a40'][i % 2], hat: 'bowler', hatColor: '#2a2420' } });
    p.vis = (h) => inH(h, 12, 15.5);
  }
  const pianist = W.addPerson({ at: [95.4, SY(95.4) + 0.5, 6.4], act: 'sitWork', face: 1, costume: C.black({ hair: '#9a9a9a' }) });
  pianist.vis = (h) => inH(h, 12, 15.5); pianist.label = 'The rehearsal pianist';
  // Seamstresses and tailors in the workshops by day (room for sixty, N p.193).
  for (let i = 0; i < 6; i++) {
    const x = 124 + (i % 4) * 3.4 + 1.2;
    const p = W.addPerson({ at: [x, Y.workshop, i < 4 ? 6.9 : 9.0], act: 'sitWork', face: i < 4 ? 'out' : 'in', costume: i % 3 === 2 ? C.shirt({ hat: null, top: '#e8e0d0', bottom: '#3a3a3a' }) : C.maid({ dressColor: ['#3a3a4a', '#4a3a3a'][i % 2], top: ['#3a3a4a', '#4a3a3a'][i % 2], hat: null }) });
    p.vis = (h) => inH(h, 8, 18) || (i < 2 && inH(h, 18, 21));
  }
  // Clerks in the administration by day; the takings counted from nine to ten (N p.198).
  BACK.accounts.forEach((s, i) => { const p = W.addPerson({ at: s, act: 'sitWrite', face: 'out', costume: C.black() }); p.vis = (h) => inH(h, 10, 17.5) || inH(h, 21, 22); });
  const dir = W.addPerson({ at: [143, 7.6, 6.1], act: 'sitWrite', face: 'out', costume: C.black({ coat: 'tail', beard: '#6a6a6a' }) });
  dir.vis = (h) => inH(h, 10.5, 17); dir.label = 'At the director’s desk';
  // The box office, open eleven to six (Baedeker 1878), with a queue.
  const clerk = W.addPerson({ at: [16.4, Y.vest, 9.6], act: 'sitWrite', seat: 0.6, face: -1, costume: C.black() });
  clerk.vis = (h) => inH(h, 11, 18);
  for (let i = 0; i < 4; i++) { const p = W.addPerson({ at: [14.2 - i * 0.9, Y.vest, 9.2 + (i % 2) * 0.3], act: 'stand', face: 1, costume: i % 2 ? C.gown('#5a4a3a', { sleeves: 'long', hat: 'bonnet', hatColor: '#3a2a1a' }) : { top: '#e8e0d0', bottom: '#3a3a40', coat: 'long', coatColor: '#4a4038', hat: 'top', hatColor: '#1a1a1a' } }); p.vis = (h) => inH(h, 11, 17.5); }
  // The queue for the pit an hour before the doors (Baedeker 1878), and strollers on the Place by day.
  for (let i = 0; i < 9; i++) {
    const p = W.addPerson({ at: [-6.5 - i * 0.8, 0, 8.5 + (i % 2) * 0.4], act: i % 3 ? 'stand' : 'talk', face: 1, costume: i % 4 === 1 ? C.gown('#3a3a4a', { sleeves: 'long', hat: 'bonnet', hatColor: '#2a2a2a' }) : { top: '#e8e0d0', bottom: '#3a3a40', coat: 'long', coatColor: ['#4a4038', '#3a3a40', '#2a2a2e'][i % 3], hat: ['bowler', 'top', 'flat'][i % 3], hatColor: '#1e1e1e' } });
    p.vis = (h) => inH(h, 17.9 + i * 0.05, 19.05);
  }
  for (let i = 0; i < 8; i++) {
    const a = G.place[1 + (i % 6)], b = G.place[(i * 3) % 8];
    const p = W.addPerson({ costume: i % 2 ? C.gown(GOWNS[i], { sleeves: 'long', hat: 'bonnet', hatColor: '#3a2a2a' }) : { top: '#e8e0d0', bottom: '#3a3a40', coat: 'long', coatColor: ['#4a4038', '#3a3a40'][i % 2], hat: 'top', hatColor: '#1a1a1a' }, speed: 0.9, routine: [
      { at: a, act: 'stand', face: 'out', dur: [M(1), M(4)] }, { at: b, act: 'talk', face: 'out', dur: [M(1), M(4)] },
    ] });
    p.vis = (h) => inH(h, 8.5, 18.5) || (i < 3 && inH(h, 23.75, 0.4));
  }
  // Firemen at their posts (a detachment each night, N p.185).
  for (const [x, y, z] of [[ST0 + 0.4, SY(ST0 + 0.4), 14], [ST1 - 1.2, Y.gril[0], 5], [76, 28.6, 8]]) {
    const p = W.addPerson({ at: [x, y, z], act: 'handsBehind', face: 'out', costume: C.fireman() });
    p.vis = (h) => inH(h, 17.0, 0.5);
  }
  // A fireman sniffing the air by Baudry's paintings: "oil paint makes very bad smoke" (N p.135).
  const sniff = W.addPerson({ at: [12.5, Y.foyer, 20.5], act: 'lookout', face: 'in', costume: C.fireman() });
  sniff.vis = (h) => inH(h, 7, 11); sniff.label = 'Sniffing the air near the paintings';
  // Night: sleepers. The concierge sleeps in his lodge (in his routine); a night watchman dozes by a furnace.
  const watch = W.addPerson({ at: [40.5, Y.cellar, 4.0], act: 'sleepSit', seat: 0.4, face: 'out', costume: C.blouse({ top: '#5a5a5a' }) });
  watch.vis = (h) => inH(h, 0.5, 6.5); watch.label = 'A night watchman, dozing by a furnace';
  void stage; void D; void R1; void SZ;
  return G;
}

export { showAt };
