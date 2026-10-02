/* Big Pit: captions and the guided tour. Every fact card (body) is one the research dossier
 * marks verified, with the source it was checked against. Where the drawing is an
 * illustration (the old workings, the size of the fault), the caption says so.
 */
import { PB } from './common.js';


export function captions(k) {
  const L = (d) => k.label(d);
  // ---- surface
  L({ x: 150, y: 16.5, z: 1.4, title: 'Timber headframe', text: 'Two sheaves carry the flat ropes from the engine house down to the cages.', min: 1.5, priority: 2,
    body: 'The headframe over Big Pit is made of timber. The steel lattice headframe that stands here today did not replace it until 1921.', source: 'https://coflein.gov.uk/en/site/223676/' });
  L({ x: 180, y: 9.5, z: 3, title: 'Winding engine house', text: 'A twin-cylinder horizontal steam engine winds the cages on flat ropes.', min: 3, priority: 2,
    body: 'A twin-cylinder horizontal steam engine winds the cages on a flat rope. It will keep working until an electric winder replaces it in the early 1950s (the sources give 1952 and 1953).', source: 'http://www.welshcoalmines.co.uk/Gwent/BigPit.htm' });
  L({ x: 179.8, y: 1.6, z: 4.1, title: 'The engineman', text: 'By law at least 22 years old, and at his post whenever anyone is below.', min: 40,
    body: 'Under the Coal Mines Regulation Act 1887 the man in charge of the winding engine must be at least 22 years old, and must stay at his post the whole time anyone is below ground.', source: 'https://www.legislation.gov.uk/ukpga/Vict/50-51/58/enacted' });
  L({ x: 176, y: 5.8, z: 1.0, title: 'Flat-rope reels', text: 'Each rope coils on itself like a reel of ribbon: one coil grows as the other shrinks.', min: 22,
    body: 'A flat rope coils on top of itself, so the full cage starts on a small coil and the empty one on a big one, which helps balance the load.', source: 'https://archive.org/details/atextbookcoalmi02hughgoog' });
  L({ x: 207, y: 6.2, z: 3, title: 'Boiler house', text: 'Steam for the winding engine, fired by hand day and night.', min: 8 });
  L({ x: 234.8, y: 5.2, z: 2.5, title: 'Blacksmiths’ shop', text: 'Blunt pick points come up from below by the bundle to be sharpened.', min: 8,
    body: 'A collier blunts several pick points a day and sends them up to be sharpened. Big Pit’s smithy had nine forges; three are drawn here.', source: 'http://www.britishlistedbuildings.co.uk/wa-15282' });
  L({ x: 252.5, y: 5.6, z: 2.5, title: 'Fitting shop', text: 'New in 1910, with lathes and drills for the colliery\u2019s machinery.', min: 10,
    body: 'The fitting shop opened in 1910 with lathes and drills for repairing the colliery’s machinery.', source: 'http://www.britishlistedbuildings.co.uk/wa-15288' });
  L({ x: 306, y: 7.0, z: 2.5, title: 'Colliery office', text: 'Wages, time books and the notices required by law.', min: 8,
    body: 'In 1908 Big Pit, with Dodd’s and Forge Slope, employed 1,122 people.', source: 'http://www.welshcoalmines.co.uk/Gwent/BigPit.htm' });
  L({ x: 333.5, y: 12, z: 2.6, title: 'Fan house and flared chimney', text: 'Brand new: built in 1909-10 for an electrically driven Walker fan.', min: 1.5, priority: 2,
    body: 'This red-brick fan house was built in 1909-10 for an electrically driven Walker fan, which will run until 1975. The Walker fan has curved blades like the older Guibal fan, a shutter to regulate the air, and a flared chimney that slows the air before it escapes.', source: 'http://www.britishlistedbuildings.co.uk/wa-15289' });
  L({ x: 346, y: 3.6, z: 0.6, title: 'Coity shafts', text: 'Two old shafts, sealed and joined to the fan: the used air comes out here.', min: 8,
    body: 'Fresh air goes down Big Pit’s shaft. Since 1895 the two old Coity shafts, sealed and fitted with a fan, have drawn the used air back out.', source: 'http://www.welshcoalmines.co.uk/Gwent/BigPit.htm' });
  L({ x: 137, y: 9.0, z: 2.2, title: 'Pit bank', text: 'Cages land on the plank deck; the banksman sends men down and takes the coal off.', min: 8,
    body: 'Since July 1909 no man may be underground more than eight hours, counted from the last man down to the first man up, and the winding times are posted on a notice at the pit head. The 1887 Act also wants a barometer and a thermometer hung in a conspicuous place near the entrance to the mine: both are on the post by the cabin.', source: 'https://www.legislation.gov.uk/ukpga/Edw7/8/57/enacted' });
  L({ x: 119, y: 4.0, z: 2.5, title: 'Lamp room', text: 'Every lamp has a number, a shelf and an owner.', min: 5, priority: 1,
    body: 'Count the lamps out and back and you know exactly who is still underground. Lamps are locked before they go down, with a lead rivet or a magnetic lock, so no one can open one in gas. In 1910 only about one safety lamp in four hundred in Britain is electric: these men go down with oil flames behind glass and gauze.', source: 'https://archive.org/details/collierymanager00pamegoog' });
  L({ x: 105, y: 9.2, z: 2.0, title: 'Weigh cabin', text: 'Colliers are paid by the weight of coal they send up.', min: 10,
    body: 'Colliers are paid by the weight of coal they send up. The men can pay their own checkweigher to stand beside the company’s weigher.', source: 'https://www.legislation.gov.uk/ukpga/Vict/50-51/58/enacted' });
  L({ x: 80, y: 11.5, z: 2.0, title: 'Screens', text: 'Drams are turned over and the coal picked clean of stone by hand.', min: 4, priority: 1,
    body: 'Full drams are turned upside down, tipping the coal on to screening belts where stones and dirt are picked out by hand. Women and girls have been banned from working underground since 1842, but may work on the surface: never before 5 am, never after 9 pm, and never moving railway waggons (1887 Act).', source: 'https://museum.wales/bigpit/tour/' });
  L({ x: 22, y: 14.5, z: 3.5, title: 'Spoil tip', text: 'Stone and shale picked out of the coal, tipped by the tram-load.', min: 6 });
  L({ x: -21, y: 6.0, z: 2.5, title: 'A collier’s cottage', text: 'No pithead baths here until 1939: men walk home black.', min: 4, priority: 1,
    body: 'There are no pithead baths at Big Pit until 1939. Men walk home black from the pit, and women heat water again and again for the tin bath.', source: 'https://www.agor.org.uk/cwm/themes/Life/women.asp' });
  // ---- underground
  L({ x: 150, y: -42, z: 1.0, title: 'Big Pit shaft', text: 'Oval, 18 ft by 13 ft, and 293 ft (89 m) deep to the Old Coal.', min: 1.0, priority: 3,
    body: 'Big Pit’s shaft is not round but oval, 18 feet by 13 feet: the first shaft in Wales big enough for two tramways side by side, which is how it got its name. In 1878 it was deepened to reach the Old Coal seam, 293 feet (89 m) below the surface.', source: 'https://en.wikipedia.org/wiki/Big_Pit_National_Coal_Museum' });
  L({ x: 133, y: PB + 3.2, z: 2.0, title: 'Pit bottom', text: 'Electric light near the shaft. Beyond it, the only light is what you carry.', min: 4, priority: 1,
    body: 'Many collieries now have electric light underground, but only for a short distance from the shaft. Beyond it, the only light is what a man carries.', source: 'https://archive.org/details/atextbookcoalmi02hughgoog' });
  L({ x: 126, y: PB + 1.0, z: 3.4, title: 'First aid', text: 'Stretcher, splints and bandages, kept ready by law.', min: 30,
    body: 'A stretcher, splints and bandages must be kept at every mine, ready for the next accident (Rule 34 of the 1887 Act).', source: 'https://www.legislation.gov.uk/ukpga/Vict/50-51/58/enacted' });
  L({ x: 198, y: PB + 3.0, z: 2.2, title: 'Haulage engine', text: 'Electric: it drives the endless rope along the main road.', min: 10,
    body: 'Big Pit was one of the first mines to use electricity: by 1910 its fans, haulage and pumps are all electric.', source: 'https://en.wikipedia.org/wiki/Big_Pit_National_Coal_Museum' });
  L({ x: 221, y: PB + 2.6, z: 3.0, title: 'Underground stables', text: 'Horses, not little ponies: South Wales trams were big.', min: 3, priority: 2,
    body: 'Horses went underground at four years old and ponies at three. A pit horse eats about 16 pounds of grain, mostly maize, and 10 pounds of hay a day, and one ostler should look after no more than ten. In South Wales, bracken cut on the hills makes the bedding. In April 1913 three men will die in a fire near these stables, trying to rescue the horses; no horses will die (welshcoalmines.co.uk).', source: 'https://archive.org/details/collierymanager00pamegoog' });
  L({ x: 109, y: PB + 2.3, z: 2.8, title: 'Air doors', text: 'Two doors, so both are never open at once. A door boy minds them all shift.', min: 10, priority: 1,
    body: 'Doors come in pairs so both are never open at once; otherwise the air would short-cut back to the shaft and never reach the face. Door boys sit alone in the dark all shift. In 1885 a twelve-year-old door boy was run over by trams and killed at nearby Dodd’s Slope.', source: 'http://www.welshcoalmines.co.uk/Gwent/BigPit.htm' });
  L({ x: 82.8, y: PB + 1.6, z: 3.6, title: 'Refuge hole', text: 'One every 20 yards on rope roads, every 50 on horse roads.', min: 20,
    body: 'Refuge holes must be made every 20 yards on engine planes and every 50 yards on horse roads, and kept clear (Rules 14 to 16 of the 1887 Act).', source: 'https://www.legislation.gov.uk/ukpga/Vict/50-51/58/enacted' });
  L({ x: 92, y: PB + 2.4, z: 1.8, title: 'Main haulage road', text: 'The endless rope creeps at walking pace; water runs down to the shaft.', min: 4, priority: 1,
    body: 'The endless rope runs at about 2 to 3 miles an hour, so a runaway dram does little harm. Water runs down the roadway towards the cages; it still does at the museum today (Wikipedia, Big Pit).', source: 'https://archive.org/details/atextbookcoalmi02hughgoog' });
  L({ x: 55, y: PB + 3.6, z: 2.0, title: 'Parting and ripping lip', text: 'Horses bring drams from the face; here they go on to the rope. Rippers take down roof for height.', min: 10 });
  L({ x: 36, y: PB + 1.9, z: 2.2, title: 'Horse road', text: 'A single line; a horse pulls the drams to the parting.', min: 10 });
  L({ x: 40, y: -79.0, z: 1.6, title: 'Cross-measures drift', text: 'A new road driven up through the rock with explosives.', min: 8,
    body: 'Only an appointed shot-firer, whose pay does not depend on output, may fire a shot in a gassy or dusty place, after checking everything within 20 yards. Explosives travel in a closed canister holding no more than five pounds, and may not be stored in the mine.', source: 'https://www.legislation.gov.uk/ukpga/Vict/50-51/58/enacted' });
  L({ x: 12, y: PB + 1.0, z: 2.0, title: 'The coal face', text: 'Colliers hole under the coal by hand in a low seam, the Old Coal.', min: 1.5, priority: 3,
    body: 'Until 1908, when a conveyor arrived, everything at Big Pit was done by hand, including cutting the coal. A holing pick is light, about 3 pounds, with a 15-inch head, so a collier on his side can swing it all day (Hughes, 1904). Props must stand no more than six feet apart where they are needed (1887 Act, Rule 22).', source: 'https://en.wikipedia.org/wiki/Big_Pit_National_Coal_Museum' });
  L({ x: 11, y: PB + 0.4, z: 1.2, title: 'Firedamp and flame', text: 'No matches below: only locked flame lamps, watched for a blue cap of gas.', min: 26,
    body: 'Firedamp (methane) explodes when it makes up between 4 and 16 per cent of the air; a tester watches for a blue cap rising over his lamp flame. Carrying a match or anything for striking a light is against the law wherever safety lamps are required (1887 Act, Rule 10). Between 1880 and 1900 South Wales had 18 per cent of Britain’s miners but 48 per cent of its mining deaths, largely because of firedamp (Wikipedia, Senghenydd colliery disaster).', source: 'https://en.wikipedia.org/wiki/Firedamp' });
  L({ x: 21.5, y: PB + 1.8, z: 2.6, title: 'Boys below', text: 'None under 13 underground; from 1912 the age rises to 14.', min: 28,
    body: 'No boy under 13 may work underground (since 1900). From 1912 the age will rise to 14.', source: 'https://en.wikipedia.org/wiki/Mines_(Prohibition_of_Child_Labour_Underground)_Act_1900' });
  L({ x: 100, y: -82.0, z: 1.2, title: 'Return airway', text: 'Used air on its way out to the Coity shafts and the fan.', min: 5, y: -103, z: 1.2, title: 'The fault', text: 'Big Pit and the Coity pits lie on opposite sides of a fault.', min: 1.0, priority: 2,
    body: 'Big Pit and the Coity pits lie on opposite sides of a geological fault. The size of the drop drawn here is an illustration, not a measurement.', source: 'https://en.wikipedia.org/wiki/Big_Pit_National_Coal_Museum' });
  L({ x: 384, y: -119.5, z: 1.2, title: 'Old Coity workings', text: 'Abandoned roads, partly flooded (drawn as an illustration).', min: 6 });
  L({ x: 100, y: -59.9, z: 1.0, title: 'Old upper workings', text: 'An upper seam worked long ago, its props rotting (illustrative).', min: 6 });
  L({ x: 90, y: -86.6, z: 0.2, title: 'Roof shale and seatearth', text: 'Fossil bark above the coal, fossil roots below it.', min: 14,
    body: 'Shales above coal seams often hold the fossil bark of giant club-moss trees such as Lepidodendron, patterned with diamond-shaped leaf scars. Under every seam lies seatearth, the fossil soil the coal forest grew in, often a fireclay full of fossil roots called Stigmaria.', source: 'https://en.wikipedia.org/wiki/Seatearth' });
}
const BANKY = 6.0;

export function tour(W) {
  W.stop({ x: 200, y: -48, z: 2, w: 470, title: 'Big Pit, Blaenavon, 1910', text: 'A colliery at the head of the Afon Lwyd valley, sliced open from the moor down to the coal. The workings lie 89 m below the yard. Zoom in anywhere: every person keeps the hours of the shift, and you can click one to follow them.', hold: 12, hour: 10 });
  W.stop({ x: 124, y: 4, z: 1.5, w: 36, title: 'Down before dawn', text: 'Before six the day shift files past the lamp-room windows, each man for his own numbered lamp, then climbs to the bank to wait for the cage.', hold: 11, hour: 5.2 });
  W.stop({ x: 166, y: 8, z: 2, w: 58, title: 'The winder', text: 'Steam from the boilers drives a twin-cylinder engine. Its two reels wind flat ropes over the timber headframe: as one cage rises, the other falls.', hold: 11, hour: 8.5 });
  W.stop({ x: 150, y: -45, z: 1.5, w: 120, title: 'The shaft', text: 'An oval shaft 89 m deep, wide enough for two drams side by side. Fresh air goes down here; the used air leaves by the Coity shafts beyond the fault.', hold: 11 });
  W.stop({ x: 162, y: PB + 2, z: 2, w: 50, title: 'Pit bottom', text: 'Hitchers push full drams into the cage and pull the empties out. Electric bulbs burn near the shaft, and the pumps and haulage gear are electric too.', hold: 11, hour: 9 });
  W.stop({ x: 221, y: PB + 1.5, z: 3, w: 30, title: 'The stables', text: 'Horses live below in stalls bedded with bracken cut on the hills, and each ostler looks after his share of them.', hold: 11 });
  W.stop({ x: 104, y: PB + 1.5, z: 2, w: 40, title: 'The road and the air doors', text: 'Drams creep along on the endless rope at walking pace. At the air doors a boy of thirteen or fourteen sits alone with his lamp, opening one door at a time.', hold: 11, hour: 8 });
  W.stop({ x: 22, y: PB + 1.0, z: 1.5, w: 36, title: 'The coal face', text: 'In a low seam, colliers hole under the coal with light picks, prop the roof every few feet and fill the drams that the horse takes away.', hold: 12, hour: 8 });
  W.stop({ x: 296, y: -52, z: 2, w: 240, title: 'Out with the air', text: 'Used air travels along the return airway, through the fault, to the old Coity shafts, where the new electric fan draws it up and out of the flared chimney.', hold: 11 });
  W.stop({ x: 120, y: -30, z: 2, w: 330, title: 'Night shift', text: 'After dark the pit never stops: repairers below, the ostler with his horses, the pumpsman, the fan and the boilers. In the cottage, the day shift sleeps.', hold: 12, hour: 22.5 });
}
