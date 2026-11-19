import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiFetch, errorText, setTokens } from '@/api/http'
import type {
  ApiResponse,
  AppleLoginResponse,
  AuthSession,
  EmailCodeSendResponse,
  EmailVerificationResponse,
} from '@/api/types'
import { myActions } from '@/features/my/store'

export function loginErrorText(error: unknown, fallback = '이메일 또는 비밀번호를 확인해 주세요') {
  return errorText(error, fallback)
}

export type PendingSignup = {
  email: string
  name: string
  password: string
  passwordCheck: string
}

let pendingSignup: PendingSignup | null = null

export function setPendingSignup(value: PendingSignup | null) {
  pendingSignup = value
}

export function getPendingSignup() {
  return pendingSignup
}

export async function sendEmailCode(email: string) {
  const res = await apiFetch<ApiResponse<EmailCodeSendResponse>>('/api/auth/email/verification-code', {
    method: 'POST',
    body: JSON.stringify({ email }),
    auth: false,
  })
  return res.result
}

export async function verifyEmailCode(email: string, code: string) {
  const res = await apiFetch<ApiResponse<EmailVerificationResponse>>('/api/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    auth: false,
  })
  return res.result
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const res = await apiFetch<ApiResponse<AuthSession>>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
        auth: false,
      })
      const session = res.result
      if (!session?.accessToken) throw new ApiError(200, '로그인에 실패했어요')
      // 이전 계정의 캐시는 토큰을 넣기 전에 비운다. 넣은 뒤에 비우면 막 시작한 홈 요청까지 지워진다
      queryClient.removeQueries()
      myActions.setAccount(session)
      setTokens(session.accessToken, session.refreshToken ?? null)
      return session
    },
  })
}

/**
 * Apple 로그인. 앱에서 받은 identityToken 을 서버에 넘기면 가입 또는 로그인된다.
 * 같은 이메일의 기존 계정이 있으면 서버가 Apple 을 연동해 그 계정으로 로그인한다
 */
export function useAppleLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { identityToken: string; name?: string }) => {
      const res = await apiFetch<ApiResponse<AppleLoginResponse>>('/api/auth/login/apple', {
        method: 'POST',
        body: JSON.stringify(body),
        auth: false,
      })
      const session = res.result
      if (!session?.accessToken) throw new ApiError(200, '로그인에 실패했어요')
      queryClient.removeQueries()
      myActions.setAccount(session)
      setTokens(session.accessToken, session.refreshToken ?? null)
      return session
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: PendingSignup) => {
      const res = await apiFetch<ApiResponse<AuthSession>>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
        auth: false,
      })
      const session = res.result
      if (session?.accessToken) {
        queryClient.removeQueries()
        myActions.setAccount(session)
        setTokens(session.accessToken, session.refreshToken ?? null)
      }
      return session
    },
    onSuccess: () => {
      pendingSignup = null
    },
  })
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (body: { email: string; code: string; password: string; passwordCheck: string }) =>
      apiFetch<ApiResponse<string>>('/api/auth/passwordReset', {
        method: 'POST',
        body: JSON.stringify({
          emailVerificationRequest: { email: body.email, code: body.code },
          password: body.password,
          passwordCheck: body.passwordCheck,
        }),
        auth: false,
      }),
  })
}
