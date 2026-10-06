/* The Man-of-War: HMS Victory, 104 guns, at sea west of Cadiz on 9 October 1805.
 * (work in progress: shell first)
 */
import { XS, mat, makeSea } from '../engine/index.js';
import { halfB, stemX, sternX, WL } from './warship/geom.js';
import { buildHull, buildDecks, buildBulkheads, buildPorts, buildOpenPorts, buildHead, buildStern, buildChannels } from './warship/hull.js';

function build(k) {
  buildHull(k);
  buildDecks(k);
  buildBulkheads(k);
  buildPorts(k);
  buildHead(k);
  buildStern(k);
  buildChannels(k);
  k.data = { ports: buildOpenPorts(k) };
  const inside = (x, z) => Math.abs(z) < halfB(x, WL) + 0.15 && x > stemX(WL) - 0.3 && x < sternX(WL) + 0.3;
  k.object(makeSea({ level: WL, x0: -80, x1: 140, detailX0: -40, detailX1: 100, step: 1.2, mask: inside, maskBox: [-4, 0, 60, 10], deep: '#2a5a76', shallow: '#3f7c90', amp: 1 }));
  for (let y = -8; y < WL - 1e-6; y += 0.5) {
    const y1 = Math.min(WL, y + 0.5);
    const xa = y1 <= 0 ? 60 : stemX(Math.max(0, y)), xb = y1 <= 0 ? 60 : sternX(Math.max(0, y));
    if (y1 <= 0) { k.sheet(-400, 400, y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 }); continue; }
    k.sheet(-400, Math.min(stemX(y), stemX(y1)), y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 });
    k.sheet(Math.max(sternX(y), sternX(y1)), 400, y, y1, 0.01, { c: '#2a6a7e', alpha: 0.34 });
    void xa; void xb;
  }
  void mat;
}

function setup(W, stage, k) {
  const ports = k.data.ports;
  W.addMachine(() => { ports.visible = W.sun().day > 0.5; });
}

XS.scenes.register({
  id: 'warship', order: 30, title: 'The Man-of-War', subtitle: 'HMS Victory off Cadiz, October 1805',
  blurb: 'Hundreds of sailors on five decks, a hundred guns, and a forest of rigging.',
  bounds: { x0: -26, x1: 66, y0: -6, y1: 72, z0: 0, z1: 22 },
  frame: { x0: -25, x1: 64, y0: -3, y1: 46, z0: 0, z1: 8 },
  startHour: 10,
  wind: -3,
  clouds: 0.45,
  fog: [220, 1600, 0.6],
  build, setup,
});
