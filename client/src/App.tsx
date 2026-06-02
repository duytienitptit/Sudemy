import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute, AdminRoute } from '@/components/auth/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/auth/AuthPages').then((m) => ({ default: m.default })))
const RegisterPage = lazy(() => import('@/pages/auth/AuthPages').then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const PromptsList = lazy(() => import('@/pages/PromptsList').then(m => ({ default: m.PromptsList })))
const PromptDetail = lazy(() => import('@/pages/PromptDetail').then(m => ({ default: m.PromptDetail })))

const CoursesList = lazy(() => import('@/pages/CoursesList').then(m => ({ default: m.CoursesList })))
const CourseDetail = lazy(() => import('@/pages/CourseDetail').then(m => ({ default: m.CourseDetail })))


const AdminPromptsPage = lazy(() => import('@/pages/admin/AdminPromptsPage'))
const AdminCoursesPage = lazy(() => import('@/pages/admin/AdminCoursesPage'))
const AdminLessonsPage = lazy(() => import('@/pages/admin/AdminLessonsPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminTicketsPage = lazy(() => import('@/pages/admin/AdminTicketsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'))
const AdminFlashSalesPage = lazy(() => import('@/pages/admin/AdminFlashSalesPage'))

const LearnPage = lazy(() => import('@/pages/LearnPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))
const TicketDetailPage = lazy(() => import('@/pages/TicketDetailPage'))

const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage'))
const PaymentCancelPage = lazy(() => import('@/pages/PaymentCancelPage'))
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'))

// ─── Fallback ─────────────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin"
        role="status"
        aria-label="Đang tải trang..."
      />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public pages (MainLayout) ── */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />
            <Route
              path="/prompts"
              element={
                <MainLayout>
                  <PromptsList />
                </MainLayout>
              }
            />
            <Route
              path="/prompts/:slug"
              element={
                <MainLayout>
                  <PromptDetail />
                </MainLayout>
              }
            />
            <Route
              path="/courses"
              element={
                <MainLayout>
                  <CoursesList />
                </MainLayout>
              }
            />
            <Route
              path="/courses/:slug"
              element={
                <MainLayout>
                  <CourseDetail />
                </MainLayout>
              }
            />

            {/* Auth pages — no footer needed */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Protected pages (MainLayout) ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SupportPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/support/:id"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <TicketDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Payment result pages (public, MainLayout) ── */}
            <Route
              path="/payment/success"
              element={
                <MainLayout>
                  <PaymentSuccessPage />
                </MainLayout>
              }
            />
            <Route
              path="/payment/cancel"
              element={
                <MainLayout>
                  <PaymentCancelPage />
                </MainLayout>
              }
            />

            {/* ── Profile (protected) ── */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProfilePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Order history (protected) ── */}
            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <OrderHistoryPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Learning Interface (Standalone Layout) ── */}
            <Route
              path="/learn/:courseSlug"
              element={
                <ProtectedRoute>
                  <LearnPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:courseSlug/:lessonSlug"
              element={
                <ProtectedRoute>
                  <LearnPage />
                </ProtectedRoute>
              }
            />

            {/* ── Admin pages (AdminLayout) ── */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="" element={<AdminDashboardPage />} />
                      <Route path="users" element={<AdminUsersPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="tickets" element={<AdminTicketsPage />} />

                      <Route path="prompts" element={<AdminPromptsPage />} />
                      <Route path="courses" element={<AdminCoursesPage />} />
                      <Route path="courses/:id/lessons" element={<AdminLessonsPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="coupons" element={<AdminCouponsPage />} />
                      <Route path="flash-sales" element={<AdminFlashSalesPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* ── 404 ── */}
            <Route
              path="*"
              element={
                <MainLayout>
                  <NotFoundPage />
                </MainLayout>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
