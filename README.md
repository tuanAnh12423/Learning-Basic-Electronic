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

## Cập nhật 23/10/2026
- Tab **Ôn tập**: kiểm tra 10/20 câu ngẫu nhiên, ôn lại câu đã làm sai, thẻ ghi nhớ thuật ngữ, bảng kết quả có tên (chụp màn hình hoặc chép gửi Zalo).
- Đáp án bài tập được trộn mỗi lần làm (trong dữ liệu, đáp án đúng dồn nhiều ở vị trí B).
- Ô tìm kiếm ở trang Học tìm trong mọi bài, thuật ngữ và mô phỏng. Nút **Aa** đổi cỡ chữ. Đang mở app mà có bản mới thì hiện "Đã có bản mới".
- Chatbot hiểu cách nói quen của KTV (lốc, block, cục nóng, capa, sensor, IPM...), tìm được cả trong mô phỏng (bootstrap, dead time),
  báo rõ khi hỏi ngoài phạm vi (giá, mã lỗi, bảo hành). Bảng từ đồng nghĩa: `SYN` trong `js/chat.js`.
- `js/real2.js`: hình thực tế cho 7 mô phỏng Bài 1–6 (mã màu, nối tiếp/song song, tụ nạp xả, tụ đôi, diode, cầu chỉnh lưu, tìm lỗi quạt).
  Cùng cách làm với `js/real.js`. Hình "Tìm lỗi quạt" dùng chung đề với sơ đồ bên dưới.
- Nhãn đường chuẩn trên đồ thị tự dời khi sát nhau và có nền mờ; chữ trên sơ đồ nguyên lý to hơn.

- `js/real3.js` (Bài 7–9, 17 mô phỏng): nền là **ảnh chụp thật** linh kiện trên bo (`img/parts`), lớp phủ đánh dấu linh kiện,
  dòng điện chạy, chỗ nóng, tia lửa; đồng hồ bên phải. Tất cả đọc thẳng kết quả mô phỏng bên dưới (`HDT.labs[id].data`)
  tại con trỏ đồ thị, nên kéo thanh trượt nào thì ảnh đổi theo. Thêm cảnh mới: thêm 1 mục vào `SCENES` (ảnh, khung, đường dòng, điểm sáng, đồng hồ).
- `js/real4.js` (Bài 10–13, 5 mô phỏng): vẽ dụng cụ thật — cảm biến kẹp trên ống đồng dàn lạnh, bộ nguồn + đồng hồ đo dòng,
  VOM trên bo cắm (que, cổng, núm xoay đúng theo cách đo; cầu chì đứt khi đo sai), ampe kìm kẹp dây, ổ cắm 220 V + máy hiện sóng + tụ lọc.
  Đọc mô phỏng bên dưới qua `HDT.labs[id].data` và `.p` (giá trị thanh trượt/nút, mở trong `labkit.js`).
