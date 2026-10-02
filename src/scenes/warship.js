/* The Man-of-War: placeholder until the scene is built (see docs/SCENE-GUIDE.md). */
import { XS, mat } from '../engine/index.js';

XS.scenes.register({
  id: 'warship', order: 30, title: 'The Man-of-War', subtitle: 'A first-rate ship of the line, 1805',
  blurb: 'Hundreds of sailors on five decks, a hundred guns, and a forest of rigging.',
  bounds: { x0: -10, x1: 10, y0: 0, y1: 6, z0: 0, z1: 6 },
  placeholder: true,
  build(k) {
    k.box(-6, 0, 0, 6, 0.4, 6, mat({ c: '#c8b89a', pat: 'planks' }));
    k.box(-6, 0.4, 5, 6, 4, 5.4, mat({ c: '#e8dcc0', pat: 'stripes', c2: '#dccfae' }));
    k.label({ x: 0, y: 2, z: 3, title: 'Being drawn', text: 'This cross-section is still on the drawing board.' });
  },
  setup() {},
});
