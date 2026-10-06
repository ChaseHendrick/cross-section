# Engine requests from the submarine scene

The submarine works around each of these inside `src/scenes/submarine/`. They would help other scenes too.

## 1. A movable water level with its cut face

The boat runs on the surface at night and lies at periscope depth by day (dossier 4c), so the sea has to rise over her at dawn and fall at dusk. The scene does this itself:

- two `makeSea` meshes (one masked round the hull for the surface, one unmasked for the dived state), moved in `update` and swapped by visibility;
- the water cut face split into horizontal bands, with the bands above the surface waterline built as overlay `kit.part`s (flagged `userData.overlay = true` before the stage collects them) that are scaled in y to follow the sea;
- a dark "far water" box behind the boat, moved with the sea, so the depths do not show the sky dome.

Request: `makeSea` could take a `level` that can change at runtime (a uniform), and `kit.sheet` could take a clip region ("no water inside this outline at the cut") so a scene can say where the dry interior is instead of banding the sheet by hand. A documented way to put overlay geometry in a moving part would also help (`kit.part(..., { overlay: true })`).

## 2. Slice gaps under water

With slices opened, the gaps between slices show the sky dome below the horizon. Under water by day that is a pale column from the sea floor to the surface. A scene option for the colour seen below the horizon (separate from `skyBot`, which is also the horizon colour above the sea) would let underwater scenes keep the gaps dark.

## 3. Small held things and worn things

The dossier has lookouts in red dark-adaptation goggles before a night watch, and men stripped to shorts in the heat. There is no goggles prop and no shorts in the costume keys. Requests: a `goggles` costume key (colour) and `bottom: 'shorts'`. The scene labels the goggles in the follow panel instead.

## 4. A prone crawl

Men read battery cells by crawling over them with less than a metre of headroom. The scene registers `subCrawl` (based on `lie`) with `anims.register`; a general `crawl` animation, and a `crawl` link kind for the nav graph, would be useful in mines and attics too. The scene uses the `swim` link kind for the battery walkways for now.
