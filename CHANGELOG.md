# Changelog

## Unreleased

- **Cross-Sections begins.** Twelve living 3D cutaways: the Atlantic Liner, the Castle, the Man-of-War, the Express, the Coal Mine, the Cathedral, the Rock Lighthouse, the Jumbo Jet, the Space Station, the Submarine, the Car Factory and the Opera House.
- **An engine for living cutaways.** three.js geometry drawn through an ink and watercolour pass; shader-drawn surface patterns; hatched cut faces; lamp light baked into a 3D light volume; people with hour-by-hour routines on a walkable network; sky, sea, smoke and steam; a synthesised soundscape; captions in the margins with fact cards and sources; guided tours.
- **Slice it anywhere.** The viewer places from none to eight cuts and pulls the slices apart. Cuts are live clipping ranges, so dragging a cut moves the section as you watch.
- **One portable file.** `dist/cross-sections.html` carries everything and opens from disk.
- **Research dossiers.** Each subject has a dossier in `docs/research/` with dimensions, layout, people, machinery and sourced captions.
- **Shell and engine QA pass.** Phones get a two-row toolbar (clock above, More for the rest) with 40 px targets, safe-area insets and touch wording; tablets and landscape phones fit without overlap. Double-tap zooms and a two-finger twist turns the view. Contents and Help are proper modal dialogs (focus moves in, the page behind is inert, Esc closes the top layer); shortcuts keep working after the clock slider and leave focused buttons alone. Captions and cut handles keep clear of the chrome and open panels; framed captions are listed under Facts in the People panel. Links carry the hour. Slice mode, cuts and the tour behave across subject switches; a scene that fails to build leaves the previous one intact; GPU memory is freed on every switch; people look the same every time a subject opens; weather no longer starves a scene's smoke and spray.
