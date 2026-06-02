import { Resend } from 'resend'
import { env } from '@/config/env'
import { logger } from '@/config/logger'

// ─── Lazy singleton — only initialised when RESEND_API_KEY is present ─────────

let _resend: Resend | null = null

export function _resetResend() {
  _resend = null
}

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY)
  return _resend
}

// ─── sendWelcomeEmail ─────────────────────────────────────────────────────────

/**
 * Send a welcome email to a newly registered user.
 *
 * Silently skips (with a warning log) when RESEND_API_KEY is not configured
 * so that local dev and tests work without credentials.
 */
export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  const resend = getResend()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping welcome email', { to })
    return
  }

  const from = env.RESEND_FROM_EMAIL ?? 'no-reply@sudemy.vn'

  try {
    await resend.emails.send({
      from,
      to,
      subject: 'Chào mừng bạn đến với Sudemy! 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Xin chào, ${fullName}! 👋</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Sudemy</strong> — nền tảng học AI thực chiến hàng đầu Việt Nam.</p>
          <p>Hãy bắt đầu hành trình học tập của bạn ngay hôm nay và khám phá thư viện AI Prompt miễn phí!</p>
          <a href="${env.CLIENT_URL}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Bắt đầu học ngay →
          </a>
          <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb;" />
          <p style="color:#9ca3af;font-size:12px;">Sudemy · AI Courses for Everyone</p>
        </div>
      `,
    })

    logger.info('Welcome email sent', { to })
  } catch (err) {
    // Never let email failure block registration
    logger.error('Failed to send welcome email', { to, error: (err as Error).message })
  }
}

// ─── sendTicketReplyEmail ─────────────────────────────────────────────────────

/**
 * Send an email notification when a support ticket receives a reply.
 */
export async function sendTicketReplyEmail(
  to: string,
  fullName: string,
  ticketSubject: string,
  replyMessage: string,
): Promise<void> {
  const resend = getResend()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping ticket reply email', { to })
    return
  }

  const from = env.RESEND_FROM_EMAIL ?? 'no-reply@sudemy.vn'

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Phản hồi từ Sudemy: ${ticketSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Xin chào, ${fullName}! 👋</h2>
          <p>Yêu cầu hỗ trợ của bạn <strong>"${ticketSubject}"</strong> vừa nhận được phản hồi từ ban quản trị Sudemy:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; font-style: italic; color: #374151;">
            ${replyMessage.replace(/\n/g, '<br>')}
          </div>
          <p>Bạn có thể đăng nhập vào tài khoản của mình trên Sudemy để xem chi tiết và phản hồi thêm nếu cần thiết.</p>
          <a href="${env.CLIENT_URL}/dashboard/tickets" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Xem chi tiết →
          </a>
          <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb;" />
          <p style="color:#9ca3af;font-size:12px;">Sudemy · AI Courses for Everyone</p>
        </div>
      `,
    })

    logger.info('Ticket reply email sent', { to })
  } catch (err) {
    logger.error('Failed to send ticket reply email', { to, error: (err as Error).message })
  }
}

// ─── sendPurchaseConfirmationEmail ─────────────────────────────────────────────

/**
 * Send an email notification when a purchase is successful.
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  fullName: string,
  courseTitle: string,
  orderAmount: number,
  orderId: string,
): Promise<void> {
  const resend = getResend()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping purchase confirmation email', { to })
    return
  }

  const from = env.RESEND_FROM_EMAIL ?? 'no-reply@sudemy.vn'
  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderAmount)

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Xác nhận thanh toán thành công - ${courseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Cảm ơn ${fullName} đã mua khóa học! 🎉</h2>
          <p>Thanh toán của bạn cho khóa học <strong>"${courseTitle}"</strong> đã thành công.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Mã đơn hàng:</strong> ${orderId}</p>
            <p style="margin: 8px 0 0 0;"><strong>Số tiền:</strong> ${formattedAmount}</p>
          </div>
          <p>Bạn đã có thể bắt đầu học ngay bây giờ!</p>
          <a href="${env.CLIENT_URL}/dashboard/courses" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Vào lớp học →
          </a>
          <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb;" />
          <p style="color:#9ca3af;font-size:12px;">Sudemy · AI Courses for Everyone</p>
        </div>
      `,
    })

    logger.info('Purchase confirmation email sent', { to, orderId })
  } catch (err) {
    logger.error('Failed to send purchase confirmation email', { to, error: (err as Error).message })
  }
}

// ─── sendCertificateEmail ─────────────────────────────────────────────────────

/**
 * Send an email notification when a user earns a certificate.
 */
export async function sendCertificateEmail(
  to: string,
  fullName: string,
  courseTitle: string,
  certificateUrl: string,
): Promise<void> {
  const resend = getResend()

  if (!resend) {
    logger.warn('RESEND_API_KEY not configured — skipping certificate email', { to })
    return
  }

  const from = env.RESEND_FROM_EMAIL ?? 'no-reply@sudemy.vn'

  try {
    await resend.emails.send({
      from,
      to,
      subject: `Chúc mừng bạn đã hoàn thành khóa học - ${courseTitle} 🎓`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; text-align: center;">
          <h2 style="color: #6366f1;">Chúc mừng ${fullName}! 🎓</h2>
          <p>Bạn đã xuất sắc hoàn thành khóa học <strong>"${courseTitle}"</strong> tại Sudemy.</p>
          <p>Chứng nhận hoàn thành khóa học của bạn đã sẵn sàng!</p>
          <a href="${certificateUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Xem chứng nhận của bạn →
          </a>
          <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb;" />
          <p style="color:#9ca3af;font-size:12px;">Sudemy · AI Courses for Everyone</p>
        </div>
      `,
    })

    logger.info('Certificate email sent', { to })
  } catch (err) {
    logger.error('Failed to send certificate email', { to, error: (err as Error).message })
  }
}
