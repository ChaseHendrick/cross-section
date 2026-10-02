# Engine requests from the station scene

The station scene works around each of these inside `src/scenes/station.js`; none is blocking.

1. **A scene hook for the light cycle.** The station's outside light follows its orbit (sunrise every
   ~91.5 minutes of the GMT clock), not a 24-hour day. The scene replaces `world.sun` on its own World
   instance in `setup()` (`W.sun = () => orbitalSun(W.hour)`). A documented `scene.sun(hour)` option would
   make this official, and could let a scene choose the sun's direction instead of borrowing a fake hour.
2. **Opting out of weather.** There is no rain in orbit. The scene's `update()` resets
   `stage.weather` to `'clear'` every frame. A scene flag such as `weather: false` (hiding the button)
   would be cleaner.
3. **Always-on lamps without the fire tint.** Interiors aboard are lit by cool fluorescent light day and
   night, but `always: true` lamps are tinted warm orange (`vec3(1.0, 0.72, 0.42)`) in the shader, so the
   scene uses night-only lamps. An `always` lamp that keeps its own colour would help any modern interior.
4. **Per-step costume changes.** Spacewalkers put on suits for part of the day. The scene swaps `p.cos`
   from a person's `update` hook. A `costume` field on routine steps would make this declarative.
5. **Hatches between views.** People cross between the two halves of the drawing through linked hatches.
   The scene teleports them in an `update` hook when the next path node is a "portal" more than 6 m away.
   A `'portal'` link kind in `nav.link` that jumps instead of walking would avoid touching Person internals.
6. **Starting people mid-activity.** On load, people walk from their first routine stop to the one their
   hour calls for. The scene sets `step`, `moving`, `anim` and position directly in `setup()` so everyone
   starts in place. A `world.settle()` call (or doing this by default) would help every scene.
7. **Figure roll.** `P.rot` turns a figure about its lateral axis only, so a sleeper cannot lie on their
   side while facing the viewer. A `P.roll` would allow it.
8. **Screenshot tool under load.** On a busy machine (load average above 20) close views whose pixels are
   mostly geometry (the Earth fills half this scene) can exceed the tool's fixed 30 s screenshot timeout.
   A `--timeout` option would help; smaller `--size` values work around it.
9. **A backdrop layer that slicing leaves alone.** The Earth under the station is a backdrop, not part of
   the cutaway, but everything in the stage root is clipped and shifted per slice, so opening slices split
   the planet into strips. The scene builds the Earth with its own `Kit` and adds its meshes to
   `stage.sky.scene` (mirrored in z), removing them on the next `scene` event. A `kit.backdrop(object)` (drawn
   once, unclipped, after the sky) would make this official; note its triangles are then not counted in
   `stage.stats.tris`.
