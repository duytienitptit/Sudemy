import { Request, Response, NextFunction } from 'express'
import { couponService } from '@/services/coupon.service'
import { flashSaleService } from '@/services/flash-sale.service'

// ─── Coupons ──────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/coupons
 * Auth: Required (admin, moderator)
 */
export const getCoupons = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupons = await couponService.listAll()
    res.json({ success: true, data: coupons })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/v1/coupons
 * Auth: Required (admin)
 */
export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupon = await couponService.create(req.body)
    res.status(201).json({ success: true, data: { coupon }, message: 'Coupon created' })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/v1/coupons/:id
 * Auth: Required (admin)
 */
export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const coupon = await couponService.update(req.params.id as string, req.body)
    res.json({ success: true, data: { coupon }, message: 'Coupon updated' })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/v1/coupons/:id
 * Auth: Required (admin)
 */
export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await couponService.remove(req.params.id as string)
    res.json({ success: true, message: 'Coupon deleted' })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/v1/coupons/validate
 * Auth: Required
 */
export const validateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await couponService.validate(req.body)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

// ─── Flash Sales ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/flash-sales/active
 * Auth: None (public)
 */
export const getActiveFlashSale = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const flashSale = await flashSaleService.getActive()
    res.json({ success: true, data: { flashSale } })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/v1/flash-sales
 * Auth: Required (admin)
 */
export const getFlashSales = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const flashSales = await flashSaleService.listAll()
    res.json({ success: true, data: flashSales })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/v1/flash-sales
 * Auth: Required (admin)
 */
export const createFlashSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const flashSale = await flashSaleService.create(req.body)
    res.status(201).json({ success: true, data: { flashSale }, message: 'Flash sale created' })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/v1/flash-sales/:id
 * Auth: Required (admin)
 */
export const updateFlashSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const flashSale = await flashSaleService.update(req.params.id as string, req.body)
    res.json({ success: true, data: { flashSale }, message: 'Flash sale updated' })
  } catch (err) {
    next(err)
  }
}
