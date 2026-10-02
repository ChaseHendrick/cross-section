#!/usr/bin/env node
/* Browser smoke and interaction test for every subject.
 *
 *   node tools/check.cjs                 every scene in the folder edition
 *   node tools/check.cjs liner castle    named scenes
 *   node tools/check.cjs --dist          the portable dist/cross-sections.html
 *   node tools/check.cjs --mobile        a 390 x 844 touch viewport
 *   node tools/check.cjs --full-quality  render at full scale (slower; the default is half scale)
 *
 * For each scene: load, run, follow a person, place a cut and open the slices (when the
 * scene can be sliced), start and step the tour, toggle captions and sound, save a picture,
 * open the contents and help. Fails on any console error or page error, and on budgets.
 *
 * Software rendering on a busy machine can take a second or more per frame, and Playwright
 * waits for frames before it clicks, so the checks render at half scale and wait patiently.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');

let pw;
for (const m of ['playwright', 'playwright-core']) { try { pw = require(m); break; } catch (e) { /* next */ } }
if (!pw) { console.error('Install the dev dependencies first: npm install'); process.exit(2); }

const argv = process.argv.slice(2);
const DIST = argv.includes('--dist');
const MOBILE = argv.includes('--mobile');
const QUALITY = argv.includes('--full-quality') ? '' : '&quality=0.5';
const CLICK = { timeout: 120000 };
const only = argv.filter((a) => !a.startsWith('--'));
const root = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png' };

function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const f = path.join(root, u === '/' ? 'index.html' : u);
      if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

(async () => {
  const srv = await serve();
  const base = 'http://127.0.0.1:' + srv.address().port + '/' + (DIST ? 'dist/cross-sections.html' : 'index.html');
  const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const viewport = MOBILE ? { width: 390, height: 844 } : { width: 1280, height: 800 };
  // Discover scenes.
  let ctx = await browser.newContext({ viewport });
  let page = await ctx.newPage();
  await page.goto(base + '?nocontents');
  await page.waitForFunction(() => window.XS && XS.app && XS.app.stage, null, { timeout: 60000 });
  const all = await page.evaluate(() => XS.scenes.list.filter((s) => !s.hidden).map((s) => ({ id: s.id, slice: s.slice !== false, placeholder: !!s.placeholder })));
  await ctx.close();
  const scenes = all.filter((s) => !only.length || only.includes(s.id));
  const report = [];
  let failed = 0;
  for (const sc of scenes) {
    ctx = await browser.newContext({ viewport, hasTouch: MOBILE, isMobile: MOBILE });
    page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String((e && e.stack) || e).split('\n')[0]));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    const t0 = Date.now();
    await page.goto(base + '?nocontents' + QUALITY + (DIST ? '' : '&only=' + sc.id) + '#' + sc.id);
    let ok = true, stats = null;
    try {
      await page.waitForFunction(() => window.XS && XS.app && XS.app.stage && XS.app.stage.world, null, { timeout: 90000 });
      await page.waitForTimeout(2500);
      stats = await page.evaluate(() => { const st = XS.app.stage; return { tris: st.stats.tris, people: st.world.people.length, buildMs: Math.round(st.stats.buildMs), labels: st.world.labels.length, tour: st.world.tour.length, lamps: st.lamps.length }; });
      // Interactions.
      const click = (sel) => page.click(sel, CLICK);
      // On a phone the secondary tools sit behind More.
      if (await page.locator('#bMore').isVisible()) await click('#bMore');
      await click('#bLabels'); await click('#bLabels');
      await page.evaluate(() => { const st = XS.app.stage; const p = st.world.people.find((q) => q.name) || st.world.people[0]; if (p) st.select(p); });
      await page.waitForTimeout(800);
      await page.keyboard.press('Escape');
      const shell = await page.evaluate(() => ({ sel: !!XS.app.stage.selected, card: document.getElementById('card').classList.contains('on') }));
      if (shell.sel || shell.card) errors.push('harness: Esc did not let the followed person go');
      if (sc.slice) {
        await page.evaluate(() => { const st = XS.app.stage; const b = st.scene.bounds; st.setCuts(st.suggestedCuts().length ? st.suggestedCuts() : [(b.x0 + b.x1) / 2]); st.setOpen(true); });
        await page.waitForTimeout(1600);
        await page.evaluate(() => { XS.app.stage.setOpen(false); XS.app.stage.clearCuts(); });
      }
      if (!sc.slice) {
        // A subject shown whole ignores cuts, from the API and from a shared link.
        const n = await page.evaluate(() => { const st = XS.app.stage; st.setCuts([0]); return st.cuts.length; });
        if (n) errors.push('harness: a subject with slice:false accepted a cut');
      }
      if (stats.tour) {
        await click('#bTour'); await page.waitForTimeout(600); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.press('Escape');
        const t = await page.evaluate(() => ({ i: XS.app.stage.tourIndex, card: document.getElementById('tourcard').classList.contains('on') }));
        if (t.i >= 0 || t.card) errors.push('harness: Esc did not end the tour');
      }
      await click('#bSound'); await page.waitForTimeout(400); await click('#bSound');
      await page.evaluate(() => { XS.app.stage.world.hour = 22; });
      await page.waitForTimeout(500);
      await page.evaluate(() => { const c = XS.app.stage.snapshot(1); if (!c || !c.width) throw new Error('snapshot failed'); });
      await click('#openContents'); await page.keyboard.press('Escape');
      await click('#openHelp'); await page.keyboard.press('Escape');
      const open = await page.evaluate(() => ['contents', 'help'].filter((id) => document.getElementById(id).classList.contains('on')));
      if (open.length) errors.push('harness: Esc left ' + open.join(' and ') + ' open');
    } catch (e) { ok = false; errors.push('harness: ' + String(e.message || e).split('\n')[0]); }
    const budget = [];
    if (stats && stats.tris > 900000) budget.push('triangles ' + stats.tris + ' > 900000');
    if (stats && stats.people > 450) budget.push('people ' + stats.people + ' > 450');
    const pass = ok && !errors.length && !budget.length;
    if (!pass) failed++;
    report.push({ id: sc.id, pass, ms: Date.now() - t0, stats, errors: errors.slice(0, 6), budget });
    console.log((pass ? 'ok   ' : 'FAIL ') + sc.id.padEnd(12) + JSON.stringify(stats) + (errors.length ? '\n     ' + errors.slice(0, 6).join('\n     ') : '') + (budget.length ? '\n     ' + budget.join('; ') : ''));
    await ctx.close();
  }
  await browser.close();
  srv.close();
  console.log(failed ? failed + ' of ' + scenes.length + ' failed' : 'all ' + scenes.length + ' passed' + (MOBILE ? ' (mobile)' : '') + (DIST ? ' (portable edition)' : ''));
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
