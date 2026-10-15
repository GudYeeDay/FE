import { useQuery } from '@tanstack/react-query'

import { MOCK_MISSIONS } from './mocks'
import type { Mission } from './types'

const RECOMMEND_COUNT = 5

/**
 * 추천 미션 목록. "다른 미션 보기" 를 누르면 refetch 해서 새 목록을 받는다.
 * TODO: 실제 API 로 교체 (apiFetch('/missions/recommended'))
 */
async function fetchRecommendedMissions(): Promise<Mission[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [...MOCK_MISSIONS].sort(() => Math.random() - 0.5).slice(0, RECOMMEND_COUNT)
}

export function useRecommendedMissions(enabled: boolean) {
  return useQuery({
    queryKey: ['missions', 'recommended'],
    queryFn: fetchRecommendedMissions,
    enabled,
    // 열 때마다 새 추천을 보여주기 위해 캐시를 바로 낡은 것으로 본다
    staleTime: 0,
  })
}
