/* Animations: each anim(p, t, P) fills pose P for person p at time t (seconds).
 *
 * Angles are radians in the figure's sagittal plane. Limb angles are measured from
 * straight down, positive towards the direction the figure faces. P.rot turns the
 * whole body about the feet (lying down, swimming). Scenes add their own with
 * anims.register('caulk', (p, t, P) => { ... }).
 */
const { sin, cos, PI } = Math;
const TAU = PI * 2;

export function newPose() {
  return {
    rootX: 0, rootY: 0.52, lean: 0, head: 0,
    uaB: 0.1, faB: 0.15, uaF: -0.05, faF: 0.2,
    thB: 0, shB: 0, thF: 0, shF: 0,
    rot: 0, prop: null, propAng: 0, mouth: 0, twist: 0,
  };
}

// ------------------------------------------------------------ animations
// Each anim(p, t, P) fills pose P for time t (seconds) and person p. Returns P.
const A = {};
const walkLegs = (P, ph, amp = 0.42) => {
  const s = sin(ph);
  P.thF = s * amp; P.thB = -s * amp;
  P.shF = -Math.max(0, -cos(ph)) * 0.75 - 0.05;
  P.shB = -Math.max(0, cos(ph)) * 0.75 - 0.05;
  P.rootY = 0.52 - Math.abs(cos(ph)) * 0.012;
};
A.stand = (p, t, P) => {
  const b = sin(t * 1.3 + p.ph) * 0.012;
  P.lean = b; P.uaB = 0.06 + b; P.faB = 0.12; P.uaF = -0.04 - b; P.faF = 0.18;
  P.thF = 0.02; P.thB = -0.02; P.head = sin(t * 0.37 + p.ph * 3) * 0.05;
  return P;
};
A.idle = A.stand;
A.talk = (p, t, P) => {
  A.stand(p, t, P);
  const g = sin(t * 2.3 + p.ph) * 0.5 + 0.5;
  P.uaF = -0.25 - g * 0.5; P.faF = 1.2 + sin(t * 3.1 + p.ph) * 0.3;
  P.head = sin(t * 1.7 + p.ph) * 0.08; P.mouth = (sin(t * 11 + p.ph) > 0) ? 1 : 0;
  return P;
};
A.walk = (p, t, P) => {
  const ph = p.dist * 3.4 + p.ph;
  walkLegs(P, ph);
  P.uaF = -sin(ph) * 0.38; P.uaB = sin(ph) * 0.38; P.faF = 0.25; P.faB = 0.25;
  P.lean = 0.05; P.head = 0;
  return P;
};
A.run = (p, t, P) => {
  const ph = p.dist * 2.6 + p.ph;
  walkLegs(P, ph, 0.7);
  P.shF -= 0.3; P.shB -= 0.3;
  P.uaF = -sin(ph) * 0.7; P.uaB = sin(ph) * 0.7; P.faF = 1.3; P.faB = 1.3;
  P.lean = 0.2;
  return P;
};
A.carry = (p, t, P) => {
  const ph = p.dist * 3.4 + p.ph;
  walkLegs(P, ph, p.moving ? 0.38 : 0);
  if (!p.moving) A.stand(p, t, P);
  P.uaF = -0.55; P.faF = 1.0; P.uaB = -0.45; P.faB = 1.05; P.lean = 0.02;
  return P;
};
A.carryHigh = (p, t, P) => { // tray held aloft
  A.carry(p, t, P);
  P.uaF = -2.6; P.faF = -0.5; P.uaB = -0.2; P.faB = 0.4;
  return P;
};
A.carryShoulder = (p, t, P) => { // sack or plank on the shoulder
  A.carry(p, t, P);
  P.uaF = -2.2; P.faF = 1.7; P.uaB = 0.25; P.faB = 0.3; P.lean = 0.12;
  return P;
};
A.climb = (p, t, P) => {
  const ph = p.dist * 4 + p.ph;
  const s = sin(ph);
  P.lean = 0; P.head = -0.2;
  P.uaF = -2.6 + s * 0.35; P.faF = -0.2; P.uaB = -2.4 - s * 0.35; P.faB = -0.2;
  P.thF = 0.9 + s * 0.4; P.shF = -1.3 - s * 0.3; P.thB = 0.9 - s * 0.4; P.shB = -1.3 + s * 0.3;
  P.rootY = 0.42;
  return P;
};
A.sit = (p, t, P) => {
  P.rootY = (p.seat != null ? p.seat : 0.46) / (p.H || 1.7); P.lean = -0.04 + sin(t * 0.9 + p.ph) * 0.01; // seat in metres above the feet
  P.thF = 1.5; P.shF = -1.45; P.thB = 1.45; P.shB = -1.4;
  P.uaF = 0.25; P.faF = 1.1; P.uaB = 0.2; P.faB = 1.0;
  P.head = sin(t * 0.33 + p.ph * 2) * 0.06;
  return P;
};
A.sitEat = (p, t, P) => {
  A.sit(p, t, P);
  const c = (t * 0.45 + p.ph) % 1;
  const up = c < 0.25 ? sin((c / 0.25) * PI) : 0;
  P.uaF = 0.35 - up * 1.4; P.faF = 1.2 + up * 1.2; P.lean = 0.06; P.head = -0.05 + up * 0.1;
  P.mouth = up > 0.6 ? 1 : 0;
  return P;
};
A.sitTalk = (p, t, P) => {
  A.sit(p, t, P);
  const g = sin(t * 2.1 + p.ph) * 0.5 + 0.5;
  P.uaF = -0.1 - g * 0.6; P.faF = 1.3; P.head = sin(t * 1.3 + p.ph) * 0.12; P.mouth = (sin(t * 10 + p.ph) > 0.2) ? 1 : 0;
  return P;
};
A.sitDrink = (p, t, P) => { A.sitEat(p, t * 0.6, P); P.prop = P.prop || 'glass'; return P; };
A.sitRead = (p, t, P) => {
  A.sit(p, t, P);
  P.uaF = -0.5; P.faF = 1.6; P.uaB = -0.4; P.faB = 1.6; P.head = 0.35; P.lean = 0.08;
  return P;
};
A.sitWrite = (p, t, P) => {
  A.sit(p, t, P);
  P.uaF = -0.75 + sin(t * 6 + p.ph) * 0.05; P.faF = 1.75; P.uaB = -0.6; P.faB = 1.9; P.head = 0.45; P.lean = 0.25;
  return P;
};
A.sitWork = (p, t, P) => { // hands busy at a bench: sewing, sorting, splicing
  A.sit(p, t, P);
  const s = sin(t * 4.2 + p.ph);
  P.uaF = -0.7 + s * 0.12; P.faF = 1.6 + s * 0.2; P.uaB = -0.65; P.faB = 1.7; P.head = 0.4; P.lean = 0.18;
  return P;
};
A.sitRow = (p, t, P) => {
  A.sit(p, t, P);
  const s = sin(t * 2.2 + p.ph);
  P.lean = -0.25 * s; P.uaF = -1.2 - s * 0.3; P.faF = 0.4 + s * 0.6; P.uaB = -1.1 - s * 0.3; P.faB = 0.45 + s * 0.6;
  return P;
};
A.sleepSit = (p, t, P) => { A.sit(p, t, P); P.head = 0.5; P.lean = 0.12; P.uaF = 0.1; P.faF = 0.5; P.uaB = 0.1; P.faB = 0.5; return P; };
A.lie = (p, t, P) => {
  A.stand(p, t * 0.3, P);
  P.rot = -PI / 2; P.head = 0.1 + sin(t * 0.25 + p.ph) * 0.02;
  P.uaF = 0.1; P.faF = 0.6; P.uaB = 0.05; P.faB = 0.2;
  P.thF = 0.15; P.shF = -0.25;
  return P;
};
A.sleep = A.lie;
A.kneel = (p, t, P) => {
  P.rootY = 0.36; P.lean = 0.02; P.thF = 1.45; P.shF = -1.5; P.thB = 0.15; P.shB = -1.55;
  P.uaF = -0.5; P.faF = 1.6; P.uaB = -0.45; P.faB = 1.7; P.head = 0.25 + sin(t * 0.4 + p.ph) * 0.03;
  return P;
};
A.pray = A.kneel;
A.scrub = (p, t, P) => {
  A.kneel(p, t, P);
  const s = sin(t * 5 + p.ph);
  P.lean = 0.9; P.rootY = 0.38; P.uaF = 0.6 + s * 0.35; P.faF = 0.3; P.uaB = 0.2 - s * 0.2; P.faB = 0.3; P.head = -0.2;
  return P;
};
A.shovel = (p, t, P) => {
  // Scoop low, swing up and forward, throw, return. ~2.2 s per shovelful.
  const c = (t * 0.45 + p.ph) % 1;
  const sw = c < 0.45 ? 0 : c < 0.7 ? (c - 0.45) / 0.25 : 1 - (c - 0.7) / 0.3;
  P.lean = 0.55 - sw * 0.5; P.rootY = 0.47 + sw * 0.04;
  P.thF = 0.45 - sw * 0.2; P.shF = -0.55 + sw * 0.3; P.thB = -0.35; P.shB = -0.2;
  P.uaF = 0.2 - sw * 1.6; P.faF = 0.6; P.uaB = -0.3 - sw * 1.1; P.faB = 0.9;
  P.prop = P.prop || 'shovel'; P.propAng = 2.1 - sw * 1.6; P.head = -0.1;
  return P;
};
A.pick = (p, t, P) => {
  const c = (t * 0.6 + p.ph) % 1;
  const up = c < 0.55 ? c / 0.55 : 1 - (c - 0.55) / 0.12;
  const u = Math.max(0, Math.min(1, up));
  P.lean = 0.25 - u * 0.15; P.thF = 0.35; P.shF = -0.4; P.thB = -0.3; P.shB = -0.1;
  P.uaF = 0.4 - u * 3.0; P.faF = 0.3 - u * 0.2; P.uaB = 0.3 - u * 2.8; P.faB = 0.4;
  P.prop = P.prop || 'pick'; P.propAng = 2.3 - u * 2.6; P.head = 0.1;
  return P;
};
A.kneelPick = (p, t, P) => { // holing at a low coal face
  A.kneel(p, t, P);
  const c = (t * 0.7 + p.ph) % 1;
  const u = c < 0.6 ? c / 0.6 : 1 - (c - 0.6) / 0.4;
  P.lean = 0.3; P.uaF = -0.3 - u * 1.6; P.faF = 0.5; P.uaB = -0.25 - u * 1.5; P.faB = 0.6;
  P.prop = 'pick'; P.propAng = 1.7 - u * 1.6;
  return P;
};
A.hammer = (p, t, P) => {
  A.stand(p, t, P);
  const c = (t * 1.6 + p.ph) % 1;
  const u = c < 0.7 ? c / 0.7 : 1 - (c - 0.7) / 0.3;
  P.lean = 0.25; P.uaF = -0.6 - u * 1.4; P.faF = 1.0 + u * 0.4; P.uaB = -0.7; P.faB = 1.3; P.head = 0.25;
  P.prop = P.prop || 'hammer'; P.propAng = 1.2 + u * 1.2;
  return P;
};
A.chisel = (p, t, P) => { A.hammer(p, t, P); P.prop = 'mallet'; return P; };
A.saw = (p, t, P) => {
  A.stand(p, t, P);
  const s = sin(t * 4 + p.ph);
  P.lean = 0.4; P.uaF = -0.6 + s * 0.45; P.faF = 1.1 - s * 0.4; P.uaB = -0.4; P.faB = 1.3; P.head = 0.3;
  P.prop = 'saw'; P.propAng = PI / 2 + 0.3;
  return P;
};
A.stir = (p, t, P) => {
  A.stand(p, t, P);
  const a = t * 3 + p.ph;
  P.lean = 0.15; P.uaF = -0.6 + sin(a) * 0.2; P.faF = 1.2 + cos(a) * 0.25; P.uaB = -0.2; P.faB = 1.2; P.head = 0.25;
  P.prop = P.prop || 'spoon'; P.propAng = 0.3;
  return P;
};
A.sweep = (p, t, P) => {
  const s = sin(t * 3 + p.ph);
  A.stand(p, t, P);
  P.lean = 0.25; P.uaF = 0.3 + s * 0.3; P.faF = 0.4; P.uaB = -0.3 + s * 0.3; P.faB = 0.9;
  P.prop = 'broom'; P.propAng = 2.7 + s * 0.25;
  return P;
};
A.haul = (p, t, P) => { // hauling on a rope, hand over hand
  const s = sin(t * 2.4 + p.ph);
  P.lean = -0.35 + s * 0.1; P.rootY = 0.48;
  P.thF = 0.45; P.shF = -0.15; P.thB = -0.25; P.shB = -0.25;
  P.uaF = -1.4 - s * 0.35; P.faF = 0.2; P.uaB = -1.2 + s * 0.35; P.faB = 0.25;
  P.prop = 'rope'; P.propAng = -1.25;
  return P;
};
A.push = (p, t, P) => {
  const ph = p.dist * 3.4 + p.ph + t * (p.moving ? 0 : 3);
  walkLegs(P, ph, 0.5);
  P.lean = 0.55; P.uaF = -1.3; P.faF = 0.15; P.uaB = -1.25; P.faB = 0.2; P.head = -0.4;
  return P;
};
A.crank = (p, t, P) => {
  A.stand(p, t, P);
  const a = t * 3 + p.ph;
  P.lean = 0.2; P.uaF = -1.0 + sin(a) * 0.35; P.faF = 0.9 + cos(a) * 0.4; P.uaB = -0.9 + sin(a) * 0.35; P.faB = 0.95 + cos(a) * 0.4;
  return P;
};
A.wheel = (p, t, P) => { // a helmsman at the wheel
  A.stand(p, t, P);
  const s = sin(t * 0.7 + p.ph) * 0.25;
  P.uaF = -1.3 + s; P.faF = 0.5; P.uaB = -1.1 - s; P.faB = 0.6; P.head = -0.05;
  return P;
};
A.lookout = (p, t, P) => {
  A.stand(p, t, P);
  P.uaF = -1.6; P.faF = 1.5; P.uaB = -1.4; P.faB = 1.7; P.head = -0.1 + sin(t * 0.3 + p.ph) * 0.05;
  P.prop = 'telescope'; P.propAng = PI / 2 - 0.05;
  return P;
};
A.wave = (p, t, P) => {
  A.stand(p, t, P);
  P.uaF = -2.8; P.faF = 0.3 + sin(t * 8 + p.ph) * 0.5; P.head = -0.15;
  return P;
};
A.point = (p, t, P) => { A.stand(p, t, P); P.uaF = -1.5; P.faF = 0.05; return P; };
A.dance = (p, t, P) => {
  const ph = t * 4.2 + p.ph;
  walkLegs(P, ph, 0.35);
  P.rootY = 0.52 + Math.abs(sin(ph)) * 0.04;
  P.uaF = -1.4 + sin(ph) * 0.5; P.faF = 0.8; P.uaB = -1.2 - sin(ph) * 0.5; P.faB = 0.9; P.lean = sin(ph * 0.5) * 0.1;
  return P;
};
A.violin = (p, t, P) => {
  A.stand(p, t, P);
  const s = sin(t * 3 + p.ph);
  P.uaB = -1.6; P.faB = 1.9; P.uaF = -1.1 + s * 0.35; P.faF = 1.0 - s * 0.6; P.head = 0.2;
  P.prop = 'violin';
  return P;
};
A.drink = (p, t, P) => {
  A.stand(p, t, P);
  const c = (t * 0.3 + p.ph) % 1;
  const up = c < 0.2 ? sin((c / 0.2) * PI) : 0;
  P.uaF = -0.4 - up * 1.0; P.faF = 1.6 + up * 0.9; P.head = -up * 0.25;
  P.prop = P.prop || 'glass';
  return P;
};
A.read = (p, t, P) => { A.stand(p, t, P); P.uaF = -0.6; P.faF = 1.7; P.uaB = -0.5; P.faB = 1.7; P.head = 0.4; P.prop = P.prop || 'book'; return P; };
A.workBench = (p, t, P) => { // standing at a bench, hands busy
  A.stand(p, t, P);
  const s = sin(t * 3.7 + p.ph);
  P.lean = 0.3; P.uaF = -0.75 + s * 0.15; P.faF = 1.3 + s * 0.3; P.uaB = -0.65 - s * 0.1; P.faB = 1.4; P.head = 0.4;
  return P;
};
A.tread = (p, t, P) => { p.dist = (p.dist || 0) + 0; const q = Object.assign({}, p, { dist: t * 0.9 }); A.walk(q, t, P); P.lean = 0.18; P.uaF = -1.3; P.faF = 0.3; P.uaB = -1.2; P.faB = 0.35; return P; };
A.swim = (p, t, P) => {
  const a = t * 2.5 + p.ph;
  P.rot = PI / 2 - 0.1; P.rootY = 0.52; P.lean = 0;
  P.uaF = -PI + a % TAU; P.faF = 0.2; P.uaB = a % TAU; P.faB = 0.2;
  P.thF = sin(a * 2) * 0.3; P.thB = -sin(a * 2) * 0.3; P.shF = -0.1; P.shB = -0.1; P.head = -0.6;
  return P;
};
A.bellows = (p, t, P) => { A.crank(p, t * 0.6, P); P.uaF = -0.9 + sin(t * 2.5 + p.ph) * 0.5; P.uaB = P.uaF; return P; };
A.pour = (p, t, P) => { A.stand(p, t, P); P.lean = 0.2; P.uaF = -1.0; P.faF = 0.6 + sin(t + p.ph) * 0.1; P.prop = P.prop || 'jug'; P.propAng = 1.9; return P; };
A.salute = (p, t, P) => { A.stand(p, t, P); P.uaF = -1.9; P.faF = 2.4; return P; };
A.handsBehind = (p, t, P) => { A.stand(p, t, P); P.uaF = 0.35; P.faF = -1.2; P.uaB = 0.3; P.faB = -1.2; P.head = sin(t * 0.25 + p.ph) * 0.15; return P; };

// Register scene-specific animations: XS.anims.register('caulk', (p, t, P) => {...}).
export const anims = {
  table: A,
  register(name, fn) { A[name] = fn; },
  has(name) { return !!A[name]; },
};


