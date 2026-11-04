import { useQuery } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, HomeResponse } from '@/api/types'
import type { MissionRecord } from '@/features/record/types'

export type WeekDay = {
  /** YYYY-MM-DD */
  date: string
  /** 그날의 사진. 없는 날은 빈 칸 */
  photo?: { uri: string }
}

export type HomeSummary = {
  name: string
  hasUnreadNotification: boolean
  /** 이번 달에 기록한 날 수 */
  recordDays: number
  week: WeekDay[]
  /** 지난 주까지의 기록 중 랜덤 5개. 본문 자리에는 미션 설명이 온다 */
  pastRecords: MissionRecord[]
}

export function useHomeSummary() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['home'],
    enabled: signedIn,
    queryFn: async (): Promise<HomeSummary> => {
      const { result } = await apiFetch<ApiResponse<HomeResponse>>('/api/home')
      return {
        name: result.name,
        hasUnreadNotification: result.hasUnreadNotification,
        recordDays: result.monthlyCompletedDays,
        week: result.weeklyPhotos.days.map((d) => ({
          date: d.date,
          photo: d.imageUrl ? { uri: d.imageUrl } : undefined,
        })),
        pastRecords: result.pastRecords.map((r) => ({
          id: r.completeMissionId,
          title: r.title,
          body: r.description ?? '',
          place: r.location ?? '',
          date: r.date,
          photo: { uri: r.imageUrl },
        })),
      }
    },
  })
}
