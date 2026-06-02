import { Router } from 'express'
import healthRoute from './health.route'
import authRoute from './auth.route'
import userRoute from './user.route'
import settingsRoute from './settings.route'
import promptRoute from './prompt.route'
import courseRoute from './course.route'
import lessonRoute from './lesson.route'
import progressRoute from './progress.route'
import certificateRoute from './certificate.route'
import statsRoute from './stats.route'
import ticketRoute from './ticket.route'
import orderRoute from './order.route'
import paymentRoute from './payment.route'
import couponRoute from './coupon.route'
import flashSaleRoute from './flash-sale.route'
import aiTutorRoute from './ai-tutor.route'
import globalChatRoute from './global-chat.route'

const router = Router()

router.use('/health', healthRoute)
router.use('/auth', authRoute)
router.use('/users', userRoute)
router.use('/settings', settingsRoute)
router.use('/courses', courseRoute)
router.use('/prompts', promptRoute)
router.use('/admin/stats', statsRoute)
router.use('/', lessonRoute)
router.use('/progress', progressRoute)
router.use('/certificates', certificateRoute)
router.use('/tickets', ticketRoute)
router.use('/orders', orderRoute)
router.use('/payments', paymentRoute)
router.use('/coupons', couponRoute)
router.use('/flash-sales', flashSaleRoute)
router.use('/ai-tutor', aiTutorRoute)
router.use('/global-chat', globalChatRoute)

export default router
