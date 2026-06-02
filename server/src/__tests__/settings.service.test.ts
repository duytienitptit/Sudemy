import { SettingsService } from '../services/settings.service'
import { Settings } from '../models/Settings'
import { AppError } from '../middlewares/errorHandler'

jest.mock('../models/Settings')

describe('SettingsService', () => {
  let settingsService: SettingsService

  beforeEach(() => {
    settingsService = new SettingsService()
    jest.clearAllMocks()
  })

  describe('getSettings', () => {
    it('should return settings if found', async () => {
      const mockSettings = { platformName: 'Sudemy' }
      ;(Settings.findOne as jest.Mock).mockResolvedValue(mockSettings)

      const result = await settingsService.getSettings()

      expect(Settings.findOne).toHaveBeenCalled()
      expect(result).toEqual(mockSettings)
    })

    it('should throw AppError 404 if settings not found', async () => {
      ;(Settings.findOne as jest.Mock).mockResolvedValue(null)

      await expect(settingsService.getSettings()).rejects.toThrow(AppError)
      await expect(settingsService.getSettings()).rejects.toMatchObject({ statusCode: 404 })
    })
  })

  describe('updateSettings', () => {
    it('should update and return settings', async () => {
      const mockSettings = {
        platformName: 'OldName',
        socialLinks: { facebook: 'oldFb' },
        seoDefaults: { metaTitle: 'OldTitle' },
        save: jest.fn().mockResolvedValue(true),
      }
      ;(Settings.findOne as jest.Mock).mockResolvedValue(mockSettings)

      const result = await settingsService.updateSettings({
        platformName: 'NewName',
        socialLinks: { youtube: 'newYt' },
        seoDefaults: { metaDescription: 'newDesc' },
      })

      expect(mockSettings.platformName).toBe('NewName')
      expect(mockSettings.socialLinks).toEqual({ facebook: 'oldFb', youtube: 'newYt' })
      expect(mockSettings.seoDefaults).toEqual({ metaTitle: 'OldTitle', metaDescription: 'newDesc' })
      expect(mockSettings.save).toHaveBeenCalled()
      expect(result).toBe(mockSettings)
    })

    it('should throw AppError 404 if settings not found', async () => {
      ;(Settings.findOne as jest.Mock).mockResolvedValue(null)

      await expect(settingsService.updateSettings({ platformName: 'NewName' })).rejects.toThrow(AppError)
    })
  })
})
