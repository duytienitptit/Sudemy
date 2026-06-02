import { sendWelcomeEmail, sendTicketReplyEmail, sendPurchaseConfirmationEmail, sendCertificateEmail, _resetResend } from '../lib/email'
import { env } from '../config/env'
import { logger } from '../config/logger'

import { Resend } from 'resend'

jest.mock('resend')

const mockSend = jest.fn()
beforeEach(() => {
  mockSend.mockClear()
  ;(Resend as jest.Mock).mockImplementation(() => {
    return {
      emails: {
        send: mockSend,
      },
    }
  })
})


// Mock the logger
jest.mock('../config/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}))

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when RESEND_API_KEY is not set', () => {
    const originalApiKey = env.RESEND_API_KEY

    beforeEach(() => {
      // Temporarily unset API key
      // The getter function getResend() reads from env.RESEND_API_KEY directly each time
      // But we can manipulate the property if it's not frozen.
      // Alternatively, we use Object.defineProperty
      Object.defineProperty(env, 'RESEND_API_KEY', { value: undefined, configurable: true })
      
      // We need to clear the _resend singleton from the module cache but that's tricky.
      // Fortunately getResend checks `!env.RESEND_API_KEY` first.
    })

    afterEach(() => {
      Object.defineProperty(env, 'RESEND_API_KEY', { value: originalApiKey, configurable: true })
    })

    it('should skip sendWelcomeEmail and log a warning', async () => {
      await sendWelcomeEmail('test@example.com', 'Test User')
      expect(mockSend).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith('RESEND_API_KEY not configured — skipping welcome email', { to: 'test@example.com' })
    })

    it('should skip sendTicketReplyEmail and log a warning', async () => {
      await sendTicketReplyEmail('test@example.com', 'Test User', 'Issue 1', 'Reply body')
      expect(mockSend).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith('RESEND_API_KEY not configured — skipping ticket reply email', { to: 'test@example.com' })
    })
    
    it('should skip sendPurchaseConfirmationEmail and log a warning', async () => {
      await sendPurchaseConfirmationEmail('test@example.com', 'Test User', 'React 19', 499000, 'ORDER123')
      expect(mockSend).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith('RESEND_API_KEY not configured — skipping purchase confirmation email', { to: 'test@example.com' })
    })

    it('should skip sendCertificateEmail and log a warning', async () => {
      await sendCertificateEmail('test@example.com', 'Test User', 'React 19', 'http://cert.url')
      expect(mockSend).not.toHaveBeenCalled()
      expect(logger.warn).toHaveBeenCalledWith('RESEND_API_KEY not configured — skipping certificate email', { to: 'test@example.com' })
    })
  })

  describe('when RESEND_API_KEY is set', () => {
    const originalApiKey = env.RESEND_API_KEY

    beforeEach(() => {
      Object.defineProperty(env, 'RESEND_API_KEY', { value: 're_123456789', configurable: true })
      _resetResend()
    })

    afterEach(() => {
      Object.defineProperty(env, 'RESEND_API_KEY', { value: originalApiKey, configurable: true })
      _resetResend()
    })

    it('sendWelcomeEmail sends correct data', async () => {
      mockSend.mockResolvedValueOnce({ id: 'msg_123' })
      
      await sendWelcomeEmail('user@example.com', 'John Doe')
      
      expect(mockSend).toHaveBeenCalledTimes(1)
      const callArg = mockSend.mock.calls[0][0]
      expect(callArg.to).toBe('user@example.com')
      expect(callArg.subject).toContain('Chào mừng')
      expect(callArg.html).toContain('John Doe')
      expect(logger.info).toHaveBeenCalledWith('Welcome email sent', { to: 'user@example.com' })
    })

    it('sendTicketReplyEmail sends correct data', async () => {
      mockSend.mockResolvedValueOnce({ id: 'msg_124' })
      
      await sendTicketReplyEmail('user@example.com', 'John Doe', 'Login Error', 'Please clear cache.')
      
      expect(mockSend).toHaveBeenCalledTimes(1)
      const callArg = mockSend.mock.calls[0][0]
      expect(callArg.to).toBe('user@example.com')
      expect(callArg.subject).toContain('Login Error')
      expect(callArg.html).toContain('Please clear cache.')
      expect(logger.info).toHaveBeenCalledWith('Ticket reply email sent', { to: 'user@example.com' })
    })

    it('sendPurchaseConfirmationEmail sends correct data', async () => {
      mockSend.mockResolvedValueOnce({ id: 'msg_125' })
      
      await sendPurchaseConfirmationEmail('user@example.com', 'John Doe', 'React Course', 500000, 'ORD-XYZ')
      
      expect(mockSend).toHaveBeenCalledTimes(1)
      const callArg = mockSend.mock.calls[0][0]
      expect(callArg.to).toBe('user@example.com')
      expect(callArg.subject).toContain('thành công')
      expect(callArg.subject).toContain('React Course')
      expect(callArg.html).toContain('John Doe')
      expect(callArg.html).toContain('ORD-XYZ')
      expect(logger.info).toHaveBeenCalledWith('Purchase confirmation email sent', { to: 'user@example.com', orderId: 'ORD-XYZ' })
    })

    it('sendCertificateEmail sends correct data', async () => {
      mockSend.mockResolvedValueOnce({ id: 'msg_126' })
      
      await sendCertificateEmail('user@example.com', 'John Doe', 'React Course', 'https://sudemy.vn/verify/123')
      
      expect(mockSend).toHaveBeenCalledTimes(1)
      const callArg = mockSend.mock.calls[0][0]
      expect(callArg.to).toBe('user@example.com')
      expect(callArg.subject).toContain('Chúc mừng')
      expect(callArg.html).toContain('John Doe')
      expect(callArg.html).toContain('https://sudemy.vn/verify/123')
      expect(logger.info).toHaveBeenCalledWith('Certificate email sent', { to: 'user@example.com' })
    })

    it('gracefully handles and logs errors', async () => {
      mockSend.mockRejectedValueOnce(new Error('Resend API error'))
      
      await sendWelcomeEmail('user@example.com', 'John Doe')
      
      expect(logger.error).toHaveBeenCalledWith('Failed to send welcome email', { to: 'user@example.com', error: 'Resend API error' })
    })
  })
})
