/* Caption labels in the manner of a cross-section book: small italic captions
 * set near the thing they describe, joined to it by a fine leader line.
 *
 * Labels are drawn in screen space each frame so the type stays crisp and
 * constant in size. A greedy pass hides labels that would collide, giving
 * priority to the ones nearest the centre of the screen.
 */
import { XS } from './core.js';

const FONT_T = '600 12.5px ' + '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
const FONT_B = 'italic 12px ' + '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif';
const LINE_H = 14.5;
const MAXW = 210;

const wrapCache = new Map();
function wrap(ctx, text, maxW, font) {
  const key = font + '|' + maxW + '|' + text;
  let v = wrapCache.get(key);
  if (v) return v;
  ctx.font = font;
  const words = text.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = t;
  }
  if (cur) lines.push(cur);
  let width = 0;
  for (const l of lines) width = Math.max(width, ctx.measureText(l).width);
  v = { lines, width };
  wrapCache.set(key, v);
  return v;
}

class Labels {
  // active: the caption whose fact card is open. It is drawn highlighted, placed first, and
  // never the one dropped when space runs short. The shell sets it and clears it.
  constructor() { this.hits = []; this.enabled = true; this.hover = null; this.active = null; }

  // view: { S, W, H, project, subjectBox, insets, reserved }, defs: world.labels.
  // insets ({top, right, bottom, left}) and reserved ([x0, y0, x1, y1] rectangles) are the
  // screen space taken by the page's chrome; captions are never set there.
  draw(ctx, view, defs, theme) {
    this.hits.length = 0;
    if (!this.enabled || !defs.length) return;
    const I = Object.assign({ top: 70, right: 0, bottom: 86, left: 0 }, view.insets || {});
    this.area = { x0: I.left, y0: I.top, x1: view.W - I.right, y1: view.H - I.bottom };
    this.reserved = view.reserved || [];
    const cand = [];
    for (const L of defs) {
      if (L.min != null && view.S < L.min) continue;
      if (L.max != null && view.S >= L.max) continue;
      const q = view.project(L.x, L.y, L.z || 0);
      if (!q) continue;
      const [sx, sy] = q;
      if (sx < 0 || sy < 0 || sx > view.W || sy > view.H) continue;
      if (this._covered([sx - 2, sy - 2, sx + 2, sy + 2])) continue; // its anchor is under a panel
      const d = Math.hypot(sx - view.W / 2, sy - view.H / 2);
      cand.push({ L, sx, sy, pri: (L.priority || 0) * 1000 - d + (L === this.active ? 1e7 : 0), pinned: L === this.active });
    }
    if (!cand.length) return;
    ctx.save();
    ctx.textBaseline = 'top';
    // Measure every candidate.
    for (const c of cand) {
      const L = c.L;
      c.wt = L.title ? wrap(ctx, L.title, MAXW, FONT_T) : null;
      c.wb = L.text ? wrap(ctx, L.text, L.width || MAXW, FONT_B) : null;
      c.w = Math.max(c.wt ? c.wt.width : 0, c.wb ? c.wb.width : 0);
      c.h = (c.wt ? c.wt.lines.length * LINE_H : 0) + (c.wb ? c.wb.lines.length * LINE_H : 0);
    }
    // Margin layout when the whole subject is small on screen: captions stand in the gutters.
    const box = view.subjectBox ? view.subjectBox() : null;
    let placedAny = false;
    if (box) {
      const A = this.area;
      const left = box[0], right = box[2];
      const gutL = left - 28 - A.x0, gutR = A.x1 - right - 28;
      if (right - left < (A.x1 - A.x0) * 0.66 && Math.max(gutL, gutR) > 150) {
        placedAny = this._margins(ctx, view, cand, theme, left, right, gutL, gutR);
      }
    }
    if (!placedAny) this._near(ctx, view, cand, theme);
    ctx.restore();
  }

  _box(ctx, theme, c, x, y, r) {
    const L = c.L;
    const hovered = this.hover === L || this.active === L;
    ctx.fillStyle = hovered ? theme.paperHi : theme.paperA;
    ctx.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]);
    if (L.body) { ctx.strokeStyle = theme.accent; ctx.globalAlpha = hovered ? 0.9 : 0.35; ctx.lineWidth = 1; ctx.strokeRect(r[0] + 0.5, r[1] + 0.5, r[2] - r[0] - 1, r[3] - r[1] - 1); ctx.globalAlpha = 1; }
    ctx.fillStyle = theme.ink;
    if (c.wt) { ctx.font = FONT_T; for (const l of c.wt.lines) { ctx.fillText(l, x, y); y += LINE_H; } }
    if (c.wb) { ctx.font = FONT_B; ctx.fillStyle = theme.inkSoft; for (const l of c.wb.lines) { ctx.fillText(l, x, y); y += LINE_H; } }
    this.hits.push({ r, L });
  }
  // True when a rectangle overlaps any reserved rectangle.
  _covered(r) {
    for (const q of this.reserved) if (!(r[2] < q[0] || r[0] > q[2] || r[3] < q[1] || r[1] > q[3])) return true;
    return false;
  }
  _dot(ctx, theme, x, y) {
    ctx.fillStyle = theme.ink;
    ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
  }

  // Captions in two margin columns, each sorted by height and joined to its anchor by an elbow
  // leader. Open cards and panels (reserved rectangles) are kept clear: only the captions they
  // cover move, the rest keep their place and side. When a column runs out of room its least
  // important caption moves to the other column, or is dropped if that is full too. The active
  // caption (its card is open) is never dropped.
  _margins(ctx, view, cand, theme, left, right, gutL, gutR) {
    const mid = (left + right) / 2;
    const cols = { L: [], R: [] };
    const colW = { L: Math.min(MAXW + 8, gutL), R: Math.min(MAXW + 8, gutR) };
    const fits = (side, c) => colW[side] >= 150 && c.w <= colW[side] - 8;
    for (const c of cand) {
      let side = c.sx < mid ? 'L' : 'R';
      if (c.L.side === 'left') side = 'L'; else if (c.L.side === 'right') side = 'R';
      if (!fits(side, c)) side = side === 'L' ? 'R' : 'L';
      if (!fits(side, c)) continue;
      cols[side].push(c);
    }
    const top = this.area.y0, bottom = this.area.y1, gap = 14;
    const rectAt = (side, c, y) => { const x = side === 'L' ? left - 22 - c.w : right + 22; return [x - 5, y - 3, x + c.w + 5, y + c.h + 3]; };
    const blocker = (r) => { for (const q of this.reserved) if (!(r[2] < q[0] || r[0] > q[2] || r[3] < q[1] || r[1] > q[3])) return q; return null; };
    const placed = (side, c) => c.y >= top && c.y + c.h <= bottom + 16 && !blocker(rectAt(side, c, c.y));
    // 1D layout down the column: ideal y centred on the anchor, pushed apart, and pushed below
    // any reserved rectangle in the way; then, if the last spills past the bottom, pulled back up
    // (above a reserved rectangle rather than into it). True when every caption has a place.
    const layout = (side, list) => {
      let y0 = top;
      for (const c of list) {
        let y = Math.max(y0, c.sy - c.h / 2);
        for (let k = 0, q; k < 8 && (q = blocker(rectAt(side, c, y))); k++) y = q[3] + 4;
        c.y = y;
        y0 = y + c.h + gap;
      }
      const n = list.length;
      if (n && list[n - 1].y + list[n - 1].h > bottom) {
        let lim = bottom;
        for (let i = n - 1; i >= 0; i--) {
          const c = list[i];
          let y = Math.min(c.y, lim - c.h);
          for (let k = 0, q; k < 8 && (q = blocker(rectAt(side, c, y))); k++) y = q[1] - c.h - 4;
          c.y = y;
          lim = y - gap;
        }
      }
      return list.every((c) => placed(side, c));
    };
    // Lay a column out, taking out its least important captions until the rest fit.
    const fit = (side) => {
      const list = cols[side].sort((a, b) => a.sy - b.sy);
      const out = [];
      while (list.length && !layout(side, list)) {
        let k = -1;
        for (let i = 0; i < list.length; i++) if (!list[i].pinned && (k < 0 || list[i].pri < list[k].pri)) k = i;
        if (k < 0) break;
        out.push(list.splice(k, 1)[0]);
      }
      return out;
    };
    // A caption whose own place is under a card or panel crosses to the other column at the
    // same height when that place is free, rather than shoving its whole column down; a small
    // overlap is just stepped around. Captions clear of the card do not move at all.
    const ideal = (c) => Math.max(top, c.sy - c.h / 2);
    const push = (side, c) => { let y = ideal(c); for (let k = 0, q; k < 8 && (q = blocker(rectAt(side, c, y))); k++) y = q[3] + 4; return y - ideal(c); };
    for (const [from, to] of [['L', 'R'], ['R', 'L']]) {
      for (const c of cols[from].slice()) {
        if (push(from, c) < 48 || !fits(to, c) || push(to, c) >= 48) continue;
        cols[from].splice(cols[from].indexOf(c), 1);
        cols[to].push(c);
      }
    }
    const outL = fit('L'), outR = fit('R');
    // What one column could not hold may stand in the other, if it fits there.
    for (const [from, to, out] of [['L', 'R', outL], ['R', 'L', outR]]) {
      const lost = out.concat(cols[from].filter((c) => c.pinned && !placed(from, c)));
      const moved = lost.filter((c) => fits(to, c));
      if (!moved.length) continue;
      for (const c of moved) { const i = cols[from].indexOf(c); if (i >= 0) cols[from].splice(i, 1); }
      cols[to].push(...moved);
      fit(to);
    }
    let any = false;
    for (const side of ['L', 'R']) {
      for (const c of cols[side]) {
        if (!placed(side, c)) continue;
        const r = rectAt(side, c, c.y), x = r[0] + 5;
        // Elbow leader: from the anchor out to the gutter, then to the caption.
        const ex = side === 'L' ? r[2] : r[0], ey = c.y + Math.min(c.h / 2, 8);
        const kx = side === 'L' ? Math.min(c.sx - 10, left - 8) : Math.max(c.sx + 10, right + 8);
        ctx.strokeStyle = theme.ink; ctx.globalAlpha = 0.7; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(kx, ey); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.globalAlpha = 1;
        this._dot(ctx, theme, c.sx, c.sy);
        this._box(ctx, theme, c, x, c.y, r);
        any = true;
      }
    }
    return any;
  }

  _near(ctx, view, cand, theme) {
    cand.sort((a, b) => b.pri - a.pri);
    const placed = [];
    for (const c of cand) {
      const L = c.L, w = c.w, h = c.h;
      // Preferred side from dx/dy signs, then the other three corners.
      const ax = Math.abs(L.dx != null ? Math.min(Math.abs(L.dx), 40) : 16), ay = Math.abs(L.dy != null ? Math.min(Math.abs(L.dy), 30) : 22);
      const sx0 = L.dx != null && L.dx < 0 ? -1 : 1, sy0 = L.dy != null && L.dy > 0 ? 1 : -1;
      const tries = [[sx0, sy0], [-sx0, sy0], [sx0, -sy0], [-sx0, -sy0]];
      let box = null;
      for (const [hs, vs] of tries) {
        const x = hs > 0 ? c.sx + ax : c.sx - ax - w;
        const y = vs < 0 ? c.sy - ay - h : c.sy + ay;
        const r = [x - 5, y - 3, x + w + 5, y + h + 3];
        const A = this.area;
        if (r[0] < A.x0 + 4 || r[1] < A.y0 - 10 || r[2] > A.x1 - 4 || r[3] > A.y1 + 6) continue;
        if (this._covered(r)) continue;
        let hit = false;
        for (const q of placed) if (!(r[2] < q[0] || r[0] > q[2] || r[3] < q[1] || r[1] > q[3])) { hit = true; break; }
        if (!hit) { box = { x, y, r }; break; }
      }
      if (!box) continue;
      placed.push(box.r);
      const ex = Math.max(box.r[0], Math.min(c.sx, box.r[2]));
      const ey = c.sy < box.r[1] ? box.r[1] : c.sy > box.r[3] ? box.r[3] : (box.r[1] + box.r[3]) / 2;
      ctx.strokeStyle = theme.ink; ctx.globalAlpha = 0.7; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(c.sx, c.sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.globalAlpha = 1;
      this._dot(ctx, theme, c.sx, c.sy);
      this._box(ctx, theme, c, box.x, box.y, box.r);
    }
  }
  hit(sx, sy) {
    for (const h of this.hits) if (sx >= h.r[0] && sx <= h.r[2] && sy >= h.r[1] && sy <= h.r[3]) return h.L;
    return null;
  }
}

XS.Labels = Labels;
export { Labels };
