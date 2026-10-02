# Engine requests from the liner scene

Worked around inside `src/scenes/liner/`; none of these block the scene.

1. **Lamp volume resolution for long subjects.** The baked lamp grid is sized from `bounds`, so a 310 m ship gets cells about 1.3 m long in x. Cabin lamps 3 m apart blur together and the night overview reads dim. A scene option for the cell size (or a second, finer volume around the camera) would help long subjects. Workaround: `lampGain: 3.2` and back walls with `glow: 'night'` (a warm `c2`) so interiors read as lit through the cut.
2. **Patterns that turn with parts.** Patterns are computed from world position, so a striped material on a rotating shaft or gear does not appear to turn. Workaround: shafts and couplings are built from alternating-colour strips (`stripedShaft` in `machinery.js`). A `local: true` material flag (pattern in part-local coordinates) would make this trivial.
3. **Seated people need the seat height in metres** (now supported via `seat`). Swimmers: the `swim` pose lies along the heading at standing height; a `y` offset in the pose (or a `float` anim) would let people float at a water surface without hand-tuning.
4. **Water body under the sea surface.** The sea surface is drawn only behind the cut, and below the waterline the cut face needs an opaque body that avoids the hull. Workaround: opaque quads following the hull profile (`buildWater` in `hull.js`). A `makeSea({ profile(y) -> [x0, x1] })` option that draws the cut face around a hull would be reusable for every ship.
5. **Ship motion.** A way to roll and pitch the subject (the scene root) independently of the sea would let the liner roll gently (2 to 6 degrees, 10 to 15 s, dossier section 7). Not attempted: rolling `stage.root` would roll the sea too.
6. **Shot tool timeout.** `page.screenshot` uses Playwright's default 30 s timeout; dense zoomed views under load exceed it. A `--timeout` option would help. Workaround: a private copy of the tool with a longer timeout.
