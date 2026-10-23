/* 23/10/2026: "Hình thực tế" cho các mô phỏng Bài 1–6 còn thiếu: mã màu, nối tiếp/song song, tụ nạp xả,
   tụ đôi, diode, cầu chỉnh lưu, tìm lỗi quạt. Cùng cách làm với real.js: mỗi cảnh chèn 1 thẻ .card.real vào đầu
   <section id="lab-...">, vẽ bằng SVG, chỉ chạy hoạt hình khi đang hiện. Số liệu là ví dụ minh hoạ. */
(function () {
  "use strict";
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* bỏ qua */ }
  var NS = "http://www.w3.org/2000/svg", MONO = "ui-monospace,Menlo,Consolas,monospace";
  var scenes = [];

  function $(s, r) { return (r || document).querySelector(s); }
  function nf(v, d) { return (+v).toFixed(d).replace(".", ","); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function si(v, u) { // 4700 → "4,7 kΩ"
    var a = Math.abs(v), p = a >= 1e6 ? [1e6, "M"] : a >= 1e3 ? [1e3, "k"] : a >= 1 || a === 0 ? [1, ""] : a >= 1e-3 ? [1e-3, "m"] : [1e-6, "µ"];
    var x = v / p[0], s = x >= 100 ? nf(x, 0) : x >= 10 ? nf(x, 1) : nf(x, 2);
    if (s.indexOf(",") >= 0) s = s.replace(/0+$/, "").replace(/,$/, ""); // chỉ bỏ số 0 sau dấu phẩy
    return s + " " + p[1] + u;
  }
  function amp(I) { return I < 1 ? nf(I * 1000, I < 0.01 ? 1 : 0) + " mA" : nf(I, 2) + " A"; }
  function card(lab, title, lead) {
    var sec = document.getElementById("lab-" + lab);
    if (!sec) return null;
    var c = document.createElement("div");
    c.className = "card real";
    c.innerHTML = '<h2>' + title + '</h2><p class="lead">' + lead + '</p>';
    sec.insertBefore(c, sec.firstChild);
    return c;
  }
  // Mỗi hình có bộ màu/đổ bóng riêng: id trùng giữa các SVG sẽ trỏ về hình đầu tiên (đang ẩn) và mất màu.
  var svgN = 0;
  function fixIds(svg) {
    var p = svg.getAttribute("data-p");
    Array.prototype.forEach.call(svg.querySelectorAll("*"), function (e) {
      if (e.id && e.id.indexOf("r2-") === 0) e.id = p + e.id.slice(3);
      ["fill", "stroke", "filter"].forEach(function (a) { var v = e.getAttribute(a); if (v && v.indexOf("url(#r2-") === 0) e.setAttribute(a, v.replace("url(#r2-", "url(#" + p)); });
    });
  }
  function mkSvg(c, vb, label) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("data-p", "r2" + (++svgN) + "-");
    s.setAttribute("viewBox", vb); s.setAttribute("class", "real-svg"); s.setAttribute("role", "img"); s.setAttribute("aria-label", label);
    c.appendChild(s); return s;
  }
  function seg(c, label, items, cur, onPick) {
    var w = document.createElement("div");
    w.innerHTML = '<p class="band-t">' + label + '</p>';
    var g = document.createElement("div"); g.className = "seg"; g.setAttribute("role", "group"); g.setAttribute("aria-label", label);
    items.forEach(function (it) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = it[1]; b.dataset.v = it[0];
      b.setAttribute("aria-pressed", String(it[0]) === String(cur) ? "true" : "false");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(g.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        onPick(it[0]);
      });
      g.appendChild(b);
    });
    w.appendChild(g); c.appendChild(w);
    return g;
  }
  function add(c, tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; c.appendChild(e); return e; }
  function readout(el, rows) { el.innerHTML = rows.map(function (r) { return "<div><small>" + r[0] + "</small><b>" + r[1] + "</b></div>"; }).join(""); }
  // chấm chạy dọc đường gấp khúc (giống real.js)
  function plen(p) { var L = 0; for (var i = 0; i < p.length - 1; i++) L += Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]); return L; }
  function ptAt(p, s) {
    var L = plen(p); s = ((s % L) + L) % L;
    for (var i = 0; i < p.length - 1; i++) {
      var d = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
      if (s <= d) { var u = d ? s / d : 0; return [p[i][0] + (p[i + 1][0] - p[i][0]) * u, p[i][1] + (p[i + 1][1] - p[i][1]) * u]; }
      s -= d;
    }
    return p[p.length - 1];
  }
  function pathD(p) { return "M" + p.map(function (q) { return q[0] + " " + q[1]; }).join("L"); }
  function dots(svg, n, r, fill) {
    var g = document.createElementNS(NS, "g"), arr = [];
    for (var i = 0; i < n; i++) { var c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); c.setAttribute("fill", fill); g.appendChild(c); arr.push(c); }
    svg.appendChild(g);
    return { g: g, arr: arr };
  }
  function placeDots(D, path, phase, spacing) {
    var L = plen(path);
    D.arr.forEach(function (c, k) {
      if (k * spacing > L) { c.setAttribute("visibility", "hidden"); return; }
      var p = ptAt(path, k * spacing + phase);
      c.setAttribute("visibility", "visible"); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1));
    });
  }

  // ---- linh kiện vẽ sẵn (chuỗi SVG) ----
  var DEFS =
    '<linearGradient id="r2-dmm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7CB3A"/><stop offset="1" stop-color="#DDA30F"/></linearGradient>' +
    '<linearGradient id="r2-res" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3BF"/><stop offset=".5" stop-color="#DCC394"/><stop offset="1" stop-color="#B99D69"/></linearGradient>' +
    '<linearGradient id="r2-resb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9C8F0"/><stop offset=".5" stop-color="#6D9BD8"/><stop offset="1" stop-color="#4672AE"/></linearGradient>' +
    '<linearGradient id="r2-can" x1="0" x2="1"><stop offset="0" stop-color="#16243F"/><stop offset=".35" stop-color="#2E4F8F"/><stop offset=".6" stop-color="#3D63A8"/><stop offset="1" stop-color="#15223B"/></linearGradient>' +
    '<linearGradient id="r2-alu" x1="0" x2="1"><stop offset="0" stop-color="#8E949B"/><stop offset=".45" stop-color="#E9ECEF"/><stop offset=".6" stop-color="#C9CED6"/><stop offset="1" stop-color="#80868E"/></linearGradient>' +
    '<linearGradient id="r2-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F4F6"/><stop offset="1" stop-color="#A9AFB7"/></linearGradient>' +
    '<linearGradient id="r2-bat" x1="0" x2="1"><stop offset="0" stop-color="#2A2F36"/><stop offset=".55" stop-color="#4A515C"/><stop offset="1" stop-color="#23272D"/></linearGradient>' +
    '<linearGradient id="r2-pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E7A4C"/><stop offset="1" stop-color="#145C38"/></linearGradient>' +
    '<linearGradient id="r2-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C79A"/><stop offset="1" stop-color="#C9A774"/></linearGradient>' +
    '<linearGradient id="r2-base" x1="0" x2="1"><stop offset="0" stop-color="#8C939C"/><stop offset=".5" stop-color="#E4E7EB"/><stop offset="1" stop-color="#7D848D"/></linearGradient>' +
    '<radialGradient id="r2-glass" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".6" stop-color="#EAF1F8" stop-opacity=".55"/><stop offset="1" stop-color="#C9D6E3" stop-opacity=".7"/></radialGradient>' +
    '<radialGradient id="r2-glow"><stop offset="0" stop-color="#FFF4C2"/><stop offset=".35" stop-color="#FFD866" stop-opacity=".75"/><stop offset="1" stop-color="#FFB300" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="r2-red"><stop offset="0" stop-color="#FFD0CC"/><stop offset=".45" stop-color="#FF3B30" stop-opacity=".8"/><stop offset="1" stop-color="#FF3B30" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="r2-spark"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#FFE066"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>' +
    '<filter id="r2-sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".25"/></filter>';

  // đồng hồ vạn năng vàng (góc trên trái x,y; rộng 74, cao 112). id LCD = idp + "-lcd", chữ thang = idp + "-mode"
  function dmm(x, y, idp, mode) {
    return '<g filter="url(#r2-sh)"><rect x="' + x + '" y="' + y + '" width="74" height="112" rx="11" fill="url(#r2-dmm)"/>' +
      '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="62" height="100" rx="7" fill="#2A2E35"/>' +
      '<rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="54" height="24" rx="3" fill="#B9C9A4"/>' +
      '<text id="' + idp + '-lcd" x="' + (x + 60) + '" y="' + (y + 28) + '" text-anchor="end" font-family="' + MONO + '" font-size="13" font-weight="700" fill="#1D2A12">0.00</text>' +
      '<text id="' + idp + '-mode" x="' + (x + 13) + '" y="' + (y + 18) + '" font-size="6.5" fill="#1D2A12">' + mode + '</text>' +
      '<circle cx="' + (x + 37) + '" cy="' + (y + 62) + '" r="17" fill="#3D434C" stroke="#14171B"/>' +
      '<path id="' + idp + '-knob" d="M' + (x + 37) + ' ' + (y + 62) + 'L' + (x + 37) + ' ' + (y + 47) + '" stroke="#F7CB3A" stroke-width="3.5" stroke-linecap="round"/>' +
      '<text x="' + (x + 13) + '" y="' + (y + 50) + '" font-size="7" fill="#C9CED6">V~</text><text x="' + (x + 52) + '" y="' + (y + 50) + '" font-size="7" fill="#C9CED6">V⎓</text>' +
      '<text x="' + (x + 13) + '" y="' + (y + 82) + '" font-size="7" fill="#C9CED6">Ω</text><text x="' + (x + 52) + '" y="' + (y + 82) + '" font-size="7" fill="#C9CED6">→|</text>' +
      '<circle cx="' + (x + 20) + '" cy="' + (y + 96) + '" r="4" fill="#111"/><circle cx="' + (x + 54) + '" cy="' + (y + 96) + '" r="4" fill="#C62828"/>' +
      '<text x="' + (x + 20) + '" y="' + (y + 108) + '" text-anchor="middle" font-size="5.5" fill="#9AA1AD">COM</text><text x="' + (x + 54) + '" y="' + (y + 108) + '" text-anchor="middle" font-size="5.5" fill="#9AA1AD">VΩ</text></g>';
  }
  // que đo: dây cong từ cổng đồng hồ tới đầu que (đầu kim loại ở (tx,ty))
  function probe(id, fx, fy, tx, ty, col) {
    return '<g id="' + id + '"><path class="pl" d="M' + fx + ' ' + fy + ' C ' + fx + ' ' + (fy + 40) + ', ' + tx + ' ' + (ty + 70) + ', ' + tx + ' ' + (ty + 34) + '" fill="none" stroke="' + col + '" stroke-width="2.5"/>' +
      '<rect class="pb" x="' + (tx - 4) + '" y="' + (ty + 8) + '" width="8" height="26" rx="3" fill="' + col + '"/>' +
      '<path class="pt2" d="M' + tx + ' ' + (ty + 8) + 'V' + ty + '" stroke="#C9CED6" stroke-width="2"/></g>';
  }
  function moveProbe(svg, id, fx, fy, tx, ty) {
    var g = $("#" + id, svg); if (!g) return;
    $(".pl", g).setAttribute("d", "M" + fx + " " + fy + " C " + fx + " " + (fy + 40) + ", " + tx + " " + (ty + 70) + ", " + tx + " " + (ty + 34));
    var b = $(".pb", g); b.setAttribute("x", tx - 4); b.setAttribute("y", ty + 8);
    $(".pt2", g).setAttribute("d", "M" + tx + " " + (ty + 8) + "V" + ty);
  }
  function setKnob(svg, idp, x, y, ang) { // ang: -45 V~, 45 V⎓, -135 Ω, 135 diode
    var cx = x + 37, cy = y + 62, a = (ang - 90) * Math.PI / 180;
    $("#" + idp + "-knob", svg).setAttribute("d", "M" + cx + " " + cy + "L" + (cx + 15 * Math.cos(a)).toFixed(1) + " " + (cy + 15 * Math.sin(a)).toFixed(1));
  }
  // bóng đèn sợi đốt có đui (tâm bóng cx,cy) — id glow/fil để đổi độ sáng
  function bulb(cx, cy, id) {
    return '<g id="' + id + '"><circle class="glw" cx="' + cx + '" cy="' + cy + '" r="40" fill="url(#r2-glow)" opacity="0"/>' +
      '<g class="gl"><circle cx="' + cx + '" cy="' + cy + '" r="19" fill="url(#r2-glass)" stroke="#9AA6B3" stroke-width="1.5"/>' +
      '<path d="M' + (cx - 7) + ' ' + (cy + 18) + 'L' + (cx - 8) + ' ' + (cy + 4) + 'M' + (cx + 7) + ' ' + (cy + 18) + 'L' + (cx + 8) + ' ' + (cy + 4) + '" stroke="#8A8F96" stroke-width="1.2"/>' +
      '<path class="fil" d="M' + (cx - 8) + ' ' + (cy + 4) + ' q2 -7 4 0 q2 7 4 0 q2 -7 4 0 q2 7 4 0" fill="none" stroke="#5A3A22" stroke-width="1.8"/>' +
      '<rect x="' + (cx - 9) + '" y="' + (cy + 17) + '" width="18" height="12" rx="2" fill="url(#r2-base)"/>' +
      '<path d="M' + (cx - 9) + ' ' + (cy + 21) + 'h18M' + (cx - 9) + ' ' + (cy + 25) + 'h18" stroke="#6E757E" stroke-width=".8"/></g>' +
      '<rect x="' + (cx - 16) + '" y="' + (cy + 28) + '" width="32" height="14" rx="3" fill="#E9E4D8" stroke="#B9B1A0"/>' +
      '<circle cx="' + (cx - 10) + '" cy="' + (cy + 35) + '" r="2.6" fill="#B8BEC6" stroke="#6E757E"/><circle cx="' + (cx + 10) + '" cy="' + (cy + 35) + '" r="2.6" fill="#B8BEC6" stroke="#6E757E"/></g>';
  }
  function setBulb(svg, id, br, removed) {
    var g = $("#" + id, svg);
    $(".gl", g).setAttribute("opacity", removed ? "0.18" : "1");
    $(".glw", g).setAttribute("opacity", removed ? "0" : Math.pow(clamp(br, 0, 1), 0.6).toFixed(2));
    $(".fil", g).setAttribute("stroke", br < 0.04 ? "#5A3A22" : br < 0.2 ? "#C2410C" : br < 0.6 ? "#F59E0B" : "#FFF3B0");
  }
  // tụ hoá đứng (góc trên trái x,y; rộng w; cao h) — vạch trắng có dấu "−" bên phải
  function ecap(x, y, w, h, l1, l2) {
    var r = w / 2, s = '<g filter="url(#r2-sh)"><rect x="' + x + '" y="' + (y + 4) + '" width="' + w + '" height="' + h + '" rx="5" fill="url(#r2-can)"/>' +
      '<rect x="' + (x + w * 0.66) + '" y="' + (y + 4) + '" width="' + (w * 0.2) + '" height="' + h + '" fill="#D5DBE4" opacity=".9"/>';
    for (var k = 0; k < 4; k++) s += '<text x="' + (x + w * 0.76) + '" y="' + (y + 22 + k * (h - 20) / 4) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#2E4F8F">−</text>';
    s += '<ellipse cx="' + (x + r) + '" cy="' + (y + 5) + '" rx="' + r + '" ry="6" fill="url(#r2-top)" stroke="#7D848D" stroke-width=".8"/>' +
      '<path d="M' + (x + r - 7) + ' ' + (y + 5) + 'h14M' + (x + r) + ' ' + (y + 1) + 'v8" stroke="#80868E" stroke-width="1.2"/>' +
      '<text x="' + (x + w * 0.33) + '" y="' + (y + h * 0.45) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#E9EEF7" transform="rotate(-90 ' + (x + w * 0.33) + ' ' + (y + h * 0.45) + ')">' + l1 + '</text>' +
      '<text x="' + (x + w * 0.33) + '" y="' + (y + h * 0.85) + '" text-anchor="middle" font-size="7" fill="#C9D6EA" transform="rotate(-90 ' + (x + w * 0.33) + ' ' + (y + h * 0.85) + ')">' + l2 + '</text></g>';
    return s;
  }
  var BAND = ['#161616', '#7A4A25', '#D9362C', '#F0892A', '#F1D12B', '#2E9E4F', '#2F6FD6', '#8A4FC8', '#8E949B', '#F5F5F5'];
  var BAND_N = ['Đen', 'Nâu', 'Đỏ', 'Cam', 'Vàng', 'Lục', 'Lam', 'Tím', 'Xám', 'Trắng'];
  var GOLD = '#C9A227', SILVER = '#BFC5CC';

  /* =====================================================================
     1) MÃ MÀU: điện trở thật + đồng hồ đo Ω, đo rời hoặc đo trên bo
     ===================================================================== */
  (function () {
    var c = card("mau", "Hình thực tế: đọc vạch màu rồi đo kiểm tra bằng đồng hồ",
      "Chọn một điện trở trong hộp linh kiện. Đọc vạch màu, rồi xem đồng hồ vạn năng thang Ω đo được bao nhiêu. Thử đo ngay trên bo để thấy vì sao phải nhấc một chân ra.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 230", "Điện trở có vạch màu nằm trên thảm làm việc, hai que đo của đồng hồ vạn năng chạm vào hai chân điện trở");
    var X0 = 252, Y0 = 20; // vị trí đồng hồ
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="0" y="0" width="360" height="230" fill="#2F7A5C"/>' +
      '<g stroke="#5FA386" stroke-width=".7" opacity=".6">' + (function () { var s = ""; for (var i = 20; i < 360; i += 20) s += '<path d="M' + i + ' 0V230"/>'; for (var j = 20; j < 230; j += 20) s += '<path d="M0 ' + j + 'H360"/>'; return s; })() + '</g>' +
      // bo mạch (chỉ hiện khi đo trên bo)
      '<g id="mx-pcb" opacity="0"><rect x="14" y="40" width="226" height="120" rx="8" fill="url(#r2-pcb)"/>' +
      '<path d="M40 100V140H200V100" fill="none" stroke="#3FA36F" stroke-width="4"/>' +
      '<rect x="104" y="130" width="34" height="18" rx="2" fill="#1C1E22"/><text x="121" y="143" text-anchor="middle" font-size="7" fill="#C9CED6">IC</text>' +
      '<text x="121" y="158" text-anchor="middle" font-size="8" fill="#E8F5EC">linh kiện khác nối song song ≈ 2,2 kΩ</text>' +
      '<circle cx="40" cy="100" r="5" fill="#C9A227"/><circle cx="200" cy="100" r="5" fill="#C9A227"/></g>' +
      // chân điện trở
      '<path id="mx-legs" d="M40 100 L66 100 M190 100 L200 100" stroke="#B8BEC6" stroke-width="3" stroke-linecap="round"/>' +
      // thân điện trở dáng "xương" (hai đầu phình)
      '<g filter="url(#r2-sh)"><path id="mx-body" d="M66 86 q0 -8 12 -8 h18 q6 0 8 4 h52 q2 -4 8 -4 h18 q12 0 12 8 v28 q0 8 -12 8 h-18 q-6 0 -8 -4 h-52 q-2 4 -8 4 h-18 q-12 0 -12 -8 z" fill="url(#r2-res)"/>' +
      '<g id="mx-bands"></g>' +
      '<path d="M70 84 q40 -4 110 0" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/></g>' +
      '<text id="mx-cap" x="128" y="70" text-anchor="middle" font-size="11" fill="#E8F5EC"></text>' +
      dmm(X0, Y0, "mx", "AUTO Ω") +
      probe("mx-pr", X0 + 54, Y0 + 96, 200, 100, "#C62828") + probe("mx-pb", X0 + 20, Y0 + 96, 40, 100, "#22262C") +
      '<text x="' + (X0 + 37) + '" y="' + (Y0 + 128) + '" text-anchor="middle" font-size="10" fill="#E8F5EC">thang Ω</text>';
    fixIds(svg);
    setKnob(svg, "mx", X0, Y0, -135);
    var VALS = [10, 220, 1000, 4700, 47000, 100000, 1000000];
    var st = { R: 4700, five: false, onBoard: false, err: 0 };
    seg(c, "Hộp linh kiện", VALS.map(function (v) { return [v, si(v, "Ω")]; }), st.R, function (v) { st.R = v; st.err = (Math.random() * 2 - 1) * 0.6; draw(); });
    seg(c, "Loại điện trở", [["4", "4 vạch (màng than, sai số 5%)"], ["5", "5 vạch (màng kim loại, sai số 1%)"]], "4", function (v) { st.five = v === "5"; st.err = (Math.random() * 2 - 1) * 0.6; draw(); });
    seg(c, "Cách đo", [["off", "Đã nhấc 1 chân khỏi mạch"], ["on", "Đo ngay trên bo"]], "off", function (v) { st.onBoard = v === "on"; draw(); });
    var rd = add(c, "div", "read"), f = add(c, "div", "formula"), w = add(c, "div", "warn"); f.style.whiteSpace = "pre-line"; w.hidden = true;
    function bandsOf(R, five) {
      var nd = five ? 3 : 2, e = Math.floor(Math.log10(R)) - (nd - 1), m = Math.round(R / Math.pow(10, e)), d = String(m).split("").map(Number);
      return { d: d, e: e };
    }
    function draw() {
      var b = bandsOf(st.R, st.five), tol = st.five ? 0.01 : 0.05, cols = b.d.map(function (k) { return BAND[k]; }), names = b.d.map(function (k) { return BAND_N[k]; });
      var mc = b.e >= 0 ? BAND[b.e] : b.e === -1 ? GOLD : SILVER, mn = b.e >= 0 ? BAND_N[b.e] : b.e === -1 ? "Vàng kim" : "Bạc";
      cols.push(mc); names.push(mn);
      var tc = st.five ? BAND[1] : GOLD; names.push(st.five ? "Nâu (±1%)" : "Vàng kim (±5%)");
      var xs = st.five ? [84, 98, 112, 126] : [86, 104, 122], s = "";
      cols.forEach(function (col, i) { s += '<rect x="' + xs[i] + '" y="' + (i === 0 ? 80 : 82) + '" width="9" height="' + (i === 0 ? 40 : 36) + '" fill="' + col + '"/>'; });
      s += '<rect x="168" y="80" width="8" height="40" fill="' + tc + '"/>';
      $("#mx-bands", svg).innerHTML = s;
      $("#mx-body", svg).setAttribute("fill", "url(#" + svg.getAttribute("data-p") + (st.five ? "resb)" : "res)"));
      $("#mx-pcb", svg).setAttribute("opacity", st.onBoard ? "1" : "0");
      $("#mx-cap", svg).textContent = st.onBoard ? "Đang nằm trên bo" : "Đã tháo rời";
      var meas = st.R * (1 + st.err * tol), Ro = 2200, shown = st.onBoard ? meas * Ro / (meas + Ro) : meas;
      var lcd = shown >= 1e6 ? nf(shown / 1e6, 3).replace(",", ".") + "M" : shown >= 1e3 ? (shown >= 1e5 ? nf(shown / 1e3, 1) : nf(shown / 1e3, 2)).replace(",", ".") + "k" : (shown >= 100 ? nf(shown, 1) : nf(shown, 2)).replace(",", ".");
      $("#mx-lcd", svg).textContent = lcd;
      var dig = b.d.join(""), mult = b.e >= 0 ? "thêm " + b.e + " chữ số 0" : b.e === -1 ? "× 0,1" : "× 0,01";
      readout(rd, [["Vạch đọc được", names.slice(0, -1).join(" · ")], ["Giá trị ghi", si(st.R, "Ω") + " ±" + (tol * 100) + "%"],
        ["Khoảng cho phép", si(st.R * (1 - tol), "Ω") + " – " + si(st.R * (1 + tol), "Ω")], ["Đồng hồ hiện", si(shown, "Ω")]]);
      f.textContent = "Vạch số: " + dig + ", vạch nhân: " + mn + " (" + mult + ") → " + si(st.R, "Ω") + "\nVạch sai số: " + names[names.length - 1];
      var bad = st.onBoard && Math.abs(shown - st.R) / st.R > tol;
      w.hidden = !st.onBoard;
      w.innerHTML = bad ? "<b>Đo trên bo bị sai:</b> linh kiện khác nối song song làm số đo nhỏ hơn thật (" + si(shown, "Ω") + " thay vì khoảng " + si(st.R, "Ω") + "). Nhấc một chân điện trở ra rồi đo lại."
        : "<b>Lần này tình cờ gần đúng</b> vì điện trở nhỏ hơn nhiều so với nhánh song song. Với điện trở lớn, đo trên bo sẽ sai rõ. Vẫn nên nhấc một chân ra.";
    }
    draw();
  })();

  /* =====================================================================
     2) NỐI TIẾP / SONG SONG: pin 12 V + 3 bóng đèn trên tấm gỗ
     ===================================================================== */
  (function () {
    var c = card("mach", "Hình thực tế: 3 bóng đèn mắc nối tiếp và song song",
      "Pin 12 V và ba bóng đèn 12 V giống nhau, đấu dây trên tấm gỗ. Đổi kiểu mắc, rồi chạm vào một bóng để tháo nó ra. Xem các bóng còn lại sáng thế nào.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 240", "Pin 12 V nối với ba bóng đèn có đui trên tấm gỗ, dây đấu nối tiếp hoặc song song");
    var BX = [150, 220, 290], BY = 92, RB = 24; // đèn 12 V 6 W
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="4" y="16" width="352" height="214" rx="10" fill="url(#r2-wood)"/>' +
      '<g stroke="#B8955F" stroke-width="1" opacity=".5"><path d="M10 60 q80 -6 170 0 t170 0"/><path d="M10 120 q90 6 180 0 t160 0"/><path d="M10 190 q70 -5 160 0 t180 0"/></g>' +
      '<g id="sx-wires" fill="none" stroke="#C62828" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"></g>' +
      // pin 12 V (hộp pin)
      '<g filter="url(#r2-sh)"><rect x="22" y="96" width="62" height="80" rx="7" fill="url(#r2-bat)"/><rect x="22" y="118" width="62" height="24" fill="#E60012"/>' +
      '<text x="53" y="135" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">12 V</text>' +
      '<rect x="30" y="88" width="14" height="9" rx="2" fill="#C62828"/><rect x="62" y="88" width="14" height="9" rx="2" fill="#20242A"/>' +
      '<text x="37" y="110" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">+</text><text x="69" y="110" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">−</text></g>' +
      bulb(BX[0], BY, "sx-b0") + bulb(BX[1], BY, "sx-b1") + bulb(BX[2], BY, "sx-b2") +
      '<g id="sx-hit">' + BX.map(function (x, i) { return '<rect data-i="' + i + '" x="' + (x - 26) + '" y="' + (BY - 30) + '" width="52" height="80" fill="transparent" style="cursor:pointer"/>'; }).join("") + '</g>' +
      '<text id="sx-lbl0" x="' + BX[0] + '" y="' + (BY - 27) + '" text-anchor="middle" font-size="10" fill="#4A3A22"></text><text id="sx-lbl1" x="' + BX[1] + '" y="' + (BY - 27) + '" text-anchor="middle" font-size="10" fill="#4A3A22"></text><text id="sx-lbl2" x="' + BX[2] + '" y="' + (BY - 27) + '" text-anchor="middle" font-size="10" fill="#4A3A22"></text>' +
      '<text x="180" y="226" text-anchor="middle" font-size="10" fill="#6B5636">Chạm vào bóng để tháo ra / lắp lại</text>';
    fixIds(svg);
    var st = { par: false, out: [false, false, false], ph: [0, 0, 0, 0] }, D = [], paths = [], I = [0, 0, 0, 0];
    for (var k = 0; k < 4; k++) D.push(dots(svg, 26, 2.4, "#B86A00"));
    seg(c, "Kiểu mắc", [["s", "Nối tiếp (dây đèn trang trí cũ)"], ["p", "Song song (đèn trong nhà)"]], "s", function (v) { st.par = v === "p"; draw(); });
    var rd = add(c, "div", "read"), f = add(c, "div", "formula"); f.style.whiteSpace = "pre-line";
    $("#sx-hit", svg).addEventListener("click", function (e) { var i = e.target.getAttribute("data-i"); if (i == null) return; st.out[+i] = !st.out[+i]; draw(); });
    function T(x) { return [[x - 10, BY + 35], [x + 10, BY + 35]]; } // 2 cọc đui
    function draw() {
      var w, n = st.out.filter(function (o) { return !o; }).length;
      if (!st.par) {
        var t0 = T(BX[0]), t1 = T(BX[1]), t2 = T(BX[2]);
        w = [[[37, 88], [37, 40], [BX[0] - 28, 40], [BX[0] - 28, t0[0][1]], t0[0]], [t0[1], [t0[1][0], 160], [t1[0][0], 160], t1[0]], [t1[1], [t1[1][0], 160], [t2[0][0], 160], t2[0]], [t2[1], [t2[1][0], 200], [69, 200], [69, 176]]];
        var open = st.out.some(function (o) { return o; }), Is = open ? 0 : 12 / (3 * RB);
        I = [Is, Is, Is, Is]; paths = w;
        [0, 1, 2].forEach(function (i) { setBulb(svg, "sx-b" + i, st.out[i] ? 0 : Is * Is * RB / 6, st.out[i]); $("#sx-lbl" + i, svg).textContent = st.out[i] ? "đã tháo" : nf(Is * RB, 1) + " V"; });
        readout(rd, [["Dòng chung", amp(Is)], ["Điện áp mỗi bóng", nf(Is * RB, 1) + " V"], ["Độ sáng mỗi bóng", nf(100 * Is * Is * RB / 6, 0) + "%"], ["Bóng đang sáng", open ? "0" : "3"]]);
        f.textContent = open ? "Tháo một bóng là hở mạch: không còn đường cho dòng, cả dây tắt hết." :
          "R tổng = 24 + 24 + 24 = 72 Ω → I = 12 ÷ 72 = " + amp(Is) + "\nMỗi bóng chỉ nhận 12 ÷ 3 = 4 V nên sáng yếu (khoảng 11%).";
      } else {
        w = [];
        var top = [[37, 88], [37, 40], [BX[2] - 28, 40]], bot = [[BX[2] + 10, 200], [69, 200], [69, 176]];
        BX.forEach(function (x, i) { var t = T(x); w.push([[x - 28, 40], [x - 28, t[0][1]], t[0]]); w.push([t[1], [t[1][0], 200]]); });
        var Ib = 12 / RB, It = Ib * n;
        I = [It, Ib, Ib, Ib]; paths = [top.concat([]), [[BX[0] - 28, 40], [BX[0] - 28, BY + 35], T(BX[0])[0]], [[BX[1] - 28, 40], [BX[1] - 28, BY + 35], T(BX[1])[0]], [[BX[2] - 28, 40], [BX[2] - 28, BY + 35], T(BX[2])[0]]];
        w = [top, bot].concat(w);
        [0, 1, 2].forEach(function (i) { setBulb(svg, "sx-b" + i, st.out[i] ? 0 : 1, st.out[i]); $("#sx-lbl" + i, svg).textContent = st.out[i] ? "đã tháo" : "12 V"; });
        readout(rd, [["Dòng tổng từ pin", amp(It)], ["Điện áp mỗi bóng", "12 V"], ["Độ sáng mỗi bóng", "100%"], ["Bóng đang sáng", String(n)]]);
        f.textContent = "Mỗi bóng nối thẳng vào 12 V nên sáng đủ. Dòng mỗi bóng = 12 ÷ 24 = 0,5 A.\nDòng tổng = 0,5 × " + n + " = " + amp(It) + ". Tháo một bóng, các bóng khác vẫn sáng.";
      }
      $("#sx-wires", svg).innerHTML = w.map(function (p) { return '<path d="' + pathD(p) + '"/>'; }).join("") +
        '<path d="M37 88V40" stroke="#C62828"/><path d="M69 176V200" stroke="#22262C"/>';
    }
    draw();
    scenes.push({ root: c, frame: function (dt) {
      for (var k = 0; k < 4; k++) {
        var p = paths[k], on = p && I[k] > 0 && !(st.par && k > 0 && st.out[k - 1]);
        D[k].g.setAttribute("opacity", on ? "1" : "0");
        if (!on) continue;
        st.ph[k] += dt * (15 + 120 * clamp(I[k] / 1.5, 0, 1));
        placeDots(D[k], p, st.ph[k], 16);
      }
    } });
  })();

  /* =====================================================================
     3) TỤ NẠP / XẢ: nguồn 12 V, công tắc 3 vị trí, điện trở, tụ hoá, đèn LED
     ===================================================================== */
  (function () {
    var c = card("tu", "Hình thực tế: tụ hoá nạp qua điện trở, xả qua đèn LED",
      "Gạt công tắc sang Nạp: tụ hoá nạp từ nguồn 12 V qua điện trở. Gạt sang Xả: tụ xả qua điện trở và đèn LED, đèn sáng rồi tắt dần. Đồng hồ đo điện áp hai chân tụ.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 240", "Nguồn 12 V, công tắc gạt, điện trở, tụ hoá màu xanh và đèn LED đỏ trên bo cắm; đồng hồ vạn năng đo điện áp tụ");
    var X0 = 276, Y0 = 18;
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="4" y="8" width="352" height="226" rx="10" fill="#F1F2EC" stroke="#D6D8CE"/>' +
      '<g fill="#D9DBD2">' + (function () { var s = ""; for (var x = 16; x < 262; x += 10) for (var y = 26; y < 222; y += 10) s += '<rect x="' + x + '" y="' + y + '" width="3" height="3" rx=".6"/>'; return s; })() + '</g>' +
      '<g fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M64 52H82V86H108V74" stroke="#C62828"/>' +                 // + nguồn → chân Nạp
      '<path d="M134 74V98" stroke="#3B4049"/><path d="M134 126V130" stroke="#3B4049"/><path d="M134 128H160" stroke="#3B4049"/>' + // chân giữa → R → + tụ
      '<path d="M160 74V86H186V196H204" stroke="#3B4049"/>' +              // chân Xả → chân dài LED
      '<path d="M41 82V208H262" stroke="#22262C"/><path d="M134 184V208M216 196V208" stroke="#22262C"/></g>' +
      '<text x="60" y="222" font-size="8" fill="#4A515E">mass (−)</text>' +
      // nguồn 12 V (cục sạc)
      '<g filter="url(#r2-sh)"><rect x="18" y="30" width="46" height="52" rx="6" fill="#1F2329"/><text x="41" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">12 V</text>' +
      '<text x="41" y="70" text-anchor="middle" font-size="7" fill="#9AA1AD">NGUỒN DC</text><text x="70" y="47" font-size="10" fill="#C62828" font-weight="700">+</text></g>' +
      // công tắc gạt 3 vị trí
      '<g filter="url(#r2-sh)"><rect x="96" y="36" width="76" height="30" rx="5" fill="#2B2F36"/><rect x="102" y="44" width="64" height="14" rx="7" fill="#14171B"/>' +
      '<rect id="tx-sw" x="104" y="40" width="20" height="22" rx="4" fill="#E9ECEF"/></g>' +
      '<path d="M108 66v8M134 66v8M160 66v8" stroke="#B8BEC6" stroke-width="3"/>' +
      '<text x="108" y="30" text-anchor="middle" font-size="9" fill="#4A515E">Nạp</text><text x="134" y="30" text-anchor="middle" font-size="9" fill="#4A515E">Ngắt</text><text x="160" y="30" text-anchor="middle" font-size="9" fill="#4A515E">Xả</text>' +
      // điện trở đứng
      '<g filter="url(#r2-sh)"><rect x="127" y="96" width="14" height="32" rx="7" fill="url(#r2-res)"/>' +
      '<rect id="tx-r0" x="127" y="101" width="14" height="3" fill="#7A4A25"/><rect id="tx-r1" x="127" y="107" width="14" height="3" fill="#161616"/><rect id="tx-r2" x="127" y="113" width="14" height="3" fill="#F0892A"/><rect x="127" y="120" width="14" height="2" fill="#C9A227"/></g>' +
      '<text id="tx-rl" x="146" y="114" font-size="9" fill="#4A515E">R</text>' +
      // đèn LED đỏ
      '<circle id="tx-glow" cx="210" cy="150" r="28" fill="url(#r2-red)" opacity="0"/>' +
      '<path d="M204 168v28M216 168v28" stroke="#B8BEC6" stroke-width="2"/>' +
      '<path d="M198 168 v-18 a12 12 0 0 1 24 0 v18 z" id="tx-led" fill="#8C1D18" opacity=".9" stroke="#5A1310"/><rect x="196" y="166" width="28" height="4" rx="1" fill="#8C1D18"/>' +
      '<text x="232" y="152" font-size="9" fill="#4A515E">LED</text>' +
      // tụ hoá lớn
      '<g id="tx-capg"></g>' +
      dmm(X0, Y0, "tx", "V⎓") +
      probe("tx-pr", X0 + 54, Y0 + 96, 160, 128, "#C62828") + probe("tx-pb", X0 + 20, Y0 + 96, 262, 208, "#22262C");
    fixIds(svg);
    setKnob(svg, "tx", X0, Y0, 45);
    var CS = { 100: "100µF", 470: "470µF", 1000: "1000µF" }, RS = { 1000: ["#7A4A25", "#161616", "#D9362C"], 4700: ["#F1D12B", "#8A4FC8", "#D9362C"], 10000: ["#7A4A25", "#161616", "#F0892A"] };
    var st = { C: 1000, R: 4700, sw: "chg", V: 0 };
    seg(c, "Công tắc", [["chg", "Nạp"], ["off", "Ngắt"], ["dis", "Xả qua LED"]], "chg", function (v) { st.sw = v; paint(); });
    seg(c, "Tụ hoá", [[100, "100 µF"], [470, "470 µF"], [1000, "1000 µF"]], 1000, function (v) { st.C = v; paint(); });
    seg(c, "Điện trở", [[1000, "1 kΩ"], [4700, "4,7 kΩ"], [10000, "10 kΩ"]], 4700, function (v) { st.R = v; paint(); });
    var gauge = add(c, "div", "gauge"); gauge.innerHTML = "<i></i>";
    var rd = add(c, "div", "read"), f = add(c, "div", "formula"); f.style.whiteSpace = "pre-line";
    var dsp = add(c, "div", "seg"), bz = document.createElement("button"); bz.type = "button"; bz.className = "btn"; bz.textContent = "Xả hết về 0 (làm lại)"; dsp.appendChild(bz);
    bz.addEventListener("click", function () { st.V = 0; paint(); });
    var VLED = 1.9;
    function cur() { return st.sw === "chg" ? (12 - st.V) / st.R : st.sw === "dis" ? Math.max(0, st.V - VLED) / st.R : 0; }
    function paint() {
      var tau = st.R * st.C * 1e-6, I = cur();
      $("#tx-sw", svg).setAttribute("x", st.sw === "chg" ? 104 : st.sw === "off" ? 124 : 144);
      $("#tx-capg", svg).innerHTML = ecap(112, 128, 44, 54, CS[st.C], "25V 105°C"); fixIds(svg);
      RS[st.R].forEach(function (col, i) { $("#tx-r" + i, svg).setAttribute("fill", col); });
      $("#tx-rl", svg).textContent = si(st.R, "Ω");
      $("#tx-lcd", svg).textContent = nf(st.V, 2).replace(",", ".");
      var br = st.sw === "dis" ? clamp(Math.sqrt(I / 0.006), 0, 1) : 0; // mắt thấy LED vẫn sáng rõ ở vài mA
      $("#tx-glow", svg).setAttribute("opacity", br.toFixed(2)); $("#tx-led", svg).setAttribute("fill", br > 0.05 ? "#FF4B3E" : "#8C1D18");
      gauge.firstChild.style.width = (100 * st.V / 12) + "%";
      readout(rd, [["Điện áp tụ", nf(st.V, 2) + " V (" + nf(100 * st.V / 12, 0) + "%)"], ["Dòng lúc này", amp(I)], ["τ = R × C", tau >= 1 ? nf(tau, 1) + " s" : nf(tau * 1000, 0) + " ms"], ["Chờ 5τ", 5 * tau >= 1 ? nf(5 * tau, 1) + " s" : nf(5 * tau * 1000, 0) + " ms"]]);
      f.textContent = st.sw === "chg" ? "Nạp: dòng lớn lúc đầu (12 V ÷ R), nhỏ dần khi tụ đầy. Sau 1τ đạt 63%, sau 5τ gần đầy." :
        st.sw === "dis" ? "Xả: tụ đẩy dòng qua điện trở và LED. LED sáng mạnh lúc đầu rồi tắt dần khi điện áp tụ xuống dưới khoảng 1,9 V (LED ngừng dẫn).\nPhần điện còn lại dưới 1,9 V vẫn nằm trong tụ: đo lại trước khi chạm." :
        "Ngắt: tụ giữ nguyên điện áp dù đã rút nguồn. Đây là lý do tụ trên bo vẫn nguy hiểm sau khi tắt máy.";
    }
    paint();
    var tAcc = 0;
    scenes.push({ root: c, phys: true, frame: function (dt) {
      var tau = st.R * st.C * 1e-6;
      if (st.sw === "chg") st.V = 12 - (12 - st.V) * Math.exp(-dt / tau);
      else if (st.sw === "dis" && st.V > VLED) st.V = VLED + (st.V - VLED) * Math.exp(-dt / tau);
      tAcc += dt; if (tAcc > 0.06) { tAcc = 0; paint(); }
    } });
  })();

  /* =====================================================================
     4) TỤ ĐÔI: tụ CBB65 thật, kẹp điện trở xả vào từng cặp chân
     ===================================================================== */
  (function () {
    var c = card("doi", "Hình thực tế: xả tụ đôi trong dàn nóng",
      "Tụ đôi vỏ nhôm, ba cụm cọc C, HERM, FAN. Máy vừa tắt, hai phần tụ còn khoảng 300 V. Kẹp điện trở xả vào từng cặp, đo bằng đồng hồ rồi mới chạm tay. Thử cả cách sai: chập bằng tua vít.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 250", "Tụ đôi hình trụ vỏ nhôm, mặt trên có ba cọc HERM, C, FAN; điện trở xả gốm trắng có hai kẹp cá sấu; đồng hồ vạn năng đo điện áp");
    var P = { H: [96, 70], C: [138, 62], F: [180, 70] }, X0 = 270, Y0 = 16;
    function spade(x, y, lab) {
      return '<rect x="' + (x - 7) + '" y="' + (y - 16) + '" width="14" height="18" rx="1.5" fill="url(#r2-alu)" stroke="#6E757E"/><rect x="' + (x - 2) + '" y="' + (y - 12) + '" width="4" height="7" rx="1" fill="#6E757E"/>' +
        '<text x="' + x + '" y="' + (y + 27) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#1D2127">' + lab + '</text>';
    }
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="0" y="0" width="360" height="250" fill="#E4E8EC"/><rect x="0" y="200" width="360" height="50" fill="#C9CED6"/>' +
      // thân tụ
      '<g filter="url(#r2-sh)"><rect x="70" y="72" width="136" height="150" rx="6" fill="url(#r2-alu)"/>' +
      '<rect x="78" y="118" width="120" height="70" rx="3" fill="#F4F6F9" stroke="#B8BEC6"/>' +
      '<text x="138" y="136" text-anchor="middle" font-size="10" font-weight="700" fill="#1D2127">CBB65</text>' +
      '<text x="138" y="152" text-anchor="middle" font-size="10" fill="#1D2127">35 + 5 µF ±5%</text>' +
      '<text x="138" y="166" text-anchor="middle" font-size="9" fill="#4A515E">450 VAC  50/60Hz</text>' +
      '<text x="138" y="180" text-anchor="middle" font-size="8" fill="#4A515E">HERM · C · FAN</text>' +
      '<ellipse cx="138" cy="72" rx="68" ry="13" fill="url(#r2-top)" stroke="#80868E"/>' +
      '<ellipse cx="138" cy="70" rx="56" ry="9" fill="#2B2F36"/></g>' +
      spade(P.H[0], P.H[1], "HERM") + spade(P.C[0], P.C[1], "C") + spade(P.F[0], P.F[1], "FAN") +
      // điện trở xả gốm 5 W + dây + 2 kẹp
      '<g id="dx-tool"><path id="dx-w1" fill="none" stroke="#C62828" stroke-width="2.5"/><path id="dx-w2" fill="none" stroke="#22262C" stroke-width="2.5"/>' +
      '<g filter="url(#r2-sh)"><rect x="20" y="20" width="62" height="20" rx="2" fill="#F5F3EE" stroke="#BDB7AA"/><text x="51" y="34" text-anchor="middle" font-size="8" fill="#4A515E" id="dx-rt">20KΩ 5W</text></g>' +
      '<g id="dx-c1"><path d="M-6 -10 L6 -10 L4 4 L-4 4 Z" fill="#C62828"/><path d="M-3 4 L-2 10 M3 4 L2 10" stroke="#9AA1AD" stroke-width="2"/></g>' +
      '<g id="dx-c2"><path d="M-6 -10 L6 -10 L4 4 L-4 4 Z" fill="#22262C"/><path d="M-3 4 L-2 10 M3 4 L2 10" stroke="#9AA1AD" stroke-width="2"/></g></g>' +
      // tua vít
      '<g id="dx-sd" opacity="0"><path d="M60 8 L132 50" stroke="#B8BEC6" stroke-width="4" stroke-linecap="round"/><path d="M14 -18 L62 10" stroke="#E0A812" stroke-width="12" stroke-linecap="round"/></g>' +
      '<circle id="dx-spk" cx="117" cy="56" r="34" fill="url(#r2-spark)" opacity="0"/>' +
      dmm(X0, Y0, "dx", "V~ / V⎓") +
      probe("dx-pr", X0 + 54, Y0 + 96, P.C[0] + 4, P.C[1] - 16, "#C62828") + probe("dx-pb", X0 + 20, Y0 + 96, P.H[0] + 4, P.H[1] - 16, "#22262C") +
      '<g id="dx-hand" opacity="0"><path d="M210 40 q20 -10 34 6 l-8 10 q-10 -8 -22 -4z" fill="#E7B48F" stroke="#B9835F"/></g>' +
      '<rect id="dx-flash" x="0" y="0" width="360" height="250" fill="#E60012" opacity="0"/>';
    fixIds(svg);
    setKnob(svg, "dx", X0, Y0, 45);
    var st = { vh: 300, vf: 300, R: 20000, clip: null, meter: "H", spark: 0, flash: 0, sd: false };
    var Ch = 35e-6, Cf = 5e-6;
    seg(c, "Kẹp điện trở xả vào", [["H", "C – HERM"], ["F", "C – FAN"], ["", "Gỡ ra"], ["sd", "Chập bằng tua vít (sai)"]], "", function (v) {
      if (v === "sd") { st.sd = true; st.clip = null; st.spark = 1; st.vh = 0; st.vf = st.vf; warn.hidden = false;
        warn.innerHTML = "<b>Không làm như vậy.</b> Chập tua vít là điện trở gần 0: dòng xả tức thời hàng trăm, hàng nghìn ampe, tia lửa làm cháy rỗ cọc, mòn đầu tua vít, có thể hỏng tụ và bỏng tay. Phần FAN vẫn còn điện vì chưa chập tới."; }
      else { st.sd = false; st.clip = v || null; warn.hidden = true; }
      paint();
    });
    seg(c, "Điện trở xả", [[2000, "2 kΩ"], [20000, "20 kΩ 5 W"], [100000, "100 kΩ"]], 20000, function (v) { st.R = v; paint(); });
    seg(c, "Đồng hồ đo", [["H", "C – HERM"], ["F", "C – FAN"]], "H", function (v) { st.meter = v; paint(); });
    var row = add(c, "div", "seg"), bT = document.createElement("button"), bR = document.createElement("button");
    bT.type = bR.type = "button"; bT.className = bR.className = "btn"; bT.textContent = "Chạm tay vào cọc"; bR.textContent = "Máy vừa tắt (nạp lại 300 V)"; row.appendChild(bT); row.appendChild(bR);
    var rd = add(c, "div", "read"), warn = add(c, "div", "warn"), msg = add(c, "div", "formula"); warn.hidden = true; msg.style.whiteSpace = "pre-line";
    bR.addEventListener("click", function () { st.vh = st.vf = 300; st.sd = false; warn.hidden = true; paint(); });
    bT.addEventListener("click", function () {
      var v = Math.max(st.vh, st.vf); warn.hidden = false;
      if (v > 50) { st.flash = 1; warn.innerHTML = "<b>BỊ GIẬT!</b> Còn " + nf(v, 0) + " V trên tụ. Luôn xả cả hai phần và đo xác nhận dưới khoảng 50 V (tốt nhất gần 0 V) trước khi chạm."; }
      else warn.innerHTML = "<b>An toàn để chạm:</b> cả hai phần đã gần 0 V (" + nf(v, 1) + " V).";
      $("#dx-hand", svg).setAttribute("opacity", "1"); setTimeout(function () { $("#dx-hand", svg).setAttribute("opacity", "0"); }, 900);
    });
    function placeClip(id, p) { $("#" + id, svg).setAttribute("transform", "translate(" + p[0] + " " + (p[1] - 26) + ")"); }
    function paint() {
      var a = st.clip === "H" ? P.H : st.clip === "F" ? P.F : null;
      if (a) { placeClip("dx-c1", P.C); placeClip("dx-c2", a); }
      else { placeClip("dx-c1", [30, 64]); placeClip("dx-c2", [70, 64]); }
      var c1 = a ? P.C : [30, 64], c2 = a ? a : [70, 64];
      $("#dx-w1", svg).setAttribute("d", "M20 30 C 6 30, " + c1[0] + " " + (c1[1] - 80) + ", " + c1[0] + " " + (c1[1] - 36));
      $("#dx-w2", svg).setAttribute("d", "M82 30 C 96 30, " + c2[0] + " " + (c2[1] - 80) + ", " + c2[0] + " " + (c2[1] - 36));
      $("#dx-tool", svg).setAttribute("opacity", st.sd ? ".25" : "1");
      $("#dx-sd", svg).setAttribute("opacity", st.sd ? "1" : "0");
      $("#dx-rt", svg).textContent = si(st.R, "Ω").replace(" ", "").toUpperCase().replace("Ω", "Ω") + (st.R === 20000 ? " 5W" : "");
      var m = st.meter === "H" ? P.H : P.F, v = st.meter === "H" ? st.vh : st.vf;
      moveProbe(svg, "dx-pb", X0 + 20, Y0 + 96, m[0] + 4, m[1] - 16);
      $("#dx-lcd", svg).textContent = v >= 100 ? nf(v, 0) : nf(v, 1).replace(",", ".");
      var sh = 5 * st.R * Ch, sf = 5 * st.R * Cf, I0 = 300 / st.R, P0 = 300 * 300 / st.R;
      readout(rd, [["Phần HERM (máy nén)", nf(st.vh, st.vh < 10 ? 1 : 0) + " V"], ["Phần FAN (quạt)", nf(st.vf, st.vf < 10 ? 1 : 0) + " V"],
        ["Dòng xả ban đầu", amp(I0)], ["Công suất ban đầu", nf(P0, P0 < 10 ? 1 : 0) + " W"]]);
      msg.textContent = "Chờ khoảng 5τ: phần HERM " + nf(sh, 1) + " s, phần FAN " + nf(sf, 2) + " s (τ = R × C).\n" +
        (st.R === 2000 ? "Điện trở nhỏ: xả nhanh nhưng công suất ban đầu " + nf(P0, 0) + " W, điện trở loại nhỏ sẽ nóng cháy." : st.R === 100000 ? "Điện trở lớn: an toàn nhưng chờ lâu hơn." : "20 kΩ 5 W: xả vài giây, công suất vừa phải. Đây là lựa chọn hay dùng.");
    }
    paint();
    var acc = 0;
    scenes.push({ root: c, phys: true, frame: function (dt) {
      if (st.clip === "H") st.vh *= Math.exp(-dt / (st.R * Ch)); else if (st.clip === "F") st.vf *= Math.exp(-dt / (st.R * Cf));
      if (st.vh < 0.05) st.vh = 0; if (st.vf < 0.05) st.vf = 0;
      st.spark = Math.max(0, st.spark - dt * 1.6); $("#dx-spk", svg).setAttribute("opacity", (st.spark * (0.6 + 0.4 * Math.sin(st.spark * 50))).toFixed(2));
      st.flash = Math.max(0, st.flash - dt * 2); $("#dx-flash", svg).setAttribute("opacity", (st.flash * 0.35).toFixed(2));
      acc += dt; if (acc > 0.08) { acc = 0; paint(); }
    } });
  })();

  /* =====================================================================
     5) DIODE: 1N4007 trong mạch pin 9 V + LED, và đo bằng thang diode
     ===================================================================== */
  (function () {
    var c = card("diode", "Hình thực tế: diode 1N4007, pin 9 V và đèn LED",
      "Diode thân đen, vạch bạc là chân K (cathode). Lắp vào mạch pin 9 V có đèn LED: lắp đúng chiều thì đèn sáng, lật ngược thì tắt. Bên dưới là cách đo diode bằng thang diode của đồng hồ.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 270", "Pin 9 V nối diode, điện trở và đèn LED đỏ; bên dưới đồng hồ vạn năng thang diode đo một diode");
    function diode(x, y, flip, id) { // thân đen, vạch bạc phía K
      return '<g id="' + id + '" transform="translate(' + x + ' ' + y + ')' + (flip ? ' scale(-1 1)' : '') + '">' +
        '<path d="M-36 0H-16M16 0H36" stroke="#B8BEC6" stroke-width="2.5"/><rect x="-16" y="-8" width="32" height="16" rx="4" fill="#1C1E22"/>' +
        '<rect x="7" y="-8" width="5" height="16" fill="#C9CED6"/><path d="M-12 -5 h16" stroke="#3A3F46" stroke-width="1.5"/></g>';
    }
    var X0 = 30, Y0 = 150;
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="0" y="0" width="360" height="132" fill="#F1F2EC"/><rect x="0" y="132" width="360" height="138" fill="#2F7A5C"/>' +
      '<g fill="none" stroke-width="3" stroke-linejoin="round"><path d="M62 40H104" stroke="#C62828"/><path d="M176 40H200" stroke="#3B4049"/><path d="M236 40H272V64" stroke="#3B4049"/><path d="M272 104V118H40V96" stroke="#22262C"/></g>' +
      // pin 9 V
      '<g filter="url(#r2-sh)"><rect x="18" y="38" width="44" height="60" rx="5" fill="#2A2F36"/><rect x="18" y="56" width="44" height="22" fill="#F0B400"/>' +
      '<text x="40" y="72" text-anchor="middle" font-size="12" font-weight="800" fill="#1D2127">9V</text>' +
      '<rect x="24" y="30" width="12" height="9" rx="2" fill="#B8BEC6"/><path d="M48 30h10l-2 9h-6z" fill="#B8BEC6"/></g>' +
      '<g id="dx-d1wrap">' + diode(140, 40, false, "di-d1") + '</g>' +
      '<text id="di-tag" x="140" y="22" text-anchor="middle" font-size="9" fill="#4A515E">1N4007</text>' +
      // điện trở 470
      '<g filter="url(#r2-sh)"><rect x="200" y="33" width="36" height="14" rx="7" fill="url(#r2-res)"/><rect x="207" y="33" width="3" height="14" fill="#F1D12B"/><rect x="213" y="33" width="3" height="14" fill="#8A4FC8"/><rect x="219" y="33" width="3" height="14" fill="#7A4A25"/><rect x="228" y="33" width="2" height="14" fill="#C9A227"/></g>' +
      '<text x="218" y="62" text-anchor="middle" font-size="9" fill="#4A515E">470 Ω</text>' +
      // LED
      '<circle id="di-glow" cx="272" cy="78" r="30" fill="url(#r2-red)" opacity="0"/>' +
      '<path id="di-led" d="M262 96 v-18 a10 10 0 0 1 20 0 v18 z" fill="#8C1D18" stroke="#5A1310"/><rect x="260" y="94" width="24" height="4" rx="1" fill="#8C1D18"/>' +
      '<text x="300" y="80" font-size="9" fill="#4A515E">LED</text>' +
      '<text id="di-cur" x="150" y="96" text-anchor="middle" font-size="10" fill="#4A515E"></text>' +
      // đo bằng đồng hồ (nền thảm xanh)
      dmm(X0, Y0 - 6, "di", "→|") +
      '<g transform="translate(230 196)"><path d="M-46 0H-16M16 0H46" stroke="#B8BEC6" stroke-width="3"/><rect x="-16" y="-10" width="32" height="20" rx="5" fill="#1C1E22"/><rect x="7" y="-10" width="6" height="20" fill="#C9CED6"/>' +
      '<text x="-46" y="22" font-size="10" fill="#E8F5EC">A</text><text x="40" y="22" font-size="10" fill="#E8F5EC">K</text></g>' +
      probe("di-pr", X0 + 54, Y0 + 90, 186, 196, "#C62828") + probe("di-pb", X0 + 20, Y0 + 90, 274, 196, "#22262C");
    fixIds(svg);
    setKnob(svg, "di", X0, Y0 - 6, 135);
    var st = { flip: false, state: "good", rev: false, ph: 0 };
    var row = add(c, "div", "seg"), bF = document.createElement("button"); bF.type = "button"; bF.className = "btn"; bF.textContent = "Lật ngược diode"; row.appendChild(bF);
    bF.addEventListener("click", function () { st.flip = !st.flip; paint(); });
    seg(c, "Tình trạng diode", [["good", "Tốt"], ["short", "Chập"], ["open", "Đứt"]], "good", function (v) { st.state = v; paint(); });
    seg(c, "Đặt que đo", [["f", "Que đỏ vào A, que đen vào K"], ["r", "Đảo que"]], "f", function (v) { st.rev = v === "r"; paint(); });
    var rd = add(c, "div", "read"), msg = add(c, "div", "formula"); msg.style.whiteSpace = "pre-line";
    var D = dots(svg, 18, 2.4, "#B86A00"), path = [[62, 40], [104, 40], [176, 40], [200, 40], [236, 40], [272, 40], [272, 64], [272, 104], [272, 118], [40, 118], [40, 96]], I = 0;
    function paint() {
      $("#dx-d1wrap", svg).innerHTML = diode(140, 40, st.flip, "di-d1");
      var fwd = !st.flip, conduct = st.state === "short" || (st.state === "good" && fwd);
      var vd = st.state === "short" ? 0 : 0.7; I = conduct ? (9 - vd - 1.9) / 470 : 0;
      var br = clamp(I / 0.015, 0, 1);
      $("#di-glow", svg).setAttribute("opacity", br.toFixed(2)); $("#di-led", svg).setAttribute("fill", br > 0.05 ? "#FF4B3E" : "#8C1D18");
      $("#di-cur", svg).textContent = conduct ? "Dòng ≈ " + amp(I) : "Không có dòng";
      var lcd = st.state === "short" ? "0.003" : st.state === "open" ? "OL" : st.rev ? "OL" : "0.583";
      $("#di-lcd", svg).textContent = lcd;
      moveProbe(svg, "di-pr", X0 + 54, Y0 + 90, st.rev ? 274 : 186, 196); moveProbe(svg, "di-pb", X0 + 20, Y0 + 90, st.rev ? 186 : 274, 196);
      readout(rd, [["Chiều lắp trong mạch", fwd ? "Thuận (vạch bạc về phía LED)" : "Ngược"], ["Đèn LED", conduct ? "Sáng" : "Tắt"], ["Đồng hồ thang diode", lcd === "OL" ? "OL (quá thang)" : lcd.replace(".", ",") + " V"]]);
      msg.textContent = st.state === "good" ? "Diode tốt: chiều thuận đo khoảng 0,5–0,7 V, đảo que thì OL. Trong mạch, lắp ngược là chặn dòng nên đèn tắt." :
        st.state === "short" ? "Diode chập: đo hai chiều đều gần 0 V. Trong mạch lắp chiều nào đèn cũng sáng, diode không còn chặn chiều ngược." :
        "Diode đứt: đo hai chiều đều OL. Trong mạch lắp chiều nào đèn cũng tắt.";
    }
    paint();
    scenes.push({ root: c, frame: function (dt) { D.g.setAttribute("opacity", I > 0 ? "1" : "0"); if (I > 0) { st.ph += dt * 60; placeDots(D, path, st.ph, 18); } } });
  })();

  /* =====================================================================
     6) CẦU CHỈNH LƯU: biến áp, cầu diode, tụ lọc, quạt 12 V và máy hiện sóng
     ===================================================================== */
  (function () {
    var c = card("cau", "Hình thực tế: bộ nguồn biến áp, cầu diode, tụ lọc và quạt 12 V",
      "Điện 220 V qua biến áp còn khoảng 12 V xoay chiều, qua cầu diode thành một chiều nhấp nhô, tụ lọc làm phẳng rồi cấp cho quạt 12 V. Màn hình máy hiện sóng cho thấy điện áp cấp cho quạt.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 270", "Phích cắm 220 V, biến áp lõi thép, cầu diode dẹt màu đen, tụ hoá, quạt 12 V vuông; màn hình máy hiện sóng");
    var blades = ""; for (var k = 0; k < 7; k++) blades += '<path d="M0 0 C 4 -4, 14 -8, 20 -3 C 14 2, 5 3, 0 0Z" fill="#3A3F46" transform="rotate(' + (k * 360 / 7) + ')"/>';
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="0" y="0" width="360" height="270" fill="#E9ECEF"/>' +
      '<g fill="none" stroke-width="3" stroke-linejoin="round"><path d="M28 70V52H48" stroke="#8A5A2B"/><path d="M28 98V116H48" stroke="#2F6FD6"/>' +
      '<path d="M108 66H134" stroke="#C27C4A"/><path d="M108 100H122V112H134" stroke="#C27C4A"/>' +
      '<path d="M178 70H214V64" stroke="#C62828"/><path d="M178 102H236V112" stroke="#22262C"/><path d="M214 64H272" stroke="#C62828"/><path d="M236 112H300" stroke="#22262C"/></g>' +
      // phích cắm
      '<g filter="url(#r2-sh)"><rect x="8" y="70" width="28" height="28" rx="6" fill="#F4F6F9" stroke="#AEB5BF"/><path d="M4 78h6M4 90h6" stroke="#B8BEC6" stroke-width="3"/></g><text x="22" y="132" text-anchor="middle" font-size="9" fill="#4A515E">220 V</text>' +
      // biến áp
      '<g filter="url(#r2-sh)"><rect x="48" y="44" width="60" height="80" rx="3" fill="#6E757E"/>' +
      (function () { var s = ""; for (var y = 48; y < 122; y += 4) s += '<path d="M48 ' + y + 'H108" stroke="#5A6068" stroke-width="1"/>'; return s; })() +
      '<rect x="56" y="54" width="44" height="60" rx="4" fill="#B5651D"/>' +
      (function () { var s = ""; for (var y = 56; y < 112; y += 3) s += '<path d="M56 ' + y + 'H100" stroke="#8E4A12" stroke-width=".8"/>'; return s; })() +
      '<rect x="60" y="72" width="36" height="22" fill="#F4E8C9"/><text x="78" y="82" text-anchor="middle" font-size="6.5" fill="#1D2127">220V</text><text x="78" y="90" text-anchor="middle" font-size="6.5" fill="#1D2127">→12V</text></g>' +
      // cầu diode dẹt (GBU)
      '<g filter="url(#r2-sh)"><rect x="134" y="54" width="44" height="58" rx="3" fill="#1C1E22"/>' +
      '<text x="156" y="72" text-anchor="middle" font-size="8" fill="#C9CED6">~  +  −  ~</text><text x="156" y="92" text-anchor="middle" font-size="7" fill="#9AA1AD">GBU406</text>' +
      '<rect id="cx-bad" x="138" y="58" width="36" height="50" rx="3" fill="none" stroke="#FFC94A" stroke-width="2" stroke-dasharray="4 3" opacity="0"/></g>' +
      '<text x="156" y="128" text-anchor="middle" font-size="9" fill="#4A515E">cầu diode</text>' +
      '<g id="cx-capg"></g>' +
      // quạt 12 V
      '<g filter="url(#r2-sh)"><rect x="272" y="40" width="80" height="80" rx="8" fill="#1F2329"/><circle cx="312" cy="80" r="34" fill="#2B2F36"/>' +
      '<g id="cx-fan" transform="translate(312 80)">' + blades + '<circle r="9" fill="#14171B"/><circle r="4" fill="#E60012"/></g>' +
      '<circle cx="278" cy="46" r="2.5" fill="#6E757E"/><circle cx="346" cy="46" r="2.5" fill="#6E757E"/><circle cx="278" cy="114" r="2.5" fill="#6E757E"/><circle cx="346" cy="114" r="2.5" fill="#6E757E"/></g>' +
      '<text x="312" y="134" text-anchor="middle" font-size="9" fill="#4A515E">Quạt 12 V DC</text>' +
      // máy hiện sóng
      '<g filter="url(#r2-sh)"><rect x="20" y="146" width="320" height="116" rx="10" fill="#2A2E35"/>' +
      '<rect x="30" y="154" width="236" height="100" rx="4" fill="#0E1A12"/>' +
      '<g stroke="#1F3A27" stroke-width="1">' + (function () { var s = ""; for (var x = 30; x <= 266; x += 29.5) s += '<path d="M' + x.toFixed(1) + ' 154V254"/>'; for (var y = 154; y <= 254; y += 20) s += '<path d="M30 ' + y + 'H266"/>'; return s; })() + '</g>' +
      '<path id="cx-tr" fill="none" stroke="#5CF08A" stroke-width="2"/>' +
      '<path id="cx-avg" fill="none" stroke="#FFC94A" stroke-width="1" stroke-dasharray="4 3"/>' +
      '<text x="34" y="166" font-size="8" fill="#5CF08A" font-family="' + MONO + '">CH1 5V/ô  5ms/ô</text>' +
      '<circle cx="290" cy="178" r="10" fill="#4A515C"/><circle cx="318" cy="178" r="10" fill="#4A515C"/><circle cx="290" cy="208" r="10" fill="#4A515C"/><circle cx="318" cy="208" r="10" fill="#4A515C"/>' +
      '<rect x="280" y="232" width="48" height="14" rx="3" fill="#1D2127"/><text x="304" y="242" text-anchor="middle" font-size="7" fill="#9AA1AD">OSCILLOSCOPE</text></g>';
    fixIds(svg);
    var st = { C: 1000, R: 24, broken: false, ang: 0 };
    seg(c, "Tụ lọc", [[0, "Không có tụ"], [220, "220 µF"], [1000, "1000 µF"]], 1000, function (v) { st.C = v; calc(); });
    seg(c, "Tải", [[120, "Quạt nhỏ (nhẹ)"], [24, "Quạt lớn (nặng)"]], 24, function (v) { st.R = v; calc(); });
    seg(c, "Cầu diode", [["ok", "Tốt"], ["bad", "Đứt 1 diode"]], "ok", function (v) { st.broken = v === "bad"; calc(); });
    var rd = add(c, "div", "read"), msg = add(c, "div", "formula"); msg.style.whiteSpace = "pre-line";
    var Vp = 12 * Math.SQRT2, spd = 0;
    function calc() {
      $("#cx-capg", svg).innerHTML = st.C ? ecap(206, 70, 30, 46, st.C + "µF", "25V") : '<text x="222" y="100" text-anchor="middle" font-size="9" fill="#B42318">không tụ</text>'; fixIds(svg);
      $("#cx-bad", svg).setAttribute("opacity", st.broken ? "1" : "0");
      var dt = 5e-5, N = 1200, v = 0, out = [], i, Cf = st.C * 1e-6; // 60 ms, lấy 40 ms cuối
      for (i = 0; i < N; i++) {
        var t = i * dt, s = Math.sin(2 * Math.PI * 50 * t), rect = st.broken ? (s > 0 ? Vp * s - 1.4 : 0) : Math.abs(Vp * s) - 1.4;
        rect = Math.max(0, rect);
        if (Cf) v = rect > v ? rect : v * Math.exp(-dt / (st.R * Cf)); else v = rect;
        if (i >= 400) out.push(v);
      }
      var mx = Math.max.apply(null, out), mn = Math.min.apply(null, out), avg = out.reduce(function (a, b) { return a + b; }, 0) / out.length;
      var d = "", X = function (k) { return 30 + 236 * k / (out.length - 1); }, Y = function (u) { return 254 - u * 4; }; // 5 V/ô (20 px)
      out.forEach(function (u, k) { d += (k ? "L" : "M") + X(k).toFixed(1) + " " + Y(u).toFixed(1); });
      $("#cx-tr", svg).setAttribute("d", d); $("#cx-avg", svg).setAttribute("d", "M30 " + Y(avg).toFixed(1) + "H266");
      spd = clamp(avg / 12, 0, 1.2);
      readout(rd, [["Điện áp đỉnh", nf(mx, 1) + " V"], ["Trung bình (quạt nhận)", nf(avg, 1) + " V"], ["Gợn sóng", nf(mx - mn, 1) + " V"], ["Số xung mỗi giây", st.broken ? "50" : "100"]]);
      msg.textContent = (!st.C ? "Không có tụ: điện áp về 0 sau mỗi xung, trung bình thấp nên quạt quay yếu và rung." :
        st.broken ? "Đứt 1 diode: mỗi chu kỳ chỉ còn 1 xung, tụ phải giữ điện lâu gấp đôi nên điện áp tụt sâu, quạt yếu hơn." :
        (mx - mn) > 3 ? "Tụ nhỏ so với tải: gợn sóng lớn. Tải nặng thì tụ xả nhanh giữa hai xung." : "Tụ đủ lớn: điện áp gần phẳng, quạt quay đều.") +
        "\nĐỉnh = 12 × 1,41 − 1,4 (hai diode dẫn) ≈ " + nf(Vp - 1.4, 1) + " V.";
    }
    calc();
    scenes.push({ root: c, frame: function (dt) { st.ang = (st.ang + spd * dt * 1100) % 360; $("#cx-fan", svg).setAttribute("transform", "translate(312 80) rotate(" + st.ang.toFixed(1) + ")"); } });
  })();

  /* =====================================================================
     7) TÌM LỖI QUẠT: bo điều khiển thật, bấm điểm đo trên bo (dùng chung đề với sơ đồ bên dưới)
     ===================================================================== */
  (function () {
    var c = card("tim", "Hình thực tế: đo trên bo điều khiển dàn nóng",
      "Bo thật có cầu đấu L–N, IC nguồn 12 V, chip, transistor, relay và giắc quạt trắng. Bấm số trên bo để đặt que đo vào đúng chỗ. Đề và kết luận dùng chung với sơ đồ bên dưới.");
    if (!c) return;
    var svg = mkSvg(c, "0 0 360 280", "Bo mạch xanh nhìn từ trên: cầu đấu nguồn, IC 7812 có tản nhiệt, chip, transistor, relay xanh, giắc quạt trắng; 8 điểm đo đánh số; đồng hồ vạn năng");
    // toạ độ điểm đo trên bo, que đen tương ứng (N hoặc GND)
    var PT = [[52, 52], [150, 64], [196, 178], [244, 78], [222, 128], [256, 128], [70, 214], [94, 214]];
    var REF = ["N", "G", "E", "C1", "N", "N", "N", "N2"];
    var REFP = { N: [70, 52], G: [176, 110], E: [204, 196], C1: [244, 112], N2: [40, 120] };
    var X0 = 282, Y0 = 160;
    svg.innerHTML = '<defs>' + DEFS + '</defs>' +
      '<rect x="0" y="0" width="360" height="280" fill="#DDE2E8"/>' +
      '<rect x="12" y="20" width="262" height="230" rx="10" fill="url(#r2-pcb)"/>' +
      '<g fill="none" stroke="#3FA36F" stroke-width="3" stroke-linejoin="round" opacity=".9">' +
      '<path d="M52 60V100H222V112"/><path d="M70 60V120H40V214"/><path d="M150 76V100"/><path d="M176 110H244V96"/><path d="M128 178H186"/><path d="M204 196V230H120"/><path d="M256 128V170H70V200"/></g>' +
      '<g fill="none" stroke="#E25555" stroke-width="4" opacity=".8"><path d="M30 10V40"/><path d="M80 10V40"/></g>' +
      '<text x="20" y="10" font-size="9" fill="#B42318" font-weight="700">L 220 V</text><text x="84" y="10" font-size="9" fill="#2F6FD6" font-weight="700">N</text>' +
      // cầu đấu xanh dương
      '<g filter="url(#r2-sh)"><rect x="36" y="32" width="52" height="30" rx="3" fill="#2F7DD3"/><circle cx="52" cy="47" r="7" fill="#C9CED6"/><circle cx="70" cy="47" r="7" fill="#C9CED6"/>' +
      '<path d="M48 47h8M66 47h8" stroke="#6E757E" stroke-width="2"/></g><text x="62" y="76" text-anchor="middle" font-size="7" fill="#E8F5EC">L    N</text>' +
      // cầu chì thuỷ tinh
      '<rect x="20" y="86" width="12" height="30" rx="5" fill="#DCEBFA" opacity=".8" stroke="#9AA6B3"/><path d="M26 88V114" stroke="#8A8F96"/><text x="26" y="128" text-anchor="middle" font-size="7" fill="#E8F5EC">F1</text>' +
      // IC 7812 + tản nhiệt
      '<g filter="url(#r2-sh)"><rect x="130" y="30" width="40" height="22" rx="2" fill="#9AA1AD"/>' + (function () { var s = ""; for (var x = 134; x < 168; x += 6) s += '<path d="M' + x + ' 30V52" stroke="#7D848D"/>'; return s; })() +
      '<rect x="136" y="52" width="28" height="22" rx="2" fill="#1C1E22"/><text x="150" y="66" text-anchor="middle" font-size="7" fill="#C9CED6">7812</text></g>' +
      // tụ lọc nhỏ
      '<g transform="translate(176 46)">' + ecap(0, 0, 18, 26, "", "").replace(/filter="url\(#r2-sh\)"/, '') + '</g>' +
      // chip QFP
      '<g filter="url(#r2-sh)"><rect x="96" y="160" width="34" height="34" rx="2" fill="#1C1E22"/>' + (function () { var s = ""; for (var k = 0; k < 6; k++) { var o = 164 + k * 5; s += '<path d="M' + o + ' 0" />'; } for (k = 0; k < 6; k++) { var p = 164 + k * 5; s += '<path d="M92 ' + p + 'h4M130 ' + p + 'h4M' + (p - 64) + ' 156v4M' + (p - 64) + ' 194v4" stroke="#C9CED6" stroke-width="1.5"/>'; } return s; })() +
      '<circle cx="101" cy="165" r="1.6" fill="#555B64"/><text x="113" y="181" text-anchor="middle" font-size="7" fill="#C9CED6">MCU</text></g>' +
      // điện trở nền + transistor
      '<rect x="150" y="173" width="22" height="10" rx="5" fill="url(#r2-res)"/><path d="M186 186v-20a9 9 0 0 1 18 0v20z" fill="#1C1E22"/><path d="M190 186v10M195 186v10M200 186v10" stroke="#C9CED6" stroke-width="1.5"/>' +
      '<rect x="210" y="146" width="8" height="20" rx="3" fill="#1C1E22"/><rect x="210" y="147" width="8" height="3" fill="#C9CED6"/>' +
      // relay xanh
      '<g filter="url(#r2-sh)"><rect x="222" y="70" width="46" height="60" rx="3" fill="#1F5FA8"/><text x="245" y="96" text-anchor="middle" font-size="7" fill="#E9EEF7">12VDC</text><text x="245" y="106" text-anchor="middle" font-size="6" fill="#BFD6EE">10A 250VAC</text></g>' +
      // giắc quạt trắng + dây
      '<g filter="url(#r2-sh)"><rect x="56" y="204" width="50" height="20" rx="2" fill="#F1EFE8" stroke="#BDB7AA"/><rect x="62" y="208" width="12" height="12" fill="#D8D3C6"/><rect x="88" y="208" width="12" height="12" fill="#D8D3C6"/></g>' +
      '<path d="M68 224V262M94 224V262" stroke-width="4" fill="none" stroke="#2F6FD6"/><path d="M68 224V262" stroke="#8A5A2B" stroke-width="4" fill="none"/><text x="110" y="246" font-size="8" fill="#1D2127">CN-FAN → quạt dàn nóng</text>' +
      '<g id="fx-pts"></g>' +
      dmm(X0, Y0, "fx", "AUTO") +
      probe("fx-pr", X0 + 54, Y0 + 96, PT[0][0], PT[0][1], "#C62828") + probe("fx-pb", X0 + 20, Y0 + 96, REFP.N[0], REFP.N[1], "#22262C");
    fixIds(svg);
    var ptsG = $("#fx-pts", svg);
    ptsG.innerHTML = PT.map(function (p, i) {
      return '<g class="fx-pt" data-i="' + i + '" style="cursor:pointer"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="16" fill="transparent"/>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#FFF" stroke="#E60012" stroke-width="2.5"/><text x="' + p[0] + '" y="' + (p[1] + 3.5) + '" text-anchor="middle" font-size="10" font-weight="700" fill="#E60012">' + (i + 1) + '</text>' +
        '<text class="fx-v" x="' + p[0] + '" y="' + (p[1] - 13) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#FFE066"></text></g>';
    }).join("");
    $("#fx-pr", svg).setAttribute("opacity", "0"); $("#fx-pb", svg).setAttribute("opacity", "0");
    var KN = [-45, 45, 45, 45, -45, -45, -45, -135];
    ptsG.addEventListener("click", function (e) {
      var g = e.target.closest ? e.target.closest(".fx-pt") : null; if (!g) return;
      var i = +g.getAttribute("data-i"), b = document.querySelector('#tm-pts button[data-i="' + i + '"]');
      if (b) b.click();
      var r = REFP[REF[i]] || REFP.N;
      $("#fx-pr", svg).setAttribute("opacity", "1"); $("#fx-pb", svg).setAttribute("opacity", "1");
      moveProbe(svg, "fx-pr", X0 + 54, Y0 + 96, PT[i][0], PT[i][1] + 6); moveProbe(svg, "fx-pb", X0 + 20, Y0 + 96, r[0], r[1] + 6);
      setKnob(svg, "fx", X0, Y0, KN[i]);
      sync();
    });
    function sync() {
      var l = document.getElementById("tm-lcd"); $("#fx-lcd", svg).textContent = l ? l.textContent.replace(/\s+/g, " ").trim().slice(0, 9) : "";
      Array.prototype.forEach.call(ptsG.querySelectorAll(".fx-v"), function (t, i) { var s = document.getElementById("tm-v" + i); t.textContent = s ? s.textContent : ""; });
    }
    var nt = add(c, "p", "note"); nt.textContent = "Que đen đặt ở N với các điểm điện xoay chiều, ở GND (mass) với các điểm một chiều. Điểm 8 đo thông mạch dây N nên phải tắt điện trước.";
    var acc = 0;
    scenes.push({ root: c, phys: true, frame: function (dt) { acc += dt; if (acc > 0.3) { acc = 0; sync(); } } });
  })();

  // ---- vòng lặp chung: chỉ chạy cảnh đang hiện ----
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    // cảnh có trạng thái theo thời gian (tụ nạp/xả) luôn chạy; cảnh chỉ trang trí (chấm, cánh quạt) dừng khi máy bật "giảm chuyển động"
    scenes.forEach(function (s) { if (s.root.offsetParent !== null && (s.phys || !REDUCED)) s.frame(dt); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
