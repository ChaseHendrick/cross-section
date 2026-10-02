# Source and the portable edition

Edit `src/` and `index.html`. The browser loads the source directly as ES modules, with an import map that points `three` and `cannon-es` at `node_modules/`:

```sh
npm install
npm run serve          # python3 run/cross-sections.py --dev, opens index.html over local HTTP
```

The portable edition is generated:

```sh
node tools/build.js           # writes dist/cross-sections.html
node tools/build.js --check   # exits 1 if the committed file is out of date (CI runs this)
```

`tools/build.js` uses esbuild to bundle `src/main.js` (three.js, cannon-es, the engine, every scene and the shell) into one minified inline module, inlines the stylesheet and the contents-page thumbnails from `gallery/`, and keeps the licence notices of bundled libraries at the end of the bundle. The output is deterministic, which is what lets CI compare it byte for byte.

| Output | Purpose |
|---|---|
| `dist/cross-sections.html` | Self-contained portable edition: opens from a file, a USB stick or any static web host |
| `gallery/<id>.jpg` | Contents-page thumbnails rendered by `node tools/thumbs.cjs` |

Never edit generated files by hand. Regenerate thumbnails after a scene changes noticeably (`node tools/thumbs.cjs <id>`), then rebuild.

## Layout of the source

| File | Role |
|---|---|
| `src/main.js` | Loads every scene (each in isolation, so one failure cannot take down the rest), then the shell |
| `src/engine/index.js` | The public API for scenes |
| `src/engine/stage.js` | Renderer, passes, slicing, input, tour, pictures |
| `src/engine/materials.js` | The painterly shader, patterns, cut faces, overlay and glow materials |
| `src/engine/post.js` | The ink and watercolour pass |
| `src/engine/kit.js` | Geometry builder and the lamp light volume |
| `src/engine/world.js`, `figures.js`, `anims.js` | Navigation, routines, people and their animations |
| `src/engine/sky.js`, `particles.js`, `audio.js` | Sun, sky and sea; smoke, steam and halos; the soundscape |
| `src/engine/props.js`, `camera.js`, `labels.js`, `core.js` | Furniture, the camera, captions, utilities |
