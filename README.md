# Học Điện Tử, Điện Lạnh (web điện thoại)

Web tĩnh, thiết kế cho điện thoại trước: tab dưới cùng (Học · Thực hành · Thuật ngữ · Hỏi), mở được offline sau lần đầu.
Chỉ có nội dung điện tử và điện lạnh cơ bản. Không có mã lỗi, sản phẩm, trò chuyện ngoài lề.

## Chạy thử trên máy
Mở thư mục này trong terminal rồi chạy `python -m http.server 8000`, vào http://localhost:8000.
(Mở thẳng file index.html cũng được, chỉ riêng chế độ offline cần địa chỉ http.)

## Đưa lên GitHub Pages
Tạo repo mới, chép toàn bộ nội dung thư mục này vào gốc repo, vào Settings › Pages › Deploy from a branch › main / root.
Trên điện thoại mở link rồi chọn "Thêm vào màn hình chính".
Mỗi lần sửa file, đổi số `VERSION` trong `sw.js` để điện thoại tải bản mới.

## Thêm bài học
Sửa `data/lessons.js`: thêm 1 object vào `LESSONS` (id, n, title, summary, labs, keywords, blocks, quiz) và thuật ngữ vào `GLOSSARY`.
Chatbot, danh sách bài, bài tập và thuật ngữ tự cập nhật theo file này, không cần sửa chỗ khác.
Hình minh họa của bài học nằm trong thư mục `img/`, khai báo bằng `img: { src, alt, cap }` trong từng mục của bài và thêm vào danh sách `FILES` trong `sw.js`.
Mô phỏng nằm ở `js/labs.js` + phần `<section id="lab-...">` trong `index.html`.

## Chatbot
`js/chat.js`. Chạy trên máy, không AI, không gọi mạng. Chấm điểm từ khóa không dấu trên bài học và thuật ngữ.
Câu nào không khớp đủ thì trả lời "Chưa có trong giáo trình" thay vì đoán.

## Nguồn nội dung
13 bài đã học trong project "Tự Học Điện Tử, Điện Lạnh Cơ Bản" và các mô phỏng "Thực hành điện tử". Số liệu trong mô phỏng chỉ minh họa nguyên lý.
