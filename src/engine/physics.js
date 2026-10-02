/* Physics: an optional cannon-es world for things that should tumble, swing or float.
 *
 *   const P = world.physics({ gravity: [0, -9.82, 0] });   // created on first call
 *   const body = P.box(part, { mass: 2, size: [0.4, 0.4, 0.4], at: [x, y, z], vel: [0, 0, 0] });
 *   P.sphere(part, { mass, r, at });
 *   P.ground(y);  P.wall(x0, y0, z0, x1, y1, z1);   // static colliders (boxes in scene coordinates)
 *   P.hinge(part, { at: [x, y, z], axis: [0, 0, 1], mass, size, swing })  // a hanging load or lamp
 *
 * Bodies drive the position and rotation of the parts they are given (scene coordinates),
 * and the stage steps the world with the clock. Use it sparingly: a few dozen bodies.
 */
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class Physics {
  constructor(opt = {}) {
    this.world = new CANNON.World({ gravity: new CANNON.Vec3(...(opt.gravity || [0, -9.82, 0])) });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.defaultContactMaterial.friction = opt.friction != null ? opt.friction : 0.4;
    this.world.defaultContactMaterial.restitution = opt.restitution != null ? opt.restitution : 0.2;
    this.links = [];
    this.acc = 0;
    this.CANNON = CANNON;
  }
  _add(body, object) {
    this.world.addBody(body);
    if (object) this.links.push({ body, object });
    return body;
  }
  box(object, o = {}) {
    const s = o.size || [0.5, 0.5, 0.5];
    const b = new CANNON.Body({ mass: o.mass != null ? o.mass : 1, shape: new CANNON.Box(new CANNON.Vec3(s[0] / 2, s[1] / 2, s[2] / 2)), linearDamping: o.damping || 0.05, angularDamping: o.damping || 0.05 });
    b.position.set(...(o.at || [0, 0, 0]));
    if (o.vel) b.velocity.set(...o.vel);
    if (o.spin) b.angularVelocity.set(...o.spin);
    return this._add(b, object);
  }
  sphere(object, o = {}) {
    const b = new CANNON.Body({ mass: o.mass != null ? o.mass : 1, shape: new CANNON.Sphere(o.r || 0.25), linearDamping: o.damping || 0.05 });
    b.position.set(...(o.at || [0, 0, 0]));
    if (o.vel) b.velocity.set(...o.vel);
    return this._add(b, object);
  }
  ground(y = 0) {
    const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    b.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    b.position.set(0, y, 0);
    return this._add(b, null);
  }
  wall(x0, y0, z0, x1, y1, z1) {
    const b = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3((x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)) });
    b.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    return this._add(b, null);
  }
  // A load hanging from a fixed point, free to swing (a lamp, a cargo net, a bell).
  hinge(object, o = {}) {
    const at = o.at || [0, 0, 0], len = o.length || 1;
    const anchor = new CANNON.Body({ mass: 0 });
    anchor.position.set(...at);
    this.world.addBody(anchor);
    const s = o.size || [0.3, 0.3, 0.3];
    const b = this.box(object, { mass: o.mass || 2, size: s, at: [at[0], at[1] - len, at[2]], damping: o.damping != null ? o.damping : 0.02 });
    const c = new CANNON.PointToPointConstraint(anchor, new CANNON.Vec3(0, 0, 0), b, new CANNON.Vec3(0, len, 0));
    this.world.addConstraint(c);
    if (o.swing) b.velocity.set(...o.swing);
    return b;
  }
  step(dt) {
    this.acc += Math.min(dt, 0.1);
    const h = 1 / 60;
    let n = 0;
    while (this.acc >= h && n < 4) { this.world.step(h); this.acc -= h; n++; }
    for (const { body, object } of this.links) {
      object.position.set(body.position.x, body.position.y, body.position.z);
      object.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
    }
  }
}
export { CANNON };
void THREE;
