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
  constructor() { this.hits = []; this.enabled = true; this.hover = null; }

  // view: { S, W, H, cx, cy, secOff, world }, defs: world.labels
  draw(ctx, view, defs, theme) {
    this.hits.length = 0;
    if (!this.enabled || !defs.length) return;
    const cand = [];
    for (const L of defs) {
      if (L.min != null && view.S < L.min) continue;
      if (L.max != null && view.S >= L.max) continue;
      const q = view.project(L.x, L.y, L.z || 0);
      if (!q) continue;
      const [sx, sy] = q;
      if (sx < 0 || sy < 0 || sx > view.W || sy > view.H) continue;
      const d = Math.hypot(sx - view.W / 2, sy - view.H / 2);
      cand.push({ L, sx, sy, pri: (L.priority || 0) * 1000 - d });
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
      const left = box[0], right = box[2];
      const gutL = left - 28, gutR = view.W - right - 28;
      if (right - left < view.W * 0.66 && Math.max(gutL, gutR) > 150) {
        placedAny = this._margins(ctx, view, cand, theme, left, right, gutL, gutR);
      }
    }
    if (!placedAny) this._near(ctx, view, cand, theme);
    ctx.restore();
  }

  _box(ctx, theme, c, x, y, r) {
    const L = c.L;
    const hovered = this.hover === L;
    ctx.fillStyle = hovered ? theme.paperHi : theme.paperA;
    ctx.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]);
    if (L.body) { ctx.strokeStyle = theme.accent; ctx.globalAlpha = hovered ? 0.9 : 0.35; ctx.lineWidth = 1; ctx.strokeRect(r[0] + 0.5, r[1] + 0.5, r[2] - r[0] - 1, r[3] - r[1] - 1); ctx.globalAlpha = 1; }
    ctx.fillStyle = theme.ink;
    if (c.wt) { ctx.font = FONT_T; for (const l of c.wt.lines) { ctx.fillText(l, x, y); y += LINE_H; } }
    if (c.wb) { ctx.font = FONT_B; ctx.fillStyle = theme.inkSoft; for (const l of c.wb.lines) { ctx.fillText(l, x, y); y += LINE_H; } }
    this.hits.push({ r, L });
  }
  _dot(ctx, theme, x, y) {
    ctx.fillStyle = theme.ink;
    ctx.beginPath(); ctx.arc(x, y, 2.1, 0, Math.PI * 2); ctx.fill();
  }

  _margins(ctx, view, cand, theme, left, right, gutL, gutR) {
    const mid = (left + right) / 2;
    const cols = { L: [], R: [] };
    const colW = { L: Math.min(MAXW + 8, gutL), R: Math.min(MAXW + 8, gutR) };
    for (const c of cand) {
      let side = c.sx < mid ? 'L' : 'R';
      if (c.L.side === 'left') side = 'L'; else if (c.L.side === 'right') side = 'R';
      if (colW[side] < 150) side = side === 'L' ? 'R' : 'L';
      if (colW[side] < 150) continue;
      if (c.w > colW[side] - 8) continue;
      cols[side].push(c);
    }
    let any = false;
    for (const side of ['L', 'R']) {
      const list = cols[side].sort((a, b) => a.sy - b.sy);
      if (!list.length) continue;
      // 1D layout: ideal y centred on the anchor, then push apart.
      const top = 70, bottom = view.H - 86, gap = 8;
      for (const c of list) c.y = Math.max(top, c.sy - c.h / 2);
      for (let i = 1; i < list.length; i++) list[i].y = Math.max(list[i].y, list[i - 1].y + list[i - 1].h + gap + 6);
      const over = list.length ? list[list.length - 1].y + list[list.length - 1].h - bottom : 0;
      if (over > 0) {
        list[list.length - 1].y -= over;
        for (let i = list.length - 2; i >= 0; i--) list[i].y = Math.min(list[i].y, list[i + 1].y - list[i].h - gap - 6);
      }
      for (const c of list) {
        if (c.y < 8 || c.y + c.h > view.H - 70) continue;
        const x = side === 'L' ? left - 22 - c.w : right + 22;
        const r = [x - 5, c.y - 3, x + c.w + 5, c.y + c.h + 3];
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
        if (r[0] < 4 || r[1] < 60 || r[2] > view.W - 4 || r[3] > view.H - 80) continue;
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
