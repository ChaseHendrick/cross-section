/* The Rock Lighthouse: a keepers' tower on an offshore reef, about 1890.
 *
 * A composite of the granite rock towers of the British and Irish coasts. The tower
 * is cut through its axis; we look into the far half of each round room. World units
 * are metres; x = 0 is the tower's axis, z is depth behind the cut.
 */
import { XS, THREE, mat, props, shade, makeSea, glowMaterial } from '../engine/index.js';

const SEA = 2.0;      // mean sea level
const BASE = 4.0;     // top of the reef where the masonry starts
const MASON = 34.5;   // top of the masonry: the gallery floor
const SLAB = 0.5;
const LANT = { y0: MASON, y1: 38.4, r: 2.35 };
const ROOMS = [
  { id: 'entrance', name: 'Entrance and coal store', y0: 11.6, y1: 14.9, r: 2.15, floor: '#8a8478', fp: 'stone' },
  { id: 'oil', name: 'Oil room', y0: 15.4, y1: 18.6, r: 2.35, floor: '#8a8478', fp: 'stone' },
  { id: 'store', name: 'Store and workshop', y0: 19.1, y1: 22.3, r: 2.5, floor: '#a07a50', fp: 'planks' },
  { id: 'kitchen', name: 'Kitchen and living room', y0: 22.8, y1: 26.3, r: 2.65, floor: '#9a6a40', fp: 'planks' },
  { id: 'bedroom', name: 'Bedroom', y0: 26.8, y1: 30.1, r: 2.75, floor: '#9a6a40', fp: 'planks' },
  { id: 'service', name: 'Service room', y0: 30.6, y1: 34.0, r: 2.85, floor: '#9a6a40', fp: 'planks' },
];
// Outer radius: a curved flare at the base, as on the classic rock towers.
const R = (y) => { const u = Math.min(1, Math.max(0, (y - BASE) / (MASON - BASE))); return 3.9 + 2.9 * Math.pow(1 - u, 2.2); };
// Reef surface height.
const reefTop = (x, z = 0) => {
  const d = Math.hypot(x, (z - 2) * 1.3);
  if (d < 7.4) return BASE;
  return BASE - Math.pow(Math.max(0, d - 6.5) / 30, 1.25) * 12 + XS.noise1(x * 0.35 + z * 0.2, 5) * 0.8;
};

const GRANITE = mat({ c: '#cfc8b6', c2: '#b8b09c', pat: 'ashlar', s: 0.55, cut: '#b0a894', cutPat: true });
const PLASTER = mat({ c: '#ece4cf', c2: '#ddd2b8', pat: 'speckle', cut: '#8e8676' });
const DADO = mat({ c: '#5a6a52', c2: '#4a5a44', cut: '#8e8676' });
const ROCK = mat({ c: '#8e877c', c2: '#6e675e', pat: 'rock', cut: '#7a7268', cutPat: true });
const WEED = mat({ c: '#4a6a34', c2: '#6a5a26', pat: 'rock' });

const ang = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];

function build(k) {
  const r = k.rng('lighthouse');

  // ---- seabed and reef
  k.box(-600, -60, 0, 600, -11, 900, mat({ c: '#6a6450', c2: '#7a7460', pat: 'rock', cut: '#4a4436' }));
  const prof = [];
  for (let x = -42; x <= 42; x += 1.5) prof.push([x, reefTop(x)]);
  prof.push([42, -11], [-42, -11]);
  k.extrude(prof, 0, 16, ROCK);
  for (let i = 0; i < 90; i++) {
    const x = -36 + r() * 72, z = 0.5 + Math.pow(r(), 0.7) * 15;
    if (Math.hypot(x, z - 2) < 8) continue;
    const y = reefTop(x, z);
    if (y < SEA - 2.5) continue;
    k.boulder(x, y - 0.3, z, 0.9 + r() * 2.2, 0.5 + r() * 0.9, 0.9 + r() * 1.8, r() < 0.25 && y < SEA + 1 ? WEED : ROCK, i * 7 + 1);
  }
  // The landing: a cut granite step with a bronze ladder up to the door.
  k.box(6.6, BASE - 0.6, 0.6, 11, BASE - 0.2, 4, GRANITE);

  // ---- the tower
  // Solid base (flared lathe).
  const baseTop = ROOMS[0].y0 - SLAB;
  const bprof = [[0, BASE]];
  for (let i = 0; i <= 10; i++) { const y = BASE + ((baseTop - BASE) * i) / 10; bprof.push([R(y), y]); }
  bprof.push([0, baseTop]);
  k.lathe(bprof, 0, 0, GRANITE, { seg: 40, capTop: false, capBot: false });

  ROOMS.forEach((R0, i) => room(k, R0, i));

  // Gallery floor and railing.
  const gR = R(MASON) + 0.6;
  k.lathe([[0, MASON - 0.0], [R(MASON), MASON], [gR, MASON + 0.05], [gR, MASON + 0.35], [0, MASON + 0.35]], 0, 0, GRANITE, { seg: 40, capTop: false, capBot: false });
  const railY = MASON + 0.35;
  const ring = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; ring.push(ang(a, gR - 0.1, railY + 1.05)); }
  k.tube(ring, 0.03, mat('#2a2a2a'));
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; const p = ang(a, gR - 0.1, railY); k.cyl(p[0], p[1], p[2], 0.02, 1.05, mat('#2a2a2a'), { seg: 5 }); }

  lantern(k);

  // ---- the sea
  const inside = (x, z) => reefTop(x, z) > SEA + 0.2 || Math.hypot(x, z) < R(BASE) + 0.2;
  k.object(makeSea({ level: SEA, x0: -60, x1: 60, detailX0: -60, detailX1: 60, step: 1.2, mask: inside, maskBox: [-45, 0, 45, 22], deep: '#25546e', shallow: '#3f8494' }));
  // Water cut face where the section passes through the sea.
  k.sheet(-600, 600, -11, SEA, 0.01, { c: '#2a6a7a', alpha: 0.33 });

  // ---- captions
  k.label({ x: -2, y: 8, z: 0, title: 'Solid base', text: 'The lowest storeys are solid granite, the blocks dovetailed together so the sea cannot prise them apart.', min: 3, body: 'The first storeys of a rock tower are solid masonry. Each granite block was cut to interlock with its neighbours above, below and beside it, so the whole base acts as one mass against the waves. The technique goes back to John Smeaton’s Eddystone tower of 1759.', source: 'https://www.britannica.com/biography/John-Smeaton' });
  k.label({ x: 1.6, y: 13.2, z: 1.5, title: 'Entrance', text: 'Keepers climbed in by an outside ladder from the landing.', min: 6 });
  k.label({ x: -1.5, y: 16.5, z: 1.5, title: 'Oil room', text: 'Paraffin for the lamp, carried up in cans.', min: 6 });
  k.label({ x: 0.8, y: 24.4, z: 1.6, title: 'Kitchen', text: 'The warmest room in the tower: range, table and the day’s talk.', min: 6 });
  k.label({ x: -1.4, y: 28.0, z: 1.5, title: 'Bedroom', text: 'Bunks curved to fit the round wall.', min: 6 });
  k.label({ x: 1.2, y: 32.5, z: 2.2, title: 'Service room', text: 'The keeper on watch sat here, writing up the log and listening to the clockwork.', min: 6 });
  k.label({ x: 0, y: 36.2, z: 0.4, title: 'The lens', text: 'Rings of glass prisms gather the lamp’s light into beams. Turning, the beams sweep the sea as flashes.', min: 3, priority: 2, body: 'A Fresnel lens is built from concentric rings of prisms. Each ring bends light from the lamp into the same direction, so a heavy solid lens can be replaced by a much thinner assembly of glass. Rotating the lens turns its beams into a pattern of flashes that tells sailors which light they are seeing.', source: 'https://www.britannica.com/technology/Fresnel-lens' });
  k.label({ x: -2.4, y: 39.6, z: 0, title: 'Lantern and cowl', text: 'A cage of glass and bronze, vented at the top to carry away the lamp’s heat.', min: 4 });
}

// A round room: floor slab, ring wall (granite outside, whitewash inside), stair, furniture.
function room(k, R0, i) {
  const { y0, y1, r } = R0;
  // Floor slab under the room, spanning to the outer face.
  k.lathe([[0, y0 - SLAB], [R(y0 - SLAB), y0 - SLAB], [R(y0), y0], [0, y0]], 0, 0, mat({ c: R0.floor, pat: R0.fp, c2: shade(R0.floor, -0.2), cut: R0.fp === 'planks' ? '#5a3a22' : '#7a7466' }), { seg: 40, capTop: false, capBot: false });
  // Ring wall. Profile: outer face up, top, inner face down, bottom.
  const outer = [];
  for (let j = 0; j <= 4; j++) { const y = y0 + ((y1 - y0) * j) / 4; outer.push([R(y), y]); }
  const pr = outer.concat([[r, y1], [r, y0 + 1.0], [r, y0], [R(y0), y0]]);
  const mats = pr.map((p, j) => (j < outer.length - 1 ? GRANITE : j === outer.length - 1 ? GRANITE : j === outer.length ? PLASTER : j === outer.length + 1 ? DADO : GRANITE));
  k.lathe(pr, 0, 0, GRANITE, { seg: 40, capTop: false, capBot: false, matFn: (s) => mats[s] });
  // Windows: deep embrasures to left and right, glazed, glowing at night.
  if (i >= 2) for (const a of [0.22, Math.PI - 0.22]) {
    const p = ang(a, r - 0.03, y0 + 1.25);
    k.boxR(p[0], p[1] + 0.5, p[2], 0.08, 1.0, 0.62, mat({ c: '#9ab8cc', c2: '#ffd890', glow: 'night', pat: 'panes', s: 0.3 }), { y: -a });
  }
  // Spiral stair along the back wall, rising left to right into a hatch above.
  const n = 13, rm = r - 0.38;
  for (let s = 0; s < n; s++) {
    const a = Math.PI - 0.15 - ((s + 0.5) / n) * (Math.PI - 0.75);
    const yy = y0 + ((s + 1) / n) * (y1 - y0 + SLAB);
    const p = ang(a, rm, yy - 0.12);
    k.boxR(p[0], p[1], p[2], 0.72, 0.24, 0.42, mat({ c: '#b8b0a0', cut: '#8a8272' }), { y: -a });
  }
  // Light at night.
  const lamp = props.lamp(k, 0.2, y1, 1.4, { drop: 0.6, r: 4.2, i: 0.95, kind: R0.id === 'kitchen' ? 'chandelier' : null, light: '#ffcf8a', flicker: true });
  void lamp;
  furnish(k, R0, i);
}

function furnish(k, R0) {
  const { y0, y1, r } = R0;
  const back = (x) => Math.sqrt(Math.max(0.01, r * r - x * x));
  if (R0.id === 'entrance') {
    for (let j = 0; j < 4; j++) props.sack(k, -1.3 + j * 0.42, y0, 0.9 + (j % 2) * 0.3, { color: '#5a5048' });
    props.crate(k, 1.0, y0, 1.1, { w: 0.7, h: 0.5 });
    props.barrel(k, 1.1, y0, 0.3, { r: 0.28, h: 0.7, color: '#6a5a4a' });
    // Doorway through the right wall, out to the landing ladder.
    const a = 0.05;
    const p = ang(a, r - 0.05, y0), q = ang(a, R(y0 + 1) + 0.05, y0);
    k.beam([p[0], y0 + 1.0, p[2]], [q[0], y0 + 1.0, q[2]], 2.0, mat({ c: '#2e3036', cut: '#2e3036' }));
    props.ladder(k, R(y0) + 0.35, BASE - 0.2, y0, 0.6, { w: 0.5, color: '#9a7a3a' });
  } else if (R0.id === 'oil') {
    for (let j = 0; j < 5; j++) props.barrel(k, -1.5 + j * 0.62, y0, 1.25 + (j % 2) * 0.1, { r: 0.26, h: 0.82, color: j % 2 ? '#8a3a2a' : '#7a6a3a' });
    props.shelves(k, 0.2, y0, back(0.2) - 0.45, { w: 1.2, h: 1.4, n: 3, items: 'jars', d: 0.35 });
  } else if (R0.id === 'store') {
    props.table(k, 0.4, y0, 0.9, { w: 1.6, d: 0.6, h: 0.85, items: false, top: '#9a7448' });
    props.anvil(k, -1.4, y0, 0.5);
    props.shelves(k, -0.6, y0, back(-0.6) - 0.45, { w: 1.4, h: 1.7, n: 4, items: 'mixed' });
    props.coil(k, 1.6, y0, 0.3, { r: 0.3 });
  } else if (R0.id === 'kitchen') {
    props.stove(k, -0.9, y0, back(-0.9) - 0.75, { w: 1.3, h: 0.85, d: 0.6, flueH: y1 - y0 - 0.9, pots: 2 });
    props.table(k, 0.6, y0, 0.5, { w: 1.3, d: 0.8, h: 0.74, cloth: '#e8dcc8', items: 'setting' });
    props.chair(k, 1.55, y0, 0.7, { face: -1 });
    props.chair(k, -0.25, y0, 0.7, { face: 1 });
    props.shelves(k, 1.25, y0 + 1.1, back(1.25) - 0.4, { w: 0.9, h: 0.9, n: 2, items: 'plates', d: 0.3 });
    props.clock(k, 0.3, y1 - 0.8, back(0.3) - 0.02);
  } else if (R0.id === 'bedroom') {
    // Curved bunks against the wall (two tiers), built as partial lathes.
    for (let t = 0; t < 2; t++) {
      const by = y0 + 0.45 + t * 1.1;
      k.lathe([[r - 0.85, by], [r - 0.02, by], [r - 0.02, by + 0.22], [r - 0.85, by + 0.22]], 0, 0, mat({ c: '#8a5a3a', cut: '#5a3a22' }), { seg: 12, a0: 0.25, a1: 1.85, capTop: false, capBot: false });
      k.lathe([[r - 0.82, by + 0.22], [r - 0.05, by + 0.22], [r - 0.05, by + 0.34], [r - 0.82, by + 0.34]], 0, 0, mat({ c: t ? '#6a7a9a' : '#9a5a4a', pat: 'quilt', c2: '#e8dcc8' }), { seg: 12, a0: 0.3, a1: 1.8, capTop: false, capBot: false });
    }
    props.chest(k, -1.6, y0, 0.5, { w: 0.7 });
    props.chair(k, -1.0, y0, 1.3, { face: 1 });
  } else if (R0.id === 'service') {
    props.desk(k, -1.0, y0, 1.3, { w: 1.2 });
    props.chair(k, -0.6, y0, 0.65, { face: 1 });
    props.shelves(k, 1.3, y0, back(1.3) - 0.45, { w: 0.9, h: 1.6, n: 4, items: 'books' });
    props.clock(k, -0.2, y1 - 0.7, back(-0.2) - 0.02, { r: 0.22 });
    k.cyl(0.15, y0 - 0.3, 2.45, 0.09, y1 - y0 + 0.3, mat('#8a8a90'), { seg: 10 }); // clockwork weight tube
    k.box(-0.5, y1 - 1.0, 1.7, 0.8, y1, 2.5, mat({ c: '#8a7a5a', pat: 'panels', s: 0.6 })); // clockwork case
  }
}

function lantern(k) {
  const { y0, y1, r } = LANT;
  // Parapet.
  k.lathe([[r - 0.1, y0 + 0.35], [r, y0 + 0.35], [r, y0 + 0.95], [r - 0.1, y0 + 0.95]], 0, 0, mat({ c: '#3e4e4e', pat: 'plates', s: 0.4 }), { seg: 32, capTop: false, capBot: false });
  // Glazing: sixteen facets (drawn translucent in the overlay pass).
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const A = ang(a0, r, y0 + 0.95), B = ang(a1, r, y0 + 0.95), C = ang(a1, r, y1), D = ang(a0, r, y1);
    k.glass([A, B, C, D], { c: '#cfe4ec', alpha: 0.18 });
  }
  // Diagonal astragals.
  const ast = mat('#2e3838');
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const pts = [];
    for (let j = 0; j <= 6; j++) { const t = j / 6; pts.push(ang(a + t * 0.55, r + 0.01, y0 + 0.95 + (y1 - y0 - 0.95) * t)); }
    k.tube(pts, 0.025, ast, { seg: 4 });
  }
  k.lathe([[r - 0.05, y1 - 0.05], [r + 0.08, y1 - 0.05], [r + 0.08, y1 + 0.15], [r - 0.05, y1 + 0.15]], 0, 0, ast, { seg: 32, capTop: false, capBot: false });
  // Dome, cowl and vane.
  const dome = [];
  for (let i = 0; i <= 10; i++) { const t = i / 10; dome.push([Math.max(0.3, (r + 0.08) * Math.cos(t * Math.PI / 2)), y1 + 0.15 + Math.sin(t * Math.PI / 2) * 1.8]); }
  k.lathe([[0, y1 + 0.15]].concat(dome).concat([[0, dome[dome.length - 1][1]]]), 0, 0, mat({ c: '#3a4a4a', pat: 'plates', s: 0.5, cut: '#22302f' }), { seg: 32, capTop: false, capBot: false });
  k.cyl(0, y1 + 1.9, 0, 0.3, 0.3, mat('#3a4a4a'), { seg: 12 });
  k.sphere(0, y1 + 2.55, 0, 0.42, mat({ c: '#4a5a5a', whole: true }), { seg: 14, rings: 9 });
  k.cyl(0, y1 + 2.95, 0, 0.03, 1.2, mat({ c: '#2a2a2a', whole: true }), { seg: 5 });
  // Lamp pedestal and lamp light.
  k.cyl(0, y0 + 0.35, 0.0, 0.34, 0.6, mat({ c: '#6a6a70', whole: true }), { seg: 14 });
  k.lamp(0, y0 + 2.0, 0.2, { r: 5.5, i: 0.7, color: '#fff0c0', bulb: false, halo: 1.6 });
}

// ------------------------------------------------------------------ the living world
function setup(W, stage, k) {
  const nav = W.nav;
  W.data.lens = 0;
  W.data.weight = 1;

  // The rotating lens: a beehive of glass rings with eight bull's-eyes, drawn whole.
  const lens = k.part(0, LANT.y0 + 0.95, 0.0, (q) => {
    const G = mat({ c: '#c4dde2', c2: '#f4e2a0', glow: 'night', pat: 'rings', s: 0.11, whole: true });
    q.lathe([[0.95, 0], [1.02, 0.4], [1.04, 1.0], [1.02, 1.6], [0.95, 2.0], [0.6, 2.25], [0.0, 2.3]], 0, 0, G, { seg: 16, capBot: false });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = [Math.cos(a) * 1.04, 1.0, Math.sin(a) * 1.04];
      q.cyl(p[0], p[1], p[2], 0.3, 0.05, mat({ c: '#d6eaea', c2: '#fff0b8', glow: 'night', pat: 'rings', s: 0.06, whole: true }), { axis: 'x', seg: 14 });
    }
    q.box(-0.06, -0.6, -0.06, 0.06, 0, 0.06, mat({ c: '#4a4a50', whole: true }));
  });
  // Two opposite beams that sweep with the lens (overlay, additive).
  const beamGeo = new THREE.CylinderGeometry(9, 0.6, 160, 24, 1, true);
  beamGeo.rotateZ(-Math.PI / 2); beamGeo.translate(80, 0, 0);
  const beams = new THREE.Group();
  beams.position.set(0, LANT.y0 + 1.95, 0);
  for (const s of [0, Math.PI]) {
    const m = new THREE.Mesh(beamGeo, glowMaterial(0xfff0c0));
    m.rotation.y = s;
    m.frustumCulled = false;
    beams.add(m);
  }
  k.object(beams, { overlay: true });
  W.data.beams = beams;
  W.data.lensObj = lens;

  // Nodes per room: stair foot, centre, sides, stair top.
  const ids = [];
  ROOMS.forEach((R0) => {
    const { y0, r } = R0;
    const foot = nav.node(R0.id + ':foot', ...ang(Math.PI - 0.2, r - 0.45, y0).slice(0, 1), y0, ang(Math.PI - 0.2, r - 0.45, y0)[2]);
    const mid = nav.node(R0.id + ':mid', 0, y0, 1.2);
    const left = nav.node(R0.id + ':left', -1.2, y0, 0.9);
    const right = nav.node(R0.id + ':right', 1.2, y0, 0.9);
    nav.link(foot, left); nav.link(left, mid); nav.link(mid, right);
    const steps = [];
    for (let s = 1; s <= 6; s++) {
      const a = Math.PI - 0.15 - (s / 6) * (Math.PI - 0.75);
      const p = ang(a, r - 0.38, y0 + (s / 6) * (R0.y1 - y0 + SLAB));
      steps.push(nav.node(R0.id + ':st' + s, p[0], p[1], p[2]));
    }
    nav.chain([foot].concat(steps), 'stairs');
    ids.push({ right, top: steps[steps.length - 1] });
  });
  for (let i = 0; i < ROOMS.length - 1; i++) nav.link(ids[i].top, ids[i + 1].right, 'walk');
  const lant = nav.node('lantern', 1.1, LANT.y0 + 0.35, 1.0);
  const lantL = nav.node('lantern:l', -1.2, LANT.y0 + 0.35, 1.0);
  nav.link(ids[ROOMS.length - 1].top, lant, 'ladder');
  nav.link(lant, lantL);
  const gallery = nav.node('gallery', -R(MASON) - 0.2, MASON + 0.35, 1.2);
  nav.link(lantL, gallery);
  const door = nav.node('door', ROOMS[0].r + 0.2, ROOMS[0].y0, 0.4);
  nav.link(ids[0].right, door);
  const landing = nav.node('landing', 8.3, BASE - 0.2, 1.6);
  nav.link(door, landing, 'ladder');
  const fishing = nav.node('fishing', 10.4, BASE - 0.2, 1.4);
  nav.link(landing, fishing);

  const bed = ROOMS[4];
  const bunk = (a, tier) => ang(a, bed.r - 0.45, bed.y0 + 0.45 + tier * 1.1 + 0.34);
  const keeper = (name, role, bio, cos, routine) => W.addPerson({ name, role, bio, costume: Object.assign({ top: '#1f2a44', bottom: '#1f2a44', coat: 'jacket', coatColor: '#1f2a44', hat: 'peaked', hatColor: '#1a1a22', shoes: '#1a1410' }, cos), routine });
  keeper('Thomas Hearn', 'principal keeper', 'Twenty-two years in the service. Keeps the log in a hand you could print from.', { beard: '#8a8a8a', hair: '#9a9a9a' }, [
    { at: 'service:left', act: 'sitWrite', face: 1, seat: 0.46, dur: [30, 50], label: 'Writing up the log', when: [6, 12] },
    { at: 'lantern', act: 'workBench', face: 'in', dur: [25, 40], label: 'Polishing the lens prisms', when: [8, 16] },
    { at: 'kitchen:mid', act: 'sitEat', face: 'out', dur: [30, 45], label: 'Dinner at the kitchen table', when: [12, 14] },
    { at: 'store:mid', act: 'hammer', face: 'in', dur: [25, 40], label: 'Mending a hinge in the workshop', when: [14, 17] },
    { at: 'lantern', act: 'workBench', face: 'in', dur: [20, 30], label: 'Lighting the lamp at sunset', when: [17, 19.5] },
    { at: 'service:left', act: 'sitWrite', face: 1, dur: [40, 60], label: 'First watch, entering the weather', when: [19.5, 24] },
    { at: bunk(1.0, 0), act: 'lie', face: 2.6, dur: 80, label: 'Asleep in the lower bunk', when: [0, 6] },
  ]);
  keeper('Owen Pritchard', 'assistant keeper', 'A Welshman who sings to the clockwork on the middle watch.', { hair: '#2a1d14' }, [
    { at: bunk(1.1, 1), act: 'lie', face: 2.7, dur: 90, label: 'Sleeping off the night watch', when: [7, 13] },
    { at: 'kitchen:left', act: 'stir', face: 'in', dur: [30, 40], label: 'Cooking the stew', when: [13, 16] },
    { at: 'fishing', act: 'stand', prop: 'cane', face: 1, dur: [40, 60], label: 'Fishing off the landing', when: [16, 18.5] },
    { at: 'kitchen:mid', act: 'sitEat', face: 'out', dur: [30, 40], label: 'Supper', when: [18.5, 20] },
    { at: 'service:right', act: 'crank', face: 'in', dur: [10, 14], label: 'Winding the clockwork', when: [0, 7], onArrive: (p, w) => { w.data.weight = 1; } },
    { at: 'gallery', act: 'lookout', face: 'out', dur: [30, 40], label: 'Middle watch: looking out for ships', when: [0, 7] },
    { at: 'service:right', act: 'sitRead', face: -1, dur: [40, 60], label: 'Reading by the lamp', when: [20, 24] },
  ]);
  keeper('Jack Morrow', 'assistant keeper', 'The youngest of the three, sent out on his first rock posting.', { hair: '#8d5a2b' }, [
    { at: 'store:left', act: 'workBench', face: 'in', dur: [30, 40], label: 'Cleaning the lamp burners', when: [7, 11] },
    { at: 'oil:mid', act: 'carry', prop: 'bucket', face: 'out', dur: [8, 12], label: 'Fetching a can of paraffin', when: [9, 18] },
    { at: 'lantern:l', act: 'workBench', face: 'in', dur: [20, 30], label: 'Carrying oil to the lamp', when: [9, 18] },
    { at: 'kitchen:right', act: 'sitTalk', face: -1, dur: [30, 50], label: 'A game of cards and an argument about it', when: [18, 22] },
    { at: bunk(1.4, 0), act: 'lie', face: 2.9, dur: 80, label: 'Asleep', when: [22, 7] },
  ]);

  // The cat.
  const cat = k.part(0, 0, 0, (q) => {
    const c = mat('#4a4038');
    q.sphere(0, 0.13, 0, 0.13, c, { seg: 8, rings: 5 });
    q.sphere(0.16, 0.2, 0, 0.075, c, { seg: 8, rings: 5 });
    q.cyl(-0.12, 0.15, 0, 0.018, 0.22, c, { axis: 'x', seg: 4 });
  });
  const kit = ROOMS[3];
  W.addActor({ object: cat, t: 0, update(dt, t) { this.t = t; cat.position.set(0.3 + Math.sin(t * 0.1) * 0.5, kit.y0, 1.9); cat.rotation.y = Math.cos(t * 0.1) > 0 ? 0 : Math.PI; } });

  // Gulls by day.
  for (let g = 0; g < 7; g++) {
    const gull = k.part(0, 0, 0, (q) => {
      const w = mat({ c: '#f2f0ea', thin: true });
      q.sphere(0, 0, 0, 0.12, mat('#f2f0ea'), { seg: 6, rings: 4 });
      q.boxR(0, 0.02, 0.35, 0.18, 0.02, 0.6, w, { x: 0.25 });
      q.boxR(0, 0.02, -0.35, 0.18, 0.02, 0.6, w, { x: -0.25 });
    });
    W.addActor({ object: gull, update(dt, t, w) {
      gull.visible = w.sun().day > 0.3;
      const ph = t * (0.12 + g * 0.015) + g * 0.9;
      gull.position.set(Math.cos(ph) * (14 + g * 2), 22 + g * 2.5 + Math.sin(t * 0.7 + g) * 1.5, 8 + Math.sin(ph) * (10 + g));
      gull.rotation.y = -ph - Math.PI / 2;
      const fl = Math.sin(t * 6 + g) * 0.4;
      gull.children[0] && (gull.scale.y = 1);
      gull.rotation.z = fl * 0.2;
    } });
  }

  // Spray where the swell breaks on the reef.
  W.emitter({ kind: 'spray', x: -9, y: SEA + 0.3, z: 2, w: 3, d: 4, rate: (w) => 3 + 8 * Math.max(0, Math.sin(w.time * 0.7)), vx: -1.5, vy: 3.5 });
  W.emitter({ kind: 'spray', x: 10, y: SEA + 0.3, z: 3, w: 3, d: 4, rate: (w) => 3 + 8 * Math.max(0, Math.sin(w.time * 0.7 + 2)), vx: 1.5, vy: 3.2 });

  // Sound: surf and wind all round, gulls by day, the clockwork and the range inside.
  W.sound({ kind: 'gulls', x: 0, y: 26, z: 8, r: 60, gain: 0.35 });
  W.sound({ kind: 'clock', x: -0.2, y: 33, z: 2.5, r: 4, gain: 0.25 });
  W.sound({ kind: 'machine', x: 0.15, y: 33, z: 2.2, r: 5, gain: 0.2, pitch: 2200, rate: (w) => (w.sun().night > 0.5 ? 2 : 0) });
  W.sound({ kind: 'fire', x: -0.9, y: 23.3, z: 1.9, r: 4, gain: 0.3 });
  W.sound({ kind: 'bell', x: 0, y: 32, z: 1, r: 40, gain: 0.25, hz: 520 });

  // Guided tour.
  W.stop({ x: 0, y: 20, z: 2, w: 70, title: 'A tower in the sea', text: 'Three keepers live on a reef miles from shore, keeping a light burning every night of the year. Zoom into any room to see what they are doing.', hold: 10 });
  W.stop({ x: 0, y: 8, z: 1, w: 22, title: 'Built to take a beating', text: 'The base is solid granite, the blocks locked together so the waves strike one mass rather than many stones.', hold: 9 });
  W.stop({ x: 0, y: 24.5, z: 1.5, w: 9, title: 'The kitchen', text: 'Meals, mending and long conversations happen around the iron range, the only real warmth in the tower.', hold: 10 });
  W.stop({ x: 0, y: 28.5, z: 1.5, w: 9, title: 'Curved bunks', text: 'Every piece of furniture has to fit a round room. Even the beds bend.', hold: 9 });
  W.stop({ x: 0, y: 32.3, z: 1.5, w: 9, title: 'On watch', text: 'Through the night one keeper is always awake, winding the clockwork that turns the lens and writing up the log.', hold: 10 });
  W.stop({ x: 0, y: 37, z: 0.5, w: 14, title: 'The light', text: 'The lens turns, and its beams sweep the dark sea as a pattern of flashes that tells a ship exactly which lighthouse it is seeing.', hold: 12, hour: 21.5 });
  void stage;
}

function update(W, dt) {
  const s = W.sun();
  const lit = s.night > 0.5;
  W.data.lens += dt * (lit ? 0.42 : 0.04);
  if (lit) W.data.weight = Math.max(0, W.data.weight - dt / 240);
  W.data.lensObj.rotation.y = W.data.lens;
  const B = W.data.beams;
  B.rotation.y = W.data.lens;
  B.visible = lit;
  for (const m of B.children) m.material.uniforms.uIntensity.value = 0.42 * Math.min(1, (s.night - 0.5) * 3);
}

XS.scenes.register({
  id: 'lighthouse',
  order: 70,
  title: 'The Rock Lighthouse',
  subtitle: 'A keepers’ tower on an offshore reef, about 1890',
  blurb: 'Three keepers, a clockwork-turned lens, and a light that sweeps the night sea.',
  bounds: { x0: -24, x1: 24, y0: -6, y1: 44, z0: 0, z1: 18 },
  frame: { x0: -16, x1: 16, y0: -2, y1: 44, z0: 0, z1: 6 },
  startHour: 17.2,
  daySeconds: 720,
  wind: 1.6,
  slice: false,
  view: { yaw: -0.5, pitch: 0.2 },
  thumb: { hour: 19.4, angle: [-0.5, 0.1], zoom: [0, 20, 105, 2] },
  focusDepth: 1.5,
  fog: [140, 900, 0.7],
  ambience: { sea: 0.9, wind: 0.5, reverb: 0.12, size: 1.2 },
  build, setup, update,
});
