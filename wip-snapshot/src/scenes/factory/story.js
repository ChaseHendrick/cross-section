/* The Car Factory: captions (all facts from docs/research/factory.md, section 8), the guided tour
 * and the sounds. Fact cards carry the source URL the dossier's author opened.
 */
import { X, H, N } from './common.js';
import { ST } from './bldgH.js';
import { JR, NL } from './east.js';
import { HOURS } from './machines.js';


export function captions(k) {
  const L = (d) => k.label(d);
  // ---- the whole works
  L({ x: 205, y: 30, z: 0, title: 'Highland Park, November 1914', text: 'The works rearranged in the order a Model T was made. Buildings, floors and machines are real; their places on the site are not.', min: 1.5, max: 6, priority: 5, side: 'left' });
  L({ x: 22, y: 12, z: 2, title: 'Power house', text: 'Gas engines of Ford’s own design, with a new power plant going up on the roof.', min: 4, max: 12, priority: 3 });
  L({ x: 72, y: 9, z: 2, title: 'Gray-iron foundry', text: 'Cupolas, mould carriers, cores and cleaning: about 1,450 men.', min: 4, max: 12, priority: 3,
    body: 'Of about 1,450 foundry men, most were specialised labourers. A newcomer was expected to learn his one job in two days.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  L({ x: 158, y: 8, z: 2, title: 'Machine shop', text: 'One storey under a saw-tooth roof: tools, cylinder blocks, magnetos, motors and their test blocks.', min: 4, max: 12, priority: 3 });
  L({ x: 247, y: 18.5, z: 2, title: 'Building H, the “Crystal Palace”', text: 'Four storeys of glass, brick and concrete. The chassis lines run on the ground floor.', min: 4, max: 14, priority: 4,
    body: 'About three-quarters of the factory walls were glass in steel frames, and Building H earned the nickname “Crystal Palace”. The National Historic Landmark nomination calls it the site of the first moving automobile assembly line, late in 1913.', source: 'https://npgallery.nps.gov/NRHP/GetAsset/NHLS/73000961_text' });
  L({ x: 365, y: 24, z: 2, title: 'The new building', text: 'Six storeys, finished in August 1914: bodies painted, trimmed and topped on moving lines.', min: 4, max: 14, priority: 4,
    body: 'The two new six-storey buildings on Manchester Avenue were finished about 20 August 1914. From then on bodies were painted, upholstered and topped on moving chain lines inside them, and finished components were stored and shipped from the first floor.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n415' });
  // ---- power house
  L({ x: 16, y: 3.6, z: 5.5, title: '5,000 horsepower', text: 'Ford’s own gas engine drove the plant; a 1,500 hp engine turned a dynamo and an air compressor.', min: 12, priority: 2,
    body: 'Ford’s own 5,000-horsepower gas engine drove the plant. A 1,500-horsepower gas engine turned an 850-kilowatt dynamo and a 2,000 cubic foot air compressor.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n24' });
  L({ x: 22, y: 17, z: 4, title: 'A new power plant', text: 'Two floors going up over the engine hall: ash handling, and above it gas producers and boilers.', min: 9, priority: 2,
    body: 'Ford was building five combined gas-and-steam engines of 6,000 brake horsepower each, with gas cylinders 42 inches across and a 72-inch stroke. The floors added over the engine hall were for 30,000 hp of gas producers and 6,000 hp of steam boilers, with a 10 ft floor below them for ash handling.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n24' });
  // ---- foundry
  L({ x: 43.4, y: 12, z: 0.6, title: 'Iron at half past six', text: 'Four cupolas at work and a fifth being placed, cut open to show the coke and iron inside.', min: 9, priority: 2,
    body: 'The cupola blast went on about 6:10 in the morning and molten iron began to run at 6:30. The bottoms were dropped about 3:15 in the afternoon, sometimes later for cylinder pouring.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  L({ x: 69, y: 4.8, z: 2.6, title: 'Moulds on the move', text: 'Shelves hung from overhead chains carry the moulds past the pourers.', min: 12, priority: 2,
    body: 'Moulds rode on shelves hung from overhead chains, passing the pourers at about 12 feet a minute. Moulding machines stood under sand chutes in the space between the two loops, and the castings were knocked out over grates at the end.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n358' });
  L({ x: 89, y: 7, z: 7, title: 'The old way', text: 'Engine-block moulds made on the floor, poured from ladles hung from cranes.', min: 12, priority: 1,
    body: 'Engine-block moulds were still made on the floor under three parallel craneways and poured from ladles hung from electric cranes. S1 contrasts this floor’s “atmosphere of smoke and steam” with the clean carrier units.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n358' });
  L({ x: 103.4, y: 2.2, z: 3.2, title: 'Cleaning room', text: '62 tumbling barrels and 34 snagging wheels cleaned the new castings. One row of barrels is drawn.', min: 22, priority: 1 });
  L({ x: 118, y: 5.2, z: 1.0, title: 'Overhead monorail', text: 'Electric locomotives carry castings from the foundry, past heat treatment, to the machine shop.', min: 12, priority: 1 });
  // ---- machine shop
  L({ x: 121, y: 4.6, z: 5, title: '247 toolmakers', text: 'The skilled trade that made the jigs, fixtures and special machines.', min: 14, priority: 2,
    body: 'In February 1914 the tool-making department employed 247 toolmakers, making the jigs, fixtures and special machines the rest of the plant ran on. Their lathes and millers were belted from shafts overhead.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n26' });
  L({ x: 131.9, y: 3.2, z: 2.6, title: 'Fifteen blocks at once', text: 'An Ingersoll milling machine faces fifteen engine blocks in one batch.', min: 14, priority: 2,
    body: 'An Ingersoll milling machine milled the underside and bearing seats of 15 engine blocks in one batch. One survives at The Henry Ford.', source: 'https://www.thehenryford.org/collections/explore/articles/the-henry-fords-ingersoll-milling-machine-and-mass-production-at-highland-park' });
  L({ x: 164.6, y: 2.4, z: 3.0, title: 'The first moving line', text: 'Flywheel magnetos slide past the men at 44 inches a minute.', min: 14, priority: 3,
    body: 'In spring 1913 the flywheel magneto went onto a sliding line. Twenty-nine men each did one step instead of one man doing it all, and a magneto that had taken one man about 20 minutes took about 5 minutes of one man’s time. The chain was tried at 60 inches a minute (too fast), then 18 (too slow), then 44, which stayed.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n158' });
  L({ x: 183.6, y: 2.2, z: 2.4, title: 'Run in by electricity', text: 'Each new motor is turned over by an electric motor on a test block.', min: 16, priority: 2,
    body: 'Each new engine was turned over by an electric motor on a test block. None passed until it reached 750 revolutions a minute on 20 amperes at 230 volts. The tester then stamped his own letter on a screw head and painted another screw head red.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  L({ x: 191, y: 2.6, z: 1.5, title: 'Five dollars a day', text: 'The employment office: applicants, an interpreter, and 108,000 record envelopes.', min: 14, priority: 2,
    body: 'Announced on 5 January 1914, the plan added a profit share to wages for qualified workers. Within days crowds of job seekers were turned away with fire hoses.', source: 'https://www.thehenryford.org/collections/explore/articles/fords-five-dollar-day' });
  L({ x: 193.8, y: 5.4, z: 4, title: 'Learn English', text: 'Before the shift, the teacher holds up a kettle and the class says the word.', min: 18, priority: 2,
    body: 'Free English classes met before or after shifts. Pupils repeated words as the teacher held up a kettle or a bar of soap.', source: 'https://www.thehenryford.org/collections/explore/popular-research-topics/ford-motor-company-sociological-department-english-school' });
  // ---- Building H
  L({ x: 236, y: 1.7, z: H.lines[0], title: 'Six feet a minute', text: 'An endless chain between the rails pulls each chassis along.', min: 12, priority: 3,
    body: 'An endless chain pulled each chassis along the line at 72 inches (6 feet) a minute. The chassis slid on their axles along rails at waist height until the wheels went on near the end.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n164' });
  L({ x: 212, y: 1.2, z: H.lines[1], title: 'From 728 minutes to 93', text: 'Labour per chassis, standing still in 1913 and moving in 1914.', min: 14, priority: 2,
    body: 'In September 1913 a chassis took 12 hours 28 minutes of labour to build standing still. On 30 April 1914, on three moving lines, it took 1 hour 33 minutes.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n161' });
  L({ x: ST.engine, y: 3.3, z: H.lines[0], title: 'The motor arrives at station ten', text: 'Chain hoists on overhead tracks lower each motor onto its frame.', min: 16, priority: 2,
    body: 'Chain hoists on overhead tracks lowered each motor onto its frame at the tenth of 45 operations.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n162' });
  L({ x: ST.tank, y: 3.9, z: 2.2, title: 'One gallon to start', text: 'On the tank bridge each tank gets one gallon of gasoline.', min: 18, priority: 1,
    body: 'On the gasoline-tank bridge each tank received one gallon of gasoline before the chassis moved on.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  L({ x: 265, y: -0.6, z: H.lines[0], title: 'The man in the pit', text: 'Below the chassis, a workman caps the front-axle bracing globe.', min: 18, priority: 2,
    body: 'Near the end of the line a workman in a pit beneath the chassis capped the front-axle bracing globe.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n162' });
  L({ x: ST.starter, y: 2.0, z: H.lines[0], title: 'Starting the motor', text: 'Rear wheels on friction rollers; the radiator filled and the motor started.', min: 18, priority: 2,
    body: 'The rear wheels rested on a motor-starting drive. Two men filled the radiator and worked the starting lever before the car was driven away.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  L({ x: 294, y: 2.5, z: 3.05, title: 'Forty-five operations', text: 'At number 45 a driver takes the car out onto John R Street.', min: 14, priority: 2,
    body: 'Chassis assembly was split into 45 operations. At number 45 a driver took the car out onto John R Street.', source: 'https://www.gutenberg.org/cache/epub/7213/pg7213.txt' });
  L({ x: 219.5, y: H.y[2] + 2.6, z: 3, title: 'Spun dry', text: 'Wheels dipped in paint, then spun to throw off the surplus.', min: 16, priority: 1,
    body: 'Wheels rolled down a gravity track to centrifugal painting machines, were dipped, and spun at several hundred revolutions a minute to throw off the surplus. Tyres met them here and they went down chutes to the chassis line.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  // ---- John R Street
  L({ x: 300, y: 2.4, z: 3.05, title: 'Out of the door under its own power', text: 'Each finished chassis is driven out onto the John R Street track.', min: 12, priority: 3,
    body: 'Each finished chassis was driven out through a door onto John R Street and left on an angle-iron track, where it crept along toward the body chute. In early 1914 new cars came out at about 40-second intervals.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n173' });
  L({ x: JR.gallows + 1.5, y: 6.8, z: 3.05, title: 'The body chute', text: 'Bodies slide down from the platform; men under a rocking gallows frame lower each onto a chassis.', min: 12, priority: 3,
    body: 'Bodies slid down a chute from a platform. Men under a rocking gallows frame slung each one and lowered it onto a waiting chassis. Before the chute, four men lifted each body onto its chassis on the pavement.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n173' });
  L({ x: JR.idler, y: 1.2, z: 3.05, title: 'Testing on the track', text: 'Rollers on ball bearings let the motor drive the rear wheels while the car stands still.', min: 16, priority: 2,
    body: 'Rollers on ball bearings let the motor drive the rear wheels while the car stood still on the track, so the rear axle could be tested.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n173' });
  // ---- the new building
  L({ x: 372, y: 26.2, z: 18.3, title: 'Raw stuff up, cars down', text: 'Cranes lift rough stores to the top floors; work descends by gravity toward the railway.', min: 7, priority: 3,
    body: 'Cranes lifted rough stores to the top floors of the new buildings. Work then descended by gravity, floor by floor, toward the railway at the bottom of the craneway.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n412' });
  L({ x: 356, y: N.craneRail - 1.5, z: 18.3, title: 'Two 5-ton cranes', text: 'Riding 80 feet above the track, with four-cable suspension so loads do not sway.', min: 12, priority: 2,
    body: 'Each craneway had two 5-ton electric cranes riding 80 feet above the track, with a hook lift of about 75 feet. Four-cable suspension stopped the loads from swaying.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n423' });
  L({ x: 366, y: N.y[4] + 2.6, z: NL.paint.z, title: 'Painting on the move', text: 'Bodies ride a chain track past the primer booths and the flow-on hood.', min: 14, priority: 3,
    body: 'Bodies travelled about 25 feet a minute along an 850-foot painting track that wound over three floors. A masked man sprayed brown metal primer with a giant atomiser; the blue-black second coat was flowed on from nozzles fed by gravity from a tank on the floor above.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n384' });
  L({ x: 341, y: N.y[3] + 2.4, z: 3.6, title: 'Women at the machines', text: 'The women’s body-top-making department, fourth floor.', min: 14, priority: 2,
    body: 'Women made car tops on the fourth floor of the south building. Their pay ran from 32 cents an hour upward.', source: 'https://archive.org/details/fordmethodsandf00faurgoog/page/n425' });
  L({ x: 197.4, y: 2.9, z: 10, title: 'The shortage chaser', text: 'A young man hunts missing parts and chalks each department’s output on the board.', min: 18, priority: 1,
    body: 'A young man hunted down missing parts all day and chalked each department’s output on a blackboard at fixed hours: 8:30, 11:40 and 2:30. A second chaser worked the night shift.', source: 'https://archive.org/download/fordmethodsandf00faurgoog/fordmethodsandf00faurgoog_djvu.txt' });
  void X;
}

export function tour(W) {
  const S = (d) => W.stop(Object.assign({ hold: 11 }, d));
  S({ x: 205, y: 12, z: 4, w: 460, hour: 10.4, title: 'Highland Park, November 1914', text: 'Ford’s works, rearranged in the order a Model T was made: power, iron, machining, the chassis lines, the street where bodies meet chassis, and the new building where bodies are painted and trimmed.' });
  S({ x: 193, y: 4.5, z: 4, w: 16, hour: 5.95, title: 'Before the shift', text: 'Upstairs over the employment office, a free English class meets before work. The teacher holds up a kettle; the class says the word.' });
  S({ x: 36, y: 6, z: 4, w: 46, hour: 6.6, title: 'Iron at half past six', text: 'The cupola blast went on at ten past six and the iron is running. Next door the gas engines turn day and night, and two new floors rise over the engine hall.' });
  S({ x: 72, y: 3, z: 5, w: 40, hour: 9.2, title: 'The foundry', text: 'Moulds ride past the pourers on shelves hung from moving chains. Beyond, engine-block moulds are still made on the floor the old way, poured from crane ladles.' });
  S({ x: 166, y: 3, z: 5, w: 40, hour: 10.0, title: 'The first moving line', text: 'Flywheel magnetos slide past a row of men at 44 inches a minute. Next door, motors are assembled, then run in on test blocks before they cross into Building H.' });
  S({ x: 236, y: 2.5, z: 5, w: 46, hour: 11.6, title: 'Six feet a minute', text: 'The chassis creep along on a chain. A motor comes down by hoist, then the dash, the wheels down their chutes, the radiator, the man in the pit, and the starter.' });
  S({ x: 309, y: 4, z: 4, w: 34, hour: 13.2, title: 'Bodies meet chassis on the street', text: 'Driven out of door D, each chassis creeps along John R Street until a body comes down the chute from the new building and is lowered onto it.' });
  S({ x: 366, y: 13, z: 8, w: 76, hour: 14.0, title: 'Raw stuff up, cars down', text: 'In the new building, cranes lift stores to the top floors and the work comes down floor by floor: painting, upholstering, tops, and shipping by rail.' });
  S({ x: 300, y: 10, z: 6, w: 170, hour: 21.8, title: 'The second shift', text: 'Most production departments work two shifts. Line 1 runs until twenty to midnight, the foundry pours on, and the craneway glows blue-white under its mercury lamps.' });
  S({ x: 60, y: 8, z: 3, w: 60, hour: 23.2, title: 'The night bed', text: 'After ten, five night men clean out under the cupolas and build the coke bed for the morning. In the power house the engines never stop.' });
}

export function sounds(W) {
  W.sound({ kind: 'engine', x: 22, y: 2, z: 6, r: 30, gain: 0.5, hz: 38 });
  W.sound({ kind: 'fire', x: 43, y: 2, z: 1, r: 18, gain: 0.45, when: (w) => HOURS.tapping(w.hour) });
  W.sound({ kind: 'machine', x: 69, y: 4, z: 3, r: 20, gain: 0.25, rate: 0.6, pitch: 300 });
  W.sound({ kind: 'machine', x: 103, y: 1, z: 3, r: 14, gain: 0.3, rate: 3, pitch: 140, when: (w) => HOURS.foundry(w.hour) });
  W.sound({ kind: 'hum', x: 122, y: 4, z: 5, r: 18, gain: 0.25, hz: 110, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'hum', x: 183, y: 1, z: 3, r: 12, gain: 0.3, hz: 190, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'machine', x: 236, y: 1, z: 3, r: 30, gain: 0.3, rate: 1.4, pitch: 520, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'machine', x: 203, y: H.y[3] + 1, z: 3.4, r: 14, gain: 0.3, rate: 0.4, pitch: 90, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'engine', x: ST.starter, y: 1, z: 3, r: 12, gain: 0.25, hz: 70, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'engine', x: JR.idler, y: 1, z: 3, r: 14, gain: 0.25, hz: 75, when: (w) => HOURS.both(w.hour) });
  W.sound({ kind: 'hum', x: 365, y: 24, z: 18, r: 30, gain: 0.2, hz: 60 });
  W.sound({ kind: 'chuff', x: 445, y: 2, z: 18, r: 30, gain: 0.35, rate: 1.6, when: (w) => w.hour >= 21 || w.hour < 5 });
}
