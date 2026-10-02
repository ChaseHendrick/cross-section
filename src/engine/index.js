/* Public engine API for scene authors.
 *
 *   import { XS, THREE, mat, props, shade, mix, rng } from '../engine/index.js';
 *   XS.scenes.register({ id, title, bounds, build(kit), setup(world, stage, kit), update(world, dt, t, stage) });
 *
 * See docs/ENGINE-API.md and docs/SCENE-GUIDE.md.
 */
import * as THREE from 'three';
export { THREE };
export { XS, hash, h01, rng, noise1, noise2, fbm2, toRgb, toHex, mix, shade, rgba, vary, INK } from './core.js';
export { mat, Kit, bakeLamps } from './kit.js';
export { PAT, F, U, OU, inkMaterial, overlayMaterial, glowMaterial } from './materials.js';
export { anims, newPose } from './anims.js';
export { Figures, costume } from './figures.js';
export { World, Nav, Person } from './world.js';
export { Particles } from './particles.js';
export { sun, applyLighting, makeSea, updateSea, Sky } from './sky.js';
export { InkPass } from './post.js';
export { Camera3 } from './camera.js';
export { Labels } from './labels.js';
export { props } from './props.js';
export { Stage, THEME } from './stage.js';
export { Audio } from './audio.js';
export { Physics, CANNON } from './physics.js';
