/* The Atlantic Liner: the room table, room shells (floor, back wall, side walls with
 * doorways, ceilings, stair openings) and the furnishing of every compartment.
 *
 * Room positions are layout estimates built from the dossier's zone table (Z01..Z54);
 * contents and colours follow the sources quoted there.
 */
import { mat, shade, mix } from '../../engine/index.js';
import { DK, SLAB, M, inner, slab, stemX, sheer, ybot, hb, FUNNELS } from './shape.js';
import { C, chair, table, roundTable, settee, lampC, porthole, windows, picture, deckchair, sack, trunk, shelfRack, basin, wardrobe, berth, bunks, rug, plant, stoveRange, pot, counter, bars, dog } from './furn.js';

export const Y = (v) => (typeof v === 'string' ? DK[v] : v);
const WALK_Z = 0.9;
const NOBACK = new Set(['hold1', 'hold2', 'chain', 'tank', 'tunnel', 'rope', 'steering']); // people walk along the front of every deck

// ------------------------------------------------------------------ the room table
export const ROOMS = [];
const R = (kind, x0, x1, f, t, o = {}) => { const r = Object.assign({ kind, x0, x1, f, t }, o); ROOMS.push(r); return r; };

// Forward: holds, crew and stores (Z01-Z09, Z41).
R('chain', 9.8, 12, 'tt', 'D', { name: 'Chain locker' });
R('hold1', 12, 30, 'tt', 'D', { name: 'No. 1 hold (mail)' });
R('hold2', 30, 48, 'tt', 'D', { name: 'No. 2 hold (cars)' });
R('tank', 48, 92, 'tt', 'G', { name: 'Fresh water tanks' });
R('wine', 48, 62, 'G', 'F', { name: 'Wine cellar' });
R('stores', 62, 92, 'G', 'F', { name: 'Provision stores' });
R('baggage', 48, 92, 'F', 'E', { name: 'Baggage rooms' });
R('stores', 4, 16, 'D', 'C', { name: 'Paint store', paint: true });
R('specie', 16, 26, 'D', 'C', { name: 'Specie room' });
R('crewbunks', 26, 46.5, 'D', 'C', { name: "Stewards' quarters", who: 'steward' });
R('crewbunks', 3.2, 26, 'C', 'B', { name: "Stewards' quarters", who: 'steward' });
R('mess', 26, 46.5, 'C', 'B', { name: 'Crew mess' });
R('lampstore', 2.6, 12, 'B', 'A', { name: 'Lamp room' });
R('carpenter', 12, 20, 'B', 'A', { name: "Carpenter's shop" });
R('crewbunks', 20, 46.5, 'B', 'A', { name: "Seamen's quarters", who: 'seaman' });
R('bosun', 2.0, 20, 'A', 'M', { name: "Boatswain's store" });
R('crewbunks', 20, 46.5, 'A', 'M', { name: "Seamen's quarters", who: 'seaman' });
R('rope', 1.6, 30, 'M', 29.45, { name: 'Rope store' });
for (const f of ['D', 'C', 'B', 'A']) R('stair', 46.5, 50, f, f === 'D' ? 'C' : f === 'C' ? 'B' : f === 'B' ? 'A' : 'M', { up: f === 'A' ? 'M' : 1 });
R('well', 30, 55, 'M', 30.0, { name: 'Well deck', open: true });

// Third Class block (Z13-Z20).
R('cabin3', 48, 88.5, 'E', 'D', { name: 'Third Class cabins' });
R('cabin3', 50, 62, 'D', 'C', { name: 'Third Class cabins' });
R('galley3', 62, 88.5, 'D', 'C', { name: 'Third Class galley' });
R('cabin3', 50, 62, 'C', 'B', { name: 'Third Class cabins' });
R('dining3', 62, 88.5, 'C', 'B', { name: 'Third Class dining room' });
R('cabin3', 50, 56, 'B', 'A', { name: 'Third Class cabins' });
R('cinema3', 56, 74, 'B', 'A', { name: 'Third Class cinema and library' });
R('synagogue', 74, 79, 'B', 'A', { name: 'Synagogue' });
R('playroom3', 79, 84.5, 'B', 'A', { name: 'Third Class playroom' });
R('cabin3', 84.5, 88.5, 'B', 'A', { name: 'Third Class cabins' });
R('cabin3', 50, 56, 'A', 'M', { name: 'Third Class cabins' });
R('smoke3', 56, 74, 'A', 'M', { name: 'Third Class smoking room' });
R('cabin3', 74, 88.5, 'A', 'M', { name: 'Third Class cabins' });
R('garden3', 55, 66, 'M', 'P', { name: 'Third Class Garden Lounge', arc: true });
R('cabin3', 66, 88.5, 'M', 'P', { name: 'Third Class cabins' });
for (const f of ['E', 'D', 'C', 'B', 'A', 'M']) R('stair', 88.5, 92, f, f === 'M' ? 'P' : { E: 'D', D: 'C', C: 'B', B: 'A', A: 'M' }[f], { up: f !== 'M' });

// Machinery (Z42-Z47).
R('scotch', 92, 104, 'tt', 'E', { name: 'No. 1 boiler room' });
R('yarrow', 104, 118, 'tt', 'E', { name: 'No. 2 boiler room', n: 2 });
R('turbogen', 118, 126, 'tt', 'E', { name: 'Forward turbo-generator room', sets: 3 });
R('yarrow', 126, 140, 'tt', 'E', { name: 'No. 3 boiler room', n: 3 });
R('yarrow', 140, 154, 'tt', 'E', { name: 'No. 4 boiler room', n: 4 });
R('turbogen', 154, 162, 'tt', 'E', { name: 'After turbo-generator room', sets: 4 });
R('yarrow', 162, 176, 'tt', 'E', { name: 'No. 5 boiler room', n: 5 });
R('engine', 176, 199, 'tt', 'E', { name: 'Forward engine room', outer: true });
R('engine', 199, 222, 'tt', 'E', { name: 'After engine room', outer: false });
R('tunnel', 224.5, 285, 'tt', 'G', { name: 'Shaft tunnels' });

// E deck and below aft.
R('cold', 92, 105.5, 'E', 'D', { name: 'Cold stores', stores: ['Ice', 'Butter', 'Fish'] });
R('cold', 109, 160, 'E', 'D', { name: 'Cold stores', stores: ['Frozen meat', 'Kosher meat', 'Bacon and eggs', 'Fruit', 'Vegetables', 'Flour'] });
R('engq', 160, 194.5, 'E', 'D', { name: "Engineers' quarters" });
R('stores', 198, 222, 'E', 'D', { name: 'Linen store', linen: true });
R('cabin2', 224.5, 262, 'E', 'D', { name: 'Tourist cabins' });
R('crew', 265.5, 285, 'E', 'D', { name: 'Crew quarters' });
R('steering', 285, 302, 'E', 'C', { name: 'Steering gear room' });
R('baggage', 224.5, 250, 'G', 'F', { name: 'Baggage room', aft: true });
R('stores', 250, 285, 'G', 'F', { name: 'Stores' });
R('stores', 224.5, 228, 'F', 'E', { name: 'Stores' });
R('tpool', 228, 254, 'F', 'E', { name: 'Tourist swimming pool and gymnasium' });
R('crew', 254, 262, 'F', 'E', { name: 'Crew quarters' });
R('crew', 265.5, 285, 'F', 'E', { name: 'Crew quarters' });
for (const f of ['E', 'D', 'C', 'B', 'A', 'M']) R('stair', 105.5, 109, f, { E: 'D', D: 'C', C: 'B', B: 'A', A: 'M', M: 'P' }[f], { up: 1 });
for (const f of ['E', 'D', 'C', 'B', 'A', 'M']) R('stair', 194.5, 198, f, { E: 'D', D: 'C', C: 'B', B: 'A', A: 'M', M: 'P' }[f], { up: f !== 'M' });
for (const f of ['F', 'E', 'D', 'C', 'B', 'A', 'M']) R('stair', 262, 265.5, f, { F: 'E', E: 'D', D: 'C', C: 'B', B: 'A', A: 'M', M: 'P' }[f], { up: 1 });

// D deck: the pool, the working alleyway and hospital (Z21, Z27, Z28).
R('pool', 92, 105.5, 'D', 'B', { name: 'Cabin Class swimming pool' });
R('alley', 109, 140, 'D', 'C', { name: 'Working alleyway', shops: ['butcher', 'print', 'linen'] });
R('hospital', 140, 152, 'D', 'C', { name: "Ship's hospital" });
R('alley', 152, 194.5, 'D', 'C', { name: 'Working alleyway', shops: ['eggs', 'veg', 'kosher', 'bakestore'] });
R('alley', 198, 222, 'D', 'C', { name: 'Working alleyway', shops: ['print2', 'stores'] });
R('cabin2', 224.5, 262, 'D', 'C', { name: 'Tourist cabins' });
R('crew', 265.5, 285, 'D', 'C', { name: 'Crew quarters' });

// C deck: restaurant, kitchens, Tourist dining, Pig and Whistle (Z22-Z25).
R('privdine', 109, 118, 'C', 'B', { name: 'Private dining rooms' });
R('restaurant', 118, 142, 'C', 'M', { name: 'Main Restaurant' });
R('restaurantB', 142, 152, 'C', 'B', { name: 'Main Restaurant' });
R('kitchen', 152, 194.5, 'C', 'B', { name: 'Main kitchens' });
R('dining2', 198, 222, 'C', 'B', { name: 'Tourist Dining Room' });
R('cabin2', 224.5, 262, 'C', 'B', { name: 'Tourist cabins' });
R('pig', 265.5, 278, 'C', 'B', { name: 'The Pig and Whistle' });
R('crew', 278, 304, 'C', 'B', { name: 'Crew quarters' });

// B and A decks: Cabin Class staterooms, Tourist cabins, isolation wards (Z26, Z30, Z39).
R('salon', 92, 100, 'B', 'A', { name: 'Hairdressing salon' });
R('cabin1', 100, 105.5, 'B', 'A', { name: 'Cabin Class staterooms' });
R('cabin1', 109, 118, 'B', 'A', { name: 'Cabin Class staterooms' });
R('cabin1', 142, 194.5, 'B', 'A', { name: 'Cabin Class staterooms' });
R('cabin2', 198, 222, 'B', 'A', { name: 'Tourist cabins' });
R('cabin2', 224.5, 262, 'B', 'A', { name: 'Tourist cabins' });
R('crew', 265.5, 270, 'B', 'A', { name: 'Crew quarters' });
R('isolation', 270, 282, 'B', 'A', { name: 'Isolation wards' });
R('emerg', 282, 305, 'B', 'A', { name: 'Emergency generators' });
R('cabin1', 92, 105.5, 'A', 'M', { name: 'Cabin Class staterooms' });
R('cabin1', 109, 118, 'A', 'M', { name: 'Cabin Class staterooms' });
R('cabin1', 142, 194.5, 'A', 'M', { name: 'Cabin Class staterooms' });
R('cabin2', 198, 222, 'A', 'M', { name: 'Tourist cabins' });
R('cabin2', 224.5, 262, 'A', 'M', { name: 'Tourist cabins' });
R('crew', 265.5, 306, 'A', 'M', { name: 'Crew quarters' });

// Main deck.
R('cabin1', 92, 105.5, 'M', 'P', { name: 'Cabin Class staterooms' });
R('cabin1', 109, 128, 'M', 'P', { name: 'Cabin Class staterooms' });
R('bureau', 128, 136, 'M', 'P', { name: "Purser's office and Travel Bureau" });
R('cabin1', 136, 194.5, 'M', 'P', { name: 'Cabin Class staterooms' });
R('cabin2', 198, 208.5, 'M', 'P', { name: 'Tourist cabins' });
R('stair', 208.5, 212, 'M', 'P', { up: 1 });
R('cabin2', 212, 222, 'M', 'P', { name: 'Tourist cabins' });
R('lounge2', 224.5, 250, 'M', 'P', { name: 'Tourist Lounge' });
R('cabin2', 250, 262, 'M', 'P', { name: 'Tourist cabins' });
R('crew', 265.5, 306, 'M', 'P', { name: 'Crew quarters' });

// Promenade deck (Z13, Z32-Z38).
R('obsbar', 55, 66, 'P', 'S', { name: 'Observation Bar', arc: true });
R('prom', 66, 82, 'P', 'S', { name: 'Enclosed promenade' });
R('playroom1', 82, 95, 'P', 'S', { name: "Cabin Class children's playroom" });
R('mainhall', 95, 122, 'P', 'S', { name: 'Main Hall and shops' });
R('lounge1', 122, 142, 'P', 'SP', { name: 'Main Lounge' });
R('lounge1b', 142, 151, 'P', 'S', { name: 'Main Lounge' });
R('gallery', 151, 172, 'P', 'S', { name: 'Long Gallery' });
R('ballroom', 172, 187, 'P', 'S', { name: 'Ballroom' });
R('lobby', 187, 191.5, 'P', 'S', { name: 'Lobby' });
R('smoke1', 191.5, 205, 'P', 'SP', { name: 'Cabin Class Smoking Room' });
R('library2', 205, 222, 'P', 'S', { name: 'Tourist library and writing room' });
R('prom2', 224.5, 240, 'P', 'S', { name: 'Tourist promenade' });
R('smoke2', 240, 253, 'P', 'S', { name: 'Tourist Smoking Room' });
R('opendeck', 253, 306, 'P', 33.0, { name: 'After deck', open: true });

// Sun deck (Z50, Z52) and above (Z10-Z12, Z51, Z53).
R('gym', 58, 69, 'S', 'SP', { name: 'Gymnasium' });
R('radio', 69, 76, 'S', 'SP', { name: 'Wireless receiving room' });
R('stairS', 76, 79.5, 'S', 'SP', { name: 'Stair' });
R('squash', 79.5, 86, 'S', 'SP', { name: 'Squash court' });
R('sundeck', 86, 104.5, 'S', 36.5, { open: true, name: 'Sun deck' });
R('fhouse', 104.5, 115.5, 'S', 'SP', { name: 'Funnel casing' });
R('fanroom', 115.5, 122, 'S', 'SP', { name: 'Fan room' });
R('fhouse', 142.5, 153.5, 'S', 'SP', { name: 'Funnel casing' });
R('sundeck', 153.5, 157, 'S', 36.5, { open: true });
R('radiotx', 157, 166, 'S', 'SP', { name: 'Wireless transmitting room' });
R('sundeck', 166, 180.5, 'S', 36.5, { open: true });
R('fhouse', 180.5, 191.5, 'S', 'SP', { name: 'Funnel casing' });
R('sundeck', 205, 222, 'S', 36.5, { open: true });
R('verandah', 224.5, 245, 'S', 'SP', { name: 'Verandah Grill' });
R('sundeck', 245, 258, 'S', 36.5, { open: true });
R('officers', 58, 76, 'SP', 'WH', { name: "Officers' quarters" });
R('tennis', 116, 133, 'SP', 39.6, { open: true, name: 'Deck tennis courts' });
R('kennels', 133, 142, 'SP', 39.0, { open: true, name: 'Kennels' });
R('engq2', 224.5, 245, 'SP', 39.3, { name: "Engineers' quarters" });
R('wheelhouse', 58, 68, 'WH', 'CP', { name: 'Wheelhouse' });
R('compass', 58, 68, 'CP', 43.0, { open: true, name: 'Compass platform' });
R('lift', 222, 224.5, 'tt', 'SP', { name: "Engineers' lift" });

// Outboard strips of the Sun deck beside the two tall rooms (the boat deck runs past them).
export const SUN_STRIPS = [[122, 142.5], [191.5, 205]];

// Stair flights: [x0, x1, fromDeck, toDeck]. Flights run at the back of their bay.
export const FLIGHTS = [];
for (const r of ROOMS) if (r.kind === 'stair' && r.up) FLIGHTS.push({ x0: r.x0 + 0.2, x1: r.x1 - 0.2, f: r.f, t: r.up === 1 || r.up === true ? r.t : r.up });
FLIGHTS.push({ x0: 118, x1: 121.6, f: 'P', t: 'S' });          // Main Hall to the Sun deck
FLIGHTS.push({ x0: 214, x1: 217.6, f: 'P', t: 'S' });          // Tourist library to the Sun deck
FLIGHTS.push({ x0: 79.3, x1: 76.2, f: 'S', t: 'SP' });         // up to the officers' quarters
FLIGHTS.push({ x0: 71.6, x1: 68.3, f: 'SP', t: 'WH' });        // up to the wheelhouse
FLIGHTS.push({ x0: 187.3, x1: 191.2, f: 'P', t: 'S' });        // aft lobby to the boat deck
FLIGHTS.push({ x0: 121.8, x1: 118.3, f: 'S', t: 'SP' });       // up to the tennis courts and kennels
for (const F of FLIGHTS) { F.z1 = 3.7; F.z0 = 2.5; }

// ------------------------------------------------------------------ geometry helpers
const WALLC = { cut: '#4a3e36' };
const W = (c, o) => { const spec = Object.assign({ c, c2: shade(c, -0.08) }, WALLC, o || {}); const m = mat(spec); m.spec = spec; return m; };
// The same wall lit from within at night: interiors glow warmly through the cut, as in the books.
const DARK_ROOMS = new Set(['hold1', 'hold2', 'tank', 'chain', 'scotch', 'yarrow', 'turbogen', 'engine', 'tunnel', 'stores', 'wine', 'baggage', 'cold', 'steering', 'emerg', 'fhouse', 'fanroom', 'lift', 'rope', 'bosun', 'specie']);
const glowCache = new Map();
function nightWall(m, kind) {
  if (!m.spec || DARK_ROOMS.has(kind)) return m;
  const key = JSON.stringify(m.spec);
  if (!glowCache.has(key)) glowCache.set(key, mat(Object.assign({}, m.spec, { glow: 'night', c2: shade(mix(m.spec.c, '#ffc878', 0.45), -0.18) })));
  return glowCache.get(key);
}
const F_ = (c, pat, s, c2) => mat({ c, c2: c2 || shade(c, -0.15), pat: pat || 'none', s: s || 0, cut: '#4a3e36' });

function depthFor(r, want) {
  let d = want;
  const a = r.x0 + (r.x1 - r.x0) * 0.15, b = r.x1 - (r.x1 - r.x0) * 0.15;
  for (let x = a; x <= b + 0.01; x += Math.max(0.5, (b - a) / 6)) {
    d = Math.min(d, inner(x, r.yF + 0.3) - 0.35, inner(x, Math.min(r.yC, sheer(x) - 0.2)) - 0.35);
  }
  return Math.max(0.8, d);
}

// Floor slab with stair openings cut out of it.
function floorWithHoles(k, r, fm, holes) {
  const xs = [r.x0, r.x1];
  for (const h of holes) xs.push(Math.max(r.x0, h.x0), Math.min(r.x1, h.x1));
  const u = [...new Set(xs.map((v) => Math.round(v * 1000) / 1000))].sort((a, b) => a - b);
  for (let i = 0; i < u.length - 1; i++) {
    const a = u[i], b = u[i + 1];
    if (b - a < 0.01) continue;
    const mid = (a + b) / 2;
    const h = holes.find((q) => mid > q.x0 && mid < q.x1);
    const opt = { top: fm, step: 6, zOut: r.slabOut };
    if (!h) slab(k, a, b, r.yF, M.slabCut, opt);
    else {
      if (h.z0 > -0.3) slab(k, a, b, r.yF, M.slabCut, Object.assign({}, opt, { zOut: h.z0 }));
      slab(k, a, b, r.yF, M.slabCut, Object.assign({}, opt, { zIn: h.z1 }));
    }
  }
}

function sideWall(k, x, r, m) {
  const y0 = r.yF, y1 = r.yC, d = r.d;
  k.box(x - 0.07, y0, -0.45, x + 0.07, y1, 0.3, m);
  if (y1 - y0 > 2.25) k.box(x - 0.07, y0 + 2.15, 0.3, x + 0.07, y1, 1.5, m);
  k.box(x - 0.07, y0, 1.5, x + 0.07, y1, d + 0.15, m);
}

// ------------------------------------------------------------------ build
export function buildRooms(k) {
  const A = (r) => (r.anch = r.anch || { seats: [], beds: [], spots: [] });
  for (const r of ROOMS) {
    r.yF = Y(r.f);
    r.yC = Y(r.t) - (typeof r.t === 'string' ? SLAB : 0);
    if (r.f !== 'tt' && r.yF > 4) r.x0 = Math.max(r.x0, stemX(r.yF) + 0.8);
    if (r.x0 < 20 && !['chain', 'rope', 'hold1'].includes(r.kind)) while (inner(r.x0, r.yF + 0.3) < 3.2 && r.x0 < r.x1 - 3) r.x0 += 0.5;
    r.d = depthFor(r, D_WANT[r.kind] || 4.4);
    A(r);
  }
  // Which walls to draw: every room's left wall, and its right wall when nothing on the same floor starts there.
  for (const r of ROOMS) {
    r.rightWall = !ROOMS.some((q) => q !== r && Math.abs(q.yF - r.yF) < 0.05 && Math.abs(q.x0 - r.x1) < 0.05 && !q.open);
  }
  for (const r of ROOMS) {
    const holes = FLIGHTS.filter((F) => Y(F.t) === r.yF && Math.max(F.x0, F.x1) > r.x0 && Math.min(F.x0, F.x1) < r.x1).map((F) => ({ x0: Math.min(F.x0, F.x1) - 0.1, x1: Math.max(F.x0, F.x1) + 0.1, z0: F.z0 - 0.1, z1: F.z1 + 0.1 }));
    const S = STYLE[r.kind] || STYLE.default;
    if (r.kind === 'tpool') holes.push({ x0: r.x0 + 1.25, x1: r.x0 + 11.75, z0: -0.5, z1: Math.min(6.4, r.d - 1.2) + 0.25 });
    if (r.kind !== 'lift' && !r.noFloor) floorWithHoles(k, r, S.floor, holes);
    if (!r.open && r.kind !== 'lift') {
      const wm = nightWall(S.wall, r.kind);
      const bx0 = r.arc ? r.x0 + r.d : r.x0;
      if (!NOBACK.has(r.kind)) k.box(bx0, r.yF, r.d, r.x1, r.yC, r.d + 0.15, wm, { shadeBot: 0.82 });
      if (S.dado) k.box(bx0, r.yF, r.d - 0.03, r.x1, r.yF + (S.dadoH || 0.9), r.d, S.dado);
      if (S.ceil) k.box(bx0 - (r.arc ? r.d * 0.6 : 0), r.yC - 0.03, 0, r.x1, r.yC, r.d, S.ceil);
      if (r.arc) arcFront(k, r);
      else sideWall(k, r.x0, r, S.side || wm);
      if (r.rightWall) sideWall(k, r.x1, r, S.side || wm);
    }
    const fn = FURN[r.kind];
    if (fn) fn(k, r, r.anch);
    else if (!r.open) lampC(k, (r.x0 + r.x1) / 2, r.yC, r.d * 0.5, { kind: 'bulb' });
  }
  // Roofs: wherever nothing stands on a room's ceiling.
  for (const r of ROOMS) {
    if (r.open || r.kind === 'lift' || r.kind === 'tennis') continue;
    const top = Y(r.t);
    if (typeof r.t !== 'string') continue;
    const cover = ROOMS.filter((q) => q !== r && Math.abs(q.yF - top) < 0.05 && q.x1 > r.x0 && q.x0 < r.x1 && !q.noFloor).map((q) => [q.x0, q.x1]).sort((a, b) => a[0] - b[0]);
    let x = r.x0;
    const gaps = [];
    for (const [a, b] of cover) { if (a > x + 0.05) gaps.push([x, Math.min(a, r.x1)]); x = Math.max(x, b); }
    if (x < r.x1 - 0.05) gaps.push([x, r.x1]);
    for (const [a, b] of gaps) {
      const deckTop = top >= DK.S - 0.1 ? M.teak : top >= DK.P ? M.teak : M.deckSteel;
      const zOut = top > DK.S + 0.5 ? Math.min(r.d + 0.6, 14) : undefined;
      slab(k, a, b, top, M.slabCut, { top: deckTop, zOut, step: 6 });
      if (top > DK.S + 0.5 || top <= DK.S + 0.1 && top > DK.P) {
        // A white rail along the edge of a house roof that people can reach.
      }
    }
  }
  // Boat-deck strips outboard of the tall rooms.
  for (const [a, b] of SUN_STRIPS) {
    const r = ROOMS.find((q) => q.x0 <= a + 0.01 && q.x1 >= b - 0.6 && q.yF === DK.P);
    const z0 = r ? r.d + 0.15 : 10;
    slab(k, a, b, DK.S, M.slabCut, { top: M.teak, zIn: z0 });
  }
  // Stair flights.
  for (const F of FLIGHTS) stairFlight(k, F);
}

// A curved forward front (Observation Bar, Garden Lounge): white plating with a band of windows.
function arcFront(k, r) {
  const R0 = r.d + 0.15, cx = r.x0 + R0, a0 = Math.PI / 2, a1 = Math.PI + 0.05;
  const ring = (y0, y1, m) => k.lathe([[R0 - 0.22, y0], [R0, y0], [R0, y1], [R0 - 0.22, y1], [R0 - 0.22, y0]], cx, 0, m, { seg: 21, a0, a1, capTop: false, capBot: false, flat: true });
  const glass = mat({ c: '#a8c4cc', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.62, cut: '#5a6a70' });
  const wy0 = r.yF + (r.kind === 'obsbar' ? 0.8 : 1.2), wy1 = r.yC - (r.kind === 'obsbar' ? 0.25 : 0.7);
  ring(r.yF, wy0, M.whiteHouse);
  if (r.kind === 'obsbar') ring(wy0, wy1, glass);
  else { ring(wy0, wy1, M.whiteHouse); for (let i = 0; i < 9; i++) { const a = a0 + ((i + 0.5) / 9) * (a1 - a0 - 0.05); k.cyl(cx + Math.cos(a) * (R0 + 0.01), (wy0 + wy1) / 2, Math.sin(a) * (R0 + 0.01), 0.2, 0.05, mat({ c: '#9ab4c4', c2: '#ffd890', glow: 'night' }), { axis: 'x', seg: 8 }); } }
  ring(wy1, r.yC + (typeof r.t === 'string' ? SLAB : 0), M.whiteHouse);
}

function stairFlight(k, F) {
  const y0 = Y(F.f), y1 = Y(F.t);
  const n = Math.max(6, Math.round((y1 - y0) / 0.22));
  const dx = (F.x1 - F.x0) / n, dy = (y1 - y0) / n;
  const m = C('#8a6a4a', { cut: '#5a4030' });
  for (let i = 0; i < n; i++) {
    const a = F.x0 + dx * i, b = a + dx;
    k.box(Math.min(a, b), y0 + dy * i - 0.08, F.z0, Math.max(a, b), y0 + dy * (i + 1), F.z1, m);
  }
  k.tube([[F.x0, y0 + 0.95, F.z0 - 0.02], [F.x1, y1 + 0.95, F.z0 - 0.02]], 0.03, C('#c8a050'), { seg: 4 });
  k.cyl(F.x0, y0, F.z0 - 0.02, 0.025, 0.95, C('#c8a050'), { seg: 4 });
  k.cyl(F.x1, y1, F.z0 - 0.02, 0.025, 0.95, C('#c8a050'), { seg: 4 });
}

// Wanted depth of each kind of room (the back wall), clamped to the hull.
const D_WANT = {
  hold1: 12, hold2: 12, tank: 12, wine: 6, stores: 4.5, baggage: 6, chain: 3,
  crewbunks: 4.0, mess: 5, lampstore: 4, carpenter: 4, bosun: 4.5, rope: 4.5, specie: 4, stair: 4.4,
  cabin3: 4.2, galley3: 6, dining3: 9, cinema3: 9, synagogue: 6, playroom3: 6, smoke3: 9, garden3: 10,
  scotch: 14, yarrow: 15, turbogen: 13, engine: 15, tunnel: 12, cold: 4.6, engq: 4.2, cabin2: 4.2, crew: 4.0,
  steering: 9, tpool: 10, pool: 10, alley: 4.6, hospital: 5, privdine: 6, restaurant: 12, restaurantB: 8,
  kitchen: 8, dining2: 9, pig: 6, salon: 5, cabin1: 4.8, isolation: 5, emerg: 5, bureau: 5,
  obsbar: 9, prom: 6, playroom1: 7, mainhall: 10, lounge1: 10, lounge1b: 10, gallery: 7, ballroom: 10,
  lobby: 6, smoke1: 10, library2: 7, lounge2: 10, prom2: 6, smoke2: 8, gym: 6, radio: 5, stairS: 4.4,
  squash: 6, fhouse: 5.5, fanroom: 6, radiotx: 6, verandah: 9, officers: 6, engq2: 6, wheelhouse: 6,
  sundeck: 17, opendeck: 17, well: 17, tennis: 12, kennels: 10, compass: 6,
};

// ------------------------------------------------------------------ styles
const ST = (floor, wall, o = {}) => Object.assign({ floor, wall }, o);
const korkoid = (c, c2, s) => F_(c, 'checker', s || 0.45, c2);
const STYLE = {
  default: ST(F_('#8a8070', 'plates', 1.0), W('#d8d0b8')),
  hold1: ST(F_('#8a7a62', 'planks', 0.3), W('#8a7a68', { pat: 'rivets', s: 1.4 })),
  hold2: ST(F_('#8a7a62', 'planks', 0.3), W('#8a7a68', { pat: 'rivets', s: 1.4 })),
  tank: ST(F_('#6a5a4a', 'plates', 1.0), W('#7a5a48', { pat: 'rivets', s: 1.4 })),
  chain: ST(F_('#5a4a3a', 'plates', 1.0), W('#6a4a3a', { pat: 'rivets', s: 1.4 })),
  wine: ST(F_('#7a6a5a', 'planks', 0.25), W('#c8bca0')),
  stores: ST(F_('#8a8070', 'plates', 1.0), W('#d8d0b8')),
  baggage: ST(F_('#8a7a62', 'planks', 0.25), W('#d0c4a8')),
  specie: ST(F_('#6a6a66', 'plates', 0.8), W('#7a7e84', { pat: 'rivets', s: 0.5 })),
  crewbunks: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0'), { dado: W('#6a8a6a'), dadoH: 1.0 }),
  mess: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0'), { dado: W('#6a8a6a'), dadoH: 1.0 }),
  crew: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0'), { dado: W('#6a8a6a'), dadoH: 1.0 }),
  lampstore: ST(F_('#7a6a5a', 'plates', 0.8), W('#d8d0b8')),
  carpenter: ST(F_('#a88a5a', 'planks', 0.2), W('#d8d0b8')),
  bosun: ST(F_('#a88a5a', 'planks', 0.2), W('#c8c0a8')),
  rope: ST(F_('#a88a5a', 'planks', 0.2), W('#c8c0a8')),
  stair: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0'), { dado: W('#7a5a3a'), dadoH: 1.0 }),
  cabin3: ST(F_('#7a6878', 'speckle', 0, '#9a8a9a'), W('#e8dcc0'), { dado: W('#a07a52', { pat: 'grain' }), dadoH: 0.9 }),
  galley3: ST(F_('#b8b0a0', 'tiles', 0.25), W('#f0ece0', { pat: 'tiles', s: 0.2 })),
  dining3: ST(F_('#b8543a', 'checker', 0.6, '#c8783a'), W('#e4d4b0', { pat: 'grain' }), { dado: W('#8a3a2a', { pat: 'panels', s: 0.8 }), dadoH: 1.0 }),
  cinema3: ST(F_('#5a3a2a', 'carpet', 0.5, '#7a4a32'), W('#b06a48', { pat: 'stripes', s: 0.5, c2: '#6a3a26' }), { dado: W('#3a2a22'), dadoH: 0.8 }),
  synagogue: ST(F_('#6a4a3a', 'carpet', 0.4, '#8a6a4a'), W('#d8c49a', { pat: 'panels', s: 0.8 })),
  playroom3: ST(F_('#c8b890', 'checker', 0.5, '#a8c0c8'), W('#e8dcb8', { pat: 'grain' })),
  smoke3: ST(F_('#6a5a3a', 'carpet', 0.6, '#8a7a4a'), W('#c8a878', { pat: 'panels', s: 1.0 }), { dado: W('#5a6a42'), dadoH: 1.0 }),
  garden3: ST(F_('#9a8a6a', 'checker', 0.6, '#b8a880'), W('#e8e0c8', { pat: 'grain' })),
  scotch: ST(F_('#5a5a58', 'grate'), W('#8a8680', { pat: 'rivets', s: 1.4 })),
  yarrow: ST(F_('#5a5a58', 'grate'), W('#8a8680', { pat: 'rivets', s: 1.4 })),
  turbogen: ST(F_('#6a6a68', 'grate'), W('#a8a49a', { pat: 'rivets', s: 1.4 })),
  engine: ST(F_('#6a6a68', 'grate'), W('#a8a49a', { pat: 'rivets', s: 1.4 })),
  tunnel: ST(F_('#5a5a58', 'grate'), W('#8a8680', { pat: 'rivets', s: 1.4 })),
  cold: ST(F_('#9a9a92', 'tiles', 0.3), W('#e8e4d4'), { dado: W('#8ab89a'), dadoH: 1.2 }),
  alley: ST(F_('#8a8a80', 'tiles', 0.3), W('#ece4cc'), { dado: W('#8ab89a'), dadoH: 1.2 }),
  engq: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0'), { dado: W('#7a5a3a'), dadoH: 0.9 }),
  cabin2: ST(F_('#5a7a5a', 'carpet', 0.4, '#7a9a6a'), W('#e8dcbc'), { dado: W('#8a6a42', { pat: 'grain' }), dadoH: 0.9 }),
  steering: ST(F_('#5a5a58', 'grate'), W('#8a8680', { pat: 'rivets', s: 1.4 })),
  tpool: ST(F_('#d8d0b8', 'tiles', 0.3), W('#f2ecd8', { pat: 'tiles', s: 0.25 }), { dado: W('#3a6a9a'), dadoH: 0.35 }),
  pool: ST(F_('#e0d4a8', 'tiles', 0.3), W('#e8d8a0', { pat: 'tiles', s: 0.3, c2: '#d8c890' }), { dado: W('#2a8a5a'), dadoH: 0.3, ceil: C('#e8e4dc', { c2: '#d0d8e0', pat: 'speckle' }) }),
  hospital: ST(F_('#5a8a6a', 'tiles', 0.4), W('#f2f0ea')),
  isolation: ST(F_('#5a8a6a', 'tiles', 0.4), W('#f4f2ec')),
  privdine: ST(F_('#8a5a3a', 'carpet', 0.5, '#a87a4a'), W('#c89a62', { pat: 'grain' }), { ceil: C('#e8dcc0') }),
  restaurant: ST(F_('#8a4a2e', 'checker', 0.8, '#b08a5a'), W('#c8945a', { pat: 'panels', s: 1.4, c2: '#b07e4a' }), { ceil: C('#e0c8a0', { pat: 'panels', s: 2 }), dado: W('#9a6a3a', { pat: 'grain' }), dadoH: 1.1 }),
  restaurantB: ST(F_('#8a4a2e', 'checker', 0.8, '#b08a5a'), W('#c8945a', { pat: 'panels', s: 1.4, c2: '#b07e4a' }), { ceil: C('#e0c8a0'), dado: W('#9a6a3a', { pat: 'grain' }), dadoH: 1.1 }),
  kitchen: ST(F_('#c8c0b0', 'tiles', 0.25), W('#f2eee4', { pat: 'tiles', s: 0.2 })),
  dining2: ST(F_('#6a5a5a', 'checker', 0.5, '#a89a8a'), W('#d8d4c8', { pat: 'grain' }), { dado: W('#c8a878', { pat: 'grain' }), dadoH: 1.0 }),
  pig: ST(F_('#a88a5a', 'planks', 0.2), W('#a8a49a', { pat: 'rivets', s: 1.4 })),
  salon: ST(F_('#e0dcd0', 'checker', 0.4, '#3a3a3a'), W('#ece4d4'), { dado: W('#c8a0a0'), dadoH: 1.0 }),
  cabin1: ST(F_('#8a6a5a', 'carpet', 0.45, '#a88a6a'), W('#d8c8a8', { pat: 'grain' })),
  emerg: ST(F_('#5a5a58', 'grate'), W('#9a968a', { pat: 'rivets', s: 1.4 })),
  bureau: ST(F_('#6a4a3a', 'carpet', 0.5, '#8a6a4a'), W('#c8a070', { pat: 'panels', s: 1.0 })),
  obsbar: ST(F_('#5a3a2a', 'carpet', 0.5, '#8a3a2a'), W('#c8a070', { pat: 'grain' }), { ceil: C('#ece0c8') }),
  prom: ST(M.teak, W('#a87a4a', { pat: 'panels', s: 1.2 })),
  prom2: ST(M.teak, W('#a87a4a', { pat: 'panels', s: 1.2 })),
  playroom1: ST(F_('#d8c890', 'checker', 0.5, '#9ac0c8'), W('#f0e8d0')),
  mainhall: ST(F_('#5a7a5a', 'checker', 0.9, '#3a5a42'), W('#c8a070', { pat: 'panels', s: 1.6 }), { ceil: C('#ece4cc') }),
  lounge1: ST(F_('#a87a4a', 'planks', 0.15, '#7a4a2a'), W('#d0a868', { pat: 'panels', s: 1.6, c2: '#b88a4a' }), { ceil: C('#ecdcb0', { pat: 'panels', s: 2.4 }), dado: W('#8a4a2a', { pat: 'grain' }), dadoH: 1.0 }),
  lounge1b: ST(F_('#a87a4a', 'planks', 0.15, '#7a4a2a'), W('#d0a868', { pat: 'panels', s: 1.6, c2: '#b88a4a' }), { ceil: C('#ecdcb0'), dado: W('#8a4a2a', { pat: 'grain' }), dadoH: 1.0 }),
  gallery: ST(F_('#7a5a3a', 'carpet', 0.6, '#9a7a4a'), W('#c89a6a', { pat: 'grain' }), { ceil: C('#ecdcc0') }),
  ballroom: ST(F_('#c8a878', 'planks', 0.12, '#b08a5a'), W('#d8c8a0', { pat: 'panels', s: 1.4, c2: '#c8b080' }), { ceil: C('#f0c8b0') }),
  lobby: ST(F_('#5a7a5a', 'checker', 0.9, '#3a5a42'), W('#c8a070', { pat: 'panels', s: 1.2 })),
  smoke1: ST(F_('#4a3020', 'carpet', 0.7, '#8a6a2a'), W('#8a6438', { pat: 'panels', s: 1.4, c2: '#7a5430' }), { ceil: C('#d8c4a0', { pat: 'panels', s: 2 }) }),
  library2: ST(F_('#6a6a5a', 'carpet', 0.5, '#8a8a6a'), W('#c8b088', { pat: 'grain' })),
  lounge2: ST(F_('#5a7a5a', 'carpet', 0.5, '#e8e0c8'), W('#e8e2cc', { pat: 'panels', s: 1.4, c2: '#c8d0b8' }), { ceil: C('#f0ecdc') }),
  smoke2: ST(F_('#3a2a22', 'checker', 0.5, '#e0d4b8'), W('#9a6a3a', { pat: 'panels', s: 1.2 })),
  gym: ST(korkoid('#2a2a2a', '#ece6da', 0.4), W('#c8a070', { pat: 'stripes', s: 0.35, c2: '#a07848' })),
  radio: ST(F_('#5a5a52', 'tiles', 0.4), W('#d8d0b8')),
  radiotx: ST(F_('#5a5a52', 'tiles', 0.4), W('#d8d0b8')),
  stairS: ST(M.teak, W('#f0e9da')),
  squash: ST(F_('#c8a878', 'planks', 0.1), W('#f4f0e8')),
  fhouse: ST(M.teak, W('#f0e9da', { pat: 'rivets', s: 1.4 })),
  fanroom: ST(F_('#6a6a68', 'grate'), W('#d8d0c0', { pat: 'rivets', s: 1.4 })),
  verandah: ST(F_('#26221e', 'carpet', 0.5, '#3a3430'), W('#7a1a1e', { pat: 'stripes', s: 0.4, c2: '#5a1216' }), { ceil: C('#2a2430') }),
  officers: ST(F_('#6a4a3a', 'carpet', 0.5, '#8a6a4a'), W('#b08a5a', { pat: 'panels', s: 1.0 })),
  engq2: ST(F_('#7a6a5a', 'tiles', 0.4), W('#e0d8c0')),
  wheelhouse: ST(F_('#7a5a3a', 'grate'), W('#9a6a3a', { pat: 'panels', s: 0.8 }), { ceil: C('#ece4cc') }),
  sundeck: ST(M.teak, W('#f0e9da')),
  opendeck: ST(M.teak, W('#f0e9da')),
  well: ST(M.teak, W('#f0e9da')),
  tennis: ST(F_('#5a7a5a', 'none'), W('#f0e9da')),
  kennels: ST(M.teak, W('#f0e9da')),
  compass: ST(M.teak, W('#f0e9da')),
  lift: ST(M.deckSteel, W('#d8d0b8')),
};

// ------------------------------------------------------------------ furnishing
const FURN = {};
const mid = (r) => (r.x0 + r.x1) / 2;
const seatAt = (A, c, y) => A.seats.push({ x: c.x, y, z: c.z, face: c.face, seat: c.seat });

// Cabins in a row: partitions every `w` metres, berths, basin, wardrobe, a lamp.
function cabinRow(k, r, A, o) {
  const n = Math.max(1, Math.round((r.x1 - r.x0) / o.w));
  const w = (r.x1 - r.x0) / n, y = r.yF, d = r.d;
  const rr = k.rng('cab' + r.x0 + ':' + y);
  const part = W(o.part || '#d8ccb0');
  for (let i = 0; i < n; i++) {
    const a = r.x0 + i * w, b = a + w, c = (a + b) / 2;
    if (i > 0) { k.box(a - 0.04, y, -0.45, a + 0.04, r.yC, 0.25, part); k.box(a - 0.04, y, 1.45, a + 0.04, r.yC, d, part); k.box(a - 0.04, y + 2.1, 0.25, a + 0.04, r.yC, 1.45, part); }
    const bl = rr.pick(o.blankets);
    if (o.style === 'cabin1') {
      const veneer = rr.pick(['#b08a5a', '#9a6a42', '#c8a878', '#8a5a3a', '#d8b888', '#a87850']);
      k.box(a + 0.05, y, d - 0.04, b - 0.05, r.yC, d, C(veneer, { pat: 'grain', c2: shade(veneer, -0.15) }));
      const bed = berth(k, a + 1.15, y, d - 0.05, { w: 1.95, d: 1.0, blanket: bl, frame: shade(veneer, -0.2), quilt: true });
      A.beds.push(bed);
      if (w > 3.6) A.beds.push(berth(k, b - 1.15, y, d - 0.05, { w: 1.95, d: 0.95, blanket: bl, frame: shade(veneer, -0.2), quilt: true }));
      else wardrobe(k, b - 0.55, y, d - 0.05, 0.8, shade(veneer, -0.1), 1.8);
      const ch = chair(k, c + 0.2, y, 1.7, rr.pick(['#c8a080', '#8a6a8a', '#6a8aa0', '#a86a5a']), -1, { w: 0.6, d: 0.6 });
      seatAt(A, ch, y);
      table(k, c - 0.5, y, 1.75, 0.5, 0.45, { top: veneer, h: 0.62 });
      if (i % 2 === 0) lampC(k, c + w / 2, r.yC, d * 0.5, { kind: 'trough', w: 0.8, r: 4.6, i: 0.85 });
      else k.box(c - 0.4, r.yC - 0.06, d * 0.5 - 0.1, c + 0.4, r.yC, d * 0.5 + 0.1, C('#f4e4c0', { c2: '#fff0c8', glow: 'night', noEdge: true }));
      rug(k, a + 0.3, b - 0.3, y, 0.9, d - 1.2, rr.pick(['#8a6a5a', '#6a7a8a', '#9a8a6a', '#7a5a6a']));
    } else {
      const two = o.style === 'cabin3' ? rr() < 0.5 : rr() < 0.4;
      const pair = bunks(k, a + 1.1, y, d - 0.05, { w: 1.85, d: 0.75, blanket: bl, blanket2: rr.pick(o.blankets), frame: o.frame });
      A.beds.push(...pair);
      if (!two && w > 2.9) A.beds.push(...bunks(k, b - 1.0, y, d - 0.95, { w: 0.0001 + 1.0, d: 0.05, blanket: bl, frame: o.frame }).slice(0, 0));
      basin(k, b - 0.5, y, d - 0.05);
      k.box(b - 0.75, r.yC - 0.5, d - 0.06, b - 0.25, r.yC - 0.42, d - 0.02, C('#f4e0b0', { c2: '#ffe0a0', glow: 'night' }));
      if (i % 2 === 0) k.lamp(b, r.yC - 0.6, d - 0.6, { color: '#ffd8a0', r: 4.0, i: 0.75, bulb: false, halo: 0.2 });
      if (o.style === 'cabin3' && rr() < 0.4) k.box(a + 0.15, y, 0.9, a + 0.75, y + 0.35, 1.3, C(rr.pick(['#6a4a2a', '#3a4a5a', '#7a2a1a'])));
      if (o.porthole) porthole(k, a + 1.1, y + 1.55, d, { r: 0.17 });
    }
    A.spots.push({ x: c, y, z: 1.2, face: 'out' });
  }
}

FURN.cabin1 = (k, r, A) => cabinRow(k, r, A, { w: 4.6, style: 'cabin1', blankets: ['#c8a0a0', '#a0b0c8', '#c8c0a0', '#b0c8a8', '#d8c8b0'] });
FURN.cabin2 = (k, r, A) => cabinRow(k, r, A, { w: 3.0, style: 'cabin2', blankets: ['#5a7a5a', '#4a6a8a', '#b89a4a', '#6a8a6a'], frame: '#7a5a3a', part: '#e0d4b4' });
FURN.cabin3 = (k, r, A) => cabinRow(k, r, A, { w: 2.9, style: 'cabin3', blankets: ['#8a8a8a', '#4a5a7a', '#c8702a', '#6a6a7a'], frame: '#6a3a22', part: '#e4d8bc', porthole: true });
FURN.crewbunks = (k, r, A) => {
  const n = Math.floor((r.x1 - r.x0 - 1) / 2.2);
  for (let i = 0; i < n; i++) {
    const x = r.x0 + 1.4 + i * 2.2;
    A.beds.push(...bunks(k, x, r.yF, r.d - 0.05, { w: 1.9, d: 0.75, blanket: i % 2 ? '#5a5a6a' : '#6a5a4a', frame: '#7a7a74' }));
    if (i % 2 === 0) porthole(k, x, r.yF + 1.6, r.d, { r: 0.16 });
    if (i % 3 === 1) k.box(x - 0.35, r.yF, 1.4, x + 0.35, r.yF + 1.8, 1.9, C('#7a8a7a', { pat: 'panels', s: 0.35 }));
    if (i % 4 === 0) lampC(k, x, r.yC, 1.8, { kind: 'bulb', r: 3.5, i: 0.7 });
  }
  const t = table(k, r.x0 + 1.2 + n * 1.1, r.yF, 1.5, 1.2, 0.6, { top: '#8a7a62', items: 'cups' });
  void t;
};
FURN.crew = FURN.crewbunks;
FURN.engq = (k, r, A) => {
  const n = Math.max(1, Math.round((r.x1 - r.x0) / 3.2));
  const w = (r.x1 - r.x0) / n;
  for (let i = 0; i < n; i++) {
    const a = r.x0 + i * w;
    if (i > 0) { k.box(a - 0.04, r.yF, -0.45, a + 0.04, r.yC, 0.25, W('#d8ccb0')); k.box(a - 0.04, r.yF, 1.45, a + 0.04, r.yC, r.d, W('#d8ccb0')); }
    A.beds.push(berth(k, a + 1.1, r.yF, r.d - 0.05, { w: 1.9, d: 0.8, blanket: '#5a6a7a' }));
    const c = chair(k, a + w - 0.7, r.yF, 1.6, '#6a5a4a', 'out', { legs: true });
    seatAt(A, c, r.yF);
    table(k, a + w - 0.7, r.yF, 2.2, 0.8, 0.5, { top: '#8a6a4a' });
    if (i % 2 === 0) lampC(k, a + w / 2, r.yC, 1.8, { kind: 'bulb', r: 3, i: 0.6 });
    A.spots.push({ x: a + w / 2, y: r.yF, z: 1.2, face: 'out' });
  }
};
FURN.engq2 = FURN.engq;
FURN.mess = (k, r, A) => {
  for (let x = r.x0 + 2.5; x < r.x1 - 2; x += 5) {
    table(k, x, r.yF, 1.9, 3.6, 0.8, { top: '#a89070', items: 'cups' });
    for (const zz of [1.35, 2.75]) k.box(x - 1.7, r.yF, zz, x + 1.7, r.yF + 0.45, zz + 0.35, C('#8a6a4a'));
    for (let s = -1.2; s <= 1.21; s += 0.8) { A.seats.push({ x: x + s, y: r.yF, z: 1.5, face: 'in', seat: 0.47 }); A.seats.push({ x: x + s, y: r.yF, z: 2.9, face: 'out', seat: 0.47 }); }
    lampC(k, x, r.yC, 2.2, { kind: 'bulb', r: 4, i: 0.8 });
  }
  counter(k, r.x1 - 3.5, r.x1 - 0.5, r.yF, r.d - 0.7, 0.6, 1.0, '#7a7a74');
  k.cyl(r.x1 - 2.6, r.yF + 1.0, r.d - 0.4, 0.22, 0.55, C('#b8bcc0'), { seg: 8 });
  A.spots.push({ x: r.x1 - 2.0, y: r.yF, z: r.d - 1.2, face: 'in' });
};
FURN.stair = (k, r) => lampC(k, mid(r), r.yC, 1.5, { kind: 'bulb', r: 3, i: 0.6 });
FURN.stairS = FURN.stair;
FURN.lobby = (k, r, A) => { lampC(k, mid(r), r.yC, 2, { kind: 'dish', r: 4 }); plant(k, r.x0 + 0.8, r.yF, r.d - 0.7, 1.0); A.spots.push({ x: mid(r), y: r.yF, z: 1.4, face: 'out' }); };

FURN.chain = (k, r) => {
  const m = C('#3a3634', { pat: 'rings', s: 0.1 });
  for (let i = 0; i < 9; i++) k.boulder(10.6 + (i % 3) * 0.45, r.yF + 0.4 + Math.floor(i / 3) * 0.35, 0.8 + (i % 2) * 0.6, 0.5, 0.3, 0.5, m, i + 3);
  k.tube([[11, r.yF + 1.5, 1.2], [11, r.yC, 1.0]], 0.14, m, { seg: 6 });
  lampC(k, 11, r.yC, 1.2, { kind: 'cage', r: 3, i: 0.4 });
};
FURN.hold1 = (k, r, A) => {
  // Tween-deck platforms with removable beams; mail sacks stacked on every level.
  const levels = [DK.tt, DK.H, DK.G, DK.F, DK.E];
  const rr = k.rng('mail');
  levels.forEach((y, li) => {
    if (li > 0) {
      slab(k, r.x0 + 0.2, r.x1 - 0.2, y, M.slabCut, { top: F_('#8a7a62', 'planks', 0.3), th: 0.22, zIn: 0.4 });
      for (let x = r.x0 + 1; x < r.x1; x += 2.2) k.box(x - 0.1, y - 0.42, 0.4, x + 0.1, y - 0.22, Math.max(1, inner(x, y) - 0.3), C('#6a6a66'));
    }
    for (let i = 0; i < 26; i++) {
      const x = r.x0 + 1.0 + rr() * (r.x1 - r.x0 - 2), z = 0.6 + rr() * Math.max(0.3, Math.min(9, inner(x, y + 0.5) - 1.6));
      if (inner(x, y + 0.5) < 1.4) continue;
      sack(k, x, y + (i % 3 === 0 ? 0.5 : 0), z, rr.pick(['#c8b48a', '#b8a07a', '#d0c098']), 0.24, rr() * 2);
    }
    lampC(k, mid(r), (li < 4 ? levels[li + 1] - 0.24 : r.yC), 3, { kind: 'cage', r: 5, i: 0.5 });
    A.spots.push({ x: r.x0 + 3 + li * 2.5, y, z: 1.2, face: 'out' });
  });
};
function car(k, x, y, z, c) {
  k.box(x - 2.2, y + 0.35, z, x + 2.2, y + 1.0, z + 1.7, C(c));
  k.box(x - 0.8, y + 1.0, z + 0.1, x + 1.0, y + 1.55, z + 1.6, C(shade(c, -0.15)));
  k.box(x - 0.75, y + 1.06, z + 0.08, x + 0.95, y + 1.48, z + 0.1, C('#a8c0c8'));
  for (const dx of [-1.4, 1.4]) for (const dz of [0.05, 1.45]) k.cyl(x + dx, y + 0.38, z + dz, 0.38, 0.22, C('#2a2826'), { axis: 'z', seg: 9 });
  k.box(x - 2.35, y + 0.55, z + 0.3, x - 2.2, y + 0.95, z + 1.4, C('#c8c8c0'));
}
FURN.hold2 = (k, r, A) => {
  slab(k, r.x0 + 0.2, r.x1 - 0.2, DK.F, M.slabCut, { top: F_('#8a7a62', 'planks', 0.3), th: 0.24, zIn: 0.4 });
  slab(k, r.x0 + 0.2, r.x1 - 0.2, DK.H, M.slabCut, { top: F_('#8a7a62', 'planks', 0.3), th: 0.24, zIn: 0.4 });
  car(k, 34.5, DK.F, 1.0, '#1e2a4a'); car(k, 40.5, DK.F, 1.4, '#5a1e1e'); car(k, 45.0, DK.F, 3.6, '#2a3a2a');
  car(k, 37.5, DK.F, 4.0, '#3a3a3a');
  const rr = k.rng('crates');
  for (let i = 0; i < 16; i++) { const x = 31 + rr() * 16; const w = 0.8 + rr() * 1.2; k.box(x - w / 2, DK.H, 1 + rr() * 6, x + w / 2, DK.H + 0.6 + rr() * 1.2, 2.5 + rr() * 6, C('#b08a52', { pat: 'planks', s: 0.25 })); }
  for (let i = 0; i < 10; i++) { const x = 31 + rr() * 16; k.box(x - 0.6, DK.tt, 1 + rr() * 6, x + 0.6, DK.tt + 1.0, 2.2 + rr() * 7, C('#a07a4a', { pat: 'planks', s: 0.3 })); }
  lampC(k, 39, DK.E - 0.3, 3, { kind: 'cage', r: 6, i: 0.6 });
  lampC(k, 39, DK.F - 0.3, 3, { kind: 'cage', r: 5, i: 0.5 });
  A.spots.push({ x: 42, y: DK.F, z: 1.2, face: 'out' });
};
FURN.tank = (k, r) => {
  for (let x = r.x0 + 0.5; x < r.x1 - 3; x += 7.5) {
    k.box(x, r.yF, 1.0, x + 6.6, r.yC - 0.4, r.d - 0.3, C('#5a6a72', { pat: 'rivets', s: 0.6, cut: '#2a3236' }));
    k.cyl(x + 3.3, r.yC - 0.4, 2, 0.14, 0.4, C('#b8bcc0'), { seg: 6 });
  }
  k.cyl(r.x0, r.yC - 0.25, 1.4, 0.12, r.x1 - r.x0, C('#c8ccd0'), { axis: 'x', seg: 6 });
};
FURN.wine = (k, r, A) => {
  for (let x = r.x0 + 0.8; x < r.x1 - 1; x += 1.6) k.box(x, r.yF, r.d - 1.0, x + 1.3, r.yC - 0.3, r.d - 0.05, C('#5a3a28', { pat: 'grate', c2: '#2a3a28' }));
  for (let i = 0; i < 6; i++) { const x = r.x0 + 1.2 + i * 1.9; k.cyl(x - 0.45, r.yF + 0.36, 1.6, 0.34, 0.9, C('#8a5a32', { pat: 'grain' }), { axis: 'x', seg: 10 }); }
  lampC(k, mid(r), r.yC, 2, { kind: 'cage', r: 4, i: 0.5 });
  A.spots.push({ x: r.x0 + 2, y: r.yF, z: 1.4, face: 'in' });
};
FURN.stores = (k, r, A) => {
  const rr = k.rng('st' + r.x0 + r.yF);
  const n = Math.round((r.x1 - r.x0) / 1.4);
  for (let i = 0; i < n; i++) {
    const x = r.x0 + 0.7 + i * 1.4;
    if (r.paint) { for (let j = 0; j < 3; j++) k.cyl(x - 0.3 + j * 0.3, r.yF, r.d - 0.6, 0.13, 0.35, C(rr.pick(['#b8402e', '#f2ece0', '#2a2622', '#c8a050'])), { seg: 7 }); continue; }
    if (r.linen) { shelfRack(k, x - 0.6, x + 0.6, r.yF, r.d - 0.6, 2.2, 0.55, '#c8c0a8', '#f2f0ea', 5); continue; }
    if (rr() < 0.5) shelfRack(k, x - 0.6, x + 0.6, r.yF, r.d - 0.6, 2.0, 0.55, '#8a7a5a', rr.pick(['#c8b890', '#b8a070', '#d0c8a8']), 4);
    else { k.box(x - 0.5, r.yF, r.d - 1.3, x + 0.5, r.yF + 0.8 + rr() * 0.6, r.d - 0.1, C('#b08a52', { pat: 'planks', s: 0.25 })); sack(k, x, r.yF, 1.4, '#d0c098', 0.25, rr()); }
  }
  for (let x = r.x0 + 4; x < r.x1; x += 9) lampC(k, x, r.yC, 1.8, { kind: 'cage', r: 4, i: 0.5 });
  A.spots.push({ x: r.x0 + 2, y: r.yF, z: 1.2, face: 'in' });
};
FURN.baggage = (k, r, A) => {
  const rr = k.rng('bag' + r.x0);
  for (let i = 0; i < (r.x1 - r.x0) * 1.5; i++) {
    const x = r.x0 + 0.6 + rr() * (r.x1 - r.x0 - 1.2), z = 1.3 + rr() * (r.d - 1.8);
    const w = 0.6 + rr() * 0.6, h = 0.35 + rr() * 0.4;
    trunk(k, x, r.yF + (rr() < 0.3 ? 0.5 : 0), z, w, h, 0.45, rr.pick(['#6a4a2a', '#3a4a5a', '#7a2a1a', '#5a5a3a', '#2a2a2a', '#8a6a3a']));
  }
  if (!r.aft) for (let i = 0; i < 12; i++) sack(k, 50 + rr() * 8, r.yF, 1.1 + rr() * 2, '#c8b48a', 0.24, rr() * 3);
  for (let x = r.x0 + 5; x < r.x1; x += 12) lampC(k, x, r.yC, 2, { kind: 'cage', r: 5, i: 0.5 });
  A.spots.push({ x: r.x0 + 3, y: r.yF, z: 1.1, face: 'out' });
};
FURN.specie = (k, r, A) => {
  // The strong room: a steel grille in front of stacked bullion boxes and gold bars.
  bars(k, r.x0 + 4, r.x1 - 0.5, r.yF, r.yC - 0.1, 1.4, 0.16, '#3a3e44');
  for (let i = 0; i < 14; i++) { const x = r.x0 + 4.6 + (i % 7) * 0.6, yy = r.yF + Math.floor(i / 7) * 0.3; k.box(x, yy, 2.0, x + 0.5, yy + 0.28, 2.5, C('#7a5a3a', { pat: 'planks', s: 0.1 })); }
  for (let i = 0; i < 12; i++) { const x = r.x0 + 5 + (i % 6) * 0.22, yy = r.yF + 0.62 + Math.floor(i / 6) * 0.07; k.box(x, yy, 2.9, x + 0.18, yy + 0.07, 3.0, C('#e0b840', { c2: '#ffd860', pat: 'none' })); }
  k.box(r.x0 + 0.5, r.yF, r.d - 0.6, r.x0 + 3.2, r.yC - 0.2, r.d - 0.05, C('#5a5e64', { pat: 'rivets', s: 0.3 }));
  for (let i = 0; i < 8; i++) sack(k, r.x0 + 0.8 + (i % 4) * 0.6, r.yF + Math.floor(i / 4) * 0.4, 1.0, '#c8b48a', 0.24, i);
  lampC(k, r.x0 + 6.5, r.yC, 2.2, { kind: 'cage', r: 4, i: 0.6 });
  A.spots.push({ x: r.x0 + 2.2, y: r.yF, z: 1.0, face: 1 });
};
FURN.lampstore = (k, r, A) => {
  shelfRack(k, r.x0 + 0.6, r.x1 - 0.6, r.yF, r.d - 0.6, 2.1, 0.5, '#7a6a5a', null, 4);
  for (let x = r.x0 + 1; x < r.x1 - 1; x += 0.45) for (let j = 0; j < 3; j++) { k.box(x - 0.1, r.yF + 0.13 + j * 0.5, r.d - 0.4, x + 0.1, r.yF + 0.42 + j * 0.5, r.d - 0.2, C(j === 1 ? '#c83a2a' : j === 2 ? '#3a8a3a' : '#c8a050')); }
  counter(k, r.x0 + 2, r.x0 + 4.5, r.yF, 1.6, 0.6, 0.9, '#7a5a3a', '#8a6a4a');
  A.spots.push({ x: r.x0 + 3.2, y: r.yF, z: 1.2, face: 'in' });
  lampC(k, r.x0 + 3.2, r.yC, 1.8, { kind: 'bulb', r: 3.5, i: 0.7 });
};
FURN.carpenter = (k, r, A) => {
  counter(k, r.x0 + 1, r.x0 + 4.5, r.yF, 1.6, 0.7, 0.85, '#8a6a42', '#b08a5a');
  k.box(r.x0 + 1.5, r.yF + 0.85, 1.7, r.x0 + 3.8, r.yF + 0.95, 2.0, C('#d8b880', { pat: 'grain' }));
  for (let i = 0; i < 8; i++) k.box(r.x0 + 0.5 + i * 0.12, r.yF, r.d - 0.4, r.x0 + 0.6 + i * 0.12, r.yF + 2.2, r.d - 0.1, C('#c8a070', { pat: 'grain' }));
  shelfRack(k, r.x1 - 2.6, r.x1 - 0.4, r.yF, r.d - 0.6, 1.9, 0.5, '#7a5a3a', '#6a6a6a', 3);
  A.spots.push({ x: r.x0 + 2.8, y: r.yF, z: 1.1, face: 'in' });
  lampC(k, r.x0 + 3, r.yC, 2, { kind: 'bulb', r: 3.5, i: 0.8 });
};
FURN.bosun = (k, r, A) => {
  for (let x = r.x0 + 4; x < r.x1 - 1; x += 1.8) { k.cyl(x, r.yF, r.d - 1.0, 0.65, 0.4, C('#c8a868', { pat: 'rings', s: 0.08 }), { seg: 10 }); k.cyl(x, r.yF + 0.4, r.d - 1.0, 0.55, 0.3, C('#b89858', { pat: 'rings', s: 0.08 }), { seg: 10 }); }
  for (let i = 0; i < 5; i++) k.cyl(r.x0 + 4.5 + i * 0.5, r.yF, 1.6, 0.2, 0.55, C(i % 2 ? '#b8402e' : '#2a2622'), { seg: 8 });
  lampC(k, mid(r), r.yC, 2, { kind: 'bulb', r: 4, i: 0.6 });
  A.spots.push({ x: r.x0 + 6, y: r.yF, z: 1.1, face: 'out' });
};
FURN.rope = (k, r, A) => {
  for (let x = r.x0 + 5; x < r.x1 - 1; x += 2.2) k.cyl(x, r.yF, 1.6, 0.8, 0.5, C('#c8a868', { pat: 'rings', s: 0.08 }), { seg: 10 });
  lampC(k, 16, r.yC, 2, { kind: 'bulb', r: 4, i: 0.6 });
  A.spots.push({ x: 18, y: r.yF, z: 1.0, face: 'out' });
};
FURN.well = (k, r, A) => {
  // Hatch coamings with tarpaulin covers, and bitts.
  for (const [a, b] of [[32, 40], [41.5, 47]]) {
    k.box(a, r.yF, 0.0, b, r.yF + 0.9, 5.5, C('#f0e9da', { cut: '#a89a84' }));
    k.box(a - 0.1, r.yF + 0.9, -0.1, b + 0.1, r.yF + 1.1, 5.6, C('#4a5a4a', { pat: 'canvas', s: 1.2 }));
  }
  for (const x of [36, 52]) { k.cyl(x - 0.3, r.yF, 8, 0.2, 0.8, M.darkGrey, { seg: 8 }); k.cyl(x + 0.3, r.yF, 8, 0.2, 0.8, M.darkGrey, { seg: 8 }); }
  // The step up to the superstructure front.
  k.box(53.5, r.yF, 6, 55, r.yF + 0.4, 9, C('#f0e9da'));
  A.spots.push({ x: 40, y: r.yF, z: 7, face: 'out' });
};

// ---- Third Class
FURN.galley3 = (k, r, A) => {
  stoveRange(k, r.x0 + 2, r.x0 + 9, r.yF, r.d - 1.3, 1.2);
  for (let i = 0; i < 4; i++) pot(k, r.x0 + 2.8 + i * 1.6, r.yF + 0.94, r.d - 1.0, 0.25, '#b8bcc0');
  for (let i = 0; i < 3; i++) { const x = r.x0 + 11 + i * 1.4; k.cyl(x, r.yF, r.d - 1.4, 0.55, 0.9, C('#b8bcc0'), { seg: 10 }); k.cyl(x, r.yF + 0.9, r.d - 1.4, 0.58, 0.08, C('#a8acb0'), { seg: 10 }); }
  counter(k, r.x0 + 16, r.x1 - 1.5, r.yF, 2.0, 0.8, 0.95, '#c8ccd0', '#e0e4e8');
  shelfRack(k, r.x0 + 16, r.x1 - 1.5, r.yF + 1.2, r.d - 0.5, 1.2, 0.4, '#a8acb0', '#f2f0e8', 3);
  for (let x = r.x0 + 3; x < r.x1; x += 7) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 5, i: 0.9, color: '#fff0d0' });
  for (let i = 0; i < 4; i++) A.spots.push({ x: r.x0 + 3 + i * 2.8, y: r.yF, z: r.d - 2.0, face: 'in' });
  A.spots.push({ x: r.x0 + 19, y: r.yF, z: 1.4, face: 'in' });
};
FURN.dining3 = (k, r, A) => {
  // Tables for four to ten with fresh flowers; etched glass panels on the wall.
  for (let x = r.x0 + 2.2; x < r.x1 - 1.5; x += 3.3) {
    for (const [z, w] of [[1.8, 2.2], [4.6, 2.8], [7.0, 1.6]]) {
      if (z + 0.9 > r.d - 0.3) continue;
      table(k, x, r.yF, z, w, 0.9, { cloth: '#f4f0e6', items: 'set', flowers: z === 4.6 ? '#d84a5a' : null });
      const nn = Math.round(w / 0.6);
      for (let s = 0; s < nn; s++) {
        const cx = x - w / 2 + (s + 0.5) * (w / nn);
        const c1 = chair(k, cx, r.yF, z - 0.5, '#c8783a', 'in', { legs: true, w: 0.42, d: 0.42, bh: 0.45 });
        const c2 = chair(k, cx, r.yF, z + 0.95, '#c8783a', 'out', { legs: true, w: 0.42, d: 0.42, bh: 0.45 });
        A.seats.push({ x: cx, y: r.yF, z: z - 0.29, face: 'in', seat: 0.4 }, { x: cx, y: r.yF, z: z + 1.16, face: 'out', seat: 0.4 });
        void c1; void c2;
      }
    }
  }
  for (let x = r.x0 + 1.5; x < r.x1 - 1; x += 4.4) k.box(x, r.yF + 1.3, r.d - 0.05, x + 2.4, r.yC - 0.4, r.d - 0.01, C('#d8e4e4', { pat: 'panes', s: 0.6, c2: '#ffe4b0', glow: 'night' }));
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 3.5, { kind: 'dish', r: 6, i: 0.9 });
};
FURN.cinema3 = (k, r, A) => {
  // Cinema at the after end: about 120 stacking chairs in rows facing the screen; library forward.
  const sx = r.x1 - 0.4;
  k.box(sx - 0.1, r.yF + 0.6, 1.5, sx, r.yC - 0.3, r.d - 1.2, C('#f4f2ea', { c2: '#ffffff', glow: 'night' }));
  for (let x = r.x0 + 7.5; x < r.x1 - 3; x += 1.0) for (let z = 1.6; z < r.d - 0.8; z += 0.65) {
    const c = chair(k, x, r.yF, z, '#4a2a22', 1, { legs: true, w: 0.42, d: 0.42, bh: 0.42 });
    A.seats.push({ x, y: r.yF, z: z + 0.21, face: 1, seat: 0.46 });
    void c;
  }
  for (let x = r.x0 + 0.6; x < r.x0 + 5.8; x += 1.7) shelfRack(k, x, x + 1.5, r.yF, r.d - 0.6, 2.0, 0.5, '#8a3a2a', '#a0603a', 5);
  table(k, r.x0 + 3.5, r.yF, 2.0, 1.6, 0.8, { top: '#6a3a22' });
  for (const s of [-0.5, 0.5]) { const c = chair(k, r.x0 + 3.5 + s, r.yF, 1.4, '#7a4a2a', 'in', { legs: true }); A.seats.push({ x: c.x, y: r.yF, z: 1.63, face: 'in', seat: 0.46 }); }
  k.box(r.x0 + 6.2, r.yF + 1.6, r.d - 0.5, r.x0 + 6.6, r.yF + 2.0, r.d - 0.1, C('#3a3a3a'));
  lampC(k, r.x0 + 3, r.yC, 2.5, { kind: 'dish', r: 5 });
  lampC(k, r.x0 + 11, r.yC, 3, { kind: 'dish', r: 5, i: 0.5 });
  r.screen = [sx - 0.1, r.yF + 1.5, 4];
  r.projector = [r.x0 + 6.4, r.yF + 1.8, r.d - 0.3];
};
FURN.synagogue = (k, r, A) => {
  // Seats 23: cushioned pews facing the Ark at the after end.
  k.box(r.x1 - 0.8, r.yF, 1.8, r.x1 - 0.1, r.yF + 2.0, r.d - 1.2, C('#8a5a32', { pat: 'panels', s: 0.5 }));
  k.box(r.x1 - 0.85, r.yF + 2.05, 2.8, r.x1 - 0.1, r.yF + 2.25, 3.4, C('#c8a050'));
  for (let x = r.x0 + 0.8; x < r.x1 - 1.6; x += 1.1) {
    k.box(x - 0.2, r.yF, 1.4, x + 0.25, r.yF + 0.45, r.d - 0.5, C('#7a2a2a'));
    k.box(x - 0.25, r.yF + 0.45, 1.4, x - 0.15, r.yF + 0.95, r.d - 0.5, C('#8a5a32'));
    for (let z = 1.7; z < r.d - 0.6; z += 0.9) A.seats.push({ x, y: r.yF, z, face: 1, seat: 0.47 });
  }
  for (let i = 0; i < 3; i++) k.cyl(r.x0 + 1.2 + i * 1.2, r.yC - 0.5, r.d - 0.06, 0.18, 0.04, C('#c8a050'), { axis: 'z', seg: 10 });
  lampC(k, mid(r), r.yC, 2.5, { kind: 'chand', r: 4, i: 0.8 });
};
FURN.playroom3 = (k, r, A) => {
  k.box(r.x0 + 0.4, r.yF + 0.9, r.d - 0.06, r.x0 + 2.6, r.yF + 2.0, r.d - 0.02, C('#2a3a2e'));
  picture(k, r.x0 + 4, r.yF + 1.0, r.d, 1.6, 1.0, '#4a7aa0', '#c8a050');
  // Rocking horse.
  const hx = r.x0 + 3.0;
  k.box(hx - 0.5, r.yF + 0.05, 2.4, hx + 0.5, r.yF + 0.12, 2.8, C('#8a3a2a'));
  k.box(hx - 0.35, r.yF + 0.45, 2.48, hx + 0.35, r.yF + 0.75, 2.72, C('#f0e8d8'));
  k.box(hx + 0.28, r.yF + 0.7, 2.52, hx + 0.48, r.yF + 1.05, 2.68, C('#f0e8d8'));
  for (const dx of [-0.3, 0.3]) k.box(hx + dx - 0.03, r.yF + 0.1, 2.55, hx + dx + 0.03, r.yF + 0.45, 2.65, C('#f0e8d8'));
  table(k, r.x0 + 1.5, r.yF, 1.6, 1.4, 0.7, { top: '#c8a070', h: 0.5 });
  A.seats.push({ x: r.x0 + 1.1, y: r.yF, z: 1.35, face: 'in', seat: 0.3 }, { x: r.x0 + 1.9, y: r.yF, z: 1.35, face: 'in', seat: 0.3 });
  A.spots.push({ x: hx, y: r.yF, z: 2.0, face: 'out' });
  lampC(k, mid(r), r.yC, 2.5, { kind: 'dish', r: 4 });
};
FURN.smoke3 = (k, r, A) => {
  settee(k, r.x0 + 0.6, r.x1 - 4, r.yF, r.d - 0.7, '#5a7a4a');
  for (let x = r.x0 + 2; x < r.x1 - 4; x += 3) {
    table(k, x, r.yF, 2.6, 1.0, 0.8, { top: '#7a5a32', items: x % 2 ? 'cards' : 'glass' });
    for (const s of [-0.55, 0.55]) { const c = chair(k, x + s, r.yF, 1.5, '#8a6a42', 'in', { legs: true }); A.seats.push({ x: c.x, y: r.yF, z: 1.73, face: 'in', seat: 0.46 }); }
    A.seats.push({ x, y: r.yF, z: r.d - 0.4, face: 'out', seat: 0.46 });
  }
  counter(k, r.x1 - 3.4, r.x1 - 0.4, r.yF, 2.2, 0.7, 1.05, '#6a4a2a', '#8a6a42');
  shelfRack(k, r.x1 - 3.4, r.x1 - 0.4, r.yF + 1.2, r.d - 0.45, 1.1, 0.35, '#6a4a2a', '#5a7a4a', 2);
  A.spots.push({ x: r.x1 - 1.9, y: r.yF, z: r.d - 1.1, face: 'out' });
  for (let i = 0; i < 6; i++) porthole(k, r.x0 + 1.5 + i * 2.6, r.yF + 1.6, r.d, { r: 0.18 });
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 3, { kind: 'dish', r: 5.5 });
};
FURN.garden3 = (k, r, A) => {
  // Semicircular room facing forward: wicker chairs round small tables, three jardinieres.
  for (let x = r.x0 + 2.5; x < r.x1 - 1; x += 2.6) for (const z of [1.8, 4.6]) {
    if (z + 1 > r.d) continue;
    roundTable(k, x, r.yF, z + 0.5, 0.42, { top: '#c8a870', h: 0.62 });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.75, r.yF, z + 0.28, '#d8c090', -s, { w: 0.5, d: 0.5, bh: 0.55 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.47 }); }
  }
  for (let i = 0; i < 3; i++) plant(k, r.x0 + 2 + i * 3.2, r.yF, r.d - 1.0, 1.1, '#c8b890');
  for (let x = r.x0 + 3; x < r.x1; x += 5) lampC(k, x, r.yC, 3, { kind: 'dish', r: 5 });
};

// ---- Cabin Class public rooms
FURN.pool = (k, r, A) => {
  // Basin 35 x 22 ft (10.7 x 6.7 m), 6 ft deep forward to 4 ft aft; diving boards, chute, balcony.
  const bx0 = r.x0 + 1.4, bx1 = bx0 + 10.7, bz0 = 0.6, bz1 = Math.min(bz0 + 6.7, r.d - 1.2);
  const wl = DK.C - 0.4;
  const tile = C('#e8d8a0', { pat: 'tiles', s: 0.25, cut: '#b8a878' });
  k.box(bx0 - 0.3, r.yF, -0.45, bx0, wl, bz1 + 0.3, tile);
  k.box(bx1, r.yF, -0.45, bx1 + 0.3, wl, bz1 + 0.3, tile);
  k.box(bx0, r.yF, bz1, bx1, wl, bz1 + 0.3, tile);
  k.box(bx0, r.yF - 0.01, -0.45, bx1, r.yF + 0.05, bz1, C('#c8e0d0', { pat: 'tiles', s: 0.3 }));
  k.box(bx0, wl - 0.25, bz1 - 0.04, bx1, wl - 0.1, bz1, C('#2a8a5a'));
  k.box(bx0, wl - 0.45, bz1 - 0.04, bx1, wl - 0.3, bz1, C('#c83a2a'));
  // Deck round the pool at C level.
  slab(k, r.x0, bx0 - 0.3, wl, M.slabCut, { top: tile, th: wl - r.yF });
  slab(k, bx1 + 0.3, r.x1, wl, M.slabCut, { top: tile, th: wl - r.yF });
  slab(k, bx0 - 0.3, bx1 + 0.3, wl, M.slabCut, { top: tile, th: 0.3, zIn: bz1 + 0.3 });
  // Water: a translucent surface and its cut face (overlay pass).
  k.glass([[bx0, wl - 0.25, 0.0], [bx1, wl - 0.25, 0.0], [bx1, wl - 0.25, bz1], [bx0, wl - 0.25, bz1]], { c: '#5ab8c8', alpha: 0.42 });
  k.sheet(bx0, bx1, r.yF + 0.05, wl - 0.25, 0.02, { c: '#4aa8c0', alpha: 0.35 });
  r.water = { x0: bx0, x1: bx1, y: wl - 0.25, z0: 0, z1: bz1 };
  // Diving boards at the deep (forward) end, the chute, ladders.
  k.box(bx0 - 0.3, wl + 0.3, 2.2, bx0 + 1.6, wl + 0.38, 2.7, C('#c8a878'));
  k.box(bx0 - 0.3, wl + 1.3, 4.2, bx0 + 1.2, wl + 1.38, 4.7, C('#c8a878'));
  k.box(bx0 - 0.5, wl, 4.2, bx0 - 0.3, wl + 1.38, 4.7, C('#e8e0d0'));
  k.tube([[bx1 - 0.4, wl + 2.2, 4.5], [bx1 - 1.6, wl + 1.3, 4.5], [bx1 - 2.6, wl - 0.1, 4.5]], 0.25, C('#e8d8a0'), { seg: 6 });
  for (const x of [bx0 + 3, bx1 - 3]) for (let s = 0; s < 4; s++) k.box(x - 0.25, wl - 0.25 - s * 0.35, bz1 - 0.18, x + 0.25, wl - 0.22 - s * 0.35, bz1, C('#c8ccd0'));
  // Balcony at B-deck level with the dressing boxes and Turkish bath doors.
  const by = DK.C + 1.6;
  k.box(r.x0, by - 0.2, r.d - 2.0, r.x1, by, r.d, C('#e8e0c8', { cut: '#a89a84' }));
  for (let x = r.x0 + 0.5; x < r.x1 - 0.5; x += 1.25) k.box(x, by, r.d - 0.4, x + 1.1, by + 1.9, r.d - 0.05, C('#d8e0c8', { pat: 'panels', s: 0.55, c2: '#2a8a5a' }));
  props_rail(k, r.x0, r.x1, by, r.d - 2.0);
  for (let x = r.x0 + 2; x < r.x1; x += 4.5) lampC(k, x, r.yC, 3, { kind: 'trough', w: 2.2, r: 6, i: 0.9, color: '#e8f0ff' });
  A.water = r.water;
  for (let i = 0; i < 4; i++) A.spots.push({ x: bx0 + 1.5 + i * 2.6, y: wl - 0.5, z: 1.5 + (i % 2) * 2.5, face: i % 2 ? 1 : -1, swim: true });
  A.spots.push({ x: r.x1 - 0.7, y: wl, z: 1.2, face: -1 }, { x: r.x0 + 0.6, y: wl, z: 1.2, face: 1 });
  for (let i = 0; i < 3; i++) A.seats.push({ x: r.x0 + 2 + i * 3.5, y: by, z: r.d - 1.4, face: 'out', seat: 0.0 });
};
function props_rail(k, x0, x1, y, z) {
  const m = C('#c8a050');
  k.cyl(x0, y + 0.95, z, 0.03, x1 - x0, m, { axis: 'x', seg: 5 });
  for (let x = x0 + 0.3; x < x1; x += 0.9) k.cyl(x, y, z, 0.02, 0.95, m, { seg: 4 });
}
FURN.privdine = (k, r, A) => {
  k.box(r.x0 + 4.5, r.yF, -0.45, r.x0 + 4.6, r.yC, r.d, W('#c89a62', { pat: 'grain' }));
  for (const [x, w] of [[r.x0 + 2.2, 2.8], [r.x0 + 6.7, 2.6]]) {
    table(k, x, r.yF, 2.0, w, 1.1, { cloth: '#f6f2ea', items: 'set', flowers: '#e8b04a' });
    for (let s = -w / 2 + 0.35; s < w / 2; s += 0.7) { chair(k, x + s, r.yF, 1.4, '#a8402e', 'in', { legs: true }); chair(k, x + s, r.yF, 3.15, '#a8402e', 'out', { legs: true }); A.seats.push({ x: x + s, y: r.yF, z: 1.63, face: 'in', seat: 0.46 }, { x: x + s, y: r.yF, z: 3.38, face: 'out', seat: 0.46 }); }
    lampC(k, x, r.yC, 2.5, { kind: 'chand', r: 4, i: 0.9 });
  }
};
FURN.restaurant = (k, r, A) => {
  // The great room: tables with white cloths, autumn-red chairs, the Atlantic map on the end wall.
  const zmax = r.d - 0.8;
  for (let x = r.x0 + 1.6; x < r.x1 - 1; x += 2.6) for (let z = 1.5; z < zmax - 1; z += 2.4) {
    const round = (Math.round(x * 3) + Math.round(z)) % 2 === 0;
    if (round) roundTable(k, x, r.yF, z + 0.6, 0.55, { cloth: '#f6f2ea', flowers: ((x * 7) | 0) % 3 === 0 ? '#e86a3a' : null, lamp: ((x * 5 + z) | 0) % 4 === 0 });
    else table(k, x, r.yF, z + 0.15, 1.3, 0.9, { cloth: '#f6f2ea', items: 'set' });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.85, r.yF, z + 0.38, '#b8482e', -s, { w: 0.46, d: 0.46, bh: 0.6, legs: true }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.47 }); }
  }
  // The decorative map of the North Atlantic (24 x 15 ft) with the crystal ship on its track.
  const mx0 = mid(r) - 3.65, mx1 = mid(r) + 3.65, my0 = r.yF + 2.6, my1 = my0 + 4.6;
  k.box(mx0 - 0.2, my0 - 0.2, r.d - 0.08, mx1 + 0.2, my1 + 0.2, r.d - 0.02, C('#7a5a32'));
  k.box(mx0, my0, r.d - 0.1, mx1, my1, r.d - 0.08, C('#5a7a8a', { pat: 'speckle', c2: '#7a9aa8' }));
  k.box(mx0 + 0.2, my0 + 0.8, r.d - 0.11, mx0 + 1.6, my1 - 0.4, r.d - 0.1, C('#c8b07a', { pat: 'rock', c2: '#a89060' }));
  k.box(mx1 - 1.5, my0 + 0.3, r.d - 0.11, mx1 - 0.2, my1 - 0.6, r.d - 0.1, C('#c8b07a', { pat: 'rock', c2: '#a89060' }));
  r.map = { x0: mx1 - 1.6, x1: mx0 + 1.7, y0: my0 + 2.6, y1: my0 + 2.1, z: r.d - 0.13 };
  for (const x of [mid(r) - 9, mid(r) + 9]) picture(k, x, r.yF + 2.4, r.d, 2.2, 3.2, '#c8a070', '#8a6a3a');
  // Columns and the tall central lighting.
  for (const x of [r.x0 + 0.3, r.x1 - 0.3]) for (const z of [2.5, 7]) if (z < r.d) k.box(x - 0.25, r.yF, z, x + 0.25, r.yC, z + 0.5, C('#b88a52', { pat: 'grain' }));
  for (let x = r.x0 + 3; x < r.x1; x += 6) for (const z of [2.5, 7]) lampC(k, x, r.yC, z, { kind: 'chand', r: 7, i: 0.9 });
  for (let x = r.x0 + 1; x < r.x1; x += 4) k.box(x, r.yF + 2.9, r.d - 0.05, x + 0.4, r.yF + 3.3, r.d - 0.02, C('#f4e4c0', { c2: '#ffe0a0', glow: 'night' }));
  A.spots.push({ x: mid(r), y: r.yF, z: r.d - 1.5, face: 'out' });
};
FURN.restaurantB = (k, r, A) => {
  for (let x = r.x0 + 1.5; x < r.x1 - 0.8; x += 2.6) for (let z = 1.5; z < r.d - 1.5; z += 2.4) {
    roundTable(k, x, r.yF, z + 0.6, 0.55, { cloth: '#f6f2ea' });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.85, r.yF, z + 0.38, '#b8482e', -s, { w: 0.46, d: 0.46, bh: 0.6, legs: true }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.47 }); }
  }
  for (let x = r.x0 + 2; x < r.x1; x += 5) lampC(k, x, r.yC, 3, { kind: 'dish', r: 5 });
  A.spots.push({ x: r.x1 - 1.5, y: r.yF, z: 1.2, face: -1 });
};
FURN.kitchen = (k, r, A) => {
  // Full-width galley in nickel and Monel: ranges, steam kettles, the bakery, dishwashers.
  const steel = '#c8ccd0';
  stoveRange(k, r.x0 + 2, r.x0 + 12, r.yF, r.d - 1.6, 1.3, '#4a4a4e');
  k.box(r.x0 + 2, r.yF + 2.0, r.d - 1.6, r.x0 + 12, r.yC - 0.2, r.d - 0.1, C('#b8bcc0', { pat: 'plates', s: 0.6 }));
  for (let i = 0; i < 5; i++) pot(k, r.x0 + 3 + i * 2, r.yF + 0.94, r.d - 1.3, 0.28, i % 2 ? '#c8ccd0' : '#a87048');
  for (let i = 0; i < 4; i++) { const x = r.x0 + 14 + i * 1.5; k.cyl(x, r.yF, r.d - 1.6, 0.6, 1.0, C(steel), { seg: 10 }); k.cyl(x, r.yF + 1.0, r.d - 1.6, 0.62, 0.08, C('#a8acb0'), { seg: 10 }); }
  // Bakery: ovens and the dough mixer.
  k.box(r.x0 + 21, r.yF, r.d - 1.8, r.x0 + 26, r.yF + 2.0, r.d - 0.1, C('#6a6a6a', { pat: 'panels', s: 1.2 }));
  for (let i = 0; i < 3; i++) k.box(r.x0 + 21.4 + i * 1.6, r.yF + 0.6, r.d - 1.82, r.x0 + 22.6 + i * 1.6, r.yF + 1.2, r.d - 1.8, C('#2a2826'));
  k.lamp(r.x0 + 23.5, r.yF + 0.9, r.d - 2.0, { always: true, color: '#ff9a50', r: 3, i: 0.5, bulb: false, halo: 0.3 });
  k.cyl(r.x0 + 27.5, r.yF, 2.8, 0.55, 1.1, C(steel), { seg: 10 });
  k.box(r.x0 + 27.4, r.yF + 1.1, 2.75, r.x0 + 27.6, r.yF + 1.7, 3.6, C('#8a8e92'));
  // Long dresser tables of Staybrite steel, and dishwashing machines aft.
  for (let x = r.x0 + 2; x < r.x1 - 9; x += 7) counter(k, x, x + 5.5, r.yF, 1.8, 0.9, 0.92, '#a8acb0', '#e0e4e8');
  for (let i = 0; i < 2; i++) k.box(r.x1 - 7 + i * 3, r.yF, r.d - 1.6, r.x1 - 5 + i * 3, r.yF + 1.5, r.d - 0.1, C('#9a9ea2', { pat: 'rivets', s: 0.3 }));
  shelfRack(k, r.x1 - 8, r.x1 - 1, r.yF + 1.6, r.d - 0.4, 0.9, 0.3, '#a8acb0', '#f4f0e8', 2);
  for (let x = r.x0 + 3; x < r.x1; x += 5.5) lampC(k, x, r.yC, 3, { kind: 'dish', r: 5.5, i: 1.0, color: '#fff2d8' });
  for (let i = 0; i < 6; i++) A.spots.push({ x: r.x0 + 3 + i * 1.9, y: r.yF, z: r.d - 2.4, face: 'in' });
  for (let i = 0; i < 4; i++) A.spots.push({ x: r.x0 + 4 + i * 7, y: r.yF, z: 1.35, face: 'in' });
  A.spots.push({ x: r.x0 + 23.5, y: r.yF, z: r.d - 2.5, face: 'in' }, { x: r.x1 - 5.5, y: r.yF, z: r.d - 2.2, face: 'in' });
};
FURN.dining2 = (k, r, A) => {
  for (let x = r.x0 + 2; x < r.x1 - 1.5; x += 3.0) for (let z = 1.6; z < r.d - 1.4; z += 2.6) {
    table(k, x, r.yF, z, 1.6, 0.9, { cloth: '#f4f0e6', items: 'set', flowers: ((x | 0) % 3 === 0 && z < 2) ? '#e8a0b0' : null });
    for (let s = -0.4; s <= 0.41; s += 0.8) { chair(k, x + s, r.yF, z - 0.5, '#d89a9a', 'in', { legs: true }); chair(k, x + s, r.yF, z + 0.95, '#d89a9a', 'out', { legs: true }); A.seats.push({ x: x + s, y: r.yF, z: z - 0.27, face: 'in', seat: 0.46 }, { x: x + s, y: r.yF, z: z + 1.18, face: 'out', seat: 0.46 }); }
  }
  // Eight back-lit glass panels of cereals and fruit.
  for (let i = 0; i < 4; i++) k.box(r.x0 + 1.5 + i * 5.6, r.yF + 1.1, r.d - 0.04, r.x0 + 4.3 + i * 5.6, r.yC - 0.3, r.d, C('#e8d8a0', { c2: '#ffe8b0', glow: 'always', pat: 'panes', s: 0.45 }));
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 3.5, { kind: 'dish', r: 6 });
};
FURN.pig = (k, r, A) => {
  for (let x = r.x0 + 2; x < r.x1 - 3.5; x += 2.8) {
    table(k, x, r.yF, 1.8, 1.2, 0.8, { top: '#8a6a42', items: 'glass' });
    for (const s of [-0.75, 0.75]) { chair(k, x + s, r.yF, 1.95, '#6a4a2a', -Math.sign(s), { legs: true, w: 0.4, d: 0.4 }); A.seats.push({ x: x + s, y: r.yF, z: 2.15, face: -Math.sign(s), seat: 0.46 }); }
  }
  counter(k, r.x1 - 3.2, r.x1 - 0.4, r.yF, 1.6, 0.7, 1.05, '#7a5a3a', '#9a7a52');
  for (let i = 0; i < 5; i++) k.cyl(r.x1 - 3 + i * 0.5, r.yF + 1.05, 1.9, 0.05, 0.16, C('#e8c860'), { seg: 6 });
  // The dartboard.
  k.cyl(r.x0 + 0.4, r.yF + 1.73, 2.4, 0.23, 0.05, C('#2a2622', { pat: 'rings', s: 0.04, c2: '#c83a2a' }), { axis: 'x', seg: 14 });
  r.dartboard = [r.x0 + 0.45, r.yF + 1.73, 2.4];
  A.spots.push({ x: r.x0 + 2.9, y: r.yF, z: 3.2, face: -1, act: 'darts' }, { x: r.x0 + 3.6, y: r.yF, z: 3.8, face: -1 }, { x: r.x1 - 1.8, y: r.yF, z: 2.8, face: 'out' });
  for (let x = r.x0 + 2; x < r.x1; x += 4) lampC(k, x, r.yC, 2.2, { kind: 'bulb', r: 4, i: 0.9 });
};
FURN.salon = (k, r, A) => {
  for (let i = 0; i < 4; i++) {
    const x = r.x0 + 1.2 + i * 1.7;
    const c = chair(k, x, r.yF, r.d - 1.4, '#c86a6a', 'out', { w: 0.6, d: 0.6, sh: 0.55, bh: 0.7 });
    k.box(x - 0.4, r.yF + 1.0, r.d - 0.05, x + 0.4, r.yF + 2.0, r.d - 0.02, C('#c8dce4'));
    if (i % 2) k.cyl(x, r.yF + 1.4, r.d - 1.1, 0.28, 0.35, C('#c8c8c0'), { seg: 9, r2: 0.22 });
    A.seats.push({ x, y: r.yF, z: c.z, face: 'out', seat: 0.57 });
    A.spots.push({ x: x - 0.55, y: r.yF, z: r.d - 1.6, face: 1 });
  }
  lampC(k, mid(r), r.yC, 2.2, { kind: 'trough', w: 4, r: 5 });
};
FURN.bureau = (k, r, A) => {
  counter(k, r.x0 + 0.8, r.x1 - 0.8, r.yF, 2.6, 0.7, 1.1, '#8a5a32', '#b08a5a');
  shelfRack(k, r.x0 + 0.6, r.x1 - 0.6, r.yF, r.d - 0.5, 2.1, 0.4, '#7a4a2a', '#e8e0c8', 6);
  k.box(r.x0 + 2, r.yF + 2.2, r.d - 0.05, r.x0 + 5, r.yC - 0.15, r.d - 0.02, C('#f0e8d0', { pat: 'tiles', s: 0.2 }));
  A.spots.push({ x: r.x0 + 2.4, y: r.yF, z: 3.6, face: 'out' }, { x: r.x0 + 5, y: r.yF, z: 3.6, face: 'out' }, { x: r.x0 + 3.5, y: r.yF, z: 1.7, face: 'in' });
  for (const x of [r.x0 + 2, r.x0 + 6]) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 4 });
};
FURN.hospital = (k, r, A) => {
  for (let i = 0; i < 3; i++) A.beds.push(berth(k, r.x0 + 1.3 + i * 2.4, r.yF, r.d - 0.1, { w: 1.95, d: 0.9, blanket: '#f2f0ea', frame: '#e8e8e4', h: 0.6 }));
  // Operating room: a table under a big lamp, and glass-fronted cabinets.
  k.box(r.x1 - 3.3, r.yF + 0.9, 2.1, r.x1 - 1.3, r.yF + 1.0, 2.7, C('#e8e8e0'));
  k.box(r.x1 - 2.4, r.yF, 2.3, r.x1 - 2.2, r.yF + 0.9, 2.5, C('#c8ccd0'));
  k.cyl(r.x1 - 2.3, r.yC - 0.6, 2.4, 0.45, 0.25, C('#e8e8e0', { c2: '#fff8e8', glow: 'night' }), { seg: 12, r2: 0.2 });
  k.lamp(r.x1 - 2.3, r.yC - 0.75, 2.4, { color: '#f4f8ff', r: 4, i: 1.0, bulb: false, halo: 0.5 });
  k.box(r.x1 - 4.5, r.yF, -0.45, r.x1 - 4.4, r.yC, r.d, W('#f2f0ea'));
  shelfRack(k, r.x1 - 4.2, r.x1 - 3.4, r.yF, r.d - 0.5, 1.9, 0.45, '#e8e8e0', '#c8dcdc', 4);
  lampC(k, r.x0 + 3.5, r.yC, 2.5, { kind: 'dish', r: 5, color: '#fff4e0' });
  A.spots.push({ x: r.x1 - 2.3, y: r.yF, z: 1.6, face: 'in' }, { x: r.x0 + 2.5, y: r.yF, z: 1.3, face: 'in' });
  A.seats.push({ x: r.x0 + 6.6, y: r.yF, z: 1.5, face: 'in', seat: 0.46 });
  chair(k, r.x0 + 6.6, r.yF, 1.3, '#9a9a90', 'in', { legs: true });
};
FURN.isolation = (k, r, A) => {
  // Male and female wards of five beds each (two wards drawn as one run).
  k.box(mid(r) - 0.05, r.yF, -0.45, mid(r) + 0.05, r.yC, r.d, W('#f4f2ec'));
  for (let i = 0; i < 5; i++) A.beds.push(berth(k, r.x0 + 1.1 + i * 2.15, r.yF, r.d - 0.1, { w: 1.8, d: 0.8, blanket: '#f4f2ec', frame: '#f0f0ec', h: 0.6 }));
  for (const x of [r.x0 + 3, r.x1 - 3]) lampC(k, x, r.yC, 2, { kind: 'dish', r: 4, color: '#fff4e0' });
  A.spots.push({ x: r.x0 + 4, y: r.yF, z: 1.2, face: 'in' });
};
FURN.emerg = (k, r, A) => {
  for (let i = 0; i < 2; i++) { const x = r.x0 + 2 + i * 6; k.box(x, r.yF, 1.6, x + 4, r.yF + 1.5, 3.4, C('#6a7a6a', { pat: 'plates', s: 0.6 })); k.cyl(x + 4, r.yF + 0.75, 2.5, 0.6, 1.0, C('#5a6a5a'), { axis: 'x', seg: 10 }); }
  for (let i = 0; i < 2; i++) { const x = r.x1 - 6 + i * 3; k.cyl(x, r.yF, 2.6, 0.7, 1.2, C('#4a4a4e'), { seg: 10 }); }
  lampC(k, mid(r), r.yC, 2, { kind: 'cage', r: 5, i: 0.6 });
  A.spots.push({ x: r.x0 + 4, y: r.yF, z: 1.2, face: 'in' });
};
FURN.cold = (k, r, A) => {
  // Insulated store rooms off the alley, each with its own contents.
  const n = r.stores.length, w = (r.x1 - r.x0) / n;
  r.storeX = [];
  r.stores.forEach((s, i) => {
    const a = r.x0 + i * w, b = a + w;
    if (i > 0) k.box(a - 0.06, r.yF, 1.4, a + 0.06, r.yC, r.d, W('#e8e4d4'));
    k.box(a + 0.3, r.yF, 1.38, b - 0.3, r.yF + 0.15, 1.42, C('#c8ccd0'));
    for (let y = r.yC - 0.3; y > r.yF + 1.5; y -= 0.25) k.cyl(a + 0.2, y, r.d - 0.12, 0.04, w - 0.4, C('#e8ecf0'), { axis: 'x', seg: 4 });
    r.storeX.push({ name: s, x: (a + b) / 2 });
    if (s === 'Frozen meat' || s === 'Kosher meat') for (let x = a + 0.8; x < b - 0.6; x += 0.7) { k.cyl(x, r.yC - 0.5, 3, 0.02, 0.5, C('#8a8a8a'), { seg: 3 }); k.box(x - 0.2, r.yC - 1.6, 2.8, x + 0.2, r.yC - 0.5, 3.2, C('#c86a5a', { pat: 'speckle', c2: '#f0d8c8' })); }
    else if (s === 'Fish') for (let x = a + 0.6; x < b - 0.6; x += 0.8) k.box(x - 0.3, r.yF, 2.5, x + 0.3, r.yF + 0.5, 3.5, C('#a8b8c0', { pat: 'planks', s: 0.12 }));
    else if (s === 'Ice') for (let x = a + 0.6; x < b - 0.6; x += 0.7) k.box(x - 0.3, r.yF, 2.4, x + 0.3, r.yF + 0.9, 3.6, C('#d8ecf4', { c2: '#ffffff' }));
    else if (s === 'Flour') for (let x = a + 0.6; x < b - 0.6; x += 0.6) for (let j = 0; j < 2; j++) sack(k, x, r.yF + j * 0.4, 2.5, '#ece4d0', 0.26, x + j);
    else for (let x = a + 0.6; x < b - 0.6; x += 0.75) for (let j = 0; j < 3; j++) k.box(x - 0.3, r.yF + j * 0.42, 2.6, x + 0.3, r.yF + 0.4 + j * 0.42, 3.4, C(s === 'Fruit' ? '#c89a52' : s === 'Butter' ? '#e8d890' : s === 'Vegetables' ? '#8a9a52' : '#b8a07a', { pat: 'planks', s: 0.1 }));
    lampC(k, (a + b) / 2, r.yC, 2.5, { kind: 'cage', r: 3.5, i: 0.5, color: '#f0f4ff' });
    A.spots.push({ x: (a + b) / 2, y: r.yF, z: 2.0, face: 'in', store: s });
  });
};
FURN.alley = (k, r, A) => {
  // The working alleyway: a long service corridor with shops opening off it.
  const shops = r.shops, w = (r.x1 - r.x0) / shops.length;
  r.shopX = {};
  shops.forEach((s, i) => {
    const a = r.x0 + i * w, b = a + w, c = (a + b) / 2;
    r.shopX[s] = c;
    if (i > 0) k.box(a - 0.06, r.yF, 1.9, a + 0.06, r.yC, r.d, W('#ece4cc'));
    if (s === 'butcher') {
      for (let x = a + 1; x < b - 2; x += 0.75) { k.cyl(x, r.yC - 0.4, 3.2, 0.02, 0.4, C('#8a8a8a'), { seg: 3 }); k.box(x - 0.22, r.yC - 1.7, 3.0, x + 0.22, r.yC - 0.4, 3.4, C('#c86a5a', { pat: 'speckle', c2: '#f0d8c8' })); }
      k.box(b - 3, r.yF, 2.1, b - 1, r.yF + 0.9, 2.9, C('#c8a878', { pat: 'grain' }));
      A.spots.push({ x: b - 2, y: r.yF, z: 1.6, face: 'in', shop: s });
    } else if (s === 'print' || s === 'print2') {
      // Print shop: a platen press and cases of type.
      const px = a + 2.5;
      k.box(px - 0.8, r.yF, 2.2, px + 0.8, r.yF + 1.1, 3.4, C('#3a3a3e', { pat: 'plates', s: 0.3 }));
      k.cyl(px + 0.9, r.yF + 1.3, 2.8, 0.45, 0.12, C('#5a5a5e'), { axis: 'x', seg: 12 });
      shelfRack(k, a + 4.5, a + 7, r.yF, r.d - 0.6, 1.6, 0.55, '#7a5a3a', '#4a4a4a', 6);
      k.box(a + 4.6, r.yF + 0.9, 2.0, a + 6.8, r.yF + 1.0, 2.8, C('#e8e4d8', { pat: 'tiles', s: 0.06 }));
      A.spots.push({ x: px, y: r.yF, z: 1.6, face: 'in', shop: s }, { x: a + 5.6, y: r.yF, z: 1.5, face: 'in', shop: s + 'b' });
    } else if (s === 'linen') {
      for (let x = a + 0.8; x < b - 0.8; x += 1.6) shelfRack(k, x - 0.7, x + 0.7, r.yF, r.d - 0.6, 2.2, 0.55, '#c8c0a8', '#f4f2ec', 5);
      A.spots.push({ x: c, y: r.yF, z: 1.5, face: 'in', shop: s });
    } else if (s === 'eggs') {
      // The egg store: trays of eggs on racks, turned by hand every day.
      for (let x = a + 0.8; x < b - 0.8; x += 1.5) for (let j = 0; j < 6; j++) k.box(x - 0.6, r.yF + 0.25 + j * 0.32, 2.4, x + 0.6, r.yF + 0.3 + j * 0.32, 3.6, C('#f0e4c8', { pat: 'checker', s: 0.06, c2: '#d8c8a0' }));
      A.spots.push({ x: a + 2, y: r.yF, z: 1.8, face: 'in', shop: s });
    } else if (s === 'veg') {
      for (let x = a + 0.8; x < b - 0.8; x += 0.9) for (let j = 0; j < 2; j++) k.box(x - 0.35, r.yF + j * 0.45, 2.6, x + 0.35, r.yF + 0.42 + j * 0.45, 3.5, C(j ? '#8aaa52' : '#b89a52', { pat: 'planks', s: 0.1 }));
      A.spots.push({ x: c, y: r.yF, z: 1.8, face: 'in', shop: s });
    } else if (s === 'kosher') {
      counter(k, a + 1, b - 1, r.yF, 2.4, 0.8, 0.92, '#c8ccd0', '#e8ecf0');
      A.spots.push({ x: c, y: r.yF, z: 1.8, face: 'in', shop: s });
    } else {
      for (let x = a + 0.8; x < b - 0.8; x += 1.0) for (let j = 0; j < 2; j++) sack(k, x, r.yF + j * 0.42, 2.6, '#e8e0cc', 0.26, x * 3 + j);
      A.spots.push({ x: c, y: r.yF, z: 1.8, face: 'in', shop: s });
    }
    lampC(k, c, r.yC, 1.2, { kind: 'cage', r: 4, i: 0.6 });
  });
};

FURN.mainhall = (k, r, A) => {
  // Shopping centre: showcases, the shop fronts, the medallion, cream leather sofas, lifts.
  for (let i = 0; i < 3; i++) {
    const x0 = r.x0 + 1 + i * 5.2;
    k.box(x0, r.yF, r.d - 1.6, x0 + 4.2, r.yF + 0.3, r.d - 0.05, C('#6a4a2a'));
    k.box(x0, r.yF + 0.3, r.d - 1.6, x0 + 4.2, r.yF + 2.5, r.d - 1.5, C('#bcd4dc', { c2: '#ffe0a0', glow: 'night', pat: 'panes', s: 0.7 }));
    k.box(x0, r.yF + 2.5, r.d - 1.6, x0 + 4.2, r.yC, r.d - 0.05, C('#c8a070', { pat: 'grain' }));
    for (let j = 0; j < 4; j++) k.box(x0 + 0.3 + j * 1.0, r.yF + 0.3, r.d - 1.0, x0 + 0.9 + j * 1.0, r.yF + 1.5 + (j % 2) * 0.3, r.d - 0.6, C(['#3a4a6a', '#8a3a2a', '#d8c8a0', '#2a2a2a'][j]));
    k.lamp(x0 + 2.1, r.yF + 2.0, r.d - 1.2, { color: '#ffe0b0', r: 3, i: 0.7, bulb: false, halo: 0.25 });
  }
  // The medallion of the Queen in marble, high on the wall.
  k.cyl(r.x0 + 18.5, r.yF + 2.0, r.d - 0.06, 0.65, 0.05, C('#ece6dc', { pat: 'speckle', c2: '#c8c0b0' }), { axis: 'z', seg: 18 });
  k.box(r.x0 + 15, r.yC - 0.5, r.d - 0.06, r.x1 - 0.5, r.yC - 0.15, r.d - 0.02, C('#f2ecd8', { pat: 'stripes', s: 0.6, c2: '#e0d8c0' }));
  // Showcases and sofas.
  for (let x = r.x0 + 2; x < r.x0 + 15; x += 2.6) k.box(x - 0.4, r.yF, 2.6, x + 0.4, r.yF + 1.2, 3.0, C('#c8dce4', { c2: '#ffe0a0', glow: 'night' }));
  for (const x of [r.x0 + 18, r.x0 + 21.5]) { settee(k, x - 1.1, x + 1.1, r.yF, 4.2, '#e8dcc0', 0.75); for (const s of [-0.6, 0, 0.6]) A.seats.push({ x: x + s, y: r.yF, z: 4.55, face: 'out', seat: 0.46 }); }
  plant(k, r.x0 + 16.5, r.yF, 2.0, 1.4);
  // Lift doors.
  for (let i = 0; i < 2; i++) k.box(r.x0 + 23.3 + i * 1.6, r.yF, r.d - 0.08, r.x0 + 24.6 + i * 1.6, r.yF + 2.2, r.d - 0.02, C('#c8a050', { pat: 'bars', s: 0.08 }));
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 3.5, { kind: 'trough', w: 3, r: 6, i: 0.9 });
  for (let i = 0; i < 3; i++) A.spots.push({ x: r.x0 + 3 + i * 5.2, y: r.yF, z: 1.6, face: 'in' });
  A.spots.push({ x: r.x0 + 2.5, y: r.yF, z: r.d - 2.1, face: 'out', shop: 'counter' });
  A.spots.push({ x: r.x0 + 24, y: r.yF, z: r.d - 0.6, face: 'out', lift: true });
};
function grand(k, x, y, z, c = '#7a3a22') {
  // A grand piano: curved case as a lathe slice, lid raised.
  k.box(x - 0.75, y + 0.65, z, x + 0.75, y + 0.95, z + 1.5, C(c));
  for (const [dx, dz] of [[-0.65, 0.1], [0.65, 0.1], [0, 1.35]]) k.box(x + dx - 0.05, y, z + dz - 0.05, x + dx + 0.05, y + 0.65, z + dz + 0.05, C(shade(c, -0.2)));
  k.box(x - 0.7, y + 0.95, z + 0.0, x + 0.7, y + 0.97, z + 0.2, C('#f4f0e6', { pat: 'bars', s: 0.025 }));
  k.boxR(x, y + 1.35, z + 0.95, 1.4, 0.04, 1.2, C(c), { x: -0.6 });
  return { seat: 0.5, x, z: z - 0.35 };
}
FURN.lounge1 = (k, r, A) => {
  // Stage with a proscenium at the forward end; the Steinway; armchairs round low tables.
  const sx0 = r.x0, sx1 = r.x0 + 6;
  k.box(sx0, r.yF, 0.4, sx1, r.yF + 0.9, r.d - 0.2, C('#8a5a32', { pat: 'planks', s: 0.15, cut: '#5a3a22' }));
  k.box(sx1 - 0.3, r.yF, 0.3, sx1, r.yC, 0.6, C('#c8a050', { pat: 'grain' }));
  k.box(sx1 - 0.3, r.yC - 1.2, 0.3, sx1, r.yC, r.d, C('#c8a050', { pat: 'grain' }));
  k.box(sx0 + 0.3, r.yF + 0.9, r.d - 0.4, sx1 - 0.4, r.yC - 1.2, r.d - 0.25, C('#8a2a22', { pat: 'stripes', s: 0.3, c2: '#6a1a16' }));
  const pno = grand(k, sx1 + 2.0, r.yF, 1.4);
  A.seats.push({ x: pno.x, y: r.yF, z: pno.z, face: 'in', seat: 0.5, piano: true });
  r.stage = { x: (sx0 + sx1) / 2, y: r.yF + 0.9 };
  for (let x = sx1 + 4.5; x < r.x1 - 1; x += 3.2) for (const z of [2.2, 5.6]) {
    if (z + 1.5 > r.d) continue;
    roundTable(k, x, r.yF, z + 0.45, 0.4, { top: '#7a4a2a', h: 0.55 });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.95, r.yF, z, s > 0 ? '#c88a4a' : '#a86a3a', -s, { w: 0.75, d: 0.75, sh: 0.42, bh: 0.55 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.44 }); }
  }
  // 32 tall windows (13 ft x 2 ft 6 in) on the outboard walls: drawn on the back wall.
  windows(k, sx1 + 1, r.x1 - 0.5, r.yF + 1.1, r.yF + 5.0, r.d, { every: 1.5, gap: 0.35, pane: 0.38 });
  for (let x = sx1 + 2; x < r.x1; x += 5) lampC(k, x, r.yC, 4, { kind: 'chand', r: 8, i: 0.9 });
  rug(k, sx1 + 3.5, r.x1 - 0.8, r.yF, 1.4, r.d - 1.0, '#c8964a', '#e8c890');
  A.spots.push({ x: (sx0 + sx1) / 2, y: r.yF + 0.9, z: 2.5, face: 'out', stage: true }, { x: (sx0 + sx1) / 2 + 1.2, y: r.yF + 0.9, z: 3.0, face: 'out', stage: true });
};
FURN.lounge1b = (k, r, A) => {
  for (let x = r.x0 + 1.8; x < r.x1 - 1; x += 3.2) {
    roundTable(k, x, r.yF, 2.65, 0.4, { top: '#7a4a2a', h: 0.55 });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.95, r.yF, 2.2, '#c88a4a', -s, { w: 0.75, d: 0.75, sh: 0.42, bh: 0.55 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.44 }); }
  }
  windows(k, r.x0 + 0.5, r.x1 - 0.5, r.yF + 0.9, r.yC - 0.4, r.d, { every: 1.5, gap: 0.35, pane: 0.38 });
  lampC(k, mid(r), r.yC, 3, { kind: 'chand', r: 6 });
};
FURN.gallery = (k, r, A) => {
  // The Long Gallery: two big landscapes, armchairs, palms.
  picture(k, r.x0 + 6, r.yF + 0.9, r.d, 4.5, 1.9, '#7a9a6a', '#c8a050');
  picture(k, r.x0 + 15, r.yF + 0.9, r.d, 4.5, 1.9, '#8aa0b0', '#c8a050');
  for (let x = r.x0 + 2; x < r.x1 - 1; x += 3.4) {
    roundTable(k, x, r.yF, 2.55, 0.35, { top: '#6a3a22', h: 0.55, lamp: true });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.85, r.yF, 2.1, '#8a5a6a', -s, { w: 0.7, d: 0.7, sh: 0.42, bh: 0.6 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.44 }); }
  }
  for (const x of [r.x0 + 10.5, r.x1 - 1.2]) plant(k, x, r.yF, r.d - 1.2, 1.5);
  for (let x = r.x0 + 3; x < r.x1; x += 5) lampC(k, x, r.yC, 2.5, { kind: 'trough', w: 2, r: 5 });
  for (let x = r.x0 + 2.5; x < r.x1; x += 9) k.box(x - 0.2, r.yF, r.d - 0.6, x + 0.2, r.yC, r.d - 0.2, C('#e8d8b0', { c2: '#ffe8b0', glow: 'night' }));
};
FURN.ballroom = (k, r, A) => {
  // Dance floor, band dais at the after end, tables round the edge; murals in gold on silver.
  k.box(r.x0 + 2, r.yF, 1.2, r.x1 - 4, r.yF + 0.02, r.d - 1.5, C('#d8b880', { pat: 'planks', s: 0.12 }));
  k.box(r.x1 - 3.8, r.yF, 0.8, r.x1 - 0.3, r.yF + 0.45, r.d - 0.3, C('#a87a4a', { cut: '#6a4a2a' }));
  k.box(r.x0 + 0.5, r.yF + 0.9, r.d - 0.04, r.x1 - 4.5, r.yC - 0.3, r.d - 0.01, C('#d8d4cc', { pat: 'rock', c2: '#d8b860' }));
  const pno = grand(k, r.x1 - 2.2, r.yF + 0.45, r.d - 2.2, '#2a2220');
  r.band = { x: r.x1 - 2, y: r.yF + 0.45 };
  A.spots.push({ x: r.x1 - 2.6, y: r.yF + 0.45, z: 1.6, face: -1, band: 'violin' }, { x: r.x1 - 1.2, y: r.yF + 0.45, z: 2.0, face: -1, band: 'stand' });
  A.seats.push({ x: pno.x, y: r.yF + 0.45, z: pno.z, face: 'in', seat: 0.5, piano: true });
  for (let x = r.x0 + 0.9; x < r.x1 - 4; x += 2.2) { roundTable(k, x, r.yF, r.d - 0.9, 0.35, { cloth: '#f6eedc' }); const c = chair(k, x + 0.7, r.yF, r.d - 1.3, '#d88a8a', -1, { legs: true }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -1, seat: 0.46 }); }
  for (let x = r.x0 + 3; x < r.x1 - 2; x += 4.5) lampC(k, x, r.yC, 4, { kind: 'chand', r: 6, color: '#ffe0c0' });
  for (let i = 0; i < 4; i++) for (const z of [2.5, 4.5]) A.spots.push({ x: r.x0 + 3 + i * 2, y: r.yF, z, face: i % 2 ? 1 : -1, dance: true });
};
FURN.smoke1 = (k, r, A) => {
  // The coal fire in a travertine fireplace; leather wing chairs; card tables; Wadsworth's paintings.
  const fx = mid(r);
  k.box(fx - 1.6, r.yF, r.d - 0.9, fx + 1.6, r.yF + 2.4, r.d - 0.05, C('#e0d4b8', { pat: 'ashlar', s: 0.35, c2: '#d0c4a4' }));
  k.box(fx - 0.7, r.yF, r.d - 0.95, fx + 0.7, r.yF + 0.9, r.d - 0.5, C('#1e1a18'));
  k.box(fx - 0.45, r.yF + 0.1, r.d - 0.85, fx + 0.45, r.yF + 0.35, r.d - 0.6, C('#ff7a30', { c2: '#ffb050', glow: 'always' }));
  k.lamp(fx, r.yF + 0.4, r.d - 1.1, { always: true, color: '#ff8a40', r: 5, i: 0.8, bulb: false, halo: 0.6, flicker: true });
  r.fire = [fx, r.yF + 0.3, r.d - 0.85];
  picture(k, fx - 4.3, r.yF + 1.6, r.d, 3.0, 2.0, '#4a6a8a', '#c8a050');
  picture(k, fx + 4.3, r.yF + 1.6, r.d, 3.0, 2.0, '#8a7a5a', '#c8a050');
  rug(k, r.x0 + 1, r.x1 - 1, r.yF, 1.2, r.d - 1.0, '#4a3020', '#c8a050');
  const cols = ['#9a3a3a', '#6a4a7a', '#4a5a7a', '#c8b090', '#6a4a2a'];
  const spots = [[r.x0 + 2.0, 2.4, 1], [r.x0 + 4.0, 2.4, -1], [fx - 1.6, r.d - 2.6, 1], [fx + 1.6, r.d - 2.6, -1], [r.x1 - 4, 2.4, 1], [r.x1 - 2, 2.4, -1], [fx - 2.5, 5.0, 1], [fx + 2.5, 5.0, -1]];
  spots.forEach(([x, z, f], i) => { if (z + 0.9 > r.d) return; const c = chair(k, x, r.yF, z, cols[i % cols.length], f, { w: 0.8, d: 0.8, sh: 0.42, bh: 0.8 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: f, seat: 0.44 }); });
  for (const x of [r.x0 + 3, r.x1 - 3]) table(k, x, r.yF, 2.5, 0.7, 0.7, { top: '#3a5a3a', items: 'cards', h: 0.66 });
  for (let x = r.x0 + 1; x < r.x1; x += 3) k.box(x - 0.15, r.yF + 2.2, r.d - 0.05, x + 0.15, r.yF + 2.6, r.d - 0.02, C('#c8a050', { c2: '#ffd890', glow: 'night' }));
  for (const x of [r.x0 + 3, r.x1 - 3]) lampC(k, x, r.yC, 4, { kind: 'chand', r: 7, color: '#ffd8a0' });
};

FURN.prom = (k, r, A) => {
  // Deck chairs, rugs, a table-tennis table; bronze sliding windows along the wall.
  windows(k, r.x0 + 0.3, r.x1 - 0.3, r.yF + 0.9, r.yC - 0.25, r.d, { every: 1.8, glass: '#b8d0d8', pane: 0.9 });
  for (let x = r.x0 + 1; x < r.x1 - 1; x += 1.3) { const c = deckchair(k, x, r.yF, r.d - 2.1, 'out', '#e8dcc0', ((x * 3) | 0) % 2 ? '#5a6a8a' : '#8a4a3a'); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: 'out', seat: 0.38, deck: true }); }
  if (r.kind === 'prom') { table(k, r.x0 + 6, r.yF, 1.6, 2.7, 1.5, { top: '#2a5a3a', h: 0.76 }); k.box(r.x0 + 5.98, r.yF + 0.76, 1.6, r.x0 + 6.02, r.yF + 0.92, 3.1, C('#f2ece0')); A.spots.push({ x: r.x0 + 4.2, y: r.yF, z: 2.3, face: 1 }, { x: r.x0 + 7.8, y: r.yF, z: 2.3, face: -1 }); }
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 4.5 });
  A.spots.push({ x: r.x1 - 2, y: r.yF, z: 1.3, face: 'out', tea: true });
};
FURN.prom2 = FURN.prom;
FURN.playroom1 = (k, r, A) => {
  // The aquarium of live tropical fish, a slide, toys.
  const ax = r.x0 + 3;
  k.box(ax - 1.0, r.yF, r.d - 0.9, ax + 1.0, r.yF + 0.8, r.d - 0.1, C('#7a5a3a', { pat: 'panels', s: 0.5 }));
  k.box(ax - 0.95, r.yF + 0.8, r.d - 0.85, ax + 0.95, r.yF + 1.6, r.d - 0.15, C('#4aa8b8', { c2: '#9ad8e0', glow: 'always', pat: 'speckle' }));
  k.lamp(ax, r.yF + 1.3, r.d - 1.2, { always: true, color: '#9ae0f0', r: 1.8, i: 0.4, bulb: false, halo: 0.2 });
  r.aquarium = [ax, r.yF + 1.2, r.d - 0.86];
  const fishC = ['#ff8a30', '#ffd040', '#e84a6a', '#4ac8ff', '#ff8a30', '#f0f0e0'];
  for (let i = 0; i < 6; i++) { const fx = ax - 0.7 + i * 0.28, fy = r.yF + 0.95 + ((i * 37) % 5) * 0.11; k.box(fx - 0.06, fy - 0.025, r.d - 0.87, fx + 0.06, fy + 0.025, r.d - 0.86, C(fishC[i], { c2: fishC[i], glow: 'always' })); }
  // Slide.
  k.box(r.x0 + 7.2, r.yF, 3.0, r.x0 + 7.6, r.yF + 1.8, 3.6, C('#d84a3a'));
  k.boxR(r.x0 + 8.7, r.yF + 0.95, 3.3, 2.8, 0.08, 0.6, C('#e8c84a'), { z: -0.62 });
  for (let i = 0; i < 4; i++) k.box(r.x0 + 1 + i * 0.6, r.yF, 1.6, r.x0 + 1.4 + i * 0.6, r.yF + 0.35, 2.0, C(['#d84a3a', '#3a6ac8', '#e8c84a', '#4aa84a'][i]));
  picture(k, r.x1 - 3, r.yF + 1.2, r.d, 2.2, 1.2, '#e8a87a', '#e8e0c8');
  A.spots.push({ x: ax, y: r.yF, z: r.d - 1.5, face: 'in', aquarium: true }, { x: r.x0 + 9, y: r.yF, z: 2.5, face: 'out' }, { x: r.x0 + 5, y: r.yF, z: 1.5, face: 'out' });
  lampC(k, mid(r), r.yC, 3, { kind: 'dish', r: 6 });
};
FURN.obsbar = (k, r, A) => {
  // The Observation Bar: curved round the front, 21 windows looking dead ahead, the long bar.
  counter(k, r.x0 + 4.5, r.x1 - 1.5, r.yF, r.d - 1.5, 0.7, 1.1, '#2a1e18', '#c8ccd0');
  for (let x = r.x0 + 5; x < r.x1 - 1.6; x += 0.9) { k.cyl(x, r.yF, r.d - 2.2, 0.04, 0.7, C('#c8ccd0'), { seg: 4 }); k.cyl(x, r.yF + 0.7, r.d - 2.2, 0.2, 0.08, C('#a8302a'), { seg: 8 }); A.seats.push({ x, y: r.yF, z: r.d - 2.2, face: 'in', seat: 0.74, bar: true }); }
  shelfRack(k, r.x0 + 4.5, r.x1 - 1.5, r.yF + 1.2, r.d - 0.4, 1.0, 0.3, '#2a1e18', '#8a6a3a', 2);
  k.box(r.x0 + 4.5, r.yF + 2.25, r.d - 0.06, r.x1 - 1.5, r.yC - 0.1, r.d - 0.02, C('#c8b890', { pat: 'rock', c2: '#7a8aa0' }));
  for (let x = r.x0 + 1.5; x < r.x0 + 4.5; x += 1.4) { const c = chair(k, x, r.yF, 1.6, '#a8302a', -1, { w: 0.6, d: 0.6 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -1, seat: 0.46 }); }
  A.spots.push({ x: r.x0 + 7, y: r.yF, z: r.d - 0.6, face: 'out', barman: true }, { x: r.x0 + 1.4, y: r.yF, z: 3.8, face: -1, window: true });
  for (let x = r.x0 + 3; x < r.x1; x += 4) lampC(k, x, r.yC, 3, { kind: 'trough', w: 2, r: 5, color: '#ffd8a0' });
};
FURN.gym = (k, r, A) => {
  // Electric horses, rowing machines, a punch ball; Tom Webster's caricatures on the walls.
  for (let i = 0; i < 2; i++) { const x = r.x0 + 1.5 + i * 2; k.box(x - 0.3, r.yF, 2.2, x + 0.3, r.yF + 0.8, 2.6, C('#4a4a4a')); k.box(x - 0.5, r.yF + 0.8, 2.25, x + 0.5, r.yF + 1.05, 2.55, C('#8a5a32')); k.box(x + 0.4, r.yF + 1.0, 2.3, x + 0.6, r.yF + 1.35, 2.5, C('#8a5a32')); A.seats.push({ x, y: r.yF, z: 2.4, face: 1, seat: 1.05, horse: true }); }
  for (let i = 0; i < 2; i++) { const x = r.x0 + 6 + i * 2; k.box(x - 0.8, r.yF, 3.2, x + 0.8, r.yF + 0.2, 3.5, C('#6a4a2a')); A.seats.push({ x: x - 0.2, y: r.yF, z: 3.35, face: 1, seat: 0.3, row: true }); }
  k.cyl(r.x1 - 1.5, r.yF + 1.9, 2.0, 0.015, 0.8, C('#3a3a3a'), { seg: 3 });
  r.punch = [r.x1 - 1.5, r.yF + 1.7, 2.0];
  for (let i = 0; i < 4; i++) picture(k, r.x0 + 1.5 + i * 2.5, r.yF + 1.5, r.d, 1.0, 0.8, '#f0e8d8', '#2a2a2a');
  A.spots.push({ x: r.x1 - 2.2, y: r.yF, z: 2.0, face: 1, punch: true }, { x: r.x0 + 4, y: r.yF, z: 1.4, face: 'out' });
  lampC(k, mid(r), r.yC, 2.5, { kind: 'dish', r: 5 });
};
FURN.squash = (k, r, A) => {
  k.box(r.x0 + 0.1, r.yF + 0.45, r.d - 0.03, r.x1 - 0.1, r.yF + 0.5, r.d - 0.01, C('#c83a2a'));
  k.box(r.x0 + 0.1, r.yC - 0.6, r.d - 0.03, r.x1 - 0.1, r.yC - 0.55, r.d - 0.01, C('#c83a2a'));
  A.spots.push({ x: r.x0 + 2, y: r.yF, z: 2.5, face: 'in', squash: true }, { x: r.x1 - 2, y: r.yF, z: 3.5, face: 'in', squash: true });
  lampC(k, mid(r), r.yC, 3, { kind: 'dish', r: 5 });
};
FURN.radio = (k, r, A) => {
  // Four operating positions: receivers, Morse keys, typewriters, headphones.
  for (let i = 0; i < 3; i++) {
    const x = r.x0 + 1.2 + i * 2;
    table(k, x, r.yF, r.d - 1.3, 1.6, 0.8, { top: '#6a5a4a', h: 0.76 });
    k.box(x - 0.6, r.yF + 0.76, r.d - 0.6, x + 0.6, r.yF + 1.5, r.d - 0.1, C('#3a3a3a', { pat: 'grate' }));
    k.box(x - 0.1, r.yF + 0.76, r.d - 1.1, x + 0.2, r.yF + 0.86, r.d - 0.9, C('#2a2a2a'));
    const c = chair(k, x, r.yF, r.d - 2.1, '#5a4a3a', 'in', { legs: true });
    A.seats.push({ x, y: r.yF, z: c.z, face: 'in', seat: 0.46 });
  }
  lampC(k, mid(r), r.yC, 2, { kind: 'dish', r: 4, color: '#fff0d0' });
};
FURN.radiotx = (k, r, A) => {
  for (let i = 0; i < 3; i++) { const x = r.x0 + 1 + i * 2.4; k.box(x, r.yF, r.d - 1.2, x + 2.0, r.yC - 0.3, r.d - 0.1, C('#5a5e64', { pat: 'panels', s: 0.5 })); for (let j = 0; j < 3; j++) k.cyl(x + 0.4 + j * 0.6, r.yF + 1.4, r.d - 1.25, 0.1, 0.05, C('#e8e0c8', { c2: '#ffd890', glow: 'night' }), { axis: 'z', seg: 8 }); }
  table(k, r.x1 - 1.5, r.yF, 1.5, 1.4, 0.7, { top: '#6a5a4a' });
  const c = chair(k, r.x1 - 1.5, r.yF, 1.0, '#5a4a3a', 'in', { legs: true });
  A.seats.push({ x: r.x1 - 1.5, y: r.yF, z: c.z, face: 'in', seat: 0.46 });
  lampC(k, mid(r), r.yC, 2, { kind: 'dish', r: 4 });
};
FURN.fhouse = (k, r) => { lampC(k, mid(r), r.yC, 2, { kind: 'cage', r: 3, i: 0.4 }); };
FURN.fanroom = (k, r, A) => {
  for (let i = 0; i < 2; i++) k.cyl(r.x0 + 1.6 + i * 2.6, r.yF + 1.2, 2.5, 1.0, 0.8, C('#7a8088'), { axis: 'z', seg: 14 });
  lampC(k, mid(r), r.yC, 2, { kind: 'cage', r: 3, i: 0.4 });
  A.spots.push({ x: r.x0 + 3, y: r.yF, z: 1.2, face: 'out' });
};
FURN.sundeck = (k, r, A) => {
  for (let x = r.x0 + 1.5; x < r.x1 - 1; x += 7) ventilatorSmall(k, x, r.yF, 9.5);
  for (let x = r.x0 + 1; x < r.x1 - 1; x += 1.4) { if (((x * 7) | 0) % 3 === 0) continue; const c = deckchair(k, x, r.yF, 11.5, 'out', '#e8dcc0', ((x * 3) | 0) % 2 ? '#5a6a8a' : '#8a6a3a'); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: 'out', seat: 0.38, deck: true }); }
  for (let x = r.x0 + 2; x < r.x1; x += 4) A.spots.push({ x, y: r.yF, z: 14, face: 1, deckwalk: true });
};
function ventilatorSmall(k, x, y, z) {
  k.cyl(x, y, z, 0.32, 1.9, C('#f2ece0'), { seg: 9 });
  k.sphere(x - 0.1, y + 2.0, z, 0.42, C('#f2ece0'), { seg: 9, rings: 5 });
  k.cyl(x - 0.45, y + 2.0, z, 0.32, 0.1, C('#b8402e'), { axis: 'x', seg: 9 });
}
FURN.verandah = (k, r, A) => {
  // The Verandah Grill: black carpet, red curtains with stars, a sycamore dance floor, the bay facing aft.
  k.box(r.x0 + 4, r.yF, 1.4, r.x0 + 11, r.yF + 0.02, r.d - 2, C('#d8c8a0', { pat: 'planks', s: 0.1 }));
  windows(k, r.x1 - 7, r.x1 - 0.4, r.yF + 0.8, r.yC - 0.3, r.d, { every: 1.3, glass: '#b8d0d8', night: '#ffc890' });
  for (let x = r.x0 + 0.5; x < r.x1 - 7; x += 1.4) k.box(x, r.yF + 0.2, r.d - 0.12, x + 1.1, r.yC - 0.1, r.d - 0.04, C('#8a1a22', { pat: 'speckle', c2: '#e8c860' }));
  for (const x of [r.x0 + 4, r.x0 + 11]) for (const z of [1.2, r.d - 1.5]) k.cyl(x, r.yF, z, 0.18, r.yC - r.yF, C(z < 2 ? '#d8d4cc' : '#d8b860'), { seg: 8 });
  for (let x = r.x0 + 12.5; x < r.x1 - 0.8; x += 2.2) for (const z of [1.6, 4.2]) {
    if (z + 1 > r.d) continue;
    roundTable(k, x, r.yF, z + 0.45, 0.45, { cloth: '#f6eedc', lamp: true });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.75, r.yF, z + 0.22, '#c8a050', -s, { legs: true }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.46 }); }
  }
  for (let x = r.x0 + 0.8; x < r.x0 + 4; x += 1.6) { roundTable(k, x, r.yF, 2.0, 0.4, { cloth: '#f6eedc', lamp: true }); const c = chair(k, x, r.yF, 2.6, '#c8a050', 'out', { legs: true }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: 'out', seat: 0.46 }); }
  const pno = grand(k, r.x0 + 2.5, r.yF, r.d - 2.4, '#1a1614');
  A.seats.push({ x: pno.x, y: r.yF, z: pno.z, face: 'in', seat: 0.5, piano: true });
  r.lights = [];
  for (let x = r.x0 + 2; x < r.x1; x += 4) r.lights.push(lampC(k, x, r.yC, 3, { kind: 'trough', w: 1.6, r: 5, color: '#ffb8c8', i: 0.9 }));
  for (let i = 0; i < 3; i++) for (const z of [2.2, 3.6]) A.spots.push({ x: r.x0 + 5.5 + i * 2, y: r.yF, z, face: i % 2 ? 1 : -1, dance: true });
};
FURN.library2 = (k, r, A) => {
  for (let x = r.x0 + 0.6; x < r.x0 + 8; x += 1.7) shelfRack(k, x, x + 1.5, r.yF, r.d - 0.55, 2.0, 0.45, '#7a5a3a', '#8a4a2a', 5);
  for (let x = r.x0 + 1.5; x < r.x0 + 8; x += 2.2) { table(k, x, r.yF, 2.0, 1.2, 0.7, { top: '#6a4a2a', h: 0.74 }); const c = chair(k, x, r.yF, 1.4, '#6a7a5a', 'in', { legs: true }); A.seats.push({ x, y: r.yF, z: c.z, face: 'in', seat: 0.46, write: true }); }
  for (let x = r.x0 + 9.5; x < r.x1 - 1; x += 2.6) { const c = chair(k, x, r.yF, 2.2, '#6a7a5a', -1, { w: 0.75, d: 0.75 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -1, seat: 0.46 }); }
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 5 });
};
FURN.lounge2 = (k, r, A) => {
  // Tourist Lounge: stage, parquet dance floor, amboyna chairs; the painted hide on the wall.
  k.box(r.x1 - 5, r.yF, 0.4, r.x1 - 0.3, r.yF + 0.8, r.d - 0.3, C('#8a6a4a', { pat: 'planks', s: 0.15, cut: '#5a3a22' }));
  k.box(r.x1 - 5, r.yF + 0.8, r.d - 0.35, r.x1 - 0.3, r.yC - 0.2, r.d - 0.2, C('#3a6a4a', { pat: 'stripes', s: 0.3, c2: '#2a5a3a' }));
  r.stage = { x: r.x1 - 2.6, y: r.yF + 0.8 };
  k.box(r.x0 + 9, r.yF, 1.2, r.x1 - 6, r.yF + 0.02, 6.5, C('#c8a070', { pat: 'planks', s: 0.12 }));
  k.box(r.x0 + 1, r.yF + 0.9, r.d - 0.05, r.x0 + 7.5, r.yC - 0.3, r.d - 0.02, C('#c8b890', { pat: 'rock', c2: '#7a5a3a' }));
  for (let x = r.x0 + 1.2; x < r.x0 + 8.5; x += 2.4) for (const z of [1.8, 5]) {
    roundTable(k, x, r.yF, z + 0.4, 0.4, { top: '#8a5a32', h: 0.6 });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.8, r.yF, z + 0.15, '#c89a6a', -s, { w: 0.55, d: 0.55 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.46 }); }
  }
  for (let x = r.x0 + 9.5; x < r.x1 - 6; x += 1.2) { const c = chair(k, x, r.yF, r.d - 1.3, '#c89a6a', 'out', { w: 0.5, d: 0.5, legs: true }); A.seats.push({ x, y: r.yF, z: c.z, face: 'out', seat: 0.46 }); }
  const pno = grand(k, r.x1 - 6.8, r.yF, r.d - 2.3, '#3a2a22');
  A.seats.push({ x: pno.x, y: r.yF, z: pno.z, face: 'in', seat: 0.5, piano: true });
  for (let x = r.x0 + 3; x < r.x1; x += 5) lampC(k, x, r.yC, 3, { kind: 'dish', r: 6, color: '#fff0d8' });
  for (let i = 0; i < 4; i++) for (const z of [2.6, 4.6]) A.spots.push({ x: r.x0 + 11 + i * 2.2, y: r.yF, z, face: i % 2 ? 1 : -1, dance: true });
  A.spots.push({ x: r.x1 - 2.6, y: r.yF + 0.8, z: 2.5, face: 'out', stage: true });
};
FURN.smoke2 = (k, r, A) => {
  // Tourist Smoking Room: the polished-steel Atlantic map with its magnetised ship; electric fires.
  const mx0 = mid(r) - 2.2, mx1 = mid(r) + 2.2, my0 = r.yF + 0.95, my1 = r.yC - 0.25;
  k.box(mx0, my0, r.d - 0.06, mx1, my1, r.d - 0.02, C('#c8ccd0', { pat: 'speckle', c2: '#a8acb0' }));
  r.map = { x0: mx1 - 0.6, x1: mx0 + 0.6, y0: my0 + 0.9, y1: my0 + 0.6, z: r.d - 0.09 };
  for (const x of [r.x0 + 1.6, r.x1 - 1.6]) { k.box(x - 0.5, r.yF, r.d - 0.4, x + 0.5, r.yF + 0.7, r.d - 0.05, C('#5a4030')); k.box(x - 0.35, r.yF + 0.15, r.d - 0.42, x + 0.35, r.yF + 0.5, r.d - 0.4, C('#ff6a30', { c2: '#ff9a50', glow: 'always' })); k.lamp(x, r.yF + 0.4, r.d - 0.8, { always: true, color: '#ff8a50', r: 2.5, i: 0.5, bulb: false, halo: 0.3 }); }
  for (let x = r.x0 + 1.8; x < r.x1 - 1; x += 2.6) {
    table(k, x, r.yF, 2.3, 0.8, 0.8, { top: '#6a4a2a', items: ((x * 2) | 0) % 2 ? 'cards' : 'glass', h: 0.66 });
    for (const s of [-1, 1]) { const c = chair(k, x + s * 0.7, r.yF, 2.25, '#8a5a32', -s, { w: 0.55, d: 0.6 }); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: -s, seat: 0.46 }); }
  }
  A.spots.push({ x: mid(r), y: r.yF, z: r.d - 1.3, face: 'in', map: true }, { x: mid(r) + 0.7, y: r.yF, z: r.d - 1.5, face: 'in', map: true });
  for (let x = r.x0 + 3; x < r.x1; x += 5) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 5 });
};
FURN.tpool = (k, r, A) => {
  // Plunge 33 x 21 ft (10 x 6.4 m), ivory tiles banded in blue; the gymnasium aft.
  const bx0 = r.x0 + 1.5, bx1 = bx0 + 10, bz1 = Math.min(6.4, r.d - 1.2), y0 = r.yF - 1.6;
  const tile = C('#f2ecd8', { pat: 'tiles', s: 0.2, cut: '#c8c0a8' });
  k.box(bx0 - 0.25, y0, -0.45, bx0, r.yF, bz1 + 0.25, tile);
  k.box(bx1, y0, -0.45, bx1 + 0.25, r.yF, bz1 + 0.25, tile);
  k.box(bx0, y0, bz1, bx1, r.yF, bz1 + 0.25, tile);
  k.box(bx0, y0 - 0.1, -0.45, bx1, y0, bz1, C('#e8dcc0', { pat: 'tiles', s: 0.25 }));
  k.box(bx0, r.yF - 0.35, bz1 - 0.03, bx1, r.yF - 0.2, bz1, C('#3a6a9a'));
  const wl = r.yF - 0.2;
  k.glass([[bx0, wl, 0], [bx1, wl, 0], [bx1, wl, bz1], [bx0, wl, bz1]], { c: '#6ac0d0', alpha: 0.42 });
  k.sheet(bx0, bx1, y0, wl, 0.02, { c: '#4aa8c0', alpha: 0.35 });
  r.water = { x0: bx0, x1: bx1, y: wl, z0: 0, z1: bz1 };
  // The floor slab has a hole where the plunge is: patch round it.
  // Gymnasium aft: oak, black-and-white Korkoid, wall bars.
  k.box(r.x1 - 12, r.yF, 0.5, r.x1 - 0.3, r.yF + 0.015, r.d - 0.2, C('#2a2a2a', { pat: 'checker', s: 0.45, c2: '#ece6da' }));
  for (let x = r.x1 - 11; x < r.x1 - 1; x += 0.9) k.box(x, r.yF, r.d - 0.12, x + 0.06, r.yC - 0.2, r.d - 0.06, C('#b08a5a'));
  for (let i = 0; i < 6; i++) k.cyl(r.x1 - 11.2, r.yF + 0.3 + i * 0.35, r.d - 0.1, 0.02, 10.5, C('#b08a5a'), { axis: 'x', seg: 4 });
  for (let x = r.x0 + 3; x < r.x1; x += 5) lampC(k, x, r.yC, 2.5, { kind: 'dish', r: 5, color: '#f0f4ff' });
  for (let i = 0; i < 3; i++) A.spots.push({ x: bx0 + 2 + i * 3, y: wl - 0.3, z: 1.6 + (i % 2) * 2.2, face: i % 2 ? 1 : -1, swim: true });
  A.spots.push({ x: bx1 + 1.0, y: r.yF, z: 1.2, face: -1 }, { x: r.x1 - 6, y: r.yF, z: 2.5, face: 'out', gym: true }, { x: r.x1 - 3.5, y: r.yF, z: 3.0, face: -1, gym: true });
  r.noFloorX = [bx0 - 0.25, bx1 + 0.25, bz1 + 0.25];
};
FURN.steering = (k, r, A) => {
  // Four hydraulic rams push a yoke on the rudder stock; three electric motors drive the pumps.
  const sx = 297.5;
  for (const dz of [1.1, 2.9]) for (const dx of [-1, 1]) { k.cyl(sx + dx * 2.6, r.yF + 1.2, dz, 0.4, 2.0, C('#7a8088'), { axis: 'x', seg: 10 }); k.box(sx + dx * 4.4 - 0.4, r.yF, dz - 0.6, sx + dx * 4.4 + 0.4, r.yF + 1.8, dz + 0.6, C('#6a6e74')); }
  for (let i = 0; i < 3; i++) { const x = r.x0 + 1.5 + i * 2.5; k.cyl(x, r.yF + 0.6, 2.0, 0.55, 1.4, C('#5a7a5a'), { axis: 'z', seg: 12 }); k.box(x - 0.6, r.yF, 1.8, x + 0.6, r.yF + 0.3, 3.6, C('#4a4a4a')); }
  k.cyl(sx, r.yF - 1.0, 2.0, 0.55, r.yC - r.yF + 1.0, C('#8a8e94'), { seg: 12 });
  for (let x = r.x0 + 3; x < r.x1; x += 6) lampC(k, x, r.yC, 2.5, { kind: 'cage', r: 5, i: 0.6 });
  A.spots.push({ x: r.x0 + 3, y: r.yF, z: 1.2, face: 'in' }, { x: sx - 1, y: r.yF, z: 3.0, face: 1 });
  r.yoke = [sx, r.yF + 1.2, 2.0];
};
FURN.officers = (k, r, A) => {
  // Commodore's dayroom and cabins; the wardroom table.
  for (const x of [r.x0 + 6, r.x0 + 11]) k.box(x - 0.05, r.yF, -0.45, x + 0.05, r.yC, r.d, W('#b08a5a', { pat: 'panels', s: 1.0 }));
  A.beds.push(berth(k, r.x0 + 1.4, r.yF, r.d - 0.1, { w: 2.0, d: 1.0, blanket: '#3a4a6a', frame: '#6a4228' }));
  const ch = chair(k, r.x0 + 4.2, r.yF, 1.5, '#7a3a2a', -1, { w: 0.75, d: 0.75 });
  A.seats.push({ x: ch.x, y: r.yF, z: ch.z, face: -1, seat: 0.46 });
  table(k, r.x0 + 3.3, r.yF, 1.5, 0.8, 0.7, { top: '#6a4228', items: 'cups' });
  picture(k, r.x0 + 3.5, r.yF + 1.3, r.d, 1.2, 0.8, '#5a7a9a', '#c8a050');
  table(k, r.x0 + 8.5, r.yF, 2.0, 3.0, 1.0, { cloth: '#f2ece0', items: 'set' });
  for (let s = -1; s <= 1; s++) { chair(k, r.x0 + 8.5 + s * 0.9, r.yF, 1.4, '#3a4a6a', 'in', { legs: true }); A.seats.push({ x: r.x0 + 8.5 + s * 0.9, y: r.yF, z: 1.63, face: 'in', seat: 0.46 }); }
  for (let i = 0; i < 2; i++) A.beds.push(berth(k, r.x0 + 12.3 + i * 2.8, r.yF, r.d - 0.1, { w: 1.9, d: 0.85, blanket: '#3a4a6a' }));
  const c2 = chair(k, r.x1 - 1.0, r.yF, 1.4, '#6a4a3a', 'in', { legs: true });
  table(k, r.x1 - 1.0, r.yF, 1.9, 0.9, 0.6, { top: '#6a4228', items: 'cards' });
  A.seats.push({ x: r.x1 - 1.0, y: r.yF, z: c2.z, face: 'in', seat: 0.46, write: true });
  for (const x of [r.x0 + 3, r.x0 + 8.5, r.x0 + 14]) lampC(k, x, r.yC, 2, { kind: 'dish', r: 3.5, color: '#ffd8a0' });
};
FURN.wheelhouse = (k, r, A) => {
  // Twin steering wheels, the gyro-pilot, engine telegraphs for each shaft, the compass.
  windows(k, r.x0 + 0.1, r.x0 + 0.2, r.yF + 1.1, r.yC - 0.2, 0, { n: 1 });
  k.box(r.x0 - 0.05, r.yF + 1.0, 0.0, r.x0 + 0.08, r.yC - 0.15, r.d, C('#b8d0d8', { c2: '#3a4a5a', glow: 'night', pat: 'panes', s: 0.8 }));
  for (const z of [1.6, 3.4]) {
    k.box(r.x0 + 2.8, r.yF, z - 0.2, r.x0 + 3.2, r.yF + 0.9, z + 0.2, C('#8a5a32'));
    k.cyl(r.x0 + 2.75, r.yF + 1.1, z, 0.45, 0.06, C('#7a4a2a', { pat: 'rings', s: 0.08 }), { axis: 'x', seg: 14 });
  }
  k.box(r.x0 + 1.3, r.yF, 2.3, r.x0 + 1.7, r.yF + 1.1, 2.7, C('#c8a050'));
  k.sphere(r.x0 + 1.5, r.yF + 1.25, 2.5, 0.22, C('#c8a050'), { seg: 8, rings: 5 });
  for (let i = 0; i < 4; i++) { const z = 0.6 + i * 1.2; k.cyl(r.x0 + 5, r.yF, z, 0.1, 1.0, C('#c8a050'), { seg: 6 }); k.cyl(r.x0 + 5, r.yF + 1.0, z - 0.12, 0.25, 0.24, C('#e8e0c8'), { axis: 'z', seg: 10 }); }
  k.box(r.x1 - 2.5, r.yF, r.d - 1.2, r.x1 - 0.3, r.yF + 0.95, r.d - 0.1, C('#7a5232', { pat: 'grain' }));
  k.box(r.x1 - 2.4, r.yF + 0.95, r.d - 1.1, r.x1 - 0.4, r.yF + 0.97, r.d - 0.2, C('#e8e0c8'));
  A.spots.push({ x: r.x0 + 3.4, y: r.yF, z: 1.6, face: -1, helm: true }, { x: r.x0 + 1.2, y: r.yF, z: 1.2, face: -1, watch: true }, { x: r.x1 - 1.4, y: r.yF, z: r.d - 1.6, face: 'in', chart: true }, { x: r.x0 + 5.5, y: r.yF, z: 1.4, face: -1 });
  lampC(k, mid(r), r.yC, 2.5, { kind: 'dish', r: 3, i: 0.25, color: '#ffb880' });
};
FURN.compass = (k, r, A) => {
  k.box(r.x0 + 4.5, r.yF, 2.2, r.x0 + 5.1, r.yF + 1.1, 2.8, C('#7a5232'));
  k.sphere(r.x0 + 4.8, r.yF + 1.3, 2.5, 0.3, C('#c8a050'), { seg: 8, rings: 5 });
  k.cyl(r.x0 + 1, r.yF, 4, 0.5, 0.9, C('#5a5e64'), { seg: 10 });
  k.cyl(r.x0 + 0.6, r.yF + 1.2, 4, 0.45, 0.6, C('#c8ccd0'), { axis: 'x', seg: 10 });
  k.box(r.x0 + 0.1, r.yF, 0.0, r.x0 + 0.2, r.yF + 1.2, r.d, C('#c8b08a', { pat: 'canvas', s: 0.8 }));
  props_rail(k, r.x0 + 0.2, r.x1 - 0.2, r.yF, r.d);
  A.spots.push({ x: r.x0 + 4.0, y: r.yF, z: 2.0, face: 1, compass: true });
};
FURN.tennis = (k, r, A) => {
  k.box(r.x0 + 1, r.yF + 0.01, 1, r.x1 - 1, r.yF + 0.02, 11, C('#5a7a5a'));
  for (const [a, b, c, d] of [[r.x0 + 1, r.x1 - 1, 1, 1.08], [r.x0 + 1, r.x1 - 1, 10.92, 11], [r.x0 + 1, r.x0 + 1.08, 1, 11], [r.x1 - 1.08, r.x1 - 1, 1, 11], [r.x0 + 1, r.x1 - 1, 5.96, 6.04]]) k.box(a, r.yF + 0.02, c, b, r.yF + 0.025, d, C('#f2ece0'));
  k.box(mid(r) - 0.03, r.yF, 1, mid(r) + 0.03, r.yF + 1.5, 11, C('#f2ece0', { pat: 'grate' }));
  // Wire netting round the courts: posts and rails.
  for (let x = r.x0 + 0.3; x <= r.x1 - 0.3; x += 2.1) k.cyl(x, r.yF, 11.8, 0.04, 2.8, C('#3a3a3a'), { seg: 4 });
  k.cyl(r.x0 + 0.3, r.yF + 2.8, 11.8, 0.03, r.x1 - r.x0 - 0.6, C('#3a3a3a'), { axis: 'x', seg: 4 });
  A.spots.push({ x: mid(r) - 3, y: r.yF, z: 4, face: 1, tennis: true }, { x: mid(r) + 3, y: r.yF, z: 7, face: -1, tennis: true }, { x: mid(r) - 4, y: r.yF, z: 8, face: 1, tennis: true }, { x: mid(r) + 4, y: r.yF, z: 3, face: -1, tennis: true }, { x: mid(r), y: r.yF, z: 0.6, face: 'out', umpire: true });
};
FURN.kennels = (k, r, A) => {
  // Kennels for 26 dogs: a row of pens, an exercise run, and the lamppost.
  for (let i = 0; i < 6; i++) {
    const x = r.x0 + 0.6 + i * 1.3;
    k.box(x, r.yF, 7.6, x + 1.2, r.yF + 1.2, 9.4, C('#e8e0cc', { pat: 'planks', s: 0.2 }));
    bars(k, x + 0.05, x + 1.15, r.yF, r.yF + 1.1, 7.55, 0.12, '#5a5a56');
  }
  bars(k, r.x0 + 0.3, r.x1 - 0.3, r.yF, r.yF + 1.4, 2.5, 0.35, '#5a5a56');
  k.cyl(r.x0 + 4.5, r.yF, 5.0, 0.06, 2.6, C('#2a3a2a'), { seg: 6 });
  k.box(r.x0 + 4.3, r.yF + 2.6, 4.8, r.x0 + 4.7, r.yF + 3.0, 5.2, C('#f4e8c8', { c2: '#ffe0a0', glow: 'night' }));
  k.lamp(r.x0 + 4.5, r.yF + 2.8, 5.0, { r: 3, i: 0.6, bulb: false, halo: 0.3 });
  r.post = [r.x0 + 4.5, r.yF, 5.0];
  const cols = ['#c8a878', '#2a2622', '#f2ece0', '#8a5a32', '#d8c8a8'];
  for (let i = 0; i < 5; i++) dog(k, r.x0 + 1.2 + i * 1.3, r.yF, 8.4, cols[i], 0.85, i % 2 ? 1 : -1);
  A.spots.push({ x: r.x0 + 2, y: r.yF, z: 6.5, face: 'in', kennel: true }, { x: r.x0 + 6, y: r.yF, z: 4.5, face: 1 });
};
FURN.opendeck = (k, r, A) => {
  for (const x of [292, 300]) { k.cyl(x, r.yF, 4, 0.45, 0.9, M.darkGrey, { seg: 12 }); k.cyl(x, r.yF + 0.9, 4, 0.55, 0.15, M.darkGrey, { seg: 12 }); }
  for (const x of [280, 304]) { const z = Math.max(1, inner(x, r.yF) - 0.8); k.cyl(x - 0.3, r.yF, z, 0.2, 0.7, M.darkGrey, { seg: 8 }); k.cyl(x + 0.3, r.yF, z, 0.2, 0.7, M.darkGrey, { seg: 8 }); }
  for (let x = r.x0 + 1; x < 276; x += 1.4) { const c = deckchair(k, x, r.yF, 6, 'out', '#e8dcc0', ((x * 3) | 0) % 2 ? '#3a6a5a' : '#8a6a3a'); A.seats.push({ x: c.x, y: r.yF, z: c.z, face: 'out', seat: 0.38, deck: true }); }
  for (let x = 258; x < 300; x += 6) A.spots.push({ x, y: r.yF, z: 3, face: 1, wake: true });
  // Rail round the stern.
  for (let x = r.x0; x < r.x1 - 0.5; x += 1.5) { const z = Math.max(0.6, inner(x, r.yF) - 0.2); k.cyl(x, r.yF, z, 0.025, 1.05, M.rail, { seg: 4 }); }
};
FURN.lift = (k, r) => {
  // A trunk with lattice gates at each landing: the engineers' lift.
  const z0 = 0.4, z1 = 2.4;
  for (const x of [r.x0, r.x1]) k.box(x - 0.05, r.yF, -0.45, x + 0.05, r.yC, z1 + 0.1, W('#d8d0b8', { pat: 'bars', s: 0.18 }));
  k.box(r.x0, r.yF, z1, r.x1, r.yC, z1 + 0.12, W('#b8b0a0', { pat: 'rivets', s: 0.8 }));
  for (const key of ['E', 'D', 'C', 'B', 'A', 'M', 'P', 'S', 'SP']) { const y = DK[key]; slab(k, r.x0, r.x1, y, M.slabCut, { top: M.deckSteel, zIn: z1, zOut: z1 + 0.1 }); }
  void z0;
};
