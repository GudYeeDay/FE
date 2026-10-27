import { useSyncExternalStore } from 'react'

export type NotificationSettings = {
  all: boolean
  today: boolean
  remind: boolean
  feed: boolean
}

type Profile = {
  nickname: string
  email: string
  notifications: NotificationSettings
  setNickname: (nickname: string) => void
  setNotifications: (patch: Partial<NotificationSettings>) => void
}

const INITIAL_NOTIFICATIONS: NotificationSettings = {
  all: false,
  today: true,
  remind: true,
  feed: true,
}

let nickname = 'Pawket'
let notifications: NotificationSettings = { ...INITIAL_NOTIFICATIONS }
const listeners = new Set<() => void>()

function snapshot(): Profile {
  return {
    nickname,
    email: 'Pawket@gmail.com',
    notifications,
    setNickname: (next) => {
      nickname = next
      emit()
    },
    setNotifications: (patch) => {
      notifications = { ...notifications, ...patch }
      emit()
    },
  }
}

let current = snapshot()

function emit() {
  current = snapshot()
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useProfile() {
  return useSyncExternalStore(subscribe, () => current, () => current)
}
