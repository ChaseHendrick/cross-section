<!-- Against main. The title is the commit: one sentence, sentence case, ending with a full stop. -->

## What this does

<!-- One or two sentences. A scene, the engine, the shell, or the tools. -->

## How I checked

- [ ] `node tools/lint.js`
- [ ] `node tools/build.js` and the regenerated `dist/cross-sections.html` is committed (`node tools/build.js --check` passes)
- [ ] `node tools/check.cjs <scene ids>` passes (or `--dist` for the portable edition)
- [ ] Looked at the scene with `node tools/shot.cjs`: whole view by day and by night, a room close up, slices open
- [ ] Captions: every fact card has a source I opened; no unverified claims; no em dashes
- [ ] No `Math.random` in a scene; no network assets

## Notes for review

<!-- What to look at. A link hash such as #liner?cuts=60,120&open=1&h=21 helps. -->
