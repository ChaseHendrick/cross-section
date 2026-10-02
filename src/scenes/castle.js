/* The Castle: placeholder until the scene is built (see docs/SCENE-GUIDE.md). */
import { XS, mat } from '../engine/index.js';

XS.scenes.register({
  id: 'castle', order: 20, title: 'The Castle', subtitle: 'A great stone castle, about 1300',
  blurb: 'Kitchens, chapel, great hall and wall walks: a whole household behind walls metres thick.',
  bounds: { x0: -10, x1: 10, y0: 0, y1: 6, z0: 0, z1: 6 },
  placeholder: true,
  build(k) {
    k.box(-6, 0, 0, 6, 0.4, 6, mat({ c: '#c8b89a', pat: 'planks' }));
    k.box(-6, 0.4, 5, 6, 4, 5.4, mat({ c: '#e8dcc0', pat: 'stripes', c2: '#dccfae' }));
    k.label({ x: 0, y: 2, z: 3, title: 'Being drawn', text: 'This cross-section is still on the drawing board.' });
  },
  setup() {},
});
