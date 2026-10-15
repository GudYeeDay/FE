import type { ImageSourcePropType } from 'react-native'
import { useQuery } from '@tanstack/react-query'

export type CalendarRecord = {
  /** YYYY-MM-DD */
  date: string
  photo: ImageSourcePropType
}

export type CalendarData = {
  records: CalendarRecord[]
  /** 보여줄 달 목록 (오래된 달 → 이번 달) */
  months: { year: number; month: number }[]
}

// TODO: 캘린더 기록 API 연동 후 목업 삭제
const MOCK_PHOTOS = [
  require('../../../assets/mock/day-1.jpg'),
  require('../../../assets/mock/day-2.jpg'),
  require('../../../assets/mock/day-3.jpg'),
  require('../../../assets/mock/day-4.jpg'),
  require('../../../assets/mock/day-5.jpg'),
  require('../../../assets/mock/day-6.jpg'),
  require('../../../assets/mock/day-7.jpg'),
]
const MOCK_DATES = [
  '2026-09-14',
  '2026-09-16',
  '2026-09-17',
  '2026-09-21',
  '2026-10-01',
  '2026-10-05',
  '2026-10-06',
  '2026-10-08',
  '2026-10-10',
]

async function fetchCalendar(): Promise<CalendarData> {
  await new Promise((r) => setTimeout(r, 200))
  const records = MOCK_DATES.map((date, i) => ({
    date,
    photo: MOCK_PHOTOS[i % MOCK_PHOTOS.length],
  }))

  // 첫 기록이 있는 달부터 이번 달까지
  const [firstYear, firstMonth] = records[0].date.split('-').map(Number)
  const now = new Date()
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
