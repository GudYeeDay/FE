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

/**
 * 회원 탈퇴. 서버가 기록·사진·보관함·알림·기기 토큰·로그인 토큰을 바로 모두 지운다 (되돌릴 수 없음).
 * 애플 연동 계정은 탈퇴 직전에 애플 로그인을 다시 해서 받은 authorizationCode 를 보내야
 * 서버가 애플 연동을 해제한다. 코드는 5분 안에 한 번만 쓸 수 있다
 */
export function useWithdraw() {
  return useMutation({
    mutationFn: (appleAuthorizationCode?: string) =>
      apiFetch<ApiResponse<string>>('/api/mypage/withdraw', {
        method: 'POST',
        ...(appleAuthorizationCode ? { body: JSON.stringify({ appleAuthorizationCode }) } : {}),
      }),
  })
}
