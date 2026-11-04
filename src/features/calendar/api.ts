import { useQueries } from '@tanstack/react-query'

import { apiFetch, useSignedIn } from '@/api/http'
import type { ApiResponse, CalendarResponse } from '@/api/types'

/** 캘린더 한 칸. 그날 가장 최근 기록의 사진 */
export type CalendarDay = {
  /** YYYY-MM-DD */
  date: string
  photo: { uri: string }
}

export type CalendarMonth = { year: number; month: number }

const pad = (n: number) => String(n).padStart(2, '0')

/** 가입한 달부터 이번 달까지. days 는 가입일을 1일째로 센 날수 (마이페이지 프로필) */
export function monthsSinceSignup(days: number, today = new Date()): CalendarMonth[] {
  const joined = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1))
  const months: CalendarMonth[] = []
  const last = today.getFullYear() * 12 + today.getMonth()
  for (let i = joined.getFullYear() * 12 + joined.getMonth(); i <= last; i++) {
    months.push({ year: Math.floor(i / 12), month: (i % 12) + 1 })
  }
  return months
}

async function fetchMonth({ year, month }: CalendarMonth): Promise<CalendarDay[]> {
  const { result } = await apiFetch<ApiResponse<CalendarResponse>>(
    `/api/calender?yearMonth=${year}-${pad(month)}`,
  )
  return (result?.calenderRecordResponseList ?? []).flatMap((r) => {
    const date = r.CompleteDate ?? r.completeDate
    const uri = r.ImageUrl ?? r.imageUrl
    return date && uri ? [{ date, photo: { uri } }] : []
  })
}

/** 달마다 따로 불러와서 날짜 → 칸으로 합친다 */
export function useCalendar(months: CalendarMonth[]) {
  const signedIn = useSignedIn()
  return useQueries({
    queries: months.map((m) => ({
      queryKey: ['calendar', m.year, m.month],
      enabled: signedIn,
      queryFn: () => fetchMonth(m),
    })),
    combine: combineMonths,
  })
}

function combineMonths(results: { data?: CalendarDay[]; isPending: boolean }[]) {
  const days = new Map<string, CalendarDay>()
  for (const r of results) for (const day of r.data ?? []) days.set(day.date, day)
  return { days, isPending: results.some((r) => r.isPending) }
}
