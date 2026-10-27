import { useSyncExternalStore } from 'react'

import { shiftDateKey, todayKey } from '@/features/mission/date'

export type MissionStatus = 'active' | 'done' | 'archived'

export type Mission = {
  id: string
  title: string
  memo: string
  /** YYYY-MM-DD */
  date: string
  status: MissionStatus
}

export type FeedPost = {
  id: string
  /** 이 기록을 만든 미션. 같은 날짜에 미션이 여러 개여도 기록을 구분한다 */
  missionId?: string
  title: string
  body: string
  date: string
  /** 사진을 찍은 장소 */
  place?: string
  /** 완료 기록에 첨부한 사진. 없으면 기본 썸네일을 쓴다 */
  photoUri?: string
}

const STATUS_LABEL: Record<MissionStatus, string> = {
  active: '진행 중',
  done: '완료',
  archived: '보관',
}

export function missionStatusLabel(status: MissionStatus) {
  return STATUS_LABEL[status]
}

function highestSeq(ids: string[]) {
  return ids.reduce((max, id) => {
    const n = Number(id.split('-')[1])
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
}

let seq = 0
function nextId(prefix: string) {
  seq += 1
  return `${prefix}-${seq}`
}

const seedMissions: Mission[] = [
  {
    id: 'm-1',
    title: '창가에서 커피 마시기',
    memo: '오전에 창가 자리를 맡아 두기',
    date: todayKey(),
    status: 'active',
  },
  {
    id: 'm-2',
    title: '퇴근길 노을 보기',
    memo: '이어폰 없이 10분만 걷기',
    date: shiftDateKey(-1),
    status: 'active',
  },
  {
    id: 'm-3',
    title: '동네 골목 지도 없이 걸어보기',
    memo: '지도 없이 동네 골목을 걸어보기.\n익숙한 길도, 모르는 골목도 한 번은 들어가 보기.',
    date: '2026-08-29',
    status: 'done',
  },
  {
    id: 'm-4',
    title: '좋아하는 노래 가사 손글씨로 적기',
    memo: '사람 많은 카페여도 굳이 창가 자리를 찾아서 앉아보기.\n오래 걸려도, 자리가 없어도 한 번은 기다려보기.',
    date: '2026-08-29',
    status: 'archived',
  },
  {
    id: 'm-5',
    title: '좋아하는 노래 가사 손글씨로 적기',
    memo: '사람 많은 카페여도 굳이 창가 자리를 찾아서 앉아보기.\n오래 걸려도, 자리가 없어도 한 번은 기다려보기.',
    date: '2026-08-29',
    status: 'archived',
  },
]

const seedFeeds: FeedPost[] = [
  {
    id: 'f-1',
    missionId: 'm-3',
    title: '동네 골목 지도 없이 걸어보기',
    body: '지도 없이 동네 골목을 걸었다. 익숙한 길도, 모르는 골목도 한 번은 들어가 보았다.',
    date: '2026-08-29',
    place: '동네 골목',
  },
]

seq = highestSeq([...seedMissions, ...seedFeeds].map((item) => item.id))

let missions = seedMissions
let feeds = seedFeeds
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version += 1
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const actions = {
  addMission: ({ title, memo }: { title: string; memo: string }) => {
    missions = [
      {
        id: nextId('m'),
        title: title.trim(),
        memo: memo.trim(),
        date: todayKey(),
        status: 'active',
      },
      ...missions,
    ]
    emit()
  },
  completeMission: (id: string) => {
    const target = missions.find((mission) => mission.id === id && mission.status === 'active')
    if (!target) return
    missions = missions.map((mission) => (mission.id === id ? { ...mission, status: 'done' as const } : mission))
    feeds = [
      {
        id: nextId('f'),
        missionId: target.id,
        title: target.title,
        body: target.memo || target.title,
        date: target.date,
      },
      ...feeds,
    ]
    emit()
  },
  archiveMission: (id: string) => {
    missions = missions.map((mission) =>
      mission.id === id && mission.status === 'done' ? { ...mission, status: 'archived' as const } : mission,
    )
    emit()
  },
  startMission: (id: string) => {
    missions = missions.map((mission) =>
      mission.id === id && mission.status === 'archived'
        ? { ...mission, status: 'active' as const, date: todayKey() }
        : mission,
    )
    emit()
  },
  updateMission: (id: string, input: { title: string; memo: string }) => {
    missions = missions.map((mission) =>
      mission.id === id ? { ...mission, title: input.title.trim(), memo: input.memo.trim() } : mission,
    )
    emit()
  },
  deleteMission: (id: string) => {
    missions = missions.filter((mission) => mission.id !== id)
    feeds = feeds.filter((post) => post.missionId !== id)
    emit()
  },
  updateFeed: (id: string, input: { title: string; body: string; place: string }) => {
    feeds = feeds.map((post) =>
      post.id === id
        ? { ...post, title: input.title.trim(), body: input.body.trim(), place: input.place.trim() }
        : post,
    )
    emit()
  },
  deleteFeed: (id: string) => {
    feeds = feeds.filter((post) => post.id !== id)
    emit()
  },
  addRecord: (input: {
    title: string
    body: string
    date: string
    place?: string
    photoUri?: string
    missionId?: string
  }) => {
    feeds = [
      {
        id: nextId('f'),
        missionId: input.missionId,
        title: input.title.trim(),
        body: input.body.trim(),
        date: input.date,
        place: input.place?.trim() || undefined,
        photoUri: input.photoUri,
      },
      ...feeds,
    ]
    emit()
  },
}

export function useMissions() {
  useSyncExternalStore(subscribe, () => version, () => version)
  return { missions, feeds, ...actions }
}
