/* Particles and halos, drawn after the ink pass as camera-facing billboards.
 *
 * Smoke and steam are soft billows with a faint inked rim on their lit side, the way
 * an illustrator draws them. Sparks, embers, flames and lamp halos are additive glows.
 * Each sprite is tested against the scene depth so it hides behind solids and fades
 * softly where it meets them.
 */
import * as THREE from 'three';
import { XS, h01, toRgb } from './core.js';
import { U, OU } from './materials.js';

const KINDS = {
  smoke: { life: 9, size: [0.8, 6], vy: 1.6, spread: 0.6, color: '#6a6460', alpha: 0.6, drag: 0.4, rise: 0.2, puff: 1 },
  soot: { life: 12, size: [1.2, 9], vy: 2.2, spread: 0.8, color: '#3a3532', alpha: 0.65, drag: 0.35, rise: 0.15, puff: 1 },
  steam: { life: 3.2, size: [0.3, 2.4], vy: 2.2, spread: 0.5, color: '#f4f2ee', alpha: 0.75, drag: 0.6, rise: 0.4, puff: 1 },
  spark: { life: 0.9, size: [0.05, 0.02], vy: 2.5, spread: 1.6, color: '#ffb040', alpha: 1, drag: 0.1, rise: -9.8, glow: 1 },
  ember: { life: 2.2, size: [0.06, 0.03], vy: 1.2, spread: 0.6, color: '#ff8a30', alpha: 1, drag: 0.2, rise: 0.3, glow: 1 },
  fire: { life: 0.7, size: [0.3, 0.06], vy: 1.4, spread: 0.3, color: '#ffb84a', alpha: 0.9, drag: 0.3, rise: 1.5, glow: 1 },
  splash: { life: 1.1, size: [0.12, 0.06], vy: 2.5, spread: 1.4, color: '#e8f2f6', alpha: 0.9, drag: 0.05, rise: -9.8, puff: 0 },
  spray: { life: 1.6, size: [0.3, 1.4], vy: 1.5, spread: 1.0, color: '#f2f7f8', alpha: 0.6, drag: 0.5, rise: -2, puff: 1 },
  dust: { life: 4, size: [0.1, 0.6], vy: 0.2, spread: 0.4, color: '#b8a080', alpha: 0.35, drag: 0.8, rise: 0.05, puff: 1 },
  bubble: { life: 3, size: [0.04, 0.08], vy: 0.8, spread: 0.2, color: '#d8eef4', alpha: 0.8, drag: 0.3, rise: 0.4, puff: 0 },
  leaf: { life: 6, size: [0.12, 0.12], vy: -0.5, spread: 1, color: '#7a8a3a', alpha: 0.9, drag: 0.5, rise: -0.6, puff: 0 },
  snow: { life: 8, size: [0.05, 0.05], vy: -0.6, spread: 0.4, color: '#ffffff', alpha: 0.9, drag: 0.6, rise: -0.2, puff: 0 },
  mote: { life: 7, size: [0.02, 0.03], vy: 0.05, spread: 0.1, color: '#fff2c8', alpha: 0.6, drag: 0.9, rise: 0.01, glow: 1 },
  rain: { life: 3, size: [0.035, 0.035], vy: -11, spread: 0.15, color: '#5e6d7e', alpha: 0.7, drag: 0.02, rise: -3, streak: 1 },
};
XS.particleKinds = KINDS;

const VERT = /* glsl */ `
in vec3 iPos;
in vec4 iCol; // rgb, alpha
in vec2 iSize; // size, kind (0 puff, 1 round, 2 glow, 3 ring, 4 flame)
in float iSeed;
uniform float uOffset;
uniform vec2 uRes;
out vec2 vUv;
out vec4 vCol;
out float vKind;
out float vSeed;
out vec3 vSp;
out float vDepth;
void main() {
  vec3 wc = vec3(iPos.x + uOffset, iPos.y, -iPos.z);
  vec4 mv = viewMatrix * vec4(wc, 1.0);
  vec2 sc = abs(iSize.y - 5.0) < 0.5 ? vec2(1.0, 14.0) : vec2(1.0);
  // Never thinner than about a pixel, so rain and snow read at any distance.
  float pxw = 2.0 * max(-mv.z, 0.01) / (projectionMatrix[1][1] * uRes.y);
  float sz = max(iSize.x, pxw * (abs(iSize.y - 5.0) < 0.5 ? 0.7 : 0.9));
  mv.xy += position.xy * sz * sc;
  vDepth = -mv.z;
  vUv = position.xy;
  vCol = iCol;
  vKind = iSize.y;
  vSeed = iSeed;
  vSp = iPos;
  gl_Position = projectionMatrix * mv;
}
`;
const FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
uniform sampler2D tInfo;
uniform vec2 uRes, uSlice;
uniform float uCutOn;
in vec2 vUv;
in vec4 vCol;
in float vKind;
in float vSeed;
in vec3 vSp;
in float vDepth;
float h12(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y); }
void main() {
  if (vSp.x < uSlice.x || vSp.x > uSlice.y) discard;
  float sceneD = texture(tInfo, gl_FragCoord.xy / uRes).a;
  if (sceneD > 0.0 && vDepth > sceneD + 0.05) discard;
  float soft = sceneD > 0.0 ? smoothstep(0.0, 0.8, sceneD - vDepth) : 1.0;
  float r = length(vUv);
  int k = int(vKind + 0.5);
  vec4 c = vCol;
  if (k == 0) { // billow: three lobes, ragged edge, inked rim on the upper left
    vec2 q = vUv;
    float d = min(min(length(q - vec2(0.0, 0.08)) / 0.78, length(q - vec2(-0.42, -0.12)) / 0.55), length(q - vec2(0.4, -0.08)) / 0.6);
    d += (vn(q * 4.0 + vSeed * 13.0) - 0.5) * 0.18;
    if (d > 1.0) discard;
    float a = smoothstep(1.0, 0.8, d);
    float rim = smoothstep(0.78, 0.9, d) * (1.0 - smoothstep(0.9, 1.0, d)) * smoothstep(0.0, 0.6, -q.x + q.y + 0.3);
    vec3 col = c.rgb * (0.9 + 0.2 * vn(q * 6.0 + vSeed * 7.0));
    col = mix(col, vec3(0.16, 0.13, 0.11), rim * 0.45);
    outColor = vec4(col, a * c.a * soft);
  } else if (k == 1) {
    if (r > 1.0) discard;
    outColor = vec4(c.rgb, c.a * smoothstep(1.0, 0.7, r) * soft);
  } else if (k == 5) { // rain streak
    float a = (1.0 - abs(vUv.x)) * smoothstep(1.0, 0.3, abs(vUv.y));
    outColor = vec4(c.rgb, c.a * a * soft);
  } else if (k == 3) {
    if (r > 1.0 || r < 0.7) discard;
    outColor = vec4(c.rgb, c.a * soft);
  } else { // glow and flame (additive mesh)
    float g = exp(-r * r * 4.0);
    if (k == 4) g = smoothstep(1.0, 0.0, length(vUv * vec2(1.6, 1.0)));
    outColor = vec4(c.rgb * g * c.a * soft, 1.0);
  }
}
`;

function sprites(max, additive) {
  const quad = new THREE.InstancedBufferGeometry();
  quad.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
  quad.setIndex([0, 1, 2, 0, 2, 3]);
  const pos = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage);
  const col = new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4).setUsage(THREE.DynamicDrawUsage);
  const size = new THREE.InstancedBufferAttribute(new Float32Array(max * 2), 2).setUsage(THREE.DynamicDrawUsage);
  const seed = new THREE.InstancedBufferAttribute(new Float32Array(max), 1).setUsage(THREE.DynamicDrawUsage);
  quad.setAttribute('iPos', pos); quad.setAttribute('iCol', col); quad.setAttribute('iSize', size); quad.setAttribute('iSeed', seed);
  quad.instanceCount = 0;
  const m = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: FRAG,
    uniforms: Object.assign({}, U, OU),
    transparent: true, depthWrite: false, depthTest: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const mesh = new THREE.Mesh(quad, m);
  mesh.frustumCulled = false;
  mesh.renderOrder = additive ? 30 : 20;
  return { mesh, pos, col, size, seed, max, n: 0 };
}

export class Particles {
  constructor(max = 3000) {
    this.max = max;
    this.list = [];
    this.seed = 1;
    this.soft = null;
    this.glow = null;
  }
  // e: emitter or options { kind, x, y, z, vx, vy, vz, spread, size, life, color, alpha, w, h, d }
  emit(e, world) {
    if (this.list.length >= this.max) return null;
    const K = KINDS[e.kind] || KINDS.smoke;
    const r = () => h01(this.seed++, 13);
    const sp = e.spread != null ? e.spread : K.spread;
    const p = {
      K,
      x: e.x + (r() - 0.5) * (e.w || 0), y: e.y + (r() - 0.5) * (e.h || 0), z: (e.z || 0) + (r() - 0.5) * (e.d || 0),
      vx: (e.vx || 0) + (r() - 0.5) * sp * 2, vy: (e.vy != null ? e.vy : K.vy) * (0.7 + r() * 0.6) + (r() - 0.5) * sp, vz: (e.vz || 0) + (r() - 0.5) * sp * 0.6,
      age: 0, life: (e.life || K.life) * (0.75 + r() * 0.5),
      s0: (e.size ? e.size[0] : K.size[0]) * (0.8 + r() * 0.4), s1: (e.size ? e.size[1] : K.size[1]) * (0.8 + r() * 0.4),
      c: toRgb(e.color || K.color), a: e.alpha != null ? e.alpha : K.alpha, seed: r() * 10,
      sec: world ? world.secOf(e.x) : 0, glow: !!K.glow, kind: K.streak ? 5 : K.glow ? (e.kind === 'fire' ? 4 : 2) : K.puff ? 0 : e.kind === 'bubble' ? 3 : 1,
    };
    this.list.push(p);
    return p;
  }
  update(dt, wind) {
    const L = this.list;
    let j = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.age += dt;
      if (p.age >= p.life) continue;
      const K = p.K;
      p.vx += ((wind || 0) * (K.drag > 0.3 ? 1 : 0.3) - p.vx) * K.drag * dt;
      p.vy += K.rise * dt;
      p.vy *= 1 - K.drag * 0.25 * dt;
      p.x += p.vx * dt + Math.sin(p.age * 1.3 + p.seed) * 0.1 * dt * (K.puff ? 3 : 0);
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      L[j++] = p;
    }
    L.length = j;
  }
  meshes() {
    if (!this.soft) { this.soft = sprites(this.max, false); this.glow = sprites(this.max + 600, true); }
    return [this.soft.mesh, this.glow.mesh];
  }
  // Fill the sprite buffers. halos: [{ x, y, z, r, color, a }] from lamps (night).
  sync(halos) {
    this.meshes();
    const S = this.soft, G = this.glow;
    S.n = 0; G.n = 0;
    for (const p of this.list) {
      const B = p.glow ? G : S;
      if (B.n >= B.max) continue;
      const u = p.age / p.life;
      const s = p.s0 + (p.s1 - p.s0) * Math.sqrt(u);
      const a = p.a * (u < 0.1 ? u / 0.1 : 1 - (u - 0.1) / 0.9);
      const i = B.n++;
      B.pos.array[i * 3] = p.x; B.pos.array[i * 3 + 1] = p.y; B.pos.array[i * 3 + 2] = p.z;
      B.col.array[i * 4] = p.c[0] / 255; B.col.array[i * 4 + 1] = p.c[1] / 255; B.col.array[i * 4 + 2] = p.c[2] / 255; B.col.array[i * 4 + 3] = a;
      B.size.array[i * 2] = s; B.size.array[i * 2 + 1] = p.kind;
      B.seed.array[i] = p.seed;
    }
    for (const h of halos) {
      if (G.n >= G.max) break;
      const i = G.n++;
      G.pos.array[i * 3] = h.x; G.pos.array[i * 3 + 1] = h.y; G.pos.array[i * 3 + 2] = h.z;
      const c = toRgb(h.color);
      G.col.array[i * 4] = c[0] / 255; G.col.array[i * 4 + 1] = c[1] / 255; G.col.array[i * 4 + 2] = c[2] / 255; G.col.array[i * 4 + 3] = h.a;
      G.size.array[i * 2] = h.r; G.size.array[i * 2 + 1] = 2;
      G.seed.array[i] = 0;
    }
    for (const B of [S, G]) {
      B.mesh.geometry.instanceCount = B.n;
      B.pos.needsUpdate = true; B.col.needsUpdate = true; B.size.needsUpdate = true; B.seed.needsUpdate = true;
    }
  }
}

XS.Particles = Particles;
