/* 23/10/2026: "Hình thực tế" cho các mô phỏng Bài 10–13: cảm biến nhiệt trên ống dàn lạnh, đổi tiền tố đơn vị,
   VOM đo trên mạch thật, ampe kìm kẹp dây, ổ cắm 220 V và tụ lọc. Vẽ dụng cụ thật bằng SVG (bài này là dụng cụ đo,
   không phải linh kiện trên bo). Giống real3.js: đọc thẳng mô phỏng labkit bên dưới (HDT.labs[id].data tại con trỏ
   và .p là giá trị thanh trượt/nút), không có nút riêng, nên hình luôn khớp với đồ thị. */
(function () {
  "use strict";
  var H = window.HDT;
  if (!H || !H.labs) return;
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* bỏ qua */ }
  var NS = "http://www.w3.org/2000/svg", MONO = "ui-monospace,Menlo,Consolas,monospace";
  var nf = H.nf, clamp = H.clamp;

  function $(s, r) { return (r || document).querySelector(s); }
  function series(L, name) {
    var ps = (L.data && L.data.panels) || [];
    for (var i = 0; i < ps.length; i++) for (var j = 0; j < ps[i].series.length; j++) if (ps[i].series[j].n === name) return ps[i].series[j].y;
    return null;
  }
  function idxOf(L) { var n = L.data && L.data.xs ? L.data.xs.length : 1; return clamp(Math.round(L.u * (n - 1)), 0, n - 1); }
  function get(L, name) { var y = series(L, name); return y ? y[idxOf(L)] : NaN; }
  function xAt(L) { return L.data.xs[idxOf(L)]; }
  function read(L, label) { var r = (L.data && L.data.reads) || []; for (var i = 0; i < r.length; i++) if (r[i][0] === label) return r[i][1]; return "—"; }
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
  function card(lab, title, lead, vb, label) {
    var sec = document.getElementById("lab-" + lab);
    if (!sec || !H.labs[lab]) return null;
    var c = document.createElement("div"); c.className = "card real";
    c.innerHTML = "<h2>Hình thực tế: " + title + "</h2><p class=\"lead\">" + lead + "</p>";
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", vb); s.setAttribute("class", "real-svg"); s.setAttribute("role", "img"); s.setAttribute("aria-label", label);
    c.appendChild(s); sec.insertBefore(c, sec.firstChild);
    return { c: c, svg: s, L: H.labs[lab] };
  }
  // id riêng cho từng hình (tránh trùng id gradient giữa các SVG, xem real2.js)
  function uid(svg, p) { var pre = p + "-"; return function (s) { return s.replace(/@/g, pre); }; }
  function dots(svg, n, r, fill) {
    var g = document.createElementNS(NS, "g"), arr = [];
    for (var i = 0; i < n; i++) { var c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); c.setAttribute("fill", fill); c.setAttribute("stroke", "#000"); c.setAttribute("stroke-width", ".5"); g.appendChild(c); arr.push(c); }
    svg.appendChild(g); return { g: g, arr: arr, ph: 0 };
  }
  // chấm dòng điện: speed = 0 thì ẩn hết (không có dòng)
  function runDots(D, path, dt, speed, spacing) {
    D.ph += dt * speed; var L = plen(path);
    D.arr.forEach(function (c, k) {
      if (!speed || k * spacing > L) { c.setAttribute("visibility", "hidden"); return; }
      var p = ptAt(path, k * spacing + D.ph);
      c.setAttribute("visibility", "visible"); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1));
    });
  }
  function pd(p) { return "M" + p.map(function (q) { return q[0] + " " + q[1]; }).join("L"); }

  // ---- đồng hồ vạn năng có 4 cổng (COM, VΩ, mA, 10A) và núm xoay ----
  var DMM_DEFS =
    '<linearGradient id="@dmm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7CB3A"/><stop offset="1" stop-color="#DDA30F"/></linearGradient>' +
    '<filter id="@sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".28"/></filter>';
  function dmmSvg(x, y, k) { // rộng 86, cao 150
    return '<g filter="url(#' + k + 'sh)"><rect x="' + x + '" y="' + y + '" width="86" height="150" rx="12" fill="url(#' + k + 'dmm)"/>' +
      '<rect x="' + (x + 6) + '" y="' + (y + 6) + '" width="74" height="138" rx="8" fill="#2A2E35"/></g>' +
      '<rect x="' + (x + 10) + '" y="' + (y + 10) + '" width="66" height="30" rx="3" fill="#B9C9A4"/>' +
      '<text class="r4-lcd" x="' + (x + 72) + '" y="' + (y + 32) + '" text-anchor="end" font-family="' + MONO + '" font-size="15" font-weight="700" fill="#1D2A12">0.00</text>' +
      '<text class="r4-lcdu" x="' + (x + 13) + '" y="' + (y + 19) + '" font-size="7.5" font-weight="700" fill="#1D2A12"></text>' +
      '<circle cx="' + (x + 43) + '" cy="' + (y + 76) + '" r="21" fill="#3D434C" stroke="#14171B" stroke-width="2"/>' +
      '<path class="r4-knob" d="M' + (x + 43) + ' ' + (y + 76) + 'V' + (y + 58) + '" stroke="#F7CB3A" stroke-width="4" stroke-linecap="round"/>' +
      '<text x="' + (x + 12) + '" y="' + (y + 56) + '" font-size="8" fill="#C9CED6">V~</text><text x="' + (x + 62) + '" y="' + (y + 56) + '" font-size="8" fill="#C9CED6">V⎓</text>' +
      '<text x="' + (x + 12) + '" y="' + (y + 102) + '" font-size="8" fill="#C9CED6">Ω</text><text x="' + (x + 66) + '" y="' + (y + 102) + '" font-size="8" fill="#C9CED6">A</text>' +
      [["10A", 13], ["mA", 32], ["COM", 51], ["VΩ", 70]].map(function (j) {
        return '<circle cx="' + (x + j[1] + 2) + '" cy="' + (y + 122) + '" r="5" fill="' + (j[0] === "COM" ? "#111" : "#C62828") + '" stroke="#555B64"/>' +
          '<text x="' + (x + j[1] + 2) + '" y="' + (y + 137) + '" text-anchor="middle" font-size="6" fill="#9AA1AD">' + j[0] + '</text>';
      }).join("") +
      '<g class="r4-fuse" opacity="0"><rect x="' + (x + 24) + '" y="' + (y + 100) + '" width="18" height="8" rx="2" fill="#DCEBFA"/><path d="M' + (x + 26) + ' ' + (y + 104) + 'h4m4 0h6" stroke="#8A8F96"/><path d="M' + (x + 22) + ' ' + (y + 98) + 'l22 12m0 -12l-22 12" stroke="#FF3B30" stroke-width="2"/></g>';
  }
  function jackXY(x, y, j) { return [x + { "10A": 15, mA: 34, COM: 53, "VΩ": 72 }[j], y + 122]; }
  function setKnob(svg, x, y, ang) { var cx = x + 43, cy = y + 76, a = (ang - 90) * Math.PI / 180; $(".r4-knob", svg).setAttribute("d", "M" + cx + " " + cy + "L" + (cx + 18 * Math.cos(a)).toFixed(1) + " " + (cy + 18 * Math.sin(a)).toFixed(1)); }
  function probePath(f, t) { return "M" + f[0] + " " + f[1] + " C " + f[0] + " " + (f[1] + 60) + ", " + t[0] + " " + (t[1] + 90) + ", " + t[0] + " " + (t[1] + 30); }
  function probeTip(g, t, col) { // que đo: thân màu + mũi kim loại hướng lên, đầu mũi ở t
    g.innerHTML = '<rect x="' + (t[0] - 4) + '" y="' + (t[1] + 7) + '" width="8" height="24" rx="3" fill="' + col + '"/><path d="M' + t[0] + ' ' + (t[1] + 7) + 'V' + t[1] + '" stroke="#C9CED6" stroke-width="2.2"/>';
  }
  // vòng lặp chung
  var scenes = [];
  function loop(now) {
    var dt = Math.min(0.05, (now - (loop.t || now)) / 1000); loop.t = now;
    scenes.forEach(function (s) { if (s.root.offsetParent !== null) s.frame(REDUCED ? 0 : dt); });
    requestAnimationFrame(loop);
  }

  /* =====================================================================
     Bài 10: cảm biến nhiệt kẹp trên ống đồng dàn lạnh → giắc → bo (Rf + MCU)
     ===================================================================== */
  (function () {
    var S = card("ntcdiv", "cảm biến nhiệt kẹp trên ống đồng dàn lạnh",
      "Đầu cảm biến (NTC bọc vỏ kim loại) kẹp vào ống đồng, dây đôi về giắc trắng trên bo. Nhiệt kế bên trái là nhiệt độ ống tại con trỏ đồ thị. Lạnh thì ống đóng tuyết, điện trở NTC lớn, đồng hồ đo Vo ở chân giắc đổi theo.",
      "0 0 360 250", "Ống đồng dàn lạnh, đầu cảm biến kẹp trên ống, dây về giắc trắng trên bo mạch, đồng hồ vạn năng đo điện áp ở chân giắc, nhiệt kế");
    if (!S) return;
    var svg = S.svg, L = S.L, U = uid(svg, "nt"), X0 = 268, Y0 = 8;
    var frost = ""; for (var i = 0; i < 26; i++) frost += '<path d="M' + (14 + i * 8.6) + ' ' + (i % 2 ? 58 : 86) + 'l3 -4l3 4" stroke="#fff" stroke-width="1.5" fill="none"/>';
    svg.innerHTML = U('<defs>' + DMM_DEFS +
      '<linearGradient id="@cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8A47A"/><stop offset=".45" stop-color="#C97A45"/><stop offset="1" stop-color="#8A4A22"/></linearGradient>' +
      '<linearGradient id="@ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2F4F6"/><stop offset=".5" stop-color="#B8BEC6"/><stop offset="1" stop-color="#7D848D"/></linearGradient>' +
      '<linearGradient id="@pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E7A4C"/><stop offset="1" stop-color="#145C38"/></linearGradient></defs>') +
      '<rect width="360" height="250" fill="#E9EDF1"/>' +
      // lá nhôm dàn lạnh phía sau
      '<g stroke="#C5CCD4" stroke-width="2">' + (function () { var s = ""; for (var x = 8; x < 250; x += 7) s += '<path d="M' + x + ' 20V124"/>'; return s; })() + '</g>' +
      // ống đồng
      U('<rect x="0" y="58" width="252" height="28" rx="4" fill="url(#@cu)"/>') +
      '<g id="nt-frost" opacity="0"><rect x="0" y="54" width="252" height="36" rx="6" fill="#F4FAFF" opacity=".55"/>' + frost + '</g>' +
      '<rect id="nt-warm" x="0" y="58" width="252" height="28" rx="4" fill="#FF5A4E" opacity="0"/>' +
      // đầu cảm biến + kẹp lò xo
      U('<rect x="96" y="42" width="56" height="16" rx="8" fill="url(#@ss)" stroke="#7D848D"/>') +
      '<path d="M100 58 q-6 16 4 30 M148 58 q6 16 -4 30" stroke="#B8BEC6" stroke-width="3" fill="none"/>' +
      '<path d="M98 88 H150" stroke="#B8BEC6" stroke-width="3"/>' +
      '<text x="124" y="36" text-anchor="middle" font-size="10" font-weight="700" fill="#1D2127">đầu cảm biến (NTC)</text>' +
      // dây đôi về giắc
      '<path id="nt-cab" d="M152 50 C 200 50, 190 150, 186 176" stroke="#22262C" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<g id="nt-cut" opacity="0"><rect x="180" y="104" width="22" height="14" fill="#E9EDF1"/><path d="M178 102l26 18m0 -18l-26 18" stroke="#FF3B30" stroke-width="3"/><text x="210" y="116" font-size="10" font-weight="700" fill="#B42318">đứt dây</text></g>' +
      // bo mạch
      U('<rect x="120" y="170" width="140" height="74" rx="8" fill="url(#@pcb)"/>') +
      '<rect x="172" y="174" width="32" height="20" rx="2" fill="#F1EFE8" stroke="#BDB7AA"/><rect x="178" y="178" width="8" height="10" fill="#D8D3C6"/><rect x="190" y="178" width="8" height="10" fill="#D8D3C6"/>' +
      '<text x="188" y="204" text-anchor="middle" font-size="8" fill="#E8F5EC">CN-TH</text>' +
      '<rect x="214" y="196" width="22" height="9" rx="4.5" fill="#DCC394"/><rect x="219" y="196" width="2.5" height="9" fill="#7A4A25"/><rect x="224" y="196" width="2.5" height="9" fill="#161616"/><rect x="229" y="196" width="2.5" height="9" fill="#F0892A"/>' +
      '<text id="nt-rf" x="225" y="216" text-anchor="middle" font-size="8" fill="#E8F5EC">Rf</text>' +
      '<rect x="136" y="210" width="30" height="24" rx="2" fill="#1C1E22"/><text x="151" y="225" text-anchor="middle" font-size="7.5" fill="#C9CED6">MCU</text>' +
      '<circle id="nt-spk" cx="188" cy="183" r="12" fill="#FFE066" opacity="0"/>' +
      // nhiệt kế điện tử
      '<g><rect x="8" y="140" width="94" height="58" rx="10" fill="#F4F6F9" stroke="#AEB5BF"/><rect x="16" y="148" width="78" height="30" rx="4" fill="#1D2127"/>' +
      '<text id="nt-t" x="88" y="171" text-anchor="end" font-family="' + MONO + '" font-size="18" font-weight="700" fill="#5AA7FF">25,0</text>' +
      '<text x="55" y="192" text-anchor="middle" font-size="9" fill="#4A515E">nhiệt độ ống (°C)</text><path d="M55 140 C 60 120, 90 110, 110 86" stroke="#4A515E" stroke-width="2" fill="none" stroke-dasharray="3 3"/></g>' +
      U(dmmSvg(X0, Y0, "@")) +
      '<path id="nt-w1" fill="none" stroke="#C62828" stroke-width="2.5"/><path id="nt-w2" fill="none" stroke="#22262C" stroke-width="2.5"/><g id="nt-p1"></g><g id="nt-p2"></g>' +
      '<text x="' + (X0 + 43) + '" y="' + (Y0 + 168) + '" text-anchor="middle" font-size="9" fill="#4A515E">đo Vo ở chân giắc</text>' +
      '<rect x="270" y="186" width="84" height="58" rx="8" fill="#2A2E35"/><text x="278" y="200" font-size="8.5" fill="#9AA1AD">R NTC</text><text id="nt-r" x="278" y="214" font-family="' + MONO + '" font-size="12" font-weight="700" fill="#FFD27A"></text>' +
      '<text x="278" y="228" font-size="8.5" fill="#9AA1AD">MCU đọc (ADC)</text><text id="nt-a" x="278" y="241" font-family="' + MONO + '" font-size="11" font-weight="700" fill="#FFD27A"></text>';
    setKnob(svg, X0, Y0, 45); $(".r4-lcdu", svg).textContent = "V⎓";
    var r1 = jackXY(X0, Y0, "VΩ"), r2 = jackXY(X0, Y0, "COM"), t1 = [194, 176], t2 = [182, 176];
    $("#nt-w1", svg).setAttribute("d", probePath(r1, t1)); $("#nt-w2", svg).setAttribute("d", probePath(r2, t2));
    probeTip($("#nt-p1", svg), t1, "#C62828"); probeTip($("#nt-p2", svg), t2, "#22262C");
    var acc = 1;
    scenes.push({ root: S.c, frame: function (dt) {
      acc += dt; if (acc < 0.1) return; acc = 0;
      if (!L.data) return;
      var T = xAt(L), R = get(L, "R NTC"), V = get(L, "Vo"), A = get(L, "ADC"), open = R >= 199.9, sh = R < 0.05;
      $("#nt-t", svg).textContent = nf(T, 1);
      $("#nt-frost", svg).setAttribute("opacity", clamp(-T / 15, 0, 1).toFixed(2));
      $("#nt-warm", svg).setAttribute("opacity", clamp((T - 30) / 60, 0, 0.45).toFixed(2));
      $("#nt-cut", svg).setAttribute("opacity", open ? "1" : "0");
      $("#nt-spk", svg).setAttribute("opacity", sh ? (0.5 + 0.4 * Math.random()).toFixed(2) : "0");
      $(".r4-lcd", svg).textContent = nf(V, 2).replace(",", ".");
      $("#nt-r", svg).textContent = open ? "OL (hở)" : sh ? "≈0 (chập)" : nf(R, R < 10 ? 2 : 1) + " kΩ";
      $("#nt-a", svg).textContent = nf(A, 0) + "/1023";
      $("#nt-rf", svg).textContent = "Rf " + nf(L.p.Rf, L.p.Rf < 10 ? 1 : 0) + "k";
    } });
  })();

  /* =====================================================================
     Bài 11: bộ nguồn, điện trở có vạch màu, đồng hồ đo dòng tự đổi mA / µA
     ===================================================================== */
  (function () {
    var S = card("tiento", "nguồn, điện trở và đồng hồ đo dòng",
      "Bộ nguồn đặt điện áp, điện trở có vạch màu đúng giá trị bạn chọn, đồng hồ mắc nối tiếp đo dòng. Đồng hồ tự đổi thang: dòng dưới 1 mA thì hiện theo µA. Bảng bên phải là cùng một dòng điện viết theo A, mA, µA.",
      "0 0 360 230", "Bộ nguồn một chiều, điện trở có vạch màu, đồng hồ vạn năng mắc nối tiếp đo dòng");
    if (!S) return;
    var svg = S.svg, L = S.L, U = uid(svg, "tt"), X0 = 162, Y0 = 72;
    var BAND = ['#161616', '#7A4A25', '#D9362C', '#F0892A', '#F1D12B', '#2E9E4F', '#2F6FD6', '#8A4FC8', '#8E949B', '#F5F5F5'];
    svg.innerHTML = U('<defs>' + DMM_DEFS + '<linearGradient id="@res" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3BF"/><stop offset=".5" stop-color="#DCC394"/><stop offset="1" stop-color="#B99D69"/></linearGradient></defs>') +
      '<rect width="360" height="230" fill="#E9EDF1"/>' +
      '<g fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"><path d="M72 66V30H118" stroke="#C62828"/><path d="M196 30H232V46" stroke="#3B4049"/><path d="M48 66V214H190" stroke="#22262C"/></g>' +
      // bộ nguồn
      U('<g filter="url(#@sh)"><rect x="10" y="66" width="100" height="78" rx="8" fill="#3A3F46"/></g>') +
      '<rect x="18" y="74" width="84" height="28" rx="3" fill="#0E1A12"/><text id="tt-v" x="96" y="95" text-anchor="end" font-family="' + MONO + '" font-size="17" font-weight="700" fill="#FF5A4E">12.0V</text>' +
      '<circle cx="30" cy="122" r="9" fill="#5B626D"/><circle cx="60" cy="122" r="9" fill="#5B626D"/><circle cx="48" cy="66" r="0"/>' +
      '<circle cx="84" cy="122" r="6" fill="#C62828"/><circle cx="100" cy="122" r="6" fill="#111"/><text x="60" y="158" text-anchor="middle" font-size="9" fill="#4A515E">bộ nguồn một chiều</text>' +
      // điện trở lớn
      U('<g filter="url(#@sh)"><rect x="118" y="18" width="78" height="24" rx="12" fill="url(#@res)"/></g>') +
      '<g id="tt-b"></g><rect x="184" y="18" width="5" height="24" fill="#C9A227"/>' +
      '<text id="tt-rl" x="157" y="58" text-anchor="middle" font-size="11" font-weight="700" fill="#1D2127"></text>' +
      U(dmmSvg(X0, Y0, "@")) +
      '<path id="tt-w1" fill="none" stroke="#C62828" stroke-width="2.5"/><path id="tt-w2" fill="none" stroke="#22262C" stroke-width="2.5"/>' +
      // bảng đổi đơn vị
      '<rect x="262" y="20" width="92" height="196" rx="10" fill="#2A2E35"/>' +
      [["A", 0], ["mA", 1], ["µA", 2], ["Ω", 3], ["kΩ", 4], ["MΩ", 5]].map(function (r) {
        return '<text x="272" y="' + (40 + r[1] * 31) + '" font-size="8.5" fill="#9AA1AD">theo ' + r[0] + '</text><text id="tt-' + r[1] + '" x="270" y="' + (54 + r[1] * 31) + '" font-family="' + MONO + '" font-size="10" font-weight="700" fill="#FFD27A"></text>';
      }).join("");
    setKnob(svg, X0, Y0, 135); // thang A
    var D = dots(svg, 20, 2.6, "#FFB020");
    function wire(rid, f, t) { $(rid, svg).setAttribute("d", "M" + f[0] + " " + f[1] + " C " + f[0] + " " + (f[1] + 40) + ", " + t[0] + " " + (t[1] + 40) + ", " + t[0] + " " + t[1]); }
    var acc = 1, I = 0;
    scenes.push({ root: S.c, frame: function (dt) {
      runDots(D, [[72, 66], [72, 30], [118, 30], [196, 30], [232, 30], [232, 46]], dt, 10 + 120 * clamp(Math.log10(1 + I * 1000) / 2.2, 0, 1), 14);
      acc += dt; if (acc < 0.15) return; acc = 0;
      var V = L.p.V, R = L.p.R, Ik = V / R; I = Ik / 1000; // R tính theo kΩ
      $("#tt-v", svg).textContent = nf(V, 1).replace(",", ".") + "V";
      var ohm = R * 1000, e = Math.floor(Math.log10(ohm)) - 1, m = Math.round(ohm / Math.pow(10, e)); if (m >= 100) { m = Math.round(m / 10); e++; }
      var d = [Math.floor(m / 10), m % 10], cols = [BAND[d[0]], BAND[d[1]], e >= 0 ? BAND[e] : "#C9A227"];
      $("#tt-b", svg).innerHTML = cols.map(function (c, i) { return '<rect x="' + (132 + i * 14) + '" y="18" width="7" height="24" fill="' + c + '"/>'; }).join("");
      $("#tt-rl", svg).textContent = ohm >= 1e6 ? nf(ohm / 1e6, 2) + " MΩ" : ohm >= 1000 ? nf(ohm / 1000, 2) + " kΩ" : nf(ohm, 0) + " Ω";
      var lcd = Ik >= 1 ? nf(Ik, Ik >= 100 ? 1 : Ik >= 10 ? 2 : 3) : nf(Ik * 1000, Ik * 1000 >= 100 ? 1 : 2);
      $(".r4-lcd", svg).textContent = lcd.replace(",", "."); $(".r4-lcdu", svg).textContent = Ik >= 1 ? "DC mA" : "DC µA";
      wire("#tt-w1", [232, 194], jackXY(X0, Y0, "mA")); wire("#tt-w2", jackXY(X0, Y0, "COM"), [190, 214]);
      $("#tt-0", svg).textContent = nf(I, 6) + " A"; $("#tt-1", svg).textContent = nf(Ik, 3) + " mA"; $("#tt-2", svg).textContent = nf(Ik * 1000, 1) + " µA";
      $("#tt-3", svg).textContent = nf(ohm, 0) + " Ω"; $("#tt-4", svg).textContent = nf(R, 3) + " kΩ"; $("#tt-5", svg).textContent = nf(R / 1000, 5) + " MΩ";
    } });
  })();

  /* =====================================================================
     Bài 12a: VOM đo trên mạch thật (pin 12 V, R1 20 Ω, R2 30 Ω trên bo cắm)
     ===================================================================== */
  (function () {
    var S = card("vom", "VOM đo trên mạch thật",
      "Pin 12 V, R1 20 Ω và R2 30 Ω cắm trên bo thử. Que đỏ cắm đúng cổng, núm xoay đúng thang, que đo đặt đúng chỗ theo cách đo bạn chọn. Chọn cách SAI để thấy tia lửa và cầu chì đồng hồ đứt.",
      "0 0 360 250", "Bo cắm thử có pin 12 V, điện trở R1 và R2, đồng hồ vạn năng với que đo đặt theo cách đo");
    if (!S) return;
    var svg = S.svg, L = S.L, U = uid(svg, "vm"), X0 = 268, Y0 = 8;
    var P = { bp: [44, 40], A: [90, 40], B: [150, 40], C: [210, 40], D: [210, 140], E: [44, 140], Dgap: [62, 40] };
    svg.innerHTML = U('<defs>' + DMM_DEFS +
      '<linearGradient id="@res" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3BF"/><stop offset=".5" stop-color="#DCC394"/><stop offset="1" stop-color="#B99D69"/></linearGradient>' +
      '<radialGradient id="@spk"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#FFE066"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient></defs>') +
      '<rect width="360" height="250" fill="#E9EDF1"/>' +
      '<rect x="10" y="12" width="240" height="170" rx="8" fill="#F1F2EC" stroke="#D6D8CE"/>' +
      '<g fill="#D9DBD2">' + (function () { var s = ""; for (var x = 20; x < 246; x += 10) for (var y = 22; y < 178; y += 10) s += '<rect x="' + x + '" y="' + y + '" width="3" height="3" rx=".6"/>'; return s; })() + '</g>' +
      '<g fill="none" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" stroke="#3B4049"><path id="vm-wa" d="M44 70V40H90"/><path d="M150 40H210V70"/><path d="M210 112V140H44V108"/></g>' +
      '<g id="vm-cut" opacity="0"><rect x="52" y="34" width="22" height="12" fill="#F1F2EC"/><text x="63" y="30" text-anchor="middle" font-size="8.5" font-weight="700" fill="#B42318">cắt mạch</text></g>' +
      // pin 12 V
      U('<g filter="url(#@sh)"><rect x="24" y="70" width="40" height="38" rx="5" fill="#2A2F36"/></g>') + '<rect x="24" y="80" width="40" height="16" fill="#E60012"/><text x="44" y="92" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">12 V</text>' +
      '<text x="70" y="78" font-size="10" font-weight="700" fill="#C62828">+</text>' +
      // R1 ngang, R2 dọc
      U('<g filter="url(#@sh)"><rect x="96" y="33" width="48" height="14" rx="7" fill="url(#@res)"/></g>') + '<rect x="104" y="33" width="4" height="14" fill="#D9362C"/><rect x="111" y="33" width="4" height="14" fill="#161616"/><rect x="118" y="33" width="4" height="14" fill="#161616"/><rect x="132" y="33" width="3" height="14" fill="#C9A227"/>' +
      '<text x="120" y="62" text-anchor="middle" font-size="10" font-weight="700" fill="#1D2127">R1 20 Ω</text>' +
      U('<g filter="url(#@sh)"><rect x="203" y="70" width="14" height="42" rx="7" fill="url(#@res)"/></g>') + '<rect x="203" y="76" width="14" height="4" fill="#F0892A"/><rect x="203" y="83" width="14" height="4" fill="#161616"/><rect x="203" y="90" width="14" height="4" fill="#161616"/><rect x="203" y="103" width="14" height="3" fill="#C9A227"/>' +
      '<text x="196" y="94" text-anchor="end" font-size="10" font-weight="700" fill="#1D2127">R2 30 Ω</text>' +
      '<circle id="vm-spark" cx="44" cy="70" r="26" fill="url(#vm-spk)" opacity="0"/>' +
      U(dmmSvg(X0, Y0, "@")) +
      '<path id="vm-w1" fill="none" stroke="#C62828" stroke-width="2.5"/><path id="vm-w2" fill="none" stroke="#22262C" stroke-width="2.5"/><g id="vm-p1"></g><g id="vm-p2"></g>' +
      '<rect x="10" y="192" width="240" height="50" rx="8" fill="#2A2E35"/><text id="vm-where" x="20" y="211" font-size="10" font-weight="700" fill="#FFD27A"></text><text id="vm-st" x="20" y="230" font-size="9.5" fill="#C9CED6"></text>';
    var D = dots(svg, 22, 2.5, "#FFB020"), loopPath = [[44, 70], [44, 40], [90, 40], [150, 40], [210, 40], [210, 70], [210, 112], [210, 140], [44, 140], [44, 108]];
    var MODE = { v2: { kn: 45, j: "VΩ", a: [210, 64], b: [210, 118] }, v1: { kn: 45, j: "VΩ", a: [90, 46], b: [150, 46] }, dcac: { kn: -45, j: "VΩ", a: [210, 64], b: [210, 118] },
      i10: { kn: 135, j: "10A", a: [56, 44], b: [72, 44] }, ima: { kn: 135, j: "mA", a: [56, 44], b: [72, 44] }, par: { kn: 135, j: "mA", a: [210, 64], b: [210, 118] }, src: { kn: 135, j: "mA", a: [36, 76], b: [56, 76] } };
    var acc = 1, I = 0.24, spk = 0;
    scenes.push({ root: S.c, frame: function (dt) {
      if (!L.data) return;
      var m = L.p.m, M = MODE[m] || MODE.v2, cur = get(L, "I"), blown = /cầu chì đứt/.test(read(L, "Số đọc được")) && xAt(L) >= 0.5;
      if (cur > 1) spk = 1; spk = Math.max(0, spk - dt * 2.5);
      $("#vm-spark", svg).setAttribute("opacity", (spk * (0.7 + 0.3 * Math.sin(spk * 60))).toFixed(2));
      var cutting = m === "i10" || m === "ima";
      $("#vm-cut", svg).setAttribute("opacity", cutting ? "1" : "0");
      I = blown ? 0 : (m === "src" ? (cur > 1 ? 3 : 0) : 0.24);
      runDots(D, loopPath, dt, I > 0 ? 40 + 40 * clamp(I, 0, 1) : 0, 16);
      acc += dt; if (acc < 0.1) return; acc = 0;
      setKnob(svg, X0, Y0, M.kn);
      var v = get(L, "số đo"), unit = L.data.panels[0].unit;
      $(".r4-lcd", svg).textContent = blown ? "0.00" : unit === "V" ? nf(v, 2).replace(",", ".") : nf(v, 0);
      $(".r4-lcdu", svg).textContent = M.kn === -45 ? "AC V" : unit === "V" ? "DC V" : "DC " + unit;
      $(".r4-fuse", svg).setAttribute("opacity", blown ? "1" : "0");
      var r = jackXY(X0, Y0, M.j), c = jackXY(X0, Y0, "COM");
      $("#vm-w1", svg).setAttribute("d", probePath(r, M.a)); $("#vm-w2", svg).setAttribute("d", probePath(c, M.b));
      probeTip($("#vm-p1", svg), M.a, "#C62828"); probeTip($("#vm-p2", svg), M.b, "#22262C");
      $("#vm-where", svg).textContent = L.data.where || "";
      $("#vm-st", svg).textContent = "Đồng hồ: " + read(L, "Số đọc được");
    } });
  })();

  /* =====================================================================
     Bài 12b: ampe kìm kẹp quanh dây L / cả L và N / quấn nhiều vòng
     ===================================================================== */
  (function () {
    var S = card("ampekim", "ampe kìm kẹp dây cấp cho tải",
      "Dây nâu (L) và dây xanh (N) từ ổ cắm đi tới tải. Hàm kìm kẹp đúng theo cách bạn chọn: một dây, cả hai dây, hoặc dây L quấn nhiều vòng. Tải quay hoặc rung theo dòng thật tại con trỏ đồ thị.",
      "0 0 360 250", "Ổ cắm, hai dây L và N tới quạt hoặc máy nén, ampe kìm kẹp quanh dây, màn hình hiện số đo");
    if (!S) return;
    var svg = S.svg, L = S.L, U = uid(svg, "ak");
    var yL = 92, yN = 122, cx = 160;
    var blades = ""; for (var b = 0; b < 4; b++) blades += '<path d="M0 0 C 6 -6, 20 -10, 27 -3 C 20 4, 6 5, 0 0Z" fill="#7FA7D6" transform="rotate(' + b * 90 + ')"/>';
    svg.innerHTML = U('<defs>' + DMM_DEFS + '<radialGradient id="@cmpg" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#5B626D"/><stop offset="1" stop-color="#1F2329"/></radialGradient></defs>') +
      '<rect width="360" height="250" fill="#E9EDF1"/><rect x="0" y="0" width="34" height="250" fill="#DCD6CC"/>' +
      // ổ cắm
      '<rect x="6" y="84" width="40" height="46" rx="6" fill="#FFFFFF" stroke="#AEB5BF"/><circle cx="18" cy="107" r="3.5" fill="#22262C"/><circle cx="34" cy="107" r="3.5" fill="#22262C"/>' +
      '<g id="ak-wires"></g>' +
      // tải: quạt hoặc máy nén
      '<g id="ak-fan" transform="translate(316 108)"><circle r="34" fill="#F4F6F9" stroke="#AEB5BF" stroke-width="2"/><g id="ak-bl">' + blades + '<circle r="6" fill="#4A515C"/></g></g>' +
      '<g id="ak-cmp"><rect x="284" y="150" width="64" height="12" rx="3" fill="#6E757E"/>' + U('<path d="M290 150 V96 q26 -30 52 0 V150 Z" fill="url(#@cmpg)"/>') +
      '<rect id="ak-hot" x="290" y="70" width="52" height="80" rx="22" fill="#FF3B30" opacity="0"/><text x="316" y="128" text-anchor="middle" font-size="9" fill="#C9CED6">máy nén</text></g>' +
      '<g id="ak-dc"><rect x="290" y="80" width="56" height="56" rx="6" fill="#1F2329"/><circle cx="318" cy="108" r="22" fill="#2B2F36"/><g id="ak-bl2" transform="translate(318 108)">' + blades.replace(/#7FA7D6/g, "#3A3F46") + '</g><text x="318" y="152" text-anchor="middle" font-size="9" fill="#4A515E">quạt 12 V DC</text></g>' +
      '<text id="ak-ld" x="354" y="186" text-anchor="end" font-size="9.5" font-weight="700" fill="#1D2127"></text>' +
      // ampe kìm
      '<g id="ak-clamp"></g>';
    var DL = dots(svg, 18, 2.6, "#B5651D"), DN = dots(svg, 18, 2.6, "#2F6FD6"), ang = 0, shake = 0, acc = 1;
    function clampSvg(both, n, lcd, unit, warn) {
      var top = yL - 28, bot = (both ? yN : yL) + 28, w = 64, x = cx - w / 2, s = "";
      if (n > 1) for (var k = 0; k < n; k++) { var xx = x + 10 + k * ((w - 20) / Math.max(1, n - 1)); s += '<ellipse cx="' + xx.toFixed(1) + '" cy="' + yL + '" rx="4" ry="22" fill="none" stroke="#8A5A2B" stroke-width="2.6"/>'; }
      s += '<path d="M' + x + ' ' + bot + 'V' + (top + 12) + 'Q' + x + ' ' + top + ' ' + cx + ' ' + top + 'Q' + (x + w) + ' ' + top + ' ' + (x + w) + ' ' + (top + 12) + 'V' + bot + '" fill="none" stroke="#1D2127" stroke-width="11" stroke-linecap="round"/>';
      s += '<path d="M' + x + ' ' + bot + 'V' + (top + 12) + 'Q' + x + ' ' + top + ' ' + cx + ' ' + top + 'Q' + (x + w) + ' ' + top + ' ' + (x + w) + ' ' + (top + 12) + 'V' + bot + '" fill="none" stroke="#E60012" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
      // thân máy
      var by = bot + 2;
      s += U('<g filter="url(#@sh)"><path d="M' + (cx - 46) + ' ' + by + ' h92 l-8 ' + (240 - by) + ' h-76 z" fill="#E0A812"/></g>');
      s += '<rect x="' + (cx - 34) + '" y="' + (by + 10) + '" width="68" height="34" rx="4" fill="#B9C9A4"/>' +
        '<text x="' + (cx + 30) + '" y="' + (by + 36) + '" text-anchor="end" font-family="' + MONO + '" font-size="17" font-weight="700" fill="#1D2A12">' + lcd + '</text>' +
        '<text x="' + (cx - 30) + '" y="' + (by + 20) + '" font-size="7.5" font-weight="700" fill="#1D2A12">' + unit + '</text>' +
        '<circle cx="' + cx + '" cy="' + (by + 62) + '" r="12" fill="#3D434C"/>' +
        (warn ? '<text x="' + cx + '" y="' + (by + 88) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#B42318">' + warn + '</text>' : "");
      return s;
    }
    scenes.push({ root: S.c, frame: function (dt) {
      if (!L.data) return;
      var p = L.p, I = get(L, "I thật") || 0, dc = p.load === "dc", both = p.pos === "both", n = p.pos === "turns" ? p.turns : 1;
      var sp = I > 0.01 ? 20 + 60 * clamp(I / 6, 0, 1) : 0;
      runDots(DL, [[34, 107], [cx - 70, 107], [cx - 70, yL], [290, yL]], dt, sp, 16); runDots(DN, [[290, yN], [cx - 70, yN], [cx - 70, 107], [18, 107]], dt, sp, 16);
      [DL, DN].forEach(function (D) { D.g.setAttribute("opacity", sp ? "1" : "0"); });
      ang = (ang + dt * 900 * clamp(I / (dc ? 0.25 : 0.3), 0, 1.4)) % 360;
      $("#ak-bl", svg).setAttribute("transform", "rotate(" + ang.toFixed(1) + ")"); $("#ak-bl2", svg).setAttribute("transform", "translate(318 108) rotate(" + ang.toFixed(1) + ")");
      shake += dt * 60; var sh = I > 1 ? Math.sin(shake) * clamp(I / 10, 0, 1.6) : 0;
      $("#ak-cmp", svg).setAttribute("transform", "translate(" + sh.toFixed(2) + " 0)");
      acc += dt; if (acc < 0.1) return; acc = 0;
      $("#ak-fan", svg).setAttribute("opacity", p.load === "fan" ? "1" : "0");
      $("#ak-cmp", svg).setAttribute("opacity", /comp|start|stall/.test(p.load) ? "1" : "0");
      $("#ak-dc", svg).setAttribute("opacity", dc ? "1" : "0");
      $("#ak-hot", svg).setAttribute("opacity", p.load === "stall" && I > 1 ? "0.45" : "0");
      $("#ak-ld", svg).textContent = read(L, "Tải");
      $("#ak-wires", svg).innerHTML = '<path d="M34 107H' + (cx - 70) + 'V' + yL + 'H290" stroke="#8A5A2B" stroke-width="6" fill="none" stroke-linejoin="round"/>' +
        '<path d="M290 ' + yN + 'H' + (cx - 70) + 'V107H18" stroke="#2F6FD6" stroke-width="6" fill="none" stroke-linejoin="round"/>' +
        '<text x="' + (cx - 64) + '" y="' + (yL - 6) + '" font-size="10" font-weight="700" fill="#8A5A2B">L</text><text x="' + (cx - 64) + '" y="' + (yN + 16) + '" font-size="10" font-weight="700" fill="#2F6FD6">N</text>';
      var shown = get(L, "số đo"), cant = dc && p.type === "ac";
      var warn = both ? "kẹp cả L và N: triệt nhau ≈ 0" : cant ? "loại chỉ đo AC: không đọc DC" : n > 1 ? "số đo ÷ " + n + " = dòng thật" : "";
      $("#ak-clamp", svg).innerHTML = clampSvg(both, n, nf(shown, 2).replace(",", "."), p.type === "ac" ? "AC A" : "AC/DC A", warn);
    } });
  })();

  /* =====================================================================
     Bài 13: ổ cắm 220 V, VOM thang AC, máy hiện sóng, cầu diode + tụ lọc
     ===================================================================== */
  (function () {
    var S = card("acsin", "ổ cắm 220 V, VOM và tụ lọc sau cầu diode",
      "VOM thang V~ cắm vào ổ điện chỉ hiện trị hiệu dụng. Máy hiện sóng cho thấy đỉnh sóng cao hơn 1,414 lần. Tụ lọc sau cầu diode phải chịu được trị đỉnh: nếu điện áp ghi trên tụ thấp hơn, tụ phồng nắp và xì khói.",
      "0 0 360 250", "Ổ cắm điện, đồng hồ vạn năng thang AC cắm vào ổ, máy hiện sóng, cầu diode và tụ lọc có ghi điện áp chịu được");
    if (!S) return;
    var svg = S.svg, L = S.L, U = uid(svg, "ac"), X0 = 112, Y0 = 8;
    svg.innerHTML = U('<defs>' + DMM_DEFS +
      '<linearGradient id="@can" x1="0" x2="1"><stop offset="0" stop-color="#16243F"/><stop offset=".4" stop-color="#2E4F8F"/><stop offset=".6" stop-color="#3D63A8"/><stop offset="1" stop-color="#15223B"/></linearGradient>' +
      '<radialGradient id="@smk"><stop offset="0" stop-color="#9AA1AD" stop-opacity=".9"/><stop offset="1" stop-color="#9AA1AD" stop-opacity="0"/></radialGradient></defs>') +
      '<rect width="360" height="250" fill="#E9EDF1"/><rect x="0" y="0" width="100" height="150" fill="#DCD6CC"/>' +
      // ổ cắm đôi
      '<rect x="14" y="20" width="72" height="110" rx="10" fill="#FFFFFF" stroke="#AEB5BF"/>' +
      '<rect x="24" y="30" width="52" height="40" rx="8" fill="#F4F6F9" stroke="#D5DBE2"/><circle cx="40" cy="50" r="4.5" fill="#22262C"/><circle cx="60" cy="50" r="4.5" fill="#22262C"/>' +
      '<rect x="24" y="80" width="52" height="40" rx="8" fill="#F4F6F9" stroke="#D5DBE2"/><circle cx="40" cy="100" r="4.5" fill="#22262C"/><circle cx="60" cy="100" r="4.5" fill="#22262C"/>' +
      '<text x="50" y="144" text-anchor="middle" font-size="9" fill="#4A515E">ổ cắm 220 V</text>' +
      U(dmmSvg(X0, Y0, "@")) +
      '<path id="ac-w1" fill="none" stroke="#C62828" stroke-width="2.5"/><path id="ac-w2" fill="none" stroke="#22262C" stroke-width="2.5"/>' +
      '<g id="ac-p1"></g><g id="ac-p2"></g>' +
      // máy hiện sóng
      '<rect x="208" y="8" width="146" height="112" rx="10" fill="#2A2E35"/><rect x="214" y="14" width="134" height="84" rx="4" fill="#0E1A12"/>' +
      '<g stroke="#1F3A27">' + (function () { var s = ""; for (var x = 214; x <= 348; x += 16.75) s += '<path d="M' + x.toFixed(1) + ' 14V98"/>'; for (var y = 14; y <= 98; y += 21) s += '<path d="M214 ' + y + 'H348"/>'; return s; })() + '</g>' +
      '<path id="ac-tr" fill="none" stroke="#5CF08A" stroke-width="1.8"/><path id="ac-pk" fill="none" stroke="#FF5A4E" stroke-width="1" stroke-dasharray="4 3"/><path id="ac-rms" fill="none" stroke="#FFC94A" stroke-width="1" stroke-dasharray="4 3"/>' +
      '<circle id="ac-dot" r="3.5" fill="#fff"/><text id="ac-pkt" x="346" y="24" text-anchor="end" font-size="8" fill="#FF8A80"></text><text id="ac-rt" x="346" y="94" text-anchor="end" font-size="8" fill="#FFD27A"></text>' +
      '<text x="281" y="112" text-anchor="middle" font-size="8.5" fill="#9AA1AD">máy hiện sóng</text>' +
      // cầu diode + tụ
      '<rect x="20" y="166" width="320" height="76" rx="10" fill="#1E7A4C"/>' +
      '<path d="M66 204H118M150 196H198M150 214H226" stroke="#3FA36F" stroke-width="4" fill="none"/>' +
      '<rect x="118" y="186" width="32" height="38" rx="3" fill="#1C1E22"/><text x="134" y="203" text-anchor="middle" font-size="7" fill="#C9CED6">~ + − ~</text><text x="134" y="216" text-anchor="middle" font-size="6.5" fill="#9AA1AD">cầu</text>' +
      '<text x="40" y="200" font-size="9" fill="#E8F5EC">220 V~</text>' +
      '<g id="ac-cap"></g>' +
      '<g id="ac-smoke" opacity="0"><circle cx="206" cy="166" r="12" fill="url(#ac-smk)"/><circle cx="218" cy="158" r="14" fill="url(#ac-smk)"/><circle cx="200" cy="154" r="12" fill="url(#ac-smk)"/></g>' +
      '<text id="ac-cs" x="240" y="198" font-size="9.5" font-weight="700" fill="#E8F5EC"></text><text id="ac-cs2" x="240" y="214" font-size="9" fill="#E8F5EC"></text><text id="ac-cs3" x="240" y="230" font-size="9" fill="#E8F5EC"></text>';
    $("#ac-smoke", svg).querySelectorAll("circle").forEach(function (c) { c.setAttribute("fill", "url(#ac-smk)"); });
    setKnob(svg, X0, Y0, -45); $(".r4-lcdu", svg).textContent = "AC V";
    var r = jackXY(X0, Y0, "VΩ"), cm = jackXY(X0, Y0, "COM");
    $("#ac-w1", svg).setAttribute("d", "M" + r[0] + " " + r[1] + " C " + r[0] + " " + (r[1] + 50) + ", 30 150, 40 72");
    $("#ac-w2", svg).setAttribute("d", "M" + cm[0] + " " + cm[1] + " C " + cm[0] + " " + (cm[1] + 70) + ", 70 160, 60 72");
    probeTip($("#ac-p1", svg), [40, 50], "#C62828"); probeTip($("#ac-p2", svg), [60, 50], "#22262C");
    function capSvg(bulge) {
      var x = 198, y = 172, w = 28, h = 56, s = '<rect x="' + x + '" y="' + (y + 4) + '" width="' + w + '" height="' + h + '" rx="4" fill="url(#ac-can)"/><rect x="' + (x + 19) + '" y="' + (y + 4) + '" width="5" height="' + h + '" fill="#D5DBE4"/>';
      s += bulge ? '<path d="M' + x + ' ' + (y + 6) + ' Q' + (x + w / 2) + ' ' + (y - 12) + ' ' + (x + w) + ' ' + (y + 6) + '" fill="#C9CED6" stroke="#80868E"/>' : '<ellipse cx="' + (x + w / 2) + '" cy="' + (y + 5) + '" rx="' + (w / 2) + '" ry="4" fill="#C9CED6" stroke="#80868E"/>';
      return s;
    }
    var acc = 1, lastBulge = null, puff = 0;
    scenes.push({ root: S.c, frame: function (dt) {
      if (!L.data) return;
      var p = L.p, Vp = p.V * Math.SQRT2, bad = Vp > p.cap, tight = !bad && Vp * 1.2 > p.cap;
      puff += dt; $("#ac-smoke", svg).setAttribute("opacity", bad ? (0.55 + 0.35 * Math.sin(puff * 3)).toFixed(2) : "0");
      $("#ac-smoke", svg).setAttribute("transform", "translate(0 " + (-((puff * 12) % 14)).toFixed(1) + ")");
      var ys = series(L, "v(t)"), n = ys.length, i0 = idxOf(L);
      function X(i) { return 214 + 134 * i / (n - 1); } function Y(v) { return 56 - v / 400 * 42; }
      $("#ac-dot", svg).setAttribute("cx", X(i0).toFixed(1)); $("#ac-dot", svg).setAttribute("cy", Y(ys[i0]).toFixed(1));
      acc += dt; if (acc < 0.15) return; acc = 0;
      var d = ""; for (var i = 0; i < n; i += 4) d += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(ys[i]).toFixed(1);
      $("#ac-tr", svg).setAttribute("d", d);
      $("#ac-pk", svg).setAttribute("d", "M214 " + Y(Vp).toFixed(1) + "H348"); $("#ac-rms", svg).setAttribute("d", "M214 " + Y(p.V).toFixed(1) + "H348");
      $("#ac-pkt", svg).textContent = "đỉnh " + nf(Vp, 0) + " V"; $("#ac-rt", svg).textContent = "hiệu dụng " + nf(p.V, 0) + " V";
      $(".r4-lcd", svg).textContent = nf(p.V, 1).replace(",", ".");
      if (lastBulge !== bad) { lastBulge = bad; $("#ac-cap", svg).innerHTML = capSvg(bad); }
      $("#ac-cs", svg).textContent = "Tụ " + nf(p.C, 0) + " µF " + nf(p.cap, 0) + " V";
      $("#ac-cs", svg).setAttribute("fill", bad ? "#FF8A80" : tight ? "#FFD27A" : "#E8F5EC");
      $("#ac-cs2", svg).textContent = "Bus ≈ " + nf(Math.max.apply(null, series(L, "bus")), 0) + " V";
      $("#ac-cs3", svg).textContent = bad ? "QUÁ ÁP: tụ phồng" : tight ? "Dư an toàn quá ít" : "Tụ chịu được";
    } });
  })();

  requestAnimationFrame(loop);
})();
