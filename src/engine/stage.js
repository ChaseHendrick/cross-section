/* The stage: loads a scene, runs the clock, renders every frame, handles input.
 *
 * Frame:
 *   1. ink pass target (colour + info): sky, then the scene once per slice, each clipped
 *      to its slice and shifted by its offset (one pass when the subject is whole);
 *   2. the ink composite to the screen (post.js);
 *   3. overlay: glass, water cut faces, smoke, sparks and lamp halos, per slice;
 *   4. a 2D canvas on top: captions, cut guides, the follow ring and tooltips.
 *
 * Slicing is live: cuts are clipping ranges, so placing, dragging or opening them needs
 * no rebuild. Zero cuts is the default and shows the whole cutaway.
 */
import * as THREE from 'three';
import { XS } from './core.js';
import { U, OU } from './materials.js';
import { Kit, bakeLamps } from './kit.js';
import { World, Person } from './world.js';
import { Figures } from './figures.js';
import { Sky, applyLighting, updateSea } from './sky.js';
import { InkPass } from './post.js';
import { Camera3 } from './camera.js';
import { Labels } from './labels.js';
import { Audio } from './audio.js';
import { Weather } from './weather.js';

const { clamp, easeInOut } = XS.math;
THREE.ColorManagement.enabled = false;

export const THEME = {
  ink: '#2a221c', inkSoft: '#4a3c30', paperA: 'rgba(246,239,222,0.88)', paperHi: 'rgba(255,250,236,0.97)', accent: '#a8322a', cut: '#b8322a',
};

export class Stage {
  constructor(canvas, overlay) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.octx = overlay.getContext('2d');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: false });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.autoClear = false;
    this.renderer.sortObjects = true;
    this.renderer.info.autoReset = false;
    this.camera = new Camera3();
    this.ink = new InkPass();
    this.sky = new Sky();
    this.labels = new Labels();
    this.audio = new Audio();
    this.weather = new Weather();
    this.main = new THREE.Scene();
    this.root = new THREE.Group();
    this.root.scale.z = -1; // scene coordinates: z is depth behind the cut
    this.main.add(this.root);
    this.over = new THREE.Scene();
    this.overRoot = new THREE.Group();
    this.overRoot.scale.z = -1;
    this.over.add(this.overRoot);
    this.scene = null;
    this.world = null;
    this.cuts = [];
    this.explode = 0;
    this.explodeTarget = 0;
    this.time = 0;
    this.paused = false;
    this.frame = 0;
    this.selected = null;
    this.hoverPerson = null;
    this.sliceMode = false;
    this.sliceHover = null;
    this.dragCut = -1;
    this.tourIndex = -1;
    this.tourTimer = 0;
    this.showLabels = true;
    this.fps = 60;
    // Render scale: lower on small touch screens; adapted to the frame rate as we go.
    const small = window.matchMedia && window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
    const qp = parseFloat(new URLSearchParams(location.search).get('quality'));
    this.quality = isFinite(qp) ? Math.max(0.3, Math.min(2, qp)) : small ? 0.75 : 1;
    this.adaptive = !isFinite(qp);
    this.fpsWin = { t: 0, n: 0, good: 0 };
    this.stats = { buildMs: 0, tris: 0, people: 0, drawMs: 0, setupMs: 0 };
    this.pointers = new Map();
    // Screen space the shell's chrome occupies, in CSS pixels. Captions and cut handles keep
    // clear of it. insets: bands along each edge; reserved: [x0, y0, x1, y1] rectangles
    // (open panels and cards). The shell keeps both up to date; these defaults suit a bare page.
    this.insets = { top: 70, right: 0, bottom: 86, left: 0 };
    this.reserved = [];
    // Reduced motion: camera flights become cuts, and there is no pan inertia.
    const rm = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.camera.reduced = !!(rm && rm.matches);
    if (rm && rm.addEventListener) rm.addEventListener('change', () => { this.camera.reduced = rm.matches; });
    this._resize();
    window.addEventListener('resize', () => this._resize());
    // A hidden tab stops drawing; let the sound rest with it.
    document.addEventListener('visibilitychange', () => {
      if (this.audio.ctx && this.audio.on) { if (document.hidden) this.audio.ctx.suspend(); else this.audio.ctx.resume(); }
    });
    this._bindInput();
    this._loop = this._loop.bind(this);
    this.last = performance.now();
    requestAnimationFrame(this._loop);
  }

  // ------------------------------------------------------------ lifecycle
  // Remove the current subject and free its GPU resources: geometry, per-scene materials
  // (the interned ink and overlay materials are shared and kept) and the textures those
  // materials own (a sea's mask, say). Uniforms shared through U and OU are left alone.
  _clear() {
    const freeMat = (m) => {
      if (!m || (m.userData && m.userData.shared)) return;
      if (m.uniforms) for (const k in m.uniforms) {
        if (k in U || k in OU) continue;
        const v = m.uniforms[k] && m.uniforms[k].value;
        if (v && v.isTexture) v.dispose();
      }
      m.dispose();
    };
    const free = (o) => o.traverse((n) => {
      if (n.geometry && !n.userData.keepGeo) n.geometry.dispose();
      if (n.isInstancedMesh) n.dispose();
      if (Array.isArray(n.material)) n.material.forEach(freeMat); else freeMat(n.material);
    });
    const kill = (g) => { for (const o of [...g.children]) { g.remove(o); free(o); } };
    kill(this.root); kill(this.overRoot);
    for (const o of [...this.over.children]) if (o !== this.overRoot) { this.over.remove(o); free(o); }
    if (U.uLamp.value) { U.uLamp.value.dispose(); U.uLamp.value = null; }
  }

  // Cuts as the slice tool allows them: inside cutRange, rounded, at least a metre apart,
  // at most maxCuts, and none at all for a subject that cannot be sliced.
  _cleanCuts(cuts, scene = this.scene) {
    if (!scene || scene.slice === false) return [];
    const b = scene.bounds;
    const lim = scene.cutRange || [b.x0 + 1, b.x1 - 1];
    const clean = [...new Set((cuts || []).filter((x) => typeof x === 'number' && isFinite(x)).map((x) => clamp(x, lim[0], lim[1])).map((x) => Math.round(x * 100) / 100))].sort((a, c) => a - c);
    const out = [];
    for (const x of clean) if (!out.length || x - out[out.length - 1] > 1.0) out.push(x);
    return out.slice(0, scene.maxCuts || 8);
  }

  // Build a subject. The new drawing and world are made first; the old subject is cleared
  // only when they succeed, so a scene that throws leaves the previous one intact.
  load(id, opts = {}) {
    const scene = XS.scenes.byId.get(id);
    if (!scene) throw new Error('unknown scene ' + id);
    const prev = { scene: this.scene, world: this.world, kit: this.kit, cuts: this.cuts };
    const b = scene.bounds;
    // Scenes may read the stage while they build, so point it at the new subject now.
    this.scene = scene;
    this.cuts = this._cleanCuts((opts.cuts || []).filter((x) => x > b.x0 && x < b.x1), scene);
    const t0 = performance.now();
    let kit, W;
    const pending = [];
    try {
      kit = new Kit(scene);
      this.kit = kit;
      scene.build(kit, this);
      W = new World(scene);
      W.sections = this.cuts.slice();
      if (opts.hour != null) W.hour = opts.hour;
      W.onActor = (a) => { if (a.object) pending.push(a.object); };
      this.world = W;
      this.stats.buildMs = performance.now() - t0;
      const t1 = performance.now();
      if (scene.setup) scene.setup(W, this, kit);
      this.stats.setupMs = performance.now() - t1;
    } catch (e) {
      Object.assign(this, prev);
      throw e;
    }
    // Success: retire the old subject and put the new one on stage.
    this._clear();
    this.explode = this.explodeTarget = opts.open && this.cuts.length ? 1 : 0;
    this.selected = null;
    this.hoverPerson = null;
    this.camera.followFn = null;
    this.tourIndex = -1;
    this.sliceMode = false;
    this.sliceHover = null;
    this.dragCut = -1;
    this._cutHandles = null;
    for (const m of kit.meshes()) (m.userData.overlay ? this.overRoot : this.root).add(m);
    for (const g of kit.parts) if (!g.parent) (g.userData.overlay ? this.overRoot : this.root).add(g);
    for (const o of pending) if (!o.parent) this.root.add(o);
    W.onActor = (a) => { if (a.object) this.root.add(a.object); };
    this.stats.tris = kit.tris;
    for (const L of kit.labels) W.labels.push(L);
    this.stats.people = W.people.length;
    // Lamp light volume and halos.
    const allLamps = kit.lamps.slice();
    this.lamps = allLamps;
    const lv = bakeLamps(allLamps, b);
    U.uLamp.value = lv.tex; U.uLampMin.value.copy(lv.min); U.uLampSize.value.copy(lv.size);
    U.uLampGain.value = scene.lampGain != null ? scene.lampGain : 1;
    // Figures.
    this.figures = new Figures(Math.max(16, W.people.length + 8));
    this.root.add(this.figures.group);
    // Sprites.
    for (const m of W.particles.meshes()) this.over.add(m);
    // Sea and other per-frame objects declared by the scene.
    this.seaMesh = null;
    this.root.traverse((o) => { if (o.userData && o.userData.sea) this.seaMesh = o; });
    // Camera.
    U.uFog.value.set(scene.fog ? scene.fog[0] : 1e6, scene.fog ? scene.fog[1] : 2e6, scene.fog ? scene.fog[2] || 1 : 0);
    this.camera.setBounds({ x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1, z1: b.z1 });
    this.camera.yaw = scene.view && scene.view.yaw != null ? scene.view.yaw : -0.42;
    this.camera.pitch = scene.view && scene.view.pitch != null ? scene.view.pitch : 0.28;
    this.camera.maxDist = scene.maxDist || Math.max(300, (b.x1 - b.x0) * 4);
    this.camera.minDist = scene.minDist || 1.2;
    this.camera.focusDepth = scene.focusDepth || 3;
    this.camera.fit(this.fitBox(), 0.92, true);
    if (opts.view) Object.assign(this.camera, opts.view);
    this.time = 0;
    this.weather.set(opts.weather || scene.weather || 'clear');
    this.weather.mix = { rain: 0, snow: 0, fog: 0, storm: 0 };
    if (this.audio.ctx) this.audio.load(scene, W);
    XS.bus.emit('scene', { scene, world: W, stage: this });
  }

  // The box the camera frames for "whole subject": scene.frame or the bounds.
  fitBox() {
    const b = this.scene.frame || this.scene.bounds;
    return { x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1, z0: b.z0 || 0, z1: b.z1 || 10 };
  }

  // ------------------------------------------------------------ cuts and slices
  setCuts(cuts) {
    this.cuts = this._cleanCuts(cuts);
    this.world.sections = this.cuts.slice();
    if (!this.cuts.length) this.explode = this.explodeTarget = 0;
    XS.bus.emit('cuts', { cuts: this.cuts.slice(), stage: this });
  }
  addCut(x) {
    const before = this.cuts.length;
    if (before >= this.maxCuts()) { XS.bus.emit('cutlimit', { max: this.maxCuts(), stage: this }); return false; }
    this.setCuts(this.cuts.concat([x]));
    return this.cuts.length > before;
  }
  maxCuts() { return this.scene && this.scene.slice !== false ? this.scene.maxCuts || 8 : 0; }
  removeCut(i) { const c = this.cuts.slice(); c.splice(i, 1); this.setCuts(c); }
  clearCuts() { this.setCuts([]); }
  suggestedCuts() { return (this.scene.suggestedCuts || []).slice(); }
  snapCut(x) { return this.scene.snapCut ? this.scene.snapCut(x) : Math.round(x * 2) / 2; }
  setOpen(open) { this.explodeTarget = open && this.cuts.length ? 1 : 0; XS.bus.emit('open', { open: !!this.explodeTarget }); }
  gap() { const b = this.scene.bounds; return this.scene.sliceGap || Math.max(3, (b.x1 - b.x0) * 0.05); }
  secOff(i) {
    if (!this.cuts.length || this.explode <= 0) return 0;
    return (i - this.cuts.length / 2) * this.gap() * easeInOut(this.explode);
  }
  secOf(x) { return this.world.secOf(x); }
  slices() {
    if (!this.cuts.length || this.explode <= 0) return [{ a: -1e9, b: 1e9, off: 0 }];
    const out = [];
    const c = this.cuts;
    for (let i = 0; i <= c.length; i++) out.push({ a: i === 0 ? -1e9 : c[i - 1], b: i === c.length ? 1e9 : c[i], off: this.secOff(i) });
    return out;
  }

  // ------------------------------------------------------------ projection helpers
  // Scene point to CSS pixels (null when behind the camera).
  project(x, y, z, withOffset = true) {
    const off = withOffset ? this.secOff(this.secOf(x)) : 0;
    const v = new THREE.Vector3(x + off, y, -z).project(this.camera.cam);
    if (v.z > 1 || v.z < -1) return null;
    return [(v.x * 0.5 + 0.5) * this.camera.W, (-v.y * 0.5 + 0.5) * this.camera.H];
  }
  subjectBox() {
    const b = this.scene.frame || this.scene.bounds;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const z of [0, Math.min(b.z1 || 10, 15)]) {
      const p = this.project(x, y, z, false);
      if (!p) continue;
      x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
    }
    const n = this.cuts.length && this.explode > 0 ? this.cuts.length : 0;
    if (n) { const g = this.gap() * easeInOut(this.explode) * n / 2 / this.camera.unitsPerPx(); x0 -= g; x1 += g; }
    return [x0, y0, x1, y1];
  }
  personPoint(p, up = 0.6) {
    const off = this.secOff(this.secOf(p.x));
    return new THREE.Vector3(p.x + off, p.y + p.H * up, -p.z);
  }

  // ------------------------------------------------------------ people
  select(p) {
    // Choosing someone ends the guided tour (whose next stop would otherwise drop them).
    if (p && this.tourIndex >= 0) this.tourStop();
    this.selected = p;
    if (p) this.camera.follow(() => this.personPoint(p, 0.55));
    else this.camera.follow(null);
    XS.bus.emit('select', { person: p, stage: this });
  }
  // The person under a screen point; pad (CSS px) widens the target for fingers.
  pick(sx, sy, pad = 0) {
    let best = null, bd = Infinity;
    for (const p of this.world.people) {
      if (p.hidden) continue;
      const f = this.project(p.x, p.y, p.z), h = this.project(p.x, p.y + p.H, p.z);
      if (!f || !h) continue;
      const hgt = Math.max(14, f[1] - h[1]), wd = Math.max(10, hgt * 0.4) + pad;
      if (sx < f[0] - wd || sx > f[0] + wd || sy < f[1] - hgt - 4 - pad || sy > f[1] + 4 + pad) continue;
      const d = Math.abs(sx - f[0]) + Math.abs(sy - (f[1] - hgt / 2)) * 0.5 - (p.name ? 6 : 0);
      if (d < bd) { bd = d; best = p; }
    }
    return best;
  }

  // ------------------------------------------------------------ tour
  tourStart() { if (!this.world.tour.length) return; this.tourIndex = -1; this.tourNext(); }
  tourStop() { this.tourIndex = -1; XS.bus.emit('tour', { stop: null, index: -1, stage: this }); }
  tourNext(dir = 1) {
    const T = this.world.tour;
    if (!T.length) return;
    this.tourIndex = (this.tourIndex + dir + T.length) % T.length;
    const s = T[this.tourIndex];
    this.select(null);
    const off = this.secOff(this.secOf(s.x));
    const t = Math.tan((this.camera.cam.fov * Math.PI) / 360);
    const dist = s.dist || (s.w ? s.w / 2 / (t * this.camera.cam.aspect) : this.camera.dist);
    this.camera.flyTo({ target: new THREE.Vector3(s.x + off, s.y, -(s.z || 0)), dist, yaw: s.yaw, pitch: s.pitch }, s.fly || 2.4);
    if (s.hour != null) this.world.hour = s.hour;
    this.tourTimer = (s.hold || 9) + (s.fly || 2.4);
    XS.bus.emit('tour', { stop: s, index: this.tourIndex, count: T.length, stage: this });
  }

  // ------------------------------------------------------------ frame
  _resize() {
    const r = this.canvas.getBoundingClientRect();
    const W = Math.max(1, r.width), H = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.rs = Math.min(dpr, 1.5) * this.quality;
    this.renderer.setPixelRatio(this.rs);
    this.renderer.setSize(W, H, false);
    const aspect0 = this.camera.W / Math.max(1, this.camera.H);
    this.camera.setSize(W, H);
    // A rotated phone or resized window: frame the subject again unless the viewer has moved.
    if (this.scene && !this.camera.moved && Math.abs(Math.log((W / H) / aspect0)) > 0.05) this.camera.fit(this.fitBox(), 0.92, true);
    this.overlay.width = Math.round(W * dpr); this.overlay.height = Math.round(H * dpr);
    this.odpr = dpr;
    const bw = Math.round(W * this.rs), bh = Math.round(H * this.rs);
    if (!this.rt || this.rt.width !== bw || this.rt.height !== bh) {
      if (this.rt) this.rt.dispose();
      this.rt = new THREE.WebGLRenderTarget(bw, bh, { count: 2, type: THREE.HalfFloatType, depthBuffer: true });
      this.rt.textures[0].minFilter = this.rt.textures[0].magFilter = THREE.LinearFilter;
      this.rt.textures[1].minFilter = this.rt.textures[1].magFilter = THREE.NearestFilter;
    }
  }

  _loop(now) {
    requestAnimationFrame(this._loop);
    let dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this._dt = dt;
    if (dt > 0) this.fps = this.fps * 0.95 + (1 / dt) * 0.05;
    if (!this.scene) return;
    this.frame++;
    if (this.explode !== this.explodeTarget) {
      const k = dt / 1.3;
      this.explode = this.explodeTarget > this.explode ? Math.min(1, this.explode + k) : Math.max(0, this.explode - k);
    }
    if (!this.paused) {
      this.time += dt;
      this.world.update(dt, this.time);
      if (this.scene.update) this.scene.update(this.world, dt, this.time, this);
    }
    if (this.tourIndex >= 0 && !this.camera.fly && !this.paused) {
      this.tourTimer -= dt;
      if (this.tourTimer <= 0) this.tourNext(1);
    }
    this.camera.update(dt);
    this.audio.update(this);
    this._adapt(dt);
    const t0 = performance.now();
    this.render();
    this.stats.drawMs = this.stats.drawMs * 0.9 + (performance.now() - t0) * 0.1;
  }

  // Keep the frame rate up on modest hardware by lowering the render scale, and raise it back.
  _adapt(dt) {
    if (!this.adaptive || document.hidden) return;
    const w = this.fpsWin;
    w.t += dt; w.n++;
    if (w.t < 2.5) return;
    const fps = w.n / w.t;
    w.t = 0; w.n = 0;
    if (fps < 26 && this.quality > 0.5) { this.quality = Math.max(0.5, this.quality * 0.85); this._resize(); w.good = 0; }
    else if (fps > 52) { if (++w.good >= 3 && this.quality < 1) { this.quality = Math.min(1, this.quality + 0.1); this._resize(); w.good = 0; } }
    else w.good = 0;
  }

  _people() {
    const F = this.figures;
    F.begin();
    const cam = this.camera.cam;
    const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const k = this.camera.H / (2 * Math.tan((cam.fov * Math.PI) / 360));
    const sph = new THREE.Sphere();
    for (const p of this.world.people) {
      if (p.hidden) continue;
      const off = this.secOff(this.secOf(p.x));
      sph.center.set(p.x + off, p.y + p.H * 0.5, -p.z); sph.radius = p.H;
      if (!frustum.intersectsSphere(sph)) continue;
      const d = cam.position.distanceTo(sph.center);
      const hp = (p.H / d) * k;
      if (hp < 1.0) continue;
      F.person(p, this.time, hp < 9 ? 0 : hp < 60 ? 1 : 2);
    }
    F.end();
  }

  _halos() {
    const s = this.world.sun();
    const out = [];
    const n = XS.math.smoothstep(0.2, 0.8, s.night);
    for (const L of this.lamps) {
      if (!L.halo) continue;
      const a = L.always ? 0.55 + 0.25 * n : n * 0.8;
      if (a < 0.02) continue;
      const fl = L.flicker ? 0.85 + 0.15 * Math.sin(this.time * 11 + L.x * 3) * Math.sin(this.time * 7 + L.z) : 1;
      out.push({ x: L.x, y: L.y, z: L.z, r: L.halo, color: L.color, a: a * 0.6 * fl * L.i });
    }
    if (this.scene.halos) this.scene.halos(out, this.world, this);
    return out;
  }

  render(target = null) {
    const r = this.renderer;
    r.info.reset();
    const cam = this.camera.cam;
    const W = this.world, scene = this.scene;
    applyLighting(W, scene);
    U.uTime.value = this.time;
    U.uFlicker.value = 0.96 + 0.04 * Math.sin(this.time * 9.0) * Math.sin(this.time * 5.3);
    this.sky.update(W, cam, scene);
    this.weather.update(this.paused ? 0 : this._dt || 0.016, this);
    if (this.seaMesh) updateSea(this.seaMesh, W);
    this._people();
    const slices = this.slices();
    // 1. Colour and info.
    r.setRenderTarget(this.rt);
    r.setClearColor(0x000000, 0);
    r.clear(true, true, true);
    U.uCutOn.value = 1;
    r.render(this.sky.scene, cam);
    for (const s of slices) {
      U.uOffset.value = s.off; U.uSlice.value.set(s.a, s.b);
      this.root.position.x = s.off;
      r.render(this.main, cam);
    }
    // 2. Ink.
    const iu = this.ink.uniforms;
    iu.tColor.value = this.rt.textures[0]; iu.tInfo.value = this.rt.textures[1];
    iu.uRes.value.set(this.rt.width, this.rt.height);
    iu.uScale.value = this.rt.width / this.camera.W;
    iu.uNight.value = U.uNight.value;
    r.setRenderTarget(target);
    r.clear(true, true, true);
    r.render(this.ink.scene, this.ink.camera);
    // 3. Overlay.
    OU.tInfo.value = this.rt.textures[1];
    OU.uRes.value.set(this.rt.width, this.rt.height);
    W.particles.sync(this._halos());
    for (const s of slices) {
      U.uOffset.value = s.off; U.uSlice.value.set(s.a, s.b);
      this.overRoot.position.x = s.off;
      r.render(this.over, cam);
    }
    U.uOffset.value = 0; U.uSlice.value.set(-1e9, 1e9);
    this.root.position.x = 0; this.overRoot.position.x = 0;
    // 4. 2D overlay.
    if (!target) this.draw2D(this.octx, this.odpr);
  }

  view() {
    return {
      S: 1 / this.camera.unitsPerPx(), W: this.camera.W, H: this.camera.H, world: this.world,
      project: (x, y, z) => this.project(x, y, z), subjectBox: () => this.subjectBox(), secOf: (x) => this.secOf(x),
      insets: this.insets, reserved: this.reserved,
    };
  }

  draw2D(ctx, dpr) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.sliceMode || (this.cuts.length && this.explode === 0)) this._cutGuides(ctx);
    if (this.selected) this._ring(ctx, this.selected);
    this.labels.enabled = this.showLabels;
    this.labels.draw(ctx, this.view(), this.world.labels, THEME);
    if (this.hoverPerson && this.hoverPerson !== this.selected) this._tooltip(ctx, this.hoverPerson);
  }

  _ring(ctx, p) {
    const f = this.project(p.x, p.y, p.z), h = this.project(p.x, p.y + p.H, p.z);
    if (!f || !h) return;
    const hh = Math.max(16, f[1] - h[1]);
    ctx.strokeStyle = THEME.accent; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.85;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.ellipse(f[0], f[1] - hh / 2, hh * 0.45, hh * 0.7, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
  _tooltip(ctx, p) {
    const h = this.project(p.x, p.y + p.H, p.z);
    if (!h) return;
    const text = (p.name ? p.name + (p.role ? ', ' + p.role : '') : (p.role ? p.role.charAt(0).toUpperCase() + p.role.slice(1) : 'Someone')) + ' · ' + p.currentLabel().toLowerCase();
    ctx.font = 'italic 12.5px "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
    const w = ctx.measureText(text).width + 14;
    const x = clamp(h[0] - w / 2, 4, this.camera.W - w - 4), y = Math.max(4, h[1] - 30);
    ctx.fillStyle = THEME.paperHi; ctx.strokeStyle = THEME.ink; ctx.lineWidth = 0.8;
    ctx.fillRect(x, y, w, 21); ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 20);
    ctx.fillStyle = THEME.ink; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 7, y + 11);
  }
  _cutGuides(ctx) {
    const b = this.scene.bounds;
    const draw = (x, i, ghost) => {
      const top = this.project(x, b.y1, 0, false), bot = this.project(x, b.y0, 0, false);
      if (!top || !bot) return null;
      const off = i >= 0 ? this.secOff(i) / this.camera.unitsPerPx() : 0;
      const tx = top[0] + off, bx = bot[0] + off;
      ctx.strokeStyle = THEME.cut; ctx.globalAlpha = ghost ? 0.55 : 0.9; ctx.lineWidth = ghost ? 1 : 1.6;
      ctx.setLineDash([7, 5]);
      ctx.beginPath(); ctx.moveTo(tx, Math.max(0, top[1] - 10)); ctx.lineTo(bx, Math.min(this.camera.H, bot[1] + 8)); ctx.stroke();
      ctx.setLineDash([]);
      const I = this.insets;
      const hy = clamp(top[1] - 24, I.top + 14, Math.max(I.top + 14, this.camera.H - I.bottom - 30)), hx = tx;
      ctx.globalAlpha = ghost ? 0.65 : 1;
      ctx.fillStyle = THEME.paperHi;
      ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(hx - 3.4, hy + 3.5, 2.4, 0, Math.PI * 2);
      ctx.moveTo(hx + 5.8, hy + 3.5); ctx.arc(hx + 3.4, hy + 3.5, 2.4, 0, Math.PI * 2);
      ctx.moveTo(hx - 2, hy + 1.6); ctx.lineTo(hx + 3, hy - 6.5);
      ctx.moveTo(hx + 2, hy + 1.6); ctx.lineTo(hx - 3, hy - 6.5);
      ctx.stroke();
      if (!ghost && this.sliceMode) {
        const R = this._coarse ? 10 : 7, a = R * 0.43;
        const rx = hx + 14 + (R - 7), ry = hy - 10 - (R - 7);
        ctx.fillStyle = THEME.cut;
        ctx.beginPath(); ctx.arc(rx, ry, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(rx - a, ry - a); ctx.lineTo(rx + a, ry + a); ctx.moveTo(rx + a, ry - a); ctx.lineTo(rx - a, ry + a); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const R = this._coarse ? 10 : 7;
      return { hx, hy, rx: hx + 14 + (R - 7), ry: hy - 10 - (R - 7), tx, bx, ty: top[1], by: bot[1] };
    };
    this._cutHandles = this.cuts.map((x, i) => Object.assign({ i, x }, draw(x, this.explode > 0 ? i : -1, false) || {}));
    if (this.sliceMode && this.sliceHover != null && this.dragCut < 0) draw(this.sliceHover, -1, true);
  }

  // ------------------------------------------------------------ input
  _bindInput() {
    const cv = this.overlay;
    cv.style.touchAction = 'none';
    // Coarse pointers get larger handles and hit areas; updated by each pointer that arrives.
    const coarse = window.matchMedia ? window.matchMedia('(pointer: coarse)') : null;
    this._coarse = !!(coarse && coarse.matches);
    let down = null, pinch = null, last = null, lastTap = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const two = () => {
      const [a, b] = [...this.pointers.values()];
      return { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, ang: Math.atan2(b.y - a.y, b.x - a.x) };
    };
    const following = () => !!(this.selected && this.camera.followFn);
    // Looking away from the person being followed: keep them selected but stop the camera.
    const lookAway = () => {
      if (!following()) return;
      this.camera.followFn = null;
      XS.bus.emit('follow', { person: this.selected, following: false, stage: this });
    };
    const endCutDrag = () => { if (this.dragCut >= 0) { this.dragCut = -1; this.setCuts(this.cuts); } };
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('pointerdown', (e) => {
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* a pointer that is already gone */ }
      const touch = e.pointerType === 'touch';
      this._coarse = touch;
      const [x, y] = pos(e);
      const now = performance.now();
      this.pointers.set(e.pointerId, { x, y });
      if (this.pointers.size >= 2) {
        // A second finger: pinch to zoom, move both to pan, twist to turn the view.
        if (this.pointers.size === 2) pinch = Object.assign(two(), { twist: 0 });
        if (down && down.cut) endCutDrag();
        down = null;
        return;
      }
      last = { x, y, t: now };
      if (this.sliceMode && this._cutHandles) {
        const rRemove = touch ? 22 : 10, rDrag = touch ? 26 : 15;
        let best = null;
        for (const h of this._cutHandles) {
          if (h.hx == null) continue;
          const dr = Math.hypot(x - h.rx, y - h.ry), dd = Math.hypot(x - h.hx, y - h.hy);
          // A mouse hits the small x first; a finger gets whichever target is nearer.
          if (dr < rRemove && (!best || !touch || dr < best.d)) best = { h, d: touch ? dr : -1, remove: true };
          if (dd < rDrag && (!best || (touch && dd < best.d))) best = { h, d: dd, remove: false };
        }
        if (best && best.remove) { this.removeCut(best.h.i); down = null; return; }
        if (best) { this.dragCut = best.h.i; down = { x, y, t: now, moved: 0, cut: true }; return; }
      }
      const orbit = e.button === 2 || e.shiftKey || e.altKey || e.ctrlKey;
      down = { x, y, t: now, moved: 0, orbit };
      this.camera.v.set(0, 0);
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y] = pos(e);
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x, y });
      if (pinch && this.pointers.size === 2) {
        const P = two();
        const f = following();
        if (!f) this.camera.panBy(P.cx - pinch.cx, P.cy - pinch.cy);
        let da = P.ang - pinch.ang;
        if (da > Math.PI) da -= 2 * Math.PI;
        if (da < -Math.PI) da += 2 * Math.PI;
        pinch.twist += da;
        // Twist turns the view once it is clearly meant (a pinch always wobbles a little).
        if (Math.abs(pinch.twist) > 0.15 && Math.abs(da) < 0.5) this.camera.orbitBy(-da / 0.006 * 0.8, 0);
        this.camera.zoomAt(pinch.d / Math.max(1, P.d), f ? this.camera.W / 2 : P.cx, f ? this.camera.H / 2 : P.cy, false);
        Object.assign(pinch, { d: P.d, cx: P.cx, cy: P.cy, ang: P.ang });
        return;
      }
      if (down && last) {
        const dx = x - last.x, dy = y - last.y;
        down.moved += Math.abs(dx) + Math.abs(dy);
        if (down.cut && this.dragCut >= 0) {
          // Keep the dragged cut between its neighbours so the slices stay in order.
          const i = this.dragCut, c = this.cuts, b = this.scene.bounds;
          const lim = this.scene.cutRange || [b.x0 + 1, b.x1 - 1];
          const off = this.explode > 0 ? this.secOff(i) : 0;
          const lo = i > 0 ? c[i - 1] + 1.01 : lim[0], hi = i < c.length - 1 ? c[i + 1] - 1.01 : lim[1];
          c[i] = clamp(this.snapCut(this.camera.pointUnder(x, y, 0).x - off), lo, Math.max(lo, hi));
          this.world.sections = c.slice();
        } else if (down.moved > 4) {
          if (down.orbit) this.camera.orbitBy(dx, dy);
          else {
            this.camera.panBy(dx, dy);
            const dtm = Math.max(1, performance.now() - last.t) / 1000;
            this.camera.v.set(dx / dtm * 0.5, dy / dtm * 0.5);
          }
          lookAway();
        }
        last = { x, y, t: performance.now() };
      } else if (this.world && e.pointerType !== 'touch') {
        if (this.sliceMode) {
          const px = this.camera.pointUnder(x, y, 0).x;
          const b = this.scene.bounds;
          this.sliceHover = px > b.x0 && px < b.x1 ? this.snapCut(px) : null;
        }
        this.hoverPerson = this.pick(x, y);
        const L = this.labels.hit(x, y);
        this.labels.hover = L;
        cv.style.cursor = this.sliceMode ? 'crosshair' : this.hoverPerson || (L && L.body) ? 'pointer' : 'grab';
      }
    });
    const end = (e) => {
      const [x, y] = pos(e);
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) pinch = null;
      if (!down) return;
      const now = performance.now(), touch = e.pointerType === 'touch';
      const click = down.moved < (touch ? 10 : 6) && now - down.t < 500;
      const ts = e.timeStamp; // input time, not handler time: frames can be slow
      if (down.cut) endCutDrag();
      else if (click) {
        this.camera.v.set(0, 0);
        // A second tap close by and soon after zooms in, as a double-click does with a mouse.
        if (touch && lastTap && ts - lastTap.t < 350 && Math.hypot(x - lastTap.x, y - lastTap.y) < 30) { lastTap = null; this._zoomIn(x, y); }
        else { lastTap = touch ? { x, y, t: ts } : null; this._click(x, y, e.pointerType); }
      } else if ((last && now - last.t > 80) || down.orbit) this.camera.v.set(0, 0);
      down = null;
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', (e) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) pinch = null;
      if (down && down.cut) endCutDrag();
      down = null;
    });
    cv.addEventListener('pointerleave', () => { this.hoverPerson = null; this.sliceHover = null; });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [x, y] = pos(e);
      const k = Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015) * (e.deltaMode === 1 ? 16 : 1));
      // While following someone, zoom about them and keep following.
      const f = following();
      this.camera.zoomAt(k, f ? this.camera.W / 2 : x, f ? this.camera.H / 2 : y, true);
    }, { passive: false });
    cv.addEventListener('dblclick', (e) => {
      if (performance.now() - (this._tapZoomAt || -1e9) < 600) return; // already zoomed by the double tap
      const [x, y] = pos(e);
      this._zoomIn(x, y);
    });
  }

  _zoomIn(x, y) {
    this._tapZoomAt = performance.now();
    const P = this.camera.pointUnder(x, y);
    this.camera.flyTo({ target: P, dist: this.camera.dist / 2.4 }, 0.9);
  }

  _click(x, y, pointerType) {
    if (this.sliceMode) {
      const px = this.camera.pointUnder(x, y, 0).x;
      const b = this.scene.bounds;
      if (px > b.x0 && px < b.x1) this.addCut(this.snapCut(px));
      return;
    }
    const L = this.labels.hit(x, y);
    if (L && L.body) { XS.bus.emit('fact', { label: L, stage: this }); return; }
    const p = this.pick(x, y, pointerType === 'touch' ? 12 : 0);
    if (p) { this.select(p); return; } // select() ends the tour cleanly
    if (this.selected) this.select(null);
  }

  // ------------------------------------------------------------ sound
  setSound(on) {
    if (on) { if (this.audio.start()) this.audio.load(this.scene, this.world); }
    else this.audio.stop();
    XS.bus.emit('sound', { on: this.audio.on });
    return this.audio.on;
  }

  // ------------------------------------------------------------ pictures
  // Render the current view at `scale` times CSS resolution, with captions, into a 2D canvas.
  snapshot(scale = 2) {
    const W = this.camera.W, H = this.camera.H;
    const prevQ = this.rs;
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(W, H, false);
    const rt0 = this.rt;
    this.rt = new THREE.WebGLRenderTarget(Math.round(W * scale), Math.round(H * scale), { count: 2, type: THREE.HalfFloatType, depthBuffer: true });
    this.rt.textures[1].minFilter = this.rt.textures[1].magFilter = THREE.NearestFilter;
    this.render(null);
    const out = document.createElement('canvas');
    out.width = Math.round(W * scale); out.height = Math.round(H * scale);
    const g = out.getContext('2d');
    g.drawImage(this.renderer.domElement, 0, 0, out.width, out.height);
    this.draw2DTo(g, scale);
    this.rt.dispose();
    this.rt = rt0;
    this.renderer.setPixelRatio(prevQ);
    this.renderer.setSize(W, H, false);
    return out;
  }
  draw2DTo(ctx, scale) {
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    this.labels.draw(ctx, this.view(), this.world.labels, THEME);
    ctx.restore();
  }
}

export { Person };

