/* The Opera House: the New Opera in Paris (today called the Palais Garnier) on a gas-lit
 * performance night, Wednesday 8 March 1876, in its first full season. Faust is on.
 *
 * Sources: docs/research/opera.md (Nuitter, Le Nouvel Opera, 1875; Baedeker 1878 and 1884;
 * fr.wikipedia; Chronopera). All named characters are fictional.
 *
 * Layout plan (metres; x north along the axis from the main facade, y above the Place,
 * z = depth west of the axis, which is the cut; we look west from the east side):
 *   x -60..-7   the Place de l'Opera with gas candelabra and carriages; perron x -7..0
 *   x 0..29     facade block: portico (0..8.5) and grand vestibule (9.5..17) at y 1.6;
 *               controle (17..23) at 3.2; loggia (0..9) and Grand Foyer (10..20, vault to 30)
 *               at y 12; avant-foyer (21..29); attic stores under the roofs; far wall z 33
 *   x 29..50    grand staircase: Pythia at the Rotonde level (0.3), grand flight 3.2 -> 8,
 *               landing at 8, double flights to 12, balconies to 25, lantern 30..35; z to 16
 *   x 50..86.5  auditorium: horseshoe about (71.5, 0), box fronts r 11, backs r 15,
 *               corridors to r 20.5, six tiers at 8, 11.5, 15, 18.5, 22, 25; ceiling 28..30;
 *               chandelier 20.6..25.8; dome to 53; Rotonde des abonnes under the stalls (0.3)
 *   x 80..88.5  orchestra pit (6.5), footlights, prompter, jeu d'orgue (4.0), musicians' foyer
 *   x 86.5..116.5 stage house: stage 88.5..115 raked from 8.5; flies from 29, grils 46,
 *               49.5, 53; roof ridge 56 with Apollo to 63.5; understage floors 5.6, 2.7,
 *               -0.2, -3.3, -6.5; cistern -10.13 with water to -8.8; foundation wells to -18
 *   x 116.5..139 corridor and scenery lift; chorus hall (0.5), extras (6.5), Foyer de la
 *               Danse (9.7, raked), costume store (20), workshops (25.6); z to 12
 *   x 139..155  administration: battery laboratory and stage door (2), offices, dressing
 *               rooms [placement illustrative]; courtyard 155..170
 *   Cellars (y -6) under the front of the house, x 0..79, with the furnaces.
 *   Cuts: 21 (facade block), 50 (staircase/auditorium), 87.5 (proscenium), 116 (back wall), 139.
 */
import { XS } from '../engine/index.js';
import { ground, frontBlock, stairHall, houseShell, stageShell, backShell, statues, pavilion } from './opera/shell.js';
import { house } from './opera/house.js';
import { stagehouse, scenery } from './opera/stagehouse.js';
import { front } from './opera/front.js';
import { back } from './opera/back.js';
import { people } from './opera/people.js';
import { lifeParts, lifeSetup, lifeUpdate, lifeHalos } from './opera/life.js';
import { Y, AX, showAt, ring, stageY, ST0, inH } from './opera/common.js';

const PARTS = {};
const CUTS = [21, 50, 87.5, 116.5, 139];

function build(k) {
  ground(k);
  frontBlock(k);
  stairHall(k);
  houseShell(k);
  stageShell(k);
  backShell(k);
  statues(k);
  pavilion(k);
  house(k);
  stagehouse(k);
  front(k);
  back(k);
  scenery(k);
  // The chandelier's own light pooled in the house at night.
  k.lamp(AX, 22.5, 3, { r: 18, i: 1.1, color: '#ffd890', bulb: false, halo: false });
  for (const [x, y, z] of [[63, 12, 7], [63, 20, 7], [75, 12, 9], [75, 20, 9], [68, 26, 6], [80, 16, 4]]) k.lamp(x, y, z, { r: 10, i: 0.55, color: '#ffcf88', bulb: false, halo: false });
  // General glow of the gas on the stage, in the flies and in the big public rooms.
  for (const [x, y, z, r] of [[96, 12, 3, 11], [106, 12, 6, 11], [100, 30, 14, 14], [100, 40, 14, 12], [39.5, 10, 6, 13], [39.5, 21, 8, 12], [15, 16, 10, 12], [15, 16, 20, 11], [130, 13, 4, 9]]) k.lamp(x, y, z, { r, i: 0.5, color: '#ffd090', bulb: false, halo: false });
  Object.assign(PARTS, lifeParts(k));
  captions(k);
}

// ------------------------------------------------------------------ captions
function captions(k) {
  const L = (d) => k.label(d);
  // The whole building (shown in the margins at the overview).
  L({ x: 30, y: 40, z: 0, title: 'The New Opéra, 1876', text: 'Charles Garnier’s opera house, inaugurated on 5 January 1875. Tonight, Wednesday 8 March 1876: Faust.', priority: 6, side: 'left',
    body: 'From the first of the ten steps of the perron to the great door of the administration at the back, the New Opéra measures 172.70 metres. It seats 2,156, against 1,771 in the old house in the rue Le Peletier. In 1876 the company was the Théâtre national de l’Opéra.',
    source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: PROS_X(), y: 64, z: 0, title: 'Apollo', text: 'He lifts his golden lyre 63 metres above the square. The bronze group weighs 13 tonnes and is also a lightning conductor.', priority: 5, side: 'right',
    body: 'Apollo with his lyre stands on the south gable of the stage house, 7.50 m tall and 13 t of bronze with a gilded lyre, and serves as a lightning conductor. The stage roof is 55.97 m above the Place, so the lyre rises about 63 m.', source: ['https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier', 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ'] });
  L({ x: 102, y: 10.5, z: 0.5, title: 'Tonight: Faust', text: 'Gounod’s Faust, the most performed opera at the house. Five acts, lasting until nearly midnight.', priority: 4, side: 'right',
    body: 'The Opéra’s performance calendar lists Faust for Wednesday 8 March 1876. The house played on Mondays, Wednesdays and Fridays, and in winter on Saturdays too; performances lasted till nearly midnight (Baedeker).', source: ['http://chronopera.free.fr/', 'https://archive.org/details/parisenvironshand00karl'] });
  L({ x: 100, y: -8.6, z: 2, title: 'The cistern', text: 'The “lake” of legend: a flooded brick cellar, the firemen’s reservoir.', priority: 4, side: 'right',
    body: 'Digging the foundations hit groundwater. Pumps ran day and night for eight months; then Garnier built a watertight tank of concrete instead. It became the firemen’s reservoir. Its floor lies 10.13 metres below the Place de l’Opéra.', source: ['https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier', 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ'] });
  L({ x: 71.5, y: 20.2, z: 0, title: 'The chandelier', text: '340 gas lights in bronze and crystal.', priority: 4, min: 3,
    body: 'The chandelier carries 340 gas lights in bronze and crystal (Nuitter elsewhere counts 412 jets). The lowest bidder cast it for 30,000 francs, about 10,000 less than it was worth. It hangs on steel cables with winches and counterweights.', source: ['https://archive.org/details/bub_gb_HCY6AAAAIAAJ', 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier'] });
  L({ x: 28, y: -4.5, z: 6, title: 'Furnaces', text: 'Fourteen calorifères in the cellars can burn 10 tonnes of coal a day.', priority: 3, min: 8, side: 'left',
    body: 'Fourteen furnaces in the cellars can burn up to 10 tonnes of coal a day, sending hot water to the stage and dressing rooms and hot air to the public rooms. The offices and dressing rooms also have 450 fireplaces.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  // Room by room (as the viewer zooms in).
  const m = 12;
  L({ x: -3.5, y: 1.4, z: 4, title: 'The perron', text: 'Ten broad steps up from the Place.', min: m });
  L({ x: 0.5, y: 37.5, z: 29.5, title: 'Gilded groups', text: 'Harmony and Poetry crown the ends of the facade, each 7.5 metres tall, gilded by electroplating in Christofle’s workshops.', min: 8,
    body: 'The two groups at the ends of the facade attic, Harmony and Poetry by Gumery, are each 7.5 m tall and were gilded by electroplating in Christofle’s workshops.', source: 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier' });
  L({ x: 13.2, y: 5.4, z: 5.6, title: 'Four composers', text: 'Lully, Rameau, Gluck and Handel guard the entrance. Our half shows two of them.', min: m,
    body: 'Four seated statues guard the grand vestibule: Lully, Rameau, Gluck and Handel, for the music of Italy, France, Germany and England.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 21.4, y: 4.6, z: 2.6, title: 'The “salt boxes”', text: 'Theatre slang for the checkers’ counters: smelling salts were kept here for tightly corseted ladies who fainted.', min: m,
    body: 'The ticket checkers’ counters of the contrôle are nicknamed “salt boxes”: smelling salts were kept in them for tightly corseted ladies who fainted.', source: 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier' });
  L({ x: 37, y: 6.4, z: 2.4, title: 'The grand staircase', text: 'White Seravezza marble steps, an onyx handrail, red antique balusters on bases of green Swedish marble.', min: 8,
    body: 'The steps are of white Seravezza marble, the handrail of onyx, the balusters of red antique marble on bases of green Swedish marble.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 38.6, y: 16, z: 11.5, title: 'Sarrancolin columns', text: 'For thirty perfect columns, the quarrymen cut more than fifty blocks and threw out twenty with cracks.', min: m,
    body: 'To get thirty perfect monoliths of Sarrancolin marble for the staircase, quarrymen cut more than fifty blocks and threw out twenty with cracks. Each column cost 4,200 francs.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 40, y: 23.5, z: 11.2, title: 'A stage for the audience', text: 'Garnier wanted people leaning on every balcony to make the walls “live”, like a painting by Veronese.', min: 8,
    body: 'Garnier designed the staircase as a stage for the audience itself: the people leaning on every balcony would make the walls “live”, like a painting by Veronese.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 44.5, y: 3.9, z: 0.4, title: 'The Pythia', text: 'The bronze oracle of Apollo, by “Marcello”, the pen name of the Duchess of Castiglione-Colonna.', min: m,
    body: 'Under the landing stands the bronze Pythia, oracle of Apollo, over a basin with flowers. Its sculptor signed as “Marcello”: the Duchess of Castiglione-Colonna.', source: 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier' });
  L({ x: 15, y: 26.5, z: 3, title: 'The Grand Foyer', text: '54 metres long, 13 wide and 18 high, in old gold rather than bright gilt.', min: 8,
    body: 'The Grand Foyer is 54 metres long, 13 wide and 18 high. Nuitter calls its colour old gold, not bright gilt. Paul Baudry spent eight years painting for it.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 19.75, y: 24.4, z: 4.2, title: 'Garnier as Apollo', text: 'His assistants secretly had two gilded heads of Apollo carved with the architect’s face.', min: 40 });
  L({ x: 4.5, y: 21.6, z: 3.6, title: 'The loggia', text: 'Its ceiling medallions were the first outdoor mosaics made in France.', min: m,
    body: 'The loggia’s ceiling medallions of enamel mosaic were the first outdoor mosaics made in France; the five in the centre came from Salviati’s workshop in Venice.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 65.5, y: 3.2, z: 6, title: 'Rotonde des abonnés', text: 'Subscribers drive straight in under the auditorium; their servants wait on benches between sixteen columns of Jura stone.', min: 8,
    body: 'Subscribers’ carriages drive in under the auditorium. Their servants wait in this round vestibule on benches between sixteen fluted columns of Jura stone. Garnier signed his building in the arabesques of its vault.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 64, y: 18, z: 10, title: 'Red and gold', text: 'The colours of the house, chosen to flatter the ladies’ gowns. 2,156 seats.', min: 8, side: 'left',
    body: 'Red and gold govern the auditorium, chosen to flatter ladies’ gowns. The New Opéra seats 2,156, against 1,771 in the old house.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 64, y: 29.2, z: 3, title: 'A copper sky', text: 'Lenepveu painted the hours of the day and night on 24 copper panels hung from the roof on iron rods.', min: m,
    body: 'The ceiling is a bowl of 24 copper panels hung from the roof on iron rods, on which Lenepveu painted the hours of the day and night: the sun over the stage, the moon opposite.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 71.5, y: 38, z: 1.5, title: 'The chandelier is a chimney', text: 'The heat of its flames pulls stale air up an iron flue that ends in the lantern of the dome.', min: m,
    body: 'The chandelier also ventilates the house: the heat of its gas flames draws stale air up an iron flue that opens in the lantern of the dome. Air could be renewed at up to 80,000 cubic metres an hour.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 60.6, y: 26.8, z: 2.5, title: 'Turned down to blue', text: 'Gas cannot make a theatre dark: during the acts the house lights are only turned down “to blue”.', min: m,
    body: 'With gas, a theatre cannot be made dark. During the acts the house lights are only turned down “to blue”, the supply kept just high enough for a small blue flame.', source: ['https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier', 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ'] });
  L({ x: 67, y: 9.3, z: 2.5, title: 'The claque', text: 'Paid applauders under the chandelier, who clap on their chief’s signal.', min: m,
    body: 'Under the chandelier sits the claque, paid applauders who come in by the stage door in groups of five, before the public, watched by their chief. Baedeker noted “the obtrusive and simultaneous vigour of their exertions”.', source: ['https://archive.org/details/bub_gb_HCY6AAAAIAAJ', 'https://archive.org/details/parisanditsenvi00baedgoog'] });
  L({ x: 76.5, y: 8.8, z: 5.5, title: 'Orchestra stalls', text: 'No ladies here, and evening dress required: a stall costs 13 francs, a place in the pit 7.', min: m,
    body: 'Only gentlemen are admitted to the orchestra stalls, and evening dress is obligatory there and in the first gallery. A stall costs 13 francs, a place in the pit 7 (Baedeker).', source: ['https://archive.org/details/parisenvironshand00karl', 'https://archive.org/details/parisanditsenvi00baedgoog'] });
  const sb = ring(Math.PI * 0.72, 12.5, 13.2);
  L({ x: sb[0], y: sb[1], z: sb[2], title: 'Subscribers’ boxes', text: 'The ballet never comes in the first act: the gentlemen of the Jockey Club are still at dinner.', min: m,
    body: 'Members of the Jockey Club, with their club rooms in the rue Scribe, dined late and skipped the first act, so the ballet was never placed in it.', source: 'https://en.wikipedia.org/wiki/Jockey-Club_de_Paris' });
  L({ x: 85.4, y: 5.8, z: 4.8, title: 'The “gas organ”', text: 'A bank of pipes and taps under the stage front. One graduated wheel brings day or night to any part of the stage.', min: m,
    body: 'The jeu d’orgue is a bank of pipes and taps under the front of the stage. One graduated wheel opens or closes the gas to any part of the stage; a regulator with a water gauge keeps the jets from flaring. Two supply mains never fall below the pressure for a blue flame, so night can fall quickly without blowing the jets out.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 86, y: 9.4, z: 3.2, title: 'Footlights', text: 'They burn upside down, each flame drawn into a chimney, so a dancer’s skirt can brush the glass.', min: m,
    body: 'The footlights burn upside down: each flame is drawn downward into a chimney, so the glass stays cool and a dancer’s skirt can brush it. The dancer Emma Livry died after her skirt caught fire on a gaslight in 1862.', source: ['https://archive.org/details/bub_gb_HCY6AAAAIAAJ', 'https://en.wikipedia.org/wiki/Emma_Livry'] });
  L({ x: 40, y: -1.0, z: 15, title: 'Gas mains', text: 'Ten gas meters serve up to 9,200 jets through 25 kilometres of pipe and 714 taps.', min: m,
    body: 'Ten gas meters feed up to 9,200 jets through 25 kilometres of pipe and 714 taps. The night-light jets that burn after the show are the only lights left at night.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: ST0 + 1.2, y: 25.6, z: 10, title: 'Electric light', text: 'Still a stage effect here: an arc lamp fed by 70 Bunsen cells in a laboratory far away on the ground floor.', min: m,
    body: 'In 1876 electric light at the Opéra is a stage effect: arc lamps in wooden lanterns with a lens and mirror, fed by 70 Bunsen cells in a ground-floor laboratory 122 metres from the far end of the stage. The whole building went electric only in 1887.', source: ['https://archive.org/details/bub_gb_HCY6AAAAIAAJ', 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier'] });
  L({ x: 104, y: 12.2, z: 9.5, title: 'The stage', text: '26 metres deep and 53 wide, sloping toward the audience by almost 5 centimetres every metre.', min: 8,
    body: 'The stage is 26.37 m deep and 52.90 m wide, of oak boards, raked toward the audience by almost 5 cm per metre. Its floor is cut into rues, fausses-rues and slots through which scenery rises from below.', source: 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier' });
  L({ x: 95, y: 21.5, z: 16, title: 'Machinists', text: 'Seventy work a normal night, every change by hand, rope and counterweight.', min: m,
    body: 'Seventy machinists work a normal night, often more: the ship scene of L’Africaine needed forty extra carpenters underneath. Hydraulic machinery was studied and abandoned; everything is worked by hand.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 99.5, y: 2.6, z: 6, title: 'Drums', text: 'Wooden drums two metres across gather many ropes, so a whole set can change before the audience’s eyes.', min: m,
    body: 'Horizontal wooden drums two metres across gather many lines, so that one movement shifts a whole scene “in sight” in seconds.', source: 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier' });
  L({ x: 102, y: 47.2, z: 6, title: 'The grils', text: 'Three slatted floors of blocks and drums: 223 kilometres of hemp rope run through the house.', min: m,
    body: 'The stage machinery uses 223 kilometres of hemp rope, plus wire ropes twisted from 7,563 kilometres of iron wire. Reservoirs for fighting fire stand at the level of the third gril.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 101, y: 26, z: 24.6, title: 'Counterweight chimneys', text: 'Open lattice shafts from the foundations to the roof; the house has 65 tonnes of lead and 47 of cast iron in weights.', min: m });
  L({ x: 88.4, y: 23.6, z: 8.2, title: 'Iron mesh curtain', text: 'The fire curtain between stage and house is of iron mesh. A solid iron curtain replaced it only in 1896.', min: m,
    body: 'The fire curtain between stage and house is of iron mesh. A solid iron curtain replaced it only in 1896.', source: ['https://archive.org/details/bub_gb_HCY6AAAAIAAJ', 'https://fr.wikipedia.org/wiki/Op%C3%A9ra_Garnier'] });
  L({ x: 130, y: 18.2, z: 3, title: 'Foyer de la Danse', text: 'The dancers’ warm-up room. Its floor slopes like the stage and is never waxed.', min: 8,
    body: 'The Foyer de la Danse is where the dancers warm up. Its floor slopes exactly like the stage and is never waxed. The mirror on its end wall is in three pieces: Saint-Gobain had no table big enough to cast it whole. Subscribers with three nights a week may come here between the acts, a custom dating from 1770.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 128.5, y: 10.5, z: 10.4, title: 'In the basket', text: 'Spare shoes, a shoehorn, gum, rice powder, a little bottle of water, rosin.', min: 30,
    body: 'A dancer’s basket holds spare shoes, a shoehorn, gum, rice powder, a little bottle of water and rosin. Before her entrance she whitens her arms and crushes rosin under her shoe.', source: 'https://archive.org/details/bub_gb_HCY6AAAAIAAJ' });
  L({ x: 130, y: 8.6, z: 5, title: 'The extras', text: 'Most are workmen earning a second wage after the day’s work. They hand in a copper token at the door.', min: m });
  L({ x: 119, y: 10.6, z: 6, title: 'The scenery lift', text: 'Worked by winches and counterweights, it took twenty minutes to rise. Horses went up in it too.', min: m });
  L({ x: 130, y: 23.5, z: 3, title: 'Costumes', text: 'Double rows of cupboards; above, workshops with room for sixty tailors and seamstresses.', min: m });
  L({ x: 143.5, y: 4.6, z: 2.5, title: 'Battery laboratory', text: 'Six oak tables topped with thick glass, seventy Bunsen cells, vats of acid. Its exact place here is a guess.', min: m });
  L({ x: 155.5, y: 4.8, z: 1.4, title: 'The stage door', text: 'Every trade arrives here in turn: machinists, firemen, gasmen, the claque, dressers, extras, chorus, dancers with their mothers, singers, musicians.', min: 8 });
  L({ x: 147, y: 28.5, z: 2, title: 'Administration', text: 'The director, the accounts and the stage staff. The dressing rooms placed here are an assumption of this drawing.', min: 8 });
  L({ x: 71.5, y: 36, z: 37.5, title: 'The Emperor’s pavilion', text: 'Linked to the head of state’s box beside the stage, on this (jardin) side. In 1876 it is still unfinished, its stones left rough.', min: 7 });
  L({ x: -30, y: 5.6, z: 4, title: 'Place de l’Opéra', text: 'Cleared of four to five hundred houses. Its gas candelabra burned until 1954.', min: 6 });
  L({ x: 24.5, y: 17.6, z: 9.6, title: 'Not finished', text: 'Rooms left unfinished for lack of money were closed off with hangings.', min: 30 });
  L({ x: 112.5, y: Y.gril[2] + 0.8, z: 6, title: 'The gril cat', text: 'An invention of this drawing: no record of an Opéra cat has been found.', min: 40 });
  L({ x: 126, y: 10.3, z: 11.5, title: 'A real rat', text: 'The youngest dance pupils were nicknamed “rats”. This is the other kind.', min: 40 });
}
function PROS_X() { return 86.2; }

// ------------------------------------------------------------------ the living world
function setup(W, stage) {
  const G = people(W, stage);
  W.data.meph = W.people.find((p) => p.name && p.name.startsWith('Barth'));
  W.data.zelie = W.people.find((p) => p.name && p.name.startsWith('Zélie'));
  lifeSetup(W, PARTS);
  void G;
  // The guided tour.
  W.stop({ x: 72, y: 22, z: 4, w: 200, hour: 19.25, title: 'The New Opéra', text: 'Wednesday 8 March 1876, a quarter past seven. The house is filling for Faust. Every trade in the building has come in by the stage door; the gas is lit, from the Place to the grils.', hold: 12 });
  W.stop({ x: -8, y: 6, z: 4, w: 46, hour: 18.9, title: 'Arrivals', text: 'Carriages wheel round on the Place; the pit regulars have queued for an hour. Up ten steps, through the portico, past the four composers and the “salt boxes” of the contrôle.', hold: 11 });
  W.stop({ x: 39, y: 15, z: 4, w: 34, hour: 20.75, title: 'The staircase in the interval', text: 'Garnier built the staircase as a stage for the audience. In the intervals every balcony is lined with people looking at one another.', hold: 11 });
  W.stop({ x: 71, y: 18, z: 4, w: 40, hour: 21.2, title: 'Red and gold', text: 'Under the copper sky of the ceiling and its gas chandelier, 2,156 seats in boxes, stalls and pit. During the acts the house lights are only turned down to blue.', hold: 12 });
  W.stop({ x: 101, y: 22, z: 6, w: 58, hour: 22.95, title: 'Walpurgis Night', text: 'On stage the ballet; above, the fly men on their galleries and the arc lamp on its bridge; below, the understage of drums, chariots and traps, all worked by hand.', hold: 12 });
  W.stop({ x: 101, y: -4, z: 4, w: 40, hour: 20.68, title: 'A change of scene', text: 'In the interval the drums turn, the backdrop flies out and the next one comes down, while the wing flats slide away on their chariots. Below the lowest floor lies the cistern.', hold: 12 });
  W.stop({ x: 130, y: 14, z: 4, w: 26, hour: 21.85, title: 'Foyer de la Danse', text: 'Dancers warm up at the barre on a floor raked like the stage; their mothers knit on the banquettes, and subscribers come visiting between the acts.', hold: 11 });
  W.stop({ x: 86, y: 6, z: 3, w: 12, hour: 22.3, title: 'The gas organ', text: 'Under the stage front, one man at a graduated wheel brings day or night to any part of the stage, while the prompter whispers from his hood above.', hold: 10 });
  W.stop({ x: 100, y: 10, z: 4, w: 46, hour: 13.2, title: 'By day', text: 'An afternoon rehearsal with a piano on a platform and no costumes: the chorus brandish canes and umbrellas for swords. Upstairs the seamstresses sew by the windows.', hold: 11 });
  W.stop({ x: 72, y: 15, z: 4, w: 190, hour: 1.6, title: 'After midnight', text: 'The carriages have gone and the gas is down to the night-light jets. A fireman makes his round with a lantern, from the grils to the water of the cistern.', hold: 12 });
}

// Put everyone where their routine says they should be at this hour (at load, and after
// the clock jumps, as it does between tour stops), so nobody spends an act walking in.
function warp(W) {
  for (const p of W.people) {
    if (!p.routine) continue;
    const i = p.routine.findIndex((st) => !st.when || inH(W.hour, st.when[0], st.when[1]));
    if (i < 0) continue;
    const at = p.routine[i].at, pos = W.resolve(at);
    p.x = pos.x; p.y = pos.y; p.z = pos.z;
    p.node = typeof at === 'string' && W.nav.get(at) ? at : null;
    p.step = -1; p.moving = false; p.path = null; p.stepT = 0;
  }
}

function update(W, dt, t) {
  const h = W.hour, S = showAt(h);
  const last = W.data.lastHour;
  if (last == null || Math.abs(((h - last + 36) % 24) - 12) > 0.3) warp(W);
  W.data.lastHour = h;
  for (const p of W.people) {
    const off = p.x < -53 || p.x > 173 || p.z < -1.5;
    p.hidden = off || (p.vis ? !p.vis(h, S) : false);
  }
  lifeUpdate(W, dt, t);
}

function snapCut(x) {
  let b = x, d = 3;
  for (const c of CUTS) if (Math.abs(c - x) < d) { d = Math.abs(c - x); b = c; }
  return Math.round(b * 10) / 10;
}

XS.scenes.register({
  id: 'opera', order: 120, title: 'The Opera House', subtitle: 'The New Opéra, Paris, on a night of Faust, March 1876',
  blurb: 'From the flooded cistern beneath the stage to Apollo on the roof, on a gas-lit night of Faust.',
  bounds: { x0: -62, x1: 182, y0: -20, y1: 70, z0: 0, z1: 40 },
  frame: { x0: -24, x1: 172, y0: -19, y1: 66, z0: 0, z1: 10 },
  view: { yaw: -0.22, pitch: 0.16 },
  thumb: { hour: 20.4, zoom: [70, 20, 120, 3] },
  startHour: 20.25,
  daySeconds: 2160,
  wind: 1.4,
  clouds: 0.5,
  fog: [300, 2400, 0.5],
  lampGain: 2.6,
  ambient: { sky: '#e6e8ea', ground: '#b8ac98' },
  ambience: { crowd: 0.25, wind: 0.25, room: 0.2, reverb: 0.3, size: 2.4 },
  suggestedCuts: CUTS,
  snapCut,
  cutRange: [-6, 168],
  sliceGap: 9,
  focusDepth: 3,
  build, setup, update,
  halos: lifeHalos,
});

void stageY;
