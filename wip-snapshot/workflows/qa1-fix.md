I reproduced all 62 reports. 61 were real and are fixed, one is partly fixed and needs a follow-up from the scene owners, and none were specific to a scene, so nothing went into `docs/requests/`. `node tools/check.cjs lighthouse` and `node tools/check.cjs --mobile lighthouse` both pass. `node tools/lint.js` still fails, with 121 problems, all in castle, liner, station, submarine and warship (captions that have a fact card but no source). Those scenes are being rebuilt, so I left them alone. I did not run `node tools/build.js`.

I checked each fix with test scripts in Chromium on the lighthouse and on test scenes registered from the page. I looked at screenshots at 1440x900, 1280x720, 800x500, 820x1180, 844x390, 390x844 and 360x740, plus dark mode and reduced motion.

| Problem | Verdict | What changed |
|---|---|---|
| Slice mode carries into the lighthouse; cuts from the address bar accepted | fixed | Loading a subject turns slice mode off. Subjects with `slice:false` ignore cuts from `setCuts`, `load` and shared links. The slice button is disabled and says why; pressing S shows a short note. |
| Shortcuts stop after using the clock slider | fixed | Only text fields block shortcuts. Arrow keys still move the focused slider. |
| Card for a person chosen from People opens under the panel | fixed | Choosing someone closes the panel at every width. Keyboard focus moves to the card. |
| Tour card and Tour button stay stuck after clicking a person | fixed | Selecting anyone, by click or from the list, now ends the tour cleanly. |
| + and - zoom the wrong way | fixed | Swapped the zoom factors. |
| Slice bar covers the tour card at 1280x720 | fixed | Tour and slice tool are now one at a time. Both bars sit above the toolbar's measured height. |
| Links lose the hour (twice) | fixed | The address writes `h=`, updated every few seconds while the clock runs and after slider, N or D. |
| Clicks lost, and keyboard focus dropped, because card and People list rebuild on a timer (twice) | fixed | Both are built once; the timer only updates the activity text. |
| Cards and People panel sit on the captions | fixed | The page now tells the stage where the masthead, toolbar and open panels are, and captions avoid those areas. Panel backgrounds are solid. |
| Pause does not pause the tour | fixed | The tour waits while paused. |
| Angle label goes stale after a load | fixed | It resets on every load; the first angle is the subject's own view. |
| GPU memory grows on every switch (three reports) | fixed | Switching now frees the old subject's geometry, per-scene materials (shared ones kept) and textures such as the sea mask. Eight lighthouse reloads hold steady at 30 geometries and 4 textures. |
| Shortcuts act behind dialogs; dialogs do not manage focus (two reports) | fixed | Contents and Help make the rest of the page inert and move focus to their close button. Focus goes back on close, and Esc closes the top layer first. |
| Toolbar labels unclear | fixed | Labels now read Clear sky, Book view, Play when paused, Exit in full screen, and 0× for a stopped clock. The slice bar's Clear is now "Remove all". Disabled tools explain themselves, and Whole has its own icon. |
| Slice bar wraps badly; no note at 8 cuts | fixed | Hint on one row, buttons on the next, short labels on phones. The count says "(the most)" and a note appears. |
| Contents does not mark the current subject; choosing it rebuilds everything; first visit builds before Contents shows | fixed | Current subject is marked "Open now", and choosing it just closes Contents. On a first visit Contents appears first and the first subject draws quietly behind it. |
| Help omits F, Esc and ? | fixed | Added to Help and the README, plus a touch section. |
| README gallery images missing | fixed | The gallery now shows only the lighthouse image, with a comment to add the others once thumbnails are rendered. |
| Sound graph keeps running after M, and in a hidden tab | fixed | Sound pauses a moment after it is turned off and while the tab is hidden. Ambient mode also waits while the tab is hidden. |
| Click that ends ambient mode also acts on the scene | fixed | That first click or scroll is swallowed. |
| Dragging a cut handle throws an error (twice) | fixed | The drag now starts from the press itself. |
| Dragging one cut past another leaves cuts out of order | fixed | A dragged cut stays between its neighbours. |
| Phone and tablet toolbar overlaps itself, overflows with no hint, speed button blank (three reports) | fixed | Phones: clock row on top, then Tour, Slice, Open, Pause, Weather, Sound and More. Tablets: clock row, then all tools. Short screens: one row of icons. An edge fade shows when the bar scrolls. No overlaps at any size tested. |
| No way to turn the view by touch | fixed | A two-finger twist turns the view; documented in Help. |
| Double-tap does not zoom | fixed | Detected from tap timing. Playwright's taps arrive about 2.7 s apart on this loaded machine, so I verified with synthetic events, which zoom correctly. |
| Captions and cut handles under the masthead and chips (three reports) | fixed | Same chrome areas as above. Handles stay below the top band. A caption column that does not fit drops its least important caption instead of pushing it under the chips. |
| Slice bar half the screen wide on phones | fixed | Now uses the full width (374 px at 390). |
| Cut × too small for a finger; near miss adds a cut | fixed | Larger targets for touch, and the nearer of × and handle wins. The × is drawn larger on touch screens. |
| Masthead overlaps the chips on phones | fixed | Masthead width is capped on narrow screens. |
| No safe-area insets | fixed | Masthead, chips, toolbar and cards now keep clear of notches and the home indicator. |
| Contents close button scrolls away; header too big in landscape | fixed | The close button stays in view while scrolling; compact header on short screens. |
| Tap targets under 40 px | fixed | Touch screens get targets of at least 40 px, and a wider hit box for picking people. |
| People filter text triggers iOS zoom | fixed | 16 px on touch screens. |
| Space on a focused button pauses instead of pressing it | fixed | Space and Enter go to the focused button or link. |
| Esc in the People filter does nothing; Esc ignores stacking | fixed | Esc clears the filter, then closes the panel. Help closes before People. |
| Person card re-announced to screen readers every 700 ms | fixed | Announced once on selection; only the "Now" line is live. |
| Fact cards unreachable by keyboard; time slider has no spoken time | fixed | A new Facts tab in the People panel (W) flies to the caption and opens its card. The slider announces the time, e.g. "17:13". |
| Dark mode contrast too low | fixed | Primary button and tour counter now measure 7.04:1. |
| Reduced-motion setting ignored | fixed | Camera flights become cuts, no pan inertia, no CSS transitions. |
| Rotating the device does not refit | fixed | Refits unless the visitor has moved the camera. |
| Touch screens told to click and press Esc | fixed | Touch wording throughout. |
| Malformed % escape in the address stops the app | fixed | Parsed safely. Empty `cuts=,,,` entries are dropped. |
| Cuts from the address skip the usual rules | fixed | One cleanup path for every way in: range, 1 m gap, at most 8. |
| People look different each time a subject opens | fixed | Looks are seeded per subject. A subject's first load is unchanged from before. |
| Rain uses up the whole particle budget | fixed | Weather stops adding drops at 65% of the pool; in a storm test the scene's own spray kept flowing. |
| Wheel or pinch zoom silently stops following | fixed | Zoom now keeps following. Dragging away updates the card ("Looking away. Click them to follow again"). |
| A scene that throws during build leaves a half-switched stage | partly fixed (scenes) | A failure in a scene's `setup` now leaves the previous subject untouched. A failure in `build` still clears the old subject first, because geometry from the previous version stays in place; the scene owners should know this. In both cases the address goes back, and the error message clears after 5 s. |
| Physics fast-forwards after slow frames | fixed | Leftover time is dropped. |

**Other changes:**
- **`tools/check.cjs`:** Playwright's clicks were timing out here because frames take over a second on this loaded machine. The check now renders at half scale and waits up to 120 s per click; `--full-quality` restores full scale. On phones it opens More first. It also now checks that Esc ends following, the tour and the dialogs, and that a `slice:false` subject refuses cuts.
- **Docs:** I updated `docs/ENGINE-API.md` with the new stage behaviour scenes can rely on, plus the README and `CHANGELOG.md`. The engine API stays backward compatible. The only additions are `stage.insets`, `stage.reserved`, `stage.maxCuts()`, an optional extra argument to `stage.pick()`, `addCut()` now returning a result, and two new events (`follow`, `cutlimit`).

Files changed: `src/app/ui.js`, `index.html`, `src/styles/app.css`, `src/engine/stage.js`, `labels.js`, `camera.js`, `world.js`, `weather.js`, `audio.js`, `physics.js`, `materials.js`, `tools/check.cjs`, `README.md`, `docs/ENGINE-API.md`, `CHANGELOG.md`.

My test scripts are in `/tmp/claude-0/-home-user-cross-section/fdf28e1a-0b29-58c1-99a3-da6edd1a31ab/scratchpad/qa` (`t1.cjs` to `t8.cjs`, screenshots in `out/`).