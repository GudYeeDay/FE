import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type Session = {
  isSignedIn: boolean
  signIn: () => void
  signOut: () => void
}

const SessionContext = createContext<Session | null>(null)

/**
 * 로그인 상태. 지금은 API 가 없어서 메모리에만 들고 있다.
 * TODO: 로그인 API 연동 시 토큰을 expo-secure-store 에 저장하고 앱 시작 시 복원
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setSignedIn] = useState(false)

  const value = useMemo(
    () => ({
      isSignedIn,
      signIn: () => setSignedIn(true),
      signOut: () => setSignedIn(false),
    }),
    [isSignedIn],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession 은 SessionProvider 안에서만 쓸 수 있습니다')
  return ctx
}
