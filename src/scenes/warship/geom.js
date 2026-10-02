/* HMS Victory, 1805: hull form and shared dimensions for the warship scene.
 *
 * Scene coordinates (metres): x along the ship, bow to the LEFT at x = 0 (stem at
 * lower-gun-deck height), stern to the right (taffrail about x 59); y up from the
 * underside of the keel; z = depth behind the centreline cut (we look at the inside
 * of the starboard side). Verified anchors from docs/research/warship.md: gun deck
 * 56.7 m, keel 46.5 m, beam 15.8 m, depth in hold 6.55 m, draught about 7.6 m,
 * lower sills 1.4 m above water, main truck 62.5 m above water. Everything else is a
 * layout estimate fitted to those.
 */
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

// Deck heights (top of planking).
export const Y = { hold: 1.8, orlop: 6.4, wl: 7.6, lower: 8.4, middle: 10.5, upper: 12.6, fc: 14.7, qd: 14.7, poop: 16.7 };
export const DT = 0.25; // deck planking + beam shelf
export const BEAM = 0.18; // depth of the deck beams below the planking
export const MAST = { fore: 8.0, main: 30.5, mizzen: 45.0 };
export const WL = 7.6;

// Midship half-breadth by height: round bilge, widest just above the waterline, then
// the tumblehome that pulls the upper works in.
const BT = [[0, 0.35], [0.4, 1.4], [1.0, 3.0], [1.8, 4.6], [2.8, 5.8], [4.0, 6.7], [5.3, 7.3], [6.5, 7.7], [7.6, 7.88], [8.8, 7.92], [10, 7.86], [11, 7.72], [12, 7.52], [13, 7.27], [14, 6.98], [15, 6.72], [16.3, 6.45], [17.5, 6.25], [19.5, 6.0], [22, 5.8]];
export function B(y) {
  if (y <= BT[0][0]) return BT[0][1];
  for (let i = 1; i < BT.length; i++) if (y <= BT[i][0]) { const [y0, b0] = BT[i - 1], [y1, b1] = BT[i]; return lerp(b0, b1, (y - y0) / (y1 - y0)); }
  return BT[BT.length - 1][1];
}

// The stem: a round forefoot from the keel (x 7.5) up to x 0 at lower-deck height,
// then raking forward to the head at y 12.6.
export function stemX(y) {
  if (y <= 8.4) { const u = 1 - y / 8.4; return 7.5 - 7.5 * Math.sqrt(Math.max(0, 1 - u * u)); }
  return -(Math.min(y, 12.6) - 8.4) * 0.25;
}
// The stern: sternpost raking slightly aft, a sharp counter at 8 to 9.6, then the
// stern galleries raking aft to the taffrail.
export function sternX(y) {
  if (y <= 8) return 54 + y * 0.19;
  if (y <= 9.6) { const u = (y - 8) / 1.6; return 55.52 + 0.9 * Math.sin((u * Math.PI) / 2); }
  return 56.42 + (y - 9.6) * 0.27;
}
const invert = (fn, x, lo, hi, inc) => {
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const v = fn(m); if ((v < x) === inc) lo = m; else hi = m; }
  return (lo + hi) / 2;
};
// Lowest point of the hull on the centreline at x.
export function bottomY(x) {
  if (x >= 7.5 && x <= 54) return 0;
  if (x < 7.5) { if (x <= stemX(12.6)) return 12.6; return invert(stemX, x, 0, 12.6, false); }
  if (x >= sternX(20)) return 20;
  return invert(sternX, x, 0, 20, true);
}
// Top of the side (rail) at x.
export function topY(x) {
  if (x < -0.3) return 12.6;
  if (x < 47.6) return 16.3;
  if (x < 48.4) return 16.3 + ((x - 47.6) / 0.8) * 1.9;
  return 18.2 + (Math.max(0, x - 48.4) / 10.6) * 0.8;
}
function fBow(x, y) {
  let base = 0, x0 = stemX(Math.min(y, 12.6));
  if (y >= 12.58) {
    if (x < -0.3) return 0.56 * clamp((x - stemX(12.6)) / (-0.3 - stemX(12.6)), 0, 1) * 0.6;
    base = 0.56; x0 = -0.3;
  }
  const L = 16 - 7 * clamp(y / 12, 0, 1);
  const u = clamp((x - x0) / L, 0, 1);
  return base + (1 - base) * (1 - Math.pow(1 - u, 2));
}
function fStern(x, y) {
  const xa = sternX(y);
  const base = y >= 9.6 ? 0.74 : y <= 8 ? 0 : 0.74 * sm((y - 8) / 1.6);
  const L = y < 8 ? lerp(19, 9, y / 8) : 9;
  const u = clamp((xa - x) / L, 0, 1);
  return base + (1 - base) * (1 - Math.pow(1 - u, 2.2));
}
// Outer half-breadth of the hull at (x, y).
export function halfB(x, y) {
  if (y < bottomY(x) - 1e-6) return 0;
  return B(y) * Math.max(0, Math.min(fBow(x, y), fStern(x, y)));
}
// Side thickness: heavy below the upper deck, light bulwarks above.
export const thick = (y) => (y > 14.95 ? 0.22 : 0.5);
// Inner face of the side.
export function innerZ(x, y) { return halfB(x, y) - thick(y); }
// Top of the inner bottom (the ceiling planking over the floors).
export function bottomInner(x) { const b = bottomY(x); return b + lerp(1.8, 0.55, clamp(b / 8, 0, 1)); }

// Loft levels for the hull (outer face), chosen so paint bands fall on faces.
export const LV = [0, 0.4, 1.0, 1.8, 2.8, 4.0, 5.3, 6.5, 7.5, 8.2, 8.7, 9.35, 10.2, 10.9, 11.6, 12.3, 12.55, 12.6, 12.95, 13.7, 14.4, 14.95, 15.6, 16.3, 17.2, 18.2, 19.0];

// Gun ports (layout estimate from the dossier): x positions per deck.
const span = (n, a, b) => Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));
export const PORTS = {
  lower: { y: Y.lower, sill: 0.6, h: 0.95, w: 1.0, xs: span(15, 4.6, 52.6) },
  middle: { y: Y.middle, sill: 0.6, h: 0.9, w: 0.95, xs: span(14, 3.6, 52.2) },
  upper: { y: Y.upper, sill: 0.55, h: 0.85, w: 0.9, xs: span(15, 2.6, 55.2) },
  qd: { y: Y.qd, sill: 0.5, h: 0.75, w: 0.8, xs: span(6, 35.6, 46.6) },
  fc: { y: Y.fc, sill: 0.5, h: 0.75, w: 0.8, xs: [1.4, 4.7] },
};

export { clamp, lerp, sm };
