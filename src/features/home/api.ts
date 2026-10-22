import { useQuery } from '@tanstack/react-query'

import { toISODate } from '@/lib/date'
import { coverRecords, getRecordState } from '@/features/record/store'
import type { MissionRecord } from '@/features/record/types'

export type DayRecord = {
  date: Date
  /** 그날의 대표 기록. 기록이 없는 날은 없음 */
  cover?: MissionRecord
}

export type HomeSummary = {
  nickname: string
  recordDays: number
  week: DayRecord[]
  pastRecords: MissionRecord[]
}

/** 오늘이 속한 주의 월요일 */
export function startOfWeek(today: Date) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = (d.getDay() + 6) % 7 // 월=0 ... 일=6
  d.setDate(d.getDate() - diff)
  return d
}

// TODO: 홈 요약 API 연동. 지금은 기록 스토어(목업)에서 만든다
async function fetchHomeSummary(): Promise<HomeSummary> {
  await new Promise((r) => setTimeout(r, 200))
  const covers = coverRecords(getRecordState())
  const coverByDate = new Map(covers.map((r) => [r.date, r]))

  const monday = startOfWeek(new Date())
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return { date, cover: coverByDate.get(toISODate(date)) }
  })

  // Figma 개발 주석: 지난 낭만들은 "랜덤으로 5개"
  const pastRecords = [...getRecordState().records].sort(() => Math.random() - 0.5).slice(0, 5)

  return { nickname: 'Pawket', recordDays: covers.length, week, pastRecords }
}

export function useHomeSummary() {
  return useQuery({ queryKey: ['home', 'summary'], queryFn: fetchHomeSummary })
}
