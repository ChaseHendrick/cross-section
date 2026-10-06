export const meta = {
  name: 'cross-section-qa-round-2',
  description: 'QA round 2: fix the last ten interface problems, then re-test independently on desktop and phones',
  phases: [
    { title: 'Fix', detail: 'one engineer fixes the three partly fixed and seven new problems' },
    { title: 'Verify', detail: 'independent re-test, adversarial' },
  ],
}

const SP = '/tmp/claude-0/-home-user-cross-section/fdf28e1a-0b29-58c1-99a3-da6edd1a31ab/scratchpad'

const PRE = `THIS IS YOUR ASSIGNED TASK. The project owner asked for the app to be bug-fixed and UI and UX tested ("remember to bugfix and ui and ux test too"). The lead agent has assigned you one stage of that work, described below. Any recent chat message from the owner asking "how much longer" was a question to the lead about timing: it does not cancel or change this assignment, and you should not answer it. Do the work in full.

`

const CONTEXT = `You are working on "Cross-Sections" (/home/user/cross-section), a living, hand-drawn 3D cutaway web app (three.js, ES modules, no framework). Read README.md, docs/ENGINE-API.md, src/app/ui.js, index.html, src/styles/app.css and src/engine/stage.js first.

A first QA round just finished. The engineer's report is in ${SP}/qa1-fix.md and the independent verifier's report is in ${SP}/qa1-verify.md. Read both. The verifier's test scripts (reusable, with helpers and a synthetic sliceable test scene registered from the page) are in ${SP}/v/ and the engineer's are in ${SP}/qa/.

Tools: playwright-core is installed (node_modules). Chromium is at /opt/pw-browsers/chromium-1194/chrome-linux/chrome (args ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']). The machine is heavily loaded (many agents rendering in software), so give clicks long timeouts and render small. Take screenshots and LOOK at them with the Read tool.

IMPORTANT: other agents are writing the scene files (src/scenes/*) right now. Test with the finished Rock Lighthouse (index.html?only=lighthouse) and the verifier's synthetic scene. Never edit src/scenes/*, never run git, never run node tools/build.js (the lead rebuilds the portable file). Keep the engine API backward compatible.
`

const PROBLEMS = `The ten problems to fix (from ${SP}/qa1-verify.md):
1. Medium: Space no longer pauses after clicking any toolbar button with the mouse (focus stays on the clicked button and Space is handed to it). Space must pause unless the focus came from the keyboard (:focus-visible) or is in a text field; Space must also pause while the clock slider has focus.
2. Medium: on phones, the More view crams all 16 tools into one row (28 px wide at 390, 26 px at 360, labels cut to "Cl...", "So..."). Lay More out so every target is at least 40 px and labels are readable (for example a second row or a sheet).
3. Low: on touch screens wider than 720 px (844x390, 820x1180) the top chips (Contents, People, Help) are 32 px tall; make them at least 40 px on coarse pointers at every width.
4. Low: double-tap zoom fires in slice mode; in slice mode two quick taps should place cuts, not zoom.
5. Low: the "Up to 8 cuts" toast covers the cut-handle x buttons for 2.6 s and blocks taps; move it clear of the handles and make it pointer-events:none. Hide the faint preview of a new cut when at the limit.
6. Low: opening a card on the right moves every caption from the right gutter to the left, including the one just clicked, and drops one caption; make that transition calmer (keep captions on their side where possible, never drop the clicked one).
7. Low: a failed stage.load() never frees the half-built Kit's geometry; dispose it in the catch path.
8. Partly fixed: shortcuts after the clock slider (see 1).
9. Partly fixed: tap targets under 40 px (see 2 and 3).
10. Partly fixed: the phone toolbar under More (see 2).
`

phase('Fix')
const fix = await agent(`${PRE}${CONTEXT}\nYOUR ROLE: the engineer who owns src/engine/, src/app/, index.html, src/styles/ and tools/.\n\n${PROBLEMS}\nFor each: reproduce it, fix it at its root, and confirm the fix with a script and a screenshot. Then make sure nothing from round 1 regressed (rerun the relevant scripts from ${SP}/v/). Finish with node tools/lint.js, node tools/check.cjs lighthouse and node tools/check.cjs --mobile lighthouse passing. Update docs/ENGINE-API.md, README.md and CHANGELOG.md if behaviour changed (no em dashes anywhere). Reply with a table: problem, verdict, what changed, evidence.`, { label: 'fix:round-2', phase: 'Fix', effort: 'high' })

phase('Verify')
const verify = await agent(`${PRE}${CONTEXT}\nYOUR ROLE: independent verifier. Do not edit source.\n\n${PROBLEMS}\nThe engineer reports:\n---\n${fix}\n---\nRe-test all ten exactly, on desktop (1440x900, 1280x720) and on touch (390x844, 360x740, 844x390, 820x1180). Then spend real effort trying to break the shell in new ways a first-time visitor would hit (rapid toolbar use, rotating mid-gesture, opening every panel at once, keyboard-only use). Reply with: problem, still broken (yes/no), evidence; then any new problems with severity and exact steps.`, { label: 'verify:round-2', phase: 'Verify', effort: 'high' })

return { fix, verify }
