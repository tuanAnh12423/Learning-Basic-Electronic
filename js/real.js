/* 15/10/2026: "Hình thực tế" — vẽ thiết bị giống ngoài đời (SVG) đặt ở đầu một số mô phỏng.
   Không đụng vào labs.js: mỗi cảnh tự chèn 1 thẻ .card.real vào đầu <section id="lab-...">,
   chỉ chạy hoạt hình khi đang hiện trên màn hình. Số liệu là ví dụ minh hoạ xu hướng. */
(function () {
  "use strict";
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* bỏ qua */ }
  var NS = "http://www.w3.org/2000/svg";
  var scenes = [];

  function $(s, r) { return (r || document).querySelector(s); }
  function nf(v, d) { return (+v).toFixed(d).replace(".", ","); }
  function amp(I) { return I < 1 ? nf(I * 1000, 0) + " mA" : nf(I, 2) + " A"; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function card(lab, title, lead) {
    var sec = document.getElementById("lab-" + lab);
    if (!sec) return null;
    var c = document.createElement("div");
    c.className = "card real";
    c.innerHTML = '<h2>' + title + '</h2><p class="lead">' + lead + '</p>';
    sec.insertBefore(c, sec.firstChild);
    return c;
  }
  function seg(c, label, items, cur, onPick) {
    var w = document.createElement("div");
    w.innerHTML = '<p class="band-t">' + label + '</p>';
    var g = document.createElement("div"); g.className = "seg"; g.setAttribute("role", "group"); g.setAttribute("aria-label", label);
    items.forEach(function (it) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = it[1];
      b.setAttribute("aria-pressed", it[0] === cur ? "true" : "false");
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(g.children, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        onPick(it[0]);
      });
      g.appendChild(b);
    });
    w.appendChild(g); c.appendChild(w);
    return g;
  }
  // Điểm chạy dọc đường gấp khúc
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
  // Nhóm chấm chuyển động (tạo sẵn n chấm, mỗi khung chỉ đổi toạ độ)
  function dots(svg, n, r, fill, cls) {
    var g = document.createElementNS(NS, "g"); if (cls) g.setAttribute("class", cls);
    var arr = [];
    for (var i = 0; i < n; i++) { var c = document.createElementNS(NS, "circle"); c.setAttribute("r", r); c.setAttribute("fill", fill); g.appendChild(c); arr.push(c); }
    svg.appendChild(g);
    return { g: g, arr: arr };
  }
  function placeDots(D, path, phase, spacing, skip) {
    var L = plen(path);
    D.arr.forEach(function (c, k) {
      var s = k * spacing + phase;
      if (k * spacing > L) { c.setAttribute("visibility", "hidden"); return; }
      var p = ptAt(path, s);
      if (skip && skip(p)) { c.setAttribute("visibility", "hidden"); return; }
      c.setAttribute("visibility", "visible"); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1));
    });
  }

  /* =====================================================================
     1) MẠCH THẬT: pin + điện trở + bóng đèn + đồng hồ vạn năng đo dòng
     ===================================================================== */
  (function () {
    var c = card("ohm", "Hình thực tế: pin, điện trở và bóng đèn",
      "Mạch nối tiếp gồm pin, một điện trở và bóng đèn 12 V. Đồng hồ vạn năng mắc nối tiếp để đo dòng. Đổi pin hoặc điện trở rồi xem đèn sáng mạnh hay yếu.");
    if (!c) return;
    var RB = 24; // điện trở dây tóc lấy gần đúng (đèn 12 V 6 W: 12² ÷ 6 = 24 Ω)
    var RES = { "2.2": { v: 2.2, b: ["#D9362C", "#D9362C", "#C9A227"] }, "6.8": { v: 6.8, b: ["#2F6FD6", "#8E949B", "#C9A227"] },
      "12": { v: 12, b: ["#7A4A25", "#D9362C", "#161616"] }, "22": { v: 22, b: ["#D9362C", "#D9362C", "#161616"] },
      "47": { v: 47, b: ["#F1D12B", "#8A4FC8", "#161616"] } };
    var st = { V: 12, R: "2.2" };
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 360 250"); svg.setAttribute("class", "real-svg"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Mạch thật: pin nối với điện trở, bóng đèn và đồng hồ vạn năng mắc nối tiếp");
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="ox-bat" x1="0" x2="1"><stop offset="0" stop-color="#2A2F36"/><stop offset=".55" stop-color="#4A515C"/><stop offset="1" stop-color="#23272D"/></linearGradient>' +
      '<linearGradient id="ox-res" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3BF"/><stop offset=".5" stop-color="#DCC394"/><stop offset="1" stop-color="#B99D69"/></linearGradient>' +
      '<radialGradient id="ox-glass" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".6" stop-color="#EAF1F8" stop-opacity=".55"/><stop offset="1" stop-color="#C9D6E3" stop-opacity=".7"/></radialGradient>' +
      '<radialGradient id="ox-glow"><stop offset="0" stop-color="#FFF4C2" stop-opacity="1"/><stop offset=".35" stop-color="#FFD866" stop-opacity=".75"/><stop offset="1" stop-color="#FFB300" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="ox-base" x1="0" x2="1"><stop offset="0" stop-color="#8C939C"/><stop offset=".5" stop-color="#E4E7EB"/><stop offset="1" stop-color="#7D848D"/></linearGradient>' +
      '<linearGradient id="ox-dmm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7CB3A"/><stop offset="1" stop-color="#E0A812"/></linearGradient>' +
      '<filter id="ox-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".25"/></filter>' +
      '</defs>' +
      // dây dẫn
      '<g fill="none" stroke="#3B4049" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M45 96V40H300V70"/><path d="M300 140V212H210"/><path d="M150 212H122V78H85V96"/></g>' +
      // pin
      '<g filter="url(#ox-sh)"><rect x="20" y="96" width="90" height="82" rx="8" fill="url(#ox-bat)"/>' +
      '<rect x="20" y="118" width="90" height="26" fill="#E60012"/>' +
      '<text id="ox-bv" x="65" y="136" text-anchor="middle" fill="#fff" font-weight="700" font-size="15">12 V</text>' +
      '<rect x="36" y="88" width="18" height="10" rx="2" fill="#C62828"/><rect x="76" y="88" width="18" height="10" rx="2" fill="#20242A"/>' +
      '<text x="45" y="112" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">+</text><text x="85" y="112" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">−</text>' +
      '<text x="65" y="166" text-anchor="middle" fill="#AEB4BF" font-size="10">PIN</text></g>' +
      // điện trở
      '<g filter="url(#ox-sh)"><rect x="148" y="29" width="70" height="22" rx="11" fill="url(#ox-res)"/>' +
      '<rect id="ox-b0" x="161" y="29" width="7" height="22" fill="#D9362C"/><rect id="ox-b1" x="173" y="29" width="7" height="22" fill="#D9362C"/>' +
      '<rect id="ox-b2" x="185" y="29" width="7" height="22" fill="#C9A227"/><rect x="203" y="29" width="6" height="22" fill="#C9A227"/></g>' +
      '<text id="ox-rl" x="183" y="70" text-anchor="middle" font-size="12" fill="#4A515E">R = 2,2 Ω</text>' +
      // bóng đèn
      '<circle id="ox-glw" cx="300" cy="96" r="62" fill="url(#ox-glow)" opacity="0"/>' +
      '<path d="M300 70 L300 76" stroke="#3B4049" stroke-width="3"/>' +
      '<circle cx="300" cy="96" r="26" fill="url(#ox-glass)" stroke="#9AA6B3" stroke-width="1.5"/>' +
      '<path d="M291 120 L289 104 M309 120 L311 104" stroke="#8A8F96" stroke-width="1.5"/>' +
      '<path id="ox-fil" d="M289 104 q2 -8 4 0 q2 8 4 0 q2 -8 4 0 q2 8 4 0 q2 -8 4 0 q2 8 2 0" fill="none" stroke="#5A3A22" stroke-width="2"/>' +
      '<rect x="288" y="120" width="24" height="22" rx="3" fill="url(#ox-base)"/>' +
      '<path d="M288 126h24M288 131h24M288 136h24" stroke="#6E757E" stroke-width="1"/>' +
      '<rect x="295" y="141" width="10" height="5" rx="2" fill="#2B2F36"/>' +
      '<text x="336" y="148" text-anchor="middle" font-size="10.5" fill="#4A515E">Đèn 12 V</text>' +
      // đồng hồ vạn năng
      '<g filter="url(#ox-sh)"><rect x="150" y="158" width="60" height="88" rx="10" fill="url(#ox-dmm)"/>' +
      '<rect x="156" y="164" width="48" height="76" rx="6" fill="#2A2E35"/>' +
      '<rect x="160" y="168" width="40" height="18" rx="3" fill="#B9C9A4"/>' +
      '<text id="ox-lcd" x="197" y="182" text-anchor="end" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="11" font-weight="700" fill="#1D2A12">0.46</text>' +
      '<circle cx="180" cy="210" r="14" fill="#3D434C" stroke="#14171B"/><path d="M180 210 L190 200" stroke="#F7CB3A" stroke-width="3" stroke-linecap="round"/>' +
      '<text x="196" y="198" font-size="8" fill="#E9EDF2">A</text><text x="160" y="198" font-size="8" fill="#9AA1AD">V</text><text x="176" y="233" font-size="8" fill="#9AA1AD">Ω</text>' +
      '<circle cx="152" cy="212" r="4" fill="#20242A"/><circle cx="208" cy="212" r="4" fill="#C62828"/></g>' +
      '<text x="180" y="156" text-anchor="middle" font-size="10.5" fill="#4A515E">Đồng hồ đo dòng</text>';
    c.appendChild(svg);
    var D = dots(svg, 30, 2.6, "#B86A00");
    var path = [[45, 96], [45, 40], [300, 40], [300, 70], [300, 140], [300, 212], [210, 212], [150, 212], [122, 212], [122, 78], [85, 78], [85, 96]];
    function skip(p) { return (p[0] > 270 && p[1] > 66 && p[1] < 146) || (p[1] > 205 && p[0] > 146 && p[0] < 214) || (p[1] < 60 && p[0] > 146 && p[0] < 220); }
    seg(c, "Pin", [[3, "3 V"], [6, "6 V"], [9, "9 V"], [12, "12 V"]], 12, function (v) { st.V = v; calc(); });
    seg(c, "Điện trở (đọc theo vạch màu)", [["2.2", "2,2 Ω"], ["6.8", "6,8 Ω"], ["12", "12 Ω"], ["22", "22 Ω"], ["47", "47 Ω"]], "2.2", function (v) { st.R = v; calc(); });
    var rd = document.createElement("div"); rd.className = "read"; c.appendChild(rd);
    var f = document.createElement("div"); f.className = "formula"; f.style.whiteSpace = "pre-line"; c.appendChild(f);
    var nt = document.createElement("p"); nt.className = "note";
    nt.textContent = "Điện trở dây tóc lấy gần đúng 24 Ω (đèn 12 V 6 W). Thực tế dây tóc nguội có điện trở nhỏ hơn và tăng khi nóng lên.";
    c.appendChild(nt);
    var I = 0, phase = 0;
    function calc() {
      var r = RES[st.R], Rt = r.v + RB; I = st.V / Rt;
      var Ub = I * RB, Pb = I * I * RB, br = clamp(Pb / 6, 0, 1);
      $("#ox-bv", svg).textContent = st.V + " V";
      r.b.forEach(function (col, i) { $("#ox-b" + i, svg).setAttribute("fill", col); });
      $("#ox-rl", svg).textContent = "R = " + nf(r.v, r.v % 1 ? 1 : 0) + " Ω";
      $("#ox-lcd", svg).textContent = I < 1 ? nf(I * 1000, 0) + "mA" : nf(I, 2);
      $("#ox-glw", svg).setAttribute("opacity", (Math.pow(br, 0.6)).toFixed(2));
      $("#ox-glw", svg).setAttribute("r", (34 + 34 * br).toFixed(0));
      var col = br < 0.05 ? "#5A3A22" : br < 0.25 ? "#C2410C" : br < 0.6 ? "#F59E0B" : "#FFF3B0";
      $("#ox-fil", svg).setAttribute("stroke", col);
      rd.innerHTML = "<div><small>Đồng hồ đo (dòng I)</small><b>" + amp(I) + "</b></div><div><small>Điện áp trên đèn</small><b>" + nf(Ub, 1) +
        " V</b></div><div><small>Công suất đèn</small><b>" + nf(Pb, 2) + " W</b></div><div><small>Độ sáng so với định mức</small><b>" + nf(100 * Pb / 6, 0) + "%</b></div>";
      f.textContent = "I = V ÷ (R + R đèn) = " + st.V + " ÷ (" + nf(r.v, r.v % 1 ? 1 : 0) + " + 24) = " + amp(I) + "\nP đèn = I² × R đèn = " + nf(Pb, 2) + " W";
      if (REDUCED) placeDots(D, path, 0, 22, skip);
    }
    calc();
    scenes.push({ root: c, frame: function (dt) { phase += dt * (20 + 260 * clamp(I / 0.5, 0, 1)); placeDots(D, path, phase, 22, skip); } });
  })();

  /* =====================================================================
     2) MÁY LẠNH THẬT: dàn lạnh trong phòng + dàn nóng ngoài trời
     ===================================================================== */
  (function () {
    var c = card("lanh", "Hình thực tế: máy lạnh treo tường",
      "Dàn lạnh trong phòng, dàn nóng ngoài trời, nối với nhau bằng hai ống đồng. Ống nhỏ đưa môi chất lỏng vào dàn lạnh, ống lớn (bọc cách nhiệt) đưa hơi lạnh về máy nén. Bật máy rồi thử từng lỗi.");
    if (!c) return;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 360 280"); svg.setAttribute("class", "real-svg"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Máy lạnh: dàn lạnh treo tường trong phòng, dàn nóng ngoài trời, hai ống đồng nối giữa, nhiệt kế trong phòng");
    var blades = "";
    for (var k = 0; k < 3; k++) blades += '<path d="M0 0 C 8 -6, 22 -8, 30 -2 C 22 4, 8 4, 0 0Z" fill="#9AA3AE" transform="rotate(' + (k * 120) + ')"/>';
    var grill = "";
    for (var gx = 252; gx <= 318; gx += 8) grill += '<path d="M' + gx + ' 152V226" stroke="#4A515C" stroke-width="1"/>';
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="ax-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E3E7EC"/></linearGradient>' +
      '<linearGradient id="ax-out" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5F6F8"/><stop offset="1" stop-color="#CDD2D9"/></linearGradient>' +
      '<radialGradient id="ax-comp" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#5B626D"/><stop offset="1" stop-color="#1F2329"/></radialGradient>' +
      '<radialGradient id="ax-hot" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FF5A4E" stop-opacity=".55"/><stop offset="1" stop-color="#FF5A4E" stop-opacity="0"/></radialGradient>' +
      '<filter id="ax-sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".22"/></filter>' +
      '</defs>' +
      // trong phòng / tường / ngoài trời
      '<rect x="0" y="0" width="204" height="280" fill="#EAF0F6"/><rect x="0" y="252" width="204" height="28" fill="#DCD3C6"/>' +
      '<rect x="204" y="0" width="14" height="280" fill="#BFC5CE"/><path d="M204 30h14M204 70h14M204 110h14M204 150h14M204 190h14M204 230h14" stroke="#AEB5BF"/>' +
      '<rect x="218" y="0" width="142" height="280" fill="#FFF4E2"/><rect x="218" y="246" width="142" height="34" fill="#D9C9AA"/>' +
      '<circle cx="334" cy="34" r="14" fill="#FFC94A"/><g stroke="#FFC94A" stroke-width="3" stroke-linecap="round"><path d="M334 12v-6M334 62v-6M312 34h-6M362 34h-6M318 18l-4-4M350 50l4 4M350 18l4-4M318 50l-4 4"/></g>' +
      '<text x="226" y="20" font-size="10.5" fill="#8A5300">Ngoài trời 35°C</text><text x="8" y="246" font-size="10.5" fill="#4A515E">Trong phòng</text>' +
      // khí lạnh thổi ra
      '<g id="ax-air" fill="none" stroke="#5AA7E8" stroke-width="2.5" stroke-linecap="round" opacity="0">' +
      '<path class="air" d="M40 80 q10 14 0 28 q-10 14 0 28 q10 14 0 28"/><path class="air" d="M80 80 q10 14 0 28 q-10 14 0 28 q10 14 0 28"/>' +
      '<path class="air" d="M120 80 q10 14 0 28 q-10 14 0 28 q10 14 0 28"/></g>' +
      // dàn lạnh
      '<g filter="url(#ax-sh)"><rect x="16" y="22" width="166" height="50" rx="12" fill="url(#ax-in)" stroke="#CBD2DA"/>' +
      '<path d="M26 30h120" stroke="#D5DBE2" stroke-width="2"/><path d="M26 36h120" stroke="#D5DBE2" stroke-width="2"/>' +
      '<path id="ax-flap" d="M24 64 Q99 74 174 64" fill="none" stroke="#B8C0CA" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="146" y="38" width="28" height="14" rx="3" fill="#1D2127"/>' +
      '<text id="ax-led" x="160" y="49" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="10" font-weight="700" fill="#FF5A4E"></text>' +
      '<rect id="ax-dust" x="24" y="24" width="120" height="16" rx="4" fill="#9A8F7E" opacity="0"/></g>' +
      // nhiệt kế trong phòng
      '<g transform="translate(160 150)"><rect x="0" y="0" width="14" height="78" rx="7" fill="#fff" stroke="#AEB5BF"/>' +
      '<rect id="ax-th" x="4" y="40" width="6" height="34" rx="3" fill="#E60012"/><circle cx="7" cy="80" r="9" fill="#E60012"/>' +
      '<text id="ax-tt" x="-6" y="14" text-anchor="end" font-size="16" font-weight="700" fill="#16191F">32°C</text>' +
      '<text x="-6" y="30" text-anchor="end" font-size="10" fill="#4A515E">nhiệt độ phòng</text></g>' +
      // hai ống đồng
      '<path d="M182 44H234V168H246" fill="none" stroke="#D6DCE3" stroke-width="10" stroke-linejoin="round"/>' +
      '<path d="M182 44H234V168H246" fill="none" stroke="#C3CAD3" stroke-width="10" stroke-dasharray="2 5" stroke-linejoin="round"/>' +
      '<path d="M182 58H224V200H246" fill="none" stroke="#C27C4A" stroke-width="4" stroke-linejoin="round"/>' +
      // hơi nóng bốc lên khỏi dàn nóng
      '<g id="ax-heat" fill="none" stroke="#FF5A4E" stroke-width="2.5" stroke-linecap="round" opacity="0">' +
      '<path class="heat" d="M266 132 q6 -10 0 -20 q-6 -10 0 -20"/><path class="heat" d="M290 132 q6 -10 0 -20 q-6 -10 0 -20"/><path class="heat" d="M314 132 q6 -10 0 -20 q-6 -10 0 -20"/></g>' +
      // dàn nóng
      '<g filter="url(#ax-sh)"><rect x="246" y="140" width="106" height="96" rx="6" fill="url(#ax-out)" stroke="#AEB5BF"/>' +
      '<rect id="ax-hotbody" x="246" y="140" width="106" height="96" rx="6" fill="url(#ax-hot)" opacity="0"/>' +
      '<circle cx="286" cy="189" r="38" fill="#2F343C"/>' + grill +
      '<g id="ax-fan" transform="translate(286 189)">' + blades + '<circle r="6" fill="#C7CED6"/></g>' +
      '<circle cx="286" cy="189" r="38" fill="none" stroke="#1E2228" stroke-width="3"/>' +
      '<rect x="328" y="150" width="20" height="78" rx="3" fill="#E7EAEE" stroke="#C5CBD3"/>' +
      '<ellipse id="ax-cmp" cx="338" cy="200" rx="8" ry="16" fill="url(#ax-comp)"/>' +
      '<text x="338" y="166" text-anchor="middle" font-size="8" fill="#4A515E">máy</text><text x="338" y="175" text-anchor="middle" font-size="8" fill="#4A515E">nén</text>' +
      '<rect x="254" y="236" width="12" height="8" fill="#8D939B"/><rect x="332" y="236" width="12" height="8" fill="#8D939B"/></g>';
    c.appendChild(svg);
    var lg = document.createElement("p"); lg.className = "legend";
    lg.innerHTML = '<span><i style="background:#2F6FD6"></i>Ống lớn bọc cách nhiệt: hơi lạnh áp thấp về máy nén</span><span><i style="background:#F08A24"></i>Ống đồng nhỏ: môi chất lỏng áp cao vào dàn lạnh</span>';
    c.appendChild(lg);
    var gasDots = dots(svg, 14, 3, "#2F6FD6"), liqDots = dots(svg, 18, 2.2, "#F08A24");
    var gasPath = [[182, 44], [234, 44], [234, 168], [246, 168]], liqPath = [[246, 200], [224, 200], [224, 58], [182, 58]];

    var SET = 26, OUT = 35;
    var st = { on: false, fault: "ok", T: 32, minutes: 0, compT: 0, trip: false, fan: 0, ang: 0, ph: 0 };
    var row = document.createElement("div"); row.className = "seg";
    var bOn = document.createElement("button"); bOn.type = "button"; bOn.className = "btn";
    var bRe = document.createElement("button"); bRe.type = "button"; bRe.className = "btn"; bRe.textContent = "Làm lại (phòng 32°C)";
    row.appendChild(bOn); row.appendChild(bRe); c.appendChild(row);
    seg(c, "Thử lỗi", [["ok", "Bình thường"], ["fan", "Quạt dàn nóng hỏng"], ["filter", "Lưới lọc bẩn"], ["gas", "Thiếu gas"]], "ok", function (v) {
      st.fault = v; st.trip = false; st.compT = 0; paint();
    });
    var rd = document.createElement("div"); rd.className = "read"; c.appendChild(rd);
    var msg = document.createElement("div"); msg.className = "formula"; msg.style.whiteSpace = "normal"; c.appendChild(msg);
    var nt = document.createElement("p"); nt.className = "note";
    nt.textContent = "Tua nhanh: 1 giây trên màn hình bằng khoảng 1 phút. Hình chỉ minh hoạ xu hướng; nhiệt độ, áp suất thật phụ thuộc từng máy và loại gas, xem tài liệu service của hãng.";
    c.appendChild(nt);
    bOn.addEventListener("click", function () { st.on = !st.on; st.trip = false; st.compT = 0; paint(); });
    bRe.addEventListener("click", function () { st.T = 32; st.minutes = 0; st.trip = false; st.compT = 0; paint(); });

    function rate() { return { ok: 1, fan: 0.3, filter: 0.4, gas: 0.35 }[st.fault]; }
    function compState() {
      if (!st.on) return "off";
      if (st.trip) return "trip";
      if (st.T <= SET + 0.05) return "hold";
      return "run";
    }
    function paint() {
      var cs = compState();
      bOn.textContent = st.on ? "Tắt máy" : "Bật máy (cài 26°C)";
      bOn.setAttribute("aria-pressed", st.on ? "true" : "false");
      $("#ax-led", svg).textContent = st.on ? SET + "°" : "";
      $("#ax-tt", svg).textContent = nf(st.T, 1) + "°C";
      var lvl = clamp((st.T - 20) / 16, 0, 1);
      $("#ax-th", svg).setAttribute("y", (74 - 70 * lvl).toFixed(1)); $("#ax-th", svg).setAttribute("height", (70 * lvl + 4).toFixed(1));
      $("#ax-dust", svg).setAttribute("opacity", st.fault === "filter" ? ".85" : "0");
      var cooling = cs === "run" || cs === "hold";
      $("#ax-air", svg).setAttribute("opacity", !st.on ? "0" : cs === "trip" ? ".15" : st.fault === "ok" ? ".9" : st.fault === "filter" ? ".3" : ".45");
      $("#ax-flap", svg).setAttribute("d", st.on ? "M24 64 Q99 84 174 64" : "M24 64 Q99 74 174 64");
      $("#ax-heat", svg).setAttribute("opacity", cs === "run" ? (st.fault === "fan" ? "1" : ".7") : cs === "hold" ? ".3" : "0");
      $("#ax-hotbody", svg).setAttribute("opacity", st.on && st.fault === "fan" ? clamp(0.3 + st.compT, 0, 1).toFixed(2) : "0");
      $("#ax-cmp", svg).setAttribute("fill", st.on && st.fault === "fan" && st.compT > 0.5 ? "#B42318" : "url(#ax-comp)");
      gasDots.g.setAttribute("opacity", cooling ? (st.fault === "gas" ? ".35" : "1") : "0");
      liqDots.g.setAttribute("opacity", cooling ? (st.fault === "gas" ? ".35" : "1") : "0");
      var compTxt = { off: "Tắt", run: "Đang chạy", hold: "Đạt nhiệt độ, chạy nhẹ", trip: "Ngắt bảo vệ quá nhiệt" }[cs];
      rd.innerHTML = "<div><small>Nhiệt độ phòng</small><b>" + nf(st.T, 1) + "°C</b></div><div><small>Nhiệt độ cài</small><b>" + SET +
        "°C</b></div><div><small>Máy nén</small><b>" + compTxt + "</b></div><div><small>Đã chạy (tua nhanh)</small><b>" + Math.floor(st.minutes) + " phút</b></div>";
      var m = !st.on ? "Máy đang tắt. Bấm \"Bật máy\" để chạy."
        : st.fault === "ok" ? (cs === "hold" ? "Phòng đã xuống 26°C. Máy nén chạy nhẹ để giữ nhiệt độ." : "Bình thường: dàn lạnh thổi gió mát, dàn nóng thổi hơi nóng ra ngoài, phòng mát nhanh.")
        : st.fault === "fan" ? (st.trip ? "Quạt dàn nóng không quay nên nhiệt không thoát ra được. Áp cao tăng, máy nén nóng lên và có thể bị bảo vệ ngắt. Phòng gần như không mát thêm."
          : "Quạt dàn nóng không quay: nhiệt dồn ở dàn nóng, áp cao tăng, máy nén nóng dần. Phòng mát rất chậm.")
        : st.fault === "filter" ? "Lưới lọc bẩn: gió qua dàn lạnh yếu, hút nhiệt kém nên phòng mát chậm. Vệ sinh lưới lọc là cách xử lý đầu tiên."
        : "Thiếu gas: lượng môi chất chạy trong ống ít, áp cao và áp thấp đều thấp, gió ra không đủ lạnh, phòng mát chậm.";
      msg.textContent = m;
    }
    paint();
    scenes.push({ root: c, frame: function (dt) {
      var cs = compState(), sim = dt * 60; // 1 giây = 60 giây mô phỏng
      if (st.on) st.minutes += sim / 60;
      // nhiệt độ phòng
      var cool = cs === "run" ? rate() : cs === "hold" ? 0.02 * (st.T - SET + 0.05) * 50 : 0;
      st.T += (-cool * 0.017 * sim + 0.0012 * (OUT - st.T) * sim * (cs === "run" ? 0.15 : 1)) ;
      if (cs === "hold" && st.T > SET + 0.3) st.T -= 0.017 * sim;
      st.T = clamp(st.T, 18, OUT);
      if (st.on && st.fault === "fan" && !st.trip) { st.compT += dt * 0.12; if (st.compT >= 1) st.trip = true; }
      // quạt dàn nóng và gas
      var fanOn = st.on && cs !== "trip" && st.fault !== "fan" && cs !== "off";
      st.fan += ((fanOn ? (cs === "hold" ? 0.4 : 1) : 0) - st.fan) * Math.min(1, dt * 2);
      st.ang = (st.ang + st.fan * dt * 540) % 360;
      $("#ax-fan", svg).setAttribute("transform", "translate(286 189) rotate(" + st.ang.toFixed(1) + ")");
      var flow = cs === "run" ? (st.fault === "gas" ? 0.4 : 1) : cs === "hold" ? 0.3 : 0;
      st.ph += dt * 40 * flow;
      placeDots(gasDots, gasPath, st.ph, 16); placeDots(liqDots, liqPath, st.ph * 0.7, 13);
      paint();
    } });
  })();

  /* =====================================================================
     3) BO MẠCH THẬT: chip → transistor → relay → quạt 220 V
     ===================================================================== */
  (function () {
    var c = card("rl", "Hình thực tế: bo mạch bật quạt bằng relay",
      "Bo mạch xanh với chip, điện trở, transistor, diode và relay vỏ trong. Bấm cho chip ra lệnh: cuộn relay hút, tiếp điểm đóng và quạt 220 V quay.");
    if (!c) return;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 360 260"); svg.setAttribute("class", "real-svg"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Bo mạch: chip nối điện trở vào transistor, transistor đóng cuộn relay, tiếp điểm relay cấp điện 220 V cho quạt");
    var blades = "";
    for (var k = 0; k < 4; k++) blades += '<path d="M0 0 C 6 -6, 20 -10, 27 -3 C 20 4, 6 5, 0 0Z" fill="#7FA7D6" transform="rotate(' + (k * 90) + ')"/>';
    var coil = "";
    for (var y = 104; y <= 156; y += 4) coil += '<path d="M198 ' + y + 'h26" stroke="#B5651D" stroke-width="3"/>';
    svg.innerHTML =
      '<defs>' +
      '<linearGradient id="rx-pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E7A4C"/><stop offset="1" stop-color="#145C38"/></linearGradient>' +
      '<linearGradient id="rx-case" x1="0" x2="1"><stop offset="0" stop-color="#DCEBFA" stop-opacity=".55"/><stop offset="1" stop-color="#9FBCDB" stop-opacity=".45"/></linearGradient>' +
      '<radialGradient id="rx-spark"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".4" stop-color="#FFE066"/><stop offset="1" stop-color="#FF8A00" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="rx-led"><stop offset="0" stop-color="#FFD0CC"/><stop offset=".5" stop-color="#FF3B30"/><stop offset="1" stop-color="#FF3B30" stop-opacity="0"/></radialGradient>' +
      '<filter id="rx-sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".3"/></filter>' +
      '</defs>' +
      // bo mạch
      '<rect x="6" y="16" width="262" height="230" rx="12" fill="url(#rx-pcb)"/>' +
      '<circle cx="20" cy="30" r="5" fill="#0E3F27" stroke="#C9A227" stroke-width="2"/><circle cx="254" cy="30" r="5" fill="#0E3F27" stroke="#C9A227" stroke-width="2"/>' +
      '<circle cx="20" cy="232" r="5" fill="#0E3F27" stroke="#C9A227" stroke-width="2"/>' +
      // đường mạch (đồng phủ xanh)
      '<g fill="none" stroke="#3FA36F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M78 150H98"/><path d="M128 150H146"/>' +            // chip → Rb → B
      '<path d="M164 136V170H211V160"/>' +                            // C → đáy cuộn
      '<path d="M211 100V80H178V40H40"/>' +                           // đỉnh cuộn → +12 V
      '<path d="M156 172V214H40"/>' +                                 // E → GND
      '<path d="M178 80V92"/><path d="M178 120V170"/>' +              // diode song song cuộn
      '</g>' +
      '<g fill="none" stroke="#E25555" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85">' +
      '<path d="M248 80H262"/><path d="M234 196H262"/></g>' +
      '<text x="44" y="36" font-size="10" fill="#E8F5EC" font-weight="700">+12 V</text><text x="44" y="210" font-size="10" fill="#E8F5EC" font-weight="700">GND</text>' +
      // chip
      '<g filter="url(#rx-sh)"><rect x="30" y="132" width="48" height="36" rx="3" fill="#1C1E22"/>' +
      '<g stroke="#C9CED6" stroke-width="2.5">' +
      '<path d="M36 128v4M46 128v4M56 128v4M66 128v4M36 168v4M46 168v4M56 168v4M66 168v4"/></g>' +
      '<circle cx="36" cy="138" r="2" fill="#555B64"/><text x="54" y="154" text-anchor="middle" font-size="10" fill="#C9CED6">CHIP</text></g>' +
      '<text id="rx-pinv" x="54" y="188" text-anchor="middle" font-size="10" fill="#E8F5EC">chân ra: 0 V</text>' +
      // điện trở nền
      '<path d="M94 150h6M126 150h6" stroke="#C9CED6" stroke-width="2"/>' +
      '<rect x="99" y="143" width="28" height="14" rx="7" fill="#DCC394"/>' +
      '<rect x="105" y="143" width="3" height="14" fill="#7A4A25"/><rect x="110" y="143" width="3" height="14" fill="#161616"/><rect x="115" y="143" width="3" height="14" fill="#F0892A"/><rect x="121" y="143" width="2" height="14" fill="#C9A227"/>' +
      '<text x="113" y="138" text-anchor="middle" font-size="9" fill="#E8F5EC">R nền</text>' +
      // transistor TO-92
      '<g id="rx-tr" filter="url(#rx-sh)"><path d="M146 160V136a10 10 0 0 1 20 0V160Z" fill="#1C1E22"/>' +
      '<text x="156" y="152" text-anchor="middle" font-size="7" fill="#9AA1AD">NPN</text></g>' +
      '<path d="M150 160v12M156 160v12M162 160v-4" stroke="#C9CED6" stroke-width="2"/>' +
      '<circle id="rx-spike" cx="164" cy="150" r="22" fill="#B05BFF" opacity="0"/>' +
      '<text x="156" y="190" text-anchor="middle" font-size="9" fill="#E8F5EC">transistor</text>' +
      // diode dập xung
      '<g id="rx-dio"><rect x="173" y="92" width="10" height="28" rx="4" fill="#1C1E22"/><rect x="173" y="94" width="10" height="4" fill="#C9CED6"/></g>' +
      '<rect id="rx-dio-x" x="171" y="90" width="14" height="32" rx="4" fill="none" stroke="#FFE066" stroke-dasharray="3 3" opacity="0"/>' +
      '<text x="168" y="110" text-anchor="end" font-size="9" fill="#E8F5EC">diode</text>' +
      // relay vỏ trong
      '<g filter="url(#rx-sh)"><rect x="190" y="60" width="62" height="114" rx="6" fill="#1F4E8C"/>' +
      '<rect x="194" y="64" width="54" height="106" rx="4" fill="url(#rx-case)" stroke="#BFD6EE"/></g>' +
      '<rect x="207" y="96" width="8" height="66" fill="#8A9099"/>' + coil +
      '<rect x="205" y="92" width="12" height="6" rx="1" fill="#6B7280"/>' +
      // tiếp điểm + lá động: bản lề ở phải (242,82). Cuộn hút thì lá sắt đi XUỐNG chạm lõi, đầu lá chạm tiếp điểm NO bên dưới
      '<rect x="190" y="89" width="11" height="4" rx="1" fill="#D9DDE2" stroke="#7D848D"/>' +
      '<text x="191" y="101" font-size="7.5" fill="#E8F5EC">NO</text>' +
      '<g id="rx-arm"><path d="M242 82 L199 82" stroke="#D9DDE2" stroke-width="3" stroke-linecap="round"/><circle cx="198" cy="82" r="3" fill="#C9CED6"/>' +
      '<path d="M240 86 L210 88" stroke="#7D848D" stroke-width="5" stroke-linecap="round"/></g>' +
      '<circle cx="242" cy="82" r="3" fill="#7D848D"/><text x="226" y="76" font-size="7.5" fill="#E8F5EC">COM</text>' +
      '<circle id="rx-spk" cx="196" cy="88" r="12" fill="url(#rx-spark)" opacity="0"/>' +
      '<text x="221" y="186" text-anchor="middle" font-size="9" fill="#E8F5EC">relay</text>' +
      // đèn báo
      '<circle id="rx-ledglow" cx="120" cy="96" r="12" fill="url(#rx-led)" opacity="0"/><circle id="rx-ld" cx="120" cy="96" r="4" fill="#5A1B18"/>' +
      '<text x="120" y="84" text-anchor="middle" font-size="9" fill="#E8F5EC">đèn báo</text>' +
      // cầu đấu dây + điện 220 V + quạt
      '<rect x="236" y="186" width="30" height="22" rx="3" fill="#2F7DD3"/><circle cx="244" cy="197" r="4" fill="#C9CED6"/><circle cx="258" cy="197" r="4" fill="#C9CED6"/>' +
      '<path d="M262 80H290V30" fill="none" stroke="#C62828" stroke-width="3"/><text x="294" y="26" font-size="10.5" fill="#C62828" font-weight="700">220 V ~</text>' +
      '<path d="M266 196H318V188" fill="none" stroke="#C62828" stroke-width="3"/>' +
      '<g filter="url(#rx-sh)"><circle cx="318" cy="150" r="36" fill="#F4F6F9" stroke="#AEB5BF" stroke-width="2"/>' +
      '<circle cx="318" cy="150" r="30" fill="none" stroke="#D5DBE2" stroke-width="1"/>' +
      '<g id="rx-fan" transform="translate(318 150)">' + blades + '<circle r="6" fill="#4A515C"/></g></g>' +
      '<text x="318" y="224" text-anchor="middle" font-size="10" fill="#4A515E">Quạt 220 V</text>';
    c.appendChild(svg);
    var dcDots = dots(svg, 16, 2.4, "#FFC94A"), acDots = dots(svg, 14, 2.4, "#FF5A4E");
    var dcPath = [[40, 40], [178, 40], [178, 80], [211, 80], [211, 100], [211, 160], [211, 170], [164, 170], [164, 172], [156, 172], [156, 214], [40, 214]];
    var acPath = [[290, 30], [290, 80], [262, 80], [248, 80], [205, 78], [205, 70], [234, 196], [266, 196], [318, 196], [318, 188]];
    acPath = [[290, 30], [290, 80], [262, 80], [248, 80]]; // dòng 220 V: từ nguồn vào COM (phần qua tiếp điểm ẩn đi cho gọn)
    var acPath2 = [[266, 196], [318, 196], [318, 188]];
    var acDots2 = dots(svg, 4, 2.4, "#FF5A4E");
    function skipDc(p) { return p[0] > 196 && p[0] < 226 && p[1] > 96 && p[1] < 168; }

    var st = { on: false, dio: true, a: 0, fan: 0, ang: 0, ph: 0, spark: 0, spike: 0 };
    var row = document.createElement("div"); row.className = "seg";
    var bOn = document.createElement("button"); bOn.type = "button";
    var bD = document.createElement("button"); bD.type = "button";
    row.appendChild(bOn); row.appendChild(bD); c.appendChild(row);
    var rd = document.createElement("div"); rd.className = "read"; c.appendChild(rd);
    var warn = document.createElement("div"); warn.className = "warn"; warn.hidden = true; c.appendChild(warn);
    var nt = document.createElement("p"); nt.className = "note";
    nt.textContent = "Ví dụ: chip 3,3 V, cuộn relay 12 V có điện trở 400 Ω nên dòng cuộn khoảng 30 mA. Mạch thật đọc theo thông số linh kiện và tài liệu của hãng.";
    c.appendChild(nt);
    bOn.addEventListener("click", function () {
      st.on = !st.on; st.spark = 1;
      if (!st.on && !st.dio) { st.spike = 1; warn.hidden = false; warn.innerHTML = "<b>Mất diode dập xung:</b> lúc ngắt, cuộn relay sinh xung điện áp rất cao đánh vào chân C của transistor (chớp tím). Lâu dần transistor bị hỏng."; }
      else warn.hidden = true;
      paint();
    });
    bD.addEventListener("click", function () { st.dio = !st.dio; warn.hidden = true; paint(); });
    function paint() {
      bOn.textContent = st.on ? "Chip: TẮT quạt" : "Chip: BẬT quạt"; bOn.setAttribute("aria-pressed", st.on ? "true" : "false");
      bD.textContent = st.dio ? "Diode dập xung: có" : "Diode dập xung: MẤT"; bD.setAttribute("aria-pressed", st.dio ? "false" : "true");
      $("#rx-dio", svg).setAttribute("opacity", st.dio ? "1" : "0");
      $("#rx-dio-x", svg).setAttribute("opacity", st.dio ? "0" : "1");
      $("#rx-pinv", svg).textContent = "chân ra: " + (st.on ? "3,3 V" : "0 V");
      $("#rx-ld", svg).setAttribute("fill", st.on ? "#FF3B30" : "#5A1B18");
      $("#rx-ledglow", svg).setAttribute("opacity", st.on ? "1" : "0");
      rd.innerHTML = "<div><small>Chân chip</small><b>" + (st.on ? "3,3 V" : "0 V") + "</b></div><div><small>Dòng qua cuộn</small><b>" + (st.on ? "≈ 30 mA" : "0") +
        "</b></div><div><small>Tiếp điểm COM–NO</small><b>" + (st.a > 0.5 ? "Đóng" : "Hở") + "</b></div><div><small>Quạt</small><b>" + (st.fan > 0.05 ? "Đang quay" : "Đứng yên") + "</b></div>";
    }
    paint();
    var lastClosed = false;
    scenes.push({ root: c, frame: function (dt) {
      st.a += ((st.on ? 1 : 0) - st.a) * Math.min(1, dt * 14);
      var closed = st.a > 0.5;
      if (closed !== lastClosed) { lastClosed = closed; st.spark = 1; paint(); }
      // lá động quay xuống 6° quanh bản lề (242,82): đầu trái chạm NO
      $("#rx-arm", svg).setAttribute("transform", "rotate(" + (-6 * st.a).toFixed(2) + " 242 82)");
      st.spark = Math.max(0, st.spark - dt * 5); $("#rx-spk", svg).setAttribute("opacity", st.spark.toFixed(2));
      st.spike = Math.max(0, st.spike - dt * 1.2); $("#rx-spike", svg).setAttribute("opacity", (st.spike * 0.8 * (0.6 + 0.4 * Math.sin(st.spike * 40))).toFixed(2));
      st.fan += ((closed ? 1 : 0) - st.fan) * Math.min(1, dt * (closed ? 1.2 : 0.6));
      st.ang = (st.ang + st.fan * dt * 900) % 360;
      $("#rx-fan", svg).setAttribute("transform", "translate(318 150) rotate(" + st.ang.toFixed(1) + ")");
      st.ph += dt * 60;
      dcDots.g.setAttribute("opacity", st.on ? "1" : "0"); placeDots(dcDots, dcPath, st.ph, 22, skipDc);
      acDots.g.setAttribute("opacity", closed ? "1" : "0"); placeDots(acDots, acPath, st.ph * 1.2, 14);
      acDots2.g.setAttribute("opacity", closed ? "1" : "0"); placeDots(acDots2, acPath2, st.ph * 1.2, 14);
      if (Math.random() < 0.02) paint();
    } });
  })();

  // ---- vòng lặp chung: chỉ chạy cảnh đang hiện ----
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    scenes.forEach(function (s) { if (s.root.offsetParent !== null) s.frame(REDUCED ? 0 : dt); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
