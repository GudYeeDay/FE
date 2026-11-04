import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type {
  ApiResponse,
  BookmarkDetail,
  BookmarkItem,
  BookmarkList,
  BookmarkStatus,
  InProgressMission,
} from '@/api/types'
import { MISSION_KEYS } from '@/features/mission/api'
import type { ArchiveItem, ArchiveStatus } from '@/features/mission/types'

const STATUS: Record<BookmarkStatus, ArchiveStatus> = {
  SAVED: 'saved',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'done',
}

const toArchiveItem = (b: BookmarkItem): ArchiveItem => ({
  bookmarkId: b.bookmarkId,
  missionId: b.missionId,
  title: b.title,
  status: STATUS[b.status],
  date: b.date,
})

/** 보관함 전체 목록. 탭(남은/완료)은 화면에서 나눈다 */
export function useArchive() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['bookmarks', 'ALL'],
    enabled: signedIn,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<BookmarkList>>('/api/bookmarks?filter=ALL')
      return (res.result?.bookmarks ?? []).map(toArchiveItem)
    },
  })
}

export function useBookmark(bookmarkId: number | undefined) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['bookmarks', 'detail', bookmarkId],
    enabled: signedIn && bookmarkId !== undefined,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<BookmarkDetail>>(`/api/bookmarks/${bookmarkId}`)
      return res.result
    },
  })
}

/** 보관함에서만 빠진다. 완료한 미션의 기록(사진·글)은 지워지지 않는다 */
export function useDeleteBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookmarkId: number) =>
      apiFetch<ApiResponse<null>>(`/api/bookmarks/${bookmarkId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useCreateCustomMission() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { title: string; description: string }) =>
      apiFetch<ApiResponse<BookmarkDetail>>('/api/bookmarks/custom', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useStartBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (bookmarkId: number) =>
      apiFetch<ApiResponse<InProgressMission>>(`/api/bookmarks/${bookmarkId}/start`, {
        method: 'POST',
      }),
    onSuccess: async () => {
      await Promise.all(MISSION_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
  })
}
