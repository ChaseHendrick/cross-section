# Engine requests from the factory scene

Worked around inside `src/scenes/factory/`; none of these block the scene.

## 1. People who leave and come back (shift changes)

A factory empties at 3 p.m. and fills again at 3:30. There is no documented way for a person to leave the drawing, so the scene gives each extra an "off" routine step at a gate and sets `person.hidden` from a `def.update` hook while that step is current (`hideOff` in `factory/people.js`). It works because `hidden` is honoured by the stage, but it is not in ENGINE-API.md. Request: document `hidden`, or add `{ off: true }` routine steps that the world hides on arrival and shows on departure.

## 2. Starting people in the right place for the hour

When a subject loads at 22:00, every day-shift worker would otherwise walk from their first routine spot to the gate. The scene "settles" each person into the step that fits the current hour (`settle()` in `factory/people.js`) by writing `step`, `stepDur`, `x/y/z` and `moving` directly. Request: a `world.settle(person)` (or an option on `addPerson`) that does this.

## 3. A conveyor primitive

Long conveyors (chassis lines, paint lines, magneto line, wheel chutes) are drawn as one animated part per line, shifted by `distance mod pitch`, with items whose state depends on their station (`conveyor()` in `factory/machines.js`). It keeps the part count near 125 instead of several hundred. Request: a documented `kit.conveyor({ base, dir, n, pitch, item })` with this behaviour, or instanced parts.

## 4. Riders

Crane drivers, the monorail driver, an upholsterer riding inside a moving body and the chassis driver are people whose position is set every frame from a moving part (`scripted()` in `factory/people.js`, via `person.onUpdate`). Request: `person.ride(object, offset)` so a figure can be carried by a part.
