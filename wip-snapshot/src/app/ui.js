/* The shell: contents page, toolbar, slice tool, clock, follow card, fact card,
 * guided tour, keyboard, link sharing through the URL hash, and picture export.
 *
 * Hash format: #<scene>?cuts=12.5,40&open=1&h=21.5&w=rain
 */
import { XS, Stage, THREE } from '../engine/index.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isOn = (id) => $(id).classList.contains('on');
const show = (id) => $(id).classList.add('on');
const hide = (id) => $(id).classList.remove('on');
const coarseMQ = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
const touchy = () => !!(coarseMQ && coarseMQ.matches);

const stage = new Stage($('stage'), $('overlay'));
XS.app = { stage };

// ------------------------------------------------------------ messages
// A short visible note (toast) and a quiet one for screen readers (announce).
let toastT = 0;
function toast(text, ms = 2600) {
  const t = $('toast');
  t.textContent = text;
  show('toast');
  clearTimeout(toastT);
  toastT = setTimeout(() => hide('toast'), ms);
}
function announce(text) { $('announce').textContent = ''; setTimeout(() => ($('announce').textContent = text), 30); }
let loadingT = 0;
function loading(text, ms) {
  clearTimeout(loadingT);
  if (!text) { hide('loading'); return; }
  $('loading').textContent = text;
  show('loading');
  if (ms) loadingT = setTimeout(() => hide('loading'), ms);
}

// ------------------------------------------------------------ routing
function decode(s) { try { return decodeURIComponent(s); } catch (e) { return s; } }
function parseHash() {
  const raw = location.hash.replace(/^#/, '');
  if (!raw) return null;
  const qi = raw.indexOf('?');
  const out = { id: decode(qi < 0 ? raw : raw.slice(0, qi)) };
  const q = qi < 0 ? '' : raw.slice(qi + 1);
  for (const kv of q.split('&')) {
    const [k, v0] = kv.split('=');
    const v = decode(v0 || '');
    if (k === 'cuts') out.cuts = v.split(',').map((t) => t.trim()).filter((t) => t !== '').map(Number).filter((n) => isFinite(n));
    if (k === 'open') out.open = v === '1';
    if (k === 'h' && v !== '' && isFinite(parseFloat(v))) out.hour = Math.max(0, Math.min(23.99, parseFloat(v)));
    if (k === 'w') out.weather = v;
  }
  return out;
}
let hashHour = null, hashAt = 0;
function writeHash() {
  if (!stage.scene) return;
  let h = '#' + stage.scene.id;
  const q = [];
  if (stage.cuts.length) q.push('cuts=' + stage.cuts.map((x) => +x.toFixed(2)).join(','));
  if (stage.explodeTarget) q.push('open=1');
  if (stage.world) { hashHour = stage.world.hour; q.push('h=' + +hashHour.toFixed(2)); }
  if (stage.weather && stage.weather.kind !== 'clear') q.push('w=' + stage.weather.kind);
  if (q.length) h += '?' + q.join('&');
  hashAt = performance.now();
  if (location.hash !== h) history.replaceState(null, '', h);
}
window.addEventListener('hashchange', () => {
  const r = parseHash();
  if (r && XS.scenes.byId.has(r.id)) open(r.id, r);
});

// ------------------------------------------------------------ scenes
function open(id, opts = {}) {
  const sc = XS.scenes.byId.get(id);
  // Behind the contents page the build is quiet; elsewhere say what is being drawn.
  if (!isOn('contents')) loading('Inking ' + (sc.title || id).replace(/^The /, 'the ') + '…');
  // Let the message paint before the build blocks the thread.
  requestAnimationFrame(() => setTimeout(() => {
    try {
      stage.load(id, opts);
    } catch (e) {
      console.error(e);
      loading('This subject failed to load: ' + e.message, 5000);
      // The previous subject is untouched: put its address back, or offer the contents.
      if (stage.scene) writeHash(); else openModal('contents');
      return;
    }
    loading(null);
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

// Thumbnails: inline in the portable edition (XS_THUMBS); listed in gallery/index.json in the folder.
let thumbs = window.XS_THUMBS || null;
function thumbFor(s) { return thumbs && thumbs[s.id] ? thumbs[s.id] : null; }
if (!thumbs) {
  fetch('gallery/index.json').then((r) => (r.ok ? r.json() : [])).then((ids) => {
    thumbs = {};
    for (const id of ids) thumbs[id] = 'gallery/' + id + '.jpg';
    buildContents();
  }).catch(() => {});
}
function buildContents() {
  const list = $('sceneList');
  list.innerHTML = '';
  for (const s of XS.scenes.list.filter((q) => !q.hidden)) {
    const b = document.createElement('button');
    b.className = 'scene';
    b.dataset.id = s.id;
    const src = thumbFor(s);
    b.innerHTML = (src ? '<img class="thumb" alt="" loading="lazy" src="' + esc(src) + '">' : '<div class="thumb ph"></div>') + '<div class="meta"><div class="t">' + esc(s.title) + '</div><div class="e">' + esc(s.subtitle || '') + '</div><div class="d">' + esc(s.blurb || '') + '</div><div class="here">Open now</div></div>';
    b.addEventListener('click', () => {
      closeModal('contents');
      if (s === stage.scene) return; // already open: just go back to it
      open(s.id);
    });
    list.appendChild(b);
  }
  markCurrent();
}
function markCurrent() {
  for (const b of $('sceneList').children) {
    const cur = !!stage.scene && b.dataset.id === stage.scene.id;
    b.classList.toggle('current', cur);
    if (cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  }
}

// ------------------------------------------------------------ dialogs
// Contents and Help are modal: the page behind them is inert, focus moves to the dialog's
// close button, and it returns to where it was when the dialog closes.
const BACKGROUND = ['.masthead', '.topnav', '#toolbar', '#overlay', '#card', '#people', '#tourcard', '#slicebar'];
const opener = {};
function topModal() { return isOn('help') ? 'help' : isOn('contents') ? 'contents' : null; }
function syncInert() {
  const top = topModal();
  for (const sel of BACKGROUND) document.querySelector(sel).inert = !!top;
  $('contents').inert = top === 'help';
}
function openModal(id) {
  if (!isOn(id)) opener[id] = document.activeElement;
  show(id);
  syncInert();
  if (id === 'contents') markCurrent();
  const c = $(id).querySelector('.close');
  if (c) c.focus({ preventScroll: true });
}
function closeModal(id) {
  if (!isOn(id)) return;
  hide(id);
  syncInert();
  const f = opener[id];
  opener[id] = null;
  const top = topModal();
  if (top) { const c = $(top).querySelector('.close'); if (c) c.focus({ preventScroll: true }); }
  else if (f && f.focus && document.contains(f) && !f.closest('[inert]')) f.focus({ preventScroll: true });
}
const openContents = () => openModal('contents');

// ------------------------------------------------------------ cards
let cardMode = null, cardTimer = null, cardNow = null;
function closeCard() { hide('card'); cardMode = null; clearInterval(cardTimer); cardNow = null; stage.labels.active = null; syncChrome(); }
function followText(p, following) {
  if (following) return touchy() ? 'Following. Drag to look away; tap × to let them go.' : 'Following. Drag to look away, or press Esc to let them go.';
  return touchy() ? 'Looking away. Tap them to follow again.' : 'Looking away. Click them to follow again, or press Esc to let them go.';
}
function personName(p) { return p.name || (p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : 'Someone here'); }
// Built once per person; only the "Now" line and the follow note change afterwards, so the
// close button is never replaced under a pointer and screen readers hear only real changes.
function personCard(p) {
  if (!p) { closeCard(); return; }
  cardMode = 'person';
  stage.labels.active = null;
  const c = $('card');
  c.innerHTML = '<button class="close" aria-label="Stop following">&times;</button>' +
    '<h2>' + esc(personName(p)) + '</h2>' +
    (p.name && p.role ? '<p class="role">' + esc(p.role) + '</p>' : '') +
    (p.bio ? '<p>' + esc(p.bio) + '</p>' : '') +
    '<p class="now"><b>Now</b> &nbsp;<span aria-live="polite"></span></p>' +
    '<p class="src"></p>';
  c.querySelector('.close').onclick = () => stage.select(null);
  cardNow = c.querySelector('.now span');
  c.querySelector('.src').textContent = followText(p, true);
  const render = () => {
    if (stage.selected !== p) return;
    const t = p.currentLabel();
    if (cardNow.textContent !== t) cardNow.textContent = t;
  };
  render();
  show('card');
  syncChrome();
  clearInterval(cardTimer);
  cardTimer = setInterval(render, 700);
  announce('Following ' + personName(p) + (p.name && p.role ? ', ' + p.role : ''));
}
function factCard(L) {
  cardMode = 'fact';
  clearInterval(cardTimer);
  // The caption whose card is open keeps its place and is never the one dropped.
  stage.labels.active = L;
  const c = $('card');
  const src = L.source ? (Array.isArray(L.source) ? L.source : [L.source]) : [];
  c.innerHTML = '<button class="close" aria-label="Close">&times;</button><h2>' + esc(L.title || '') + '</h2>' +
    '<p>' + esc(L.body || L.text || '') + '</p>' +
    (src.length ? '<p class="src">Source: ' + src.map((u) => '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\//, '').slice(0, 60)) + '</a>').join(', ') + '</p>' : '');
  c.querySelector('.close').onclick = closeCard;
  show('card');
  syncChrome();
  announce(L.title || 'Fact');
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
XS.bus.on('follow', (e) => { if (cardMode === 'person' && stage.selected === e.person) $('card').querySelector('.src').textContent = followText(e.person, e.following); });
XS.bus.on('fact', (e) => factCard(e.label));
XS.bus.on('tour', (e) => {
  // The tour and the slice tool share the bottom of the screen: one at a time.
  if (e.stop && stage.sliceMode) sliceMode(false);
  tourCard(e);
});
XS.bus.on('cuts', () => { syncSlice(); writeHash(); });
XS.bus.on('open', () => { syncSlice(); writeHash(); });
XS.bus.on('cutlimit', (e) => { toast('Up to ' + e.max + ' cuts. Remove one to place another.'); syncSlice(); });

// ------------------------------------------------------------ slice tool
function sliceable() { return !!stage.scene && stage.scene.slice !== false; }
function syncSlice() {
  const n = stage.cuts.length, max = stage.scene ? stage.maxCuts() : 8;
  $('cutCount').textContent = (n === 0 ? 'No cuts' : n === 1 ? '1 cut' : n + ' cuts') + (max && n >= max ? ' (the most)' : '');
  $('cutOpen').disabled = n === 0;
  $('cutOpen').innerHTML = (stage.explodeTarget ? 'Close' : 'Open') + '<span class="wide"> the slices</span>';
  $('cutClear').disabled = n === 0;
  $('cutSuggest').style.display = stage.scene && stage.scene.suggestedCuts && stage.scene.suggestedCuts.length ? '' : 'none';
  const can = sliceable();
  $('bSlice').disabled = !can;
  $('bSlice').title = can ? 'Slice the subject (S)' : 'This subject is shown whole: it cannot be sliced';
  $('bOpen').disabled = n === 0;
  $('bOpen').title = !can ? 'This subject is shown whole: it cannot be sliced' : n ? 'Open or close the slices (O)' : 'Place a cut with the Slice tool first';
  $('bOpen').setAttribute('aria-pressed', stage.explodeTarget ? 'true' : 'false');
  $('bSlice').setAttribute('aria-pressed', stage.sliceMode ? 'true' : 'false');
  $('slicebar').classList.toggle('on', stage.sliceMode);
  $('sliceHint').textContent = touchy()
    ? 'Tap along the subject to place a cut. Drag a cut to move it; tap its × to remove it. No cuts at all is fine.'
    : 'Click along the subject to place a cut. Drag a cut to move it; click its × to remove it. No cuts at all is fine.';
  syncChrome();
}
function sliceMode(on) {
  if (on && !sliceable()) { toast('This subject is shown whole, so it cannot be sliced.'); on = false; }
  stage.sliceMode = on;
  if (on) { stage.select(null); if (stage.tourIndex >= 0) stage.tourStop(); }
  syncSlice();
}
$('bSlice').onclick = () => sliceMode(!stage.sliceMode);
$('cutDone').onclick = () => sliceMode(false);
$('cutClear').onclick = () => stage.clearCuts();
$('cutSuggest').onclick = () => stage.setCuts(stage.suggestedCuts());
$('cutOpen').onclick = () => stage.setOpen(!stage.explodeTarget);
$('bOpen').onclick = () => stage.setOpen(!stage.explodeTarget);

// ------------------------------------------------------------ toolbar
const WNAMES = { clear: 'Clear sky', rain: 'Rain', storm: 'Storm', fog: 'Fog', snow: 'Snow' };
const WORDER = ['clear', 'rain', 'storm', 'fog', 'snow'];
function syncWeather() {
  const k = stage.weather.kind;
  $('weatherName').textContent = WNAMES[k] || 'Clear sky';
  $('bWeather').title = 'Weather: ' + (WNAMES[k] || 'clear sky').toLowerCase() + '. Next: ' + WNAMES[WORDER[(WORDER.indexOf(k) + 1) % WORDER.length]].toLowerCase() + ' (R)';
}
function setWeather(k) { stage.weather.set(k); syncWeather(); writeHash(); }
$('bWeather').onclick = () => setWeather(WORDER[(WORDER.indexOf(stage.weather.kind) + 1) % WORDER.length]);
$('bSound').onclick = () => { const on = stage.setSound(!stage.audio.on); $('bSound').setAttribute('aria-pressed', String(on)); };
$('bTour').onclick = () => (stage.tourIndex >= 0 ? stage.tourStop() : stage.tourStart());
$('bLabels').onclick = () => { stage.showLabels = !stage.showLabels; $('bLabels').setAttribute('aria-pressed', String(stage.showLabels)); };
function syncPause() {
  const p = stage.paused;
  $('pauseName').textContent = p ? 'Play' : 'Pause';
  $('pauseIcon').innerHTML = p ? '<path d="M7 4.5v15l12.5-7.5z"/>' : '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
  $('bPause').title = p ? 'Play: everything moves again (Space)' : 'Pause everything (Space)';
  $('bPause').classList.toggle('lit', p);
}
$('bPause').onclick = () => { stage.paused = !stage.paused; syncPause(); };
const SPEEDS = [1, 8, 0];
let speedI = 0;
const syncSpeed = () => {
  const r = SPEEDS[speedI];
  if (stage.world) stage.world.clockRate = r;
  $('clockSpeed').innerHTML = r + '&times;';
  $('bClock').title = r === 0 ? 'Clock stopped: the hour holds while life goes on. Next: 1× (K)' : 'Clock speed ' + r + '×. Next: ' + (SPEEDS[(speedI + 1) % SPEEDS.length] || 0) + '× (K)';
  $('bClock').setAttribute('aria-label', r === 0 ? 'Clock stopped' : 'Clock speed ' + r + ' times');
};
$('bClock').onclick = () => { speedI = (speedI + 1) % SPEEDS.length; syncSpeed(); };
let dragging = false;
$('hour').addEventListener('input', (e) => { dragging = true; if (stage.world) stage.world.hour = parseFloat(e.target.value); });
$('hour').addEventListener('change', () => { dragging = false; writeHash(); });
function setHour(h) { if (stage.world) { stage.world.hour = h; writeHash(); } }
$('bFit').onclick = () => { stage.select(null); stage.camera.fit(stage.fitBox(), 0.92, false); };
// Viewing angles; the first is the subject's own view.
const ANGLES = [{ yaw: -0.42, pitch: 0.28, n: 'Book view' }, { yaw: 0, pitch: 0.06, n: 'Level view' }, { yaw: -0.65, pitch: 0.7, n: 'High view' }, { yaw: 0.5, pitch: 0.3, n: 'Right view' }];
let angleI = 0;
function syncAngle() {
  $('angleName').textContent = ANGLES[angleI].n;
  $('bAngle').title = 'Viewing angle: ' + ANGLES[angleI].n.toLowerCase() + '. Next: ' + ANGLES[(angleI + 1) % ANGLES.length].n.toLowerCase() + ' (V)';
}
$('bAngle').onclick = () => {
  angleI = (angleI + 1) % ANGLES.length;
  const A = ANGLES[angleI];
  stage.camera.flyTo({ target: stage.camera.target.clone(), dist: stage.camera.dist, yaw: A.yaw, pitch: A.pitch }, 1.1);
  syncAngle();
};
const canFull = !!(document.fullscreenEnabled && document.documentElement.requestFullscreen);
if (!canFull) $('bFull').hidden = true;
$('bFull').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (canFull) document.documentElement.requestFullscreen().catch(() => {}); };
document.addEventListener('fullscreenchange', () => {
  const on = !!document.fullscreenElement;
  $('bFull').setAttribute('aria-pressed', String(on));
  $('fullName').textContent = on ? 'Exit' : 'Full';
  $('bFull').title = on ? 'Leave full screen (F)' : 'Full screen (F)';
});
$('bMore').onclick = () => {
  const on = !$('toolbar').classList.contains('expanded');
  $('toolbar').classList.toggle('expanded', on);
  $('bMore').setAttribute('aria-expanded', String(on));
  $('moreName').textContent = on ? 'Less' : 'More';
  syncChrome();
};
$('bSave').onclick = savePicture;
function savePicture() {
  loading('Drawing your picture…');
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
        loading(null);
      }, 'image/png');
    } catch (e) { console.error(e); loading('Could not save the picture: ' + e.message, 3000); }
  }, 30);
}

// A new subject: reset the per-subject controls.
XS.bus.on('scene', (e) => {
  const v = e.scene.view || {};
  ANGLES[0].yaw = v.yaw != null ? v.yaw : -0.42;
  ANGLES[0].pitch = v.pitch != null ? v.pitch : 0.28;
  angleI = 0;
  syncAngle();
  syncWeather();
  syncSpeed();
  syncSlice();
  markCurrent();
  if (isOn('people')) renderPeople();
});

// Clock readout, and the address bar following the clock.
function fmt(h) {
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}
setInterval(() => {
  if (!stage.world) return;
  const h = stage.world.hour;
  if (!dragging) $('hour').value = h.toFixed(2);
  $('hour').setAttribute('aria-valuetext', fmt(h));
  $('timeText').textContent = fmt(h);
  if (hashHour != null && Math.abs(h - hashHour) > 0.05 && performance.now() - hashAt > 4000 && !dragging) writeHash();
  syncChrome();
  if ($('hud').classList.contains('on')) {
    $('hud').textContent = 'fps ' + stage.fps.toFixed(0) + '  cpu ' + stage.stats.drawMs.toFixed(1) + 'ms\ntris ' + stage.stats.tris + '  build ' + stage.stats.buildMs.toFixed(0) + 'ms\npeople ' + stage.world.people.length + '  calls ' + stage.renderer.info.render.calls + '\ndist ' + stage.camera.dist.toFixed(1) + ' m  particles ' + stage.world.particles.list.length;
  }
}, 250);

// ------------------------------------------------------------ chrome geometry
// Tell the stage where the masthead, toolbar and open panels are, so captions and cut
// handles keep clear of them; and let the CSS place cards above the toolbar.
function syncChrome() {
  const H = window.innerHeight;
  const bar = $('toolbar'), tb = bar.getBoundingClientRect();
  document.documentElement.style.setProperty('--tb-top', Math.round(H - tb.top) + 'px');
  bar.classList.toggle('scrolls', bar.scrollWidth > bar.clientWidth + 2);
  bar.classList.toggle('at-end', bar.scrollLeft + bar.clientWidth >= bar.scrollWidth - 2);
  if (document.body.classList.contains('ambient')) {
    stage.insets = { top: 16, right: 0, bottom: 16, left: 0 };
    stage.reserved = [];
    return;
  }
  const rect = (el) => { const r = el.getBoundingClientRect(); return [r.left - 4, r.top - 4, r.right + 4, r.bottom + 4]; };
  const mh = $('masthead').getBoundingClientRect(), nav = $('topnav').getBoundingClientRect();
  const ins = { top: Math.round(Math.max(mh.bottom, nav.bottom) + 6), right: 0, bottom: Math.round(H - tb.top + 6), left: 0 };
  const reserved = [rect($('masthead')), rect($('topnav')), rect($('toolbar'))];
  // Open cards and panels are reserved rectangles, not a narrower caption area: captions in a
  // margin column step around them on their own side (labels.js) instead of all changing sides.
  let bars = tb.top;
  for (const id of ['card', 'people', 'tourcard', 'slicebar']) {
    if (!isOn(id)) continue;
    const r = rect($(id));
    reserved.push(r);
    // Notes (toasts) sit above whatever is docked on the toolbar in the lower part of the screen.
    if (r[3] > tb.top - 24 && r[1] > H * 0.4) bars = Math.min(bars, r[1] + 4);
  }
  document.documentElement.style.setProperty('--bars-top', Math.round(H - bars) + 'px');
  stage.insets = ins;
  stage.reserved = reserved;
}
window.addEventListener('resize', () => syncChrome());
$('toolbar').addEventListener('scroll', () => syncChrome(), { passive: true });

// ------------------------------------------------------------ keyboard
function handleEscape(t) {
  if (isOn('help')) { closeModal('help'); return true; }
  if (isOn('contents')) { closeModal('contents'); return true; }
  if (isOn('people')) {
    const f = $('peopleFilter');
    if (t === f && f.value) { f.value = ''; renderPeople(); return true; }
    closePeople();
    return true;
  }
  if (stage.sliceMode) { sliceMode(false); return true; }
  if (stage.tourIndex >= 0) { stage.tourStop(); return true; }
  if (stage.selected) { stage.select(null); return true; }
  if (cardMode) { closeCard(); return true; }
  return false;
}
// Where focus came from. A control reached with the keyboard keeps Space and Enter for
// itself; one that was clicked or tapped does not hold on to Space, which pauses as Help says.
// (The browser's :focus-visible is no guide here: Chromium turns it on at the first key press.)
let lastInput = 'key', pointerFocused = null, spaceTaken = false;
window.addEventListener('pointerdown', () => { lastInput = 'pointer'; }, { capture: true });
document.addEventListener('focusin', (e) => { pointerFocused = lastInput === 'pointer' ? e.target : null; });
function keyboardFocused(t) { return !!t && t !== pointerFocused; }
window.addEventListener('keyup', (e) => {
  // The Space that paused must not also press the button it was clicked on.
  if (e.key === ' ' && spaceTaken) { spaceTaken = false; e.preventDefault(); }
}, { capture: true });
window.addEventListener('keydown', (e) => {
  lastInput = 'key';
  const t = e.target && e.target.nodeType === 1 ? e.target : null;
  if (ambient) { setAmbient(false); e.preventDefault(); return; }
  const k = e.key;
  if (k === 'Escape') { if (handleEscape(t)) e.preventDefault(); return; }
  // Typing in a text field: no shortcuts.
  if (t && t.matches('input[type=search], input[type=text], textarea, [contenteditable]')) return;
  // A dialog is open: only Esc (above) and Tab act.
  if (topModal()) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  // A control reached with the keyboard keeps its own keys: Space and Enter press buttons and
  // links. Space on the clock slider, or on a control that was clicked, pauses instead.
  const control = t && t.closest('button, a, [role=button], input, select, summary');
  if (control && k === 'Enter') return;
  if (control && k === ' ' && !t.matches('input[type=range]') && keyboardFocused(t)) return;
  if (control && k === ' ') spaceTaken = true;
  if (k === ' ' && e.repeat) { e.preventDefault(); return; } // a held Space pauses once
  if (t && t.matches('input[type=range]') && /^(Arrow|Page|Home|End)/.test(k)) return;
  const cam = stage.camera;
  let used = true;
  if (k === 'ArrowLeft' && stage.tourIndex >= 0) stage.tourNext(-1);
  else if (k === 'ArrowRight' && stage.tourIndex >= 0) stage.tourNext(1);
  else if (k === 'v' || k === 'V') $('bAngle').click();
  else if (k === 'm' || k === 'M') $('bSound').click();
  else if (k === 'w' || k === 'W') togglePeople();
  else if (k === 'r' || k === 'R') $('bWeather').click();
  else if (k === 'a' || k === 'A') setAmbient(true);
  else if (k === 'ArrowLeft') cam.panBy(120, 0);
  else if (k === 'ArrowRight') cam.panBy(-120, 0);
  else if (k === 'ArrowUp') cam.panBy(0, 120);
  else if (k === 'ArrowDown') cam.panBy(0, -120);
  else if (k === '+' || k === '=') cam.zoomAt(1 / 1.5, cam.W / 2, cam.H / 2); // closer
  else if (k === '-' || k === '_') cam.zoomAt(1.5, cam.W / 2, cam.H / 2); // further
  else if (k === '0') $('bFit').click();
  else if (k === 'l' || k === 'L') $('bLabels').click();
  else if (k === 's' || k === 'S') sliceMode(!stage.sliceMode);
  else if (k === 'o' || k === 'O') { if (stage.cuts.length) stage.setOpen(!stage.explodeTarget); else if (sliceable()) toast('Place a cut first: press S for the slice tool.'); }
  else if (k === 't' || k === 'T') $('bTour').click();
  else if (k === ' ') $('bPause').click();
  else if (k === 'n' || k === 'N') setHour(22);
  else if (k === 'd' || k === 'D') setHour(11);
  else if (k === 'k' || k === 'K') $('bClock').click();
  else if (k === 'c' || k === 'C') openContents();
  else if (k === 'p' || k === 'P') savePicture();
  else if (k === 'f' || k === 'F') $('bFull').click();
  else if (k === '?') openModal('help');
  else if (k === '`') $('hud').classList.toggle('on');
  else used = false;
  if (used) e.preventDefault();
});

// ------------------------------------------------------------ who and what is here
// The list is built when the panel opens, the filter changes or the subject changes; a
// timer only updates each person's activity line, so focus and pointer presses survive.
let peopleTimer = null, peopleTab = 'people', peopleRows = [];
function renderPeople() {
  if (!stage.world) return;
  const q = $('peopleFilter').value.trim().toLowerCase();
  const facts = peopleTab === 'facts';
  $('peopleTitle').textContent = facts ? 'What is here' : 'Who is here';
  $('peopleHint').textContent = facts ? 'The framed captions, with their sources. Choose one to go to it.' : 'Choose someone to follow them through their day.';
  $('peopleFilter').placeholder = facts ? 'Find a caption' : 'Find by name or job';
  $('peopleFilter').setAttribute('aria-label', $('peopleFilter').placeholder);
  $('tabPeople').setAttribute('aria-selected', String(!facts));
  $('tabFacts').setAttribute('aria-selected', String(facts));
  const ul = $('peopleList');
  ul.innerHTML = '';
  peopleRows = [];
  const add = (html, onclick) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = html;
    b.onclick = onclick;
    li.appendChild(b);
    ul.appendChild(li);
    return b;
  };
  if (facts) {
    const list = stage.world.labels.filter((L) => L.body && (!q || ((L.title || '') + ' ' + (L.text || '') + ' ' + L.body).toLowerCase().includes(q)));
    for (const L of list) add('<div class="n">' + esc(L.title || '') + '</div>' + (L.text ? '<div class="r">' + esc(L.text) + '</div>' : ''), (e) => goToFact(L, e));
    if (!list.length) ul.innerHTML = '<li class="r" style="padding:6px 8px">' + (q ? 'No caption mentions that.' : 'This subject has no fact cards yet.') + '</li>';
    return;
  }
  const named = stage.world.people.filter((p) => p.name && (!q || (p.name + ' ' + (p.role || '')).toLowerCase().includes(q)));
  named.sort((a, b) => a.name.localeCompare(b.name));
  for (const p of named) {
    const b = add('<div class="n">' + esc(p.name) + '</div><div class="r">' + esc(p.role || '') + '</div><div class="a"></div>', (e) => {
      stage.select(p);
      closePeople(false);
      // From the keyboard, carry focus to the card that replaces the list.
      if (e.detail === 0) { const c = $('card').querySelector('.close'); if (c) c.focus(); }
    });
    peopleRows.push({ p, a: b.querySelector('.a') });
  }
  refreshPeople();
  if (!named.length) ul.innerHTML = '<li class="r" style="padding:6px 8px">Nobody by that name here.</li>';
}
function refreshPeople() {
  for (const r of peopleRows) { const t = r.p.currentLabel(); if (r.a.textContent !== t) r.a.textContent = t; }
}
// Go to a framed caption: fly near enough for it to show, then open its card.
function goToFact(L, e) {
  closePeople(false);
  stage.select(null);
  const cam = stage.camera, t = Math.tan((cam.cam.fov * Math.PI) / 360);
  const distFor = (S) => cam.H / (2 * t * S);
  let dist = cam.dist;
  if (L.min != null && 1 / cam.unitsPerPx() < L.min) dist = distFor(L.min * 1.25);
  if (L.max != null && 1 / cam.unitsPerPx() >= L.max) dist = distFor(L.max * 0.8);
  const off = stage.secOff(stage.secOf(L.x));
  cam.flyTo({ target: new THREE.Vector3(L.x + off, L.y, -(L.z || 0)), dist }, 1.2);
  factCard(L);
  if (e && e.detail === 0) { const c = $('card').querySelector('.close'); if (c) c.focus(); }
}
function setPeopleTab(tab) { peopleTab = tab; $('peopleFilter').value = ''; renderPeople(); }
$('tabPeople').onclick = () => setPeopleTab('people');
$('tabFacts').onclick = () => setPeopleTab('facts');
function closePeople(restoreFocus = true) {
  const had = $('people').contains(document.activeElement);
  hide('people');
  clearInterval(peopleTimer);
  syncChrome();
  if (restoreFocus && had) $('openPeople').focus();
}
function togglePeople() {
  if (isOn('people')) { closePeople(); return; }
  show('people');
  closeCard();
  renderPeople();
  clearInterval(peopleTimer);
  peopleTimer = setInterval(refreshPeople, 1500);
  syncChrome();
}
$('openPeople').onclick = togglePeople;
$('closePeople').onclick = () => closePeople();
$('peopleFilter').addEventListener('input', renderPeople);

// ------------------------------------------------------------ ambient mode
// Drift unattended through the subjects: a tour stop every half minute, a new subject every
// few stops, at a varied hour and in varied weather. Any key or click returns control, and
// that key or click does nothing else. A hidden tab holds the drift where it is.
let ambient = null;
function ambientStep() {
  if (!ambient) return;
  if (document.hidden) { ambient.t = setTimeout(ambientStep, 2000); return; }
  const real = XS.scenes.list.filter((q) => !q.hidden && !q.placeholder);
  ambient.n++;
  const hours = [7.5, 11, 16.5, 19.2, 21.5, 23];
  if (ambient.n % 4 === 1 || !stage.world || !stage.world.tour.length) {
    const next = real[(real.indexOf(stage.scene) + 1) % real.length] || real[0];
    if (next && next !== stage.scene) { open(next.id, { hour: hours[ambient.n % hours.length] }); ambient.t = setTimeout(ambientStep, 4000); return; }
  }
  if (stage.world && stage.world.tour.length) {
    stage.tourIndex = Math.floor(XS.h01(ambient.n, 5) * stage.world.tour.length) - 1;
    stage.tourNext(1);
    stage.tourIndex = -1;
    tourCard(null);
    if (XS.h01(ambient.n, 9) < 0.25) stage.world.hour = hours[ambient.n % hours.length];
  }
  ambient.t = setTimeout(ambientStep, 26000);
}
function setAmbient(on) {
  if (on && !ambient) {
    ambient = { n: 0, t: 0 };
    closeModal('contents'); closeModal('help'); closeCard();
    if (isOn('people')) closePeople();
    if (stage.sliceMode) sliceMode(false);
    document.body.classList.add('ambient');
    syncChrome();
    ambientStep();
  } else if (!on && ambient) {
    clearTimeout(ambient.t);
    ambient = null;
    document.body.classList.remove('ambient');
    syncChrome();
  }
}
let swallowClick = -1e9;
window.addEventListener('pointerdown', (e) => {
  if (!ambient) return;
  e.stopPropagation(); e.preventDefault();
  swallowClick = performance.now();
  setAmbient(false);
}, { capture: true });
window.addEventListener('click', (e) => {
  if (performance.now() - swallowClick < 800) { swallowClick = -1e9; e.stopPropagation(); e.preventDefault(); }
}, { capture: true });
window.addEventListener('wheel', (e) => {
  if (!ambient) return;
  e.stopPropagation(); e.preventDefault();
  setAmbient(false);
}, { capture: true, passive: false });

$('openContents').onclick = openContents;
$('brand').onclick = openContents;
$('closeContents').onclick = () => closeModal('contents');
$('openHelp').onclick = () => openModal('help');
$('closeHelp').onclick = () => closeModal('help');
$('contents').addEventListener('click', (e) => { if (e.target === $('contents')) closeModal('contents'); });
$('help').addEventListener('click', (e) => { if (e.target === $('help')) closeModal('help'); });

// ------------------------------------------------------------ boot
document.documentElement.classList.toggle('touch', touchy());
if (coarseMQ && coarseMQ.addEventListener) coarseMQ.addEventListener('change', () => { document.documentElement.classList.toggle('touch', touchy()); syncSlice(); });
buildContents();
syncPause();
syncSpeed();
syncAngle();
syncWeather();
syncChrome();
if (/[?&]debug/.test(location.search)) $('hud').classList.add('on');
const first = parseHash();
if (first && XS.scenes.byId.has(first.id)) open(first.id, first);
else {
  // First visit: the contents page comes first, and the first subject is drawn behind it.
  const list = XS.scenes.list.filter((q) => !q.hidden);
  if (!/[?&]nocontents/.test(location.search)) openContents();
  if (list.length) open(list[0].id);
}
