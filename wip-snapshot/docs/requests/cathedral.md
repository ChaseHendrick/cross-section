# Engine requests from the cathedral scene

Worked around inside `src/scenes/cathedral/`; none of these block the scene.

1. **Lamps with hours.** Baked lamps are either night-only or always on. The quire candles should burn only during the night office and the services, the plumbers' and bell-founder's fires should die at dusk, and the smith's hearth should be banked overnight. A `when` on `kit.lamp` (hours or a function), even if it only scaled the lamp's contribution in the shader by a few groups, would let a scene light rooms by routine.

2. **An explicit "go off stage" step for people.** People who live in town walk to the edge of the site (the Chilmark road, the north porch) and then jump home, because the walk to the east end is longer than the clock allows. The scene relies on the world's rule that a person with no graph route to a far target jumps there. A routine flag such as `{ hide: true }` (and a matching `{ appear: [x, y, z] }`) would make this intentional and keep hidden people out of the people list while they are away.

3. **Routine steps that change with a machine.** The wheel men should tread only while the great wheel turns. The scene rewrites `step.act` from a machine each frame. A per-person hook that runs after the routine has set `anim` (or an `act` that may be a function of the world) would be cleaner.

4. **Opening hour placement.** On load, people start at the first step of their routine and walk from there, so at 10:00 everyone is first seen on the road. The scene places each person at the step their routine would be in at the opening hour. The world could do this itself.

5. **Cost of open slices.** Each slice re-renders the whole scene. With a large heightfield ground (the landscape runs to the horizon so the river's water plane stays hidden) and seven slices, SwiftShader frames take long enough that `tools/shot.cjs` hits its 30 s screenshot timeout on a loaded machine. A per-slice bounding test (skip meshes whose chunk lies outside the slice's x range plus the ground) would help, as would a longer, configurable screenshot timeout in the shot tool.

6. **A masked sea that is not infinite.** `makeSea` always extends 2.5 km in every direction, so an inland scene must cover the whole plane with ground and mask the water out over the site. An option to draw water only inside a mask (or only inside a polygon) would make rivers and ponds simple.
