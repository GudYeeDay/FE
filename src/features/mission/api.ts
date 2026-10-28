import { useQuery } from '@tanstack/react-query'

import { MOCK_MISSIONS } from './mocks'
import type { Mission } from './types'

const RECOMMEND_COUNT = 3

/**
 * 추천 미션 목록. "다른 미션 보기" 를 누르면 refetch 해서 새 목록을 받는다.
 * TODO: 실제 API 로 교체 (apiFetch('/missions/recommended'))
 */
/** 직전에 보여준 추천. "다른 미션 보기" 에서 같은 카드가 다시 나오지 않게 뺀다 (목업 전용) */
let lastShownIds = new Set<string>()

async function fetchRecommendedMissions(): Promise<Mission[]> {
  await new Promise((r) => setTimeout(r, 300))
  const shuffle = (list: Mission[]) => [...list].sort(() => Math.random() - 0.5)
  const fresh = shuffle(MOCK_MISSIONS.filter((m) => !lastShownIds.has(m.id)))
  // 새 카드가 모자라면 직전 카드로 채운다
  const refill = shuffle(MOCK_MISSIONS.filter((m) => lastShownIds.has(m.id)))
  const picked = [...fresh, ...refill].slice(0, RECOMMEND_COUNT)
  lastShownIds = new Set(picked.map((m) => m.id))
  return picked
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
