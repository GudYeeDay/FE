import { useSyncExternalStore } from 'react'

import type { ApiResponse, AuthSession } from '@/api/types'
import { useSession } from '@/features/auth/session'

const REMOTE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'http://ec2-15-164-237-188.ap-northeast-2.compute.amazonaws.com'

const ACCESS_KEY = 'gyd.accessToken'
const REFRESH_KEY = 'gyd.refreshToken'
const EMAIL_KEY = 'gyd.email'

function readStore(key: string) {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key: string, value: string | null) {
  try {
    if (typeof localStorage === 'undefined') return
    if (value) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  } catch {
    // 저장소를 쓸 수 없어도 이번 실행의 로그인은 유지한다.
  }
}

let accessToken = readStore(ACCESS_KEY)
let refreshToken = readStore(REFRESH_KEY)
let accountEmail = readStore(EMAIL_KEY)
let signedIn = accessToken != null
const listeners = new Set<() => void>()

function emitAuth() {
  signedIn = accessToken != null
  for (const listener of listeners) listener()
}

export function getAccessToken() {
  return accessToken
}

export function getAccountEmail() {
  return accountEmail
}

export function setAccountEmail(email: string | null) {
  accountEmail = email
  writeStore(EMAIL_KEY, email)
}

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access
  refreshToken = refresh
  writeStore(ACCESS_KEY, access)
  writeStore(REFRESH_KEY, refresh)
  if (!access) setAccountEmail(null)
  emitAuth()
}

export function setAccessToken(token: string | null) {
  setTokens(token, token ? refreshToken : null)
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSignedIn() {
  const hasToken = useSyncExternalStore(subscribeAuth, () => signedIn, () => signedIn)
  const { isSignedIn } = useSession()
  return hasToken || isSignedIn
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
      .catch(() => {
        setTokens(null, null)
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
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (auth && accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers })
  const text = await res.text()
  const data = text ? safeJson(text) : undefined

  if (!res.ok) {
    if (retry && auth && res.status === 401 && refreshToken && !path.startsWith('/api/auth/')) {
      const refreshed = await reissueAccessToken()
      if (refreshed) return apiFetch<T>(path, { ...options, retry: false })
    }
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `${res.status}`
    const code =
      data && typeof data === 'object' && 'code' in data && typeof data.code === 'string'
        ? data.code
        : undefined
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
