/* The living world: navigation graph, people with routines, actors, machines,
 * emitters, captions and the guided tour.
 *
 * A scene's setup(world) populates it. People walk the nav graph between the
 * stations of their routine, by the hour of a ship's (or castle's) clock, and the
 * stage draws them between the back and front layers of the static drawing.
 */
import { XS, h01, hash, rng } from './core.js';
import { costume } from './figures.js';
import { Particles } from './particles.js';
import { sun as sunAt } from './sky.js';
const { clamp, inHours, angleLerp } = XS.math;

// ------------------------------------------------------------ navigation graph
class Nav {
  constructor() { this.nodes = new Map(); this.cache = new Map(); this.n = 0; }
  node(id, x, y, z) {
    if (typeof id !== 'string') { z = y; y = x; x = id; id = 'n' + ++this.n; }
    this.nodes.set(id, { id, x, y, z: z || 0, links: [] });
    this.cache.clear();
    return id;
  }
  get(id) { return this.nodes.get(id); }
  // kind: 'walk' | 'stairs' | 'ladder' | 'rope' | 'lift' | 'swim' | 'door'
  link(a, b, kind = 'walk', both = true) {
    const A = this.nodes.get(a), B = this.nodes.get(b);
    if (!A || !B) throw new Error('nav link to unknown node ' + (A ? b : a));
    const d = Math.hypot(A.x - B.x, A.y - B.y, A.z - B.z);
    const mult = kind === 'ladder' || kind === 'rope' ? 3 : kind === 'stairs' ? 1.8 : kind === 'lift' ? 1.2 : 1;
    A.links.push({ to: b, kind, cost: d * mult + 0.01 });
    if (both) B.links.push({ to: a, kind, cost: d * mult + 0.01 });
    this.cache.clear();
  }
  chain(ids, kind = 'walk') { for (let i = 1; i < ids.length; i++) this.link(ids[i - 1], ids[i], kind); return ids; }
  // A run of nodes along a floor every `step` metres; returns ids.
  walkway(prefix, x0, x1, y, z, step = 3) {
    const ids = [];
    const n = Math.max(1, Math.round(Math.abs(x1 - x0) / step));
    for (let i = 0; i <= n; i++) ids.push(this.node(prefix + i, x0 + ((x1 - x0) * i) / n, y, z));
    this.chain(ids, 'walk');
    return ids;
  }
  nearest(x, y, z, filter) {
    let best = null, bd = Infinity;
    for (const n of this.nodes.values()) {
      if (filter && !filter(n)) continue;
      const d = (n.x - x) ** 2 + (n.y - y) ** 2 * 4 + (n.z - z) ** 2;
      if (d < bd) { bd = d; best = n.id; }
    }
    return best;
  }
  // A* over the graph. Returns [{id, kind}] including the start.
  path(a, b) {
    if (a === b) return [{ id: a, kind: 'walk' }];
    const key = a + '>' + b;
    if (this.cache.has(key)) return this.cache.get(key);
    const goal = this.nodes.get(b);
    const open = new Map([[a, 0]]);
    const g = new Map([[a, 0]]);
    const from = new Map();
    const h = (id) => { const n = this.nodes.get(id); return Math.hypot(n.x - goal.x, n.y - goal.y, n.z - goal.z); };
    let guard = 0;
    while (open.size && guard++ < 20000) {
      let cur = null, cf = Infinity;
      for (const [id, f] of open) if (f < cf) { cf = f; cur = id; }
      if (cur === b) break;
      open.delete(cur);
      const N = this.nodes.get(cur);
      for (const L of N.links) {
        const ng = g.get(cur) + L.cost;
        if (ng < (g.has(L.to) ? g.get(L.to) : Infinity)) {
          g.set(L.to, ng);
          from.set(L.to, { id: cur, kind: L.kind });
          open.set(L.to, ng + h(L.to));
        }
      }
    }
    if (!from.has(b)) { this.cache.set(key, null); return null; }
    const out = [];
    let cur = b, kind = 'walk';
    while (cur !== a) {
      const f = from.get(cur);
      out.push({ id: cur, kind: f.kind });
      cur = f.id; kind = f.kind;
    }
    out.push({ id: a, kind });
    out.reverse();
    this.cache.set(key, out);
    return out;
  }
}

// ------------------------------------------------------------ people
const SPEED = { walk: 1.25, stairs: 0.55, ladder: 0.42, rope: 0.35, lift: 1.6, swim: 0.6, door: 1.0 };
const MOVE_ANIM = { walk: 'walk', stairs: 'walk', ladder: 'climb', rope: 'climb', lift: 'stand', swim: 'swim', door: 'walk' };

// Facing: 1 = towards +x, -1 = towards -x, 'out' = towards the viewer, 'in' = away, or radians.
function faceToHeading(f) {
  if (typeof f === 'number' && (f === 1 || f === -1)) return f === 1 ? 0 : Math.PI;
  if (f === 'out') return -Math.PI / 2;
  if (f === 'in') return Math.PI / 2;
  if (f === 'left') return Math.PI;
  if (f === 'right') return 0;
  return typeof f === 'number' ? f : -Math.PI / 2;
}
XS.faceToHeading = faceToHeading;

let pid = 0;
class Person {
  constructor(world, def) {
    this.world = world;
    this.id = def.id || 'p' + ++pid;
    this.name = def.name || null;
    this.role = def.role || null;
    this.bio = def.bio || null;
    this.cos = costume(def.costume || def.cos || {}, hash(this.id, def.name || ''));
    this.H = def.H || (this.cos.child ? 1.2 : 1.62 + h01(pid, 3) * 0.18);
    this.ph = def.ph != null ? def.ph : h01(pid, 9) * 10;
    this.speed = def.speed || 0.85 + h01(pid, 4) * 0.3;
    this.heading = faceToHeading(def.face != null ? def.face : 'out');
    this.targetHeading = this.heading;
    this.anim = def.act || def.anim || 'stand';
    this.prop = def.prop || null;
    this.seat = def.seat || null;
    this.routine = def.routine || null;
    this.step = -1;
    this.stepT = 0;
    this.stepDur = 0;
    this.path = null;
    this.pi = 0;
    this.dist = 0;
    this.moving = false;
    this.label = def.label || null;
    this.layer = def.layer || 0;
    this.hidden = false;
    this.important = !!def.name;
    this.tags = def.tags || [];
    const at = def.at || (def.routine && def.routine[0] && def.routine[0].at) || [0, 0, 0];
    const pos = world.resolve(at);
    this.x = pos.x; this.y = pos.y; this.z = pos.z;
    if (def.face == null && pos.face != null) this.heading = this.targetHeading = faceToHeading(pos.face);
    this.node = typeof at === 'string' && world.nav.get(at) ? at : null;
    this.onUpdate = def.update || null;
  }

  currentLabel() {
    if (this.moving) {
      const st = this.routine && this.routine[this.step];
      return st && st.label ? 'On the way: ' + st.label.charAt(0).toLowerCase() + st.label.slice(1) : 'Walking';
    }
    const st = this.routine && this.routine[this.step];
    return (st && st.label) || this.label || XS.actLabel(this.anim);
  }

  _eligible(st, hour) { return !st.when || inHours(hour, st.when[0], st.when[1]); }

  _nextStep() {
    const R = this.routine;
    const hour = this.world.hour;
    for (let k = 1; k <= R.length; k++) {
      const i = (this.step + k) % R.length;
      if (this._eligible(R[i], hour)) return i;
    }
    return -1;
  }

  _startStep(i) {
    this.step = i;
    const st = this.routine[i];
    const d = st.dur == null ? 20 : Array.isArray(st.dur) ? st.dur[0] + h01(pid++, 5) * (st.dur[1] - st.dur[0]) : st.dur;
    this.stepDur = d;
    this.stepT = 0;
    const target = this.world.resolve(st.at);
    this.target = target;
    // Route: from our node (or the nearest) to the node nearest the target, then a final straight leg.
    const nav = this.world.nav;
    const start = this.node || nav.nearest(this.x, this.y, this.z);
    const goal = typeof st.at === 'string' && nav.get(st.at) ? st.at : nav.nearest(target.x, target.y, target.z);
    let route = start && goal ? nav.path(start, goal) : null;
    const pts = [];
    if (route) {
      for (let k = 0; k < route.length; k++) {
        const n = nav.get(route[k].id);
        pts.push({ x: n.x, y: n.y, z: n.z, kind: route[k].kind, id: n.id });
      }
      // Skip the start node if we are already past it.
      if (pts.length > 1 && Math.hypot(pts[0].x - this.x, pts[0].y - this.y, pts[0].z - this.z) < 0.3) pts.shift();
    }
    if (!route) {
      // No graph route: only allow a short direct walk on the same floor, else jump.
      if (Math.abs(target.y - this.y) < 0.4 && Math.hypot(target.x - this.x, target.z - this.z) < 30) pts.length = 0;
      else { this.x = target.x; this.y = target.y; this.z = target.z; }
    }
    pts.push({ x: target.x, y: target.y, z: target.z, kind: 'walk', id: typeof st.at === 'string' ? st.at : null });
    this.path = pts;
    this.pi = 0;
    this.moving = true;
    this.node = null;
  }

  update(dt, t) {
    this.heading = angleLerp(this.heading, this.targetHeading, 1 - Math.exp(-dt * 8));
    if (this.onUpdate) this.onUpdate(this, dt, t);
    if (!this.routine || !this.routine.length) return;
    if (this.step < 0 || (!this.moving && this.stepT >= this.stepDur)) {
      const n = this._nextStep();
      if (n < 0) { this.anim = 'stand'; return; }
      if (n === this.step && !this.moving && this.routine.length > 1) { this.stepT = 0; return; }
      this._startStep(n);
    }
    const st = this.routine[this.step];
    if (this.moving) {
      let budget = dt;
      while (budget > 0 && this.pi < this.path.length) {
        const tg = this.path[this.pi];
        const kind = tg.kind || 'walk';
        const sp = SPEED[kind] * this.speed;
        const dx = tg.x - this.x, dy = tg.y - this.y, dz = tg.z - this.z;
        const d = Math.hypot(dx, dy, dz);
        const step = sp * budget;
        this.anim = st.walkAnim && kind === 'walk' ? st.walkAnim : MOVE_ANIM[kind] || 'walk';
        if (kind === 'walk' || kind === 'stairs' || kind === 'door' || kind === 'swim') {
          if (Math.hypot(dx, dz) > 0.02) this.targetHeading = Math.atan2(dz, dx);
        } else if (kind === 'ladder' || kind === 'rope') {
          this.targetHeading = tg.face != null ? faceToHeading(tg.face) : Math.PI / 2; // face the ladder
        }
        if (d <= step) {
          this.x = tg.x; this.y = tg.y; this.z = tg.z;
          this.dist += d;
          budget -= d / sp;
          if (tg.id) this.node = tg.id;
          this.pi++;
        } else {
          const k = step / d;
          this.x += dx * k; this.y += dy * k; this.z += dz * k;
          this.dist += step;
          budget = 0;
        }
      }
      if (this.pi >= this.path.length) {
        this.moving = false;
        this.anim = st.act || 'stand';
        if (st.face != null) this.targetHeading = faceToHeading(st.face);
        this.prop = st.prop !== undefined ? st.prop : this.prop;
        this.seat = st.seat || null;
        if (st.onArrive) st.onArrive(this, this.world);
      }
    } else {
      this.stepT += dt;
      this.anim = st.act || 'stand';
    }
  }
}

// Human-readable labels for animations (follow panel).
const ACT_LABELS = {
  stand: 'Standing about', idle: 'Standing about', talk: 'Talking', walk: 'Walking', run: 'Running', carry: 'Carrying a load',
  carryHigh: 'Carrying a tray', carryShoulder: 'Shouldering a load', climb: 'Climbing', sit: 'Sitting', sitEat: 'Eating',
  sitTalk: 'Chatting at table', sitDrink: 'Having a drink', sitRead: 'Reading', sitWrite: 'Writing', sitWork: 'Busy with handwork',
  sitRow: 'Rowing', sleepSit: 'Dozing', lie: 'Asleep', sleep: 'Asleep', kneel: 'Kneeling', pray: 'At prayer', scrub: 'Scrubbing',
  shovel: 'Shovelling', pick: 'Swinging a pick', kneelPick: 'Hewing at the face', hammer: 'Hammering', chisel: 'Carving stone',
  saw: 'Sawing', stir: 'Stirring a pot', sweep: 'Sweeping', haul: 'Hauling on a rope', push: 'Pushing', crank: 'Turning a crank',
  wheel: 'At the wheel', lookout: 'Keeping a lookout', wave: 'Waving', point: 'Pointing something out', dance: 'Dancing',
  violin: 'Playing the fiddle', drink: 'Drinking', read: 'Reading', workBench: 'Working at the bench', tread: 'Walking the treadwheel',
  swim: 'Swimming', bellows: 'Working the bellows', pour: 'Pouring', salute: 'Saluting', handsBehind: 'Keeping watch',
};
XS.actLabel = (a) => ACT_LABELS[a] || a;

// ------------------------------------------------------------ world
class World {
  constructor(scene) {
    this.scene = scene;
    this.nav = new Nav();
    this.people = [];
    this.actors = [];
    this.machines = [];
    this.lights = [];
    this.emitters = [];
    this.labels = [];
    this.tour = [];
    this.stations = new Map();
    this.time = 0;
    this.hour = scene.startHour != null ? scene.startHour : 10;
    this.daySeconds = scene.daySeconds || 720; // real seconds per 24 h when the clock runs
    this.clockRate = 1; // multiplier set by the UI
    this.particles = new Particles();
    this.wind = scene.wind != null ? scene.wind : 1.2;
    this.R = rng(hash(scene.id, 'world'));
    this.sections = scene.sections ? scene.sections.slice().sort((a, b) => a - b) : [];
    this.data = {}; // free space for scene state
  }

  // Resolve a location: node id, station name, [x, y, z] or {x, y, z}.
  resolve(at) {
    if (typeof at === 'string') {
      const n = this.nav.get(at);
      if (n) return { x: n.x, y: n.y, z: n.z };
      const s = this.stations.get(at);
      if (s) return s;
      console.warn('unknown location', at);
      return { x: 0, y: 0, z: 0 };
    }
    if (Array.isArray(at)) return { x: at[0], y: at[1], z: at[2] || 0 };
    return at;
  }

  station(name, x, y, z, face) { const s = { x, y, z: z || 0, face }; this.stations.set(name, s); return name; }

  addPerson(def) { const p = new Person(this, def); this.people.push(p); return p; }
  person(def) { return this.addPerson(def); }

  // Seat a row of extras doing the same thing: positions [[x,y,z],...].
  crowd(positions, def = {}) {
    const out = [];
    positions.forEach((pos, i) => {
      const cos = typeof def.costume === 'function' ? def.costume(i, this.R) : def.costume;
      const act = Array.isArray(def.act) ? def.act[i % def.act.length] : def.act;
      out.push(this.addPerson(Object.assign({}, def, { at: pos, costume: cos, act, face: def.face != null ? (typeof def.face === 'function' ? def.face(i) : def.face) : (i % 2 ? -1 : 1), name: null })));
    });
    return out;
  }

  // Something that moves on its own: { object (THREE.Object3D in scene coordinates), update(dt, t, world) }.
  // The stage adds actor.object to the scene root.
  addActor(a) { this.actors.push(a); if (this.onActor) this.onActor(a); return a; }
  // Per-frame animation of parts built with kit.part(): fn(dt, t, world).
  addMachine(fn) { const m = { fn }; this.machines.push(m); return m; }
  // { kind, x, y, z, rate, ...particle opts, when }
  emitter(e) { e.acc = 0; this.emitters.push(e); return e; }
  label(def) { this.labels.push(def); return def; }
  // { x, y, S (zoom, CSS px per metre) or w (metres wide to show), title, text, hold }
  stop(def) { this.tour.push(def); return def; }

  secOf(x) {
    const s = this.sections;
    let i = 0;
    while (i < s.length && x >= s[i]) i++;
    return i;
  }

  update(dt, t) {
    this.time = t;
    if (this.clockRate > 0) this.hour = (this.hour + (dt * 24 * this.clockRate) / this.daySeconds) % 24;
    for (const p of this.people) p.update(dt, t);
    for (const a of this.actors) if (a.update) a.update(dt, t, this);
    for (const m of this.machines) m.fn(dt, t, this);
    for (const e of this.emitters) {
      if (e.when && !this.when(e.when)) continue;
      e.acc += dt * (typeof e.rate === 'function' ? e.rate(this) : e.rate || 4);
      while (e.acc >= 1) { e.acc -= 1; this.particles.emit(e, this); }
    }
    this.particles.update(dt, this.wind);
  }

  sun() { return sunAt(this.hour); }
  when(w) {
    if (!w || w === 'always') return true;
    if (typeof w === 'function') return w(this);
    const s = this.sun().day;
    if (w === 'night') return s < 0.5;
    if (w === 'day') return s >= 0.5;
    if (Array.isArray(w)) return inHours(this.hour, w[0], w[1]);
    return true;
  }
}

XS.Nav = Nav;
XS.Person = Person;
XS.World = World;
export { Nav, Person, World };
void clamp;
