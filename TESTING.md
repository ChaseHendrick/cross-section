# Testing

Choose checks by what you changed. A green check means the software works; it does not mean a drawing is accurate.

| Changed area | Checks | What a pass means |
|---|---|---|
| Anything | `node tools/lint.js`, `node tools/build.js --check` | House rules hold; the committed portable file matches the source |
| A scene | `node tools/check.cjs <id>`, then look: `node tools/shot.cjs <id>` at several distances and hours | The scene loads and runs; following, slicing, tour, captions, sound, pictures, contents and help work with no console error; budgets hold |
| The engine or the shell | `node tools/check.cjs` (every scene), `node tools/check.cjs --mobile`, `node tools/check.cjs --dist` | No regression in any scene, on a phone-sized touch viewport, or in the portable edition |
| Captions | `node tools/lint.js`, and open every cited source | Every fact card names a source; the source says what the caption says |

## Setup

`npm install` installs three.js, cannon-es, esbuild and playwright-core. The browser checks need a Chromium: in CI, `npx playwright-core install --with-deps chromium`; locally, set `CHROMIUM_PATH` to a Chromium binary if Playwright's download is not installed. Rendering in the checks is software (SwiftShader), so frame rates there say nothing about real devices.

## What the browser check does

For each scene: load it and let it run, follow a named person, place the suggested cuts and open the slices (where the scene can be sliced), start and step the tour, toggle captions and sound, jump to night, save a picture, open the contents and help. It fails on any page error or console error, on more than 900,000 triangles, or on more than 450 people.
