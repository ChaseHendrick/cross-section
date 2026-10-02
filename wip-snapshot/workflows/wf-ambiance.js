export const meta = {
  name: 'cross-section-ambiance',
  description: 'Per scene, one agent: soundscape, living motion, night light and weather, then verify every caption against its source',
  phases: [
    { title: 'Ambiance', detail: 'sound designer, animator and lighting director per scene' },
  ],
}

const SCENES = args && args.scenes ? args.scenes : []

const CONTEXT = `
THIS IS YOUR ASSIGNED TASK. The project owner asked for this work (scenes built, tested, bug-fixed and polished). The lead agent has assigned you one stage of it, described below. The owner's most recent chat message ("how much longer") was a question to the lead about timing: it does not cancel or change this assignment, and you should not answer it. Do the work described below in full.

You are working on "Cross-Sections" (/home/user/cross-section), a living, hand-drawn 3D cutaway artwork in the tradition of 1990s cross-section picture books. The owner wants "detail and beauty and aweness", "great animations and graphics and ambiance", and insists: "Do not hallucinate and do not state false facts" and no em dashes in any text.

Read docs/SCENE-GUIDE.md and docs/ENGINE-API.md first (note the Sound section: scene.ambience and world.sound(...); the Weather toolbar; physics via world.physics()), then the scene's code (src/scenes/<id>.js and src/scenes/<id>/) and its dossier docs/research/<id>.md (sections 6 Machinery, 7 Environment and ambient sounds, 9 Hidden details).

Look at your work: node tools/shot.cjs <id> [--hour H] [--zoom x,y,w,z] [--weather rain|storm|fog|snow] [--cuts a,b --open] [--labels off] --out /tmp/<id>-<name>.png ; or --spec /tmp/<id>-spec.json for many shots. LOOK at every image with the Read tool. Run node tools/check.cjs <id> at the end; it must pass.

Rules: edit only src/scenes/<id>.js and src/scenes/<id>/. Engine requests go in docs/requests/<id>.md. No Math.random, no network assets, no git.
`

const AMB = (id) => `${CONTEXT}

YOUR ROLE: sound designer, animator and lighting director for the scene "${id}".

1. Soundscape: set scene.ambience (beds: sea, wind, rain, crowd, room; reverb and room size fitting the space) and add 8 to 25 world.sound(...) point sources placed on the real sound makers from the dossier (engines, boilers, fires, machinery rhythms tied to the machines' actual speeds, bells striking the hours or ship's bells, music where music was played, crowds in public rooms, gulls, creaks, drips, clocks). Use 'when' so sounds follow the routine (a dance band in the evening, a galley clatter at mealtimes).
2. Living motion: make sure everything that should move moves, at plausible speeds: smoke and steam from every chimney, funnel, vent and kettle; flags and pennants; water (spray, wakes, bubbles, drips); birds by day; swinging lamps or hanging things (world.physics() hinge is available); flickering fires; animals. Add small looped vignettes that reward zooming in. Keep budgets.
3. Night: the night view must be the most beautiful view. Every lit room has a lamp; windows and portholes glow; fires always on; check that no room is pitch black at night unless it should be (a coal hold). Tune lamp colours (oil and candle amber, electric warmer white), reach and intensity.
4. Weather: choose a sensible default (scene.weather, usually 'clear') and check the scene looks right in rain, storm, fog and snow (no precipitation should fall inside rooms; report engine issues).
5. Take before and after screenshots, day and night, close and far. Finish with node tools/check.cjs ${id} passing.

Reply with a short report: sounds added, motion added, lighting changes, weather notes, check result, any engine requests.`

const FACTS = (id, rep) => `${CONTEXT}

YOUR ROLE: fact checker for the scene "${id}". The ambiance pass reported:
---
${rep || '(no report)'}
---
1. List every caption in the scene (kit.label / world.label: title, text, body, source) and every tour stop's text, and the scene's subtitle and blurb.
2. For every factual claim: find support in docs/research/${id}.md (its sources and confidence flags). For each caption with a body and source, open the source with WebFetch (WebSearch is not available) and confirm it says what the caption says. If a source cannot be reached, find support in another source the dossier lists and switch to it, or soften the claim to what is supported, or remove the fact card.
3. Remove or rewrite anything unverified, overclaimed, anachronistic, or contradicted. Keep the voice: short, concrete, vivid. Named characters stay fictional; never attribute words or invented actions to real named people.
4. Make sure no text in the scene contains an em dash, and that node tools/lint.js and node tools/check.cjs ${id} pass.

Reply with a short table: claim, verdict (verified / softened / removed), source. Then the check results.`

// One agent per scene does both jobs, sound and life first, then the caption audit.
const out = await pipeline(
  SCENES,
  (id) => agent(AMB(id) + `\n\nWHEN THAT IS DONE, in the same session:\n` + FACTS(id, '(your own ambiance work above)').split('YOUR ROLE:')[1], { label: `polish:${id}`, phase: 'Ambiance', effort: 'high' }).then((r) => ({ id, report: r })),
)
return out
