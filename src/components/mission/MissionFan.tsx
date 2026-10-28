import { useEffect } from 'react'
import { Pressable, View, useWindowDimensions } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import type { Mission } from '@/features/mission/types'
import { MISSION_CARD_HEIGHT, MISSION_CARD_WIDTH, MissionCard } from './MissionCard'

/** Figma Card-S: Card-L 을 160/192 로 줄인 크기 */
const FAN_SCALE = 160 / 192
/** 부채꼴 배치 (Figma 미션 추천 첫 화면): 가운데에서 ±129, 양옆 ±8도 */
const FAN_OFFSET_X = 129
const FAN_ROTATE_DEG = 8
/**
 * 양옆 카드를 내리는 거리. 기울이면 안쪽 윗모서리가 위로 올라가 가운데 카드가 내려앉아
 * 보였다. 안쪽 모서리가 가운데 카드 윗변과 비슷한 높이가 되도록 내려, 가운데 카드가 가장
 * 위에 오게 한다 (시안 기준 바깥 아랫모서리는 가운데보다 약 25pt 아래).
 */
const FAN_SIDE_OFFSET_Y = 13
/** 한 장씩 들어오는 간격과 시간 */
const DEAL_STAGGER_MS = 160
const DEAL_DURATION_MS = 420

type Props = {
  missions: Mission[]
  savedIds: ReadonlySet<string>
  onSelect: (index: number) => void
}

/**
 * Figma 주석: "왼 → 오, 카드 펼쳐지는 인터렉션 (타로카드 펼치듯이)"
 * 카드가 왼쪽 밖에서 한 장씩 날아와 부채꼴로 놓인다. 카드를 누르면 그 카드를 고른 것으로 본다.
 */
export function MissionFan({ missions, savedIds, onSelect }: Props) {
  return (
    <View
      style={{ height: MISSION_CARD_HEIGHT * FAN_SCALE + 40, width: '100%' }}
      className="items-center justify-center"
    >
      {missions.map((mission, index) => (
        <FanCard
          key={mission.id}
          index={index}
          count={missions.length}
          onPress={() => onSelect(index)}
          accessibilityLabel={`${mission.title} 미션 고르기`}
        >
          <MissionCard
            mission={mission}
            saved={savedIds.has(mission.id)}
            variant={index}
            // 펼침 상태에서는 카드 전체가 "고르기" 버튼이라 안쪽 버튼은 동작하지 않는다
            onToggleSaved={() => {}}
            onStart={() => {}}
          />
        </FanCard>
      ))}
    </View>
  )
}

function FanCard({
  index,
  count,
  onPress,
  accessibilityLabel,
  children,
}: {
  index: number
  count: number
  onPress: () => void
  accessibilityLabel: string
  children: React.ReactNode
}) {
  const { width } = useWindowDimensions()
  const reduceMotion = useReducedMotion()
  const position = index - (count - 1) / 2 // -1, 0, 1
  const targetX = position * FAN_OFFSET_X
  const targetY = Math.abs(position) * FAN_SIDE_OFFSET_Y
  const targetRotate = position * FAN_ROTATE_DEG

  // 0 → 1 로 진행하면서 왼쪽 화면 밖에서 제자리로 온다
  const progress = useSharedValue(reduceMotion ? 1 : 0)

  useEffect(() => {
    if (reduceMotion) return
    progress.value = withDelay(
      index * DEAL_STAGGER_MS,
      withTiming(1, { duration: DEAL_DURATION_MS, easing: Easing.out(Easing.cubic) }),
    )
  }, [index, progress, reduceMotion])

  const startX = -width
  const style = useAnimatedStyle(() => {
    const p = progress.value
    return {
      opacity: p === 0 ? 0 : 1,
      transform: [
        { translateX: startX + (targetX - startX) * p },
        { translateY: targetY * p },
        { rotate: `${-20 + (targetRotate + 20) * p}deg` },
        { scale: FAN_SCALE },
      ],
    }
  })

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: MISSION_CARD_WIDTH,
          height: MISSION_CARD_HEIGHT,
          zIndex: index, // 오른쪽 카드가 위로 겹친다
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        className="flex-1 active:opacity-90"
      >
        <View pointerEvents="none" className="flex-1">
          {children}
        </View>
      </Pressable>
    </Animated.View>
  )
}
