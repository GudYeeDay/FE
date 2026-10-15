import { useEffect, useRef } from 'react'
import { useWindowDimensions, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
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

type Props = {
  missions: Mission[]
  savedIds: ReadonlySet<string>
  onToggleSaved: (mission: Mission) => void
  onStart: (mission: Mission) => void
}

/** 미션 카드를 좌우로 넘기는 캐러셀. 가운데 카드가 크고 양옆은 작게 기울어진다. */
export function MissionCarousel({ missions, savedIds, onToggleSaved, onStart }: Props) {
  const { width } = useWindowDimensions()
  const scrollX = useSharedValue(0)
  const listRef = useRef<Animated.ScrollView>(null)

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x
  })

  // 새 추천 목록을 받으면 첫 카드로 돌아간다
  useEffect(() => {
    listRef.current?.scrollTo({ x: 0, animated: false })
  }, [missions])

  const sidePadding = (width - ITEM_INTERVAL) / 2

  return (
    <Animated.ScrollView
      ref={listRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_INTERVAL}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ height: CAROUSEL_HEIGHT, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: sidePadding, alignItems: 'flex-start' }}
    >
      {missions.map((mission, index) => (
        <CarouselItem key={mission.id} index={index} scrollX={scrollX}>
          <MissionCard
            mission={mission}
            saved={savedIds.has(mission.id)}
            onToggleSaved={() => onToggleSaved(mission)}
            onStart={() => onStart(mission)}
          />
        </CarouselItem>
      ))}
    </Animated.ScrollView>
  )
}

function CarouselItem({
  index,
  scrollX,
  children,
}: {
  index: number
  scrollX: SharedValue<number>
  children: React.ReactNode
}) {
  const style = useAnimatedStyle(() => {
    // 가운데로부터 몇 칸 떨어졌는지: 왼쪽 -1, 가운데 0, 오른쪽 +1
    const position = index - scrollX.value / ITEM_INTERVAL
    const distance = Math.abs(position)

    return {
      zIndex: Math.round(100 - distance * 10),
      opacity: interpolate(distance, [1, 2], [1, 0], Extrapolation.CLAMP),
      transform: [
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
      style={[{ width: ITEM_INTERVAL, height: CAROUSEL_HEIGHT, alignItems: 'center' }, style]}
    >
      <View style={{ width: MISSION_CARD_WIDTH, marginTop: 8 }}>{children}</View>
    </Animated.View>
  )
}
