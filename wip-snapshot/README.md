# Cross-Sections

**Living, hand-drawn 3D cutaways of great buildings and machines.**

A liner at sea, a castle, a man-of-war, a steam express, a coal mine, a cathedral rising, a rock lighthouse, a jumbo jet, a space station, a submarine, a car factory and an opera house, each sliced open with everyone inside going about their day.

**[Open Cross-Sections](https://www.hendrickresearch.com/play/cross-sections/)** · **[Download the portable file](dist/cross-sections.html)** · **[How to explore](#how-to-explore)** · **[Add a scene](docs/SCENE-GUIDE.md)**

Open the portable file in any current desktop or mobile browser. It is one self-contained HTML file: no install, no account, no network. Rendering needs WebGL 2.

<!-- Gallery: add each subject's frame here once tools/thumbs.cjs has rendered gallery/<id>.jpg. -->
<p align="center">
  <img src="gallery/lighthouse.jpg" width="48%" alt="The Rock Lighthouse at dusk" />
</p>
<p align="center"><sub>A frame from the live scene. Every image is the running simulation, drawn by the ink pass.</sub></p>

Inspired by the cross-section picture books of the 1990s, above all *Stephen Biesty's Incredible Cross-Sections* (illustrated by Stephen Biesty, text by Richard Platt, Dorling Kindersley, 1992). This is an independent, original work. It contains no illustrations or text from those books, and it is not affiliated with or endorsed by their authors or publisher.

---

## Why this exists

Those books could hold a reader for an hour on a single page: every cabin occupied, every machine shown working, small stories tucked into corners. The drawings were frozen at one instant. This project asks what happens when the page keeps going: the stoker keeps shovelling, the cook keeps stirring, the night watch comes on, the lamps are lit, and you can follow any one person through their day.

The subjects are drawn from real places and machines, researched from museum, archive and reference sources. Each has a research dossier in [`docs/research/`](docs/research/) with the dimensions, the layout room by room, the people who worked there and their routines, the machinery, and the captions with the sources behind them.

---

## What is actually different

**The picture is alive.** Hundreds of people follow hour-by-hour routines over a walkable network of decks, stairs and ladders. Engines turn, pistons drive, smoke drifts downwind, the sea moves, and the clock runs from dawn through dusk to a lamplit night.

**Slice it wherever you like.** The Slice tool places cuts anywhere along the subject, from none to eight. Open the slices and the pieces pull apart, each cut face drawn as solid section, the way the classic books split a liner into slabs. Cuts are live: drag one and the section moves with it.

**Real depth, drawn by hand.** Every scene is true 3D, rendered through an ink and watercolour pass: pen lines where forms turn and materials meet, a slight wobble, pigment pooling at the edges, paper grain. Brick, planks, rivets and ashlar are drawn in the shader, so they stay sharp at any zoom.

**Follow anyone.** Click a person to follow them: their name, their job, a line about their life, and what they are doing right now.

**Weather and a soundscape.** Rain, storms with lightning, fog and snow. The sound is optional and entirely synthesised: surf, wind, engines, steam, crowds, bells on the hour, a dance band in the lounge, an organ in the nave. Zoom in on a machine to hear it.

**One file.** The portable edition carries three.js, every scene and every caption. It runs from a USB stick.

| Subject | Moment | Look for |
|---|---|---|
| The Atlantic Liner | A westbound crossing, 1938 | Stokers at the boilers, the turbines, the first-class dining saloon, the kennels |
| The Castle | A great stone castle, about 1300 | The kitchen fires, the great hall at dinner, the garderobes, the guard on the wall walk |
| The Man-of-War | A first-rate ship of the line, 1805 | Hammocks slung over the guns, the galley stove, the surgeon's cockpit, sailors aloft |
| The Express | A streamlined steam express, 1937 | The fireman's shovel, the valve gear, the dining car at speed |
| The Coal Mine | A deep Welsh colliery, 1910 | The winding engine, the cage, the pit ponies' stables, the coal face by lamplight |
| The Cathedral | A Gothic cathedral rising, 1245 | The treadwheel crane, the masons' lodge, a service in the finished choir |
| The Rock Lighthouse | A keepers' tower, about 1890 | The turning lens, curved bunks, the beams sweeping the night sea |
| The Jumbo Jet | A transatlantic night flight, 1970s | The flight deck, the upper-deck lounge, the galleys, the cargo hold |
| The Space Station | The International Space Station | Floating crew, the Cupola, sixteen sunrises a day |
| The Submarine | A fleet submarine of the 1940s | Hot bunks, the control room, diesels charging the batteries at night |
| The Car Factory | The moving assembly line, 1914 | The chassis line, belts and line shafts, the cars driving off the end |
| The Opera House | A grand opera house, 1875 | The fly tower, the understage machinery, the cistern, the gods |

---

## How to explore

| | |
|---|---|
| Look around | Drag, or the arrow keys |
| Zoom | Scroll, pinch, double-click or double-tap, or <kbd>+</kbd> <kbd>&minus;</kbd>; <kbd>0</kbd> shows the whole subject |
| Turn the view | Right-drag, Shift-drag or a two-finger twist; <kbd>V</kbd> steps through viewing angles |
| Follow someone | Click or tap them, or pick from the People list (<kbd>W</kbd>); <kbd>Esc</kbd> lets them go |
| Captions | Click a framed caption for its fact card and source, or find it under Facts in the People list; <kbd>L</kbd> hides them |
| Slice | <kbd>S</kbd> for the slice tool, click to cut, drag to move, &times; to remove; <kbd>O</kbd> opens and closes the slices |
| Time | Drag the clock; <kbd>N</kbd> night, <kbd>D</kbd> day, <kbd>K</kbd> clock speed, <kbd>Space</kbd> pause |
| Weather | <kbd>R</kbd> steps through clear, rain, storm, fog and snow |
| Tour | <kbd>T</kbd>, then <kbd>&larr;</kbd> <kbd>&rarr;</kbd> |
| Ambient | <kbd>A</kbd> drifts unattended through every subject, by day and night |
| Sound | <kbd>M</kbd> |
| Picture | <kbd>P</kbd> saves the view as a PNG at twice screen resolution, captions included |
| Contents | <kbd>C</kbd> |
| Full screen | <kbd>F</kbd> |
| Step back | <kbd>Esc</kbd> closes the top panel, leaves the slice tool, ends the tour, or lets the person you follow go |
| Help | <kbd>?</kbd> |

On a phone the main tools sit in one row with the clock above them; **More** opens a second row with captions, viewing angle, whole view, picture and full screen. <kbd>Space</kbd> pauses even after you click a toolbar button or the clock; a button reached with <kbd>Tab</kbd> takes <kbd>Space</kbd> and <kbd>Enter</kbd> itself.

The address bar carries the view and keeps up with the clock: `#liner?cuts=60,120,180&open=1&h=21.5&w=rain` opens the liner, cut in three places, opened, at half past nine on a rainy night. Cuts are ignored for a subject shown whole.

---

## Run it

Double-click the portable file, [`dist/cross-sections.html`](dist/cross-sections.html). Or use a launcher, which serves the folder on your own computer only and opens it:

| | Double-click |
|---|---|
| macOS | `run/Cross-Sections (macOS).command` |
| Windows | `run/Cross-Sections (Windows).bat` |
| Linux | `run/cross-sections.sh` |

From source, to work on it:

```bash
git clone https://github.com/ChaseHendrick/cross-section.git
cd cross-section
npm install          # three.js, cannon-es, esbuild, playwright-core
npm run serve        # opens the live source over local HTTP
```

The source runs directly as ES modules; there is no build step while you work. `node tools/build.js` regenerates the portable file.

---

## What the checks establish

| Check | Command | What a pass means |
|---|---|---|
| Lint | `node tools/lint.js` | Scenes are registered and loaded; no `Math.random`; no em dashes; every fact card names a source |
| Portable build | `node tools/build.js --check` | The committed portable file matches the source exactly |
| Every subject in a browser | `node tools/check.cjs --dist` | Each scene loads and runs; following, slicing, the tour, captions, sound, pictures, contents and help work with no console error, and <kbd>Esc</kbd> backs out of each; budgets hold (rendered at half scale for speed; `--full-quality` for full) |
| Phone viewport | `node tools/check.cjs --dist --mobile` | The same, at 390 by 844 with touch |
| Looking | `node tools/shot.cjs <id> --hour 22 --zoom x,y,w` | Nothing automatic: a person looked at the picture |

A pass means the software works. It does not establish that a drawing is accurate. The research dossiers record what was checked and how, and mark what is illustrative. The scenes simplify: rooms are fewer than the real ones, crowds are smaller, and machines are schematic. Named characters are fictional. Captions with a fact card cite the source they were checked against.

---

## For people (and agents) adding to it

**A scene is one module.** `src/scenes/<id>.js` registers itself with a `build(kit)` that makes the static drawing and a `setup(world)` that brings it to life. Copy [`src/scenes/_template.js`](src/scenes/_template.js) or read [`src/scenes/lighthouse.js`](src/scenes/lighthouse.js), a complete small scene.

**The engine is shared.** [`src/engine/`](src/engine/): the kit (geometry), materials and the ink pass, people and their animations, the world (navigation and routines), sky and sea, particles, sound, camera, captions and the stage. [docs/ENGINE-API.md](docs/ENGINE-API.md) lists every call. [docs/SCENE-GUIDE.md](docs/SCENE-GUIDE.md) is the art direction and the process.

If you are an agent:

1. Read [AGENTS.md](AGENTS.md), then the scene guide and the engine API, then one existing scene.
2. Research first. A scene starts from a dossier in `docs/research/` with sources you actually opened.
3. Look at your work constantly with `node tools/shot.cjs`, by day and by night, close and far, with slices open.
4. All randomness through `kit.rng` or `world.R`. Fictional people only. No em dashes.
5. Before a pull request: `node tools/lint.js`, `node tools/build.js`, `node tools/check.cjs <id>`.

---

## License

[MIT](LICENSE) for this project's source. The portable edition bundles [three.js](https://threejs.org) and [cannon-es](https://github.com/pmndrs/cannon-es), both MIT; their notices are in [`licenses/`](licenses/) and at the end of the bundle.

Made by Chase Hendrick with Claude.
