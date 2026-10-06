/* Figures: every person in a scene, drawn as instanced body parts.
 *
 * A figure is ~20 instances (head, hair, torso, limbs, hands, feet, skirt, apron, hat,
 * beard, a held prop) spread over six instanced meshes, so hundreds of people cost a
 * handful of draw calls. Poses come from anims.js. Figures stand on the floor at
 * (x, y, z) in scene coordinates and face `heading` (0 = +x, PI/2 = away from us,
 * -PI/2 = towards the viewer).
 */
import * as THREE from 'three';
import { XS, h01, rng, toRgb, shade, mix } from './core.js';
import { anims, newPose } from './anims.js';
import { inkMaterial, F } from './materials.js';

const SKIN = ['#f1c9a5', '#e6b48f', '#d9a27a', '#c88c62', '#a96e47', '#8a5634', '#6b4026'];
const HAIR = ['#2b1d14', '#4a3020', '#6b4428', '#8d5a2b', '#b07a3c', '#c9a160', '#d8c9a8', '#9a9a9a', '#e8e4dc', '#7a2c14'];
XS.palettes = { SKIN, HAIR };

// Fill in a costume with seeded defaults.
export function costume(c = {}, seed = 1) {
  const r = rng(seed);
  const out = Object.assign({
    skin: r.pick(SKIN.slice(0, 5)), hair: r.pick(HAIR), hairStyle: r.pick(['short', 'short', 'short', 'long', 'bun']),
    top: r.pick(['#3a4a6a', '#6a3a2a', '#ddd6c4', '#4a6a4a', '#7a6a4a', '#2a2a2a']),
    bottom: r.pick(['#2a2a33', '#4a3a2a', '#5a5a5a', '#3a3a4a']),
    shoes: '#2a1e18', hat: null, hatColor: null, dress: null, dressColor: null, apron: null,
    coat: null, coatColor: null, beard: null, stockings: null, child: false, build: 1, sleeves: 'long',
  }, c);
  if (out.dress && !c.hairStyle) out.hairStyle = r.pick(['bun', 'long', 'bun']);
  return out;
}
XS.costume = costume;

// ------------------------------------------------------------------ geometries
function geoms() {
  const cyl = new THREE.CylinderGeometry(1, 1, 1, 7, 1, false); cyl.translate(0, 0.5, 0); // along +y from 0 to 1
  const sph = new THREE.SphereGeometry(1, 10, 7);
  const torso = new THREE.CylinderGeometry(1, 0.86, 1, 8, 1, false); torso.translate(0, 0.5, 0);
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cone = new THREE.CylinderGeometry(0.55, 1, 1, 10, 1, false); cone.translate(0, 0.5, 0); // skirt: narrow at the top
  const disc = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false);
  return { cyl, sph, torso, box, cone, disc };
}

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpV = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const Y = new THREE.Vector3(0, 1, 0);
const colA = new THREE.Color();

export class Figures {
  constructor(capacity = 400) {
    this.cap = capacity;
    this.G = geoms();
    const per = { cyl: 10, sph: 8, torso: 1, box: 6, cone: 2, disc: 3 };
    this.meshes = {};
    this.group = new THREE.Group();
    const mat = inkMaterial({ instanced: true });
    for (const k of Object.keys(per)) {
      const n = per[k] * capacity;
      const m = new THREE.InstancedMesh(this.G[k], mat, n);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
      m.instanceColor.setUsage(THREE.DynamicDrawUsage);
      const extra = new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4);
      extra.setUsage(THREE.DynamicDrawUsage);
      m.geometry = m.geometry.clone();
      m.geometry.setAttribute('instanceExtra', extra);
      m.count = 0;
      m.frustumCulled = false;
      this.meshes[k] = m;
      this.group.add(m);
    }
    this.P = newPose();
    this.idCache = new Map();
  }

  _id(hex) {
    let v = this.idCache.get(hex);
    if (v == null) { v = 0.2 + h01(this.idCache.size + 3, 77) * 0.6; this.idCache.set(hex, v); }
    return v;
  }

  // Put one instance. g: geometry key; M: matrix; col: '#hex'; flags.
  _put(g, M, col, flags = 0) {
    const m = this.meshes[g];
    const i = m.count;
    if (i >= m.instanceMatrix.count) return;
    m.setMatrixAt(i, M);
    const c = toRgb(col);
    m.instanceColor.array[i * 3] = c[0] / 255; m.instanceColor.array[i * 3 + 1] = c[1] / 255; m.instanceColor.array[i * 3 + 2] = c[2] / 255;
    const e = m.geometry.attributes.instanceExtra.array;
    e[i * 4] = 0; e[i * 4 + 1] = flags; e[i * 4 + 2] = this._id(col); e[i * 4 + 3] = 0;
    m.count = i + 1;
  }

  begin() { for (const m of Object.values(this.meshes)) m.count = 0; }
  end() {
    for (const m of Object.values(this.meshes)) {
      m.instanceMatrix.needsUpdate = true;
      m.instanceColor.needsUpdate = true;
      m.geometry.attributes.instanceExtra.needsUpdate = true;
      m.instanceMatrix.addUpdateRange && m.instanceMatrix.clearUpdateRanges && m.instanceMatrix.clearUpdateRanges();
    }
  }

  // Draw person p at time t. B: base matrix (feet, heading, lying). detail: 0 far .. 2 close.
  person(p, t, detail) {
    const P = this.P;
    P.rootX = 0; P.rootY = 0.52; P.lean = 0; P.head = 0; P.rot = 0; P.prop = p.prop || null; P.propAng = 0; P.mouth = 0;
    P.uaB = 0.1; P.faB = 0.15; P.uaF = -0.05; P.faF = 0.2; P.thB = 0; P.shB = 0; P.thF = 0; P.shF = 0;
    (anims.table[p.anim] || anims.table.stand)(p, t, P);
    const c = p.cos;
    const u = p.H;
    // Base frame: feet position, heading about y, then whole-body rotation about the lateral axis.
    const base = new THREE.Matrix4().makeTranslation(p.x, p.y, p.z);
    base.multiply(tmpM.makeRotationY(-p.heading));
    if (P.rot) base.multiply(tmpM.makeRotationZ(-P.rot));
    const L = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(base);

    // Far away: a simple dab of colour with a head.
    if (detail === 0) {
      tmpS.set(0.13 * u, 0.82 * u, 0.13 * u);
      tmpM.compose(L(0, 0, 0), tmpQ.setFromRotationMatrix(base), tmpS);
      this._put('cyl', tmpM, c.dress ? (c.dressColor || c.top) : c.coat ? (c.coatColor || c.top) : c.top);
      tmpS.setScalar(0.085 * u);
      tmpM.compose(L(0, 0.9 * u, 0), tmpQ, tmpS);
      this._put('sph', tmpM, c.hat ? (c.hatColor || '#2a2420') : c.skin);
      return;
    }

    const thigh = 0.255 * u, shin = 0.255 * u, upper = 0.175 * u, fore = 0.15 * u;
    const torso = 0.3 * u, rh = 0.068 * u, b = c.build || 1;
    const hip = [P.rootX * u, P.rootY * u];
    const sh = [hip[0] + Math.sin(P.lean) * torso, hip[1] + Math.cos(P.lean) * torso];
    const hd = [sh[0] + Math.sin(P.lean + P.head) * rh * 1.6, sh[1] + Math.cos(P.lean + P.head) * rh * 1.6];
    const dir = (a) => [Math.sin(a), -Math.cos(a)];
    const sw = 0.105 * u * b, hw = 0.055 * u * b;

    // A limb segment from local point a to b (sagittal x, y, lateral z) with radius r.
    const seg = (a, bb, r, col, g = 'cyl') => {
      const A = L(a[0], a[1], a[2]), Bp = L(bb[0], bb[1], bb[2]);
      tmpV.subVectors(Bp, A);
      const len = tmpV.length();
      if (len < 1e-5) return;
      tmpQ.setFromUnitVectors(Y, tmpV.divideScalar(len));
      tmpS.set(r, len, r);
      tmpM.compose(A, tmpQ, tmpS);
      this._put(g, tmpM, col);
    };
    const ball = (a, r, col, flags = 0, sx = 1, sy = 1, sz = 1) => {
      tmpQ.setFromRotationMatrix(base);
      tmpS.set(r * sx, r * sy, r * sz);
      tmpM.compose(L(a[0], a[1], a[2]), tmpQ, tmpS);
      this._put('sph', tmpM, col, flags);
    };

    const sleeve = c.coat ? (c.coatColor || c.top) : c.top;
    const fsleeve = c.sleeves === 'short' ? c.skin : sleeve;
    const legCol = c.dress && c.dress !== 'knee' ? (c.stockings || '#4a3a30') : c.bottom;
    const legs = (th, shn, side, colTint) => {
      const d1 = dir(th), d2 = dir(th + shn);
      const z = side * hw;
      const k = [hip[0] + d1[0] * thigh, hip[1] + d1[1] * thigh, z];
      const a = [k[0] + d2[0] * shin, k[1] + d2[1] * shin, z];
      seg([hip[0], hip[1], z], k, 0.052 * u * b, colTint(legCol));
      seg(k, a, 0.042 * u * b, colTint(c.dress && c.dress !== 'knee' ? legCol : c.dress === 'knee' ? (c.stockings || '#e8e0d0') : legCol));
      if (detail >= 1) {
        // Foot: a small box pointing forward from the ankle.
        tmpQ.setFromRotationMatrix(base);
        const f = L(a[0] + 0.045 * u, a[1] - 0.012 * u, z);
        tmpS.set(0.12 * u, 0.045 * u, 0.06 * u);
        tmpM.compose(f, tmpQ, tmpS);
        this._put('box', tmpM, c.shoes);
      }
    };
    const arm = (ua, fa, side, colTint) => {
      const d1 = dir(ua + P.lean * 0.6), d2 = dir(ua + P.lean * 0.6 + fa);
      const z = side * sw;
      const s0 = [sh[0], sh[1] - 0.02 * u, z];
      const e = [s0[0] + d1[0] * upper, s0[1] + d1[1] * upper, z];
      const hnd = [e[0] + d2[0] * fore, e[1] + d2[1] * fore, z];
      seg(s0, e, 0.04 * u * b, colTint(sleeve));
      seg(e, hnd, 0.034 * u * b, colTint(fsleeve));
      if (detail >= 1) ball(hnd, 0.032 * u, c.skin);
      return hnd;
    };
    const dark = (x) => shade(x, -0.12);
    const same = (x) => x;
    legs(P.thB, P.shB, -1, dark);
    legs(P.thF, P.shF, 1, same);
    const handB = arm(P.uaB, P.faB, -1, dark);
    const handF = arm(P.uaF, P.faF, 1, same);

    // Torso: tapered, flattened front to back, following the lean.
    {
      const hemDrop = c.coat === 'long' ? 0.3 * u : c.coat === 'tail' ? 0.22 * u : c.coat ? 0.1 * u : 0.0;
      const bot = [hip[0] - Math.sin(P.lean) * hemDrop, hip[1] - Math.cos(P.lean) * hemDrop, 0];
      const A = L(bot[0], bot[1], 0), Bp = L(sh[0], sh[1], 0);
      tmpV.subVectors(Bp, A);
      const len = tmpV.length();
      tmpQ.setFromUnitVectors(Y, tmpV.clone().divideScalar(len));
      // Orient the flat side across the shoulders: build from the figure's own frame.
      const q2 = new THREE.Quaternion().setFromRotationMatrix(base);
      const q3 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -P.lean - (P.rot ? 0 : 0));
      q2.multiply(q3);
      tmpS.set(0.075 * u * b, len, 0.12 * u * b);
      tmpM.compose(A, q2, tmpS);
      this._put('torso', tmpM, c.coat ? (c.coatColor || c.top) : c.top);
    }
    // Skirt or dress, from the waist.
    if (c.dress) {
      const sitting = P.thF > 1.0;
      const hem = c.dress === 'knee' ? 0.3 * u : 0.05 * u;
      const top = hip[1] + 0.05 * u;
      const q2 = new THREE.Quaternion().setFromRotationMatrix(base);
      if (sitting) {
        const q3 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -1.25);
        q2.multiply(q3);
        tmpS.set(0.15 * u, 0.3 * u, 0.16 * u);
        tmpM.compose(L(hip[0] - 0.02 * u, hip[1] + 0.03 * u, 0), q2, tmpS);
      } else {
        tmpS.set(0.17 * u, top - hem, 0.16 * u);
        tmpM.compose(L(hip[0], hem, 0), q2, tmpS);
      }
      this._put('cone', tmpM, c.dressColor || c.top);
    }
    if (c.apron && detail >= 1) {
      tmpQ.setFromRotationMatrix(base);
      const ay = P.thF > 1 ? hip[1] + 0.02 * u : hip[1] - 0.15 * u;
      tmpS.set(0.02 * u, P.thF > 1 ? 0.12 * u : 0.42 * u, 0.2 * u);
      tmpM.compose(L(hip[0] + 0.085 * u, ay, 0), tmpQ, tmpS);
      this._put('box', tmpM, c.apron);
    }
    // Head, hair, beard, hat.
    ball([hd[0], hd[1], 0], rh, c.skin);
    if (detail >= 1) {
      const covered = c.hat && ['helmet', 'kettle', 'miner', 'chef', 'coif', 'hood', 'veil', 'wimple', 'bonnet', 'kerchief', 'cloche'].includes(c.hat);
      if (c.hairStyle !== 'bald' && !covered) {
        ball([hd[0] - rh * 0.18, hd[1] + rh * 0.22, 0], rh * 1.02, c.hair, 0, 1, 0.85, 1.02);
        if (c.hairStyle === 'bun') ball([hd[0] - rh * 1.0, hd[1] + rh * 0.25, 0], rh * 0.42, c.hair);
        if (c.hairStyle === 'long') seg([hd[0] - rh * 0.7, hd[1] + rh * 0.2, 0], [hd[0] - rh * 0.9, hd[1] - rh * 1.6, 0], rh * 0.65, c.hair);
        if (c.hairStyle === 'queue') seg([hd[0] - rh * 0.9, hd[1], 0], [hd[0] - rh * 1.2, hd[1] - rh * 2.0, 0], rh * 0.18, c.hair);
      }
      if (c.beard) ball([hd[0] + rh * 0.35, hd[1] - rh * 0.45, 0], rh * 0.7, c.beard, 0, 0.9, 0.9, 1.0);
      if (detail >= 2) { // eyes and nose, tiny
        ball([hd[0] + rh * 0.9, hd[1] + rh * 0.15, rh * 0.32], rh * 0.11, '#1a1410');
        ball([hd[0] + rh * 0.9, hd[1] + rh * 0.15, -rh * 0.32], rh * 0.11, '#1a1410');
        ball([hd[0] + rh * 1.0, hd[1] - rh * 0.1, 0], rh * 0.2, shade(c.skin, -0.06));
      }
      if (c.hat) this._hat(c, hd, rh, P.lean + P.head, L, base);
    }
    if (P.prop && detail >= 1) this._prop(P.prop, P.propAng, handF, handB, u, L, base, c, t, p);
  }

  _hat(c, hd, rh, ang, L, base) {
    const col = c.hatColor || '#2a2420';
    const q = new THREE.Quaternion().setFromRotationMatrix(base).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -ang));
    const put = (g, ox, oy, oz, sx, sy, sz, colr = col, flags = 0) => {
      // offsets in head-local coordinates (x forward, y up, z lateral), in units of rh
      const lx = ox * Math.cos(ang) + oy * Math.sin(ang), ly = -ox * Math.sin(ang) + oy * Math.cos(ang);
      tmpS.set(sx * rh, sy * rh, sz * rh);
      tmpM.compose(L(hd[0] + lx * rh, hd[1] + ly * rh, oz * rh), q, tmpS);
      this._put(g, tmpM, colr, flags);
    };
    switch (c.hat) {
      case 'cap': case 'flat': put('sph', 0.05, 0.45, 0, 1.08, 0.55, 1.08); put('box', 0.95, 0.42, 0, 0.8, 0.1, 1.2); break;
      case 'peaked': put('disc', 0, 0.75, 0, 1.12, 0.5, 1.12); put('box', 0.95, 0.5, 0, 0.75, 0.08, 1.1); break;
      case 'bowler': put('sph', 0, 0.55, 0, 1.0, 0.85, 1.0); put('disc', 0, 0.48, 0, 1.45, 0.07, 1.45); break;
      case 'top': put('disc', 0, 1.35, 0, 0.95, 1.65, 0.95); put('disc', 0, 0.55, 0, 1.45, 0.08, 1.45); break;
      case 'tricorne': put('sph', 0, 0.75, 0, 1.6, 0.42, 1.6); put('sph', 0, 1.0, 0, 0.9, 0.5, 0.9); break;
      case 'bicorne': put('sph', 0, 0.95, 0, 0.75, 0.75, 2.0); break;
      case 'helmet': case 'kettle': put('sph', 0, 0.35, 0, 1.15, 1.0, 1.15); put('disc', 0, 0.38, 0, 1.6, 0.06, 1.6); break;
      case 'miner': put('sph', 0, 0.4, 0, 1.12, 0.95, 1.12); put('sph', 1.05, 0.65, 0, 0.25, 0.25, 0.25, '#ffd36a', F.GLOW); break;
      case 'chef': put('disc', 0, 0.95, 0, 0.95, 1.1, 0.95, c.hatColor || '#f6f4ee'); put('sph', 0, 1.6, 0, 1.15, 0.7, 1.15, c.hatColor || '#f6f4ee'); break;
      case 'kerchief': case 'coif': case 'wimple': case 'hood': case 'veil': case 'bonnet':
        put('sph', -0.12, 0.12, 0, 1.18, 1.15, 1.16);
        if (c.hat === 'veil' || c.hat === 'wimple' || c.hat === 'hood') put('cyl', -0.6, -1.6, 0, 0.8, 1.6, 1.1);
        break;
      case 'straw': case 'boater': put('disc', 0, 0.85, 0, 0.92, 0.55, 0.92); put('disc', 0, 0.6, 0, 1.7, 0.06, 1.7); break;
      case 'cloche': put('sph', 0, 0.3, 0, 1.18, 1.05, 1.18); put('disc', 0.2, 0.25, 0, 1.4, 0.06, 1.4); break;
      case 'beret': case 'tam': put('sph', 0, 0.75, 0, 1.25, 0.45, 1.25); break;
      case 'crown': put('disc', 0, 0.9, 0, 0.95, 0.65, 0.95); break;
      case 'mitre': put('cyl', 0, 0.55, 0, 0.8, 2.0, 0.55); break;
      default: put('sph', 0, 0.5, 0, 1.05, 0.7, 1.05);
    }
  }

  _prop(kind, ang, hF, hB, u, L, base, c, t, p) {
    const qBase = new THREE.Quaternion().setFromRotationMatrix(base);
    const stick = (from, a, len, r, col) => {
      const d = [Math.sin(a), -Math.cos(a)];
      const to = [from[0] + d[0] * len, from[1] + d[1] * len, from[2]];
      const A = L(from[0], from[1], from[2]), B = L(to[0], to[1], to[2]);
      tmpV.subVectors(B, A); const l = tmpV.length(); if (l < 1e-5) return to;
      tmpQ.setFromUnitVectors(Y, tmpV.divideScalar(l)); tmpS.set(r, l, r); tmpM.compose(A, tmpQ, tmpS);
      this._put('cyl', tmpM, col);
      return to;
    };
    const blk = (pos, sx, sy, sz, col, rotZ = 0, flags = 0) => {
      const q = qBase.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotZ));
      tmpS.set(sx, sy, sz); tmpM.compose(L(pos[0], pos[1], pos[2]), q, tmpS);
      this._put('box', tmpM, col, flags);
    };
    const wood = '#8a5a30', iron = '#5a5e64';
    switch (kind) {
      case 'shovel': { const e = stick([hF[0], hF[1], 0], ang, 0.6 * u, 0.013 * u, wood); blk(e, 0.18 * u, 0.03 * u, 0.16 * u, iron, -(ang - Math.PI / 2)); break; }
      case 'pick': { const e = stick([hF[0], hF[1], 0], ang, 0.5 * u, 0.012 * u, wood); blk(e, 0.05 * u, 0.4 * u, 0.04 * u, iron, -ang); break; }
      case 'hammer': case 'mallet': { const e = stick([hF[0], hF[1], 0], ang, 0.3 * u, 0.01 * u, wood); blk(e, kind === 'mallet' ? 0.1 * u : 0.06 * u, kind === 'mallet' ? 0.08 * u : 0.04 * u, 0.06 * u, kind === 'mallet' ? '#a07848' : iron, -ang); break; }
      case 'broom': { const e = stick([hF[0], hF[1], 0], ang, 0.85 * u, 0.012 * u, wood); blk(e, 0.07 * u, 0.12 * u, 0.2 * u, '#c9a85a', -ang); break; }
      case 'spoon': stick([hF[0], hF[1], 0], 0.2, 0.35 * u, 0.008 * u, wood); break;
      case 'saw': blk([hF[0] + 0.2 * u, hF[1] - 0.05 * u, 0], 0.45 * u, 0.1 * u, 0.006 * u, '#b8bec4', -0.3); break;
      case 'rope': stick([hB[0], hB[1], 0], ang + Math.PI, 1.4 * u, 0.012 * u, '#b8955a'); break;
      case 'tray': blk([hF[0], hF[1] + 0.02 * u, 0], 0.35 * u, 0.015 * u, 0.25 * u, '#c8c8c8'); blk([hF[0], hF[1] + 0.06 * u, 0.04 * u], 0.05 * u, 0.07 * u, 0.05 * u, '#f4f0e8'); break;
      case 'box': case 'crate': blk([hF[0], hF[1] + 0.05 * u, -0.06 * u], 0.28 * u, 0.22 * u, 0.3 * u, '#b08850'); break;
      case 'suitcase': blk([hF[0], hF[1] - 0.15 * u, 0.05 * u], 0.08 * u, 0.25 * u, 0.36 * u, '#6a4024'); break;
      case 'sack': blk([hF[0] - 0.08 * u, hF[1] + 0.06 * u, -0.04 * u], 0.3 * u, 0.18 * u, 0.22 * u, '#c8b080', 0.3); break;
      case 'plank': blk([hF[0], hF[1] + 0.04 * u, 0], 1.6 * u, 0.04 * u, 0.12 * u, '#c0965a'); break;
      case 'bucket': blk([hF[0], hF[1] - 0.12 * u, 0], 0.14 * u, 0.15 * u, 0.14 * u, '#7a6a5a'); break;
      case 'lantern': case 'lamp': blk([hF[0], hF[1] - 0.1 * u, 0], 0.08 * u, 0.13 * u, 0.08 * u, '#ffd56a', 0, F.GLOW); break;
      case 'book': case 'paper': case 'letter': blk([hF[0] + 0.03 * u, hF[1], 0], 0.1 * u, 0.012 * u, 0.14 * u, kind === 'book' ? '#7a2a20' : '#f6f0e0', 0.4); break;
      case 'glass': case 'mug': blk([hF[0], hF[1] + 0.03 * u, 0], 0.035 * u, 0.06 * u, 0.035 * u, kind === 'glass' ? '#c8dde6' : '#9a8a70'); break;
      case 'jug': blk([hF[0] + 0.04 * u, hF[1], 0], 0.08 * u, 0.12 * u, 0.08 * u, '#a0603a', -ang); break;
      case 'telescope': stick([hF[0] - 0.15 * u, hF[1], 0], ang, 0.55 * u, 0.02 * u, '#8a6a3a'); break;
      case 'violin': blk([hB[0] - 0.03 * u, hB[1] + 0.02 * u, 0.06 * u], 0.22 * u, 0.04 * u, 0.1 * u, '#8a3e1a', 0.4); stick([hF[0], hF[1], 0], 2.2, 0.35 * u, 0.004 * u, '#e8e0d0'); break;
      case 'basket': blk([hF[0], hF[1] - 0.1 * u, 0], 0.25 * u, 0.15 * u, 0.2 * u, '#b08a4a'); break;
      case 'cane': stick([hF[0], hF[1], 0], 0.1, 0.85 * u, 0.008 * u, '#3a2a1a'); break;
      case 'pipe': blk([hF[0] + 0.03 * u, hF[1] + 0.02 * u, 0], 0.07 * u, 0.02 * u, 0.02 * u, '#3a2a20'); break;
      case 'flag': stick([hF[0], hF[1] - 0.2 * u, 0], Math.PI, 0.8 * u, 0.008 * u, wood); blk([hF[0] + 0.14 * u, hF[1] + 0.45 * u, 0], 0.28 * u, 0.2 * u, 0.005 * u, '#c0302a'); break;
      case 'cards': blk([hF[0], hF[1] + 0.02 * u, 0], 0.05 * u, 0.008 * u, 0.07 * u, '#ffffff'); break;
      case 'trowel': blk([hF[0] + 0.06 * u, hF[1], 0], 0.12 * u, 0.008 * u, 0.06 * u, iron); break;
      case 'clipboard': blk([hF[0] + 0.03 * u, hF[1] + 0.02 * u, 0], 0.02 * u, 0.2 * u, 0.15 * u, '#a08050', 0.6); break;
      default: break;
    }
    void c; void t; void p; void mix; void colA;
  }
}

XS.Figures = Figures;
