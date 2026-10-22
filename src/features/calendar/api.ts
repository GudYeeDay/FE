import { useQuery } from '@tanstack/react-query'

import { coverRecords, getRecordState } from '@/features/record/store'
import type { MissionRecord } from '@/features/record/types'

export type CalendarData = {
  /** 날짜별 대표 기록 */
  records: MissionRecord[]
  /** 보여줄 달 목록 (오래된 달 → 이번 달) */
  months: { year: number; month: number }[]
}

// TODO: 캘린더 기록 API 연동. 지금은 기록 스토어(목업)에서 만든다
async function fetchCalendar(): Promise<CalendarData> {
  await new Promise((r) => setTimeout(r, 200))
  const records = coverRecords(getRecordState())

  // 첫 기록이 있는 달부터 이번 달까지
  const now = new Date()
  const [firstYear, firstMonth] = records[0]
    ? records[0].date.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1]
  const last = now.getFullYear() * 12 + now.getMonth()
  const months: CalendarData['months'] = []
  for (let i = firstYear * 12 + (firstMonth - 1); i <= last; i++) {
    months.push({ year: Math.floor(i / 12), month: (i % 12) + 1 })
  }
  return { records, months }
}

export function useCalendar() {
  return useQuery({ queryKey: ['calendar'], queryFn: fetchCalendar })
}
