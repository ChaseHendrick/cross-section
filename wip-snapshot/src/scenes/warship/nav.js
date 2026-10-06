/* Warship scene: the navigation graph (decks, ladders, gangways, rigging). */
import { Y, innerZ } from './geom.js';
import { LADDERS, CHANNEL, CH_Y, chainZ } from './hull.js';
import { RIG } from './rig.js';

// Lanes on each deck: [deck, y, x0, x1, z, tag]
const LANES = [
  ['hold', 2.55, 15.4, 45.4, 0.7, 'c'],
  ['orlop', Y.orlop, 3.8, 47.0, 0.95, 'c'],
  ['lower', Y.lower, 1.4, 55.4, 1.35, 'c'],
  ['lower', Y.lower, 4.5, 27.4, 3.3, 's'],
  ['lower', Y.lower, 33.8, 47.0, 3.3, 't'],
  ['middle', Y.middle, 1.4, 8.6, 1.35, 'f'],
  ['middle', Y.middle, 14.4, 55.4, 1.35, 'c'],
  ['middle', Y.middle, 3.0, 42.0, 3.3, 's'],
  ['upper', Y.upper, 0.4, 56.6, 1.0, 'c'],
  ['upper', Y.upper, 2.0, 18.8, 3.6, 's'],
  ['upper', Y.upper, 24.2, 42.0, 3.6, 't'],
  ['fc', Y.fc, 0.0, 12.6, 1.5, 'c'],
  ['fc', Y.fc, 1.0, 12.2, 3.5, 's'],
  ['qd', Y.qd, 34.3, 54.6, 1.2, 'c'],
  ['qd', Y.qd, 34.3, 46.2, 3.4, 's'],
  ['poop', Y.poop, 48.6, 56.2, 1.4, 'c'],
  ['poop', Y.poop, 48.8, 56.4, 3.3, 's'],
];

export function buildNav(W, aloft) {
  const nav = W.nav;
  const byDeck = {};
  for (const [deck, y, x0, x1, z, tag] of LANES) {
    const ids = nav.walkway(deck + tag, x0, x1, y, z, 2.6);
    (byDeck[deck] || (byDeck[deck] = [])).push(ids);
  }
  // The galley stove sits on the middle deck's centre line: walk round it.
  const g = [nav.node('galleyA', 9.0, Y.middle, 2.45), nav.node('galleyB', 11.6, Y.middle, 2.45), nav.node('galleyC', 14.0, Y.middle, 2.45)];
  nav.chain(g);
  // Gangways along the side joining forecastle and quarterdeck.
  const gw = [];
  for (let x = 13.2; x <= 33.8; x += 2.6) gw.push(nav.node('gw' + gw.length, x, Y.fc, innerZ(x, Y.fc + 0.1) - 0.85));
  nav.chain(gw);
  (byDeck.gw = [gw]);
  // The heads, out on the beakhead.
  const heads = [nav.node('heads0', -0.7, 12.55, 1.0), nav.node('heads1', -1.9, 12.52, 1.6), nav.node('heads2', -3.1, 12.48, 1.4)];
  nav.chain(heads);
  byDeck.heads = [heads];

  const nearestIn = (deck, x, z) => {
    let best = null, bd = Infinity;
    for (const ids of byDeck[deck]) for (const id of ids) { const n = nav.get(id); const d = Math.abs(n.x - x) + Math.abs(n.z - z) * 0.5; if (d < bd) { bd = d; best = id; } }
    return best;
  };
  // Cross links between lanes on the same deck.
  for (const deck of Object.keys(byDeck)) {
    const L = byDeck[deck];
    for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
      for (const id of L[b]) {
        const n = nav.get(id);
        let best = null, bd = Infinity;
        for (const j of L[a]) { const m = nav.get(j); const d = Math.abs(m.x - n.x); if (d < bd) { bd = d; best = j; } }
        if (bd < 1.6 && Math.abs(nav.get(best).y - n.y) < 0.3) nav.link(id, best);
      }
    }
  }
  nav.link('galleyA', nearestIn('middle', 8.6, 1.35)); nav.link('galleyA', nearestIn('middle', 8.0, 3.3));
  nav.link('galleyC', nearestIn('middle', 14.4, 1.35));
  nav.link(gw[0], nearestIn('fc', 12.6, 3.5));
  nav.link(gw[gw.length - 1], nearestIn('qd', 34.3, 3.4));
  nav.link(heads[0], nearestIn('upper', 0.4, 1.0), 'door');
  // Ladders.
  for (const L of LADDERS) {
    const s = L.x0 > L.x1 ? 1 : -1, z = ((L.z0 != null ? L.z0 : 0.25) + (L.z1 != null ? L.z1 : 0.95)) / 2;
    const a = nav.node(L.x0 + s * 0.35, L.y0, z), b = nav.node(L.x1 - s * 0.35, L.y1, z);
    nav.link(a, b, 'stairs');
    nav.link(a, nearestIn(L.a, L.x0 + s * 0.5, z));
    nav.link(b, nearestIn(L.b, L.x1 - s * 0.5, z));
  }
  // The magazine scuttle: a ladder down from the passage on the orlop.
  const mag = nav.node('magazine', 12.6, 3.05, 1.0), magTop = nav.node('magScuttle', 12.9, Y.orlop, 1.3);
  nav.link(mag, magTop, 'ladder');
  nav.link(magTop, nearestIn('orlop', 12.9, 0.95));
  // Rigging: over the rail to the channels, up the shrouds to the tops, crosstrees and yards.
  const rig = {};
  for (const [name, R] of Object.entries(RIG)) {
    const [c0, c1] = CHANNEL[name];
    const cx = (c0 + c1) / 2;
    const ch = nav.node('ch-' + name, cx, CH_Y + 0.25, chainZ(cx) - 0.1);
    const from = name === 'fore' ? nearestIn('fc', cx, 3.5) : name === 'main' ? nearestIn('gw', cx, 6) : nearestIn('qd', cx, 3.4);
    nav.link(from, ch, 'ladder');
    const shroud = nav.node('sh-' + name, cx - 0.4, (CH_Y + R.top) / 2, (chainZ(cx) + 2.4) / 2);
    const top = nav.node('top-' + name, R.x + 0.3, R.top + 0.12, 1.6);
    nav.link(ch, shroud, 'rope'); nav.link(shroud, top, 'rope');
    const xt = nav.node('xt-' + name, R.x - 0.55, R.xt + 0.12, 0.7);
    nav.link(top, xt, 'rope');
    rig[name] = { ch, shroud, top, xt, yards: [] };
  }
  for (const a of aloft) {
    if (a.top || a.xt) continue;
    const id = nav.node(a.x, a.y, a.z);
    nav.link(id, a.yard === 0 ? rig[a.mast].top : rig[a.mast].xt, 'rope');
    (rig[a.mast].yards[a.yard] || (rig[a.mast].yards[a.yard] = [])).push({ id, x: a.x, y: a.y, z: a.z });
  }
  return { nearestIn, rig, byDeck };
}
