# Resume notes (temporary, delete before merging)

This folder is a snapshot of unfinished work, saved because the session paused for a usage limit. The app never loads it: lint, the build and the browser checks ignore `wip-snapshot/`.

## What is in here

- `src/scenes/...`: the scene code the builders had written when the snapshot was taken (liner, castle, warship, train, mine, cathedral, station, submarine, factory, opera). The jet had not started.
- `src/app/`, `src/styles/`, `src/engine/`: QA round 2 edits in progress, if any.
- `docs/requests/`: engine requests filed by the scene builders.
- `workflows/`: the orchestration scripts (build and art-direct, ambiance and fact-check, QA) and the QA round 1 reports.

## State when paused (2 October 2026, about 02:20 UTC)

- Lighthouse: complete and committed.
- Express (train): built; art-director review was running.
- Liner, castle, warship, mine, cathedral, station: builders on their last modules (captions, tour, slicing).
- Submarine, car factory, opera: builders about halfway.
- Jumbo jet: not started (dossier ready).
- QA round 1: committed (621ba3c), 59 of 62 fixed and verified. QA round 2 (10 remaining problems) was running.
- hendrickresearch.com: integration ready on branch `claude/optimistic-tesla-buoi0n` of that repo, waiting for the final portable file and a hero preview image.

## To resume

1. If the container was reset, copy `wip-snapshot/src` and `wip-snapshot/docs` back over the repo (`cp -r wip-snapshot/src wip-snapshot/docs .`).
2. Relaunch each unfinished scene with `workflows/wf-build.js`, telling the builder the scene is partly built and to continue from the existing code rather than start over. Then the director pass, then `workflows/wf-ambiance.js` (one combined sound, life, lighting and fact-check pass per scene).
3. Relaunch QA round 2 from `workflows/qa-round-2.js` if its report never arrived.
4. Commit each scene with a rebuilt `dist/` once `node tools/lint.js`, `node tools/build.js` and `node tools/check.cjs <id>` pass. Delete this folder before merging.
