import { useSyncExternalStore } from 'react'

import { toISODate, todayISO } from '@/lib/date'
import { queryClient } from '@/lib/query-client'
import type { Mission } from '@/features/mission/types'
import type { MissionRecord, RecordInput } from './types'

/**
 * 미션 완료 기록과 날짜별 대표 사진.
 * 홈·캘린더(목업 API)와 데일리 피드가 같은 기록을 보도록 모듈 스토어 하나에 둔다.
 * TODO: 기록 API 가 생기면 서버 상태(useQuery/useMutation)로 옮긴다
 */
type State = {
  records: MissionRecord[]
  /** 날짜 → 사용자가 직접 고른 대표 기록 id. 없으면 그날 가장 최근 기록이 대표 */
  covers: Record<string, string>
}

// TODO: 기록 API 연동 후 목업 삭제
const MOCK_PHOTOS = [
  require('../../../assets/mock/day-1.jpg'),
  require('../../../assets/mock/day-2.jpg'),
  require('../../../assets/mock/day-3.jpg'),
  require('../../../assets/mock/day-4.jpg'),
  require('../../../assets/mock/day-5.jpg'),
  require('../../../assets/mock/day-6.jpg'),
  require('../../../assets/mock/day-7.jpg'),
]
const MOCK_ENTRIES = [
  {
    title: '퇴근길 한 정거장 걸어보기',
    body: '한 정거장 일찍 내려서 걸었다. 노을이 다 지기 전에 집에 도착해서 다행이었다.',
    place: '퇴근길 버스정류장',
  },
  {
    title: '혼자 가는 카페에서 창가 자리 앉기',
    body: '오늘은 자주 가는 카페에 혼자 멍하니 창가 자리에 앉아있었다.',
    place: '동네 카페',
  },
  {
    title: '동네 골목 지도 없이 걸어보기',
    body: '처음 보는 골목에서 작은 꽃집을 발견했다. 다음에 또 가봐야지.',
    place: '',
  },
]

function createMockRecords(): MissionRecord[] {
  // 이번 주 월요일부터 어제까지 (홈 주간 사진 띠에 보이도록)
  const now = new Date()
  const thisWeek: string[] = []
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7),
  )
  for (let d = monday; toISODate(d) < todayISO(); d.setDate(d.getDate() + 1)) {
    thisWeek.push(toISODate(d))
  }

  const dates = [
    // 9월 14일은 기록이 두 개인 날 (Figma "피드 여러개인 경우")
    '2026-09-14',
    '2026-09-14',
    '2026-09-16',
    '2026-09-17',
    '2026-09-21',
    '2026-10-01',
    '2026-10-05',
    '2026-10-06',
    '2026-10-08',
    '2026-10-10',
    ...thisWeek,
  ]
  return dates.map((date, i) => {
    const entry = MOCK_ENTRIES[i % MOCK_ENTRIES.length]
    return {
      id: `rec-${i}`,
      missionId: `mock-${i}`,
      ...entry,
      date,
      photo: MOCK_PHOTOS[i % MOCK_PHOTOS.length],
      createdAt: new Date(`${date}T12:00:00`).getTime() + i,
    }
  })
}

let state: State = { records: createMockRecords(), covers: {} }
const listeners = new Set<() => void>()

function setState(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
  // 홈·캘린더 목업 API 가 이 스토어를 읽으므로 다시 불러오게 한다
  queryClient.invalidateQueries({ queryKey: ['home'] })
  queryClient.invalidateQueries({ queryKey: ['calendar'] })
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** selector 는 state 안의 값을 그대로 돌려줘야 한다 (새 객체를 만들면 매번 다시 그려짐) */
export function useRecordStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

/** 목업 API 에서 읽는 용도 */
export const getRecordState = () => state

/** 그날의 기록, 최근 것부터 */
export function recordsOn(records: MissionRecord[], date: string) {
  return records.filter((r) => r.date === date).sort((a, b) => b.createdAt - a.createdAt)
}

/** Figma 주석: 피드가 여러 개면 기본은 가장 최근 피드가 대표 사진, 사용자가 직접 지정할 수도 있음 */
export function coverIdOn(s: State, date: string) {
  const dayRecords = recordsOn(s.records, date)
  const picked = s.covers[date]
  return dayRecords.some((r) => r.id === picked) ? picked : dayRecords[0]?.id
}

/** 날짜별 대표 기록 (기록이 있는 날만) */
export function coverRecords(s: State) {
  const dates = [...new Set(s.records.map((r) => r.date))].sort()
  return dates.map((date) => s.records.find((r) => r.id === coverIdOn(s, date))!)
}

export const recordActions = {
  /** 진행 중이던 미션을 오늘 날짜로 기록한다 */
  add(mission: Mission, input: RecordInput) {
    const record: MissionRecord = {
      id: `rec-${Date.now()}`,
      missionId: mission.id,
      title: mission.title,
      date: todayISO(),
      createdAt: Date.now(),
      ...input,
    }
    setState({ records: [...state.records, record] })
    return record
  },
  update(id: string, input: RecordInput) {
    setState({ records: state.records.map((r) => (r.id === id ? { ...r, ...input } : r)) })
  },
  remove(id: string) {
    setState({ records: state.records.filter((r) => r.id !== id) })
  },
  setCover(date: string, id: string) {
    setState({ covers: { ...state.covers, [date]: id } })
  },
}
