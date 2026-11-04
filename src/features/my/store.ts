import { useSyncExternalStore } from 'react'

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

export type MyProfile = {
  name: string
  email: string
  provider: LoginProvider
  /** YYYY-MM-DD */
  joinedAt: string
  notifications: NotificationSettings
}

// TODO: 내 정보 조회 API 연동 후 목업 삭제
const MOCK_PROFILE: MyProfile = {
  name: 'Pawket',
  email: 'Pawket@gmail.com',
  provider: 'email',
  joinedAt: '2026-10-14',
  notifications: { today: true, remind: true, update: true },
}

let profile = MOCK_PROFILE
const listeners = new Set<() => void>()

function set(next: MyProfile) {
  profile = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMyProfile() {
  return useSyncExternalStore(subscribe, () => profile)
}

export const myActions = {
  // TODO: 이름 변경 API 연동
  setName(name: string) {
    set({ ...profile, name })
  },
  // TODO: 알림 설정 API 연동
  setNotifications(patch: Partial<NotificationSettings>) {
    set({ ...profile, notifications: { ...profile.notifications, ...patch } })
  },
}
