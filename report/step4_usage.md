## Chương IV. CÀI ĐẶT VÀ HƯỚNG DẪN SỬ DỤNG

### 4.1 Cài đặt CSDL

**Bước 1:** Tạo tài khoản MongoDB Atlas tại [mongodb.com/atlas](https://www.mongodb.com/atlas).

**Bước 2:** Tạo cluster mới (Free Tier M0 — 512MB).

**Bước 3:** Tạo Database User với username và password.

**Bước 4:** Whitelist IP Address (cho phép kết nối từ mọi IP: `0.0.0.0/0`).

**Bước 5:** Lấy Connection String và cấu hình trong file `.env` của server:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sudemy?retryWrites=true&w=majority
```

**Bước 6:** Chạy seed data để tạo dữ liệu mẫu:
```bash
cd server
npm run seed
```

Seed data bao gồm: 8 users, 4 khóa học, 15 prompts, 15 tags, 3 mã giảm giá, 20 testimonials.

---

### 4.2 Cài đặt môi trường Server

**Yêu cầu hệ thống:**
- Node.js >= 18.0
- npm >= 9.0
- Git

**Bước 1:** Clone repository và cài đặt dependencies:
```bash
git clone <repository-url>
cd Sudemy

# Cài đặt frontend
cd client && npm install

# Cài đặt backend
cd ../server && npm install
```

**Bước 2:** Cấu hình biến môi trường (`.env`):

| Biến | Mô tả |
|------|-------|
| `MONGODB_URI` | Connection string MongoDB Atlas |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase private key |
| `PAYOS_CLIENT_ID` | PayOS client ID |
| `PAYOS_API_KEY` | PayOS API key |
| `PAYOS_CHECKSUM_KEY` | PayOS checksum key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `RESEND_API_KEY` | Resend email API key |
| `CLIENT_URL` | Frontend URL (http://localhost:5173) |
| `PORT` | Server port (mặc định 3000) |

**Bước 3:** Chạy dự án ở chế độ Development:
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

**Bước 4:** Truy cập ứng dụng:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/v1`

**Deploy lên Production:**
- **Frontend:** Deploy lên Vercel (kết nối GitHub repo, tự động build).
- **Backend:** Deploy lên Render (Free Tier, cấu hình biến môi trường).

---

### 4.3 Giao diện User

#### 4.3.1 Giao diện trang chủ

Trang chủ hiển thị hero banner với tagline, danh sách khóa học nổi bật, thống kê nền tảng, testimonials và flash sale banner (nếu có).

![Giao diện trang chủ Sudemy](screenshots/homepage.png)

#### 4.3.2 Giao diện trang danh sách khóa học

Hiển thị danh sách tất cả khóa học đã publish, hỗ trợ tìm kiếm, lọc theo chủ đề và phân trang.

![Giao diện trang danh sách khóa học](screenshots/courses_list.png)

#### 4.3.3 Giao diện trang chi tiết khóa học

Hiển thị chi tiết khóa học: mô tả, giảng viên, giá, danh sách bài học, nội dung bao gồm, nút mua hàng.

![Giao diện trang chi tiết khóa học](screenshots/course_detail.png)

#### 4.3.4 Giao diện trang thư viện Prompt AI

Trang SEO lead magnet — hiển thị danh sách prompt AI miễn phí, lọc theo tag (tool + mục đích), copy 1 click.

![Giao diện trang thư viện Prompt AI](screenshots/prompts_list.png)

#### 4.3.5 Giao diện trang chi tiết Prompt

Trang chi tiết từng prompt với nội dung đầy đủ, nút copy, tag liên quan — mỗi prompt là 1 trang SEO riêng.

![Giao diện trang chi tiết Prompt](screenshots/prompt_detail.png)

#### 4.3.6 Giao diện trang đăng ký tài khoản

Form đăng ký với họ tên, email, mật khẩu + đăng ký nhanh bằng Google OAuth.

![Giao diện trang đăng ký](screenshots/register.png)

#### 4.3.7 Giao diện trang đăng nhập

Form đăng nhập email/password + đăng nhập nhanh bằng Google.

![Giao diện trang đăng nhập](screenshots/login.png)

#### 4.3.8 Giao diện trang thanh toán khóa học

Hiển thị thông tin đơn hàng, giá gốc, giá sau giảm (nếu có coupon/flash sale), ô nhập mã giảm giá, nút thanh toán.

*(Giao diện thanh toán được chuyển hướng đến cổng PayOS — tích hợp QR Code và chuyển khoản ngân hàng)*

#### 4.3.9 Giao diện trang kết quả thanh toán

Hiển thị kết quả thanh toán thành công với thông tin đơn hàng, nút vào học ngay.

![Giao diện kết quả thanh toán thành công](screenshots/payment_success.png)

#### 4.3.10 Giao diện trang học bài (Course Player)

Giao diện học bài với video player (YouTube embed), sidebar danh sách bài học kèm trạng thái hoàn thành.

![Giao diện trang học bài](screenshots/learn_page.png)

#### 4.3.11 Giao diện làm Quiz

Modal quiz multiple-choice cuối mỗi bài học, hiển thị câu hỏi, lựa chọn, kết quả (≥70% = pass).

*(Quiz hiển thị dưới dạng modal popup khi học viên nhấn nút "Làm Quiz" cuối mỗi bài học)*

#### 4.3.12 Giao diện Dashboard học viên

Dashboard cá nhân hiển thị các khóa học đã mua, tiến độ học tập, lịch sử đơn hàng.

![Giao diện Dashboard học viên](screenshots/dashboard.png)

#### 4.3.13 Giao diện hỗ trợ (Ticket)

Trang gửi và theo dõi ticket hỗ trợ, xem phản hồi từ admin.

![Giao diện trang hỗ trợ](screenshots/support.png)

#### 4.3.14 Giao diện AI Tutor

Panel chatbot AI Tutor (powered by Google Gemini) hỗ trợ học viên trong quá trình học, hiển thị bên cạnh video player.

*(AI Tutor hiển thị dưới dạng panel bên phải trong giao diện học bài, xem ảnh mục 4.3.10)*

---

### 4.4 Giao diện Admin

#### 4.4.1 Giao diện Dashboard Admin

Dashboard thống kê tổng quan: doanh thu (hôm nay / tuần / tháng), số đơn hàng, số học viên, số khóa học, biểu đồ doanh thu.

![Giao diện Dashboard Admin](screenshots/admin_dashboard.png)

#### 4.4.2 Giao diện quản lý khóa học

Bảng danh sách khóa học với thao tác CRUD, lọc theo trạng thái (Draft / Published / Archived).

![Giao diện quản lý khóa học](screenshots/admin_courses.png)

#### 4.4.3 Giao diện quản lý bài học

Quản lý bài học trong từng khóa học: thêm, sửa, xóa, sắp xếp thứ tự, thêm quiz.

![Giao diện quản lý bài học](screenshots/admin_lessons.png)

#### 4.4.4 Giao diện quản lý Prompt AI

Bảng quản lý prompt với thao tác CRUD, gắn tag, theo dõi số lần copy.

![Giao diện quản lý Prompt](screenshots/admin_prompts.png)

#### 4.4.5 Giao diện quản lý người dùng

Danh sách người dùng, thay đổi vai trò (User / Editor / Moderator / Admin).

![Giao diện quản lý người dùng](screenshots/admin_users.png)

#### 4.4.6 Giao diện quản lý đơn hàng

Bảng đơn hàng với lọc theo trạng thái (Pending / Completed / Failed), thông tin thanh toán.

![Giao diện quản lý đơn hàng](screenshots/admin_orders.png)

#### 4.4.7 Giao diện quản lý mã giảm giá

CRUD mã giảm giá: loại (phần trăm / cố định), giá trị, số lượng sử dụng, ngày hết hạn.

![Giao diện quản lý mã giảm giá](screenshots/admin_coupons.png)

#### 4.4.8 Giao diện quản lý Flash Sale

Tạo và quản lý sự kiện giảm giá toàn nền tảng: phần trăm giảm, thời gian bắt đầu/kết thúc.

![Giao diện quản lý Flash Sale](screenshots/admin_flash_sales.png)

#### 4.4.9 Giao diện quản lý hỗ trợ

Danh sách ticket hỗ trợ, trả lời ticket, cập nhật trạng thái (New → Processing → Resolved).

![Giao diện quản lý hỗ trợ](screenshots/admin_tickets.png)

#### 4.4.10 Giao diện cài đặt nền tảng (White-label)

Cài đặt tùy chỉnh thương hiệu: tên nền tảng, logo, favicon, màu chủ đạo, email liên hệ, liên kết mạng xã hội, footer text.

![Giao diện cài đặt nền tảng](screenshots/admin_settings.png)
