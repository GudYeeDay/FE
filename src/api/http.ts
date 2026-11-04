import { useSyncExternalStore } from 'react'
import * as SecureStore from 'expo-secure-store'

import type { ApiResponse, AuthSession } from '@/api/types'

const REMOTE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://ec2-15-164-237-188.ap-northeast-2.compute.amazonaws.com'

const ACCESS_KEY = 'gyd.accessToken'
const REFRESH_KEY = 'gyd.refreshToken'

/** restoring: 앱 시작 직후 저장된 토큰을 읽는 중. 이때는 스플래시를 유지한다 */
export type AuthStatus = 'restoring' | 'signedOut' | 'signedIn'

let accessToken: string | null = null
let refreshToken: string | null = null
let status: AuthStatus = 'restoring'
const listeners = new Set<() => void>()

function emitAuth() {
  status = accessToken ? 'signedIn' : 'signedOut'
  for (const listener of listeners) listener()
}

function writeStore(key: string, value: string | null) {
  const task = value ? SecureStore.setItemAsync(key, value) : SecureStore.deleteItemAsync(key)
  // 저장에 실패해도 이번 실행의 로그인은 유지한다
  task.catch(() => {})
}

let restoreTask: Promise<void> | null = null

/** 앱 시작 시 한 번, 기기에 저장된 토큰을 메모리로 올린다 */
export function restoreTokens() {
  restoreTask ??= Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ])
    .then(([access, refresh]) => {
      accessToken = access
      refreshToken = refresh
    })
    .catch(() => {})
    .finally(emitAuth)
  return restoreTask
}

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access
  refreshToken = refresh
  writeStore(ACCESS_KEY, access)
  writeStore(REFRESH_KEY, refresh)
  emitAuth()
}

function subscribeAuth(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAuthStatus() {
  return useSyncExternalStore(subscribeAuth, () => status)
}

export function useSignedIn() {
  return useAuthStatus() === 'signedIn'
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(status: number, message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function apiBaseUrl() {
  return REMOTE_URL.replace(/\/$/, '')
}

/** 서버가 준 오류 문구. 없거나 네트워크 오류면 fallback / 연결 실패 문구 */
export function errorText(error: unknown, fallback = '잠시 후 다시 시도해 주세요') {
  if (!(error instanceof ApiError)) return '서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요'
  // 서버 메시지가 없으면 상태 코드만 들어 있다
  if (error.message && !/^\d+$/.test(error.message)) return error.message
  return fallback
}

export function remoteErrorText(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return '로그인 후 볼 수 있어요'
  }
  if (error instanceof ApiError && error.message) return error.message
  return '불러오지 못했어요'
}

type ApiOptions = RequestInit & { auth?: boolean; retry?: boolean }

let reissueTask: Promise<boolean> | null = null

function reissueAccessToken() {
  if (!refreshToken) return Promise.resolve(false)
  if (!reissueTask) {
    const current = refreshToken
    reissueTask = apiFetch<ApiResponse<Pick<AuthSession, 'accessToken' | 'refreshToken'>>>(
      '/api/auth/reissue',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: current }),
        auth: false,
        retry: false,
      },
    )
      .then((res) => {
        const nextAccess = res.result?.accessToken
        if (!nextAccess) return false
        setTokens(nextAccess, res.result.refreshToken || current)
        return true
      })
      .catch((error: unknown) => {
        // 재발급 토큰도 만료·폐기됐을 때만 로그아웃한다. 네트워크 오류로는 로그인을 풀지 않는다
        if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
          setTokens(null, null)
        }
        return false
      })
      .finally(() => {
        reissueTask = null
      })
  }
  return reissueTask
}

export async function apiFetch<T>(path: string, options?: ApiOptions): Promise<T> {
  const { auth = true, retry = true, ...init } = options ?? {}
  const headers = new Headers(init.headers)
  // FormData(사진 업로드)는 fetch 가 boundary 를 붙여 Content-Type 을 정한다
  if (typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (auth && accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers })
  const text = await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `${res.status}`
    const code =
      data && typeof data === 'object' && 'code' in data && typeof data.code === 'string'
        ? data.code
        : undefined
    // 토큰이 만료되면 서버는 본문 없이 403을 준다 (Spring Security 기본 동작).
    // 오류 코드가 있으면(예: 현재 비밀번호 불일치 401 AUTH4010) 토큰 문제가 아니라서 재발급하지 않는다
    const tokenRejected = (res.status === 401 || res.status === 403) && !code
    if (retry && auth && tokenRejected && refreshToken) {
      const refreshed = await reissueAccessToken()
      if (refreshed) return apiFetch<T>(path, { ...options, retry: false })
    }
    throw new ApiError(res.status, message, code)
  }

  if (data && typeof data === 'object' && 'isSuccess' in data && data.isSuccess === false) {
    const body = data as ApiResponse<unknown>
    throw new ApiError(res.status, body.message || '요청에 실패했어요', body.code)
  }

  return data as T
}

function safeJson(text: string) {
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}
