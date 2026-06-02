# Sudemy V1 (MVP) — Project Brief

> **Version:** 1.0 MVP
> **Last Updated:** 2026-05-17
> **Temporary Domain:** sudemy.vercel.app
> **Objective:** Quick launch, attract traffic via AI Prompt Library (SEO), sell individual courses, build a white-label ready platform.

---

## 1. Overview

**Sudemy** is an LMS (Learning Management System) platform in Vietnamese specializing in practical courses on **how to use free/affordable AI tools** (NanoBanana, ChatGPT, Gemini, Canva AI, CapCut AI, etc.). It targets users **without programming backgrounds**, allowing them to learn and apply AI directly to their work.

**Core Differentiators:**
- **Free AI Prompt Library** — The main lead magnet, with each prompt having its own dedicated page (for SEO).
- **Short, Concise Courses (1-3h)** — Focus on practical application, avoiding lengthy theories.
- **White-label** — Admins can change branding (logo, name, colors) without modifying the source code.

---

## 2. Target Audience

- Anyone looking to learn how to use AI tools to improve productivity.
- Students wanting to equip themselves with AI skills before graduation.
- Office workers and freelancers aiming to optimize their workflow with AI.
- Small business owners looking to apply AI to marketing and operations.

---

## 3. MVP Features (Detailed)

### 3.1. Landing Page
- Impressive Hero section with tagline + CTA ("Explore Free Prompt Library", "View Courses").
- List of featured courses (Featured Courses).
- Highlighted statistics: "100+ Free Prompts", "X Practical Courses", "X+ Students".
- Testimonials from ~20 dummy students (seed data for initial credibility).
- Footer: Social media links, links to Terms of Service and Privacy Policy.

### 3.2. AI Prompt Library (Lead Magnet — Free)
- A library of free prompts; **no registration required** to view and copy.
- **Each prompt has its own dedicated page** (URL slug) to allow Google indexing → SEO optimization.
  - Example: `sudemy.vercel.app/prompts/create-product-image-nanobanana`
- **Dual Tagging System:**
  - Tag by **AI tool**: `nanobanana`, `chatgpt-image`, `gemini`, `canva-ai`, etc.
  - Tag by **use case/purpose**: `marketing`, `product-images`, `content-writing`, `study`, etc.
- Each prompt page includes: Title, Description, Prompt Content (Copy button), Tags, CTA leading to related courses.
- Prompt list page: Tag filtering, search functionality.

### 3.3. Course System
- **Simple structure:** Course → List of Lessons (no chapters, since courses are short, 1-3h).
- Course list page: Filtering by topic, price, popularity.
- Course detail page: Description, lesson list, reviews, price, buy button.
- **Free preview of the first 2 lessons** for each course.
- Sales model: **Individual course purchases** (lifetime ownership).

### 3.4. Learning Interface (Course Player)
- YouTube embedded video player, layout focused on content.
- Sidebar with lesson list, marking completed lessons.
- **Multiple-choice Quiz** (at the end of each lesson, optional):
  - Multiple-choice questions (3-4 options, 1 correct answer).
  - Questions + answers pre-created by the Admin.
  - Score ≥70% → marks the lesson as completed.
- Progress tracking (% of course completion).
- Supports **Dark Mode / Light Mode**.

### 3.5. E-Certificates
- 100% course completion → automatically issues a certificate.
- **Dynamic** certificate template (fetches logo, platform name from Settings → white-label ready).
- Each certificate has a verification code + a public verification link.

### 3.6. Student Dashboard
- List of purchased courses.
- Learning progress (% completion).
- Order history.
- View/Download certificates.

### 3.7. Payment System
- Integrated with **PayOS**: QR Code, domestic bank transfers.
- Verify Webhook Signature (checksum) from PayOS.
- Idempotency: Prevents duplicate transactions.
- Post-payment → automatically unlocks the course.

### 3.8. Discount Codes & Flash Sales
- **Coupon:** Admins can create discount codes (percentage, fixed amount), limit usage count, set expiration dates.
- **Flash Sale:** Discount all individual courses during a specific timeframe (e.g., 50% off for 24h). Admins create flash sale events with start/end times.
- Display a countdown banner on the Landing Page when a flash sale is active.

### 3.9. Support System (Ticket-based)
- Users send support requests via a **form** (subject, message).
- Moderators receive and reply within the Admin Panel.
- Ticket status: New → Processing → Resolved.
- *No live chat in the MVP.*

### 3.10. Automated Emails
- Service: **Resend** (Free tier: 3,000 emails/month).
- Automated emails sent for:
  - (A) Account registration confirmation.
  - (B) Successful payment confirmation (with course information).

### 3.11. Legal Pages
- **Terms of Service.**
- **Privacy Policy.**
- **Refund Policy:** No refunds — clearly stated before payment.

### 3.12. Analytics
- Integrate **Google Analytics 4** (free) from day one.

---

## 4. Admin Panel — Designed for Non-tech Users

### 4.1. Role-Based Access Control (3 Roles)

| Role | Permissions |
|---|---|
| **Super Admin** | Full access: white-label settings, revenue, user management, delete courses, coupon/flash sale management. |
| **Content Editor** | Create/edit courses & lessons, manage prompts & tags, create quizzes. **Cannot** see revenue or orders. |
| **Moderator** | View orders, reply to support tickets, manage coupons. **Cannot** edit/delete courses or access settings. |

### 4.2. Admin Panel UX Requirements
- **Intuitive Interface:** Color-coded status labels (Draft - Gray, Published - Green, Locked - Red).
- **Rich Text Editor (WYSIWYG):** Use TipTap or React-Quill for course descriptions.
- **Drag-and-drop image upload**, auto-compression, and resizing.
- **Confirmation warnings** before any delete action ("Are you sure? This cannot be undone").
- **Overview Dashboard** (Super Admin): Revenue today/this week/this month, number of orders, number of new students.

### 4.3. White-label Settings (Super Admin)
- Change platform name, logo, favicon.
- Change primary color.
- Update contact information, social media links.
- Edit footer content.

---

## 5. Security & Data Validation

### 5.1. Input Validation Rules (Front-end + Back-end)

| Field | Rule |
|---|---|
| Full Name | Letters only (supports Vietnamese Unicode) + spaces. No numbers, no special characters. |
| Email | Standard email regex, verification via Firebase. |
| Password | Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number. |
| Coupon Code | Alphanumeric only, automatically uppercase. |
| Course Price | Positive numbers only, maximum value limit. |
| YouTube URL | Validate standard YouTube URL format. |
| Prompt/Description Content | Sanitize HTML, remove script tags. |

### 5.2. Mandatory Libraries
- **Zod** (Frontend + Backend): Schema validation.
- **DOMPurify** (Frontend): Sanitize user-input content.
- **mongo-sanitize** (Backend): Prevent NoSQL Injection.
- **helmet** (Backend): HTTP security headers.
- **express-rate-limit** (Backend): Prevent brute force / spam.

### 5.3. Payment Security
- Verify PayOS Webhook Signature using checksum.
- Handle Idempotency keys to prevent duplicate transactions.
- Log all payment transactions for auditing/debugging.

---

## 6. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4 + shadcn/ui | Mobile-first responsive |
| Routing | React Router v7 | Client-side routing |
| Backend | Express.js + Node.js | Monolithic, fast development speed |
| Database | MongoDB Atlas (Free Tier) + Mongoose | 512MB free |
| Auth | Firebase Auth (Google + Email) | Free 50k MAU |
| Payment | PayOS | QR Code, domestic transfers |
| Email | Resend (Free Tier) | 3,000 emails/month |
| Video | YouTube Embed | Zero storage costs |
| Analytics | Google Analytics 4 | Free |
| Deploy FE | Vercel (Free Tier) | Domain: sudemy.vercel.app |
| Deploy BE | Render (Free Tier) | Requires cron job to prevent cold starts |

---

## 7. Design Style

- **Mobile-first responsive** (prioritize mobile experience).
- Minimalist but visually striking.
- Supports **Dark Mode / Light Mode**.
- Typography: Inter / Be Vietnam Pro.
- Subtle animations: Framer Motion.
- Inspirations: Linear, Vercel, Stripe — clean, premium, modern.

---

## 8. Routes Structure

### Public (No login required)
| Route | Description |
|---|---|
| `/` | Landing Page |
| `/courses` | Course List |
| `/courses/:slug` | Course Detail |
| `/prompts` | AI Prompt Library |
| `/prompts/:slug` | Single Prompt Detail (SEO page) |
| `/login` | Login |
| `/register` | Register |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/certificates/verify/:code` | Verify Certificate |

### Protected (Login required)
| Route | Description |
|---|---|
| `/dashboard` | Student Dashboard |
| `/learn/:courseSlug/:lessonSlug` | Learning Interface (Course Player) |
| `/support` | Submit Support Ticket |
| `/certificates` | Personal Certificate List |

### Admin Panel
| Route | Role |
|---|---|
| `/admin` | Overview Dashboard (Super Admin sees revenue, Editor/Mod see their relevant metrics) |
| `/admin/courses` | Manage Courses (Super Admin, Content Editor) |
| `/admin/courses/:id/lessons` | Manage Lessons + Quizzes (Super Admin, Content Editor) |
| `/admin/prompts` | Manage Prompts (Super Admin, Content Editor) |
| `/admin/tags` | Manage Tags (Super Admin, Content Editor) |
| `/admin/orders` | Manage Orders (Super Admin, Moderator) |
| `/admin/users` | Manage Users (Super Admin) |
| `/admin/coupons` | Manage Coupons (Super Admin, Moderator) |
| `/admin/flash-sales` | Manage Flash Sales (Super Admin) |
| `/admin/tickets` | Manage Support Tickets (Super Admin, Moderator) |
| `/admin/settings` | White-label Settings (Super Admin) |

---

## 9. Database Structure (MongoDB Collections)

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

## 10. Folder Structure

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
│   │   ├── validators/          # Zod schemas for each endpoint
│   │   └── config/              # DB, Firebase Admin, env variables
│   ├── server.js
│   └── package.json
│
├── .env.example
├── PROJECT_BRIEF_V1_MVP_EN.md   # MVP Documentation (this file)
├── PROJECT_BRIEF_V2_UPGRADE_EN.md # V2 Upgrade Documentation
└── README.md
```

---

## 11. Features NOT included in MVP

The following features are planned for V2 (see `PROJECT_BRIEF_V2_UPGRADE_EN.md`):
- ❌ Subscription Plans (monthly/yearly billing)
- ❌ AI Practical Blog
- ❌ AI Tutor (Gemini Chatbot)
- ❌ AI Coin System (Gamification)
- ❌ Live Chat / Telegram-Zalo Integration
- ❌ Newsletter
- ❌ Affiliate System
- ❌ Custom domain
