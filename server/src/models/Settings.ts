import { Schema, model, Document } from 'mongoose'

// ─── Nested Interface ─────────────────────────────────────────────────────────
export interface ISocialLinks {
  facebook?: string
  youtube?: string
  tiktok?: string
  zalo?: string
}

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ISettings extends Document {
  platformName: string
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  contactEmail: string
  socialLinks: ISocialLinks
  seoDefaults: {
    metaTitle: string
    metaDescription: string
  }
  footerText: string
  updatedAt: Date
}

// ─── Default Singleton Values ─────────────────────────────────────────────────
export const DEFAULT_SETTINGS: Omit<ISettings, keyof Document> = {
  platformName: 'Sudemy',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#4f46e5',
  contactEmail: 'support@sudemy.vn',
  socialLinks: {},
  seoDefaults: {
    metaTitle: 'Sudemy - Học AI thực chiến',
    metaDescription: 'Nền tảng học AI thực chiến hàng đầu Việt Nam',
  },
  footerText: '© 2025 Sudemy. All rights reserved.',
  updatedAt: new Date(),
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const settingsSchema = new Schema<ISettings>(
  {
    platformName: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      default: DEFAULT_SETTINGS.platformName,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    faviconUrl: {
      type: String,
      trim: true,
      default: '',
    },
    primaryColor: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.primaryColor,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Primary color must be a valid hex code'],
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: DEFAULT_SETTINGS.contactEmail,
    },
    socialLinks: {
      facebook: { type: String, trim: true },
      youtube: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      zalo: { type: String, trim: true },
    },
    seoDefaults: {
      metaTitle: { type: String, trim: true, default: DEFAULT_SETTINGS.seoDefaults.metaTitle },
      metaDescription: { type: String, trim: true, default: DEFAULT_SETTINGS.seoDefaults.metaDescription },
    },
    footerText: {
      type: String,
      trim: true,
      default: DEFAULT_SETTINGS.footerText,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false,
  },
)

// ─── Model ────────────────────────────────────────────────────────────────────
export const Settings = model<ISettings>('Settings', settingsSchema)

// ─── Singleton Seeder ─────────────────────────────────────────────────────────
/**
 * Ensures exactly one Settings document exists.
 * Called during server bootstrap after DB connection is established.
 */
export async function seedSettings(): Promise<void> {
  const count = await Settings.countDocuments()
  if (count === 0) {
    await Settings.create({
      platformName: DEFAULT_SETTINGS.platformName,
      logoUrl: DEFAULT_SETTINGS.logoUrl,
      faviconUrl: DEFAULT_SETTINGS.faviconUrl,
      primaryColor: DEFAULT_SETTINGS.primaryColor,
      contactEmail: DEFAULT_SETTINGS.contactEmail,
      socialLinks: DEFAULT_SETTINGS.socialLinks,
      seoDefaults: DEFAULT_SETTINGS.seoDefaults,
      footerText: DEFAULT_SETTINGS.footerText,
    })
  }
}
