# Engine requests from the warship scene

Things the warship scene (`src/scenes/warship.js`) needed and worked around inside the scene.

1. **Non-pickable background figures.** The dossier allows real people (Nelson, Captain Hardy) only as non-clickable background figures. `stage.pick()` picks every person that is not `hidden`, so there is no way to draw a figure that cannot be followed. Request: a `pickable: false` flag on `addPerson` that `pick()` and the People list skip. Workaround: Nelson and Hardy are simply not drawn.

2. **Lamp volume over a sub-box.** `bakeLamps` covers the whole `bounds`, which for a ship must include the rig (y up to 72 m). That makes the vertical cell about 0.7 m, so lantern light bleeds between gun decks only 2.1 m apart. Request: an optional `lightBounds` box on the scene used only for the lamp volume (here x -6..60, y -1..22). Workaround: lanterns hung low under the beams, `lampGain` tuned.

3. **Nested parts made in `build`.** `stage.load` re-adds every part in `kit.parts` to the root after `build`, which re-parents a part that was added as a child of another part (a pennant built from linked segments, capstan bars on a drumhead). Request: skip parts that already have a parent, as `load` already does for parts made in `setup`. Workaround: those parts are made in `setup`.

4. **Rolling the whole subject.** The dossier lists a slow roll (8 to 12 s period, 2 to 5 degrees) for the hull. A scene-level `sway: { roll, pitch, period }` applied to the root (and to people and particles) would let ships and airships move as one. Not attempted in the scene, since static geometry, figures and sprites live in different groups.

5. **People on moving machinery.** Capstan crews walk round with the drumhead. The scene drives them with the `update` hook (setting `x`, `z`, `heading`, `hidden`), which works but is undocumented. Request: document `update(p, dt, t)` on `addPerson` and that `hidden` may be toggled per frame.

6. **Shot tool timeouts.** Under SwiftShader on a loaded machine a close view of a dense interior can take more than 30 s per frame, so `page.screenshot` times out and the whole `--spec` run stops. Request: catch the timeout per shot (report it and continue) and accept a `--timeout` option.
