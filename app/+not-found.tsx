import { Redirect } from 'expo-router'

import { useSession } from '@/features/auth/session'

/**
 * 맞는 화면이 없을 때. 로그인 전에는 홈('/')이 Stack.Protected 로 빠져서
 * 앱을 처음 열면 '/' 가 여기로 온다. 로그인 상태에 따라 첫 화면으로 보낸다
 */
export default function NotFound() {
  const { isSignedIn } = useSession()
  return <Redirect href={isSignedIn ? '/' : '/login'} />
}
