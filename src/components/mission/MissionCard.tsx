import { Pressable, Text, View } from 'react-native'

import { BookmarkFilledIcon, BookmarkIcon } from '@/components/icons'
import type { Mission } from '@/features/mission/types'
import { colors } from '@/theme'
import { MissionCardBackground } from './MissionCardBackground'

export const MISSION_CARD_WIDTH = 192
export const MISSION_CARD_HEIGHT = 298

type Props = {
  mission: Mission
  saved: boolean
  onToggleSaved: () => void
  onStart: () => void
  /** 배경 장식 배치 (Figma 1-L / 2-L / 3-L). 캐러셀에서 순서대로 돌려 쓴다. */
  variant?: number
}

/**
 * Figma: Card-L (미션 추천 카드).
 * Card-S 는 같은 카드를 160/192 로 줄인 것이라 캐러셀에서 scale 로 처리한다.
 */
export function MissionCard({ mission, saved, onToggleSaved, onStart, variant = 0 }: Props) {
  return (
    <View
      style={{
        width: MISSION_CARD_WIDTH,
        height: MISSION_CARD_HEIGHT,
        borderRadius: 16,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 10,
      }}
    >
      {/* 그림자가 잘리지 않도록 바깥은 그림자, 안쪽은 둥근 모서리로 잘라서 배경 장식을 담는다 */}
      <View className="flex-1 overflow-hidden rounded-2xl">
        <MissionCardBackground variant={variant} />

        <Text
          className="absolute left-[19px] top-6 w-[125px] font-ko-bold text-[14px] leading-[24px] tracking-[-0.344px] text-ink"
          numberOfLines={3}
          lineBreakStrategyIOS="hangul-word"
        >
          {mission.title}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? '저장 취소' : '미션 저장'}
          accessibilityState={{ selected: saved }}
          hitSlop={8}
          onPress={onToggleSaved}
          className="absolute right-4 top-6"
        >
          {saved ? (
            <BookmarkFilledIcon width={24} height={24} color={colors.ink.DEFAULT} />
          ) : (
            <BookmarkIcon width={24} height={24} color={colors.ink.DEFAULT} />
          )}
        </Pressable>

        <Text
          className="absolute left-[19px] top-[144px] w-[158px] font-en text-[10px] leading-[17.6px] tracking-[-0.344px] text-ink-soft"
          numberOfLines={3}
        >
          {mission.description}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={onStart}
          className="absolute left-[19px] top-[233px] h-9 w-[153px] items-center justify-center rounded-lg bg-main active:bg-brand-80"
        >
          <Text className="font-ko text-ko-12 text-white">시작하기</Text>
        </Pressable>
      </View>
    </View>
  )
}
