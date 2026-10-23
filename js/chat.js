/* Trợ lý tra giáo trình — chạy hoàn toàn trên máy, KHÔNG dùng AI, KHÔNG gọi mạng.
   Chỉ trả lời bằng nội dung có sẵn trong data/lessons.js (bài học + thuật ngữ).
   Không tìm thấy thì nói rõ là chưa có trong giáo trình, không đoán. */
(function () {
  "use strict";
  var LESSONS = window.LESSONS || [], GLOSSARY = window.GLOSSARY || [];
  function labName(id) { return (window.LAB_NAME || {})[id] || id; } // app.js gán window.LAB_NAME (gồm cả LAB_NAME_EXTRA)

  // Bỏ dấu, hạ chữ thường, chỉ giữ chữ-số.
  function fold(s) {
    return String(s || "").toLowerCase().replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9µ]+/g, " ").replace(/µ/g, "u").trim();
  }
  // Từ hỏi chung, không mang nội dung. KHÔNG đưa "dan", "may", "ma" vào đây vì có nghĩa riêng (dàn nóng, máy nén, mã màu).
  var STOP = {};
  ("la gi the nao cho toi minh hay co khong de va cua o trong mot nhung cac nhu sao tai vi khi thi ra duoc lam " +
   "ve hoi giai thich cach nhe oi ban voi hoac vay a u ah thi bi dang se da can muon biet xin chao")
    .split(" ").forEach(function (w) { STOP[w] = 1; });

  // 13/10/2026: cách nói quen của KTV → từ trong giáo trình. Áp dụng cho câu hỏi (không áp dụng cho chỉ mục).
  var SYN = [
    [/\b(tu|bo|mach|cuon) loc\b/g, "$1 l_oc"], [/\bloc (nhieu|emi|song|dien)\b/g, "l_oc $1"], // giữ "tụ lọc", "lọc nhiễu"... trước khi đổi "lốc"
    [/\b(block|blok|bloc|loc|compressor|compresser)\b/g, "may nen"],
    [/\bl_oc\b/g, "loc"],
    [/\bcuc nong\b/g, "dan nong"], [/\bcuc lanh\b/g, "dan lanh"],
    [/\b(ro le|role|rele)\b/g, "relay"], [/\b(capa|tu quat|tu block)\b/g, "tu"],
    [/\b(sensor|sen so|thermistor|cam bien nhiet do)\b/g, "ntc cam bien"],
    [/\b(ga|gaz)\b/g, "gas"], [/\b(multimeter|dong ho do)\b/g, "vom dong ho van nang"],
    [/\b(aptomat|cau dao)\b/g, "cb"], [/\b(chong giat|elcb|rcd|rcbo)\b/g, "chong giat"],
    [/\b(bien tan)\b/g, "inverter"], [/\bipm\b/g, "igbt"], [/\bu v w\b/g, "igbt 3 pha may nen"], [/\b(dead time|deadtime)\b/g, "thoi gian chet"], [/\b(boot strap)\b/g, "bootstrap"], [/\b(vol|volt|von)\b/g, "dien ap"], [/\b(amp|am pe)\b/g, "ampe dong dien"],
    [/\b(om|ohm)\b/g, "ohm dien tro"], [/\b(dio|diot|di ot)\b/g, "diode"], [/\b(tran|tranzito|transitor|bjt)\b/g, "transistor"],
    [/\b(mo to|motor)\b/g, "dong co"], [/\b(tiep dat|noi mat)\b/g, "tiep dia"]
  ];
  function synonyms(f) { SYN.forEach(function (s) { f = f.replace(s[0], s[1]); }); return f; }
  function tokens(s, syn) {
    var f = fold(s); if (syn) f = synonyms(f);
    return f.split(" ").filter(function (t) { return t && !STOP[t]; });
  }

  // ---- Dựng chỉ mục ----
  var docs = [];
  LESSONS.forEach(function (L) {
    L.blocks.forEach(function (b, i) {
      // Từ trong tiêu đề mục + từ khóa của mục = mạnh. Tên bài, từ khóa cả bài và nội dung = yếu (tránh các mục cùng bài hòa điểm).
      var head = b.h + " " + (b.kw || "");
      var rest = L.title + " " + (L.keywords || "") + " " + b.p.join(" ");
      docs.push({ type: "block", lesson: L, block: b, idx: i, id: L.id + ":" + i,
        strong: tokens(head), weak: tokens(rest), text: fold(head + " " + rest) });
    });
  });
  GLOSSARY.forEach(function (g, i) {
    var L = LESSONS.filter(function (x) { return x.id === g.l; })[0];
    docs.push({ type: "term", term: g, lesson: L, id: "t:" + i,
      strong: tokens(g.t + " " + g.k), weak: tokens(g.d), text: fold(g.t + " " + g.k + " " + g.d) });
  });
  // 23/10/2026: tìm cả trong các mô phỏng (tiêu đề + đoạn giới thiệu), để hỏi "bootstrap", "dead time"... vẫn ra
  Array.prototype.forEach.call(typeof document !== "undefined" && document.querySelectorAll ? document.querySelectorAll("section.lab") : [], function (s) {
    var id = s.id.replace(/^lab-/, ""), h = s.querySelector("h2"), lead = s.querySelector(".lead");
    if (!h || !lead) return;
    var L = LESSONS.filter(function (x) { return (x.labs || []).indexOf(id) >= 0; })[0];
    docs.push({ type: "lab", lab: id, h: h.textContent, lead: lead.textContent, lesson: L, id: "lab:" + id,
      strong: tokens(h.textContent), weak: tokens(lead.textContent), text: fold(h.textContent + " " + lead.textContent) });
  });
  var N = docs.length, df = {};
  docs.forEach(function (d) {
    var seen = {};
    d.strong.concat(d.weak).forEach(function (t) { if (!seen[t]) { seen[t] = 1; df[t] = (df[t] || 0) + 1; } });
    d.set = seen;
    d.strongSet = {}; d.strong.forEach(function (t) { d.strongSet[t] = 1; });
  });
  function idf(t) { return Math.log(1 + N / (df[t] || 0.5)); } // từ lạ (không có trong giáo trình) có idf lớn nhất
  var MAXIDF = Math.log(1 + N / 0.5);

  // ---- Chấm điểm ----
  function score(d, q) {
    var matched = 0, total = 0, s = 0, i;
    for (i = 0; i < q.length; i++) {
      var t = q[i], w = df[t] ? idf(t) : MAXIDF;
      total += w;
      if (d.set[t]) { matched += w; s += w * (d.strongSet[t] ? 3 : 1); }
    }
    for (i = 0; i + 1 < q.length; i++) {
      if (d.text.indexOf(q[i] + " " + q[i + 1]) >= 0) s += idf(q[i]) + idf(q[i + 1]); // cụm từ liền nhau
    }
    return { s: s, conf: total ? matched / total : 0 };
  }

  function search(text, minConf) {
    var q = tokens(text, true);
    if (!q.length) return [];
    var out = [], min = minConf == null ? 0.6 : minConf;
    docs.forEach(function (d) {
      var r = score(d, q);
      if (r.s > 0 && r.conf >= min) out.push({ d: d, s: r.s, conf: r.conf });
    });
    out.sort(function (a, b) { return b.s - a.s; });
    return out;
  }

  // ---- Soạn câu trả lời (dữ liệu thuần, app.js tự vẽ bằng textContent) ----
  function linksFor(L) {
    var links = [{ text: "Mở bài " + L.n, href: "#/bai/" + L.id }];
    (L.labs || []).slice(0, 4).forEach(function (id) { links.push({ text: "Mô phỏng: " + labName(id), href: "#/lab/" + id }); });
    return links;
  }
  function lessonList() {
    return LESSONS.map(function (L) { return { text: "Bài " + L.n + ": " + L.title, ask: "bài " + L.n }; });
  }
  var STARTERS = ["Định luật Ohm", "Xả tụ an toàn", "Chu trình làm lạnh", "Nguồn xung", "Opto và TL431", "NTC chia áp", "Ampe kìm đo dòng"];
  function docLabel(d) { return d.type === "term" ? d.term.t : d.type === "lab" ? "Mô phỏng: " + labName(d.lab) : d.block.h; }
  function docAsk(d) { return d.type === "term" ? d.term.t : d.type === "lab" ? d.h : d.lesson.title + " " + d.block.h; }

  function answer(text) {
    var f = fold(text);
    if (!f) return null;

    // chào hỏi
    if (/^(xin chao|chao|chao ban|hello|hi|alo|chao bot)$/.test(f)) {
      return { title: "Chào bạn", paras: ["Mình là trợ lý tra giáo trình " + LESSONS.length + " bài điện tử, điện lạnh cơ bản. Gõ từ khóa hoặc chọn một gợi ý:"],
        chips: STARTERS.map(function (s) { return { text: s, ask: s }; }) };
    }
    // ngoài phạm vi: giá, mua bán, bảo hành, mã lỗi, model cụ thể → nói rõ, không đoán
    if (/\b(gia|bao nhieu tien|mua|ban o dau|bao hanh|ma loi|loi e\d+|loi [a-z]\d+|model|doi may)\b/.test(f) || /^(e|f|h|p)\d{1,3}$/.test(f)) {
      return { none: true, title: "Ngoài phạm vi giáo trình",
        paras: ["Giáo trình này chỉ dạy nguyên lý điện tử, điện lạnh cơ bản. Giá, bảo hành, mã lỗi và thông tin của từng model không có ở đây.",
                "Mã lỗi hãy tra ở web Tra cứu mã lỗi hoặc tài liệu service của hãng."], chips: STARTERS.slice(0, 4).map(function (s) { return { text: s, ask: s }; }) };
    }
    // "bài 3", "mở bài 3"
    var m = f.match(/^(?:mo |xem )?bai (\d+)$/);
    if (m) {
      var L = LESSONS.filter(function (x) { return x.n === +m[1]; })[0];
      if (!L) return { none: true, title: "Chưa có bài " + m[1], paras: ["Giáo trình hiện có " + LESSONS.length + " bài."], chips: lessonList() };
      return { title: "Bài " + L.n + " · " + L.title, paras: [L.summary, "Các phần trong bài:"],
        links: linksFor(L), chips: L.blocks.map(function (b) { return { text: b.h, ask: L.title + " " + b.h }; }) };
    }
    // danh sách / giúp đỡ
    if (/^(giao trinh|danh sach|muc luc|menu|help|huong dan|tro giup|co nhung bai nao|bai hoc)$/.test(f)) {
      return { title: "Giáo trình", paras: ["Giáo trình có " + LESSONS.length + " bài. Chọn một bài, hoặc gõ câu hỏi ngắn bằng từ khóa."], chips: lessonList() };
    }
    if (/^(on tap|on bai|kiem tra|lam bai kiem tra|thi thu|cau sai|on cau sai|ket qua|the ghi nho|flashcard)$/.test(f)) {
      return { title: "Ôn tập", paras: ["Vào mục Ôn tập để làm bài kiểm tra tổng hợp, ôn lại các câu đã làm sai, học thuật ngữ bằng thẻ ghi nhớ và xem kết quả."],
        links: [{ text: "Mở Ôn tập", href: "#/on" }, { text: "Ôn câu sai", href: "#/on/sai" }, { text: "Thẻ ghi nhớ", href: "#/on/the" }] };
    }

    var res = search(text);
    if (!res.length) {
      // không đủ chắc: gợi ý các mục gần giống (khớp được một phần câu hỏi), không tự trả lời
      var near = search(text, 0.3), seenN = {}, chips = [];
      near.forEach(function (x) {
        if (chips.length >= 4 || seenN[docLabel(x.d)]) return;
        seenN[docLabel(x.d)] = 1; chips.push({ text: docLabel(x.d), ask: docAsk(x.d) });
      });
      if (chips.length) return { none: true, title: "Chưa chắc bạn hỏi phần nào",
        paras: ["Mình không tìm thấy mục khớp đủ với câu hỏi. Có thể bạn muốn hỏi một trong các phần dưới đây:"], chips: chips };
      return { none: true, title: "Chưa có trong giáo trình",
        paras: ["Mình chỉ trả lời trong phạm vi điện tử và điện lạnh cơ bản của " + LESSONS.length + " bài này, và không đoán ngoài giáo trình.",
                "Thử gõ từ khóa ngắn như: tụ điện, diode, relay, máy nén, NTC, inverter, gas."],
        chips: lessonList() };
    }
    var top = res[0].d, r = { paras: [], links: [], chips: [] };
    if (top.type === "lab") {
      r.title = "Mô phỏng · " + labName(top.lab);
      r.paras = [top.lead];
      r.links = [{ text: "Mở mô phỏng", href: "#/lab/" + top.lab }];
      if (top.lesson) r.links.push({ text: "Mở bài " + top.lesson.n, href: "#/bai/" + top.lesson.id });
    } else if (top.type === "term") {
      r.title = "Thuật ngữ · " + top.term.t;
      r.paras.push(top.term.d);
      if (top.lesson) r.links = linksFor(top.lesson);
    } else {
      r.title = "Bài " + top.lesson.n + " · " + top.block.h;
      r.paras = top.block.p.slice();
      r.links = linksFor(top.lesson);
    }
    // gợi ý các mục liên quan khác
    var seen = {}; seen[top.id] = 1;
    var more = res.length > 1 ? res : search(text, 0.4); // ít kết quả thì nới ngưỡng để vẫn có gợi ý liên quan
    more.slice(1).forEach(function (x) {
      if (r.chips.length >= 3 || seen[x.d.id]) return;
      var label = docLabel(x.d), ask = docAsk(x.d);
      if (label === docLabel(top)) return;
      seen[x.d.id] = 1;
      r.chips.push({ text: label, ask: ask });
    });
    return r;
  }

  window.Chat = { answer: answer, starters: STARTERS, fold: fold, search: search };
})();
