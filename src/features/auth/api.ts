import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiFetch, setTokens } from '@/api/http'
import type {
  ApiResponse,
  AuthSession,
  EmailCodeSendResponse,
  EmailVerificationResponse,
} from '@/api/types'

export function loginErrorText(error: unknown, fallback = '이메일 또는 비밀번호를 확인해 주세요') {
  if (!(error instanceof ApiError)) return '서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요'
  // 서버 메시지가 없으면 상태 코드만 들어 있다
  if (error.message && !/^\d+$/.test(error.message)) return error.message
  return fallback
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
      setTokens(session.accessToken, session.refreshToken ?? null)
      return session
    },
    onSuccess: () => {
      queryClient.clear()
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
      if (session?.accessToken) setTokens(session.accessToken, session.refreshToken ?? null)
      return session
    },
    onSuccess: () => {
      pendingSignup = null
      queryClient.clear()
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
