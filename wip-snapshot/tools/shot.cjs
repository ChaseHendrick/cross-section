#!/usr/bin/env node
/* Screenshot harness for scenes. Contributors and agents use it to look at their work.
 *
 *   node tools/shot.js <scene> [options]
 *     --out <file.png>        output path (default /tmp/xs-<scene>.png)
 *     --size 1400x900         viewport in CSS px
 *     --dpr 1                 device pixel ratio
 *     --hour 10.5             time of day
 *     --zoom x,y,w[,z]        centre on scene point (x, y, depth z) showing w metres across
 *     --angle yaw,pitch       camera angle in radians (default: the scene's book view)
 *     --cuts 40,80 --open     place cuts and open the slices
 *     --wait 2500             ms to let the scene run before capture
 *     --labels off            hide captions
 *     --select "Name"         follow a named person
 *     --weather rain          clear, rain, storm, fog or snow
 *     --spec shots.json       many shots in one browser: [{scene, hour, zoom, angle, out, wait, cuts, open, labels, select}]
 *     --file dist/cross-sections.html   test the portable build instead of the folder
 *     --timeout 120           seconds allowed for loading and for each screenshot (default 120); a shot
 *                             that times out is reported and skipped, and the rest of a --spec still runs
 *
 * Prints one JSON line of stats per shot and any console errors; exits 1 on errors.
 * Needs playwright or playwright-core (npm install) and a Chromium. Set CHROMIUM_PATH to a
 * browser binary if Playwright's own download is not installed.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const http = require('http');

function loadPW() {
  for (const m of ['playwright', 'playwright-core']) { try { return require(m); } catch (e) { /* next */ } }
  console.error('Playwright is not installed. Run: npm install   (playwright-core is a dev dependency)');
  process.exit(2);
}

function args() {
  const a = process.argv.slice(2);
  const o = {};
  for (let i = 0; i < a.length; i++) {
    const k = a[i], v = () => a[++i];
    if (k === '--out') o.out = v();
    else if (k === '--size') o.size = v();
    else if (k === '--dpr') o.dpr = parseFloat(v());
    else if (k === '--hour') o.hour = parseFloat(v());
    else if (k === '--zoom') o.zoom = v().split(',').map(Number);
    else if (k === '--angle') o.angle = v().split(',').map(Number);
    else if (k === '--cuts') o.cuts = v().split(',').filter(Boolean).map(Number);
    else if (k === '--open') o.open = true;
    else if (k === '--wait') o.wait = parseInt(v(), 10);
    else if (k === '--labels') o.labels = v() !== 'off';
    else if (k === '--select') o.select = v();
    else if (k === '--weather') o.weather = v();
    else if (k === '--spec') o.spec = JSON.parse(fs.readFileSync(v(), 'utf8'));
    else if (k === '--file') o.file = v();
    else if (k === '--timeout') o.timeout = parseFloat(v());
    else if (!k.startsWith('--')) o.scene = k;
  }
  return o;
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
function serve(root) {
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

async function main() {
  const o = args();
  const pw = loadPW();
  const root = path.resolve(__dirname, '..');
  const srv = await serve(root);
  const base = 'http://127.0.0.1:' + srv.address().port + '/' + (o.file || 'index.html');
  const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const shots = o.spec || [Object.assign({}, o)];
  let failures = 0;
  for (const s0 of shots) {
    const s = Object.assign({}, o, s0, { spec: undefined });
    const [W, H] = (s.size || '1400x900').split('x').map(Number);
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: s.dpr || 1 });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String((e && e.stack) || e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    const q = [];
    if (s.cuts) q.push('cuts=' + s.cuts.join(','));
    if (s.open) q.push('open=1');
    if (s.hour != null) q.push('h=' + s.hour);
    if (s.weather) q.push('w=' + s.weather);
    await page.goto(base + '?nocontents' + (s.scene && !s.all ? '&only=' + s.scene : '') + (s.scene ? '#' + s.scene + (q.length ? '?' + q.join('&') : '') : ''));
    try {
      await page.waitForFunction(() => window.XS && XS.app && XS.app.stage && XS.app.stage.world, null, { timeout: (s.timeout || 120) * 1000 });
    } catch (e) {
      console.log((s.out || 'shot'), 'FAILED to load', errors.length ? '\n  ' + errors.join('\n  ') : '');
      failures++; await ctx.close(); continue;
    }
    await page.evaluate((s) => {
      const st = XS.app.stage;
      if (s.hour != null) st.world.hour = s.hour;
      if (s.labels === false) { st.showLabels = false; }
      const cam = st.camera;
      if (s.angle) { cam.yaw = s.angle[0]; cam.pitch = s.angle[1]; }
      if (s.zoom) {
        const t = Math.tan((cam.cam.fov * Math.PI) / 360);
        cam.target.set(s.zoom[0], s.zoom[1], -(s.zoom[3] || 0));
        cam.dist = s.zoom[2] / 2 / (t * cam.cam.aspect);
        cam.fly = null; cam.zoom = null;
      } else if (s.angle) cam.fit(st.fitBox(), 0.92, true);
      if (s.select) { const p = st.world.people.find((q) => q.name === s.select); if (p) st.select(p); }
    }, s);
    await page.waitForTimeout(s.wait || 2500);
    const out = s.out || '/tmp/xs-' + (s.scene || 'default') + '.png';
    try {
      await page.screenshot({ path: out, timeout: (s.timeout || 120) * 1000 });
    } catch (e) {
      console.log(out, 'TIMED OUT after ' + (s.timeout || 120) + ' s (the machine may be busy; try a smaller --size or a longer --timeout)');
      failures++; await ctx.close(); continue;
    }
    const stats = await page.evaluate(() => { const st = XS.app.stage; return { fps: Math.round(st.fps), tris: st.stats.tris, buildMs: Math.round(st.stats.buildMs), setupMs: Math.round(st.stats.setupMs || 0), people: st.world.people.length, cpuMs: +st.stats.drawMs.toFixed(1), calls: st.renderer.info.render.calls, dist: +st.camera.dist.toFixed(1), hour: +st.world.hour.toFixed(2) }; });
    console.log(out, JSON.stringify(stats), errors.length ? 'ERRORS:\n  ' + errors.slice(0, 8).join('\n  ') : '');
    if (errors.length) failures++;
    await ctx.close();
  }
  await browser.close();
  srv.close();
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
