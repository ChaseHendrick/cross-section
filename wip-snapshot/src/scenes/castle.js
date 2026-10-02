/* The Castle: Conwy Castle, North Wales, on a working day in May around 1300.
 *
 * Sources: docs/research/castle.md (Cadw listing and teachers' notes, Lewis 1912,
 * English Heritage, Wikipedia). Real people appear only in captions; every named
 * character is fictional.
 *
 * Layout plan (metres; x west to east, y up from the outer-ward courtyard, z north):
 *   Viewer stands south, over the Gyffin inlet, looking north. The cut plane (z = 0)
 *   runs along the inner face of the south curtain, through the centres of the three
 *   front towers, so the south range of rooms is seen in section. The north towers are
 *   opened on their own centre line (z = 30) and the timber lean-tos have their
 *   courtyard fronts cut away, so the back layer reads as a second honeycomb. True
 *   depth replaces the dossier's 2D "+14 m back layer"; a raised book view (about 27
 *   degrees) looks over the hall roofs into the courtyards.
 *
 *   x -80..-1   the walled town (Castle Square, houses cut open at the front)
 *   x -24..-6   the stone ramp up from the town; x -6..-0.5 drawbridge over a pit
 *   x -0.5..13.5 west barbican: outer gate with two turrets, yard at y -2, third turret
 *   x 13.5..23  west gatehouse block: passage (z 13..17), winch chamber, guard room
 *   x 8.5..20.5 South-west Tower (front): basement, bread oven, constable's chamber,
 *               family chamber, roof.  NW Tower (back, z 30) at x 11.8
 *   x 23.3..62.3 hall range (front, z 0..9): lesser hall | small chamber | great hall |
 *               cross passage | chapel, over rock-cut cellars (y -3..0); Prison Tower pit
 *               drawn under the great hall at x 40 (its tower stands south, cut away)
 *   z 21..27    timber lean-tos on the north wall: forge, kitchen, brewhouse, stables;
 *               Kitchen Tower (back) at x 40.5; well at x 60.4, z 21.6 (28 m shaft)
 *   x 62..66.5  rock-cut ditch and middle drawbridge; cross-wall and gatehouse 66.5..71
 *   x 62.3..74.3 Bakehouse Tower (front) and Stockhouse Tower (back), watch turrets
 *   x 74..94    royal apartments (front): service rooms below, king's hall and king's
 *               chamber above (y 4); granary (back, x 74..83); east range (x 88..94)
 *   x 93..105   King's Tower (front); Chapel Tower (back, x 96.8) with the royal chapel
 *   x 97.6..117 east barbican garden (y -1); water-gate stair to the dock (y -6.2)
 *   x 118..180  River Conwy estuary with a tide; ferry, fishing boats, a moored ship
 *   Floors: towers 0 / 4.5 / 9 / roof 13.5, merlons to 16, turrets to 22.5.
 *   Halls: floor 0.6, wall plate 7, ridge 10.5. Curtain wall-walk 9.
 *   Suggested cuts: 18 (west gate passage), 41 (great hall and Kitchen Tower),
 *   60.4 (the well shaft), 68.3 (Bakehouse and Stockhouse towers), 96.8 (Chapel Tower).
 */
import { XS } from '../engine/index.js';
import { M, TOWERS, WELL, HALL, ROYAL, GARDEN, DOCK, GATE_Z } from './castle/common.js';
import { buildTerrain } from './castle/terrain.js';
import { tower, walls, barbicans, hallRange, royalRange, leanTo, innerNorth } from './castle/shell.js';
import { furnish } from './castle/rooms.js';
import { buildTown } from './castle/town.js';
import { buildNav, buildPeople } from './castle/people.js';
import { buildLife, buildFlues } from './castle/life.js';

const CADW_LB = 'https://cadwpublic-api.azurewebsites.net/reports/listedbuilding/FullReport?lang=en&id=3250';
const CADW_TN = 'https://cadw.gov.wales/sites/default/files/2019-05/Conwyteachersnotes_EN.pdf';
const WIKI = 'https://en.wikipedia.org/wiki/Conwy_Castle';
const LEWIS = 'https://archive.org/details/mediaevalborough00lewiuoft';

function build(k) {
  const sea = buildTerrain(k);
  k._castleSea = sea;
  tower(k, 'sw', { base: -3.5, basement: true, inner: [M.rubble, M.sooty, M.plasterRed, M.plasterRed], turretA: 2.2 });
  tower(k, 'bake', { base: 0, inner: [M.rubble, M.sooty, M.rubble, M.rubble], turretA: 1.9 });
  tower(k, 'king', { base: -3.0, basement: true, basementY: -3.0, inner: [M.rubble, M.rubble, M.plasterRed, M.plasterRed], turretA: 0.75 });
  tower(k, 'nw', { inner: [M.rubble, M.rubble, M.plaster, M.plaster], turretA: 2.3 });
  tower(k, 'kit', { inner: [M.rubble, M.rubble, M.plaster, M.plaster], turretA: 1.9 });
  tower(k, 'stock', { inner: [M.rubble, M.rubble, M.rubble, M.rubble], turretA: 1.3 });
  tower(k, 'chap', { inner: [M.rubble, M.rubble, M.plasterRed, M.plaster], turretA: 1.0 });
  walls(k);
  barbicans(k);
  hallRange(k);
  royalRange(k);
  leanTo(k, 23.6, 30.6, [{ x0: 23.6, name: 'forge' }]);
  leanTo(k, 30.6, 58.6, [{ x0: 30.6 }, { x0: 45.0 }, { x0: 51.0 }]);
  leanTo(k, 74.2, 83.0, [{ x0: 74.2 }], { floor: M.boards });
  innerNorth(k);
  furnish(k);
  buildTown(k);
  buildFlues(k);
  captions(k);
}

function captions(k) {
  const L = (d) => k.label(d);
  const T = TOWERS;
  // The whole subject.
  L({ x: 60, y: 26, z: 14, title: 'Conwy Castle', text: 'Built for Edward I after his conquest of Snowdonia, here on a working day around 1300.', priority: 5, max: 14,
    body: 'Conwy Castle was begun in 1283, after Edward I’s conquest of Snowdonia, and was substantially complete by 1287, together with the walled town beside it. This drawing shows it about thirteen years later, finished and lived in. Every named person in it is invented.', source: CADW_LB });
  L({ x: T.sw.x - 6.1, y: 12, z: 1.5, title: 'Eight great towers', text: 'Four along each side, each about 21 metres (70 feet) tall.', min: 5, max: 40, body: 'The castle has eight great round towers, four along each long side, each about 21 metres (70 feet) high. The four towers of the inner ward also carry slender watch turrets.', source: WIKI });
  L({ x: T.sw.x - 5.6, y: 6, z: 2.6, title: 'Painted white', text: 'Today the stone looks grey, but patches of limewash show the whole castle was once painted white.', min: 9, body: 'The stone of the castle looks grey today, but surviving patches of limewash show that the whole castle was once painted white.', source: CADW_TN });
  L({ x: T.nw.x - 6.0, y: 4.5, z: 31.5, title: 'A spiral of holes', text: 'Round holes held scaffold poles. At Conwy they climb in a spiral, where builders wound a sloping ramp round each tower as it rose.', min: 12, source: WIKI, body: 'The putlog holes in the towers held the poles of the builders’ scaffolding. At Conwy they rise in a spiral, showing that a sloping ramp of scaffolding was wound round each tower as it went up.' });
  L({ x: T.nw.x - 5.0, y: 12.9, z: 33.5, title: 'Square sockets', text: 'Thought to have held beams for a hourd, a wooden fighting gallery. Historians are not completely sure.', min: 14 });
  L({ x: T.bake.x + 2.0, y: 16.4, z: 2.6, title: 'Pointed merlons', text: 'Each merlon was crowned with three stone finials, a fashion from Savoy, the master builder’s homeland.', min: 14, body: 'The merlons of the battlements were crowned with three stone finials, a fashion from Savoy, the homeland of the master builder.', source: WIKI });
  // West gate.
  L({ x: -14, y: -3.2, z: 15, title: 'Ramp and drawbridge', text: 'Visitors climbed a stone ramp from the town and crossed a drawbridge to the west barbican.', min: 7, source: WIKI, body: 'The main entrance was reached by a steep stone ramp up from the town, ending at a drawbridge in front of the west barbican. In this drawing the bridge is raised at sunset and lowered at first light.' });
  L({ x: 12.2, y: 8.6, z: 15, title: 'Machicolations', text: 'Overhanging parapets with gaps in the floor for dropping missiles on attackers at the gate.', min: 12, body: 'The stone machicolations over the main gate at Conwy are the earliest surviving examples in Britain: parapets carried out on corbels, with openings in their floor through which defenders could drop missiles on anyone at the gate below.', source: WIKI });
  L({ x: 16.5, y: 2.6, z: 15, title: 'Gate passage', text: 'Grooves for the portcullis, pivot holes for the drawbridge and sockets for heavy wooden drawbars. Slice the castle at the gate to look inside.', min: 14, source: CADW_TN, body: 'In the west gate passage you can still see the grooves the portcullis ran in, the pivot holes of the drawbridge and the sockets for heavy wooden drawbars. In this drawing the portcullis is wound up by a winch in the chamber above the passage.' });
  L({ x: 20.0, y: 3.0, z: 20.5, title: 'Guard room', text: 'The garrison of 1283-84 was set at 30 men, half of them crossbowmen.', min: 18, body: 'In 1283-84 the garrison was set at 30 men: 15 crossbowmen, a chaplain, an artiller (who kept the crossbows and armour), a mason, a carpenter, a smith, and 10 others, among them the keeper of victuals, the doorkeeper and the watchmen.', source: LEWIS });
  // South-west Tower.
  L({ x: T.sw.x, y: 7.6, z: 1.2, title: 'The constable’s home', text: 'The south-west and north-west towers housed the constable and his family, with fireplaces and latrines.', min: 16, source: CADW_TN, body: 'The north-west and south-west towers were the home of the constable and his family, with fireplaces and latrines.' });
  L({ x: T.sw.x - 3.6, y: 2.4, z: 1.2, title: 'Bread oven', text: 'A domed oven built into the ground floor of the tower.', min: 18, source: CADW_LB, body: 'A domed bread oven is built into the ground floor of the south-west tower. The drawing cuts through the oven to show its fire.' });
  // Hall range.
  L({ x: 26.6, y: 4.0, z: 3.0, title: 'Lesser hall', text: 'The constable commanded the castle and was also mayor of the new town.', min: 16, source: WIKI, body: 'By a royal charter of 1284 the constable of the castle was also the mayor of the new town of Conwy. In this drawing he hears townsfolk in the lesser hall.' });
  L({ x: 33.2, y: 3.4, z: 2.0, title: 'Small chamber', text: 'The clerk’s accounts and tally sticks. Welsh districts paid a yearly sum toward the castle’s store, reckoned in the value of oxen and cows.', min: 20, source: LEWIS, body: 'The Welsh districts round Conwy paid a yearly render toward the castle’s store of food, reckoned in the value of oxen and cows but paid in money.' });
  L({ x: 41, y: 6.2, z: 2.0, title: 'Great hall', text: 'Dinner around 10 or 11 in the morning, supper after evening prayers.', min: 9, priority: 2, source: 'https://www.english-heritage.org.uk/visit/places/goodrich-castle/history-and-stories/life-medieval-household/', body: 'Great households of this period ate two main meals a day: dinner in the late morning, around 10 or 11, and supper after evening prayers. (The evidence comes from the household accounts of Goodrich Castle, 1296-97.)' });
  L({ x: 44.5, y: 4.4, z: 8.9, title: 'Lancet windows', text: 'Grey local stone; window frames of coloured sandstone from the Creuddyn peninsula, Chester and the Wirral.', min: 22, body: 'The walls are of local grey stone, much of it quarried from the ridge the castle stands on. The window frames are carved in sandstone brought from the Creuddyn peninsula, Chester and the Wirral.', source: WIKI });
  L({ x: 52, y: 9.2, z: 3.6, title: 'Timber roof', text: 'In 1300 the hall roof rested on timber trusses. The stone arches seen today were added in 1346.', min: 12, source: CADW_TN, body: 'When this drawing is set, the hall roofs stood on timber trusses. The stone arches that span the great hall today were inserted when the roofs were renewed in lead in 1346. The roof covering here is cut back on the near side to show the timbers.' });
  L({ x: 40, y: -1.8, z: 1.4, title: 'Prison pit', text: 'Prisoners were lowered through a hole into a cell in the base of the Prison Tower. The tower stands south of the hall and is cut away here.', min: 14, source: 'https://medievalheritage.eu/en/main-page/heritage/wales/conwy-castle/', body: 'Prisoners were kept in a cell in the basement of the Prison Tower, lowered through a hole in the floor above. The Prison Tower projects south from the great hall, in front of the plane of this section, so only its pit is drawn.' });
  L({ x: 47, y: -1.6, z: 3.0, title: 'Cellars in the rock', text: 'The halls and chapel stand over cellars cut into the rock.', min: 14, source: CADW_LB, body: 'Along the south wall run a lesser hall, a small chamber, the great hall, a passage and a chapel, all raised over cellars cut into the rock.' });
  // Courtyard and north range.
  L({ x: 38, y: 5.8, z: 23, title: 'Kitchen', text: 'The kitchen, stables and guard room were timber buildings against the north wall. The stone corbels for their roofs still jut out.', min: 9, source: CADW_TN, body: 'The kitchen, the stable and the guard room were timber buildings leaning against the north wall. The stone corbels that carried their roofs still project from the wall. Their courtyard fronts are cut away in this drawing.' });
  L({ x: 47.8, y: 7.4, z: 24, title: 'Brewhouse', text: 'Ale brewed from malt and water, with no hops.', min: 14, source: 'https://en.wikipedia.org/wiki/Beer_in_England', body: 'Ale was brewed from malt and water with no hops; hopped beer only reached England from the Low Countries around 1400. Conwy’s ale had a poor name: an old Welsh saying, “Cwrw Aberconwy gorau pei bellaf”, means “the ale of Aberconway, the farther the better” (Lewis, 1912).' });
  L({ x: 38.0, y: 2.6, z: 12.8, title: 'Crossbow practice', text: 'A crossbowman could loose only about two bolts a minute; a skilled longbowman twelve or more.', min: 26, source: 'https://en.wikipedia.org/wiki/Crossbow', body: 'A crossbow was spanned by putting a foot in the stirrup and drawing the string back with a hook on the belt. A crossbowman could shoot about two bolts a minute; a skilled longbow archer could manage twelve or more.' });
  L({ x: WELL.x, y: 2.6, z: WELL.z, title: 'The well', text: 'Stone-lined and spring-fed, about 28 metres deep. Slice here to see the shaft, which runs on below the edge of the drawing.', min: 10, source: CADW_LB, body: 'The castle well is stone-lined and fed by a spring. It is about 28 metres (91 feet) deep. (One source gives a depth of 21.7 metres for the original well.)' });
  L({ x: 64.2, y: 4.5, z: 15, title: 'A castle within a castle', text: 'A rock-cut ditch, a drawbridge and a gate in the cross-wall sealed off the inner ward.', min: 12, source: WIKI, body: 'A ditch cut into the rock, a drawbridge and a gate in the cross-wall sealed the inner ward off from the outer ward: a castle within a castle.' });
  // Inner ward.
  L({ x: 80, y: 7.4, z: 3.0, title: 'King’s hall', text: 'Kept ready for a royal visit, its furniture under covers.', min: 14, source: CADW_LB, body: 'On the first floor of the inner ward’s south range were the king’s hall and the king’s chamber, with a passage through the wall to a private latrine. The inner ward was rarely used by the royal family, so in this drawing the rooms wait under dust covers.' });
  L({ x: 90, y: 7.6, z: 3.0, title: 'King’s chamber', text: 'The best-preserved suite of medieval private royal chambers in England and Wales.', min: 16, source: WIKI, body: 'Historian Jeremy Ashbee calls the royal apartments at Conwy the best preserved suite of medieval private royal chambers in England and Wales.' });
  L({ x: 77, y: 6.4, z: 7.9, title: 'Painted plaster', text: 'Fine rooms were limewashed and painted with red lines to look like neat blocks of stone.', min: 22, source: CADW_TN, body: 'Some original plaster survives on the inner-ward walls. Fine rooms of this period were often limewashed white and painted with thin red lines to look like neatly cut blocks of stone (as at Goodrich Castle).' });
  L({ x: 84, y: 1.8, z: 15, title: 'Inner ward', text: 'It could be entered from the river by the east barbican, without passing through the outer ward.', min: 12, source: CADW_TN, body: 'The inner ward held the apartments of the king and queen. It could be reached from the river, through the east barbican, without passing through the outer ward at all.' });
  L({ x: T.chap.x, y: 7.0, z: 31.4, title: 'Royal chapel', text: 'Round and rib-vaulted, with an apse lit by three pointed windows and stone seats for the clergy.', min: 14, priority: 1, source: CADW_LB, body: 'The royal chapel on the first floor of the Chapel Tower is round and rib-vaulted, with an apse lit by three pointed windows, stone seats (sedilia) for the clergy and a wall arcade. Narrow slanting openings called squints let someone in a side cell or a window seat see the altar.' });
  L({ x: 64.2, y: -2.2, z: 7.0, title: 'Rock-cut ditch', text: 'Digging the rock-cut ditches was the first work on the site.', min: 20, source: CADW_LB, body: 'Work on the castle began with digging the rock-cut ditches, directed by Richard of Chester, master engineer.' });
  L({ x: T.chap.x + 1.8, y: 23.6, z: 33, title: 'Watch turrets and banner', text: 'Edward I’s banner was red with three gold lions. The French lilies were added only in 1340.', min: 9, source: 'https://en.wikipedia.org/wiki/Royal_arms_of_England', body: 'Each inner-ward tower has an extra watch turret, probably for lookouts and for flying the royal banner. Edward I’s arms were three gold lions on red; the French fleurs-de-lis were added by Edward III in 1340. Which turret flew a banner is not recorded; this drawing puts it on the Chapel Tower.' });
  // East barbican and river.
  L({ x: 109, y: 1.4, z: 9, title: 'The garden', text: 'An account of 1316 calls the east barbican the herbarium; in the early 14th century it was a lawn.', min: 12, source: WIKI, body: 'The east barbican was a garden. An account of 1316 calls it the herbarium, and in the early 14th century it was laid out as a lawn.' });
  L({ x: 121, y: DOCK.y + 1.6, z: 28, title: 'Water gate', text: 'A gate down to a small dock, where visitors could land privately and supplies came by boat.', min: 12, source: WIKI, body: 'A gate in the east barbican led down to a small dock on the river, so that important visitors could arrive privately and the castle could be supplied by boat. In the winter of 1294-95, when Edward I was besieged here, supplies came only by sea.' });
  L({ x: 150, y: -5.5, z: 52, title: 'The royal ferry', text: 'There was no bridge. People crossed the Conwy by the royal ferry, and its profits went to the Crown.', min: 6, source: LEWIS, body: 'There was no bridge. People crossed the Conwy on the royal ferry, and its profits went to the Crown.' });
  // Town.
  L({ x: -36, y: 4.0, z: 6.0, title: 'The walled town', text: 'A town for English settlers, founded with the castle; Welshmen were in principle forbidden to live in it.', min: 7, source: CADW_TN, body: 'The town walls run for 1.3 km, with 21 towers, three gates and a row of twelve latrines. Conwy was founded for English settlers; Welshmen were, in principle, forbidden to live or hold property inside it (Lewis, 1912).' });
}

function setup(W, stage, k) {
  const nav = buildNav(W);
  buildPeople(W, nav);
  buildLife(W, k, stage);
  // Guided tour.
  const T = TOWERS;
  W.stop({ x: 52, y: 4, z: 8, w: 165, pitch: 0.42, title: 'Conwy Castle, about 1300', text: 'Edward I’s castle on its rock above the River Conwy, sliced open on an ordinary day in May. Its garrison was set at thirty men in 1283-84; with the constable’s household and the day’s visitors, about fifty people are at work inside.', hold: 11, hour: 10.4 });
  W.stop({ x: 2, y: 1, z: 14, w: 46, yaw: -0.75, pitch: 0.35, title: 'The way in', text: 'From the town square a stone ramp climbs to a drawbridge and the west barbican. The porter questions everyone at the gate; at sunset the bridge rises and the portcullis drops.', hold: 11 });
  W.stop({ x: T.sw.x, y: 6.5, z: 1.5, w: 18, pitch: 0.2, title: 'The constable’s tower', text: 'The baker fires a domed oven on the ground floor. Above it are the constable’s chamber, with its curtained bed, and the family room where his wife sews a banner for the chapel.', hold: 11 });
  W.stop({ x: 41, y: 3.0, z: 3, w: 26, pitch: 0.24, title: 'Dinner in the great hall', text: 'The main meal of the day, late in the morning. The constable dines at the high table on the dais; the garrison and servants crowd the trestles below.', hold: 12, hour: 10.5 });
  W.stop({ x: 42, y: -1.5, z: 2, w: 24, pitch: 0.12, title: 'Under the floor', text: 'In the rock-cut cellars the household keeps its wine, ale, salt meat and grain. A cat stalks a rat between the casks, and in the pit of the Prison Tower a man waits for his case to be heard.', hold: 11 });
  W.stop({ x: 44, y: 2.5, z: 22, w: 34, pitch: 0.52, title: 'Kitchen, brewhouse, stables', text: 'Timber buildings lean on the north wall. A boy turns the spit, the brewster mashes malt, the groom brushes down the horses, and the bucket goes 28 metres down the well.', hold: 12, hour: 8.4 });
  W.stop({ x: 84, y: 4.5, z: 4, w: 30, pitch: 0.26, title: 'The royal apartments', text: 'Beyond the ditch and the cross-wall lies the inner ward. The king’s hall and chamber wait for a royal visit that rarely comes.', hold: 11 });
  W.stop({ x: T.chap.x, y: 6.0, z: 31, w: 24, yaw: -0.1, pitch: 0.62, title: 'The royal chapel', text: 'A round, rib-vaulted chapel in the Chapel Tower, its apse lit by three lancets. The chaplain prays here alone in the afternoon.', hold: 10, hour: 12.6 });
  W.stop({ x: 120, y: -2, z: 24, w: 60, yaw: -0.2, pitch: 0.34, title: 'Garden and river', text: 'The east barbican is a garden of lawn and herbs. Below it a water gate opens on the river, where boats unload and the ferry crosses with the tide.', hold: 11, hour: 12.0 });
  W.stop({ x: 52, y: 6, z: 10, w: 120, pitch: 0.36, title: 'Night watch', text: 'The gate is shut and the drawbridge raised. Fires are banked, candles burn low, and watchmen with lanterns walk the walls until dawn.', hold: 13, hour: 22.5 });
  void stage;
}

// Structural frames the slices snap to: the gate passage, hall cross walls, the well, tower axes.
const FRAMES = [13.5, 18.0, 23.3, 31.0, 35.4, 41.0, 47.0, 50.6, 60.4, 62.3, 66.5, 68.3, 74.0, 86.0, 94.0, 96.8, 99.0, 104.0];

XS.scenes.register({
  id: 'castle', order: 20, title: 'The Castle', subtitle: 'Conwy Castle, North Wales, about 1300',
  blurb: 'Edward I’s castle above the River Conwy: great hall, kitchens, chapel and wall walks, and a whole household behind walls three metres thick.',
  bounds: { x0: -40, x1: 170, y0: -16, y1: 42, z0: 0, z1: 40 },
  frame: { x0: -30, x1: 132, y0: -14, y1: 24, z0: 0, z1: 12 },
  view: { yaw: -0.42, pitch: 0.36 },
  startHour: 10.4,
  daySeconds: 1200,
  wind: 2.2,
  clouds: 0.5,
  fog: [260, 1500, 0.7],
  focusDepth: 4,
  lampGain: 2.4,
  suggestedCuts: [18.0, 41.0, 60.4, 68.3, 96.8],
  cutRange: [-20, 130],
  sliceGap: 9,
  snapCut(x) { let b = x, d = 2.2; for (const f of FRAMES) if (Math.abs(f - x) < d) { d = Math.abs(f - x); b = f; } return b; },
  build, setup,
});
void HALL; void ROYAL; void GARDEN; void GATE_Z;
