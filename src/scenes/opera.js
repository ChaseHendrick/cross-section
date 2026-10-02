/* The Opera House: placeholder until the scene is built (see docs/SCENE-GUIDE.md). */
import { XS, mat } from '../engine/index.js';

XS.scenes.register({
  id: 'opera', order: 120, title: 'The Opera House', subtitle: 'A grand opera house, 1875',
  blurb: 'From the cistern beneath the stage to the gods in the roof, on a gala night.',
  bounds: { x0: -10, x1: 10, y0: 0, y1: 6, z0: 0, z1: 6 },
  placeholder: true,
  build(k) {
    k.box(-6, 0, 0, 6, 0.4, 6, mat({ c: '#c8b89a', pat: 'planks' }));
    k.box(-6, 0.4, 5, 6, 4, 5.4, mat({ c: '#e8dcc0', pat: 'stripes', c2: '#dccfae' }));
    k.label({ x: 0, y: 2, z: 3, title: 'Being drawn', text: 'This cross-section is still on the drawing board.' });
  },
  setup() {},
});
