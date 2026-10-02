/* The Jumbo Jet (work in progress). */
import { XS, mat } from '../engine/index.js';
import { DOORS } from './jet/common.js';
import { buildShell, buildDecks, buildFairing, buildWings, buildTail, buildEngines, buildLights } from './jet/airframe.js';

const P = { fans: [] };
const S = { DOORS };

function build(k) {
  P.fans = [];
  buildShell(k, S);
  buildDecks(k);
  buildFairing(k);
  buildWings(k);
  buildTail(k);
  buildEngines(k, P);
  buildLights(k, P);
  void mat;
}

function setup(W) {
  W.addMachine((dt, t) => { for (const f of P.fans) f.rotation.x = t * 3; if (P.hp) P.hp.rotation.x = t * 6; });
}

XS.scenes.register({
  id: 'jet', order: 80, title: 'The Jumbo Jet', subtitle: 'A Boeing 747 crossing the Atlantic, 1970s',
  blurb: 'Hundreds of people at cruising height, through a night above the clouds.',
  bounds: { x0: -6, x1: 78, y0: -12, y1: 19, z0: -2, z1: 8 },
  frame: { x0: -4, x1: 74, y0: -9, y1: 18.5, z0: 0, z1: 6 },
  startHour: 11,
  build, setup,
});
