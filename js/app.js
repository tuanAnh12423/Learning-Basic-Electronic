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
  function doneCount(p) { return LESSONS.filter(function (L) { return p[L.id] && p[L.id].total && p[L.id].score === p[L.id].total; }).length; } // 15/10/2026: phải có điểm bài tập, chỉ mở xem thì chưa tính
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

  // 15/10/2026: trạng thái từng bài — đã mở phần lý thuyết (seen) và điểm bài tập (score/total)
  function status(p, L) {
    var pr = p[L.id] || {};
    if (pr.total && pr.score === pr.total) return { k: "done", t: "Hoàn thành" };
    if (pr.total) return { k: "quiz", t: "Bài tập " + pr.score + "/" + pr.total };
    if (pr.seen) return { k: "seen", t: "Đang học" };
    return { k: "new", t: "Chưa học" };
  }
  function nextLesson(p) {
    // bài đầu tiên chưa hoàn thành
    for (var i = 0; i < LESSONS.length; i++) if (status(p, LESSONS[i]).k !== "done") return LESSONS[i];
    return null;
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  function renderHoc() {
    var p = loadProg(), box = $("#v-hoc");
    box.textContent = "";
    var n = doneCount(p), nx = nextLesson(p);
    // Khối "Học tiếp" kiểu màn hình LED trên máy — điểm nhấn duy nhất của trang
    var hero = el("a", { class: "resume", href: nx ? "#/bai/" + nx.id : "#/bai/" + LESSONS[0].id });
    var st = nx ? status(p, nx) : null;
    hero.appendChild(el("span", { class: "resume-led", "aria-hidden": "true", text: nx ? "BÀI " + pad2(nx.n) : "XONG" }));
    hero.appendChild(el("span", { class: "resume-body" }, [
      el("small", { text: !nx ? "Bạn đã hoàn thành cả " + LESSONS.length + " bài" : (st.k === "new" && n === 0 && !p[nx.id] ? "Bắt đầu học" : "Học tiếp") }),
      el("b", { text: nx ? nx.title : "Ôn lại từ Bài 1" })
    ]));
    hero.appendChild(el("span", { class: "resume-go", "aria-hidden": "true", text: "›" }));
    box.appendChild(hero);

    var bar = el("div", { class: "progress", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(LESSONS.length), "aria-valuenow": String(n), "aria-label": "Số bài đã hoàn thành" }, [el("i")]);
    bar.firstChild.style.width = (100 * n / LESSONS.length) + "%";
    box.appendChild(el("div", { class: "prog-row" }, [el("span", { text: "Đã hoàn thành " + n + " trên " + LESSONS.length + " bài" }), bar]));

    LESSONS.forEach(function (L) {
      var s2 = status(p, L);
      var a = el("a", { class: "lesson-card is-" + s2.k, href: "#/bai/" + L.id }, [
        el("span", { class: "num", text: s2.k === "done" ? "✓" : String(L.n) }),
        el("span", { class: "lc-body" }, [el("h3", { text: L.title }), el("p", { text: L.summary }), el("small", { class: "st st-" + s2.k, text: s2.t })])
      ]);
      box.appendChild(a);
    });
    box.appendChild(el("p", { class: "note", text: "Nội dung mang tính nguyên lý cơ bản. Khi sửa chữa thực tế, luôn xem tài liệu của hãng, cắt nguồn, xả tụ và đo xác nhận trước khi chạm vào." }));
  }

  // 15/10/2026: bài học chia 3 phần (Lý thuyết · Mô phỏng · Bài tập) bằng thanh chọn dính trên cùng,
  // để không phải cuộn cả bài dài mới tới bài tập. Đường dẫn: #/bai/b1/lt | /mp | /bt
  var PARTS = [["lt", "Lý thuyết"], ["mp", "Mô phỏng"], ["bt", "Bài tập"]];
  function labLead(id) { var e = $("#lab-" + id + " .lead"); return e ? e.textContent : ""; }

  function renderBai(id, part) {
    var L = lessonById(id), box = $("#v-bai");
    box.textContent = "";
    if (!L) { box.appendChild(el("p", { class: "empty", text: "Không tìm thấy bài này." })); return; }
    part = PARTS.some(function (x) { return x[0] === part; }) ? part : "lt";
    var p = loadProg(), pr = p[L.id] || {};

    var seg = el("nav", { class: "segbar", "aria-label": "Phần của bài" });
    PARTS.forEach(function (x) {
      var label = x[1];
      if (x[0] === "mp") label += " (" + (L.labs || []).length + ")";
      if (x[0] === "bt") label += pr.total ? " " + pr.score + "/" + pr.total : " (" + L.quiz.length + ")";
      var a = el("a", { href: "#/bai/" + L.id + "/" + x[0], text: label });
      if (x[0] === part) a.setAttribute("aria-current", "page");
      seg.appendChild(a);
    });
    box.appendChild(seg);
    box.appendChild(el("h2", { class: "lesson-h", text: L.title }));

    if (part === "lt") {
      if (!pr.seen) { pr.seen = true; p[L.id] = pr; saveProg(p); }
      box.appendChild(el("p", { class: "lead2", text: L.summary }));
      // mục lục nhanh: bấm để nhảy tới mục
      if (L.blocks.length > 3) {
        var toc = el("ol", { class: "toc", "aria-label": "Trong bài này" });
        L.blocks.forEach(function (b, i) {
          var a = el("a", { href: "#", text: b.h });
          a.addEventListener("click", function (e) { e.preventDefault(); var t = $("#sec-" + i); if (t) $("#main").scrollTop = t.offsetTop - 64; });
          toc.appendChild(el("li", {}, [a]));
        });
        box.appendChild(toc);
      }
      L.blocks.forEach(function (b, i) {
        var kids = [el("h3", { text: b.h })].concat(b.p.map(function (t) { return el("p", { text: t }); }));
        if (b.img) {
          kids.push(el("figure", { class: "fig" }, [
            el("a", { href: b.img.src, target: "_blank", rel: "noopener" }, [el("img", { src: b.img.src, alt: b.img.alt, loading: "lazy" })]),
            el("figcaption", { text: b.img.cap + " (chạm vào hình để mở lớn)" })]));
        }
        box.appendChild(el("section", { class: "sec", id: "sec-" + i }, kids));
      });
      var next = el("div", { class: "nav-row" });
      next.appendChild((L.labs && L.labs.length) ? el("a", { class: "btn2", href: "#/bai/" + L.id + "/mp", text: "Xem mô phỏng" }) : el("span"));
      next.appendChild(el("a", { class: "btn2 primary", href: "#/bai/" + L.id + "/bt", text: "Làm bài tập" }));
      box.appendChild(next);
    } else if (part === "mp") {
      if (!(L.labs || []).length) box.appendChild(el("p", { class: "empty", text: "Bài này chưa có mô phỏng." }));
      (L.labs || []).forEach(function (lab) {
        box.appendChild(el("a", { class: "lab-card", href: "#/lab/" + lab }, [
          el("b", { text: LAB_NAME[lab] }), el("p", { text: labLead(lab) }), el("span", { class: "btn2 primary", text: "Mở mô phỏng" })]));
      });
      box.appendChild(el("div", { class: "nav-row" }, [el("a", { class: "btn2", href: "#/bai/" + L.id + "/lt", text: "Đọc lý thuyết" }), el("a", { class: "btn2 primary", href: "#/bai/" + L.id + "/bt", text: "Làm bài tập" })]));
    } else {
      renderQuiz(L, box);
    }
  }

  // 15/10/2026: bài tập từng câu một — nút to, có thanh tiến độ, giải thích ngay sau khi chọn
  function renderQuiz(L, box) {
    var qi = 0, correct = 0, wrap = el("div", { class: "quiz" });
    box.appendChild(wrap);
    function dots() {
      var d = el("div", { class: "qdots", "aria-hidden": "true" });
      L.quiz.forEach(function (_, i) { d.appendChild(el("i", { class: i < qi ? "past" : i === qi ? "now" : "" })); });
      return d;
    }
    function showQ() {
      wrap.textContent = "";
      var q = L.quiz[qi], answered = false;
      wrap.appendChild(el("p", { class: "qcount", text: "Câu " + (qi + 1) + " / " + L.quiz.length }));
      wrap.appendChild(dots());
      var card = el("div", { class: "q" });
      card.appendChild(el("p", { class: "qt", text: q.q }));
      var why = el("p", { class: "why", hidden: "" });
      var go = el("button", { class: "btn2 primary qnext", type: "button", hidden: "", text: qi < L.quiz.length - 1 ? "Câu tiếp theo" : "Xem kết quả" });
      go.addEventListener("click", function () { qi++; if (qi < L.quiz.length) { showQ(); $("#main").scrollTop = 0; } else showResult(); });
      q.o.forEach(function (txt, oi) {
        var b = el("button", { class: "opt", type: "button", text: txt });
        b.addEventListener("click", function () {
          if (answered) return; answered = true;
          var ok = oi === q.a; if (ok) correct++;
          $$(".opt", card).forEach(function (x, xi) { x.disabled = true; if (xi === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
          why.className = "why " + (ok ? "is-ok" : "is-bad");
          why.textContent = (ok ? "Đúng. " : "Chưa đúng. ") + q.why; why.hidden = false; go.hidden = false;
          go.scrollIntoView({ block: "nearest" });
        });
        card.appendChild(b);
      });
      card.appendChild(why);
      wrap.appendChild(card);
      wrap.appendChild(go);
    }
    function showResult() {
      var p = loadProg(), pr = p[L.id] || {}; pr.score = correct; pr.total = L.quiz.length; pr.seen = true; p[L.id] = pr; saveProg(p); updateChip();
      var all = correct === L.quiz.length, i = LESSONS.indexOf(L), nx = LESSONS[i + 1];
      wrap.textContent = "";
      wrap.appendChild(el("div", { class: "result" }, [
        el("span", { class: "result-led", text: correct + "/" + L.quiz.length }),
        el("p", { text: all ? "Làm đúng hết. Bài này đã hoàn thành." : "Chưa đúng hết. Đọc lại phần lý thuyết rồi làm lại để hoàn thành bài." })]));
      var row = el("div", { class: "nav-row" });
      var again = el("button", { class: "btn2", type: "button", text: "Làm lại" });
      again.addEventListener("click", function () { qi = 0; correct = 0; showQ(); });
      row.appendChild(again);
      row.appendChild(all ? (nx ? el("a", { class: "btn2 primary", href: "#/bai/" + nx.id, text: "Sang Bài " + nx.n }) : el("a", { class: "btn2 primary", href: "#/hoc", text: "Về danh sách bài" }))
                          : el("a", { class: "btn2 primary", href: "#/bai/" + L.id + "/lt", text: "Đọc lại lý thuyết" }));
      wrap.appendChild(row);
      // cập nhật nhãn điểm trên thanh chọn
      var t = $$(".segbar a")[2]; if (t) t.textContent = "Bài tập " + correct + "/" + L.quiz.length;
    }
    showQ();
  }

  // 15/10/2026: thuật ngữ — lọc theo bài + ô tìm, link "Xem trong bài" thành nút đủ to để bấm
  var tnLesson = "";
  function renderTn(q) {
    var list = $("#tn-list"), f = window.Chat.fold(q || ""), n = 0;
    var chips = $("#tn-chips");
    if (!chips.childNodes.length) {
      [["", "Tất cả"]].concat(LESSONS.map(function (L) { return [L.id, "Bài " + L.n]; })).forEach(function (x) {
        var b = el("button", { type: "button", "data-l": x[0], text: x[1], "aria-pressed": x[0] === tnLesson ? "true" : "false" });
        b.addEventListener("click", function () { tnLesson = x[0]; $$("#tn-chips button").forEach(function (y) { y.setAttribute("aria-pressed", y === b ? "true" : "false"); }); renderTn($("#tn-q").value); });
        chips.appendChild(b);
      });
    }
    list.textContent = "";
    GLOSSARY.slice().sort(function (a, b) { return a.t.localeCompare(b.t, "vi"); }).forEach(function (g) {
      if (tnLesson && g.l !== tnLesson) return;
      if (f && window.Chat.fold(g.t + " " + g.k + " " + g.d).indexOf(f) < 0) return;
      n++;
      var L = lessonById(g.l);
      list.appendChild(el("div", { class: "term" }, [el("b", { text: g.t }), el("p", { text: g.d }),
        el("a", { class: "term-link", href: "#/bai/" + g.l, text: "Xem trong Bài " + (L ? L.n : "") })]));
    });
    if (!n) list.appendChild(el("p", { class: "empty", text: "Không có thuật ngữ này trong giáo trình. Thử từ ngắn hơn, ví dụ: tụ, relay, gas." }));
  }

  // 15/10/2026: dưới thanh mô phỏng ghi mô phỏng này thuộc bài nào + lối quay về bài
  function labContext(id) {
    var L = LESSONS.filter(function (x) { return (x.labs || []).indexOf(id) >= 0; })[0], box = $("#lab-ctx");
    box.textContent = "";
    if (!L) { box.hidden = true; return; }
    box.hidden = false;
    box.appendChild(el("span", { text: "Thuộc Bài " + L.n + ": " + L.title }));
    box.appendChild(el("a", { href: "#/bai/" + L.id, text: "Mở bài" }));
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
    addMsg("bot", { title: "Trợ lý giáo trình", paras: ["Mình chỉ tra trong 9 bài của giáo trình này, không dùng AI và không đoán ngoài nội dung. Chọn một gợi ý hoặc gõ từ khóa:"],
      chips: window.Chat.starters.map(function (s) { return { text: s, ask: s }; }) }, true);
  }
  $("#chat-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var i = $("#chat-in"), v = i.value; i.value = ""; ask(v);
  });
  $("#tn-q").addEventListener("input", function (e) { renderTn(e.target.value); });
  $("#back").addEventListener("click", function () { location.hash = "#/hoc"; });
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () { try { history.replaceState(null, "", "#/lab/" + t.dataset.lab); } catch (e) { /* bỏ qua */ } labContext(t.dataset.lab); });
  });

  // ---- điều hướng ----
  function route() {
    var parts = (location.hash || "#/hoc").replace(/^#\/?/, "").split("/");
    var page = parts[0] || "hoc", arg = parts[1], sub = parts[2];
    var main = $("#main");
    window.Labs.leave();
    if (page === "bai" && lessonById(arg)) {
      showView("bai"); renderBai(arg, sub); setTitle("Bài " + lessonById(arg).n);
    } else if (page === "lab") {
      showView("lab"); setTitle("Thực hành"); window.Labs.enter(arg);
      var cur = $(".tab[aria-selected=\"true\"]"); labContext(cur ? cur.dataset.lab : arg);
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
