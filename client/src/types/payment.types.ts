// ── Payment / Order types for Sudemy frontend ──

export type OrderStatus = 'pending' | 'completed' | 'failed'

export interface Order {
  _id: string
  userId: string
  courseId: {
    _id: string
    title: string
    thumbnail: string
    slug: string
  } | string
  amount: number
  originalAmount: number
  couponId?: string
  status: OrderStatus
  payosOrderId?: string
  idempotencyKey?: string
  createdAt: string
  updatedAt: string
}

export interface FlashSale {
  _id: string
  title: string
  discountPercent: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface CouponValidateResult {
  valid: boolean
  discountType: 'percent' | 'fixed'
  discountValue: number
  finalPrice: number
}

export interface CreateOrderResult {
  order: Order
  checkoutUrl: string
}

export interface CheckoutInput {
  courseId: string
  couponCode?: string
}
