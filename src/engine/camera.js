/* Camera: a raised three-quarter view in the manner of the cutaway books.
 *
 * The camera orbits a target point at distance `dist`, with yaw (left/right) and pitch
 * (height) held within limits so the cut face always faces the viewer. Zooming moves
 * towards whatever is under the cursor. Everything here is in three.js coordinates
 * (x, y, -depth); the stage converts scene points before passing them in.
 */
import * as THREE from 'three';
import { XS } from './core.js';

const { clamp, lerp, easeInOut } = XS.math;

export class Camera3 {
  constructor() {
    this.cam = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);
    this.target = new THREE.Vector3();
    this.yaw = -0.42;
    this.pitch = 0.3;
    this.dist = 100;
    this.W = 800; this.H = 600;
    this.minDist = 1.2; this.maxDist = 2000;
    this.yawLim = [-1.15, 1.15];
    this.pitchLim = [-0.08, 1.25];
    this.bounds = null; // three.js box
    this.v = new THREE.Vector2(); // pan inertia, px/s
    this.zoom = null;
    this.fly = null;
    this.followFn = null;
    this.focusDepth = 3;
    // True once the view has been moved away from the last fit (by the viewer or a flight);
    // the stage refits on resize only while this is false.
    this.moved = false;
    // Reduced motion: flights become cuts and pans have no inertia.
    this.reduced = false;
  }
  setSize(W, H) { this.W = W; this.H = H; this.cam.aspect = W / Math.max(1, H); this.cam.updateProjectionMatrix(); }

  // World units per CSS pixel at the target.
  unitsPerPx() { return (2 * this.dist * Math.tan((this.cam.fov * Math.PI) / 360)) / this.H; }

  // Fit a scene-coordinate box { x0, x1, y0, y1, z0, z1 }.
  fitParams(b, pad = 0.9, yaw = this.yaw, pitch = this.pitch) {
    const w = b.x1 - b.x0, h = b.y1 - b.y0;
    const t = Math.tan((this.cam.fov * Math.PI) / 360);
    const dW = (w / 2) / (t * this.cam.aspect * pad), dH = (h / 2) / (t * pad);
    const dist = Math.max(dW, dH) + ((b.z1 || 0) - (b.z0 || 0)) * 0.25;
    return { target: new THREE.Vector3((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, -((b.z0 || 0) + Math.min(b.z1 || 0, 12)) / 2), dist, yaw, pitch };
  }
  fit(b, pad, instant = true) {
    const f = this.fitParams(b, pad);
    if (instant) { this.target.copy(f.target); this.dist = f.dist; this.fly = null; this.zoom = null; this.v.set(0, 0); }
    else this.flyTo(f, 1.3);
    this.moved = false;
  }

  right() { return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)); }
  up() {
    const f = this.cam.getWorldDirection(new THREE.Vector3());
    return new THREE.Vector3().crossVectors(this.right(), f).normalize();
  }
  panBy(dx, dy) {
    const k = this.unitsPerPx();
    this.target.addScaledVector(this.right(), -dx * k);
    this.target.addScaledVector(this.up(), dy * k);
    this.fly = null; this.zoom = null;
    this.moved = true;
    this._clamp();
  }
  orbitBy(dx, dy) {
    this.yaw = clamp(this.yaw - dx * 0.006, this.yawLim[0], this.yawLim[1]);
    this.pitch = clamp(this.pitch + dy * 0.005, this.pitchLim[0], this.pitchLim[1]);
    this.fly = null;
    this.moved = true;
  }
  // The point under a screen position on a plane parallel to the cut, `focusDepth` behind it.
  pointUnder(sx, sy, depth = this.focusDepth) {
    this.place();
    const ndc = new THREE.Vector2((sx / this.W) * 2 - 1, -(sy / this.H) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.cam);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), depth);
    const p = new THREE.Vector3();
    return ray.ray.intersectPlane(plane, p) ? p : this.target.clone();
  }
  // Zoom by factor k (< 1 is closer) keeping the point under (sx, sy) fixed.
  zoomAt(k, sx, sy, smooth = true) {
    const base = this.zoom ? this.zoom.dist : this.dist;
    const d1 = clamp(base * k, this.minDist, this.maxDist);
    const P = this.pointUnder(sx, sy);
    this.fly = null;
    this.moved = true;
    if (smooth && !this.reduced) this.zoom = { dist: d1, P };
    else this._applyZoom(d1, P);
  }
  _applyZoom(d1, P) {
    const k = d1 / this.dist;
    this.target.sub(P).multiplyScalar(k).add(P);
    this.dist = d1;
    this._clamp();
  }
  flyTo(t, dur = 1.6, done) {
    if (this.reduced) dur = 0.001;
    this.moved = true;
    const d0 = this.dist, d1 = clamp(t.dist || this.dist, this.minDist, this.maxDist);
    const gap = this.target.distanceTo(t.target);
    const bump = clamp(Math.log2(1 + gap / Math.min(d0, d1)) * 0.55, 0, 2.2);
    this.fly = {
      t: 0, dur, from: { p: this.target.clone(), l: Math.log(d0), yaw: this.yaw, pitch: this.pitch },
      to: { p: t.target.clone(), l: Math.log(d1), yaw: t.yaw != null ? t.yaw : this.yaw, pitch: t.pitch != null ? t.pitch : this.pitch }, bump, done,
    };
    this.zoom = null;
    this.v.set(0, 0);
  }
  follow(fn) { this.followFn = fn; if (fn) this.moved = true; }
  setBounds(b) { this.bounds = b; }
  _clamp() {
    if (!this.bounds) return;
    const b = this.bounds, m = 0.25;
    const w = b.x1 - b.x0, h = b.y1 - b.y0;
    this.target.x = clamp(this.target.x, b.x0 - w * m, b.x1 + w * m);
    this.target.y = clamp(this.target.y, b.y0 - h * m, b.y1 + h * m);
    this.target.z = clamp(this.target.z, -(b.z1 || 30) - 5, 5);
  }
  update(dt) {
    if (this.fly) {
      const f = this.fly;
      f.t += dt / f.dur;
      const e = easeInOut(Math.min(1, f.t));
      this.target.lerpVectors(f.from.p, f.to.p, e);
      this.dist = Math.exp(lerp(f.from.l, f.to.l, e) + f.bump * Math.sin(Math.PI * e));
      this.yaw = XS.math.angleLerp(f.from.yaw, f.to.yaw, e);
      this.pitch = lerp(f.from.pitch, f.to.pitch, e);
      if (f.t >= 1) { this.fly = null; if (f.done) f.done(); }
    } else {
      if (this.zoom) {
        const k = 1 - Math.exp(-dt * 12);
        const d = Math.exp(lerp(Math.log(this.dist), Math.log(this.zoom.dist), k));
        this._applyZoom(d, this.zoom.P);
        if (Math.abs(Math.log(this.dist / this.zoom.dist)) < 0.002) this.zoom = null;
      }
      if (this.followFn) {
        const p = this.followFn();
        if (p) this.target.lerp(p, 1 - Math.exp(-dt * 3.5));
      }
      if (this.reduced) this.v.set(0, 0);
      if (this.v.lengthSq() > 1) {
        this.panBy(this.v.x * dt, this.v.y * dt);
        this.v.multiplyScalar(Math.exp(-dt * 5));
      } else this.v.set(0, 0);
    }
    this.place();
  }
  place() {
    const c = Math.cos(this.pitch);
    this.cam.position.set(
      this.target.x + Math.sin(this.yaw) * c * this.dist,
      this.target.y + Math.sin(this.pitch) * this.dist,
      this.target.z + Math.cos(this.yaw) * c * this.dist
    );
    this.cam.near = Math.max(0.05, this.dist * 0.02);
    this.cam.far = Math.max(4000, this.dist * 60);
    this.cam.lookAt(this.target);
    this.cam.updateProjectionMatrix();
    this.cam.updateMatrixWorld();
  }
}
