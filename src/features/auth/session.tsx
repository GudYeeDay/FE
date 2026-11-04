import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

import { apiFetch, restoreTokens, setTokens, useAuthStatus } from '@/api/http'
import { queryClient } from '@/lib/query-client'

type Session = {
  /** 저장된 토큰을 아직 읽는 중. 이때는 스플래시를 유지한다 */
  isRestoring: boolean
  isSignedIn: boolean
  /** 서버 로그아웃(재발급 토큰 폐기)은 실패해도 기기의 토큰은 지운다 */
  signOut: () => Promise<void>
}

const SessionContext = createContext<Session | null>(null)

/**
 * 로그인 상태. 토큰은 expo-secure-store 에 저장하고 앱 시작 시 복원한다.
 * 로그인·회원가입은 features/auth/api.ts 에서 토큰을 저장하면 여기에 반영된다.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const status = useAuthStatus()

  useEffect(() => {
    restoreTokens()
  }, [])

  const value = useMemo(
    () => ({
      isRestoring: status === 'restoring',
      isSignedIn: status === 'signedIn',
      signOut: async () => {
        await apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        setTokens(null, null)
        queryClient.clear()
      },
    }),
    [status],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession 은 SessionProvider 안에서만 쓸 수 있습니다')
  return ctx
}
