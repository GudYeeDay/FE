import { useEffect } from 'react'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import { useRouter } from 'expo-router'
import type * as Messaging from '@react-native-firebase/messaging'

import { apiFetch } from '@/api/http'
import type { ApiResponse } from '@/api/types'

/**
 * FCM 푸시. 로그인하면 알림 권한을 묻고 기기 토큰을 서버에 등록하고,
 * 알림을 눌러 앱이 열리면 알림 상세로 보낸다.
 *
 * Expo Go 에는 Firebase 네이티브 모듈이 없어서 아무것도 하지 않는다 (TestFlight 빌드에서만 동작)
 */
const pushAvailable = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient

function loadMessaging(): typeof Messaging | null {
  if (!pushAvailable) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/messaging') as typeof Messaging
  } catch {
    return null
  }
}

/** 서버에 등록한 토큰. 로그아웃할 때 해제한다 */
let registeredToken: string | null = null

async function registerToken(token: string) {
  await apiFetch<ApiResponse<unknown>>('/api/notifications/device-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
  registeredToken = token
}

/** 로그아웃 직전에 부른다 (인증 토큰이 아직 있어야 서버가 받는다). 실패해도 로그아웃은 계속 */
export async function unregisterPushToken() {
  const token = registeredToken
  registeredToken = null
  if (!token) return
  await apiFetch('/api/notifications/device-token', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  }).catch(() => {})
}

// AuthorizationStatus: -1 미결정, 0 거부, 1 허용, 2 임시 허용, 3 임시(App Clip)
const GRANTED = 1

export function usePushNotifications(signedIn: boolean) {
  const router = useRouter()

  // 알림을 눌러 앱이 열리면 알림 상세로
  useEffect(() => {
    const m = loadMessaging()
    if (!m || !signedIn) return
    const messaging = m.getMessaging()
    const open = (message: Awaited<ReturnType<typeof m.getInitialNotification>>) => {
      const id = message?.data?.notificationId
      if (typeof id === 'string' && id) router.push(`/notifications/${id}`)
      else if (message) router.push('/notifications')
    }
    m.getInitialNotification(messaging).then(open).catch(() => {})
    return m.onNotificationOpenedApp(messaging, open)
  }, [signedIn, router])

  // 로그인되면 권한 요청 → 토큰 등록. 토큰이 바뀌면 다시 등록
  useEffect(() => {
    const m = loadMessaging()
    if (!m || !signedIn) return
    const messaging = m.getMessaging()
    let cancelled = false

    ;(async () => {
      const status = await m.requestPermission(messaging)
      if (cancelled || status < GRANTED) return
      const token = await m.getToken(messaging)
      if (!cancelled && token) await registerToken(token)
    })().catch(() => {})

    const unsubscribe = m.onTokenRefresh(messaging, (token) => {
      registerToken(token).catch(() => {})
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [signedIn])
}
