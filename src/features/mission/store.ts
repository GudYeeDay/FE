import { useSyncExternalStore } from 'react'

import type { ArchiveItem, Mission } from './types'

/**
 * 진행 중인 미션과 보관함 목록.
 * 홈 배너, 추천 모달, 보관함이 함께 쓰는 작은 전역 상태라 Provider 없이 모듈 스토어로 둔다.
 * TODO: 미션·보관함 API 가 생기면 서버 상태(useQuery/useMutation)로 옮긴다
 */
type State = {
  active: Mission | null
  archive: ArchiveItem[]
}

// TODO: 보관함 API 연동 후 목업 초기값 삭제
const MOCK_ARCHIVE: ArchiveItem[] = [
  {
    mission: {
      id: 'm3',
      title: '동네 골목 지도 없이 걸어보기',
      description: '처음 보는 골목으로\n일부러 길을 잃어보기',
    },
    status: 'done',
    savedAt: '2026-08-20',
    doneAt: '2026-08-29',
  },
  {
    mission: {
      id: 'c-song',
      title: '좋아하는 노래 가사 손글씨로 적기',
      description: '가장 많이 들은 노래 한 곡을 골라\n가사를 천천히 손으로 옮겨 적어보기.',
    },
    status: 'saved',
    savedAt: '2026-08-29',
  },
  {
    mission: {
      id: 'm2',
      title: '혼자 가는 카페에서 창가 자리 앉기',
      description:
        '사람 많은 카페여도 굳이 창가 자리를 찾아서 앉아보기.\n오래 걸려도, 자리가 없어도 한 번은 기다려보기.',
    },
    status: 'saved',
    savedAt: '2026-09-02',
  },
]

let state: State = { active: null, archive: MOCK_ARCHIVE }
const listeners = new Set<() => void>()

function setState(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** selector 는 state 안의 값을 그대로 돌려줘야 한다 (새 객체를 만들면 매번 다시 그려짐) */
export function useMissionStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

const today = () => new Date().toISOString().slice(0, 10)

export const missionActions = {
  /** 이미 진행 중인 미션이 있으면 false (한 번에 하나만 진행 가능) */
  start(mission: Mission) {
    if (state.active) return false
    setState({ active: mission })
    return true
  },
  quit() {
    setState({ active: null })
  },
  /** 추천 카드 북마크: 저장 안 된 미션이면 보관함에 넣고, 저장된 미션이면 뺀다 */
  toggleSaved(mission: Mission) {
    const exists = state.archive.some((a) => a.mission.id === mission.id && a.status === 'saved')
    setState({
      archive: exists
        ? state.archive.filter((a) => !(a.mission.id === mission.id && a.status === 'saved'))
        : [...state.archive, { mission, status: 'saved', savedAt: today() }],
    })
  },
  addCustom(input: { title: string; description: string }) {
    const mission = { id: `c-${Date.now()}`, ...input }
    setState({ archive: [...state.archive, { mission, status: 'saved', savedAt: today() }] })
    return mission
  },
  update(id: string, input: { title: string; description: string }) {
    setState({
      archive: state.archive.map((a) =>
        a.mission.id === id ? { ...a, mission: { ...a.mission, ...input } } : a,
      ),
    })
  },
  remove(id: string) {
    setState({ archive: state.archive.filter((a) => a.mission.id !== id) })
  },
}

/** "2026-08-29" → "8.29" */
export function formatMonthDay(iso: string) {
  const [, m, d] = iso.split('-').map(Number)
  return `${m}.${d}`
}
