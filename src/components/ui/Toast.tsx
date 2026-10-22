import { useEffect, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DEFAULT_DURATION_MS = 3000

type Props = {
  /** 바뀔 때마다 다시 띄우기 위한 키. null 이면 숨김 */
  toastKey: number | null
  message: string
  icon?: ReactNode
  onHide: () => void
  durationMs?: number
}

/**
 * Figma: "보관함에 저장되었어요!" 팝업. 화면 아래쪽에 잠깐(3초) 떴다가 사라진다.
 * 흰 배경, 둥근 모서리 16, 아이콘 + ko 14 medium.
 */
export function Toast({
  toastKey,
  message,
  icon,
  onHide,
  durationMs = DEFAULT_DURATION_MS,
}: Props) {
  const { bottom } = useSafeAreaInsets()

  useEffect(() => {
    if (toastKey === null) return
    const timer = setTimeout(onHide, durationMs)
    return () => clearTimeout(timer)
  }, [toastKey, durationMs, onHide])

  if (toastKey === null) return null

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 items-center"
      style={{ bottom: Math.max(bottom, 20) + 34 }}
    >
      <Animated.View
        key={toastKey}
        entering={FadeInDown.duration(200)}
        exiting={FadeOutDown.duration(200)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className="flex-row items-center gap-[9px] rounded-2xl bg-white px-4 py-2"
      >
        {icon}
        <Text className="font-ko-medium text-ko-14 text-ink">{message}</Text>
      </Animated.View>
    </View>
  )
}
