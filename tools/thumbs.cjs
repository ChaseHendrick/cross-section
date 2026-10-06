#!/usr/bin/env node
/* Render a thumbnail of each subject for the contents page: gallery/<id>.jpg (880 x 440).
 *
 *   node tools/thumbs.cjs [ids...]
 *
 * Each scene may set thumb: { hour, zoom: [x, y, w, z], angle: [yaw, pitch] } to choose its view.
 * Run node tools/build.js afterwards to embed the thumbnails in the portable edition.
 */
'use strict';
const path = require('path');
const fs = require('fs');
const root = path.resolve(__dirname, '..');
const only = process.argv.slice(2);
let pw;
for (const m of ['playwright', 'playwright-core']) { try { pw = require(m); break; } catch (e) { /* next */ } }
if (!pw) { console.error('npm install first'); process.exit(2); }
const http = require('http');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
(async () => {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const f = path.join(root, u === '/' ? 'index.html' : u);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/index.html';
  const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p));
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 880, height: 440 } });
  const page = await ctx.newPage();
  await page.goto(base + '?nocontents');
  await page.waitForFunction(() => window.XS && XS.app && XS.app.stage, null, { timeout: 60000 });
  const ids = (await page.evaluate(() => XS.scenes.list.filter((s) => !s.hidden && !s.placeholder).map((s) => s.id))).filter((id) => !only.length || only.includes(id));
  for (const id of ids) {
    const p2 = await ctx.newPage();
    await p2.goto(base + '?nocontents&only=' + id + '#' + id);
    await p2.waitForFunction(() => window.XS && XS.app && XS.app.stage && XS.app.stage.world, null, { timeout: 90000 });
    await p2.addStyleTag({ content: '.masthead,.topnav,.toolbar,.slicebar,.card,.tourcard,.hud{display:none!important}' });
    await p2.evaluate(() => {
      const st = XS.app.stage, s = st.scene, th = s.thumb || {};
      st.showLabels = false;
      st.world.hour = th.hour != null ? th.hour : 16.5;
      st.world.clockRate = 0;
      const cam = st.camera;
      if (th.angle) { cam.yaw = th.angle[0]; cam.pitch = th.angle[1]; }
      cam.fit(st.fitBox(), 0.96, true);
      if (th.zoom) { const t = Math.tan((cam.cam.fov * Math.PI) / 360); cam.target.set(th.zoom[0], th.zoom[1], -(th.zoom[3] || 0)); cam.dist = th.zoom[2] / 2 / (t * cam.cam.aspect); }
    });
    await p2.waitForTimeout(3000);
    const out = path.join(root, 'gallery', id + '.jpg');
    await p2.screenshot({ path: out, type: 'jpeg', quality: 80 });
    console.log('wrote', path.relative(root, out), Math.round(fs.statSync(out).size / 1024) + ' KB');
    await p2.close();
  }
  const all = fs.readdirSync(path.join(root, 'gallery')).filter((f) => /^[a-z0-9-]+\.jpg$/.test(f)).map((f) => f.replace(/\.jpg$/, '')).sort();
  fs.writeFileSync(path.join(root, 'gallery', 'index.json'), JSON.stringify(all) + '\n');
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
