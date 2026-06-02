# Style Guide — Sudemy UI Patterns

> **Inspiration:** Udemy layout patterns + Indigo branding + Clean modern aesthetic.
> **Framework:** TailwindCSS v4 + shadcn/ui.
> **Design Tool:** Stitch MCP (design-per-milestone).

---

## Design Philosophy

| Principle | Implementation |
|---|---|
| **Clean & Focused** | White backgrounds, minimal shadows, generous whitespace |
| **Content-First** | UI disappears, content takes center stage |
| **Consistent** | Repeating card/grid/table patterns across all pages |
| **Responsive** | Mobile-first, 5 breakpoints (sm → 2xl) |
| **Accessible** | Contrast ratios ≥ 4.5:1, focus indicators, ARIA labels |

---

## Global Layout Patterns

### Header (Sticky)
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Khóa học] [Prompt AI]  [────Search────]  [🌓] [Login] [Sign Up] │
└─────────────────────────────────────────────────────────────┘
```
- White background, thin bottom border (`border-b`)
- Logo: text logo "Sudemy" in primary indigo, font-bold
- Search: center-aligned, expandable input with icon
- Auth buttons: outlined "Login" + solid "Sign Up" (primary indigo)
- Mobile: hamburger menu → slide-out drawer

### Promotion Banner (Optional, Top)
```
┌──────────────────────────────────────────────────────┐
│ 🔥 Flash Sale: Giảm 50%! Kết thúc trong 5h 30m 15s  [×] │
└──────────────────────────────────────────────────────┘
```
- Full-width, primary indigo background, white text
- Countdown timer (animated), dismissible

### Footer (Dark)
```
┌─────────────────────────────────────────────────────┐
│ DARK BACKGROUND (#1e1e2e)                            │
│                                                      │
│ [Kỹ năng AI]    [Web Dev]     [Chứng chỉ]  [Khác]  │
│  ChatGPT         React         Google AI     ...     │
│  Canva AI        Node.js       AWS           ...     │
│                                                      │
│ ─────────────────────────────────────────────────── │
│ [About] [Khám phá] [Hỗ trợ]  [Pháp lý]            │
│                                                      │
│ © 2025 Sudemy                         [🌐 Tiếng Việt]│
└─────────────────────────────────────────────────────┘
```
- 4-column category links (uppercase section headers)
- Bottom: 4-column info links + copyright + language selector

---

## Card Patterns

### Course Card
```
┌───────────────────┐
│ [  Thumbnail  📷  ] │
│                     │
│ Course Title (2     │
│ lines max)          │
│ Instructor Name     │
│ ⭐ 4.7 (1,234)     │
│ ₫ 499.000  ₫899.000│
│ [Bestseller]        │
└───────────────────┘
```
- Thin border (`1px solid --border`), no shadow at rest
- Hover: subtle shadow + slight scale (1.02)
- **Hover Tooltip:** On desktop hover, show a floating preview card:
  - Title, Bestseller badge, last updated
  - Short description, 3-4 learning outcomes (checkmarks)
  - "Thêm vào giỏ hàng" CTA button
- Thumbnail: aspect-ratio 16/9, rounded-t-lg
- Title: 2 lines max, `line-clamp-2`
- Price: current in bold, original with strikethrough
- Bestseller badge: small green/amber label

### Prompt Card
```
┌───────────────────┐
│ [🤖 Tool Icon]    │
│ Prompt Title       │
│ Short description  │
│ [ChatGPT] [SEO]   │
│ 📋 1,234 lượt copy │
└───────────────────┘
```
- Surface background, border, rounded-lg
- Tag badges: small colored pills
- Copy count: muted text, bottom-left
- Hover: border-primary transition

---

## Page Layout Patterns

### List Pages (Courses, Prompts)
```
┌────────────────────────────────────────────┐
│ [SearchBar ─────────────────]              │
│                                             │
│ ┌─Filter─┐  ┌─Card─┐ ┌─Card─┐ ┌─Card─┐  │
│ │ Topic   │  │      │ │      │ │      │  │
│ │ Price   │  │      │ │      │ │      │  │
│ │ Sort    │  ├──────┤ ├──────┤ ├──────┤  │
│ └─────────┘  ┌─Card─┐ ┌─Card─┐ ┌─Card─┐  │
│              │      │ │      │ │      │  │
│              └──────┘ └──────┘ └──────┘  │
│                                             │
│ [← Prev] [1] [2] [3] ... [Next →]         │
└────────────────────────────────────────────┘
```
- Desktop: sidebar filter + 3-col grid
- Mobile: collapsible filter + 1-col grid

### Course Detail Page
```
┌─────────────────────────────────────────────┐
│ ███████████ DARK HEADER SECTION ███████████ │
│ Breadcrumb > Category > Course              │
│                                             │
│ COURSE TITLE (Large, White)     ┌─────────┐│
│ Description (muted)             │ Preview  ││
│ [Bestseller] ⭐4.7 (1234)      │  Video   ││
│ Instructor • Updated • Level    │         ││
│                                 │₫499.000  ││
│                                 │[Mua ngay]││
│                                 │[Thêm GH] ││
│                                 └─────────┘│
├─────────────────────────────────────────────┤
│ Bạn sẽ học được gì:                        │
│ ✓ Point 1         ✓ Point 2               │
│ ✓ Point 3         ✓ Point 4               │
├─────────────────────────────────────────────┤
│ Nội dung khóa học:                         │
│ ▼ Phần 1 - Introduction    5 bài • 30 phút │
│   ├ Bài 1 - Welcome        ▶ Preview  10:00│
│   ├ Bài 2 - Setup          🔒         8:00 │
│ ▶ Phần 2 - Advanced        8 bài • 1 giờ  │
└─────────────────────────────────────────────┘
```
- Sticky purchase sidebar (desktop only, scrolls with page)
- Dark header gradient: `--surface-dark` to transparent
- Accordion for course sections

### Auth Pages (Login / Register)
```
┌──────────────────────────────────────────┐
│                                           │
│  [  Illustration  ]  │ Đăng nhập         │
│  [  (decorative)  ]  │                    │
│  [              ]    │ [Email ─────────]  │
│                      │ [  Tiếp tục   ]   │
│                      │                    │
│                      │ ── Hoặc ──        │
│                      │ [G] [Facebook]     │
│                      │                    │
│                      │ Chưa có tài khoản? │
│                      │ Đăng ký            │
└──────────────────────────────────────────┘
```
- 2-column: illustration left (50%) + form right (50%)
- Mobile: illustration hidden, form full-width
- Primary button: full-width indigo
- Social login: icon buttons in a row

---

## Component Library (shadcn/ui Customization)

### Buttons
| Variant | Style | Usage |
|---|---|---|
| `default` | Solid indigo bg, white text | Primary CTA |
| `outline` | Border indigo, indigo text | Secondary actions |
| `ghost` | No border, subtle hover bg | Tertiary, nav |
| `destructive` | Red bg, white text | Delete actions |
| `link` | Underline, indigo text | Inline links |

### Badges
| Variant | Style | Usage |
|---|---|---|
| Bestseller | Amber bg, dark text, small | Course popularity |
| Tag | Primary light bg, primary text | Prompt tags |
| Status | Color-coded by status | Admin panels |
| New | Indigo bg, white text | New items |

### DataTable (Admin)
- Striped rows, hover highlight
- Sortable column headers (click → asc/desc)
- Pagination footer (items per page selector + page navigation)
- Inline status badges
- Action column: edit/delete icon buttons

---

## Stitch Design Tracking

| Milestone | Screens | Stitch Status | Docs Synced |
|---|---|---|---|
| M0-M1 | Landing, Login, Register, Header, Footer | ⬜ | ⬜ |
| M2 | Prompt List, Prompt Detail, Admin Prompts | ⬜ | ⬜ |
| M3 | Course List, Course Detail, Player, Dashboard | ⬜ | ⬜ |
| M4 | Checkout, Payment Result, Admin Orders | ⬜ | ⬜ |
| M5 | Admin Dashboard, Settings, Support | ⬜ | ⬜ |
