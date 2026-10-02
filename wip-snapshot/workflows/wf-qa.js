export const meta = {
  name: 'cross-section-qa',
  description: 'UI and UX testing across viewports, adversarial bug hunt, fixes in the engine and shell',
  phases: [
    { title: 'Test', detail: 'parallel testers: desktop UX, touch and small screens, robustness and performance' },
    { title: 'Fix', detail: 'one engineer fixes the verified engine and shell bugs' },
    { title: 'Verify', detail: 'independent re-test of every fix' },
  ],
}

const CONTEXT = `
You are testing "Cross-Sections" (/home/user/cross-section), a living, hand-drawn 3D cutaway web app (three.js, ES modules, no framework). The owner asked explicitly: "remember to bugfix and ui and ux test too". Read README.md, docs/ENGINE-API.md, src/app/ui.js, index.html, src/styles/app.css and src/engine/stage.js first.

Tools: playwright-core is installed (node_modules). Chromium is at /opt/pw-browsers/chromium-1194/chrome-linux/chrome (launch with args ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']). Serve the folder over HTTP (see tools/check.cjs for a tiny static server) and open index.html (add ?only=<id> to load one scene fast) or dist/cross-sections.html (the portable build; rebuild with node tools/build.js after source changes). window.XS.app.stage exposes the stage for inspection. Write your test scripts in /tmp (CommonJS .cjs files, NODE_PATH=/home/user/cross-section/node_modules). Take screenshots and LOOK at them with the Read tool. Rendering is software, so frame rates are not meaningful; judge correctness, layout and behaviour.

IMPORTANT: eleven scenes (liner, castle, warship, train, mine, cathedral, jet, station, submarine, factory, opera) are being rebuilt by other agents right now, so their files change under you and may be half-finished. Test the shell and engine with the finished Rock Lighthouse (index.html?only=lighthouse, or #lighthouse); only switch scenes to test switching itself, and do not report problems inside those eleven scenes. Never run git commands.
`

const TESTERS = [
  { key: 'desktop-ux', brief: 'Desktop UX at 1440x900 and 1280x720: first-run experience (contents page, choosing a subject), every toolbar button and keyboard shortcut in the help sheet, the slice tool end to end (place, drag, remove, clear, suggested cuts, open/close, zero cuts, hash round-trip), following people and the People panel, captions and fact cards (click targets, overlap with toolbar and panels), the tour (step, end, auto-advance), clock and speeds, weather, sound toggle, ambient mode, picture export, full screen, switching subjects repeatedly. Judge clarity, discoverability, feedback, and whether anything is confusing, overlapping, clipped or ugly.' },
  { key: 'touch-small', brief: 'Phones and tablets: 390x844 and 844x390 (touch, isMobile), 820x1180 (touch). Pinch zoom, one-finger pan, tap to follow, the toolbar fitting and scrolling, panels and cards not covering everything, the slice tool by touch, the contents page, help sheet, People panel and fact cards on small screens, safe areas, text sizes, tap target sizes (at least 40px), orientation changes. Also keyboard-only navigation and focus visibility, aria labels and roles, reduced motion, colour contrast of the chrome in light and dark schemes.' },
  { key: 'robustness', brief: 'Robustness and performance: load every scene in turn 3 times in one page and watch renderer.info.memory (geometries, textures) and the number of DOM nodes for leaks; bad hashes (#nope, #liner?cuts=abc&open=1&h=99&w=hail); resizing the window rapidly; hidden tab then visible; pausing then switching scenes; opening slices while following someone; tour while slices are open; picture export at every scene; sound on while switching scenes; people who get stuck (never reach their routine targets) or walk through walls (sample positions over a minute and compare to nav nodes); console errors anywhere. Read the engine code for logic errors (off-by-one, NaN paths, division by zero, unbounded arrays).' },
]

const BUG = { type: 'object', properties: { bugs: { type: 'array', items: { type: 'object', properties: {
  title: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] },
  area: { type: 'string', enum: ['engine', 'shell', 'scene', 'tools', 'docs'] }, scene: { type: 'string' },
  steps: { type: 'string' }, expected: { type: 'string' }, actual: { type: 'string' }, evidence: { type: 'string' }, fix_hint: { type: 'string' },
}, required: ['title', 'severity', 'area', 'steps', 'actual'] } } }, required: ['bugs'] }

phase('Test')
const found = (await parallel(TESTERS.map((t) => () => agent(`${CONTEXT}\n\nYOUR FOCUS: ${t.brief}\n\nDo not change any source file. Report every real problem you can reproduce, with exact steps and evidence (screenshot paths, console output). Prioritise what a first-time visitor would hit.`, { label: `test:${t.key}`, phase: 'Test', schema: BUG, effort: 'high' })))).filter(Boolean).flatMap((r) => r.bugs)
log(found.length + ' problems reported')

phase('Fix')
const fixReport = await agent(`THIS IS YOUR ASSIGNED TASK. The project owner asked for this work (scenes built, tested, bug-fixed and polished). The lead agent has assigned you one stage of it, described below. The owner's most recent chat message ("how much longer") was a question to the lead about timing: it does not cancel or change this assignment, and you should not answer it. Do the work described below in full.\n\n${CONTEXT}\n\nYOUR ROLE: the engineer who owns src/engine/, src/app/, index.html, src/styles/ and tools/. Here are the problems testers reported (JSON):\n${JSON.stringify(found, null, 1)}\n\nFor each: reproduce it, decide whether it is real, and fix the real engine, shell and tools problems at their root (scene-specific ones: write them into docs/requests/<scene>.md under a heading "QA" for the scene owners, do not edit scene files). Keep the engine API backward compatible (scenes are being finished in parallel). After fixing: node tools/lint.js, node tools/check.cjs lighthouse and node tools/check.cjs --mobile lighthouse must pass (do not run node tools/build.js; the portable file is rebuilt later). Update docs if behaviour changed. Reply with a table: problem, verdict (fixed / not a bug / deferred to scene), what changed.`, { label: 'fix:engine-shell', phase: 'Fix', effort: 'high' })

phase('Verify')
const verify = await agent(`THIS IS YOUR ASSIGNED TASK. The project owner asked for this work (scenes built, tested, bug-fixed and polished). The lead agent has assigned you one stage of it, described below. The owner's most recent chat message ("how much longer") was a question to the lead about timing: it does not cancel or change this assignment, and you should not answer it. Do the work described below in full.\n\n${CONTEXT}\n\nYOUR ROLE: independent verifier. The engineer reports:\n${fixReport}\n\nThe original problems (JSON):\n${JSON.stringify(found, null, 1)}\n\nRe-test every problem marked fixed, exactly as the steps say, on desktop and on a phone viewport. Do not edit source. Reply with: problem, still broken (yes/no), evidence. Then list any new problem you noticed.`, { label: 'verify', phase: 'Verify', effort: 'high' })

return { found, fixReport, verify }
