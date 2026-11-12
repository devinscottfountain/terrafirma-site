// sol-hud.js: the thin operator HUD and the machine tags, drawn on a 2D canvas laid over the WebGL canvas (same mount,
// pointer-events none). Numbers are live data; every word comes from `words` (data-* attributes, see README).
const FONT_MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';

export function createHud(host, words, pal) {
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none';
  host.appendChild(cv);
  const g = cv.getContext('2d');
  const sans = getComputedStyle(host).fontFamily || 'system-ui, sans-serif';
  let W = 1, H = 1, pr = 1, blank = true;
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`; };
  const pad = (v, n, d) => { const s = Math.abs(v).toFixed(d); return (v < 0 ? '-' : '+') + s.padStart(n + (d ? d + 1 : 0), '0'); };

  function resize(w, h, dpr) {
    W = w; H = h; pr = Math.min(2, dpr || 1);
    cv.width = Math.max(1, Math.round(w * pr)); cv.height = Math.max(1, Math.round(h * pr)); blank = false;
  }
  function text(s, x, y, size, color, { font = FONT_MONO, align = 'left', weight = 400 } = {}) {
    g.font = `${weight} ${size}px ${font}`; g.textAlign = align; g.fillStyle = color; g.fillText(s, x, y); return g.measureText(s).width;
  }

  // the dig: reticle on the bucket teeth, a grade ladder beside it, the telemetry strip, the hint
  function dig(s, a) {
    const A = pal.accent, cream = k => rgba(A, a * k), small = W < 600;
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
      const lx = x + r + 26, lh = small ? 64 : 92, top = y - lh / 2, k = lh / 4;
      g.strokeStyle = cream(0.35); g.beginPath(); g.moveTo(lx, top); g.lineTo(lx, top + lh);
      for (let i = 0; i <= 8; i++) { const ty = top + i * lh / 8, w = i % 2 ? 3 : 6; g.moveTo(lx, ty); g.lineTo(lx + w, ty); }
      g.stroke();
      g.strokeStyle = cream(0.9); g.beginPath(); g.moveTo(lx - 6, y); g.lineTo(lx + 12, y); g.stroke();
      text(words.grade, lx + 16, y + 3.5, small ? 9 : 10, cream(0.75), { font: sans });
      const my = Math.max(top, Math.min(top + lh, y - Math.max(-2, Math.min(2, gv)) * k));
      g.fillStyle = col; g.beginPath(); g.moveTo(lx - 2, my); g.lineTo(lx - 9, my - 4.5); g.lineTo(lx - 9, my + 4.5); g.closePath(); g.fill();
      text(pad(gv, 1, 2) + ' m', lx - 13, my + 3.5, small ? 10 : 11, col, { align: 'right' });
    }
    // telemetry strip, bottom of the safe band (the hint sits above it)
    const ty = (1 - s.safeBottom) * H - (small ? 12 : 16), x0 = Math.max(16, Math.min(40, W * 0.03)), T = s.tel, sz = small ? 9 : 10.5;
    let x = x0;
    const item = (label, val) => { x += text(label.toUpperCase(), x, ty, sz, cream(0.5), { font: sans, weight: 500 }) + 6; x += text(val, x, ty, sz, cream(0.92)) + (small ? 12 : 22); };
    const blink = 0.55 + 0.45 * Math.sin(s.t * 4);
    g.fillStyle = T.auto ? cream(0.9 * blink) : rgba(pal.cut, a * blink); g.beginPath(); g.arc(x + 3, ty - 3.5, 3, 0, Math.PI * 2); g.fill(); x += 12;
    x += text((T.auto ? words.auto : words.manual).toUpperCase(), x, ty, sz, cream(0.92), { font: sans, weight: 600 }) + (small ? 12 : 22);
    item(words.swing, pad(T.swing, 3, 1) + '°');
    item(words.reach, T.reach.toFixed(2).padStart(5, '0') + ' m');
    if (!small) item(words.depth, pad(T.grade, 1, 2) + ' m');
    item(words.load, String(Math.round(T.load * 100)).padStart(3, '0') + '%');
    g.strokeStyle = cream(0.18); g.beginPath(); g.moveTo(x0, ty - 15); g.lineTo(Math.min(W - x0, x - 10), ty - 15); g.stroke();
    // hint
    if (s.hint > 0.01 && words.hint) {
      const hy = (1 - s.safeBottom) * H - 52, hx = W / 2;
      g.font = `500 12px ${sans}`; const tw = g.measureText(words.hint).width + 28;
      g.strokeStyle = cream(0.45 * s.hint); g.fillStyle = `rgba(0,0,0,${(0.35 * a * s.hint).toFixed(3)})`;
      g.beginPath(); g.roundRect ? g.roundRect(hx - tw / 2, hy - 15, tw, 26, 13) : g.rect(hx - tw / 2, hy - 15, tw, 26); g.fill(); g.stroke();
      text(words.hint, hx, hy + 2.5, 12, cream(0.95 * s.hint), { font: sans, align: 'center', weight: 500 });
    }
  }

  // execution: one tag per machine, a leader up to a label with a live number
  // execution: one tag per machine, a leader up to a label with a live number. Labels never overlap: each takes the first
  // free slot going up from its machine, and flips to the left near the right edge.
  const boxes = [];
  let s0 = null;
  let nb = 0;
  function tags(list, a) {
    nb = 0;
    for (let i = 0; i < list.length; i++) {
      const T = list[i];
      if (!T || !T.p || T.a < 0.01) continue;
      const k = a * T.a, [x, y] = T.p, small = W < 600, fs = small ? 10.5 : 11.5;
      g.font = `600 ${fs}px ${sans}`; const w1 = g.measureText(T.label).width; g.font = `400 ${fs - 1}px ${FONT_MONO}`; const w2 = g.measureText(T.value).width;
      const tw = w1 + 8 + w2 + 12, flip = x + 18 + tw > W - 12;
      let ly = y - (small ? 26 : 34), lx = flip ? x - 18 : x + 18;
      const bx = flip ? lx - tw : lx;
      const minY = s0.safeTop * H + fs + 6; let dir = -1; if (ly < minY) { ly = y + fs + 14; dir = 1; }   // never up into the heading
      for (let n = 0; n < 8; n++) {
        let hit = false; for (let q = 0; q < nb && !hit; q++) { const B = boxes[q]; hit = bx < B[2] && bx + tw > B[0] && ly - fs < B[3] && ly + 4 > B[1]; }
        if (!hit) break; ly += dir * (fs + 6); if (ly < minY) { ly = y + fs + 14; dir = 1; } }
      const B = boxes[nb] || (boxes[nb] = [0, 0, 0, 0]); B[0] = bx; B[1] = ly - fs; B[2] = bx + tw; B[3] = ly + 4; nb++;
      g.strokeStyle = rgba(pal.accent, 0.6 * k); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(lx, ly); g.lineTo(lx + (flip ? -8 : 8), ly); g.stroke();
      g.fillStyle = rgba(pal.accent, 0.95 * k); g.beginPath(); g.arc(x, y, 2.5, 0, Math.PI * 2); g.fill();
      const tx = flip ? lx - tw + 2 : lx + 12;
      text(T.label, tx, ly + 4, fs, rgba(pal.accent, 0.95 * k), { font: sans, weight: 600 });
      text(T.value, tx + w1 + 8, ly + 4, fs - 1, rgba(T.color || pal.accent, 0.8 * k));
    }
  }
  // planning: a label with a number on each zone
  function zones(list, a) {
    for (const Z of list) {
      if (!Z || Z.a < 0.01) continue;
      const k = a * Z.a, [x, y] = Z.p;
      const w1 = text(Z.label.toUpperCase(), x, y, 10.5, rgba(Z.color, 0.95 * k), { font: sans, weight: 600, align: 'center' });
      text(Z.value, x, y + 15, 10.5, rgba(pal.accent, 0.75 * k), { align: 'center' });
      void w1;
    }
  }

  return {
    canvas: cv, resize,
    draw(s) {
      const any = s.wDig > 0.01 || s.wExec > 0.01 || s.wPlan > 0.01;
      if (!any) { if (!blank) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); blank = true; } return; }
      blank = false;
      g.setTransform(pr, 0, 0, pr, 0, 0); g.clearRect(0, 0, W, H);
      if (s.wDig > 0.01) dig(s, s.wDig);
      if (s.wExec > 0.01) { s0 = s; tags(s.tags, s.wExec); }
      if (s.wPlan > 0.01) zones(s.zones, s.wPlan);
    },
    clear() { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); blank = true; },
    dispose() { cv.remove(); },
  };
}
