# Engine requests from the Opera scene

Worked around inside `src/scenes/opera/`; none of these block the scene.

## 1. Dimmable lamps (house lights "down to blue")

Gas cannot black out a theatre: during the acts the house lights are turned down "to blue", and they come up again in the intervals. Lamp light is baked once into the light volume, so a scene cannot dim a group of lamps through the evening. The scene changes the `i` of the lamp objects that `kit.lamp` returns, which only affects their halos, and adds its own halos for the chandelier in `halos()`.

Request: lamp groups with a per-frame gain, for example `kit.lamp(..., { group: 'house' })` and `stage.lampGroup('house', 0.4)`, implemented as a few extra channels in the light volume.

## 2. Hiding people by the hour

An opera house is empty by day and full at night, and the stage is filled by different crowds act by act. The scene keeps ~250 extras and sets `person.hidden` in `update()` from a visibility function of the hour. `hidden` is not in ENGINE-API.md. Request: document `person.hidden`, or accept `visible: (hour, world) => bool` in `addPerson` and `crowd`.

## 3. Routines after a clock jump

When the clock jumps (tour stops with `hour`, the shot tool's `--hour`, the time slider), people walk from wherever they were to their new step, which can take a whole act. The scene "warps" everyone to the place of their current step when it sees the hour jump by more than 0.3 h. Request: an engine option (`world.settle()` called by the stage after a jump) that does the same for every scene.

## 4. Riding a moving part

Mephistopheles rises through a trap. The scene moves the trap platform to follow the person (a `lift` nav link), which works, but a general "this person stands on that part" (`person.ride = group`) would serve lifts, boats and carts too.
