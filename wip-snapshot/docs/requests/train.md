# Engine requests from the train scene

Workarounds are in `src/scenes/train.js` and `src/scenes/train/`; nothing in the engine was changed.

## 1. A per-scene sun (latitude and season)

The engine's sun sets at about 7 pm whatever the scene. The Coronation crosses Berwick at 9.05 pm on 29 July 1937, with the sun about 1 degree up and setting at about 9.20 pm summer time (dossier, section 7). The scene overrides `world.sun` in `setup` with a piecewise-linear warp of the clock (sunrise about 4.50, solar noon about 1.10 pm, sunset about 9.20 pm) before calling the engine's `sun()`. A scene option such as `sun: { rise: 4.8, noon: 13.1, set: 21.35 }` (or a latitude and date) would make this unnecessary and keep the clock, sky, lamps and `when: 'night'` consistent everywhere.

## 2. Scene particle kinds

The exhaust of a train at 60 mph has to keep the train's speed, so its smoke must have almost no drag. The scene adds a kind by writing to `XS.particleKinds.plume` at module load. A documented `world.particleKind(name, spec)` (or a `drag` option on emitters) would make this official.

## 3. Lamps at dusk

Interior lamps only light when `uNight` rises, which with the engine's sun happens well after the sun is down. Railway carriages had their lights on through a summer dusk. A per-lamp `from` hour, or a scene `lampsOn` threshold, would let the hero frame (sun on the horizon) show lit carriages.

## 4. Software rendering cost (screenshot tool)

On SwiftShader the cost of a frame is dominated by fragment shading of every layer (the ink shader uses `discard`, so there is no early depth rejection) and by one full scene pass per open slice. Close views under the smoke plume, or five open slices, can exceed the 30 s screenshot timeout at 1000 px wide. The scene keeps its draw calls down (`chunk: 400`, static coach wheels) and its plume small. Two engine-side ideas: draw the opaque scene once with a depth pre-pass before the shaded pass, and let `tools/shot.cjs` take a `--timeout`.

## 5. Coach wheels

The far-side coach wheels are drawn static (plain disc wheels look the same turning or not) to save about 30 draw calls. An instanced "wheel set" helper (one draw call, a rotation per instance) would let every wheel on a long train turn.
