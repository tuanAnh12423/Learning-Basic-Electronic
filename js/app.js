/* Khung ứng dụng: điều hướng bằng hash (#/hoc, #/bai/b1, #/lab/ohm, #/tn, #/hoi), bài học, bài tập, thuật ngữ, chat. */
(function () {
  "use strict";
  var LESSONS = window.LESSONS, GLOSSARY = window.GLOSSARY;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TITLE = "Học Điện Tử, Điện Lạnh";
  var LAB_NAME = { ohm: "Ohm", mau: "Mã màu điện trở", mach: "Nối tiếp, song song", tu: "Tụ nạp, xả", doi: "Xả tụ đôi",
    diode: "Diode", cau: "Cầu chỉnh lưu", lanh: "Chu trình lạnh", rl: "Relay + transistor", tim: "Tìm lỗi quạt" };

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

  // ---- tiến độ (chỉ lưu trên máy này) ----
  var KEY = "hdt_progress_v1";
  function loadProg() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function saveProg(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* bỏ qua */ } }
  function doneCount(p) { return LESSONS.filter(function (L) { return p[L.id] && p[L.id].score === p[L.id].total; }).length; }
  function lessonById(id) { return LESSONS.filter(function (L) { return L.id === id; })[0]; }

  // ---- màn hình ----
  var VIEWS = ["hoc", "bai", "lab", "tn", "hoi"];
  function showView(name) {
    VIEWS.forEach(function (v) { $("#v-" + v).hidden = v !== name; });
    var navKey = name === "bai" ? "hoc" : name;
    $$(".bottom a").forEach(function (a) {
      if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $("#back").hidden = name !== "bai";
  }
  function setTitle(t) { $("#title").textContent = t; document.title = t === TITLE ? TITLE : t + " · " + TITLE; }
  function updateChip() {
    var p = loadProg(), n = doneCount(p);
    $("#prog").textContent = n + "/" + LESSONS.length + " bài";
  }

  function renderHoc() {
    var p = loadProg(), box = $("#v-hoc");
    box.textContent = "";
    var n = doneCount(p);
    box.appendChild(el("p", { class: "lead2", text: "Điện tử và điện lạnh cơ bản, học từng bước ngay trên điện thoại. Mỗi bài có phần giải thích, mô phỏng và bài tập." }));
    var bar = el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(LESSONS.length), "aria-valuenow": String(n), "aria-label": "Số bài đã làm đúng hết" }, [el("i")]);
    bar.firstChild.style.width = (100 * n / LESSONS.length) + "%";
    box.appendChild(bar);
    LESSONS.forEach(function (L) {
      var pr = p[L.id], done = pr && pr.score === pr.total;
      var a = el("a", { class: "lesson-card" + (done ? " done" : ""), href: "#/bai/" + L.id }, [
        el("span", { class: "num", text: done ? "✓" : String(L.n) }),
        el("span", {}, [el("h3", { text: L.title }), el("p", { text: L.summary })])
      ]);
      if (pr) a.lastChild.appendChild(el("small", { text: "Bài tập gần nhất: " + pr.score + "/" + pr.total }));
      box.appendChild(a);
    });
    box.appendChild(el("p", { class: "note", text: "Nội dung mang tính nguyên lý cơ bản. Khi sửa chữa thực tế, luôn xem tài liệu của hãng, cắt nguồn, xả tụ và đo xác nhận trước khi chạm vào." }));
  }

  function renderBai(id) {
    var L = lessonById(id), box = $("#v-bai");
    box.textContent = "";
    if (!L) { box.appendChild(el("p", { class: "empty", text: "Không tìm thấy bài này." })); return; }
    box.appendChild(el("h2", { text: L.title }));
    box.appendChild(el("p", { class: "lead2", text: L.summary }));
    L.blocks.forEach(function (b) {
      box.appendChild(el("div", { class: "sec" }, [el("h3", { text: b.h })].concat(b.p.map(function (t) { return el("p", { text: t }); }))));
    });
    if (L.labs && L.labs.length) {
      var row = el("div", { class: "btn-row" });
      L.labs.forEach(function (lab) { row.appendChild(el("a", { class: "btn2 primary", href: "#/lab/" + lab, text: "Mô phỏng: " + LAB_NAME[lab] })); });
      box.appendChild(row);
    }
    // bài tập
    box.appendChild(el("h2", { text: "Bài tập" }));
    var info = el("p", { class: "score", text: "" });
    var answered = 0, correct = 0;
    function finish() {
      var pr = loadProg(); pr[L.id] = { score: correct, total: L.quiz.length }; saveProg(pr); updateChip();
      info.textContent = "Kết quả: " + correct + "/" + L.quiz.length + (correct === L.quiz.length ? ". Làm đúng hết." : ". Đọc lại phần giải thích rồi làm lại để đạt đủ.");
      info.appendChild(document.createTextNode(" "));
      var again = el("button", { class: "btn2", type: "button", text: "Làm lại" });
      again.addEventListener("click", function () { renderBai(id); box.parentNode.scrollTop = 0; });
      box.appendChild(again);
    }
    L.quiz.forEach(function (q, qi) {
      var card = el("div", { class: "q" }), done = false;
      card.appendChild(el("p", { class: "qt", text: (qi + 1) + ". " + q.q }));
      var why = el("p", { class: "why", hidden: "" });
      q.o.forEach(function (txt, oi) {
        var b = el("button", { class: "opt", type: "button", text: txt });
        b.addEventListener("click", function () {
          if (done) return; done = true; answered++;
          var ok = oi === q.a; if (ok) correct++;
          $$(".opt", card).forEach(function (x, xi) { x.disabled = true; if (xi === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          why.textContent = (ok ? "Đúng. " : "Chưa đúng. ") + q.why; why.hidden = false;
          if (answered === L.quiz.length) finish();
        });
        card.appendChild(b);
      });
      card.appendChild(why);
      box.appendChild(card);
    });
    box.appendChild(info);
    // bài trước / sau
    var i = LESSONS.indexOf(L), nav = el("div", { class: "nav-row" });
    nav.appendChild(i > 0 ? el("a", { class: "btn2", href: "#/bai/" + LESSONS[i - 1].id, text: "← Bài " + LESSONS[i - 1].n }) : el("span"));
    nav.appendChild(i < LESSONS.length - 1 ? el("a", { class: "btn2 primary", href: "#/bai/" + LESSONS[i + 1].id, text: "Bài " + LESSONS[i + 1].n + " →" }) : el("a", { class: "btn2", href: "#/hoc", text: "Về danh sách" }));
    box.appendChild(nav);
  }

  function renderTn(q) {
    var list = $("#tn-list"), f = window.Chat.fold(q || ""), n = 0;
    list.textContent = "";
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
    addMsg("bot", { title: "Trợ lý giáo trình", paras: ["Mình chỉ tra trong 6 bài của giáo trình này, không dùng AI và không đoán ngoài nội dung. Chọn một gợi ý hoặc gõ từ khóa:"],
      chips: window.Chat.starters.map(function (s) { return { text: s, ask: s }; }) }, true);
  }
  $("#chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var i = $("#chat-in"), v = i.value; i.value = ""; ask(v);
  });
  $("#tn-q").addEventListener("input", function (e) { renderTn(e.target.value); });
  $("#back").addEventListener("click", function () { location.hash = "#/hoc"; });
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { try { history.replaceState(null, "", "#/lab/" + t.dataset.lab); } catch (e) { /* bỏ qua */ } });
  });

  // ---- điều hướng ----
  function route() {
    var parts = (location.hash || "#/hoc").replace(/^#\/?/, "").split("/");
    var page = parts[0] || "hoc", arg = parts[1];
    var main = $("#main");
    window.Labs.leave();
    if (page === "bai" && lessonById(arg)) {
      showView("bai"); renderBai(arg); setTitle("Bài " + lessonById(arg).n);
    } else if (page === "lab") {
      showView("lab"); setTitle("Thực hành"); window.Labs.enter(arg);
    } else if (page === "tn") {
      showView("tn"); setTitle("Thuật ngữ"); renderTn($("#tn-q").value);
    } else if (page === "hoi") {
      showView("hoi"); setTitle("Hỏi giáo trình"); initChat();
    } else {
      showView("hoc"); setTitle(TITLE); renderHoc();
    }
    main.scrollTop = 0;
    updateChip();
  }
  window.addEventListener("hashchange", route);
  route();

  // ---- dùng offline ----
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* không sao */ }); });
  }
})();
