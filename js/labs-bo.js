/* 19/10/2026: mô phỏng linh kiện trên bo nguồn inverter (Bài 9).
   Mô hình giản lược để thấy quy luật, không phải số đo của một bo cụ thể. */
(function () {
  'use strict';
  var K = window.LabKit;
  if (!K) return;
  var S = K.S, nf = K.nf, clamp = K.clamp, TAU = 2 * Math.PI;

  /* ===== NTC chống xung dòng khi cấp nguồn ===== */
  K.build({
    id: 'ntc', tab: 'NTC chống xung dòng', dur: 8,
    title: 'NTC: hạn chế dòng sạc tụ lọc lúc cắm điện',
    lead: 'Tụ lọc bus còn trống, lúc mới cắm điện nó như một đoạn chập: dòng sạc rất lớn trong vài ms. NTC lúc nguội có điện trở lớn nên hạn chế dòng đó. Sau đó dòng chạy làm NTC nóng lên, điện trở giảm mạnh để ít hao công suất. Nhiều bo còn có rơ-le chập NTC khi đã chạy ổn định.',
    ctrls: [
      { id: 'R0', label: 'Điện trở NTC lúc nguội', min: 2, max: 30, step: 0.5, val: 10, fmt: function (v) { return nf(v, 1) + ' Ω'; } },
      { id: 'C', label: 'Tụ lọc bus', min: 100, max: 1000, step: 10, val: 470, fmt: function (v) { return nf(v, 0) + ' µF'; } },
      { id: 'ph', label: 'Thời điểm cắm điện trên sóng sin', min: 0, max: 90, step: 1, val: 90, fmt: function (v) { return nf(v, 0) + '° (90° là đỉnh sóng)'; } },
      { id: 'hot', seg: true, label: 'Tình trạng NTC', val: 'cold', opts: [{ v: 'cold', t: 'Nguội' }, { v: 'warm', t: 'Còn nóng (cắm lại ngay)' }, { v: 'none', t: 'Không có NTC' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 2000, dtot = 0.2, dt = dtot / N, Vp = 311, Rs = 0.8, C = p.C * 1e-6, Vc = 0, T = 0, Rn = p.hot === 'none' ? 0 : p.hot === 'warm' ? 0.8 : p.R0;
      var xs = K.arr(N, function (i) { return i * dt * 1000; }), i_ = new Float64Array(N), vcA = new Float64Array(N), vin = new Float64Array(N), rA = new Float64Array(N), th = p.ph * Math.PI / 180, pk = 0, E = 0, i, ipk0 = Vp / (Rs + (p.hot === 'none' ? 0 : p.R0));
      var Rcold = p.R0, Rhot = 0.8, Rn = Rcold;
      for (i = 0; i < N; i++) {
        var t = i * dt, v = Vp * Math.sin(th + TAU * 50 * t), vabs = Math.abs(v), R;
        if (p.hot === 'none') R = 0; else if (p.hot === 'warm') R = Rhot; else R = Rhot + (Rcold - Rhot) * Math.exp(-T);
        var cur = 0; if (vabs > Vc) cur = (vabs - Vc) / (Rs + R);
        Vc += cur / C * dt;
        if (p.hot === 'cold') T += cur * cur * R * dt / 10;
        i_[i] = cur; vcA[i] = Vc; vin[i] = v; rA[i] = R; if (cur > pk) pk = cur; E += cur * cur * R * dt;
      }
      var fuse = pk > 30;
      var d = {
        xs: xs, xunit: 'ms',
        panels: [
          { title: 'Điện áp lưới (xoay chiều)', unit: 'V', series: [{ n: 'Vlưới', c: col.volt, y: vin, f: function (v) { return nf(v, 0) + ' V'; } }, { n: 'Vbus', c: col.ok, y: vcA, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Dòng nạp tụ lọc', unit: 'A', min: 0, hlines: [{ y: 20, t: 'dòng chịu được của cầu chì + cầu diode (ví dụ)', c: col.bad }], series: [{ n: 'I', c: col.bad, y: i_, fill: true, f: function (v) { return nf(v, 1) + ' A'; } }] },
          { title: 'Điện trở NTC theo thời gian', unit: 'Ω', min: 0, series: [{ n: 'R', c: col.amp, y: rA, f: function (v) { return nf(v, 2) + ' Ω'; } }] }
        ]
      };
      d.reads = [['Dòng đỉnh', nf(pk, 1) + ' A'], ['Điện áp bus cuối', nf(Vc, 0) + ' V'], ['Dòng đỉnh nếu không NTC', nf(Vp / Rs, 0) + ' A'], ['Nhiệt tỏa trên NTC', nf(E, 2) + ' J']];
      d.msg = (p.hot === 'none' ? 'Không có NTC: dòng chỉ bị hạn chế bởi điện trở dây và cầu chì (~' + nf(Vp / Rs, 0) + ' A). Cầu chì đứt, cầu diode nổ là lỗi thật gặp nhiều.' : p.hot === 'warm' ? 'NTC còn nóng (điện trở đã thấp ~0,8 Ω): cắm lại ngay lập tức nên không còn tác dụng hạn dòng, dòng đỉnh lên ' + nf(pk, 0) + ' A. Vì thế không nên bật tắt nguồn liên tục.' : 'NTC nguội ' + nf(p.R0, 1) + ' Ω: dòng đỉnh giảm còn ' + nf(pk, 1) + ' A. Điện trở tụt dần khi NTC nóng lên.') +
        (pk > 20 && p.hot !== 'none' ? '\nDòng đỉnh vẫn lớn: tăng điện trở NTC hoặc giảm tụ.' : '') + (p.ph < 20 && p.hot === 'cold' ? '\nCắm đúng lúc sóng gần 0 V thì dòng đỉnh nhỏ hơn, cắm lúc đỉnh sóng thì lớn nhất.' : '');
      return d;
    },
    tryit: ['Chọn "Không có NTC": dòng đỉnh vọt lên hàng chục ampe.', 'Chọn "Còn nóng": NTC mất tác dụng, vì thế bo thường thêm rơ-le và mạch trễ.', 'Đổi thời điểm cắm điện từ 90° về 0°: dòng đỉnh giảm.', 'Đo NTC bằng đồng hồ khi nguội: giá trị gần mức ghi trên thân (ví dụ 10D-15 là 10 Ω). Khi nóng đo sẽ thấp hơn nhiều.'],
    notes: 'Mô hình nhiệt rất đơn giản (hằng số thời gian gần đúng), điện trở dây nguồn 0,8 Ω và dòng chịu được 20 A là giả định. NTC trên bo thật chưa đọc rõ giá trị, hãy đo khi nguội để biết.'
  });

  /* ===== Varistor ===== */
  K.build({
    id: 'varistor', tab: 'Varistor chống sét', dur: 9,
    title: 'Varistor (ZR1): cắt xung điện áp cao',
    lead: 'Varistor nối song song với nguồn. Ở điện áp bình thường nó gần như hở mạch. Khi điện áp vượt ngưỡng, điện trở của nó tụt mạnh, dẫn dòng lớn và giữ điện áp không tăng thêm. Sét lan truyền hay đóng cắt tải lớn tạo ra xung này.',
    ctrls: [
      { id: 'mode', seg: true, label: 'Kiểu xem', val: 'surge', opts: [{ v: 'surge', t: 'Xung sét' }, { v: 'iv', t: 'Đặc tuyến V-I' }, { v: 'over', t: 'Quá áp kéo dài' }] },
      { id: 'Vn', label: 'Ngưỡng varistor (điện áp hiệu dụng cho phép)', min: 150, max: 320, step: 5, val: 275, fmt: function (v) { return nf(v, 0) + ' V'; } },
      { id: 'Vs', label: 'Đỉnh xung sét', min: 500, max: 4000, step: 100, val: 2000, fmt: function (v) { return nf(v, 0) + ' V'; } },
      { id: 'Vl', label: 'Điện áp lưới (cho kiểu Quá áp)', min: 180, max: 420, step: 5, val: 300, fmt: function (v) { return nf(v, 0) + ' V'; } }
    ],
    compute: function (p) {
      var col = K.col, N = 900, alpha = 30, Vn1 = p.Vn * Math.SQRT2 * 1.0, k = 1e-3;
      function Iv(v) { var a = Math.abs(v); var i = k * Math.pow(a / (Vn1 * 1.15), alpha); return v < 0 ? -i : i; }
      var d;
      if (p.mode === 'iv') {
        var xs = K.arr(N, function (i) { return 50 + 700 * i / (N - 1); });
        var iA = K.arr(N, function (i) { return Math.min(Iv(xs[i]), 5000); });
        var hl = [{ y: 311, t: 'đỉnh lưới 311 V', c: col.ok }];
        d = { xs: xs, xunit: 'V đặt lên varistor', panels: [{ title: 'Dòng qua varistor (thang log)', unit: 'A', ylog: false, min: 0, max: 100, series: [{ n: 'I', c: col.bad, y: iA.map(function (v) { return Math.min(v, 100); }), f: function (v) { return nf(v, 3) + ' A'; } }] }] };
        d.panels[0].shade = [{ x0: 311, x1: 750, c: col.bad }];
        d.reads = [['Dòng tại 311 V (đỉnh lưới)', nf(Iv(311) * 1000, 3) + ' mA'], ['Dòng tại ' + nf(p.Vn * Math.SQRT2, 0) + ' V', nf(Iv(p.Vn * Math.SQRT2), 3) + ' A'], ['Dòng tại 600 V', nf(Iv(600), 1) + ' A'], ['Hệ số phi tuyến', '~' + alpha]];
        d.msg = 'Dưới ngưỡng, dòng rò chỉ cỡ mili-ampe. Chỉ cần điện áp tăng thêm một chút trên ngưỡng, dòng tăng vọt theo hàm mũ: I = k × (V ÷ Vn)^' + alpha + '. Đây là lý do varistor cắt xung hiệu quả.\nVùng đỏ là vùng điện áp cao hơn đỉnh lưới bình thường.';
        return d;
      }
      if (p.mode === 'over') {
        var cyc = 3, T = 0.02, M = 900, xs2 = K.arr(M, function (i) { return i * cyc * T / (M - 1) * 1000; });
        var v2 = K.arr(M, function (i) { return p.Vl * Math.SQRT2 * Math.sin(TAU * 50 * xs2[i] / 1000); });
        var i2 = K.arr(M, function (i) { return Iv(v2[i]); });
        var rms = 0, pw = 0, j; for (j = 0; j < M; j++) { rms += i2[j] * i2[j]; pw += Math.abs(v2[j] * i2[j]); } rms = Math.sqrt(rms / M); pw /= M;
        d = { xs: xs2, xunit: 'ms', panels: [{ title: 'Điện áp lưới', unit: 'V', hlines: [{ y: Vn1, t: 'ngưỡng của varistor', c: col.bad }, { y: -Vn1, t: '', c: col.bad }], series: [{ n: 'V', c: col.volt, y: v2, f: function (v) { return nf(v, 0) + ' V'; } }] }, { title: 'Dòng qua varistor', unit: 'A', series: [{ n: 'I', c: col.bad, y: i2, f: function (v) { return nf(v, 3) + ' A'; } }] }] };
        d.reads = [['Dòng hiệu dụng', nf(rms, 3) + ' A'], ['Công suất nóng', nf(pw, 1) + ' W'], ['Điện áp lưới', nf(p.Vl, 0) + ' V'], ['Ngưỡng', nf(p.Vn, 0) + ' V']];
        d.msg = pw > 2 ? 'QUÁ ÁP KÉO DÀI: dòng chạy liên tục trong varistor, tỏa ' + nf(pw, 0) + ' W. Varistor chỉ chịu xung ngắn, không chịu nóng kéo dài. Nó nóng, nứt, có thể cháy rồi chập, làm đứt cầu chì. Gặp ở khu vực lưới yếu, đứt dây trung tính hoặc cắm nhầm 380 V.' : 'Điện áp lưới chưa vượt ngưỡng nên dòng gần bằng 0, varistor chưa làm việc.\nHãy kéo "Điện áp lưới" lên khoảng 340 V để thấy dòng xuất hiện.';
        return d;
      }
      var Ns = 600, tmax = 60, xs3 = K.arr(Ns, function (i) { return -10 + tmax * i / (Ns - 1); });
      function surge(t) { return t < 0 ? 0 : p.Vs * (Math.exp(-t / 25) - Math.exp(-t / 2)) / 0.739; }
      var Ls = 12e-6 * 0 + 0.6;
      var vs = K.arr(Ns, function (i) { return surge(xs3[i]); });
      var Rsrc = 2;
      var vo = K.arr(Ns, function (i) { var e = vs[i]; if (e < 1) return Math.sin(TAU * 50 * xs3[i] / 1000) * 311; var lo = 0, hi = e, m, k2; for (k2 = 0; k2 < 50; k2++) { m = (lo + hi) / 2; if ((e - m) / Rsrc - Iv(m) > 0) lo = m; else hi = m; } return (lo + hi) / 2; });
      var ic = K.arr(Ns, function (i) { return vs[i] < 1 ? 0 : Iv(vo[i]); });
      var vmax = Math.max.apply(null, vo), imax = Math.max.apply(null, ic);
      d = { xs: xs3, xunit: 'µs', panels: [{ title: 'Điện áp xung đến và điện áp sau varistor', unit: 'V', min: 0, hlines: [{ y: 600, t: 'mức tụ và cầu diode chịu được ~600 V (ví dụ)', c: col.bad }], series: [{ n: 'xung đến', c: col.muted, y: vs, f: function (v) { return nf(v, 0) + ' V'; } }, { n: 'sau varistor', c: col.volt, y: vo, w: 2, f: function (v) { return nf(v, 0) + ' V'; } }] }, { title: 'Dòng đi qua varistor', unit: 'A', min: 0, series: [{ n: 'I', c: col.bad, y: ic, fill: true, f: function (v) { return nf(v, 0) + ' A'; } }] }] };
      d.reads = [['Xung đến', nf(p.Vs, 0) + ' V'], ['Còn lại sau varistor', nf(vmax, 0) + ' V'], ['Dòng xung đỉnh', nf(imax, 0) + ' A'], ['Năng lượng', nf(0, 0) === '0' ? nf(ic.reduce(function (a, b, i) { return a + b * vo[i] * (tmax / Ns) * 1e-6; }, 0), 1) + ' J' : '']];
      d.msg = 'Xung ' + nf(p.Vs, 0) + ' V bị kẹp xuống khoảng ' + nf(vmax, 0) + ' V. Phần còn lại là năng lượng đốt trong varistor, dòng đỉnh ' + nf(imax, 0) + ' A.\nMỗi lần chịu xung, varistor già đi một chút (ngưỡng thấp dần, dòng rò tăng). Xung lớn hoặc nhiều lần thì nó nứt, cháy xém và chập (đã thấy ở các bo bị sét).';
      return d;
    },
    tryit: ['Kiểu "Xung sét": tăng đỉnh xung lên 4000 V, xem varistor kẹp điện áp xuống nhưng dòng tăng.', 'Đặt ngưỡng 150 V (varistor sai loại): điện áp lưới 220 V đã làm nó dẫn, nóng ngay.', 'Kiểu "Quá áp kéo dài": kéo điện áp lưới lên 340 V rồi 420 V, xem công suất nóng tăng vọt.', 'Khi đo: varistor tốt đo trở vô cùng, nếu đo thấy vài chục ôm là đã chập.'],
    notes: 'Đặc tuyến theo công thức I = k(V÷Vn)^α với α = 30, k chọn gần đúng, bỏ qua điện cảm dây. Varistor ZR1 trên bo chưa đọc được mã số, hãy tự kiểm tra thông số trên thân linh kiện. Điện áp "ngưỡng" lấy bằng đỉnh x 1,15.'
  });

  /* ===== Lọc nhiễu EMI ===== */
  K.build({
    id: 'emi', tab: 'Lọc nhiễu EMI', dur: 8,
    title: 'Cuộn chống nhiễu + tụ X: lọc nhiễu cao tần',
    lead: 'Mạch bên trong phát nhiễu cao tần lên dây điện. Cuộn dây (điện cảm) cản dòng tần số cao, tụ X nối giữa hai dây dẫn nhiễu cao tần đi vòng. Phối hợp thành bộ lọc LC: tần số thấp (50 Hz) đi qua gần như nguyên vẹn, tần số cao bị suy giảm.',
    svg: S.open(360, 80, 'Bộ lọc LC: nhiễu vào từ mạch, qua cuộn nối tiếp, tụ X song song, ra dây nguồn') + S.T(6, 24, 'nhiễu', 'sk-m') + S.L(40, 30, 90, 30) + S.P('M90 30a8 8 0 0 1 16 0a8 8 0 0 1 16 0a8 8 0 0 1 16 0a8 8 0 0 1 16 0', 'sk-v') + S.L(154, 30, 230, 30) + S.T(110, 18, 'cuộn L', 'sk-t') + S.L(190, 30, 190, 44) + S.C(190, 52, true, 'sk-a') + S.L(190, 62, 190, 70) + S.L(40, 70, 230, 70) + S.T(200, 54, 'tụ X', 'sk-t') + S.T(240, 34, 'ra lưới', 'sk-m') + S.close,
    ctrls: [
      { id: 'L', label: 'Điện cảm cuộn chống nhiễu', min: 0.1, max: 20, val: 2, log: true, fmt: function (v) { return nf(v, 2) + ' mH'; } },
      { id: 'C', label: 'Tụ X', min: 10, max: 1000, val: 330, log: true, fmt: function (v) { return v >= 1000 ? '1 µF' : nf(v, 0) + ' nF'; } },
      { id: 'Rs', label: 'Nội trở nguồn và tải (suy hao)', min: 1, max: 100, val: 20, log: true, fmt: function (v) { return nf(v, 0) + ' Ω'; } },
      { id: 'noise', seg: true, label: 'Nhiễu cần lọc', val: '150', opts: [{ v: '150', t: '150 kHz' }, { v: '1000', t: '1 MHz' }, { v: '10000', t: '10 MHz' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 500, L = p.L * 1e-3, C = p.C * 1e-9, Rs = p.Rs;
      var xs = K.arr(N, function (i) { return Math.log10(10) + (Math.log10(3e7) - 1) * i / (N - 1); }), f0 = 1 / (TAU * Math.sqrt(L * C));
      function H(f) { var w = TAU * f, a = 1 - w * w * L * C, b = w * L / Rs; return 1 / Math.sqrt(a * a + b * b); }
      var db = K.arr(N, function (i) { var f = Math.pow(10, xs[i]); return clamp(20 * Math.log10(H(f)), -120, 30); });
      var fn = +p.noise * 1e3, att = 20 * Math.log10(H(fn)), a50 = 20 * Math.log10(H(50));
      var M = 600, tt = K.arr(M, function (i) { return i / (M - 1) * 20; }), per = 1 / fn * 1e6;
      var vin = K.arr(M, function (i) { return Math.sin(TAU * tt[i] / per); }), g = Math.pow(10, att / 20), vout = K.arr(M, function (i) { return g * vin[i]; });
      var d = {
        xs: xs, xunit: 'tần số (thang log)', xticks: [{ v: 2, t: '100 Hz' }, { v: 3, t: '1 kHz' }, { v: 4, t: '10 kHz' }, { v: 5, t: '100 kHz' }, { v: 6, t: '1 MHz' }, { v: 7, t: '10 MHz' }],
        panels: [
          { title: 'Suy giảm của bộ lọc theo tần số', unit: 'dB', min: -100, max: 30, hlines: [{ y: 0, t: '0 dB: không suy giảm', c: col.ok }, { y: -40, t: '-40 dB: giảm 100 lần', c: col.amp }], series: [{ n: 'đáp ứng', c: col.volt, y: db, f: function (v) { return nf(v, 1) + ' dB'; } }] }
        ]
      };
      d.reads = [['Tần số cộng hưởng', f0 >= 1000 ? nf(f0 / 1000, 1) + ' kHz' : nf(f0, 0) + ' Hz'], ['Suy giảm tại 50 Hz', nf(a50, 2) + ' dB'], ['Suy giảm tại ' + (fn >= 1e6 ? nf(fn / 1e6, 0) + ' MHz' : nf(fn / 1e3, 0) + ' kHz'), nf(att, 1) + ' dB'], ['Nhiễu giảm còn', nf(Math.pow(10, att / 20) * 100, 2) + ' %']];
      d.msg = 'Bộ lọc LC hai cực: tần số cộng hưởng = 1 ÷ (2π√LC) = ' + (f0 >= 1000 ? nf(f0 / 1000, 1) + ' kHz' : nf(f0, 0) + ' Hz') + '. Trên tần số này, mỗi lần tần số tăng 10 lần, nhiễu giảm 100 lần (-40 dB).\nNhiễu ' + (fn >= 1e6 ? nf(fn / 1e6, 0) + ' MHz' : nf(fn / 1e3, 0) + ' kHz') + ' chỉ còn ' + nf(Math.pow(10, att / 20) * 100, 2) + '% biên độ ban đầu. Dòng 50 Hz đi qua gần như nguyên vẹn (' + nf(a50, 2) + ' dB).' + (f0 < 1000 ? '\nCộng hưởng nằm quá thấp: gần dải âm tần, có thể tạo tiếng ù và khuếch đại nhiễu quanh tần số đó.' : '') + (Math.max.apply(null, db) > 6 ? '\nNội trở thấp nên có đỉnh cộng hưởng nhô lên, tại đó nhiễu còn bị khuếch đại.' : '');
      return d;
    },
    tryit: ['Tăng điện cảm lên 10 mH: đường đáp ứng dịch về trái, lọc tốt hơn ở tần số thấp.', 'Đưa tụ X về 10 nF: lọc kém hẳn, vì tụ nhỏ dẫn dòng cao tần ít.', 'Hạ nội trở xuống 1 Ω: xuất hiện đỉnh cộng hưởng nhô lên 0 dB.', 'Tụ X hở trên bo thật: nhiễu cao tần tăng, TV, radio gần đó bị rè.'],
    notes: 'Mô hình lọc LC lý tưởng với nguồn và tải cùng nội trở Rs, bỏ qua điện dung ký sinh của cuộn dây, nên ở tần số rất cao thực tế suy giảm kém hơn mô phỏng. Giá trị cuộn LCL-H2810 và tụ 334K (0,33 µF) lấy theo tài liệu và mã in, chưa đo thực tế.'
  });

  /* ===== Tụ X xả điện ===== */
  K.build({
    id: 'xatux', tab: 'Tụ X và trở xả', dur: 10,
    title: 'Tụ X và trở xả: rút điện tích sau khi rút phích cắm',
    lead: 'Rút phích cắm đúng lúc sóng sin đang ở đỉnh, tụ X giữ lại điện tích và hai chân phích cắm có thể còn điện áp cao. Trở xả nối song song với tụ xả dần điện tích đó. Thời gian xả theo hằng số τ = R × C.',
    ctrls: [
      { id: 'C', label: 'Tụ X', min: 0.1, max: 2, step: 0.01, val: 0.33, fmt: function (v) { return nf(v, 2) + ' µF'; } },
      { id: 'R', label: 'Trở xả', min: 0.1, max: 10, val: 1, log: true, fmt: function (v) { return nf(v, 2) + ' MΩ'; } },
      { id: 'brk', seg: true, label: 'Tình trạng trở xả', val: 'ok', opts: [{ v: 'ok', t: 'Tốt' }, { v: 'open', t: 'Bị hở' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 800, tmax = 4, C = p.C * 1e-6, R = p.R * 1e6, tau = R * C, Rl = p.brk === 'open' ? 1e12 : R, tl = Rl * C;
      var xs = K.arr(N, function (i) { return i * tmax / (N - 1); });
      var v = K.arr(N, function (i) { return 311 * Math.exp(-xs[i] / tl); });
      var e = 0.5 * C * 311 * 311, safe = tl * Math.log(311 / 60);
      var d = {
        xs: xs, xunit: 'giây sau khi rút phích cắm',
        panels: [
          { title: 'Điện áp còn lại trên phích cắm', unit: 'V', min: 0, max: 330, hlines: [{ y: 60, t: '60 V: ngưỡng tham khảo an toàn', c: col.bad }], series: [{ n: 'V', c: col.volt, y: v, f: function (x) { return nf(x, 0) + ' V'; } }] }
        ]
      };
      d.reads = [['Hằng số thời gian τ', nf(R * C, 2) + ' s'], ['Thời gian xuống còn 60 V', p.brk === 'open' ? 'rất lâu (mãi mãi)' : nf(safe, 2) + ' s'], ['Năng lượng tích trữ', nf(e * 1000, 1) + ' mJ'], ['Điện áp sau 1 giây', nf(311 * Math.exp(-1 / tl), 0) + ' V']];
      d.msg = 'τ = R × C = ' + nf(p.R, 2) + ' MΩ × ' + nf(p.C, 2) + ' µF = ' + nf(R * C, 2) + ' s. Sau mỗi τ điện áp còn khoảng 37%. Sau ' + nf(safe, 2) + ' s điện áp còn dưới 60 V.\n' + (p.brk === 'open' ? 'TRỞ XẢ HỞ: tụ giữ điện rất lâu, chạm vào hai chân phích cắm sẽ bị giật. Khi sửa bo, cần xả tụ X trước khi chạm.' : 'Tiêu chuẩn an toàn yêu cầu thời gian xả này đủ ngắn. Trở nhỏ xả nhanh hơn nhưng tốn công suất khi máy chạy.') + '\nVí dụ: tụ 334K là 0,33 µF theo mã in 334 = 33 × 10⁴ pF.';
      return d;
    },
    tryit: ['Tăng trở xả lên 10 MΩ: thời gian xả dài hơn nhiều.', 'Chọn "Bị hở": điện áp gần như không giảm.', 'Tăng tụ lên 2 µF: năng lượng tích trữ lớn hơn, xả chậm hơn.'],
    notes: 'Điện áp ban đầu lấy bằng đỉnh lưới 311 V (trường hợp xấu nhất). Giá trị trở xả trên bo thật chưa được xác minh, hãy đo trước khi kết luận. Khi sửa chữa luôn xả tụ lọc bus bằng điện trở, đừng chập trực tiếp.'
  });

  /* ===== Rơ-le ===== */
  K.build({
    id: 'relay', tab: 'Rơ-le: cuộn và tiếp điểm', dur: 8,
    title: 'Rơ-le: cuộn hút, độ trễ và tia lửa tiếp điểm',
    lead: 'Cuộn dây là điện cảm nên dòng cuộn lên từ từ (hằng số L÷R). Khi lực hút đủ, tiếp điểm mới đóng. Khi ngắt, cuộn cảm sinh ra điện áp ngược rất cao, nên cần diode dập ngược song song. Tiếp điểm đóng ngắt tải lớn còn có tia lửa làm mòn dần.',
    ctrls: [
      { id: 'V', label: 'Điện áp cấp cuộn (rơ-le 12 V)', min: 5, max: 15, step: 0.5, val: 12, fmt: function (v) { return nf(v, 1) + ' V'; } },
      { id: 'L', label: 'Điện cảm cuộn', min: 0.1, max: 2, step: 0.05, val: 0.5, fmt: function (v) { return nf(v, 2) + ' H'; } },
      { id: 'diode', seg: true, label: 'Diode dập ngược', val: 'on', opts: [{ v: 'on', t: 'Có diode' }, { v: 'off', t: 'Không diode' }] },
      { id: 'load', label: 'Dòng tải qua tiếp điểm', min: 0, max: 15, step: 0.5, val: 8, fmt: function (v) { return nf(v, 1) + ' A'; } }
    ],
    compute: function (p) {
      var col = K.col, N = 900, tmax = 140, dt = tmax / N * 1e-3, R = 240, Iin = 12 / R, Ipull = 0.5 * Iin * 1, Irel = 0.2 * Iin * 1, tOff = 70e-3;
      var xs = K.arr(N, function (i) { return i * tmax / N; }), ic = new Float64Array(N), vc = new Float64Array(N), cs = new Float64Array(N), arc = new Float64Array(N), I = 0, closed = 0, tclose = -1, topen = -1, vpk = 0, i;
      var Va = p.V, Imax = Va / R, Ipul = 0.00 + 0.0;
      var pull = 0.7 * (12 / R);
      for (i = 0; i < N; i++) {
        var t = i * dt, on = t < tOff;
        if (on) { var dI = (Va - R * I) / p.L; I += dI * dt; vc[i] = Va; }
        else {
          if (p.diode === 'on') { I += (-0.7 - R * I) / p.L * dt; if (I < 0) I = 0; vc[i] = -0.7; }
          else { var tau = 1e-6; I = I * Math.exp(-dt / (p.L / 2e4)); vc[i] = -Math.min(Va + I * 2e4 * 0.02 + 0, 400); vc[i] = I > 0.001 ? -Math.min(300 + 0, 20 + Math.sqrt(p.L) * 600 * I / Imax) : 0; if (I < 0.001) I = 0; }
        }
        ic[i] = I;
        if (!closed && I >= pull && on) { closed = 1; tclose = t * 1000; }
        if (closed && I < 0.3 * (12 / R) && !on) { closed = 0; topen = t * 1000; }
        cs[i] = closed;
        var near = (tclose >= 0 && Math.abs(t * 1000 - tclose) < 3) || (topen >= 0 && Math.abs(t * 1000 - topen) < 3);
        arc[i] = near ? p.load * (0.4 + 0.6 * Math.exp(-Math.abs(t * 1000 - (Math.abs(t * 1000 - tclose) < 3 ? tclose : topen)) / 1)) : 0;
        if (-vc[i] > vpk) vpk = -vc[i];
      }
      var d = {
        xs: xs, xunit: 'ms (cuộn được cấp điện từ 0 đến 70 ms)',
        panels: [
          { title: 'Điện áp trên cuộn', unit: 'V', series: [{ n: 'Vcuộn', c: col.volt, y: vc, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Dòng trong cuộn', unit: 'A', min: 0, hlines: [{ y: pull, t: 'đủ lực hút', c: col.ok }], series: [{ n: 'I', c: col.amp, y: ic, f: function (v) { return nf(v * 1000, 0) + ' mA'; } }] },
          { title: 'Tiếp điểm và tia lửa', unit: '', min: -0.1, max: 1.5, series: [{ n: 'tiếp điểm', c: col.ok, y: cs, f: function (v) { return v > 0.5 ? 'ĐÓNG' : 'HỞ'; } }, { n: 'tia lửa (tương đối)', c: col.bad, y: K.arr(N, function (i) { return arc[i] / 15; }), f: function (v) { return nf(v * 15, 1) + ' A'; } }] }
        ]
      };
      d.reads = [['Độ trễ khi đóng', tclose >= 0 ? nf(tclose, 1) + ' ms' : 'không hút'], ['Độ trễ khi nhả', topen >= 0 ? nf(topen - tOff * 1000, 1) + ' ms' : 'chưa nhả'], ['Điện áp ngược đỉnh', nf(vpk, 0) + ' V'], ['Dòng cuộn lúc ổn định', nf(Imax * 1000, 0) + ' mA']];
      d.msg = (tclose < 0 ? 'Điện áp quá thấp: cuộn không đủ lực hút, rơ-le không đóng (rơ-le kêu lạch cạch hoặc không đóng là do nguồn cuộn sụt).\n' : 'Rơ-le cần ' + nf(tclose, 1) + ' ms để hút vào.\n') +
        (p.diode === 'on' ? 'Có diode dập ngược: điện áp ngược chỉ cỡ -0,7 V, dòng xả từ từ qua diode nên rơ-le nhả chậm hơn một chút.' : 'KHÔNG diode: cuộn dây bật ngược thành điện áp rất cao (vài trăm vôn) lúc ngắt, có thể phá transistor hoặc IC điều khiển rơ-le. Diode hở hay thiếu là nguyên nhân hay gặp khi transistor điều khiển rơ-le cháy.') +
        '\nTia lửa đỏ ở đồ thị dưới chỉ xuất hiện lúc tiếp điểm đóng hoặc ngắt khi có dòng tải: ' + nf(p.load, 1) + ' A. Dòng càng lớn, mòn càng nhanh.';
      return d;
    },
    tryit: ['Bỏ diode dập ngược: điện áp ngược nhảy lên cao.', 'Giảm điện áp cấp xuống 7 V: rơ-le không hút được, rơi vào tình huống "rơ-le kêu nhưng không đóng".', 'Tăng điện cảm: rơ-le hút chậm hơn.', 'Tăng dòng tải lên 15 A: tia lửa lớn hơn, tiếp điểm mòn nhanh và dính (bị hàn dính) về sau.'],
    notes: 'Điện trở cuộn 240 Ω (dòng 50 mA ở 12 V), ngưỡng hút 70% và nhả 30% dòng danh định là giá trị giả định. Điện áp ngược khi không diode chỉ là xấp xỉ tương đối, thực tế phụ thuộc điện dung ký sinh. Rơ-le trên bo thật chưa đọc được thông số cuộn.'
  });

  /* ===== Bài 10: NTC cảm biến nhiệt + cầu chia áp ===== */
  K.build({
    id: 'ntcdiv', tab: 'NTC đo nhiệt: chia áp', dur: 12,
    title: 'Cảm biến nhiệt NTC và cầu chia áp: nhiệt độ thành điện áp',
    lead: 'NTC nối tiếp một điện trở cố định, điện áp tại điểm giữa (Vo) đưa vào MCU. Nóng lên thì điện trở NTC giảm nên Vo giảm. Con trỏ chạy từ −30 đến 60 °C: xem R và Vo đổi theo nhiệt độ, rồi thử các sự cố hở, chập.',
    svg: S.open(360, 120, 'Nguồn Vcc, điện trở cố định Rf, điểm giữa Vo đi tới MCU, NTC xuống mass') +
      S.T(60, 14, 'Vcc', 'sk-t', 'middle') + S.L(60, 18, 60, 26) + S.R(60, 26, 28, true, 'sk-a') + S.T(76, 44, 'Rf cố định', 'sk-m') + S.dot(60, 70) + S.L(60, 70, 60, 78) + S.R(60, 78, 28, true, 'sk-o') + S.T(76, 96, 'NTC', 'sk-t') + S.L(60, 106, 60, 112) + S.gnd(60, 112) + S.L(60, 70, 180, 70) + S.T(186, 74, 'Vo → ADC của MCU', 'sk-t') + S.T(186, 92, 'Vo = Vcc × R_NTC ÷ (Rf + R_NTC)', 'sk-m') + S.close,
    ctrls: [
      { id: 'R25', label: 'Điện trở NTC ở 25 °C', min: 1, max: 50, val: 2, log: true, fmt: function (v) { return nf(v, 2) + ' kΩ'; } },
      { id: 'B', label: 'Hệ số B của NTC (độ dốc)', min: 2500, max: 5000, step: 50, val: 3800, fmt: function (v) { return nf(v, 0) + ' K'; } },
      { id: 'Rf', label: 'Điện trở cố định Rf', min: 0.5, max: 100, val: 10, log: true, fmt: function (v) { return nf(v, 2) + ' kΩ'; } },
      { id: 'Vcc', seg: true, label: 'Điện áp nguồn của mạch', val: '5', opts: [{ v: '5', t: '5 V' }, { v: '3.3', t: '3,3 V' }] },
      { id: 'fault', seg: true, label: 'Sự cố', val: 'none', opts: [{ v: 'none', t: 'Bình thường' }, { v: 'open', t: 'NTC hở (đứt)' }, { v: 'short', t: 'NTC chập' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 361, Vcc = +p.Vcc, xs = K.arr(N, function (i) { return -30 + 90 * i / (N - 1); });
      function Rn(T) { if (p.fault === 'open') return 1e9; if (p.fault === 'short') return 0.01; return p.R25 * Math.exp(p.B * (1 / (T + 273.15) - 1 / 298.15)); }
      function Vo(T) { var r = Rn(T); return Vcc * r / (r + p.Rf); }
      var rr = K.arr(N, function (i) { return Math.min(Rn(xs[i]), 200); }), vo = K.arr(N, function (i) { return Vo(xs[i]); }), adc = K.arr(N, function (i) { return Math.round(1023 * vo[i] / Vcc); });
      var ts = 0.04 * Vcc, th = 0.96 * Vcc, sens = Math.abs(Vo(5) - Vo(3)) / 2 * 1000;
      var d = {
        xs: xs, xunit: '°C (nhiệt độ cảm biến)',
        panels: [
          { title: 'Điện trở NTC (đo khi tháo khỏi bo)', unit: 'kΩ', min: 0, series: [{ n: 'R NTC', c: col.amp, y: rr, f: function (v) { return v >= 199.9 ? 'hở (rất lớn)' : nf(v, 2) + ' kΩ'; } }] },
          { title: 'Điện áp Vo mà MCU đọc', unit: 'V', min: 0, max: Vcc * 1.05, hlines: [{ y: th, t: 'trên ngưỡng này: báo hở (ví dụ)', c: col.bad }, { y: ts, t: 'dưới ngưỡng này: báo chập (ví dụ)', c: col.bad }], series: [{ n: 'Vo', c: col.volt, y: vo, f: function (v) { return nf(v, 2) + ' V'; } }] },
          { title: 'Số MCU đọc (ADC 10 bit, 0 đến 1023)', unit: '', min: 0, max: 1100, series: [{ n: 'ADC', c: col.ok, y: adc, f: function (v) { return nf(v, 0); } }] }
        ]
      };
      d.reads = [['Vo ở −20 °C', nf(Vo(-20), 2) + ' V'], ['Vo ở 4 °C', nf(Vo(4), 2) + ' V'], ['Vo ở 25 °C', nf(Vo(25), 2) + ' V'], ['Độ nhạy quanh 4 °C', nf(sens, 0) + ' mV mỗi °C']];
      var v4 = Vo(4);
      d.msg = 'Vo = Vcc × R_NTC ÷ (Rf + R_NTC). Ở 25 °C: ' + nf(Vcc, 1) + ' × ' + nf(Rn(25), 2) + ' ÷ (' + nf(p.Rf, 2) + ' + ' + nf(Rn(25), 2) + ') = ' + nf(Vo(25), 2) + ' V.\nĐiện áp trên Rf = Vcc − Vo, hai phần cộng lại luôn bằng Vcc: đo +Vcc với dây cảm biến và đo dây cảm biến với mass sẽ được hai số cộng lại bằng nguồn.' +
        (p.fault === 'open' ? '\nNTC HỞ: R rất lớn, Vo gần bằng Vcc. MCU thấy "lạnh vô cực" nên báo lỗi cảm biến.' : p.fault === 'short' ? '\nNTC CHẬP: R gần 0, Vo gần 0 V. MCU thấy "nóng vô cực" nên báo lỗi cảm biến.' : (v4 > th || v4 < ts ? '\nCẢNH BÁO: với bộ thông số này, Vo ở vùng làm việc đã chạm ngưỡng báo lỗi.' : '\nVo ở vùng làm việc (−20 đến 40 °C) nằm gọn giữa hai ngưỡng, MCU đọc được bình thường.')) +
        '\nĐổi Rf: Rf càng lớn thì Vo càng thấp, MCU hiểu nhiệt độ cao hơn thực tế dù cảm biến vẫn tốt.';
      return d;
    },
    tryit: ['Chọn "NTC hở" rồi "NTC chập": nhớ hai giá trị Vo (gần Vcc và gần 0 V).', 'Đổi Rf từ 10 kΩ lên 22 kΩ: Vo ở 25 °C giảm. Bo đọc lệch nhiệt độ dù cảm biến tốt.', 'Tăng hệ số B: đường Vo dốc hơn, đọc nhạy hơn nhưng dễ chạm ngưỡng ở hai đầu.', 'Đổi Vcc từ 5 V sang 3,3 V: Vo nhỏ lại theo tỉ lệ, số ADC không đổi.'],
    notes: 'Dùng công thức Beta cho NTC (gần đúng). R25 = 2 kΩ và B = 3800 K lấy gần với một bảng cảm biến thật bạn cung cấp (R = 6,495 kΩ ở 0 °C và 2,005 kΩ ở 25 °C), nhưng đây không phải số của một sản phẩm cụ thể. Rf, Vcc và ngưỡng báo hở, chập (4% và 96% Vcc) là giả định minh họa, hãy đo trên bo thật.'
  });
})();
