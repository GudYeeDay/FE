import { useState } from 'react'
import { Pressable, useWindowDimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolation,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated'

import type { Mission } from '@/features/mission/types'
import { MISSION_CARD_HEIGHT, MISSION_CARD_WIDTH, MissionCard } from './MissionCard'

/** 카드 중심 사이 간격. 카드(192)보다 좁아서 양옆 카드가 가운데 카드 뒤로 겹친다 (Figma 기준 129) */
const ITEM_INTERVAL = 129
/** 양옆 카드: 160/192 크기, 9도 기울기, 22px 아래 (Figma 측정값) */
const SIDE_SCALE = 160 / 192
const SIDE_ROTATE_DEG = 9
const SIDE_OFFSET_Y = 22
/** 양옆 카드가 기울고 내려가도 잘리지 않을 만큼만 여유 */
const CAROUSEL_HEIGHT = MISSION_CARD_HEIGHT + 27
const CARD_TOP = 8
/** 한 칸 넘어가는 시간 */
const SNAP_DURATION_MS = 280
/** 손을 뗀 속도를 몇 초만큼 더 미끄러진 것으로 칠지. 빠르게 튕기면 짧게 끌어도 넘어간다 */
const FLING_PROJECTION_S = 0.15

type Props = {
  missions: Mission[]
  savedIds: ReadonlySet<string>
  onToggleSaved: (mission: Mission) => void
  onStart: (mission: Mission) => void
  /** 처음 가운데에 올 카드 (펼침 화면에서 탭한 카드) */
  initialIndex?: number
}

/** 0 ~ n 사이로 접는다 (음수도 양수로) */
function wrap(value: number, n: number) {
  'worklet'
  return ((value % n) + n) % n
}

/** 가운데로부터 몇 칸 떨어졌는지. 끝없이 돌도록 -n/2 ~ n/2 로 접는다 (세 장이면 -1.5 ~ 1.5) */
function relativePosition(index: number, progress: number, n: number) {
  'worklet'
  return wrap(index - progress + n / 2, n) - n / 2
}

/**
 * 미션 카드를 좌우로 넘기는 캐러셀. 가운데 카드가 크고 양옆은 작게 기울어진다. 끝없이 돈다.
 *
 * 카드는 순서를 바꾸지 않고 제자리에 둔 채, 지금 몇 번째 카드를 보고 있는지(`progress`, 소수)만
 * 손가락으로 움직인다. 각 카드의 위치·크기·기울기는 `progress` 로부터 애니메이션 스레드에서
 * 계산하고, 위치를 카드 수로 접어서(mod) 맨 끝 다음이 다시 처음이 되게 한다.
 * 넘길 때 React 상태를 바꾸지 않으므로 끝에서 처음으로 돌아갈 때 화면이 튀지 않는다.
 */
export function MissionCarousel({
  missions,
  savedIds,
  onToggleSaved,
  onStart,
  initialIndex = 0,
}: Props) {
  const { width } = useWindowDimensions()
  const reduceMotion = useReducedMotion()
  const count = missions.length

  const progress = useSharedValue(initialIndex)
  const dragStart = useSharedValue(0)
  // 가운데 카드만 버튼(시작하기·북마크)을 누를 수 있고, 옆 카드는 카드 전체가 "고르기"다
  const [activeIndex, setActiveIndex] = useState(initialIndex)

  useAnimatedReaction(
    () => wrap(Math.round(progress.get()), count),
    (current, previous) => {
      if (current !== previous) runOnJS(setActiveIndex)(current)
    },
  )

  const snapTo = (target: number) => {
    'worklet'
    progress.set(
      withTiming(
        target,
        { duration: reduceMotion ? 0 : SNAP_DURATION_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          // 보이는 모습은 같고 숫자만 0 ~ n 안으로 되돌린다 (계속 돌려도 값이 커지지 않게)
          if (finished) progress.set(wrap(target, count))
        },
      ),
    )
  }

  const pan = Gesture.Pan()
    // 가로로 조금 움직인 뒤에야 넘기기로 판단해서, 카드 안 버튼 탭은 그대로 눌린다
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onStart(() => {
      cancelAnimation(progress)
      dragStart.set(progress.get())
    })
    .onUpdate((e) => {
      progress.set(dragStart.get() - e.translationX / ITEM_INTERVAL)
    })
    .onEnd((e) => {
      const projected = progress.get() - (e.velocityX * FLING_PROJECTION_S) / ITEM_INTERVAL
      // 한 번에 한 장만 넘긴다
      const base = Math.round(dragStart.get())
      snapTo(Math.min(base + 1, Math.max(base - 1, Math.round(projected))))
    })

  /** 옆 카드를 누르면 그 카드를 가운데로 넘긴다 */
  const selectCard = (index: number) => {
    const offset = Math.round(relativePosition(index, activeIndex, count))
    snapTo(Math.round(progress.get()) + offset)
  }

  const cardLeft = (width - MISSION_CARD_WIDTH) / 2

  return (
    <GestureDetector gesture={pan}>
      <View style={{ height: CAROUSEL_HEIGHT, width: '100%' }}>
        {missions.map((mission, index) => (
          <CarouselItem
            key={mission.id}
            index={index}
            count={count}
            progress={progress}
            left={cardLeft}
          >
            <MissionCard
              mission={mission}
              saved={savedIds.has(mission.id)}
              onToggleSaved={() => onToggleSaved(mission)}
              onStart={() => onStart(mission)}
              variant={index}
            />
            {index !== activeIndex && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${mission.title} 미션 고르기`}
                onPress={() => selectCard(index)}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
              />
            )}
          </CarouselItem>
        ))}
      </View>
    </GestureDetector>
  )
}

function CarouselItem({
  index,
  count,
  progress,
  left,
  children,
}: {
  index: number
  count: number
  progress: SharedValue<number>
  left: number
  children: React.ReactNode
}) {
  const style = useAnimatedStyle(() => {
    // 왼쪽 -1, 가운데 0, 오른쪽 +1. 맨 끝을 넘어가면 반대편으로 돌아온다
    const position = relativePosition(index, progress.get(), count)
    const distance = Math.abs(position)

    return {
      zIndex: Math.round(100 - distance * 10),
      // 반대편으로 건너가는 지점(±1.5)에서는 보이지 않게 해서, 뒤로 돌아 나오는 것처럼 보이게 한다
      opacity: interpolate(distance, [1, count / 2], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: position * ITEM_INTERVAL },
        { translateY: interpolate(distance, [0, 1], [0, SIDE_OFFSET_Y], Extrapolation.CLAMP) },
        { scale: interpolate(distance, [0, 1], [1, SIDE_SCALE], Extrapolation.CLAMP) },
        {
          rotate: `${interpolate(position, [-1, 0, 1], [-SIDE_ROTATE_DEG, 0, SIDE_ROTATE_DEG], Extrapolation.CLAMP)}deg`,
        },
      ],
    }
  })

  return (
    <Animated.View
      style={[{ position: 'absolute', top: CARD_TOP, left, width: MISSION_CARD_WIDTH }, style]}
    >
      {children}
    </Animated.View>
  )
}
