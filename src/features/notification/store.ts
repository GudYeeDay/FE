import { useSyncExternalStore } from 'react'

/**
 * 알림 상태 (Figma 알림함 주석 기준)
 * - new: 새로운 알림. 목록에 빨간 점, 홈 종 아이콘에도 빨간 점
 * - unread: 알림함에서 봤지만 아직 열지 않은 알림. 진한 글씨
 * - read: 열어본 알림. 회색 글씨
 */
export type NotificationStatus = 'new' | 'unread' | 'read'

export type AppNotification = {
  id: string
  title: string
  body: string
  /** 알림함 목록 아래 시간 문구 */
  timeLabel: string
  status: NotificationStatus
}

// TODO: 알림 API(목록, 읽음 처리) 연동 후 목업 삭제. 문구는 Figma 알림함·푸시알림 시안에서 가져옴
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: '아직 오늘의 굳이를 안 남기셨네요',
    body: '혼자 가는 카페에서 창가 자리 앉기 - 잊지 않으셨죠?',
    timeLabel: '오늘 오후 8:00',
    status: 'new',
  },
  {
    id: 'n2',
    title: '오늘의 굳이',
    body: '오늘은 평소와 조금 다른 일을 해보는 건 어때요?',
    timeLabel: '오늘 오전 9:00',
    status: 'new',
  },
  {
    id: 'n3',
    title: '미션 리마인드',
    body: '오늘 해본 경험을 사진과 글로 남겨보세요.',
    timeLabel: '어제 오후 8:00',
    status: 'unread',
  },
  {
    id: 'n4',
    title: '서비스 업데이트',
    body: '굳이가 더 편리해졌어요. 새로운 소식을 확인해 보세요.',
    timeLabel: '10월 18일',
    status: 'read',
  },
]

let notifications = MOCK_NOTIFICATIONS
const listeners = new Set<() => void>()

function set(next: AppNotification[]) {
  notifications = next
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, () => notifications)
}

export function useHasNewNotification() {
  return useSyncExternalStore(subscribe, () => notifications.some((n) => n.status === 'new'))
}

export const notificationActions = {
  /** 알림함을 보고 나가면 새 알림은 "안 읽은 알림"이 된다 (빨간 점 사라짐) */
  markAllSeen() {
    if (!notifications.some((n) => n.status === 'new')) return
    set(notifications.map((n) => (n.status === 'new' ? { ...n, status: 'unread' } : n)))
  },
  markRead(id: string) {
    set(notifications.map((n) => (n.id === id ? { ...n, status: 'read' } : n)))
  },
}
