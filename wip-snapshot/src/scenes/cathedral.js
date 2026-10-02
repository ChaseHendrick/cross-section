/* Salisbury Cathedral: the nave rising, a working weekday in late June 1245.
 *
 * Sources: docs/research/cathedral.md (all captions with a fact card cite a source the
 * dossier verified). Coordinates follow the dossier: x metres east of the west face of the
 * future west-front buttresses, y above the nave floor, z north of the axis. The section is
 * cut along the axis: the south half is removed and we look north.
 *
 * Layout plan (x):
 *   -46 .. -40  food and ale stall          -39 .. -34  Chilmark stone on skids; the cart road behind (z 8)
 *   -33 .. -28  bell-casting pit (y -2.5)   -28 .. -22  smithy
 *   -22 .. -8   masons' lodge, tracing loft over its west end (floor y 3.7)
 *    -8 .. -5   clerk's booth               -5 .. 0     lime pit, sand, mortar trough
 *     0 .. 5.5  west front: open trench and lowest courses
 *   5.5 .. 61.5 nave, 10 bays of 5.6 m, rising west to east (illustrative staging):
 *               bays 1-3 pier bases; 4-6 arches on centring, putlog scaffold, windlass;
 *               7-8 clerestory rising on a tall scaffold; 9-10 full height, roof framing,
 *               great wheel on the tie beams (y 27.5), lead on bay 10; casting bed on the floor
 *   61.5        temporary boarded screen;   61.5 .. 73.5 crossing, tower stub to 42 m, north transept to z 31
 *  73.5 .. 91.5 quire with stalls;          91.5 .. 103.5 eastern crossing, lesser transept to z 22
 * 103.5 .. 119.5 presbytery, high altar at x 117; 119.5 .. 129.5 retrochoir; 129.5 .. 140.5 Trinity Chapel
 * 140.5 .. 144.2 east wall and buttresses;  146 .. 158 masons' cottages; town beyond; the Avon at x 178-190
 * Heights: arcade capitals 8.5, triforium 12.5-16, vault springing 17, crown 25.5 (verified), wall plate 27.5,
 * ridge 36.5. Depth: piers at z 6.4, upper wall 5.65-7.15, aisle wall 11.7-13, belfry at z 74.
 * Suggested cuts at 5.5, 33.5, 61.5, 73.5, 103.5 and 119.5 (dossier 3.6).
 */
import { XS } from '../engine/index.js';
import { buildChurch } from './cathedral/church.js';
import { buildGround, buildSurroundings } from './cathedral/ground.js';
import { buildSite } from './cathedral/site.js';
import { buildFittings } from './cathedral/fittings.js';
import { buildTown } from './cathedral/town.js';
import { buildNav, buildMachines, buildAnimals, buildEffects } from './cathedral/life.js';
import { buildPeople, buildExtras } from './cathedral/people.js';
import { captions, tour } from './cathedral/captions.js';

const LINES = [0, 5.5, 33.5, 61.5, 73.5, 91.5, 103.5, 119.5, 129.5, 140.5];
for (let i = 1; i <= 9; i++) LINES.push(5.5 + i * 5.6);
for (const x of [79.5, 85.5, 108.83, 114.17, 124.5, 135]) LINES.push(x);
const snapCut = (x) => {
  let best = x, bd = 2.4;
  for (const b of LINES) if (Math.abs(b - x) < bd) { bd = Math.abs(b - x); best = b; }
  return best === x ? Math.round(x * 2) / 2 : best;
};

XS.scenes.register({
  id: 'cathedral', order: 60, title: 'The Cathedral', subtitle: 'Salisbury, the nave rising, midsummer 1245',
  blurb: 'The east end in daily use, the nave climbing bay by bay: masons, carpenters, plumbers and canons on one great site.',
  bounds: { x0: -48, x1: 186, y0: -5, y1: 62, z0: 0, z1: 36 },
  frame: { x0: -45, x1: 162, y0: -5, y1: 44, z0: 0, z1: 12 },
  view: { yaw: -0.38, pitch: 0.2 },
  startHour: 10.5,
  daySeconds: 720,
  wind: 2.2,
  clouds: 0.5,
  fog: [320, 2600, 0.7],
  ambient: { sky: '#e6eaea', ground: '#b4a88e' },
  suggestedCuts: [5.5, 33.5, 61.5, 73.5, 103.5, 119.5],
  snapCut,
  cutRange: [-44, 162],
  focusDepth: 3,
  lampGain: 1.3,
  ambience: { wind: 0.35, crowd: 0.2, room: 0.2, reverb: 0.4, size: 3.5 },
  build(k) {
    buildGround(k);
    buildSurroundings(k);
    buildChurch(k);
    buildSite(k);
    buildFittings(k);
    buildTown(k);
    captions(k);
  },
  setup(W, stage, k) {
    buildNav(W);
    buildMachines(W, k);
    buildAnimals(W, k);
    buildEffects(W);
    buildPeople(W, k);
    buildExtras(W, k);
    // The wheel men walk only while the wheel turns.
    W.addMachine(() => { const on = W.data.hoist && W.data.hoist.walking; for (const st of W.data.treadSteps || []) st.act = on ? 'tread' : 'stand'; });
    tour(W);
    void stage;
  },
});
