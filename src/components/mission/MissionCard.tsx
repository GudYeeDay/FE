import { Pressable, Text, View } from 'react-native'

import {
  BookmarkFilledIcon,
  BookmarkIcon,
  MissionCircleIcon,
  MissionLineIcon,
  TitleBarIcon,
} from '@/components/icons'
import type { Mission } from '@/features/mission/types'
import { colors } from '@/theme'

export const MISSION_CARD_WIDTH = 192
export const MISSION_CARD_HEIGHT = 303

type Props = {
  mission: Mission
  saved: boolean
  onToggleSaved: () => void
  onStart: () => void
}

/** Figma: Frame 611 (미션 추천 카드). 양옆 작은 카드는 캐러셀에서 scale 로 줄여서 쓴다. */
export function MissionCard({ mission, saved, onToggleSaved, onStart }: Props) {
  return (
    <View
      className="rounded-2xl bg-white"
      style={{
        width: MISSION_CARD_WIDTH,
        height: MISSION_CARD_HEIGHT,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 10,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saved ? '저장 취소' : '미션 저장'}
        accessibilityState={{ selected: saved }}
        hitSlop={8}
        onPress={onToggleSaved}
        className="absolute right-[10px] top-3"
      >
        {saved ? (
          <BookmarkFilledIcon width={24} height={24} color={colors.main.DEFAULT} />
        ) : (
          <BookmarkIcon width={24} height={24} color={colors.ink.DEFAULT} />
        )}
      </Pressable>

      {/* 미션 일러스트 자리 (Figma: 원 + 가로선) */}
      <View className="mt-[38px] h-[74px] w-[74px] items-center justify-center self-center">
        <MissionCircleIcon width={74} height={74} style={{ position: 'absolute' }} />
        <MissionLineIcon width={42.5} height={2} />
      </View>

      <View className="mt-[26px] flex-row items-center gap-1 pl-[18px] pr-4">
        <TitleBarIcon width={2} height={14} />
        <Text className="flex-1 font-ko-medium text-ko-12 text-ink" numberOfLines={1}>
          {mission.title}
        </Text>
      </View>
      <Text
        className="mt-2 px-[19px] font-en text-[10px] leading-[17.6px] tracking-[-0.344px] text-ink-soft"
        numberOfLines={2}
      >
        {mission.description}
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        className="absolute bottom-[31px] left-[19px] right-[20px] h-9 items-center justify-center rounded-lg bg-main active:bg-brand-80"
      >
        <Text className="font-ko text-ko-12 text-white">시작하기</Text>
      </Pressable>
    </View>
  )
}
