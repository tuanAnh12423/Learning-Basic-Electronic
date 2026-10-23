/* 19/10/2026: mô phỏng linh kiện phần nguồn xung và inverter (Bài 7, Bài 8).
   Mọi số liệu là mô hình giản lược để thấy quy luật, không phải số đo của một bo cụ thể. */
(function () {
  'use strict';
  var K = window.LabKit;
  if (!K) return;
  var S = K.S, nf = K.nf, si = K.si, fmt = K.fmt, clamp = K.clamp;
  var PI = Math.PI, TAU = 2 * PI;
  function iv(x, y, len, c) { var r = len / 8, d = 'M' + x + ' ' + y, i; for (i = 0; i < 4; i++) d += 'a' + r + ' ' + r + ' 0 0 1 0 ' + (2 * r); return S.P(d, c); }
  function volts(v) { return nf(v, Math.abs(v) >= 100 ? 0 : 1) + ' V'; }

  /* ================= BÀI 7: BIẾN ÁP ================= */
  K.build({
    id: 'bienap', tab: 'Biến áp theo tần số', dur: 8,
    title: 'Biến áp: điện áp, dòng điện và tần số',
    lead: 'Cuộn sơ cấp nhận điện, từ trường trong lõi truyền năng lượng sang cuộn thứ cấp. Tỉ số vòng quyết định điện áp và dòng. Tần số quyết định lõi phải to hay nhỏ. Nguồn một chiều thì biến áp không truyền được.',
    svg: S.open(360, 124, 'Biến áp có cuộn sơ cấp Np, cuộn thứ cấp Ns, lõi ở giữa và tải R') +
      S.P('M30 44a16 16 0 1 0 0.1 0Z', 'sk-f') + S.T(30, 64, '~', 'sk-t', 'middle') + S.L(30, 44, 30, 20) + S.L(30, 20, 80, 20) + S.L(80, 20, 80, 28) + iv(80, 28, 64, 'sk-v') + S.L(80, 92, 80, 100) + S.L(80, 100, 30, 100) + S.L(30, 100, 30, 76) +
      S.L(108, 28, 108, 92) + S.L(114, 28, 114, 92) + S.L(142, 20, 142, 28) + iv(142, 28, 64, 'sk-o') + S.L(142, 92, 142, 100) + S.L(142, 20, 230, 20) + S.L(230, 20, 230, 40) + S.R(230, 40, 36, true) + S.L(230, 76, 230, 100) + S.L(142, 100, 230, 100) +
      S.T(80, 116, 'Np vòng', 'sk-m', 'middle') + S.T(142, 116, 'Ns vòng', 'sk-m', 'middle') + S.T(240, 62, 'R tải', 'sk-t') +
      S.T(268, 38, 'Vs = Vp ÷ n', 'sk-m') + S.T(268, 54, 'Is = Vs ÷ R', 'sk-m') + S.T(268, 70, 'Ip = Is ÷ n', 'sk-m') + S.close,
    ctrls: [
      { id: 'f', label: 'Tần số nguồn cấp vào sơ cấp', min: 50, max: 100000, val: 50, log: true, fmt: function (v) { return v >= 1000 ? nf(v / 1000, 1) + ' kHz' : nf(v, 0) + ' Hz'; } },
      { id: 'n', label: 'Tỉ số vòng n = Np : Ns', min: 2, max: 40, val: 18, log: true, fmt: function (v) { return nf(v, 1) + ' : 1'; } },
      { id: 'R', label: 'Điện trở tải thứ cấp', min: 1, max: 100, val: 6, log: true, fmt: function (v) { return nf(v, 1) + ' Ω'; } },
      { id: 'src', seg: true, label: 'Loại nguồn đưa vào sơ cấp', val: 'ac', opts: [{ v: 'ac', t: 'Xoay chiều 220 V' }, { v: 'dc', t: 'Một chiều 310 V' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 900, f = p.f, T = 1 / f, ms = f < 1000, k = ms ? 1e3 : 1e6;
      var xs = K.arr(N, function (i) { return 2 * T * i / (N - 1) * k; });
      var Vpk = 220 * Math.SQRT2, ac = p.src === 'ac';
      var vp = K.arr(N, function (i) { return ac ? Vpk * Math.sin(TAU * f * (xs[i] / k)) : 310; });
      var vs = K.arr(N, function (i) { return ac ? vp[i] / p.n : 0; });
      var is = K.arr(N, function (i) { return vs[i] / p.R; });
      var Rw = 20, ip = K.arr(N, function (i) { return ac ? is[i] / p.n : 310 / Rw; });
      var Vs = 220 / p.n, Is = Vs / p.R, Ip = Is / p.n, P = Vs * Is, flux = 50 / f * 100;
      var d = {
        xs: xs, xunit: ms ? 'ms' : 'µs',
        panels: [
          { title: 'Điện áp sơ cấp Vp', unit: 'V', series: [{ n: 'Vp', c: col.volt, y: vp }] },
          { title: 'Điện áp thứ cấp Vs', unit: 'V', series: [{ n: 'Vs', c: col.ok, y: vs }] },
          { title: 'Dòng sơ cấp Ip', unit: 'A', series: [{ n: 'Ip', c: col.amp, y: ip }] },
          { title: 'Dòng thứ cấp Is', unit: 'A', series: [{ n: 'Is', c: col.amp, y: is }] }
        ]
      };
      if (ac) {
        d.reads = [['Vs hiệu dụng', nf(Vs, 1) + ' V'], ['Is hiệu dụng', nf(Is, 2) + ' A'], ['Ip hiệu dụng', nf(Ip * 1000, 0) + ' mA'], ['Công suất ra', nf(P, 1) + ' W'], ['Từ thông lõi so với 50 Hz', nf(flux, flux < 1 ? 2 : 1) + '%']];
        d.msg = 'Vs = 220 ÷ ' + nf(p.n, 1) + ' = ' + nf(Vs, 1) + ' V. Is = Vs ÷ R = ' + nf(Is, 2) + ' A. Ip = Is ÷ n = ' + nf(Ip * 1000, 0) + ' mA.\nCông suất vào ≈ công suất ra ≈ ' + nf(P, 1) + ' W (biến áp lý tưởng, bỏ qua tổn hao).\n' +
          (f > 50 ? 'Cùng điện áp và số vòng, từ thông lõi tỉ lệ nghịch với tần số: ở tần số này chỉ còn khoảng ' + nf(flux, flux < 1 ? 2 : 1) + '% so với 50 Hz, nên lõi có thể nhỏ hơn nhiều. Đó là lý do nguồn xung dùng tần số cao.' : 'Ở 50 Hz lõi phải to và nặng vì từ thông lớn. Hãy kéo tần số lên.');
      } else {
        d.reads = [['Vs', '0 V'], ['Ip (giả định)', nf(310 / Rw, 1) + ' A'], ['Công suất ra', '0 W']];
        d.msg = 'Nguồn một chiều: từ thông không đổi nên thứ cấp không có điện áp (chỉ có một nhịp ngắn lúc vừa đóng điện). Dòng sơ cấp chỉ bị giới hạn bởi điện trở dây. Giả sử 20 Ω thì là ' + nf(310 / Rw, 1) + ' A chạy nóng cuộn dây, có thể cháy.\nVì vậy nguồn xung phải cắt điện một chiều 310 V thành xung nhanh rồi mới đưa vào biến áp.';
      }
      return d;
    },
    tryit: ['Giữ 50 Hz, nguồn xoay chiều, tỉ số 18:1, tải 6 Ω: Vs = 12 V, Is = 2 A, Ip khoảng 0,11 A (giống bài tập trong sách).', 'Tăng tỉ số n lên: Vs giảm, Ip giảm theo. Công suất ra không đổi nhiều vì điện áp ra giảm, dòng ra tăng.', 'Kéo tần số lên 65 kHz: dạng sóng không đổi tỉ lệ, nhưng từ thông lõi chỉ còn khoảng 0,08% so với 50 Hz.', 'Đổi sang nguồn một chiều: thứ cấp tắt hẳn, dòng sơ cấp vọt.'],
    notes: 'Mô hình biến áp lý tưởng. Biến áp thật có dòng từ hóa, điện cảm rò và tổn hao nên số đo sẽ lệch chút ít.'
  });

  /* ================= BÀI 7: FLYBACK ================= */
  K.build({
    id: 'flyback', tab: 'Nguồn xung flyback (IC2)', dur: 8,
    title: 'Nguồn xung flyback: xung, điện áp Vds, dòng sơ cấp, dòng thứ cấp',
    lead: 'IC2 đóng ngắt dòng từ bus 310 V qua cuộn sơ cấp. Lúc đóng, dòng sơ cấp tăng dần và lõi tích năng lượng. Lúc ngắt, năng lượng trả sang thứ cấp qua diode. Độ rộng xung (duty) quyết định công suất.',
    svg: S.open(360, 150, 'Sơ đồ nguồn xung flyback: bus 310 V, cuộn sơ cấp, MOSFET trong IC2, cuộn thứ cấp, diode, tụ lọc, tải và đường hồi tiếp') +
      S.T(14, 24, '+310 V', 'sk-t') + S.L(60, 30, 120, 30) + S.L(90, 30, 90, 38) + iv(90, 38, 56, 'sk-v') + S.L(90, 94, 90, 106) + S.SW(75, 106, false, 'IC2') + S.L(90, 132, 90, 140) + S.gnd(90, 140) +
      S.L(118, 40, 118, 92) + S.L(124, 40, 124, 92) + iv(150, 38, 56, 'sk-o') + S.L(150, 30, 150, 38) + S.L(150, 94, 150, 140) + S.L(150, 30, 190, 30) + S.D(205, 30, 'r') + S.L(221, 30, 300, 30) + S.C(250, 52, true) + S.R(300, 36, 40, true) + S.L(250, 70, 250, 140) + S.L(300, 76, 300, 140) + S.L(150, 140, 300, 140) + S.dot(250, 30) +
      S.P('M250 30L250 12L40 12L40 119L75 119', 'sk-b') + S.T(60, 9, 'hồi tiếp (TL431 + opto) về IC2', 'sk-m') + S.T(168, 24, 'Vo', 'sk-t') + S.T(305, 62, 'tải', 'sk-m') + S.T(94, 86, 'Np', 'sk-m') + S.T(158, 86, 'Ns', 'sk-m') +
      S.close,
    ctrls: [
      { id: 'mode', seg: true, label: 'Chế độ điều khiển', val: 'open', opts: [{ v: 'open', t: 'Tự chọn độ rộng xung' }, { v: 'fb', t: 'Có hồi tiếp giữ Vo = 12 V' }] },
      { id: 'D', label: 'Độ rộng xung (duty) khi tự chọn', min: 5, max: 45, step: 1, val: 25, fmt: function (v) { return nf(v, 0) + ' %'; } },
      { id: 'f', label: 'Tần số đóng ngắt', min: 40, max: 130, step: 1, val: 65, fmt: function (v) { return nf(v, 0) + ' kHz'; } },
      { id: 'Lp', label: 'Điện cảm cuộn sơ cấp Lp', min: 0.4, max: 3, step: 0.05, val: 1.2, fmt: function (v) { return nf(v, 2) + ' mH'; } },
      { id: 'R', label: 'Điện trở tải đầu ra (nhỏ thì tải nặng)', min: 3, max: 120, val: 12, log: true, fmt: function (v) { return nf(v, 1) + ' Ω'; } },
      { id: 'llk', label: 'Điện cảm rò của biến áp', min: 0, max: 4, step: 0.1, val: 1, fmt: function (v) { return nf(v, 1) + ' % của Lp'; } },
      { id: 'clamp', seg: true, label: 'Mạch kẹp xung nhọn (RCD) ở cuộn sơ cấp', val: 'on', opts: [{ v: 'on', t: 'Có' }, { v: 'off', t: 'Không có' }] }
    ],
    compute: function (p) {
      var col = K.col, Vin = 310, n = 10, Vf = 0.5, eta = 0.85, Coss = 100e-12, N = 1400;
      var T = 1 / (p.f * 1e3), Lp = p.Lp * 1e-3, D, Vo, Ipk;
      if (p.mode === 'fb') {
        Vo = 12; Ipk = Math.sqrt(2 * Vo * Vo / (p.R * eta * Lp / T)); D = Ipk * Lp / (Vin * T);
      } else {
        D = p.D / 100; Ipk = Vin * D * T / Lp; Vo = Math.sqrt(eta * 0.5 * Lp * Ipk * Ipk / T * p.R);
      }
      var tooWide = D > 0.48; if (tooWide) { D = 0.48; Ipk = Vin * D * T / Lp; Vo = Math.sqrt(eta * 0.5 * Lp * Ipk * Ipk / T * p.R); }
      var Pout = Vo * Vo / p.R, Vr = n * (Vo + Vf), Td = Ipk * Lp / (n * (Vo + Vf)), Toff = (1 - D) * T, ccm = Td > Toff;
      var Llk = p.llk / 100 * Lp, spikeRaw = Ipk * Math.sqrt(Llk / Coss), spike = p.clamp === 'on' ? Math.min(spikeRaw, 0.5 * Vr) : spikeRaw;
      var fr = 1 / (TAU * Math.sqrt(Lp * 2 * Coss));
      var xs = K.arr(N, function (i) { return 2 * T * i / (N - 1) * 1e6; });
      var gate = K.arr(N, 0), vds = K.arr(N, 0), ip = K.arr(N, 0), is = K.arr(N, 0), vmax = 0, i;
      for (i = 0; i < N; i++) {
        var t = xs[i] * 1e-6, tp = t % T;
        if (tp < D * T) { gate[i] = 1; vds[i] = 0.5; ip[i] = Ipk * tp / (D * T); }
        else {
          var tau = tp - D * T;
          if (tau < Math.min(Td, Toff)) { vds[i] = Vin + Vr + spike * Math.exp(-tau / 0.25e-6); is[i] = n * Ipk * (1 - tau / Td); }
          else { var t2 = tau - Math.min(Td, Toff); vds[i] = Vin + Vr * Math.cos(TAU * fr * t2) * Math.exp(-t2 / 6e-6) * (ccm ? 0 : 1); }
        }
        if (vds[i] > vmax) vmax = vds[i];
      }
      var d = {
        xs: xs, xunit: 'µs',
        panels: [
          { title: 'Xung kích vào MOSFET trong IC2', unit: '0 hoặc 1', min: -0.1, max: 1.25, series: [{ n: 'Gate', c: col.volt, y: gate, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }] },
          { title: 'Điện áp Vds (chân Drain so với mass)', unit: 'V', min: 0, max: Math.max(700, vmax * 1.08), hlines: [{ y: 650, t: 'giới hạn MOSFET ~650 V', c: col.bad }], series: [{ n: 'Vds', c: col.bad, y: vds, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Dòng sơ cấp Ip', unit: 'A', min: 0, series: [{ n: 'Ip', c: col.amp, y: ip, f: function (v) { return nf(v, 2) + ' A'; } }] },
          { title: 'Dòng thứ cấp Is (qua diode)', unit: 'A', min: 0, series: [{ n: 'Is', c: col.ok, y: is, f: function (v) { return nf(v, 2) + ' A'; } }] }
        ]
      };
      d.reads = [['Duty D', nf(D * 100, 1) + ' %'], ['Dòng sơ cấp đỉnh', nf(Ipk, 2) + ' A'], ['Điện áp ra Vo', nf(Vo, 1) + ' V'], ['Công suất ra', nf(Pout, 1) + ' W'], ['Vds lớn nhất', nf(vmax, 0) + ' V']];
      var m = 'Dòng sơ cấp đỉnh Ip = Vin × D × T ÷ Lp = ' + nf(Ipk, 2) + ' A. Năng lượng mỗi nhịp = ½ × Lp × Ip².\nVds lúc ngắt = 310 V + n × (Vo + Vf) = 310 + ' + nf(Vr, 0) + ' = ' + nf(310 + Vr, 0) + ' V, cộng thêm xung nhọn do điện cảm rò.';
      if (p.mode === 'fb') m += '\nCó hồi tiếp: IC2 tự thu hẹp xung khi tải nhẹ và mở rộng xung khi tải nặng để giữ 12 V. Hãy thử kéo tải nhẹ và nặng.';
      else m += '\nKhông có hồi tiếp: điện áp ra tự do theo tải và độ rộng xung. Giảm tải thì Vo vọt cao. Đó là lý do cần TL431 và opto.';
      if (ccm) m += '\nTHỜI GIAN TRẢ NĂNG LƯỢNG DÀI HƠN THỜI GIAN NGẮT: nguồn chạy ở chế độ liên tục, mô hình đơn giản này không còn chính xác. Giảm duty hoặc tăng tải.';
      if (tooWide) m += '\nĐộ rộng xung bị giới hạn ở 48% (mô hình).';
      if (vmax > 650) m += '\nCẢNH BÁO: Vds vượt khoảng 650 V, MOSFET có nguy cơ hỏng. Bật mạch kẹp hoặc giảm điện cảm rò.';
      d.msg = m;
      return d;
    },
    tryit: ['Chọn "Có hồi tiếp", đổi tải từ nhẹ sang nặng: duty và dòng sơ cấp đỉnh tăng, Vo giữ 12 V.', 'Chọn "Tự chọn độ rộng xung", kéo tải nhẹ (R lớn): Vo vọt cao. Không có hồi tiếp thì nguồn mất kiểm soát.', 'Tắt mạch kẹp và tăng điện cảm rò: xung nhọn trên Vds tăng, có thể vượt giới hạn MOSFET.', 'Quan sát Vds sau khi thứ cấp hết dòng: dao động tắt dần quanh 310 V (điện cảm sơ cấp cộng điện dung ký sinh).'],
    notes: 'Giả định biến áp tỉ số 10 : 1, hiệu suất 85%, diode sụt 0,5 V, điện dung ký sinh MOSFET 100 pF. Là mô hình chế độ ngắt quãng, dùng để thấy quy luật.'
  });

  /* ================= BÀI 7: TL431 + OPTO ================= */
  K.build({
    id: 'tl431', tab: 'TL431 và opto hồi tiếp', dur: 9,
    title: 'TL431 và opto: so mẫu 12 V, kéo dòng qua LED',
    lead: 'TL431 so mẫu điện áp ra (qua cầu phân áp) với mốc 2,5 V. Chỉ cần lệch vài milivolt, nó đổi dòng qua LED của opto rất mạnh. Phototransistor phía sơ cấp truyền tín hiệu về chân FB của IC2.',
    svg: S.open(360, 156, 'Mạch hồi tiếp: Vout qua điện trở R1 và R2 vào chân Ref của TL431, và qua điện trở Rled vào LED của opto') +
      S.T(8, 30, 'Vo', 'sk-t') + S.L(30, 26, 240, 26) + S.L(70, 26, 70, 34) + S.R(70, 34, 36, true) + S.L(70, 70, 70, 82) + S.dot(70, 82) + S.R(70, 82, 36, true) + S.L(70, 118, 70, 132) + S.gnd(70, 132) +
      S.L(70, 82, 150, 82) + S.L(150, 82, 150, 133) + S.L(150, 133, 160, 133) + S.T(76, 56, 'R1', 'sk-m') + S.T(76, 108, 'R2', 'sk-m') + S.T(96, 76, 'Ref', 'sk-m') +
      S.L(190, 26, 190, 34) + S.R(190, 34, 36, true) + S.L(190, 70, 190, 84) + S.D(190, 100, 'd', 'sk-a') + S.L(190, 116, 190, 120) + S.T(198, 56, 'Rled', 'sk-m') + S.T(198, 104, 'LED opto', 'sk-t') +
      '<rect x="160" y="120" width="60" height="26" rx="4" class="sk-f"/>' + S.T(190, 137, 'TL431', 'sk-t', 'middle') + S.L(190, 146, 190, 150) + S.gnd(190, 148) +
      S.T(250, 90, 'ánh sáng sang', 'sk-m') + S.T(250, 104, 'phototransistor', 'sk-m') + S.T(250, 118, '(phía sơ cấp)', 'sk-m') + S.close,
    ctrls: [
      { id: 'R1', label: 'R1 (trên, nối với Vo)', min: 10, max: 100, val: 38, log: true, fmt: function (v) { return nf(v, 1) + ' kΩ'; } },
      { id: 'R2', label: 'R2 (dưới, nối với mass)', min: 2, max: 30, val: 10, log: true, fmt: function (v) { return nf(v, 1) + ' kΩ'; } },
      { id: 'Rled', label: 'Điện trở nối tiếp với LED opto', min: 0.3, max: 5, val: 1, log: true, fmt: function (v) { return nf(v, 2) + ' kΩ'; } },
      { id: 'ctr', label: 'CTR của opto (hệ số truyền dòng)', min: 20, max: 300, step: 5, val: 100, fmt: function (v) { return nf(v, 0) + ' %'; } },
      { id: 'fault', seg: true, label: 'Sự cố', val: 'none', opts: [{ v: 'none', t: 'Bình thường' }, { v: 'r1o', t: 'R1 hở' }, { v: 'r2o', t: 'R2 hở' }, { v: 'led', t: 'LED opto đứt' }] }
    ],
    compute: function (p) {
      var col = K.col, Vref = 2.495, gm = 3, Vf = 1.2, Vkmin = 2.5, N = 600, R1 = p.R1 * 1e3, R2 = p.R2 * 1e3, Rl = p.Rled * 1e3;
      var ratio = R2 / (R1 + R2), fault = p.fault;
      if (fault === 'r1o') ratio = 0; if (fault === 'r2o') ratio = 1;
      var Vset = ratio > 0 ? Vref / ratio : Infinity;
      var centre = isFinite(Vset) ? Vset : 12;
      var xs = K.arr(N, function (i) { return centre - 0.03 + 0.06 * i / (N - 1); });
      var ik = K.arr(N, function (i) {
        var v = xs[i], vr = v * ratio, imax = Math.max(0, (v - Vf - Vkmin) / Rl), I = clamp((vr - Vref) * gm, 0, imax);
        return fault === 'led' ? 0 : I * 1000;
      });
      var ic = K.arr(N, function (i) { return ik[i] * p.ctr / 100; });
      var vr = K.arr(N, function (i) { return xs[i] * ratio; });
      var d = {
        xs: xs, xunit: 'V (điện áp ra Vo)',
        panels: [
          { title: 'Điện áp tại chân Ref của TL431', unit: 'V', series: [{ n: 'Vref', c: col.volt, y: vr, f: function (v) { return nf(v, 3) + ' V'; } }], hlines: [{ y: 2.495, t: 'mốc 2,495 V', c: col.ok }] },
          { title: 'Dòng qua LED opto (phía thứ cấp)', unit: 'mA', min: 0, series: [{ n: 'Iled', c: col.amp, y: ik, f: function (v) { return nf(v, 2) + ' mA'; } }] },
          { title: 'Dòng phototransistor = CTR × Iled', unit: 'mA', min: 0, series: [{ n: 'Ic', c: col.bad, y: ic, f: function (v) { return nf(v, 2) + ' mA'; } }] }
        ]
      };
      d.reads = [['Điện áp ra đặt', isFinite(Vset) ? nf(Vset, 2) + ' V' : 'không đạt được'], ['Hệ số chia', nf(ratio, 3)], ['Ic cực đại', nf(Math.max.apply(null, ic), 2) + ' mA']];
      var m = 'Vo đặt = 2,495 × (1 + R1 ÷ R2) = 2,495 × (1 + ' + nf(p.R1, 1) + ' ÷ ' + nf(p.R2, 1) + ') = ' + (isFinite(Vset) ? nf(Vset, 2) + ' V' : '—') + '.\nTrục ngang chỉ rộng 60 mV quanh điểm đặt: lệch vài mV là dòng LED đi từ 0 đến mức tối đa.';
      if (fault === 'r1o') m += '\nR1 hở: chân Ref luôn 0 V, TL431 không dẫn, LED tắt, IC2 tưởng điện áp ra thấp nên mở rộng xung tối đa. Điện áp ra vọt cao.';
      if (fault === 'r2o') m += '\nR2 hở: chân Ref bằng chính Vo, TL431 dẫn mạnh ngay từ 2,5 V, LED sáng hết cỡ, IC2 thu hẹp xung. Điện áp ra tụt rất thấp.';
      if (fault === 'led') m += '\nLED opto đứt: không có dòng LED, không có hồi tiếp, IC2 chạy xung tối đa. Điện áp ra vọt, có thể làm phù tụ hoặc nổ IC.';
      d.msg = m; return d;
    },
    tryit: ['Giữ R1 = 38 kΩ, R2 = 10 kΩ: Vo đặt ≈ 12 V. Đổi R1 sang giá trị khác và xem Vo đặt thay đổi.', 'Hạ CTR xuống 30% (opto già): với cùng dòng LED, phototransistor cho dòng nhỏ hơn, hồi tiếp yếu đi.', 'Chọn "R2 hở" rồi "R1 hở" để thấy hai sự cố kéo điện áp ra về hai hướng ngược nhau.'],
    notes: 'Đường cong dòng là mô hình minh họa độ dốc rất lớn của TL431 (giả định 3 A trên mỗi vôn tại chân Ref), không phải số liệu trong datasheet. Mốc 2,495 V và công thức chia áp là kiến thức cơ bản.'
  });

  /* ================= BÀI 8: VÒNG HỒI TIẾP KÍN ================= */
  K.build({
    id: 'vonghoi', tab: 'Vòng hồi tiếp khi tải đổi', dur: 12,
    title: 'Vòng hồi tiếp kín: tải nhảy, opto già, opto đứt',
    lead: 'Tải đột ngột nặng lên thì điện áp ra tụt. TL431 và opto báo về IC2, IC2 mở rộng xung để bù. Opto già (CTR giảm) làm vòng phản ứng chậm. Opto đứt thì mất kiểm soát và nguồn chớp tắt (hiccup).',
    ctrls: [
      { id: 'opto', seg: true, label: 'Tình trạng opto', val: 'good', opts: [{ v: 'good', t: 'Tốt' }, { v: 'aged', t: 'Già (CTR 30%)' }, { v: 'vold', t: 'Rất già (CTR 10%)' }, { v: 'open', t: 'Đứt' }] },
      { id: 'C', label: 'Tụ lọc đầu ra', min: 220, max: 3300, val: 1000, log: true, fmt: function (v) { return nf(v, 0) + ' µF'; } },
      { id: 'Rh', label: 'Điện trở tải khi nặng', min: 3, max: 20, val: 5, log: true, fmt: function (v) { return nf(v, 1) + ' Ω'; } }
    ],
    compute: function (p) {
      var col = K.col, dt = 50e-6, N = 1600, g = { good: 1, aged: 0.3, vold: 0.1, open: 0 }[p.opto];
      var V = 12, D = 0.1, Di = 0.1, Vset = 12, Dmax = 0.5, Pmax = 60, C = p.C * 1e-6, Ki = 40, Kp = 0.2, hic = 0;
      var tv = K.arr(N, 0), dv = K.arr(N, 0), iv_ = K.arr(N, 0), xs = K.arr(N, 0), k, ovp = 0;
      for (k = 0; k < N; k++) {
        var t = k * dt, R = (t < 0.02 || t > 0.05) ? 60 : p.Rh;
        if (hic > 0) { hic -= dt; D = 0; Di = 0; if (hic <= 0) { Di = 0.03; D = 0.03; } }
        else if (g === 0) { Di = Math.min(Dmax, Di + 25 * dt); D = Di; }
        else { Di = clamp(Di + Ki * g * (Vset - V) * dt, 0, Dmax); D = clamp(Di + Kp * g * (Vset - V), 0, Dmax); }
        var P = hic > 0 ? 0 : Pmax * Math.pow(D / Dmax, 2), Is = P / Math.max(V, 1);
        V += (Is - V / R) / C * dt; if (V < 0) V = 0;
        if (V > 1.25 * Vset && hic <= 0) { hic = 0.012; D = 0; ovp++; }
        xs[k] = t * 1000; tv[k] = V; dv[k] = D * 100; iv_[k] = V / R;
      }
      var vmin = 1e9, vmax = 0; for (k = 400; k < N; k++) { vmin = Math.min(vmin, tv[k]); vmax = Math.max(vmax, tv[k]); }
      var d = {
        xs: xs, xunit: 'ms',
        panels: [
          { title: 'Điện áp ra Vo', unit: 'V', min: 0, max: 20, hlines: [{ y: 12, t: 'đặt 12 V', c: col.ok }, { y: 15, t: 'bảo vệ quá áp ~15 V', c: col.bad }], series: [{ n: 'Vo', c: col.volt, y: tv, f: function (v) { return nf(v, 2) + ' V'; } }], shade: [{ x0: 20, x1: 50, c: col.amp }] },
          { title: 'Độ rộng xung IC2 (duty)', unit: '%', min: 0, max: 50, series: [{ n: 'D', c: col.amp, y: dv, f: function (v) { return nf(v, 1) + ' %'; } }] },
          { title: 'Dòng tải', unit: 'A', min: 0, series: [{ n: 'Iload', c: col.ok, y: iv_, f: function (v) { return nf(v, 2) + ' A'; } }] }
        ]
      };
      d.reads = [['Điện áp thấp nhất khi tải nặng', nf(vmin, 1) + ' V'], ['Điện áp cao nhất', nf(vmax, 1) + ' V'], ['Số lần bảo vệ quá áp', nf(ovp, 0)]];
      d.msg = 'Vùng vàng là lúc tải nặng (20 đến 50 ms). Vòng hồi tiếp gồm TL431, opto và IC2 mở rộng xung để kéo Vo về 12 V.' +
        (p.opto === 'good' ? '\nOpto tốt: Vo tụt nhẹ rồi hồi về nhanh.' : p.opto === 'open' ? '\nOpto đứt: không có hồi tiếp, IC2 kéo xung ra tối đa, điện áp vọt qua ngưỡng bảo vệ, nguồn ngắt rồi khởi động lại liên tục (chớp tắt).' : '\nOpto già: tín hiệu hồi tiếp yếu, vòng chậm, điện áp tụt sâu hơn và lâu hơn khi tải nặng. MCU và rơle có thể reset, biến áp có thể rít.');
      return d;
    },
    tryit: ['Chọn opto Tốt rồi Già, so sánh mức tụt của Vo ở 20 ms.', 'Chọn "Đứt": Vo vọt, nguồn ngắt bảo vệ rồi chạy lại, lặp đi lặp lại.', 'Tăng tụ lọc: Vo tụt nông hơn nhưng nguồn không thể nhanh hơn do vòng hồi tiếp.'],
    notes: 'Mô hình trung bình (không vẽ từng xung). Mức bảo vệ quá áp 15 V và tốc độ vòng là giả định minh họa, không phải số đo của IC nào.'
  });

  /* ================= BÀI 8: CHỈNH LƯU THỨ CẤP ================= */
  K.build({
    id: 'sec', tab: 'Diode kép + tụ 1000 µF', dur: 8,
    title: 'Chỉnh lưu thứ cấp: diode kép Schottky và tụ lọc',
    lead: 'Mỗi nhịp, thứ cấp bơm một xung dòng hình tam giác qua diode vào tụ. Tụ giữ điện áp 12 V giữa các xung. Tụ già (điện trở nối tiếp ESR tăng) làm gợn sóng tăng. Diode Schottky sụt áp thấp nên ít nóng.',
    svg: S.open(360, 110, 'Cuộn thứ cấp, diode, tụ lọc và tải') + iv(40, 30, 56, 'sk-o') + S.L(40, 94, 40, 100) + S.L(40, 30, 40, 20) + S.L(40, 20, 100, 20) + S.D(116, 20, 'r') + S.L(132, 20, 300, 20) + S.dot(220, 20) + S.L(220, 20, 220, 40) + S.C(220, 58, true) + S.L(220, 76, 220, 100) + S.L(300, 20, 300, 40) + S.R(300, 40, 36, true) + S.L(300, 76, 300, 100) + S.L(40, 100, 300, 100) + S.T(86, 14, 'Schottky', 'sk-m') + S.T(228, 62, 'C + ESR', 'sk-t') + S.T(306, 62, 'tải', 'sk-m') + S.close,
    ctrls: [
      { id: 'Io', label: 'Dòng tải 12 V', min: 0.2, max: 3, step: 0.1, val: 1.5, fmt: function (v) { return nf(v, 1) + ' A'; } },
      { id: 'C', label: 'Điện dung tụ lọc', min: 100, max: 3300, val: 1000, log: true, fmt: function (v) { return nf(v, 0) + ' µF'; } },
      { id: 'esr', label: 'ESR của tụ (điện trở nối tiếp)', min: 5, max: 800, val: 60, log: true, fmt: function (v) { return nf(v, 0) + ' mΩ'; } },
      { id: 'dio', seg: true, label: 'Loại diode', val: 'sch', opts: [{ v: 'sch', t: 'Schottky (0,45 V)' }, { v: 'std', t: 'Thường (1,0 V)' }] }
    ],
    compute: function (p) {
      var col = K.col, f = 65e3, T = 1 / f, Tc = 0.4 * T, Ipk = 2 * p.Io * T / Tc, N = 1200, C = p.C * 1e-6, esr = p.esr * 1e-3;
      var xs = K.arr(N, function (i) { return 3 * T * i / (N - 1) * 1e6; });
      var is = K.arr(N, 0), ic = K.arr(N, 0), vo = K.arr(N, 0), i, vc = 0, dt = 3 * T / (N - 1), irms = 0;
      for (i = 0; i < N; i++) {
        var tp = (i * dt) % T; is[i] = tp < Tc ? Ipk * (1 - tp / Tc) : 0;
        ic[i] = is[i] - p.Io; vc += ic[i] * dt / C; vo[i] = vc + esr * ic[i]; irms += ic[i] * ic[i];
      }
      var mean = 0; for (i = 0; i < N; i++) mean += vo[i]; mean /= N;
      var mn = 1e9, mx = -1e9; for (i = 0; i < N; i++) { vo[i] = (vo[i] - mean) * 1000; mn = Math.min(mn, vo[i]); mx = Math.max(mx, vo[i]); }
      irms = Math.sqrt(irms / N); var Vf = p.dio === 'sch' ? 0.45 : 1.0;
      var d = {
        xs: xs, xunit: 'µs',
        panels: [
          { title: 'Dòng thứ cấp qua diode Is', unit: 'A', min: 0, series: [{ n: 'Is', c: col.ok, y: is, f: function (v) { return nf(v, 2) + ' A'; } }] },
          { title: 'Dòng vào tụ (dương là nạp, âm là xả)', unit: 'A', series: [{ n: 'Ic', c: col.amp, y: ic, f: function (v) { return nf(v, 2) + ' A'; } }] },
          { title: 'Gợn sóng điện áp ra (so với mức trung bình)', unit: 'mV', series: [{ n: 'Vo', c: col.volt, y: vo, f: function (v) { return nf(v, 0) + ' mV'; } }] }
        ]
      };
      d.reads = [['Dòng đỉnh qua diode', nf(Ipk, 1) + ' A'], ['Gợn sóng đỉnh-đỉnh', nf(mx - mn, 0) + ' mV'], ['Công suất tỏa trên diode', nf(Vf * p.Io, 2) + ' W'], ['Công suất tỏa trên ESR', nf(irms * irms * esr, 2) + ' W']];
      d.msg = 'Dòng trung bình ' + nf(p.Io, 1) + ' A chỉ chảy trong khoảng 40% mỗi chu kỳ nên dòng đỉnh lên đến ' + nf(Ipk, 1) + ' A. ESR càng lớn thì gợn sóng càng lớn và tụ càng nóng.\nDiode ' + (p.dio === 'sch' ? 'Schottky sụt thấp nên tỏa ít nhiệt' : 'thường sụt cao nên tỏa nhiệt gấp hơn hai lần') + ': ' + nf(Vf * p.Io, 2) + ' W.';
      return d;
    },
    tryit: ['Tăng ESR từ 60 lên 600 mΩ (tụ lão hóa): gợn sóng tăng mạnh, tụ nóng hơn.', 'Đổi diode sang loại thường: công suất tỏa tăng hơn gấp đôi.', 'Giảm điện dung: gợn sóng tăng vì mỗi nhịp tụ mất nhiều điện áp hơn.'],
    notes: 'Tần số 65 kHz, thời gian dẫn 40% chu kỳ là giả định. Tụ lão hóa thường có ESR tăng, nhưng mức tăng cụ thể phụ thuộc loại tụ và đo bằng máy đo ESR.'
  });

  /* ================= BÀI 8: BUCK L4 ================= */
  K.build({
    id: 'buck', tab: 'Hạ áp 15 V xuống 5 V (L4)', dur: 8,
    title: 'Mạch hạ áp buck: cuộn L4 và dòng điện cuộn cảm',
    lead: 'Công tắc đóng ngắt rất nhanh, cuộn cảm giữ dòng và san phẳng điện áp. Điện áp ra bằng điện áp vào nhân độ rộng xung. Cuộn nhỏ thì dòng gợn lớn, tải nhẹ thì dòng cuộn về 0 giữa các nhịp (chế độ gián đoạn).',
    svg: S.open(360, 110, 'Mạch buck: khoá, diode, cuộn L4, tụ và tải') + S.T(10, 30, 'Vin 15 V', 'sk-t') + S.L(60, 30, 80, 30) + S.SW(80, 17, false, 'SW') + S.L(110, 30, 130, 30) + S.dot(130, 30) + S.I(130, 30, 80, 'sk-a') + S.L(210, 30, 300, 30) + S.dot(250, 30) + S.L(130, 30, 130, 60) + S.D(130, 76, 'u') + S.L(130, 92, 130, 100) + S.L(250, 30, 250, 52) + S.C(250, 70, true) + S.L(250, 88, 250, 100) + S.L(300, 30, 300, 46) + S.R(300, 46, 36, true) + S.L(300, 82, 300, 100) + S.L(130, 100, 300, 100) + S.T(150, 22, 'L4', 'sk-t') + S.T(264, 74, 'C', 'sk-m') + S.T(306, 66, 'tải', 'sk-m') + S.T(10, 100, 'diode chạy vòng', 'sk-m') + S.close,
    ctrls: [
      { id: 'Vin', label: 'Điện áp vào (từ 7815)', min: 12, max: 18, step: 0.5, val: 15, fmt: function (v) { return nf(v, 1) + ' V'; } },
      { id: 'Vo', seg: true, label: 'Điện áp ra', val: 5, opts: [{ v: 3.3, t: '3,3 V' }, { v: 5, t: '5 V' }] },
      { id: 'L', label: 'Điện cảm L4', min: 4.7, max: 47, val: 10, log: true, fmt: function (v) { return nf(v, 1) + ' µH'; } },
      { id: 'f', label: 'Tần số đóng ngắt', min: 100, max: 1000, step: 10, val: 500, fmt: function (v) { return nf(v, 0) + ' kHz'; } },
      { id: 'Io', label: 'Dòng tải', min: 0.02, max: 1, val: 0.15, log: true, fmt: function (v) { return si(v, 'A', 2); } }
    ],
    compute: function (p) {
      var col = K.col, Vin = p.Vin, Vo = p.Vo, L = p.L * 1e-6, f = p.f * 1e3, T = 1 / f, R = Vo / p.Io, N = 1000;
      var D = Vo / Vin, dI = (Vin - Vo) * D * T / L, dcm = p.Io < dI / 2, Ipk, D2;
      if (dcm) { var Kc = 2 * L / (R * T), M = Vo / Vin; D = Math.sqrt(4 * Kc / ((2 / M - 1) * (2 / M - 1) - 1)); Ipk = (Vin - Vo) * D * T / L; D2 = D * (Vin - Vo) / Vo; }
      var xs = K.arr(N, function (i) { return 2 * T * i / (N - 1) * 1e6; });
      var il = K.arr(N, 0), vsw = K.arr(N, 0), i;
      for (i = 0; i < N; i++) {
        var tp = (xs[i] * 1e-6) % T;
        if (!dcm) { if (tp < D * T) { il[i] = p.Io - dI / 2 + dI * tp / (D * T); vsw[i] = Vin; } else { il[i] = p.Io + dI / 2 - dI * (tp - D * T) / ((1 - D) * T); vsw[i] = -0.5; } }
        else { if (tp < D * T) { il[i] = Ipk * tp / (D * T); vsw[i] = Vin; } else if (tp < (D + D2) * T) { il[i] = Ipk * (1 - (tp - D * T) / (D2 * T)); vsw[i] = -0.5; } else { il[i] = 0; vsw[i] = Vo; } }
      }
      var d = {
        xs: xs, xunit: 'µs',
        panels: [
          { title: 'Điện áp tại điểm giữa khoá và cuộn', unit: 'V', min: -2, max: Vin * 1.15, series: [{ n: 'Vsw', c: col.volt, y: vsw, f: function (v) { return nf(v, 1) + ' V'; } }] },
          { title: 'Dòng qua cuộn L4', unit: 'A', min: 0, series: [{ n: 'IL', c: col.amp, y: il, f: function (v) { return nf(v, 3) + ' A'; } }], hlines: [{ y: p.Io, t: 'dòng tải trung bình', c: col.ok }] }
        ]
      };
      d.reads = [['Độ rộng xung D', nf(D * 100, 1) + ' %'], ['Dòng gợn đỉnh-đỉnh', nf(dcm ? Ipk : dI, 3) + ' A'], ['Chế độ', dcm ? 'Gián đoạn' : 'Liên tục']];
      d.msg = 'D ≈ Vo ÷ Vin = ' + nf(Vo, 1) + ' ÷ ' + nf(Vin, 1) + ' (chế độ liên tục). Dòng gợn ΔI = (Vin − Vo) × D ÷ (L × f) = ' + nf(dI, 3) + ' A.\n' + (dcm ? 'Dòng tải nhỏ hơn nửa dòng gợn nên dòng cuộn về 0 giữa các nhịp: chế độ gián đoạn, độ rộng xung tự thu hẹp.' : 'Dòng cuộn luôn lớn hơn 0.');
      return d;
    },
    tryit: ['Giảm L xuống 4,7 µH: dòng gợn tăng gấp đôi.', 'Giảm dòng tải xuống 20 mA: dòng cuộn chạm 0, chuyển sang chế độ gián đoạn.', 'Đổi 5 V sang 3,3 V: độ rộng xung giảm, dòng gợn thay đổi.'],
    notes: 'Mô hình lý thuyết bỏ qua sụt áp công tắc và diode. IC buck nhỏ trên bo chưa xác định được theo tài liệu, nên tần số và điện cảm chỉ là ví dụ (L4 in 100 = 10 µH).'
  });

  /* ================= BÀI 8: BOOTSTRAP CHO IC DRIVER ================= */
  K.build({
    id: 'boot', tab: 'Driver + tụ bootstrap', dur: 9,
    title: 'IC driver và tụ bootstrap: nuôi cực Gate của IGBT phía trên',
    lead: 'IGBT phía trên có cực Source nhảy theo điện áp ra, nên nguồn kích của nó là một tụ nổi (bootstrap). Tụ được nạp lại khi IGBT phía dưới dẫn. Mỗi lần kích mở IGBT trên, tụ mất một ít điện tích vào cực Gate. Duty quá cao thì tụ không kịp nạp lại.',
    svg: S.open(360, 130, 'Nửa cầu: IGBT trên, IGBT dưới, IC driver, diode bootstrap, tụ bootstrap') +
      S.T(8, 20, '+15 V', 'sk-t') + S.L(50, 16, 90, 16) + S.D(106, 16, 'r', 'sk-a') + S.L(122, 16, 150, 16) + S.dot(150, 16) + S.L(150, 16, 150, 40) + S.C(150, 56, true, 'sk-a') + S.L(150, 74, 150, 84) + S.T(160, 58, 'Cboot', 'sk-m') +
      S.T(76, 10, 'diode', 'sk-m') + S.SW(248, 10, false, 'IGBT') + S.T(284, 28, 'trên', 'sk-m') + S.L(263, 36, 263, 62) + S.dot(263, 62) + S.L(263, 62, 263, 70) + S.SW(248, 70, false, 'IGBT') + S.T(284, 88, 'dưới', 'sk-m') + S.L(263, 96, 263, 116) + S.gnd(263, 116) +
      S.L(150, 84, 263, 62, 'sk-w') + S.T(180, 78, 'ra U-V-W', 'sk-m') + '<rect x="160" y="14" width="64" height="22" rx="4" class="sk-f"/>' + S.T(192, 29, 'IC driver', 'sk-t', 'middle') + S.L(224, 24, 248, 24) + S.close,
    ctrls: [
      { id: 'C', label: 'Tụ bootstrap', min: 0.047, max: 10, val: 1, log: true, fmt: function (v) { return nf(v, 3) + ' µF'; } },
      { id: 'Qg', label: 'Điện tích Gate mỗi lần kích (Qg)', min: 20, max: 300, step: 5, val: 100, fmt: function (v) { return nf(v, 0) + ' nC'; } },
      { id: 'f', label: 'Tần số PWM', min: 2, max: 20, step: 0.5, val: 5, fmt: function (v) { return nf(v, 1) + ' kHz'; } },
      { id: 'D', label: 'Duty của IGBT trên', min: 5, max: 99, step: 1, val: 60, fmt: function (v) { return nf(v, 0) + ' %'; } },
      { id: 'Il', label: 'Dòng rò của mạch driver phía trên', min: 50, max: 1000, step: 10, val: 200, fmt: function (v) { return nf(v, 0) + ' µA'; } }
    ],
    compute: function (p) {
      var col = K.col, T = 1 / (p.f * 1e3), Cb = p.C * 1e-6, steps = 100, dt = T / steps, Vch = 14.3, Rch = 10, UV = 8.5, Qg = p.Qg * 1e-9, Il = p.Il * 1e-6;
      var V = Vch, per, k, hsPrev = 0, cmd, act, show = 5, N = show * steps, cm = new Float64Array(N), ac = new Float64Array(N), vb = new Float64Array(N), xs = new Float64Array(N), lock = false, vmin = 99, ncount = 0;
      for (per = 0; per < 260 + show; per++) {
        for (k = 0; k < steps; k++) {
          var ph = k / steps; cmd = ph < p.D / 100 ? 1 : 0;
          if (lock && V > UV + 1) lock = false;
          act = (cmd && !lock) ? 1 : 0;
          if (act && !hsPrev) V -= Qg / Cb;
          if (act) V -= Il / Cb * dt; else V += (Vch - V) / (Rch * Cb) * dt;
          if (V < UV) { lock = true; act = 0; }
          hsPrev = act; if (V < 0) V = 0; if (V > Vch) V = Vch;
          if (per >= 260) { var j = (per - 260) * steps + k; cm[j] = cmd; ac[j] = act; vb[j] = V; xs[j] = j * dt * 1e6; if (V < vmin) vmin = V; if (!act && cmd) ncount++; }
        }
      }
      var d = {
        xs: xs, xunit: 'µs',
        panels: [
          { title: 'Lệnh PWM và kích thực tế (IGBT trên)', unit: '0 hoặc 1', min: -0.1, max: 1.3, series: [{ n: 'Lệnh', c: col.volt, y: cm, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }, { n: 'Thực tế', c: col.bad, y: ac, w: 1.4, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }] },
          { title: 'Điện áp tụ bootstrap', unit: 'V', min: 0, max: 16, hlines: [{ y: 14.3, t: '15 V trừ sụt diode', c: col.ok }, { y: UV, t: 'ngưỡng sụt áp ~8,5 V (giả định)', c: col.bad }], series: [{ n: 'VB', c: col.amp, y: vb, f: function (v) { return nf(v, 2) + ' V'; } }] }
        ]
      };
      d.reads = [['Tụt mỗi lần kích', nf(Qg / Cb, 2) + ' V'], ['Điện áp thấp nhất', nf(vmin, 1) + ' V'], ['Thời gian nạp lại (3τ)', nf(3 * Rch * Cb * 1e6, 0) + ' µs'], ['Thời gian nhánh dưới dẫn', nf((1 - p.D / 100) * T * 1e6, 0) + ' µs']];
      d.msg = 'Tụt mỗi lần kích = Qg ÷ C = ' + nf(Qg * 1e9, 0) + ' nC ÷ ' + nf(p.C, 3) + ' µF = ' + nf(Qg / Cb, 2) + ' V. Nạp lại cần thời gian khoảng 3 × R × C, mà nhánh dưới chỉ dẫn ' + nf((1 - p.D / 100) * T * 1e6, 0) + ' µs mỗi chu kỳ.' +
        (vmin < UV + 0.5 ? '\nTụ không kịp nạp: điện áp tụt thấp, IC driver ngắt kích IGBT trên (tín hiệu thực tế đỏ ngắn hơn lệnh). Hậu quả thật: thiếu kích, IGBT mở không đủ, nóng hoặc mất pha.' : '\nTụ nạp đủ, IGBT trên được kích đầy đủ.');
      return d;
    },
    tryit: ['Tăng duty lên 98%: nhánh dưới dẫn quá ngắn, tụ không kịp nạp, tín hiệu thực tế bị cắt.', 'Giảm tụ xuống 0,047 µF: mỗi lần kích tụt vài vôn, dễ chạm ngưỡng sụt áp.', 'Tăng tần số PWM: thời gian mỗi chu kỳ ngắn hơn nên thời gian nạp lại cũng ngắn hơn.'],
    notes: 'Điện trở nạp 10 Ω, ngưỡng sụt áp 8,5 V và dòng rò là giá trị giả định điển hình. Giá trị thật tùy loại IC driver trên bo.'
  });

  /* ================= BÀI 8: 6 IGBT + SPWM ================= */
  function spwmCompute(p) {
    var col = K.col, f = p.f, T = 1 / f, cyc = 4, N = 6000, dt = cyc * T / N, fc = p.fc * 1e3, Vdc = p.Vdc, R = 3.5, Lm = 0.02;
    var m = p.vf === 'vf' ? clamp(f / 100, 0.1, 1) : p.m;
    var rf = [0, -TAU / 3, TAU / 3], gate = [new Float64Array(N), new Float64Array(N), new Float64Array(N)], refv = [new Float64Array(N), new Float64Array(N), new Float64Array(N)], car = new Float64Array(N), vo = [0, 0, 0], iph = [0, 0, 0];
    var vuv = new Float64Array(N), cur = [new Float64Array(N), new Float64Array(N), new Float64Array(N)], k, x;
    for (k = 0; k < N; k++) {
      var tt = k * dt, th = TAU * f * tt, c = (function (xx) { var a = xx - Math.floor(xx + 0.5); return 4 * Math.abs(a) - 1; })(fc * tt);
      car[k] = c;
      for (x = 0; x < 3; x++) { refv[x][k] = m * Math.sin(th + rf[x]); gate[x][k] = refv[x][k] > c ? 1 : 0; vo[x] = gate[x][k] ? Vdc / 2 : -Vdc / 2; }
      var vn = (vo[0] + vo[1] + vo[2]) / 3; vuv[k] = vo[0] - vo[1];
      for (x = 0; x < 3; x++) { iph[x] += ((vo[x] - vn) - R * iph[x]) / Lm * dt; cur[x][k] = iph[x]; }
    }
    var s0 = N / 2, n2 = N - s0;
    function cut(a) { return a.slice(s0); }
    var xs = K.arr(n2, function (i) { return i * dt * 1000; });
    var fund = K.arr(n2, function (i) { var w = Math.max(3, Math.round(1 / (fc * dt))), a = 0, c2 = 0, j; for (j = -w; j <= w; j++) { var q = i + s0 + j; if (q >= 0 && q < N) { a += vuv[q]; c2++; } } return a / c2; });
    var ir = 0, i2; for (i2 = 0; i2 < n2; i2++) ir += cur[0][s0 + i2] * cur[0][s0 + i2]; ir = Math.sqrt(ir / n2);
    return { col: col, m: m, xs: xs, ref: refv.map(cut), car: cut(car), gate: gate.map(cut), vuv: cut(vuv), fund: fund, cur: cur.map(cut), ir: ir, Vdc: Vdc, f: f, fc: fc };
  }
  K.build({
    id: 'spwm', tab: '6 IGBT tạo điện 3 pha', dur: 12, dratio: 0.6,
    title: '6 IGBT tạo điện 3 pha cho máy nén (điều chế SPWM)',
    lead: 'MCU so sánh ba sóng sin chuẩn (lệch nhau 120°) với một sóng tam giác. Sin lớn hơn tam giác thì IGBT trên của pha đó mở, ngược lại IGBT dưới mở. Điện áp 310 V DC được băm thành xung, cuộn dây động cơ làm trơn thành dòng hình sin. Đổi tần số và biên độ sin là đổi tốc độ máy nén.',
    ctrls: [
      { id: 'f', label: 'Tần số điện ra (tốc độ máy nén)', min: 20, max: 120, step: 1, val: 60, fmt: function (v) { return nf(v, 0) + ' Hz'; } },
      { id: 'vf', seg: true, label: 'Biên độ', val: 'vf', opts: [{ v: 'vf', t: 'Tự theo tần số (V/f)' }, { v: 'man', t: 'Tự chọn' }] },
      { id: 'm', label: 'Hệ số điều chế m khi tự chọn', min: 0.1, max: 1, step: 0.05, val: 0.8, fmt: function (v) { return nf(v, 2); } },
      { id: 'fc', label: 'Tần số sóng tam giác (tần số băm)', min: 1.5, max: 8, step: 0.5, val: 3, fmt: function (v) { return nf(v, 1) + ' kHz'; } },
      { id: 'Vdc', label: 'Điện áp bus', min: 200, max: 340, step: 5, val: 310, fmt: function (v) { return nf(v, 0) + ' V'; } }
    ],
    draw: function (dv, d, idx) {
      var g = dv.g, w = dv.w, h = dv.h, col = K.col; if (!g || !d.sp) return; var sp = d.sp;
      g.clearRect(0, 0, w, h); g.fillStyle = col.ink; g.font = '600 11px sans-serif';
      var xl = [w * 0.16, w * 0.36, w * 0.56], names = ['U', 'V', 'W'], y1 = 26, yB = h - 22;
      g.strokeStyle = col.bad; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.05, y1); g.lineTo(w * 0.7, y1); g.stroke();
      g.strokeStyle = col.volt; g.beginPath(); g.moveTo(w * 0.05, yB); g.lineTo(w * 0.7, yB); g.stroke();
      g.fillStyle = col.bad; g.textAlign = 'left'; g.fillText('+ ' + nf(sp.Vdc, 0) + ' V', w * 0.05, y1 - 7); g.fillStyle = col.volt; g.fillText('0 V (mass, qua R100)', w * 0.05, yB + 14);
      var cx = w * 0.88, cy = h / 2;
      for (var x = 0; x < 3; x++) {
        var on = sp.gate[x][idx] > 0.5, X = xl[x], sw = 30, sh = 24, yt = y1 + 8, yb = yB - 8 - sh, ym = h / 2;
        g.strokeStyle = col.ink; g.lineWidth = 1.8; g.beginPath(); g.moveTo(X, y1); g.lineTo(X, yt); g.moveTo(X, yt + sh); g.lineTo(X, yb); g.moveTo(X, yb + sh); g.lineTo(X, yB); g.stroke();
        g.fillStyle = on ? col.amp : PALs(); g.fillRect(X - sw / 2, yt, sw, sh); g.strokeRect(X - sw / 2, yt, sw, sh);
        g.fillStyle = !on ? col.amp : PALs(); g.fillRect(X - sw / 2, yb, sw, sh); g.strokeRect(X - sw / 2, yb, sw, sh);
        g.fillStyle = col.ink; g.textAlign = 'center'; g.fillText(names[x] + '+', X, yt + 16); g.fillText(names[x] + '−', X, yb + 16);
        g.strokeStyle = on ? col.bad : col.volt; g.lineWidth = 2.4; g.beginPath(); g.moveTo(X, ym); g.lineTo(cx - 6 - (2 - x) * 0, ym + (x - 1) * 26 * 0); g.lineTo(cx, cy + (x - 1) * 30); g.stroke();
        g.fillStyle = col.ink; g.textAlign = 'left'; g.fillText(names[x], cx + 8, cy + (x - 1) * 30 + 4);
      }
      g.fillStyle = col.muted; g.textAlign = 'left'; g.font = '10.5px sans-serif'; g.fillText('3 cuộn dây máy nén', w * 0.7, h - 6);
      function PALs() { return K.PAL.surface; }
    },
    compute: function (p) {
      var s = spwmCompute(p), col = s.col;
      var d = {
        sp: s, xs: s.xs, xunit: 'ms',
        panels: [
          { title: 'Ba sóng sin chuẩn và sóng tam giác (xám)', unit: '', min: -1.2, max: 1.2, series: [{ n: 'U', c: col.volt, y: s.ref[0], f: function (v) { return nf(v, 2); } }, { n: 'V', c: col.amp, y: s.ref[1], f: function (v) { return nf(v, 2); } }, { n: 'W', c: col.ok, y: s.ref[2], f: function (v) { return nf(v, 2); } }, { n: 'tam giác', c: col.muted, y: s.car, w: 1, f: function (v) { return nf(v, 2); } }] },
          { title: 'Xung kích IGBT trên pha U', unit: '', min: -0.1, max: 1.3, series: [{ n: 'U+', c: col.volt, y: s.gate[0], w: 1.3, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }] },
          { title: 'Điện áp giữa dây U và V', unit: 'V', series: [{ n: 'Uuv', c: col.volt, y: s.vuv, w: 1, f: function (v) { return nf(v, 0) + ' V'; } }, { n: 'trung bình', c: col.bad, y: s.fund, w: 2, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Dòng ba pha trong cuộn dây', unit: 'A', series: [{ n: 'Iu', c: col.volt, y: s.cur[0], f: function (v) { return nf(v, 2); } }, { n: 'Iv', c: col.amp, y: s.cur[1], f: function (v) { return nf(v, 2); } }, { n: 'Iw', c: col.ok, y: s.cur[2], f: function (v) { return nf(v, 2); } }] }
        ]
      };
      var VL = 0.612 * s.m * s.Vdc;
      d.reads = [['Hệ số điều chế m', nf(s.m, 2)], ['Điện áp dây hiệu dụng', nf(VL, 0) + ' V'], ['Dòng hiệu dụng', nf(s.ir, 2) + ' A'], ['Tần số', nf(s.f, 0) + ' Hz']];
      d.msg = 'Điện áp dây hiệu dụng ≈ 0,612 × m × Vdc = 0,612 × ' + nf(s.m, 2) + ' × ' + nf(s.Vdc, 0) + ' = ' + nf(VL, 0) + ' V.\n' + (p.vf === 'vf' ? 'Chế độ V/f: tần số tăng thì biên độ tăng theo để từ thông động cơ không đổi. Tần số thấp mà biên độ lớn thì động cơ quá dòng.' : 'Chế độ tự chọn: biên độ độc lập với tần số.') + '\nSơ đồ trên cho thấy IGBT nào đang bật tại con trỏ: mỗi nhánh U, V, W chỉ có một IGBT bật cùng lúc.';
      return d;
    },
    tryit: ['Quan sát đường xanh lá "Uuv trung bình": dạng sin dù điện áp thật chỉ có ba mức +310, 0, −310 V.', 'Tăng tần số điện ra từ 30 lên 100 Hz: dòng đổi nhanh hơn, biên độ cũng tăng theo (V/f).', 'Hạ tần số tam giác xuống 1,5 kHz: dòng có gợn sóng rõ hơn, dây quấn rít to hơn.', 'Bật "Tự chọn", kéo m lên 1,0: điện áp dây lớn nhất mà bus cho phép.'],
    warn: 'Bo thật còn có thời gian chết giữa hai IGBT cùng nhánh (xem mô phỏng "Thời gian chết"). Tải trong mô phỏng là điện trở 3,5 Ω nối tiếp 20 mH cho mỗi pha, không có sức điện động ngược của động cơ.'
  });

  /* ================= BÀI 8: THỜI GIAN CHẾT ================= */
  K.build({
    id: 'deadtime', tab: 'Thời gian chết (dead time)', dur: 7,
    title: 'Thời gian chết: tránh hai IGBT cùng nhánh dẫn cùng lúc',
    lead: 'Khi đổi lệnh từ IGBT trên sang IGBT dưới, IGBT trên tắt chậm hơn lệnh. Nếu bật IGBT dưới ngay, hai con cùng dẫn trong khoảnh khắc và nối thẳng bus 310 V xuống mass. MCU chèn một khoảng chờ gọi là thời gian chết.',
    ctrls: [
      { id: 'td', label: 'Thời gian chết MCU chèn vào', min: 0, max: 4, step: 0.05, val: 1.5, fmt: function (v) { return nf(v, 2) + ' µs'; } },
      { id: 'toff', label: 'Độ trễ tắt thật của IGBT trên', min: 0.2, max: 2.5, step: 0.05, val: 0.8, fmt: function (v) { return nf(v, 2) + ' µs'; } },
      { id: 'ton', label: 'Độ trễ mở thật của IGBT dưới', min: 0.05, max: 0.6, step: 0.05, val: 0.2, fmt: function (v) { return nf(v, 2) + ' µs'; } },
      { id: 'I', label: 'Dòng tải', min: 1, max: 10, step: 0.5, val: 3, fmt: function (v) { return nf(v, 1) + ' A'; } }
    ],
    compute: function (p) {
      var col = K.col, N = 700, xs = K.lin(-1, 6, N), tf = 0.3, tr = 0.2, td = p.td, toff = p.toff, ton = p.ton, ts = td + ton;
      var gh = K.arr(N, function (i) { return xs[i] < 0 ? 1 : 0; }), gl = K.arr(N, function (i) { return xs[i] >= td ? 1 : 0; });
      var ah = K.arr(N, function (i) { var t = xs[i]; return t < toff ? 1 : 1 - clamp((t - toff) / tf, 0, 1); });
      var al = K.arr(N, function (i) { var t = xs[i]; return t < ts ? 0 : clamp((t - ts) / tr, 0, 1); });
      var Ish = K.arr(N, function (i) { return Math.min(ah[i], al[i]) * 8 * p.I; });
      var pk = 0, ov = 0; for (var i = 0; i < N; i++) { if (Ish[i] > pk) pk = Ish[i]; if (Ish[i] > 0.01) ov += 7 / (N - 1); }
      var need = Math.max(0, toff + tf - ton), err = td * 5e-3 * 310;
      var d = {
        xs: xs, xunit: 'µs (0 là lúc MCU ra lệnh tắt IGBT trên)',
        panels: [
          { title: 'Lệnh kích từ MCU', unit: '', min: -0.1, max: 1.3, series: [{ n: 'IGBT trên', c: col.volt, y: gh, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }, { n: 'IGBT dưới', c: col.amp, y: gl, f: function (v) { return v > 0.5 ? 'BẬT' : 'TẮT'; } }] },
          { title: 'Mức dẫn thật (1 là dẫn đủ)', unit: '', min: -0.05, max: 1.15, series: [{ n: 'trên', c: col.volt, y: ah, f: function (v) { return nf(v, 2); } }, { n: 'dưới', c: col.amp, y: al, f: function (v) { return nf(v, 2); } }] },
          { title: 'Dòng xuyên bus xuống mass', unit: 'A', min: 0, max: Math.max(5, 8 * p.I * 1.1), series: [{ n: 'Ixuyên', c: col.bad, y: Ish, fill: true, f: function (v) { return nf(v, 1) + ' A'; } }] }
        ]
      };
      d.reads = [['Thời gian chết cần tối thiểu', nf(need, 2) + ' µs'], ['Thời gian cùng dẫn', nf(ov * 1000, 0) + ' ns'], ['Dòng xuyên đỉnh', nf(pk, 1) + ' A'], ['Sai lệch điện áp ra do thời gian chết', nf(err, 1) + ' V']];
      d.msg = pk > 0.5 ? 'CÓ DÒNG XUYÊN: thời gian chết ' + nf(td, 2) + ' µs ngắn hơn mức cần (' + nf(need, 2) + ' µs), hai IGBT cùng dẫn và nối bus xuống mass. Nóng, nổ IGBT, cháy cầu chì.' : 'An toàn: thời gian chết đủ dài, không có lúc nào hai IGBT cùng dẫn.\nNhưng thời gian chết dài làm méo điện áp ra: sai lệch khoảng td × tần số băm × Vdc = ' + nf(err, 1) + ' V ở 5 kHz và 310 V.';
      return d;
    },
    tryit: ['Kéo thời gian chết về 0: dòng xuyên xuất hiện ngay.', 'Tăng độ trễ tắt của IGBT trên (IGBT cũ, nóng, tắt chậm): thời gian chết cần thiết tăng, mức cũ có thể không còn đủ.', 'Tăng thời gian chết thật dài: hết dòng xuyên nhưng sai lệch điện áp ra tăng.'],
    notes: 'Dòng xuyên trong mô phỏng là dạng minh họa (tỉ lệ 8 lần dòng tải), không phải tính từ đặc tính IGBT thật. Độ trễ tắt và mở là giá trị ví dụ.'
  });

  /* ================= BÀI 8: TRỞ SHUNT R100 ================= */
  K.build({
    id: 'shunt', tab: 'Trở shunt R100 đo dòng', dur: 8,
    title: 'Trở shunt: đo dòng máy nén bằng độ sụt áp',
    lead: 'Dòng điện chạy qua trở rất nhỏ (0,1 Ω) tạo ra độ sụt áp nhỏ tỉ lệ với dòng (V = I × R). Mạch khuếch đại nâng điện áp đó lên mức MCU đọc được. Dòng vượt ngưỡng thì MCU tắt PWM để bảo vệ IGBT.',
    svg: S.open(360, 100, 'Dòng từ IGBT dưới chảy qua trở shunt R100 xuống mass, điện áp hai đầu đưa vào khuếch đại rồi MCU') + S.T(10, 20, 'từ IGBT dưới', 'sk-m') + S.L(14, 30, 90, 30) + S.dot(90, 30) + S.R(90, 30, 70, false, 'sk-a') + S.dot(160, 30) + S.L(160, 30, 200, 30) + S.gnd(200, 30) + S.T(112, 20, 'R100 = 0,1 Ω', 'sk-t') +
      S.L(90, 30, 90, 70) + S.L(160, 30, 160, 70) + S.L(90, 70, 130, 70) + S.L(160, 70, 130, 70) + '<path d="M240 52L240 88L280 70Z" class="sk-f"/>' + S.L(160, 62, 240, 62) + S.L(90, 78, 240, 78) + S.T(250, 74, 'KĐ', 'sk-m') + S.L(280, 70, 320, 70) + S.T(322, 74, 'MCU', 'sk-t') + S.close,
    ctrls: [
      { id: 'I', label: 'Biên độ dòng bình thường', min: 0.5, max: 6, step: 0.1, val: 2, fmt: function (v) { return nf(v, 1) + ' A'; } },
      { id: 'R', label: 'Điện trở shunt', min: 0.02, max: 0.5, val: 0.1, log: true, fmt: function (v) { return nf(v, 3) + ' Ω'; } },
      { id: 'gain', label: 'Hệ số khuếch đại', min: 1, max: 20, step: 0.5, val: 2, fmt: function (v) { return nf(v, 1) + ' lần'; } },
      { id: 'trip', label: 'Ngưỡng bảo vệ quá dòng (phần mềm)', min: 3, max: 15, step: 0.5, val: 6, fmt: function (v) { return nf(v, 1) + ' A'; } },
      { id: 'st', seg: true, label: 'Tình huống', val: 'ok', opts: [{ v: 'ok', t: 'Chạy bình thường' }, { v: 'stall', t: 'Kẹt cơ (stall)' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 800, dt = 40e-3 / N, xs = K.arr(N, function (i) { return i * dt * 1000; }), cur = K.arr(N, 0), tripped = false, tt = -1, ic = 0, i;
      for (i = 0; i < N; i++) {
        var t = i * dt, A = p.I * (p.st === 'stall' && t > 0.01 ? 1 + 2.5 * (1 - Math.exp(-(t - 0.01) / 0.004)) : 1), want = A * Math.sin(TAU * 50 * t);
        if (!tripped && Math.abs(want) > p.trip) { tripped = true; tt = t * 1000; }
        if (tripped) ic = ic * Math.exp(-dt / 0.0008); else ic = want;
        cur[i] = ic;
      }
      var vsh = K.arr(N, function (i) { return cur[i] * p.R * 1000; });
      var adc = K.arr(N, function (i) { return clamp(1.65 + p.gain * cur[i] * p.R, 0, 3.3); });
      var imax = 1.65 / (p.gain * p.R), clip = imax < p.trip;
      var d = {
        xs: xs, xunit: 'ms',
        panels: [
          { title: 'Dòng chạy qua shunt', unit: 'A', hlines: [{ y: p.trip, t: 'ngưỡng bảo vệ', c: col.bad }, { y: -p.trip, t: '', c: col.bad }], series: [{ n: 'I', c: col.amp, y: cur, f: function (v) { return nf(v, 2) + ' A'; } }] },
          { title: 'Điện áp hai đầu shunt (V = I × R)', unit: 'mV', series: [{ n: 'Vsh', c: col.volt, y: vsh, f: function (v) { return nf(v, 0) + ' mV'; } }] },
          { title: 'Điện áp MCU đọc được sau khuếch đại', unit: 'V', min: -0.2, max: 3.5, hlines: [{ y: 3.3, t: 'tối đa 3,3 V', c: col.bad }, { y: 0, t: '0 V', c: col.bad }], series: [{ n: 'ADC', c: col.ok, y: adc, f: function (v) { return nf(v, 2) + ' V'; } }] }
        ]
      };
      d.reads = [['Công suất tỏa trên shunt', nf(Math.pow(p.I / Math.SQRT2, 2) * p.R, 2) + ' W'], ['Dòng đo được tối đa', nf(imax, 1) + ' A'], ['Điện áp shunt ở ngưỡng', nf(p.trip * p.R * 1000, 0) + ' mV'], ['Thời điểm cắt bảo vệ', tt >= 0 ? nf(tt, 1) + ' ms' : 'chưa cắt']];
      d.msg = 'V = I × R = ' + nf(p.I, 1) + ' × ' + nf(p.R, 3) + ' = ' + nf(p.I * p.R * 1000, 0) + ' mV ở biên độ bình thường. MCU thấy điện áp quanh 1,65 V (giữa thang), cộng thêm hệ số khuếch đại.' +
        (clip ? '\nHệ số khuếch đại quá lớn: ADC đã bão hòa ở 0 V hoặc 3,3 V trước khi dòng chạm ngưỡng bảo vệ (' + nf(imax, 1) + ' A so với ' + nf(p.trip, 1) + ' A). MCU không thể thấy dòng thật, bảo vệ vô hiệu.' : '') +
        (p.st === 'stall' ? (tripped ? '\nKẹt cơ: dòng tăng dần, chạm ngưỡng lúc ' + nf(tt, 1) + ' ms, MCU tắt PWM, dòng về 0.' : '\nKẹt cơ: dòng tăng nhưng chưa chạm ngưỡng bảo vệ, cuộn dây có thể quá nhiệt.') : '');
      return d;
    },
    tryit: ['Chọn "Kẹt cơ": dòng tăng cho đến khi chạm ngưỡng, MCU cắt.', 'Tăng điện trở shunt lên 0,5 Ω: tín hiệu lớn hơn, nhưng công suất tỏa nhiệt tăng.', 'Tăng khuếch đại lên 20: ADC bão hòa, bảo vệ không thấy dòng thật.', 'Đo shunt bằng đồng hồ thường khó: 0,1 Ω nhỏ hơn cả điện trở dây que đo, cần để que sát hai đầu.'],
    notes: 'Mô hình đo dòng tại nhánh mass, bỏ qua việc dòng trong shunt thật là các xung theo kiểu băm. Điểm giữa thang 1,65 V và ngưỡng bảo vệ là giả định. Công suất tính theo giá trị hiệu dụng của dòng hình sin.'
  });

  /* ================= BÀI 8: CHIA ÁP BUS ================= */
  K.build({
    id: 'chiaap', tab: 'Chia áp bus 300 V về MCU', dur: 10,
    title: 'Cầu chia áp lấy mẫu bus 300 V (các trở 680 kΩ)',
    lead: 'MCU chỉ chịu được 3,3 V nên không thể nối thẳng vào bus 310 V. Chuỗi trở 680 kΩ nối tiếp hạ điện áp xuống vài vôn. Dùng nhiều trở nối tiếp để mỗi trở chỉ chịu một phần điện áp. Hỏng một trở là MCU đọc sai và báo lỗi áp.',
    svg: S.open(360, 130, 'Bốn trở 680 kΩ nối tiếp từ bus xuống một trở nhỏ, điểm giữa nối vào ADC của MCU') +
      S.T(8, 16, 'Bus 310 V', 'sk-t') + S.L(60, 12, 60, 18) + S.R(60, 18, 22, true) + S.R(60, 40, 22, true) + S.R(60, 62, 22, true) + S.R(60, 84, 22, true) + S.dot(60, 106) + S.L(60, 106, 60, 112) + S.R(60, 112, 14, true) + S.gnd(60, 126) +
      S.T(76, 32, 'R78, R79, R80, R82: 680 kΩ mỗi trở', 'sk-m') + S.L(60, 106, 200, 106) + S.T(206, 100, 'về ADC (tối đa 3,3 V)', 'sk-t') + S.T(76, 124, 'trở dưới (giá trị chưa biết, giả định)', 'sk-m') + S.close,
    ctrls: [
      { id: 'Rb', label: 'Trở dưới (giả định)', min: 5, max: 60, val: 18, log: true, fmt: function (v) { return nf(v, 1) + ' kΩ'; } },
      { id: 'fault', seg: true, label: 'Sự cố', val: 'none', opts: [{ v: 'none', t: 'Bình thường' }, { v: 'open', t: 'Một trở trên hở' }, { v: 'short', t: 'Một trở trên chập' }, { v: 'rbo', t: 'Trở dưới hở' }] }
    ],
    compute: function (p) {
      var col = K.col, N = 451, xs = K.arr(N, function (i) { return i; }), Rt = 2720, Rb = p.Rb;
      function adc(v) {
        if (p.fault === 'open') return 0;
        if (p.fault === 'rbo') return v > 3 ? 3.3 : v * 0.5;
        var rt = p.fault === 'short' ? 2040 : Rt; return Math.min(3.3, v * Rb / (rt + Rb));
      }
      var a = K.arr(N, function (i) { return adc(xs[i]); });
      var per = K.arr(N, function (i) { return p.fault === 'none' ? xs[i] / 4 : p.fault === 'short' ? xs[i] / 3 : p.fault === 'open' ? xs[i] : 0; });
      var pw = K.arr(N, function (i) { return xs[i] * xs[i] / (p.fault === 'short' ? 2040 : Rt) * 1000 / 1000; });
      var uv = 200, ov = 380;
      var d = {
        xs: xs, xunit: 'V (điện áp bus thật)',
        panels: [
          { title: 'Điện áp MCU đọc được', unit: 'V', min: 0, max: 3.6, hlines: [{ y: adc(uv), t: 'ngưỡng báo thấp áp', c: col.amp }, { y: Math.min(3.3, adc(ov)), t: 'ngưỡng quá áp', c: col.amp }], series: [{ n: 'ADC', c: col.volt, y: a, f: function (v) { return nf(v, 2) + ' V'; } }] },
          { title: 'Điện áp trên mỗi trở 680 kΩ', unit: 'V', min: 0, series: [{ n: 'mỗi trở', c: col.amp, y: per, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Công suất tỏa trên chuỗi trở trên', unit: 'mW', min: 0, series: [{ n: 'P', c: col.ok, y: pw, f: function (v) { return nf(v, 0) + ' mW'; } }] }
        ]
      };
      var ratio = 310 * Rb / (Rt + Rb);
      d.reads = [['MCU đọc khi bus 310 V', nf(adc(310), 2) + ' V'], ['Mỗi trở chịu', nf(310 / 4, 0) + ' V'], ['Công suất chuỗi', nf(310 * 310 / Rt, 0) + ' mW'], ['Hệ số chia', '1 : ' + nf((Rt + Rb) / Rb, 0)]];
      d.msg = 'Điện áp ADC = Vbus × Rdưới ÷ (4 × 680 kΩ + Rdưới) = 310 × ' + nf(Rb, 1) + ' ÷ (2720 + ' + nf(Rb, 1) + ') = ' + nf(ratio, 2) + ' V.\n' +
        (p.fault === 'open' ? 'Một trở hở: không có điện áp tới ADC, MCU đọc 0 V và báo thấp áp dù bus bình thường.' : p.fault === 'short' ? 'Một trở chập: chỉ còn 3 trở trên, ADC đọc cao hơn khoảng 33%, MCU tưởng bus quá cao và báo quá áp.' : p.fault === 'rbo' ? 'Trở dưới hở: chân ADC mất đường về mass, điện áp vọt cao, MCU báo quá áp (hoặc hỏng chân MCU).' : 'Dùng 4 trở nối tiếp để mỗi trở chỉ chịu khoảng 78 V (trở dán nhỏ chịu áp không cao).');
      return d;
    },
    tryit: ['Chọn từng sự cố và so sánh điện áp MCU đọc được với bình thường.', 'Đổi trở dưới: xem điện áp ADC thay đổi như thế nào ở 310 V.', 'Quan sát công suất tỏa chỉ khoảng 35 mW: vì thế phải dùng trở rất lớn.'],
    notes: 'Bốn trở 680 kΩ theo tài liệu. Giá trị trở dưới và các ngưỡng 200 V, 380 V là giả định để minh họa. Hãy đo trở trên bo thật khi sửa chữa.'
  });

  /* ================= BÀI 8: GAI ĐIỆN ÁP VÀ SNUBBER ================= */
  K.build({
    id: 'snub', tab: 'Gai điện áp + tụ snubber', dur: 8,
    title: 'Gai điện áp khi IGBT tắt và tụ snubber 104K 630 V',
    lead: 'Dây dẫn có điện cảm rất nhỏ nhưng khi dòng lớn bị cắt trong vài chục nano giây, điện cảm tạo ra gai điện áp V = L × dI/dt cộng lên bus. Gai quá cao làm hỏng IGBT và phát nhiễu. Tụ snubber đặt gần IGBT hấp thụ năng lượng này.',
    ctrls: [
      { id: 'L', label: 'Điện cảm ký sinh của dây dẫn', min: 10, max: 300, val: 150, log: true, fmt: function (v) { return nf(v, 0) + ' nH'; } },
      { id: 'I', label: 'Dòng bị cắt', min: 1, max: 30, step: 0.5, val: 15, fmt: function (v) { return nf(v, 1) + ' A'; } },
      { id: 'tf', label: 'Thời gian dòng giảm về 0', min: 10, max: 400, val: 30, log: true, fmt: function (v) { return nf(v, 0) + ' ns'; } },
      { id: 'Cs', label: 'Tụ snubber', min: 1, max: 100, val: 1, log: true, zero: true, fmt: function (v) { return v === 0 ? 'không có' : nf(v, 1) + ' nF'; } },
      { id: 'Rd', label: 'Điện trở tổn hao mạch vòng', min: 0.5, max: 20, val: 3, log: true, fmt: function (v) { return nf(v, 1) + ' Ω'; } }
    ],
    compute: function (p) {
      var col = K.col, Vb = 310, L = p.L * 1e-9, C = 50e-12 + p.Cs * 1e-9, I = p.I, tf = p.tf * 1e-9, w0 = 1 / Math.sqrt(L * C), f0 = w0 / TAU, z = clamp(p.Rd / 2 * Math.sqrt(C / L), 0.02, 0.95), wd = w0 * Math.sqrt(1 - z * z);
      var dvL = L * I / tf, dvE = I * Math.sqrt(L / C), dv = Math.min(dvL, dvE);
      var win = clamp(4 / f0 + tf, 400e-9, 4e-6), N = 1200, xs = K.arr(N, function (i) { return (-0.1 * win + 1.1 * win * i / (N - 1)) * 1e9; });
      var vce = K.arr(N, function (i) { var t = xs[i] * 1e-9; if (t < 0) return 2; if (t < tf) return 2 + (Vb - 2) * t / tf; var u = t - tf; return Vb + dv * Math.exp(-z * w0 * u) * Math.sin(wd * u); });
      var ic = K.arr(N, function (i) { var t = xs[i] * 1e-9; return t < 0 ? I : t < tf ? I * (1 - t / tf) : 0; });
      var pk = Math.max.apply(null, vce);
      var d = {
        xs: xs, xunit: 'ns (0 là lúc IGBT bắt đầu tắt)',
        panels: [
          { title: 'Điện áp trên IGBT (Vce)', unit: 'V', min: 0, max: Math.max(700, pk * 1.08), hlines: [{ y: Vb, t: 'bus 310 V', c: col.ok }, { y: 600, t: 'chịu áp 600 V (ví dụ)', c: col.bad }], series: [{ n: 'Vce', c: col.bad, y: vce, f: function (v) { return nf(v, 0) + ' V'; } }] },
          { title: 'Dòng qua IGBT', unit: 'A', min: 0, series: [{ n: 'Ic', c: col.amp, y: ic, f: function (v) { return nf(v, 2) + ' A'; } }] }
        ]
      };
      d.reads = [['Gai cộng thêm', nf(dv, 0) + ' V'], ['Đỉnh Vce', nf(pk, 0) + ' V'], ['Tần số dao động', nf(f0 / 1e6, 1) + ' MHz'], ['Năng lượng ½LI²', nf(0.5 * L * I * I * 1e6, 2) + ' µJ']];
      d.msg = 'Gai theo điện cảm: L × I ÷ tf = ' + nf(p.L, 0) + ' nH × ' + nf(I, 1) + ' A ÷ ' + nf(p.tf, 0) + ' ns = ' + nf(dvL, 0) + ' V. Gai bị chặn bởi năng lượng nạp vào tụ: I × √(L ÷ C) = ' + nf(dvE, 0) + ' V. Lấy giá trị nhỏ hơn: ' + nf(dv, 0) + ' V.\n' + (pk > 600 ? 'ĐỈNH VƯỢT 600 V: IGBT có nguy cơ hỏng. Giảm điện cảm (đi dây ngắn), kéo dài thời gian tắt hoặc thêm tụ snubber.' : 'Đỉnh còn trong giới hạn.') + '\nDao động có tần số vài MHz đến vài chục MHz chính là nguồn nhiễu cao tần mà tụ X, tụ Y và cuộn chống nhiễu phải lọc.';
      return d;
    },
    tryit: ['Giữ tụ snubber = không có, tăng dòng lên 30 A hoặc điện cảm lên 300 nH: gai tăng, đỉnh có thể vượt 600 V.', 'Thêm tụ snubber 10 nF: gai hạ mạnh và tần số dao động giảm.', 'Kéo dài thời gian tắt (tf lớn): gai thấp hơn nhưng IGBT tắt chậm sẽ nóng hơn (tổn hao chuyển mạch).'],
    notes: 'Công thức gần đúng. Điện dung ký sinh của IGBT lấy 50 pF, mức chịu áp 600 V là ví dụ vì loại IGBT thật trên bo chưa đọc được mã. Tụ 104K 630P trên bo là 0,1 µF 630 V, lớn hơn nhiều so với giá trị ở thanh trượt.'
  });
})();
