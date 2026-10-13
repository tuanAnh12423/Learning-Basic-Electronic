# Học Điện Tử, Điện Lạnh (web điện thoại)

Web tĩnh, thiết kế cho điện thoại trước: tab dưới cùng (Học · Thực hành · Ôn tập · Thuật ngữ · Hỏi), mở được offline sau lần đầu.

Hiện có 12 bài, 14 mô phỏng, 50 thuật ngữ. Mục Ôn tập có: kiểm tra 10/20 câu ngẫu nhiên, ôn lại câu đã sai,
thẻ ghi nhớ thuật ngữ, bảng kết quả (nhập tên, chép gửi Zalo/email). Thanh trên có nút Aa đổi cỡ chữ.
Ô tìm kiếm ở trang Học tìm trong mọi bài và thuật ngữ. Kết quả chỉ lưu trên điện thoại (localStorage), không gửi đi đâu.
Chỉ có nội dung điện tử và điện lạnh cơ bản. Không có mã lỗi, sản phẩm, trò chuyện ngoài lề.

## Chạy thử trên máy
Mở thư mục này trong terminal rồi chạy `python -m http.server 8000`, vào http://localhost:8000.
(Mở thẳng file index.html cũng được, chỉ riêng chế độ offline cần địa chỉ http.)

## Đưa lên GitHub Pages
Tạo repo mới, chép toàn bộ nội dung thư mục này vào gốc repo, vào Settings › Pages › Deploy from a branch › main / root.
Trên điện thoại mở link rồi chọn "Thêm vào màn hình chính".
Mỗi lần sửa file, đổi số `VERSION` trong `sw.js` để điện thoại tải bản mới (đang mở app thì hiện thông báo "Đã có bản mới").

## Thêm bài học
Sửa `data/lessons.js`: thêm 1 object vào `LESSONS` (id, n, title, summary, labs, keywords, blocks, quiz) và thuật ngữ vào `GLOSSARY`.
Chatbot, danh sách bài, bài tập và thuật ngữ tự cập nhật theo file này, không cần sửa chỗ khác.
Mô phỏng nằm ở `js/labs.js` + phần `<section id="lab-...">` và nút tab trong `index.html`; tên mô phỏng ở `LAB_NAME` đầu `data/lessons.js`.

## Chatbot
`js/chat.js`. Chạy trên máy, không AI, không gọi mạng. Chấm điểm từ khóa không dấu trên bài học và thuật ngữ.
Hiểu cả cách nói quen của KTV (lốc, block, cục nóng, capa, sensor, ga, aptomat...): sửa danh sách `SYN` trong `js/chat.js`.
Câu nào không khớp đủ thì gợi ý các mục gần giống, hoặc trả lời "Chưa có trong giáo trình" thay vì đoán.

## Nguồn nội dung
Bài 1–6 từ project "Tự Học Điện Tử, Điện Lạnh Cơ Bản" và các mô phỏng "Thực hành điện tử". Bài 7–12 (đồng hồ vạn năng, động cơ và máy nén, NTC, inverter, an toàn điện, gas lạnh) bổ sung 13/10/2026, nên được bộ phận Training rà lại trước khi dùng chính thức. Số liệu trong mô phỏng chỉ minh họa nguyên lý.
