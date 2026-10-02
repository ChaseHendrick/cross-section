/* The Car Factory: Ford's Highland Park plant, Highland Park, Michigan, on a weekday in late
 * autumn 1914 (nominally Thursday 12 November, a chosen date). Research: docs/research/factory.md.
 *
 * A declared composite (dossier 3.1): real buildings, storey heights, floor uses and machines,
 * set out left to right in the order a Model T was made. We look north from the Manchester
 * Avenue side; west (Woodward Avenue) is on the left. y = 0 is every ground floor and the street.
 * z is depth behind the cut, which runs along each building (its south wall is taken away).
 *
 *   x  -40..  2  Woodward Avenue (streetcar rails, telegraph poles), shops beyond
 *   x    8.. 36  Power house: 5,000 hp and 1,500 hp gas engines, basement to -4.5, a new power
 *                plant under construction on the roof (y 11 to 22), five stacks behind (z 24)
 *   x   36..106  Gray-iron foundry, saw-tooth roof (eaves 7, ridges 10.5): four cupolas cut
 *                open at z 0.55 and a fifth being placed, charging stage at y 6.5, pattern room,
 *                two mould-carrier loops, the cylinder floor under three craneways, core ovens,
 *                the cleaning room; the overhead monorail runs on to the machine shop
 *   x  106..116  Heat treatment
 *   x  116..196  Machine shop, saw-tooth (eaves 6, ridges 9): tool room and drawing office,
 *                cylinder blocks (Ingersoll mills), Craneway No. 1 (x 139 to 151, glass roof),
 *                crank and cam grinding, the magneto line and coil benches, motor lines, test
 *                blocks; employment office with first aid and the English class upstairs
 *   x  196..298  Building H, four storeys (y 0, 4.2, 8.4, 12.6; roof 16.8), 20 ft grid with
 *                column rows at z 0 (cut), 6.1, 12.2, 18.3: chassis lines 1 to 3 at z 3.05,
 *                9.15, 15.25 (line 3 idle); dash line, wheels and tyres, fenders and commutators
 *   x  298..330  John R Street: door D, the angle-iron track, body chute and gallows frame,
 *                the enclosed bridge from the new building, the idlers
 *   x  330..400  The new south building, six storeys (S1 p.391 levels); the craneway behind it
 *                (z 12.2 to 24.4, track at -1.07, crane rails 23.3, peak 27.1) and the north
 *                building (z 24.4 to 42.7) seen in the slices
 *   x  400..470  The railway: box cars, a belt-line switch engine at night
 *
 * Suggested cuts fall on the party walls between buildings: 36, 106, 196, 298 and 330, plus a
 * cut at 238 that splits Building H between the dash platform and the wheel chutes.
 * Modules: factory/common (constants, materials), shell (ground and envelopes), west, shop,
 * bldgH, east (interiors), car (the Model T), machines, people, story (captions, tour, sound).
 */
import { XS } from '../engine/index.js';
import { H, N } from './factory/common.js';
import { buildShell } from './factory/shell.js';
import { buildWest } from './factory/west.js';
import { buildShop } from './factory/shop.js';
import { buildH } from './factory/bldgH.js';
import { buildEast } from './factory/east.js';
import { setupMachines } from './factory/machines.js';
import { buildPeople } from './factory/people.js';
import { captions, tour, sounds } from './factory/story.js';

const CUTS = [36, 106, 196, 238, 298, 330];
const FRAMES = CUTS.concat([116, 139, 151]);

function build(k) {
  buildShell(k);
  buildWest(k);
  buildShop(k);
  buildH(k);
  buildEast(k);
  captions(k);
}

function setup(W, stage, k) {
  setupMachines(W, k);
  buildPeople(W, k);
  tour(W);
  sounds(W);
  // Run the machinery for a few minutes so the lines and the street are already busy.
  const h = W.hour;
  for (let i = 0; i < 900; i++) for (const m of W.machines) m.fn(0.5, i * 0.5, W);
  W.hour = h;
}

XS.scenes.register({
  id: 'factory', order: 110, title: 'The Car Factory', subtitle: 'The moving assembly line, Highland Park, 1914',
  blurb: 'Iron poured at dawn, chassis on a chain, bodies lowered in the street: Ford\u2019s Model T works in one long cutaway.',
  bounds: { x0: -30, x1: 450, y0: -7, y1: 62, z0: 0, z1: 50 },
  frame: { x0: -30, x1: 425, y0: -6, y1: 60, z0: 0, z1: 20 },
  view: { yaw: -0.3, pitch: 0.2 },
  startHour: 10.2,
  thumb: { hour: 19.8, angle: [-0.35, 0.16], zoom: [300, 10, 150, 5] },
  daySeconds: 720,
  wind: 2.5,
  clouds: 0.8,
  fog: [260, 1500, 0.55],
  focusDepth: 4,
  lampGain: 2.4,
  suggestedCuts: CUTS,
  cutRange: [2, 410],
  sliceGap: 14,
  snapCut(x) {
    // Snap to a party wall or a column line of Buildings H and N when close.
    let b = null, d = 2.5;
    for (const c of FRAMES.concat(H.colX, N.colX)) if (Math.abs(c - x) < d) { d = Math.abs(c - x); b = c; }
    return b != null ? b : Math.round(x * 2) / 2;
  },
  ambience: { room: 0.7, reverb: 0.4, size: 1.6, crowd: 0.3, wind: 0.2 },
  build, setup,
});
