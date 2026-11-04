import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { File } from 'expo-file-system'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, CompleteMissionResponse } from '@/api/types'
import { MISSION_KEYS } from '@/features/mission/api'

import type { MissionRecord, PickedPhoto, RecordInput } from './types'

export const toRecord = (r: CompleteMissionResponse): MissionRecord => ({
  id: r.completeMissionId,
  title: r.title,
  body: r.content ?? '',
  place: r.location ?? '',
  date: r.completeAt,
  photo: { uri: r.imageUrl },
})

/** 기록이 바뀌면 함께 다시 불러올 화면들 */
const RECORD_KEYS = [['feed'], ['home'], ['calendar'], ['profile']] as const

function invalidateRecords(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all(RECORD_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}

/** 그날 남긴 기록, 최근 것부터 */
export function useDailyFeed(date: string | undefined) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['feed', date],
    enabled: signedIn && Boolean(date),
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<CompleteMissionResponse[]>>(
        `/api/complete/dailyFeed?date=${date}`,
      )
      return (res.result ?? []).map(toRecord).sort((a, b) => b.id - a.id)
    },
  })
}

/** 피드 캐시에서 기록 하나를 찾는다 (수정·이미지 저장 화면) */
export function useRecord(date: string | undefined, id: number | undefined) {
  const feed = useDailyFeed(date)
  return { ...feed, data: feed.data?.find((r) => r.id === id) }
}

/**
 * SDK 57 의 전역 fetch(expo/fetch)는 RN 식 { uri, name, type } 파트를 받지 않는다.
 * expo-file-system 의 File 은 Blob 을 구현해서 그대로 multipart 파트로 들어간다
 */
function photoPart(photo: PickedPhoto) {
  return new File(photo.uri)
}

/** 서버는 위치·본문을 쿼리 파라미터로, 사진을 multipart 로 받는다 */
function recordQuery(input: RecordInput) {
  const params = new URLSearchParams()
  if (input.place) params.set('location', input.place)
  params.set('content', input.body)
  return params.toString()
}

/**
 * 진행 중인 미션을 기록과 함께 완료한다.
 * 홈 주간 사진도 그날 마지막 기록 사진으로 바꾼다 (실패해도 기록은 남아 있으므로 무시)
 */
export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userMissionId, input }: { userMissionId: number; input: RecordInput }) => {
      if (!input.photo) throw new Error('사진이 필요해요')
      const form = new FormData()
      form.append('image', photoPart(input.photo))
      const res = await apiFetch<ApiResponse<CompleteMissionResponse>>(
        `/api/complete/${userMissionId}?${recordQuery(input)}`,
        { method: 'POST', body: form },
      )

      const weekly = new FormData()
      weekly.append('file', photoPart(input.photo))
      await apiFetch('/api/home/weekly-photos', { method: 'POST', body: weekly }).catch(() => {})

      return toRecord(res.result)
    },
    onSuccess: async () => {
      await invalidateRecords(queryClient)
      await Promise.all(MISSION_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: RecordInput }) => {
      const form = new FormData()
      if (input.photo) form.append('image', photoPart(input.photo))
      const res = await apiFetch<ApiResponse<CompleteMissionResponse>>(
        `/api/complete/${id}/update?${recordQuery(input)}`,
        { method: 'PUT', body: form },
      )
      return toRecord(res.result)
    },
    onSuccess: () => invalidateRecords(queryClient),
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<ApiResponse<number>>(`/api/complete/${id}/delete`, { method: 'DELETE' }),
    onSuccess: () => invalidateRecords(queryClient),
  })
}
