import { useSyncExternalStore } from 'react'
import * as SecureStore from 'expo-secure-store'

import type { AuthSession } from '@/api/types'

/** 가입 방식. 소셜 계정은 비밀번호를 바꿀 수 없다 */
export type LoginProvider = 'email' | 'apple' | 'google'

export type NotificationSettings = {
  /** 오늘의 굳이: 당일 기록이 없으면 저녁에 알림 */
  today: boolean
  /** 미션 리마인드: 미션 시작 후 기록이 없으면 알림 */
  remind: boolean
  /** 서비스 업데이트 알림 */
  update: boolean
}

/**
 * 프로필 API 에 없는 내 정보.
 * - 이메일·가입 방식: 로그인 응답에서 받아 기기에 저장한다
 * - 알림 설정: 서버 API 가 없어 이 기기에서만 유지된다
 * 이름·가입 일수·통계는 서버 프로필(features/my/api.ts useMyProfile)을 쓴다
 */
type MyState = {
  email: string
  provider: LoginProvider
  notifications: NotificationSettings
}

const ACCOUNT_KEY = 'gyd.account'
const PROVIDER: Record<AuthSession['provider'], LoginProvider> = { LOCAL: 'email', GOOGLE: 'google' }
const DEFAULT_STATE: MyState = {
  email: '',
  provider: 'email',
  notifications: { today: true, remind: true, update: true },
}

let state = DEFAULT_STATE
const listeners = new Set<() => void>()

function set(next: MyState) {
  state = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMyInfo() {
  return useSyncExternalStore(subscribe, () => state)
}

export const myActions = {
  /** 앱 시작 시 저장해 둔 계정 정보를 읽는다 */
  async restore() {
    const saved = await SecureStore.getItemAsync(ACCOUNT_KEY).catch(() => null)
    if (!saved) return
    try {
      const { email, provider } = JSON.parse(saved) as Pick<MyState, 'email' | 'provider'>
      set({ ...state, email, provider })
    } catch {
      // 형식이 바뀐 옛 값은 무시
    }
  },
  /** 로그인·회원가입 성공 시 */
  setAccount(session: Pick<AuthSession, 'email' | 'provider'>) {
    const account = { email: session.email, provider: PROVIDER[session.provider] ?? 'email' }
    set({ ...state, ...account })
    SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(account)).catch(() => {})
  },
  clear() {
    set(DEFAULT_STATE)
    SecureStore.deleteItemAsync(ACCOUNT_KEY).catch(() => {})
  },
  setNotifications(patch: Partial<NotificationSettings>) {
    set({ ...state, notifications: { ...state.notifications, ...patch } })
  },
}
