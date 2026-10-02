/* Cross-Sections engine: core utilities shared by every module.
 *
 * Coordinate conventions (see docs/ENGINE-API.md):
 *   World units are metres. x runs left to right along the subject, y is up, and
 *   z is DEPTH behind the cut plane: z = 0 is the cut, larger z is further from the
 *   viewer. The near half (z < 0) is taken away, as in a cutaway drawing.
 *   Inside three.js the scene uses (x, y, -z) so the camera can look down -Z;
 *   only the kit, figures and stage convert, through T() below.
 */

export const XS = {};
XS.version = '0.2.0';

// ------------------------------------------------------------------ math
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const fract = (v) => v - Math.floor(v);
XS.math = {
  clamp, lerp, smoothstep, fract, TAU: Math.PI * 2,
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  tri: (t) => 1 - Math.abs(2 * fract(t) - 1),
  inHours: (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b),
  angleLerp: (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; },
};

// ------------------------------------------------------------------ hashing and RNG
function ihash(x) {
  x |= 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15; x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function hash(...parts) {
  let h = 0x9e3779b9;
  for (const p of parts) {
    const v = typeof p === 'string' ? hashStr(p) : Math.round(p * 1000003) | 0;
    h = ihash(h ^ v);
  }
  return h;
}
export const h01 = (a, b = 0, c = 0) => ihash(ihash(ihash(a | 0) ^ (b | 0)) ^ (c | 0)) / 4294967296;

// mulberry32 with conveniences. All randomness in scenes goes through this.
export function rng(seed) {
  let a = seed >>> 0;
  const r = function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (lo, hi) => lo + (hi - lo) * r();
  r.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * r());
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.chance = (p) => r() < p;
  r.sign = () => (r() < 0.5 ? -1 : 1);
  r.gauss = () => (r() + r() + r() + r() - 2) * 0.8660254;
  return r;
}

export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(h01(i, seed) * 2 - 1, h01(i + 1, seed) * 2 - 1, u);
}
export function noise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h01(ix, iy, seed), b = h01(ix + 1, iy, seed);
  const c = h01(ix, iy + 1, seed), d = h01(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}
export function fbm2(x, y, seed = 0, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f, seed + i * 17); f *= 2; a *= 0.5; }
  return s;
}
Object.assign(XS, { hash, h01, rng, noise1, noise2, fbm2, ihash });

// ------------------------------------------------------------------ colour
// Colours are '#rrggbb' strings in the public API.
const rgbCache = new Map();
export function toRgb(c) {
  let v = rgbCache.get(c);
  if (v) return v;
  let s = String(c).trim();
  if (s[0] === '#') {
    s = s.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  } else {
    const m = s.match(/rgba?\(([^)]+)\)/);
    v = m ? m[1].split(',').slice(0, 3).map((n) => parseFloat(n)) : [0, 0, 0];
  }
  rgbCache.set(c, v);
  return v;
}
const hex2 = (n) => { const v = clamp(Math.round(n), 0, 255).toString(16); return v.length < 2 ? '0' + v : v; };
export const toHex = (r, g, b) => '#' + hex2(r) + hex2(g) + hex2(b);
export function mix(a, b, t) {
  const A = toRgb(a), B = toRgb(b);
  return toHex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}
// k < 0 darkens towards deep sepia, k > 0 lightens towards paper white.
export function shade(c, k) { return k < 0 ? mix(c, '#1c1410', -k) : mix(c, '#fffaf0', k); }
export function rgba(c, a) { const v = toRgb(c); return 'rgba(' + v[0] + ',' + v[1] + ',' + v[2] + ',' + a + ')'; }
// A little deterministic variety, like hand-mixed paint.
export function vary(c, seed, amt = 0.06) {
  const r = h01(seed, 7) * 2 - 1, w = h01(seed, 11) * 2 - 1;
  let out = shade(c, r * amt);
  out = mix(out, w > 0 ? '#c8902c' : '#3c5a8a', Math.abs(w) * amt * 0.35);
  return out;
}
XS.color = { toRgb, toHex, mix, shade, rgba, vary };

export const INK = { line: '#2a221c', soft: '#5a4a3c', paper: '#f3ead6', shadow: '#3b2f4a' };
XS.ink = INK;

// ------------------------------------------------------------------ events and registry
XS.bus = (() => {
  const m = new Map();
  return {
    on(ev, fn) { if (!m.has(ev)) m.set(ev, new Set()); m.get(ev).add(fn); return () => m.get(ev).delete(fn); },
    emit(ev, data) { const s = m.get(ev); if (s) for (const fn of [...s]) { try { fn(data); } catch (e) { console.error(e); } } },
  };
})();

XS.scenes = {
  list: [],
  byId: new Map(),
  register(def) {
    if (!def || !def.id) throw new Error('scene needs an id');
    if (this.byId.has(def.id)) throw new Error('duplicate scene id ' + def.id);
    def.order = def.order != null ? def.order : this.list.length;
    this.list.push(def);
    this.list.sort((a, b) => a.order - b.order);
    this.byId.set(def.id, def);
  },
};

if (typeof window !== 'undefined') window.XS = XS;
