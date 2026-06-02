import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Calendar, Shield } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  editor: 'Biên tập viên',
  moderator: 'Điều phối viên',
  user: 'Học viên',
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export default function ProfilePage() {
  const { user } = useAuth()

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
    <>
      <Helmet>
        <title>Hồ sơ cá nhân | Sudemy</title>
        <meta name="description" content="Xem và quản lý thông tin tài khoản Sudemy của bạn." />
      </Helmet>

      <div className="container-sudemy py-12 max-w-2xl">
        <h1 className="text-headline-lg text-[var(--color-on-surface)] mb-8">Hồ sơ cá nhân</h1>

        {/* Avatar + Name Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-[var(--shadow-card)]">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg shadow-[var(--color-primary)]/20">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-headline-md text-[var(--color-on-surface)] mb-1">
              {user.fullName || 'Người dùng'}
            </h2>
            <p className="text-body-sm text-[var(--color-on-surface-variant)]">{user.email}</p>

            {/* Role badge */}
            <span className="inline-block mt-3 px-3 py-1 rounded-full text-label-sm font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
          <div className="px-6 py-4 border-b border-[var(--color-outline-variant)]">
            <h3 className="text-label-md text-[var(--color-on-surface)]">Thông tin tài khoản</h3>
          </div>

          <ul className="divide-y divide-[var(--color-outline-variant)]">
            <li className="flex items-center gap-4 px-6 py-4">
              <User size={18} className="text-[var(--color-on-surface-variant)] shrink-0" />
              <div>
                <p className="text-label-sm text-[var(--color-on-surface-variant)]">Họ và tên</p>
                <p className="text-body-md text-[var(--color-on-surface)] font-medium">
                  {user.fullName || '—'}
                </p>
              </div>
            </li>

            <li className="flex items-center gap-4 px-6 py-4">
              <Mail size={18} className="text-[var(--color-on-surface-variant)] shrink-0" />
              <div>
                <p className="text-label-sm text-[var(--color-on-surface-variant)]">Email</p>
                <p className="text-body-md text-[var(--color-on-surface)] font-medium">{user.email}</p>
              </div>
            </li>

            <li className="flex items-center gap-4 px-6 py-4">
              <Shield size={18} className="text-[var(--color-on-surface-variant)] shrink-0" />
              <div>
                <p className="text-label-sm text-[var(--color-on-surface-variant)]">Vai trò</p>
                <p className="text-body-md text-[var(--color-on-surface)] font-medium">
                  {ROLE_LABELS[user.role] ?? user.role}
                </p>
              </div>
            </li>

            {user.createdAt && (
              <li className="flex items-center gap-4 px-6 py-4">
                <Calendar size={18} className="text-[var(--color-on-surface-variant)] shrink-0" />
                <div>
                  <p className="text-label-sm text-[var(--color-on-surface-variant)]">Ngày tạo tài khoản</p>
                  <p className="text-body-md text-[var(--color-on-surface)] font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </li>
            )}

            <li className="flex items-center gap-4 px-6 py-4">
              <div className="w-[18px] shrink-0" />
              <div>
                <p className="text-label-sm text-[var(--color-on-surface-variant)]">Khóa học đã mua</p>
                <p className="text-body-md text-[var(--color-on-surface)] font-medium">
                  {user.purchasedCourses?.length ?? 0} khóa học
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
