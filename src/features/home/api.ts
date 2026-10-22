import type { ImageSourcePropType } from 'react-native'
import { useQuery } from '@tanstack/react-query'

export type DayRecord = {
  date: Date
  photo?: ImageSourcePropType
}

export type PastRecord = {
  id: string
  title: string
  body: string
  date: string
  place: string
  photo: ImageSourcePropType
}

export type HomeSummary = {
  nickname: string
  recordDays: number
  week: DayRecord[]
  pastRecords: PastRecord[]
}

// TODO: 홈 요약 API 연동 후 아래 목업 삭제
const MOCK_PHOTOS = [
  require('../../../assets/mock/day-1.jpg'),
  require('../../../assets/mock/day-2.jpg'),
  require('../../../assets/mock/day-3.jpg'),
  require('../../../assets/mock/day-4.jpg'),
  require('../../../assets/mock/day-5.jpg'),
  require('../../../assets/mock/day-6.jpg'),
  require('../../../assets/mock/day-7.jpg'),
]

/** 오늘이 속한 주의 월요일 */
export function startOfWeek(today: Date) {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diff = (d.getDay() + 6) % 7 // 월=0 ... 일=6
  d.setDate(d.getDate() - diff)
  return d
}

async function fetchHomeSummary(): Promise<HomeSummary> {
  await new Promise((r) => setTimeout(r, 200))
  const monday = startOfWeek(new Date())
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return { date, photo: MOCK_PHOTOS[i] }
  })

  // Figma 개발 주석: 지난 낭만들은 "랜덤으로 5개"
  const pastRecords = [3, 4, 1, 5, 0]
    .sort(() => Math.random() - 0.5)
    .map((photoIndex, i) => ({
      id: `r${i}`,
      title: '퇴근길 한 정거장 걸어보기',
      body: '한 정거장 일찍 내려서 걸었다. 노을이 다 지기 전에 집에 도착해서 다행이었다.',
      date: '2026.09.14',
      place: '퇴근길 버스정류장',
      photo: MOCK_PHOTOS[photoIndex],
    }))

  return { nickname: 'Pawket', recordDays: 12, week, pastRecords }
}

export function useHomeSummary() {
  return useQuery({ queryKey: ['home', 'summary'], queryFn: fetchHomeSummary })
}
