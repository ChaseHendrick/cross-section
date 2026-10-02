/* Materials: the painterly shader every solid in a scene is drawn with.
 *
 * One ShaderMaterial (GLSL 3) renders static batches and instanced figures alike.
 * It writes two targets:
 *   location 0: colour, already lit (wrapped diffuse, sky/ground ambient, lamp light, glow)
 *   location 1: info = (view normal xy, material id, view depth) for the ink pass
 *
 * Clipping is done here rather than with three.js planes, so a vertex can opt out
 * of the cutaway (a mast drawn whole), and each slice is drawn with its own x range.
 * Back faces seen through a cut are painted as the cut face: a flat poché colour
 * with fine diagonal hatching, which is how cut material reads in a section drawing.
 */
import * as THREE from 'three';

// Flag bits (pat.z).
export const F = { WHOLE: 1, THIN: 2, GLOW_NIGHT: 4, GLOW: 8, NOEDGE: 16, NOCUT_HATCH: 32, CUT_PAT: 64 };

// Pattern ids (pat.x).
export const PAT = {
  none: 0, planks: 1, deck: 2, brick: 3, ashlar: 4, stone: 5, plates: 6, tiles: 7, checker: 8,
  carpet: 9, stripes: 10, panels: 11, grate: 12, slates: 13, thatch: 14, canvas: 15, grain: 16,
  speckle: 17, corrugated: 18, panes: 19, rock: 20, rivets: 21, bars: 22, quilt: 23, books: 24, rings: 25,
};

// Shared uniforms: one object, referenced by every material, set once per frame / pass.
export const U = {
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(-0.4, 0.8, 0.45).normalize() },
  uSunCol: { value: new THREE.Color(1, 0.97, 0.9) },
  uSkyCol: { value: new THREE.Color(0.85, 0.88, 0.9) },
  uGroundCol: { value: new THREE.Color(0.62, 0.58, 0.5) },
  uNight: { value: 0 },
  uLamp: { value: null },
  uLampMin: { value: new THREE.Vector3() },
  uLampSize: { value: new THREE.Vector3(1, 1, 1) },
  uLampGain: { value: 1 },
  uOffset: { value: 0 },
  uSlice: { value: new THREE.Vector2(-1e9, 1e9) },
  uCutOn: { value: 1 },
  uFogCol: { value: new THREE.Color(0.8, 0.82, 0.85) },
  uFog: { value: new THREE.Vector3(1e6, 2e6, 0) }, // near, far, amount
  uFlicker: { value: 1 },
};

const VERT = /* glsl */ `
in vec3 color2;
in vec3 cutc;
in vec4 pat;
in vec3 shadeC; // per-vertex tint: ambient occlusion and hand-mixed variation
#ifdef USE_INSTANCING
in vec4 instanceExtra; // x: lamp light sampled on the CPU (unused now), y: flags, z: matId
#endif
out vec3 vWorld;
out vec3 vNormalW;
out vec3 vViewN;
out float vDepth;
out vec3 vColor;
flat out vec3 vColor2;
flat out vec3 vCut;
flat out vec4 vPat;
out vec3 vShade;
void main() {
  vec4 lp = vec4(position, 1.0);
  vec3 n = normal;
  #ifdef USE_INSTANCING
    lp = instanceMatrix * lp;
    n = mat3(instanceMatrix) * n;
  #endif
  vec4 wp = modelMatrix * lp;
  vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * n);
  vViewN = normalize(mat3(viewMatrix) * vNormalW);
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  #ifdef USE_INSTANCING_COLOR
    vColor = instanceColor;
    vColor2 = instanceColor;
    vCut = instanceColor * 0.45;
    vPat = vec4(0.0, 1.0, instanceExtra.y, instanceExtra.z);
    vShade = vec3(1.0);
  #else
    #ifdef USE_COLOR
      vColor = color;
    #else
      vColor = vec3(0.8);
    #endif
    vColor2 = color2;
    vCut = cutc;
    vPat = pat;
    vShade = shadeC;
  #endif
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
precision highp float;
precision highp sampler3D;
layout(location = 0) out highp vec4 outColor;
layout(location = 1) out highp vec4 gInfo;
uniform float uTime;
uniform vec3 uSunDir, uSunCol, uSkyCol, uGroundCol, uFogCol, uFog;
uniform float uNight, uOffset, uCutOn, uLampGain, uFlicker;
uniform vec2 uSlice;
uniform sampler3D uLamp;
uniform vec3 uLampMin, uLampSize;
in vec3 vWorld;
in vec3 vNormalW;
in vec3 vViewN;
in float vDepth;
in vec3 vColor;
flat in vec3 vColor2;
flat in vec3 vCut;
flat in vec4 vPat;
in vec3 vShade;

float h12(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float h11(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y);
}
// Anti-aliased ink line at distance d (metres): one to two pixels wide, fading out when too dense.
float ink(float d, float period) {
  float fw = max(fwidth(d), 1e-5);
  float l = 1.0 - smoothstep(0.55 * fw, 1.4 * fw, abs(d));
  return l * smoothstep(2.5, 7.0, period / fw);
}
float gridD(float x, float p) { return (fract(x / p + 0.5) - 0.5) * p; }

// Returns colour after the pattern; 'lines' collects ink detail.
vec3 pattern(int id, vec2 uv, float s, vec3 base, vec3 c2, out float lines) {
  lines = 0.0;
  if (id == 0) return base;
  if (id == 1 || id == 2) { // planks / deck: boards along u
    float w = s > 0.0 ? s : 0.15;
    float row = floor(uv.y / w);
    float len = (id == 2 ? 6.0 : 2.6) + h11(row * 7.1) * 2.5;
    float ofs = h11(row * 3.3) * len;
    float board = floor((uv.x + ofs) / len);
    float v = h12(vec2(row, board));
    vec3 c = mix(base, c2, v * (id == 2 ? 0.25 : 0.45));
    c *= 0.94 + 0.12 * vnoise(vec2(uv.x * 3.0, row * 5.0));
    lines = max(ink(gridD(uv.y, w), w) * (id == 2 ? 0.9 : 0.55), ink((fract((uv.x + ofs) / len + 0.5) - 0.5) * len, w * 3.0) * 0.45);
    if (id == 2) { // trenails
      vec2 q = vec2(fract((uv.x + ofs) / 0.9) - 0.5, fract(uv.y / w) - 0.5) * vec2(0.9, w);
      float fw = fwidth(uv.x);
      lines = max(lines, (1.0 - smoothstep(0.012, 0.012 + fw, length(q))) * smoothstep(2.0, 8.0, 0.05 / fw) * 0.6);
    }
    return c;
  }
  if (id == 3) { // brick
    float bh = 0.075 * (s > 0.0 ? s : 1.0), bw = bh * 3.0;
    float row = floor(uv.y / bh);
    float x = uv.x + mod(row, 2.0) * bw * 0.5;
    float b = floor(x / bw);
    vec3 c = mix(base, c2, h12(vec2(row, b)) * 0.35);
    lines = max(ink(gridD(uv.y, bh), bh), ink(gridD(x, bw), bh) * step(0.0, 1.0)) * 0.6;
    return c;
  }
  if (id == 4 || id == 5) { // ashlar / stone
    float bh = (s > 0.0 ? s : 0.32);
    float row = floor(uv.y / bh);
    float bw = id == 4 ? bh * 1.9 : bh * (1.2 + h11(row) * 1.4);
    float x = uv.x + h11(row * 1.7) * bw;
    float b = floor(x / bw);
    vec3 c = mix(base, c2, h12(vec2(row, b)) * (id == 4 ? 0.22 : 0.4));
    c *= 0.92 + 0.12 * vnoise(uv * 6.0);
    float wob = id == 5 ? (vnoise(uv * 9.0) - 0.5) * 0.04 : 0.0;
    lines = max(ink(gridD(uv.y + wob, bh), bh), ink(gridD(x + wob, bw), bh)) * 0.7;
    return c;
  }
  if (id == 6 || id == 21) { // riveted plates / rivet rows
    vec2 p = vec2(s > 0.0 ? s * 2.2 : 3.0, s > 0.0 ? s : 1.4);
    float row = floor(uv.y / p.y);
    float x = uv.x + mod(row, 2.0) * p.x * 0.5;
    vec3 c = mix(base, c2, h12(vec2(row, floor(x / p.x))) * 0.18);
    float seams = max(ink(gridD(uv.y, p.y), p.y), ink(gridD(x, p.x), p.y));
    // rivets along the horizontal seams
    vec2 q = vec2(fract(uv.x / 0.14) - 0.5, (fract(uv.y / p.y + 0.5) - 0.5) * p.y / 0.14 + 0.35);
    float fw = fwidth(uv.x) / 0.14;
    float riv = (1.0 - smoothstep(0.18, 0.18 + fw * 1.5, length(q))) * smoothstep(1.0, 4.0, 0.14 / fwidth(uv.x));
    lines = max(seams * (id == 6 ? 0.75 : 0.0), riv * 0.55);
    return c;
  }
  if (id == 7 || id == 8) { // tiles / checker
    float t = s > 0.0 ? s : (id == 7 ? 0.15 : 0.4);
    vec2 cell = floor(uv / t);
    if (id == 8) { float k = mod(cell.x + cell.y, 2.0); return mix(base, c2, k); }
    lines = max(ink(gridD(uv.x, t), t), ink(gridD(uv.y, t), t)) * 0.4;
    return mix(base, c2, h12(cell) * 0.12);
  }
  if (id == 9) { // carpet: border-less repeating motif
    float t = s > 0.0 ? s : 0.6;
    vec2 q = fract(uv / t) - 0.5;
    float d = abs(q.x) + abs(q.y);
    float m = smoothstep(0.26, 0.22, d) * (1.0 - smoothstep(0.14, 0.1, d));
    return mix(base, c2, m * 0.7 + 0.08 * vnoise(uv * 20.0));
  }
  if (id == 10) { // stripes
    float t = s > 0.0 ? s : 0.18;
    return mix(base, c2, step(0.5, fract(uv.x / t)));
  }
  if (id == 11) { // panels
    vec2 p = vec2(s > 0.0 ? s : 0.9, 1.0);
    vec2 q = fract(uv / p);
    vec2 e = min(q, 1.0 - q) * p;
    float inset = smoothstep(0.07, 0.075, min(e.x, e.y));
    lines = max(ink(gridD(uv.x, p.x), p.x), ink(gridD(uv.y, p.y), p.y)) * 0.6;
    lines = max(lines, ink(min(e.x, e.y) - 0.07, p.x) * 0.4);
    return mix(c2, base, inset);
  }
  if (id == 12) { // tread plate
    vec2 q = fract(uv / 0.09) - 0.5;
    float m = smoothstep(0.2, 0.12, abs(q.x - q.y) * 0.6 + abs(q.x + q.y) * 0.12);
    return mix(base, c2, m * smoothstep(3.0, 8.0, 0.09 / fwidth(uv.x)));
  }
  if (id == 13) { // slates / shingles
    float h = s > 0.0 ? s : 0.22;
    float row = floor(uv.y / h);
    float x = uv.x + mod(row, 2.0) * h * 0.6;
    lines = max(ink(gridD(uv.y, h), h), ink(gridD(x, h * 1.2), h) * 0.6) * 0.65;
    return mix(base, c2, h12(vec2(row, floor(x / (h * 1.2)))) * 0.3);
  }
  if (id == 14) { // thatch
    float n = vnoise(vec2(uv.x * 40.0, uv.y * 3.0));
    lines = smoothstep(0.75, 0.9, n) * 0.4;
    return mix(base, c2, n * 0.5);
  }
  if (id == 15) { // canvas / sailcloth: seams
    float t = s > 0.0 ? s : 0.6;
    lines = ink(gridD(uv.x, t), t) * 0.35;
    return base * (0.96 + 0.06 * vnoise(uv * 30.0));
  }
  if (id == 16) { // wood grain
    float g = vnoise(vec2(uv.x * 1.5, uv.y * 40.0));
    return mix(base, c2, smoothstep(0.4, 0.9, g) * 0.35);
  }
  if (id == 17) { // speckled granite / plaster
    float n = vnoise(uv * 60.0);
    return mix(base, c2, smoothstep(0.7, 0.9, n) * 0.6) * (0.95 + 0.08 * vnoise(uv * 4.0));
  }
  if (id == 18) { // corrugated
    float t = s > 0.0 ? s : 0.08;
    float k = 0.5 + 0.5 * sin(uv.x / t * 6.2831);
    return base * (0.82 + 0.25 * k);
  }
  if (id == 19) { // window panes
    vec2 p = vec2(s > 0.0 ? s : 0.3, (s > 0.0 ? s : 0.3) * 1.3);
    lines = max(ink(gridD(uv.x, p.x), p.x), ink(gridD(uv.y, p.y), p.y)) * 0.8;
    return mix(base, c2, smoothstep(0.2, 0.8, fract((uv.x + uv.y) * 0.7)) * 0.25);
  }
  if (id == 20) { // rock
    float n = vnoise(uv * 1.5) * 0.6 + vnoise(uv * 5.0) * 0.3 + vnoise(uv * 17.0) * 0.1;
    lines = smoothstep(0.62, 0.66, vnoise(uv * 2.3)) * (1.0 - smoothstep(0.66, 0.7, vnoise(uv * 2.3))) * 0.5;
    return mix(base, c2, n);
  }
  if (id == 22) { // vertical bars (railings, stalls, louvres)
    float t = s > 0.0 ? s : 0.12;
    lines = ink(gridD(uv.x, t), t) * 0.8;
    return base;
  }
  if (id == 23) { // quilt / blanket
    float t = s > 0.0 ? s : 0.25;
    vec2 q = floor(uv / t);
    lines = max(ink(gridD(uv.x, t), t), ink(gridD(uv.y, t), t)) * 0.25;
    return mix(base, c2, mod(q.x + q.y, 2.0) * 0.5);
  }
  if (id == 25) { // horizontal rings (lens prisms, barrel staves seen side on, corrugations)
    float t = s > 0.0 ? s : 0.08;
    lines = ink(gridD(uv.y, t), t) * 0.7;
    return mix(base, c2, 0.5 + 0.5 * sin(uv.y / t * 6.2831));
  }
  if (id == 24) { // book spines
    float t = s > 0.0 ? s : 0.045;
    float b = floor(uv.x / (t * (0.7 + 0.6 * h11(floor(uv.x / t)))));
    vec3 pal = vec3(h11(b), h11(b + 3.1), h11(b + 7.7));
    lines = ink(gridD(uv.x, t), t) * 0.4;
    return mix(base, mix(c2, pal, 0.55), 0.85);
  }
  return base;
}

vec4 lampAt(vec3 sp) {
  vec3 q = (sp - uLampMin) / uLampSize;
  if (any(lessThan(q, vec3(0.0))) || any(greaterThan(q, vec3(1.0)))) return vec4(0.0);
  return texture(uLamp, q);
}

void main() {
  int flags = int(vPat.z + 0.5);
  vec3 sp = vec3(vWorld.x - uOffset, vWorld.y, -vWorld.z); // scene coordinates: x, y, depth
  if ((flags & 1) == 0 && uCutOn > 0.5 && sp.z < -0.002) discard;
  if (sp.x < uSlice.x || sp.x > uSlice.y) discard;

  bool cut = !gl_FrontFacing && (flags & 2) == 0;
  if (cut) {
    // The cut face: flat poché with fine hatching in screen space.
    vec3 c = vCut;
    if ((flags & 64) != 0) {
      // Show the material's own pattern on its cut (stone courses, planks, plates).
      float cl;
      c = pattern(int(vPat.x + 0.5), vec2(sp.x, sp.y), vPat.y, vCut, mix(vCut, vColor2, 0.35), cl);
      c = mix(c, c * 0.5, cl);
    } else if ((flags & 32) == 0) {
      float hx = fract((gl_FragCoord.x + gl_FragCoord.y) / 5.0);
      float h = 1.0 - smoothstep(0.08, 0.22, abs(hx - 0.5) * 2.0 - 0.6);
      c = mix(c, c * 0.62, h * 0.38);
    }
    // A touch of the lamp light so cut faces are not pitch black at night.
    vec4 L = lampAt(sp) * uLampGain;
    vec3 amb = mix(vec3(1.0), uSkyCol * 1.1, 0.35);
    c = c * (amb + L.rgb * uNight + L.a * 0.5);
    outColor = vec4(c, 1.0);
    gInfo = vec4(0.5, 0.5, vPat.w + 2.0, vDepth);
    return;
  }
  vec3 N = normalize(vNormalW);
  if (!gl_FrontFacing) N = -N;
  // Pattern coordinates from the dominant axis of the face.
  vec3 an = abs(N);
  vec2 uv = an.y > an.x && an.y > an.z ? vec2(sp.x, sp.z) : (an.z > an.x ? vec2(sp.x, sp.y) : vec2(sp.z, sp.y));
  float lines;
  vec3 base = pattern(int(vPat.x + 0.5), uv, vPat.y, vColor, vColor2, lines);
  base *= vShade;
  // Light: wrapped diffuse with a soft three-tone ramp, sky/ground ambient, lamp volume.
  float ndl = dot(N, uSunDir);
  float wrap = clamp((ndl + 0.4) / 1.4, 0.0, 1.0);
  float tone = mix(wrap, floor(wrap * 3.0 + 0.5) / 3.0, 0.35);
  vec3 hemi = mix(uGroundCol, uSkyCol, N.y * 0.5 + 0.5);
  vec3 light = hemi * 0.74 + uSunCol * tone * 0.5;
  vec4 L = lampAt(sp) * uLampGain;
  light += L.rgb * uNight * uFlicker + vec3(1.0, 0.72, 0.42) * L.a * uFlicker;
  vec3 col = base * light;
  if ((flags & 4) != 0) col = mix(col, vColor2 * (0.8 + 0.35 * dot(base, vec3(0.33))), uNight * 0.85);
  if ((flags & 8) != 0) col = mix(col, vColor2 * 1.15, 0.8);
  col = mix(col, col * 0.55, lines);
  // Distance haze.
  float f = smoothstep(uFog.x, uFog.y, vDepth) * uFog.z;
  col = mix(col, uFogCol, f);
  outColor = vec4(col, 1.0);
  float edgeId = ((flags & 16) != 0) ? -1.0 : vPat.w;
  gInfo = vec4(normalize(vViewN).xy * 0.5 + 0.5, edgeId, vDepth);
}
`;

const cache = new Map();
// The ink material. options: { instanced: bool }
export function inkMaterial(opts = {}) {
  const key = JSON.stringify(opts);
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: U,
    vertexColors: !opts.instanced,
    side: THREE.DoubleSide,
  });
  cache.set(key, m);
  return m;
}

// ------------------------------------------------------------------ transparent overlay material
// Glass, water cut faces, smoke and halos are drawn after the ink pass, with a manual depth
// test against the scene depth in the info target (so they never get ink outlines, and smoke
// softens where it meets solids).
export const OU = {
  tInfo: { value: null },
  uRes: { value: new THREE.Vector2(1, 1) },
};

const OVERLAY_VERT = /* glsl */ `
out vec3 vWorld;
out float vDepth;
out vec3 vColor;
out float vAlpha;
in vec4 ov; // rgb tint is 'color'; ov.x alpha, ov.y flags (1 whole), ov.z softness
out float vFlags;
out float vSoft;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  vColor = color;
  vAlpha = ov.x;
  vFlags = ov.y;
  vSoft = ov.z;
  gl_Position = projectionMatrix * mv;
}
`;
const OVERLAY_FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
uniform sampler2D tInfo;
uniform vec2 uRes;
uniform float uOffset, uCutOn, uNight;
uniform vec2 uSlice;
in vec3 vWorld;
in float vDepth;
in vec3 vColor;
in float vAlpha;
in float vFlags;
in float vSoft;
void main() {
  vec3 sp = vec3(vWorld.x - uOffset, vWorld.y, -vWorld.z);
  int flags = int(vFlags + 0.5);
  if ((flags & 1) == 0 && uCutOn > 0.5 && sp.z < -0.002) discard;
  if (sp.x < uSlice.x || sp.x > uSlice.y) discard;
  float sceneD = texture(tInfo, gl_FragCoord.xy / uRes).a;
  if (sceneD > 0.0 && vDepth > sceneD + 0.02) discard;
  float a = vAlpha;
  if (vSoft > 0.0 && sceneD > 0.0) a *= smoothstep(0.0, vSoft, sceneD - vDepth);
  vec3 c = vColor;
  if ((flags & 4) != 0) c = mix(c, vec3(1.0, 0.85, 0.55), uNight * 0.7);
  outColor = vec4(c, a);
}
`;
let overlayMat = null;
export function overlayMaterial() {
  if (overlayMat) return overlayMat;
  overlayMat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: OVERLAY_VERT,
    fragmentShader: OVERLAY_FRAG,
    uniforms: Object.assign({}, U, OU),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });
  return overlayMat;
}

// ------------------------------------------------------------------ additive glow (beams, shafts)
// A soft additive material for light beams and sun shafts. Geometry uv.y runs 0 at the
// source to 1 at the far end; brightness fades along it and across uv.x.
const GLOW_VERT = /* glsl */ `
out vec2 vUv;
out float vDepth;
out vec3 vWorld;
out float vFacing;
void main() {
  vUv = uv;
  vec3 nw = normalize(mat3(modelMatrix) * normal);
  vec3 wpos = (modelMatrix * vec4(position, 1.0)).xyz;
  vFacing = abs(dot(nw, normalize(cameraPosition - wpos)));
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;
const GLOW_FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
uniform sampler2D tInfo;
uniform vec2 uRes, uSlice;
uniform float uOffset, uIntensity;
uniform vec3 uColor;
in vec2 vUv;
in float vDepth;
in vec3 vWorld;
in float vFacing;
void main() {
  float sx = vWorld.x - uOffset;
  if (sx < uSlice.x || sx > uSlice.y) discard;
  float sceneD = texture(tInfo, gl_FragCoord.xy / uRes).a;
  if (sceneD > 0.0 && vDepth > sceneD + 0.05) discard;
  float along = 1.0 - smoothstep(0.0, 1.0, vUv.y);
  float g = pow(along, 1.6) * pow(vFacing, 1.5) * uIntensity;
  outColor = vec4(uColor * g, 1.0);
}
`;
export function glowMaterial(color = 0xfff0c0) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: GLOW_VERT, fragmentShader: GLOW_FRAG,
    uniforms: Object.assign({}, U, OU, { uColor: { value: new THREE.Color(color) }, uIntensity: { value: 1 } }),
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}
