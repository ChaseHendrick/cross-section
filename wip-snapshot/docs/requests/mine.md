# Engine requests from the mine scene

Workarounds for each of these live in `src/scenes/mine.js` and `src/scenes/mine/`.

1. **Places the sun does not reach.** Everything is lit by the sun and sky, so a tunnel 89 m
   underground is as bright at noon as the yard. A material flag (say `dark: true`) or a scene
   list of boxes where sun and sky light are replaced by a dim ambient would let workings,
   cellars, holds and crypts read as dark by day while their lamps still glow. The mine draws a
   translucent veil over its voids (a custom overlay ShaderMaterial that samples `uLamp` to lift
   the veil near lamps).

2. **Cut faces at night.** The poché keeps about 70 per cent of its daytime brightness at night.
   For a scene that is mostly section (a mine, a dam, a cliff) the night view becomes a large pale
   block. A scene option to dim cut faces at night (scaled by `uNight`) would make lamp light read.
   The mine draws a second veil over the whole cut face at night.

3. **Riding a lift.** People on a `lift` link travel at a fixed speed, independently of any
   animated cage or lift car. An API to attach a person to a moving object for the length of a link
   (or to wait for it) would let them ride the cage. The mine hides people while they are on a
   lift link and boosts their speed, and shows a separate load of riders fixed to each cage at the
   shift changes.

4. **Walk animation by place.** `walkAnim` belongs to a routine step, but a stoop or crawl is a
   property of the place (a 1.25 m coal seam). A per-node or per-link animation override would
   help. The mine sets `step.walkAnim` each frame from the person's position in an update hook.

5. **Animals.** There is no quadruped figure. The mine builds horses, sheep, a dog, a cat and rats
   from kit parts; horses at work have four swinging legs and a nodding head (six parts each),
   horses at rest have their legs merged into the body. An instanced animal figure (horse, dog,
   sheep, cat, rat, bird) would save parts and draw calls.

6. **Seamless solids from many pieces.** Adjacent closed solids of the same material show a hairline
   at their join on a cut face (a 1 cm gap is needed to avoid z-fighting between their faces). The
   mine merges its rock pieces into polygons with holes before extruding (`mergeRegions` in
   `src/scenes/mine/geology.js`). A kit helper for "polygon minus polygons, extruded" would be
   useful to other scenes with ground, walls and openings.

7. **Hidden faces of deep solids.** A deep extrusion seen through the cut shows its interior faces
   as poché at their real depth, so thick solids look like stacked shelves rather than a flat
   section. The mine draws a thin skin at the cut and a deep body without its hidden faces. A note
   in ENGINE-API.md (keep cut solids shallow) or an `extrude` option to skip sides by edge would help.

8. **Walking pace and the clock.** At the default `daySeconds` of 720 a man takes most of a working
   day to walk 300 m from the lamp room to the face. The mine uses `daySeconds: 1800`. A scene-level
   walking time scale would let large scenes keep a brisker clock.

9. **Shot tool timeout.** On a shared machine a frame of this scene can take several seconds in
   SwiftShader, and `page.screenshot` in `tools/shot.cjs` times out at 30 s. A `--timeout` option
   would help.
