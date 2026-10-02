/* The shell: contents page, toolbar, slice tool, clock, follow card, fact card,
 * guided tour, keyboard, link sharing through the URL hash, and picture export.
 *
 * Hash format: #<scene>?cuts=12.5,40&open=1&h=21.5
 */
import { XS, Stage } from '../engine/index.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const stage = new Stage($('stage'), $('overlay'));
XS.app = { stage };

// ------------------------------------------------------------ routing
function parseHash() {
  const h = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!h) return null;
  const [id, q] = h.split('?');
  const out = { id };
  if (q) for (const kv of q.split('&')) {
    const [k, v] = kv.split('=');
    if (k === 'cuts') out.cuts = v ? v.split(',').map(Number).filter((n) => isFinite(n)) : [];
    if (k === 'open') out.open = v === '1';
    if (k === 'h') out.hour = Math.max(0, Math.min(23.99, parseFloat(v) || 0));
  }
  return out;
}
let hashLock = false;
function writeHash() {
  if (!stage.scene) return;
  let h = '#' + stage.scene.id;
  const q = [];
  if (stage.cuts.length) q.push('cuts=' + stage.cuts.map((x) => +x.toFixed(2)).join(','));
  if (stage.explodeTarget) q.push('open=1');
  if (q.length) h += '?' + q.join('&');
  hashLock = true;
  history.replaceState(null, '', h);
  setTimeout(() => (hashLock = false), 0);
}
window.addEventListener('hashchange', () => {
  if (hashLock) return;
  const r = parseHash();
  if (r && XS.scenes.byId.has(r.id)) open(r.id, r);
});

// ------------------------------------------------------------ scenes
function open(id, opts = {}) {
  $('loading').classList.add('on');
  $('loading').textContent = 'Inking ' + (XS.scenes.byId.get(id).title || id).replace(/^The /, 'the ') + '…';
  // Let the message paint before the build blocks the thread.
  requestAnimationFrame(() => setTimeout(() => {
    try {
      stage.load(id, opts);
    } catch (e) {
      console.error(e);
      $('loading').textContent = 'This subject failed to load: ' + e.message;
      return;
    }
    $('loading').classList.remove('on');
    const s = stage.scene;
    $('sceneTitle').textContent = s.title;
    $('sceneEra').textContent = s.subtitle || '';
    document.title = s.title + ' · Cross-Sections';
    closeCard();
    tourCard(null);
    syncSlice();
    writeHash();
  }, 16));
}

function buildContents() {
  const list = $('sceneList');
  list.innerHTML = '';
  for (const s of XS.scenes.list.filter((q) => !q.hidden)) {
    const b = document.createElement('button');
    b.className = 'scene';
    const src = (window.XS_THUMBS && window.XS_THUMBS[s.id]) || s.thumb || ('gallery/' + s.id + '.jpg');
    b.innerHTML = '<img class="thumb" alt="" loading="lazy" src="' + esc(src) + '" onerror="this.style.visibility=\'hidden\'"><div class="meta"><div class="t">' + esc(s.title) + '</div><div class="e">' + esc(s.subtitle || '') + '</div><div class="d">' + esc(s.blurb || '') + '</div></div>';
    b.addEventListener('click', () => { hide('contents'); open(s.id); });
    list.appendChild(b);
  }
}
// Thumbnails are pictures rendered from each scene by tools/thumbs.js (gallery/<id>.jpg).
function paintThumbs() {}

// ------------------------------------------------------------ panels
const show = (id) => $(id).classList.add('on');
const hide = (id) => $(id).classList.remove('on');
function openContents() { show('contents'); paintThumbs(); }

let cardMode = null, cardTimer = null;
function closeCard() { hide('card'); cardMode = null; clearInterval(cardTimer); }
function personCard(p) {
  if (!p) { closeCard(); return; }
  cardMode = 'person';
  const c = $('card');
  const render = () => {
    if (stage.selected !== p) return;
    c.innerHTML = '<button class="close" aria-label="Stop following">&times;</button>' +
      '<h2>' + esc(p.name || (p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : 'Someone aboard')) + '</h2>' +
      (p.name && p.role ? '<p class="role">' + esc(p.role) + '</p>' : '') +
      (p.bio ? '<p>' + esc(p.bio) + '</p>' : '') +
      '<p class="now"><b>Now</b> &nbsp;' + esc(p.currentLabel()) + '</p>' +
      '<p class="src">Following. Drag to look away, or press Esc to let them go.</p>';
    c.querySelector('.close').onclick = () => stage.select(null);
  };
  render();
  show('card');
  clearInterval(cardTimer);
  cardTimer = setInterval(render, 700);
}
function factCard(L) {
  cardMode = 'fact';
  clearInterval(cardTimer);
  const c = $('card');
  const src = L.source ? (Array.isArray(L.source) ? L.source : [L.source]) : [];
  c.innerHTML = '<button class="close" aria-label="Close">&times;</button><h2>' + esc(L.title || '') + '</h2>' +
    '<p>' + esc(L.body || L.text || '') + '</p>' +
    (src.length ? '<p class="src">Source: ' + src.map((u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\//, '').slice(0, 60)) + '</a>').join(', ') + '</p>' : '');
  c.querySelector('.close').onclick = closeCard;
  show('card');
}
function tourCard(ev) {
  const c = $('tourcard');
  if (!ev || !ev.stop) { hide('tourcard'); $('bTour').setAttribute('aria-pressed', 'false'); return; }
  $('bTour').setAttribute('aria-pressed', 'true');
  c.innerHTML = '<div class="n">' + (ev.index + 1) + ' of ' + ev.count + '</div><h3>' + esc(ev.stop.title || '') + '</h3><p>' + esc(ev.stop.text || '') + '</p>' +
    '<div class="row"><button class="btn" id="tPrev">&larr; Back</button><button class="btn" id="tNext">Next &rarr;</button><button class="btn" id="tEnd">End tour</button></div>';
  show('tourcard');
  $('tPrev').onclick = () => stage.tourNext(-1);
  $('tNext').onclick = () => stage.tourNext(1);
  $('tEnd').onclick = () => stage.tourStop();
}

XS.bus.on('select', (e) => { if (e.person) personCard(e.person); else if (cardMode === 'person') closeCard(); });
XS.bus.on('fact', (e) => factCard(e.label));
XS.bus.on('tour', (e) => tourCard(e));
XS.bus.on('cuts', () => { syncSlice(); writeHash(); });
XS.bus.on('open', () => { syncSlice(); writeHash(); });

// ------------------------------------------------------------ slice tool
function syncSlice() {
  const n = stage.cuts.length;
  $('cutCount').textContent = n === 0 ? 'No cuts' : n === 1 ? '1 cut' : n + ' cuts';
  $('cutOpen').disabled = n === 0;
  $('cutOpen').textContent = stage.explodeTarget ? 'Close the slices' : 'Open the slices';
  $('cutClear').disabled = n === 0;
  $('cutSuggest').style.display = stage.scene && stage.scene.suggestedCuts && stage.scene.suggestedCuts.length ? '' : 'none';
  $('bOpen').disabled = n === 0;
  $('bOpen').setAttribute('aria-pressed', stage.explodeTarget ? 'true' : 'false');
  $('bSlice').setAttribute('aria-pressed', stage.sliceMode ? 'true' : 'false');
  $('slicebar').classList.toggle('on', stage.sliceMode);
}
function sliceMode(on) {
  stage.sliceMode = on;
  if (on) stage.select(null);
  syncSlice();
}
$('bSlice').onclick = () => sliceMode(!stage.sliceMode);
$('cutDone').onclick = () => sliceMode(false);
$('cutClear').onclick = () => stage.clearCuts();
$('cutSuggest').onclick = () => stage.setCuts(stage.suggestedCuts());
$('cutOpen').onclick = () => stage.setOpen(!stage.explodeTarget);
$('bOpen').onclick = () => stage.setOpen(!stage.explodeTarget);

// ------------------------------------------------------------ toolbar
$('bTour').onclick = () => (stage.tourIndex >= 0 ? stage.tourStop() : stage.tourStart());
$('bLabels').onclick = () => { stage.showLabels = !stage.showLabels; $('bLabels').setAttribute('aria-pressed', String(stage.showLabels)); };
$('bPause').onclick = () => { stage.paused = !stage.paused; $('bPause').setAttribute('aria-pressed', String(stage.paused)); };
const SPEEDS = [1, 8, 0];
let speedI = 0;
const syncSpeed = () => { const r = SPEEDS[speedI]; if (stage.world) stage.world.clockRate = r; $('clockSpeed').innerHTML = r === 0 ? 'Still' : r + '&times;'; };
$('bClock').onclick = () => { speedI = (speedI + 1) % SPEEDS.length; syncSpeed(); };
XS.bus.on('scene', () => syncSpeed());
let dragging = false;
$('hour').addEventListener('input', (e) => { dragging = true; if (stage.world) stage.world.hour = parseFloat(e.target.value); });
$('hour').addEventListener('change', () => (dragging = false));
$('bFit').onclick = () => { stage.select(null); stage.camera.fit(stage.fitBox(), 0.92, false); };
const ANGLES = [{ yaw: -0.42, pitch: 0.28, n: 'Book' }, { yaw: 0, pitch: 0.06, n: 'Level' }, { yaw: -0.65, pitch: 0.7, n: 'High' }, { yaw: 0.5, pitch: 0.3, n: 'Right' }];
let angleI = 0;
$('bAngle').onclick = () => {
  angleI = (angleI + 1) % ANGLES.length;
  const A = ANGLES[angleI];
  stage.camera.flyTo({ target: stage.camera.target.clone(), dist: stage.camera.dist, yaw: A.yaw, pitch: A.pitch }, 1.1);
  $('angleName').textContent = A.n;
};
$('bFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); };
$('bSave').onclick = savePicture;
function savePicture() {
  $('loading').textContent = 'Drawing your picture…';
  show('loading');
  setTimeout(() => {
    try {
      const c = stage.snapshot(2);
      c.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        const hh = stage.world ? stage.world.hour : 0;
        a.download = 'cross-sections-' + stage.scene.id + '-' + String(Math.floor(hh)).padStart(2, '0') + String(Math.floor((hh % 1) * 60)).padStart(2, '0') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        hide('loading');
      }, 'image/png');
    } catch (e) { console.error(e); $('loading').textContent = 'Could not save the picture: ' + e.message; setTimeout(() => hide('loading'), 3000); }
  }, 30);
}

// Clock readout.
function fmt(h) {
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}
setInterval(() => {
  if (!stage.world) return;
  const h = stage.world.hour;
  if (!dragging) $('hour').value = h.toFixed(2);
  $('timeText').textContent = fmt(h);
  if ($('hud').classList.contains('on')) {
    $('hud').textContent = 'fps ' + stage.fps.toFixed(0) + '  cpu ' + stage.stats.drawMs.toFixed(1) + 'ms\ntris ' + stage.stats.tris + '  build ' + stage.stats.buildMs.toFixed(0) + 'ms\npeople ' + stage.world.people.length + '  calls ' + stage.renderer.info.render.calls + '\ndist ' + stage.camera.dist.toFixed(1) + ' m  particles ' + stage.world.particles.list.length;
  }
}, 250);

// ------------------------------------------------------------ keyboard
window.addEventListener('keydown', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const cam = stage.camera;
  const k = e.key;
  let used = true;
  if (k === 'Escape') {
    if ($('contents').classList.contains('on')) hide('contents');
    else if ($('help').classList.contains('on')) hide('help');
    else if (stage.sliceMode) sliceMode(false);
    else if (stage.tourIndex >= 0) stage.tourStop();
    else if (stage.selected) stage.select(null);
    else closeCard();
  } else if (k === 'ArrowLeft' && stage.tourIndex >= 0) stage.tourNext(-1);
  else if (k === 'ArrowRight' && stage.tourIndex >= 0) stage.tourNext(1);
  else if (k === 'v' || k === 'V') $('bAngle').click();
  else if (k === 'ArrowLeft') cam.panBy(120, 0);
  else if (k === 'ArrowRight') cam.panBy(-120, 0);
  else if (k === 'ArrowUp') cam.panBy(0, 120);
  else if (k === 'ArrowDown') cam.panBy(0, -120);
  else if (k === '+' || k === '=') cam.zoomAt(1.5, cam.W / 2, cam.H / 2);
  else if (k === '-' || k === '_') cam.zoomAt(1 / 1.5, cam.W / 2, cam.H / 2);
  else if (k === '0') $('bFit').click();
  else if (k === 'l' || k === 'L') $('bLabels').click();
  else if (k === 's' || k === 'S') $('bSlice').click();
  else if (k === 'o' || k === 'O') stage.setOpen(!stage.explodeTarget);
  else if (k === 't' || k === 'T') $('bTour').click();
  else if (k === ' ') $('bPause').click();
  else if (k === 'n' || k === 'N') { if (stage.world) stage.world.hour = 22; }
  else if (k === 'd' || k === 'D') { if (stage.world) stage.world.hour = 11; }
  else if (k === 'k' || k === 'K') $('bClock').click();
  else if (k === 'c' || k === 'C') openContents();
  else if (k === 'p' || k === 'P') savePicture();
  else if (k === 'f' || k === 'F') $('bFull').click();
  else if (k === '?') show('help');
  else if (k === '`') $('hud').classList.toggle('on');
  else used = false;
  if (used) e.preventDefault();
});

$('openContents').onclick = openContents;
$('brand').onclick = openContents;
$('closeContents').onclick = () => hide('contents');
$('openHelp').onclick = () => show('help');
$('closeHelp').onclick = () => hide('help');
$('contents').addEventListener('click', (e) => { if (e.target === $('contents')) hide('contents'); });
$('help').addEventListener('click', (e) => { if (e.target === $('help')) hide('help'); });

// ------------------------------------------------------------ boot
buildContents();
if (/[?&]debug/.test(location.search)) $('hud').classList.add('on');
// Disable the slice tool for subjects that do not support it.
XS.bus.on('scene', (e) => { $('bSlice').disabled = e.scene.slice === false; });
const first = parseHash();
if (first && XS.scenes.byId.has(first.id)) open(first.id, first);
else if (XS.scenes.list.length) {
  open(XS.scenes.list[0].id);
  if (!/[?&]nocontents/.test(location.search)) setTimeout(openContents, 400);
}

