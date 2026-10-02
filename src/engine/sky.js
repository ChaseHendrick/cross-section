/* Sky, sun and sea.
 *
 * sun(hour) gives the day/dusk/night state; applyLighting() sets the shared material
 * uniforms from it. The sky dome is a painted gradient with sun, moon, stars and
 * drifting clouds. The sea is an animated surface that can be masked out wherever a
 * hull sits, so water never fills a cutaway engine room.
 */
import * as THREE from 'three';
import { XS, mix, toRgb } from './core.js';
import { U } from './materials.js';

const { smoothstep, clamp } = XS.math;

export function sun(h) {
  const day = smoothstep(4.8, 7.4, h) * (1 - smoothstep(18.0, 20.6, h));
  const dusk = clamp(Math.max(0, 1 - Math.abs(h - 19.0) / 1.6) + Math.max(0, 1 - Math.abs(h - 6.1) / 1.4), 0, 1);
  return { day, dusk, hour: h, night: 1 - day };
}

export function skyColors(s) {
  let top = mix('#0b1230', '#86acd4', s.day), bot = mix('#1f2a4e', '#eef0e0', s.day);
  top = mix(top, '#4a5a8a', s.dusk * 0.5);
  bot = mix(bot, '#f2a868', s.dusk * 0.75);
  return { top, bot };
}

const c3 = (hex, k = 1) => { const v = toRgb(hex); return new THREE.Color((v[0] / 255) * k, (v[1] / 255) * k, (v[2] / 255) * k); };

// Sun direction in three.js coordinates: it travels from the left (morning) to the right
// (evening), always somewhat in front of the cut so section faces are lit.
export function sunDir(h) {
  const t = clamp((h - 6) / 12, -0.2, 1.2);
  const az = (t - 0.5) * 2.0; // -1 morning .. 1 evening
  const el = Math.max(0.12, Math.sin(clamp(t, 0, 1) * Math.PI)) * 0.95;
  return new THREE.Vector3(az * 0.9, 0.35 + el, 0.75).normalize();
}

export function applyLighting(world, scene) {
  const s = world.sun();
  const n = s.night;
  U.uNight.value = smoothstep(0.25, 0.85, n);
  const sd = s.day > 0.05 ? sunDir(s.hour) : new THREE.Vector3(-0.35, 0.8, 0.5).normalize(); // moonlight
  U.uSunDir.value.copy(sd);
  const sunC = mix(mix('#fff4dc', '#ffb070', s.dusk * 0.8), '#5a6a9a', n);
  U.uSunCol.value.copy(c3(sunC, 1.0 - n * 0.7));
  const amb = scene && scene.ambient || {};
  U.uSkyCol.value.copy(c3(mix(mix(amb.sky || '#e4eaee', '#f0c8a0', s.dusk * 0.5), '#4a5a8c', n), 1.0 - n * 0.45));
  U.uGroundCol.value.copy(c3(mix(amb.ground || '#b0a48e', '#34364a', n), 1.0 - n * 0.45));
  const sk = skyColors(s);
  U.uFogCol.value.copy(c3(sk.bot));
}

// ------------------------------------------------------------------ sky dome
const SKY_VERT = /* glsl */ `
out vec3 vDir;
out float vDepth;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vDir = normalize(wp.xyz - cameraPosition);
  gl_Position = projectionMatrix * viewMatrix * wp;
  gl_Position.z = gl_Position.w * 0.99999;
  vDepth = 60000.0;
}
`;
const SKY_FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
layout(location = 1) out highp vec4 gInfo;
uniform vec3 uTop, uBot, uSunDirS, uSunC, uCloud, uCloudDark;
uniform float uNight, uTime, uDay, uCloudCover, uHorizon;
in vec3 vDir;
in float vDepth;
float h12(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
void main() {
  vec3 d = normalize(vDir);
  float e = d.y - uHorizon;
  vec3 col = mix(uBot, uTop, smoothstep(-0.02, 0.55, e));
  // Below the horizon: a soft continuation (most scenes cover it with land or sea).
  if (e < 0.0) col = mix(uBot, uBot * 0.8, smoothstep(0.0, -0.3, e));
  // Sun or moon.
  float sd = dot(d, normalize(uSunDirS));
  if (uDay > 0.02) {
    col += uSunC * (smoothstep(0.9993, 0.9997, sd) * 1.2 + pow(max(sd, 0.0), 64.0) * 0.25) * uDay;
  } else {
    float m = smoothstep(0.99955, 0.99975, sd);
    float m2 = smoothstep(0.99955, 0.99975, dot(d, normalize(uSunDirS + vec3(0.004, 0.002, 0.0))));
    col = mix(col, vec3(0.95, 0.93, 0.85), clamp(m - m2 * 0.85, 0.0, 1.0) * uNight);
    col += vec3(0.6, 0.65, 0.8) * pow(max(sd, 0.0), 200.0) * 0.15 * uNight;
  }
  // Stars.
  if (uNight > 0.05 && e > 0.0) {
    vec2 g = vec2(atan(d.z, d.x) * 140.0, asin(clamp(d.y, -1.0, 1.0)) * 140.0);
    vec2 cell = floor(g);
    float r = h12(cell);
    vec2 f = fract(g) - 0.5 - (vec2(h12(cell + 7.1), h12(cell + 3.3)) - 0.5) * 0.6;
    float star = step(0.985, r) * smoothstep(0.12, 0.0, length(f)) * (0.6 + 0.4 * sin(uTime * (1.0 + r * 3.0) + r * 40.0));
    col += vec3(1.0, 0.97, 0.88) * star * uNight * smoothstep(0.0, 0.12, e);
  }
  // Clouds on a plane above.
  if (e > 0.0) {
    vec2 cp = d.xz / max(d.y, 0.06) * 1.6 + vec2(uTime * 0.012, 0.0);
    float c = fbm(cp);
    float cover = smoothstep(1.0 - uCloudCover, 1.15 - uCloudCover * 0.6, c);
    float shadeC = fbm(cp + vec2(0.07, 0.05));
    vec3 cc = mix(uCloud, uCloudDark, smoothstep(0.4, 0.75, shadeC));
    col = mix(col, cc, cover * smoothstep(0.0, 0.15, e) * 0.92);
  }
  outColor = vec4(col, 1.0);
  gInfo = vec4(0.5, 0.5, 0.0, vDepth);
}
`;

export class Sky {
  constructor() {
    this.uniforms = {
      uTop: { value: new THREE.Color() }, uBot: { value: new THREE.Color() },
      uSunDirS: { value: new THREE.Vector3(0, 1, 0) }, uSunC: { value: new THREE.Color(1, 0.95, 0.8) },
      uCloud: { value: new THREE.Color(1, 1, 1) }, uCloudDark: { value: new THREE.Color(0.8, 0.8, 0.85) },
      uNight: { value: 0 }, uTime: { value: 0 }, uDay: { value: 1 }, uCloudCover: { value: 0.45 }, uHorizon: { value: 0.0 },
    };
    const m = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, uniforms: this.uniforms, side: THREE.BackSide, depthWrite: false });
    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
  }
  update(world, camera, scene) {
    const s = world.sun();
    const k = skyColors(s);
    this.uniforms.uTop.value.copy(c3(scene.skyTop || k.top));
    this.uniforms.uBot.value.copy(c3(scene.skyBot || k.bot));
    const h = s.hour;
    // The visible sun/moon arc: from low left to high centre to low right, in front of the viewer.
    let t = (h - 6) / 12;
    if (s.day <= 0.02) t = ((h + 6) % 24) / 12; // moon
    const az = (t - 0.5) * 1.6, el = Math.sin(clamp(t, 0, 1) * Math.PI) * 0.55 + 0.03;
    this.uniforms.uSunDirS.value.set(Math.sin(az) * 0.9, el, -Math.cos(az) * 0.6).normalize();
    this.uniforms.uSunC.value.copy(c3(mix('#fff2d0', '#ff9a50', s.dusk)));
    this.uniforms.uCloud.value.copy(c3(mix(mix('#4a5272', '#ffffff', s.day), '#ffc89a', s.dusk * 0.6)));
    this.uniforms.uCloudDark.value.copy(c3(mix(mix('#2a3050', '#c4ccd8', s.day), '#b07a7a', s.dusk * 0.5)));
    this.uniforms.uNight.value = s.night;
    this.uniforms.uDay.value = s.day;
    this.uniforms.uTime.value = world.time * (world.wind || 1);
    this.uniforms.uCloudCover.value = scene.clouds != null ? scene.clouds : 0.45;
    this.uniforms.uHorizon.value = scene.horizon != null ? scene.horizon : 0.0;
    this.mesh.position.copy(camera.position);
    this.mesh.scale.setScalar(camera.far * 0.9);
  }
}

// ------------------------------------------------------------------ sea
const SEA_VERT = /* glsl */ `
uniform float uTime, uAmp;
out vec3 vWorld;
out vec3 vN;
out float vDepth;
out vec3 vViewN;
vec3 wave(vec2 p, vec2 dir, float k, float a, float speed, inout vec3 n) {
  float ph = dot(dir, p) * k - uTime * speed;
  n.x -= dir.x * k * a * cos(ph);
  n.z -= dir.y * k * a * cos(ph);
  return vec3(0.0, a * sin(ph), 0.0);
}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec3 n = vec3(0.0, 1.0, 0.0);
  vec2 p = vec2(wp.x, -wp.z);
  float fade = 1.0 - smoothstep(60.0, 600.0, -wp.z);
  vec3 off = wave(p, normalize(vec2(1.0, 0.35)), 0.35, 0.28 * uAmp, 1.3, n)
           + wave(p, normalize(vec2(-0.6, 1.0)), 0.6, 0.12 * uAmp, 1.9, n)
           + wave(p, normalize(vec2(0.2, -1.0)), 1.3, 0.05 * uAmp, 2.6, n);
  wp.xyz += off * fade;
  vWorld = wp.xyz;
  vN = normalize(n);
  vViewN = normalize(mat3(viewMatrix) * vN);
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
const SEA_FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
layout(location = 1) out highp vec4 gInfo;
uniform vec3 uDeep, uShallow, uSkyCol, uSunDir, uFogCol, uFog;
uniform float uNight, uOffset, uCutOn, uTime;
uniform vec2 uSlice;
uniform sampler2D uMask;
uniform vec4 uMaskBox; // x0, z0, x1, z1 in scene coordinates
in vec3 vWorld;
in vec3 vN;
in float vDepth;
in vec3 vViewN;
float h12(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec3 sp = vec3(vWorld.x - uOffset, vWorld.y, -vWorld.z);
  if (uCutOn > 0.5 && sp.z < -0.002) discard;
  if (sp.x < uSlice.x || sp.x > uSlice.y) discard;
  vec2 mq = (sp.xz - uMaskBox.xy) / (uMaskBox.zw - uMaskBox.xy);
  if (all(greaterThan(mq, vec2(0.0))) && all(lessThan(mq, vec2(1.0))) && texture(uMask, mq).r > 0.5) discard;
  vec3 V = normalize(cameraPosition - vWorld);
  float fres = pow(1.0 - max(dot(V, vN), 0.0), 3.0);
  vec3 col = mix(uShallow, uDeep, smoothstep(10.0, 400.0, sp.z));
  col = mix(col, uSkyCol, fres * 0.55);
  float spec = pow(max(dot(reflect(-uSunDir, vN), V), 0.0), 80.0);
  col += vec3(1.0, 0.95, 0.85) * spec * 0.5 * (1.0 - uNight);
  // Painted wave crests: short dashes along the swell.
  float crest = smoothstep(0.06, 0.1, vN.x * 0.6 + vN.z * 0.3) * (1.0 - smoothstep(0.1, 0.16, vN.x * 0.6 + vN.z * 0.3));
  col = mix(col, col * 1.35 + 0.08, crest * 0.5 * (1.0 - smoothstep(30.0, 200.0, sp.z)));
  col *= 0.94 + 0.08 * h12(floor(sp.xz * 4.0));
  float f = smoothstep(uFog.x, uFog.y, vDepth) * uFog.z;
  col = mix(col, uFogCol, f);
  outColor = vec4(col, 1.0);
  gInfo = vec4(normalize(vViewN).xy * 0.5 + 0.5, -1.0, vDepth);
}
`;

// Sea surface. opt: { level, x0, x1, depth (how far back), deep, shallow, amp, mask(x, z) -> bool }
export function makeSea(opt = {}) {
  const level = opt.level || 0;
  const x0 = opt.x0 != null ? opt.x0 : -400, x1 = opt.x1 != null ? opt.x1 : 400;
  const far = opt.depth || 2500;
  const xs = [];
  const step = opt.step || 1.5;
  const mid0 = opt.detailX0 != null ? opt.detailX0 : x0, mid1 = opt.detailX1 != null ? opt.detailX1 : x1;
  for (let x = mid0; x <= mid1; x += step) xs.push(x);
  let w = step;
  for (let x = mid0 - step; x > mid0 - far; x -= (w *= 1.12)) xs.unshift(x);
  w = step;
  for (let x = mid1 + step; x < mid1 + far; x += (w *= 1.12)) xs.push(x);
  const zs = [0];
  let dz = 0.6;
  while (zs[zs.length - 1] < far) { zs.push(zs[zs.length - 1] + dz); dz *= 1.09; }
  const pos = [], idx = [];
  for (const z of zs) for (const x of xs) pos.push(x, level, z);
  const nx = xs.length;
  for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  // Hull mask.
  const MW = 512, MH = 128;
  const mb = opt.maskBox || [x0, 0, x1, 60];
  const data = new Uint8Array(MW * MH * 4);
  if (opt.mask) {
    for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
      const x = mb[0] + ((i + 0.5) / MW) * (mb[2] - mb[0]), z = mb[1] + ((j + 0.5) / MH) * (mb[3] - mb[1]);
      if (opt.mask(x, z)) data[(j * MW + i) * 4] = 255;
    }
  }
  const mask = new THREE.DataTexture(data, MW, MH, THREE.RGBAFormat);
  mask.needsUpdate = true;
  const uniforms = Object.assign({}, U, {
    uDeep: { value: c3(opt.deep || '#2c5a74') }, uShallow: { value: c3(opt.shallow || '#4e8a9a') },
    uAmp: { value: opt.amp != null ? opt.amp : 1 }, uMask: { value: mask }, uMaskBox: { value: new THREE.Vector4(mb[0], mb[1], mb[2], mb[3]) },
  });
  const m = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: SEA_VERT, fragmentShader: SEA_FRAG, uniforms, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  mesh.userData.sea = { uniforms, level, deep: opt.deep || '#2c5a74', shallow: opt.shallow || '#4e8a9a' };
  return mesh;
}
// Keep the sea's colours in step with the time of day.
export function updateSea(mesh, world) {
  const s = world.sun();
  const u = mesh.userData.sea.uniforms;
  u.uDeep.value.copy(c3(mix(mix(mesh.userData.sea.deep, '#0a1424', s.night * 0.85), '#7a5a5a', s.dusk * 0.15)));
  u.uShallow.value.copy(c3(mix(mix(mesh.userData.sea.shallow, '#122438', s.night * 0.85), '#c08a6a', s.dusk * 0.2)));
}

XS.sun = sun;
