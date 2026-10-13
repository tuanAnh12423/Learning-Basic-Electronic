/* Giáo trình: Điện tử và điện lạnh cơ bản.
   Nguồn nội dung: 6 bài đã học trong project "Tự Học Điện Tử, Điện Lạnh Cơ Bản" + mô phỏng "Thực hành điện tử".
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
    labs: ["rl"],
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
      { h: "Diode dập xung", kw: "diode dap xung flyback xung dien ap ngat cuon bao ve transistor",
        p: ["Diode mắc song song với cuộn relay, ngược chiều với nguồn. Khi tắt dòng, cuộn sinh ra xung điện áp cao, diode hấp thụ xung này để bảo vệ transistor.",
            "Mất diode thì xung ở chân C lúc ngắt rất cao và có thể làm hỏng transistor."] }
    ],
    quiz: [
      { q: "Cuộn relay 12 V, điện trở cuộn 400 Ω. Dòng qua cuộn là?", o: ["3 mA", "30 mA", "300 mA", "4,8 A"], a: 1, why: "I = 12 ÷ 400 = 0,03 A = 30 mA." },
      { q: "Vì sao không nối chip trực tiếp vào cuộn relay?", o: ["Chip chỉ cấp được dòng rất nhỏ, không đủ hút relay", "Relay không dùng điện", "Chip chỉ làm việc với điện xoay chiều", "Để cho đẹp mạch"], a: 0, why: "Cần transistor khuếch đại dòng để hút cuộn relay." },
      { q: "Diode mắc song song cuộn relay dùng để làm gì?", o: ["Tăng lực hút", "Hấp thụ xung điện áp lúc ngắt, bảo vệ transistor", "Giảm dòng nền", "Đổi xoay chiều thành một chiều"], a: 1, why: "Cuộn sinh xung cao khi tắt dòng; diode dập xung đó." },
      { q: "Chip đã ra mức cao nhưng relay không hút. Nguyên nhân có thể là?", o: ["Điện trở nền quá lớn nên Ib quá nhỏ", "Điện trở nền quá nhỏ", "Quạt quá nhẹ", "Không thể có nguyên nhân nào"], a: 0, why: "Ib quá nhỏ thì transistor không dẫn đủ cho cuộn relay." },
      { q: "Tiếp điểm relay có tác dụng gì?", o: ["Đóng ngắt tải, đồng thời cách ly mạch điều khiển với mạch tải", "Chỉ để phát tiếng tách", "Lọc nhiễu nguồn", "Đo dòng điện"], a: 0, why: "Cuộn hút thì tiếp điểm đóng tải, hai mạch tách biệt nhau." }
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
  { t: "Diode dập xung", k: "diode dap xung flyback", d: "Diode mắc song song cuộn relay để hấp thụ xung điện áp lúc ngắt, bảo vệ transistor.", l: "b6" }
];
