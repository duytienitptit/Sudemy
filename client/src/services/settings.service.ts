import api from '@/lib/api'
export interface ISocialLinks {
  facebook?: string
  youtube?: string
  tiktok?: string
  zalo?: string
}

export interface ISettings {
  platformName: string
  logoUrl: string
  faviconUrl: string
  primaryColor: string
  contactEmail: string
  socialLinks: ISocialLinks
  footerText: string
  updatedAt: string
}

interface SettingsResponse {
  success: boolean
  data: {
    settings: ISettings
  }
}

export const getSettings = async (): Promise<ISettings> => {
  const { data } = await api.get<SettingsResponse>('/settings')
  return data.data.settings
}

export const updateSettings = async (settingsData: Partial<ISettings>): Promise<ISettings> => {
  const { data } = await api.put<SettingsResponse>('/settings', settingsData)
  return data.data.settings
}
