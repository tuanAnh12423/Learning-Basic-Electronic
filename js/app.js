/* Khung ứng dụng: điều hướng bằng hash (#/hoc, #/bai/b1, #/bai/b1/2, #/lab/ohm, #/on, #/on/mix10, #/on/sai, #/on/the, #/on/kq, #/tn, #/hoi),
   bài học, bài tập, ôn tập, thẻ ghi nhớ, kết quả, thuật ngữ, chat. */
(function () {
  "use strict";
  var LESSONS = window.LESSONS, GLOSSARY = window.GLOSSARY, LAB_NAME = window.LAB_NAME || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TITLE = "Học Điện Tử, Điện Lạnh";

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "class") e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function btn(text, cls, fn) { var b = el("button", { class: cls || "btn2", type: "button", text: text }); if (fn) b.addEventListener("click", fn); return b; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function today() { var d = new Date(); return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear(); }

  // ---- lưu trên máy này (không gửi đi đâu). Giữ nguyên tên khóa cũ để không mất tiến độ ----
  var KEY = "hdt_progress_v1", KEY_WRONG = "hdt_wrong_v1", KEY_MIX = "hdt_mix_v1", KEY_NAME = "hdt_name_v1", KEY_FS = "hdt_fs_v1", KEY_KNOWN = "hdt_known_v1";
  function load(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  function loadProg() { return load(KEY, {}) || {}; }
  function saveProg(p) { save(KEY, p); }
  function doneCount(p) { return LESSONS.filter(function (L) { return p[L.id] && p[L.id].score === p[L.id].total; }).length; }
  function lessonById(id) { return LESSONS.filter(function (L) { return L.id === id; })[0]; }

  // câu đã làm sai: { "b1:2": 1 } — làm đúng lại thì xóa
  function markAnswer(qid, ok) {
    var w = load(KEY_WRONG, {}) || {};
    if (ok) delete w[qid]; else w[qid] = 1;
    save(KEY_WRONG, w);
  }
  function allQuestions() {
    var out = [];
    LESSONS.forEach(function (L) { L.quiz.forEach(function (q, i) { out.push({ q: q.q, o: q.o, a: q.a, why: q.why, qid: L.id + ":" + i, L: L }); }); });
    return out;
  }
  function wrongQuestions() {
    var w = load(KEY_WRONG, {}) || {};
    return allQuestions().filter(function (x) { return w[x.qid]; });
  }

  // ---- thông báo nhỏ ----
  var toastT = 0;
  function toast(t) {
    var e = $("#toast"); e.textContent = t; e.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200);
  }
  function copyText(t, okMsg) {
    function fallback() {
      var ta = el("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(okMsg); } catch (e) { toast("Không chép được, hãy chụp màn hình."); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast(okMsg); }, fallback);
    else fallback();
  }

  // ---- cỡ chữ ----
  var FS_NAME = ["Vừa", "Lớn", "Rất lớn"];
  function applyFs(n) { document.body.classList.remove("fs1", "fs2"); if (n) document.body.classList.add("fs" + n); }
  applyFs(load(KEY_FS, 0) || 0);
  $("#fs").addEventListener("click", function () {
    var n = ((load(KEY_FS, 0) || 0) + 1) % 3; save(KEY_FS, n); applyFs(n); toast("Cỡ chữ: " + FS_NAME[n]);
  });

  // ---- màn hình ----
  var VIEWS = ["hoc", "bai", "lab", "on", "tn", "hoi"], backTo = null;
  function showView(name, back) {
    VIEWS.forEach(function (v) { $("#v-" + v).hidden = v !== name; });
    var navKey = name === "bai" ? "hoc" : name;
    $$(".bottom a").forEach(function (a) {
      if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    backTo = back || null;
    $("#back").hidden = !backTo;
  }
  function setTitle(t) { $("#title").textContent = t; document.title = t === TITLE ? TITLE : t + " · " + TITLE; }
  function updateChip() {
    var p = loadProg(), n = doneCount(p);
    $("#prog").textContent = n + "/" + LESSONS.length + " bài";
  }

  // ---- bài tập dùng chung (bài học, kiểm tra tổng hợp, ôn câu sai) ----
  // items: [{q,o,a,why,qid,L}]. Thứ tự đáp án được trộn mỗi lần làm để không học thuộc vị trí.
  function runQuiz(box, items, opt) {
    opt = opt || {};
    var answered = 0, correct = 0, results = [];
    items.forEach(function (q, qi) {
      var card = el("div", { class: "q" }), done = false;
      if (opt.tag) card.appendChild(el("span", { class: "qtag", text: "Bài " + q.L.n + " · " + q.L.title }));
      card.appendChild(el("p", { class: "qt", text: (qi + 1) + ". " + q.q }));
      var why = el("p", { class: "why", hidden: "" }), order = shuffle(q.o.map(function (_, i) { return i; }));
      order.forEach(function (oi) {
        var b = el("button", { class: "opt", type: "button", text: q.o[oi] });
        b.dataset.oi = oi;
        b.addEventListener("click", function () {
          if (done) return; done = true; answered++;
          var ok = oi === q.a; if (ok) correct++;
          results.push({ q: q, ok: ok }); markAnswer(q.qid, ok);
          $$(".opt", card).forEach(function (x) { x.disabled = true; if (+x.dataset.oi === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          why.textContent = (ok ? "Đúng. " : "Chưa đúng. ") + q.why; why.hidden = false;
          if (answered === items.length && opt.onDone) opt.onDone(correct, results);
        });
        card.appendChild(b);
      });
      card.appendChild(why);
      box.appendChild(card);
    });
  }

  // ---- HỌC ----
  function searchAll(q) {
    var f = window.Chat.fold(q), out = [];
    if (f.length < 2) return out;
    LESSONS.forEach(function (L) {
      L.blocks.forEach(function (b, i) {
        if (window.Chat.fold(b.h + " " + (b.kw || "") + " " + b.p.join(" ")).indexOf(f) >= 0)
          out.push({ t: b.h, s: "Bài " + L.n + " · " + L.title, href: "#/bai/" + L.id + "/" + i });
      });
    });
    GLOSSARY.forEach(function (g) {
      if (window.Chat.fold(g.t + " " + g.k + " " + g.d).indexOf(f) >= 0) {
        out.push({ t: g.t, s: "Thuật ngữ · " + g.d, href: "#/bai/" + g.l });
      }
    });
    return out;
  }
  function renderHoc() {
    var p = loadProg(), box = $("#v-hoc");
    box.textContent = "";
    var n = doneCount(p);
    box.appendChild(el("p", { class: "lead2", text: "Điện tử và điện lạnh cơ bản, học từng bước ngay trên điện thoại. Mỗi bài có phần giải thích, mô phỏng và bài tập." }));
    var q = el("input", { class: "search", type: "search", placeholder: "Tìm: xả tụ, NTC, R32...", autocomplete: "off", enterkeyhint: "search", "aria-label": "Tìm trong giáo trình" });
    var res = el("div", { class: "results" });
    box.appendChild(q); box.appendChild(res);
    var listWrap = el("div");
    q.addEventListener("input", function () {
      res.textContent = "";
      var v = q.value.trim(); listWrap.hidden = !!v;
      if (!v) return;
      var r = searchAll(v);
      if (!r.length) { res.appendChild(el("p", { class: "empty", text: "Không thấy trong giáo trình. Thử từ khóa ngắn hơn, hoặc hỏi ở mục Hỏi." })); return; }
      res.appendChild(el("p", { class: "note", text: "Tìm thấy " + r.length + " mục" }));
      r.slice(0, 30).forEach(function (x) {
        res.appendChild(el("a", { class: "hit", href: x.href }, [el("b", { text: x.t }), el("small", { text: x.s })]));
      });
    });
    box.appendChild(listWrap);
    var bar = el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(LESSONS.length), "aria-valuenow": String(n), "aria-label": "Số bài đã làm đúng hết" }, [el("i")]);
    bar.firstChild.style.width = (100 * n / LESSONS.length) + "%";
    listWrap.appendChild(bar);
    var next = LESSONS.filter(function (L) { var pr = p[L.id]; return !(pr && pr.score === pr.total); })[0];
    if (next && n > 0) listWrap.appendChild(el("a", { class: "btn2 primary wide", href: "#/bai/" + next.id, text: "Học tiếp: Bài " + next.n + " · " + next.title }));
    if (!next) listWrap.appendChild(el("a", { class: "btn2 primary wide", href: "#/on/kq", text: "Đã xong cả " + LESSONS.length + " bài · Xem kết quả" }));
    LESSONS.forEach(function (L) {
      var pr = p[L.id], done = pr && pr.score === pr.total;
      var a = el("a", { class: "lesson-card" + (done ? " done" : ""), href: "#/bai/" + L.id }, [
        el("span", { class: "num", text: done ? "✓" : String(L.n) }),
        el("span", {}, [el("h3", { text: L.title }), el("p", { text: L.summary })])
      ]);
      if (pr) a.lastChild.appendChild(el("small", { text: "Bài tập gần nhất: " + pr.score + "/" + pr.total }));
      listWrap.appendChild(a);
    });
    listWrap.appendChild(el("p", { class: "note", text: "Nội dung mang tính nguyên lý cơ bản. Khi sửa chữa thực tế, luôn xem tài liệu của hãng, cắt nguồn, xả tụ và đo xác nhận trước khi chạm vào." }));
  }

  function shareLesson(L) {
    var url = location.href.split("#")[0] + "#/bai/" + L.id, title = "Bài " + L.n + ": " + L.title;
    if (navigator.share) navigator.share({ title: title, text: title + " · " + TITLE, url: url }).catch(function () { /* người dùng hủy */ });
    else copyText(title + "\n" + url, "Đã chép link bài học");
  }

  function renderBai(id) {
    var L = lessonById(id), box = $("#v-bai");
    box.textContent = "";
    if (!L) { box.appendChild(el("p", { class: "empty", text: "Không tìm thấy bài này." })); return; }
    box.appendChild(el("h2", { text: L.title }));
    box.appendChild(el("p", { class: "lead2", text: L.summary }));
    L.blocks.forEach(function (b, i) {
      box.appendChild(el("div", { class: "sec", id: "sec-" + i }, [el("h3", { text: b.h })].concat(b.p.map(function (t) { return el("p", { text: t }); }))));
    });
    var row = el("div", { class: "btn-row" });
    (L.labs || []).forEach(function (lab) { row.appendChild(el("a", { class: "btn2 primary", href: "#/lab/" + lab, text: "Mô phỏng: " + LAB_NAME[lab] })); });
    row.appendChild(btn("Chia sẻ bài", "btn2", function () { shareLesson(L); }));
    box.appendChild(row);
    // bài tập
    box.appendChild(el("h2", { text: "Bài tập" }));
    var qbox = el("div"); box.appendChild(qbox);
    var info = el("p", { class: "score", text: "" });
    runQuiz(qbox, L.quiz.map(function (q, i) { return { q: q.q, o: q.o, a: q.a, why: q.why, qid: L.id + ":" + i, L: L }; }), {
      onDone: function (correct) {
        var pr = loadProg(); pr[L.id] = { score: correct, total: L.quiz.length, date: today() }; saveProg(pr); updateChip();
        info.textContent = "Kết quả: " + correct + "/" + L.quiz.length + (correct === L.quiz.length ? ". Làm đúng hết." : ". Đọc lại phần giải thích rồi làm lại để đạt đủ.");
        info.appendChild(document.createTextNode(" "));
        info.appendChild(btn("Làm lại", "btn2", function () { renderBai(id); $("#main").scrollTop = 0; }));
      }
    });
    box.appendChild(info);
    // bài trước / sau
    var i = LESSONS.indexOf(L), nav = el("div", { class: "nav-row" });
    nav.appendChild(i > 0 ? el("a", { class: "btn2", href: "#/bai/" + LESSONS[i - 1].id, text: "← Bài " + LESSONS[i - 1].n }) : el("span"));
    nav.appendChild(i < LESSONS.length - 1 ? el("a", { class: "btn2 primary", href: "#/bai/" + LESSONS[i + 1].id, text: "Bài " + LESSONS[i + 1].n + " →" }) : el("a", { class: "btn2", href: "#/on", text: "Ôn tập" }));
    box.appendChild(nav);
  }

  // ---- ÔN TẬP ----
  function renderOnMenu(box) {
    var w = wrongQuestions().length, mix = load(KEY_MIX, null), known = Object.keys(load(KEY_KNOWN, {}) || {}).length;
    box.appendChild(el("p", { class: "lead2", text: "Ôn lại sau khi học. Mọi kết quả chỉ lưu trên điện thoại này." }));
    function item(href, h, p, badge) {
      return el("a", { class: "lesson-card", href: href }, [el("span", { class: "num ic", text: badge }), el("span", {}, [el("h3", { text: h }), el("p", { text: p })])]);
    }
    box.appendChild(item("#/on/mix10", "Kiểm tra nhanh 10 câu", "Câu hỏi lấy ngẫu nhiên từ cả " + LESSONS.length + " bài.", "10"));
    box.appendChild(item("#/on/mix20", "Kiểm tra tổng hợp 20 câu", mix ? "Lần gần nhất: " + mix.score + "/" + mix.total + " (" + mix.date + ")" : "Chưa làm lần nào.", "20"));
    box.appendChild(item("#/on/sai", "Ôn câu đã làm sai", w ? "Còn " + w + " câu cần ôn. Làm đúng thì câu đó được xóa khỏi danh sách." : "Chưa có câu sai nào. Rất tốt!", w ? String(w) : "✓"));
    box.appendChild(item("#/on/the", "Thẻ ghi nhớ thuật ngữ", "Lật thẻ để nhớ " + GLOSSARY.length + " thuật ngữ. Đã thuộc " + known + " thẻ.", "Aa"));
    box.appendChild(item("#/on/kq", "Kết quả học tập", "Bảng điểm từng bài, chụp màn hình hoặc chép để gửi người phụ trách training.", "★"));
  }

  function renderMix(box, n) {
    var items = shuffle(allQuestions()).slice(0, n);
    box.appendChild(el("p", { class: "lead2", text: n + " câu ngẫu nhiên từ cả giáo trình. Làm hết để xem kết quả." }));
    var qbox = el("div"); box.appendChild(qbox);
    var out = el("div"); box.appendChild(out);
    runQuiz(qbox, items, { tag: true, onDone: function (c, res) {
      if (n >= 20) save(KEY_MIX, { score: c, total: n, date: today() });
      var by = {};
      res.forEach(function (r) { var k = r.q.L.id; by[k] = by[k] || { L: r.q.L, ok: 0, n: 0 }; by[k].n++; if (r.ok) by[k].ok++; });
      var card = el("div", { class: "sec result" }, [el("h3", { text: "Kết quả: " + c + "/" + n + " (" + Math.round(100 * c / n) + "%)" })]);
      var weak = Object.keys(by).map(function (k) { return by[k]; }).filter(function (x) { return x.ok < x.n; });
      if (!weak.length) card.appendChild(el("p", { text: "Đúng hết. Rất tốt!" }));
      else {
        card.appendChild(el("p", { text: "Nên đọc lại các bài sau:" }));
        weak.forEach(function (x) { card.appendChild(el("a", { class: "hit", href: "#/bai/" + x.L.id }, [el("b", { text: "Bài " + x.L.n + " · " + x.L.title }), el("small", { text: "Đúng " + x.ok + "/" + x.n + " câu" })])); });
      }
      var r2 = el("div", { class: "btn-row" }, [btn("Làm đề khác", "btn2 primary", function () { route(); }), el("a", { class: "btn2", href: "#/on", text: "Về Ôn tập" })]);
      card.appendChild(r2);
      out.appendChild(card);
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    } });
  }

  function renderSai(box) {
    var items = wrongQuestions();
    if (!items.length) {
      box.appendChild(el("p", { class: "empty", text: "Chưa có câu sai nào để ôn. Khi làm bài tập mà trả lời sai, câu đó sẽ hiện ở đây." }));
      box.appendChild(el("a", { class: "btn2 primary wide", href: "#/on/mix10", text: "Làm kiểm tra nhanh 10 câu" }));
      return;
    }
    box.appendChild(el("p", { class: "lead2", text: items.length + " câu đã từng làm sai. Câu nào làm đúng sẽ được xóa khỏi danh sách." }));
    var qbox = el("div"); box.appendChild(qbox);
    runQuiz(qbox, shuffle(items), { tag: true, onDone: function (c) {
      var left = wrongQuestions().length;
      box.appendChild(el("div", { class: "sec result" }, [el("h3", { text: "Đúng " + c + "/" + items.length }),
        el("p", { text: left ? "Còn " + left + " câu cần ôn tiếp." : "Đã hết câu sai. Rất tốt!" }),
        el("div", { class: "btn-row" }, [left ? btn("Ôn tiếp", "btn2 primary", function () { route(); }) : el("span"), el("a", { class: "btn2", href: "#/on", text: "Về Ôn tập" })])]));
    } });
  }

  // thẻ ghi nhớ
  var fc = null;
  function renderThe(box) {
    var known = load(KEY_KNOWN, {}) || {};
    if (!fc) fc = { order: shuffle(GLOSSARY.map(function (_, i) { return i; })), i: 0, flip: false, onlyNew: true };
    function deck() { return fc.order.filter(function (k) { return !fc.onlyNew || !known[GLOSSARY[k].t]; }); }
    function draw() {
      box.textContent = "";
      var d = deck(), nk = Object.keys(known).length;
      box.appendChild(el("p", { class: "lead2", text: "Chạm vào thẻ để lật. Đã thuộc " + nk + "/" + GLOSSARY.length + " thẻ." }));
      var tg = el("label", { class: "check" }, [el("input", { type: "checkbox" }), " Chỉ học thẻ chưa thuộc"]);
      tg.firstChild.checked = fc.onlyNew;
      tg.firstChild.addEventListener("change", function () { fc.onlyNew = tg.firstChild.checked; fc.i = 0; fc.flip = false; draw(); });
      box.appendChild(tg);
      if (!d.length) {
        box.appendChild(el("p", { class: "empty", text: "Đã thuộc hết các thẻ. Rất tốt!" }));
        box.appendChild(btn("Học lại từ đầu", "btn2 primary wide", function () { known = {}; save(KEY_KNOWN, known); fc.i = 0; draw(); }));
        return;
      }
      if (fc.i >= d.length) fc.i = 0;
      var g = GLOSSARY[d[fc.i]], L = lessonById(g.l);
      var card = el("button", { class: "flash" + (fc.flip ? " back" : ""), type: "button", "aria-label": fc.flip ? "Mặt sau, chạm để lật lại" : "Mặt trước, chạm để lật" });
      card.appendChild(el("small", { text: (fc.i + 1) + " / " + d.length + (L ? " · Bài " + L.n : "") }));
      card.appendChild(el(fc.flip ? "p" : "b", { text: fc.flip ? g.d : g.t }));
      card.appendChild(el("small", { class: "hint", text: fc.flip ? g.t : "Chạm để xem nghĩa" }));
      card.addEventListener("click", function () { fc.flip = !fc.flip; draw(); });
      box.appendChild(card);
      function go(k) { fc.i = (fc.i + k + d.length) % d.length; fc.flip = false; draw(); }
      box.appendChild(el("div", { class: "fc-row" }, [
        btn("← Trước", "btn2", function () { go(-1); }),
        btn("Đã thuộc ✓", "btn2 ok", function () { known[g.t] = 1; save(KEY_KNOWN, known); fc.flip = false; if (!fc.onlyNew) go(1); else draw(); }),
        btn("Sau →", "btn2 primary", function () { go(1); })
      ]));
      box.appendChild(el("div", { class: "btn-row" }, [
        btn("Trộn thẻ", "btn2", function () { fc.order = shuffle(fc.order); fc.i = 0; fc.flip = false; draw(); }),
        L ? el("a", { class: "btn2", href: "#/bai/" + L.id, text: "Xem trong bài " + L.n }) : el("span")
      ]));
    }
    draw();
  }

  // kết quả học tập
  function resultText(name) {
    var p = loadProg(), mix = load(KEY_MIX, null), lines = ["KẾT QUẢ HỌC ĐIỆN TỬ, ĐIỆN LẠNH", "Họ tên: " + (name || "(chưa nhập)"), "Ngày: " + today(),
      "Hoàn thành: " + doneCount(p) + "/" + LESSONS.length + " bài", ""];
    LESSONS.forEach(function (L) {
      var pr = p[L.id];
      lines.push("Bài " + L.n + ". " + L.title + ": " + (pr ? pr.score + "/" + pr.total + (pr.score === pr.total ? " ✓" : "") : "chưa làm"));
    });
    lines.push("");
    lines.push("Kiểm tra tổng hợp 20 câu: " + (mix ? mix.score + "/" + mix.total + " (" + mix.date + ")" : "chưa làm"));
    lines.push("Câu sai còn cần ôn: " + wrongQuestions().length);
    return lines.join("\n");
  }
  function renderKq(box) {
    var p = loadProg(), mix = load(KEY_MIX, null);
    var name = el("input", { class: "search", type: "text", placeholder: "Nhập họ tên của bạn", autocomplete: "name", "aria-label": "Họ tên" });
    name.value = load(KEY_NAME, "") || "";
    name.addEventListener("input", function () { save(KEY_NAME, name.value.trim()); nm.textContent = name.value.trim() || "(chưa nhập tên)"; });
    box.appendChild(name);
    var sheet = el("div", { class: "sheet" });
    var nm = el("b", { text: name.value || "(chưa nhập tên)" });
    sheet.appendChild(el("div", { class: "sheet-h" }, [el("span", { text: "KẾT QUẢ HỌC TẬP" }), el("small", { text: today() })]));
    sheet.appendChild(el("p", { class: "sheet-n" }, [nm]));
    var n = doneCount(p);
    sheet.appendChild(el("p", { class: "sheet-s", text: "Hoàn thành " + n + "/" + LESSONS.length + " bài · Kiểm tra 20 câu: " + (mix ? mix.score + "/" + mix.total : "chưa làm") + " · Câu sai cần ôn: " + wrongQuestions().length }));
    var tb = el("table", { class: "tbl" });
    tb.appendChild(el("tr", {}, [el("th", { text: "Bài" }), el("th", { text: "Điểm" }), el("th", { text: "" })]));
    LESSONS.forEach(function (L) {
      var pr = p[L.id], ok = pr && pr.score === pr.total;
      tb.appendChild(el("tr", {}, [el("td", { text: L.n + ". " + L.title }), el("td", { class: "num2", text: pr ? pr.score + "/" + pr.total : "—" }),
        el("td", { class: ok ? "good" : "", text: ok ? "✓" : "" })]));
    });
    sheet.appendChild(tb);
    box.appendChild(sheet);
    box.appendChild(el("p", { class: "note", text: "Chụp màn hình bảng này, hoặc bấm Chép kết quả rồi dán vào Zalo hay email để gửi người phụ trách training." }));
    box.appendChild(el("div", { class: "btn-row" }, [
      btn("Chép kết quả", "btn2 primary", function () { copyText(resultText(name.value.trim()), "Đã chép kết quả"); }),
      el("a", { class: "btn2", href: "#/on/mix20", text: "Làm kiểm tra 20 câu" })
    ]));
    box.appendChild(el("details", { class: "reset" }, [el("summary", { text: "Xóa toàn bộ kết quả trên máy này" }),
      el("p", { class: "note", text: "Dùng khi đưa điện thoại cho người khác học. Không lấy lại được." }),
      btn("Xóa kết quả", "btn2 danger", function () {
        if (!confirm("Xóa toàn bộ điểm, câu sai và thẻ đã thuộc trên máy này?")) return;
        [KEY, KEY_WRONG, KEY_MIX, KEY_KNOWN].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } });
        fc = null; updateChip(); route(true); toast("Đã xóa kết quả");
      })]));
  }

  var ON_TITLE = { mix10: "Kiểm tra nhanh", mix20: "Kiểm tra tổng hợp", sai: "Ôn câu sai", the: "Thẻ ghi nhớ", kq: "Kết quả học tập" };
  function renderOn(sub) {
    var box = $("#v-on"); box.textContent = "";
    if (sub === "mix10") renderMix(box, 10);
    else if (sub === "mix20") renderMix(box, 20);
    else if (sub === "sai") renderSai(box);
    else if (sub === "the") renderThe(box);
    else if (sub === "kq") renderKq(box);
    else renderOnMenu(box);
  }

  // ---- THUẬT NGỮ ----
  function renderTn(q) {
    var list = $("#tn-list"), f = window.Chat.fold(q || ""), n = 0;
    list.textContent = "";
    if (!f) list.appendChild(el("a", { class: "btn2 wide", href: "#/on/the", text: "Học bằng thẻ ghi nhớ (" + GLOSSARY.length + " thẻ)" }));
    GLOSSARY.slice().sort(function (a, b) { return a.t.localeCompare(b.t, "vi"); }).forEach(function (g) {
      if (f && window.Chat.fold(g.t + " " + g.k + " " + g.d).indexOf(f) < 0) return;
      n++;
      var L = lessonById(g.l);
      list.appendChild(el("div", { class: "term" }, [el("b", { text: g.t }), el("p", { text: g.d }),
        el("a", { href: "#/bai/" + g.l, text: "Xem trong bài " + (L ? L.n : "") })]));
    });
    if (!n) list.appendChild(el("p", { class: "empty", text: "Không có thuật ngữ này trong giáo trình." }));
  }

  // ---- chat ----
  // 13/10/2026: giống web Tra cứu mã lỗi — "Đang suy nghĩ" + 3 chấm, rồi CHỮ HIỆN DẦN (~90 chữ/giây,
  // bài dài nhanh dần để xong trong ~3,6 giây, dừng ở cuối từ), con trỏ nhấp nháy.
  // Bấm vào tin để hiện hết ngay. Nút/gợi ý chỉ hiện SAU khi chữ chạy xong. Máy bật "giảm chuyển động" thì hiện luôn.
  var chatReady = false, current = null; // current = tin đang chạy chữ (để bấm hiện hết / hỏi tiếp thì xong ngay)
  var REDUCED = false;
  try { REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* bỏ qua */ }
  function scrollLog() { var log = $("#chat-log"); log.scrollTop = log.scrollHeight; }

  function extras(m, data) {
    if (data.links && data.links.length) {
      var acts = el("div", { class: "acts" });
      data.links.forEach(function (l) { acts.appendChild(el("a", { href: l.href, text: l.text })); });
      m.appendChild(acts);
    }
    if (data.chips && data.chips.length) {
      var sg = el("div", { class: "sugg" });
      data.chips.forEach(function (c) {
        var b = el("button", { type: "button", text: c.text });
        b.addEventListener("click", function () { ask(c.ask || c.text); });
        sg.appendChild(b);
      });
      m.appendChild(sg);
    }
  }

  function addMsg(who, data, animate) {
    var log = $("#chat-log"), m = el("div", { class: "msg " + who });
    log.appendChild(m);
    if (who === "me") { m.textContent = data; scrollLog(); return; }
    if (data.title) m.appendChild(el("h4", { text: data.title }));
    var paras = data.paras || [], ps = paras.map(function () { return m.appendChild(el("p")); });
    if (!animate || REDUCED) {
      ps.forEach(function (p, i) { p.textContent = paras[i]; });
      extras(m, data); scrollLog(); return;
    }
    // chữ chạy dần
    var full = paras.map(function (t) { return Array.from(t); });
    var total = full.reduce(function (a, c) { return a + c.length; }, 0);
    var rate = Math.max(90, total / 3.6), t0 = performance.now(), raf = 0, done = false;
    m.classList.add("streaming");
    function show(n) {
      var left = n, active = -1;
      ps.forEach(function (p, i) {
        var len = full[i].length, take = Math.max(0, Math.min(len, left));
        if (active < 0 && left <= len) active = i;          // đoạn đang chạy chữ
        p.textContent = full[i].slice(0, take).join("");
        p.hidden = take === 0 && i !== active;              // đoạn chưa tới thì ẩn
        p.classList.toggle("caret", i === active && n < total);
        left -= len;
      });
    }
    function finish() {
      if (done) return; done = true; cancelAnimationFrame(raf);
      show(total); ps.forEach(function (p) { p.classList.remove("caret"); });
      m.classList.remove("streaming"); extras(m, data); scrollLog();
      if (current && current.m === m) current = null;
    }
    function frame(now) {
      var n = Math.min(total, Math.floor((now - t0) / 1000 * rate));
      // dừng ở cuối từ (kéo thêm tối đa 8 ký tự)
      var flat = [].concat.apply([], full), extra = 0;
      while (n > 0 && n < total && extra < 8 && !/\s/.test(flat[n - 1] || " ")) { n++; extra++; }
      show(n); scrollLog();
      if (n >= total) finish(); else raf = requestAnimationFrame(frame);
    }
    m.addEventListener("click", finish);
    current = { m: m, finish: finish };
    show(0); raf = requestAnimationFrame(frame);
  }

  function thinking() {
    var row = el("div", { class: "msg bot typing", "aria-label": "Đang suy nghĩ" },
      [el("span", { class: "typing-label", text: "Đang suy nghĩ" }), el("i"), el("i"), el("i")]);
    $("#chat-log").appendChild(row); scrollLog();
    return row;
  }

  var pending = null; // câu trả lời đang "suy nghĩ"
  function ask(text) {
    text = String(text || "").trim(); if (!text) return;
    if (current) current.finish();                       // tin trước chưa chạy xong thì hiện hết luôn
    if (pending) { clearTimeout(pending.timer); pending.row.remove(); addMsg("bot", pending.r, false); pending = null; }
    addMsg("me", text);
    var r = window.Chat.answer(text) || { none: true, title: "Chưa có trong giáo trình", paras: ["Hãy gõ từ khóa ngắn trong phạm vi điện tử, điện lạnh cơ bản."] };
    var len = (r.paras || []).join(" ").length;
    var row = thinking();
    pending = { r: r, row: row, timer: setTimeout(function () {
      row.remove(); pending = null; addMsg("bot", r, true);
    }, REDUCED ? 0 : 500 + Math.min(len, 600) * 0.6) };
  }
  function initChat() {
    if (chatReady) return; chatReady = true;
    addMsg("bot", { title: "Trợ lý giáo trình", paras: ["Mình chỉ tra trong " + LESSONS.length + " bài của giáo trình này, không dùng AI và không đoán ngoài nội dung. Gõ kiểu quen miệng cũng được (lốc, cục nóng, capa, sensor...). Chọn một gợi ý hoặc gõ từ khóa:"],
      chips: window.Chat.starters.map(function (s) { return { text: s, ask: s }; }) }, true);
  }
  $("#chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var i = $("#chat-in"), v = i.value; i.value = ""; ask(v);
  });
  $("#tn-q").addEventListener("input", function (e) { renderTn(e.target.value); });
  $("#back").addEventListener("click", function () { location.hash = backTo || "#/hoc"; });
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { try { history.replaceState(null, "", "#/lab/" + t.dataset.lab); } catch (e) { /* bỏ qua */ } });
  });

  // ---- điều hướng ----
  function route(keepScroll) {
    var parts = (location.hash || "#/hoc").replace(/^#\/?/, "").split("/");
    var page = parts[0] || "hoc", arg = parts[1], sec = parts[2];
    var main = $("#main");
    window.Labs.leave();
    if (page === "bai" && lessonById(arg)) {
      showView("bai", "#/hoc"); renderBai(arg); setTitle("Bài " + lessonById(arg).n);
    } else if (page === "lab") {
      showView("lab"); setTitle("Thực hành"); window.Labs.enter(arg);
    } else if (page === "on") {
      showView("on", ON_TITLE[arg] ? "#/on" : null); setTitle(ON_TITLE[arg] || "Ôn tập"); renderOn(arg);
    } else if (page === "tn") {
      showView("tn"); setTitle("Thuật ngữ"); renderTn($("#tn-q").value);
    } else if (page === "hoi") {
      showView("hoi"); setTitle("Hỏi giáo trình"); initChat();
    } else {
      showView("hoc"); setTitle(TITLE); renderHoc();
    }
    if (keepScroll !== true) main.scrollTop = 0;
    if (page === "bai" && sec != null) {
      var s = document.getElementById("sec-" + sec);
      if (s) { s.scrollIntoView({ block: "start" }); s.classList.add("flash-sec"); setTimeout(function () { s.classList.remove("flash-sec"); }, 1600); }
    }
    updateChip();
  }
  window.addEventListener("hashchange", function () { route(); });
  route();

  // ---- dùng offline + báo có bản mới ----
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    var t0 = Date.now();
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.addEventListener("updatefound", function () {
          // mới mở trang thì trang đã là bản mới từ mạng, không cần báo
          if (!navigator.serviceWorker.controller || Date.now() - t0 < 15000) return;
          $("#update").hidden = false;
        });
        // mở lại app sau một lúc ở nền thì kiểm tra bản mới
        document.addEventListener("visibilitychange", function () { if (!document.hidden) reg.update().catch(function () { /* mất mạng */ }); });
      }).catch(function () { /* không sao */ });
    });
    $("#update-go").addEventListener("click", function () { location.reload(); });
  }
})();
