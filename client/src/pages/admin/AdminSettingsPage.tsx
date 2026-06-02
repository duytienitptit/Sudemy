import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateSettings } from '@/services/settings.service'
import type { ISettings } from '@/services/settings.service'
import { ImageUploader } from '@/components/ui/ImageUploader'
import toast from 'react-hot-toast'

const settingsSchema = z.object({
  platformName: z.string().min(2, 'Platform name is required'),
  contactEmail: z.string().email('Invalid email address'),
  footerText: z.string(),
  socialLinks: z.object({
    facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
    youtube: z.string().url('Invalid URL').optional().or(z.literal('')),
    tiktok: z.string().url('Invalid URL').optional().or(z.literal('')),
    zalo: z.string().url('Invalid URL').optional().or(z.literal(''))
  })
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: getSettings
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema)
  })

  useEffect(() => {
    if (currentSettings) {
      reset({
        platformName: currentSettings.platformName,
        contactEmail: currentSettings.contactEmail,
        footerText: currentSettings.footerText,
        socialLinks: {
          facebook: currentSettings.socialLinks?.facebook || '',
          youtube: currentSettings.socialLinks?.youtube || '',
          tiktok: currentSettings.socialLinks?.tiktok || '',
          zalo: currentSettings.socialLinks?.zalo || ''
        }
      })
      setLogoUrl(currentSettings.logoUrl || '')
      setFaviconUrl(currentSettings.faviconUrl || '')
    }
  }, [currentSettings, reset])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ISettings>) => updateSettings(data),
    onSuccess: () => {
      toast.success('Settings updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => {
      toast.error('Failed to update settings')
    }
  })

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate({ ...data, logoUrl, faviconUrl })
  }

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-display-sm font-bold text-[var(--color-on-surface)]">Platform Settings</h1>
        <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
          Manage global configuration and branding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="elevation-1 rounded-xl p-6">
          <h2 className="text-title-md font-semibold text-[var(--color-on-surface)] mb-4">Branding & Assets</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Platform Logo</label>
              <ImageUploader 
                value={logoUrl}
                onChange={setLogoUrl}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Favicon</label>
              <ImageUploader 
                value={faviconUrl}
                onChange={setFaviconUrl}
              />
            </div>
          </div>
        </div>

        <div className="elevation-1 rounded-xl p-6">
          <h2 className="text-title-md font-semibold text-[var(--color-on-surface)] mb-4">General Configuration</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Platform Name</label>
              <input 
                {...register('platformName')}
                className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-[var(--color-on-surface)]"
              />
              {errors.platformName && <p className="text-red-500 text-xs mt-1">{errors.platformName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Contact Email</label>
              <input 
                {...register('contactEmail')}
                className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-[var(--color-on-surface)]"
              />
              {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Footer Text</label>
              <textarea 
                {...register('footerText')}
                rows={3}
                className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-[var(--color-on-surface)]"
              />
            </div>

            <h3 className="text-label-lg font-semibold text-[var(--color-on-surface)] pt-4 border-t border-[var(--color-outline-variant)]">Social Links</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">Facebook URL</label>
                <input {...register('socialLinks.facebook')} className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-sm text-[var(--color-on-surface)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">YouTube URL</label>
                <input {...register('socialLinks.youtube')} className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-sm text-[var(--color-on-surface)]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--color-on-surface-variant)] mb-1">TikTok URL</label>
                <input {...register('socialLinks.tiktok')} className="w-full bg-transparent border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-sm text-[var(--color-on-surface)]" />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-[var(--color-primary)] text-white font-medium py-2 px-4 rounded-md hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
