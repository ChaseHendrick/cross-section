/* The Submarine: placeholder until the scene is built (see docs/SCENE-GUIDE.md). */
import { XS, mat } from '../engine/index.js';

XS.scenes.register({
  id: 'submarine', order: 100, title: 'The Submarine', subtitle: 'A fleet submarine of the 1940s',
  blurb: 'A crew of about eighty in a steel tube, charging batteries on the surface under the stars.',
  bounds: { x0: -10, x1: 10, y0: 0, y1: 6, z0: 0, z1: 6 },
  placeholder: true,
  build(k) {
    k.box(-6, 0, 0, 6, 0.4, 6, mat({ c: '#c8b89a', pat: 'planks' }));
    k.box(-6, 0.4, 5, 6, 4, 5.4, mat({ c: '#e8dcc0', pat: 'stripes', c2: '#dccfae' }));
    k.label({ x: 0, y: 2, z: 3, title: 'Being drawn', text: 'This cross-section is still on the drawing board.' });
  },
  setup() {},
});
