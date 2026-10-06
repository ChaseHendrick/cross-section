/* The Atlantic Liner: RMS Queen Mary on a westbound crossing, August 1938.
 * (work in progress)
 */
import { XS, makeSea } from '../engine/index.js';
import { LOA, BULKHEADS } from './liner/shape.js';
import { buildHull, buildWater, buildFunnels, buildMasts, buildBoats, buildDeckGear } from './liner/hull.js';

function build(k) {
  buildHull(k);
  buildWater(k, makeSea);
  buildFunnels(k);
  buildMasts(k);
  buildBoats(k);
  buildDeckGear(k);
}

function setup(W) {
  W.stop({ x: LOA / 2, y: 30, z: 4, w: 340, title: 'Queen Mary', text: 'A westbound crossing.', hold: 10 });
}

const snap = (x) => {
  let best = x, bd = 4;
  for (const b of BULKHEADS) if (Math.abs(b - x) < bd) { bd = Math.abs(b - x); best = b; }
  return best === x ? Math.round(x * 2) / 2 : best;
};

XS.scenes.register({
  id: 'liner', order: 10, title: 'The Atlantic Liner', subtitle: 'RMS Queen Mary, westbound, August 1938',
  blurb: 'Thousands of passengers and crew, three funnels and turbines the size of houses, bound for New York.',
  bounds: { x0: -12, x1: 323, y0: -10, y1: 76, z0: 0, z1: 40 },
  frame: { x0: -4, x1: 315, y0: -6, y1: 74, z0: 0, z1: 18 },
  view: { yaw: -0.36, pitch: 0.22 },
  startHour: 11,
  wind: 7,
  clouds: 0.42,
  fog: [500, 3500, 0.55],
  suggestedCuts: [52, 92, 154, 199, 250],
  snapCut: snap,
  cutRange: [2, LOA - 2],
  focusDepth: 4,
  build, setup,
});
