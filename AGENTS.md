# AGENTS

Cross-Sections is a set of living, hand-drawn 3D cutaways. Maintained source is in `src/` (ES modules, no framework). `node tools/build.js` generates the portable `dist/cross-sections.html`; never edit that file by hand.

## What is in here

| Path | Contents |
|---|---|
| `src/engine/` | The shared engine: kit (geometry), materials and ink pass, figures and animations, world (navigation and routines), sky and sea, particles, sound, camera, captions, stage |
| `src/scenes/<id>.js` | One subject per module, optionally with helpers in `src/scenes/<id>/` |
| `src/app/ui.js`, `src/styles/app.css`, `index.html` | The shell |
| `docs/research/<id>.md` | Research dossiers: dimensions, zones, people, machinery, captions with sources |
| `docs/ENGINE-API.md`, `docs/SCENE-GUIDE.md` | The API and the art direction |
| `tools/` | Lint, build, browser checks, screenshots, thumbnails |
| `dist/cross-sections.html` | Generated portable edition (committed) |

## Do

- Read `docs/SCENE-GUIDE.md` and `docs/ENGINE-API.md` before writing a scene, and look at `src/scenes/lighthouse.js`.
- Start a subject from a research dossier. Every caption with a fact card cites a source you actually opened.
- Look at your work with `node tools/shot.cjs` at several distances, by day and night, with slices open. Judge it as an art director would.
- Keep a scene's randomness seeded (`kit.rng`, `world.R`).
- Regenerate the portable file (`node tools/build.js`) in the same commit as any source change, and run `node tools/lint.js` and `node tools/check.cjs <ids>`.

## Do not

- Edit the engine to suit one scene. Work around it in the scene and write the request in `docs/requests/<id>.md`, or make a general, documented engine change with its own checks.
- Use `Math.random`, network assets, or recordings. Everything is procedural and offline.
- Put words or invented actions on real, named individuals. Named characters are fictional.
- State a fact the dossier does not support, or let a caption claim more than the drawing shows.
- Use em dashes anywhere (house style: commas, colons, parentheses). `tools/lint.js` fails on them.
- Hand-edit `dist/cross-sections.html`.
