import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, InProgressMission, MissionRecommend } from '@/api/types'

export function useRecommendations() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['missions', 'recommendations'],
    enabled: signedIn,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<MissionRecommend[]>>('/api/missions/recommendations')
      return res.result ?? []
    },
  })
}

export function useBookmarkMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (missionId: number) =>
      apiFetch<ApiResponse<{ bookmarkId: number; missionId: number }>>(`/api/missions/${missionId}/bookmarks`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useStartRecommendedMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (missionId: number) =>
      apiFetch<ApiResponse<InProgressMission>>(`/api/missions/${missionId}/start`, { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mission', 'in-progress'] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
