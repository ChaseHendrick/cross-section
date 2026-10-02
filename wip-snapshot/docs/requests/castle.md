# Engine requests from the castle scene

Worked around inside `src/scenes/castle/`; none of these block the scene.

1. **A second, scene-defined cut plane.** The dossier's back layer (north towers, timber lean-tos) needs its courtyard-facing walls removed. The castle builds the north towers as half-lathes (angle 0 to PI) whose radial end walls stand in for cut faces, and the lean-tos without front walls. True hatched cut faces on a second plane (for example `scene.backCut: { z: 30, x0, x1 }`) would make the back layer read exactly like the front.
2. **Tour stops that set cuts.** `world.stop({ cuts: [60.4], open: true })` would let the tour show the 28 m well shaft, which is only visible in a slice.
3. **Moving water levels.** The estuary has a tide. The scene moves the `makeSea` mesh and builds its own overlay group (a `Kit` sheet scaled in y) for the water's cut face. A `level` uniform or setter on the sea, with the cut sheet tied to it, would make this one line.
4. **A lookout pose without a telescope.** `lookout` forces a telescope prop, which is wrong before about 1600. A `lookoutBare` (or `prop: null` honoured) would help every pre-modern scene.
5. **More held props for the Middle Ages.** A crossbow, a spear or staff, a peel, a scythe. The castle fakes a crossbow as a part that follows one person.
6. **Shot tool timeout.** Under heavy machine load (many agents rendering in parallel with SwiftShader) `page.screenshot` regularly exceeds its 30 s default on this scene. A `--timeout` option would avoid false failures.
7. **Cut faces at night.** Cut faces darken only slightly at night (by design, so the section stays readable). A per-scene `cutNight` factor would let large ground sections recede after dark.
