import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type {
  ApiResponse,
  BookmarkDetail,
  BookmarkFilter,
  BookmarkList,
  InProgressMission,
} from '@/api/types'

export function useBookmarks(filter: BookmarkFilter) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['bookmarks', filter],
    enabled: signedIn,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<BookmarkList>>(`/api/bookmarks?filter=${filter}`)
      return res.result
    },
  })
}

export function useBookmark(bookmarkId: string | undefined) {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['bookmarks', 'detail', bookmarkId],
    enabled: signedIn && Boolean(bookmarkId),
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<BookmarkDetail>>(`/api/bookmarks/${bookmarkId}`)
      return res.result
    },
  })
}

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
      apiFetch<ApiResponse<InProgressMission>>(`/api/bookmarks/${bookmarkId}/start`, { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mission', 'in-progress'] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
