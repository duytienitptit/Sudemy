import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Input helpers ────────────────────────────────────────────────────────────

function filterNameInput(e: React.FormEvent<HTMLInputElement>) {
  const input = e.currentTarget
  const filtered = input.value.replace(/[^\p{L}\s]/gu, '')
  if (filtered !== input.value) {
    const pos = input.selectionStart ?? filtered.length
    input.value = filtered
    const newPos = Math.min(pos, filtered.length)
    input.setSelectionRange(newPos, newPos)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

// ─── Validation schema ────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})
type LoginForm = z.infer<typeof loginSchema>

// ─── LoginPage ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, loginWithGoogle, authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname

  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    setServerError(null)
    try {
      const role = await login(values.email, values.password)
      // Redirect: honour "from" state (protected-route bounce) or fall back
      // to role-appropriate default (/admin for admins, / for students)
      const destination = from ?? (role === 'admin' ? '/admin' : '/')
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
        setServerError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
      } else if (code.includes('auth/too-many-requests')) {
        setServerError('Quá nhiều lần thử. Vui lòng thử lại sau ít phút.')
      } else {
        setServerError('Đăng nhập thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleGoogle = async () => {
    setServerError(null)
    try {
      const role = await loginWithGoogle()
      const destination = from ?? (role === 'admin' ? '/admin' : '/')
      navigate(destination, { replace: true })
    } catch (err: any) {
      console.error(err)
      setServerError(`Đăng nhập Google thất bại: ${err?.message || 'Lỗi không xác định'}`)
    }
  }

  return (
    <AuthPageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[420px] p-10 rounded-xl elevation-1 auth-card-xs"
      >
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-headline-lg text-headline-lg text-[var(--color-on-surface)] mb-2">
            Đăng nhập để tiếp tục học
          </h1>
          <p className="font-body-sm text-body-sm text-[var(--color-on-surface-variant)]">
            Chào mừng bạn quay trở lại với Sudemy.
          </p>
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 bg-[var(--color-error-container)] text-[var(--color-error)] rounded-lg px-4 py-3 mb-6 text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block font-label-md text-label-md text-[var(--color-on-surface)] mb-1.5">
              Địa chỉ Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              {...register('email')}
              className={inputClass(!!errors.email)}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block font-label-md text-label-md text-[var(--color-on-surface)]">
                Mật khẩu
              </label>
              <Link
                to="/forgot-password"
                className="font-label-sm text-label-sm text-[var(--color-primary)] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={inputClass(!!errors.password)}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg font-label-md text-label-md active:scale-[0.98] transform transition-all shadow-sm disabled:opacity-60"
          >
            {authLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {authLoading ? 'Đang xác thực...' : 'Tiếp tục'}
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-outline-variant)]"></div>
          </div>
          <span className="relative px-4 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] font-label-sm text-label-sm">
            Hoặc đăng nhập bằng
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--color-outline-variant)] rounded-lg hover:bg-[var(--color-surface-container)] transition-colors active:scale-[0.98] transform disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="font-label-md text-label-md text-[var(--color-on-surface-variant)]">Google</span>
        </button>

        <div className="mt-8 text-center">
          <p className="font-body-sm text-body-sm text-[var(--color-on-surface-variant)]">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[var(--color-primary)] font-label-md hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthPageShell>
  )
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Họ tên chỉ được chứa chữ cái và dấu cách'),
  email: z.string().trim().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số'),
})
type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser, loginWithGoogle, authLoading } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null)
    try {
      await registerUser(values)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      const code = axiosError.response?.data?.error?.code ?? ''
      if (code === 'EMAIL_EXISTS') {
        setServerError('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.')
      } else {
        setServerError(axiosError.response?.data?.error?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    }
  }

  const handleGoogle = async () => {
    setServerError(null)
    try {
      await loginWithGoogle()
      navigate('/', { replace: true })
    } catch (err: any) {
      console.error(err)
      setServerError(`Đăng nhập Google thất bại: ${err?.message || 'Lỗi không xác định'}`)
    }
  }

  return (
    <AuthPageShell>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-[420px] p-10 rounded-xl elevation-1 auth-card-xs"
      >
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-headline-lg text-headline-lg text-[var(--color-on-surface)] mb-2">
            Tạo tài khoản miễn phí
          </h1>
          <p className="font-body-sm text-body-sm text-[var(--color-on-surface-variant)]">
            Bắt đầu hành trình học tập cùng Sudemy.
          </p>
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 bg-[var(--color-error-container)] text-[var(--color-error)] rounded-lg px-4 py-3 mb-6 text-sm"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="reg-fullname" className="block font-label-md text-label-md text-[var(--color-on-surface)] mb-1.5">
              Họ và tên
            </label>
            <input
              id="reg-fullname"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              inputMode="text"
              {...register('fullName')}
              onInput={filterNameInput}
              className={inputClass(!!errors.fullName)}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div>
            <label htmlFor="reg-email" className="block font-label-md text-label-md text-[var(--color-on-surface)] mb-1.5">
              Địa chỉ Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              {...register('email')}
              className={inputClass(!!errors.email)}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <label htmlFor="reg-password" className="block font-label-md text-label-md text-[var(--color-on-surface)] mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự"
                {...register('password')}
                className={inputClass(!!errors.password)}
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {[
                { label: '8+ ký tự', re: /.{8,}/ },
                { label: 'Chữ hoa', re: /[A-Z]/ },
                { label: 'Chữ thường', re: /[a-z]/ },
                { label: 'Số', re: /[0-9]/ },
              ].map(({ label }) => (
                <span key={label} className="text-[11px] font-medium text-[var(--color-on-surface-variant)] opacity-80">
                  · {label}
                </span>
              ))}
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] rounded-lg font-label-md text-label-md active:scale-[0.98] transform transition-all shadow-sm disabled:opacity-60"
          >
            {authLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {authLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-outline-variant)]"></div>
          </div>
          <span className="relative px-4 bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface-variant)] font-label-sm text-label-sm">
            Hoặc
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={authLoading}
          className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--color-outline-variant)] rounded-lg hover:bg-[var(--color-surface-container)] transition-colors active:scale-[0.98] transform disabled:opacity-50"
        >
          <GoogleIcon />
          <span className="font-label-md text-label-md text-[var(--color-on-surface-variant)]">Tiếp tục với Google</span>
        </button>

        <div className="mt-8 text-center">
          <p className="font-body-sm text-body-sm text-[var(--color-on-surface-variant)]">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-label-md hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthPageShell>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Full-page wrapper: 2-column layout on desktop, center card on mobile */
function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row items-center justify-center max-w-[1280px] mx-auto px-4 md:px-8 gap-8 py-12 bg-[var(--color-surface)]">
      {/* LEFT: Illustration (Hidden on mobile) */}
      <div id="auth-illustration-panel" className="hidden md:flex w-1/2 flex-col items-center justify-center">
        <div className="relative w-full max-w-lg aspect-square">
          <img 
            alt="Education Illustration" 
            src="/illustration-learning.png" 
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
            onError={() => {
              const panel = document.getElementById('auth-illustration-panel')
              if (panel) panel.style.display = 'none'
            }}
          />
        </div>
        <div className="mt-8 text-center max-w-md">
          <h2 className="font-headline-md text-headline-md text-[var(--color-primary)] mb-3">
            Tương lai của giáo dục là AI
          </h2>
          <p className="font-body-md text-body-md text-[var(--color-on-surface-variant)]">
            Trải nghiệm nền tảng học tập thông minh nhất Việt Nam với lộ trình cá nhân hóa cho từng học viên.
          </p>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        {children}
      </div>
    </main>
  )
}

function inputClass(hasError: boolean) {
  const base =
    'w-full px-4 py-3 rounded-lg border focus:ring-2 transition-all outline-none font-body-md text-body-md bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50'
  const normal =
    'border-[var(--color-outline-variant)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/20 hover:border-[var(--color-outline)]'
  const error = 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
  return `${base} ${hasError ? error : normal}`
}

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="text-[12px] font-medium text-[var(--color-error)] mt-1.5 flex items-center gap-1"
        >
          <AlertCircle size={12} strokeWidth={2.5} />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.14-4.53z" fill="#EA4335"></path>
    </svg>
  )
}
