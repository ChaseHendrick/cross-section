/* The Coal Mine: Big Pit colliery, Blaenavon, South Wales, on a working day in October 1910.
 *
 * Sources and confidence flags: docs/research/mine.md. World units are metres.
 *
 * Layout (x along the section, y above the collar of the Big Pit shaft, z depth behind the cut):
 *   Surface, y = 0 (the yard), left to right:
 *     -32..-10  two terraced cottages cut open (kitchen with tin bath, bedroom)
 *       0..45   spoil tip with a tram incline           40..102  sidings (standard gauge)
 *      62..100  the screens on timber trestles           100..110  weigh cabin (deck level)
 *     111..127  lamp room under the tram deck            126..147  pit bank, deck at y 6
 *     140..165  timber headframe, sheaves at y 15       166..194  winding engine house
 *     196..218  boiler house, chimney at 221 (30 m)     225..245  blacksmiths' shop
 *     245..260  fitting shop (1910)                      262..284  saw mill
 *     286..298  surface stables                          300..312  colliery office
 *     322..340  fan house (1909-10) and flared chimney   342..350  the two sealed Coity shafts
 *     350..440  moorland, the powder magazine at 375
 *   Underground, Old Coal seam floor at y = -89 (the fault drops the strata 30 m beyond x 244):
 *       0..20   coal face and gob (1.25 m high)          20..52   horse road, drift rising at 26..48
 *      52..60   parting and ripping lip                  60..122  main haulage road, air doors 106/112
 *     122..180  pit bottom, the shaft at 147..153 with its sump to -96
 *     180..205  pump room, haulage engine room          205..238  underground stables (15 stalls)
 *      54..143 / 156..238 return airway at -83, incline through the fault to -121, Coity bottoms 341..351
 *      62..146  old upper workings and inset at -61    351..418  old Coity workings, partly flooded
 *   Depth: the section block is 60 m deep; roads are 3 to 4.4 m deep, the stables 6.6 m.
 *   Suggested cuts follow the dossier's six slices: 56, 118, 196, 244, 326.
 */
import { XS, THREE, U } from '../engine/index.js';
import { buildRock, buildLand, buildSliceSkins, terrainH, VOIDS, SLICE_STEP } from './mine/geology.js';
import { buildSurface } from './mine/surface.js';
import { buildUnder } from './mine/under.js';
import { setupMachines } from './mine/machines.js';
import { setupPeople, DAY_SECONDS } from './mine/life.js';
import { PB, BANK, SHAFT, X0, X1, BOTTOM, ground } from './mine/common.js';
import { captions, tour } from './mine/captions.js';

const CUTS = [56, 118, 196, 244, 326];

// ------------------------------------------------------------------ darkness below ground
// A dim veil over the workings by day (the sun does not reach them), lifted near lamps.
function darkness(k) {
  // aK: weight of the daytime veil (inside the workings); aN: weight of the night veil (the whole
  // section of rock, so lamp light glows out of the dark like a lantern in a cellar).
  const pos = [], kk = [], nn = [];
  const tri6 = (pts, k6, n6) => { for (let i = 0; i < 6; i++) { pos.push(...pts[i]); kk.push(k6[i]); nn.push(n6[i]); } };
  const Z = 0.03;
  for (const v of VOIDS) {
    if (v.fault || v.id === 'shaft' || v.id === 'coity1' || v.id === 'coity2' || v.id === 'fandrift') continue;
    tri6([[v.x0, v.f0, Z], [v.x1, v.f1, Z], [v.x1, v.r1, Z], [v.x0, v.f0, Z], [v.x1, v.r1, Z], [v.x0, v.r0, Z]], [1, 1, 1, 1, 1, 1], [0, 0, 0, 0, 0, 0]);
  }
  // the shaft darkens with depth by day
  const sx0 = SHAFT.x0 - 0.45, sx1 = SHAFT.x1 + 0.45;
  const f = (yy) => Math.min(1, Math.max(0, (-yy - 3) / 30));
  for (let y = -2; y > SHAFT.sump - 0.6; y -= 6) {
    let y1 = Math.max(SHAFT.sump - 0.6, y - 6);
    if (y > PB + 4 && y1 < PB + 4) y1 = PB + 4; // the pit bottom has its own veil
    if (y <= PB + 4 && y > PB) y = PB;
    if (y1 >= y) continue;
    tri6([[sx0, y1, Z], [sx1, y1, Z], [sx1, y, Z], [sx0, y1, Z], [sx1, y, Z], [sx0, y, Z]], [f(y1), f(y1), f(y), f(y1), f(y), f(y)], [0, 0, 0, 0, 0, 0]);
  }
  // the night veil over the whole cut face of the ground
  for (let x = X0; x < X1 - 1e-6; x += 4) {
    const xb = Math.min(X1, x + 4), ya = ground(x) - 0.02, yb = ground(xb) - 0.02;
    tri6([[x, BOTTOM, Z], [xb, BOTTOM, Z], [xb, yb, Z], [x, BOTTOM, Z], [xb, yb, Z], [x, ya, Z]], [0, 0, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aK', new THREE.Float32BufferAttribute(kk, 1));
  g.setAttribute('aN', new THREE.Float32BufferAttribute(nn, 1));
  const m = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: { uOffset: U.uOffset, uSlice: U.uSlice, uLamp: U.uLamp, uLampMin: U.uLampMin, uLampSize: U.uLampSize, uLampGain: U.uLampGain, uNight: U.uNight, uDark: { value: 0.4 }, uDarkN: { value: 0.0 } },
    vertexShader: `in float aK; in float aN; out vec3 vSp; out float vK; out float vN;
      void main() { vSp = position; vK = aK; vN = aN; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `precision highp float; precision highp sampler3D;
      uniform vec2 uSlice; uniform sampler3D uLamp; uniform vec3 uLampMin, uLampSize; uniform float uLampGain, uDark, uDarkN, uNight;
      in vec3 vSp; in float vK; in float vN; layout(location = 0) out highp vec4 outColor;
      void main() {
        if (vSp.x < uSlice.x || vSp.x > uSlice.y) discard;
        float lit = 0.0;
        for (int i = 0; i < 3; i++) {
          vec3 q = (vec3(vSp.x, vSp.y, 0.8 + float(i) * 1.6) - uLampMin) / uLampSize;
          if (all(greaterThanEqual(q, vec3(0.0))) && all(lessThanEqual(q, vec3(1.0)))) { vec4 L = texture(uLamp, q) * uLampGain; lit = max(lit, clamp(L.a * 1.3 + (L.r + L.g + L.b) * 0.3 * uNight, 0.0, 1.0)); }
        }
        float a = clamp(uDark * vK + uDarkN * vN, 0.0, 0.95) * (1.0 - lit * 0.92);
        vec3 c = mix(vec3(0.06, 0.055, 0.07), vec3(0.03, 0.04, 0.08), vN);
        c = mix(c, vec3(0.42, 0.22, 0.06), smoothstep(0.02, 0.45, lit) * 0.85 * vN);
        outColor = vec4(c, a);
      }`,
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.renderOrder = 8;
  mesh.frustumCulled = false;
  k.object(mesh, { overlay: true });
  return mesh;
}

let DARK = null;
function build(k) {
  buildRock(k);
  buildSliceSkins(k, CUTS);
  buildLand(k);
  buildSurface(k, terrainH);
  buildUnder(k);
  captions(k);
  DARK = darkness(k);
}

function setup(W, stage, k) {
  W.data.dark = DARK;
  W.data.terrain = terrainH;
  setupMachines(k, W);
  setupPeople(W, k);
  // ---- sound
  const winding = (w) => w.data.wind && w.data.wind.st && w.data.wind.st.moving;
  W.sound({ kind: 'chuff', x: 186, y: 3, z: 2, r: 30, gain: 0.45, rate: (w) => (winding(w) ? 3.2 : 0) });
  W.sound({ kind: 'machine', x: 150, y: BANK + 1, z: 1.5, r: 25, gain: 0.25, rate: (w) => (winding(w) ? 0.05 : 0.4), pitch: 180 });
  W.sound({ kind: 'bell', x: 145.7, y: BANK + 2, z: 2.5, r: 20, gain: 0.25, hz: 880 });
  W.sound({ kind: 'fire', x: 207, y: 1.5, z: 2.5, r: 14, gain: 0.35 });
  W.sound({ kind: 'machine', x: 232, y: 1, z: 3, r: 18, gain: 0.3, rate: (w) => (w.hour > 6 && w.hour < 17 ? 1.1 : 0), pitch: 900 });
  W.sound({ kind: 'hum', x: 330, y: 3, z: 2, r: 25, gain: 0.3, hz: 50 });
  W.sound({ kind: 'hum', x: 270, y: 1, z: 2, r: 14, gain: 0.2, hz: 140 });
  W.sound({ kind: 'machine', x: 80, y: 4, z: 1, r: 22, gain: 0.25, rate: (w) => (w.hour > 6 && w.hour < 17 ? 3 : 0), pitch: 260 });
  W.sound({ kind: 'drip', x: 100, y: PB + 2, z: 2, r: 30, gain: 0.35, rate: 0.8 });
  W.sound({ kind: 'drip', x: 150, y: PB + 3, z: 1.5, r: 15, gain: 0.3, rate: 1.4 });
  W.sound({ kind: 'creak', x: 12, y: PB + 1, z: 1.5, r: 18, gain: 0.3, rate: 0.15 });
  W.sound({ kind: 'creak', x: 100, y: -82, z: 1.5, r: 25, gain: 0.2, rate: 0.1 });
  W.sound({ kind: 'machine', x: 12, y: PB + 0.6, z: 1.6, r: 15, gain: 0.3, rate: (w) => (w.hour > 6 && w.hour < 12.5 ? 1.8 : 0), pitch: 1300 });
  W.sound({ kind: 'engine', x: 187, y: PB + 1, z: 2, r: 18, gain: 0.25, hz: 42 });
  W.sound({ kind: 'machine', x: 220, y: PB + 1, z: 3, r: 15, gain: 0.15, rate: 0.3, pitch: 500 });
  W.sound({ kind: 'clock', x: 306, y: 2.8, z: 4.9, r: 6, gain: 0.2 });
  W.sound({ kind: 'voice', x: 80, y: 4, z: 2.5, r: 16, gain: 0.12, hz: 330, when: [6, 16] });
  W.sound({ kind: 'voice', x: 108, y: PB + 1, z: 2.8, r: 10, gain: 0.12, hz: 420, when: [6, 13] });
  tour(W);
  void stage;
}

function update(W, dt, t) {
  const s = W.sun();
  if (W.data.dark) { const u = W.data.dark.material.uniforms; u.uDark.value = 0.48 * s.day; u.uDarkN.value = 0.58 * XS.math.smoothstep(0.3, 0.9, s.night); }
  // the shot in the drift: a flash, a burst of dust, then the dust settling
  if (W.data.shotAt && t >= W.data.shotAt) {
    W.data.shotAt = 0;
    for (let i = 0; i < 26; i++) W.particles.emit({ kind: 'spark', x: 46.6, y: -76.2, z: 1.3, vx: -2 - W.R() * 3, vy: W.R() * 2 }, W);
    for (let i = 0; i < 14; i++) W.particles.emit({ kind: 'dust', x: 46 - W.R() * 3, y: -76.5, z: 1.4, vx: -0.6, color: '#6a6660', life: 30, size: [0.5, 2.2] }, W);
  }
}

XS.scenes.register({
  id: 'mine',
  order: 50,
  title: 'The Coal Mine',
  subtitle: 'Big Pit colliery, Blaenavon, 1910',
  blurb: 'Down an 89 m shaft to the coal face, with the cages, the horses and the men who worked by lamplight.',
  bounds: { x0: -40, x1: 446, y0: -142, y1: 46, z0: 0, z1: 40 },
  frame: { x0: -36, x1: 442, y0: -130, y1: 34, z0: 0, z1: 10 },
  view: { yaw: -0.2, pitch: 0.16 },
  startHour: 8.5,
  daySeconds: DAY_SECONDS,
  wind: 2.2,
  clouds: 0.72,
  fog: [320, 1500, 0.55],
  ambient: { sky: '#dfe4e6', ground: '#a8a090' },
  focusDepth: 2,
  minDist: 2,
  sliceGap: 14,
  suggestedCuts: CUTS,
  cutRange: [-30, 436],
  // Cuts snap to the dossier's slices, or else to the 10 m frames where the rock has a section skin.
  snapCut(x) {
    for (const c of CUTS) if (Math.abs(x - c) < 4) return c;
    return Math.round(x / SLICE_STEP) * SLICE_STEP;
  },
  ambience: { wind: 0.45, rain: 0, crowd: 0.1, room: 0.3, reverb: 0.25, size: 2.5 },
  build, setup, update,
});
