## Chương I. MÔ TẢ, KHẢO SÁT VÀ XÁC ĐỊNH YÊU CẦU BÀI TOÁN

### 1.1 Mô tả bài toán

Trong bối cảnh trí tuệ nhân tạo (AI) đang bùng nổ trên toàn cầu, nhu cầu học cách sử dụng các công cụ AI trong công việc và cuộc sống hàng ngày ngày càng tăng cao tại Việt Nam. Tuy nhiên, phần lớn các khóa học hiện có trên thị trường tập trung vào lý thuyết chuyên sâu hoặc lập trình, chưa đáp ứng được nhu cầu của nhóm đối tượng **không có nền tảng kỹ thuật** — bao gồm sinh viên, nhân viên văn phòng, freelancer và chủ doanh nghiệp nhỏ.

**Bài toán đặt ra:** Xây dựng một nền tảng thương mại điện tử chuyên bán khóa học online về các công cụ AI thực hành (ChatGPT, Gemini, Canva AI, CapCut AI, NanoBanana), với các đặc điểm:

- **Khóa học ngắn gọn (1-3 giờ):** Tập trung vào thực hành, không nặng lý thuyết
- **Giá cả phải chăng:** Phù hợp với thị trường Việt Nam
- **Thư viện Prompt AI miễn phí:** Công cụ SEO lead magnet để thu hút người dùng
- **Hệ thống quản trị linh hoạt:** Admin có thể tùy chỉnh thương hiệu (white-label) mà không cần sửa mã nguồn

**Đối tượng sử dụng:**

| Vai trò | Mô tả |
|---------|-------|
| **Học viên (User)** | Duyệt, mua, học khóa học, làm quiz, nhận chứng chỉ, sử dụng thư viện Prompt AI |
| **Admin** | Quản lý khóa học, bài học, đơn hàng, người dùng, mã giảm giá, flash sale, hỗ trợ, cài đặt nền tảng |

---

### 1.2 Khảo sát hiện trạng

Khảo sát các nền tảng bán khóa học online hiện có trên thị trường:

| Nền tảng | Ưu điểm | Nhược điểm |
|----------|---------|------------|
| **Udemy** | Kho khóa học đa dạng, hệ thống đánh giá tốt | Nội dung chủ yếu tiếng Anh, giá USD khó tiếp cận người dùng Việt Nam |
| **Coursera** | Chứng chỉ từ đại học uy tín, nội dung chất lượng cao | Khóa học dài (nhiều tuần), nặng lý thuyết, phí cao |
| **Unica / Kyna** | Nội dung tiếng Việt, thanh toán nội địa | Giao diện cũ, thiếu tính năng AI, không có thư viện Prompt |
| **YouTube** | Miễn phí, đa dạng nội dung | Không có hệ thống theo dõi tiến độ, quiz, chứng chỉ |

**Khoảng trống thị trường mà Sudemy lấp đầy:**
- Khóa học AI thực hành bằng tiếng Việt, giá phải chăng
- Thư viện Prompt AI miễn phí (tối ưu SEO, mỗi prompt là 1 trang riêng để Google index)
- Hệ thống quiz + chứng chỉ tự động
- Tích hợp AI Tutor (chatbot hỗ trợ học tập)
- Thanh toán nội địa qua QR Code / chuyển khoản ngân hàng (PayOS)

---

### 1.3 Xác định yêu cầu bài toán

#### 1.3.1 Yêu cầu chức năng (Functional Requirements)

**Phía học viên (User):**
- Đăng ký / Đăng nhập (Email + Google OAuth)
- Duyệt danh sách khóa học (lọc, tìm kiếm, phân trang)
- Xem chi tiết khóa học (mô tả, danh sách bài học, giá)
- Mua khóa học (thanh toán qua PayOS — QR Code / chuyển khoản)
- Áp dụng mã giảm giá (Coupon) và Flash Sale
- Xem video bài học (YouTube embed)
- Làm quiz cuối bài (Multiple-choice, ≥70% = pass)
- Theo dõi tiến độ học tập
- Nhận chứng chỉ tự động khi hoàn thành 100%
- Sử dụng thư viện Prompt AI miễn phí (copy, lọc theo tag)
- Gửi ticket hỗ trợ
- Sử dụng AI Tutor chatbot (powered by Google Gemini)
- Chuyển đổi Dark mode / Light mode

**Phía quản trị (Admin):**
- Dashboard thống kê (doanh thu, đơn hàng, học viên, khóa học)
- CRUD khóa học (Draft → Published → Archived)
- CRUD bài học (video YouTube, quiz)
- CRUD Prompt AI (gắn tag, SEO fields)
- Quản lý người dùng (xem, phân quyền)
- Quản lý đơn hàng (xem, lọc theo trạng thái)
- Quản lý mã giảm giá (tạo, sửa, xóa)
- Quản lý Flash Sale (giảm giá toàn nền tảng, có đếm ngược)
- Quản lý ticket hỗ trợ (trả lời, cập nhật trạng thái)
- Cài đặt white-label (tên, logo, favicon, màu chủ đạo, liên kết mạng xã hội)

#### 1.3.2 Yêu cầu phi chức năng (Non-functional Requirements)

- **Bảo mật:** Xác thực Firebase, mã hóa token, chống XSS/NoSQL Injection, rate limiting
- **Hiệu năng:** Lazy loading, caching với React Query, phân trang API
- **SEO:** Mỗi prompt là 1 trang riêng với meta tags tối ưu (react-helmet-async)
- **Responsive:** Mobile-first design, hoạt động tốt trên mọi kích thước màn hình
- **UX:** Dark mode / Light mode, toast notifications, loading states, animations
