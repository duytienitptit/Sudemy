# Sudemy V1 (MVP) — Project Brief

> **Phiên bản:** 1.0 MVP
> **Cập nhật:** 2026-05-17
> **Domain tạm:** sudemy.vercel.app
> **Mục tiêu:** Ra mắt nhanh, thu hút traffic qua Kho Prompt (SEO), bán khóa học lẻ, xây dựng nền tảng white-label.

---

## 1. Tổng Quan

**Sudemy** là nền tảng LMS tiếng Việt chuyên cung cấp khóa học thực chiến về **cách sử dụng công cụ AI miễn phí/giá rẻ** (NanoBanana, ChatGPT, Gemini, Canva AI, CapCut AI,...). Hướng tới người dùng **không cần biết lập trình**, chỉ cần học và ứng dụng AI ngay vào công việc.

**Điểm khác biệt cốt lõi:**
- **Kho Prompt AI miễn phí** — Lead magnet chính, mỗi prompt có trang riêng (SEO).
- **Khóa học ngắn gọn (1-3h)** — Tập trung thực hành, không lý thuyết dài dòng.
- **White-label** — Admin có thể đổi thương hiệu (logo, tên, màu sắc) mà không cần sửa code.

---

## 2. Đối Tượng Khách Hàng

- Bất kì ai muốn học cách sử dụng công cụ AI để nâng cao hiệu suất.
- Sinh viên muốn trang bị kỹ năng AI trước khi ra trường.
- Nhân viên văn phòng, freelancer muốn tối ưu workflow bằng AI.
- Chủ doanh nghiệp nhỏ muốn ứng dụng AI vào marketing, vận hành.

---

## 3. Tính Năng MVP (Chi Tiết)

### 3.1. Landing Page
- Hero section ấn tượng với tagline + CTA ("Khám phá Kho Prompt miễn phí", "Xem khóa học").
- Danh sách khóa học nổi bật (Featured Courses).
- Thống kê nổi bật: "100+ Prompt miễn phí", "X Khóa học thực chiến", "X+ Học viên".
- Testimonials từ ~20 học viên mẫu (seed data).
- Footer: liên kết mạng xã hội, link Điều khoản, Chính sách.

### 3.2. Kho Prompt AI (Lead Magnet — Miễn phí)
- Thư viện prompt miễn phí, **không cần đăng ký** để xem và copy.
- **Mỗi prompt có trang riêng** (URL slug) để Google index → tối ưu SEO.
  - Ví dụ: `sudemy.vercel.app/prompts/tao-anh-san-pham-nanobanana`
- **Hệ thống Tag kép:**
  - Tag theo **công cụ AI**: `nanobanana`, `chatgpt-image`, `gemini`, `canva-ai`,...
  - Tag theo **mục đích sử dụng**: `marketing`, `tạo ảnh sản phẩm`, `viết content`, `học tập`,...
- Mỗi trang prompt gồm: Tiêu đề, Mô tả, Nội dung prompt (nút Copy), Tags, CTA dẫn tới khóa học liên quan.
- Trang danh sách prompt: Bộ lọc theo tag, tìm kiếm.

### 3.3. Hệ Thống Khóa Học
- **Cấu trúc đơn giản:** Khóa học → Danh sách Bài học (không chia chương, vì khóa ngắn 1-3h).
- Trang danh sách khóa học: Bộ lọc theo chủ đề, giá, độ phổ biến.
- Trang chi tiết khóa học: Mô tả, danh sách bài học, đánh giá, giá, nút mua.
- **Preview miễn phí 2 bài đầu** cho mỗi khóa.
- Mô hình bán: **Mua lẻ từng khóa** (sở hữu vĩnh viễn).

### 3.4. Giao Diện Học Tập (Course Player)
- Video player nhúng YouTube, bố cục tập trung nội dung.
- Sidebar danh sách bài học, đánh dấu bài đã hoàn thành.
- **Quiz trắc nghiệm** (cuối mỗi bài học, tùy chọn):
  - Câu hỏi multiple choice (3-4 lựa chọn, 1 đáp án đúng).
  - Câu hỏi + đáp án do Admin tạo sẵn.
  - Đạt ≥70% → đánh dấu bài học hoàn thành.
- Theo dõi tiến độ (% hoàn thành khóa học).
- Hỗ trợ **Dark Mode / Light Mode**.

### 3.5. Chứng Chỉ Điện Tử
- Hoàn thành 100% khóa học → tự động cấp chứng chỉ.
- Template chứng chỉ **dynamic** (lấy logo, tên nền tảng từ Settings → white-label ready).
- Mỗi chứng chỉ có mã xác thực (verification code) + link xác minh công khai.

### 3.6. Dashboard Học Viên
- Danh sách khóa học đã mua.
- Tiến độ học tập (% hoàn thành).
- Lịch sử đơn hàng.
- Xem/Tải chứng chỉ.

### 3.7. Hệ Thống Thanh Toán
- Tích hợp **PayOS**: QR Code, chuyển khoản ngân hàng nội địa.
- Xác minh Webhook Signature (checksum) từ PayOS.
- Idempotency: Chống trùng lặp giao dịch.
- Sau thanh toán → tự động mở khóa khóa học.

### 3.8. Mã Giảm Giá & Flash Sale
- **Coupon:** Admin tạo mã giảm giá (%, cố định), giới hạn số lần dùng, ngày hết hạn.
- **Flash Sale:** Giảm giá toàn bộ khóa học lẻ trong khung giờ (ví dụ: 50% trong 24h). Admin tạo sự kiện flash sale với thời gian bắt đầu/kết thúc.
- Hiển thị banner countdown trên Landing Page khi flash sale đang diễn ra.

### 3.9. Hệ Thống Hỗ Trợ (Ticket-based)
- Người dùng gửi yêu cầu hỗ trợ qua **form** (chủ đề, nội dung).
- Moderator nhận và trả lời trên Admin Panel.
- Trạng thái ticket: Mới → Đang xử lý → Đã giải quyết.
- *Không có live chat trong MVP.*

### 3.10. Email Tự Động
- Dịch vụ: **Resend** (Free tier: 3,000 email/tháng).
- Email gửi tự động:
  - (A) Xác nhận đăng ký tài khoản.
  - (B) Xác nhận thanh toán thành công (kèm thông tin khóa học).

### 3.11. Trang Pháp Lý
- **Điều khoản sử dụng (Terms of Service).**
- **Chính sách bảo mật (Privacy Policy).**
- **Chính sách hoàn tiền:** Không hoàn tiền — ghi rõ trước khi thanh toán.

### 3.12. Analytics
- Tích hợp **Google Analytics 4** (miễn phí) từ ngày đầu.

---

## 4. Trang Quản Trị (Admin Panel) — Thiết Kế Cho Non-tech

### 4.1. Hệ Thống Phân Quyền (3 Roles)

| Role | Quyền hạn |
|---|---|
| **Super Admin** | Toàn quyền: cài đặt white-label, doanh thu, quản lý user, xóa khóa học, quản lý coupon/flash sale |
| **Content Editor** | Tạo/sửa khóa học & bài học, quản lý prompt & tag, tạo quiz. **Không** thấy doanh thu, đơn hàng |
| **Moderator** | Xem đơn hàng, trả lời ticket hỗ trợ, quản lý coupon. **Không** được sửa/xóa khóa học, cài đặt |

### 4.2. Yêu Cầu UX Admin Panel
- **Giao diện trực quan:** Nhãn màu sắc cho trạng thái (Nháp - Xám, Xuất bản - Xanh, Khóa - Đỏ).
- **Rich Text Editor (WYSIWYG):** Dùng TipTap hoặc React-Quill cho mô tả khóa học.
- **Kéo thả ảnh upload**, tự động nén và resize.
- **Cảnh báo xác nhận** trước mọi hành động xóa ("Bạn có chắc chắn? Không thể hoàn tác").
- **Dashboard tổng quan** (Super Admin): Doanh thu hôm nay/tuần/tháng, số đơn hàng, số học viên mới.

### 4.3. Cài Đặt White-label (Super Admin)
- Đổi tên nền tảng, logo, favicon.
- Đổi màu sắc chủ đạo (primary color).
- Cập nhật thông tin liên hệ, link mạng xã hội.
- Chỉnh nội dung footer.

---

## 5. Bảo Mật & Xác Thực Dữ Liệu (Security)

### 5.1. Quy Tắc Validate Input (Front-end + Back-end)

| Trường | Quy tắc |
|---|---|
| Họ Tên | Chỉ chữ cái (hỗ trợ Unicode tiếng Việt) + khoảng trắng. Không số, không ký tự đặc biệt |
| Email | Regex chuẩn email, xác thực qua Firebase |
| Mật khẩu | Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số |
| Mã coupon | Chỉ chữ và số (alphanumeric), tự động viết hoa |
| Giá khóa học | Chỉ số dương, giới hạn giá trị tối đa |
| YouTube URL | Validate đúng định dạng YouTube URL |
| Nội dung prompt/mô tả | Sanitize HTML, loại bỏ script tags |

### 5.2. Thư Viện Bắt Buộc
- **Zod** (Frontend + Backend): Schema validation.
- **DOMPurify** (Frontend): Sanitize nội dung người dùng nhập.
- **mongo-sanitize** (Backend): Chống NoSQL Injection.
- **helmet** (Backend): HTTP security headers.
- **express-rate-limit** (Backend): Chống brute force / spam.

### 5.3. An Toàn Thanh Toán
- Xác minh PayOS Webhook Signature bằng checksum.
- Xử lý Idempotency key chống trùng lặp giao dịch.
- Log mọi giao dịch thanh toán để kiểm tra/debug.

---

## 6. Tech Stack

| Tầng | Công Nghệ | Ghi chú |
|---|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4 + shadcn/ui | Mobile-first responsive |
| Routing | React Router v7 | Client-side routing |
| Backend | Express.js + Node.js | Monolithic, tốc độ phát triển nhanh |
| Database | MongoDB Atlas (Free Tier) + Mongoose | 512MB miễn phí |
| Auth | Firebase Auth (Google + Email) | Miễn phí 50k MAU |
| Payment | PayOS | QR Code, chuyển khoản nội địa |
| Email | Resend (Free Tier) | 3,000 email/tháng |
| Video | YouTube Embed | Không tốn storage |
| Analytics | Google Analytics 4 | Miễn phí |
| Deploy FE | Vercel (Free Tier) | Domain: sudemy.vercel.app |
| Deploy BE | Render (Free Tier) | Cần cron job chống cold start |

---

## 7. Phong Cách Thiết Kế

- **Mobile-first responsive** (ưu tiên trải nghiệm điện thoại).
- Tối giản (Minimalist) nhưng ấn tượng thị giác mạnh.
- Hỗ trợ **Dark Mode / Light Mode**.
- Typography: Inter / Be Vietnam Pro.
- Subtle animations: Framer Motion.
- Cảm hứng: Linear, Vercel, Stripe — sạch sẽ, premium, hiện đại.

---

## 8. Cấu Trúc Routes

### Public (Không cần đăng nhập)
| Route | Mô tả |
|---|---|
| `/` | Landing Page |
| `/courses` | Danh sách khóa học |
| `/courses/:slug` | Chi tiết khóa học |
| `/prompts` | Kho Prompt AI |
| `/prompts/:slug` | Chi tiết 1 prompt (SEO page) |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/terms` | Điều khoản sử dụng |
| `/privacy` | Chính sách bảo mật |
| `/certificates/verify/:code` | Xác minh chứng chỉ |

### Protected (Cần đăng nhập)
| Route | Mô tả |
|---|---|
| `/dashboard` | Dashboard học viên |
| `/learn/:courseSlug/:lessonSlug` | Giao diện học tập (Course Player) |
| `/support` | Gửi ticket hỗ trợ |
| `/certificates` | Danh sách chứng chỉ cá nhân |

### Admin Panel
| Route | Role |
|---|---|
| `/admin` | Dashboard tổng quan (Super Admin thấy doanh thu, Editor/Mod thấy phần mình quản lý) |
| `/admin/courses` | Quản lý khóa học (Super Admin, Content Editor) |
| `/admin/courses/:id/lessons` | Quản lý bài học + Quiz (Super Admin, Content Editor) |
| `/admin/prompts` | Quản lý prompt (Super Admin, Content Editor) |
| `/admin/tags` | Quản lý tag (Super Admin, Content Editor) |
| `/admin/orders` | Quản lý đơn hàng (Super Admin, Moderator) |
| `/admin/users` | Quản lý người dùng (Super Admin) |
| `/admin/coupons` | Quản lý mã giảm giá (Super Admin, Moderator) |
| `/admin/flash-sales` | Quản lý Flash Sale (Super Admin) |
| `/admin/tickets` | Quản lý ticket hỗ trợ (Super Admin, Moderator) |
| `/admin/settings` | Cài đặt White-label (Super Admin) |

---

## 9. Cấu Trúc Database (MongoDB Collections)

```
Users {
  _id, firebaseUid, fullName, email, role (user|editor|moderator|admin),
  purchasedCourses[], createdAt, updatedAt
}

Courses {
  _id, title, slug, description, thumbnail, price, originalPrice,
  instructor, status (draft|published|archived),
  totalLessons, previewLessons (default: 2),
  ratings { average, count }, createdAt, updatedAt
}

Lessons {
  _id, courseId, title, slug, youtubeUrl, order, isFree,
  quiz [{ question, options[], correctAnswer }],
  createdAt, updatedAt
}

Prompts {
  _id, title, slug, content, description,
  tags[], category, copyCount, createdAt, updatedAt
}

Tags {
  _id, name, slug, type (tool|purpose), color
}

Orders {
  _id, userId, courseId, amount, originalAmount,
  couponId, payosOrderId, payosTransactionId,
  status (pending|completed|failed), idempotencyKey,
  createdAt
}

Coupons {
  _id, code, discountType (percent|fixed), discountValue,
  maxUses, usedCount, expiresAt, isActive, createdAt
}

FlashSales {
  _id, name, discountPercent, startTime, endTime,
  isActive, createdAt
}

Tickets {
  _id, userId, subject, message, status (new|processing|resolved),
  replies [{ message, repliedBy, repliedAt }], createdAt
}

Certificates {
  _id, userId, courseId, verificationCode,
  issuedAt
}

Progress {
  _id, userId, courseId, lessonId,
  completed, quizScore, completedAt
}

Settings {
  _id, platformName, logoUrl, faviconUrl, primaryColor,
  contactEmail, socialLinks {}, footerText,
  updatedAt
}
```

---

## 10. Cấu Trúc Thư Mục

```
Sudemy/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/          # UI Components (shadcn/ui)
│   │   │   ├── ui/              # shadcn base components
│   │   │   ├── layout/          # Header, Footer, Sidebar
│   │   │   └── shared/          # Reusable (PromptCard, CourseCard,...)
│   │   ├── pages/               # Route pages
│   │   │   ├── public/          # Landing, Courses, Prompts, Auth
│   │   │   ├── dashboard/       # Student dashboard, Learn, Support
│   │   │   └── admin/           # Admin panel pages
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # API client, Firebase config, utils
│   │   ├── schemas/             # Zod validation schemas (shared)
│   │   └── assets/              # Images, fonts
│   ├── index.html
│   └── vite.config.js
│
├── server/                      # Express.js Backend
│   ├── src/
│   │   ├── routes/              # API route definitions
│   │   ├── controllers/         # Request handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── middlewares/         # Auth verify, validate, sanitize, rate-limit
│   │   ├── services/            # PayOS logic, Resend email, business logic
│   │   ├── validators/          # Zod schemas cho từng endpoint
│   │   └── config/              # DB, Firebase Admin, env variables
│   ├── server.js
│   └── package.json
│
├── .env.example
├── PROJECT_BRIEF_V1_MVP.md      # Tài liệu MVP (file này)
├── PROJECT_BRIEF_V2_UPGRADE.md  # Tài liệu nâng cấp V2
└── README.md
```

---

## 11. Tính Năng KHÔNG có trong MVP

Các tính năng sau được lên kế hoạch cho V2 (xem `PROJECT_BRIEF_V2_UPGRADE.md`):
- ❌ Gói Subscription (trả theo tháng/năm)
- ❌ Blog AI Thực Chiến
- ❌ AI Tutor (Chatbot Gemini)
- ❌ Hệ thống AI Coin (Gamification)
- ❌ Live Chat / Tích hợp Telegram-Zalo
- ❌ Bản tin Newsletter
- ❌ Hệ thống Affiliate
- ❌ Custom domain
