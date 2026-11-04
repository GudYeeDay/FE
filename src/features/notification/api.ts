import { useQuery, useQueryClient } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, NotificationResponse } from '@/api/types'

/**
 * 알림 상태. 서버는 읽음 여부만 알려준다.
 * - new: 아직 열지 않은 알림. 목록에 빨간 점, 홈 종 아이콘에도 빨간 점
 * - read: 열어본 알림. 회색 글씨
 * Figma 의 "봤지만 안 연 알림(unread)" 단계는 서버에 없어서 쓰지 않는다
 */
export type NotificationStatus = 'new' | 'read'

export type AppNotification = {
  id: number
  title: string
  body: string
  /** 알림함 목록 아래 시간 문구 */
  timeLabel: string
  status: NotificationStatus
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 오늘·어제는 "오늘 오후 8:00", 그 전은 "10월 18일" */
export function timeLabel(iso: string, now = new Date()) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const dayDiff = Math.floor((startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000)
  if (dayDiff > 1 || dayDiff < 0) return `${d.getMonth() + 1}월 ${d.getDate()}일`
  const hour = d.getHours()
  const time = `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${pad(d.getMinutes())}`
  return `${dayDiff === 0 ? '오늘' : '어제'} ${time}`
}

const toNotification = (n: NotificationResponse): AppNotification => ({
  id: n.notificationId,
  title: n.title,
  body: n.content,
  timeLabel: timeLabel(n.createdAt),
  status: n.read ? 'read' : 'new',
})

export function useNotifications() {
  const signedIn = useSignedIn()
  return useQuery({
    queryKey: ['notifications'],
    enabled: signedIn,
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<NotificationResponse[]>>('/api/notifications')
      return (res.result ?? []).map(toNotification)
    },
  })
}

/** 상세를 열면 서버가 읽음 처리한다. 목록·홈 빨간 점을 다시 불러온다 */
export function useNotification(id: number) {
  const signedIn = useSignedIn()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['notifications', id],
    enabled: signedIn && Number.isFinite(id),
    queryFn: async () => {
      const res = await apiFetch<ApiResponse<NotificationResponse>>(`/api/notifications/${id}`)
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: true })
      queryClient.invalidateQueries({ queryKey: ['home'] })
      return toNotification(res.result)
    },
  })
}
