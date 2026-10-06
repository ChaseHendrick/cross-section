/* <Title>: <one-line subject and date>.
 *
 * Layout plan (metres): x ranges of the zones, deck or floor heights, depth used,
 * suggested cuts. Keep this comment up to date; the next person reads it first.
 *
 * Sources: docs/research/<id>.md
 */
import { XS, THREE, mat, props, shade, mix } from '../engine/index.js';

// Materials used more than once.
const HULL = mat({ c: '#22201e', cut: '#1a1816', pat: 'plates', s: 1.4 });
const DECK = mat({ c: '#c8a878', c2: '#a88858', pat: 'deck', cut: '#b08a5a', cutPat: true });

function build(k) {
  // Shell first, then decks and rooms, then furniture, lamps and captions.
  k.box(0, 0, 0, 40, 1, 8, HULL);
  k.room(2, 12, 1, 4, 0, 6, { floor: DECK, wall: '#ece4cf' });
  props.table(k, 7, 1, 1.5, { w: 1.6, items: 'setting' });
  props.lamp(k, 7, 4, 2.5, {});
  k.label({ x: 7, y: 2.5, z: 2, title: 'A room', text: 'What happened here, in one or two sentences.', min: 6 });
}

function setup(W, stage, k) {
  const nav = W.nav;
  nav.walkway('d', 3, 11, 1, 2, 2);
  W.addPerson({ name: 'A. Person', role: 'role', bio: 'One human detail.', at: 'd2', act: 'sitEat', face: 'out' });
  W.stop({ x: 20, y: 2, z: 2, w: 50, title: 'Overview', text: 'The story in two sentences.', hold: 9 });
  void stage; void k;
}

XS.scenes.register({
  id: 'template', order: 999, title: 'Template', subtitle: 'Copy me', blurb: 'Not listed.',
  bounds: { x0: -5, x1: 45, y0: -2, y1: 10, z0: 0, z1: 10 },
  hidden: true,
  build, setup,
});
void THREE; void shade; void mix;
