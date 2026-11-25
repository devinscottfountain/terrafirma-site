// sol-hud.js: the thin operator HUD and the machine tags, drawn on a 2D canvas laid over the WebGL canvas (same mount,
// pointer-events none). Numbers are live data; every word comes from `words` (data-* attributes, see README).
const FONT_MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

export function createHud(host, words, pal, { phone = false } = {}) {
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none';
  host.appendChild(cv);
  const g = cv.getContext('2d');
  const sans = getComputedStyle(host).fontFamily || 'system-ui, sans-serif';
  let W = 1, H = 1, pr = 1, blank = true, blank0 = true, redraws = 0;
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`; };
  const pad = (v, n, d) => { const s = Math.abs(v).toFixed(d); return (v < 0 ? '-' : '+') + s.padStart(n + (d ? d + 1 : 0), '0'); };

  function resize(w, h, dpr) {
    const p = Math.min(2, dpr || 1); if (w === W && h === H && p === pr && !blank0) return;   // same size: keep the canvas (re-allocating it clears it and costs a frame)
    blank0 = false; W = w; H = h; pr = p;
    cv.width = Math.max(1, Math.round(w * pr)); cv.height = Math.max(1, Math.round(h * pr)); blank = false;
  }
  function text(s, x, y, size, color, { font = FONT_MONO, align = 'left', weight = 400 } = {}) {
    g.font = `${weight} ${size}px ${font}`; g.textAlign = align; g.fillStyle = color; g.fillText(s, x, y); return g.measureText(s).width;
  }

  const DASH = [5, 5], DASH_S = [3, 4], NODASH = [];
  // click markers: a ring on the ground where the visitor clicked. Dig = cut colour, solid ring with four ticks pointing in;
  // drop = fill colour, double ring with a down arrow. A queued click is dashed and dimmer. It pops in at once.
  function marker(H, a) {
    if (H.a < 0.01 || H.n < 3) return;
    const k = a * H.a * (H.queued ? 0.6 : 1), col = H.kind === 'dig' ? pal.cut : pal.fill, P = H.pts, n = H.n, [cx, cy] = H.c;
    g.lineWidth = H.queued ? 1.5 : 2; g.setLineDash(H.queued ? DASH_S : NODASH);
    g.strokeStyle = rgba(col, 0.95 * k); g.fillStyle = rgba(col, 0.2 * k);
    g.beginPath(); g.moveTo(P[0], P[1]); for (let q = 1; q < n; q++) g.lineTo(P[q * 2], P[q * 2 + 1]); g.closePath(); g.fill(); g.stroke();
    g.setLineDash(NODASH);
    if (H.kind === 'dig') { // four ticks from the ring toward the centre
      g.beginPath();
      for (let q = 0; q < 4; q++) { const i = Math.round(q * n / 4) % n, x = P[i * 2], y = P[i * 2 + 1]; g.moveTo(x, y); g.lineTo(x + (cx - x) * 0.45, y + (cy - y) * 0.45); }
      g.stroke();
      g.fillStyle = rgba(col, k); g.beginPath(); g.arc(cx, cy, 2.5, 0, Math.PI * 2); g.fill();
    } else { // inner ring + a down arrow above the spot
      g.beginPath(); for (let q = 0; q < n; q++) { const x = cx + (P[q * 2] - cx) * 0.55, y = cy + (P[q * 2 + 1] - cy) * 0.55; q ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke();
      const ay = cy - 16; g.fillStyle = rgba(col, k);
      g.beginPath(); g.moveTo(cx, ay + 9); g.lineTo(cx - 5, ay + 2); g.lineTo(cx + 5, ay + 2); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx, ay - 6); g.lineTo(cx, ay + 2); g.stroke();
    }
  }
  // ghost path: a dashed line on the ground from the machine to where it will stop, and its footprint there
  function ghost(G, a) {
    if (G.a < 0.01 || G.n < 2) return;
    const k = a * G.a, P = G.pts;
    g.lineWidth = 1.75; g.setLineDash(DASH); g.lineDashOffset = -s0t * 18; g.strokeStyle = rgba(pal.accent, 0.9 * k);
    g.beginPath(); g.moveTo(P[0], P[1]); for (let q = 1; q < G.n; q++) g.lineTo(P[q * 2], P[q * 2 + 1]); g.stroke();
    if (G.footOn) { const F = G.foot; g.lineWidth = 1.25; g.strokeStyle = rgba(pal.accent, 0.75 * k); g.fillStyle = rgba(pal.accent, 0.08 * k); g.beginPath(); g.moveTo(F[0], F[1]); for (let q = 1; q < 4; q++) g.lineTo(F[q * 2], F[q * 2 + 1]); g.closePath(); g.fill(); g.stroke(); }
    g.setLineDash(NODASH); g.lineDashOffset = 0;
  }
  let s0t = 0;

  // the zone being drawn: a 6 px dot on every corner, the first one ringed (14 px) when a click there would close it, and a
  // small cross where the next corner would go
  function zone(Z, a) {
    if (!Z || !Z.n) return;
    const col = pal.zone || pal.fill, P = Z.pts;
    g.fillStyle = rgba(col, 0.95 * a);
    for (let i = 0; i < Z.n; i++) if (Z.ok[i]) { g.beginPath(); g.arc(P[i * 2], P[i * 2 + 1], i === 0 && Z.n > 2 ? 4 : 3, 0, Math.PI * 2); g.fill(); }
    if (Z.snap && Z.ok[0]) {
      g.lineWidth = 1.5; g.strokeStyle = rgba(col, 0.95 * a); g.fillStyle = rgba(col, 0.18 * a);
      g.beginPath(); g.arc(P[0], P[1], 7, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    if (Z.pulse && Z.ok[0]) { // the first corner is the click target: a ring breathes out of it (two, and a steady one, once a click there can close the zone)
      const strong = Z.pulse > 1, per = strong ? 1.1 : 1.7, x = P[0], y = P[1];
      for (let q = 0; q < (strong ? 2 : 1); q++) {
        const k = (s0t / per + q * 0.5) % 1;
        g.lineWidth = strong ? 2.25 : 1.75; g.strokeStyle = rgba(col, (strong ? 1 : 0.7) * (1 - k) * a);
        g.beginPath(); g.arc(x, y, 6 + (strong ? 19 : 13) * k, 0, Math.PI * 2); g.stroke();
      }
      if (strong) { g.lineWidth = 1.5; g.strokeStyle = rgba(col, 0.6 * a); g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.stroke(); }
    }
    if (Z.hov) {
      const [x, y] = Z.h; g.lineWidth = 1; g.strokeStyle = rgba(col, 0.8 * a);
      g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x + 5, y); g.moveTo(x, y - 5); g.lineTo(x, y + 5); g.stroke();
    }
  }
  // the intro's cursor sprite: a cream arrow (tip at x, y, 16 px tall) that dips on a press, and a ring that expands and fades
  // from the tip (C.pa: seconds since the last press)
  function cursor(C, a) {
    if (!C || !C.ok || (C.a < 0.01 && C.pa > 0.6)) return;
    const [x, y] = C.p, pa = C.pa;
    if (pa >= 0 && pa < 0.6) {
      const q = pa / 0.6, e = 1 - (1 - q) * (1 - q);
      g.lineWidth = 1.75; g.strokeStyle = rgba(pal.accent, 0.85 * (1 - q) * a); g.beginPath(); g.arc(x, y, 4 + 18 * e, 0, Math.PI * 2); g.stroke();
    }
    if (C.a < 0.01) return;
    const sc = pa >= 0 && pa < 0.14 ? 0.86 : 1, ox = pa >= 0 && pa < 0.14 ? 0.5 : 0;
    g.beginPath();
    for (let i = 0; i < 7; i++) { const px = x + ox + CUR[i * 2] * sc, py = y + ox + CUR[i * 2 + 1] * sc; i ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath(); g.lineWidth = 1.5; g.lineJoin = 'round'; g.strokeStyle = `rgba(0,0,0,${(0.75 * a * C.a).toFixed(3)})`; g.fillStyle = rgba(pal.accent, 0.98 * a * C.a); g.fill(); g.stroke();
  }
  const CUR = [0, 0, 0, 15, 3.7, 11.7, 6.3, 17, 8.6, 16, 6.1, 10.9, 10.8, 10.6];   // arrow outline, tip first
  // the closed zone's tag: label and what it has dug, at its centre
  function zoneTag(T, a) {
    if (!T || T.a < 0.01 || !T.value) return;
    const k = a * T.a, [x, y] = T.p, col = pal.zone || pal.fill;
    text(T.label.toUpperCase(), x, y - 4, phone ? 12 : 10.5, rgba(col, 0.95 * k), { font: sans, weight: 600, align: 'center' });
    text(T.value, x, y + 11, phone ? 12 : 10.5, rgba(pal.accent, 0.8 * k), { align: 'center' });
  }

  // the dig: click markers, ghost path, reticle on the bucket teeth, a grade ladder beside it, the autopilot readout, the hint
  function dig(s, a) {
    const A = pal.accent, cream = k => rgba(A, a * k), small = W < 600, FS = 12;   // FS: phones never draw text under 12 px
    s0t = s.t; ghost(s.ghost, a); marker(s.marks[1], a); marker(s.marks[0], a); zone(s.zone, a); cursor(s.cur, a);
    if (s.tip) {
      const [x, y] = s.tip, r = small ? 13 : 17;
      const gv = s.tel.grade, col = Math.abs(gv) < 0.12 ? cream(0.95) : rgba(gv > 0 ? pal.cut : pal.fill, a * 0.95);
      g.lineWidth = 1; g.strokeStyle = cream(0.7);
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
      g.beginPath();
      for (let q = 0; q < 4; q++) { const dx = q < 2 ? 1 - 2 * q : 0, dy = q < 2 ? 0 : 5 - 2 * q; g.moveTo(x + dx * (r + 4), y + dy * (r + 4)); g.lineTo(x + dx * (r + 10), y + dy * (r + 10)); }
      g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
      // grade ladder: +/- 2 m around the design grade, marker = teeth elevation
      // phones: the ladder goes to the side with room (its words are 12 px); elsewhere it is always on the right
      const dr = phone && x + r + 26 + 96 > W - 6 ? -1 : 1, lx = x + dr * (r + 26), lh = small ? 64 : 92, top = y - lh / 2, k = lh / 4;
      g.strokeStyle = cream(0.35); g.beginPath(); g.moveTo(lx, top); g.lineTo(lx, top + lh);
      for (let i = 0; i <= 8; i++) { const ty = top + i * lh / 8, w = i % 2 ? 3 : 6; g.moveTo(lx, ty); g.lineTo(lx + w, ty); }
      g.stroke();
      g.strokeStyle = cream(0.9); g.beginPath(); g.moveTo(lx - 6 * dr, y); g.lineTo(lx + 12 * dr, y); g.stroke();
      text(words.grade, lx + 16 * dr, y + 3.5, phone ? FS : small ? 9 : 10, cream(0.75), { font: sans, align: dr > 0 ? 'left' : 'right' });
      const my = Math.max(top, Math.min(top + lh, y - Math.max(-2, Math.min(2, gv)) * k));
      g.fillStyle = col; g.beginPath(); g.moveTo(lx - 2 * dr, my); g.lineTo(lx - 9 * dr, my - 4.5); g.lineTo(lx - 9 * dr, my + 4.5); g.closePath(); g.fill();
      if (phone) text(pad(gv, 1, 2) + ' m', lx + 16 * dr, Math.abs(my - y) < 16 ? y + 19 : my + 4, FS, col, { align: dr > 0 ? 'left' : 'right' });   // phones: beside the ladder, under 'Grade' when the marker is near the centre line, clear of the reticle
      else text(pad(gv, 1, 2) + ' m', lx - 13 * dr, my + 3.5, small ? 10 : 11, col, { align: dr > 0 ? 'right' : 'left' });
    }
    // readout, bottom of the safe band, level with the hint: always on in the dig view. Autopilot blinks, Manual holds steady.
    const ty = (1 - s.safeBottom) * H - (phone ? 10 : small ? 12 : 16), x0 = Math.max(16, Math.min(40, W * 0.03)), T = s.tel, sz = phone ? FS : small ? 9 : 10.5;
    let rx = x0;   // where the readout ends
    {
      const cr = k => rgba(A, a * k);
      let x = x0;
      const item = (label, val) => { x += text(label.toUpperCase(), x, ty, sz, cr(phone ? 0.65 : 0.5), { font: sans, weight: 500 }) + 6; x += text(val, x, ty, sz, cr(0.92)) + (small ? 12 : 22); };
      const blink = T.auto ? 0.55 + 0.45 * Math.sin(s.t * 4) : 1;
      g.fillStyle = cr(0.9 * blink); g.beginPath(); g.arc(x + 3, ty - 3.5, 3, 0, Math.PI * 2); g.fill(); x += 12;
      const wA = text((T.auto ? words.auto : words.manual).toUpperCase(), x, ty, sz, cr(0.92), { font: sans, weight: 600 });
      x += Math.max(wA, g.measureText((T.auto ? words.manual : words.auto).toUpperCase()).width) + (small ? 12 : 22);   // same slot for both words: the values never shift
      if (!phone || W >= 420) item(words.swing, pad(T.swing, 3, 1) + '°');   // phones: Swing is the low-value field, it goes before any text shrinks
      item(words.reach, T.reach.toFixed(2).padStart(5, '0') + ' m');
      if (!small) item(words.depth, pad(T.grade, 1, 2) + ' m');
      item(words.load, String(Math.round(T.load * 100)).padStart(3, '0') + '%');
      g.strokeStyle = cr(0.18); g.beginPath(); g.moveTo(x0, ty - 15); g.lineTo(Math.min(W - x0, x - 10), ty - 15); g.stroke();
      rx = x;
    }
    // hint: bottom centre of the safe band, under the machine, 14 px. It sits level with the readout when it clears it (the widest
    // of its texts decides, so it never hops between rows), else one row above the readout's rule. "Esc to cancel" rides beside
    // it on the right (never over the readout, which is on the left). hintPulse (0..1) breathes it for the first hint.
    const ht = s.hintText;
    if (s.hint > 0.01 && ht) {
      if (hintW0 !== W) { hintW0 = W; hintMax = 0; g.font = `500 14px ${sans}`; for (const k of HINTS) if (words[k]) hintMax = Math.max(hintMax, g.measureText(words[k]).width); }
      g.font = `500 14px ${sans}`;
      const tw = g.measureText(ht).width + 32, th = 34, hp = s.hintPulse || 0, cx = W / 2;
      const lift = cx - (hintMax + 32) / 2 < rx + 16 ? 38 : 0, hy = ty - 5 - lift, w = tw * (1 + 0.05 * hp), h = th * (1 + 0.05 * hp), k = s.hint;
      g.lineWidth = 1; g.strokeStyle = cream((0.5 + 0.45 * hp) * k); g.fillStyle = `rgba(0,0,0,${(0.42 * a * k).toFixed(3)})`;
      g.beginPath(); g.roundRect ? g.roundRect(cx - w / 2, hy - h / 2, w, h, h / 2) : g.rect(cx - w / 2, hy - h / 2, w, h); g.fill(); g.stroke();
      if (hp > 0.01) { const e = 5 + 8 * hp; g.strokeStyle = cream(0.4 * hp * k); g.beginPath(); g.roundRect ? g.roundRect(cx - w / 2 - e, hy - h / 2 - e, w + 2 * e, h + 2 * e, h / 2 + e) : g.rect(cx - w / 2 - e, hy - h / 2 - e, w + 2 * e, h + 2 * e); g.stroke(); }
      text(ht, cx, hy + 5, 14, cream(0.97 * k), { font: sans, align: 'center', weight: 500 });
      hintBox[0] = cx - tw / 2; hintBox[1] = hy - th / 2; hintBox[2] = cx + tw / 2; hintBox[3] = hy + th / 2;
      if (s.hintSub) {
        g.font = `400 12px ${sans}`; const sw = g.measureText(s.hintSub).width, sx = cx + tw / 2 + 14;
        if (sx + sw < W - x0) { text(s.hintSub, sx, hy + 4, 12, cream(0.75 * k), { font: sans }); hintBox[2] = sx + sw; }
      }
    }
  }
  const HINTS = ['hint', 'hintPoint', 'hintClose', 'hintDrag', 'hintClick'];
  let hintW0 = 0, hintMax = 0;   // the widest hint text at this width (cached per resize)

  // execution: one tag per machine, a leader up to a label with a live number
  // execution: one tag per machine, a leader up to a label with a live number. Labels never overlap: each takes the first
  // free slot going up from its machine, and flips to the left near the right edge.
  const boxes = [], tagOut = [0, 1, 2].map(() => [0, 0, 0, 0, 0]), hintBox = [0, 0, 0, 0];
  let s0 = null;
  let nb = 0;
  function tags(list, a) {
    nb = 0;
    for (let j = 0; j < 3; j++) { const M = s0.mbox[j], B = boxes[nb] || (boxes[nb] = [0, 0, 0, 0]); B[0] = M[0]; B[1] = M[1]; B[2] = M[2]; B[3] = M[3]; nb++; }   // machines first: labels keep off them
    for (let i = 0; i < list.length; i++) {
      const T = list[i];
      if (!T || !T.p || T.a < 0.01) continue;
      const k = a * T.a, [x, y] = T.p, small = W < 600, fs = phone ? 12 : small ? 10.5 : 11.5;
      g.font = `600 ${fs}px ${sans}`; const w1 = g.measureText(T.label).width; g.font = `400 ${phone ? fs : fs - 1}px ${FONT_MONO}`; const w2 = g.measureText(T.value).width;
      const tw = w1 + 8 + w2 + 12, flip = x + 18 + tw > W - 12;
      let ly = y - (small ? 26 : 34), lx = flip ? x - 18 : x + 18;
      const bx = flip ? lx - tw : lx;
      const minY = s0.safeTop * H + fs + 6, maxY = (1 - s0.safeBottom) * H - 8; let dir = -1; if (ly < minY) { ly = y + fs + 14; dir = 1; }   // never up into the heading
      for (let n = 0; n < 48; n++) {
        let hit = false; for (let q = 0; q < nb && !hit; q++) { const B = boxes[q]; hit = bx < B[2] && bx + tw > B[0] && ly - fs < B[3] && ly + 4 > B[1]; }
        if (!hit && ly <= maxY) break; ly += dir * (fs + 6) * 0.5; if (ly < minY) { ly = y + fs + 14; dir = 1; } }   // up past its machine, else down below it
      const B = boxes[nb] || (boxes[nb] = [0, 0, 0, 0]); B[0] = bx; B[1] = ly - fs; B[2] = bx + tw; B[3] = ly + 4; nb++;
      const O = tagOut[i]; O[0] = B[0]; O[1] = B[1]; O[2] = B[2]; O[3] = B[3]; O[4] = 1;
      g.strokeStyle = rgba(pal.accent, 0.6 * k); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(lx, ly); g.lineTo(lx + (flip ? -8 : 8), ly); g.stroke();
      g.fillStyle = rgba(pal.accent, 0.95 * k); g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
      const tx = flip ? lx - tw + 2 : lx + 12;
      text(T.label, tx, ly + 4, fs, rgba(pal.accent, 0.95 * k), { font: sans, weight: 600 });
      text(T.value, tx + w1 + 8, ly + 4, phone ? fs : fs - 1, rgba(T.color || pal.accent, 0.8 * k));
    }
  }
  // planning: a label with a number on each zone
  function zones(list, a) {
    for (const Z of list) {
      if (!Z || Z.a < 0.01) continue;
      const k = a * Z.a, [x, y] = Z.p;
      const fz = phone ? 12 : 10.5, w1 = text(Z.label.toUpperCase(), x, y, fz, rgba(Z.color, 0.95 * k), { font: sans, weight: 600, align: 'center' });
      text(Z.value, x, y + (phone ? 16 : 15), fz, rgba(pal.accent, 0.75 * k), { align: 'center' });
      void w1;
    }
  }

  return {
    canvas: cv, resize, tagOut, hintBox, get redraws() { return redraws; },
    draw(s) {
      const any = s.wDig > 0.01 || s.wExec > 0.01 || s.wPlan > 0.01;
      if (!any) { if (!blank) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); blank = true; } return; }
      blank = false; redraws++;
      g.setTransform(pr, 0, 0, pr, 0, 0); g.clearRect(0, 0, W, H);
      if (s.wDig > 0.01) dig(s, s.wDig);
      if (s.wDig > 0.01 || s.wPlan > 0.01) zoneTag(s.zoneTag, Math.max(s.wDig, s.wPlan));
      for (const O of tagOut) O[4] = 0;
      if (s.wExec > 0.01) { s0 = s; tags(s.tags, s.wExec); }
      if (s.wPlan > 0.01) zones(s.zones, s.wPlan);
    },
    clear() { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); blank = true; },
    dispose() { cv.remove(); },
  };
}
