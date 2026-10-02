/* The Atlantic Liner: the navigation graph, the casting list (fictional people built from
 * the dossier's section 4d) and the crowds of passengers and crew.
 *
 * Ship's time. Watches are four hours on and eight off. Meal hours follow the 1936
 * passenger lists (dossier 4c): Cabin breakfast from 8, luncheon 13, dinner 19.30;
 * Tourist sittings 8 and 9, 12.15 and 13.30, 18.30 and 19.45; soup on deck at 11, tea at 16.
 */
import { anims, XS } from '../../engine/index.js';
import { DK, FOREMAST_X, sheer } from './shape.js';
import { ROOMS, FLIGHTS, Y } from './rooms.js';

const WALK_Z = 0.9;
const NOWALK = new Set(['compass', 'pool', 'tpool', 'hold1', 'hold2', 'tank', 'chain', 'scotch', 'yarrow', 'turbogen', 'engine', 'tunnel', 'lift', 'steering']);

// ------------------------------------------------------------------ custom animations
anims.register('tennis', (p, t, P) => {
  const c = (t * 0.7 + p.ph) % 1;
  const sw = c < 0.3 ? Math.sin((c / 0.3) * Math.PI) : 0;
  anims.table.stand(p, t, P);
  const bob = Math.sin(t * 3 + p.ph) * 0.04;
  P.rootY = 0.5 + bob; P.thF = 0.25; P.thB = -0.2; P.shF = -0.3; P.lean = 0.12;
  P.uaF = -0.6 - sw * 2.0; P.faF = 0.4; P.uaB = -0.4; P.faB = 0.8;
  return P;
});
anims.register('darts', (p, t, P) => {
  const c = (t * 0.33 + p.ph) % 1;
  const th = c < 0.15 ? c / 0.15 : c < 0.22 ? 1 - (c - 0.15) / 0.07 * 2 : 0;
  anims.table.stand(p, t, P);
  P.uaF = -1.6 + th * 0.6; P.faF = 1.8 - Math.max(0, -th) * 1.6; P.lean = 0.05 - th * 0.1; P.thF = 0.15; P.thB = -0.1;
  return P;
});
anims.register('piano', (p, t, P) => {
  anims.table.sit(p, t, P);
  const s = Math.sin(t * 6 + p.ph), s2 = Math.sin(t * 5.1 + p.ph * 2);
  P.uaF = -0.75 + s * 0.08; P.faF = 1.45 + s2 * 0.1; P.uaB = -0.7 - s2 * 0.08; P.faB = 1.5; P.head = 0.15 + Math.sin(t * 1.3) * 0.08; P.lean = 0.12;
  return P;
});
anims.register('riding', (p, t, P) => {
  anims.table.sit(p, t, P);
  const s = Math.sin(t * 5 + p.ph);
  P.rootY += s * 0.02; P.lean = 0.15 + s * 0.08; P.uaF = -0.9; P.faF = 0.6; P.uaB = -0.9; P.faB = 0.6; P.thF = 1.1; P.thB = 1.1;
  return P;
});
anims.register('boxing', (p, t, P) => {
  anims.table.stand(p, t, P);
  const c = (t * 2.2 + p.ph) % 1, d = (t * 2.2 + p.ph + 0.5) % 1;
  P.uaF = -1.5 + (c < 0.3 ? -0.2 : 0.4); P.faF = c < 0.3 ? 0.2 : 1.6; P.uaB = -1.4 + (d < 0.3 ? -0.2 : 0.4); P.faB = d < 0.3 ? 0.2 : 1.6;
  P.lean = 0.15; P.thF = 0.25; P.thB = -0.2;
  return P;
});

// ------------------------------------------------------------------ costumes (period-typical, dossier 4b)
const SK = ['#f1c9a5', '#e6b48f', '#d9a27a', '#c88c62', '#a96e47', '#8a5634'];
const HR = ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#c9a160', '#9a9a9a', '#d8c9a8'];
const pick = (R, a) => a[Math.floor(R() * a.length)];
const navyOfficer = (o = {}) => Object.assign({ top: '#1e2438', bottom: '#1e2438', coat: 'jacket', coatColor: '#1e2438', hat: 'peaked', hatColor: '#1a1c28', shoes: '#141210' }, o);
const seaman = (o = {}) => Object.assign({ top: '#2a3048', bottom: '#2a3048', hat: 'cap', hatColor: '#22263a', shoes: '#1a1612' }, o);
const fireman = (o = {}) => Object.assign({ top: '#d8d0c0', sleeves: 'short', bottom: '#34404e', shoes: '#1a1612' }, o);
const boilerSuit = (o = {}) => Object.assign({ top: '#e8e4d8', bottom: '#e8e4d8', shoes: '#1a1612' }, o);
const stewardWhite = (o = {}) => Object.assign({ top: '#f2ece0', bottom: '#1a1a1e', coat: 'jacket', coatColor: '#f2ece0', shoes: '#141210' }, o);
const stewardess = (o = {}) => Object.assign({ top: '#2a2a34', dress: 'long', dressColor: '#2a2a34', apron: '#f6f2ea', hat: 'coif', hatColor: '#f6f2ea', hairStyle: 'bun' }, o);
const chef = (o = {}) => Object.assign({ top: '#f4f2ec', bottom: '#5a5a62', apron: '#f4f2ec', hat: 'chef', shoes: '#1a1612' }, o);
const bellboy = (o = {}) => Object.assign({ top: '#7a1e22', coat: 'jacket', coatColor: '#7a1e22', bottom: '#1e2438', hat: 'cap', hatColor: '#7a1e22', child: false, build: 0.85 }, o);
function passenger(R, cls, sex, evening) {
  const skin = pick(R, cls === 3 ? SK : SK.slice(0, 4)), hair = pick(R, HR);
  if (sex === 'f') {
    const day = cls === 1 ? ['#8a3a4a', '#3a4a6a', '#5a6a4a', '#c8a080', '#2a2a2a', '#7a5a8a', '#d8c8b0'] : cls === 2 ? ['#5a6a8a', '#8a5a4a', '#6a7a5a', '#a88a6a', '#4a4a5a'] : ['#5a4a3a', '#4a4a5a', '#6a5a4a', '#7a3a3a', '#3a4a3a'];
    const eve = ['#c8c0b8', '#1e1a1e', '#6a1e2a', '#2a4a3a', '#c8b07a', '#3a2a4a'];
    const c = evening && cls < 3 ? pick(R, eve) : pick(R, day);
    return { skin, hair, hairStyle: pick(R, ['bun', 'short', 'short', 'bun']), top: c, dress: evening && cls === 1 ? 'long' : 'knee', dressColor: c, stockings: '#d8c0a8', shoes: '#3a2a22', hat: !evening && R() < (cls === 3 ? 0.35 : 0.2) ? pick(R, cls === 3 ? ['kerchief', 'beret'] : ['beret', 'straw', 'cloche']) : null, hatColor: pick(R, ['#3a2a2a', '#7a2a2a', '#2a3a5a', '#c8b08a']) };
  }
  const suit = cls === 1 ? ['#3a3a42', '#4a4038', '#2a2e3a', '#5a5248', '#6a6258'] : cls === 2 ? ['#4a4a52', '#5a5040', '#3a3e4a', '#6a5a48'] : ['#4a4238', '#3a3a3a', '#5a4a3a', '#4a4a4a'];
  const c = evening && cls === 1 && R() < 0.6 ? '#16161a' : pick(R, suit);
  return { skin, hair, hairStyle: pick(R, ['short', 'short', 'bald', 'short']), top: '#ece6da', coat: 'jacket', coatColor: c, bottom: c, shoes: '#1a1612', hat: cls === 3 && R() < 0.3 ? 'flat' : null, hatColor: '#3a3632', beard: R() < 0.08 ? hair : null };
}
const child = (R, cls, sex) => Object.assign(passenger(R, cls, sex, false), { child: true, hat: null, dress: sex === 'f' ? 'knee' : null });

// ------------------------------------------------------------------ helpers
const rooms = (kind) => ROOMS.filter((r) => r.kind === kind);
const room = (kind, i = 0) => rooms(kind)[i];
const roomAt = (x, deck) => ROOMS.find((r) => r.x0 <= x && r.x1 >= x && Math.abs(r.yF - Y(deck)) < 0.05);
const S = (r, i) => { const a = r.anch.seats; return a[((i % a.length) + a.length) % a.length]; };
const B = (r, i) => { const a = r.anch.beds; return a[((i % a.length) + a.length) % a.length]; };
const SP = (r, i) => { const a = r.anch.spots; return a[((i % a.length) + a.length) % a.length]; };
const at = (q) => [q.x, q.y, q.z];
const seatStep = (q, act, label, when, extra = {}) => Object.assign({ at: at(q), act, face: q.face, seat: q.seat, label, when, dur: [40, 80] }, extra);
const bedStep = (b, label, when) => ({ at: b.feet, act: 'lie', face: b.heading, label, when, dur: [80, 140] });
const spotStep = (q, act, label, when, extra = {}) => Object.assign({ at: at(q), act, face: q.face, label, when, dur: [30, 60] }, extra);

// ------------------------------------------------------------------ the navigation graph
export function buildNav(W) {
  const nav = W.nav;
  const decks = [...new Set(ROOMS.map((r) => r.yF))].sort((a, b) => a - b);
  W.data.deckNodes = {};
  for (const y of decks) {
    const segs = ROOMS.filter((r) => Math.abs(r.yF - y) < 0.05 && !NOWALK.has(r.kind)).map((r) => [r.x0, r.x1]).sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const s of segs) { const m = merged[merged.length - 1]; if (m && s[0] <= m[1] + 2.6) m[1] = Math.max(m[1], s[1]); else merged.push([s[0], s[1]]); }
    const list = [];
    merged.forEach(([a, b], si) => {
      const xs = [];
      for (let x = a + 0.6; x <= b - 0.6 + 1e-6; x += Math.min(4, Math.max(0.5, (b - a - 1.2) / Math.max(1, Math.round((b - a - 1.2) / 4))))) xs.push(x);
      for (const F of FLIGHTS) for (const fx of [F.x0, F.x1]) if ((Math.abs(Y(F.f) - y) < 0.05 && fx === F.x0) || (Math.abs(Y(F.t) - y) < 0.05 && fx === F.x1)) if (fx >= a - 0.1 && fx <= b + 0.1) xs.push(fx);
      if (Math.abs(y - DK.E) < 0.05 || Math.abs(y - DK.tt) < 0.05) for (const r of ROOMS) if (r.aisle && r.aisle >= a && r.aisle <= b) xs.push(r.aisle);
      const u = [...new Set(xs.map((v) => Math.round(v * 100) / 100))].sort((p, q) => p - q);
      const ids = u.map((x, i) => nav.node(`d${y.toFixed(1)}:${si}:${i}`, x, y, WALK_Z));
      nav.chain(ids, 'walk');
      ids.forEach((id) => list.push(id));
    });
    W.data.deckNodes[y.toFixed(1)] = list;
  }
  const near = (x, y, z = WALK_Z) => nav.nearest(x, y, z, (n) => Math.abs(n.y - y) < 0.3 && n.id.charAt(0) === 'd' && n.id.charAt(1) !== 'o');
  // Stairs.
  FLIGHTS.forEach((F, i) => {
    const y0 = Y(F.f), y1 = Y(F.t), zc = (F.z0 + F.z1) / 2;
    const a = nav.node('stF' + i, F.x0, y0, zc), b = nav.node('stT' + i, F.x1, y1, zc);
    nav.link(a, b, 'stairs');
    const na = near(F.x0, y0), nb = near(F.x1, y1);
    if (na) nav.link(na, a, 'walk');
    if (nb) nav.link(nb, b, 'walk');
  });
  // The engineers' lift, from the engine-room floor to the Sports deck.
  const L = ROOMS.find((r) => r.kind === 'lift');
  const lx = (L.x0 + L.x1) / 2;
  const lifts = ['tt', 'E', 'D', 'C', 'B', 'A', 'M', 'P', 'S', 'SP'].map((k) => nav.node('lift:' + k, lx, DK[k], 1.3));
  nav.chain(lifts, 'lift');
  lifts.forEach((id) => { const n = nav.get(id); for (const dx of [-2.2, 2.2]) { const m = near(lx + dx, n.y); if (m && Math.abs(nav.get(m).x - lx) < 4) nav.link(id, m, 'walk'); } });
  W.data.liftX = lx;
  // Machinery: ladders from E deck down to each aisle; the engine-room floors; the shaft tunnel.
  for (const r of ROOMS) {
    if (r.kind === 'yarrow' || r.kind === 'scotch' || r.kind === 'turbogen') {
      const ax = r.aisle || (r.x0 + r.x1) / 2;
      const f = nav.node('mach:' + r.x0, ax, r.yF, 1.0);
      const lad = nav.node('machL:' + r.x0, ax, DK.E, 0.5);
      nav.link(f, lad, 'ladder');
      const e = near(ax, DK.E); if (e) nav.link(lad, e, 'walk');
      r.node = f;
    }
    if (r.kind === 'engine') {
      const ids = nav.walkway('eng' + r.x0 + ':', r.x0 + 1, r.x1 - 1, r.yF, 1.0, 3.5);
      const lad = nav.node('engL:' + r.x0, r.x1 - 0.75, DK.E, 0.45);
      nav.link(ids[ids.length - 1], lad, 'ladder');
      const e = near(r.x1 - 0.75, DK.E); if (e) nav.link(lad, e, 'walk');
      r.nodes = ids;
    }
  }
  const eA = ROOMS.find((r) => r.kind === 'engine' && !r.outer), eF = ROOMS.find((r) => r.kind === 'engine' && r.outer);
  nav.link(eF.nodes[eF.nodes.length - 1], eA.nodes[0], 'door');
  const tun = ROOMS.find((r) => r.kind === 'tunnel');
  const tw = nav.walkway('tun:', tun.x0 + 0.5, 282, tun.yF + 0.15, 3.1, 5);
  nav.link(eA.nodes[eA.nodes.length - 1], 'lift:tt', 'door');
  nav.link('lift:tt', tw[0], 'door');
  // Holds: ladders down the hatches.
  const h1 = room('hold1'), h2 = room('hold2');
  const hold1 = [DK.tt, DK.H, DK.G, DK.F, DK.E].map((y, i) => nav.node('h1:' + i, 13.5, y, 1.0));
  nav.chain(hold1, 'ladder');
  const d13 = near(13.5, DK.D); if (d13) nav.link(hold1[hold1.length - 1], d13, 'ladder');
  const h2f = nav.node('h2F', 46.6, DK.F, 1.0), h2w = nav.node('h2W', 40, DK.F, 1.0);
  nav.link(h2f, h2w);
  const d47 = near(47.5, DK.D); if (d47) nav.link(h2f, d47, 'ladder');
  void h1; void h2;
  // The pool deck round the basin, a step down from C deck.
  const pool = room('pool');
  const wl = DK.C - 0.4;
  const pa = nav.node('poolA', pool.x0 + 0.6, wl, 1.0), pb = nav.node('poolB', pool.x1 - 0.6, wl, 1.0);
  nav.link(pa, pb);
  const c1 = near(pool.x0 - 1, DK.C), c2 = near(pool.x1 + 1, DK.C);
  if (c1) nav.link(pa, c1); if (c2) nav.link(pb, c2);
  // Tourist pool: walk behind the plunge to the gymnasium end.
  const tp = room('tpool');
  const tpA = nav.node('tpA', tp.x0 + 0.6, tp.yF, 0.9), tpB = nav.node('tpB', tp.x0 + 0.6, tp.yF, tp.noFloorX[2] + 0.5), tpC = nav.node('tpC', tp.noFloorX[1] + 0.5, tp.yF, tp.noFloorX[2] + 0.5);
  const tpw = nav.walkway('tpG:', tp.noFloorX[1] + 0.8, tp.x1 - 0.6, tp.yF, 0.9, 3.5);
  nav.chain([tpA, tpB, tpC, tpw[0]]);
  for (const [id, x] of [[tpA, tp.x0 - 1], [tpw[tpw.length - 1], tp.x1 + 1]]) { const m = near(x, tp.yF); if (m) nav.link(id, m); }
  // Ladders down to the stores, wine cellar and baggage rooms below E deck.
  for (const [x, ys] of [[58, ['G', 'F', 'E']], [264.2, ['G', 'F']], [226.5, ['G', 'F']]]) {
    const ids = ys.map((key) => near(x, DK[key]));
    for (let i = 0; i < ids.length - 1; i++) if (ids[i] && ids[i + 1]) nav.link(ids[i], ids[i + 1], 'ladder');
  }
  // Boat deck walk (outboard on the Sun deck) and the crossings to the centreline.
  const boat = nav.walkway('boat:', 86.5, 258, DK.S, 14, 6);
  W.data.boat = boat;
  for (const x of [92, 100, 155, 170, 210, 250]) { const m = near(x, DK.S); const b = nav.nearest(x, DK.S, 14, (n) => n.id.startsWith('boat:')); if (m && b) nav.link(m, b); }
  // Forecastle: up from the well deck.
  const fc = [];
  for (const x of [28, 23, 18, 13, 9, 5]) fc.push(nav.node('fc:' + x, x, sheer(x) - 1.1, Math.min(3.0, x * 0.4)));
  nav.chain(fc, 'walk');
  const w30 = near(31.5, DK.M); if (w30) nav.link(w30, fc[0], 'ladder');
  // The foremast: 110 steps up inside the mast to the crow's nest.
  const mb = nav.node('mastFoot', FOREMAST_X - 0.1, DK.M, 0.2);
  const nest = nav.node('nest', FOREMAST_X - 0.35, 50.55, 0.25);
  nav.link(mb, nest, 'ladder');
  const wm = near(FOREMAST_X, DK.M); if (wm) nav.link(wm, mb);
  W.station('nest', FOREMAST_X - 0.5, 50.55, 0.2, -1);
  // Compass platform: a ladder up from the wheelhouse.
  const wh = room('wheelhouse');
  const cpa = nav.node('cpL', wh.x1 - 1.0, DK.WH, 2.5), cpb = nav.node('cpT', wh.x1 - 1.0, DK.CP, 2.5);
  nav.link(cpa, cpb, 'ladder');
  const whn = near(wh.x1 - 1.0, DK.WH); if (whn) nav.link(whn, cpa);
  const cpw = nav.walkway('cp:', wh.x0 + 1, wh.x1 - 1, DK.CP, 2.5, 3); nav.link(cpb, cpw[cpw.length - 1]);
}

// ------------------------------------------------------------------ people
export function buildPeople(W) {
  const R = W.R;
  const add = (def) => W.addPerson(def);
  const extras = [];
  const extra = (pos, act, cos, face, show, o = {}) => { if (Array.isArray(show)) { const [a, b] = show; show = (h) => XS.math.inHours(h, a, b); } const p = W.addPerson(Object.assign({ at: pos, act, costume: cos, face, seat: o.seat, prop: o.prop, label: o.label }, o.def || {})); p.show = show; p.role = o.role || null; extras.push(p); return p; };

  const wh = room('wheelhouse'), cp = room('compass'), off = room('officers');
  const messC = room('mess'), bunksS = rooms('crewbunks').filter((r) => r.who === 'seaman'), bunksW = rooms('crewbunks').filter((r) => r.who === 'steward');
  const crewAft = rooms('crew');
  const well = room('well'), lamp = room('lampstore'), carp = room('carpenter');
  const radio = room('radio'), radiotx = room('radiotx');
  const fer = ROOMS.find((r) => r.kind === 'engine' && r.outer), aer = ROOMS.find((r) => r.kind === 'engine' && !r.outer);
  const engq = room('engq'), engq2 = room('engq2'), tun = room('tunnel');
  const br3 = rooms('yarrow')[1], tg1 = room('turbogen'), cold = rooms('cold')[1];
  const bureau = room('bureau'), mainhall = room('mainhall'), smoke1 = room('smoke1'), lounge1 = room('lounge1');
  const cabin1 = rooms('cabin1'), cabin2 = rooms('cabin2'), cabin3 = rooms('cabin3');
  const rest = room('restaurant'), restB = room('restaurantB'), kitchen = room('kitchen');
  const alley = rooms('alley'), wine = room('wine');
  const prom = room('prom'), prom2 = room('prom2'), sun = rooms('sundeck');
  const salon = room('salon'), pool = room('pool'), gym = room('gym'), tennis = room('tennis'), squash = room('squash'), kennels = room('kennels');
  const hosp = room('hospital'), iso = room('isolation'), ball = room('ballroom'), ver = room('verandah'), gallery = room('gallery');
  const play1 = room('playroom1'), obs = room('obsbar'), lib2 = room('library2'), lounge2 = room('lounge2'), smoke2 = room('smoke2'), tpool = room('tpool'), dining2 = room('dining2');
  const garden = room('garden3'), dining3 = room('dining3'), cinema = room('cinema3'), smoke3 = room('smoke3'), syn = room('synagogue'), play3 = room('playroom3'), galley3 = room('galley3');
  const pig = room('pig'), opendeck = room('opendeck');
  const sk = (s) => ({ skin: s });

  // --- deck department
  add({ name: 'Walter Pengelly', role: 'quartermaster', bio: 'Grows tomatoes in tins on his allotment in Southampton.', costume: seaman({ hat: 'peaked', hatColor: '#1a1c28', hair: '#4a3020' }), routine: [
    spotStep(SP(wh, 0), 'wheel', 'At the wheel: the forenoon watch', [8, 12], { dur: [90, 140] }),
    seatStep(S(messC, 2), 'sitEat', 'Dinner in the crew mess', [12, 13.2]),
    bedStep(B(bunksS[0], 3), 'Asleep in his bunk below', [13.2, 19.5]),
    spotStep(SP(wh, 0), 'wheel', 'At the wheel: the first watch, 8 to midnight', [20, 24], { dur: [90, 140] }),
    bedStep(B(bunksS[0], 3), 'Asleep', [0, 8]),
  ] });
  add({ name: 'Ronald Greig', role: 'junior officer of the watch', bio: 'Practises knots for his master’s ticket.', costume: navyOfficer({ hair: '#8d5a2b' }), routine: [
    spotStep(SP(wh, 1), 'handsBehind', 'Keeping the afternoon watch', [12, 16], { dur: [60, 100] }),
    spotStep(SP(cp, 0), 'lookout', 'Taking compass bearings on the compass platform', [12, 16], { dur: [20, 30] }),
    seatStep(S(off, 2), 'sitDrink', 'Tea in the wardroom', [16, 17]),
    seatStep(S(off, 5), 'sitWrite', 'Writing up the log in his cabin', [17, 19]),
    spotStep(SP(wh, 1), 'handsBehind', 'The middle watch, midnight to four', [0, 4], { dur: [60, 100] }),
    bedStep(B(off, 1), 'Asleep after the middle watch', [4, 11]),
    seatStep(S(off, 3), 'sitEat', 'A late breakfast in the wardroom', [11, 12]),
    bedStep(B(off, 1), 'Turned in', [19, 24]),
  ] });
  add({ name: 'Ernest Hollis', role: 'lookout', bio: 'Hums hymns into the wind.', costume: seaman({ top: '#26304a', hair: '#9a9a9a' }), routine: [
    { at: 'nest', act: 'lookout', face: -1, label: 'In the crow’s nest, watching the horizon', when: [4, 8], dur: [120, 180] },
    spotStep(SP(wh, 3), 'talk', 'Reporting to the bridge', [4, 8], { dur: [10, 15] }),
    seatStep(S(messC, 5), 'sitDrink', 'Cocoa in the mess', [8, 9]),
    bedStep(B(bunksS[1], 2), 'Asleep', [9, 15.5]),
    { at: 'nest', act: 'lookout', face: -1, label: 'In the crow’s nest for the dog watches', when: [16, 20], dur: [120, 180] },
    seatStep(S(messC, 5), 'sitEat', 'Supper in the mess', [20, 21]),
    bedStep(B(bunksS[1], 2), 'Asleep', [21, 3.5]),
  ] });
  add({ name: 'Fred Dunning', role: 'able seaman', bio: 'Saving up to marry a girl from Woolston.', costume: seaman({ hair: '#2b1d14' }), routine: [
    { at: 'fc:23', act: 'scrub', face: 'out', label: 'Scrubbing the forecastle deck', when: [6, 8], dur: [60, 90] },
    spotStep(SP(well, 0), 'workBench', 'Greasing the derrick blocks on the well deck', [8, 10], { face: 'in' }),
    { at: [99, DK.S, 14.3], act: 'workBench', face: 'in', label: 'Checking the lifeboat covers', when: [10, 12], dur: [40, 60] },
    seatStep(S(messC, 8), 'sitEat', 'Dinner in the mess', [12, 13]),
    { at: [160, DK.S, 14.3], act: 'workBench', face: 'in', label: 'Checking the lifeboat covers', when: [13, 16], dur: [40, 60] },
    bedStep(B(bunksS[0], 6), 'Asleep', [21, 6]),
    seatStep(S(messC, 8), 'sitTalk', 'Yarning in the mess', [16, 21]),
  ] });
  add({ name: 'Tommy Rudd', role: 'deck boy, aged 16', bio: 'Has never seen New York.', costume: seaman({ build: 0.85, hat: null, hair: '#b07a3c' }), H: 1.58, routine: [
    spotStep(SP(ROOMS.find((q) => q.paint), 0), 'carry', 'Fetching paint from the paint store', [7, 16], { prop: 'bucket', dur: [15, 25] }),
    spotStep(SP(well, 0), 'hammer', 'Chipping rust on the well deck', [7, 16], { dur: [60, 90] }),
    spotStep(SP(galley3, 4), 'carry', 'Carrying the tea urn from the galley', [15, 16.5], { prop: 'box', dur: [15, 20] }),
    bedStep(B(bunksS[1], 5), 'Asleep', [21, 6.5]),
    seatStep(S(messC, 11), 'sitEat', 'Supper', [17, 21]),
  ] });
  add({ name: 'Hugh Mallory', role: 'carpenter', bio: 'Keeps his late father’s chisels.', costume: { top: '#5a5a62', bottom: '#4a4a52', apron: '#8a6a42', hair: '#6b4428', hat: 'flat', hatColor: '#3a3632' }, routine: [
    spotStep(SP(carp, 0), 'saw', 'Planing a new handrail in the carpenter’s shop', [8, 11], { dur: [60, 100] }),
    spotStep(SP(lounge1, 0), 'kneel', 'Tightening a loose chair bolt in the Main Lounge', [11, 12.5], { dur: [40, 60], at: [lounge1.x0 + 10, lounge1.yF, 1.4] }),
    { at: [pool.x0 + 1.2, DK.C - 0.4, 1.3], act: 'kneel', face: 1, label: 'Checking the diving board', when: [13, 15], dur: [30, 40] },
    spotStep(SP(carp, 0), 'workBench', 'Back at the bench', [15, 18], { dur: [60, 100] }),
    seatStep(S(messC, 14), 'sitEat', 'Supper', [18, 21]),
    bedStep(B(bunksS[1], 8), 'Asleep', [21, 8]),
  ] });
  add({ name: 'Percy Gale', role: 'lamp trimmer', bio: 'Can name every star used in navigation.', costume: { top: '#4a4a3a', bottom: '#3a3a32', hair: '#9a9a9a', hat: 'flat', hatColor: '#2a2a26' }, routine: [
    spotStep(SP(lamp, 0), 'workBench', 'Trimming lamps in the lamp room', [8, 13], { dur: [60, 90] }),
    { at: 'nest', act: 'workBench', face: 1, label: 'Up the foremast, seeing to the masthead light', when: [14, 15], dur: [40, 60] },
    spotStep(SP(lamp, 0), 'workBench', 'Filling oil cans', [15, 18.5], { dur: [60, 90] }),
    { at: 'fc:5', act: 'workBench', face: -1, label: 'Inspecting the navigation lights at dusk', when: [18.5, 20], dur: [30, 40] },
    seatStep(S(messC, 17), 'sitEat', 'Supper', [20, 21.5]),
    bedStep(B(bunksS[1], 11), 'Asleep', [21.5, 8]),
  ] });
  // --- wireless
  add({ name: 'Cyril Bannister', role: 'wireless operator', bio: 'Reads Morse faster than he reads print.', costume: navyOfficer({ hat: null, hair: '#4a3020' }), routine: [
    seatStep(S(radio, 0), 'sitWrite', 'Copying press news for the ship’s paper', [8, 12]),
    seatStep(S(radiotx, 0), 'sitWork', 'Sending passengers’ cables', [12, 16]),
    seatStep(S(messC, 3), 'sitEat', 'Supper', [16, 17]),
    seatStep(S(radio, 0), 'sitWrite', 'On watch in the receiving room', [20, 24]),
    bedStep(B(off, 2), 'Asleep', [0, 8]),
    seatStep(S(off, 5), 'sitRead', 'Off watch', [17, 20]),
  ] });
  extra(at(S(radio, 1)), 'sitWrite', navyOfficer({ hat: null }), 'in', [0, 24], { seat: 0.46, role: 'wireless operator', label: 'Copying a weather report' });
  extra(at(S(radio, 2)), 'sitWork', navyOfficer({ hat: null, hair: '#8d5a2b' }), 'in', [6, 22], { seat: 0.46, role: 'wireless operator', label: 'Tapping out a passenger’s cable' });
  // --- engineers and firemen
  add({ name: 'Gerald Fane', role: 'second engineer', bio: 'Draws turbine blades in a sketchbook.', costume: boilerSuit({ hair: '#2b1d14' }), routine: [
    { at: [fer.wheels[0] + 0.3, fer.platform.y, 2.2], act: 'crank', face: 'in', label: 'At the throttle wheels, forward engine room', when: [4, 8], dur: [80, 120] },
    { at: [fer.platform.x + 0.6, fer.platform.y, 2.6], act: 'handsBehind', face: 'in', label: 'Watching the gauges', when: [4, 8], dur: [40, 60] },
    { at: [fer.wheels[0] + 0.3, fer.platform.y, 2.2], act: 'crank', face: 'in', label: 'The afternoon watch at the throttle', when: [16, 20], dur: [80, 120] },
    seatStep(S(engq, 1), 'sitRead', 'Washing and changing in his cabin', [20, 20.5]),
    seatStep(S(engq2, 0), 'sitEat', 'Supper in the engineers’ quarters (up in the lift)', [20.5, 22]),
    bedStep(B(engq, 1), 'Asleep', [22, 3.6]),
    bedStep(B(engq, 1), 'Asleep', [8.5, 15.6]),
  ] });
  add({ name: 'Alastair Munro', role: 'junior engineer', bio: 'Writes to his mother in Greenock every week.', costume: boilerSuit({ hair: '#7a2c14' }), routine: [
    { at: [aer.platform.x + 0.8, aer.platform.y, 2.4], act: 'read', prop: 'clipboard', face: 'in', label: 'Logging the rev counter readings', when: [8, 12], dur: [50, 80] },
    { at: [tun.x0 + 14, tun.yF + 0.15, 3.2], act: 'kneel', face: 'in', label: 'Checking the plummer blocks in the shaft tunnel', when: [8, 12], dur: [40, 60] },
    { at: [aer.x0 + 3.5, aer.yF, 1.0], act: 'read', prop: 'clipboard', face: 'in', label: 'Reading the condenser vacuum gauge', when: [8, 12], dur: [20, 30] },
    { at: [aer.platform.x + 0.8, aer.platform.y, 2.4], act: 'read', prop: 'clipboard', face: 'in', label: 'Logging the rev counters', when: [20, 24], dur: [50, 80] },
    seatStep(S(engq, 4), 'sitWrite', 'Writing home', [12, 14]),
    bedStep(B(engq, 4), 'Asleep', [0, 7.5]),
    bedStep(B(engq, 4), 'Asleep', [14, 19.5]),
  ] });
  add({ name: 'Sid Harker', role: 'fireman', bio: 'A coal stoker once; prefers oil.', costume: fireman({ hair: '#2b1d14' }), routine: [
    { at: [br3.aisle - 1.1, br3.yF, 1.4], act: 'workBench', face: -1, label: 'Changing and cleaning burners in No. 3 boiler room', when: [0, 4], dur: [60, 90] },
    { at: [br3.aisle + 1.1, br3.yF, 1.4], act: 'workBench', face: 1, label: 'Watching the flames through the peepholes', when: [12, 16], dur: [60, 90] },
    { at: [br3.aisle - 1.1, br3.yF, 1.4], act: 'workBench', face: -1, label: 'Changing burners', when: [12, 16], dur: [60, 90] },
    spotStep(SP(pig, 0), 'darts', 'A pint and a game of darts in the Pig and Whistle', [16.5, 18.5], { dur: [60, 90] }),
    bedStep(B(crewAft[1], 2), 'Asleep in the firemen’s quarters', [18.5, 23.6]),
    bedStep(B(crewAft[1], 2), 'Asleep', [4.5, 11.6]),
  ] });
  add({ name: 'Joe Kettley', role: 'greaser', bio: 'Keeps a canary at home in Northam.', costume: fireman({ hair: '#6b4428', top: '#c8c0b0' }), routine: [
    { at: [tun.x0 + 26, tun.yF + 0.15, 3.2], act: 'kneel', face: 'in', label: 'Feeling a bearing with his palm in the shaft tunnel', when: [8, 12], dur: [40, 70] },
    { at: [tun.x0 + 38, tun.yF + 0.15, 3.2], act: 'kneel', face: 'in', label: 'Oiling the shaft bearings', when: [8, 12], dur: [40, 70] },
    { at: [fer.x0 + 13, fer.yF, 1.0], act: 'workBench', face: 'in', label: 'Feeling the gear case for heat', when: [8, 12], dur: [30, 50] },
    { at: [tun.x0 + 26, tun.yF + 0.15, 3.2], act: 'kneel', face: 'in', label: 'Oiling the bearings', when: [20, 24], dur: [40, 70] },
    seatStep(S(pig, 3), 'sitDrink', 'In the Pig and Whistle', [12, 14]),
    bedStep(B(crewAft[2], 1), 'Asleep', [14, 19.6]),
    bedStep(B(crewAft[2], 1), 'Asleep', [0, 7.6]),
  ] });
  add({ name: 'Leonard Pike', role: 'electrician', bio: 'Builds wireless sets as a hobby.', costume: boilerSuit({ top: '#3a4a6a', bottom: '#3a4a6a', hair: '#c9a160' }), routine: [
    { at: [tg1.x0 + 2, tg1.yF, 1.0], act: 'read', prop: 'clipboard', face: 'in', label: 'Checking the dynamos’ output', when: [8, 12], dur: [40, 60] },
    { at: [tg1.x1 - 1.2, tg1.yF, 2.6], act: 'workBench', face: 'in', label: 'Reading meters at the switchboard', when: [8, 16], dur: [40, 60] },
    { at: [ver.x0 + 6, ver.yF, 1.2], act: 'workBench', face: 'in', label: 'Mending a colour-change light in the Verandah Grill', when: [16, 17.5], dur: [40, 60] },
    seatStep(S(engq, 7), 'sitRead', 'Reading a wireless magazine', [17.5, 22]),
    bedStep(B(engq, 7), 'Asleep', [22, 7.6]),
  ] });
  add({ name: 'Arthur Blewett', role: 'refrigeration greaser', bio: 'Hates the cold.', costume: fireman({ top: '#5a5a62', sleeves: 'long', hair: '#4a3020' }), routine: [
    spotStep(SP(cold, 0), 'workBench', 'Checking the brine pipes in the cold stores', [8, 12]),
    spotStep(SP(room('cold'), 2), 'read', 'Reading the thermometers in the fish store', [12, 13], { prop: 'clipboard' }),
    spotStep(SP(cold, 3), 'workBench', 'Checking the brine pipes', [13, 17]),
    seatStep(S(messC, 20), 'sitEat', 'Supper', [17, 18]),
    bedStep(B(crewAft[0], 4), 'Asleep', [21, 7.6]),
  ] });
  // --- purser's and stewards' departments
  add({ name: 'Harold Venn', role: 'senior assistant purser', bio: 'Never forgets a passenger’s name.', costume: navyOfficer({ hat: null, hair: '#9a9a9a' }), routine: [
    spotStep(SP(bureau, 0), 'talk', 'Changing money at the purser’s office', [9, 12]),
    { at: [mainhall.x0 + 17, mainhall.yF, 1.5], act: 'point', face: 'in', label: 'Posting the day’s run in the Main Hall', when: [12, 12.5], dur: [20, 30] },
    spotStep(SP(bureau, 0), 'talk', 'At the counter', [12.5, 17]),
    seatStep(S(smoke1, 2), 'sitTalk', 'Chatting with passengers in the Smoking Room', [21, 22.5]),
    bedStep(B(off, 0), 'Asleep', [23, 8]),
    seatStep(S(off, 3), 'sitEat', 'Dinner', [18, 21]),
  ] });
  extra(at(SP(bureau, 1)), 'talk', navyOfficer({ hat: null, hair: '#4a3020' }), 'out', [8.5, 18], { role: 'travel bureau clerk', label: 'Selling a rail ticket for the journey on from New York' });
  const cab1 = cabin1[4], cab1b = cabin1[6];
  add({ name: 'Marjorie Coker', role: 'Cabin Class stewardess', bio: 'Writes to her sister in Cork.', costume: stewardess({ hair: '#4a3020', skin: '#f1c9a5' }), routine: [
    spotStep(SP(cab1, 0), 'carryHigh', 'Taking morning tea to a stateroom', [6.5, 8.5], { prop: 'tray', face: 'in', dur: [20, 30] }),
    spotStep(SP(cab1, 1), 'sweep', 'Tidying a stateroom', [8.5, 11], { face: 'in' }),
    spotStep(SP(cab1, 2), 'sweep', 'Tidying a stateroom', [8.5, 11], { face: 'in' }),
    spotStep(SP(alley[0], 2), 'carry', 'Collecting clean sheets from the linen store', [11, 11.6], { prop: 'box', dur: [20, 30] }),
    seatStep(S(room('mess'), 21), 'sitRead', 'Resting in the stewards’ quarters', [14, 16]),
    spotStep(SP(cab1, 3), 'workBench', 'Turning down the beds', [19, 21], { face: 'in' }),
    bedStep(B(bunksW[0], 2), 'Asleep', [22, 6.4]),
  ] });
  add({ name: 'Bert Collings', role: 'bedroom steward', bio: 'Counts his tips into a cocoa tin.', costume: stewardWhite({ hair: '#6b4428' }), routine: [
    spotStep(SP(cab1b, 0), 'talk', 'Answering a call bell', [7, 12], { face: 'in', dur: [20, 30] }),
    spotStep(SP(cab1b, 2), 'carryHigh', 'Carrying a breakfast tray', [7, 10], { prop: 'tray', face: 'in', dur: [20, 30] }),
    spotStep(SP(cab1b, 4), 'talk', 'Answering a call bell', [12, 18], { face: 'in', dur: [20, 30] }),
    seatStep(S(room('mess'), 23), 'sitWork', 'Polishing passengers’ shoes', [21, 23]),
    bedStep(B(bunksW[1], 4), 'Asleep', [23, 6.6]),
    spotStep(SP(cab1b, 3), 'carryHigh', 'Bringing a late supper', [18, 21], { prop: 'tray', face: 'in', dur: [20, 30] }),
  ] });
  add({ name: 'Albert Moss', role: 'bathroom steward (Tourist)', bio: 'Remembers every passenger’s favourite bath temperature.', costume: stewardWhite({ hair: '#9a9a9a' }), routine: [
    spotStep(SP(cabin2[2], 1), 'pour', 'Running a bath at the booked time', [7, 10], { prop: 'jug', face: 'in' }),
    spotStep(SP(cabin2[2], 3), 'pour', 'Running a bath', [7, 10], { prop: 'jug', face: 'in' }),
    spotStep(SP(cabin2[3], 2), 'read', 'Posting tomorrow’s bath times', [10, 10.3], { prop: 'paper' }),
    seatStep(S(room('mess'), 26), 'sitEat', 'Dinner', [12, 13]),
    spotStep(SP(cabin2[2], 2), 'pour', 'Evening baths', [17, 19], { prop: 'jug', face: 'in' }),
    bedStep(B(bunksW[1], 7), 'Asleep', [22, 6.6]),
  ] });
  add({ name: 'Stanley Whitlock', role: 'Main Restaurant steward', bio: 'Carries six plates on one arm.', costume: stewardWhite({ hair: '#2b1d14' }), routine: [
    { at: [rest.x0 + 4, rest.yF, 1.2], act: 'workBench', face: 'in', label: 'Laying tables for luncheon', when: [11, 13], dur: [40, 60] },
    { at: [rest.x0 + 8, rest.yF, 1.2], act: 'carryHigh', prop: 'tray', face: 'out', label: 'Serving luncheon', when: [13, 15], dur: [25, 40] },
    { at: [kitchen.x0 + 4, kitchen.yF, 1.2], act: 'carryHigh', prop: 'tray', face: 'in', label: 'Collecting plates at the hotplate', when: [13, 15], dur: [15, 25] },
    seatStep(S(room('mess'), 29), 'sitRead', 'Resting between services', [15, 17]),
    { at: [rest.x0 + 12, rest.yF, 1.2], act: 'carryHigh', prop: 'tray', face: 'out', label: 'Serving dinner', when: [19.5, 22.5], dur: [25, 40] },
    { at: [kitchen.x0 + 4, kitchen.yF, 1.2], act: 'carryHigh', prop: 'tray', face: 'in', label: 'Collecting plates at the hotplate', when: [19.5, 22.5], dur: [15, 25] },
    bedStep(B(bunksW[0], 6), 'Asleep', [23, 7]),
    { at: [rest.x0 + 6, rest.yF, 1.2], act: 'carryHigh', prop: 'tray', face: 'out', label: 'Serving breakfast', when: [7.5, 10], dur: [25, 40] },
  ] });
  add({ name: 'Dennis Quarrie', role: 'wine steward', bio: 'Keeps a notebook of vintages.', costume: stewardWhite({ coatColor: '#2a2420', top: '#f2ece0', hair: '#6b4428' }), routine: [
    spotStep(SP(wine, 0), 'carry', 'Bringing up bottles from the wine cellar', [11, 12.5], { prop: 'box', dur: [30, 40] }),
    { at: [rest.x0 + 16, rest.yF, 1.2], act: 'pour', prop: 'jug', face: 'out', label: 'Pouring wine at luncheon', when: [13, 15], dur: [30, 50] },
    seatStep(S(room('mess'), 32), 'sitRead', 'Resting', [15, 17]),
    { at: [rest.x0 + 18, rest.yF, 1.2], act: 'pour', prop: 'jug', face: 'out', label: 'Pouring wine at dinner', when: [19.5, 22.5], dur: [30, 50] },
    bedStep(B(bunksW[0], 8), 'Asleep', [23, 8]),
  ] });
  add({ name: 'Eddie Fenn', role: 'deck steward', bio: 'Can read the weather from passengers’ hats.', costume: stewardWhite({ hair: '#c9a160' }), routine: [
    { at: [prom.x0 + 3, prom.yF, 1.3], act: 'carry', prop: 'box', face: 'in', label: 'Setting out deck chairs and rugs', when: [8, 9.5], dur: [30, 40] },
    { at: [prom.x0 + 9, prom.yF, 1.3], act: 'carryHigh', prop: 'tray', face: 'in', label: 'Serving soup on deck at eleven', when: [10.8, 11.6], dur: [30, 40] },
    { at: [prom.x0 + 12, prom.yF, 1.3], act: 'carryHigh', prop: 'tray', face: 'in', label: 'Serving soup', when: [10.8, 11.6], dur: [30, 40] },
    { at: [prom.x0 + 9, prom.yF, 1.3], act: 'carryHigh', prop: 'tray', face: 'in', label: 'Afternoon tea on deck at four', when: [15.9, 16.8], dur: [30, 40] },
    { at: [prom.x0 + 5, prom.yF, 1.3], act: 'carry', prop: 'box', face: 'in', label: 'Collecting the rugs at dusk', when: [18.5, 19.5], dur: [30, 40] },
    { at: [prom.x1 - 1.5, prom.yF, 1.3], act: 'handsBehind', face: 'out', label: 'Keeping an eye on his deck', when: [9.5, 18.5], dur: [40, 60] },
    bedStep(B(bunksW[1], 10), 'Asleep', [21, 7]),
  ] });
  add({ name: 'Billy Larkin', role: 'bell boy, aged 15', bio: 'Saving his dog-walking tips for a bicycle.', costume: bellboy({ hair: '#8d5a2b' }), H: 1.55, routine: [
    { at: [mainhall.x0 + 8, mainhall.yF, 1.2], act: 'carry', prop: 'paper', face: 'out', label: 'Carrying telegrams round the Main Hall', when: [9, 15], dur: [30, 50] },
    { at: [kennels.x0 + 3, kennels.yF, 4.0], act: 'walk', prop: 'rope', face: 1, label: 'Being towed round the run by three dogs', when: [15, 16], dur: [50, 70], tag: 'dogs' },
    { at: [mainhall.x0 + 23, mainhall.yF, 1.4], act: 'stand', face: 'out', label: 'Running errands by the lifts', when: [16, 20], dur: [30, 50] },
    seatStep(S(messC, 25), 'sitEat', 'Supper in the crew mess', [20, 21]),
    bedStep(B(bunksW[1], 12), 'Asleep', [21.5, 8]),
  ] });
  add({ name: 'Ivy Crouch', role: 'Tourist stewardess', bio: 'Seasick every first night out.', costume: stewardess({ hair: '#b07a3c' }), routine: [
    spotStep(SP(cabin2[4], 1), 'sweep', 'Making up berths', [9, 11], { face: 'in' }),
    spotStep(SP(cabin2[4], 3), 'sweep', 'Making up berths', [9, 11], { face: 'in' }),
    spotStep(SP(cabin2[4], 5), 'talk', 'Bringing dry biscuits to a seasick passenger', [11, 13], { face: 'in' }),
    seatStep(S(room('mess'), 35), 'sitEat', 'Dinner', [13, 14]),
    spotStep(SP(cabin2[4], 2), 'workBench', 'Turning down berths', [19, 21], { face: 'in' }),
    bedStep(B(bunksW[0], 10), 'Asleep', [22, 7]),
  ] });
  add({ name: 'Ted Harrow', role: 'lift attendant', bio: 'Knows the deck letters in his sleep.', costume: bellboy({ top: '#1e2438', coatColor: '#1e2438', hatColor: '#1e2438', build: 1.0, hair: '#4a3020' }), routine: [
    { at: [mainhall.x0 + 24, mainhall.yF, 1.4], act: 'stand', face: 'out', label: 'Working the lift by the Main Hall', when: [8, 12], dur: [60, 100] },
    seatStep(S(messC, 28), 'sitEat', 'Dinner', [12, 12.6]),
    { at: [mainhall.x0 + 24, mainhall.yF, 1.4], act: 'stand', face: 'out', label: 'Working the lift: “Going down, B deck”', when: [12.6, 20], dur: [60, 100] },
    bedStep(B(bunksW[1], 14), 'Asleep', [22, 7.5]),
  ] });
  // --- galley and stores
  add({ name: 'Marcel Dufour', role: 'sauce cook', bio: 'Trained in Lyon.', costume: chef({ hair: '#2b1d14', beard: '#2b1d14' }), routine: [
    spotStep(SP(kitchen, 1), 'stir', 'Making stocks', [8, 12], { dur: [60, 100] }),
    spotStep(SP(kitchen, 2), 'stir', 'Sauces for luncheon', [12, 15], { dur: [60, 100] }),
    seatStep(S(room('mess'), 38), 'sitRead', 'Resting', [15, 17]),
    spotStep(SP(kitchen, 1), 'stir', 'Sauces for dinner', [17, 21.5], { dur: [60, 100] }),
    bedStep(B(crewAft[3], 1), 'Asleep', [22.5, 7.5]),
  ] });
  add({ name: 'George Tandy', role: 'baker', bio: 'Always has flour in his eyebrows.', costume: chef({ hat: 'flat', hatColor: '#f4f2ec', hair: '#d8c9a8' }), routine: [
    spotStep(SP(kitchen, 10), 'workBench', 'Baking bread through the night', [0, 5], { dur: [80, 120] }),
    spotStep(SP(kitchen, 10), 'workBench', 'Rolls for breakfast', [5, 6.5], { dur: [60, 90] }),
    bedStep(B(crewAft[3], 3), 'Asleep through the day', [7, 21]),
    seatStep(S(room('mess'), 40), 'sitEat', 'His breakfast at supper time', [21, 23.8]),
  ] });
  add({ name: 'Wilf Sparkes', role: 'butcher', bio: 'Supports West Ham.', costume: chef({ hat: null, apron: '#d8c8c8', hair: '#6b4428' }), routine: [
    spotStep(SP(alley[0], 0), 'hammer', 'Cutting joints in the butcher’s shop', [6, 11], { dur: [60, 100] }),
    spotStep(SP(cold, 0), 'carryShoulder', 'Fetching a carcass from the frozen meat room', [11, 12], { prop: 'sack', dur: [30, 40] }),
    spotStep(SP(alley[0], 0), 'hammer', 'Back at the block', [12, 16], { dur: [60, 100] }),
    seatStep(S(room('mess'), 41), 'sitEat', 'Supper', [17, 18]),
    bedStep(B(crewAft[3], 5), 'Asleep', [21, 5.5]),
  ] });
  add({ name: 'Danny Rowe', role: 'kitchen apprentice, aged 16', bio: 'Dreams of being a chef.', costume: chef({ hat: null, hair: '#c9a160', build: 0.85 }), H: 1.6, routine: [
    spotStep(SP(alley[1], 0), 'workBench', 'Turning every egg in the egg store', [7, 9], { dur: [80, 120] }),
    spotStep(SP(alley[1], 1), 'workBench', 'Turning the lettuces in the vegetable room', [9, 10], { dur: [60, 90] }),
    spotStep(SP(kitchen, 5), 'sitWork', 'Peeling potatoes', [10, 12], { dur: [60, 90] }),
    spotStep(SP(kitchen, 6), 'workBench', 'Washing pans', [12, 16], { dur: [60, 90] }),
    seatStep(S(room('mess'), 44), 'sitEat', 'Supper', [17, 18]),
    bedStep(B(crewAft[3], 7), 'Asleep', [21, 6.5]),
  ] });
  add({ name: 'Samuel Abrahams', role: 'kosher cook', bio: 'Lights candles in his cabin on Friday nights.', costume: chef({ hair: '#2b1d14', beard: '#3a2a20' }), routine: [
    spotStep(SP(alley[1], 2), 'workBench', 'Preparing meat in the kosher store', [8, 10], { dur: [60, 90] }),
    spotStep(SP(kitchen, 3), 'stir', 'Cooking with his own separate pans', [10, 13], { dur: [60, 100] }),
    { at: [dining3.x0 + 6, dining3.yF, 1.2], act: 'talk', face: 'in', label: 'Checking the kosher table in the Third Class dining room', when: [13, 13.5], dur: [20, 30] },
    spotStep(SP(kitchen, 3), 'stir', 'Cooking dinner', [16, 20], { dur: [60, 100] }),
    bedStep(B(crewAft[3], 9), 'Asleep', [21, 7]),
  ] });
  add({ name: 'Horace Bell', role: 'printer', bio: 'Ink-stained thumbs.', costume: { top: '#e8e4d8', sleeves: 'short', bottom: '#4a4a52', apron: '#6a6a62', hair: '#9a9a9a' }, routine: [
    spotStep(SP(alley[0], 1), 'workBench', 'Setting tomorrow’s menus in type', [9, 12], { dur: [60, 100] }),
    spotStep(SP(alley[0], 2), 'crank', 'Printing the ship’s newspaper', [13, 15], { dur: [60, 100] }),
    spotStep(SP(bureau, 2), 'talk', 'Delivering proofs to the purser', [15, 15.3], { prop: 'paper', dur: [20, 30] }),
    spotStep(SP(alley[0], 1), 'crank', 'Pulling tomorrow’s menu off the press', [23, 0.8], { prop: 'paper', dur: [60, 100] }),
    bedStep(B(crewAft[3], 11), 'Asleep', [1, 8.5]),
    seatStep(S(room('mess'), 47), 'sitEat', 'Supper', [18, 19]),
  ] });
  add({ name: 'Gladys Pratt', role: 'hairdresser', bio: 'Copies film stars’ hairstyles out of magazines.', costume: { top: '#f2ece0', dress: 'knee', dressColor: '#e8e0d0', hair: '#c9a160', hairStyle: 'short' }, routine: [
    spotStep(SP(salon, 0), 'workBench', 'Waving and setting hair', [9, 12], { face: 1 }),
    seatStep(S(room('mess'), 50), 'sitEat', 'Dinner', [12, 13]),
    spotStep(SP(salon, 2), 'workBench', 'Evening sets before dinner', [16, 19], { face: 1 }),
    bedStep(B(bunksW[0], 12), 'Asleep', [22, 7.5]),
  ] });
  add({ name: 'Ron Marsh', role: 'pool attendant', bio: 'A Channel swimmer in his day.', costume: { top: '#f4f2ec', bottom: '#f4f2ec', sleeves: 'short', hair: '#4a3020' }, routine: [
    spotStep(SP(pool, 4), 'stand', 'Handing out towels', [7, 10], { prop: 'box' }),
    spotStep(SP(pool, 5), 'handsBehind', 'Watching the swimmers', [10, 13]),
    { at: [pool.x1 - 1.0, DK.C - 0.4, 2.0], act: 'workBench', face: 'in', label: 'Seeing to the steam for the Turkish bath', when: [13, 14], dur: [40, 60] },
    spotStep(SP(pool, 4), 'handsBehind', 'Watching the swimmers', [14, 19]),
    bedStep(B(bunksW[1], 16), 'Asleep', [22, 6.5]),
  ] });
  add({ name: 'Jack Penrose', role: 'gymnasium instructor', bio: 'Teaches bankers to use the rowing machine.', costume: { top: '#f4f2ec', sleeves: 'short', bottom: '#f2ece0', hair: '#2b1d14' }, routine: [
    spotStep(SP(gym, 1), 'point', 'Showing a passenger the electric horse', [9, 12]),
    spotStep(SP(tennis, 4), 'handsBehind', 'Umpiring deck tennis', [15, 16]),
    spotStep(SP(squash, 0), 'tennis', 'A game of squash with a passenger', [16, 16.8]),
    spotStep(SP(gym, 1), 'point', 'Evening class', [17, 19]),
    bedStep(B(bunksW[0], 14), 'Asleep', [22, 7.5]),
  ] });
  add({ name: 'Alf Dyer', role: 'livestock attendant', bio: 'Talks to the dogs in a Hampshire accent.', costume: { top: '#7a5a3a', coat: 'jacket', coatColor: '#7a5a3a', bottom: '#4a4038', hat: 'flat', hatColor: '#4a4038', hair: '#9a9a9a' }, routine: [
    spotStep(SP(kennels, 0), 'kneel', 'Feeding the dogs in the kennels', [7, 8]),
    { at: [kennels.x0 + 6, kennels.yF, 4.5], act: 'walk', face: 1, label: 'Exercising the dogs on the run', when: [8, 10], dur: [40, 60] },
    { at: [kennels.x0 + 2, kennels.yF, 4.5], act: 'walk', face: -1, label: 'Exercising the dogs', when: [8, 10], dur: [40, 60] },
    spotStep(SP(kennels, 0), 'sweep', 'Cleaning out the pens', [14, 15]),
    spotStep(SP(kennels, 1), 'stand', 'Keeping company with the dogs', [10, 14]),
    spotStep(SP(kennels, 1), 'stand', 'Evening feed', [17, 18]),
    bedStep(B(bunksS[0], 9), 'Asleep', [21, 6.5]),
  ] });
  add({ name: 'Dr. Clement Ashby', role: 'ship’s surgeon', bio: 'Prescribes dry biscuits and fresh air.', costume: navyOfficer({ hat: null, hair: '#9a9a9a' }), routine: [
    spotStep(SP(hosp, 0), 'talk', 'Morning surgery', [9, 11]),
    spotStep(SP(cabin3[1], 2), 'talk', 'Visiting a seasick passenger', [11, 13], { face: 'in' }),
    spotStep(SP(cabin1[2], 1), 'talk', 'Visiting a seasick passenger', [11, 13], { face: 'in' }),
    seatStep(S(rest, 30), 'sitEat', 'Dining at his table in the Main Restaurant', [19.5, 21.5]),
    bedStep(B(off, 2), 'Asleep', [23, 7.5]),
    spotStep(SP(hosp, 1), 'workBench', 'Afternoon surgery', [14, 17]),
  ] });
  add({ name: 'Nurse Agnes Lowry', role: 'nursing sister', bio: 'Knits through the night duty.', costume: stewardess({ top: '#3a5a8a', dressColor: '#3a5a8a', hair: '#6b4428' }), routine: [
    spotStep(SP(hosp, 1), 'workBench', 'Changing dressings in the wards', [20, 2]),
    spotStep(SP(iso, 0), 'talk', 'Looking in on a child with measles in the isolation ward', [2, 2.6]),
    seatStep(S(hosp, 0), 'sitWork', 'Knitting on night duty', [2.6, 7]),
    bedStep(B(bunksW[0], 16), 'Asleep', [9, 17]),
    seatStep(S(room('mess'), 53), 'sitEat', 'Breakfast at teatime', [17.5, 19]),
  ] });
  add({ name: 'Leo Fairweather', role: 'band pianist', bio: 'Writes songs he never shows anyone.', costume: { top: '#f2ece0', coat: 'jacket', coatColor: '#16161a', bottom: '#16161a', hair: '#2b1d14' }, routine: [
    seatStep(lounge1.anch.seats.find((q) => q.piano), 'piano', 'Playing at afternoon tea in the Main Lounge', [15.5, 16.8]),
    seatStep(ball.anch.seats.find((q) => q.piano), 'piano', 'The tea-dance in the Ballroom', [16.8, 18]),
    seatStep(S(room('mess'), 55), 'sitEat', 'Supper', [18, 19]),
    seatStep(lounge1.anch.seats.find((q) => q.piano), 'piano', 'The evening concert in the Main Lounge', [21, 22.2]),
    seatStep(ver.anch.seats.find((q) => q.piano), 'piano', 'A late set in the Verandah Grill', [22.2, 1.5]),
    bedStep(B(bunksW[1], 18), 'Asleep', [2, 11]),
  ] });
  // --- passengers
  const w1 = cabin1[3], w1b = B(w1, 0);
  add({ name: 'Mrs. Eleanor Whitcombe', role: 'Cabin Class passenger', bio: 'On her way to see her first grandchild, in Boston.', costume: { skin: '#f1c9a5', hair: '#d8c9a8', hairStyle: 'bun', top: '#5a4a6a', dress: 'long', dressColor: '#5a4a6a' }, routine: [
    seatStep(S(w1, 0), 'sitEat', 'Breakfast in her stateroom', [8, 9]),
    seatStep(prom.anch.seats[3], 'sitRead', 'Reading in a deck chair on the promenade', [9.5, 12.5]),
    seatStep(S(rest, 12), 'sitEat', 'Luncheon in the Main Restaurant', [13, 14.5]),
    seatStep(S(gallery, 3), 'sitRead', 'Writing letters in the Long Gallery', [15, 18]),
    seatStep(S(ver, 6), 'sitEat', 'Dinner in the Verandah Grill', [19.5, 21.5]),
    bedStep(w1b, 'Asleep', [22.5, 8]),
  ] });
  const k1 = cabin1[7];
  add({ name: 'Mr. Howard Kessler', role: 'Cabin Class passenger', bio: 'Sells typewriters in Chicago.', costume: passenger(R, 1, 'm', false), routine: [
    seatStep(S(smoke1, 0), 'sitTalk', 'A game of cards in the Smoking Room', [10, 13], { prop: 'cards' }),
    seatStep(S(rest, 14), 'sitEat', 'Luncheon', [13, 14.5]),
    seatStep(gym.anch.seats.find((q) => q.horse), 'riding', 'Twenty minutes on the electric horse', [15, 15.5]),
    seatStep(S(lounge1, 5), 'sitTalk', 'At the concert in the Main Lounge', [21, 22.5]),
    seatStep(S(rest, 16), 'sitEat', 'Dinner', [19.5, 21]),
    bedStep(B(k1, 0), 'Asleep', [23, 8]),
    seatStep(S(k1, 0), 'sitRead', 'Reading the ship’s newspaper', [8, 10]),
  ] });
  add({ name: 'Peggy Kessler', role: 'Cabin Class passenger, aged 9', bio: 'Has given every fish in the aquarium a name.', costume: child(R, 1, 'f'), routine: [
    spotStep(play1.anch.spots.find((q) => q.aquarium), 'point', 'Naming the fish in the playroom aquarium', [9.5, 11.5]),
    spotStep(SP(play1, 1), 'stand', 'Queueing for the slide', [11.5, 13]),
    { at: [pool.x0 + 6, DK.C - 0.9, 2.5], act: 'swim', face: 1, label: 'Swimming in the Cabin Class pool', when: [15, 16], dur: [60, 90] },
    spotStep(obs.anch.spots.find((q) => q.window), 'stand', 'Watching the bow from the Observation Bar windows', [17, 17.4]),
    bedStep(B(k1, 1), 'Asleep', [20, 8]),
    seatStep(S(rest, 15), 'sitEat', 'Luncheon with her father', [13, 14.5]),
  ] });
  const lane = cabin2[5];
  add({ name: 'Miss Dorothy Lane', role: 'Tourist passenger, schoolteacher', bio: 'Her first trip abroad; keeps a diary.', costume: { skin: '#f1c9a5', hair: '#6b4428', hairStyle: 'bun', top: '#4a6a8a', dress: 'knee', dressColor: '#4a6a8a', stockings: '#d8c0a8' }, routine: [
    seatStep(lib2.anch.seats.find((q) => q.write), 'sitWrite', 'Writing letters in the library', [9, 11]),
    { at: [tpool.x0 + 5, DK.F - 0.5, 2.0], act: 'swim', face: 1, label: 'A swim in the Tourist pool', when: [11, 12], dur: [60, 90] },
    seatStep(S(dining2, 6), 'sitEat', 'Luncheon at the second sitting', [13.5, 14.5]),
    seatStep(S(lounge2, 3), 'sitWrite', 'Writing up her diary in the lounge', [15, 18]),
    seatStep(S(dining2, 8), 'sitEat', 'Dinner, second sitting', [19.75, 21]),
    bedStep(B(lane, 0), 'Asleep', [22.5, 7.5]),
  ] });
  const kow = cabin3[2];
  add({ name: 'Jan Kowalczyk', role: 'Third Class passenger', bio: 'Going to join his son in Pittsburgh.', costume: Object.assign(passenger(R, 3, 'm', false), { hat: 'flat', beard: '#8a8a8a' }), routine: [
    seatStep(S(garden, 0), 'sitTalk', 'Coffee in the Garden Lounge with his wife', [9.5, 11.5]),
    seatStep(S(dining3, 4), 'sitEat', 'Dinner in the Third Class dining room', [12, 13]),
    { at: [well.x0 + 5, DK.M, 7], act: 'lookout', face: -1, label: 'Watching the sea from the forward deck', when: [14, 15.5], dur: [40, 60] },
    seatStep(S(cinema, 10), 'sit', 'At the pictures in the Third Class cinema', [19.5, 21]),
    bedStep(B(kow, 0), 'Asleep', [22, 7]),
  ] });
  add({ name: 'Mrs. Kowalczyk', role: 'Third Class passenger', bio: 'Has sewn the family’s savings into her coat lining.', costume: Object.assign(passenger(R, 3, 'f', false), { hat: 'kerchief', hatColor: '#7a3a2a' }), routine: [
    seatStep(S(garden, 1), 'sitTalk', 'Coffee in the Garden Lounge', [9.5, 11.5]),
    seatStep(S(dining3, 5), 'sitEat', 'Dinner', [12, 13]),
    seatStep(S(garden, 4), 'sitWork', 'Darning socks', [14, 18]),
    seatStep(S(cinema, 11), 'sit', 'At the pictures', [19.5, 21]),
    bedStep(B(kow, 1), 'Asleep', [22, 7]),
  ] });
  const nol = cabin3[0];
  add({ name: 'Bridget Nolan', role: 'Third Class passenger', bio: 'Carries a rosary and a photograph.', costume: Object.assign(passenger(R, 3, 'f', false), { hair: '#7a2c14', hat: null }), routine: [
    seatStep(S(smoke3, 1), 'sitTalk', 'A hand of cards in the Third Class smoking room', [10, 12], { prop: 'cards' }),
    { at: [well.x0 + 9, DK.M, 7.5], act: 'stand', face: -1, label: 'Watching the sea from the forward deck', when: [14, 15], dur: [40, 60] },
    bedStep(B(nol, 0), 'Seasick in her berth, with a plate of dry biscuits', [15, 18]),
    seatStep(S(dining3, 9), 'sitEat', 'A little supper', [18, 19]),
    bedStep(B(nol, 0), 'Asleep', [21, 7.5]),
  ] });
  add({ name: 'Ruth Adler', role: 'Third Class passenger', bio: 'Teaching herself English from a phrasebook.', costume: Object.assign(passenger(R, 3, 'f', false), { hat: null, hair: '#2b1d14' }), routine: [
    seatStep(S(syn, 0), 'sitRead', 'Morning prayers in the synagogue', [7.5, 8.2], { prop: 'book' }),
    spotStep(SP(play3, 0), 'talk', 'Minding her brothers in the playroom', [10, 12]),
    seatStep(S(dining3, 1), 'sitEat', 'Kosher dinner', [12, 13]),
    seatStep(cinema.anch.seats[cinema.anch.seats.length - 1], 'sitRead', 'Studying her phrasebook in the library', [14, 17], { prop: 'book' }),
    bedStep(B(cabin3[1], 0), 'Asleep', [21.5, 7]),
  ] });
  for (let i = 0; i < 2; i++) extra(at(SP(play3, 0)).map((v, j) => v + (j === 0 ? 0.8 + i * 0.6 : j === 2 ? 0.4 * i : 0)), i ? 'wave' : 'stand', child(R, 3, 'm'), 'out', [9, 19], { role: 'Third Class passenger, aged 6', label: 'Playing with the rocking horse' });
  add({ name: 'Colonel Rupert Ainsley', role: 'Cabin Class passenger (retired)', bio: 'Complains about the vibration.', costume: Object.assign(passenger(R, 1, 'm', false), { hair: '#e8e4dc', beard: '#e8e4dc' }), routine: [
    spotStep(SP(tennis, 0), 'tennis', 'Deck tennis on the Sports deck', [10, 11]),
    spotStep(SP(kennels, 0), 'kneel', 'Visiting his spaniel in the kennels', [11, 11.5]),
    seatStep(S(rest, 20), 'sitEat', 'Luncheon', [13, 14.5]),
    seatStep(smoke1.anch.seats[2], 'sitDrink', 'A whisky by the coal fire in the Smoking Room', [21, 23.5], { prop: 'glass' }),
    seatStep(S(rest, 22), 'sitEat', 'Dinner', [19.5, 21]),
    bedStep(B(cabin1[8], 0), 'Asleep', [23.5, 8]),
  ] });
  const kitty = cabin2[6];
  add({ name: 'Kitty Marsh', role: 'Tourist passenger, dance student', bio: 'Hopes for a job on Broadway.', costume: { skin: '#f1c9a5', hair: '#c9a160', hairStyle: 'short', top: '#c84a5a', dress: 'knee', dressColor: '#c84a5a', stockings: '#e8d0c0' }, routine: [
    spotStep(SP(lounge2, 0), 'dance', 'Dancing in the Tourist Lounge', [15, 17]),
    spotStep(smoke2.anch.spots.find((q) => q.map), 'point', 'Watching the magnetic ship creep across the steel map', [17, 17.4]),
    { at: [tpool.x0 + 7, DK.F - 0.5, 3.6], act: 'swim', face: -1, label: 'A swim in the Tourist pool', when: [11, 12], dur: [60, 90] },
    seatStep(S(dining2, 12), 'sitEat', 'Dinner, first sitting', [18.5, 19.7]),
    spotStep(SP(lounge2, 2), 'dance', 'The evening dance', [20.5, 23]),
    bedStep(B(kitty, 0), 'Asleep', [23.5, 8.5]),
  ] });
  add({ name: 'Tom Okafor', role: 'Tourist passenger, medical student', bio: 'Going to a summer course in Philadelphia.', costume: Object.assign(passenger(R, 2, 'm', false), { skin: '#6b4026', hair: '#1a1410' }), routine: [
    seatStep(lib2.anch.seats[1], 'sitRead', 'Studying in the library', [9, 12], { prop: 'book' }),
    seatStep(S(dining2, 2), 'sitEat', 'Luncheon', [12.25, 13.4]),
    spotStep(SP(opendeck, 3), 'lookout', 'Watching the wake from the after deck', [16, 17]),
    seatStep(S(dining2, 4), 'sitEat', 'Dinner', [18.5, 19.7]),
    seatStep(S(smoke2, 3), 'sitTalk', 'Talking medicine in the smoking room', [20, 22.5]),
    bedStep(B(kitty, 2), 'Asleep', [23, 7.5]),
  ] });

  // ------------------------------------------------------------------ crowds
  const meals = { c1: [[8, 10], [13, 14.7], [19.5, 22]], t: [[8, 10], [12.25, 14.6], [18.5, 21]], t3: [[7.5, 9], [12, 13.5], [18, 19.5]] };
  const inAny = (wins) => (h) => wins.some(([a, b]) => XS.math.inHours(h, a, b));
  const seatCrowd = (r, n, cls, show, act, o = {}) => {
    const seats = r.anch.seats.filter((q) => !q.piano && !q.horse && !q.row && (o.filter ? o.filter(q) : true));
    const used = new Set(o.skip || []);
    let made = 0;
    for (let i = 0; made < n && i < seats.length * 3; i++) {
      const idx = Math.floor((i * 7.31 + (o.off || 0)) % seats.length);
      if (used.has(idx)) continue;
      used.add(idx);
      const q = seats[idx];
      const sex = R() < 0.5 ? 'f' : 'm';
      const a = Array.isArray(act) ? act[made % act.length] : act;
      extra(at(q), a, o.cos ? o.cos(sex) : passenger(R, cls, sex, o.evening), q.face, show, { seat: q.seat, role: o.role || (cls === 1 ? 'Cabin Class passenger' : cls === 2 ? 'Tourist passenger' : 'Third Class passenger'), label: o.label, prop: o.prop });
      made++;
    }
  };
  seatCrowd(rest, 34, 1, inAny(meals.c1), ['sitEat', 'sitTalk', 'sitEat', 'sitDrink'], { label: 'Dining in the Main Restaurant', skip: [12, 14, 15, 16, 20, 22, 30] });
  seatCrowd(restB, 8, 1, inAny(meals.c1), ['sitEat', 'sitTalk'], { label: 'Dining' });
  seatCrowd(room('privdine'), 4, 1, inAny([[19.5, 22]]), ['sitEat', 'sitTalk'], { label: 'A private dinner party', evening: true });
  seatCrowd(dining3, 20, 3, inAny(meals.t3), ['sitEat', 'sitTalk', 'sitEat'], { label: 'A meal in the Third Class dining room', skip: [1, 4, 5, 9] });
  seatCrowd(dining2, 20, 2, inAny(meals.t), ['sitEat', 'sitTalk', 'sitEat'], { label: 'A meal in the Tourist Dining Room', skip: [2, 4, 6, 8, 12] });
  seatCrowd(lounge1, 11, 1, inAny([[10, 12.5], [15.5, 18.5], [21, 23.8]]), ['sitTalk', 'sitDrink', 'sitRead', 'sit'], { skip: [5], label: 'In the Main Lounge' });
  seatCrowd(room('lounge1b'), 4, 1, inAny([[10, 12.5], [15.5, 18.5], [21, 23.8]]), ['sitTalk', 'sitRead']);
  seatCrowd(smoke1, 6, 1, inAny([[10, 1.5]]), ['sitTalk', 'sitDrink', 'sitRead'], { skip: [0, 2], cos: (s) => passenger(R, 1, 'm', false), label: 'In the Smoking Room' });
  seatCrowd(gallery, 6, 1, inAny([[10, 18.5], [21, 23]]), ['sitRead', 'sitTalk'], { skip: [3] });
  seatCrowd(ball, 5, 1, inAny([[16, 18.5], [21.5, 0.5]]), ['sitDrink', 'sitTalk'], { label: 'Watching the dancing' });
  seatCrowd(ver, 10, 1, inAny([[12, 15], [19, 1.5]]), ['sitEat', 'sitTalk', 'sitDrink'], { skip: [6], evening: true, label: 'In the Verandah Grill' });
  seatCrowd(obs, 7, 1, inAny([[11, 14], [17, 1]]), ['sitDrink', 'sitTalk'], { label: 'A cocktail in the Observation Bar' });
  seatCrowd(prom, 9, 1, inAny([[9.5, 18.5]]), ['sitRead', 'sleepSit', 'sitTalk'], { skip: [3], label: 'Resting in a deck chair' });
  seatCrowd(room('sundeck', 0), 4, 1, inAny([[9.5, 18]]), ['sitRead', 'sleepSit']);
  seatCrowd(rooms('sundeck')[2], 4, 1, inAny([[9.5, 18]]), ['sitRead', 'sitTalk']);
  seatCrowd(opendeck, 6, 2, inAny([[9.5, 18.5]]), ['sitRead', 'sleepSit', 'sitTalk'], { label: 'On the after deck' });
  seatCrowd(prom2, 6, 2, inAny([[9.5, 18.5]]), ['sitRead', 'sleepSit'], { label: 'Resting in a deck chair' });
  seatCrowd(garden, 10, 3, inAny([[9, 22]]), ['sitTalk', 'sitWork', 'sitRead'], { skip: [0, 1, 4] });
  seatCrowd(smoke3, 9, 3, inAny([[9.5, 23]]), ['sitTalk', 'sitDrink', 'sitTalk'], { skip: [1], label: 'In the Third Class smoking room' });
  seatCrowd(cinema, 12, 3, inAny([[19.5, 21.5]]), ['sit'], { skip: [2, 10, 11], filter: (q) => q.face === 1, label: 'At the pictures' });
  seatCrowd(syn, 4, 3, inAny([[7, 8.5], [18, 19]]), ['sitRead'], { skip: [0], prop: 'book', label: 'At prayer in the synagogue' });
  seatCrowd(lounge2, 10, 2, inAny([[9.5, 23]]), ['sitTalk', 'sitDrink', 'sitRead'], { skip: [3], label: 'In the Tourist Lounge' });
  seatCrowd(smoke2, 7, 2, inAny([[10, 23.5]]), ['sitTalk', 'sitDrink'], { skip: [3], label: 'In the Tourist Smoking Room' });
  seatCrowd(lib2, 4, 2, inAny([[9, 22]]), ['sitRead', 'sitWrite'], { skip: [1], prop: 'book' });
  seatCrowd(messC, 8, 0, inAny([[7, 8.5], [12, 13.5], [17, 18.5]]), ['sitEat', 'sitTalk'], { cos: (s) => (R() < 0.5 ? seaman() : stewardWhite()), role: 'crew', label: 'A meal in the crew mess' });
  seatCrowd(pig, 5, 0, inAny([[17, 23.5]]), ['sitDrink', 'sitTalk'], { cos: () => (R() < 0.5 ? fireman() : seaman({ hat: null })), role: 'crew', label: 'A pint in the Pig and Whistle', skip: [3] });
  seatCrowd(room('salon'), 2, 1, inAny([[9, 12], [16, 19]]), ['sitRead'], { cos: () => passenger(R, 1, 'f', false), label: 'Having her hair set' });
  // Dancers, band and swimmers.
  const dancers = (r, show, cls) => { r.anch.spots.filter((q) => q.dance).slice(0, 6).forEach((q, i) => extra(at(q), 'dance', passenger(R, cls, i % 2 ? 'f' : 'm', true), q.face, show, { role: cls === 1 ? 'Cabin Class passenger' : 'Tourist passenger', label: 'Dancing' })); };
  dancers(ball, inAny([[16.8, 18]]), 1);
  dancers(ver, inAny([[22, 1.5]]), 1);
  dancers(lounge2, inAny([[20.5, 23]]), 2);
  for (const q of ball.anch.spots.filter((s) => s.band)) extra(at(q), q.band === 'violin' ? 'violin' : 'stand', { top: '#f2ece0', coat: 'jacket', coatColor: '#16161a', bottom: '#16161a' }, q.face, inAny([[16.8, 18]]), { role: 'musician', label: 'Playing for the tea-dance', prop: q.band === 'violin' ? 'violin' : null });
  for (const r of [pool, tpool]) r.anch.spots.filter((q) => q.swim).forEach((q, i) => extra([q.x, q.y, q.z], 'swim', Object.assign(passenger(R, r === pool ? 1 : 2, i % 2 ? 'f' : 'm', false), { top: i % 2 ? '#2a4a8a' : '#1a1a2a', bottom: i % 2 ? '#2a4a8a' : '#1a1a2a', coat: null, dress: null, hat: i % 2 ? 'cloche' : null, hatColor: '#f2ece0', sleeves: 'short' }), q.face, inAny([[7, 19.5]]), { role: 'swimmer', label: 'Swimming' }));
  // Tennis and squash players, the gym.
  tennis.anch.spots.filter((q) => q.tennis).slice(1).forEach((q, i) => extra(at(q), 'tennis', Object.assign(passenger(R, 1, i % 2 ? 'f' : 'm', false), { top: '#f4f2ec', coat: null, bottom: '#f2ece0', dressColor: '#f4f2ec' }), q.face, inAny([[9.5, 12.5], [14.5, 18]]), { role: 'Cabin Class passenger', label: 'Playing deck tennis' }));
  extra(at(SP(squash, 1)), 'tennis', Object.assign(passenger(R, 1, 'm', false), { top: '#f4f2ec', coat: null, bottom: '#f2ece0' }), 'in', inAny([[10, 12], [16, 17]]), { role: 'Cabin Class passenger', label: 'A game of squash' });
  extra(at(gym.anch.spots.find((q) => q.punch)), 'boxing', Object.assign(passenger(R, 1, 'm', false), { top: '#f4f2ec', coat: null, sleeves: 'short' }), 1, inAny([[9, 12], [16, 18]]), { role: 'Cabin Class passenger', label: 'At the punch ball' });
  extra(at(gym.anch.seats.find((q) => q.row)), 'sitRow', Object.assign(passenger(R, 1, 'm', false), { top: '#f4f2ec', coat: null }), 1, inAny([[9, 12], [16, 18]]), { seat: 0.3, role: 'Cabin Class passenger', label: 'On the rowing machine' });
  // Officers of the watch and quartermasters for the other watches.
  extra(at(SP(wh, 0)), 'wheel', seaman({ hat: 'peaked', hatColor: '#1a1c28' }), -1, inAny([[0, 8], [12, 20]]), { role: 'quartermaster', label: 'At the wheel' });
  extra(at(SP(wh, 1)).map((v, j) => v + (j === 0 ? 1.0 : 0)), 'handsBehind', navyOfficer(), -1, inAny([[4, 12], [16, 24]]), { role: 'officer of the watch', label: 'Keeping the watch' });
  // Stewards serving in the dining rooms at meal times, cooks in the galleys.
  for (let i = 0; i < 4; i++) extra([rest.x0 + 3 + i * 5.5, rest.yF, 1.2], i % 2 ? 'carryHigh' : 'pour', stewardWhite(), 'out', inAny(meals.c1), { prop: i % 2 ? 'tray' : 'jug', role: 'restaurant steward', label: 'Serving at table' });
  for (let i = 0; i < 2; i++) extra([dining2.x0 + 4 + i * 9, dining2.yF, 1.2], 'carryHigh', stewardWhite(), 'out', inAny(meals.t), { prop: 'tray', role: 'Tourist steward', label: 'Serving at table' });
  for (let i = 0; i < 2; i++) extra([dining3.x0 + 5 + i * 10, dining3.yF, 1.2], 'carryHigh', stewardWhite(), 'out', inAny(meals.t3), { prop: 'tray', role: 'Third Class steward', label: 'Serving at table' });
  [0, 4, 7, 8, 9].forEach((si) => extra(at(SP(kitchen, si)), si === 7 || si === 8 ? 'workBench' : 'stir', chef(), SP(kitchen, si).face, inAny([[6, 22]]), { role: 'cook', label: 'Cooking in the main kitchens' }));
  [0, 2].forEach((si) => extra(at(SP(galley3, si)), 'stir', chef(), 'in', inAny([[6, 20]]), { role: 'Third Class cook', label: 'Cooking in the Third Class galley' }));
  extra(at(obs.anch.spots.find((q) => q.barman)), 'pour', stewardWhite(), 'out', inAny([[11, 1]]), { prop: 'glass', role: 'barman', label: 'Mixing a cocktail' });
  extra(at(SP(smoke3, 0)), 'pour', stewardWhite(), 'out', inAny([[9.5, 23]]), { prop: 'jug', role: 'Third Class barman' });
  extra(at(SP(pig, 2)), 'pour', fireman({ sleeves: 'long', top: '#e8e4d8' }), 'out', inAny([[17, 23.5]]), { prop: 'mug', role: 'crew barman' });
  // The darts match (vignette): two more players.
  extra(at(SP(pig, 1)), 'darts', seaman({ hat: null }), -1, inAny([[17, 23.5]]), { role: 'able seaman', label: 'A darts match in the Pig and Whistle' });
  // Firemen and greasers on watch below in every boiler room, round the clock.
  for (const r of rooms('yarrow').concat(rooms('scotch'))) {
    if (r === br3) continue;
    extra([r.aisle - 1.0, r.yF, 1.3], 'workBench', fireman(), -1, () => true, { role: 'fireman', label: 'Tending the oil burners' });
  }
  extra([br3.aisle + 1.0, br3.yF, 2.6], 'handsBehind', fireman(), 1, () => true, { role: 'fireman', label: 'Watching the flames through a peephole' });
  for (const r of [fer, aer]) extra([r.platform.x + 2.2, r.platform.y, 1.6], 'handsBehind', boilerSuit(), 'in', () => true, { role: 'engineer on watch', label: 'Watching the revolution counters' });
  extra([tg1.x0 + 4, tg1.yF, 1.0], 'read', boilerSuit(), 'in', () => true, { prop: 'clipboard', role: 'electrician', label: 'Reading the meters' });
  extra([rooms('turbogen')[1].x0 + 3, rooms('turbogen')[1].yF, 1.0], 'workBench', boilerSuit({ top: '#3a4a6a', bottom: '#3a4a6a' }), 'in', () => true, { role: 'electrician' });
  // Hospital: patients in bed.
  extra(B(hosp, 1).feet, 'lie', passenger(R, 2, 'm', false), B(hosp, 1).heading, () => true, { role: 'patient', label: 'Recovering in the ship’s hospital' });
  extra(B(iso, 1).feet, 'lie', child(R, 3, 'm'), B(iso, 1).heading, () => true, { role: 'patient, aged 7', label: 'Measles: in the isolation ward' });
  // Sleepers: crew asleep in their bunks (a third off watch by day, most at night), passengers at night.
  let s = 0;
  for (const r of bunksS.concat(bunksW, crewAft)) {
    r.anch.beds.forEach((b, i) => {
      if ((i + s) % 4 !== 0 || s > 24) return;
      s++;
      const crewCos = r.who === 'steward' ? stewardWhite({ coat: null }) : r.kind === 'crew' ? fireman() : seaman({ hat: null });
      extra(b.feet, 'lie', crewCos, b.heading, i % 2 ? inAny([[21, 7]]) : inAny([[22, 6], [9, 15]]), { role: r.who === 'steward' ? 'steward' : r.kind === 'crew' ? 'fireman' : 'seaman', label: 'Asleep in his bunk' });
    });
  }
  const night = inAny([[22.5, 7.5]]);
  let ns = 0;
  for (const r of cabin1.concat(cabin2, cabin3)) r.anch.beds.forEach((b, i) => {
    if ((i * 5 + Math.round(r.x0)) % 6 !== 0 || ns >= 34) return;
    ns++;
    const cls = r.kind === 'cabin1' ? 1 : r.kind === 'cabin2' ? 2 : 3;
    extra(b.feet, 'lie', passenger(R, cls, i % 2 ? 'f' : 'm', false), b.heading, night, { role: cls === 1 ? 'Cabin Class passenger' : cls === 2 ? 'Tourist passenger' : 'Third Class passenger', label: 'Asleep' });
  });
  // Passengers and crew walking the decks by day.
  const walkers = [[DK.S, 90, 250, 14, 1], [DK.P, 66, 82, 1.0, 1], [DK.M, 32, 54, 7, 3], [DK.P, 255, 300, 3, 2]];
  walkers.forEach(([y, x0, x1, z, cls], wi) => {
    for (let i = 0; i < (wi === 0 ? 4 : 1); i++) {
      const sex = (i + wi) % 2 ? 'f' : 'm';
      const p = W.addPerson({ costume: passenger(R, cls, sex, false), role: cls === 1 ? 'Cabin Class passenger' : cls === 2 ? 'Tourist passenger' : 'Third Class passenger', routine: [
        { at: [x0 + (x1 - x0) * ((i * 0.37 + 0.1) % 1), y, z], act: 'stand', face: 'out', dur: [20, 40], label: 'Taking a turn round the deck', when: [9, 19] },
        { at: [x0 + (x1 - x0) * ((i * 0.37 + 0.6) % 1), y, z], act: wi === 0 ? 'lookout' : 'talk', face: 'out', dur: [20, 40], label: 'Taking a turn round the deck', when: [9, 19] },
      ] });
      p.show = inAny([[9, 19]]);
      extras.push(p);
    }
  });
  W.data.extras = extras;
}

// Show and hide extras by the hour (meal sittings, sleepers, the cinema).
export function updatePeople(W) {
  const h = W.hour;
  for (const p of W.data.extras) {
    if (!p.show) continue;
    const vis = p.show(h);
    if (p.hidden === vis) p.hidden = !vis;
  }
}
