/* Cho phép dùng offline sau lần mở đầu. Đổi số VERSION mỗi khi sửa file để điện thoại tải bản mới. */
var VERSION = "hdt-v21";
var FILES = [
  "./", "index.html", "css/labs.css", "css/app.css",
  "data/lessons.js", "js/labs.js","js/labkit.js","js/labs-nguon.js","js/labs-bo.js","js/labs-co-ban.js", "js/real.js", "js/real2.js", "js/real3.js", "js/real4.js", "js/chat.js", "js/app.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "img/b6-hai-duong.png", "img/b6-so-do-day-du.png", "img/b6-dong-dien.png",
  "img/b7-bien-ap.png", "img/b7-nguon-xung.png", "img/b7-opto.png", "img/b8-bo-inverter.png", "img/b8-linh-kien.png", "img/b9-mat-linh-kien.jpg", "img/b9-mat-han.jpg", "img/b10-ntc-chia-ap.png", "img/b11-tien-to.png", "img/b12-vom-mach.png", "img/b13-song-sin.png", "img/parts/t-bd1.jpg", "img/parts/t-bien-ap.jpg", "img/parts/t-c2.jpg", "img/parts/t-cn1.jpg", "img/parts/t-cx1.jpg", "img/parts/t-cx2.jpg", "img/parts/t-cy.jpg", "img/parts/t-diode-kep.jpg", "img/parts/t-driver.jpg", "img/parts/t-e2.jpg", "img/parts/t-fuse.jpg", "img/parts/t-giac-xanh.jpg", "img/parts/t-ic2.jpg", "img/parts/t-ic7815.jpg", "img/parts/t-igbt.jpg", "img/parts/t-l4.jpg", "img/parts/t-lcl.jpg", "img/parts/t-mcu-tc.jpg", "img/parts/t-mcu2.jpg", "img/parts/t-ntc.jpg", "img/parts/t-opto-uart.jpg", "img/parts/t-r100.jpg", "img/parts/t-relay.jpg", "img/parts/t-snubber.jpg", "img/parts/t-tu1000.jpg", "img/parts/t-uvw.jpg", "img/parts/t-zr1.jpg", "img/parts/u-cn10.jpg", "img/parts/u-ic14.jpg", "img/parts/u-ic20.jpg", "img/parts/u-ic3.jpg", "img/parts/u-r6.jpg", "img/parts/u-r78.jpg", "img/parts/u-re1.jpg", "img/parts/u-tl431.jpg"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Ưu tiên bản mới từ mạng, mất mạng thì dùng bản đã lưu.
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(function (res) { // no-cache: luôn hỏi GitHub bản mới nhất, không dùng cache 10 phút của trình duyệt
      var copy = res.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () { return caches.match(req).then(function (r) { return r || caches.match("index.html"); }); })
  );
});
