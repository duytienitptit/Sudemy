import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type {
  Order,
  FlashSale,
  CouponValidateResult,
  CreateOrderResult,
  CheckoutInput,
} from '@/types/payment.types'

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Create a new order and receive a PayOS checkout URL.
 */
export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  const { data } = await api.post<ApiResponse<CreateOrderResult>>('/orders/create', input)
  return data.data
}

/**
 * Get a single order by ID (student sees own orders, admin sees all).
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await api.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`)
  return data.data.order
}

/**
 * Get all orders for the authenticated user.
 */
export async function getMyOrders(): Promise<Order[]> {
  const { data } = await api.get<ApiResponse<Order[]>>('/orders/my')
  return data.data
}

/**
 * Verify payment status by asking the server to check PayOS directly.
 * Called after user is redirected back from PayOS checkout.
 * Returns both the order and the user's updated purchasedCourses array.
 */
export interface VerifyOrderResult {
  order: Order
  purchasedCourses: string[]
}

export async function verifyOrderPayment(orderCode: string): Promise<VerifyOrderResult> {
  const { data } = await api.post<ApiResponse<VerifyOrderResult>>(`/orders/${orderCode}/verify`)
  return data.data
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

/**
 * Validate a coupon code against a course and return discount info.
 * Uses POST /coupons/validate with body { code, courseId }.
 */
export async function validateCoupon(
  code: string,
  courseId: string,
  _originalPrice?: number, // kept for backward compat, price is fetched server-side
): Promise<CouponValidateResult> {
  const { data } = await api.post<ApiResponse<CouponValidateResult>>('/coupons/validate', {
    code,
    courseId,
  })
  return data.data
}

// ─── Flash Sales ──────────────────────────────────────────────────────────────

/**
 * Fetch the currently active flash sale (if any).
 * Returns null when no sale is active.
 */
export async function getActiveFlashSale(): Promise<FlashSale | null> {
  try {
    const { data } = await api.get<ApiResponse<{ flashSale: FlashSale | null }>>('/flash-sales/active')
    return data.data.flashSale
  } catch {
    return null
  }
}

// ─── Admin: Orders ────────────────────────────────────────────────────────────

export interface AdminOrdersParams {
  page?: number
  limit?: number
  status?: string
}

export interface AdminOrdersResponse {
  data: Order[]
  pagination: { page: number; pages: number; total: number }
}

export async function getAdminOrders(params: AdminOrdersParams = {}): Promise<AdminOrdersResponse> {
  const { data } = await api.get<{ success: boolean; data: Order[]; pagination: any }>('/orders', { params })
  return {
    data: data.data || [],
    pagination: data.pagination || { page: 1, pages: 1, total: 0 },
  }
}

// ─── Admin: Coupons ───────────────────────────────────────────────────────────

export interface Coupon {
  _id: string
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses: number
  usedCount: number
  expiresAt: string
  isActive: boolean
  createdAt: string
}

export interface CouponFormInput {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number | ''
  maxUses: number | ''
  expiresAt: string
  isActive?: boolean
}

export interface AdminCouponsResponse {
  data: Coupon[]
  pagination: { page: number; pages: number; total: number }
}

export async function getAdminCoupons(params: { page?: number; limit?: number } = {}): Promise<AdminCouponsResponse> {
  const { data } = await api.get<{ success: boolean; data: Coupon[] }>('/coupons', { params })
  // Backend returns flat array without pagination
  const coupons = Array.isArray(data.data) ? data.data : []
  return {
    data: coupons,
    pagination: { page: 1, pages: 1, total: coupons.length },
  }
}

export async function createCoupon(input: CouponFormInput): Promise<Coupon> {
  const { data } = await api.post<ApiResponse<{ coupon: Coupon }>>('/coupons', input)
  return data.data.coupon
}

export async function updateCoupon(id: string, input: Partial<CouponFormInput>): Promise<Coupon> {
  const { data } = await api.put<ApiResponse<{ coupon: Coupon }>>(`/coupons/${id}`, input)
  return data.data.coupon
}

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/coupons/${id}`)
}

// ─── Admin: Flash Sales ───────────────────────────────────────────────────────

export interface AdminFlashSale {
  _id: string
  title: string
  discountPercent: number
  startTime: string
  endTime: string
  isActive: boolean
  courseIds: string[]
  createdAt: string
}

export interface FlashSaleFormInput {
  title: string
  discountPercent: number | ''
  startTime: string
  endTime: string
  courseIds: string[]
}

export interface AdminFlashSalesResponse {
  data: AdminFlashSale[]
  pagination: { page: number; pages: number; total: number }
}

export async function getAdminFlashSales(params: { page?: number; limit?: number } = {}): Promise<AdminFlashSalesResponse> {
  const { data } = await api.get<{ success: boolean; data: AdminFlashSale[] }>('/flash-sales', { params })
  // Backend returns flat array without pagination
  const sales = Array.isArray(data.data) ? data.data : []
  return {
    data: sales,
    pagination: { page: 1, pages: 1, total: sales.length },
  }
}

export async function createFlashSale(input: FlashSaleFormInput): Promise<AdminFlashSale> {
  const { data } = await api.post<ApiResponse<{ flashSale: AdminFlashSale }>>('/flash-sales', input)
  return data.data.flashSale
}

export async function updateFlashSale(id: string, input: Partial<FlashSaleFormInput>): Promise<AdminFlashSale> {
  const { data } = await api.put<ApiResponse<{ flashSale: AdminFlashSale }>>(`/flash-sales/${id}`, input)
  return data.data.flashSale
}

export async function deleteFlashSale(id: string): Promise<void> {
  await api.delete(`/flash-sales/${id}`)
}
