import { Pressable, Text, View } from 'react-native'

import { ChevronRightIcon, MissionBadgeIcon } from '@/components/icons'
import type { Mission } from '@/features/mission/types'
import { colors } from '@/theme'

/** Figma: 홈 하단에 떠 있는 "진행중인 굳이" 배너. 진행 중인 미션이 있을 때만 보인다. */
export function ActiveMissionBanner({
  mission,
  onPress,
}: {
  mission: Mission
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`진행중인 굳이, ${mission.title}`}
      onPress={onPress}
      className="w-[315px] max-w-full flex-row items-center gap-[18px] rounded-lg bg-white px-4 py-2 active:opacity-90"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
      }}
    >
      <MissionBadgeIcon width={26} height={26} />
      <View className="flex-1">
        <Text className="font-ko text-[10px] leading-[17.6px] tracking-[-0.344px] text-ink">
          진행중인 굳이
        </Text>
        <Text className="font-ko-medium text-ko-14 text-ink" numberOfLines={1}>
          {mission.title}
        </Text>
      </View>
      <ChevronRightIcon width={24} height={24} color={colors.ink.DEFAULT} />
    </Pressable>
  )
}
