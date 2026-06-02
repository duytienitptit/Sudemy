import type { ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  LayoutDashboardIcon,
  UserIcon,
  LogOutIcon,
  BookOpenIcon,
} from '@/components/ui/Icons'

// ─── Sidebar nav items ────────────────────────────────────────────────────────

import { MessageSquare, Ticket, Settings, ShoppingBag, Zap, ExternalLink } from 'lucide-react'

const adminNavItems = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboardIcon, exact: true },
  { label: 'Người dùng', to: '/admin/users', icon: UserIcon },
  { label: 'Khóa học', to: '/admin/courses', icon: BookOpenIcon },
  { label: 'Đơn hàng', to: '/admin/orders', icon: ShoppingBag },
  { label: 'Coupon', to: '/admin/coupons', icon: Ticket },
  { label: 'Flash Sale', to: '/admin/flash-sales', icon: Zap },
  { label: 'Prompts', to: '/admin/prompts', icon: MessageSquare },
  { label: 'Hỗ trợ', to: '/admin/tickets', icon: MessageSquare },
  { label: 'Cài đặt', to: '/admin/settings', icon: Settings },
]

// ─── AdminLayout ──────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: ReactNode
}

/**
 * Admin layout skeleton: fixed sidebar + scrollable content area.
 * Sidebar nav items will expand as admin features are implemented.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-background)]">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside
        id="admin-sidebar"
        className="w-56 shrink-0 flex flex-col
          bg-[var(--color-surface-container-lowest)]
          border-r border-[var(--color-outline-variant)]"
        aria-label="Admin navigation"
      >
        {/* Logo / Brand */}
        <div className="h-16 flex items-center px-4 border-b border-[var(--color-outline-variant)] shrink-0">
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold text-[var(--color-on-surface)]">
              Sude<span className="text-[var(--color-primary)]">my</span>
              <span className="text-label-sm text-[var(--color-on-surface-variant)] font-normal ml-1">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]'
                  }`}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            )
          })}

          {/* Divider */}
          <div className="border-t border-[var(--color-outline-variant)] my-2" />

          {/* View Website button */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm font-medium transition-colors
              text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)]"
          >
            <ExternalLink size={16} />
            Xem Website
          </a>
        </nav>

        {/* Footer: user + theme + logout */}
        <div className="shrink-0 border-t border-[var(--color-outline-variant)] p-3 flex flex-col gap-2">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[var(--color-surface-container)]">
              <div className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-label-sm font-semibold shrink-0">
                {user.fullName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-sm font-medium text-[var(--color-on-surface)] truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-label-sm text-[var(--color-on-surface-variant)] truncate">Admin</p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              className="flex items-center gap-1.5 text-label-sm text-[var(--color-error)]
                hover:bg-[var(--color-error-container)] px-2 py-1.5 rounded-lg transition-colors"
            >
              <LogOutIcon size={14} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        id="admin-main-content"
        className="flex-1 overflow-y-auto"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  )
}
