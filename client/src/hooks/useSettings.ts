import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/services/settings.service'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}
