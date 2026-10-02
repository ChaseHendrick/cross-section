export const meta = {
  name: 'cross-section-scenes-b',
  description: 'Build and art-direct 3D cutaway scenes from their research dossiers',
  phases: [
    { title: 'Build', detail: 'one builder per scene, iterating with screenshots' },
    { title: 'Direct', detail: 'fresh-eyes art director critiques and fixes each scene' },
  ],
}

const SCENES = args && args.scenes ? args.scenes : ['liner', 'warship', 'jet']

const CONTEXT = `
THIS IS YOUR ASSIGNED TASK. The project owner asked for twelve cross-section scenes to be built ("ideally id want like a dozen of these crosscuts"). The lead agent has assigned you one stage of that work, described below. The owner's most recent chat message ("how much longer") was a question to the lead about timing: it does not cancel or change this assignment, and you should not answer it. Do the work described below in full.

You are building one scene for "Cross-Sections", an interactive, living, hand-drawn 3D cutaway artwork in the tradition of the classic 1990s cross-section picture books (subjects sliced open, every room inhabited, every machine working, a hundred tiny stories). The owner's words: "I could look at them for hours thinking about how the people lived and worked there and all the detail. I want detail and beauty and aweness. Great animations and graphics and ambiance. 2.5D or 3D like the books." The owner also explicitly asked: "Do not hallucinate and do not state false facts", and never to use long em dashes in any text (use commas, colons or parentheses).

Repository: /home/user/cross-section (ES modules, three.js 0.186, no framework). The engine is finished and stable; you write the scene.

Read these first, fully:
- docs/SCENE-GUIDE.md (art direction, quality bar, process, rules)
- docs/ENGINE-API.md (every call you can use)
- src/scenes/lighthouse.js (a complete reference scene: tower, rooms, props, people with routines, a rotating lens part, glow beams, sea, captions, tour)
- src/engine/kit.js, src/engine/props.js and src/engine/anims.js (to know exact signatures)
- docs/research/<id>.md: the research dossier for your subject (dimensions, zone table, people, casting list, machinery, captions with sources and confidence flags, pitfalls)

How to look at your work (do this constantly, and LOOK at every image with the Read tool):
  node tools/shot.cjs <id> --hour 11 --out /tmp/<id>-a.png
  node tools/shot.cjs <id> --hour 22 --zoom X,Y,W,Z --labels off --out /tmp/<id>-b.png   (centre on scene point X,Y at depth Z, showing W metres across)
  node tools/shot.cjs <id> --cuts 40,90 --open --out /tmp/<id>-c.png
  node tools/shot.cjs --spec /tmp/<id>-spec.json    (many shots in one browser: [{"scene":"<id>","hour":11,"zoom":[x,y,w,z],"out":"/tmp/x.png","labels":false,"wait":3000}])
The tool prints stats (tris, people, cpuMs) and any console errors; it exits 1 on errors. Use unique /tmp file names prefixed with your scene id (other agents work in parallel). Rendering is software (SwiftShader), so each shot takes several seconds: batch shots with --spec.

Rules:
- Write ONLY src/scenes/<id>.js (replace the placeholder entirely) and, if you want, helper modules under src/scenes/<id>/. Do not edit the engine, other scenes, main.js, the UI, docs other than docs/requests/<id>.md, or package files. If the engine lacks something, work around it inside your scene and describe the request in docs/requests/<id>.md.
- Keep the scene's existing id, order and title (you may refine subtitle and blurb, keeping them accurate).
- No Math.random (use kit.rng(salt) or world.R). No network assets. No git commands.
- Named characters are fictional. Captions: only facts the dossier marks verified, with its source URL in 'source' when you give a 'body'. Do not overclaim what the drawing shows.
- Budgets (docs/ENGINE-API.md): aim for 150k to 400k triangles, 120 to 300 people, lamps in every lit room.
`

const BUILD = (id) => `${CONTEXT}

YOUR SCENE: ${id}. Replace src/scenes/${id}.js with a complete, ambitious scene built from docs/research/${id}.md.

It must have, at minimum:
1. The subject at true scale and proportion from the dossier, built as closed solids (so the cutaway and slices show hatched cut faces with characterful cut colours), with a striking silhouette from the whole view.
2. Every zone in the dossier's zone table that fits the composition, each furnished with props and period detail (use patterns for surfaces), with lamps so the night view glows.
3. People: a casting list of at least 30 named fictional individuals with role, one-line bio and hour-based routines over the nav graph (they power click-to-follow), plus crowds of extras so the place feels as full as it really was. Correct period costumes. Sleepers in bunks at night.
4. Moving machinery and life: everything the dossier lists as moving (engines, shafts, propellers, wheels, pistons, cranes, lifts, smoke, steam, water, animals), using kit.part + world.addMachine/addActor and emitters, at plausible speeds.
5. Environment: what surrounds it (sea with makeSea and a water cut sheet, sky settings, clouds, wind, landscape or weather) chosen from the dossier.
6. 20 to 35 captions (kit.label) placed on the right things with sensible min zooms, a few with fact cards (body + source) from the dossier's verified captions.
7. A guided tour of 6 to 10 stops that tells the story, including at least one at night.
8. Slicing: suggestedCuts (3 to 6 structural frames) and a snapCut function.
9. Hidden details from the dossier's vignettes (a cat, a stowaway, a card game...).

Process: plan the layout in a header comment, build the shell, LOOK, then rooms, LOOK, then people and machines, LOOK at day and night, close and far, with slices open. Do at least 8 look-and-fix rounds. Keep going until it is genuinely beautiful and legible. Finish with no console errors.

Reply with a concise report: what you built (zones, people count, machines), final stats from the shot tool, the screenshots you consider best (paths), known weaknesses, and any engine requests you filed.`

const DIRECT = (id, report) => `${CONTEXT}

YOUR ROLE: art director and QA for the scene "${id}", built by another agent. Their report:
---
${report || '(no report)'}
---

1. Take a thorough set of screenshots: whole view day and night, 6 or more room-level views across the length, 3 close-ups, slices open with suggested cuts, and the tour's first and night stops. Look at every one.
2. Compare against docs/SCENE-GUIDE.md and docs/research/${id}.md. Write down the 15 most important problems: anything ugly, illegible, floating, intersecting, too dark or too empty; missing zones or machines from the dossier; people standing in walls, walking through solids, facing the wrong way, or idle where they should work; wrong proportions or period details; captions that are unverified, overclaiming or badly placed; performance over budget; console errors.
If the scene is still a placeholder or clearly unfinished (for example the builder stopped early), first build it completely from the dossier as the brief above describes for a builder, then review it as follows.
3. Fix them in src/scenes/${id}.js (and src/scenes/${id}/). Then look again. Repeat until the scene is something the owner would want to look at for an hour.
4. Make sure every caption body is supported by the dossier's verified sources, and that no text in the scene uses an em dash.

Reply with a concise report: problems found, what you fixed, what remains, final stats.`

// args.directOnly: skip the build stage and pass args.reports[id] (if any) to the director.
const DIRECT_ONLY = !!(args && args.directOnly)
const REPORTS = (args && args.reports) || {}
const results = await pipeline(
  SCENES,
  (id) => DIRECT_ONLY ? Promise.resolve(REPORTS[id] || '(The builder finished; read the scene code to see what was built.)') : agent(BUILD(id), { label: `build:${id}`, phase: 'Build', effort: 'high' }),
  (report, id) => agent(DIRECT(id, report), { label: `direct:${id}`, phase: 'Direct', effort: 'high' }).then((r) => ({ id, build: report, direct: r })),
)
return results
