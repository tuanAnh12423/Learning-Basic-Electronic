/* Cho phép dùng offline sau lần mở đầu. Đổi số VERSION mỗi khi sửa file để điện thoại tải bản mới. */
var VERSION = "hdt-v12";
var FILES = [
  "./", "index.html", "css/labs.css", "css/app.css",
  "data/lessons.js", "js/labs.js", "js/real.js", "js/chat.js", "js/app.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "img/b6-hai-duong.png", "img/b6-so-do-day-du.png", "img/b6-dong-dien.png",
  "img/b7-bien-ap.png", "img/b7-nguon-xung.png", "img/b7-opto.png", "img/b8-bo-inverter.png", "img/b8-linh-kien.png", "img/b9-mat-linh-kien.jpg", "img/b9-mat-han.jpg"
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
