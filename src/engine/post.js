/* The ink pass: turns the lit render into a pen-and-watercolour illustration.
 *
 * Reads the colour and info targets (view normal, material id, view depth) and draws:
 *  - ink lines where depth folds (silhouettes), normals turn (creases) or materials meet;
 *  - a slight, steady wobble and pen-pressure variation along the lines;
 *  - watercolour granulation and pigment pooling just inside the lines;
 *  - paper fibre and a whisper of vignette.
 * Cut faces (material id >= 2) take only id lines, so their hatching stays clean.
 */
import * as THREE from 'three';

const VERT = /* glsl */ `
out vec2 vUv;
void main() { vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
layout(location = 0) out highp vec4 outColor;
uniform sampler2D tColor, tInfo;
uniform vec2 uRes;      // render target size in pixels
uniform float uScale;   // render pixels per CSS pixel
uniform float uSeed, uInk, uWobble, uGrain, uNight, uPaper;
uniform vec3 uInkCol;
in vec2 vUv;

float h12(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), u.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), u.x), u.y); }

vec4 I(vec2 px) { return texture(tInfo, px / uRes); }
vec3 nrm(vec4 i) { vec2 xy = i.xy * 2.0 - 1.0; return vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))); }

// Edge strength at pixel p with sampling radius r.
float edge(vec2 p, float r) {
  vec4 c = I(p);
  vec4 l = I(p + vec2(-r, 0.0)), rr = I(p + vec2(r, 0.0)), u = I(p + vec2(0.0, r)), d = I(p + vec2(0.0, -r));
  float e = 0.0;
  // Material id changes (includes cut faces and sky).
  float ids = 0.0;
  if (!(c.z < -0.5 && l.z < -0.5)) ids = max(ids, step(0.002, abs(c.z - l.z)));
  if (!(c.z < -0.5 && rr.z < -0.5)) ids = max(ids, step(0.002, abs(c.z - rr.z)));
  if (!(c.z < -0.5 && u.z < -0.5)) ids = max(ids, step(0.002, abs(c.z - u.z)));
  if (!(c.z < -0.5 && d.z < -0.5)) ids = max(ids, step(0.002, abs(c.z - d.z)));
  // Unmarked surfaces (sea, some soft things) only take silhouette lines against the sky.
  if (c.z < -0.5) ids *= step(0.5, max(max(step(abs(l.z), 0.0001), step(abs(rr.z), 0.0001)), max(step(abs(u.z), 0.0001), step(abs(d.z), 0.0001))));
  e = max(e, ids);
  bool solid = c.z >= 0.0 && c.z < 1.5 && c.a > 0.0;
  if (solid) {
    // Depth folds: the second difference catches silhouettes but not planes seen at an angle.
    float dc = c.a;
    float lap = max(abs(l.a + rr.a - 2.0 * dc), abs(u.a + d.a - 2.0 * dc));
    e = max(e, smoothstep(0.012, 0.03, lap / dc));
    // Creases where normals turn sharply.
    vec3 nc = nrm(c);
    float nd = 1.0;
    if (l.z >= 0.0 && l.z < 1.5) nd = min(nd, dot(nc, nrm(l)));
    if (rr.z >= 0.0 && rr.z < 1.5) nd = min(nd, dot(nc, nrm(rr)));
    if (u.z >= 0.0 && u.z < 1.5) nd = min(nd, dot(nc, nrm(u)));
    if (d.z >= 0.0 && d.z < 1.5) nd = min(nd, dot(nc, nrm(d)));
    e = max(e, smoothstep(0.88, 0.7, nd) * 0.85);
  }
  return e;
}

void main() {
  vec2 p = vUv * uRes;
  float s = uScale;
  // Wobble: the drawn line wanders a fraction of a pixel, steadily (not boiling).
  vec2 w = (vec2(vn(p / (34.0 * s) + uSeed), vn(p / (34.0 * s) + uSeed + 17.3)) - 0.5) * 2.0 * uWobble * s;
  float e = edge(p + w, 1.0 * s);
  // Pen pressure: lines thin and fade a little in places.
  float press = 0.72 + 0.28 * vn(p / (60.0 * s) + uSeed * 3.0);
  e *= press;
  // Colour with a tiny bleed.
  vec2 bleed = (vec2(vn(p / (9.0 * s) + 3.0), vn(p / (9.0 * s) + 9.0)) - 0.5) * 0.9 * s;
  vec3 col = texture(tColor, (p + bleed) / uRes).rgb;
  vec4 info = I(p);
  bool isSky = abs(info.z) < 0.0001;
  if (!isSky) {
    // Granulation and soft blooms of pigment.
    float g = vn(p / (1.6 * s)) * 0.6 + vn(p / (5.0 * s)) * 0.4;
    float bloom = vn(p / (90.0 * s) + 11.0);
    col *= 1.0 - uGrain * (0.11 * g + 0.08 * bloom - 0.07);
    // Pigment pools just inside the ink line.
    float wide = max(max(edge(p + vec2(2.5, 0.0) * s, 1.0 * s), edge(p - vec2(2.5, 0.0) * s, 1.0 * s)), max(edge(p + vec2(0.0, 2.5) * s, 1.0 * s), edge(p - vec2(0.0, 2.5) * s, 1.0 * s)));
    col *= 1.0 - 0.09 * wide * uGrain;
  }
  // Ink.
  vec3 inkc = mix(uInkCol, uInkCol * 0.6, uNight);
  col = mix(col, inkc, clamp(e * uInk, 0.0, 1.0) * 0.92);
  // Paper fibre over everything.
  float fib = vn(vec2(p.x / (2.0 * s), p.y / (11.0 * s))) * 0.5 + vn(p / (3.0 * s) + 40.0) * 0.5;
  col *= 1.0 - uPaper * (0.05 * fib - 0.02);
  // Vignette.
  vec2 q = vUv - 0.5;
  col *= 1.0 - dot(q, q) * 0.22;
  outColor = vec4(col, 1.0);
}
`;

export class InkPass {
  constructor() {
    this.uniforms = {
      tColor: { value: null }, tInfo: { value: null },
      uRes: { value: new THREE.Vector2(1, 1) }, uScale: { value: 1 },
      uSeed: { value: 3.7 }, uInk: { value: 1 }, uWobble: { value: 0.7 }, uGrain: { value: 1 }, uNight: { value: 0 }, uPaper: { value: 1 },
      uInkCol: { value: new THREE.Color(0.16, 0.13, 0.11) },
    };
    this.material = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, depthTest: false, depthWrite: false });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }
}
