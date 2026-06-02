import { useQuery } from '@tanstack/react-query'
import { getCertificates } from '@/services/progress.service'
import { Award, Download } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function CertificateList() {
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: getCertificates,
  })

  if (isLoading) {
    return <div className="text-center py-4 text-[var(--color-on-surface-variant)]">Đang tải chứng chỉ...</div>
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-10 h-10 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-30" />
        <p className="text-body-md text-[var(--color-on-surface-variant)]">
          Bạn chưa có chứng chỉ nào. Hãy hoàn thành các khóa học 100% để nhận chứng chỉ nhé!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <div key={cert._id} className="flex items-center justify-between p-4 bg-[var(--color-surface-variant)]/20 border border-[var(--color-surface-variant)] rounded-xl hover:border-[var(--color-primary)] transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)]/20 flex items-center justify-center text-[var(--color-primary)]">
              <Award size={24} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                Chứng chỉ: {cert.courseId?.title || 'Khóa học'}
              </h4>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">
                Cấp ngày: {formatDate(cert.issuedAt)} • Mã xác minh: <span className="font-mono font-medium text-[var(--color-on-surface)]">{cert.verificationCode}</span>
              </p>
            </div>
          </div>
          <button className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors" title="Tải xuống chứng chỉ">
            <Download size={20} />
          </button>
        </div>
      ))}
    </div>
  )
}
