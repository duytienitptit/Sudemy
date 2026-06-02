# Sudemy V2 — Upgrade Plan

> **Version:** 2.0
> **Prerequisite:** Completion of V1 MVP, stable traffic, and an established student base.
> **Objective:** Transition to a Subscription model, build community, and increase Customer Lifetime Value (LTV).

---

## 1. Overview of Changes

V2 focuses on 3 main pillars:
1. **Monetization:** Introduce Subscription plans → Monthly Recurring Revenue (MRR).
2. **Retention:** Blog + AI Tutor + Gamification → Keep users engaged and returning.
3. **Scale:** Newsletter + Affiliate system + Telegram/Zalo Support integration → Expand reach and operations.

---

## 2. New Features in V2

### 2.1. Subscription Plans (Pro)

| Plan | Description |
|---|---|
| **Individual Course** (Kept from V1) | Buy a specific course, lifetime ownership. |
| **Pro Monthly** | Pay monthly, access ALL courses + priority to earn AI Coins. |
| **Pro Yearly** | Pay yearly (~30% cheaper than monthly), access ALL courses + priority AI Coins. |

- **Flash Sale V2:** Shift focus to discounting the **Subscription plans** ("50% off Yearly Plan, 24h only") instead of discounting individual courses.
- Requires new subscription management logic: renewals, cancellations, expiration reminders.
- Integrate recurring payment via PayOS or a suitable payment gateway.

### 2.2. Practical AI Blog
- SEO-optimized article system posted by Admins.
- Each blog post has its own dedicated page (URL slug) → Google indexing.
- Content focus: Practical Use Cases, AI tool reviews, comparisons, step-by-step guides.
- Rich Text Editor (WYSIWYG) in the Admin Panel.
- Categorize posts by categories + tags.
- CTA in each article leading to the Prompt Library or relevant Courses.

### 2.3. AI Tutor
- Chatbot integrating **Google Gemini API**, displayed directly in the Course Player UI.
- Context-aware based on the current lesson → provides more accurate answers.
- 24/7 Q&A support in Vietnamese.
- Rate limits on questions/day for free users, unlimited for Pro users.

### 2.4. AI Coin System (Gamification)
- **How to earn Coins:**
  - Complete a lesson → +X Coins.
  - Achieve high quiz scores → +Bonus Coins.
  - Complete a full course → +Large Bonus.
- **How to spend Coins:** Redeem for discount codes on individual courses or subscription renewals.
- Display Coin balance on the Student Dashboard.
- Leaderboard to create motivation and engagement.

### 2.5. Live Chat Support (Telegram / Zalo)
- Upgrade from Ticket-based → **Live Chat** or message forwarding integration.
- When users send a ticket/chat message → Moderators receive notifications via a **Telegram Bot** or **Zalo OA**.
- Moderators can reply directly from Telegram/Zalo → Responses display on the platform.
- Reduces response time, no need to constantly keep the Admin Panel open.

### 2.6. Newsletter
- Service: Migrate to **Brevo (Sendinblue)** (Free tier: 300 emails/day).
- Collect emails via forms on the Landing Page + Prompt Library.
- Send weekly newsletters: 3 trending AI news, 1 featured prompt, 1 new tool.
- Automated emails reminding users of upcoming subscription expiration (3 days prior + 1 day prior).

### 2.7. Affiliate System
- Each student/KOL gets a unique referral link.
- When someone buys a course/subscribes to Pro via the link → referrer earns a commission (%).
- **Affiliate Dashboard:** Track clicks, orders, commissions, and payout requests.
- Admin management: Approve/Reject payout requests, configure commission rates.

---

## 3. Infrastructure Upgrades for V2

| Category | V1 (MVP) | V2 (Upgrade) |
|---|---|---|
| **Backend Hosting** | Render Free Tier | VPS ($5-6/month) — DigitalOcean / Vultr |
| **Domain** | sudemy.vercel.app | Custom domain (e.g., sudemy.vn) |
| **Email** | Resend (3k/month) | Brevo — supports Newsletters + transactional |
| **CDN/Image** | Direct from server | Cloudinary or equivalent (image optimization) |

---

## 4. Additional Database Collections for V2

```
Subscriptions {
  _id, userId, plan (monthly|yearly), status (active|expired|cancelled),
  startDate, endDate, payosSubscriptionId,
  autoRenew, createdAt
}

BlogPosts {
  _id, title, slug, content, excerpt, coverImage,
  category, tags[], author (adminId),
  status (draft|published), publishedAt, createdAt, updatedAt
}

BlogCategories {
  _id, name, slug, description
}

AiCoinTransactions {
  _id, userId, amount, type (earn|spend),
  source (lesson_complete|quiz_bonus|course_complete|redeem_coupon),
  referenceId, createdAt
}

AiCoinBalances {
  _id, userId, balance, lastUpdated
}

Affiliates {
  _id, userId, referralCode, commissionRate,
  totalEarnings, pendingPayout, status (active|suspended),
  createdAt
}

AffiliateTransactions {
  _id, affiliateId, orderId, commissionAmount,
  status (pending|approved|paid|rejected), createdAt
}

NewsletterSubscribers {
  _id, email, subscribedAt, unsubscribedAt, isActive
}
```

---

## 5. Additional Routes for V2

### Public
| Route | Description |
|---|---|
| `/blog` | Blog List |
| `/blog/:slug` | Blog Post Detail |
| `/pricing` | Pricing Comparison Page (Individual vs Pro) |
| `/ref/:code` | Affiliate link redirect |

### Protected
| Route | Description |
|---|---|
| `/subscription` | Manage Personal Subscription |
| `/affiliate` | Personal Affiliate Dashboard |

### Admin
| Route | Description |
|---|---|
| `/admin/blog` | Manage Blog Posts (Super Admin, Content Editor) |
| `/admin/blog/new` | Create New Post |
| `/admin/subscriptions` | Manage Subscriptions (Super Admin) |
| `/admin/ai-coins` | AI Coin Settings (Super Admin) |
| `/admin/affiliates` | Manage Affiliates, approve payouts (Super Admin) |
| `/admin/newsletter` | Manage subscribers, send newsletters (Super Admin) |

---

## 6. V2 Implementation Priority

1. **Blog** → Start building SEO as soon as possible.
2. **Subscription** → Transition the revenue model.
3. **AI Coin + Gamification** → Increase user engagement.
4. **AI Tutor** → Enhance the learning experience.
5. **Newsletter** → Nurture leads.
6. **Live Chat (Telegram/Zalo)** → Improve customer support.
7. **Affiliate** → Expand operations and scale.
8. **Upgrade Hosting + Custom Domain** → Should be done early, can run parallel with items 1 and 2.
