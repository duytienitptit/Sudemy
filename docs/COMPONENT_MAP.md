# Component Map — React Component Tree

> All components use TypeScript + TailwindCSS v4 + shadcn/ui.
> Naming: `[Feature][Type].tsx` for components, `[PageName]Page.tsx` for pages.

---

## Layout Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `Header` | Top nav bar, logo, nav links, auth buttons, theme toggle | `user?: IUser` | `GET /settings` |
| `Footer` | Site footer, social links, legal links | — | `GET /settings` |
| `Sidebar` | Admin sidebar navigation | `role: UserRole` | — |
| `AdminLayout` | Wrapper for admin pages (sidebar + content area) | `children` | — |
| `StudentLayout` | Wrapper for dashboard pages (header + content) | `children` | — |
| `ThemeToggle` | Dark/Light mode switch button | — | — |

## Shared / Reusable Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `CourseCard` | Course preview card (thumbnail, title, price, rating) | `course: ICourse` | — |
| `PromptCard` | Prompt preview card (title, tags, copy count) | `prompt: IPrompt` | — |
| `TagBadge` | Colored tag label | `tag: ITag` | — |
| `Pagination` | Page navigation with prev/next + page numbers | `page, totalPages, onChange` | — |
| `SearchBar` | Search input with debounce | `value, onChange, placeholder` | — |
| `LoadingSpinner` | Animated loading indicator | `size?: 'sm' \| 'md' \| 'lg'` | — |
| `EmptyState` | Empty content placeholder with icon + message | `icon, title, description, action?` | — |
| `ConfirmDialog` | Modal confirmation dialog | `title, message, onConfirm, onCancel` | — |
| `StatusBadge` | Color-coded status label | `status: string, variant` | — |
| `DataTable` | Sortable, paginated table for admin | `columns, data, pagination` | — |

## Landing Page Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `HeroSection` | Hero banner with tagline + CTAs | — | `GET /settings` |
| `FeaturedCourses` | Grid of featured/popular courses | — | `GET /courses?limit=6` |
| `StatsSection` | Platform statistics (prompts, courses, students) | — | `GET /admin/stats` |
| `TestimonialSlider` | Auto-scrolling testimonial carousel | `testimonials[]` | Seed data |
| `FlashSaleBanner` | Countdown banner for active flash sale | — | `GET /flash-sales/active` |

## Course Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `CourseFilter` | Filter sidebar (topic, price, sort) | `filters, onChange` | — |
| `CourseGrid` | Responsive grid of CourseCards | `courses[]` | — |
| `CourseDetail` | Full course info (description, lessons, reviews, buy) | `course: ICourse` | `GET /courses/:slug` |
| `LessonList` | Ordered list of lessons with lock/free icons | `lessons[], purchased` | — |
| `ReviewSection` | Course reviews/ratings display | `ratings` | — |

## Prompt Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `PromptFilter` | Filter by tags (tool + purpose) | `tags[], selectedTags, onChange` | `GET /tags` |
| `PromptGrid` | Responsive grid of PromptCards | `prompts[]` | — |
| `PromptDetail` | Full prompt page (content, copy button, related courses) | `prompt: IPrompt` | `GET /prompts/:slug` |
| `CopyButton` | One-click copy to clipboard with feedback | `text: string, promptId` | `POST /prompts/:id/copy` |

## Course Player Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `VideoPlayer` | YouTube embedded player | `youtubeUrl: string` | — |
| `LessonSidebar` | Lesson list with completion checkmarks | `lessons[], progress` | `GET /progress/:courseId` |
| `QuizModal` | Quiz modal with questions + submit | `quiz: IQuizQuestion[]` | `POST /lessons/:id/quiz/submit` |
| `ProgressBar` | Course completion progress bar | `percent: number` | — |
| `LessonNavigation` | Previous/Next lesson buttons | `currentIndex, lessons[]` | — |

## Student Dashboard Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `MyCourses` | Grid of purchased courses with progress | — | `GET /auth/me`, courses |
| `OrderHistory` | Table of past orders | — | `GET /orders/my` |
| `CertificateList` | List of earned certificates with download | — | `GET /certificates` |
| `ProgressOverview` | Summary of all course progress | — | `GET /progress` |

## Admin Components

| Component | Description | Props | API Deps |
|---|---|---|---|
| `StatsCard` | Single metric card (icon, value, label, trend) | `title, value, icon, change` | — |
| `RichTextEditor` | WYSIWYG editor for course descriptions | `value, onChange` | — |
| `ImageUploader` | Drag-and-drop image upload with preview | `onUpload, currentUrl?` | — |
| `CouponForm` | Create/edit coupon form | `coupon?, onSubmit` | — |
| `FlashSaleForm` | Create/edit flash sale form | `flashSale?, onSubmit` | — |

---

## Page Components

| Page | Route | Auth | Components Used |
|---|---|---|---|
| `LandingPage` | `/` | Public | Hero, FeaturedCourses, Stats, Testimonials, FlashSaleBanner |
| `CoursesPage` | `/courses` | Public | CourseFilter, CourseGrid, Pagination, SearchBar |
| `CourseDetailPage` | `/courses/:slug` | Public | CourseDetail, LessonList, ReviewSection |
| `PromptsPage` | `/prompts` | Public | PromptFilter, PromptGrid, Pagination, SearchBar |
| `PromptDetailPage` | `/prompts/:slug` | Public | PromptDetail, CopyButton, TagBadge |
| `LoginPage` | `/login` | Public | Form (email, password, Google button) |
| `RegisterPage` | `/register` | Public | Form (name, email, password) |
| `DashboardPage` | `/dashboard` | User | MyCourses, ProgressOverview, OrderHistory |
| `LearnPage` | `/learn/:courseSlug/:lessonSlug` | User | VideoPlayer, LessonSidebar, QuizModal, ProgressBar |
| `SupportPage` | `/support` | User | Ticket form, ticket list |
| `CertificatesPage` | `/certificates` | User | CertificateList |
| `CertificateVerifyPage` | `/certificates/verify/:code` | Public | Certificate display |
| `AdminDashboardPage` | `/admin` | Admin | StatsCard grid |
| `AdminCoursesPage` | `/admin/courses` | Admin/Editor | DataTable, StatusBadge |
| `AdminLessonsPage` | `/admin/courses/:id/lessons` | Admin/Editor | DataTable, RichTextEditor |
| `AdminPromptsPage` | `/admin/prompts` | Admin/Editor | DataTable |
| `AdminTagsPage` | `/admin/tags` | Admin/Editor | DataTable, TagBadge |
| `AdminOrdersPage` | `/admin/orders` | Admin/Mod | DataTable, StatusBadge |
| `AdminUsersPage` | `/admin/users` | Admin | DataTable |
| `AdminCouponsPage` | `/admin/coupons` | Admin/Mod | DataTable, CouponForm |
| `AdminFlashSalesPage` | `/admin/flash-sales` | Admin | DataTable, FlashSaleForm |
| `AdminTicketsPage` | `/admin/tickets` | Admin/Mod | DataTable, StatusBadge |
| `AdminSettingsPage` | `/admin/settings` | Admin | Form, ImageUploader |
