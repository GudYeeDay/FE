import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, ApiError, useSignedIn } from '@/api/http'
import type { ApiResponse, InProgressMission, MissionRecommend } from '@/api/types'

import type { ActiveMission, Mission } from './types'

const toMission = (m: MissionRecommend): Mission => ({
  id: m.missionId,
  title: m.title,
  description: m.description,
})

const toActive = (m: InProgressMission): ActiveMission => ({
  id: m.missionId,
  userMissionId: m.userMissionId,
  title: m.title,
  description: m.description,
})

/** 미션 시작·완료·그만두기 뒤 다시 불러올 것들 */
export const MISSION_KEYS = [['mission', 'active'], ['bookmarks'], ['profile'], ['home']] as const

async function invalidateMissionState(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all(MISSION_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

/**
 * 추천 미션 3개. 보관함에 있거나 해본 미션은 서버에서 빼고 준다.
 * "다른 미션 보기" 는 refetch 로 새 목록을 받는다.
 */
export function useRecommendedMissions(enabled: boolean) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['missions', 'recommended'],
    enabled: enabled && signedIn,
    // 열 때마다 새 추천을 보여주기 위해 캐시를 바로 낡은 것으로 본다
    staleTime: 0,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<MissionRecommend[]>>('/api/missions/recommendations')
      return (res.result ?? []).map(toMission)
    },
  })
}

/** 진행 중인 미션. 없으면 null */
export function useActiveMission() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['mission', 'active'],
    enabled: signedIn,
    queryFn: async () => {
      try {
        const res = await apiFetch<ApiResponse<InProgressMission>>('/api/missions/in-progress')
        return res.result ? toActive(res.result) : null
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
      }
    },
  })
}

/** 이미 진행 중인 미션이 있어서 시작하지 못했을 때 */
export const isAlreadyInProgress = (error: unknown) =>
  error instanceof ApiError && error.status === 409

export function useStartMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (missionId: number) =>
      apiFetch<ApiResponse<InProgressMission>>(`/api/missions/${missionId}/start`, {
        method: 'POST',
      }),
    onSuccess: () => invalidateMissionState(queryClient),
  })
}

export function useQuitMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<ApiResponse<null>>('/api/missions/in-progress', { method: 'DELETE' }),
    onSuccess: () => invalidateMissionState(queryClient),
  })
}

/** 추천 카드의 북마크. 저장돼 있으면 해제, 아니면 저장 */
export function useToggleBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ missionId, saved }: { missionId: number; saved: boolean }) =>
      apiFetch<ApiResponse<unknown>>(`/api/missions/${missionId}/bookmarks`, {
        method: saved ? 'DELETE' : 'POST',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
