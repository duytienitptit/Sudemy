import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
  UserIcon,
  LayoutDashboardIcon,
  LogOutIcon,
} from '@/components/ui/Icons'

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link
      to="/"
      id="header-logo"
      className="flex items-center gap-2 group shrink-0"
      aria-label="Sudemy – Trang chủ"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
          bg-[var(--color-primary)] group-hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        S
      </div>
      <span className="font-bold text-lg text-[var(--color-on-surface)] tracking-tight">
        Sude<span className="text-[var(--color-primary)]">my</span>
      </span>
    </Link>
  )
}

// ─── Nav Links ────────────────────────────────────────────────────────────────

const navItems = [
  { label: 'Khóa học', to: '/courses' },
  { label: 'Thư viện Prompt', to: '/prompts' },
] as const

function NavLinks({ onClose }: { onClose?: () => void }) {
  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            `text-body-sm font-medium px-3 py-2 rounded-md transition-colors whitespace-nowrap
            ${
              isActive
                ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)]'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}



// ─── User Menu (authenticated) ────────────────────────────────────────────────

function UserMenu() {
  const { user, logout, authLoading } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!user) return null

  const initials = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        id="user-menu-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu tài khoản"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors
          hover:bg-[var(--color-surface-container)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center
            text-label-sm font-semibold shrink-0"
        >
          {initials}
        </div>
        <span className="hidden lg:block text-body-sm font-medium text-[var(--color-on-surface)] max-w-[120px] truncate">
          {user.fullName || user.email}
        </span>
        <ChevronDownIcon
          size={14}
          className={`text-[var(--color-on-surface-variant)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl
            bg-[var(--color-surface-container-lowest)]
            border border-[var(--color-outline-variant)]
            shadow-[var(--shadow-modal)] z-[var(--z-dropdown)]
            py-1 animate-in fade-in slide-in-from-top-1"
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--color-outline-variant)]">
            <p className="text-label-md text-[var(--color-on-surface)] truncate">{user.fullName}</p>
            <p className="text-label-sm text-[var(--color-on-surface-variant)] truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              to="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-[var(--color-on-surface)]
                hover:bg-[var(--color-surface-container)] transition-colors"
            >
              <LayoutDashboardIcon size={15} className="text-[var(--color-on-surface-variant)]" />
              Dashboard
            </Link>
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-[var(--color-on-surface)]
                hover:bg-[var(--color-surface-container)] transition-colors"
            >
              <UserIcon size={15} className="text-[var(--color-on-surface-variant)]" />
              Hồ sơ
            </Link>
          </div>

          {user.role === 'admin' && (
            <div className="py-1 border-t border-[var(--color-outline-variant)]">
              <Link
                to="/admin"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-body-sm text-[var(--color-primary)]
                  hover:bg-[var(--color-primary-light)] transition-colors font-medium"
              >
                Admin Panel
              </Link>
            </div>
          )}

          {/* Logout */}
          <div className="py-1 border-t border-[var(--color-outline-variant)]">
            <button
              role="menuitem"
              disabled={authLoading}
              onClick={async () => {
                setOpen(false)
                await logout()
                navigate('/')
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-body-sm text-[var(--color-error)]
                hover:bg-[var(--color-error-container)] transition-colors disabled:opacity-50"
            >
              <LogOutIcon size={15} />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Auth Buttons (unauthenticated) ───────────────────────────────────────────

function AuthButtons({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        id="header-login-btn"
        to="/login"
        onClick={onClose}
        className="px-4 py-2 text-body-sm font-medium rounded-lg transition-colors
          text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]
          hover:bg-[var(--color-surface-container)]"
      >
        Đăng nhập
      </Link>
      <Link
        id="header-signup-btn"
        to="/register"
        onClick={onClose}
        className="px-4 py-2 text-body-sm font-semibold rounded-lg transition-colors
          bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
          text-[var(--color-on-primary)] shadow-sm"
      >
        Đăng ký
      </Link>
    </div>
  )
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────

function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { user } = useAuth()



  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[var(--z-overlay)] md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-[var(--z-modal)] md:hidden
          bg-[var(--color-surface-container-lowest)]
          border-l border-[var(--color-outline-variant)]
          shadow-[var(--shadow-modal)] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-outline-variant)]">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Đóng menu"
            className="p-2 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
          >
            <CloseIcon size={20} />
          </button>
        </div>



        {/* Nav links */}
        <nav className="flex flex-col p-4 gap-1 flex-1">
          <NavLinks onClose={onClose} />
        </nav>

        {/* Auth section */}
        <div className="p-4 border-t border-[var(--color-outline-variant)]">
          {user ? (
            <UserMenu />
          ) : (
            <AuthButtons onClose={onClose} />
          )}
        </div>
      </div>
    </>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const { user, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)



  return (
    <>
      <header
        id="site-header"
        className="sticky top-0 z-[var(--z-sticky)] w-full
          bg-[var(--color-surface-container-lowest)]/90
          border-b border-[var(--color-outline-variant)]
          backdrop-blur-md"
      >
        <div className="container-sudemy">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="Điều hướng chính">
              <NavLinks />
            </nav>

            {/* Spacer */}
            <div className="flex-1" />



            {/* Right side */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {!loading && (
                <>
                  {user ? (
                    <UserMenu />
                  ) : (
                    <div className="hidden md:flex">
                      <AuthButtons />
                    </div>
                  )}
                </>
              )}

              {/* Hamburger — mobile only */}
              <button
                id="mobile-menu-trigger"
                className="md:hidden p-2 rounded-lg transition-colors
                  hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu"
                aria-expanded={mobileOpen}
              >
                <MenuIcon size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer (portal-style via portal in DOM) */}
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
