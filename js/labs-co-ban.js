/* 21/10/2026: mô phỏng cho Bài 11 (tiền tố), Bài 12 (VOM, ampe kìm), Bài 13 (điện xoay chiều).
   Số liệu tải (quạt, máy nén) là ví dụ minh họa, không phải số đo của một máy cụ thể. */
(function () {
  'use strict';
  var K = window.LabKit;
  if (!K) return;
  var nf = K.nf, clamp = K.clamp, TAU = 2 * Math.PI;
  function tx(g, s, x, y, c, f, a) { g.fillStyle = c; g.font = f; g.textAlign = a || 'left'; g.fillText(s, x, y); }
  function ln(g, x1, y1, x2, y2, c, w) { g.strokeStyle = c; g.lineWidth = w || 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function num(v, d) { return nf(v, d).replace('.', ','); }

  /* ===== Bài 11: tiền tố đơn vị ===== */
  K.build({
    id: 'tiento', tab: 'Tiền tố: kΩ, mA, µF', dur: 10,
    title: 'Tiền tố đơn vị: đổi Ω, kΩ, MΩ và A, mA, µA',
    lead: 'Điện trở càng lớn thì dòng càng nhỏ. Kéo thanh trượt điện trở và nhìn cùng một giá trị được viết bằng các đơn vị khác nhau. Mẹo cần nhớ: điện áp (V) chia điện trở (kΩ) cho ra dòng điện (mA).',
    ctrls: [
      { id: 'V', label: 'Điện áp', min: 1, max: 24, step: 0.5, val: 12, fmt: function (v) { return num(v, 1) + ' V'; } },
      { id: 'R', label: 'Điện trở R', min: 0.1, max: 10000, val: 2.2, log: true, fmt: function (v) { return v >= 1000 ? num(v / 1000, 2) + ' MΩ' : v >= 1 ? num(v, 2) + ' kΩ' : num(v * 1000, 0) + ' Ω'; } }
    ],
    compute: function (p) {
      var col = K.col, N = 241, xs = K.arr(N, function (i) { return -1 + 2 * i / (N - 1); });
      var I = K.arr(N, function (i) { return p.V / Math.pow(10, xs[i]); });
      var Ik = p.V / p.R, Rk = p.R, Ia = Ik / 1000;
      var d = {
        xs: xs, xunit: 'điện trở R (thang chia theo hệ số 10)',
        xticks: [{ v: -1, t: '0,1 kΩ' }, { v: -0.5, t: '0,3' }, { v: 0, t: '1 kΩ' }, { v: 0.5, t: '3' }, { v: 1, t: '10 kΩ' }],
        panels: [{ title: 'Dòng điện theo điện trở (V ÷ R)', unit: 'mA', min: 0, max: Math.max(5, p.V / 0.1 * 1.05), hlines: [{ y: Ik, t: 'điểm bạn chọn: ' + (Ik >= 1 ? num(Ik, 2) + ' mA' : num(Ik * 1000, 1) + ' µA'), c: col.bad }], series: [{ n: 'I', c: col.amp, y: I, f: function (v) { return num(v, 2) + ' mA'; } }] }]
      };
      if (Rk >= 0.1 && Rk <= 10) d.panels[0].shade = [{ x0: Math.log10(Rk) - 0.012, x1: Math.log10(Rk) + 0.012, c: col.bad }];
      d.reads = [
        ['R theo Ω', num(Rk * 1000, Rk * 1000 < 10 ? 2 : 0) + ' Ω'],
        ['R theo kΩ', num(Rk, 3) + ' kΩ'],
        ['R theo MΩ', num(Rk / 1000, 5) + ' MΩ'],
        ['I theo A', num(Ia, 6) + ' A'],
        ['I theo mA', num(Ik, 3) + ' mA'],
        ['I theo µA', num(Ik * 1000, 1) + ' µA']
      ];
      d.msg = 'I = V ÷ R = ' + num(p.V, 1) + ' V ÷ ' + num(Rk, 3) + ' kΩ = ' + num(Ik, 3) + ' mA.\nNhớ: V ÷ kΩ = mA. Muốn ra ampe thì chia thêm 1000.\n' + (Rk < 1 ? 'Điện trở dưới 1 kΩ: dòng đã vượt vài chục mA.' : Rk > 1000 ? 'Điện trở hàng MΩ: dòng chỉ cỡ µA, rất nhỏ.' : 'Đồ thị ở trên: mỗi lần điện trở tăng 10 lần thì dòng giảm 10 lần.');
      return d;
    },
    tryit: ['Đặt 12 V và 2,2 kΩ: dòng khoảng 5,45 mA. So với đáp án Bài 11 câu 4.', 'Kéo R lên 2,2 MΩ: dòng chỉ còn vài µA.', 'Kéo R xuống vài trăm Ω: dòng lên hàng chục mA.', 'Đọc ba dòng đầu của bảng: R theo Ω, kΩ, MΩ, cùng một giá trị nhưng cách viết khác nhau.'],
    notes: 'Chữ M hoa là mêga (triệu), chữ m thường là mi-li (một phần nghìn). Khác nhau 10⁹ lần, đừng nhầm.'
  });

  /* ===== Bài 12: VOM đo điện áp và dòng ===== */
  var VOM_MODES = {
    v2: { short: 'V trên R2', name: 'Đo điện áp trên R2 (song song, thang DC)', unit: 'V' },
    v1: { short: 'V trên R1', name: 'Đo điện áp trên R1 (song song, thang DC)', unit: 'V' },
    i10: { short: 'Dòng, cổng 10 A', name: 'Đo dòng, nối tiếp, que đỏ cổng 10 A', unit: 'mA' },
    ima: { short: 'Dòng, cổng mA', name: 'Đo dòng, nối tiếp, que đỏ cổng mA', unit: 'mA' },
    dcac: { short: 'Sai: thang AC', name: 'SAI: đo điện áp DC bằng thang AC', unit: 'V' },
    par: { short: 'Sai: song song', name: 'SAI: đo dòng nhưng mắc song song R2', unit: 'mA' },
    src: { short: 'Sai: lên nguồn', name: 'SAI: que đỏ còn ở cổng mA, đặt lên hai đầu nguồn', unit: 'A' }
  };
  K.build({
    id: 'vom', tab: 'VOM đo điện áp, dòng', dur: 8, dratio: 0.62,
    title: 'VOM đo điện áp và dòng trên mạch R1 20 Ω nối tiếp R2 30 Ω',
    lead: 'Chọn một cách đo, xem đồng hồ được mắc vào đâu và hiện số nào. Ba cách đo SAI cuối danh sách cho thấy vì sao lại thổi cầu chì hoặc đo sai. Mạch: nguồn 12 V DC, R1 = 20 Ω, R2 = 30 Ω, dòng 240 mA.',
    dlabel: 'Sơ đồ mạch với đồng hồ đo',
    ctrls: [
      { id: 'm', seg: true, label: 'Cách đo', val: 'v2', opts: [{ v: 'v2', t: 'V trên R2' }, { v: 'v1', t: 'V trên R1' }, { v: 'i10', t: 'Dòng, cổng 10 A' }, { v: 'ima', t: 'Dòng, cổng mA' }, { v: 'dcac', t: 'SAI: thang AC' }, { v: 'par', t: 'SAI: dòng mắc song song' }, { v: 'src', t: 'SAI: cổng dòng lên nguồn' }] },
      { id: 'lim', seg: true, label: 'Giới hạn của cổng mA trên đồng hồ (xem nhãn trên máy)', val: '200', opts: [{ v: '200', t: '200 mA' }, { v: '500', t: '500 mA' }] }
    ],
    draw: function (dv, d) {
      var g = dv.g, w = dv.w, h = dv.h, col = K.col, m = d.m; if (!g) return;
      g.clearRect(0, 0, w, h);
      var x0 = w * 0.2, x1 = w * 0.72, y0 = h * 0.22, y1 = h * 0.8, ink = col.ink;
      ln(g, x0, y0, w * 0.3, y0, ink, 2.4);
      // R1 (ngang)
      g.strokeStyle = col.volt; g.lineWidth = 2.4; g.strokeRect(w * 0.3, y0 - 9, w * 0.2, 18); tx(g, 'R1 20 Ω', w * 0.4, y0 - 15, col.volt, '600 12px sans-serif', 'center');
      ln(g, w * 0.5, y0, x1, y0, ink, 2.4);
      // R2 (dọc)
      ln(g, x1, y0, x1, h * 0.38, ink, 2.4); g.strokeStyle = col.volt; g.strokeRect(x1 - 9, h * 0.38, 18, h * 0.24); tx(g, 'R2 30 Ω', x1 - 16, h * 0.5 + 4, col.volt, '600 12px sans-serif', 'right');
      ln(g, x1, h * 0.62, x1, y1, ink, 2.4); ln(g, x1, y1, x0, y1, ink, 2.4);
      // nguồn
      ln(g, x0, y1, x0, h * 0.58, ink, 2.4); ln(g, x0 - 14, h * 0.58, x0 + 14, h * 0.58, ink, 4); ln(g, x0 - 8, h * 0.5, x0 + 8, h * 0.5, ink, 2); ln(g, x0, h * 0.5, x0, y0, ink, 2.4);
      tx(g, '12 V', x0 + 20, h * 0.66, ink, '600 12px sans-serif'); tx(g, '+', x0 + 12, h * 0.5 - 4, col.bad, '700 14px sans-serif');
      function meter(cx, cy, s, c) { g.fillStyle = K.PAL.surface; g.strokeStyle = c; g.lineWidth = 2.6; g.beginPath(); g.arc(cx, cy, 15, 0, TAU); g.fill(); g.stroke(); tx(g, s, cx, cy + 5, c, '700 14px sans-serif', 'center'); }
      var bad = m === 'dcac' || m === 'par' || m === 'src', c = bad ? col.bad : col.ok;
      if (m === 'v2' || m === 'dcac') { ln(g, x1, h * 0.38, x1 + 30, h * 0.38, c, 2); ln(g, x1, h * 0.62, x1 + 30, h * 0.62, c, 2); ln(g, x1 + 30, h * 0.38, x1 + 30, h * 0.47, c, 2); ln(g, x1 + 30, h * 0.53, x1 + 30, h * 0.62, c, 2); meter(x1 + 30, h * 0.5, m === 'dcac' ? 'V~' : 'V', c); }
      if (m === 'v1') { ln(g, w * 0.3, y0 - 2, w * 0.3, y0 - 38, c, 2); ln(g, w * 0.5, y0 - 2, w * 0.5, y0 - 38, c, 2); ln(g, w * 0.3, y0 - 38, w * 0.4 - 15, y0 - 38, c, 2); ln(g, w * 0.4 + 15, y0 - 38, w * 0.5, y0 - 38, c, 2); meter(w * 0.4, y0 - 38, 'V', c); }
      if (m === 'i10' || m === 'ima') { g.fillStyle = K.PAL.surface; g.fillRect(w * 0.18, y0 - 6, 34, 12); meter(w * 0.26 + 0, y0, 'A', c); }
      if (m === 'par') { ln(g, x1, h * 0.38, x1 + 30, h * 0.38, c, 2); ln(g, x1, h * 0.62, x1 + 30, h * 0.62, c, 2); ln(g, x1 + 30, h * 0.38, x1 + 30, h * 0.47, c, 2); ln(g, x1 + 30, h * 0.53, x1 + 30, h * 0.62, c, 2); meter(x1 + 30, h * 0.5, 'A', c); }
      if (m === 'src') { ln(g, x0, h * 0.5, x0 - 36, h * 0.5, c, 2); ln(g, x0, h * 0.58, x0 - 36, h * 0.58, c, 2); ln(g, x0 - 36, h * 0.5, x0 - 36, h * 0.51, c, 2); ln(g, x0 - 36, h * 0.57, x0 - 36, h * 0.58, c, 2); meter(x0 - 36, h * 0.545, 'A', c); }
      tx(g, d.where, w / 2, h - 6, col.muted, '11px sans-serif', 'center');
    },
    compute: function (p) {
      var col = K.col, N = 200, xs = K.arr(N, function (i) { return 2 * i / (N - 1); }), m = p.m, lim = +p.lim;
      var vs = 12, r1 = 20, r2 = 30, itot = vs / (r1 + r2) * 1000;
      var blow = false, tb = 0.5, shown, unit = VOM_MODES[m].unit, msg, panelUnit, series, fuseY = null;
      var disp = K.arr(N, 0), cur = K.arr(N, 0);
      var where = '';
      if (m === 'v2') { shown = vs * r2 / (r1 + r2); msg = 'Song song với R2 trên thang DC: đọc ' + num(shown, 2) + ' V. Không cần cắt mạch. Điện áp trên R1 là ' + num(vs - shown, 2) + ' V, cộng lại đúng 12 V.'; where = 'Đồng hồ mắc song song hai đầu R2'; }
      if (m === 'v1') { shown = vs * r1 / (r1 + r2); msg = 'Song song với R1: đọc ' + num(shown, 2) + ' V. Điện áp mỗi điện trở tỉ lệ với giá trị điện trở trong mạch nối tiếp.'; where = 'Đồng hồ mắc song song hai đầu R1'; }
      if (m === 'i10') { shown = itot; msg = 'Nối tiếp, cắt mạch tại D, đọc ' + num(shown, 0) + ' mA (0,24 A). Cổng 10 A đọc được nhưng độ phân giải thô với dòng nhỏ như thế này.'; where = 'Đồng hồ nối tiếp trong mạch'; }
      if (m === 'ima') {
        if (itot > lim) { blow = true; shown = 0; msg = 'Dòng ' + num(itot, 0) + ' mA vượt giới hạn cổng mA ' + lim + ' mA: cầu chì cổng này đứt, đồng hồ hết đo dòng. Phải dùng cổng 10 A khi dòng có thể lớn hơn giới hạn, hoặc không chắc chắn.'; }
        else { shown = itot; msg = 'Dòng ' + num(itot, 0) + ' mA nằm trong giới hạn ' + lim + ' mA nên cổng mA đọc được: ' + num(shown, 0) + ' mA.'; }
        where = 'Đồng hồ nối tiếp, que đỏ cổng mA';
      }
      if (m === 'dcac') { shown = 0; msg = 'Chọn thang AC để đo nguồn DC: đồng hồ coi điện áp không đổi là "không dao động", thường hiện 0 V hoặc số nhảy lung tung. Nguồn pin, 12 V, 5 V, bus sau cầu chỉnh lưu đều phải dùng thang DC.'; where = 'Đồng hồ ở thang AC'; }
      if (m === 'par') {
        var ip = vs / (r1 + 0.1) * 1000;
        if (ip > lim) { blow = true; shown = 0; msg = 'Mắc đồng hồ đo dòng song song R2: đồng hồ như dây dẫn, R2 bị chập, dòng vọt lên ' + num(ip, 0) + ' mA, vượt giới hạn cổng mA ' + lim + ' mA và cầu chì đứt.'; }
        else { shown = ip; msg = 'Mắc đồng hồ đo dòng song song R2: R2 bị chập, mạch chỉ còn R1, dòng đọc ' + num(ip, 0) + ' mA, khác hẳn dòng thật 240 mA. Số đo sai và mạch bị đổi.'; }
        where = 'SAI: đồng hồ đo dòng mắc song song';
      }
      if (m === 'src') { blow = true; shown = 0; msg = 'Que đỏ còn ở cổng dòng, đặt lên hai đầu nguồn như đo điện áp: nguồn bị nối qua điện trở rất nhỏ của đồng hồ, dòng cực lớn (hàng chục ampe) thổi cầu chì đồng hồ ngay. Sau khi đo dòng phải đưa que đỏ về cổng V.'; where = 'SAI: cổng dòng nối thẳng hai đầu nguồn'; }
      var fu = (m === 'ima' || m === 'par' || m === 'src');
      var peak = m === 'src' ? 120 : m === 'par' ? vs / (r1 + 0.1) : itot / 1000;
      for (var i = 0; i < N; i++) {
        var t = xs[i], after = blow && t >= tb;
        disp[i] = blow ? (t < tb ? (m === 'src' ? 0 : peak * (unit === 'mA' ? 1000 : 1)) : 0) : shown * (m === 'src' ? 0 : 1);
        if (m === 'v2' || m === 'v1') disp[i] = shown;
        cur[i] = fu ? (blow ? (t < tb ? (t > tb - 0.04 ? peak : 0) : 0) : peak) : itot / 1000;
        if (m === 'dcac') disp[i] = 0;
      }
      if (blow) for (var j = 0; j < N; j++) { cur[j] = xs[j] >= tb - 0.03 && xs[j] < tb ? (m === 'src' ? 120 : peak) : (xs[j] < tb - 0.03 ? (m === 'src' ? 0.24 : peak) : 0); if (m !== 'src' && xs[j] < tb - 0.03) cur[j] = peak; }
      var d = {
        m: m, where: where, xs: xs, xunit: 's',
        panels: [
          { title: 'Số hiện trên đồng hồ', unit: unit, min: 0, max: unit === 'V' ? 14 : unit === 'A' ? 1 : Math.max(300, (m === 'par' ? 700 : 300)), series: [{ n: 'số đo', c: col.ok, y: disp, f: function (v) { return num(v, unit === 'V' ? 2 : 0) + ' ' + unit; } }] },
          { title: 'Dòng qua cầu chì của đồng hồ', unit: 'A', min: 0, max: 1, hlines: [{ y: lim / 1000, t: 'giới hạn cổng mA ' + lim + ' mA', c: col.bad }], series: [{ n: 'I', c: col.amp, y: fu ? cur : K.arr(N, 0), f: function (v) { return num(v, 2) + ' A'; } }] }
        ]
      };
      d.reads = [['Cách đo', VOM_MODES[m].short], ['Số đọc được', blow ? 'cầu chì đứt, không đọc' : num(shown, unit === 'V' ? 2 : 0) + ' ' + unit], ['Dòng thật trong mạch', '240 mA'], ['Mạch có bị đổi không', (m === 'par') ? 'Có: R2 bị chập' : 'Không']];
      d.msg = msg;
      return d;
    },
    tryit: ['Chọn "Dòng, cổng mA" với giới hạn 200 mA: dòng 240 mA vượt giới hạn nên cầu chì đứt. Đổi sang 500 mA thì đọc được.', 'Chọn "SAI: cổng dòng lên nguồn": dòng hàng chục ampe, cầu chì đứt.', 'Chọn "V trên R2" rồi "V trên R1": cộng hai số lại bằng đúng 12 V.', 'Chọn "SAI: thang AC": đồng hồ không đọc được điện áp một chiều.'],
    notes: 'Điện trở trong của đồng hồ ở chế độ đo dòng lấy khoảng 0,1 Ω, giới hạn 200 mA hoặc 500 mA của cổng mA là ví dụ phổ biến, hãy đọc nhãn trên đồng hồ của bạn.'
  });

  /* ===== Bài 12: ampe kìm ===== */
  var LOADS = {
    fan: { n: 'Quạt 220 V chạy', ac: true, run: 0.25 },
    comp: { n: 'Máy nén chạy ổn định', ac: true, run: 3.5 },
    start: { n: 'Máy nén lúc khởi động', ac: true, run: 3.5 },
    stall: { n: 'Máy nén kẹt cơ', ac: true, run: 3.5 },
    dc: { n: 'Quạt DC 12 V', ac: false, run: 0.25 }
  };
  K.build({
    id: 'ampekim', tab: 'Ampe kìm đo dòng', dur: 8, dratio: 0.62,
    title: 'Ampe kìm: kẹp quanh dây để đo dòng, không cắt mạch',
    lead: 'Kẹp ampe kìm quanh một dây mang dòng là đo được. Kẹp cả hai dây L và N thì dòng triệt tiêu nhau nên đồng hồ đọc gần 0. Muốn đo dòng nhỏ, quấn dây nhiều vòng qua hàm kìm rồi chia số đo cho số vòng. Loại chỉ đo AC không đo được dòng DC.',
    dlabel: 'Ampe kìm kẹp quanh dây điện',
    ctrls: [
      { id: 'load', seg: true, label: 'Tải', val: 'comp', opts: [{ v: 'fan', t: 'Quạt 220 V' }, { v: 'comp', t: 'Máy nén chạy' }, { v: 'start', t: 'Máy nén khởi động' }, { v: 'stall', t: 'Máy nén kẹt cơ' }, { v: 'dc', t: 'Quạt DC 12 V' }] },
      { id: 'pos', seg: true, label: 'Cách kẹp', val: 'L', opts: [{ v: 'L', t: 'Dây L' }, { v: 'both', t: 'Cả L và N' }, { v: 'turns', t: 'Quấn nhiều vòng quanh dây L' }] },
      { id: 'turns', label: 'Số vòng quấn (chỉ dùng khi chọn quấn nhiều vòng)', min: 1, max: 10, step: 1, val: 5, fmt: function (v) { return nf(v, 0) + ' vòng'; } },
      { id: 'type', seg: true, label: 'Loại ampe kìm', val: 'acdc', opts: [{ v: 'ac', t: 'Chỉ đo AC' }, { v: 'acdc', t: 'Đo AC và DC' }] }
    ],
    draw: function (dv, d, idx) {
      var g = dv.g, w = dv.w, h = dv.h, col = K.col; if (!g) return; g.clearRect(0, 0, w, h);
      var yL = h * 0.38, yN = h * 0.64, cx = w * 0.44;
      ln(g, w * 0.04, yL, w * 0.96, yL, col.bad, 3.4); ln(g, w * 0.04, yN, w * 0.96, yN, col.volt, 3.4);
      tx(g, 'L', w * 0.04, yL - 8, col.bad, '700 12px sans-serif'); tx(g, 'N', w * 0.04, yN - 8, col.volt, '700 12px sans-serif');
      tx(g, '→ tải', w * 0.96, yL - 8, col.muted, '11px sans-serif', 'right');
      var both = d.pos === 'both', n = d.pos === 'turns' ? d.turns : 1;
      var top = both ? yL - 30 : yL - 30, bot = both ? yN + 30 : yL + 30, rw = 56;
      // vòng quấn
      if (n > 1) { for (var k = 0; k < Math.min(n, 10); k++) { var xx = cx - rw / 2 + 6 + k * ((rw - 12) / Math.max(1, n - 1)); ln(g, xx, yL, xx + 5, top + 6, col.bad, 1.6); ln(g, xx + 5, bot - 6, xx + 10, yL, col.bad, 1.6); } }
      g.strokeStyle = col.ink; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - rw / 2, bot + 6); g.lineTo(cx - rw / 2, top + 6); g.quadraticCurveTo(cx - rw / 2, top - 6, cx, top - 6); g.quadraticCurveTo(cx + rw / 2, top - 6, cx + rw / 2, top + 6); g.lineTo(cx + rw / 2, bot + 6); g.stroke();
      g.fillStyle = col.ink; g.fillRect(cx - rw / 2 - 5, bot + 4, rw + 10, 16); g.fillRect(cx + rw / 2 - 5, bot + 18, 10, 12);
      // màn hình
      var lx = w * 0.62, ly = h * 0.84; // phía dưới bên phải
      g.fillStyle = K.PAL.surface; g.strokeStyle = col.ink; g.lineWidth = 2; g.fillRect(w * 0.54, h * 0.76, w * 0.42, h * 0.2); g.strokeRect(w * 0.54, h * 0.76, w * 0.42, h * 0.2);
      tx(g, d.disp[idx] === null ? 'không đọc' : num(d.disp[idx], 2) + ' A', w * 0.75, h * 0.76 + h * 0.14, col.ok, '700 ' + Math.round(h * 0.11) + 'px monospace', 'center');
      tx(g, d.type === 'ac' ? 'AC' : 'AC/DC', w * 0.55 + 4, h * 0.855, col.muted, '600 10px sans-serif');
    },
    compute: function (p) {
      var col = K.col, N = 321, T = 8, xs = K.arr(N, function (i) { return T * i / (N - 1); }), ld = LOADS[p.load], both = p.pos === 'both', n = p.pos === 'turns' ? p.turns : 1;
      var real = K.arr(N, function (i) {
        var t = xs[i]; if (t < 1) return 0; var u = t - 1;
        if (p.load === 'start') return ld.run + 16 * Math.exp(-u / 0.35);
        if (p.load === 'stall') return u < 3.6 ? 12 + 6 * Math.exp(-u / 0.4) : 0;
        return ld.run;
      });
      var cantRead = (!ld.ac && p.type === 'ac');
      var disp = new Array(N), dispNum = K.arr(N, function (i) { var v = real[i]; if (both || cantRead) v = 0; else v = v * n; v = Math.round(v * 100) / 100; disp[i] = v; return v; });
      var stable = ld.run, shown = both || cantRead ? 0 : Math.round(stable * n * 100) / 100;
      var d = {
        pos: p.pos, turns: n, type: p.type, disp: disp, xs: xs, xunit: 's (tải bật lúc 1 giây)',
        panels: [
          { title: 'Dòng thật trong dây L', unit: 'A', min: 0, max: Math.max(5, p.load === 'start' || p.load === 'stall' ? 22 : 5), series: [{ n: 'I thật', c: col.amp, y: real, f: function (v) { return num(v, 2) + ' A'; } }] },
          { title: 'Số hiện trên ampe kìm', unit: 'A', min: 0, max: Math.max(5, p.load === 'start' || p.load === 'stall' ? 22 : 5, shown * 1.2 + (n > 1 ? 4 : 0)), series: [{ n: 'số đo', c: col.ok, y: dispNum, f: function (v) { return num(v, 2) + ' A'; } }] }
        ]
      };
      d.reads = [['Tải', ld.n], ['Dòng thật (ổn định)', num(stable, 2) + ' A'], ['Số hiện trên ampe kìm', (both || cantRead ? '0' : num(shown, 2)) + ' A'], ['Số vòng quấn', nf(n, 0)]];
      var msg = '';
      if (both) msg = 'Kẹp cả L và N: dòng đi trên L bằng dòng về trên N nhưng ngược chiều, từ trường hai dây triệt tiêu nhau. Ampe kìm đọc gần 0 dù tải đang chạy. Phải tách ra, kẹp riêng một dây.';
      else if (cantRead) msg = 'Ampe kìm chỉ đo AC không đo được dòng một chiều. Dòng DC của quạt 12 V cần loại AC/DC (dùng cảm biến Hall) hoặc dùng VOM mắc nối tiếp.';
      else if (n > 1) msg = 'Quấn ' + n + ' vòng qua hàm kìm: đồng hồ thấy ' + n + ' lần dòng thật nên đọc ' + num(shown, 2) + ' A. Dòng thật = số đo ÷ ' + n + ' = ' + num(shown / n, 2) + ' A. Cách này giúp đo dòng nhỏ chính xác hơn.';
      else msg = 'Kẹp quanh dây L: số đo bằng dòng thật. Ampe kìm đo từ trường quanh dây nên không cần cắt mạch và không thêm điện trở nào vào mạch.';
      if (p.load === 'start' && !both && !cantRead) msg += '\nDòng khởi động vọt lên rồi hạ về dòng chạy sau chưa tới 1 giây. Ampe kìm thông thường cập nhật chậm nên có thể không bắt kịp đỉnh, cần chế độ giữ đỉnh (INRUSH) nếu muốn đo dòng khởi động.';
      if (p.load === 'stall') msg += '\nKẹt cơ: dòng rất cao kéo dài cho tới khi bảo vệ quá nhiệt ngắt. Đo thấy dòng cao hơn nhiều so với dòng chạy là dấu hiệu lock rotor hoặc tụ hỏng.';
      d.msg = msg;
      return d;
    },
    tryit: ['Chọn "Cả L và N": số đo về 0.', 'Chọn "Quạt 220 V", kẹp quấn 10 vòng: số đo gấp 10 lần, chia 10 để ra dòng thật.', 'Chọn "Quạt DC 12 V" với loại "Chỉ đo AC": không đọc được.', 'Chọn "Máy nén khởi động": xem dòng vọt rồi hạ.'],
    notes: 'Dòng quạt 0,25 A, máy nén chạy 3,5 A, khởi động và kẹt cơ lấy vài chục lần chạy là ví dụ minh họa, không phải số của máy cụ thể. Ampe kìm thật còn có sai số và độ phân giải riêng.'
  });

  /* ===== Bài 13: điện xoay chiều ===== */
  K.build({
    id: 'acsin', tab: 'Sóng sin 220 V', dur: 10,
    title: 'Điện xoay chiều: tần số, trị hiệu dụng và trị đỉnh',
    lead: 'Điện nhà đổi chiều theo hình sóng sin. Con số 220 V ghi trên nhãn là trị hiệu dụng, còn đỉnh sóng cao hơn 1,414 lần. Linh kiện phải chịu trị đỉnh. Phần dưới cho thấy điện áp bus sau cầu chỉnh lưu và tụ lọc cũng lên tới trị đỉnh.',
    ctrls: [
      { id: 'f', seg: true, label: 'Tần số lưới', val: '50', opts: [{ v: '50', t: '50 Hz' }, { v: '60', t: '60 Hz' }] },
      { id: 'V', label: 'Điện áp hiệu dụng', min: 100, max: 250, step: 5, val: 220, fmt: function (v) { return nf(v, 0) + ' V'; } },
      { id: 'cap', label: 'Điện áp chịu được ghi trên tụ (DC)', min: 100, max: 700, step: 10, val: 250, fmt: function (v) { return nf(v, 0) + ' V'; } },
      { id: 'C', label: 'Tụ lọc sau cầu chỉnh lưu', min: 47, max: 1000, val: 470, log: true, fmt: function (v) { return nf(v, 0) + ' µF'; } }
    ],
    compute: function (p) {
      var col = K.col, f = +p.f, T = 1000 / f, N = 800, tmax = 2 * T, xs = K.arr(N, function (i) { return tmax * i / (N - 1); });
      var Vp = p.V * Math.SQRT2, v = K.arr(N, function (i) { return Vp * Math.sin(TAU * f * xs[i] / 1000); });
      var C = p.C * 1e-6, I = 0.3, dt = tmax / (N - 1) * 1e-3, bus = 0, vb = new Float64Array(N), vmin = 1e9;
      var warm = 3 * (1 / f), steps = Math.round(warm / dt), i, t0 = 0;
      for (i = 0; i < steps; i++) { var tt = i * dt, a = Math.abs(Vp * Math.sin(TAU * f * tt)); if (a > bus) bus = a; else bus -= I / C * dt; if (bus < 0) bus = 0; }
      for (i = 0; i < N; i++) { var t2 = (steps + i) * dt, a2 = Math.abs(Vp * Math.sin(TAU * f * t2)); if (a2 > bus) bus = a2; else bus -= I / C * dt; if (bus < 0) bus = 0; vb[i] = bus; if (bus < vmin) vmin = bus; }
      var d = {
        xs: xs, xunit: 'ms (hai chu kỳ)',
        panels: [
          { title: 'Điện áp lưới xoay chiều', unit: 'V', min: -400, max: 400, hlines: [{ y: Vp, t: 'đỉnh ' + nf(Vp, 0) + ' V', c: col.bad }, { y: p.V, t: 'hiệu dụng ' + nf(p.V, 0) + ' V', c: col.ok }, { y: -Vp, t: '', c: col.bad }, { y: -p.V, t: '', c: col.ok }], series: [{ n: 'v(t)', c: col.volt, y: v, f: function (x) { return nf(x, 0) + ' V'; } }] },
          { title: 'Điện áp bus sau cầu chỉnh lưu và tụ lọc', unit: 'V', min: 0, max: 400, hlines: [{ y: p.cap, t: 'tụ ghi chịu ' + nf(p.cap, 0) + ' V', c: col.bad }], series: [{ n: 'bus', c: col.amp, y: vb, f: function (x) { return nf(x, 0) + ' V'; } }] }
        ]
      };
      var safe = Vp * 1.2 <= p.cap, ok = Vp <= p.cap;
      d.reads = [['Chu kỳ', nf(T, 1) + ' ms'], ['Trị đỉnh', nf(Vp, 0) + ' V'], ['Đỉnh đến đỉnh', nf(2 * Vp, 0) + ' V'], ['Bus (gần đỉnh)', nf(vb[N - 1] > 0 ? Math.max.apply(null, vb) : 0, 0) + ' V']];
      d.msg = 'Chu kỳ = 1 ÷ tần số = 1 ÷ ' + f + ' Hz = ' + nf(T, 1) + ' ms. Trị đỉnh = ' + nf(p.V, 0) + ' × 1,414 = ' + nf(Vp, 0) + ' V. VOM thang AC đọc ' + nf(p.V, 0) + ' V (hiệu dụng). Điện áp một chiều trên tụ lọc đo bằng thang DC sẽ gần ' + nf(Vp, 0) + ' V trừ đi gợn sóng.\n' +
        (ok ? (safe ? 'Tụ ghi chịu ' + nf(p.cap, 0) + ' V DC đủ cho đỉnh ' + nf(Vp, 0) + ' V và còn dư an toàn.' : 'Tụ ghi chịu ' + nf(p.cap, 0) + ' V chỉ hơn đỉnh ' + nf(Vp, 0) + ' V chút ít, dư an toàn quá thấp. Điện áp lưới tăng nhẹ là vượt.') : 'ĐỈNH ' + nf(Vp, 0) + ' V VƯỢT mức tụ chịu được ' + nf(p.cap, 0) + ' V: tụ phồng, nổ hoặc chập. Đây là lý do tụ chỉ ghi chịu 250 V không dùng được trên lưới 220 V.') + '\nGhi chú: tụ hóa phân cực dùng ở bus chỉ chịu DC, không đặt trực tiếp lên lưới xoay chiều.';
      return d;
    },
    tryit: ['Đặt 220 V, 50 Hz: chu kỳ 20 ms, đỉnh 311 V.', 'Đổi sang 60 Hz: chu kỳ ngắn lại 16,7 ms.', 'Kéo điện áp lên 250 V: đỉnh 354 V, tụ 400 V vẫn chịu được.', 'Đặt tụ ghi 250 V: vạch đỏ nằm dưới đỉnh, tụ không chịu nổi.', 'Giảm tụ lọc xuống 47 µF: bus gợn nhiều hơn, thấp hơn đỉnh.'],
    notes: 'Tải trên bus lấy 0,3 A để minh họa độ gợn. Mức điện áp lưới có thể dao động ±10%, vì vậy chọn tụ cần dư an toàn.'
  });
})();
