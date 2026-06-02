# Seed Data — Vietnamese AI Course Content

> Location: `server/src/scripts/seed.ts`
> Run: `cd server && npm run seed`

---

## Users (8 total)

```typescript
const users = [
  // Super Admin
  { fullName: 'Nguyễn Văn Admin', email: 'admin@sudemy.vn', role: 'admin', firebaseUid: 'admin-uid-001' },
  // Content Editor
  { fullName: 'Trần Thị Editor', email: 'editor@sudemy.vn', role: 'editor', firebaseUid: 'editor-uid-001' },
  // Moderator
  { fullName: 'Lê Văn Moderator', email: 'mod@sudemy.vn', role: 'moderator', firebaseUid: 'mod-uid-001' },
  // Students
  { fullName: 'Phạm Minh Tuấn', email: 'tuan.pham@gmail.com', role: 'user', firebaseUid: 'student-uid-001' },
  { fullName: 'Hoàng Thị Lan', email: 'lan.hoang@gmail.com', role: 'user', firebaseUid: 'student-uid-002' },
  { fullName: 'Võ Đức Huy', email: 'huy.vo@gmail.com', role: 'user', firebaseUid: 'student-uid-003' },
  { fullName: 'Đặng Ngọc Mai', email: 'mai.dang@gmail.com', role: 'user', firebaseUid: 'student-uid-004' },
  { fullName: 'Bùi Thanh Hà', email: 'ha.bui@gmail.com', role: 'user', firebaseUid: 'student-uid-005' },
];
```

## Tags (15 total)

```typescript
const tags = [
  // Tool tags
  { name: 'NanoBanana', slug: 'nanobanana', type: 'tool', color: '#f59e0b' },
  { name: 'ChatGPT', slug: 'chatgpt', type: 'tool', color: '#10b981' },
  { name: 'ChatGPT Image', slug: 'chatgpt-image', type: 'tool', color: '#06b6d4' },
  { name: 'Gemini', slug: 'gemini', type: 'tool', color: '#6366f1' },
  { name: 'Canva AI', slug: 'canva-ai', type: 'tool', color: '#8b5cf6' },
  { name: 'CapCut AI', slug: 'capcut-ai', type: 'tool', color: '#ec4899' },
  { name: 'Midjourney', slug: 'midjourney', type: 'tool', color: '#f43f5e' },
  // Purpose tags
  { name: 'Marketing', slug: 'marketing', type: 'purpose', color: '#ef4444' },
  { name: 'Ảnh Sản Phẩm', slug: 'product-images', type: 'purpose', color: '#f97316' },
  { name: 'Viết Nội Dung', slug: 'content-writing', type: 'purpose', color: '#84cc16' },
  { name: 'Học Tập', slug: 'study', type: 'purpose', color: '#3b82f6' },
  { name: 'Thiết Kế', slug: 'design', type: 'purpose', color: '#a855f7' },
  { name: 'Video', slug: 'video', type: 'purpose', color: '#e11d48' },
  { name: 'Kinh Doanh', slug: 'business', type: 'purpose', color: '#14b8a6' },
  { name: 'Cá Nhân', slug: 'personal', type: 'purpose', color: '#f59e0b' },
];
```

## Courses (4 courses)

```typescript
const courses = [
  {
    title: 'NanoBanana AI - Tạo Ảnh Sản Phẩm Chuyên Nghiệp Từ A-Z',
    slug: 'nanobanana-ai-tao-anh-san-pham',
    description: 'Học cách sử dụng NanoBanana AI để tạo ảnh sản phẩm đẹp mắt, chuyên nghiệp cho shop online, không cần biết Photoshop.',
    price: 299000,
    originalPrice: 599000,
    instructor: 'Nguyễn Văn Admin',
    status: 'published',
    totalLessons: 8,
    previewLessons: 2,
    ratings: { average: 4.8, count: 45 },
  },
  {
    title: 'ChatGPT Thực Chiến - Viết Content Marketing X10 Năng Suất',
    slug: 'chatgpt-thuc-chien-content-marketing',
    description: 'Hướng dẫn chi tiết cách dùng ChatGPT để viết content marketing hiệu quả, từ caption Facebook đến blog SEO.',
    price: 399000,
    originalPrice: 799000,
    instructor: 'Nguyễn Văn Admin',
    status: 'published',
    totalLessons: 6,
    previewLessons: 2,
    ratings: { average: 4.6, count: 32 },
  },
  {
    title: 'Canva AI - Thiết Kế Đồ Họa Cho Người Không Chuyên',
    slug: 'canva-ai-thiet-ke-do-hoa',
    description: 'Sử dụng Canva AI để tạo poster, banner, social media graphics chuyên nghiệp chỉ trong vài phút.',
    price: 199000,
    originalPrice: 399000,
    instructor: 'Trần Thị Editor',
    status: 'published',
    totalLessons: 5,
    previewLessons: 2,
    ratings: { average: 4.7, count: 28 },
  },
  {
    title: 'CapCut AI - Chỉnh Sửa Video Chuyên Nghiệp Cho TikTok & Reels',
    slug: 'capcut-ai-chinh-sua-video',
    description: 'Học cách dùng CapCut AI để edit video viral cho TikTok, Instagram Reels một cách nhanh chóng.',
    price: 349000,
    originalPrice: 699000,
    instructor: 'Nguyễn Văn Admin',
    status: 'draft',
    totalLessons: 7,
    previewLessons: 2,
    ratings: { average: 0, count: 0 },
  },
];
```

## Prompts (15 sample prompts — abbreviated)

```typescript
const prompts = [
  {
    title: 'Tạo Ảnh Sản Phẩm Trên Nền Trắng',
    slug: 'tao-anh-san-pham-nen-trang',
    content: 'Hãy tạo một bức ảnh sản phẩm [TÊN SẢN PHẨM] trên nền trắng tinh khiết, góc chụp 45 độ, ánh sáng studio chuyên nghiệp, chi tiết sắc nét, phong cách chụp thương mại cao cấp.',
    description: 'Prompt tạo ảnh sản phẩm chuyên nghiệp trên nền trắng bằng NanoBanana AI',
    tags: ['nanobanana', 'product-images'],
    category: 'marketing',
    copyCount: 234,
  },
  {
    title: 'Viết Caption Facebook Bán Hàng',
    slug: 'viet-caption-facebook-ban-hang',
    content: 'Hãy viết 3 caption Facebook bán hàng cho sản phẩm [TÊN SẢN PHẨM], giá [GIÁ]. Yêu cầu: hook mạnh ở dòng đầu, liệt kê 3-5 lợi ích, có CTA rõ ràng, sử dụng emoji phù hợp, tone thân thiện.',
    description: 'Prompt ChatGPT viết caption Facebook bán hàng chuyển đổi cao',
    tags: ['chatgpt', 'marketing', 'content-writing'],
    category: 'marketing',
    copyCount: 567,
  },
  {
    title: 'Tạo Ảnh Avatar Phong Cách Anime',
    slug: 'tao-anh-avatar-anime',
    content: 'Tạo ảnh avatar phong cách anime cho [MÔ TẢ NGƯỜI], nền gradient pastel, ánh sáng mềm, chi tiết mắt to long lanh, tóc bay nhẹ, chất lượng cao.',
    description: 'Prompt tạo ảnh avatar anime cute bằng ChatGPT Image',
    tags: ['chatgpt-image', 'personal', 'design'],
    category: 'personal',
    copyCount: 892,
  },
  // ... 12 more prompts covering various tools and purposes
];
```

## Testimonials (20 entries — sample)

```typescript
const testimonials = [
  { name: 'Nguyễn Thị Hương', role: 'Chủ shop online', content: 'Từ khi học khóa NanoBanana, ảnh sản phẩm của mình đẹp hơn hẳn, tỷ lệ click tăng 40%!' },
  { name: 'Trần Đức Mạnh', role: 'Content Creator', content: 'ChatGPT giúp mình viết content nhanh gấp 5 lần. Khóa học rất thực tế!' },
  { name: 'Lê Thị Ngọc Anh', role: 'Sinh viên Marketing', content: 'Mình không biết gì về AI, nhưng sau khóa học có thể tự tạo ảnh và viết content.' },
  { name: 'Phạm Hoàng Nam', role: 'Freelancer', content: 'Đầu tư 299k nhưng tiết kiệm được hàng triệu tiền thuê designer. Worth it!' },
  { name: 'Vũ Thị Mai Linh', role: 'Nhân viên văn phòng', content: 'Prompt Library miễn phí quá xịn! Copy paste là dùng được luôn.' },
  // ... 15 more testimonials
];
```

## Coupons (3 sample)

```typescript
const coupons = [
  { code: 'WELCOME20', discountType: 'percent', discountValue: 20, maxUses: 100, isActive: true },
  { code: 'SUDEMY50K', discountType: 'fixed', discountValue: 50000, maxUses: 50, isActive: true },
  { code: 'FIRSTBUY', discountType: 'percent', discountValue: 30, maxUses: 200, isActive: true },
];
```

## Settings (Singleton)

```typescript
const settings = {
  platformName: 'Sudemy',
  logoUrl: '/assets/logo.svg',
  faviconUrl: '/assets/favicon.ico',
  primaryColor: '#4f46e5',
  contactEmail: 'hello@sudemy.vn',
  socialLinks: { facebook: 'https://facebook.com/sudemy', youtube: 'https://youtube.com/@sudemy', tiktok: 'https://tiktok.com/@sudemy' },
  footerText: '© 2026 Sudemy. Nền tảng học AI thực chiến hàng đầu Việt Nam.',
};
```
