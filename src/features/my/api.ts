import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, Profile } from '@/api/types'

export function useMyProfile() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['profile'],
    enabled: signedIn,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<Profile>>('/api/mypage/profile')
      return res.result
    },
  })
}

export function useChangeName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<ApiResponse<string>>('/api/mypage/changeName', {
        method: 'PUT',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async () => {
      // 홈 인사말도 이름을 쓴다
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
      await queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: { currentPassword: string; newPassword: string; newPasswordCheck: string }) =>
      apiFetch<ApiResponse<string>>('/api/mypage/changePassword', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  })
}
