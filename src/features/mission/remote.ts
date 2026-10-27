import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, ApiError, useSignedIn } from '@/api/http'
import type { ApiResponse, InProgressMission } from '@/api/types'

export function useInProgressMission() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['mission', 'in-progress'],
    enabled: signedIn,
    queryFn: async () => {
      try {
        const res = await apiFetch<ApiResponse<InProgressMission>>('/api/missions/in-progress')
        return res.result
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
  })
}

export function useQuitMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<ApiResponse<null>>('/api/missions/in-progress', { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mission', 'in-progress'] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useCompleteMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<ApiResponse<InProgressMission>>('/api/missions/in-progress/complete', { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mission', 'in-progress'] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
