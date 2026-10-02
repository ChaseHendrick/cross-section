/* Cross-Sections: application entry.
 *
 * Scenes register themselves when imported. Each is loaded in isolation so a scene that
 * fails to load (a work in progress, say) cannot take the others down with it.
 * ?only=<id> loads a single scene, which is quicker when working on one.
 */
import './engine/index.js';

const SCENES = {
  liner: () => import('./scenes/liner.js'),
  castle: () => import('./scenes/castle.js'),
  warship: () => import('./scenes/warship.js'),
  train: () => import('./scenes/train.js'),
  mine: () => import('./scenes/mine.js'),
  cathedral: () => import('./scenes/cathedral.js'),
  lighthouse: () => import('./scenes/lighthouse.js'),
  jet: () => import('./scenes/jet.js'),
  station: () => import('./scenes/station.js'),
  submarine: () => import('./scenes/submarine.js'),
  factory: () => import('./scenes/factory.js'),
  opera: () => import('./scenes/opera.js'),
};

const only = new URLSearchParams(location.search).get('only');
const wanted = only && SCENES[only] ? [only] : Object.keys(SCENES);
const results = await Promise.allSettled(wanted.map((id) => SCENES[id]()));
results.forEach((r, i) => { if (r.status === 'rejected') console.warn('Scene ' + wanted[i] + ' failed to load:', r.reason); });
await import('./app/ui.js');
