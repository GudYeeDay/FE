import { useSyncExternalStore } from 'react'

import type { Mission } from './types'

/**
 * 진행 중인 미션과 저장(북마크)한 미션.
 * 화면 여러 곳(홈 배너, 추천 모달)에서 같이 쓰는 작은 전역 상태라 Provider 없이 모듈 스토어로 둔다.
 * TODO: 서버 상태가 생기면 진행 중 미션은 API(useQuery) 기준으로 옮긴다
 */
type State = {
  active: Mission | null
  savedIds: ReadonlySet<string>
}

let state: State = { active: null, savedIds: new Set() }
const listeners = new Set<() => void>()

function setState(next: Partial<State>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useMissionStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

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
  toggleSaved(id: string) {
    const next = new Set(state.savedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setState({ savedIds: next })
  },
}
