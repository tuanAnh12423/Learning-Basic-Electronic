/* 19/10/2026: Bộ khung dùng chung cho các mô phỏng linh kiện (xung, điện áp, dòng điện theo thời gian).
   Mỗi mô phỏng chỉ khai báo: thanh trượt (ctrls), hàm tính (compute) trả về các đồ thị, và (tuỳ chọn) sơ đồ.
   Con trỏ chạy ngang các đồ thị cho thấy giá trị tại từng thời điểm. Số liệu là mô hình đơn giản, minh hoạ nguyên lý. */
(function () {
  'use strict';
  var H = window.HDT;
  if (!H) return;
  var PAL = H.PAL, nf = H.nf, clamp = H.clamp, fit = H.fit, sig2 = H.sig2, FONT = H.FONT;
  var LY = { PH: 98, TOP: 38, GAP: 14, AX: 26, L: 46, R: 10 };
  var built = [];
  window.LAB_NAME_EXTRA = window.LAB_NAME_EXTRA || {};

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function fmt(v, d) { var a = Math.abs(v); if (d == null) d = a >= 1000 ? 0 : a >= 100 ? 0 : a >= 10 ? 1 : a >= 1 ? 2 : a >= 0.1 ? 3 : 4; return nf(v, d); }
  function niceTicks(a, b, n) {
    var span = b - a; if (!(span > 0)) return { arr: [a], dec: 0 };
    var raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
    var step = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag, arr = [], v = Math.ceil(a / step - 1e-9) * step;
    while (v <= b + step * 1e-6) { arr.push(+v.toPrecision(12)); v += step; }
    return { arr: arr, dec: Math.max(0, -Math.floor(Math.log10(step) + 1e-9)) };
  }
  function range(arrs) {
    var lo = 1e300, hi = -1e300, i, k;
    for (k = 0; k < arrs.length; k++) for (i = 0; i < arrs[k].length; i++) { var v = arrs[k][i]; if (v < lo) lo = v; if (v > hi) hi = v; }
    if (!(hi > lo)) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.08; return [lo - pad, hi + pad];
  }

  /* ---------- vẽ các đồ thị chồng nhau ---------- */
  function paint(L) {
    var d = L.data; if (!d || !L.cv) return;
    var c = L.cv, w = c.clientWidth || 320, n = d.panels.length, per = LY.PH + LY.TOP + LY.GAP, total = n * per + LY.AX;
    var f = fit(c, total / w), g = f.g; w = f.w;
    g.clearRect(0, 0, w, total);
    var xs = d.xs, N = xs.length, idx = clamp(Math.round(L.u * (N - 1)), 0, N - 1), log = !!d.xlog;
    var x0 = log ? Math.log10(xs[0]) : xs[0], x1 = log ? Math.log10(xs[N - 1]) : xs[N - 1];
    var px0 = LY.L, px1 = w - LY.R;
    function X(v) { var t = log ? Math.log10(v) : v; return px0 + (t - x0) / (x1 - x0) * (px1 - px0); }
    g.textBaseline = 'alphabetic';
    d.panels.forEach(function (p, pi) {
      var top = pi * per + LY.TOP, bot = top + LY.PH;
      var lo, hi;
      if (p.min != null && p.max != null) { lo = p.min; hi = p.max; }
      else { var r = range(p.series.map(function (s) { return s.y; })); lo = p.min != null ? p.min : r[0]; hi = p.max != null ? p.max : r[1]; }
      function Y(v) { return bot - (v - lo) / (hi - lo) * LY.PH; }
      // nền, vùng tô
      g.fillStyle = PAL.surface; g.fillRect(px0, top, px1 - px0, LY.PH);
      (p.shade || []).forEach(function (s) { g.fillStyle = s.c; g.globalAlpha = 0.16; g.fillRect(X(s.x0), top, Math.max(1, X(s.x1) - X(s.x0)), LY.PH); g.globalAlpha = 1; });
      // lưới
      var ty = niceTicks(lo, hi, 4);
      g.font = '10.5px ' + FONT; g.fillStyle = PAL.muted; g.textAlign = 'right';
      ty.arr.forEach(function (v) {
        var yy = Y(v); g.strokeStyle = PAL.line; g.lineWidth = 1; g.beginPath(); g.moveTo(px0, yy); g.lineTo(px1, yy); g.stroke();
        g.fillText(nf(v, ty.dec), px0 - 5, yy + 3.5);
      });
      var tx = d.xticks ? d.xticks : (function () { var t = niceTicks(xs[0], xs[N - 1], 5); return t.arr.map(function (v) { return { v: v, t: nf(v, t.dec) }; }); })();
      tx.forEach(function (t) {
        var xx = X(t.v); if (xx < px0 - 1 || xx > px1 + 1) return;
        g.strokeStyle = PAL.line; g.lineWidth = 1; g.beginPath(); g.moveTo(xx, top); g.lineTo(xx, bot); g.stroke();
        if (pi === n - 1) { g.fillStyle = PAL.muted; g.textAlign = 'center'; g.fillText(t.t, xx, bot + 14); }
      });
      g.strokeStyle = PAL.muted; g.lineWidth = 1; g.strokeRect(px0, top, px1 - px0, LY.PH);
      // đường ngang chuẩn
      // 23/10/2026: nhãn đường chuẩn vẽ sau đường dữ liệu, có nền mờ, và tự dời khi hai nhãn sát nhau
      var hl = [];
      (p.hlines || []).forEach(function (h) {
        if (h.y < lo || h.y > hi) return;
        var yy = Y(h.y); g.strokeStyle = h.c || PAL.bad; g.lineWidth = 1.3; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(px0, yy); g.lineTo(px1, yy); g.stroke(); g.setLineDash([]);
        hl.push({ t: h.t, c: h.c || PAL.bad, y: yy < top + 14 ? yy + 12 : yy - 3 });
      });
      // đường dữ liệu
      p.series.forEach(function (s) {
        if (s.fill) {
          g.fillStyle = s.c; g.globalAlpha = 0.18; g.beginPath(); g.moveTo(X(xs[0]), Y(Math.max(lo, Math.min(hi, 0))));
          for (var i = 0; i < N; i++) g.lineTo(X(xs[i]), Y(clamp(s.y[i], lo, hi)));
          g.lineTo(X(xs[N - 1]), Y(Math.max(lo, Math.min(hi, 0)))); g.closePath(); g.fill(); g.globalAlpha = 1;
        }
        g.strokeStyle = s.c; g.lineWidth = s.w || 1.9; g.lineJoin = 'round'; if (s.dash) g.setLineDash(s.dash);
        g.beginPath(); for (var j = 0; j < N; j++) { var yy = Y(clamp(s.y[j], lo - (hi - lo), hi + (hi - lo))); if (j) g.lineTo(X(xs[j]), yy); else g.moveTo(X(xs[j]), yy); }
        g.stroke(); g.setLineDash([]);
      });
      var used = [];
      hl.sort(function (u, v) { return u.y - v.y; }).forEach(function (h) {
        var ly = h.y; while (used.some(function (u) { return Math.abs(u - ly) < 12; })) ly += 12;
        if (ly > bot - 2) ly = h.y - 12;
        used.push(ly);
        g.font = '10.5px ' + FONT; g.textAlign = 'right';
        var tw = g.measureText(h.t).width; g.fillStyle = PAL.surface; g.globalAlpha = 0.85; g.fillRect(px1 - 5 - tw, ly - 9.5, tw + 4, 12.5); g.globalAlpha = 1;
        g.fillStyle = h.c; g.fillText(h.t, px1 - 3, ly);
      });
      // tiêu đề và chú thích kèm giá trị tại con trỏ
      g.textAlign = 'left'; g.font = '600 12px ' + FONT; g.fillStyle = PAL.ink; g.fillText(p.title + (p.unit ? ' (' + p.unit + ')' : ''), px0, top - 22);
      var lx = px0; g.font = '11.5px ' + FONT;
      p.series.forEach(function (s) {
        var v = s.y[idx], txt = s.n + ' ' + (s.f ? s.f(v) : fmt(v));
        var tw = g.measureText(txt).width + 18;
        if (lx + tw > px1 + 4) return;
        g.fillStyle = s.c; g.fillRect(lx, top - 13, 9, 9);
        g.fillStyle = PAL.ink; g.fillText(txt, lx + 13, top - 4.5); lx += tw + 4;
      });
      // chấm tại con trỏ
      p.series.forEach(function (s) { g.fillStyle = s.c; g.beginPath(); g.arc(X(xs[idx]), Y(clamp(s.y[idx], lo, hi)), 3.4, 0, 6.2832); g.fill(); });
    });
    // con trỏ dọc
    var xc = X(xs[idx]); g.strokeStyle = PAL.ink; g.globalAlpha = 0.55; g.lineWidth = 1.2; g.setLineDash([3, 3]);
    g.beginPath(); g.moveTo(xc, LY.TOP - 2); g.lineTo(xc, total - LY.AX); g.stroke(); g.setLineDash([]); g.globalAlpha = 1;
    g.fillStyle = PAL.muted; g.font = '11px ' + FONT; g.textAlign = 'right';
    g.fillText(d.xunit || '', px1, total - 4);
    if (L.spec.draw && L.dv) L.spec.draw(L.dv, L.data, idx);
  }

  /* ---------- dựng giao diện ---------- */
  function build(spec) {
    var sec = el('section', 'lab'); sec.id = 'lab-' + spec.id; sec.hidden = true;
    var card = el('div', 'card'); sec.appendChild(card);
    card.appendChild(el('h2', null, spec.title));
    card.appendChild(el('p', 'lead', spec.lead));
    if (spec.svg) { var sv = el('div'); sv.innerHTML = spec.svg; card.appendChild(sv); }
    var wrap = el('div', 'lk-wrap'); card.appendChild(wrap);
    var dv = null;
    if (spec.draw) { dv = el('canvas'); dv.setAttribute('role', 'img'); dv.setAttribute('aria-label', spec.dlabel || 'Sơ đồ động'); wrap.appendChild(dv); }
    var cv = el('canvas'); cv.id = spec.id + '-c'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', spec.alabel || ('Đồ thị: ' + spec.title)); wrap.appendChild(cv);
    var p = {}, inputs = {}, outs = {};
    (spec.ctrls || []).forEach(function (c) {
      if (c.seg) {
        card.appendChild(el('p', 'band-t', c.label));
        var box = el('div', 'seg'); box.setAttribute('role', 'group'); box.setAttribute('aria-label', c.label);
        p[c.id] = c.val;
        c.opts.forEach(function (o) {
          var b = el('button', null, o.t); b.type = 'button'; b.setAttribute('aria-pressed', o.v === c.val ? 'true' : 'false');
          b.addEventListener('click', function () {
            p[c.id] = o.v; Array.prototype.forEach.call(box.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
            L.update();
          });
          box.appendChild(b);
        });
        card.appendChild(box);
      } else {
        var row = el('div', 'ctrl'), lab = el('label', null, c.label), out = el('output'), inp = el('input');
        var id = spec.id + '-' + c.id; lab.setAttribute('for', id); inp.id = id; inp.type = 'range';
        if (c.log) { inp.min = 0; inp.max = 1000; inp.step = 1; inp.value = Math.round(1000 * Math.log(c.val / c.min) / Math.log(c.max / c.min)); }
        else { inp.min = c.min; inp.max = c.max; inp.step = c.step || 1; inp.value = c.val; }
        row.appendChild(lab); row.appendChild(out); row.appendChild(inp); card.appendChild(row);
        inputs[c.id] = inp; outs[c.id] = out;
      }
    });
    var read = el('div', 'read'); card.appendChild(read);
    var msg = el('div', 'formula'); msg.style.whiteSpace = 'pre-line'; card.appendChild(msg);
    if (spec.notes) card.appendChild(el('p', 'lab-note', spec.notes));
    if (spec.warn) { var wn = el('div', 'warn'); var wb = el('b', null, 'Lưu ý: '); wn.appendChild(wb); wn.appendChild(document.createTextNode(spec.warn)); card.appendChild(wn); }
    if (spec.tryit) {
      var tr = el('div', 'try'); tr.appendChild(el('b', null, 'Thử:')); var ul = el('ul');
      spec.tryit.forEach(function (t) { ul.appendChild(el('li', null, t)); }); tr.appendChild(ul); card.appendChild(tr);
    }
    var foot = document.querySelector('#v-lab .foot'); foot.parentNode.insertBefore(sec, foot);
    var tab = el('button', 'tab', spec.tab); tab.setAttribute('role', 'tab'); tab.setAttribute('data-lab', spec.id); tab.setAttribute('aria-selected', 'false');
    tab.addEventListener('click', function () { H.show(spec.id); });
    document.querySelector('#v-lab .tabs').appendChild(tab);
    window.LAB_NAME_EXTRA[spec.id] = spec.tab;

    var L = { spec: spec, cv: cv, dv: dv ? { cv: dv } : null, u: 0, data: null };
    L.p = p; // 23/10/2026: real4.js đọc giá trị thanh trượt/nút (cách đo, cách kẹp, tải...) để vẽ hình thực tế
    if (dv) {
      L.dv = { c: dv, g: null, w: 0, h: 0 };
    }
    function readParams() {
      (spec.ctrls || []).forEach(function (c) {
        if (c.seg) return;
        var inp = inputs[c.id], v;
        if (c.log) { v = c.min * Math.pow(c.max / c.min, (+inp.value) / 1000); v = c.zero && +inp.value === 0 ? 0 : sig2(v); }
        else v = +inp.value;
        p[c.id] = v; outs[c.id].textContent = c.fmt ? c.fmt(v) : nf(v, 1);
      });
    }
    L.update = function () {
      readParams();
      var d = spec.compute(p);
      L.data = d;
      read.textContent = '';
      (d.reads || []).forEach(function (r) { var cell = el('div'); cell.appendChild(el('small', null, r[0])); cell.appendChild(el('b', null, r[1])); read.appendChild(cell); });
      msg.textContent = d.msg || ''; msg.hidden = !d.msg;
      L.sync(); paint(L);
    };
    L.sync = function () {
      if (!L.dv) return;
      var c = L.dv.c, w = c.clientWidth || 320, hh = Math.round(w * (spec.dratio || 0.5));
      var f = fit(c, hh / w); L.dv.g = f.g; L.dv.w = f.w; L.dv.h = f.h;
    };
    L.resize = function () { L.sync(); paint(L); };
    L.frame = function (dt) {
      if (!dt || !L.data) return;
      L.u += dt / (spec.dur || 9); if (L.u > 1) L.u -= 1;
      paint(L);
    };
    Object.keys(inputs).forEach(function (k) { inputs[k].addEventListener('input', L.update); });
    H.labs[spec.id] = L;
    built.push(L);
    L.update();
    return L;
  }

  /* ---------- trợ giúp cho các mô phỏng ---------- */
  var K = {
    build: build,
    el: el,
    lin: function (a, b, n) { var r = new Float64Array(n), i; for (i = 0; i < n; i++) r[i] = a + (b - a) * i / (n - 1); return r; },
    arr: function (n, fn) { var r = new Float64Array(n), i, isf = typeof fn === 'function'; for (i = 0; i < n; i++) r[i] = isf ? fn(i) : fn; return r; },
    fmt: fmt,
    si: H.si,
    nf: nf,
    PAL: PAL,
    clamp: clamp,
    ft: function (v) { return fmt(v); },
    C: { volt: 'var(--volt)', amp: 'var(--amp)', ok: 'var(--ok)', bad: 'var(--bad)', ink: 'var(--ink)', muted: 'var(--muted)' }
  };
  // màu thật cho canvas (canvas không hiểu var(--...)): lấy lại theo giao diện hiện tại
  Object.defineProperty(K, 'col', { get: function () { return { volt: PAL.volt, amp: PAL.amp, ok: PAL.ok, bad: PAL.bad, ink: PAL.ink, muted: PAL.muted }; } });
  window.LabKit = K;

  /* ---------- ký hiệu sơ đồ nguyên lý (SVG) ---------- */
  var S = {
    open: function (w, h, label) { return '<svg class="res sk" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + label + '">'; },
    close: '</svg>',
    L: function (x1, y1, x2, y2, c) { return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" class="' + (c || 'sk-w') + '"/>'; },
    P: function (d, c) { return '<path d="' + d + '" class="' + (c || 'sk-w') + '"/>'; },
    T: function (x, y, t, c, a) { return '<text x="' + x + '" y="' + y + '" class="' + (c || 'sk-t') + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + t + '</text>'; },
    dot: function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="2.6" class="sk-d"/>'; },
    gnd: function (x, y) { return S.L(x, y, x, y + 6) + S.L(x - 9, y + 6, x + 9, y + 6) + S.L(x - 5, y + 10, x + 5, y + 10) + S.L(x - 2, y + 14, x + 2, y + 14); },
    // điện trở nằm ngang từ (x,y) dài len
    R: function (x, y, len, vert, c) {
      var pts = [[0, 0], [len * 0.14, 0]], i, k = 6, st = (len * 0.72) / k;
      for (i = 0; i < k; i++) pts.push([len * 0.14 + st * (i + 0.5), i % 2 ? 6 : -6]);
      pts.push([len * 0.86, 0]); pts.push([len, 0]);
      var d = pts.map(function (q, j) { var a = vert ? [x + q[1], y + q[0]] : [x + q[0], y + q[1]]; return (j ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1); }).join('');
      return S.P(d, c);
    },
    // tụ điện: tâm (cx,cy), dẫn ngang (vert=false) hoặc dọc
    C: function (cx, cy, vert, c) {
      return vert ? S.L(cx, cy - 18, cx, cy - 3, c) + S.L(cx - 11, cy - 3, cx + 11, cy - 3, c) + S.L(cx - 11, cy + 3, cx + 11, cy + 3, c) + S.L(cx, cy + 3, cx, cy + 18, c)
        : S.L(cx - 18, cy, cx - 3, cy, c) + S.L(cx - 3, cy - 11, cx - 3, cy + 11, c) + S.L(cx + 3, cy - 11, cx + 3, cy + 11, c) + S.L(cx + 3, cy, cx + 18, cy, c);
    },
    // cuộn cảm nằm ngang từ (x,y), 4 vòng
    I: function (x, y, len, c) {
      var r = len / 8, d = 'M' + x + ' ' + y, i; for (i = 0; i < 4; i++) d += 'a' + r + ' ' + r + ' 0 0 1 ' + (2 * r) + ' 0';
      return S.P(d, c);
    },
    // diode tâm (cx,cy), chiều dẫn theo dir: r,l,u,d
    D: function (cx, cy, dir, c) {
      var rot = { r: 0, d: 90, l: 180, u: 270 }[dir];
      return '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + rot + ')">' + S.L(-16, 0, -7, 0, c) + '<path d="M-7 -8L-7 8L7 0Z" class="sk-f"/>' + S.L(7, -8, 7, 8, c) + S.L(7, 0, 16, 0, c) + '</g>';
    },
    // khoá công suất (MOSFET/IGBT) hình hộp, bật thì tô màu
    SW: function (x, y, on, t) { return '<rect x="' + x + '" y="' + y + '" width="30" height="26" rx="4" class="' + (on ? 'sk-on' : 'sk-f') + '"/>' + (t ? S.T(x + 15, y + 17, t, 'sk-t', 'middle') : ''); }
  };
  K.S = S;
})();
