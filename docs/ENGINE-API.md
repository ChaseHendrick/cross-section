# Engine API

The engine turns a scene description into a living, hand-drawn 3D cutaway. A scene is one ES module that registers itself; the stage builds its geometry, runs its people and machines, and renders it through the ink pass.

```js
import { XS, THREE, mat, props, shade, mix, rng, makeSea, glowMaterial } from '../engine/index.js';

XS.scenes.register({
  id: 'liner', order: 10, title: 'The Atlantic Liner', subtitle: 'A transatlantic express, 1936',
  blurb: 'One line for the contents page.',
  bounds: { x0: -10, x1: 320, y0: -15, y1: 70, z0: 0, z1: 40 },
  build(kit, stage) { /* static geometry, lamps, captions */ },
  setup(world, stage, kit) { /* nav graph, people, actors, machines, emitters, tour */ },
  update(world, dt, t, stage) { /* per-frame scene logic (optional) */ },
});
```

## Coordinates

| Axis | Meaning |
|---|---|
| x | Metres along the subject, left to right as first seen |
| y | Metres up |
| z | **Depth behind the cut plane**. `z = 0` is the cut; larger z is further from the viewer |

The near half of everything (`z < 0`) is taken away, as in a cutaway drawing. Build the far half of the subject, from `z = 0` back, and put interiors right against the cut so they are visible. A ship 36 m wide is built from `z = 0` (its centreline) to `z = 18`. Anything flagged `whole: true` ignores the cutaway (masts, a rotating lens, people never need it).

Inside three.js the scene root is mirrored in z, so the numbers you type are the numbers you see in `object.position` of anything you animate.

## Scene definition

| Field | Type | Purpose |
|---|---|---|
| `id`, `title`, `subtitle`, `blurb`, `order` | strings / number | Identity and contents-page text |
| `bounds` | `{x0,x1,y0,y1,z0,z1}` | Extent of the subject and its surroundings (metres). Used for the camera, light volume and sea mask |
| `frame` | same shape | Optional tighter box the "Whole" view frames |
| `view` | `{yaw, pitch}` | Default camera angle in radians (book view is about `{yaw: -0.42, pitch: 0.28}`) |
| `startHour` | number | Clock at load (0 to 24) |
| `daySeconds` | number | Real seconds per 24 h at clock speed 1 (default 720) |
| `wind` | number | Drift of smoke and clouds, m/s |
| `clouds` | 0..1 | Cloud cover in the sky |
| `fog` | `[near, far, amount]` | Distance haze in metres |
| `ambient` | `{sky, ground}` | Tint of ambient light |
| `skyTop`, `skyBot` | colours | Override the sky gradient |
| `suggestedCuts` | number[] | x positions offered by "Suggested cuts" |
| `snapCut(x)` | function | Snap a viewer's cut to a sensible frame (a bulkhead, a pier) |
| `cutRange` | `[x0, x1]` | Where cuts may be placed |
| `sliceGap` | metres | Gap between opened slices (default 5% of the length) |
| `slice` | boolean | `false` hides the slice tool (for a tower, say) |
| `focusDepth` | metres | Depth of the plane zoom aims at (default 3) |
| `minDist`, `maxDist` | metres | Camera distance limits |
| `lampGain` | number | Scales all baked lamp light |
| `halos(list, world, stage)` | function | Add extra glow sprites each frame `{x,y,z,r,color,a}` |

## Materials

`mat(spec)` interns a material spec. A bare colour string is shorthand for `{ c }`.

| Key | Meaning |
|---|---|
| `c` | Base colour `'#rrggbb'` |
| `c2` | Second colour: pattern colour, or the glow colour for `glow` |
| `cut` | Colour of this material where the cut passes through it (the poché). Default: `c` darkened |
| `pat` | Surface pattern, drawn in the shader so it stays sharp at any zoom (below) |
| `s` | Pattern scale in metres (plank width, course height, tile size...) |
| `cutPat: true` | Show the pattern on the cut face too (stone courses, planks, plating) instead of hatching |
| `plainCut: true` | Flat cut face with no hatching |
| `whole: true` | Ignore the cutaway |
| `thin: true` | Two-sided sheet lit on both sides (sails, flags, awnings) |
| `glow: 'night' \| 'always'` | Emissive in `c2` at night (windows, portholes) or always (furnace mouths) |
| `noEdge: true` | No ink outline (soft things) |

Patterns: `planks`, `deck` (planks with caulking and trenails), `brick`, `ashlar`, `stone`, `plates` (riveted), `rivets`, `tiles`, `checker`, `carpet`, `stripes`, `panels`, `grate`, `slates`, `thatch`, `canvas`, `grain`, `speckle`, `corrugated`, `panes`, `rock`, `bars`, `quilt`, `books`, `rings`.

Patterns are laid on the face's dominant plane: floors use (x, z), walls facing the viewer use (x, y), side walls use (z, y).

## Kit (static geometry)

All positions are scene coordinates. Every solid is closed, so a cut shows its inside as a hatched cut face. Build walls and floors with thickness for the same reason.

| Call | Draws |
|---|---|
| `kit.box(x0,y0,z0,x1,y1,z1, m, opt)` | Axis-aligned box. `opt.top/front/...: material or false`, `shadeBot`, `shadeTop` |
| `kit.boxAt(cx, y, z, w, h, d, m)` | Box by centre-x, floor-y, front-z |
| `kit.boxR(cx,cy,cz, w,h,d, m, {x,y,z})` | Rotated box about its centre |
| `kit.beam(a, b, t, m)` | Square-section beam between two points |
| `kit.quad(a,b,c,d, m)`, `kit.tri(a,b,c, m)`, `kit.poly(pts, m)` | Raw faces (counter-clockwise seen from the front) |
| `kit.extrude(profileXY, z0, z1, m, {holes, front, back, side, reveal})` | Profile in x-y extruded in depth (hull sides, walls with windows, arches) |
| `kit.extrudeX(profileZY, x0, x1, m)` | Profile in depth-height extruded along x (a hull section, a carriage roof) |
| `kit.loft(sections, m, {matFn})` | Solid through cross-sections `[{x, pts: [[z, y], ...]}]` (hulls, fuselages) |
| `kit.lathe(pts[[r,y]], cx, cz, m, {seg, a0, a1, matFn, capTop, capBot})` | Surface of revolution about a vertical axis (towers, funnels, domes, bells) |
| `kit.cyl(x,y,z, r, len, m, {axis: 'y'|'x'|'z', r2, seg})` | Cylinder or cone |
| `kit.sphere(x,y,z, r, m, {seg, rings})` | Sphere |
| `kit.tube(path, r, m)` / `kit.rope(a, b, r, m, sag)` | Pipes, rails, rigging |
| `kit.boulder(x,y,z, rx,ry,rz, m, seed)` | A lumpy rock |
| `kit.geo(threeGeometry, matrix4, m)` | Import any three.js geometry |
| `kit.room(x0,x1,y0,y1,z0,z1, {floor, wall, side, left, right, ceiling, t, ft})` | Floor slab, back wall and side walls of an interior |
| `kit.glass(pts, {c, alpha})`, `kit.sheet(x0,x1,y0,y1,z, spec)` | Translucent panes and water cut faces (overlay pass) |
| `kit.lamp(x,y,z, {color, r, i, always, halo, flicker, bulb})` | A light baked into the night light volume, with a bulb and halo |
| `kit.label({x,y,z, title, text, body, source, min, max, priority, side})` | A caption (see Captions) |
| `kit.part(px,py,pz, k => {...})` | Geometry for something that moves; returns a `THREE.Group` to animate |
| `kit.object(obj, {overlay})` | Add any object in scene coordinates (the sea, a beam of light) |
| `kit.rng(salt)` | Deterministic random numbers. Never use `Math.random` in a scene |

Parts must not contain glass; put moving glass in a separate `kit.object(..., {overlay: true})`.

## Props

`props.<name>(kit, x, y, z, opt)`, with (x, y, z) the centre of the front edge on the floor.

`table` (`w, d, h, top, cloth, items: 'setting'|'plate'|'cup'|'bottle'|'candle'|'books'|'bread'|false`), `chair` (`face, color, tall, cushion`; returns `{seat}`), `armchair`, `bench`, `bed` (returns `{feet, heading}` for a sleeper), `bunk` (`levels, gap`; returns a list of sleeper anchors), `hammock` (returns a sleeper anchor), `shelves` (`items: 'books'|'jars'|'bottles'|'plates'|'mixed'`), `stove`, `fireplace`, `barrel`, `cask`, `crate`, `sack`, `lamp` (hanging from a ceiling; returns its light), `desk`, `chest`, `wardrobe`, `clock`, `piano`, `plant`, `bath`, `sink`, `rug`, `picture`, `window` (glows at night), `porthole`, `door`, `stairs(kit, x0,y0,x1,y1,z0,z1)`, `ladder(kit, x, y0, y1, z)`, `rail(kit, x0, x1, y, z)`, `coil`, `anvil`, `cauldron`, `lifebuoy`.

## The world

`setup(world, stage, kit)` populates `world`.

### Navigation

```js
const nav = world.nav;
nav.node('galley', x, y, z);            // returns the id
nav.link(a, b, 'walk'|'stairs'|'ladder'|'rope'|'lift'|'swim'|'door');
nav.chain([a, b, c], 'stairs');
const ids = nav.walkway('deckA', x0, x1, y, z, step); // a run of linked nodes
world.station('helm', x, y, z, face);   // a named spot
```

### People

```js
world.addPerson({
  name: 'Bridget Keane', role: 'third-class stewardess', bio: 'Writes to her sister in Cork.',
  costume: { top: '#1f2a44', bottom: '#1f2a44', dress: 'long', dressColor: '#2a2a3a', apron: '#ffffff', hat: 'cap', hatColor: '#ffffff' },
  routine: [
    { at: 'galley', act: 'carryHigh', prop: 'tray', face: 'out', dur: [20, 40], label: 'Carrying breakfast trays', when: [6.5, 9] },
    { at: [x, y, z], act: 'sitEat', face: 1, dur: 30, label: 'Her own breakfast' },
  ],
});
world.crowd(positions, { act: ['sitEat', 'sitTalk'], costume: (i, r) => ({...}), face: 'out' });
```

- `at`: a nav node id, a station name, or `[x, y, z]`. People walk the nav graph to the node nearest the target, then straight to it.
- `act`: an animation (below). `prop`: something held. `face`: `1` (towards +x), `-1`, `'out'` (towards the viewer), `'in'`, or radians. `dur`: seconds or `[min, max]`. `when`: `[fromHour, toHour]`, may wrap midnight. `label`: shown when the viewer follows them. `onArrive(person, world)`: optional hook.
- A person with no routine stands at `at` doing `act` forever (good for crowds).
- Sleepers: their feet are at the point given; the body lies towards the opposite of their heading. Bunk and bed props return anchors.

Costume keys: `skin, hair, hairStyle ('short'|'long'|'bun'|'bald'|'queue'), top, bottom, shoes, coat ('jacket'|'long'|'tail'), coatColor, dress ('long'|'knee'), dressColor, stockings, apron, sleeves ('short'), beard, build (0.8..1.3), child, hat, hatColor`.

Hats: `cap, flat, peaked, bowler, top, tricorne, bicorne, helmet, kettle, miner, chef, kerchief, coif, wimple, hood, veil, bonnet, straw, boater, cloche, beret, tam, crown, mitre`.

Animations: `stand, talk, walk, run, carry, carryHigh, carryShoulder, climb, sit, sitEat, sitTalk, sitDrink, sitRead, sitWrite, sitWork, sitRow, sleepSit, lie, kneel, pray, scrub, shovel, pick, kneelPick, hammer, chisel, saw, stir, sweep, haul, push, crank, wheel, lookout, wave, point, dance, violin, drink, read, workBench, tread, swim, bellows, pour, salute, handsBehind`. Register more with `anims.register(name, (p, t, P) => {...})`.

Props held: `shovel, pick, hammer, mallet, broom, spoon, saw, rope, tray, box, suitcase, sack, plank, bucket, lantern, lamp, book, paper, glass, mug, jug, telescope, violin, basket, cane, pipe, flag, cards, trowel, clipboard`.

### Actors and machines

```js
const prop = kit.part(x, y, z, (q) => { q.cyl(0, 0, 0, 0.1, 2, mat('#8a8a8a'), { axis: 'x' }); });
world.addMachine((dt, t, w) => { prop.rotation.x = t * 4; });           // spin a propeller
world.addActor({ object: someGroup, update(dt, t, w) { someGroup.position.x = ...; } });
```

### Particles

```js
world.emitter({ kind: 'smoke', x, y, z, rate: 6, w: 2, d: 2, vx: 0.5, size: [1, 7], color: '#5a5450', when: 'always' });
world.particles.emit({ kind: 'spark', x, y, z }, world);
```

Kinds: `smoke, soot, steam, spark, ember, fire, splash, spray, dust, bubble, leaf, snow, mote`. `when`: `'night'`, `'day'`, `[h0, h1]` or a function of the world.

### Captions

`kit.label({ x, y, z, title, text, body, source, min, max, priority, side })` or `world.label(...)`. `min`/`max` limit the zoom (CSS pixels per metre) at which it shows; at overview, captions stand in the margins with elbow leader lines. `body` and `source` make the caption clickable for a fact card. Only verified facts go in `body`, with a source URL you actually opened.

### Guided tour

`world.stop({ x, y, z, w, yaw, pitch, title, text, hold, hour })`: the camera flies to show `w` metres across, holds for `hold` seconds; `hour` sets the clock.

## Sea, sky and light

- `makeSea({ level, x0, x1, mask(x, z), maskBox: [x0, z0, x1, z1], deep, shallow, amp })` returns a mesh for `kit.object()`. `mask` returns true where there should be no water (inside a hull).
- `kit.sheet(x0, x1, y0, y1, 0.01, { c, alpha })` draws the cut face of a body of water.
- The sun follows the clock. Lamps (`kit.lamp`, `props.lamp`) pool warm light at night; `always: true` lamps (fires, furnaces) light in the day too. Windows with `glow: 'night'` light up after dusk.
- `glowMaterial(color)`: additive material for beams and shafts of light (uv.y runs from the source to the far end); use with `kit.object(mesh, { overlay: true })` and set `material.uniforms.uIntensity.value`.

## Slicing

The viewer places cuts anywhere along x; zero cuts is the default. Cuts are clipping ranges, so nothing is rebuilt: every closed solid crossing a cut shows a hatched cut face. Make sure the hull or outer shell is a closed solid with thickness, give important materials a characterful `cut` colour (black plating, red antifouling, honey timber), and offer `suggestedCuts` at structural frames.

## Budgets

| Resource | Comfortable | Hard limit |
|---|---|---|
| Triangles (`stage.stats.tris`) | 150k to 400k | 900k |
| People | 120 to 300 | 450 |
| Lamps | 50 to 300 | 600 |
| Animated parts | 20 to 80 | 200 |
| Particle emitters | 5 to 20 | 40 |
