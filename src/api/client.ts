const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * fetch 래퍼. BASE_URL 접두, JSON 직렬화, 에러 throw를 담당한다.
 * 필요해지면 axios로 교체하거나 인터셉터(토큰 갱신 등)를 여기에 추가.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status} ${res.statusText}`)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
