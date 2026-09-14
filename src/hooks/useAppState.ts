import { useEffect } from 'react'
import { AppState, Platform, type AppStateStatus } from 'react-native'
import { focusManager } from '@tanstack/react-query'

/**
 * 앱이 백그라운드 → 포그라운드로 돌아올 때 TanStack Query의 focus 이벤트를 발생시킨다.
 * (웹의 window focus 에 해당. refetchOnWindowFocus 가 네이티브에서도 동작하게 함)
 */
export function useAppStateFocus() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') focusManager.setFocused(status === 'active')
    }
    const sub = AppState.addEventListener('change', onChange)
    return () => sub.remove()
  }, [])
}
