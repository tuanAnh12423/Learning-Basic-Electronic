/* Giáo trình: Điện tử và điện lạnh cơ bản.
   Nguồn nội dung: 8 bài đã học trong project "Tự Học Điện Tử, Điện Lạnh Cơ Bản" + mô phỏng "Thực hành điện tử".
   Thêm bài mới: thêm 1 object vào LESSONS (id, n, title, summary, labs, keywords, blocks, quiz) rồi thêm tên file vào sw.js nếu tạo file mới.
   Chatbot chỉ trả lời từ dữ liệu trong file này. */
window.LESSONS = [
  {
    id: "b1", n: 1, title: "Điện áp, dòng điện, điện trở",
    summary: "Định luật Ohm, công suất và cách đọc mã màu điện trở.",
    labs: ["ohm", "mau"],
    keywords: "dien ap dong dien dien tro ohm cong suat von ampe oat ma mau vach mau dinh luat",
    blocks: [
      { h: "Hình dung bằng nước", kw: "dien ap dong dien dien tro be nuoc ong",
        p: ["Điện áp (V, đơn vị vôn) giống độ cao cột nước: càng cao thì càng đẩy mạnh.",
            "Dòng điện (I, đơn vị ampe) giống lượng nước chảy qua mỗi giây.",
            "Điện trở (R, đơn vị ôm Ω) giống đoạn ống bị thắt: càng hẹp thì nước chảy càng ít."] },
      { h: "Định luật Ohm", kw: "dinh luat ohm cong thuc i = v / r",
        p: ["I = V ÷ R. Từ đó suy ra V = I × R và R = V ÷ I.",
            "Ví dụ: V = 12 V, R = 4 Ω thì I = 12 ÷ 4 = 3 A."] },
      { h: "Công suất", kw: "cong suat oat nhiet p = v x i",
        p: ["P = V × I (đơn vị oát, W). Với 12 V và 3 A thì P = 36 W.",
            "Công suất trên điện trở biến thành nhiệt, nên dòng càng lớn thì điện trở càng nóng."] },
      { h: "Đọc mã màu điện trở", kw: "ma mau dien tro vach mau doc dien tro sai so",
        p: ["Điện trở 4 vạch: vạch 1 và 2 là hai chữ số, vạch 3 cho biết thêm bao nhiêu chữ số 0, vạch 4 là sai số.",
            "Màu và số: đen 0, nâu 1, đỏ 2, cam 3, vàng 4, lục 5, lam 6, tím 7, xám 8, trắng 9. Vạch 3 màu vàng kim nhân 0,1 và bạc nhân 0,01.",
            "Ví dụ: nâu - đen - đỏ là 1, 0 rồi thêm 2 chữ số 0, ra 1000 Ω = 1 kΩ.",
            "Hai lỗi hay gặp: quên vạch số nhân, hoặc nhầm số chữ số 0."] },
      { h: "Đo điện trở", kw: "do dien tro dong ho van nang vom cat nguon",
        p: ["Cắt nguồn trước khi đo. Nếu điện trở còn nằm trong mạch, các linh kiện khác có thể làm số đo sai, nên nhấc một chân điện trở ra khỏi mạch rồi mới đo."] }
    ],
    quiz: [
      { q: "V = 12 V, R = 4 Ω. Dòng điện I bằng bao nhiêu?", o: ["0,33 A", "3 A", "8 A", "48 A"], a: 1, why: "I = V ÷ R = 12 ÷ 4 = 3 A." },
      { q: "Giữ nguyên điện áp, tăng điện trở lên gấp đôi. Dòng điện thay đổi thế nào?", o: ["Tăng gấp đôi", "Không đổi", "Giảm còn một nửa", "Tăng gấp bốn"], a: 2, why: "I = V ÷ R nên R gấp đôi thì I giảm một nửa." },
      { q: "Một tải dùng 12 V và 3 A. Công suất là bao nhiêu?", o: ["4 W", "15 W", "36 W", "144 W"], a: 2, why: "P = V × I = 12 × 3 = 36 W." },
      { q: "Điện trở có 3 vạch đầu là nâu - đen - đỏ. Giá trị là?", o: ["102 Ω", "1 kΩ", "10 kΩ", "100 Ω"], a: 1, why: "Nâu 1, đen 0, đỏ là thêm 2 chữ số 0: 1000 Ω = 1 kΩ." },
      { q: "Điện trở có 3 vạch đầu là vàng - tím - cam. Giá trị là?", o: ["470 Ω", "4,7 kΩ", "47 kΩ", "4,7 MΩ"], a: 2, why: "Vàng 4, tím 7, cam là thêm 3 chữ số 0: 47 000 Ω = 47 kΩ." },
      { q: "Vì sao nên nhấc một chân điện trở ra khỏi mạch khi đo?", o: ["Để điện trở nguội", "Để các linh kiện khác trong mạch không làm sai số đo", "Để que đo đỡ mòn", "Không cần, đo thế nào cũng được"], a: 1, why: "Các nhánh khác nối song song với điện trở sẽ làm giá trị đo lệch." }
    ]
  },
  {
    id: "b2", n: 2, title: "Mạch nối tiếp và song song",
    summary: "Điện trở tương đương, dòng và điện áp trong hai kiểu mắc.",
    labs: ["mach"],
    keywords: "noi tiep song song mach dien tro tuong duong r tong dut ho mach",
    blocks: [
      { h: "Mắc nối tiếp", kw: "noi tiep r tong r1 + r2 dong nhu nhau",
        p: ["Các linh kiện nối thành một đường duy nhất. Dòng điện qua mọi linh kiện là như nhau.",
            "R tổng = R1 + R2. Điện áp nguồn chia ra theo từng điện trở.",
            "Chỉ cần một chỗ đứt là cả mạch ngừng, giống dây đèn trang trí cũ."] },
      { h: "Mắc song song", kw: "song song r tong nho hon dien ap bang nhau nhanh",
        p: ["Hai đầu mỗi nhánh cùng nối vào nguồn. Điện áp ở mọi nhánh bằng nhau, dòng tổng bằng tổng dòng các nhánh.",
            "Với hai điện trở: R tổng = R1 × R2 ÷ (R1 + R2). R tổng luôn nhỏ hơn điện trở nhỏ nhất.",
            "Một nhánh đứt thì các nhánh còn lại vẫn chạy bình thường, như các thiết bị trong nhà."] },
      { h: "Ví dụ tính nhanh", kw: "vi du tinh 20 30 12 ohm",
        p: ["20 Ω nối tiếp 30 Ω: R tổng = 50 Ω. Với nguồn 12 V thì I = 12 ÷ 50 = 0,24 A.",
            "20 Ω song song 30 Ω: R tổng = 20 × 30 ÷ 50 = 12 Ω."] }
    ],
    quiz: [
      { q: "20 Ω nối tiếp 30 Ω. R tổng là?", o: ["12 Ω", "25 Ω", "50 Ω", "600 Ω"], a: 2, why: "Nối tiếp thì cộng: 20 + 30 = 50 Ω." },
      { q: "20 Ω song song 30 Ω. R tổng là?", o: ["12 Ω", "25 Ω", "50 Ω", "10 Ω"], a: 0, why: "R1 × R2 ÷ (R1 + R2) = 600 ÷ 50 = 12 Ω, nhỏ hơn điện trở nhỏ nhất (20 Ω)." },
      { q: "Mạch nối tiếp, một điện trở bị đứt. Dòng trong mạch ra sao?", o: ["Không còn dòng", "Dòng tăng gấp đôi", "Chỉ điện trở còn lại có dòng", "Không đổi"], a: 0, why: "Nối tiếp chỉ có một đường đi, đứt một chỗ là hở mạch." },
      { q: "Mạch song song, một nhánh bị đứt. Các nhánh còn lại?", o: ["Cũng ngừng", "Vẫn chạy bình thường", "Cháy", "Dòng giảm về 0"], a: 1, why: "Mỗi nhánh có đường riêng nối với nguồn." },
      { q: "Nguồn 12 V, 20 Ω nối tiếp 30 Ω. Dòng điện là?", o: ["0,24 A", "0,6 A", "1 A", "2,4 A"], a: 0, why: "I = 12 ÷ 50 = 0,24 A." }
    ]
  },
  {
    id: "b3", n: 3, title: "Tụ điện: nạp, xả và an toàn",
    summary: "Hằng số thời gian τ = R × C, tụ đôi và cách xả tụ an toàn.",
    labs: ["tu", "doi"],
    keywords: "tu dien tu nap xa dien dung farad hang so thoi gian tau tu doi dual run herm fan xa tu an toan",
    blocks: [
      { h: "Tụ điện là gì", kw: "tu dien dien dung farad uf",
        p: ["Tụ điện giữ điện tích, giống một bình chứa nhỏ. Điện dung C có đơn vị fara (F), trong thực tế thường là µF.",
            "Tụ lớn vẫn giữ điện áp sau khi đã ngắt nguồn."] },
      { h: "Nạp và xả: hằng số thời gian τ", kw: "hang so thoi gian tau r x c nap xa 63 37 5 tau",
        p: ["Tụ nạp hoặc xả qua điện trở theo hằng số thời gian τ = R × C.",
            "Nạp: sau 1τ tụ đạt khoảng 63% điện áp nguồn, sau 5τ gần như đầy (khoảng 99,3%).",
            "Xả: sau 1τ còn khoảng 37%, sau 5τ còn khoảng 0,7%.",
            "Ví dụ: C = 100 µF, R = 10 kΩ thì τ = 1 s, 5τ = 5 s."] },
      { h: "Tụ đôi (dual run)", kw: "tu doi dual run herm fan chung dau c may nen quat",
        p: ["Tụ đôi có ba chân C, HERM và FAN: hai tụ chung đầu C. Phần HERM cho máy nén, phần FAN cho quạt. Loại này thường gặp ở máy điều hòa.",
            "Mỗi phần giữ điện riêng nên phải xả từng phần (C với HERM, rồi C với FAN)."] },
      { h: "Xả tụ an toàn", kw: "xa tu an toan dien tro xa tua vit chap do xac nhan",
        p: ["Cắt nguồn, xả tụ qua điện trở, rồi đo xác nhận gần 0 V trước khi chạm vào.",
            "Không chập hai cực bằng tua vít. Dòng ban đầu là V ÷ R, nên R gần 0 thì dòng rất lớn: tia lửa, hỏng tụ và nguy hiểm.",
            "Điện trở xả lớn thì dòng nhỏ nhưng phải chờ lâu hơn (τ = R × C)."] }
    ],
    quiz: [
      { q: "C = 100 µF, R = 10 kΩ. Hằng số thời gian τ là?", o: ["0,1 s", "1 s", "10 s", "100 s"], a: 1, why: "τ = R × C = 10 000 × 0,0001 = 1 s." },
      { q: "Sau khoảng 5τ, tụ đang nạp đạt khoảng bao nhiêu điện áp nguồn?", o: ["63%", "80%", "Khoảng 99%", "Đúng 100% và dừng"], a: 2, why: "Sau 5τ đạt khoảng 99,3%, coi như gần đầy." },
      { q: "Vì sao không chập hai cực tụ bằng tua vít để xả?", o: ["Làm tua vít bị từ hóa", "Dòng xả ban đầu rất lớn, gây tia lửa, hỏng tụ và nguy hiểm", "Tụ sẽ nạp thêm điện", "Không sao, vẫn xả nhanh và an toàn"], a: 1, why: "Chập là R gần bằng 0 nên dòng V ÷ R rất lớn." },
      { q: "Giữ nguyên R, tăng C gấp 10 lần. Thời gian xả?", o: ["Giảm 10 lần", "Không đổi", "Tăng 10 lần", "Tăng 100 lần"], a: 2, why: "τ = R × C tỉ lệ thuận với C." },
      { q: "Với tụ đôi (dual run), cần làm gì trước khi chạm vào?", o: ["Chỉ xả phần HERM", "Chỉ xả phần FAN", "Xả cả hai phần rồi đo xác nhận gần 0 V", "Chờ vài giây là đủ"], a: 2, why: "Hai phần giữ điện riêng, xả một phần thì phần kia vẫn còn điện." }
    ]
  },
  {
    id: "b4", n: 4, title: "Diode và cầu chỉnh lưu",
    summary: "Diode dẫn một chiều, đo diode, cầu 4 diode và tụ lọc.",
    labs: ["diode", "cau"],
    keywords: "diode chinh luu cau chinh luu tu loc gon song xoay chieu mot chieu anode cathode ak do diode",
    blocks: [
      { h: "Diode dẫn một chiều", kw: "diode mot chieu anode cathode 0,6 0,7 nguong dan",
        p: ["Diode cho dòng đi một chiều, từ chân A (anode) sang chân K (cathode).",
            "Diode silicon bắt đầu dẫn khi điện áp thuận đạt khoảng 0,6 đến 0,7 V. Khi dẫn, điện áp trên nó luôn quanh mức này dù nguồn lớn hơn nhiều.",
            "Chiều ngược lại hầu như không có dòng."] },
      { h: "Đo diode bằng đồng hồ vạn năng", kw: "do diode dong ho van nang vom que do tot chap dut",
        p: ["Cắt nguồn, chọn thang đo diode.",
            "Diode tốt: que đỏ vào A, que đen vào K thì hiện khoảng 0,5 đến 0,7 V; đảo que thì không hiện số (quá thang).",
            "Diode chập: đo hai chiều đều gần 0. Diode đứt: đo hai chiều đều không hiện số."] },
      { h: "Cầu chỉnh lưu", kw: "cau chinh luu 4 diode xoay chieu 50 hz 100 xung 1,4 v",
        p: ["Cầu 4 diode biến điện xoay chiều thành điện một chiều nhấp nhô. Mỗi nửa chu kỳ có 2 diode dẫn nên mất khoảng 1,4 V.",
            "Với lưới 50 Hz, sau cầu có 100 xung mỗi giây.",
            "Ví dụ biên độ nguồn 12 V thì điện áp ra đỉnh khoảng 12 − 1,4 = 10,6 V."] },
      { h: "Tụ lọc và gợn sóng", kw: "tu loc gon song tai nang dut diode",
        p: ["Tụ lọc làm phẳng điện áp sau cầu. Không có tụ, điện áp ra là các xung về 0 liên tục.",
            "Tụ càng lớn thì gợn sóng càng nhỏ. Tải càng nặng (điện trở tải nhỏ) thì gợn sóng càng lớn.",
            "Nếu đứt một diode trong cầu, chỉ còn 1 xung mỗi chu kỳ, tụ nạp ít hơn nên điện áp tụt sâu hơn.",
            "An toàn: tụ lọc vẫn giữ điện sau khi ngắt nguồn, phải xả và đo xác nhận trước khi chạm vào board."] }
    ],
    quiz: [
      { q: "Diode silicon bắt đầu dẫn ở điện áp thuận khoảng?", o: ["0,06 V", "0,6 đến 0,7 V", "5 V", "12 V"], a: 1, why: "Ngưỡng dẫn của diode silicon khoảng 0,6 đến 0,7 V." },
      { q: "Qua cầu chỉnh lưu 4 diode, điện áp mất đi khoảng bao nhiêu?", o: ["0,7 V", "1,4 V", "2,8 V", "12 V"], a: 1, why: "Mỗi nửa chu kỳ có 2 diode dẫn, mỗi cái sụt khoảng 0,7 V." },
      { q: "Lưới 50 Hz qua cầu chỉnh lưu. Có bao nhiêu xung mỗi giây?", o: ["25", "50", "100", "200"], a: 2, why: "Cả hai nửa chu kỳ đều cho xung, nên 50 × 2 = 100 xung mỗi giây." },
      { q: "Bỏ tụ lọc sau cầu chỉnh lưu. Điện áp ra thế nào?", o: ["Phẳng như pin", "Các xung về 0 liên tục", "Bằng 0", "Xoay chiều như cũ"], a: 1, why: "Không có tụ giữ điện nên điện áp nhấp nhô về 0 giữa các xung." },
      { q: "Một diode trong cầu bị đứt. Hiện tượng gì xảy ra?", o: ["Không đổi", "Chỉ còn 1 xung mỗi chu kỳ, điện áp tụt sâu hơn", "Điện áp ra tăng gấp đôi", "Cầu tự sửa"], a: 1, why: "Chỉ một nửa chu kỳ còn được chỉnh lưu." },
      { q: "Đo diode tốt bằng thang diode, que đỏ vào A, que đen vào K. Đồng hồ hiện?", o: ["Khoảng 0,5 đến 0,7 V", "0 V", "Quá thang", "Dao động ngẫu nhiên"], a: 0, why: "Chiều thuận hiện điện áp thuận của diode. Đảo que thì quá thang." }
    ]
  },
  {
    id: "b5", n: 5, title: "Chu trình làm lạnh",
    summary: "Máy nén, dàn nóng, van tiết lưu, dàn lạnh và áp cao, áp thấp.",
    labs: ["lanh"],
    keywords: "chu trinh lam lanh may nen dan nong dan lanh van tiet luu ong mao gas moi chat ap cao ap thap ngung tu bay hoi",
    blocks: [
      { h: "Ý chính", kw: "lam lanh la gi may lanh nguyen ly chuyen nhiet moi chat gas vong kin",
        p: ["Máy lạnh không tạo ra lạnh. Nó chuyển nhiệt từ chỗ cần làm lạnh ra bên ngoài, nhờ môi chất (gas lạnh) chạy trong vòng kín."] },
      { h: "Bốn bộ phận chính", kw: "chu trinh bon bo phan may nen dan nong ngung tu van tiet luu ong mao dan lanh bay hoi",
        p: ["① Máy nén: hút hơi môi chất áp thấp, nén thành hơi nóng áp cao.",
            "② Dàn nóng (ngưng tụ): hơi nóng nhả nhiệt ra môi trường và hóa lỏng, vẫn áp cao.",
            "③ Van tiết lưu (hoặc ống mao): làm giảm áp, môi chất lạnh đi, thành hỗn hợp lỏng lẫn hơi lạnh.",
            "④ Dàn lạnh (bay hơi): môi chất hút nhiệt từ không gian cần làm lạnh, bay hơi thành hơi áp thấp rồi quay về máy nén."] },
      { h: "Áp cao và áp thấp", kw: "ap cao ap thap dong ho ap suat",
        p: ["Phía áp cao đi từ đầu ra máy nén qua dàn nóng tới van tiết lưu.",
            "Phía áp thấp đi từ sau van tiết lưu qua dàn lạnh về máy nén.",
            "Máy nén tạo ra chênh áp giữa hai phía, nhờ đó môi chất mới tuần hoàn."] },
      { h: "Xu hướng khi hỏng (minh họa)", kw: "hong quat dan nong dan lanh bam thieu gas may nen khong chay ap",
        p: ["Quạt dàn nóng hỏng: nhiệt không thoát ra được, áp cao tăng và máy nén nóng.",
            "Dàn lạnh bẩn: hút nhiệt kém, phòng lạnh chậm.",
            "Thiếu gas: cả áp cao và áp thấp đều thấp, lạnh yếu.",
            "Máy nén không chạy: hai áp gần bằng nhau, môi chất đứng yên.",
            "Đây là xu hướng để hiểu nguyên lý, không phải số đo. Áp suất và nhiệt độ thực tế phụ thuộc loại gas và từng máy, hãy xem tài liệu service của hãng."] }
    ],
    quiz: [
      { q: "Máy lạnh thực chất làm gì?", o: ["Tạo ra lạnh từ không khí", "Chuyển nhiệt từ chỗ cần làm lạnh ra ngoài", "Lọc không khí", "Sinh ra điện"], a: 1, why: "Môi chất hút nhiệt ở dàn lạnh rồi nhả ra ở dàn nóng." },
      { q: "Thứ tự môi chất đi qua các bộ phận là?", o: ["Máy nén → dàn lạnh → van tiết lưu → dàn nóng", "Máy nén → dàn nóng → van tiết lưu → dàn lạnh", "Dàn nóng → máy nén → dàn lạnh → van tiết lưu", "Van tiết lưu → máy nén → dàn nóng → dàn lạnh"], a: 1, why: "Nén lên áp cao, nhả nhiệt, giảm áp, rồi hút nhiệt." },
      { q: "Bộ phận nào làm giảm áp của môi chất lỏng?", o: ["Máy nén", "Dàn nóng", "Van tiết lưu (hoặc ống mao)", "Dàn lạnh"], a: 2, why: "Sau van tiết lưu áp giảm, môi chất lạnh đi." },
      { q: "Quạt dàn nóng hỏng. Xu hướng nào đúng?", o: ["Áp cao tăng, máy nén nóng", "Áp thấp tăng, máy nén nguội", "Không ảnh hưởng gì", "Dàn lạnh đóng băng ngay lập tức"], a: 0, why: "Nhiệt không thoát ra được nên áp cao tăng." },
      { q: "Môi chất hút nhiệt và bay hơi ở bộ phận nào?", o: ["Máy nén", "Dàn nóng", "Van tiết lưu", "Dàn lạnh"], a: 3, why: "Dàn lạnh là dàn bay hơi." },
      { q: "Hai đồng hồ áp cao và áp thấp gần bằng nhau, môi chất đứng yên. Nghi ngờ gì trước?", o: ["Máy nén không chạy", "Dàn lạnh quá sạch", "Quạt dàn lạnh quá mạnh", "Gas quá nhiều"], a: 0, why: "Không có máy nén thì không có chênh áp, không có tuần hoàn." }
    ]
  },
  {
    id: "b6", n: 6, title: "Chip, transistor và relay",
    summary: "Dùng dòng nhỏ của chip điều khiển tải lớn qua transistor và relay.",
    labs: ["rl", "tim"],
    keywords: "chip vi dieu khien transistor relay role cuon day tiep diem diode dap xung dien tro nen chan b c e npn bjt dong nho dieu khien tai",
    blocks: [
      { h: "Vì sao cần transistor", kw: "chip chi cap dong nho transistor cong tac dieu khien tai",
        p: ["Chip (vi điều khiển) chỉ cấp được dòng rất nhỏ ở điện áp thấp (ví dụ 3,3 V), không thể trực tiếp đóng cuộn relay hay tải lớn.",
            "Transistor làm công tắc: dòng nhỏ vào chân B (qua điện trở nền) điều khiển dòng lớn đi từ nguồn qua cuộn relay xuống chân C - E."] },
      { h: "Transistor NPN làm công tắc", kw: "transistor npn ib ic beta dien tro nen chan b c e",
        p: ["Dòng điều khiển Ib càng lớn thì dòng Ic càng lớn, theo hệ số khuếch đại β (ví dụ β = 100 thì Ic ≈ 100 × Ib), cho tới khi bị giới hạn bởi cuộn relay.",
            "Điện trở nền quá lớn thì Ib quá nhỏ, transistor không dẫn đủ và relay không hút dù chip đã ra mức cao."] },
      { h: "Relay", kw: "relay role cuon day tiep diem cach ly quat may nen",
        p: ["Relay gồm cuộn dây và tiếp điểm. Cuộn có dòng thì hút, tiếp điểm đóng và tải (quạt, máy nén) chạy.",
            "Relay cách ly mạch điều khiển điện áp thấp với mạch tải điện áp cao.",
            "Ví dụ: cuộn relay 12 V có điện trở 400 Ω thì dòng qua cuộn là 12 ÷ 400 = 30 mA."] },
      { h: "Nguồn 12 V và hai đường trên board", kw: "nguon 12v rail hai duong lenh dien khoi nguon cau chinh luu tu loc board quat",
        p: ["Board chỉ làm một việc: bật quạt. Nó có hai đường riêng. Đường LỆNH (điện nhỏ): chip → transistor → cuộn relay. Đường ĐIỆN (220 V): điện nhà → tiếp điểm relay → giắc → quạt.",
            "Điện 12 V cho cuộn relay (gọi là rail 12 V) đến từ khối nguồn trên board: điện nhà → hạ áp → cầu chỉnh lưu → tụ lọc (Bài 4). Con số 12 V chỉ là ví dụ: máy thật đọc điện áp ghi trên thân relay.",
            "Relay là một công tắc lớn do nam châm (cuộn) bấm giúp. Chip yếu không bật nổi điện nhà nên phải nhờ relay."],
        img: { src: "img/b6-hai-duong.png", alt: "Hai đường trên board: đường lệnh gồm chip, transistor, cuộn relay; đường điện gồm điện nhà, tiếp điểm relay, giắc, quạt", cap: "Hai đường trên board và cách tìm chỗ đứt" } },
      { h: "Sơ đồ đầy đủ bo điều khiển quạt", kw: "so do day du bo dieu khien quat diem do so do binh thuong khoi nguon khoi lenh khoi dien quat",
        p: ["Ba khối: nguồn (đổi điện nhà thành 12 V), lệnh (chip bật transistor, cuộn hút), điện quạt (qua tiếp điểm tới giắc). Các số 1 đến 8 là điểm đo, trùng với mô phỏng Tìm lỗi quạt.",
            "Số đo bình thường: 1 nguồn vào 220 V, 2 rail 12 V, 3 B–E ≈ 0,7 V, 4 hai đầu cuộn ≈ 12 V khi đã hút, 5 COM 220 V, 6 NO 220 V khi đã hút, 7 giắc 220 V, 8 dây N khoảng 0 Ω khi tắt điện."],
        img: { src: "img/b6-so-do-day-du.png", alt: "Sơ đồ đầy đủ bo điều khiển quạt gồm khối nguồn, khối lệnh, khối điện quạt và 8 điểm đo", cap: "Sơ đồ đầy đủ với 8 điểm đo" } },
      { h: "Diode dập xung", kw: "diode dap xung flyback xung dien ap ngat cuon bao ve transistor",
        p: ["Diode mắc song song với cuộn relay, ngược chiều với nguồn. Khi tắt dòng, cuộn sinh ra xung điện áp cao, diode hấp thụ xung này để bảo vệ transistor.",
            "Mất diode thì xung ở chân C lúc ngắt rất cao và có thể làm hỏng transistor.",
            "Khi transistor vừa tắt, dòng của cuộn chạy vòng qua diode nên chân C chỉ lên khoảng 12 V + 0,7 V = 12,7 V, rồi về 12 V khi hết dòng."],
        img: { src: "img/b6-dong-dien.png", alt: "Dòng điện khi transistor đang bật chạy từ rail qua cuộn xuống mass, và khi vừa tắt chạy vòng qua diode", cap: "Dòng điện khi transistor bật và khi vừa tắt" } },
      { h: "Tìm lỗi: giắc quạt không có điện", kw: "tim loi mat dien giac quat dan nong do chia doi mach no com tiep diem mat n dong ho",
        p: ["Quạt dàn nóng không có điện ra giắc dù cuộn dây và tụ còn tốt: đi theo dòng điện từ nguồn vào đến giắc ra, đo từng điểm để biết điện mất ở khâu nào.",
            "Thứ tự đo: nguồn vào board (L–N), rail 12 V, B–E transistor (≈ 0,7 V), điện áp hai đầu cuộn relay (≈ 12 V), rồi COM–N, NO–N và giắc. Điểm 8 là dây N, đo thông mạch khi đã tắt điện.",
            "COM có 220 V mà NO không có: tiếp điểm relay hỏng. NO có mà giắc không có: đứt vết mạch, nứt mối hàn hoặc mất dây N."] },
      { h: "Relay cấp thiếu điện áp", kw: "relay cap thieu dien ap 5v hut yeu chap cho tiep diem chay ro tia lua rung",
        p: ["Cuộn 12 V chỉ cấp 5 V: dòng chỉ còn khoảng 42% (5 ÷ 400 = 12,5 mA), lực hút nhỏ hơn nhiều nên relay hút yếu hoặc không hút, có thể hút nhả liên tục.",
            "Tiếp điểm đóng lỏng thì điện trở tiếp xúc lớn, dòng của tải đi qua gây tia lửa, nóng, cháy rỗ, có thể dính. Tải chạy chập chờn, nóng, relay hỏng sớm.",
            "Đo hai đầu cuộn thấy thấp hơn điện áp ghi trên relay: tìm vì sao điện áp cấp cho cuộn bị sụt (nguồn 12 V yếu, tụ lọc khô, transistor sụt áp) trước khi thay relay."] }
    ],
    quiz: [
      { q: "Đo thấy NO có 220 V nhưng giắc quạt 0 V, dây N thông. Nghi ngờ nhất là gì?", o: ["Tiếp điểm relay hỏng", "Đứt vết mạch hoặc nứt mối hàn từ NO ra giắc", "Mất nguồn vào board", "Chip không ra lệnh"], a: 1, why: "Điện đã tới NO nên relay và mạch lái tốt. Điện mất sau NO, trên đường ra giắc." },
      { q: "Cuộn relay 12 V chỉ được cấp 5 V. Điều gì có thể xảy ra?", o: ["Relay hút mạnh hơn bình thường", "Relay hút yếu hoặc chập chờn, tiếp điểm tiếp xúc kém, tia lửa và cháy rỗ", "Relay không bao giờ hỏng", "Cuộn đổi thành xoay chiều"], a: 1, why: "Dòng chỉ còn khoảng 42% nên lực hút yếu. Tiếp điểm đóng lỏng sinh tia lửa, nóng, cháy rỗ." },
      { q: "Cuộn relay 12 V, điện trở cuộn 400 Ω. Dòng qua cuộn là?", o: ["3 mA", "30 mA", "300 mA", "4,8 A"], a: 1, why: "I = 12 ÷ 400 = 0,03 A = 30 mA." },
      { q: "Vì sao không nối chip trực tiếp vào cuộn relay?", o: ["Chip chỉ cấp được dòng rất nhỏ, không đủ hút relay", "Relay không dùng điện", "Chip chỉ làm việc với điện xoay chiều", "Để cho đẹp mạch"], a: 0, why: "Cần transistor khuếch đại dòng để hút cuộn relay." },
      { q: "Diode mắc song song cuộn relay dùng để làm gì?", o: ["Tăng lực hút", "Hấp thụ xung điện áp lúc ngắt, bảo vệ transistor", "Giảm dòng nền", "Đổi xoay chiều thành một chiều"], a: 1, why: "Cuộn sinh xung cao khi tắt dòng; diode dập xung đó." },
      { q: "Chip đã ra mức cao nhưng relay không hút. Nguyên nhân có thể là?", o: ["Điện trở nền quá lớn nên Ib quá nhỏ", "Điện trở nền quá nhỏ", "Quạt quá nhẹ", "Không thể có nguyên nhân nào"], a: 0, why: "Ib quá nhỏ thì transistor không dẫn đủ cho cuộn relay." },
      { q: "Tiếp điểm relay có tác dụng gì?", o: ["Đóng ngắt tải, đồng thời cách ly mạch điều khiển với mạch tải", "Chỉ để phát tiếng tách", "Lọc nhiễu nguồn", "Đo dòng điện"], a: 0, why: "Cuộn hút thì tiếp điểm đóng tải, hai mạch tách biệt nhau." }
    ]
  },
  {
    id: "b7", n: 7, title: "Biến áp, sơ cấp và thứ cấp",
    summary: "Biến áp, tỉ số vòng dây, nguồn xung trên board, opto, TL431 và an toàn khi làm việc ở phía sơ cấp.",
    labs: ["bienap","flyback","tl431"],
    keywords: "bien ap so cap thu cap cuon day ti so vong nguon xung smps opto optocoupler tl431 tu loc lon 310v cach ly an toan",
    blocks: [
      { h: "Sơ cấp và thứ cấp là gì", kw: "so cap thu cap bien ap cuon day tu truong cach ly",
        p: ["Biến áp có hai cuộn dây quấn chung một lõi, không nối điện với nhau. Cuộn nhận điện vào là sơ cấp (phía điện nhà 220 V). Cuộn cho điện ra là thứ cấp (phía điện thấp như 12 V, 5 V, 3,3 V).",
            "Điện truyền từ cuộn này sang cuộn kia bằng từ trường trong lõi, không bằng dây dẫn. Vì vậy hai phía được cách ly điện với nhau."],
        img: { src: "img/b7-bien-ap.png", alt: "Biến áp có cuộn sơ cấp và cuộn thứ cấp quấn chung một lõi", cap: "Biến áp: sơ cấp, thứ cấp và lõi" } },
      { h: "Tỉ số vòng dây và dòng điện", kw: "ti so vong day np ns vp vs ip is bao toan cong suat cong thuc bien ap",
        p: ["Điện áp tỉ lệ với số vòng dây: Vp ÷ Vs = Np ÷ Ns. Vp, Vs là điện áp sơ cấp và thứ cấp, Np, Ns là số vòng dây. Ví dụ 480 V xuống 120 V thì tỉ lệ vòng là 4 : 1.",
            "Dòng điện thì ngược lại: Ip ÷ Is = Ns ÷ Np. Điện áp hạ bao nhiêu lần thì dòng tăng bấy nhiêu lần. Lý do là bảo toàn công suất: công suất vào xấp xỉ công suất ra (P = V × I).",
            "Ví dụ: 220 V xuống 12 V, tải lấy 2 A. Tỉ lệ vòng khoảng 18 : 1. Công suất thứ cấp 12 × 2 = 24 W nên dòng sơ cấp khoảng 24 ÷ 220 ≈ 0,11 A. Thực tế có hao hụt nên dòng sơ cấp hơi lớn hơn.",
            "Các công thức trên là của biến áp lý tưởng. Cách nhớ: áp xuống thì dòng lên, áp lên thì dòng xuống."] },
      { h: "Vì sao board dùng nguồn xung", kw: "nguon xung smps 310v 220 1,414 chop tan so cao bien ap nho gon tu loc lon",
        p: ["Biến áp chỉ làm việc với dòng điện biến thiên. Điện nhà 50 Hz cũng biến thiên, nhưng biến áp loại đó rất to và nặng.",
            "Nguồn xung làm khác: chỉnh lưu điện nhà thành khoảng 310 V DC (220 × 1,414) trên tụ lọc lớn, rồi dùng MOSFET hoặc IC đóng ngắt dòng này hàng chục nghìn lần mỗi giây qua cuộn sơ cấp. Tần số cao nên biến áp nhỏ gọn.",
            "Hai ý trên là nguyên lý chung của nguồn xung, không phụ thuộc hãng máy."],
        img: { src: "img/b7-nguon-xung.png", alt: "Sơ đồ khối nguồn xung chia phía sơ cấp và phía thứ cấp", cap: "Sơ đồ khối nguồn xung trên board" } },
      { h: "Dòng chảy của nguồn xung", kw: "dong chay nguon xung cau chinh luu tu loc mosfet bien ap diode chinh luu 12v 5v",
        p: ["Phía sơ cấp (nóng): điện nhà 220 V → cầu chì → cầu chỉnh lưu → tụ lọc lớn (khoảng 310 V DC) → công tắc xung (MOSFET hoặc IC) → cuộn sơ cấp biến áp.",
            "Phía thứ cấp (lạnh): cuộn thứ cấp → diode chỉnh lưu → tụ lọc (ví dụ 16 V, 25 V) → các đường 12 V, 5 V, 3,3 V. Đường 12 V chính là rail 12 V ở Bài 6."] },
      { h: "Opto và TL431: vòng hồi tiếp", kw: "opto optocoupler tl431 hoi tiep phototransistor led cach ly lay mau 2,5v pc817",
        p: ["Opto là linh kiện có hai phần trong một vỏ: đèn LED và phototransistor, truyền tín hiệu bằng ánh sáng, không nối điện. LED nằm phía thứ cấp, phototransistor phía sơ cấp.",
            "TL431 ở phía thứ cấp lấy mẫu điện áp ra (qua cầu phân áp), so với mốc chuẩn khoảng 2,5 V. Lệch nhiều thì cho nhiều dòng qua LED opto.",
            "Chuỗi tác dụng: 12 V tăng → TL431 dẫn mạnh → LED sáng mạnh → phototransistor dẫn mạnh → IC phía sơ cấp thu hẹp xung → 12 V giảm xuống. Điện áp thấp thì chuỗi đảo ngược.",
            "Không thể thay opto bằng dây nối trực tiếp: dây sẽ làm mất cách ly và đưa điện nguy hiểm từ sơ cấp sang thứ cấp."],
        img: { src: "img/b7-opto.png", alt: "Opto và TL431 trong vòng hồi tiếp của nguồn xung", cap: "Opto truyền tín hiệu bằng ánh sáng qua rào cách ly" } },
      { h: "An toàn khi làm việc", kw: "an toan phia so cap xa tu 300v bien ap cach ly do nguoi nong lanh",
        p: ["Phía sơ cấp có thể gây chết người, tuyệt đối không chạm khi đang cắm điện.",
            "Tụ lọc lớn vẫn giữ khoảng 300 V sau khi rút phích. Phải xả tụ rồi đo lại bằng đồng hồ trước khi chạm vào board.",
            "Khi bắt buộc đo lúc có điện, nên dùng biến áp cách ly. Phía thứ cấp an toàn hơn nhưng dòng lớn, chập là cháy."] },
      { h: "Lỗi thường gặp theo từng phía", kw: "loi thuong gap cau chi dut mat 12v so cap thu cap opto tl431 khong co dien ap ra",
        p: ["Phần này là suy luận từ sơ đồ khối. Đứt cầu chì: thường do chập phía sơ cấp (cầu chỉnh lưu, MOSFET) hoặc tụ lọc hỏng.",
            "Có khoảng 310 V ở tụ lớn nhưng thứ cấp 0 V: nghi khối xung hoặc biến áp. Sơ cấp bình thường mà 12 V thấp hoặc dao động: nghi tụ lọc thứ cấp, diode chỉnh lưu hoặc vòng hồi tiếp (TL431, opto).",
            "Nguyên tắc: đo từ vào đến ra, chia hai phía, tìm xem điện mất ở khối nào."] }
    ],
    quiz: [
      { q: "Biến áp hạ từ 480 V xuống 120 V. Tỉ lệ vòng dây sơ cấp : thứ cấp là?", o: ["1 : 4", "4 : 1", "2 : 1", "480 : 12"], a: 1, why: "Điện áp tỉ lệ với số vòng: 480 ÷ 120 = 4, nên cuộn sơ cấp nhiều vòng gấp 4 lần." },
      { q: "Hạ 220 V xuống 12 V, tải lấy 2 A. Dòng sơ cấp khoảng bao nhiêu?", o: ["Khoảng 0,11 A", "Khoảng 2 A", "Khoảng 36 A", "Khoảng 24 A"], a: 0, why: "Công suất thứ cấp 12 × 2 = 24 W nên dòng sơ cấp ≈ 24 ÷ 220 ≈ 0,11 A." },
      { q: "Tụ lọc lớn sau cầu chỉnh lưu khi cắm điện 220 V giữ khoảng bao nhiêu volt DC?", o: ["Khoảng 12 V", "Khoảng 220 V", "Khoảng 310 V", "Khoảng 1000 V"], a: 2, why: "220 × 1,414 ≈ 310 V." },
      { q: "Vì sao rút phích rồi vẫn nguy hiểm khi chạm vào phía sơ cấp?", o: ["Biến áp vẫn còn phát điện", "Tụ lọc lớn vẫn giữ điện áp cao", "Cầu chì giữ điện", "Không nguy hiểm nữa"], a: 1, why: "Tụ lớn giữ khoảng 300 V một lúc sau khi rút phích. Phải xả và đo lại bằng đồng hồ." },
      { q: "Opto trong nguồn xung dùng để làm gì?", o: ["Tăng điện áp", "Truyền tín hiệu hồi tiếp bằng ánh sáng mà vẫn cách ly hai phía", "Chỉnh lưu điện áp", "Lọc nhiễu"], a: 1, why: "LED ở thứ cấp, phototransistor ở sơ cấp, tín hiệu đi bằng ánh sáng nên không nối điện." },
      { q: "TL431 làm việc gì trong vòng hồi tiếp?", o: ["Đóng ngắt dòng 300 V", "So điện áp ra với mốc chuẩn khoảng 2,5 V và điều khiển dòng qua LED opto", "Đổi điện xoay chiều thành một chiều", "Làm ra tia lửa"], a: 1, why: "Nó lấy mẫu điện áp ra rồi cho nhiều hay ít dòng qua LED opto." }
    ]
  },
  {
    id: "b8", n: 8, title: "Nguồn xung trên bo inverter (nâng cao)",
    summary: "Đọc một bo inverter điều hòa thật: 5 giai đoạn nguồn xung, nhánh 300 V, 5 V, +15 V, vòng hồi tiếp TL431 và opto, đo nguội và chẩn đoán hư hỏng.",
    labs: ["vonghoi","sec","buck","boot","spwm","deadtime","shunt","chiaap","snub"],
    keywords: "bo inverter nguon xung smps igbt 7815 15v driver tl431 opto diode kep schottky emi varistor hoi tiep fb pwm hiccup ctr do nguoi 300v mat 15v",
    blocks: [
      { h: "Bo inverter chia hai khu vực", kw: "bo inverter khu vuc so cap thu cap khe cach ly igbt mcu hai khu vuc",
        p: ["Bài này đi tiếp từ Bài 7, áp dụng vào một bo inverter điều hòa thật. Nội dung dựa trên tài liệu phân tích một bo thực tế do bạn cung cấp, chưa kiểm chứng độc lập. Tên và vị trí linh kiện có thể khác ở bo khác. Phần chân opto và độ sụt áp của 7815 đã đối chiếu với tài liệu trên web.",
            "Bo chia hai khu vực cách ly nhau bằng khe rãnh xẻ trên mạch in. Sơ cấp (nóng) có điện 220 V AC và khoảng 300 V DC: mạch lọc nhiễu, cầu diode, tụ lọc lớn, IC nguồn xung, cuộn sơ cấp biến áp và khối công suất biến tần (6 IGBT lái động cơ U-V-W cùng 3 IC driver).",
            "Thứ cấp (lạnh) có điện áp thấp 12 V, 5 V, 3,3 V: cuộn thứ cấp, diode chỉnh lưu xung, tụ lọc, vi điều khiển (MCU) và các cổng giao tiếp."],
        img: { src: "img/b8-bo-inverter.png", alt: "Sơ đồ 5 giai đoạn của nguồn xung trên bo inverter, chia sơ cấp và thứ cấp", cap: "Năm giai đoạn nguồn xung trên bo inverter" } },
      { h: "Năm giai đoạn của nguồn xung", kw: "nam giai doan nguon xung loc nhieu emi chinh luu 300v dong cat xung chinh luu ha ap hoi tiep",
        p: ["Giai đoạn 1, lọc nhiễu EMI: điện 220 V AC đi qua cầu chì, varistor (bảo vệ quá áp), cuộn lọc nhiễu và tụ lọc X để triệt xung nhiễu cao tần.",
            "Giai đoạn 2, chỉnh lưu và lọc: cầu diode đổi AC thành DC, nạp tụ lớn tạo khoảng 300 đến 310 V DC. Nguồn này chia hai nhánh: cấp cho 6 IGBT (ra giắc ba pha U-V-W) và cấp cho mạch băm xung.",
            "Giai đoạn 3, đóng cắt xung: 300 V DC đi qua cuộn sơ cấp biến áp vào IC nguồn xung. IC đóng ngắt ở tần số vài chục kHz, tạo từ trường biến thiên cảm ứng sang cuộn thứ cấp và cuộn phụ.",
            "Giai đoạn 4, chỉnh lưu hạ áp: ở thứ cấp, diode kép nắn xung thành DC, tụ nhôm (ví dụ 1000 µF 25 V) lọc, rồi mạch hạ áp tạo 5 V và 3,3 V nuôi MCU. Ở nhánh phụ, cuộn phụ và tụ nhỏ cấp cho IC 7815 giữ +15 V cho 3 IC driver.",
            "Giai đoạn 5, hồi tiếp: TL431 và opto báo trạng thái điện áp ra về chân FB của IC nguồn xung để chỉnh độ rộng xung (PWM), giữ điện áp ra ổn định."] },
      { h: "Ba mức điện áp, ba việc", kw: "300v 5v 3,3v 15v igbt driver gate mcu nuoi mat 15v khong kich duoc igbt",
        p: ["300 V DC: nuôi khối công suất 6 IGBT để tạo điện ba pha chạy động cơ máy nén.",
            "5 V và 3,3 V: nuôi vi điều khiển, đèn báo và giao tiếp.",
            "+15 V: nuôi 3 IC driver để kích mở cực Gate của 6 IGBT. Theo tài liệu, áp thấp hơn 12 V làm IGBT mở không đủ nên nóng, có thể nổ. Áp quá 20 V có thể thủng cực Gate.",
            "Có 5 V không có nghĩa là có +15 V: hai nhánh này độc lập nhau, hỏng một nhánh thì nhánh kia vẫn sống."] },
      { h: "Bốn linh kiện trọng tâm", kw: "opto 4 chan pc817 tl431 diode kep schottky to220 7815 chan ref anode cathode in gnd out",
        p: ["Opto 4 chân (loại thường gặp như PC817): chân 1 Anode và chân 2 Cathode là đèn LED hồng ngoại. Chân 3 Emitter và chân 4 Collector là phototransistor. Trên bo thật, LED nằm phía thứ cấp, phototransistor phía sơ cấp, con opto nằm vắt ngang khe cách ly.",
            "TL431: ba chân Ref, Anode, Cathode. Ref nhận áp mẫu từ cầu phân áp. Cathode nối qua điện trở xuống LED của opto. Nó so điện áp ra với mốc chuẩn khoảng 2,5 V.",
            "Diode kép chỉnh lưu xung (loại Schottky, dạng TO-220 bắt lên tản nhiệt): hai diode chung cathode ở chân giữa, hai chân bìa là anode. Hai diode chạy song song nên chịu dòng lớn hơn và sụt áp thấp.",
            "IC ổn áp 7815: ba chân IN, GND, OUT (thứ tự thường gặp, nhìn mặt có chữ, chân hướng xuống; cần tra datasheet khi nghi ngờ). Ra 15 V. Áp vào phải cao hơn ngõ ra ít nhất khoảng 2 V."],
        img: { src: "img/b8-linh-kien.png", alt: "Chân của opto 4 chân, TL431, diode kép TO-220 và IC 7815", cap: "Chân của bốn linh kiện trọng tâm" } },
      { h: "Hai trạng thái hồi tiếp", kw: "hoi tiep tl431 opto fb duty cycle pwm ap ra tang giam tai nang tu can bang",
        p: ["Áp ra tăng cao hơn chuẩn: chân Ref của TL431 tăng, TL431 dẫn mạnh hơn, dòng qua LED opto tăng nên LED sáng mạnh. Phototransistor dẫn mạnh, kéo chân FB của IC nguồn xuống, IC giảm độ rộng xung (duty cycle) và áp ra hạ về mức chuẩn.",
            "Áp ra bị sụt (do tải nặng): chân Ref giảm, TL431 dẫn yếu, LED sáng yếu, phototransistor dẫn yếu. IC nguồn mở rộng xung để bơm thêm năng lượng sang thứ cấp, áp ra tăng lại.",
            "Vòng này tự cân bằng: lệch lên thì kéo xuống, lệch xuống thì kéo lên. Gãy một mắt xích thì áp ra mất kiểm soát."] },
      { h: "Đo nguội bằng đồng hồ (thang diode)", kw: "do nguoi dong ho thang diode opto led 1,0 1,2v ol diode kep 0,15 0,45v schottky xa tu",
        p: ["Trước khi đo nguội: rút điện, xả tụ lớn 300 V rồi đo lại cho chắc (xem Bài 3 và Bài 7). Đồng hồ số: que đỏ là cực dương, que đen là cực âm. Đồng hồ kim thì ngược lại (que đen mới là cực dương).",
            "Opto, khối LED (chân 1 và 2): que đỏ chân 1, que đen chân 2 thì sụt áp khoảng 1,0 đến 1,2 V (theo tài liệu bo thực tế; tài liệu PC817 ghi điện áp thuận điển hình khoảng 1,25 V ở dòng định mức nên số đo có thể hơi khác). Đảo que thì báo OL (không dẫn).",
            "Opto, khối transistor (chân 3 và 4): đo cả hai chiều đều phải OL. Nếu thông mạch là chập chân 3 và 4.",
            "Diode kép: que đỏ vào một chân bìa, que đen vào chân giữa thì sụt áp khoảng 0,15 đến 0,45 V (đặc trưng Schottky). Đảo que thì không thông. Hai chiều đều thông gần 0 là chập."] },
      { h: "Hư hỏng thực tế và cách nghĩ", kw: "hu hong mat hoi tiep opto gia ctr hiccup chap diode kep mat 15v 7815 chip song khong kich igbt",
        p: ["Theo tài liệu bo thực tế (chưa kiểm chứng độc lập). Mất hồi tiếp (opto đứt hoặc mạch dò TL431 hỏng): điện áp thứ cấp vọt cao, có thể phù tụ lọc ra. Hoặc IC nguồn ngắt bảo vệ làm nguồn chớp tắt liên tục (gọi là hiccup), nặng có thể nổ IC nguồn.",
            "Opto bị già (hệ số truyền dòng CTR giảm): chạy không tải thì bình thường, nhưng khi đóng relay hoặc tải nặng thì sụt áp sâu, biến áp phát tiếng kêu rít.",
            "Chập diode kép: thứ cấp bị ngắn mạch, nguồn xung khóa bảo vệ, mất 12 V và 5 V, biến áp kêu tạch tạch nhỏ.",
            "Mất +15 V sau 7815: MCU vẫn sống (có 5 V và 3,3 V), đèn báo và giao tiếp vẫn chạy nhưng không kích được dàn IGBT. Động cơ máy nén không quay, báo lỗi công suất hoặc mất pha.",
            "Cách nghĩ: có 5 V mà không có 15 V thì tìm nhánh phụ (cuộn phụ, tụ nhỏ, 7815). Mất cả 12 V và 5 V thì nghi diode kép chập hoặc IC nguồn bảo vệ. Áp ra sai hoặc dao động thì kiểm tra cầu phân áp, TL431, opto."] }
    ],
    quiz: [
      { q: "Máy còn sáng đèn và giao tiếp bình thường (có 5 V, 3,3 V) nhưng máy nén không quay, báo lỗi công suất. Nghi nhánh nào trước?", o: ["Tụ lọc nhiễu X", "Nhánh +15 V cấp cho các IC driver (7815)", "Cầu chì đầu vào", "Mạch hạ áp 3,3 V"], a: 1, why: "MCU sống nghĩa là thứ cấp 5 V và 3,3 V ổn. Mất +15 V thì driver không kích được IGBT." },
      { q: "Điện áp khoảng 300 V DC trên bo inverter được dùng để làm gì?", o: ["Chỉ nuôi vi điều khiển", "Nuôi khối IGBT và cấp cho mạch băm xung của nguồn xung", "Chỉ cấp cho đèn báo", "Cấp cho opto"], a: 1, why: "300 V chia hai nhánh: ra dàn 6 IGBT (U-V-W) và vào IC nguồn xung qua cuộn sơ cấp." },
      { q: "Opto 4 chân loại PC817: chân nào là phototransistor?", o: ["Chân 1 và 2", "Chân 3 và 4", "Chân 1 và 4", "Chân 2 và 3"], a: 1, why: "Chân 1 (Anode) và 2 (Cathode) là LED. Chân 3 (Emitter) và 4 (Collector) là phototransistor." },
      { q: "Đo nguội diode kép Schottky chiều thuận, sụt áp khoảng bao nhiêu?", o: ["Khoảng 0,15 đến 0,45 V", "Khoảng 5 V", "Khoảng 15 V", "OL (không dẫn)"], a: 0, why: "Schottky sụt áp thấp. Đảo que thì không thông." },
      { q: "Opto bị già (CTR giảm): chạy không tải thì bình thường, tải nặng thì sụt áp và biến áp rít. Vì sao?", o: ["Cầu chì quá lớn", "Tín hiệu hồi tiếp yếu nên IC nguồn không điều chỉnh xung kịp theo tải", "Tụ lọc EMI hỏng", "Động cơ quá nhẹ"], a: 1, why: "Opto truyền tín hiệu kém đi nên vòng hồi tiếp phản ứng chậm, nguồn không giữ nổi điện áp khi tải nặng." },
      { q: "Nguy cơ chính khi opto đứt hoặc mạch dò TL431 hỏng (mất hồi tiếp) là gì?", o: ["Điện áp thứ cấp có thể vọt cao hoặc IC nguồn ngắt bảo vệ", "Không có hậu quả gì", "Chỉ làm đèn mờ", "Điện áp tự giảm về 0 và đứng yên an toàn"], a: 0, why: "IC nguồn không biết áp ra thế nào để chỉnh xung nên áp có thể vọt cao hoặc nguồn ngắt bảo vệ chớp tắt (hiccup)." },
      { q: "Trước khi đo nguội trên phía sơ cấp phải làm gì?", o: ["Đo ngay vì đã rút phích", "Rút điện, xả tụ lọc lớn 300 V và đo lại bằng đồng hồ", "Chạm tay kiểm tra tụ", "Bật máy cho tụ tự xả"], a: 1, why: "Tụ lớn giữ khoảng 300 V sau khi rút phích, phải xả và xác nhận bằng đồng hồ." }
    ]
  },
  {
    id: "b9", n: 9, title: "Đọc bo nguồn xung inverter thực tế",
    summary: "Bản đồ đọc một bo inverter thật: 5 bước theo đường điện, ảnh bo đánh số linh kiện hai mặt, cách đọc mã in, chẩn đoán theo triệu chứng.",
    labs: ["ntc","varistor","emi","xatux","relay"],
    keywords: "doc bo mach inverter thuc te ban do linh kien tu x tu y ntc varistor cau chi cuon chong nhieu bien ap xung ic nguon opto tl431 shunt snubber igbt driver ma in 334k 104k 2703 relay",
    blocks: [
      { h: "Đọc bo trong 5 bước", kw: "doc bo 5 buoc so cap thu cap duong dien khe cach ly bus 300v",
        p: ["Nội dung dựa trên ảnh một bo thật và tài liệu bạn cung cấp, chưa kiểm chứng độc lập. Tên và vị trí linh kiện ở bo khác có thể khác.",
            "Bước 1. Tìm ranh giới sơ cấp và thứ cấp: khe trống cắt trên bo, vạch trắng in dày, tụ Y xanh vắt qua và biến áp xung. Bên có cầu chì, varistor, cuộn chống nhiễu là sơ cấp (220 V và khoảng 300 V DC, nguy hiểm).",
            "Bước 2. Đi từ đầu vào: cầu chì, varistor, cuộn chống nhiễu, tụ X, NTC, cầu chỉnh lưu.",
            "Bước 3. Tìm tụ lọc lớn nhất (bus khoảng 300 V DC). 220 V × 1,414 ≈ 310 V. Từ đây điện chia hai ngả: sang nguồn xung và sang khối IGBT chạy máy nén.",
            "Bước 4. Theo nhánh nguồn xung: IC nguồn băm xung qua cuộn sơ cấp biến áp. Thứ cấp có diode kép Schottky và tụ 1000 µF tạo 12 V, 5 V, 3,3 V. Cuộn phụ đi qua 7815 ra +15 V.",
            "Bước 5. Tìm vòng hồi tiếp (TL431 và opto) và khối inverter (3 IC driver, 6 IGBT, ngõ ra U-V-W).",
            "Mẹo: tìm các linh kiện đặc trưng trước (biến áp lõi ferrite, tụ hóa to nhất, tản nhiệt, opto 4 chân, relay hộp nhựa), phần còn lại tự xếp vào chỗ."] },
      { h: "Mặt linh kiện: bản đồ có số", kw: "mat linh kien ban do danh so cau chi varistor tu x lcl cuon chong nhieu ntc cau diode e2 cn1",
        p: ["Màu số trên ảnh là nhóm: cam là đầu vào AC và bảo vệ, đỏ là bus 300 V, vàng là nguồn xung sơ cấp, xanh lá là thứ cấp, tím là inverter, xanh dương là điều khiển và nguồn phụ.",
            "Cam. 1: giắc trắng 2 chân, ngõ vào 220 V (L và N). 2: cầu chì tổng đứt chậm 8 A (chữ T là đứt chậm để chịu dòng nạp tụ). 3: varistor ZR1 (mã 14K561), kẹp khoảng 560 V, quá áp thì chập để làm đứt cầu chì. 4: tụ X hộp vàng 334K (0,33 µF). 5: cuộn chống nhiễu đồng pha, cho 50 Hz đi qua và chặn nhiễu cao tần. 6: tụ X hộp vàng 104K (0,1 µF). 7: NTC, hạn dòng nạp tụ lớn lúc mới cắm, nóng lên thì trở kháng giảm gần 0 Ω. 26: relay đóng cắt tải AC (ví dụ thanh sấy xả đá), cạnh còn một relay nữa chưa rõ tải.",
            "Đỏ. 8: cầu chỉnh lưu có tản nhiệt, đổi AC thành DC nhấp nhô. 9: tụ lọc lớn màu nâu (450 V 220 µF), san phẳng thành 300 đến 310 V DC. Sau khi rút điện tụ này vẫn giữ áp cao. 10: tụ gốm xanh sát tụ lớn, hấp thụ gai cao tần."],
        img: { src: "img/b9-mat-linh-kien.jpg", alt: "Ảnh mặt linh kiện của bo inverter, đánh số 1 đến 28 theo nhóm màu", cap: "Mặt linh kiện: 28 điểm đánh số, màu theo nhóm" } },
      { h: "Nguồn xung, thứ cấp và điều khiển", kw: "nguon xung bien ap ic nguon diode kep tu 1000uf 7815 mcu shunt r100 snubber tu y buck",
        p: ["Vàng. 11: biến áp xung, truyền năng lượng bằng từ trường, hạ áp xuống 12 V và 15 V, cách ly sơ cấp và thứ cấp. 12: IC nguồn xung (tích hợp MOSFET cao áp và PWM, nhận hồi tiếp từ opto). 13: tụ Y xanh vắt qua ranh giới, thoát nhiễu EMI giữa mass sơ cấp và mass thứ cấp. 16: IC 7815 đứng, ổn áp +15 V cho driver và nhánh hạ áp nuôi MCU phía inverter. 27: hai bản đệm hàn dây nối, vị trí để trống, không phải linh kiện hoạt động.",
            "Xanh lá. 14: diode kép có tản nhiệt, chỉnh lưu 12 V (nhận dạng theo hình dạng). 15: tụ 1000 µF 25 V lọc 12 V. 25: MCU thứ cấp (chip vuông lớn) điều khiển tủ, cảm biến, báo lỗi. 28: giắc xanh nhiều chân, cổng tín hiệu.",
            "Tím. 21 (6 con): IGBT, cầu nghịch lưu 3 pha, 3 con nhánh trên và 3 con nhánh dưới. 22 (3 con): IC driver, khuếch đại xung 3,3 V hoặc 5 V lên 15 V để kích một cặp IGBT mỗi pha. 19: tụ hộp vàng 104K 630V dập xung (snubber). 23: giắc đỏ 3 chân U-V-W, ngõ ra 3 pha xuống 3 cuộn dây máy nén.",
            "Xanh dương. 17: MCU phía inverter, phát 6 xung PWM cho IGBT. 18: điện trở shunt in R100 (0,1 Ω), đo dòng máy nén qua độ sụt áp, bảo vệ quá dòng. 20: cuộn 10 µH hạ 15 V xuống 3,3 hoặc 5 V nuôi MCU. 24: hai opto dán truyền dữ liệu cách ly giữa hai MCU (theo tài liệu, chưa kiểm chứng vị trí)."] },
      { h: "Mặt hàn: các linh kiện dán nhỏ", kw: "mat han ic20 xa tu x re1 r78 r82 lay mau bus opto ic3 tl431 ic4 r17 r18 cn10 swd",
        p: ["Mặt hàn giấu những linh kiện SMD quyết định việc ổn áp và bảo vệ. Đường đồng to là phía sơ cấp, cách xa phía thứ cấp bằng khoảng trống.",
            "1: IC20, tự động xả tụ X khi rút phích (hai MOSFET cao áp đấu ngược, không cần chân VCC). Không phải IC nguồn phụ. 2 và 3: hai trở mã 2703 (270 kΩ), đường xả điện dư của tụ X. 4: trở công suất mã 20R0 (20 Ω), hạn dòng nhánh bảo vệ AC. 5 và 6: trở 680 kΩ (mã 6803) lấy mẫu bus 300 V đưa về MCU.",
            "7: opto hồi tiếp, ánh sáng chuyển mẫu áp từ thứ cấp sang IC nguồn qua khe cách ly. 8 đến 11: vùng quanh opto, gồm một diode, IC dạng TL431 (tham chiếu 2,5 V so mẫu 12 V rồi kéo dòng qua LED opto), trở phân áp lấy mẫu 12 V và trở tụ bù pha vòng hồi tiếp. Các mục 8 đến 11 nhận dạng theo vị trí, cần đọc mã in để xác nhận. 12: header 4 chân (3V3, SWD, SWCLK, GND) dùng nạp chương trình. 13: IC nhiều chân gần giắc phía thứ cấp, chức năng chưa kiểm chứng.",
            "Đường hồi tiếp: 12 V thứ cấp, trở phân áp, chân Ref TL431, LED opto, transistor opto, chân FB của IC nguồn, đổi độ rộng xung."],
        img: { src: "img/b9-mat-han.jpg", alt: "Ảnh mặt hàn của bo inverter, đánh số 1 đến 13", cap: "Mặt hàn: 13 điểm đánh số" } },
      { h: "Thẻ linh kiện 1: đầu vào và bảo vệ", kw: "the linh kien hinh anh giac cn1 cau chi fuse varistor zr1 ntc", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/t-cn1.jpg", "n": "Giắc vào 220 V (CN1)", "t": "Giắc nhựa trắng 2 chân ở mép bo, nơi dây nguồn L và N cắm vào. Đây là điểm đầu tiên của đường điện."}, {"src": "img/parts/t-fuse.jpg", "n": "Cầu chì FUSE1", "t": "Hộp nhỏ màu nâu đỏ nằm sát tụ X vàng, ghi T8AL 250V theo tài liệu. T là đứt chậm, 8 A. Đứt thì thường là do phía sau có chập."}, {"src": "img/parts/t-zr1.jpg", "n": "Varistor ZR1", "t": "Đĩa tròn bọc co nhiệt đen, thấy đầu xanh lá lộ ra ở mặt trước. Mã 14K561 là theo tài liệu, ảnh không đọc được chữ. Áp lưới vọt cao thì nó chập để làm đứt cầu chì, cứu mạch phía sau."}, {"src": "img/parts/t-ntc.jpg", "n": "NTC hạn dòng nạp", "t": "Đĩa đen dẹt nằm cạnh tụ X và giắc phía dưới. Lúc mới cắm điện nó cản dòng nạp vào tụ lớn, nóng lên thì trở kháng giảm gần 0 Ω."}] },
      { h: "Thẻ linh kiện 2: lọc nhiễu", kw: "the linh kien hinh anh tu x cx1 cx2 cuon chong nhieu lcl tu y gom xanh c2", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/t-cx2.jpg", "n": "Tụ X CX2 (334K)", "t": "Tụ hộp vàng, bên trên có in 334K. Giá trị 0,33 µF. Mắc giữa L và N để dập nhiễu giữa hai dây."}, {"src": "img/parts/t-cx1.jpg", "n": "Tụ X CX1 (104K)", "t": "Tụ hộp vàng nhỏ hơn, cạnh hai tụ gốm xanh. In 104K nghĩa là 0,1 µF. IC20 xả điện cho tụ này khi rút phích."}, {"src": "img/parts/t-lcl.jpg", "n": "Cuộn chống nhiễu LCL-H2810", "t": "Cuộn dây đồng quấn trên lõi nhựa xanh lá có in LCL-H2810. Cho dòng 50 Hz đi qua trơn tru, chặn nhiễu cao tần từ lưới vào bo và từ bo ra lưới."}, {"src": "img/parts/t-c2.jpg", "n": "Tụ gốm xanh dương (tụ Y, C2)", "t": "Hạt xanh dương hình giọt nước nằm sát tụ lọc lớn và cuộn chống nhiễu. Hấp thụ gai cao tần và thoát nhiễu xuống mass."}, {"src": "img/parts/t-cy.jpg", "n": "Tụ Y xanh vắt qua biến áp (CY)", "t": "Hạt xanh dương nằm cạnh biến áp xung, vắt qua ranh giới sơ cấp và thứ cấp. Thoát nhiễu EMI sinh ra khi băm xung."}] },
      { h: "Thẻ linh kiện 3: chỉnh lưu và bus 300 V", kw: "the linh kien hinh anh cau chinh luu bd1 tu loc e2 bus 300v", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/t-bd1.jpg", "n": "Cầu chỉnh lưu BD1", "t": "Khối nhựa đen dài, 4 chân, có thể gắn tản nhiệt. Đổi AC thành DC nhấp nhô. Đo nguội bằng thang diode khi đã xả tụ."}, {"src": "img/parts/t-e2.jpg", "n": "Tụ lọc lớn E2 (bus 300 V)", "t": "Tụ hóa to nhất trên bo, màu nâu, theo tài liệu 450 V 220 µF. Lọc ra khoảng 300 đến 310 V DC. Rút điện xong vẫn giữ áp cao, phải xả trước khi chạm."}] },
      { h: "Thẻ linh kiện 4: nguồn xung và thứ cấp", kw: "the linh kien hinh anh bien ap xung ic2 diode kep tu 1000uf 7815", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/t-bien-ap.jpg", "n": "Biến áp xung", "t": "Khối có băng keo vàng, in XZM-E20246 trên bo trong ảnh. Truyền năng lượng bằng từ trường, hạ áp và cách ly sơ cấp với thứ cấp."}, {"src": "img/parts/t-ic2.jpg", "n": "IC nguồn xung IC2", "t": "IC đen 8 chân dán nằm dưới biến áp. Theo tài liệu là IC flyback có sẵn MOSFET cao áp và PWM, nhận hồi tiếp từ opto."}, {"src": "img/parts/t-diode-kep.jpg", "n": "Diode kép có tản nhiệt", "t": "Linh kiện đen 3 chân gắn tản nhiệt nhôm cạnh biến áp. Nhận dạng theo hình dạng, chưa đọc được mã. Chỉnh lưu xung 12 V."}, {"src": "img/parts/t-tu1000.jpg", "n": "Tụ 1000 µF 25 V", "t": "Tụ hóa trụ, thân xám miệng đỏ có in 1000 µF 25 V. Lọc đường 12 V thứ cấp."}, {"src": "img/parts/t-ic7815.jpg", "n": "IC ổn áp 7815", "t": "Linh kiện đen 3 chân đứng cạnh MCU inverter. Nhận dạng theo hình dạng, ra +15 V cho 3 IC driver và nhánh hạ áp nuôi MCU. Chân thường là vào, mass, ra nhưng cần tra datasheet."}] },
      { h: "Thẻ linh kiện 5: inverter và điều khiển", kw: "the linh kien hinh anh igbt driver uvw mcu r100 snubber l4 opto relay giac", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/t-igbt.jpg", "n": "IGBT (6 con)", "t": "Linh kiện dán 3 chân lớn, xếp thành hai hàng. 3 con nhánh trên và 3 con nhánh dưới, băm 300 V thành điện 3 pha."}, {"src": "img/parts/t-driver.jpg", "n": "IC driver cổng IGBT (3 con)", "t": "IC dán nhỏ nằm cạnh cụm IGBT. Khuếch đại xung 3,3 V hoặc 5 V từ MCU lên 15 V để kích mở IGBT."}, {"src": "img/parts/t-uvw.jpg", "n": "Giắc đỏ U-V-W", "t": "Giắc đỏ 3 chân ở góc bo, có in chữ W V U. Ngõ ra điện 3 pha xuống ba cuộn dây máy nén."}, {"src": "img/parts/t-mcu2.jpg", "n": "MCU inverter và 7815", "t": "Chip vuông nhiều chân (QFP) bên trái, cạnh linh kiện đen 3 chân. Tính toán điều khiển và phát 6 xung PWM cho 6 IGBT."}, {"src": "img/parts/t-r100.jpg", "n": "Trở shunt R100", "t": "Điện trở dán to, in R100 (0,1 Ω). Dòng máy nén chạy qua tạo sụt áp nhỏ để MCU đo dòng và bảo vệ quá dòng."}, {"src": "img/parts/t-snubber.jpg", "n": "Tụ snubber 104K 630P", "t": "Tụ hộp vàng nhỏ cạnh khối IGBT. Hấp thụ gai điện áp khi đóng ngắt dòng lớn."}, {"src": "img/parts/t-l4.jpg", "n": "Cuộn L4 (10 µH)", "t": "Cuộn dán vuông màu xám, in 100 nghĩa là 10 µH. Cùng IC nhỏ hạ 15 V xuống 3,3 hoặc 5 V nuôi MCU."}, {"src": "img/parts/t-opto-uart.jpg", "n": "Hai opto dán", "t": "Hai linh kiện đen dán cạnh nhau ở phía trên. Theo tài liệu truyền dữ liệu UART cách ly giữa hai MCU, vị trí chưa kiểm chứng."}, {"src": "img/parts/t-mcu-tc.jpg", "n": "MCU thứ cấp", "t": "Chip vuông lớn gần tụ 1000 µF và diode kép. Điều khiển tủ, cảm biến, báo lỗi và giao tiếp với MCU inverter."}, {"src": "img/parts/t-relay.jpg", "n": "Relay", "t": "Hai relay nhựa trắng cạnh nhau, một con là RY1 (12-HS1) đóng 220 V ra thanh sấy xả đá. Con còn lại chưa rõ tải."}, {"src": "img/parts/t-giac-xanh.jpg", "n": "Giắc xanh nhiều chân", "t": "Giắc xanh dương nhiều chân ở mép bo, cổng tín hiệu tới bảng điều khiển hoặc cảm biến. Nhận dạng theo hình dạng."}] },
      { h: "Thẻ linh kiện 6: mặt hàn", kw: "the linh kien hinh anh mat han ic20 r6 re1 r78 opto ic3 tl431 cn10 ic14", p: ["Hình cắt từ ảnh bo thật. Chạm vào hình để xem lớn."],
        parts: [{"src": "img/parts/u-ic20.jpg", "n": "IC20 xả tụ X", "t": "IC dán 8 chân có in IC20 gần giắc vào. Tự xả tụ X khi rút phích. Không phải IC nguồn phụ."}, {"src": "img/parts/u-r6.jpg", "n": "Trở R6 và R7, R8", "t": "Trở dán nhỏ in 2703 là 270 kΩ, nằm gần IC20. Đường xả điện dư của tụ X."}, {"src": "img/parts/u-re1.jpg", "n": "Trở công suất RE1", "t": "Trở dán to in 20R0 (20 Ω). Hạn dòng nhánh bảo vệ AC."}, {"src": "img/parts/u-r78.jpg", "n": "Trở R78 và R82", "t": "Trở dán in 6803 (680 kΩ) cùng tụ nhỏ. Lấy mẫu áp bus 300 V đưa về MCU để báo quá áp hoặc thấp áp."}, {"src": "img/parts/u-ic3.jpg", "n": "Opto hồi tiếp IC3", "t": "Linh kiện đen 4 chân dán, vắt qua khe cách ly, có in IC3. Chuyển mẫu áp từ thứ cấp sang IC nguồn bằng ánh sáng."}, {"src": "img/parts/u-tl431.jpg", "n": "Vùng TL431 và trở lấy mẫu", "t": "Linh kiện đen 3 chân nhỏ (bên trái) cùng các trở R17, R18 và R180, R181. Theo vị trí, đây là IC dạng TL431 của vòng hồi tiếp. Cần đọc mã in để xác nhận."}, {"src": "img/parts/u-cn10.jpg", "n": "Header CN10", "t": "4 lỗ in 3V3, SWDIO, SWCLK, GND. Dùng nạp chương trình cho vi xử lý."}, {"src": "img/parts/u-ic14.jpg", "n": "IC14", "t": "IC nhiều chân dán cạnh giắc bên thứ cấp. Chức năng cụ thể chưa kiểm chứng."}] },
      { h: "Đọc mã in trên linh kiện", kw: "ma in 2703 6803 20r0 r100 334k 104k 102k 14k561 t8al 100 cuon cach doc chu so 0",
        p: ["Quy tắc: chữ số cuối cho biết cần thêm bao nhiêu số 0 vào phía sau. Chữ R thay cho dấu phẩy thập phân.",
            "Điện trở: 2703 = 270 và 3 số 0 = 270 kΩ. 6803 = 680 kΩ. 20R0 = 20,0 Ω. R100 = 0,100 Ω.",
            "Tụ (đơn vị pF): 334K = 33 và 4 số 0 = 330 000 pF = 0,33 µF, chữ K là sai số 10%. 104K = 100 nF = 0,1 µF. 102K = 1 nF.",
            "Varistor 14K561: 14 là đường kính đĩa 14 mm, 561 = 56 và 1 số 0 = 560 V. Cầu chì T8AL 250V: T là đứt chậm, 8 A, 250 V. Cuộn dán in 100 = 10 µH.",
            "Đổi đơn vị: 1 µF = 1000 nF = 1 000 000 pF."] },
      { h: "Chẩn đoán theo triệu chứng", kw: "chan doan trieu chung mat dien bus 300v khong co 12v opto gia mat 15v may nen khong chay xa da tu x thu tu do",
        p: ["An toàn: phía sơ cấp có 220 V và khoảng 300 V DC. Rút phích, xả tụ lớn qua điện trở, đo lại bằng đồng hồ cho gần 0 V mới chạm. Khi buộc phải đo lúc có điện, dùng biến áp cách ly.",
            "Dưới đây là suy luận từ nguyên lý mạch để khoanh vùng, không phải kết luận sửa chữa.",
            "Mất điện hoàn toàn: nghi cầu chì đứt, varistor chập, cầu chỉnh lưu, IC nguồn. Có 220 V nhưng bus không lên 300 V: nghi NTC, cầu chỉnh lưu, tụ lọc lớn. Có 300 V nhưng không có 12 V, 5 V: nghi IC nguồn, biến áp, diode kép thứ cấp, tụ 1000 µF.",
            "12 V sụt khi tải nặng và biến áp rít: opto già, TL431, tụ thứ cấp khô. 12 V vọt cao hoặc nguồn chớp tắt: mất hồi tiếp (TL431, trở phân áp, opto hở).",
            "MCU còn sống nhưng máy nén không chạy: mất +15 V, driver, IGBT hoặc MCU inverter. Máy nén chạy rồi ngắt báo lỗi áp hoặc dòng: nhánh lấy mẫu 680 kΩ, trở shunt R100, IGBT rò. Không xả đá: relay, cuộn hút (700 đến 1000 Ω), thanh sấy. Giật khi chạm phích sau khi rút điện: IC20 hoặc hai trở xả hỏng.",
            "Thứ tự gợi ý: quan sát bằng mắt, bus 300 V, 12 V thứ cấp, +15 V, 3,3 và 5 V, ngõ ra IGBT. Đi từ trên xuống để biết khối nào chết."] },
      { h: "Chỗ chưa khớp hoặc chưa kiểm chứng", kw: "chua kiem chung cx1 cx2 opto vi tri relay thu hai tl431 diode kep 7815 ma in",
        p: ["Tài liệu và ảnh có vài chỗ lệch nhau. Tin ảnh bo thật trước, rồi đọc mã in để chốt.",
            "Tụ X: một mục ghi CX1 là 0,33 µF, mục khác ghi CX2 là 334K và CX1 là 104K. Bài này dùng CX2 = 334K, CX1 = 104K theo mục chi tiết và ảnh.",
            "Vị trí opto: tài liệu nói ba opto xếp dọc bên phải biến áp, nhưng opto hồi tiếp nằm ở mặt hàn. Relay thứ hai không có trong tài liệu.",
            "Cần đọc mã in để xác nhận: IC dạng TL431, diode kép thứ cấp, 7815, các trở và tụ quanh opto. Thứ tự chân 7815 thường là vào, mass, ra nhưng chưa kiểm chứng cho linh kiện này."] }
    ],
    quiz: [
      { q: "220 V AC sau cầu chỉnh lưu và tụ lọc cho khoảng bao nhiêu V DC?", o: ["Khoảng 12 V", "Khoảng 310 V", "Khoảng 220 V", "Khoảng 15 V"], a: 1, why: "Đỉnh hình sin là 220 × 1,414 ≈ 311 V, tụ lọc giữ gần mức đó." },
      { q: "IC xả tụ X làm gì?", o: ["Tạo điện áp 15 V", "Tự xả điện dư của tụ X khi rút phích để chống giật", "Điều khiển 6 IGBT", "Đo dòng máy nén"], a: 1, why: "Khi rút phích, mạch dò mất sóng AC nên đóng MOSFET để xả tụ X qua hai trở." },
      { q: "Mã 2703 trên điện trở là bao nhiêu?", o: ["2703 Ω", "270 kΩ", "27 kΩ", "2,7 kΩ"], a: 1, why: "270 và 3 số 0 = 270 000 Ω = 270 kΩ." },
      { q: "Tụ ghi 334K có điện dung bao nhiêu?", o: ["0,33 µF", "33 nF", "3,3 µF", "334 µF"], a: 0, why: "33 và 4 số 0 pF = 330 000 pF = 330 nF = 0,33 µF." },
      { q: "Vì sao opto truyền tín hiệu hồi tiếp bằng ánh sáng?", o: ["Cho rẻ hơn dây", "Để cách ly điện giữa thứ cấp và sơ cấp, không nối dây trực tiếp", "Để tăng điện áp", "Để lọc nhiễu AC"], a: 1, why: "Hai bên không có đường dẫn điện, nên an toàn khi sơ cấp có 300 V." },
      { q: "MCU còn sáng đèn nhưng máy nén không chạy. Đo gì trước?", o: ["Điện áp +15 V cấp cho driver IGBT", "Cầu chì quạt", "Tụ lọc 1000 µF thứ cấp", "Tụ X"], a: 0, why: "MCU dùng 5 V hoặc 3,3 V. Driver IGBT cần 15 V để kích mở." },
      { q: "Điện trở shunt 0,1 Ω (R100) dùng để làm gì?", o: ["Hạ 300 V xuống 15 V", "Đo dòng máy nén qua độ sụt áp, bảo vệ quá dòng", "Xả tụ X", "Nuôi MCU"], a: 1, why: "Dòng chạy qua trở nhỏ tạo sụt áp tỉ lệ để MCU đọc và bảo vệ." }
    ]
  },
  {
    "id": "b10",
    "n": 10,
    "title": "Cảm biến nhiệt NTC và mạch chia áp",
    "summary": "MCU chỉ đọc điện áp, nhưng cảm biến nhiệt NTC đổi điện trở. Cầu chia áp biến điện trở thành điện áp. Cách đo bằng VOM, lỗi hở và chập.",
    "labs": [
      "ntcdiv"
    ],
    "keywords": "ntc cam bien nhiet nhiet tro chia ap cau chia ap vo adc mcu dien tro co dinh ho chap vom do cam bien bang gia tri dien tro nhiet do ma loi cam bien nhiet do ngan lanh",
    "blocks": [
      {
        "h": "Vì sao cần chia áp",
        "kw": "vi sao chia ap ntc mcu chi doc dien ap nhiet do",
        "p": [
          "MCU chỉ đọc được điện áp (0 đến 5 V hoặc 0 đến 3,3 V), không đọc được điện trở. Cảm biến nhiệt NTC lại thay đổi điện trở theo nhiệt độ: nóng thì điện trở giảm, lạnh thì điện trở tăng.",
          "Muốn MCU biết nhiệt độ, người ta nối NTC nối tiếp với một điện trở cố định Rf rồi lấy điện áp tại điểm giữa. Công thức: Vo = Vcc × R_NTC ÷ (Rf + R_NTC).",
          "Lạnh hơn thì R_NTC lớn hơn nên chiếm nhiều điện áp hơn, Vo cao hơn. Nóng hơn thì ngược lại. MCU đọc Vo rồi tra ra nhiệt độ."
        ],
        "img": {
          "src": "img/b10-ntc-chia-ap.png",
          "alt": "Mạch chia áp gồm điện trở cố định 10 kΩ nối tiếp NTC, và đồ thị điện áp Vo theo nhiệt độ",
          "cap": "Mạch chia áp (trái) và đường Vo theo nhiệt độ (phải), ví dụ NTC 10 kΩ ở 25 °C"
        }
      },
      {
        "h": "Ví dụ tính cụ thể",
        "kw": "vi du tinh chia ap ntc 10k 25 do vo 2,5v",
        "p": [
          "Ví dụ minh họa: NTC 10 kΩ ở 25 °C, hệ số B = 3950, Rf = 10 kΩ, nguồn 5 V. Giá trị tính theo công thức Beta: R = R25 × e^(B × (1/T − 1/298,15)), T là nhiệt độ kelvin.",
          "Ở 25 °C: Vo = 5 × 10 ÷ 20 = 2,5 V. Ở 0 °C, R_NTC khoảng 33,6 kΩ nên Vo ≈ 3,85 V. Ở 40 °C, R_NTC khoảng 5,3 kΩ nên Vo ≈ 1,73 V.",
          "Hai điện trở nối tiếp chia điện áp theo tỉ lệ điện trở. Điện áp trên Rf cộng điện áp trên NTC luôn bằng Vcc."
        ]
      },
      {
        "h": "Bảng điện trở theo nhiệt độ của cảm biến thật",
        "kw": "bang dien tro nhiet do cam bien ntc 2k 6,5k 0 do nuoc da kiem tra",
        "p": [
          "Theo tài liệu bạn cung cấp (chưa kiểm chứng độc lập), một cảm biến nhiệt tủ lạnh có điện trở đo khi tháo rời khỏi bo như sau: khoảng 33,8 kΩ ở −30 °C, 18,9 kΩ ở −20 °C, 6,495 kΩ ở 0 °C, 5,315 kΩ ở 4 °C và 2,005 kΩ ở 25 °C.",
          "Cứ lên 1 °C thì điện trở giảm khoảng 4 đến 6%. Cảm biến khác loại sẽ có bảng khác, nên phải so với đúng bảng của loại đó.",
          "Kiểm tra nhanh tại chỗ: nhúng cảm biến vào nước đá đang tan thì đo được khoảng 6,5 kΩ. Để ngoài phòng 25 °C thì đo được khoảng 2 kΩ."
        ]
      },
      {
        "h": "Hai cách đo bằng VOM",
        "kw": "do vom dien tro dien ap rut cam bien tat nguon doi chieu bang",
        "p": [
          "Cách 1: đo điện trở. Tắt nguồn, rút cảm biến khỏi bo, đo hai đầu NTC rồi so với bảng điện trở theo nhiệt độ. Việc này kiểm tra bản thân cảm biến. Rf nằm trên bo nên không xuất hiện trong số đo.",
          "Cách 2: đo điện áp. Cảm biến vẫn cắm trên bo, bật nguồn, đo dây tín hiệu với mass để biết Vo thật mà MCU đọc. Đo +Vcc với dây tín hiệu thì được điện áp trên Rf. Hai số đo cộng lại bằng Vcc.",
          "Nếu cảm biến đo rời tốt mà Vo trên bo vẫn lệch, nghi Rf bị đổi giá trị, nguồn cấp sai, hoặc giắc và dây tiếp xúc kém."
        ]
      },
      {
        "h": "Hở, chập và đọc lệch",
        "kw": "ho chap ntc dut vo gan vcc gan 0 bao loi cam bien rf sai",
        "p": [
          "NTC hở (đứt): R rất lớn, Vo gần bằng Vcc. MCU hiểu là lạnh vô cực và báo lỗi cảm biến.",
          "NTC chập: R gần 0, Vo gần 0 V. MCU hiểu là nóng vô cực và cũng báo lỗi.",
          "Rf tăng giá trị: Vo giảm, MCU hiểu nhiệt độ cao hơn thực tế. Rf giảm thì ngược lại. Cảm biến vẫn tốt nhưng tủ đọc lệch nhiệt độ.",
          "Các ngưỡng báo hở và chập là do nhà sản xuất đặt trong phần mềm. Nội dung ở đây chỉ nêu nguyên lý."
        ]
      }
    ],
    "quiz": [
    {
      "q": "Vì sao phải dùng mạch chia áp với NTC?",
      "o": [
        "Để NTC nóng lên",
        "Để tăng dòng điện",
        "MCU chỉ đọc được điện áp, không đọc được điện trở",
        "Để đổi điện xoay chiều thành một chiều"
      ],
      "a": 2,
      "why": "Chia áp đổi sự thay đổi điện trở của NTC thành điện áp để MCU đọc."
    },
    {
      "q": "NTC 10 kΩ nối tiếp Rf = 10 kΩ, nguồn 5 V, NTC đang 10 kΩ. Vo là bao nhiêu?",
      "o": [
        "2,5 V",
        "5 V",
        "0 V",
        "10 V"
      ],
      "a": 0,
      "why": "Vo = 5 × 10 ÷ (10 + 10) = 2,5 V."
    },
    {
      "q": "Nhiệt độ giảm (lạnh hơn) thì Vo lấy ở NTC (NTC xuống mass) thay đổi thế nào?",
      "o": [
        "Giảm",
        "Tăng",
        "Không đổi",
        "Về 0 V"
      ],
      "a": 1,
      "why": "Lạnh thì R_NTC tăng, chiếm nhiều điện áp hơn nên Vo tăng."
    },
    {
      "q": "Dây NTC bị đứt. MCU đọc gần bao nhiêu và hiểu thế nào?",
      "o": [
        "Gần 0 V, hiểu là nóng vô cực",
        "Đúng 2,5 V",
        "Không đọc được gì và vẫn chạy bình thường",
        "Gần Vcc, hiểu là lạnh vô cực và báo lỗi"
      ],
      "a": 3,
      "why": "NTC hở thì R rất lớn, Vo gần bằng Vcc."
    },
    {
      "q": "Thay Rf 10 kΩ bằng 22 kΩ, NTC vẫn 10 kΩ, nguồn 5 V. Vo ở 25 °C đổi thế nào?",
      "o": [
        "Tăng lên khoảng 3,4 V",
        "Giảm còn khoảng 1,56 V",
        "Vẫn 2,5 V",
        "Bằng 5 V"
      ],
      "a": 1,
      "why": "Vo = 5 × 10 ÷ 32 ≈ 1,56 V. Rf lớn chiếm nhiều điện áp hơn, phần còn lại cho NTC ít đi, MCU hiểu nhiệt độ cao hơn thực tế."
    },
    {
      "q": "Đo điện áp trên Rf là 3,4 V, nguồn 5 V. Điện áp tại dây cảm biến so với mass (Vo) khoảng bao nhiêu?",
      "o": [
        "3,4 V",
        "5 V",
        "1,6 V",
        "8,4 V"
      ],
      "a": 2,
      "why": "Hai điện áp cộng lại bằng nguồn: 5 − 3,4 = 1,6 V."
    },
    {
      "q": "Muốn kiểm tra riêng cảm biến NTC, nên làm thế nào?",
      "o": [
        "Đo điện áp khi cắm trên bo mà không biết nguồn",
        "Đo điện trở khi cảm biến còn cắm trên bo đang bật nguồn",
        "Thay thử bằng một điện trở bất kỳ",
        "Tắt nguồn, rút cảm biến khỏi bo rồi đo điện trở, so với bảng theo nhiệt độ"
      ],
      "a": 3,
      "why": "Rút khỏi bo để loại mạch song song, tắt nguồn khi đo điện trở."
    }
  ]
  },
  {
    "id": "b11",
    "n": 11,
    "title": "Tiền tố đơn vị: k, M, m, µ",
    "summary": "Đọc và đổi nhanh kΩ, MΩ, mA, µF, nF. Nền cần có cho mọi bài sau.",
    "labs": [
      "tiento"
    ],
    "keywords": "tien to don vi k m mega kilo mili micro nano pico dien tro ohm ampe ma uf nf pf doi don vi v chia kohm bang ma",
    "blocks": [
      {
        "h": "Vì sao cần tiền tố",
        "kw": "vi sao tien to don vi viet gon so lon nho",
        "p": [
          "Trong điện tử, giá trị rất lớn hoặc rất nhỏ. Điện trở có thể là 2 200 000 Ω, tụ có thể là 0,000 000 1 F. Viết như vậy khó đọc, dễ sai. Người ta dùng tiền tố đứng trước đơn vị để viết gọn: 2,2 MΩ, 0,1 µF.",
          "Bốn tiền tố gặp nhiều nhất: M (mêga, triệu), k (ki-lô, nghìn), m (mi-li, một phần nghìn), µ (mi-crô, một phần triệu). Thêm n (na-nô) và p (pi-cô) dùng nhiều cho tụ."
        ]
      },
      {
        "h": "Bảng quy đổi",
        "kw": "bang quy doi tien to m k m micro nano pico",
        "p": [
          "Nhìn bảng, đi xuống một bậc thì giá trị số nhân thêm 1000 và đơn vị đổi sang tiền tố nhỏ hơn.",
          "Ví dụ: 4,7 kΩ = 4700 Ω. 250 mA = 0,25 A. 470 nF = 0,47 µF. 100 nF = 0,1 µF. 330 pF = 0,33 nF."
        ],
        "img": {
          "src": "img/b11-tien-to.png",
          "alt": "Bảng tiền tố đơn vị: M, k, không có, m, µ, n, p với giá trị nhân và ví dụ",
          "cap": "Bảng tiền tố đơn vị"
        }
      },
      {
        "h": "Mẹo đổi nhanh",
        "kw": "meo doi nhanh v chia kohm ra ma v chia mohm ra ua doi dau phay ba chu so",
        "p": [
          "Đổi sang tiền tố nhỏ hơn một bậc thì dời dấu phẩy sang phải ba chữ số. Đổi sang tiền tố lớn hơn một bậc thì dời sang trái ba chữ số.",
          "Mẹo tính dòng: điện áp (V) chia điện trở (kΩ) cho ra dòng điện (mA). Ví dụ 12 V ÷ 2,2 kΩ = 5,45 mA. Còn V ÷ MΩ cho ra µA.",
          "Khi tính, giữ 2 đến 3 chữ số có nghĩa, đừng làm tròn sớm. 5,45 mA khác nhiều so với 5 mA."
        ]
      },
      {
        "h": "Hay nhầm",
        "kw": "hay nham M hoa m thuong mf uf mã in 104 334k",
        "p": [
          "Chữ M hoa là mêga (triệu), chữ m thường là mi-li (một phần nghìn). Hai chữ khác nhau 10⁹ lần: 1 MΩ khác hoàn toàn 1 mΩ.",
          "Trên tụ: µF lớn hơn nF 1000 lần, nF lớn hơn pF 1000 lần. Mã in 104 là 100 000 pF = 100 nF = 0,1 µF (xem Bài 9).",
          "Khi đọc thông số trên linh kiện hay bảng tài liệu, đổi hết về cùng một đơn vị trước khi tính."
        ]
      }
    ],
    "quiz": [
      {
        "q": "Đổi 4,7 kΩ ra ôm.",
        "o": [
          "470 Ω",
          "4700 Ω",
          "47 000 Ω",
          "4,7 Ω"
        ],
        "a": 1,
        "why": "k là nghìn, 4,7 × 1000 = 4700 Ω."
      },
      {
        "q": "Đổi 250 mA ra ampe.",
        "o": [
          "250 A",
          "2,5 A",
          "0,25 A",
          "0,025 A"
        ],
        "a": 2,
        "why": "m là một phần nghìn: 250 ÷ 1000 = 0,25 A."
      },
      {
        "q": "Tụ ghi 470 nF bằng bao nhiêu µF?",
        "o": [
          "0,47 µF",
          "47 µF",
          "4,7 µF",
          "470 µF"
        ],
        "a": 0,
        "why": "1000 nF = 1 µF, nên 470 nF = 0,47 µF."
      },
      {
        "q": "Điện áp 12 V đặt vào điện trở 2,2 kΩ. Dòng khoảng bao nhiêu?",
        "o": [
          "5,45 A",
          "5,45 mA",
          "545 mA",
          "0,545 mA"
        ],
        "a": 1,
        "why": "12 V ÷ 2,2 kΩ = 5,45 mA. V ÷ kΩ ra mA."
      },
      {
        "q": "Chữ M hoa và chữ m thường khác nhau thế nào?",
        "o": [
          "M là mêga (triệu), m là mi-li (một phần nghìn)",
          "Giống nhau",
          "m lớn hơn M",
          "M là mi-li"
        ],
        "a": 0,
        "why": "Hai chữ khác nhau 10⁹ lần, đọc kỹ chữ hoa hay thường."
      },
      {
        "q": "Tụ in mã 104 có điện dung bao nhiêu?",
        "o": [
          "0,1 µF",
          "10 µF",
          "100 µF",
          "1 µF"
        ],
        "a": 0,
        "why": "104 = 10 × 10⁴ pF = 100 000 pF = 100 nF = 0,1 µF."
      }
    ]
  },
  {
    "id": "b12",
    "n": 12,
    "title": "Dùng VOM và ampe kìm đo điện áp, dòng",
    "summary": "Mắc đồng hồ song song hay nối tiếp, chọn thang AC hay DC, hai lỗi làm cháy cầu chì đồng hồ, và vì sao ampe kìm tiện khi đo dòng lớn.",
    "labs": [
      "vom",
      "ampekim"
    ],
    "keywords": "vom dong ho van nang do dien ap do dong dien song song noi tiep thang ac dc cong ma 10a cau chi ampe kim kep day hall dong khoi dong may nen",
    "blocks": [
      {
        "h": "Mắc đúng chỗ",
        "kw": "mac song song noi tiep do dien ap do dong dien do dien tro tat nguon",
        "p": [
          "Web đã dạy đo điện trở (Bài 1) và đo diode (Bài 4). Bài này thêm đo điện áp và đo dòng.",
          "Đo điện áp: mắc SONG SONG với phần cần đo, đặt hai que lên hai đầu, không cần cắt mạch.",
          "Đo dòng điện: mắc NỐI TIẾP, phải mở mạch để dòng chạy qua đồng hồ.",
          "Đo điện trở: song song, và phải tắt nguồn."
        ],
        "img": {
          "src": "img/b12-vom-mach.png",
          "alt": "Mạch 12 V, R1 20 ohm nối tiếp R2 30 ohm với ba điểm D, A, C",
          "cap": "Mạch ví dụ: nguồn 12 V, R1 = 20 Ω, R2 = 30 Ω. Dòng 240 mA, điện áp R2 = 7,2 V, R1 = 4,8 V"
        }
      },
      {
        "h": "Chọn đúng thang",
        "kw": "thang dc ac chon thang cao nhat tu chon thang",
        "p": [
          "Thang V có đường kẻ thẳng là DC: pin, 12 V, 5 V, 3,3 V, điện áp bus sau cầu chỉnh lưu. Thang V có dấu lượn sóng là AC: ổ cắm 220 V, cuộn sơ cấp biến áp.",
          "Chọn thang cao hơn giá trị cần đo một bậc. Không biết trước thì chọn thang cao nhất rồi giảm dần. Đồng hồ tự chọn thang thì không cần."
        ]
      },
      {
        "h": "Hai lỗi làm hỏng đồng hồ",
        "kw": "loi hong dong ho cau chi que do cong dong cong ma 10a thang dien tro",
        "p": [
          "Que đỏ ở cổng đo dòng (mA hoặc 10 A) rồi đem đo điện áp: đồng hồ coi như một đoạn dây, tạo chập và thổi cầu chì bên trong. Đo dòng xong phải cắm que đỏ về cổng đo điện áp.",
          "Cổng mA thường có giới hạn (ví dụ 200 mA hoặc 500 mA, xem nhãn trên máy). Dòng lớn hơn giới hạn thì thổi cầu chì. Không chắc dòng bao nhiêu thì dùng cổng 10 A.",
          "Núm ở thang điện trở rồi đo vào điểm đang có điện: có thể hỏng đồng hồ hoặc mạch."
        ]
      },
      {
        "h": "Ampe kìm: vì sao hay dùng",
        "kw": "ampe kim kep day khong cat mach dong lon an toan hall bien dong kep ca hai day quan nhieu vong",
        "p": [
          "Ampe kìm đo từ trường quanh dây mang dòng. Ưu điểm: không phải cắt mạch, an toàn hơn trên điện 220 V, đo được dòng lớn (máy nén, quạt, sấy) và không thêm điện trở vào mạch. VOM nối tiếp thường giới hạn 10 A.",
          "Lưu ý 1: kẹp MỘT dây. Kẹp cả L và N cùng lúc thì dòng triệt tiêu, đồng hồ đọc gần 0.",
          "Lưu ý 2: loại chỉ đo AC không đo được dòng DC. Dòng DC cần loại đo AC/DC.",
          "Lưu ý 3: dòng rất nhỏ thì ampe kìm kém chính xác. Quấn dây 5 hoặc 10 vòng qua hàm kìm, số đo chia cho số vòng. Hoặc dùng VOM nối tiếp ở cổng mA.",
          "Dòng khởi động máy nén vọt rất nhanh rồi hạ, cần chế độ giữ đỉnh (nếu có) để bắt được."
        ]
      },
      {
        "h": "Ví dụ số liệu trên mạch mẫu",
        "kw": "vi du so lieu mach mau 12v 20 30 ohm 240ma 7,2v 4,8v",
        "p": [
          "Nguồn 12 V, R1 = 20 Ω nối tiếp R2 = 30 Ω. R tổng 50 Ω, dòng I = 12 ÷ 50 = 0,24 A = 240 mA.",
          "Điện áp R2 = 0,24 × 30 = 7,2 V. Điện áp R1 = 0,24 × 20 = 4,8 V. Hai số cộng lại bằng 12 V.",
          "Dòng 240 mA có thể vượt giới hạn cổng mA 200 mA, nên cổng 10 A an toàn hơn trong trường hợp này."
        ]
      }
    ],
    "quiz": [
      {
        "q": "Muốn đo điện áp trên một điện trở, mắc đồng hồ thế nào?",
        "o": [
          "Song song với điện trở",
          "Nối tiếp với điện trở",
          "Chập hai đầu điện trở",
          "Chỉ đo khi tháo điện trở ra"
        ],
        "a": 0,
        "why": "Điện áp đo bằng cách đặt hai que lên hai đầu, song song, không cần cắt mạch."
      },
      {
        "q": "Muốn đo dòng trong mạch bằng VOM, mắc thế nào?",
        "o": [
          "Nối tiếp, phải mở mạch",
          "Song song với nguồn",
          "Đặt lên hai đầu tải",
          "Không cần mở mạch"
        ],
        "a": 0,
        "why": "Dòng phải chạy qua đồng hồ nên đồng hồ mắc nối tiếp."
      },
      {
        "q": "Mạch 12 V, R1 20 Ω nối tiếp R2 30 Ω. Dòng và điện áp trên R2 là bao nhiêu?",
        "o": [
          "600 mA và 12 V",
          "120 mA và 3,6 V",
          "240 mA và 7,2 V",
          "240 mA và 4,8 V"
        ],
        "a": 2,
        "why": "I = 12 ÷ 50 = 0,24 A. Vr2 = 0,24 × 30 = 7,2 V."
      },
      {
        "q": "Đo dòng xong, quên đưa que đỏ về cổng V rồi đặt lên hai đầu nguồn. Chuyện gì xảy ra?",
        "o": [
          "Cầu chì đồng hồ có thể đứt do chập",
          "Đồng hồ đọc đúng điện áp",
          "Không có gì",
          "Nguồn tự tăng điện áp"
        ],
        "a": 0,
        "why": "Cổng đo dòng có điện trở rất nhỏ nên coi như dây dẫn nối thẳng hai đầu nguồn."
      },
      {
        "q": "Kẹp ampe kìm quanh cả hai dây L và N của dây nguồn. Đồng hồ đọc gì?",
        "o": [
          "Gấp đôi dòng",
          "Gần 0",
          "Đúng dòng tải",
          "Điện áp 220 V"
        ],
        "a": 1,
        "why": "Dòng đi và về ngược chiều, từ trường triệt tiêu."
      },
      {
        "q": "Đo dòng DC của quạt 12 V bằng ampe kìm chỉ đo AC. Kết quả?",
        "o": [
          "Không đọc được",
          "Đọc đúng",
          "Đọc gấp đôi",
          "Cháy đồng hồ"
        ],
        "a": 0,
        "why": "Loại chỉ đo AC dựa trên biến dòng nên không đo được DC."
      },
      {
        "q": "Muốn đo dòng nhỏ (vài chục mA) bằng ampe kìm, làm thế nào?",
        "o": [
          "Quấn dây nhiều vòng qua hàm kìm, số đo chia cho số vòng",
          "Kẹp cả hai dây",
          "Đổi sang thang điện trở",
          "Không thể đo bằng ampe kìm"
        ],
        "a": 0,
        "why": "Quấn N vòng thì đồng hồ thấy N lần dòng thật nên chia lại cho N."
      }
    ]
  },
  {
    "id": "b13",
    "n": 13,
    "title": "Điện xoay chiều: tần số, hiệu dụng và đỉnh",
    "summary": "Sóng sin 220 V, chu kỳ và tần số, trị hiệu dụng và trị đỉnh 311 V. Vì sao linh kiện phải chịu trị đỉnh.",
    "labs": [
      "acsin"
    ],
    "keywords": "dien xoay chieu ac dc song sin tan so chu ky 50hz hieu dung rms dinh 311v 310v 1,414 220v tu chiu ap vom thang ac",
    "blocks": [
      {
        "h": "Một chiều và xoay chiều",
        "kw": "mot chieu xoay chieu dc ac pin o cam song sin",
        "p": [
          "Pin cho điện một chiều (DC): điện áp đứng yên ở một mức. Ổ cắm nhà cho điện xoay chiều (AC): điện áp đổi chiều liên tục theo hình sóng sin.",
          "Điện xoay chiều có ưu điểm là dùng biến áp để đổi điện áp dễ dàng (Bài 7)."
        ],
        "img": {
          "src": "img/b13-song-sin.png",
          "alt": "Sóng sin 220 V 50 Hz, đỉnh 311 V, hiệu dụng 220 V, chu kỳ 20 ms",
          "cap": "Sóng điện 220 V, 50 Hz"
        }
      },
      {
        "h": "Tần số và chu kỳ",
        "kw": "tan so chu ky 50hz 60hz 20ms",
        "p": [
          "Tần số là số chu kỳ trong một giây, đơn vị héc (Hz). Lưới 50 Hz là 50 chu kỳ mỗi giây.",
          "Chu kỳ là thời gian một lần lặp lại: T = 1 ÷ f. Với 50 Hz, T = 1 ÷ 50 = 0,02 s = 20 ms. Với 60 Hz, T khoảng 16,7 ms."
        ]
      },
      {
        "h": "Trị hiệu dụng và trị đỉnh",
        "kw": "tri hieu dung rms tri dinh 311v 1,414 220 230 250",
        "p": [
          "Trị đỉnh là mức cao nhất sóng đạt tới. Trị hiệu dụng (RMS) là mức điện áp một chiều tạo ra cùng độ nóng trên điện trở. Con số ghi trên nhãn (220 V) là trị hiệu dụng.",
          "Quan hệ: trị đỉnh = trị hiệu dụng × 1,414. Vậy 220 V có đỉnh khoảng 311 V. 230 V có đỉnh khoảng 325 V.",
          "Đây cũng là lý do bus sau cầu chỉnh lưu và tụ lọc có khoảng 310 V DC (Bài 4, Bài 7)."
        ]
      },
      {
        "h": "Vì sao quan trọng khi sửa chữa",
        "kw": "vi sao quan trong sua chua vom thang ac doc hieu dung tu chiu ap dinh nguy hiem",
        "p": [
          "VOM thang AC đọc trị hiệu dụng, nên đo ổ cắm ra 220 V. Đo điện áp một chiều trên tụ lọc bằng thang DC sẽ ra khoảng 310 V.",
          "Linh kiện phải chịu trị đỉnh, không phải trị hiệu dụng. Tụ chỉ ghi chịu 250 V DC không dùng được trên lưới 220 V vì đỉnh 311 V vượt xa.",
          "Điện lưới có thể dao động khoảng ±10%, nên chọn linh kiện chịu điện áp có dư an toàn."
        ]
      }
    ],
    "quiz": [
      {
        "q": "Nguồn 50 Hz thì một chu kỳ dài bao lâu?",
        "o": [
          "20 ms",
          "50 ms",
          "2 ms",
          "200 ms"
        ],
        "a": 0,
        "why": "T = 1 ÷ 50 = 0,02 s = 20 ms."
      },
      {
        "q": "Nguồn 60 Hz thì chu kỳ khoảng bao nhiêu?",
        "o": [
          "16,7 ms",
          "20 ms",
          "60 ms",
          "6 ms"
        ],
        "a": 0,
        "why": "T = 1 ÷ 60 ≈ 0,0167 s = 16,7 ms."
      },
      {
        "q": "Điện áp hiệu dụng 230 V. Trị đỉnh khoảng bao nhiêu?",
        "o": [
          "230 V",
          "163 V",
          "325 V",
          "460 V"
        ],
        "a": 2,
        "why": "230 × 1,414 ≈ 325 V."
      },
      {
        "q": "Tụ chỉ ghi chịu 250 V DC. Có nên dùng trực tiếp trên lưới 220 V AC?",
        "o": [
          "Có, vì 220 V nhỏ hơn 250 V",
          "Không, vì đỉnh 311 V vượt 250 V",
          "Có, nếu lắp ngược cực",
          "Tùy màu tụ"
        ],
        "a": 1,
        "why": "Linh kiện phải chịu trị đỉnh 311 V, vượt mức ghi trên tụ."
      },
      {
        "q": "VOM thang AC đo ổ cắm 220 V đọc giá trị nào?",
        "o": [
          "Trị hiệu dụng 220 V",
          "Trị đỉnh 311 V",
          "0 V",
          "Điện áp đỉnh đến đỉnh 622 V"
        ],
        "a": 0,
        "why": "Thang AC đọc trị hiệu dụng, ghi trên nhãn."
      },
      {
        "q": "Đo bằng thang DC trên tụ lọc bus sau cầu chỉnh lưu (lưới 220 V). Khoảng bao nhiêu?",
        "o": [
          "Khoảng 310 V",
          "220 V",
          "Khoảng 156 V",
          "0 V"
        ],
        "a": 0,
        "why": "Tụ nạp tới gần trị đỉnh 311 V trừ gợn sóng."
      }
    ]
  }


];

/* Thuật ngữ: mỗi mục gắn với một bài (lesson). Chỉ viết định nghĩa cơ bản, trung tính. */
window.GLOSSARY = [
  { t: "Điện áp", k: "dien ap v von", d: "Đại lượng đẩy dòng điện chạy trong mạch, đơn vị vôn (V). Giống độ cao cột nước.", l: "b1" },
  { t: "Dòng điện", k: "dong dien i ampe", d: "Lượng điện tích chạy qua mỗi giây, đơn vị ampe (A).", l: "b1" },
  { t: "Điện trở", k: "dien tro r ohm", d: "Linh kiện cản dòng điện, đơn vị ôm (Ω). Điện trở càng lớn thì dòng càng nhỏ.", l: "b1" },
  { t: "Định luật Ohm", k: "dinh luat ohm", d: "I = V ÷ R. Dòng điện tỉ lệ thuận với điện áp và tỉ lệ nghịch với điện trở.", l: "b1" },
  { t: "Công suất", k: "cong suat p oat w", d: "P = V × I, đơn vị oát (W). Là mức năng lượng dùng mỗi giây.", l: "b1" },
  { t: "Mã màu điện trở", k: "ma mau vach mau", d: "Các vạch màu trên thân điện trở cho biết giá trị: hai chữ số đầu, số chữ số 0 thêm vào và sai số.", l: "b1" },
  { t: "Đồng hồ vạn năng (VOM)", k: "dong ho van nang vom multimeter", d: "Dụng cụ đo điện áp, dòng điện, điện trở và thử diode.", l: "b1" },
  { t: "Mắc nối tiếp", k: "noi tiep", d: "Các linh kiện nối thành một đường. Dòng như nhau, R tổng = R1 + R2.", l: "b2" },
  { t: "Mắc song song", k: "song song", d: "Các nhánh cùng nối vào hai điểm của nguồn. Điện áp bằng nhau, dòng tổng bằng tổng dòng các nhánh.", l: "b2" },
  { t: "Hở mạch", k: "ho mach dut", d: "Mạch bị đứt nên không có dòng điện chạy qua.", l: "b2" },
  { t: "Tụ điện", k: "tu dien tu", d: "Linh kiện giữ điện tích. Tụ lớn vẫn giữ điện sau khi ngắt nguồn.", l: "b3" },
  { t: "Điện dung", k: "dien dung c farad", d: "Khả năng chứa điện tích của tụ, ký hiệu C, đơn vị fara (F), thường dùng µF.", l: "b3" },
  { t: "Hằng số thời gian τ", k: "hang so thoi gian tau", d: "τ = R × C. Sau 1τ tụ nạp được khoảng 63% (hoặc xả còn 37%), sau 5τ coi như xong.", l: "b3" },
  { t: "Tụ đôi (dual run)", k: "tu doi dual run herm fan", d: "Tụ có ba chân C, HERM, FAN: hai tụ chung đầu C, một phần cho máy nén, một phần cho quạt.", l: "b3" },
  { t: "Diode", k: "diode", d: "Linh kiện cho dòng đi một chiều, từ A (anode) sang K (cathode).", l: "b4" },
  { t: "Cầu chỉnh lưu", k: "cau chinh luu", d: "Bốn diode đổi điện xoay chiều thành một chiều nhấp nhô. Mất khoảng 1,4 V.", l: "b4" },
  { t: "Tụ lọc", k: "tu loc", d: "Tụ làm phẳng điện áp sau cầu chỉnh lưu.", l: "b4" },
  { t: "Gợn sóng", k: "gon song", d: "Phần điện áp còn nhấp nhô sau khi lọc. Tụ càng lớn thì gợn sóng càng nhỏ.", l: "b4" },
  { t: "Môi chất lạnh (gas)", k: "moi chat gas lanh", d: "Chất chạy vòng kín trong hệ thống lạnh để mang nhiệt từ trong ra ngoài.", l: "b5" },
  { t: "Máy nén", k: "may nen compressor", d: "Hút hơi môi chất áp thấp và nén thành hơi nóng áp cao.", l: "b5" },
  { t: "Dàn nóng (ngưng tụ)", k: "dan nong ngung tu", d: "Nơi môi chất nhả nhiệt ra ngoài và hóa lỏng.", l: "b5" },
  { t: "Van tiết lưu / ống mao", k: "van tiet luu ong mao", d: "Làm giảm áp của môi chất lỏng, khiến nó lạnh đi trước khi vào dàn lạnh.", l: "b5" },
  { t: "Dàn lạnh (bay hơi)", k: "dan lanh bay hoi", d: "Nơi môi chất hút nhiệt của không gian cần làm lạnh và bay hơi.", l: "b5" },
  { t: "Áp cao / áp thấp", k: "ap cao ap thap", d: "Hai phía áp suất của hệ thống lạnh: áp cao từ máy nén tới van tiết lưu, áp thấp từ van tiết lưu về máy nén.", l: "b5" },
  { t: "Transistor", k: "transistor npn", d: "Linh kiện dùng như công tắc hoặc bộ khuếch đại: dòng nhỏ ở chân B điều khiển dòng lớn giữa C và E.", l: "b6" },
  { t: "Relay (rơ-le)", k: "relay role", d: "Công tắc điều khiển bằng cuộn dây: cuộn có dòng thì tiếp điểm đóng. Cách ly mạch điều khiển với mạch tải.", l: "b6" },
  { t: "Diode dập xung", k: "diode dap xung flyback", d: "Diode mắc song song cuộn relay để hấp thụ xung điện áp lúc ngắt, bảo vệ transistor.", l: "b6" },
  { t: "Rail 12 V", k: "rail 12v nguon 12v", d: "Đường điện một chiều 12 V trên board, cấp cho cuộn relay. Được tạo từ điện nhà qua hạ áp, cầu chỉnh lưu và tụ lọc.", l: "b6" },
  { t: "COM, NO (tiếp điểm relay)", k: "com no tiep diem relay", d: "COM là chân chung. NO (Normally Open) là chân bình thường hở, chỉ đóng với COM khi cuộn relay hút.", l: "b6" },
  { t: "Biến áp", k: "bien ap transformer", d: "Hai cuộn dây quấn chung một lõi, truyền điện bằng từ trường, không nối điện với nhau.", l: "b7" },
  { t: "Sơ cấp / thứ cấp", k: "so cap thu cap", d: "Sơ cấp là cuộn nhận điện vào (phía điện nhà). Thứ cấp là cuộn cho điện ra (phía điện thấp).", l: "b7" },
  { t: "Tỉ số vòng dây", k: "ti so vong day np ns", d: "Vp ÷ Vs = Np ÷ Ns. Điện áp tỉ lệ với số vòng, dòng điện tỉ lệ nghịch.", l: "b7" },
  { t: "Nguồn xung (SMPS)", k: "nguon xung smps", d: "Nguồn chỉnh lưu điện nhà thành DC cao rồi đóng ngắt hàng chục nghìn lần mỗi giây qua biến áp nhỏ gọn để tạo điện áp thấp.", l: "b7" },
  { t: "Tụ lọc lớn (khoảng 310 V)", k: "tu loc lon 310v 300v bulk", d: "Tụ sau cầu chỉnh lưu phía sơ cấp, giữ khoảng 310 V DC và vẫn còn điện sau khi rút phích.", l: "b7" },
  { t: "Opto (bộ ghép quang)", k: "opto optocoupler pc817", d: "Linh kiện có LED và phototransistor trong một vỏ, truyền tín hiệu bằng ánh sáng mà vẫn cách ly điện.", l: "b7" },
  { t: "TL431", k: "tl431 shunt regulator", d: "IC 3 chân so điện áp mẫu với mốc chuẩn khoảng 2,5 V, điều khiển dòng qua LED opto trong vòng hồi tiếp.", l: "b7" },
  { t: "IGBT", k: "igbt", d: "Linh kiện công suất đóng ngắt dòng lớn. Bo inverter dùng 6 IGBT để tạo điện ba pha U-V-W chạy động cơ máy nén.", l: "b8" },
  { t: "Varistor (bảo vệ quá áp)", k: "varistor zr1 qua ap", d: "Linh kiện hấp thụ xung điện áp cao ở đầu vào, bảo vệ board.", l: "b8" },
  { t: "Diode kép Schottky", k: "diode kep schottky d4 chung cathode", d: "Hai diode Schottky chung cathode trong một vỏ TO-220, chỉnh lưu xung thứ cấp, sụt áp thấp, chịu dòng lớn.", l: "b8" },
  { t: "IC 7815", k: "7815 on ap 15v", d: "IC ổn áp 3 chân (IN, GND, OUT) cho ra +15 V, nuôi các IC driver kích IGBT. Áp vào phải cao hơn ngõ ra ít nhất khoảng 2 V.", l: "b8" },
  { t: "Hiccup (nguồn chớp tắt)", k: "hiccup chop tat bao ve", d: "Nguồn xung khởi động rồi bảo vệ ngắt liên tục, tạo hiện tượng chớp tắt.", l: "b8" },
  { t: "CTR của opto", k: "ctr he so truyen dong opto gia", d: "Hệ số truyền dòng của opto. Opto già thì CTR giảm, hồi tiếp yếu đi.", l: "b8" },
  { t: "PWM / độ rộng xung (duty cycle)", k: "pwm duty cycle do rong xung", d: "Tỉ lệ thời gian IC nguồn bật trong mỗi chu kỳ đóng cắt. Xung rộng bơm nhiều năng lượng, xung hẹp bơm ít.", l: "b8" },
  { t: "Tụ X", k: "tu x loc nhieu", d: "Tụ hộp mắc giữa hai dây L và N, dập nhiễu giữa hai dây. Mã 334K là 0,33 µF.", l: "b9" },
  { t: "Tụ Y", k: "tu y gom xanh", d: "Tụ gốm nối từ dây nguồn hoặc mass sơ cấp sang mass an toàn hoặc thứ cấp, thoát nhiễu cao tần.", l: "b9" },
  { t: "NTC (nhiệt trở hạn dòng nạp)", k: "ntc nhiet tro han dong nap", d: "Điện trở nhiệt: lạnh thì trở lớn cản dòng nạp tụ lúc cắm điện, nóng lên thì trở nhỏ gần 0 Ω.", l: "b9" },
  { t: "Trở shunt (đo dòng)", k: "tro shunt do dong r100", d: "Điện trở rất nhỏ (ví dụ 0,1 Ω) nối trên đường dòng, độ sụt áp tỉ lệ với dòng chạy qua.", l: "b9" },
  { t: "Snubber (tụ dập xung)", k: "snubber tu dap xung", d: "Tụ hấp thụ gai điện áp sinh ra khi đóng ngắt dòng lớn ở IGBT.", l: "b9" },
  { t: "Mã in tụ và trở (cách đọc)", k: "ma in 334k 104k 2703 chu so cuoi so 0", d: "Chữ số cuối cho biết thêm bao nhiêu số 0 vào sau. Chữ R thay dấu phẩy. Tụ tính theo pF.", l: "b9" },
  { t: "Cảm biến nhiệt NTC", k: "cam bien nhiet ntc nhiet tro", d: "NTC dùng làm cảm biến: nóng thì điện trở giảm, lạnh thì tăng, mỗi °C đổi khoảng vài phần trăm.", l: "b10" },
  { t: "Cầu chia áp", k: "cau chia ap", d: "Hai điện trở nối tiếp, lấy điện áp ở điểm giữa. Vo = Vcc × R2 ÷ (R1 + R2).", l: "b10" },
  { t: "ADC (bộ đổi tương tự sang số)", k: "adc analog digital", d: "Phần của MCU đổi điện áp thành con số. ADC 10 bit cho số từ 0 đến 1023.", l: "b10" },
  { t: "Tiền tố đơn vị", k: "tien to don vi k m mega kilo mili micro", d: "Chữ đứng trước đơn vị để viết gọn: M triệu, k nghìn, m một phần nghìn, µ một phần triệu, n một phần tỉ.", l: "b11" },
  { t: "Trị hiệu dụng (RMS)", k: "tri hieu dung rms", d: "Mức điện áp một chiều cho cùng độ nóng trên điện trở. Số ghi trên nhãn, ví dụ 220 V.", l: "b13" },
  { t: "Trị đỉnh", k: "tri dinh dinh song", d: "Mức cao nhất của sóng. Bằng trị hiệu dụng × 1,414. Linh kiện phải chịu trị này.", l: "b13" },
  { t: "Tần số (Hz)", k: "tan so hz hert", d: "Số chu kỳ mỗi giây. Lưới điện nhà thường 50 Hz.", l: "b13" },
  { t: "Chu kỳ", k: "chu ky", d: "Thời gian một lần lặp lại, T = 1 ÷ f. Ở 50 Hz là 20 ms.", l: "b13" },
  { t: "Ampe kìm", k: "ampe kim kep day", d: "Đồng hồ đo dòng bằng cách kẹp quanh một dây, không cần cắt mạch. Loại chỉ đo AC không đo được DC.", l: "b12" },
  { t: "Thang AC, thang DC", k: "thang ac dc vom", d: "Thang AC (dấu lượn sóng) đo điện xoay chiều như ổ cắm. Thang DC (đường kẻ thẳng) đo pin, 12 V, 5 V, bus sau cầu chỉnh lưu.", l: "b12" }
];
