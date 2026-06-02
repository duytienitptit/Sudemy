# API Specification

> **Base URL:** `/api/v1`
> **Auth:** Firebase ID Token in `Authorization: Bearer <token>` header
> **Content-Type:** `application/json`

---

## Auth & Users

### POST /api/v1/auth/register
- **Auth:** None
- **Body:** `{ fullName: string, email: string, password: string }`
- **Validation:** fullName (letters+spaces, Vietnamese Unicode, 2-50 chars), email (valid format), password (min 8, 1 upper, 1 lower, 1 number)
- **Success (201):** `{ success: true, data: { user: { _id, fullName, email, role }, token: "..." }, message: "Registration successful" }`
- **Errors:** 400 (validation), 409 (email exists)
- **Logic:** Create Firebase user → Create MongoDB user doc (role: 'user') → Send welcome email via Resend → Return JWT

### POST /api/v1/auth/login
- **Auth:** None
- **Body:** `{ idToken: string }` (Firebase ID token from client-side auth)
- **Success (200):** `{ success: true, data: { user: { _id, fullName, email, role, purchasedCourses }, token: "..." } }`
- **Errors:** 401 (invalid token), 404 (user not found in MongoDB)
- **Logic:** Verify Firebase ID token → Find MongoDB user by firebaseUid → Generate app JWT → Return

### GET /api/v1/auth/me
- **Auth:** Required
- **Success (200):** `{ success: true, data: { user: { _id, fullName, email, role, purchasedCourses, createdAt } } }`
- **Errors:** 401 (unauthorized)

### PATCH /api/v1/users/:id/role
- **Auth:** Required (Super Admin only)
- **Body:** `{ role: 'user' | 'editor' | 'moderator' | 'admin' }`
- **Success (200):** `{ success: true, data: { user }, message: "Role updated" }`
- **Errors:** 400 (invalid role), 403 (not admin), 404 (user not found)

### GET /api/v1/users
- **Auth:** Required (Super Admin only)
- **Query:** `?page=1&limit=20&search=&role=`
- **Success (200):** `{ success: true, data: [users], pagination: { page, limit, total, totalPages } }`

---

## Courses

### GET /api/v1/courses
- **Auth:** None (public)
- **Query:** `?page=1&limit=12&search=&sortBy=createdAt&order=desc&status=published`
- **Success (200):** `{ success: true, data: [courses], pagination: {...} }`
- **Note:** Public endpoint returns only `status: 'published'` courses. Admin endpoint returns all.

### GET /api/v1/courses/:slug
- **Auth:** None (public)
- **Success (200):** `{ success: true, data: { course: { ...courseFields, lessons: [{ _id, title, slug, order, isFree }] } } }`
- **Errors:** 404 (course not found)
- **Note:** Lessons included but without full content. Free lesson content available without auth.

### POST /api/v1/courses
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** `{ title: string, description: string, thumbnail: string, price: number, originalPrice?: number, instructor: string, previewLessons?: number }`
- **Validation:** title (3-200 chars, unique), price (≥0), description (min 10 chars)
- **Success (201):** `{ success: true, data: { course }, message: "Course created" }`
- **Logic:** Auto-generate slug from title. If slug exists, append `-2`, `-3`, etc.

### PUT /api/v1/courses/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** Partial course fields
- **Success (200):** `{ success: true, data: { course }, message: "Course updated" }`
- **Note:** Re-generate slug if title changes.

### DELETE /api/v1/courses/:id
- **Auth:** Required (Super Admin only)
- **Success (200):** `{ success: true, message: "Course deleted" }`
- **Logic:** Soft delete (set status to 'archived') or hard delete if no orders exist.

### PATCH /api/v1/courses/:id/status
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** `{ status: 'draft' | 'published' | 'archived' }`
- **Success (200):** `{ success: true, data: { course }, message: "Status updated" }`

---

## Lessons

### GET /api/v1/courses/:courseId/lessons
- **Auth:** Optional (determines which lessons show full content)
- **Success (200):** `{ success: true, data: [lessons] }`
- **Logic:** Free lessons or purchased course → full content. Otherwise → title + order only.

### GET /api/v1/lessons/:id
- **Auth:** Required (must have purchased course OR lesson is free)
- **Success (200):** `{ success: true, data: { lesson: { ...lessonFields, youtubeUrl, quiz } } }`
- **Errors:** 403 (not purchased), 404 (not found)

### POST /api/v1/courses/:courseId/lessons
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** `{ title: string, youtubeUrl: string, order: number, isFree: boolean, quiz?: [{ question, options[], correctAnswer }] }`
- **Validation:** youtubeUrl (valid YouTube format), order (positive integer), quiz questions (3-4 options, correctAnswer in range)
- **Success (201):** `{ success: true, data: { lesson }, message: "Lesson created" }`
- **Logic:** Update parent course `totalLessons` count.

### PUT /api/v1/lessons/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** Partial lesson fields
- **Success (200):** `{ success: true, data: { lesson }, message: "Lesson updated" }`

### DELETE /api/v1/lessons/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Success (200):** `{ success: true, message: "Lesson deleted" }`
- **Logic:** Update parent course `totalLessons` count. Delete related progress records.

### POST /api/v1/lessons/:id/quiz/submit
- **Auth:** Required
- **Body:** `{ answers: [{ questionIndex: number, selectedOption: number }] }`
- **Success (200):** `{ success: true, data: { score: number, passed: boolean, correctAnswers: number, totalQuestions: number } }`
- **Logic:** Score ≥70% → mark lesson as completed in Progress. Update course progress %.

---

## Prompts (AI Prompt Library)

### GET /api/v1/prompts
- **Auth:** None (public)
- **Query:** `?page=1&limit=20&search=&tags=tag1,tag2&category=`
- **Success (200):** `{ success: true, data: [prompts], pagination: {...} }`

### GET /api/v1/prompts/:slug
- **Auth:** None (public, SEO page)
- **Success (200):** `{ success: true, data: { prompt: { ...promptFields, tags: [tagObjects] } } }`
- **Errors:** 404 (prompt not found)

### POST /api/v1/prompts
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** `{ title: string, content: string, description: string, tags: string[], category: string }`
- **Validation:** title (3-200 chars), content (min 10 chars), tags (array of valid tag IDs)
- **Success (201):** `{ success: true, data: { prompt }, message: "Prompt created" }`

### PUT /api/v1/prompts/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** Partial prompt fields
- **Success (200):** `{ success: true, data: { prompt }, message: "Prompt updated" }`

### DELETE /api/v1/prompts/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Success (200):** `{ success: true, message: "Prompt deleted" }`

### POST /api/v1/prompts/:id/copy
- **Auth:** None (public, tracks copy count)
- **Success (200):** `{ success: true, data: { copyCount: number } }`
- **Logic:** Increment `copyCount` atomically.

---

## Tags

### GET /api/v1/tags
- **Auth:** None (public)
- **Query:** `?type=tool|purpose`
- **Success (200):** `{ success: true, data: [tags] }`

### POST /api/v1/tags
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** `{ name: string, type: 'tool' | 'purpose', color?: string }`
- **Success (201):** `{ success: true, data: { tag }, message: "Tag created" }`
- **Logic:** Auto-generate slug from name.

### PUT /api/v1/tags/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Body:** Partial tag fields
- **Success (200):** `{ success: true, data: { tag }, message: "Tag updated" }`

### DELETE /api/v1/tags/:id
- **Auth:** Required (Super Admin, Content Editor)
- **Success (200):** `{ success: true, message: "Tag deleted" }`
- **Logic:** Remove tag reference from all prompts that use it.

---

## Orders & Payments

### POST /api/v1/orders/create
- **Auth:** Required
- **Body:** `{ courseId: string, couponCode?: string }`
- **Validation:** courseId (valid, published), couponCode (valid, not expired, not maxed)
- **Success (201):** `{ success: true, data: { order, checkoutUrl: "https://pay.payos.vn/..." } }`
- **Logic:**
  1. Generate idempotency key
  2. Calculate final price (apply coupon/flash sale if applicable)
  3. Create PayOS payment link
  4. Save order with status 'pending'
  5. Return PayOS checkout URL

### GET /api/v1/orders
- **Auth:** Required (Super Admin, Moderator)
- **Query:** `?page=1&limit=20&status=&startDate=&endDate=`
- **Success (200):** `{ success: true, data: [orders], pagination: {...} }`

### GET /api/v1/orders/my
- **Auth:** Required
- **Success (200):** `{ success: true, data: [orders] }`
- **Note:** Returns only the authenticated user's orders.

### POST /api/v1/payments/webhook
- **Auth:** PayOS webhook signature verification
- **Body:** PayOS webhook payload
- **Success (200):** `{ success: true }`
- **Logic:**
  1. Verify webhook signature (checksum)
  2. Check idempotency (prevent duplicate processing)
  3. Update order status to 'completed'
  4. Add courseId to user's purchasedCourses
  5. Send confirmation email via Resend
  6. Log transaction for audit

---

## Coupons

### GET /api/v1/coupons
- **Auth:** Required (Super Admin, Moderator)
- **Success (200):** `{ success: true, data: [coupons] }`

### POST /api/v1/coupons
- **Auth:** Required (Super Admin)
- **Body:** `{ code: string, discountType: 'percent' | 'fixed', discountValue: number, maxUses?: number, expiresAt?: string, isActive?: boolean }`
- **Validation:** code (alphanumeric, auto-uppercase), discountValue (> 0, percent ≤ 100)
- **Success (201):** `{ success: true, data: { coupon }, message: "Coupon created" }`

### PUT /api/v1/coupons/:id
- **Auth:** Required (Super Admin)
- **Body:** Partial coupon fields
- **Success (200):** `{ success: true, data: { coupon }, message: "Coupon updated" }`

### DELETE /api/v1/coupons/:id
- **Auth:** Required (Super Admin)
- **Success (200):** `{ success: true, message: "Coupon deleted" }`

### POST /api/v1/coupons/validate
- **Auth:** Required
- **Body:** `{ code: string, courseId: string }`
- **Success (200):** `{ success: true, data: { valid: true, discountType, discountValue, finalPrice } }`
- **Errors:** 400 (invalid/expired/maxed coupon)

---

## Flash Sales

### GET /api/v1/flash-sales/active
- **Auth:** None (public)
- **Success (200):** `{ success: true, data: { flashSale: { name, discountPercent, endTime } | null } }`

### GET /api/v1/flash-sales
- **Auth:** Required (Super Admin)
- **Success (200):** `{ success: true, data: [flashSales] }`

### POST /api/v1/flash-sales
- **Auth:** Required (Super Admin)
- **Body:** `{ name: string, discountPercent: number, startTime: string, endTime: string }`
- **Validation:** discountPercent (1-99), endTime > startTime, no overlapping active sales
- **Success (201):** `{ success: true, data: { flashSale }, message: "Flash sale created" }`

### PUT /api/v1/flash-sales/:id
- **Auth:** Required (Super Admin)
- **Body:** Partial flash sale fields
- **Success (200):** `{ success: true, data: { flashSale }, message: "Flash sale updated" }`

---

## Progress & Certificates

### GET /api/v1/progress/:courseId
- **Auth:** Required
- **Success (200):** `{ success: true, data: { completedLessons: [...], progressPercent: number } }`

### POST /api/v1/progress/complete
- **Auth:** Required
- **Body:** `{ courseId: string, lessonId: string, quizScore?: number }`
- **Success (200):** `{ success: true, data: { progress, courseProgressPercent } }`
- **Logic:** If courseProgressPercent === 100 → auto-generate certificate.

### GET /api/v1/certificates
- **Auth:** Required
- **Success (200):** `{ success: true, data: [certificates] }`

### GET /api/v1/certificates/verify/:code
- **Auth:** None (public)
- **Success (200):** `{ success: true, data: { certificate: { userName, courseName, issuedAt, verificationCode } } }`
- **Errors:** 404 (invalid verification code)

---

## Tickets (Support)

### POST /api/v1/tickets
- **Auth:** Required
- **Body:** `{ subject: string, message: string }`
- **Validation:** subject (5-200 chars), message (10-2000 chars)
- **Success (201):** `{ success: true, data: { ticket }, message: "Ticket submitted" }`

### GET /api/v1/tickets
- **Auth:** Required (Super Admin, Moderator)
- **Query:** `?page=1&limit=20&status=new|processing|resolved`
- **Success (200):** `{ success: true, data: [tickets], pagination: {...} }`

### GET /api/v1/tickets/my
- **Auth:** Required
- **Success (200):** `{ success: true, data: [tickets] }`

### POST /api/v1/tickets/:id/reply
- **Auth:** Required (Super Admin, Moderator)
- **Body:** `{ message: string }`
- **Success (200):** `{ success: true, data: { ticket }, message: "Reply sent" }`
- **Logic:** Add reply to replies array. Auto-update status to 'processing' if currently 'new'.

### PATCH /api/v1/tickets/:id/status
- **Auth:** Required (Super Admin, Moderator)
- **Body:** `{ status: 'new' | 'processing' | 'resolved' }`
- **Success (200):** `{ success: true, data: { ticket }, message: "Status updated" }`

---

## Settings (White-label)

### GET /api/v1/settings
- **Auth:** None (public — needed for branding on every page)
- **Success (200):** `{ success: true, data: { settings: { platformName, logoUrl, faviconUrl, primaryColor, contactEmail, socialLinks, footerText } } }`

### PUT /api/v1/settings
- **Auth:** Required (Super Admin only)
- **Body:** Partial settings fields
- **Success (200):** `{ success: true, data: { settings }, message: "Settings updated" }`
- **Validation:** primaryColor (valid hex), logoUrl (valid URL), contactEmail (valid email)

---

## Admin Statistics

### GET /api/v1/admin/stats
- **Auth:** Required (Super Admin)
- **Success (200):**
```json
{
  "success": true,
  "data": {
    "revenue": { "today": 0, "thisWeek": 0, "thisMonth": 0, "total": 0 },
    "orders": { "today": 0, "thisWeek": 0, "thisMonth": 0, "total": 0 },
    "students": { "new": { "today": 0, "thisWeek": 0, "thisMonth": 0 }, "total": 0 },
    "courses": { "published": 0, "draft": 0, "total": 0 },
    "prompts": { "total": 0, "totalCopies": 0 },
    "tickets": { "new": 0, "processing": 0, "resolved": 0 }
  }
}
```
