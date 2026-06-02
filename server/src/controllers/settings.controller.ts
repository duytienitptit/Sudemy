import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { SettingsService } from '../services/settings.service'

const settingsService = new SettingsService()

// Validation schema for updating settings
const updateSettingsSchema = z.object({
  platformName: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex code').optional(),
  contactEmail: z.string().email().optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    zalo: z.string().url().optional().or(z.literal('')),
  }).optional(),
  seoDefaults: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }).optional(),
  footerText: z.string().optional(),
})

/**
 * Get global platform settings
 * GET /api/v1/settings
 * Public endpoint for branding
 */
export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getSettings()

    res.status(200).json({
      success: true,
      data: { settings },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Update global platform settings
 * PUT /api/v1/settings
 * Admin endpoint
 */
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateSettingsSchema.parse(req.body)
    const settings = await settingsService.updateSettings(data)

    res.status(200).json({
      success: true,
      data: { settings },
    })
  } catch (error) {
    next(error)
  }
}
