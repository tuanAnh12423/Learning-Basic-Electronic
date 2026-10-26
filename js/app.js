/* Khung ứng dụng: điều hướng bằng hash (#/hoc, #/bai/b1, #/lab, #/lab/ohm, #/on, #/on/mix10, #/on/sai, #/on/the, #/on/kq,
   #/lk, #/lk/dien-tro, #/tra, #/tra/hoi; link cũ #/tn, #/hoi vẫn chạy), bài học, bài tập, linh kiện, ôn tập, tra cứu. */
(function () {
  "use strict";
  var LESSONS = window.LESSONS, GLOSSARY = window.GLOSSARY, COMPS = window.PARTS || [], PART_GROUPS = window.PART_GROUPS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var TITLE = "Học Điện Tử, Điện Lạnh";
  var LAB_NAME = { ohm: "Ohm", mau: "Mã màu điện trở", mach: "Nối tiếp, song song", tu: "Tụ nạp, xả", doi: "Xả tụ đôi",
    diode: "Diode", cau: "Cầu chỉnh lưu", lanh: "Chu trình lạnh", rl: "Relay + transistor", tim: "Tìm lỗi quạt" };
  if (window.LAB_NAME_EXTRA) Object.keys(window.LAB_NAME_EXTRA).forEach(function (k) { LAB_NAME[k] = window.LAB_NAME_EXTRA[k]; });
  window.LAB_NAME = LAB_NAME; // chat.js dùng để ghi tên mô phỏng

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

  // 23/10/2026: lưu thêm câu đã làm sai, điểm kiểm tra tổng hợp, tên, cỡ chữ, thẻ đã thuộc (chỉ trên máy này)
  var KEY_WRONG = "hdt_wrong_v1", KEY_MIX = "hdt_mix_v1", KEY_NAME = "hdt_name_v1", KEY_FS = "hdt_fs_v1", KEY_KNOWN = "hdt_known_v1";
  function load(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function today() { var d = new Date(); return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function btn(text, cls, fn) { var b = el("button", { class: cls || "btn2", type: "button", text: text }); if (fn) b.addEventListener("click", fn); return b; }
  function markAnswer(qid, ok) { var w = load(KEY_WRONG, {}) || {}; if (ok) delete w[qid]; else w[qid] = 1; save(KEY_WRONG, w); }
  function allQuestions() {
    var out = [];
    LESSONS.forEach(function (L) { L.quiz.forEach(function (q, i) { out.push({ q: q.q, o: q.o, a: q.a, why: q.why, qid: L.id + ":" + i, L: L }); }); });
    return out;
  }
  function wrongQuestions() { var w = load(KEY_WRONG, {}) || {}; return allQuestions().filter(function (x) { return w[x.qid]; }); }

  // thông báo nhỏ + chép chữ
  var toastT = 0;
  function toast(t) { var e = $("#toast"); e.textContent = t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { e.hidden = true; }, 2200); }
  function copyText(t, okMsg) {
    function fallback() {
      var ta = el("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast(okMsg); } catch (e) { toast("Không chép được, hãy chụp màn hình."); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { toast(okMsg); }, fallback); else fallback();
  }

  // cỡ chữ: nút Aa trên thanh trên, 3 mức
  var FS_NAME = ["Vừa", "Lớn", "Rất lớn"];
  function applyFs(n) { document.body.classList.remove("fs1", "fs2"); if (n) document.body.classList.add("fs" + n); }
  applyFs(load(KEY_FS, 0) || 0);
  $("#fs").addEventListener("click", function () { var n = ((load(KEY_FS, 0) || 0) + 1) % 3; save(KEY_FS, n); applyFs(n); toast("Cỡ chữ: " + FS_NAME[n]); });

  // ---- màn hình ----
  var VIEWS = ["hoc", "bai", "labs", "lab", "lk", "on", "tn", "hoi"], backTo = null;
  var NAV_OF = { bai: "hoc", labs: "lab", tn: "tra", hoi: "tra" };
  function showView(name, back) {
    VIEWS.forEach(function (v) { $("#v-" + v).hidden = v !== name; });
    var navKey = NAV_OF[name] || name;
    $$(".bottom a").forEach(function (a) {
      if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    backTo = back || (name === "bai" ? "#/hoc" : null);
    $("#back").hidden = !backTo;
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

    // 23/10/2026: 13 bài chia 3 phần; thẻ bài gọn, chỉ ghi trạng thái khi đã bắt đầu (xong thì số bài thành ✓)
    groupsOf(LESSONS).forEach(function (g) {
      var dn = g.ls.filter(function (L) { return status(p, L).k === "done"; }).length;
      box.appendChild(groupHead(g.t, dn + "/" + g.ls.length + " bài xong"));
      g.ls.forEach(function (L) {
        var s2 = status(p, L), body = [el("h3", { text: L.title }), el("p", { text: L.summary })];
        if (s2.k === "seen" || s2.k === "quiz") body.push(el("small", { class: "st st-" + s2.k, text: s2.t }));
        box.appendChild(el("a", { class: "lesson-card is-" + s2.k, href: "#/bai/" + L.id }, [
          el("span", { class: "num", text: s2.k === "done" ? "✓" : String(L.n) }), el("span", { class: "lc-body" }, body)]));
      });
    });
    box.appendChild(el("p", { class: "note", text: "Nội dung mang tính nguyên lý cơ bản. Khi sửa chữa thực tế, luôn xem tài liệu của hãng, cắt nguồn, xả tụ và đo xác nhận trước khi chạm vào." }));
  }

  // 3 phần của giáo trình (bài thêm sau số 13 tự vào phần cuối)
  var GROUPS = [["Phần 1 · Điện cơ bản", 1, 6], ["Phần 2 · Bo nguồn inverter", 7, 9], ["Phần 3 · Cảm biến và đo lường", 10, 999]];
  function groupsOf(list) {
    return GROUPS.map(function (g) { return { t: g[0], ls: list.filter(function (L) { return L.n >= g[1] && L.n <= g[2]; }) }; })
      .filter(function (g) { return g.ls.length; });
  }
  function groupHead(t, right) { return el("h2", { class: "group-h" }, [el("span", { text: t }), el("small", { text: right })]); }

  function searchAll(q) {
    var f = window.Chat.fold(q), out = [];
    if (f.length < 2) return out;
    LESSONS.forEach(function (L) {
      L.blocks.forEach(function (b, i) {
        if (window.Chat.fold(b.h + " " + (b.kw || "") + " " + b.p.join(" ")).indexOf(f) >= 0)
          out.push({ t: b.h, s: "Bài " + L.n + " · " + L.title, href: "#/bai/" + L.id + "/lt/" + i });
      });
    });
    GLOSSARY.forEach(function (g) {
      if (window.Chat.fold(g.t + " " + g.k + " " + g.d).indexOf(f) >= 0) out.push({ t: g.t, s: "Thuật ngữ · " + g.d, href: "#/bai/" + g.l });
    });
    Object.keys(LAB_NAME).forEach(function (k) {
      if (window.Chat.fold(LAB_NAME[k] + " " + labLead(k)).indexOf(f) >= 0) out.push({ t: "Mô phỏng: " + LAB_NAME[k], s: labLead(k), href: "#/lab/" + k });
    });
    COMPS.forEach(function (P) {
      if (window.Chat.fold(P.n + " " + P.aka + " " + P.look.join(" ") + " " + P.how.join(" ")).indexOf(f) >= 0)
        out.push({ t: "Linh kiện: " + P.n, s: PART_GROUPS[P.g] + " · " + P.how[0], href: "#/lk/" + P.id });
    });
    return out;
  }

  // 15/10/2026: bài học chia 3 phần (Lý thuyết · Mô phỏng · Bài tập) bằng thanh chọn dính trên cùng,
  // để không phải cuộn cả bài dài mới tới bài tập. Đường dẫn: #/bai/b1/lt | /mp | /bt
  var PARTS = [["lt", "Lý thuyết"], ["mp", "Mô phỏng"], ["bt", "Bài tập"]];
  function labLead(id) { var e = $("#lab-" + id + " .lead"); return e ? e.textContent : ""; }

  // ---- trình bày đoạn chữ: tách danh sách đánh số, bước, mã in, triệu chứng... (không đổi nội dung, chỉ đổi cách hiển thị) ----
  var GROUP_COLOR = { "Cam": "#C2570C", "Đỏ": "#C4000F", "Vàng": "#A16207", "Xanh lá": "#15803D", "Tím": "#7C3AED", "Xanh dương": "#1D4ED8" };
  var ITEM_START = /([.)])\s+(?=\d{1,2}(?: \(\d+ con\))?(?: (?:và|đến) \d{1,2})?: )/g;
  var ITEM_HEAD = /^(\d{1,2}(?: \(\d+ con\))?(?: (?:và|đến) \d{1,2})?): ([\s\S]+)$/;
  function sentences(t) { return t.split(/\.\s+(?=[A-ZÀ-Ỵa-z0-9])/).map(function (x) { return x.replace(/\.$/, "").trim(); }).filter(Boolean); }
  function boldHead(txt) { // in đậm cụm đầu (trước dấu phẩy đầu tiên ngoài ngoặc) nếu đủ ngắn
    var depth = 0, i;
    for (i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (c === "(") depth++; else if (c === ")") depth = Math.max(0, depth - 1);
      else if (c === "," && !depth) break;
    }
    if (i < txt.length && i <= 46) return [el("b", { text: txt.slice(0, i) }), txt.slice(i)];
    return [txt];
  }
  function itemList(parts, color) {
    var ul = el("ul", { class: "items" });
    parts.forEach(function (it) {
      var m = ITEM_HEAD.exec(it);
      var num = el("span", { class: "no", text: m[1].replace(" đến ", "–").replace(" và ", " + ") });
      if (color) num.style.background = color;
      var body = el("span", { class: "tx" }, boldHead(m[2].replace(/\.$/, "") + "."));
      ul.appendChild(el("li", {}, [num, body]));
    });
    return ul;
  }
  // Bài nào cần trình bày dạng danh sách số, bảng mã, hàng triệu chứng thì thêm id vào đây (các bài khác giữ nguyên đoạn văn)
  var RICH_LESSONS = ["b9"];
  function para(t, rich) {
    var m;
    // 1) ghi chú đầu bài / cảnh báo / mẹo
    if ((m = /^(Mẹo|An toàn|Lưu ý|Chú ý|Cảnh báo)\s*:\s*([\s\S]+)$/.exec(t))) {
      var warn = /^(An toàn|Cảnh báo)$/.test(m[1]);
      return el("div", { class: "callout " + (warn ? "warn2" : "tip") }, [el("b", { text: m[1] }), m[2].charAt(0).toUpperCase() + m[2].slice(1)]);
    }
    if (/^(Nội dung dựa trên|Dưới đây là suy luận|Tài liệu và ảnh có vài chỗ|Hình cắt từ ảnh)/.test(t)) return el("p", { class: "note", text: t });
    // 2) Bước N.
    if (rich && (m = /^Bước (\d+)\.\s*([\s\S]+)$/.exec(t))) {
      return el("div", { class: "step" }, [el("span", { class: "no", text: m[1] }), el("span", { class: "tx" }, boldHead2(m[2]))]);
    }
    // 3) danh sách đánh số: "Cam. 1: ... 2: ..." hoặc "1: ... 2: ..."
    var grp = null, body = t;
    if ((m = /^([A-ZÀ-Ỵ][\p{L} ]{1,11})\.\s+(?=\d{1,2}[ :(])/u.exec(t)) && GROUP_COLOR[m[1]]) { grp = m[1]; body = t.slice(m[0].length); }
    var parts = body.replace(ITEM_START, "$1\u0001").split("\u0001");
    if (rich && parts.length >= 1 && parts.every(function (x) { return ITEM_HEAD.test(x); })) {
      var box = el("div", { class: "grp" });
      if (grp) { var h = el("div", { class: "gh" }, [el("i"), grp]); h.firstChild.style.background = GROUP_COLOR[grp]; box.appendChild(h); }
      box.appendChild(itemList(parts, grp ? GROUP_COLOR[grp] : ""));
      return box;
    }
    // 4) "Nhãn: a, b, c, d" dạng chuỗi nối tiếp (đường hồi tiếp)
    if (rich && (m = /^(Đường [^:.]{2,24}): ([\s\S]+)$/.exec(t))) {
      var chain = m[2].replace(/\.$/, "").split(/,\s+/);
      if (chain.length >= 4) {
        var fl = el("div", { class: "flow" });
        chain.forEach(function (c, i) { fl.appendChild(el("span", { class: "fc", text: (i ? "› " : "") + c })); });
        return el("div", { class: "flowbox" }, [el("b", { text: m[1] }), fl]);
      }
    }
    // 5) bảng đọc mã: "2703 = 270 kΩ. 6803 = ..."
    var label = "", rest = t;
    if (rich && (m = /^([^:.=]{2,28}):\s+(?=[0-9A-Z]{3,6} = )/.exec(t))) { label = m[1]; rest = t.slice(m[0].length); }
    var ss = sentences(rest);
    var CODE = /^[0-9A-Z]{3,6} = /;
    if (rich && ss.length >= 1 && ss.every(function (x) { return CODE.test(x); })) {
      var tb = el("div", { class: "codes" });
      if (label) tb.appendChild(el("div", { class: "cl", text: label }));
      ss.forEach(function (x) { var k = x.indexOf(" = "); tb.appendChild(el("div", { class: "cr" }, [el("code", { text: x.slice(0, k) }), el("span", { text: x.slice(k + 3) })])); });
      return tb;
    }
    // 6) hàng "triệu chứng → nghi ngờ"
    ss = sentences(t);
    if (rich && ss.length >= 2 && ss.every(function (x) { var k = x.indexOf(": "); return k > 3 && k <= 80; })) {
      var rows = el("div", { class: "sym" });
      ss.forEach(function (x) { var k = x.indexOf(": "); rows.appendChild(el("div", { class: "sr" }, [el("b", { text: x.slice(0, k) }), el("span", { text: x.slice(k + 2) + "." })])); });
      return rows;
    }
    // 7) đoạn dài bình thường: xuống dòng theo câu để không dính thành một khối
    if (t.length > 300 && ss.length >= 3) {
      var wrap = el("div", { class: "lines" });
      ss.forEach(function (x) { wrap.appendChild(el("p", { text: x + "." })); });
      return wrap;
    }
    return el("p", { text: t });
  }
  function boldHead2(txt) { // câu đầu của một bước in đậm
    var k = txt.indexOf(": "); var d = txt.indexOf(". ");
    var cut = (k > 0 && (d < 0 || k < d)) ? k + 1 : (d > 0 && d <= 70 ? d + 1 : -1);
    return cut > 0 ? [el("b", { text: txt.slice(0, cut) }), " " + txt.slice(cut).trim()] : [txt];
  }
  function hasItems(b, rich) { return rich && b.p.some(function (t) { return para(t, true).className === "grp"; }); }

  function renderBai(id, part, blk) {
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
        var kids = [el("h3", { text: b.h })];
        var figNode = null;
        if (b.img) {
          figNode = el("figure", { class: "fig" }, [
            el("a", { href: b.img.src, target: "_blank", rel: "noopener" }, [el("img", { src: b.img.src, alt: b.img.alt, loading: "lazy" })]),
            el("figcaption", { text: b.img.cap + " (chạm vào hình để mở lớn)" })]);
        }
        // bài có danh sách đánh số thì đặt hình ngay sau đoạn mở đầu để vừa đọc vừa nhìn số trên hình
        var rich = RICH_LESSONS.indexOf(L.id) >= 0;
        var figFirst = figNode && hasItems(b, rich);
        b.p.forEach(function (t, pi) {
          kids.push(para(t, rich));
          if (figFirst && pi === 0) kids.push(figNode);
        });
        if (figNode && !figFirst) kids.push(figNode);
        if (b.parts) {
          b.parts.forEach(function (pt) {
            kids.push(el("figure", { class: "fig part" }, [
              el("h4", { text: pt.n }),
              el("a", { href: pt.src, target: "_blank", rel: "noopener" }, [el("img", { src: pt.src, alt: pt.n, loading: "lazy" })]),
              el("figcaption", { text: pt.t })]));
          });
        }
        box.appendChild(el("section", { class: "sec", id: "sec-" + i }, kids));
      });
      if (blk != null) setTimeout(function () { var t = $("#sec-" + blk); if (t) { $("#main").scrollTop = t.offsetTop - 64; t.classList.add("flash-sec"); setTimeout(function () { t.classList.remove("flash-sec"); }, 1600); } }, 0);
      var lk = COMPS.filter(function (P) { return P.l.indexOf(L.id) >= 0; });
      if (lk.length) {
        var lkBox = el("div", { class: "pchips" });
        lk.forEach(function (P) { lkBox.appendChild(el("a", { href: "#/lk/" + P.id, text: P.n })); });
        box.appendChild(el("section", { class: "sec" }, [el("h3", { text: "Linh kiện trong bài" }),
          el("p", { class: "note", text: "Xem cách nhận dạng, nguyên lý, đo kiểm và hư hỏng thường gặp:" }), lkBox]));
      }
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
  // 23/10/2026: dùng chung cho bài học, kiểm tra tổng hợp và ôn câu sai. Thứ tự đáp án được trộn mỗi lần làm
  // (đáp án đúng trong dữ liệu dồn nhiều ở vị trí B), câu sai được ghi lại để ôn.
  function quizRunner(wrap, items, opt) {
    var qi = 0, correct = 0, results = [];
    function dots() {
      var d = el("div", { class: "qdots", "aria-hidden": "true" });
      items.forEach(function (_, i) { d.appendChild(el("i", { class: i < qi ? "past" : i === qi ? "now" : "" })); });
      return d;
    }
    function showQ() {
      wrap.textContent = "";
      var q = items[qi], answered = false;
      wrap.appendChild(el("p", { class: "qcount", text: "Câu " + (qi + 1) + " / " + items.length }));
      wrap.appendChild(dots());
      var card = el("div", { class: "q" });
      if (opt.tag) card.appendChild(el("span", { class: "qtag", text: "Bài " + q.L.n + " · " + q.L.title }));
      card.appendChild(el("p", { class: "qt", text: q.q }));
      var why = el("p", { class: "why", hidden: "" });
      var go = el("button", { class: "btn2 primary qnext", type: "button", hidden: "", text: qi < items.length - 1 ? "Câu tiếp theo" : "Xem kết quả" });
      go.addEventListener("click", function () { qi++; if (qi < items.length) { showQ(); $("#main").scrollTop = 0; } else opt.onDone(correct, results, restart); });
      shuffle(q.o.map(function (_, i) { return i; })).forEach(function (oi) {
        var b = el("button", { class: "opt", type: "button", text: q.o[oi] });
        b.dataset.oi = oi;
        b.addEventListener("click", function () {
          if (answered) return; answered = true;
          var ok = oi === q.a; if (ok) correct++;
          results.push({ q: q, ok: ok }); markAnswer(q.qid, ok);
          $$(".opt", card).forEach(function (x) { x.disabled = true; if (+x.dataset.oi === q.a) x.classList.add("right"); else if (x === b) x.classList.add("wrong"); });
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
    function restart() { qi = 0; correct = 0; results = []; showQ(); }
    showQ();
  }

  function renderQuiz(L, box) {
    var wrap = el("div", { class: "quiz" });
    box.appendChild(wrap);
    var items = L.quiz.map(function (q, i) { return { q: q.q, o: q.o, a: q.a, why: q.why, qid: L.id + ":" + i, L: L }; });
    quizRunner(wrap, items, { onDone: function (correct, _r, restart) { showResult(correct, restart); } });
    function showResult(correct, restart) {
      var p = loadProg(), pr = p[L.id] || {}; pr.score = correct; pr.total = L.quiz.length; pr.seen = true; p[L.id] = pr; saveProg(p); updateChip();
      var all = correct === L.quiz.length, i = LESSONS.indexOf(L), nx = LESSONS[i + 1];
      wrap.textContent = "";
      wrap.appendChild(el("div", { class: "result" }, [
        el("span", { class: "result-led", text: correct + "/" + L.quiz.length }),
        el("p", { text: all ? "Làm đúng hết. Bài này đã hoàn thành." : "Chưa đúng hết. Đọc lại phần lý thuyết rồi làm lại để hoàn thành bài." })]));
      var row = el("div", { class: "nav-row" });
      var again = el("button", { class: "btn2", type: "button", text: "Làm lại" });
      again.addEventListener("click", restart);
      row.appendChild(again);
      row.appendChild(all ? (nx ? el("a", { class: "btn2 primary", href: "#/bai/" + nx.id, text: "Sang Bài " + nx.n }) : el("a", { class: "btn2 primary", href: "#/hoc", text: "Về danh sách bài" }))
                          : el("a", { class: "btn2 primary", href: "#/bai/" + L.id + "/lt", text: "Đọc lại lý thuyết" }));
      wrap.appendChild(row);
      // cập nhật nhãn điểm trên thanh chọn
      var t = $$(".segbar a")[2]; if (t) t.textContent = "Bài tập " + correct + "/" + L.quiz.length;
    }
  }

  // ---- ÔN TẬP (23/10/2026) ----
  function renderOnMenu(box) {
    var w = wrongQuestions().length, mix = load(KEY_MIX, null), known = Object.keys(load(KEY_KNOWN, {}) || {}).length;
    box.appendChild(el("p", { class: "lead2", text: "Ôn lại sau khi học. Mọi kết quả chỉ lưu trên điện thoại này." }));
    function item(href, h, p, badge) {
      return el("a", { class: "lesson-card", href: href }, [el("span", { class: "num ic", text: badge }), el("span", { class: "lc-body" }, [el("h3", { text: h }), el("p", { text: p })])]);
    }
    box.appendChild(item("#/on/mix10", "Kiểm tra nhanh 10 câu", "Câu hỏi lấy ngẫu nhiên từ cả " + LESSONS.length + " bài.", "10"));
    box.appendChild(item("#/on/mix20", "Kiểm tra tổng hợp 20 câu", mix ? "Lần gần nhất: " + mix.score + "/" + mix.total + " (" + mix.date + ")" : "Chưa làm lần nào.", "20"));
    box.appendChild(item("#/on/sai", "Ôn câu đã làm sai", w ? "Còn " + w + " câu cần ôn. Làm đúng thì câu đó được xóa khỏi danh sách." : "Chưa có câu sai nào.", w ? String(w) : "✓"));
    box.appendChild(item("#/on/the", "Thẻ ghi nhớ thuật ngữ", "Lật thẻ để nhớ " + GLOSSARY.length + " thuật ngữ. Đã thuộc " + known + " thẻ.", "Aa"));
    box.appendChild(item("#/on/kq", "Kết quả học tập", "Bảng điểm từng bài để chụp màn hình hoặc chép gửi người phụ trách training.", "★"));
  }

  function renderMix(box, n) {
    var items = shuffle(allQuestions()).slice(0, n), wrap = el("div", { class: "quiz" });
    box.appendChild(wrap);
    quizRunner(wrap, items, { tag: true, onDone: function (c, res) {
      if (n >= 20) save(KEY_MIX, { score: c, total: n, date: today() });
      var by = {};
      res.forEach(function (r) { var k = r.q.L.id; by[k] = by[k] || { L: r.q.L, ok: 0, n: 0 }; by[k].n++; if (r.ok) by[k].ok++; });
      wrap.textContent = "";
      wrap.appendChild(el("div", { class: "result" }, [el("span", { class: "result-led", text: c + "/" + n }),
        el("p", { text: c === n ? "Đúng hết. Rất tốt!" : "Đúng " + Math.round(100 * c / n) + "%. Nên đọc lại các bài dưới đây." })]));
      Object.keys(by).map(function (k) { return by[k]; }).filter(function (x) { return x.ok < x.n; }).forEach(function (x) {
        wrap.appendChild(el("a", { class: "hit", href: "#/bai/" + x.L.id }, [el("b", { text: "Bài " + x.L.n + " · " + x.L.title }), el("small", { text: "Đúng " + x.ok + "/" + x.n + " câu" })]));
      });
      wrap.appendChild(el("div", { class: "nav-row" }, [btn("Làm đề khác", "btn2", function () { route(); }), el("a", { class: "btn2 primary", href: "#/on", text: "Về Ôn tập" })]));
    } });
  }

  function renderSai(box) {
    var items = wrongQuestions();
    if (!items.length) {
      box.appendChild(el("p", { class: "empty", text: "Chưa có câu sai nào để ôn. Khi làm bài tập mà trả lời sai, câu đó sẽ hiện ở đây." }));
      box.appendChild(el("a", { class: "btn2 primary wide", href: "#/on/mix10", text: "Làm kiểm tra nhanh 10 câu" }));
      return;
    }
    var wrap = el("div", { class: "quiz" }); box.appendChild(wrap);
    quizRunner(wrap, shuffle(items), { tag: true, onDone: function (c) {
      var left = wrongQuestions().length;
      wrap.textContent = "";
      wrap.appendChild(el("div", { class: "result" }, [el("span", { class: "result-led", text: c + "/" + items.length }),
        el("p", { text: left ? "Còn " + left + " câu cần ôn tiếp." : "Đã hết câu sai. Rất tốt!" })]));
      wrap.appendChild(el("div", { class: "nav-row" }, [left ? btn("Ôn tiếp", "btn2", function () { route(); }) : el("span"), el("a", { class: "btn2 primary", href: "#/on", text: "Về Ôn tập" })]));
    } });
  }

  var fc = null; // trạng thái thẻ ghi nhớ
  function renderThe(box) {
    var known = load(KEY_KNOWN, {}) || {};
    if (!fc) fc = { order: shuffle(GLOSSARY.map(function (_, i) { return i; })), i: 0, flip: false, onlyNew: true };
    function deck() { return fc.order.filter(function (k) { return !fc.onlyNew || !known[GLOSSARY[k].t]; }); }
    function draw() {
      box.textContent = "";
      var d = deck();
      box.appendChild(el("p", { class: "lead2", text: "Chạm vào thẻ để lật. Đã thuộc " + Object.keys(known).length + "/" + GLOSSARY.length + " thẻ." }));
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
        L ? el("a", { class: "btn2", href: "#/bai/" + L.id, text: "Xem trong Bài " + L.n }) : el("span")
      ]));
    }
    draw();
  }

  function resultText(name) {
    var p = loadProg(), mix = load(KEY_MIX, null), lines = ["KẾT QUẢ HỌC ĐIỆN TỬ, ĐIỆN LẠNH", "Họ tên: " + (name || "(chưa nhập)"), "Ngày: " + today(),
      "Hoàn thành: " + doneCount(p) + "/" + LESSONS.length + " bài", ""];
    LESSONS.forEach(function (L) {
      var pr = p[L.id];
      lines.push("Bài " + L.n + ". " + L.title + ": " + (pr && pr.total ? pr.score + "/" + pr.total + (pr.score === pr.total ? " ✓" : "") : "chưa làm"));
    });
    lines.push("", "Kiểm tra tổng hợp 20 câu: " + (mix ? mix.score + "/" + mix.total + " (" + mix.date + ")" : "chưa làm"), "Câu sai còn cần ôn: " + wrongQuestions().length);
    return lines.join("\n");
  }
  function renderKq(box) {
    var p = loadProg(), mix = load(KEY_MIX, null);
    var name = el("input", { class: "search", type: "text", placeholder: "Nhập họ tên của bạn", autocomplete: "name", "aria-label": "Họ tên" });
    name.value = load(KEY_NAME, "") || "";
    var nm = el("b", { text: name.value || "(chưa nhập tên)" });
    name.addEventListener("input", function () { save(KEY_NAME, name.value.trim()); nm.textContent = name.value.trim() || "(chưa nhập tên)"; });
    box.appendChild(name);
    var sheet = el("div", { class: "sheet" });
    sheet.appendChild(el("div", { class: "sheet-h" }, [el("span", { text: "KẾT QUẢ HỌC TẬP" }), el("small", { text: today() })]));
    sheet.appendChild(el("p", { class: "sheet-n" }, [nm]));
    sheet.appendChild(el("p", { class: "sheet-s", text: "Hoàn thành " + doneCount(p) + "/" + LESSONS.length + " bài · Kiểm tra 20 câu: " + (mix ? mix.score + "/" + mix.total : "chưa làm") + " · Câu sai cần ôn: " + wrongQuestions().length }));
    var tb = el("table", { class: "tbl" });
    tb.appendChild(el("tr", {}, [el("th", { text: "Bài" }), el("th", { text: "Điểm" }), el("th", { text: "" })]));
    LESSONS.forEach(function (L) {
      var pr = p[L.id], ok = pr && pr.total && pr.score === pr.total;
      tb.appendChild(el("tr", {}, [el("td", { text: L.n + ". " + L.title }), el("td", { class: "num2", text: pr && pr.total ? pr.score + "/" + pr.total : "—" }),
        el("td", { class: ok ? "good" : "", text: ok ? "✓" : "" })]));
    });
    sheet.appendChild(tb);
    box.appendChild(sheet);
    box.appendChild(el("p", { class: "note", text: "Chụp màn hình bảng này, hoặc bấm Chép kết quả rồi dán vào Zalo hay email để gửi người phụ trách training." }));
    box.appendChild(el("div", { class: "nav-row" }, [
      btn("Chép kết quả", "btn2 primary", function () { copyText(resultText(name.value.trim()), "Đã chép kết quả"); }),
      el("a", { class: "btn2", href: "#/on/mix20", text: "Làm kiểm tra 20 câu" })
    ]));
    box.appendChild(el("details", { class: "reset" }, [el("summary", { text: "Xóa toàn bộ kết quả trên máy này" }),
      el("p", { class: "note", text: "Dùng khi đưa điện thoại cho người khác học. Không lấy lại được." }),
      btn("Xóa kết quả", "btn2 danger", function () {
        if (!confirm("Xóa toàn bộ điểm, câu sai và thẻ đã thuộc trên máy này?")) return;
        [KEY, KEY_WRONG, KEY_MIX, KEY_KNOWN].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } });
        fc = null; updateChip(); route(); toast("Đã xóa kết quả");
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

  // 15/10/2026: thuật ngữ — lọc theo bài + ô tìm, link "Xem trong bài" thành nút đủ to để bấm
  // 23/10/2026: thành trang Tra cứu — một ô tìm cho thuật ngữ, bài và mô phỏng; nút hỏi trợ lý ngay dưới ô tìm
  var tnLesson = "", askLater = "";
  function renderAsk(q) {
    var box = $("#tn-ask");
    box.textContent = "";
    var a = el("a", { class: "lesson-card ask-card", href: "#/tra/hoi" }, [el("span", { class: "num ic", text: "?" }),
      el("span", { class: "lc-body" }, [el("h3", { text: q ? "Hỏi trợ lý: “" + q + "”" : "Hỏi trợ lý giáo trình" }),
        el("p", { text: q ? "Trợ lý tìm trong " + LESSONS.length + " bài và trả lời gọn." : "Gõ kiểu quen miệng cũng được: lốc, capa, xả tụ, cục nóng..." })])]);
    a.addEventListener("click", function () { askLater = q || ""; });
    box.appendChild(a);
  }
  function renderTn(q) {
    q = (q || "").trim(); renderAsk(q);
    var list = $("#tn-list"), f = window.Chat.fold(q), n = 0;
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
    var hits = q ? searchAll(q).filter(function (x) { return x.s.indexOf("Thuật ngữ") !== 0; }) : [];
    if (hits.length) {
      list.appendChild(el("p", { class: "lab-grp", text: "Trong bài và mô phỏng (" + hits.length + ")" }));
      hits.slice(0, 30).forEach(function (x) { list.appendChild(el("a", { class: "hit", href: x.href }, [el("b", { text: x.t }), el("small", { text: x.s })])); });
    }
    if (!n && !hits.length) list.appendChild(el("p", { class: "empty", text: "Không thấy trong giáo trình. Thử từ ngắn hơn (tụ, relay, gas) hoặc bấm Hỏi trợ lý ở trên." }));
  }

  // ---- THỰC HÀNH (23/10/2026) ----
  // Bỏ dải 32 tab vuốt ngang: #/lab là danh sách mô phỏng chia theo bài, #/lab/id mở một mô phỏng.
  // Mỗi mô phỏng có phần đầu chung (thuộc bài nào, tên, giới thiệu, nút Trước / Bài / Sau), hình thực tế ngay dưới.
  function lessonOfLab(id) { return LESSONS.filter(function (x) { return (x.labs || []).indexOf(id) >= 0; })[0]; }
  var LAB_ORDER = [];
  LESSONS.forEach(function (L) { (L.labs || []).forEach(function (id) { if ($("#lab-" + id) && LAB_ORDER.indexOf(id) < 0) LAB_ORDER.push(id); }); });
  $$("section.lab").forEach(function (s) { var id = s.id.slice(4); if (LAB_ORDER.indexOf(id) < 0) LAB_ORDER.push(id); });

  function tidyLabs() {
    LAB_ORDER.forEach(function (id, i) {
      var sec = $("#lab-" + id), L = lessonOfLab(id);
      var sim = sec.querySelector(".card:not(.real)"), real = sec.querySelector(".card.real");
      var h = sim && sim.querySelector(":scope > h2"), ld = sim && sim.querySelector(":scope > .lead");
      var name = (h ? h.textContent : LAB_NAME[id] || id).replace(/^Bài \d+(, câu \d+)?:\s*/, "");
      var head = el("div", { class: "lab-head" });
      var eb = L ? "Bài " + L.n + " · mô phỏng " + (L.labs.indexOf(id) + 1) + "/" + L.labs.length : "Mô phỏng";
      head.appendChild(el("div", { class: "lab-top" }, [el("p", { class: "eyebrow", text: eb })]));
      head.appendChild(el("h2", { text: name }));
      if (ld) head.appendChild(ld);
      var prev = LAB_ORDER[i - 1], next = LAB_ORDER[i + 1];
      head.appendChild(el("nav", { class: "lab-nav", "aria-label": "Chuyển mô phỏng" }, [
        prev ? el("a", { href: "#/lab/" + prev, title: LAB_NAME[prev] || "", text: "‹ Trước" }) : el("span"),
        L ? el("a", { class: "go-bai", href: "#/bai/" + L.id, text: "Mở Bài " + L.n }) : el("span"),
        next ? el("a", { href: "#/lab/" + next, title: LAB_NAME[next] || "", text: "Sau ›" }) : el("span")]));
      sec.insertBefore(head, sec.firstChild);
      if (h) h.replaceWith(el("p", { class: "sub-h", text: "Sơ đồ và số đo" }));
      if (real) {
        var rh = real.querySelector(":scope > h2");
        if (rh) { rh.className = "sub-h"; rh.textContent = "Hình thực tế · " + rh.textContent.replace(/^Hình thực tế:\s*/, ""); }
      }
      // "Thử", ghi chú phụ: gom vào một mục mở ra khi cần, cảnh báo an toàn vẫn để hiện
      var extra = sim ? $$(":scope > .try, :scope > .lab-note, :scope > p.note:not([id])", sim) : [];
      if (extra.length) {
        var d = el("details", { class: "more" }, [el("summary", { text: "Gợi ý thử và ghi chú" })]);
        extra[0].parentNode.insertBefore(d, extra[0]);
        extra.forEach(function (x) { d.appendChild(x); });
      }
    });
  }
  tidyLabs();

  function labEnter(id) {
    var top = $("#lab-" + id + " .lab-top");
    if (top) top.appendChild($("#pause")); // một nút Tạm dừng dùng chung, đặt vào mô phỏng đang mở
  }

  function renderLabMenu() {
    var box = $("#v-labs");
    box.textContent = "";
    box.appendChild(el("p", { class: "lead2", text: LAB_ORDER.length + " mô phỏng, xếp theo bài. Mỗi mô phỏng có hình thực tế và sơ đồ để thử." }));
    groupsOf(LESSONS.filter(function (L) { return (L.labs || []).length; })).forEach(function (g) {
      var n = 0; g.ls.forEach(function (L) { n += L.labs.length; });
      box.appendChild(groupHead(g.t, n + " mô phỏng"));
      g.ls.forEach(function (L) {
        box.appendChild(el("p", { class: "lab-grp", text: "Bài " + L.n + " · " + L.title }));
        L.labs.forEach(function (id) {
          if (!$("#lab-" + id)) return;
          box.appendChild(el("a", { class: "lab-row", href: "#/lab/" + id }, [
            el("span", { class: "lr-b" }, [el("b", { text: LAB_NAME[id] || id }), el("small", { text: labLead(id) })])]));
        });
      });
    });
  }

  // ---- LINH KIỆN (26/10/2026) ----
  // #/lk: danh sách 4 nhóm, có ô lọc. #/lk/id: nhận dạng + ký hiệu, nguyên lý, công dụng, đo kiểm từng bước, hư hỏng, an toàn.
  function partById(id) { return COMPS.filter(function (P) { return P.id === id; })[0]; }
  function symNode(key, cls) { var s = el("span", { class: cls || "psym-wrap", "aria-hidden": "true" }); s.innerHTML = window.PartSym(key); return s; } // SVG cố định trong js/parts-sym.js
  var lkQuery = "";
  function renderPartList() {
    var box = $("#v-lk");
    box.textContent = "";
    box.appendChild(el("p", { class: "lead2", text: COMPS.length + " linh kiện thường gặp trên máy lạnh, tủ lạnh, máy giặt, máy lọc nước. Mỗi linh kiện có nhận dạng, nguyên lý, cách đo kiểm và hư hỏng thường gặp." }));
    var q = el("input", { class: "search", type: "search", placeholder: "Lọc: tụ, diode, van, bơm...", autocomplete: "off", enterkeyhint: "search", "aria-label": "Lọc linh kiện" });
    q.value = lkQuery;
    var list = el("div");
    box.appendChild(q); box.appendChild(list);
    function draw() {
      list.textContent = "";
      var f = window.Chat.fold(lkQuery), n = 0;
      [1, 2, 3, 4].forEach(function (g) {
        var ps = COMPS.filter(function (P) { return P.g === g && (!f || window.Chat.fold(P.n + " " + P.aka).indexOf(f) >= 0); });
        if (!ps.length) return;
        n += ps.length;
        list.appendChild(groupHead(PART_GROUPS[g], ps.length + " linh kiện"));
        ps.forEach(function (P) {
          list.appendChild(el("a", { class: "lab-row part-row", href: "#/lk/" + P.id }, [symNode(P.sym, "psym-ico"),
            el("span", { class: "lr-b" }, [el("b", { text: P.n }), el("small", { text: P.how[0] })])]));
        });
      });
      if (!n) list.appendChild(el("p", { class: "empty", text: "Không có linh kiện này. Thử từ ngắn hơn, hoặc tìm ở trang Tra cứu." }));
    }
    q.addEventListener("input", function () { lkQuery = q.value.trim(); draw(); });
    draw();
  }
  function renderPart(id) {
    var P = partById(id), box = $("#v-lk"), i = COMPS.indexOf(P);
    box.textContent = "";
    var head = el("div", { class: "lab-head" }, [el("p", { class: "eyebrow", text: PART_GROUPS[P.g] + " · " + (i + 1) + "/" + COMPS.length }), el("h2", { class: "part-h", text: P.n })]);
    var prev = COMPS[i - 1], next = COMPS[i + 1];
    head.appendChild(el("nav", { class: "lab-nav", "aria-label": "Chuyển linh kiện" }, [
      prev ? el("a", { href: "#/lk/" + prev.id, title: prev.n, text: "‹ Trước" }) : el("span"),
      el("a", { class: "go-bai", href: "#/lk", text: "Danh sách" }),
      next ? el("a", { href: "#/lk/" + next.id, title: next.n, text: "Sau ›" }) : el("span")]));
    box.appendChild(head);

    var fig = el("div", { class: "pfig" }, [el("figure", { class: "psym-card" }, [symNode(P.sym, "psym-big"), el("figcaption", { text: "Ký hiệu trên sơ đồ" })])]);
    if (P.img) fig.appendChild(el("figure", { class: "pphoto" }, [el("a", { href: P.img, target: "_blank", rel: "noopener" }, [el("img", { src: P.img, alt: "Ảnh thật: " + P.n, loading: "lazy" })]),
      el("figcaption", { text: "Ảnh thật trên bo inverter (Bài 9)" })]));
    box.appendChild(fig);

    function sec(h, kids) { box.appendChild(el("section", { class: "sec psec" }, [el("h3", { text: h })].concat(kids))); }
    function bullets(arr) { return el("ul", { class: "plist" }, arr.map(function (t) { return el("li", { text: t }); })); }
    sec("Nhận dạng", [bullets(P.look)]);
    sec("Đọc mã và thông số", [bullets(P.code)]);
    sec("Nguyên lý hoạt động", [bullets(P.how)]);
    sec("Công dụng trên máy", [bullets(P.use)]);
    sec("Đo kiểm từng bước", [el("div", { class: "psteps" }, P.test.map(function (t) {
      var m = /^Bước (\d+)\.\s*([\s\S]+)$/.exec(t);
      return el("div", { class: "step" }, [el("span", { class: "no", text: m ? m[1] : "•" }), el("span", { class: "tx", text: m ? m[2] : t })]);
    }))]);
    sec("Hư hỏng thường gặp", [el("div", { class: "sym" }, P.fail.map(function (x) { return el("div", { class: "sr" }, [el("b", { text: x[0] }), el("span", { text: x[1] })]); }))]);
    if (P.safe) box.appendChild(el("div", { class: "callout warn2 psafe" }, [el("b", { text: "An toàn" }), P.safe]));
    var rel = el("div", { class: "pchips" });
    P.l.forEach(function (lid) { var L = lessonById(lid); if (L) rel.appendChild(el("a", { href: "#/bai/" + L.id, text: "Bài " + L.n + ": " + L.title })); });
    P.labs.forEach(function (lab) { if ($("#lab-" + lab)) rel.appendChild(el("a", { class: "lab", href: "#/lab/" + lab, text: "Mô phỏng: " + (LAB_NAME[lab] || lab) })); });
    if (rel.childNodes.length) sec("Học thêm", [rel]);
    box.appendChild(el("p", { class: "note", text: "Số đo là giá trị thường gặp để tham khảo. Mỗi model có thông số riêng: khi sửa máy thật, xem tài liệu service của hãng." }));
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

  // ---- điều hướng ----
  function route() {
    var parts = (location.hash || "#/hoc").replace(/^#\/?/, "").split("/");
    var page = parts[0] || "hoc", arg = parts[1], sub = parts[2], blk = parts[3];
    var main = $("#main");
    window.Labs.leave();
    if (page === "bai" && lessonById(arg)) {
      showView("bai"); renderBai(arg, sub, blk); setTitle("Bài " + lessonById(arg).n);
    } else if (page === "lab" && arg && $("#lab-" + arg)) {
      showView("lab", "#/lab"); setTitle("Thực hành"); window.Labs.enter(arg); labEnter(arg);
    } else if (page === "lab") {
      showView("labs"); setTitle("Thực hành"); renderLabMenu();
    } else if (page === "lk" && arg && partById(arg)) {
      showView("lk", "#/lk"); setTitle("Linh kiện"); renderPart(arg);
    } else if (page === "lk") {
      showView("lk"); setTitle("Linh kiện"); renderPartList();
    } else if (page === "on") {
      showView("on", ON_TITLE[arg] ? "#/on" : null); setTitle(ON_TITLE[arg] || "Ôn tập"); renderOn(arg);
    } else if (page === "hoi" || ((page === "tra" || page === "tn") && arg === "hoi")) {
      showView("hoi", "#/tra"); setTitle("Hỏi trợ lý"); initChat();
      if (askLater) { var a = askLater; askLater = ""; ask(a); }
    } else if (page === "tra" || page === "tn") {
      showView("tn"); setTitle("Tra cứu"); renderTn($("#tn-q").value);
    } else {
      showView("hoc"); setTitle(TITLE); renderHoc();
    }
    if (blk == null) main.scrollTop = 0;
    updateChip();
  }
  window.addEventListener("hashchange", route);
  route();

  // ---- dùng offline ----
  // 23/10/2026: đang mở app mà có bản mới thì báo "Đã có bản mới" (mới mở trang thì đã là bản mới từ mạng, không báo)
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    var t0 = Date.now();
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.addEventListener("updatefound", function () {
          if (!navigator.serviceWorker.controller || Date.now() - t0 < 15000) return;
          $("#update").hidden = false;
        });
        document.addEventListener("visibilitychange", function () { if (!document.hidden) reg.update().catch(function () { /* mất mạng */ }); });
      }).catch(function () { /* không sao */ });
    });
    $("#update-go").addEventListener("click", function () { location.reload(); });
  }
})();
