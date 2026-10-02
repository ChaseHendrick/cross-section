**Verification of the 62 reports (independent re-test)**

I re-tested every problem marked fixed. Desktop runs were at 1440x900, 1280x720 and 800x500. Touch runs were at 390x844, 360x740, 844x390 and 820x1180, plus dark mode and reduced motion. I used the lighthouse and test scenes registered from the page (`synth` is sliceable; `boomsetup` and `boombuild` throw). I did not edit any source.

Three reports are still partly broken: shortcuts after the clock slider, tap targets, and the phone toolbar under More. Everything else checked out, including the build-failure report the engineer marked "partly fixed".

| Problem | Still broken | Evidence |
|---|---|---|
| Slice mode carries into lighthouse; hash and API cuts accepted | no | After switching via Contents: `{sm:false, bar:"slicebar", pressed:"false", title:"This subject is shown whole…"}`. Clicking the tower gives cuts `[]`. S shows the toast. `setCuts([0,5])` gives `[]`. Hash `cuts=0,5&open=1` gives cuts `[]`, open 0. |
| Shortcuts stop after using the clock slider | **yes (Space only)** | With focus left on `#hour`, T, N, W and C work and ArrowRight moves the slider (6.55 to 6.60). Space does nothing: `{paused:false, active:"hour"}`. ui.js:449 returns for any `input`, including a range input. |
| Card for a person chosen from People opens under the panel | no | `{people:"people"(closed), card:"card on", topElementAtCard:"card"}`. Keyboard Enter moves focus to the card's close button. |
| Tour card and button stuck after picking a person | no | Click a person during the tour: `{tour:-1, tc:"tourcard"(hidden), tb:"false", sel:"Thomas Hearn"}`. Choosing from the list during the tour: tour ends and Jack Morrow stays selected after the timer fires. |
| + and - zoom the wrong way | no | Distance 94.8, then 63.3 after +, then 142.3 after - -. |
| Slice bar covers the tour card at 1280x720 | no | Tour then S ends the tour. S then T ends slice mode. Tour card `[16,499,396,640]` sits above the toolbar (top 648). |
| Links lose the hour (x2) | no | A fresh `#lighthouse?h=21.5&w=rain` keeps `#lighthouse?h=21.5&w=rain`. After N the hash becomes `?h=22`. |
| Clicks and focus lost to timer rebuilds (x2) | no | A 1.5 s press on the card × closes it. A 2.2 s press on a list name selects Owen Pritchard. Focus on a list button survives 3.5 s. |
| Cards and People panel sit on captions; translucent panels | no | No caption hit-rects under the card or the People panel at 1440. Panel background is `rgb(250,245,232)` (solid). |
| Pause does not pause the tour | no | Paused with the timer forced to zero: stays "1 of 6". After unpausing it goes to "2 of 6". |
| Angle label stale after load | no | V gives "Level view". Loading synth gives "Book view" (yaw -0.42); loading lighthouse gives "Book view" (yaw -0.5). |
| GPU memory leak (x3) | no | Six lighthouse reloads plus three synth/lighthouse round trips: all `[30,4]` geometries/textures. |
| Shortcuts act behind dialogs; no focus management (x2) | no | T with Help open: tour -1, focus on `closeHelp`. W with Contents open: People stays closed. Tab inside Contents never reaches background controls (inert). |
| Toolbar labels unclear | no | Labels read Play (when paused), "Clear sky", "Book view", "Remove all", "0×". Disabled Slice explains itself. |
| Slice bar wraps badly; no note at 8 cuts | no | At 1440 and 1280 the hint is on one row and the buttons on the next. At the limit: "8 cuts (the most)" and the toast "Up to 8 cuts. Remove one to place another." |
| Contents does not mark current; choosing it rebuilds; first visit builds first | no | `lighthouse*` with "Open now" shown. Choosing it keeps the same world, rain and 11:00. First run shows Contents at 1969 ms, before the world exists (2828 ms). |
| Help omits F, Esc and ? | no | All three kbd rows are present; the touch section shows on coarse pointers. |
| README gallery images missing | no | Only `gallery/lighthouse.jpg` is referenced. |
| Sound keeps running after M, and in a hidden tab | no | After M M: `suspended`. Back on: `running`. Simulated hidden tab: `suspended`, then `running` when visible. |
| Click ending ambient also acts on the scene | no | Clicking a person in ambient mode: ambient off, nobody selected, no card. |
| Cut-handle drag throws TypeError (x2) | no | First canvas gesture by mouse moves the cut, -8 to -6.5 (1440) and -6 (1280), with no page errors. Touch drag (CDP touch) moves the cut, 0 to 6. |
| Dragging one cut past another leaves cuts unsorted | no | Mid-drag `[4.99,6,8]`: the dragged cut is clamped below its neighbour. |
| Phone/tablet toolbar overlaps, overflows, speed button blank (x3) | no for overlaps; **partly yes** under More (see new problem 2) | No overlapping controls at 390, 360, 820x1180, 844x390, 800x500 or 1280. Each control's centre hits itself. `clockSpeed` shows "1×". No scroll overflow at any size. |
| No touch twist | no | Two-finger twist (CDP touch): yaw -0.5 to -0.08. |
| Double-tap does not zoom | no | Real CDP double tap with timestamps 0.15 s apart starts a flight toward distance 59 (from 142). |
| Captions and handles under masthead and chips (x3) | no | Caption rects overlapping the chrome: none at 390, 360, 844x390, 800x500, 820x1180 or 1280. Handles at y=79 with top inset 65 at 844x390. |
| Slice bar half width on phones | no | `[8,634,382,726]`, 374 px wide. |
| Cut × too small; near miss adds a cut | no | Tap 10 px from the × centre removes the cut. The × is drawn larger on touch. |
| Masthead overlaps chips on phones | no | 390: masthead right edge 226, chips start at 238. 360: 196 vs 208. |
| No safe-area insets | no (code only) | `env(safe-area-inset-*)` is used for masthead, chips, toolbar, cards and panels. Insets cannot be emulated in Chromium, so this is not tested at runtime. |
| Contents close scrolls away; header too big in landscape | no | With 12 scenes, after scrolling the close button is still at y=34 and is the element under the pointer. At 844x390 the header is compact and the list starts at y=94. |
| Tap targets under 40 px | **partly yes** | Fixed at 390 portrait (chips 44, close 44, filter 44, tabs 40, list rows 58). On touch screens wider than 720 px (844x390, 820x1180) the Contents, People and Help chips are still 32 px tall: the coarse-pointer CSS does not resize `.chip`. With More open on phones, toolbar buttons are 26 to 29 px wide (new problem 2). |
| People filter triggers iOS zoom | no | 16 px font on touch (the zoom itself cannot be tested in Chromium). |
| Space on a focused button pauses | no | Space on focused Captions toggles captions and does not pause (but see new problem 1). |
| Esc in the filter; Esc ignores stacking | no | First Esc clears "xyz", second closes the panel and focus returns to `openPeople`. W, then ?, then Esc closes Help and keeps People open. |
| Person card re-announced every 700 ms | no | `#card` has no aria-live; one live span (the "Now" text). |
| Fact cards unreachable by keyboard; slider has no spoken time | no | Facts tab, then Enter, opens the "Solid base" card with focus on its close button. `aria-valuetext` reads "11:00". |
| Dark mode contrast | no | `#cutOpen` measures 7.04:1. The tour counter uses the same `--rule`/`--accent` colour, also 7.04:1 (calculated, not measured on screen). |
| Reduced motion ignored | no | `camera.reduced` is true, the tour flight completes at once, pan velocity is zeroed, transitions are 0 s. |
| Rotating does not refit | no | 390x844 to 844x390: distance 142 to 94.8. After a pan it does not refit (94.8 stays). |
| Touch told to click and press Esc | no | Card: "tap × to let them go". Slice hint says "Tap". The Contents footer and Help use touch wording. |
| Malformed % escape stops the app | no | `#lighthouse%E0%A4%A`: the app starts, the lighthouse loads, Contents opens, no errors. |
| Hash cuts skip the rules; `cuts=,,,` | no | `cuts=,,,&open=1&h=%E0%A4` gives cuts `[]`, open 0, no errors. |
| People look different per load | no | Identical ids, heights and speeds across the first load, a reload, and a reload after visiting synth. |
| Rain uses the whole particle budget | no | Simulated 60 s storm: rain 1931 of 3000 (64%), scene spray 19 to 25 kept flowing. |
| Wheel zoom stops following | no | After the wheel: following, distance 52. A drag-away updates the card to "Looking away. Click them to follow again…". |
| Scene throwing during load leaves half-switched stage | no (both cases) | `boomsetup` and `boombuild` both leave the scene and world as the lighthouse: same world object, 19 root children, title unchanged, hash restored. The message clears after 5 s. Contrary to the engineer's note, a build failure also leaves the old subject intact. |
| Physics fast-forwards after slow frames | no (code only) | `physics.js:75` `this.acc = Math.min(this.acc, h)`. |

No page errors appeared in any run, apart from the two deliberate scene throws.

**New problems found**

1. **Medium (keyboard UX): Space no longer pauses after clicking any toolbar button with the mouse.** Chromium leaves focus on the clicked button, and ui.js:449 hands Space to that button. Clicking Weather then pressing Space moves the weather from rain to storm instead of pausing. Clicking Tour then Space ends the tour. The same check means Space does nothing while the clock slider has focus. Help says "Space pause". A fix could be to blur toolbar buttons after a pointer click, or to send Space to Pause unless the focus came from the keyboard (`:focus-visible`).
2. **Medium (phone UX): the More view crams all tools into one row.** At 390 the 16 buttons are 28 to 29 px wide (26 px at 360). Labels are cut to "Cl…", "So…", "Ca…", "Bo…", "W…", "Pic…". This undoes the 40 px tap-target fix in that state. Screenshot: `out/d_390x844t_more.png`.
3. **Low: on touch screens wider than 720 px the top chips stay 32 px tall** (844x390 phone landscape, 820x1180 iPad).
4. **Low: double-tap zoom fires in slice mode.** Two quick taps under 30 px apart place one cut and then zoom instead of placing a second cut. Seen when placing cuts in quick succession at 390x844.
5. **Low: the "Up to 8 cuts" toast sits on top of the cut-handle × buttons for its 2.6 s.** It appears at top 80 px over handles at y≈112 to 120 (1280x720) and is not `pointer-events:none`, so it blocks taps on them. The faint hover preview of a new cut still shows at the limit. Screenshot: `out/f_slice1280_limit.png`.
6. **Low: opening a card on the right moves every caption from the right gutter to the left**, including the one just clicked, and "Lantern and cowl" is dropped. It works, but the jump is jarring (`out/a9_fact.png`).
7. **Low (from reading the code): a failed `load()` never frees the half-built Kit's geometry** (`stage.js` catch block), so each failed attempt leaks a little GPU memory.

Not tested at runtime: iOS focus zoom, real safe-area insets, a real screen reader, and the physics change (code reading only).

Everything is in `/tmp/claude-0/-home-user-cross-section/fdf28e1a-0b29-58c1-99a3-da6edd1a31ab/scratchpad/v/`:
- Test scripts: `a.cjs`, `b.cjs`, `c.cjs`, `d.cjs`, `e.cjs`, `f.cjs`, `g.cjs`, `k.cjs` (helpers in `lib.cjs`, `lib2.cjs`, `synth.js`)
- Screenshots and logs: `out/`