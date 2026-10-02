/* Sound: a procedural soundscape. No recordings: everything is synthesised.
 *
 * A scene declares an ambient bed and point sources:
 *   scene.ambience = { sea: 0.6, wind: 0.3, rain: 0, crowd: 0, room: 0.2, reverb: 0.3, size: 2 }
 *   world.sound({ kind: 'engine', x, y, z, r: 30, gain: 0.5, hz: 42, when: 'always' })
 * Point sources are louder the closer the camera is: zoom into the engine room and the
 * engines take over; pull back and the whole subject murmurs together.
 *
 * Kinds: sea, wind, rain, crowd, room (beds); engine, machine (clank), chuff, fire, hum,
 * drip, creak, clock, bell, gulls, organ, band, strings, voice (point sources).
 * Sound is off until the viewer turns it on (browsers require a gesture anyway).
 */
import { XS, h01 } from './core.js';

const { clamp } = XS.math;

function noiseBuffer(ctx, seconds = 4, color = 'white') {
  const n = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, last = 0;
  for (let i = 0; i < n; i++) {
    const w = h01(i, 91) * 2 - 1;
    if (color === 'pink') { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18; }
    else if (color === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    else d[i] = w * 0.5;
  }
  return buf;
}

export class Audio {
  constructor() {
    this.ctx = null;
    this.on = false;
    this.volume = 0.8;
    this.voices = [];
    this.beds = {};
    this.bellQueue = [];
  }

  // Must be called from a user gesture.
  start() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = 0;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 3;
      this.master.connect(comp).connect(c.destination);
      this.dry = c.createGain(); this.dry.connect(this.master);
      this.verb = c.createConvolver(); this.verbGain = c.createGain(); this.verbGain.gain.value = 0.2;
      this.verb.connect(this.verbGain).connect(this.master);
      this.bus = c.createGain(); this.bus.connect(this.dry); this.bus.connect(this.verb);
      this.noise = { white: noiseBuffer(c, 4, 'white'), pink: noiseBuffer(c, 6, 'pink'), brown: noiseBuffer(c, 6, 'brown') };
      this._impulse(2);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.on = true;
    this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.6);
    return true;
  }
  stop() {
    this.on = false;
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    // Once faded, suspend the graph so the beds and voices stop costing CPU; start() resumes.
    clearTimeout(this._suspendT);
    this._suspendT = setTimeout(() => { if (!this.on && this.ctx.state === 'running') this.ctx.suspend(); }, 1200);
  }

  _impulse(size) {
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * clamp(size, 0.3, 6));
    const buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (h01(i, 7 + ch) * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.verb.buffer = buf;
  }

  _src(buf, loop = true, rate = 1) {
    const s = this.ctx.createBufferSource();
    s.buffer = buf; s.loop = loop; s.playbackRate.value = rate;
    s.loopStart = h01(this.voices.length, 3) * (buf.duration - 0.5);
    s.start(0, s.loopStart);
    return s;
  }
  _filter(type, f, q = 0.7) { const n = this.ctx.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; }
  _gain(v = 0) { const g = this.ctx.createGain(); g.gain.value = v; return g; }

  // Load a scene's soundscape (replacing the previous one).
  load(scene, world) {
    this.scene = scene; this.world = world;
    if (!this.ctx) return;
    this.clear();
    const A = scene.ambience || {};
    this._impulse(A.size || 1.6);
    this.verbGain.gain.value = A.reverb != null ? A.reverb : 0.18;
    for (const k of ['sea', 'wind', 'rain', 'crowd', 'room']) if (A[k]) this.beds[k] = this._bed(k, A[k]);
    for (const s of world.sounds || []) this.voices.push(this._voice(s));
  }
  clear() {
    for (const v of this.voices) v.stop();
    for (const k in this.beds) this.beds[k].stop();
    this.voices = []; this.beds = {};
  }

  _bed(kind, level) {
    const c = this.ctx;
    const out = this._gain(0); out.connect(this.bus);
    const nodes = [];
    const add = (n) => { nodes.push(n); return n; };
    if (kind === 'sea') {
      const a = add(this._src(this.noise.brown)), f = add(this._filter('lowpass', 520)), g = add(this._gain(0.9));
      a.connect(f).connect(g).connect(out);
      const b = add(this._src(this.noise.pink, true, 0.8)), f2 = add(this._filter('bandpass', 1400, 0.5)), g2 = add(this._gain(0.0));
      b.connect(f2).connect(g2).connect(out);
      return { out, level, stop: () => nodes.forEach((n) => n.stop && n.stop()), tick: (t) => {
        const swell = 0.55 + 0.45 * Math.sin(t * 0.8) * Math.sin(t * 0.31 + 1);
        g.gain.setTargetAtTime(0.6 + swell * 0.6, c.currentTime, 0.4);
        g2.gain.setTargetAtTime(Math.max(0, swell - 0.6) * 1.4, c.currentTime, 0.2);
      } };
    }
    if (kind === 'wind') {
      const a = add(this._src(this.noise.pink)), f = add(this._filter('bandpass', 500, 0.9)), g = add(this._gain(0.6));
      a.connect(f).connect(g).connect(out);
      return { out, level, stop: () => nodes.forEach((n) => n.stop && n.stop()), tick: (t) => {
        const gust = 0.5 + 0.5 * Math.sin(t * 0.37) * Math.sin(t * 0.13 + 2);
        f.frequency.setTargetAtTime(300 + gust * 700, c.currentTime, 0.5);
        g.gain.setTargetAtTime(0.25 + gust * 0.8, c.currentTime, 0.5);
      } };
    }
    if (kind === 'rain') {
      const a = add(this._src(this.noise.white)), f = add(this._filter('highpass', 2500)), g = add(this._gain(0.35));
      a.connect(f).connect(g).connect(out);
      return { out, level, stop: () => nodes.forEach((n) => n.stop && n.stop()), tick: () => {} };
    }
    if (kind === 'crowd') {
      const gs = [];
      for (const [fq, q] of [[480, 3], [1100, 4], [2300, 5], [800, 3]]) {
        const a = add(this._src(this.noise.pink, true, 0.9 + gs.length * 0.05)), f = add(this._filter('bandpass', fq, q)), g = add(this._gain(0));
        a.connect(f).connect(g).connect(out); gs.push(g);
      }
      return { out, level, stop: () => nodes.forEach((n) => n.stop && n.stop()), tick: (t) => {
        gs.forEach((g, i) => g.gain.setTargetAtTime(0.25 + 0.35 * Math.abs(Math.sin(t * (3.1 + i * 1.7) + i)) * Math.abs(Math.sin(t * 0.7 + i * 2)), c.currentTime, 0.05));
      } };
    }
    // room tone
    const a = add(this._src(this.noise.brown, true, 0.6)), f = add(this._filter('lowpass', 220)), g = add(this._gain(0.7));
    a.connect(f).connect(g).connect(out);
    return { out, level, stop: () => nodes.forEach((n) => n.stop && n.stop()), tick: () => {} };
  }

  _voice(s) {
    const c = this.ctx;
    const out = this._gain(0);
    const pan = c.createStereoPanner ? c.createStereoPanner() : null;
    if (pan) out.connect(pan).connect(this.bus); else out.connect(this.bus);
    const nodes = [];
    const add = (n) => { nodes.push(n); return n; };
    const v = { s, out, pan, nodes, stop: () => nodes.forEach((n) => { try { n.stop && n.stop(); } catch (e) { /* stopped */ } }), next: 0, tick: null };
    const k = s.kind;
    if (k === 'engine' || k === 'hum') {
      const f0 = s.hz || (k === 'hum' ? 100 : 40);
      const o1 = add(c.createOscillator()); o1.type = k === 'hum' ? 'sine' : 'sawtooth'; o1.frequency.value = f0;
      const o2 = add(c.createOscillator()); o2.type = 'sine'; o2.frequency.value = f0 / 2;
      const lp = this._filter('lowpass', k === 'hum' ? 400 : f0 * 6, 1.2);
      const g1 = this._gain(0.25), g2 = this._gain(0.5);
      o1.connect(g1).connect(lp).connect(out); o2.connect(g2).connect(out);
      const n = add(this._src(this.noise.brown)), nf = this._filter('lowpass', 300), ng = this._gain(k === 'hum' ? 0.1 : 0.5);
      n.connect(nf).connect(ng).connect(out);
      o1.start(); o2.start();
      v.tick = (t) => { const w = 1 + 0.01 * Math.sin(t * 1.3); o1.frequency.setTargetAtTime(f0 * w, c.currentTime, 0.2); };
    } else if (k === 'fire') {
      const n = add(this._src(this.noise.brown)), f = this._filter('lowpass', 700), g = this._gain(0.5);
      n.connect(f).connect(g).connect(out);
      v.tick = (t) => { if (t > v.next) { v.next = t + 0.04 + h01(Math.floor(t * 100), 5) * 0.25; this._click(out, 1800 + h01(Math.floor(t * 50), 9) * 3000, 0.02, 0.5); } };
    } else if (k === 'machine' || k === 'chuff' || k === 'drip' || k === 'creak' || k === 'clock') {
      v.tick = (t, w) => {
        const rate = typeof s.rate === 'function' ? s.rate(w) : s.rate || (k === 'clock' ? 1 : k === 'drip' ? 0.6 : 1.2);
        if (rate <= 0) return;
        if (t > v.next) {
          const jitter = k === 'drip' || k === 'creak' ? h01(Math.floor(t * 10), 4) * 2 : 0;
          v.next = t + 1 / rate + jitter;
          if (k === 'machine') this._click(out, s.pitch || 900, 0.08, 0.9, 6);
          else if (k === 'chuff') this._burst(out, 0.18, 600, 0.9);
          else if (k === 'drip') this._tone(out, 1400 + h01(Math.floor(t), 2) * 800, 0.12, 0.3, 'sine', 0.6);
          else if (k === 'creak') this._tone(out, 180 + h01(Math.floor(t), 6) * 120, 0.5, 0.25, 'sawtooth', 1.4);
          else this._click(out, 3000, 0.01, 0.4, 10);
        }
      };
    } else if (k === 'bell') {
      v.last = -1;
      v.tick = (t, w) => {
        // Strike on the hour (or ship's bells every half hour with s.ship).
        const h = w.hour;
        const slot = s.ship ? Math.floor(h * 2) : Math.floor(h);
        if (v.last < 0) { v.last = slot; return; }
        if (slot !== v.last) {
          v.last = slot;
          const strikes = s.ship ? ((slot % 8) || 8) : ((Math.floor(h) % 12) || 12);
          for (let i = 0; i < Math.min(strikes, 12); i++) {
            const pairGap = s.ship ? (Math.floor(i / 2) * 1.1 + (i % 2) * 0.45) : i * 2.2;
            this._bell(out, s.hz || (s.ship ? 1250 : 330), c.currentTime + 0.05 + pairGap, s.ship ? 2.2 : 5.5);
          }
        }
      };
    } else if (k === 'gulls') {
      v.tick = (t, w) => { if (w.sun().day > 0.4 && t > v.next) { v.next = t + 3 + h01(Math.floor(t), 8) * 9; this._gull(out); } };
    } else if (k === 'organ' || k === 'strings') {
      const chords = s.chords || [[0, 4, 7, 12], [5, 9, 12, 17], [7, 11, 14, 19], [0, 4, 7, 12], [9, 12, 16, 21], [5, 9, 12, 17], [7, 11, 14, 17], [0, 4, 7, 12]];
      const root = s.hz || 130.81;
      const oscs = [];
      for (let i = 0; i < 4; i++) {
        const o = add(c.createOscillator()); o.type = k === 'organ' ? 'square' : 'sawtooth';
        const lp = this._filter('lowpass', k === 'organ' ? 1400 : 1800, 0.5), g = this._gain(0.07);
        o.connect(lp).connect(g).connect(out); o.start(); oscs.push(o);
      }
      v.ci = -1;
      v.tick = (t) => {
        const ci = Math.floor(t / (s.beat || 4)) % chords.length;
        if (ci !== v.ci) { v.ci = ci; chords[ci].forEach((st, i) => oscs[i].frequency.setTargetAtTime(root * Math.pow(2, st / 12), c.currentTime, k === 'organ' ? 0.08 : 0.4)); }
      };
    } else if (k === 'band') { // a small dance band: a waltz on piano-like tones
      const prog = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14], [0, 4, 7]];
      const root = s.hz || 196;
      v.beat = 0;
      v.tick = (t) => {
        const bpm = s.bpm || 132;
        const b = Math.floor((t * bpm) / 60);
        if (b !== v.beat) {
          v.beat = b;
          const ch = prog[Math.floor(b / 3) % prog.length];
          if (b % 3 === 0) this._tone(out, root * Math.pow(2, (ch[0] - 12) / 12), 0.6, 0.35, 'triangle', 1.2);
          else ch.slice(1).forEach((st) => this._tone(out, root * Math.pow(2, st / 12), 0.3, 0.18, 'triangle', 0.6));
          if (b % 3 === 0 && h01(b, 3) > 0.35) this._tone(out, root * 2 * Math.pow(2, ch[(b / 3) % 3 | 0] / 12), 0.5, 0.2, 'sine', 0.9);
        }
      };
    } else if (k === 'voice') { // a distant singer: a slow, vibrato line
      const o = add(c.createOscillator()); o.type = 'sawtooth';
      const f1 = this._filter('bandpass', 700, 4), f2 = this._filter('bandpass', 1150, 5), g = this._gain(0);
      o.connect(f1).connect(g); o.connect(f2).connect(g); g.connect(out); o.start();
      const notes = s.notes || [0, 2, 4, 5, 7, 5, 4, 2, 0, -1, 0];
      v.tick = (t) => {
        const ni = Math.floor(t / 1.6) % notes.length;
        const vib = 1 + 0.012 * Math.sin(t * 34);
        o.frequency.setTargetAtTime((s.hz || 392) * Math.pow(2, notes[ni] / 12) * vib, c.currentTime, 0.05);
        g.gain.setTargetAtTime(0.25 + 0.15 * Math.sin((t % 1.6) / 1.6 * Math.PI), c.currentTime, 0.1);
      };
    }
    return v;
  }

  // One-shots.
  _click(dest, f, dur, level, q = 4) {
    const c = this.ctx, t = c.currentTime;
    const s = this._src(this.noise.white, false);
    const bp = this._filter('bandpass', f, q), g = this._gain(0);
    s.connect(bp).connect(g).connect(dest);
    g.gain.setValueAtTime(level, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.stop(t + dur + 0.05);
  }
  _burst(dest, dur, f, level) {
    const c = this.ctx, t = c.currentTime;
    const s = this._src(this.noise.white, false);
    const lp = this._filter('lowpass', f), g = this._gain(0);
    s.connect(lp).connect(g).connect(dest);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.stop(t + dur + 0.05);
  }
  _tone(dest, f, dur, level, type = 'sine', decay = 1) {
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(); o.type = type; o.frequency.value = f;
    const g = this._gain(0);
    o.connect(g).connect(dest);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(level, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + dur * decay + 0.05);
    o.start(t); o.stop(t + dur * decay + 0.1);
  }
  _bell(dest, f, at, decay) {
    const c = this.ctx;
    for (const [ratio, lvl] of [[1, 0.5], [2.0, 0.25], [2.76, 0.18], [5.4, 0.08], [0.5, 0.2]]) {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f * ratio;
      const g = this._gain(0);
      o.connect(g).connect(dest);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(lvl, at + 0.005); g.gain.exponentialRampToValueAtTime(0.0005, at + decay / Math.sqrt(ratio));
      o.start(at); o.stop(at + decay + 0.2);
    }
  }
  _gull(dest) {
    const c = this.ctx, t = c.currentTime;
    for (let i = 0; i < 3; i++) {
      const o = c.createOscillator(); o.type = 'sawtooth';
      const bp = this._filter('bandpass', 1800, 3), g = this._gain(0);
      o.connect(bp).connect(g).connect(dest);
      const t0 = t + i * 0.32;
      o.frequency.setValueAtTime(1500, t0); o.frequency.linearRampToValueAtTime(2300, t0 + 0.08); o.frequency.linearRampToValueAtTime(1200, t0 + 0.25);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.18, t0 + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28);
      o.start(t0); o.stop(t0 + 0.3);
    }
  }

  // Weather: a rain bed that follows the rain, thunder on demand.
  weather(m) {
    if (!this.ctx) return;
    const lvl = Math.max(m.rain, m.storm) * 0.9 + m.snow * 0.1;
    if (lvl > 0.02 && !this.beds.wrain) this.beds.wrain = this._bed('rain', 0);
    if (this.beds.wrain) this.beds.wrain.level = lvl;
  }
  thunder(delay = 1) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + delay;
    const s = this._src(this.noise.brown, false);
    const lp = this._filter('lowpass', 180), g = this._gain(0);
    s.connect(lp).connect(g).connect(this.bus);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1.2, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 4.5);
    s.stop(t + 5);
  }

  // Per-frame mix: listener at the camera target, with the zoom setting the audible radius.
  update(stage) {
    if (!this.ctx || !this.on || !this.world) return;
    const W = this.world, t = this.ctx.currentTime;
    const cam = stage.camera;
    const T = cam.target; // three.js coordinates (x, y, -depth)
    const reach = cam.dist * 0.6 + 6;
    const night = W.sun().night;
    for (const k in this.beds) {
      const b = this.beds[k];
      let lvl = b.level;
      if (k === 'crowd') lvl *= 1 - night * 0.6;
      if (k === 'sea' || k === 'wind') lvl *= 0.6 + 0.4 * clamp(cam.dist / 120, 0, 1);
      b.out.gain.setTargetAtTime(lvl * 0.5, t, 0.3);
      b.tick(W.time);
    }
    for (const v of this.voices) {
      const s = v.s;
      const active = !s.when || W.when(s.when);
      const off = stage.secOff(stage.secOf(s.x || 0));
      const dx = (s.x || 0) + off - T.x, dy = (s.y || 0) - T.y, dz = -(s.z || 0) - T.z;
      const d = Math.hypot(dx, dy, dz);
      const r = (s.r || 20) + reach;
      const fall = clamp(1 - d / r, 0, 1);
      const g = active ? (s.gain != null ? s.gain : 0.5) * fall * fall : 0;
      v.out.gain.setTargetAtTime(g, t, 0.15);
      if (v.pan) v.pan.pan.setTargetAtTime(clamp(dx / (reach + 4), -0.9, 0.9), t, 0.2);
      if (v.tick && g > 0.001) v.tick(W.time, W);
      else if (v.tick && s.kind === 'bell') v.tick(W.time, W);
    }
  }
}

XS.Audio = Audio;
