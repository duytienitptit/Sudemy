import { Settings, ISettings } from '../models/Settings'
import { AppError } from '../middlewares/errorHandler'

interface UpdateSettingsInput {
  platformName?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor?: string
  contactEmail?: string
  socialLinks?: {
    facebook?: string
    youtube?: string
    tiktok?: string
    zalo?: string
  }
  seoDefaults?: {
    metaTitle?: string
    metaDescription?: string
  }
  footerText?: string
}

export class SettingsService {
  /**
   * Get the global settings singleton
   */
  async getSettings(): Promise<ISettings> {
    const settings = await Settings.findOne()
    if (!settings) {
      throw new AppError('Settings not found', 404)
    }
    return settings
  }

  /**
   * Update the global settings singleton
   * @param data - The fields to update
   */
  async updateSettings(data: UpdateSettingsInput): Promise<ISettings> {
    // There's only one settings document, so we update the first one we find
    const settings = await Settings.findOne()
    
    if (!settings) {
      // This shouldn't happen because seedSettings creates it on startup
      throw new AppError('Settings not found. Try restarting the server to re-seed.', 404)
    }

    if (data.platformName !== undefined) settings.platformName = data.platformName
    if (data.logoUrl !== undefined) settings.logoUrl = data.logoUrl
    if (data.faviconUrl !== undefined) settings.faviconUrl = data.faviconUrl
    if (data.primaryColor !== undefined) settings.primaryColor = data.primaryColor
    if (data.contactEmail !== undefined) settings.contactEmail = data.contactEmail
    if (data.footerText !== undefined) settings.footerText = data.footerText

    if (data.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks,
        ...data.socialLinks,
      }
    }

    if (data.seoDefaults) {
      settings.seoDefaults = {
        ...settings.seoDefaults,
        ...data.seoDefaults,
      }
    }

    await settings.save()
    return settings
  }
}
