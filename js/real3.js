/* 23/10/2026: "Hình thực tế" cho các mô phỏng Bài 7–9 (nguồn xung, bo inverter, bo nguồn).
   Nền là ẢNH CHỤP THẬT linh kiện trên bo (img/parts). Lớp phủ bên trên (khung đánh dấu, dòng điện chạy, chỗ nóng,
   tia lửa) và đồng hồ đo bên phải đọc trực tiếp kết quả của mô phỏng labkit bên dưới (HDT.labs[id].data) tại
   con trỏ đồ thị (u), nên kéo thanh trượt nào thì ảnh đổi theo, và chạy cùng nhịp với con trỏ.
   Mỗi mô phỏng chỉ khai báo: ảnh, khung, đường dòng điện, điểm sáng/nóng, đồng hồ. Số liệu là mô hình minh hoạ. */
(function () {
  "use strict";
  var H = window.HDT;
  if (!H || !H.labs) return;
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* bỏ qua */ }
  var NS = "http://www.w3.org/2000/svg", MONO = "ui-monospace,Menlo,Consolas,monospace";
  var VW = 360, VH = 240, PW = 228; // khung SVG và bề rộng tối đa của ảnh
  var nf = H.nf, clamp = H.clamp;
  var C = { red: "#FF4B3E", amp: "#FFB020", ok: "#3DDC84", volt: "#5AA7FF", vio: "#C77DFF", hot: "#FF6A00" };

  function fv(v, d, u) { return (isFinite(v) ? nf(v, d) : "—") + (u ? " " + u : ""); }
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
  function mk(tag, at, parent) { var e = document.createElementNS(NS, tag); Object.keys(at || {}).forEach(function (k) { e.setAttribute(k, at[k]); }); if (parent) parent.appendChild(e); return e; }

  // ---- đọc dữ liệu mô phỏng tại con trỏ ----
  function series(L, name) {
    var ps = (L.data && L.data.panels) || [];
    for (var i = 0; i < ps.length; i++) for (var j = 0; j < ps[i].series.length; j++) if (ps[i].series[j].n === name) return ps[i].series[j].y;
    return null;
  }
  function idxOf(L) { var n = L.data && L.data.xs ? L.data.xs.length : 1; return clamp(Math.round(L.u * (n - 1)), 0, n - 1); }
  function get(L, name) { var y = series(L, name); return y ? y[idxOf(L)] : NaN; }
  function peak(L, name) { var y = series(L, name), m = 0; if (!y) return 1; for (var i = 0; i < y.length; i++) m = Math.max(m, Math.abs(y[i])); return m || 1; }
  function read(L, label) { var r = (L.data && L.data.reads) || []; for (var i = 0; i < r.length; i++) if (r[i][0] === label) return r[i][1]; return "—"; }

  /* ================= cấu hình 17 cảnh =================
     box/labels/flows/glows dùng toạ độ phần trăm trên ảnh (0–100).
     flow: { pts, v (tên đường), col, signed } — chấm chạy nhanh/chậm theo |giá trị| so với đỉnh, đổi chiều theo dấu nếu signed.
     glow: { x, y, r, col, k(L) → 0..1, flick } — điểm sáng/nóng.
     meters: [ { t, val(L) → chuỗi } ] — phần tử đầu là số lớn trên đồng hồ. */
  function kv(name) { return function (L) { return Math.abs(get(L, name)) / peak(L, name); }; }
  function kr(name, lo, hi) { return function (L) { return clamp((get(L, name) - lo) / (hi - lo), 0, 1); }; }
  var SCENES = [
    { lab: "bienap", img: "t-bien-ap", ar: 1, title: "Biến áp xung trên bo nguồn",
      lead: "Ảnh chụp bo thật: biến áp vàng XZM-E20246. Chấm đỏ là dòng cuộn sơ cấp, chấm xanh là dòng cuộn thứ cấp, chạy theo đúng con trỏ của đồ thị bên dưới. Chọn nguồn một chiều 310 V để thấy thứ cấp không còn dòng.",
      box: [20, 28, 80, 73], tag: "Biến áp XZM-E20246",
      flows: [{ pts: [[14, 13], [50, 13], [86, 13]], v: "Ip", col: C.red, signed: true }, { pts: [[86, 77], [50, 77], [14, 77]], v: "Is", col: C.ok, signed: true }],
      labels: [[86, 7, "sơ cấp"], [50, 87, "thứ cấp"]], mode: "V~",
      meters: [{ t: "Vs hiệu dụng", val: function (L) { var r = read(L, "Vs hiệu dụng"); return r !== "—" ? r : read(L, "Vs"); } },
        { t: "Dòng sơ cấp", val: function (L) { var r = read(L, "Ip hiệu dụng"); return r !== "—" ? r : read(L, "Ip (giả định)") + " (một chiều)"; } }, { t: "Vs tức thời", val: function (L) { return fv(get(L, "Vs"), 1, "V"); } }] },
    { lab: "flyback", img: "t-ic2", ar: 1, title: "IC2 nguồn xung (MOSFET bên trong)",
      lead: "IC2 tám chân nằm ngay dưới biến áp. Mỗi lần IC2 đóng, dòng sơ cấp tăng dần (chấm đỏ) và IC nóng lên. Lúc ngắt, chân Drain vọt lên vài trăm vôn, đồng hồ đo Vds hiện số tại con trỏ.",
      box: [32, 33, 70, 63], tag: "IC2", box2: [12, 0, 88, 18], tag2: "biến áp",
      flows: [{ pts: [[50, 17], [50, 30], [51, 40]], v: "Ip", col: C.red }],
      glows: [{ x: 51, y: 48, r: 16, col: C.hot, k: kv("Ip") }, { x: 36, y: 37, r: 4, col: C.volt, k: kv("Gate") }],
      mode: "V⎓",
      meters: [{ t: "Vds tức thời", val: function (L) { return fv(get(L, "Vds"), 0, "V"); } }, { t: "Vds lớn nhất", val: function (L) { return read(L, "Vds lớn nhất"); } }, { t: "Điện áp ra", val: function (L) { return read(L, "Điện áp ra Vo"); } }] },
    { lab: "tl431", img: "u-tl431", ar: 1, title: "TL431 và opto ở mặt hàn",
      lead: "Mặt hàn bo nguồn: TL431 (khung đỏ) so điện áp mẫu với 2,495 V, kéo dòng qua LED trong opto IC3 (góc dưới trái). LED sáng mạnh hay yếu theo đúng dòng Iled trên đồ thị.",
      box: [31, 18, 47, 47], tag: "TL431", box2: [0, 83, 22, 100], tag2: "IC3 opto",
      flows: [{ pts: [[39, 47], [32, 68], [12, 86]], v: "Iled", col: C.amp }],
      glows: [{ x: 9, y: 90, r: 10, col: C.red, k: kv("Iled") }],
      labels: [[62, 52, "R18"], [88, 52, "R17"]], mode: "V⎓",
      meters: [{ t: "Vref (chân Ref)", val: function (L) { return fv(get(L, "Vref"), 3, "V"); } }, { t: "Dòng LED opto", val: function (L) { return fv(get(L, "Iled"), 2, "mA"); } }, { t: "Điện áp ra đặt", val: function (L) { return read(L, "Điện áp ra đặt"); } }] },
    { lab: "vonghoi", img: "u-ic3", ar: 1, title: "Opto IC3: vòng hồi tiếp",
      lead: "Opto IC3 nằm giữa phía thứ cấp và sơ cấp. Điện áp ra cao thì LED trong opto sáng mạnh, IC2 thu hẹp xung. Opto già hay đứt thì LED yếu hoặc tắt, điện áp ra vọt lên.",
      box: [24, 33, 74, 58], tag: "IC3 (opto)",
      glows: [{ x: 38, y: 46, r: 12, col: C.red, k: kr("Vo", 11, 13.5) }],
      flows: [{ pts: [[60, 46], [80, 46], [98, 40]], v: "D", col: C.volt }],
      labels: [[12, 30, "thứ cấp"], [88, 30, "sơ cấp"]], mode: "V⎓",
      meters: [{ t: "Điện áp ra Vo", val: function (L) { return fv(get(L, "Vo"), 2, "V"); } }, { t: "Duty IC2", val: function (L) { return fv(get(L, "D"), 1, "%"); } }, { t: "Dòng tải", val: function (L) { return fv(get(L, "Iload"), 2, "A"); } }] },
    { lab: "sec", img: "t-diode-kep", ar: 1, title: "Diode kép và tụ 1000 µF phía thứ cấp",
      lead: "Diode kép Schottky bắt trên tản nhiệt, tụ 1000 µF 25 V ở phía trên. Mỗi nhịp, xung dòng từ biến áp (dưới cùng) qua diode nạp vào tụ. Diode nóng theo dòng đỉnh.",
      box: [36, 36, 72, 60], tag: "Diode kép", box2: [34, 0, 62, 21], tag2: "Tụ 1000 µF",
      flows: [{ pts: [[52, 84], [52, 62]], v: "Is", col: C.ok }, { pts: [[64, 34], [58, 21]], v: "Ic", col: C.amp, signed: true }],
      glows: [{ x: 54, y: 47, r: 18, col: C.hot, k: kv("Is") }], mode: "V⎓ AC",
      meters: [{ t: "Gợn sóng ra", val: function (L) { return fv(get(L, "Vo"), 0, "mV"); } }, { t: "Dòng đỉnh diode", val: function (L) { return read(L, "Dòng đỉnh qua diode"); } }, { t: "Gợn đỉnh-đỉnh", val: function (L) { return read(L, "Gợn sóng đỉnh-đỉnh"); } }] },
    { lab: "buck", img: "t-l4", ar: 1, title: "Cuộn L4 của mạch hạ áp",
      lead: "Cuộn L4 mã \"100\" (10 µH) cạnh MCU2. Dòng qua cuộn (chấm cam) tăng khi khoá đóng, giảm khi khoá ngắt. Ở chế độ gián đoạn, có lúc dòng về 0 và chấm dừng lại.",
      box: [40, 40, 68, 61], tag: "L4 (100 = 10 µH)",
      flows: [{ pts: [[28, 50], [54, 50], [88, 50]], v: "IL", col: C.amp }],
      labels: [[22, 84, "MCU2"]], mode: "A",
      meters: [{ t: "Dòng qua L4", val: function (L) { return fv(get(L, "IL"), 3, "A"); } }, { t: "Điện áp điểm khoá", val: function (L) { return fv(get(L, "Vsw"), 1, "V"); } }, { t: "Chế độ", val: function (L) { return read(L, "Chế độ"); } }] },
    { lab: "boot", img: "t-driver", ar: 1, title: "IC driver và tụ bootstrap trên bo inverter",
      lead: "Khu driver trên bo inverter: IC driver (khung đỏ) và tụ bootstrap nhỏ bên cạnh. Chấm xanh là lệnh kích chạy sang cực Gate của IGBT phía trên (mép trái ảnh). Tụ bootstrap sáng vàng khi còn đủ áp.",
      box: [44, 44, 62, 60], tag: "IC driver", box2: [22, 50, 34, 62], tag2: "Cboot",
      flows: [{ pts: [[48, 44], [40, 33], [10, 30]], v: "Thực tế", col: C.volt }],
      glows: [{ x: 28, y: 56, r: 8, col: C.amp, k: kr("VB", 8, 15) }],
      labels: [[9, 21, "IGBT"]], mode: "V⎓",
      meters: [{ t: "Điện áp tụ boot", val: function (L) { return fv(get(L, "VB"), 2, "V"); } }, { t: "Kích thực tế", val: function (L) { return get(L, "Thực tế") > 0.5 ? "BẬT" : "TẮT"; } }, { t: "Áp thấp nhất", val: function (L) { return read(L, "Điện áp thấp nhất"); } }] },
    { lab: "spwm", img: "t-uvw", ar: 1.333, title: "IGBT và giắc U V W ra máy nén",
      lead: "Giắc đỏ ba chân U, V, W nối ra ba cuộn dây máy nén, hai khối IGBT bên phải. Ba dòng chấm là dòng pha U, V, W: đổi chiều liên tục theo sóng sin, tần số càng cao càng đổi nhanh.",
      box: [14, 14, 52, 82], tag: "Giắc U V W", box2: [56, 16, 82, 34], tag2: "IGBT",
      flows: [{ pts: [[80, 30], [50, 30], [26, 30]], v: "Iu", col: C.volt, signed: true }, { pts: [[80, 47], [50, 47], [26, 47]], v: "Iv", col: C.amp, signed: true }, { pts: [[80, 64], [50, 64], [26, 64]], v: "Iw", col: C.ok, signed: true }],
      glows: [{ x: 66, y: 25, r: 14, col: C.hot, k: kv("Iu") }, { x: 68, y: 66, r: 14, col: C.hot, k: kv("Iv") }],
      labels: [[8, 30, "U"], [8, 47, "V"], [8, 64, "W"]], mode: "A",
      meters: [{ t: "Dòng pha U", val: function (L) { return fv(get(L, "Iu"), 2, "A"); } }, { t: "Điện áp dây hiệu dụng", val: function (L) { return read(L, "Điện áp dây hiệu dụng"); } }, { t: "Tần số", val: function (L) { return read(L, "Tần số"); } }] },
    { lab: "deadtime", img: "t-igbt", ar: 1, title: "IGBT trên bo inverter",
      lead: "Khối IGBT thật trên bo. Nếu thời gian chết quá ngắn, hai IGBT cùng nhánh dẫn chồng lên nhau: dòng xuyên từ bus xuống mass làm IGBT chớp đỏ và nóng. Đủ thời gian chết thì không có chớp.",
      box: [40, 30, 82, 62], tag: "IGBT",
      glows: [{ x: 60, y: 46, r: 30, col: C.red, k: kv("Ixuyên"), flick: true }],
      flows: [{ pts: [[60, 8], [60, 46], [60, 92]], v: "Ixuyên", col: C.red }], mode: "A",
      meters: [{ t: "Dòng xuyên", val: function (L) { return fv(get(L, "Ixuyên"), 1, "A"); } }, { t: "Thời gian cùng dẫn", val: function (L) { return read(L, "Thời gian cùng dẫn"); } }, { t: "Thời gian chết cần", val: function (L) { return read(L, "Thời gian chết cần tối thiểu"); } }] },
    { lab: "shunt", img: "t-r100", ar: 1, title: "Trở shunt R100 đo dòng máy nén",
      lead: "Trở R100 (0,1 Ω) trên bo inverter. Dòng máy nén chạy qua nó (chấm cam, đổi chiều theo sóng), điện áp hai đầu chỉ vài trăm mV. Khi máy nén kẹt cơ, dòng vượt ngưỡng và trở nóng lên.",
      box: [37, 40, 63, 56], tag: "R100 = 0,1 Ω",
      flows: [{ pts: [[12, 48], [50, 48], [88, 48]], v: "I", col: C.amp, signed: true }],
      glows: [{ x: 50, y: 48, r: 18, col: C.hot, k: kv("I") }], mode: "mV",
      meters: [{ t: "Áp hai đầu shunt", val: function (L) { return fv(get(L, "Vsh"), 0, "mV"); } }, { t: "MCU đọc", val: function (L) { return fv(get(L, "ADC"), 2, "V"); } }, { t: "Cắt bảo vệ", val: function (L) { return read(L, "Thời điểm cắt bảo vệ"); } }] },
    { lab: "chiaap", img: "u-r78", ar: 1, title: "Trở R78 (680 kΩ) ở mặt hàn",
      lead: "Mặt hàn bo inverter: trở dán R78 in mã \"683\" (68 và 3 số 0 = 680 kΩ), một trong bốn trở nối tiếp hạ bus 310 V xuống vài vôn cho MCU. Dòng qua chuỗi trở rất nhỏ, cỡ một phần mười mA.",
      box: [33, 14, 47, 37], tag: "R78: 683", box2: [63, 66, 82, 83], tag2: "R82",
      flows: [{ pts: [[8, 20], [40, 25], [58, 45], [73, 74]], v: "P", col: C.amp }], mode: "V⎓",
      meters: [{ t: "MCU đọc", val: function (L) { return fv(get(L, "ADC"), 2, "V"); } }, { t: "Mỗi trở chịu", val: function (L) { return fv(get(L, "mỗi trở"), 0, "V"); } }, { t: "Hệ số chia", val: function (L) { return read(L, "Hệ số chia"); } }] },
    { lab: "snub", img: "t-snubber", ar: 1, title: "Tụ snubber 104K 630 V cạnh IGBT",
      lead: "Tụ vàng 104K 630 V nằm sát khối IGBT. Lúc IGBT tắt, gai điện áp (chớp tím) đánh lên chân IGBT. Có tụ snubber thì gai nhỏ lại và tụ hấp thụ năng lượng.",
      box: [45, 39, 87, 66], tag: "Tụ 104K 630V", box2: [52, 14, 76, 36], tag2: "IGBT",
      glows: [{ x: 64, y: 26, r: 20, col: C.vio, k: kr("Vce", 330, 650), flick: true }],
      flows: [{ pts: [[64, 36], [66, 52]], v: "Ic", col: C.amp }], mode: "V⎓",
      meters: [{ t: "Vce tức thời", val: function (L) { return fv(get(L, "Vce"), 0, "V"); } }, { t: "Đỉnh Vce", val: function (L) { return read(L, "Đỉnh Vce"); } }, { t: "Gai cộng thêm", val: function (L) { return read(L, "Gai cộng thêm"); } }] },
    { lab: "ntc", img: "t-ntc", ar: 1, title: "NTC hạn dòng lúc cắm điện",
      lead: "Đĩa đen lớn là NTC nối tiếp đường điện vào. Lúc cắm điện, dòng sạc tụ lọc rất lớn (chấm đỏ dày), NTC nguội có điện trở lớn nên hạn chế dòng này rồi nóng dần lên (vầng cam).",
      box: [14, 34, 76, 70], tag: "NTC",
      flows: [{ pts: [[2, 52], [45, 52], [98, 50]], v: "I", col: C.red }],
      glows: [{ x: 45, y: 52, r: 20, col: C.hot, k: function (L) { var r = get(L, "R"), r0 = peak(L, "R"); return clamp(1 - r / r0, 0, 1); } }], mode: "A",
      meters: [{ t: "Dòng nạp", val: function (L) { return fv(get(L, "I"), 1, "A"); } }, { t: "Điện trở NTC", val: function (L) { return fv(get(L, "R"), 2, "Ω"); } }, { t: "Dòng đỉnh", val: function (L) { return read(L, "Dòng đỉnh"); } }] },
    { lab: "varistor", img: "t-zr1", ar: 1.213, title: "Varistor ZR1 ở đầu nguồn vào",
      lead: "Đĩa xanh ZR1 là varistor, nối song song với nguồn vào. Khi có xung điện áp cao, nó dẫn mạnh và ghim điện áp lại (chớp tím). Bình thường nó gần như hở mạch, không có dòng.",
      box: [24, 28, 58, 88], tag: "ZR1 varistor",
      glows: [{ x: 41, y: 58, r: 26, col: C.vio, k: kv("I"), flick: true }],
      flows: [{ pts: [[41, 2], [41, 58], [41, 98]], v: "I", col: C.vio }], mode: "A",
      meters: [{ t: "Dòng qua varistor", val: function (L) { var v = get(L, "I"); return fv(v, Math.abs(v) < 10 ? 2 : 0, "A"); } },
        { t: "Còn lại sau varistor", val: function (L) { var v = get(L, "sau varistor"); return isFinite(v) ? fv(v, 0, "V") : read(L, "Còn lại sau varistor"); } },
        { t: "Xung đến", val: function (L) { return read(L, "Xung đến"); } }] },
    { lab: "emi", img: "t-lcl", ar: 0.867, title: "Cuộn lọc nhiễu LCL-H2810 và tụ X",
      lead: "Cuộn lọc xanh LCL-H2810 và tụ X vàng ở đầu vào bo. Chấm đỏ bên phải là nhiễu từ bo đi ra; sau bộ lọc (bên trái) còn bao nhiêu tuỳ tần số tại con trỏ. Nhiễu cao tần bị chặn gần hết.",
      box: [30, 3, 72, 97], tag: "LCL-H2810", box2: [0, 4, 22, 40], tag2: "Tụ X",
      flows: [{ pts: [[100, 55], [72, 55]], k: function () { return 0.8; }, col: C.red }, { pts: [[30, 55], [0, 55]], k: function (L) { return clamp(Math.pow(10, get(L, "đáp ứng") / 20), 0, 1); }, col: C.red }],
      labels: [[86, 66, "nhiễu vào"], [14, 66, "ra lưới"]], mode: "dB",
      meters: [{ t: "Suy giảm", val: function (L) { return fv(get(L, "đáp ứng"), 1, "dB"); } }, { t: "Tần số tại con trỏ", val: function (L) { var f = L.data.xs[idxOf(L)]; return f >= 1e6 ? fv(f / 1e6, 2, "MHz") : f >= 1e3 ? fv(f / 1e3, 1, "kHz") : fv(f, 0, "Hz"); } }, { t: "Cộng hưởng", val: function (L) { return read(L, "Tần số cộng hưởng"); } }] },
    { lab: "xatux", img: "t-cx1", ar: 1, title: "Tụ X ở đầu vào bo",
      lead: "Tụ X vàng nối giữa hai dây L và N. Rút phích đúng lúc sóng ở đỉnh, tụ giữ điện tích nên hai chân phích còn điện. Trở xả rút dần điện tích đó; vầng đỏ là mức còn nguy hiểm.",
      box: [36, 24, 63, 100], tag: "Tụ X (CX1)",
      glows: [{ x: 50, y: 62, r: 30, col: C.red, k: kr("V", 30, 330) }], mode: "V⎓",
      meters: [{ t: "Áp còn trên phích", val: function (L) { return fv(get(L, "V"), 0, "V"); } }, { t: "Mức an toàn", val: function (L) { return get(L, "V") > 60 ? "NGUY HIỂM" : "an toàn"; } }, { t: "Xuống 60 V sau", val: function (L) { return read(L, "Thời gian xuống còn 60 V"); } }] },
    { lab: "relay", img: "t-relay", ar: 1, title: "Rơ-le trên bo nguồn",
      lead: "Rơ-le vỏ trắng trên bo thật. Cuộn có dòng (chấm cam) thì hút, tiếp điểm đóng. Lúc tiếp điểm đóng ngắt dòng tải lớn sẽ có tia lửa nhỏ (chớp vàng), lâu ngày làm cháy rỗ tiếp điểm.",
      box: [35, 30, 84, 100], tag: "Rơ-le",
      flows: [{ pts: [[20, 18], [40, 30], [50, 45]], v: "I", col: C.amp }],
      glows: [{ x: 58, y: 46, r: 16, col: "#FFE066", k: kv("tia lửa (tương đối)"), flick: true } ],
      mode: "mA",
      meters: [{ t: "Dòng cuộn", val: function (L) { return fv(get(L, "I") * 1000, 0, "mA"); } }, { t: "Tiếp điểm", val: function (L) { return get(L, "tiếp điểm") > 0.5 ? "ĐÓNG" : "HỞ"; } }, { t: "Trễ khi đóng", val: function (L) { return read(L, "Độ trễ khi đóng"); } }] }
  ];

  var built = [];
  SCENES.forEach(function (S) {
    var L = H.labs[S.lab], sec = document.getElementById("lab-" + S.lab);
    if (!L || !sec) return;
    var card = document.createElement("div"); card.className = "card real";
    var h2 = document.createElement("h2"); h2.textContent = "Hình thực tế: " + S.title;
    var lead = document.createElement("p"); lead.className = "lead"; lead.textContent = S.lead;
    card.appendChild(h2); card.appendChild(lead);
    var pw = Math.min(PW, VH / S.ar), ph = pw * S.ar, oy = (VH - ph) / 2;
    function X(p) { return p * pw / 100; } function Y(p) { return oy + p * ph / 100; }
    var svg = mk("svg", { viewBox: "0 0 " + VW + " " + VH, "class": "real-svg photo", role: "img", "aria-label": "Ảnh chụp thật " + S.title + ", có đánh dấu linh kiện và đồng hồ đo" });
    var cid = "r3c-" + S.lab;
    var defs = mk("defs", {}, svg);
    var cp = mk("clipPath", { id: cid }, defs); mk("rect", { x: 0, y: oy, width: pw, height: ph, rx: 10 }, cp);
    var rg = mk("radialGradient", { id: cid + "-g" }, defs);
    mk("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": ".95" }, rg); mk("stop", { offset: ".35", "stop-color": "#fff", "stop-opacity": ".5" }, rg); mk("stop", { offset: "1", "stop-color": "#fff", "stop-opacity": "0" }, rg);
    mk("rect", { x: 0, y: 0, width: VW, height: VH, fill: "#1D2127" }, svg);
    var g = mk("g", { "clip-path": "url(#" + cid + ")" }, svg);
    var im = mk("image", { x: 0, y: oy, width: pw, height: ph, preserveAspectRatio: "xMidYMid slice" }, g);
    im.setAttribute("href", "img/parts/" + S.img + ".jpg"); im.setAttributeNS("http://www.w3.org/1999/xlink", "href", "img/parts/" + S.img + ".jpg");
    // điểm sáng / nóng (vẽ bằng 2 lớp: quầng màu + lõi trắng)
    var glows = (S.glows || []).map(function (G) {
      var o = mk("g", { opacity: 0 }, g);
      mk("circle", { cx: X(G.x), cy: Y(G.y), r: G.r * pw / 100 * 1.35, fill: G.col, opacity: ".38" }, o);
      mk("circle", { cx: X(G.x), cy: Y(G.y), r: G.r * pw / 100, fill: "url(#" + cid + "-g)" }, o);
      return { G: G, el: o };
    });
    // khung đánh dấu linh kiện
    function frame(b, t, col) {
      var r = mk("rect", { x: X(b[0]), y: Y(b[1]), width: X(b[2]) - X(b[0]), height: Y(b[3]) - Y(b[1]), rx: 6, fill: "none", stroke: col, "stroke-width": 2.5, "stroke-dasharray": "7 5" }, g);
      var tw = t.length * 6.2 + 12, ty = Math.max(oy + 2, Y(b[1]) - 17);
      mk("rect", { x: X(b[0]), y: ty, width: tw, height: 15, rx: 4, fill: col }, g);
      var tx = mk("text", { x: X(b[0]) + 6, y: ty + 11, "font-size": 10.5, "font-weight": 700, fill: "#fff" }, g); tx.textContent = t;
      return r;
    }
    var frames = [frame(S.box, S.tag, "#E60012")];
    if (S.box2) frames.push(frame(S.box2, S.tag2, "#2F6FD6"));
    (S.labels || []).forEach(function (l) {
      var t = mk("text", { x: X(l[0]), y: Y(l[1]), "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#fff", stroke: "#000", "stroke-width": 2.5, "paint-order": "stroke" }, g); t.textContent = l[2];
    });
    // dòng điện
    var flows = (S.flows || []).map(function (F) {
      var pts = F.pts.map(function (q) { return [X(q[0]), Y(q[1])]; }), dg = mk("g", {}, g), arr = [];
      mk("path", { d: "M" + pts.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join("L"), stroke: F.col, "stroke-width": 1.2, "stroke-opacity": ".45", fill: "none", "stroke-dasharray": "2 3" }, dg);
      for (var i = 0; i < 14; i++) arr.push(mk("circle", { r: 3, fill: F.col, stroke: "#000", "stroke-width": ".6" }, dg));
      return { F: F, pts: pts, L: plen(pts), dots: arr, g: dg, ph: 0 };
    });
    mk("rect", { x: .5, y: oy + .5, width: pw - 1, height: ph - 1, rx: 10, fill: "none", stroke: "#000", "stroke-opacity": ".35" }, svg);
    // đồng hồ bên phải
    var mx = pw + 10, mw = VW - mx - 6;
    var mt = mk("g", {}, svg);
    mk("rect", { x: mx, y: 8, width: mw, height: 92, rx: 12, fill: "#F2C230" }, mt);
    mk("rect", { x: mx + 6, y: 14, width: mw - 12, height: 80, rx: 8, fill: "#2A2E35" }, mt);
    mk("rect", { x: mx + 10, y: 20, width: mw - 20, height: 40, rx: 4, fill: "#B9C9A4" }, mt);
    var mode = mk("text", { x: mx + 14, y: 30, "font-size": 8, fill: "#1D2A12" }, mt); mode.textContent = S.mode || "";
    var big = mk("text", { x: mx + mw - 14, y: 52, "text-anchor": "end", "font-family": MONO, "font-size": 17, "font-weight": 700, fill: "#1D2A12" }, mt);
    var mlab = mk("text", { x: mx + mw / 2, y: 78, "text-anchor": "middle", "font-size": 9.5, fill: "#C9CED6" }, mt);
    var rows = (S.meters || []).slice(1).map(function (m, i) {
      var y = 112 + i * 44;
      mk("rect", { x: mx, y: y, width: mw, height: 38, rx: 8, fill: "#2A2E35" }, svg);
      var a = mk("text", { x: mx + 8, y: y + 14, "font-size": 9, fill: "#9AA1AD" }, svg); a.textContent = m.t;
      var b = mk("text", { x: mx + 8, y: y + 31, "font-family": MONO, "font-size": 13, "font-weight": 700, fill: "#FF5A4E" }, svg);
      return { m: m, b: b };
    });
    var hint = mk("text", { x: mx + mw / 2, y: VH - 6, "text-anchor": "middle", "font-size": 8.5, fill: "#9AA1AD" }, svg); hint.textContent = "theo con trỏ đồ thị";
    card.appendChild(svg);
    sec.insertBefore(card, sec.firstChild);

    var dash = 0, acc = 1, tick = 0;
    function paintText() {
      var m0 = S.meters[0]; big.textContent = m0.val(L).replace(/\s*(V|A|mA|mV|Ω|%|dB|Hz|kHz|MHz)$/, ""); mlab.textContent = m0.t + (/(\s(V|A|mA|mV|Ω|%|dB|Hz|kHz|MHz))$/.test(m0.val(L)) ? " (" + m0.val(L).match(/\s(\S+)$/)[1] + ")" : "");
      rows.forEach(function (r) { var v = r.m.val(L); r.b.textContent = v; r.b.setAttribute("fill", /NGUY HIỂM|cắt|ĐÓNG/.test(v) && v !== "chưa cắt" ? "#FF5A4E" : "#FFD27A"); });
    }
    built.push({ card: card, frame: function (dt) {
      if (!L.data) return;
      tick += dt;
      dash = (dash + dt * 18) % 24; frames.forEach(function (f) { f.setAttribute("stroke-dashoffset", (-dash).toFixed(1)); });
      glows.forEach(function (o) {
        var k = clamp(o.G.k(L) || 0, 0, 1);
        if (o.G.flick) { // chớp (gai áp, dòng xuyên, tia lửa) rất ngắn: giữ sáng rồi mờ dần ~0,6 s để mắt kịp thấy
          o.hold = Math.max(k, (o.hold || 0) - dt * 1.6); k = o.hold;
          if (k > 0.02) k *= 0.7 + 0.3 * Math.sin(tick * 47 + o.G.x);
        }
        o.el.setAttribute("opacity", k.toFixed(2));
      });
      flows.forEach(function (o) {
        var F = o.F, v = F.k ? F.k(L) : get(L, F.v), mag = F.k ? v : Math.abs(v) / peak(L, F.v), on = mag > 0.02;
        o.g.setAttribute("opacity", on ? (0.45 + 0.55 * clamp(mag, 0, 1)).toFixed(2) : "0.15");
        var dir = F.signed && v < 0 ? -1 : 1;
        if (on) o.ph += dir * dt * (14 + 70 * clamp(mag, 0, 1));
        var sp = Math.max(10, o.L / o.dots.length);
        o.dots.forEach(function (c, i) {
          if (!on || i * sp > o.L) { c.setAttribute("visibility", "hidden"); return; }
          var p = ptAt(o.pts, i * sp + o.ph); c.setAttribute("visibility", "visible"); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1));
        });
      });
      acc += dt; if (acc > 0.12) { acc = 0; paintText(); }
    } });
  });

  // vòng lặp riêng: chỉ chạy cảnh đang hiện. "Giảm chuyển động" thì vẫn cập nhật số đo nhưng không chạy chấm.
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    built.forEach(function (b) { if (b.card.offsetParent !== null) b.frame(REDUCED ? 0.0001 : dt); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
