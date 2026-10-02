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
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._bindInput();
    this._loop = this._loop.bind(this);
    this.last = performance.now();
    requestAnimationFrame(this._loop);
  }

  // ------------------------------------------------------------ lifecycle
  _clear() {
    const kill = (g) => {
      for (const o of [...g.children]) {
        g.remove(o);
        o.traverse((n) => { if (n.geometry && !n.userData.keepGeo) n.geometry.dispose(); });
      }
    };
    kill(this.root); kill(this.overRoot);
    for (const o of [...this.over.children]) if (o !== this.overRoot) this.over.remove(o);
    if (U.uLamp.value) U.uLamp.value.dispose();
  }

  load(id, opts = {}) {
    const scene = XS.scenes.byId.get(id);
    if (!scene) throw new Error('unknown scene ' + id);
    this._clear();
    this.scene = scene;
    const b = scene.bounds;
    this.cuts = (opts.cuts || []).filter((x) => x > b.x0 && x < b.x1).sort((a, c) => a - c);
    this.explode = this.explodeTarget = opts.open && this.cuts.length ? 1 : 0;
    this.selected = null;
    this.camera.followFn = null;
    this.tourIndex = -1;
    // Build the static drawing.
    const t0 = performance.now();
    const kit = new Kit(scene);
    this.kit = kit;
    scene.build(kit, this);
    for (const m of kit.meshes()) (m.userData.overlay ? this.overRoot : this.root).add(m);
    for (const g of kit.parts) (g.userData.overlay ? this.overRoot : this.root).add(g);
    this.stats.buildMs = performance.now() - t0;
    this.stats.tris = kit.tris;
    // The living world.
    const W = new World(scene);
    W.sections = this.cuts.slice();
    if (opts.hour != null) W.hour = opts.hour;
    W.onActor = (a) => { if (a.object) this.root.add(a.object); };
    this.world = W;
    const t1 = performance.now();
    if (scene.setup) scene.setup(W, this, kit);
    for (const L of kit.labels) W.labels.push(L);
    // Parts made during setup.
    for (const g of kit.parts) if (!g.parent) (g.userData.overlay ? this.overRoot : this.root).add(g);
    this.stats.setupMs = performance.now() - t1;
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
    const b = this.scene.bounds;
    const lim = this.scene.cutRange || [b.x0 + 1, b.x1 - 1];
    const clean = [...new Set(cuts.map((x) => clamp(x, lim[0], lim[1])).map((x) => Math.round(x * 100) / 100))].sort((a, c) => a - c);
    const out = [];
    for (const x of clean) if (!out.length || x - out[out.length - 1] > 1.0) out.push(x);
    this.cuts = out.slice(0, this.scene.maxCuts || 8);
    this.world.sections = this.cuts.slice();
    if (!this.cuts.length) this.explode = this.explodeTarget = 0;
    XS.bus.emit('cuts', { cuts: this.cuts.slice(), stage: this });
  }
  addCut(x) { this.setCuts(this.cuts.concat([x])); }
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
    this.selected = p;
    if (p) this.camera.follow(() => this.personPoint(p, 0.55));
    else this.camera.follow(null);
    XS.bus.emit('select', { person: p, stage: this });
  }
  pick(sx, sy) {
    let best = null, bd = Infinity;
    for (const p of this.world.people) {
      if (p.hidden) continue;
      const f = this.project(p.x, p.y, p.z), h = this.project(p.x, p.y + p.H, p.z);
      if (!f || !h) continue;
      const hgt = Math.max(14, f[1] - h[1]), wd = Math.max(10, hgt * 0.4);
      if (sx < f[0] - wd || sx > f[0] + wd || sy < f[1] - hgt - 4 || sy > f[1] + 4) continue;
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
    this.camera.setSize(W, H);
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
    if (this.tourIndex >= 0 && !this.camera.fly) {
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
      const hy = clamp(top[1] - 24, 16, this.camera.H - 100), hx = tx;
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
        ctx.fillStyle = THEME.cut;
        ctx.beginPath(); ctx.arc(hx + 14, hy - 10, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(hx + 11, hy - 13); ctx.lineTo(hx + 17, hy - 7); ctx.moveTo(hx + 17, hy - 13); ctx.lineTo(hx + 11, hy - 7); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return { hx, hy, tx, bx, ty: top[1], by: bot[1] };
    };
    this._cutHandles = this.cuts.map((x, i) => Object.assign({ i, x }, draw(x, this.explode > 0 ? i : -1, false) || {}));
    if (this.sliceMode && this.sliceHover != null && this.dragCut < 0) draw(this.sliceHover, -1, true);
  }

  // ------------------------------------------------------------ input
  _bindInput() {
    const cv = this.overlay;
    cv.style.touchAction = 'none';
    let down = null, pinch = null, last = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId);
      const [x, y] = pos(e);
      this.pointers.set(e.pointerId, { x, y });
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
        down = null;
        return;
      }
      if (this.sliceMode && this._cutHandles) {
        for (const h of this._cutHandles) {
          if (h.hx == null) continue;
          if (Math.hypot(x - (h.hx + 14), y - (h.hy - 10)) < 10) { this.removeCut(h.i); down = null; return; }
          if (Math.hypot(x - h.hx, y - h.hy) < 15) { this.dragCut = h.i; down = { x, y, t: performance.now(), moved: 0, cut: true }; return; }
        }
      }
      const orbit = e.button === 2 || e.shiftKey || e.altKey || e.ctrlKey;
      down = { x, y, t: performance.now(), moved: 0, orbit };
      this.camera.v.set(0, 0);
      last = { x, y, t: performance.now() };
    });
    cv.addEventListener('pointermove', (e) => {
      const [x, y] = pos(e);
      if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x, y });
      if (pinch && this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        this.camera.panBy(cx - pinch.cx, cy - pinch.cy);
        this.camera.zoomAt(pinch.d / Math.max(1, d), cx, cy, false);
        pinch = { d, cx, cy };
        this.camera.followFn = null;
        return;
      }
      if (down) {
        const dx = x - last.x, dy = y - last.y;
        down.moved += Math.abs(dx) + Math.abs(dy);
        if (down.cut && this.dragCut >= 0) {
          const off = this.explode > 0 ? this.secOff(this.dragCut) : 0;
          this.cuts[this.dragCut] = this.snapCut(this.camera.pointUnder(x, y, 0).x - off);
          this.world.sections = this.cuts.slice().sort((a, b) => a - b);
        } else if (down.moved > 4) {
          if (down.orbit) this.camera.orbitBy(dx, dy);
          else {
            this.camera.panBy(dx, dy);
            const dtm = Math.max(1, performance.now() - last.t) / 1000;
            this.camera.v.set(dx / dtm * 0.5, dy / dtm * 0.5);
          }
          if (this.selected) this.camera.followFn = null;
        }
        last = { x, y, t: performance.now() };
      } else if (this.world) {
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
      const click = down.moved < 6 && performance.now() - down.t < 500;
      if (down.cut) { this.dragCut = -1; this.setCuts(this.cuts); }
      else if (click) { this.camera.v.set(0, 0); this._click(x, y); }
      else if (performance.now() - last.t > 80 || down.orbit) this.camera.v.set(0, 0);
      down = null;
    };
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', () => { this.hoverPerson = null; this.sliceHover = null; });
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      const [x, y] = pos(e);
      const k = Math.exp(e.deltaY * (e.ctrlKey ? 0.01 : 0.0015) * (e.deltaMode === 1 ? 16 : 1));
      this.camera.zoomAt(k, x, y, true);
      if (this.selected) this.camera.followFn = null;
    }, { passive: false });
    cv.addEventListener('dblclick', (e) => {
      const [x, y] = pos(e);
      const P = this.camera.pointUnder(x, y);
      this.camera.flyTo({ target: P, dist: this.camera.dist / 2.4 }, 0.9);
    });
  }

  _click(x, y) {
    if (this.sliceMode) {
      const px = this.camera.pointUnder(x, y, 0).x;
      const b = this.scene.bounds;
      if (px > b.x0 && px < b.x1) this.addCut(this.snapCut(px));
      return;
    }
    const L = this.labels.hit(x, y);
    if (L && L.body) { XS.bus.emit('fact', { label: L, stage: this }); return; }
    const p = this.pick(x, y);
    if (p) { this.select(p); this.tourIndex = -1; return; }
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

