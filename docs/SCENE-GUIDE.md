# Making a scene

A scene should make someone lean in. The tradition this project follows is the great cutaway picture book: a subject sliced open, every room inhabited, every machine shown working, and a hundred small stories for the patient reader. In this version the drawing is alive: people keep their routines through a day and a night, machines turn, smoke drifts, the light changes.

Read [ENGINE-API.md](ENGINE-API.md) for the calls. This guide is about the result and the way to get there.

## What good looks like

- **Readable at three distances.** From the whole-subject view, the silhouette is iconic and the interior reads as a busy honeycomb of lit rooms. At room distance (8 to 20 m across) each space is clearly one thing (a galley, a gun deck) with its furniture and people. Up close (2 to 4 m across) there is something to discover: a cat, a game of cards, a letter being written, a rat in the hold.
- **Dense, not cluttered.** Fill rooms the way people fill them: tables laid, shelves stocked, coats on hooks, coal in heaps. Leave circulation space where people walk.
- **Inhabited.** Every compartment has people doing what the research says they did there, at the right hour. Crowds where crowds were (saloons, gun decks, naves), a lone figure where work was lonely (a lookout, a stoker on the night watch).
- **Working.** Everything that moved moves: propellers, pistons, cranes, hoists, wheels, flames, smoke, steam, water. Get speeds plausible.
- **Lit at night.** Lamps in every room (`props.lamp`, `kit.lamp`), glowing windows and portholes, fires that are always on. The night view should be the most beautiful view.
- **True.** Proportions, colours, layout, crowd sizes and captions come from the research dossier in `docs/research/<id>.md`. Do not invent a fact for a caption. When the drawing simplifies, the caption must not claim more than the drawing shows.
- **Sliceable.** The outer shell is a closed solid with thickness and a good `cut` colour. Offer three to six `suggestedCuts` at bulkheads, piers or frames, and a `snapCut` that snaps to them when close.

## Colour and line

The ink pass outlines silhouettes, creases and material changes, and grains every wash. Help it:

- Use clear, slightly warm watercolour colours, not black or pure white. Hull black is `#22201e`, white paint is `#f2ece0`, raw timber `#b08a5a`, oiled timber `#7a5232`, red lead `#b84a32`, brass `#c8a050`, steel grey `#7a8088`.
- Give adjacent parts different materials (or a slightly different shade) so a line is drawn between them.
- Use patterns (`planks`, `deck`, `plates`, `ashlar`, `brick`, `carpet`...) for surfaces; they add detail without triangles.
- Give the cut faces character: black-and-red for a steel hull, honey timber for wooden decks, grey stone with `cutPat` for masonry.

## People

- Build a casting list from the dossier: named individuals with roles, bios and routines (they power "click someone to follow them"), plus crowds of extras.
- Costumes from the period: colours, hats, aprons, uniforms. Mix skin tones and hair as the place and period make plausible.
- Routines use the hour (`when`). A ship's crew keeps watches; a castle wakes at dawn; a train's dining car serves at set sittings.
- Put sleepers in bunks and beds at night (use the anchors that the bunk and bed props return).
- Use `face: 'out'` for people at tables and work so their faces are seen.

## Process

1. Read the dossier fully. Note the zone table, dimensions, people, machinery and captions.
2. Write a layout plan at the top of your scene file in a comment: x ranges of zones, deck heights, depth used, cuts.
3. Build the shell and decks first. Look at it (`node tools/shot.cjs <id> --zoom x,y,w`). Then rooms, then furniture, then people, then machines, then lights, then captions and tour.
4. Look at it after every step at three distances and two hours (day and night). Fix what looks wrong before adding more.
5. Check `stage.stats` (printed by the shot tool): triangles and people within budget, no console errors.
6. Write a guided tour of 6 to 10 stops that tells the subject's story.

```sh
npm install                       # once: three, cannon-es, esbuild, playwright-core
node tools/shot.cjs liner --hour 11 --out /tmp/a.png
node tools/shot.cjs liner --hour 22 --zoom 160,12,30,2 --labels off --out /tmp/b.png
node tools/shot.cjs liner --cuts 60,120,180 --open --out /tmp/c.png
```

Look at every screenshot you take. Judge it as an art director would: is it beautiful, is it legible, is anything floating, intersecting, missing, too dark, too empty?

## Rules

- One scene, one module: `src/scenes/<id>.js` (it may import helpers from `src/scenes/<id>/`). Do not edit the engine; if you need something from it, work around it in your scene and write the request in `docs/requests/<id>.md`.
- No `Math.random`: use `kit.rng(salt)` or `world.R`.
- No network assets. Everything is procedural.
- Fictional people only for named characters; never put words or actions in the mouths of real named individuals.
- Captions: short (one to three sentences), concrete, verified. Put the source URL in `source` for any caption with a `body`.
